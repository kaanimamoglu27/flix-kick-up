import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { initStates, graph, path, comp, placed, xform, nextState, canAct, cellOfBlock, solve, ck } from './engine.js';
import { LEVELS, CHAPTERS } from './levels.js';
import { makeToy, featherOnly, setLogo } from './toy.js';
import { SFX } from './sfx.js';

const $ = (s) => document.querySelector(s);
const TS = 0.58, TY = 0.25;
const PAL = {
  morning: { bg: ['#6fb7e3', '#b9e2ea', '#ffe0bd'], top: 0xfff4e4, side: 0xf3b98f, side2: 0xdc7a58, accent: 0x3f9e93, gold: 0xf2c14e, tree: [0x7cc47a, 0xf49ab0], rock: 0xc98a6a, fog: 0xd8ecf0, sun: 0xfff1dc, hemi: [0xd8ecff, 0xf2c79a], cloud: 0xffffff },
  dusk: { bg: ['#4f47a8', '#e59fb2', '#ffd0b0'], top: 0xf6e9d6, side: 0xf0b7a4, side2: 0xe2775a, accent: 0x3f8f93, gold: 0xf2c14e, tree: [0xf08aa0, 0xffc56a], rock: 0xc9876e, fog: 0xffc6b0, sun: 0xffd8b8, hemi: [0xb9b0ff, 0xffb48a], cloud: 0xfff0ea },
};

// ---------- renderer ----------
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); scene.add(hemi);

const Grade = {
  uniforms: { tDiffuse: { value: null }, vig: { value: 0.26 }, warm: { value: new THREE.Vector3(1.03, 1, 0.97) }, t: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float vig,t; uniform vec3 warm; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb*warm; float r=length(vUv-.5); c*=1.-vig*smoothstep(.3,.85,r*1.1); c+=(h(vUv*913.+t)-.5)*.022; gl_FragColor=vec4(c,1.); }`,
};
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.32, 0.55, 0.86); composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass(Grade); composer.addPass(grade);

function bgTex(stops) { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 512; const c = cv.getContext('2d'); const g = c.createLinearGradient(0, 0, 0, 512); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(0, 0, 4, 512); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }

// ---------- shared geometry ----------
const GEO = {
  block: new RoundedBoxGeometry(1, 1, 1, 3, 0.06), band: new RoundedBoxGeometry(1.025, 0.13, 1.025, 2, 0.03), cap: new RoundedBoxGeometry(0.98, 0.1, 0.98, 2, 0.04),
  step: new RoundedBoxGeometry(1, 0.25, 0.25, 2, 0.03), trunk: new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8), crown: new THREE.IcosahedronGeometry(0.34, 1),
  spark: new THREE.SphereGeometry(0.03, 6, 4),
};
const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.7, ...o });
const M = {}; function setPalette(p) {
  const P = PAL[p]; M.P = P;
  M.top = mat(P.top, { roughness: 0.8 }); M.side = mat(P.side); M.side2 = mat(P.side2); M.accent = mat(P.accent, { roughness: 0.5 });
  M.gold = mat(P.gold, { metalness: 0.9, roughness: 0.25 }); M.dark = mat(0x2f2a4a, { roughness: 0.85 }); M.rock = mat(P.rock, { roughness: 0.95, flatShading: true });
  M.tree = P.tree.map(c => mat(c, { roughness: 0.8, flatShading: true })); M.wood = mat(0x7a4f3a); M.cloud = mat(P.cloud, { roughness: 1 });
  M.plate = mat(0xe8e2d8, { roughness: 0.5 }); M.red = mat(0xe22511, { roughness: 0.35, clearcoat: 0.6 });
  M.groupSide = mat(P.accent, { roughness: 0.5 }); M.groupTop = mat(new THREE.Color(P.accent).lerp(new THREE.Color(0xffffff), 0.55), { roughness: 0.6 });
  scene.background = bgTex(P.bg); scene.fog = new THREE.Fog(P.fog, 72, 130);
  sun.color.set(P.sun); hemi.color.set(P.hemi[0]); hemi.groundColor.set(P.hemi[1]);
}

// ---------- level state ----------
let L, S, G, world, groupObjs = [], blockMeshes = [], pickables = [], toy, feather, goalLight, handleObjs = [], plateObjs = [];
let player = { block: 0, moving: false, queue: [], t: 0, from: null, to: null };
let busy = 0, levelIndex = 0, won = false, clock = new THREE.Clock(), particles;
const SAVE = (() => { try { return JSON.parse(localStorage.getItem('flix_kt') || '{}'); } catch { return {}; } })();
SAVE.done = SAVE.done || []; SAVE.sound = SAVE.sound ?? true;
function save() { try { localStorage.setItem('flix_kt', JSON.stringify(SAVE)); } catch {} }
SFX.enabled = SAVE.sound;

function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function buildWorld(idx) {
  if (world) { scene.remove(world); world.traverse(o => { if (o.isMesh && o.geometry && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); }); }
  levelIndex = idx; L = LEVELS[idx](); S = initStates(L); won = false;
  setPalette(CHAPTERS[L.ch].pal);
  world = new THREE.Group(); scene.add(world); groupObjs = []; blockMeshes = []; pickables = []; handleObjs = []; plateObjs = [];
  const R = rnd(idx * 7919 + 17);
  // group containers
  L.groups.forEach((g, gi) => { const o = new THREE.Group(); if (g.type === 'rot') o.position.set(g.pivot[0], 0, g.pivot[1]); o.userData = { gi }; world.add(o); groupObjs.push(o); });
  const occ = new Set(L.blocks.map(b => b.x + ',' + b.y + ',' + b.z));
  for (const b of L.blocks) {
    const par = b.g == null ? world : groupObjs[b.g], g = b.g == null ? null : L.groups[b.g];
    const ox = g && g.type === 'rot' ? g.pivot[0] : 0, oz = g && g.type === 'rot' ? g.pivot[1] : 0;
    const node = new THREE.Group(); node.position.set(b.x - ox, b.y + 0.5, b.z - oz); par.add(node); node.userData.block = b.id;
    if (b.kind === 'stair') {
      const d = { '+x': 0, '+z': -Math.PI / 2, '-x': Math.PI, '-z': Math.PI / 2 }[b.dir]; const st = new THREE.Group(); st.rotation.y = d; node.add(st);
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(GEO.step, b.g == null ? M.top : M.groupTop); m.scale.set(1, (i + 1), 1); m.position.set(-0.375 + i * 0.25, -0.5 + (i + 1) * 0.125, 0); m.rotation.y = Math.PI / 2; m.scale.set(1, i + 1, 1); m.castShadow = m.receiveShadow = true; st.add(m); m.userData.block = b.id; pickables.push(m); }
    } else {
      const covered = occ.has(b.x + ',' + (b.y + 1) + ',' + b.z) && b.g == null;
      const side = b.g != null ? M.groupSide : (b.y % 3 === 2 ? M.side2 : M.side);
      const m = new THREE.Mesh(GEO.block, side); m.castShadow = m.receiveShadow = true; node.add(m); m.userData.block = b.id; pickables.push(m);
      if (!covered) { const c = new THREE.Mesh(GEO.cap, b.g != null ? M.groupTop : M.top); c.position.y = 0.47; c.receiveShadow = true; c.castShadow = true; node.add(c); c.userData.block = b.id; pickables.push(c);
        const bd = new THREE.Mesh(GEO.band, b.g != null ? M.gold : M.side2); bd.position.y = 0.36; bd.receiveShadow = true; node.add(bd); bd.userData.block = b.id; pickables.push(bd); }
      // windows / doors on exposed camera-facing sides of tall columns
      if (b.g == null && b.y >= 1) for (const [dx, dz, ry] of [[1, 0, Math.PI / 2], [0, 1, 0]]) {
        if (occ.has((b.x + dx) + ',' + b.y + ',' + (b.z + dz)) || R() < 0.55) continue;
        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.42), M.dark); w.position.set(dx * 0.505, 0.02, dz * 0.505); w.rotation.y = ry; node.add(w);
        const arch = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16, 0, Math.PI), M.dark); arch.position.set(dx * 0.505, 0.23, dz * 0.505); arch.rotation.y = ry; node.add(arch);
      }
    }
    blockMeshes[b.id] = node;
  }
  // rock base: one tapered rock under each ground island
  const ground = L.blocks.filter(b => b.y === 0 && b.g == null), seenG = new Set();
  for (const b0 of ground) { const k0 = b0.x + ',' + b0.z; if (seenG.has(k0)) continue; const isl = [], q = [b0]; seenG.add(k0);
    while (q.length) { const b = q.pop(); isl.push(b); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = ground.find(o => o.x === b.x + dx && o.z === b.z + dz); if (n && !seenG.has(n.x + ',' + n.z)) { seenG.add(n.x + ',' + n.z); q.push(n); } } }
    const xs = isl.map(b => b.x), zs = isl.map(b => b.z), w = Math.max(...xs) - Math.min(...xs) + 1, d = Math.max(...zs) - Math.min(...zs) + 1;
    const geo = new THREE.CylinderGeometry(0.5, 0.08, 1, 7, 4); const pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); if (y < 0.49) { pa.setX(i, pa.getX(i) * (0.85 + R() * 0.3)); pa.setZ(i, pa.getZ(i) * (0.85 + R() * 0.3)); } } geo.computeVertexNormals();
    const r = new THREE.Mesh(geo, M.rock); const h = 1.6 + Math.min(w, d) * 0.9; r.scale.set(w * 1.32, h, d * 1.32); r.position.set((Math.min(...xs) + Math.max(...xs)) / 2, -h / 2 - 0.02, (Math.min(...zs) + Math.max(...zs)) / 2); r.castShadow = true; world.add(r); }
  // props
  for (const p of L.props || []) {
    const [x, y, z] = p.at; const top = y + 1;
    if (p.t === 'tree') { const t = new THREE.Group(); t.position.set(x, top, z); const tr = new THREE.Mesh(GEO.trunk, M.wood); tr.position.y = 0.25; tr.castShadow = true; t.add(tr);
      const cr = new THREE.Mesh(GEO.crown, M.tree[Math.floor(R() * 2)]); cr.position.y = 0.66; cr.castShadow = true; cr.scale.setScalar(0.9 + R() * 0.3); t.add(cr); world.add(t); t.userData.sway = R() * 6; }
    if (p.t === 'lever') { const t = new THREE.Group(); t.position.set(x, top, z); world.add(t);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 24), M.gold); base.position.y = 0.06; t.add(base);
      const arm = new THREE.Group(); arm.position.y = 0.12; t.add(arm); const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 8), M.gold); rod.position.y = 0.3; arm.add(rod);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), M.red); knob.position.y = 0.62; arm.add(knob); arm.rotation.z = 0.5;
      const gi = L.groups.findIndex(g => g.handle && g.handle.kind === 'lever'); handleObjs.push({ gi, obj: t, arm, kind: 'lever' }); t.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.handle = gi; pickables.push(o); } });
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 0.4; hit.userData.handle = gi; t.add(hit); pickables.push(hit); }
  }
  // cranks (golden wheels)
  L.groups.forEach((g, gi) => { if (!g.handle || g.handle.kind !== 'crank') return; const [x, y, z] = g.handle.pos; const t = new THREE.Group(); t.position.set(x, y, z); world.add(t);
    if (!g.handle.face) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.4, 16), M.side2); post.position.y = -0.9; post.castShadow = true; t.add(post);
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 40), M.gold); disk.position.y = 0.48; t.add(disk); }
    const wheel = new THREE.Group(); wheel.position.set(0, g.handle.face ? 0 : -0.35, g.handle.face ? 0.02 : 0.25); t.add(wheel);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 12, 40), M.gold); wheel.add(tor);
    for (let i = 0; i < 3; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.64, 6), M.gold); sp.rotation.z = i * Math.PI / 3; wheel.add(sp); }
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), M.red); wheel.add(hub);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshBasicMaterial({ visible: false })); t.add(hit); hit.userData.handle = gi; pickables.push(hit);
    t.traverse(o => { if (o.isMesh && o !== hit) { o.castShadow = true; o.userData.handle = gi; pickables.push(o); } });
    handleObjs.push({ gi, obj: t, wheel, kind: 'crank' }); });
  // plates
  for (const p of L.plates) { const b = L.blocks[p.block]; const pl = new THREE.Group(); pl.position.set(b.x, b.y + 1.0, b.z); world.add(pl);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.08, 32), M.plate); d.position.y = 0.04; d.receiveShadow = true; pl.add(d);
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.03, 8, 40), M.gold); r.rotation.x = Math.PI / 2; r.position.y = 0.08; pl.add(r);
    plateObjs.push({ p, obj: d }); }
  // clouds
  const cl = new THREE.Group(); world.add(cl); const bb = bounds();
  for (let i = 0; i < 16; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + R() * 1.2, 2), M.cloud); const a = R() * 6.28, rr = 3 + R() * 7; c.position.set(bb.cx + Math.cos(a) * rr, -5.5 - R() * 3, bb.cz + Math.sin(a) * rr); c.scale.y = 0.5; cl.add(c); }
  // floating petals
  const pg = new THREE.BufferGeometry(), N = 60, arr = new Float32Array(N * 3); for (let i = 0; i < N; i++) { arr[i * 3] = bb.cx + (R() - 0.5) * 16; arr[i * 3 + 1] = R() * 8 - 2; arr[i * 3 + 2] = bb.cz + (R() - 0.5) * 16; }
  pg.setAttribute('position', new THREE.BufferAttribute(arr, 3)); particles = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.8 })); world.add(particles);
  // goal feather
  const colIdx = levelIndex % 3, colors = [0x2a80dc, 0x2fa043, 0xffd41f];
  feather = featherOnly(colors[colIdx]); feather.scale.setScalar(0.55); world.add(feather);
  goalLight = new THREE.PointLight(colors[colIdx], 3, 3, 2); world.add(goalLight);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 16), new THREE.MeshBasicMaterial({ color: colors[colIdx], transparent: true, opacity: 0.18, depthWrite: false })); feather.add(halo); halo.position.y = 1.0; halo.scale.setScalar(1 / 0.55 * 0.6);
  // toy
  toy = makeToy(); toy.scale.setScalar(TS); world.add(toy); setToyFeathers(colIdx);
  player = { block: L.start, moving: false, queue: [], t: 0 };
  G = graph(L, S); placeToy(true); placeGoal(); fitCamera(); updateSun();
  toy.userData.drop = 1;
}
function setToyFeathers(n) { toy.userData.feathers.forEach((f, i) => f.visible = i < n); }
function bounds() { const xs = L.blocks.map(b => b.x), zs = L.blocks.map(b => b.z), ys = L.blocks.map(b => b.y); return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs), y0: Math.min(...ys), y1: Math.max(...ys), cx: (Math.min(...xs) + Math.max(...xs)) / 2, cz: (Math.min(...zs) + Math.max(...zs)) / 2 }; }
function cellPos(key) { const c = G.cells.get(key); return new THREE.Vector3(c.x, c.h2 / 2, c.z); }
function blockTopWorld(id) { const k = cellOfBlockKey(id); return k ? cellPos(k) : null; }
function cellOfBlockKey(id) { for (const [k, c] of G.cells) if (c.b.id === id) return k; return null; }
function placeToy() { const p = blockTopWorld(player.block); if (p) toy.position.copy(p).add(new THREE.Vector3(0, TY, 0)); }
function placeGoal() { const p = blockTopWorld(L.goal); if (p) { feather.userData.base = p.clone(); goalLight.position.copy(p).add(new THREE.Vector3(0, 0.8, 0)); } }
function updateSun() { const b = bounds(); sun.position.set(b.cx - 8, 14, b.cz + 6); sun.target.position.set(b.cx, 0, b.cz); const s = sun.shadow.camera, r = Math.max(b.x1 - b.x0, b.z1 - b.z0) * 0.8 + 4; s.left = s.bottom = -r; s.right = s.top = r; s.near = 1; s.far = 60; s.updateProjectionMatrix(); }
function fitCamera() {
  const b = bounds(), W = innerWidth, H = innerHeight, dir = new THREE.Vector3(1, 0.84, 1).normalize();
  const center = new THREE.Vector3(b.cx, (b.y0 + b.y1) / 2 + 0.5, b.cz);
  camera.position.copy(center).addScaledVector(dir, 60); camera.lookAt(center); camera.updateMatrixWorld();
  const inv = camera.matrixWorldInverse, v = new THREE.Vector3(); let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
  for (const bl of L.blocks) for (const [dx, dy, dz] of [[-.5, 0, -.5], [.5, 0, .5], [-.5, 1, .5], [.5, 1, -.5], [.5, 1, .5], [-.5, 0, .5]]) {
    v.set(bl.x + dx, bl.y + dy, bl.z + dz).applyMatrix4(inv); minx = Math.min(minx, v.x); maxx = Math.max(maxx, v.x); miny = Math.min(miny, v.y); maxy = Math.max(maxy, v.y); }
  // include group swept area roughly
  const padTop = 1.9, padBot = 1.3, padX = 0.5; const w = maxx - minx + padX * 2, h = maxy - miny + padTop + padBot, asp = W / H;
  let hh = Math.max(h / 2, w / asp / 2); const cy = (maxy + padTop + miny - padBot) / 2, cx = (minx + maxx) / 2;
  camera.left = cx - hh * asp; camera.right = cx + hh * asp; camera.top = cy + hh; camera.bottom = cy - hh; camera.updateProjectionMatrix();
}

// ---------- interaction ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; SFX.unlock(); });
canvas.addEventListener('pointerup', e => { if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null; if (moved < 14) tap(e.clientX, e.clientY); });
function tap(px, py) {
  if (won || !L || $('#home').classList.contains('show')) return;
  ndc.set(px / innerWidth * 2 - 1, -(py / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(pickables, false);
  for (const h of hits) {
    if (h.object.userData.handle != null) { useHandle(h.object.userData.handle); return; }
    const bid = h.object.userData.block; if (bid == null) continue;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    if (n.y < 0.5 && L.blocks[bid].kind !== 'stair') { // side hit: try block above-front? just ignore side clicks
      continue; }
    walkTo(bid); return;
  }
}
function walkTo(bid) {
  if (busy) return; const to = cellOfBlockKey(bid), from = cellOfBlockKey(player.block); if (!to) { ripple(null); return; }
  const p = path(G, from, to); if (!p) { ripple(cellPos(to), true); SFX.nope(); return; }
  ripple(cellPos(to)); player.queue = p.slice(1); if (!player.moving) nextStep();
}
function nextStep() {
  if (!player.queue.length) { player.moving = false; onArrive(); return; }
  const k = player.queue.shift(); const c = G.cells.get(k); if (!c) { player.moving = false; return; }
  player.from = toy.position.clone(); player.to = cellPos(k).add(new THREE.Vector3(0, TY, 0)); player.t = 0; player.moving = true; player.next = c.b.id;
  const d = player.to.clone().sub(player.from); if (Math.abs(d.x) + Math.abs(d.z) > 0.01) toy.userData.face = Math.atan2(d.x, d.z);
}
function onArrive() {
  // plates
  for (const po of plateObjs) { const k = cellOfBlockKey(po.p.block); if (k && k === cellOfBlockKey(player.block) && S[po.p.group].k === 0) { po.obj.position.y = 0.0; SFX.click(); animateGroup(po.p.group, { k: 1, d: 1 }); } }
  if (player.block === L.goal || cellOfBlockKey(player.block) === cellOfBlockKey(L.goal)) win();
}
function useHandle(gi) {
  if (busy || player.moving) return; const pb = player.block;
  const ho = handleObjs.find(h => h.gi === gi);
  if (!canAct(L, S, gi, pb)) { SFX.nope(); if (ho) ho.shake = 1; return; }
  if (ho && ho.kind === 'lever') ho.flip = (ho.flip || 0) + 1;
  animateGroup(gi, nextState(L, S, gi)[gi], ho);
}
let anims = [];
function animateGroup(gi, ns, ho) {
  const g = L.groups[gi], o = groupObjs[gi], from = S[gi].k, to = ns.k; busy++;
  const carried = L.blocks[player.block].g === gi;
  if (carried) o.attach(toy);
  if (g.type === 'rot') SFX.rotate(); else SFX.slide();
  anims.push({ t: 0, dur: g.type === 'rot' ? 0.9 : 0.7 + Math.abs(to - from) * 0.2, step: (e) => {
    if (g.type === 'rot') o.rotation.y = -(from + (to - from) * e) * Math.PI / 2;
    else { const s = g.step || 1, a = g.axis, kk = from + (to - from) * e; o.position.set(a[0] * s * kk, a[1] * s * kk, a[2] * s * kk); }
    if (ho && ho.wheel) ho.wheel.rotation.z = -(from + (to - from) * e) * Math.PI;
    if (ho && ho.arm) ho.arm.rotation.z = (ho.flip % 2 ? -0.5 : 0.5) * (e) + (ho.flip % 2 ? 0.5 : -0.5) * (1 - e);
  }, end: () => {
    S[gi] = ns; G = graph(L, S); if (carried) world.attach(toy); placeToy(); placeGoal(); busy--; SFX.thunk(); if (cellOfBlockKey(player.block) && player.block === L.goal) win();
    if (state.hint) clearHint();
  } });
}
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

// ripple marker
const ring = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); ring.rotation.x = -Math.PI / 2; scene.add(ring);
function ripple(pos, bad) { if (!pos) return; ring.position.copy(pos).add(new THREE.Vector3(0, 0.02, 0)); ring.material.color.set(bad ? 0xff6b6b : 0xffffff); ring.userData.t = 0; }

// hint
const state = { hint: null };
const hintRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.4, 48), new THREE.MeshBasicMaterial({ color: 0xffd25e, transparent: true, opacity: 0, depthWrite: false })); hintRing.rotation.x = -Math.PI / 2; scene.add(hintRing);
function showHint() {
  if (busy || player.moving || won) return; const sol = solve(L, S, player.block); if (!sol) { toast('Bölümü baştan başlatmayı dene'); return; }
  const st = sol[0]; SFX.chime(0);
  if (st.act === 'goal' || st.act === 'plate' || cellOfBlockKey(st.walkTo) !== cellOfBlockKey(player.block)) { const p = blockTopWorld(st.walkTo); hintRing.position.copy(p).add(new THREE.Vector3(0, 0.03, 0)); state.hint = { kind: 'cell' }; toast(st.act === 'goal' ? 'Tüye doğru yürü' : st.act === 'plate' ? 'Taşın üstüne bas' : 'Önce buraya git'); }
  else { const ho = handleObjs.find(h => h.gi === st.act); state.hint = { kind: 'handle', ho }; toast(L.groups[st.act].handle.kind === 'crank' ? 'Altın çarkı çevir' : 'Kolu çek'); }
  state.hintT = 0;
}
function clearHint() { state.hint = null; hintRing.material.opacity = 0; }

// ---------- win ----------
function win() {
  if (won) return; won = true; SFX.feather(); const colIdx = levelIndex % 3; const f = feather;
  anims.push({ t: 0, dur: 1.2, step: (e) => { const a = f.userData.base.clone().add(new THREE.Vector3(0, 0.6, 0)); f.position.lerpVectors(a, toy.position.clone().add(new THREE.Vector3(0, 0.6, 0)), ease(e)); f.scale.setScalar(0.55 * (1 - e * 0.6)); f.rotation.y += 0.3; },
    end: () => { f.visible = false; setToyFeathers(colIdx + 1); toy.userData.joy = 1; if (!SAVE.done.includes(levelIndex)) SAVE.done.push(levelIndex); save(); setTimeout(showWin, 700); } });
}
function showWin() {
  const colNames = ['Mavi', 'Yeşil', 'Sarı'], colIdx = levelIndex % 3, last = levelIndex === LEVELS.length - 1;
  $('#winT').textContent = colNames[colIdx] + ' tüy bulundu!';
  $('#winS').textContent = colIdx === 2 ? (last ? 'FLIX yine tamamlandı. Yeni bölümler yolda.' : 'FLIX’in üç tüyü de yerinde. Ama akşam rüzgârı geliyor…') : 'Sıradaki tüy ' + colNames[colIdx + 1].toLowerCase() + '. ' + (2 - colIdx) + ' tüy kaldı.';
  $('#winN').textContent = last ? 'Bölümlere dön' : 'Sonraki bölüm';
  $('#win').classList.add('show');
}

// ---------- UI ----------
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), 2400); }
function startLevel(i) {
  $('#home').classList.remove('show'); $('#levels').classList.remove('show'); $('#win').classList.remove('show'); $('#pause').classList.remove('show');
  buildWorld(i); clearHint(); $('#hud').classList.add('show');
  $('#lvNum').textContent = 'Bölüm ' + (L.ch + 1) + ' · ' + ((i % 3) + 1); $('#lvName').textContent = L.name;
  $('#title').classList.remove('small'); clearTimeout(startLevel.h); startLevel.h = setTimeout(() => $('#title').classList.add('small'), 3200);
  if (L.hint0 && !SAVE.done.includes(i)) setTimeout(() => toast(L.hint0), 1200);
  document.querySelectorAll('#fdots i').forEach((d, k) => d.className = k < (i % 3) ? 'on c' + k : (k === i % 3 ? 'cur c' + k : ''));
}
function renderLevels() {
  const box = $('#lvlist'); box.innerHTML = '';
  CHAPTERS.forEach((c, ci) => { const sec = document.createElement('section'); sec.className = 'chap ' + c.pal; sec.innerHTML = `<div class="chh"><small>Bölüm ${ci + 1}</small><b>${c.name}</b><p>${c.story}</p></div><div class="cards"></div>`;
    const cards = sec.querySelector('.cards');
    for (let k = 0; k < 3; k++) { const i = ci * 3 + k, f = LEVELS[i](), unlocked = i === 0 || SAVE.done.includes(i - 1) || SAVE.done.includes(i), done = SAVE.done.includes(i);
      const b = document.createElement('button'); b.className = 'lv' + (unlocked ? '' : ' lock') + (done ? ' done' : ''); b.innerHTML = `<span class="n">${k + 1}</span><span class="t">${f.name}</span><span class="f c${k}"></span>`;
      if (unlocked) b.onclick = () => { SFX.unlock(); SFX.click(); startLevel(i); }; cards.appendChild(b); }
    box.appendChild(sec); });
}
$('#play').onclick = () => { SFX.unlock(); SFX.click(); const next = LEVELS.findIndex((_, i) => !SAVE.done.includes(i)); startLevel(next < 0 ? 0 : next); };
$('#lvBtn').onclick = () => { SFX.unlock(); SFX.click(); renderLevels(); $('#levels').classList.add('show'); };
$('#lvBack').onclick = () => { $('#levels').classList.remove('show'); };
$('#pauseBtn').onclick = () => { SFX.click(); $('#pause').classList.add('show'); };
$('#resume').onclick = () => { $('#pause').classList.remove('show'); };
$('#restart').onclick = () => { startLevel(levelIndex); };
$('#toLevels').onclick = () => { $('#pause').classList.remove('show'); renderLevels(); $('#levels').classList.add('show'); };
$('#toHome').onclick = () => { $('#pause').classList.remove('show'); $('#hud').classList.remove('show'); showHome(); };
$('#hintBtn').onclick = () => { SFX.unlock(); showHint(); };
$('#winN').onclick = () => { $('#win').classList.remove('show'); if (levelIndex === LEVELS.length - 1) { renderLevels(); $('#levels').classList.add('show'); } else startLevel(levelIndex + 1); };
const sndBtns = document.querySelectorAll('.snd'); function syncSnd() { sndBtns.forEach(b => b.classList.toggle('off', !SAVE.sound)); }
sndBtns.forEach(b => b.onclick = () => { SAVE.sound = !SAVE.sound; SFX.enabled = SAVE.sound; SFX.unlock(); SFX.setMusic(SAVE.sound); save(); syncSnd(); }); syncSnd();
function showHome() { buildWorld(5); $('#home').classList.add('show'); $('#hud').classList.remove('show'); toy.userData.drop = 0; }
document.addEventListener('visibilitychange', () => SFX.suspend(document.hidden));

// ---------- loop ----------
function resize() { const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); composer.setSize(W, H); bloom.resolution.set(W / 2, H / 2); if (L) fitCamera(); }
addEventListener('resize', resize);
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; const T = now / 1000; grade.uniforms.t.value = T % 10;
  if (!L) return;
  // anims
  anims = anims.filter(a => { a.t += dt / a.dur; const e = Math.min(1, a.t); a.step(a.dur > 0.8 ? easeBack(e) : ease(e)); if (e >= 1) { a.end && a.end(); return false; } return true; });
  // player walk
  if (player.moving) { player.t += dt / 0.24; const e = Math.min(1, player.t); toy.position.lerpVectors(player.from, player.to, e); toy.position.y += Math.sin(e * Math.PI) * 0.22;
    if (e >= 1) { player.block = player.next; SFX.step(); toy.userData.squash = 1; nextStep(); } }
  // toy idle / facing / squash / drop
  if (toy) { const u = toy.userData; if (u.face != null) { let d = u.face - toy.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); toy.rotation.y += d * Math.min(1, dt * 12); }
    u.squash = Math.max(0, (u.squash || 0) - dt * 5); const sq = Math.sin(u.squash * Math.PI) * 0.12; toy.scale.set(TS * (1 + sq), TS * (1 - sq), TS * (1 + sq));
    u.feathers.forEach((f, i) => { f.rotation.x = u.baseRot[i].x + Math.sin(T * 2.2 + i) * 0.05 + (player.moving ? Math.sin(T * 18) * 0.06 : 0); });
    if (u.drop > 0) { u.drop = Math.max(0, u.drop - dt * 1.6); const p = blockTopWorld(player.block); if (p) toy.position.y = p.y + TY + Math.pow(u.drop, 2) * 6; if (u.drop === 0) { SFX.step(); u.squash = 1; } }
    if (u.joy > 0) { u.joy = Math.max(0, u.joy - dt * 0.8); toy.rotation.y += dt * 10 * u.joy; } }
  if (feather && feather.visible && feather.userData.base && !won) { feather.position.copy(feather.userData.base).add(new THREE.Vector3(0, 0.55 + Math.sin(T * 2) * 0.12, 0)); feather.rotation.y = T * 0.9; goalLight.intensity = 2.5 + Math.sin(T * 3); }
  // trees sway, petals drift, ring fade
  world.children.forEach(o => { if (o.userData.sway != null) o.rotation.z = Math.sin(T * 1.3 + o.userData.sway) * 0.03; });
  if (particles) { const a = particles.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 0.25; let x = a.getX(i) + Math.sin(T + i) * dt * 0.2; if (y < -3) y = 6; a.setY(i, y); a.setX(i, x); } a.needsUpdate = true; }
  if (ring.userData.t != null) { ring.userData.t += dt * 2; const e = ring.userData.t; ring.material.opacity = Math.max(0, 0.9 - e); ring.scale.setScalar(1 + e * 0.8); }
  if (state.hint) { state.hintT += dt; if (state.hint.kind === 'cell') { hintRing.material.opacity = 0.6 + Math.sin(state.hintT * 6) * 0.3; hintRing.scale.setScalar(1 + Math.sin(state.hintT * 6) * 0.1); }
    else if (state.hint.ho) state.hint.ho.obj.scale.setScalar(1 + Math.abs(Math.sin(state.hintT * 5)) * 0.18); if (state.hintT > 6) { if (state.hint.ho) state.hint.ho.obj.scale.setScalar(1); clearHint(); } }
  handleObjs.forEach(h => { if (h.shake) { h.shake = Math.max(0, h.shake - dt * 3); h.obj.position.x += Math.sin(h.shake * 40) * 0.01; } });
  composer.render();
}
// boot
(async () => {
  const img = new Image(); img.src = window.FLIX_LOGO; await img.decode().catch(() => {}); setLogo(img);
  resize(); showHome(); resize(); requestAnimationFrame(frame); document.body.classList.add('ready');
  window.__kt = { startLevel, get L() { return L; }, get S() { return S; }, get player() { return player; }, solve, useHandle, walkTo, cellOfBlockKey, get won() { return won; }, get busy() { return busy; } };
})();
