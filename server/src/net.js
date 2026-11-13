'use strict';
// FLIX shared online (/net): shared documents (Flix Direktör / Sen Olsaydın duels) and live rooms (FLIX Bomb).
// Mounted on the Kick Up server next to /ws (see index.js); Kick Up's own protocol is untouched.
// Data lives in memory and is snapshotted to NET_DATA_FILE (default /tmp: lost on restart without a disk).
// Client: direktor/app + bomba app, flix-net.js (window.claude.use('db' | 'user' | 'room') shim).
const fs = require('fs');
const DATA_FILE = process.env.NET_DATA_FILE || '/tmp/flix-net.json';
const MAX_DOC = 64 * 1024;
const DOC_TTL = 21 * 24 * 3600 * 1000;
const PATH_RE = /^(duels)\/[A-Z]{4}$/;
const COLL_RE = /^duels$/;
const ROOM_RE = /^[a-z0-9-]{1,40}$/;
const UID_RE = /^[a-z0-9]{8,40}$/;

// ---------- state ----------
const docs = new Map();      // path -> {data, t}
const profiles = new Map();  // uid -> {name, t}
const docSubs = new Map();   // path -> Set(ws)
const rooms = new Map();     // room -> Map(peer -> {ws, presence, uid})

function load(log) {
  try {
    const j = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    for (const [k, v] of Object.entries(j.docs || {})) docs.set(k, v);
    for (const [k, v] of Object.entries(j.profiles || {})) profiles.set(k, v);
    (log || console.log)('flix net: loaded', docs.size, 'docs');
  } catch (e) {  }
}
let dirty = false;
function persist() {
  if (!dirty) return; dirty = false;
  const now = Date.now();
  for (const [k, v] of docs) if (now - v.t > DOC_TTL) docs.delete(k);
  const out = { docs: Object.fromEntries(docs), profiles: Object.fromEntries(profiles) };
  fs.writeFile(DATA_FILE + '.tmp', JSON.stringify(out), (e) => { if (!e) fs.rename(DATA_FILE + '.tmp', DATA_FILE, () => {}); });
}

// ---------- helpers ----------
const send = (ws, m) => { if (ws.readyState === 1) ws.send(JSON.stringify(m)); };
const size = (o) => Buffer.byteLength(JSON.stringify(o) || '');
function notifyDoc(path) {
  const subs = docSubs.get(path); if (!subs) return;
  const d = docs.get(path);
  for (const ws of subs) for (const sid of ws.subs.get(path) || []) send(ws, { ev: 'doc', sid, data: d ? d.data : null });
}
function peersOf(room) {
  const r = rooms.get(room); if (!r) return [];
  return [...r].map(([peer, p]) => ({ peer, uid: p.uid, presence: p.presence }));
}
function notifyRoom(room) {
  const r = rooms.get(room); if (!r) return;
  const list = peersOf(room);
  for (const [, p] of r) send(p.ws, { ev: 'peers', room, peers: list });
}
function leaveRoom(ws, room) {
  const r = rooms.get(room); const peer = ws.peers.get(room);
  if (r && peer) { r.delete(peer); if (!r.size) rooms.delete(room); else notifyRoom(room); }
  ws.peers.delete(room);
}
function match(data, where) {
  return where.every(([f, op, v]) => op === '==' && data && data[f] === v);
}

// ---------- operations ----------
const ops = {
  hello(ws, m) { if (!UID_RE.test(m.uid || '')) throw new Error('bad uid'); ws.uid = m.uid; return { ok: true }; },
  get(ws, m) { if (!PATH_RE.test(m.path)) throw new Error('bad path'); const d = docs.get(m.path); return { data: d ? d.data : null }; },
  set(ws, m) {
    if (!PATH_RE.test(m.path)) throw new Error('bad path');
    if (typeof m.data !== 'object' || !m.data || size(m.data) > MAX_DOC) throw new Error('bad data');
    docs.set(m.path, { data: m.data, t: Date.now() }); dirty = true; notifyDoc(m.path); return { ok: true };
  },
  update(ws, m) {
    if (!PATH_RE.test(m.path)) throw new Error('bad path');
    const d = docs.get(m.path); if (!d) throw new Error('not-found');
    const next = Object.assign({}, d.data, m.data || {});
    if (size(next) > MAX_DOC) throw new Error('too large');
    docs.set(m.path, { data: next, t: Date.now() }); dirty = true; notifyDoc(m.path); return { ok: true };
  },
  sub(ws, m) {
    if (!PATH_RE.test(m.path)) throw new Error('bad path');
    if (!docSubs.has(m.path)) docSubs.set(m.path, new Set()); docSubs.get(m.path).add(ws);
    if (!ws.subs.has(m.path)) ws.subs.set(m.path, new Set()); ws.subs.get(m.path).add(m.sid);
    const d = docs.get(m.path); send(ws, { ev: 'doc', sid: m.sid, data: d ? d.data : null }); return { ok: true };
  },
  unsub(ws, m) {
    for (const [path, set] of ws.subs) if (set.delete(m.sid) && !set.size) { ws.subs.delete(path); const s = docSubs.get(path); if (s) { s.delete(ws); if (!s.size) docSubs.delete(path); } }
    return { ok: true };
  },
  query(ws, m) {
    if (!COLL_RE.test(m.coll)) throw new Error('bad collection');
    const where = Array.isArray(m.where) ? m.where.slice(0, 4) : [];
    const lim = Math.min(Math.max(1, m.limit | 0 || 50), 100);
    const out = [];
    for (const [path, d] of docs) { if (!path.startsWith(m.coll + '/')) continue; if (match(d.data, where)) out.push({ id: path.slice(m.coll.length + 1), data: d.data }); if (out.length >= lim) break; }
    return { docs: out };
  },
  profile(ws, m) { if (!ws.uid) throw new Error('hello first'); profiles.set(ws.uid, { name: String(m.name || '').slice(0, 24), t: Date.now() }); dirty = true; return { ok: true }; },
  profiles(ws, m) {
    const res = {}; for (const id of (m.ids || []).slice(0, 50)) { const p = profiles.get(id); if (p) res[id] = { name: p.name }; }
    return { profiles: res };
  },
  join(ws, m) {
    if (!ws.uid || !ROOM_RE.test(m.room || '')) throw new Error('bad room');
    leaveRoom(ws, m.room);
    const peer = ws.uid + '-' + (++ws.n);
    if (!rooms.has(m.room)) rooms.set(m.room, new Map());
    const r = rooms.get(m.room); if (r.size >= 8) throw new Error('room full');
    r.set(peer, { ws, uid: ws.uid, presence: null }); ws.peers.set(m.room, peer); notifyRoom(m.room);
    return { peer, peers: peersOf(m.room) };
  },
  presence(ws, m) {
    const r = rooms.get(m.room); const peer = ws.peers.get(m.room); if (!r || !peer) throw new Error('not in room');
    const p = r.get(peer); const next = Object.assign({}, p.presence || {}, m.data || {});
    if (size(next) > 16 * 1024) throw new Error('too large');
    p.presence = next; notifyRoom(m.room); return { ok: true };
  },
  leave(ws, m) { leaveRoom(ws, m.room); return { ok: true }; }
};


function attach(wss, log) {
  load(log);
  const persistT = setInterval(persist, 15000); persistT.unref();
  wss.on('connection', (ws) => {
    ws.subs = new Map(); ws.peers = new Map(); ws.n = 0; ws.alive = true; ws.budget = 60;
    ws.on('pong', () => { ws.alive = true; });
    ws.on('message', (raw) => {
      if (--ws.budget < 0) { if (ws.budget < -300) ws.terminate(); return; }
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      if (!m || typeof m !== 'object') return;
      const fn = Object.prototype.hasOwnProperty.call(ops, m.op) ? ops[m.op] : null;
      if (!fn) return send(ws, { id: m.id, error: 'unknown op' });
      try { send(ws, Object.assign({ id: m.id }, fn(ws, m))); } catch (e) { send(ws, { id: m.id, error: e.message }); }
    });
    ws.on('close', () => {
      for (const room of [...ws.peers.keys()]) leaveRoom(ws, room);
      for (const path of ws.subs.keys()) { const s = docSubs.get(path); if (s) { s.delete(ws); if (!s.size) docSubs.delete(path); } }
    });
    ws.on('error', () => {});
  });
  const refill = setInterval(() => { for (const ws of wss.clients) ws.budget = 60; }, 1000); refill.unref();
  const beat = setInterval(() => { for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; try { ws.ping(); } catch (e) {} } }, 25000); beat.unref();
  return { stop: () => { clearInterval(persistT); clearInterval(refill); clearInterval(beat); dirty = true; persist(); } };
}
const stats = () => ({ netDocs: docs.size, netRooms: rooms.size });
module.exports = { attach, stats };
