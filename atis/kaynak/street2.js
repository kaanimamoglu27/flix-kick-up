function buildStreetGround() {
  const g = new THREE.Group(); world.add(g);
  for (const I of LV.islands) {
    const x0 = I.x - I.w / 2, x1 = I.x + I.w / 2, z0 = I.z - I.d / 2, z1 = I.z + I.d / 2;
    const t = (I.kind === 'road' ? roadTex : paveTex).clone(); t.needsUpdate = true; t.repeat.set(I.w / 2, I.d / 2);
    addBox(g, new THREE.MeshStandardMaterial({map: t, roughness: 0.95}), x0, x1, I.top - 0.25, I.top, z0, z1);
    addBox(g, std(I.kind === 'road' ? 0x3c3f48 : 0xb9b2a6, 0.95), x0 + 0.01, x1 - 0.01, -0.75, I.top - 0.25, z0 + 0.01, z1 - 0.01);
  }
  // kerb stones along the road
  const kb = std(0xe8e2d6, 0.8); addBox(g, kb, -4, 4, 0, 0.24, 1.86, 2.02, false); addBox(g, kb, -4, 4, 0, 0.24, -1.52, -1.36, false);
  // lane dashes
  const lm = std(0xf4eee2, 0.6); for (let x = -3.6; x < 4; x += 1.4) addBox(g, lm, x, x + 0.7, 0.0, 0.015, 0.19, 0.31, false);
  // earth + rock under the chunk, so it floats like a diorama
  addBox(g, std(0x8a6a50, 1), -3.85, 3.85, -1.7, -0.75, -7.85, 7.85, false);
  const rock = mesh(new THREE.ConeGeometry(4.2, 3.6, 8), std(0x7a5a46, 1), 0, -3.5, 0, g, false); rock.rotation.x = Math.PI; rock.scale.z = 1.9;
  ink(g, 0.03);
}
function streetProp(P, top, g) {
  if (P.t === 'bld') { addFacadeBlock(g, P); return true; }
  if (P.t === 'lamp') {
    const pm = std(0x22304a, 0.5);
    mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.2, 8), pm, P.x, top + 1.6, P.z, g);
    const arm = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6), pm, P.x, top + 3.15, P.z + 0.3, g); arm.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.18, 12, 8), new THREE.MeshStandardMaterial({color: 0xfff1b0, emissive: 0xffd060, emissiveIntensity: 0.7}), P.x, top + 3.0, P.z + 0.62, g);
    boxes.push({b: [P.x - 0.1, P.x + 0.1, top, top + 3.25, P.z - 0.1, P.z + 0.1], kind: 'hard'}); return true;
  }
  if (P.t === 'bench') {
    const wd = std(0xb07a44, 0.8), ir = std(0x22304a, 0.5);
    addBox(g, wd, P.x - 0.8, P.x + 0.8, top + 0.42, top + 0.52, P.z - 0.22, P.z + 0.22);
    addBox(g, wd, P.x - 0.8, P.x + 0.8, top + 0.6, top + 0.95, P.z - 0.27, P.z - 0.2);
    for (const a of [-0.65, 0.65]) addBox(g, ir, P.x + a - 0.04, P.x + a + 0.04, top, top + 0.45, P.z - 0.2, P.z + 0.2, false);
    return true;
  }
  if (P.t === 'tree') {
    mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.8, 8), std(0x7a4a2a, 0.9), P.x, top + 0.9, P.z, g);
    const lf = std(0x4a9a4a, 0.9); mesh(new THREE.SphereGeometry(0.85, 14, 10), lf, P.x, top + 2.2, P.z, g); mesh(new THREE.SphereGeometry(0.6, 12, 8), std(0x5aae52, 0.9), P.x + 0.45, top + 2.6, P.z + 0.2, g);
    mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 16), std(0x6b5a48, 1), P.x, top + 0.02, P.z, g, false);
    boxes.push({b: [P.x - 0.14, P.x + 0.14, top, top + 1.5, P.z - 0.14, P.z + 0.14], kind: 'hard'}, {b: [P.x - 0.8, P.x + 0.8, top + 1.5, top + 3.0, P.z - 0.8, P.z + 0.8], kind: 'soft'});
    return true;
  }
  if (P.t === 'bin') { mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 14), std(0x2f6b4a, 0.6), P.x, top + 0.4, P.z, g); mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 14), std(0x22504a, 0.6), P.x, top + 0.82, P.z, g); boxes.push({b: [P.x - 0.27, P.x + 0.27, top, top + 0.8, P.z - 0.27, P.z + 0.27], kind: 'hard'}); return true; }
  if (P.t === 'zebra') { const zm = std(0xf4eee2, 0.6); for (let z = -1.2; z < 1.8; z += 0.5) addBox(g, zm, P.x - 0.75, P.x + 0.75, 0, 0.012, z, z + 0.28, false); return true; }
  if (P.t === 'car') {
    const c = std(P.col, 0.35, 0.2), dk = std(0x1b1330, 0.6), gl = std(0x8fc4dc, 0.15, 0.3);
    addBox(g, c, P.x - 1.2, P.x + 1.2, top + 0.25, top + 0.95, P.z - 0.6, P.z + 0.6);
    addBox(g, c, P.x - 0.6, P.x + 0.5, top + 0.95, top + 1.5, P.z - 0.52, P.z + 0.52);
    addBox(g, gl, P.x - 0.55, P.x + 0.45, top + 1.0, top + 1.42, P.z - 0.54, P.z + 0.54, false);
    for (const [a, b] of [[-0.75, -0.55], [0.75, -0.55], [-0.75, 0.55], [0.75, 0.55]]) { const w = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 14), dk, P.x + a, top + 0.27, P.z + b, g); w.rotation.x = Math.PI / 2; }
    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xfff1b0 : 0xe22511, 0.3), P.x + a * 1.2, top + 0.7, P.z + 0.4, g);
    return true;
  }
  if (P.t === 'kiosk') {
    const sign = ctex(256, 96, (x, w, h) => { x.fillStyle = '#e22511'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.font = '900 italic 64px "Barlow Condensed", Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BÜFE', w / 2, h / 2 + 4); });
    const wall = std(0xf4eee2, 0.8);
    const mats = [wall, wall, wall, wall, new THREE.MeshStandardMaterial({map: sign, roughness: 0.7}), wall];
    addBox(g, wall, P.x - 0.85, P.x + 0.85, top, top + 1.75, P.z - 0.75, P.z + 0.75);
    const sm = new THREE.Mesh(BOX, mats); sm.scale.set(1.7, 0.45, 1.5); sm.position.set(P.x, top + 1.98, P.z); sm.castShadow = true; g.add(sm); boxes.push({b: [P.x - 0.85, P.x + 0.85, top + 1.75, top + 2.2, P.z - 0.75, P.z + 0.75], kind: 'hard'});
    addBox(g, std(0xe22511, 0.6), P.x - 1.05, P.x + 1.05, top + 2.2, top + 2.37, P.z - 0.98, P.z + 0.98);
    addBox(g, std(0x8fc4dc, 0.2, 0.2), P.x - 0.7, P.x + 0.7, top + 0.8, top + 1.6, P.z + 0.74, P.z + 0.78, false);
    const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f]; for (let k = 0; k < 6; k++) addBox(g, std(cols[k % 4], 0.8), P.x - 0.65 + k * 0.22, P.x - 0.49 + k * 0.22, top + 0.85, top + 1.15, P.z + 0.76, P.z + 0.8, false);
    return true;
  }
  if (P.t === 'balc') {
    const z0 = -5, z1 = -5 + P.d, x0 = P.x - P.w / 2, x1 = P.x + P.w / 2, rm = std(0x22304a, 0.5);
    addBox(g, std(0xf4eee2, 0.8), x0, x1, P.y - 0.18, P.y, z0, z1);
    for (let x = x0 + 0.05; x <= x1; x += 0.3) addBox(g, rm, x, x + 0.04, P.y, P.y + 0.55, z1 - 0.05, z1 - 0.01, false);
    addBox(g, rm, x0, x1, P.y + 0.55, P.y + 0.6, z1 - 0.07, z1, false);
    for (const x of [x0, x1 - 0.04]) addBox(g, rm, x, x + 0.04, P.y + 0.55, P.y + 0.6, z0, z1, false);
    mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.35, 12), std(0xb85c3c), x1 - 0.3, P.y + 0.18, z0 + 0.35, g); mesh(new THREE.SphereGeometry(0.3, 12, 8), std(0xe22511, 0.8), x1 - 0.3, P.y + 0.5, z0 + 0.35, g);
    return true;
  }
  return false;
}
