'use strict';
// Flix Kick Up online server: one HTTP server with a health check (/health) and the game WebSocket (/ws).
//   npm start            (PORT, ALLOWED_ORIGINS, ... see config.js)
const http = require('http');
const { WebSocketServer } = require('ws');
const { Hub } = require('./game');

function start(overrides = {}) {
  const cfg = { ...require('./config'), ...overrides };
  const log = cfg.logLevel === 'silent' ? () => {} : (...a) => console.log(new Date().toISOString(), ...a);
  const hub = new Hub(cfg, log);
  const started = Date.now();
  const originOk = (o) => cfg.allowedOrigins.includes('*') || !o || cfg.allowedOrigins.includes(o);

  const server = http.createServer((req, res) => {
    const origin = req.headers.origin;
    if (origin && originOk(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, OPTIONS' }); return res.end(); }
    const path = (req.url || '/').split('?')[0];
    if (path === '/' || path === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify({ ok: true, service: 'flix-kick-up-online', uptime: Math.round((Date.now() - started) / 1000), ...hub.stats() }));
    }
    res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{"ok":false}');
  });

  const wss = new WebSocketServer({
    server, path: '/ws', maxPayload: 2048,
    verifyClient: (info, done) => (originOk(info.origin) ? done(true) : done(false, 403, 'origin not allowed')),
  });

  wss.on('connection', (ws) => {
    let player = null, windowStart = Date.now(), count = 0;
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    const send = (obj) => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
    ws.on('message', (data) => {
      const now = Date.now();
      if (now - windowStart > 1000) { windowStart = now; count = 0; }
      if (++count > cfg.maxMsgPerSec) { if (count > cfg.maxMsgPerSec * 5) ws.terminate(); return; }  // flood: drop, then cut off
      let m; try { m = JSON.parse(data); } catch (e) { return; }
      if (!m || typeof m !== 'object') return;
      try {
        if (!player) { if (m.t === 'hello') player = hub.connect(send, m); return; }
        hub.handle(player, m);
      } catch (e) { log('handler error', e && e.stack || e); }
    });
    ws.on('close', () => { if (player && player.send === send) hub.disconnect(player); });
    ws.on('error', () => {});
  });

  // drop sockets that stopped answering (phone locked, lost network) so the reconnect window starts
  const beat = setInterval(() => {
    for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; try { ws.ping(); } catch (e) {} }
  }, cfg.heartbeatMs);

  return new Promise((resolve) => {
    server.listen(cfg.port, () => {
      log('flix kick up online server on port', server.address().port, '| origins:', cfg.allowedOrigins.join(','));
      resolve({
        server, wss, hub, port: server.address().port,
        close: () => new Promise((r) => { clearInterval(beat); for (const ws of wss.clients) ws.terminate(); wss.close(); server.close(() => r()); }),
      });
    });
  });
}

if (require.main === module) {
  start().then((app) => {
    const stop = () => { app.close().then(() => process.exit(0)); setTimeout(() => process.exit(0), 3000).unref(); };
    process.on('SIGTERM', stop); process.on('SIGINT', stop);
  });
}

module.exports = { start };
