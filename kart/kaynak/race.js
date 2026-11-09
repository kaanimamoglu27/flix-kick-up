// ===== Flix Kart race core: track, arcade kart physics, bot AI =====
// Driving feel (control smoothing, boost, drift, camera sway) follows pmndrs/racing-game
// (MIT, Copyright 2021 pmndrs) Vehicle.tsx; physics is a lighter arcade model so 6 karts run smoothly on phones.

export const KCFG = { accel: 22, drag: 0.42, brake: 40, maxSpeed: 36, turn: 2.15, grip: 7.5, driftGrip: 1.6, boostMul: 1.38, radius: 1.55, halfW: 1.2 };

export function buildTrack(def) {
  const pts = def.pts.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
  const N = Math.round(curve.getLength() / 1.2);
  const P = [], Tn = [], Nm = [];
  for (let i = 0; i < N; i++) { const u = i / N; const p = curve.getPointAt(u), t = curve.getTangentAt(u); P.push(p); Tn.push(t); Nm.push(new THREE.Vector3(t.z, 0, -t.x)); }
  const K = P.map((_, i) => { const a = Tn[i], b = Tn[(i + 10) % N]; return Math.acos(Math.max(-1, Math.min(1, a.dot(b)))); });
  return { def, curve, N, P, Tn, Nm, K, W: def.width, len: curve.getLength() };
}

export function nearest(tr, x, z, hint) {
  let best = -1, bd = 1e9; const N = tr.N;
  const scan = (from, to) => { for (let k = from; k <= to; k++) { const i = ((k % N) + N) % N; const p = tr.P[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } } };
  if (hint >= 0) scan(hint - 20, hint + 30); if (hint < 0 || bd > tr.W * tr.W) scan(0, N - 1);
  return best;
}

export function makeKart(pos, yaw, idx) {
  return { x: pos.x, z: pos.z, h: yaw, s: 0, vl: 0, steer: 0, eng: 0, y: 0, vy: 0, roll: 0, pitch: 0, idx, lap: 0, prog: 0, half: false, done: false,
    boost: 0, boosting: false, drift: false, driftT: 0, driftDir: 0, padT: 0, hitT: 0, wallHit: 0, speedMul: 1, finishT: 0, skill: 1, laneOff: 0 };
}
// heading h: forward = (-sin h, 0, -cos h)  (yaw 0 faces -z, like the 3D model)
export const fwdX = (k) => -Math.sin(k.h), fwdZ = (k) => -Math.cos(k.h);

// ctl: {steer:-1..1 (+ = left), gas:0..1, brake:bool, boost:bool}
export function drive(k, ctl, dt) {
  const C = KCFG;
  const boosting = ctl.boost && k.boost > 0; k.boosting = boosting; if (boosting) k.boost = Math.max(0, k.boost - 40 * dt);
  if (k.padT > 0) k.padT -= dt;
  const turbo = boosting || k.padT > 0; k.turbo = turbo;
  const maxS = C.maxSpeed * (turbo ? C.boostMul : 1) * k.speedMul;
  // engine smoothing like racing-game: lerp(engine, target, delta * 20)
  const target = ctl.gas * C.accel * (turbo ? 1.7 : 1);
  k.eng += (target - k.eng) * Math.min(1, dt * 20);
  // like racing-game: applyEngineForce(speed < maxSpeed ? engine : 0)
  k.s += ((k.s < maxS ? k.eng : 0) - C.drag * k.s * 0.08) * dt;
  if (ctl.brake && !k.drift && k.s > 0) k.s = Math.max(0, k.s - C.brake * 0.35 * dt);
  if (k.s > maxS) k.s += (maxS - k.s) * Math.min(1, dt * 2.5);
  if (k.s < 0) k.s *= Math.exp(-3 * dt);
  // drift = brake + steer at speed: tighter turn, slide, mini turbo on release
  const wantDrift = ctl.brake && Math.abs(ctl.steer) > 0.3 && k.s > 14;
  if (wantDrift && !k.drift) { k.drift = true; k.driftDir = Math.sign(ctl.steer); k.driftT = 0; }
  if (k.drift && (!ctl.brake || k.s < 10)) { if (k.driftT > 0.7) { k.padT = Math.min(1.3, 0.4 + k.driftT * 0.45); k.miniTurbo = 1; } k.drift = false; }
  if (k.drift) { k.driftT += dt; k.s -= 3 * dt; }
  // steering (lerp like racing-game)
  const st = k.drift ? Math.max(-1, Math.min(1, ctl.steer * 0.55 + k.driftDir * 0.7)) : ctl.steer;
  k.steer += (st - k.steer) * Math.min(1, dt * 14);
  const sf = Math.min(1, Math.abs(k.s) / 9) * (1 - Math.min(0.3, Math.abs(k.s) / 130));
  const yaw = k.steer * C.turn * sf * (k.drift ? 1.3 : 1) * Math.sign(k.s || 1);
  k.h += yaw * dt;
  // lateral slide (outward in turns, more while drifting)
  k.vl += (yaw * k.s * (k.drift ? 0.3 : 0.1)) * dt;
  k.vl *= Math.exp(-(k.drift ? C.driftGrip : C.grip) * dt);
  const fx = fwdX(k), fz = fwdZ(k), rx = -fz, rz = fx; // right vector
  k.x += (fx * k.s + rx * k.vl) * dt; k.z += (fz * k.s + rz * k.vl) * dt;
  // cosmetic body motion
  k.roll += ((-k.steer * k.s / 70) - k.roll) * Math.min(1, dt * 6);
  k.pitch += (((ctl.brake ? 0.04 : 0) - (k.eng / C.accel) * 0.03) - k.pitch) * Math.min(1, dt * 5);
  if (k.vy || k.y > 0) { k.vy -= 30 * dt; k.y += k.vy * dt; if (k.y <= 0) { k.y = 0; k.vy = k.vy < -4 ? -k.vy * 0.3 : 0; } }
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
    const into = (fwdX(k) * n.x + fwdZ(k) * n.z) * sg;
    if (into > 0.05) { k.s *= 1 - Math.min(0.5, into * 0.8); k.wallHit = into; }
    // turn the nose back along the track
    const t = tr.Tn[k.idx], th = Math.atan2(-t.x, -t.z); let dh = th - k.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    if (Math.abs(dh) < 1.5) k.h += dh * 0.15;
    k.vl *= 0.3;
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
      if (afw > 0.5 && a.s > b.s) { const dv = (a.s - b.s) * 0.5; a.s -= dv; b.s += dv * 0.6; }
      else if (afw < -0.5 && b.s > a.s) { const dv = (b.s - a.s) * 0.5; b.s -= dv; a.s += dv * 0.6; }
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
