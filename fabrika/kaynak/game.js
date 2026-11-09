// Flix Fabrika 1.5 — karakterle oynanan fabrika: renkli hindi çiftliği → pres → montaj → TEST → tezgâh / kamyon.
// Yeni salon (genişleme): kamyon, FLIX Top hattı, hediye paketi, hindi sürüsü. Konveyör, fabrika seviyesi ve süslemeler.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { hero, pose, leafGeo, ink } from './hero.js';
import { SFX } from './sfx.js';
import { COLS, PADS, COS, PROD, BONUS, UPS, SUPS, STAFF, KICKN, spdPct, PROMO, ORDERS } from './config.js';
import { boostOffer, initUI, openPanel, closePanel, panelOpen, toast, refreshHUD, maybeInter, offlinePopup, haptic } from './ui.js';

const $ = (s) => document.querySelector(s);
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
export const fmt = (n) => n < 10000 ? Math.floor(n).toLocaleString('tr-TR') : n < 1e6 ? (n / 1e3).toFixed(1).replace('.', ',') + ' B' : (n / 1e6).toFixed(2).replace('.', ',') + ' M';

// ---------------- save ----------------
const DEF = () => ({ v: 3, t2: 1, t3: 1, t4: 1, money: 0, gems: 0, unl: [], tut: 0, made: 0, up: {}, staff: { tas: 0, kas: 0 }, cos: { skin: 'kraliyet', acc: 'yok', floor: 'nane', wskin: 'karisik', wacc: 'kask', own: ['kraliyet', 'yok', 'nane', 'karisik', 'kask'] }, ct: null, ctDone: 0,
  noads: 0, vip: 0, starter: 0, boostUntil: 0, ads: { day: '', n: 0, last: 0 }, freeUpLast: 0, lastInter: 0, lastSeen: 0, ipm: 0, del: 0, paid: {}, txn: [], bonus: {} });
// Endgame test modu (Kaan için): ayrı kayıt, her şey açık, tüm geliştirmeler en üstte, tüm bonuslar kalıcı
export const ENDGAME = (() => { try { return localStorage.getItem('flix_fab_mode') === 'end'; } catch { return false; } })();
const KEY = ENDGAME ? 'flix_fabrika_end' : 'flix_fabrika3';
export function setEndgame(on) { try { localStorage.setItem('flix_fab_mode', on ? 'end' : 'normal'); } catch {} save(); location.reload(); }
function endSave() { const d = DEF(), far = Date.now() + 3650 * 864e5; d.tut = 99; d.del = 1; d.money = 1e6; d.gems = 99999; d.unl = PADS.map(p => p.id);
  // calm endgame: every area open, but mid-level upgrades, 6 carriers and no permanent bonuses (it was too fast and busy)
  const EL = { spd: 6, cap: 14, kar: 12, pres: 8, mont: 8, kumes: 8, bant: 6, test: 6, truck: 6, tez: 8, robot: 4, cek: 8, pazar: 10, wspd: 3, wcap: 4 };
  for (const u of UPS.concat(SUPS)) d.up[u.id] = Math.min(u.max, EL[u.id] ?? 6); d.staff = { tas: 6, kas: STAFF.find(q => q.id === 'kas').max }; d.calm = 1;
  d.cos = { skin: 'galaksi', acc: 'hale', floor: 'gece', wskin: 'altin', wacc: 'kask', own: Object.values(COS).flat().map(c => c.id) }; d.vip = 1; d.noads = 1; return d; }
export let SV = (() => { const d = DEF(); try {
  const o = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (ENDGAME && !(o && o.v === 3)) return endSave();
  if (o && o.v === 3) { const s = { ...d, ...o, cos: { ...d.cos, ...o.cos }, staff: { ...d.staff, ...o.staff }, ads: { ...d.ads, ...o.ads } }; if (!o.t2) { if (s.tut >= 6) s.tut = 99; s.t2 = 1; } if (!o.t3) { s.t3 = 1; if (s.tut < 99) s.tut = 0; if (s.unl.length) for (const id of ['park', 'pres', 'ciftlik0', 'masa', 'atolye']) if (!s.unl.includes(id)) s.unl.unshift(id); } if (!o.t4) { s.t4 = 1; const i = s.unl.indexOf('atolye'); if (i >= 0) for (const id of ['bina', 'depo']) if (!s.unl.includes(id)) s.unl.splice(i + 1, 0, id); } for (const f of ['karisik', 'kask', 'yok']) if (!s.cos.own.includes(f)) s.cos.own.push(f); if (ENDGAME) { const e = endSave(); for (const id of e.unl) if (!s.unl.includes(id)) s.unl.push(id); if (!s.calm) { s.up = { ...e.up }; s.bonus = {}; s.boostUntil = 0; s.calm = 1; } else for (const k in e.up) s.up[k] = Math.max(s.up[k] || 0, e.up[k]); s.staff = e.staff; for (const id of e.cos.own) if (!s.cos.own.includes(id)) s.cos.own.push(id); } return s; }
  if (ENDGAME) return endSave();
  const o2 = JSON.parse(localStorage.getItem('flix_fabrika2') || 'null');
  if (o2 && o2.v === 2) { d.money = (o2.money || 0) + 300; d.tut = (o2.tut || 0) >= 6 ? 99 : 0; d.made = o2.made || 0; d.del = o2.del || 0; if ((o2.unl || []).includes('asm2')) d.unl.push('ofis', 'mavi', 'asm2'); if ((o2.unl || []).includes('isci')) { d.unl.push('ik'); d.staff.tas = 1; } return d; }
} catch {} return d; })();
export const save = () => { try { SV.lastSeen = Date.now(); localStorage.setItem(KEY, JSON.stringify(SV)); } catch {} };
export const lv = (id) => SV.up[id] || 0;
const has = (id) => SV.unl.includes(id);
export const factoryLevel = () => 1 + SV.unl.length;
let sound = (() => { try { return localStorage.getItem('flix_fabrika_snd') !== '0'; } catch { return true; } })(); SFX.enabled = sound;

// ---------------- renderer ----------------
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const DPR_MAX = Math.min(devicePixelRatio || 1, 2); let dpr = DPR_MAX, fpsAcc = 0, fpsN = 0, fpsT = 0; renderer.setPixelRatio(dpr);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xaedcf2, 60, 120);
{ const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; const c = cv.getContext('2d'), gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#4aa8ea'); gr.addColorStop(0.55, '#9fd6f4'); gr.addColorStop(1, '#e8f6ff'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
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
const label = (txt, bg, w = 256, fs = 44) => tex(w, 64, (c, W, h) => { c.fillStyle = '#1b1330'; c.beginPath(); c.roundRect(0, 0, W, h, 18); c.fill(); c.fillStyle = bg; c.beginPath(); c.roundRect(4, 4, W - 8, h - 8, 14); c.fill(); c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(10, 8, W - 20, 6); c.font = `italic 900 ${fs}px BC`; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = '#1b1330'; c.strokeText(txt, W / 2, 48); c.fillStyle = '#fff'; c.fillText(txt, W / 2, 48); });
const sign = (txt, bg, par, x, y, z, w = 1.6, ry = 0) => { const s = add(new THREE.PlaneGeometry(w, w / 4), M(0xffffff, { map: label(txt, bg), transparent: true }), par, x, y, z); s.rotation.y = ry; s.castShadow = false; return s; };
const floorText = (txt, x, z, w = 1.5) => { const l = add(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: tex(256, 64, (c, W) => { c.fillStyle = '#fff'; c.font = 'italic 900 40px BC'; c.textAlign = 'center'; c.fillText(txt, W / 2, 46); }), transparent: true, depthWrite: false }), null, x, 0.05, z); l.rotation.x = -Math.PI / 2; l.castShadow = false; return l; };
let LOGO = null;
const C = { red: 0xe22511, navy: 0x0b2a5e, yel: 0xffc20e, orange: 0xf08a24 };
const MT = {
  grass: M(0x7cc85a, { roughness: 0.95 }), floor: M(0xffffff, { roughness: 0.75 }), wall: M(0xfff6ea, { roughness: 0.85 }), wallTop: M(C.red, { roughness: 0.5 }),
  wood: M(0xc8935a, { roughness: 0.8 }), woodD: M(0x8a5a32, { roughness: 0.85 }), fence: M(0xfff3e0, { roughness: 0.7 }),
  red: M(C.red, { roughness: 0.4 }), yel: M(C.yel, { roughness: 0.4 }), navy: M(C.navy, { roughness: 0.5 }), steel: M(0xd9dee6, { metalness: 0.6, roughness: 0.3 }),
  dark: M(0x2b2e36, { roughness: 0.6 }), dome: M(C.orange, { roughness: 0.6 }), white: M(0xffffff, { roughness: 0.6 }), road: M(0x5d6474, { roughness: 0.9 }), green: M(0x2fa043, { roughness: 0.45 }), purple: M(0x7a4fd8, { roughness: 0.45 }),
};
const noise = (c, w, h, a = 0.05, n = 9000) => { for (let i = 0; i < n; i++) { c.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${a * Math.random()})` : `rgba(255,255,255,${a * 1.4 * Math.random()})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } };
// panel seams + rivets for machine bodies, brushed work tops, wooden counter top
const PANEL = tex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); noise(c, w, h, 0.04, 3000); c.fillStyle = 'rgba(0,0,0,.13)'; c.fillRect(w / 2 - 2, 14, 3, h - 28); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(w / 2 + 1, 14, 2, h - 28);
  for (const x of [22, w - 22]) for (const y of [22, h - 22]) { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(x, y + 1, 6, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(0, h - 10, w, 10); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, 0, w, 6); });
for (const k of ['yel', 'purple', 'green', 'navy']) { MT[k].map = PANEL; MT[k].needsUpdate = true; }
MT.top = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15, map: tex(512, 256, (c, w, h) => { c.fillStyle = '#eef1f5'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * 0.06})`; c.fillRect(0, y, w, 1); }
  c.strokeStyle = 'rgba(11,42,94,.08)'; c.lineWidth = 1; for (let x = 32; x < w; x += 32) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x, h - 10); c.stroke(); } for (let y = 32; y < h; y += 32) { c.beginPath(); c.moveTo(10, y); c.lineTo(w - 10, y); c.stroke(); }
  c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); }) });
MT.wtop = new THREE.MeshStandardMaterial({ roughness: 0.45, map: tex(512, 128, (c, w, h) => { c.fillStyle = '#d9a46a'; c.fillRect(0, 0, w, h); for (let k = 0; k < 4; k++) { c.fillStyle = `hsl(30,50%,${60 + (k % 2) * 4}%)`; c.fillRect(0, k * 32, w, 32); c.strokeStyle = 'rgba(90,50,20,.25)'; c.lineWidth = 1.2; for (let j = 0; j < 4; j++) { const yy = k * 32 + 6 + j * 7; c.beginPath(); c.moveTo(0, yy); for (let x = 0; x <= w; x += 24) c.lineTo(x, yy + Math.sin((x + k * 80 + j * 30) / 50) * 2); c.stroke(); } c.fillStyle = 'rgba(70,35,10,.45)'; c.fillRect(0, k * 32, w, 2); } noise(c, w, h, 0.05, 2000); }) });
export function setFloor(id) {
  const F = COS.floor.find(f => f.id === id) || COS.floor[0];
  if (MT.floor.map) MT.floor.map.dispose();
  MT.floor.map = tex(1024, 1024, (c, w, h) => { const T = 128;
    if (F.wood) { for (let j = 0; j < 8; j++) for (let i = -1; i < 2; i++) { const x0 = (j % 2) * 256 + i * 512, y0 = j * T, l = 56 + ((i * 5 + j * 3 + 9) % 7) * 3.5; c.fillStyle = `hsl(${28 + (j % 3) * 3},50%,${l}%)`; c.fillRect(x0, y0, 512, T);
        c.strokeStyle = `hsla(25,55%,${l - 14}%,.35)`; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { const yy = y0 + 10 + k * 16 + Math.sin(k + j) * 4; c.beginPath(); c.moveTo(x0, yy); for (let x = 0; x <= 512; x += 32) c.lineTo(x0 + x, yy + Math.sin((x + k * 50 + j * 90) / 70) * 3); c.stroke(); }
        c.fillStyle = `hsla(25,50%,${l - 20}%,.4)`; c.beginPath(); c.ellipse(x0 + 150 + (j * 70) % 300, y0 + 64, 14, 6, 0, 0, 7); c.fill(); }
      noise(c, w, h, 0.05); c.strokeStyle = 'rgba(70,35,10,.5)'; c.lineWidth = 3; for (let j = 0; j <= 8; j++) { c.beginPath(); c.moveTo(0, j * T); c.lineTo(w, j * T); c.stroke(); for (let i = 0; i < 3; i++) { const x = (j % 2) * 256 + i * 512; c.beginPath(); c.moveTo(x, j * T); c.lineTo(x, j * T + T); c.stroke(); } } return; }
    if (F.grass) { for (let j = 0; j < 8; j++) { c.fillStyle = j % 2 ? F.a : F.b2; c.fillRect(0, j * T, w, T); } for (let i = 0; i < 26000; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '20,80,20' : '200,255,160'},${Math.random() * 0.25})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 4); } c.strokeStyle = F.l; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); return; }
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const x = i * T, y = j * T; c.fillStyle = F.rainbow ? `hsl(${((i + j) * 40) % 360},70%,${(i + j) % 2 ? 80 : 72}%)` : (i + j) % 2 ? F.a : F.b2; c.fillRect(x, y, T, T);
      const g = c.createLinearGradient(x, y, x + T, y + T); g.addColorStop(0, 'rgba(255,255,255,.1)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.06)'); c.fillStyle = g; c.fillRect(x, y, T, T);
      c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x + 3, y + 3, T - 6, 3); c.fillRect(x + 3, y + 3, 3, T - 6); c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(x + 3, y + T - 6, T - 6, 3); c.fillRect(x + T - 6, y + 3, 3, T - 6); }
    noise(c, w, h, 0.035, 14000);
    if (F.stars) for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`; const r = Math.random() < 0.9 ? 1.2 : 2.6; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, r, 0, 7); c.fill(); }
    if (F.hazard) for (const y of [0, h / 2]) { c.save(); c.beginPath(); c.rect(0, y, w, 18); c.clip(); for (let x = -40; x < w + 40; x += 36) { c.fillStyle = '#ffc20e'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y); c.lineTo(x + 36, y + 18); c.lineTo(x + 18, y + 18); c.fill(); c.fillStyle = '#22262e'; c.beginPath(); c.moveTo(x + 18, y); c.lineTo(x + 36, y); c.lineTo(x + 54, y + 18); c.lineTo(x + 36, y + 18); c.fill(); } c.restore(); }
    if (F.marble) { c.lineCap = 'round'; for (let k = 0; k < 40; k++) { c.strokeStyle = `rgba(110,110,130,${0.08 + Math.random() * 0.14})`; c.lineWidth = 0.8 + Math.random() * 2; let x = Math.random() * w, y = Math.random() * h; c.beginPath(); c.moveTo(x, y); for (let q = 0; q < 8; q++) { x += (Math.random() - 0.3) * 50; y += (Math.random() - 0.5) * 40; c.lineTo(x, y); } c.stroke(); } }
    c.strokeStyle = F.l || 'rgba(0,0,0,.15)'; c.lineWidth = 3; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * T, 0); c.lineTo(i * T, h); c.stroke(); c.beginPath(); c.moveTo(0, i * T); c.lineTo(w, i * T); c.stroke(); }
  }, true); MT.floor.map.anisotropy = 8; MT.floor.map.repeat.set(1 / 4.32, 1 / 4.9); MT.floor.roughness = F.wood ? 0.6 : 0.62; MT.floor.needsUpdate = true;
}
// floor planes use world-scaled UVs so the main hall and the new hall tile the same way
function floorPlane(w, d, x, z) { const g = new THREE.PlaneGeometry(w, d); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - 0.5) * w + x, (uv.getY(i) - 0.5) * d - z); const m = add(g, MT.floor, null, x, 0.02, z); m.rotation.x = -Math.PI / 2; return m; }

// turkey feathers
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
  band: new THREE.TorusGeometry(0.365, 0.03, 8, 32), band2: new THREE.TorusGeometry(0.335, 0.018, 6, 32), box: new RoundedBoxGeometry(0.9, 1.16, 0.62, 2, 0.05), boxBack: new THREE.PlaneGeometry(0.84, 1.12), boxFloor: new RoundedBoxGeometry(0.86, 0.1, 0.62, 2, 0.03),
  ball: new THREE.SphereGeometry(0.3, 24, 16), gift: new RoundedBoxGeometry(0.9, 0.8, 0.7, 2, 0.05), rib: new THREE.BoxGeometry(0.16, 0.82, 0.72), rib2: new THREE.BoxGeometry(0.92, 0.82, 0.16), bow: new THREE.TorusGeometry(0.13, 0.05, 8, 16),
  rubber: new THREE.SphereGeometry(0.26, 16, 10), sticker: new THREE.CircleGeometry(0.13, 20),
  plush: new THREE.SphereGeometry(0.34, 22, 16), plushBelly: new THREE.SphereGeometry(0.2, 16, 12), plushEye: new THREE.SphereGeometry(0.045, 10, 8), plushEar: new THREE.SphereGeometry(0.1, 12, 8), heart: new THREE.SphereGeometry(0.08, 10, 8), keyRing: new THREE.TorusGeometry(0.1, 0.022, 8, 20), keyTag: new THREE.CircleGeometry(0.08, 16) };
const GT = { Capsule: THREE.CapsuleGeometry, Sphere: THREE.SphereGeometry, Cylinder: THREE.CylinderGeometry, Box: THREE.BoxGeometry, Torus: THREE.TorusGeometry, Cone: THREE.ConeGeometry, Icosahedron: THREE.IcosahedronGeometry };
const GC = {}; const G = (type, ...a) => { const k = type + a.join(','); return GC[k] || (GC[k] = new GT[type](...a)); };
const RBC = {}; const rbc = (w, h, d, m, par, x, y, z, r = 0.08) => { const k = [w, h, d, r].join(','); return add(RBC[k] || (RBC[k] = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2))), m, par, x, y, z); };
const outl = (g) => ink(g, 0.022, 0x1b1330);
const PMX = {}; const pmatX = (k, f) => PMX[k] || (PMX[k] = f());
const TOYM = { base: new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.32, emissive: C.red, emissiveIntensity: 0.12 }), navy: M(0x022753, { roughness: 0.4 }), white: M(0xffffff, { roughness: 0.4 }),
  shell: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.14, depthWrite: false, clearcoat: 1 }), floor: M(0xffc20e, { roughness: 0.5 }), back: null, backTop: null,
  ball: M(0xffffff, { roughness: 0.35, map: tex(256, 128, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#16213a'; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { const x = i * 44 + (j % 2) * 22, y = 20 + j * 44; c.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2 - Math.PI / 2; c.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13); } c.fill(); } c.fillStyle = '#e22511'; c.fillRect(0, 60, w, 6); }) }),
  wrap: M(0xffffff, { roughness: 0.4, map: tex(128, 128, (c, w, h) => { c.fillStyle = '#e22511'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if ((i + j) % 2) { c.beginPath(); c.arc(i * 24 + 10, j * 24 + 10, 5, 0, 7); c.fill(); } }) }), ribbon: M(0xffc20e, { roughness: 0.3, metalness: 0.2 }),
  rubber: M(0x2a2d36, { roughness: 0.25, metalness: 0.1 }),
  heart: M(0xff4a8a, { roughness: 0.4 }), bad: new THREE.MeshBasicMaterial({ map: tex(64, 64, (c) => { c.fillStyle = '#e22511'; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(20, 20); c.lineTo(44, 44); c.moveTo(44, 20); c.lineTo(20, 44); c.stroke(); }), transparent: true }),
  ok: new THREE.MeshBasicMaterial({ map: tex(64, 64, (c) => { c.fillStyle = '#25a855'; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(17, 33); c.lineTo(28, 44); c.lineTo(47, 21); c.stroke(); }), transparent: true }) };
const BILL = M(0x66c25a, { roughness: 0.6, map: tex(128, 64, (c, w, h) => { c.fillStyle = '#7fd36a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2f7a2a'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#2f7a2a'; c.font = 'bold 36px sans-serif'; c.textAlign = 'center'; c.fillText('₺', w / 2, 46); }) });
export function makeFlix(col, s = 1) {
  const g = new THREE.Group(); add(GEO.toyBase, TOYM.base, g); const b = add(GEO.band, TOYM.navy, g, 0, 0.33, 0); b.rotation.x = Math.PI / 2; const b2 = add(GEO.band2, TOYM.white, g, 0, 0.2, 0); b2.rotation.x = Math.PI / 2;
  [-1, 0, 1].forEach((k) => { const piv = new THREE.Group(); piv.position.set(k * 0.12, 0.42, 0); piv.rotation.z = -k * 0.42; piv.rotation.x = k === 0 ? -0.08 : 0.06; g.add(piv); add(toyFeatherGeo, FM[col] || FM.dogal, piv); });
  g.scale.setScalar(s); return g;
}
const RAW = ['feather', 'base', 'rubber'], PRODS = ['toy', 'top', 'gift', 'plush', 'key', 'reject'];
const isRaw = (o) => RAW.includes(o.userData.type), isProd = (o) => PRODS.includes(o.userData.type);
function makeItem(type, col = 'dogal', v = 0) {
  const g = new THREE.Group(); g.userData.type = type; g.userData.col = col;
  if (type === 'feather') { [-0.25, 0, 0.25].forEach((r) => { const f = new THREE.Mesh(featherGeo, FM[col]); f.rotation.order = 'YXZ'; f.rotation.set(-Math.PI / 2, -Math.PI / 2 + r, 0); f.position.set(-0.32, 0.06, 0); f.castShadow = true; g.add(f); });
    const band = new THREE.Mesh(G('Cylinder', 0.06, 0.06, 0.1, 10), MT.red); band.rotation.z = Math.PI / 2; band.position.set(-0.2, 0.08, 0); g.add(band); }
  else if (type === 'base') { const d = new THREE.Mesh(GEO.dome, MT.dome); d.rotation.x = Math.PI; d.position.y = 0.27; d.castShadow = true; g.add(d); const b = new THREE.Mesh(GEO.brim, MT.red); b.position.y = 0.29; g.add(b); }
  else if (type === 'rubber') { const r = add(GEO.rubber, TOYM.rubber, g, 0, 0.16, 0); r.scale.set(1.2, 0.6, 1.0); }
  else if (type === 'toy' || type === 'top') {
    add(GEO.boxFloor, TOYM.floor, g, 0, 0.05, 0); add(GEO.boxBack, type === 'top' ? TOYM.backTop : TOYM.back, g, 0, 0.62, -0.28).castShadow = false;
    if (type === 'toy') { const t = makeFlix(col, 0.6); t.position.set(0, 0.1, 0.04); g.add(t); g.userData.v = COLS[col].v; }
    else { const b = add(GEO.ball, TOYM.ball, g, 0, 0.42, 0.03); b.rotation.set(0.4, 0.6, 0); g.userData.v = PROD.top; }
    const sh = new THREE.Mesh(GEO.box, TOYM.shell); sh.position.y = 0.62; sh.renderOrder = 2; g.add(sh); }
  else if (type === 'gift') { add(GEO.gift, TOYM.wrap, g, 0, 0.42, 0); add(GEO.rib, TOYM.ribbon, g, 0, 0.42, 0); add(GEO.rib2, TOYM.ribbon, g, 0, 0.42, 0); for (const s of [-1, 1]) { const b = add(GEO.bow, TOYM.ribbon, g, s * 0.12, 0.9, 0); b.rotation.set(0, s * 0.6, s * 0.5); } g.userData.v = v; g.userData.ok = true; }
  else if (type === 'cash') add(GEO.bill, BILL, g, 0, 0.05, 0);
  else if (type === 'plush') { const b = add(GEO.plush, pmatX('pl' + col, () => M(new THREE.Color(COLS[col].f), { roughness: 1 })), g, 0, 0.36, 0); b.scale.set(1, 0.85, 1); add(GEO.plushBelly, TOYM.white, g, 0, 0.3, 0.2).scale.set(1, 1, 0.5);
    for (const sd of [-1, 1]) { add(GEO.plushEye, TOYM.navy, g, sd * 0.1, 0.48, 0.3); add(GEO.plushEar, pmatX('pl' + col, () => M(new THREE.Color(COLS[col].f), { roughness: 1 })), g, sd * 0.22, 0.66, 0); }
    const f = makeFlix(col, 0.32); f.position.set(0, 0.62, -0.02); g.add(f); add(GEO.heart, TOYM.heart, g, 0.25, 0.16, 0.25); g.userData.v = v; g.userData.ok = true; }
  else if (type === 'key') { const f = makeFlix(col, 0.4); f.position.y = 0.04; g.add(f); const r = add(GEO.keyRing, MT.steel, g, 0, 0.42, 0); r.rotation.y = Math.PI / 2; add(GEO.keyTag, TOYM.ok, g, 0.18, 0.12, 0.12).rotation.x = -0.4; g.userData.v = v; g.userData.ok = true; }
  if (!(type === 'toy' || type === 'top' || type === 'gift' || type === 'plush')) g.traverse(o => { if (o.isMesh) o.castShadow = false; });
  return g;
}
function markReject(o) { o.userData.type = 'reject'; o.userData.ok = false; const s = new THREE.Mesh(GEO.sticker, TOYM.bad); s.position.set(0.28, 0.95, 0.32); o.add(s); }
function markTested(o) { o.userData.ok = true; const s = new THREE.Mesh(GEO.sticker, TOYM.ok); s.position.set(0.28, 0.95, 0.32); o.add(s); }
const H_OF = { feather: 0.17, base: 0.36, rubber: 0.3, toy: 1.2, top: 1.2, gift: 1.0, cash: 0.11, plush: 0.85, key: 0.4, reject: 1.2 };
const hOf = (o) => H_OF[o.userData.type] || 0.3;
class Pile {
  constructor(x, z, type, max, cols = 2, rows = 2, gap = 0.75) { this.pos = new THREE.Vector3(x, 0, z); this.type = type; this.max = max; this.cols = cols; this.rows = rows; this.gap = gap; this.items = []; this.base = 0.05; this.zone = this.pos.clone(); }
  slot(i) { const per = this.cols * this.rows, layer = Math.floor(i / per), k = i % per, cx = k % this.cols, cz = Math.floor(k / this.cols);
    return this.pos.clone().add(new THREE.Vector3((cx - (this.cols - 1) / 2) * this.gap, this.base + layer * H_OF[this.type], (cz - (this.rows - 1) / 2) * this.gap)); }
  get n() { return this.items.length; } full() { return this.items.length >= this.max; }
  push(obj, from) { const p = this.slot(this.items.length); this.items.push(obj); scene.attach(obj); obj.rotation.set(0, 0, 0); obj.scale.setScalar(1); fly(obj, from || obj.position.clone(), p, 0.28); }
  pop() { return this.items.pop(); }
  take(pred) { for (let i = this.items.length - 1; i >= 0; i--) if (pred(this.items[i])) { const o = this.items.splice(i, 1)[0]; for (let k = i; k < this.items.length; k++) this.items[k].position.copy(this.slot(k)); return o; } return null; }
}
const tweens = [];
function fly(obj, from, to, dur, onEnd, arc = 1.2) { const tw = { obj, from: from.clone(), to: to.clone(), t: 0, dur, onEnd, arc }; tweens.push(tw); return tw; }
function popIn(obj) { tweens.push({ obj, t: 0, dur: 0.25, scale: true }); }
const pops = [];
const popMat = { ok: new THREE.SpriteMaterial({ map: tex(128, 128, (c) => { c.fillStyle = '#25a855'; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(34, 66); c.lineTo(56, 88); c.lineTo(94, 42); c.stroke(); }), transparent: true, depthTest: false }),
  bad: new THREE.SpriteMaterial({ map: tex(128, 128, (c) => { c.fillStyle = '#e22511'; c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(40, 40); c.lineTo(88, 88); c.moveTo(88, 40); c.lineTo(40, 88); c.stroke(); }), transparent: true, depthTest: false }) };
function popSprite(kind, p) { const s = new THREE.Sprite(popMat[kind].clone()); s.position.copy(p); s.scale.setScalar(0.1); s.renderOrder = 5; scene.add(s); pops.push({ s, t: 0 }); }

// ---------------- world ----------------
const BOUNDS = { x0: -11, x1: 12.6, z0: -21, z1: 18.6 };
const farmZ = () => has('ciftlik') ? -27 : -20; let hallFence = null;
const colliders = [];
const box = (x0, x1, z0, z1) => { const c = { x0, x1, z0, z1 }; colliders.push(c); NAV.dirty = true; return c; };
const unbox = (c) => { const i = colliders.indexOf(c); if (i >= 0) colliders.splice(i, 1); NAV.dirty = true; };
let LW = null, farmLeft = null, pressPile2 = null, PR2 = null, ROB = [], robDock = null, pressPile, farmPile, farmPile2 = null, asm = [], counter, cashPile, K = [], cashiers = [], REJ, RC = null, PL = null, FB = null, backFence = null, padObjs = [], turkeys = [], customers = [], workers = [], cashier = null, arrow, beacon, guideTarget = null, bigFlix, farmRight, teaser, TS, TM = null, GS = null, TR = null, rubberPile = null, konv = null, dustT = 0;
export const ZONES = {};
const stationsAnim = {};
function buildWorld() {
  const gt = tex(256, 256, (c, w, h) => { c.fillStyle = '#86c95e'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '40,110,30' : '210,255,170'},${Math.random() * 0.22})`; c.fillRect(Math.random() * w, Math.random() * h, 1.5, 4); } for (let i = 0; i < 40; i++) { c.fillStyle = ['#fff6a0', '#ffffff', '#ff9ac0'][i % 3]; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1.6, 0, 7); c.fill(); } }, true); gt.repeat.set(50, 50);
  const gp = add(new THREE.PlaneGeometry(200, 200), M(0xffffff, { roughness: 1, map: gt }), null, 0, -0.02, 0); gp.rotation.x = -Math.PI / 2; gp.castShadow = false;
  buildStarter();
  // ---- shop counters (kasa): first one now, 3 more as pads ----
  buildCounter(0, 4.0); counter = K[0].pile; cashPile = K[0].cash;
  rb(1.6, 0.8, 1.6, MT.navy, null, 9.2, 0.4, 10.4, 0.12); bigFlix = makeFlix('mavi', 2.0); bigFlix.position.set(9.2, 0.8, 10.4); scene.add(bigFlix); box(8.4, 10.0, 9.6, 11.2);
  add(new THREE.PlaneGeometry(200, 6), MT.road, null, 0, 0.01, 23).rotation.x = -Math.PI / 2;
  for (let x = -40; x < 60; x += 4) add(new THREE.PlaneGeometry(2, 0.25), M(0xffffff), null, x, 0.02, 23).rotation.x = -Math.PI / 2;
  add(new THREE.PlaneGeometry(200, 2.4), M(0xd8d2c8), null, 0, 0.015, 19.9).rotation.x = -Math.PI / 2;
  for (const [x, z] of [[-27.5, -4], [-28, 4], [28, -2], [28.5, 6], [-27.5, 14], [28, -12], [-27.6, -14]]) { add(new THREE.CylinderGeometry(0.2, 0.28, 1.6, 8), MT.woodD, null, x, 0.8, z); add(new THREE.IcosahedronGeometry(1.4, 1), M(0x4fae5a, { flatShading: true, roughness: 0.9 }), null, x, 2.4, z); }
  buildOutside();
  arrow = new THREE.Group(); scene.add(arrow); const ag = new THREE.Shape(); ag.moveTo(0, 0.6); ag.lineTo(0.45, 0); ag.lineTo(0.17, 0); ag.lineTo(0.17, -0.5); ag.lineTo(-0.17, -0.5); ag.lineTo(-0.17, 0); ag.lineTo(-0.45, 0); ag.closePath();
  const am = new THREE.Mesh(new THREE.ShapeGeometry(ag), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.95, depthWrite: false })); am.rotation.x = -Math.PI / 2; am.position.y = 0.06; arrow.add(am);
  beacon = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xffd84a, transparent: true, opacity: 0.9, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.position.y = 0.05; scene.add(beacon);
}
// ---- starter yard: a small fenced plot with one turkey pen, one little machine and the stand ----
let ST = null, penPile = null, miniPile = null, farmGate = null; const plotObjs = [];
function buildStarter() {
  plotObjs.push(rb(16.8, 0.3, 12.6, MT.white, null, 2.0, -0.14, 12.45, 0.1), floorPlane(16.5, 12.3, 2.0, 12.45));
  const pf = new THREE.Group(); scene.add(pf); plotObjs.push(pf);
  for (let x = -6.3; x <= 10.31; x += 1.2) rb(0.14, 0.9, 0.14, MT.fence, pf, x, 0.45, 6.3, 0.04); rb(16.6, 0.1, 0.1, MT.fence, pf, 2.0, 0.75, 6.3, 0.03);
  for (const x of [-6.3, 10.3]) { for (let z = 6.3; z <= 18.6; z += 1.2) rb(0.14, 0.9, 0.14, MT.fence, pf, x, 0.45, z, 0.04); rb(0.1, 0.1, 12.3, MT.fence, pf, x, 0.75, 12.45, 0.03); }
  const st = tex(512, 128, (c, w, h) => { c.fillStyle = '#1b1330'; c.beginPath(); c.roundRect(0, 0, w, h, 26); c.fill(); c.fillStyle = '#e22511'; c.beginPath(); c.roundRect(5, 5, w - 10, h - 10, 22); c.fill(); if (LOGO) c.drawImage(LOGO, 14, 8, 120, 110); c.fillStyle = '#fff'; c.font = 'italic 900 70px BC'; c.lineWidth = 8; c.strokeStyle = '#1b1330'; c.strokeText('ATÖLYE', 150, 90); c.fillText('ATÖLYE', 150, 90); });
  for (const sx of [-1.3, 1.3]) rb(0.12, 2.2, 0.12, MT.woodD, pf, 2.0 + sx, 1.1, 6.2, 0.03); add(new THREE.PlaneGeometry(3.0, 0.75), M(0xffffff, { map: st, transparent: true }), pf, 2.0, 2.0, 6.25).castShadow = false;
  // turkey pen
  const pen = new THREE.Group(); pen.position.set(-3.6, 0, 9.0); scene.add(pen); const hay = tex(64, 64, (c) => { c.fillStyle = '#d9b860'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '160,120,40' : '255,240,170'},.6)`; c.fillRect(Math.random() * 64, Math.random() * 64, 1, 5); } });
  const pg = add(new THREE.PlaneGeometry(3.4, 3.0), M(0xffffff, { map: hay, roughness: 1 }), pen, 0, 0.03, 0); pg.rotation.x = -Math.PI / 2; pg.castShadow = false;
  for (const [x0, z0, x1, z1] of [[-1.7, -1.5, 1.7, -1.5], [-1.7, -1.5, -1.7, 1.5], [1.7, -1.5, 1.7, 1.5], [-1.7, 1.5, 0.6, 1.5]]) { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 0.55); for (let k = 0; k <= n; k++) rb(0.1, 0.7, 0.1, MT.woodD, pen, x0 + (x1 - x0) * k / n, 0.35, z0 + (z1 - z0) * k / n, 0.03); const r = rb(x0 === x1 ? 0.08 : L, 0.08, z0 === z1 ? 0.08 : L, MT.wood, pen, (x0 + x1) / 2, 0.55, (z0 + z1) / 2, 0.02); }
  const coop = new THREE.Group(); coop.position.set(-1.0, 0, -0.9); pen.add(coop); rb(1.0, 0.8, 0.8, M(0xc8402e, { roughness: 0.7 }), coop, 0, 0.4, 0, 0.06); const rf = add(new THREE.ConeGeometry(0.8, 0.5, 4), M(0x5a3a2a), coop, 0, 1.05, 0); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.8;
  rb(0.9, 0.22, 0.34, MT.woodD, pen, 0.95, 0.11, -1.05, 0.04); add(new THREE.PlaneGeometry(0.78, 0.24), M(0x4fb8f0, { roughness: 0.1 }), pen, 0.95, 0.23, -1.05).rotation.x = -Math.PI / 2;
  add(G('Cylinder', 0.32, 0.26, 0.3, 14), MT.yel, pen, -1.15, 0.15, 0.85); add(G('Sphere', 0.27, 10, 6), M(0xd9b860, { roughness: 1 }), pen, -1.15, 0.3, 0.85).scale.y = 0.4;
  sign('KÜMES', '#2fa043', pen, 0.4, 1.0, -1.42, 1.2); 
  rb(1.0, 0.45, 0.8, MT.wood, null, -1.0, 0.22, 8.2, 0.05); outl(pen);
  { const yd = new THREE.Group(); scene.add(yd); plotObjs.push(yd); const stone = M(0xc9c2b4, { roughness: 0.9 });
    const path = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 0.75); for (let k = 1; k < n; k++) { const s = add(G('Cylinder', 0.3, 0.32, 0.04, 10), stone, yd, x0 + (x1 - x0) * k / n + rnd(-0.08, 0.08), 0.04, z0 + (z1 - z0) * k / n + rnd(-0.08, 0.08)); s.castShadow = false; } };
    path(-0.7, 10.0, 4.0, 12.2); path(3.95, 9.8, 4.0, 12.2);
    for (const x of [7.0, 9.2, -5.0]) { rb(1.4, 0.28, 0.4, MT.woodD, yd, x, 0.14, 6.7, 0.04); for (let i = 0; i < 5; i++) add(G('Sphere', 0.12, 8, 6), M([0xff5a8a, 0xffc20e, 0xffffff, 0xe22511, 0x9a72f0][i]), yd, x - 0.5 + i * 0.25, 0.36, 6.7).castShadow = false; }
    for (const [x, z] of [[-5.7, 17.8], [9.8, 17.8]]) { rb(0.14, 2.8, 0.14, MT.navy, yd, x, 1.4, z, 0.04); add(G('Sphere', 0.24, 12, 8), M(0xfff2b0, { emissive: 0xffe08a, emissiveIntensity: 1.1 }), yd, x, 2.9, z).castShadow = false; }
    rb(1.5, 0.12, 0.5, MT.wood, yd, -4.4, 0.45, 17.4, 0.04); rb(1.5, 0.5, 0.1, MT.wood, yd, -4.4, 0.75, 17.62, 0.03); for (const sx of [-0.6, 0.6]) rb(0.1, 0.45, 0.4, MT.dark, yd, -4.4 + sx, 0.22, 17.4, 0.02);
    potTree(yd, -5.6, 7.0, 0.8); potTree(yd, 10.0, 7.0, 0.8); }
  penPile = new Pile(-1.0, 8.2, 'feather', 8, 2, 2, 0.4); penPile.base = 0.46; markZone(penPile, new THREE.Vector3(-0.7, 0, 10.0));
  const penCol = box(-5.4, -1.8, 7.4, 10.6), crCol = box(-1.6, -0.4, 7.7, 8.7);
  // the little machine: makes FLIX bases one by one
  const mini = new THREE.Group(); mini.position.set(2.2, 0, 8.0); scene.add(mini);
  const mb = rb(1.6, 1.3, 1.3, M(0x2a80dc, { roughness: 0.35, map: PANEL }), mini, 0, 0.65, 0, 0.16); rb(1.7, 0.12, 1.4, MT.yel, mini, 0, 1.36, 0, 0.04);
  const hop = add(new THREE.CylinderGeometry(0.45, 0.22, 0.5, 18, 1, true), M(0xd9dee6, { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }), mini, -0.3, 1.66, 0);
  const lamp = add(G('Sphere', 0.13, 12, 8), M(0xff3a22, { emissive: 0xff3a22, emissiveIntensity: 0.3 }), mini, 0.55, 1.5, 0.45); add(G('Cylinder', 0.12, 0.14, 0.7, 12), MT.dark, mini, -0.55, 1.75, -0.4); add(G('Cylinder', 0.17, 0.17, 0.08, 12), MT.red, mini, -0.55, 2.1, -0.4);
  const gear = add(new THREE.TorusGeometry(0.22, 0.07, 8, 6), MT.red, mini, 0.45, 0.85, 0.67); const pis = add(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12), MT.steel, mini, 0.35, 1.7, 0);
  rb(0.6, 0.35, 0.05, M(0x0f1c33, { emissive: 0x2fe06a, emissiveIntensity: 0.6 }), mini, -0.3, 0.75, 0.66, 0.02); rb(0.6, 0.06, 0.5, MT.steel, mini, 1.05, 0.55, 0, 0.02);
  sign('MİNİ MAKİNE', '#0b2a5e', mini, 0, 1.15, 0.67, 1.3); outl(mini);
  const miCol = box(1.3, 3.1, 7.3, 8.7); miniPile = new Pile(3.95, 8.0, 'base', 8, 2, 2, 0.6); markZone(miniPile, new THREE.Vector3(3.95, 0, 9.8));
  ST = { pen, mini, gear, pis, lamp, penCol, crCol, miCol, t: 0, hit: 0 };
  const n = 1 + (has('kumes2') ? 1 : 0) + (has('kumes3') ? 1 : 0); if (!has('ciftlik0')) for (let k = 0; k < n; k++) addTurkey('dogal', true);
}
const penPos = () => new THREE.Vector3(rnd(-4.9, -2.6), 0, rnd(8.1, 9.8));
function retirePen() { if (!penPile) return; scene.remove(ST.pen); scene.remove(penPile.ring); penPile.items.forEach(o => scene.remove(o)); unbox(ST.penCol); unbox(ST.crCol); penPile = null;
  for (const t of turkeys) if (t.pen) { t.pen = false; t.o.position.copy(tkPos()); t.tgt = tkPos(); } }
function retireMini() { if (!miniPile) return; scene.remove(ST.mini); scene.remove(miniPile.ring); miniPile.items.forEach(o => scene.remove(o)); unbox(ST.miCol); miniPile = null; }
let atF = null;
const fenceRun = (par, x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.2)); for (let k = 0; k <= n; k++) { rb(0.16, 0.95, 0.16, MT.fence, par, x0 + (x1 - x0) * k / n, 0.47, z0 + (z1 - z0) * k / n, 0.04); add(G('Sphere', 0.11, 8, 6), MT.red, par, x0 + (x1 - x0) * k / n, 1.0, z0 + (z1 - z0) * k / n); }
  for (const y of [0.42, 0.78]) rb(x0 === x1 ? 0.08 : L, 0.09, z0 === z1 ? 0.08 : L, MT.fence, par, (x0 + x1) / 2, y, (z0 + z1) / 2, 0.03); };
function potTree(par, x, z, s = 1) { add(G('Cylinder', 0.32 * s, 0.24 * s, 0.5 * s, 12), MT.red, par, x, 0.25 * s, z); add(G('Icosahedron', 0.55 * s, 1), M(0x3fa84f, { flatShading: true }), par, x, 0.95 * s, z); }
function lights(par, x0, x1, z, y) { const cols = [0xe22511, 0xffc20e, 0x2a80dc, 0x2fa043]; let i = 0; for (let x = x0; x <= x1; x += 0.7, i++) add(G('Sphere', 0.07, 8, 6), M(cols[i % 4], { emissive: cols[i % 4], emissiveIntensity: 0.9 }), par, x, y + Math.sin(i * 1.3) * 0.04, z).castShadow = false; }
// stage 2: the yard grows north and right, still a fenced open-air workshop
function buildAtolye() { plotObjs.forEach(o => scene.remove(o)); plotObjs.length = 0;
  rb(17.3, 0.3, 24.0, MT.white, null, 2.35, -0.14, 6.75, 0.1); floorPlane(17.0, 23.7, 2.35, 6.75);
  atF = { w: new THREE.Group(), n: new THREE.Group(), e: new THREE.Group() }; for (const k in atF) scene.add(atF[k]);
  fenceRun(atF.w, -6.3, -5.2, -6.3, 18.6); fenceRun(atF.n, -6.3, -5.2, 11, -5.2); fenceRun(atF.e, 11, -5.2, 11, 18.6);
  const st = tex(512, 128, (c, w, h) => { c.fillStyle = '#1b1330'; c.beginPath(); c.roundRect(0, 0, w, h, 26); c.fill(); c.fillStyle = '#e22511'; c.beginPath(); c.roundRect(5, 5, w - 10, h - 10, 22); c.fill(); if (LOGO) c.drawImage(LOGO, 14, 8, 120, 110); c.fillStyle = '#fff'; c.font = 'italic 900 70px BC'; c.lineWidth = 8; c.strokeStyle = '#1b1330'; c.strokeText('ATÖLYE', 150, 90); c.fillText('ATÖLYE', 150, 90); });
  for (const sx of [-1.4, 1.4]) rb(0.14, 2.6, 0.14, MT.woodD, atF.n, 5.5 + sx, 1.3, -5.3, 0.03); add(new THREE.PlaneGeometry(3.2, 0.8), M(0xffffff, { map: st, transparent: true }), atF.n, 5.5, 2.35, -5.25).castShadow = false;
  // tool wall behind the assembly spot, string lights, potted trees
  const tw = rb(2.6, 1.3, 0.08, MT.wood, atF.n, -1.0, 1.2, -5.05, 0.03); for (let i = 0; i < 5; i++) { rb(0.07, 0.55, 0.04, MT.dark, atF.n, -2.0 + i * 0.5, 1.25, -4.98, 0.01); rb(0.24, 0.12, 0.05, [MT.red, MT.yel, MT.navy][i % 3], atF.n, -2.0 + i * 0.5, 1.55, -4.97, 0.02); }
  lights(atF.n, -6.0, 10.7, -5.2, 1.15); potTree(atF.n, -5.6, -4.5); potTree(atF.n, 10.3, -4.5); potTree(atF.e, 10.3, 5.6, 0.8); potTree(atF.w, -5.6, 4.6, 0.8);
  teaser = new THREE.Group(); scene.add(teaser);
  for (let i = 0; i < 6; i++) { const c = add(new THREE.ConeGeometry(0.25, 0.7, 12), M(0xff7a1a, { roughness: 0.5 }), teaser, 13.2, 0.35, -5 + i * 3.2); add(new THREE.CylinderGeometry(0.255, 0.27, 0.12, 12), MT.white, c, 0, 0.0, 0); }
  sign('YAKINDA: YENİ SALON', '#0b2a5e', teaser, 17.5, 1.6, 0.5, 4.4); rb(0.2, 1.6, 0.2, MT.steel, teaser, 16.2, 0.8, 0.4); rb(0.2, 1.6, 0.2, MT.steel, teaser, 18.8, 0.8, 0.4);
}
// stage 3: the left storage wing with the wall and wardrobe
function buildDepo() { if (atF) { scene.remove(atF.w); atF.w = null; }
  rb(4.7, 0.3, 24.0, MT.white, null, -8.65, -0.14, 6.75, 0.1); floorPlane(4.85, 23.7, -8.575, 6.75);
  LW = [rb(0.5, 1.4, 24.0, MT.wall, null, -11, 0.7, 6.75), rb(0.56, 0.18, 24.06, MT.wallTop, null, -11, 1.45, 6.75), box(-11.5, -10.7, -5.4, 18.6)];
  for (let i = 0; i < 4; i++) { const z = 5.0 + i * 1.6; rb(0.7, 0.08, 1.3, MT.woodD, null, -10.35, 0.12, z, 0.02); for (let k = 0; k < 2; k++) rb(0.5, 0.42, 0.5, [MT.wood, MT.yel, MT.red][(i + k) % 3], null, -10.35, 0.38 + k * 0.42, z + (k ? 0.2 : -0.2), 0.05); }
  box(-10.8, -9.9, 4.2, 10.0); sign('DEPO', '#0b2a5e', null, -10.72, 1.05, 7.4, 1.4, Math.PI / 2);
  const wd = new THREE.Group(); wd.position.set(-10.1, 0, 16.4); scene.add(wd); rb(1.0, 2.4, 2.0, MT.purple, wd, 0, 1.2, 0, 0.1); rb(0.06, 2.0, 0.85, M(0x9a72f0), wd, 0.52, 1.2, -0.46, 0.03); rb(0.06, 2.0, 0.85, M(0x9a72f0), wd, 0.52, 1.2, 0.46, 0.03);
  sign('DOLAP', '#7a4fd8', wd, 0.56, 2.6, 0, 1.8, Math.PI / 2); box(-10.7, -9.5, 15.3, 17.5); outl(wd);
  ZONES.dolap = zoneRing(-8.3, 16.4, 0x9a72f0, 'DOLAP');
}
// stage 4: the real factory building: back walls, big sign, farm gate
function buildBina() { if (atF) { if (atF.n) scene.remove(atF.n); if (atF.e) scene.remove(atF.e); if (atF.w) scene.remove(atF.w); atF = null; }
  rb(22, 0.3, 2.3, MT.white, null, 0, -0.14, -6.4, 0.1); floorPlane(21.7, 2.45, 0, -6.3);
  if (LW) { scene.remove(LW[0]); scene.remove(LW[1]); unbox(LW[2]); }
  LW = [rb(0.5, 1.4, 25.5, MT.wall, null, -11, 0.7, 5.25), rb(0.56, 0.18, 25.56, MT.wallTop, null, -11, 1.45, 5.25), box(-11.5, -10.7, -8, 18.6)];
  rb(8.5, 1.4, 0.5, MT.wall, null, -6.75, 0.7, -7.5); rb(8.5, 1.4, 0.5, MT.wall, null, 6.75, 0.7, -7.5); rb(8.56, 0.18, 0.56, MT.wallTop, null, -6.75, 1.45, -7.5); rb(8.56, 0.18, 0.56, MT.wallTop, null, 6.75, 1.45, -7.5);
  box(-11.5, -2.5, -7.8, -7.2); box(2.5, 11.5, -7.8, -7.2);
  const sg = tex(1024, 360, (c, w, h) => { c.fillStyle = '#e22511'; c.beginPath(); c.roundRect(0, 0, w, h, 40); c.fill(); if (LOGO) c.drawImage(LOGO, 30, 20, 360, 320); c.fillStyle = '#fff'; c.font = 'italic 900 150px BC'; c.fillText('FABRİKA', 400, 230); });
  add(new THREE.PlaneGeometry(5.6, 2), M(0xffffff, { map: sg, transparent: true, roughness: 0.5 }), null, -6.75, 2.6, -7.24).castShadow = false;
  rb(0.15, 1.6, 0.15, MT.steel, null, -8.6, 1.4, -7.3); rb(0.15, 1.6, 0.15, MT.steel, null, -4.9, 1.4, -7.3);
  lights(null, 3.0, 10.6, -7.2, 1.7);
  if (!farmPile) { farmGate = new THREE.Group(); scene.add(farmGate); for (let x = -2.3; x <= 2.31; x += 0.46) rb(0.1, 1.2, 0.1, MT.woodD, farmGate, x, 0.6, -7.5, 0.03); rb(4.8, 0.12, 0.12, MT.wood, farmGate, 0, 0.95, -7.5, 0.03); sign('ÇİFTLİK YAKINDA', '#2fa043', farmGate, 0, 1.55, -7.42, 2.6); }
}
function buildFarm() { if (farmGate) { scene.remove(farmGate); farmGate = null; }
  add(new THREE.PlaneGeometry(22, 12), MT.grass, null, 0, 0.0, -14).rotation.x = -Math.PI / 2;
  backFence = new THREE.Group(); scene.add(backFence);
  for (let x = -10.5; x <= 10.5; x += 1.5) rb(0.14, 1.0, 0.14, MT.fence, backFence, x, 0.5, -20);
  farmRight = new THREE.Group(); scene.add(farmRight); farmLeft = new THREE.Group(); scene.add(farmLeft);
  for (let z = -20; z <= -8.5; z += 1.5) { rb(0.14, 1.0, 0.14, MT.fence, farmLeft, -10.6, 0.5, z); rb(0.14, 1.0, 0.14, MT.fence, farmRight, 10.6, 0.5, z); }
  rb(21.2, 0.1, 0.1, MT.fence, backFence, 0, 0.8, -20); rb(21.2, 0.1, 0.1, MT.fence, backFence, 0, 0.45, -20);
  rb(0.1, 0.1, 11.5, MT.fence, farmLeft, -10.6, 0.8, -14.25); rb(0.1, 0.1, 11.5, MT.fence, farmRight, 10.6, 0.8, -14.25);
  backFence.userData.col = box(-11.5, 11.5, -21, -19.6);
  const barn = new THREE.Group(); barn.position.set(6.5, 0, -17.5); scene.add(barn);
  rb(5, 3, 3.6, M(0xc8402e, { roughness: 0.7 }), barn, 0, 1.5, 0); const roof = add(new THREE.CylinderGeometry(2.0, 2.0, 5.2, 4, 1), M(0x5a3a2a, { roughness: 0.7 }), barn, 0, 3.0, 0); roof.rotation.set(0, 0, Math.PI / 2); roof.rotation.order = 'ZXY'; roof.rotation.x = Math.PI / 4; roof.scale.set(1, 1, 0.9);
  rb(1.8, 2.0, 0.1, MT.fence, barn, 0, 1.0, 1.82); add(new THREE.PlaneGeometry(1.5, 1.7), M(0x5a2a1e), barn, 0, 0.95, 1.88);
  box(3.8, 9.2, -19.6, -15.5);
  for (const [x, z] of [[-8, -18.5], [-6.8, -18.6], [-7.4, -18.4]]) { const h = add(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 18), M(0xe8c66a, { roughness: 1 }), null, x, 0.6, z); h.rotation.z = Math.PI / 2; }
  rb(3, 0.5, 0.8, MT.woodD, null, -2, 0.25, -18.8);
  rb(2.4, 0.5, 2.0, MT.wood, null, -4.0, 0.25, -10.4); box(-5.4, -2.6, -11.6, -9.2);
  farmPile = new Pile(-4.0, -10.4, 'feather', 16, 2, 2, 0.75); farmPile.base = 0.55; markZone(farmPile, new THREE.Vector3(-1.6, 0, -9.2));
  if (has('ik')) retirePen(); for (let i = 0; i < 4; i++) addTurkey('dogal');
}
function buildPress() { retireMini();
  const press = new THREE.Group(); press.position.set(-8.4, 0, -3.5); scene.add(press);
  press.userData.body = rb(2.4, 2.6, 2.2, M(0x2a80dc, { roughness: 0.35 }), press, 0, 1.3, 0, 0.18); rb(1.8, 0.35, 1.6, MT.steel, press, 0, 2.8, 0, 0.08);
  press.userData.pis = add(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16), MT.steel, press, 0, 3.5, 0);
  rb(1.2, 0.6, 0.06, M(0x0f1c33, { emissive: 0x2fe06a, emissiveIntensity: 0.5 }), press, 0, 1.6, 1.12, 0.03);
  press.userData.stars = starRow(press, 0, 2.15, 1.13);
  box(-9.8, -7.0, -4.8, -2.2); pressPile = new Pile(-6.2, -3.5, 'base', 12, 2, 2, 0.8); markZone(pressPile);
  outl(press); stationsAnim.press = press;
}
// silos, chimneys with smoke, water tower and the two big billboards for the other FLIX games
const smoke = []; const smokeGeo = new THREE.IcosahedronGeometry(0.6, 1), smokeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.7, depthWrite: false });
let chimneys = [];
function buildOutside() {
  const sm = M(0xdfe5ee, { metalness: 0.5, roughness: 0.35 }), band = M(0xffffff, { map: tex(512, 64, (c, w, h) => { c.fillStyle = '#e22511'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'italic 900 48px BC'; for (let x = 10; x < w; x += 128) c.fillText('FLIX', x, 50); }) });
  for (const [x, z] of [[-29.5, -2], [-29.5, 2.4], [-29.5, 6.8]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); add(new THREE.CylinderGeometry(1.6, 1.6, 7, 24), sm, g, 0, 3.5, 0); add(new THREE.ConeGeometry(1.7, 1.2, 24), M(0xe22511, { roughness: 0.5 }), g, 0, 7.6, 0); add(new THREE.CylinderGeometry(1.62, 1.62, 0.9, 24, 1, true), band, g, 0, 4.6, 0); for (const sx of [-1.1, 1.1]) rb(0.15, 1.2, 0.15, MT.dark, g, sx, 0.6, 1.1, 0.03); outl(g); }
  for (const [x, z] of [[29.5, -6], [29.5, 0.5]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); add(new THREE.CylinderGeometry(0.75, 1.0, 9, 18), M(0xb8432e, { roughness: 0.8, map: tex(64, 128, (c, w, h) => { c.fillStyle = '#b8432e'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let y = 0; y < h; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let xx = (y / 8 % 2) * 8; xx < w; xx += 16) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + 8); c.stroke(); } } }) }), g, 0, 4.5, 0); for (const y of [7.6, 8.4]) add(new THREE.CylinderGeometry(0.82, 0.82, 0.3, 18), MT.wallTop, g, 0, y, 0); outl(g); chimneys.push(new THREE.Vector3(x, 9.2, z)); }
  const wt = new THREE.Group(); wt.position.set(-29, 0, 15); scene.add(wt); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rb(0.18, 6, 0.18, MT.navy, wt, x, 3, z, 0.04); add(new THREE.CylinderGeometry(1.8, 1.8, 2.4, 22), MT.yel, wt, 0, 7.2, 0); add(new THREE.ConeGeometry(1.95, 1.0, 22), MT.navy, wt, 0, 8.9, 0); sign('FLIX', '#e22511', wt, 0, 7.2, 1.82, 2.4); outl(wt);
  // billboards for Flix Rush and Flix Kick Up across the road
  PROMO.forEach((pr, i) => { const g = new THREE.Group(); g.position.set(i ? 15 : -9, 0, 26.9); scene.add(g); for (const sx of [-2.2, 2.2]) rb(0.22, 2.6, 0.22, MT.steel, g, sx, 1.3, -0.1, 0.05);
    const img = new Image(); img.src = window['AD_' + pr.id.toUpperCase()] || ''; const draw = () => tex(1024, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); if (pr.id === 'rush') { gr.addColorStop(0, '#2a0a6a'); gr.addColorStop(1, '#ff2d9a'); } else { gr.addColorStop(0, '#ff3a22'); gr.addColorStop(1, '#7a0d05'); } c.fillStyle = '#1b1330'; c.fillRect(0, 0, w, h); c.fillStyle = gr; c.fillRect(12, 12, w - 24, h - 24);
      if (img.complete && img.naturalWidth) { c.save(); c.beginPath(); c.roundRect(50, 86, 340, 340, 70); c.clip(); c.drawImage(img, 50, 86, 340, 340); c.restore(); }
      c.fillStyle = '#fff'; c.font = 'italic 900 118px BC'; c.lineWidth = 14; c.strokeStyle = '#1b1330'; c.lineJoin = 'round'; c.strokeText(pr.name, 430, 220); c.fillText(pr.name, 430, 220); c.font = '700 40px R'; c.fillText(pr.txt, 432, 300); c.fillStyle = '#ffc20e'; c.beginPath(); c.roundRect(430, 340, 360, 84, 24); c.fill(); c.fillStyle = '#1b1330'; c.font = 'italic 900 52px BC'; c.fillText(pr.id === 'rush' ? 'APP STORE’DA' : 'HEMEN OYNA', 452, 400); });
    const mat = M(0xffffff, { map: draw(), roughness: 0.6 }); img.onload = () => { mat.map = draw(); mat.needsUpdate = true; };
    const bd = add(new THREE.PlaneGeometry(6.4, 3.2), mat, g, 0, 3.6, 0); bd.castShadow = false; rb(6.6, 3.4, 0.2, MT.dark, g, 0, 3.6, -0.13, 0.05); });
}
function stepSmoke(dt) { if (Math.random() < dt * 2.5) for (const c of chimneys) { const m = new THREE.Mesh(smokeGeo, smokeMat.clone()); m.position.copy(c); m.castShadow = false; scene.add(m); smoke.push({ m, t: 0 }); }
  for (let i = smoke.length - 1; i >= 0; i--) { const q = smoke[i]; q.t += dt; q.m.position.y += dt * 1.4; q.m.position.x -= dt * 0.6; q.m.scale.setScalar(1 + q.t * 0.9); q.m.material.opacity = 0.7 * (1 - q.t / 4); if (q.t > 4) { scene.remove(q.m); q.m.material.dispose(); smoke.splice(i, 1); } } }
// level stars on machines (filled by applyTiers)
function starRow(par, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g; }
const STAR = { geo: (() => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.05 : 0.12, a = i / 10 * Math.PI * 2 + Math.PI / 2; s.lineTo(Math.cos(a) * r, Math.sin(a) * r); } return new THREE.ShapeGeometry(s); })(), on: new THREE.MeshBasicMaterial({ color: 0xffc20e }), off: new THREE.MeshBasicMaterial({ color: 0x5a6478 }) };
function setStars(g, n, max = 5) { g.clear(); for (let i = 0; i < max; i++) { const m = new THREE.Mesh(STAR.geo, i < n ? STAR.on : STAR.off); m.position.x = (i - (max - 1) / 2) * 0.27; g.add(m); } }
const TIER = (l) => l >= 6 ? { c: 0xffc83a, metal: 0.75, r: 0.25 } : l >= 3 ? { c: 0xc8d2e0, metal: 0.7, r: 0.25 } : null;
// görsel kademeler: geliştirme seviyesi makinelerde görünür (yıldız, gümüş 3+, altın 6+, ikinci robot kol)
export function applyTiers() {
  if (stationsAnim.press) { const pr = stationsAnim.press.userData, tp = TIER(lv('pres')); pr.body.material.color.set(tp ? tp.c : 0x2a80dc); pr.body.material.metalness = tp ? tp.metal : 0; setStars(pr.stars, Math.min(5, Math.ceil(lv('pres') * 5 / 8))); }
  const tm = TIER(lv('mont')); for (const A of asm) { A.top.material = tm ? M(tm.c, { metalness: tm.metal, roughness: tm.r }) : MT.yel; A.arm2.visible = lv('mont') >= 4; setStars(A.stars, Math.min(5, Math.ceil(lv('mont') * 5 / 8))); }
  if (TS) { const tt = TIER(lv('test')); TS.body.material.color.set(tt ? tt.c : 0x2fa043); TS.body.material.metalness = tt ? tt.metal : 0; setStars(TS.stars, Math.min(5, lv('test'))); }
  if (TR) setStars(TR.stars, lv('truck'));
  setBounds();
}
function setBounds() { BOUNDS.x0 = has('bblok') ? -24.5 : has('depo') ? -11 : -6.3; BOUNDS.x1 = has('genis') ? 25.5 : has('bina') ? 12.6 : has('atolye') ? 10.7 : 10.3; BOUNDS.z0 = has('ciftlik0') ? farmZ() - 1 : has('bina') ? -7.3 : has('atolye') ? -4.9 : 6.6; NAV.dirty = true; }
function zoneRing(x, z, col, txt) { const r = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.045, z); scene.add(r); floorText(txt, x, z);
  return { pos: new THREE.Vector3(x, 0, z), r: 1.2, ring: r }; }
function markZone(pile, at, col = 0xffffff) { const p = at || pile.pos; const r = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.45, 48), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.34, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(p.x, 0.04, p.z); scene.add(r); pile.zone = at ? at.clone() : pile.pos.clone(); pile.ring = r; ZR.push({ r, p: pile }); return r; }
function inRing(x, z, txt1, txt2) { const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.2, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.34, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.04, z); scene.add(ring);
  const lbl = tex(256, 96, (c, w) => { c.fillStyle = '#fff'; c.font = 'bold 30px R, sans-serif'; c.textAlign = 'center'; c.fillText(txt1, w / 2, 40); c.fillText(txt2, w / 2, 76); });
  const lm = add(new THREE.PlaneGeometry(1.4, 0.52), new THREE.MeshBasicMaterial({ map: lbl, transparent: true, depthWrite: false }), null, x, 0.05, z + 1.6); lm.rotation.x = -Math.PI / 2; lm.castShadow = false; }
function buildAssembly(i, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const top = rb(3.4, 1.0, 2.0, MT.yel, g, 0, 0.5, 0, 0.14); rb(3.6, 0.12, 2.2, MT.top, g, 0, 1.06, 0, 0.05);
  const mkArm = (ax) => { const arm = new THREE.Group(); arm.position.set(ax, 1.12, -0.6); g.add(arm); add(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 18), MT.dark, arm); const a1 = new THREE.Group(); a1.position.y = 0.1; arm.add(a1);
    rb(0.16, 0.9, 0.16, MT.red, a1, 0, 0.45, 0, 0.06); const a2 = new THREE.Group(); a2.position.y = 0.9; a1.add(a2); rb(0.14, 0.7, 0.14, MT.red, a2, 0, 0.35, 0, 0.05); a1.rotation.x = 0.5; a2.rotation.x = 1.3; return { arm, a1, a2 }; };
  const A1 = mkArm(-0.5), A2 = mkArm(0.9);
  sign('MONTAJ ' + (i + 1), '#0b2a5e', g, 0, 0.55, 1.01); const stars = starRow(g, 0, 0.22, 1.02);
  box(x - 1.8, x + 1.8, z - 1.1, z + 1.1);
  inRing(x - 2.6, z, 'tüy + taban', 'bırak');
  const out = new Pile(x + 2.6, z, 'toy', 8, 2, 2, 0.95); markZone(out);
  const A = { g, top, arm: A1.a1, a2: A1.a2, arm2: A2.arm, arm2a: A2.a1, inF: [], inB: 0, out, inZone: new THREE.Vector3(x - 2.6, 0, z), t: 0, x, z, bufObjs: [], stars };
  outl(g); asm.push(A); return A;
}
// ---- test playground: three kids kick-test FLIX at the same time before they can be sold ----
const KIDX = [-1.15, 0, 1.15];
function buildTest() {
  const g = new THREE.Group(); g.position.set(8.6, 0, 0.8); scene.add(g);
  const rub = tex(256, 128, (c, w, h) => { const cols = ['#ff6a4a', '#ffc20e', '#2fb8e0', '#5fd06a']; for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { c.fillStyle = cols[(i + j * 3) % 4]; c.fillRect(i * 32, j * 32, 32, 32); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(i * 32 + 2, j * 32 + 2, 28, 4); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(i * 32, j * 32 + 29, 32, 3); } noise(c, w, h, 0.05, 2000); });
  const floor = rb(3.8, 0.14, 2.2, M(0xffffff, { roughness: 0.95, map: rub }), g, 0, 0.07, 0.15, 0.06);
  // low colourful fence around the park, open at the front
  const fc = [MT.red, MT.yel, M(0x2fb8e0, { roughness: 0.5 }), MT.green]; let k = 0;
  for (let x = -1.85; x <= 1.86; x += 0.46) rb(0.1, 0.55, 0.1, fc[k++ % 4], g, x, 0.3, -0.92, 0.04);
  for (const sd of [-1, 1]) for (let z = -0.92; z <= 1.1; z += 0.5) rb(0.1, 0.55, 0.1, fc[k++ % 4], g, sd * 1.88, 0.3, z, 0.04);
  rb(3.8, 0.08, 0.08, MT.white, g, 0, 0.55, -0.92, 0.03); for (const sd of [-1, 1]) rb(0.08, 0.08, 2.0, MT.white, g, sd * 1.88, 0.55, 0.09, 0.03);
  // little slide + swing frame at the back so it reads as a playground
  const sl = new THREE.Group(); sl.position.set(-2.2, 0, -0.55); g.add(sl); rb(0.5, 1.1, 0.5, MT.red, sl, 0, 0.55, 0, 0.08); const ch = rb(0.46, 0.06, 1.3, MT.yel, sl, 0, 0.62, 0.72, 0.03); ch.rotation.x = 0.62;
  for (const sd of [-1, 1]) { const p = add(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8), MT.navy, g, 2.25, 0.9, -0.55 + sd * 0.45); p.rotation.x = sd * 0.25; }
  rb(0.1, 0.1, 1.2, MT.navy, g, 2.25, 1.82, -0.55, 0.03); const sw = rb(0.36, 0.05, 0.22, MT.red, g, 2.25, 0.55, -0.55, 0.02);
  // big sign board behind the kids
  const body = rb(3.6, 0.95, 0.12, M(0x2fa043, { roughness: 0.55, map: PANEL }), g, 0, 1.55, -1.05, 0.05);
  for (const sd of [-1, 1]) rb(0.12, 2.0, 0.12, MT.steel, g, sd * 1.7, 1.0, -1.08, 0.04);
  const bt = tex(512, 128, (c, w, h) => { c.fillStyle = '#fff'; c.font = 'italic 900 64px BC'; c.textAlign = 'center'; c.lineWidth = 10; c.strokeStyle = '#0b2a5e'; c.strokeText('OYUN PARKI', w / 2, 60); c.fillText('OYUN PARKI', w / 2, 60); c.font = 'italic 900 40px BC'; c.fillStyle = '#ffc20e'; c.strokeText('KICK TEST', w / 2, 110); c.fillText('KICK TEST', w / 2, 110); });
  add(new THREE.PlaneGeometry(2.6, 0.65), M(0xffffff, { map: bt, transparent: true }), g, -0.2, 1.62, -0.98).castShadow = false;
  const lamp = add(new THREE.SphereGeometry(0.16, 16, 10), M(0x2fe06a, { emissive: 0x2fe06a, emissiveIntensity: 1 }), g, 1.45, 2.15, -1.05);
  const stars = starRow(g, 0, 1.18, -0.98);
  // queue table on the left
  rb(0.6, 0.85, 1.5, MT.steel, g, -2.05, 0.43, 1.05, 0.08); rb(0.64, 0.06, 1.54, MT.top, g, -2.05, 0.88, 1.05, 0.03);
  const kids = KIDX.map((x, i) => { const kid = personMesh(true); kid.position.set(x, 0.14, -0.35); g.add(kid); kid.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { kid, x: 8.6 + x, cur: null, k: 0, n: 0, fail: false, t: i * 0.1, base: new THREE.Vector3(8.6 + x + 0.05, 0.45, 1.2) }; });
  box(6.3, 11.0, -0.4, 1.35); box(6.25, 6.85, 1.05, 2.55);
  inRing(5.4, 0.8, 'test için', 'bırak');
  const out = new Pile(7.6, 3.1, 'toy', 16, 2, 1, 1.0); markZone(out);
  REJ = new Pile(10.2, 3.1, 'reject', 8, 1, 2, 1.0); markZone(REJ, null, 0xff6a5a); floorText('HATALI', 10.2, 4.6, 1.2);
  outl(g); TS = { g, body, lamp, stars, kids, swing: sw, q: [], t: 0, inZone: new THREE.Vector3(5.4, 0, 0.8), out, qObjs: [] };
}
const testBusy = () => TS.kids.some(k => k.cur);
function syncTestQ() { TS.qObjs.forEach(o => scene.remove(o)); TS.qObjs = []; TS.q.slice(0, 4).forEach((o, k) => { const c = o.clone(); c.position.set(6.55, 0.92, 2.35 - k * 0.4); c.scale.setScalar(0.45); scene.add(c); TS.qObjs.push(c); }); }
const kickN = () => KICKN(lv('test')), kickDur = () => 0.55 * Math.pow(0.9, lv('test')) / (1 + Math.min(TS.q.length, 12) / 12) * (bonusOn('uret') ? 0.6 : 1);
function stepTest(dt, T) {
  if (TS.swing) TS.swing.position.z = -0.55 + Math.sin(T * 2.2) * 0.25;
  for (const S of TS.kids) { const K = S.kid.userData, base = S.base; K.cheer = Math.max(0, (K.cheer || 0) - dt);
    if (S.cur) { const o = S.cur; S.k += dt / kickDur(); if (S.k >= 1) { S.k = 0; S.n++; SFX.pop(); if (S.n >= kickN()) finishTest(S, o); }
      if (S.cur) { const e = S.k; o.position.set(base.x, base.y + Math.sin(e * Math.PI) * 2.0, base.z); o.rotation.y += dt * 7; o.rotation.z = Math.sin(e * Math.PI * 2) * 0.3;
        const kick = Math.max(0, 1 - Math.min(e, 1 - e) * 7); K.legs[1].rotation.x = -kick * 1.1; K.legs[0].rotation.x = kick * 0.2; K.head.rotation.x = -Math.sin(e * Math.PI) * 0.45; K.arms[0].rotation.z = -0.5; K.arms[1].rotation.z = 0.5; } }
    else { K.legs[1].rotation.x *= 0.85; K.head.rotation.x *= 0.9; const ch = K.cheer > 0 ? Math.sin(K.cheer * 20) * 0.3 + 2.6 : 0; K.arms[0].rotation.z = -0.15 - ch * 0.9; K.arms[1].rotation.z = 0.15 + ch * 0.9; S.kid.position.y = 0.14 + (K.cheer > 0 ? Math.abs(Math.sin(K.cheer * 12)) * 0.15 : 0); }
    if (S.cur) continue; S.t -= dt; if (S.t > 0 || !TS.q.length || TS.out.full()) continue;
    const o = TS.q.shift(); syncTestQ(); S.cur = o; scene.add(o); o.scale.setScalar(0.8); fly(o, new THREE.Vector3(6.55, 1.0, 1.8), base, 0.25); S.k = 0; S.n = 0; S.fail = Math.random() < Math.max(0.01, 0.10 - lv('test') * 0.01);
    SFX.stamp(); TS.lamp.material.color.set(0xffc20e); TS.lamp.material.emissive.set(0xffc20e); }
}
function finishTest(S, o) { S.cur = null; S.t = 0.15; o.rotation.set(0, 0, 0); o.scale.setScalar(1); const pp = new THREE.Vector3(S.x, 3.0, 0.8);
  if (S.fail) { popSprite('bad', pp); if (REJ.full()) scene.remove(o); else { markReject(o); REJ.push(o, o.position); } SFX.nope && SFX.nope(); TS.lamp.material.color.set(0xe22511); TS.lamp.material.emissive.set(0xe22511); }
  else { popSprite('ok', pp); markTested(o); TS.out.push(o, o.position); SFX.chime && SFX.chime(2); TS.lamp.material.color.set(0x2fe06a); TS.lamp.material.emissive.set(0x2fe06a); S.kid.userData.cheer = 0.45; } }
// ---- office: a real room (glass walls, door, desk, trophy shelf, stats screen). Upgrades never end here. ----
let OF = null;
function buildOffice() { const g = new THREE.Group(); g.position.set(8.4, 0, -5.45); scene.add(g);
  const carpet = tex(256, 256, (c, w, h) => { c.fillStyle = '#16346e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffc20e'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; for (let i = 30; i < w - 20; i += 20) { c.beginPath(); c.moveTo(i, 24); c.lineTo(i, h - 24); c.stroke(); } noise(c, w, h, 0.06, 3000); });
  const cp = add(new THREE.PlaneGeometry(4.9, 3.5), M(0xffffff, { map: carpet, roughness: 1 }), g, 0, 0.035, 0.1); cp.rotation.x = -Math.PI / 2; cp.castShadow = false;
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfefff, roughness: 0.05, transparent: true, opacity: 0.28, depthWrite: false });
  const wall = (x, z, w, d) => { rb(w, 0.45, d, MT.navy, g, x, 0.22, z, 0.04); const gl = add(new THREE.BoxGeometry(Math.max(0.04, w - 0.1), 0.8, Math.max(0.04, d - 0.1)), glass, g, x, 0.85, z); gl.castShadow = false; rb(w, 0.08, d + 0.02, MT.wallTop, g, x, 1.28, z, 0.03); };
  wall(-2.45, 0.1, 0.16, 3.6); wall(2.45, 0.1, 0.16, 3.6); wall(-1.6, 1.85, 1.8, 0.16); wall(1.6, 1.85, 1.8, 0.16);
  const door = new THREE.Group(); door.position.set(-0.7, 0, 1.85); g.add(door); const dl = add(new THREE.BoxGeometry(0.06, 1.05, 1.36), glass, door, 0, 0.6, 0.68); dl.castShadow = false; rb(0.08, 1.1, 0.08, MT.wallTop, door, 0, 0.6, 1.36, 0.03); door.rotation.y = Math.PI / 2;
  // desk + monitor + chair
  rb(2.4, 0.08, 1.0, MT.wood, g, 0, 0.82, -0.95, 0.03); for (const sx of [-1.05, 1.05]) rb(0.1, 0.78, 0.9, MT.woodD, g, sx, 0.4, -0.95, 0.03);
  rb(1.0, 0.62, 0.06, MT.dark, g, 0, 1.25, -1.25, 0.03);
  const scr = tex(256, 160, (c, w, h) => { c.fillStyle = '#0f2a5a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2fe06a'; c.lineWidth = 6; c.beginPath(); c.moveTo(14, 130); for (let i = 0; i < 8; i++) c.lineTo(14 + i * 32, 130 - i * 12 - (i % 2) * 10); c.stroke(); c.fillStyle = '#ffc20e'; c.font = 'italic 900 34px BC'; c.fillText('GELİR ↑', 14, 40); });
  add(new THREE.PlaneGeometry(0.92, 0.54), M(0xffffff, { map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 0.6 }), g, 0, 1.25, -1.215).castShadow = false;
  const chair = new THREE.Group(); chair.position.set(0, 0, -0.2); g.add(chair); rb(0.6, 0.12, 0.6, MT.red, chair, 0, 0.5, 0, 0.05); rb(0.6, 0.7, 0.1, MT.red, chair, 0, 0.9, 0.28, 0.05); add(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8), MT.steel, chair, 0, 0.25, 0);
  // trophy shelf: one cup appears for every 6 upgrade levels you buy (up to 12)
  const sh = new THREE.Group(); sh.position.set(2.05, 0, -0.8); g.add(sh); rb(0.4, 1.9, 1.5, MT.woodD, sh, 0, 0.95, 0, 0.04); for (const y of [0.55, 1.05, 1.55]) rb(0.42, 0.05, 1.5, MT.wood, sh, -0.02, y, 0, 0.02);
  const cups = new THREE.Group(); sh.add(cups);
  // plant + wall clock + framed FLIX
  add(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 12), MT.red, g, -2.0, 0.18, -1.25); add(new THREE.IcosahedronGeometry(0.36, 1), M(0x3fa84f, { flatShading: true }), g, -2.0, 0.65, -1.25);
  const fr = tex(128, 160, (c, w, h) => { c.fillStyle = '#ffc20e'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(10, 10, w - 20, h - 20); if (LOGO) c.drawImage(LOGO, 18, 30, 92, 82); c.fillStyle = '#0b2a5e'; c.font = 'italic 900 22px BC'; c.textAlign = 'center'; c.fillText('PATRON', w / 2, 140); });
  add(new THREE.PlaneGeometry(0.8, 1.0), M(0xffffff, { map: fr }), g, -1.2, 1.9, -1.68).castShadow = false;
  sign('OFİS', '#0b2a5e', g, 0, 2.15, -1.6, 1.6);
  box(5.85, 6.15, -7.4, -3.45); box(10.65, 10.95, -7.4, -3.45); box(5.85, 7.6, -3.75, -3.45); box(9.2, 10.95, -3.75, -3.45); box(7.1, 9.7, -6.95, -5.95); box(10.2, 10.65, -7.0, -5.5);
  ZONES.ofis = zoneRing(8.4, -4.75, 0x2a80dc, 'GELİŞTİR'); OF = { g, cups, door }; syncOffice(); }
const upTotal = () => Object.values(SV.up).reduce((a, b) => a + (b || 0), 0);
export function syncOffice() { if (!OF) return; const n = Math.min(12, Math.floor(upTotal() / 6)); if (OF.cups.children.length === n) return; OF.cups.clear();
  const cm = [M(0xcd7f32, { metalness: 0.8, roughness: 0.3 }), M(0xd9dee6, { metalness: 0.85, roughness: 0.25 }), M(0xffcf3a, { metalness: 0.9, roughness: 0.2 })];
  for (let i = 0; i < n; i++) { const c = new THREE.Group(); const sh = Math.floor(i / 4); c.position.set(-0.05, [0.6, 1.1, 1.6][sh], -0.52 + (i % 4) * 0.35); OF.cups.add(c); const m = cm[Math.min(2, sh)];
    add(new THREE.CylinderGeometry(0.11, 0.06, 0.18, 12), m, c, 0, 0.17, 0); add(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), m, c, 0, 0.04, 0); rb(0.16, 0.03, 0.16, MT.dark, c, 0, 0.0, 0, 0.01); } }
function buildHR() { const g = new THREE.Group(); g.position.set(-10.1, 0, 1.5); scene.add(g);
  rb(1.0, 0.9, 2.6, MT.wood, g, 0, 0.45, 0, 0.08); rb(0.06, 0.5, 0.8, MT.dark, g, 0.2, 1.2, 0, 0.02); sign('İŞE ALIM', '#2fa043', g, 0.52, 1.9, 0, 1.9, Math.PI / 2);
  box(-10.7, -9.5, 0.1, 2.9); ZONES.ik = zoneRing(-8.2, 1.5, 0x2fa043, 'ELEMAN'); }
// ---- new hall (expansion to the right) ----
function buildHall() {
  scene.remove(teaser); farmRight.visible = false;
  rb(14.4, 0.3, 25.5, MT.white, null, 18.0, -0.14, 5.25, 0.1); floorPlane(14.2, 25.1, 18.0, 5.25);
  rb(0.5, 1.4, 25.5, MT.wall, null, 25.0, 0.7, 5.25); rb(0.56, 0.18, 25.56, MT.wallTop, null, 25.0, 1.45, 5.25);
  rb(14.0, 1.4, 0.5, MT.wall, null, 18.0, 0.7, -7.5); rb(14.06, 0.18, 0.56, MT.wallTop, null, 18.0, 1.45, -7.5);
  box(24.7, 25.6, -8, 18.6); box(10.9, 25.6, -7.8, -7.2);
  // farm grows to the right too
  add(new THREE.PlaneGeometry(14.5, 12), MT.grass, null, 18.0, 0.005, -14).rotation.x = -Math.PI / 2;
  buildHallFence();
  const sg = tex(1024, 256, (c, w, h) => { c.fillStyle = '#0b2a5e'; c.beginPath(); c.roundRect(0, 0, w, h, 40); c.fill(); c.fillStyle = '#ffc20e'; c.font = 'italic 900 140px BC'; c.textAlign = 'center'; c.fillText('YENİ SALON', w / 2, 180); });
  add(new THREE.PlaneGeometry(5, 1.25), M(0xffffff, { map: sg, transparent: true }), null, 18.0, 2.3, -7.24).castShadow = false;
  BOUNDS.x1 = 25.5; NAV.dirty = true;
}
function buildHallFence() {
  const FZ = farmZ(); hallFence = new THREE.Group(); scene.add(hallFence);
  for (let x = 12; x <= 25; x += 1.5) rb(0.14, 1.0, 0.14, MT.fence, hallFence, x, 0.5, FZ);
  for (let z = FZ; z <= -8.5; z += 1.5) rb(0.14, 1.0, 0.14, MT.fence, hallFence, 25.1, 0.5, z);
  rb(14.4, 0.1, 0.1, MT.fence, hallFence, 18.0, 0.8, FZ); rb(0.1, 0.1, -8.5 - FZ, MT.fence, hallFence, 25.1, 0.8, (FZ - 8.5) / 2);
  hallFence.userData.col = box(11.5, 25.6, FZ - 1, FZ + 0.4); if (has('ciftlik')) add(new THREE.PlaneGeometry(14.5, 7.5), MT.grass, null, 18.0, 0.004, -23.5).rotation.x = -Math.PI / 2;
}
function buildTruck() {
  const dock = new THREE.Group(); dock.position.set(22.6, 0, 16.8); scene.add(dock); rb(3.6, 0.3, 2.2, MT.steel, dock, 0, 0.15, 0.4, 0.05);
  for (let i = 0; i < 6; i++) { const s = rb(0.5, 0.06, 0.25, i % 2 ? MT.yel : MT.dark, dock, -1.5 + i * 0.6, 0.31, 1.4, 0.02); s.castShadow = false; }
  sign('OYUNCAKÇILARA SEVKİYAT', '#e22511', null, 22.6, 0.05, 15.0, 3.4).rotation.set(-Math.PI / 2, 0, 0);
  const g = new THREE.Group(); scene.add(g);
  const cont = rb(4.4, 2.3, 2.1, M(0xffffff, { roughness: 0.5 }), g, -0.6, 1.75, 0, 0.12);
  const side = tex(512, 256, (c, w, h) => { c.fillStyle = '#e22511'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffc20e'; c.fillRect(0, h - 40, w, 40); if (LOGO) c.drawImage(LOGO, 30, 20, 200, 180); c.fillStyle = '#fff'; c.font = 'italic 900 70px BC'; c.fillText('OYUNCAK', 250, 110); c.fillText('SEVKİYAT', 250, 180); });
  for (const s of [-1, 1]) add(new THREE.PlaneGeometry(4.2, 2.1), M(0xffffff, { map: side }), g, -0.6, 1.75, s * 1.06).rotation.y = s > 0 ? 0 : Math.PI;
  rb(1.6, 1.7, 2.0, MT.navy, g, 2.4, 1.35, 0, 0.2); rb(0.08, 0.7, 1.7, M(0x9fd6f0, { roughness: 0.05, metalness: 0.3 }), g, 3.2, 1.75, 0, 0.03);
  const wheels = []; for (const x of [-2.2, -0.6, 2.4]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16), MT.dark, g, x, 0.42, s * 1.0); w.rotation.x = Math.PI / 2; wheels.push(w); }
  g.rotation.y = Math.PI; g.position.set(22.6, 0, 22.0);
  outl(g); outl(dock); const stars = starRow(g, -0.6, 0.6, -1.09); stars.rotation.y = Math.PI;
  const bub = document.createElement('div'); bub.className = 'bub truck'; document.body.appendChild(bub);
  const cash = new Pile(24.3, 14.6, 'cash', 80, 2, 2, 0.7);
  TR = { g, wheels, cont, load: [], state: 'dock', t: 0, idle: 0, zone: new THREE.Vector3(22.6, 0, 16.6), bub, cash, stars, x: 22.6 };
  ZONES.truck = null;
}
const truckCap = () => 10 + lv('truck') * 4;
function loadTruck(o) { ctSold(o); const w = o.getWorldPosition(new THREE.Vector3()); scene.add(o); o.position.copy(w); fly(o, w, new THREE.Vector3(TR.g.position.x, 1.6, 22.0), 0.35, () => scene.remove(o)); TR.load.push(o.userData.v || 5); TR.idle = 0; SFX.drop(); }
function stepTruck(dt) {
  if (!TR) return; const T = TR; const cap = truckCap();
  if (T.state === 'dock') { T.idle += dt; if (T.load.length >= cap || (T.load.length >= 4 && T.idle > 40)) { T.state = 'go'; T.v = 0; SFX.truck(); toast('Kamyon oyuncakçılara yola çıktı!'); } }
  else if (T.state === 'go') { T.v = Math.min(14, T.v + dt * 6); T.x += T.v * dt; if (T.x > 48) { T.state = 'away'; T.t = 30 * Math.pow(0.85, lv('truck')); } }
  else if (T.state === 'away') { T.t -= dt; if (T.t <= 0) { T.state = 'back'; T.x = 48; } }
  else if (T.state === 'back') { T.x = Math.max(22.6, T.x - dt * 12); if (T.x <= 22.6) { T.state = 'dock'; T.idle = 0; const v = T.load.reduce((a, b) => a + b, 0) * PROD.truckMult * profitMult(); T.load = []; payCash(v, T.cash, new THREE.Vector3(22.6, 2, 19)); SFX.truck(); toast('Kamyon döndü: ₺' + fmt(v) + ' kazandın!'); confetti(new THREE.Vector3(22.6, 2, 18)); } }
  T.g.position.x = T.x; const sp = T.state === 'go' ? T.v : T.state === 'back' ? -12 : 0; T.wheels.forEach(w => w.rotation.y += sp * dt * 2.4);
  const show = T.state === 'dock' && !panelOpen(); T.bub.style.opacity = show ? 1 : 0;
  if (show) { T.bub.innerHTML = `🚚 <b>${T.load.length}/${cap}</b>`; const v = new THREE.Vector3(T.x, 3.6, 22).project(camera); T.bub.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px,${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`; }
}
// ---- FLIX Top line: rubber tank → ball machine ----
function buildTopLine() {
  const tk = new THREE.Group(); tk.position.set(13.0, 0, -5.6); scene.add(tk);
  add(new THREE.CylinderGeometry(1.0, 1.1, 2.6, 24), M(0x3a3f4c, { roughness: 0.4, metalness: 0.4 }), tk, 0, 1.3, 0); add(new THREE.SphereGeometry(1.0, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0x3a3f4c, { roughness: 0.4, metalness: 0.4 }), tk, 0, 2.6, 0);
  sign('KAUÇUK', '#2b2e36', tk, 0, 1.4, 1.12, 1.4); box(11.9, 14.1, -6.8, -4.5);
  rubberPile = new Pile(13.0, -3.0, 'rubber', 12, 2, 2, 0.7); markZone(rubberPile);
  const g = new THREE.Group(); g.position.set(18.5, 0, -4.5); scene.add(g);
  rb(2.6, 1.6, 1.8, M(0x2a80dc, { roughness: 0.35 }), g, 0, 0.8, 0, 0.18); const dome = add(new THREE.SphereGeometry(0.8, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xcfefff, transparent: true, opacity: 0.3, roughness: 0.05, depthWrite: false }), g, 0, 1.6, 0); dome.castShadow = false;
  const ball = add(GEO.ball, TOYM.ball, g, 0, 1.95, 0); ball.scale.setScalar(1.3);
  sign('FLIX TOP', '#2a80dc', g, 0, 0.9, 0.91, 1.4); box(17.2, 19.8, -5.4, -3.6);
  inRing(16.0, -4.5, 'kauçuk', 'bırak');
  const out = new Pile(21.2, -4.5, 'top', 8, 2, 2, 0.95); markZone(out);
  outl(g); outl(tk); TM = { g, ball, inR: 0, t: 0, rt: 0, out, inZone: new THREE.Vector3(16.0, 0, -4.5), x: 18.5, z: -4.5 };
}
// ---- gift wrapping: 3 tested FLIX → one gift set ----
function buildGift() {
  const g = new THREE.Group(); g.position.set(18.5, 0, 2.5); scene.add(g);
  rb(3.0, 1.0, 1.8, MT.purple, g, 0, 0.5, 0, 0.14); rb(3.2, 0.12, 2.0, MT.top, g, 0, 1.06, 0, 0.05);
  const roll = add(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 18), TOYM.wrap, g, -0.6, 1.4, -0.5); roll.rotation.z = Math.PI / 2;
  sign('HEDİYE PAKETİ', '#7a4fd8', g, 0, 0.55, 0.91, 1.9); box(16.9, 20.1, 1.5, 3.5);
  inRing(16.0, 2.5, 'test edilmiş', 'FLIX bırak');
  const out = new Pile(21.3, 2.5, 'gift', 8, 2, 2, 0.95); markZone(out);
  outl(g); GS = { g, roll, inV: [], t: 0, out, inZone: new THREE.Vector3(16.0, 0, 2.5), bufObjs: [] };
}
function syncGift() { GS.bufObjs.forEach(o => scene.remove(o)); GS.bufObjs = []; GS.inV.slice(0, 3).forEach((v, k) => { const o = makeItem('toy', v.col); o.scale.setScalar(0.55); o.position.set(17.8 + k * 0.6, 1.12, 2.8); scene.add(o); GS.bufObjs.push(o); }); }
// ---- conveyor: assembly 1 & 2 outputs ride to the test station by themselves ----
function buildConveyor() {
  const tx = tex(64, 64, (c) => { c.fillStyle = '#2b2e36'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#ffc20e'; c.beginPath(); c.moveTo(10, 8); c.lineTo(32, 32); c.lineTo(10, 56); c.lineTo(22, 56); c.lineTo(44, 32); c.lineTo(22, 8); c.fill(); }, true);
  const belts = [];
  const belt = (ax, az, bx, bz) => { const len = Math.hypot(bx - ax, bz - az), m = M(0xffffff, { map: tx.clone(), roughness: 0.6 }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.repeat.set(len / 0.8, 1); m.map.needsUpdate = true;
    const g = new THREE.Group(); g.position.set((ax + bx) / 2, 0, (az + bz) / 2); g.rotation.y = -Math.atan2(bz - az, bx - ax); scene.add(g);
    const b = add(new THREE.BoxGeometry(len, 0.08, 0.7), [MT.dark, MT.dark, m, MT.dark, MT.dark, MT.dark], g, 0, 0.5, 0); b.castShadow = false;
    for (const s of [-1, 1]) rb(len, 0.14, 0.08, MT.steel, g, 0, 0.58, s * 0.38, 0.03);
    for (let i = 0; i <= Math.floor(len / 1.2); i++) rb(0.1, 0.46, 0.6, MT.steel, g, -len / 2 + i * 1.2 + 0.1, 0.23, 0, 0.02);
    belts.push({ m, len }); };
  belt(2.4, -2.6, 5.0, 0.2); belt(2.4, 4.0, 5.0, 1.4);
  konv = { belts, t: 0 };
}
function stepConveyor(dt) {
  if (!konv) return; konv.belts.forEach(b => b.m.map.offset.x -= dt * 1.2);
  konv.t -= dt; if (konv.t > 0) return; konv.t = 0.7;
  for (const [i, path] of [[0, [new THREE.Vector3(2.4, 0.6, -2.6), new THREE.Vector3(5.0, 0.6, 0.2)]], [1, [new THREE.Vector3(2.4, 0.6, 4.0), new THREE.Vector3(5.0, 0.6, 1.4)]]]) {
    const A = asm[i]; if (!A || !A.out.n || !TS || TS.q.length >= 12) continue; const o = A.out.pop();
    fly(o, o.position, path[0], 0.25, () => fly(o, path[0], path[1], 1.0, () => { scene.remove(o); TS.q.push(o); syncTestQ(); }, 0.05), 0.4); }
}

// ---- shop counters (kasa) ----
function buildCounter(i, cx) {
  const ct = new THREE.Group(); ct.position.set(cx, 0, 14.0); scene.add(ct);
  rb(5.2, 1.1, 1.4, MT.red, ct, 0, 0.55, 0, 0.12); rb(5.4, 0.12, 1.6, MT.wtop, ct, 0, 1.15, 0, 0.05);
  const awn = tex(256, 64, (c, w, h) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#ffffff' : '#e22511'; c.fillRect(k * 32, 0, 32, h); } });
  add(new THREE.BoxGeometry(5.4, 0.14, 0.1), M(0xffffff, { map: awn }), ct, 0, 1.01, 0.74);
  const cs = tex(512, 128, (c, w, h) => { c.fillStyle = '#ffc20e'; c.beginPath(); c.roundRect(0, 0, w, h, 30); c.fill(); c.fillStyle = '#0b2a5e'; c.font = 'italic 900 84px BC'; c.textAlign = 'center'; c.fillText('FLIX SATIŞ' + (i ? ' ' + (i + 1) : ''), w / 2, 95); });
  add(new THREE.PlaneGeometry(2.6, 0.65), M(0xffffff, { map: cs, transparent: true }), ct, 0, 0.6, 0.72).castShadow = false;
  rb(0.7, 0.35, 0.5, MT.dark, ct, 2.0, 1.38, -0.2, 0.06); rb(0.5, 0.3, 0.06, M(0x0f1c33, { emissive: 0x2fe06a, emissiveIntensity: 0.6 }), ct, 2.0, 1.7, -0.3, 0.02);
  { const fl = tex(128, 384, (c, w, h) => { c.fillStyle = i % 2 ? '#2a80dc' : '#e22511'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 20); c.lineTo(w, h); c.lineTo(0, h - 30); c.fill(); if (LOGO) c.drawImage(LOGO, 14, 30, 100, 92); c.fillStyle = '#ffc20e'; c.font = 'italic 900 64px BC'; c.save(); c.translate(84, 150); c.rotate(Math.PI / 2); c.fillText('FLIX', 0, 0); c.restore(); });
    for (const s of [-1, 1]) { rb(0.09, 3.1, 0.09, MT.steel, ct, s * 3.05, 1.55, 0.55, 0.03); const f = add(new THREE.PlaneGeometry(0.6, 1.8), M(0xffffff, { map: fl, transparent: true, side: THREE.DoubleSide }), ct, s * 3.05 + 0.32, 2.15, 0.56); f.castShadow = false; ct.userData['flag' + (s > 0 ? 'R' : 'L')] = f; }
    for (const s of [-1, 1]) { add(G('Cylinder', 0.26, 0.2, 0.42, 12), MT.yel, ct, s * 3.0, 0.21, -0.55); add(G('Icosahedron', 0.36, 1), M(0x3fa84f, { flatShading: true }), ct, s * 3.0, 0.65, -0.55); }
    for (let k = 0; k < 3; k++) { const b = makeFlix(['dogal', 'mavi', 'sari'][k], 0.55); b.position.set(-2.1 + k * 0.32, 1.22, 0.45); b.rotation.y = 0.3; ct.add(b); } }
  outl(ct); box(cx - 2.7, cx + 2.7, 13.2, 14.8); ct.userData.T = Math.random() * 6; flags.push(ct);
  const pile = new Pile(cx - 1.3, 14.0, 'toy', 12, 3, 1, 0.9); pile.base = 1.21; markZone(pile, new THREE.Vector3(cx, 0, 12.2));
  const cash = new Pile(cx + 2.6, 11.9, 'cash', 80, 2, 2, 0.7);
  K.push({ i, x: cx, pile, cash, zone: pile.zone, cust: [] });
}
// ---- ad boost drops: a TV crate pops up near you now and then; step on it to watch an ad for a timed boost ----
let BX = null, bxT = 45;
const BXW = { x2: 3, hiz: 2, uret: 2, musteri: 2, miknatis: 1 };
function spawnBX() { const ids = Object.keys(BXW), tot = ids.reduce((a, k) => a + BXW[k], 0); let r = Math.random() * tot, id = ids[0]; for (const k of ids) { r -= BXW[k]; if (r <= 0) { id = k; break; } }
  if (bonusOn(id)) return; const b = BONUS.find(q => q.id === id); let x, z, ok = false;
  for (let k = 0; k < 20 && !ok; k++) { const a = rnd(0, Math.PI * 2), d = rnd(3, 5.5); x = P.o.position.x + Math.sin(a) * d; z = P.o.position.z + Math.cos(a) * d; x = Math.max(BOUNDS.x0 + 1.2, Math.min(BOUNDS.x1 - 1.2, x)); z = Math.max(BOUNDS.z0 + 1.2, Math.min(17.5, z)); const q = resolve(x, z); ok = Math.hypot(q.x - x, q.z - z) < 0.01 && !padObjs.some(o => Math.hypot(o.p.x - x, o.p.z - z) < 2); }
  if (!ok) return;
  const g = new THREE.Group(); g.position.set(x, 0.6, z); g.scale.setScalar(1.4); scene.add(g);
  rb(0.95, 0.72, 0.5, M(0x1b1330, { roughness: 0.4 }), g, 0, 0, 0, 0.1); const scr = tex(256, 192, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, b.col); gr.addColorStop(1, '#1b1330'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.font = '96px sans-serif'; c.textAlign = 'center'; c.fillText(b.icon, w / 2, 112); c.fillStyle = '#fff'; c.font = 'italic 900 34px BC'; c.fillText('REKLAM', w / 2, 170); });
  for (const s of [1, -1]) { const p = add(new THREE.PlaneGeometry(0.8, 0.58), new THREE.MeshBasicMaterial({ map: scr }), g, 0, 0, s * 0.26); p.rotation.y = s > 0 ? 0 : Math.PI; p.castShadow = false; }
  for (const s of [-1, 1]) { const a = rb(0.04, 0.4, 0.04, MT.dark, g, s * 0.18, 0.5, 0); a.rotation.z = -s * 0.5; }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.1, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(b.col), transparent: true, opacity: 0.8, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.05, z); scene.add(ring);
  BX = { g, ring, id, x, z, life: 25, asked: false }; SFX.chime && SFX.chime(1); fxBurst(new THREE.Vector3(x, 1, z), 'star', 6, 0.8); }
function removeBX() { if (!BX) return; scene.remove(BX.g); scene.remove(BX.ring); BX = null; }
function stepBoostDrop(dt, T) { if (BOT || ENDGAME || !tutDone() || inMenu) return;
  if (BX) { BX.life -= dt; BX.g.position.y = 0.75 + Math.sin(T * 3) * 0.15; BX.g.rotation.y += dt * 1.6; BX.ring.material.opacity = 0.55 + Math.sin(T * 6) * 0.3; BX.ring.scale.setScalar(BX.life < 5 ? 0.6 + 0.4 * (BX.life / 5) : 1);
    if (!BX.asked && !P.act && Math.hypot(P.o.position.x - BX.x, P.o.position.z - BX.z) < 1.1) { BX.asked = true; joy.on = false; joy.x = joy.y = 0; const at = new THREE.Vector3(BX.x, 1, BX.z); boostOffer(BX.id, (ok) => { if (ok) { confetti(at); fxBurst(at, 'star', 10, 1); } removeBX(); bxT = rnd(90, 140); }); }
    else if (BX && !BX.asked && BX.life <= 0) { removeBX(); bxT = rnd(60, 100); } return; }
  bxT -= dt; if (bxT <= 0) { bxT = 20; spawnBX(); } }
const flags = []; const stepFlags = (T) => { for (const ct of flags) { const a = Math.sin(T * 2.2 + ct.userData.T) * 0.25; if (ct.userData.flagL) ct.userData.flagL.rotation.y = a; if (ct.userData.flagR) ct.userData.flagR.rotation.y = -a; } };
const allCash = () => K.map(c => c.cash).concat(TR ? [TR.cash] : []);
// ---- recycling: rejected FLIX become keychains ----
function buildRecycle() {
  const g = new THREE.Group(); g.position.set(-5.2, 0, 10.2); scene.add(g);
  rb(2.4, 1.5, 1.8, M(0x2fa043, { roughness: 0.45, map: PANEL }), g, 0, 0.75, 0, 0.16);
  const hop = add(new THREE.CylinderGeometry(0.75, 0.42, 0.8, 22, 1, true), M(0xd9dee6, { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }), g, -0.4, 1.9, 0);
  const gear = add(new THREE.TorusGeometry(0.32, 0.09, 8, 6), MT.yel, g, 0.65, 1.0, 0.92);
  const sym = tex(128, 128, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.strokeStyle = '#25a855'; c.lineWidth = 12; for (let k = 0; k < 3; k++) { const a = k * 2.094 - 1.57; c.beginPath(); c.arc(64, 64, 34, a + 0.3, a + 1.75); c.stroke(); const ex = 64 + Math.cos(a + 1.75) * 34, ey = 64 + Math.sin(a + 1.75) * 34; c.fillStyle = '#25a855'; c.beginPath(); c.arc(ex, ey, 11, 0, 7); c.fill(); } });
  add(new THREE.PlaneGeometry(0.7, 0.7), M(0xffffff, { map: sym, transparent: true }), g, -0.5, 0.9, 0.92).castShadow = false;
  sign('GERİ DÖNÜŞÜM', '#25a855', g, 0.35, 0.35, 0.92, 1.4);
  box(-6.5, -3.9, 9.2, 11.2);
  inRing(-7.7, 10.2, 'hatalı', 'FLIX bırak');
  const out = new Pile(-2.6, 10.2, 'key', 12, 2, 2, 0.6); markZone(out);
  outl(g); RC = { g, gear, vals: [], t: 0, out, inZone: new THREE.Vector3(-7.7, 0, 10.2) };
}
function dropRecycle(o) { fly(o, o.position, new THREE.Vector3(-5.6, 2.3, 10.2), 0.3, () => { scene.remove(o); RC.vals.push({ v: o.userData.v || COLS[o.userData.col] && COLS[o.userData.col].v || 5, col: o.userData.col || 'dogal' }); }); }
// ---- plush workshop: 3 feathers -> 1 plush FLIX (no base needed) ----
function buildPlush() {
  const g = new THREE.Group(); g.position.set(17.5, 0, 7.2); scene.add(g);
  rb(2.8, 1.0, 1.6, M(0xff6aa8, { roughness: 0.45, map: PANEL }), g, 0, 0.5, 0, 0.14); rb(3.0, 0.12, 1.8, MT.top, g, 0, 1.06, 0, 0.05);
  rb(0.32, 0.8, 0.32, MT.white, g, 0.75, 1.5, -0.35, 0.08); rb(1.1, 0.28, 0.32, MT.white, g, 0.3, 1.86, -0.35, 0.08);
  const needle = rb(0.05, 0.36, 0.05, MT.steel, g, -0.15, 1.55, -0.35, 0.02);
  [0xe22511, 0x2a80dc, 0xffc20e].forEach((c, k) => add(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 14), M(c, { roughness: 0.8 }), g, -1.1 + k * 0.28, 1.23, -0.55));
  sign('PELUŞ ATÖLYESİ', '#e84aa0', g, 0, 0.55, 0.81, 2.0); const stars = starRow(g, 0, 0.22, 0.82);
  box(16.0, 19.0, 6.3, 8.1);
  inRing(14.9, 7.2, 'tüy', 'bırak');
  const out = new Pile(20.4, 7.2, 'plush', 8, 2, 2, 0.95); markZone(out);
  outl(g); PL = { g, needle, stars, inF: [], t: 0, out, inZone: new THREE.Vector3(14.9, 0, 7.2), bufObjs: [] };
}
function syncPlush() { PL.bufObjs.forEach(o => scene.remove(o)); PL.bufObjs = []; PL.inF.slice(0, 6).forEach((c, k) => { const o = makeItem('feather', c); o.position.set(16.6 + (k % 3) * 0.4, 1.13 + Math.floor(k / 3) * 0.1, 7.6); scene.add(o); PL.bufObjs.push(o); }); }
function dropPlush(o) { const col = o.userData.col; fly(o, o.position, new THREE.Vector3(16.8, 1.2, 7.4), 0.25, () => { scene.remove(o); PL.inF.push(col); syncPlush(); }); }
// ---- overhead feather / base belt straight to the assembly tables (pad + upgrade) ----
function beltSeg(ax, az, bx, bz, y = 2.5) { const len = Math.hypot(bx - ax, bz - az), m = M(0xffffff, { map: FBTEX.clone(), roughness: 0.6 }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.repeat.set(len / 0.8, 1); m.map.needsUpdate = true;
  const g = new THREE.Group(); g.position.set((ax + bx) / 2, y, (az + bz) / 2); g.rotation.y = -Math.atan2(bz - az, bx - ax); scene.add(g);
  const b = add(new THREE.BoxGeometry(len, 0.08, 0.6), [MT.dark, MT.dark, m, MT.dark, MT.dark, MT.dark], g, 0, 0, 0); b.castShadow = false;
  for (const sd of [-1, 1]) rb(len, 0.16, 0.06, MT.yel, g, 0, 0.08, sd * 0.32, 0.02);
  for (const e of [-len / 2, len / 2]) add(new THREE.CylinderGeometry(0.07, 0.07, y, 8), MT.steel, g, e, -y / 2, 0);
  FB.belts.push(m); }
let FBTEX = null;
function buildBelt() {
  FBTEX = FBTEX || tex(64, 64, (c) => { c.fillStyle = '#2b2e36'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#2fe06a'; c.beginPath(); c.moveTo(10, 8); c.lineTo(32, 32); c.lineTo(10, 56); c.lineTo(22, 56); c.lineTo(44, 32); c.lineTo(22, 8); c.fill(); }, true);
  FB = { belts: [], t: 0, tb: 0, crate2: false };
  beltSeg(farmPile.pos.x, -10.9, -1.6, -10.9); beltSeg(-1.6, -10.9, -1.6, -3.9); beltSeg(-6.2, -3.5, -2.6, -3.6);
  if (farmPile2) beltCrate2();
}
function beltCrate2() { if (!FB || FB.crate2) return; FB.crate2 = true; beltSeg(7.6, -10.9, -1.6, -10.9, 2.55); }
function flyPath(o, pts, speed, onEnd) { let i = 0; const step = () => { if (i >= pts.length - 1) { onEnd && onEnd(); return; } const a = pts[i], b = pts[i + 1]; i++; fly(o, a, b, Math.max(0.12, a.distanceTo(b) / speed), step, 0.02); }; step(); }
function stepBelt(dt) {
  if (!FB) return; FB.belts.forEach(m => m.map.offset.x -= dt * 1.4);
  const iv = 1.1 * Math.pow(0.8, lv('bant')) * UB(), V = (x, y, z) => new THREE.Vector3(x, y, z);
  FB.t -= dt; if (FB.t <= 0 && asm.length) { FB.t = iv; const src = [farmPile, farmPile2].filter(p => p && p.n).sort((a, b) => b.n - a.n)[0]; const A = asm.reduce((a, b) => b.inF.length < a.inF.length ? b : a, asm[0]);
    if (src && A.inF.length < 10) { const o = src.pop(), col = o.userData.col, sx = src.pos.x; const pts = [o.position.clone(), V(sx, 2.62, -10.9), V(-1.6, 2.62, -10.9), V(-1.6, 2.62, -3.9)];
      flyPath(o, pts, 6, () => fly(o, o.position, V(A.x - 0.6, 1.2, A.z), 0.35, () => { scene.remove(o); A.inF.push(col); syncBuf(A); }, 0.8)); } }
  FB.tb -= dt; if (FB.tb <= 0 && asm.length) { FB.tb = iv; const A = asm.reduce((a, b) => b.inB < a.inB ? b : a, asm[0]);
    if (pressPile && pressPile.n && A.inB < 10) { const o = pressPile.pop(); const pts = [o.position.clone(), V(-6.2, 2.62, -3.5), V(-2.6, 2.62, -3.6)];
      flyPath(o, pts, 6, () => fly(o, o.position, V(A.x - 0.6, 1.2, A.z), 0.35, () => { scene.remove(o); A.inB++; syncBuf(A); }, 0.8)); } }
}
// ---- big farm: fence moves back, more turkeys, second feather crate ----
function buildBigFarm() {
  if (backFence) { scene.remove(backFence); unbox(backFence.userData.col); backFence = null; }
  const FZ = farmZ(); add(new THREE.PlaneGeometry(22, 7.5), MT.grass, null, 0, 0.003, -23.5).rotation.x = -Math.PI / 2;
  for (let x = -10.5; x <= 10.5; x += 1.5) rb(0.14, 1.0, 0.14, MT.fence, null, x, 0.5, FZ); rb(21.2, 0.1, 0.1, MT.fence, null, 0, 0.8, FZ); rb(21.2, 0.1, 0.1, MT.fence, null, 0, 0.45, FZ);
  for (let z = FZ; z < -20; z += 1.5) { rb(0.14, 1.0, 0.14, MT.fence, farmLeft, -10.6, 0.5, z); rb(0.14, 1.0, 0.14, MT.fence, farmRight, 10.6, 0.5, z); }
  rb(0.1, 0.1, 7, MT.fence, farmLeft, -10.6, 0.8, -23.5); rb(0.1, 0.1, 7, MT.fence, farmRight, 10.6, 0.8, -23.5);
  box(-11.5, 11.5, FZ - 1, FZ + 0.4); BOUNDS.z0 = FZ - 1; NAV.dirty = true; if (has('bblok')) farmLeft.visible = false;
  if (hallFence) { scene.remove(hallFence); unbox(hallFence.userData.col); buildHallFence(); }
  // pond + second hay corner so the new land is not empty
  const pond = add(new THREE.CircleGeometry(2.2, 32), M(0x5ab8f0, { roughness: 0.1, metalness: 0.2 }), null, -6, 0.02, -24); pond.rotation.x = -Math.PI / 2; pond.castShadow = false; box(-8.1, -3.9, -26.1, -21.9);
  for (const [x, z] of [[4, -25.5], [5.2, -25.6]]) { const h = add(new THREE.CylinderGeometry(0.6, 0.6, 1.0, 18), M(0xe8c66a, { roughness: 1 }), null, x, 0.6, z); h.rotation.z = Math.PI / 2; }
  rb(2.4, 0.5, 2.0, MT.wood, null, 7.6, 0.25, -10.9); box(6.4, 8.8, -12.1, -9.7);
  farmPile2 = new Pile(7.6, -10.9, 'feather', 16, 2, 2, 0.75); farmPile2.base = 0.55; markZone(farmPile2, new THREE.Vector3(7.6, 0, -8.8));
  const cols = ['dogal', 'mavi', 'yesil', 'sari', 'kirmizi', 'mor', 'altin'].filter(c => c === 'dogal' || has(c)); for (let k = 0; k < 8; k++) addTurkey(cols[k % cols.length]);
  beltCrate2();
}
// ---- B Blok: the factory grows left — doors in the old wall, warehouse racks, forklift, 4th assembly, 2nd press, 5th counter ----
function buildBBlok() {
  if (LW) { scene.remove(LW[0]); scene.remove(LW[1]); unbox(LW[2]); LW = null; }
  for (const [z0, z1] of [[-7.5, 4.0], [8.0, 10.8], [14.2, 18.0]]) { const L = z1 - z0, zc = (z0 + z1) / 2; rb(0.5, 1.4, L, MT.wall, null, -11, 0.7, zc); rb(0.56, 0.18, L + 0.06, MT.wallTop, null, -11, 1.45, zc); box(-11.5, -10.7, z0 - 0.3, z1); }
  for (const z of [4.0, 8.0, 10.8, 14.2]) { rb(0.62, 1.9, 0.3, MT.yel, null, -11, 0.95, z, 0.06); }
  rb(13.8, 0.3, 25.5, MT.white, null, -17.75, -0.14, 5.25, 0.1); floorPlane(13.5, 25.1, -17.75, 5.25);
  rb(0.5, 1.4, 25.5, MT.wall, null, -24.5, 0.7, 5.25); rb(0.56, 0.18, 25.56, MT.wallTop, null, -24.5, 1.45, 5.25); box(-25.0, -24.2, -8, 18.6);
  for (const [x0, x1] of [[-24.5, -20.0], [-17.0, -11.0]]) { const L = x1 - x0, xc = (x0 + x1) / 2; rb(L, 1.4, 0.5, MT.wall, null, xc, 0.7, -7.5); rb(L + 0.06, 0.18, 0.56, MT.wallTop, null, xc, 1.45, -7.5); box(x0 - 0.3, x1 + 0.3, -7.8, -7.2); }
  const sg = tex(1024, 256, (c, w, h) => { c.fillStyle = '#0b2a5e'; c.beginPath(); c.roundRect(0, 0, w, h, 40); c.fill(); c.fillStyle = '#ffc20e'; c.font = 'italic 900 150px BC'; c.textAlign = 'center'; c.fillText('B BLOK', w / 2, 185); });
  add(new THREE.PlaneGeometry(4.4, 1.1), M(0xffffff, { map: sg, transparent: true }), null, -13.5, 2.4, -7.24).castShadow = false;
  // warehouse racks with FLIX boxes along the back-left
  const boxM = [M(0xd9a46a, { roughness: 0.8 }), M(0xc8935a, { roughness: 0.8 }), MT.red];
  for (let r = 0; r < 4; r++) { const g = new THREE.Group(); g.position.set(-23.6, 0, -5.4 + r * 3.2); scene.add(g);
    for (const sz of [-1.3, 1.3]) for (const sx of [-0.55, 0.55]) rb(0.1, 3.0, 0.1, MT.navy, g, sx, 1.5, sz, 0.03);
    for (const y of [0.15, 1.1, 2.05]) { rb(1.2, 0.08, 2.7, MT.yel, g, 0, y, 0, 0.02); for (let k = 0; k < 3; k++) if ((r + k + y * 3) % 5 > 0.5) rb(0.9, 0.7, 0.8, boxM[(r + k) % 3], g, 0, y + 0.4, -0.85 + k * 0.85, 0.05); } }
  box(-24.3, -22.9, -7.0, 6.6);
  // forklift parked by the door
  const fk = new THREE.Group(); fk.position.set(-13.4, 0, -4.8); fk.rotation.y = 0.5; scene.add(fk);
  rb(1.1, 0.7, 1.6, MT.yel, fk, 0, 0.55, 0, 0.12); rb(0.9, 0.08, 0.9, MT.dark, fk, 0, 1.6, -0.1, 0.03); for (const sx of [-0.4, 0.4]) rb(0.06, 1.2, 0.06, MT.dark, fk, sx, 1.0, -0.4, 0.02);
  for (const sx of [-0.25, 0.25]) { rb(0.08, 1.6, 0.08, MT.dark, fk, sx, 0.9, 0.85, 0.02); rb(0.1, 0.05, 0.9, MT.steel, fk, sx, 0.15, 1.3, 0.02); }
  for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) { const w = add(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 14), MT.dark, fk, x, 0.22, z); w.rotation.z = Math.PI / 2; }
  box(-14.3, -12.5, -5.9, -3.7);
  // pallets with FLIX boxes
  for (const [x, z] of [[-12.6, 7.0], [-12.6, 9.0]]) { rb(1.2, 0.14, 1.2, MT.woodD, null, x, 0.07, z, 0.02); rb(1.0, 0.8, 1.0, boxM[1], null, x, 0.55, z, 0.05); box(x - 0.6, x + 0.6, z - 0.6, z + 0.6); }
  // farm grows left as well
  if (farmLeft) farmLeft.visible = false; const FZ = farmZ();
  add(new THREE.PlaneGeometry(13.6, -7.5 - FZ), MT.grass, null, -17.8, 0.004, (FZ - 7.5) / 2).rotation.x = -Math.PI / 2;
  for (let x = -24.4; x <= -11; x += 1.5) rb(0.14, 1.0, 0.14, MT.fence, null, x, 0.5, FZ); rb(13.5, 0.1, 0.1, MT.fence, null, -17.75, 0.8, FZ); box(-25, -11.4, FZ - 1, FZ + 0.4);
  for (let z = FZ; z <= -8.5; z += 1.5) rb(0.14, 1.0, 0.14, MT.fence, null, -24.5, 0.5, z);
  BOUNDS.x0 = -24.5; NAV.dirty = true; for (let k = 0; k < 4; k++) addTurkey(['dogal', 'mavi', 'yesil', 'sari'][k]);
}
function buildPress2() {
  const press = new THREE.Group(); press.position.set(-19.6, 0, -3.8); scene.add(press);
  press.userData.body = rb(2.4, 2.6, 2.2, M(0xff7a1a, { roughness: 0.35 }), press, 0, 1.3, 0, 0.18); rb(1.8, 0.35, 1.6, MT.steel, press, 0, 2.8, 0, 0.08);
  press.userData.pis = add(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16), MT.steel, press, 0, 3.5, 0);
  sign('PRES 2', '#ff7a1a', press, 0, 1.6, 1.12, 1.4);
  box(-21.0, -18.2, -5.1, -2.5); pressPile2 = new Pile(-17.4, -3.8, 'base', 12, 2, 2, 0.8); markZone(pressPile2); outl(press); PR2 = { press, t: 0 };
}
// ---- feather robots: little vacuum bots drive to turkeys, collect feathers, unload into the crates ----
function makeRobot() { const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  add(new THREE.CylinderGeometry(0.4, 0.42, 0.24, 22), MT.yel, body, 0, 0.18, 0); const bt = add(new THREE.TorusGeometry(0.41, 0.05, 8, 24), MT.dark, body, 0, 0.12, 0); bt.rotation.x = Math.PI / 2;
  add(new THREE.SphereGeometry(0.3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xcfefff, transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false }), body, 0, 0.3, -0.05).castShadow = false;
  const fill = add(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 16), M(0x8a5a2e, { roughness: 0.7 }), body, 0, 0.45, -0.05); fill.scale.y = 0.01;
  rb(0.22, 0.12, 0.3, MT.dark, body, 0, 0.14, 0.42, 0.04); add(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), MT.dark, body, 0.2, 0.55, -0.2);
  const light = add(new THREE.SphereGeometry(0.06, 10, 8), M(0x2fe06a, { emissive: 0x2fe06a, emissiveIntensity: 1.2 }), body, 0.2, 0.77, -0.2); light.castShadow = false;
  const face = tex(64, 32, (c) => { c.fillStyle = '#0b2a5e'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#2fe8ff'; c.fillRect(14, 10, 10, 12); c.fillRect(40, 10, 10, 12); });
  add(new THREE.PlaneGeometry(0.3, 0.13), M(0xffffff, { map: face, emissive: 0xffffff, emissiveMap: face, emissiveIntensity: 0.4 }), body, 0, 0.22, 0.425).castShadow = false;
  outl(g); return { g, body, fill, light }; }
function addRobot() { const r = makeRobot(), d = robDock || new THREE.Vector3(-9, 0, -15); r.g.position.set(d.x + rnd(-0.5, 0.5), 0, d.z + rnd(-0.5, 0.5)); scene.add(r.g); ROB.push({ ...r, st: 'seek', tk: null, load: [], t: 0, path: null, spd: 0 }); }
function buildRobotDock() { const g = new THREE.Group(); g.position.set(-8.6, 0, -15.6); scene.add(g); robDock = new THREE.Vector3(-8.6, 0, -14.4);
  rb(1.8, 0.1, 1.4, MT.dark, g, 0, 0.05, 0, 0.04); rb(0.5, 1.3, 0.4, MT.navy, g, 0, 0.65, -0.5, 0.08); add(new THREE.SphereGeometry(0.12, 12, 8), M(0x2fe06a, { emissive: 0x2fe06a, emissiveIntensity: 1 }), g, 0, 1.4, -0.5).castShadow = false;
  sign('ROBOT', '#ffc20e', g, 0, 1.0, -0.29, 0.9); box(-9.0, -8.2, -16.3, -15.9); for (let k = 0; k < 2; k++) addRobot(); }
function buildGarage() { const g = new THREE.Group(); g.position.set(-18.5, 0, -13.5); scene.add(g);
  rb(4.2, 2.4, 2.6, M(0x2a80dc, { roughness: 0.5, map: PANEL }), g, 0, 1.2, 0, 0.12); rb(4.4, 0.2, 2.8, MT.red, g, 0, 2.5, 0, 0.06); rb(2.6, 1.6, 0.06, MT.dark, g, 0, 0.8, 1.31, 0.03);
  for (let k = 0; k < 5; k++) rb(2.6, 0.05, 0.08, MT.steel, g, 0, 0.2 + k * 0.32, 1.35, 0.02);
  sign('ROBOT GARAJI', '#2a80dc', g, 0, 2.05, 1.32, 2.4); box(-20.7, -16.3, -14.9, -12.1); robDock = new THREE.Vector3(-18.5, 0, -11.4); for (let k = 0; k < 3; k++) addRobot(); }
const robCap = () => 3 + lv('robot');
function driveTo(R, tgt, dt, sp) { const p = R.g.position;
  if (!R.path || !R.ptgt || Math.hypot(R.ptgt.x - tgt.x, R.ptgt.z - tgt.z) > 0.8) { R.path = navPath(p.x, p.z, tgt.x, tgt.z); R.ptgt = tgt.clone(); R.pi = 0; }
  let wp = R.path[R.pi]; while (wp && R.pi < R.path.length - 1 && Math.hypot(wp.x - p.x, wp.z - p.z) < 0.4) wp = R.path[++R.pi]; if (!wp) return true;
  const dx = wp.x - p.x, dz = wp.z - p.z, d = Math.hypot(dx, dz); if (R.pi === R.path.length - 1 && Math.hypot(tgt.x - p.x, tgt.z - p.z) < 0.9) { R.spd = 0; return true; }
  R.spd = Math.min(sp, (R.spd || 0) + dt * sp * 3); const ang = Math.atan2(dx, dz); let da = ang - R.g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); R.g.rotation.y += da * Math.min(1, dt * 8);
  const mv = R.spd * Math.max(0.3, 1 - Math.abs(da) / 2) * dt; p.x += dx / (d || 1) * mv; p.z += dz / (d || 1) * mv; return false; }
function stepRobots(dt, T) {
  const sp = 2.8 * (1 + lv('robot') * 0.1) * (has('robot2') ? 1.3 : 1) * (bonusOn('uret') ? 1.5 : 1), cap = robCap();
  for (const R of ROB) { R.body.position.y = R.spd > 0.2 ? Math.abs(Math.sin(T * 14)) * 0.02 : 0; R.light.material.emissiveIntensity = R.st === 'suck' ? 2 + Math.sin(T * 30) : 1;
    if (R.st === 'seek') { if (!R.tk || !turkeys.includes(R.tk)) { const free = turkeys.filter(t => !ROB.some(o => o !== R && o.tk === t)); R.tk = free.length ? free.reduce((a, b) => b.o.position.distanceTo(R.g.position) < a.o.position.distanceTo(R.g.position) ? b : a) : null; if (!R.tk) continue; }
      if (driveTo(R, R.tk.o.position, dt, sp)) { R.st = 'suck'; R.t = 0.55; R.tk.wait = Math.max(R.tk.wait, 0.7); } }
    else if (R.st === 'suck') { R.t -= dt; R.body.rotation.z = Math.sin(T * 40) * 0.04; if (R.t <= 0) { R.body.rotation.z = 0; const col = R.tk.col; R.load.push(col); R.tk.peck = 1;
        const o = makeItem('feather', col); scene.add(o); o.position.copy(R.tk.o.position).setY(1); fly(o, o.position, R.g.position.clone().setY(0.5), 0.3, () => scene.remove(o), 0.4);
        R.fill.material.color.set(COLS[col].f); R.fill.scale.y = Math.max(0.01, R.load.length / cap); R.tk = null; R.st = R.load.length >= cap ? 'go' : 'seek'; } }
    else if (R.st === 'go') { const crates = [farmPile, farmPile2].filter(p => p && !p.full()); if (!crates.length) { R.spd = 0; continue; }
      const cr = crates.reduce((a, b) => b.pos.distanceTo(R.g.position) < a.pos.distanceTo(R.g.position) ? b : a); const tp = new THREE.Vector3(cr.pos.x, 0, cr.pos.z - 2.0);
      if (driveTo(R, tp, dt, sp)) { R.t -= dt; if (R.t <= 0) { R.t = 0.12; if (R.load.length && !cr.full()) { const col = R.load.pop(); const o = makeItem('feather', col); scene.add(o); o.position.copy(R.g.position).setY(0.6); const to = cr.slot(cr.n); cr.items.push(o); fly(o, o.position, to, 0.35, null, 1.2); R.fill.scale.y = Math.max(0.01, R.load.length / cap); }
          if (!R.load.length || cr.full()) { R.st = R.load.length ? 'go' : 'seek'; } } } } }
}
// ---- decorations: every factory level adds something you can see ----
const DECOR = [
  [2, () => { for (const [x, z] of [[-10.3, -6.6], [10.3, -6.6], [-10.3, 4.2], [-6.0, 17.6]]) { add(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 14), MT.red, null, x, 0.3, z); add(new THREE.IcosahedronGeometry(0.5, 1), M(0x3fa84f, { flatShading: true }), null, x, 0.95, z); } }],
  [3, () => { const t = tex(256, 360, (c, w, h) => { c.fillStyle = '#ffc20e'; c.fillRect(0, 0, w, h); if (LOGO) c.drawImage(LOGO, 28, 30, 200, 180); c.fillStyle = '#0b2a5e'; c.font = 'italic 900 52px BC'; c.textAlign = 'center'; c.fillText('KICK IT', w / 2, 270); c.fillText('FLICK IT', w / 2, 326); });
    for (const x of [3.6, 9.6]) { const p = add(new THREE.PlaneGeometry(1.1, 1.55), M(0xffffff, { map: t }), null, x, 1.25, -7.24); p.castShadow = false; } }],
  [4, () => { const cols = [0xe22511, 0xffc20e, 0x2a80dc, 0x2fa043]; for (let i = 0; i < 26; i++) { const x = -10.6 + i * 0.84; add(new THREE.SphereGeometry(0.09, 10, 8), M(cols[i % 4], { emissive: cols[i % 4], emissiveIntensity: 0.9 }), null, x, 1.75 + Math.sin(i * 0.9) * 0.08, -7.4).castShadow = false; } }],
  [5, () => { const cols = [0xe22511, 0xffc20e, 0x2a80dc]; for (let i = 0; i < 3; i++) { const b = add(new THREE.SphereGeometry(0.35, 18, 14), M(cols[i], { roughness: 0.2 }), null, 7.6 + i * 0.5, 2.6 + i * 0.3, 7.4); b.scale.y = 1.2; b.userData.bob = i; decoBob.push(b); rb(0.02, 1.6, 0.02, MT.white, null, 7.6 + i * 0.5, 1.6 + i * 0.3, 7.4, 0.005); } }],
  [6, () => { const cols = ['#e22511', '#ffc20e', '#2a80dc', '#2fa043']; for (let i = 0; i < 18; i++) { const f = add(new THREE.ConeGeometry(0.22, 0.45, 3), M(new THREE.Color(cols[i % 4]).getHex(), { side: THREE.DoubleSide }), null, -8 + i * 1.0, 2.1, 18.2); f.rotation.x = Math.PI; f.castShadow = false; } rb(18, 0.03, 0.03, MT.dark, null, 0.5, 2.35, 18.2, 0.01); }],
  [7, () => { const r = add(new THREE.PlaneGeometry(2.4, 4.2), M(0xc81e14, { roughness: 0.9 }), null, 4.0, 0.03, 16.9); r.rotation.x = -Math.PI / 2; r.castShadow = false; }],
  [8, () => { rb(1.6, 0.8, 1.6, MT.navy, null, 9.0, 0.4, 16.4, 0.12); const f = makeFlix('altin', 1.6); f.position.set(9.0, 0.8, 16.4); scene.add(f); decoSpin.push(f); box(8.2, 9.8, 15.6, 17.2); }],
  [10, () => { const t = tex(512, 128, (c, w, h) => { c.fillStyle = '#0b2a5e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ff3ad0'; c.lineWidth = 8; c.shadowColor = '#ff3ad0'; c.shadowBlur = 20; c.font = 'italic 900 96px BC'; c.textAlign = 'center'; c.strokeText('FLIX FABRİKA', w / 2, 98); });
    const p = add(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: t }), null, 6.75, 2.6, -7.24); p.castShadow = false; }],
  [12, () => { for (const [x, z] of [[-10.3, 18.0], [10.4, 18.0]]) { rb(0.3, 3.2, 0.3, MT.steel, null, x, 1.6, z, 0.05); const l = add(new THREE.SphereGeometry(0.25, 14, 10), M(0xfff2b0, { emissive: 0xffe08a, emissiveIntensity: 1.2 }), null, x, 3.3, z); l.castShadow = false; } }],
  [14, () => { const g = new THREE.Group(); g.position.set(1.6, 0, 9.8); scene.add(g); add(new THREE.CylinderGeometry(1.1, 1.2, 0.5, 28), MT.steel, g, 0, 0.25, 0); add(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 28), M(0x5ab8f0, { roughness: 0.05, metalness: 0.2 }), g, 0, 0.5, 0); const f = makeFlix('mor', 0.9); f.position.y = 0.55; g.add(f); decoSpin.push(f); box(0.4, 2.8, 8.6, 11.0); }],
];
const decoBob = [], decoSpin = []; let decoDone = 0;
function stepDecor(anim) { if (!has('bina')) return; const L = factoryLevel(); let added = false; for (let i = decoDone; i < DECOR.length && DECOR[i][0] <= L; i++) { DECOR[i][1](); decoDone = i + 1; added = true; } if (added && anim) toast('Fabrika seviye ' + L + '! Yeni süsleme geldi'); }

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
const tkPos = () => { const xm = has('genis') ? 24 : 9.5; let x, z; do { x = rnd(has('bblok') ? -23 : -9, xm); z = rnd(has('ciftlik') ? -25.6 : -18.6, -11.6); } while ((x > 3.4 && x < 9.6 && z < -15 && z > -20) || (has('robot2') && x > -21.5 && x < -15.5 && z < -11 && z > -15.5)); return new THREE.Vector3(x, 0, z); };
function addTurkey(col, pen = false) { const t = turkeyMesh(col); t.position.copy(pen ? penPos() : tkPos()); scene.add(t); turkeys.push({ pen, o: t, col, tgt: pen ? penPos() : tkPos(), wait: rnd(0, 2), peck: 0 }); }

// ---------------- player ----------------
export let P; let H;
function makeHero(skin, acc, scale) {
  const h = hero(skin, { noCloak: acc !== 'pelerin', face: 'happy' }); h.g.scale.setScalar(scale);
  if (acc === 'gozluk') { const gm = M(0x111111, { roughness: 0.2, metalness: 0.3 }); for (const s of [-1, 1]) { const l = add(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 20), gm, h.head, s * 0.16, 0.08, 0.42); l.rotation.x = Math.PI / 2; } add(new THREE.BoxGeometry(0.14, 0.03, 0.03), gm, h.head, 0, 0.1, 0.44); }
  if (acc === 'kulak') { const km = M(0x222a3a, { roughness: 0.4 }); add(new THREE.TorusGeometry(0.5, 0.045, 8, 24, Math.PI), km, h.head, 0, 0.05, 0); for (const s of [-1, 1]) { const c = add(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 18), M(0xe22511, { roughness: 0.3 }), h.head, s * 0.5, 0.0, 0); c.rotation.z = Math.PI / 2; } }
  if (acc === 'kask') { const km = M(0xffc20e, { roughness: 0.35 }); add(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), km, h.head, 0, 0.22, 0); const br = add(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 28), km, h.head, 0, 0.22, 0.04); rb(0.1, 0.12, 0.9, km, h.head, 0, 0.66, 0, 0.04); }
  if (acc === 'sapka') { const sm = M(0xe22511, { roughness: 0.5 }); add(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), sm, h.head, 0, 0.24, 0); const v = add(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 22, 1, false, -Math.PI / 2, Math.PI), M(0x0b2a5e, { roughness: 0.5 }), h.head, 0, 0.3, 0.32); v.rotation.x = 0.12; add(new THREE.SphereGeometry(0.06, 10, 8), M(0xffc20e), h.head, 0, 0.74, 0); }
  if (acc === 'atki') { const sc = M(0xffc20e, { roughness: 0.7, map: tex(128, 32, (c, w, hh) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#e22511' : '#0b2a5e'; c.fillRect(i * 16, 0, 16, hh); } }) }); const t = add(new THREE.TorusGeometry(0.42, 0.11, 10, 28), sc, h.head, 0, -0.42, 0); t.rotation.x = Math.PI / 2; const e = rb(0.22, 0.55, 0.08, sc, h.head, 0.2, -0.72, 0.36, 0.04); e.rotation.z = 0.15; }
  if (acc === 'kanat') { const wg = new THREE.SphereGeometry(0.5, 16, 10); wg.scale(0.32, 1.25, 0.08); wg.translate(0, 0.55, 0); const cols = [0x2fa043, 0x2a80dc, 0xffc20e]; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const wm = add(wg, M(cols[k], { roughness: 0.45 }), h.g, sd * 0.35, 0.95, -0.35); wm.rotation.set(-0.35, 0, sd * -(0.7 + k * 0.38)); wm.scale.setScalar(1.25 - k * 0.15); } }
  if (acc === 'hale') { const hm = new THREE.MeshStandardMaterial({ color: 0xffe066, emissive: 0xffc20e, emissiveIntensity: 1.4, roughness: 0.3 }); const t = add(new THREE.TorusGeometry(0.4, 0.05, 10, 32), hm, h.head, 0, 1.35, -0.1); t.rotation.x = Math.PI / 2; t.castShadow = false; h.halo2 = t; }
  if (acc === 'tac') { const tm = M(0xffcf3a, { roughness: 0.2, metalness: 0.8, side: THREE.DoubleSide }); const cr = add(new THREE.CylinderGeometry(0.3, 0.27, 0.2, 10, 1, true), tm, h.head, 0, 0.52, 0.22); cr.rotation.x = -0.3; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(new THREE.ConeGeometry(0.06, 0.16, 6), tm, cr, Math.cos(a) * 0.28, 0.17, Math.sin(a) * 0.28); } }
  if (acc === 'bere') { const bm = M(0x2a80dc, { roughness: 0.9, map: tex(64, 64, (c) => { c.fillStyle = '#2a80dc'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#ffffff'; for (let y = 0; y < 64; y += 16) c.fillRect(0, y, 64, 6); }) }); add(new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), bm, h.head, 0, 0.2, 0).scale.y = 1.25; add(new THREE.SphereGeometry(0.13, 12, 10), MT.white, h.head, 0, 0.86, 0); }
  if (acc === 'kovboy') { const cm = M(0x8a5a32, { roughness: 0.75 }); const br = add(new THREE.CylinderGeometry(0.78, 0.78, 0.05, 28), cm, h.head, 0, 0.32, 0); br.scale.z = 0.85; add(new THREE.CylinderGeometry(0.34, 0.42, 0.42, 20), cm, h.head, 0, 0.55, 0); add(new THREE.CylinderGeometry(0.43, 0.43, 0.08, 20), M(0xe22511), h.head, 0, 0.4, 0); }
  if (acc === 'maske') { const mm = M(0x111111, { roughness: 0.4 }); const m = add(new THREE.TorusGeometry(0.44, 0.07, 8, 28, Math.PI * 0.9), mm, h.head, 0, 0.1, 0); m.rotation.set(0, Math.PI + 0.15, 0); m.rotation.order = 'YXZ'; m.rotation.x = Math.PI / 2; m.scale.z = 1.6; }
  if (acc === 'anten') { add(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), MT.dark, h.head, 0, 0.75, 0); const st = add(STAR.geo, new THREE.MeshStandardMaterial({ color: 0xffc20e, emissive: 0xffc20e, emissiveIntensity: 1, side: THREE.DoubleSide }), h.head, 0, 1.08, 0); st.scale.setScalar(2.2); h.halo2 = st; }
  return h;
}
function buildPlayer() {
  H = makeHero(SV.cos.skin, SV.cos.acc, 0.78); P = { o: H.g, stack: [], walk: 0, tick: 0, speed: 6.2 };
  scene.add(H.g); H.g.position.set(SV.px ?? 0, 0, SV.pz ?? 3);
  P.hold = new THREE.Group(); P.hold.position.set(0, 1.0, 0.62); H.g.add(P.hold);
  const lbl = document.createElement('div'); lbl.id = 'cap'; document.body.appendChild(lbl); P.lbl = lbl;
}
export const patronLv = () => 1 + lv('spd') + lv('cap') + lv('kar') + lv('cek') + lv('pazar');
const PTIER = [[1, 0xffffff, 'Çırak'], [5, 0xcd7f32, 'Usta'], [15, 0xd9dee6, 'Şef'], [30, 0xffc83a, 'Patron'], [50, 0x5ff0ff, 'Efsane']];
export const patronTier = () => { const l = patronLv(); let t = PTIER[0]; for (const q of PTIER) if (l >= q[0]) t = q; return t; };
let pRing = null, pTierShown = 0;
function syncPatron(anim) { const l = patronLv(), t = patronTier(); if (!pRing) { pRing = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false })); pRing.rotation.x = -Math.PI / 2; scene.add(pRing); }
  pRing.material.color.set(t[1]); pRing.scale.setScalar(1 + Math.min(0.5, l * 0.01)); H.g.scale.setScalar(0.78 + Math.min(0.14, l * 0.004));
  if (anim && t[0] !== pTierShown) { toast('Yeni unvan: ' + t[2] + '! Halkan ve boyun büyüdü'); confetti(P.o.position.clone().setY(1)); SFX.milestone(); } pTierShown = t[0]; }
export function onUpgrade() { syncPatron(true); syncOffice(); floatText('+1 Sv', '#25a855'); }
const floats = [];
export function floatText(txt, col = '#ffc20e') { const el = document.createElement('div'); el.className = 'ft'; el.textContent = txt; el.style.color = col; document.body.appendChild(el); floats.push({ el, t: 0 }); }
export function setLook() { const pos = P.o.position.clone(), ry = P.o.rotation.y; scene.remove(H.g); H = makeHero(SV.cos.skin, SV.cos.acc, 0.78); H.g.position.copy(pos); H.g.rotation.y = ry; scene.add(H.g); H.g.add(P.hold); P.o = H.g; syncPatron(false); confetti(pos.clone().setY(1)); }
export const capOf = () => 4 + lv('cap') + cosB().cap;
const wcap = () => 2 + lv('wcap') + cosB().wc;
function stackPush(obj) { const h = P.stack.reduce((a, o) => a + hOf(o), 0); P.stack.push(obj); const local = new THREE.Vector3(0, h / 0.78, 0); const from = obj.getWorldPosition(new THREE.Vector3()); P.hold.add(obj); obj.position.copy(P.hold.worldToLocal(from.clone())); obj.scale.setScalar(1 / 0.78); obj.rotation.set(0, 0, 0); tweens.push({ obj, from: obj.position.clone(), to: local, t: 0, dur: 0.22, arc: 0.8 }); }
function stackPop(pred) { for (let i = P.stack.length - 1; i >= 0; i--) if (pred(P.stack[i])) { const o = P.stack.splice(i, 1)[0]; restack(); const w = o.getWorldPosition(new THREE.Vector3()); scene.add(o); o.position.copy(w); o.scale.setScalar(1); o.rotation.set(0, 0, 0); return o; } return null; }
function restack() { let h = 0; for (const o of P.stack) { o.position.set(0, h / 0.78, 0); h += hOf(o); } }

// ---------------- unlock pads ----------------
function padTex(p, paid) { return tex(256, 256, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.roundRect(8, 8, w - 16, h - 16, 36); c.fill(); c.strokeStyle = p.col ? COLS[p.col].f : p.big ? '#e22511' : '#0b2a5e'; c.lineWidth = 9; c.setLineDash([22, 14]); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#37b24d'; c.beginPath(); c.roundRect(24, 24 + (h - 48) * (1 - paid / p.cost), w - 48, (h - 48) * paid / p.cost, 26); c.fill();
  c.fillStyle = '#0b2a5e'; c.textAlign = 'center'; c.font = `italic 900 ${p.name.length > 11 ? 32 : 40}px BC`; c.fillText(p.name.toLocaleUpperCase('tr-TR'), w / 2, 100); c.font = 'italic 900 64px BC'; c.fillText('₺' + fmt(p.cost - paid), w / 2, 170); if (p.fx) { c.font = '700 21px R'; c.fillStyle = '#25a855'; c.fillText(p.fx, w / 2, 214); } }); }
function refreshPads() {
  padObjs.forEach(o => scene.remove(o.mesh)); padObjs = [];
  for (const p of PADS) { if (has(p.id)) continue; const ok = p.req === 'tut' ? tutDone() : has(p.req); if (!ok) continue;
    const paid = SV.paid[p.id] || 0, s = p.big ? 3.0 : 2.4; const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: padTex(p, paid), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(p.x, 0.06, p.z); scene.add(m);
    padObjs.push({ p, mesh: m, paid, t: 0 }); }
}
function actPad(p) {
  if (p.id === 'atolye') buildAtolye();
  if (p.id === 'depo') buildDepo();
  if (p.id === 'bina') buildBina();
  if (p.id === 'kumes3' && penPile) addTurkey('dogal', true);
  if (p.id === 'ik' && farmPile) retirePen();
  if (p.id === 'masa') buildAssembly(0, -1.0, -2.0);
  if (p.id === 'ciftlik0') buildFarm();
  if (p.id === 'pres') buildPress();
  if (p.id === 'park') buildTest();
  if (p.id === 'kumes2' && penPile) addTurkey('dogal', true);
  if (p.col) { addTurkey(p.col); addTurkey(p.col); }
  if (p.id === 'suru') ['dogal', 'dogal', 'mavi', 'yesil', 'dogal', 'mavi'].forEach(addTurkey);
  if (p.id === 'asm2') buildAssembly(1, -1.0, 3.4);
  if (p.id === 'asm3') buildAssembly(2, -6.4, 6.4);
  if (p.id === 'ofis') buildOffice();
  if (p.id === 'ik') buildHR();
  if (p.id === 'genis') buildHall();
  if (p.id === 'kamyon') buildTruck();
  if (p.id === 'top') buildTopLine();
  if (p.id === 'hediye') buildGift();
  if (p.id === 'konv') buildConveyor();
  if (p.id === 'kasa2') buildCounter(1, -3.0);
  if (p.id === 'kasa3') buildCounter(2, 13.6);
  if (p.id === 'kasa4') buildCounter(3, 19.2);
  if (p.id.startsWith('kasa')) spawnStaff();
  if (p.id === 'kasa5' || p.id === 'asm4' || p.id === 'pres2') NAV.dirty = true;
  if (p.id === 'geri') buildRecycle();
  if (p.id === 'pelus') buildPlush();
  if (p.id === 'bant') buildBelt();
  if (p.id === 'ciftlik') buildBigFarm();
  if (p.id === 'bblok') buildBBlok();
  if (p.id === 'asm4') buildAssembly(3, -17.5, 3.0);
  if (p.id === 'pres2') buildPress2();
  if (p.id === 'kasa5') buildCounter(4, -17.5);
  if (p.id === 'robot') buildRobotDock();
  if (p.id === 'robot2') buildGarage();
}
function unlock(p) { SV.unl.push(p.id); actPad(p); applyTiers(); SFX.milestone(); haptic(60); if (p.col) SV.gems += 5; toast(p.name + ' açıldı! ' + (p.fx || '') + (p.col ? ' · +5 💎' : '')); confetti(new THREE.Vector3(p.x, 0.5, p.z)); stepDecor(true); save(); refreshPads(); refreshHUD(); setTimeout(maybeInter, 1500); }

// ---------------- staff ----------------
export function spawnStaff() {
  while (workers.length < SV.staff.tas) { const h = makeHero(wSkin(workers.length), SV.cos.wacc || 'kask', 0.68); h.g.position.set(-8.2, 0, 1.5); scene.add(h.g); const hold = new THREE.Group(); hold.position.set(0, 1.0, 0.62); h.g.add(hold); workers.push({ H: h, hold, stack: [], task: null, walk: 0, ai: 0, id: workers.length, wait: 0 }); }
  while (cashiers.length < Math.min(SV.staff.kas, K.length)) { const C = K[cashiers.length]; const h = makeHero(['altin', 'tr', 'turkuaz', 'lav'][cashiers.length % 4], 'gozluk', 0.72); h.g.position.set(C.x + 1.0, 0, 12.6); scene.add(h.g); cashiers.push({ H: h }); animWalk(h, 0, false, false); }
}

const wSkin = (i) => !SV.cos.wskin || SV.cos.wskin === 'karisik' ? ['buzul', 'ejder', 'neon', 'altin'][i % 4] : SV.cos.wskin;
export function setWorkerLook() { workers.forEach((W, i) => { const old = W.H.g, h = makeHero(wSkin(i), SV.cos.wacc || 'kask', 0.68); h.g.position.copy(old.position); h.g.rotation.y = old.rotation.y; scene.remove(old); scene.add(h.g); h.g.add(W.hold); W.H = h; confetti(h.g.position.clone().setY(1)); }); }
// ---------------- customers ----------------
const SHIRTS = [0x2a80dc, 0x2fa043, 0xe84aa0, 0xffc20e, 0x7a4fd8, 0xff7a3a, 0x18a0a0];
const SKINS = ['#f6d3b3', '#eebf98', '#d09a70', '#a8704a', '#7a4e32'], HAIR = [0x2a1a10, 0x5a3a20, 0xd8b060, 0x111111, 0xa0461e, 0x8a8a8a], PANTS = [0x34425e, 0x2d5a8a, 0x5a4a3a, 0x222831, 0x6a7a50, 0xc9b28a];
const PMC = {}; const pmat = (k, f) => PMC[k] || (PMC[k] = f());
function faceTex(skin, v) { return pmat('face' + skin + v, () => { const cv = tex(256, 128, (c, w, h) => { c.fillStyle = skin; c.fillRect(0, 0, w, h); const cx = 64, ey = 46;
  c.fillStyle = 'rgba(255,120,120,.35)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * 22, 62, 9, 6, 0, 0, 7); c.fill(); }
  for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx + s * 13, ey, 6.5, 8, 0, 0, 7); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(cx + s * 13 + 0.5, ey + 1, 4.2, 5.4, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + s * 13 + 2, ey - 1.5, 1.6, 0, 7); c.fill();
    c.strokeStyle = 'rgba(40,20,10,.75)'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + s * 7, ey - 13 + (v === 2 ? 2 : 0)); c.lineTo(cx + s * 19, ey - 14 - (v === 1 ? 2 : 0)); c.stroke(); }
  c.strokeStyle = '#7a2e22'; c.lineWidth = 2.6; c.beginPath(); if (v === 1) { c.fillStyle = '#7a2e22'; c.ellipse(cx, 67, 6, 5, 0, 0, Math.PI); c.fill(); } else c.arc(cx, 61, 9, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke();
  c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.ellipse(cx, 56, 3, 2, 0, 0, 7); c.fill(); }); cv.anisotropy = 4; return new THREE.MeshStandardMaterial({ map: cv, roughness: 0.6 }); }); }
function shirtMat(col, pat) { return pmat('sh' + col + pat, () => new THREE.MeshStandardMaterial({ roughness: 0.75, map: tex(128, 128, (c, w, h) => { const hx = '#' + col.toString(16).padStart(6, '0'); c.fillStyle = hx; c.fillRect(0, 0, w, h);
  if (pat === 1) { c.fillStyle = 'rgba(255,255,255,.55)'; for (let y = 6; y < h; y += 22) c.fillRect(0, y, w, 9); }
  else if (pat === 2) { c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h / 2, 22, 0, 7); c.fill(); c.fillStyle = hx; c.font = '900 italic 26px BC'; c.textAlign = 'center'; c.fillText('F', w / 2, h / 2 + 9); }
  else if (pat === 3) { c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(w * 0.62, h * 0.3, 22, 18); c.fillStyle = 'rgba(255,255,255,.7)'; for (let y = 10; y < h; y += 18) c.fillRect(w / 2 - 1, y, 3, 3); }
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, h - 10, w, 10); }) })); }
function personMesh(kid = false) {
  const g = new THREE.Group(), skinC = SKINS[Math.floor(rnd(0, SKINS.length))], skin = pmat('sk' + skinC, () => M(new THREE.Color(skinC), { roughness: 0.6 }));
  const shirt = shirtMat(SHIRTS[Math.floor(rnd(0, SHIRTS.length))], Math.floor(rnd(0, 4))), pants = pmat('p' + Math.floor(rnd(0, PANTS.length)), () => M(PANTS[Math.floor(rnd(0, PANTS.length))], { roughness: 0.8 }));
  const shoe = pmat('shoe' + (kid ? 1 : 0), () => M(kid ? 0xff5a3a : 0x3a2a22, { roughness: 0.5 })), sole = pmat('sole', () => M(0xffffff, { roughness: 0.6 }));
  const legs = [], arms = [];
  for (const sd of [-1, 1]) { const p = new THREE.Group(); p.position.set(sd * 0.15, 0.72, 0); g.add(p); add(G('Capsule', 0.12, 0.42, 4, 10), pants, p, 0, -0.32, 0);
    rbc(0.22, 0.13, 0.36, shoe, p, 0, -0.66, 0.06, 0.06); rbc(0.23, 0.04, 0.37, sole, p, 0, -0.72, 0.06, 0.02); legs.push(p); }
  rbc(0.62, 0.72, 0.4, shirt, g, 0, 1.08, 0, 0.16); rbc(0.5, 0.1, 0.34, pants, g, 0, 0.74, 0, 0.05);
  for (const sd of [-1, 1]) { const p = new THREE.Group(); p.position.set(sd * 0.38, 1.36, 0); g.add(p); add(G('Capsule', 0.09, 0.32, 4, 8), shirt, p, 0, -0.2, 0); add(G('Sphere', 0.085, 12, 8), skin, p, 0, -0.46, 0); arms.push(p); }
  add(G('Cylinder', 0.1, 0.11, 0.12, 12), skin, g, 0, 1.48, 0);
  const hr = kid ? 0.34 : 0.3, head = add(G('Sphere', hr, 26, 18), faceTex(skinC, Math.floor(rnd(0, 3))), g, 0, 1.52 + hr, 0); head.rotation.y = 0;
  for (const sd of [-1, 1]) add(G('Sphere', 0.06, 10, 8), skin, head, sd * hr * 0.98, 0, 0);
  const hairM = pmat('h' + Math.floor(rnd(0, HAIR.length)), () => M(HAIR[Math.floor(rnd(0, HAIR.length))], { roughness: 0.7 })), hs = Math.floor(rnd(0, 5));
  if (hs !== 4) add(new THREE.SphereGeometry(hr * 1.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / (hs === 1 ? 1.9 : 2.3)), hairM, head, 0, 0.03, -0.03);
  if (hs === 1) rbc(hr * 1.9, hr * 1.1, 0.14, hairM, head, 0, -0.1, -hr * 0.85, 0.06);
  if (hs === 2) add(G('Sphere', 0.13, 12, 10), hairM, head, 0, hr * 0.85, -hr * 0.55);
  if (hs === 4) { const capM = pmat('cap' + (kid ? 1 : 0), () => M(kid ? C.red : C.navy, { roughness: 0.5 })); add(G('Sphere', hr * 1.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), capM, head, 0, 0.04, 0); const br = add(G('Cylinder', hr * 0.75, hr * 0.75, 0.03, 20, 1, false, -Math.PI / 2, Math.PI), capM, head, 0, 0.1, hr * 0.55); br.rotation.x = 0.15; }
  if (!kid && Math.random() < 0.3) rbc(0.42, 0.5, 0.18, pmat('bag', () => M(0xe8a23a, { roughness: 0.7 })), g, 0, 1.1, -0.28, 0.07);
  g.userData.legs = legs; g.userData.arms = arms; g.userData.head = head; if (kid) g.scale.setScalar(0.72); return g; }
let custT = 2;
export const bonusOn = (id) => Date.now() < (id === 'x2' ? SV.boostUntil : (SV.bonus[id] || 0));
export const bonusLeft = (id) => Math.max(0, (id === 'x2' ? SV.boostUntil : (SV.bonus[id] || 0)) - Date.now());
export function addBonus(id, min) { const now = Date.now(); if (id === 'x2') SV.boostUntil = Math.max(now, SV.boostUntil) + min * 60000; else SV.bonus[id] = Math.max(now, SV.bonus[id] || 0) + min * 60000; save(); }
export function cosB() { const r = { spd: 0, cap: 0, kar: 0, ws: 0, wc: 0 }; for (const k of ['skin', 'acc', 'floor', 'wskin', 'wacc']) { const c = COS[k].find(q => q.id === SV.cos[k]); if (c && c.b) for (const x in c.b) r[x] += c.b[x]; } return r; }
export const profitMult = () => 1.25 * (1 + lv('kar') * 0.1 + cosB().kar + (has('genis') ? 0.1 : 0)) * (SV.vip ? 2 : 1) * (bonusOn('x2') ? 2 : 1);
const canSell = (C) => SV.staff.kas > C.i || near(C.zone, 1.9);
const slotOf = (C, j) => j < 3 ? new THREE.Vector3(C.x, 0, 15.9 + j * 1.25) : new THREE.Vector3(C.x + 1.2 * (j - 2), 0, 19.6);
function stepCustomers(dt) {
  const L = factoryLevel(), perK = 3 + Math.min(2, Math.floor(L / 7)) + (has('genis') ? 1 : 0);
  custT -= dt; if (custT <= 0) { custT = rnd(2.0, 4.0) * Math.max(0.45, 1 - L * 0.035) * (bonusOn('musteri') ? 0.5 : 1) * Math.max(0.45, Math.pow(0.94, lv('cek'))) / Math.sqrt(K.length);
    const C = K.reduce((a, b) => b.cust.length < a.cust.length ? b : a, K[0]);
    if (C.cust.length < perK) { const o = personMesh(); o.position.set(32, 0, 20.3); scene.add(o);
      const want = tutDone() ? Math.min(7, 1 + Math.floor(rnd(0, 2 + L * 0.3)) + (bonusOn('musteri') ? 1 : 0)) : 1; const oc = ['mavi', 'sari', 'kirmizi'].filter(has), ord = tutDone() && oc.length && Math.random() < 0.6 ? oc[Math.floor(rnd(0, oc.length))] : 'mix';
      const bub = document.createElement('div'); bub.className = 'bub'; document.body.appendChild(bub); const c = { o, want, got: 0, value: 0, bub, state: 'queue', t: 0, C, walk: 0, ord, pat: 0, hit: 0 }; C.cust.push(c); customers.push(c); } }
  const hide = panelOpen();
  for (const c of customers) { const C = c.C, j = C.cust.indexOf(c), p = c.o.position; let tgt;
    if (c.state === 'leave') tgt = p.z < 20.4 ? new THREE.Vector3(p.x + (p.x > C.x ? 0.01 : -0.01), 0, 20.8) : new THREE.Vector3(-30, 0, 20.8);
    else { const sl = slotOf(C, j); tgt = Math.abs(p.x - sl.x) > 0.35 && sl.z < 19 ? new THREE.Vector3(sl.x, 0, 20.3) : sl; if (p.z < 19.4 && Math.abs(p.x - sl.x) > 0.35) tgt = new THREE.Vector3(p.x, 0, 20.3); }
    const d = tgt.clone().sub(p); d.y = 0; const dist = d.length(), mv = dist > 0.06;
    if (mv) { d.normalize(); p.addScaledVector(d, Math.min(dist, dt * 4.6)); const ang = Math.atan2(d.x, d.z); let da = ang - c.o.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); c.o.rotation.y += da * Math.min(1, dt * 12); c.walk += dt * 10; } else { c.walk = 0; if (c.state !== 'leave') c.o.rotation.y += (Math.PI - c.o.rotation.y) * Math.min(1, dt * 8); }
    const lg = c.o.userData.legs; lg[0].rotation.x = Math.sin(c.walk) * 0.5 * (mv ? 1 : 0); lg[1].rotation.x = -lg[0].rotation.x; const am = c.o.userData.arms; am[0].rotation.x = lg[1].rotation.x * 0.8; am[1].rotation.x = lg[0].rotation.x * 0.8;
    if (j === 0 && c.state === 'queue' && !mv && tgt.z < 19) { c.t -= dt; if (c.t <= 0 && C.pile.n > 0 && c.got < c.want) { c.t = canSell(C) ? 0.3 : 0.8; const it = c.ord === 'mix' ? C.pile.pop() : C.pile.take(q => q.userData.col === c.ord);
      if (it) { fly(it, it.position, p.clone().add(new THREE.Vector3(0, 1.4, 0)), 0.3, () => scene.remove(it)); c.got++; const m = c.ord === 'mix' ? 1 : 1.3; c.value += (it.userData.v || 5) * m; if (m > 1) c.hit++; ctSold(it); SFX.coin(); c.pat = 0; }
      else { c.pat += c.t; if (c.pat > 9) { c.ord = 'mix'; c.pat = 0; } } }
      if (c.got >= c.want) { c.state = 'leave'; C.cust.splice(j, 1); payCash(c.value * profitMult(), C.cash, new THREE.Vector3(C.x, 1.5, 14.2)); c.bub.className = 'bub ok'; c.bub.innerHTML = c.hit ? '😍' : '😊'; const bb = c.bub; setTimeout(() => bb.remove(), 1500); } }
    if (c.state === 'queue') { const h = `<b>${c.want - c.got}</b><i class="fl"></i><i class="od" style="background:${ORDERS[c.ord].c}"></i>`; if (c.bh !== h) { c.bub.innerHTML = h; c.bh = h; } c.bub.classList.toggle('wait', c.pat > 5); }
    const v = p.clone().add(new THREE.Vector3(0, 2.6, 0)).project(camera); c.bub.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px,${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`; c.bub.style.opacity = (c.state === 'leave') || hide || j > 3 ? 0 : 1; }
  for (let i = customers.length - 1; i >= 0; i--) { const c = customers[i]; if (c.state === 'leave' && c.o.position.x < -29) { scene.remove(c.o); c.bub.remove(); customers.splice(i, 1); } }
}
// ---- endless contracts ("sipariş"): N FLIX of one colour, sold anywhere, pays a bonus + gems ----
const CT_COLS = ['dogal', 'mavi', 'yesil', 'sari', 'kirmizi', 'mor', 'altin'];
function newContract() { const own = CT_COLS.filter(c => c === 'dogal' || has(c)), top = own.slice(-3), col = top[Math.floor(rnd(0, top.length))], d = SV.ctDone || 0;
  const n = Math.min(60, 6 + Math.floor(d * 1.5) + Math.floor(factoryLevel() / 3) * 2); const rw = Math.round(n * COLS[col].v * (3 + Math.min(4, d * 0.15)) * (1 + lv('pazar') * 0.15));
  SV.ct = { col, n, got: 0, rw, gem: Math.min(10, 2 + Math.floor(d / 4)) }; }
function ctSold(o) { if (!SV.ct || !tutDone()) return; const t = o.userData.type; if (!['toy', 'plush', 'key'].includes(t) || o.userData.col !== SV.ct.col) return;
  SV.ct.got++; if (SV.ct.got >= SV.ct.n) { const c = SV.ct; SV.money += c.rw; SV.gems += c.gem; SV.ctDone = (SV.ctDone || 0) + 1; bumpMoney(); SFX.milestone(); haptic(60); toast('Sipariş tamam! +₺' + fmt(c.rw) + ' · +' + c.gem + ' 💎'); confetti(P.o.position.clone().setY(1.5)); SV.ct = null; save(); } }
export const contract = () => SV.ct;
let earnMin = 0;
function payCash(v, pile = cashPile, from = new THREE.Vector3(4.0, 1.5, 14.2)) { v = Math.round(v); earnMin += v; const n = Math.max(1, Math.min(10, Math.round(v / 6))); for (let k = 0; k < n; k++) { if (pile.full()) { SV.money += v / n; continue; } const o = makeItem('cash'); o.userData.v = v / n; scene.add(o); const to = pile.slot(pile.n); pile.items.push(o); o.position.copy(from); fly(o, o.position, to, 0.35 + k * 0.05); } SV.made += 1; }

// ---------------- joystick ----------------
const joy = { on: false, ox: 0, oy: 0, x: 0, y: 0 }; const jb = $('#joy'), jk = $('#joyk');
canvas.addEventListener('pointerdown', e => { SFX.unlock(); joy.on = true; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; jb.style.left = e.clientX + 'px'; jb.style.top = e.clientY + 'px'; jb.classList.add('on'); jk.style.transform = 'translate(-50%,-50%)'; try { canvas.setPointerCapture(e.pointerId); } catch {} });
canvas.addEventListener('pointermove', e => { if (!joy.on) return; document.body.classList.add('moved'); let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const l = Math.hypot(dx, dy), R = 46; if (l > R) { dx *= R / l; dy *= R / l; } joy.x = dx / R; joy.y = dy / R; jk.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`; });
const end = () => { joy.on = false; joy.x = joy.y = 0; jb.classList.remove('on'); }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
const keys = {}; addEventListener('keydown', e => keys[e.key] = 1); addEventListener('keyup', e => keys[e.key] = 0);

const confettiBits = [];
// small particle bursts: sparks (hammering), fluff (feathers), puff (steam/dust), star (success), coin (cash)
const FX = [], FXG = { spark: new THREE.BoxGeometry(0.08, 0.08, 0.08), coin: new THREE.CylinderGeometry(0.1, 0.1, 0.03, 10), fluff: new THREE.PlaneGeometry(0.1, 0.2), puff: new THREE.IcosahedronGeometry(0.2, 0), star: null },
  FXM = { spark: new THREE.MeshBasicMaterial({ color: 0xffc83a }), coin: new THREE.MeshBasicMaterial({ color: 0xffd23a }), fluff: new THREE.MeshBasicMaterial({ color: 0xfff6e8, side: THREE.DoubleSide }), puff: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }), star: new THREE.MeshBasicMaterial({ color: 0xffd84a, side: THREE.DoubleSide }) };
function fxBurst(p, k, n = 6, s = 1) { if (!FXG.star) FXG.star = STAR.geo; for (let i = 0; i < n && FX.length < 160; i++) { const m = new THREE.Mesh(FXG[k], FXM[k]); m.castShadow = false; m.position.copy(p); scene.add(m);
  const v = k === 'puff' ? new THREE.Vector3(rnd(-1, 1), rnd(0.4, 1.2), rnd(-1, 1)) : k === 'fluff' ? new THREE.Vector3(rnd(-1.4, 1.4), rnd(1.2, 2.6), rnd(-1.4, 1.4)) : new THREE.Vector3(rnd(-2.4, 2.4), rnd(3, 6), rnd(-2.4, 2.4));
  FX.push({ m, v: v.multiplyScalar(s), k, t: 0, life: k === 'puff' ? 0.55 : k === 'fluff' ? 1.1 : k === 'star' ? 0.8 : 0.5, sc: k === 'star' ? 2.2 : 1 }); m.scale.setScalar(k === 'star' ? 2.2 : 1); } }
function stepFX(dt) { for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt; const e = Math.min(1, f.t / f.life);
  if (f.k === 'puff') { f.m.position.addScaledVector(f.v, dt); f.m.scale.setScalar(1 + e * 2.4); }
  else if (f.k === 'fluff') { f.v.y -= 3 * dt; f.v.multiplyScalar(1 - dt * 1.8); f.m.position.addScaledVector(f.v, dt); f.m.rotation.z += dt * 7; f.m.rotation.x += dt * 4; f.m.scale.setScalar(1 - e * 0.5); }
  else { f.v.y -= (f.k === 'star' ? 7 : 15) * dt; f.m.position.addScaledVector(f.v, dt); if (f.k === 'star') f.m.quaternion.copy(camera.quaternion); else { f.m.rotation.x += dt * 11; f.m.rotation.y += dt * 7; } f.m.scale.setScalar(f.sc * (1 - e * e)); }
  if (f.t >= f.life) { scene.remove(f.m); FX.splice(i, 1); } } }
// rings under piles light up while you stand in them
const ZR = [];
function stepRings(dt) { for (let i = ZR.length - 1; i >= 0; i--) { const z = ZR[i]; if (!z.r.parent) { ZR.splice(i, 1); continue; } const on = P && z.p.zone && Math.hypot(P.o.position.x - z.p.zone.x, P.o.position.z - z.p.zone.z) < 1.7; z.r.material.opacity += ((on ? 0.9 : 0.34) - z.r.material.opacity) * Math.min(1, dt * 8); z.r.scale.setScalar(1 + (on ? 0.06 : 0)); } }
function confetti(p) { for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.24), new THREE.MeshBasicMaterial({ color: [0xe22511, 0xffc20e, 0x2a80dc, 0x2fa043, 0xffffff][i % 5], side: THREE.DoubleSide })); m.position.copy(p); scene.add(m); confettiBits.push({ m, v: new THREE.Vector3(rnd(-4, 4), rnd(6, 11), rnd(-4, 4)), r: new THREE.Vector3(rnd(-8, 8), rnd(-8, 8), 0), t: 0 }); } }
const dust = []; const dustMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }), dustGeo = new THREE.SphereGeometry(0.14, 8, 6);
export function setSound(on) { sound = on; SFX.enabled = on; try { localStorage.setItem('flix_fabrika_snd', on ? '1' : '0'); } catch {} if (on) SFX.unlock(); else SFX.setMusic(false); }
export const soundOn = () => sound;

// ---------------- tutorial ----------------
const TUT = [
  { t: 'Hindiden tüy al', tgt: () => penPile ? penPile.zone : K[0].zone, done: () => !penPile || P.stack.some(o => o.userData.type === 'feather') },
  { t: 'Makineden FLIX tabanı al', tgt: () => miniPile ? miniPile.zone : K[0].zone, done: () => !miniPile || P.stack.some(o => o.userData.type === 'base') },
  { t: 'Standa git: kur, kutula ve test et', tgt: () => K[0].zone, done: () => K[0].pile.n > 0 || K[0].cash.n > 0 || SV.money > 0 },
  { t: 'Müşteri alsın, parayı topla', tgt: () => K[0].cash.pos, done: () => SV.money > 0 },
];
export const tutDone = () => SV.tut >= TUT.length;
function stepTutorial() {
  if (tutDone() && !SV.ct) newContract();
  let tgt = null; const st = TUT[SV.tut];
  if (st) { if (st.done()) { SV.tut++; SFX.click(); if (SV.tut >= TUT.length) { $('#goal').classList.remove('show'); SV.gems += 10; toast('Harika! Parayla atölyeni büyüt · +10 💎'); refreshPads(); refreshHUD(); } save(); } else { $('#goal').textContent = st.t; $('#goal').classList.add('show'); tgt = st.tgt(); } }
  if (!tgt && padObjs.length && SV.money >= Math.min(...padObjs.map(o => o.p.cost - o.paid)) * 0.6) { const o = padObjs.reduce((a, b) => (a.p.cost - a.paid) < (b.p.cost - b.paid) ? a : b); tgt = o.mesh.position; }
  guideTarget = tgt;
}

// ---------------- simulation ----------------
let feT = 0, prT = 0;
function near(p, r) { const a = P.o.position; return Math.hypot(a.x - p.x, a.z - p.z) < r; }
let zoneLock = null;
function stepZones(T) {
  let inZ = null; for (const k in ZONES) if (ZONES[k] && near(ZONES[k].pos, ZONES[k].r)) inZ = k;
  if (inZ && inZ !== zoneLock) { zoneLock = inZ; openPanel(inZ); }
  if (!inZ && zoneLock) { zoneLock = null; closePanel(); }
  for (const k in ZONES) if (ZONES[k]) ZONES[k].ring.material.opacity = 0.6 + Math.sin(T * 3) * 0.25;
}
const UB = () => bonusOn('uret') ? 0.5 : 1; let magT = 0;
function stepRecycle(dt) { if (!RC) return; const w = RC.vals.length > 0; RC.gear.rotation.z += dt * (w ? 7 : 0.6); RC.t -= dt;
  if (w && !RC.out.full() && RC.t <= 0) { RC.t = 1.4 * UB(); const q = RC.vals.shift(); const it = makeItem('key', q.col, Math.max(3, Math.round(q.v * PROD.keyMult))); scene.add(it); it.position.set(-4.2, 1.4, 10.2); const to = RC.out.slot(RC.out.n); RC.out.items.push(it); fly(it, it.position, to, 0.4); SFX.pop(); } }
function stepPlush(dt, T) { if (!PL) return; const w = PL.inF.length >= 3 && !PL.out.full(); PL.needle.position.y = 1.55 + (w ? Math.sin(T * 30) * 0.08 : 0); PL.t -= dt;
  if (w && PL.t <= 0) { PL.t = 2.0 * Math.pow(0.85, lv('mont')) * UB(); const cols = PL.inF.splice(0, 3); const col = cols.reduce((a, b) => COLS[b].v > COLS[a].v ? b : a, cols[0]); const it = makeItem('plush', col, Math.round(cols.reduce((a, c) => a + COLS[c].v, 0) * PROD.plushMult)); scene.add(it); it.position.set(17.3, 1.3, 7.2); const to = PL.out.slot(PL.out.n); PL.out.items.push(it); fly(it, it.position, to, 0.45); SFX.chime && SFX.chime(3); syncPlush(); } }
function stepWorld(dt, T) {
  if (bonusOn('miknatis') && !inMenu) { magT -= dt; if (magT <= 0) { magT = 0.12; for (const pile of allCash()) if (pile && pile.n) { const o = pile.pop(), v = o.userData.v || 5; fly(o, o.position, P.o.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.45, () => { scene.remove(o); SV.money += v; bumpMoney(); }, 2.2); SFX.coin(); break; } } }
  feT -= dt; if (feT <= 0) { feT = (penPile ? (turkeys.every(t => t.pen) ? 2.2 : 3.2) : 5.5) * Math.pow(0.85, lv('kumes')) / Math.max(1, turkeys.length) * UB(); const tk = turkeys[Math.floor(rnd(0, turkeys.length))]; const fp = tk.pen ? penPile : farmPile2 && !farmPile2.full() && (tk.o.position.x > 0.4 || farmPile.full()) ? farmPile2 : farmPile; if (fp && !fp.full()) { const o = makeItem('feather', tk.col); scene.add(o); o.position.copy(tk.o.position).add(new THREE.Vector3(0, 1, 0)); const to = fp.slot(fp.n); fp.items.push(o); fly(o, o.position, to, 0.7 + tk.o.position.distanceTo(to) * 0.03, null, 2.5); tk.peck = 1; if (tk.pen) fxBurst(tk.o.position.clone().setY(0.8), 'fluff', 2, 0.6); } }
  if (miniPile) { ST.t -= dt; if (ST.t <= 0) { ST.t = 2.4 * Math.pow(0.9, lv('pres')) * UB(); if (!miniPile.full()) { const o = makeItem('base'); scene.add(o); o.position.copy(miniPile.slot(miniPile.n)); o.scale.setScalar(0.01); miniPile.items.push(o); popIn(o); ST.hit = 1; fxBurst(new THREE.Vector3(1.65, 2.3, 7.6), 'puff', 2, 0.5); } } ST.lamp.material.emissiveIntensity = 0.3 + ST.hit * 2.2; ST.hit = Math.max(0, ST.hit - dt * 3); ST.pis.position.y = 1.7 - Math.sin(ST.hit * Math.PI) * 0.3; ST.gear.rotation.z += dt * (miniPile.full() ? 0.5 : 4); }
  if (pressPile) { prT -= dt; if (prT <= 0) { prT = 1.6 * Math.pow(0.85, lv('pres')) / (1 + (Math.max(1, asm.length) - 1) * 0.6) * UB(); if (!pressPile.full()) { const o = makeItem('base'); scene.add(o); o.position.copy(pressPile.slot(pressPile.n)); o.scale.setScalar(0.01); pressPile.items.push(o); popIn(o); stationsAnim.press.userData.hit = 1; } }
  const ph = stationsAnim.press.userData; ph.hit = Math.max(0, (ph.hit || 0) - dt * 4); ph.pis.position.y = 3.5 - Math.sin(ph.hit * Math.PI) * 0.6; }
  for (const C of K) C.pile.max = 12 + lv('tez') * 4;
  for (const A of asm) { A.t -= dt; const work = A.inF.length > 0 && A.inB > 0 && !A.out.full();
    if (work && A.t <= 0) { A.t = 1.4 * Math.pow(0.85, lv('mont')) * UB(); const col = A.inF.shift(); A.inB--; const it = makeItem('toy', col); scene.add(it); it.position.set(A.x, 1.2, A.z); const to = A.out.slot(A.out.n); A.out.items.push(it); fly(it, it.position, to, 0.4); SFX.pop(); syncBuf(A); }
    A.arm.rotation.z = work ? Math.sin(T * 8) * 0.4 : 0; A.a2.rotation.x = 1.3 + (work ? Math.sin(T * 12) * 0.3 : 0); A.arm2a.rotation.z = work ? Math.sin(T * 8 + 1.5) * 0.4 : 0; }
  if (TS) stepTest(dt, T); stepAct(dt, T);
  if (OF) { const o = near(new THREE.Vector3(8.4, 0, -3.6), 2.6) ? 0.2 : Math.PI / 2; OF.door.rotation.y += (o - OF.door.rotation.y) * Math.min(1, dt * 6); }
  if (rubberPile) { TM.rt -= dt; if (TM.rt <= 0) { TM.rt = 1.8 * Math.pow(0.85, lv('pres')) * UB(); if (!rubberPile.full()) { const o = makeItem('rubber'); scene.add(o); o.position.copy(rubberPile.slot(rubberPile.n)); o.scale.setScalar(0.01); rubberPile.items.push(o); popIn(o); } }
    TM.t -= dt; const work = TM.inR > 0 && !TM.out.full(); TM.ball.rotation.y += dt * (work ? 8 : 0.5); TM.ball.rotation.x += dt * (work ? 5 : 0);
    if (work && TM.t <= 0) { TM.t = 2.0 * Math.pow(0.85, lv('mont')) * UB(); TM.inR--; const it = makeItem('top'); scene.add(it); it.position.set(TM.x, 1.8, TM.z); const to = TM.out.slot(TM.out.n); TM.out.items.push(it); fly(it, it.position, to, 0.45); SFX.pop(); } }
  if (GS) { GS.t -= dt; GS.roll.rotation.x += dt * (GS.inV.length >= 3 ? 6 : 0); if (GS.inV.length >= 3 && !GS.out.full() && GS.t <= 0) { GS.t = 2.2; const vs = GS.inV.splice(0, 3); const it = makeItem('gift', 'dogal', Math.round(vs.reduce((a, b) => a + b.v, 0) * PROD.giftMult)); scene.add(it); it.position.set(18.5, 1.3, 2.5); const to = GS.out.slot(GS.out.n); GS.out.items.push(it); fly(it, it.position, to, 0.45); SFX.chime && SFX.chime(4); syncGift(); } }
  stepConveyor(dt); stepTruck(dt); stepSmoke(dt);
  P.tick -= dt; if (P.tick <= 0) { P.tick = 0.09; interact(); }
  for (const o of padObjs) { const p = o.p; if (near(new THREE.Vector3(p.x, 0, p.z), p.big ? 1.6 : 1.3) && SV.money >= 1) { o.t -= dt; if (o.t <= 0) { o.t = 0.05; const step = Math.min(Math.floor(SV.money), Math.max(1, Math.ceil(p.cost / 40)), p.cost - o.paid); SV.money -= step; o.paid += step; SV.paid[p.id] = o.paid; SFX.tick(); o.mesh.material.map = padTex(p, o.paid); if (o.paid >= p.cost) { unlock(p); break; } } } }
  for (const tk of turkeys) { tk.wait -= dt; const d = tk.tgt.clone().sub(tk.o.position); const dist = d.length();
    if (tk.wait <= 0 && dist > 0.1) { d.normalize(); tk.o.position.addScaledVector(d, dt * 1.2); tk.o.rotation.y = Math.atan2(d.x, d.z); tk.o.userData.body.position.y = Math.abs(Math.sin(T * 9)) * 0.05; }
    else if (dist <= 0.1) { tk.tgt = tk.pen ? penPos() : tkPos(); tk.wait = rnd(1, 3); }
    tk.peck = Math.max(0, tk.peck - dt * 1.5); tk.o.userData.body.rotation.x = Math.sin(tk.peck * Math.PI * 3) * 0.35 + (tk.wait > 0 ? Math.max(0, Math.sin(T * 3 + tk.o.position.x)) * 0.25 : 0); }
  for (const W of workers) stepWorker(W, dt);
  cashiers.forEach((c, i) => { c.H.body.position.y = Math.abs(Math.sin(T * 2 + i)) * 0.03; });
  stepBelt(dt); stepRecycle(dt); stepPlush(dt, T); stepRobots(dt, T);
  if (PR2) { PR2.t -= dt; if (PR2.t <= 0) { PR2.t = 1.6 * Math.pow(0.85, lv('pres')) * UB() / 1.4; if (!pressPile2.full()) { const o = makeItem('base'); scene.add(o); o.position.copy(pressPile2.slot(pressPile2.n)); o.scale.setScalar(0.01); pressPile2.items.push(o); popIn(o); PR2.press.userData.hit = 1; } } const h = PR2.press.userData; h.hit = Math.max(0, (h.hit || 0) - dt * 4); h.pis.position.y = 3.5 - Math.sin(h.hit * Math.PI) * 0.6; }
  bigFlix.rotation.y = T * 0.6; bigFlix.position.y = 0.85 + Math.sin(T * 2) * 0.08;
  decoSpin.forEach((f, i) => f.rotation.y = T * (0.8 + i * 0.2)); decoBob.forEach(b => b.position.y = 2.6 + b.userData.bob * 0.3 + Math.sin(T * 1.6 + b.userData.bob) * 0.12);
}
function syncBuf(A) { A.bufObjs.forEach(o => scene.remove(o)); A.bufObjs = [];
  for (let k = 0; k < Math.min(A.inB, 6); k++) { const o = makeItem('base'); o.position.set(A.x - 1.0 + (k % 3) * 0.5, 1.12, A.z + 0.5 - (k >= 3 ? 0.45 : 0)); scene.add(o); A.bufObjs.push(o); }
  for (let k = 0; k < Math.min(A.inF.length, 6); k++) { const o = makeItem('feather', A.inF[k]); o.position.set(A.x + 0.2 + (k % 3) * 0.4, 1.13 + Math.floor(k / 3) * 0.1, A.z + 0.45); scene.add(o); A.bufObjs.push(o); } }
function dropTo(A, o) { const t = o.userData.type, col = o.userData.col; fly(o, o.position, new THREE.Vector3(A.x - 0.6, 1.2, A.z), 0.25, () => { scene.remove(o); if (t === 'feather') A.inF.push(col); else A.inB++; syncBuf(A); }); }
function dropTest(o) { fly(o, o.position, new THREE.Vector3(6.55, 1.2, 1.8), 0.25, () => { scene.remove(o); TS.q.push(o); syncTestQ(); }); }
function dropTop(o) { fly(o, o.position, new THREE.Vector3(TM.x - 1.0, 1.6, TM.z), 0.25, () => { scene.remove(o); TM.inR++; }); }
function dropGift(o) { fly(o, o.position, new THREE.Vector3(18.0, 1.3, 2.8), 0.25, () => { scene.remove(o); GS.inV.push({ v: o.userData.v || 5, col: o.userData.col }); syncGift(); }); }
const untested = (o) => (o.userData.type === 'toy' || o.userData.type === 'top') && !o.userData.ok;
const tested = (o) => isProd(o) && o.userData.ok;
function interact() {
  const cap = capOf();
  for (const pile of allCash()) if (pile && near(pile.pos, 1.8) && pile.n) { for (let k = 0; k < 3 && pile.n; k++) { const o = pile.pop(); const v = o.userData.v || 5; fly(o, o.position, P.o.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.25, () => { scene.remove(o); SV.money += v; bumpMoney(); }); } if (Math.random() < 0.5) fxBurst(P.o.position.clone().setY(1.8), 'coin', 2, 0.5); SFX.coin(); haptic(8); return; }
  for (const A of asm) if (near(A.inZone, 1.5)) { // each table keeps up to 20 of each; it takes what it is shorter of first
    const hf = P.stack.some(x => x.userData.type === 'feather') && A.inF.length < 20, hb = P.stack.some(x => x.userData.type === 'base') && A.inB < 20;
    const T = hf && hb ? (A.inF.length <= A.inB ? 'feather' : 'base') : hf ? 'feather' : hb ? 'base' : null; const o = T && stackPop(x => x.userData.type === T); if (o) { dropTo(A, o); SFX.drop(); return; } }
  if (TM && near(TM.inZone, 1.5)) { const o = stackPop(x => x.userData.type === 'rubber'); if (o) { dropTop(o); SFX.drop(); return; } }
  if (TS && near(TS.inZone, 1.5) && TS.q.length < 16) { const o = stackPop(untested); if (o) { dropTest(o); SFX.drop(); return; } }
  if (GS && near(GS.inZone, 1.5) && GS.inV.length < 9) { const o = stackPop(x => x.userData.type === 'toy' && x.userData.ok); if (o) { dropGift(o); SFX.drop(); return; } }
  if (P.act) return;
  for (const C of K) if (near(C.zone, 1.7) && !C.pile.full()) { const u = stackPop(untested); if (u) { startTest(u, C); return; }
    const f = P.stack.find(o => o.userData.type === 'feather'), b = P.stack.find(o => o.userData.type === 'base'); if (f && b) { stackPop(o => o === f); stackPop(o => o === b); startBuild(f, b, C); return; } }
  for (const C of K) if (near(C.zone, 1.7) && !C.pile.full()) { const o = stackPop(tested); if (o) { C.pile.push(o, o.position); SV.del = 1; SFX.drop(); return; } }
  if (RC && near(RC.inZone, 1.5)) { const o = stackPop(x => x.userData.type === 'reject'); if (o) { dropRecycle(o); SFX.drop(); return; } }
  if (PL && near(PL.inZone, 1.5) && PL.inF.length < 12) { const o = stackPop(x => x.userData.type === 'feather'); if (o) { dropPlush(o); SFX.drop(); return; } }
  if (TR && TR.state === 'dock' && near(TR.zone, 1.8) && TR.load.length < truckCap()) { const o = stackPop(tested); if (o) { loadTruck(o); return; } }
  if (P.stack.length >= cap) return;
  const hasProd = P.stack.some(isProd), hasRaw = P.stack.some(isRaw);
  if (!hasProd) for (const pile of [penPile, miniPile, farmPile, farmPile2, pressPile, pressPile2, rubberPile]) if (pile && near(pile.zone, 1.6) && pile.n && !(pile !== rubberPile && P.stack.filter(o => o.userData.type === pile.type).length >= Math.ceil(cap / 2))) { if (pile.type === 'feather') fxBurst(pile.pos.clone().setY(1.0), 'fluff', 2, 0.7); stackPush(pile.pop()); SFX.pick(); haptic(6); return; }
  if (!hasRaw) for (const pile of asm.map(a => a.out).concat(TM ? [TM.out] : [], TS ? [TS.out, REJ] : [], GS ? [GS.out] : [], RC ? [RC.out] : [], PL ? [PL.out] : [])) if (near(pile.zone, 1.6) && pile.n) { stackPush(pile.pop()); SFX.pick(); haptic(6); return; }
}
// ---- the hero does the work by hand at the stand: build + box, then kick-test, then place it ----
const handPos = () => P.o.position.clone().add(new THREE.Vector3(Math.sin(P.o.rotation.y) * 0.7, 1.15, Math.cos(P.o.rotation.y) * 0.7));
function startBuild(f, b, C) { const hp = handPos(); fly(f, f.position, hp, 0.22); fly(b, b.position, hp.clone().setY(1.0), 0.22); P.act = { kind: 'build', f, b, col: f.userData.col, C, t: 0, dur: 0.85 * Math.pow(0.9, lv('mont')) * (bonusOn('uret') ? 0.6 : 1) }; SFX.drop(); }
function startTest(o, C) { P.act = { kind: 'test', o, C, t: 0, kd: 0.34 * Math.pow(0.92, lv('test')) * (bonusOn('uret') ? 0.6 : 1), n: 0 }; o.scale.setScalar(0.75); }
function stepAct(dt, T) { const A = P.act; if (!A) return; A.t += dt;
  if (A.kind === 'build') { const hp = handPos(); const hi = Math.floor(A.t / 0.15); if (A.t > 0.25 && hi !== A.h) { A.h = hi; fxBurst(hp, 'spark', 3, 0.55); } if (A.t > 0.25) { A.f.position.copy(hp).add(new THREE.Vector3(0, Math.sin(T * 30) * 0.05, 0)); A.b.position.copy(hp).setY(1.0); A.f.rotation.y += dt * 9; }
    if (A.t >= A.dur) { scene.remove(A.f); scene.remove(A.b); const toy = makeItem('toy', A.col); scene.add(toy); toy.position.copy(hp); popIn(toy); SFX.pop(); fxBurst(hp, 'puff', 6, 1); fxBurst(hp, 'star', 4, 0.8); floatText('Kuruldu · kutulandı', '#ffffff'); startTest(toy, A.C); } }
  else if (A.kind === 'test') { const e = (A.t / A.kd) % 1, base = P.o.position; A.o.position.set(base.x + Math.sin(P.o.rotation.y) * 0.45, 0.6 + Math.sin(e * Math.PI) * 1.9, base.z + Math.cos(P.o.rotation.y) * 0.45); A.o.rotation.y += dt * 8;
    if (A.t >= A.kd * (A.n + 1)) { A.n++; SFX.pop(); fxBurst(A.o.position, 'puff', 3, 0.6); if (A.n >= 3) { const o = A.o; o.rotation.set(0, 0, 0); o.scale.setScalar(1); markTested(o); popSprite('ok', base.clone().add(new THREE.Vector3(0, 3.2, 0))); fxBurst(base.clone().add(new THREE.Vector3(0, 2.4, 0)), 'star', 8, 1); SFX.chime && SFX.chime(2); P.act = null; SV.del = 1;
        if (!A.C.pile.full()) A.C.pile.push(o, o.position); else stackPush(o); haptic(10); } } } }
function actPose(T) { const A = P.act; if (A.kind === 'build') { const h = Math.sin(T * 22); pose(H, { kickL: 0, kickR: 0, kneeL: 0.25, kneeR: 0.25, armL: [-1.3 + h * 0.35, 0.2, -0.3], armR: [-1.3 - h * 0.35, 0.2, -0.3] }); H.body.position.y = Math.abs(h) * 0.03; }
  else { const e = (A.t / A.kd) % 1, k = Math.max(0, 1 - Math.min(e, 1 - e) * 6); pose(H, { kickL: 0, kickR: k * 1.3, kneeL: 0.2, kneeR: 0.2 + k * 0.4, armL: [0.3, 0.6, -0.4], armR: [0.3, 0.6, -0.4] }); H.body.position.y = 0; } }
// ---- worker AI: picks the most useful job each round ----
function wTake(W, o) { W.stack.push(o); W.hold.attach(o); o.scale.setScalar(1 / 0.68); o.rotation.set(0, 0, 0); let h = 0; W.stack.forEach(s => { s.position.set(0, h / 0.68, 0); h += hOf(s); }); }
function wDrop(W) { const o = W.stack.pop(); const w = o.getWorldPosition(new THREE.Vector3()); scene.add(o); o.position.copy(w); o.scale.setScalar(1); o.rotation.set(0, 0, 0); return o; }
// ---------- navigation grid + A* so workers walk around machines like the player would ----------
const NAV = { cs: 0.5, x0: 0, z0: 0, nx: 0, nz: 0, g: null, dirty: true };
function navBuild() { const cs = NAV.cs; NAV.x0 = BOUNDS.x0; NAV.z0 = BOUNDS.z0; NAV.nx = Math.ceil((BOUNDS.x1 - BOUNDS.x0) / cs) + 1; NAV.nz = Math.ceil((BOUNDS.z1 - BOUNDS.z0) / cs) + 1; NAV.g = new Uint8Array(NAV.nx * NAV.nz); const r = 0.5;
  for (let j = 0; j < NAV.nz; j++) for (let i = 0; i < NAV.nx; i++) { const x = NAV.x0 + i * cs, z = NAV.z0 + j * cs; let b = x < BOUNDS.x0 + 0.5 || x > BOUNDS.x1 - 0.5 || z < BOUNDS.z0 + 0.5 || z > BOUNDS.z1 ? 1 : 0;
    if (!b) for (const c of colliders) if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) { b = 1; break; } NAV.g[j * NAV.nx + i] = b; } NAV.dirty = false; }
const navI = (x) => Math.max(0, Math.min(NAV.nx - 1, Math.round((x - NAV.x0) / NAV.cs))), navJ = (z) => Math.max(0, Math.min(NAV.nz - 1, Math.round((z - NAV.z0) / NAV.cs)));
function navFree(k) { if (!NAV.g[k]) return k; const i0 = k % NAV.nx, j0 = (k / NAV.nx) | 0; for (let r = 1; r < 8; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { const i = i0 + di, j = j0 + dj; if (i < 0 || j < 0 || i >= NAV.nx || j >= NAV.nz) continue; const q = j * NAV.nx + i; if (!NAV.g[q]) return q; } return k; }
function navLos(ax, az, bx, bz) { const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.25); for (let k = 1; k < n; k++) { const t = k / n; if (NAV.g[navJ(az + (bz - az) * t) * NAV.nx + navI(ax + (bx - ax) * t)]) return false; } return true; }
function navPath(sx, sz, tx, tz) {
  if (NAV.dirty || !NAV.g) navBuild(); const { nx, nz, g, cs } = NAV, N = nx * nz;
  const s = navFree(navJ(sz) * nx + navI(sx)), t = navFree(navJ(tz) * nx + navI(tx)); const end = new THREE.Vector3(tx, 0, tz);
  if (navLos(sx, sz, tx, tz)) return [end];
  const gs = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N); const heap = [];
  const hx = t % nx, hz = (t / nx) | 0, h = (k) => { const dx = Math.abs(k % nx - hx), dz = Math.abs(((k / nx) | 0) - hz); return (dx + dz) + (1.414 - 2) * Math.min(dx, dz); };
  const push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  gs[s] = 0; push(s, h(s)); let it = 0;
  while (heap.length && it++ < 20000) { const [, k] = pop(); if (k === t) break; if (closed[k]) continue; closed[k] = 1; const i = k % nx, j = (k / nx) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue; const q = jj * nx + ii; if (g[q] || closed[q]) continue;
      if (di && dj && (g[j * nx + ii] || g[jj * nx + i])) continue; const ng = gs[k] + (di && dj ? 1.414 : 1); if (ng < gs[q]) { gs[q] = ng; came[q] = k; push(q, ng + h(q)); } } }
  if (came[t] < 0 && s !== t) return [end];
  const cells = []; for (let k = t; k !== s && k >= 0; k = came[k]) cells.push(k); cells.reverse();
  const pts = cells.map(k => new THREE.Vector3(NAV.x0 + (k % nx) * cs, 0, NAV.z0 + ((k / nx) | 0) * cs)); pts.push(end);
  // string pulling: keep only the corners we really need
  const out = []; let ax = sx, az = sz, i = 0;
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !navLos(ax, az, pts[j].x, pts[j].z)) j--; out.push(pts[j]); ax = pts[j].x; az = pts[j].z; i = j + 1; }
  return out;
}
// ---------- worker jobs ----------
// Roles repeat every 4 workers: seller, line operator, two feeders. With one worker it does everything.
const ROLES = ['sell', 'line', 'feed', 'feed', 'sell', 'line', 'feed', 'all'];
function claimed(pile, me) { let n = 0; for (const O of workers) if (O !== me && O.task && O.si < O.task.src.length && O.task.src[O.si] === pile) n += Math.max(1, O.task.max - O.stack.length); return n; }
const avail = (pile, me) => pile ? pile.n - claimed(pile, me) : 0;
function pickTask(W) {
  const cap = wcap(), n = workers.length, role = n < 2 ? 'all' : n === 2 && W.id === 1 ? 'mix' : ROLES[W.id % 8];
  const truckOk = TR && TR.state === 'dock' && TR.load.length < truckCap(), gp = W.H.g.position;
  const freeK = () => K.filter(C => !C.pile.full()).sort((a, b) => a.pile.n - b.pile.n || Math.abs(a.x - gp.x) - Math.abs(b.x - gp.x))[0];
  const sell = () => { const src = [TS && TS.out, GS && GS.out, RC && RC.out, PL && PL.out].filter(p => p && avail(p, W) > 0).sort((a, b) => b.n - a.n)[0]; if (!src) return null;
    W.alt = !W.alt; const C = freeK(); if (truckOk && (!C || (W.alt && (C.pile.n >= 2 || W.id % 2)))) return { src: [src], dst: 'truck', max: cap }; if (C) return { src: [src], dst: 'counter', C, max: cap }; return null; };
  const test = () => { if (!TS) return null; const outs = (konv ? asm.slice(2) : asm).map(a => a.out).concat(TM ? [TM.out] : []).filter(p => avail(p, W) > 0).sort((a, b) => b.n - a.n);
    return outs.length && TS.q.length < 10 ? { src: [outs[0]], dst: 'test', max: cap } : null; };
  const reject = () => RC && avail(REJ, W) > 0 && RC.vals.length < 6 ? { src: [REJ], dst: 'recycle', max: cap } : null;
  const gift = () => GS && TS && GS.inV.length < 3 && (TS.out.n >= 2 || GS.inV.length > 0) && avail(TS.out, W) > 0 ? { src: [TS.out], dst: 'gift', max: Math.min(cap, 3 - GS.inV.length), only: 'toy' } : null;
  const top = () => TM && avail(rubberPile, W) > 0 && TM.inR < 4 ? { src: [rubberPile], dst: 'top', max: cap } : null;
  const crate = () => [farmPile, farmPile2, penPile].filter(p => p && avail(p, W) > 0).sort((a, b) => b.n - a.n)[0];
  const plush = () => { const c = crate(); return PL && c && PL.inF.length < 6 && !workers.some(X => X !== W && X.task && X.task.dst === 'plush') ? { src: [c], dst: 'plush', max: Math.min(cap, 6 - PL.inF.length) } : null; };
  const press = () => [pressPile, pressPile2, miniPile].filter(p => p).sort((a, b) => avail(b, W) - avail(a, W) || a.zone.distanceTo(gp) - b.zone.distanceTo(gp))[0];
  const feed = () => { const f = asm.reduce((a, A) => a + A.inF.length, 0), b = asm.reduce((a, A) => a + A.inB, 0); if (f + b >= asm.length * 14) return null; const c = crate(), pp = press(); if (!pp || !asm.length) return null;
    if (f > b + 2 && avail(pp, W) > 0) return { src: [pp], dst: 'asm', max: cap }; if (b > f + 2 && c) return { src: [c], dst: 'asm', max: cap }; if (!c && !pp.n) return null; return { src: [c || farmPile, pp], dst: 'asm', max: cap, half: true }; };
  const order = { all: [sell, test, reject, top, gift, plush, feed], sell: [sell, test, reject, gift, feed], line: [gift, reject, test, top, plush, sell, feed], mix: [feed, test, top, sell, reject, plush], feed: [feed, plush, test, top, sell, reject] }[role];
  for (const f of order) { const t = f(); if (t) return t; }
  return null;
}
function stepWorker(W, dt) {
  const g = W.H.g; let tgt = null;
  const at = (p, r) => { if (Math.hypot(g.position.x - p.x, g.position.z - p.z) < r) { W.ai -= dt; if (W.ai <= 0) { W.ai = 0.12; return true; } } return false; };
  if (!W.task) { W.wait -= dt; if (W.wait <= 0) { W.task = pickTask(W); W.si = 0; W.pw = 0; W.path = null; if (!W.task) W.wait = 0.35; } }
  const T = W.task;
  if (T && W.si < T.src.length) { const pile = T.src[W.si]; tgt = pile.zone; const lim = T.half && W.si === 0 ? Math.ceil(T.max / 2) : T.max;
    if (at(tgt, 1.2)) { if (pile.n && W.stack.length < lim && (!T.only || pile.items[pile.n - 1].userData.type === T.only)) { wTake(W, pile.pop()); W.pw = 0; } else { W.pw += 0.12; if (W.stack.length >= lim || W.pw > 1.5) { W.si++; W.pw = 0; W.path = null; } } } }
  else if (T) { if (!W.stack.length) { W.task = null; W.wait = 0.1; }
    else { let A = null; if (T.dst === 'asm') { if (!W.A) { const nb = W.stack.filter(o => o.userData.type === 'base').length, nf = W.stack.length - nb, need = (X) => Math.max(0, X.inF.length - X.inB) * nb + Math.max(0, X.inB - X.inF.length) * nf - (X.inF.length + X.inB) * 0.3 - X.inZone.distanceTo(g.position) * 0.05; W.A = asm.reduce((a, b) => need(b) > need(a) ? b : a, asm[W.id % asm.length]); } A = W.A; }
      if (T.dst === 'counter' && (!T.C || T.C.pile.full())) T.C = K.filter(C => !C.pile.full()).sort((a, b) => a.pile.n - b.pile.n)[0] || T.C || K[0];
      tgt = T.dst === 'counter' ? T.C.zone : T.dst === 'truck' ? TR.zone : T.dst === 'test' ? TS.inZone : T.dst === 'top' ? TM.inZone : T.dst === 'gift' ? GS.inZone : T.dst === 'recycle' ? RC.inZone : T.dst === 'plush' ? PL.inZone : A.inZone;
      if (at(tgt, 1.25)) { if (T.dst === 'counter') { if (!T.C.pile.full()) { const o = wDrop(W); T.C.pile.push(o, o.position); } else if (TR && TR.state === 'dock') T.dst = 'truck'; }
        else if (T.dst === 'truck') { if (TR.state === 'dock' && TR.load.length < truckCap()) loadTruck(wDrop(W)); else { T.dst = 'counter'; T.C = null; } }
        else if (T.dst === 'test') dropTest(wDrop(W)); else if (T.dst === 'gift') { if (GS.inV.length < 3) dropGift(wDrop(W)); else { T.dst = 'counter'; T.C = null; } } else if (T.dst === 'top') dropTop(wDrop(W));
        else if (T.dst === 'recycle') dropRecycle(wDrop(W)); else if (T.dst === 'plush') { if (PL.inF.length < 12) dropPlush(wDrop(W)); else { T.dst = 'asm'; } } else dropTo(A, wDrop(W));
        if (!W.stack.length) { W.task = null; W.A = null; W.wait = 0.05; W.path = null; } } } }
  if (!tgt) { W.spd = 0; idleLook(W, dt); animWalk(W.H, 0, false, W.stack.length > 0); return; }
  walkTo(W, tgt, dt);
}
function idleLook(W, dt) { const g = W.H.g, d = P.o.position.clone().sub(g.position); const ang = Math.atan2(d.x, d.z); let da = ang - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 3); }
// walk like the player: follow the A* path, accelerate, turn smoothly, re-plan when blocked
function walkTo(W, tgt, dt) {
  const g = W.H.g, p = g.position, maxSp = 5.4 * (1 + lv('wspd') * 0.12 + cosB().ws) * (bonusOn('hiz') ? 1.5 : 1);
  if (!W.path || !W.ptgt || Math.hypot(W.ptgt.x - tgt.x, W.ptgt.z - tgt.z) > 0.3) { W.path = navPath(p.x, p.z, tgt.x, tgt.z); W.ptgt = tgt.clone(); W.pi = 0; W.stuck = 0; }
  let wp = W.path[W.pi]; while (wp && W.pi < W.path.length - 1 && Math.hypot(wp.x - p.x, wp.z - p.z) < 0.45) wp = W.path[++W.pi];
  const dx = wp.x - p.x, dz = wp.z - p.z, dist = Math.hypot(dx, dz), last = W.pi === W.path.length - 1, arrive = last && Math.hypot(tgt.x - p.x, tgt.z - p.z) < 0.85;
  if (arrive) { W.spd = Math.max(0, (W.spd || 0) - dt * 30); animWalk(W.H, W.walk, false, W.stack.length > 0); return; }
  const want = Math.min(maxSp, last ? 1.5 + dist * 2.5 : maxSp); W.spd = Math.min(want, (W.spd || 0) + dt * maxSp * 5);
  const ang = Math.atan2(dx, dz); let da = ang - g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); g.rotation.y += da * Math.min(1, dt * 12);
  const turnSlow = Math.max(0.35, 1 - Math.abs(da) / 2.2); const ox = p.x, oz = p.z; const mv = W.spd * turnSlow * dt;
  let r = resolve(p.x + dx / (dist || 1) * mv, p.z + dz / (dist || 1) * mv);
  // gentle separation from other workers and the player so nobody walks inside someone else
  for (const O of workers) if (O !== W) { const ex = r.x - O.H.g.position.x, ez = r.z - O.H.g.position.z, dd = Math.hypot(ex, ez); if (dd < 0.7 && dd > 0.001) { const k = (0.7 - dd) * 0.35 / dd; r = resolve(r.x + ex * k, r.z + ez * k); } }
  p.x = r.x; p.z = r.z; const moved = Math.hypot(p.x - ox, p.z - oz);
  if (moved < mv * 0.3) { W.stuck = (W.stuck || 0) + dt; if (W.stuck > 0.6) { W.path = null; W.stuck = 0; W.stuckN = (W.stuckN || 0) + 1; } } else W.stuck = 0;
  W.walk = (W.walk || 0) + dt * 11 * Math.min(1.2, W.spd / 5); animWalk(W.H, W.walk, W.spd > 0.4, W.stack.length > 0);
}
function animWalk(h, w, moving, carry) { const s = moving ? Math.sin(w) : 0; pose(h, { kickL: s * 0.6, kickR: -s * 0.6, kneeL: 0.2 + Math.max(0, -s) * 0.6, kneeR: 0.2 + Math.max(0, s) * 0.6, armL: carry ? [-1.25, 0.15, -0.3] : [s * 0.5, 0.25, -0.4], armR: carry ? [-1.25, 0.15, -0.3] : [-s * 0.5, 0.25, -0.4] }); h.body.position.y = moving ? Math.abs(Math.cos(w)) * 0.06 : 0; }
let moneyBump = 0; export function bumpMoney() { moneyBump = 1; }

// ---------------- loop ----------------
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth / innerHeight < 0.6 ? 46 : 34; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);
let last = performance.now(), saveT = 0, minT = 60, shownMoney = SV.money, hudT = 0, paused = false;
export function setPaused(p) { paused = p; last = performance.now(); }
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); SFX.suspend(true); } else { SFX.suspend(false); last = performance.now(); } });
let SIM = 1; const sunAt = new THREE.Vector3(1e9, 0, 0);
function stepTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t += dt / tw.dur; const e = Math.min(1, tw.t);
    if (tw.scale) tw.obj.scale.setScalar(Math.max(0.01, (1 + Math.sin(e * Math.PI) * 0.25) * e));
    else { tw.obj.position.lerpVectors(tw.from, tw.to, e); tw.obj.position.y += Math.sin(e * Math.PI) * tw.arc; }
    if (e >= 1) { if (tw.scale) tw.obj.scale.setScalar(1); tweens.splice(i, 1); tw.onEnd && tw.onEnd(); } }
}
const camOff = new THREE.Vector3(0, 24, 16), camLook = new THREE.Vector3(), camGoal = new THREE.Vector3(); let camSettle = 0;
export let inMenu = false; let menuT = 0; export function setMenu(on) { inMenu = on; joy.x = joy.y = 0; if (!on) { camSettle = 1.2; camGoal.set(P.o.position.x * 0.85, 0, P.o.position.z - 1.5); } }
function frame(now) {
  requestAnimationFrame(frame); if (paused || document.hidden) { last = now; return; } const dt = Math.min(0.05, (now - last) / 1000); last = now; if (BOT) return; const T = now / 1000; tick(dt, T); renderer.render(scene, camera); }
let BOT = false, botT = 0;
function tick(dt, T) {
  let ix = inMenu ? 0 : joy.x, iz = inMenu ? 0 : joy.y; if (keys.ArrowLeft || keys.a) ix = -1; if (keys.ArrowRight || keys.d) ix = 1; if (keys.ArrowUp || keys.w) iz = -1; if (keys.ArrowDown || keys.s) iz = 1;
  const mag = Math.min(1, Math.hypot(ix, iz)); const moving = mag > 0.12;
  if (moving) { const sp = P.speed * (1 + spdPct(lv('spd')) / 100 + cosB().spd) * (bonusOn('hiz') ? 1.5 : 1) * mag; const nx = P.o.position.x + ix / Math.hypot(ix, iz) * sp * dt, nz = P.o.position.z + iz / Math.hypot(ix, iz) * sp * dt; const p = resolve(nx, nz); P.o.position.x = p.x; P.o.position.z = p.z;
    const ang = Math.atan2(ix, iz); let da = ang - P.o.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); P.o.rotation.y += da * Math.min(1, dt * 14); P.walk += dt * 13 * mag;
    { dustT -= dt; if (dustT <= 0) { dustT = lv('spd') >= 2 ? 0.1 : 0.18; const m = new THREE.Mesh(dustGeo, dustMat.clone()); m.position.copy(P.o.position).setY(0.15); scene.add(m); dust.push({ m, t: 0 }); } } }
  if (P.act && !moving) actPose(T); else animWalk(H, P.walk, moving, P.stack.length > 0);
  P.stack.forEach((o, i) => { o.rotation.z = Math.sin(T * 6 + i * 0.3) * 0.02 * i * (moving ? 1 : 0.3); });
  for (let k = 0; k < SIM; k++) { stepWorld(dt, T + k * dt); stepCustomers(dt); stepTweens(dt); }
  stepTutorial(); stepZones(T); stepFlags(T); stepBoostDrop(dt, T);
  for (let i = confettiBits.length - 1; i >= 0; i--) { const c = confettiBits[i]; c.t += dt; c.v.y -= 18 * dt; c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.r.x * dt; c.m.rotation.y += c.r.y * dt; if (c.t > 2) { scene.remove(c.m); confettiBits.splice(i, 1); } }
  stepFX(dt); stepRings(dt);
  for (let i = dust.length - 1; i >= 0; i--) { const d = dust[i]; d.t += dt; d.m.scale.setScalar(1 + d.t * 3); d.m.material.opacity = 0.6 * (1 - d.t / 0.5); d.m.position.y += dt * 0.5; if (d.t > 0.5) { scene.remove(d.m); dust.splice(i, 1); } }
  for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt; p.s.scale.setScalar(Math.min(1.2, p.t * 6)); p.s.position.y += dt * 0.8; p.s.material.opacity = p.t > 0.7 ? Math.max(0, 1 - (p.t - 0.7) * 3) : 1; if (p.t > 1.1) { scene.remove(p.s); pops.splice(i, 1); } }
  if (guideTarget) { const d = guideTarget.clone().sub(P.o.position); d.y = 0; const dist = d.length(); arrow.visible = dist > 2.5; beacon.visible = true; beacon.position.set(guideTarget.x, 0.05, guideTarget.z); beacon.scale.setScalar(1 + Math.sin(T * 5) * 0.08);
    arrow.position.copy(P.o.position).addScaledVector(d.normalize(), 1.6); arrow.position.y = 0; arrow.rotation.y = Math.atan2(d.x, d.z) + Math.PI; arrow.children[0].material.opacity = 0.7 + Math.sin(T * 6) * 0.25; }
  else { arrow.visible = false; beacon.visible = false; }
  if (inMenu) { menuT += dt * 0.12; const small = !has('atolye'), cx = has('genis') ? 8 : small ? 2 : 1.5, cz = small ? 12 : -3; camLook.lerp(new THREE.Vector3(cx, 0, cz), Math.min(1, dt * 2)); const R = has('genis') ? 34 : small ? 15 : 28; camera.position.lerp(new THREE.Vector3(cx + Math.sin(menuT) * R * 0.55, small ? 13 : 22, cz + Math.cos(menuT) * R * 0.75), Math.min(1, dt * 2)); camera.lookAt(camLook); }
  else { // calm follow: dead zone around the player + frame-rate independent damping, no double smoothing
    const tx = P.o.position.x * 0.85, tz = P.o.position.z - 1.5, DX = 1.4, DZ = 1.1; const ex = tx - camGoal.x, ez = tz - camGoal.z;
    if (Math.abs(ex) > DX) camGoal.x += ex - Math.sign(ex) * DX; if (Math.abs(ez) > DZ) camGoal.z += ez - Math.sign(ez) * DZ;
    camLook.lerp(camGoal, 1 - Math.exp(-dt * 3.2)); const want = camLook.clone().add(camOff);
    if (camSettle > 0) { camSettle -= dt; camera.position.lerp(want, 1 - Math.exp(-dt * 5)); } else camera.position.copy(want); camera.lookAt(camLook); }
  { const st = 1.0; const sx = Math.round(camLook.x / st) * st, sz = Math.round(camLook.z / st) * st; if (sx !== sunAt.x || sz !== sunAt.z) { sunAt.set(sx, 0, sz); sun.position.copy(sunAt).add(new THREE.Vector3(-9, 22, 8)); sun.target.position.copy(sunAt); } }
  shownMoney += (SV.money - shownMoney) * Math.min(1, dt * 10); $('#money b').textContent = fmt(Math.round(shownMoney)); moneyBump = Math.max(0, moneyBump - dt * 4); $('#money').style.transform = `scale(${1 + Math.sin(moneyBump * Math.PI) * 0.12})`;
  const v = P.o.position.clone().add(new THREE.Vector3(0, 2.9 + P.stack.reduce((a, o) => a + hOf(o), 0) * 0.78, 0)).project(camera);
  P.lbl.style.transform = `translate(${(v.x + 1) / 2 * innerWidth}px,${(1 - v.y) / 2 * innerHeight}px) translate(-50%,-100%)`; P.lbl.textContent = P.stack.length >= capOf() ? 'DOLU' : ''; P.lbl.style.opacity = P.stack.length >= capOf() ? 1 : 0;
  if (pRing) { pRing.position.set(P.o.position.x, 0.06, P.o.position.z); pRing.material.opacity = 0.55 + Math.sin(T * 3) * 0.2; }
  for (let i = floats.length - 1; i >= 0; i--) { const f = floats[i]; f.t += dt; const fv = P.o.position.clone().add(new THREE.Vector3(0, 3.2 + f.t * 1.5, 0)).project(camera); f.el.style.transform = `translate(${(fv.x + 1) / 2 * innerWidth}px,${(1 - fv.y) / 2 * innerHeight}px) translate(-50%,-100%)`; f.el.style.opacity = Math.max(0, 1 - f.t / 1.3); if (f.t > 1.3) { f.el.remove(); floats.splice(i, 1); } }
  hudT -= dt; if (hudT <= 0) { hudT = 0.5; refreshHUD(); }
  minT -= dt; if (minT <= 0) { minT = 60; SV.ipm = SV.ipm ? SV.ipm * 0.7 + earnMin * 0.3 : earnMin; earnMin = 0; }
  saveT -= dt; if (saveT <= 0) { saveT = 4; SV.px = P.o.position.x; SV.pz = P.o.position.z; save(); }
  fpsAcc += dt; fpsN++; fpsT += dt; if (fpsT > 2 && !inMenu) { const avg = fpsAcc / fpsN; fpsAcc = 0; fpsN = 0; fpsT = 0; let nd = dpr; if (avg > 1 / 45 && dpr > 1) nd = Math.max(1, dpr - 0.25); else if (avg < 1 / 58 && dpr < DPR_MAX) nd = Math.min(DPR_MAX, dpr + 0.25); if (nd !== dpr) { dpr = nd; renderer.setPixelRatio(dpr); resize(); } }
}
function resolve(x, z) { x = Math.max(BOUNDS.x0 + 0.5, Math.min(BOUNDS.x1 - 0.5, x)); z = Math.max(BOUNDS.z0 + 0.5, Math.min(BOUNDS.z1, z)); const r = 0.45;
  for (const c of colliders) { if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) { const dl = x - (c.x0 - r), dr = (c.x1 + r) - x, du = z - (c.z0 - r), dd = (c.z1 + r) - z, m = Math.min(dl, dr, du, dd); if (m === dl) x = c.x0 - r; else if (m === dr) x = c.x1 + r; else if (m === du) z = c.z0 - r; else z = c.z1 + r; } }
  return { x, z }; }
(async () => {
  const img = new Image(); img.src = window.FLIX_LOGO; await img.decode().catch(() => {}); LOGO = img;
  const card = (top, bot, txt) => M(0xffffff, { roughness: 0.6, map: tex(256, 320, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = -h; i < w; i += 36) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.lineTo(i + h + 14, 0); c.lineTo(i + 14, h); c.fill(); } if (LOGO) c.drawImage(LOGO, 58, 8, 140, 124); c.fillStyle = '#ffc20e'; c.font = 'italic 900 34px BC'; c.textAlign = 'center'; c.fillText(txt, w / 2, h - 18); }) });
  TOYM.back = card('#ff3a22', '#b01608', 'KICK · FLICK'); TOYM.backTop = card('#2f8fe0', '#123f78', 'FLIX TOP');
  setFloor(SV.cos.floor);
  buildWorld(); buildPlayer(); for (const id of SV.unl) { const p = PADS.find(q => q.id === id); if (p) actPad(p); } spawnStaff(); applyTiers(); { const q = P.o.position; if (q.x < BOUNDS.x0 || q.x > BOUNDS.x1 || q.z < BOUNDS.z0 || q.z > 18.5) q.set(has('atolye') ? 0 : 1.0, 0, has('atolye') ? 3 : 11.5); } stepDecor(false); refreshPads(); syncPatron(false); resize();
  initUI();
  camLook.set(P.o.position.x * 0.85, 0, P.o.position.z - 1.5); camGoal.copy(camLook); camera.position.copy(camLook).add(camOff); requestAnimationFrame(frame); document.body.classList.add('ready');
  offlinePopup();
  window.__fb = { get W() { return workers.map(w => ({ t: w.task && w.task.dst, si: w.si, n: w.stack.length, x: +w.H.g.position.x.toFixed(1), z: +w.H.g.position.z.toFixed(1) })); }, get SV() { return SV; }, get P() { return P; }, setMoney: m => { SV.money = m; }, tp: (x, z) => { P.o.position.set(x, 0, z); camGoal.set(x * 0.85, 0, z - 1.5); camLook.copy(camGoal); },
    get counter() { return counter.n; }, get cash() { return cashPile.n; }, get K() { return K.map(C => [C.pile.n, C.cash.n, C.cust.length]); }, get rej() { return REJ && REJ.n; }, get rc() { return RC && [RC.vals.length, RC.out.n]; }, get pl() { return PL && [PL.inF.length, PL.out.n]; }, get wk() { return workers.map(W => [W.task && W.task.dst, +W.H.g.position.x.toFixed(1), +W.H.g.position.z.toFixed(1), W.stuckN || 0]); }, get act() { return P.act && P.act.kind; }, padPos: (id) => { const o = padObjs.find(q => q.p.id === id); return o ? [o.p.x, o.p.z] : null; }, get asm() { return asm.map(a => [a.inF.length, a.inB, a.out.n]); }, get test() { return TS ? [TS.q.length, testBusy(), TS.out.n] : null; }, get truck() { return TR && [TR.state, TR.load.length, TR.cash.n]; }, get top() { return TM && [rubberPile.n, TM.inR, TM.out.n]; }, get gift() { return GS && [GS.inV.length, GS.out.n]; },
    bot: (on) => { BOT = on; if (on) { botT = performance.now() / 1000; SIM = 1; } }, tick: (n, dt = 0.05) => { for (let i = 0; i < n; i++) { botT += dt; tick(dt, botT); } }, joy: (x, y) => { joy.x = x; joy.y = y; },
    I: () => ({ P, SV, K, asm, TS, REJ, padObjs, penPile, miniPile, farmPile, farmPile2, pressPile, pressPile2, ZONES, cap: capOf(), navPath, lv, has, TM, GS, RC, PL, TR, rubberPile, UPS, SUPS, STAFF }),
    buyUp: (id) => { const u = UPS.concat(SUPS).find(q => q.id === id), l = lv(id), c = Math.round(u.base * Math.pow(u.mult, l)); if (l >= u.max || SV.money < c) return false; SV.money -= c; SV.up[id] = l + 1; applyTiers(); onUpgrade(); return true; },
    hire: (id) => { const s = STAFF.find(q => q.id === id), n = SV.staff[id]; if (n >= s.max || SV.money < s.costs[n]) return false; SV.money -= s.costs[n]; SV.staff[id] = n + 1; spawnStaff(); return true; },
    boostNow: () => { bxT = 0; }, get bx() { return BX && { id: BX.id, x: BX.x, z: BX.z }; },
    get tgt() { const s = TUT[SV.tut]; if (!s) return null; const v = s.tgt(); return [v.x, v.z]; },
    sim: (k) => { SIM = k; }, person: (x, z, kid) => { const o = personMesh(kid); o.position.set(x, 0, z); scene.add(o); }, testQ: (n) => { for (let i = 0; i < n; i++) TS.q.push(makeItem('toy', 'mavi', 8)); syncTestQ(); }, truckLoad: (n) => { for (let i = 0; i < n; i++) TR.load.push(8); },
    get cust() { return customers.length; }, get rob() { return ROB.map(R => [R.st, R.load.length]); }, get ct() { return SV.ct; }, get dpr() { return dpr; }, get ords() { return customers.map(c => c.ord); }, get cdbg() { return K.map(C => C.cust[0] && [C.cust[0].state, +C.cust[0].o.position.x.toFixed(1), +C.cust[0].o.position.z.toFixed(1), C.cust[0].ord, C.cust[0].got, C.cust[0].want, +C.cust[0].pat.toFixed(1), C.x]); }, get turkeys() { return turkeys.length; }, get zone() { return zoneLock; }, zoom: (f) => camOff.multiplyScalar(f), look: (s, a) => { SV.cos.skin = s; SV.cos.acc = a; setLook(); } };
})();
