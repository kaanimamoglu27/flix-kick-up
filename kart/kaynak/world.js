// ===== Flix Kart v5 world: terrain that hugs the road, sky dome, water / lava, biome props (instanced) =====
const BIOME = {
  mutfak: { sky: ['#1f7fd8', '#7cc4f5', '#e9f6ff'], cloud: '255,255,255', fog: 0xdcefff, fogN: 150, fogF: 640, hc: 0xe6f3ff, hg: 0xd9b872, sun: 0xfff1d0, sunI: 3.5, env: 0.6,
    amp: 3, far: [-9, 17], sea: -1.7, seaCol: 0x18a6c8, lowH: -1.0, highH: 8, pal: [0xcdb47c, 0xf2deaa, 0x6fae48, 0xa39474], shoulder: 0xe6cf98, dust: 0xf3e2b4, peaks: [4, 34, 70, 0],
    props: [['palm', 46, 4.5, 75, 0.8, 1.25, -0.9, 7], ['rock', 30, 4, 110, 0.6, 2.2, -2.2, 30], ['umbrella', 12, 5, 45, 0.9, 1.1, -0.9, 3], ['round', 40, 30, 150, 0.9, 1.5, 6, 60], ['tuft', 70, 4, 60, 0.7, 1.4, 0.5, 30]] },
  oda: { sky: ['#2a78d6', '#86c2f2', '#eaf4e6'], cloud: '255,255,255', fog: 0xdfeee0, fogN: 150, fogF: 620, hc: 0xe8f4ff, hg: 0x4f8a36, sun: 0xfff4dc, sunI: 3.3, env: 0.55,
    amp: 4.5, far: [7, 7], lowH: -3, highH: 26, pal: [0x4c9438, 0x64ae44, 0x8f9a72, 0x8a8470], shoulder: 0x9a7c52, dust: 0xcdb48a, peaks: [8, 48, 80, 0],
    props: [['pine', 70, 5, 120, 0.8, 1.5, -5, 40], ['round', 60, 5, 110, 0.8, 1.4, -5, 30], ['rock', 34, 4, 120, 0.6, 2.4, -5, 60], ['tuft', 130, 3.5, 70, 0.7, 1.5, -5, 30]] },
  bahce: { sky: ['#3a86d8', '#9ccdf0', '#ffe9c8'], cloud: '255,244,230', fog: 0xffe6c4, fogN: 150, fogF: 620, hc: 0xfff2e0, hg: 0xc47a44, sun: 0xffe2b0, sunI: 3.7, env: 0.6,
    amp: 3.5, far: [4, 4], lowH: -3, highH: 16, pal: [0xd6a468, 0xd08c50, 0xb8663a, 0xa4552f], shoulder: 0xd9a86c, dust: 0xe6b684, peaks: [9, 38, 62, 1],
    props: [['cactus', 48, 4.5, 100, 0.8, 1.6, -5, 14], ['rock', 60, 4, 130, 0.7, 3.2, -5, 60], ['mesa', 16, 14, 120, 0.8, 1.6, -5, 14], ['dry', 80, 3.5, 70, 0.7, 1.4, -5, 16]], rockCol: [0xb9683c, 0xa3562f] },
  banyo: { sky: ['#3f7fc8', '#a8d0f0', '#f1f8ff'], cloud: '255,255,255', fog: 0xeaf4ff, fogN: 130, fogF: 560, hc: 0xf4faff, hg: 0xa8c4e0, sun: 0xfff6ea, sunI: 3.1, env: 0.75,
    amp: 4, far: [9, 9], lowH: -3, highH: 30, pal: [0xdcecff, 0xf4f9ff, 0xffffff, 0x8698b0], shoulder: 0xe4eefa, dust: 0xffffff, peaks: [9, 64, 70, 0], rough: 0.6,
    props: [['spine', 80, 5, 120, 0.8, 1.5, -5, 34], ['ice', 34, 4.5, 90, 0.7, 2, -5, 30], ['rock', 30, 4, 120, 0.6, 2.2, -5, 60], ['snowman', 6, 5, 30, 0.9, 1.2, -5, 12]], rockCol: [0x8fa1b8, 0xb9c8da] },
  fabrika: { sky: ['#1a0d18', '#6a2420', '#ff8a3a'], cloud: '60,34,40', fog: 0x8a3c26, fogN: 110, fogF: 520, hc: 0xffc8a0, hg: 0x5a2416, sun: 0xffc090, sunI: 3.0, env: 0.45,
    amp: 3.5, far: [-9, -9], sea: -1.7, lava: 1, lowH: -0.9, highH: 14, pal: [0x5a2c1c, 0x3d3230, 0x2a2426, 0x4c3c36], shoulder: 0x4a3c38, dust: 0x7a6a64, peaks: [5, 40, 60, 0], volcano: 1,
    props: [['dead', 44, 5, 90, 0.8, 1.5, -0.9, 20], ['rock', 70, 4, 120, 0.7, 3, -1.5, 60], ['glow', 26, 4.5, 80, 0.7, 1.8, -1.4, 20]], rockCol: [0x3a3030, 0x51413a] },
};
const sm01 = (t) => { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };

// height field: exact road plane (minus a kerb drop) inside the corridor, blending into smoothed road altitude + rolling noise + far hills/sea
function makeField(tr, BI) {
  const N = tr.N, W = tr.W, c0 = W / 2 + 3.4, latMax = W / 2 + 0.3;
  const px = new Float32Array(N), pz = new Float32Array(N), tx = new Float32Array(N), tz = new Float32Array(N), nx = new Float32Array(N), nz = new Float32Array(N);
  let cx = 0, cz = 0; for (let i = 0; i < N; i++) { const p = tr.P[i]; px[i] = p.x; pz[i] = p.z; tx[i] = tr.Tn[i].x; tz[i] = tr.Tn[i].z; nx[i] = tr.Nm[i].x; nz[i] = tr.Nm[i].z; cx += p.x; cz += p.z; } cx /= N; cz /= N;
  let rad = 0; for (let i = 0; i < N; i++) rad = Math.max(rad, Math.hypot(px[i] - cx, pz[i] - cz));
  let sd = 7; for (const c of tr.def.w || 'a') sd = (sd * 31 + c.charCodeAt(0)) % 9973; const rr = () => { sd = (sd * 16807 + 11) % 2147483647; return (sd % 10000) / 10000; };
  const peaks = [], [pn, ph, pr, flat] = BI.peaks;
  for (let k = 0; k < pn; k++) { const a = (k + rr() * 0.6) / pn * Math.PI * 2, R = rad + 75 + rr() * 50; peaks.push({ x: cx + Math.cos(a) * R, z: cz + Math.sin(a) * R, r: pr * (0.75 + rr() * 0.5), h: ph * (0.6 + rr() * 0.6), flat }); }
  if (BI.volcano) peaks.push({ x: cx - (rad + 150) * 0.75, z: cz - (rad + 150) * 0.66, r: 120, h: 95, vol: 1 });
  const Y = tr.Y, S = tr.S, B = tr.B, out = { d: 0 };
  function H(x, z) {
    let dm = 1e12; for (let i = 0; i < N; i++) { const dx = x - px[i], dz = z - pz[i], d2 = dx * dx + dz * dz; if (d2 < dm) dm = d2; }
    const lim = dm * 2.6 + 4, e = dm + 0.02; let sw = 0, sp = 0, sw2 = 0, sr = 0;
    for (let i = 0; i < N; i++) { const dx = x - px[i], dz = z - pz[i], d2 = dx * dx + dz * dz;
      if ((i & 3) === 0) { const w2 = 1 / ((d2 + 30) * (d2 + 30)); sw2 += w2; sr += w2 * Y[i]; }
      if (d2 > lim) continue; let r = e / (d2 + 0.02); r *= r; r *= r; r *= r;
      let al = dx * tx[i] + dz * tz[i], lat = dx * nx[i] + dz * nz[i]; al = al < -6 ? -6 : al > 6 ? 6 : al; lat = lat < -latMax ? -latMax : lat > latMax ? latMax : lat;
      sp += r * (Y[i] + S[i] * al + B[i] * lat); sw += r; }
    const d = Math.sqrt(dm), plane = sp / sw, R = sr / sw2, wc = 1 - sm01((d - c0) / 14), f = sm01((d - c0) / 55);
    const n = Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 + 0.4) + 0.5 * Math.sin(x * 0.043 + z * 0.031 + 2.1) + 0.25 * Math.sin(x * 0.09 - z * 0.07) + 0.12 * Math.sin(x * 0.21 + 0.7) * Math.sin(z * 0.19);
    const g = Math.max(0, Math.min(1, 0.5 + ((x - cx) * 0.74 + (z - cz) * 0.67) / (rad * 1.5))), farV = BI.far[0] + (BI.far[1] - BI.far[0]) * g;
    let pk = 0; for (const p of peaks) { const q = 1 - Math.hypot(x - p.x, z - p.z) / p.r; if (q <= 0) continue; if (p.far === undefined && BI.far[0] !== BI.far[1] && g < 0.45 && !p.vol) continue;
      pk += p.h * (p.flat ? sm01(q * 2.6) * (0.9 + 0.1 * Math.sin(x * 0.3) * Math.sin(z * 0.27)) : p.vol ? Math.min(q * q * 1.25, 0.72 + (0.76 - q) * 0.6) : q * q * (3 - 2 * q) * (0.85 + 0.15 * Math.sin(x * 0.11 + z * 0.13))); }
    const hf = R * (1 - f) + BI.amp * n * (0.1 + 0.9 * f) + farV * f * f + pk * f - 0.85;
    out.d = d; return wc * (plane - 0.85) + (1 - wc) * hf;
  }
  return { H, out, cx, cz, rad, peaks };
}

// ---------- tiny geometry merger with vertex colours (one draw call per prop type) ----------
function mergeG(parts) {
  const pos = [], nor = [], col = [], idx = []; let base = 0; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), nm = new THREE.Matrix3(), c = new THREE.Color();
  for (const [g, color, p = [0, 0, 0], r = [0, 0, 0], s = 1, order = 'XYZ'] of parts) {
    m.compose(new THREE.Vector3(p[0], p[1], p[2]), q.setFromEuler(e.set(r[0], r[1], r[2], order)), typeof s === 'number' ? new THREE.Vector3(s, s, s) : new THREE.Vector3(s[0], s[1], s[2])); nm.getNormalMatrix(m); c.set(color);
    const P = g.attributes.position, Nn = g.attributes.normal;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m); pos.push(v.x, v.y, v.z); v.fromBufferAttribute(Nn, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); const k = 0.9 + 0.2 * ((i * 7919) % 13) / 13; col.push(c.r * k, c.g * k, c.b * k); }
    if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + base); else for (let i = 0; i < P.count; i++) idx.push(base + i); base += P.count; g.dispose(); }
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); o.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); o.setIndex(idx); return o;
}
const Cy = (a, b, h, s = 7) => new THREE.CylinderGeometry(a, b, h, s), Co = (r, h, s = 7) => new THREE.ConeGeometry(r, h, s), Ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d), Dod = (r) => new THREE.DodecahedronGeometry(r, 0), Sp = (r) => new THREE.SphereGeometry(r, 10, 8);
const PROPG = {
  palm() { const p = []; let x = 0, y = 0; for (let k = 0; k < 5; k++) { const t = 0.07 * k; p.push([Cy(0.4 - 0.04 * k, 0.5 - 0.04 * k, 2.5, 7), k % 2 ? 0x9a7448 : 0x8a6238, [x + Math.sin(t) * 1.2, y + 1.2, 0], [0, 0, -t]]); x += Math.sin(t) * 2.4; y += Math.cos(t) * 2.4; }
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, dr = 0.25 + (i % 3) * 0.22, L = 5.6 - (i % 2) * 0.9, th = -(Math.PI / 2 + dr), ox = -Math.sin(th) * L / 2, oy = Math.cos(th) * L / 2;
      p.push([Co(1.0, L, 4), i % 2 ? 0x3f9a3c : 0x2f8234, [x + ox * Math.cos(a), y + oy + 0.2, -ox * Math.sin(a)], [0, a, th], [1, 1, 0.16], 'YZX']); }
    for (let i = 0; i < 3; i++) p.push([Sp(0.36), 0x5a3a1a, [x + Math.cos(i * 2.1) * 0.5, y - 0.25, Math.sin(i * 2.1) * 0.5]]); return mergeG(p); },
  pine(snow) { const g = snow ? [0x3d6b58, 0xeaf3fb, 0xffffff] : [0x2b6436, 0x33743e, 0x3f8748]; return mergeG([[Cy(0.34, 0.5, 2.6, 6), 0x6a4a2c, [0, 1.3, 0]], [Co(3.3, 4.8, 8), g[0], [0, 4.4, 0]], [Co(2.6, 4.2, 8), g[1], [0, 6.9, 0]], [Co(1.8, 3.8, 8), g[2], [0, 9.3, 0]]]); },
  spine() { return PROPG.pine(1); },
  round() { return mergeG([[Cy(0.35, 0.55, 3.4, 6), 0x6f4c2e, [0, 1.7, 0]], [Ico(2.7), 0x3f8f3a, [0, 5.2, 0], [0, 0, 0], [1, 0.9, 1]], [Ico(2.0), 0x4da445, [1.6, 6.3, 0.6]], [Ico(1.8), 0x358035, [-1.5, 6.0, -0.8]], [Ico(1.6), 0x58b04c, [0.2, 7.3, -0.4]]]); },
  rock(c = [0x8d8672, 0xa39c88]) { return mergeG([[Dod(1.4), c[0], [0, 0.5, 0], [0.3, 0.5, 0.1], [1.3, 0.8, 1]], [Dod(0.9), c[1], [1.2, 0.3, 0.5], [1, 0.2, 0.7], [1, 0.7, 1.2]], [Dod(0.6), c[0], [-1.1, 0.2, -0.6], [0.2, 1, 0.4]]]); },
  mesa(c = [0xb9683c, 0xa3562f]) { return mergeG([[Cy(2.6, 3.6, 5, 7), c[0], [0, 2.3, 0]], [Cy(2.0, 2.6, 3.5, 7), c[1], [0.3, 6.3, 0.2]], [Cy(1.3, 2.0, 2.4, 6), c[0], [0.2, 9.0, 0]], [Dod(1.6), c[1], [3, 0.6, 1.2], [0.3, 0.2, 0.5]]]); },
  cactus() { const c = 0x4f8a4a, d = 0x5f9c56; return mergeG([[Cy(0.7, 0.8, 6, 9), c, [0, 3, 0]], [Sp(0.7), c, [0, 6, 0]], [Cy(0.4, 0.4, 1.6, 7), d, [1.2, 3, 0], [0, 0, Math.PI / 2]], [Cy(0.4, 0.42, 2.4, 7), d, [1.9, 4, 0]], [Sp(0.4), d, [1.9, 5.2, 0]],
    [Cy(0.36, 0.36, 1.4, 7), d, [-1.1, 2.2, 0], [0, 0, Math.PI / 2]], [Cy(0.36, 0.38, 1.8, 7), d, [-1.7, 2.9, 0]], [Sp(0.36), d, [-1.7, 3.8, 0]], [Sp(0.22), 0xff6aa8, [0.2, 6.6, 0.2]]]); },
  dead() { const c = 0x2a2020; return mergeG([[Cy(0.25, 0.5, 5, 6), c, [0, 2.5, 0]], [Cy(0.12, 0.22, 3, 5), c, [0.9, 5.4, 0], [0, 0, -0.7]], [Cy(0.1, 0.2, 2.6, 5), c, [-0.8, 4.8, 0.3], [0.2, 0, 0.8]], [Cy(0.08, 0.14, 1.8, 5), c, [0.2, 6.2, -0.5], [-0.6, 0, 0.1]]]); },
  ice() { return mergeG([[new THREE.OctahedronGeometry(1.2), 0x9fdcff, [0, 1.8, 0], [0, 0.3, 0], [0.8, 2.2, 0.8]], [new THREE.OctahedronGeometry(0.8), 0xc8eeff, [1.1, 1, 0.3], [0.2, 0, -0.35], [0.7, 1.8, 0.7]], [new THREE.OctahedronGeometry(0.6), 0x7fcaf5, [-0.9, 0.8, -0.4], [0, 0, 0.4], [0.7, 1.6, 0.7]]]); },
  glow() { return mergeG([[Dod(1.2), 0xff7a1a, [0, 0.5, 0], [0.4, 0.2, 0.1], [1.2, 0.8, 1]], [Dod(0.7), 0xffc23a, [1, 0.3, 0.4], [1, 0.3, 0]]]); },
  umbrella() { const p = [[Cy(0.09, 0.09, 4.4, 6), 0xf4f1ea, [0, 2.2, 0]], [Sp(0.2), 0xffd41f, [0, 4.75, 0]]]; for (let i = 0; i < 8; i++) p.push([new THREE.CylinderGeometry(0.02, 3.2, 1.1, 1, 1, true, 0, Math.PI / 4 + 0.02), i % 2 ? 0xffffff : 0xe22511, [0, 4.1, 0], [0, i * Math.PI / 4, 0]]);
    p.push([new THREE.BoxGeometry(1.6, 0.25, 4.2), 0x2a80dc, [2.6, 0.5, 0]], [new THREE.BoxGeometry(1.6, 1.2, 0.25), 0x2a80dc, [2.6, 1.0, -2.2], [-0.5, 0, 0]]); return mergeG(p); },
  snowman() { return mergeG([[Sp(1.3), 0xffffff, [0, 1.1, 0]], [Sp(0.95), 0xffffff, [0, 2.9, 0]], [Sp(0.65), 0xffffff, [0, 4.2, 0]], [Co(0.14, 0.7, 6), 0xff7a1a, [0, 4.2, 0.9], [Math.PI / 2, 0, 0]], [Cy(0.5, 0.55, 0.7, 10), 0xe22511, [0, 5.0, 0]], [Cy(0.8, 0.8, 0.08, 12), 0xe22511, [0, 4.7, 0]]]); },
  tuft() { return mergeG([[Co(0.28, 1.5, 4), 0x4a9a38, [0, 0.7, 0], [0.15, 0, 0.1]], [Co(0.24, 1.2, 4), 0x62b044, [0.35, 0.55, 0.1], [0, 0, -0.35]], [Co(0.24, 1.1, 4), 0x3f8a32, [-0.3, 0.5, -0.1], [0.1, 0, 0.4]], [Co(0.2, 0.9, 4), 0x6cba4c, [0.05, 0.4, 0.35], [0.45, 0, 0]]]); },
  dry() { return mergeG([[Co(0.22, 1.1, 4), 0xc9a45c, [0, 0.5, 0], [0.15, 0, 0.1]], [Co(0.2, 0.9, 4), 0xb8914c, [0.3, 0.4, 0.1], [0, 0, -0.4]], [Co(0.2, 0.8, 4), 0xd4b46c, [-0.28, 0.35, -0.1], [0.1, 0, 0.45]], [Dod(0.3), 0xa3562f, [0.5, 0.1, -0.4]]]); },
};

// ---------- textures ----------
var _detailT, _waterN, _lavaT;
function detailTex() { if (_detailT) return _detailT; _detailT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e9e9e9'; c.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 200 + Math.floor(rnd(0, 55)); c.fillStyle = `rgba(${v},${v},${v},.5)`; c.fillRect(rnd(0, w), rnd(0, h), rnd(1, 4), rnd(1, 4)); }
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(150,150,150,${rnd(0.05, 0.14)})`; c.beginPath(); c.arc(rnd(0, w), rnd(0, h), rnd(6, 22), 0, 7); c.fill(); } }); _detailT.wrapS = _detailT.wrapT = THREE.RepeatWrapping; return _detailT; }
function waterNormal() { if (_waterN) return _waterN; const S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'), im = c.createImageData(S, S);
  const wv = [[1, 2, 0.5, 0.3], [3, -1, 0.35, 1.7], [-2, 3, 0.3, 4.1], [5, 2, 0.16, 2.2], [-4, -5, 0.14, 0.9], [7, -3, 0.08, 3.3], [2, 9, 0.07, 5.0]], K = Math.PI * 2 / S;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let dx = 0, dy = 0; for (const [kx, ky, a, ph] of wv) { const cs = Math.cos((kx * x + ky * y) * K + ph) * a; dx += cs * kx; dy += cs * ky; } const l = Math.hypot(dx * 0.35, dy * 0.35, 1), o = (y * S + x) * 4;
    im.data[o] = (-dx * 0.35 / l * 0.5 + 0.5) * 255; im.data[o + 1] = (-dy * 0.35 / l * 0.5 + 0.5) * 255; im.data[o + 2] = (1 / l * 0.5 + 0.5) * 255; im.data[o + 3] = 255; }
  c.putImageData(im, 0, 0); _waterN = new THREE.CanvasTexture(cv); _waterN.wrapS = _waterN.wrapT = THREE.RepeatWrapping; return _waterN; }
function lavaTex() { if (_lavaT) return _lavaT; _lavaT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#ff5a00'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) { const x = rnd(0, w), y = rnd(0, h), r = rnd(8, 40), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,225,90,.85)'); g.addColorStop(1, 'rgba(255,120,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 150; i++) { const x = rnd(0, w), y = rnd(0, h), r = rnd(14, 46); for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) { c.fillStyle = `rgba(${28 + rnd(0, 14)},${14 + rnd(0, 8)},12,.93)`; c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, rr = r * (0.7 + ((k * 37 + i * 11) % 10) / 22); c.lineTo(x + ox + Math.cos(a) * rr, y + oy + Math.sin(a) * rr); } c.closePath(); c.fill(); } } });
  _lavaT.wrapS = _lavaT.wrapT = THREE.RepeatWrapping; return _lavaT; }
function skyTex(BI) { return canvasTex(2048, 1024, (c, w, h) => { const hz = h / 2, g = c.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, BI.sky[0]); g.addColorStop(0.62, BI.sky[1]); g.addColorStop(1, BI.sky[2]); c.fillStyle = g; c.fillRect(0, 0, w, hz + 2);
  c.fillStyle = '#' + new THREE.Color(BI.fog).getHexString(); c.fillRect(0, hz, w, hz);
  const sx = w * 0.097, sy = h * 0.2; for (const ox of [0, w]) { const sg = c.createRadialGradient(sx + ox, sy, 0, sx + ox, sy, 240); sg.addColorStop(0, 'rgba(255,255,240,1)'); sg.addColorStop(0.07, 'rgba(255,250,220,.95)'); sg.addColorStop(0.2, 'rgba(255,240,200,.28)'); sg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = sg; c.fillRect(sx + ox - 240, sy - 240, 480, 480); }
  for (let n = 0; n < 26; n++) { const x = rnd(0, w), y = hz * rnd(0.42, 0.93), s = rnd(0.6, 1.5) * (0.5 + y / hz); for (let k = 0; k < 9; k++) { const px = x + rnd(-90, 90) * s, py = y + rnd(-12, 10) * s, r = rnd(26, 60) * s;
      for (const ox of [0, w, -w]) { const cg = c.createRadialGradient(px + ox, py, 0, px + ox, py, r); cg.addColorStop(0, `rgba(${BI.cloud},.55)`); cg.addColorStop(1, `rgba(${BI.cloud},0)`); c.fillStyle = cg; c.fillRect(px + ox - r, py - r, r * 2, r * 2); } } }
  const hg = c.createLinearGradient(0, hz - 70, 0, hz + 2); hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(1, '#' + new THREE.Color(BI.fog).getHexString()); c.fillStyle = hg; c.fillRect(0, hz - 70, w, 72); }); }

// ---------- build everything around the road ----------
function buildEnv(tr, BI, g) {
  const F = makeField(tr, BI), half = F.rad + 185, seg = 168, geo = new THREE.PlaneGeometry(half * 2, half * 2, seg, seg); geo.rotateX(-Math.PI / 2); geo.translate(F.cx, 0, F.cz);
  const P = geo.attributes.position, n = P.count; for (let i = 0; i < n; i++) P.setY(i, F.H(P.getX(i), P.getZ(i)));
  geo.computeVertexNormals();
  const Nn = geo.attributes.normal, col = new Float32Array(n * 3), [c0, c1, c2, c3] = BI.pal.map((h) => new THREE.Color(h)), c = new THREE.Color();
  for (let i = 0; i < n; i++) { const h = P.getY(i), sl = 1 - Nn.getY(i), x = P.getX(i), z = P.getZ(i);
    c.copy(c0).lerp(c1, sm01((h - BI.lowH) / 1.6)).lerp(c2, sm01((h - BI.highH + Math.sin(x * 0.07) * 3) / 7)).lerp(c3, sm01((sl - 0.1) / 0.2) * (BI.lava ? 0.6 : 0.85));
    const k = 0.93 + 0.14 * (0.5 + 0.5 * Math.sin(x * 0.37 + z * 0.23) * Math.sin(z * 0.41 - x * 0.11)); col[i * 3] = c.r * k; col[i * 3 + 1] = c.g * k; col[i * 3 + 2] = c.b * k; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const dt = detailTex().clone(); dt.needsUpdate = true; dt.repeat.set(half / 9, half / 9);
  const terr = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: dt, roughness: BI.rough ?? 0.95, metalness: 0 })); terr.receiveShadow = true; g.add(terr);
  // sea / lava / far ground
  let water = null;
  if (BI.sea != null) { const t = BI.lava ? lavaTex() : waterNormal(); t.repeat.set(BI.lava ? 46 : 70, BI.lava ? 46 : 70);
    const mat = BI.lava ? new THREE.MeshBasicMaterial({ map: t, color: 0xffffff }) : new THREE.MeshPhysicalMaterial({ color: BI.seaCol, roughness: 0.1, normalMap: t, normalScale: new THREE.Vector2(0.5, 0.5), transparent: true, opacity: 0.86, envMapIntensity: 1.6 });
    water = new THREE.Mesh(new THREE.PlaneGeometry(3200, 3200), mat); water.rotation.x = -Math.PI / 2; water.position.set(F.cx, BI.sea, F.cz); g.add(water); water.userData.t = t;
  }
  else { const far = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ color: BI.pal[1] })); far.rotation.x = -Math.PI / 2; far.position.set(F.cx, Math.min(BI.far[0] - 4, -3), F.cz); g.add(far); }
  // sky dome (follows the camera)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(860, 40, 20), new THREE.MeshBasicMaterial({ map: skyTex(BI), side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false })); sky.renderOrder = -10; sky.frustumCulled = false; g.add(sky);
  // volcano crater glow + smoke column
  if (BI.volcano) { const v = F.peaks[F.peaks.length - 1], top = F.H(v.x, v.z); const cr = new THREE.Mesh(new THREE.CircleGeometry(v.r * 0.26, 24), new THREE.MeshBasicMaterial({ color: 0xffa030, fog: false })); cr.rotation.x = -Math.PI / 2; cr.position.set(v.x, top + v.h * 0.12, v.z); g.add(cr);
    const sm = new THREE.SpriteMaterial({ map: softTex(), color: 0x3a2a2a, transparent: true, opacity: 0.55, depthWrite: false, fog: false }); for (let k = 0; k < 7; k++) { const s = new THREE.Sprite(sm); s.position.set(v.x + k * 9, top + 22 + k * 16, v.z + k * 5); s.scale.setScalar(46 + k * 16); g.add(s); } }
  // props, one InstancedMesh per kind
  const pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }), pmI = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.15, metalness: 0.1 }), pmG = new THREE.MeshBasicMaterial({ vertexColors: true });
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), spots = [];
  for (const [kind, count, dmin, dmax, smin, smax, hmin, hmax] of BI.props) {
    const gg = kind === 'rock' || kind === 'mesa' ? PROPG[kind](BI.rockCol) : PROPG[kind](), im = new THREE.InstancedMesh(gg, kind === 'ice' ? pmI : kind === 'glow' ? pmG : pm, count); let put = 0;
    const big = kind !== 'tuft' && kind !== 'dry', pad = kind === 'mesa' ? 6 : big ? 2.6 : 0;
    for (let t = 0; t < count * 30 && put < count; t++) { const x = F.cx + rnd(-1, 1) * (F.rad + dmax), z = F.cz + rnd(-1, 1) * (F.rad + dmax), h = F.H(x, z), d = F.out.d - tr.W / 2; if (d < dmin + pad || d > dmax || h < hmin || h > hmax) continue;
      if (big) { let ok = true; for (const s of spots) if ((s[0] - x) ** 2 + (s[1] - z) ** 2 < (s[2] + pad) ** 2) { ok = false; break; } if (!ok) continue; spots.push([x, z, pad]); }
      const s = rnd(smin, smax); M.compose(V.set(x, h - (big ? 0.25 : 0.05), z), Q.setFromEuler(E.set(big ? rnd(-0.06, 0.06) : 0, rnd(0, 6.283), big ? rnd(-0.06, 0.06) : 0)), Sc.set(s, s * rnd(0.9, 1.15), s)); im.setMatrixAt(put++, M); }
    im.count = put; im.instanceMatrix.needsUpdate = true; im.castShadow = big; im.receiveShadow = kind !== 'glow'; im.frustumCulled = false; g.add(im); }
  // giant FLIX landmarks
  for (let k = 0; k < 2; k++) for (let t = 0; t < 60; t++) { const x = F.cx + rnd(-1, 1) * (F.rad + 20), z = F.cz + rnd(-1, 1) * (F.rad + 20), h = F.H(x, z), d = F.out.d - tr.W / 2; if (d < 12 || d > 34 || h < (BI.sea ?? -9) + 0.6) continue;
    const toy = makeToy({ colors: [[C.blue, C.green, C.yel], [C.red, 0xffb000, C.red]][k], lite: true }); toy.scale.setScalar(rnd(8, 11)); toy.position.set(x, h - 0.2, z); toy.rotation.y = rnd(0, 6); g.add(toy); break; }
  pmats.dust.color.setHex(BI.dust);
  let wt = 0;
  return { F, tick(dt, cam) { sky.position.copy(cam.position); sky.position.y = Math.max(-20, cam.position.y - 30); if (water) { wt += dt; const t = water.userData.t; if (BI.lava) t.offset.set(wt * 0.004, wt * 0.006); else t.offset.set(wt * 0.012, wt * 0.02); } } };
}
var _softT;
function softTex() { if (_softT) return _softT; _softT = canvasTex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }); return _softT; }

// road shoulder sloping from the kerb down into the terrain
function shoulder(tr, side) {
  const pos = [], uv = [], idx = [], N = tr.N, a0 = tr.W / 2 + 0.25, a1 = tr.W / 2 + 4.2; let acc = 0;
  for (let i = 0; i <= N; i++) { const j = i % N, p = tr.P[j], n = tr.Nm[j], y = tr.Y[j] + tr.B[j] * side * a0; if (i) acc += p.distanceTo(tr.P[(j - 1 + N) % N]);
    pos.push(p.x + n.x * side * a0, y + 0.02, p.z + n.z * side * a0, p.x + n.x * side * a1, y - 1.25, p.z + n.z * side * a1); uv.push(0, acc / 6, 1, acc / 6);
    if (i) { const k = i * 2; side > 0 ? idx.push(k - 2, k, k - 1, k - 1, k, k + 1) : idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// low race barrier with a box profile (inner face, top, outer face)
function barrier(tr, side) {
  const pos = [], uv = [], idx = [], N = tr.N, a0 = tr.W / 2 + 0.12, a1 = a0 + 0.55, hh = 0.8; let acc = 0, b = 0;
  for (let i = 0; i <= N; i++) { const j = i % N, p = tr.P[j], n = tr.Nm[j], y = tr.Y[j] + tr.B[j] * side * a0, u = acc / 5.2; if (i) acc += p.distanceTo(tr.P[(j - 1 + N) % N]);
    const ix = p.x + n.x * side * a0, iz = p.z + n.z * side * a0, ox = p.x + n.x * side * a1, oz = p.z + n.z * side * a1;
    pos.push(ix, y - 0.1, iz, ix, y + hh, iz, ix, y + hh, iz, ox, y + hh, oz, ox, y + hh, oz, ox, y - 1.2, oz); uv.push(u, 0, u, 1, u, 0.96, u, 1, u, 1, u, 0);
    if (i) { for (const q of [0, 2, 4]) { const k = b + q, k0 = k - 6; idx.push(k0, k, k0 + 1, k0 + 1, k, k + 1); } } b += 6; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
