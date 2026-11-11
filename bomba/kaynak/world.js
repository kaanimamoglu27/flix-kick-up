// ===== Flix Bomba world: island arena, blocks, bombs, blasts, particles =====
const COLS = 9, ROWS = 11;
const wx = (cx) => cx - (COLS - 1) / 2, wz = (cy) => cy - (ROWS - 1) / 2;
function ctex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
const SM = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.7 }, o || {}));
let srand = 7; const rnd = (a = 0, b = 1) => { srand = (srand * 16807) % 2147483647; return a + (b - a) * (srand / 2147483647); };

function buildScene(renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1f9ee8);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xdff3ff, 0x6fbf3a, 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.5); sun.position.set(-6, 14, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  return { scene, sun, hemi };
}

// ---------- map themes. fx = small gameplay twist of the map ----------
const THEMES = [
  { id: 'cimen', n: ['Çimen Adası', 'Grass Island'], icon: '🌿', fxT: ['Standart kurallar', 'Standard rules'], fx: {}, sky: 0x1f9ee8, water: ['#1f9ee8', '150,225,255'], foam: 0xffffff, slab: 0x6cc22c, dirt: ['#d9722f', '#c05e22', '#e98a44'], f: ['#93dc3c', '#84d032'], curb: 0x8f9cbd, brick: ['#b63a17', '#ff7a3d', '#f0582a', '#de4a20'], cap: 0x3d9428, stone: 0x8f9cbd, stoneTop: 0xc5cfe6, hemi: [0xdff3ff, 0x6fbf3a, 1.15], sun: [0xfff1d6, 2.5], pc: [0xf0582a, 0xde4a20, 0xff7a3d, 0x3d9428] },
  { id: 'kar', n: ['Kar Vadisi', 'Snow Valley'], icon: '❄️', fxT: ['Soğuk: fitil daha yavaş yanar', 'Cold: fuses burn slower'], fx: { fuse: 0.6 }, sky: 0x9fd4f7, water: ['#58aee2', '235,250,255'], foam: 0xffffff, slab: 0xeef5fc, dirt: ['#9fc4e0', '#86b0d2', '#c4e0f4'], f: ['#f2f8fe', '#dfeaf6'], curb: 0x6f8fb8, brick: ['#1f6fae', '#8fd6ff', '#5fb8f0', '#3f9fe0'], cap: 0xb8cfe6, stone: 0x4f6a8a, stoneTop: 0xf4f9ff, hemi: [0xffffff, 0xa8c8e8, 1.2], sun: [0xffffff, 2.1], pc: [0x5fb8f0, 0x8fd6ff, 0xffffff, 0x3f9fe0] },
  { id: 'col', n: ['Çöl Vahası', 'Desert Oasis'], icon: '🏜️', fxT: ['Sıcak: alevler daha uzun kalır', 'Heat: flames linger longer'], fx: { flame: 0.35 }, sky: 0x74c8ee, water: ['#e0b060', '255,238,190'], foam: 0xf6dc9a, slab: 0xe6bd6a, dirt: ['#c98a3c', '#b0742c', '#dba456'], f: ['#f0d288', '#e6c474'], curb: 0xa86a3a, brick: ['#7a401a', '#d99a4e', '#c88438', '#b5722c'], cap: 0x8a5626, stone: 0x9a4a32, stoneTop: 0xc67050, hemi: [0xfff0d0, 0xd9a860, 1.2], sun: [0xffe2a8, 2.7], pc: [0xc88438, 0xd99a4e, 0x8a5626, 0xf0d288] },
  { id: 'uzay', n: ['Uzay Üssü', 'Space Base'], icon: '🚀', fxT: ['Düşük yerçekimi: herkes daha hızlı', 'Low gravity: everyone is faster'], fx: { spd: 1.12 }, sky: 0x0b0a24, water: ['#0b0a24', '150,130,255'], foam: 0x6a5acd, slab: 0x3a3f5c, dirt: ['#2a2d44', '#1f2236', '#4a4f70'], f: ['#30345a', '#292d4e'], curb: 0x6b73a0, brick: ['#3a1a78', '#b06bff', '#8a4bff', '#6a2fd0'], cap: 0x157a90, stone: 0x6b7390, stoneTop: 0xaab4d8, hemi: [0xc0c8ff, 0x3a2a6a, 1.25], sun: [0xdfe4ff, 2.4], pc: [0x8a4bff, 0xb06bff, 0x22e0ff, 0xffffff] },
  { id: 'lav', n: ['Yanardağ', 'Volcano'], icon: '🌋', fxT: ['Kızgın: bombaların menzili +1', 'Scorching: bombs reach +1 tile'], fx: { rng: 1 }, sky: 0x3a1408, water: ['#ff5a14', '255,225,110'], foam: 0xffd060, slab: 0x3a2e2e, dirt: ['#2a2020', '#1c1414', '#4a3030'], f: ['#514240', '#473937'], curb: 0x1c1418, brick: ['#2e140c', '#8a3a1e', '#6a2a16', '#55200f'], cap: 0x8a2a10, stone: 0x1f1a22, stoneTop: 0x40344a, hemi: [0xffc8a0, 0x8a2a0a, 1.25], sun: [0xffb070, 2.5], pc: [0x6a2a16, 0xff5a14, 0xffd060, 0x2e140c] },
];
function buildIsland(scene, hemi, sun) {
  const g = new THREE.Group(); scene.add(g);
  const W = COLS + 2.2, H = ROWS + 2.2, TX = THEMES.map(() => null), DEC = THEMES.map(() => null);
  const waterM = new THREE.MeshBasicMaterial({ color: 0xffffff }), dirtM = SM(0xffffff, { roughness: 0.9 }), slabM = SM(0x6cc22c, { roughness: 0.85 }), fieldM = SM(0xffffff, { roughness: 0.9 }), curbM = SM(0x8f9cbd, { roughness: 0.6 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), waterM); water.rotation.x = -Math.PI / 2; water.position.y = -1.45; g.add(water);
  const dirt = new THREE.Mesh(new RoundedBoxGeometry(W - 0.5, 1.5, H - 0.5, 4, 0.3), dirtM); dirt.position.y = -0.95; dirt.receiveShadow = true; g.add(dirt);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(W, 0.5, H, 5, 0.24), slabM); slab.position.y = -0.252; slab.receiveShadow = true; g.add(slab);
  const foam = new THREE.Mesh(new RoundedBoxGeometry(W + 0.5, 0.06, H + 0.5, 4, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff })); foam.position.y = -1.44; g.add(foam);
  const foam2 = new THREE.Mesh(new RoundedBoxGeometry(W + 1.3, 0.04, H + 1.3, 4, 0.02), new THREE.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.6 })); foam2.position.y = -1.445; g.add(foam2);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), fieldM); field.rotation.x = -Math.PI / 2; field.position.y = 0.002; field.receiveShadow = true; g.add(field);
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new RoundedBoxGeometry(COLS + 0.72, 0.42, 0.34, 4, 0.14), curbM); a.position.set(0, 0.16, s * (ROWS / 2 + 0.19)); a.castShadow = a.receiveShadow = true; g.add(a);
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.42, ROWS + 0.72, 4, 0.14), curbM); b.position.set(s * (COLS / 2 + 0.19), 0.16, 0); b.castShadow = b.receiveShadow = true; g.add(b);
  }
  function textures(T, ti) {
    const wt = ctex(512, 512, (x, w, h) => {
      x.fillStyle = T.water[0]; x.fillRect(0, 0, w, h);
      if (ti === 3) { for (let i = 0; i < 170; i++) { x.fillStyle = 'rgba(255,255,255,' + rnd(0.3, 1).toFixed(2) + ')'; const r = rnd(0.6, 2.2); x.beginPath(); x.arc(rnd(0, w), rnd(0, h), r, 0, 7); x.fill(); } for (let i = 0; i < 5; i++) { const px = rnd(0, w), py = rnd(0, h), gr = x.createRadialGradient(px, py, 0, px, py, 90); gr.addColorStop(0, 'rgba(' + T.water[1] + ',.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(px - 90, py - 90, 180, 180); } return; }
      for (let i = 0; i < 26; i++) { const px = rnd(0, w), py = rnd(0, h), r = rnd(26, 70); x.strokeStyle = 'rgba(' + T.water[1] + ',' + rnd(0.25, 0.55).toFixed(2) + ')'; x.lineWidth = rnd(4, 9); x.lineCap = 'round';
        for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.beginPath(); x.ellipse(px + ox, py + oy, r, r * 0.5, 0, 0.2, 2.2); x.stroke(); } }
    }, true); wt.repeat.set(9, 9);
    const dt = ctex(256, 128, (x, w, h) => { x.fillStyle = T.dirt[0]; x.fillRect(0, 0, w, h); x.fillStyle = T.dirt[1]; for (let i = 0; i < 4; i++) x.fillRect(0, 28 + i * 28, w, 9); x.fillStyle = T.dirt[2]; for (let i = 0; i < 16; i++) x.fillRect(rnd(0, w), rnd(0, h), rnd(10, 30), 5); }, true); dt.repeat.set(6, 1);
    const S = 64, gt = ctex(COLS * S, ROWS * S, (x) => {
      for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
        x.fillStyle = (cx + cy) % 2 ? T.f[0] : T.f[1]; x.fillRect(cx * S, cy * S, S, S);
        if (ti === 3) { x.strokeStyle = 'rgba(34,224,255,.16)'; x.lineWidth = 2; x.strokeRect(cx * S + 5, cy * S + 5, S - 10, S - 10); continue; }
        if (ti === 4 && rnd() < 0.35) { x.strokeStyle = 'rgba(255,110,30,.45)'; x.lineWidth = 2.5; x.beginPath(); let px = cx * S + rnd(8, S - 8), py = cy * S + rnd(8, S - 8); x.moveTo(px, py); for (let k = 0; k < 3; k++) { px += rnd(-14, 14); py += rnd(-14, 14); x.lineTo(px, py); } x.stroke(); }
        for (let i = 0; i < 5; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.08)'; const px = cx * S + rnd(6, S - 10), py = cy * S + rnd(6, S - 10); x.beginPath(); x.ellipse(px, py, 2.4, ti ? 2.4 : 5, rnd(-0.5, 0.5), 0, 7); x.fill(); }
      }
    });
    return { wt, dt, gt };
  }
  // decor outside the playfield, one set per theme
  function decor(ti) {
    const D = new THREE.Group(), ex = W / 2 - 0.36, ez = H / 2 - 0.36;
    const rim = (n, f) => { for (let i = 0; i < n; i++) { const side = i % 4, t = rnd(-0.9, 0.9); const x = side < 2 ? t * ex : (side === 2 ? -ex : ex) + rnd(-0.1, 0.1), z = side < 2 ? (side ? ez : -ez) + rnd(-0.1, 0.1) : t * ez; f(x, z, i); } };
    const out = (n, f) => { for (let i = 0; i < n; i++) { const a = rnd(0, TAU), r = rnd(1.4, 4.2); f(Math.cos(a) * (W / 2 + r), Math.sin(a) * (H / 2 + r), i); } };
    const add = (m, x, y, z, sh) => { m.position.set(x, y, z); if (sh) m.castShadow = true; D.add(m); return m; };
    if (ti === 0) {
      const bushM = SM(0x3fa52a, { roughness: 0.8 }), bushM2 = SM(0x58c234, { roughness: 0.8 });
      rim(14, (x, z, i) => { if (i % 3 === 0) { const b = new THREE.Group(); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(sphG(0.3, 16, 12), k % 2 ? bushM : bushM2); m.position.set((k - 1) * 0.26, 0.18 + (k === 1 ? 0.12 : 0), rnd(-0.08, 0.08)); m.scale.setScalar(k === 1 ? 1.15 : 0.9); m.castShadow = true; b.add(m); } b.scale.setScalar(rnd(0.5, 0.7)); add(b, x, 0, z); }
        else { const f = new THREE.Group(); const st = new THREE.Mesh(capG(0.02, 0.2), SM(0x2f8a22)); st.position.y = 0.12; f.add(st); const hd = new THREE.Mesh(sphG(0.09, 12, 10), SM([0xff4f7a, 0xffffff, 0xffb31f, 0xb06bff][i % 4], { roughness: 0.4 })); hd.position.y = 0.27; hd.scale.y = 0.7; hd.castShadow = true; f.add(hd); const ce = new THREE.Mesh(sphG(0.045, 10, 8), SM(0xffe14a)); ce.position.y = 0.3; f.add(ce); add(f, x, 0, z); } });
      const rockM = SM(0x8a96b4, { roughness: 0.6 }); out(9, (x, z) => add(new THREE.Mesh(sphG(0.5, 14, 10), rockM), x, -1.4, z).scale.set(rnd(0.6, 1.3), rnd(0.4, 0.8), rnd(0.6, 1.2)));
      const islet = (x, z, s, toyCols) => { const I = new THREE.Group(); I.scale.setScalar(s); add(I, x, -1.45, z);
        const sand = new THREE.Mesh(sphG(1.6, 28, 16), SM(0xf4d68a, { roughness: 0.9 })); sand.scale.y = 0.22; I.add(sand);
        const hill = new THREE.Mesh(sphG(1.15, 28, 18), SM(0x62c22e, { roughness: 0.85 })); hill.scale.y = 0.75; hill.position.y = 0.1; hill.castShadow = true; I.add(hill);
        if (toyCols) { const t = featherCrest(toyCols, 1.5, 0.48); t.position.y = 0.85; I.add(t); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 12, 0, TAU, 0, Math.PI / 2), SM(0xf08a24, { roughness: 0.5 })); dome.position.y = 0.62; dome.scale.y = 0.6; I.add(dome); } };
      islet(-W / 2 - 2.6, -H / 2 + 1.5, 1, [0x2a80dc, 0x2fa043, 0xffd41f]); islet(W / 2 + 2.9, H / 2 - 3.5, 0.9, [0xe22511, 0xffffff, 0xff7ab0]); islet(W / 2 + 2.2, -H / 2 - 2.6, 1.2, null); islet(-W / 2 - 2.8, H / 2 + 1.5, 0.8, null);
    } else if (ti === 1) {
      const pine = (x, y, z, s) => { const t = new THREE.Group(); t.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8), SM(0x6a4426))); for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.34 - k * 0.08, 0.42, 12), SM(k % 2 ? 0x2f7a4a : 0x3a8a56)); c.position.y = 0.36 + k * 0.26; c.castShadow = true; t.add(c); const sn = new THREE.Mesh(new THREE.ConeGeometry(0.2 - k * 0.05, 0.16, 12), SM(0xffffff)); sn.position.y = 0.52 + k * 0.26; t.add(sn); } t.scale.setScalar(s); add(t, x, y, z); };
      rim(12, (x, z, i) => { if (i % 2) pine(x, 0, z, rnd(0.55, 0.8)); else add(new THREE.Mesh(sphG(0.22, 14, 10), SM(0xffffff, { roughness: 0.9 })), x, 0.06, z, 1).scale.set(1.3, 0.6, 1.1); });
      const ice = SM(0xf4fbff, { roughness: 0.3 }); out(12, (x, z) => { const m = add(new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.3, 1.2, 3, 0.12), ice), x, -1.38, z); m.rotation.y = rnd(0, 3); m.scale.setScalar(rnd(0.6, 1.5)); });
      for (const p of [[-W / 2 - 2.6, -H / 2 + 1.5], [W / 2 + 2.7, H / 2 - 3.5], [W / 2 + 2.3, -H / 2 - 2.4]]) { const m = add(new THREE.Mesh(sphG(1.3, 24, 16), SM(0xffffff, { roughness: 0.9 })), p[0], -1.4, p[1]); m.scale.y = 0.6; pine(p[0], -0.75, p[1], 1.3); }
    } else if (ti === 2) {
      const cm = SM(0x3f8a3a, { roughness: 0.7 });
      const cactus = (x, y, z, s) => { const t = new THREE.Group(); const a = new THREE.Mesh(capG(0.11, 0.5), cm); a.position.y = 0.36; a.castShadow = true; t.add(a); for (const sd of [-1, 1]) { const b = new THREE.Mesh(capG(0.07, 0.18), cm); b.position.set(sd * 0.2, 0.36 + sd * 0.06, 0); b.castShadow = true; t.add(b); const c = new THREE.Mesh(capG(0.07, 0.08), cm); c.rotation.z = Math.PI / 2; c.position.set(sd * 0.12, 0.3 + sd * 0.06, 0); t.add(c); } t.scale.setScalar(s); add(t, x, y, z); };
      rim(12, (x, z, i) => { if (i % 2) cactus(x, 0, z, rnd(0.55, 0.85)); else add(new THREE.Mesh(sphG(0.2, 12, 8), SM(0xb8793a, { roughness: 0.8 })), x, 0.05, z, 1).scale.set(1.2, 0.6, 1); });
      const pm2 = SM(0xe9c070, { roughness: 0.85 }); for (const p of [[-W / 2 - 3, -H / 2 + 1, 2.2], [W / 2 + 3.2, H / 2 - 3.5, 1.7], [W / 2 + 2.6, -H / 2 - 2.6, 2.6], [-W / 2 - 2.8, H / 2 + 1.8, 1.4]]) { const m = add(new THREE.Mesh(new THREE.ConeGeometry(p[2], p[2] * 1.25, 4), pm2), p[0], -1.45 + p[2] * 0.6, p[1], 1); m.rotation.y = 0.6; }
      out(8, (x, z) => add(new THREE.Mesh(sphG(1.2, 16, 10), SM(0xeccb80, { roughness: 0.95 })), x, -1.5, z).scale.set(rnd(1, 2), 0.25, rnd(1, 1.6)));
    } else if (ti === 3) {
      const sp = new Float32Array(600 * 3); for (let i = 0; i < 600; i++) { const a = rnd(0, TAU), r = rnd(14, 45); sp[i * 3] = Math.cos(a) * r; sp[i * 3 + 1] = rnd(-6, 16); sp[i * 3 + 2] = Math.sin(a) * r - 6; }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); D.add(new THREE.Points(bg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.16 })));
      rim(12, (x, z, i) => { add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.4, 8), SM(0x8f9cbd, { metalness: 0.7, roughness: 0.3 })), x, 0.2, z, 1); add(new THREE.Mesh(sphG(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x22e0ff : 0xff2bd6 })), x, 0.45, z); });
      const planet = (x, y, z, r, c, ring) => { add(new THREE.Mesh(sphG(r, 28, 20), SM(c, { roughness: 0.6 })), x, y, z); if (ring) { const t = add(new THREE.Mesh(new THREE.TorusGeometry(r * 1.6, r * 0.09, 8, 48), SM(ring, { roughness: 0.5 })), x, y, z); t.rotation.set(1.2, 0.3, 0); t.scale.z = 0.3; } };
      planet(-W / 2 - 3.2, -0.6, -H / 2 + 1, 1.5, 0xff8a4b, 0xffe0a8); planet(W / 2 + 3.4, -1, H / 2 - 3, 1.1, 0x4bd6ff, null); planet(W / 2 + 2.6, 0, -H / 2 - 3, 0.8, 0xb06bff, 0xffffff);
      out(10, (x, z) => add(new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(0.25, 0.6), 0), SM(0x6b6f88, { roughness: 0.9, flatShading: true })), x, rnd(-1.6, -0.4), z));
    } else {
      const rk = SM(0x2a2228, { roughness: 0.9, flatShading: true });
      rim(12, (x, z, i) => { const m = add(new THREE.Mesh(new THREE.ConeGeometry(rnd(0.12, 0.2), rnd(0.35, 0.7), 5), rk), x, 0.2, z, 1); m.rotation.z = rnd(-0.2, 0.2); });
      for (const p of [[-W / 2 - 3, -H / 2 + 1.2, 1.9], [W / 2 + 3.1, H / 2 - 3.4, 1.5], [W / 2 + 2.6, -H / 2 - 2.8, 2.3]]) { add(new THREE.Mesh(new THREE.CylinderGeometry(p[2] * 0.3, p[2], p[2] * 1.2, 10), rk), p[0], -1.45 + p[2] * 0.55, p[1], 1); add(new THREE.Mesh(new THREE.CylinderGeometry(p[2] * 0.26, p[2] * 0.26, 0.06, 10), new THREE.MeshBasicMaterial({ color: 0xffa01f })), p[0], -1.45 + p[2] * 1.16, p[1]); }
      out(9, (x, z) => add(new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(0.4, 0.8), 0), rk), x, -1.4, z));
    }
    g.add(D); return D;
  }
  const I = { g, water: null, foam, foam2, theme: -1, T: THEMES[0],
    setTheme(ti) {
      if (ti === this.theme) return; this.theme = ti; const T = (this.T = THEMES[ti]); srand = 7 + ti * 13;
      const X = TX[ti] || (TX[ti] = textures(T, ti)); this.water = X.wt; waterM.map = X.wt; waterM.needsUpdate = true; dirtM.map = X.dt; dirtM.needsUpdate = true; fieldM.map = X.gt; fieldM.needsUpdate = true;
      slabM.color.set(T.slab); curbM.color.set(T.curb); scene.background.set(T.sky); foam.material.color.set(T.foam); foam2.material.color.set(T.foam); foam.visible = foam2.visible = ti !== 3 && ti !== 2;
      hemi.color.set(T.hemi[0]); hemi.groundColor.set(T.hemi[1]); hemi.intensity = T.hemi[2]; sun.color.set(T.sun[0]); sun.intensity = T.sun[1];
      for (let i = 0; i < DEC.length; i++) if (DEC[i]) DEC[i].visible = false; (DEC[ti] || (DEC[ti] = decor(ti))).visible = true;
    } };
  I.setTheme(0); I.water0 = I.water; return I;
}

// ---------- blocks ----------
function brickTex(B) {
  return ctex(256, 256, (x, w, h) => {
    x.fillStyle = B[0]; x.fillRect(0, 0, w, h);
    const rows = 3, bh = h / rows;
    for (let r = 0; r < rows; r++) { const off = r % 2 ? -64 : 0; for (let i = 0; i < 3; i++) { const bx = off + i * 128 + 5, by = r * bh + 5, bw = 118, bb = bh - 10;
      const gr = x.createLinearGradient(0, by, 0, by + bb); gr.addColorStop(0, B[1]); gr.addColorStop(0.18, B[2]); gr.addColorStop(1, B[3]); x.fillStyle = gr;
      x.beginPath(); x.roundRect(bx, by, bw, bb, 10); x.fill(); x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.roundRect(bx + 6, by + 5, bw - 12, 7, 4); x.fill(); } }
  });
}
function goldTex() { return ctex(128, 128, (x) => { x.fillStyle = '#ffc61a'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#e09a00'; x.lineWidth = 8; x.strokeRect(10, 10, 108, 108); x.fillStyle = '#fff6c2'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 16 : 38, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(64 + Math.cos(a) * r, 66 + Math.sin(a) * r); } x.closePath(); x.fill(); x.strokeStyle = '#c47f00'; x.lineWidth = 4; x.stroke(); }); }
function Blocks(scene) {
  const N = COLS * ROWS, d = new THREE.Object3D(), Z = new THREE.Matrix4().makeScale(0, 0, 0), BT = THEMES.map(() => null);
  const brick = new THREE.InstancedMesh(new RoundedBoxGeometry(0.92, 0.84, 0.92, 4, 0.12), SM(0xffffff, { roughness: 0.6 }), N);
  const cap = new THREE.InstancedMesh(new RoundedBoxGeometry(0.8, 0.2, 0.8, 4, 0.095), SM(0x3d9428, { roughness: 0.85 }), N);
  const stone = new THREE.InstancedMesh(new RoundedBoxGeometry(0.96, 0.96, 0.96, 4, 0.18), SM(0x8f9cbd, { roughness: 0.55 }), N);
  const stoneTop = new THREE.InstancedMesh(new RoundedBoxGeometry(0.7, 0.14, 0.7, 4, 0.065), SM(0xc5cfe6, { roughness: 0.5 }), N);
  const gold = new THREE.InstancedMesh(new RoundedBoxGeometry(0.9, 0.9, 0.9, 4, 0.16), new THREE.MeshPhysicalMaterial({ map: goldTex(), color: 0xffffff, roughness: 0.28, metalness: 0.35, clearcoat: 0.6 }), N);
  const ALL = [brick, cap, stone, stoneTop, gold];
  for (const m of ALL) { m.castShadow = m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
  const set = (m, i, x, y, z, s = 1) => { d.position.set(x, y, z); d.scale.setScalar(s); d.rotation.set(0, 0, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
  return {
    setTheme(ti) { const T = THEMES[ti]; brick.material.map = BT[ti] || (BT[ti] = brickTex(T.brick)); brick.material.needsUpdate = true; cap.material.color.set(T.cap); stone.material.color.set(T.stone); stoneTop.material.color.set(T.stoneTop); },
    sync(grid, drop) {
      for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
        const i = cy * COLS + cx, v = grid[cy][cx], x = wx(cx), z = wz(cy);
        if (v === 2) { set(brick, i, x, 0.42, z); set(cap, i, x, 0.84, z); } else { brick.setMatrixAt(i, Z); cap.setMatrixAt(i, Z); }
        if (v === 3) set(gold, i, x, 0.45, z); else gold.setMatrixAt(i, Z);
        if (v === 1) { const dy = (drop && drop[i]) || 0; set(stone, i, x, 0.48 + dy, z); set(stoneTop, i, x, 0.93 + dy, z); } else { stone.setMatrixAt(i, Z); stoneTop.setMatrixAt(i, Z); }
      }
      for (const m of ALL) m.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------- particles (instanced cubes) ----------
function Particles(scene, N = 320) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), N); mesh.frustumCulled = false; scene.add(mesh);
  const P = []; for (let i = 0; i < N; i++) P.push({ life: 0 }); let head = 0; const d = new THREE.Object3D(), c = new THREE.Color();
  for (let i = 0; i < N; i++) { d.scale.setScalar(0); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); mesh.setColorAt(i, c.set(0xffffff)); }
  return {
    emit(x, y, z, col, n, sp = 3, size = 0.13, up = 4, life = 0.8) {
      for (let k = 0; k < n; k++) { const p = P[head], a = Math.random() * TAU, r = Math.random() * sp; head = (head + 1) % N;
        p.x = x; p.y = y; p.z = z; p.vx = Math.cos(a) * r; p.vz = Math.sin(a) * r; p.vy = up * (0.5 + Math.random() * 0.7); p.life = p.max = life * (0.6 + Math.random() * 0.6); p.s = size * (0.6 + Math.random() * 0.8); p.rx = Math.random() * 6; p.ry = Math.random() * 6; p.sx = p.sy = 1;
        mesh.setColorAt(P.indexOf(p), c.set(Array.isArray(col) ? col[(Math.random() * col.length) | 0] : col)); }
      mesh.instanceColor.needsUpdate = true;
    },
    update(dt) {
      for (let i = 0; i < N; i++) { const p = P[i]; if (p.life <= 0) continue; p.life -= dt; p.vy -= 12 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.y < 0.06) { p.y = 0.06; p.vy *= -0.4; p.vx *= 0.7; p.vz *= 0.7; }
        p.rx += dt * 7; p.ry += dt * 5; const s = p.life <= 0 ? 0 : p.s * Math.min(1, p.life / p.max * 2.5); d.position.set(p.x, p.y, p.z); d.rotation.set(p.rx, p.ry, 0); d.scale.setScalar(s); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------- bomb model: navy toy bomb with the FLIX feather crest as its fuse ----------
function makeBombModel(col) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  M(sphG(0.34, 32, 24), PM(col || 0x0b2f66, { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }), b, 0, 0.36, 0);
  const band = M(new THREE.TorusGeometry(0.335, 0.035, 10, 32), PM(0xffd41f, { roughness: 0.3 }), b, 0, 0.36, 0); band.rotation.x = Math.PI / 2;
  const cr = featherCrest([0x2a80dc, 0x2fa043, 0xffd41f], 0.42, 0.15); cr.position.set(0, 0.62, 0); b.add(cr);
  const glow = M(sphG(0.345, 24, 16), new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0, depthWrite: false }), b, 0, 0.36, 0); glow.castShadow = false;
  g.userData = { b, glow, cr }; return g;
}
// ---------- blast puffs ----------
function Blasts(scene) {
  const mats = [new THREE.MeshBasicMaterial({ color: 0xff4a1c }), new THREE.MeshBasicMaterial({ color: 0xffa81f }), new THREE.MeshBasicMaterial({ color: 0xfff4b8 })];
  const geo = new THREE.IcosahedronGeometry(1, 2), pool = [], live = [];
  const ringG = new THREE.RingGeometry(0.75, 1, 40), rings = [];
  return {
    add(cx, cy, delay, life) {
      const o = pool.pop() || (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(geo, mats[i]); m.position.y = i * 0.22; g.add(m); } scene.add(g); return g; })();
      o.visible = true; o.position.set(wx(cx), 0.45, wz(cy)); o.rotation.y = Math.random() * 6; o.scale.setScalar(0.001); o.userData = { t: -delay, life, k: 0.9 + Math.random() * 0.2 }; live.push(o);
    },
    ring(cx, cy) { const m = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(wx(cx), 0.06, wz(cy)); m.userData.t = 0; scene.add(m); rings.push(m); },
    update(dt) {
      for (let i = live.length - 1; i >= 0; i--) { const o = live[i], u = o.userData; u.t += dt; if (u.t < 0) continue; const t = u.t / u.life;
        if (t >= 1) { o.visible = false; live.splice(i, 1); pool.push(o); continue; }
        const s = t < 0.22 ? 1.15 * Math.sin(t / 0.22 * Math.PI / 2) : 1.15 - (t - 0.22) / 0.78 * 1.15; o.scale.setScalar(Math.max(0.001, s) * u.k);
        o.children[0].scale.setScalar(0.56 + Math.sin(u.t * 30) * 0.03); o.children[1].scale.setScalar(0.44 * (1 - t * 0.3)); o.children[2].scale.setScalar(0.3 * (1 - t * 0.6)); o.rotation.y += dt * 3; o.position.y = 0.45 + t * 0.25; }
      for (let i = rings.length - 1; i >= 0; i--) { const m = rings[i]; m.userData.t += dt * 2.6; const t = m.userData.t; m.scale.setScalar(0.4 + t * 2.4); m.material.opacity = 0.9 * (1 - t); if (t >= 1) { scene.remove(m); m.material.dispose(); rings.splice(i, 1); } }
    },
    clear() { for (const o of live) { o.visible = false; pool.push(o); } live.length = 0; },
  };
}
// ---------- power-ups ----------
const PU = {
  bomb: { bg: '#0b2f66', ring: 0xffd41f, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.arc(60, 72, 30, 0, 7); x.fill(); x.fillRect(52, 30, 16, 18); x.strokeStyle = '#ffd41f'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(62, 30); x.quadraticCurveTo(74, 12, 92, 20); x.stroke(); x.fillStyle = '#0b2f66'; x.font = '900 34px Arial'; x.textAlign = 'center'; x.fillText('+1', 60, 84); } },
  range: { bg: '#e22511', ring: 0xffd41f, draw(x) { x.fillStyle = '#ffd41f'; x.beginPath(); x.moveTo(64, 12); x.bezierCurveTo(108, 52, 104, 112, 64, 114); x.bezierCurveTo(22, 112, 22, 66, 44, 46); x.bezierCurveTo(48, 62, 58, 62, 64, 12); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(64, 62); x.bezierCurveTo(86, 84, 82, 108, 64, 108); x.bezierCurveTo(46, 108, 44, 86, 64, 62); x.fill(); } },
  speed: { bg: '#1f9a3a', ring: 0xffffff, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(74, 10); x.lineTo(30, 70); x.lineTo(58, 70); x.lineTo(48, 118); x.lineTo(98, 52); x.lineTo(68, 52); x.closePath(); x.fill(); } },
};
Object.assign(PU, {
  kick: { bg: '#f4a900', ring: 0xffffff, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.roundRect(40, 18, 30, 62, 10); x.fill(); x.beginPath(); x.roundRect(40, 66, 66, 34, 14); x.fill(); x.fillStyle = '#022753'; x.fillRect(40, 96, 66, 8); x.strokeStyle = '#fff'; x.lineWidth = 6; x.lineCap = 'round'; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(12, 40 + i * 20); x.lineTo(30, 40 + i * 20); x.stroke(); } } },
  pierce: { bg: '#c21a1a', ring: 0xffffff, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 26, 0, 7); x.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(64 + Math.cos(a - 0.22) * 24, 64 + Math.sin(a - 0.22) * 24); x.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52); x.lineTo(64 + Math.cos(a + 0.22) * 24, 64 + Math.sin(a + 0.22) * 24); x.fill(); } } },
  vest: { bg: '#1f6fe0', ring: 0xffd41f, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(64, 14); x.lineTo(104, 30); x.quadraticCurveTo(104, 92, 64, 116); x.quadraticCurveTo(24, 92, 24, 30); x.closePath(); x.fill(); x.fillStyle = '#1f6fe0'; x.fillRect(58, 40, 12, 48); x.fillRect(42, 56, 44, 12); } },
  full: { bg: '#ffd41f', ring: 0xe22511, draw(x) { x.fillStyle = '#e22511'; x.beginPath(); x.moveTo(64, 8); x.bezierCurveTo(112, 50, 108, 116, 64, 118); x.bezierCurveTo(18, 116, 18, 66, 42, 44); x.bezierCurveTo(46, 62, 58, 62, 64, 8); x.fill(); x.fillStyle = '#fff'; x.font = '900 30px Arial'; x.textAlign = 'center'; x.fillText('MAX', 64, 98); } },
  skull: { bg: '#5a2a9a', ring: 0x15121c, draw(x) { x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 54, 36, 0, 7); x.fill(); x.fillRect(42, 70, 44, 34); x.fillStyle = '#5a2a9a'; x.beginPath(); x.arc(50, 54, 10, 0, 7); x.arc(78, 54, 10, 0, 7); x.fill(); x.fillRect(54, 88, 5, 16); x.fillRect(69, 88, 5, 16); } },
});
// ---------- monsters and exit door (Macera) ----------
function makeMonster(type, col) {
  const g = new THREE.Group(), R = 0.36, C = V3(0, 0.4, 0), mat = PM(col, { roughness: 0.35, clearcoat: 0.8, transparent: type === 3, opacity: type === 3 ? 0.78 : 1 });
  const body = M(sphG(R, 28, 20), mat, g, 0, C.y, 0); if (type === 0) body.scale.set(1, 1.12, 1); if (type === 1) body.scale.set(1.05, 0.85, 1.15);
  if (type === 3) { const sk = M(new THREE.CylinderGeometry(R, R * 1.05, 0.34, 24, 1, true), mat, g, 0, 0.2, 0); sk.castShadow = false; }
  eye(g, R * 0.96, -0.38, 0.22, 0.1, type === 2 ? 0xe22511 : 0x15121c, C); eye(g, R * 0.96, 0.38, 0.22, 0.1, type === 2 ? 0xe22511 : 0x15121c, C);
  if (type === 2) { brow(g, R * 1.04, -0.4, 0.62, 0.09, -0.5, 0x15121c, C, 0.03); brow(g, R * 1.04, 0.4, 0.62, 0.09, 0.5, 0x15121c, C, 0.03); for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.08, 0.2, 12), PM(0x3a1a7a), g, s * 0.2, C.y + R * 0.9, 0); h.rotation.z = -s * 0.4; } }
  if (type === 0) { const k = M(new THREE.ConeGeometry(0.06, 0.1, 10), mat, g, 0, 0.03, 0); k.rotation.x = Math.PI; M(sphG(0.05, 10, 8), PM(0xffffff), g, 0.12, C.y + R * 0.7, 0.2); }
  if (type === 1) for (const s of [-1, 1]) M(sphG(0.1, 12, 10), PM(0xe22511, { roughness: 0.3 }), g, s * 0.2, 0.07, 0.05).scale.set(1, 0.6, 1.4);
  smile(g, R * 0.995, 0, -0.25, 0.08, 0x15121c, C);
  return g;
}
function makeDoor() {
  const g = new THREE.Group();
  const base = M(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 32), PM(0x3a2a55, { roughness: 0.5 }), g, 0, 0.04, 0);
  const pad = M(new THREE.CylinderGeometry(0.33, 0.33, 0.1, 32), new THREE.MeshBasicMaterial({ color: 0x55406e }), g, 0, 0.05, 0); pad.castShadow = false;
  const ring = M(new THREE.TorusGeometry(0.4, 0.045, 10, 32), PM(0x9aa6c2, { roughness: 0.4 }), g, 0, 0.08, 0); ring.rotation.x = Math.PI / 2;
  g.userData.open = () => { pad.material.color.set(0x7dff6b); ring.material = PM(0xffd41f, { roughness: 0.3 }); };
  return g;
}
function makePowerup(type) {
  const k = PU[type], g = new THREE.Group(), s = new THREE.Group(); g.add(s);
  const tex = k.tex || (k.tex = ctex(128, 128, (x) => { x.fillStyle = k.bg; x.fillRect(0, 0, 128, 128); k.draw(x); }));
  const disc = M(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32), [PM(k.ring, { roughness: 0.3, clearcoat: 0.8 }), SM(0xffffff, { map: tex, roughness: 0.35 }), SM(0xffffff, { map: tex, roughness: 0.35 })], s); disc.rotation.x = Math.PI / 2; disc.rotation.y = Math.PI / 2;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; g.add(halo);
  s.position.y = 0.5; g.userData = { s, type }; return g;
}
