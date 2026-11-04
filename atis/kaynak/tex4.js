// ================= HIGH QUALITY TEXTURES (v4) =================
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4);
function hqTex(w, h, draw) { const t = ctex(w, h, draw); t.anisotropy = ANISO; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function grain(x, W, H, n, a0, a1, light) { for (let i = 0; i < n; i++) { const a = srnd(a0, a1); x.fillStyle = (light && srnd(0, 1) > 0.5) ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; const s = srnd(1, 3); x.fillRect(srnd(0, W), srnd(0, H), s, s); } }
// paving: square slabs with grout, bevel light / shadow and colour variation
const paveTex = hqTex(512, 512, (x, W, H) => {
  x.fillStyle = '#9d968a'; x.fillRect(0, 0, W, H); const N = 8, S = W / N;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const l = 72 + srnd(-5, 5), px = c * S + 3, py = r * S + 3, s = S - 6;
    x.fillStyle = `hsl(36,${8 + srnd(0, 7)}%,${l}%)`; x.fillRect(px, py, s, s);
    const g = x.createLinearGradient(px, py, px + s, py + s); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.12)'); x.fillStyle = g; x.fillRect(px, py, s, s);
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(px, py, s, 2); x.fillRect(px, py, 2, s); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(px, py + s - 2, s, 2); x.fillRect(px + s - 2, py, 2, s);
    if (srnd(0, 1) > 0.85) { x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(px + srnd(0, s), py); x.lineTo(px + srnd(0, s), py + s * 0.6); x.lineTo(px + srnd(0, s), py + s); x.stroke(); }
  }
  grain(x, W, H, 5000, 0.03, 0.09, true);
});
// asphalt: fine grain, darker tyre tracks, patches and cracks
const roadTex = hqTex(512, 512, (x, W, H) => {
  x.fillStyle = '#4b4e58'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '0,0,0' : '255,255,255'},${srnd(0.03, 0.06)})`; x.fillRect(srnd(0, W), srnd(0, H), srnd(60, 160), srnd(40, 120)); }
  for (const tx of [0.28, 0.72]) { const g = x.createLinearGradient(tx * W - 40, 0, tx * W + 40, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(tx * W - 40, 0, 80, H); }
  grain(x, W, H, 14000, 0.04, 0.14, true);
  x.strokeStyle = 'rgba(20,20,26,.55)'; x.lineWidth = 1.5; for (let i = 0; i < 4; i++) { let px = srnd(0, W), py = srnd(0, H); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += srnd(-25, 25); py += srnd(5, 30); x.lineTo(px, py); } x.stroke(); }
});
const roofTex = hqTex(256, 256, (x, W, H) => {
  x.fillStyle = '#8f4a36'; x.fillRect(0, 0, W, H); const rows = 10, cols = 8, rh = H / rows, cw = W / cols;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols + 1; c++) { const px = c * cw - (r % 2) * cw / 2, py = r * rh; x.fillStyle = `hsl(${12 + srnd(-3, 5)},${50 + srnd(0, 12)}%,${42 + srnd(-5, 6)}%)`; x.beginPath(); x.moveTo(px + 1, py); x.lineTo(px + cw - 1, py); x.lineTo(px + cw - 1, py + rh - 3); x.quadraticCurveTo(px + cw / 2, py + rh + 2, px + 1, py + rh - 3); x.fill(); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(px + 2, py + 1, cw - 4, 3); }
  grain(x, W, H, 2500, 0.03, 0.08);
});
function facadeTex(w, h, o) {
  const S = 112, W0 = Math.round(w * S), H0 = Math.round(h * S), k = Math.min(1, 1024 / Math.max(W0, H0));
  const t = ctex(Math.round(W0 * k), Math.round(H0 * k), (x, W, H) => {
    x.save(); x.scale(k, k); W = W0; H = H0;
    // plaster with soft variation, a stone base and a dark top drip
    x.fillStyle = o.col; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '255,255,255' : '0,0,0'},${srnd(0.015, 0.04)})`; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(20, 90), srnd(10, 50), 0, 0, 7); x.fill(); }
    grain(x, W, H, Math.round(W * H / 60), 0.02, 0.06, true);
    const dg = x.createLinearGradient(0, 0, 0, 0.6 * S); dg.addColorStop(0, 'rgba(0,0,0,.18)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = dg; x.fillRect(0, 0, W, 0.6 * S);
    const G = 2.5 * S, sy = H - G;
    // floor band + cornice line
    x.fillStyle = 'rgba(255,255,255,.65)'; x.fillRect(0, sy - 10, W, 10); x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, sy, W, 4);
    // upper windows with frames, sills, shutters, curtains, flower boxes, the odd AC unit
    const floors = Math.max(1, Math.floor((h - 2.5) / 1.9)), cols = Math.max(1, Math.round(w / 1.35));
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const cx = (c + 0.5) * W / cols, cy = sy - (f + 0.5) * 1.9 * S - 4, ww = 0.62 * S, wh = 1.02 * S, l = cx - ww / 2, tp = cy - wh / 2;
      x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(l - 5, tp - 3, ww + 14, wh + 12);
      x.fillStyle = '#f8f3e8'; x.fillRect(l - 8, tp - 8, ww + 16, wh + 16);
      const gr = x.createLinearGradient(l, tp, l + ww * 0.4, tp + wh); gr.addColorStop(0, '#b7e0ee'); gr.addColorStop(0.45, '#6f9fbb'); gr.addColorStop(1, '#2f4f68'); x.fillStyle = gr; x.fillRect(l, tp, ww, wh);
      if (srnd(0, 1) > 0.4) { x.fillStyle = pick(['#f4eee2', '#ffd9b8', '#e8f0f4', '#ffe9a8']); x.beginPath(); x.moveTo(l, tp); x.lineTo(l + ww * 0.32, tp); x.quadraticCurveTo(l + ww * 0.18, tp + wh * 0.5, l + ww * 0.08, tp + wh); x.lineTo(l, tp + wh); x.fill(); x.beginPath(); x.moveTo(l + ww, tp); x.lineTo(l + ww * 0.68, tp); x.quadraticCurveTo(l + ww * 0.82, tp + wh * 0.5, l + ww * 0.92, tp + wh); x.lineTo(l + ww, tp + wh); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.moveTo(l + ww * 0.15, tp + wh); x.lineTo(l + ww * 0.45, tp); x.lineTo(l + ww * 0.58, tp); x.lineTo(l + ww * 0.28, tp + wh); x.fill();
      x.fillStyle = '#f8f3e8'; x.fillRect(cx - 3, tp, 6, wh); x.fillRect(l, cy - 3, ww, 6);
      x.fillStyle = '#e8e0d0'; x.fillRect(l - 12, tp + wh + 6, ww + 24, 9); x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(l - 12, tp + wh + 15, ww + 24, 4);
      x.fillStyle = o.shut; for (const sx of [l - 30, l + ww + 12]) { x.fillRect(sx, tp - 6, 18, wh + 12); x.fillStyle = 'rgba(0,0,0,.18)'; for (let k2 = 0; k2 < 9; k2++) x.fillRect(sx + 2, tp + k2 * wh / 8, 14, 2); x.fillStyle = o.shut; }
      if (srnd(0, 1) > 0.5) { x.fillStyle = '#9a4c30'; x.fillRect(l - 6, tp + wh + 15, ww + 12, 13); for (let k2 = 0; k2 < 5; k2++) { x.fillStyle = pick(['#e22511', '#ff8fb8', '#ffc20e', '#f4eee2']); x.beginPath(); x.arc(l + k2 * ww / 4, tp + wh + 12, 7, 0, 7); x.fill(); x.fillStyle = '#3f8a3a'; x.beginPath(); x.arc(l + k2 * ww / 4 + 6, tp + wh + 16, 5, 0, 7); x.fill(); } }
      else if (srnd(0, 1) > 0.75) { x.fillStyle = '#e8e8e4'; x.fillRect(cx + ww / 2 + 2, tp + wh - 26, 46, 34); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; for (let k2 = 0; k2 < 5; k2++) { x.beginPath(); x.moveTo(cx + ww / 2 + 6, tp + wh - 22 + k2 * 6); x.lineTo(cx + ww / 2 + 44, tp + wh - 22 + k2 * 6); x.stroke(); } }
    }
    // drain pipe
    x.fillStyle = 'rgba(80,80,90,.55)'; x.fillRect(W - 14, 0, 6, H); for (let yy = 30; yy < H; yy += 90) x.fillRect(W - 17, yy, 12, 5);
    // shop: stone base, sign board with shadowed letters, window, door with glass, goods
    x.fillStyle = '#d9d0c0'; x.fillRect(0, sy + 4, W, G); grain(x, W, H, 600, 0.03, 0.07);
    const sh = 0.58 * S; x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(8, sy + 12, W - 16, sh + 6); x.fillStyle = o.sign; x.fillRect(6, sy + 8, W - 12, sh);
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.strokeRect(12, sy + 14, W - 24, sh - 12);
    x.font = `900 italic ${Math.round(0.4 * S)}px "Barlow Condensed", Impact, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillText(o.shop, W / 2 + 3, sy + 8 + sh / 2 + 3); x.fillStyle = '#fff'; x.fillText(o.shop, W / 2, sy + 8 + sh / 2);
    const wy = sy + sh + 18, dw = 0.92 * S, dx = o.door === 'l' ? 0.22 * S : W - 0.22 * S - dw;
    x.fillStyle = '#3b2a20'; x.fillRect(0.12 * S, wy - 6, W - 0.24 * S, H - wy + 6);
    const gl = x.createLinearGradient(0, wy, 0, H); gl.addColorStop(0, '#cdeaf4'); gl.addColorStop(0.5, '#7fa9c2'); gl.addColorStop(1, '#3f6684'); x.fillStyle = gl; x.fillRect(0.18 * S, wy, W - 0.36 * S, H - wy - 0.22 * S);
    const g2 = o.goods || []; for (let row = 0; row < 2; row++) for (let k2 = 0; k2 < Math.floor(W / (0.3 * S)); k2++) { const gx = 0.3 * S + k2 * 0.3 * S; if (gx > dx - 10 && gx < dx + dw + 10) continue; x.fillStyle = g2[(k2 + row) % (g2.length || 1)] || '#f4c27a'; x.beginPath(); x.arc(gx, H - 0.42 * S - row * 0.3 * S, 0.11 * S, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(gx - 4, H - 0.46 * S - row * 0.3 * S, 0.035 * S, 0, 7); x.fill(); }
    x.fillStyle = '#6f4ab0'; x.fillStyle = 'rgba(255,255,255,.3)'; for (let k2 = 0; k2 < 3; k2++) { x.beginPath(); x.moveTo(0.4 * S + k2 * 0.95 * S, H - 0.3 * S); x.lineTo(0.8 * S + k2 * 0.95 * S, wy + 4); x.lineTo(0.98 * S + k2 * 0.95 * S, wy + 4); x.lineTo(0.58 * S + k2 * 0.95 * S, H - 0.3 * S); x.fill(); }
    x.fillStyle = '#6b3f26'; x.fillRect(dx, wy + 6, dw, H - wy - 6); x.fillStyle = '#9fd0e4'; x.fillRect(dx + 10, wy + 18, dw - 20, (H - wy) * 0.45); x.fillStyle = '#ffc20e'; x.beginPath(); x.arc(dx + dw - 16, wy + (H - wy) * 0.62, 5, 0, 7); x.fill();
    x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, H - 10, W, 10);
    x.restore();
  });
  t.anisotropy = ANISO; return t;
}
