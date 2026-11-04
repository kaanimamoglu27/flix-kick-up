// ================= v7: world details, landmarks, more animals and skins =================
// ---- roadside details: placed with their own random numbers so the level layout stays the same ----
const DECO = {
  turkiye: ['simit', 'flagTR', 'cay', 'tulip', 'simit', 'flagTR'],
  amerika: ['hydrant', 'mailbox', 'flagUS', 'hotdog', 'hydrant', 'stop'],
  avrupa: ['cafe', 'flowers', 'bike', 'cafe', 'flowers'],
  asya: ['lantern', 'sakura', 'bamboo', 'lantern', 'sakura'],
  avustralya: ['palm', 'surf', 'kangsign', 'palm', 'bbq'],
  afrika: ['baobab', 'acacia', 'pots', 'drum', 'acacia'],
  antarktika: ['snowman', 'iceblk', 'flagpole', 'snowman', 'iceblk'],
  uzay: ['antenna', 'crate', 'antenna', 'crate'],
};
function genDeco(L, theme) {
  const list = DECO[theme]; if (!list || !L.route) return [];
  const R = lrng(4441 + L.route.length * 97 + Math.round(L.bucket[1] * 13)), out = []; let n = 0;
  for (let q = 0; q < L.route.length - 1; q++) {
    const [ax, az] = L.route[q], [bx, bz] = L.route[q + 1], d = Math.hypot(bx - ax, bz - az); if (d < 4) continue;
    const ux = (bx - ax) / d, uz = (bz - az) / d;
    for (let t = 5; t < d - 3; t += 5 + R() * 3) {
      const px = ax + ux * t, pz = az + uz * t; if (Math.hypot(px - L.bucket[0], pz - L.bucket[1]) < 3 || Math.hypot(px - L.start[0], pz - L.start[1]) < 3) continue;
      const side = (n++ % 2 ? 1 : -1), ox = -uz * side * 3.12, oz = ux * side * 3.12, x = px + ox, z = pz + oz;
      const I = L.islands.find((I) => I.kind === 'walk' && Math.abs(x - I.x) <= I.w / 2 && Math.abs(z - I.z) <= I.d / 2); if (!I) continue;
      out.push({k: list[Math.floor(R() * list.length)], x, z, top: I.top, rot: Math.atan2(-ox, -oz)});
    }
  }
  return out;
}
const DM = (c, r, m) => std(c, r === undefined ? 0.7 : r, m);
function decoProp(D, g) {
  const {x, z, top: y} = D, M = (geo, mat, px, py, pz) => mesh(geo, mat, x + px, y + py, z + pz, g);
  const cyl = (r0, r1, h, n) => new THREE.CylinderGeometry(r0, r1, h, n || 12), box = (w, h, d) => new THREE.BoxGeometry(w, h, d), sph = (r) => new THREE.SphereGeometry(r, 14, 10), cone = (r, h, n) => new THREE.ConeGeometry(r, h, n || 12);
  const flag = (cols, h, star) => { M(cyl(0.035, 0.035, h, 6), DM(0xdddddd, 0.4, 0.5), 0, h / 2, 0); const fl = new THREE.Group(); fl.position.set(x + 0.36, y + h - 0.26, z); g.add(fl);
    const c = document.createElement('canvas'); c.width = 96; c.height = 64; const t = c.getContext('2d'); star(t, cols); const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.44, 6, 1), new THREE.MeshStandardMaterial({map: tex, side: THREE.DoubleSide, roughness: 0.8})); fl.add(m); fl.userData.flag = m; FLAGS.push(fl); };
  switch (D.k) {
    case 'simit': { // red simit cart with rings on top
      M(box(0.9, 0.5, 0.5), DM(0xc8102e), 0, 0.75, 0); M(box(0.96, 0.06, 0.56), DM(0xf4eee2), 0, 1.02, 0); for (const sx of [-0.3, 0.3]) M(cyl(0.14, 0.14, 0.05, 14), DM(0x333333), sx, 0.18, 0.27).rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) { const r = M(new THREE.TorusGeometry(0.1, 0.035, 6, 12), DM(0xc88a3a, 0.8), -0.32 + i * 0.16, 1.1, 0); r.rotation.x = Math.PI / 2; }
      M(box(0.04, 0.8, 0.04), DM(0x666666), -0.42, 1.4, 0); M(box(0.04, 0.8, 0.04), DM(0x666666), 0.42, 1.4, 0); M(box(1.0, 0.04, 0.6), DM(0xc8102e), 0, 1.8, 0); break; }
    case 'flagTR': flag(null, 2.6, (t) => { t.fillStyle = '#e30a17'; t.fillRect(0, 0, 96, 64); t.fillStyle = '#fff'; t.beginPath(); t.arc(36, 32, 16, 0, 7); t.fill(); t.fillStyle = '#e30a17'; t.beginPath(); t.arc(40, 32, 13, 0, 7); t.fill(); t.fillStyle = '#fff'; t.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 3.2 : 8; t.lineTo(58 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); } t.fill(); }); break;
    case 'cay': { M(cyl(0.3, 0.3, 0.05, 14), DM(0x8a5a3a), 0, 0.6, 0); M(cyl(0.04, 0.04, 0.6, 6), DM(0x5a3a22), 0, 0.3, 0); for (const sx of [-0.45, 0.45]) { M(box(0.26, 0.04, 0.26), DM(0x2f5a3a), sx, 0.34, 0); M(box(0.03, 0.34, 0.03), DM(0x2f5a3a), sx, 0.17, 0); }
      for (const [a, b] of [[-0.1, 0], [0.1, 0.06]]) { M(cyl(0.035, 0.025, 0.09, 8), new THREE.MeshStandardMaterial({color: 0xb8401a, transparent: true, opacity: 0.85, roughness: 0.1}), a, 0.67, b); } break; }
    case 'tulip': { M(box(0.9, 0.36, 0.4), DM(0x9a5a3a), 0, 0.18, 0); for (let i = 0; i < 5; i++) { const px = -0.32 + i * 0.16; M(cyl(0.012, 0.012, 0.34, 4), DM(0x2f8a3a), px, 0.53, 0); M(cone(0.06, 0.13, 6), DM([0xe22511, 0xffc20e, 0xff8fb8, 0xe22511, 0x7a4fb0][i]), px, 0.74, 0).rotation.x = Math.PI; } break; }
    case 'hydrant': M(cyl(0.12, 0.14, 0.5, 10), DM(0xe22511, 0.5), 0, 0.25, 0); M(sph(0.12), DM(0xe22511, 0.5), 0, 0.52, 0); for (const sx of [-1, 1]) M(cyl(0.05, 0.05, 0.12, 8), DM(0xffc20e), sx * 0.13, 0.36, 0).rotation.z = Math.PI / 2; break;
    case 'mailbox': M(box(0.4, 0.5, 0.36), DM(0x1f4fa0, 0.5), 0, 0.68, 0); M(cyl(0.18, 0.18, 0.36, 12, 1), DM(0x1f4fa0, 0.5), 0, 0.93, 0).rotation.x = Math.PI / 2; for (const sx of [-0.15, 0.15]) M(box(0.05, 0.45, 0.05), DM(0x1b1330), sx, 0.22, 0); M(box(0.24, 0.03, 0.02), DM(0xffffff), 0, 0.8, 0.19); break;
    case 'flagUS': flag(null, 2.8, (t) => { for (let i = 0; i < 7; i++) { t.fillStyle = i % 2 ? '#fff' : '#b22234'; t.fillRect(0, i * 9.2, 96, 9.2); } t.fillStyle = '#3c3b6e'; t.fillRect(0, 0, 40, 32); t.fillStyle = '#fff'; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) t.fillRect(4 + c * 7.5 + (r % 2) * 3, 4 + r * 7, 2.5, 2.5); }); break;
    case 'hotdog': { M(box(1.0, 0.55, 0.55), DM(0xf4f4f4), 0, 0.72, 0); M(box(1.02, 0.12, 0.57), DM(0xe22511), 0, 0.6, 0); for (const sx of [-0.35, 0.35]) M(cyl(0.15, 0.15, 0.05, 14), DM(0x333333), sx, 0.2, 0.28).rotation.x = Math.PI / 2;
      M(cyl(0.025, 0.025, 1.0, 6), DM(0xdddddd), 0, 1.5, 0); const um = M(cone(0.75, 0.32, 8), DM(0xffc20e), 0, 2.05, 0); um.userData.stripe = 1; const hd = M(cyl(0.05, 0.05, 0.3, 8), DM(0xc8503a), 0, 1.04, 0); hd.rotation.z = Math.PI / 2; M(cyl(0.07, 0.07, 0.26, 8), DM(0xe8b060), 0, 1.0, 0).rotation.z = Math.PI / 2; break; }
    case 'stop': { M(cyl(0.03, 0.03, 2.2, 6), DM(0xbbbbbb, 0.4, 0.5), 0, 1.1, 0); const c = document.createElement('canvas'); c.width = c.height = 64; const t = c.getContext('2d'); t.fillStyle = '#c8102e'; t.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; t.lineTo(32 + Math.cos(a) * 31, 32 + Math.sin(a) * 31); } t.fill(); t.fillStyle = '#fff'; t.font = '900 19px Arial'; t.textAlign = 'center'; t.fillText('STOP', 32, 39);
      const s = M(new THREE.CircleGeometry(0.32, 8), new THREE.MeshStandardMaterial({map: new THREE.CanvasTexture(c), side: THREE.DoubleSide}), 0, 2.15, 0); s.rotation.y = D.rot; s.rotation.z = Math.PI / 8; break; }
    case 'cafe': { M(cyl(0.3, 0.3, 0.04, 16), DM(0xf4eee2), 0, 0.72, 0); M(cyl(0.03, 0.03, 0.72, 6), DM(0x333333), 0, 0.36, 0); for (const sx of [-0.5, 0.5]) { M(box(0.3, 0.04, 0.3), DM(0x2f5a3a), sx, 0.42, 0); M(box(0.3, 0.36, 0.04), DM(0x2f5a3a), sx, 0.62, sx > 0 ? 0.15 : -0.15); }
      M(cyl(0.02, 0.02, 1.4, 6), DM(0xdddddd), 0, 1.4, 0); M(cone(0.85, 0.35, 10), DM(0x2f8a4a, 0.8), 0, 2.15, 0); M(cyl(0.03, 0.03, 0.12, 6), DM(0xffffff), 0.08, 0.8, 0); break; }
    case 'flowers': { M(box(0.9, 0.3, 0.32), DM(0x8a4a2a), 0, 0.15, 0); for (let i = 0; i < 7; i++) M(sph(0.1), DM([0xe22511, 0xff8fb8, 0xffffff, 0xffc20e][i % 4], 0.8), -0.36 + i * 0.12, 0.36 + (i % 2) * 0.05, 0); M(box(0.86, 0.12, 0.26), DM(0x3f8a3a), 0, 0.32, 0); break; }
    case 'bike': { const gp = new THREE.Group(); gp.position.set(x, y, z); gp.rotation.y = D.rot + Math.PI / 2; g.add(gp); for (const sx of [-0.4, 0.4]) { const w = mesh(new THREE.TorusGeometry(0.27, 0.03, 6, 18), DM(0x1b1330), sx, 0.3, 0, gp); }
      for (const [a, b, l, r] of [[-0.2, 0.45, 0.5, 0.9], [0.2, 0.45, 0.5, -0.9], [0, 0.6, 0.6, 1.57]]) { const f = mesh(new THREE.CylinderGeometry(0.025, 0.025, l, 6), DM(0xe22511), a, b, 0, gp); f.rotation.z = r; } mesh(new THREE.BoxGeometry(0.22, 0.05, 0.1), DM(0x1b1330), -0.15, 0.78, 0, gp); mesh(new THREE.BoxGeometry(0.3, 0.14, 0.25), DM(0xc88a3a), 0.42, 0.66, 0, gp); break; }
    case 'lantern': { M(cyl(0.035, 0.035, 2.4, 6), DM(0x5a1a1a), 0, 1.2, 0); M(box(0.6, 0.05, 0.05), DM(0x5a1a1a), 0.25, 2.35, 0); const l = M(sph(0.2), new THREE.MeshStandardMaterial({color: 0xe8202e, emissive: 0xc81020, emissiveIntensity: 0.45, roughness: 0.6}), 0.5, 2.05, 0); l.scale.y = 1.25; M(cyl(0.1, 0.1, 0.05, 10), DM(0xffc20e), 0.5, 2.31, 0); M(cyl(0.1, 0.1, 0.05, 10), DM(0xffc20e), 0.5, 1.79, 0); break; }
    case 'sakura': { M(cyl(0.08, 0.12, 1.4, 8), DM(0x5a3a2a), 0, 0.7, 0); for (let i = 0; i < 6; i++) { const a = i * 1.05; M(sph(0.45 + (i % 2) * 0.1), DM(i % 2 ? 0xffb8d0 : 0xff9ac0, 0.9), Math.cos(a) * 0.4, 1.6 + (i % 3) * 0.15, Math.sin(a) * 0.4); } break; }
    case 'bamboo': for (let i = 0; i < 4; i++) { const h = 2.2 + i * 0.3, px = -0.25 + i * 0.17; M(cyl(0.05, 0.05, h, 8), DM(0x6ab04a, 0.6), px, h / 2, (i % 2) * 0.12); for (let k = 0.5; k < h; k += 0.5) M(cyl(0.06, 0.06, 0.04, 8), DM(0x4a8a3a), px, k, (i % 2) * 0.12); M(cone(0.18, 0.4, 5), DM(0x5aa03a, 0.9), px + 0.1, h, (i % 2) * 0.12).rotation.z = -0.8; } break;
    case 'palm': { const tr = new THREE.Group(); tr.position.set(x, y, z); g.add(tr); for (let k = 0; k < 7; k++) { const s = mesh(new THREE.CylinderGeometry(0.1 - k * 0.007, 0.12 - k * 0.007, 0.42, 8), DM(0x8a6a4a, 0.9), k * 0.04, 0.21 + k * 0.4, 0, tr); s.rotation.z = -0.06; }
      for (let i = 0; i < 7; i++) { const a = i * 0.9, lf = mesh(new THREE.ConeGeometry(0.16, 1.4, 4), DM(0x3a9a3a, 0.8), 0.3 + Math.cos(a) * 0.55, 2.85, Math.sin(a) * 0.55, tr); lf.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2); lf.scale.z = 0.25; } mesh(new THREE.SphereGeometry(0.09, 8, 6), DM(0x6a4a2a), 0.3, 2.75, 0.1, tr); break; }
    case 'surf': for (let i = 0; i < 3; i++) { const b = M(sph(1), DM([0xff8a1a, 0x1f6fd1, 0xffc20e][i], 0.4), -0.3 + i * 0.3, 1.0, -0.05 * i); b.scale.set(0.16, 1.0, 0.05); b.rotation.z = 0.1 - i * 0.08; } break;
    case 'kangsign': { M(cyl(0.03, 0.03, 2.0, 6), DM(0xbbbbbb, 0.4, 0.5), 0, 1.0, 0); const c = document.createElement('canvas'); c.width = c.height = 64; const t = c.getContext('2d'); t.fillStyle = '#ffc20e'; t.fillRect(0, 0, 64, 64); t.strokeStyle = '#111'; t.lineWidth = 4; t.strokeRect(4, 4, 56, 56);
      t.fillStyle = '#111'; t.beginPath(); t.ellipse(30, 36, 11, 8, -0.5, 0, 7); t.fill(); t.beginPath(); t.ellipse(40, 22, 5, 4, 0, 0, 7); t.fill(); t.fillRect(37, 13, 3, 7); t.beginPath(); t.moveTo(20, 40); t.quadraticCurveTo(8, 52, 14, 54); t.lineTo(22, 44); t.fill(); t.fillRect(30, 42, 4, 12); t.fillRect(26, 52, 12, 3);
      const s = M(new THREE.PlaneGeometry(0.55, 0.55), new THREE.MeshStandardMaterial({map: new THREE.CanvasTexture(c), side: THREE.DoubleSide}), 0, 1.9, 0); s.rotation.y = D.rot; s.rotation.z = Math.PI / 4; break; }
    case 'bbq': { M(sph(0.3), DM(0x1b1330, 0.4), 0, 0.85, 0).scale.y = 0.6; for (let i = 0; i < 3; i++) { const a = i * 2.1, l = M(cyl(0.025, 0.025, 0.75, 5), DM(0x333333), Math.cos(a) * 0.18, 0.38, Math.sin(a) * 0.18); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); } for (let i = 0; i < 3; i++) M(cyl(0.035, 0.035, 0.3, 6), DM(0xa0402a), -0.1 + i * 0.1, 1.04, 0).rotation.x = Math.PI / 2; break; }
    case 'baobab': { M(cyl(0.34, 0.5, 2.0, 10), DM(0x9a7a5a, 0.95), 0, 1.0, 0); for (let i = 0; i < 5; i++) { const a = i * 1.26, br = M(cyl(0.05, 0.1, 0.8, 6), DM(0x8a6a4a), Math.cos(a) * 0.3, 2.2, Math.sin(a) * 0.3); br.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7); M(sph(0.32), DM(0x5a8a3a, 0.9), Math.cos(a) * 0.6, 2.55, Math.sin(a) * 0.6).scale.y = 0.55; } break; }
    case 'acacia': { const t = M(cyl(0.06, 0.1, 1.8, 7), DM(0x6a4a2a), 0, 0.9, 0); t.rotation.z = 0.12; M(sph(1), DM(0x6a9a3a, 0.9), 0.15, 2.0, 0).scale.set(1.0, 0.22, 0.8); M(sph(1), DM(0x5a8a3a, 0.9), -0.2, 1.85, 0.2).scale.set(0.6, 0.16, 0.5); break; }
    case 'pots': for (let i = 0; i < 3; i++) { const p = M(sph(0.2 - i * 0.03), DM([0xb8643a, 0xa85a2e, 0xc8743a][i], 0.9), -0.3 + i * 0.3, 0.2 - i * 0.02, (i % 2) * 0.12); p.scale.y = 1.1; M(cyl(0.08, 0.1, 0.1, 10), DM(0xb8643a), -0.3 + i * 0.3, 0.42 - i * 0.05, (i % 2) * 0.12); } break;
    case 'drum': for (const [px, s] of [[-0.2, 1], [0.25, 0.8]]) { M(cyl(0.2 * s, 0.14 * s, 0.6 * s, 12), DM(0x8a4a22), px, 0.3 * s, 0); M(cyl(0.21 * s, 0.21 * s, 0.03, 12), DM(0xe8d8b0), px, 0.6 * s, 0); M(cyl(0.205 * s, 0.205 * s, 0.05, 12), DM(0xc8102e), px, 0.5 * s, 0); } break;
    case 'snowman': { const w = DM(0xffffff, 0.9); M(sph(0.36), w, 0, 0.34, 0); M(sph(0.27), w, 0, 0.86, 0); M(sph(0.2), w, 0, 1.27, 0); const n = M(cone(0.04, 0.2, 8), DM(0xff7a1a), 0, 1.27, 0.24); n.rotation.x = Math.PI / 2;
      for (const sx of [-0.07, 0.07]) M(sph(0.025), DM(0x111111), sx, 1.33, 0.17); M(cyl(0.14, 0.14, 0.24, 12), DM(0x1b1330), 0, 1.5, 0); M(cyl(0.2, 0.2, 0.03, 12), DM(0x1b1330), 0, 1.39, 0); M(new THREE.TorusGeometry(0.22, 0.05, 6, 14), DM(0xe22511), 0, 1.08, 0).rotation.x = Math.PI / 2; break; }
    case 'iceblk': for (let i = 0; i < 3; i++) M(box(0.55, 0.45, 0.45), new THREE.MeshStandardMaterial({color: 0xbfe6ff, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85}), [-0.3, 0.3, 0][i], [0.22, 0.22, 0.67][i], 0).rotation.y = i * 0.4; break;
    case 'flagpole': flag(null, 2.6, (t) => { t.fillStyle = '#3aa8d8'; t.fillRect(0, 0, 96, 64); t.fillStyle = '#fff'; t.beginPath(); t.arc(48, 30, 16, 0, 7); t.fill(); t.fillStyle = '#3aa8d8'; t.beginPath(); t.arc(48, 30, 11, 0, 7); t.fill(); t.fillStyle = '#fff'; t.fillRect(44, 8, 8, 44); }); M(box(0.5, 0.5, 0.5), DM(0xe8a020), 0.5, 0.25, 0.2); break;
    case 'antenna': M(cyl(0.04, 0.06, 1.6, 6), DM(0xd8dce4, 0.4, 0.5), 0, 0.8, 0); M(sph(0.06), new THREE.MeshBasicMaterial({color: 0x9dff00}), 0, 1.65, 0); M(cyl(0.35, 0.05, 0.12, 14), DM(0xe8ecf2, 0.4), 0, 1.3, 0).rotation.x = 0.7; break;
    case 'crate': M(box(0.6, 0.6, 0.6), DM(0xff7a1a, 0.6), 0, 0.3, 0); M(box(0.62, 0.08, 0.62), DM(0x3a4a6a), 0, 0.3, 0); M(box(0.4, 0.4, 0.4), DM(0xd8dce4, 0.5), 0.1, 0.8, 0).rotation.y = 0.5; break;
  }
}
const FLAGS = [];
function flagsTick(t) { for (const f of FLAGS) { const m = f.userData.flag, p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i); p.setZ(i, Math.sin(t * 5 + xx * 7) * 0.05 * (xx + 0.33)); } p.needsUpdate = true; } }
// ---- a landmark behind the finish so every world tells you where you are ----
function landmark(theme, bb, g) {
  const cx = (bb.x0 + bb.x1) / 2, far = bb.z0 - 14, M = (geo, mat, x, y, z) => mesh(geo, mat, x, y, z, g), base = -0.6;
  const isle = (x, z, w, d, col) => { const b = M(new THREE.BoxGeometry(w, 1.2, d), DM(col || 0x9a8a7a, 1), x, base - 0.6, z); return b; };
  const lmX = cx + 6;
  switch (theme) {
    case 'turkiye': { isle(lmX, far, 16, 10, 0xb8a888); // a domed mosque with two minarets and a stone tower
      const st = DM(0xf0e8d8, 0.8), dm = DM(0x8a9aa8, 0.5, 0.3);
      M(new THREE.BoxGeometry(6, 3, 6), st, lmX, base + 1.5, far); M(new THREE.SphereGeometry(2.6, 24, 12, 0, 6.3, 0, Math.PI / 2), dm, lmX, base + 3, far); M(new THREE.CylinderGeometry(0.06, 0.06, 1, 6), DM(0xffc20e, 0.3, 0.6), lmX, base + 6, far);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.SphereGeometry(1.0, 14, 8, 0, 6.3, 0, Math.PI / 2), dm, lmX + sx * 2.3, base + 3, far + sz * 2.3);
      for (const sx of [-4, 4]) { M(new THREE.CylinderGeometry(0.32, 0.38, 9, 12), st, lmX + sx, base + 4.5, far + 2.5); M(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 12), st, lmX + sx, base + 7, far + 2.5); M(new THREE.ConeGeometry(0.36, 1.6, 12), dm, lmX + sx, base + 9.8, far + 2.5); }
      const tx = cx - 9; isle(tx, far + 4, 5, 5, 0xb8a888); M(new THREE.CylinderGeometry(1.4, 1.6, 9, 16), DM(0xc8b898, 0.9), tx, base + 4.5, far + 4); M(new THREE.CylinderGeometry(1.55, 1.55, 0.5, 16), DM(0xf0e8d8), tx, base + 8.5, far + 4); M(new THREE.ConeGeometry(1.6, 3, 16), DM(0x5a6a7a, 0.6), tx, base + 10.5, far + 4); break; }
    case 'amerika': { isle(lmX, far, 8, 8, 0x8a8a8a); // the lady with the torch, plus skyscrapers
      const gr = DM(0x6ab0a0, 0.6); M(new THREE.BoxGeometry(4, 3, 4), DM(0xb8b0a0), lmX, base + 1.5, far); M(new THREE.CylinderGeometry(0.8, 1.3, 5, 12), gr, lmX, base + 5.5, far); M(new THREE.SphereGeometry(0.55, 14, 10), gr, lmX, base + 8.5, far);
      for (let i = 0; i < 7; i++) { const a = -0.9 + i * 0.3; M(new THREE.ConeGeometry(0.1, 0.6, 5), gr, lmX + Math.sin(a) * 0.5, base + 9.1 + Math.cos(a) * 0.15, far); }
      const arm = M(new THREE.CylinderGeometry(0.2, 0.25, 2.6, 8), gr, lmX + 0.9, base + 9.0, far); arm.rotation.z = -0.35; M(new THREE.CylinderGeometry(0.28, 0.15, 0.5, 8), DM(0xffc20e, 0.3, 0.6), lmX + 1.35, base + 10.4, far); M(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({color: 0xffa020}), lmX + 1.35, base + 10.8, far);
      M(new THREE.BoxGeometry(1.0, 1.4, 0.3), gr, lmX - 0.8, base + 6.6, far + 0.6).rotation.z = 0.3;
      for (const [dx, h, w] of [[-14, 22, 4], [-9, 16, 3.4], [16, 26, 4.4], [21, 18, 3]]) { isle(cx + dx, far - 4, w + 1, w + 1, 0x8a8a8a); M(new THREE.BoxGeometry(w, h, w), DM(0x7a8aa0, 0.3, 0.4), cx + dx, base + h / 2, far - 4); M(new THREE.BoxGeometry(w * 0.6, 2, w * 0.6), DM(0x9aaabb, 0.3, 0.4), cx + dx, base + h + 1, far - 4); }
      break; }
    case 'avrupa': { isle(lmX, far, 9, 9, 0x8a8070); // iron lattice tower + a windmill
      const ir = DM(0x6a5a4a, 0.5, 0.5); for (const [h0, h1, w0, w1] of [[0, 5, 4, 2.2], [5, 10, 2.2, 1.2], [10, 16, 1.2, 0.3]]) { const hh = h1 - h0; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = M(new THREE.CylinderGeometry(0.12, 0.18, hh * 1.05, 6), ir, lmX + sx * (w0 + w1) / 4, base + h0 + hh / 2, far + sz * (w0 + w1) / 4); l.rotation.z = -sx * Math.atan((w0 - w1) / 2 / hh); l.rotation.x = sz * Math.atan((w0 - w1) / 2 / hh); }
        M(new THREE.BoxGeometry(w1 + 0.5, 0.3, w1 + 0.5), ir, lmX, base + h1, far); }
      M(new THREE.ConeGeometry(0.15, 1.4, 6), ir, lmX, base + 16.9, far);
      const wx = cx - 10; isle(wx, far + 3, 5, 5, 0x6a9a4a); M(new THREE.CylinderGeometry(1.0, 1.6, 6, 10), DM(0xf4eee2), wx, base + 3, far + 3); M(new THREE.ConeGeometry(1.2, 1.6, 10), DM(0x7a2a1a), wx, base + 6.8, far + 3);
      const mill = new THREE.Group(); mill.position.set(wx, base + 5.6, far + 4.3); g.add(mill); for (let i = 0; i < 4; i++) { const b = mesh(new THREE.BoxGeometry(0.4, 3.4, 0.08), DM(0xe8dcc8), 0, 1.7, 0, null); const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(b); mill.add(arm); } mill.userData.spin = 0.6; SPIN.push(mill); break; }
    case 'asya': { isle(lmX, far, 9, 9, 0x6a5a4a); // pagoda and a gate
      const rd = DM(0xc8202e, 0.6), rf = DM(0x2f4a3a, 0.6);
      for (let i = 0; i < 5; i++) { const w = 4.2 - i * 0.6, y = base + i * 2.2; M(new THREE.BoxGeometry(w * 0.7, 1.8, w * 0.7), rd, lmX, y + 0.9, far); const r = M(new THREE.ConeGeometry(w * 0.85, 0.7, 4), rf, lmX, y + 2.05, far); r.rotation.y = Math.PI / 4; }
      M(new THREE.CylinderGeometry(0.05, 0.08, 2, 6), DM(0xffc20e, 0.3, 0.6), lmX, base + 12, far);
      const tx = cx - 8; isle(tx, far + 4, 7, 3, 0x6a5a4a); for (const sx of [-2, 2]) M(new THREE.CylinderGeometry(0.3, 0.35, 6, 12), rd, tx + sx, base + 3, far + 4); M(new THREE.BoxGeometry(6.4, 0.5, 0.7), DM(0x1b1330), tx, base + 6.2, far + 4); M(new THREE.BoxGeometry(5.6, 0.4, 0.5), rd, tx, base + 5.2, far + 4); break; }
    case 'avustralya': { isle(lmX, far, 12, 8, 0xd8c8a8); // white shell roofs by the harbour + a lighthouse
      const w = DM(0xf8f6f0, 0.4); M(new THREE.BoxGeometry(10, 1.2, 5), DM(0xc8a888), lmX, base + 0.6, far);
      for (let i = 0; i < 4; i++) { const s = M(new THREE.SphereGeometry(2.6 - i * 0.3, 16, 10, 0, Math.PI, 0, Math.PI / 2), w, lmX - 3 + i * 2, base + 1.2, far); s.rotation.set(0, Math.PI / 2, -0.5); s.scale.set(1, 1.6, 0.7); }
      const lx = cx - 9; isle(lx, far + 3, 4, 4, 0x8a7a6a); M(new THREE.CylinderGeometry(0.8, 1.2, 8, 14), DM(0xffffff), lx, base + 4, far + 3); for (let k = 0; k < 3; k++) M(new THREE.CylinderGeometry(0.95 - k * 0.1, 1.0 - k * 0.1, 0.8, 14), DM(0xe22511), lx, base + 1.5 + k * 2.2, far + 3);
      M(new THREE.CylinderGeometry(0.7, 0.7, 1, 12), new THREE.MeshStandardMaterial({color: 0xfff1a0, emissive: 0xffc20e, emissiveIntensity: 0.8}), lx, base + 8.5, far + 3); M(new THREE.ConeGeometry(0.9, 1, 12), DM(0x1b1330), lx, base + 9.5, far + 3); break; }
    case 'afrika': { isle(lmX, far, 18, 12, 0xdcb87a); // pyramids in the haze + a giant baobab
      const sd = DM(0xe0b870, 0.95); for (const [dx, s] of [[0, 7], [7, 5], [-6, 4]]) { const p = M(new THREE.ConeGeometry(s, s * 1.3, 4), sd, lmX + dx, base + s * 0.65, far - (dx ? 2 : 0)); p.rotation.y = Math.PI / 4; }
      const bx = cx - 10; isle(bx, far + 5, 6, 6, 0xc8a060); M(new THREE.CylinderGeometry(1.2, 1.8, 6, 12), DM(0x9a7a5a, 0.95), bx, base + 3, far + 5); for (let i = 0; i < 6; i++) { const a = i * 1.05; M(new THREE.SphereGeometry(1.2, 12, 8), DM(0x5a8a3a, 0.9), bx + Math.cos(a) * 1.6, base + 6.8, far + 5 + Math.sin(a) * 1.6).scale.y = 0.5; } break; }
    case 'antarktika': { // icebergs and a big igloo
      const ic = new THREE.MeshStandardMaterial({color: 0xd8f0ff, roughness: 0.2, metalness: 0.05}); for (const [dx, dz, s] of [[0, 0, 6], [-12, 4, 4], [14, -3, 5]]) { const b = M(new THREE.ConeGeometry(s, s * 1.8, 6), ic, cx + dx, base + s * 0.6, far + dz); b.rotation.y = dx; b.scale.z = 0.7; isle(cx + dx, far + dz, s * 1.6, s * 1.2, 0xe8f4fc); }
      const ix = lmX + 2; M(new THREE.SphereGeometry(2.4, 18, 10, 0, 6.3, 0, Math.PI / 2), DM(0xf8fbfe, 0.9), ix, base, far + 8); M(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 12, 1, false, 0, Math.PI), DM(0xf0f6fa), ix, base + 0.7, far + 10.2).rotation.y = Math.PI / 2; isle(ix, far + 8, 6, 6, 0xe8f4fc); break; }
    case 'uzay': { isle(lmX, far, 6, 6, 0x7d7f86); // a rocket on its pad
      M(new THREE.CylinderGeometry(0.9, 1.0, 8, 16), DM(0xf4f4f4, 0.4), lmX, base + 4.5, far); M(new THREE.ConeGeometry(0.9, 2.2, 16), DM(0xe22511, 0.5), lmX, base + 9.6, far); for (let i = 0; i < 3; i++) { const a = i * 2.1, f = M(new THREE.BoxGeometry(0.12, 2, 1.2), DM(0xe22511, 0.5), lmX + Math.cos(a) * 1, base + 1.5, far + Math.sin(a) * 1); f.rotation.y = -a; }
      M(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 14), new THREE.MeshStandardMaterial({color: 0x1f6fd1, emissive: 0x1f6fd1, emissiveIntensity: 0.4}), lmX, base + 6.5, far + 0.88).rotation.x = Math.PI / 2; break; }
  }
}
const SPIN = [];
// ---- more animals (also the local animal of each world) ----
const LOCAL_ANI = {asya: 'panda', antarktika: 'penguen', avustralya: 'kanguru', afrika: 'zurafa'};
function makeCreature2(id, kind) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const legs = []; let head, tail;
  const leg = (mat, x, y, z, len, r, end, er) => { const l = limb(body, mat, x, y, len, r, end, er); l.position.z = z; legs.push(l); return l; };
  const eyes = (h, y, z, sp, s) => { for (const sx of [-1, 1]) { part(SPH, std(0xffffff, 0.3), 0.03 * s, 0.035 * s, 0.02 * s, sx * sp, y, z, h); part(SPH, std(0x111111, 0.3), 0.017 * s, 0.022 * s, 0.012 * s, sx * sp, y, z + 0.016 * s, h); } };
  if (id === 'kanguru') {
    const c = std(0xc8844a, 0.8), b = std(0xf0d8b0, 0.8);
    part(SPH, c, 0.16, 0.26, 0.17, 0, 0.42, 0, body); part(SPH, b, 0.11, 0.16, 0.08, 0, 0.38, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.74, 0.06); body.add(head); part(SPH, c, 0.09, 0.09, 0.13, 0, 0, 0.03, head); eyes(head, 0.03, 0.12, 0.04, 1);
    for (const sx of [-1, 1]) { const e = part(new THREE.ConeGeometry(1, 1, 6), c, 0.035, 0.12, 0.02, sx * 0.05, 0.12, -0.02, head); e.rotation.z = -sx * 0.2; }
    leg(c, -0.09, 0.22, 0.02, 0.2, 0.05, c, 0.07); leg(c, 0.09, 0.22, 0.02, 0.2, 0.05, c, 0.07); leg(c, -0.1, 0.52, 0.1, 0.12, 0.022, c, 0.03); leg(c, 0.1, 0.52, 0.1, 0.12, 0.022, c, 0.03);
    tail = new THREE.Group(); tail.position.set(0, 0.25, -0.14); body.add(tail); const tg = new THREE.Group(); tg.rotation.x = -1.2; tail.add(tg); part(new THREE.ConeGeometry(1, 1, 8), c, 0.06, 0.5, 0.06, 0, 0.24, 0, tg);
  } else if (id === 'zurafa') {
    const c = std(0xf0c060, 0.8), sp = std(0x9a5a2a, 0.8);
    part(SPH, c, 0.16, 0.15, 0.25, 0, 0.55, 0, body); for (let i = 0; i < 6; i++) part(SPH, sp, 0.05, 0.04, 0.05, (i % 2 ? 1 : -1) * 0.13, 0.55 + (i % 3) * 0.05 - 0.05, -0.15 + i * 0.06, body);
    const nk = part(CYL, c, 0.05, 0.5, 0.05, 0, 0.85, 0.18, body); nk.rotation.x = 0.35;
    head = new THREE.Group(); head.position.set(0, 1.1, 0.28); body.add(head); part(SPH, c, 0.07, 0.07, 0.11, 0, 0, 0.03, head); eyes(head, 0.03, 0.08, 0.045, 0.9);
    for (const sx of [-1, 1]) { part(CYL, sp, 0.012, 0.08, 0.012, sx * 0.03, 0.1, -0.02, head); part(SPH, sp, 0.02, 0.02, 0.02, sx * 0.03, 0.15, -0.02, head); }
    for (const [lx, lz] of [[-0.09, 0.15], [0.09, 0.15], [-0.09, -0.15], [0.09, -0.15]]) leg(c, lx, 0.45, lz, 0.42, 0.028, sp, 0.03);
    tail = new THREE.Group(); tail.position.set(0, 0.6, -0.24); body.add(tail); part(CYL, c, 0.012, 0.25, 0.012, 0, -0.12, 0, tail); part(SPH, sp, 0.03, 0.05, 0.03, 0, -0.26, 0, tail);
  } else if (id === 'tavsan') {
    const c = std(0xf4f0ec, 0.9), p = std(0xffb0c0, 0.7);
    part(SPH, c, 0.15, 0.15, 0.2, 0, 0.22, 0, body); head = new THREE.Group(); head.position.set(0, 0.4, 0.14); body.add(head); part(SPH, c, 0.11, 0.1, 0.1, 0, 0, 0, head); eyes(head, 0.02, 0.085, 0.045, 0.9); part(SPH, p, 0.02, 0.015, 0.012, 0, -0.02, 0.1, head);
    for (const sx of [-1, 1]) { const e = part(SPH, c, 0.03, 0.13, 0.02, sx * 0.04, 0.17, -0.02, head); e.rotation.z = -sx * 0.15; part(SPH, p, 0.015, 0.09, 0.01, sx * 0.04, 0.17, -0.005, head).rotation.z = -sx * 0.15; }
    for (const [lx, lz, h] of [[-0.07, 0.1, 0.1], [0.07, 0.1, 0.1], [-0.08, -0.1, 0.1], [0.08, -0.1, 0.1]]) leg(c, lx, h, lz, 0.08, 0.035, c, 0.045);
    tail = new THREE.Group(); tail.position.set(0, 0.24, -0.2); body.add(tail); part(SPH, c, 0.06, 0.06, 0.06, 0, 0, 0, tail);
  } else if (id === 'koala') {
    const c = std(0x9aa0a8, 0.9), w = std(0xf0eeea, 0.9);
    part(SPH, c, 0.16, 0.2, 0.15, 0, 0.3, 0, body); part(SPH, w, 0.1, 0.13, 0.06, 0, 0.28, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.58, 0.03); body.add(head); part(SPH, c, 0.14, 0.12, 0.12, 0, 0, 0, head); part(SPH, std(0x2a2a2e, 0.4), 0.035, 0.045, 0.03, 0, -0.01, 0.12, head); eyes(head, 0.04, 0.1, 0.06, 0.8);
    for (const sx of [-1, 1]) { part(SPH, c, 0.07, 0.07, 0.03, sx * 0.13, 0.07, -0.02, head); part(SPH, w, 0.045, 0.045, 0.02, sx * 0.13, 0.07, 0.0, head); }
    for (const [lx, lz, y] of [[-0.08, 0.05, 0.14], [0.08, 0.05, 0.14], [-0.17, 0.05, 0.4], [0.17, 0.05, 0.4]]) leg(c, lx, y, lz, 0.13, 0.04, c, 0.045);
    tail = new THREE.Group(); tail.position.set(0, 0.2, -0.14); body.add(tail); part(SPH, c, 0.03, 0.03, 0.03, 0, 0, 0, tail);
  } else if (id === 'tilki') {
    const c = std(0xe8701a, 0.8), w = std(0xf8f4ee, 0.8), k = std(0x2a1a12, 0.7);
    part(SPH, c, 0.14, 0.14, 0.26, 0, 0.28, 0, body); part(SPH, w, 0.09, 0.08, 0.15, 0, 0.24, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.44, 0.24); body.add(head); part(SPH, c, 0.12, 0.1, 0.1, 0, 0, 0, head); const sn = part(new THREE.ConeGeometry(1, 1, 8), w, 0.06, 0.14, 0.05, 0, -0.03, 0.12, head); sn.rotation.x = Math.PI / 2; part(SPH, k, 0.02, 0.02, 0.02, 0, -0.03, 0.2, head); eyes(head, 0.03, 0.08, 0.05, 0.8);
    for (const sx of [-1, 1]) { const e = part(new THREE.ConeGeometry(1, 1, 4), c, 0.05, 0.11, 0.03, sx * 0.07, 0.11, 0, head); e.rotation.z = -sx * 0.25; }
    for (const [lx, lz] of [[-0.07, 0.14], [0.07, 0.14], [-0.07, -0.14], [0.07, -0.14]]) leg(k, lx, 0.2, lz, 0.2, 0.03, k, 0.035);
    tail = new THREE.Group(); tail.position.set(0, 0.3, -0.24); body.add(tail); const tg = new THREE.Group(); tg.rotation.x = -0.9; tail.add(tg); part(SPH, c, 0.08, 0.26, 0.08, 0, 0.2, 0, tg); part(SPH, w, 0.05, 0.07, 0.05, 0, 0.42, 0, tg);
  } else if (id === 'kurbaga') {
    const c = std(0x5ac83a, 0.6), b = std(0xd8f0a0, 0.7);
    part(SPH, c, 0.18, 0.12, 0.17, 0, 0.16, 0, body); part(SPH, b, 0.13, 0.08, 0.1, 0, 0.13, 0.08, body);
    head = new THREE.Group(); head.position.set(0, 0.26, 0.08); body.add(head); for (const sx of [-1, 1]) { part(SPH, c, 0.06, 0.06, 0.06, sx * 0.08, 0.04, 0, head); part(SPH, std(0xffffff, 0.3), 0.045, 0.045, 0.03, sx * 0.08, 0.05, 0.035, head); part(SPH, std(0x111111, 0.3), 0.022, 0.03, 0.012, sx * 0.08, 0.05, 0.063, head); }
    part(BOX, std(0x2a5a1a, 0.6), 0.16, 0.012, 0.01, 0, -0.04, 0.14, head);
    leg(c, -0.13, 0.12, 0.1, 0.1, 0.03, c, 0.05); leg(c, 0.13, 0.12, 0.1, 0.1, 0.03, c, 0.05); leg(c, -0.16, 0.12, -0.1, 0.1, 0.04, c, 0.07); leg(c, 0.16, 0.12, -0.1, 0.1, 0.04, c, 0.07);
    tail = new THREE.Group(); tail.position.set(0, 0.15, -0.15); body.add(tail);
  } else { // ordek
    const c = std(0xffd21a, 0.6), o = std(0xff8a1a, 0.5);
    part(SPH, c, 0.15, 0.14, 0.2, 0, 0.22, 0, body); head = new THREE.Group(); head.position.set(0, 0.44, 0.1); body.add(head); part(SPH, c, 0.1, 0.1, 0.1, 0, 0, 0, head); part(SPH, o, 0.06, 0.02, 0.07, 0, -0.02, 0.11, head); eyes(head, 0.03, 0.08, 0.045, 0.8);
    leg(o, -0.06, 0.1, 0.02, 0.08, 0.018, o, 0.04); leg(o, 0.06, 0.1, 0.02, 0.08, 0.018, o, 0.04);
    const w1 = leg(c, -0.14, 0.3, -0.02, 0.12, 0.05, c, 0.03), w2 = leg(c, 0.14, 0.3, -0.02, 0.12, 0.05, c, 0.03); w1.scale.set(0.5, 1, 1.6); w2.scale.set(0.5, 1, 1.6);
    tail = new THREE.Group(); tail.position.set(0, 0.28, -0.2); body.add(tail); const tc = part(new THREE.ConeGeometry(1, 1, 6), c, 0.06, 0.1, 0.04, 0, 0.03, 0, tail); tc.rotation.x = -1;
  }
  ink(g, 0.014); if (kind === 'dog') g.scale.setScalar(1.15);
  return {g, body, legs, head, tail, s: 1};
}
const NEW_ANI = ['kanguru', 'zurafa', 'tavsan', 'koala', 'tilki', 'kurbaga', 'ordek'];
