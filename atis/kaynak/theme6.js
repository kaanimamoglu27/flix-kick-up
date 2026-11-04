// ================= THEME LOOKS (v6): ground, facades, sky per world =================
function styleOverlay(x, W, H, o, S) {
  const sy = H - 2.5 * S;
  if (o.style === 'brick') {
    const bh = Math.round(0.09 * S), bw = Math.round(0.26 * S);
    for (let y = 0, r = 0; y < sy; y += bh, r++) { const off = r % 2 ? bw / 2 : 0; for (let xx = -off; xx < W; xx += bw) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '0,0,0' : '255,255,255'},${srnd(0.02, 0.1)})`; x.fillRect(xx + 1.5, y + 1.5, bw - 3, bh - 3); } }
    x.fillStyle = 'rgba(235,225,210,.28)'; for (let y = 0; y < sy; y += bh) x.fillRect(0, y, W, 1.5);
  } else if (o.style === 'stone') {
    const bh = Math.round(0.34 * S), bw = Math.round(0.68 * S); x.strokeStyle = 'rgba(90,75,55,.22)'; x.lineWidth = 2;
    for (let y = 0, r = 0; y < sy; y += bh, r++) { const off = r % 2 ? bw / 2 : 0; for (let xx = -off; xx < W; xx += bw) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '60,50,30' : '255,250,240'},${srnd(0.02, 0.07)})`; x.fillRect(xx, y, bw, bh); x.strokeRect(xx, y, bw, bh); } }
  } else if (o.style === 'metal') {
    const p = S; x.strokeStyle = 'rgba(40,50,70,.3)'; x.lineWidth = 3;
    for (let y = 0; y < sy; y += p) for (let xx = 0; xx < W; xx += p) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '0,0,0' : '255,255,255'},${srnd(0.02, 0.08)})`; x.fillRect(xx, y, p, p); x.strokeRect(xx, y, p, p); x.fillStyle = 'rgba(40,50,70,.45)'; for (const [a, b] of [[8, 8], [p - 8, 8], [8, p - 8], [p - 8, p - 8]]) { x.beginPath(); x.arc(xx + a, y + b, 2.5, 0, 7); x.fill(); } }
    x.fillStyle = o.sign; x.fillRect(0, sy - 0.32 * S, W, 0.16 * S); for (let xx = 0; xx < W; xx += 40) { x.fillStyle = '#ffc20e'; x.fillRect(xx, 6, 20, 12); x.fillStyle = '#1b1330'; x.fillRect(xx + 20, 6, 20, 12); }
  }
}
const THEME_TEX = {};
function themeTex(th) {
  if (THEME_TEX[th]) return THEME_TEX[th];
  let T;
  if (th === 'amerika') T = {road: roadTex, pave: hqTex(512, 512, (x, W, H) => { // big concrete slabs with expansion joints
    x.fillStyle = '#b8b6b0'; x.fillRect(0, 0, W, H); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { x.fillStyle = `hsl(40,${3 + srnd(0, 4)}%,${68 + srnd(-4, 4)}%)`; x.fillRect(c * 256 + 3, r * 256 + 3, 250, 250); }
    grain(x, W, H, 9000, 0.03, 0.1, true); for (let i = 0; i < 6; i++) { const cx = srnd(0, W), cy = srnd(0, H), g = x.createRadialGradient(cx, cy, 2, cx, cy, srnd(20, 60)); g.addColorStop(0, 'rgba(60,55,50,.14)'); g.addColorStop(1, 'rgba(60,55,50,0)'); x.fillStyle = g; x.fillRect(cx - 60, cy - 60, 120, 120); }
    for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(30,30,30,.22)'; x.beginPath(); x.arc(srnd(0, W), srnd(0, H), srnd(1.5, 3), 0, 7); x.fill(); } })};
  else if (th === 'avrupa') T = {road: hqTex(512, 512, (x, W, H) => { // cobblestones
    x.fillStyle = '#4a4540'; x.fillRect(0, 0, W, H); const s = 32;
    for (let r = 0; r < H / s; r++) for (let c = -1; c < W / s + 1; c++) { const px = c * s + (r % 2) * s / 2 + srnd(-2, 2), py = r * s + srnd(-2, 2); x.fillStyle = `hsl(${28 + srnd(-8, 8)},${8 + srnd(0, 10)}%,${44 + srnd(-8, 10)}%)`; x.beginPath(); x.ellipse(px + s / 2, py + s / 2, s / 2 - 2.5, s / 2 - 3, srnd(-0.2, 0.2), 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.ellipse(px + s / 2 - 3, py + s / 2 - 4, s / 4, s / 6, 0, 0, 7); x.fill(); }
    grain(x, W, H, 6000, 0.03, 0.1, true); }),
    pave: hqTex(512, 512, (x, W, H) => { // large flagstones
    x.fillStyle = '#8a8070'; x.fillRect(0, 0, W, H);
    for (let y = 0, r = 0; y < H; y += 128, r++) { let xx = r % 2 ? -60 : 0; while (xx < W) { const w = srnd(90, 170); x.fillStyle = `hsl(38,${10 + srnd(0, 10)}%,${66 + srnd(-6, 6)}%)`; x.fillRect(xx + 3, y + 3, w - 6, 122); xx += w; } }
    grain(x, W, H, 7000, 0.03, 0.09, true); })};
  else if (th === 'uzay') T = {road: hqTex(512, 512, (x, W, H) => { // regolith with craters
    x.fillStyle = '#7d7f86'; x.fillRect(0, 0, W, H); grain(x, W, H, 16000, 0.04, 0.16, true);
    for (let i = 0; i < 7; i++) { const cx = srnd(0, W), cy = srnd(0, H), r = srnd(14, 46); const g = x.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.2, cx, cy, r); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(0.8, 'rgba(0,0,0,.1)'); g.addColorStop(1, 'rgba(255,255,255,.18)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); } }),
    pave: hqTex(512, 512, (x, W, H) => { // metal deck plates
    x.fillStyle = '#9aa2ae'; x.fillRect(0, 0, W, H); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = `hsl(215,${8 + srnd(0, 6)}%,${62 + srnd(-5, 5)}%)`; x.fillRect(c * 128 + 3, r * 128 + 3, 122, 122); x.fillStyle = 'rgba(40,50,70,.4)'; for (const [a, b] of [[10, 10], [118, 10], [10, 118], [118, 118]]) { x.beginPath(); x.arc(c * 128 + a, r * 128 + b, 3, 0, 7); x.fill(); } }
    x.strokeStyle = 'rgba(255,255,255,.18)'; x.lineWidth = 2; for (let i = 0; i < 20; i++) { const yy = srnd(0, H); x.beginPath(); x.moveTo(srnd(0, W), yy); x.lineTo(srnd(0, W), yy + srnd(-4, 4)); x.stroke(); } grain(x, W, H, 5000, 0.02, 0.07, true); })};
  else T = {road: roadTex, pave: paveTex};
  return (THEME_TEX[th] = T);
}
const SKIES = {};
function themeSky(th) {
  if (SKIES[th]) return SKIES[th];
  const c = THEMES[th].sky;
  return (SKIES[th] = ctex(th === 'uzay' ? 512 : 4, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c[0]); g.addColorStop(0.55, c[1]); g.addColorStop(1, c[2]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (th === 'uzay') { for (let i = 0; i < 420; i++) { x.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; const s = Math.random() < 0.08 ? 2 : 1; x.fillRect(Math.random() * w, Math.random() * h * 0.85, s, s); }
      const ex = w * 0.78, ey = h * 0.18, er = 34, eg = x.createRadialGradient(ex - 10, ey - 10, 4, ex, ey, er); eg.addColorStop(0, '#8fd0ff'); eg.addColorStop(0.6, '#2f6fd1'); eg.addColorStop(1, '#0d2a6a'); x.fillStyle = eg; x.beginPath(); x.arc(ex, ey, er, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(ex - 8, ey - 6, 14, 6, 0.4, 0, 7); x.fill(); x.fillStyle = 'rgba(80,180,90,.8)'; x.beginPath(); x.ellipse(ex + 8, ey + 8, 10, 7, -0.3, 0, 7); x.fill(); }
  }));
}
// little green neighbours for the moon
function makeAlien() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const legs = [];
  const c = std(0x7ad13a, 0.5), d = std(0x3a8a2a, 0.6), e = std(0xffffff, 0.3), p = std(0x111111, 0.3);
  part(SPH, c, 0.18, 0.2, 0.18, 0, 0.3, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.6, 0.02); body.add(head);
  part(SPH, c, 0.17, 0.15, 0.16, 0, 0, 0, head);
  for (const sx of [-1, 0, 1]) { part(SPH, e, 0.045, 0.05, 0.03, sx * 0.07, 0.03 + (sx ? 0 : 0.05), 0.14, head); part(SPH, p, 0.02, 0.025, 0.015, sx * 0.07, 0.03 + (sx ? 0 : 0.05), 0.165, head); }
  for (const sx of [-1, 1]) { const a = part(CYL, d, 0.012, 0.16, 0.012, sx * 0.07, 0.2, 0, head); a.rotation.z = -sx * 0.3; part(SPH, std(0xff2bd6, 0.3), 0.035, 0.035, 0.035, sx * 0.11, 0.28, 0, head); }
  for (const [lx, lz] of [[-0.08, 0.06], [0.08, 0.06], [-0.2, 0], [0.2, 0]]) { const l = limb(body, d, lx, lz ? 0.18 : 0.4, lz ? 0.16 : 0.2, 0.03, c, 0.04); l.position.z = lz; legs.push(l); }
  legs[2].rotation.z = -0.5; legs[3].rotation.z = 0.5;
  const tail = new THREE.Group(); tail.position.set(0, 0.25, -0.16); body.add(tail); part(SPH, d, 0.03, 0.03, 0.03, 0, 0.02, 0, tail);
  ink(g, 0.014); return {g, body, legs, head, tail, s: 1};
}
// roofs per world: tar and gravel, slate, metal plates
const ROOFS = {};
function themeRoof(th) {
  if (th === 'sokak' || !THEMES[th]) return roofTex;
  if (ROOFS[th]) return ROOFS[th];
  let t;
  if (th === 'amerika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#5a5856'; x.fillRect(0, 0, W, H); grain(x, W, H, 9000, 0.05, 0.2, true); x.strokeStyle = 'rgba(20,20,20,.35)'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(srnd(0, W), srnd(0, H)); x.bezierCurveTo(srnd(0, W), srnd(0, H), srnd(0, W), srnd(0, H), srnd(0, W), srnd(0, H)); x.stroke(); } });
  else if (th === 'avrupa') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#3a4250'; x.fillRect(0, 0, W, H); const rh = 22, cw = 28; for (let r = 0; r < H / rh; r++) for (let c = -1; c < W / cw + 1; c++) { const px = c * cw + (r % 2) * cw / 2; x.fillStyle = `hsl(215,${10 + srnd(0, 8)}%,${30 + srnd(-4, 6)}%)`; x.fillRect(px + 1, r * rh + 1, cw - 2, rh - 2); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(px + 1, r * rh + 1, cw - 2, 3); } grain(x, W, H, 3000, 0.03, 0.08, true); });
  else t = themeTex('uzay').pave;
  return (ROOFS[th] = t);
}
function roofBits(g, P, base, h) { // a little something on top that says where we are
  const cx = (P.x0 + P.x1) / 2 + 0.3, cz = (P.z0 + P.z1) / 2, y = base + h;
  if (CUR_THEME === 'amerika') { addBox(g, std(0xb8bcc4, 0.5), cx - 0.4, cx + 0.4, y, y + 0.55, cz - 0.3, cz + 0.3, false); addBox(g, std(0x6a6e76, 0.6), cx - 0.3, cx + 0.3, y + 0.55, y + 0.62, cz - 0.2, cz + 0.2, false);
    if (srnd(0, 1) > 0.5) { const wt = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 14), std(0x8a5a3a, 0.9), 0, 1.2, 0, wt); mesh(new THREE.ConeGeometry(0.5, 0.35, 14), std(0x5a3a26, 0.9), 0, 1.78, 0, wt); for (const [a, b] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 5), std(0x2a2a2a), a, 0.4, b, wt); wt.position.set(cx - 0.9, y, cz); g.add(wt); } }
  else if (CUR_THEME === 'uzay') { mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), std(0xd8dce4, 0.4), cx, y + 0.45, cz, g); const d = mesh(new THREE.SphereGeometry(0.38, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: 0xe8ecf2, roughness: 0.4, side: THREE.DoubleSide}), cx, y + 0.95, cz, g); d.rotation.x = Math.PI; d.rotation.z = 0.5;
    mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({color: 0xff2bd6}), cx, y + 1.0, cz, g); }
  else addBox(g, std(CUR_THEME === 'avrupa' ? 0x9a8a7a : 0xc0603e, 0.9), cx - 0.25, cx + 0.25, y, y + 0.9, cz - 0.25, cz + 0.25, false);
}
