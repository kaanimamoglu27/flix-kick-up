// ===== Flix Kart power-ups, driver supers, item boxes, ramps =====
// Position-aware weighted item roll follows fecolinhares/super-kart-3djs PowerUp.js (MIT): leaders get defensive
// items, the back of the pack gets comeback items. Items, supers and art are Flix's own.
const ITEMS = {
  turbo3: { ic: '🚀', tr: 'Üçlü Turbo', en: 'Triple Turbo' },
  fuze: { ic: '🪶', tr: 'Tüy Füzesi', en: 'Feather Missile' },
  top: { ic: '⚽', tr: 'FLIX Topu', en: 'FLIX Ball' },
  sakiz: { ic: '🍬', tr: 'Sakız', en: 'Bubble Gum' },
  kalkan: { ic: '🛡️', tr: 'Kalkan', en: 'Shield' },
  altin: { ic: '⭐', tr: 'Altın FLIX', en: 'Golden FLIX' },
  simsek: { ic: '⚡', tr: 'Şimşek', en: 'Lightning' },
};
const ROLL_FRONT = [['top', 30], ['sakiz', 30], ['kalkan', 22], ['fuze', 10], ['turbo3', 8]];
const ROLL_MID = [['turbo3', 22], ['fuze', 24], ['top', 18], ['sakiz', 16], ['kalkan', 12], ['altin', 5], ['simsek', 3]];
const ROLL_BACK = [['turbo3', 26], ['fuze', 22], ['altin', 18], ['simsek', 14], ['top', 8], ['kalkan', 8], ['sakiz', 4]];
const SUPERS = {
  flix: { ic: '🔥', tr: 'Taç Ateşi', en: 'Crown Fire' }, wu: { ic: '🥋', tr: 'Kung-Fu Dalgası', en: 'Kung-Fu Wave' },
  kick: { ic: '⚽', tr: 'Dev Şut', en: 'Giant Kick' }, flick: { ic: '💨', tr: 'Işınlanma', en: 'Teleport' },
  buzul: { ic: '❄️', tr: 'Buz Duvarı', en: 'Ice Wall' }, neon: { ic: '🌀', tr: 'Neon Fırtına', en: 'Neon Storm' },
  altin: { ic: '👑', tr: 'Altın Mod', en: 'Gold Mode' },
};
function rollItem(k) {
  const n = karts.length, pos = k.place || n, f = n > 1 ? (pos - 1) / (n - 1) : 0.5;
  const tab = f < 0.25 ? ROLL_FRONT : f > 0.7 ? ROLL_BACK : ROLL_MID;
  const tot = tab.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot;
  for (const [id, w] of tab) { r -= w; if (r <= 0) return id; } return tab[0][0];
}

// ---------- world objects: item boxes + ramps ----------
let boxes = [], ramps = [], projs = [], traps = [];
const boxTex = canvasTex(256, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#ffd41f'); g.addColorStop(1, '#ff8a1a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.fillStyle = '#e22511'; c.fillRect(0, 108, w, 40); c.fillRect(108, 0, 40, h); c.fillStyle = '#fff'; c.font = '900 150px Rubik, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 14; c.strokeStyle = '#022753'; c.strokeText('?', w / 2, h / 2 + 8); c.fillText('?', w / 2, h / 2 + 8); });
const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.35, emissive: 0x442200, transparent: true, opacity: 0.95 });
const boxGeo = new RoundedBoxGeometry(2.2, 2.2, 2.2, 3, 0.35);
function lowCurveIdx(tr, a, b) { let best = Math.round(a * tr.N), bk = 9; for (let i = Math.round(a * tr.N); i < Math.round(b * tr.N); i++) { const k = tr.K[i % tr.N] + tr.K[(i + 8) % tr.N]; if (k < bk) { bk = k; best = i % tr.N; } } return best; }
function buildItems(tr, g) {
  boxes = []; ramps = []; projs.forEach((p) => scene.remove(p.m)); traps.forEach((p) => scene.remove(p.m)); projs = []; traps = [];
  if (race && race.mode === 'time') return;
  for (const f of [0.06, 0.38, 0.7]) { const i = lowCurveIdx(tr, f, f + 0.1);
    for (const o of [-0.33, -0.11, 0.11, 0.33]) { const p = tr.P[i].clone().addScaledVector(tr.Nm[i], o * tr.W); const m = new THREE.Mesh(boxGeo, boxMat); m.position.set(p.x, 2, p.z); m.castShadow = true; g.add(m); boxes.push({ m, x: p.x, z: p.z, off: 0, ph: Math.random() * 6 }); } }
  // jump ramps on two straights
  const rampT = canvasTex(128, 256, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffd41f' : '#022753'; c.fillRect(0, i * 32, w, 32); } c.fillStyle = '#e22511'; c.beginPath(); c.moveTo(64, 20); c.lineTo(110, 90); c.lineTo(18, 90); c.fill(); });
  for (const [a, b] of [[0.22, 0.34], [0.52, 0.64]]) { const i = lowCurveIdx(tr, a, b), P = tr.P[i], t = tr.Tn[i];
    const geo = new THREE.BufferGeometry(), L = 5, Wd = tr.W * 0.55, H = 1.3;
    const v = [-Wd / 2, 0, L / 2, Wd / 2, 0, L / 2, -Wd / 2, H, -L / 2, Wd / 2, H, -L / 2, -Wd / 2, 0, -L / 2, Wd / 2, 0, -L / 2];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1], 2));
    geo.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 0, 2, 4, 1, 5, 3]); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, phys(0xffffff, { map: rampT, roughness: 0.5, side: THREE.DoubleSide })); m.position.set(P.x, 0.02, P.z); m.rotation.y = Math.atan2(-t.x, -t.z); m.castShadow = true; m.receiveShadow = true; g.add(m);
    ramps.push({ i, x: P.x, z: P.z, tx: t.x, tz: t.z, nx: tr.Nm[i].x, nz: tr.Nm[i].z, w: Wd }); }
}

// ---------- hits ----------
function hitKart(k, by, kind) {
  if (k.done || k.starT > 0 || k.spinT > 0) return false;
  if (k.shieldT > 0) { k.shieldT = 0; puff(k.x, 2, k.z, 'blue', 10, 6); if (k.me) AUD.play('uiClick', { volume: 0.6 }); return false; }
  k.spinT = kind === 'big' ? 1.4 : 1.05; k.s *= 0.45; k.drift = false; k.sup = Math.min(100, k.sup + 12); k.vy = Math.max(k.vy, kind === 'big' ? 9 : 5);
  puff(k.x, 1.5, k.z, 'spark', 10, 7);
  if (k.me) { shake = Math.max(shake, 0.45); AUD.play('crash', { volume: 0.7 }); big(T('AY!', 'OUCH!'), 'lap'); }
  else if (by && by.me) { AUD.play('posUp', { volume: 0.5 }); toastHit(k); }
  return true;
}
let hitToastT = 0; function toastHit(k) { if (hitToastT > 0) return; hitToastT = 1.2; toast(`💥 ${k.name}!`, 900); }

// ---------- projectiles (ride the track spline, so they never clip through walls) ----------
const PG = { fuze: new THREE.ConeGeometry(0.5, 2.2, 10), top: new THREE.SphereGeometry(1, 20, 14), dev: new THREE.SphereGeometry(3, 28, 18), ates: new THREE.SphereGeometry(0.9, 14, 10) };
const ballTex = canvasTex(256, 128, (c) => { ['#e22511', '#ffd41f', '#2a80dc', '#2fa043'].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * 64, 0, 64, 128); }); c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 64, 26, 0, 7); c.fill(); });
const PM = { fuze: new THREE.MeshStandardMaterial({ color: 0x2a80dc, emissive: 0x1144aa, roughness: 0.3 }), top: new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.3 }), ates: new THREE.MeshBasicMaterial({ color: 0xffa42a }) };
PM.dev = PM.top;
function lateral(tr, i, x, z) { const P = tr.P[i], n = tr.Nm[i]; return (x - P.x) * n.x + (z - P.z) * n.z; }
function fire(k, type, o = {}) {
  const tr = world.tr, i0 = (k.idx + (o.back ? -4 : 4) + tr.N) % tr.N;
  const m = new THREE.Mesh(PG[type], PM[type]); if (type === 'fuze') m.rotation.x = -Math.PI / 2; m.castShadow = true; scene.add(m);
  const p = { type, m, f: i0, off: o.off ?? lateral(tr, k.idx, k.x, k.z), v: o.v || (type === 'dev' ? 30 : type === 'top' ? 62 : 54) * (o.back ? -1 : 1), life: o.life || (type === 'dev' ? 9 : 5), owner: k, target: o.target || null, r: type === 'dev' ? 3.4 : 1.6, safe: 0.4, y: type === 'dev' ? 3 : 1.4 };
  projs.push(p); return p;
}
function aheadOf(k, maxD = 0.25) { let best = null, bd = 9; for (const o of karts) { if (o === k || o.done) continue; const d = o.prog - k.prog; if (d > 0 && d < maxD && d < bd) { bd = d; best = o; } } return best; }
function stepProjs(dt) {
  const tr = world.tr, N = tr.N;
  for (let n = projs.length - 1; n >= 0; n--) {
    const p = projs[n]; p.life -= dt; p.safe -= dt;
    p.f = (p.f + p.v * dt / 1.2 + N) % N; const i = Math.floor(p.f), j = (i + 1) % N, u = p.f - i;
    if (p.target && !p.target.done) { const want = lateral(tr, i, p.target.x, p.target.z); p.off += Math.max(-1, Math.min(1, want - p.off)) * dt * 14; }
    const lim = tr.W / 2 - 1; if (Math.abs(p.off) > lim) { p.off = Math.sign(p.off) * lim; }
    const P = tr.P[i].clone().lerp(tr.P[j], u), Nm = tr.Nm[i]; const x = P.x + Nm.x * p.off, z = P.z + Nm.z * p.off;
    p.m.position.set(x, p.y + (p.type === 'dev' ? 0 : Math.sin(p.life * 12) * 0.2), z);
    const t = tr.Tn[i]; if (p.type === 'fuze' || p.type === 'ates') { p.m.rotation.set(-Math.PI / 2, 0, -Math.atan2(t.x, -t.z) * (p.v > 0 ? 1 : -1)); if (Math.random() < 0.6) puff(x, p.y, z, p.type === 'ates' ? 'fire' : 'blue', 1, 0.6); }
    else p.m.rotation.x -= p.v * dt / 2;
    let gone = p.life <= 0;
    for (const k of karts) { if (gone) break; if (k === p.owner && p.safe > 0) continue; if ((k.x - x) ** 2 + (k.z - z) ** 2 < (p.r + 1.4) ** 2 && k.y < p.y + 2) { hitKart(k, p.owner, p.type === 'dev' ? 'big' : ''); if (p.type !== 'dev') gone = true; } }
    if (gone) { puff(x, p.y, z, p.type === 'fuze' ? 'blue' : 'spark', 8, 5); scene.remove(p.m); projs.splice(n, 1); }
  }
}
// ---------- traps ----------
const TG = { sakiz: new THREE.SphereGeometry(1.3, 16, 10), buz: new RoundedBoxGeometry(3, 2.4, 1.4, 2, 0.3) };
const TM = { sakiz: new THREE.MeshStandardMaterial({ color: 0xff6fb5, roughness: 0.25, emissive: 0x330011 }), buz: new THREE.MeshStandardMaterial({ color: 0xbfeaff, roughness: 0.1, transparent: true, opacity: 0.8, emissive: 0x113355 }) };
function drop(k, type, off = 0) {
  const fx = fwdX(k), fz = fwdZ(k), rx = -fz, rz = fx; const x = k.x - fx * 3.4 + rx * off, z = k.z - fz * 3.4 + rz * off;
  const m = new THREE.Mesh(TG[type], TM[type]); m.position.set(x, type === 'sakiz' ? 0.5 : 1.2, z); m.scale.y = type === 'sakiz' ? 0.45 : 1; m.rotation.y = k.h; m.castShadow = true; scene.add(m);
  traps.push({ type, m, x, z, life: type === 'buz' ? 14 : 30, owner: k, safe: 0.8 });
}
function stepTraps(dt) {
  for (let n = traps.length - 1; n >= 0; n--) { const p = traps[n]; p.life -= dt; p.safe -= dt; let gone = p.life <= 0;
    for (const k of karts) { if (gone) break; if (k === p.owner && p.safe > 0) continue; if ((k.x - p.x) ** 2 + (k.z - p.z) ** 2 < 5.5 && k.y < 1.5) { hitKart(k, p.owner); gone = true; } }
    if (gone) { puff(p.x, 1, p.z, p.type === 'buz' ? 'blue' : 'c0', 8, 4); scene.remove(p.m); traps.splice(n, 1); } }
}

// ---------- using items / supers ----------
function useItem(k) {
  if (!k.item || k.rollT > 0 || k.spinT > 0 || !race || race.phase !== 'go') return;
  const it = k.item;
  if (it === 'turbo3') { k.padT = 1.0; k.padLvl = 0; k.itemN = (k.itemN || 3) - 1; if (k.me) { AUD.play('boost', { volume: 0.6 }); shake = Math.max(shake, 0.12); } if (k.itemN > 0) return; }
  else if (it === 'fuze') { fire(k, 'fuze', { target: aheadOf(k, 0.3) }); if (k.me) AUD.play('useItem', { volume: 0.6 }); }
  else if (it === 'top') { fire(k, 'top'); if (k.me) AUD.play('shell', { volume: 0.6 }); }
  else if (it === 'sakiz') { drop(k, 'sakiz'); if (k.me) AUD.play('banana', { volume: 0.6 }); }
  else if (it === 'kalkan') { k.shieldT = 9; if (k.me) AUD.play('uiSelect', { volume: 0.6 }); }
  else if (it === 'altin') { k.starT = 6; k.padT = 0.6; if (k.me) { AUD.play('star', { volume: 0.7 }); big(T('ALTIN FLIX!', 'GOLDEN FLIX!'), 'win'); } }
  else if (it === 'simsek') { for (const o of karts) if (o !== k && o.prog > k.prog) hitKart(o, k); flash(); AUD.play('lightning', { volume: k.me ? 0.7 : 0.4 }); }
  k.item = null; k.itemN = 0;
}
function useSuper(k) {
  if (k.sup < 100 || k.spinT > 0 || !race || race.phase !== 'go' || k.done) return;
  k.sup = 0; const id = k.did, tr = world.tr;
  if (k.me) { big(T(SUPERS[id].tr, SUPERS[id].en).toUpperCase() + '!', 'win'); shake = Math.max(shake, 0.3); }
  AUD.play('star', { volume: k.me ? 0.75 : 0.35 });
  if (id === 'flix') { const tg = karts.filter((o) => o !== k && o.prog > k.prog && !o.done).sort((a, b) => a.prog - b.prog).slice(0, 3); for (let n = 0; n < 3; n++) fire(k, 'ates', { target: tg[n] || null, off: (n - 1) * 3, v: 58 }); }
  else if (id === 'wu') { for (const o of karts) if (o !== k && (o.x - k.x) ** 2 + (o.z - k.z) ** 2 < 18 * 18) hitKart(o, k, 'big'); k.padT = 1.0; ring(k, 0xffd41f); }
  else if (id === 'kick') { fire(k, 'dev', { off: 0 }); k.padT = 0.6; }
  else if (id === 'flick') { const jump = Math.round(48 / 1.2), j = (k.idx + jump) % tr.N, off = Math.max(-tr.W / 3, Math.min(tr.W / 3, lateral(tr, k.idx, k.x, k.z))); puff(k.x, 1.5, k.z, 'blue', 14, 6);
    k.x = tr.P[j].x + tr.Nm[j].x * off; k.z = tr.P[j].z + tr.Nm[j].z * off; k.h = Math.atan2(-tr.Tn[j].x, -tr.Tn[j].z); k.padT = 1.0; k.shieldT = Math.max(k.shieldT, 2); puff(k.x, 1.5, k.z, 'blue', 14, 6); if (k.me) camInit = false; }
  else if (id === 'buzul') { for (const o of [-0.3, 0, 0.3]) drop(k, 'buz', o * tr.W); k.shieldT = Math.max(k.shieldT, 5); }
  else if (id === 'neon') { for (const o of karts) if (o !== k && o.prog > k.prog) hitKart(o, k); flash(0xff2d9a); }
  else if (id === 'altin') { k.starT = 8; k.padT = 1.0; }
}
function flash(col = 0xffffff) { const f = $('#flash'); if (!f) return; f.style.background = '#' + new THREE.Color(col).getHexString(); f.style.opacity = 0.7; setTimeout(() => (f.style.opacity = 0), 90); }
const ringGeo = new THREE.RingGeometry(0.8, 1.2, 40);
function ring(k, col) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(k.x, 0.6, k.z); scene.add(m); parts.push({ m, vx: 0, vy: 0, vz: 0, life: 0.6, t: 0, g: 0, grow: 20 }); }

// ---------- per-frame ----------
const shieldGeo = new THREE.SphereGeometry(2.7, 20, 14), shieldMat = new THREE.MeshBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }), starMat = new THREE.MeshBasicMaterial({ color: 0xffd41f, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
function stepItems(dt) {
  const tr = world.tr; if (hitToastT > 0) hitToastT -= dt;
  for (const b of boxes) { if (b.off > 0) { b.off -= dt; b.m.visible = b.off <= 0; } b.m.rotation.y += dt * 1.6; b.m.rotation.x = Math.sin(race.t * 1.3 + b.ph) * 0.3; b.m.position.y = 2.1 + Math.sin(race.t * 2.5 + b.ph) * 0.25;
    if (b.off > 0) continue;
    for (const k of karts) if ((k.x - b.x) ** 2 + (k.z - b.z) ** 2 < 7.5) { b.off = 2.5; b.m.visible = false; puff(b.x, 2, b.z, 'c' + Math.floor(Math.random() * 4), 8, 6); k.sup = Math.min(100, k.sup + 8);
      if (!k.item) { k.item = rollItem(k); k.itemN = k.item === 'turbo3' ? 3 : 0; k.rollT = k.me ? 0.8 : 0.1; k.botHold = 0.5 + Math.random() * 2.5; if (k.me) AUD.play('itemPickup', { volume: 0.6 }); }
      break; } }
  for (const k of karts) {
    if (k.rollT > 0) k.rollT -= dt;
    if (race.phase === 'go' && !k.done) k.sup = Math.min(100, k.sup + dt * 2.2);
    // ramps
    for (const r of ramps) { const dx = k.x - r.x, dz = k.z - r.z, along = -(dx * r.tx + dz * r.tz), lat = dx * r.nx + dz * r.nz;
      if (Math.abs(along) < 2.6 && Math.abs(lat) < r.w / 2 && k.y < 0.4 && k.s > 10 && !(k.rampCd > 0)) { k.vy = 8 + k.s * 0.16; k.y = 0.5; k.air = 1; k.trick = 0; k.rampCd = 1; if (k.me) AUD.play('uiSelect', { volume: 0.3 }); if (!k.me && Math.random() < 0.6) k.trick = 1; } }
    if (k.rampCd > 0) k.rampCd -= dt;
    if (k.landed) { const v = k.landed; k.landed = 0; if (k.air) { k.air = 0; if (k.trick) { k.padT = Math.max(k.padT, 0.9); k.sup = Math.min(100, k.sup + 5); if (k.me) { big(T('HAVADA NUMARA!', 'TRICK!'), 'lap'); AUD.play('driftReleaseMiniBoost', { volume: 0.7 }); } } } if (k.me && v > 7) { AUD.play('landing', { volume: 0.5 }); shake = Math.max(shake, 0.15); } puff(k.x, 0.4, k.z, 'dust', 5, 3); }
    // golden FLIX: bump others away
    if (k.starT > 0) for (const o of karts) if (o !== k && (o.x - k.x) ** 2 + (o.z - k.z) ** 2 < 12) hitKart(o, k);
    // visuals
    const v = k.vis; if (!v.sh) { v.sh = new THREE.Mesh(shieldGeo, shieldMat); v.sh.position.y = 1.6; v.g.add(v.sh); v.st = new THREE.Mesh(shieldGeo, starMat); v.st.position.y = 1.6; v.g.add(v.st); }
    v.sh.visible = k.shieldT > 0 && (k.shieldT > 1.5 || Math.sin(race.t * 30) > 0); v.st.visible = k.starT > 0; if (v.st.visible) v.st.scale.setScalar(1 + Math.sin(race.t * 20) * 0.06);
    if (k.starT > 0 && Math.random() < 0.4) puff(k.x + (Math.random() - 0.5) * 3, 1 + Math.random() * 2, k.z + (Math.random() - 0.5) * 3, 'c1', 1, 1);
    if (!k.me && race.phase === 'go' && !k.done) botItems(k, dt);
  }
  stepProjs(dt); stepTraps(dt);
}
function botItems(k, dt) {
  if (k.item && !(k.rollT > 0)) { k.botHold -= dt; if (k.botHold <= 0) {
    const it = k.item, tgt = aheadOf(k, 0.12);
    if ((it === 'fuze' || it === 'top') && !tgt && k.botHold > -4) return;
    if (it === 'sakiz' && k.botHold > -3 && !karts.some((o) => o !== k && k.prog - o.prog > 0 && k.prog - o.prog < 0.05)) return;
    useItem(k); if (k.item === 'turbo3') k.botHold = 0.8; } }
  if (k.sup >= 100) { k.supHold = (k.supHold ?? Math.random() * 4) - dt; if (k.supHold <= 0) { k.supHold = null; useSuper(k); } }
}
function clearItems() { projs.forEach((p) => scene.remove(p.m)); traps.forEach((p) => scene.remove(p.m)); projs = []; traps = []; }
