import sys
s = open('theme6.js').read()
def rep(old, new):
    global s
    if s.count(old) != 1: sys.exit('miss: ' + old[:70])
    s = s.replace(old, new)
# facades for the new worlds
rep("""  } else if (o.style === 'metal') {""", """  } else if (o.style === 'wood' || o.style === 'board') { // horizontal boards (Ottoman houses / weatherboard)
    const bh = Math.round((o.style === 'wood' ? 0.16 : 0.2) * S);
    for (let y = 0; y < sy; y += bh) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '0,0,0' : '255,255,255'},${srnd(0.02, 0.08)})`; x.fillRect(0, y, W, bh - 2); x.fillStyle = 'rgba(40,25,10,.2)'; x.fillRect(0, y + bh - 2, W, 2); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, y, W, 1); }
    if (o.style === 'wood') { x.fillStyle = 'rgba(70,40,20,.35)'; for (let xx = 0; xx < W; xx += 1.4 * S) x.fillRect(xx, 0, 0.07 * S, sy); x.fillRect(0, sy * 0.48, W, 0.09 * S); }
  } else if (o.style === 'adobe') { // smooth mud plaster with hand marks
    for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '90,50,20' : '255,230,190'},${srnd(0.03, 0.08)})`; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, sy), srnd(10, 40), srnd(6, 22), srnd(0, 3), 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,240,210,.35)'; x.fillRect(0, sy - 0.5 * S, W, 0.1 * S); x.fillStyle = 'rgba(120,60,20,.3)'; for (let xx = 0.3 * S; xx < W; xx += 0.9 * S) { x.beginPath(); x.moveTo(xx, sy - 0.3 * S); x.lineTo(xx + 0.15 * S, sy - 0.48 * S); x.lineTo(xx + 0.3 * S, sy - 0.3 * S); x.fill(); }
  } else if (o.style === 'ice') { // frosted blocks with snow on the ledges
    const bh = Math.round(0.42 * S), bw = Math.round(0.84 * S); x.strokeStyle = 'rgba(120,170,210,.35)'; x.lineWidth = 2;
    for (let y = 0, r = 0; y < sy; y += bh, r++) { const off = r % 2 ? bw / 2 : 0; for (let xx = -off; xx < W; xx += bw) { x.fillStyle = `rgba(${srnd(0, 1) > 0.4 ? '255,255,255' : '150,200,240'},${srnd(0.05, 0.16)})`; x.fillRect(xx, y, bw, bh); x.strokeRect(xx, y, bw, bh); } }
    x.fillStyle = 'rgba(255,255,255,.9)'; for (let xx = 0; xx < W; xx += 6) { const hh = 6 + Math.sin(xx * 0.07) * 4 + srnd(0, 4); x.fillRect(xx, 0, 6, hh); }
  } else if (o.style === 'asia') { // red timber frames and paper lattice bands
    x.fillStyle = 'rgba(150,20,30,.55)'; for (let xx = 0; xx < W; xx += 1.2 * S) x.fillRect(xx, 0, 0.1 * S, sy); x.fillRect(0, sy * 0.45, W, 0.1 * S); x.fillRect(0, 0, W, 0.12 * S);
    x.strokeStyle = 'rgba(60,30,20,.18)'; x.lineWidth = 1.5; for (let y = sy * 0.12; y < sy * 0.44; y += 0.18 * S) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  } else if (o.style === 'metal') {""")
rep("  else T = {road: roadTex, pave: paveTex};", """  else if (th === 'turkiye') T = {road: themeTex('avrupa').road, pave: hqTex(512, 512, (x, W, H) => { // marble-ish slabs
    x.fillStyle = '#c8bca8'; x.fillRect(0, 0, W, H); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = `hsl(${32 + srnd(-6, 6)},${14 + srnd(0, 10)}%,${74 + srnd(-6, 6)}%)`; x.fillRect(c * 128 + 2, r * 128 + 2, 124, 124); } grain(x, W, H, 6000, 0.03, 0.08, true); })};
  else if (th === 'asya') T = {road: roadTex, pave: hqTex(512, 512, (x, W, H) => { // grey granite with red-brown joints
    x.fillStyle = '#7a5a4a'; x.fillRect(0, 0, W, H); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const off = r % 2 ? 64 : 0; x.fillStyle = `hsl(20,${4 + srnd(0, 6)}%,${62 + srnd(-6, 6)}%)`; x.fillRect(c * 128 + off - 64 + 3, r * 64 + 3, 122, 58); } grain(x, W, H, 6000, 0.03, 0.08, true); })};
  else if (th === 'avustralya') T = {road: roadTex, pave: hqTex(512, 512, (x, W, H) => { // sandy boardwalk
    x.fillStyle = '#c8a070'; x.fillRect(0, 0, W, H); for (let i = 0; i < 16; i++) { x.fillStyle = `hsl(32,${36 + srnd(0, 12)}%,${58 + srnd(-6, 6)}%)`; x.fillRect(0, i * 32 + 2, W, 28); } x.fillStyle = 'rgba(80,50,20,.4)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(srnd(0, W), Math.floor(srnd(0, 16)) * 32 + 16, 2, 0, 7); x.fill(); } grain(x, W, H, 5000, 0.03, 0.08, true); })};
  else if (th === 'afrika') T = {road: hqTex(512, 512, (x, W, H) => { // red earth track
    x.fillStyle = '#a8582e'; x.fillRect(0, 0, W, H); grain(x, W, H, 14000, 0.04, 0.16, true); for (let i = 0; i < 6; i++) { x.strokeStyle = 'rgba(70,30,10,.25)'; x.lineWidth = srnd(6, 14); x.beginPath(); const xx = srnd(60, W - 60); x.moveTo(xx, 0); x.bezierCurveTo(xx + srnd(-40, 40), H * 0.3, xx + srnd(-40, 40), H * 0.7, xx, H); x.stroke(); } }),
    pave: hqTex(512, 512, (x, W, H) => { x.fillStyle = '#dcb87a'; x.fillRect(0, 0, W, H); grain(x, W, H, 16000, 0.03, 0.12, true); for (let i = 0; i < 30; i++) { x.fillStyle = 'rgba(120,80,40,.25)'; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(2, 6), srnd(1.5, 4), 0, 0, 7); x.fill(); } })};
  else if (th === 'antarktika') T = {road: hqTex(512, 512, (x, W, H) => { // packed snow with sled tracks
    x.fillStyle = '#dfeaf2'; x.fillRect(0, 0, W, H); grain(x, W, H, 12000, 0.02, 0.08, true); x.strokeStyle = 'rgba(120,160,200,.3)'; x.lineWidth = 5; for (const xx of [150, 190, 320, 360]) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + srnd(-8, 8), H); x.stroke(); } }),
    pave: hqTex(512, 512, (x, W, H) => { x.fillStyle = '#f4f8fc'; x.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { const g = x.createRadialGradient(srnd(0, W), srnd(0, H), 2, srnd(0, W), srnd(0, H), srnd(20, 70)); g.addColorStop(0, 'rgba(160,200,235,.18)'); g.addColorStop(1, 'rgba(160,200,235,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); } grain(x, W, H, 6000, 0.02, 0.06, true); })};
  else T = {road: roadTex, pave: paveTex};""")
rep("""  else if (th === 'avrupa') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#3a4250';""", """  else if (th === 'asya') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#1f4a3a'; x.fillRect(0, 0, W, H); for (let c = 0; c < 16; c++) { const g = x.createLinearGradient(c * 16, 0, c * 16 + 16, 0); g.addColorStop(0, '#2f6a4a'); g.addColorStop(0.5, '#4a8a5a'); g.addColorStop(1, '#1f4a3a'); x.fillStyle = g; x.fillRect(c * 16, 0, 15, H); } for (let r = 0; r < 8; r++) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, r * 32 + 30, W, 2); } });
  else if (th === 'avustralya') t = hqTex(256, 256, (x, W, H) => { for (let c = 0; c < 32; c++) { x.fillStyle = c % 2 ? '#c8ccd2' : '#9aa2ac'; x.fillRect(c * 8, 0, 8, H); } grain(x, W, H, 2000, 0.03, 0.08, true); });
  else if (th === 'afrika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#c8a050'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(110,70,20,.45)'; x.lineWidth = 1.5; for (let i = 0; i < 500; i++) { const xx = srnd(0, W), yy = srnd(0, H); x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + srnd(-3, 3), yy + srnd(8, 16)); x.stroke(); } });
  else if (th === 'antarktika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#f8fbfe'; x.fillRect(0, 0, W, H); grain(x, W, H, 3000, 0.02, 0.06, true); for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(150,190,230,.15)'; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(20, 50), srnd(8, 20), 0, 0, 7); x.fill(); } });
  else if (th === 'avrupa') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#3a4250';""")
rep("if (th === 'sokak' || !THEMES[th]) return roofTex;", "if (th === 'sokak' || th === 'turkiye' || !THEMES[th]) return roofTex;")
# skies: Antarctic aurora, warm haze in Africa
rep("    if (th === 'uzay') {", """    if (th === 'antarktika') { for (let i = 0; i < 3; i++) { const yy = h * (0.1 + i * 0.07); const g2 = x.createLinearGradient(0, yy - 30, 0, yy + 30); g2.addColorStop(0, 'rgba(90,255,180,0)'); g2.addColorStop(0.5, `rgba(${i ? '150,120,255' : '90,255,180'},.35)`); g2.addColorStop(1, 'rgba(90,255,180,0)'); x.fillStyle = g2; x.fillRect(0, yy - 30, w, 60); } }
    if (th === 'afrika' || th === 'avustralya') { const g3 = x.createRadialGradient(w * 0.7, h * 0.2, 4, w * 0.7, h * 0.2, h * 0.25); g3.addColorStop(0, 'rgba(255,250,220,.95)'); g3.addColorStop(0.3, 'rgba(255,220,150,.5)'); g3.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = g3; x.fillRect(0, 0, w, h); }
    if (th === 'uzay') {""")
rep("ctex(th === 'uzay' ? 512 : 4, 512,", "ctex(th === 'uzay' ? 512 : th === 'antarktika' || th === 'afrika' || th === 'avustralya' ? 256 : 4, 512,")
open('theme7.js', 'w').write(s); print('ok')
