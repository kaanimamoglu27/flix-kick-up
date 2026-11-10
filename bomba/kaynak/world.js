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
  scene.add(new THREE.HemisphereLight(0xdff3ff, 0x6fbf3a, 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.5); sun.position.set(-6, 14, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  return { scene, sun };
}

function buildIsland(scene) {
  const g = new THREE.Group(); scene.add(g);
  // water
  const wt = ctex(512, 512, (x, w, h) => {
    x.fillStyle = '#1f9ee8'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const px = rnd(0, w), py = rnd(0, h), r = rnd(26, 70); x.strokeStyle = 'rgba(150,225,255,' + rnd(0.25, 0.55).toFixed(2) + ')'; x.lineWidth = rnd(4, 9); x.lineCap = 'round';
      for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.beginPath(); x.ellipse(px + ox, py + oy, r, r * 0.5, 0, 0.2, 2.2); x.stroke(); } }
  }, true); wt.repeat.set(9, 9);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ map: wt })); water.rotation.x = -Math.PI / 2; water.position.y = -1.45; g.add(water);
  // island body
  const W = COLS + 2.2, H = ROWS + 2.2;
  const dirtT = ctex(256, 128, (x, w, h) => { x.fillStyle = '#d9722f'; x.fillRect(0, 0, w, h); x.fillStyle = '#c05e22'; for (let i = 0; i < 4; i++) x.fillRect(0, 28 + i * 28, w, 9); x.fillStyle = '#e98a44'; for (let i = 0; i < 16; i++) x.fillRect(rnd(0, w), rnd(0, h), rnd(10, 30), 5); }, true); dirtT.repeat.set(6, 1);
  const dirt = new THREE.Mesh(new RoundedBoxGeometry(W - 0.5, 1.5, H - 0.5, 4, 0.3), SM(0xffffff, { map: dirtT, roughness: 0.9 })); dirt.position.y = -0.95; dirt.receiveShadow = true; g.add(dirt);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(W, 0.5, H, 5, 0.24), SM(0x6cc22c, { roughness: 0.85 })); slab.position.y = -0.252; slab.receiveShadow = true; g.add(slab);
  const foam = new THREE.Mesh(new RoundedBoxGeometry(W + 0.5, 0.06, H + 0.5, 4, 0.03), new THREE.MeshBasicMaterial({ color: 0xffffff })); foam.position.y = -1.44; g.add(foam);
  const foam2 = new THREE.Mesh(new RoundedBoxGeometry(W + 1.3, 0.04, H + 1.3, 4, 0.02), new THREE.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.6 })); foam2.position.y = -1.445; g.add(foam2);
  // checker grass playfield
  const S = 64, gt = ctex(COLS * S, ROWS * S, (x, w, h) => {
    for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
      x.fillStyle = (cx + cy) % 2 ? '#93dc3c' : '#84d032'; x.fillRect(cx * S, cy * S, S, S);
      for (let i = 0; i < 5; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,170,.16)' : 'rgba(40,120,20,.14)'; const px = cx * S + rnd(6, S - 10), py = cy * S + rnd(6, S - 10); x.beginPath(); x.ellipse(px, py, 2.4, 5, rnd(-0.5, 0.5), 0, 7); x.fill(); }
    }
  });
  const field = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), SM(0xffffff, { map: gt, roughness: 0.9 })); field.rotation.x = -Math.PI / 2; field.position.y = 0.002; field.receiveShadow = true; g.add(field);
  // border: a low rounded stone curb around the playfield
  const curbM = SM(0x8f9cbd, { roughness: 0.6 });
  for (const s of [-1, 1]) {
    const a = new THREE.Mesh(new RoundedBoxGeometry(COLS + 0.72, 0.42, 0.34, 4, 0.14), curbM); a.position.set(0, 0.16, s * (ROWS / 2 + 0.19)); a.castShadow = a.receiveShadow = true; g.add(a);
    const b = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.42, ROWS + 0.72, 4, 0.14), curbM); b.position.set(s * (COLS / 2 + 0.19), 0.16, 0); b.castShadow = b.receiveShadow = true; g.add(b);
  }
  // decor: bushes and flowers on the outer rim, rocks and small islands in the water
  const bushM = SM(0x3fa52a, { roughness: 0.8 }), bushM2 = SM(0x58c234, { roughness: 0.8 });
  const bush = (x, z, s) => { const b = new THREE.Group(); for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(sphG(0.3, 16, 12), i % 2 ? bushM : bushM2); m.position.set((i - 1) * 0.26, 0.18 + (i === 1 ? 0.12 : 0), rnd(-0.08, 0.08)); m.scale.setScalar(i === 1 ? 1.15 : 0.9); m.castShadow = true; b.add(m); } b.position.set(x, 0, z); b.scale.setScalar(s * 0.7); g.add(b); };
  const flower = (x, z, c) => { const f = new THREE.Group(); const st = new THREE.Mesh(capG(0.02, 0.2), SM(0x2f8a22)); st.position.y = 0.12; f.add(st); const hd = new THREE.Mesh(sphG(0.09, 12, 10), SM(c, { roughness: 0.4 })); hd.position.y = 0.27; hd.scale.y = 0.7; hd.castShadow = true; f.add(hd); const ce = new THREE.Mesh(sphG(0.045, 10, 8), SM(0xffe14a)); ce.position.y = 0.3; f.add(ce); f.position.set(x, 0, z); g.add(f); };
  const ex = W / 2 - 0.36, ez = H / 2 - 0.36;
  for (let i = 0; i < 14; i++) { const side = i % 4, t = rnd(-0.9, 0.9); const x = side < 2 ? t * ex : (side === 2 ? -ex : ex) + rnd(-0.1, 0.1), z = side < 2 ? (side ? ez : -ez) + rnd(-0.1, 0.1) : t * ez; if (i % 3 === 0) bush(x, z, rnd(0.7, 1)); else flower(x, z, [0xff4f7a, 0xffffff, 0xffb31f, 0xb06bff][i % 4]); }
  const rockM = SM(0x8a96b4, { roughness: 0.6 });
  for (let i = 0; i < 9; i++) { const a = rnd(0, TAU), r = rnd(1.2, 3.2); const m = new THREE.Mesh(sphG(0.5, 14, 10), rockM); m.position.set(Math.cos(a) * (W / 2 + r), -1.4, Math.sin(a) * (H / 2 + r)); m.scale.set(rnd(0.6, 1.3), rnd(0.4, 0.8), rnd(0.6, 1.2)); g.add(m); }
  const islet = (x, z, s, toyCols) => { const I = new THREE.Group(); I.position.set(x, -1.45, z); I.scale.setScalar(s); g.add(I);
    const sand = new THREE.Mesh(sphG(1.6, 28, 16), SM(0xf4d68a, { roughness: 0.9 })); sand.scale.y = 0.22; I.add(sand);
    const hill = new THREE.Mesh(sphG(1.15, 28, 18), SM(0x62c22e, { roughness: 0.85 })); hill.scale.y = 0.75; hill.position.y = 0.1; hill.castShadow = true; I.add(hill);
    if (toyCols) { const t = featherCrest(toyCols, 1.5, 0.48); t.position.y = 0.85; I.add(t); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 12, 0, TAU, 0, Math.PI / 2), SM(0xf08a24, { roughness: 0.5 })); dome.position.y = 0.62; dome.scale.y = 0.6; I.add(dome); }
    return I; };
  islet(-W / 2 - 2.6, -H / 2 + 1.5, 1, [0x2a80dc, 0x2fa043, 0xffd41f]); islet(W / 2 + 2.9, H / 2 - 3.5, 0.9, [0xe22511, 0xffffff, 0xff7ab0]); islet(W / 2 + 2.2, -H / 2 - 2.6, 1.2, null); islet(-W / 2 - 2.8, H / 2 + 1.5, 0.8, null);
  return { g, water: wt, foam, foam2 };
}

// ---------- blocks ----------
function brickTex() {
  return ctex(256, 256, (x, w, h) => {
    x.fillStyle = '#b63a17'; x.fillRect(0, 0, w, h);
    const rows = 3, bh = h / rows;
    for (let r = 0; r < rows; r++) { const off = r % 2 ? -64 : 0; for (let i = 0; i < 3; i++) { const bx = off + i * 128 + 5, by = r * bh + 5, bw = 118, bb = bh - 10;
      const gr = x.createLinearGradient(0, by, 0, by + bb); gr.addColorStop(0, '#ff7a3d'); gr.addColorStop(0.18, '#f0582a'); gr.addColorStop(1, '#de4a20'); x.fillStyle = gr;
      x.beginPath(); x.roundRect(bx, by, bw, bb, 10); x.fill(); x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.roundRect(bx + 6, by + 5, bw - 12, 7, 4); x.fill(); } }
  });
}
function Blocks(scene) {
  const N = COLS * ROWS, d = new THREE.Object3D(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  const brick = new THREE.InstancedMesh(new RoundedBoxGeometry(0.92, 0.84, 0.92, 4, 0.12), SM(0xffffff, { map: brickTex(), roughness: 0.6 }), N);
  const cap = new THREE.InstancedMesh(new RoundedBoxGeometry(0.8, 0.2, 0.8, 4, 0.095), SM(0x7ed334, { roughness: 0.8 }), N);
  const stone = new THREE.InstancedMesh(new RoundedBoxGeometry(0.96, 0.96, 0.96, 4, 0.18), SM(0x8f9cbd, { roughness: 0.55 }), N);
  const stoneTop = new THREE.InstancedMesh(new RoundedBoxGeometry(0.7, 0.14, 0.7, 4, 0.065), SM(0xc5cfe6, { roughness: 0.5 }), N);
  for (const m of [brick, cap, stone, stoneTop]) { m.castShadow = m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
  const set = (m, i, x, y, z, s = 1) => { d.position.set(x, y, z); d.scale.setScalar(s); d.rotation.set(0, 0, 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix); };
  return {
    sync(grid, drop) {
      for (let cy = 0; cy < ROWS; cy++) for (let cx = 0; cx < COLS; cx++) {
        const i = cy * COLS + cx, v = grid[cy][cx], x = wx(cx), z = wz(cy);
        if (v === 2) { set(brick, i, x, 0.42, z); set(cap, i, x, 0.84, z); } else { brick.setMatrixAt(i, Z); cap.setMatrixAt(i, Z); }
        if (v === 1) { const dy = (drop && drop[i]) || 0; set(stone, i, x, 0.48 + dy, z); set(stoneTop, i, x, 0.93 + dy, z); } else { stone.setMatrixAt(i, Z); stoneTop.setMatrixAt(i, Z); }
      }
      for (const m of [brick, cap, stone, stoneTop]) m.instanceMatrix.needsUpdate = true;
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
function makeBombModel() {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  M(sphG(0.34, 32, 24), PM(0x0b2f66, { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }), b, 0, 0.36, 0);
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
function makePowerup(type) {
  const k = PU[type], g = new THREE.Group(), s = new THREE.Group(); g.add(s);
  const tex = k.tex || (k.tex = ctex(128, 128, (x) => { x.fillStyle = k.bg; x.fillRect(0, 0, 128, 128); k.draw(x); }));
  const disc = M(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32), [PM(k.ring, { roughness: 0.3, clearcoat: 0.8 }), SM(0xffffff, { map: tex, roughness: 0.35 }), SM(0xffffff, { map: tex, roughness: 0.35 })], s); disc.rotation.x = Math.PI / 2; disc.rotation.y = Math.PI / 2;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.02; g.add(halo);
  s.position.y = 0.5; g.userData = { s, type }; return g;
}
