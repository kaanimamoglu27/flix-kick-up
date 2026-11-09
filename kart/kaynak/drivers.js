// ===== Flix Kart drivers: FLIX hero (ARKANA model), Usta Wu, Kick, Flick =====
// Models come from Flix's own sources: arena_paket/flix-kahraman-modeli.js (FLIX hero) and the
// Usta Wu Instagram series (person/wuChar/kickChar/flickChar). Adapted here for a seated driving pose.
const DTAU = Math.PI * 2;
let dseed = 7; const drnd = () => { dseed = (dseed * 16807) % 2147483647; return (dseed - 1) / 2147483646; }; const drr = (a, b) => a + (b - a) * drnd();
const LM = (c, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o));
const dmesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; return o; };
function weldJit(g, a) { const p = g.attributes.position, map = {}; for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3); if (!map[k]) map[k] = [drr(-a, a), drr(-a, a), drr(-a, a)]; const d = map[k]; p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]); } g.computeVertexNormals(); return g; }

// ---------- ink outline (from flix-oyuncak-modeli.js) ----------
const INKC = 0x1b1330, OUTM = {};
function outlineMat(th, col) {
  const k = th + '_' + col; if (OUTM[k]) return OUTM[k];
  const m = new THREE.MeshBasicMaterial({ color: col === undefined ? INKC : col, side: THREE.BackSide });
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + th.toFixed(4) + ';'); };
  return (OUTM[k] = m);
}
function ink(obj, th, col, skip) {
  const list = []; obj.traverse((o) => { if (o.isMesh && !o.userData.noInk && !(o.material && (o.material.transparent || o.material.isMeshBasicMaterial))) list.push(o); });
  for (const m of list) { if (skip && skip(m)) continue; const s = new THREE.Mesh(m.geometry, outlineMat(th, col)); s.userData.noInk = true; m.add(s); }
  return obj;
}

// ---------- FLIX hero (ARKANA) ----------
const HR = {};
function hcanvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function flixFace(kind) {
  return hcanvas(512, 256, (x) => {
    x.clearRect(0, 0, 512, 256); const ink = '#1a1012';
    const eye = (cx, cy, look) => {
      if (kind === 'blink') { x.strokeStyle = ink; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy + 6, 26, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); return; }
      if (kind === 'hurt') { x.strokeStyle = ink; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 20, cy - 18); x.lineTo(cx + 20, cy + 2); x.lineTo(cx - 20, cy + 22); x.stroke(); return; }
      x.fillStyle = '#fbf6ea'; x.strokeStyle = ink; x.lineWidth = 8; x.beginPath(); x.ellipse(cx, cy, 30, 40, 0, 0, DTAU); x.fill(); x.stroke();
      x.fillStyle = ink; x.beginPath(); x.ellipse(cx + look, cy + 6, 13, 18, 0, 0, DTAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + look + 5, cy - 2, 5, 0, DTAU); x.fill();
    };
    const L = kind === 'shout' ? 0 : 5; eye(205, 92, L); eye(300, 92, L);
    x.strokeStyle = ink; x.lineWidth = 9; x.lineCap = 'round';
    const br = kind === 'shout' ? 10 : kind === 'hurt' ? -6 : 0;
    x.beginPath(); x.moveTo(178, 42 + br); x.quadraticCurveTo(205, 30 - br, 230, 40); x.stroke();
    x.beginPath(); x.moveTo(275, 40); x.quadraticCurveTo(300, 30 - br, 326, 42 + br); x.stroke();
    x.lineWidth = 8; x.fillStyle = '#4a0d12';
    if (kind === 'hurt') { x.beginPath(); x.ellipse(258, 196, 26, 20, 0, 0, DTAU); x.fill(); x.stroke(); }
    else {
      const w = kind === 'shout' ? 92 : 104, h = kind === 'shout' ? 74 : 62;
      x.beginPath(); x.moveTo(258 - w, 160); x.quadraticCurveTo(258, 160 + h * 2.1, 258 + w, 160); x.quadraticCurveTo(258, 176, 258 - w, 160); x.fill(); x.stroke();
      x.save(); x.clip(); x.fillStyle = '#fbf6ea'; x.fillRect(150, 150, 220, 26); x.fillStyle = '#e8566a'; x.beginPath(); x.ellipse(266, 160 + h * 1.15, 40, 24, 0, 0, DTAU); x.fill(); x.restore();
      x.beginPath(); x.moveTo(258 - w, 160); x.quadraticCurveTo(258, 160 + h * 2.1, 258 + w, 160); x.stroke();
      x.lineWidth = 7; x.beginPath(); x.arc(258 - w - 6, 156, 10, -0.4, 1.2); x.stroke(); x.beginPath(); x.arc(258 + w + 6, 156, 10, 1.9, 3.5); x.stroke();
    }
  });
}
const HSKINS = {
  kraliyet: { body: 0xe22511, cloak: 0x0a2a5e, cloakIn: 0x9a0f14, metal: 0xaab2c0, gold: 0xffc20e, glove: 0xfbf6ea },
  buzul: { body: 0x2f8fe0, cloak: 0xf4f8ff, cloakIn: 0x2d6cff, metal: 0xd8e8f8, gold: 0xffffff, glove: 0xffffff },
  altin: { body: 0xffb81a, cloak: 0xfbf6ea, cloakIn: 0xe22511, metal: 0xfff2c0, gold: 0xffffff, glove: 0xffffff },
  neon: { body: 0xff2d9a, cloak: 0x14062a, cloakIn: 0x2fe8ff, metal: 0x2fe8ff, gold: 0x2fe8ff, glove: 0x2fe8ff },
};
function buildHero(S) {
  if (!HR.faces) HR.faces = { happy: flixFace('happy'), blink: flixFace('blink'), shout: flixFace('shout'), hurt: flixFace('hurt') };
  const phong = (c, sh) => new THREE.MeshPhongMaterial({ color: c, shininess: sh || 30, specular: 0x3a3a50 });
  const cyl = (rt, rb, h, seg) => new THREE.CylinderGeometry(rt, rb, h, seg || 10);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const red = new THREE.MeshPhongMaterial({ color: S.body, shininess: 70, specular: 0x553333 }), inkM = phong(0x1a1214, 40), glove = new THREE.MeshPhongMaterial({ color: S.glove, shininess: 50, specular: 0x333333 });
  const metal = new THREE.MeshPhongMaterial({ color: S.metal, shininess: 130, specular: 0xbbbbcc }), gold = new THREE.MeshPhongMaterial({ color: S.gold, shininess: 130, specular: 0xffeeaa });
  const add = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (par || body).add(m); return m; };
  const head = new THREE.Group(); head.position.y = 1.18; body.add(head);
  const bulb = add(new THREE.SphereGeometry(0.42, 24, 18), red, 0, 0, 0, head); bulb.scale.set(1.15, 0.92, 1.0);
  const prof = []; for (let i = 0; i <= 16; i++) { const k = i / 16; prof.push(new THREE.Vector2(0.24 + Math.pow(k, 1.6) * 0.36 + Math.sin(k * Math.PI) * 0.04, 0.2 + k * 1.15)); }
  const tg = new THREE.LatheGeometry(prof, 40), tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const y = tp.getY(i), k = (y - 0.2) / 1.15; if (k < 0.55) continue; const a = Math.atan2(tp.getX(i), tp.getZ(i)), f = ((a / DTAU * 5 + 0.25) % 1 + 1) % 1, tri = 1 - Math.abs(f * 2 - 1); tp.setY(i, y + (tri * 0.42 - 0.14) * Math.pow((k - 0.55) / 0.45, 1.5)); }
  tg.computeVertexNormals();
  add(tg, new THREE.MeshPhongMaterial({ color: S.body, shininess: 70, specular: 0x553333, side: THREE.DoubleSide }), 0, 0, 0, head);
  const faceMat = new THREE.MeshBasicMaterial({ map: HR.faces.happy, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = add(new THREE.SphereGeometry(0.425, 24, 18, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.18, Math.PI * 0.6), faceMat, 0, 0, 0, head); face.scale.copy(bulb.scale); face.castShadow = false;
  const nose = add(new THREE.SphereGeometry(0.075, 12, 8), red, 0, 0, 0.41, head); nose.scale.set(1.2, 0.9, 0.9);
  add(new THREE.CylinderGeometry(0.52, 0.44, 0.42, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshPhongMaterial({ color: S.cloak, side: THREE.DoubleSide, shininess: 30 }), 0, 0.12, -0.04, head);
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const pd = add(new THREE.SphereGeometry(0.17, 14, 8, 0, DTAU, 0, Math.PI / 2), metal, s * 0.42, 1.24, -0.02); pd.rotation.z = -s * 0.55; pd.scale.set(1.15, 0.8, 1.05);
    const rim = add(new THREE.TorusGeometry(0.17, 0.02, 6, 18), gold, s * 0.42, 1.24, -0.02); rim.rotation.set(Math.PI / 2, -s * 0.55, 0); rim.scale.set(1.15, 1.05, 1);
    const hip = new THREE.Group(); hip.position.set(s * 0.17, 0.92, 0); body.add(hip);
    add(cyl(0.045, 0.045, 0.47), inkM, 0, -0.235, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -0.47; hip.add(knee);
    add(cyl(0.045, 0.045, 0.37), inkM, 0, -0.185, 0, knee);
    const shoe = add(new THREE.SphereGeometry(0.16, 14, 10), red, 0, -0.39, 0.08, knee); shoe.scale.set(0.9, 0.62, 1.45);
    legs.push({ hip, knee });
    const sh = new THREE.Group(); sh.position.set(s * 0.43, 1.12, 0); body.add(sh);
    add(cyl(0.04, 0.04, 0.32), inkM, 0, -0.16, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.32; sh.add(el);
    add(cyl(0.04, 0.04, 0.24), inkM, 0, -0.12, 0, el);
    add(cyl(0.075, 0.065, 0.12), metal, 0, -0.18, 0, el);
    const hand = new THREE.Group(); hand.position.y = -0.33; el.add(hand);
    const palm = add(new THREE.SphereGeometry(0.1, 12, 8), glove, 0, -0.05, 0, hand); palm.scale.set(1, 1.05, 0.8);
    for (let f = 0; f < 3; f++) { const fi = add(new THREE.SphereGeometry(0.036, 8, 6), glove, -0.045 + f * 0.045, -0.14, 0.02, hand); fi.scale.y = 1.9; }
    arms.push({ sh, el, hand });
  }
  // short racing cape that flaps in the wind
  const cg = new THREE.PlaneGeometry(0.9, 0.95, 4, 6); cg.translate(0, -0.475, 0);
  const cpos = cg.attributes.position; for (let i = 0; i < cpos.count; i++) { const v = -cpos.getY(i) / 0.95; cpos.setX(i, cpos.getX(i) * (0.85 + v * 0.5)); }
  cg.userData.base = Float32Array.from(cpos.array);
  const cloak = new THREE.Mesh(cg, new THREE.MeshPhongMaterial({ color: S.cloak, side: THREE.DoubleSide, shininess: 25 })); cloak.position.set(0, 1.36, -0.32); cloak.castShadow = true; body.add(cloak);
  ink(g, 0.018, INKC, (m) => m === face || m === cloak);
  return { g, body, legs, arms, head, faceMat, cloak, cg, kind: 'hero' };
}

// ---------- Usta Wu series characters ----------
function person(o) {
  const g = new THREE.Group(); const skin = LM(o.skin || '#c98d5e');
  const hip = new THREE.Group(); hip.position.y = 0.92; g.add(hip);
  const legs = []; for (const s of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(s * 0.13, 0, 0); hip.add(pv);
    pv.add(dmesh(new THREE.CylinderGeometry(0.11, 0.095, 0.48, 6), LM(o.pants), 0, -0.24, 0));
    const knee = new THREE.Group(); knee.position.y = -0.46; pv.add(knee);
    knee.add(dmesh(new THREE.CylinderGeometry(0.09, 0.075, 0.42, 6), LM(o.sock || o.pants), 0, -0.21, 0));
    knee.add(dmesh(new THREE.BoxGeometry(0.15, 0.1, 0.3), LM(o.shoe || '#222'), 0, -0.44, 0.07)); legs.push({ pv, knee }); }
  if (o.robe) g.add(dmesh(weldJit(new THREE.CylinderGeometry(0.27, 0.42, 0.75, 7, 1, true), 0.02), LM(o.robe, { side: THREE.DoubleSide }), 0, 1.0, 0));
  const torso = dmesh(weldJit(new THREE.CylinderGeometry(0.3, 0.24, 0.72, 7), 0.015), LM(o.shirt), 0, 1.32, 0); g.add(torso);
  if (o.belt) g.add(dmesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 7), LM(o.belt), 0, 1.0, 0));
  const neck = new THREE.Group(); neck.position.y = 1.7; g.add(neck);
  neck.add(dmesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 6), skin, 0, 0.02, 0));
  const head = dmesh(weldJit(new THREE.IcosahedronGeometry(0.2, 1), 0.015), skin, 0, 0.24, 0); head.scale.set(1, 1.12, 1); neck.add(head);
  if (o.hair) neck.add(dmesh(weldJit(new THREE.SphereGeometry(0.215, 7, 5, 0, DTAU, 0, Math.PI * 0.55), 0.01), LM(o.hair), 0, 0.27, -0.01));
  if (o.hat) neck.add(dmesh(new THREE.ConeGeometry(0.36, 0.2, 8), LM(o.hat), 0, 0.5, 0));
  for (const s of [-1, 1]) neck.add(dmesh(new THREE.SphereGeometry(0.025, 5, 4), LM('#111'), s * 0.07, 0.27, 0.18));
  const arms = []; for (const s of [-1, 1]) { const sh = new THREE.Group(); sh.position.set(s * 0.36, 1.6, 0); g.add(sh);
    sh.add(dmesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 6), LM(o.sleeve || o.shirt), 0, -0.2, 0));
    const el = new THREE.Group(); el.position.y = -0.4; sh.add(el); el.add(dmesh(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 6), skin, 0, -0.19, 0));
    el.add(dmesh(new THREE.IcosahedronGeometry(0.065, 0), skin, 0, -0.4, 0)); arms.push({ sh, el }); }
  g.userData = { legs, arms, neck, torso }; return g;
}
function starTex(bg, fg) { return hcanvas(128, 128, (x) => { x.fillStyle = bg; x.fillRect(0, 0, 128, 128); x.fillStyle = fg; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 52, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(64 + Math.cos(a) * r, 66 + Math.sin(a) * r); } x.closePath(); x.fill(); x.lineWidth = 5; x.strokeStyle = '#5a1208'; x.stroke(); }); }
function bigEyes(nk, y, z, sp, r, brow) { for (const s of [-1, 1]) { const w = dmesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshLambertMaterial({ color: '#ffffff' }), s * sp, y, z); w.scale.z = 0.6; nk.add(w);
  const p = dmesh(new THREE.SphereGeometry(r * 0.55, 8, 6), new THREE.MeshBasicMaterial({ color: '#111' }), s * sp, y, z + r * 0.45); p.scale.z = 0.5; nk.add(p);
  nk.add(dmesh(new THREE.SphereGeometry(r * 0.18, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }), s * sp - r * 0.15, y + r * 0.2, z + r * 0.62));
  if (brow) { const b = dmesh(new THREE.BoxGeometry(r * 1.6, r * 0.35, r * 0.3), new THREE.MeshBasicMaterial({ color: '#111' }), s * sp, y + r * 1.15, z + r * 0.3); b.rotation.z = s * brow; nk.add(b); } } }
function wuChar() {
  const g = person({ skin: '#e3b98f', robe: '#8a2b2b', shirt: '#8a2b2b', sleeve: '#8a2b2b', pants: '#3a2a20', sock: '#e8e2d0', shoe: '#1d1d1d', belt: '#e0b44a', hair: '#eeeeee', hat: '#2b2420' });
  const nk = g.userData.neck; const beard = new THREE.Group(); beard.position.set(0, 0.16, 0.13); nk.add(beard);
  const bm = dmesh(weldJit(new THREE.ConeGeometry(0.15, 0.6, 6), 0.01), LM('#f2f2f2'), 0, -0.3, 0); bm.rotation.x = Math.PI; beard.add(bm); beard.scale.set(1, 2.1, 1);
  for (const s of [-1, 1]) { const ms = dmesh(new THREE.ConeGeometry(0.035, 0.22, 4), LM('#f2f2f2'), s * 0.09, 0.17, 0.17); ms.rotation.z = s * 2.0; nk.add(ms);
    const eb = dmesh(new THREE.BoxGeometry(0.09, 0.03, 0.03), LM('#f2f2f2'), s * 0.075, 0.34, 0.18); eb.rotation.z = -s * 0.25; nk.add(eb); }
  g.userData.beard = beard; return g;
}
function kickChar() {
  const g = person({ skin: '#ffd21a', shirt: '#ffd21a', sleeve: '#ffd21a', pants: '#ffd21a', sock: '#ffd21a', shoe: '#e3200f', belt: '#7a4a1a' });
  const nk = g.userData.neck; nk.children.filter((c) => c.geometry && c.geometry.type === 'SphereGeometry').forEach((c) => (c.visible = false));
  const head = nk.children.find((c) => c.geometry && c.geometry.type === 'IcosahedronGeometry' && c.position.y > 0.2); head.scale.set(1.45, 1.35, 1.4); head.position.y = 0.3;
  const tip = dmesh(weldJit(new THREE.ConeGeometry(0.24, 0.5, 8), 0.01), LM('#ffd21a'), 0, 0.72, -0.02); tip.rotation.x = -0.12; nk.add(tip);
  bigEyes(nk, 0.33, 0.2, 0.12, 0.085, 0.4);
  nk.add(dmesh(new THREE.BoxGeometry(0.16, 0.035, 0.03), new THREE.MeshBasicMaterial({ color: '#5a1208' }), 0, 0.17, 0.27));
  g.add(dmesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshLambertMaterial({ map: starTex('#ffd21a', '#e3200f') }), 0, 1.36, 0.29));
  for (const a of g.userData.arms) a.el.add(dmesh(new THREE.IcosahedronGeometry(0.11, 1), LM('#e3200f'), 0, -0.42, 0));
  const cape = dmesh(new THREE.PlaneGeometry(0.75, 1.0, 1, 4), LM('#d0281a', { side: THREE.DoubleSide }), 0, -0.5, 0); const cp = new THREE.Group(); cp.position.set(0, 1.62, -0.25); cp.add(cape); g.add(cp); g.userData.cape = cp;
  return g;
}
function flickChar() {
  const g = person({ skin: '#ffffff', shirt: '#f4f4f8', sleeve: '#f4f4f8', pants: '#f4f4f8', sock: '#f4f4f8', shoe: '#1f3a7a' });
  const nk = g.userData.neck; nk.children.filter((c) => c.geometry && c.geometry.type === 'SphereGeometry').forEach((c) => (c.visible = false));
  const head = nk.children.find((c) => c.geometry && c.geometry.type === 'IcosahedronGeometry' && c.position.y > 0.2); head.scale.set(1.7, 1.55, 1.6); head.position.y = 0.33;
  bigEyes(nk, 0.36, 0.27, 0.12, 0.075, 0);
  for (const s of [-1, 1]) { const ck = dmesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff9db0' }), s * 0.2, 0.25, 0.27); ck.scale.z = 0.3; nk.add(ck); }
  const sm = dmesh(new THREE.TorusGeometry(0.06, 0.016, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: '#5a1208' }), 0, 0.22, 0.31); sm.rotation.z = Math.PI; nk.add(sm);
  for (let i = 0; i < 3; i++) { const tr = dmesh(new THREE.TorusGeometry(0.22, 0.06, 6, 14), LM(i % 2 ? '#ffffff' : '#1f5fbf'), 0, 1.68 - i * 0.07, 0); tr.rotation.x = Math.PI / 2; g.add(tr); }
  for (const a of g.userData.arms) a.el.add(dmesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), LM('#1f5fbf'), 0, -0.32, 0));
  return g;
}

// ---------- roster ----------
export const DRIVERS = [
  { id: 'flix', tr: 'Flix', en: 'Flix', kart: 0xe22511, cost: 0, sub: ['Arkana kahramanı', 'Arkana hero'] },
  { id: 'wu', tr: 'Usta Wu', en: 'Master Wu', kart: 0x2c4a52, cost: 0, sub: ['Sektiremeyen usta', 'The master who can\'t juggle'] },
  { id: 'kick', tr: 'Kick', en: 'Kick', kart: 0xffc20e, cost: 600, sub: ['Süper tekme', 'Super kick'] },
  { id: 'flick', tr: 'Flick', en: 'Flick', kart: 0x1f5fbf, cost: 600, sub: ['Hızlı fiske', 'Quick flick'] },
  { id: 'buzul', tr: 'Buzul Flix', en: 'Ice Flix', kart: 0x8fd3ff, cost: 1500, sub: ['Soğukkanlı', 'Ice cold'] },
  { id: 'neon', tr: 'Neon Flix', en: 'Neon Flix', kart: 0xff2d9a, cost: 2500, sub: ['Gece yarışçısı', 'Night racer'] },
];

// returns {g, anim(dt, st)}; g faces -z (kart forward), hip at y=0, seated
export function makeDriver(id) {
  const root = new THREE.Group(); let anim;
  if (id === 'flix' || id === 'buzul' || id === 'neon' || id === 'altin') {
    const H = buildHero(HSKINS[id === 'flix' ? 'kraliyet' : id]);
    H.g.rotation.y = Math.PI; H.g.scale.setScalar(0.62); H.g.position.y = -0.92 * 0.62; root.add(H.g);
    let blinkT = 2, faceK = 'happy';
    anim = (dt, st) => {
      const A = H.arms, L = H.legs;
      for (const l of L) { l.hip.rotation.x = -1.45; l.knee.rotation.x = 1.25; }
      const cel = st.celebrate || 0;
      if (cel > 0) { const w = Math.sin(st.t * 12); A[0].sh.rotation.set(-0.3, 0, -(2.4 + w * 0.3)); A[1].sh.rotation.set(-0.3, 0, 2.4 - w * 0.3); A[0].el.rotation.x = A[1].el.rotation.x = -0.3; }
      else { const s = st.steer * 0.35; A[0].sh.rotation.set(-1.15 + s, 0, -0.15); A[1].sh.rotation.set(-1.15 - s, 0, 0.15); A[0].el.rotation.x = A[1].el.rotation.x = -0.35; }
      H.body.rotation.z = -st.steer * 0.12 * Math.min(1, st.s / 20); H.body.rotation.x = st.boost ? -0.12 : 0;
      H.head.rotation.y = st.steer * 0.35; H.head.rotation.z = Math.sin(st.t * 9) * 0.02 * Math.min(1, st.s / 10);
      blinkT -= dt; let k = st.hit ? 'hurt' : st.boost || cel ? 'shout' : 'happy'; if (k === 'happy' && blinkT < 0.12) k = 'blink'; if (blinkT < 0) blinkT = 2 + Math.random() * 3;
      if (k !== faceK) { faceK = k; H.faceMat.map = HR.faces[k]; }
      // cape flaps with speed
      const p = H.cg.attributes.position, b = H.cg.userData.base, sp = Math.min(1, st.s / 30);
      for (let i = 0; i < p.count; i++) { const y = b[i * 3 + 1], x = b[i * 3], v = -y / 0.95; p.setZ(i, -v * (0.25 + sp * 0.75) + Math.sin(st.t * 14 + v * 5 + x * 3) * 0.06 * v * (0.3 + sp)); p.setY(i, y * (1 - sp * 0.45)); }
      p.needsUpdate = true; H.cg.computeVertexNormals();
    };
  } else {
    const P = id === 'wu' ? wuChar() : id === 'kick' ? kickChar() : flickChar();
    P.rotation.y = Math.PI; const sc = id === 'wu' ? 0.82 : 0.78; P.scale.setScalar(sc); P.position.y = -0.92 * sc; root.add(P);
    const u = P.userData;
    anim = (dt, st) => {
      for (const l of u.legs) { l.pv.rotation.x = -1.45; l.knee.rotation.x = 1.3; }
      const cel = st.celebrate || 0;
      if (cel > 0) { const w = Math.sin(st.t * 12); u.arms[0].sh.rotation.set(-0.2, 0, -(2.5 + w * 0.3)); u.arms[1].sh.rotation.set(-0.2, 0, 2.5 - w * 0.3); u.arms[0].el.rotation.x = u.arms[1].el.rotation.x = -0.2; }
      else { const s = st.steer * 0.3; u.arms[0].sh.rotation.set(-1.2 + s, 0, -0.12); u.arms[1].sh.rotation.set(-1.2 - s, 0, 0.12); u.arms[0].el.rotation.x = u.arms[1].el.rotation.x = -0.45; }
      u.neck.rotation.y = st.steer * 0.4; u.neck.rotation.x = st.hit ? 0.3 : st.boost ? -0.15 : 0;
      P.rotation.z = st.steer * 0.12 * Math.min(1, st.s / 20);
      if (u.beard) u.beard.rotation.x = Math.min(0.5, st.s / 60) + Math.sin(st.t * 16) * 0.05 * Math.min(1, st.s / 20);
      if (u.cape) u.cape.rotation.x = 0.25 + Math.min(1.1, st.s / 30) + Math.sin(st.t * 15) * 0.08;
    };
  }
  return { g: root, anim };
}
