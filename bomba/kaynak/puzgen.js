// Offline generator + solver for Bulmaca levels. Rules mirror game.js (blast stops at walls, destroys first crate, triggers dormant bombs).
const W = 9, H = 11, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
let seed = +process.argv[2] || 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const K = (x, y) => y * W + x;
function blast(g, x, y, r) { const out = [K(x, y)]; for (const d of DIRS) for (let i = 1; i <= r; i++) { const cx = x + d[0] * i, cy = y + d[1] * i; if (cx < 0 || cy < 0 || cx >= W || cy >= H) break; const v = g[K(cx, cy)]; if (v === 1) break; out.push(K(cx, cy)); if (v === 2 || v === 3) break; } return out; }
function reach(g, dorm, s) { const seen = new Map([[s, 0]]), q = [s]; for (let h = 0; h < q.length; h++) { const k = q[h], x = k % W, y = (k / W) | 0; for (const d of DIRS) { const nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = K(nx, ny); if (seen.has(nk) || g[nk] !== 0 || dorm.has(nk)) continue; seen.set(nk, seen.get(k) + 1); q.push(nk); } } return seen; }
function boom(g, dorm, c, R) { // returns {g, dorm, U} or null if no escape
  const g2 = g.slice(), d2 = new Map(dorm), U = new Set(); const q = [[0, c, R]];
  while (q.length) { q.sort((a, b) => a[0] - b[0]); const [t, k, r] = q.shift(); for (const b of blast(g2, k % W, (k / W) | 0, r)) { U.add(b); if (g2[b] === 2 || g2[b] === 3) g2[b] = 0; else if (d2.has(b)) { const rr = d2.get(b); d2.delete(b); const dist = Math.abs(b % W - k % W) + Math.abs(((b / W) | 0) - ((k / W) | 0)); q.push([t + 0.07 + dist * 0.02, b, rr]); } } }
  const rc = reach(g, dorm, c); let safe = false; for (const [k, d] of rc) if (!U.has(k) && d <= 6) { safe = true; break; }
  return safe ? { g: g2, dorm: d2 } : null;
}
const targets = (g) => g.reduce((n, v) => n + (v === 3), 0);
function solve(g, dorm, p, R, left, memo, stats) {
  if (targets(g) === 0) return true; if (left === 0) return false;
  const rc = reach(g, dorm, p), comp = Math.min(...rc.keys()), key = g.join('') + '|' + [...dorm.keys()].sort().join(',') + '|' + comp + '|' + left; if (memo.has(key)) return memo.get(key);
  let ok = false; for (const c of rc.keys()) { const r = boom(g, dorm, c, R); if (!r) continue; if (r.g.join('') === g.join('') && r.dorm.size === dorm.size) continue; if (solve(r.g, r.dorm, c, R, left - 1, memo, stats)) { ok = true; if (!stats) break; } }
  memo.set(key, ok); return ok;
}
function firstMoves(g, dorm, p, R, Kb) { const rc = reach(g, dorm, p); let good = 0, all = 0; for (const c of rc.keys()) { all++; const r = boom(g, dorm, c, R); if (r && solve(r.g, r.dorm, c, R, Kb - 1, new Map())) good++; } return [good, all]; }
function gen() {
  const w = ri(5, 9), h = ri(5, 9), x0 = ((W - w) / 2) | 0, y0 = ((H - h) / 2) | 0, g = new Array(W * H).fill(1), cells = [];
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const r = rnd(); g[K(x, y)] = r < 0.16 ? 1 : r < 0.42 ? 2 : 0; cells.push(K(x, y)); }
  const free = () => { const f = cells.filter((k) => g[k] === 0); return f[ri(0, f.length - 1)]; };
  const pick = () => cells[ri(0, cells.length - 1)];
  const nt = ri(2, 5); for (let i = 0; i < nt; i++) g[pick()] = 3;
  const dorm = new Map(), nd = ri(0, 4); for (let i = 0; i < nd; i++) { const k = pick(); g[k] = 0; dorm.set(k, ri(1, 3)); }
  let p = free(); for (let i = 0; i < 20 && (p === undefined || dorm.has(p)); i++) p = free(); if (p === undefined || dorm.has(p)) return null;
  return { g, dorm, p, R: ri(1, 3) };
}
const out = [];
for (let n = 0; n < 60000 && out.length < 400; n++) {
  const L = gen(); if (!L || targets(L.g) < 2) continue;
  let min = 0; for (let k = 1; k <= 4; k++) if (solve(L.g, L.dorm, L.p, L.R, k, new Map())) { min = k; break; } if (!min) continue;
  const [good, all] = firstMoves(L.g, L.dorm, L.p, L.R, min); if (good / all > 0.34 || all < 4) continue;
  const used = L.dorm.size; const score = min * 3 + (1 - good / all) * 4 + Math.min(used, 3) + targets(L.g) * 0.5;
  const rows = []; for (let y = 0; y < H; y++) { let s = ''; for (let x = 0; x < W; x++) { const k = K(x, y); s += k === L.p ? 'P' : L.dorm.has(k) ? String(L.dorm.get(k)) : '.#cT'[L.g[k]]; } rows.push(s); }
  out.push({ min, R: L.R, good, all, score, rows, nd: used });
}
out.sort((a, b) => a.score - b.score);
const pickN = []; for (const k of [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4]) { const c = out.filter((o) => o.min === k && !pickN.includes(o)); if (!c.length) continue; const idx = Math.min(c.length - 1, Math.floor(c.length * (0.35 + 0.5 * (pickN.filter((p) => p.min === k).length / 4)))); pickN.push(c[idx]); }
console.error(out.length, 'candidates; by min:', [1, 2, 3, 4].map((k) => out.filter((o) => o.min === k).length));
console.log(JSON.stringify(pickN.map((o) => ({ g: o.rows, r: o.R, k: o.min })))); for (const o of pickN) console.error(o.min, o.R, o.good + '/' + o.all, 'dorm', o.nd, '\n' + o.rows.join('\n'));
