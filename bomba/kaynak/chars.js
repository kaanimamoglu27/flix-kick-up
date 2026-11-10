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
    M(capG(o.legR, o.legL), PM(o.leg), pv, 0, -o.legL * 0.5 - 0.02, 0);
    const shoe = M(sphG(0.17), PM(o.shoe, { roughness: 0.3, clearcoat: 0.8 }), pv, 0, -o.hipY + 0.11, 0.07); shoe.scale.set(0.95, 0.66, 1.45);
    const sole = M(sphG(0.17), PM(o.sole || 0xf6efe2, { roughness: 0.6 }), pv, 0, -o.hipY + 0.045, 0.07); sole.scale.set(0.98, 0.26, 1.48);
    legs.push(pv);
    const sh = new THREE.Group(); sh.position.set(s * o.armX, o.armY, 0); sh.rotation.z = s * 0.42; body.add(sh);
    M(capG(o.armR, o.armL), PM(o.arm), sh, 0, -o.armL * 0.5 - 0.03, 0);
    if (o.cuff) { const cf = M(new THREE.TorusGeometry(o.armR * 1.25, 0.03, 8, 18), PM(o.cuff), sh, 0, -o.armL - 0.07, 0); cf.rotation.x = Math.PI / 2; }
    const gl = M(sphG(0.125), PM(o.glove, { roughness: 0.35, clearcoat: 0.7 }), sh, 0, -o.armL - 0.17, 0); gl.scale.set(1, 1.05, 1.1);
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
function flixChar(S) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = 0.46, C = V3(0, 0.74, 0);
  M(sphG(R, 40, 28), PM(S.body, { roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.2 }), body, 0, C.y, 0);
  const eyes = [eye(body, R * 0.97, -0.36, 0.22, 0.125, S.iris, C), eye(body, R * 0.97, 0.36, 0.22, 0.125, S.iris, C)];
  brow(body, R * 1.01, -0.4, 0.62, 0.11, -0.28, 0x15121c, C, 0.03); brow(body, R * 1.01, 0.4, 0.62, 0.11, 0.28, 0x15121c, C, 0.03);
  smile(body, R * 0.995, 0, -0.2, 0.15, 0, C, true);
  for (const s of [-1, 1]) { const ck = M(sphG(1, 14, 10), PM(S.cheek, { roughness: 0.6 }), body); onSphere(ck, R * 0.985, s * 0.78, -0.08, C); ck.scale.set(0.07, 0.05, 0.02); ck.castShadow = false; }
  const crest = featherCrest(S.feathers, 0.62, 0.2); crest.position.set(0, C.y + R * 0.9, -0.02); body.add(crest);
  const L = limbs(g, body, { legX: 0.17, hipY: 0.36, legR: 0.085, legL: 0.1, leg: S.limb, shoe: S.shoe, armX: 0.44, armY: 0.84, armR: 0.065, armL: 0.14, arm: S.limb, glove: 0xffffff, cuff: S.cuff });
  const cp = cape(body, S.cape, C.y + 0.3, 0.8, 0.62, -0.36);
  return { g, body, legs: L.legs, arms: L.arms, eyes, cape: cp, crest, baseY: 0 };
}
// ---------- humanoid toy figure (Usta Wu, Kick, Flick) ----------
function human(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const torso = M(sphG(0.3, 28, 20), PM(o.shirt), body, 0, 0.66, 0); torso.scale.set(1, 1.08, 0.9);
  if (o.belt) { const b = M(new THREE.TorusGeometry(0.262, 0.045, 10, 28), PM(o.belt, { roughness: 0.3, metalness: o.beltMetal || 0 }), body, 0, 0.52, 0); b.rotation.x = Math.PI / 2; b.scale.set(1, 0.9, 1); }
  const head = new THREE.Group(); head.position.y = 1.0; body.add(head);
  const R = o.headR || 0.4, C = V3(0, 0.3, 0);
  const hm = M(sphG(R, 40, 28), PM(o.skin, { roughness: 0.42, clearcoat: 0.45 }), head, 0, C.y, 0); if (o.headS) hm.scale.set(...o.headS);
  const es = o.eyeS || 0.105;
  const eyes = [eye(head, R * 0.96, -0.36, 0.08, es, o.iris || 0x2f7fe0, C), eye(head, R * 0.96, 0.36, 0.08, es, o.iris || 0x2f7fe0, C)];
  const L = limbs(g, body, { legX: 0.14, hipY: 0.42, legR: 0.1, legL: 0.14, leg: o.pants, shoe: o.shoe, sole: o.sole, armX: 0.3, armY: 0.84, armR: 0.075, armL: 0.17, arm: o.sleeve || o.shirt, glove: o.glove, cuff: o.cuff });
  return { g, body, head, hc: C, R, legs: L.legs, arms: L.arms, eyes, baseY: 0 };
}
function wuChar() {
  const P = human({ skin: 0xf2c59a, shirt: 0x9c2424, sleeve: 0x9c2424, pants: 0x3a2a26, shoe: 0x1c1a20, sole: 0xe9e2d2, glove: 0xf2c59a, belt: 0xf4b400, iris: 0x4a2c16, eyeS: 0.085 });
  const { head, hc: C, R, body } = P, white = PM(0xfafafa, { roughness: 0.6, clearcoat: 0.15 });
  // robe skirt
  const sk = M(new THREE.CylinderGeometry(0.27, 0.4, 0.34, 28, 1, true), PM(0x9c2424, { side: THREE.DoubleSide }), body, 0, 0.38, 0);
  const hem = M(new THREE.TorusGeometry(0.4, 0.03, 8, 28), PM(0xf4b400, { roughness: 0.3 }), body, 0, 0.21, 0); hem.rotation.x = Math.PI / 2;
  // face
  const nose = M(sphG(0.065, 16, 12), PM(0xe9b084), head); onSphere(nose, R, 0, -0.06, C);
  brow(head, R * 1.0, -0.4, 0.4, 0.09, 0.3, 0xfafafa, C, 0.042); brow(head, R * 1.0, 0.4, 0.4, 0.09, -0.3, 0xfafafa, C, 0.042);
  for (const s of [-1, 1]) { const ms = M(capG(0.042, 0.16), white, head); onSphere(ms, R * 1.0, s * 0.27, -0.36, C); ms.rotateZ(s * 0.95); const ear = M(sphG(0.085, 14, 10), PM(0xf2c59a), head, s * R * 0.97, C.y - 0.02, 0); ear.scale.set(0.6, 1, 0.8); }
  const beard = new THREE.Group(); beard.position.set(0, C.y - 0.24, 0.24); head.add(beard);
  const bg = new THREE.LatheGeometry([[0, 0], [0.15, -0.03], [0.17, -0.14], [0.11, -0.38], [0.0, -0.58]].map((p) => new THREE.Vector2(p[0], p[1])), 20);
  const bm = M(bg, white, beard); bm.scale.set(1, 1, 0.62); beard.rotation.x = -0.12;
  // side hair + conical hat
  for (const s of [-1, 1]) { const h = M(sphG(0.15, 16, 12), white, head, s * 0.3, C.y + 0.02, -0.14); h.scale.set(0.7, 1.1, 1); }
  const hat = new THREE.Group(); hat.position.set(0, C.y + R * 0.62, 0); head.add(hat);
  M(new THREE.ConeGeometry(0.62, 0.3, 36), PM(0xe9c46a, { roughness: 0.7, clearcoat: 0.1 }), hat, 0, 0.15, 0);
  const band = M(new THREE.TorusGeometry(0.33, 0.028, 8, 32), PM(0x9c2424), hat, 0, 0.16, 0); band.rotation.x = Math.PI / 2;
  const rim = M(new THREE.TorusGeometry(0.61, 0.022, 8, 40), PM(0xb8893a, { roughness: 0.6 }), hat, 0, 0.01, 0); rim.rotation.x = Math.PI / 2;
  M(sphG(0.05, 12, 10), PM(0x9c2424), hat, 0, 0.31, 0);
  hat.rotation.x = -0.1;
  P.beard = beard; return P;
}
function kickChar() {
  const P = human({ skin: 0xffcf1a, shirt: 0xffcf1a, pants: 0xffcf1a, shoe: 0xe22511, glove: 0xe22511, cuff: 0xffffff, belt: 0xe22511, iris: 0x6b3b12, eyeS: 0.115 });
  const { head, hc: C, R, body } = P;
  // pointed hood
  const tip = M(new THREE.LatheGeometry([[0.3, 0], [0.26, 0.12], [0.15, 0.3], [0.05, 0.44], [0, 0.5]].map((p) => new THREE.Vector2(p[0], p[1])), 28), PM(0xffcf1a, { roughness: 0.42, clearcoat: 0.45 }), head, 0, C.y + R * 0.66, -0.03); tip.rotation.x = -0.18;
  M(sphG(0.07, 14, 10), PM(0xe22511, { roughness: 0.3, clearcoat: 0.8 }), head, 0, C.y + R * 0.66 + 0.5, -0.13);
  // red mask band behind the eyes
  const mask = M(sphG(R * 1.012, 36, 12, ), PM(0xe22511, { roughness: 0.35, clearcoat: 0.7 }), head, 0, C.y + 0.03, 0); mask.scale.set(1, 0.3, 1); mask.castShadow = false;
  brow(head, R * 1.03, -0.36, 0.44, 0.11, -0.45, 0x15121c, C, 0.034); brow(head, R * 1.03, 0.36, 0.44, 0.11, 0.45, 0x15121c, C, 0.034);
  smile(head, R * 0.995, 0, -0.42, 0.09, 0x5a1208, C);
  // star emblem
  const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.055 : 0.13, a = Math.PI / 2 + i * Math.PI / 5; st[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
  const star = M(new THREE.ExtrudeGeometry(st, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 }), PM(0xe22511, { roughness: 0.3, clearcoat: 0.8 }), body, 0, 0.72, 0.265); star.castShadow = false;
  P.cape = cape(body, 0xe22511, 0.9, 0.74, 0.62, -0.25);
  return P;
}
function flickChar() {
  const P = human({ skin: 0xffffff, shirt: 0xf5f7fc, pants: 0xf5f7fc, shoe: 0x1f5fbf, glove: 0x1f5fbf, cuff: 0x8fd0ff, iris: 0x1f5fbf, headR: 0.44, eyeS: 0.11 });
  const { head, hc: C, R, body } = P;
  smile(head, R * 0.995, 0, -0.26, 0.085, 0x5a1208, C);
  for (const s of [-1, 1]) { const ck = M(sphG(1, 14, 10), PM(0xff9db0, { roughness: 0.6 }), head); onSphere(ck, R * 0.985, s * 0.72, -0.2, C); ck.scale.set(0.065, 0.045, 0.02); ck.castShadow = false; }
  // swirl tuft
  const tuft = M(new THREE.LatheGeometry([[0.13, 0], [0.12, 0.08], [0.06, 0.2], [0, 0.26]].map((p) => new THREE.Vector2(p[0], p[1])), 20), PM(0x1f5fbf, { roughness: 0.35, clearcoat: 0.7 }), head, 0, C.y + R * 0.92, 0); tuft.rotation.z = -0.25;
  // striped scarf
  for (let i = 0; i < 3; i++) { const t = M(new THREE.TorusGeometry(0.2 + i * 0.012, 0.055, 10, 28), PM(i % 2 ? 0xffffff : 0x1f5fbf, { roughness: 0.6, clearcoat: 0.1 }), body, 0, 0.98 - i * 0.06, 0); t.rotation.x = Math.PI / 2; }
  const tail = new THREE.Group(); tail.position.set(0.16, 0.9, -0.16); body.add(tail);
  const tm = M(capG(0.055, 0.3), PM(0x1f5fbf, { roughness: 0.6 }), tail, 0, -0.18, 0); M(capG(0.056, 0.06), PM(0xffffff, { roughness: 0.6 }), tail, 0, -0.26, 0);
  tail.rotation.x = 0.5; P.cape = tail;
  const z = M(new THREE.BoxGeometry(0.02, 0.3, 0.02), PM(0x8fd0ff), body, 0, 0.62, 0.275); z.castShadow = false;
  return P;
}
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
function makeChar(id) {
  const P = id === 'wu' ? wuChar() : id === 'kick' ? kickChar() : id === 'flick' ? flickChar() : flixChar(FLIX_SKINS[id] || FLIX_SKINS.flix);
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
}
