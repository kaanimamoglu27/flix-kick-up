// Flix: Kayıp Tüyler — pure game logic (levels, walk graph, mechanisms, solver). No THREE here.
export const DIRS = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] };

// Level builder helpers -------------------------------------------------------
// hm: heightmap rows (z = row index, x = col index). digit = top height (blocks y=0..h-1). '.' = empty.
export function buildLevel(def) {
  const blocks = [];
  const add = (x, y, z, o = {}) => blocks.push({ x, y, z, kind: 'block', g: null, ...o });
  if (def.hm) def.hm.forEach((row, z) => [...row].forEach((ch, x) => { if (ch >= '1' && ch <= '9') for (let y = 0; y < +ch; y++) add(x + (def.ox || 0), y, z + (def.oz || 0)); }));
  for (const b of def.extra || []) { // [x,y,z, opts] or {fill:[x0,x1,y0,y1,z0,z1], ...}
    if (Array.isArray(b)) add(b[0], b[1], b[2], b[3] || {});
    else { const [x0, x1, y0, y1, z0, z1] = b.fill; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) add(x, y, z, { g: b.g ?? null, mat: b.mat }); }
  }
  for (const s of def.stairs || []) blocks.push({ x: s[0], y: s[1], z: s[2], kind: 'stair', dir: s[3], g: s[4] ?? null });
  blocks.forEach((b, i) => b.id = i);
  const groups = (def.groups || []).map((g, i) => ({ idx: i, ...g }));
  const L = { ...def, blocks, groups };
  L.find = (x, y, z) => blocks.find(b => b.x === x && b.y === y && b.z === z);
  return L;
}

// Group transforms ---------------------------------------------------------------
export function initStates(L) { return L.groups.map(g => ({ k: g.k0 || 0, d: 1 })); }
export function xform(L, g, k, x, y, z) {
  if (g.type === 'rot') { let dx = x - g.pivot[0], dz = z - g.pivot[1]; for (let i = 0; i < ((k % 4) + 4) % 4; i++) { const t = dx; dx = -dz; dz = t; } return [g.pivot[0] + dx, y, g.pivot[1] + dz]; }
  const s = g.step || 1, a = g.axis; return [x + a[0] * s * k, y + a[1] * s * k, z + a[2] * s * k];
}
export function rotDir(dir, k) { const order = ['+x', '+z', '-x', '-z']; return order[(order.indexOf(dir) + ((k % 4) + 4) % 4) % 4]; }
export function placed(L, S) {
  return L.blocks.map(b => { if (b.g == null) return { ...b, wx: b.x, wy: b.y, wz: b.z, wdir: b.dir };
    const g = L.groups[b.g], [x, y, z] = xform(L, g, S[b.g].k, b.x, b.y, b.z); return { ...b, wx: x, wy: y, wz: z, wdir: b.dir && g.type === 'rot' ? rotDir(b.dir, S[b.g].k) : b.dir }; });
}

// Walk graph -----------------------------------------------------------------------
export const ck = (x, z, h2) => x + ',' + z + ',' + h2; // h2 = walk height * 2
export function graph(L, S) {
  const P = placed(L, S), occ = new Map(); for (const b of P) occ.set(b.wx + ',' + b.wy + ',' + b.wz, b);
  const blockedCells = new Set((L.props || []).filter(p => p.solid).map(p => p.at.join(',')));
  const cells = new Map();
  for (const b of P) {
    if (occ.has(b.wx + ',' + (b.wy + 1) + ',' + b.wz)) continue;
    if (b.kind === 'stair') cells.set(ck(b.wx, b.wz, b.wy * 2 + 1), { x: b.wx, z: b.wz, h2: b.wy * 2 + 1, b });
    else { if (blockedCells.has(b.x + ',' + b.y + ',' + b.z) && b.g == null) continue; cells.set(ck(b.wx, b.wz, b.wy * 2 + 2), { x: b.wx, z: b.wz, h2: b.wy * 2 + 2, b }); }
  }
  const adj = new Map(); for (const k of cells.keys()) adj.set(k, new Set());
  const link = (a, b) => { if (cells.has(a) && cells.has(b)) { adj.get(a).add(b); adj.get(b).add(a); } };
  for (const [k, c] of cells) {
    if (c.b.kind === 'stair') {
      const [dx, dz] = DIRS[c.b.wdir], y = c.b.wy;
      const lo = ck(c.x - dx, c.z - dz, y * 2), loS = ck(c.x - dx, c.z - dz, (y - 1) * 2 + 1);
      const hi = ck(c.x + dx, c.z + dz, (y + 1) * 2), hiS = ck(c.x + dx, c.z + dz, (y + 1) * 2 + 1);
      if (cells.has(lo) && cells.get(lo).b.kind !== 'stair') link(k, lo);
      if (cells.has(loS) && cells.get(loS).b.wdir === c.b.wdir) link(k, loS);
      if (cells.has(hi) && cells.get(hi).b.kind !== 'stair') link(k, hi);
      if (cells.has(hiS) && cells.get(hiS).b.wdir === c.b.wdir) link(k, hiS);
    } else for (const [dx, dz] of Object.values(DIRS)) { const n = ck(c.x + dx, c.z + dz, c.h2); if (cells.has(n) && cells.get(n).b.kind !== 'stair') link(k, n); }
  }
  return { cells, adj, P, occ };
}
export function path(G, from, to) {
  if (!G.cells.has(from) || !G.cells.has(to)) return null;
  const prev = new Map([[from, null]]), q = [from];
  while (q.length) { const c = q.shift(); if (c === to) break; for (const n of G.adj.get(c)) if (!prev.has(n)) { prev.set(n, c); q.push(n); } }
  if (!prev.has(to)) return null; const out = []; for (let c = to; c; c = prev.get(c)) out.unshift(c); return out;
}
export function comp(G, from) { const seen = new Set([from]), q = [from]; while (q.length) { const c = q.shift(); for (const n of G.adj.get(c) || []) if (!seen.has(n)) { seen.add(n); q.push(n); } } return seen; }

// where a block-anchored cell is now (goal, plates, player)
export function cellOfBlock(L, S, id) { const G = graph(L, S); for (const [k, c] of G.cells) if (c.b.id === id) return k; return null; }
export function blockOfCell(G, key) { const c = G.cells.get(key); return c ? c.b.id : null; }

// Mechanisms -------------------------------------------------------------------------
export function nextState(L, S, gi) {
  const g = L.groups[gi], s = S[gi], n = S.map(o => ({ ...o }));
  if (g.type === 'rot') n[gi].k = s.k + 1;
  else if (g.type === 'slide') { let k = s.k + s.d; let d = s.d; if (k >= g.n || k < 0) { d = -d; k = s.k + d; } n[gi] = { k, d }; }
  else return null;
  return n;
}
export function collides(L, S) { const P = placed(L, S), seen = new Set(); for (const b of P) { const k = b.wx + ',' + b.wy + ',' + b.wz; if (seen.has(k)) return true; seen.add(k); } return false; }
export function canAct(L, S, gi, playerBlock) {
  const g = L.groups[gi]; if (!g.handle) return false; const n = nextState(L, S, gi); if (!n || collides(L, n)) return false;
  // a non-carried player must not end up inside a moved block
  if (playerBlock != null && L.blocks[playerBlock].g !== gi) { const pb = placed(L, S)[playerBlock], P2 = placed(L, n); if (P2.some(b => b.g === gi && b.wx === pb.wx && b.wz === pb.wz && b.wy === pb.wy + 1)) return false; }
  return true;
}
// plates: {at:blockId, group: gi} latch -> group state k=1
export function pressPlates(L, S, G, compSet) {
  let changed = false; const n = S.map(o => ({ ...o }));
  for (const p of L.plates || []) { const key = cellOfBlockG(G, p.block); if (key && compSet.has(key) && n[p.group].k === 0) { n[p.group].k = 1; changed = true; } }
  return changed ? n : null;
}
function cellOfBlockG(G, id) { for (const [k, c] of G.cells) if (c.b.id === id) return k; return null; }

// Solver: BFS over (playerBlock, states). Returns steps [{walkTo:blockId, act:gi|'plate'|'goal'}]
export function solve(L, S0, pBlock0, maxStates = 20000) {
  const key = (pb, S) => pb + '|' + S.map(s => s.k + ':' + s.d).join(',');
  const start = { pb: pBlock0, S: S0 }, prev = new Map([[key(pBlock0, S0), null]]), q = [start];
  while (q.length && prev.size < maxStates) {
    const cur = q.shift(), G = graph(L, cur.S), pk = cellOfBlockG(G, cur.pb); if (!pk) continue;
    const C = comp(G, pk);
    const gk = cellOfBlockG(G, L.goal);
    if (gk && C.has(gk)) { const steps = [{ walkTo: L.goal, act: 'goal' }]; let k = key(cur.pb, cur.S); while (prev.get(k)) { const p = prev.get(k); steps.unshift(p.step); k = p.from; } return steps; }
    const pushS = (pb, S, step) => { const k = key(pb, S); if (!prev.has(k)) { prev.set(k, { from: key(cur.pb, cur.S), step }); q.push({ pb, S }); } };
    // plates
    for (const p of L.plates || []) { const plk = cellOfBlockG(G, p.block); if (plk && C.has(plk) && cur.S[p.group].k === 0) { const n = cur.S.map(o => ({ ...o })); n[p.group].k = 1; pushS(p.block, n, { walkTo: p.block, act: 'plate' }); } }
    // actions from each distinct position class: stay, or stand on each group's blocks (carry)
    const spots = new Map(); spots.set('stay', cur.pb);
    for (const k of C) { const b = G.cells.get(k).b; const cls = b.g == null ? 'static' : 'g' + b.g + ':' + b.id; if (!spots.has(cls)) spots.set(cls, b.id); }
    for (const [, pb] of spots) for (let gi = 0; gi < L.groups.length; gi++) { if (!canAct(L, cur.S, gi, pb)) continue; const n = nextState(L, cur.S, gi); pushS(pb, n, { walkTo: pb, act: gi }); }
  }
  return null;
}
