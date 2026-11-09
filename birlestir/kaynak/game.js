// ================= FLIX BİRLEŞTİR — game layer (three.js render, UI, economy) =================
// Uses: THREE (import), makeToy & co (toy.js), Grid/Tile/GameManager (core2048.js)

const VERSION = '1.0';
const $ = (s) => document.querySelector(s);
const SAVE_KEY = 'flix_birlestir1';

// ---------- tiers (value 2^n -> tier n-1) ----------
const TIERS = [
  { tr: 'Tüycük', en: 'Fluffy', f: [0xffffff, 0xf2efe8, 0xffffff], base: 0xf08a24, plate: '#d9dde6', r: 'Sıradan', re: 'Common' },
  { tr: 'Kum', en: 'Sand', f: [0xe8cf9a, 0xc9a66b, 0xe8cf9a], base: 0xf08a24, plate: '#efd9a8', r: 'Sıradan', re: 'Common' },
  { tr: 'Klasik', en: 'Classic', f: [C.blue, C.green, C.yel], base: 0xf08a24, plate: '#a9dfb3', r: 'Sıradan', re: 'Common' },
  { tr: 'Çizgili', en: 'Striped', f: [C.red, 0xffffff, C.red], base: 0xf08a24, plate: '#ffb3a8', r: 'Renkli', re: 'Colorful' },
  { tr: 'Deniz', en: 'Ocean', f: [0x1c6fd6, 0x5fd0ff, 0x1c6fd6], base: 0x2a80dc, plate: '#9cc8ff', r: 'Renkli', re: 'Colorful' },
  { tr: 'Orman', en: 'Forest', f: [0x2f8a3a, 0x9be05a, 0x2f8a3a], base: 0x3f7a2a, plate: '#b5e39a', r: 'Renkli', re: 'Colorful' },
  { tr: 'Mor Rüya', en: 'Purple Dream', f: [0x8a3dd8, 0xd6a4ff, 0x8a3dd8], base: 0x5b21a8, plate: '#d9b8ff', r: 'Nadir', re: 'Rare' },
  { tr: 'Gece', en: 'Midnight', f: [0x1b2a6b, 0xc8d2ff, 0x1b2a6b], base: 0x0b1840, plate: '#8e9ad0', r: 'Nadir', re: 'Rare' },
  { tr: 'Şeker', en: 'Candy', f: [0xff4fa3, 0xffe066, 0x46d8ff], base: 0xff7ab8, plate: '#ffc2e0', r: 'Epik', re: 'Epic' },
  { tr: 'Kristal', en: 'Crystal', f: [0xbff4ff, 0xffffff, 0x7fe0ff], base: 0x8fe3ff, plate: '#d2f6ff', r: 'Epik', re: 'Epic' },
  { tr: 'Altın', en: 'Golden', f: [0xffd41f, 0xffa800, 0xffd41f], base: 0xd4a000, plate: '#ffe27a', r: 'Efsane', re: 'Legendary' },
  { tr: 'Ejder', en: 'Dragon', f: [0xe22511, 0x1a1a1a, 0xffb000], base: 0x7a0f05, plate: '#ff8f6b', r: 'Mitik', re: 'Mythic' },
  { tr: 'Gökkuşağı', en: 'Rainbow', f: [0xff3b30, 0x34c759, 0x007aff], base: 0xffcc00, plate: '#fff0a0', r: 'Mitik', re: 'Mythic' },
];
const tierOf = (v) => Math.min(TIERS.length - 1, Math.round(Math.log2(v)) - 1);
const RCOL = { 'Sıradan': '#8a94a8', 'Renkli': '#2fa043', 'Nadir': '#2a80dc', 'Epik': '#a03dd8', 'Efsane': '#e3a900', 'Mitik': '#e22511' };

const THEMES = [
  { id: 'lacivert', tr: 'Lacivert', en: 'Navy', cost: 0, bg: 0x15306b, tray: 0x022753, slot: 0x0e2350 },
  { id: 'ahsap', tr: 'Ahşap', en: 'Wood', cost: 600, bg: 0x6b4428, tray: 0x8a5a33, slot: 0x5e3b20 },
  { id: 'cim', tr: 'Çim Saha', en: 'Pitch', cost: 900, bg: 0x1f6b35, tray: 0x2fa043, slot: 0x237a35 },
  { id: 'neon', tr: 'Neon Gece', en: 'Neon Night', cost: 1600, bg: 0x140a2e, tray: 0x2a145c, slot: 0x1b0d40, glow: 0xff3df2 },
  { id: 'altin', tr: 'Altın Tepsi', en: 'Gold Tray', cost: 5000, bg: 0x3a2a05, tray: 0xd4a000, slot: 0xa07800 },
];

// ---------- save ----------
const DEF = { lang: 'tr', snd: 1, tuy: 0, best: 0, maxTier: -1, seen: [], boxes: 0, undo: 3, theme: 'lacivert', owned: ['lacivert'], games: 0, game: null, tut: 0 };
let SV;
try { SV = Object.assign({}, DEF, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { SV = Object.assign({}, DEF); }
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) {} };
const T = (tr, en) => (SV.lang === 'en' ? en : tr);

// ---------- audio ----------
let AC = null;
function beep(freq, dur = 0.12, type = 'sine', vol = 0.15, slide = 0) {
  if (!SV.snd) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}
const sfx = {
  move: () => beep(220, 0.06, 'triangle', 0.06, 0.8),
  merge: (t) => { beep(330 * Math.pow(1.12, t), 0.14, 'sine', 0.14, 1.5); setTimeout(() => beep(495 * Math.pow(1.12, t), 0.12, 'triangle', 0.08), 60); },
  big: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.13), i * 90)),
  box: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.16, 'square', 0.06), i * 70)),
  no: () => beep(160, 0.18, 'sawtooth', 0.06, 0.7),
};

// ---------- three.js scene ----------
const cv = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x203060, 0.8));
const sunL = new THREE.DirectionalLight(0xfff2dc, 3.0); sunL.position.set(-5, 12, 6); sunL.castShadow = true;
sunL.shadow.mapSize.set(1024, 1024); Object.assign(sunL.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 40 }); sunL.shadow.bias = -0.0005; sunL.shadow.normalBias = 0.02;
scene.add(sunL);
const floor = mesh(new THREE.PlaneGeometry(80, 80), phys(0x15306b, { roughness: 0.9 }), scene); floor.rotation.x = -Math.PI / 2;
const trayMat = phys(C.navy, { roughness: 0.35, clearcoat: 0.6 });
const slotMat = phys(0x0e2350, { roughness: 0.6 });
mesh(new RoundedBoxGeometry(5.0, 0.35, 5.0, 4, 0.2), trayMat, scene, 0, 0.17, 0);
const glowRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.05, 8, 96), new THREE.MeshBasicMaterial({ color: 0xff3df2 })); glowRing.rotation.x = Math.PI / 2; glowRing.position.y = 0.2; glowRing.scale.set(1, 1, 1); glowRing.visible = false; scene.add(glowRing);
const SLOT_GEO = new RoundedBoxGeometry(1.08, 0.1, 1.08, 3, 0.08);
for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) mesh(SLOT_GEO, slotMat, scene, -1.8 + x * 1.2, 0.36, -1.8 + y * 1.2);
const cellPos = (x, y) => new THREE.Vector3(-1.8 + x * 1.2, 0.41, -1.8 + y * 1.2);

function applyTheme() {
  const th = THEMES.find((t) => t.id === SV.theme) || THEMES[0];
  scene.background = new THREE.Color(th.bg); floor.material.color.set(th.bg); trayMat.color.set(th.tray); slotMat.color.set(th.slot);
  glowRing.visible = !!th.glow; if (th.glow) glowRing.material.color.set(th.glow);
  document.body.style.background = '#' + new THREE.Color(th.bg).getHexString();
  needRender = true;
}

// tier templates (built lazily)
const TPL = [];
const PLATE_GEO = new RoundedBoxGeometry(1.08, 0.14, 1.08, 3, 0.1);
function badgeTex(n, col) {
  return canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#022753'; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(64, 64, 48, 0, 7); c.fill();
    c.fillStyle = '#022753'; c.font = '900 italic 64px "Barlow Condensed", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 64, 68);
  });
}
function tierTemplate(t) {
  if (TPL[t]) return TPL[t];
  const d = TIERS[t], g = new THREE.Group();
  const plate = mesh(PLATE_GEO, phys(new THREE.Color(d.plate), { roughness: 0.35, clearcoat: 0.5, emissive: t >= 10 ? 0x553300 : 0x000000 }), g, 0, 0, 0);
  plate.userData.plate = true;
  const toy = makeToy({ colors: d.f, base: d.base, len: 2.2, lite: true }); toy.scale.setScalar(0.4 + Math.min(t, 10) * 0.012); toy.position.y = 0.06; g.add(toy);
  if (t === 9) toy.traverse((o) => { if (o.material && o.material.sheen !== undefined) { o.material = o.material.clone(); o.material.iridescence = 0.8; } });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex(t + 1, RCOL[d.r]), depthTest: false })); sp.scale.setScalar(0.5); sp.position.set(0.36, 0.34, 0.4); sp.renderOrder = 10; g.add(sp);
  return (TPL[t] = g);
}

// ---------- sizing ----------
let W = 1, H = 1, needRender = true;
function resize() {
  W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H, false); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  camera.aspect = W / H;
  const a = W / H, need = 3.05 / (Math.tan(THREE.MathUtils.degToRad(16)) * a);
  const d = Math.max(17.5, need);
  const dir = new THREE.Vector3(0, 15, 14).normalize();
  camera.position.copy(dir.multiplyScalar(d)); camera.lookAt(0, 0.3, -0.35);
  camera.updateProjectionMatrix(); needRender = true;
}
window.addEventListener('resize', resize);

// ---------- actuator (renders grid with tweens) ----------
const tileRoot = new THREE.Group(); scene.add(tileRoot);
const anims = []; // {obj, from, to, t0, dur, kind}
let lastMeta = null;
const ANIM = 0.11;

function spawnObj(t) { const o = tierTemplate(t).clone(); tileRoot.add(o); return o; }
const Actuator = {
  actuate(grid, meta) {
    tileRoot.clear(); anims.length = 0;
    const now = performance.now() / 1000;
    let bestMerge = -1;
    grid.cells.forEach((col) => col.forEach((tile) => {
      if (!tile) return;
      const t = tierOf(tile.value), to = cellPos(tile.x, tile.y);
      if (tile.mergedFrom) {
        tile.mergedFrom.forEach((m) => { const o = spawnObj(tierOf(m.value)); const from = cellPos(m.previousPosition ? m.previousPosition.x : m.x, m.previousPosition ? m.previousPosition.y : m.y); o.position.copy(from); anims.push({ o, from, to, t0: now, dur: ANIM, kind: 'slideOut' }); });
        const o = spawnObj(t); o.position.copy(to); o.scale.setScalar(0.001); anims.push({ o, t0: now + ANIM, dur: 0.22, kind: 'pop' });
        bestMerge = Math.max(bestMerge, t);
        fx(to, TIERS[t].f[1], now + ANIM);
      } else if (tile.previousPosition) {
        const o = spawnObj(t); const from = cellPos(tile.previousPosition.x, tile.previousPosition.y); o.position.copy(from); anims.push({ o, from, to, t0: now, dur: ANIM, kind: 'slide' });
      } else {
        const o = spawnObj(t); o.position.copy(to); o.scale.setScalar(0.001); anims.push({ o, t0: now + (meta.fresh ? 0 : ANIM), dur: 0.18, kind: 'spawn' });
      }
    }));
    if (bestMerge >= 0) sfx.merge(bestMerge); else if (!meta.fresh) sfx.move();
    lastMeta = meta;
    onState(grid, meta, bestMerge);
    needRender = true;
  },
  continueGame() {},
};

// merge particles
const fxPool = [];
const FX_GEO = new THREE.SphereGeometry(0.06, 6, 6);
function fx(pos, col, t0) {
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(FX_GEO, new THREE.MeshBasicMaterial({ color: col, transparent: true }));
    m.position.copy(pos).add(new THREE.Vector3(0, 0.4, 0)); m.visible = false; scene.add(m);
    const a = (i / 10) * Math.PI * 2;
    fxPool.push({ m, v: new THREE.Vector3(Math.cos(a) * 2.2, 2.5 + Math.random() * 1.5, Math.sin(a) * 2.2), t0, life: 0.5 });
  }
}

// ---------- storage manager for core ----------
const Storage = {
  getBestScore: () => SV.best, setBestScore: (s) => { SV.best = s; },
  getGameState: () => SV.game, setGameState: (g) => { SV.game = g; save(); }, clearGameState: () => { SV.game = null; save(); },
};

// ---------- input ----------
const Input = { ev: {}, on(e, cb) { (this.ev[e] = this.ev[e] || []).push(cb); }, emit(e, d) { (this.ev[e] || []).forEach((cb) => cb(d)); } };
let inGame = false, busyModal = false;
function tryMove(dir) { if (!inGame || busyModal) return; Input.emit('move', dir); }
window.addEventListener('keydown', (e) => { const m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 }[e.key]; if (m !== undefined) { e.preventDefault(); tryMove(m); } });
let tStart = null;
const swipeEl = $('#swipe');
swipeEl.addEventListener('pointerdown', (e) => { tStart = { x: e.clientX, y: e.clientY }; });
swipeEl.addEventListener('pointerup', (e) => { if (!tStart) return; const dx = e.clientX - tStart.x, dy = e.clientY - tStart.y; tStart = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; tryMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); });
swipeEl.addEventListener('pointercancel', () => (tStart = null));
document.addEventListener('touchmove', (e) => { if (inGame) e.preventDefault(); }, { passive: false });

// ---------- game state hooks ----------
let gm = null, roundMax = -1, celebrated = false;
function onState(grid, meta, bestMerge) {
  let mx = -1; grid.cells.forEach((c) => c.forEach((t) => { if (t) mx = Math.max(mx, tierOf(t.value)); }));
  $('#score').textContent = meta.score.toLocaleString('tr-TR'); $('#best').textContent = Math.max(meta.bestScore, meta.score).toLocaleString('tr-TR');
  updGoal(mx);
  if (mx > roundMax) {
    roundMax = mx;
    if (!SV.seen.includes(mx)) { SV.seen.push(mx); if (mx >= 2 && inGame) { SV.boxes += 1; setTimeout(() => reveal(mx), 380); } }
    SV.maxTier = Math.max(SV.maxTier, mx);
  }
  if (inGame && meta.won && meta.terminated && !meta.over && !celebrated) { celebrated = true; setTimeout(() => winPanel(), 600); }
  if (inGame && meta.over) setTimeout(() => overPanel(meta.score), 500);
  updBtns(); save();
}
function updGoal(mx) {
  const next = Math.min(TIERS.length - 1, mx + 1);
  $('#goalName').textContent = T(TIERS[next].tr, TIERS[next].en);
  $('#goalLv').textContent = next + 1;
  $('#goalLv').style.background = RCOL[TIERS[next].r];
  const box = $('#tiers'); box.innerHTML = '';
  for (let i = 0; i < TIERS.length; i++) { const d = document.createElement('i'); d.style.background = i <= mx ? TIERS[i].plate : 'rgba(255,255,255,.15)'; if (i === next) d.className = 'nx'; box.appendChild(d); }
}
function updBtns() {
  $('#undoN').textContent = SV.undo; $('#boxN').textContent = SV.boxes; $('#boxBtn').classList.toggle('dim', !SV.boxes);
  $('#tuyH').textContent = $('#tuyS').textContent = SV.tuy.toLocaleString('tr-TR'); $('#tuyG').textContent = SV.tuy.toLocaleString('tr-TR');
}

// ---------- thumbnails (album / reveal) ----------
let thumbR = null; const THUMB = {};
function thumb(t) {
  if (THUMB[t]) return THUMB[t];
  if (!thumbR) { thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); thumbR.setSize(256, 256); thumbR.toneMapping = THREE.ACESFilmicToneMapping; thumbR.toneMappingExposure = 0.95; }
  const s = new THREE.Scene(); s.environment = scene.environment; s.environmentIntensity = 0.6;
  s.add(new THREE.HemisphereLight(0xffffff, 0x445577, 0.9)); const d = new THREE.DirectionalLight(0xffffff, 2.4); d.position.set(3, 6, 5); s.add(d);
  const toy = makeToy({ colors: TIERS[t].f, base: TIERS[t].base, len: 2.2, lite: true }); toy.rotation.y = 0.5; toy.rotation.z = -0.15; s.add(toy);
  const c = new THREE.PerspectiveCamera(30, 1, 0.1, 50); c.position.set(0, 1.3, 7); c.lookAt(0, 1.15, 0);
  thumbR.setClearColor(0, 0); thumbR.render(s, c);
  return (THUMB[t] = thumbR.domElement.toDataURL('image/png'));
}

// ---------- panels ----------
function show(id) { document.querySelectorAll('.pane').forEach((p) => (p.hidden = p.id !== id)); }
function modal(html, cls = '') { busyModal = true; const m = $('#modal'); m.className = cls; m.querySelector('.card').innerHTML = html; m.hidden = false; return m; }
function closeModal() { $('#modal').hidden = true; busyModal = false; }

function reveal(t) {
  sfx.big();
  const d = TIERS[t];
  modal(`<div class="rv-k">${T('YENİ FLIX AÇILDI!', 'NEW FLIX UNLOCKED!')}</div>
    <div class="rv-img" style="background:radial-gradient(circle, ${d.plate} 0%, transparent 70%)"><img src="${thumb(t)}" alt=""></div>
    <div class="rv-r" style="background:${RCOL[d.r]}">${T(d.r, d.re)}</div>
    <div class="rv-n">${T(d.tr, d.en)}</div>
    <div class="rv-s">${T('Seviye', 'Level')} ${t + 1} · ${T('Albüme eklendi', 'Added to album')}</div>
    <div class="rv-b">🎁 +1 ${T('sürpriz kutu', 'surprise box')}</div>
    <button class="btn y" id="rvOk">${T('DEVAM', 'CONTINUE')}</button>`, 'pop');
  $('#rvOk').onclick = () => { closeModal(); updBtns(); };
}
function winPanel() {
  sfx.big();
  modal(`<div class="rv-k">${T('EFSANE!', 'LEGENDARY!')}</div><div class="rv-img"><img src="${thumb(10)}" alt=""></div>
  <div class="rv-n">${T('Altın FLIX\'e ulaştın', 'You reached the Golden FLIX')}</div><div class="rv-s">${T('Devam et, Ejder ve Gökkuşağı FLIX seni bekliyor.', 'Keep going, Dragon and Rainbow FLIX await.')}</div>
  <button class="btn y" id="wOk">${T('DEVAM ET', 'KEEP GOING')}</button>`, 'pop');
  $('#wOk').onclick = () => { closeModal(); gm.keepGoing(); };
}
function overPanel(score) {
  const earned = SV.paid ? 0 : Math.max(10, Math.floor(score / 12));
  if (!SV.paid) { SV.tuy += earned; SV.games += 1; SV.paid = 1; } save(); updBtns();
  modal(`<div class="rv-k">${T('HAMLE KALMADI', 'NO MOVES LEFT')}</div>
  <div class="ov-s">${score.toLocaleString('tr-TR')}</div><div class="rv-s">${T('Skor', 'Score')} · ${T('En iyi', 'Best')} ${SV.best.toLocaleString('tr-TR')}</div>
  ${earned ? `<div class="rv-b">🪶 +${earned} ${T('tüy kazandın', 'feathers earned')}</div>` : ''}
  <div class="row2"><button class="btn w" id="oUndo" ${SV.undo ? '' : 'disabled'}>↶ ${T('Geri al', 'Undo')} (${SV.undo})</button><button class="btn y" id="oNew">${T('YENİ OYUN', 'NEW GAME')}</button></div>
  <button class="btn t" id="oHome">${T('Ana menü', 'Main menu')}</button>`, 'pop');
  $('#oUndo').onclick = () => { if (doUndo()) closeModal(); };
  $('#oNew').onclick = () => { closeModal(); newGame(); };
  $('#oHome').onclick = () => { closeModal(); home(); };
}
function doUndo() {
  if (!SV.undo) { toast(T('Geri alma hakkın bitti. Dükkândan al.', 'No undos left. Get more in the shop.')); sfx.no(); return false; }
  if (!gm.undo()) { toast(T('Geri alınacak hamle yok', 'Nothing to undo')); return false; }
  SV.undo -= 1; save(); updBtns(); beep(440, 0.1, 'triangle', 0.1, 0.6); return true;
}
let toastT = 0;
function toast(s) { const t = $('#toast'); t.textContent = s; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800); }

const BOX_REWARDS = [
  () => { const n = [60, 80, 120, 150, 200, 300][Math.floor(Math.random() * 6)]; SV.tuy += n; return { i: '🪶', s: `+${n} ${T('tüy', 'feathers')}` }; },
  () => { SV.undo += 2; return { i: '↶', s: `+2 ${T('geri alma', 'undos')}` }; },
  () => { const n = 500; SV.tuy += n; return { i: '🪶', s: `+${n} ${T('tüy! Büyük ikramiye', 'feathers! Jackpot')}` }; },
];
function openBox() {
  if (!SV.boxes) { toast(T('Yeni bir FLIX aç, kutu kazan', 'Unlock a new FLIX to earn a box')); return; }
  SV.boxes -= 1; const r = Math.random(); const rew = (r < 0.62 ? BOX_REWARDS[0] : r < 0.93 ? BOX_REWARDS[1] : BOX_REWARDS[2])(); save(); updBtns(); sfx.box();
  modal(`<div class="rv-k">${T('SÜRPRİZ KUTU', 'SURPRISE BOX')}</div><div class="boxa"><div class="bx">🎁</div><div class="bi">${rew.i}</div></div><div class="rv-n">${rew.s}</div><button class="btn y" id="bOk">${T('SÜPER', 'NICE')}</button>`, 'pop box');
  $('#bOk').onclick = closeModal;
}

function album() {
  const cards = TIERS.map((d, i) => {
    const got = SV.seen.includes(i);
    return `<div class="al ${got ? '' : 'lock'}"><div class="ai" style="background:${got ? d.plate : '#0e2350'}">${got ? `<img src="${thumb(i)}" alt="">` : '<b>?</b>'}</div><div class="an">${got ? T(d.tr, d.en) : '???'}</div><div class="ar" style="color:${RCOL[d.r]}">${T('Sv', 'Lv')} ${i + 1} · ${T(d.r, d.re)}</div></div>`;
  }).join('');
  $('#albumGrid').innerHTML = cards; $('#albumCnt').textContent = `${SV.seen.length}/${TIERS.length}`;
  show('albumP');
}
function shop() {
  const th = THEMES.map((t) => {
    const own = SV.owned.includes(t.id), on = SV.theme === t.id;
    return `<div class="sh"><div class="sw" style="background:#${new THREE.Color(t.tray).getHexString()};box-shadow:inset 0 0 0 6px #${new THREE.Color(t.bg).getHexString()}"></div><div class="sn">${T(t.tr, t.en)}</div><button class="btn ${on ? 't' : own ? 'w' : 'y'} sm" data-th="${t.id}">${on ? T('Seçili', 'Selected') : own ? T('Seç', 'Use') : '🪶 ' + t.cost.toLocaleString('tr-TR')}</button></div>`;
  }).join('');
  $('#shopGrid').innerHTML = th + `<div class="sh"><div class="sw u">↶×5</div><div class="sn">${T('5 geri alma', '5 undos')}</div><button class="btn y sm" data-undo="1">🪶 300</button></div>`;
  $('#shopGrid').querySelectorAll('[data-th]').forEach((b) => (b.onclick = () => {
    const t = THEMES.find((x) => x.id === b.dataset.th);
    if (SV.owned.includes(t.id)) { SV.theme = t.id; } else if (SV.tuy >= t.cost) { SV.tuy -= t.cost; SV.owned.push(t.id); SV.theme = t.id; sfx.box(); } else { toast(T('Yeterli tüy yok', 'Not enough feathers')); sfx.no(); return; }
    save(); applyTheme(); updBtns(); shop();
  }));
  $('#shopGrid').querySelector('[data-undo]').onclick = () => { if (SV.tuy < 300) { toast(T('Yeterli tüy yok', 'Not enough feathers')); sfx.no(); return; } SV.tuy -= 300; SV.undo += 5; save(); updBtns(); sfx.box(); toast(T('+5 geri alma', '+5 undos')); };
  show('shopP');
}

// ---------- flow ----------
let homeSpin = 0;
function home() {
  inGame = false; show('homeP'); updBtns();
  const t = Math.max(2, SV.maxTier);
  $('#homeToy').src = thumb(t);
  $('#homeBest').textContent = SV.best.toLocaleString('tr-TR');
  $('#contBtn').hidden = !SV.game;
  needRender = true;
}
function play(fresh) {
  show('gameP'); inGame = true; celebrated = false;
  if (!gm) { gm = new GameManager(4, Input, Actuator, Storage); if (fresh) { roundMax = -1; SV.paid = 0; SV.undo = Math.max(SV.undo, 2); fresh = false; } }
  if (fresh) { roundMax = -1; SV.paid = 0; SV.undo = Math.max(SV.undo, 2); gm.restart(); }
  else { roundMax = -1; gm.actuate(); }
  if (!SV.tut) { SV.tut = 1; save(); toast(T('Kaydır: aynı iki FLIX birleşir', 'Swipe: two equal FLIX merge')); }
}
function newGame() { play(true); }

// lang + sound
function applyLang() {
  document.querySelectorAll('[data-tr]').forEach((e) => (e.textContent = SV.lang === 'en' ? e.dataset.en : e.dataset.tr));
  $('#langBtn').textContent = SV.lang === 'en' ? 'EN' : 'TR'; $('#sndBtn').textContent = SV.snd ? '🔊' : '🔇';
  if (gm && lastMeta) updGoal(roundMax);
}

// buttons
$('#playBtn').onclick = () => { beep(523, 0.08, 'triangle', 0.1); SV.game ? confirmNew() : newGame(); };
$('#contBtn').onclick = () => { beep(523, 0.08, 'triangle', 0.1); play(false); };
function confirmNew() {
  modal(`<div class="rv-n">${T('Yarım kalan oyun silinsin mi?', 'Discard the unfinished game?')}</div><div class="row2"><button class="btn w" id="cN">${T('Vazgeç', 'Cancel')}</button><button class="btn y" id="cY">${T('YENİ OYUN', 'NEW GAME')}</button></div>`, 'pop');
  $('#cN').onclick = closeModal; $('#cY').onclick = () => { closeModal(); newGame(); };
}
$('#albumBtn').onclick = album; $('#shopBtn').onclick = shop;
document.querySelectorAll('.back').forEach((b) => (b.onclick = home));
$('#homeBtn').onclick = home;
$('#undoBtn').onclick = doUndo; $('#boxBtn').onclick = openBox; $('#boxHome').onclick = openBox;
$('#newBtn').onclick = confirmNew;
$('#langBtn').onclick = () => { SV.lang = SV.lang === 'en' ? 'tr' : 'en'; save(); applyLang(); };
$('#sndBtn').onclick = () => { SV.snd = SV.snd ? 0 : 1; save(); applyLang(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && AC) AC.suspend && AC.suspend(); else if (AC) AC.resume && AC.resume(); });

// ---------- loop ----------
let last = performance.now();
function frame() {
  requestAnimationFrame(frame);
  const nowMs = performance.now(), now = nowMs / 1000, dt = Math.min(0.05, (nowMs - last) / 1000); last = nowMs;
  let active = needRender; needRender = false;
  for (const a of anims) {
    const k = Math.min(1, Math.max(0, (now - a.t0) / a.dur)); if (k < 1) active = true;
    if (a.kind === 'slide' || a.kind === 'slideOut') { const e = 1 - Math.pow(1 - k, 3); a.o.position.lerpVectors(a.from, a.to, e); if (a.kind === 'slideOut' && k >= 1) a.o.visible = false; }
    else if (a.kind === 'pop') { const s = k <= 0 ? 0.001 : k < 0.6 ? (k / 0.6) * 1.22 : 1.22 - ((k - 0.6) / 0.4) * 0.22; a.o.scale.setScalar(Math.max(0.001, s)); }
    else if (a.kind === 'spawn') { const s = k <= 0 ? 0.001 : 1 - Math.pow(1 - k, 2); a.o.scale.setScalar(Math.max(0.001, s)); }
  }
  for (let i = fxPool.length - 1; i >= 0; i--) {
    const p = fxPool[i], k = (now - p.t0) / p.life;
    if (k < 0) { active = true; continue; }
    p.m.visible = true; active = true;
    if (k >= 1) { scene.remove(p.m); p.m.material.dispose(); fxPool.splice(i, 1); continue; }
    p.v.y -= 9 * dt; p.m.position.addScaledVector(p.v, dt); p.m.material.opacity = 1 - k;
  }
  if (glowRing.visible) { glowRing.material.color.offsetHSL(dt * 0.1, 0, 0); active = true; }
  if (active) renderer.render(scene, camera);
}

// ---------- boot ----------
resize(); applyTheme(); applyLang();
const logoImg = new Image(); logoImg.src = LOGO_URL;
logoImg.decode().catch(() => {}).then(() => {
  setLogo(logoImg);
  home();
  // pre-build first templates while on home
  [0, 1, 2, 3].forEach(tierTemplate);
  if (SV.game) { gm = new GameManager(4, Input, Actuator, Storage); inGame = false; }
  frame();
  $('#boot').remove();
  window.__fb = { get gm() { return gm; }, SV, move: (d) => Input.emit('move', d), TIERS, render: () => { needRender = true; } };
});
