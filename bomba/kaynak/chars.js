// ===== Flix Bomba characters: smooth, glossy toy-figure models (original Flix designs) =====
const TAU = Math.PI * 2;
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const MATC = {};
function PM(c, o) {
  const k = c + JSON.stringify(o || 0); if (MATC[k]) return MATC[k];
  return (MATC[k] = new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: 0.45, clearcoat: 0.5, clearcoatRoughness: 0.35 }, o || {})));
}
const GEO = {};
function sphG(r, w = 28, h = 20) { const k = 's' + r + '_' + w; return GEO[k] || (GEO[k] = new THREE.SphereGeometry(r, w, h)); }
function capG(r, l) { const k = 'c' + r + '_' + l; return GEO[k] || (GEO[k] = new THREE.CapsuleGeometry(r, l, 6, 16)); }
function M(geo, mat, par, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; if (par) par.add(m); return m; }
function sc(m, x, y, z) { m.scale.set(x, y === undefined ? x : y, z === undefined ? x : z); return m; }
function onSphere(obj, R, ax, ay, c) {
  const d = V3(Math.sin(ax) * Math.cos(ay), Math.sin(ay), Math.cos(ax) * Math.cos(ay));
  obj.position.copy(d).multiplyScalar(R); if (c) obj.position.add(c);
  obj.quaternion.setFromUnitVectors(V3(0, 0, 1), d); return obj;
}
const EYE_W = () => PM(0xffffff, { roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
const INK = () => PM(0x15121c, { roughness: 0.25, clearcoat: 1 });
function eye(par, R, ax, ay, s, iris, c) {
  const g = new THREE.Group(); onSphere(g, R, ax, ay, c); par.add(g);
  const rim = M(sphG(1), INK(), g); rim.scale.set(s * 1.1, s * 1.34, s * 0.3); rim.castShadow = false;
  const w = M(sphG(1), EYE_W(), g, 0, 0, s * 0.06); w.scale.set(s, s * 1.24, s * 0.36); w.castShadow = false;
  const lk = ax > 0 ? -1 : 1;
  const i = M(sphG(1), PM(iris, { roughness: 0.25, clearcoat: 1 }), g, lk * s * 0.14, -s * 0.08, s * 0.3); i.scale.set(s * 0.6, s * 0.78, s * 0.2); i.castShadow = false;
  const p = M(sphG(1), INK(), g, lk * s * 0.14, -s * 0.08, s * 0.4); p.scale.set(s * 0.33, s * 0.46, s * 0.14); p.castShadow = false;
  const h = M(sphG(1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), g, lk * s * 0.14 - s * 0.18, s * 0.24, s * 0.5); h.scale.setScalar(s * 0.15); h.castShadow = false;
  return g;
}
function brow(par, R, ax, ay, len, tilt, col, c, th) {
  const g = new THREE.Group(); onSphere(g, R, ax, ay, c); par.add(g);
  const b = M(capG(th || 0.028, len), PM(col, { roughness: 0.6 }), g); b.rotation.z = Math.PI / 2 + tilt; b.castShadow = false; return g;
}
function smile(par, R, ax, ay, r, col, c, open) {
  const g = new THREE.Group(); onSphere(g, R, ax, ay, c); par.add(g);
  if (open) {
    const sh = new THREE.Shape(); sh.moveTo(-r, 0); sh.quadraticCurveTo(0, r * 0.35, r, 0); sh.bezierCurveTo(r * 0.9, -r * 1.25, -r * 0.9, -r * 1.25, -r, 0);
    const m = M(new THREE.ExtrudeGeometry(sh, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 14 }), PM(0x5a0f18, { roughness: 0.4 }), g); m.castShadow = false;
    const t = M(sphG(1, 14, 10), PM(0xff6f86, { roughness: 0.4 }), g, 0, -r * 0.62, 0.02); t.scale.set(r * 0.5, r * 0.3, 0.02); t.castShadow = false;
    const te = M(new THREE.BoxGeometry(r * 1.3, r * 0.2, 0.02), PM(0xffffff, { roughness: 0.3 }), g, 0, -r * 0.03, 0.022); te.castShadow = false;
  } else {
    const m = M(new THREE.TorusGeometry(r, 0.02, 8, 20, Math.PI), PM(col, { roughness: 0.5 }), g); m.rotation.z = Math.PI; m.castShadow = false;
  }
  return g;
}
function featherGeo(L, W) {
  const k = 'f' + L + '_' + W; if (GEO[k]) return GEO[k];
  const s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(W * 1.05, L * 0.22, W * 0.8, L * 0.82, 0, L); s.bezierCurveTo(-W * 0.8, L * 0.82, -W * 1.05, L * 0.22, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 14 }); g.translate(0, 0, -0.015);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const t = Math.max(0, p.getY(i) / L); p.setZ(i, p.getZ(i) - t * t * L * 0.2); }
  g.computeVertexNormals(); return (GEO[k] = g);
}
// three feathers in a red collar (the FLIX toy's signature), used on Flix's head and on bombs
function featherCrest(cols, L, W) {
  const g = new THREE.Group(), fs = [];
  M(new THREE.CylinderGeometry(W * 0.62, W * 0.72, L * 0.2, 24), PM(0xe22511, { roughness: 0.3, clearcoat: 0.8 }), g, 0, L * 0.1, 0);
  const tor = M(new THREE.TorusGeometry(W * 0.64, L * 0.035, 10, 24), PM(0xffd41f, { roughness: 0.3 }), g, 0, L * 0.2, 0); tor.rotation.x = Math.PI / 2;
  cols.forEach((c, i) => {
    const pv = new THREE.Group(); pv.position.set((i - 1) * W * 0.3, L * 0.14, i === 1 ? -W * 0.12 : W * 0.06); pv.rotation.set(i === 1 ? -0.1 : 0.08, (i - 1) * 0.45, -(i - 1) * 0.42);
    M(featherGeo(L, W), PM(c, { roughness: 0.5, clearcoat: 0.25, sheen: 0.6, sheenColor: 0xffffff }), pv);
    const rib = M(capG(L * 0.016, L * 0.8), PM(0xffffff, { roughness: 0.5 }), pv, 0, L * 0.45, 0.02); rib.rotation.x = -0.2; rib.castShadow = false;
    g.add(pv); fs.push(pv); pv.userData.rz = pv.rotation.z;
  });
  g.userData.fs = fs; return g;
}
function limbs(g, body, o) {
  const legs = [], arms = [];
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * o.legX, o.hipY, 0); g.add(pv);
    M(capG(o.legR, o.legL), PM(o.leg, o.mat), pv, 0, -o.legL * 0.5 - 0.02, 0);
    const shoe = M(sphG(0.17), PM(o.shoe, { roughness: 0.3, clearcoat: 0.8 }), pv, 0, -o.hipY + 0.11, 0.07); shoe.scale.set(0.95, 0.66, 1.45);
    const sole = M(sphG(0.17), PM(o.sole || 0xf6efe2, { roughness: 0.6 }), pv, 0, -o.hipY + 0.045, 0.07); sole.scale.set(0.98, 0.26, 1.48);
    legs.push(pv);
    const sh = new THREE.Group(); sh.position.set(s * o.armX, o.armY, 0); sh.rotation.z = s * 0.42; body.add(sh);
    M(capG(o.armR, o.armL), PM(o.arm, o.mat), sh, 0, -o.armL * 0.5 - 0.03, 0);
    if (o.cuff) { const cf = M(new THREE.TorusGeometry(o.armR * 1.25, 0.03, 8, 18), PM(o.cuff), sh, 0, -o.armL - 0.07, 0); cf.rotation.x = Math.PI / 2; }
    const gl = M(sphG(0.125), PM(o.glove, { roughness: 0.35, clearcoat: 0.7 }), sh, 0, -o.armL - 0.17, 0); gl.scale.set(1, 1.05, 1.1).multiplyScalar(o.gloveS || 1);
    M(sphG(0.05, 12, 10), PM(o.glove, { roughness: 0.35, clearcoat: 0.7 }), sh, -s * 0.02, -o.armL - 0.14, 0.11);
    sh.userData.rz = sh.rotation.z; arms.push(sh);
  }
  return { legs, arms };
}
function cape(body, col, y, w, h, z) {
  const pv = new THREE.Group(); pv.position.set(0, y, z); body.add(pv);
  const sh = new THREE.Shape(); sh.moveTo(-w * 0.34, 0); sh.lineTo(w * 0.34, 0); sh.quadraticCurveTo(w * 0.62, -h * 0.6, w * 0.5, -h); sh.quadraticCurveTo(w * 0.25, -h * 0.9, 0, -h * 1.02); sh.quadraticCurveTo(-w * 0.25, -h * 0.9, -w * 0.5, -h); sh.quadraticCurveTo(-w * 0.62, -h * 0.6, -w * 0.34, 0);
  const m = M(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 10 }), PM(col, { roughness: 0.55, clearcoat: 0.2, side: THREE.DoubleSide }), pv);
  pv.rotation.x = 0.3; return pv;
}


// ---------- Flix: a living FLIX toy. Round body with the face on it, feather crest on top ----------
function flixChar(S, K) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = 0.46, C = V3(0, 0.74, 0), mat = K.mat;
  M(sphG(R, 40, 28), PM(S.body, Object.assign({ roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.2 }, mat)), body, 0, C.y, 0);
  if (K.belly) { const bl = M(sphG(R * 0.8, 28, 20), PM(K.belly, { roughness: 0.4, clearcoat: 0.6 }), body, 0, C.y - 0.1, 0.1); bl.scale.set(0.95, 1, 0.82); bl.castShadow = false; }
  const eyes = [eye(body, R * 0.97, -0.36, 0.22, 0.125, S.iris, C), eye(body, R * 0.97, 0.36, 0.22, 0.125, S.iris, C)];
  brow(body, R * 1.01, -0.4, 0.62, 0.11, -0.28, K.brow || 0x15121c, C, 0.03); brow(body, R * 1.01, 0.4, 0.62, 0.11, 0.28, K.brow || 0x15121c, C, 0.03);
  if (!K.noSmile) smile(body, R * 0.995, 0, -0.2, 0.15, 0, C, true);
  if (!K.noCheek) for (const s of [-1, 1]) { const ck = M(sphG(1, 14, 10), PM(S.cheek, { roughness: 0.6 }), body); onSphere(ck, R * 0.985, s * 0.78, -0.08, C); ck.scale.set(0.07, 0.05, 0.02); ck.castShadow = false; }
  let crest = null; const cs = K.crest === undefined ? 1 : K.crest;
  if (cs > 0) { crest = featherCrest(S.feathers, 0.62, 0.2); crest.position.set(0, C.y + R * 0.9, -0.02); crest.scale.setScalar(cs); body.add(crest); }
  const L = limbs(g, body, { legX: 0.17, hipY: 0.36, legR: 0.085, legL: 0.1, leg: S.limb, shoe: S.shoe, armX: 0.44, armY: 0.84, armR: 0.065, armL: 0.14, arm: S.limb, glove: S.glove || 0xffffff, cuff: S.cuff, mat });
  const cp = K.noCape ? null : cape(body, S.cape, C.y + 0.3, 0.8, 0.62, -0.36);
  return { g, body, legs: L.legs, arms: L.arms, eyes, cape: cp, crest, baseY: 0, an: [body, C, R, 0.22, C.y, -R * 0.86] };
}
// ---------- humanoid toy figure (Usta Wu, Kick, Flick) ----------
function human(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const torso = M(sphG(0.3, 28, 20), PM(o.shirt, o.mat), body, 0, 0.66, 0); torso.scale.set(1, 1.08, 0.9);
  if (o.belt) { const b = M(new THREE.TorusGeometry(0.262, o.beltR || 0.045, 10, 28), PM(o.belt, { roughness: 0.3, metalness: o.beltMetal || 0 }), body, 0, 0.52, 0); b.rotation.x = Math.PI / 2; b.scale.set(1, 0.9, 1); if (o.beltR) M(sphG(0.09, 14, 10), PM(o.belt, { roughness: 0.2, metalness: 0.9 }), body, 0, 0.52, 0.25).scale.set(1.2, 1, 0.4); }
  const head = new THREE.Group(); head.position.y = 1.0; body.add(head);
  const R = o.headR || 0.4, C = V3(0, 0.3, 0);
  M(sphG(R, 40, 28), PM(o.skin, Object.assign({ roughness: 0.42, clearcoat: 0.45 }, o.headMat)), head, 0, C.y, 0);
  const es = o.eyeS || 0.105;
  const eyes = [eye(head, R * 0.96, -0.36, 0.08, es, o.iris || 0x2f7fe0, C), eye(head, R * 0.96, 0.36, 0.08, es, o.iris || 0x2f7fe0, C)];
  const L = limbs(g, body, { legX: 0.14, hipY: 0.42, legR: 0.1, legL: 0.14, leg: o.pants, shoe: o.shoe, sole: o.sole, armX: 0.3, armY: 0.84, armR: 0.075, armL: 0.17, arm: o.sleeve || o.shirt, glove: o.glove, cuff: o.cuff, gloveS: o.gloveS, mat: o.mat });
  return { g, body, head, hc: C, R, legs: L.legs, arms: L.arms, eyes, baseY: 0, an: [head, C, R, 0.08, 0.7, -0.27] };
}
function wuChar(K) {
  const W = Object.assign({ robe: 0x9c2424, trim: 0xf4b400, hair: 0xfafafa, skin: 0xf2c59a, pants: 0x3a2a26, hat: 1 }, K.p);
  const P = human({ skin: W.skin, shirt: W.robe, sleeve: W.robe, pants: W.pants, shoe: 0x1c1a20, sole: 0xe9e2d2, glove: W.skin, belt: W.trim, iris: 0x4a2c16, eyeS: 0.085, mat: K.mat });
  const { head, hc: C, R, body } = P, white = PM(W.hair, { roughness: 0.6, clearcoat: 0.15 });
  M(new THREE.CylinderGeometry(0.27, 0.4, 0.34, 28, 1, true), PM(W.robe, Object.assign({ side: THREE.DoubleSide }, K.mat)), body, 0, 0.38, 0);
  const hem = M(new THREE.TorusGeometry(0.4, 0.03, 8, 28), PM(W.trim, { roughness: 0.3 }), body, 0, 0.21, 0); hem.rotation.x = Math.PI / 2;
  const nose = M(sphG(0.065, 16, 12), PM(W.nose || 0xe9b084), head); onSphere(nose, R, 0, -0.06, C);
  brow(head, R * 1.0, -0.4, 0.4, 0.09, 0.3, W.hair, C, 0.042); brow(head, R * 1.0, 0.4, 0.4, 0.09, -0.3, W.hair, C, 0.042);
  for (const s of [-1, 1]) { const ms = M(capG(0.042, 0.16), white, head); onSphere(ms, R * 1.0, s * 0.27, -0.36, C); ms.rotateZ(s * 0.95); if (!W.noEar) { const ear = M(sphG(0.085, 14, 10), PM(W.skin), head, s * R * 0.97, C.y - 0.02, 0); ear.scale.set(0.6, 1, 0.8); } }
  const beard = new THREE.Group(); beard.position.set(0, C.y - 0.24, 0.24); head.add(beard);
  const bg = new THREE.LatheGeometry([[0, 0], [0.15, -0.03], [0.17, -0.14], [0.11, -0.38], [0.0, -0.58]].map((p) => new THREE.Vector2(p[0], p[1])), 20);
  const bm = M(bg, white, beard); bm.scale.set(1, 1, 0.62); beard.rotation.x = -0.12;
  if (!W.bald) for (const s of [-1, 1]) { const h = M(sphG(0.15, 16, 12), white, head, s * 0.3, C.y + 0.02, -0.14); h.scale.set(0.7, 1.1, 1); }
  if (W.hat) { const hat = new THREE.Group(); hat.position.set(0, C.y + R * 0.62, 0); head.add(hat);
    M(new THREE.ConeGeometry(0.62, 0.3, 36), PM(W.hatCol || 0xe9c46a, { roughness: 0.7, clearcoat: 0.1 }), hat, 0, 0.15, 0);
    const band = M(new THREE.TorusGeometry(0.33, 0.028, 8, 32), PM(W.robe), hat, 0, 0.16, 0); band.rotation.x = Math.PI / 2;
    const rim = M(new THREE.TorusGeometry(0.61, 0.022, 8, 40), PM(0xb8893a, { roughness: 0.6 }), hat, 0, 0.01, 0); rim.rotation.x = Math.PI / 2;
    M(sphG(0.05, 12, 10), PM(W.robe), hat, 0, 0.31, 0); hat.rotation.x = -0.1; }
  P.beard = beard; return P;
}
function kickChar(K) {
  const Q = Object.assign({ suit: 0xffcf1a, acc: 0xe22511, hood: 1, mask: 1, star: 1, cape: 1, skin: 0xf2c59a, cuff: 0xffffff }, K.p), hs = Q.hood ? Q.suit : Q.skin;
  const P = human({ skin: hs, shirt: Q.shirt || Q.suit, pants: Q.pants || Q.suit, sleeve: Q.sleeve, shoe: Q.shoe || Q.acc, glove: Q.glove || Q.acc, cuff: Q.cuff, belt: Q.belt || Q.acc, beltR: Q.beltR, iris: 0x6b3b12, eyeS: 0.115, gloveS: Q.gloveS, mat: K.mat, headMat: Q.hood ? K.mat : null });
  const { head, hc: C, R, body } = P;
  if (Q.hood) { const tip = M(new THREE.LatheGeometry([[0.3, 0], [0.26, 0.12], [0.15, 0.3], [0.05, 0.44], [0, 0.5]].map((p) => new THREE.Vector2(p[0], p[1])), 28), PM(Q.suit, Object.assign({ roughness: 0.42, clearcoat: 0.45 }, K.mat)), head, 0, C.y + R * 0.66, -0.03); tip.rotation.x = -0.18;
    M(sphG(0.07, 14, 10), PM(Q.acc, { roughness: 0.3, clearcoat: 0.8 }), head, 0, C.y + R * 0.66 + 0.5, -0.13); }
  if (Q.mask) { const mask = M(sphG(R * 1.012, 36, 12), PM(Q.maskCol || Q.acc, { roughness: 0.35, clearcoat: 0.7 }), head, 0, C.y + 0.03, 0); mask.scale.set(1, 0.3, 1); mask.castShadow = false; }
  brow(head, R * 1.03, -0.36, 0.44, 0.11, -0.45, 0x15121c, C, 0.034); brow(head, R * 1.03, 0.36, 0.44, 0.11, 0.45, 0x15121c, C, 0.034);
  smile(head, R * 0.995, 0, -0.42, 0.09, 0x5a1208, C);
  if (Q.star) { const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.055 : 0.13, a = Math.PI / 2 + i * Math.PI / 5; st[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
    const star = M(new THREE.ExtrudeGeometry(st, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 }), PM(Q.starCol || Q.acc, { roughness: 0.3, clearcoat: 0.8 }), body, 0, 0.72, 0.265); star.castShadow = false; }
  if (Q.cape) P.cape = cape(body, Q.capeCol || Q.acc, 0.9, 0.74 * (Q.cape > 1 ? 1.25 : 1), 0.62 * (Q.cape > 1 ? 1.2 : 1), -0.25);
  return P;
}
function flickChar(K) {
  const F = Object.assign({ body: 0xf5f7fc, head: 0xffffff, acc: 0x1f5fbf, light: 0x8fd0ff, tuft: 1, scarf: 1 }, K.p);
  const P = human({ skin: F.head, shirt: F.body, pants: F.pants || F.body, shoe: F.acc, glove: F.acc, cuff: F.light, iris: F.iris || F.acc, headR: 0.44, eyeS: 0.11, mat: K.mat, headMat: K.headMat });
  const { head, hc: C, R, body } = P;
  smile(head, R * 0.995, 0, -0.26, 0.085, 0x5a1208, C);
  for (const s of [-1, 1]) { const ck = M(sphG(1, 14, 10), PM(0xff9db0, { roughness: 0.6 }), head); onSphere(ck, R * 0.985, s * 0.72, -0.2, C); ck.scale.set(0.065, 0.045, 0.02); ck.castShadow = false; }
  if (F.tuft) { const tuft = M(new THREE.LatheGeometry([[0.13, 0], [0.12, 0.08], [0.06, 0.2], [0, 0.26]].map((p) => new THREE.Vector2(p[0], p[1])), 20), PM(F.acc, { roughness: 0.35, clearcoat: 0.7 }), head, 0, C.y + R * 0.92, 0); tuft.rotation.z = -0.25; }
  const sc2 = F.scarf2 || 0xffffff;
  if (F.scarf) { for (let i = 0; i < 3; i++) { const t = M(new THREE.TorusGeometry(0.2 + i * 0.012, 0.055, 10, 28), PM(i % 2 ? sc2 : F.acc, { roughness: 0.6, clearcoat: 0.1 }), body, 0, 0.98 - i * 0.06, 0); t.rotation.x = Math.PI / 2; }
    const tail = new THREE.Group(); tail.position.set(0.16, 0.9, -0.16); body.add(tail); const tl = F.scarf > 1 ? 0.6 : 0.3;
    M(capG(0.055, tl), PM(F.acc, { roughness: 0.6 }), tail, 0, -tl * 0.6, 0); M(capG(0.056, 0.06), PM(sc2, { roughness: 0.6 }), tail, 0, -tl * 0.6 - 0.08, 0); tail.rotation.x = 0.5; P.cape = tail; }
  const z = M(new THREE.BoxGeometry(0.02, 0.3, 0.02), PM(F.light), body, 0, 0.62, 0.275); z.castShadow = false;
  return P;
}
// ---------- cosmetic accessories (skins). an = [head anchor, centre, radius, eye height angle, back y, back z] ----------
const EM = (c, i) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i === undefined ? 0.9 : i, roughness: 0.4 });
const GOLD = (c) => PM(c || 0xffc21a, { metalness: 0.9, roughness: 0.22 });
function addAcc(P, a) {
  const [par, C, R, eAy, by, bz] = P.an, n = a[0], c = a[1], top = C.y + R, body = P.body, NS = (m) => { m.castShadow = false; return m; };
  if (n === 'crown') { const g = new THREE.Group(); g.position.set(0, C.y + R * 0.74, 0); par.add(g);
    M(new THREE.CylinderGeometry(R * 0.66, R * 0.6, R * 0.32, 24, 1, true), PM(c || 0xffc21a, { metalness: 0.9, roughness: 0.22, side: THREE.DoubleSide }), g, 0, R * 0.16, 0);
    for (let i = 0; i < 6; i++) { const t = i / 6 * TAU; M(new THREE.ConeGeometry(R * 0.14, R * 0.36, 4), GOLD(c), g, Math.cos(t) * R * 0.63, R * 0.48, Math.sin(t) * R * 0.63); M(sphG(R * 0.075, 10, 8), PM(i % 2 ? 0xe22511 : 0x22a0ff, { roughness: 0.12, clearcoat: 1 }), g, Math.cos(t + 0.52) * R * 0.67, R * 0.17, Math.sin(t + 0.52) * R * 0.67); } }
  else if (n === 'tophat') { const g = new THREE.Group(); g.position.set(0, top - R * 0.12, 0); g.rotation.z = -0.12; par.add(g); M(new THREE.CylinderGeometry(R * 0.72, R * 0.72, R * 0.07, 28), PM(c || 0x15121c), g); M(new THREE.CylinderGeometry(R * 0.46, R * 0.44, R * 0.7, 28), PM(c || 0x15121c), g, 0, R * 0.36, 0); const b = M(new THREE.TorusGeometry(R * 0.45, R * 0.06, 8, 28), PM(a[2] || 0xe22511), g, 0, R * 0.1, 0); b.rotation.x = Math.PI / 2; }
  else if (n === 'pirate') { const g = new THREE.Group(); g.position.set(0, top - R * 0.2, 0); par.add(g); const h = M(sphG(R, 28, 16), PM(0x15121c, { roughness: 0.6 }), g); h.scale.set(1.25, 0.5, 0.7); const h2 = M(sphG(R, 28, 16), PM(0x15121c, { roughness: 0.6 }), g, 0, R * 0.12, R * 0.3); h2.scale.set(1.0, 0.62, 0.2); const tr = M(new THREE.TorusGeometry(R * 0.98, R * 0.045, 8, 32), GOLD(), g, 0, R * 0.04, 0); tr.rotation.x = Math.PI / 2; tr.scale.set(1.25, 0.7, 1); NS(M(sphG(R * 0.16, 12, 10), PM(0xffffff), g, 0, R * 0.2, R * 0.47)).scale.set(1, 1, 0.4); }
  else if (n === 'patch') { const p = NS(M(sphG(1, 14, 10), PM(0x15121c), par)); onSphere(p, R * 1.0, 0.36, eAy, C); p.scale.set(R * 0.36, R * 0.4, 0.05); const st = NS(M(new THREE.TorusGeometry(R * 1.005, 0.018, 6, 40), PM(0x15121c), par, 0, C.y, 0)); st.rotation.set(Math.PI / 2 - eAy - 0.25, 0, 0.5); }
  else if (n === 'band') { const y = C.y + R * 0.5, r = R * 0.9; const t = M(new THREE.TorusGeometry(r, R * 0.09, 8, 36), PM(c), par, 0, y, 0); t.rotation.x = Math.PI / 2; for (const s of [-1, 1]) { const tl = M(capG(R * 0.07, R * (a[2] || 0.5)), PM(c), par, s * 0.07, y - R * 0.2, -r - 0.03); tl.rotation.set(0.5, 0, s * 0.3); } }
  else if (n === 'helmet') { NS(M(sphG(R * 1.42, 36, 24), new THREE.MeshPhysicalMaterial({ color: 0xd8f2ff, transparent: true, opacity: 0.2, roughness: 0.03, clearcoat: 1, depthWrite: false }), par, 0, C.y + R * 0.1, 0)); const t = M(new THREE.TorusGeometry(R * 0.95, R * 0.11, 10, 36), PM(c || 0xdfe6f2, { metalness: 0.5, roughness: 0.3 }), par, 0, C.y - R * 0.92, 0); t.rotation.x = Math.PI / 2; }
  else if (n === 'antenna') { M(new THREE.CylinderGeometry(0.018, 0.018, R * 0.6, 8), PM(0x8f9cbd, { metalness: 0.8, roughness: 0.3 }), par, 0, top + R * 0.25, 0); NS(M(sphG(R * 0.13, 14, 10), EM(c || 0x22e0ff), par, 0, top + R * 0.58, 0)); }
  else if (n === 'horns') { for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(R * 0.15, R * (a[2] || 0.6), 14), a[3] ? EM(c, 0.7) : PM(c, { roughness: 0.3, clearcoat: 0.8 }), par, s * R * 0.58, C.y + R * 0.95, 0); h.rotation.z = -s * 0.55; } }
  else if (n === 'halo') { const t = NS(M(new THREE.TorusGeometry(R * 0.55, R * 0.06, 10, 36), EM(c || 0xffe14a), par, 0, top + R * (a[2] || 0.45), 0)); t.rotation.x = Math.PI / 2 - 0.15; }
  else if (n === 'ears') { for (const s of [-1, 1]) M(sphG(R * 0.3, 16, 12), PM(c), par, s * R * 0.72, C.y + R * 0.74, 0).scale.set(1, 1, 0.6); }
  else if (n === 'visor') { NS(M(sphG(R * 1.03, 36, 12), EM(c || 0x22e0ff, 0.8), par, 0, C.y + Math.sin(eAy) * R, 0)).scale.set(1, 0.2, 1); }
  else if (n === 'goggles') { const st = M(new THREE.TorusGeometry(R * 0.93, R * 0.06, 8, 36), PM(0x5a3a1a), par, 0, C.y + R * 0.42, 0); st.rotation.x = Math.PI / 2; for (const s of [-1, 1]) { const g = new THREE.Group(); onSphere(g, R * 1.0, s * 0.34, 0.5, C); par.add(g); M(new THREE.TorusGeometry(R * 0.2, R * 0.05, 8, 20), PM(0xb8893a, { metalness: 0.8, roughness: 0.3 }), g); NS(M(sphG(R * 0.19, 14, 10), PM(0x8fe8ff, { roughness: 0.05, clearcoat: 1 }), g)).scale.z = 0.35; } }
  else if (n === 'cap') { const g = new THREE.Group(); g.position.set(0, C.y + R * 0.1, 0); g.rotation.y = a[2] ? Math.PI : 0; par.add(g); M(new THREE.SphereGeometry(R * 1.05, 32, 14, 0, TAU, 0, Math.PI * 0.42), PM(c), g); const br = M(new THREE.CylinderGeometry(R * 0.62, R * 0.62, R * 0.07, 24), PM(a[3] || c), g, 0, R * 0.3, R * 0.85); br.scale.set(1, 1, 0.9); br.rotation.x = 0.15; M(sphG(R * 0.1, 10, 8), PM(a[3] || c), g, 0, R * 1.05, 0); }
  else if (n === 'phones') { const t = M(new THREE.TorusGeometry(R * 1.06, R * 0.07, 8, 28, Math.PI), PM(0x15121c), par, 0, C.y, 0); for (const s of [-1, 1]) { const e = M(new THREE.CylinderGeometry(R * 0.3, R * 0.3, R * 0.2, 20), PM(c || 0x22e0ff, { roughness: 0.3, clearcoat: 0.8 }), par, s * R * 1.02, C.y - R * 0.05, 0); e.rotation.z = Math.PI / 2; } }
  else if (n === 'kabuto') { M(new THREE.SphereGeometry(R * 1.08, 32, 14, 0, TAU, 0, Math.PI * 0.45), PM(c, { metalness: 0.6, roughness: 0.3 }), par, 0, C.y + R * 0.08, 0); const cr = M(new THREE.TorusGeometry(R * 0.5, R * 0.07, 8, 24, Math.PI), GOLD(), par, 0, C.y + R * 0.95, R * 0.55); cr.rotation.x = -0.3; for (const s of [-1, 1]) { const f = M(sphG(R * 0.5, 16, 12), PM(c, { metalness: 0.6, roughness: 0.3 }), par, s * R * 0.95, C.y + R * 0.1, -R * 0.1); f.scale.set(0.3, 0.9, 1); f.rotation.z = s * 0.35; } }
  else if (n === 'beak') { const g = new THREE.Group(); onSphere(g, R * 0.98, 0, a[2] === undefined ? -0.08 : a[2], C); par.add(g); const k = M(new THREE.ConeGeometry(R * (a[3] || 0.17), R * (a[4] || 0.42), 16), PM(c || 0xff8a1f, { roughness: 0.4, clearcoat: 0.5 }), g, 0, 0, R * (a[4] || 0.42) * 0.4); k.rotation.x = Math.PI / 2; }
  else if (n === 'spikes') { for (let i = 0; i < 5; i++) { const t = -0.9 + i * 0.5, s = 1 - Math.abs(i - 1.5) * 0.14; const k = M(new THREE.ConeGeometry(R * 0.13 * s, R * 0.55 * s, a[2] || 5), a[3] ? PM(c, { transparent: true, opacity: 0.85, roughness: 0.05, clearcoat: 1 }) : PM(c, { roughness: 0.3, clearcoat: 0.8 }), par, 0, C.y + Math.cos(t) * R * 1.1, -Math.sin(t) * R * 1.1 - 0.02); k.rotation.x = -t; } }
  else if (n === 'wings') { P.wings = []; for (const s of [-1, 1]) { const w = new THREE.Group(); w.position.set(s * 0.16, by + 0.12, bz); body.add(w); for (let i = 0; i < 3; i++) { const f = M(featherGeo(0.62 - i * 0.12, 0.17), PM(i === 1 ? (a[2] || 0xffffff) : c, { roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide }), w); f.rotation.set(0, 0, -s * (1.0 + i * 0.42)); f.position.z = -i * 0.02; } w.userData.s = s; P.wings.push(w); } }
  else if (n === 'jetpack') { P.flames = []; for (const s of [-1, 1]) { M(capG(0.11, 0.3), PM(c || 0xb8c4d6, { metalness: 0.8, roughness: 0.25 }), body, s * 0.14, by + 0.05, bz - 0.1); M(new THREE.ConeGeometry(0.09, 0.12, 14), PM(0xe22511), body, s * 0.14, by + 0.33, bz - 0.1); const f = NS(M(new THREE.ConeGeometry(0.08, 0.3, 12), EM(0xffa01f, 1.2), body, s * 0.14, by - 0.32, bz - 0.1)); f.rotation.x = Math.PI; P.flames.push(f); } }
  else if (n === 'katana') { const g = new THREE.Group(); g.position.set(0, by + 0.12, bz - 0.06); g.rotation.z = 0.75; body.add(g); M(new THREE.BoxGeometry(0.05, 0.85, 0.035), PM(0x2a2a34, { roughness: 0.4 }), g); M(new THREE.BoxGeometry(0.06, 0.24, 0.045), PM(c || 0xe22511), g, 0, 0.52, 0); M(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 14), GOLD(), g, 0, 0.4, 0); }
  else if (n === 'aura') { const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }); P.aura = new THREE.Group(); P.g.add(P.aura); const r1 = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 40), m); r1.rotation.x = -Math.PI / 2; r1.position.y = 0.035; P.aura.add(r1); for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), new THREE.MeshBasicMaterial({ color: c })); const t = i / 6 * TAU; sp.position.set(Math.cos(t) * 0.55, 0.25 + (i % 3) * 0.38, Math.sin(t) * 0.55); P.aura.add(sp); } }
  else if (n === 'ring') { const t = M(new THREE.TorusGeometry(R * 1.55, R * 0.05, 8, 48), GOLD(c), par, 0, C.y + R * 0.1, 0); t.rotation.set(Math.PI / 2 - 0.35, 0.2, 0); t.scale.set(1, 1, 0.5); const t2 = NS(M(new THREE.TorusGeometry(R * 1.32, R * 0.03, 8, 48), EM(a[2] || 0xff7ad6, 0.8), par, 0, C.y + R * 0.1, 0)); t2.rotation.copy(t.rotation); }
  else if (n === 'beads') { for (let i = 0; i < 12; i++) { const t = i / 12 * TAU; M(sphG(0.045, 10, 8), PM(c || 0x5a2a12, { roughness: 0.3, clearcoat: 0.8 }), body, Math.cos(t) * 0.24, 0.92 - Math.cos(t - Math.PI / 2) * 0.05 - 0.02, Math.sin(t) * 0.22); } }
  else if (n === 'panda') { for (const s of [-1, 1]) { const p = NS(M(sphG(1, 16, 12), PM(0x15121c, { roughness: 0.5 }), par)); onSphere(p, R * 0.975, s * 0.36, eAy - 0.02, C); p.scale.set(R * 0.36, R * 0.44, 0.03); p.rotateZ(-s * 0.4); } }
  else if (n === 'hair') { const h = M(new THREE.SphereGeometry(R * 1.04, 32, 14, 0, TAU, 0, Math.PI * 0.46), PM(c, { roughness: 0.7 }), par, 0, C.y + R * 0.06, -R * 0.06); h.rotation.x = -0.35; }
  else if (n === 'scarf') { const t = M(new THREE.TorusGeometry(R * 0.78, R * 0.13, 10, 28), PM(c, { roughness: 0.7 }), par, 0, C.y - R * 0.55, 0); t.rotation.x = Math.PI / 2; const tl = M(capG(R * 0.11, R * 0.5), PM(c, { roughness: 0.7 }), par, R * 0.5, C.y - R * 0.85, R * 0.62); tl.rotation.z = 0.2; }
  else if (n === 'bolt') { const sh = new THREE.Shape(); [[0.05, 0.3], [-0.1, 0.02], [-0.01, 0.02], [-0.06, -0.3], [0.11, 0.04], [0.02, 0.04]].forEach((p, i) => sh[i ? 'lineTo' : 'moveTo'](p[0], p[1])); sh.closePath(); for (const s of [-1, 1]) { const b = NS(M(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), EM(c || 0xffe14a, 1), par, s * R * 0.75, C.y + R * 1.05, -0.015)); b.rotation.z = -s * 0.5; b.scale.setScalar(R * 2.2); } }
  else if (n === 'star') { const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.07 : 0.17, t = Math.PI / 2 + i * Math.PI / 5; st[i ? 'lineTo' : 'moveTo'](Math.cos(t) * r, Math.sin(t) * r); } st.closePath(); NS(M(new THREE.ExtrudeGeometry(st, { depth: 0.04, bevelEnabled: false }), EM(c || 0xffe14a, 1), par, 0, top + R * 0.42, -0.02)); }
}
const RAR = ['c', 'c', 'c', 'r', 'r', 'e', 'e', 'l'], RAR_COL = { c: '#8f9cbd', r: '#1f9ee8', e: '#8a4bff', l: '#f4a900' }, RAR_PRICE = [0, 300, 300, 1000, 1000, 2500, 2500, 6000];
const SKINS = {
  flix: [
    { n: ['Klasik', 'Classic'] },
    { n: ['Limon', 'Lemon'], p: { body: 0xffd41f, iris: 0x2a7a1a, cheek: 0xffa01f, limb: 0x1f7a3a, shoe: 0xe22511, cuff: 0xffffff, cape: 0x1f7a3a, feathers: [0x2fa043, 0xffffff, 0x9be04b] } },
    { n: ['Gece', 'Midnight'], p: { body: 0x1b2a5c, iris: 0x22e0ff, cheek: 0x3a4f9a, limb: 0x0c1230, shoe: 0x22e0ff, cuff: 0x22e0ff, cape: 0x0c1230, feathers: [0x22e0ff, 0x8a4bff, 0xffffff] } },
    { n: ['Korsan', 'Pirate'], p: { body: 0xc23a1c, limb: 0x2a1a12, shoe: 0x15121c, cuff: 0xffc21a, cape: 0x15121c, feathers: [0xe22511, 0xffffff, 0xe22511] }, crest: 0, a: [['pirate'], ['patch'], ['katana', 0xffc21a]] },
    { n: ['Astronot', 'Astronaut'], p: { body: 0xf4f7fb, iris: 0x1f6fe0, cheek: 0xffb3a6, limb: 0xdfe6f2, shoe: 0xff8a1f, cuff: 0xff8a1f, feathers: [0xff8a1f, 0x1f6fe0, 0xffffff] }, crest: 0.5, noCape: 1, a: [['helmet'], ['jetpack', 0xdfe6f2]] },
    { n: ['Ninja', 'Ninja'], p: { body: 0x1c1c24, iris: 0xffffff, cheek: 0x1c1c24, limb: 0x1c1c24, shoe: 0x8a0f0f, cuff: 0xe22511, cape: 0x8a0f0f, glove: 0x1c1c24, feathers: [0xe22511, 0x1c1c24, 0xe22511] }, noSmile: 1, noCheek: 1, brow: 0xe22511, a: [['band', 0xe22511, 0.8], ['katana']] },
    { n: ['Robot', 'Robot'], p: { body: 0xb8c4d6, iris: 0x22e0ff, limb: 0x5a6680, shoe: 0x22e0ff, cuff: 0x22e0ff, glove: 0x8f9cbd, feathers: [0x22e0ff, 0xffffff, 0x22e0ff] }, mat: { metalness: 0.85, roughness: 0.25 }, crest: 0, noCape: 1, noCheek: 1, a: [['antenna', 0x22e0ff], ['visor', 0x22e0ff], ['jetpack', 0x5a6680]] },
    { n: ['Altın Kral', 'Golden King'], p: { body: 0xffc21a, iris: 0x7a1fa8, cheek: 0xff9a1f, limb: 0x7a1fa8, shoe: 0xffc21a, cuff: 0xffffff, cape: 0x7a1fa8, feathers: [0xffffff, 0xffe38a, 0xffffff] }, mat: { metalness: 0.8, roughness: 0.22 }, a: [['crown'], ['aura', 0xffd41f]] },
  ],
  wu: [
    { n: ['Klasik', 'Classic'] },
    { n: ['Yeşil Çay', 'Green Tea'], p: { robe: 0x2f7a3a, trim: 0xf4e3a0 } },
    { n: ['Okyanus', 'Ocean'], p: { robe: 0x1f5fbf, trim: 0xffffff, hatCol: 0xf2f2f2 } },
    { n: ['Samuray', 'Samurai'], p: { robe: 0x2a2a34, trim: 0xe22511, pants: 0x15121c, hat: 0, bald: 1 }, a: [['kabuto', 0x2a2a34], ['katana', 0xe22511]] },
    { n: ['Keşiş', 'Monk'], p: { robe: 0xf08a1f, trim: 0x8a1a1a, hat: 0, bald: 1 }, a: [['beads', 0x5a2a12], ['halo', 0xffe14a, 0.3]] },
    { n: ['Panda', 'Panda'], p: { robe: 0x1c1c24, trim: 0x6cc22c, skin: 0xffffff, nose: 0x15121c, pants: 0x1c1c24, hat: 0, bald: 1, noEar: 1 }, a: [['ears', 0x15121c], ['panda']] },
    { n: ['Ejder Usta', 'Dragon Master'], p: { robe: 0x0f6b5a, trim: 0xffc21a, hair: 0x7fffd4, hat: 0 }, a: [['horns', 0xffc21a, 0.7], ['spikes', 0x7fffd4], ['aura', 0x3dffb0]] },
    { n: ['Altın İmparator', 'Golden Emperor'], p: { robe: 0xffc21a, trim: 0xe22511, hat: 0, bald: 1 }, mat: { metalness: 0.8, roughness: 0.22 }, a: [['crown', 0xffd41f], ['aura', 0xffd41f], ['wings', 0xffe38a, 0xffffff]] },
  ],
  kick: [
    { n: ['Klasik', 'Classic'] },
    { n: ['Kırmızı Şimşek', 'Red Flash'], p: { suit: 0xe22511, acc: 0xffcf1a, cuff: 0xffcf1a } },
    { n: ['Yeşil Saha', 'Green Pitch'], p: { suit: 0x2fa043, acc: 0xffffff, maskCol: 0x15121c } },
    { n: ['Futbolcu', 'Footballer'], p: { hood: 0, mask: 0, cape: 0, star: 0, shirt: 0xe22511, sleeve: 0xffffff, pants: 0xffffff, acc: 0x15121c, glove: 0xf2c59a, shoe: 0x15121c, belt: 0xffffff }, a: [['hair', 0x3a2414], ['band', 0xffffff, 0.3]] },
    { n: ['Süper Kahraman', 'Superhero'], p: { suit: 0x1f5fbf, acc: 0xe22511, maskCol: 0x15121c, cape: 2, starCol: 0xffd41f }, a: [['horns', 0x1f5fbf, 0.45]] },
    { n: ['Boksör', 'Boxer'], p: { hood: 0, mask: 0, cape: 0, star: 0, shirt: 0xf2c59a, sleeve: 0xf2c59a, pants: 0xe22511, acc: 0xe22511, gloveS: 1.75, belt: 0xffc21a, beltR: 0.07, shoe: 0x15121c }, a: [['band', 0xe22511, 0.5], ['hair', 0x15121c]] },
    { n: ['Siber', 'Cyber'], p: { suit: 0x15121c, acc: 0x22e0ff, mask: 0, capeCol: 0x0c1230, starCol: 0x22e0ff, cuff: 0x22e0ff }, mat: { metalness: 0.6, roughness: 0.3 }, a: [['visor', 0x22e0ff], ['antenna', 0x22e0ff], ['jetpack', 0x2a2a34]] },
    { n: ['Yıldırım', 'Thunder'], p: { suit: 0xffffff, acc: 0xffc21a, maskCol: 0xffc21a, cape: 2, capeCol: 0xffc21a, cuff: 0xffc21a }, mat: { metalness: 0.35, roughness: 0.25 }, a: [['bolt', 0xffe14a], ['aura', 0xffe14a]] },
  ],
  flick: [
    { n: ['Klasik', 'Classic'] },
    { n: ['Çilek', 'Strawberry'], p: { acc: 0xff3d7f, light: 0xffb3cc, body: 0xfff0f4 } },
    { n: ['Limon', 'Lemon'], p: { acc: 0xf4a900, light: 0xffe38a, body: 0xfff8d6, scarf2: 0x2fa043 } },
    { n: ['Pilot', 'Pilot'], p: { body: 0x8a5a2a, pants: 0x4a3a2a, acc: 0x5a3a1a, light: 0xffc21a, tuft: 0, scarf2: 0xffffff, scarf: 2 }, a: [['cap', 0x8a5a2a, 0, 0x5a3a1a], ['goggles']] },
    { n: ['DJ', 'DJ'], p: { body: 0x8a4bff, pants: 0x2a1a5a, acc: 0x22e0ff, light: 0xff2bd6, tuft: 0, scarf: 0 }, a: [['cap', 0x15121c, 1, 0xff2bd6], ['phones', 0xff2bd6]] },
    { n: ['Rüzgâr Ninja', 'Wind Ninja'], p: { body: 0x0f4f5a, head: 0xe9f7f5, acc: 0x15c7b0, light: 0x15c7b0, tuft: 0, scarf: 2, scarf2: 0x0f4f5a }, a: [['band', 0x15c7b0, 0.9], ['katana', 0x15c7b0]] },
    { n: ['Roket', 'Rocket'], p: { body: 0xe9eef5, acc: 0xff8a1f, light: 0xff8a1f, tuft: 0, scarf: 0 }, mat: { metalness: 0.7, roughness: 0.25 }, a: [['helmet', 0xff8a1f], ['jetpack', 0xb8c4d6]] },
    { n: ['Galaksi', 'Galaxy'], p: { body: 0x2a1466, head: 0x3b1f8f, acc: 0xff7ad6, light: 0x22e0ff, iris: 0x22e0ff, tuft: 0, scarf: 0 }, mat: { emissive: 0x5a2aff, emissiveIntensity: 0.45, roughness: 0.25 }, headMat: { emissive: 0x5a2aff, emissiveIntensity: 0.35 }, a: [['ring', 0xffc21a, 0xff7ad6], ['star', 0xffe14a], ['aura', 0xb06bff]] },
  ],
  buzul: [
    { n: ['Klasik', 'Classic'] },
    { n: ['Nane', 'Mint'], p: { body: 0x3fd6a8, iris: 0x0b5a44, cheek: 0xbfffe8, shoe: 0x0b5a44, cuff: 0xbfffe8, feathers: [0xffffff, 0xbfffe8, 0x3fd6a8] } },
    { n: ['Derin Mavi', 'Deep Blue'], p: { body: 0x123a8a, iris: 0x7fd0ff, cheek: 0x2f5fc0, limb: 0x7fd0ff, shoe: 0xffffff, cuff: 0x7fd0ff, cape: 0x0b2f66, feathers: [0x22e0ff, 0x123a8a, 0x22e0ff] } },
    { n: ['Kardan Adam', 'Snowman'], p: { body: 0xffffff, iris: 0x15121c, cheek: 0xffc2c2, limb: 0x5a3a1a, shoe: 0x15121c, cuff: 0xe22511, glove: 0xe22511 }, crest: 0, noCape: 1, a: [['tophat', 0x15121c, 0xe22511], ['beak', 0xff8a1f, 0.02, 0.1, 0.6], ['scarf', 0xe22511]] },
    { n: ['Penguen', 'Penguin'], p: { body: 0x1c1c28, iris: 0x15121c, limb: 0x1c1c28, shoe: 0xff8a1f, cuff: 0xffffff, glove: 0x1c1c28, cape: 0x1c1c28, feathers: [0xffd41f, 0x1c1c28, 0xffd41f] }, belly: 0xffffff, noSmile: 1, noCheek: 1, crest: 0.55, a: [['beak', 0xff8a1f, -0.12, 0.2, 0.36]] },
    { n: ['Kristal', 'Crystal'], p: { body: 0x9fe8ff, iris: 0x1f6fe0, cheek: 0xffffff, limb: 0xdff7ff, shoe: 0x1f9ee8, cuff: 0xffffff, cape: 0xdff7ff }, mat: { transparent: true, opacity: 0.82, roughness: 0.04, metalness: 0.15 }, crest: 0, noCape: 1, a: [['spikes', 0xbff2ff, 5, 1], ['horns', 0xbff2ff, 0.5]] },
    { n: ['Kutup Işığı', 'Aurora'], p: { body: 0x16264a, iris: 0x3dffb0, cheek: 0x2a4a7a, limb: 0x0c1830, shoe: 0x3dffb0, cuff: 0x8a4bff, cape: 0x5a2aa8, feathers: [0x3dffb0, 0x8a4bff, 0x22e0ff] }, mat: { emissive: 0x1fd69a, emissiveIntensity: 0.3 }, a: [['halo', 0x3dffb0], ['aura', 0x3dffb0]] },
    { n: ['Buz Ejderi', 'Ice Dragon'], p: { body: 0x2f6fea, iris: 0xffffff, cheek: 0x7fb0ff, limb: 0x123a8a, shoe: 0xffffff, cuff: 0xffffff, glove: 0xdff7ff }, mat: { metalness: 0.5, roughness: 0.2 }, crest: 0, noCape: 1, brow: 0xffffff, a: [['horns', 0xffffff, 0.75], ['spikes', 0xdff7ff, 4], ['wings', 0x7fd0ff, 0xffffff], ['aura', 0x7fd0ff]] },
  ],
};
const FLIX_SKINS = {
  flix: { body: 0xe22511, belly: 0xff5a3c, iris: 0x1f6fe0, cheek: 0xff8f7a, limb: 0x022753, shoe: 0xffd41f, cuff: 0xffd41f, cape: 0x022753, feathers: [0x2a80dc, 0x2fa043, 0xffd41f] },
  buzul: { body: 0x2f9bea, belly: 0x7fd0ff, iris: 0x0b3f8a, cheek: 0xbfe8ff, limb: 0xffffff, shoe: 0x0b3f8a, cuff: 0xbfe8ff, cape: 0xf4f9ff, feathers: [0xffffff, 0xbfe8ff, 0x7fd0ff] },
};
const CHARS = [
  { id: 'flix', name: 'Flix', col: '#e22511', spd: 3.8, bombs: 1, range: 2, cd: 7, abil: 'Uzaktan Patlat', icon: '⚡', desc: 'Kendi bombalarını istediği an patlatır.', tag: 'Dengeli kahraman' },
  { id: 'wu', name: 'Usta Wu', col: '#9c2424', spd: 3.4, bombs: 1, range: 3, cd: 16, abil: 'Zen Kalkanı', icon: '🛡', desc: '3 saniye boyunca hiçbir patlama ona işlemez.', tag: 'Ağır ama güçlü' },
  { id: 'kick', name: 'Kick', col: '#f4b400', spd: 3.8, bombs: 1, range: 2, cd: 2.5, abil: 'Süper Tekme', icon: '👟', desc: 'Bombayı tekmeler, bomba duvara kadar kayar. Bombaya yürüyünce de iter.', tag: 'Bomba tekmecisi' },
  { id: 'flick', name: 'Flick', col: '#1f5fbf', spd: 4.3, bombs: 2, range: 2, cd: 7, abil: 'Fiske Atılışı', icon: '💨', desc: 'Baktığı yöne 3 kare fırlar, bombaların üstünden geçer.', tag: 'En hızlısı' },
  { id: 'buzul', name: 'Buzul Flix', col: '#2f9bea', spd: 3.6, bombs: 1, range: 2, cd: 15, abil: 'Dondur', icon: '❄', desc: 'Yakındaki rakipleri 2,5 saniye dondurur.', tag: 'Soğukkanlı' },
];
function makeChar(id, sk) {
  const L = SKINS[id] || SKINS.flix, K = L[sk | 0] || L[0];
  const P = id === 'wu' ? wuChar(K) : id === 'kick' ? kickChar(K) : id === 'flick' ? flickChar(K) : flixChar(Object.assign({}, FLIX_SKINS[id] || FLIX_SKINS.flix, K.p), K);
  for (const a of K.a || []) addAcc(P, a);
  P.blinkT = 1 + Math.random() * 3; return P;
}
// st: {t, move 0..1, win, hurt}
function animChar(P, dt, st) {
  const w = st.t * 12, mv = st.move, s = Math.sin(w) * mv;
  P.legs[0].rotation.x = s * 0.95; P.legs[1].rotation.x = -s * 0.95;
  if (st.win) {
    const k = Math.sin(st.t * 10);
    P.arms[0].rotation.set(0, 0, -(2.5 + k * 0.25)); P.arms[1].rotation.set(0, 0, 2.5 - k * 0.25);
    P.body.position.y = Math.abs(Math.sin(st.t * 6)) * 0.22;
  } else {
    P.arms[0].rotation.set(-s * 0.85, 0, P.arms[0].userData.rz); P.arms[1].rotation.set(s * 0.85, 0, P.arms[1].userData.rz);
    P.body.position.y = Math.abs(Math.cos(w)) * 0.05 * mv + Math.sin(st.t * 2.6) * 0.014;
  }
  P.body.rotation.x = mv * 0.13;
  if (P.head) P.head.rotation.z = Math.sin(st.t * 1.7) * 0.03;
  if (P.cape) P.cape.rotation.x = 0.28 + mv * 0.55 + Math.sin(st.t * 9) * 0.06 * (0.4 + mv);
  if (P.beard) P.beard.rotation.x = -0.12 + mv * 0.3 + Math.sin(st.t * 8) * 0.05 * mv;
  if (P.crest) for (const f of P.crest.userData.fs) f.rotation.z = f.userData.rz + Math.sin(st.t * 3 + f.userData.rz * 4) * 0.05 + s * 0.06;
  P.blinkT -= dt; const bl = P.blinkT < 0.1 ? 0.12 : 1; if (P.blinkT < 0) P.blinkT = 1.6 + Math.random() * 3;
  for (const e of P.eyes) e.scale.y = bl;
  if (P.aura) { P.aura.rotation.y = st.t * 1.6; P.aura.children[0].scale.setScalar(1 + Math.sin(st.t * 4) * 0.08); }
  if (P.wings) for (const w of P.wings) w.rotation.y = w.userData.s * (0.25 + Math.sin(st.t * (5 + mv * 8)) * 0.3);
  if (P.flames) for (const f of P.flames) f.scale.set(1, 0.7 + Math.random() * 0.6 + mv * 0.6, 1);
}
