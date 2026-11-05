// ================= v8: each world builds its own street =================
// open worlds (savanna, ice, beach, moon) have low edges with huts / igloos / palms / domes instead of a wall of shops
const OPEN_W = {afrika: 1, antarktika: 1, avustralya: 1, uzay: 1};
function lotFrame(P) { // street-side facade line of a lot: u runs along it, n points into the street
  const f = P.face, ax = f === '+x' || f === '-x';
  const len = ax ? P.z1 - P.z0 : P.x1 - P.x0, dep = ax ? P.x1 - P.x0 : P.z1 - P.z0;
  const at = (u, n) => f === '+x' ? [P.x1 + n, P.z0 + u] : f === '-x' ? [P.x0 - n, P.z0 + u] : f === '+z' ? [P.x0 + u, P.z1 + n] : [P.x0 + u, P.z0 - n];
  return {len, dep, ax, at, rot: f === '+x' ? Math.PI / 2 : f === '-x' ? -Math.PI / 2 : f === '+z' ? 0 : Math.PI};
}
function themedLot(g, P) {
  const F = lotFrame(P), base = P.base || 0.22, h = P.h, th = CUR_THEME;
  boxes.push({b: [P.x0, P.x1, base - 2, base + h, P.z0, P.z1], kind: 'hard'}); // the edge still keeps the FLIX in
  addBox(g, std(th === 'uzay' ? 0x5a5c66 : th === 'antarktika' ? 0xdfeef8 : th === 'afrika' ? 0xa8743a : 0xd8c8a0, 1), P.x0 + 0.05, P.x1 - 0.05, base - 1.2, base, P.z0 + 0.05, P.z1 - 0.05, false);
  const ground = th === 'uzay' ? 0x9a9ca6 : th === 'antarktika' ? 0xf4fafe : th === 'afrika' ? 0xd8a860 : 0xf0dca0;
  addBox(g, std(ground, 0.95), P.x0, P.x1, base, base + 0.04, P.z0, P.z1, false);
  const M = (geo, mat, u, y, n, par) => { const [x, z] = F.at(u, n); const m = mesh(geo, mat, x, base + y, z, par || g); m.rotation.y = F.rot; return m; };
  const edgeH = 1.05, back = -F.dep / 2;
  // the low edge along the street
  if (th === 'afrika') { // mud wall with a rounded top
    const w = std(0xc0783e, 0.95); for (let u = 0; u < F.len - 0.05; u += 1.2) { const l = Math.min(1.2, F.len - u); M(new THREE.BoxGeometry(l - 0.04, edgeH, 0.32), w, u + l / 2, edgeH / 2, -0.18); const c = M(new THREE.CylinderGeometry(0.16, 0.16, l - 0.04, 8), w, u + l / 2, edgeH, -0.18); c.rotation.z = Math.PI / 2; c.rotation.y = F.rot + Math.PI / 2; }
  } else if (th === 'antarktika') { // snowbank
    const s = std(0xf8fcff, 0.8); for (let u = 0.4; u < F.len; u += 0.8) { const b = M(new THREE.SphereGeometry(0.62, 10, 8), s, u, 0.25, -0.35); b.scale.set(1.1, 0.95 + ((u * 7) % 3) * 0.15, 0.7); }
  } else if (th === 'avustralya') { // white picket fence
    const s = std(0xffffff, 0.6); for (let u = 0.15; u < F.len; u += 0.32) { M(new THREE.BoxGeometry(0.1, 0.95, 0.05), s, u, 0.48, -0.1); M(new THREE.ConeGeometry(0.07, 0.12, 4), s, u, 1.0, -0.1); }
    M(new THREE.BoxGeometry(F.len, 0.08, 0.05), s, F.len / 2, 0.75, -0.13); M(new THREE.BoxGeometry(F.len, 0.08, 0.05), s, F.len / 2, 0.3, -0.13);
  } else { // moon base barrier, yellow and black
    const yb = ctex(64, 16, (x) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#1b1330' : '#ffc20e'; x.beginPath(); x.moveTo(i * 8, 16); x.lineTo(i * 8 + 8, 16); x.lineTo(i * 8 + 16, 0); x.lineTo(i * 8 + 8, 0); x.fill(); } }); yb.wrapS = THREE.RepeatWrapping; yb.repeat.set(F.len / 1.2, 1);
    M(new THREE.BoxGeometry(F.len, 0.25, 0.12), new THREE.MeshStandardMaterial({map: yb, roughness: 0.6}), F.len / 2, 0.85, -0.1); for (let u = 0.2; u < F.len; u += 1.4) M(new THREE.BoxGeometry(0.12, 0.85, 0.12), std(0x8a94a6, 0.5, 0.4), u, 0.42, -0.1);
  }
  // what stands on the lot
  let u = 0.3 + srnd(0, 0.5);
  while (u < F.len - 0.8) {
    const r = srnd(0, 1), n = back + srnd(-0.25, 0.25);
    if (th === 'afrika') {
      if (r < 0.55) { // round hut with a thatched roof
        const hr = 0.8 + srnd(0, 0.2); M(new THREE.CylinderGeometry(hr, hr, 1.5, 14), std([0xd89a5a, 0xc8844a, 0xe0b080][Math.floor(srnd(0, 3))], 0.95), u + hr, 0.75, n);
        M(new THREE.ConeGeometry(hr * 1.35, 1.25, 14), std(0xc8a050, 1), u + hr, 2.1, n); M(new THREE.BoxGeometry(0.5, 0.85, 0.06), std(0x3a2a1a, 0.9), u + hr, 0.42, n + hr + 0.01);
        u += hr * 2 + 0.5;
      } else { // acacia: thin trunk, flat crown
        M(new THREE.CylinderGeometry(0.08, 0.13, 2.6, 6), std(0x6a4a2a, 0.9), u + 0.8, 1.3, n); const c = M(new THREE.CylinderGeometry(1.35, 1.1, 0.4, 12), std(0x7a9a3a, 0.9), u + 0.8, 2.8, n); c.scale.z = 0.8; M(new THREE.CylinderGeometry(0.85, 0.85, 0.3, 10), std(0x6a8a32, 0.9), u + 1.3, 3.05, n);
        u += 2.2;
      }
    } else if (th === 'antarktika') {
      if (r < 0.5) { // igloo with an entrance
        const ig = new THREE.MeshStandardMaterial({map: iglooTex(), roughness: 0.6}); M(new THREE.SphereGeometry(0.95, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), ig, u + 0.95, 0, n);
        const t = M(new THREE.CylinderGeometry(0.38, 0.38, 0.7, 12, 1, false, 0, Math.PI), ig, u + 0.95, 0, n + 0.95); t.rotation.set(Math.PI / 2, 0, -Math.PI / 2); t.rotation.y = F.rot; t.rotation.order = 'YXZ';
        u += 2.4;
      } else if (r < 0.75) { // orange research hut
        M(new THREE.BoxGeometry(1.7, 1.4, 1.4), std(0xff7a1a, 0.6), u + 0.85, 0.85, n); M(new THREE.BoxGeometry(1.8, 0.12, 1.5), std(0xf4fafe, 0.6), u + 0.85, 1.6, n);
        M(new THREE.BoxGeometry(0.4, 0.4, 0.04), std(0x8fc4dc, 0.15, 0.3), u + 0.5, 1.0, n + 0.72); for (const q of [0.2, 1.5]) M(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), std(0x5a5c66), u + q, 0.15, n);
        u += 2.3;
      } else { // ice blocks
        const ic = new THREE.MeshStandardMaterial({color: 0xbfe6ff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.85});
        for (let q = 0; q < 3; q++) M(new THREE.BoxGeometry(0.7, 0.7, 0.7), ic, u + 0.4 + q * 0.72, 0.35, n); M(new THREE.BoxGeometry(0.7, 0.7, 0.7), ic, u + 0.76, 1.05, n);
        u += 2.6;
      }
    } else if (th === 'avustralya') {
      if (r < 0.55) { // palm
        const pt = new THREE.Group(); const [px, pz] = F.at(u + 0.6, n); pt.position.set(px, base, pz); g.add(pt);
        for (let q = 0; q < 7; q++) mesh(new THREE.CylinderGeometry(0.12 - q * 0.008, 0.14 - q * 0.008, 0.62, 7), std(q % 2 ? 0x9a7a4a : 0x8a6a3a, 0.9), q * 0.06, 0.3 + q * 0.6, 0, pt);
        for (let q = 0; q < 7; q++) { const lf = mesh(new THREE.BoxGeometry(1.5, 0.04, 0.32), std(q % 2 ? 0x3a9a3a : 0x2f8a32, 0.8), 0.42, 4.2, 0, pt); const a = q / 7 * Math.PI * 2; lf.geometry.translate(0.75, 0, 0); lf.position.set(0.42, 4.25, 0); lf.rotation.set(0, a, -0.45); }
        for (let q = 0; q < 3; q++) mesh(new THREE.SphereGeometry(0.11, 8, 6), std(0x6a4a2a, 0.8), 0.42 + Math.cos(q * 2) * 0.15, 4.05, Math.sin(q * 2) * 0.15, pt);
        u += 1.8;
      } else if (r < 0.8) { // beach umbrella and a surfboard
        M(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 6), std(0xffffff), u + 0.7, 1.0, n); const um = M(new THREE.ConeGeometry(1.0, 0.45, 8, 1, true), new THREE.MeshStandardMaterial({map: stripeTex(['#ff8a1a', '#ffffff']), side: THREE.DoubleSide, roughness: 0.7}), u + 0.7, 2.05, n);
        const sb = M(new THREE.SphereGeometry(1, 14, 8), std([0x1f6fd1, 0xffc20e, 0xe22511][Math.floor(srnd(0, 3))], 0.4), u + 1.5, 1.0, n - 0.3); sb.scale.set(0.24, 1.0, 0.06);
        u += 2.2;
      } else { // little surf shack
        M(new THREE.BoxGeometry(1.8, 1.6, 1.4), std(0x7ac8d8, 0.8), u + 0.9, 0.8, n); const rf = M(new THREE.BoxGeometry(2.1, 0.12, 1.8), std(0xffc20e, 0.7), u + 0.9, 1.7, n); M(new THREE.BoxGeometry(1.0, 0.6, 0.04), std(0x1b1330, 0.7), u + 0.9, 0.9, n + 0.71);
        u += 2.4;
      }
    } else { // moon: glass domes, antennas, fuel tanks
      if (r < 0.5) { const dr = 0.95 + srnd(0, 0.25); M(new THREE.CylinderGeometry(dr, dr, 0.3, 18), std(0xd8dce4, 0.4, 0.5), u + dr, 0.15, n); M(new THREE.SphereGeometry(dr, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: 0x9adcff, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55, emissive: 0x1f6fd1, emissiveIntensity: 0.2}), u + dr, 0.3, n); M(new THREE.SphereGeometry(0.35, 10, 8), std(0x2fa84f, 0.8), u + dr, 0.55, n); u += dr * 2 + 0.6; }
      else if (r < 0.75) { M(new THREE.CylinderGeometry(0.05, 0.08, 3.2, 6), std(0xd8dce4, 0.4, 0.5), u + 0.5, 1.6, n); const d = M(new THREE.SphereGeometry(0.6, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2.5), new THREE.MeshStandardMaterial({color: 0xf0f2f6, roughness: 0.35, side: THREE.DoubleSide}), u + 0.5, 3.1, n); d.rotation.x = 2.4; M(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshBasicMaterial({color: 0xff2a2a}), u + 0.5, 3.25, n); u += 1.6; }
      else { for (let q = 0; q < 2; q++) { const t = M(new THREE.CylinderGeometry(0.42, 0.42, 1.6, 14), std(q ? 0xe8ecf2 : 0xff7a1a, 0.4, 0.3), u + 0.5 + q * 0.95, 0.8, n); M(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(q ? 0xe8ecf2 : 0xff7a1a, 0.4, 0.3), u + 0.5 + q * 0.95, 1.6, n); } u += 2.4; }
    }
  }
}
let _iglooT = null; function iglooTex() { return _iglooT || (_iglooT = ctex(128, 64, (x, w, h) => { x.fillStyle = '#f8fcff'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,170,210,.55)'; x.lineWidth = 2; for (let r = 0; r < 6; r++) { x.beginPath(); x.moveTo(0, r * 11); x.lineTo(w, r * 11); x.stroke(); for (let c = 0; c < 8; c++) { const xx = c * 16 + (r % 2) * 8; x.beginPath(); x.moveTo(xx, r * 11); x.lineTo(xx, r * 11 + 11); x.stroke(); } } })); }
const _stripeT = {}; function stripeTex(c) { const k = c.join(); return _stripeT[k] || (_stripeT[k] = ctex(128, 16, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = c[i % c.length]; x.fillRect(i * 16, 0, 16, h); } })); }

// city worlds: details stuck on the facades you see from the street
function facadeExtra(g, P) {
  const th = CUR_THEME; if (th === 'sokak' || P.h < 2.6) return;
  const F = lotFrame(P), base = P.base || 0.22, h = P.h;
  const M = (geo, mat, u, y, n) => { const [x, z] = F.at(u, n); const m = mesh(geo, mat, x, base + y, z, g); m.rotation.y = F.rot; return m; };
  const L = F.len;
  if (th === 'turkiye') { // wooden cumba (bay window) upstairs and a red flag
    if (h > 3.6) { const cw = Math.min(2.0, L - 0.8), cu = L / 2, wd = std(new THREE.Color(P.col).offsetHSL(0, 0.05, -0.12).getHex(), 0.85);
      M(new THREE.BoxGeometry(cw, 1.3, 0.55), wd, cu, 2.9, 0.27); M(new THREE.BoxGeometry(cw + 0.2, 0.12, 0.7), std(0x5a3a22, 0.8), cu, 3.6, 0.3); M(new THREE.BoxGeometry(cw + 0.1, 0.1, 0.62), std(0x5a3a22, 0.8), cu, 2.22, 0.3);
      for (let q = 0; q < 3; q++) M(new THREE.BoxGeometry(cw / 3 - 0.14, 0.7, 0.03), std(0x8fc4dc, 0.15, 0.3), cu - cw / 3 + q * cw / 3, 2.95, 0.56);
      for (let q = 0; q < 3; q++) { const b = M(new THREE.BoxGeometry(0.06, 0.5, 0.06), std(0x5a3a22, 0.8), cu - cw / 2 + 0.1 + q * (cw - 0.2) / 2, 2.0, 0.42); b.rotation.x = 0.7; } }
    if (srnd(0, 1) < 0.35) { const pole = M(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 6), std(0xdddddd), 0.4, 3.4, 0.5); pole.rotation.x = 0; const [x, z] = F.at(0.4, 0.9); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.52), new THREE.MeshStandardMaterial({map: trFlagTex(), side: THREE.DoubleSide, roughness: 0.7})); fl.position.set(x, base + 3.8, z); fl.rotation.y = F.rot + Math.PI / 2; g.add(fl); }
  } else if (th === 'asya') { // curved red eaves over the shop and two lanterns
    const ew = L - 0.4, e = M(new THREE.BoxGeometry(ew, 0.08, 0.55), std(0xb8102e, 0.6), L / 2, 2.35, 0.27);
    for (const s of [0.1, L - 0.1]) { const tip = M(new THREE.ConeGeometry(0.1, 0.4, 5), std(0xffc20e, 0.4, 0.4), s, 2.42, 0.55); tip.rotation.z = s < 1 ? 0.9 : -0.9; }
    M(new THREE.BoxGeometry(ew, 0.06, 0.1), std(0xffc20e, 0.4, 0.4), L / 2, 2.3, 0.55);
    for (const s of [0.6, L - 0.6]) { const l = M(new THREE.SphereGeometry(0.2, 12, 10), new THREE.MeshStandardMaterial({color: 0xe8202e, emissive: 0xc81020, emissiveIntensity: 0.55}), s, 1.85, 0.75); l.scale.y = 1.3; M(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), std(0x1b1330), s, 2.13, 0.75); }
    if (h > 5) { const e2 = M(new THREE.BoxGeometry(ew, 0.08, 0.6), std(0x2a2a30, 0.6), L / 2, h - 0.6, 0.28); e2.rotation.x = 0.3; }
  } else if (th === 'amerika') { // black fire escape zig-zag
    if (h > 5 && srnd(0, 1) < 0.7) { const fe = std(0x22242a, 0.5, 0.4), w = Math.min(2.2, L - 0.6), cu = 0.3 + w / 2;
      for (let y = 3.2; y < h - 0.8; y += 1.9) { M(new THREE.BoxGeometry(w, 0.06, 0.7), fe, cu, y, 0.36); M(new THREE.BoxGeometry(w, 0.5, 0.03), fe, cu, y + 0.28, 0.7); const st = M(new THREE.BoxGeometry(0.06, 0.05, 2.1), fe, cu, y + 0.95, 0.4); st.rotation.order = 'YXZ'; st.rotation.y = F.rot + Math.PI / 2; st.rotation.x = 0.68; }
      M(new THREE.BoxGeometry(0.05, h - 3.4, 0.05), fe, cu - w / 2, (h + 2.8) / 2, 0.7); }
    if (srnd(0, 1) < 0.5) { const sg = M(new THREE.BoxGeometry(0.12, 1.3, 0.5), new THREE.MeshStandardMaterial({color: 0xff2bd6, emissive: 0xff2bd6, emissiveIntensity: 0.6}), L - 0.4, 2.9, 0.3); }
  } else if (th === 'avrupa') { // flower boxes under the windows and a striped awning
    const aw = M(new THREE.BoxGeometry(L - 0.6, 0.06, 0.9), new THREE.MeshStandardMaterial({map: stripeTex(['#2f8a4a', '#f4eee2']), roughness: 0.7}), L / 2, 2.2, 0.42); aw.rotation.x = 0.32;
    for (let y = 3.0; y < h - 0.6; y += 1.5) for (let u = 0.7; u < L - 0.4; u += 1.3) { M(new THREE.BoxGeometry(0.7, 0.18, 0.22), std(0x8a3a1a, 0.8), u, y, 0.11); for (let q = 0; q < 3; q++) M(new THREE.SphereGeometry(0.09, 6, 5), std([0xe22511, 0xff8fb8, 0xffc20e][q], 0.8), u - 0.22 + q * 0.22, y + 0.14, 0.12); }
  }
}
let _trF = null; function trFlagTex() { return _trF || (_trF = ctex(96, 64, (x, w, h) => { x.fillStyle = '#e30a17'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.arc(36, 32, 16, 0, 7); x.fill(); x.fillStyle = '#e30a17'; x.beginPath(); x.arc(41, 32, 13, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7.5; x.lineTo(60 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.fill(); })); }
