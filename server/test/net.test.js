'use strict';
// /net (shared FLIX online for Direktör + Bomb): documents, queries, snapshots, profiles, rooms; /ws untouched.
const test = require('node:test');
const assert = require('node:assert');
const WebSocket = require('ws');
process.env.NET_DATA_FILE = require('path').join(require('os').tmpdir(), 'flix-net-test-' + process.pid + '.json');
const { start } = require('../src/index');

function client(port) {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/net`);
  let seq = 0; const pending = {}; const events = [];
  ws.on('message', (d) => { const m = JSON.parse(d); if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id]; } else events.push(m); });
  const call = (op, a) => new Promise((res) => { const id = 'c' + (++seq); pending[id] = res; ws.send(JSON.stringify({ id, op, ...a })); });
  return new Promise((r) => ws.on('open', () => r({ ws, call, events })));
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('/net documents, rooms and path routing', async () => {
  const app = await start({ port: 0, logLevel: 'silent' });
  try {
    const a = await client(app.port), b = await client(app.port);
    assert.ok((await a.call('hello', { uid: 'aaaaaaaa1' })).ok);
    await b.call('hello', { uid: 'bbbbbbbb2' });
    await b.call('sub', { sid: 's1', path: 'duels/ABCD' });
    await a.call('set', { path: 'duels/ABCD', data: { code: 'ABCD', status: 'open', mode: 'random' } });
    await b.call('update', { path: 'duels/ABCD', data: { status: 'playing' } });
    const q = await b.call('query', { coll: 'duels', where: [['status', '==', 'playing']], limit: 10 });
    assert.deepStrictEqual(q.docs.map((d) => d.id), ['ABCD']);
    assert.strictEqual((await a.call('get', { path: 'duels/ZZZZ' })).data, null);
    assert.ok((await a.call('get', { path: 'other/x' })).error);
    await wait(50);
    assert.deepStrictEqual(b.events.filter((e) => e.ev === 'doc').map((e) => e.data && e.data.status), [null, 'open', 'playing']);
    const ja = await a.call('join', { room: 'fb-test' }); await b.call('join', { room: 'fb-test' });
    await b.call('presence', { room: 'fb-test', data: { c: 'red' } });
    await wait(50);
    const last = a.events.filter((e) => e.ev === 'peers').pop();
    assert.strictEqual(last.peers.length, 2); assert.ok(ja.peer);
    a.ws.close(); b.ws.close();
    await assert.rejects(new Promise((res, rej) => { const w = new WebSocket(`ws://127.0.0.1:${app.port}/nope`); w.on('open', res); w.on('error', rej); }));
  } finally { await app.close(); }
});
