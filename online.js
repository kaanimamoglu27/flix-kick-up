/* Flix Kick Up online client: one WebSocket to the game server (address in online-config.js).
   The server runs rooms, quick match, ready, countdown, match time, winner and rematch; this client only
   reports the player's own score. Nothing here can throw into the game: with no server, a dead network or
   an old browser, window.FlixOnline.available is false or calls simply report an error event.
   Events (FlixOnline.on(fn)): status, room, queued, unqueued, countdown, score, end, opponent_left, left, error, lost
   Times in countdown / room events are already converted to this device's clock (Date.now()). */
(function () {
  const C = window.FLIX_ONLINE_CONFIG || {};
  let url = '';
  try {
    const q = new URLSearchParams(location.search).get('online');
    const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const localPage = !native && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    url = (q && /^wss?:\/\//.test(q) && q) || ((C.USE_DEV_SERVER || localPage) && C.DEV_SERVER_URL) || C.ONLINE_SERVER_URL || '';
  } catch (e) { url = C.ONLINE_SERVER_URL || ''; }
  // an https page can only open wss://
  if (url && typeof location !== 'undefined' && location.protocol === 'https:' && url.indexOf('ws://') === 0) url = '';

  const RETRY_MS = [500, 1000, 2000, 3000, 5000, 5000];   // ~16 s, inside the server's 20 s reconnect window
  const CONNECT_TIMEOUT_MS = 6000;
  const subs = new Set();
  const O = {
    available: !!url && typeof WebSocket === 'function',
    url,
    status: 'idle',          // idle | connecting | online | reconnecting | offline
    me: null,                // { id, name }
    room: null,              // last room snapshot (times in local clock)
    queued: false,
    offset: 0,               // server clock - local clock (ms)
  };
  let ws = null, token = null, name = 'Player', manual = false, tries = 0, retryTimer = 0, bestRtt = Infinity;
  let connectWaiters = [];
  let scoreLatest = -1, scoreSent = -1, scoreTimer = 0, lastScoreSend = 0;

  const emit = (type, data) => { for (const f of Array.from(subs)) { try { f(Object.assign({ type }, data || {})); } catch (e) { console.warn('online handler', e); } } };
  const setStatus = (s) => { if (O.status !== s) { O.status = s; emit('status', { status: s }); } };
  const toLocal = (t) => (t ? t - O.offset : 0);
  const raw = (obj) => { try { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(obj)); return true; } } catch (e) {} return false; };
  const settleConnect = (ok) => { const w = connectWaiters; connectWaiters = []; w.forEach((f) => f(ok)); };

  function open() {
    clearTimeout(retryTimer);
    let sock;
    try { sock = new WebSocket(url); } catch (e) { return failed(); }
    ws = sock;
    const timer = setTimeout(() => { if (ws === sock && sock.readyState !== 1) { try { sock.close(); } catch (e) {} } }, CONNECT_TIMEOUT_MS);
    sock.onopen = () => { clearTimeout(timer); if (ws === sock) raw({ t: 'hello', name, token }); };
    sock.onmessage = (ev) => { if (ws !== sock) return; let m; try { m = JSON.parse(ev.data); } catch (e) { return; } onMessage(m); };
    sock.onerror = () => {};
    sock.onclose = () => { clearTimeout(timer); if (ws !== sock) return; ws = null; if (!manual) failed(); };
  }
  function failed() {
    ws = null;
    // never reached the server: give up right away; a dropped session gets a few quick retries
    if (!token || tries >= RETRY_MS.length) {
      const hadRoom = !!O.room;
      tries = 0; token = null; O.room = null; O.queued = false; setStatus('offline'); settleConnect(false);
      emit('lost', { hadRoom });
      return;
    }
    setStatus('reconnecting');
    retryTimer = setTimeout(open, RETRY_MS[tries++]);
  }

  function onMessage(m) {
    switch (m.t) {
      case 'welcome': {
        const resumedRoom = !!O.room;
        tries = 0; token = m.token; O.me = { id: m.id, name: m.name };
        O.offset = m.now - Date.now(); bestRtt = Infinity;
        for (let i = 0; i < 3; i++) setTimeout(() => raw({ t: 'ping', c: Date.now() }), i * 250);
        setStatus('online'); settleConnect(true);
        if (resumedRoom && !m.resumed) { O.room = null; O.queued = false; emit('lost', { hadRoom: true }); }
        return;
      }
      case 'pong': {
        const rtt = Date.now() - m.c;
        if (rtt >= 0 && rtt < bestRtt) { bestRtt = rtt; O.offset = m.now + rtt / 2 - Date.now(); }
        return;
      }
      case 'room':
        O.room = Object.assign({}, m, { startAt: toLocal(m.startAt), endAt: toLocal(m.endAt) }); O.queued = false;
        return emit('room', { room: O.room });
      case 'queued': O.queued = true; return emit('queued');
      case 'unqueued': O.queued = false; return emit('unqueued');
      case 'countdown':
        scoreLatest = scoreSent = -1;
        return emit('countdown', { startAt: toLocal(m.startAt), endAt: toLocal(m.endAt), seed: m.seed });
      case 'score': return emit('score', { id: m.id, score: m.score });
      case 'end': return emit('end', { result: m });
      case 'opponent_left': if (m.room === null) O.room = null; return emit('opponent_left', { reason: m.reason, roomClosed: m.room === null });
      case 'left': O.room = null; O.queued = false; return emit('left');
      case 'error': return emit('error', { code: m.code });
      case 'replaced': manual = true; try { ws && ws.close(); } catch (e) {} ws = null; setStatus('offline'); return;
    }
  }

  function flushScore() {
    scoreTimer = 0;
    if (scoreLatest > scoreSent && raw({ t: 'score', score: scoreLatest })) { scoreSent = scoreLatest; lastScoreSend = Date.now(); }
  }

  Object.assign(O, {
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    // resolves true once the server said welcome, false when it can't be reached
    connect(n) {
      if (n) name = String(n).slice(0, 16);
      if (!O.available) return Promise.resolve(false);
      if (O.status === 'online') return Promise.resolve(true);
      const p = new Promise((r) => connectWaiters.push(r));
      if (O.status !== 'connecting' && O.status !== 'reconnecting') { manual = false; tries = 0; token = null; setStatus('connecting'); open(); }
      return p;
    },
    disconnect() {
      manual = true; clearTimeout(retryTimer); token = null; O.room = null; O.queued = false;
      try { ws && ws.close(); } catch (e) {} ws = null; setStatus('idle'); settleConnect(false);
    },
    setName(n) { name = String(n || '').slice(0, 16) || name; raw({ t: 'name', name }); },
    quick: () => raw({ t: 'quick' }),
    cancel: () => raw({ t: 'cancel' }),
    create: () => raw({ t: 'create' }),
    join: (code) => raw({ t: 'join', code: String(code || '') }),
    ready: (on) => raw({ t: 'ready', ready: !!on }),
    rematch: () => raw({ t: 'rematch' }),
    leave() { O.queued = false; const ok = raw({ t: 'leave' }); O.room = null; return ok; },
    // own score only, at most ~6 times a second; the last value always goes out
    score(n) {
      n = Math.max(0, Math.floor(Number(n) || 0)); if (n <= scoreLatest) return;
      scoreLatest = n;
      if (!scoreTimer) scoreTimer = setTimeout(flushScore, Math.max(0, 160 - (Date.now() - lastScoreSend)));
    },
    serverNow: () => Date.now() + O.offset,
  });
  window.FlixOnline = O;
})();
