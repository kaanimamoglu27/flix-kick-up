// ================= v8: things that make each world look like itself =================
// monuments in the squares (solid: the FLIX bounces off them)
function monuProp(P, top, g) {
  const x = P.x, z = P.z, y = top, M = (geo, mat, px, py, pz) => mesh(geo, mat, x + px, y + py, z + pz, g), st = DM(0xe8e0d0, 0.8);
  const cyl = (r0, r1, h, n) => new THREE.CylinderGeometry(r0, r1, h, n || 16);
  const water = new THREE.MeshStandardMaterial({color: 0x5ab8e8, roughness: 0.1, metalness: 0.2, emissive: 0x1f6fd1, emissiveIntensity: 0.15});
  switch (CUR_THEME) {
    case 'amerika': M(new THREE.BoxGeometry(1.4, 1.2, 1.4), DM(0xb8b0a0), 0, 0.6, 0); M(cyl(0.35, 0.45, 1.6, 10), DM(0x6ab0a0, 0.6), 0, 2.0, 0); M(new THREE.SphereGeometry(0.3, 12, 8), DM(0x6ab0a0, 0.6), 0, 3.0, 0); { const a = M(cyl(0.08, 0.1, 1.0, 6), DM(0x6ab0a0, 0.6), 0.32, 3.2, 0); a.rotation.z = -0.3; } M(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({color: 0xffa020}), 0.48, 3.75, 0); break;
    case 'avrupa': case 'sokak': M(cyl(1.3, 1.4, 0.5, 24), st, 0, 0.25, 0); M(cyl(1.15, 1.15, 0.05, 24), water, 0, 0.48, 0); M(cyl(0.15, 0.25, 1.4, 10), st, 0, 1.1, 0); M(cyl(0.55, 0.3, 0.2, 16), st, 0, 1.8, 0); M(new THREE.SphereGeometry(0.16, 10, 8), water, 0, 2.0, 0); break;
    case 'turkiye': M(new THREE.CylinderGeometry(1.25, 1.35, 0.6, 8), DM(0xf0e8d8, 0.7), 0, 0.3, 0); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; M(cyl(0.06, 0.06, 1.3, 6), DM(0xf0e8d8), Math.cos(a) * 1.05, 1.25, Math.sin(a) * 1.05); } M(new THREE.SphereGeometry(1.25, 18, 10, 0, 6.3, 0, Math.PI / 2), DM(0x8a9aa8, 0.5, 0.3), 0, 1.9, 0); M(cyl(0.05, 0.05, 0.6, 6), DM(0xffc20e, 0.3, 0.6), 0, 3.3, 0); break;
    case 'asya': M(new THREE.BoxGeometry(1.2, 0.5, 1.2), DM(0x8a8a88, 0.9), 0, 0.25, 0); M(cyl(0.22, 0.3, 1.0, 8), DM(0x9a9a98, 0.9), 0, 1.0, 0); M(new THREE.BoxGeometry(0.9, 0.6, 0.9), DM(0x9a9a98, 0.9), 0, 1.8, 0); M(new THREE.BoxGeometry(0.45, 0.35, 0.45), new THREE.MeshStandardMaterial({color: 0xfff0b0, emissive: 0xffc040, emissiveIntensity: 0.7}), 0, 1.8, 0); { const r = M(new THREE.ConeGeometry(1.0, 0.6, 4), DM(0x7a7a78, 0.9), 0, 2.4, 0); r.rotation.y = Math.PI / 4; } break;
    case 'avustralya': for (let i = 0; i < 3; i++) { const b = M(new THREE.SphereGeometry(1, 16, 10), DM([0xff8a1a, 0x1f6fd1, 0xffc20e][i], 0.4), (i - 1) * 0.55, 1.5, 0); b.scale.set(0.3, 1.5, 0.08); b.rotation.z = (i - 1) * 0.25; } M(cyl(1.1, 1.2, 0.3, 20), DM(0xdcc8a0), 0, 0.15, 0); break;
    case 'afrika': M(cyl(0.9, 1.0, 0.4, 14), DM(0x8a5a32), 0, 0.2, 0); for (let i = 0; i < 4; i++) M(cyl(0.38, 0.38, 0.62, 10), DM([0xc8102e, 0xffc20e, 0x2f8a3a, 0x1b1330][i], 0.7), 0, 0.71 + i * 0.62, 0); { const h = M(new THREE.SphereGeometry(0.42, 12, 8), DM(0xffc20e, 0.6), 0, 3.2, 0); h.scale.y = 0.8; } for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.8, 0.12, 0.2), DM(0xc8102e), sx * 0.55, 2.3, 0); break;
    case 'antarktika': { const ice = new THREE.MeshStandardMaterial({color: 0xcfeeff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.9}); M(cyl(1.1, 1.2, 0.4, 8), ice, 0, 0.2, 0); const b = M(new THREE.SphereGeometry(0.55, 14, 10), ice, 0, 1.1, 0); b.scale.y = 1.4; M(new THREE.SphereGeometry(0.34, 14, 10), ice, 0, 2.0, 0); const n = M(new THREE.ConeGeometry(0.08, 0.3, 6), ice, 0, 1.98, 0.35); n.rotation.x = Math.PI / 2; break; }
    case 'uzay': M(cyl(0.9, 1.1, 0.5, 12), DM(0x8a94a6, 0.5, 0.4), 0, 0.25, 0); M(cyl(0.12, 0.12, 1.6, 8), DM(0xd8dce4, 0.4, 0.5), 0, 1.3, 0); { const d = M(new THREE.SphereGeometry(1.0, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), new THREE.MeshStandardMaterial({color: 0xf0f2f6, roughness: 0.35, side: THREE.DoubleSide}), 0, 2.6, 0); d.rotation.x = Math.PI - 0.5; } M(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({color: 0xff2bd6}), 0, 2.3, 0.3); break;
    default: M(cyl(1.0, 1.1, 0.6, 16), st, 0, 0.3, 0); M(cyl(0.3, 0.4, 2, 10), st, 0, 1.6, 0);
  }
  const r = CUR_THEME === 'avrupa' || CUR_THEME === 'sokak' || CUR_THEME === 'turkiye' ? 1.3 : 0.95;
  boxes.push({b: [x - r, x + r, y, y + 0.55, z - r, z + r], kind: 'hard'}, {b: [x - 0.45, x + 0.45, y, y + 2.6, z - 0.45, z + 0.45], kind: 'hard'});
}
// water (or a crater, or an ice crack) under the canal bridges
function waterProp(P, g) {
  const col = {uzay: 0x1b1f2a, antarktika: 0x2a5a8a, afrika: 0x8a6a3a, asya: 0x3a8a8a}[CUR_THEME] || 0x2f7ab8;
  const w = mesh(new THREE.BoxGeometry(P.w, 0.1, P.d), new THREE.MeshStandardMaterial({color: col, roughness: CUR_THEME === 'uzay' ? 0.9 : 0.08, metalness: CUR_THEME === 'uzay' ? 0 : 0.3, emissive: col, emissiveIntensity: 0.12}), P.x, P.y, P.z, g); w.userData.noInk = true;
  for (const sz of [-1, 1]) mesh(new THREE.BoxGeometry(P.w, 1.0, 0.3), std(CUR_THEME === 'uzay' ? 0x5a5c66 : 0x9a8a7a, 0.95), P.x, P.y + 0.45, P.z + sz * (P.d / 2 + 0.15), g);
  if (CUR_THEME === 'antarktika') for (let i = 0; i < 5; i++) mesh(new THREE.CylinderGeometry(0.4 + (i % 3) * 0.2, 0.5 + (i % 3) * 0.2, 0.12, 7), std(0xf4fafe, 0.6), P.x - 4 + i * 2, P.y + 0.08, P.z + ((i % 2) - 0.5) * P.d * 0.5, g);
  if (CUR_THEME !== 'uzay' && CUR_THEME !== 'antarktika') { const duck = new THREE.Group(); mesh(new THREE.SphereGeometry(0.16, 10, 8), std(0xffd21a, 0.5), 0, 0.1, 0, duck); mesh(new THREE.SphereGeometry(0.1, 10, 8), std(0xffd21a, 0.5), 0.12, 0.25, 0, duck); duck.position.set(P.x + 3.6, P.y, P.z); g.add(duck); SPIN.push(Object.assign(new THREE.Group(), {userData: {spin: 0}})); }
}
// cars that belong to the place
function carExtras(P, top, g, axZ) {
  const at = (a, b) => axZ ? [P.x + b, P.z + a] : [P.x + a, P.z + b], M = (geo, mat, a, y, b) => { const [px, pz] = at(a, b); const m = mesh(geo, mat, px, top + y, pz, g); if (axZ) m.rotation.y = Math.PI / 2; return m; };
  switch (CUR_THEME) {
    case 'amerika': { // yellow cab: chequer band and a roof sign
      if (P.col !== 0xffc20e) break; const ck = ctex(128, 16, (x) => { for (let i = 0; i < 16; i++) for (let r = 0; r < 2; r++) { x.fillStyle = (i + r) % 2 ? '#111' : '#fff'; x.fillRect(i * 8, r * 8, 8, 8); } });
      for (const s of [-1, 1]) M(new THREE.PlaneGeometry(2.3, 0.14), new THREE.MeshBasicMaterial({map: ck}), 0, 0.72, s * 0.605).rotation.y = (axZ ? Math.PI / 2 : 0) + (s < 0 ? Math.PI : 0);
      const sg = ctex(96, 32, (x) => { x.fillStyle = '#fff6c0'; x.fillRect(0, 0, 96, 32); x.fillStyle = '#111'; x.font = '900 24px Arial'; x.textAlign = 'center'; x.fillText('TAXI', 48, 25); });
      M(new THREE.BoxGeometry(0.5, 0.18, 0.2), new THREE.MeshStandardMaterial({map: sg, emissive: 0xffe080, emissiveIntensity: 0.4}), -0.05, 1.6, 0); break; }
    case 'turkiye': M(new THREE.BoxGeometry(2.42, 0.16, 1.22), std(0xf4eee2, 0.6), 0, 0.62, 0); M(new THREE.BoxGeometry(0.1, 0.4, 0.5), std(0x333333, 0.5), 0, 1.75, 0); break; // tram-like band + pantograph
    case 'asya': M(new THREE.BoxGeometry(1.5, 0.08, 1.3), std(0x2f8a4a, 0.6), -0.05, 1.56, 0); for (const a of [-0.7, 0.6]) M(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 5), std(0x222222), a, 1.25, 0.55); break; // tuk-tuk canopy
    case 'avustralya': { const b = M(new THREE.SphereGeometry(1, 14, 8), std(0xffc20e, 0.4), 0, 1.62, 0); b.scale.set(1.25, 0.06, 0.24); break; } // surfboard on the roof
    case 'afrika': { const t = M(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 14), std(0x1b1330, 0.6), -1.28, 0.7, 0); t.rotation.z = Math.PI / 2; M(new THREE.BoxGeometry(1.1, 0.05, 1.1), std(0x5a5a3a, 0.7), -0.05, 1.55, 0); break; } // safari jeep
    case 'antarktika': for (const s of [-1, 1]) M(new THREE.BoxGeometry(2.4, 0.32, 0.22), std(0x2a2a2e, 0.8), 0, 0.2, s * 0.58); M(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), std(0xe22511), 0.6, 1.7, 0); break; // snowcat tracks
    case 'uzay': { M(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), std(0xd8dce4), 0.6, 1.75, 0); const d = M(new THREE.SphereGeometry(0.28, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: 0xf0f2f6, side: THREE.DoubleSide}), 0.6, 2.05, 0); d.rotation.x = Math.PI; break; }
    case 'avrupa': for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.5, 0.36, 1.24), std(0xf4eee2, 0.5), s * 0.95, 0.55, 0); break; // round vintage fenders
  }
}
// what hangs across the street
function lineDeco(P, top, g) {
  const sty = {turkiye: 'flagTR', asya: 'lantern', amerika: 'stars', avrupa: 'bunting', antarktika: 'icy', avustralya: 'bunting', afrika: 'kente', uzay: 'bulbs'}[CUR_THEME]; if (!sty) return false;
  const y = top + P.h - 0.05, n = Math.max(4, Math.round((P.x1 - P.x0) / 0.6));
  for (let i = 0; i < n; i++) {
    const x = P.x0 + 0.3 + i * (P.x1 - P.x0 - 0.6) / (n - 1), sag = Math.sin(i / (n - 1) * Math.PI) * 0.25, yy = y - sag;
    if (sty === 'lantern') { const l = mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshStandardMaterial({color: i % 3 ? 0xe8202e : 0xffc20e, emissive: i % 3 ? 0xc81020 : 0xff9a00, emissiveIntensity: 0.5}), x, yy - 0.25, P.z, g); l.scale.y = 1.25; }
    else if (sty === 'bulbs') mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({color: [0x9dff00, 0x00e5ff, 0xff2bd6][i % 3]}), x, yy - 0.08, P.z, g);
    else if (sty === 'kente') addBox(g, std([0xffc20e, 0x2f8a3a, 0xc8102e, 0x1b1330][i % 4], 0.9), x - 0.25, x + 0.25, yy - 0.75, yy, P.z - 0.03, P.z + 0.03, false);
    else { const col = sty === 'flagTR' ? (i % 2 ? 0xffffff : 0xe30a17) : sty === 'stars' ? [0xb22234, 0xffffff, 0x3c3b6e][i % 3] : sty === 'icy' ? (i % 2 ? 0xffffff : 0x8fd8ff) : [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xff8fb8][i % 5];
      const tri = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 3), std(col, 0.8)); tri.rotation.x = Math.PI; tri.scale.z = 0.12; tri.position.set(x, yy - 0.22, P.z); g.add(tri); }
  }
  return true;
}
// roadside details a bit bigger so you notice them
function decoProp8(D, g) { const sg = new THREE.Group(); sg.position.set(D.x, D.top, D.z); sg.scale.setScalar(1.3); g.add(sg); decoProp({...D, x: 0, z: 0, top: 0}, sg); }
