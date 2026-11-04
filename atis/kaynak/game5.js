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
    let fsz = Math.round(0.4 * S); const setF = () => { x.font = `900 italic ${fsz}px "Barlow Condensed", Impact, sans-serif`; }; setF(); while (x.measureText(o.shop).width > W - 60 && fsz > 18) { fsz -= 2; setF(); } x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillText(o.shop, W / 2 + 3, sy + 8 + sh / 2 + 3); x.fillStyle = '#fff'; x.fillText(o.shop, W / 2, sy + 8 + sh / 2);
    const wy = sy + sh + 18, dw = 0.92 * S, dx = o.door === 'l' ? 0.22 * S : W - 0.22 * S - dw;
    x.fillStyle = '#3b2a20'; x.fillRect(0.12 * S, wy - 6, W - 0.24 * S, H - wy + 6);
    const gl = x.createLinearGradient(0, wy, 0, H); gl.addColorStop(0, '#cdeaf4'); gl.addColorStop(0.5, '#7fa9c2'); gl.addColorStop(1, '#3f6684'); x.fillStyle = gl; x.fillRect(0.18 * S, wy, W - 0.36 * S, H - wy - 0.22 * S);
    const g2 = o.goods || []; for (let row = 0; row < 2; row++) for (let k2 = 0; k2 < Math.floor(W / (0.3 * S)); k2++) { const gx = 0.3 * S + k2 * 0.3 * S; if (gx > dx - 10 && gx < dx + dw + 10) continue; x.fillStyle = g2[(k2 + row) % (g2.length || 1)] || '#f4c27a'; x.beginPath(); x.arc(gx, H - 0.42 * S - row * 0.3 * S, 0.11 * S, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(gx - 4, H - 0.46 * S - row * 0.3 * S, 0.035 * S, 0, 7); x.fill(); }
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
  { const AS = aniSkin(o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'cat'); } }
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
  { const AS = aniSkin(o && o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'dog'); } }
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
const NPC_SKINS = [
  {id: 'mahalle', name: 'Mahalleli', price: 0},
  {id: 'futbolcu', name: 'Futbolcu', price: 800, cloth: 0xe22511, pants: 0xf4f4f4, shoe: 0xffffff},
  {id: 'asci', name: 'Aşçı', price: 1200, cloth: 0xf8f8f4, pants: 0x3a3f4a, hat: 'chef'},
  {id: 'astronot', name: 'Astronot', price: 2500, cloth: 0xe8ecf2, pants: 0xe8ecf2, shoe: 0x8a93a6, hat: 'helmet'},
  {id: 'kahraman', name: 'Süper Kahraman', price: 4000, cloth: 0x1f6fd1, pants: 0x1f6fd1, shoe: 0xe22511, cape: 0xe22511},
];
const ANI_SKINS = [
  {id: 'normal', name: 'Kedi & Köpek', price: 0},
  {id: 'dino', name: 'Dinozor', price: 1000, say: ['RAAWR!', 'GRAAA!', 'Rawr?']},
  {id: 'penguen', name: 'Penguen', price: 1500, say: ['Vak vak!', 'Brrr!', 'Kaydım!']},
  {id: 'panda', name: 'Panda', price: 2500, say: ['Mmmf!', 'Bambu?', 'Hıh!']},
  {id: 'tavuk', name: 'Tavuk', price: 3500, say: ['GIDAAK!', 'Bık bık!', 'GIT GIT!']},
];
function npcSkin(id) { return NPC_SKINS.find((s) => s.id === (id || SAVE.npc)) || NPC_SKINS[0]; }
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
  if (NS.id === 'futbolcu') { part(BOX, std(0xffffff, 0.7), 0.12, 0.1, 0.02, 0, 1.12, 0.152, m.body); }
}
// animal skins: same parts as the cat / dog (body, head, 4 legs, tail) so the walking and reaction code works unchanged
function makeCreature(id, kind) {
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
  bubble(a, pick(((a.kind === 'cat' || a.kind === 'dog') && aniSkin().say) || SAY[a.kind] || SAY.person));
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
const G = 14, VMIN = 5, VMAX = 16;
function launchVel(ang, pow) { const v = VMIN + pow * (VMAX - VMIN), el = 1.2 - pow * 0.27, c = Math.cos(el), s = Math.sin(el); return new V3(Math.sin(ang) * c * v, s * v, -Math.cos(ang) * c * v); }
function newBody(p, v) { return {p: p.clone(), v: v.clone(), open: false, energy: 1.6, rest: 0, ground: false, done: '', t: 0, got: [false, false, false], bounces: 0}; }
const _c = new V3(), _n = new V3();
function stepBody(B, dt, wind, lv) {
  B.t += dt;
  if (B.autoOpen !== undefined && B.autoOpen >= 0 && B.v.y < B.autoOpen && B.energy > 0) B.open = true;
  const drag = B.open ? 2.6 : 0.1;
  if (B.open) { B.energy -= dt; if (B.energy <= 0) { B.energy = 0; B.open = false; } }
  B.v.x += (wind * (B.open ? 1.6 : 0.18) - B.v.x * drag * 0.6) * dt;
  B.v.z += (-B.v.z * drag * 0.6) * dt;
  B.v.y += (-G - B.v.y * drag) * dt;
  B.p.addScaledVector(B.v, dt);
  B.ground = false; let hit = '';
  for (const o of lv.boxes) {
    const b = o.b; _c.set(clamp(B.p.x, b[0], b[1]), clamp(B.p.y, b[2], b[3]), clamp(B.p.z, b[4], b[5]));
    _n.subVectors(B.p, _c); const d = _n.length(); if (d >= RAD) continue;
    if (d < 1e-5) _n.set(0, 1, 0); else _n.divideScalar(d);
    B.p.copy(_c).addScaledVector(_n, RAD);
    const vn = B.v.dot(_n);
    if (vn < 0) {
      const e = o.kind === 'bounce' ? 1.18 : o.kind === 'soft' ? 0.15 : 0.32;
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

// ================= LEVELS (golf style: several shots, par) =================
// Streets are built from pieces. stZ = a street running along z (forward = -z), stX = along x.
// Each adds road + two pavements (islands) and a row of shop buildings on both sides facing the street.
const SHOPS = ['TOSUN MARKET', 'BAKKAL BÜLENT', 'FÖNCÜ FERDİ', 'SİMİT SARAYI', 'DEMLİK ÇAY EVİ', 'KÖFTECİ KAMİL', 'KUAFÖR KAFA', 'NALBUR NURİ', 'ŞIPSAK FOTO', 'BÖREKÇİ BEDRİ', 'MANAV MUAMMER', 'BERBER BAYRAM', 'ECZANE ŞİFA', 'KASAP KADİR', 'TERZİ TEYZE', 'PİDECİ PAŞA', 'DÖNERCİ DOYUR', 'TOMBİK BÜFE', 'ŞEKERCİ ŞÜKRÜ', 'TATLICI TOMBUL', 'MİSKET OYUNCAK', 'GEVREK FIRIN', 'ÇIRAK ELEKTRİK', 'PAŞA LOKANTA'];
const WALLS = [['#f2d8b0', '#2fa84f', '#e22511'], ['#cfe3e8', '#1f6fd1', '#022753'], ['#f4c7b8', '#7a4fb0', '#2fa84f'], ['#e8d0e8', '#022753', '#7a4fb0'], ['#f7e6a8', '#e22511', '#e22511'], ['#d6e8d0', '#2fa84f', '#022753'], ['#f0dcc8', '#b8402a', '#1f6fd1'], ['#dfe0ea', '#e22511', '#ff7a1a']];
const GOODS = [['#e8b060', '#c98a3a', '#f4d090'], ['#e22511', '#ffc20e', '#2fa84f'], ['#1f6fd1', '#f4eee2'], ['#e22511', '#2fa84f', '#ff7a1a'], ['#f4eee2', '#2fa84f'], ['#b8402a', '#f4eee2']];
function lot(o, x0, x1, z0, z1, face, top) { const w = pick(WALLS); return {t: 'bld', x0, x1, z0, z1, face, base: top, h: o.h ? o.h : srnd(4.2, 7.2), col: w[0], shut: w[1], sign: w[2], shop: pick(SHOPS), door: srnd(0, 1) > 0.5 ? 'l' : 'r', goods: pick(GOODS), chim: srnd(0, 1) > 0.6}; }
const inGap = (gaps, a, b) => (gaps || []).some(([g0, g1]) => Math.max(a, b) > Math.min(g0, g1) && Math.min(a, b) < Math.max(g0, g1));
function stZ(L, cx, zA, zB, o = {}) { // zA near (bigger), zB far
  const top = o.top || 0, mid = (zA + zB) / 2, len = zA - zB;
  L.islands.push({x: cx, z: mid, w: 3.2, d: len, top, kind: 'road', ax: 'z'}, {x: cx - 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'}, {x: cx + 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'});
  for (const side of [-1, 1]) {
    if (o['no' + (side < 0 ? 'L' : 'R')]) continue;
    let z = zA; while (z > zB + 0.5) { const l = Math.min(z - zB, srnd(3.2, 4.6)); if (!inGap(o['gap' + (side < 0 ? 'L' : 'R')], z, z - l)) L.props.push(lot(o, side < 0 ? cx - 5.6 : cx + 3.4, side < 0 ? cx - 3.4 : cx + 5.6, z - l, z, side < 0 ? '+x' : '-x', top + 0.22)); z -= l; }
  }
  if (o.end) L.props.push(lot(o, cx - 5.6, cx + 5.6, zB - 2.4, zB, '+z', top + 0.22));
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
function mkLevel(i, def) { seed = 101 + i * 13; const L = {islands: [], props: [], actors: [], feathers: [], wind: 0, ...def}; def.build(L); return L; }
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

// ================= WORLD BUILDING (v3) =================
function facadeBlock(g, P) {
  const along = P.face === '+x' || P.face === '-x' ? P.z1 - P.z0 : P.x1 - P.x0, h = P.h, base = P.base || 0.22;
  const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.07).getHex(), 0.9), rt = roofTex.clone(); rt.needsUpdate = true; rt.repeat.set((P.x1 - P.x0) / 2.2, (P.z1 - P.z0) / 2.2); const roof = new THREE.MeshStandardMaterial({map: rt, bumpMap: rt, bumpScale: 0.04, roughness: 0.8});
  const fx = facadeTex(along, h, P), ft = new THREE.MeshStandardMaterial({map: fx, bumpMap: fx, bumpScale: 0.025, roughness: 0.82});
  const mats = [side, side, roof, side, side, side]; mats[{'+x': 0, '-x': 1, '+z': 4, '-z': 5}[P.face]] = ft;
  const m = new THREE.Mesh(BOX, mats); m.scale.set(P.x1 - P.x0, h, P.z1 - P.z0); m.position.set((P.x0 + P.x1) / 2, base + h / 2, (P.z0 + P.z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  boxes.push({b: [P.x0, P.x1, base - 2, base + h, P.z0, P.z1], kind: 'hard'});
  const cm = std(0xf4eee2, 0.8), T = 0.16; // cornice around the roof
  addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z0, P.z0 + T, false); addBox(g, cm, P.x0, P.x1, base + h, base + h + 0.24, P.z1 - T, P.z1, false);
  addBox(g, cm, P.x0, P.x0 + T, base + h, base + h + 0.24, P.z0, P.z1, false); addBox(g, cm, P.x1 - T, P.x1, base + h, base + h + 0.24, P.z0, P.z1, false);
  if (P.chim) { const cx = (P.x0 + P.x1) / 2 + 0.3, cz = (P.z0 + P.z1) / 2; addBox(g, std(0xc0603e, 0.9), cx - 0.25, cx + 0.25, base + h, base + h + 0.9, cz - 0.25, cz + 0.25, false); }
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
    const src = I.kind === 'road' ? roadTex : I.kind === 'bridge' ? plankTex : paveTex;
    const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / (src === paveTex ? 3 : 2.5), I.d / (src === paveTex ? 3 : 2.5));
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
  if (P.t === 'bld') { facadeBlock(g, P); return true; }
  if (P.t === 'car' && P.ax === 'z') { // a car parked along a z street: swap the axes of the x-car
    const c = std(P.col, 0.35, 0.2), dk = std(0x1b1330, 0.6), gl = std(0x8fc4dc, 0.15, 0.3);
    addBox(g, c, P.x - 0.6, P.x + 0.6, top + 0.25, top + 0.95, P.z - 1.2, P.z + 1.2);
    addBox(g, c, P.x - 0.52, P.x + 0.52, top + 0.95, top + 1.5, P.z - 0.5, P.z + 0.6);
    addBox(g, gl, P.x - 0.54, P.x + 0.54, top + 1.0, top + 1.42, P.z - 0.45, P.z + 0.55, false);
    for (const [a, b] of [[-0.55, -0.75], [0.55, -0.75], [-0.55, 0.75], [0.55, 0.75]]) { const w = mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 14), dk, P.x + a, top + 0.27, P.z + b, g); w.rotation.z = Math.PI / 2; }
    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xe22511 : 0xfff1b0, 0.3), P.x + 0.4, top + 0.7, P.z + a * 1.2, g);
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
function buildLevel(i) {
  if (world) scene.remove(world);
  LV = LEVELS[i]; boxes = []; stars = []; sock = null; world = new THREE.Group(); scene.add(world); seed = 11 + i * 7;
  buildGround3();
  for (const P of LV.props) {
    if (P.t === 'line' && P.x === undefined) P.x = (P.x0 + P.x1) / 2;
    const I = P.x !== undefined ? islandAt(P.x, P.z !== undefined ? P.z : (P.z0 || 0)) : null, top = P.base !== undefined ? P.base : I ? I.top : 0.22, g = new THREE.Group(); world.add(g);
    if (prop3(P, top, g)) { /* street */ }
    else if (P.t === 'plant') { mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 14), std(0xb85c3c), P.x, top + 0.25, P.z, g); mesh(new THREE.SphereGeometry(0.45, 14, 10), std(0x4a9a4a, 0.9), P.x, top + 0.75, P.z, g); boxes.push({b: [P.x - 0.4, P.x + 0.4, top, top + 1.1, P.z - 0.4, P.z + 0.4], kind: 'soft'}); }
    else if (P.t === 'line') {
      for (const x of [P.x0, P.x1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, P.h, 6), std(0x445566), x, top + P.h / 2, P.z, g);
      const rope = mesh(new THREE.CylinderGeometry(0.014, 0.014, P.x1 - P.x0, 4), std(0xffffff), (P.x0 + P.x1) / 2, top + P.h - 0.05, P.z, g); rope.rotation.z = Math.PI / 2;
      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = P.x0 + 0.15, k = 0;
      while (x < P.x1 - 0.4) { const w = 0.55 + srnd(0, 0.3), hh = 0.6 + srnd(0, 0.35); addBox(g, std(cols[k++ % cols.length], 0.9), x, x + w, top + P.h - 0.08 - hh, top + P.h - 0.05, P.z - 0.03, P.z + 0.03, false); x += w + 0.12; }
      boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'soft'});
    }
    else if (P.t === 'sock') { mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), std(0xffffff), P.x, top + 1, P.z, g); sock = mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.9, 12, 1, true), new THREE.MeshStandardMaterial({color: 0xff6a1a, side: THREE.DoubleSide}), P.x, top + 1.9, P.z, g); sock.userData.base = new V3(P.x, top + 1.9, P.z); }
    if (P.t !== 'bld') ink(g, 0.025);
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
  for (let k = 0; k < 14; k++) cloud(srnd(bb.x0 - 10, bb.x1 + 10), srnd(-9, -4), srnd(bb.z0 - 10, bb.z1 + 6), srnd(2, 3.4));
  spawnActors(LV);
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
const MAXOVER = 2; // shots allowed over par
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
function hudShots() { $('shots').textContent = P.shot; $('shotMax').textContent = '/' + (LV.par + MAXOVER + (P.bonus || 0)); $('shotsBox').classList.toggle('over', P.shot >= LV.par); }
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
  if (P.shot >= LV.par + MAXOVER + (P.bonus || 0)) return lose();
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
  if (bd < 1.75 && Math.abs(p.y - RAD - bucket.y) < 0.6) { const ux = bd > 0.01 ? (p.x - bucket.x) / bd : 0, uz = bd > 0.01 ? (p.z - bucket.z) / bd : 1; for (const r of [1.75, 2.1, 2.5]) { const q = new V3(bucket.x + ux * r, p.y, bucket.z + uz * r); const I = islandAt(q.x, q.z); if (I && Math.abs(I.top + RAD + 0.01 - p.y) < 0.2) { p.copy(q); break; } } }
  return p;
}
function rating(shots, par) { const d = shots - par; return shots === 1 ? 'TEK ATIŞ!' : d <= -2 ? 'EFSANE!' : d === -1 ? 'SÜPER!' : d === 0 ? 'PAR!' : '+' + d; }
function starsFor(shots, par) { return shots <= par ? 3 : shots === par + 1 ? 2 : 1; }
function win() {
  P.phase = 'won'; P.celebrate = 1; P.winT = T; SFX.win(); buzz([20, 40, 20]); confetti(bucket.x, bucket.rimY + 0.3, bucket.z); camMode = 'win';
  const nStars = starsFor(P.shot, LV.par), nFe = P.got.filter(Boolean).length;
  const fe = 10 + nStars * 5 + nFe * 5 + (P.shot < LV.par ? 10 : 0) + Math.min(5, P.reacts || 0) * 2;
  const prev = SAVE.lv[cur] || {s: 0, best: 99};
  SAVE.lv[cur] = {s: Math.max(prev.s || 0, nStars), best: Math.min(prev.best || 99, P.shot), done: 1}; SAVE.fe += fe; save(); feUI();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = rating(P.shot, LV.par); $('endT').className = 'big ' + (P.shot <= LV.par ? 'good' : 'meh');
    $('endW').innerHTML = `<b>${P.shot}</b> atış · par <b>${LV.par}</b>${P.pen ? ` · ${P.pen} ceza` : ''}`;
    $('endStars').innerHTML = [0, 1, 2].map((k) => STAR(k < nStars)).join('');
    $('endRows').innerHTML = row('Bölüm', 10) + row('Yıldız', nStars * 5) + (nFe ? row('Altın tüy x' + nFe, nFe * 5) : '') + (P.shot < LV.par ? row('Par altı', 10) : '') + (P.reacts ? row('Şaşkın komşu x' + Math.min(5, P.reacts), Math.min(5, P.reacts) * 2) : '') + `<div class="tot"><span>Toplam</span><b>+${fe} tüy</b></div>`;
    $('endStars').querySelectorAll('svg').forEach((s, k) => setTimeout(() => { s.classList.add('show'); if (k < nStars) SFX.star(k); }, 250 + k * 260));
    $('retry3').hidden = false; endAd('double', fe); if (window.FlixAds) window.FlixAds.setScreen('over');
    $('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';
    $('next').onclick = async () => { if ($('next').dataset.busy) return; $('next').dataset.busy = 1; await maybeInterstitial(); delete $('next').dataset.busy; if (cur + 1 < LEVELS.length) playLevel(cur + 1); else openLevels(); };
  }, BOT ? 50 : 1500);
}
// reward ad on the score card: 2x feathers after a win, +2 shots once after running out
function endAd(kind, fe) {
  const b = $('endAd'); if (!kind || BOT) { b.hidden = true; return; }
  b.hidden = false; b.disabled = false; b.className = 'adbtn ' + kind;
  b.innerHTML = kind === 'double' ? `<i>▶</i><span>Reklam izle<b>2x tüy · +${fe}</b></span>` : `<i>▶</i><span>Reklam izle<b>+${AD_CFG.extraShots} atış hakkı</b></span>`;
  b.onclick = async () => {
    if (b.disabled) return; b.disabled = true; const r = await adRewarded();
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
    $('endT').textContent = 'OLMADI!'; $('endT').className = 'big meh'; $('endW').innerHTML = `Par ${LV.par} bölümde ${LV.par + MAXOVER} atış hakkın bitti.`;
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
    if (state === 'shop') { const a = T * 0.25; wantLook.copy(tp); wantLook.y -= 1.7; wantPos.set(tp.x + Math.sin(a) * 6.2, tp.y + 0.9, tp.z + Math.cos(a) * 6.2); return; }
    if (state === 'home') { const b = startPos(LV), a = Math.sin(T * 0.35) * 0.45; wantLook.set(b.x, b.y + 1.0, b.z); wantPos.set(b.x + Math.sin(a) * 5, b.y + 1.1, b.z + Math.cos(a) * 5); }
    return;
  }
  if (camMode === 'fly' && P.body) {
    const v = P.body.v; fwd.set(v.x, 0, v.z); if (fwd.lengthSq() < 0.5) fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw)); fwd.normalize();
    wantPos.copy(tp).addScaledVector(fwd, -7); wantPos.y = Math.max(tp.y + 2.8, P.from.y + 2.4);
    wantLook.copy(tp).addScaledVector(fwd, 2.5); wantLook.y = tp.y * 0.6 + P.from.y * 0.4;
    return;
  }
  if (camMode === 'win') { wantLook.set(bucket.x, bucket.rimY, bucket.z); const wy = P.yaw + Math.sin((T - (P.winT || T)) * 0.6) * 0.45; fwd.set(Math.sin(wy), 0, -Math.cos(wy)); wantPos.set(bucket.x, bucket.rimY + 2.6, bucket.z).addScaledVector(fwd, -5); return; }
  fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw));
  wantPos.copy(tp).addScaledVector(fwd, -6.4); wantPos.y = tp.y + 3.1;
  wantLook.copy(tp).addScaledVector(fwd, 5.5); wantLook.y = tp.y + 0.5;
}
function camBlock() { // keep the camera out of buildings: pull it toward the FLIX
  const tp = toyRoot.position; if (camMode === 'map' || state === 'home' || state === 'shop') return;
  const steps = 14; let ok = 1;
  for (let k = 1; k <= steps; k++) { const t = k / steps; tmp.lerpVectors(tp, wantPos, t); if (boxes.some((o) => o.kind === 'hard' && o.b[1] - o.b[0] > 0.5 && o.b[5] - o.b[4] > 0.5 && o.b[3] > 1 && tmp.x > o.b[0] - 0.3 && tmp.x < o.b[1] + 0.3 && tmp.y < o.b[3] + 0.3 && tmp.z > o.b[4] - 0.3 && tmp.z < o.b[5] + 0.3 && tmp.y > o.b[2])) { ok = (k - 1) / steps; break; } }
  if (ok < 1) { wantPos.lerpVectors(tp, wantPos, Math.max(0.3, ok)); wantPos.y += (1 - ok) * 2.5; }
}
function snapCam() { camWanted(); camPos.copy(wantPos); camLook.copy(wantLook); }
function updateCam(dt) {
  if (P.intro > 0 && state === 'play') { P.intro -= dt; if (P.intro > 1.2) { const m = camMode; camMode = 'map'; camWanted(); camMode = m; } else camWanted(); }
  else camWanted();
  camBlock();
  const k = 1 - Math.exp(-dt * (camMode === 'fly' ? 4.5 : camMode === 'map' ? (state === 'shop' ? 5 : 3) : P.intro > 0 ? 2.2 : 6));
  camPos.lerp(wantPos, k); camLook.lerp(wantLook, k);
  camera.position.copy(camPos); camera.lookAt(camLook);
}

// ================= SCREENS =================
function starTotal() { return Object.values(SAVE.lv).reduce((a, b) => a + (b.s || 0), 0); }
function nextLevel() { const k = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); return k < 0 ? LEVELS.length - 1 : k; }
function playLevel(i) { if (levelLocked(i)) { openPack(); return; } audio(); startLevel(i); }
function openHome() {
  state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('homeL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');
  $('starsH').textContent = starTotal() + '/' + LEVELS.length * 3;
  const n = nextLevel(); $('playSub').textContent = levelLocked(n) ? 'Sokak 2 paketi' : (n + 1) + '. bölüm · ' + LEVELS[n].name; dailyUI();
  if (!LV || cur !== 0) { cur = 0; buildLevel(0); } placeToy(startPos(LV)); P.phase = 'home'; P.body = null; camMode = 'map'; snapCam();
}
function openLevels() {
  state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('levelsL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');
  const done = (i) => SAVE.lv[i] && SAVE.lv[i].done; let html = '';
  const tot = starTotal(); $('lvProg').style.width = (tot / (LEVELS.length * 3) * 100).toFixed(1) + '%'; $('lvProgT').textContent = tot + ' / ' + LEVELS.length * 3;
  LEVELS.forEach((L, i) => {
    const paid = levelLocked(i), open = !paid && (i === 0 || done(i - 1) || done(i)), sv = SAVE.lv[i] || {}, nxt = open && !done(i);
    if (i === 0) html += '<div class="sec"><b>1. SOKAK · MAHALLE</b><span>ücretsiz</span></div>';
    if (i === FREE_LEVELS) html += `<div class="sec"><b>2. SOKAK · ÇARŞI</b><span>${SAVE.pack2 ? 'açık' : 'paket'}</span></div>` + (SAVE.pack2 ? '' : `<button class="packbar" id="packBar"><b>10 yeni, daha zor bölüm</b><span>Satın al · ${priceOf(PACK2)} ya da ${fmtN(PACK2.fe)} tüy</span></button>`);
    html += `<button class="lv${open ? '' : ' lock'}${paid ? ' paid' : ''}${nxt ? ' next' : ''}" data-i="${i}" ${open || paid ? '' : 'disabled'}>
      <div class="num big">${open ? i + 1 : '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10" width="14" height="11" rx="2" fill="#022753"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#022753" stroke-width="2.6" fill="none"/></svg>'}</div>
      <div class="info"><div class="nm">${L.name}${L.tut ? ' <i>ÖĞRETİCİ</i>' : ''}</div><div class="meta">Par ${L.par}${sv.best && sv.best < 99 ? ' · en iyi ' + sv.best + ' atış' : ''}</div></div>
      <div class="st">${[0, 1, 2].map((k) => STAR(k < (sv.s || 0))).join('')}</div></button>`;
  });
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
  if (P.phase === 'aim' && !P.botWait) { P.botWait = 1; setTimeout(() => { P.botWait = 0; if (P.phase !== 'aim' || state !== 'play') return; const s = solveShot(P.from); P.yaw = s.ang; shoot(s.pow); P.body.autoOpen = s.open; }, 150); }
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
      else if (h === 'bounce') { SFX.bounce(); squash = 1; buzz(10); } else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; if (P.body.ground && vy0 > 4) puff(P.body.p); }
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
  const hm = state === 'home' || state === 'shop'; scene.background = hm ? null : SKY; if (world) world.visible = !hm; APP.classList.toggle('hm', hm);
  const B = P.body;
  if (B && P.phase === 'fly' && B.v.lengthSq() > 1) { tmp.copy(B.v).normalize().negate(); qT.setFromUnitVectors(upV, tmp); toyRoot.quaternion.slerp(qT, 0.18); }
  else toyRoot.quaternion.slerp(qT.identity(), 0.12);
  // home screen: the FLIX does kick-ups on the street
  if (state === 'shop') { const base = startPos(LV); if (shopTab === 'trail') toyRoot.position.set(base.x + Math.sin(T * 2.2) * 1.4, base.y + 1.2 + Math.sin(T * 4.4) * 0.45, base.z + Math.cos(T * 2.2) * 0.6); else toyRoot.position.set(base.x, base.y + 1.0 + Math.sin(T * 2) * 0.12, base.z); toyRoot.rotation.set(0, T * 0.6, 0); }
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
const SKINS = [ // body, three feathers, finish
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
];
const TRAILS = [
  {id: 'sari', name: 'Sarı İz', price: 0, cols: [0xffc20e]},
  {id: 'gokkusagi', name: 'Gökkuşağı', price: 500, rainbow: 1},
  {id: 'ates', name: 'Ateş', price: 900, cols: [0xffc20e, 0xff7a1a, 0xe22511]},
  {id: 'buz', name: 'Buz', price: 900, cols: [0xffffff, 0x8fd8ff, 0x5fb8ff]},
  {id: 'konfeti', name: 'Konfeti', price: 1500, cols: [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xff8fb8], big: 1},
  {id: 'yildiz', name: 'Yıldız Tozu', price: 2500, cols: [0xfff1b8, 0xffffff, 0xffc20e], big: 1, twinkle: 1},
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
const PACK2 = {id: 'atis_sokak2', price: '₺79,99', fe: 12000}, FREE_LEVELS = 10;
const DAILY = [50, 75, 100, 150, 200, 250, 500];
const AD_CFG = {interEvery: 3, interFromLevel: 3, freeFe: 60, freeCooldownMin: 8, freePerDay: 6, doubleEnd: 1, extraShots: 2};
SAVE.own = SAVE.own || {klasik: 1, sari: 1}; SAVE.skin = SAVE.skin || 'klasik'; SAVE.trail = SAVE.trail || 'sari';
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
function applySkin(id) {
  const S = SKINS.find((s) => s.id === id) || SKINS[0];
  toyBody.material.color.setHex(S.body); toyBody.material.emissive.setHex(S.body); toyBody.material.emissiveIntensity = 0.15 + (S.glow || 0) * 0.3; toyBody.material.metalness = S.metal || 0; toyBody.material.roughness = S.metal ? 0.25 : 0.35;
  toyFeMats.forEach((m, i) => { m.color.setHex(S.fe[i]); m.emissive.setHex(S.fe[i]); m.emissiveIntensity = 0.3 + (S.glow || 0) * 0.5; m.metalness = (S.metal || 0) * 0.5; });
}
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
async function adRewarded() { if (window.FlixAds) return window.FlixAds.showRewarded(4000); return webAd('rewarded'); }
async function adInterstitial() { if (SAVE.noads) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); return webAd('inter'); }
function maybeInterstitial() { SAVE.wins++; save(); if (SAVE.noads || BOT || cur < AD_CFG.interFromLevel) return Promise.resolve(false); if (SAVE.wins % AD_CFG.interEvery) return Promise.resolve(false); return adInterstitial(); }
function freeFeState() { const d = new Date().toDateString(); if (SAVE.ads.day !== d) { SAVE.ads.day = d; SAVE.ads.n = 0; } const wait = SAVE.ads.last + AD_CFG.freeCooldownMin * 60000 - Date.now(); return {left: AD_CFG.freePerDay - SAVE.ads.n, wait: Math.max(0, wait)}; }

// ---- purchases ----
function priceOf(p) { return (window.FlixNative && window.FlixNative.price(p.id)) || p.price; }
function grant(id, tx) {
  if (tx) { if (SAVE.tx.includes(tx)) return; SAVE.tx.push(tx); if (SAVE.tx.length > 60) SAVE.tx.shift(); }
  const pk = PACKS.find((p) => p.id === id);
  if (pk) addFe(pk.fe, 'satın alındı');
  else if (id === STARTER.id) { if (!SAVE.starter) { SAVE.starter = 1; SAVE.own[STARTER.skin] = 1; addFe(STARTER.fe, 'Başlangıç Paketi'); } }
  else if (id === PACK2.id) { if (!SAVE.pack2) { SAVE.pack2 = 1; toastShop('Sokak 2 açıldı', '10 yeni bölüm seni bekliyor'); if (state === 'levels') openLevels(); } }
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
function renderShop() {
  feUI(); document.querySelectorAll('#shopTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === shopTab));
  const g = $('shopGrid'); let html = '';
  if (TABS[shopTab]) {
    const T = TABS[shopTab], list = T.list, eq = SAVE[T.key];
    for (const it of list) {
      const own = !!SAVE.own[ownKey(shopTab, it.id)] || it.price === 0, on = eq === it.id;
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}"><div class="pv">${T.svg(it)}</div><div class="nm">${it.name}</div>
        <div class="pr ${own ? (on ? 'on' : 'own') : (SAVE.fe >= it.price ? 'can' : 'no')}">${on ? 'SEÇİLİ' : own ? 'SEÇ' : '<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="2"/></svg>' + fmtN(it.price)}</div></button>`;
    }
  } else {
    const fs = freeFeState();
    html += `<button class="item wide free" id="freeFe" ${fs.left <= 0 || fs.wait > 0 ? 'disabled' : ''}><div class="pv big">▶</div><div class="nm">Reklam izle: <b>+${AD_CFG.freeFe} tüy</b><small>${fs.left <= 0 ? 'Bugünlük bitti' : fs.wait > 0 ? Math.ceil(fs.wait / 60000) + ' dk sonra' : 'Bugün ' + fs.left + ' hak'}</small></div></button>`;
    if (!SAVE.pack2) html += `<button class="item wide deal" data-buy="${PACK2.id}"><div class="pv big">20</div><div class="nm">Sokak 2 paketi<small>11-20. bölümler · ya da ${fmtN(PACK2.fe)} tüy ile aç</small></div><div class="pr buy">${priceOf(PACK2)}</div></button>`;
    if (!SAVE.starter) html += `<button class="item wide deal" data-buy="${STARTER.id}"><div class="pv">${toySVG(SKINS.find((s) => s.id === STARTER.skin))}</div><div class="nm">Başlangıç Paketi<small>${fmtN(STARTER.fe)} tüy + Gece kostümü · tek sefer</small></div><div class="pr buy">${priceOf(STARTER)}</div></button>`;
    for (const p of PACKS) html += `<button class="item pack" data-buy="${p.id}">${p.tag ? `<i class="tg">${p.tag}</i>` : ''}<div class="pv fe">${'<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="1.6"/></svg>'.repeat(Math.min(4, 1 + PACKS.indexOf(p)))}</div><div class="nm">${fmtN(p.fe)} tüy</div><div class="pr buy">${priceOf(p)}</div></button>`;
    html += `<button class="item wide" data-buy="${NOADS.id}" ${SAVE.noads ? 'disabled' : ''}><div class="pv big">⊘</div><div class="nm">Reklamsız<small>${SAVE.noads ? 'Satın alındı' : 'Bölüm arası reklamlar kalkar, ödüllü reklamlar isteğe bağlı kalır'}</small></div><div class="pr buy">${SAVE.noads ? '✓' : priceOf(NOADS)}</div></button>`;
    html += `<div class="note">${NATIVE ? 'Ödemeler App Store üzerinden alınır.' : 'Web sürümü: ödeme ekranı demodur, gerçek ödeme alınmaz.'}</div>`;
  }
  g.innerHTML = html;
  g.querySelectorAll('.item[data-id]').forEach((b) => b.addEventListener('click', () => shopPick(b.dataset.id)));
  g.querySelectorAll('.item[data-buy]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.buy, p = PACKS.find((q) => q.id === id) || (id === STARTER.id ? {...STARTER, title: 'Başlangıç Paketi'} : id === PACK2.id ? {...PACK2, title: 'Sokak 2 paketi'} : {...NOADS, title: 'Reklamsız'}); buyProduct({...p, title: p.title || fmtN(p.fe) + ' tüy'}); }));
  const ff = $('freeFe'); if (ff) ff.addEventListener('click', async () => { const r = await adRewarded(); if (r === 'rewarded') { SAVE.ads.n++; SAVE.ads.last = Date.now(); addFe(AD_CFG.freeFe, 'reklam ödülü'); renderShop(); } else toastShop('Reklam şu an yok', 'biraz sonra dene'); });
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
const npcSVG = (S) => { const c = hx(S.cloth || 0x2fa84f), p = hx(S.pants || 0x22304a); return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${S.cape ? `<path d="M18 22 L42 22 L46 52 L14 52z" fill="${hx(S.cape)}"/>` : ''}<rect x="22" y="40" width="7" height="20" fill="${p}"/><rect x="31" y="40" width="7" height="20" fill="${p}"/><rect x="19" y="21" width="22" height="22" rx="5" fill="${c}"/><circle cx="30" cy="13" r="8" fill="#f1c7a0"/>${S.hat === 'chef' ? '<path d="M22 8 Q22 -2 30 0 Q38 -2 38 8z" fill="#fff"/>' : S.hat === 'helmet' ? '<circle cx="30" cy="13" r="11" fill="rgba(191,230,255,.55)"/>' : '<path d="M22 11 Q30 1 38 11z" fill="#5a3a22"/>'}${S.id === 'futbolcu' ? '<text x="30" y="37" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">10</text>' : ''}</g></svg>`; };
const ANI_ICON = {normal: ['#f0912e', '#f4f0e8'], dino: ['#5fae3a', '#d8e8a0'], penguen: ['#1b1f2a', '#f8f8f4'], panda: ['#f8f8f4', '#1b1f2a'], tavuk: ['#f8f6ee', '#e22511']};
const aniSVG = (S) => { const [a, b] = ANI_ICON[S.id]; const extra = S.id === 'dino' ? '<path d="M24 18 l4 -7 l4 7 M33 19 l4 -6 l3 7" fill="#ff9a1a"/>' : S.id === 'tavuk' ? '<path d="M26 14 q4 -9 8 0z" fill="#e22511"/>' : S.id === 'panda' ? '<circle cx="20" cy="20" r="5" fill="#1b1f2a"/><circle cx="40" cy="20" r="5" fill="#1b1f2a"/>' : S.id === 'normal' ? '<path d="M20 24 l3 -10 l6 7z M40 24 l-3 -10 l-6 7z" fill="#f0912e"/>' : ''; return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${extra}<ellipse cx="30" cy="46" rx="17" ry="13" fill="${a}"/><circle cx="30" cy="28" r="11" fill="${a}"/><ellipse cx="30" cy="32" rx="6" ry="4" fill="${b}"/>${S.id === 'penguen' || S.id === 'tavuk' ? '<path d="M27 30 l3 5 l3 -5z" fill="#ffb01a"/>' : ''}<circle cx="26" cy="26" r="1.8" fill="#1b1330"/><circle cx="34" cy="26" r="1.8" fill="#1b1330"/></g></svg>`; };
const TABS = {
  skin: {list: SKINS, key: 'skin', svg: toySVG, apply: (id) => applySkin(id)},
  trail: {list: TRAILS, key: 'trail', svg: trailSVG, apply: (id) => applyTrail(id)},
  npc: {list: NPC_SKINS, key: 'npc', svg: npcSVG, apply: (id) => shopPreview(id)},
  ani: {list: ANI_SKINS, key: 'ani', svg: aniSVG, apply: (id) => shopPreview(id)},
};
function ownKey(tab, id) { return id + (tab === 'trail' && id === 'buz' ? '_t' : ''); }
let prevModel = null;
function shopPreview(id) {
  if (prevModel) { scene.remove(prevModel); prevModel = null; }
  const on = state === 'shop' && (shopTab === 'npc' || shopTab === 'ani'); toyRoot.visible = !on; if (!on) return;
  const m = shopTab === 'npc' ? makePerson({npcSkin: id || SAVE.npc, col: 0xe22511}) : makeCat({aniSkin: id || SAVE.ani});
  if (shopTab === 'ani') m.g.scale.multiplyScalar(1.7);
  const base = startPos(LV); m.g.position.set(base.x, base.y - RAD + (shopTab === 'npc' ? 0.05 : 0.45), base.z); prevModel = m.g; scene.add(m.g);
}
// ---- Sokak 2 pack: levels 11-20 ----
function levelLocked(i) { return i >= FREE_LEVELS && !SAVE.pack2; }
function openPack() {
  dlg('SOKAK 2 · ÇARŞI', '10 YENİ BÖLÜM', `<p>Köprüler, çatı katları, ters rüzgâr, pazar labirenti ve <b>Büyük Final</b>. Hepsi ilk 10 bölümden daha zor.</p>`,
    [{t: 'Satın al · ' + priceOf(PACK2), c: 'ok', f: () => buyProduct({...PACK2, title: 'Sokak 2 paketi'})},
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
    [{t: '▶ Reklam izle · 2x', c: 'ad', f: async () => { const r = await adRewarded(); if (r === 'rewarded') claimDaily(2); else { toastShop('Reklam şu an yok', 'normal hediyeni verdim'); claimDaily(1); } }},
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
function maybeLoseAd() { SAVE.loses++; save(); if (SAVE.noads || BOT || SAVE.loses % 2) return Promise.resolve(false); return adInterstitial(); }
dailyUI();


window.__A = {openPack, openDaily, levelLocked, startJuggle, get shopTab() { return shopTab; }, openShop, grant, addFe, lose, reviveRun, maybeInterstitial, actors: () => actors, reactActor, win, openLevels, X: {scene, camera, toyRoot, toyM, renderer, get bucket() { return bucket; }, get world() { return world; }, stars: () => stars}, P, LEVELS, startLevel, solveShot, state: () => state, SAVE, get LV() { return LV; }, cam: () => camMode, SKINS, TRAILS};
resize(); openHome(); requestAnimationFrame(frame);
