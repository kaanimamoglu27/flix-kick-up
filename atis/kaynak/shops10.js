// ---------- shop windows that look like the shop (v10) ----------
const SHOP_KINDS = [
  ['pharmacy', /ECZANE/],
  ['laundry', /LAUNDRY/], ['comics', /COMICS/], ['photo', /FOTO/], ['toys', /OYUNCAK|TAKI|DAVUL|BUMERANG/],
  ['barber', /BERBER|KUAFÖR|FÖNCÜ/],
  ['hardware', /NALBUR|ELEKTRİK|TAMİR|YAKIT/],
  ['tailor', /TERZİ|HALI|KENTE|TESBİH/],
  ['fish', /M[İI]DYE|REEF|FOK/],
  ['surf', /SURF|BEACH/],
  ['produce', /MANAV|MANGO|HURMA|BAOBAB/],
  ['butcher', /KASAP/], ['grill', /KÖFTE|KEBAP|DÖNER|BURGER|HOT DOG|BARBEKÜ|MEAT PIE|KOKOREÇ|ŞALGAM/],
  ['sweets', /ŞEKER|TATLI|LOKUM|BAKLAVA|KÜNEFE|CANDY|DONUT|CHOCOLAT|MOCHI|GELATO|DONDURMA|PİŞMANİYE|YILDIZ TOZU/],
  ['bakery', /FIRIN|SİMİT|BÖREK|BOULANGERIE|CROISSANT|BAGEL|PANCAKE|WAFF|KONDITOREI|PİDE|GÖZLEME|CRÊPE|GEVREK/],
  ['cafe', /ÇAY|CAFÉ|CAFE|KAFE|FLAT WHITE|MATCHA|BOBA|KAKAO|BOZA|BUZ BAR|BIERHAUS|FROMAGERIE/],
  ['food', /LOKANTA|PIZZ|PASTA|RAMEN|SUSHI|NOODLE|TACO|NACHO|TRATTORIA|TAPAS|DIM SUM|BAO|PHO|CURRY|WOK|TEMPURA|JOLLOF|DINER|TOFU|KIMCHI|ASLAN|G'DAY|OUTBACK/],
  ['market', /MARKET|BAKKAL|BÜFE|KIOSK|SODA|SAFARİ|ZEBRA|FIL|KOALA|CROCO|PENGUEN|İGLO|KÜMES|KIZAK|KARTOPU|SOĞUK|FIRTINA|UZAY|KRATER|METEOR|NEBULA|ORBİT|ROKET|GALAKSİ|AURORA/],
];
function shopKind(name) { for (const [k, re] of SHOP_KINDS) if (re.test(name || '')) return k; return ''; }
function rrect(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.lineTo(l + w - r, t); x.quadraticCurveTo(l + w, t, l + w, t + r); x.lineTo(l + w, t + h - r); x.quadraticCurveTo(l + w, t + h, l + w - r, t + h); x.lineTo(l + r, t + h); x.quadraticCurveTo(l, t + h, l, t + h - r); x.lineTo(l, t + r); x.quadraticCurveTo(l, t, l + r, t); x.closePath(); }
const SH_C = ['#e22511', '#1f6fd1', '#2fa84f', '#ffc20e', '#ff8fb8', '#7a4fb0', '#ff7a1a', '#f4eee2'];
// back wall + shelves inside the glass, then the goods for the kind
function shopGoods(x, kind, L, R, T, B, S, r, goods) {
  const W = R - L, H = B - T, pc = a => a[Math.floor(r() * a.length)];
  if (kind === 'butcher') kind = 'grill0';
  const wall = {grill0: '#f1e4dc', pharmacy: '#eef6f2', bakery: '#f3dfb8', cafe: '#e9d2b4', grill: '#f1e4dc', sweets: '#fde3ee', toys: '#fff2c2', hardware: '#d8dde2', barber: '#e8eef2', photo: '#2a2a32', tailor: '#efe6da', food: '#f4dcc0', fish: '#e4f2f6', market: '#f2f2ee', produce: '#efe2c8', surf: '#d6f0f4', comics: '#f6efe0', laundry: '#e6f0f6'}[kind];
  if (!wall) return false;
  x.save(); x.beginPath(); x.rect(L, T, W, H); x.clip();
  x.globalAlpha = 0.78; x.fillStyle = wall; x.fillRect(L, T, W, H); x.globalAlpha = 1;
  const lamp = x.createRadialGradient(L + W / 2, T, 4, L + W / 2, T, W * 0.8); lamp.addColorStop(0, 'rgba(255,240,200,.45)'); lamp.addColorStop(1, 'rgba(255,240,200,0)'); x.fillStyle = lamp; x.fillRect(L, T, W, H);
  const shelf = (y, c = '#8a6040') => { x.fillStyle = c; x.fillRect(L, y, W, 6); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(L, y + 6, W, 4); };
  const sY = [T + H * 0.3, T + H * 0.58, T + H * 0.86];
  if (kind === 'pharmacy' || kind === 'market') {
    for (const y of sY) { shelf(y, kind === 'pharmacy' ? '#ffffff' : '#c8c8c0'); let px = L + 4; while (px < R - 10) { const bw = 10 + r() * 14, bh = 16 + r() * 24; if (kind === 'market' && r() < 0.35) { x.fillStyle = pc(SH_C); rrect(x, px, y - bh - 8, bw * 0.7, bh + 8, 4); x.fill(); x.fillStyle = '#fff'; x.fillRect(px + 1, y - bh * 0.6, bw * 0.7 - 2, 6); x.fillStyle = '#333'; x.fillRect(px + bw * 0.2, y - bh - 12, bw * 0.3, 5); px += bw * 0.7 + 3; continue; }
      x.fillStyle = kind === 'pharmacy' ? pc(['#ffffff', '#ffffff', '#cfe6f6', '#d8f0dc', '#ffe0e0']) : pc(SH_C); x.fillRect(px, y - bh, bw, bh); x.fillStyle = kind === 'pharmacy' ? pc(['#1f6fd1', '#2fa84f', '#e22511', '#ff7a1a']) : 'rgba(255,255,255,.7)'; x.fillRect(px, y - bh * 0.62, bw, bh * 0.22); x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 1; x.strokeRect(px, y - bh, bw, bh); px += bw + 2; } }
    if (kind === 'pharmacy') { const cx = L + W * 0.5, cy = T + H * 0.44, s = Math.min(W, H) * 0.2; x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(cx, cy, s * 1.25, 0, 7); x.fill(); x.fillStyle = '#16a34a'; x.fillRect(cx - s, cy - s * 0.34, s * 2, s * 0.68); x.fillRect(cx - s * 0.34, cy - s, s * 0.68, s * 2); }
    else { x.fillStyle = '#ffc20e'; x.beginPath(); x.arc(L + W * 0.8, T + H * 0.15, 15, 0, 7); x.fill(); x.fillStyle = '#e22511'; x.font = '900 16px Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('%', L + W * 0.8, T + H * 0.15 + 1); }
  } else if (kind === 'bakery') {
    for (const y of sY.slice(0, 2)) { shelf(y); let px = L + 8; while (px < R - 20) { if (r() < 0.45) { const rr0 = 13 + r() * 4; x.strokeStyle = '#a0561e'; x.lineWidth = 8; x.beginPath(); x.arc(px + rr0, y - rr0 - 2, rr0 - 2, 0, 7); x.stroke(); x.fillStyle = '#f4eee2'; for (let k = 0; k < 8; k++) { const a = k * 0.8; x.fillRect(px + rr0 + Math.cos(a) * (rr0 - 2), y - rr0 - 2 + Math.sin(a) * (rr0 - 2), 2, 2); } px += rr0 * 2 + 6; }
      else { const bw = 30 + r() * 12, bh = 16 + r() * 6; x.fillStyle = pc(['#c9822f', '#d99a48', '#b06a24']); x.beginPath(); x.ellipse(px + bw / 2, y - bh / 2, bw / 2, bh / 2, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,230,180,.8)'; x.lineWidth = 2; for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(px + k * bw / 4 - 4, y - bh * 0.8); x.lineTo(px + k * bw / 4 + 4, y - bh * 0.25); x.stroke(); } px += bw + 6; } } }
    x.fillStyle = '#7a4a24'; x.fillRect(L, sY[2] - 22, W, 50); x.fillStyle = '#f4eee2'; x.fillRect(L, sY[2] - 26, W, 6);
    for (let px = L + 14; px < R - 10; px += 34) { x.fillStyle = pc(['#e8b060', '#f4d090', '#c98a3a']); x.beginPath(); x.ellipse(px, sY[2] - 32, 14, 8, 0, 0, 7); x.fill(); }
  } else if (kind === 'produce') {
    for (let row = 0; row < 2; row++) { const y = B - 8 - row * H * 0.36, ch = H * 0.3; for (let px = L + 4; px < R - 30; px += 48) { x.fillStyle = '#b07a44'; x.fillRect(px, y - ch * 0.5, 44, ch * 0.5); x.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 1; k < 3; k++) x.fillRect(px, y - ch * 0.5 + k * ch / 6, 44, 2); const fc = pc(['#e22511', '#ff7a1a', '#ffc20e', '#7cc242', '#7a2a6a', '#2fa84f']); for (let k = 0; k < 7; k++) { x.fillStyle = fc; x.beginPath(); x.arc(px + 6 + (k % 4) * 11 + (k > 3 ? 5 : 0), y - ch * 0.5 - (k > 3 ? 14 : 4), 7, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.4)'; x.beginPath(); x.arc(px + 4 + (k % 4) * 11 + (k > 3 ? 5 : 0), y - ch * 0.5 - (k > 3 ? 16 : 6), 2, 0, 7); x.fill(); } } }
  } else if (kind === 'barber') {
    for (let px = L + 10; px < R - 50; px += 80) { x.fillStyle = '#a8c8d8'; rrect(x, px, T + 14, 54, H * 0.42, 22); x.fill(); x.strokeStyle = '#c8a050'; x.lineWidth = 4; x.stroke(); x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(px + 10, T + 22, 6, H * 0.3);
      x.fillStyle = '#c0281a'; rrect(x, px + 8, B - H * 0.42, 38, H * 0.24, 8); x.fill(); x.fillStyle = '#222'; x.fillRect(px + 24, B - H * 0.18, 6, H * 0.14); x.fillRect(px + 12, B - 8, 30, 5); }
  } else if (kind === 'cafe') {
    x.fillStyle = '#6b3f26'; x.fillRect(L, B - H * 0.32, W, H * 0.32); x.fillStyle = '#e8d0a8'; x.fillRect(L, B - H * 0.32 - 6, W, 6);
    x.save(); x.translate(L, B - H * 0.32); x.scale(1.6, 1.6); x.translate(-L, -(B - H * 0.32));
    for (let px = L + 10; px < L + (R - L) / 1.6 - 10; px += 30) { const tea = r() < 0.5; if (tea) { x.fillStyle = 'rgba(180,40,10,.85)'; x.beginPath(); x.moveTo(px - 7, B - H * 0.32 - 30); x.quadraticCurveTo(px - 2, B - H * 0.32 - 16, px - 6, B - H * 0.32 - 8); x.lineTo(px + 6, B - H * 0.32 - 8); x.quadraticCurveTo(px + 2, B - H * 0.32 - 16, px + 7, B - H * 0.32 - 30); x.fill(); x.fillStyle = '#f4eee2'; x.fillRect(px - 10, B - H * 0.32 - 8, 20, 3); }
      else { x.fillStyle = '#f4eee2'; x.fillRect(px - 9, B - H * 0.32 - 22, 18, 16); x.strokeStyle = '#f4eee2'; x.lineWidth = 3; x.beginPath(); x.arc(px + 11, B - H * 0.32 - 14, 5, -1.5, 1.5); x.stroke(); x.fillRect(px - 13, B - H * 0.32 - 6, 26, 3); }
      x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 2, B - H * 0.32 - 36); x.bezierCurveTo(px - 8, B - H * 0.32 - 46, px + 6, B - H * 0.32 - 52, px, B - H * 0.32 - 62); x.stroke(); }
    x.restore();
    x.fillStyle = '#2a2a2a'; rrect(x, L + W * 0.1, T + 12, W * 0.8, H * 0.32, 4); x.fill(); x.fillStyle = '#f4eee2'; for (let k = 0; k < 3; k++) x.fillRect(L + W * 0.16, T + 24 + k * 14, W * (0.35 + r() * 0.3), 3);
  } else if (kind === 'grill' || kind === 'grill0') {
    x.fillStyle = '#9a9aa0'; x.fillRect(L, T + 10, W, 4);
    let px = L + 18; while (px < R - 18) { const doner = kind === 'grill' && r() < 0.6; x.strokeStyle = '#666'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, T + 12); x.lineTo(px, T + 26); x.stroke();
      if (doner) { const g = x.createLinearGradient(px - 18, 0, px + 18, 0); g.addColorStop(0, '#7a3a14'); g.addColorStop(0.5, '#c8742e'); g.addColorStop(1, '#6a3010'); x.fillStyle = g; x.beginPath(); x.moveTo(px - 20, T + 28); x.lineTo(px + 20, T + 28); x.lineTo(px + 10, T + H * 0.75); x.lineTo(px - 10, T + H * 0.75); x.fill(); x.fillStyle = '#888'; x.fillRect(px - 2, T + 26, 4, H * 0.7); px += 52; }
      else { x.fillStyle = pc(['#c0281a', '#a8201a', '#d84a3a']); x.beginPath(); x.ellipse(px, T + 26 + H * 0.16, 12, H * 0.16, 0, 0, 7); x.fill(); x.fillStyle = '#f4dcd0'; x.beginPath(); x.ellipse(px - 3, T + 26 + H * 0.12, 4, H * 0.08, 0.2, 0, 7); x.fill(); px += 32; } }
    x.fillStyle = '#e8e8e8'; x.fillRect(L, B - H * 0.18, W, H * 0.18); x.fillStyle = '#c0281a'; for (let p2 = L + 10; p2 < R - 20; p2 += 30) { x.beginPath(); x.ellipse(p2 + 10, B - H * 0.18 - 4, 11, 5, 0, 0, 7); x.fill(); }
  } else if (kind === 'sweets') {
    for (const y of sY.slice(0, 2)) { shelf(y, '#f4eee2'); for (let px = L + 6; px < R - 26; px += 30) { const c = pc(SH_C); x.fillStyle = 'rgba(220,240,255,.7)'; rrect(x, px, y - 36, 24, 34, 6); x.fill(); for (let k = 0; k < 7; k++) { x.fillStyle = pc([c, c, '#fff', pc(SH_C)]); x.beginPath(); x.arc(px + 6 + (k % 3) * 6, y - 8 - Math.floor(k / 3) * 7, 3.4, 0, 7); x.fill(); } x.fillStyle = pc(['#e22511', '#ffc20e', '#ff8fb8']); x.fillRect(px + 3, y - 40, 18, 5); } }
    for (let px = L + 18; px < R - 10; px += 40) { x.strokeStyle = '#fff'; x.lineWidth = 3; x.beginPath(); x.moveTo(px, B - 6); x.lineTo(px, B - H * 0.24); x.stroke(); const c = pc(SH_C); x.fillStyle = c; x.beginPath(); x.arc(px, B - H * 0.24 - 10, 12, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 2.5; x.beginPath(); x.arc(px, B - H * 0.24 - 10, 6, 0, 5); x.stroke(); }
  } else if (kind === 'toys') {
    shelf(sY[1], '#c8a070');
    for (let px = L + 22; px < R - 20; px += 56) { const t = Math.floor(r() * 4), y = sY[1];
      if (t === 0) { x.fillStyle = '#b07a44'; x.beginPath(); x.arc(px, y - 14, 14, 0, 7); x.arc(px, y - 34, 10, 0, 7); x.fill(); x.beginPath(); x.arc(px - 8, y - 42, 4, 0, 7); x.arc(px + 8, y - 42, 4, 0, 7); x.fill(); x.fillStyle = '#222'; x.fillRect(px - 4, y - 36, 2, 2); x.fillRect(px + 3, y - 36, 2, 2); }
      else if (t === 1) { x.fillStyle = '#e22511'; x.beginPath(); x.arc(px, y - 14, 14, 0, 7); x.fill(); x.fillStyle = '#fff'; x.fillRect(px - 14, y - 16, 28, 4); x.fillStyle = '#1f6fd1'; x.beginPath(); x.arc(px, y - 14, 5, 0, 7); x.fill(); }
      else if (t === 2) { for (let k = 0; k < 3; k++) { x.fillStyle = pc(SH_C); x.fillRect(px - 16 + k * 11, y - 12 - (k === 1 ? 12 : 0), 11, 12); } }
      else { x.fillStyle = '#e22511'; rrect(x, px - 9, y - 12, 18, 12, 4); x.fill(); for (const [a, c] of [[-0.45, '#ffc20e'], [0, '#1f6fd1'], [0.45, '#2fa84f']]) { x.save(); x.translate(px, y - 12); x.rotate(a); x.fillStyle = c; x.beginPath(); x.ellipse(0, -16, 5, 16, 0, 0, 7); x.fill(); x.restore(); } } }
    for (let px = L + 12; px < R - 12; px += 26) { x.fillStyle = pc(SH_C); x.beginPath(); x.arc(px, B - 12, 10, 0, 7); x.fill(); }
  } else if (kind === 'hardware') {
    x.fillStyle = '#b89870'; x.fillRect(L, T + 6, W, H * 0.6); x.fillStyle = 'rgba(0,0,0,.25)'; for (let yy = T + 14; yy < T + H * 0.6; yy += 12) for (let xx = L + 6; xx < R; xx += 12) x.fillRect(xx, yy, 2, 2);
    for (let px = L + 18; px < R - 14; px += 34) { const t = Math.floor(r() * 3), yy = T + 20 + r() * H * 0.2; x.fillStyle = '#555'; if (t === 0) { x.fillRect(px - 2, yy, 4, 34); x.fillStyle = '#333'; x.fillRect(px - 10, yy, 20, 9); x.fillStyle = '#c0281a'; x.fillRect(px - 3, yy + 20, 6, 16); }
      else if (t === 1) { x.fillRect(px - 2, yy + 6, 4, 30); x.lineWidth = 5; x.strokeStyle = '#666'; x.beginPath(); x.arc(px, yy + 4, 7, 0.6, 5.7); x.stroke(); }
      else { x.fillStyle = '#ffe680'; x.beginPath(); x.arc(px, yy + 12, 10, 0, 7); x.fill(); x.fillStyle = '#999'; x.fillRect(px - 5, yy + 20, 10, 8); } }
    x.fillStyle = '#d0d0c8'; x.fillRect(L, B - H * 0.24, W, H * 0.24); for (let px = L + 8; px < R - 30; px += 40) { x.fillStyle = pc(['#1f6fd1', '#e22511', '#ffc20e', '#f4eee2']); x.fillRect(px, B - H * 0.24 - 30, 30, 30); x.fillStyle = '#555'; x.fillRect(px + 2, B - H * 0.24 - 32, 26, 4); }
  } else if (kind === 'photo') {
    for (let px = L + 10; px < R - 40; px += 52) { const fh = 34 + r() * 14; x.fillStyle = '#f4eee2'; x.fillRect(px, T + 16, 42, fh); const g = x.createLinearGradient(0, T + 20, 0, T + 16 + fh); g.addColorStop(0, pc(['#7fc8f0', '#ffb070', '#c8a0f0'])); g.addColorStop(1, pc(['#2f6a3a', '#3a5a8a', '#8a4a2a'])); x.fillStyle = g; x.fillRect(px + 4, T + 20, 34, fh - 8); }
    for (let px = L + 14; px < R - 30; px += 46) { x.fillStyle = '#222'; rrect(x, px, B - 38, 34, 24, 4); x.fill(); x.fillStyle = '#555'; x.beginPath(); x.arc(px + 17, B - 26, 9, 0, 7); x.fill(); x.fillStyle = '#7fb0d0'; x.beginPath(); x.arc(px + 17, B - 26, 5, 0, 7); x.fill(); x.fillStyle = '#e22511'; x.fillRect(px + 26, B - 42, 6, 4); }
  } else if (kind === 'tailor') {
    for (let px = L + 30; px < R - 20; px += 70) { const c = pc(['#e22511', '#1f6fd1', '#7a4fb0', '#2fa84f', '#ff8fb8']); x.fillStyle = '#c8b090'; x.fillRect(px - 2, B - H * 0.3, 4, H * 0.3); x.fillStyle = c; x.beginPath(); x.moveTo(px - 12, T + 22); x.lineTo(px + 12, T + 22); x.lineTo(px + 24, B - H * 0.3); x.lineTo(px - 24, B - H * 0.3); x.fill(); x.fillStyle = 'rgba(255,255,255,.3)'; x.fillRect(px - 2, T + 22, 4, B - H * 0.3 - T - 22); x.fillStyle = '#e8d8c0'; x.beginPath(); x.arc(px, T + 16, 7, 0, 7); x.fill(); }
    for (let px = L + 6; px < R - 14; px += 18) { const c = pc(SH_C); x.fillStyle = c; x.fillRect(px, B - 22, 14, 18); x.fillStyle = 'rgba(0,0,0,.2)'; for (let yy = B - 20; yy < B - 4; yy += 4) x.fillRect(px, yy, 14, 1); }
  } else if (kind === 'food') {
    for (let px = L + 6; px < R - 10; px += 70) { x.fillStyle = '#ffd890'; x.beginPath(); x.moveTo(px + 26, T + 10); x.lineTo(px + 18, T + 26); x.lineTo(px + 34, T + 26); x.fill(); x.fillStyle = 'rgba(255,220,140,.25)'; x.beginPath(); x.moveTo(px + 18, T + 26); x.lineTo(px + 34, T + 26); x.lineTo(px + 50, B - 30); x.lineTo(px + 2, B - 30); x.fill();
      const ty = B - H * 0.3; x.fillStyle = '#f4eee2'; x.fillRect(px + 2, ty, 48, 8); x.fillStyle = '#e22511'; for (let k = 0; k < 6; k++) if (k % 2 === 0) x.fillRect(px + 2 + k * 8, ty, 8, 8); x.fillRect(px + 6, ty + 20, 8, 2); x.fillStyle = '#6b3f26'; x.fillRect(px + 22, ty + 8, 6, H * 0.3 - 8); x.fillRect(px - 6, ty - 14, 5, H * 0.3 + 14); x.fillRect(px + 52, ty - 14, 5, H * 0.3 + 14);
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(px + 18, ty - 3, 9, 3, 0, 0, 7); x.ellipse(px + 36, ty - 3, 9, 3, 0, 0, 7); x.fill(); x.fillStyle = pc(['#e8a040', '#c0281a', '#f4d090']); x.beginPath(); x.ellipse(px + 18, ty - 5, 5, 2.4, 0, 0, 7); x.fill(); }
    { const mw = Math.min(90, W * 0.5), ml = L + (W - mw) / 2; x.fillStyle = '#6b3f26'; x.fillRect(ml - 4, T + 30, mw + 8, 58); x.fillStyle = '#263028'; x.fillRect(ml, T + 34, mw, 50); x.fillStyle = '#fff'; x.font = '900 13px Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MENÜ', ml + mw / 2, T + 44); x.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 3; k++) x.fillRect(ml + 8, T + 56 + k * 9, mw - 16 - r() * 20, 2); }
  } else if (kind === 'fish') {
    x.fillStyle = '#d8eef6'; x.fillRect(L, B - H * 0.38, W, H * 0.38); x.fillStyle = '#fff'; for (let k = 0; k < 40; k++) x.fillRect(L + r() * W, B - H * 0.38 + r() * H * 0.38, 3, 3);
    for (let px = L + 16; px < R - 26; px += 38) for (let row = 0; row < 2; row++) { const yy = B - H * 0.3 + row * 18; x.fillStyle = pc(['#7a8a9a', '#a0b0c0', '#c87060', '#2a2a3a']); x.beginPath(); x.ellipse(px + (row ? 14 : 0), yy, 15, 6, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(px + (row ? 14 : 0) + 13, yy); x.lineTo(px + (row ? 14 : 0) + 22, yy - 6); x.lineTo(px + (row ? 14 : 0) + 22, yy + 6); x.fill(); x.fillStyle = '#fff'; x.fillRect(px + (row ? 14 : 0) - 9, yy - 2, 3, 3); }
    for (let px = L + 20; px < R - 20; px += 60) { x.fillStyle = '#ffd820'; x.beginPath(); x.ellipse(px, B - H * 0.4 - 6, 7, 5, 0, 0, 7); x.fill(); }
    x.strokeStyle = '#8a6a3a'; x.lineWidth = 2; x.beginPath(); for (let xx = L; xx < R; xx += 14) { x.moveTo(xx, T + 6); x.lineTo(xx + 7, T + 20); x.lineTo(xx + 14, T + 6); } x.stroke();
  } else if (kind === 'surf') {
    for (let px = L + 16; px < R - 10; px += 28) { const c = pc(['#ff7a1a', '#1f6fd1', '#ffc20e', '#2fa84f', '#ff8fb8', '#f4eee2']); x.fillStyle = c; x.beginPath(); x.ellipse(px, T + H * 0.55, 10, H * 0.42, 0, 0, 7); x.fill(); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(px - 1, T + H * 0.2, 2, H * 0.7); x.fillStyle = pc(SH_C); x.fillRect(px - 10, T + H * 0.4, 20, 4); }
  } else if (kind === 'comics') {
    for (const y of sY.slice(0, 2)) { shelf(y, '#6b3f26'); for (let px = L + 6; px < R - 26; px += 30) { x.fillStyle = pc(SH_C); x.fillRect(px, y - 38, 26, 36); x.fillStyle = '#fff'; x.fillRect(px + 2, y - 36, 22, 7); x.fillStyle = '#ffc20e'; x.beginPath(); x.arc(px + 13, y - 16, 8, 0, 7); x.fill(); x.fillStyle = '#222'; x.font = '900 7px Impact, sans-serif'; x.textAlign = 'center'; x.fillText('POW', px + 13, y - 31); } }
  } else if (kind === 'laundry') {
    for (let px = L + 6; px < R - 50; px += 56) for (let row = 0; row < 2; row++) { const yy = B - 6 - (row + 1) * 54; x.fillStyle = '#f4f4f4'; x.fillRect(px, yy, 50, 52); x.strokeStyle = '#aaa'; x.lineWidth = 2; x.strokeRect(px, yy, 50, 52); x.fillStyle = '#555'; x.beginPath(); x.arc(px + 25, yy + 30, 16, 0, 7); x.fill(); x.fillStyle = pc(['#7fb0e0', '#e8a0c0', '#a0e0b0']); x.beginPath(); x.arc(px + 25, yy + 30, 12, 0, 7); x.fill(); x.fillStyle = '#2fa84f'; x.fillRect(px + 38, yy + 6, 6, 4); }
  }
  x.restore(); return true;
}
// a small round emblem on the left of the sign board
function shopEmblem(x, kind, cx, cy, s) {
  if (!kind) return false;
  x.save(); x.fillStyle = 'rgba(0,0,0,.25)'; x.beginPath(); x.arc(cx + 2, cy + 3, s, 0, 7); x.fill();
  x.fillStyle = kind === 'pharmacy' ? '#ffffff' : '#fff6e0'; x.beginPath(); x.arc(cx, cy, s, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.2)'; x.lineWidth = 2; x.stroke();
  const u = s / 10; x.translate(cx, cy);
  const F = (c) => { x.fillStyle = c; }, C = (xx, yy, rr) => { x.beginPath(); x.arc(xx * u, yy * u, rr * u, 0, 7); x.fill(); };
  switch (kind) {
    case 'pharmacy': F('#e22511'); x.font = `900 ${Math.round(15 * u)}px "Barlow Condensed", Impact, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E', 0, u); break;
    case 'bakery': F('#c9822f'); x.beginPath(); x.ellipse(0, 0, 7 * u, 4.5 * u, -0.3, 0, 7); x.fill(); x.strokeStyle = '#f4d090'; x.lineWidth = u; for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(k * 3 * u - u, -3 * u); x.lineTo(k * 3 * u + u, 3 * u); x.stroke(); } break;
    case 'cafe': F('#6b3f26'); x.fillRect(-5 * u, -3 * u, 9 * u, 8 * u); x.strokeStyle = '#6b3f26'; x.lineWidth = 1.5 * u; x.beginPath(); x.arc(5 * u, u, 2.5 * u, -1.5, 1.5); x.stroke(); x.strokeStyle = '#aaa'; x.lineWidth = u; x.beginPath(); x.moveTo(-u, -5 * u); x.quadraticCurveTo(-3 * u, -7 * u, -u, -9 * u); x.stroke(); break;
    case 'butcher': case 'grill': F('#c0281a'); x.beginPath(); x.ellipse(-u, 0, 6 * u, 4.5 * u, 0.4, 0, 7); x.fill(); F('#f4eee2'); C(4, -3, 2); C(6, -4, 1.5); break;
    case 'sweets': F('#ff8fb8'); C(0, -2, 5); x.fillStyle = '#fff'; x.fillRect(-0.6 * u, 3 * u, 1.2 * u, 6 * u); x.strokeStyle = '#fff'; x.lineWidth = u; x.beginPath(); x.arc(0, -2 * u, 2.5 * u, 0, 5); x.stroke(); break;
    case 'produce': F('#e22511'); C(-1, 1, 5.5); F('#2fa84f'); x.beginPath(); x.ellipse(2 * u, -5 * u, 3 * u, 1.5 * u, -0.5, 0, 7); x.fill(); break;
    case 'barber': x.fillStyle = '#fff'; x.fillRect(-2.5 * u, -7 * u, 5 * u, 14 * u); F('#e22511'); for (let k = -6; k < 7; k += 4) x.fillRect(-2.5 * u, k * u, 5 * u, 1.6 * u); F('#1f6fd1'); for (let k = -4; k < 7; k += 4) x.fillRect(-2.5 * u, k * u, 5 * u, 1 * u); break;
    case 'toys': F('#e22511'); x.fillRect(-3 * u, 2 * u, 6 * u, 4 * u); for (const [a, c] of [[-0.5, '#ffc20e'], [0, '#1f6fd1'], [0.5, '#2fa84f']]) { x.save(); x.translate(0, 2 * u); x.rotate(a); F(c); x.beginPath(); x.ellipse(0, -4.5 * u, 1.6 * u, 4.5 * u, 0, 0, 7); x.fill(); x.restore(); } break;
    case 'hardware': F('#555'); x.save(); x.rotate(0.7); x.fillRect(-u, -6 * u, 2 * u, 12 * u); x.fillRect(-4 * u, -7 * u, 8 * u, 3 * u); x.restore(); break;
    case 'photo': F('#222'); x.fillRect(-6 * u, -3 * u, 12 * u, 8 * u); x.fillRect(-2 * u, -5 * u, 4 * u, 2 * u); F('#7fb0d0'); C(0, 1, 2.6); break;
    case 'tailor': x.strokeStyle = '#555'; x.lineWidth = 1.2 * u; x.beginPath(); x.arc(-3 * u, 4 * u, 2 * u, 0, 7); x.arc(3 * u, 4 * u, 2 * u, 0, 7); x.moveTo(-2 * u, 2.5 * u); x.lineTo(4 * u, -6 * u); x.moveTo(2 * u, 2.5 * u); x.lineTo(-4 * u, -6 * u); x.stroke(); break;
    case 'food': F('#555'); x.fillRect(-5 * u, -6 * u, 1.2 * u, 12 * u); x.fillRect(4 * u, -6 * u, 1.4 * u, 12 * u); x.fillRect(-6.5 * u, -6 * u, 4 * u, 4 * u); break;
    case 'fish': F('#1f6fd1'); x.beginPath(); x.ellipse(-u, 0, 5.5 * u, 3 * u, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(4 * u, 0); x.lineTo(7.5 * u, -3 * u); x.lineTo(7.5 * u, 3 * u); x.fill(); break;
    case 'market': F('#2fa84f'); x.fillRect(-6 * u, -3 * u, 11 * u, 6 * u); x.strokeStyle = '#2fa84f'; x.lineWidth = 1.2 * u; x.beginPath(); x.moveTo(-8 * u, -5 * u); x.lineTo(-6 * u, -3 * u); x.stroke(); C(-4, 5, 1.4); C(3, 5, 1.4); break;
    case 'surf': F('#ff7a1a'); x.beginPath(); x.ellipse(0, 0, 2.6 * u, 7.5 * u, 0.5, 0, 7); x.fill(); break;
    case 'comics': F('#ffc20e'); x.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, rr = (k % 2 ? 4 : 8) * u; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.fill(); break;
    case 'laundry': F('#9aa'); x.fillRect(-5 * u, -6 * u, 10 * u, 12 * u); F('#7fb0e0'); C(0, 1, 3.4); break;
  }
  x.restore(); return true;
}
