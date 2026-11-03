// ================= WORLD BUILDING (v3) =================
function facadeBlock(g, P) {
  const along = P.face === '+x' || P.face === '-x' ? P.z1 - P.z0 : P.x1 - P.x0, h = P.h, base = P.base || 0.22;
  const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.07).getHex(), 0.9), roof = std(0x9a6a56, 0.9);
  const ft = new THREE.MeshStandardMaterial({map: facadeTex(along, h, P), roughness: 0.85});
  const mats = [side, side, roof, side, side, side]; mats[{'+x': 0, '-x': 1, '+z': 4, '-z': 5}[P.face]] = ft;
  const m = new THREE.Mesh(BOX, mats); m.scale.set(P.x1 - P.x0, h, P.z1 - P.z0); m.position.set((P.x0 + P.x1) / 2, base + h / 2, (P.z0 + P.z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  boxes.push({b: [P.x0, P.x1, base - 2, base + h, P.z0, P.z1], kind: 'hard'});
  const cm = std(0xf4eee2, 0.8), T = 0.16; // cornice around the roof
  addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z0, P.z0 + T, false); addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z1 - T, P.z1, false);
  addBox(g, cm, P.x0, P.x0 + T, base + h, base + h + 0.24, P.z0, P.z1, false); addBox(g, cm, P.x1 - T, P.x1, base + h, base + h + 0.24, P.z0, P.z1, false);
  if (P.chim) { const cx = (P.x0 + P.x1) / 2 + 0.3, cz = (P.z0 + P.z1) / 2; addBox(g, std(0xc0603e, 0.9), cx - 0.25, cx + 0.25, base + h, base + h + 0.9, cz - 0.25, cz + 0.25, false); }
  // the building's foundation below the street so the diorama has no holes
  addBox(g, std(0x9a8a7a, 1), P.x0 + 0.05, P.x1 - 0.05, base - 1.2, base, P.z0 + 0.05, P.z1 - 0.05, false);
}
const plankTex = ctex(128, 128, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(28,${40 + srnd(0, 10)}%,${46 + srnd(0, 10)}%)`; x.fillRect(0, i * 16, w, 15); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, i * 16 + 15, w, 1); } });
plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
function buildGround3() {
  const g = new THREE.Group(); world.add(g);
  for (const I of LV.islands) {
    if (I.d < 0.05 || I.w < 0.05) continue;
    const x0 = I.x - I.w / 2, x1 = I.x + I.w / 2, z0 = I.z - I.d / 2, z1 = I.z + I.d / 2;
    const src = I.kind === 'road' ? roadTex : I.kind === 'bridge' ? plankTex : paveTex;
    const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / 2, I.d / 2);
    addBox(g, new THREE.MeshStandardMaterial({map: t, roughness: 0.95}), x0, x1, I.top - 0.25, I.top, z0, z1);
    if (I.kind === 'bridge') {
      const rm = std(0x6b3f26, 0.8); for (const sx of [x0, x1 - 0.08]) { addBox(g, rm, sx, sx + 0.08, I.top + 0.55, I.top + 0.62, z0, z1, false); for (let z = z0; z <= z1; z += 1.1) addBox(g, rm, sx, sx + 0.08, I.top, I.top + 0.6, z, z + 0.08, false); }
      boxes.push({b: [x0 - 0.1, x0 + 0.02, I.top, I.top + 0.6, z0, z1], kind: 'soft'}, {b: [x1 - 0.02, x1 + 0.1, I.top, I.top + 0.6, z0, z1], kind: 'soft'});
      continue;
    }
    addBox(g, std(I.kind === 'road' ? 0x3c3f48 : 0xb9b2a6, 0.95), x0 + 0.01, x1 - 0.01, I.top - 1.0, I.top - 0.25, z0 + 0.01, z1 - 0.01);
    addBox(g, std(0x8a6a50, 1), x0 + 0.15, x1 - 0.15, I.top - 2.0, I.top - 1.0, z0 + 0.15, z1 - 0.15, false);
    if (I.kind === 'road') { // lane dashes
      const lm = std(0xf4eee2, 0.6);
      if (I.ax === 'x') for (let x = x0 + 0.5; x < x1 - 0.8; x += 2.2) addBox(g, lm, x, x + 1.1, I.top, I.top + 0.015, I.z - 0.06, I.z + 0.06, false);
      else for (let z = z1 - 0.5; z > z0 + 0.8; z -= 2.2) addBox(g, lm, I.x - 0.06, I.x + 0.06, I.top, I.top + 0.015, z - 1.1, z, false);
    }
    if (I.w * I.d > 30) { const r = mesh(new THREE.ConeGeometry(Math.min(I.w, I.d) * 0.45, 3.4, 7), std(0x7a5a46, 1), I.x, I.top - 3.7, I.z, g, false); r.rotation.x = Math.PI; r.scale.set(I.w > I.d ? I.w / I.d : 1, 1, I.d > I.w ? Math.min(4, I.d / I.w) : 1); }
  }
  ink(g, 0.03);
}
function prop3(P, top, g) {
  if (P.t === 'bld') { facadeBlock(g, P); return true; }
  if (P.t === 'car' && P.ax === 'z') { // a car parked along a z street: swap the axes of the x-car
    const c = std(P.col, 0.35, 0.2), dk = std(0x1b1330, 0.6), gl = std(0x8fc4dc, 0.15, 0.3);
    addBox(g, c, P.x - 0.6, P.x + 0.6, top + 0.25, top + 0.95, P.z - 1.2, P.z + 1.2);
    addBox(g, c, P.x - 0.52, P.x + 0.52, top + 0.95, top + 1.5, P.z - 0.5, P.z + 0.6);
    addBox(g, gl, P.x - 0.54, P.x + 0.54, top + 1.0, top + 1.42, P.z - 0.45, P.z + 0.55, false);
    for (const [a, b] of [[-0.55, -0.75], [0.55, -0.75], [-0.55, 0.75], [0.55, 0.75]]) { const w = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 14), dk, P.x + a, top + 0.27, P.z + b, g); w.rotation.z = Math.PI / 2; }
    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xe22511 : 0xfff1b0, 0.3), P.x + 0.4, top + 0.7, P.z + a * 1.2, g);
    return true;
  }
  if (P.t === 'zebra') { const zm = std(0xf4eee2, 0.6); for (let k = -1.35; k < 1.4; k += 0.5) { if (P.ax === 'x') addBox(g, zm, P.x - 0.75, P.x + 0.75, top, top + 0.012, P.z + k, P.z + k + 0.28, false); else addBox(g, zm, P.x + k, P.x + k + 0.28, top, top + 0.012, P.z - 0.75, P.z + 0.75, false); } return true; }
  if (P.t === 'stall') { // market stall: striped roof on posts (bouncy), table with goods
    const ax = P.ax === 'x', w = ax ? 1.4 : 2.2, d = ax ? 2.2 : 1.4, h = 2.0, sc = P.col;
    const sTex = ctex(128, 64, (x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : sc; x.fillRect(i * 16, 0, 16, H); } });
    addBox(g, new THREE.MeshStandardMaterial({map: sTex, roughness: 0.7}), P.x - w / 2, P.x + w / 2, top + h, top + h + 0.14, P.z - d / 2, P.z + d / 2, true, 'bounce');
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new THREE.CylinderGeometry(0.04, 0.04, h, 6), std(0x6b3f26), P.x + a * (w / 2 - 0.08), top + h / 2, P.z + b * (d / 2 - 0.08), g);
    addBox(g, std(0xb07a44, 0.8), P.x - w / 2 + 0.1, P.x + w / 2 - 0.1, top + 0.7, top + 0.82, P.z - d / 2 + 0.1, P.z + d / 2 - 0.1);
    addBox(g, std(0x8a5a30, 0.9), P.x - w / 2 + 0.15, P.x + w / 2 - 0.15, top, top + 0.7, P.z - d / 2 + 0.15, P.z + d / 2 - 0.15, false);
    const cols = [0xe22511, 0xffc20e, 0x2fa84f, 0xff7a1a, 0x7a4fb0]; for (let k = 0; k < 7; k++) mesh(new THREE.SphereGeometry(0.11, 8, 6), std(cols[(k + Math.round(P.z)) % 5 >= 0 ? (k + Math.abs(Math.round(P.z))) % 5 : 0], 0.6), P.x + (ax ? srnd(-0.45, 0.45) : srnd(-0.9, 0.9)), top + 0.92, P.z + (ax ? srnd(-0.9, 0.9) : srnd(-0.45, 0.45)), g);
    return true;
  }
  if (P.t === 'rail') { const rm = std(0xf4eee2, 0.6); addBox(g, rm, P.x - 0.05, P.x + 0.05, top + 0.85, top + 0.95, P.z1, P.z0, false); for (let z = P.z0; z > P.z1; z -= 1.2) addBox(g, rm, P.x - 0.05, P.x + 0.05, top, top + 0.9, z - 0.08, z, false); boxes.push({b: [P.x - 0.08, P.x + 0.08, top, top + 0.95, P.z1, P.z0], kind: 'soft'}); return true; }
  return streetProp(P, top, g);
}
function buildLevel(i) {
  if (world) scene.remove(world);
  LV = LEVELS[i]; boxes = []; stars = []; sock = null; world = new THREE.Group(); scene.add(world); seed = 11 + i * 7;
  buildGround3();
  for (const P of LV.props) {
    if (P.t === 'line' && P.x === undefined) P.x = (P.x0 + P.x1) / 2;
    const I = P.x !== undefined ? islandAt(P.x, P.z !== undefined ? P.z : (P.z0 || 0)) : null, top = P.base !== undefined ? P.base : I ? I.top : 0.22, g = new THREE.Group(); world.add(g);
    if (prop3(P, top, g)) { /* street */ }
    else if (P.t === 'plant') { mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 14), std(0xb85c3c), P.x, top + 0.25, P.z, g); mesh(new THREE.SphereGeometry(0.45, 14, 10), std(0x4a9a4a, 0.9), P.x, top + 0.75, P.z, g); boxes.push({b: [P.x - 0.4, P.x + 0.4, top, top + 1.1, P.z - 0.4, P.z + 0.4], kind: 'soft'}); }
    else if (P.t === 'line') {
      for (const x of [P.x0, P.x1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, P.h, 6), std(0x445566), x, top + P.h / 2, P.z, g);
      const rope = mesh(new THREE.CylinderGeometry(0.014, 0.014, P.x1 - P.x0, 4), std(0xffffff), (P.x0 + P.x1) / 2, top + P.h - 0.05, P.z, g); rope.rotation.z = Math.PI / 2;
      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = P.x0 + 0.15, k = 0;
      while (x < P.x1 - 0.4) { const w = 0.55 + srnd(0, 0.3), hh = 0.6 + srnd(0, 0.35); addBox(g, std(cols[k++ % cols.length], 0.9), x, x + w, top + P.h - 0.08 - hh, top + P.h - 0.05, P.z - 0.03, P.z + 0.03, false); x += w + 0.12; }
      boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'soft'});
    }
    else if (P.t === 'sock') { mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), std(0xffffff), P.x, top + 1, P.z, g); sock = mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.9, 12, 1, true), new THREE.MeshStandardMaterial({color: 0xff6a1a, side: THREE.DoubleSide}), P.x, top + 1.9, P.z, g); sock.userData.base = new V3(P.x, top + 1.9, P.z); }
    if (P.t !== 'bld') ink(g, 0.025);
  }
  // bucket (the hole)
  const bt = bucketY(LV);
  const bg = new THREE.Group(); world.add(bg); const bp = []; for (let k = 0; k <= 8; k++) { const u = k / 8; bp.push(new THREE.Vector2(0.62 + u * 0.22, u * 1.0)); }
  mesh(new THREE.LatheGeometry(bp, 28), new THREE.MeshStandardMaterial({color: 0xffc20e, side: THREE.DoubleSide, roughness: 0.5}), 0, 0, 0, bg);
  const rim = mesh(new THREE.TorusGeometry(0.84, 0.06, 8, 28), std(NAVY, 0.4), 0, 1.0, 0, bg); rim.rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.62, 24), std(0x8a5a00, 0.8), 0, 0.03, 0, bg).rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 6), std(0xffffff), 0.95, 1.7, 0, bg);
  const flag = mesh(new THREE.PlaneGeometry(1.0, 0.62), new THREE.MeshStandardMaterial({color: 0xe22511, side: THREE.DoubleSide}), 1.45, 3.05, 0, bg);
  ink(bg, 0.03); bg.position.set(LV.bucket[0], bt, LV.bucket[1]);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.4, 40), new THREE.MeshBasicMaterial({color: 0xffc20e, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false})); glow.rotation.x = -Math.PI / 2; glow.position.set(LV.bucket[0], bt + 0.03, LV.bucket[1]); world.add(glow);
  // a tall light beam so the hole can be found from anywhere
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 16, 1, true), new THREE.MeshBasicMaterial({color: 0xffc20e, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide})); beam.position.set(LV.bucket[0], bt + 7.5, LV.bucket[1]); beam.userData.noInk = true; world.add(beam);
  bucket = {x: LV.bucket[0], z: LV.bucket[1], y: bt, rIn: 0.66, rOut: 0.9, rimY: bt + 1.0, g: bg, flag, glow, beam};
  // golden feathers to collect
  stars = LV.feathers.map(([x, y, z]) => { const m = makeGoldFeather(); m.position.set(x, y, z); world.add(m); return {m, p: new V3(x, y, z), got: false}; });
  // clouds below and around
  const bb = levelBounds(); seed = 3 + i;
  for (let k = 0; k < 14; k++) cloud(srnd(bb.x0 - 10, bb.x1 + 10), srnd(-9, -4), srnd(bb.z0 - 10, bb.z1 + 6), srnd(2, 3.4));
  spawnActors(LV);
}
const goldMat = new THREE.MeshStandardMaterial({color: 0xffc20e, emissive: 0xff9a00, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide});
function makeGoldFeather() { const g = new THREE.Group(); const m = new THREE.Mesh(leafGeo(1.1, 0.55, -0.1), goldMat); m.position.y = -0.5; g.add(m); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.95, 5), std(0xffffff, 0.5)); s.position.y = 0.0; g.add(s); ink(g, 0.022); g.scale.setScalar(0.85); return g; }
function levelBounds() { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const I of LV.islands) { x0 = Math.min(x0, I.x - I.w / 2); x1 = Math.max(x1, I.x + I.w / 2); z0 = Math.min(z0, I.z - I.d / 2); z1 = Math.max(z1, I.z + I.d / 2); } return {x0, x1, z0, z1}; }
function cloud(x, y, z, s) { const g = new THREE.Group(), mat = std(0xffffff, 1); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(srnd(0.5, 1.0) * s, 12, 8), mat); m.position.set(srnd(-1.6, 1.6) * s, srnd(-0.2, 0.35) * s, srnd(-0.6, 0.6) * s); m.scale.y = 0.75; g.add(m); } g.position.set(x, y, z); world.add(g); }
function bucketY(L) { return L.bucket[2] !== undefined ? L.bucket[2] : islandAt(L.bucket[0], L.bucket[1]).top; }
function startPos(L) { const I = islandAt(L.start[0], L.start[1]); return new V3(L.start[0], I.top + RAD + 0.01, L.start[1]); }
