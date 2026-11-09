import * as THREE from 'three';
// FLIX oyuncağının 3D modeli (Three.js r128). makeToy() bir THREE.Group döndürür: yuvarlak kırmızı gövde + mavi, yeşil, sarı üç yaprak tüy + koyu mürekkep dış çizgisi.
// Kullanım: const toy = makeToy(); scene.add(toy);
const NAVY = 0x022753, RED = 0xe22511, YEL = 0xffc20e, INKC = 0x1b1330;
const OUT = {};
function outlineMat(th, col) {
  const k = th + '_' + col; if (OUT[k]) return OUT[k];
  const m = new THREE.MeshBasicMaterial({color: col === undefined ? INKC : col, side: THREE.BackSide});
  m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + th.toFixed(4) + ';'); };
  return (OUT[k] = m);
}
function ink(obj, th, col, skip) {
  const list = []; obj.traverse((o) => { if (o.isMesh && !o.userData.noInk && !(o.material && (o.material.transparent || o.material.isMeshBasicMaterial))) list.push(o); });
  for (const m of list) { if (skip && skip(m)) continue; const s = new THREE.Mesh(m.geometry, outlineMat(th, col)); s.userData.noInk = true; m.add(s); }
  return obj;
}
function std(col, r, m) { return new THREE.MeshStandardMaterial({color: col, roughness: r === undefined ? 0.6 : r, metalness: m || 0}); }
function mesh(geo, mat, x, y, z, par) { const o = new THREE.Mesh(geo, mat); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; if (par) par.add(o); return o; }
function leafGeo(L, Wd, bend) {
  const g = new THREE.PlaneGeometry(1, 1, 8, 20); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5; // u across, v along
    const wv = Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.96 + 0.04)), 0.75) * (1 - v * 0.25);
    const x = (u - 0.5) * Wd * wv, y = v * L;
    const cup = -Math.pow((u - 0.5) * 2, 2) * 0.06 * Wd * wv * 3; // slight cupping across the leaf
    const z = bend * v * v * L + cup;
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
}
function makeToy(opt) {
  opt = opt || {};
  const g = new THREE.Group();
  const baseCol = opt.base || RED;
  const prof = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(a) * 0.36, Math.sin(a) * 0.3 + 0.3)); }
  prof.push(new THREE.Vector2(0.36, 0.42)); prof.push(new THREE.Vector2(0.3, 0.46)); prof.push(new THREE.Vector2(0.0, 0.46));
  const base = mesh(new THREE.LatheGeometry(prof, 40), new THREE.MeshStandardMaterial({color: baseCol, roughness: 0.35, emissive: baseCol, emissiveIntensity: 0.15}), 0, 0, 0, g);
  const band = mesh(new THREE.TorusGeometry(0.365, 0.028, 10, 40), std(NAVY, 0.4), 0, 0.33, 0, g); band.rotation.x = Math.PI / 2;
  const band2 = mesh(new THREE.TorusGeometry(0.33, 0.018, 8, 40), std(0xffffff, 0.4), 0, 0.2, 0, g); band2.rotation.x = Math.PI / 2; band2.scale.set(1.02, 1.02, 1);
  const cols = opt.feathers || [0x1f6fd1, 0x2fa84f, 0xffc20e];
  const lg = leafGeo(1.25, 0.62, -0.12);
  const fe = [];
  [-1, 0, 1].forEach((k, i) => {
    const piv = new THREE.Group(); piv.position.set(k * 0.12, 0.42, 0); g.add(piv);
    piv.rotation.z = -k * 0.42; piv.rotation.x = k === 0 ? -0.08 : 0.06;
    const m = mesh(lg, new THREE.MeshStandardMaterial({color: cols[i], roughness: 0.45, emissive: cols[i], emissiveIntensity: 0.32, side: THREE.DoubleSide}), 0, 0, 0, piv);
    const rib = mesh(new THREE.CylinderGeometry(0.012, 0.02, 1.05, 6), std(0xffffff, 0.5), 0, 0.52, 0.012, piv); rib.userData.noInk = true;
    fe.push(piv);
  });
  ink(g, 0.022);
  g.userData.fe = fe;
  if (opt.scale) g.scale.setScalar(opt.scale);
  return g;
}


// FLIX kahramanının 3D modeli (ARKANA oyunundaki FLIX karakteri). Three.js r128.
// ÖNCE flix-oyuncak-modeli.js yüklenmeli (ink(), INKC buradan kullanılır).
// Kullanım: const H = hero("kraliyet"); scene.add(H.g); pose(H, {kickR: 1.6, armL: [0.2, 1.2, -0.4]});
// H: {g, body, legs[{hip,knee}], arms[{sh,el,hand,torch}], head, face, faceMat, cloak}. Yüz ifadeleri: R.flixFaces.happy|blink|shout|hurt (H.faceMat.map = ...).
// Kostümler: SKINS (kraliyet, buzul, ejder, altin, neon). Yeni kostüm = aynı alanlarla yeni renk seti.
const TAU=Math.PI*2, R={aniso:8}, MATS={};
function glow(col){return new THREE.MeshBasicMaterial({color:col});}
function addGlow(col,op){return new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});}
function phong(col,sh){return new THREE.MeshPhongMaterial({color:col,shininess:sh||30,specular:0x3a3a50});}
function cylG(rt,rb,h,seg){return new THREE.CylinderGeometry(rt,rb,h,seg||12);}
function canvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function flixFace(kind) {
  return canvasTex(512, 256, (x) => {
    x.clearRect(0, 0, 512, 256); const ink = '#1a1012';
    const eye = (cx, cy, look) => {
      if (kind === 'blink') { x.strokeStyle = ink; x.lineWidth = 9; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy + 6, 26, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); return; }
      if (kind === 'hurt') { x.strokeStyle = ink; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx - 20, cy - 18); x.lineTo(cx + 20, cy + 2); x.lineTo(cx - 20, cy + 22); x.stroke(); return; }
      x.fillStyle = '#fbf6ea'; x.strokeStyle = ink; x.lineWidth = 8; x.beginPath(); x.ellipse(cx, cy, 30, 40, 0, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = ink; x.beginPath(); x.ellipse(cx + look, cy + 6, 13, 18, 0, 0, TAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + look + 5, cy - 2, 5, 0, TAU); x.fill();
    };
    const L = kind === 'shout' ? 0 : 5;
    eye(205, 92, L); eye(300, 92, L);
    // eyebrows
    x.strokeStyle = ink; x.lineWidth = 9; x.lineCap = 'round';
    const br = kind === 'shout' ? 10 : kind === 'hurt' ? -6 : 0;
    x.beginPath(); x.moveTo(178, 42 + br); x.quadraticCurveTo(205, 30 - br, 230, 40); x.stroke();
    x.beginPath(); x.moveTo(275, 40); x.quadraticCurveTo(300, 30 - br, 326, 42 + br); x.stroke();
    // mouth
    x.lineWidth = 8; x.fillStyle = '#4a0d12';
    if (kind === 'hurt') { x.beginPath(); x.ellipse(258, 196, 26, 20, 0, 0, TAU); x.fill(); x.stroke(); }
    else {
      const w = kind === 'shout' ? 92 : 104, h = kind === 'shout' ? 74 : 62;
      x.beginPath(); x.moveTo(258 - w, 160); x.quadraticCurveTo(258, 160 + h * 2.1, 258 + w, 160); x.quadraticCurveTo(258, 176, 258 - w, 160); x.fill(); x.stroke();
      x.save(); x.clip(); x.fillStyle = '#fbf6ea'; x.fillRect(150, 150, 220, 26); x.fillStyle = '#e8566a'; x.beginPath(); x.ellipse(266, 160 + h * 1.15, 40, 24, 0, 0, TAU); x.fill(); x.restore();
      x.beginPath(); x.moveTo(258 - w, 160); x.quadraticCurveTo(258, 160 + h * 2.1, 258 + w, 160); x.stroke();
      x.lineWidth = 7; x.beginPath(); x.arc(258 - w - 6, 156, 10, -0.4, 1.2); x.stroke(); x.beginPath(); x.arc(258 + w + 6, 156, 10, 1.9, 3.5); x.stroke();
    }
  });
}
function buildFlix(S) {
  if (!R.flixFaces) R.flixFaces = {happy: flixFace('happy'), blink: flixFace('blink'), shout: flixFace('shout'), hurt: flixFace('hurt')};
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const red = new THREE.MeshPhongMaterial({color: S.body, shininess: 70, specular: 0x553333}), ink = phong(0x1a1214, 40), glove = new THREE.MeshPhongMaterial({color: S.glove, shininess: 50, specular: 0x333333});
  const metal = new THREE.MeshPhongMaterial({color: S.metal, shininess: 130, specular: 0xbbbbcc}), gold = new THREE.MeshPhongMaterial({color: S.gold, shininess: 130, specular: 0xffeeaa});
  const add = (geo, mat, x, y, z, par, sh) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh !== false; (par || body).add(m); return m; };
  // head: round face bulb + tall flared tulip with a zig-zag crown
  const head = new THREE.Group(); head.position.y = 1.18; body.add(head);
  const bulb = add(new THREE.SphereGeometry(0.42, 32, 24), red, 0, 0, 0, head); bulb.scale.set(1.15, 0.92, 1.0);
  // tulip flare with a zig-zag crown rim (5 points, like the logo character)
  const prof = []; for (let i = 0; i <= 20; i++) { const k = i / 20; prof.push(new THREE.Vector2(0.24 + Math.pow(k, 1.6) * 0.36 + Math.sin(k * Math.PI) * 0.04, 0.2 + k * 1.15)); }
  const tg = new THREE.LatheGeometry(prof, 60), tp = tg.attributes.position;
  for (let i = 0; i < tp.count; i++) { const y = tp.getY(i), k = (y - 0.2) / 1.15; if (k < 0.55) continue; const a = Math.atan2(tp.getX(i), tp.getZ(i)), f = ((a / TAU * 5 + 0.25) % 1 + 1) % 1, tri = 1 - Math.abs(f * 2 - 1); tp.setY(i, y + (tri * 0.42 - 0.14) * Math.pow((k - 0.55) / 0.45, 1.5)); }
  tg.computeVertexNormals();
  const tulip = add(tg, new THREE.MeshPhongMaterial({color: S.body, shininess: 70, specular: 0x553333, side: THREE.DoubleSide}), 0, 0, 0, head);
  const crown = tulip;
  // face decal fitted to the bulb
  const faceMat = new THREE.MeshBasicMaterial({map: R.flixFaces.happy, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2});
  const face = add(new THREE.SphereGeometry(0.425, 32, 24, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.18, Math.PI * 0.6), faceMat, 0, 0, 0, head, false); face.scale.copy(bulb.scale);
  const nose = add(new THREE.SphereGeometry(0.075, 14, 10), red, 0.0, 0.0, 0.41, head); nose.scale.set(1.2, 0.9, 0.9);
  // Doom-style regal armour and cloak around the bulb
  const coll = add(new THREE.CylinderGeometry(0.52, 0.44, 0.42, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshPhongMaterial({color: S.cloak, side: THREE.DoubleSide, shininess: 30}), 0, 0.12, -0.04, head);
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    // shoulder pauldrons with gold rims
    const pd = add(new THREE.SphereGeometry(0.17, 16, 10, 0, TAU, 0, Math.PI / 2), metal, s * 0.42, 1.24, -0.02); pd.rotation.z = -s * 0.55; pd.scale.set(1.15, 0.8, 1.05);
    const rim = add(new THREE.TorusGeometry(0.17, 0.02, 6, 20), gold, s * 0.42, 1.24, -0.02, null, false); rim.rotation.set(Math.PI / 2, -s * 0.55, 0); rim.scale.set(1.15, 1.05, 1);
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), gold, s * 0.3, 1.36, 0.27, null, false).rotation.x = Math.PI / 2.4;
    // rubber-hose legs and big red shoes
    const hip = new THREE.Group(); hip.position.set(s * 0.17, 0.92, 0); body.add(hip);
    add(cylG(0.045, 0.045, 0.47), ink, 0, -0.235, 0, hip);
    const knee = new THREE.Group(); knee.position.y = -0.47; hip.add(knee);
    add(new THREE.SphereGeometry(0.047, 8, 6), ink, 0, 0, 0, knee, false);
    add(cylG(0.045, 0.045, 0.37), ink, 0, -0.185, 0, knee);
    const shoe = add(new THREE.SphereGeometry(0.16, 18, 12), red, 0, -0.39, 0.08, knee); shoe.scale.set(0.9, 0.62, 1.45);
    const sole = add(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 18), ink, 0, -0.455, 0.08, knee); sole.scale.set(0.95, 1, 1.5);
    legs.push({hip, knee});
    // rubber-hose arms, steel bracers, white cartoon gloves
    const sh = new THREE.Group(); sh.position.set(s * 0.43, 1.12, 0); body.add(sh);
    add(cylG(0.04, 0.04, 0.32), ink, 0, -0.16, 0, sh);
    const el = new THREE.Group(); el.position.y = -0.32; sh.add(el);
    add(new THREE.SphereGeometry(0.042, 8, 6), ink, 0, 0, 0, el, false);
    add(cylG(0.04, 0.04, 0.24), ink, 0, -0.12, 0, el);
    add(cylG(0.075, 0.065, 0.12), metal, 0, -0.18, 0, el); add(new THREE.TorusGeometry(0.072, 0.014, 6, 16), gold, 0, -0.24, 0, el, false).rotation.x = Math.PI / 2;
    const hand = new THREE.Group(); hand.position.y = -0.33; el.add(hand);
    add(new THREE.TorusGeometry(0.075, 0.03, 8, 16), glove, 0, 0.04, 0, hand).rotation.x = Math.PI / 2;
    const palm = add(new THREE.SphereGeometry(0.1, 14, 10), glove, 0, -0.05, 0, hand); palm.scale.set(1, 1.05, 0.8);
    for (let f = 0; f < 3; f++) { const fi = add(new THREE.SphereGeometry(0.036, 10, 8), glove, -0.045 + f * 0.045, -0.14, 0.02, hand); fi.scale.y = 1.9; }
    const th = add(new THREE.SphereGeometry(0.035, 8, 6), glove, s * -0.08, -0.03, 0.05, hand); th.scale.y = 1.6;
    // torch in each hand
    const torch = new THREE.Group(); torch.position.set(0, -0.06, 0.08); hand.add(torch);
    const cup = add(new THREE.CylinderGeometry(0.11, 0.035, 0.26, 12, 1, true), new THREE.MeshPhongMaterial({color: S.body, side: THREE.DoubleSide, shininess: 60}), 0, -0.02, 0, torch); cup.rotation.x = Math.PI;
    add(cylG(0.035, 0.035, 0.18), red, 0, -0.17, 0, torch);
    const flame = new THREE.Group(); flame.position.y = -0.24; torch.add(flame);
    if (!R.flameGeo) { const fp = []; for (let i = 0; i <= 12; i++) { const k = i / 12; fp.push(new THREE.Vector2(Math.sin(Math.pow(k, 0.7) * Math.PI) * 0.11 * (1 - k * 0.35), k * 0.38)); } R.flameGeo = new THREE.LatheGeometry(fp, 14); }
    const f1 = add(R.flameGeo, glow(S.flame), 0, -0.02, 0, flame, false); f1.rotation.x = Math.PI;
    const f2 = add(R.flameGeo, glow(0xfff2b0), 0, -0.02, 0.01, flame, false); f2.rotation.x = Math.PI; f2.scale.set(0.55, 0.6, 0.55);
    for (const k of [-1, 1]) { const f3 = add(R.flameGeo, glow(S.flame), k * 0.07, 0.0, 0, flame, false); f3.rotation.set(Math.PI, 0, k * 0.5); f3.scale.set(0.45, 0.55, 0.45); }
    const fg = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), addGlow(S.flame, 0.35)); fg.position.y = -0.1; flame.add(fg);
    arms.push({sh, el, hand, torch, flame});
  }
  // the cloak: a cloth plane whose vertices wave in render()
  const cg = new THREE.PlaneGeometry(1.0, 1.25, 6, 10); cg.translate(0, -0.625, 0);
  const pos = cg.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i), v = -y / 1.25; pos.setX(i, pos.getX(i) * (0.85 + v * 0.55)); }
  cg.userData.base = Float32Array.from(pos.array);
  const cm = new THREE.MeshPhongMaterial({color: S.cloak, side: THREE.BackSide, shininess: 25, specular: 0x222222});
  const cloak = new THREE.Mesh(cg, cm); cloak.position.set(0, 1.36, -0.32); cloak.castShadow = true; body.add(cloak);
  const inner = new THREE.Mesh(cg, new THREE.MeshPhongMaterial({color: S.cloakIn, side: THREE.FrontSide, shininess: 20})); inner.position.copy(cloak.position); body.add(inner);
  // hidden orb slot (FLIX carries torches instead)
  const orb = new THREE.Group(); g.add(orb); orb.visible = false;
  const ball = new THREE.Object3D(), halo = new THREE.Mesh(new THREE.SphereGeometry(0.01), addGlow(S.flame, 0)); orb.add(ball); orb.add(halo);
  const core = new THREE.Object3D();
  const shd = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false})); shd.rotation.x = -Math.PI / 2; shd.position.y = 0.03; g.add(shd);
  g.scale.setScalar(1.3);
  return {g, body, legs, arms, scarf: [[], []], head, crown, face, faceMat, cloak, cloakGeo: cg, orb, ball, halo, core, coreS: core.scale.clone(), kind: 'flix'};
}
const SKINS = {
  kraliyet: {body: 0xe22511, cloak: 0x0a2a5e, cloakIn: 0x9a0f14, metal: 0xaab2c0, gold: 0xffc20e, flame: 0xff8a1a, glove: 0xfbf6ea},
  buzul: {body: 0x2f8fe0, cloak: 0xf4f8ff, cloakIn: 0x2d6cff, metal: 0xd8e8f8, gold: 0xffffff, flame: 0x9fe8ff, glove: 0xffffff},
  ejder: {body: 0x1a9a4a, cloak: 0x0a1a0a, cloakIn: 0xffc20e, metal: 0xffd86a, gold: 0xffe9a0, flame: 0x7dff6a, glove: 0xfff2c0},
  altin: {body: 0xffb81a, cloak: 0xfbf6ea, cloakIn: 0xe22511, metal: 0xfff2c0, gold: 0xffffff, flame: 0xffe06a, glove: 0xffffff},
  turkuaz: {body: 0x18c0b0, cloak: 0xffffff, cloakIn: 0x0b5a6a, metal: 0xe0fffa, gold: 0xffffff, flame: 0x8affea, glove: 0xffffff},
  tr: {body: 0xe30a17, cloak: 0xffffff, cloakIn: 0xe30a17, metal: 0xffffff, gold: 0xffffff, flame: 0xff4a4a, glove: 0xffffff},
  lav: {body: 0xff5a1a, cloak: 0x2a0a00, cloakIn: 0xffc20e, metal: 0x3a2a22, gold: 0xffd040, flame: 0xffa020, glove: 0x2a1a10},
  galaksi: {body: 0x5a2dd0, cloak: 0x0b0a2a, cloakIn: 0xff6af0, metal: 0xc8b8ff, gold: 0xffe0ff, flame: 0xb08aff, glove: 0xe8e0ff},
  gece: {body: 0x22262e, cloak: 0x0b0b0b, cloakIn: 0xffc20e, metal: 0xffc20e, gold: 0xffc20e, flame: 0xffc20e, glove: 0xffc20e},
  neon: {body: 0xff2d9a, cloak: 0x14062a, cloakIn: 0x2fe8ff, metal: 0x2fe8ff, gold: 0x2fe8ff, flame: 0xff6af0, glove: 0x2fe8ff},
};
function hero(skin, opt) {
  opt = opt || {};
  const H = buildFlix(SKINS[skin]);
  H.arms.forEach((a) => { a.torch.visible = false; });
  if (opt.noCloak) { H.cloak.visible = false; H.body.children.forEach((c) => { if (c.geometry === H.cloakGeo) c.visible = false; }); }
  if (opt.face) H.faceMat.map = R.flixFaces[opt.face];
  // bend the cloak a little so it is not a flat board
  const p = H.cloakGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); p.setZ(i, -Math.pow(-y, 1.4) * (opt.flow || 0.35) + Math.sin(x * 4 + y * 3) * 0.04 - Math.abs(x) * 0.12); }
  H.cloakGeo.computeVertexNormals();
  ink(H.g, 0.018, INKC, (m) => m === H.face || m.geometry === H.cloakGeo || m.material === H.faceMat);
  H.g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return H;
}
function pose(H, P) {
  const L = H.legs, A = H.arms;
  if (P.kickL !== undefined) { L[0].hip.rotation.x = -P.kickL; L[0].knee.rotation.x = P.kneeL || 0.25; }
  if (P.kickR !== undefined) { L[1].hip.rotation.x = -P.kickR; L[1].knee.rotation.x = P.kneeR || 0.25; }
  if (P.armL) { A[0].sh.rotation.set(P.armL[0], 0, -P.armL[1]); A[0].el.rotation.x = P.armL[2] || -0.6; }
  if (P.armR) { A[1].sh.rotation.set(P.armR[0], 0, P.armR[1]); A[1].el.rotation.x = P.armR[2] || -0.6; }
  if (P.lean) H.body.rotation.x = P.lean;
  if (P.tilt) H.body.rotation.z = P.tilt;
  if (P.squash) H.head.scale.set(1 + P.squash, 1 - P.squash, 1 + P.squash);
}

export { hero, pose, leafGeo };
