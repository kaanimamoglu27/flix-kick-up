// ================= STREET: ground, buildings, street furniture =================
// The neighbourhood chunk runs left-right across the screen: front plaza (start), road, back pavement, shop row.
// z: front plaza 2..8, road -1.5..2, back pavement -5..-1.5, buildings -8..-5. x: -4..4.
function streetGround() {
  return [
    {x: 0, z: 5, w: 8, d: 6, top: 0.22, kind: 'walk'},
    {x: 0, z: 0.25, w: 8, d: 3.5, top: 0, kind: 'road'},
    {x: 0, z: -3.25, w: 8, d: 3.5, top: 0.22, kind: 'walk'},
    {x: 0, z: -6.5, w: 8, d: 3, top: 0.22, kind: 'under'},
  ];
}
const pick = (a) => a[Math.floor(srnd(0, a.length - 0.001))];
const paveTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#c9c1b3'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { x.fillStyle = `hsl(35,${8 + srnd(0, 8)}%,${70 + srnd(0, 9)}%)`; x.fillRect(c * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); } });
paveTex.wrapS = paveTex.wrapT = THREE.RepeatWrapping;
const roadTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#4a4d57'; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '255,255,255' : '0,0,0'},${srnd(0.03, 0.08)})`; x.fillRect(srnd(0, w), srnd(0, h), 2, 2); } });
roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
function facadeTex(w, h, o) {
  const S = 64;
  return ctex(Math.round(w * S), Math.round(h * S), (x, W, H) => {
    x.fillStyle = o.col; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(0,0,0,${srnd(0.01, 0.04)})`; x.fillRect(srnd(0, W), srnd(0, H), srnd(4, 20), srnd(2, 8)); }
    const G = 2.5 * S; // ground floor height in px
    // cornice + floor lines
    x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, 0, W, 10); x.fillRect(0, H - G - 8, W, 8);
    // upper windows
    const floors = Math.floor((h - 2.5) / 1.9), cols = Math.max(1, Math.round(w / 1.4));
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) * W / cols, cy = H - G - (f + 0.5) * 1.9 * S - 6, ww = 0.62 * S, wh = 1.0 * S;
      x.fillStyle = '#f7f2e6'; x.fillRect(cx - ww / 2 - 6, cy - wh / 2 - 6, ww + 12, wh + 14);
      const gr = x.createLinearGradient(0, cy - wh / 2, 0, cy + wh / 2); gr.addColorStop(0, '#9fd3e6'); gr.addColorStop(1, '#4f7d9c'); x.fillStyle = gr; x.fillRect(cx - ww / 2, cy - wh / 2, ww, wh);
      x.fillStyle = '#f7f2e6'; x.fillRect(cx - 2, cy - wh / 2, 4, wh); x.fillRect(cx - ww / 2, cy - 2, ww, 4);
      x.fillStyle = o.shut; x.fillRect(cx - ww / 2 - 22, cy - wh / 2 - 4, 14, wh + 8); x.fillRect(cx + ww / 2 + 8, cy - wh / 2 - 4, 14, wh + 8);
      if (srnd(0, 1) > 0.45) { x.fillStyle = '#b85c3c'; x.fillRect(cx - ww / 2 - 4, cy + wh / 2 + 6, ww + 8, 10); x.fillStyle = srnd(0, 1) > 0.5 ? '#e22511' : '#ff8fb8'; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(cx - ww / 2 + 6 + k * ww / 3.4, cy + wh / 2 + 4, 6, 0, 7); x.fill(); } }
    }
    // shop front
    const sy = H - G;
    x.fillStyle = o.sign; x.fillRect(0, sy + 4, W, 0.55 * S);
    x.fillStyle = '#fff'; x.font = `900 italic ${Math.round(0.4 * S)}px "Barlow Condensed", Impact, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.shop, W / 2, sy + 4 + 0.29 * S);
    const dw = 0.9 * S, dx = o.door === 'l' ? 0.25 * S : W - 0.25 * S - dw;
    const gl = x.createLinearGradient(0, sy + 0.7 * S, 0, H); gl.addColorStop(0, '#bfe6f2'); gl.addColorStop(1, '#5e8fae');
    x.fillStyle = '#3b2a20'; x.fillRect(0.12 * S, sy + 0.66 * S, W - 0.24 * S, H - sy - 0.66 * S);
    x.fillStyle = gl; x.fillRect(0.2 * S, sy + 0.74 * S, W - 0.4 * S, H - sy - 0.95 * S);
    x.fillStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(0.4 * S + k * 0.9 * S, H - 0.3 * S); x.lineTo(0.8 * S + k * 0.9 * S, sy + 0.8 * S); x.lineTo(0.95 * S + k * 0.9 * S, sy + 0.8 * S); x.lineTo(0.55 * S + k * 0.9 * S, H - 0.3 * S); x.fill(); }
    x.fillStyle = '#6b3f26'; x.fillRect(dx, sy + 0.8 * S, dw, H - sy - 0.8 * S); x.fillStyle = '#ffc20e'; x.fillRect(dx + dw - 16, sy + 1.45 * S, 7, 7);
    // goods in the window
    const g2 = o.goods || []; for (let k = 0; k < 6; k++) { x.fillStyle = g2[k % (g2.length || 1)] || '#f4c27a'; x.beginPath(); x.arc((o.door === 'l' ? 1.5 : 0.5) * S + k * 0.32 * S, H - 0.42 * S, 0.12 * S, 0, 7); x.fill(); }
  });
}
function addFacadeBlock(g, P) {
  const w = P.x1 - P.x0, h = P.h, z0 = -8, z1 = -5;
  const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.06).getHex(), 0.9), roof = std(0x8a5a4a, 0.9);
  const mats = [side, side, roof, side, new THREE.MeshStandardMaterial({map: facadeTex(w, h, P), roughness: 0.85}), side];
  const m = new THREE.Mesh(BOX, mats); m.scale.set(w, h, z1 - z0); m.position.set((P.x0 + P.x1) / 2, 0.22 + h / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  boxes.push({b: [P.x0, P.x1, 0.22, 0.22 + h, z0, z1], kind: 'hard'});
  addBox(g, std(0xf4eee2, 0.8), P.x0 - 0.06, P.x1 + 0.06, 0.22 + h, 0.22 + h + 0.18, z0, z1 + 0.12);
  // roof bits
  if (P.chim) addBox(g, std(0xc0603e, 0.9), P.x0 + w * 0.7, P.x0 + w * 0.7 + 0.5, 0.4 + h, 1.2 + h, -7.2, -6.6, false);
}

// ================= CHARACTERS =================
const SKIN = [0xf1c7a0, 0xd9a27a, 0xa86f4c, 0xffd9b8, 0xc68a5e], CLOTH = [0x1f6fd1, 0xe22511, 0x2fa84f, 0xffc20e, 0x7a4fb0, 0xff8fb8, 0x3a3f4a, 0xf4eee2, 0xff7a1a];
const HAIR = [0x2b1d14, 0x5a3a22, 0xc8a060, 0x111111, 0x9a9a9a, 0x8a3a1a];
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10), SPH = new THREE.SphereGeometry(1, 16, 12);
function part(geo, mat, sx, sy, sz, x, y, z, par) { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; }
function limb(par, mat, x, y, len, r, endMat, endR) { const piv = new THREE.Group(); piv.position.set(x, y, 0); par.add(piv); part(CYL, mat, r, len, r, 0, -len / 2, 0, piv); if (endMat) part(SPH, endMat, endR, endR * 0.8, endR * 1.3, 0, -len, endR * 0.3, piv); return piv; }
function makePerson(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const sk = std(pick(SKIN), 0.7), cl = std(o.col || pick(CLOTH), 0.75), pn = std(pick([0x22304a, 0x3a3f4a, 0x6b4a2a, 0x1b1330, 0x5a6a80]), 0.8), hr = std(pick(HAIR), 0.8), shoe = std(0x1b1330, 0.6);
  const legs = [limb(body, pn, -0.1, 0.74, 0.7, 0.085, shoe, 0.09), limb(body, pn, 0.1, 0.74, 0.7, 0.085, shoe, 0.09)];
  if (o.skirt) part(new THREE.ConeGeometry(1, 1, 14), cl, 0.3, 0.42, 0.26, 0, 0.78, 0, body);
  part(CYL, cl, 0.2, 0.62, 0.15, 0, 1.06, 0, body); part(SPH, cl, 0.2, 0.1, 0.15, 0, 1.37, 0, body);
  const arms = [limb(body, cl, -0.27, 1.34, 0.56, 0.06, sk, 0.065), limb(body, cl, 0.27, 1.34, 0.56, 0.06, sk, 0.065)];
  arms[0].rotation.z = -0.12; arms[1].rotation.z = 0.12;
  const head = new THREE.Group(); head.position.set(0, 1.6, 0); body.add(head);
  part(SPH, sk, 0.19, 0.2, 0.19, 0, 0, 0, head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hr); cap.position.set(0, 0.02, -0.015); cap.rotation.x = -0.25; head.add(cap);
  if (o.long) part(SPH, hr, 0.17, 0.22, 0.1, 0, -0.1, -0.12, head);
  if (o.hat) { part(CYL, std(o.hat, 0.7), 0.22, 0.05, 0.22, 0, 0.14, 0, head); part(CYL, std(o.hat, 0.7), 0.15, 0.16, 0.15, 0, 0.22, 0, head); }
  const eyeM = std(0x1b1330, 0.4); const eyes = [part(SPH, eyeM, 0.026, 0.034, 0.02, -0.065, 0.02, 0.175, head), part(SPH, eyeM, 0.026, 0.034, 0.02, 0.065, 0.02, 0.175, head)];
  const mouth = part(SPH, std(0x8a2a1a, 0.6), 0.04, 0.012, 0.02, 0, -0.08, 0.175, head);
  if (o.bag) part(BOX, std(o.bag, 0.7), 0.08, 0.28, 0.3, 0.3, 1.0, 0, body);
  ink(g, 0.018);
  const s = o.kid ? 0.68 : 1; g.scale.setScalar(s);
  return {g, body, legs, arms, head, eyes, mouth, s};
}
function makeCat(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(o.col || pick([0xf0912e, 0x8a8a92, 0x2a2a2e, 0xf4f0e8, 0xc8a070]), 0.8), w = std(0xf4f0e8, 0.8);
  part(SPH, c, 0.17, 0.16, 0.28, 0, 0.27, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.42, 0.25); body.add(head);
  part(SPH, c, 0.14, 0.12, 0.13, 0, 0, 0, head); part(SPH, w, 0.07, 0.05, 0.05, 0, -0.04, 0.1, head);
  const earG = new THREE.ConeGeometry(1, 1, 4); for (const sx of [-1, 1]) { const e = part(earG, c, 0.05, 0.09, 0.035, sx * 0.075, 0.11, 0, head); e.rotation.z = -sx * 0.25; }
  const em = std(0x9ad13a, 0.3), pm = std(0x111111, 0.3); for (const sx of [-1, 1]) { part(SPH, em, 0.026, 0.03, 0.015, sx * 0.055, 0.02, 0.115, head); part(SPH, pm, 0.01, 0.026, 0.01, sx * 0.055, 0.02, 0.126, head); }
  const legs = []; for (const [lx, lz] of [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]]) legs.push(limb(body, c, lx, 0.2, 0.2, 0.035, w, 0.04));
  legs.forEach((l, i) => { l.position.z = [0.15, 0.15, -0.15, -0.15][i]; });
  const tail = new THREE.Group(); tail.position.set(0, 0.32, -0.26); body.add(tail); part(CYL, c, 0.03, 0.42, 0.03, 0, 0.2, 0, tail); tail.rotation.x = -0.7;
  ink(g, 0.014); return {g, body, legs, head, tail, s: 1};
}
function makeDog() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(pick([0xa8743c, 0xe8d2a8, 0x3a2a20]), 0.8), d = std(0x3a2a20, 0.8);
  part(SPH, c, 0.2, 0.2, 0.36, 0, 0.42, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.62, 0.34); body.add(head);
  part(SPH, c, 0.16, 0.15, 0.17, 0, 0, 0, head); part(SPH, c, 0.08, 0.07, 0.11, 0, -0.04, 0.15, head); part(SPH, d, 0.035, 0.03, 0.03, 0, -0.01, 0.26, head);
  for (const sx of [-1, 1]) { part(BOX, d, 0.06, 0.18, 0.1, sx * 0.15, -0.04, -0.02, head); part(SPH, std(0x111111), 0.024, 0.028, 0.02, sx * 0.06, 0.04, 0.14, head); }
  const legs = []; for (const [lx, lz] of [[-0.1, 0.2], [0.1, 0.2], [-0.1, -0.2], [0.1, -0.2]]) { const l = limb(body, c, lx, 0.32, 0.3, 0.05, d, 0.05); l.position.z = lz; legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.34); body.add(tail); part(CYL, c, 0.035, 0.25, 0.035, 0, 0.12, 0, tail); tail.rotation.x = -0.9;
  ink(g, 0.016); return {g, body, legs, head, tail, s: 1};
}
function makePigeon() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(0x8d93a6, 0.7);
  part(SPH, c, 0.1, 0.09, 0.15, 0, 0.13, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.24, 0.1); body.add(head);
  part(SPH, std(0x6f7590, 0.6), 0.06, 0.06, 0.06, 0, 0, 0, head); part(new THREE.ConeGeometry(1, 1, 5), std(0xe8a03a), 0.015, 0.05, 0.015, 0, -0.01, 0.07, head).rotation.x = Math.PI / 2;
  const wings = []; for (const sx of [-1, 1]) { const p = new THREE.Group(); p.position.set(sx * 0.07, 0.16, 0); body.add(p); part(BOX, std(0x737a92, 0.7), 0.16, 0.02, 0.18, sx * 0.08, 0, -0.02, p); wings.push(p); }
  ink(g, 0.012); return {g, body, head, wings, legs: [], s: 1};
}
const SAY = {
  person: ['Hey!', 'Aaa!', 'Ayy kafam!', 'Kimin bu?', 'Dikkat!', 'Oha!', 'Yavaş!', 'Bu ne ya?'],
  kid: ['Yaşasın!', 'Bir daha!', 'Haha!', 'Ben de!'],
  cat: ['MİYAV!', 'Hıhh!', 'MRRAV!'], dog: ['HAV HAV!', 'Hav!'], pigeon: ['pır pır!'],
};
let actors = [];
function spawnActors(L) {
  actors = [];
  for (const A of L.actors || []) {
    const n = A.t === 'pigeons' ? (A.n || 4) : 1;
    for (let k = 0; k < n; k++) {
      const kind = A.t === 'pigeons' ? 'pigeon' : A.t;
      const m = kind === 'cat' ? makeCat(A) : kind === 'dog' ? makeDog() : kind === 'pigeon' ? makePigeon() : makePerson({...A, kid: kind === 'kid'});
      world.add(m.g);
      const x = A.x + (A.t === 'pigeons' ? srnd(-0.9, 0.9) : 0), z = A.z + (A.t === 'pigeons' ? srnd(-0.6, 0.6) : 0);
      const I = islandAt(x, z), y0 = A.y !== undefined ? A.y : (I ? I.top : 0.22);
      const a = {kind, m, x, z, y0, home: {x, z}, path: A.path || null, sp: A.sp || (kind === 'cat' ? 0.7 : kind === 'dog' ? 1.1 : 0.9), dir: 1, t: srnd(0, 6), sit: !!A.sit,
        r: kind === 'person' ? 0.3 * m.s : kind === 'kid' ? 0.3 * m.s : kind === 'dog' ? 0.32 : kind === 'cat' ? 0.27 : 0.17,
        h: kind === 'person' || kind === 'kid' ? 1.82 * m.s : kind === 'dog' ? 0.8 : kind === 'cat' ? 0.56 : 0.32,
        react: 0, rk: '', flee: 0, fleeDir: 1, fly: null, face: A.face || 0, look: 0, jy: 0};
      a.col = {x, z, y0, h: a.h, r: a.r, a};
      m.g.position.set(x, y0, z); m.g.rotation.y = a.face;
      if (a.sit && kind === 'cat') { m.body.rotation.x = -0.35; m.body.position.y = -0.05; m.legs[2].rotation.x = 1.2; m.legs[3].rotation.x = 1.2; }
      if (a.sit && (kind === 'person')) { m.legs.forEach((l) => { l.rotation.x = -1.45; }); m.body.position.y = -0.3; }
      actors.push(a);
    }
  }
}
// bubbles
const bubbles = [];
function bubble(a, txt) {
  const el = document.createElement('div'); el.className = 'bub'; el.textContent = txt; $('hud').appendChild(el);
  bubbles.push({el, a, life: 1.4}); while (bubbles.length > 5) bubbles.shift().el.remove();
}
function reactActor(a, from) {
  if (a.react > 0.4) return false;
  const dx = from.x - a.x, dz = from.z - a.z;
  if (a.kind === 'pigeon') { scarePigeons(a); return true; }
  a.react = a.kind === 'cat' ? 0.55 : 1.7; a.rk = 'hit'; a.look = Math.atan2(dx, dz);
  bubble(a, pick(SAY[a.kind] || SAY.person));
  if (a.kind === 'cat') { a.flee = 1.6; a.fleeDir = dx > 0 ? -1 : 1; a.sit = false; a.m.body.rotation.x = 0; a.m.body.position.y = 0; a.m.legs.forEach((l) => { l.rotation.x = 0; }); SFX.meow(); }
  else if (a.kind === 'dog') SFX.bark();
  else if (a.kind === 'kid') SFX.yay(); else SFX.hey();
  buzz(12);
  return true;
}
function scarePigeons(src) {
  let any = false;
  for (const p of actors) if (p.kind === 'pigeon' && !p.fly && Math.hypot(p.x - src.x, p.z - src.z) < 2.6) { p.fly = {t: 0, vx: srnd(-2.5, 2.5), vz: srnd(-3, -1), vy: srnd(3.5, 5)}; any = true; }
  if (any) { SFX.flap(); bubble(src, SAY.pigeon[0]); }
}
function updateActors(dt) {
  const tp = toyRoot.position, flying = P.phase === 'fly';
  for (const a of actors) {
    const m = a.m; a.t += dt;
    if (a.kind === 'pigeon') {
      if (a.fly) {
        const f = a.fly; f.t += dt; a.x += f.vx * dt; a.z += f.vz * dt; a.y0 += f.vy * dt; f.vy += 1.5 * dt;
        m.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(a.t * 30) * 0.9; });
        m.g.rotation.y = Math.atan2(f.vx, f.vz); a.col.off = true;
        if (f.t > 4.5) { a.fly = null; a.x = a.home.x; a.z = a.home.z; const I = islandAt(a.x, a.z); a.y0 = I ? I.top : 0.22; a.col.off = false; m.wings.forEach((w) => { w.rotation.z = 0; }); }
      } else {
        m.head.position.y = 0.24 - Math.max(0, Math.sin(a.t * 3 + a.home.x * 5)) * 0.08; m.body.rotation.x = Math.max(0, Math.sin(a.t * 3 + a.home.x * 5)) * 0.4;
        if (flying && tp.distanceTo(tmp.set(a.x, a.y0, a.z)) < 1.6) scarePigeons(a);
      }
      m.g.position.set(a.x, a.y0, a.z); a.col.x = a.x; a.col.z = a.z; a.col.y0 = a.y0; continue;
    }
    let moving = false, speed = 0;
    if (a.react > 0) a.react -= dt;
    if (a.flee > 0) { a.flee -= dt; speed = 4.2; a.x = clamp(a.x + a.fleeDir * speed * dt, -3.8, 3.8); if (Math.abs(a.x) >= 3.8) a.fleeDir *= -1; a.face = a.fleeDir > 0 ? Math.PI / 2 : -Math.PI / 2; moving = true; }
    else if (a.path && a.react <= 0 && !a.sit) {
      const [x0, z0, x1, z1] = a.path, L = Math.hypot(x1 - x0, z1 - z0) || 1;
      let u = ((a.x - x0) * (x1 - x0) + (a.z - z0) * (z1 - z0)) / (L * L);
      u += a.dir * a.sp * dt / L; if (u > 1) { u = 1; a.dir = -1; } if (u < 0) { u = 0; a.dir = 1; }
      a.x = x0 + (x1 - x0) * u; a.z = z0 + (z1 - z0) * u; a.face = Math.atan2((x1 - x0) * a.dir, (z1 - z0) * a.dir); moving = true; speed = a.sp;
      const I = islandAt(a.x, a.z); if (I && a.y === undefined) a.y0 = lerp(a.y0, I.top, 0.3);
    }
    // facing: turn toward the toy when hit or when it flies close
    const near = flying && Math.hypot(tp.x - a.x, tp.z - a.z) < 3.2;
    let want = a.face; if (a.react > 0 || near) want = Math.atan2(tp.x - a.x, tp.z - a.z);
    let dy = want - m.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); m.g.rotation.y += dy * Math.min(1, dt * (a.react > 0 ? 12 : 6));
    // walk cycle
    const ph = a.t * (speed > 2 ? 16 : 7), sw = moving ? (speed > 2 ? 0.9 : 0.55) : 0;
    if (a.kind === 'person' || a.kind === 'kid') {
      if (!a.sit) { m.legs[0].rotation.x = Math.sin(ph) * sw; m.legs[1].rotation.x = -Math.sin(ph) * sw; }
      let jy = 0;
      if (a.react > 0) { // jump + arms up, then shake a fist
        const k = 1.7 - a.react; jy = k < 0.4 ? Math.sin(k / 0.4 * Math.PI) * 0.4 : 0;
        if (k < 0.7) { m.arms[0].rotation.x = -2.7; m.arms[1].rotation.x = -2.7; m.arms[0].rotation.z = -0.5; m.arms[1].rotation.z = 0.5; }
        else { m.arms[0].rotation.x = 0; m.arms[0].rotation.z = -0.12; m.arms[1].rotation.x = -2.2 + Math.sin(a.t * 18) * 0.35; m.arms[1].rotation.z = 0.2; }
        m.mouth.scale.set(0.05, 0.05, 0.02); m.head.rotation.x = -0.3;
      } else {
        m.arms[0].rotation.x = -Math.sin(ph) * sw * 0.8; m.arms[1].rotation.x = Math.sin(ph) * sw * 0.8; m.arms[0].rotation.z = -0.12; m.arms[1].rotation.z = 0.12;
        m.mouth.scale.set(0.04, 0.012, 0.02); m.head.rotation.x = near ? -0.45 : 0; // look up at the flying FLIX
      }
      m.body.position.y = (a.sit ? -0.3 : 0) + jy + (moving ? Math.abs(Math.sin(ph)) * 0.04 : 0);
    } else { // cat / dog
      m.legs.forEach((l, i) => { if (!a.sit) l.rotation.x = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * sw; });
      let jy = 0;
      if (a.react > 0) { const k = (a.kind === 'cat' ? 0.55 : 1.7) - a.react; jy = k < 0.45 ? Math.sin(k / 0.45 * Math.PI) * (a.kind === 'cat' ? 0.9 : 0.3) : 0; if (a.kind === 'dog') jy = Math.abs(Math.sin(k * 14)) * 0.15; }
      m.tail.rotation.x = a.flee > 0 || a.react > 0 ? -0.05 : -0.7 + Math.sin(a.t * (a.kind === 'dog' ? 14 : 2)) * 0.25;
      m.tail.rotation.z = a.kind === 'dog' ? Math.sin(a.t * 16) * 0.5 : 0;
      m.body.position.y = (a.sit && a.kind === 'cat' ? -0.05 : 0) + jy;
      if (a.kind === 'cat' && a.react > 0) m.body.scale.set(1, 1.15, 0.92); else m.body.scale.set(1, 1, 1);
      m.head.rotation.x = near ? -0.4 : 0;
    }
    m.g.position.set(a.x, a.y0, a.z); a.col.x = a.x; a.col.z = a.z; a.col.y0 = a.y0 + (m.body.position.y > 0 ? m.body.position.y : 0);
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i]; b.life -= dt;
    if (b.life <= 0) { b.el.remove(); bubbles.splice(i, 1); continue; }
    const v = tmp.set(b.a.x, b.a.y0 + b.a.h + 0.35, b.a.z).project(camera);
    b.el.style.transform = `translate(${((v.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - v.y) / 2 * innerHeight - (1.4 - b.life) * 14).toFixed(1)}px) translate(-50%,-100%) scale(${b.life > 1.25 ? (1.4 - b.life) / 0.15 : 1})`;
    b.el.style.opacity = Math.min(1, b.life / 0.25);
  }
}
function actorsPhys() { return actors.map((a) => a.col); }
