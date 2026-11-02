'use strict';
// Flix Kick Up online: rooms, quick match queue and 1v1 matches. The server owns every decision
// (room codes, pairing, ready, countdown, start / end time, winner, rematch); a client only reports its own score.
// No networking in here: index.js passes each connection's send(obj) and incoming messages.
const crypto = require('crypto');

const STATE = { LOBBY: 'lobby', COUNTDOWN: 'countdown', PLAYING: 'playing', FINISHED: 'finished' };

function cleanName(v) {
  const s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  return s || 'Player';
}

class Hub {
  constructor(cfg, log = () => {}) {
    this.cfg = cfg; this.log = log;
    this.players = new Map();   // token -> player
    this.rooms = new Map();     // code -> room
    this.queue = [];            // players waiting for a quick match
  }

  // ---------- connections ----------
  // hello: { name, token? }. A known token within the reconnect window resumes the same player (and room).
  connect(send, hello) {
    const now = Date.now();
    let p = hello && typeof hello.token === 'string' && this.players.get(hello.token);
    if (p) {
      clearTimeout(p.graceTimer); p.graceTimer = null;
      if (p.connected && p.send !== send) { try { p.send({ t: 'replaced' }); } catch (e) {} }
      p.send = send; p.connected = true;
      if (hello.name != null) p.name = cleanName(hello.name);
      this.send(p, { t: 'welcome', id: p.id, token: p.token, name: p.name, resumed: true, now });
      if (p.room) {
        this.broadcastRoom(p.room);
        if (p.room.state === STATE.FINISHED && p.room.result) this.send(p, p.room.result);  // the end may have happened while away
      }
      return p;
    }
    p = {
      id: crypto.randomBytes(4).toString('hex'), token: crypto.randomBytes(16).toString('hex'),
      name: cleanName(hello && hello.name), send, connected: true, graceTimer: null,
      room: null, queued: false, ready: false, rematch: false, score: 0, lastScoreAt: 0, clamped: 0,
    };
    this.players.set(p.token, p);
    this.send(p, { t: 'welcome', id: p.id, token: p.token, name: p.name, resumed: false, now });
    return p;
  }

  // the socket closed: keep the player (and their seat in a room or match) for a short reconnect window
  disconnect(p) {
    if (!p || !p.connected) return;
    p.connected = false;
    this.dequeue(p);
    if (p.room) this.broadcastRoom(p.room);
    clearTimeout(p.graceTimer);
    p.graceTimer = setTimeout(() => {
      p.graceTimer = null;
      if (p.connected) return;
      if (p.room) this.leaveRoom(p, 'disconnected');
      this.players.delete(p.token);
    }, this.cfg.reconnectGraceMs);
  }

  send(p, msg) { if (p.connected) { try { p.send(msg); } catch (e) {} } }

  error(p, code) { this.send(p, { t: 'error', code }); }

  // ---------- messages ----------
  handle(p, m) {
    if (!m || typeof m.t !== 'string') return;
    switch (m.t) {
      case 'ping': return this.send(p, { t: 'pong', c: m.c, now: Date.now() });
      case 'name': p.name = cleanName(m.name); if (p.room) this.broadcastRoom(p.room); return;
      case 'quick': return this.quick(p);
      case 'cancel': this.dequeue(p); return this.send(p, { t: 'unqueued' });
      case 'create': return this.create(p);
      case 'join': return this.join(p, m.code);
      case 'ready': return this.setReady(p, !!m.ready);
      case 'score': return this.score(p, m.score);
      case 'rematch': return this.rematch(p);
      case 'leave': this.dequeue(p); if (p.room) this.leaveRoom(p, 'left'); return this.send(p, { t: 'left' });
    }
  }

  // ---------- quick match ----------
  quick(p) {
    if (p.room) return this.error(p, 'in_room');
    if (p.queued) return this.send(p, { t: 'queued' });
    this.queue = this.queue.filter((q) => q.connected && q.queued && !q.room);
    const other = this.queue.shift();
    if (other) {
      other.queued = false;
      const room = this.newRoom(true);
      this.addToRoom(room, other); this.addToRoom(room, p);
      this.log('quick match', room.code, other.id, p.id);
      return this.broadcastRoom(room);
    }
    p.queued = true; this.queue.push(p);
    this.send(p, { t: 'queued' });
  }
  dequeue(p) { if (p.queued) { p.queued = false; this.queue = this.queue.filter((q) => q !== p); } }

  // ---------- private rooms ----------
  newCode() {
    for (let i = 0; i < 1000; i++) {
      const c = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      if (!this.rooms.has(c)) return c;
    }
    throw new Error('no free room code');
  }
  newRoom(quick) {
    const room = { code: this.newCode(), quick, state: STATE.LOBBY, players: [], seed: 0, startAt: 0, endAt: 0, timers: [], result: null };
    this.rooms.set(room.code, room);
    return room;
  }
  addToRoom(room, p) {
    Object.assign(p, { room, ready: false, rematch: false, score: 0, lastScoreAt: 0, clamped: 0 });
    room.players.push(p);
  }
  create(p) {
    if (p.room) return this.error(p, 'in_room');
    this.dequeue(p);
    const room = this.newRoom(false);
    this.addToRoom(room, p);
    this.broadcastRoom(room);
  }
  join(p, code) {
    if (p.room) return this.error(p, 'in_room');
    code = String(code == null ? '' : code).replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) return this.error(p, 'bad_code');
    const room = this.rooms.get(code);
    if (!room || room.quick) return this.error(p, 'not_found');
    if (room.players.length >= 2) return this.error(p, 'full');
    if (room.state !== STATE.LOBBY) return this.error(p, 'full');
    this.dequeue(p);
    this.addToRoom(room, p);
    this.broadcastRoom(room);
  }

  // ---------- ready / countdown / match ----------
  setReady(p, ready) {
    const room = p.room;
    if (!room || room.state !== STATE.LOBBY) return;
    p.ready = ready;
    this.broadcastRoom(room);
    if (room.players.length === 2 && room.players.every((q) => q.ready && q.connected)) this.startCountdown(room);
  }
  startCountdown(room) {
    this.clearTimers(room);
    const now = Date.now();
    Object.assign(room, { state: STATE.COUNTDOWN, seed: crypto.randomInt(0, 2 ** 31 - 1), startAt: now + this.cfg.countdownMs, result: null });
    room.endAt = room.startAt + this.cfg.matchMs;
    for (const q of room.players) Object.assign(q, { ready: false, rematch: false, score: 0, lastScoreAt: room.startAt, clamped: 0 });
    this.log('countdown', room.code);
    for (const q of room.players) this.send(q, { t: 'countdown', startAt: room.startAt, endAt: room.endAt, seed: room.seed, now });
    this.broadcastRoom(room);
    room.timers.push(setTimeout(() => { room.state = STATE.PLAYING; this.broadcastRoom(room); }, room.startAt - now));
    room.timers.push(setTimeout(() => this.finish(room, 'time'), room.endAt - now));
  }
  // the only score a client can send is its own; the server decides when it counts and how fast it may grow
  score(p, v) {
    const room = p.room, now = Date.now();
    if (!room || room.state !== STATE.PLAYING || now < room.startAt || now >= room.endAt) return;
    let s = Number(v);
    if (!Number.isFinite(s) || s < 0) return;
    s = Math.floor(s);
    if (s <= p.score) return;
    const allowed = Math.floor(p.score + this.cfg.scoreBurst + this.cfg.scorePerSec * (now - p.lastScoreAt) / 1000);
    if (s > allowed) { p.clamped++; this.log('score clamped', room.code, p.id, s, '->', allowed); s = allowed; }
    p.score = s; p.lastScoreAt = now;
    for (const q of room.players) this.send(q, { t: 'score', id: p.id, score: s });
  }
  finish(room, reason, winnerId) {
    if (room.state !== STATE.COUNTDOWN && room.state !== STATE.PLAYING) return;
    this.clearTimers(room);
    room.state = STATE.FINISHED;
    const [a, b] = room.players;
    let winner = winnerId || null;
    if (!winner && a && b && a.score !== b.score) winner = a.score > b.score ? a.id : b.id;
    room.result = {
      t: 'end', reason, winner, draw: !winner,
      players: room.players.map((q) => ({ id: q.id, name: q.name, score: q.score })),
    };
    this.log('end', room.code, reason, winner || 'draw', room.players.map((q) => q.score).join(':'));
    for (const q of room.players) { q.ready = false; q.rematch = false; this.send(q, room.result); }
    this.broadcastRoom(room);
  }
  rematch(p) {
    const room = p.room;
    if (!room || room.state !== STATE.FINISHED) return;
    if (room.players.length < 2) return this.error(p, 'opponent_gone');
    p.rematch = true;
    this.broadcastRoom(room);
    if (room.players.every((q) => q.rematch && q.connected)) this.startCountdown(room);
  }

  // ---------- leaving ----------
  leaveRoom(p, reason) {
    const room = p.room; if (!room) return;
    const other = room.players.find((q) => q !== p);
    // leaving a running match (or never coming back) hands the win to the player who stayed
    if (other && (room.state === STATE.COUNTDOWN || room.state === STATE.PLAYING)) this.finish(room, 'opponent_left', other.id);
    room.players = room.players.filter((q) => q !== p);
    Object.assign(p, { room: null, ready: false, rematch: false });
    if (!room.players.length) { this.clearTimers(room); this.rooms.delete(room.code); return; }
    for (const q of room.players) { q.ready = false; q.rematch = false; }
    if (room.state === STATE.FINISHED || room.state === STATE.LOBBY) room.state = STATE.LOBBY;
    if (room.quick) {
      // a quick room only exists for the pair it was made for
      for (const q of room.players) { q.room = null; this.send(q, { t: 'opponent_left', reason, room: null }); }
      this.clearTimers(room); this.rooms.delete(room.code);
      return;
    }
    for (const q of room.players) this.send(q, { t: 'opponent_left', reason });
    this.broadcastRoom(room);
  }

  // ---------- helpers ----------
  clearTimers(room) { for (const t of room.timers) clearTimeout(t); room.timers = []; }
  snapshot(room) {
    return {
      t: 'room', code: room.code, quick: room.quick, state: room.state, startAt: room.startAt, endAt: room.endAt, now: Date.now(),
      players: room.players.map((q) => ({ id: q.id, name: q.name, ready: q.ready, rematch: q.rematch, connected: q.connected, score: q.score })),
    };
  }
  broadcastRoom(room) { const s = this.snapshot(room); for (const q of room.players) this.send(q, s); }
  stats() { return { players: this.players.size, rooms: this.rooms.size, queue: this.queue.length }; }
}

module.exports = { Hub, STATE, cleanName };
