// ================= v8: detailed FLIX skins (pattern, feather print, accessory) + real 3D shop pictures =================
const SKIN_LOOK = {
  klasik: {pat: 'gloss'}, okyanus: {pat: 'waves', fp: 'vein', acc: 'bubbles'}, orman: {pat: 'leaves', fp: 'vein', acc: 'leaf'},
  seker: {pat: 'sprinkles', fp: 'fluff', acc: 'cherryTop'}, gunbatimi: {pat: 'sunset', fp: 'tip'}, bayrak: {pat: 'moonstar', b1: 0xffffff, b2: 0xe22511},
  gece: {pat: 'stars', fp: 'spark', acc: 'moon', b1: 0x00e5ff}, buz: {pat: 'crack', fp: 'frost', acc: 'icicles', b1: 0x8fd8ff},
  altin: {pat: 'shine', fp: 'tip', acc: 'crown', b1: 0x8a5a00, b2: 0xfff1b8}, ejder: {pat: 'scales', fp: 'flame', acc: 'horns', b1: 0xffc20e, b2: 0xff3a00},
  nane: {pat: 'candy', fp: 'vein', acc: 'mint'}, kiraz: {pat: 'dots', fp: 'vein', acc: 'cherries', b1: 0x2f8a3a},
  karpuz: {pat: 'melon', fp: 'seeds', acc: 'leaf', b1: 0xb8f4a0, b2: 0xff4a5a}, ari: {pat: 'bee', fp: 'bee', acc: 'antennae', b1: 0x1b1330, b2: 0xffffff},
  lale: {pat: 'petals', fp: 'tip', acc: 'collar', b1: 0x2f8a3a}, zumrut: {pat: 'facet', fp: 'tip', acc: 'gem', b1: 0xffc20e, b2: 0x5ae8a0},
  lav: {pat: 'lava', fp: 'flame', b1: 0x1b1010, b2: 0xff5a00}, neon: {pat: 'grid', fp: 'spark', acc: 'halo', b1: 0x00ffd0, b2: 0xff00c8, glowBand: 1},
  galaksi: {pat: 'nebula', fp: 'spark', acc: 'ring', b1: 0xb8a0ff}, krom: {pat: 'chrome', fp: 'chrome', acc: 'visor', b1: 0x1b1330, b2: 0x8a94a6},
};
const hexC = (v) => '#' + v.toString(16).padStart(6, '0');
const _skT = {};
function skinBodyTex(S) {
  if (_skT[S.id]) return _skT[S.id];
  const L = SKIN_LOOK[S.id] || {}, base = hexC(S.body);
  const t = ctex(512, 256, (x, w, h) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    const R = lrng(S.id.length * 977 + S.id.charCodeAt(0) * 31), rr = (a, b) => a + R() * (b - a);
    const dots = (n, r0, r1, cols) => { for (let i = 0; i < n; i++) { x.fillStyle = cols[i % cols.length]; x.beginPath(); x.arc(rr(0, w), rr(0, h), rr(r0, r1), 0, 7); x.fill(); } };
    const star = (cx, cy, r, c) => { x.fillStyle = c; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.fill(); };
    switch (L.pat) {
      case 'waves': x.strokeStyle = 'rgba(160,230,255,.75)'; x.lineWidth = 7; for (let y = 30; y < h; y += 34) { x.beginPath(); for (let xx = 0; xx <= w; xx += 8) x.lineTo(xx, y + Math.sin(xx / 22) * 8); x.stroke(); } x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2.5; for (let y = 44; y < h; y += 68) { x.beginPath(); for (let xx = 0; xx <= w; xx += 8) x.lineTo(xx, y + Math.sin(xx / 22 + 1) * 8); x.stroke(); } break;
      case 'leaves': for (let i = 0; i < 46; i++) { x.save(); x.translate(rr(0, w), rr(0, h)); x.rotate(rr(0, 6.3)); x.fillStyle = ['#3f9a3a', '#1f5a2a', '#9ad13a'][i % 3]; x.beginPath(); x.ellipse(0, 0, 18, 7, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-16, 0); x.lineTo(16, 0); x.stroke(); x.restore(); } break;
      case 'sprinkles': for (let i = 0; i < 160; i++) { x.save(); x.translate(rr(0, w), rr(0, h)); x.rotate(rr(0, 6.3)); x.fillStyle = ['#ffffff', '#5fd3e6', '#ffc20e', '#7a4fb0', '#2fa84f'][i % 5]; x.fillRect(-6, -2, 12, 4); x.restore(); } break;
      case 'sunset': { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd23a'); g.addColorStop(0.4, '#ff7a1a'); g.addColorStop(0.75, '#e22511'); g.addColorStop(1, '#5a2a8a'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,240,180,.55)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(64 + i * 128, 70, 26, 0, 7); x.fill(); } break; }
      case 'moonstar': for (let i = 0; i < 3; i++) { const cx = 80 + i * 170, cy = 120; x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 40, 0, 7); x.fill(); x.fillStyle = base; x.beginPath(); x.arc(cx + 11, cy, 32, 0, 7); x.fill(); star(cx + 50, cy, 16, '#fff'); } break;
      case 'stars': dots(90, 1, 2.6, ['#ffffff', '#bfe9ff']); for (let i = 0; i < 14; i++) star(rr(0, w), rr(0, h), rr(5, 10), ['#00e5ff', '#ff2bd6', '#9dff00', '#ffffff'][i % 4]); break;
      case 'crack': { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e8f8ff'); g.addColorStop(1, '#8fd0f4'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 2.5; for (let i = 0; i < 14; i++) { let px = rr(0, w), py = rr(0, h); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += rr(-28, 28); py += rr(-22, 22); x.lineTo(px, py); } x.stroke(); } dots(40, 1, 3, ['rgba(255,255,255,.9)']); break; }
      case 'shine': { const g = x.createLinearGradient(0, 0, w, h); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, i % 2 ? '#ffe27a' : '#e8a000'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = '#a86a00'; x.lineWidth = 3; for (let y = 40; y < h; y += 60) { x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } for (let i = 0; i < 8; i++) { x.fillStyle = ['#e22511', '#1f6fd1', '#2fa84f'][i % 3]; x.beginPath(); x.arc(32 + i * 64, 100, 9, 0, 7); x.fill(); x.strokeStyle = '#fff1b8'; x.lineWidth = 2; x.stroke(); } break; }
      case 'scales': for (let r = 0; r < 14; r++) for (let c = 0; c < 26; c++) { const cx = c * 20 + (r % 2) * 10, cy = r * 18; x.fillStyle = r % 3 === 0 ? '#5a1010' : '#3a0d0d'; x.beginPath(); x.arc(cx, cy, 12, 0, Math.PI); x.fill(); x.strokeStyle = '#ff5a00'; x.lineWidth = 1.6; x.beginPath(); x.arc(cx, cy, 12, 0.2, Math.PI - 0.2); x.stroke(); } break;
      case 'candy': x.fillStyle = '#ffffff'; for (let i = -10; i < 30; i++) { x.beginPath(); x.moveTo(i * 36, 0); x.lineTo(i * 36 + 16, 0); x.lineTo(i * 36 + 16 + h * 0.6, h); x.lineTo(i * 36 + h * 0.6, h); x.fill(); } x.fillStyle = 'rgba(47,168,122,.6)'; for (let i = -10; i < 30; i++) { x.beginPath(); x.moveTo(i * 36 + 20, 0); x.lineTo(i * 36 + 25, 0); x.lineTo(i * 36 + 25 + h * 0.6, h); x.lineTo(i * 36 + 20 + h * 0.6, h); x.fill(); } break;
      case 'dots': dots(70, 4, 9, ['rgba(255,255,255,.85)', 'rgba(255,140,160,.8)']); break;
      case 'melon': for (let i = 0; i < 16; i++) { x.fillStyle = '#16501f'; x.beginPath(); const cx = i * 32 + 8; x.moveTo(cx, 0); for (let y = 0; y <= h; y += 16) x.lineTo(cx + (y / 16 % 2 ? 8 : -2), y); for (let y = h; y >= 0; y -= 16) x.lineTo(cx + 12 + (y / 16 % 2 ? 8 : -2), y); x.fill(); } break;
      case 'bee': for (let y = 0; y < h; y += 64) { x.fillStyle = '#1b1330'; x.fillRect(0, y + 34, w, 28); } dots(10, 2, 4, ['rgba(255,255,255,.4)']); break;
      case 'petals': for (let i = 0; i < 9; i++) { const cx = 28 + i * 58; for (const [dy, col] of [[0, '#ff8fb8'], [10, '#ffc20e']]) { x.fillStyle = col; x.beginPath(); x.moveTo(cx, 200 - dy); x.quadraticCurveTo(cx - 26, 140 - dy, cx, 90 - dy); x.quadraticCurveTo(cx + 26, 140 - dy, cx, 200 - dy); x.fill(); } x.fillStyle = '#2f8a3a'; x.fillRect(cx - 2, 200, 4, 56); } break;
      case 'facet': for (let r = 0; r < 8; r++) for (let c = 0; c < 16; c++) { const cx = c * 32 + (r % 2) * 16, cy = r * 32; x.fillStyle = ['#0f7a4a', '#1a9a5a', '#0a5a3a', '#3ac880'][(r + c * 3) % 4]; x.beginPath(); x.moveTo(cx, cy - 16); x.lineTo(cx + 16, cy); x.lineTo(cx, cy + 16); x.lineTo(cx - 16, cy); x.fill(); } x.strokeStyle = 'rgba(200,255,230,.5)'; x.lineWidth = 1; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16 - h, h); x.stroke(); x.beginPath(); x.moveTo(i * 16 - h, 0); x.lineTo(i * 16, h); x.stroke(); } break;
      case 'lava': x.fillStyle = '#2a0a08'; x.fillRect(0, 0, w, h); x.lineCap = 'round'; for (let i = 0; i < 22; i++) { let px = rr(0, w), py = rr(0, h); x.strokeStyle = i % 3 ? '#ff5a00' : '#ffc20e'; x.lineWidth = rr(3, 7); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 4; k++) { px += rr(-34, 34); py += rr(-24, 24); x.lineTo(px, py); } x.stroke(); } break;
      case 'grid': x.fillStyle = '#0a0a1a'; x.fillRect(0, 0, w, h); x.lineWidth = 3; for (let xx = 0; xx < w; xx += 32) { x.strokeStyle = '#00ffd0'; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, h); x.stroke(); } for (let y = 16; y < h; y += 32) { x.strokeStyle = '#ff00c8'; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); } break;
      case 'nebula': { for (let i = 0; i < 9; i++) { const g = x.createRadialGradient(rr(0, w), rr(0, h), 2, rr(0, w), rr(0, h), rr(60, 120)); const c = ['rgba(184,160,255,.7)', 'rgba(90,216,255,.6)', 'rgba(255,143,232,.6)'][i % 3]; g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); } dots(120, 0.8, 2.2, ['#ffffff']); for (let i = 0; i < 6; i++) star(rr(0, w), rr(0, h), 6, '#fff'); break; }
      case 'chrome': { const g = x.createLinearGradient(0, 0, 0, h); [['#f8faff', 0], ['#8a94a6', 0.3], ['#ffffff', 0.45], ['#5a6070', 0.7], ['#d8dce4', 1]].forEach(([c, s]) => g.addColorStop(s, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); break; }
      default: { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }
    }
  });
  return (_skT[S.id] = t);
}
function skinFeTex(S, i) {
  const k = S.id + '_' + i; if (_skT[k]) return _skT[k];
  const L = SKIN_LOOK[S.id] || {}, c = new THREE.Color(S.fe[i]), lt = '#' + c.clone().offsetHSL(0, 0, 0.16).getHexString(), dk = '#' + c.clone().offsetHSL(0, 0, -0.16).getHexString(), base = hexC(S.fe[i]);
  const t = ctex(64, 128, (x, w, h) => {
    const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, dk); g.addColorStop(0.5, base); g.addColorStop(1, lt); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = lrng(k.length * 131 + i * 17), rr = (a, b) => a + R() * (b - a);
    switch (L.fp) {
      case 'flame': { const f = x.createLinearGradient(0, h, 0, 0); f.addColorStop(0, '#ffe14a'); f.addColorStop(0.45, base); f.addColorStop(1, '#5a0a00'); x.fillStyle = f; x.fillRect(0, 0, w, h); break; }
      case 'tip': x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(w / 2, 10, w * 0.5, 22, 0, 0, 7); x.fill(); break;
      case 'spark': for (let q = 0; q < 26; q++) { x.fillStyle = q % 2 ? '#ffffff' : 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(rr(4, w - 4), rr(4, h - 4), rr(0.8, 2.4), 0, 7); x.fill(); } break;
      case 'frost': x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = 1.4; for (let q = 0; q < 8; q++) { const cx = rr(8, w - 8), cy = rr(8, h - 8); for (let a = 0; a < 3; a++) { x.beginPath(); x.moveTo(cx - Math.cos(a) * 6, cy - Math.sin(a) * 6); x.lineTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6); x.stroke(); } } break;
      case 'bee': for (let y = 10; y < h; y += 26) { x.fillStyle = i === 1 ? 'rgba(27,19,48,.85)' : 'rgba(255,194,14,.9)'; x.fillRect(0, y, w, 11); } break;
      case 'seeds': for (let q = 0; q < 12; q++) { x.fillStyle = '#1b1330'; x.beginPath(); x.ellipse(rr(10, w - 10), rr(20, h - 10), 2, 3.6, rr(-0.5, 0.5), 0, 7); x.fill(); } x.fillStyle = '#2f8a3a'; x.fillRect(0, h - 10, w, 10); x.fillStyle = '#b8f4a0'; x.fillRect(0, h - 14, w, 4); break;
      case 'fluff': for (let q = 0; q < 18; q++) { x.fillStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.arc(rr(0, w), rr(0, h), rr(4, 9), 0, 7); x.fill(); } break;
      case 'chrome': { const f = x.createLinearGradient(0, 0, w, 0); f.addColorStop(0, '#8a94a6'); f.addColorStop(0.5, '#ffffff'); f.addColorStop(1, '#8a94a6'); x.fillStyle = f; x.fillRect(0, 0, w, h); break; }
    }
    // central vein + side barbs, every skin
    x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, 6); x.stroke();
    x.strokeStyle = L.fp === 'vein' ? 'rgba(0,0,0,.28)' : 'rgba(0,0,0,.14)'; x.lineWidth = 1.2; for (let y = 18; y < h - 6; y += 9) { x.beginPath(); x.moveTo(w / 2, y + 6); x.lineTo(4, y - 4); x.moveTo(w / 2, y + 6); x.lineTo(w - 4, y - 4); x.stroke(); }
  });
  return (_skT[k] = t);
}
// accessories that sit on the toy (toy units: body radius .36, top .46)
function skinAcc(S) {
  const L = SKIN_LOOK[S.id] || {}, g = new THREE.Group(), M = (geo, mat, x, y, z) => mesh(geo, mat, x, y, z, g);
  const glow = (c, i) => new THREE.MeshStandardMaterial({color: c, emissive: c, emissiveIntensity: i || 0.6, roughness: 0.3});
  switch (L.acc) {
    case 'crown': { const gd = new THREE.MeshStandardMaterial({color: 0xffc20e, metalness: 0.8, roughness: 0.2, emissive: 0x8a5a00, emissiveIntensity: 0.3}); const r = M(new THREE.CylinderGeometry(0.3, 0.33, 0.12, 20, 1, true), gd, 0, 0.52, 0); r.material.side = THREE.DoubleSide; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; M(new THREE.ConeGeometry(0.06, 0.16, 4), gd, Math.sin(a) * 0.31, 0.66, Math.cos(a) * 0.31); M(new THREE.SphereGeometry(0.03, 8, 6), glow([0xe22511, 0x1f6fd1, 0x2fa84f][i % 3], 0.4), Math.sin(a) * 0.33, 0.53, Math.cos(a) * 0.33); } break; }
    case 'horns': for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.07, 0.36, 8), std(0xf4e8c8, 0.5), s * 0.3, 0.55, 0.05); h.rotation.z = -s * 0.7; h.rotation.x = -0.2; } for (let i = 0; i < 4; i++) { const sp = M(new THREE.ConeGeometry(0.05, 0.16, 4), std(0xff5a00, 0.5), 0, 0.12 + i * 0.09, -0.34 - Math.sin(i) * 0.02); sp.rotation.x = -1.3; } for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.045, 8, 6), glow(0xffc20e, 1.0), s * 0.13, 0.3, 0.33); break;
    case 'antennae': for (const s of [-1, 1]) { const a = M(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 5), std(0x1b1330, 0.5), s * 0.2, 0.62, 0.12); a.rotation.z = -s * 0.5; M(new THREE.SphereGeometry(0.05, 8, 6), std(0x1b1330, 0.4), s * 0.3, 0.8, 0.12); const wg = M(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshStandardMaterial({color: 0xe8f4ff, transparent: true, opacity: 0.6, roughness: 0.1}), s * 0.32, 0.38, -0.25); wg.scale.set(1, 0.55, 0.12); wg.rotation.y = s * 0.6; wg.userData.noInk = true; } for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.045, 8, 6), std(0x1b1330, 0.3), s * 0.12, 0.3, 0.33); break;
    case 'cherries': for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.09, 12, 10), std(0xc8102e, 0.25), 0.36 + s * 0.06, 0.08, 0.1 + s * 0.04); const st = M(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 4), std(0x2f6a2a), 0.37 + s * 0.03, 0.22, 0.1); st.rotation.z = s * 0.3; } { const lf = M(new THREE.SphereGeometry(0.08, 8, 6), std(0x2f8a3a, 0.6), 0.4, 0.36, 0.1); lf.scale.set(1.4, 0.3, 0.7); } break;
    case 'cherryTop': M(new THREE.SphereGeometry(0.1, 12, 10), std(0xc8102e, 0.25), 0.32, 0.46, 0.18); { const st = M(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 4), std(0x2f6a2a), 0.34, 0.6, 0.18); st.rotation.z = -0.4; } for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; M(new THREE.SphereGeometry(0.07, 8, 6), std(0xffffff, 0.8), Math.sin(a) * 0.3, 0.45, Math.cos(a) * 0.3); } break;
    case 'leaf': case 'mint': { const lf = M(new THREE.SphereGeometry(0.16, 10, 8), std(L.acc === 'mint' ? 0x3ac890 : 0x3f9a3a, 0.6), 0.3, 0.5, 0.12); lf.scale.set(1.3, 0.22, 0.6); lf.rotation.z = -0.5; const st = M(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4), std(0x5a3a22), 0.18, 0.5, 0.12); st.rotation.z = 1.0; break; }
    case 'icicles': for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, l = 0.1 + (i % 3) * 0.05; const c = M(new THREE.ConeGeometry(0.03, l, 6), new THREE.MeshStandardMaterial({color: 0xdff4ff, roughness: 0.05, transparent: true, opacity: 0.85}), Math.sin(a) * 0.35, 0.31 - l / 2, Math.cos(a) * 0.35); c.rotation.x = Math.PI; } for (let i = 0; i < 5; i++) { const a = i * 1.3; M(new THREE.OctahedronGeometry(0.04), glow(0xffffff, 0.6), Math.sin(a) * 0.38, 0.5 + (i % 2) * 0.08, Math.cos(a) * 0.38); } break;
    case 'ring': { const r = M(new THREE.TorusGeometry(0.55, 0.035, 8, 40), new THREE.MeshStandardMaterial({color: 0xd8c8ff, emissive: 0x8a6aff, emissiveIntensity: 0.4, roughness: 0.3}), 0, 0.26, 0); r.rotation.x = Math.PI / 2 - 0.35; const r2 = M(new THREE.TorusGeometry(0.64, 0.015, 6, 40), glow(0x5ad8ff, 0.5), 0, 0.26, 0); r2.rotation.x = Math.PI / 2 - 0.35; M(new THREE.SphereGeometry(0.06, 10, 8), glow(0xff8fe8, 0.5), 0.6, 0.38, 0.1); break; }
    case 'halo': { const r = M(new THREE.TorusGeometry(0.22, 0.025, 8, 30), glow(0xfff200, 1.0), 0, 1.45, 0); r.rotation.x = Math.PI / 2; r.userData.noInk = true; break; }
    case 'moon': { const m = M(new THREE.SphereGeometry(0.09, 12, 10), glow(0xfff6c0, 0.7), 0.42, 0.6, 0.0); for (let i = 0; i < 3; i++) M(new THREE.OctahedronGeometry(0.035), glow([0x00e5ff, 0xff2bd6, 0x9dff00][i], 0.9), -0.4 + i * 0.05, 0.55 + i * 0.12, 0.1); break; }
    case 'bubbles': for (let i = 0; i < 5; i++) M(new THREE.SphereGeometry(0.035 + i * 0.012, 10, 8), new THREE.MeshStandardMaterial({color: 0xbfefff, transparent: true, opacity: 0.6, roughness: 0.05}), 0.38 + i * 0.02, 0.2 + i * 0.12, 0.12); break;
    case 'collar': for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, p = M(new THREE.SphereGeometry(0.13, 10, 8), std(i % 2 ? 0xff8fb8 : 0xffc20e, 0.6), Math.sin(a) * 0.2, 0.5, Math.cos(a) * 0.2); p.scale.set(0.7, 0.35, 1); p.rotation.y = a; p.rotation.x = 0.5; } break;
    case 'gem': { const gm = M(new THREE.OctahedronGeometry(0.1), new THREE.MeshStandardMaterial({color: 0x5ae8a0, metalness: 0.4, roughness: 0.05, emissive: 0x0f7a4a, emissiveIntensity: 0.5}), 0, 0.26, 0.37); gm.scale.set(1, 1.3, 0.6); break; }
    case 'visor': { const v = M(new THREE.SphereGeometry(0.37, 20, 8, -0.9, 1.8, 1.2, 0.5), new THREE.MeshStandardMaterial({color: 0x1b1330, metalness: 0.9, roughness: 0.1, emissive: 0x1f6fd1, emissiveIntensity: 0.3}), 0, 0.02, 0); v.userData.noInk = true; break; }
  }
  return g;
}
function applySkinTo(model, S, inkOn) {
  const L = SKIN_LOOK[S.id] || {}, U = model.userData;
  if (!U.body) { U.body = model.children.find((m) => m.isMesh && m.geometry.type === 'LatheGeometry'); const tor = model.children.filter((m) => m.isMesh && m.geometry.type === 'TorusGeometry'); U.b1 = tor[0]; U.b2 = tor[1]; if (U.b1) U.b1.material = new THREE.MeshStandardMaterial({roughness: 0.4}); if (U.b2) U.b2.material = new THREE.MeshStandardMaterial({roughness: 0.4}); U.feM = U.fe.map((p) => p.children.find((m) => m.isMesh && m.geometry.type === 'PlaneGeometry').material); }
  const bm = U.body.material, gl = S.glow || 0, tx = skinBodyTex(S);
  bm.map = tx; bm.emissiveMap = tx; bm.color.setHex(0xffffff); bm.emissive.setHex(0xffffff); bm.emissiveIntensity = 0.08 + gl * 0.45; bm.metalness = S.metal || 0; bm.roughness = S.metal ? 0.22 : 0.38; bm.needsUpdate = true;
  U.feM.forEach((m, i) => { const t = skinFeTex(S, i); m.map = t; m.emissiveMap = t; m.color.setHex(0xffffff); m.emissive.setHex(0xffffff); m.emissiveIntensity = 0.18 + gl * 0.5; m.metalness = (S.metal || 0) * 0.5; m.needsUpdate = true; });
  for (const [b, c, d] of [[U.b1, L.b1, NAVY], [U.b2, L.b2, 0xffffff]]) if (b) { b.material.color.setHex(c !== undefined ? c : d); b.material.emissive.setHex(L.glowBand ? (c || d) : 0); b.material.emissiveIntensity = L.glowBand ? 0.9 : 0; b.material.metalness = S.metal ? 0.6 : 0; }
  if (U.acc) { model.remove(U.acc); U.acc = null; }
  const acc = skinAcc(S); if (acc.children.length) { if (inkOn !== false) ink(acc, 0.018); model.add(acc); U.acc = acc; }
}
// ---- real 3D pictures for the shop cards ----
let TR = null; const THUMB = {};
function thumbR() {
  if (TR) return TR;
  try { const r = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true}); r.setPixelRatio(1); r.setSize(144, 144); const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xf4f8ff, 0x9a8a7a, 0.75)); const d = new THREE.DirectionalLight(0xffffff, 0.95); d.position.set(3, 5, 4); sc.add(d); const d2 = new THREE.DirectionalLight(0xbfd8ff, 0.35); d2.position.set(-4, 2, -2); sc.add(d2); TR = {r, sc, cam: new THREE.PerspectiveCamera(28, 1, 0.05, 60)}; } catch (e) { TR = {fail: 1}; }
  return TR;
}
function snapThumb(obj, yaw) {
  const T = thumbR(); if (T.fail) return null;
  const hold = new THREE.Group(); hold.add(obj); hold.rotation.y = yaw || 0; T.sc.add(hold); hold.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(hold), c = bb.getCenter(new V3()), s = bb.getSize(new V3()), R = Math.max(s.x, s.y, s.z) * 0.5;
  const dist = R / Math.tan(14 * Math.PI / 180) * 0.98; T.cam.position.set(c.x + dist * 0.28, c.y + dist * 0.22, c.z + dist * 0.93); T.cam.lookAt(c);
  T.r.render(T.sc, T.cam); let u = null; try { u = T.r.domElement.toDataURL('image/png'); } catch (e) {}
  T.sc.remove(hold); return u;
}
function thumbsFor(tab) {
  if (THUMB[tab]) return THUMB[tab];
  const out = {}; THUMB[tab] = out; const th0 = CUR_THEME; CUR_THEME = 'sokak'; const sd = seed; seed = 77;
  try {
    if (tab === 'skin') { const m = makeToy(); for (const S of SKINS) { applySkinTo(m, S); out[S.id] = snapThumb(m, -0.35); } }
    else if (tab === 'npc') for (const S of NPC_SKINS) out[S.id] = snapThumb(makePerson({npcSkin: S.id, col: 0xe22511}).g, -0.4);
    else if (tab === 'ani') for (const S of ANI_SKINS) out[S.id] = snapThumb(makeCat({aniSkin: S.id}).g, -0.9);
  } catch (e) { console.warn('thumb', e); }
  CUR_THEME = th0; seed = sd; return out;
}
function thumbHTML(tab, it, svg) { if (BOT) return svg(it); const u = thumbsFor(tab)[it.id]; return u ? `<img src="${u}" alt="">` : svg(it); }
document.head.insertAdjacentHTML('beforeend', '<style>.item .pv img{width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.25))}.item.deal .pv img{width:100%;height:100%}</style>');
