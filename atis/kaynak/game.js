'use strict';
/* FLIX ATIŞ: pull back, let go, land the FLIX in the bucket. */
const Q = new URLSearchParams(location.search);
const BOT = Q.has('bot');
const $ = (id) => document.getElementById(id);
const NAVY = 0x022753, RED = 0xe22511, YEL = 0xffc20e, INKC = 0x1b1330;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const V3 = THREE.Vector3;

// ---------- save ----------
let SAVE = {lv: {}, fe: 0, snd: 1, seen: 0};
try { Object.assign(SAVE, JSON.parse(localStorage.getItem('flixAtis') || '{}')); } catch (e) {}
function save() { try { localStorage.setItem('flixAtis', JSON.stringify(SAVE)); } catch (e) {} }

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('gl').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 400);
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fitCam(true); }
addEventListener('resize', () => resize());

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

// ---------- sky + light ----------
scene.background = ctex(4, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#86cfe6'); g.addColorStop(0.55, '#d6f0ee'); g.addColorStop(1, '#fde2c6'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
scene.add(new THREE.HemisphereLight(0xe0f4ff, 0xb08a6a, 0.62));
const sun = new THREE.DirectionalLight(0xfff2dc, 1.0); sun.position.set(10, 22, 9); sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536); Object.assign(sun.shadow.camera, {left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70}); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
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

// ---------- levels ----------
// islands: x,z = centre, w,d = size, top = roof height, h = body depth. props sit on the island under them.
const PACK = 'Çatı Katı';
const LEVELS = [
  {name: 'İlk Atış', wind: 0, islands: [{x: 0, z: 0, w: 7, d: 13, top: 2.4, h: 3, par: 1}], start: [0, 4.6], bucket: [0.4, -4.3],
    props: [{t: 'tank', x: -2.2, z: -1.2}, {t: 'chim', x: 2.3, z: 0.8, h: 1.2}, {t: 'plant', x: -2.8, z: 5.7}, {t: 'plant', x: 2.8, z: -5.7}, {t: 'sock', x: 2.7, z: 5.6}]},
  {name: 'Boşluk', wind: 0, islands: [{x: -1.2, z: 3.2, w: 6, d: 7.5, top: 2.4, h: 3, par: 1}, {x: 2.2, z: -6.4, w: 4.4, d: 4.4, top: 2.4, h: 2.4}], start: [-1.6, 5], bucket: [2.4, -6.6],
    props: [{t: 'chim', x: 0.9, z: 1.4, h: 1.4}, {t: 'chim', x: -0.2, z: 0.6, h: 1.0}, {t: 'plant', x: -3.6, z: 6.3}, {t: 'tank', x: -3, z: 1.2}, {t: 'sock', x: 1.2, z: 6.2}]},
  {name: 'Çamaşır İpi', wind: 0, islands: [{x: 0, z: 2.2, w: 7, d: 9, top: 2.4, h: 3, par: 1}, {x: -0.6, z: -7.4, w: 4.6, d: 4.2, top: 2.4, h: 2.6}], start: [0.6, 5.6], bucket: [-0.6, -7.6],
    props: [{t: 'line', x0: -3.1, x1: 3.1, z: 0.4, h: 2.1}, {t: 'chim', x: 2.5, z: -1.4, h: 1.5}, {t: 'plant', x: -2.8, z: 6}, {t: 'plant', x: 2.8, z: 6}, {t: 'crate', x: -2.2, z: -1.6}, {t: 'sock', x: -2.9, z: 3.4}]},
  {name: 'Rüzgârlı Gün', wind: 2.6, islands: [{x: -2.4, z: 3.4, w: 5.4, d: 6.6, top: 2.4, h: 3, par: 1}, {x: 3.6, z: -5.6, w: 3.8, d: 3.8, top: 2.4, h: 2.4}], start: [-2.6, 5.4], bucket: [3.6, -5.8],
    props: [{t: 'chim', x: -0.6, z: 1.2, h: 1.2}, {t: 'tank', x: -4, z: 1.4}, {t: 'plant', x: -4.4, z: 6.2}, {t: 'sock', x: -0.6, z: 6.2}]},
  {name: 'Tente', wind: 0, islands: [{x: 0, z: 3, w: 6.4, d: 7.6, top: 2.4, h: 3, par: 1}, {x: 0.4, z: -6.4, w: 4.4, d: 4.4, top: 6.2, h: 6.2}], start: [0, 5.8], bucket: [0.4, -6.6],
    props: [{t: 'awn', x: 0.2, z: 0.4, w: 2.6, d: 1.8, h: 0.9}, {t: 'plant', x: -2.6, z: 6.3}, {t: 'plant', x: 2.6, z: 6.3}, {t: 'chim', x: -2.2, z: 1, h: 1.3}, {t: 'sock', x: 2.6, z: 1.6}]},
];

// ---------- world building ----------
const tileTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#d8d2c4'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.fillStyle = `hsl(40,${10 + srnd(0, 8)}%,${76 + srnd(0, 8)}%)`; x.fillRect(c * 32 + 1, r * 32 + 1, 30, 30); } });
tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
const brickTex = ctex(256, 256, (x, w, h) => { x.fillStyle = '#e09a72'; x.fillRect(0, 0, w, h); for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { x.fillStyle = `hsl(${18 + srnd(0, 8)},${50 + srnd(0, 10)}%,${60 + srnd(0, 8)}%)`; x.fillRect(c * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14); } });
brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
let world = null, LV = null, boxes = [], bucket = null, stars = [], sock = null;
const BOX = new THREE.BoxGeometry(1, 1, 1);
function addBox(g, mat, x0, x1, y0, y1, z0, z1, col, kind) {
  const m = new THREE.Mesh(BOX, mat); m.scale.set(x1 - x0, y1 - y0, z1 - z0); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; g.add(m);
  if (col !== false) boxes.push({b: [x0, x1, y0, y1, z0, z1], kind: kind || 'hard'});
  return m;
}
function islandAt(x, z) { return LV.islands.find((I) => Math.abs(x - I.x) <= I.w / 2 && Math.abs(z - I.z) <= I.d / 2); }
const starShape = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.17 : 0.4, an = i / 10 * Math.PI * 2 + Math.PI / 2; i ? starShape.lineTo(Math.cos(an) * r, Math.sin(an) * r) : starShape.moveTo(Math.cos(an) * r, Math.sin(an) * r); }
const starGeo = new THREE.ExtrudeGeometry(starShape, {depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2}); starGeo.center();
const starMat = new THREE.MeshStandardMaterial({color: 0xffc20e, emissive: 0xffa000, emissiveIntensity: 0.4, roughness: 0.3});
function buildLevel(i) {
  if (world) scene.remove(world);
  LV = LEVELS[i]; boxes = []; stars = []; world = new THREE.Group(); scene.add(world); seed = 11 + i * 7;
  for (const I of LV.islands) {
    const g = new THREE.Group(); world.add(g);
    const t = tileTex.clone(); t.needsUpdate = true; t.repeat.set(I.w / 2, I.d / 2);
    addBox(g, new THREE.MeshStandardMaterial({map: t, roughness: 0.9}), I.x - I.w / 2, I.x + I.w / 2, I.top - 0.35, I.top, I.z - I.d / 2, I.z + I.d / 2);
    const bt = brickTex.clone(); bt.needsUpdate = true; bt.repeat.set(Math.max(1, I.w / 2.5), Math.max(1, I.h / 2.5));
    addBox(g, new THREE.MeshStandardMaterial({map: bt, roughness: 0.9}), I.x - I.w / 2 + 0.02, I.x + I.w / 2 - 0.02, I.top - 0.35 - I.h, I.top - 0.35, I.z - I.d / 2 + 0.02, I.z + I.d / 2 - 0.02);
    addBox(g, std(0xf4eee2, 0.8), I.x - I.w / 2 - 0.12, I.x + I.w / 2 + 0.12, I.top - 0.05, I.top + 0.08, I.z - I.d / 2 - 0.12, I.z + I.d / 2 + 0.12, false);
    addBox(g, std(0x8a6a50, 1), I.x - I.w * 0.43, I.x + I.w * 0.43, I.top - 0.35 - I.h - 0.8, I.top - 0.35 - I.h, I.z - I.d * 0.43, I.z + I.d * 0.43, false);
    const rock = mesh(new THREE.ConeGeometry(Math.min(I.w, I.d) * 0.42, 3.2, 7), std(0x7a5a46, 1), I.x, I.top - 0.35 - I.h - 0.8 - 1.6, I.z, g, false); rock.rotation.x = Math.PI;
    if (I.par) { const pm = std(0xf4eee2, 0.8), H = I.top + 0.45, x0 = I.x - I.w / 2, x1 = I.x + I.w / 2, z0 = I.z - I.d / 2, z1 = I.z + I.d / 2, T = 0.22;
      addBox(g, pm, x0, x1, I.top, H, z1 - T, z1); addBox(g, pm, x0, x0 + T, I.top, H, z0, z1); addBox(g, pm, x1 - T, x1, I.top, H, z0, z1); }
    ink(g, 0.03);
  }
  for (const P of LV.props) {
    const I = islandAt(P.x, P.z !== undefined ? P.z : 0) || LV.islands[0], top = I.top, g = new THREE.Group(); world.add(g);
    if (P.t === 'chim') { addBox(g, std(0xc0603e, 0.9), P.x - 0.35, P.x + 0.35, top, top + P.h, P.z - 0.35, P.z + 0.35); addBox(g, std(0xf4eee2), P.x - 0.43, P.x + 0.43, top + P.h, top + P.h + 0.15, P.z - 0.43, P.z + 0.43); }
    else if (P.t === 'tank') { mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 20), std(0x9fb8c8, 0.4, 0.5), P.x, top + 1.6, P.z, g); mesh(new THREE.ConeGeometry(0.95, 0.4, 20), std(0x8aa4b4, 0.4, 0.5), P.x, top + 2.5, P.z, g); for (const [a, b] of [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]]) mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6), std(0x445566), P.x + a, top + 0.45, P.z + b, g); boxes.push({b: [P.x - 0.85, P.x + 0.85, top, top + 2.6, P.z - 0.85, P.z + 0.85], kind: 'hard'}); }
    else if (P.t === 'plant') { mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.5, 14), std(0xb85c3c), P.x, top + 0.25, P.z, g); mesh(new THREE.SphereGeometry(0.45, 14, 10), std(0x4a9a4a, 0.9), P.x, top + 0.75, P.z, g); boxes.push({b: [P.x - 0.4, P.x + 0.4, top, top + 1.1, P.z - 0.4, P.z + 0.4], kind: 'soft'}); }
    else if (P.t === 'crate') { addBox(g, std(0xb07a44, 0.85), P.x - 0.5, P.x + 0.5, top, top + 1, P.z - 0.5, P.z + 0.5); }
    else if (P.t === 'line') {
      for (const x of [P.x0, P.x1]) mesh(new THREE.CylinderGeometry(0.045, 0.045, P.h, 6), std(0x445566), x, top + P.h / 2, P.z, g);
      const rope = mesh(new THREE.CylinderGeometry(0.014, 0.014, P.x1 - P.x0, 4), std(0xffffff), (P.x0 + P.x1) / 2, top + P.h - 0.05, P.z, g); rope.rotation.z = Math.PI / 2;
      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = P.x0 + 0.15, k = 0;
      while (x < P.x1 - 0.4) { const w = 0.55 + srnd(0, 0.3), hh = 0.6 + srnd(0, 0.35); addBox(g, std(cols[k++ % cols.length], 0.9), x, x + w, top + P.h - 0.08 - hh, top + P.h - 0.05, P.z - 0.03, P.z + 0.03, false); x += w + 0.12; }
      boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'soft'});
    }
    else if (P.t === 'awn') { // striped awning on posts: a trampoline
      const sTex = ctex(128, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#e22511'; x.fillRect(i * 16, 0, 16, h); } });
      addBox(g, new THREE.MeshStandardMaterial({map: sTex, roughness: 0.7}), P.x - P.w / 2, P.x + P.w / 2, top + P.h, top + P.h + 0.16, P.z - P.d / 2, P.z + P.d / 2, true, 'bounce');
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(new THREE.CylinderGeometry(0.05, 0.05, P.h, 6), std(0x445566), P.x + a * (P.w / 2 - 0.1), top + P.h / 2, P.z + b * (P.d / 2 - 0.1), g);
    }
    else if (P.t === 'sock') { mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6), std(0xffffff), P.x, top + 1, P.z, g); sock = mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.9, 12, 1, true), new THREE.MeshStandardMaterial({color: 0xff6a1a, side: THREE.DoubleSide}), P.x, top + 1.9, P.z, g); sock.userData.base = new V3(P.x, top + 1.9, P.z); }
    ink(g, 0.025);
  }
  // bucket
  const I = islandAt(LV.bucket[0], LV.bucket[1]), bt = I.top;
  const bg = new THREE.Group(); world.add(bg); const bp = []; for (let i = 0; i <= 8; i++) { const k = i / 8; bp.push(new THREE.Vector2(0.62 + k * 0.22, k * 1.0)); }
  mesh(new THREE.LatheGeometry(bp, 28), new THREE.MeshStandardMaterial({color: 0xffc20e, side: THREE.DoubleSide, roughness: 0.5}), 0, 0, 0, bg);
  const rim = mesh(new THREE.TorusGeometry(0.84, 0.06, 8, 28), std(NAVY, 0.4), 0, 1.0, 0, bg); rim.rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.62, 24), std(0x8a5a00, 0.8), 0, 0.03, 0, bg).rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), std(0xffffff), 0.95, 1.2, 0, bg);
  const flag = mesh(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshStandardMaterial({color: 0xe22511, side: THREE.DoubleSide}), 1.4, 2.15, 0, bg);
  ink(bg, 0.03); bg.position.set(LV.bucket[0], bt, LV.bucket[1]);
  const glow = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.3, 40), new THREE.MeshBasicMaterial({color: 0xffc20e, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false})); glow.rotation.x = -Math.PI / 2; glow.position.set(LV.bucket[0], bt + 0.03, LV.bucket[1]); world.add(glow);
  bucket = {x: LV.bucket[0], z: LV.bucket[1], y: bt, rIn: 0.66, rOut: 0.9, rimY: bt + 1.0, g: bg, flag, glow};
  // clouds below
  seed = 3 + i; for (let k = 0; k < 9; k++) cloud(srnd(-20, 20), srnd(-9, -5), srnd(-22, 12), srnd(1.8, 3));
  cloud(-13, 7, -24, 2.4); cloud(15, 9, -28, 2.0);
  // stars: placed on a real solution path so the level is always solvable
  const sol = solveLevel(LV);
  LV.sol = sol;
  const path = sol ? sol.path : [];
  [0.3, 0.55, 0.78].forEach((t) => { const p = path[Math.floor(t * (path.length - 1))] || new V3(0, 5, 0); const m = mesh(starGeo, starMat, p.x, p.y + 0.15, p.z, world); m.scale.setScalar(1.35); ink(m, 0.025); stars.push({m, p: m.position.clone(), got: false}); });
  fitCam(true);
}
function cloud(x, y, z, s) { const g = new THREE.Group(), mat = std(0xffffff, 1); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(srnd(0.5, 1.0) * s, 14, 10), mat); m.position.set(srnd(-1.6, 1.6) * s, srnd(-0.2, 0.35) * s, srnd(-0.6, 0.6) * s); m.scale.y = 0.75; g.add(m); } g.position.set(x, y, z); world.add(g); }

// ---------- physics (shared by the game, the aim preview and the solver) ----------
const G = 14, ELEV = 0.96, VMIN = 4, VMAX = 16;
function launchVel(ang, pow) { const v = VMIN + pow * (VMAX - VMIN), c = Math.cos(ELEV), s = Math.sin(ELEV); return new V3(Math.sin(ang) * c * v, s * v, -Math.cos(ang) * c * v); }
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
  // bucket: walls + rim + the inside
  const bk = lv.bucket, dx = B.p.x - bk.x, dz = B.p.z - bk.z, hd = Math.hypot(dx, dz);
  if (B.p.y < bk.rimY + RAD && B.p.y > bk.y - 0.2 && hd < bk.rOut + RAD) {
    const mid = (bk.rIn + bk.rOut) / 2;
    if (hd < bk.rIn - 0.05 && B.p.y < bk.rimY - 0.1) { B.done = 'in'; }
    else if (B.p.y > bk.rimY - 0.15) { // rim
      const ux = hd > 1e-4 ? dx / hd : 1, uz = hd > 1e-4 ? dz / hd : 0; _c.set(bk.x + ux * mid, bk.rimY, bk.z + uz * mid);
      _n.subVectors(B.p, _c); const d = _n.length(); if (d < RAD + 0.08) { _n.divideScalar(d || 1); B.p.copy(_c).addScaledVector(_n, RAD + 0.08); const vn = B.v.dot(_n); if (vn < 0) B.v.addScaledVector(_n, -1.4 * vn); hit = 'rim'; }
    } else if (hd >= mid) { const ux = dx / hd, uz = dz / hd, push = bk.rOut + RAD - hd; B.p.x += ux * push; B.p.z += uz * push; const vn = B.v.x * ux + B.v.z * uz; if (vn < 0) { B.v.x -= 1.4 * vn * ux; B.v.z -= 1.4 * vn * uz; } }
  }
  // stars
  for (let k = 0; k < lv.stars.length; k++) if (!B.got[k] && B.p.distanceTo(lv.stars[k]) < 0.75) B.got[k] = true;
  if (B.p.y < -6) B.done = 'out';
  const sp = B.v.length();
  if (B.ground && sp < 0.6) { B.rest += dt; B.v.multiplyScalar(0.9); if (B.rest > 0.45) B.done = B.done || 'rest'; } else B.rest = 0;
  if (B.t > 9) B.done = B.done || 'rest';
  return hit;
}
function lvPhys() { return {boxes, bucket, stars: stars.map((s) => s.p)}; }
// brute-force search for a one-shot solution (also used by the test bot)
function solveLevel(L, from) {
  const lv = {boxes, bucket: {x: L.bucket[0], z: L.bucket[1], y: islandAt(L.bucket[0], L.bucket[1]).top, rIn: 0.66, rOut: 0.9, rimY: islandAt(L.bucket[0], L.bucket[1]).top + 1.0}, stars: []};
  const st = from || startPos(L), best = [];
  const aim = Math.atan2(L.bucket[0] - st.x, -(L.bucket[1] - st.z));
  for (const openAt of [-1, 0.0]) for (let da = -0.7; da <= 0.7; da += 0.035) for (let pw = 0.05; pw <= 1.0001; pw += 0.025) {
    const B = newBody(st, launchVel(aim + da, pw)); B.autoOpen = openAt;
    const path = [];
    for (let i = 0; i < 1300 && !B.done; i++) { stepBody(B, 1 / 120, L.wind, lv); if (i % 4 === 0) path.push(B.p.clone()); }
    if (B.done === 'in') best.push({ang: aim + da, pow: pw, open: openAt, path, score: Math.abs(da) * 2 + (openAt >= 0 ? (L.wind ? -0.5 : 0.6) : 0) + Math.abs(pw - 0.7)});
  }
  best.sort((a, b) => a.score - b.score); return best[0] || null;
}
function startPos(L) { const I = islandAt(L.start[0], L.start[1]); return new V3(L.start[0], I.top + RAD + 0.01, L.start[1]); }

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
};
// haptics: Capacitor Haptics inside the iOS app, navigator.vibrate on Android browsers
const HAP = (() => { try { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Haptics; } catch (e) { return null; } })();
function buzz(ms) { try { if (HAP) { const n = Array.isArray(ms) ? 30 : ms; if (Array.isArray(ms)) HAP.notification({type: 'SUCCESS'}); else HAP.impact({style: n >= 18 ? 'MEDIUM' : 'LIGHT'}); } else if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
let lastTick = 0; function tick() { const t = performance.now(); if (t - lastTick < 70) return; lastTick = t; try { if (HAP) HAP.selectionChanged(); } catch (e) {} }

// ---------- play state ----------
let state = 'home', cur = 0;
const P = {phase: 'aim', shot: 1, body: null, from: null, got: [false, false, false], t: 0, endT: 0, celebrate: 0};
function startLevel(i) {
  cur = i; buildLevel(i); audio();
  Object.assign(P, {phase: 'aim', shot: 1, body: null, got: [false, false, false], celebrate: 0});
  P.from = startPos(LV); placeToy(P.from); toyRoot.quaternion.identity();
  ['homeL', 'levelsL', 'endL', 'pauseL'].forEach((id) => show(id, false)); show('hud', true); state = 'play';
  $('lvN').textContent = i + 1; $('lvName').textContent = LV.name;
  $('wind').hidden = !LV.wind; $('windV').textContent = (LV.wind > 0 ? '→ ' : '← ') + Math.round(Math.abs(LV.wind) * 3);
  hudStars(); hudShots(); tuyUI(); $('toast').innerHTML = '';
  showHint(i === 0 && !SAVE.seen ? 'Parmağını aşağı çek, bırak' : '');
}
function placeToy(p) { toyRoot.position.copy(p); }
function show(id, on) { $(id).hidden = !on; }
const STAR = (on, s) => `<svg viewBox="0 0 24 24" ${s || ''}><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="${on ? '#ffc20e' : 'rgba(255,255,255,.6)'}" stroke="#022753" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
function hudStars() { $('hudStars').innerHTML = P.got.map((g) => STAR(g, g ? 'class="on"' : '')).join(''); }
function hudShots() { $('shots').textContent = P.shot + '/3'; }
function tuyUI() { const B = P.body, e = B ? B.energy / 1.6 : 1; $('tuyArc').setAttribute('stroke-dashoffset', (377 * (1 - e)).toFixed(1)); $('tuy').classList.toggle('off', !(P.phase === 'fly' && B && B.energy > 0)); }
function toast(txt, sub, col) { $('toast').innerHTML = `<div class="in"><div class="tag" style="background:${col || '#e22511'}">${txt}</div>${sub ? `<div class="call">${sub}</div>` : ''}</div>`; }
function showHint(t) { const h = $('hint'); h.textContent = t; h.hidden = !t; $('tut').hidden = !t; if (t) { requestAnimationFrame(() => { const v = toyRoot.position.clone().project(camera), x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight; $('tut').style.left = (x - 26) + 'px'; $('tut').style.top = (y + 20) + 'px'; h.style.left = clamp(x - h.offsetWidth / 2, 12, innerWidth - h.offsetWidth - 12) + 'px'; h.style.top = (y - 70) + 'px'; }); }
  if (false) { const v = toyRoot.position.clone().project(camera); h.style.left = ((v.x + 1) / 2 * innerWidth - 50) + 'px'; h.style.top = ((1 - v.y) / 2 * innerHeight + 110) + 'px'; } }

// ---------- aiming ----------
const plane = new THREE.Plane(new V3(0, 1, 0), 0), ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function groundAt(cx, cy, y) { ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -y; const out = new V3(); return ray.ray.intersectPlane(plane, out) ? out : null; }
let aim = null;
const dotsG = new THREE.Group(); scene.add(dotsG);
const dotGeo = new THREE.SphereGeometry(0.11, 10, 8), dotMat = new THREE.MeshBasicMaterial({color: 0xffffff}), dotOut = new THREE.MeshBasicMaterial({color: NAVY, side: THREE.BackSide});
for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(dotGeo, dotMat); const o = new THREE.Mesh(dotGeo, dotOut); o.scale.setScalar(1.45); m.add(o); m.visible = false; dotsG.add(m); }
function aimFrom(cx, cy) {
  const y = P.from.y; const g0 = groundAt(aim.x0, aim.y0, y), g1 = groundAt(cx, cy, y); if (!g0 || !g1) return null;
  const dx = g0.x - g1.x, dz = g0.z - g1.z, L = Math.hypot(dx, dz);
  const px = Math.hypot(cx - aim.x0, cy - aim.y0), full = Math.min(220, Math.min(innerWidth, innerHeight) * 0.5);
  if (px < 18 || L < 0.05) return null;
  return {ang: Math.atan2(dx, -dz), pow: clamp((px - 18) / (full - 18), 0, 1), L};
}
function previewAim(a) {
  const kids = dotsG.children; kids.forEach((m) => { m.visible = false; });
  const svg = $('aimsvg'); svg.innerHTML = '';
  if (!a) return;
  const B = newBody(P.from, launchVel(a.ang, a.pow)), lv = lvPhys(); let k = 0;
  for (let i = 0; i < 400 && k < kids.length && !B.done; i++) { stepBody(B, 1 / 60, LV.wind, {boxes: [], bucket: {x: 999, z: 999, y: -99, rimY: -99, rIn: 0, rOut: 0}, stars: []}); if (i % 3 === 2) { const m = kids[k++]; m.position.copy(B.p); m.visible = true; m.scale.setScalar(1 - k / 26); } if (B.v.y < -2 && k > 9) break; }
  // finger leash on screen
  const t = toyRoot.position.clone().project(camera), tx = (t.x + 1) / 2 * innerWidth, ty = (1 - t.y) / 2 * innerHeight;
  svg.setAttribute('width', innerWidth); svg.setAttribute('height', innerHeight);
  svg.innerHTML = `<line x1="${tx}" y1="${ty}" x2="${aim.cx}" y2="${aim.cy}" stroke="#022753" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="${aim.cx}" cy="${aim.cy}" r="24" fill="rgba(255,255,255,.55)" stroke="#022753" stroke-width="3"/><text x="${aim.cx}" y="${aim.cy + 5}" text-anchor="middle" font-family="Barlow Condensed" font-style="italic" font-weight="900" font-size="16" fill="#022753">${Math.round(a.pow * 100)}</text>`;
}
function shoot(a) {
  P.body = newBody(P.from, launchVel(a.ang, a.pow)); P.phase = 'fly'; P.flyT = 0; SAVE.seen = 1; save(); showHint('');
  SFX.launch(a.pow); buzz(15); squash = 1; tuyUI();
  if (!SAVE.glide && !BOT) setTimeout(() => { if (P.phase === 'fly' && !SAVE.glide) toast('BASILI TUT', 'süzül!', '#2fa84f'); }, 350);
}
const tb = $('tuy');
let holdId = null;
function featherOn() { if (P.phase === 'fly' && P.body && P.body.energy > 0 && !P.body.open) { if (!SAVE.glide) { SAVE.glide = 1; save(); } P.body.open = true; tb.classList.add('down'); SFX.feather(); buzz(8); } }
function featherOff() { tb.classList.remove('down'); if (P.body) P.body.open = false; holdId = null; }
addEventListener('pointerdown', (e) => {
  if (state === 'play' && P.phase === 'fly' && !(e.target.closest && e.target.closest('button'))) { holdId = e.pointerId; audio(); featherOn(); return; }
  if (state !== 'play' || P.phase !== 'aim') return;
  if (e.target.closest && (e.target.closest('button') || e.target.closest('#tuy'))) return;
  audio(); aim = {id: e.pointerId, x0: e.clientX, y0: e.clientY, cx: e.clientX, cy: e.clientY, a: null};
});
addEventListener('pointermove', (e) => { if (!aim || e.pointerId !== aim.id) return; aim.cx = e.clientX; aim.cy = e.clientY; const pw = aim.a ? aim.a.pow : -1; aim.a = aimFrom(e.clientX, e.clientY); if (aim.a && Math.floor(aim.a.pow * 10) !== Math.floor(pw * 10)) tick(); previewAim(aim.a); if (aim.a && !$('tut').hidden) { $('tut').hidden = true; $('hint').hidden = true; } });
addEventListener('pointerup', (e) => { if (holdId !== null && e.pointerId === holdId) { featherOff(); return; } if (!aim || e.pointerId !== aim.id) return; const a = aim.a; aim = null; previewAim(null); if (a && a.pow > 0.02 && state === 'play' && P.phase === 'aim') shoot(a); });
addEventListener('pointercancel', () => { aim = null; previewAim(null); if (holdId !== null) featherOff(); });
// stop iOS page scroll / pinch / long-press menu while playing
document.addEventListener('touchmove', (e) => e.preventDefault(), {passive: false});
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());
// TÜY AÇ: hold while flying
tb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio(); if (P.phase === 'fly') { holdId = e.pointerId; featherOn(); } });
addEventListener('keydown', (e) => { if (e.key === ' ' && P.phase === 'fly' && P.body && P.body.energy > 0) P.body.open = true; if (e.key === 'Escape') pause(true); });
addEventListener('keyup', (e) => { if (e.key === ' ' && P.body) P.body.open = false; });

// ---------- shot results ----------
function endShot(B) {
  const how = B.done;
  if (how === 'in') return win();
  if (P.shot >= 3) return lose();
  P.shot++; hudShots();
  // next shot from where it stopped (if it is on a roof), otherwise from the last spot
  if (how === 'rest' && islandAt(B.p.x, B.p.z) && B.p.y > 1) { P.from = new V3(B.p.x, B.p.y, B.p.z); toast('ATIŞ ' + P.shot, 'buradan devam', '#022753'); }
  else { toast('DÜŞTÜ', 'tekrar dene', '#e22511'); SFX.fail(); }
  featherOff(); P.body = null; P.phase = 'aim'; placeToy(P.from); toyRoot.quaternion.identity(); tuyUI();
}
function win() {
  P.phase = 'won'; P.celebrate = 1; SFX.win(); buzz([20, 40, 20]); confetti(bucket.x, bucket.rimY + 0.3, bucket.z);
  const nStars = P.got.filter(Boolean).length + 0, first = P.shot === 1;
  const prev = SAVE.lv[cur] || {s: 0}; const fe = 10 + nStars * 5 + (first ? 10 : 0);
  SAVE.lv[cur] = {s: Math.max(prev.s, nStars), done: 1}; SAVE.fe += fe; save();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = first ? 'TEK ATIŞTA!' : 'KOVADA!'; $('endW').textContent = LV.name + ' · ' + P.shot + '. atışta';
    $('endStars').innerHTML = [0, 1, 2].map((k) => STAR(k < nStars)).join(''); $('endFe').textContent = '+' + fe + ' tüy';
    $('endStars').querySelectorAll('svg').forEach((s, k) => setTimeout(() => { s.classList.add('show'); if (k < nStars) SFX.star(k); }, 250 + k * 280));
    $('retry3').hidden = false;
    $('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';
    $('next').onclick = () => { if (cur + 1 < LEVELS.length) startLevel(cur + 1); else openLevels(); };
  }, BOT ? 50 : 1300);
}
function lose() {
  P.phase = 'lost'; SFX.fail();
  setTimeout(() => {
    state = 'end'; show('hud', false); show('endL', true);
    $('endT').textContent = 'OLMADI!'; $('endW').textContent = '3 atış hakkın bitti. Yıldızların yolunu takip et.';
    $('endStars').innerHTML = ''; $('endFe').textContent = '';
    $('retry3').hidden = true; $('next').querySelector('b').textContent = 'TEKRAR'; $('next').onclick = () => startLevel(cur);
  }, BOT ? 50 : 900);
}

// ---------- effects ----------
const parts = [];
const pGeo = new THREE.BoxGeometry(0.16, 0.16, 0.03);
for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({color: 0xffffff})); m.visible = false; scene.add(m); parts.push({m, life: 0, v: new V3()}); }
function confetti(x, y, z) { const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xffffff]; for (const p of parts) { p.life = 1 + Math.random() * 0.6; p.m.material.color.setHex(cols[(Math.random() * 5) | 0]); p.m.position.set(x, y, z); p.v.set((Math.random() - 0.5) * 6, 5 + Math.random() * 6, (Math.random() - 0.5) * 6); p.m.visible = true; } }
function sparks(p, col) { let n = 0; for (const q of parts) { if (q.life > 0) continue; q.life = 0.5; q.m.material.color.setHex(col); q.m.position.copy(p); q.v.set((Math.random() - 0.5) * 5, Math.random() * 4, (Math.random() - 0.5) * 5); q.m.visible = true; if (++n > 10) break; } }
let squash = 0;

// ---------- camera ----------
const camDir = new V3(0.22, 0.98, 1.0).normalize();
let camTarget = new V3(), camDist = 30, camLook = new V3();
function fitCam(snap) {
  if (!LV) return;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, y1 = 0;
  for (const I of LV.islands) { x0 = Math.min(x0, I.x - I.w / 2); x1 = Math.max(x1, I.x + I.w / 2); z0 = Math.min(z0, I.z - I.d / 2); z1 = Math.max(z1, I.z + I.d / 2); y1 = Math.max(y1, I.top); }
  camTarget.set((x0 + x1) / 2, y1 * 0.4, (z0 + z1) / 2 + 0.6);
  const pts = []; for (const x of [x0, x1]) for (const z of [z0, z1]) for (const y of [-2, y1 + 3]) pts.push(new V3(x, y, z));
  let d = 18;
  for (let k = 0; k < 40; k++) { camera.position.copy(camTarget).addScaledVector(camDir, d); camera.lookAt(camTarget); camera.updateMatrixWorld(); const ok = pts.every((p) => { const v = p.clone().project(camera); return Math.abs(v.x) < 0.9 && v.y < 0.62 && v.y > -0.66; }); if (ok) break; d += 1.2; }
  camDist = d; if (snap) camLook.copy(camTarget);
}

// ---------- screens ----------
function openHome() { state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL'].forEach((id) => show(id, false)); show('homeL', true); $('starsH').textContent = Object.values(SAVE.lv).reduce((a, b) => a + (b.s || 0), 0); $('feH').textContent = SAVE.fe; $('sndB').textContent = SAVE.snd ? 'SES' : 'SESSİZ'; if (!LV) buildLevel(0); placeToy(startPos(LV)); }
function openLevels() {
  state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL'].forEach((id) => show(id, false)); show('levelsL', true);
  const done = (i) => SAVE.lv[i] && SAVE.lv[i].done; let html = '';
  for (let i = 0; i < 10; i++) {
    const open = i < LEVELS.length && (i === 0 || done(i - 1) || done(i)), s = (SAVE.lv[i] || {}).s || 0, nxt = open && !done(i);
    html += `<button class="lv${open ? '' : ' lock'}${nxt ? ' next' : ''}" data-i="${i}" ${open ? '' : 'disabled'}><b>${i + 1}</b><span>${i < LEVELS.length ? LEVELS[i].name : 'Yakında'}</span><div class="st">${[0, 1, 2].map((k) => STAR(k < s)).join('')}</div></button>`;
  }
  $('grid').innerHTML = html; $('grid').querySelectorAll('.lv:not(.lock)').forEach((b) => b.addEventListener('click', () => startLevel(+b.dataset.i)));
}
function pause(on) { if (on && state === 'play') { state = 'pause'; show('pauseL', true); } else if (!on && state === 'pause') { state = 'play'; show('pauseL', false); last = performance.now(); } }
$('play').addEventListener('click', () => { audio(); const firstOpen = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); if (firstOpen === 0 && !SAVE.seen) startLevel(0); else openLevels(); });
$('back1').addEventListener('click', openHome); $('retry3').addEventListener('click', () => startLevel(cur)); $('menu2').addEventListener('click', openLevels); $('menu3').addEventListener('click', openLevels);
$('pauseB').addEventListener('click', () => pause(true)); $('resume').addEventListener('click', () => pause(false)); $('retryP').addEventListener('click', () => startLevel(cur));
$('sndB').addEventListener('click', () => { SAVE.snd = SAVE.snd ? 0 : 1; save(); $('sndB').textContent = SAVE.snd ? 'SES' : 'SESSİZ'; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(true); if (AC) AC.suspend(); } else if (AC) AC.resume(); });

// ---------- test bot: plays each level with the solver's shot ----------
function botTick() {
  if (state === 'end') { if ($('next').querySelector('b').textContent !== 'BÖLÜMLER') $('next').onclick(); return; }
  if (state !== 'play') return;
  if (P.phase === 'aim' && !P.botWait) { P.botWait = 1; setTimeout(() => { P.botWait = 0; if (P.phase !== 'aim') return; const s = P.shot === 1 && LV.sol ? LV.sol : solveLevel(LV, P.from); if (!s) { lose(); return; } P.botSol = s; shoot({ang: s.ang, pow: s.pow}); P.body.autoOpen = s.open; }, 300); }
}

// ---------- frame ----------
let last = performance.now(), T = 0, acc = 0;
const qT = new THREE.Quaternion(), upV = new V3(0, 1, 0), tmp = new V3();
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (BOT) botTick();
  if (state === 'play' && P.phase === 'fly' && P.body) {
    acc += dt; const lvp = lvPhys();
    while (acc >= 1 / 120) {
      acc -= 1 / 120;
      const before = P.body.got.slice(), vy0 = P.body.v.length();
      const h = stepBody(P.body, 1 / 120, LV.wind, lvp);
      if (h === 'bounce') { SFX.bounce(); squash = 1; buzz(10); } else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; }
      P.body.got.forEach((g, k) => { if (g && !before[k] && !P.got[k]) { P.got[k] = true; stars[k].m.visible = false; sparks(stars[k].p, 0xffc20e); SFX.star(P.got.filter(Boolean).length - 1); hudStars(); } });
      if (P.body.done) { const B = P.body; if (B.done === 'in') { P.body.p.set(bucket.x, bucket.y + 0.45, bucket.z); } placeToy(B.p); endShot(B); break; }
    }
    if (P.body) { placeToy(P.body.p); tuyUI(); }
  }
  render(dt);
}
function render(dt) {
  // toy orientation: base-first in flight, upright at rest; feathers open with TÜY AÇ
  const B = P.body;
  if (B && P.phase === 'fly' && B.v.lengthSq() > 1) { tmp.copy(B.v).normalize().negate(); qT.setFromUnitVectors(upV, tmp); toyRoot.quaternion.slerp(qT, 0.18); }
  else toyRoot.quaternion.slerp(qT.identity(), 0.12);
  const open = B && B.open ? 1 : 0; toyM.userData.op = lerp(toyM.userData.op || 0, open, 0.25);
  toyM.userData.fe.forEach((f, i) => { const k = i - 1; f.rotation.z = -k * (0.42 + toyM.userData.op * 0.75); f.rotation.x = (k === 0 ? -0.08 : 0.06) - toyM.userData.op * 0.6 + Math.sin(T * 20 + i) * 0.04 * (P.phase === 'fly' ? 1 : 0); });
  squash = Math.max(0, squash - dt * 5); const sq = squash; toyM.scale.set(TOYS * (1 + sq * 0.2), TOYS * (1 - sq * 0.25), TOYS * (1 + sq * 0.2));
  if (P.phase === 'aim' && aim && aim.a) { const k = aim.a.pow; toyM.scale.set(TOYS * (1 + k * 0.12), TOYS * (1 - k * 0.15), TOYS * (1 + k * 0.12)); }
  // shadow on the roof below
  const tp = toyRoot.position, I = LV && islandAt(tp.x, tp.z);
  toyShadow.visible = !!I && !window.__icon; if (I) { toyShadow.position.set(tp.x, I.top + 0.02, tp.z); toyShadow.material.opacity = clamp(0.35 - (tp.y - I.top) * 0.03, 0.05, 0.35); }
  // stars + bucket life
  for (const s of stars) { s.m.rotation.y = T * 2; s.m.position.y = s.p.y + Math.sin(T * 3 + s.p.x) * 0.08; }
  if (bucket) { bucket.flag.rotation.y = Math.sin(T * 3) * 0.3; bucket.glow.material.opacity = 0.35 + Math.sin(T * 4) * 0.2; if (P.celebrate > 0) { P.celebrate = Math.max(0, P.celebrate - dt * 1.5); const s = 1 + Math.sin(P.celebrate * 18) * 0.12 * P.celebrate; bucket.g.scale.set(s, 1 / s, s); } }
  if (sock) { const w = LV.wind || 0.4; sock.rotation.z = Math.PI / 2 - Math.sign(w || 1) * 0.15 + Math.sin(T * 5) * 0.08; sock.rotation.order = 'YXZ'; sock.rotation.y = w >= 0 ? 0 : Math.PI; sock.position.x = sock.userData.base.x + 0.45 * Math.sign(w || 1); }
  for (const p of parts) if (p.life > 0) { p.life -= dt; p.v.y -= 12 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += dt * 9; p.m.rotation.y += dt * 7; if (p.life <= 0) p.m.visible = false; }
  // camera: frame the level, lean toward the flying toy a little
  const want = camTarget.clone(); if (P.phase === 'fly' && B) want.lerp(B.p, 0.28); if (state === 'home') { want.x += Math.sin(T * 0.3) * 0.8; want.z -= 5.5; }
  camLook.lerp(want, 0.06);
  const dist = camDist * (P.phase === 'won' ? 0.9 : 1) * (state === 'home' || state === 'levels' ? 1.15 : 1);
  if (!window.__freezeCam) { camera.position.copy(camLook).addScaledVector(camDir, dist); camera.lookAt(camLook); }
  sun.target.position.copy(camTarget); sun.position.copy(camTarget).add(tmp.set(10, 22, 9));
  renderer.render(scene, camera);
}
window.__A = {X: {scene, camera, toyRoot, toyM, renderer, get bucket() { return bucket; }, get world() { return world; }, stars: () => stars}, P, LEVELS, startLevel, solveLevel, state: () => state, SAVE, get LV() { return LV; }};
resize(); openHome(); requestAnimationFrame(frame);
