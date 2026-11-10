// ================= FLIX KART — game layer =================
const VERSION = '3.0';
const $ = (s) => document.querySelector(s);
const SAVE_KEY = 'flix_kart1';
const DEF = { lang: 'tr', snd: 1, tuy: 0, color: 'kirmizi', feather: 'klasik', ownC: ['kirmizi'], ownF: ['klasik'], driver: 'flix', ownD: ['flix', 'wu'], veh: 'klasik', ownV: ['klasik'], up: {}, stars: {}, best: {}, wins: {}, unlocked: ['mutfak'], races: 0, tut: 0 };
let SV; try { SV = Object.assign({}, DEF, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { SV = Object.assign({}, DEF); }
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) {} };
const T = (tr, en) => (SV.lang === 'en' ? en : tr);

const COLORS = [
  { id: 'kirmizi', tr: 'Kırmızı', en: 'Red', c: 0xe22511, cost: 0 }, { id: 'mavi', tr: 'Mavi', en: 'Blue', c: 0x2a80dc, cost: 300 },
  { id: 'yesil', tr: 'Yeşil', en: 'Green', c: 0x2fa043, cost: 300 }, { id: 'sari', tr: 'Sarı', en: 'Yellow', c: 0xffc20e, cost: 500 },
  { id: 'mor', tr: 'Mor', en: 'Purple', c: 0x8a3dd8, cost: 800 }, { id: 'siyah', tr: 'Gece', en: 'Night', c: 0x1b1b22, cost: 1200 },
  { id: 'altin', tr: 'Altın', en: 'Gold', c: 0xd4a000, cost: 3000, metal: 1 },
];
const FEATHERS = [
  { id: 'klasik', tr: 'Klasik', en: 'Classic', f: [C.blue, C.green, C.yel], cost: 0 }, { id: 'deniz', tr: 'Deniz', en: 'Ocean', f: [0x1c6fd6, 0x5fd0ff, 0x1c6fd6], cost: 400 },
  { id: 'ates', tr: 'Ateş', en: 'Fire', f: [C.red, 0xffb000, C.red], cost: 600 }, { id: 'gece', tr: 'Gece', en: 'Midnight', f: [0x1b2a6b, 0xc8d2ff, 0x1b2a6b], cost: 900 },
  { id: 'seker', tr: 'Şeker', en: 'Candy', f: [0xff4fa3, 0xffe066, 0x46d8ff], cost: 1200 }, { id: 'gokkusagi', tr: 'Gökkuşağı', en: 'Rainbow', f: [0xff3b30, 0x34c759, 0x007aff], cost: 2500 },
];
const BOTS_OLD = [
  { n: 'Onat', c: 0x2a80dc, f: [0xffffff, 0x2a80dc, 0xffffff] }, { n: 'Ece', c: 0x2fa043, f: [C.yel, C.green, C.yel] }, { n: 'Kerem', c: 0xffc20e, f: [C.red, C.yel, C.red] },
  { n: 'Zeynep', c: 0x8a3dd8, f: [0xd6a4ff, 0x8a3dd8, 0xd6a4ff] }, { n: 'Mert', c: 0xff7a1a, f: [0xffffff, C.orange, C.navy] },
];
const REWARD = [150, 100, 70, 50, 40, 30];
const VEHICLES = [
  { id: 'klasik', tr: 'Klasik Kart', en: 'Classic Kart', st: [3, 3, 3], cost: 0 },
  { id: 'buggy', tr: 'Plaj Buggy', en: 'Beach Buggy', st: [2, 5, 3], cost: 900 },
  { id: 'canavar', tr: 'Canavar', en: 'Monster', st: [3, 3, 2], cost: 1500, heavy: 1 },
  { id: 'roket', tr: 'Roket', en: 'Rocket', st: [5, 2, 2], cost: 2500 },
  { id: 'jet', tr: 'Tüy Jet', en: 'Feather Jet', st: [4, 4, 4], cost: 5000 },
];
const STATN = [['Hız', 'Speed'], ['Hızlanma', 'Accel'], ['Yol tutuş', 'Handling']];
const upLv = (vid) => (SV.up[vid] || [0, 0, 0]);
const upCost = (l) => Math.round(120 * Math.pow(l + 1, 1.7) / 10) * 10;
function vehStats(vid) { const v = VEHICLES.find((x) => x.id === vid) || VEHICLES[0], u = upLv(v.id); return v.st.map((b, i) => b + u[i] * 0.5); }
function applyStats(k, vid) { const [sp, ac, hn] = vehStats(vid); k.speedMul = 0.91 + sp * 0.03; k.accMul = 0.82 + ac * 0.06; k.turnMul = 0.88 + hn * 0.04; k.heavy = (VEHICLES.find((x) => x.id === vid) || {}).heavy; }

// ---------- audio (see audio.js) ----------
AUD.on = !!SV.snd;
function ac() { AUD.init(); }
const sfx = { pick: () => AUD.play('pickup', { volume: 0.55 }), wall: (v) => AUD.play('crash', { volume: 0.25 + v * 0.4 }), go: () => AUD.play('go', { volume: 0.8 }), tick: () => AUD.play('countdown', { volume: 0.75 }),
  turbo: () => AUD.play('boost', { volume: 0.6 }), mini: () => AUD.play('driftReleaseMiniBoost', { volume: 0.7 }), lvl: () => AUD.play('driftReady', { volume: 0.5 }), lap: () => AUD.play('lap', { volume: 0.7 }), final: () => AUD.play('finalLap', { volume: 0.75 }),
  win: () => AUD.play('victory', { volume: 0.8 }), fin: () => AUD.play('finish', { volume: 0.75 }), buy: () => AUD.play('uiSelect', { volume: 0.6 }), click: () => AUD.play('uiClick', { volume: 0.6 }), no: () => AUD.play('posDown', { volume: 0.5 }),
  up: () => AUD.play('posUp', { volume: 0.45 }), down: () => AUD.play('posDown', { volume: 0.35 }), bump: () => AUD.play('crash', { volume: 0.25 }), land: () => AUD.play('landing', { volume: 0.35 }) };

// ---------- renderer / scene ----------
const cv = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
const camera = new THREE.PerspectiveCamera(64, 1, 0.3, 900);
const hemi = new THREE.HemisphereLight(0xdbe8ff, 0x9a6a40, 0.8); scene.add(hemi);
const sunL = new THREE.DirectionalLight(0xffe2b8, 3.2); sunL.castShadow = true; sunL.shadow.mapSize.set(1024, 1024);
Object.assign(sunL.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); sunL.shadow.bias = -0.0006; sunL.shadow.normalBias = 0.03;
scene.add(sunL); scene.add(sunL.target);
let W = 1, H = 1;
function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); cv.style.width = W + 'px'; cv.style.height = H + 'px'; camera.aspect = W / H; camera.fov = W / H < 0.75 ? 66 : 55; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);

// ---------- textures ----------
const woodTex = () => { const t = canvasTex(1024, 1024, (c, w, h) => {
  for (let p = 0; p < 6; p++) { const x0 = p * w / 6, base = [34, 30, 28, 32, 29, 33][p];
    for (let y = 0; y < h; y += 2) { const n = Math.sin(y * 0.011 + p * 7) * 6 + Math.sin(y * 0.047 + p) * 3; c.fillStyle = `hsl(${base},${45 + n * 0.5}%,${52 + n}%)`; c.fillRect(x0, y, w / 6, 2); }
    c.globalAlpha = 0.12; for (let k = 0; k < 60; k++) { c.strokeStyle = rnd() < 0.5 ? '#5a3418' : '#f3d6a8'; c.lineWidth = rnd(0.6, 2); c.beginPath(); const xx = x0 + rnd(0, w / 6); c.moveTo(xx, 0); c.bezierCurveTo(xx + rnd(-20, 20), h / 3, xx + rnd(-20, 20), 2 * h / 3, xx + rnd(-10, 10), h); c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = 'rgba(60,30,10,.5)'; c.fillRect(x0, 0, 3, h); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const grassTex = () => { const t = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#5aa83a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 14000; i++) { c.fillStyle = `hsla(${95 + rnd(-12, 12)},55%,${38 + rnd(-12, 14)}%,.6)`; c.fillRect(rnd(0, w), rnd(0, h), 2, rnd(2, 6)); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const tileTex = () => { const t = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#5a9fb8'; c.fillRect(0, 0, w, h); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#e8f8ff' : '#7fd3ef'; c.fillRect(x * 128 + 3, y * 128 + 3, 122, 122); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const metalTex = () => { const t = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#8d939c'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.18)'; for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w; x += 32) { c.save(); c.translate(x + 8, y + 8); c.rotate(0.7); c.fillRect(-9, -2, 18, 4); c.restore(); } c.fillStyle = '#ffd41f'; for (let i = -h; i < w; i += 64) { c.save(); c.beginPath(); c.rect(0, 0, w, 24); c.clip(); c.fillRect(i, 0, 28, 24); c.restore(); } c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 24, w, 3); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const THEME = { mutfak: { bg: 0xf3dcc0, hc: 0xfff0dc, hg: 0x9a6a40, tex: () => woodTex(), rep: 7, rough: 0.42, cc: 0.3 }, oda: { bg: 0xcfe3ff, hc: 0xe6f0ff, hg: 0x3050a0, tex: () => carpetTex(), rep: 10, rough: 0.95, cc: 0 },
  bahce: { bg: 0xaee0ff, hc: 0xf2fbff, hg: 0x4a8a2a, tex: () => grassTex(), rep: 30, rough: 0.95, cc: 0 }, banyo: { bg: 0xe2f6ff, hc: 0xffffff, hg: 0x6aa6c0, tex: () => tileTex(), rep: 26, rough: 0.2, cc: 0.8 },
  fabrika: { bg: 0xd8d2c8, hc: 0xfff4e0, hg: 0x5a5048, tex: () => metalTex(), rep: 24, rough: 0.5, cc: 0.2 } };
const carpetTex = () => { const t = canvasTex(512, 512, (c, w, h) => {
  c.fillStyle = '#3c6fd1'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = `hsla(${215 + rnd(-8, 8)},60%,${42 + rnd(-10, 10)}%,.5)`; c.fillRect(rnd(0, w), rnd(0, h), 2, 2); }
  c.strokeStyle = 'rgba(255,212,31,.55)'; c.lineWidth = 10; c.strokeRect(30, 30, w - 60, h - 60); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.strokeRect(50, 50, w - 100, h - 100);
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(w / 2, h / 2, 40 + i * 30, 0, 7); c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.2)'; c.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const roadTex = canvasTex(256, 512, (c, w, h) => {
  c.fillStyle = '#3a3f4a'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(255,255,255,${rnd(0, 0.06)})`; c.fillRect(rnd(0, w), rnd(0, h), 2, 2); }
  c.fillStyle = '#fff'; c.fillRect(14, 0, 6, h); c.fillRect(w - 20, 0, 6, h);
  for (let y = 0; y < h; y += 128) { c.fillStyle = '#ffd41f'; c.fillRect(w / 2 - 4, y + 20, 8, 70); }
  for (let y = 0; y < h; y += 64) { c.fillStyle = (y / 64) % 2 ? '#e22511' : '#ffffff'; c.fillRect(0, y, 12, 64); c.fillRect(w - 12, y, 12, 64); }
});
roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping; roadTex.anisotropy = 8;
const railTex = canvasTex(256, 32, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e22511'; c.fillRect(i * 32, 0, 32, h); } });
railTex.wrapS = railTex.wrapT = THREE.RepeatWrapping;

// ---------- world building ----------
let world = null; // {group, tr, pickups, pads}
function ribbon(tr, off, wdt, y, uvScale) {
  const pos = [], uv = [], idx = [], N = tr.N; let acc = 0;
  for (let i = 0; i <= N; i++) { const j = i % N, p = tr.P[j], n = tr.Nm[j];
    const a = p.clone().addScaledVector(n, off - wdt / 2), b = p.clone().addScaledVector(n, off + wdt / 2);
    pos.push(a.x, y, a.z, b.x, y, b.z); if (i) acc += tr.P[j].distanceTo(tr.P[(j - 1 + N) % N]); uv.push(0, acc / uvScale, 1, acc / uvScale);
    if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function rail(tr, side) {
  const half = tr.W / 2 + 0.25, pts = [];
  for (let i = 0; i < tr.N; i += 2) pts.push(tr.P[i].clone().addScaledVector(tr.Nm[i], side * half).setY(0.45));
  const c = new THREE.CatmullRomCurve3(pts, true); const g = new THREE.TubeGeometry(c, Math.round(tr.N / 1.5), 0.45, 8, true);
  const t = railTex.clone(); t.needsUpdate = true; t.repeat.set(tr.len / 6, 1); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const m = new THREE.Mesh(g, phys(0xffffff, { map: t, roughness: 0.45, clearcoat: 0.4 })); m.castShadow = true; m.receiveShadow = true; return m;
}
function farFromTrack(tr, x, z, r) { const i = nearest(tr, x, z, -1); return tr.P[i].distanceTo(new THREE.Vector3(x, 0, z)) > tr.W / 2 + r + 2; }

function buildWorld(def) {
  if (world) { scene.remove(world.group); world.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
  const tr = buildTrack(def), g = new THREE.Group(); scene.add(g);
  const th = def.w || 'mutfak', TH = THEME[th], kitchen = th === 'mutfak';
  scene.background = new THREE.Color(TH.bg); scene.fog = new THREE.Fog(scene.background, 160, 520);
  hemi.color.set(TH.hc); hemi.groundColor.set(TH.hg);
  // floor
  const ft = TH.tex(); ft.repeat.set(TH.rep, TH.rep);
  const floor = mesh(new THREE.PlaneGeometry(700, 700), phys(0xffffff, { map: ft, roughness: TH.rough, clearcoat: TH.cc }), g); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  // road
  const road = new THREE.Mesh(ribbon(tr, 0, tr.W + 0.6, 0.03, 16), phys(0xffffff, { map: roadTex, roughness: 0.8 })); road.receiveShadow = true; g.add(road);
  g.add(rail(tr, -1)); g.add(rail(tr, 1));
  // start line + arch
  const i0 = 0, P0 = tr.P[i0], T0 = tr.Tn[i0], N0 = tr.Nm[i0], yaw0 = Math.atan2(-T0.x, -T0.z);
  const chk = canvasTex(256, 64, (c) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? '#111' : '#f4f1ea'; c.fillRect(i * 16, j * 16, 16, 16); } });
  const sl = mesh(new THREE.PlaneGeometry(tr.W, 2.4), phys(0xffffff, { map: chk, roughness: 0.8 }), g, P0.x, 0.05, P0.z); sl.rotation.set(-Math.PI / 2, 0, yaw0); sl.castShadow = false;
  const arch = new THREE.Group(); arch.position.set(P0.x, 0, P0.z); arch.rotation.y = yaw0; g.add(arch);
  const navy = phys(C.navy, { roughness: 0.4, clearcoat: 0.5 });
  mesh(new THREE.CylinderGeometry(0.5, 0.5, 11, 12), navy, arch, -tr.W / 2 - 1, 5.5, 0); mesh(new THREE.CylinderGeometry(0.5, 0.5, 11, 12), navy, arch, tr.W / 2 + 1, 5.5, 0);
  const ban = canvasTex(1024, 192, (c, w, h) => { c.fillStyle = '#e22511'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd41f'; c.fillRect(0, h - 18, w, 18); c.fillRect(0, 0, w, 10);
    if (LOGO_IMG) for (const x of [70, w - 230]) c.drawImage(LOGO_IMG, x, 24, 160, 143);
    c.fillStyle = '#fff'; c.font = 'italic 900 112px "Barlow Condensed", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FLIX KART', w / 2, h / 2 + 4); });
  mesh(new RoundedBoxGeometry(tr.W + 3, 2.6, 0.6, 2, 0.15), [navy, navy, navy, navy, phys(0xffffff, { map: ban, roughness: 0.5 }), phys(0xffffff, { map: ban, roughness: 0.5 })], arch, 0, 10.2, 0);
  // props
  const props = new THREE.Group(); g.add(props);
  const tryPlace = (fn, r, tries = 40) => { for (let n = 0; n < tries; n++) { const x = rnd(-160, 200), z = rnd(-150, 220); if (farFromTrack(tr, x, z, r)) { fn(x, z); return; } } };
  if (kitchen) {
    const mug = (x, z, col) => { const m = new THREE.Group(); m.position.set(x, 0, z); props.add(m); const s = 4.2;
      mesh(new THREE.CylinderGeometry(1.6 * s, 1.45 * s, 3.4 * s, 40, 1, true), phys(col, { roughness: 0.15, clearcoat: 1, side: THREE.DoubleSide }), m, 0, 1.7 * s, 0);
      mesh(new THREE.CircleGeometry(1.5 * s, 32), phys(0x3a1e0e, { roughness: 0.1, clearcoat: 1 }), m, 0, 2.9 * s, 0).rotation.x = -Math.PI / 2;
      const hh = mesh(new THREE.TorusGeometry(0.85 * s, 0.2 * s, 12, 32, Math.PI), phys(col, { roughness: 0.15, clearcoat: 1 }), m, 1.55 * s, 1.8 * s, 0); hh.rotation.z = -Math.PI / 2; };
    const cereal = (x, z, ry) => { const cb = canvasTex(512, 768, (c, w, hh) => { const gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#ffcf3a'); gr.addColorStop(1, '#ff8a1a'); c.fillStyle = gr; c.fillRect(0, 0, w, hh);
      c.fillStyle = '#e22511'; c.beginPath(); c.arc(w / 2, hh * 0.62, 190, 0, 7); c.fill(); if (LOGO_IMG) c.drawImage(LOGO_IMG, 80, 80, 352, 314);
      c.fillStyle = '#022753'; c.font = 'italic 900 64px "Barlow Condensed", Impact, sans-serif'; c.textAlign = 'center'; c.fillText('FLIX FLAKES', w / 2, hh * 0.66); c.font = '700 30px Rubik, sans-serif'; c.fillText(T('KAHVALTININ ŞAMPİYONU', 'BREAKFAST OF CHAMPIONS'), w / 2, hh * 0.74); });
      const s = 4.5, b = mesh(new THREE.BoxGeometry(3.2 * s, 4.8 * s, 1.2 * s), [phys(0xff9a2a), phys(0xff9a2a), phys(0xffc23a), phys(0xffc23a), phys(0xffffff, { map: cb, roughness: 0.5 }), phys(0xff9a2a)], props, x, 2.4 * s, z); b.rotation.y = ry; };
    const fruit = (x, z, r, col) => { mesh(new THREE.SphereGeometry(r, 32, 20), phys(col, { roughness: 0.3, clearcoat: 0.8 }), props, x, r * 0.95, z); mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.4, 8), phys(0x5a3a1a), props, x, r * 1.9 + 0.4, z); };
    const plate = (x, z) => { mesh(new THREE.CylinderGeometry(9, 7, 0.8, 40), phys(0xffffff, { roughness: 0.15, clearcoat: 1 }), props, x, 0.4, z); };
    tryPlace((x, z) => mug(x, z, 0x2c5fa8), 8); tryPlace((x, z) => mug(x, z, 0xe22511), 8); tryPlace((x, z) => cereal(x, z, rnd(0, 3)), 10); tryPlace((x, z) => cereal(x, z, rnd(0, 3)), 10);
    for (let i = 0; i < 7; i++) tryPlace((x, z) => fruit(x, z, rnd(3, 5), [0xd8261d, 0xf58a12, 0x7cc02a][i % 3]), 5);
    for (let i = 0; i < 3; i++) tryPlace(plate, 10);
  } else if (th === 'oda') {
    const blk = (x, z, s, col, letter) => { const t = letter ? canvasTex(128, 128, (c) => { c.fillStyle = '#' + new THREE.Color(col).getHexString(); c.fillRect(0, 0, 128, 128); c.fillStyle = '#fff'; c.font = '900 92px Rubik, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letter, 64, 70); }) : null;
      const m = mesh(new RoundedBoxGeometry(s, s, s, 3, s * 0.08), phys(t ? 0xffffff : col, { map: t, roughness: 0.4, clearcoat: 0.4 }), props, x, s / 2, z); m.rotation.y = rnd(0, 3); };
    const ball = (x, z, r) => { const t = canvasTex(256, 128, (c) => { ['#e22511', '#ffd41f', '#2a80dc', '#2fa043'].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * 64, 0, 64, 128); }); }); mesh(new THREE.SphereGeometry(r, 32, 20), phys(0xffffff, { map: t, roughness: 0.3, clearcoat: 0.6 }), props, x, r, z); };
    const crayon = (x, z, col) => { const m = mesh(new THREE.CylinderGeometry(0.9, 0.9, 16, 8), phys(col, { roughness: 0.6 }), props, x, 0.9, z); m.rotation.set(Math.PI / 2, 0, rnd(0, 3)); m.rotation.order = 'YXZ'; m.rotation.y = rnd(0, 3); };
    'FLIXKART'.split('').forEach((L, i) => tryPlace((x, z) => blk(x, z, rnd(6, 9), [C.red, C.yel, C.blue, C.green][i % 4], L), 7));
    for (let i = 0; i < 5; i++) tryPlace((x, z) => ball(x, z, rnd(4, 7)), 7);
    for (let i = 0; i < 6; i++) tryPlace((x, z) => crayon(x, z, [C.red, C.yel, C.blue, C.green, 0x8a3dd8, C.orange][i]), 9);
  } else if (th === 'bahce') {
    const flower = (x, z) => { const f = new THREE.Group(); f.position.set(x, 0, z); props.add(f); const h = rnd(5, 9), col = [0xff4fa3, 0xffd41f, 0xff6a3a, 0xb06bff, 0xffffff][Math.floor(rnd(0, 5))];
      mesh(new THREE.CylinderGeometry(0.3, 0.35, h, 8), phys(0x3f8a2a), f, 0, h / 2, 0); const hd = new THREE.Group(); hd.position.y = h; f.add(hd);
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, pt = mesh(new THREE.SphereGeometry(1.4, 12, 8), phys(col, { roughness: 0.5 }), hd, Math.cos(a) * 1.6, 0, Math.sin(a) * 1.6); pt.scale.set(1, 0.35, 0.7); pt.rotation.y = -a; }
      mesh(new THREE.SphereGeometry(1.1, 14, 10), phys(0xffc20e, { roughness: 0.6 }), hd, 0, 0.2, 0); hd.rotation.x = rnd(-0.3, 0.3); };
    const pot = (x, z) => { const s = rnd(3, 5); mesh(new THREE.CylinderGeometry(1.3 * s, 1 * s, 1.8 * s, 24), phys(0xc8643a, { roughness: 0.8 }), props, x, 0.9 * s, z); mesh(new THREE.SphereGeometry(1.5 * s, 18, 12), phys(0x3f9a3a, { roughness: 0.9 }), props, x, 2.4 * s, z); };
    const shroom = (x, z) => { const s = rnd(3, 5); mesh(new THREE.CylinderGeometry(0.6 * s, 0.8 * s, 2 * s, 14), phys(0xfff2dc), props, x, s, z); const cap = mesh(new THREE.SphereGeometry(1.6 * s, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), phys(0xe22511, { roughness: 0.4, clearcoat: 0.6 }), props, x, 1.9 * s, z);
      for (let i = 0; i < 6; i++) { const a = rnd(0, 6), r = rnd(0.5, 1.2) * s; mesh(new THREE.SphereGeometry(0.25 * s, 8, 6), phys(0xffffff), props, x + Math.cos(a) * r, 1.9 * s + Math.sqrt(Math.max(0, (1.6 * s) ** 2 - r * r)) - 0.1, z + Math.sin(a) * r); } };
    const can = (x, z) => { const s = 4, m = new THREE.Group(); m.position.set(x, 0, z); m.rotation.y = rnd(0, 6); props.add(m); mesh(new THREE.CylinderGeometry(1.2 * s, 1.3 * s, 2 * s, 24), phys(0x2a80dc, { roughness: 0.3, metalness: 0.4 }), m, 0, s, 0);
      const sp = mesh(new THREE.CylinderGeometry(0.15 * s, 0.25 * s, 2.4 * s, 10), phys(0x2a80dc, { metalness: 0.4, roughness: 0.3 }), m, 1.5 * s, 1.6 * s, 0); sp.rotation.z = -0.9; };
    for (let i = 0; i < 14; i++) tryPlace(flower, 4); for (let i = 0; i < 4; i++) tryPlace(pot, 7); for (let i = 0; i < 4; i++) tryPlace(shroom, 7); tryPlace(can, 8);
  } else if (th === 'banyo') {
    const duck = (x, z) => { const s = rnd(4, 6), d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = rnd(0, 6); props.add(d); const y = phys(0xffd41f, { roughness: 0.25, clearcoat: 1 });
      const b = mesh(new THREE.SphereGeometry(1.3 * s, 24, 16), y, d, 0, 1.1 * s, 0); b.scale.set(1, 0.75, 1.3); mesh(new THREE.SphereGeometry(0.8 * s, 20, 14), y, d, 0, 2.2 * s, -0.8 * s);
      const bk = mesh(new THREE.ConeGeometry(0.35 * s, 0.7 * s, 12), phys(0xff7a1a), d, 0, 2.1 * s, -1.55 * s); bk.rotation.x = -Math.PI / 2; for (const e of [-1, 1]) mesh(new THREE.SphereGeometry(0.12 * s, 8, 6), phys(0x111111), d, e * 0.35 * s, 2.45 * s, -1.4 * s); };
    const soap = (x, z) => { const s = rnd(3, 4.5); const m = mesh(new RoundedBoxGeometry(3 * s, 1.1 * s, 2 * s, 3, 0.5 * s), phys([0xff9ac8, 0x9fe0ff, 0xc8ffb0][Math.floor(rnd(0, 3))], { roughness: 0.2, clearcoat: 1 }), props, x, 0.55 * s, z); m.rotation.y = rnd(0, 3); };
    const bottle = (x, z) => { const s = rnd(4, 6), col = [0xe22511, 0x2a80dc, 0x8a3dd8][Math.floor(rnd(0, 3))]; const lb = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); if (LOGO_IMG) c.drawImage(LOGO_IMG, 48, 30, 160, 143); c.fillStyle = '#022753'; c.font = '800 34px Rubik, sans-serif'; c.textAlign = 'center'; c.fillText(T('KÖPÜK', 'BUBBLES'), w / 2, 220); });
      mesh(new THREE.CylinderGeometry(1 * s, 1 * s, 3.4 * s, 24), [phys(col, { roughness: 0.2, clearcoat: 1 }), phys(col), phys(col)], props, x, 1.7 * s, z); const l = mesh(new THREE.CylinderGeometry(1.02 * s, 1.02 * s, 1.6 * s, 24, 1, true, -0.8, 1.6), phys(0xffffff, { map: lb }), props, x, 1.8 * s, z); l.rotation.y = rnd(0, 6); mesh(new THREE.CylinderGeometry(0.4 * s, 0.5 * s, 0.8 * s, 14), phys(0xffffff), props, x, 3.8 * s, z); };
    const bubble = (x, z) => { mesh(new THREE.SphereGeometry(rnd(2, 4), 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0, transparent: true, opacity: 0.35, roughness: 0, iridescence: 1, clearcoat: 1 }), props, x, rnd(4, 14), z); };
    for (let i = 0; i < 4; i++) tryPlace(duck, 8); for (let i = 0; i < 5; i++) tryPlace(soap, 7); for (let i = 0; i < 4; i++) tryPlace(bottle, 6); for (let i = 0; i < 14; i++) tryPlace(bubble, 4);
  } else {
    const crateT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#c99a5c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#8a6232'; c.lineWidth = 14; c.strokeRect(8, 8, w - 16, h - 16); c.beginPath(); c.moveTo(8, 8); c.lineTo(w - 8, h - 8); c.stroke(); if (LOGO_IMG) c.drawImage(LOGO_IMG, 58, 66, 140, 125); });
    const crate = (x, z) => { const s = rnd(5, 8); const m = mesh(new THREE.BoxGeometry(s, s, s), phys(0xffffff, { map: crateT, roughness: 0.8 }), props, x, s / 2, z); m.rotation.y = rnd(0, 3); };
    const giant = (x, z) => { const t = makeToy({ colors: [[C.blue, C.green, C.yel], [C.red, 0xffb000, C.red], [0x1c6fd6, 0x5fd0ff, 0x1c6fd6]][Math.floor(rnd(0, 3))], lite: true }); t.scale.setScalar(rnd(9, 13)); t.position.set(x, 0, z); t.rotation.y = rnd(0, 6); props.add(t); };
    const barrel = (x, z) => { const col = rnd() < 0.5 ? 0xe22511 : 0xffd41f; mesh(new THREE.CylinderGeometry(2.4, 2.4, 6, 20), phys(col, { roughness: 0.4, metalness: 0.3 }), props, x, 3, z); for (const y of [1.2, 4.8]) mesh(new THREE.TorusGeometry(2.42, 0.15, 6, 24), phys(0x333333), props, x, y, z).rotation.x = Math.PI / 2; };
    const belt = (x, z) => { const m = new THREE.Group(); m.position.set(x, 0, z); m.rotation.y = rnd(0, 3); props.add(m); mesh(new THREE.BoxGeometry(30, 3, 6), phys(0x4a4f58, { metalness: 0.5, roughness: 0.4 }), m, 0, 1.5, 0); mesh(new THREE.BoxGeometry(30.2, 0.3, 5), phys(0x1b1b22), m, 0, 3.1, 0);
      for (let i = -2; i <= 2; i++) { const t = makeToy({ lite: true }); t.scale.setScalar(2.2); t.position.set(i * 5.5, 3.2, 0); m.add(t); } };
    for (let i = 0; i < 8; i++) tryPlace(crate, 6); for (let i = 0; i < 4; i++) tryPlace(giant, 9); for (let i = 0; i < 6; i++) tryPlace(barrel, 4); for (let i = 0; i < 2; i++) tryPlace(belt, 17);
  }
  // chevron boards on the outside of sharp corners
  const chevT = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#ffd41f'; c.fillRect(0, 0, w, h); c.fillStyle = '#022753'; for (let k = 0; k < 3; k++) { const x = 40 + k * 70; c.beginPath(); c.moveTo(x, 14); c.lineTo(x + 46, 64); c.lineTo(x, 114); c.lineTo(x + 22, 114); c.lineTo(x + 68, 64); c.lineTo(x + 22, 14); c.closePath(); c.fill(); } c.strokeStyle = '#022753'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10); });
  const chevL = phys(0xffffff, { map: chevT, roughness: 0.5 }), chevR = chevL.clone(); chevR.map = chevT.clone(); chevR.map.needsUpdate = true; chevR.map.wrapS = THREE.RepeatWrapping; chevR.map.repeat.x = -1;
  const postM = phys(0x022753, { roughness: 0.5 });
  let lastC = -99;
  for (let i = 0; i < tr.N; i += 3) { if (tr.K[i] < 0.42 || i - lastC < 14) continue; lastC = i;
    const a = tr.Tn[i], b = tr.Tn[(i + 10) % tr.N], turn = a.x * b.z - a.z * b.x; // >0: turning right (screen) in x/z
    const out = turn > 0 ? 1 : -1; // outside side along normal
    for (const dj of [4, 9, 14]) { const j = (i + dj) % tr.N, P = tr.P[j].clone().addScaledVector(tr.Nm[j], out * (tr.W / 2 + 2.2));
      const bd = new THREE.Group(); bd.position.set(P.x, 0, P.z); bd.rotation.y = Math.atan2(-tr.Tn[j].x, -tr.Tn[j].z); g.add(bd);
      mesh(new THREE.BoxGeometry(3.6, 1.8, 0.2), [postM, postM, postM, postM, out > 0 ? chevL : chevR, postM], bd, 0, 2.4, 0); mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 8), postM, bd, 0, 0.8, 0); } }
  // sponsor billboards facing the track
  const ads = [['FLIX KICK UP', '#e22511', '#ffd41f'], ['FLIX ARKANA', '#14062a', '#ffc20e'], ['FLIX 3 2 1', '#022753', '#ffffff'], ['FLIX TOYS', '#ffd41f', '#e22511']];
  ads.forEach((ad, n) => { const i = Math.round(((n + 0.5) / ads.length + 0.07) * tr.N) % tr.N, side = n % 2 ? 1 : -1;
    const P = tr.P[i].clone().addScaledVector(tr.Nm[i], side * (tr.W / 2 + 6)); if (!farFromTrack(tr, P.x, P.z, 3)) return;
    const tx = canvasTex(1024, 384, (c, w, h) => { c.fillStyle = ad[1]; c.fillRect(0, 0, w, h); c.fillStyle = ad[2]; c.fillRect(0, h - 26, w, 26); if (LOGO_IMG) c.drawImage(LOGO_IMG, 30, 50, 280, 250); c.fillStyle = ad[2]; c.font = 'italic 900 120px "Barlow Condensed", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ad[0].replace('FLIX ', ''), w * 0.64, h * 0.42); c.font = '800 44px Rubik, sans-serif'; c.fillText(T('ŞİMDİ OYNA', 'PLAY NOW'), w * 0.64, h * 0.75); });
    const bb = new THREE.Group(); bb.position.set(P.x, 0, P.z); const tn = tr.Tn[i]; bb.rotation.y = Math.atan2(-tn.x, -tn.z) + side * Math.PI / 2; g.add(bb);
    const face = phys(0xffffff, { map: tx, roughness: 0.4, emissive: 0x222222 });
    mesh(new THREE.BoxGeometry(14, 5.2, 0.4), [postM, postM, postM, postM, face, postM], bb, 0, 6.2, 0); for (const x of [-5, 5]) mesh(new THREE.CylinderGeometry(0.25, 0.25, 4, 8), postM, bb, x, 2, 0); });
  // pickups (feathers) + turbo pads
  const pickups = [], pads = [];
  const fMat = FEATHERS.map((f) => new THREE.MeshStandardMaterial({ map: featherTex(f.f[1]), alphaTest: 0.35, side: THREE.DoubleSide, emissive: 0x332200, roughness: 0.5 }));
  const fGeo = new THREE.PlaneGeometry(1.2, 3.2);
  const glowTex = canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,230,90,.95)'); gr.addColorStop(1, 'rgba(255,200,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); });
  const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }), glowGeo = new THREE.PlaneGeometry(4, 4);
  for (let s = 0.12; s < 0.98; s += 0.11) {
    const i = Math.round(s * tr.N);
    for (const o of [-0.28, 0, 0.28]) { const p = tr.P[i].clone().addScaledVector(tr.Nm[i], o * tr.W);
      const m = new THREE.Group(); const mat = fMat[(i + Math.round(o * 10) + 60) % fMat.length];
      const a = new THREE.Mesh(fGeo, mat), b = new THREE.Mesh(fGeo, mat); b.rotation.y = Math.PI / 2; m.add(a, b); m.scale.setScalar(1.25);
      const gl = new THREE.Mesh(glowGeo, glowMat); gl.rotation.x = -Math.PI / 2; gl.position.y = -1.85; m.add(gl);
      m.position.set(p.x, 2.2, p.z); g.add(m); pickups.push({ m, x: p.x, z: p.z, off: 0, i }); }
  }
  const padTex = canvasTex(128, 128, (c) => { c.fillStyle = '#ffd41f'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#e22511'; c.lineWidth = 16; c.lineCap = 'round'; for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(24, 92 - k * 44); c.lineTo(64, 56 - k * 44); c.lineTo(104, 92 - k * 44); c.stroke(); } });
  for (const s of [0.3, 0.62, 0.86]) { const i = Math.round(s * tr.N), o = (s * 7 % 1 - 0.5) * 0.4 * tr.W; const p = tr.P[i].clone().addScaledVector(tr.Nm[i], o);
    const m = mesh(new THREE.PlaneGeometry(4.4, 4.4), new THREE.MeshStandardMaterial({ map: padTex, emissive: 0x664400, roughness: 0.4 }), g, p.x, 0.07, p.z); m.rotation.set(-Math.PI / 2, 0, Math.atan2(-tr.Tn[i].x, -tr.Tn[i].z)); m.castShadow = false; pads.push({ x: p.x, z: p.z }); }
  world = { group: g, tr, pickups, pads, def };
  drawMinimapBase();
}

// ---------- karts ----------
function kartMesh(col, feathers, metal, driverId, vid) {
  const g = new THREE.Group(), body = phys(col, { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.06, metalness: metal ? 0.8 : 0.15 });
  const dark = phys(0x1b1b22, { roughness: 0.45 }), chrome = phys(0xe8e8ee, { metalness: 1, roughness: 0.18 }), white = phys(0xf4f1ea, { roughness: 0.4 });
  const inner = new THREE.Group(); g.add(inner); inner.scale.setScalar(2.4);
  const chassis = new THREE.Group(); inner.add(chassis);
  // floor pan + body tub with a pointed nose
  mesh(new RoundedBoxGeometry(1.0, 0.12, 1.75, 2, 0.05), dark, chassis, 0, 0.17, 0);
  mesh(new RoundedBoxGeometry(0.9, 0.26, 1.15, 3, 0.11), body, chassis, 0, 0.32, 0.12);
  mesh(new RoundedBoxGeometry(0.62, 0.2, 0.7, 3, 0.09), body, chassis, 0, 0.3, -0.62);
  const nose = mesh(new RoundedBoxGeometry(1.08, 0.12, 0.26, 2, 0.05), body, chassis, 0, 0.2, -0.98);
  mesh(new RoundedBoxGeometry(0.5, 0.05, 0.3, 2, 0.02), white, chassis, 0, 0.41, -0.66);
  // side pods with white racing stripe
  for (const sx of [-1, 1]) { mesh(new RoundedBoxGeometry(0.22, 0.2, 0.8, 2, 0.08), body, chassis, sx * 0.52, 0.27, 0.1); mesh(new THREE.BoxGeometry(0.02, 0.06, 0.72), white, chassis, sx * 0.635, 0.3, 0.1); }
  // seat + backrest, steering column + wheel
  mesh(new RoundedBoxGeometry(0.46, 0.08, 0.42, 2, 0.03), dark, chassis, 0, 0.44, 0.24);
  const back = mesh(new RoundedBoxGeometry(0.46, 0.24, 0.08, 2, 0.03), dark, chassis, 0, 0.55, 0.47); back.rotation.x = -0.25;
  const col2 = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), dark, chassis, 0, 0.5, -0.18); col2.rotation.x = 1.0;
  const wheel = new THREE.Group(); wheel.position.set(0, 0.62, -0.08); wheel.rotation.x = -1.0; chassis.add(wheel);
  mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 18), dark, wheel).rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.24, 0.02, 0.03), chrome, wheel);
  // rear wing on struts with the logo
  const wingT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#' + new THREE.Color(col).getHexString(); c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(0, h - 8, w, 8); if (LOGO_IMG) c.drawImage(LOGO_IMG, w / 2 - 34, 4, 68, 56); });
  mesh(new RoundedBoxGeometry(1.1, 0.2, 0.12, 2, 0.05), [body, body, body, body, phys(0xffffff, { map: wingT, roughness: 0.3, clearcoat: 1 }), body], chassis, 0, 0.38, 0.86);
  mesh(new RoundedBoxGeometry(0.9, 0.05, 0.22, 2, 0.02), body, chassis, 0, 0.5, 0.8).rotation.x = -0.15;
  // exhausts
  for (const sx of [0.18, -0.18]) { const e = mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.3, 10), chrome, chassis, sx * 2.2, 0.2, 0.95); e.rotation.x = Math.PI / 2; }
  // wheels: chunky tyres, coloured rims, front ones steer
  const tire = phys(0x18181c, { roughness: 0.8 }), rim = phys(col, { metalness: 0.6, roughness: 0.25 }); const wheels = [];
  for (const [wx, wz, r, wd] of [[-0.6, -0.62, 0.21, 0.2], [0.6, -0.62, 0.21, 0.2], [-0.64, 0.6, 0.27, 0.28], [0.64, 0.6, 0.27, 0.28]]) {
    const piv = new THREE.Group(); piv.position.set(wx, r, wz); inner.add(piv); const w = new THREE.Group(); piv.add(w);
    const t = mesh(new THREE.CylinderGeometry(r, r, wd, 18), tire, w); t.rotation.z = Math.PI / 2;
    const rr = mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, wd + 0.02, 10), rim, w); rr.rotation.z = Math.PI / 2;
    const hub = mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, wd + 0.04, 8), chrome, w); hub.rotation.z = Math.PI / 2;
    wheels.push({ piv, w }); }
  // driver
  const drv = makeDriver(driverId || 'flix'); drv.g.position.set(0, 0.5, 0.2); drv.g.scale.setScalar(1.75 / 2.4); chassis.add(drv.g);
  // small FLIX toy mascot on the nose (feather colours from the garage)
  const toy = makeToy({ colors: feathers, lite: true }); toy.scale.setScalar(0.2); toy.position.set(0, 0.36, -0.92); toy.rotation.x = -0.2; chassis.add(toy);
  // turbo flames (colour set per frame)
  const flames = new THREE.Group(); chassis.add(flames); const fm = [];
  for (const sx of [0.18, -0.18]) { const m1 = new THREE.MeshBasicMaterial({ color: 0x6fd8ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.9, 10, 1, true), m1); f.rotation.x = Math.PI / 2; f.position.set(sx * 2.2, 0.2, 1.48); flames.add(f); fm.push(m1);
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false })); f2.rotation.x = Math.PI / 2; f2.position.set(sx * 2.2, 0.2, 1.31); flames.add(f2); }
  flames.visible = false;
  // blob shadow keeps karts grounded on phones
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.55 })); bs.rotation.x = -Math.PI / 2; bs.position.y = 0.02; inner.add(bs);
  // vehicle styles
  if (vid === 'buggy' || vid === 'canavar') { const sc = vid === 'canavar' ? 1.65 : 1.25; wheels.forEach((w) => { w.piv.scale.setScalar(sc); w.piv.position.y *= sc; w.piv.position.x *= vid === 'canavar' ? 1.12 : 1.04; }); chassis.position.y += vid === 'canavar' ? 0.22 : 0.08; drv.g.position.y += 0; }
  if (vid === 'buggy') { const cage = phys(0x1b1b22, { roughness: 0.4, metalness: 0.5 }); for (const sx of [-0.3, 0.3]) { const a = mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 16, Math.PI), cage, chassis, sx, 0.5, 0.22); a.rotation.y = Math.PI / 2; } mesh(new THREE.BoxGeometry(0.64, 0.04, 0.04), cage, chassis, 0, 0.92, 0.22); }
  if (vid === 'roket') { const cone = mesh(new THREE.ConeGeometry(0.2, 0.7, 14), body, chassis, 0, 0.3, -1.32); cone.rotation.x = -Math.PI / 2; for (const sx of [-1, 1]) { const fin = mesh(new THREE.BoxGeometry(0.03, 0.42, 0.4), phys(0xffffff, { roughness: 0.3 }), chassis, sx * 0.34, 0.62, 0.72); fin.rotation.z = sx * 0.3; } const big = mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 14), chrome, chassis, 0, 0.48, 0.92); big.rotation.x = Math.PI / 2; }
  if (vid === 'jet') { for (const sx of [-1, 1]) { const wg = mesh(new RoundedBoxGeometry(0.62, 0.04, 0.32, 2, 0.02), body, chassis, sx * 0.72, 0.42, 0.25); wg.rotation.z = sx * 0.12; const fe = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.6), new THREE.MeshStandardMaterial({ map: featherTex(feathers[sx > 0 ? 0 : 2]), alphaTest: 0.35, side: THREE.DoubleSide })); fe.position.set(sx * 1.0, 0.5, 0.4); fe.rotation.set(-1.2, 0, sx * 0.4); chassis.add(fe); } }
  return { g, inner, chassis, wheels, flames, fm, toy, drv, wheel, bs };
}
const blobTex = canvasTex(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 4, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });

let karts = [], me = null, race = null, kartGroup = new THREE.Group(); scene.add(kartGroup);
function playerLook() { const c = COLORS.find((x) => x.id === SV.color) || COLORS[0], f = FEATHERS.find((x) => x.id === SV.feather) || FEATHERS[0]; return { c: c.c, f: f.f, metal: c.metal }; }
function setupKarts(mode, ev) {
  kartGroup.clear(); karts = [];
  const tr = world.tr, look = playerLook(), myD = DRIVERS.find((d) => d.id === SV.driver) || DRIVERS[0];
  let rivals = DRIVERS.filter((d) => d.id !== myD.id && d.id !== 'altin');
  if (mode === 'boss') rivals = [DRIVERS.find((d) => d.id === ev.boss)];
  const n = mode === 'race' ? 6 : mode === 'boss' ? 2 : 1, pslot = n - 1;
  const BF = [[C.blue, C.green, C.yel], [0xffffff, 0x2a80dc, 0xffffff], [C.red, C.yel, C.red], [0xd6a4ff, 0x8a3dd8, 0xd6a4ff], [0xffffff, C.orange, C.navy]];
  const BV = ['klasik', 'buggy', 'canavar', 'roket', 'klasik'];
  let bi = 0;
  for (let slot = 0; slot < n; slot++) {
    const isMe = slot === pslot, g = gridPos(tr, slot), k = makeKart(g.pos, g.yaw, g.idx);
    const d = isMe ? myD : rivals[bi % rivals.length], b = isMe ? 0 : bi++;
    const kc = isMe ? look.c : d.kart, vid = isMe ? SV.veh : mode === 'boss' ? 'roket' : BV[b % 5];
    const vis = isMe ? kartMesh(look.c, look.f, look.metal, d.id, vid) : kartMesh(kc, BF[b % 5], d.id === 'altin' ? 1 : 0, d.id, vid);
    kartGroup.add(vis.g); k.vis = vis; k.me = isMe; k.name = isMe ? T(d.tr, d.en) + ' (' + T('SEN', 'YOU') + ')' : T(d.tr, d.en); k.color = kc; k.did = d.id;
    if (isMe) applyStats(k, SV.veh);
    k.skill = isMe ? 1 : mode === 'boss' ? 1.08 : [0.96, 0.99, 1.02, 1.05, 1.08][b % 5]; k.laneOff = isMe ? 0 : (b % 2 ? 1 : -1) * 1.2;
    if (!isMe && mode === 'boss') k.sup = 60;
    karts.push(k); if (isMe) me = k;
  }
  syncKarts(0);
}
const FLAMEC = [0x6fd8ff, 0x6fd8ff, 0xffa020, 0xd96bff];
let animT = 0;
function syncKarts(dt) {
  animT += dt;
  for (const k of karts) {
    const v = k.vis; v.g.position.set(k.x, 0, k.z); v.g.rotation.set(0, k.h + (k.spinA || 0), 0);
    // visual drift angle, hop squash, suspension bob
    k.vDrift = (k.vDrift || 0) + ((k.drift ? -k.driftDir * 0.42 : 0) - (k.vDrift || 0)) * Math.min(1, dt * 8);
    const bob = Math.sin(animT * 18 + k.x) * 0.012 * Math.min(1, Math.abs(k.s) / 20);
    v.inner.position.y = k.y; if (k.trick && k.y > 0.2) k.trickA = (k.trickA || 0) + dt * 13; else k.trickA = 0; v.inner.rotation.set(k.pitch - Math.min(k.trickA, Math.PI * 2), k.vDrift, k.roll + (k.hitT > 0 ? Math.sin(k.hitT * 60) * 0.05 : 0));
    const sq = k.y > 0 ? 1 + Math.min(0.12, k.vy * 0.015) : 1; v.chassis.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); v.chassis.position.y = bob;
    v.bs.position.y = 0.02 - k.y / 2.4; v.bs.material.opacity = 0.55 / (1 + k.y * 0.4);
    v.wheels.forEach((w, i) => { w.w.rotation.x -= k.s * dt * (i < 2 ? 2.0 : 1.55); if (i < 2) w.piv.rotation.y = k.steer * 0.45; });
    v.wheel.rotation.y = k.steer * 1.2;
    v.flames.visible = !!k.turbo; if (k.turbo) { v.flames.children.forEach((f) => (f.scale.y = 0.8 + Math.random() * 0.7)); const fc = FLAMEC[k.padLvl || 0]; v.fm.forEach((m) => m.color.setHex(fc)); }
    v.toy.rotation.z = -k.roll * 1.5;
    const cel = race && k.done ? 1 : 0;
    v.drv.anim(dt, { steer: k.steer, s: Math.max(0, k.s), boost: k.turbo, hit: k.hitT > 0.1 || k.wallHit > 0.3, celebrate: cel, t: animT + k.skill * 10 });
  }
}
// ---------- particles (dust / sparks / pickups) ----------
const parts = []; const PGEO = new THREE.SphereGeometry(0.18, 6, 5);
const pmats = { dust: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), spark: new THREE.MeshBasicMaterial({ color: 0xffd41f }), blue: new THREE.MeshBasicMaterial({ color: 0x6fd8ff }), feather: new THREE.MeshBasicMaterial({ color: 0xfff2a0 }), fire: new THREE.MeshBasicMaterial({ color: 0xffa42a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }), smoke: new THREE.MeshBasicMaterial({ color: 0xbfbfbf, transparent: true, opacity: 0.35, depthWrite: false }),
  s1: new THREE.MeshBasicMaterial({ color: 0x6fd8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), s2: new THREE.MeshBasicMaterial({ color: 0xffa020, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }), s3: new THREE.MeshBasicMaterial({ color: 0xd96bff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
  c0: new THREE.MeshBasicMaterial({ color: 0xe22511 }), c1: new THREE.MeshBasicMaterial({ color: 0xffc20e }), c2: new THREE.MeshBasicMaterial({ color: 0x2a80dc }), c3: new THREE.MeshBasicMaterial({ color: 0x2fa043 }) };
function puff(x, y, z, kind, n = 1, sp = 3) { for (let i = 0; i < n; i++) { if (parts.length > 220) return; const m = new THREE.Mesh(PGEO, pmats[kind]); m.position.set(x, y, z); scene.add(m); parts.push({ m, vx: (Math.random() - 0.5) * sp, vy: Math.random() * sp, vz: (Math.random() - 0.5) * sp, life: 0.5 + Math.random() * 0.3, t: 0, g: kind === 'smoke' || kind === 'fire' ? -3 : 6 }); } }
const SPGEO = new THREE.BoxGeometry(0.12, 0.12, 0.5);
function driftFx(k) {
  const lv = k.driftLvl, fx = fwdX(k), fz = fwdZ(k), rx = -fz, rz = fx;
  for (const sd of [-1, 1]) { const wx = k.x - fx * 1.5 + rx * sd * 1.5, wz = k.z - fz * 1.5 + rz * sd * 1.5;
    if (lv > 0 && Math.random() < 0.8) { const m = new THREE.Mesh(SPGEO, pmats['s' + lv]); m.position.set(wx, 0.3, wz); m.rotation.y = Math.random() * 6; scene.add(m); parts.push({ m, vx: (Math.random() - 0.5) * 6 - fx * 4, vy: 2 + Math.random() * 4, vz: (Math.random() - 0.5) * 6 - fz * 4, life: 0.25 + Math.random() * 0.2, t: 0, g: 18 }); }
    else if (Math.random() < 0.35) puff(wx, 0.3, wz, 'dust', 1, 1.5);
    if (k.me) skid(wx, wz, sd); }
}
// skid marks: ring buffer of quads
const SKN = 400, skPos = new Float32Array(SKN * 4 * 3), skGeo = new THREE.BufferGeometry(); skGeo.setAttribute('position', new THREE.BufferAttribute(skPos, 3));
{ const idx = []; for (let i = 0; i < SKN; i++) { const b = i * 4; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } skGeo.setIndex(idx); }
const skMesh = new THREE.Mesh(skGeo, new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.35, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); skMesh.frustumCulled = false; scene.add(skMesh);
let skI = 0; const skLast = {};
function skid(x, z, sd) { const L = skLast[sd]; skLast[sd] = { x, z, t: animT }; if (!L || animT - L.t > 0.1) return; const dx = x - L.x, dz = z - L.z, d = Math.hypot(dx, dz) || 1, nx = -dz / d * 0.22, nz = dx / d * 0.22, b = (skI % SKN) * 12; skI++;
  skPos.set([L.x + nx, 0.06, L.z + nz, L.x - nx, 0.06, L.z - nz, x + nx, 0.06, z + nz, x - nx, 0.06, z - nz], b); skGeo.attributes.position.needsUpdate = true; }
function skidClear() { skPos.fill(0); skGeo.attributes.position.needsUpdate = true; skLast[-1] = skLast[1] = null; }
function confetti(n) { if (!me) return; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(SPGEO, pmats['c' + (i % 4)]); m.position.set(me.x + (Math.random() - 0.5) * 6, 4 + Math.random() * 3, me.z + (Math.random() - 0.5) * 6); m.rotation.set(Math.random() * 6, Math.random() * 6, 0); scene.add(m); parts.push({ m, vx: (Math.random() - 0.5) * 10, vy: 6 + Math.random() * 8, vz: (Math.random() - 0.5) * 10, life: 1.6 + Math.random(), t: 0, g: 9, spin: 1 }); } }
function stepParts(dt) { for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.t += dt; if (p.t > p.life) { scene.remove(p.m); parts.splice(i, 1); continue; } p.vy -= (p.g ?? 6) * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; if (p.spin) { p.m.rotation.x += dt * 8; p.m.rotation.z += dt * 6; } else if (p.grow) { p.m.scale.setScalar(1 + p.t * p.grow); p.m.material.opacity = 0.8 * (1 - p.t / p.life); } else p.m.scale.setScalar(1 - p.t / p.life); } }

// ---------- minimap ----------
const mm = $('#mm'), mmc = mm.getContext('2d'); let mmBase = null, mmT = null;
function drawMinimapBase() {
  const tr = world.tr, S = 220; let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
  tr.P.forEach((p) => { mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x); mnz = Math.min(mnz, p.z); mxz = Math.max(mxz, p.z); });
  const sc = (S - 40) / Math.max(mxx - mnx, mxz - mnz), ox = (S - (mxx - mnx) * sc) / 2, oz = (S - (mxz - mnz) * sc) / 2;
  mmT = (x, z) => [ox + (x - mnx) * sc, oz + (z - mnz) * sc];
  mmBase = document.createElement('canvas'); mmBase.width = mmBase.height = S; const c = mmBase.getContext('2d');
  c.lineJoin = c.lineCap = 'round'; c.beginPath(); tr.P.forEach((p, i) => { const [x, y] = mmT(p.x, p.z); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
  c.strokeStyle = 'rgba(2,39,83,.55)'; c.lineWidth = 16; c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke();
  const [sx, sy] = mmT(tr.P[0].x, tr.P[0].z); c.fillStyle = '#111'; c.fillRect(sx - 7, sy - 3, 14, 6);
}
function drawMinimap() { if (!mmBase) return; mmc.clearRect(0, 0, 220, 220); mmc.drawImage(mmBase, 0, 0);
  for (const k of karts) { if (k.me) continue; const [x, y] = mmT(k.x, k.z); mmc.fillStyle = '#' + new THREE.Color(k.color).getHexString(); mmc.beginPath(); mmc.arc(x, y, 7, 0, 7); mmc.fill(); mmc.strokeStyle = '#fff'; mmc.lineWidth = 2; mmc.stroke(); }
  if (me) { const [x, y] = mmT(me.x, me.z); mmc.fillStyle = '#e22511'; mmc.beginPath(); mmc.arc(x, y, 10, 0, 7); mmc.fill(); mmc.strokeStyle = '#ffd41f'; mmc.lineWidth = 3; mmc.stroke(); } }

// ---------- input ----------
const keys = {}; const ctl = { left: false, right: false, drift: false, turbo: false };
addEventListener('keydown', (e) => { keys[e.key] = true; if (['ArrowLeft', 'ArrowRight', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) e.preventDefault(); });
addEventListener('keyup', (e) => { keys[e.key] = false; });
function hold(el, key) {
  const on = (e) => { e.preventDefault(); ctl[key] = true; el.classList.add('on'); ac(); if (key === 'turbo' && race) race.turboTap = race.t; }, off = (e) => { e.preventDefault(); ctl[key] = false; el.classList.remove('on'); };
  el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
}
hold($('#bL'), 'left'); hold($('#bR'), 'right'); hold($('#bD'), 'drift'); hold($('#bT'), 'turbo');
document.addEventListener('touchmove', (e) => { if (race) e.preventDefault(); }, { passive: false });
function playerCtl() {
  const l = ctl.left || keys.ArrowLeft || keys.a, r = ctl.right || keys.ArrowRight || keys.d;
  return { steer: (l ? 1 : 0) - (r ? 1 : 0), gas: keys.ArrowDown ? 0 : 1, brake: ctl.drift || keys[' '] || keys.ArrowDown, boost: ctl.turbo || keys.ArrowUp || keys.Shift };
}

// ---------- race flow ----------
function show(id) { document.querySelectorAll('.pane').forEach((p) => (p.hidden = p.id !== id)); }
let toastT = 0; function toast(s, ms = 1600) { const t = $('#toast'); t.textContent = s; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms); }
function big(s, cls = '') { const b = $('#big'); b.textContent = s; b.className = cls; b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }

const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
const worldOpen = (w) => totalStars() >= w.need;
function goals(def, tr) { const b = def.laps * tr.len / (KCFG.maxSpeed * 0.98); return [b * 1.17, b * 1.08, b]; }
function startRace(defId, ev) {
  $('#res').hidden = true; const def = TRACKS.find((t) => t.id === defId); const mode = ev ? ev.m : 'race';
  buildWorld(def); clearItems(); skidClear();
  const wd = WORLDS.find((w) => w.id === def.w) || WORLDS[0];
  race = { t: -3.6, phase: 'count', lastCount: 4, order: [], finished: [], def, ev, mode, diff: wd.diff };
  setupKarts(mode, ev); buildItems(world.tr, world.group);
  if (mode === 'time') race.goals = goals(def, world.tr);
  show('raceP'); $('#lapTot').textContent = def.laps; $('#raceP').classList.toggle('tt', mode === 'time'); updHud(); ac(); AUD.raceMusic(true); AUD.engineOn(); big('', 'hide');
  const intro = mode === 'boss' ? `👑 ${T('PATRON', 'BOSS')}: ${karts[0].name}` : mode === 'time' ? `⏱ ${T('Hedef', 'Target')} ★★★ ${fmt(race.goals[2])}` : '';
  if (intro) toast(intro, 2600);
  else if (!SV.tut) toast(T('◀ ▶ ile dön. ? kutularından güç al, sağ üstteki tuşla kullan. DRİFT basılı tutup dön!', '◀ ▶ to steer. Grab ? boxes for power-ups. Hold DRIFT in turns!'), 4200);
}
function fmt(t) { const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${s.toFixed(2).padStart(5, '0')}`; }
function updHud() {
  if (!race || !me) return;
  const sorted = [...karts].sort((a, b) => (b.done - a.done) || (a.done && b.done ? a.finishT - b.finishT : b.prog - a.prog));
  sorted.forEach((k, i) => (k.place = i + 1)); const pos = sorted.indexOf(me) + 1; race.pos = pos;
  $('#pos').textContent = pos; $('#posTot').textContent = '/' + karts.length;
  $('#lap').textContent = Math.min(race.def.laps, me.lap + 1); $('#time').textContent = fmt(Math.max(0, race.t));
  $('#turboFill').style.height = me.boost + '%'; $('#bT').classList.toggle('ready', me.boost > 5);
  $('#spd').textContent = Math.round(me.s * 4.2);
  // item + super buttons
  const it = me.item ? (me.rollT > 0 ? ITEMS[Object.keys(ITEMS)[Math.floor(race.t * 14) % 7]].ic : ITEMS[me.item].ic) : '';
  $('#itIc').textContent = it; $('#itN').textContent = me.item === 'turbo3' && !(me.rollT > 0) ? '×' + me.itemN : ''; $('#bI').classList.toggle('ready', !!me.item && !(me.rollT > 0));
  $('#supFill').style.height = me.sup + '%'; $('#bS').classList.toggle('ready', me.sup >= 100); $('#supIc').textContent = SUPERS[me.did].ic;
  if (race.mode === 'time' && race.goals) { const g = race.goals, t = race.t, st = t <= g[2] ? 3 : t <= g[1] ? 2 : t <= g[0] ? 1 : 0; $('#goal').textContent = '★'.repeat(st) + '☆'.repeat(3 - st); }
}
function stepRace(dt) {
  const tr = world.tr; race.t += dt;
  if (race.phase === 'count') {
    const c = Math.ceil(-race.t); if (c !== race.lastCount && c <= 3 && c >= 1) { race.lastCount = c; big(String(c), 'cnt'); sfx.tick(); }
    // rocket start: tap TURBO just before GO
    if (race.t > -0.45 && race.turboTap != null && race.turboTap > -0.45 && !race.rocket) { race.rocket = 1; }
    if (race.t >= 0) { race.phase = 'go'; big(T('BAŞLA!', 'GO!'), 'go'); sfx.go(); if (race.rocket) { me.padT = 1.3; me.s = 14; setTimeout(() => { big(T('SÜPER START!', 'ROCKET START!'), 'lap'); sfx.turbo(); }, 350); } if (!SV.tut) { SV.tut = 1; save(); } }
    for (const k of karts) drive(k, { steer: 0, gas: 0, brake: true }, dt);
  } else {
    // rubber band: bots ease off if far ahead, push if far behind
    for (const k of karts) {
      if (k.done) { drive(k, { steer: 0, gas: 0.2, brake: k.s > 12 }, dt); continue; }
      if (k.me && !race.finishedMe) { drive(k, playerCtl(), dt); continue; }
      if (k.me) { drive(k, botControl(tr, k, race.t), dt); continue; }
      const gap = k.prog - me.prog; k.speedMul = k.skill * race.diff * (gap > 0.2 ? 0.95 : gap < -0.15 ? 1.04 : 1) * (k.starT > 0 ? 1 : 1);
      
      drive(k, botControl(tr, k, race.t), dt);
    }
  }
  collide(karts);
  if (race.mode !== 'time') stepItems(dt);
  for (const k of karts) {
    if (track(tr, k) && !k.done) {
      if (k.lap >= race.def.laps) { k.done = true; k.finishT = race.t; race.finished.push(k); if (k.me) finishMe(); }
      else if (k.me) { big(k.lap === race.def.laps - 1 ? T('SON TUR!', 'FINAL LAP!') : `${T('TUR', 'LAP')} ${k.lap + 1}`, 'lap'); if (k.lap === race.def.laps - 1) { sfx.final(); AUD.intensity(0.85); } else sfx.lap(); }
    }
    if (k.me && k.wallHit > 0.2 && !(race.wallCd > 0)) { race.wallCd = 0.35; sfx.wall(k.wallHit); shake = Math.max(shake, 0.25 + k.wallHit * 0.5); puff(k.x + fwdX(k) * 2, 1, k.z + fwdZ(k) * 2, 'spark', 8, 7); }
    if (k.me && k.hitT > 0.2 && !(race.bumpCd > 0)) { race.bumpCd = 0.4; sfx.bump(); shake = Math.max(shake, 0.25); }
    if (k.me && k.lvlUp) { k.lvlUp = 0; sfx.lvl(); }
    if (k.me && k.y <= 0 && k.hop) { k.hop = 0; }
    if (k.me && k.air && k.y > 0.8 && ctl.drift && !race.trickHeld && !k.trick) { k.trick = 1; AUD.play('uiClick', { volume: 0.6 }); }
    if (k.drift && k.y <= 0.05) driftFx(k); if (k.turbo && Math.random() < 0.5) puff(k.x - fwdX(k) * 2.8, 0.8, k.z - fwdZ(k) * 2.8, 'fire', 1, 1.2); else if (k.me && k.s > 4 && Math.random() < 0.08) puff(k.x - fwdX(k) * 2.8, 0.7, k.z - fwdZ(k) * 2.8, 'smoke', 1, 0.8);
    if (k.miniTurbo) { const lv = k.miniTurbo; k.miniTurbo = 0; if (k.me) { sfx.mini(); shake = Math.max(shake, 0.15); big(lv >= 3 ? T('ULTRA TURBO!', 'ULTRA TURBO!') : lv === 2 ? T('SÜPER TURBO!', 'SUPER TURBO!') : T('MİNİ TURBO!', 'MINI TURBO!'), 'lap'); } }
    // pickups
    for (const p of world.pickups) { if (p.off > 0) continue; if ((p.x - k.x) ** 2 + (p.z - k.z) ** 2 < 6.5) { p.off = 4; p.m.visible = false; k.boost = Math.min(100, k.boost + 7); if (k.me) { sfx.pick(); puff(p.x, 2, p.z, 'feather', 6, 4); race.feathers = (race.feathers || 0) + 1; } } }
    for (const p of world.pads) { if ((p.x - k.x) ** 2 + (p.z - k.z) ** 2 < 6 && !(k.padT > 0.5)) { k.padT = 1.1; k.padLvl = 0; if (k.me) { sfx.turbo(); shake = Math.max(shake, 0.12); big('TURBO!', 'lap'); } } }
  }
  race.trickHeld = ctl.drift;
  if (me.boosting && !race.boostSnd) { race.boostSnd = 1; sfx.turbo(); } if (!me.boosting) race.boostSnd = 0;
  for (const p of world.pickups) { if (p.off > 0) { p.off -= dt; if (p.off <= 0) p.m.visible = true; } p.m.rotation.y += dt * 2.5; p.m.position.y = 2.2 + Math.sin(race.t * 3 + p.i) * 0.3; }
  AUD.engineUpd(Math.max(0, me.s) / (KCFG.maxSpeed * 1.2), me.turbo, me.drift, race.phase !== 'count' || !!race.turboTap);
  if (race.wallCd > 0) race.wallCd -= dt; if (race.bumpCd > 0) race.bumpCd -= dt;
  if (race.phase !== 'count' && !race.finishedMe) { const pos = race.pos || 6; if (race.lastPos && pos < race.lastPos) sfx.up(); else if (race.lastPos && pos > race.lastPos) sfx.down(); race.lastPos = pos; }
  if (race.finishedMe) { race.after = (race.after || 0) + dt; if (race.after > 2.2 && !race.shown) { race.shown = true; results(); } }
}
function finishMe() {
  race.finishedMe = true; const place = race.finished.indexOf(me) + 1; race.place = place;
  big(place === 1 ? T('KAZANDIN!', 'YOU WIN!') : `${place}. ${T('OLDUN', 'PLACE')}`, place === 1 ? 'win' : 'go'); place <= 3 ? sfx.win() : sfx.fin(); confetti(place <= 3 ? 90 : 30);
}
function results() {
  const def = race.def, place = race.place, ev = race.ev, mode = race.mode, myT = me.finishT;
  let stars = 0;
  if (mode === 'race') stars = place === 1 ? 3 : place === 2 ? 2 : place === 3 ? 1 : 0;
  else if (mode === 'boss') stars = place === 1 ? 3 : 0;
  else { const g = race.goals; stars = myT <= g[2] ? 3 : myT <= g[1] ? 2 : myT <= g[0] ? 1 : 0; }
  let rew = mode === 'time' ? 40 + stars * 30 : (mode === 'boss' ? (place === 1 ? 250 : 40) : REWARD[place - 1]) + (race.feathers || 0) * 2;
  let msg = [];
  if (ev) { const old = SV.stars[ev.id] || 0; if (stars > old) { const gain = stars - old; SV.stars[ev.id] = stars; rew += gain * 60; msg.push(`⭐ +${gain} ${T('yeni yıldız', 'new stars')} (+${gain * 60} 🪶)`); }
    if (mode === 'boss' && place === 1 && !SV.ownD.includes(ev.boss)) { SV.ownD.push(ev.boss); const d = DRIVERS.find((x) => x.id === ev.boss); msg.push(`🔓 ${T('Yeni sürücü', 'New driver')}: ${T(d.tr, d.en)}`); }
    WORLDS.forEach((w) => { if (!SV.seenW) SV.seenW = ['mutfak']; if (worldOpen(w) && !SV.seenW.includes(w.id)) { SV.seenW.push(w.id); msg.push(`🌍 ${T('Yeni dünya açıldı', 'New world unlocked')}: ${T(w.tr, w.en)}`); } }); }
  SV.tuy += rew; SV.races++; if (place === 1) SV.wins[def.id] = (SV.wins[def.id] || 0) + 1;
  const prevBest = SV.best[def.id]; const newBest = !prevBest || myT < prevBest; if (newBest) SV.best[def.id] = myT;
  save();
  const rows = [...karts].map((k) => ({ k, t: k.done ? k.finishT : race.t + (def.laps - k.prog) * (world.tr.len / (KCFG.maxSpeed * 0.85)) })).sort((a, b) => a.t - b.t);
  $('#resList').innerHTML = mode === 'time' ? `<div class="rr me"><b>⏱</b><span>${T('Süren', 'Your time')}</span><em>${fmt(myT)}</em></div>` + race.goals.map((g, i) => `<div class="rr"><b>${'★'.repeat(i + 1)}</b><span></span><em>${fmt(g)}</em></div>`).reverse().join('')
    : rows.map((r, i) => `<div class="rr ${r.k.me ? 'me' : ''}"><b>${i + 1}</b><i style="background:#${new THREE.Color(r.k.color).getHexString()}"></i><span>${r.k.name}</span><em>${fmt(r.t)}</em></div>`).join('');
  $('#resStars').innerHTML = ev ? [0, 1, 2].map((i) => `<i class="${i < stars ? 'on' : ''}" style="animation-delay:${0.25 + i * 0.25}s">★</i>`).join('') : '';
  $('#resTitle').textContent = mode === 'time' ? (stars ? T('SÜPER!', 'GREAT!') : T('TEKRAR DENE', 'TRY AGAIN')) : place === 1 ? (mode === 'boss' ? T('PATRON YENİLDİ!', 'BOSS BEATEN!') : T('ŞAMPİYON!', 'CHAMPION!')) : `${place}. ${T('SIRA', 'PLACE')}`;
  $('#resRew').innerHTML = `🪶 +${rew}${newBest ? ` · ⏱ ${T('rekor', 'best')} ${fmt(myT)}` : ''}${msg.length ? '<br>' + msg.join('<br>') : ''}`;
  const nx = ev ? nextEvent(ev) : null; $('#next').hidden = !nx; $('#next').onclick = () => { $('#res').hidden = true; startRace(nx.t, nx); };
  $('#res').hidden = false; AUD.engineOff(); AUD.menuMusic(true); upd();
}
function nextEvent(ev) { const i = EVENTS.findIndex((e) => e.id === ev.id); const nx = EVENTS[i + 1]; if (!nx) return null; const w = WORLDS.find((x) => x.id === nx.w); return worldOpen(w) ? nx : null; }
function quitRace() { clearItems(); race = null; AUD.engineOff(); $('#res').hidden = true; $('#pause').hidden = true; big('', 'hide'); home(); }

// ---------- menus ----------
let showroom = { a: 0 };
function enterShowroom() {
  if (!world || world.def.id !== 'mutfak') buildWorld(TRACKS[0]);
  boxes = []; ramps = []; clearItems(); setupKarts('show'); me.x = world.tr.P[40].x; me.z = world.tr.P[40].z; me.h = Math.atan2(-world.tr.Tn[40].x, -world.tr.Tn[40].z); syncKarts(0);
}
function home() { race = null; show('homeP'); enterShowroom(); upd(); }
function upd() { document.querySelectorAll('.tuyN').forEach((e) => (e.textContent = SV.tuy.toLocaleString('tr-TR'))); }
function trkBg(w) { const W0 = WORLDS.find((x) => x.id === w) || WORLDS[0]; return `linear-gradient(135deg,${W0.col[0]},${W0.col[1]})`; }
function tracksPane() {
  $('#trackH').textContent = T('HIZLI YARIŞ', 'QUICK RACE');
  $('#trackList').innerHTML = TRACKS.map((t) => { const w = WORLDS.find((x) => x.id === t.w), open = worldOpen(w); return `<button class="trk ${open ? '' : 'lock'}" data-t="${t.id}" style="background:${trkBg(t.w)}">
    <b class="d">${T(t.tr, t.en)}</b><span>${t.laps} ${T('tur', 'laps')} · ${open ? (SV.best[t.id] ? '⏱ ' + fmt(SV.best[t.id]) : T('rekor yok', 'no record')) : `🔒 ⭐ ${w.need}`}</span>${SV.wins[t.id] ? `<em>🏆 ${SV.wins[t.id]}</em>` : ''}</button>`; }).join('');
  $('#trackList').querySelectorAll('.trk').forEach((b) => (b.onclick = () => { if (b.classList.contains('lock')) { toast(T('Kariyerde yıldız topla, bu dünya açılsın', 'Earn career stars to unlock this world')); return; } sfx.click(); startRace(b.dataset.t); }));
  show('trackP');
}
const MODEN = { race: ['🏁', 'Yarış', 'Race'], time: ['⏱', 'Zamana Karşı', 'Time Trial'], boss: ['👑', 'Patron Düellosu', 'Boss Duel'] };
function careerPane() {
  $('#trackH').textContent = T('KARİYER', 'CAREER') + ` · ⭐ ${totalStars()}/${EVENTS.length * 3}`;
  $('#trackList').innerHTML = WORLDS.map((w) => { const open = worldOpen(w), evs = EVENTS.filter((e) => e.w === w.id), got = evs.reduce((a, e) => a + (SV.stars[e.id] || 0), 0);
    return `<div class="world ${open ? '' : 'lock'}" style="background:${trkBg(w.id)}"><div class="wh"><b class="d">${T(w.tr, w.en)}</b><em>${open ? `⭐ ${got}/12` : `🔒 ⭐ ${w.need}`}</em></div>
      ${open ? `<div class="evs">${evs.map((e, n) => { const t = TRACKS.find((x) => x.id === e.t), m = MODEN[e.m], st = SV.stars[e.id] || 0, boss = e.boss ? DRIVERS.find((d) => d.id === e.boss) : null;
        return `<button class="ev" data-e="${e.id}"><span class="mi">${m[0]}</span><span class="et"><b>${n + 1}. ${boss ? T(boss.tr, boss.en) : T(m[1], m[2])}</b><small>${T(t.tr, t.en)}${boss ? ' · ' + T(m[1], m[2]) : ''}</small></span><span class="es">${'★'.repeat(st)}<i>${'★'.repeat(3 - st)}</i></span></button>`; }).join('')}</div>` : ''}</div>`; }).join('');
  $('#trackList').querySelectorAll('.ev').forEach((b) => (b.onclick = () => { const e = EVENTS.find((x) => x.id === b.dataset.e); sfx.click(); startRace(e.t, e); }));
  show('trackP');
}
function garage() {
  const card = (it, own, on, kind) => `<button class="gi ${on ? 'on' : ''}" data-k="${kind}" data-id="${it.id}"><i style="background:${kind === 'c' ? '#' + new THREE.Color(it.c).getHexString() : `linear-gradient(90deg,${it.f.map((x) => '#' + new THREE.Color(x).getHexString()).join(',')})`}"></i><span>${T(it.tr, it.en)}</span><em>${on ? '✓' : own ? T('Seç', 'Use') : '🪶 ' + it.cost.toLocaleString('tr-TR')}</em></button>`;
  $('#gV').innerHTML = VEHICLES.map((v) => { const own = SV.ownV.includes(v.id), on = SV.veh === v.id, st = vehStats(v.id); return `<button class="gi veh ${on ? 'on' : ''}" data-k="v" data-id="${v.id}"><span>${T(v.tr, v.en)}</span><div class="bars">${st.map((x, i) => `<p><small>${T(STATN[i][0], STATN[i][1])}</small><u><s style="width:${Math.min(100, x / 7 * 100)}%"></s></u></p>`).join('')}</div><em>${on ? '✓' : own ? T('Seç', 'Use') : '🪶 ' + v.cost.toLocaleString('tr-TR')}</em></button>`; }).join('');
  const u = upLv(SV.veh); $('#gU').innerHTML = STATN.map((n, i) => `<div class="upr"><b>${T(n[0], n[1])}</b><span>${[0, 1, 2, 3, 4].map((l) => `<i class="${l < u[i] ? 'on' : ''}"></i>`).join('')}</span>${u[i] >= 5 ? `<em>MAX</em>` : `<button class="btn sm y" data-up="${i}">🪶 ${upCost(u[i])}</button>`}</div>`).join('');
  $('#gU').querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => { const i = +b.dataset.up, uu = upLv(SV.veh).slice(), c = upCost(uu[i]); if (SV.tuy < c) { toast(T('Yeterli tüy yok. Yarışarak kazan!', 'Not enough feathers. Race to earn!')); sfx.no(); return; } SV.tuy -= c; uu[i]++; SV.up[SV.veh] = uu; sfx.buy(); save(); upd(); garage(); }));
  $('#gD').innerHTML = DRIVERS.map((d) => { const own = SV.ownD.includes(d.id), on = SV.driver === d.id; return `<button class="gi drv ${on ? 'on' : ''}" data-k="d" data-id="${d.id}"><i style="background:#${new THREE.Color(d.kart).getHexString()}">${d.id === 'wu' ? '🥋' : d.id === 'kick' ? '⭐' : d.id === 'flick' ? '💨' : '🔥'}</i><span>${T(d.tr, d.en)}</span><em>${on ? '✓' : own ? T('Seç', 'Use') : '🪶 ' + d.cost.toLocaleString('tr-TR')}</em></button>`; }).join('');
  $('#gC').innerHTML = COLORS.map((c) => card(c, SV.ownC.includes(c.id), SV.color === c.id, 'c')).join('');
  $('#gF').innerHTML = FEATHERS.map((f) => card(f, SV.ownF.includes(f.id), SV.feather === f.id, 'f')).join('');
  document.querySelectorAll('.gi').forEach((b) => (b.onclick = () => {
    const kind = b.dataset.k, list = kind === 'c' ? COLORS : kind === 'd' ? DRIVERS : kind === 'v' ? VEHICLES : FEATHERS, own = kind === 'c' ? SV.ownC : kind === 'd' ? SV.ownD : kind === 'v' ? SV.ownV : SV.ownF, it = list.find((x) => x.id === b.dataset.id);
    if (!own.includes(it.id)) { if (SV.tuy < it.cost) { toast(T('Yeterli tüy yok. Yarışarak kazan!', 'Not enough feathers. Race to earn!')); sfx.no(); return; } SV.tuy -= it.cost; own.push(it.id); sfx.buy(); }
    if (kind === 'c') SV.color = it.id; else if (kind === 'd') SV.driver = it.id; else if (kind === 'v') SV.veh = it.id; else SV.feather = it.id; sfx.click(); save(); upd(); enterShowroom(); garage();
  }));
  show('garageP'); upd();
}
function applyLang() { document.querySelectorAll('[data-tr]').forEach((e) => (e.textContent = SV.lang === 'en' ? e.dataset.en : e.dataset.tr)); $('#langBtn').textContent = SV.lang === 'en' ? 'EN' : 'TR'; $('#sndBtn').textContent = SV.snd ? '🔊' : '🔇'; }
$('#playBtn').onclick = () => { ac(); AUD.menuMusic(true); sfx.click(); careerPane(); };
$('#quickBtn').onclick = () => { ac(); AUD.menuMusic(true); sfx.click(); tracksPane(); };
$('#garBtn').onclick = () => { ac(); AUD.menuMusic(true); sfx.click(); garage(); };
document.querySelectorAll('.back').forEach((b) => (b.onclick = home));
$('#langBtn').onclick = () => { SV.lang = SV.lang === 'en' ? 'tr' : 'en'; save(); applyLang(); };
$('#sndBtn').onclick = () => { SV.snd = SV.snd ? 0 : 1; save(); applyLang(); ac(); AUD.setOn(!!SV.snd); if (SV.snd && !race) AUD.menuMusic(true); };
$('#pauseBtn').onclick = () => { if (!race || race.shown) return; race.paused = true; $('#pause').hidden = false; AUD.pauseMusic(true); };
$('#resume').onclick = () => { race.paused = false; $('#pause').hidden = true; AUD.pauseMusic(false); };
$('#quit').onclick = quitRace; $('#resHome').onclick = quitRace;
$('#again').onclick = () => { $('#res').hidden = true; startRace(race.def.id, race.ev); };
const useBtn = (el, fn) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); ac(); if (race && me) fn(me); });
useBtn($('#bI'), useItem); useBtn($('#bS'), useSuper);
addEventListener('keydown', (e) => { if (!race || !me) return; if (e.key === 'x' || e.key === 'Enter') useItem(me); if (e.key === 'c') useSuper(me); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (race && !race.shown && !race.paused) { race.paused = true; $('#pause').hidden = false; } AUD.pauseMusic(true); } else if (!(race && race.paused)) AUD.pauseMusic(false); });

// ---------- speed lines overlay ----------
const sl = document.createElement('canvas'); sl.id = 'slines'; sl.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2'; document.body.appendChild(sl);
const slc = sl.getContext('2d'); let slK = 0; const slines = [];
function speedLines(dt, want) {
  slK += (want - slK) * Math.min(1, dt * 5); if (!race) slK = 0;
  if (slK < 0.03) { if (sl.width) { sl.width = 0; } return; }
  const w = Math.round(W * 0.5), h = Math.round(H * 0.5); if (sl.width !== w || sl.height !== h) { sl.width = w; sl.height = h; }
  slc.clearRect(0, 0, w, h); const cx = w / 2, cy = h * 0.45;
  while (slines.length < 28) slines.push({ a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.5, l: 0.08 + Math.random() * 0.12, v: 1.4 + Math.random() });
  slc.strokeStyle = 'rgba(255,255,255,' + (0.5 * slK).toFixed(3) + ')'; slc.lineWidth = 1.6; slc.beginPath();
  for (const p of slines) { p.r += p.v * dt; if (p.r > 1.1) { p.r = 0.35 + Math.random() * 0.2; p.a = Math.random() * Math.PI * 2; }
    const R0 = p.r * Math.max(w, h) * 0.6, R1 = R0 + p.l * Math.max(w, h) * slK; slc.moveTo(cx + Math.cos(p.a) * R0, cy + Math.sin(p.a) * R0); slc.lineTo(cx + Math.cos(p.a) * R1, cy + Math.sin(p.a) * R1); }
  slc.stroke();
}

// ---------- camera ----------
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(); let camInit = false, sway = 0, shake = 0;
function updCamera(dt, t) {
  if (!me) return;
  if (!race) { // showroom orbit
    speedLines(dt, 0); showroom.a += dt * 0.35; const gar = !$('#garageP').hidden, r = gar ? 13 : 11; camera.position.set(me.x + Math.sin(showroom.a) * r, 4.2, me.z + Math.cos(showroom.a) * r); camera.lookAt(me.x, gar ? -1.2 : 2.0, me.z);
    camera.fov = W / H < 0.75 ? 52 : 45; camera.updateProjectionMatrix(); camInit = false; return;
  }
  const fx = fwdX(me), fz = fwdZ(me), sp = Math.max(0, me.s);
  const back = 12.5 + sp / 12, up = 6.2 + sp / 30;
  const tx = me.x - fx * back, tz = me.z - fz * back;
  if (!camInit) { camPos.set(tx, up, tz); camLook.set(me.x + fx * 12, 1.2, me.z + fz * 12); camInit = true; }
  camPos.lerp(new THREE.Vector3(tx, up, tz), Math.min(1, dt * 6)); camLook.lerp(new THREE.Vector3(me.x + fx * 12, 1.2, me.z + fz * 12), Math.min(1, dt * 8));
  camera.position.copy(camPos); if (shake > 0) { shake = Math.max(0, shake - dt * 1.6); const a = shake * shake * 1.2; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; } camera.lookAt(camLook);
  // racing-game style sway when boosting + roll into turns
  const turbo = me.turbo; sway += ((turbo ? (sp / KCFG.maxSpeed + 0.25) * 30 : (sp / KCFG.maxSpeed) * 2) - sway) * Math.min(1, dt * 10);
  camera.rotation.z += (-me.steer * sp) / 900 + (Math.sin(t * (turbo ? 60 : 30) * 0.9) / 1000) * sway;
  const fov = (W / H < 0.75 ? 66 : 55) + (turbo ? 10 : 0) + sp / 10;
  speedLines(dt, turbo ? 1 : Math.max(0, (sp - 30) / 12)); camera.fov += (fov - camera.fov) * Math.min(1, dt * 4); camera.updateProjectionMatrix();
}

// ---------- loop ----------
let last = performance.now(), hudT = 0;
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000), t = now / 1000; last = now;
  if (race && !race.paused && !race.shown) { const n = Math.ceil(dt / (1 / 60)); for (let i = 0; i < n; i++) stepRace(dt / n); }
  syncKarts(dt); stepParts(dt);
  if (me) { sunL.position.set(me.x - 20, 40, me.z + 14); sunL.target.position.set(me.x, 0, me.z); }
  updCamera(dt, t);
  hudT += dt; if (race && hudT > 0.08) { hudT = 0; updHud(); drawMinimap(); }
  renderer.render(scene, camera);
}

// ---------- boot ----------
const LOGO_IMG = new Image(); LOGO_IMG.src = LOGO_URL;
LOGO_IMG.decode().catch(() => {}).then(() => {
  setLogo(LOGO_IMG); resize(); applyLang(); home(); frame(); $('#boot').remove();
  window.__fk = { snap: () => { camInit = false; }, auto: (sec, thr = 0.25) => { for (let i = 0; i < sec * 60 && race && !race.shown; i++) { const c = botControl(world.tr, me, race.t); ctl.left = c.steer > thr; ctl.right = c.steer < -thr; ctl.turbo = window.__noT ? false : me.boost > 40; if (!window.__noI && me.item && !(me.rollT > 0) && i % 30 === 0) useItem(me); if (!window.__noI && me.sup >= 100) useSuper(me); if (!race.paused) stepRace(1 / 60); } ctl.left = ctl.right = ctl.turbo = false; syncKarts(1 / 60); }, sim: (sec) => { for (let i = 0; i < sec * 60; i++) if (race && !race.paused && !race.shown) stepRace(1 / 60); syncKarts(1 / 60); }, get race() { return race; }, get me() { return me; }, karts: () => karts, SV, startRace, ctl, home, gl: renderer, AUD, ev: (id) => { const e = EVENTS.find((x) => x.id === id); startRace(e.t, e); }, get boxes() { return boxes; }, get projs() { return projs; } };
});
