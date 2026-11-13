'use strict';
/* FLIX ATIŞ: pull back, let go, land the FLIX in the bucket. */
const Q = new URLSearchParams(location.search);
const BOT = Q.has('bot');
const $ = (id) => document.getElementById(id);
const NAVY = 0x022753, RED = 0xe22511, YEL = 0xffc20e, INKC = 0x1b1330;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const V3 = THREE.Vector3;
const APP = $('app'); const VW = () => APP.clientWidth || innerWidth, VH = () => APP.clientHeight || innerHeight, OX = () => APP.getBoundingClientRect().left, OY = () => APP.getBoundingClientRect().top;

// ---------- save ----------
let SAVE = {lv: {}, fe: 0, snd: 1, vib: 1, seen: 0};
try { Object.assign(SAVE, JSON.parse(localStorage.getItem('flixAtis3') || '{}')); } catch (e) {}
function save() { try { localStorage.setItem('flixAtis3', JSON.stringify(SAVE)); } catch (e) {} }

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('gl').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 300);
scene.fog = new THREE.Fog(0xd6f0ee, 40, 110);

function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
const MAT = {};
function std(col, r, m) { const k = col + '_' + r + '_' + m; return MAT[k] || (MAT[k] = new THREE.MeshStandardMaterial({color: col, roughness: r === undefined ? 0.7 : r, metalness: m || 0})); }
function mesh(geo, mat, x, y, z, par, sh) { const o = new THREE.Mesh(geo, mat); o.position.set(x || 0, y || 0, z || 0); o.castShadow = sh !== false; o.receiveShadow = true; if (par) par.add(o); return o; }
const OUT = {};
function outlineMat(th) { if (OUT[th]) return OUT[th]; const m = new THREE.MeshBasicMaterial({color: INKC, side: THREE.BackSide}); m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + th.toFixed(4) + ';'); }; return (OUT[th] = m); }
function ink(obj, th, skip) {
  const list = []; obj.traverse((o) => { if (o.isMesh && !o.userData.noInk && !(o.material && (o.material.transparent || o.material.isMeshBasicMaterial))) list.push(o); });
  for (const m of list) { if (skip && skip(m)) continue; const s = new THREE.Mesh(m.geometry, outlineMat(th)); s.userData.noInk = true; s.castShadow = false; m.add(s); }
  return obj;
}
let seed = 7; function srnd(a, b) { seed = (seed * 16807) % 2147483647; return a + (seed / 2147483647) * (b - a); }
const BOX = new THREE.BoxGeometry(1, 1, 1);
let world = null, LV = null, boxes = [], bucket = null, stars = [], sock = null;
function islandAt(x, z) { return LV.islands.find((I) => Math.abs(x - I.x) <= I.w / 2 && Math.abs(z - I.z) <= I.d / 2); }
// ================= STREET: ground, buildings, street furniture =================
// The neighbourhood chunk runs left-right across the screen: front plaza (start), road, back pavement, shop row.
// z: front plaza 2..8, road -1.5..2, back pavement -5..-1.5, buildings -8..-5. x: -4..4.
function streetGround() {
  return [
    {x: 0, z: 5, w: 8, d: 6, top: 0.22, kind: 'walk'},
    {x: 0, z: 0.25, w: 8, d: 3.5, top: 0, kind: 'road'},
    {x: 0, z: -3.25, w: 8, d: 3.5, top: 0.22, kind: 'walk'},
    {x: 0, z: -6.5, w: 8, d: 3, top: 0.22, kind: 'under'},
  ];
}
const pick = (a) => a[Math.floor(srnd(0, a.length - 0.001))];
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
  // weathering: dark grout, damp stains, gum spots, a little moss in the joints
  x.strokeStyle = 'rgba(60,52,40,.35)'; x.lineWidth = 2; for (let k = 0; k <= N; k++) { x.beginPath(); x.moveTo(k * S, 0); x.lineTo(k * S, H); x.moveTo(0, k * S); x.lineTo(W, k * S); x.stroke(); }
  for (let i = 0; i < 9; i++) { const cx = srnd(0, W), cy = srnd(0, H), r = srnd(18, 60), g = x.createRadialGradient(cx, cy, 2, cx, cy, r); g.addColorStop(0, `rgba(70,60,45,${srnd(0.06, 0.14)})`); g.addColorStop(1, 'rgba(70,60,45,0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
  for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(40,40,40,${srnd(0.1, 0.25)})`; x.beginPath(); x.arc(srnd(0, W), srnd(0, H), srnd(1.5, 3.5), 0, 7); x.fill(); }
  for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(90,120,60,${srnd(0.15, 0.3)})`; const a = srnd(0, 1) > 0.5; x.fillRect(a ? Math.round(srnd(0, N)) * S - 2 : srnd(0, W), a ? srnd(0, H) : Math.round(srnd(0, N)) * S - 2, a ? 4 : srnd(6, 18), a ? srnd(6, 18) : 4); }
  grain(x, W, H, 7000, 0.03, 0.09, true);
});
// asphalt: fine grain, darker tyre tracks, patches and cracks
const roadTex = hqTex(512, 512, (x, W, H) => {
  x.fillStyle = '#4b4e58'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '0,0,0' : '255,255,255'},${srnd(0.03, 0.06)})`; x.fillRect(srnd(0, W), srnd(0, H), srnd(60, 160), srnd(40, 120)); }
  for (const tx of [0.28, 0.72]) { const g = x.createLinearGradient(tx * W - 40, 0, tx * W + 40, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(tx * W - 40, 0, 80, H); }
  grain(x, W, H, 14000, 0.04, 0.14, true);
  for (let i = 0; i < 3; i++) { x.fillStyle = `rgba(20,20,24,${srnd(0.08, 0.16)})`; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(14, 40), srnd(8, 22), srnd(0, 3), 0, 7); x.fill(); }
  x.fillStyle = 'rgba(30,32,38,.35)'; x.fillRect(srnd(40, 300), srnd(40, 300), srnd(70, 140), srnd(50, 110));
  x.strokeStyle = 'rgba(20,20,26,.55)'; x.lineWidth = 1.5; for (let i = 0; i < 4; i++) { let px = srnd(0, W), py = srnd(0, H); x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += srnd(-25, 25); py += srnd(5, 30); x.lineTo(px, py); } x.stroke(); }
});
const roofTex = hqTex(256, 256, (x, W, H) => {
  x.fillStyle = '#8f4a36'; x.fillRect(0, 0, W, H); const rows = 10, cols = 8, rh = H / rows, cw = W / cols;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols + 1; c++) { const px = c * cw - (r % 2) * cw / 2, py = r * rh; x.fillStyle = `hsl(${12 + srnd(-3, 5)},${50 + srnd(0, 12)}%,${42 + srnd(-5, 6)}%)`; x.beginPath(); x.moveTo(px + 1, py); x.lineTo(px + cw - 1, py); x.lineTo(px + cw - 1, py + rh - 3); x.quadraticCurveTo(px + cw / 2, py + rh + 2, px + 1, py + rh - 3); x.fill(); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(px + 2, py + 1, cw - 4, 3); }
  grain(x, W, H, 2500, 0.03, 0.08);
});
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

function facadeTex(w, h, o) {
  const S = 112, W0 = Math.round(w * S), H0 = Math.round(h * S), k = Math.min(1, 1024 / Math.max(W0, H0));
  const t = ctex(Math.round(W0 * k), Math.round(H0 * k), (x, W, H) => {
    x.save(); x.scale(k, k); W = W0; H = H0;
    // plaster with soft variation, a stone base and a dark top drip
    x.fillStyle = o.col; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(${srnd(0, 1) > 0.5 ? '255,255,255' : '0,0,0'},${srnd(0.015, 0.04)})`; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(20, 90), srnd(10, 50), 0, 0, 7); x.fill(); }
    grain(x, W, H, Math.round(W * H / 60), 0.02, 0.06, true); styleOverlay(x, W, H, o, S);
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
    const sh = 0.58 * S; x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(8, sy + 12, W - 16, sh + 6); const kind = shopKind(o.shop), r10 = lrng([...(o.shop || 'x')].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) + Math.round(W)), em = kind && W > 2.6 * S ? sh : 0;
    x.fillStyle = kind === 'pharmacy' ? '#d81e1e' : o.sign; x.fillRect(6, sy + 8, W - 12, sh);
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.strokeRect(12, sy + 14, W - 24, sh - 12);
    let fsz = Math.round(0.4 * S); const setF = () => { x.font = `900 italic ${fsz}px "Barlow Condensed", Impact, sans-serif`; }; setF(); while (x.measureText(o.shop).width > W - 60 - em && fsz > 18) { fsz -= 2; setF(); } x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillText(o.shop, W / 2 + em / 2 + 3, sy + 8 + sh / 2 + 3); x.fillStyle = '#fff'; x.fillText(o.shop, W / 2 + em / 2, sy + 8 + sh / 2);
    if (em) shopEmblem(x, kind, 18 + sh * 0.42, sy + 8 + sh / 2, sh * 0.36);
    const wy = sy + sh + 18, dw = 0.92 * S, dx = o.door === 'l' ? 0.22 * S : W - 0.22 * S - dw;
    x.fillStyle = '#3b2a20'; x.fillRect(0.12 * S, wy - 6, W - 0.24 * S, H - wy + 6);
    const gl = x.createLinearGradient(0, wy, 0, H); gl.addColorStop(0, '#cdeaf4'); gl.addColorStop(0.5, '#7fa9c2'); gl.addColorStop(1, '#3f6684'); x.fillStyle = gl; x.fillRect(0.18 * S, wy, W - 0.36 * S, H - wy - 0.22 * S);
    const gL = 0.18 * S, gR = W - 0.18 * S, gB = H - 0.22 * S; let drew = false; if (kind) { if (dx - 6 - gL > 40) drew = shopGoods(x, kind, gL, dx - 6, wy, gB, S, r10, o.goods); if (gR - (dx + dw + 6) > 40) drew = shopGoods(x, kind, dx + dw + 6, gR, wy, gB, S, r10, o.goods) || drew; }
    const g2 = o.goods || []; if (!drew) for (let row = 0; row < 2; row++) for (let k2 = 0; k2 < Math.floor(W / (0.3 * S)); k2++) { const gx = 0.3 * S + k2 * 0.3 * S; if (gx > dx - 10 && gx < dx + dw + 10) continue; x.fillStyle = g2[(k2 + row) % (g2.length || 1)] || '#f4c27a'; x.beginPath(); x.arc(gx, H - 0.42 * S - row * 0.3 * S, 0.11 * S, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(gx - 4, H - 0.46 * S - row * 0.3 * S, 0.035 * S, 0, 7); x.fill(); }
    x.fillStyle = '#6f4ab0'; x.fillStyle = 'rgba(255,255,255,.3)'; for (let k2 = 0; k2 < 3; k2++) { x.beginPath(); x.moveTo(0.4 * S + k2 * 0.95 * S, H - 0.3 * S); x.lineTo(0.8 * S + k2 * 0.95 * S, wy + 4); x.lineTo(0.98 * S + k2 * 0.95 * S, wy + 4); x.lineTo(0.58 * S + k2 * 0.95 * S, H - 0.3 * S); x.fill(); }
    x.fillStyle = '#6b3f26'; x.fillRect(dx, wy + 6, dw, H - wy - 6); x.fillStyle = '#9fd0e4'; x.fillRect(dx + 10, wy + 18, dw - 20, (H - wy) * 0.45); x.fillStyle = '#ffc20e'; x.beginPath(); x.arc(dx + dw - 16, wy + (H - wy) * 0.62, 5, 0, 7); x.fill();
    x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, H - 10, W, 10);
    // weathering: rain streaks under sills and the cornice, grime near the pavement
    for (let i = 0; i < Math.round(W / 40); i++) { const sx = srnd(0, W), sy0 = srnd(0, sy - 40), len = srnd(40, 160), g = x.createLinearGradient(0, sy0, 0, sy0 + len); g.addColorStop(0, 'rgba(60,50,40,.13)'); g.addColorStop(1, 'rgba(60,50,40,0)'); x.fillStyle = g; x.fillRect(sx, sy0, srnd(3, 9), len); }
    const gb = x.createLinearGradient(0, H - 0.5 * S, 0, H); gb.addColorStop(0, 'rgba(50,40,30,0)'); gb.addColorStop(1, 'rgba(50,40,30,.25)'); x.fillStyle = gb; x.fillRect(0, H - 0.5 * S, W, 0.5 * S);
    x.restore();
  });
  t.anisotropy = ANISO; return t;
}

function addFacadeBlock(g, P) {
  const w = P.x1 - P.x0, h = P.h, z0 = -8, z1 = -5;
  const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.06).getHex(), 0.9), roof = std(0x8a5a4a, 0.9);
  const mats = [side, side, roof, side, new THREE.MeshStandardMaterial({map: facadeTex(w, h, P), roughness: 0.85}), side];
  const m = new THREE.Mesh(BOX, mats); m.scale.set(w, h, z1 - z0); m.position.set((P.x0 + P.x1) / 2, 0.22 + h / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  boxes.push({b: [P.x0, P.x1, 0.22, 0.22 + h, z0, z1], kind: 'hard'});
  addBox(g, std(0xf4eee2, 0.8), P.x0 - 0.06, P.x1 + 0.06, 0.22 + h, 0.22 + h + 0.22, z1 - 0.3, z1 + 0.12);
  addBox(g, std(0xf4eee2, 0.8), P.x0, P.x0 + 0.12, 0.22 + h, 0.22 + h + 0.22, z0, z1, false); addBox(g, std(0xf4eee2, 0.8), P.x1 - 0.12, P.x1, 0.22 + h, 0.22 + h + 0.22, z0, z1, false);
  // roof bits
  if (P.chim) addBox(g, std(0xc0603e, 0.9), P.x0 + w * 0.7, P.x0 + w * 0.7 + 0.5, 0.4 + h, 1.2 + h, -7.2, -6.6, false);
}

// ================= CHARACTERS =================
const SKIN = [0xf1c7a0, 0xd9a27a, 0xa86f4c, 0xffd9b8, 0xc68a5e], CLOTH = [0x1f6fd1, 0xe22511, 0x2fa84f, 0xffc20e, 0x7a4fb0, 0xff8fb8, 0x3a3f4a, 0xf4eee2, 0xff7a1a];
const HAIR = [0x2b1d14, 0x5a3a22, 0xc8a060, 0x111111, 0x9a9a9a, 0x8a3a1a];
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10), SPH = new THREE.SphereGeometry(1, 16, 12);
function part(geo, mat, sx, sy, sz, x, y, z, par) { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; par.add(m); return m; }
function limb(par, mat, x, y, len, r, endMat, endR) { const piv = new THREE.Group(); piv.position.set(x, y, 0); par.add(piv); part(CYL, mat, r, len, r, 0, -len / 2, 0, piv); if (endMat) part(SPH, endMat, endR, endR * 0.8, endR * 1.3, 0, -len, endR * 0.3, piv); return piv; }
function makePerson(o) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  let sk = std(pick(SKIN), 0.7), cl = std(o.col || pick(CLOTH), 0.75), pn = std(pick([0x22304a, 0x3a3f4a, 0x6b4a2a, 0x1b1330, 0x5a6a80]), 0.8), hr = std(pick(HAIR), 0.8), shoe = std(0x1b1330, 0.6);
  const NS = npcSkin(o.npcSkin); if (NS.cloth) cl = std(NS.cloth, 0.75); if (NS.pants) pn = std(NS.pants, 0.8); if (NS.shoe) shoe = std(NS.shoe, 0.6);
  const legs = [limb(body, pn, -0.1, 0.74, 0.7, 0.085, shoe, 0.09), limb(body, pn, 0.1, 0.74, 0.7, 0.085, shoe, 0.09)];
  if (o.skirt) part(new THREE.ConeGeometry(1, 1, 14), cl, 0.3, 0.42, 0.26, 0, 0.78, 0, body);
  part(CYL, cl, 0.2, 0.62, 0.15, 0, 1.06, 0, body); part(SPH, cl, 0.2, 0.1, 0.15, 0, 1.37, 0, body);
  const arms = [limb(body, cl, -0.27, 1.34, 0.56, 0.06, sk, 0.065), limb(body, cl, 0.27, 1.34, 0.56, 0.06, sk, 0.065)];
  arms[0].rotation.z = -0.12; arms[1].rotation.z = 0.12;
  const head = new THREE.Group(); head.position.set(0, 1.6, 0); body.add(head);
  part(SPH, sk, 0.19, 0.2, 0.19, 0, 0, 0, head);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hr); cap.position.set(0, 0.02, -0.015); cap.rotation.x = -0.25; head.add(cap);
  if (o.long) part(SPH, hr, 0.17, 0.22, 0.1, 0, -0.1, -0.12, head);
  if (o.hat && !NS.hat) { part(CYL, std(o.hat, 0.7), 0.22, 0.05, 0.22, 0, 0.14, 0, head); part(CYL, std(o.hat, 0.7), 0.15, 0.16, 0.15, 0, 0.22, 0, head); }
  const eyeM = std(0x1b1330, 0.4); const eyes = [part(SPH, eyeM, 0.026, 0.034, 0.02, -0.065, 0.02, 0.175, head), part(SPH, eyeM, 0.026, 0.034, 0.02, 0.065, 0.02, 0.175, head)];
  const mouth = part(SPH, std(0x8a2a1a, 0.6), 0.04, 0.012, 0.02, 0, -0.08, 0.175, head);
  if (o.bag) part(BOX, std(o.bag, 0.7), 0.08, 0.28, 0.3, 0.3, 1.0, 0, body);
  dressPerson({head, body}, NS);
  ink(g, 0.018);
  const s = o.kid ? 0.68 : 1; g.scale.setScalar(s);
  return {g, body, legs, arms, head, eyes, mouth, s};
}
function makeCat(o) {
  { const AS = aniSkin(o.aniSkin); if (!o.aniSkin && AS.id === 'normal' && (CUR_THEME === 'uzay' || LOCAL_ANI[CUR_THEME])) { pick([0]); return CUR_THEME === 'uzay' ? makeAlien() : makeCreature(LOCAL_ANI[CUR_THEME], 'cat'); } if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'cat'); } }
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(o.col || pick([0xf0912e, 0x8a8a92, 0x2a2a2e, 0xf4f0e8, 0xc8a070]), 0.8), w = std(0xf4f0e8, 0.8);
  part(SPH, c, 0.17, 0.16, 0.28, 0, 0.27, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.42, 0.25); body.add(head);
  part(SPH, c, 0.14, 0.12, 0.13, 0, 0, 0, head); part(SPH, w, 0.07, 0.05, 0.05, 0, -0.04, 0.1, head);
  const earG = new THREE.ConeGeometry(1, 1, 4); for (const sx of [-1, 1]) { const e = part(earG, c, 0.05, 0.09, 0.035, sx * 0.075, 0.11, 0, head); e.rotation.z = -sx * 0.25; }
  const em = std(0x9ad13a, 0.3), pm = std(0x111111, 0.3); for (const sx of [-1, 1]) { part(SPH, em, 0.026, 0.03, 0.015, sx * 0.055, 0.02, 0.115, head); part(SPH, pm, 0.01, 0.026, 0.01, sx * 0.055, 0.02, 0.126, head); }
  const legs = []; for (const [lx, lz] of [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]]) legs.push(limb(body, c, lx, 0.2, 0.2, 0.035, w, 0.04));
  legs.forEach((l, i) => { l.position.z = [0.15, 0.15, -0.15, -0.15][i]; });
  const tail = new THREE.Group(); tail.position.set(0, 0.32, -0.26); body.add(tail); part(CYL, c, 0.03, 0.42, 0.03, 0, 0.2, 0, tail); tail.rotation.x = -0.7;
  ink(g, 0.014); return {g, body, legs, head, tail, s: 1};
}
function makeDog(o) {
  { const AS = aniSkin(o && o.aniSkin); if (AS.id === 'normal' && (CUR_THEME === 'uzay' || LOCAL_ANI[CUR_THEME])) { pick([0]); return CUR_THEME === 'uzay' ? makeAlien() : makeCreature(LOCAL_ANI[CUR_THEME], 'dog'); } if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'dog'); } }
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(pick([0xa8743c, 0xe8d2a8, 0x3a2a20]), 0.8), d = std(0x3a2a20, 0.8);
  part(SPH, c, 0.2, 0.2, 0.36, 0, 0.42, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.62, 0.34); body.add(head);
  part(SPH, c, 0.16, 0.15, 0.17, 0, 0, 0, head); part(SPH, c, 0.08, 0.07, 0.11, 0, -0.04, 0.15, head); part(SPH, d, 0.035, 0.03, 0.03, 0, -0.01, 0.26, head);
  for (const sx of [-1, 1]) { part(BOX, d, 0.06, 0.18, 0.1, sx * 0.15, -0.04, -0.02, head); part(SPH, std(0x111111), 0.024, 0.028, 0.02, sx * 0.06, 0.04, 0.14, head); }
  const legs = []; for (const [lx, lz] of [[-0.1, 0.2], [0.1, 0.2], [-0.1, -0.2], [0.1, -0.2]]) { const l = limb(body, c, lx, 0.32, 0.3, 0.05, d, 0.05); l.position.z = lz; legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 0.5, -0.34); body.add(tail); part(CYL, c, 0.035, 0.25, 0.035, 0, 0.12, 0, tail); tail.rotation.x = -0.9;
  ink(g, 0.016); return {g, body, legs, head, tail, s: 1};
}
function makePigeon() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const c = std(0x8d93a6, 0.7);
  part(SPH, c, 0.1, 0.09, 0.15, 0, 0.13, 0, body);
  const head = new THREE.Group(); head.position.set(0, 0.24, 0.1); body.add(head);
  part(SPH, std(0x6f7590, 0.6), 0.06, 0.06, 0.06, 0, 0, 0, head); part(new THREE.ConeGeometry(1, 1, 5), std(0xe8a03a), 0.015, 0.05, 0.015, 0, -0.01, 0.07, head).rotation.x = Math.PI / 2;
  const wings = []; for (const sx of [-1, 1]) { const p = new THREE.Group(); p.position.set(sx * 0.07, 0.16, 0); body.add(p); part(BOX, std(0x737a92, 0.7), 0.16, 0.02, 0.18, sx * 0.08, 0, -0.02, p); wings.push(p); }
  ink(g, 0.012); return {g, body, head, wings, legs: [], s: 1};
}
// ================= NPC + ANIMAL SKINS, PEOPLE KICK THE FLIX BACK (v5) =================
const NPC_SKINS0 = [
  {id: 'mahalle', name: 'Mahalleli', price: 0},
  {id: 'futbolcu', name: 'Futbolcu', price: 800, cloth: 0xe22511, pants: 0xf4f4f4, shoe: 0xffffff},
  {id: 'asci', name: 'Aşçı', price: 1200, cloth: 0xf8f8f4, pants: 0x3a3f4a, hat: 'chef'},
  {id: 'astronot', name: 'Astronot', price: 2500, cloth: 0xe8ecf2, pants: 0xe8ecf2, shoe: 0x8a93a6, hat: 'helmet'},
  {id: 'kahraman', name: 'Süper Kahraman', price: 4000, cloth: 0x1f6fd1, pants: 0x1f6fd1, shoe: 0xe22511, cape: 0xe22511},
  {id: 'polis', name: 'Polis', price: 500, cloth: 0x1f3f7a, pants: 0x1b2440, shoe: 0x111111, hat: 'cap'},
  {id: 'doktor', name: 'Doktor', price: 700, cloth: 0xf8f8f8, pants: 0x3a8ab0, shoe: 0xf4f4f4, hat: 'doc'},
  {id: 'itfaiye', name: 'İtfaiyeci', price: 1000, cloth: 0xc8302a, pants: 0x2a2a2e, shoe: 0x111111, hat: 'fire'},
  {id: 'kovboy', name: 'Kovboy', price: 1500, cloth: 0xc8743a, pants: 0x2a4a7a, shoe: 0x5a3a22, hat: 'cowboy'},
  {id: 'palyaco', name: 'Palyaço', price: 2000, cloth: 0xffc20e, pants: 0x1f6fd1, shoe: 0xe22511, hat: 'clown'},
  {id: 'ninja', name: 'Ninja', price: 3000, cloth: 0x1b1b22, pants: 0x1b1b22, shoe: 0x1b1b22, hat: 'ninja'},
  {id: 'kral', name: 'Kral', price: 6000, cloth: 0x7a2a9a, pants: 0x3a1a4a, shoe: 0xffc20e, hat: 'crown', cape: 0xc8102e},
];
const ANI_SKINS0 = [
  {id: 'normal', name: 'Kedi & Köpek', price: 0},
  {id: 'dino', name: 'Dinozor', price: 1000, say: ['RAAWR!', 'GRAAA!', 'Rawr?']},
  {id: 'penguen', name: 'Penguen', price: 1500, say: ['Vak vak!', 'Brrr!', 'Kaydım!']},
  {id: 'panda', name: 'Panda', price: 2500, say: ['Mmmf!', 'Bambu?', 'Hıh!']},
  {id: 'tavuk', name: 'Tavuk', price: 3500, say: ['GIDAAK!', 'Bık bık!', 'GIT GIT!']},
  {id: 'tavsan', name: 'Tavşan', price: 400, say: ['Hop!', 'Havuç?', 'Zıp zıp!']},
  {id: 'ordek', name: 'Ördek', price: 600, say: ['Vak!', 'Vak vak vak!', 'Gık?']},
  {id: 'kurbaga', name: 'Kurbağa', price: 900, say: ['Vırak!', 'Zıpla!', 'Vrrak?']},
  {id: 'tilki', name: 'Tilki', price: 1800, say: ['Hihi!', 'Kurnazım!', 'Yakala beni!']},
  {id: 'koala', name: 'Koala', price: 2200, say: ['Uykum var...', 'Mmm!', 'Okaliptüs?']},
  {id: 'kanguru', name: 'Kanguru', price: 3000, say: ['Hop hop!', 'Kesemde yer var!', 'Boks?']},
  {id: 'zurafa', name: 'Zürafa', price: 5000, say: ['Yukarısı güzel!', 'Mmm yaprak!', 'Hı?']},
];
const NPC_SKINS = NPC_SKINS0.slice().sort((a, b) => a.price - b.price), ANI_SKINS = ANI_SKINS0.slice().sort((a, b) => a.price - b.price);
function npcSkin(id) { if (!id && CUR_THEME === 'uzay' && (SAVE.npc || 'mahalle') === 'mahalle') id = 'astronot'; return NPC_SKINS.find((s) => s.id === (id || SAVE.npc)) || NPC_SKINS[0]; }
function aniSkin(id) { return ANI_SKINS.find((s) => s.id === (id || SAVE.ani)) || ANI_SKINS[0]; }
// costume pieces added on top of the normal person model
function dressPerson(m, NS) {
  if (NS.hat === 'chef') { const w = std(0xffffff, 0.8); part(CYL, w, 0.17, 0.2, 0.17, 0, 0.24, 0, m.head); part(SPH, w, 0.21, 0.13, 0.21, 0, 0.38, 0, m.head); }
  if (NS.hat === 'helmet') {
    const gl = new THREE.MeshStandardMaterial({color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.3, depthWrite: false});
    const h = new THREE.Mesh(SPH, gl); h.scale.setScalar(0.27); h.position.set(0, 0.02, 0.01); h.userData.noInk = true; m.head.add(h);
    part(CYL, std(0xc8ccd6, 0.5), 0.2, 0.06, 0.2, 0, -0.2, 0, m.head);
    part(BOX, std(0xd8dce4, 0.6), 0.3, 0.42, 0.14, 0, 1.08, -0.2, m.body); part(BOX, std(0xe22511, 0.5), 0.1, 0.06, 0.02, -0.07, 1.18, 0.155, m.body);
  }
  if (NS.cape) { const c = part(BOX, std(NS.cape, 0.7), 0.46, 0.8, 0.025, 0, 1.0, -0.19, m.body); c.rotation.x = 0.14; part(BOX, std(0xffc20e, 0.5), 0.41, 0.06, 0.31, 0, 0.8, 0, m.body); }
  if (NS.hat === 'cap') { part(CYL, std(0x1f3f7a, 0.6), 0.2, 0.08, 0.2, 0, 0.14, 0, m.head); part(CYL, std(0x1b2440, 0.6), 0.24, 0.02, 0.24, 0, 0.1, 0.04, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.06, 0.05, 0.02, 0, 0.15, 0.2, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.07, 0.08, 0.02, -0.07, 1.2, 0.155, m.body); }
  if (NS.hat === 'doc') { part(BOX, std(0xf8f8f8, 0.8), 0.36, 0.5, 0.3, 0, 0.8, 0, m.body); const st = part(new THREE.TorusGeometry(1, 0.15, 6, 16, Math.PI), std(0x333333, 0.4), 0.09, 0.12, 0.09, 0, 1.12, 0.15, m.body); st.rotation.z = Math.PI; part(SPH, std(0xbbbbbb, 0.3, 0.6), 0.03, 0.03, 0.03, 0.02, 0.98, 0.16, m.body); }
  if (NS.hat === 'fire') { part(SPH, std(0xc8302a, 0.4), 0.2, 0.13, 0.22, 0, 0.12, 0.01, m.head); part(CYL, std(0xc8302a, 0.4), 0.26, 0.02, 0.28, 0, 0.06, -0.02, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.08, 0.07, 0.02, 0, 0.16, 0.21, m.head); part(BOX, std(0xffe14a, 0.5), 0.38, 0.05, 0.25, 0, 0.75, 0, m.body); }
  if (NS.hat === 'cowboy') { part(CYL, std(0x8a5a2a, 0.8), 0.33, 0.02, 0.33, 0, 0.12, 0, m.head); part(CYL, std(0x8a5a2a, 0.8), 0.15, 0.14, 0.15, 0, 0.2, 0, m.head); part(CYL, std(0x3a2a1a, 0.8), 0.155, 0.03, 0.155, 0, 0.15, 0, m.head); part(BOX, std(0xe22511, 0.8), 0.2, 0.06, 0.2, 0, 1.25, 0.05, m.body); }
  if (NS.hat === 'clown') { part(SPH, std(0xe22511, 0.4), 0.04, 0.04, 0.04, 0, 0, 0.17, m.head); for (const [sx, c] of [[-1, 0xff2bd6], [1, 0x2fa84f]]) part(SPH, std(c, 0.9), 0.1, 0.1, 0.1, sx * 0.13, 0.08, -0.02, m.head); part(CYL, std(0xffffff, 0.8), 0.16, 0.05, 0.16, 0, 1.32, 0, m.body); for (let i = 0; i < 3; i++) part(SPH, std([0xe22511, 0x1f6fd1, 0x2fa84f][i], 0.6), 0.04, 0.04, 0.03, 0, 1.12 - i * 0.12, 0.155, m.body); }
  if (NS.hat === 'ninja') { part(SPH, std(0x1b1b22, 0.8), 0.175, 0.17, 0.17, 0, 0.01, 0, m.head); part(BOX, std(0xf1c7a0, 0.7), 0.2, 0.05, 0.03, 0, 0.03, 0.155, m.head); part(CYL, std(0xc8102e, 0.7), 0.18, 0.03, 0.18, 0, 0.1, 0, m.head); const t = part(BOX, std(0xc8102e, 0.7), 0.03, 0.18, 0.02, 0.04, 0.02, -0.18, m.head); t.rotation.z = 0.4; part(BOX, std(0xc8102e, 0.7), 0.38, 0.05, 0.27, 0, 0.78, 0, m.body); }
  if (NS.hat === 'crown') { const gd = std(0xffc20e, 0.25, 0.7); part(CYL, gd, 0.15, 0.08, 0.15, 0, 0.17, 0, m.head); for (let i = 0; i < 5; i++) { const a = i * 1.257; part(new THREE.ConeGeometry(1, 1, 4), gd, 0.03, 0.08, 0.03, Math.sin(a) * 0.14, 0.25, Math.cos(a) * 0.14, m.head); } part(SPH, std(0xc8102e, 0.2), 0.025, 0.025, 0.02, 0, 0.18, 0.15, m.head); }
  if (NS.id === 'futbolcu') { part(BOX, std(0xffffff, 0.7), 0.12, 0.1, 0.02, 0, 1.12, 0.152, m.body); }
}
// animal skins: same parts as the cat / dog (body, head, 4 legs, tail) so the walking and reaction code works unchanged
function makeCreature(id, kind) {
  if (NEW_ANI.includes(id)) return makeCreature2(id, kind);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const legs = []; let head, tail;
  const leg = (mat, x, y, z, len, r, end, er) => { const l = limb(body, mat, x, y, len, r, end, er); l.position.z = z; legs.push(l); return l; };
  if (id === 'dino') {
    const c = std(0x5fae3a, 0.7), b = std(0xd8e8a0, 0.8), sp = std(0xff9a1a, 0.6);
    part(SPH, c, 0.2, 0.21, 0.3, 0, 0.36, 0, body); part(SPH, b, 0.15, 0.15, 0.22, 0, 0.32, 0.08, body);
    head = new THREE.Group(); head.position.set(0, 0.66, 0.3); body.add(head);
    part(SPH, c, 0.14, 0.13, 0.19, 0, 0, 0.04, head); part(SPH, b, 0.11, 0.05, 0.15, 0, -0.07, 0.07, head);
    for (const sx of [-1, 1]) { part(SPH, std(0xffffff, 0.3), 0.04, 0.045, 0.03, sx * 0.07, 0.05, 0.15, head); part(SPH, std(0x111111, 0.3), 0.02, 0.028, 0.015, sx * 0.07, 0.05, 0.175, head); }
    for (let k = 0; k < 4; k++) { const s = part(new THREE.ConeGeometry(1, 1, 4), sp, 0.05, 0.11, 0.05, 0, 0.58 - k * 0.03, 0.12 - k * 0.13, body); s.rotation.x = -0.2; }
    leg(c, -0.11, 0.24, -0.06, 0.22, 0.06, c, 0.07); leg(c, 0.11, 0.24, -0.06, 0.22, 0.06, c, 0.07); leg(c, -0.13, 0.46, 0.2, 0.12, 0.03, c, 0.035); leg(c, 0.13, 0.46, 0.2, 0.12, 0.03, c, 0.035);
    tail = new THREE.Group(); tail.position.set(0, 0.36, -0.26); body.add(tail); const tg = new THREE.Group(); tg.rotation.x = -0.75; tail.add(tg); const tc = part(new THREE.ConeGeometry(1, 1, 10), c, 0.11, 0.55, 0.11, 0, 0.26, 0, tg);
  } else if (id === 'penguen') {
    const k = std(0x1b1f2a, 0.5), w = std(0xf8f8f4, 0.6), o = std(0xff9a1a, 0.5);
    part(SPH, k, 0.19, 0.27, 0.18, 0, 0.32, 0, body); part(SPH, w, 0.14, 0.22, 0.1, 0, 0.3, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.62, 0.02); body.add(head);
    part(SPH, k, 0.13, 0.12, 0.13, 0, 0, 0, head); part(SPH, w, 0.09, 0.07, 0.06, 0, -0.01, 0.09, head); const bk = part(new THREE.ConeGeometry(1, 1, 6), o, 0.035, 0.09, 0.035, 0, -0.02, 0.16, head); bk.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) part(SPH, std(0x111111, 0.3), 0.02, 0.025, 0.015, sx * 0.05, 0.03, 0.12, head);
    leg(o, -0.07, 0.07, 0.04, 0.05, 0.03, o, 0.06); leg(o, 0.07, 0.07, 0.04, 0.05, 0.03, o, 0.06);
    const f1 = leg(k, -0.2, 0.45, 0, 0.24, 0.035, k, 0.04), f2 = leg(k, 0.2, 0.45, 0, 0.24, 0.035, k, 0.04); f1.rotation.z = -0.3; f2.rotation.z = 0.3;
    tail = new THREE.Group(); tail.position.set(0, 0.1, -0.16); body.add(tail); part(SPH, k, 0.06, 0.03, 0.08, 0, 0.02, 0, tail);
  } else if (id === 'panda') {
    const w = std(0xf8f8f4, 0.8), k = std(0x1b1f2a, 0.7);
    part(SPH, w, 0.22, 0.21, 0.32, 0, 0.4, 0, body); part(SPH, k, 0.23, 0.12, 0.12, 0, 0.44, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.62, 0.3); body.add(head);
    part(SPH, w, 0.17, 0.15, 0.15, 0, 0, 0, head); part(SPH, w, 0.08, 0.06, 0.07, 0, -0.05, 0.12, head); part(SPH, k, 0.03, 0.025, 0.02, 0, -0.03, 0.19, head);
    for (const sx of [-1, 1]) { part(SPH, k, 0.06, 0.06, 0.04, sx * 0.13, 0.13, -0.02, head); part(SPH, k, 0.05, 0.04, 0.02, sx * 0.065, 0.03, 0.13, head); part(SPH, std(0xffffff, 0.3), 0.015, 0.015, 0.01, sx * 0.065, 0.035, 0.148, head); }
    for (const [lx, lz] of [[-0.12, 0.18], [0.12, 0.18], [-0.12, -0.18], [0.12, -0.18]]) leg(k, lx, 0.3, lz, 0.24, 0.07, k, 0.07);
    tail = new THREE.Group(); tail.position.set(0, 0.45, -0.31); body.add(tail); part(SPH, w, 0.05, 0.05, 0.05, 0, 0.03, 0, tail);
  } else { // tavuk
    const w = std(0xf8f6ee, 0.8), r = std(0xe22511, 0.6), y = std(0xffb01a, 0.5);
    part(SPH, w, 0.16, 0.16, 0.21, 0, 0.32, 0, body);
    head = new THREE.Group(); head.position.set(0, 0.54, 0.14); body.add(head);
    part(SPH, w, 0.09, 0.1, 0.09, 0, 0, 0, head); part(BOX, r, 0.025, 0.08, 0.1, 0, 0.11, 0, head); part(SPH, r, 0.025, 0.04, 0.02, 0, -0.07, 0.07, head);
    const bk = part(new THREE.ConeGeometry(1, 1, 5), y, 0.03, 0.07, 0.03, 0, -0.01, 0.11, head); bk.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) part(SPH, std(0x111111, 0.3), 0.016, 0.02, 0.012, sx * 0.05, 0.02, 0.075, head);
    leg(y, -0.06, 0.18, 0.02, 0.16, 0.018, y, 0.035); leg(y, 0.06, 0.18, 0.02, 0.16, 0.018, y, 0.035);
    const wg1 = leg(w, -0.16, 0.38, -0.02, 0.15, 0.06, w, 0.03), wg2 = leg(w, 0.16, 0.38, -0.02, 0.15, 0.06, w, 0.03); wg1.scale.set(0.6, 1, 1.6); wg2.scale.set(0.6, 1, 1.6);
    tail = new THREE.Group(); tail.position.set(0, 0.38, -0.18); body.add(tail); for (const [c, a] of [[w, -0.3], [std(0x1b1330, 0.6), 0], [w, 0.3]]) { const f = part(SPH, c, 0.03, 0.12, 0.05, a * 0.2, 0.08, 0, tail); f.rotation.z = a; }
  }
  ink(g, 0.014); if (kind === 'dog') g.scale.setScalar(1.2);
  return {g, body, legs, head, tail, s: 1};
}
// a person hit by the FLIX juggles it once or twice and then boots it somewhere random
const KICK_SAY = ['Al sana!', 'Gol!', 'Uzak dur!', 'Hoppaa!', 'Ben hallederim!', 'Şut!', 'Kafa!'];
function startJuggle(B, a) {
  if (B.jug || B.juggled || BOT || window.__noJuggle || a.sit || (a.kind !== 'person' && a.kind !== 'kid')) return false;
  B.jug = {a, t: 0, k: -1, n: Math.random() < 0.55 ? 1 : 2}; a.react = Math.max(a.react, B.jug.n * 0.42 + 0.6); B.v.set(0, 0, 0); B.open = false; featherOff(); return true;
}
function jugTick(B, dt) {
  const J = B.jug, a = J.a, D = 0.42; J.t += dt;
  const ry = a.m.g.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry), foot = a.y0 + 0.12 * a.m.s, k = Math.floor(J.t / D), u = (J.t % D) / D;
  if (k !== J.k) { J.k = k; if (k <= J.n) { a.kickT = 0.24; SFX.bounce(); buzz(8); squash = 0.8; } }
  if (k >= J.n) { // the final boot: a random direction, a lob strong enough to cross the street
    const yaw = Math.random() * Math.PI * 2, sp = 5 + Math.random() * 3.5;
    B.p.set(a.x + fx * 0.5, foot + RAD + 0.35, a.z + fz * 0.5); B.v.set(Math.sin(yaw) * sp, 6.5 + Math.random() * 2.5, -Math.cos(yaw) * sp);
    B.jug = null; B.juggled = true; B.t = 0; B.rest = 0; B.energy = Math.max(B.energy, 0.6);
    SFX.launch(0.75); buzz(20); bubble(a, pick(KICK_SAY)); toast('ŞUTLADI!', 'nereye gidecek?', '#7a4fb0'); return;
  }
  B.p.set(a.x + fx * 0.5, foot + RAD + Math.sin(u * Math.PI) * (1.0 + 0.25 * k), a.z + fz * 0.5);
}

const SAY = {
  person: ['Hey!', 'Aaa!', 'Ayy kafam!', 'Kimin bu?', 'Dikkat!', 'Oha!', 'Yavaş!', 'Bu ne ya?'],
  kid: ['Yaşasın!', 'Bir daha!', 'Haha!', 'Ben de!'],
  cat: ['MİYAV!', 'Hıhh!', 'MRRAV!'], dog: ['HAV HAV!', 'Hav!'], pigeon: ['pır pır!'],
};
let actors = [];
function spawnActors(L) {
  actors = [];
  for (const A of L.actors || []) {
    if (A.t === 'pigeons' && CUR_THEME === 'antarktika') continue;
    const n = A.t === 'pigeons' ? (A.n || 4) : 1;
    for (let k = 0; k < n; k++) {
      const kind = A.t === 'pigeons' ? 'pigeon' : A.t;
      const m = kind === 'cat' ? makeCat(A) : kind === 'dog' ? makeDog(A) : kind === 'pigeon' ? makePigeon() : makePerson({...A, kid: kind === 'kid'});
      world.add(m.g);
      const x = A.x + (A.t === 'pigeons' ? srnd(-0.9, 0.9) : 0), z = A.z + (A.t === 'pigeons' ? srnd(-0.6, 0.6) : 0);
      const I = islandAt(x, z), y0 = A.y !== undefined ? A.y : (I ? I.top : 0.22);
      const a = {kind, m, x, z, y0, home: {x, z}, path: A.path || null, sp: A.sp || (kind === 'cat' ? 0.7 : kind === 'dog' ? 1.1 : 0.9), dir: 1, t: srnd(0, 6), sit: !!A.sit,
        r: kind === 'person' ? 0.3 * m.s : kind === 'kid' ? 0.3 * m.s : kind === 'dog' ? 0.32 : kind === 'cat' ? 0.27 : 0.17,
        h: kind === 'person' || kind === 'kid' ? 1.82 * m.s : kind === 'dog' ? 0.8 : kind === 'cat' ? 0.56 : 0.32,
        fixedY: A.y !== undefined, react: 0, rk: '', flee: 0, fleeDir: 1, fly: null, face: A.face || 0, look: 0, jy: 0};
      a.col = {x, z, y0, h: a.h, r: a.r, a};
      m.g.position.set(x, y0, z); m.g.rotation.y = a.face;
      if (a.sit && kind === 'cat') { m.body.rotation.x = -0.35; m.body.position.y = -0.05; m.legs[2].rotation.x = 1.2; m.legs[3].rotation.x = 1.2; }
      if (a.sit && (kind === 'person')) { m.legs.forEach((l) => { l.rotation.x = -1.45; }); m.body.position.y = -0.3; }
      actors.push(a);
    }
  }
}
// bubbles
const bubbles = [];
function bubble(a, txt) {
  const el = document.createElement('div'); el.className = 'bub'; el.textContent = txt; $('hud').appendChild(el);
  bubbles.push({el, a, life: 1.4}); while (bubbles.length > 5) bubbles.shift().el.remove();
}
function reactActor(a, from) {
  if (a.react > 0.4) return false;
  const dx = from.x - a.x, dz = from.z - a.z;
  if (a.kind === 'pigeon') { scarePigeons(a); return true; }
  a.react = a.kind === 'cat' ? 0.55 : 1.7; a.rk = 'hit'; a.look = Math.atan2(dx, dz);
  bubble(a, pick(((a.kind === 'cat' || a.kind === 'dog') && (aniSkin().id === 'normal' ? (CUR_THEME === 'uzay' ? ['Bip bop!', 'Zıırt!', 'Merhaba dünyalı!', 'Gılgıl?'] : LOCAL_ANI[CUR_THEME] ? aniSkin(LOCAL_ANI[CUR_THEME]).say : null) : aniSkin().say)) || SAY[a.kind] || SAY.person));
  if (a.kind === 'cat') { a.flee = 1.6; a.fleeA = Math.atan2(-dx, -dz) + (Math.random() - 0.5); a.sit = false; a.m.body.rotation.x = 0; a.m.body.position.y = 0; a.m.legs.forEach((l) => { l.rotation.x = 0; }); SFX.meow(); }
  else if (a.kind === 'dog') SFX.bark();
  else if (a.kind === 'kid') SFX.yay(); else SFX.hey();
  buzz(12);
  return true;
}
function scarePigeons(src) {
  let any = false;
  for (const p of actors) if (p.kind === 'pigeon' && !p.fly && Math.hypot(p.x - src.x, p.z - src.z) < 2.6) { p.fly = {t: 0, vx: srnd(-2.5, 2.5), vz: srnd(-3, -1), vy: srnd(3.5, 5)}; any = true; }
  if (any) { SFX.flap(); bubble(src, SAY.pigeon[0]); }
}
function updateActors(dt) {
  const tp = toyRoot.position, flying = P.phase === 'fly';
  for (const a of actors) {
    const m = a.m; a.t += dt;
    if (a.kind === 'pigeon') {
      if (a.fly) {
        const f = a.fly; f.t += dt; a.x += f.vx * dt; a.z += f.vz * dt; a.y0 += f.vy * dt; f.vy += 1.5 * dt;
        m.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(a.t * 30) * 0.9; });
        m.g.rotation.y = Math.atan2(f.vx, f.vz); a.col.off = true;
        if (f.t > 4.5) { a.fly = null; a.x = a.home.x; a.z = a.home.z; const I = islandAt(a.x, a.z); a.y0 = I ? I.top : 0.22; a.col.off = false; m.wings.forEach((w) => { w.rotation.z = 0; }); }
      } else {
        m.head.position.y = 0.24 - Math.max(0, Math.sin(a.t * 3 + a.home.x * 5)) * 0.08; m.body.rotation.x = Math.max(0, Math.sin(a.t * 3 + a.home.x * 5)) * 0.4;
        if (flying && tp.distanceTo(tmp.set(a.x, a.y0, a.z)) < 1.6) scarePigeons(a);
      }
      m.g.position.set(a.x, a.y0, a.z); a.col.x = a.x; a.col.z = a.z; a.col.y0 = a.y0; continue;
    }
    let moving = false, speed = 0;
    if (a.react > 0) a.react -= dt;
    if (a.flee > 0) { a.flee -= dt; speed = 4.2; const fx = Math.sin(a.fleeA), fz = Math.cos(a.fleeA), nx = a.x + fx * speed * dt, nz = a.z + fz * speed * dt; const I = islandAt(nx, nz); if (I && Math.abs(I.top - a.y0) < 0.5) { a.x = nx; a.z = nz; } else a.fleeA += Math.PI * 0.6; a.face = a.fleeA; moving = true; }
    else if (a.path && a.react <= 0 && !a.sit) {
      const [x0, z0, x1, z1] = a.path, L = Math.hypot(x1 - x0, z1 - z0) || 1;
      let u = ((a.x - x0) * (x1 - x0) + (a.z - z0) * (z1 - z0)) / (L * L);
      u += a.dir * a.sp * dt / L; if (u > 1) { u = 1; a.dir = -1; } if (u < 0) { u = 0; a.dir = 1; }
      a.x = x0 + (x1 - x0) * u; a.z = z0 + (z1 - z0) * u; a.face = Math.atan2((x1 - x0) * a.dir, (z1 - z0) * a.dir); moving = true; speed = a.sp;
      const I = islandAt(a.x, a.z); if (I && !a.fixedY) a.y0 = lerp(a.y0, I.top, 0.3);
    }
    // facing: turn toward the toy when hit or when it flies close
    const near = flying && Math.hypot(tp.x - a.x, tp.z - a.z) < 3.2;
    let want = a.face; if (a.react > 0 || near) want = Math.atan2(tp.x - a.x, tp.z - a.z);
    let dy = want - m.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); m.g.rotation.y += dy * Math.min(1, dt * (a.react > 0 ? 12 : 6));
    // walk cycle
    const ph = a.t * (speed > 2 ? 16 : 7), sw = moving ? (speed > 2 ? 0.9 : 0.55) : 0;
    if (a.kind === 'person' || a.kind === 'kid') {
      if (!a.sit) { m.legs[0].rotation.x = Math.sin(ph) * sw; m.legs[1].rotation.x = -Math.sin(ph) * sw; }
      if (a.kickT > 0) { a.kickT -= dt; m.legs[1].rotation.x = -Math.sin(clamp(1 - a.kickT / 0.24, 0, 1) * Math.PI) * 1.4; }
      let jy = 0;
      if (a.react > 0) { // jump + arms up, then shake a fist
        const k = 1.7 - a.react; jy = k < 0.4 ? Math.sin(k / 0.4 * Math.PI) * 0.4 : 0;
        if (k < 0.7) { m.arms[0].rotation.x = -2.7; m.arms[1].rotation.x = -2.7; m.arms[0].rotation.z = -0.5; m.arms[1].rotation.z = 0.5; }
        else { m.arms[0].rotation.x = 0; m.arms[0].rotation.z = -0.12; m.arms[1].rotation.x = -2.2 + Math.sin(a.t * 18) * 0.35; m.arms[1].rotation.z = 0.2; }
        m.mouth.scale.set(0.05, 0.05, 0.02); m.head.rotation.x = -0.3;
      } else {
        m.arms[0].rotation.x = -Math.sin(ph) * sw * 0.8; m.arms[1].rotation.x = Math.sin(ph) * sw * 0.8; m.arms[0].rotation.z = -0.12; m.arms[1].rotation.z = 0.12;
        m.mouth.scale.set(0.04, 0.012, 0.02); m.head.rotation.x = near ? -0.45 : 0; // look up at the flying FLIX
      }
      m.body.position.y = (a.sit ? -0.3 : 0) + jy + (moving ? Math.abs(Math.sin(ph)) * 0.04 : 0);
    } else { // cat / dog
      m.legs.forEach((l, i) => { if (!a.sit) l.rotation.x = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * sw; });
      let jy = 0;
      if (a.react > 0) { const k = (a.kind === 'cat' ? 0.55 : 1.7) - a.react; jy = k < 0.45 ? Math.sin(k / 0.45 * Math.PI) * (a.kind === 'cat' ? 0.9 : 0.3) : 0; if (a.kind === 'dog') jy = Math.abs(Math.sin(k * 14)) * 0.15; }
      m.tail.rotation.x = a.flee > 0 || a.react > 0 ? -0.05 : -0.7 + Math.sin(a.t * (a.kind === 'dog' ? 14 : 2)) * 0.25;
      m.tail.rotation.z = a.kind === 'dog' ? Math.sin(a.t * 16) * 0.5 : 0;
      m.body.position.y = (a.sit && a.kind === 'cat' ? -0.05 : 0) + jy;
      if (a.kind === 'cat' && a.react > 0) m.body.scale.set(1, 1.15, 0.92); else m.body.scale.set(1, 1, 1);
      m.head.rotation.x = near ? -0.4 : 0;
    }
    m.g.position.set(a.x, a.y0, a.z); a.col.x = a.x; a.col.z = a.z; a.col.y0 = a.y0 + (m.body.position.y > 0 ? m.body.position.y : 0);
  }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i]; b.life -= dt;
    if (b.life <= 0) { b.el.remove(); bubbles.splice(i, 1); continue; }
    const v = tmp.set(b.a.x, b.a.y0 + b.a.h + 0.35, b.a.z).project(camera);
    b.el.style.transform = `translate(${((v.x + 1) / 2 * VW()).toFixed(1)}px,${((1 - v.y) / 2 * VH() - (1.4 - b.life) * 14).toFixed(1)}px) translate(-50%,-100%) scale(${b.life > 1.25 ? (1.4 - b.life) / 0.15 : 1})`;
    b.el.style.opacity = Math.min(1, b.life / 0.25);
  }
}
function actorsPhys() { return actors.map((a) => a.col); }
function buildStreetGround() {
  const g = new THREE.Group(); world.add(g);
  for (const I of LV.islands) {
    const x0 = I.x - I.w / 2, x1 = I.x + I.w / 2, z0 = I.z - I.d / 2, z1 = I.z + I.d / 2;
    const t = (I.kind === 'road' ? roadTex : paveTex).clone(); t.needsUpdate = true; t.repeat.set(I.w / 2, I.d / 2);
    addBox(g, new THREE.MeshStandardMaterial({map: t, bumpMap: t, bumpScale: 0.04, roughness: 0.93}), x0, x1, I.top - 0.25, I.top, z0, z1);
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
    carExtras(P, top, g, false);
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


// ---------- sky + light ----------
scene.background = ctex(4, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#86cfe6'); g.addColorStop(0.55, '#d6f0ee'); g.addColorStop(1, '#fde2c6'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
const SKY = scene.background;
scene.add(new THREE.HemisphereLight(0xe0f4ff, 0xb08a6a, 0.62));
const sun = new THREE.DirectionalLight(0xfff2dc, 1.0); sun.position.set(10, 22, 9); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70}); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);

// ---------- the FLIX toy ----------
function leafGeo(L, Wd, bend) {
  const g = new THREE.PlaneGeometry(1, 1, 6, 14); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5; const wv = Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.96 + 0.04)), 0.75) * (1 - v * 0.25); p.setXYZ(i, (u - 0.5) * Wd * wv, v * L, bend * v * v * L - Math.pow((u - 0.5) * 2, 2) * 0.18 * Wd * wv); }
  g.computeVertexNormals(); return g;
}
function makeToy() {
  const g = new THREE.Group();
  const prof = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(a) * 0.36, Math.sin(a) * 0.3 + 0.3)); }
  prof.push(new THREE.Vector2(0.36, 0.42), new THREE.Vector2(0.3, 0.46), new THREE.Vector2(0, 0.46));
  mesh(new THREE.LatheGeometry(prof, 28), new THREE.MeshStandardMaterial({color: RED, roughness: 0.35, emissive: RED, emissiveIntensity: 0.15}), 0, 0, 0, g);
  const b1 = mesh(new THREE.TorusGeometry(0.365, 0.028, 8, 28), std(NAVY, 0.4), 0, 0.33, 0, g); b1.rotation.x = Math.PI / 2;
  const b2 = mesh(new THREE.TorusGeometry(0.335, 0.018, 6, 28), std(0xffffff, 0.4), 0, 0.2, 0, g); b2.rotation.x = Math.PI / 2;
  const lg = leafGeo(1.25, 0.62, -0.12), fe = [];
  [0x1f6fd1, 0x2fa84f, 0xffc20e].forEach((c, i) => {
    const k = i - 1, piv = new THREE.Group(); piv.position.set(k * 0.12, 0.42, 0); g.add(piv);
    piv.rotation.z = -k * 0.42; piv.rotation.x = k === 0 ? -0.08 : 0.06;
    mesh(lg, new THREE.MeshStandardMaterial({color: c, roughness: 0.45, emissive: c, emissiveIntensity: 0.3, side: THREE.DoubleSide}), 0, 0, 0, piv);
    const rib = mesh(new THREE.CylinderGeometry(0.012, 0.02, 1.05, 5), std(0xffffff, 0.5), 0, 0.52, 0.012, piv); rib.userData.noInk = true;
    fe.push(piv);
  });
  ink(g, 0.022); g.userData.fe = fe; return g;
}
const TOYS = 0.86, RAD = 0.3;
const toyRoot = new THREE.Group(); scene.add(toyRoot);
const toyM = makeToy(); toyM.scale.setScalar(TOYS); toyM.position.y = -0.27 * TOYS; toyRoot.add(toyM);
const toyShadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false})); toyShadow.rotation.x = -Math.PI / 2; scene.add(toyShadow);

// ---------- world building ----------
const tileTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#d8d2c4'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.fillStyle = `hsl(40,${10 + srnd(0, 8)}%,${76 + srnd(0, 8)}%)`; x.fillRect(c * 32 + 1, r * 32 + 1, 30, 30); } });
tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
const brickTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#e09a72'; x.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { x.fillStyle = `hsl(${18 + srnd(0, 8)},${50 + srnd(0, 10)}%,${60 + srnd(0, 8)}%)`; x.fillRect(c * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14); } });
brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
function addBox(g, mat, x0, x1, y0, y1, z0, z1, col, kind) {
  const m = new THREE.Mesh(BOX, mat); m.scale.set(x1 - x0, y1 - y0, z1 - z0); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  if (col !== false) boxes.push({b: [x0, x1, y0, y1, z0, z1], kind: kind || 'hard'});
  return m;
}
// ---------- physics (shared by the game, the aim preview and the solver) ----------
const G = 14, VMIN = 5, VMAX = 19.5;
function launchVel(ang, pow) { const gs = Math.sqrt(((LV && LV.g) || G) / G), v = VMIN * gs + pow * (VMAX - VMIN * gs), el = 1.2 - pow * 0.4, c = Math.cos(el), s = Math.sin(el); return new V3(Math.sin(ang) * c * v, s * v, -Math.cos(ang) * c * v); }
function newBody(p, v) { return {p: p.clone(), v: v.clone(), open: false, energy: 1.6, rest: 0, ground: false, done: '', t: 0, got: [false, false, false], bounces: 0}; }
const _c = new V3(), _n = new V3();
function stepBody(B, dt, wind, lv) {
  B.t += dt;
  if (B.autoOpen !== undefined && B.autoOpen >= 0 && B.v.y < B.autoOpen && B.energy > 0) B.open = true;
  const drag = B.open ? 2.6 : 0.1;
  if (B.open) { B.energy -= dt; if (B.energy <= 0) { B.energy = 0; B.open = false; } }
  B.v.x += (wind * (B.open ? 1.6 : 0.18) - B.v.x * drag * 0.6) * dt;
  B.v.z += (-B.v.z * drag * 0.6) * dt;
  B.v.y += (-((LV && LV.g) || G) - B.v.y * drag) * dt;
  B.p.addScaledVector(B.v, dt);
  B.ground = false; let hit = '';
  for (const o of lv.boxes) {
    const b = o.b; _c.set(clamp(B.p.x, b[0], b[1]), clamp(B.p.y, b[2], b[3]), clamp(B.p.z, b[4], b[5]));
    _n.subVectors(B.p, _c); const d = _n.length(); if (d >= RAD) continue;
    if (o.kind === 'slow') { const sl = B.slowed || (B.slowed = []); if (!sl.includes(o)) { sl.push(o); B.v.multiplyScalar(0.72); B.v.y = Math.min(B.v.y, 1.5); if (!hit) hit = 'cloth'; } continue; }
    if (d < 1e-5) _n.set(0, 1, 0); else _n.divideScalar(d);
    B.p.copy(_c).addScaledVector(_n, RAD);
    const vn = B.v.dot(_n);
    if (vn < 0) {
      const e = o.kind === 'bounce' ? 1.18 : o.kind === 'soft' ? 0.18 : 0.45;
      B.v.addScaledVector(_n, -(1 + e) * vn);
      if (o.kind === 'bounce' && _n.y > 0.5) { B.v.y = Math.max(B.v.y, 10.5); hit = 'bounce'; }
      else if (-vn > 2) hit = 'hit';
      const vt = B.v.clone().addScaledVector(_n, -B.v.dot(_n)); B.v.addScaledVector(vt, _n.y > 0.6 ? -0.08 : -0.03);
    }
    if (_n.y > 0.6) B.ground = true;
  }
  if (lv.actors) for (const c of lv.actors) {
    if (c.off) continue;
    _c.set(c.x, clamp(B.p.y, c.y0 + c.r, c.y0 + c.h - c.r), c.z); _n.subVectors(B.p, _c); const d = _n.length(); if (d >= RAD + c.r) continue;
    if (c.a && c.a.kind !== 'person' && c.a.kind !== 'kid') { if (!B.hitA) B.hitA = []; if (!B.hitA.includes(c.a)) { B.hitA.push(c.a); B.lastA = c.a; hit = 'actor'; if (c.a.kind !== 'pigeon') B.v.multiplyScalar(0.85); } continue; }
    if (d < 1e-5) _n.set(0, 1, 0); else _n.divideScalar(d);
    B.p.copy(_c).addScaledVector(_n, RAD + c.r); const vn = B.v.dot(_n);
    if (vn < 0) { B.v.addScaledVector(_n, -1.5 * vn); B.v.multiplyScalar(0.75); B.v.y = Math.max(B.v.y, 2.2); }
    if (!B.hitA) B.hitA = []; if (!B.hitA.includes(c.a)) { B.hitA.push(c.a); B.lastA = c.a; hit = 'actor'; }
  }
  // bucket: walls + rim + the inside
  const bk = lv.bucket, dx = B.p.x - bk.x, dz = B.p.z - bk.z, hd = Math.hypot(dx, dz);
  if (B.p.y < bk.rimY + RAD && B.p.y > bk.y - 0.2 && hd < bk.rOut + RAD) {
    const mid = (bk.rIn + bk.rOut) / 2;
    if (B.inB && B.p.y > bk.rimY + 0.05) B.inB = false;
    if (B.inB || (hd < bk.rIn - 0.05 && B.p.y < bk.rimY - 0.1)) { // inside: wall, floor, settle
      B.inB = true; const lim = 0.6 - RAD * 0.7;
      if (hd > lim) { const ux = dx / hd, uz = dz / hd; B.p.x = bk.x + ux * lim; B.p.z = bk.z + uz * lim; const vn = B.v.x * ux + B.v.z * uz; if (vn > 0) { B.v.x -= 1.4 * vn * ux; B.v.z -= 1.4 * vn * uz; } if (vn > 1.5) hit = 'rim'; }
      const fl = bk.y + 0.04 + RAD;
      if (B.p.y < fl) { B.p.y = fl; if (B.v.y < 0) { if (B.v.y < -2) hit = 'rim'; B.v.y = -B.v.y * 0.22; } B.v.x *= 0.86; B.v.z *= 0.86; B.inT = (B.inT || 0) + dt; if (B.inT > 0.3 && Math.abs(B.v.y) < 1.2) B.done = 'in'; }
    }
    else if (B.p.y > bk.rimY - 0.15) { // rim
      const ux = hd > 1e-4 ? dx / hd : 1, uz = hd > 1e-4 ? dz / hd : 0; _c.set(bk.x + ux * mid, bk.rimY, bk.z + uz * mid);
      _n.subVectors(B.p, _c); const d = _n.length(); if (d < RAD + 0.08) { _n.divideScalar(d || 1); B.p.copy(_c).addScaledVector(_n, RAD + 0.08); const vn = B.v.dot(_n); if (vn < 0) B.v.addScaledVector(_n, -1.4 * vn); hit = 'rim'; }
    } else if (hd >= mid) { const ux = dx / hd, uz = dz / hd, push = bk.rOut + RAD - hd; B.p.x += ux * push; B.p.z += uz * push; const vn = B.v.x * ux + B.v.z * uz; if (vn < 0) { B.v.x -= 1.4 * vn * ux; B.v.z -= 1.4 * vn * uz; } }
  }
  // stars
  for (let k = 0; k < lv.stars.length; k++) if (!B.got[k] && B.p.distanceTo(lv.stars[k]) < 0.75) B.got[k] = true;
  if (B.p.y < -6) B.done = 'out';
  const sp = B.v.length();
  if (B.inB) { /* settles in the bucket above */ } else if (B.ground && sp < 0.6) { B.rest += dt; B.v.multiplyScalar(0.9); if (B.rest > 0.45) B.done = B.done || 'rest'; } else B.rest = 0;
  if (B.t > 9) B.done = B.done || 'rest';
  return hit;
}
function lvPhys() { return {boxes, bucket, stars: stars.map((s) => s.p), actors: actorsPhys()}; }
// ---------- audio ----------
let AC = null;
function audio() { if (!SAVE.snd) return; if (AC) { if (AC.state !== 'running') AC.resume().catch(() => {}); return; } try { AC = new (window.AudioContext || window.webkitAudioContext)(); const b = AC.createBuffer(1, 1, 22050), s = AC.createBufferSource(); s.buffer = b; s.connect(AC.destination); s.start(0); } catch (e) {} }
function tone(f, d, type, vol, slide, delay) { if (!AC || !SAVE.snd) return; const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02); }
function noise(d, vol, f0, f1) { if (!AC || !SAVE.snd) return; const n = AC.sampleRate * d, b = AC.createBuffer(1, n, AC.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = AC.createBufferSource(); s.buffer = b; const fl = AC.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, AC.currentTime); fl.frequency.exponentialRampToValueAtTime(f1, AC.currentTime + d); const g = AC.createGain(); g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(AC.destination); s.start(); }
const SFX = {
  launch(p) { noise(0.35, 0.5, 600 + p * 800, 2400); tone(220, 0.12, 'triangle', 0.25, 120); },
  star(k) { tone(988 * Math.pow(1.26, k), 0.14, 'sine', 0.14); tone(1480 * Math.pow(1.26, k), 0.2, 'sine', 0.08, 0, 0.06); },
  bounce() { tone(180, 0.15, 'sine', 0.3, 420); },
  thud(v) { tone(110, 0.1, 'triangle', Math.min(0.3, v * 0.04), 60); },
  feather() { noise(0.4, 0.25, 1800, 700); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, 0, i * 0.09)); },
  fail() { tone(330, 0.3, 'triangle', 0.18, 160); },
  meow() { tone(620, 0.12, 'sawtooth', 0.06, 900); tone(900, 0.28, 'sawtooth', 0.05, 480, 0.11); },
  bark() { for (const d of [0, 0.18]) { tone(260, 0.09, 'square', 0.08, 150, d); } noise(0.12, 0.25, 900, 400); },
  hey() { const f = 180 + Math.random() * 120; tone(f, 0.1, 'triangle', 0.16, f * 1.4); tone(f * 1.3, 0.16, 'triangle', 0.12, f * 0.9, 0.09); },
  yay() { tone(520, 0.1, 'triangle', 0.12, 700); tone(700, 0.18, 'triangle', 0.12, 900, 0.1); },
  flap() { for (let k = 0; k < 4; k++) setTimeout(() => noise(0.08, 0.2, 1400, 600), k * 70); },
};
// haptics: Capacitor Haptics inside the iOS app, navigator.vibrate on Android browsers
const HAP = (() => { try { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Haptics; } catch (e) { return null; } })();
function buzz(ms) { if (SAVE.vib === 0) return; try { if (HAP) { const n = Array.isArray(ms) ? 30 : ms; if (Array.isArray(ms)) HAP.notification({type: 'SUCCESS'}); else HAP.impact({style: n >= 18 ? 'MEDIUM' : 'LIGHT'}); } else if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
let lastTick = 0; function tick() { if (SAVE.vib === 0) return; const t = performance.now(); if (t - lastTick < 70) return; lastTick = t; try { if (HAP) HAP.selectionChanged(); } catch (e) {} }

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
  } else if (o.style === 'wood' || o.style === 'board') { // horizontal boards (Ottoman houses / weatherboard)
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
  else if (th === 'turkiye') T = {road: themeTex('avrupa').road, pave: hqTex(512, 512, (x, W, H) => { // marble-ish slabs
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
  else T = {road: roadTex, pave: paveTex};
  return (THEME_TEX[th] = T);
}
const SKIES = {};
function themeSky(th) {
  if (SKIES[th]) return SKIES[th];
  const c = THEMES[th].sky;
  return (SKIES[th] = ctex(th === 'uzay' ? 512 : th === 'antarktika' || th === 'afrika' || th === 'avustralya' ? 256 : 4, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c[0]); g.addColorStop(0.55, c[1]); g.addColorStop(1, c[2]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (th === 'antarktika') { for (let i = 0; i < 3; i++) { const yy = h * (0.1 + i * 0.07); const g2 = x.createLinearGradient(0, yy - 30, 0, yy + 30); g2.addColorStop(0, 'rgba(90,255,180,0)'); g2.addColorStop(0.5, `rgba(${i ? '150,120,255' : '90,255,180'},.35)`); g2.addColorStop(1, 'rgba(90,255,180,0)'); x.fillStyle = g2; x.fillRect(0, yy - 30, w, 60); } }
    if (th === 'afrika' || th === 'avustralya') { const g3 = x.createRadialGradient(w * 0.7, h * 0.2, 4, w * 0.7, h * 0.2, h * 0.25); g3.addColorStop(0, 'rgba(255,250,220,.95)'); g3.addColorStop(0.3, 'rgba(255,220,150,.5)'); g3.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = g3; x.fillRect(0, 0, w, h); }
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
  if (th === 'sokak' || th === 'turkiye' || !THEMES[th]) return roofTex;
  if (ROOFS[th]) return ROOFS[th];
  let t;
  if (th === 'amerika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#5a5856'; x.fillRect(0, 0, W, H); grain(x, W, H, 9000, 0.05, 0.2, true); x.strokeStyle = 'rgba(20,20,20,.35)'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(srnd(0, W), srnd(0, H)); x.bezierCurveTo(srnd(0, W), srnd(0, H), srnd(0, W), srnd(0, H), srnd(0, W), srnd(0, H)); x.stroke(); } });
  else if (th === 'asya') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#1f4a3a'; x.fillRect(0, 0, W, H); for (let c = 0; c < 16; c++) { const g = x.createLinearGradient(c * 16, 0, c * 16 + 16, 0); g.addColorStop(0, '#2f6a4a'); g.addColorStop(0.5, '#4a8a5a'); g.addColorStop(1, '#1f4a3a'); x.fillStyle = g; x.fillRect(c * 16, 0, 15, H); } for (let r = 0; r < 8; r++) { x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, r * 32 + 30, W, 2); } });
  else if (th === 'avustralya') t = hqTex(256, 256, (x, W, H) => { for (let c = 0; c < 32; c++) { x.fillStyle = c % 2 ? '#c8ccd2' : '#9aa2ac'; x.fillRect(c * 8, 0, 8, H); } grain(x, W, H, 2000, 0.03, 0.08, true); });
  else if (th === 'afrika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#c8a050'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(110,70,20,.45)'; x.lineWidth = 1.5; for (let i = 0; i < 500; i++) { const xx = srnd(0, W), yy = srnd(0, H); x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + srnd(-3, 3), yy + srnd(8, 16)); x.stroke(); } });
  else if (th === 'antarktika') t = hqTex(256, 256, (x, W, H) => { x.fillStyle = '#f8fbfe'; x.fillRect(0, 0, W, H); grain(x, W, H, 3000, 0.02, 0.06, true); for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(150,190,230,.15)'; x.beginPath(); x.ellipse(srnd(0, W), srnd(0, H), srnd(20, 50), srnd(8, 20), 0, 0, 7); x.fill(); } });
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

// ================= WORLDS (v7): 9 worlds · 20 levels each =================
const WORLDS = [
  {id: 'sokak', name: 'SOKAK', sub: 'Mahalle', col: '#e22511', cost: 0, old: 0},
  {id: 'turkiye', name: 'TÜRKİYE', sub: 'Tarihi çarşı', col: '#c8102e', cost: 200},
  {id: 'amerika', name: 'AMERİKA', sub: 'Büyük şehir', col: '#1f6fd1', cost: 350, old: 20},
  {id: 'avrupa', name: 'AVRUPA', sub: 'Eski şehir', col: '#2f8a4a', cost: 500, old: 40},
  {id: 'asya', name: 'ASYA', sub: 'Fener sokağı', col: '#d83a5a', cost: 700},
  {id: 'avustralya', name: 'AVUSTRALYA', sub: 'Sahil kasabası', col: '#ff8a1a', cost: 900},
  {id: 'afrika', name: 'AFRİKA', sub: 'Savan köyü', col: '#b8641e', cost: 1100},
  {id: 'antarktika', name: 'ANTARKTİKA', sub: 'Buz üssü', col: '#3aa8d8', cost: 1400},
  {id: 'uzay', name: 'UZAY', sub: 'Ay üssü', col: '#4a3ab0', cost: 1800, old: 60},
];
const PER_WORLD = 20;
const THEMES = {
  sokak: {walls: null, shops: null, style: 'plaster', hMin: 4.2, hMax: 7.2, cars: [0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e, 0x7a4fb0], sky: ['#86cfe6', '#d6f0ee', '#fde2c6'], fog: 0xd6f0ee},
  amerika: {walls: [['#a8553a', '#1b1330', '#e22511'], ['#8a4a36', '#022753', '#1f6fd1'], ['#c8b8a0', '#3a3f4a', '#2fa84f'], ['#b8664a', '#022753', '#ffc20e'], ['#d8d0c0', '#1b1330', '#7a4fb0'], ['#9a5a44', '#1b1330', '#ff7a1a']],
    shops: ['BURGER BOB', 'TACO TOM', 'DINER DOLLY', 'DONUT DAN', 'PIZZA PETE', 'LAUNDRY LOU', 'HOT DOG HANK', 'SODA SAM', 'CANDY CINDY', 'BAGEL BEN', 'PANCAKE PAM', 'COMICS CARL', 'WAFFLE WALT', 'NACHO NICK'],
    style: 'brick', hMin: 8, hMax: 13, cars: [0xffc20e, 0xffc20e, 0xffc20e, 0x1f6fd1, 0xe22511, 0x1b1330], sky: ['#5fb0e8', '#cfe6f0', '#f8d8b0'], fog: 0xcfe6f0},
  avrupa: {walls: [['#efe2c4', '#2f5a3a', '#7a2a2a'], ['#e8d4b0', '#1f4f7a', '#022753'], ['#f2e8d8', '#7a2a2a', '#2f5a3a'], ['#d8c8a8', '#3a3f4a', '#8a3a1a'], ['#f4dcc8', '#2f6b4a', '#1b1330'], ['#e0e4e8', '#1f4f7a', '#7a2a2a']],
    shops: ['CAFÉ MON AMI', 'BOULANGERIE', 'PIZZERIA LUIGI', 'GELATO GINA', 'BIERHAUS HANS', 'PASTA PAOLO', 'CROISSANT CLUB', 'CHOCOLAT', 'TAPAS PEPE', 'FROMAGERIE', 'KONDITOREI', 'TRATTORIA', 'CRÊPE CHLOÉ', 'WAFFEL WIM'],
    style: 'stone', hMin: 5.2, hMax: 8.4, cars: [0x2f8a4a, 0xf4eee2, 0x7a2a2a, 0x1f6fd1, 0xffc20e], sky: ['#9ad0ec', '#e4f0f0', '#f4e4d0'], fog: 0xe4f0f0},
  turkiye: {walls: [['#f4e4c8', '#7a2a1a', '#c8102e'], ['#e8d0a8', '#5a3a22', '#c8102e'], ['#f8ecd8', '#2f5a3a', '#c8102e'], ['#d8b890', '#7a2a1a', '#022753'], ['#f0d8c8', '#5a3a22', '#2f8a4a']],
    shops: ['LOKUMCU LÜTFÜ', 'KÜNEFECİ KEMAL', 'ÇAYCI ÇETİN', 'BAKLAVACI BARIŞ', 'DONDURMACI DURSUN', 'HALICI HAMDİ', 'KOKOREÇÇİ KOKO', 'MIDYECİ MİDO', 'TESBİHÇİ TAHSİN', 'PİŞMANİYECİ PİŞO', 'KEBAPÇI KEREM', 'BOZACI BOZO', 'GÖZLEMECİ GÜLÜ', 'ŞALGAMCI ŞAHAP'],
    style: 'wood', hMin: 5, hMax: 8, cars: [0xc8102e, 0xffc20e, 0x1f6fd1, 0xf4eee2], sky: ['#7ec2e8', '#f0e4d0', '#ffc890'], fog: 0xf0e4d0},
  asya: {walls: [['#f4ead8', '#b8102e', '#b8102e'], ['#e8e0d0', '#1b1330', '#d83a5a'], ['#f8f0e0', '#2f6b4a', '#b8102e'], ['#d8d0c0', '#b8102e', '#1b1330'], ['#f0e0e4', '#1b1330', '#ffc20e']],
    shops: ['RAMEN REN', 'SUSHI SAKURA', 'DIM SUM DAN', 'BAO BAO', 'NOODLE NINA', 'MOCHI MIKO', 'TOFU TAO', 'PHO PHONG', 'KIMCHI KIM', 'BOBA BOBO', 'CURRY KUMAR', 'WOK WANG', 'TEMPURA TEO', 'MATCHA MEI'],
    style: 'asia', hMin: 5, hMax: 9, cars: [0xd83a5a, 0xf4f4f4, 0x2fa84f, 0xffc20e], sky: ['#8ab8e8', '#f4dce4', '#ffd0d8'], fog: 0xf4dce4},
  avustralya: {walls: [['#bfe4e8', '#f4f4f4', '#ff8a1a'], ['#f8e0a8', '#f4f4f4', '#1f6fd1'], ['#d8f0c8', '#f4f4f4', '#e22511'], ['#f8d0c0', '#f4f4f4', '#2f8a4a'], ['#e0e8f8', '#f4f4f4', '#ff8a1a']],
    shops: ['SURF SHACK', 'KOALA KAFE', 'BARBEKÜ BAZ', 'MEAT PIE MO', 'KANGA KIOSK', 'BUMERANG BOB', 'OUTBACK OLLIE', 'REEF RITA', 'FLAT WHITE FRED', 'BEACH BEV', 'G\'DAY GARY', 'CROCO CAFE'],
    style: 'board', hMin: 3.8, hMax: 6, cars: [0xff8a1a, 0x1f6fd1, 0xf4f4f4, 0x2fa84f], sky: ['#3ea0f0', '#bfe6f8', '#f8f0c8'], fog: 0xbfe6f8},
  afrika: {walls: [['#c8844a', '#5a3a22', '#e8a020'], ['#d89a5a', '#3a2a1a', '#2f8a4a'], ['#b8743a', '#5a3a22', '#c8102e'], ['#e0aa6a', '#3a2a1a', '#1f6fd1'], ['#c88a5a', '#5a3a22', '#ffc20e']],
    shops: ['SAFARİ SAM', 'BAOBAB BAR', 'JOLLOF JOE', 'MANGO MAMA', 'ZEBRA ZONE', 'KENTE KEMI', 'DAVUL DUMA', 'TAM TAM TAKI', 'ASLAN ALİ', 'KAKAO KOFI', 'HURMA HASAN', 'FIL FATU'],
    style: 'adobe', hMin: 3.4, hMax: 5.4, cars: [0xe8a020, 0x2f8a4a, 0xc8102e, 0xf4eee2], sky: ['#f0b060', '#f8d8a0', '#ffe8c0'], fog: 0xf8d8a0},
  antarktika: {walls: [['#e8f4fc', '#1f6fd1', '#e22511'], ['#d8ecf8', '#022753', '#ff8a1a'], ['#f4fafe', '#3aa8d8', '#e22511'], ['#c8e0f0', '#022753', '#ffc20e']],
    shops: ['İGLO İSO', 'BUZ BAR', 'PENGUEN PAŞA', 'KAR KAFE', 'FOK FIRIN', 'KUTUP KÜMES', 'AURORA ÇAY', 'KARTOPU KAMİL', 'SOĞUK SAMİ', 'BUZDAĞI BÜFE', 'FIRTINA FERDİ', 'KIZAK KIOSK'],
    style: 'ice', hMin: 3.6, hMax: 5.6, cars: [0xe22511, 0xff8a1a, 0xffc20e], sky: ['#6ab0e0', '#d8ecf8', '#f4fafe'], fog: 0xe4f2fa},
  uzay: {walls: [['#d8dce4', '#3a4a6a', '#1f6fd1'], ['#c8ccd6', '#2a2f3a', '#e22511'], ['#e8ecf2', '#4a5a7a', '#7a4fb0'], ['#b8c0cc', '#1b1330', '#ff7a1a']],
    shops: ['AY MARKET', 'ROKET YAKIT', 'UZAY BÜFE', 'KRATER KAFE', 'YILDIZ TOZU', 'METEOR ÇAY', 'ORBİT TAMİR', 'GALAKSİ PİDE', 'KUYRUKLU DÖNER', 'NEBULA BERBER'],
    style: 'metal', hMin: 3.6, hMax: 6.2, g: 8.5, cars: [0xf4f4f4, 0xe8ecf2, 0xff7a1a], sky: ['#03040c', '#0b0f2e', '#1b1f45'], fog: 0x0b0f2e, stars: 1},
};
let CUR_THEME = 'sokak';
function themeOf(i) { return WORLDS[Math.floor(i / PER_WORLD)].id; }

// ---- generated levels for Amerika, Avrupa, Uzay ----
function lrng(s) { let a = s >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
// pars = shots the test bot needed (v6)
const GEN_PARS = {turkiye: [2,  2,  2,  2,  3,  4,  5,  4,  5,  5,  6,  7,  7,  8,  7,  7,  7,  7,  7,  8], asya: [2,  2,  2,  2,  5,  4,  4,  4,  4,  4,  5,  6,  7,  9,  6,  7,  7,  9,  7,  7], avustralya: [2,  2,  3,  2,  5,  5,  4,  4,  5,  6,  4,  6,  7,  6,  6,  7,  7,  7,  8,  8], afrika: [3,  2,  2,  2,  4,  5,  5,  4,  4,  6,  4,  6,  6,  8,  6,  7,  8,  7,  7,  6], antarktika: [2,  2,  2,  2,  4,  4,  4,  4,  5,  4,  5,  7,  7,  6,  7,  9,  7,  8,  8,  8], amerika: [2, 2, 2, 2, 4, 4, 5, 4, 5, 4, 5, 8, 9, 6, 7, 6, 7, 7, 7, 7], avrupa: [2, 2, 2, 2, 5, 4, 5, 4, 4, 5, 5, 7, 7, 8, 7, 6, 6, 7, 7, 7], uzay: [2, 2, 3, 2, 4, 4, 5, 4, 5, 4, 4, 6, 7, 8, 6, 8, 7, 6, 6, 7]};
function genLevel(theme, k) {
  const R = lrng(7919 * (k + 1) + theme.length * 131 + theme.charCodeAt(1) * 17), rr = (a, b) => a + R() * (b - a), ri = (a, b) => Math.floor(rr(a, b + 1));
  const SC = theme === 'uzay' ? 1.45 : 1, TH = THEMES[theme];
  const names = {
    turkiye: ['Simitçi Köşesi', 'Çay Ocağı', 'Kapalı Çarşı', 'Lokum Yolu', 'Tramvay Durağı', 'Cumbalı Evler', 'Galata Yokuşu', 'Baklava Köprüsü', 'Bozacı Sokağı', 'Halı Pazarı', 'Rüzgârlı İskele', 'Kız Kulesi Manzarası', 'Kebap Kavşağı', 'Martı Köprüsü', 'Eski Hamam', 'Bayrak Sokak', 'Fener Yolu', 'Lale Bahçesi', 'Boğaz Rüzgârı', 'Türkiye Finali'],
    asya: ['Fener Sokağı', 'Ramen Köşesi', 'Kiraz Çiçeği', 'Pagoda Yolu', 'Bambu Bahçesi', 'Gece Pazarı', 'Ejderha Kapısı', 'Çay Evi', 'Fener Köprüsü', 'Pirinç Tarlası', 'Rüzgârlı Tapınak', 'Neon Ara Sokak', 'Bonsai Bahçesi', 'Panda Yolu', 'Kâğıt Fener', 'Samuray Köprüsü', 'Tapınak Merdiveni', 'Uçurtma Şenliği', 'Ejderha Rüzgârı', 'Asya Finali'],
    avustralya: ['Sahil Yolu', 'Sörf Kulübesi', 'Kanguru Geçidi', 'Koala Ağacı', 'Barbekü Parkı', 'Mercan Köşesi', 'Okyanus Köprüsü', 'Bumerang Yolu', 'Çöl Kasabası', 'Deniz Feneri', 'Rüzgârlı Plaj', 'Timsah Köprüsü', 'Palmiyeli Cadde', 'Liman Kafe', 'Kızıl Çöl', 'Dalga Kıran', 'Okaliptüs Yolu', 'Gün Batımı Plajı', 'Fırtınalı Sahil', 'Avustralya Finali'],
    afrika: ['Savan Yolu', 'Baobab Ağacı', 'Pazar Günü', 'Zürafa Geçidi', 'Davul Meydanı', 'Kerpiç Evler', 'Nehir Köprüsü', 'Mango Bahçesi', 'Piramit Manzarası', 'Kum Fırtınası', 'Rüzgârlı Vaha', 'Fil Yolu', 'Aslan Tepesi', 'Akasya Gölgesi', 'Çöl Kervanı', 'Kente Çarşısı', 'Şelale Yolu', 'Gün Batımı Savanı', 'Sıcak Rüzgâr', 'Afrika Finali'],
    antarktika: ['İlk Kar', 'Penguen Yolu', 'Buz Köprüsü', 'İgloo Köyü', 'Kardan Adam', 'Buzdağı', 'Araştırma Üssü', 'Kayan Yol', 'Kutup Işığı', 'Fok Burnu', 'Kar Fırtınası', 'Buz Mağarası', 'Kızak Yolu', 'Penguen Kolonisi', 'Donmuş Göl', 'Aurora Gecesi', 'Buz Kalesi', 'Soğuk Rüzgâr', 'Beyaz Çöl', 'Antarktika Finali'],
    amerika: ['Taksi Durağı', 'Hot Dog Köşesi', 'Gökdelen Altı', 'Sarı Taksiler', 'Broadway Kavşağı', 'Merkez Park', 'Yangın Merdiveni', 'Donut Caddesi', 'Çatı Bahçesi', 'Büyük Kavşak', 'Rüzgârlı Bulvar', 'Metro Çıkışı', 'Neon Sokak', 'Liman Yolu', 'Köprü Altı', 'Gece Treni', 'Zikzak Bloklar', 'Yokuş Şehir', 'Trafik Kaosu', 'Şehir Finali'],
    avrupa: ['Kafe Önü', 'Taş Sokak', 'Kanal Köprüsü', 'Çiçekli Balkon', 'Fırın Kokusu', 'Saat Kulesi', 'Meydan', 'Dar Pasaj', 'Merdivenli Mahalle', 'Kanal Turu', 'Rüzgârlı Rıhtım', 'Eski Çarşı', 'Kilise Yolu', 'Çifte Köprü', 'Tepe Kafe', 'Labirent', 'Yağmurlu Cadde', 'Kale Yokuşu', 'Gondol Yolu', 'Avrupa Finali'],
    uzay: ['İlk Adım', 'Krater Atlayışı', 'Düşük Yerçekimi', 'Ay Üssü', 'Roket Rampası', 'Yıldız Yolu', 'Kubbe Şehir', 'Göktaşı Kuşağı', 'Uzay Pazarı', 'Yörünge', 'Asteroit Köprüsü', 'Karanlık Taraf', 'Uydu Bahçesi', 'Meteor Yağmuru', 'Kraterler Arası', 'Uzaylı Mahallesi', 'Yerçekimsiz Zikzak', 'Güneş Paneli', 'Galaksi Kavşağı', 'Uzay Finali'],
  }[theme];
  const turns = k < 6 ? 0 : k < 15 ? 1 : 2, feats = Math.min(3, 1 + Math.floor(k / 5)), wind = theme !== 'uzay' && (k % 5 === 3 || k >= 16 && k % 2) ? (R() > 0.5 ? 1 : -1) * rr(1.2, 2.4) : 0;
  const def = {name: names[k], theme, par: GEN_PARS[theme][k], wind, start: [0, 3], route: [[0, 3]], g: TH.g};
  def.build = (L) => {
    let cx = 0, z = 6, top = 0, dir = R() > 0.5 ? 1 : -1; let first = true; const pts = [[0, 3]];
    const run = (len, last) => { // a z-street run with features, returns nothing; moves z
      let left = len * SC;
      const chunks = []; let f = last ? feats : Math.max(0, feats - 1);
      while (left > 0) {
        const FK = ['bridge', 'stairs', 'plaza', 'canal', 'plaza', 'canal'], kind = !first && f > 0 && left > 12 && R() < 0.6 ? FK[Math.floor(R() * FK.length)] : 'street'; first = false;
        if (kind !== 'street') f--;
        const l = kind === 'street' ? Math.min(left, rr(8, 13) * SC) : kind === 'bridge' ? rr(6, 8.5) * (theme === 'uzay' ? 1.15 : 1) : kind === 'canal' ? rr(5.5, 7) * (theme === 'uzay' ? 1.15 : 1) : 12;
        chunks.push([kind, l]); left -= l;
      }
      chunks.forEach(([kind, l], ci) => {
        const zA = z, zB = z - l, endHere = last && ci === chunks.length - 1;
        if (kind === 'street') {
          stZ(L, cx, zA, zB, {top, end: endHere ? 1 : 0, endH: 2.6, lamps: theme !== 'uzay' || R() > 0.5});
          const n = Math.floor(l / 7);
          for (let q = 0; q < n; q++) {
            const pz = zA - 3 - q * 7 - rr(0, 3); if (pz > 0 && cx === 0) continue; if (endHere && pz < zB + 5) continue;
            const t = R();
            if (t < 0.3 + k * 0.012) L.props.push({t: 'line', x0: cx - 3.4, x1: cx + 3.4, z: pz, h: rr(2.8, 3.7)});
            else if (t < 0.6) L.props.push({t: 'car', x: cx + (R() > 0.5 ? 1.1 : -1.1), z: pz, col: TH.cars[ri(0, TH.cars.length - 1)], ax: 'z'});
            else if (t < 0.72) L.props.push({t: 'kiosk', x: cx + (R() > 0.5 ? 1.0 : -1.0), z: pz});
            else if (t < 0.85 && theme !== 'uzay') L.props.push({t: 'tree', x: cx + (R() > 0.5 ? 2.6 : -2.6), z: pz});
            else if (k > 6) L.props.push({t: 'stall', x: cx + (R() > 0.5 ? 0.9 : -0.9), z: pz, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a', '#ffc20e'])});
            if (R() < 0.6) L.actors.push(walker(cx + (R() > 0.5 ? 2.4 : -2.4), pz + 2, cx + (R() > 0.5 ? 2.4 : -2.4), pz - 4, {sp: rr(0.6, 1.0), col: pick([0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e, 0x7a4fb0, 0xff8fb8, 0xff7a1a])}));
            else if (R() < 0.5) L.actors.push({t: 'cat', x: cx + (R() > 0.5 ? 2.4 : -2.4), z: pz - 1, sit: R() > 0.4 ? 1 : 0, path: [cx + 2.4, pz, cx + 2.4, pz - 5], sp: 0.7});
            else if (theme !== 'uzay') L.actors.push({t: 'pigeons', x: cx + rr(-1, 1), z: pz - 2, n: ri(3, 5)});
            else L.actors.push({t: 'dog', x: cx - 2.4, z: pz, path: [cx - 2.4, pz, cx - 2.4, pz - 6], sp: 1.1});
          }
        } else if (kind === 'bridge') {
          L.islands.push({x: cx, z: (zA + zB) / 2, w: rr(1.4, 1.9), d: l, top: top + 0.22, kind: 'bridge'});
          if (R() < 0.6 && theme !== 'uzay') L.actors.push({t: 'pigeons', x: cx, z: (zA + zB) / 2, n: 3});
        } else if (kind === 'plaza') { // an open square with a monument in the middle
          const mid = (zA + zB) / 2; plaza(L, cx, mid, 11.2, l, top + 0.22);
          L.props.push(lot({}, cx - 7.8, cx - 5.6, zB, zA, '+x', top + 0.22), lot({}, cx + 5.6, cx + 7.8, zB, zA, '-x', top + 0.22), {t: 'monu', x: cx + (R() > 0.5 ? 1 : -1) * rr(0, 1.2), z: mid, base: top + 0.22});
          L.actors.push(walker(cx - 4, mid + 3, cx + 4, mid + 3, {sp: 0.8, col: pick([0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e])}));
          if (R() < 0.5) L.actors.push({t: 'cat', x: cx - 3.5, z: mid - 3, sit: 1});
        } else if (kind === 'canal') { // water across the street: two narrow bridges
          for (const sx of [-1.55, 1.55]) L.islands.push({x: cx + sx, z: (zA + zB) / 2, w: 1.3, d: l, top: top + 0.22, kind: 'bridge'});
          L.props.push({t: 'water', x: cx, z: (zA + zB) / 2, w: 11.2, d: l, y: top - 0.9}, lot({}, cx - 5.6, cx - 3.4, zB, zA, '+x', top + 0.22), lot({}, cx + 3.4, cx + 5.6, zB, zA, '-x', top + 0.22));
        } else { // stairs: two steps up, street continues higher
          const s1 = top + 1.0, s2 = top + 2.0; plaza(L, cx, zA - 3, 6.8, 6, s1); plaza(L, cx, zA - 9, 6.8, 6, s2);
          L.props.push(lot({h: 3.2 + s1}, cx - 5.6, cx - 3.4, zA - 6, zA, '+x', top + 0.22), lot({h: 3.2 + s1}, cx + 3.4, cx + 5.6, zA - 6, zA, '-x', top + 0.22),
            lot({h: 3.2 + s2}, cx - 5.6, cx - 3.4, zB, zA - 6, '+x', top + 0.22), lot({h: 3.2 + s2}, cx + 3.4, cx + 5.6, zB, zA - 6, '-x', top + 0.22));
          if (R() < 0.6) L.props.push({t: 'plant', x: cx + (R() > 0.5 ? 2 : -2), z: zA - 8});
          top = s2 - 0.2;
        }
        z = zB;
      });
    };
    for (let t = 0; t < turns; t++) {
      run(turns > 1 ? rr(6, 9) : rr(10, 16), false); // to the junction
      const j1 = z - 8, zT = j1 - 3.4, len = (turns > 1 ? rr(9, 12) : rr(12, 17)) * SC, cx2 = cx + dir * len;
      stZ(L, cx, z, j1, {top, [dir > 0 ? 'gapR' : 'gapL']: [[j1 + 2.2, j1]]});
      const tb = top + 0.22;
      if (dir > 0) { stX(L, zT, cx - 3.4, cx2 + 3.4, {top, gapN: [[cx - 3.4, cx + 3.4]], gapF: [[cx2 - 3.4, cx2 + 3.4]]}); L.props.push(lot({h: 6}, cx - 5.6, cx - 3.4, zT - 3.4, zT + 3.4, '+x', tb), lot({h: 6}, cx2 + 3.4, cx2 + 5.6, zT - 3.4, zT + 5.6, '-x', tb)); }
      else { stX(L, zT, cx2 - 3.4, cx + 3.4, {top, gapN: [[cx - 3.4, cx + 3.4]], gapF: [[cx2 - 3.4, cx2 + 3.4]]}); L.props.push(lot({h: 6}, cx + 3.4, cx + 5.6, zT - 3.4, zT + 3.4, '-x', tb), lot({h: 6}, cx2 - 5.6, cx2 - 3.4, zT - 3.4, zT + 5.6, '+x', tb)); }
      const mx = (cx + cx2) / 2; if (R() < 0.7) L.props.push({t: 'car', x: mx + rr(-3, 3), z: zT + (R() > 0.5 ? 1.1 : -1.1), col: TH.cars[ri(0, TH.cars.length - 1)], ax: 'x'});
      if (k > 8 && R() < 0.6) L.props.push({t: 'stall', x: mx + rr(-4, 4), z: zT + (R() > 0.5 ? 0.9 : -0.9), col: pick(['#e22511', '#ffc20e', '#2fa84f']), ax: 'x'});
      L.actors.push(walker(mx - 4, zT + 2.5, mx + 4, zT + 2.5, {sp: 0.9, col: pick([0xe22511, 0x1f6fd1, 0x7a4fb0])}));
      pts.push([cx, zT], [cx2, zT]); cx = cx2; z = zT - 3.4; dir = -dir;
    }
    run(turns > 1 ? rr(10, 14) : turns ? rr(16, 24) + k * 0.3 : rr(30, 40) + k * 1.2, true);
    const bz = z + (theme === 'uzay' && k === 2 ? 8 : 4.5), bx = cx + rr(-0.9, 0.9); def.bucket[0] = bx; def.bucket[1] = bz; pts.push([bx, bz]);
    L.route = pts; def.route = pts;
    // golden feathers along the route
    const segs = []; let tot = 0; for (let q = 0; q < pts.length - 1; q++) { const d = Math.hypot(pts[q + 1][0] - pts[q][0], pts[q + 1][1] - pts[q][1]); segs.push(d); tot += d; }
    for (const u of [0.3, 0.55, 0.8]) { let d = u * tot, q = 0; while (q < segs.length - 1 && d > segs[q]) { d -= segs[q]; q++; } const a = pts[q], b = pts[q + 1], f = d / segs[q], px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f; L.feathers.push([px, 3.8 + rr(0, 0.8) + (L.islands.find((I) => Math.abs(px - I.x) <= I.w / 2 && Math.abs(pz - I.z) <= I.d / 2) || {top: 0}).top, pz]); }
  };
  def.bucket = [0, 0];
  const W = WORLDS.find((q) => q.id === theme), wi = WORLDS.indexOf(W); def.seedI = W.old !== undefined ? W.old + k : 200 + wi * PER_WORLD + k;
  return def;
}

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
function decoProp8(D, g) { const sg = new THREE.Group(); sg.position.set(D.x, D.top, D.z); sg.scale.setScalar(1.15); g.add(sg); decoProp({...D, x: 0, z: 0, top: 0}, sg); }

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

// ================= LEVELS (golf style: several shots, par) =================
// Streets are built from pieces. stZ = a street running along z (forward = -z), stX = along x.
// Each adds road + two pavements (islands) and a row of shop buildings on both sides facing the street.
const SHOPS = ['TOSUN MARKET', 'BAKKAL BÜLENT', 'FÖNCÜ FERDİ', 'SİMİT SARAYI', 'DEMLİK ÇAY EVİ', 'KÖFTECİ KAMİL', 'KUAFÖR KAFA', 'NALBUR NURİ', 'ŞIPSAK FOTO', 'BÖREKÇİ BEDRİ', 'MANAV MUAMMER', 'BERBER BAYRAM', 'ECZANE ŞİFA', 'KASAP KADİR', 'TERZİ TEYZE', 'PİDECİ PAŞA', 'DÖNERCİ DOYUR', 'TOMBİK BÜFE', 'ŞEKERCİ ŞÜKRÜ', 'TATLICI TOMBUL', 'MİSKET OYUNCAK', 'GEVREK FIRIN', 'ÇIRAK ELEKTRİK', 'PAŞA LOKANTA'];
const WALLS = [['#f2d8b0', '#2fa84f', '#e22511'], ['#cfe3e8', '#1f6fd1', '#022753'], ['#f4c7b8', '#7a4fb0', '#2fa84f'], ['#e8d0e8', '#022753', '#7a4fb0'], ['#f7e6a8', '#e22511', '#e22511'], ['#d6e8d0', '#2fa84f', '#022753'], ['#f0dcc8', '#b8402a', '#1f6fd1'], ['#dfe0ea', '#e22511', '#ff7a1a']];
const GOODS = [['#e8b060', '#c98a3a', '#f4d090'], ['#e22511', '#ffc20e', '#2fa84f'], ['#1f6fd1', '#f4eee2'], ['#e22511', '#2fa84f', '#ff7a1a'], ['#f4eee2', '#2fa84f'], ['#b8402a', '#f4eee2']];
function lot(o, x0, x1, z0, z1, face, top) { const TH = THEMES[CUR_THEME] || THEMES.sokak, w = pick(TH.walls || WALLS); return {t: 'bld', style: TH.style, x0, x1, z0, z1, face, base: top, h: o.h ? o.h : srnd(TH.hMin, TH.hMax), col: w[0], shut: w[1], sign: w[2], shop: pick(TH.shops || SHOPS), door: srnd(0, 1) > 0.5 ? 'l' : 'r', goods: pick(GOODS), chim: srnd(0, 1) > 0.6}; }
const inGap = (gaps, a, b) => (gaps || []).some(([g0, g1]) => Math.max(a, b) > Math.min(g0, g1) && Math.min(a, b) < Math.max(g0, g1));
function stZ(L, cx, zA, zB, o = {}) { // zA near (bigger), zB far
  const top = o.top || 0, mid = (zA + zB) / 2, len = zA - zB;
  L.islands.push({x: cx, z: mid, w: 3.2, d: len, top, kind: 'road', ax: 'z'}, {x: cx - 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'}, {x: cx + 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'});
  for (const side of [-1, 1]) {
    if (o['no' + (side < 0 ? 'L' : 'R')]) continue;
    let z = zA; while (z > zB + 0.5) { const l = Math.min(z - zB, srnd(3.2, 4.6)); if (!inGap(o['gap' + (side < 0 ? 'L' : 'R')], z, z - l)) L.props.push(lot(o, side < 0 ? cx - 5.6 : cx + 3.4, side < 0 ? cx - 3.4 : cx + 5.6, z - l, z, side < 0 ? '+x' : '-x', top + 0.22)); z -= l; }
  }
  if (o.end) L.props.push(lot(o.endH ? {h: o.endH} : o, cx - 5.6, cx + 5.6, zB - 2.4, zB, '+z', top + 0.22));
  if (o.lamps !== false) for (let z = zA - 3; z > zB + 1; z -= 8) L.props.push({t: 'lamp', x: cx + ((Math.round(z) & 8) ? -2.9 : 2.9), z});
}
function stX(L, cz, xA, xB, o = {}) { // xA start, xB end (xB > xA)
  const top = o.top || 0, mid = (xA + xB) / 2, len = xB - xA;
  L.islands.push({x: mid, z: cz, w: len, d: 3.2, top, kind: 'road', ax: 'x'}, {x: mid, z: cz + 2.5, w: len, d: 1.8, top: top + 0.22, kind: 'walk'}, {x: mid, z: cz - 2.5, w: len, d: 1.8, top: top + 0.22, kind: 'walk'});
  for (const side of [-1, 1]) {
    if (o['no' + (side < 0 ? 'F' : 'N')]) continue;
    let x = xA; while (x < xB - 0.5) { const l = Math.min(xB - x, srnd(3.2, 4.6)); if (!inGap(o['gap' + (side < 0 ? 'F' : 'N')], x, x + l)) L.props.push(lot(o, x, x + l, side < 0 ? cz - 5.6 : cz + 3.4, side < 0 ? cz - 3.4 : cz + 5.6, side < 0 ? '+z' : '-z', top + 0.22)); x += l; }
  }
  if (o.end) L.props.push(lot(o, xB, xB + 2.4, cz - 5.6, cz + 5.6, '-x', top + 0.22));
  if (o.lamps !== false) for (let x = xA + 3; x < xB - 1; x += 8) L.props.push({t: 'lamp', x, z: cz + ((Math.round(x) & 8) ? -2.9 : 2.9)});
}
function plaza(L, x, z, w, d, top) { L.islands.push({x, z, w, d, top, kind: 'walk'}); }
function fairLevel(L) {
  const isl = (x, z) => L.islands.find((I) => Math.abs(x - I.x) <= I.w / 2 && Math.abs(z - I.z) <= I.d / 2);
  const lotD = (P, x, z) => Math.hypot(Math.max(P.x0 - x, 0, x - P.x1), Math.max(P.z0 - z, 0, z - P.z1));
  const near = (x, z) => { let d = 99; for (const P of L.props) if (P.t === 'bld') d = Math.min(d, lotD(P, x, z)); return d; };
  const B = L.bucket;
  if (B[2] === undefined && near(B[0], B[1]) < 1.8) { // bucket touching a building: slide it back along the route
    const I0 = isl(B[0], B[1]), top0 = I0 ? I0.top : 0, pr = L.route && L.route.length > 1 ? L.route[L.route.length - 2] : L.start;
    const dx = pr[0] - B[0], dz = pr[1] - B[1], dl = Math.hypot(dx, dz) || 1; let ok = null;
    for (let s = 0.2; s <= 8 && !ok; s += 0.2) for (const side of [0, 0.6, -0.6, 1.2, -1.2]) { const x = B[0] + dx / dl * s - dz / dl * side, z = B[1] + dz / dl * s + dx / dl * side, I = isl(x, z); if (I && Math.abs(I.top - top0) < 0.05 && near(x, z) >= 1.8 && Math.abs(x - I.x) <= I.w / 2 - 0.9 + (I.kind === 'road' ? 9 : 0)) { ok = [x, z]; break; } }
    if (ok) { B[0] = ok[0]; B[1] = ok[1]; if (L.route && L.route.length) L.route[L.route.length - 1] = [ok[0], ok[1]]; }
  }
  const pts = [[B[0], B[1], 2.4], [L.start[0], L.start[1], 1.6]];
  L.props = L.props.filter((P) => {
    if (P.t === 'line') { const a = Math.min(P.x0, P.x1), b = Math.max(P.x0, P.x1); return !pts.some(([x, z], k) => Math.abs(P.z - z) < (k ? 1.8 : 3.0) && x > a - 0.6 && x < b + 0.6); }
    if (P.x === undefined || P.z === undefined) return true;
    if (['car', 'kiosk', 'stall', 'tree', 'plant', 'bench', 'bin', 'monu', 'lamp', 'hydrant', 'sign'].includes(P.t)) return !pts.some(([x, z, r]) => Math.hypot(P.x - x, P.z - z) < r + (P.t === 'monu' ? 1.4 : P.t === 'car' ? 0.9 : 0));
    return true;
  });
  if (L.actors) L.actors = L.actors.filter((A) => A.t !== 'pigeons' || A.x === undefined || Math.hypot(A.x - B[0], A.z - B[1]) > 1.6);
}
function mkLevel(i, def) { seed = 101 + (def.seedI !== undefined ? def.seedI : i) * 13; CUR_THEME = def.theme || 'sokak'; const L = {islands: [], props: [], actors: [], feathers: [], wind: 0, ...def}; def.build(L); fairLevel(L); L.deco = genDeco(L, CUR_THEME); return L; }
const walker = (x, z, x1, z1, o = {}) => ({t: 'person', x, z, path: [x, z, x1, z1], sp: o.sp || 0.85, ...o});
const LEVELS = [
  mkLevel(0, {name: 'İlk Atış', tut: 1, par: 2, start: [0, 2], bucket: [0.6, -19], route: [[0, 2], [0.6, -19]],
    build(L) { stZ(L, 0, 5, -22, {end: 1});
      L.props.push({t: 'bench', x: 2.6, z: -6}, {t: 'tree', x: -2.6, z: -9}, {t: 'bin', x: 2.8, z: -14});
      L.actors.push(walker(-2.4, -2, -2.4, -16, {sp: 0.7, col: 0xe22511}), {t: 'cat', x: 2.5, z: -10.5, sit: 1, face: -1.2}, {t: 'pigeons', x: -0.8, z: -8, n: 4});
      L.feathers.push([0, 3.2, -6], [0.4, 3.0, -13]); }}),
  mkLevel(1, {name: 'Süzül', tut: 2, par: 3, start: [0, 2], bucket: [0, -26.5], route: [[0, 2], [0, -26.5]],
    build(L) { stZ(L, 0, 5, -9, {}); plaza(L, 0, -16, 5, 3.6, 0.22); stZ(L, 0, -23, -30, {end: 1});
      L.props.push({t: 'plant', x: -2.0, z: -14.9}, {t: 'plant', x: 2.0, z: -17.1}, {t: 'bench', x: 2.6, z: -4});
      L.actors.push(walker(2.4, 0, 2.4, -8, {sp: 0.6, col: 0x1f6fd1, hat: 0xffc20e}), {t: 'cat', x: 1.6, z: -16.8, sit: 1}, {t: 'kid', x: -2.4, z: -24, path: [-2.4, -24, -2.4, -29], sp: 0.7});
      L.feathers.push([0, 3.5, -12.5], [0, 3.0, -20]); }}),
  mkLevel(2, {name: 'Uzun Cadde', par: 3, start: [0, 3], bucket: [-0.8, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -47, {end: 1});
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -9, h: 3.6}, {t: 'car', x: 1.1, z: -16, col: 0x1f6fd1, ax: 'z'}, {t: 'tree', x: -2.6, z: -21}, {t: 'line', x0: -3.4, x1: 3.4, z: -28, h: 3.0},
        {t: 'car', x: -1.1, z: -33, col: 0xffc20e, ax: 'z'}, {t: 'kiosk', x: 1.0, z: -39.5}, {t: 'zebra', x: 0, z: -24, ax: 'z'}, {t: 'bench', x: -2.6, z: -12});
      L.actors.push(walker(-2.4, -2, -2.4, -30, {col: 0x2fa84f}), walker(2.4, -36, 2.4, -6, {sp: 0.9, skirt: 1, long: 1, col: 0x7a4fb0, bag: 0xffc20e}), walker(-1.6, -24, 1.6, -24, {sp: 0.8, col: 0xff7a1a}),
        {t: 'cat', x: 1.1, z: -16, y: 1.5, sit: 1}, {t: 'dog', x: 2.4, z: -20, path: [2.4, -20, 2.4, -42], sp: 1.2}, {t: 'pigeons', x: 0, z: -42, n: 5}, {t: 'kid', x: -2.4, z: -38, path: [-2.4, -38, -2.4, -45], sp: 0.8});
      L.feathers.push([0, 4.5, -9], [-1.1, 3.2, -33], [0.6, 3.6, -24]); }}),
  mkLevel(3, {name: 'Köşe Başı', par: 3, start: [0, 3], bucket: [22, -26], route: [[0, 3], [0, -24.5], [22, -26]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 26, {end: 1, gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22));
      L.props.push({t: 'car', x: -1.1, z: -10, col: 0xe22511, ax: 'z'}, {t: 'tree', x: 2.6, z: -17}, {t: 'zebra', x: 9, z: -24.4, ax: 'x'}, {t: 'kiosk', x: 15, z: -27.3}, {t: 'car', x: 18, z: -23.3, col: 0x2fa84f, ax: 'x'}, {t: 'bench', x: 6, z: -21.6});
      L.actors.push(walker(2.4, -2, 2.4, -13, {col: 0xe22511}), {t: 'cat', x: -2.4, z: -17, path: [-2.4, -6, -2.4, -20], sp: 0.7, col: 0xf0912e}, walker(4, -21.8, 20, -21.8, {sp: 0.9, col: 0x1f6fd1, hat: 0x022753}),
        walker(9, -26.9, 9, -21.9, {sp: 0.8, col: 0xffc20e, long: 1, skirt: 1}), {t: 'pigeons', x: 12, z: -26.5, n: 5}, {t: 'dog', x: 20, z: -27, path: [12, -27, 24, -27], sp: 1.3});
      L.feathers.push([0, 3.6, -12], [2.5, 3.4, -24.4], [12, 3.2, -24.4]); }}),
  mkLevel(4, {name: 'Merdivenli Yokuş', par: 3, start: [0, 3], bucket: [0, -38], route: [[0, 3], [0, -38]],
    build(L) { stZ(L, 0, 6, -6, {top: 0}); plaza(L, 0, -9, 6.8, 6, 1.0); plaza(L, 0, -16.5, 6.8, 9, 2.0); plaza(L, 0, -25, 6.8, 8, 3.0); stZ(L, 0, -29, -42, {top: 3.8, end: 1});
      for (const [z0, z1, t] of [[-6, -12, 1.22], [-12, -21, 2.22], [-21, -29, 3.22]]) { L.props.push(lot({h: 4 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 4 + t}, 3.4, 5.6, z1, z0, '-x', 0.22)); }
      L.props.push({t: 'tree', x: -2.4, z: -16}, {t: 'tree', x: 2.4, z: -25}, {t: 'bench', x: 0, z: -18}, {t: 'kiosk', x: 1.2, z: -33});
      L.actors.push({t: 'cat', x: 0.5, z: -9, sit: 1, col: 0x2a2a2e}, {t: 'cat', x: -2, z: -16, path: [-2, -13, -2, -20], sp: 0.6}, walker(2.0, -22, -2, -27, {sp: 0.6, col: 0x2fa84f}), {t: 'pigeons', x: -1, z: -25, n: 5},
        walker(-2.4, -31, -2.4, -40, {col: 0xe22511, hat: 0xf4eee2}), {t: 'person', x: 0, z: -18, sit: 1, face: 0, col: 0x3a3f4a});
      L.feathers.push([0, 4.4, -9], [0, 5.6, -21], [-1, 7.2, -30]); }}),
  mkLevel(5, {name: 'Köprü', par: 4, start: [0, 3], bucket: [0.5, -40], route: [[0, 3], [0, -40]],
    build(L) { stZ(L, 0, 6, -14, {}); L.islands.push({x: 0, z: -19.5, w: 1.6, d: 11, top: 0.22, kind: 'bridge'}); stZ(L, 0, -25, -44, {end: 1});
      L.props.push({t: 'car', x: 1.1, z: -6, col: 0x7a4fb0, ax: 'z'}, {t: 'tree', x: -2.6, z: -10}, {t: 'kiosk', x: -1, z: -30}, {t: 'line', x0: -3.4, x1: 3.4, z: -35, h: 3.2});
      L.actors.push(walker(2.4, 0, 2.4, -12, {col: 0xff8fb8, long: 1}), {t: 'pigeons', x: 0, z: -19.5, n: 3}, {t: 'cat', x: -2.4, z: -28, sit: 1},
        {t: 'dog', x: 2.4, z: -27, path: [2.4, -27, 2.4, -42], sp: 1.1}, {t: 'pigeons', x: 0.5, z: -37, n: 4});
      L.feathers.push([0, 3.6, -19.5], [0, 2.4, -17], [0, 2.4, -22]); }}),
  mkLevel(6, {name: 'Rüzgârlı Sahil', par: 3, wind: 2.4, start: [0, 3], bucket: [-0.5, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -48, {noR: 1, end: 1});
      L.props.push({t: 'rail', x: 3.4, z0: 6, z1: -48}, {t: 'tree', x: -2.6, z: -8}, {t: 'kiosk', x: -1.2, z: -20}, {t: 'car', x: 1.1, z: -29, col: 0xe22511, ax: 'z'}, {t: 'bench', x: 2.6, z: -14}, {t: 'bench', x: 2.6, z: -36}, {t: 'sock', x: 3.0, z: 2});
      L.actors.push(walker(2.4, -2, 2.4, -40, {sp: 0.7, col: 0x1f6fd1, hat: 0xf4eee2}), {t: 'pigeons', x: 0, z: -12, n: 6}, {t: 'cat', x: -2.4, z: -26, sit: 1, col: 0xf4f0e8}, walker(-2.4, -30, -2.4, -46, {col: 0xffc20e}), {t: 'kid', x: 0, z: -38, path: [-1.5, -38, 1.5, -38], sp: 0.9});
      L.feathers.push([1.5, 4, -12], [2.2, 3.6, -26], [0, 4, -36]); }}),
  mkLevel(7, {name: 'Pazar Yeri', par: 3, start: [0, 3], bucket: [-24, -34], route: [[0, 3], [0, -33], [-24, -34]],
    build(L) { stZ(L, 0, 6, -30, {gapL: [[-23, -30]]}); stX(L, -33.4, -28, 3.4, {gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -30.4, -28, -39, -27.8, '+x', 0.22), lot({h: 6}, 3.4, 5.6, -39, -30, '-x', 0.22));
      for (let z = -4; z > -26; z -= 5.5) L.props.push({t: 'stall', x: (z % 11 === 0 ? 1 : -1) * 1.0, z, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a'])});
      for (let x = -6; x > -24; x -= 6) L.props.push({t: 'stall', x, z: -33.4 + ((x / 6) % 2 ? 1 : -1), col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ffc20e']), ax: 'x'});
      L.actors.push(walker(2.4, -2, 2.4, -26, {col: 0xe22511, bag: 0x2fa84f}), walker(-2.4, -20, -2.4, -6, {sp: 0.7, long: 1, skirt: 1, col: 0xff8fb8, bag: 0xffc20e}), {t: 'cat', x: 0, z: -12, path: [0, -9, 0, -24], sp: 0.8, col: 0xf0912e},
        walker(-1.5, -14.5, 1.5, -14.5, {col: 0x2fa84f, hat: 0xe22511}), {t: 'dog', x: -10, z: -31, path: [-22, -31, -4, -31], sp: 1.3}, {t: 'pigeons', x: -12, z: -35.8, n: 6}, walker(-18, -35.8, -4, -35.8, {sp: 0.8, col: 0x7a4fb0}),
        {t: 'kid', x: 0, z: -28, path: [-1.5, -28, 1.5, -28], sp: 1.1}, {t: 'cat', x: -20, z: -31, sit: 1, col: 0x2a2a2e});
      L.feathers.push([0, 4, -9.5], [0, 4, -20.5], [-15, 3.6, -33.4]); }}),

  // ---- 9-10: still free ----
  mkLevel(8, {name: 'Zikzak', par: 4, start: [0, 3], bucket: [18, -47], route: [[0, 3], [0, -24.4], [18, -24.4], [18, -47]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 21.4, {gapN: [[-3.4, 3.4]], gapF: [[14.6, 21.4]]}); stZ(L, 18, -27.8, -51, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22), lot({h: 6}, 21.4, 23.6, -27.8, -18.8, '-x', 0.22));
      L.props.push({t: 'car', x: 1.1, z: -9, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -15, h: 3.4}, {t: 'car', x: 9, z: -23.3, col: 0xe22511, ax: 'x'}, {t: 'kiosk', x: 4.5, z: -27.2},
        {t: 'line', x0: 14.6, x1: 21.4, z: -35, h: 3.2}, {t: 'car', x: 16.9, z: -41, col: 0x1f6fd1, ax: 'z'}, {t: 'tree', x: 20.5, z: -31});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0xffc20e}), {t: 'cat', x: -2.4, z: -12, sit: 1}, walker(4, -21.8, 14, -21.8, {sp: 1.0, col: 0x7a4fb0}), {t: 'pigeons', x: 12, z: -25, n: 5},
        {t: 'dog', x: 15.6, z: -34, path: [15.6, -30, 15.6, -46], sp: 1.2}, walker(20.4, -45, 20.4, -30, {sp: 0.8, col: 0xe22511, hat: 0xffc20e}));
      L.feathers.push([0, 4.6, -15], [9, 3.6, -24.4], [18, 4.4, -35]); }}),
  mkLevel(9, {name: 'Teras Katı', par: 4, start: [0, 3], bucket: [0, -36], route: [[0, 3], [0, -36]],
    build(L) { stZ(L, 0, 6, -8, {}); plaza(L, 0, -11, 6.8, 6, 1.2); plaza(L, 0, -18.5, 4.2, 9, 2.4); plaza(L, 0, -30.5, 5.5, 11, 3.6);
      for (const [z0, z1, t] of [[-8, -14, 1.42], [-14, -23, 2.62], [-25, -36, 3.82]]) L.props.push(lot({h: 3.2 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.2 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 6.5}, -5.6, 5.6, -38.4, -36, '+z', 0.22), {t: 'plant', x: -1.6, z: -18}, {t: 'plant', x: 1.6, z: -21}, {t: 'bench', x: 1.6, z: -29}, {t: 'tree', x: -1.8, z: -33});
      L.actors.push(walker(2.4, 0, 2.4, -7, {col: 0x1f6fd1}), {t: 'cat', x: 0.8, z: -12, sit: 1, col: 0x8a8a92}, {t: 'pigeons', x: 0, z: -16, n: 4}, walker(-1.8, -27, 1.8, -27, {sp: 0.7, col: 0xff8fb8, long: 1, skirt: 1}), {t: 'cat', x: 1.5, z: -34, sit: 1});
      L.feathers.push([0, 4.6, -11], [0, 5.6, -23.6], [0, 6.8, -30]); }}),
  // ---- 11-20: Sokak 2 paketi ----
  mkLevel(10, {name: 'Rüzgârlı Köprü', par: 3, wind: -2.0, start: [0, 3], bucket: [0, -48], route: [[0, 3], [0, -48]],
    build(L) { stZ(L, 0, 6, -12, {}); L.islands.push({x: 0, z: -17, w: 1.8, d: 10, top: 0.22, kind: 'bridge'}); plaza(L, 0, -24.5, 5, 5, 0.22); L.islands.push({x: 0, z: -31, w: 1.6, d: 8, top: 0.22, kind: 'bridge'}); stZ(L, 0, -35, -52, {end: 1});
      L.props.push({t: 'sock', x: -2.0, z: 2}, {t: 'plant', x: -1.8, z: -23}, {t: 'kiosk', x: 1.0, z: -42}, {t: 'car', x: -1.1, z: -6, col: 0xffc20e, ax: 'z'});
      L.actors.push({t: 'pigeons', x: 0, z: -17, n: 3}, walker(-1.5, -25, 1.5, -25, {sp: 0.6, col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -31, n: 3}, {t: 'dog', x: -2.4, z: -38, path: [-2.4, -38, -2.4, -50], sp: 1.1}, {t: 'cat', x: 2.4, z: -45, sit: 1});
      L.feathers.push([0, 3.4, -17], [0, 3.4, -31], [-1, 3.6, -40]); }}),
  mkLevel(11, {name: 'Çifte Köşe', par: 4, start: [0, 3], bucket: [-18, -47], route: [[0, 3], [0, -24.4], [-18, -24.4], [-18, -47]],
    build(L) { stZ(L, 0, 6, -21, {gapL: [[-18.8, -21]]}); stX(L, -24.4, -21.4, 3.4, {gapN: [[-3.4, 3.4]], gapF: [[-21.4, -14.6]]}); stZ(L, -18, -27.8, -51, {end: 1});
      L.props.push(lot({h: 6}, 3.4, 5.6, -27.8, -21, '-x', 0.22), lot({h: 6}, -23.6, -21.4, -27.8, -18.8, '+x', 0.22));
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -8, h: 3.0}, {t: 'car', x: -1.1, z: -14, col: 0xe22511, ax: 'z'}, {t: 'stall', x: -8, z: -25.4, col: '#1f6fd1', ax: 'x'}, {t: 'car', x: -13, z: -23.3, col: 0x2fa84f, ax: 'x'},
        {t: 'line', x0: -21.4, x1: -14.6, z: -33, h: 3.4}, {t: 'kiosk', x: -17, z: -39}, {t: 'line', x0: -21.4, x1: -14.6, z: -43, h: 3.0});
      L.actors.push(walker(-2.4, -2, -2.4, -18, {col: 0x1f6fd1, hat: 0xe22511}), {t: 'cat', x: 2.4, z: -11, sit: 1, col: 0xf0912e}, walker(-4, -26.9, -14, -26.9, {sp: 0.9, col: 0xffc20e}), {t: 'kid', x: -10, z: -22, path: [-12, -22, -6, -22], sp: 1.0},
        {t: 'dog', x: -15.6, z: -36, path: [-15.6, -30, -15.6, -48], sp: 1.3}, {t: 'pigeons', x: -18, z: -38, n: 5});
      L.feathers.push([0, 4.2, -8], [-8, 4.8, -25.4], [-18, 4.6, -43]); }}),
  mkLevel(12, {name: 'Dar Geçit', par: 3, start: [0, 3], bucket: [0.4, -58], route: [[0, 3], [0, -58]],
    build(L) { stZ(L, 0, 6, -62, {end: 1});
      for (const [z, h] of [[-8, 3.0], [-17, 3.6], [-27, 2.8], [-37, 3.4], [-47, 3.0]]) L.props.push({t: 'line', x0: -3.4, x1: 3.4, z, h});
      L.props.push({t: 'car', x: 1.1, z: -12, col: 0x1f6fd1, ax: 'z'}, {t: 'car', x: -1.1, z: -22, col: 0xe22511, ax: 'z'}, {t: 'kiosk', x: 1.0, z: -32}, {t: 'car', x: -1.1, z: -42, col: 0x2fa84f, ax: 'z'},
        {t: 'car', x: 1.1, z: -52, col: 0xffc20e, ax: 'z'}, {t: 'tree', x: -2.6, z: -15}, {t: 'tree', x: 2.6, z: -35}, {t: 'bench', x: -2.6, z: -50});
      L.actors.push(walker(-2.4, -2, -2.4, -30, {col: 0xff7a1a}), walker(2.4, -40, 2.4, -10, {sp: 0.9, long: 1, skirt: 1, col: 0x7a4fb0}), {t: 'cat', x: -2.4, z: -24, sit: 1}, {t: 'dog', x: 2.4, z: -46, path: [2.4, -44, 2.4, -60], sp: 1.2},
        walker(-1.6, -45, 1.6, -45, {sp: 0.8, col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -55, n: 5}, {t: 'kid', x: -2.4, z: -56, path: [-2.4, -50, -2.4, -60], sp: 0.8});
      L.feathers.push([0, 4.4, -17], [0, 3.8, -27], [0, 4.2, -47]); }}),
  mkLevel(13, {name: 'Çatı Katı', par: 3, start: [0, 2], bucket: [0, -33], route: [[0, 2], [0, -33]],
    build(L) { const T = 4.0;
      for (const [z, d, w] of [[0, 8, 6], [-10.5, 5, 4.4], [-19.5, 5, 4.4], [-30, 8, 6]]) { plaza(L, 0, z, w, d, T); L.props.push(lot({h: T + 3.5 - 0.02}, -w / 2, w / 2, z - d / 2, z + d / 2, '+z', -3.5)); }
      L.islands.push({x: 0, z: -15, w: 30, d: 60, top: -3.5, kind: 'walk'});
      L.props.push({t: 'plant', x: -2, z: -1}, {t: 'sock', x: 2.4, z: 2}, {t: 'plant', x: 1.5, z: -20.5}, {t: 'bench', x: -2, z: -29});
      L.actors.push({t: 'cat', x: 1.3, z: -10, sit: 1, y: T}, {t: 'pigeons', x: 0, z: -19.5, n: 4}, {t: 'cat', x: -1.8, z: -32, sit: 1, y: T, col: 0x2a2a2e});
      L.feathers.push([0, 7, -5.5], [0, 7, -15], [0, 6.6, -25]); }}),
  mkLevel(14, {name: 'Ters Rüzgâr', par: 3, wind: 2.8, start: [0, 3], bucket: [-22, -26], route: [[0, 3], [0, -24.5], [-22, -26]],
    build(L) { stZ(L, 0, 6, -21, {gapL: [[-18.8, -21]]}); stX(L, -24.4, -26, 3.4, {end: 0, gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, 3.4, 5.6, -27.8, -21, '-x', 0.22), lot({h: 6}, -28.4, -26, -30, -18.8, '+x', 0.22));
      L.props.push({t: 'sock', x: 2.8, z: 1}, {t: 'line', x0: -3.4, x1: 3.4, z: -10, h: 3.4}, {t: 'car', x: 1.1, z: -16, col: 0x7a4fb0, ax: 'z'}, {t: 'kiosk', x: -10, z: -27.2}, {t: 'car', x: -16, z: -25.5, col: 0xe22511, ax: 'x'});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -20, n: 6}, walker(-4, -21.8, -22, -21.8, {sp: 1.0, col: 0xff8fb8}), {t: 'cat', x: -20, z: -27, sit: 1});
      L.feathers.push([1, 4.4, -10], [-6, 4.2, -24.4], [-16, 3.8, -24.4]); }}),
  mkLevel(15, {name: 'Pazar Labirenti', par: 3, start: [0, 3], bucket: [16, -50], route: [[0, 3], [0, -24.4], [16, -24.4], [16, -50]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 19.4, {gapN: [[-3.4, 3.4]], gapF: [[12.6, 19.4]]}); stZ(L, 16, -27.8, -54, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22), lot({h: 6}, 19.4, 21.6, -27.8, -18.8, '-x', 0.22));
      for (let z = -4; z > -20; z -= 5) L.props.push({t: 'stall', x: (Math.round(z / 5) % 2 ? 1 : -1) * 0.9, z, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a'])});
      for (let x = 4; x < 12; x += 4.5) L.props.push({t: 'stall', x, z: -24.4 + (x > 6 ? 0.9 : -0.9), col: pick(['#e22511', '#ffc20e', '#2fa84f']), ax: 'x'});
      for (let z = -31; z > -47; z -= 5) L.props.push({t: 'stall', x: 16 + (Math.round(z / 5) % 2 ? 0.9 : -0.9), z, col: pick(['#1f6fd1', '#e22511', '#ff7a1a'])});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0xe22511, bag: 0xffc20e}), walker(-2.4, -18, -2.4, -4, {sp: 0.7, col: 0x1f6fd1, bag: 0x2fa84f}), {t: 'cat', x: 0, z: -10, path: [0, -7, 0, -17], sp: 0.8},
        walker(4, -26.9, 12, -26.9, {sp: 0.8, col: 0xff8fb8, long: 1, skirt: 1}), {t: 'dog', x: 18.4, z: -36, path: [18.4, -30, 18.4, -50], sp: 1.3}, {t: 'pigeons', x: 16, z: -48, n: 5}, walker(13.6, -48, 13.6, -32, {col: 0x2fa84f}));
      L.feathers.push([0, 4.4, -12], [8, 4.4, -24.4], [16, 4.4, -38]); }}),
  mkLevel(16, {name: 'Yokuş Aşağı', par: 3, start: [0, -2], bucket: [-0.5, -44], route: [[0, -2], [0, -44]],
    build(L) { plaza(L, 0, -2, 6.8, 8, 4.0); plaza(L, 0, -10.5, 6.8, 9, 2.8); plaza(L, 0, -19.5, 6.8, 9, 1.4); stZ(L, 0, -24, -48, {end: 1});
      for (const [z0, z1, t] of [[2, -6, 4.2], [-6, -15, 3.0], [-15, -24, 1.6]]) L.props.push(lot({h: 3.4 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.4 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 8}, -5.6, 5.6, 2, 4.4, '-z', 0.22), {t: 'tree', x: 2.4, z: -11}, {t: 'plant', x: -2.4, z: -20}, {t: 'line', x0: -3.4, x1: 3.4, z: -30, h: 3.2}, {t: 'car', x: 1.1, z: -36, col: 0xe22511, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -40, h: 2.8});
      L.actors.push({t: 'cat', x: -2, z: -3, sit: 1, y: 4.0}, walker(-2, -9, 2, -12, {sp: 0.6, col: 0x7a4fb0}), {t: 'pigeons', x: 0, z: -19, n: 5}, walker(2.4, -26, 2.4, -46, {col: 0xffc20e}), {t: 'kid', x: -2.4, z: -38, path: [-2.4, -32, -2.4, -46], sp: 0.9});
      L.feathers.push([0, 5.6, -10], [0, 4.2, -20], [0, 3.8, -35]); }}),
  mkLevel(17, {name: 'Kedi Mahallesi', par: 4, start: [0, 3], bucket: [0, -52], route: [[0, 3], [0, -52]],
    build(L) { stZ(L, 0, 6, -14, {}); L.islands.push({x: 0, z: -19, w: 1.6, d: 10, top: 0.22, kind: 'bridge'}); stZ(L, 0, -24, -34, {}); L.islands.push({x: 0, z: -38.5, w: 1.4, d: 9, top: 0.22, kind: 'bridge'}); stZ(L, 0, -43, -56, {end: 1});
      L.props.push({t: 'car', x: 1.1, z: -6, col: 0x1f6fd1, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -29, h: 3.2}, {t: 'kiosk', x: -1, z: -48}, {t: 'tree', x: 2.6, z: -27});
      L.actors.push({t: 'cat', x: -2.4, z: -4, sit: 1, col: 0xf0912e}, {t: 'cat', x: 2.4, z: -10, path: [2.4, -2, 2.4, -13], sp: 0.7}, {t: 'cat', x: 0, z: -19, sit: 1, col: 0x2a2a2e}, {t: 'cat', x: -1.5, z: -31, path: [-1.5, -26, 1.5, -32], sp: 0.8, col: 0xf4f0e8},
        {t: 'dog', x: 2.4, z: -45, path: [2.4, -44, 2.4, -55], sp: 1.4}, {t: 'cat', x: -2.4, z: -50, sit: 1}, walker(-2.4, -26, -2.4, -33, {col: 0xe22511}));
      L.feathers.push([0, 3.0, -19], [0, 4.0, -29], [0, 3.0, -38.5]); }}),
  mkLevel(18, {name: 'Uzun Yol', par: 6, wind: -1.4, start: [0, 3], bucket: [20, -60], route: [[0, 3], [0, -30.4], [20, -30.4], [20, -60]],
    build(L) { stZ(L, 0, 6, -27, {gapR: [[-24.8, -27]]}); stX(L, -30.4, -3.4, 23.4, {gapN: [[-3.4, 3.4]], gapF: [[16.6, 23.4]]}); stZ(L, 20, -33.8, -64, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -33.8, -27, '+x', 0.22), lot({h: 6}, 23.4, 25.6, -33.8, -24.8, '-x', 0.22));
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -9, h: 3.4}, {t: 'car', x: -1.1, z: -15, col: 0xffc20e, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -21, h: 3.0}, {t: 'car', x: 8, z: -29.3, col: 0xe22511, ax: 'x'},
        {t: 'kiosk', x: 13, z: -33.2}, {t: 'line', x0: 16.6, x1: 23.4, z: -42, h: 3.4}, {t: 'car', x: 21.1, z: -48, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: 16.6, x1: 23.4, z: -54, h: 3.0});
      L.actors.push(walker(2.4, -2, 2.4, -24, {col: 0x1f6fd1}), {t: 'cat', x: -2.4, z: -12, sit: 1}, walker(4, -27.8, 18, -27.8, {col: 0xff7a1a}), {t: 'pigeons', x: 10, z: -31, n: 5},
        {t: 'dog', x: 17.6, z: -40, path: [17.6, -36, 17.6, -60], sp: 1.3}, walker(22.4, -58, 22.4, -38, {col: 0x7a4fb0, long: 1, skirt: 1}), {t: 'kid', x: 20, z: -51, path: [18.5, -51, 21.5, -51], sp: 1.0});
      L.feathers.push([0, 4.6, -21], [10, 4.0, -30.4], [20, 4.6, -54]); }}),
  mkLevel(19, {name: 'Büyük Final', par: 6, start: [0, 3], bucket: [18, -64], route: [[0, 3], [0, -40.4], [18, -40.4], [18, -64]],
    build(L) { stZ(L, 0, 6, -8, {}); plaza(L, 0, -11, 6.8, 6, 1.2); plaza(L, 0, -18, 6.8, 8, 2.4); L.islands.push({x: 0, z: -26.5, w: 1.6, d: 9, top: 2.4, kind: 'bridge'}); plaza(L, 0, -33.5, 6.8, 5, 2.4);
      stX(L, -40.4, -3.4, 21.4, {top: 2.2, gapN: [[-3.4, 3.4]], gapF: [[14.6, 21.4]]}); stZ(L, 18, -43.8, -68, {top: 2.2, end: 1});
      for (const [z0, z1, t] of [[-8, -14, 1.42], [-14, -22, 2.62]]) L.props.push(lot({h: 3.2 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.2 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 9}, -5.6, -3.4, -43.8, -31, '+x', 0.22), lot({h: 9}, 3.4, 5.6, -36, -31, '-x', 0.22), lot({h: 9}, 21.4, 23.6, -43.8, -34.8, '-x', 0.22));
      L.props.push({t: 'car', x: 1.1, z: -4, col: 0xe22511, ax: 'z'}, {t: 'plant', x: -2, z: -17}, {t: 'plant', x: 2, z: -20}, {t: 'stall', x: 8, z: -41.3, col: '#ffc20e', ax: 'x'}, {t: 'car', x: 13, z: -39.3, col: 0x1f6fd1, ax: 'x'},
        {t: 'line', x0: 14.6, x1: 21.4, z: -50, h: 3.4}, {t: 'car', x: 16.9, z: -56, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: 14.6, x1: 21.4, z: -61, h: 3.0});
      L.actors.push(walker(2.4, 0, 2.4, -7, {col: 0xffc20e}), {t: 'cat', x: 1, z: -12, sit: 1}, {t: 'pigeons', x: 0, z: -26.5, n: 3}, walker(4, -37.8, 13, -37.8, {col: 0x7a4fb0}), {t: 'kid', x: 6, z: -43, path: [4, -43, 12, -43], sp: 1.0},
        {t: 'dog', x: 20.4, z: -50, path: [20.4, -46, 20.4, -66], sp: 1.3}, walker(15.6, -64, 15.6, -46, {col: 0xe22511, hat: 0x022753}), {t: 'pigeons', x: 18, z: -66, n: 4});
      L.feathers.push([0, 5.6, -26.5], [9, 5.6, -40.4], [18, 6.2, -50]); }}),
];

WORLDS.slice(1).forEach((W, wi) => { for (let k = 0; k < PER_WORLD; k++) LEVELS.push(mkLevel(PER_WORLD * (wi + 1) + k, genLevel(W.id, k))); });
const PARS8 = [2, 2, 3, 2, 2, 2, 2, 2, 3, 2, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 3, 2, 2, 3, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 2, 3, 2];
if (PARS8) LEVELS.forEach((L, i) => { if (PARS8[i]) L.par = PARS8[i]; });
CUR_THEME = 'sokak';
// ================= WORLD BUILDING (v3) =================
function facadeBlock(g, P) {
  const along = P.face === '+x' || P.face === '-x' ? P.z1 - P.z0 : P.x1 - P.x0, h = P.h, base = P.base || 0.22;
  const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.07).getHex(), 0.9), rt = themeRoof(CUR_THEME).clone(); rt.needsUpdate = true; rt.repeat.set((P.x1 - P.x0) / 2.2, (P.z1 - P.z0) / 2.2); const roof = new THREE.MeshStandardMaterial({map: rt, bumpMap: rt, bumpScale: 0.04, roughness: 0.8});
  const fx = facadeTex(along, h, P), ft = new THREE.MeshStandardMaterial({map: fx, bumpMap: fx, bumpScale: 0.025, roughness: 0.82});
  const mats = [side, side, roof, side, side, side]; mats[{'+x': 0, '-x': 1, '+z': 4, '-z': 5}[P.face]] = ft;
  const m = new THREE.Mesh(BOX, mats); m.scale.set(P.x1 - P.x0, h, P.z1 - P.z0); m.position.set((P.x0 + P.x1) / 2, base + h / 2, (P.z0 + P.z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  boxes.push({b: [P.x0, P.x1, base - 2, base + h, P.z0, P.z1], kind: 'hard'});
  const cm = std(CUR_THEME === 'uzay' ? 0x8a94a6 : CUR_THEME === 'amerika' ? 0xb8a890 : 0xf4eee2, 0.8), T = 0.16; // cornice around the roof
  addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z0, P.z0 + T, false); addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z1 - T, P.z1, false);
  addBox(g, cm, P.x0, P.x0 + T, base + h, base + h + 0.24, P.z0, P.z1, false); addBox(g, cm, P.x1 - T, P.x1, base + h, base + h + 0.24, P.z0, P.z1, false);
  if (P.chim || CUR_THEME === 'amerika' && srnd(0, 1) > 0.4) roofBits(g, P, base, h);
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
    const TT = themeTex(CUR_THEME), src = I.kind === 'road' ? TT.road : I.kind === 'bridge' ? (CUR_THEME === 'uzay' ? TT.pave : plankTex) : TT.pave;
    const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / (src === TT.pave ? 3 : 2.5), I.d / (src === TT.pave ? 3 : 2.5));
    addBox(g, new THREE.MeshStandardMaterial({map: t, bumpMap: t, bumpScale: 0.04, roughness: 0.93}), x0, x1, I.top - 0.25, I.top, z0, z1);
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
  if (P.t === 'bld') { if (OPEN_W[CUR_THEME]) themedLot(g, P); else { facadeBlock(g, P); facadeExtra(g, P); } return true; }
  if (P.t === 'monu') { monuProp(P, top, g); return true; }
  if (P.t === 'water') { waterProp(P, g); return true; }
  if (P.t === 'car' && P.ax === 'z') { // a car parked along a z street: swap the axes of the x-car
    const c = std(P.col, 0.35, 0.2), dk = std(0x1b1330, 0.6), gl = std(0x8fc4dc, 0.15, 0.3);
    addBox(g, c, P.x - 0.6, P.x + 0.6, top + 0.25, top + 0.95, P.z - 1.2, P.z + 1.2);
    addBox(g, c, P.x - 0.52, P.x + 0.52, top + 0.95, top + 1.5, P.z - 0.5, P.z + 0.6);
    addBox(g, gl, P.x - 0.54, P.x + 0.54, top + 1.0, top + 1.42, P.z - 0.45, P.z + 0.55, false);
    for (const [a, b] of [[-0.55, -0.75], [0.55, -0.75], [-0.55, 0.75], [0.55, 0.75]]) { const w = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 14), dk, P.x + a, top + 0.27, P.z + b, g); w.rotation.z = Math.PI / 2; }
    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xe22511 : 0xfff1b0, 0.3), P.x + 0.4, top + 0.7, P.z + a * 1.2, g);
    carExtras(P, top, g, true);
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
function disposeTree(root) {
  const geos = new Set(), mats = new Set(), texs = new Set();
  root.traverse((o) => { if (o.geometry) geos.add(o.geometry); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => { mats.add(mm); for (const k in mm) { const v = mm[k]; if (v && v.isTexture) texs.add(v); } }); });
  geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); texs.forEach((t) => t.dispose());
}
function buildLevel(i) {
  if (world) { scene.remove(world); try { disposeTree(world); } catch (e) {} }
  LV = LEVELS[i]; boxes = []; stars = []; sock = null; world = new THREE.Group(); scene.add(world); seed = 11 + (LV.seedI !== undefined ? LV.seedI : i) * 7; CUR_THEME = LV.theme || 'sokak'; FLAGS.length = 0; SPIN.length = 0; OCC.length = 0; scene.fog.color.setHex(THEMES[CUR_THEME].fog); scene.fog.far = CUR_THEME === 'uzay' ? 160 : 110;
  buildGround3();
  for (const P of LV.props) {
    if (P.t === 'line' && P.x === undefined) P.x = (P.x0 + P.x1) / 2;
    const I = P.x !== undefined ? islandAt(P.x, P.z !== undefined ? P.z : (P.z0 || 0)) : null, top = P.base !== undefined ? P.base : I ? I.top : 0.22, g = new THREE.Group(); world.add(g);
    if (prop3(P, top, g)) { /* street */ }
    else if (P.t === 'plant') { mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 14), std(0xb85c3c), P.x, top + 0.25, P.z, g); mesh(new THREE.SphereGeometry(0.45, 14, 10), std(0x4a9a4a, 0.9), P.x, top + 0.75, P.z, g); boxes.push({b: [P.x - 0.4, P.x + 0.4, top, top + 1.1, P.z - 0.4, P.z + 0.4], kind: 'soft'}); }
    else if (P.t === 'line') {
      for (const x of [P.x0, P.x1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, P.h, 6), std(0x445566), x, top + P.h / 2, P.z, g);
      const rope = mesh(new THREE.CylinderGeometry(0.014, 0.014, P.x1 - P.x0, 4), std(0xffffff), (P.x0 + P.x1) / 2, top + P.h - 0.05, P.z, g); rope.rotation.z = Math.PI / 2;
      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = lineDeco(P, top, g) ? 1e9 : P.x0 + 0.15, k = 0;
      while (x < P.x1 - 0.4) { const w = 0.55 + srnd(0, 0.3), hh = 0.6 + srnd(0, 0.35); addBox(g, std(cols[k++ % cols.length], 0.9), x, x + w, top + P.h - 0.08 - hh, top + P.h - 0.05, P.z - 0.03, P.z + 0.03, false); x += w + 0.12; }
      boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'slow'});
    }
    else if (P.t === 'sock') { mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), std(0xffffff), P.x, top + 1, P.z, g); sock = mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.9, 12, 1, true), new THREE.MeshStandardMaterial({color: 0xff6a1a, side: THREE.DoubleSide}), P.x, top + 1.9, P.z, g); sock.userData.base = new V3(P.x, top + 1.9, P.z); }
    if (P.t !== 'bld') ink(g, 0.025);
    if (P.t === 'bld' || P.t === 'kiosk' || P.t === 'stall' || P.t === 'tree' || P.t === 'monu') OCC.push({g, box: new THREE.Box3().setFromObject(g).expandByScalar(0.05), a: 1, cur: 1, mats: null});
  }
  // bucket (the hole)
  const bt = bucketY(LV);
  const bg = new THREE.Group(); world.add(bg); const bp = []; for (let k = 0; k <= 8; k++) { const u = k / 8; bp.push(new THREE.Vector2(0.62 + u * 0.22, u * 0.8)); }
  mesh(new THREE.LatheGeometry(bp, 28), new THREE.MeshStandardMaterial({color: 0xffc20e, side: THREE.DoubleSide, roughness: 0.5}), 0, 0, 0, bg);
  const rim = mesh(new THREE.TorusGeometry(0.84, 0.06, 8, 28), std(NAVY, 0.4), 0, 0.8, 0, bg); rim.rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.62, 24), std(0x8a5a00, 0.8), 0, 0.03, 0, bg).rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.4, 6), std(0xffffff), 0.95, 1.7, 0, bg);
  const flag = mesh(new THREE.PlaneGeometry(1.0, 0.62), new THREE.MeshStandardMaterial({color: 0xe22511, side: THREE.DoubleSide}), 1.45, 3.05, 0, bg);
  ink(bg, 0.03); bg.position.set(LV.bucket[0], bt, LV.bucket[1]);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.4, 40), new THREE.MeshBasicMaterial({color: 0xffc20e, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false})); glow.rotation.x = -Math.PI / 2; glow.position.set(LV.bucket[0], bt + 0.03, LV.bucket[1]); world.add(glow);
  // a tall light beam so the hole can be found from anywhere
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 16, 1, true), new THREE.MeshBasicMaterial({color: 0xffc20e, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide})); beam.position.set(LV.bucket[0], bt + 7.5, LV.bucket[1]); beam.userData.noInk = true; world.add(beam);
  bucket = {x: LV.bucket[0], z: LV.bucket[1], y: bt, rIn: 0.66, rOut: 0.9, rimY: bt + 0.8, g: bg, flag, glow, beam};
  // golden feathers to collect
  stars = LV.feathers.map(([x, y, z]) => { const m = makeGoldFeather(); m.position.set(x, y, z); world.add(m); return {m, p: new V3(x, y, z), got: false}; });
  // clouds below and around
  const bb = levelBounds(); seed = 3 + i;
  if (CUR_THEME !== 'uzay') for (let k = 0; k < 14; k++) cloud(srnd(bb.x0 - 10, bb.x1 + 10), srnd(-9, -4), srnd(bb.z0 - 10, bb.z1 + 6), srnd(2, 3.4));
  spawnActors(LV);
  { const dg = new THREE.Group(); world.add(dg); for (const D of LV.deco || []) decoProp8(D, dg); { const lg = new THREE.Group(); lg.position.set((bb.x0 + bb.x1) / 2, -1.2, bb.z0 - 20); lg.scale.setScalar(2.1); dg.add(lg); landmark(CUR_THEME, {x0: 0, x1: 0, z0: 14, z1: 14}, lg); } ink(dg, 0.022); }
}
const goldMat = new THREE.MeshStandardMaterial({color: 0xffc20e, emissive: 0xff9a00, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide});
function makeGoldFeather() { const g = new THREE.Group(); const m = new THREE.Mesh(leafGeo(1.1, 0.55, -0.1), goldMat); m.position.y = -0.5; g.add(m); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.95, 5), std(0xffffff, 0.5)); s.position.y = 0.0; g.add(s); ink(g, 0.022); g.scale.setScalar(0.85); return g; }
function levelBounds() { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const I of LV.islands) { x0 = Math.min(x0, I.x - I.w / 2); x1 = Math.max(x1, I.x + I.w / 2); z0 = Math.min(z0, I.z - I.d / 2); z1 = Math.max(z1, I.z + I.d / 2); } return {x0, x1, z0, z1}; }
function cloud(x, y, z, s) { const g = new THREE.Group(), mat = std(0xffffff, 1); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(srnd(0.5, 1.0) * s, 12, 8), mat); m.position.set(srnd(-1.6, 1.6) * s, srnd(-0.2, 0.35) * s, srnd(-0.6, 0.6) * s); m.scale.y = 0.75; g.add(m); } g.position.set(x, y, z); world.add(g); }
function bucketY(L) { return L.bucket[2] !== undefined ? L.bucket[2] : islandAt(L.bucket[0], L.bucket[1]).top; }
function startPos(L) { const I = islandAt(L.start[0], L.start[1]); return new V3(L.start[0], I.top + RAD + 0.01, L.start[1]); }

// ================= ROUTE helpers (auto aim, bot) =================
function routeInfo(p) { // distance left along the route from the closest point to p
  const R = LV.route; let best = {d: 1e9, left: 0, seg: 0};
  for (let k = 0; k < R.length - 1; k++) {
    const [ax, az] = R[k], [bx, bz] = R[k + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    const u = clamp(((p.x - ax) * dx + (p.z - az) * dz) / L2, 0, 1), cx = ax + dx * u, cz = az + dz * u, d = Math.hypot(p.x - cx, p.z - cz);
    if (d < best.d) { let left = Math.hypot(bx - cx, bz - cz); for (let j = k + 1; j < R.length - 1; j++) left += Math.hypot(R[j + 1][0] - R[j][0], R[j + 1][1] - R[j][1]); best = {d, left, seg: k}; }
  }
  return best;
}
function autoYaw(p) {
  const bk = LV.bucket, R = LV.route, info = routeInfo(p);
  const direct = Math.hypot(bk[0] - p.x, bk[1] - p.z);
  let tx = bk[0], tz = bk[1];
  if (info.seg < R.length - 2 && direct > 9) { tx = R[info.seg + 1][0]; tz = R[info.seg + 1][1]; }
  return Math.atan2(tx - p.x, -(tz - p.z));
}
// best next shot from p: lands in the bucket, or rests as far along the route as possible
function solveShot(from) {
  const by = bucketY(LV), lv = {boxes, bucket: {x: LV.bucket[0], z: LV.bucket[1], y: by, rIn: 0.66, rOut: 0.9, rimY: by + 0.8}, stars: []};
  const y0 = autoYaw(from), yb = Math.atan2(LV.bucket[0] - from.x, -(LV.bucket[1] - from.z)); let best = null;
  const yaws = []; for (let d = -0.6; d <= 0.6001; d += 0.05) yaws.push(y0 + d); if (Math.abs(yb - y0) > 0.05) for (let d = -0.2; d <= 0.2001; d += 0.05) yaws.push(yb + d);
  for (const d of [Math.PI / 2, -Math.PI / 2, Math.PI, Math.PI - 0.4, Math.PI + 0.4]) yaws.push(y0 + d);
  for (const openAt of [-1, 0]) for (const ang of yaws) for (let pw = 0.05; pw <= 1.0001; pw += 0.05) {
    const B = newBody(from, launchVel(ang, pw)); B.autoOpen = openAt;
    for (let i = 0; i < 1100 && !B.done; i++) stepBody(B, 1 / 120, LV.wind, lv);
    let sc;
    if (B.done === 'in') sc = -100 + Math.abs(ang - y0) + pw * 0.1;
    else if (B.done === 'out' || !islandAt(B.p.x, B.p.z) || B.p.y < -0.3) sc = 1e6;
    else { const r = routeInfo(B.p); sc = r.left + r.d * 0.6 + (openAt >= 0 ? 0.3 : 0); }
    if (!best || sc < best.sc) best = {ang, pow: pw, open: openAt, sc};
  }
  return best;
}

// ================= PLAY STATE =================
let state = 'home', cur = 0;
const P = {phase: 'aim', shot: 0, body: null, from: null, yaw: 0, got: [], celebrate: 0, reacts: 0, map: false, intro: 0, pen: 0};
const MAXOVER = 2, SHOT_LIMIT = 8; // shots allowed per hole
function startLevel(i) {
  cur = i; buildLevel(i); audio();
  Object.assign(P, {phase: 'aim', shot: 0, body: null, got: LV.feathers.map(() => false), celebrate: 0, reacts: 0, map: false, intro: BOT ? 0 : 2.2, pen: 0, bonus: 0, revived: 0});
  bubbles.splice(0).forEach((b) => b.el.remove());
  P.from = startPos(LV); placeToy(P.from); toyRoot.quaternion.identity(); P.yaw = autoYaw(P.from);
  ['homeL', 'levelsL', 'endL', 'pauseL', 'shopL'].forEach((id) => show(id, false)); show('hud', true); state = 'play'; if (window.FlixAds) window.FlixAds.setScreen('game');
  $('lvN').textContent = i + 1; $('lvName').textContent = LV.name; $('par').textContent = LV.par;
  $('wind').hidden = !LV.wind; $('windV').textContent = (LV.wind > 0 ? '→ ' : '← ') + Math.round(Math.abs(LV.wind) * 3);
  hudShots(); hudFeathers(); tuyUI(); $('toast').innerHTML = ''; $('mapB').classList.remove('on');
  // intro: show the whole street, then swoop behind the FLIX
  camMode = 'map'; snapCam(); camMode = 'aim';
  if (LV.tut === 1) tutor(['Sağa sola kaydır: yön', 'Aşağı çek: güç · bırak: at']);
  else if (LV.tut === 2) tutor(['Kısa kaldırıma in!', 'Uçarken ekrana basılı tut: süzül']);
  else tutor(null);
  toast('PAR ' + LV.par, LV.name, '#022753');
}
function placeToy(p) { toyRoot.position.copy(p); }
function show(id, on) { $(id).hidden = !on; }
const STAR = (on, s) => `<svg viewBox="0 0 24 24" ${s || ''}><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="${on ? '#ffc20e' : 'rgba(255,255,255,.65)'}" stroke="#022753" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const FEATHER = (on) => `<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="${on ? '#ffc20e' : 'rgba(255,255,255,.6)'}" stroke="#022753" stroke-width="1.8"/><path d="M10 22V6" stroke="#022753" stroke-width="1.2"/></svg>`;
function hudShots() { $('shots').textContent = P.shot; $('shotMax').textContent = '/' + (SHOT_LIMIT + (P.bonus || 0)); $('shotsBox').classList.toggle('over', P.shot >= LV.par); }
function hudFeathers() { $('hudFe').innerHTML = P.got.map((g) => FEATHER(g)).join(''); }
function tuyUI() { const B = P.body, e = B ? B.energy / 1.6 : 1; $('tuyArc').setAttribute('stroke-dashoffset', (377 * (1 - e)).toFixed(1)); $('tuy').classList.toggle('off', !(P.phase === 'fly' && B && B.energy > 0)); }
function toast(txt, sub, col) { $('toast').innerHTML = `<div class="in"><div class="tag" style="background:${col || '#e22511'}">${txt}</div>${sub ? `<div class="call">${sub}</div>` : ''}</div>`; }
let tutSteps = null;
function tutor(steps) { tutSteps = steps; const h = $('hint'); if (!steps) { h.hidden = true; $('tut').hidden = true; return; } h.innerHTML = steps.map((s, k) => `<div class="st${k ? '' : ' on'}">${s}</div>`).join(''); h.hidden = false; $('tut').hidden = LV.tut !== 1; }
function tutorDone(k) { const el = $('hint').querySelectorAll('.st'); if (el[k]) { el[k].classList.add('ok'); el[k].classList.remove('on'); if (el[k + 1]) el[k + 1].classList.add('on'); } }

// ================= AIMING (3rd person) =================
// slide left/right = turn, pull down = power, let go = shoot. Pull back up to cancel.
let aim = null;
const dotsG = new THREE.Group(); scene.add(dotsG);
const dotGeo = new THREE.SphereGeometry(0.09, 10, 8), dotMat = new THREE.MeshBasicMaterial({color: 0xffffff}), dotOut = new THREE.MeshBasicMaterial({color: NAVY, side: THREE.BackSide});
for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(dotGeo, dotMat); const o = new THREE.Mesh(dotGeo, dotOut); o.scale.setScalar(1.45); m.add(o); m.visible = false; dotsG.add(m); }
const aimArrow = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 3), new THREE.MeshBasicMaterial({color: 0xffc20e})); aimArrow.rotation.x = -Math.PI / 2; const arrowG = new THREE.Group(); arrowG.add(aimArrow); aimArrow.position.z = -1.0; scene.add(arrowG);
function previewAim() {
  const kids = dotsG.children; kids.forEach((m) => { m.visible = false; });
  const svg = $('aimsvg'); svg.innerHTML = '';
  if (!aim || aim.pow === null) return;
  const B = newBody(P.from, launchVel(P.yaw, aim.pow)); let k = 0;
  const free = {boxes: [], bucket: {x: 999, z: 999, y: -99, rimY: -99, rIn: 0, rOut: 0}, stars: []};
  for (let i = 0; i < 600 && k < kids.length && !B.done; i++) { stepBody(B, 1 / 60, LV.wind, free); if (i % 3 === 2) { const m = kids[k++]; m.position.copy(B.p); m.visible = true; m.scale.setScalar(1.05 - k / 40); } if (B.v.y < -3 && k > 14) break; }
  svg.setAttribute('width', VW()); svg.setAttribute('height', VH());
  const p = Math.round(aim.pow * 100);
  svg.innerHTML = `<line x1="${aim.x0}" y1="${aim.y0}" x2="${aim.cx}" y2="${aim.cy}" stroke="#022753" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="${aim.x0}" cy="${aim.y0}" r="9" fill="#fff" stroke="#022753" stroke-width="3"/><circle cx="${aim.cx}" cy="${aim.cy}" r="28" fill="rgba(255,255,255,.75)" stroke="${p > 85 ? '#e22511' : '#022753'}" stroke-width="4"/><text x="${aim.cx}" y="${aim.cy + 6}" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-weight="900" font-size="19" fill="#022753">${p}</text>`;
}
function shoot(pow) {
  P.shot++; hudShots();
  if (!P.revived && P.shot >= SHOT_LIMIT - 2 && window.FlixAds && window.FlixAds.prepareRewarded) window.FlixAds.prepareRewarded('shots');
  P.body = newBody(P.from, launchVel(P.yaw, pow)); P.phase = 'fly'; P.flyT = 0; SAVE.seen = 1; save();
  SFX.launch(pow); buzz(15); squash = 1; tuyUI(); dotsG.children.forEach((m) => { m.visible = false; }); $('aimsvg').innerHTML = '';
  if (LV.tut === 1) tutorDone(1); if (LV.tut === 2 && !BOT) setTimeout(() => { if (P.phase === 'fly') toast('BASILI TUT', 'süzül!', '#2fa84f'); }, 450);
}
const tb = $('tuy');
let holdId = null;
function featherOn() { if (P.phase === 'fly' && P.body && P.body.energy > 0 && !P.body.open) { if (LV.tut === 2) tutorDone(1); P.body.open = true; tb.classList.add('down'); SFX.feather(); buzz(8); } }
function featherOff() { tb.classList.remove('down'); if (P.body) P.body.open = false; holdId = null; }
const onUI = (e) => e.target.closest && (e.target.closest('button') || e.target.closest('#tuy'));
addEventListener('pointerdown', (e) => {
  if (state === 'home' && !onUI(e)) { homeKick = 1; SFX.bounce(); buzz(10); squash = 1; return; }
  if (state !== 'play') return;
  if (P.phase === 'fly' && !onUI(e)) { holdId = e.pointerId; audio(); featherOn(); return; }
  if (P.phase !== 'aim' || onUI(e) || P.map) return;
  audio(); P.intro = 0; aim = {id: e.pointerId, x0: e.clientX - OX(), y0: e.clientY - OY(), cx: e.clientX - OX(), cy: e.clientY - OY(), yaw0: P.yaw, pow: null, turned: false};
});
addEventListener('pointermove', (e) => {
  if (!aim || e.pointerId !== aim.id) return;
  aim.cx = e.clientX - OX(); aim.cy = e.clientY - OY(); const dx = aim.cx - aim.x0, dy = aim.cy - aim.y0;
  P.yaw = aim.yaw0 + dx * 0.0065; if (Math.abs(dx) > 12 && !aim.turned) { aim.turned = true; if (LV.tut === 1) tutorDone(0); }
  const full = Math.min(230, VH() * 0.3), old = aim.pow;
  aim.pow = dy > 16 ? clamp((dy - 16) / (full - 16), 0, 1) : null;
  if (aim.pow !== null && (old === null || Math.floor(aim.pow * 10) !== Math.floor(old * 10))) tick();
  if (aim.pow !== null) $('tut').hidden = true;
  previewAim();
});
addEventListener('pointerup', (e) => {
  if (holdId !== null && e.pointerId === holdId) { featherOff(); return; }
  if (!aim || e.pointerId !== aim.id) return; const pw = aim.pow; aim = null; previewAim();
  if (pw !== null && pw > 0.01 && state === 'play' && P.phase === 'aim') shoot(pw);
});
addEventListener('pointercancel', () => { aim = null; previewAim(); if (holdId !== null) featherOff(); });
document.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
tb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio(); if (P.phase === 'fly') { holdId = e.pointerId; featherOn(); } });
addEventListener('keydown', (e) => { if (e.key === ' ' && P.phase === 'fly') featherOn(); if (e.key === 'Escape') pause(true); });
addEventListener('keyup', (e) => { if (e.key === ' ') featherOff(); });
$('mapB').addEventListener('click', () => { if (state !== 'play') return; P.map = !P.map; $('mapB').classList.toggle('on', P.map); camMode = P.map ? 'map' : (P.phase === 'fly' ? 'fly' : 'aim'); tick(); });

// ================= SHOT RESULTS =================
function endShot(B) {
  const how = B.done;
  for (const a of actors) if (a.kind === 'pigeon' && !a.fly && Math.hypot(a.x - B.p.x, a.z - B.p.z) < 2.2) { scarePigeons(a); break; }
  featherOff();
  if (how === 'in') return win();
  const onGround = how === 'rest' && islandAt(B.p.x, B.p.z) && B.p.y > -0.4;
  if (onGround) { P.from = freeLie(new V3(B.p.x, B.p.y, B.p.z)); if (LV.tut === 1) tutor(['Durduğu yerden devam et', 'Kovaya at!']); }
  else { P.shot++; P.pen++; hudShots(); toast('DÜŞTÜ +1', 'ceza atışı', '#e22511'); SFX.fail(); buzz(30); }
  if (P.shot >= SHOT_LIMIT + (P.bonus || 0)) return lose();
  P.body = null; P.phase = 'aim'; placeToy(P.from); toyRoot.quaternion.identity(); tuyUI();
  P.yaw = autoYaw(P.from); camMode = P.map ? 'map' : 'aim';
}
// golf-style free drop: never make the player shoot from right against a wall or a step
function freeLie(p) {
  for (let it = 0; it < 4; it++) {
    let moved = false;
    for (const o of boxes) {
      const b = o.b; if (b[3] < p.y + 0.25 || b[2] > p.y + 0.6) continue;
      const cx = clamp(p.x, b[0], b[1]), cz = clamp(p.z, b[4], b[5]), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d < 0.85) { const nx = d > 1e-3 ? dx / d : 0, nz = d > 1e-3 ? dz / d : 1, k = 0.9 - d; const q = new V3(p.x + nx * k, p.y, p.z + nz * k); const I = islandAt(q.x, q.z); if (I && Math.abs(I.top + RAD + 0.01 - p.y) < 0.2) { p.copy(q); moved = true; } }
    }
    if (!moved) break;
  }
  // never right against the bucket: a lie that close could not be chipped in
  const bd = Math.hypot(p.x - bucket.x, p.z - bucket.z);
  if (bd < 1.75 && (Math.abs(p.y - RAD - bucket.y) < 0.6 || bd < 1.1)) { if (bd < 1.1) p.y = bucket.y + RAD + 0.01; const ux = bd > 0.01 ? (p.x - bucket.x) / bd : 0, uz = bd > 0.01 ? (p.z - bucket.z) / bd : 1; for (const r of [1.75, 2.1, 2.5]) { const q = new V3(bucket.x + ux * r, p.y, bucket.z + uz * r); const I = islandAt(q.x, q.z); if (I && Math.abs(I.top + RAD + 0.01 - p.y) < 0.2) { p.copy(q); break; } } }
  return p;
}
function rating(shots, par) { const d = shots - par; return shots === 1 ? 'TEK ATIŞ!' : d <= -2 ? 'EFSANE!' : d === -1 ? 'SÜPER!' : d === 0 ? 'PAR!' : '+' + d; }
function starsFor(shots, par) { return shots <= par ? 3 : shots <= par + 2 ? 2 : 1; }
function win() {
  P.phase = 'won'; P.celebrate = 1; P.winT = T; SFX.win(); buzz([20, 40, 20]); confetti(bucket.x, bucket.rimY + 0.3, bucket.z); camMode = 'win';
  const nStars = starsFor(P.shot, LV.par), nFe = P.got.filter(Boolean).length;
  const fe = 10 + nStars * 5 + nFe * 5 + (P.shot < LV.par ? 10 : 0) + Math.min(5, P.reacts || 0) * 2;
  const prev = SAVE.lv[cur] || {s: 0, best: 99}, newWorld = WLOC(cur) === FREE_LEVELS - 1 && WIDX(cur) < WORLDS.length - 1 && !prev.done;
  SAVE.lv[cur] = {s: Math.max(prev.s || 0, nStars), best: Math.min(prev.best || 99, P.shot), done: 1}; SAVE.fe += fe; save(); feUI();
  setTimeout(() => {
    if (newWorld && !worldOpen(WIDX(cur) + 1)) setTimeout(() => toastShop('YENİ HARİTA: ' + WORLDS[WIDX(cur) + 1].name, fmtN(WORLDS[WIDX(cur) + 1].cost) + ' tüy ile açabilirsin'), 900);
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = rating(P.shot, LV.par); $('endT').className = 'big ' + (P.shot <= LV.par ? 'good' : 'meh');
    $('endW').innerHTML = `<b>${P.shot}</b> atış · par <b>${LV.par}</b>${P.pen ? ` · ${P.pen} ceza` : ''}`;
    $('endStars').innerHTML = [0, 1, 2].map((k) => STAR(k < nStars)).join('');
    $('endRows').innerHTML = row('Bölüm', 10) + row('Yıldız', nStars * 5) + (nFe ? row('Altın tüy x' + nFe, nFe * 5) : '') + (P.shot < LV.par ? row('Par altı', 10) : '') + (P.reacts ? row('Şaşkın komşu x' + Math.min(5, P.reacts), Math.min(5, P.reacts) * 2) : '') + `<div class="tot"><span>Toplam</span><b>+${fe} tüy</b></div>`;
    $('endStars').querySelectorAll('svg').forEach((s, k) => setTimeout(() => { s.classList.add('show'); if (k < nStars) SFX.star(k); }, 250 + k * 260));
    $('retry3').hidden = false; endAd('double', fe); if (window.FlixAds) window.FlixAds.setScreen('over');
    $('next').querySelector('b').textContent = WLOC(cur) < PER_WORLD - 1 ? 'SONRAKİ' : 'BÖLÜMLER';
    $('next').onclick = async () => { if ($('next').dataset.busy) return; $('next').dataset.busy = 1; await maybeInterstitial(); delete $('next').dataset.busy; if (WLOC(cur) < PER_WORLD - 1) playLevel(cur + 1); else openLevels(); };
  }, BOT ? 50 : 1500);
}
// reward ad on the score card: 2x feathers after a win, +2 shots once after running out
function endAd(kind, fe) {
  const b = $('endAd'); if (!kind || BOT) { b.hidden = true; return; }
  b.hidden = false; b.disabled = false; b.className = 'adbtn ' + kind;
  b.innerHTML = kind === 'double' ? `<i>▶</i><span>Reklam izle<b>2x tüy · +${fe}</b></span>` : `<i>▶</i><span>Reklam izle<b>+${AD_CFG.extraShots} atış hakkı</b></span>`;
  b.onclick = async () => {
    if (b.disabled) return; b.disabled = true; const r = await adRewarded(kind === 'double' ? 'fe' : 'shots');
    if (r !== 'rewarded') { b.disabled = false; toastShop('Reklam şu an yok', 'biraz sonra dene'); return; }
    if (kind === 'double') { addFe(fe, 'reklam ödülü: 2x'); b.innerHTML = '<i>✓</i><span>Ödül alındı<b>+' + fe + ' tüy</b></span>'; const t = $('endRows').querySelector('.tot b'); if (t) t.textContent = '+' + fe * 2 + ' tüy'; }
    else reviveRun();
  };
}
function reviveRun() { // continue the same hole with two more shots
  P.revived = 1; P.bonus = (P.bonus || 0) + AD_CFG.extraShots; show('endL', false); show('hud', true); state = 'play'; if (window.FlixAds) window.FlixAds.setScreen('game');
  P.body = null; P.phase = 'aim'; placeToy(P.from); toyRoot.quaternion.identity(); tuyUI(); P.yaw = autoYaw(P.from); camMode = 'aim'; hudShots(); toast('+' + AD_CFG.extraShots + ' ATIŞ', 'devam!', '#2fa84f');
}
const row = (a, b) => `<div class="row"><span>${a}</span><b>+${b}</b></div>`;
function lose() {
  P.phase = 'lost'; SFX.fail();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = 'OLMADI!'; $('endT').className = 'big meh'; $('endW').innerHTML = `${SHOT_LIMIT + (P.bonus || 0)} atış hakkın bitti. Bir daha dene!`;
    $('endStars').innerHTML = ''; $('endRows').innerHTML = '<div class="row"><span>İpucu: atmadan önce sağa sola kaydırıp yolu seç, harita tuşuyla tüm sokağa bak.</span></div>';
    $('retry3').hidden = true; $('next').querySelector('b').textContent = 'TEKRAR'; $('next').onclick = async () => { await maybeLoseAd(); startLevel(cur); }; endAd(P.revived ? null : 'revive'); if (window.FlixAds) window.FlixAds.setScreen('over');
  }, BOT ? 50 : 1000);
}

// ================= EFFECTS =================
const parts = [];
const pGeo = new THREE.BoxGeometry(0.16, 0.16, 0.03);
for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({color: 0xffffff})); m.visible = false; scene.add(m); parts.push({m, life: 0, v: new V3()}); }
function confetti(x, y, z) { const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xffffff]; for (const p of parts) { p.life = 1 + Math.random() * 0.6; p.m.material.color.setHex(cols[(Math.random() * 5) | 0]); p.m.position.set(x, y, z); p.v.set((Math.random() - 0.5) * 6, 5 + Math.random() * 6, (Math.random() - 0.5) * 6); p.m.visible = true; } }
function sparks(p, col) { let n = 0; for (const q of parts) { if (q.life > 0) continue; q.life = 0.5; q.m.material.color.setHex(col); q.m.position.copy(p); q.v.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 5); q.m.visible = true; if (++n > 10) break; } }
let squash = 0;
function puff(p) { let n = 0; for (const q of parts) { if (q.life > 0) continue; q.life = 0.35; q.m.material.color.setHex(0xd9d0c0); q.m.position.set(p.x, p.y - RAD + 0.05, p.z); q.v.set((Math.random() - 0.5) * 3, Math.random() * 1.2, (Math.random() - 0.5) * 3); q.m.visible = true; if (++n > 7) break; } }
// toy trail
const trailN = 26, trailPos = new Float32Array(trailN * 3), trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
const trailCol = new Float32Array(trailN * 3); trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));
const dotTex = ctex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 4, 32, 32, 30); g.addColorStop(0, '#fff'); g.addColorStop(0.65, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); });
const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({size: 0.2, map: dotTex, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false})); trail.frustumCulled = false; scene.add(trail); let trailK = 0;

const _tc = new THREE.Color();
function trailColor(k) { if (trailDef.rainbow) return _tc.setHSL((k * 0.045) % 1, 0.9, 0.55); const c = trailDef.cols; return _tc.setHex(c[k % c.length]); }

// ================= CAMERA =================
let camMode = 'aim';
const camPos = new V3(), camLook = new V3(), wantPos = new V3(), wantLook = new V3(), fwd = new V3();
function camWanted() {
  const tp = toyRoot.position;
  if (camMode === 'map' || state !== 'play' && state !== 'pause' && state !== 'end') {
    const bb = levelBounds(), cx = (bb.x0 + bb.x1) / 2, cz = (bb.z0 + bb.z1) / 2, span = Math.max(bb.x1 - bb.x0, (bb.z1 - bb.z0) * 0.6);
    wantLook.set(cx, 0, cz); wantPos.set(cx + span * 0.12, span * 1.25 + 8, cz + span * 0.55 + 6);
    if (state === 'shop') { const b = startPos(LV), S = shopTab === 'npc' ? [9.2, 1.7, -1.75] : shopTab === 'ani' ? [7.4, 1.2, -1.45] : shopTab === 'trail' ? [7.4, 1.2, -1.0] : [7.6, 1.3, -1.6]; wantLook.set(b.x, b.y + S[2], b.z); wantPos.set(b.x, b.y + S[1], b.z + S[0]); return; }
    if (state === 'home') { const b = startPos(LV), a = Math.sin(T * 0.35) * 0.45; wantLook.set(b.x, b.y + 1.0, b.z); wantPos.set(b.x + Math.sin(a) * 5, b.y + 1.1, b.z + Math.cos(a) * 5); }
    return;
  }
  if (camMode === 'fly' && P.body) {
    const v = P.body.v; fwd.set(v.x, 0, v.z); if (fwd.lengthSq() < 0.5) fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw)); fwd.normalize();
    wantPos.copy(tp).addScaledVector(fwd, -5.6); wantPos.y = Math.max(tp.y + 2.4, P.from.y + 2.0);
    wantLook.copy(tp).addScaledVector(fwd, 2.5); wantLook.y = tp.y * 0.6 + P.from.y * 0.4;
    return;
  }
  if (camMode === 'win') { wantLook.set(bucket.x, bucket.rimY, bucket.z); const wy = P.yaw + Math.sin((T - (P.winT || T)) * 0.6) * 0.45; fwd.set(Math.sin(wy), 0, -Math.cos(wy)); wantPos.set(bucket.x, bucket.rimY + 2.6, bucket.z).addScaledVector(fwd, -5); return; }
  fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw));
  wantPos.copy(tp).addScaledVector(fwd, -6.4); wantPos.y = tp.y + 3.1;
  wantLook.copy(tp).addScaledVector(fwd, 5.5); wantLook.y = tp.y + 0.5;
}
const OCC = []; const _ray = new THREE.Ray(), _hp = new V3(), _cd = new V3(), _tp2 = new V3();
function occAlpha(o, a) {
  if (!o.mats) { o.mats = []; o.g.traverse((m) => { if (!m.isMesh) return; if (m.userData.noInk && m.parent && m.parent.isMesh) { o.mats.push({ink: m}); return; } const arr = Array.isArray(m.material), ms = (arr ? m.material : [m.material]).map((q) => { const c = q.clone(); c.userData.op0 = q.transparent ? q.opacity : 1; c.userData.tr0 = q.transparent; return c; }); m.material = arr ? ms : ms[0]; o.mats.push({m, ms}); }); }
  for (const e of o.mats) { if (e.ink) e.ink.visible = a > 0.97; else { e.m.castShadow = true; for (const q of e.ms) { q.transparent = a < 0.99 || q.userData.tr0; q.opacity = q.userData.op0 * a; q.depthWrite = a > 0.97; } } }
  o.cur = a;
}
function fadeOcc(dt) {
  if (!OCC.length) return; const on = (state === 'play' || state === 'end' || state === 'pause') && camMode !== 'map' && !(P.intro > 1.2);
  const cp = camera.position, tp = toyRoot.position;
  for (const o of OCC) {
    let want = 1;
    if (on) for (const ty of [0.05, 0.8]) { _tp2.set(tp.x, tp.y + ty, tp.z); _cd.subVectors(_tp2, cp); const len = _cd.length(); if (len < 0.01) break; _ray.set(cp, _cd.divideScalar(len)); if (o.box.containsPoint(cp) || (_ray.intersectBox(o.box, _hp) && _hp.distanceTo(cp) < len - 0.35)) { want = 0.18; break; } }
    o.a += (want - o.a) * Math.min(1, dt * 10);
    const a = o.a > 0.985 ? 1 : o.a; if (Math.abs(a - o.cur) > 0.02 || (a === 1 && o.cur !== 1)) occAlpha(o, a);
  }
}
let CAMB = null, CAMB_LV = null;
function camBoxes() { if (CAMB_LV !== LV) { CAMB_LV = LV; CAMB = boxes.filter((o) => o.kind === 'hard' && o.b[1] - o.b[0] > 0.4 && o.b[5] - o.b[4] > 0.4 && o.b[3] - o.b[2] > 0.8); } return CAMB; }
const _cq = new V3(), _cb = new V3();
function segHit(a, b) { const L = camBoxes(); for (let k = 1; k <= 12; k++) { _cq.lerpVectors(a, b, k / 12); for (const o of L) if (_cq.x > o.b[0] - 0.25 && _cq.x < o.b[1] + 0.25 && _cq.z > o.b[4] - 0.25 && _cq.z < o.b[5] + 0.25 && _cq.y < o.b[3] + 0.3 && _cq.y > o.b[2]) return true; } return false; }
function camBlock() { // only when the camera would sit inside something: pull in, then rise over it (walls in between just fade)
  const tp = toyRoot.position; if (camMode === 'map' || state === 'home' || state === 'shop') return;
  const inside = (p) => { for (const o of camBoxes()) if (p.x > o.b[0] - 0.3 && p.x < o.b[1] + 0.3 && p.z > o.b[4] - 0.3 && p.z < o.b[5] + 0.3 && p.y < o.b[3] + 0.4 && p.y > o.b[2] - 0.5) return o; return null; };
  const o = inside(wantPos); if (!o) return;
  _cb.copy(wantPos);
  for (const f of [0.82, 0.66, 0.5, 0.38]) { wantPos.lerpVectors(tp, _cb, f); wantPos.y = Math.max(_cb.y, tp.y + 1.7); if (!inside(wantPos)) return; }
  wantPos.copy(_cb); wantPos.y = Math.max(_cb.y, o.b[3] + 0.9); wantLook.y = Math.min(wantLook.y, tp.y + 0.2);
}
function snapCam() { camWanted(); camPos.copy(wantPos); camLook.copy(wantLook); }
function updateCam(dt) {
  if (P.intro > 0 && state === 'play') { P.intro -= dt; if (P.intro > 1.2) { const m = camMode; camMode = 'map'; camWanted(); camMode = m; } else camWanted(); }
  else camWanted();
  camBlock();
  const k = 1 - Math.exp(-dt * (camMode === 'fly' ? 8 : camMode === 'map' ? (state === 'shop' ? 5 : 3) : P.intro > 0 ? 2.2 : 6));
  camPos.lerp(wantPos, k); camLook.lerp(wantLook, k);
  camera.position.copy(camPos); camera.lookAt(camLook);
  fadeOcc(dt);
}

// ================= SCREENS =================
function starTotal() { return Object.values(SAVE.lv).reduce((a, b) => a + (b.s || 0), 0); }
const WIDX = (i) => Math.floor(i / PER_WORLD), WLOC = (i) => i % PER_WORLD, lvDone = (i) => !!(SAVE.lv[i] && SAVE.lv[i].done);
function worldReady(w) { return w === 0 || lvDone((w - 1) * PER_WORLD + FREE_LEVELS - 1); }
function worldOpen(w) { return w === 0 || !!(SAVE.wOwn && SAVE.wOwn[w]); }
function worldCount(w) { let n = 0; for (let k = 0; k < PER_WORLD; k++) if (lvDone(w * PER_WORLD + k)) n++; return n; }
function curWorld() { const w = SAVE.world | 0; return w >= 0 && w < WORLDS.length && worldOpen(w) ? w : 0; }
function nextLevel(w = curWorld()) { for (let k = 0; k < PER_WORLD; k++) if (!lvDone(w * PER_WORLD + k)) return w * PER_WORLD + k; return w * PER_WORLD + PER_WORLD - 1; }
function worldLockedMsg(w) {
  const W = WORLDS[w], P0 = WORLDS[w - 1];
  if (!worldReady(w)) { dlg(W.name, 'KİLİTLİ', `<p><b>${W.name}</b> haritasını açmak için önce <b>${P0.name}</b> haritasında <b>10. bölümü</b> geç. Sonra <b>${fmtN(W.cost)} tüy</b> ile açarsın.</p>`, [{t: 'Tamam', c: 'ok'}]); return; }
  dlg(W.name, 'YENİ HARİTA', `<p><b>${W.name}</b> · ${W.sub}: 20 yeni bölüm. Açmak için <b>${fmtN(W.cost)} tüy</b> gerekiyor.${SAVE.fe < W.cost ? `<br>Sende ${fmtN(SAVE.fe)} tüy var, <b>${fmtN(W.cost - SAVE.fe)}</b> tüy daha lazım. Bölüm oynayarak, günlük hediyeyle ya da reklam izleyerek tüy toplayabilirsin.` : ''}</p>`,
    [{t: fmtN(W.cost) + ' tüy ile aç', c: SAVE.fe >= W.cost ? 'ok' : 'dim', f: () => buyWorld(w)}, {t: 'Vazgeç'}]);
}
function buyWorld(w) {
  const W = WORLDS[w]; if (SAVE.fe < W.cost) { toastShop('Yetersiz tüy', fmtN(W.cost - SAVE.fe) + ' tüy daha lazım'); return; }
  addFe(-W.cost); SAVE.wOwn = SAVE.wOwn || {}; SAVE.wOwn[w] = 1; SAVE.world = w; save(); SFX.win(); buzz([20, 30, 20]); toastShop(W.name + ' AÇILDI!', '20 yeni bölüm'); if (state === 'levels') openLevels(); else if (state === 'home') openHome();
}
function pickWorld(w) { if (!worldOpen(w)) { worldLockedMsg(w); return false; } SAVE.world = w; save(); return true; }
function playLevel(i) { const w = WIDX(i); if (!worldOpen(w)) { worldLockedMsg(w); return; } if (levelLocked(i)) { openPack(); return; } SAVE.world = w; save(); audio(); startLevel(i); }
const FE_SVG = '<svg viewBox="0 0 20 24" width="10" height="12"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="2"/></svg>';
const LOCK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.6" fill="none"/></svg>';
function worldCards(id, onPick) {
  const cw = curWorld(), el = $(id);
  el.innerHTML = WORLDS.map((W, w) => { const op = worldOpen(w), rd = worldReady(w); return `<button class="wc${w === cw ? ' on' : ''}${op ? '' : ' lock'}${!op && rd ? ' buy' : ''}" data-w="${w}" style="--wc:${W.col}"><b>${W.name}</b><small>${op ? worldCount(w) + '/' + PER_WORLD : rd ? FE_SVG + fmtN(W.cost) : LOCK_SVG + ' kilitli'}</small></button>`; }).join('');
  const on = el.querySelector('.wc.on'); if (on) el.scrollLeft = Math.max(0, on.offsetLeft - el.clientWidth / 2 + on.offsetWidth / 2);
  el.querySelectorAll('.wc').forEach((b) => b.addEventListener('click', () => { SFX.tap && SFX.tap(); if (pickWorld(+b.dataset.w)) onPick(); }));
}
function openHome() {
  state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('homeL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');
  $('starsH').textContent = starTotal() + '/' + LEVELS.length * 3;
  const n = nextLevel(); $('playSub').textContent = WORLDS[WIDX(n)].name + ' · ' + (WLOC(n) + 1) + '. bölüm'; dailyUI(); worldCards('wpick', openHome);
  if (!LV || cur !== 0) { cur = 0; buildLevel(0); } placeToy(startPos(LV)); P.phase = 'home'; P.body = null; camMode = 'map'; snapCam();
}
function openLevels() {
  state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('levelsL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');
  const done = (i) => SAVE.lv[i] && SAVE.lv[i].done; let html = '';
  const tot = starTotal(); $('lvProg').style.width = (tot / (LEVELS.length * 3) * 100).toFixed(1) + '%'; $('lvProgT').textContent = tot + ' / ' + LEVELS.length * 3;
  const wv = curWorld(); worldCards('wtabs', openLevels); $('lvWorld').textContent = WORLDS[wv].name + ' · ' + WORLDS[wv].sub;
  for (let i = wv * PER_WORLD; i < (wv + 1) * PER_WORLD; i++) {
    const L = LEVELS[i], li = WLOC(i), paid = levelLocked(i), open = !paid && (li === 0 || done(i - 1) || done(i)), sv = SAVE.lv[i] || {}, nxt = open && !done(i);
    if (li === 0) html += `<div class="sec"><b>20 BÖLÜM</b><span>${worldCount(wv)}/${PER_WORLD}</span></div>`;
    if (li === FREE_LEVELS && wv < WORLDS.length - 1) html += `<p class="wnote">${WORLDS[wv].name} 10. bölümü geçince <b>${WORLDS[wv + 1].name}</b> haritasını ${fmtN(WORLDS[wv + 1].cost)} tüy ile açabilirsin.</p>`;
    html += `<button class="lv${open ? '' : ' lock'}${paid ? ' paid' : ''}${nxt ? ' next' : ''}" data-i="${i}" ${open || paid ? '' : 'disabled'}>
      <div class="num big">${open ? li + 1 : '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10" width="14" height="11" rx="2" fill="#022753"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#022753" stroke-width="2.6" fill="none"/></svg>'}</div>
      <div class="info"><div class="nm">${L.name}${L.tut ? ' <i>ÖĞRETİCİ</i>' : ''}${L.g ? ' <i>AZ YERÇEKİMİ</i>' : ''}</div><div class="meta">Par ${L.par}${L.wind ? ' · rüzgâr' : ''}${sv.best && sv.best < 99 ? ' · en iyi ' + sv.best + ' atış' : ''}</div></div>
      <div class="st">${[0, 1, 2].map((k) => STAR(k < (sv.s || 0))).join('')}</div></button>`;
  }
  $('grid').innerHTML = html; $('grid').querySelectorAll('.lv:not(.lock), .lv.paid').forEach((b) => b.addEventListener('click', () => playLevel(+b.dataset.i))); const pb = $('packBar'); if (pb) pb.addEventListener('click', openPack);
}
function pause(on) { if (on && state === 'play') { state = 'pause'; show('pauseL', true); aim = null; previewAim(); } else if (!on && state === 'pause') { state = 'play'; show('pauseL', false); last = performance.now(); } }
function setUI() { $('restRow').hidden = !NATIVE; $('adsT').textContent = SAVE.noads ? 'Kapalı ✓' : 'Açık'; $('sndT').textContent = SAVE.snd ? 'Açık' : 'Kapalı'; $('vibT').textContent = SAVE.vib === 0 ? 'Kapalı' : 'Açık'; $('sndT').parentNode.classList.toggle('off', !SAVE.snd); $('vibT').parentNode.classList.toggle('off', SAVE.vib === 0); }
$('play').addEventListener('click', () => playLevel(nextLevel()));
$('dailyB').addEventListener('click', () => { audio(); openDaily(); });
$('howB').addEventListener('click', () => { audio(); openHow(); });
$('lvlB').addEventListener('click', () => { audio(); openLevels(); });
$('setB').addEventListener('click', () => { show('setL', true); setUI(); });
$('setClose').addEventListener('click', () => show('setL', false));
$('shopB').addEventListener('click', () => { audio(); openShop('skin'); });
document.querySelectorAll('.feBtn').forEach((b) => b.addEventListener('click', () => { audio(); if (state === 'shop') { shopTab = 'fe'; renderShop(); } else if (state === 'home' || state === 'levels') openShop('fe'); }));
$('adsRow').addEventListener('click', () => { show('setL', false); openShop('fe'); });
$('restRow').addEventListener('click', async () => { if (!window.FlixNative) return; $('restT').textContent = '...'; try { await window.FlixNative.restore(); toastShop('Geri yüklendi', 'satın alımların kontrol edildi'); } catch (e) { toastShop('Geri yükleme olmadı', 'internet bağlantını kontrol et'); } $('restT').textContent = 'Geri yükle'; setUI(); });
$('sndRow').addEventListener('click', () => { SAVE.snd = SAVE.snd ? 0 : 1; save(); setUI(); if (SAVE.snd) audio(); });
$('vibRow').addEventListener('click', () => { SAVE.vib = SAVE.vib === 0 ? 1 : 0; save(); setUI(); buzz(15); });
$('back1').addEventListener('click', openHome); $('retry3').addEventListener('click', () => startLevel(cur)); $('menu2').addEventListener('click', openLevels); $('menu3').addEventListener('click', openLevels);
$('pauseB').addEventListener('click', () => pause(true)); $('resume').addEventListener('click', () => pause(false)); $('retryP').addEventListener('click', () => startLevel(cur));
$('homeP').addEventListener('click', openHome);
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(true); if (AC) AC.suspend(); } else if (AC) AC.resume(); });

// ================= TEST BOT =================
function botTick() {
  if (state === 'end' && window.__noNext) return;
  if (state === 'end') { if (!P.botNext) { P.botNext = 1; setTimeout(() => { P.botNext = 0; if (state === 'end' && $('next').querySelector('b').textContent !== 'BÖLÜMLER') $('next').onclick(); }, 100); } return; }
  if (state !== 'play') return;
  if (P.phase === 'aim' && !P.botWait) { P.botWait = 1; setTimeout(() => { P.botWait = 0; if (P.phase !== 'aim' || state !== 'play') return; const s = solveShot(P.from), nz = window.__noise || 0, gr = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; P.yaw = s.ang + gr() * nz * 0.12; shoot(clamp(s.pow + gr() * nz * 0.1, 0.05, 1)); P.body.autoOpen = s.open; }, 150); }
}

// ================= FRAME =================
let last = performance.now(), T = 0, acc = 0;
const qT = new THREE.Quaternion(), upV = new V3(0, 1, 0), tmp = new V3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (BOT) botTick();
  if (state === 'play' && P.phase === 'fly' && P.body) {
    if (!P.map) camMode = 'fly';
    if (P.body.jug) { jugTick(P.body, dt); acc = 0; } else acc += dt; const lvp = lvPhys();
    while (acc >= 1 / 120 && !P.body.jug) {
      acc -= 1 / 120;
      const before = P.body.got.slice(), vy0 = P.body.v.length();
      const h = stepBody(P.body, 1 / 120, LV.wind, lvp);
      if (h === 'actor') { if (reactActor(P.body.lastA, P.body.p)) { P.reacts = (P.reacts || 0) + 1; squash = 0.8; if (startJuggle(P.body, P.body.lastA)) break; } }
      else if (h === 'bounce') { SFX.bounce(); squash = 1; buzz(10); } else if (h === 'cloth') { SFX.flap(); squash = 0.45; buzz(6); } else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; if (P.body.ground && vy0 > 4) puff(P.body.p); }
      P.body.got.forEach((g, k) => { if (g && !before[k] && !P.got[k]) { P.got[k] = true; stars[k].m.visible = false; sparks(stars[k].p, 0xffc20e); SFX.star(P.got.filter(Boolean).length - 1); hudFeathers(); } });
      if (P.body.done) { const B = P.body; placeToy(B.p); endShot(B); break; }
    }
    if (P.body) { placeToy(P.body.p); tuyUI(); }
  }
  if (state !== 'pause') updateActors(dt);
  render(dt);
}
let homeKick = 0, homeSpin = 0;
function render(dt) {
  const hm = state === 'home' || state === 'shop'; scene.background = hm ? null : CUR_THEME === 'sokak' ? SKY : themeSky(CUR_THEME); if (world) world.visible = !hm; APP.classList.toggle('hm', hm);
  const B = P.body;
  if (world && world.visible) { flagsTick(T); for (const s of SPIN) s.rotation.z += dt * s.userData.spin; }
  if (B && P.phase === 'fly' && B.v.lengthSq() > 1) { tmp.copy(B.v).normalize().negate(); qT.setFromUnitVectors(upV, tmp); toyRoot.quaternion.slerp(qT, 0.18); }
  else toyRoot.quaternion.slerp(qT.identity(), 0.12);
  // home screen: the FLIX does kick-ups on the street
  if (state === 'shop') { const base = startPos(LV); if (shopTab === 'trail') toyRoot.position.set(base.x + Math.sin(T * 2.2) * 1.4, base.y + 1.2 + Math.sin(T * 4.4) * 0.45, base.z + Math.cos(T * 2.2) * 0.6); else toyRoot.position.set(base.x, base.y + 0.35 + Math.sin(T * 2) * 0.1, base.z); toyRoot.rotation.set(0.12, T * 0.6, 0); if (prevModel) prevModel.rotation.y = T * 0.5; }
  else if (state === 'home' || state === 'levels') { homeKick = Math.max(0, homeKick - dt * 0.9); const ph = (T * 1.25) % 1, base = startPos(LV); toyRoot.position.set(base.x, base.y + Math.sin(ph * Math.PI) * (0.9 + homeKick * 1.1), base.z); if (ph < 0.06) squash = Math.max(squash, 0.7); homeSpin += dt * (0.8 + homeKick * 9); toyRoot.rotation.set(Math.sin(T * 2.5) * 0.12, homeSpin, 0); }
  const open = B && B.open || state === 'shop' && shopTab === 'skin' ? 1 : 0; toyM.userData.op = lerp(toyM.userData.op || 0, open, 0.25);
  toyM.userData.fe.forEach((f, i) => { const k = i - 1; f.rotation.z = -k * (0.42 + toyM.userData.op * 0.75); f.rotation.x = (k === 0 ? -0.08 : 0.06) - toyM.userData.op * 0.6 + Math.sin(T * 20 + i) * 0.04 * (P.phase === 'fly' ? 1 : 0); });
  squash = Math.max(0, squash - dt * 5); const sq = squash; toyM.scale.set(TOYS * (1 + sq * 0.2), TOYS * (1 - sq * 0.25), TOYS * (1 + sq * 0.2));
  if (P.phase === 'aim' && aim && aim.pow !== null) { const k = aim.pow; toyM.scale.set(TOYS * (1 + k * 0.12), TOYS * (1 - k * 0.15), TOYS * (1 + k * 0.12)); }
  // aim arrow on the ground
  arrowG.visible = state === 'play' && P.phase === 'aim' && !P.map; if (arrowG.visible) { arrowG.position.set(P.from.x, P.from.y - RAD + 0.05, P.from.z); arrowG.rotation.y = -P.yaw; aimArrow.position.z = -1.0 - Math.sin(T * 5) * 0.12; }
  // trail
  const emit = P.phase === 'fly' && B ? B.p : state === 'shop' && shopTab === 'trail' ? toyRoot.position : null;
  if (emit) { const k = trailK++ % trailN; trailPos.set([emit.x, emit.y, emit.z], k * 3); trailCol.set(trailColor(trailK).toArray(), k * 3); trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true; trail.visible = true; trail.material.size = (trailDef.big ? 0.3 : 0.2) * (B && B.open ? 1.25 : 1); trail.material.opacity = trailDef.twinkle ? 0.65 + Math.sin(T * 30) * 0.3 : 0.9; } else if (trail.visible) { trail.visible = false; trailPos.fill(0); trailK = 0; }
  const tp = toyRoot.position, I = LV && islandAt(tp.x, tp.z);
  toyShadow.visible = !!I && state !== 'home'; if (I) { toyShadow.position.set(tp.x, I.top + 0.02, tp.z); toyShadow.material.opacity = clamp(0.35 - (tp.y - I.top) * 0.03, 0.05, 0.35); }
  for (const s of stars) { s.m.rotation.y = T * 2; s.m.position.y = s.p.y + Math.sin(T * 3 + s.p.x) * 0.1; }
  if (bucket) { bucket.flag.rotation.y = Math.sin(T * 3) * 0.3; bucket.glow.material.opacity = 0.35 + Math.sin(T * 4) * 0.2; bucket.beam.material.opacity = 0.1 + Math.sin(T * 2) * 0.04; if (P.celebrate > 0) { P.celebrate = Math.max(0, P.celebrate - dt * 1.5); const s = 1 + Math.sin(P.celebrate * 18) * 0.12 * P.celebrate; bucket.g.scale.set(s, 1 / s, s); } }
  if (sock) { const w = LV.wind || 0.4; sock.rotation.z = Math.PI / 2 - Math.sign(w || 1) * 0.15 + Math.sin(T * 5) * 0.08; sock.rotation.order = 'YXZ'; sock.rotation.y = w >= 0 ? 0 : Math.PI; sock.position.x = sock.userData.base.x + 0.45 * Math.sign(w || 1); }
  for (const p of parts) if (p.life > 0) { p.life -= dt; p.v.y -= 12 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += dt * 9; p.m.rotation.y += dt * 7; if (p.life <= 0) p.m.visible = false; }
  if (!window.__freezeCam) updateCam(dt);
  sun.target.position.copy(tp); sun.position.copy(tp).add(tmp.set(8, 20, 7));
  renderer.render(scene, camera);
}
function resize() { renderer.setSize(VW(), VH()); camera.aspect = VW() / VH(); camera.updateProjectionMatrix(); const land = matchMedia('(pointer:coarse)').matches && innerWidth > innerHeight * 1.15; $('rotL').hidden = !land; if (land && state === 'play') pause(true); }
addEventListener('resize', resize);
// ================= ECONOMY: tüy (feathers) currency, cosmetics, ads, in-app purchases =================
const SKINS0 = [ // body, three feathers, finish
  {id: 'klasik', name: 'Klasik', price: 0, body: 0xe22511, fe: [0x1f6fd1, 0x2fa84f, 0xffc20e]},
  {id: 'okyanus', name: 'Okyanus', price: 300, body: 0x1f6fd1, fe: [0x5fd3e6, 0xffffff, 0x0d3f8a]},
  {id: 'orman', name: 'Orman', price: 300, body: 0x2f7a3a, fe: [0x9ad13a, 0x3f8a3a, 0xc8a060]},
  {id: 'seker', name: 'Pamuk Şeker', price: 600, body: 0xff8fb8, fe: [0xffffff, 0xb8e0ff, 0xffd1e6]},
  {id: 'gunbatimi', name: 'Gün Batımı', price: 900, body: 0xff7a1a, fe: [0xffc20e, 0xe22511, 0x7a4fb0]},
  {id: 'bayrak', name: 'Ay Yıldız', price: 1200, body: 0xe22511, fe: [0xffffff, 0xe22511, 0xffffff]},
  {id: 'gece', name: 'Gece', price: 1800, body: 0x1b1330, fe: [0x00e5ff, 0xff2bd6, 0x9dff00], glow: 0.7},
  {id: 'buz', name: 'Buz', price: 2500, body: 0xbfe9ff, fe: [0xffffff, 0x8fd8ff, 0xd8f4ff], glow: 0.35},
  {id: 'altin', name: 'Altın', price: 4000, body: 0xffc20e, fe: [0xffe27a, 0xffb000, 0xfff1b8], metal: 0.6, glow: 0.25},
  {id: 'ejder', name: 'Ejderha', price: 8000, body: 0x2a0d0d, fe: [0xff3a00, 0xffc20e, 0xff3a00], metal: 0.3, glow: 0.9},
  {id: 'nane', name: 'Nane', price: 250, body: 0x6ad8b0, fe: [0xffffff, 0x2fa87a, 0xb8f4e0]},
  {id: 'kiraz', name: 'Kiraz', price: 350, body: 0xb8102e, fe: [0x2f8a3a, 0xe8203a, 0x2f8a3a]},
  {id: 'karpuz', name: 'Karpuz', price: 500, body: 0x2f8a3a, fe: [0xff4a5a, 0x1b1330, 0xff4a5a]},
  {id: 'ari', name: 'Bal Arısı', price: 800, body: 0xffc20e, fe: [0x1b1330, 0xffffff, 0x1b1330]},
  {id: 'lale', name: 'Lale', price: 1000, body: 0xe22511, fe: [0xff8fb8, 0xffc20e, 0x7a4fb0]},
  {id: 'zumrut', name: 'Zümrüt', price: 1500, body: 0x0f7a4a, fe: [0x5ae8a0, 0xffffff, 0x0f7a4a], metal: 0.4, glow: 0.2},
  {id: 'lav', name: 'Lav', price: 2200, body: 0x3a1010, fe: [0xff5a00, 0xffc20e, 0xff2a00], glow: 0.8},
  {id: 'neon', name: 'Neon', price: 3000, body: 0x0a0a1a, fe: [0x00ffd0, 0xff00c8, 0xfff200], glow: 1.0},
  {id: 'galaksi', name: 'Galaksi', price: 5000, body: 0x2a1a6a, fe: [0xb8a0ff, 0x5ad8ff, 0xff8fe8], metal: 0.3, glow: 0.6},
  {id: 'krom', name: 'Krom', price: 12000, body: 0xd8dce4, fe: [0xffffff, 0xb8c0cc, 0xffffff], metal: 0.95, glow: 0.1},
];
const SKINS = SKINS0.slice().sort((a, b) => a.price - b.price);
const TRAILS = [
  {id: 'sari', name: 'Sarı İz', price: 0, cols: [0xffc20e]},
  {id: 'gokkusagi', name: 'Gökkuşağı', price: 500, rainbow: 1},
  {id: 'ates', name: 'Ateş', price: 900, cols: [0xffc20e, 0xff7a1a, 0xe22511]},
  {id: 'buz', name: 'Buz', price: 900, cols: [0xffffff, 0x8fd8ff, 0x5fb8ff]},
  {id: 'konfeti', name: 'Konfeti', price: 1500, cols: [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xff8fb8], big: 1},
  {id: 'yildiz', name: 'Yıldız Tozu', price: 2500, cols: [0xfff1b8, 0xffffff, 0xffc20e], big: 1, twinkle: 1},
  {id: 'nane_t', name: 'Nane', price: 400, cols: [0xb8f4e0, 0x6ad8b0]},
  {id: 'kalp', name: 'Kalpler', price: 1200, cols: [0xff4a8a, 0xff8fb8, 0xffffff], big: 1},
  {id: 'zehir', name: 'Zehir', price: 1800, cols: [0x9dff00, 0x2fa84f, 0x1b1330]},
  {id: 'galaksi_t', name: 'Galaksi', price: 3500, cols: [0xb8a0ff, 0x5ad8ff, 0xff8fe8, 0xffffff], big: 1, twinkle: 1},
];
// in-app products (ids must match App Store Connect); prices are the fallbacks shown until the store loads
const PACKS = [
  {id: 'atis_feathers_500', fe: 500, price: '₺39,99'},
  {id: 'atis_feathers_1200', fe: 1200, price: '₺79,99', tag: '+%20'},
  {id: 'atis_feathers_3500', fe: 3500, price: '₺199,99', tag: '+%40'},
  {id: 'atis_feathers_8000', fe: 8000, price: '₺399,99', tag: 'EN POPÜLER'},
  {id: 'atis_feathers_20000', fe: 20000, price: '₺799,99', tag: 'EN AVANTAJLI'},
];
const STARTER = {id: 'atis_starter', fe: 2500, skin: 'gece', price: '₺119,99'};
const NOADS = {id: 'atis_noads', price: '₺119,99'};
const PACK2 = {id: 'atis_sokak2', price: '₺119,99', fe: 20000}, FREE_LEVELS = 10;
const DAILY = [50, 75, 100, 150, 200, 250, 500];
const AD_CFG = {interEvery: 3, interFromLevel: 3, freeFe: 60, freeCooldownMin: 8, freePerDay: 6, doubleEnd: 1, extraShots: 2};
SAVE.own = SAVE.own || {klasik: 1, sari: 1}; SAVE.skin = SAVE.skin || 'klasik'; SAVE.trail = SAVE.trail || 'sari';
if (!SAVE.v7) { const o = SAVE.lv || {}, n = {}; for (const k in o) { const i = +k; n[i < 20 ? i : i < 40 ? i + 20 : i < 60 ? i + 20 : i + 100] = o[k]; } SAVE.lv = n; SAVE.wOwn = {}; const d = (i) => n[i] && n[i].done;
  if (d(9)) SAVE.wOwn[1] = SAVE.wOwn[2] = 1; if (d(49)) SAVE.wOwn[3] = 1; if (d(69)) SAVE.wOwn[8] = 1; SAVE.world = [0, 2, 3, 8][SAVE.world | 0] || 0; SAVE.v7 = 1; }
SAVE.wOwn = SAVE.wOwn || {};
SAVE.npc = SAVE.npc || 'mahalle'; SAVE.ani = SAVE.ani || 'normal'; SAVE.daily = SAVE.daily || {last: '', streak: 0}; SAVE.loses = SAVE.loses || 0;
SAVE.tx = SAVE.tx || []; SAVE.wins = SAVE.wins || 0; SAVE.ads = SAVE.ads || {day: '', n: 0, last: 0};
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

// ---- currency ----
function addFe(n, why) { SAVE.fe = Math.max(0, (SAVE.fe || 0) + n); save(); feUI(); if (n > 0 && why) toastShop('+' + n + ' tüy', why); }
function feUI() { document.querySelectorAll('.feN').forEach((e) => { e.textContent = fmtN(SAVE.fe || 0); }); }
const fmtN = (n) => n.toLocaleString('tr-TR');
function toastShop(a, b) { const el = $('shopToast'); el.innerHTML = `<b>${a}</b>${b ? '<span>' + b + '</span>' : ''}`; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }

// ---- cosmetics on the 3D toy ----
const toyBody = toyM.children.find((m) => m.isMesh && m.geometry.type === 'LatheGeometry');
const toyFeMats = toyM.userData.fe.map((p) => p.children.find((m) => m.isMesh && m.geometry.type === 'PlaneGeometry').material);
function applySkin(id) { const S = SKINS.find((s) => s.id === id) || SKINS[0]; applySkinTo(toyM, S); }
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
let trailDef = TRAILS[0];
function applyTrail(id) { trailDef = TRAILS.find((t) => t.id === id) || TRAILS[0]; }
function equipAll() { applySkin(SAVE.skin); applyTrail(SAVE.trail); }

// ---- ads (AdMob in the app, a FLIX toy ad on the web) ----
function webAd(kind) { // the web build has no ad network: shows our own FLIX ad card so the flow can be tried
  return new Promise((res) => {
    const L = $('adL'), sec = kind === 'rewarded' ? 5 : 3; let left = sec; show('adL', true); $('adKind').textContent = kind === 'rewarded' ? 'ÖDÜLLÜ REKLAM' : 'REKLAM';
    const close = $('adClose'); close.disabled = true; close.textContent = left;
    const t = setInterval(() => { left--; if (left > 0) close.textContent = left; else { clearInterval(t); close.disabled = false; close.textContent = '✕'; } }, 1000);
    close.onclick = () => { if (close.disabled) return; show('adL', false); res(kind === 'rewarded' ? 'rewarded' : true); };
  });
}
let lastRewardAt = 0;
async function adRewarded(which) { let r; if (window.FlixAds) r = await window.FlixAds.showRewarded(which === 'shots' ? 8000 : 5000, which || 'fe'); else if (NATIVE) r = 'unavailable'; else r = await webAd('rewarded'); if (r !== 'unavailable') lastRewardAt = Date.now(); return r; }
async function adInterstitial() { if (SAVE.noads || Date.now() - lastRewardAt < 90000) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); if (NATIVE) return false; return webAd('inter'); }
function adTurn() { SAVE.adN = (SAVE.adN || 0) + 1; save(); if (SAVE.noads || BOT || cur < AD_CFG.interFromLevel) return Promise.resolve(false); if (SAVE.adN % AD_CFG.interEvery) return Promise.resolve(false); return adInterstitial(); }
function maybeInterstitial() { SAVE.wins++; save(); return adTurn(); }
function freeFeState() { const d = new Date().toDateString(); if (SAVE.ads.day !== d) { SAVE.ads.day = d; SAVE.ads.n = 0; } const wait = SAVE.ads.last + AD_CFG.freeCooldownMin * 60000 - Date.now(); return {left: AD_CFG.freePerDay - SAVE.ads.n, wait: Math.max(0, wait)}; }

// ---- purchases ----
function priceOf(p) { return (window.FlixNative && window.FlixNative.price(p.id)) || p.price; }
function grant(id, tx) {
  if (tx) { if (SAVE.tx.includes(tx)) return; SAVE.tx.push(tx); if (SAVE.tx.length > 60) SAVE.tx.shift(); }
  const pk = PACKS.find((p) => p.id === id);
  if (pk) addFe(pk.fe, 'satın alındı');
  else if (id === STARTER.id) { if (!SAVE.starter) { SAVE.starter = 1; SAVE.own[STARTER.skin] = 1; addFe(STARTER.fe, 'Başlangıç Paketi'); } }
  else if (id === PACK2.id) { if (!SAVE.pack2) { SAVE.pack2 = 1; toastShop('Bölüm paketi açıldı', '4 dünyada 40 yeni bölüm'); if (state === 'levels') openLevels(); } }
  else if (id === NOADS.id) { SAVE.noads = 1; if (window.FlixAds) window.FlixAds.setAdsRemoved(true); toastShop('Reklamlar kapandı', 'teşekkürler!'); }
  save(); if (!$('shopL').hidden) renderShop();
}
window.__atisGrant = grant;
if (window.FlixNative && window.FlixNative.flush) setTimeout(() => window.FlixNative.flush(), 0);
if (SAVE.noads && window.FlixAds) window.FlixAds.setAdsRemoved(true);
addEventListener('flixprices', () => { if (!$('shopL').hidden) renderShop(); });
async function buyProduct(p) {
  if (NATIVE && window.FlixNative) { const r = await window.FlixNative.buy(p.id); if (r === 'pending') toastShop('Onay bekleniyor', 'aile onayı gelince eklenecek'); else if (!r) toastShop('Satın alma tamamlanmadı'); return; }
  // web: a clearly marked demo (no money is taken)
  $('payT').textContent = p.title; $('payP').textContent = priceOf(p); show('payL', true);
  $('payOk').onclick = () => { show('payL', false); grant(p.id, 'web-' + Date.now()); }; $('payNo').onclick = () => show('payL', false);
}

// ---- shop screen ----
let shopTab = 'skin', tryOn = null;
const toySVG = (S) => `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2"><path d="M30 30 C16 22 8 8 14 2 C22 6 28 18 30 30z" fill="#${S.fe[0].toString(16).padStart(6, '0')}"/><path d="M30 30 C26 16 26 4 30 0 C34 4 34 16 30 30z" fill="#${S.fe[1].toString(16).padStart(6, '0')}"/><path d="M30 30 C44 22 52 8 46 2 C38 6 32 18 30 30z" fill="#${S.fe[2].toString(16).padStart(6, '0')}"/><path d="M14 36 Q30 28 46 36 Q46 56 30 58 Q14 56 14 36z" fill="#${S.body.toString(16).padStart(6, '0')}"/><path d="M14 38 Q30 46 46 38" fill="none" stroke="#022753" stroke-width="3"/></g></svg>`;
const trailSVG = (T) => { const c = T.rainbow ? ['#e22511', '#ff7a1a', '#ffc20e', '#2fa84f', '#1f6fd1', '#7a4fb0'] : T.cols.map((v) => '#' + v.toString(16).padStart(6, '0')); return `<svg viewBox="0 0 60 64">${Array.from({length: 7}, (_, k) => `<circle cx="${8 + k * 7.5}" cy="${48 - Math.sin(k / 6 * Math.PI) * 30}" r="${(T.big ? 4.5 : 3.2) + k * 0.4}" fill="${c[k % c.length]}" stroke="#1b1330" stroke-width="1.2"/>`).join('')}</svg>`; };
const RARITY = [[0, 'BAŞLANGIÇ', '#5a6a80'], [600, 'YAYGIN', '#5a8a3a'], [1500, 'NADİR', '#1f6fd1'], [3500, 'EPİK', '#7a4fb0'], [1e9, 'EFSANE', '#e8900a']];
function rarity(p) { return p === 0 ? RARITY[0] : RARITY.slice(1).find((r) => p <= r[0]); }
function shopInfo(id) { const el = $('shopInfo'); if (!el) return; const T = TABS[shopTab]; if (!T) { el.hidden = true; return; } const it = T.list.find((x) => x.id === (id || tryOn || SAVE[T.key])) || T.list[0], r = rarity(it.price); el.hidden = false; el.innerHTML = `<b>${it.name}</b><span style="background:${r[2]}">${r[1]}</span>`; }
function renderShop() {
  feUI(); shopPodium(true); shopInfo(); document.querySelectorAll('#shopTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === shopTab));
  const g = $('shopGrid'); let html = '';
  if (TABS[shopTab]) {
    const T = TABS[shopTab], list = T.list, eq = SAVE[T.key];
    for (const it of list) {
      const own = !!SAVE.own[ownKey(shopTab, it.id)] || it.price === 0, on = eq === it.id;
      const rr = rarity(it.price);
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}" style="--rc:${rr[2]}"><i class="rar">${rr[1]}</i><div class="pv">${shopTab === 'trail' ? T.svg(it) : thumbHTML(shopTab, it, T.svg)}</div><div class="nm">${it.name}</div>
        <div class="pr ${own ? (on ? 'on' : 'own') : (SAVE.fe >= it.price ? 'can' : 'no')}">${on ? 'SEÇİLİ' : own ? 'SEÇ' : '<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="2"/></svg>' + fmtN(it.price)}</div></button>`;
    }
  } else {
    const fs = freeFeState();
    html += `<button class="item wide free" id="freeFe" ${fs.left <= 0 || fs.wait > 0 ? 'disabled' : ''}><div class="pv big">▶</div><div class="nm">Reklam izle: <b>+${AD_CFG.freeFe} tüy</b><small>${fs.left <= 0 ? 'Bugünlük bitti' : fs.wait > 0 ? Math.ceil(fs.wait / 60000) + ' dk sonra' : 'Bugün ' + fs.left + ' hak'}</small></div></button>`;
    if (!SAVE.starter) html += `<button class="item wide deal" data-buy="${STARTER.id}"><div class="pv">${thumbHTML('skin', SKINS.find((s) => s.id === STARTER.skin), toySVG)}</div><div class="nm">Başlangıç Paketi<small>${fmtN(STARTER.fe)} tüy + Gece kostümü · tek sefer</small></div><div class="pr buy">${priceOf(STARTER)}</div></button>`;
    for (const p of PACKS) html += `<button class="item pack" data-buy="${p.id}">${p.tag ? `<i class="tg">${p.tag}</i>` : ''}<div class="pv fe">${'<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="1.6"/></svg>'.repeat(Math.min(4, 1 + PACKS.indexOf(p)))}</div><div class="nm">${fmtN(p.fe)} tüy</div><div class="pr buy">${priceOf(p)}</div></button>`;
    html += `<button class="item wide" data-buy="${NOADS.id}" ${SAVE.noads ? 'disabled' : ''}><div class="pv big">⊘</div><div class="nm">Reklamsız<small>${SAVE.noads ? 'Satın alındı' : 'Bölüm arası reklamlar kalkar, ödüllü reklamlar isteğe bağlı kalır'}</small></div><div class="pr buy">${SAVE.noads ? '✓' : priceOf(NOADS)}</div></button>`;
    html += `<div class="note">${NATIVE ? 'Ödemeler App Store üzerinden alınır.' : 'Web sürümü: ödeme ekranı demodur, gerçek ödeme alınmaz.'}</div>`;
  }
  g.innerHTML = html;
  g.querySelectorAll('.item[data-id]').forEach((b) => b.addEventListener('click', () => shopPick(b.dataset.id)));
  g.querySelectorAll('.item[data-buy]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.buy, p = PACKS.find((q) => q.id === id) || (id === STARTER.id ? {...STARTER, title: 'Başlangıç Paketi'} : id === PACK2.id ? {...PACK2, title: 'Sokak 2 paketi'} : {...NOADS, title: 'Reklamsız'}); buyProduct({...p, title: p.title || fmtN(p.fe) + ' tüy'}); }));
  const ff = $('freeFe'); if (ff) ff.addEventListener('click', async () => { if (ff.disabled) return; ff.disabled = true; const r = await adRewarded('fe'); if (r === 'rewarded') { SAVE.ads.n++; SAVE.ads.last = Date.now(); addFe(AD_CFG.freeFe, 'reklam ödülü'); renderShop(); } else { ff.disabled = false; toastShop('Reklam şu an yok', 'biraz sonra dene'); } });
}
function shopPick(id) {
  const T = TABS[shopTab], it = T.list.find((x) => x.id === id), key = ownKey(shopTab, id);
  const own = it.price === 0 || SAVE.own[key];
  T.apply(id);
  if (own) { SAVE[T.key] = id; tryOn = null; save(); tick(); }
  else if (tryOn === id) { // second tap on a previewed item buys it
    if (SAVE.fe >= it.price) { addFe(-it.price); SAVE.own[key] = 1; SAVE[T.key] = id; tryOn = null; save(); SFX.win(); buzz([20, 30, 20]); toastShop(it.name, 'senin oldu!'); }
    else { toastShop('Yetersiz tüy', 'bölüm bitir ya da tüy al'); shopTab = 'fe'; tryOn = null; equipAll(); shopPreview(); }
  } else { tryOn = id; toastShop(it.name, 'denemedesin · almak için tekrar dokun'); }
  renderShop();
}
let demoTrail = 0;
function openShop(tab) { state = 'shop'; shopTab = tab || 'skin'; tryOn = null; shopPreview(); ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'homeL'].forEach((id) => show(id, false)); show('shopL', true); renderShop(); render(0); snapCam(); if (window.FlixAds) window.FlixAds.setScreen('menu'); }
function closeShop() { show('shopL', false); state = 'home'; tryOn = null; equipAll(); shopPreview(); openHome(); }
$('shopTabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; shopTab = b.dataset.t; tryOn = null; equipAll(); shopPreview(); renderShop(); });
$('shopBack').addEventListener('click', closeShop);
equipAll(); feUI();

// ---- shop tabs, 3D preview of people / animals ----
const hx = (v) => '#' + v.toString(16).padStart(6, '0');
const npcSVG = (S) => { const c = hx(S.cloth || 0x2fa84f), p = hx(S.pants || 0x22304a); return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${S.cape ? `<path d="M18 22 L42 22 L46 52 L14 52z" fill="${hx(S.cape)}"/>` : ''}<rect x="22" y="40" width="7" height="20" fill="${p}"/><rect x="31" y="40" width="7" height="20" fill="${p}"/><rect x="19" y="21" width="22" height="22" rx="5" fill="${c}"/><circle cx="30" cy="13" r="8" fill="#f1c7a0"/>${S.hat === 'chef' ? '<path d="M22 8 Q22 -2 30 0 Q38 -2 38 8z" fill="#fff"/>' : S.hat === 'helmet' ? '<circle cx="30" cy="13" r="11" fill="rgba(191,230,255,.55)"/>' : S.hat === 'cap' ? '<path d="M21 9 Q30 2 39 9 L41 11 L19 11z" fill="#1f3f7a"/><rect x="28" y="5" width="4" height="3" fill="#ffc20e" stroke="none"/>' : S.hat === 'doc' ? '<path d="M22 11 Q30 1 38 11z" fill="#5a3a22"/><path d="M24 24 Q30 34 36 24" fill="none"/>' : S.hat === 'fire' ? '<path d="M20 11 Q30 0 40 11 L42 13 L18 13z" fill="#c8302a"/>' : S.hat === 'cowboy' ? '<path d="M16 9 L44 9 L44 11 L16 11z M23 9 Q24 0 30 2 Q36 0 37 9z" fill="#8a5a2a"/>' : S.hat === 'clown' ? '<circle cx="21" cy="10" r="5" fill="#ff2bd6"/><circle cx="39" cy="10" r="5" fill="#2fa84f"/><circle cx="30" cy="14" r="2.4" fill="#e22511"/>' : S.hat === 'ninja' ? '<circle cx="30" cy="13" r="8.5" fill="#1b1b22"/><rect x="23" y="11" width="14" height="4" fill="#f1c7a0" stroke="none"/><path d="M21 8 L39 8" stroke="#c8102e" stroke-width="2.6"/>' : S.hat === 'crown' ? '<path d="M22 8 L22 1 L26 5 L30 0 L34 5 L38 1 L38 8z" fill="#ffc20e"/>' : '<path d="M22 11 Q30 1 38 11z" fill="#5a3a22"/>'}${S.id === 'futbolcu' ? '<text x="30" y="37" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">10</text>' : ''}</g></svg>`; };
const ANI_ICON = {normal: ['#f0912e', '#f4f0e8'], dino: ['#5fae3a', '#d8e8a0'], penguen: ['#1b1f2a', '#f8f8f4'], panda: ['#f8f8f4', '#1b1f2a'], tavuk: ['#f8f6ee', '#e22511'], tavsan: ['#f4f0ec', '#ffb0c0'], ordek: ['#ffd21a', '#ff8a1a'], kurbaga: ['#5ac83a', '#d8f0a0'], tilki: ['#e8701a', '#f8f4ee'], koala: ['#9aa0a8', '#f0eeea'], kanguru: ['#c8844a', '#f0d8b0'], zurafa: ['#f0c060', '#9a5a2a']};
const aniSVG = (S) => { const [a, b] = ANI_ICON[S.id]; const extra = S.id === 'dino' ? '<path d="M24 18 l4 -7 l4 7 M33 19 l4 -6 l3 7" fill="#ff9a1a"/>' : S.id === 'tavuk' ? '<path d="M26 14 q4 -9 8 0z" fill="#e22511"/>' : S.id === 'panda' ? '<circle cx="20" cy="20" r="5" fill="#1b1f2a"/><circle cx="40" cy="20" r="5" fill="#1b1f2a"/>' : S.id === 'normal' ? '<path d="M20 24 l3 -10 l6 7z M40 24 l-3 -10 l-6 7z" fill="#f0912e"/>' : S.id === 'tavsan' ? '<ellipse cx="25" cy="10" rx="3.5" ry="10" fill="#f4f0ec"/><ellipse cx="35" cy="10" rx="3.5" ry="10" fill="#f4f0ec"/>' : S.id === 'tilki' ? '<path d="M20 24 l2 -12 l7 8z M40 24 l-2 -12 l-7 8z" fill="#e8701a"/>' : S.id === 'koala' ? '<circle cx="18" cy="22" r="7" fill="#9aa0a8"/><circle cx="42" cy="22" r="7" fill="#9aa0a8"/>' : S.id === 'kanguru' ? '<path d="M24 20 l1 -12 l4 10z M36 20 l-1 -12 l-4 10z" fill="#c8844a"/>' : S.id === 'zurafa' ? '<path d="M26 18 l0 -8 M34 18 l0 -8" stroke-width="3"/><circle cx="26" cy="9" r="2.4" fill="#9a5a2a"/><circle cx="34" cy="9" r="2.4" fill="#9a5a2a"/>' : S.id === 'kurbaga' ? '<circle cx="23" cy="20" r="6" fill="#5ac83a"/><circle cx="37" cy="20" r="6" fill="#5ac83a"/><circle cx="23" cy="20" r="2.5" fill="#fff"/><circle cx="37" cy="20" r="2.5" fill="#fff"/>' : ''; return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${extra}<ellipse cx="30" cy="46" rx="17" ry="13" fill="${a}"/><circle cx="30" cy="28" r="11" fill="${a}"/><ellipse cx="30" cy="32" rx="6" ry="4" fill="${b}"/>${S.id === 'penguen' || S.id === 'tavuk' || S.id === 'ordek' ? '<path d="M27 30 l3 5 l3 -5z" fill="#ffb01a"/>' : S.id === 'zurafa' ? '<circle cx="22" cy="44" r="3" fill="#9a5a2a"/><circle cx="36" cy="49" r="3.5" fill="#9a5a2a"/><circle cx="40" cy="40" r="2.5" fill="#9a5a2a"/>' : ''}<circle cx="26" cy="26" r="1.8" fill="#1b1330"/><circle cx="34" cy="26" r="1.8" fill="#1b1330"/></g></svg>`; };
const TABS = {
  skin: {list: SKINS, key: 'skin', svg: toySVG, apply: (id) => applySkin(id)},
  trail: {list: TRAILS, key: 'trail', svg: trailSVG, apply: (id) => applyTrail(id)},
  npc: {list: NPC_SKINS, key: 'npc', svg: npcSVG, apply: (id) => shopPreview(id)},
  ani: {list: ANI_SKINS, key: 'ani', svg: aniSVG, apply: (id) => shopPreview(id)},
};
function ownKey(tab, id) { return id + (tab === 'trail' && id === 'buz' ? '_t' : ''); }
let prevModel = null;
let podium = null;
function shopPodium(on) {
  if (!podium) { podium = new THREE.Group(); mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.24, 40), std(0xffc20e, 0.45), 0, 0.12, 0, podium); const r = mesh(new THREE.TorusGeometry(1.08, 0.05, 8, 40), std(NAVY, 0.4), 0, 0.24, 0, podium); r.rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.02, 40), std(0xffe27a, 0.5), 0, 0.25, 0, podium); ink(podium, 0.03); scene.add(podium); }
  podium.visible = on && shopTab !== 'trail' && shopTab !== 'fe'; const b = startPos(LV); podium.position.set(b.x, b.y - RAD - 0.12, b.z);
}
function shopPreview(id) {
  shopPodium(state === 'shop');
  if (prevModel) { scene.remove(prevModel); prevModel = null; }
  const on = state === 'shop' && (shopTab === 'npc' || shopTab === 'ani'); toyRoot.visible = !on; shopInfo(id); if (!on) return;
  const m = shopTab === 'npc' ? makePerson({npcSkin: id || SAVE.npc, col: 0xe22511}) : makeCat({aniSkin: id || SAVE.ani});
  { const bb = new THREE.Box3().setFromObject(m.g), h = Math.max(0.3, bb.max.y - bb.min.y); m.g.scale.multiplyScalar(shopTab === 'ani' ? Math.min(2.6, 1.25 / h) : 1); }
  const base = startPos(LV); m.g.position.set(base.x, base.y - RAD + 0.12, base.z); prevModel = m.g; scene.add(m.g);
}
// ---- Sokak 2 pack: levels 11-20 ----
function levelLocked(i) { return false; }
function openPack() {
  dlg('BÖLÜM PAKETİ', '40 YENİ BÖLÜM', `<p>Sokak, Amerika, Avrupa ve Uzay'da <b>11-20. bölümler</b>. Köprüler, ters rüzgâr, uzun yollar ve her dünyanın <b>finali</b>. Hepsi ilk 10 bölümden daha zor.</p>`,
    [{t: 'Satın al · ' + priceOf(PACK2), c: 'ok', f: () => buyProduct({...PACK2, title: 'Bölüm paketi'})},
     {t: fmtN(PACK2.fe) + ' tüy ile aç', c: SAVE.fe >= PACK2.fe ? '' : 'dim', f: () => { if (SAVE.fe < PACK2.fe) { toastShop('Yetersiz tüy', fmtN(PACK2.fe - SAVE.fe) + ' tüy daha lazım'); return; } addFe(-PACK2.fe); grant(PACK2.id, null); }},
     {t: 'Vazgeç'}]);
}
// ---- daily gift: a 7-day streak, double it with an ad ----
const dayKey = (d) => d.toISOString().slice(0, 10);
function dailyState() { const now = new Date(), today = dayKey(now), y = dayKey(new Date(now - 864e5)); const D = SAVE.daily; const ready = D.last !== today; const streak = ready ? (D.last === y ? D.streak : 0) : D.streak - 1; return {ready, today, day: ((streak % 7) + 7) % 7}; }
function dailyUI() { const b = $('dailyDot'); if (b) b.hidden = !dailyState().ready; }
function claimDaily(mult) { const st = dailyState(); if (!st.ready) return; const n = DAILY[st.day] * mult; SAVE.daily = {last: st.today, streak: st.day + 1}; save(); addFe(n, mult > 1 ? 'günlük hediye x2' : 'günlük hediye'); SFX.win(); buzz([20, 30, 20]); dailyUI(); }
function openDaily() {
  const st = dailyState();
  const days = DAILY.map((n, k) => `<div class="dd${k < st.day ? ' got' : ''}${k === st.day ? ' now' : ''}"><small>${k + 1}. gün</small><b>${fmtN(n)}</b></div>`).join('');
  if (!st.ready) { dlg('GÜNLÜK HEDİYE', 'YARIN GEL', `<div class="days">${days}</div><p>Bugünkü hediyeni aldın. Her gün gel, 7. gün ${DAILY[6]} tüy!</p>`, [{t: 'Tamam', c: 'ok'}]); return; }
  dlg('GÜNLÜK HEDİYE', '+' + DAILY[st.day] + ' TÜY', `<div class="days">${days}</div><p>Her gün gelirsen hediye büyür. Bir gün kaçırırsan baştan başlar.</p>`,
    [{t: '▶ Reklam izle · 2x', c: 'ad', f: async () => { const r = await adRewarded('fe'); if (r === 'rewarded') claimDaily(2); else { toastShop('Reklam şu an yok', 'normal hediyeni verdim'); claimDaily(1); } }},
     {t: 'Al', c: 'ok', f: () => claimDaily(1)}]);
}
function openHow() {
  dlg('NASIL OYNANIR', 'KOVAYA SOK!', `<div class="how"><p><b>Sağa sola kaydır:</b> yön seç.</p><p><b>Aşağı çek, bırak:</b> ne kadar çekersen o kadar uzağa.</p><p><b>Uçarken basılı tut:</b> tüyler açılır, FLIX süzülür.</p><p><b>Golf gibi:</b> durduğu yerden devam edersin. Par kadar ya da daha az atışla bitir, 3 yıldız al.</p><p><b>Dikkat:</b> insanlara çarparsa topu bir iki sektirip rastgele bir yere şutlarlar!</p><p>FLIX kovanın <b>tam içine</b> düşmeden bölüm bitmez.</p></div>`, [{t: 'Anladım', c: 'ok'}]);
}
// ---- one dialog for packs, gifts and help ----
function dlg(tag, title, body, btns) {
  $('dlgTag').textContent = tag; $('dlgT').textContent = title; $('dlgB').innerHTML = body; const w = $('dlgBtns'); w.innerHTML = '';
  for (const b of btns) { const e = document.createElement('button'); e.className = 'mbtn ' + (b.c || ''); e.textContent = b.t; e.onclick = () => { show('dlgL', false); if (b.f) b.f(); }; w.appendChild(e); }
  show('dlgL', true); tick();
}
function maybeLoseAd() { SAVE.loses++; save(); return adTurn(); }
dailyUI();


window.__A = {boxes: () => boxes, facadeTex, buyWorld, worldReady, WORLDS, worldOpen, curWorld, nextLevel, playLevel, openPack, openDaily, levelLocked, startJuggle, get shopTab() { return shopTab; }, openShop, grant, addFe, lose, reviveRun, maybeInterstitial, actors: () => actors, reactActor, win, openLevels, X: {scene, camera, toyRoot, toyM, renderer, get bucket() { return bucket; }, get world() { return world; }, stars: () => stars}, P, LEVELS, startLevel, solveShot, state: () => state, SAVE, get LV() { return LV; }, cam: () => camMode, SKINS, TRAILS};
resize(); openHome(); requestAnimationFrame(frame);
