// ===== Flix Bomba game =====
// Grid rules and the bot's "flee / bomb the crate / hunt" loop follow MattSkala/html5-bombergirl (MIT); rewritten for 3D with pathfinding.
const $ = (id) => document.getElementById(id);
const VERSION = '1.0';
const SAVE_KEY = 'flix_bomba1';
let SV = { char: 'flix', diff: 1, sound: true, music: true, wins: 0, games: 0, seenHow: false };
try { Object.assign(SV, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) {} };

// ---------- audio ----------
const AUD = {
  ctx: null, out: null, mus: null, want: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = (this.ctx = new C()); this.out = c.createGain(); this.out.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; this.out.connect(comp); comp.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; this.noiseB = nb;
    if (this.want) this.music(this.want);
  },
  tone(f, d, o = {}) { const c = this.ctx, t = c.currentTime + (o.at || 0), os = c.createOscillator(), g = c.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.3, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d); os.connect(g); g.connect(this.out); os.start(t); os.stop(t + d + 0.05); },
  noise(d, o = {}) { const c = this.ctx, t = c.currentTime + (o.at || 0), s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); s.buffer = this.noiseB; f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.fc || 1200, t); if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + d); g.gain.setValueAtTime(o.vol || 0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + d + 0.05); },
  play(n) {
    if (!this.ctx || !SV.sound) return;
    try {
      if (n === 'place') { this.tone(520, 0.09, { to: 300, type: 'triangle', vol: 0.3 }); }
      else if (n === 'boom') { this.noise(0.5, { fc: 2400, fto: 120, vol: 0.75 }); this.tone(130, 0.4, { to: 38, vol: 0.7 }); this.noise(0.12, { fc: 6000, ft: 'highpass', vol: 0.18 }); }
      else if (n === 'pick') { this.tone(660, 0.08, { type: 'square', vol: 0.14 }); this.tone(990, 0.1, { type: 'square', vol: 0.14, at: 0.07 }); this.tone(1320, 0.16, { type: 'square', vol: 0.14, at: 0.14 }); }
      else if (n === 'die') { this.tone(700, 0.5, { to: 90, type: 'sawtooth', vol: 0.22 }); this.noise(0.25, { fc: 900, vol: 0.2 }); }
      else if (n === 'ui') { this.tone(740, 0.06, { type: 'triangle', vol: 0.2 }); }
      else if (n === 'kick') { this.tone(220, 0.12, { to: 520, type: 'triangle', vol: 0.35 }); this.noise(0.06, { fc: 3000, vol: 0.2 }); }
      else if (n === 'shield') { this.tone(440, 0.4, { to: 880, vol: 0.25 }); this.tone(660, 0.4, { to: 1320, vol: 0.15, at: 0.05 }); }
      else if (n === 'dash') { this.noise(0.22, { fc: 500, fto: 5000, ft: 'bandpass', vol: 0.35 }); }
      else if (n === 'freeze') { this.tone(1800, 0.5, { to: 500, type: 'triangle', vol: 0.2 }); this.noise(0.3, { fc: 7000, ft: 'highpass', vol: 0.15 }); }
      else if (n === 'zap') { this.tone(1200, 0.12, { to: 200, type: 'sawtooth', vol: 0.2 }); }
      else if (n === 'tick') { this.tone(880, 0.07, { type: 'square', vol: 0.12 }); }
      else if (n === 'go') { this.tone(1175, 0.3, { type: 'square', vol: 0.16 }); }
      else if (n === 'thud') { this.tone(110, 0.2, { to: 50, vol: 0.5 }); this.noise(0.1, { fc: 700, vol: 0.3 }); }
      else if (n === 'win') { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, { type: 'square', vol: 0.15, at: i * 0.12 })); this.tone(1047, 0.5, { type: 'triangle', vol: 0.2, at: 0.48 }); }
      else if (n === 'lose') { [392, 330, 262].forEach((f, i) => this.tone(f, 0.3, { type: 'triangle', vol: 0.2, at: i * 0.2 })); }
    } catch (e) {}
  },
  music(kind) {
    this.want = kind; if (!this.ctx) return;
    if (this.mus) { try { this.mus.stop(); } catch (e) {} this.mus = null; }
    if (!kind || !SV.music) return;
    try { this.mus = new MusicEngine(this.ctx, { output: this.out, volume: kind === 'menu' ? 0.16 : 0.22, menu: kind === 'menu', track: 'Rainbow Drift', intensity: kind === 'menu' ? 0 : 0.5 }); this.mus.start(); } catch (e) {}
  },
};
addEventListener('pointerdown', () => AUD.init(), { passive: true }); addEventListener('keydown', () => AUD.init());
document.addEventListener('visibilitychange', () => { if (!AUD.ctx) return; if (document.hidden) { AUD.ctx.suspend(); if (G.state === 'play') setPause(true); } else AUD.ctx.resume(); });

// ---------- renderer ----------
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const { scene, sun } = buildScene(renderer);
const island = buildIsland(scene);
const blocks = Blocks(scene), parts = Particles(scene), blasts = Blasts(scene);
const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 120);
const dyn = new THREE.Group(); scene.add(dyn);

// menu stage (far from the arena)
const STAGE = V3(60, 0, 0);
const stage = new THREE.Group(); stage.position.copy(STAGE); scene.add(stage);
{
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 0.5, 48), SM(0x6cc22c, { roughness: 0.85 })); pod.position.y = -0.25; pod.receiveShadow = true; stage.add(pod);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 0.9, 48), SM(0xd9722f, { roughness: 0.9 })); dirt.position.y = -0.95; stage.add(dirt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 10, 48), SM(0xffd41f, { roughness: 0.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; stage.add(ring);
  const wtr = new THREE.Mesh(new THREE.CircleGeometry(30, 40), new THREE.MeshBasicMaterial({ map: island.water })); wtr.rotation.x = -Math.PI / 2; wtr.position.y = -1.45; stage.add(wtr);
  const bm = makeBombModel(); bm.position.set(-1.0, 0, 0.5); bm.scale.setScalar(0.8); stage.add(bm);
  const pu = makePowerup('range'); pu.position.set(1.0, 0, 0.55); stage.add(pu); stage.userData.pu = pu;
}
const stageChars = {}; let stageCur = null;
function showStageChar(id) {
  for (const k in stageChars) stageChars[k].g.visible = false;
  if (!stageChars[id]) { const P = makeChar(id); stage.add(P.g); stageChars[id] = P; }
  stageCur = stageChars[id]; stageCur.g.visible = true; stageCur.g.scale.setScalar(0.001); stageCur.pop = 0;
}

// ---------- game state ----------
const G = { state: 'menu', grid: [], players: [], bombs: [], flames: new Map(), pus: new Map(), pending: [], t: 0, time: 0, round: 1, paused: false, shake: 0, sd: null, auto: false };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const key = (x, y) => y * COLS + x;
const SPAWNS = [[0, ROWS - 1], [COLS - 1, 0], [0, 0], [COLS - 1, ROWS - 1]];
const ROUND_TIME = 120, FUSE = 2.6, FLAME = 0.5, WINS = 3;
const DIFF = [{ n: 'Kolay', react: 0.42, hunt: 0.15, sloppy: 0.04 }, { n: 'Normal', react: 0.2, hunt: 0.5, sloppy: 0.02 }, { n: 'Zor', react: 0.07, hunt: 0.95, sloppy: 0 }];

function newGrid() {
  const g = []; for (let y = 0; y < ROWS; y++) { g.push([]); for (let x = 0; x < COLS; x++) g[y].push(x % 2 === 1 && y % 2 === 1 ? 1 : 0); }
  const safe = new Set(); for (const s of SPAWNS) { safe.add(key(s[0], s[1])); for (const d of DIRS) { const x = s[0] + d[0], y = s[1] + d[1]; if (inb(x, y)) safe.add(key(x, y)); } }
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!g[y][x] && !safe.has(key(x, y)) && Math.random() < 0.8) g[y][x] = 2;
  return g;
}
function bombAt(x, y) { for (const b of G.bombs) if (Math.round(b.x) === x && Math.round(b.y) === y) return b; return null; }
function solid(x, y) { return !inb(x, y) || G.grid[y][x] !== 0; }
function blocked(x, y) { return solid(x, y) || !!bombAt(x, y); }
function playerAt(x, y, not) { for (const p of G.players) if (p.alive && p !== not && Math.round(p.px) === x && Math.round(p.py) === y) return p; return null; }

function makePlayer(i, charId, isBot) {
  const ch = CHARS.find((c) => c.id === charId), P = makeChar(charId), g = new THREE.Group();
  P.g.scale.setScalar(0.7); g.add(P.g);
  const shield = new THREE.Mesh(sphG(0.62, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0x8fe8ff, transparent: true, opacity: 0.4, roughness: 0.1, clearcoat: 1, depthWrite: false })); shield.position.y = 0.52; shield.visible = false; g.add(shield);
  const ice = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.2, 0.9, 3, 0.14), new THREE.MeshPhysicalMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.55, roughness: 0.08, clearcoat: 1, depthWrite: false })); ice.position.y = 0.6; ice.visible = false; g.add(ice);
  let mark = null;
  if (!isBot) { mark = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.46, 32), new THREE.MeshBasicMaterial({ color: 0xffd41f, transparent: true, opacity: 0.95, depthWrite: false })); mark.rotation.x = -Math.PI / 2; mark.position.y = 0.03; g.add(mark); }
  dyn.add(g);
  return { i, ch, isBot, P, g, shield, ice, mark, wins: 0, px: 0, py: 0, fx: 0, fy: 1, alive: true, speed: ch.spd, maxBombs: ch.bombs, range: ch.range, active: 0, cd: 0, shieldT: 0, frozenT: 0, dash: null, mv: 0, yaw: 0, at: 0, deadT: 0, ai: { path: [], think: 0, wait: 0 } };
}
function resetPlayer(p) {
  const s = SPAWNS[p.i]; p.px = s[0]; p.py = s[1]; p.fx = 0; p.fy = p.i === 0 || p.i === 3 ? -1 : 1; p.alive = true; p.speed = p.ch.spd; p.maxBombs = p.ch.bombs; p.range = p.ch.range; p.active = 0; p.cd = 0; p.shieldT = 0; p.frozenT = 0; p.dash = null; p.deadT = 0; p.mv = 0;
  p.ai = { path: [], think: Math.random() * 0.4, wait: 0 }; p.g.visible = true; p.g.scale.setScalar(1); p.g.rotation.set(0, 0, 0); p.P.g.position.y = 0; p.P.g.rotation.set(0, 0, 0); p.yaw = Math.atan2(p.fx, p.fy); p.shield.visible = p.ice.visible = false;
}
function clearRound() {
  for (const b of G.bombs) dyn.remove(b.m); G.bombs.length = 0; for (const [, u] of G.pus) dyn.remove(u.m); G.pus.clear(); G.flames.clear(); G.pending.length = 0; blasts.clear();
  if (G.sd) for (const m of G.sd.marks) dyn.remove(m); G.sd = null; G.drop = null;
}
function startMatch() {
  for (const p of G.players) dyn.remove(p.g); G.players.length = 0;
  const others = CHARS.map((c) => c.id).filter((c) => c !== SV.char).sort(() => Math.random() - 0.5);
  G.players.push(makePlayer(0, SV.char, G.auto)); for (let i = 1; i < 4; i++) G.players.push(makePlayer(i, others[i - 1], true));
  G.round = 1; buildHud(); startRound(); AUD.music('game');
}
function startRound() {
  clearRound(); G.grid = newGrid(); blocks.sync(G.grid); for (const p of G.players) resetPlayer(p);
  G.time = ROUND_TIME; G.state = 'intro'; G.t = 0; G.introT = 0; G.endT = 0; updHud(); $('timer').classList.remove('hot');
  banner('RAUNT ' + G.round, G.players[0].ch.name + ' sensin', 1.5); lastTick = -1;
}

// ---------- bombs / blasts ----------
function placeBomb(p) {
  if (!p.alive || p.active >= p.maxBombs) return null; const x = Math.round(p.px), y = Math.round(p.py); if (bombAt(x, y) || G.flames.has(key(x, y))) return null;
  const m = makeBombModel(); m.position.set(wx(x), 0, wz(y)); dyn.add(m);
  const b = { x, y, fuse: FUSE, range: p.range, owner: p, m, vx: 0, vy: 0, t: 0 }; G.bombs.push(b); p.active++; AUD.play('place'); return b;
}
function blastCells(x, y, range, grid) {
  const out = [[x, y]];
  for (const d of DIRS) for (let i = 1; i <= range; i++) { const cx = x + d[0] * i, cy = y + d[1] * i; if (!inb(cx, cy) || grid[cy][cx] === 1) break; out.push([cx, cy, i]); if (grid[cy][cx] === 2) break; }
  return out;
}
function explode(b) {
  const i = G.bombs.indexOf(b); if (i < 0) return; G.bombs.splice(i, 1); dyn.remove(b.m); b.owner.active = Math.max(0, b.owner.active - 1);
  const x = Math.round(b.x), y = Math.round(b.y); AUD.play('boom'); G.shake = Math.min(0.5, G.shake + 0.28); blasts.ring(x, y);
  parts.emit(wx(x), 0.5, wz(y), [0x2a80dc, 0x2fa043, 0xffd41f, 0xffffff], 10, 3.5, 0.1, 5, 0.9);
  for (const c of blastCells(x, y, b.range, G.grid)) {
    const k = key(c[0], c[1]); blasts.add(c[0], c[1], (c[2] || 0) * 0.03, FLAME + 0.12); G.flames.set(k, Math.max(G.flames.get(k) || 0, FLAME));
    if (G.grid[c[1]][c[0]] === 2) { G.grid[c[1]][c[0]] = 0; G.dirty = true; parts.emit(wx(c[0]), 0.5, wz(c[1]), [0xf0582a, 0xde4a20, 0xff7a3d, 0x7ed334], 12, 3, 0.16, 4.5, 0.9);
      if (Math.random() < 0.4) { const r = Math.random(); G.pending.push({ x: c[0], y: c[1], t: FLAME + 0.02, type: r < 0.38 ? 'bomb' : r < 0.76 ? 'range' : 'speed' }); } }
    else { const u = G.pus.get(k); if (u) { dyn.remove(u.m); G.pus.delete(k); } const ob = bombAt(c[0], c[1]); if (ob) ob.fuse = Math.min(ob.fuse, 0.07 + (c[2] || 0) * 0.02); }
  }
}
function kickBomb(b, dx, dy) { const nx = Math.round(b.x) + dx, ny = Math.round(b.y) + dy; if (blocked(nx, ny) || playerAt(nx, ny)) return false; b.vx = dx; b.vy = dy; AUD.play('kick'); return true; }
function killPlayer(p) {
  if (!p.alive) return; p.alive = false; p.deadT = 0.0001; AUD.play('die'); G.shake = Math.min(0.5, G.shake + 0.15);
  parts.emit(wx(p.px), 0.7, wz(p.py), [new THREE.Color(p.ch.col).getHex(), 0xffffff, 0xffd41f], 22, 3.5, 0.13, 6, 1.1); updHud();
}

// ---------- movement ----------
function axisMove(p, ix, iy, dist, test) {
  const cx = Math.round(p.px), cy = Math.round(p.py); let moved = 0;
  const A = ix ? 'px' : 'py', B = ix ? 'py' : 'px', s = ix || iy, ca = ix ? cx : cy, cb = ix ? cy : cx;
  const blk = (a, b) => (ix ? blocked(a, b) : blocked(b, a));
  let off = p[B] - cb, target = cb;
  if (Math.abs(off) > 0.001) {
    const sg = Math.sign(off);
    if (blk(ca + s, cb) && !blk(ca, cb + sg) && !blk(ca + s, cb + sg)) target = cb + sg;
    const need = target - p[B], step = Math.sign(need) * Math.min(dist, Math.abs(need)); if (test) return Math.abs(step) > 0.0005 ? 1 : 0;
    p[B] += step; dist -= Math.abs(step); moved += Math.abs(step); if (Math.abs(p[B] - target) > 0.001) return moved; p[B] = target;
  }
  const row = Math.round(p[B]); let na = p[A] + s * dist; const c2 = Math.round(p[A]);
  if (blk(c2 + s, row)) { na = s > 0 ? Math.min(na, Math.max(c2, p[A])) : Math.max(na, Math.min(c2, p[A])); }
  const dlt = Math.abs(na - p[A]); if (test) return dlt > 0.0005 ? 1 : 0; p[A] = na; return moved + dlt;
}
function movePlayer(p, ix, iy, dt, cap) {
  if (!ix && !iy) return 0; p.fx = ix; p.fy = iy;
  const m = axisMove(p, ix, iy, cap === undefined ? p.speed * dt : Math.min(cap, p.speed * dt));
  if (m < 0.0005 && p.ch.id === 'kick') { const b = bombAt(Math.round(p.px) + ix, Math.round(p.py) + iy); if (b && !b.vx && !b.vy && Math.abs(p.px - Math.round(p.px)) + Math.abs(p.py - Math.round(p.py)) < 0.05) kickBomb(b, ix, iy); }
  return m;
}
function useAbility(p) {
  if (!p.alive || p.cd > 0 || p.frozenT > 0) return false; const id = p.ch.id, x = Math.round(p.px), y = Math.round(p.py); let ok = false;
  if (id === 'flix') { const mine = G.bombs.filter((b) => b.owner === p); if (mine.length) { mine.forEach((b, i) => (b.fuse = Math.min(b.fuse, 0.02 + i * 0.05))); AUD.play('zap'); ok = true; } }
  else if (id === 'wu') { p.shieldT = 3; AUD.play('shield'); ok = true; }
  else if (id === 'kick') { let b = bombAt(x + p.fx, y + p.fy); if (!b) { b = bombAt(x, y) || placeBomb(p); } if (b && kickBomb(b, p.fx, p.fy)) ok = true; }
  else if (id === 'flick') { let n = 0, tx = x, ty = y; for (let i = 1; i <= 3; i++) { const cx = x + p.fx * i, cy = y + p.fy * i; if (solid(cx, cy)) break; if (!bombAt(cx, cy)) { n = i; tx = cx; ty = cy; } } if (n) { p.dash = { sx: p.px, sy: p.py, tx, ty, t: 0, d: 0.1 + n * 0.035 }; AUD.play('dash'); ok = true; } }
  else if (id === 'buzul') { for (const o of G.players) if (o !== p && o.alive && Math.hypot(o.px - p.px, o.py - p.py) < 4.2 && o.shieldT <= 0) { o.frozenT = 2.5; parts.emit(wx(o.px), 0.8, wz(o.py), [0xbfe8ff, 0xffffff], 10, 2, 0.1, 3, 0.7); } blasts.ring(x, y); AUD.play('freeze'); ok = true; }
  if (ok) { p.cd = p.ch.cd; p.at = 0.25; } return ok;
}

// ---------- bot AI ----------
function dangerMap(extra) {
  const D = new Float32Array(COLS * ROWS).fill(99), bs = G.bombs.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y), fuse: b.fuse, range: b.range })); if (extra) bs.push(extra);
  for (let pass = 0; pass < 2; pass++) for (const b of bs) { const cells = blastCells(b.x, b.y, b.range, G.grid); if (pass === 0) b.cells = cells; for (const c of cells) for (const o of bs) if (o !== b && o.x === c[0] && o.y === c[1] && o.fuse > b.fuse) o.fuse = b.fuse + 0.05; }
  for (const b of bs) for (const c of b.cells) { const k = key(c[0], c[1]); if (b.fuse < D[k]) D[k] = b.fuse; }
  for (const [k] of G.flames) D[k] = 0;
  if (G.sd) for (let i = 0; i < 3 && G.sd.idx + i < G.sd.order.length; i++) { const c = G.sd.order[G.sd.idx + i]; D[key(c[0], c[1])] = Math.min(D[key(c[0], c[1])], G.sd.t + i * G.sd.step); }
  return D;
}
// BFS from the bot; returns {dist, prev}. Cells that will blow before we could cross them are not entered.
function bfs(p, D, sx, sy, ignoreBomb) {
  const dist = new Int16Array(COLS * ROWS).fill(-1), prev = new Int16Array(COLS * ROWS).fill(-1), q = [key(sx, sy)]; dist[q[0]] = 0; const st = 1 / p.speed;
  for (let h = 0; h < q.length; h++) { const k = q[h], x = k % COLS, y = (k / COLS) | 0;
    for (const d of DIRS) { const nx = x + d[0], ny = y + d[1]; if (!inb(nx, ny)) continue; const nk = key(nx, ny); if (dist[nk] >= 0 || solid(nx, ny)) continue; const bb = bombAt(nx, ny); if (bb && bb !== ignoreBomb) continue;
      const tArr = (dist[k] + 1) * st; if (D[nk] < 90 && (D[nk] < tArr + 0.35 && D[nk] + FLAME > tArr - st)) continue; if (G.flames.has(nk) && G.flames.get(nk) > tArr - st) continue;
      dist[nk] = dist[k] + 1; prev[nk] = k; q.push(nk); } }
  return { dist, prev, order: q };
}
function pathTo(R, k) { const out = []; while (R.prev[k] >= 0) { out.unshift(k); k = R.prev[k]; } return out; }
function botThink(p) {
  const df = DIFF[SV.diff], ai = p.ai, x = Math.round(p.px), y = Math.round(p.py), me = key(x, y), D = dangerMap(), R = bfs(p, D, x, y);
  ai.path = [];
  if (D[me] < 90) { // flee to the nearest safe cell
    let best = -1; for (const k of R.order) if (D[k] >= 90) { best = k; break; }
    if (best >= 0) { ai.path = pathTo(R, best); if (p.ch.id === 'flick' && ai.path.length >= 3 && D[me] < 0.9) useAbility(p); }
    else { if (p.ch.id === 'wu' && D[me] < 0.6) useAbility(p); else if (p.ch.id === 'flick') { for (const d of DIRS) { p.fx = d[0]; p.fy = d[1]; const tx = x + d[0] * 3, ty = y + d[1] * 3; if (inb(tx, ty) && D[key(tx, ty)] >= 90 && useAbility(p)) break; } }
      let bk = me, bt = D[me]; for (const k of R.order) if (D[k] > bt) { bt = D[k]; bk = k; } ai.path = pathTo(R, bk); }
    return;
  }
  const foes = G.players.filter((o) => o.alive && o !== p);
  // bomb value here
  const cellsHere = blastCells(x, y, p.range, G.grid); let crates = 0, hit = 0;
  for (const c of cellsHere) { if (G.grid[c[1]][c[0]] === 2) crates++; for (const f of foes) if (Math.round(f.px) === c[0] && Math.round(f.py) === c[1] && (c[2] || 0) <= 2 + SV.diff) hit++; }
  if (p.ch.id === 'buzul' && p.cd <= 0 && foes.some((f) => Math.hypot(f.px - p.px, f.py - p.py) < 3) && Math.random() < 0.5) useAbility(p);
  if (p.ch.id === 'flix' && p.cd <= 0 && p.active) { for (const b of G.bombs) if (b.owner === p && b.fuse > 0.6) { const cs = blastCells(Math.round(b.x), Math.round(b.y), b.range, G.grid); if (foes.some((f) => cs.some((c) => c[0] === Math.round(f.px) && c[1] === Math.round(f.py))) && Math.random() < df.hunt) { useAbility(p); break; } } }
  if (p.active < p.maxBombs && !bombAt(x, y) && (crates > 0 || (hit > 0 && Math.random() < df.hunt + 0.2)) && ai.wait <= 0) {
    const D2 = dangerMap({ x, y, fuse: FUSE, range: p.range }), R2 = bfs(p, D2, x, y); let esc = -1; for (const k of R2.order) if (D2[k] >= 90) { esc = k; break; }
    if ((esc >= 0 && R2.dist[esc] / p.speed < FUSE - 0.7) || Math.random() < df.sloppy) { const b = placeBomb(p); if (b) { if (p.ch.id === 'kick' && hit === 0 && p.cd <= 0 && Math.random() < 0.3) { for (const f of foes) { const dx = Math.sign(Math.round(f.px) - x), dy = Math.sign(Math.round(f.py) - y); if ((dx === 0) !== (dy === 0)) { p.fx = dx; p.fy = dy; useAbility(p); break; } } } if (esc >= 0) ai.path = pathTo(R2, esc); ai.wait = 0.5; return; } }
  }
  // pick a target among safe reachable cells
  let best = -1, bs = -1e9;
  for (const k of R.order) { if (D[k] < 90) continue; const cx = k % COLS, cy = (k / COLS) | 0, dist = R.dist[k]; let s = -dist * 0.6 + Math.random() * 0.8;
    if (G.pus.has(k)) s += 9; let cr = 0; for (const d of DIRS) { const nx = cx + d[0], ny = cy + d[1]; if (inb(nx, ny) && G.grid[ny][nx] === 2) cr++; } s += cr * 2.2;
    for (const f of foes) { const fd = Math.abs(f.px - cx) + Math.abs(f.py - cy); s += df.hunt * Math.max(0, 6 - fd) * (fd < 1 ? 0.2 : 0.7); if (!f.isBot) s += df.hunt * Math.max(0, 8 - fd) * 0.25; }
    if (k === me) s -= 1.5; if (s > bs) { bs = s; best = k; } }
  if (best >= 0 && best !== me) ai.path = pathTo(R, best);
}
function botUpdate(p, dt) {
  const ai = p.ai, df = DIFF[SV.diff]; ai.think -= dt; ai.wait -= dt;
  const x = Math.round(p.px), y = Math.round(p.py), centered = Math.abs(p.px - x) + Math.abs(p.py - y) < 0.02;
  if (ai.path.length && key(x, y) === ai.path[0] && centered) ai.path.shift();
  if (ai.think <= 0 && (centered || !ai.path.length)) { ai.think = df.react + Math.random() * 0.12; botThink(p); }
  if (!ai.path.length) return 0;
  const nk = ai.path[0], nx = nk % COLS, ny = (nk / COLS) | 0;
  if (G.flames.has(nk) || blocked(nx, ny)) { ai.path = []; ai.think = 0; return 0; }
  const dx = nx - p.px, dy = ny - p.py; let ix = 0, iy = 0; if (Math.abs(dx) > Math.abs(dy)) ix = Math.sign(dx); else iy = Math.sign(dy);
  return movePlayer(p, ix, iy, dt, Math.abs(dx) + Math.abs(dy));
}

// ---------- sudden death ----------
function spiral() { const o = []; let x0 = 0, y0 = 0, x1 = COLS - 1, y1 = ROWS - 1; while (x0 <= x1 && y0 <= y1 && o.length < COLS * ROWS) { for (let x = x0; x <= x1; x++) o.push([x, y0]); for (let y = y0 + 1; y <= y1; y++) o.push([x1, y]); if (y1 > y0) for (let x = x1 - 1; x >= x0; x--) o.push([x, y1]); if (x1 > x0) for (let y = y1 - 1; y > y0; y--) o.push([x0, y]); x0++; y0++; x1--; y1--; } return o; }
function sdUpdate(dt) {
  if (!G.sd) { G.sd = { order: spiral().slice(0, COLS * ROWS - 15), idx: 0, t: 1.2, step: 0.42, marks: [], falling: [] }; G.drop = new Float32Array(COLS * ROWS); banner('ALAN DARALIYOR!', 'Kenarlardan uzak dur', 1.6); $('timer').classList.add('hot'); }
  const S = G.sd; S.t -= dt;
  if (S.t <= 0 && S.idx < S.order.length) {
    const c = S.order[S.idx++]; S.t += S.step; const k = key(c[0], c[1]);
    if (G.grid[c[1]][c[0]] !== 1) { G.grid[c[1]][c[0]] = 1; G.drop[k] = 7; S.falling.push(k); const u = G.pus.get(k); if (u) { dyn.remove(u.m); G.pus.delete(k); } const b = bombAt(c[0], c[1]); if (b) { G.bombs.splice(G.bombs.indexOf(b), 1); dyn.remove(b.m); b.owner.active = Math.max(0, b.owner.active - 1); } G.dirty = true; }
  }
  for (let i = S.falling.length - 1; i >= 0; i--) { const k = S.falling[i]; G.drop[k] = Math.max(0, G.drop[k] - dt * 16); G.dirty = true; if (G.drop[k] <= 0) { S.falling.splice(i, 1); const cx = k % COLS, cy = (k / COLS) | 0; AUD.play('thud'); G.shake = Math.min(0.4, G.shake + 0.1); parts.emit(wx(cx), 0.1, wz(cy), [0xc5cfe6, 0x8f9cbd], 6, 2.5, 0.1, 2.5, 0.5); for (const p of G.players) if (p.alive && Math.round(p.px) === cx && Math.round(p.py) === cy) killPlayer(p); } }
  // players standing on a cell whose block is still in the air are safe until it lands; push nobody
}

// ---------- input ----------
const IN = { x: 0, y: 0, bomb: false, abil: false, keys: {} };
{
  const joy = $('joy'), knob = $('knob'), zone = $('touch'); let jid = null, ox = 0, oy = 0;
  const R = 46;
  zone.addEventListener('pointerdown', (e) => { if (jid !== null) return; jid = e.pointerId; ox = e.clientX; oy = e.clientY; joy.style.left = ox + 'px'; joy.style.top = oy + 'px'; joy.classList.add('on'); knob.style.transform = 'translate(-50%,-50%)'; zone.setPointerCapture(e.pointerId); e.preventDefault(); });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId !== jid) return; let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy); if (l > R) { ox += dx * (1 - R / l) * 0.5; oy += dy * (1 - R / l) * 0.5; joy.style.left = ox + 'px'; joy.style.top = oy + 'px'; dx = e.clientX - ox; dy = e.clientY - oy; const l2 = Math.hypot(dx, dy); if (l2 > R) { dx *= R / l2; dy *= R / l2; } }
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))'; IN.x = Math.abs(dx) > 10 ? dx / R : 0; IN.y = Math.abs(dy) > 10 ? dy / R : 0; });
  const end = (e) => { if (e.pointerId !== jid) return; jid = null; IN.x = IN.y = 0; joy.classList.remove('on'); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  const btn = (el, f) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add('dn'); setTimeout(() => el.classList.remove('dn'), 120); f(); });
  btn($('bBomb'), () => (IN.bomb = true)); btn($('bAbil'), () => (IN.abil = true));
  addEventListener('keydown', (e) => { IN.keys[e.code] = true; if (e.code === 'Space') { IN.bomb = true; e.preventDefault(); } if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE') IN.abil = true; if (e.code === 'Escape' && (G.state === 'play')) setPause(!G.paused); if (e.code.startsWith('Arrow')) e.preventDefault(); });
  addEventListener('keyup', (e) => { IN.keys[e.code] = false; });
}
function readDir() {
  const K = IN.keys; let x = IN.x, y = IN.y;
  if (K.ArrowLeft || K.KeyA) x = -1; if (K.ArrowRight || K.KeyD) x = 1; if (K.ArrowUp || K.KeyW) y = -1; if (K.ArrowDown || K.KeyS) y = 1;
  if (!x && !y) return null; const ax = Math.abs(x), ay = Math.abs(y);
  const prim = ax > ay ? [Math.sign(x), 0] : [0, Math.sign(y)], sec = ax > ay ? (ay > 0.35 ? [0, Math.sign(y)] : null) : (ax > 0.35 ? [Math.sign(x), 0] : null);
  return [prim, sec];
}

// ---------- update ----------
let lastTick = -1;
function update(dt) {
  G.t += dt;
  if (G.state === 'intro') { G.introT += dt; if (G.introT > 1.7) { G.state = 'play'; AUD.play('go'); banner('BAŞLA!', '', 0.7); } }
  const playing = G.state === 'play';
  if (playing) {
    G.time -= dt; if (G.time <= 0) sdUpdate(dt);
    const sec = Math.ceil(Math.max(0, G.time)); if (sec !== lastTick) { lastTick = sec; $('timer').textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); if (sec <= 10 && sec > 0) { AUD.play('tick'); $('timer').classList.add('hot'); } }
  }
  for (const p of G.players) {
    if (!p.alive) { if (p.deadT > 0 && p.deadT < 1) { p.deadT += dt * 1.6; const t = Math.min(1, p.deadT); p.P.g.position.y = Math.sin(t * Math.PI) * 1.6; p.P.g.rotation.y += dt * 18; p.g.scale.setScalar(Math.max(0.001, 1 - t * t)); if (t >= 1) p.g.visible = false; } continue; }
    let mv = 0; p.cd = Math.max(0, p.cd - dt); p.at = Math.max(0, p.at - dt);
    if (p.shieldT > 0) p.shieldT -= dt; if (p.frozenT > 0) p.frozenT -= dt;
    if (playing) {
      if (p.dash) { const d = p.dash; d.t += dt / d.d; const t = Math.min(1, d.t); p.px = d.sx + (d.tx - d.sx) * t; p.py = d.sy + (d.ty - d.sy) * t; mv = 1; if (Math.random() < 0.6) parts.emit(wx(p.px), 0.4, wz(p.py), [0xffffff, 0x8fd0ff], 1, 0.6, 0.1, 1, 0.35); if (t >= 1) { p.px = d.tx; p.py = d.ty; p.dash = null; } }
      else if (p.frozenT <= 0) {
        if (p.isBot) mv = botUpdate(p, dt);
        else { const d = readDir(); if (d) { if (axisMove(p, d[0][0], d[0][1], 0.02, true) || !d[1]) mv = movePlayer(p, d[0][0], d[0][1], dt); else mv = movePlayer(p, d[1][0], d[1][1], dt); }
          if (IN.bomb) placeBomb(p); if (IN.abil) { if (!useAbility(p) && p.cd <= 0) $('bAbil').classList.add('no'), setTimeout(() => $('bAbil').classList.remove('no'), 200); } }
      }
      // pickups
      const k = key(Math.round(p.px), Math.round(p.py)), u = G.pus.get(k);
      if (u) { dyn.remove(u.m); G.pus.delete(k); if (u.type === 'bomb') p.maxBombs = Math.min(6, p.maxBombs + 1); else if (u.type === 'range') p.range = Math.min(7, p.range + 1); else p.speed = Math.min(5.6, p.speed + 0.4); if (!p.isBot) { AUD.play('pick'); toast(u.type === 'bomb' ? '+1 Bomba' : u.type === 'range' ? '+1 Menzil' : 'Hız +'); } parts.emit(wx(p.px), 0.6, wz(p.py), [0xffd41f, 0xffffff], 8, 2, 0.09, 4, 0.6); }
      if (G.flames.has(k) && p.shieldT <= 0 && !p.dash) killPlayer(p);
    }
    p.mv += ((mv > 0.0005 ? 1 : 0) - p.mv) * Math.min(1, dt * 14);
    const ty = Math.atan2(p.fx, p.fy); let dy = ty - p.yaw; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; p.yaw += dy * Math.min(1, dt * 16);
    p.g.position.set(wx(p.px), 0, wz(p.py)); p.P.g.rotation.y = p.yaw;
    animChar(p.P, dt, { t: G.t + p.i * 1.3, move: p.frozenT > 0 ? 0 : p.mv, win: G.state === 'roundEnd' && G.endT > 0.5 });
    p.shield.visible = p.shieldT > 0; if (p.shield.visible) p.shield.scale.setScalar(1 + Math.sin(G.t * 10) * 0.04 - (p.shieldT < 0.6 ? Math.sin(G.t * 40) * 0.08 : 0));
    p.ice.visible = p.frozenT > 0; if (p.mark) p.mark.scale.setScalar(1 + Math.sin(G.t * 5) * 0.06);
  }
  IN.bomb = IN.abil = false;
  if (playing || G.state === 'roundEnd') {
    for (let i = G.bombs.length - 1; i >= 0; i--) { const b = G.bombs[i]; if (!b) continue; b.t += dt; if (playing) b.fuse -= dt;
      if (b.vx || b.vy) { const sp = 8.5 * dt, cx = Math.round(b.x), cy = Math.round(b.y); let nx = b.x + b.vx * sp, ny = b.y + b.vy * sp;
        const passX = b.vx && (b.vx > 0 ? nx >= cx && b.x <= cx : nx <= cx && b.x >= cx), passY = b.vy && (b.vy > 0 ? ny >= cy && b.y <= cy : ny <= cy && b.y >= cy);
        if (passX || passY || (b.x === cx && b.y === cy)) { const tx = cx + b.vx, ty = cy + b.vy; let stop = solid(tx, ty) || playerAt(tx, ty); for (const o of G.bombs) if (o !== b && Math.round(o.x) === tx && Math.round(o.y) === ty) stop = true; if (stop) { nx = cx; ny = cy; b.vx = b.vy = 0; } }
        b.x = nx; b.y = ny; b.m.position.set(wx(b.x), 0, wz(b.y)); b.m.userData.b.rotation.x += b.vy * dt * 14; b.m.userData.b.rotation.z -= b.vx * dt * 14;
        if (G.flames.has(key(Math.round(b.x), Math.round(b.y)))) b.fuse = 0; } else { b.m.userData.b.rotation.set(0, 0, 0); }
      const u = b.m.userData, pulse = Math.sin(b.t * (6 + (FUSE - b.fuse) * 5)); const s = 1 + pulse * 0.07 + Math.min(1, b.t * 6) * 0 ; b.m.scale.set(s * Math.min(1, b.t * 7), (2 - s) * Math.min(1, b.t * 7), s * Math.min(1, b.t * 7)); u.glow.material = u.glow.material; u.glow.material.opacity = b.fuse < 1 ? 0.25 + pulse * 0.25 : 0;
      if (b.fuse <= 0) explode(b); }
    for (const [k, t] of G.flames) { const n = t - dt; if (n <= 0) G.flames.delete(k); else G.flames.set(k, n); }
    for (let i = G.pending.length - 1; i >= 0; i--) { const q = G.pending[i]; q.t -= dt; if (q.t <= 0) { G.pending.splice(i, 1); if (G.grid[q.y][q.x] === 0) { const m = makePowerup(q.type); m.position.set(wx(q.x), 0, wz(q.y)); dyn.add(m); G.pus.set(key(q.x, q.y), { type: q.type, m, t: 0 }); } } }
  }
  for (const [, u] of G.pus) { u.t += dt; const s = u.m.userData.s; s.position.y = 0.5 + Math.sin(u.t * 3) * 0.07; s.rotation.y = Math.sin(u.t * 1.6) * 0.5; u.m.scale.setScalar(Math.min(1, u.t * 6)); }
  if (G.dirty) { blocks.sync(G.grid, G.drop); G.dirty = false; }
  if (playing) { const alive = G.players.filter((p) => p.alive); if (alive.length <= 1) { G.state = 'roundEnd'; G.endT = 0; G.winner = alive[0] || null; } }
  if (G.state === 'roundEnd') { const was = G.endT; G.endT += dt; if (G.winner && !G.winner.alive) G.winner = null;
    if (was < 1 && G.endT >= 1) { if (G.winner && G.flames.has(key(Math.round(G.winner.px), Math.round(G.winner.py)))) { killPlayer(G.winner); G.winner = null; } const w = G.winner; if (w) { w.wins++; w.fx = 0; w.fy = 1; AUD.play(w.isBot ? 'lose' : 'win'); banner(w.isBot ? w.ch.name + ' kazandı' : 'RAUNT SENİN!', 'Raunt ' + G.round, 2); } else { banner('BERABERE', 'Kimse ayakta kalmadı', 2); AUD.play('lose'); } updHud(); }
    if (G.endT > 3.4) { const top = G.players.find((p) => p.wins >= WINS); if (top) endMatch(top); else { G.round++; startRound(); } } }
  // HUD ability button
  const me = G.players[0]; if (me) { const f = me.cd > 0 ? me.cd / me.ch.cd : 0; if (f !== G.cdShown) { G.cdShown = f; $('bAbil').style.setProperty('--cd', (f * 360).toFixed(0) + 'deg'); $('bAbil').classList.toggle('rdy', f === 0 && me.alive); } const st = me.maxBombs + '|' + me.range + '|' + me.speed; if (st !== G.stShown) { G.stShown = st; $('myStats').innerHTML = '<b class="s1">' + me.maxBombs + '</b><b class="s2">' + me.range + '</b><b class="s3">' + Math.round((me.speed - 3) / 0.4 + 1) + '</b>'; } }
}

// ---------- camera ----------
let PRMAX = 2, slowT = 0, fpsN = 0, fpsT = 0;
const CAMV = { tgt: V3(0, 0, 0), dist: 20 };
const EL = 0.93; // elevation (rad)
function fitCamera() {
  const w = innerWidth, h = innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PRMAX)); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 34 : 30; cam.updateProjectionMatrix();
  const portrait = h > w * 1.15, top = 96, bot = portrait ? Math.min(210, h * 0.24) : 20, side = 4;
  const pts = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { pts.push(V3(sx * (COLS / 2 + 0.42), 0, sz * (ROWS / 2 + 0.42))); pts.push(V3(sx * (COLS / 2 + 0.42), sz < 0 ? 1.5 : 0.4, sz * (ROWS / 2 + 0.42))); }
  const v = V3(); let lo = 6, hi = 80, tz = 0;
  const measure = (d, z) => { cam.position.set(0, Math.sin(EL) * d, z + Math.cos(EL) * d); cam.lookAt(0, 0, z); cam.updateMatrixWorld(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { v.copy(p).project(cam); const px = (v.x + 1) / 2 * w, py = (1 - v.y) / 2 * h; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } return { x0, x1, y0, y1 }; };
  for (let i = 0; i < 22; i++) { const d = (lo + hi) / 2; let za = -12, zb = 12; for (let j = 0; j < 16; j++) { const z = (za + zb) / 2, m = measure(d, z); if ((m.y0 + m.y1) / 2 > (top + h - bot) / 2) za = z; else zb = z; } tz = (za + zb) / 2; const m = measure(d, tz); if (m.x1 - m.x0 > w - side * 2 || m.y1 - m.y0 > h - top - bot) lo = d; else hi = d; }
  CAMV.dist = hi; { let za = -12, zb = 12; for (let j = 0; j < 18; j++) { const z = (za + zb) / 2, m = measure(hi, z); if ((m.y0 + m.y1) / 2 > (top + h - bot) / 2) za = z; else zb = z; } CAMV.tgt.set(0, 0, (za + zb) / 2); }
}
addEventListener('resize', fitCamera); fitCamera();
const camPos = V3(), camLook = V3();
function updateCamera(dt) {
  if (G.state === 'menu' || G.state === 'matchEnd') {
    const w = innerWidth, h = innerHeight, far = h > w ? 13 : 8.6;
    const ox = h > w ? 0 : 2.3; camPos.set(STAGE.x + ox + Math.sin(G.t * 0.25) * 0.5, 1.75, far); camLook.set(STAGE.x + ox, h > w ? 0.2 : 0.95, 0);
  } else {
    const d = CAMV.dist; camPos.set(CAMV.tgt.x, Math.sin(EL) * d, CAMV.tgt.z + Math.cos(EL) * d); camLook.copy(CAMV.tgt);
    if (G.state === 'intro') { const me = G.players[0], t = Math.min(1, G.introT / 1.5), e = t * t * (3 - 2 * t), a = V3(wx(me.px), 3.2, wz(me.py) + 4.2), b = V3(wx(me.px), 0.5, wz(me.py)); camPos.lerpVectors(a, camPos, e); camLook.lerpVectors(b, camLook, e); }
    if (G.shake > 0) { G.shake = Math.max(0, G.shake - dt * 1.4); camPos.x += (Math.random() - 0.5) * G.shake * 0.5; camPos.y += (Math.random() - 0.5) * G.shake * 0.5; }
  }
  cam.position.copy(camPos); cam.lookAt(camLook);
  const inMenu = G.state === 'menu' || G.state === 'matchEnd'; sun.target.position.set(inMenu ? STAGE.x : 0, 0, 0); sun.position.set((inMenu ? STAGE.x : 0) - 6, 14, 7);
  const sc = sun.shadow.camera, sz = inMenu ? 3 : 9; if (sc.top !== sz) { sc.left = -sz * 0.9; sc.right = sz * 0.9; sc.top = sz; sc.bottom = -sz; sc.updateProjectionMatrix(); }
}

// ---------- HUD / UI ----------
const PORT = {};
function makePortraits() {
  const rt = new THREE.Scene(); rt.background = null; rt.environment = scene.environment; rt.add(new THREE.HemisphereLight(0xffffff, 0x99aacc, 1.4)); const l = new THREE.DirectionalLight(0xffffff, 2.2); l.position.set(-2, 4, 5); rt.add(l);
  const c = new THREE.PerspectiveCamera(24, 1, 0.1, 20); renderer.setPixelRatio(1); renderer.setSize(176, 176, false); renderer.setClearColor(0x000000, 0);
  for (const ch of CHARS) { const P = makeChar(ch.id); rt.add(P.g); P.g.rotation.y = 0.35; c.position.set(0.3, 1.25, 5.6); c.lookAt(0, 0.98, 0); renderer.render(rt, c); PORT[ch.id] = canvas.toDataURL('image/png'); rt.remove(P.g); }
  renderer.setClearColor(0x000000, 1);
}
function buildHud() {
  $('chips').innerHTML = G.players.map((p) => '<div class="chip' + (p.isBot ? '' : ' me') + '" id="chip' + p.i + '" style="--c:' + p.ch.col + '"><img alt="" src="' + PORT[p.ch.id] + '"><div><span>' + (p.isBot ? p.ch.name : 'SEN') + '</span><i></i></div></div>').join('');
  const me = G.players[0]; $('bAbil').querySelector('span').textContent = me.ch.icon; $('bAbil').querySelector('small').textContent = me.ch.abil; G.cdShown = -1; G.stShown = '';
}
function updHud() { for (const p of G.players) { const el = $('chip' + p.i); if (!el) continue; el.classList.toggle('dead', !p.alive); el.querySelector('i').innerHTML = Array.from({ length: WINS }, (_, k) => '<u class="' + (k < p.wins ? 'on' : '') + '"></u>').join(''); } }
let banT = null;
function banner(a, b, sec) { const el = $('banner'); el.innerHTML = '<b>' + a + '</b>' + (b ? '<span>' + b + '</span>' : ''); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(banT); banT = setTimeout(() => el.classList.remove('show'), sec * 1000); }
let toT = null;
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toT); toT = setTimeout(() => el.classList.remove('show'), 900); }
function setPause(v) { if (G.state !== 'play' && v) return; G.paused = v; $('pause').hidden = !v; }
function show(id) { for (const s of ['home', 'hud', 'end']) $(s).hidden = s !== id; }
function endMatch(top) {
  G.state = 'matchEnd'; clearRound(); const won = !top.isBot; SV.games++; if (won) SV.wins++; save();
  $('endTitle').textContent = won ? 'ŞAMPİYON SENSİN!' : top.ch.name + ' kazandı'; $('endSub').textContent = won ? 'Üç raundu da aldın. Toplam galibiyet: ' + SV.wins : 'Bu sefer olmadı. Rövanş?';
  $('endRows').innerHTML = G.players.slice().sort((a, b) => b.wins - a.wins).map((p) => '<div class="erow' + (p.isBot ? '' : ' me') + '"><img alt="" src="' + PORT[p.ch.id] + '"><span>' + (p.isBot ? p.ch.name : 'Sen · ' + p.ch.name) + '</span><b>' + p.wins + '</b></div>').join('');
  showStageChar(top.ch.id); G.stageWin = true; show('end'); AUD.music('menu'); AUD.play(won ? 'win' : 'lose');
}
function goHome() { G.state = 'menu'; G.stageWin = false; clearRound(); for (const p of G.players) dyn.remove(p.g); G.players.length = 0; show('home'); renderHome(); AUD.music('menu'); setPause(false); }
function renderHome() {
  const ch = CHARS.find((c) => c.id === SV.char) || CHARS[0];
  $('roster').innerHTML = CHARS.map((c) => '<button class="rc' + (c.id === ch.id ? ' on' : '') + '" data-c="' + c.id + '" style="--c:' + c.col + '" aria-label="' + c.name + '"><img alt="" src="' + PORT[c.id] + '"></button>').join('');
  $('cName').textContent = ch.name; $('cTag').textContent = ch.tag; $('cAbil').innerHTML = '<b>' + ch.icon + ' ' + ch.abil + '</b>' + ch.desc;
  const bar = (v, max) => '<i style="--v:' + Math.round(v / max * 100) + '%"></i>';
  $('cStats').innerHTML = '<div><span>Hız</span>' + bar(ch.spd - 2.8, 1.6) + '</div><div><span>Bomba</span>' + bar(ch.bombs, 3) + '</div><div><span>Menzil</span>' + bar(ch.range, 4) + '</div>';
  $('diff').innerHTML = DIFF.map((d, i) => '<button class="' + (i === SV.diff ? 'on' : '') + '" data-d="' + i + '">' + d.n + '</button>').join('');
  $('wins').textContent = SV.wins ? '🏆 ' + SV.wins + ' galibiyet' : '';
  $('sSound').textContent = SV.sound ? 'Açık' : 'Kapalı'; $('sMusic').textContent = SV.music ? 'Açık' : 'Kapalı';
  if (!stageCur || stageCur !== stageChars[ch.id]) showStageChar(ch.id);
}
$('roster').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; SV.char = b.dataset.c; save(); AUD.play('ui'); renderHome(); });
$('diff').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; SV.diff = +b.dataset.d; save(); AUD.play('ui'); renderHome(); });
$('play').addEventListener('click', () => { AUD.init(); AUD.play('ui'); show('hud'); startMatch(); if (!SV.seenHow) { SV.seenHow = true; save(); } });
$('again').addEventListener('click', () => { AUD.play('ui'); G.stageWin = false; show('hud'); startMatch(); });
$('toHome').addEventListener('click', () => { AUD.play('ui'); goHome(); });
$('bPause').addEventListener('click', () => setPause(true)); $('resume').addEventListener('click', () => setPause(false)); $('quit').addEventListener('click', goHome);
const sheet = (id, v) => { $(id).hidden = !v; };
$('howBtn').addEventListener('click', () => sheet('how', true)); $('setBtn').addEventListener('click', () => sheet('settings', true));
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => sheet(b.dataset.close, false)));
$('tSound').addEventListener('click', () => { SV.sound = !SV.sound; save(); renderHome(); AUD.play('ui'); });
$('tMusic').addEventListener('click', () => { SV.music = !SV.music; save(); renderHome(); AUD.music(SV.music ? 'menu' : null); AUD.want = 'menu'; });

// ---------- loop ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame); let dt = Math.min(0.05, (now - last) / 1000); last = now; if (G.paused) dt = 0;
  if (G.state !== 'menu' && G.state !== 'matchEnd') { if (dt) { update(dt * 0.5); update(dt * 0.5); } } else { G.t += dt; }
  if (stageCur && (G.state === 'menu' || G.state === 'matchEnd')) { stageCur.pop = Math.min(1, (stageCur.pop || 0) + dt * 4); const e = stageCur.pop, s = 1 + Math.sin(e * Math.PI) * 0.12 * (1 - e) + (e - 1) * 0; stageCur.g.scale.setScalar(Math.max(0.001, e * (1 + (1 - e) * 0.6)) * 1.25); stageCur.g.rotation.y = Math.sin(G.t * 0.7) * 0.5; animChar(stageCur, dt, { t: G.t, move: 0, win: !!G.stageWin }); const pu = stage.userData.pu.userData.s; pu.position.y = 0.5 + Math.sin(G.t * 3) * 0.07; pu.rotation.y = Math.sin(G.t * 1.6) * 0.5; }
  island.water.offset.x = G.t * 0.012; island.water.offset.y = G.t * 0.008; const fs = 1 + Math.sin(G.t * 1.5) * 0.012; island.foam.scale.set(fs, 1, fs); island.foam2.scale.set(2 - fs, 1, 2 - fs);
  parts.update(dt); blasts.update(dt); updateCamera(dt); renderer.render(scene, cam);
  // keep it smooth on slower phones: step the resolution down if frames run long
  if (dt > 0) { fpsN++; fpsT += dt; if (fpsT > 2) { const avg = fpsT / fpsN; fpsN = fpsT = 0; if (avg > 0.024 && PRMAX > 1) { PRMAX = Math.max(1, PRMAX - 0.5); fitCamera(); } } }
}
makePortraits(); fitCamera(); show('home'); renderHome(); AUD.want = 'menu';
requestAnimationFrame(frame);
window.__fb = { sim(n) { for (let i = 0; i < n; i++) update(1 / 60); }, G, SV, CHARS, startMatch, useAbility, placeBomb, IN, goHome };
window.addEventListener('error', (e) => { const el = $('err'); if (el) { el.textContent = '⚠ ' + (e.message || 'Hata'); el.hidden = false; } });
