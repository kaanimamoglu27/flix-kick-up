// Flix Fabrika v3 — karakterle oynanan fabrika: renkli hindi çiftliği → pres → montaj → tezgâh → müşteri.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { hero, pose, leafGeo } from './hero.js';
import { SFX } from './sfx.js';
import { COLS, PADS, COS } from './config.js';
import { initUI, openPanel, closePanel, panelOpen, toast, refreshHUD, maybeInter, offlinePopup, haptic } from './ui.js';

const $ = (s) => document.querySelector(s);
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
export const fmt = (n) => n < 10000 ? Math.floor(n).toLocaleString('tr-TR') : n < 1e6 ? (n / 1e3).toFixed(1).replace('.', ',') + ' B' : (n / 1e6).toFixed(2).replace('.', ',') + ' M';

// ---------------- save ----------------
const DEF = () => ({ v: 3, money: 0, gems: 0, unl: [], tut: 0, made: 0, up: {}, staff: { tas: 0, kas: 0 }, cos: { skin: 'kraliyet', acc: 'yok', floor: 'nane', own: ['kraliyet', 'yok', 'nane'] },
  noads: 0, vip: 0, starter: 0, boostUntil: 0, ads: { day: '', n: 0, last: 0 }, freeUpLast: 0, lastInter: 0, lastSeen: 0, ipm: 0, del: 0, paid: {}, txn: [] });
export let SV = (() => { const d = DEF(); try {
  const o = JSON.parse(localStorage.getItem('flix_fabrika3') || 'null'); if (o && o.v === 3) return { ...d, ...o, cos: { ...d.cos, ...o.cos }, staff: { ...d.staff, ...o.staff }, ads: { ...d.ads, ...o.ads } };
  const o2 = JSON.parse(localStorage.getItem('flix_fabrika2') || 'null'); // v2 kaydından taşı
  if (o2 && o2.v === 2) { d.money = (o2.money || 0) + 300; d.tut = Math.min(6, o2.tut || 0); d.made = o2.made || 0; d.del = o2.del || 0; if ((o2.unl || []).includes('asm2')) d.unl.push('ofis', 'mavi', 'asm2'); if ((o2.unl || []).includes('isci')) { d.unl.push('ik'); d.staff.tas = 1; } return d; }
} catch {} return d; })();
export const save = () => { try { SV.lastSeen = Date.now(); localStorage.setItem('flix_fabrika3', JSON.stringify(SV)); } catch {} };
export const lv = (id) => SV.up[id] || 0;
let sound = (() => { try { return localStorage.getItem('flix_fabrika_snd') !== '0'; } catch { return true; } })(); SFX.enabled = sound;

// ---------------- renderer ----------------
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9fd6f0); scene.fog = new THREE.Fog(0x9fd6f0, 55, 110);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 200);
const sun = new THREE.DirectionalLight(0xfff1dc, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; scene.add(sun, sun.target);
scene.add(new THREE.HemisphereLight(0xdff0ff, 0x9a8a6a, 1.15));

// ---------------- helpers ----------------
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const add = (geo, m, par, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; (par || scene).add(o); return o; };
const rb = (w, h, d, m, par, x, y, z, r = 0.08) => add(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), m, par, x, y, z);
const tex = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const label = (txt, bg, w = 256, fs = 44) => tex(w, 64, (c, W, h) => { c.fillStyle = bg; c.beginPath(); c.roundRect(0, 0, W, h, 18); c.fill(); c.fillStyle = '#fff'; c.font = `italic 900 ${fs}px BC`; c.textAlign = 'center'; c.fillText(txt, W / 2, 48); });
let LOGO = null;
const C = { red: 0xe22511, navy: 0x0b2a5e, yel: 0xffc20e, orange: 0xf08a24 };
const MT = {
  grass: M(0x7cc85a, { roughness: 0.95 }), floor: M(0xffffff, { roughness: 0.75 }), wall: M(0xfff6ea, { roughness: 0.85 }), wallTop: M(C.red, { roughness: 0.5 }),
  wood: M(0xc8935a, { roughness: 0.8 }), woodD: M(0x8a5a32, { roughness: 0.85 }), fence: M(0xfff3e0, { roughness: 0.7 }),
  red: M(C.red, { roughness: 0.4 }), yel: M(C.yel, { roughness: 0.4 }), navy: M(C.navy, { roughness: 0.5 }), steel: M(0xd9dee6, { metalness: 0.6, roughness: 0.3 }),
  dark: M(0x2b2e36, { roughness: 0.6 }), dome: M(C.orange, { roughness: 0.6 }), white: M(0xffffff, { roughness: 0.6 }), road: M(0x5d6474, { roughness: 0.9 }),
};
export function setFloor(id) {
  const F = COS.floor.find(f => f.id === id) || COS.floor[0];
  MT.floor.map = tex(512, 512, (c, w, h) => {
    if (F.wood) { for (let j = 0; j < 8; j++) for (let i = -1; i < 2; i++) { const l = 58 + ((i * 5 + j * 3 + 9) % 7) * 4; c.fillStyle = `hsl(30,48%,${l}%)`; c.fillRect((j % 2) * 128 + i * 256, j * 64, 256, 64); }
      c.strokeStyle = 'rgba(80,40,10,.35)'; c.lineWidth = 2; for (let j = 0; j <= 8; j++) { c.beginPath(); c.moveTo(0, j * 64); c.lineTo(w, j * 64); c.stroke(); for (let i = 0; i < 3; i++) { const x = (j % 2) * 128 + i * 256; c.beginPath(); c.moveTo(x, j * 64); c.lineTo(x, j * 64 + 64); c.stroke(); } } return; }
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = F.rainbow ? `hsl(${((i + j) * 40) % 360},70%,${(i + j) % 2 ? 80 : 72}%)` : (i + j) % 2 ? F.a : F.b; c.fillRect(i * 64, j * 64, 64, 64); }
    c.strokeStyle = F.l || 'rgba(0,0,0,.15)'; c.lineWidth = 2; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
  }, true); MT.floor.map.repeat.set(5, 4); MT.floor.needsUpdate = true;
}

// turkey feathers: barred, white tip, per colour
function featherTexture(base, bars) { return tex(64, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.beginPath(); c.moveTo(w / 2, h); c.bezierCurveTo(4, h * 0.7, 2, h * 0.2, w / 2, 2); c.bezierCurveTo(w - 2, h * 0.2, w - 4, h * 0.7, w / 2, h); c.closePath(); c.save(); c.clip();
  const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, bars); gr.addColorStop(0.35, base); gr.addColorStop(0.65, base); gr.addColorStop(1, bars); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = bars; c.globalAlpha = 0.7; for (let y = 34; y < h - 30; y += 22) c.fillRect(0, y, w, 7); c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(0, 0, w, 14); c.fillStyle = bars; c.fillRect(0, 14, w, 10);
  c.strokeStyle = 'rgba(0,0,0,.16)'; c.lineWidth = 1; for (let y = 0; y < h; y += 5) { c.beginPath(); c.moveTo(w / 2, y + 10); c.lineTo(0, y); c.moveTo(w / 2, y + 10); c.lineTo(w, y); c.stroke(); } c.restore();
  c.strokeStyle = '#fff8e8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2, 6); c.stroke(); }); }
const FM = {}; for (const k in COLS) { const K = COLS[k]; FM[k] = new THREE.MeshStandardMaterial({ map: featherTexture(K.f, K.b), alphaTest: 0.4, side: THREE.DoubleSide, roughness: K.metal ? 0.25 : 0.6, metalness: K.metal ? 0.55 : 0, emissive: K.metal ? 0x5a3a00 : 0x000000 }); }
const featherGeo = (() => { const g = new THREE.PlaneGeometry(0.22, 0.9, 2, 6); g.translate(0, 0.45, 0); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -0.15 * y * y); } g.computeVertexNormals(); return g; })();
const toyFeatherGeo = leafGeo(1.25, 0.62, -0.12);

// ---------------- items ----------------
const GEO = { dome: new THREE.SphereGeometry(0.32, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), brim: new THREE.CylinderGeometry(0.36, 0.37, 0.07, 22), bill: new RoundedBoxGeometry(0.62, 0.1, 0.34, 2, 0.03),
  toyBase: (() => { const prof = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI / 2; prof.push(new THREE.Vector2(Math.cos(a) * 0.36, Math.sin(a) * 0.3 + 0.3)); } prof.push(new THREE.Vector2(0.36, 0.42), new THREE.Vector2(0.3, 0.46), new THREE.Vector2(0, 0.46)); return new THREE.LatheGeometry(prof, 32); })(),
  band: new THREE.TorusGeometry(0.365, 0.03, 8, 32), band2: new THREE.TorusGeometry(0.335, 0.018, 6, 32), box: new RoundedBoxGeometry(0.9, 1.16, 0.62, 2, 0.05), boxBack: new THREE.PlaneGeometry(0.84, 1.12), boxFloor: new RoundedBoxGeometry(0.86, 0.1, 0.62, 2, 0.03) };
const TOYM = { base: new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.32, emissive: C.red, emissiveIntensity: 0.12 }), navy: M(0x022753, { roughness: 0.4 }), white: M(0xffffff, { roughness: 0.4 }),
  shell: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.14, depthWrite: false, clearcoat: 1 }), floor: M(0xffc20e, { roughness: 0.5 }), back: null };
const BILL = M(0x66c25a, { roughness: 0.6, map: tex(128, 64, (c, w, h) => { c.fillStyle = '#7fd36a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2f7a2a'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#2f7a2a'; c.font = 'bold 36px sans-serif'; c.textAlign = 'center'; c.fillText('₺', w / 2, 46); }) });
// FLIX oyuncağı: kırmızı taban + lacivert bant + seçilen renkte 3 hindi tüyü
export function makeFlix(col, s = 1) {
  const g = new THREE.Group(); add(GEO.toyBase, TOYM.base, g); const b = add(GEO.band, TOYM.navy, g, 0, 0.33, 0); b.rotation.x = Math.PI / 2; const b2 = add(GEO.band2, TOYM.white, g, 0, 0.2, 0); b2.rotation.x = Math.PI / 2;
  [-1, 0, 1].forEach((k) => { const piv = new THREE.Group(); piv.position.set(k * 0.12, 0.42, 0); piv.rotation.z = -k * 0.42; piv.rotation.x = k === 0 ? -0.08 : 0.06; g.add(piv); add(toyFeatherGeo, FM[col] || FM.dogal, piv); });
  g.scale.setScalar(s); return g;
}
function makeItem(type, col = 'dogal') {
  const g = new THREE.Group(); g.userData.type = type; g.userData.col = col;
  if (type === 'feather') { [-0.25, 0, 0.25].forEach((r) => { const f = new THREE.Mesh(featherGeo, FM[col]); f.rotation.order = 'YXZ'; f.rotation.set(-Math.PI / 2, -Math.PI / 2 + r, 0); f.position.set(-0.32, 0.06, 0); f.castShadow = true; g.add(f); });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 10), MT.red); band.rotation.z = Math.PI / 2; band.position.set(-0.2, 0.08, 0); g.add(band); }
  else if (type === 'base') { const d = new THREE.Mesh(GEO.dome, MT.dome); d.rotation.x = Math.PI; d.position.y = 0.27; d.castShadow = true; g.add(d); const b = new THREE.Mesh(GEO.brim, MT.red); b.position.y = 0.29; g.add(b); }
  else if (type === 'toy') { // kutulu FLIX: sarı taban, logolu kırmızı arka karton, şeffaf kapak
    add(GEO.boxFloor, TOYM.floor, g, 0, 0.05, 0); add(GEO.boxBack, TOYM.back, g, 0, 0.62, -0.28).castShadow = false;
    const t = makeFlix(col, 0.6); t.position.set(0, 0.1, 0.04); g.add(t); const sh = new THREE.Mesh(GEO.box, TOYM.shell); sh.position.y = 0.62; sh.renderOrder = 2; g.add(sh); }
  else if (type === 'cash') add(GEO.bill, BILL, g, 0, 0.05, 0);
  return g;
}
const H_OF = { feather: 0.17, base: 0.36, toy: 1.2, cash: 0.11 };
class Pile {
  constructor(x, z, type, max, cols = 2, rows = 2, gap = 0.75) { this.pos = new THREE.Vector3(x, 0, z); this.type = type; this.max = max; this.cols = cols; this.rows = rows; this.gap = gap; this.items = []; this.base = 0.05; }
  slot(i) { const per = this.cols * this.rows, layer = Math.floor(i / per), k = i % per, cx = k % this.cols, cz = Math.floor(k / this.cols);
    return this.pos.clone().add(new THREE.Vector3((cx - (this.cols - 1) / 2) * this.gap, this.base + layer * H_OF[this.type], (cz - (this.rows - 1) / 2) * this.gap)); }
  get n() { return this.items.length; } full() { return this.items.length >= this.max; }
  push(obj, from) { const p = this.slot(this.items.length); this.items.push(obj); scene.attach(obj); obj.rotation.set(0, 0, 0); obj.scale.setScalar(1); fly(obj, from || obj.position.clone(), p, 0.28); }
  pop() { return this.items.pop(); }
}
const tweens = [];
function fly(obj, from, to, dur, onEnd, arc = 1.2) { const tw = { obj, from: from.clone(), to: to.clone(), t: 0, dur, onEnd, arc }; tweens.push(tw); return tw; }
function popIn(obj) { tweens.push({ obj, t: 0, dur: 0.25, scale: true }); }

// ---------------- world ----------------
const BOUNDS = { x0: -11, x1: 11, z0: -21, z1: 13 };
const colliders = [];
const box = (x0, x1, z0, z1) => colliders.push({ x0, x1, z0, z1 });
let pressPile, farmPile, asm = [], counter, cashPile, padObjs = [], turkeys = [], customers = [], workers = [], cashier = null, arrow, beacon, guideTarget = null, bigFlix;
export const ZONES = {};
const stationsAnim = {};
function buildWorld() {
  add(new THREE.PlaneGeometry(200, 200), M(0x8fd06a, { roughness: 1 }), null, 0, -0.02, 0).rotation.x = -Math.PI / 2;
  rb(22, 0.3, 20, MT.white, null, 0, -0.14, 2.5, 0.1); add(new THREE.PlaneGeometry(21.6, 19.6), MT.floor, null, 0, 0.02, 2.5).rotation.x = -Math.PI / 2;
  rb(0.5, 1.4, 20, MT.wall, null, -11, 0.7, 2.5); rb(0.56, 0.18, 20.06, MT.wallTop, null, -11, 1.45, 2.5);
  rb(8.5, 1.4, 0.5, MT.wall, null, -6.75, 0.7, -7.5); rb(8.5, 1.4, 0.5, MT.wall, null, 6.75, 0.7, -7.5); rb(8.56, 0.18, 0.56, MT.wallTop, null, -6.75, 1.45, -7.5); rb(8.56, 0.18, 0.56, MT.wallTop, null, 6.75, 1.45, -7.5);
  box(-11.5, -10.7, -8, 13); box(-11.5, -2.5, -7.8, -7.2); box(2.5, 11.5, -7.8, -7.2);
  const sign = tex(1024, 360, (c, w, h) => { c.fillStyle = '#e22511'; c.beginPath(); c.roundRect(0, 0, w, h, 40); c.fill(); if (LOGO) c.drawImage(LOGO, 30, 20, 360, 320); c.fillStyle = '#fff'; c.font = 'italic 900 150px BC'; c.fillText('FABRİKA', 400, 230); });
  add(new THREE.PlaneGeometry(5.6, 2), M(0xffffff, { map: sign, transparent: true, roughness: 0.5 }), null, -6.75, 2.6, -7.24).castShadow = false;
  rb(0.15, 1.6, 0.15, MT.steel, null, -8.6, 1.4, -7.3); rb(0.15, 1.6, 0.15, MT.steel, null, -4.9, 1.4, -7.3);
  // ---- turkey farm ----
  add(new THREE.PlaneGeometry(22, 12), MT.grass, null, 0, 0.0, -14).rotation.x = -Math.PI / 2;
  for (let x = -10.5; x <= 10.5; x += 1.5) rb(0.14, 1.0, 0.14, MT.fence, null, x, 0.5, -20);
  for (let z = -20; z <= -8.5; z += 1.5) { rb(0.14, 1.0, 0.14, MT.fence, null, -10.6, 0.5, z); rb(0.14, 1.0, 0.14, MT.fence, null, 10.6, 0.5, z); }
  rb(21.2, 0.1, 0.1, MT.fence, null, 0, 0.8, -20); rb(21.2, 0.1, 0.1, MT.fence, null, 0, 0.45, -20);
  rb(0.1, 0.1, 11.5, MT.fence, null, -10.6, 0.8, -14.25); rb(0.1, 0.1, 11.5, MT.fence, null, 10.6, 0.8, -14.25);
  box(-11.5, 11.5, -21, -19.6);
  const barn = new THREE.Group(); barn.position.set(6.5, 0, -17.5); scene.add(barn);
  rb(5, 3, 3.6, M(0xc8402e, { roughness: 0.7 }), barn, 0, 1.5, 0); const roof = add(new THREE.CylinderGeometry(2.0, 2.0, 5.2, 4, 1), M(0x5a3a2a, { roughness: 0.7 }), barn, 0, 3.0, 0); roof.rotation.set(0, 0, Math.PI / 2); roof.rotation.order = 'ZXY'; roof.rotation.x = Math.PI / 4; roof.scale.set(1, 1, 0.9);
  rb(1.8, 2.0, 0.1, MT.fence, barn, 0, 1.0, 1.82); add(new THREE.PlaneGeometry(1.5, 1.7), M(0x5a2a1e), barn, 0, 0.95, 1.88);
  box(3.8, 9.2, -19.6, -15.5);
  for (const [x, z] of [[-8, -18.5], [-6.8, -18.6], [-7.4, -18.4]]) { const h = add(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 18), M(0xe8c66a, { roughness: 1 }), null, x, 0.6, z); h.rotation.z = Math.PI / 2; }
  rb(3, 0.5, 0.8, MT.woodD, null, -2, 0.25, -18.8);
  rb(2.4, 0.5, 2.0, MT.wood, null, -6.8, 0.25, -10.9); box(-8.2, -5.4, -12.1, -9.7);
  farmPile = new Pile(-6.8, -10.9, 'feather', 16, 2, 2, 0.75); farmPile.base = 0.55; markZone(farmPile, new THREE.Vector3(-6.8, 0, -8.8));
  // ---- press ----
  const press = new THREE.Group(); press.position.set(-8.4, 0, -3.5); scene.add(press);
  rb(2.4, 2.6, 2.2, M(0x2a80dc, { roughness: 0.35 }), press, 0, 1.3, 0, 0.18); rb(1.8, 0.35, 1.6, MT.steel, press, 0, 2.8, 0, 0.08);
  press.userData.pis = add(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16), MT.steel, press, 0, 3.5, 0);
  rb(1.2, 0.6, 0.06, M(0x0f1c33, { emissive: 0x2fe06a, emissiveIntensity: 0.5 }), press, 0, 1.6, 1.12, 0.03);
  box(-9.8, -7.0, -4.8, -2.2); pressPile = new Pile(-6.2, -3.5, 'base', 12, 2, 2, 0.8); markZone(pressPile);
  stationsAnim.press = press;
  buildAssembly(0, -1.0, -2.0);
  // ---- shop counter ----
  const ct = new THREE.Group(); ct.position.set(4.5, 0, 6.8); scene.add(ct);
  rb(5.2, 1.1, 1.4, MT.red, ct, 0, 0.55, 0, 0.12); rb(5.4, 0.12, 1.6, MT.white, ct, 0, 1.15, 0, 0.05);
  const awn = tex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e22511'; c.fillRect(i * 32, 0, 32, h); } });
  add(new THREE.BoxGeometry(5.4, 0.14, 0.1), M(0xffffff, { map: awn }), ct, 0, 1.01, 0.74);
  const cs = tex(512, 128, (c, w, h) => { c.fillStyle = '#ffc20e'; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill(); c.fillStyle = '#0b2a5e'; c.font = 'italic 900 84px BC'; c.textAlign = 'center'; c.fillText('FLIX SATIŞ', w / 2, 95); });
  add(new THREE.PlaneGeometry(2.6, 0.65), M(0xffffff, { map: cs, transparent: true }), ct, 0, 0.6, 0.72).castShadow = false;
  rb(0.7, 0.35, 0.5, MT.dark, ct, 2.0, 1.38, -0.2, 0.06); rb(0.5, 0.3, 0.06, M(0x0f1c33, { emissive: 0x2fe06a, emissiveIntensity: 0.6 }), ct, 2.0, 1.7, -0.3, 0.02);
  box(1.8, 7.2, 6.0, 7.6);
  counter = new Pile(3.2, 6.8, 'toy', 12, 3, 1, 0.9); counter.base = 1.21; markZone(counter, new THREE.Vector3(4.5, 0, 5.0));
  cashPile = new Pile(6.6, 5.0, 'cash', 80, 2, 2, 0.7);
  // giant FLIX on a pedestal
  rb(1.6, 0.8, 1.6, MT.navy, null, 9.2, 0.4, 10.4, 0.12); bigFlix = makeFlix('mavi', 2.0); bigFlix.position.set(9.2, 0.8, 10.4); scene.add(bigFlix); box(8.4, 10.0, 9.6, 11.2);
  add(new THREE.PlaneGeometry(200, 6), MT.road, null, 0, 0.01, 17).rotation.x = -Math.PI / 2;
  for (let x = -40; x < 40; x += 4) add(new THREE.PlaneGeometry(2, 0.25), M(0xffffff), null, x, 0.02, 17).rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(200, 2.2), M(0xd8d2c8), null, 0, 0.015, 13.4).rotation.x = -Math.PI / 2;
  for (const [x, z] of [[-13.5, -4], [-14, 4], [13.5, -2], [14, 6], [-13.5, 11], [13.4, -12], [-13.6, -14]]) { add(new THREE.CylinderGeometry(0.2, 0.28, 1.6, 8), MT.woodD, null, x, 0.8, z); add(new THREE.IcosahedronGeometry(1.4, 1), M(0x4fae5a, { flatShading: true, roughness: 0.9 }), null, x, 2.4, z); }
  // wardrobe (cosmetics), always there
  const wd = new THREE.Group(); wd.position.set(-10.1, 0, 10.6); scene.add(wd); rb(1.0, 2.4, 2.0, M(0x7a4fd8, { roughness: 0.5 }), wd, 0, 1.2, 0, 0.1); rb(0.06, 2.0, 0.85, M(0x9a72f0), wd, 0.52, 1.2, -0.46, 0.03); rb(0.06, 2.0, 0.85, M(0x9a72f0), wd, 0.52, 1.2, 0.46, 0.03);
  const wl = add(new THREE.PlaneGeometry(1.8, 0.45), M(0xffffff, { map: label('DOLAP', '#7a4fd8'), transparent: true }), wd, 0.56, 2.6, 0); wl.rotation.y = Math.PI / 2; wl.castShadow = false; box(-10.7, -9.5, 9.5, 11.7);
  ZONES.dolap = zoneRing(-8.3, 10.6, 0x9a72f0, 'DOLAP');
  for (let i = 0; i < 4; i++) addTurkey('dogal');
  arrow = new THREE.Group(); scene.add(arrow); const ag = new THREE.Shape(); ag.moveTo(0, 0.6); ag.lineTo(0.45, 0); ag.lineTo(0.17, 0); ag.lineTo(0.17, -0.5); ag.lineTo(-0.17, -0.5); ag.lineTo(-0.17, 0); ag.lineTo(-0.45, 0); ag.closePath();
  const am = new THREE.Mesh(new THREE.ShapeGeometry(ag), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.95, depthWrite: false })); am.rotation.x = -Math.PI / 2; am.position.y = 0.06; arrow.add(am);
  beacon = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.9, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.position.y = 0.05; scene.add(beacon);
}
function zoneRing(x, z, col, txt) { const r = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.045, z); scene.add(r);
  const l = add(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: tex(256, 64, (c, w) => { c.fillStyle = '#fff'; c.font = 'italic 900 42px BC'; c.textAlign = 'center'; c.fillText(txt, w / 2, 46); }), transparent: true, depthWrite: false }), null, x, 0.05, z); l.rotation.x = -Math.PI / 2; l.castShadow = false;
  return { pos: new THREE.Vector3(x, 0, z), r: 1.2, ring: r }; }
function markZone(pile, at) {
  const p = at || pile.pos; const r = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.45, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(p.x, 0.04, p.z); scene.add(r); pile.zone = at ? at.clone() : pile.pos.clone();
}
function buildAssembly(i, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  rb(3.4, 1.0, 2.0, MT.yel, g, 0, 0.5, 0, 0.14); rb(3.6, 0.12, 2.2, MT.white, g, 0, 1.06, 0, 0.05);
  const arm = new THREE.Group(); arm.position.set(0, 1.12, -0.6); g.add(arm); add(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 18), MT.dark, arm); const a1 = new THREE.Group(); a1.position.y = 0.1; arm.add(a1);
  rb(0.16, 0.9, 0.16, MT.red, a1, 0, 0.45, 0, 0.06); const a2 = new THREE.Group(); a2.position.y = 0.9; a1.add(a2); rb(0.14, 0.7, 0.14, MT.red, a2, 0, 0.35, 0, 0.05); a1.rotation.x = 0.5; a2.rotation.x = 1.3;
  add(new THREE.PlaneGeometry(1.6, 0.4), M(0xffffff, { map: label('MONTAJ ' + (i + 1), '#0b2a5e'), transparent: true }), g, 0, 0.55, 1.01).castShadow = false;
  box(x - 1.8, x + 1.8, z - 1.1, z + 1.1);
  const zone = new THREE.Vector3(x - 2.6, 0, z);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.2, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(x - 2.6, 0.04, z); scene.add(ring);
  const lbl = tex(256, 96, (c, w) => { c.fillStyle = '#fff'; c.font = 'bold 30px R, sans-serif'; c.textAlign = 'center'; c.fillText('tüy + taban', w / 2, 40); c.fillText('bırak', w / 2, 76); });
  const lm = add(new THREE.PlaneGeometry(1.4, 0.52), new THREE.MeshBasicMaterial({ map: lbl, transparent: true, depthWrite: false }), null, x - 2.6, 0.05, z + 1.6); lm.rotation.x = -Math.PI / 2; lm.castShadow = false;
  const out = new Pile(x + 2.6, z, 'toy', 8, 2, 2, 0.95); markZone(out);
  const A = { g, arm: a1, a2, inF: [], inB: 0, out, inZone: zone, t: 0, x, z, bufObjs: [] };
  asm.push(A); return A;
}
function buildOffice() { const g = new THREE.Group(); g.position.set(8.4, 0, -5.4); scene.add(g);
  rb(2.6, 0.9, 1.2, MT.wood, g, 0, 0.45, 0, 0.08); rb(0.9, 0.6, 0.06, MT.dark, g, 0, 1.3, -0.2, 0.03); rb(0.8, 0.5, 0.02, M(0x2a80dc, { emissive: 0x2a80dc, emissiveIntensity: 0.5 }), g, 0, 1.3, -0.16, 0.01); rb(0.2, 0.3, 0.2, MT.dark, g, 0, 0.98, -0.2);
  rb(0.7, 0.9, 0.7, MT.navy, g, 0, 0.45, -1.2, 0.12); add(new THREE.PlaneGeometry(1.6, 0.4), M(0xffffff, { map: label('OFİS', '#0b2a5e'), transparent: true }), g, 0, 2.2, -0.2).castShadow = false;
  box(7.0, 9.8, -6.1, -4.7); ZONES.ofis = zoneRing(8.4, -3.2, 0x2a80dc, 'GELİŞTİR'); }
function buildHR() { const g = new THREE.Group(); g.position.set(9.8, 0, 2.6); scene.add(g);
  rb(1.0, 0.9, 2.6, MT.wood, g, 0, 0.45, 0, 0.08); rb(0.06, 0.5, 0.8, MT.dark, g, -0.2, 1.2, 0, 0.02); const s = add(new THREE.PlaneGeometry(1.9, 0.45), M(0xffffff, { map: label('İŞE ALIM', '#2fa043'), transparent: true }), g, -0.52, 1.9, 0); s.rotation.y = -Math.PI / 2; s.castShadow = false;
  box(9.2, 10.4, 1.2, 4.0); ZONES.ik = zoneRing(7.8, 2.6, 0x2fa043, 'ELEMAN'); }
// turkeys
function turkeyMesh(col) {
  const K = COLS[col], g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const bm = M(K.body, { roughness: K.metal ? 0.3 : 0.8, metalness: K.metal ? 0.5 : 0 }), wm = M(K.wing, { roughness: K.metal ? 0.25 : 0.6, metalness: K.metal ? 0.6 : 0.15 });
  const b = add(new THREE.SphereGeometry(0.5, 20, 14), bm, body, 0, 0.75, 0); b.scale.set(0.9, 0.9, 1.1);
  const fan = new THREE.Group(); fan.position.set(0, 0.85, -0.35); body.add(fan); fan.rotation.x = -0.35;
  for (let i = 0; i < 11; i++) { const f = new THREE.Mesh(featherGeo, FM[col]); f.scale.set(1.8, 1.3, 1); f.rotation.set(0, 0, (i - 5) * 0.27); f.castShadow = true; fan.add(f); }
  const neck = add(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 10), M(0x9ab0d8), body, 0, 1.1, 0.38); neck.rotation.x = 0.4;
  const head = add(new THREE.SphereGeometry(0.15, 14, 10), M(0xb8c8e8, { roughness: 0.6 }), body, 0, 1.38, 0.5);
  add(new THREE.ConeGeometry(0.05, 0.14, 8), M(0xf2c14e), head, 0, -0.02, 0.15).rotation.x = Math.PI / 2;
  const wat = add(new THREE.SphereGeometry(0.06, 8, 6), M(0xd8261d), head, 0.03, -0.12, 0.1); wat.scale.y = 1.8;
  for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.03, 8, 6), M(0x111111), head, s * 0.09, 0.04, 0.09); add(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), M(0xd8a040), g, s * 0.16, 0.18, 0); }
  for (const s of [-1, 1]) { const w = add(new THREE.SphereGeometry(0.35, 14, 10), wm, body, s * 0.42, 0.78, -0.05); w.scale.set(0.3, 0.7, 1.05); }
  g.userData.body = body; g.scale.setScalar(1.15); return g;
}
const tkPos = () => { let x, z; do { x = rnd(-9, 9.5); z = rnd(-18.6, -11.6); } while (x > 3.4 && z < -15); return new THREE.Vector3(x, 0, z); };
function addTurkey(col) { const t = turkeyMesh(col); t.position.copy(tkPos()); scene.add(t); turkeys.push({ o: t, col, tgt: tkPos(), wait: rnd(0, 2), peck: 0 }); }

// ---------------- player ----------------
export let P; let H;
function makeHero(skin, acc, scale) {
  const h = hero(skin, { noCloak: acc !== 'pelerin', face: 'happy' }); h.g.scale.setScalar(scale);
  if (acc === 'gozluk') { const gm = M(0x111111, { roughness: 0.2, metalness: 0.3 }); for (const s of [-1, 1]) { const l = add(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), gm, h.head, s * 0.16, 0.08, 0.42); l.rotation.x = Math.PI / 2; } add(new THREE.BoxGeometry(0.14, 0.03, 0.03), gm, h.head, 0, 0.1, 0.44); }
  if (acc === 'kulak') { const km = M(0x222a3a, { roughness: 0.4 }); add(new THREE.TorusGeometry(0.5, 0.045, 8, 24, Math.PI), km, h.head, 0, 0.05, 0); for (const s of [-1, 1]) { const c = add(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 18), M(0xe22511, { roughness: 0.3 }), h.head, s * 0.5, 0.0, 0); c.rotation.z = Math.PI / 2; } }
  if (acc === 'tac') { const tm = M(0xffcf3a, { roughness: 0.2, metalness: 0.8, side: THREE.DoubleSide }); const cr = add(new THREE.CylinderGeometry(0.3, 0.27, 0.2, 10, 1, true), tm, h.head, 0, 0.52, 0.22); cr.rotation.x = -0.3; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(new THREE.ConeGeometry(0.06, 0.16, 6), tm, cr, Math.cos(a) * 0.28, 0.17, Math.sin(a) * 0.28); } }
  return h;
}
function buildPlayer() {
  H = makeHero(SV.cos.skin, SV.cos.acc, 0.78); P = { o: H.g, stack: [], walk: 0, tick: 0, speed: 6.2 };
  scene.add(H.g); H.g.position.set(SV.px ?? 0, 0, SV.pz ?? 3);
  P.hold = new THREE.Group(); P.hold.position.set(0, 1.0, 0.62); H.g.add(P.hold);
  const lbl = document.createElement('div'); lbl.id = 'cap'; document.body.appendChild(lbl); P.lbl = lbl;
}
export function setLook() { const pos = P.o.position.clone(), ry = P.o.rotation.y; scene.remove(H.g); H = makeHero(SV.cos.skin, SV.cos.acc, 0.78); H.g.position.copy(pos); H.g.rotation.y = ry; scene.add(H.g); H.g.add(P.hold); P.o = H.g; confetti(pos.clone().setY(1)); }
export const capOf = () => 4 + lv('cap');
const wcap = () => 2 + lv('wcap');
function stackPush(obj) { const h = P.stack.reduce((a, o) => a + H_OF[o.userData.type], 0); P.stack.push(obj); const local = new THREE.Vector3(0, h / 0.78, 0); const from = obj.getWorldPosition(new THREE.Vector3()); P.hold.add(obj); obj.position.copy(P.hold.worldToLocal(from.clone())); obj.scale.setScalar(1 / 0.78); obj.rotation.set(0, 0, 0); tweens.push({ obj, from: obj.position.clone(), to: local, t: 0, dur: 0.22, arc: 0.8 }); }
function stackPopType(types) { for (let i = P.stack.length - 1; i >= 0; i--) if (types.includes(P.stack[i].userData.type)) { const o = P.stack.splice(i, 1)[0]; restack(); const w = o.getWorldPosition(new THREE.Vector3()); scene.add(o); o.position.copy(w); o.scale.setScalar(1); o.rotation.set(0, 0, 0); return o; } return null; }
function restack() { let h = 0; for (const o of P.stack) { o.position.set(0, h / 0.78, 0); h += H_OF[o.userData.type]; } }

// ---------------- unlock pads ----------------
function padTex(p, paid) { return tex(256, 256, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 36); c.fill(); c.strokeStyle = p.col ? COLS[p.col].f : '#0b2a5e'; c.lineWidth = 9; c.setLineDash([22, 14]); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#37b24d'; c.beginPath(); c.roundRect(24, 24 + (h - 48) * (1 - paid / p.cost), w - 48, (h - 48) * paid / p.cost, 26); c.fill();
  c.fillStyle = '#0b2a5e'; c.textAlign = 'center'; c.font = `italic 900 ${p.name.length > 11 ? 34 : 40}px BC`; c.fillText(p.name.toLocaleUpperCase('tr-TR'), w / 2, 100); c.font = 'italic 900 64px BC'; c.fillText('₺' + fmt(p.cost - paid), w / 2, 175); }); }
function refreshPads() {
  padObjs.forEach(o => scene.remove(o.mesh)); padObjs = [];
  for (const p of PADS) { if (SV.unl.includes(p.id)) continue; const ok = p.req === 'tut' ? SV.tut >= TUT.length : SV.unl.includes(p.req); if (!ok) continue;
    const paid = SV.paid[p.id] || 0; const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: padTex(p, paid), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.05, p.z); scene.add(m);
    padObjs.push({ p, mesh: m, paid, t: 0 }); }
}
function actPad(p) {
  if (p.col) { addTurkey(p.col); addTurkey(p.col); }
  if (p.id === 'asm2') buildAssembly(1, -1.0, 3.4);
  if (p.id === 'asm3') buildAssembly(2, -6.4, 6.4);
  if (p.id === 'ofis') buildOffice();
  if (p.id === 'ik') buildHR();
}
function unlock(p) { SV.unl.push(p.id); actPad(p); SFX.milestone(); haptic(60); if (p.col) SV.gems += 5; toast(p.name + ' açıldı!' + (p.col ? ' +5 💎' : '')); confetti(new THREE.Vector3(p.x, 0.5, p.z)); save(); refreshPads(); refreshHUD(); setTimeout(maybeInter, 1500); }

// ---------------- staff ----------------
export function spawnStaff() {
  while (workers.length < SV.staff.tas) { const h = makeHero(['buzul', 'ejder', 'neon', 'altin'][workers.length % 4], 'yok', 0.68); h.g.position.set(7.8, 0, 2.6); scene.add(h.g); const hold = new THREE.Group(); hold.position.set(0, 1.0, 0.62); h.g.add(hold); workers.push({ H: h, hold, stack: [], state: 'toOut', walk: 0, ai: 0, id: workers.length }); }
  if (SV.staff.kas && !cashier) { const h = makeHero('altin', 'gozluk', 0.72); h.g.position.set(5.7, 0, 5.3); scene.add(h.g); cashier = { H: h }; animWalk(h, 0, false, false); }
}

// ---------------- customers ----------------
const SHIRTS = [0x2a80dc, 0x2fa043, 0xe84aa0, 0xffc20e, 0x7a4fd8, 0xff7a3a, 0x18a0a0];
function personMesh() { const g = new THREE.Group(), sh = M(SHIRTS[Math.floor(rnd(0, SHIRTS.length))], { roughness: 0.6 }), skin = M([0xf2c6a0, 0xd9a07a, 0x9a6a48, 0xf6d8bc][Math.floor(rnd(0, 4))], { roughness: 0.7 });
  add(new THREE.CapsuleGeometry(0.36, 0.6, 6, 14), sh, g, 0, 1.05, 0); const head = add(new THREE.SphereGeometry(0.3, 18, 14), skin, g, 0, 1.85, 0);
  add(new THREE.SphereGeometry(0.31, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), M([0x2a1a10, 0x5a3a20, 0xd8b060, 0x111111][Math.floor(rnd(0, 4))]), g, 0, 1.9, -0.02);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.04, 8, 6), M(0x111111), head, s * 0.1, 0.04, 0.27);
  for (const s of [-1, 1]) add(new THREE.CapsuleGeometry(0.11, 0.4, 4, 8), M(0x34425e), g, s * 0.16, 0.35, 0);
  g.userData.legs = g.children.slice(-2); return g; }
const QUEUE = [new THREE.Vector3(4.5, 0, 8.8), new THREE.Vector3(4.5, 0, 10.4), new THREE.Vector3(6.2, 0, 11.6), new THREE.Vector3(8.0, 0, 12.4), new THREE.Vector3(9.8, 0, 13.0), new THREE.Vector3(11.6, 0, 13.4)];
let custT = 2;
export const profitMult = () => (1 + lv('kar') * 0.1) * (SV.vip ? 2 : 1) * (Date.now() < SV.boostUntil ? 2 : 1);
const canSell = () => SV.staff.kas > 0 || near(counter.zone, 1.9);
function stepCustomers(dt) {
  custT -= dt; if (custT <= 0 && customers.length < QUEUE.length) { custT = rnd(2.2, 4.5) * (SV.unl.length > 4 ? 0.75 : 1); const o = personMesh(); o.position.set(16, 0, 14); scene.add(o);
    const want = SV.tut < TUT.length ? 1 : Math.min(5, 1 + Math.floor(rnd(0, 2 + SV.unl.length * 0.35)));
    const bub = document.createElement('div'); bub.className = 'bub'; document.body.appendChild(bub); customers.push({ o, want, got: 0, value: 0, bub, state: 'queue', t: 0, leave: null }); }
  const sell = canSell(), hide = panelOpen();
  customers.forEach((c, i) => {
    const tgt = c.state === 'leave' ? c.leave : QUEUE[Math.min(i, QUEUE.length - 1)];
    const d = tgt.clone().sub(c.o.position); d.y = 0; const dist = d.length();
    if (dist > 0.08) { d.normalize(); c.o.position.addScaledVector(d, Math.min(dist, dt * 4.2)); c.o.rotation.y = Math.atan2(d.x, d.z); c.walk = (c.walk || 0) + dt * 10; } else { c.walk = 0; if (c.state !== 'leave') c.o.rotation.y = Math.PI; }
    const lg = c.o.userData.legs; lg[0].rotation.x = Math.sin(c.walk) * 0.5 * (dist > 0.08 ? 1 : 0); lg[1].rotation.x = -lg[0].rotation.x;
    if (i === 0 && c.state === 'queue' && dist < 0.1) { c.t -= dt; if (c.t <= 0 && sell && counter.n > 0 && c.got < c.want) { c.t = 0.3; const it = counter.pop(); fly(it, it.position, c.o.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 0.3, () => scene.remove(it)); c.got++; c.value += COLS[it.userData.col].v; SFX.coin(); }
      if (c.got >= c.want) { c.state = 'leave'; c.leave = new THREE.Vector3(-18, 0, 14.5); payCash(c.value * profitMult()); c.bub.className = 'bub ok'; c.bub.innerHTML = '😊'; setTimeout(() => c.bub.remove(), 1500); } }
    const call = c.state === 'queue' && i === 0 && !sell && counter.n > 0 && dist < 0.1;
    if (c.state === 'queue') c.bub.innerHTML = call ? '<b>KASAYA GEL!</b>' : `<b>${c.want - c.got}</b><i class="fl"></i>`;
    c.bub.classList.toggle('call', call);
    const v = c.o.position.clone().add(new THREE.Vector3(0, 2.6, 0)).project(camera); c.bub.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px,${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`; c.bub.style.opacity = (c.state === 'leave' && c.o.position.x < -8) || hide ? 0 : 1;
  });
  for (let i = customers.length - 1; i >= 0; i--) if (customers[i].state === 'leave' && customers[i].o.position.distanceTo(customers[i].leave) < 0.2) { scene.remove(customers[i].o); customers[i].bub.remove(); customers.splice(i, 1); }
}
let earnMin = 0;
function payCash(v) { v = Math.round(v); earnMin += v; const n = Math.max(1, Math.min(8, Math.round(v / 6))); for (let k = 0; k < n; k++) { if (cashPile.full()) { SV.money += v / n; continue; } const o = makeItem('cash'); o.userData.v = v / n; scene.add(o); const to = cashPile.slot(cashPile.n); cashPile.items.push(o); o.position.set(4.5, 1.5, 7.6); fly(o, o.position, to, 0.35 + k * 0.05); } SV.made += 1; }

// ---------------- joystick ----------------
const joy = { on: false, ox: 0, oy: 0, x: 0, y: 0 }; const jb = $('#joy'), jk = $('#joyk');
canvas.addEventListener('pointerdown', e => { SFX.unlock(); joy.on = true; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; jb.style.left = e.clientX + 'px'; jb.style.top = e.clientY + 'px'; jb.classList.add('on'); jk.style.transform = 'translate(-50%,-50%)'; try { canvas.setPointerCapture(e.pointerId); } catch {} });
canvas.addEventListener('pointermove', e => { if (!joy.on) return; document.body.classList.add('moved'); let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const l = Math.hypot(dx, dy), R = 46; if (l > R) { dx *= R / l; dy *= R / l; } joy.x = dx / R; joy.y = dy / R; jk.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`; });
const end = () => { joy.on = false; joy.x = joy.y = 0; jb.classList.remove('on'); }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
const keys = {}; addEventListener('keydown', e => keys[e.key] = 1); addEventListener('keyup', e => keys[e.key] = 0);

const confettiBits = [];
function confetti(p) { for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), new THREE.MeshBasicMaterial({ color: [0xe22511, 0xffc20e, 0x2a80dc, 0x2fa043, 0xffffff][i % 5], side: THREE.DoubleSide })); m.position.copy(p); scene.add(m); confettiBits.push({ m, v: new THREE.Vector3(rnd(-4, 4), rnd(6, 11), rnd(-4, 4)), r: new THREE.Vector3(rnd(-8, 8), rnd(-8, 8), 0), t: 0 }); } }
export function setSound(on) { sound = on; SFX.enabled = on; try { localStorage.setItem('flix_fabrika_snd', on ? '1' : '0'); } catch {} if (on) SFX.unlock(); else SFX.setMusic(false); }
export const soundOn = () => sound;

// ---------------- tutorial ----------------
const TUT = [
  { t: 'Kümesten hindi tüylerini al', tgt: () => farmPile.zone, done: () => P.stack.some(o => o.userData.type === 'feather') },
  { t: 'Presten oyuncak tabanı al', tgt: () => pressPile.zone, done: () => P.stack.some(o => o.userData.type === 'base') },
  { t: 'Montaj masasına bırak', tgt: () => asm[0].inZone, done: () => asm[0].out.n > 0 || asm[0].inF.length + asm[0].inB > 0 && !P.stack.length },
  { t: 'Hazır FLIX’leri al', tgt: () => asm[0].out.zone, done: () => P.stack.some(o => o.userData.type === 'toy') },
  { t: 'Tezgâha götür, kasada dur', tgt: () => counter.zone, done: () => SV.del && cashPile.n > 0 || SV.money > 0 },
  { t: 'Kazandığın parayı topla', tgt: () => cashPile.pos, done: () => SV.money > 0 },
];
export const tutDone = () => SV.tut >= TUT.length;
function stepTutorial() {
  let tgt = null; const st = TUT[SV.tut];
  if (st) { if (st.done()) { SV.tut++; SFX.click(); if (SV.tut >= TUT.length) { $('#goal').classList.remove('show'); SV.gems += 10; toast('Harika! Parayla yeni alanlar aç · +10 💎'); refreshPads(); refreshHUD(); } save(); } else { $('#goal').textContent = st.t; $('#goal').classList.add('show'); tgt = st.tgt(); } }
  if (!tgt && padObjs.length && SV.money >= Math.min(...padObjs.map(o => o.p.cost - o.paid)) * 0.6) { const o = padObjs.reduce((a, b) => (a.p.cost - a.paid) < (b.p.cost - b.paid) ? a : b); tgt = o.mesh.position; }
  if (!tgt && tutDone() && !canSell() && counter.n > 0 && customers.length && P.stack.length === 0) tgt = counter.zone;
  guideTarget = tgt;
}

// ---------------- simulation ----------------
let feT = 0, prT = 0;
function near(p, r) { const a = P.o.position; return Math.hypot(a.x - p.x, a.z - p.z) < r; }
let zoneLock = null;
function stepZones(T) {
  let inZ = null; for (const k in ZONES) if (near(ZONES[k].pos, ZONES[k].r)) inZ = k;
  if (inZ && inZ !== zoneLock) { zoneLock = inZ; openPanel(inZ); }
  if (!inZ && zoneLock) { zoneLock = null; closePanel(); }
  for (const k in ZONES) ZONES[k].ring.material.opacity = 0.6 + Math.sin(T * 3) * 0.25;
}
function stepWorld(dt, T) {
  feT -= dt; if (feT <= 0) { feT = 5.5 * Math.pow(0.85, lv('kumes')) / turkeys.length; if (!farmPile.full()) { const tk = turkeys[Math.floor(rnd(0, turkeys.length))]; const o = makeItem('feather', tk.col); scene.add(o); o.position.copy(tk.o.position).add(new THREE.Vector3(0, 1, 0)); const to = farmPile.slot(farmPile.n); farmPile.items.push(o); fly(o, o.position, to, 0.7, null, 2.5); tk.peck = 1; } }
  prT -= dt; if (prT <= 0) { prT = 1.6 * Math.pow(0.85, lv('pres')); if (!pressPile.full()) { const o = makeItem('base'); scene.add(o); o.position.copy(pressPile.slot(pressPile.n)); o.scale.setScalar(0.01); pressPile.items.push(o); popIn(o); stationsAnim.press.userData.hit = 1; } }
  const ph = stationsAnim.press.userData; ph.hit = Math.max(0, (ph.hit || 0) - dt * 4); ph.pis.position.y = 3.5 - Math.sin(ph.hit * Math.PI) * 0.6;
  counter.max = 12 + lv('tez') * 4;
  for (const A of asm) { A.t -= dt; const work = A.inF.length > 0 && A.inB > 0 && !A.out.full();
    if (work && A.t <= 0) { A.t = 1.4 * Math.pow(0.85, lv('mont')); const col = A.inF.shift(); A.inB--; const it = makeItem('toy', col); scene.add(it); it.position.set(A.x, 1.2, A.z); const to = A.out.slot(A.out.n); A.out.items.push(it); fly(it, it.position, to, 0.4); SFX.pop(); syncBuf(A); }
    A.arm.rotation.z = work ? Math.sin(T * 8) * 0.4 : 0; A.a2.rotation.x = 1.3 + (work ? Math.sin(T * 12) * 0.3 : 0); }
  P.tick -= dt; if (P.tick <= 0) { P.tick = 0.09; interact(); }
  for (const o of padObjs) { const p = o.p; if (near(new THREE.Vector3(p.x, 0, p.z), 1.3) && SV.money >= 1) { o.t -= dt; if (o.t <= 0) { o.t = 0.05; const step = Math.min(Math.floor(SV.money), Math.max(1, Math.ceil(p.cost / 40)), p.cost - o.paid); SV.money -= step; o.paid += step; SV.paid[p.id] = o.paid; SFX.tick(); o.mesh.material.map = padTex(p, o.paid); if (o.paid >= p.cost) { unlock(p); break; } } } }
  for (const tk of turkeys) { tk.wait -= dt; const d = tk.tgt.clone().sub(tk.o.position); const dist = d.length();
    if (tk.wait <= 0 && dist > 0.1) { d.normalize(); tk.o.position.addScaledVector(d, dt * 1.2); tk.o.rotation.y = Math.atan2(d.x, d.z); tk.o.userData.body.position.y = Math.abs(Math.sin(T * 9)) * 0.05; }
    else if (dist <= 0.1) { tk.tgt = tkPos(); tk.wait = rnd(1, 3); }
    tk.peck = Math.max(0, tk.peck - dt * 1.5); tk.o.userData.body.rotation.x = Math.sin(tk.peck * Math.PI * 3) * 0.35 + (tk.wait > 0 ? Math.max(0, Math.sin(T * 3 + tk.o.position.x)) * 0.25 : 0); }
  for (const W of workers) stepWorker(W, dt);
  if (cashier) cashier.H.body.position.y = Math.abs(Math.sin(T * 2)) * 0.03;
  bigFlix.rotation.y = T * 0.6; bigFlix.position.y = 0.85 + Math.sin(T * 2) * 0.08;
}
function syncBuf(A) { A.bufObjs.forEach(o => scene.remove(o)); A.bufObjs = [];
  for (let k = 0; k < Math.min(A.inB, 6); k++) { const o = makeItem('base'); o.position.set(A.x - 1.0 + (k % 3) * 0.5, 1.12, A.z + 0.5 - (k >= 3 ? 0.45 : 0)); scene.add(o); A.bufObjs.push(o); }
  for (let k = 0; k < Math.min(A.inF.length, 6); k++) { const o = makeItem('feather', A.inF[k]); o.position.set(A.x + 0.2 + (k % 3) * 0.4, 1.13 + Math.floor(k / 3) * 0.1, A.z + 0.45); scene.add(o); A.bufObjs.push(o); } }
function dropTo(A, o) { const t = o.userData.type, col = o.userData.col; fly(o, o.position, new THREE.Vector3(A.x - 0.6, 1.2, A.z), 0.25, () => { scene.remove(o); if (t === 'feather') A.inF.push(col); else A.inB++; syncBuf(A); }); }
function interact() {
  const cap = capOf();
  if (near(cashPile.pos, 1.8) && cashPile.n) { for (let k = 0; k < 3 && cashPile.n; k++) { const o = cashPile.pop(); const v = o.userData.v || 5; fly(o, o.position, P.o.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.25, () => { scene.remove(o); SV.money += v; bumpMoney(); }); } SFX.coin(); haptic(8); return; }
  for (const A of asm) if (near(A.inZone, 1.5)) { const o = stackPopType(['feather', 'base']); if (o) { dropTo(A, o); SFX.drop(); return; } }
  if (near(counter.zone, 1.7)) { const o = stackPopType(['toy']); if (o) { if (counter.full()) { P.stack.push(o); P.hold.attach(o); restack(); } else { counter.push(o, o.position); SV.del = 1; SFX.drop(); return; } } }
  if (P.stack.length >= cap) return;
  const hasToy = P.stack.some(o => o.userData.type === 'toy'), hasRaw = P.stack.some(o => o.userData.type !== 'toy');
  if (!hasToy && near(farmPile.zone, 1.6) && farmPile.n) { stackPush(farmPile.pop()); SFX.pick(); haptic(6); return; }
  if (!hasToy && near(pressPile.zone, 1.6) && pressPile.n) { stackPush(pressPile.pop()); SFX.pick(); haptic(6); return; }
  for (const A of asm) if (!hasRaw && near(A.out.zone, 1.6) && A.out.n) { stackPush(A.out.pop()); SFX.pick(); haptic(6); return; }
}
// ---- worker AI ----
function wTake(W, o) { W.stack.push(o); W.hold.attach(o); o.scale.setScalar(1 / 0.68); o.rotation.set(0, 0, 0); let h = 0; W.stack.forEach(s => { s.position.set(0, h / 0.68, 0); h += H_OF[s.userData.type]; }); }
function stepWorker(W, dt) {
  const g = W.H.g; let tgt; const cap = wcap();
  const src = asm.reduce((a, b) => b.out.n > a.out.n ? b : a, asm[0]);
  const at = (p, r) => { if (g.position.distanceTo(p) < r) { W.ai -= dt; if (W.ai <= 0) { W.ai = 0.2; return true; } } return false; };
  if (W.state === 'toOut') { tgt = src.out.zone; if (!src.out.n && !W.stack.length) { W.idle = (W.idle || 0) + dt; if (W.idle > 1.0 + W.id * 0.7) { W.idle = 0; W.state = 'toFarm'; } } else W.idle = 0;
    if (at(tgt, 1.2)) { if (src.out.n && W.stack.length < cap) wTake(W, src.out.pop()); if (W.stack.length >= cap || (!src.out.n && W.stack.length)) W.state = 'toCounter'; } }
  else if (W.state === 'toCounter') { tgt = counter.zone; if (at(tgt, 1.4)) { if (W.stack.length && !counter.full()) { const o = W.stack.pop(); counter.push(o, o.getWorldPosition(new THREE.Vector3())); } if (!W.stack.length) W.state = 'toOut'; } }
  else if (W.state === 'toFarm') { tgt = farmPile.zone; if (at(tgt, 1.3)) { const half = Math.ceil(cap / 2); if (farmPile.n && W.stack.length < half) wTake(W, farmPile.pop()); if (W.stack.length >= half) W.state = 'toPress'; } }
  else if (W.state === 'toPress') { tgt = pressPile.zone; if (at(tgt, 1.3)) { if (pressPile.n && W.stack.length < cap) wTake(W, pressPile.pop()); if (W.stack.length >= cap) W.state = 'toAsm'; } }
  else { if (!W.A) W.A = asm.reduce((a, b) => (b.inF.length + b.inB) < (a.inF.length + a.inB) ? b : a, asm[0]); const A = W.A; tgt = A.inZone;
    if (at(tgt, 1.3)) { const o = W.stack.pop(); if (o) { const w = o.getWorldPosition(new THREE.Vector3()); scene.add(o); o.position.copy(w); o.scale.setScalar(1); dropTo(A, o); } if (!W.stack.length) { W.state = 'toOut'; W.A = null; } } }
  let wp = tgt; const gz = g.position.z, inS = gz > -7.5, tIn = tgt.z > -7.5; if (inS !== tIn) wp = new THREE.Vector3(0, 0, Math.abs(g.position.x) > 0.6 ? (inS ? -6.3 : -8.9) : (tIn ? -6.1 : -8.9)); else if (gz > -8.3 && gz < -6.7 && Math.abs(tgt.x) > 2.2) wp = new THREE.Vector3(0, 0, tIn ? -6.1 : -8.9);
  const sp = 4.5 * (1 + lv('wspd') * 0.15);
  const d = wp.clone().sub(g.position); d.y = 0; const dist = wp === tgt ? d.length() : 9; if (dist > 1.0) { d.normalize(); const ox = g.position.x, oz = g.position.z; g.position.addScaledVector(d, dt * sp); let r = resolve(g.position.x, g.position.z); if (Math.hypot(r.x - ox, r.z - oz) < dt * 1.5) { W.blk = 0.6; W.side = W.side || (Math.abs(d.x) > Math.abs(d.z) ? 1 : (d.z > 0 ? 1 : -1)); } if (W.blk > 0) { W.blk -= dt; if (Math.abs(d.x) > Math.abs(d.z)) r = resolve(r.x, r.z + W.side * dt * sp); else r = resolve(r.x + W.side * dt * sp, r.z); } else W.side = 0; g.position.x = r.x; g.position.z = r.z; g.rotation.y = Math.atan2(d.x, d.z); W.walk += dt * 11; } else W.walk = 0;
  animWalk(W.H, W.walk, dist > 1.0, W.stack.length > 0);
}
function animWalk(h, w, moving, carry) { const s = moving ? Math.sin(w) : 0; pose(h, { kickL: s * 0.6, kickR: -s * 0.6, kneeL: 0.2 + Math.max(0, -s) * 0.6, kneeR: 0.2 + Math.max(0, s) * 0.6, armL: carry ? [-1.25, 0.15, -0.3] : [s * 0.5, 0.25, -0.4], armR: carry ? [-1.25, 0.15, -0.3] : [-s * 0.5, 0.25, -0.4] }); h.body.position.y = moving ? Math.abs(Math.cos(w)) * 0.06 : 0; }
let moneyBump = 0; export function bumpMoney() { moneyBump = 1; }

// ---------------- loop ----------------
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth / innerHeight < 0.6 ? 46 : 34; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(), saveT = 0, minT = 60, shownMoney = SV.money, hudT = 0, paused = false;
export function setPaused(p) { paused = p; last = performance.now(); }
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); SFX.suspend(true); } else { SFX.suspend(false); last = performance.now(); } });
const camOff = new THREE.Vector3(0, 24, 16), camLook = new THREE.Vector3();
function frame(now) {
  requestAnimationFrame(frame); if (paused || document.hidden) { last = now; return; } const dt = Math.min(0.05, (now - last) / 1000); last = now; const T = now / 1000;
  let ix = joy.x, iz = joy.y; if (keys.ArrowLeft || keys.a) ix = -1; if (keys.ArrowRight || keys.d) ix = 1; if (keys.ArrowUp || keys.w) iz = -1; if (keys.ArrowDown || keys.s) iz = 1;
  const mag = Math.min(1, Math.hypot(ix, iz)); const moving = mag > 0.12;
  if (moving) { const sp = P.speed * (1 + lv('spd') * 0.12) * mag; const nx = P.o.position.x + ix / Math.hypot(ix, iz) * sp * dt, nz = P.o.position.z + iz / Math.hypot(ix, iz) * sp * dt; const p = resolve(nx, nz); P.o.position.x = p.x; P.o.position.z = p.z;
    const ang = Math.atan2(ix, iz); let da = ang - P.o.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); P.o.rotation.y += da * Math.min(1, dt * 14); P.walk += dt * 13 * mag; }
  animWalk(H, P.walk, moving, P.stack.length > 0);
  P.stack.forEach((o, i) => { o.rotation.z = Math.sin(T * 6 + i * 0.3) * 0.02 * i * (moving ? 1 : 0.3); });
  stepWorld(dt, T); stepCustomers(dt); stepTutorial(); stepZones(T);
  for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t += dt / tw.dur; const e = Math.min(1, tw.t);
    if (tw.scale) tw.obj.scale.setScalar(Math.max(0.01, (1 + Math.sin(e * Math.PI) * 0.25) * e));
    else { tw.obj.position.lerpVectors(tw.from, tw.to, e); tw.obj.position.y += Math.sin(e * Math.PI) * tw.arc; }
    if (e >= 1) { if (tw.scale) tw.obj.scale.setScalar(1); tweens.splice(i, 1); tw.onEnd && tw.onEnd(); } }
  for (let i = confettiBits.length - 1; i >= 0; i--) { const c = confettiBits[i]; c.t += dt; c.v.y -= 18 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.r.x * dt; c.m.rotation.y += c.r.y * dt; if (c.t > 2) { scene.remove(c.m); confettiBits.splice(i, 1); } }
  if (guideTarget) { const d = guideTarget.clone().sub(P.o.position); d.y = 0; const dist = d.length(); arrow.visible = dist > 2.5; beacon.visible = true; beacon.position.set(guideTarget.x, 0.05, guideTarget.z); beacon.scale.setScalar(1 + Math.sin(T * 5) * 0.08);
    arrow.position.copy(P.o.position).addScaledVector(d.normalize(), 1.6); arrow.position.y = 0; arrow.rotation.y = Math.atan2(d.x, d.z) + Math.PI; arrow.children[0].material.opacity = 0.7 + Math.sin(T * 6) * 0.25; }
  else { arrow.visible = false; beacon.visible = false; }
  camLook.lerp(new THREE.Vector3(P.o.position.x * 0.85, 0, P.o.position.z - 1.5), Math.min(1, dt * 5)); camera.position.copy(camLook).add(camOff); camera.lookAt(camLook);
  sun.position.copy(camLook).add(new THREE.Vector3(-9, 22, 8)); sun.target.position.copy(camLook);
  shownMoney += (SV.money - shownMoney) * Math.min(1, dt * 10); $('#money b').textContent = fmt(Math.round(shownMoney)); moneyBump = Math.max(0, moneyBump - dt * 4); $('#money').style.transform = `scale(${1 + Math.sin(moneyBump * Math.PI) * 0.12})`;
  const v = P.o.position.clone().add(new THREE.Vector3(0, 2.9 + P.stack.reduce((a, o) => a + H_OF[o.userData.type], 0) * 0.78, 0)).project(camera);
  P.lbl.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px,${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`; P.lbl.textContent = P.stack.length >= capOf() ? 'DOLU' : ''; P.lbl.style.opacity = P.stack.length >= capOf() ? 1 : 0;
  hudT -= dt; if (hudT <= 0) { hudT = 0.5; refreshHUD(); }
  minT -= dt; if (minT <= 0) { minT = 60; SV.ipm = SV.ipm ? SV.ipm * 0.7 + earnMin * 0.3 : earnMin; earnMin = 0; }
  saveT -= dt; if (saveT <= 0) { saveT = 4; SV.px = P.o.position.x; SV.pz = P.o.position.z; save(); }
  renderer.render(scene, camera);
}
function resolve(x, z) { x = Math.max(BOUNDS.x0 + 0.5, Math.min(BOUNDS.x1 - 0.5, x)); z = Math.max(BOUNDS.z0 + 0.5, Math.min(BOUNDS.z1, z)); const r = 0.45;
  for (const c of colliders) { if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) { const dl = x - (c.x0 - r), dr = (c.x1 + r) - x, du = z - (c.z0 - r), dd = (c.z1 + r) - z, m = Math.min(dl, dr, du, dd); if (m === dl) x = c.x0 - r; else if (m === dr) x = c.x1 + r; else if (m === du) z = c.z0 - r; else z = c.z1 + r; } }
  return { x, z }; }
(async () => {
  const img = new Image(); img.src = window.FLIX_LOGO; await img.decode().catch(() => {}); LOGO = img;
  TOYM.back = M(0xffffff, { roughness: 0.6, map: tex(256, 320, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ff3a22'); g.addColorStop(1, '#b01608'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = -h; i < w; i += 36) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.lineTo(i + h + 14, 0); c.lineTo(i + 14, h); c.fill(); } if (LOGO) c.drawImage(LOGO, 58, 8, 140, 124); c.fillStyle = '#ffc20e'; c.font = 'italic 900 34px BC'; c.textAlign = 'center'; c.fillText('KICK · FLICK', w / 2, h - 18); }) });
  setFloor(SV.cos.floor);
  buildWorld(); buildPlayer(); for (const id of SV.unl) { const p = PADS.find(q => q.id === id); if (p) actPad(p); } spawnStaff(); refreshPads(); resize();
  initUI();
  camLook.set(P.o.position.x * 0.85, 0, P.o.position.z - 1.5); requestAnimationFrame(frame); document.body.classList.add('ready');
  offlinePopup();
  window.__fb = { get W() { return workers.map(w => ({ s: w.state, n: w.stack.length, x: +w.H.g.position.x.toFixed(1), z: +w.H.g.position.z.toFixed(1) })); }, get SV() { return SV; }, get P() { return P; }, setMoney: m => { SV.money = m; }, tp: (x, z) => { P.o.position.set(x, 0, z); },
    get counter() { return counter.n; }, get cash() { return cashPile.n; }, get asm() { return asm.map(a => [a.inF.length, a.inB, a.out.n]); }, get cust() { return customers.length; }, get turkeys() { return turkeys.map(t => t.col); }, get zone() { return zoneLock; }, zoom: (f) => camOff.multiplyScalar(f), look: (s, a) => { SV.cos.skin = s; SV.cos.acc = a; setLook(); } };
})();
