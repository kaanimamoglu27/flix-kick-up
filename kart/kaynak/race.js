// ===== Flix Kart race core: track, arcade kart physics, bot AI =====
// v4 vehicle model: momentum-based velocity (heading turns, velocity follows by tyre grip), 4-wheel spring/damper
// suspension on an elevated, banked track, slope gravity, flight stabilisation and slippery tyres after landing,
// after SergeyMakeev/ArcadeCarPhysics (MIT, Copyright 2018 Sergey Makeev) ArcadeCar.cs. Control smoothing, boost
// and camera sway follow pmndrs/racing-game (MIT, Copyright 2021 pmndrs) Vehicle.tsx.

export const KCFG = { accel: 22, drag: 0.42, brake: 40, maxSpeed: 36, turn: 2.15, grip: 7.5, driftGrip: 1.6, boostMul: 1.38, radius: 1.55, halfW: 1.2 };

export function buildTrack(def) {
  const pts = def.pts.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  const N = Math.round(curve.getLength() / 1.2);
  const P = [], Tn = [], Nm = [];
  for (let i = 0; i < N; i++) { const u = i / N; const p = curve.getPointAt(u), t = curve.getTangentAt(u); P.push(p); Tn.push(t); Nm.push(new THREE.Vector3(t.z, 0, -t.x)); }
  const K = P.map((_, i) => { const a = Tn[i], b = Tn[(i + 10) % N]; return Math.acos(Math.max(-1, Math.min(1, a.dot(b)))); });
  // --- elevation: rolling hills + sharp crests on straights (airtime), flat start/finish ---
  let sd = 0; for (const c of def.id) sd = (sd * 31 + c.charCodeAt(0)) % 9973; const ph = (n) => ((sd * (n + 3) * 7919) % 1000) / 1000 * Math.PI * 2;
  const Y = new Array(N).fill(0);
  const fade = (u) => { const a = Math.min(1, Math.max(0, (u - 0.04) / 0.08)), b = Math.min(1, Math.max(0, (0.96 - u) / 0.08)); const f = Math.min(a, b); return f * f * (3 - 2 * f); };
  const amp = def.hills ?? 3.2;
  for (let i = 0; i < N; i++) { const u = i / N; Y[i] = (amp * Math.sin(u * Math.PI * 2 * 2 + ph(1)) + amp * 0.45 * Math.sin(u * Math.PI * 2 * 5 + ph(2))) * fade(u); }
  // crests on the two straightest stretches away from the start
  const humps = [];
  for (const [a, b] of [[0.14, 0.3], [0.68, 0.84]]) { let best = -1, bk = 9; for (let i = Math.round(a * N); i < Math.round(b * N); i++) { const kk = K[i] + K[(i + 12) % N] + K[(i - 12 + N) % N]; if (kk < bk) { bk = kk; best = i; } } if (best >= 0) humps.push(best); }
  for (const c of humps) for (let d = -14; d <= 14; d++) { const i = (c + d + N) % N; Y[i] += 2.2 * Math.exp(-(d * d) / (2 * 4.2 * 4.2)); }
  const mn = Math.min(...Y); for (let i = 0; i < N; i++) Y[i] -= mn;
  // smooth
  for (let pass = 0; pass < 2; pass++) { const c = Y.slice(); for (let i = 0; i < N; i++) Y[i] = (c[(i - 1 + N) % N] + 2 * c[i] + c[(i + 1) % N]) / 4; }
  const S = Y.map((_, i) => (Y[(i + 1) % N] - Y[(i - 1 + N) % N]) / 2.4);
  // banking: corners lean inwards (signed turn rate), smoothed
  let B = Tn.map((a, i) => { const b = Tn[(i + 8) % N]; const turn = a.x * b.z - a.z * b.x; return Math.max(-0.11, Math.min(0.11, turn * 0.55)); });
  for (let pass = 0; pass < 6; pass++) { const c = B.slice(); for (let i = 0; i < N; i++) B[i] = (c[(i - 3 + N) % N] + c[(i - 1 + N) % N] + c[i] + c[(i + 1) % N] + c[(i + 3) % N]) / 5; }
  B = B.map((b, i) => b * fade(i / N));
  return { def, curve, N, P, Tn, Nm, K, Y, S, B, humps, ramps: [], W: def.width, len: curve.getLength() };
}
// road surface height at world (x,z) near track index i (plane of that sample: slope along, bank across) + ramps
export function groundAt(tr, i, x, z) {
  const P = tr.P[i], T = tr.Tn[i], n = tr.Nm[i], dx = x - P.x, dz = z - P.z, al = dx * T.x + dz * T.z, lat = dx * n.x + dz * n.z;
  let y = tr.Y[i] + tr.S[i] * al + tr.B[i] * lat;
  for (const r of tr.ramps) { const rx = x - r.x, rz = z - r.z, a = -(rx * r.tx + rz * r.tz) * -1, l = rx * r.nx + rz * r.nz; // a: along travel
    if (Math.abs(l) < r.w / 2 && a > -r.L / 2 && a < r.L / 2) y = Math.max(y, r.y0 + r.H * (a + r.L / 2) / r.L); }
  return y;
}
export function nearest(tr, x, z, hint) {
  let best = -1, bd = 1e9; const N = tr.N;
  const scan = (from, to) => { for (let k = from; k <= to; k++) { const i = ((k % N) + N) % N; const p = tr.P[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } } };
  if (hint >= 0) scan(hint - 20, hint + 30); if (hint < 0 || bd > tr.W * tr.W) scan(0, N - 1);
  return best;
}

export function makeKart(pos, yaw, idx) {
  return { x: pos.x, z: pos.z, h: yaw, s: 0, vl: 0, steer: 0, eng: 0, y: 0, vy: 0, roll: 0, pitch: 0, idx, lap: 0, prog: 0, half: false, done: false,
    boost: 0, boosting: false, drift: false, driftT: 0, driftLvl: 0, lvlUp: 0, hop: 0, driftDir: 0, padT: 0, hitT: 0, wallHit: 0, speedMul: 1, finishT: 0, gN: 4, w: 0, pv: 0, rv: 0, slipT: 0, airT: 0, gy: 0, skill: 1, laneOff: 0, accMul: 1, turnMul: 1, spinT: 0, spinA: 0, shieldT: 0, starT: 0, item: null, itemN: 0, sup: 0, air: 0 };
}
// heading h: forward = (-sin h, 0, -cos h)  (yaw 0 faces -z, like the 3D model)
export const fwdX = (k) => -Math.sin(k.h), fwdZ = (k) => -Math.cos(k.h);

// suspension constants (units: world units, s; gravity 30)
export const SUSP = { g: 30, c0: 0.35, travel: 1.1, k: 30 / 0.35, d: 11, wf: 1.45, wr: 1.4 };
const WHEELS = [[1.45, -1.45], [1.45, 1.45], [-1.4, -1.5], [-1.4, 1.5]]; // [forward, right]
// ctl: {steer:-1..1 (+ = left), gas:0..1, brake:bool, boost:bool}
export function drive(k, ctl, dt, tr) {
  const C = KCFG, G = SUSP.g;
  if (k.shieldT > 0) k.shieldT -= dt; if (k.starT > 0) k.starT -= dt;
  if (k.spinT > 0) { k.spinT -= dt; k.spinA += dt * 13; ctl = { steer: 0, gas: 0, brake: false, boost: false }; k.s *= Math.exp(-2.4 * dt); k.drift = false; } else if (k.spinA) { k.spinA = 0; }
  const onG = k.gN > 0, full = k.gN >= 3;
  const boosting = ctl.boost && k.boost > 0; k.boosting = boosting; if (boosting) k.boost = Math.max(0, k.boost - 40 * dt);
  if (k.padT > 0) k.padT -= dt; else k.padLvl = 0;
  const turbo = boosting || k.padT > 0; k.turbo = turbo;
  const maxS = C.maxSpeed * (turbo ? C.boostMul : 1) * k.speedMul * (k.starT > 0 ? 1.15 : 1);
  // engine (smoothed like racing-game), only drives while wheels touch the road
  const target = ctl.gas * C.accel * (turbo ? 1.7 : 1) * (1.35 - 0.6 * Math.min(1, Math.max(0, k.s) / C.maxSpeed)) * k.accMul;
  k.eng += (target - k.eng) * Math.min(1, dt * 20);
  if (onG) {
    k.s += ((k.s < maxS ? k.eng : 0) - C.drag * k.s * 0.08) * dt;
    if (ctl.brake && !k.drift && k.s > 0) k.s = Math.max(0, k.s - C.brake * 0.35 * dt);
    if (k.s > maxS) k.s += (maxS - k.s) * Math.min(1, dt * 2.5);
    // slope gravity: you feel the hills
    if (tr) { const T = tr.Tn[k.idx], al = fwdX(k) * T.x + fwdZ(k) * T.z; k.s -= G * 0.55 * tr.S[k.idx] * al * dt; }
  } else k.s -= C.drag * k.s * 0.02 * dt;
  if (k.s < 0) k.s *= Math.exp(-3 * dt);
  // drift = brake + steer at speed: hop, loose rear, charged mini turbo on release
  const wantDrift = ctl.brake && Math.abs(ctl.steer) > 0.3 && k.s > 14 && onG;
  if (wantDrift && !k.drift) { k.drift = true; k.driftDir = Math.sign(ctl.steer); k.driftT = 0; k.driftLvl = 0; k.vy = Math.max(k.vy, 5.5); k.hop = 1; }
  if (k.drift && (!ctl.brake || k.s < 10)) { if (k.driftLvl > 0) { k.padT = [0, 0.7, 1.1, 1.6][k.driftLvl]; k.miniTurbo = k.driftLvl; k.padLvl = k.driftLvl; } k.drift = false; k.driftLvl = 0; }
  if (k.drift) { k.driftT += dt; k.s -= 1.6 * dt; const lv = k.driftT > 2.2 ? 3 : k.driftT > 1.3 ? 2 : k.driftT > 0.6 ? 1 : 0; if (lv > k.driftLvl) { k.driftLvl = lv; k.lvlUp = lv; } }
  // steering: smoothed input, yaw rate drops at speed; reduced air control
  const st = k.drift ? Math.max(-1, Math.min(1, ctl.steer * 0.6 + k.driftDir * 0.7)) : ctl.steer;
  k.steer += (st - k.steer) * Math.min(1, dt * 12);
  const sf = Math.min(1, Math.abs(k.s) / 8) * (1 - Math.min(0.32, Math.abs(k.s) / 120));
  const wTarget = k.steer * C.turn * k.turnMul * sf * (k.drift ? 1.32 : 1) * Math.sign(k.s || 1) * (onG ? 1 : 0.35);
  k.w = (k.w || 0) + (wTarget - (k.w || 0)) * Math.min(1, dt * (onG ? 10 : 3));
  const dh = k.w * dt; k.h += dh;
  // momentum: the velocity vector keeps its direction while the nose turns...
  const cs = Math.cos(dh), sn = Math.sin(dh), s0 = k.s, v0 = k.vl;
  k.s = s0 * cs - v0 * sn; k.vl = s0 * sn + v0 * cs;
  // ...and tyre grip pulls it back in line. Loose while drifting, slippery right after landing or braking hard.
  if (k.slipT > 0) k.slipT -= dt;
  let grip = k.drift ? 2.1 : 7.2; if (k.slipT > 0) grip *= 0.35 + 0.65 * (1 - k.slipT / 0.45); if (!onG) grip = 0.15; else if (!full) grip *= 0.6;
  if (k.heavy) grip *= 1.1;
  const before = Math.abs(k.vl); k.vl *= Math.exp(-grip * dt); k.s += (before - Math.abs(k.vl)) * (k.drift ? 0.55 : 0.3) * (k.s >= 0 ? 1 : -1);
  const fx = fwdX(k), fz = fwdZ(k), rx = -fz, rz = fx;
  k.x += (fx * k.s + rx * k.vl) * dt; k.z += (fz * k.s + rz * k.vl) * dt;
  // ---- suspension: 4 spring/damper wheels against the road surface ----
  if (tr) {
    const gy0 = groundAt(tr, k.idx, k.x, k.z); if (k.yb === undefined) k.yb = gy0 + 0; const c0 = SUSP.c0, TR = SUSP.travel;
    let Fy = 0, tp = 0, trl = 0, gN = 0; k.wc = k.wc || [c0, c0, c0, c0];
    for (let w = 0; w < 4; w++) { const [lf, lr] = WHEELS[w], wx = k.x + fx * lf + rx * lr, wz = k.z + fz * lf + rz * lr, gh = groundAt(tr, k.idx, wx, wz);
      const corner = k.yb + lf * Math.sin(k.pitch) + lr * Math.sin(k.roll), c = c0 - (corner - gh) / TR, cp = k.wc[w]; k.wc[w] = c;
      if (c > 0) { gN++; const F = Math.max(0, SUSP.k * c + SUSP.d * (c - cp) / dt); Fy += F; tp += F * lf; trl += F * lr;
        if (c > 1.25) { const lift = (c - 1.25) * TR; k.yb += lift; k.wc[w] = 1.25; if (k.vy < 0) k.vy *= 0.2; } } }
    k.vy += (Fy / 4 - G) * dt; k.yb += k.vy * dt;
    // body attitude: spring torque + damping, cosmetic weight transfer from throttle/brake/turning
    const aim = (gN ? 0 : 1);
    k.pv = (k.pv || 0) + (tp * 0.045 - k.pv * 7 + (gN ? (k.eng / C.accel) * 1.1 - (ctl.brake && !k.drift && k.s > 2 ? 1.6 : 0) : 0)) * dt;
    k.rv = (k.rv || 0) + (trl * 0.06 - k.rv * 8 + (gN ? -k.w * k.s * 0.04 : 0)) * dt;
    if (aim) { // flight stabilisation: keep the kart parallel to the road below (supertuxkart btKart idea)
      const T = tr.Tn[k.idx], al = fx * T.x + fz * T.z, wantP = Math.atan(tr.S[k.idx] * al) * 0.8, wantR = -Math.atan(tr.B[k.idx]) * al;
      k.pv += ((wantP - k.pitch) * 9 - k.pv * 3) * dt; k.rv += ((wantR - k.roll) * 9 - k.rv * 3) * dt; }
    k.pitch = Math.max(-0.7, Math.min(0.7, k.pitch + k.pv * dt)); k.roll = Math.max(-0.6, Math.min(0.6, k.roll + k.rv * dt));
    const wasAir = k.gN === 0; k.gN = gN; k.air = gN === 0;
    if (gN === 0) k.airT = (k.airT || 0) + dt; else { if (wasAir && k.airT > 0.12) { k.landed = Math.max(4, -k.vy + 6); k.slipT = 0.45; } k.airT = 0; }
    k.gy = gy0; k.y = k.yb - gy0 - 0; // height above the nominal ride height (0 = resting)
  }
  if (k.hitT > 0) k.hitT -= dt;
}

export function botControl(tr, k, t) {
  const N = tr.N, look = Math.round(5 + Math.max(0, k.s) * 0.28);
  const i = (k.idx + look) % N;
  const off = Math.sin(t * 0.37 + k.skill * 17) * tr.W * 0.16 + k.laneOff;
  const tx = tr.P[i].x + tr.Nm[i].x * off, tz = tr.P[i].z + tr.Nm[i].z * off;
  const dx = tx - k.x, dz = tz - k.z, fx = fwdX(k), fz = fwdZ(k);
  const ang = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz); // >0: target is to the right
  const steer = Math.max(-1, Math.min(1, -ang * 2.6));
  let curv = 0; for (let j = 4; j < 4 + Math.max(6, k.s * 0.9); j += 3) curv = Math.max(curv, tr.K[(k.idx + Math.round(j)) % N]);
  const want = KCFG.maxSpeed * k.speedMul * (1 - Math.min(0.22, curv * 0.28));
  return { steer, gas: k.s < want ? 1 : 0, brake: k.s > want + 5, boost: k.boost > 20 && curv < 0.3 };
}

// walls, progress, laps. returns true on lap complete
export function track(tr, k) {
  const prev = k.idx; k.idx = nearest(tr, k.x, k.z, k.idx);
  const P = tr.P[k.idx], n = tr.Nm[k.idx];
  const d = (k.x - P.x) * n.x + (k.z - P.z) * n.z, lim = tr.W / 2 - KCFG.halfW;
  k.wallHit = 0;
  if (Math.abs(d) > lim) {
    const push = Math.abs(d) - lim, sg = Math.sign(d);
    k.x -= n.x * sg * push; k.z -= n.z * sg * push;
    var into = (fwdX(k) * n.x + fwdZ(k) * n.z) * sg;
    if (into > 0.05 && k.y < 3) { k.s *= 1 - Math.min(0.35, into * 0.55); k.wallHit = into; }
    // turn the nose back along the track
    const t = tr.Tn[k.idx], th = Math.atan2(-t.x, -t.z); let dh = th - k.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    if (Math.abs(dh) < 1.5) k.h += dh * 0.15;
    k.vl = k.vl * 0.3 + sg * Math.max(0, into) * 5;
  }
  let lapped = false;
  if (prev >= 0) {
    if (k.idx > tr.N * 0.4 && k.idx < tr.N * 0.6) k.half = true;
    if (prev > tr.N * 0.85 && k.idx < tr.N * 0.15 && k.half) { k.lap++; k.half = false; lapped = true; }
  }
  k.prog = k.lap + (k.idx > tr.N * 0.85 && !k.half ? k.idx / tr.N - 1 : k.idx / tr.N);
  return lapped;
}

export function collide(ks) {
  const R = KCFG.radius * 2;
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
    const a = ks[i], b = ks[j], dx = b.x - a.x, dz = b.z - a.z, d2 = dx * dx + dz * dz;
    if (d2 < R * R && d2 > 1e-6) {
      const d = Math.sqrt(d2), o = (R - d) / 2, nx = dx / d, nz = dz / d;
      a.x -= nx * o; a.z -= nz * o; b.x += nx * o; b.z += nz * o;
      // rear-ender: the one behind loses a little, the one in front gets a nudge (only when closing in)
      const afw = fwdX(a) * nx + fwdZ(a) * nz; // >0: b is ahead of a
      if (afw > 0.5 && a.s > b.s) { const dv = (a.s - b.s) * 0.3; a.s -= dv; b.s += dv * 0.6; }
      else if (afw < -0.5 && b.s > a.s) { const dv = (b.s - a.s) * 0.3; b.s -= dv; a.s += dv * 0.6; }
      // side bump: push along each kart's right vector
      const ar = -fwdZ(a) * nx + fwdX(a) * nz, br = -fwdZ(b) * nx + fwdX(b) * nz;
      if (!a.hitT || a.hitT <= 0) { a.vl -= ar * 3; b.vl += br * 3; }
      a.hitT = b.hitT = 0.25;
    }
  }
}

export function gridPos(tr, slot) {
  const back = 7 + Math.floor(slot / 2) * 7, i = (tr.N - Math.round(back / 1.2)) % tr.N;
  const P = tr.P[i], t = tr.Tn[i], n = tr.Nm[i], side = (slot % 2 ? 1 : -1) * tr.W * 0.22;
  return { pos: P.clone().addScaledVector(n, side), yaw: Math.atan2(-t.x, -t.z), idx: i };
}
