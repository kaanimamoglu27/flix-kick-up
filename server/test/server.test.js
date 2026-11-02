'use strict';
// End-to-end tests over real WebSockets with short timings:  npm test
const test = require('node:test');
const assert = require('node:assert');
const WebSocket = require('ws');
const { start } = require('../src/index');

const T = { countdownMs: 150, matchMs: 600, reconnectGraceMs: 300, heartbeatMs: 60000, logLevel: 'silent', port: 0, scoreBurst: 2000, scorePerSec: 300, allowedOrigins: ['*'] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let app;
test.before(async () => { app = await start(T); });
test.after(async () => { await app.close(); });

// a tiny client that records every message and can wait for the next one of a type
function client(name, token, origin) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${app.port}/ws`, origin ? { origin } : {});
    const c = { ws, msgs: [], waiters: [], id: null, token: null };
    c.send = (o) => ws.send(JSON.stringify(o));
    c.next = (t, ms = 2000) => {
      const i = c.msgs.findIndex((m) => m.t === t);
      if (i >= 0) return Promise.resolve(c.msgs.splice(i, 1)[0]);
      return new Promise((res, rej) => {
        const w = { t, res, timer: setTimeout(() => { c.waiters = c.waiters.filter((x) => x !== w); rej(new Error(name + ': no "' + t + '" within ' + ms + 'ms')); }, ms) };
        c.waiters.push(w);
      });
    };
    c.none = async (t, ms = 250) => { await sleep(ms); assert.ok(!c.msgs.some((m) => m.t === t), name + ' got unexpected ' + t); };
    c.drain = () => { c.msgs = []; };
    c.close = () => new Promise((r) => { if (ws.readyState === WebSocket.CLOSED) return r(); ws.once('close', r); ws.close(); });
    ws.on('message', (d) => {
      const m = JSON.parse(d);
      const w = c.waiters.find((x) => x.t === m.t);
      if (w) { clearTimeout(w.timer); c.waiters = c.waiters.filter((x) => x !== w); w.res(m); } else c.msgs.push(m);
    });
    ws.on('error', reject);
    ws.on('unexpected-response', (req, res) => reject(new Error('http ' + res.statusCode)));
    ws.on('open', async () => {
      c.send({ t: 'hello', name, token });
      const w = await c.next('welcome'); c.id = w.id; c.token = w.token; c.welcome = w;
      resolve(c);
    });
  });
}
async function pairInRoom() {
  const a = await client('Ayse'), b = await client('Bora');
  a.send({ t: 'create' }); const r = await a.next('room');
  b.send({ t: 'join', code: r.code }); await b.next('room'); await a.next('room');
  return { a, b, code: r.code };
}
async function startMatch(a, b) {
  a.send({ t: 'ready', ready: true }); b.send({ t: 'ready', ready: true });
  const [ca, cb] = await Promise.all([a.next('countdown'), b.next('countdown')]);
  return { ca, cb };
}
const untilState = async (c, state) => { for (;;) { const r = await c.next('room'); if (r.state === state) return r; } };

test('1. private room: two players join and see each other', async () => {
  const { a, b, code } = await pairInRoom();
  assert.match(code, /^\d{6}$/);
  const r = (await (a.send({ t: 'name', name: 'Ayşe <b>' }), a.next('room')));
  assert.deepStrictEqual(r.players.map((p) => p.name), ['Ayşe b', 'Bora']);
  assert.strictEqual(r.state, 'lobby'); assert.strictEqual(r.quick, false);
  await a.close(); await b.close();
});

test('2. wrong room code', async () => {
  const c = await client('X');
  c.send({ t: 'join', code: '000000' }); assert.strictEqual((await c.next('error')).code, 'not_found');
  c.send({ t: 'join', code: '12ab' }); assert.strictEqual((await c.next('error')).code, 'bad_code');
  await c.close();
});

test('3. full room', async () => {
  const { a, b, code } = await pairInRoom();
  const c = await client('Cem');
  c.send({ t: 'join', code }); assert.strictEqual((await c.next('error')).code, 'full');
  await Promise.all([a.close(), b.close(), c.close()]);
});

test('4. quick match pairs two waiting players; leaving the queue cleans up', async () => {
  const a = await client('Q1');
  a.send({ t: 'quick' }); await a.next('queued');
  a.send({ t: 'cancel' }); await a.next('unqueued');
  assert.strictEqual(app.hub.queue.length, 0);
  const b = await client('Q2');
  b.send({ t: 'quick' }); await b.next('queued');
  const gone = await client('Q3'); gone.send({ t: 'quick' }); await sleep(30);   // Q3 pairs with Q2...
  const rb = await b.next('room'); assert.strictEqual(rb.quick, true); assert.strictEqual(rb.players.length, 2);
  a.send({ t: 'quick' }); await a.next('queued');                                // ...so Q1 waits alone
  await a.close(); await sleep(30);
  assert.strictEqual(app.hub.queue.length, 0, 'a closed socket leaves the queue');
  await Promise.all([b.close(), gone.close()]);
});

test('5+6. both ready: one synchronized countdown, scores visible on both sides', async () => {
  const { a, b } = await pairInRoom();
  a.send({ t: 'ready', ready: true });
  await b.none('countdown', 120);                                                // one ready player starts nothing
  const { ca, cb } = await startMatch(a, b);
  assert.strictEqual(ca.startAt, cb.startAt); assert.strictEqual(ca.endAt, cb.endAt); assert.strictEqual(ca.seed, cb.seed);
  assert.strictEqual(ca.endAt - ca.startAt, T.matchMs);
  a.send({ t: 'score', score: 30 });                                            // before the start: ignored
  await untilState(a, 'playing');
  a.send({ t: 'score', score: 40 });
  const sb = await b.next('score'); assert.deepStrictEqual([sb.id, sb.score], [a.id, 40]);
  const sa = await a.next('score'); assert.strictEqual(sa.score, 40);
  b.send({ t: 'score', score: 10 }); assert.strictEqual((await a.next('score')).score, 10);
  await a.next('end'); await b.next('end');
  await a.close(); await b.close();
});

test('7. normal end: server picks the winner; late scores are refused', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'playing');
  a.send({ t: 'score', score: 120 }); b.send({ t: 'score', score: 80 });
  const ea = await a.next('end', 2000), eb = await b.next('end');
  assert.strictEqual(ea.reason, 'time'); assert.strictEqual(ea.winner, a.id); assert.strictEqual(ea.draw, false);
  assert.deepStrictEqual(eb, ea);
  b.drain(); a.send({ t: 'score', score: 500 }); await b.none('score');
  assert.strictEqual(app.hub.players.get(a.token).score, 120);
  await a.close(); await b.close();
});

test('8. draw', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'playing');
  a.send({ t: 'score', score: 50 }); b.send({ t: 'score', score: 50 });
  const e = await a.next('end', 2000);
  assert.strictEqual(e.draw, true); assert.strictEqual(e.winner, null);
  await a.close(); await b.close();
});

test('9. opponent leaves during the match: the other player wins', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'playing');
  b.send({ t: 'score', score: 90 }); await a.next('score');
  b.send({ t: 'leave' });
  const e = await a.next('end'); assert.strictEqual(e.reason, 'opponent_left'); assert.strictEqual(e.winner, a.id);
  await a.next('opponent_left');
  await a.close(); await b.close();
});

test('10. opponent leaves in the lobby: room stays open for a new player', async () => {
  const { a, b, code } = await pairInRoom();
  b.send({ t: 'ready', ready: true }); await a.next('room');
  b.send({ t: 'leave' }); await b.next('left');
  assert.strictEqual((await a.next('opponent_left')).reason, 'left');
  const r = await untilState(a, 'lobby'); assert.strictEqual(r.players.length, 1);
  const c = await client('Cem'); c.send({ t: 'join', code }); assert.strictEqual((await c.next('room')).players.length, 2);
  await Promise.all([a.close(), b.close(), c.close()]);
});

test('11. quick-match room closes when one player leaves', async () => {
  const a = await client('Q1'), b = await client('Q2');
  a.send({ t: 'quick' }); await a.next('queued'); b.send({ t: 'quick' }); const qr = await a.next('room');
  a.send({ t: 'leave' });
  const m = await b.next('opponent_left'); assert.strictEqual(m.room, null);
  assert.strictEqual(app.hub.rooms.has(qr.code), false);
  await a.close(); await b.close();
});

test('12. reconnect within the window keeps the seat and the match', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'playing');
  a.send({ t: 'score', score: 25 }); await b.next('score');
  b.drain(); await a.close();
  const r = await untilState(b, 'playing'); assert.strictEqual(r.players.find((p) => p.id === a.id).connected, false);
  const a2 = await client('Ayse', a.token);
  assert.strictEqual(a2.welcome.resumed, true); assert.strictEqual(a2.id, a.id);
  const snap = await a2.next('room'); assert.strictEqual(snap.state, 'playing'); assert.strictEqual(snap.players.find((p) => p.id === a.id).score, 25);
  a2.send({ t: 'score', score: 60 }); assert.strictEqual((await b.next('score')).score, 60);
  const e = await b.next('end', 2000); assert.strictEqual(e.winner, a.id);
  await a2.close(); await b.close();
});

test('12b. no reconnect within the window: forfeit, and the old token is gone', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'countdown').catch(() => {});
  await a.close();
  const e = await b.next('end', 2000); assert.strictEqual(e.reason, 'opponent_left'); assert.strictEqual(e.winner, b.id);
  await sleep(50);
  const a2 = await client('Ayse', a.token); assert.strictEqual(a2.welcome.resumed, false);
  await a2.close(); await b.close();
});

test('14. rematch: both vote, a new countdown starts', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b);
  await a.next('end', 2000); await b.next('end');
  await sleep(30); a.drain(); b.drain();
  a.send({ t: 'rematch' });
  const r = await b.next('room'); assert.strictEqual(r.players.find((p) => p.id === a.id).rematch, true);
  await b.none('countdown', 100);
  b.send({ t: 'rematch' });
  const [ca, cb] = await Promise.all([a.next('countdown'), b.next('countdown')]);
  assert.strictEqual(ca.startAt, cb.startAt);
  await untilState(a, 'playing');
  a.send({ t: 'score', score: 5 }); assert.strictEqual((await b.next('score')).score, 5);   // scores were reset
  await a.close(); await b.close();
});

test('14b. rematch is refused once the opponent left', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await a.next('end', 2000);
  b.send({ t: 'leave' }); await a.next('opponent_left');
  a.send({ t: 'rematch' }); await a.none('countdown', 150);
  await a.close(); await b.close();
});

test('anti-cheat: negative, garbage and too-fast scores', async () => {
  const { a, b } = await pairInRoom();
  await startMatch(a, b); await untilState(a, 'playing');
  b.drain();
  for (const v of [-5, 'abc', null, Infinity]) a.send({ t: 'score', score: v });
  await b.none('score', 120);
  a.send({ t: 'score', score: 999999 });
  const s = await b.next('score'); assert.ok(s.score <= T.scoreBurst + T.scorePerSec, 'clamped to ' + s.score);
  a.send({ t: 'score', score: 1 }); await b.none('score', 100);                 // never goes down
  await a.next('end', 2000);
  await a.close(); await b.close();
});

test('message flood is dropped, server keeps running', async () => {
  const c = await client('Spam');
  for (let i = 0; i < 100; i++) c.send({ t: 'ping', c: i });
  await sleep(100);
  const pongs = c.msgs.filter((m) => m.t === 'pong').length;
  assert.ok(pongs > 0 && pongs <= 40, 'pongs ' + pongs);
  await c.close();
});

test('health endpoint and origin check', async () => {
  const h = await (await fetch(`http://127.0.0.1:${app.port}/health`)).json();
  assert.strictEqual(h.ok, true);
  const strict = await start({ ...T, allowedOrigins: ['capacitor://localhost'] });
  const ok = await new Promise((r) => { const ws = new WebSocket(`ws://127.0.0.1:${strict.port}/ws`, { origin: 'capacitor://localhost' }); ws.on('open', () => { ws.close(); r(true); }); ws.on('error', () => r(false)); });
  const bad = await new Promise((r) => { const ws = new WebSocket(`ws://127.0.0.1:${strict.port}/ws`, { origin: 'https://evil.example' }); ws.on('open', () => { ws.close(); r(true); }); ws.on('error', () => r(false)); ws.on('unexpected-response', () => r(false)); });
  assert.strictEqual(ok, true); assert.strictEqual(bad, false);
  await strict.close();
});
