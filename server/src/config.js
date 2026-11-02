'use strict';
// Every setting comes from an environment variable (Render: Dashboard > Environment), with a safe default.
const num = (name, def) => { const v = Number(process.env[name]); return Number.isFinite(v) && v > 0 ? v : def; };

module.exports = {
  port: num('PORT', 8080),
  // comma separated list of allowed browser origins for the WebSocket, or * for any.
  // The iOS app connects from capacitor://localhost, the web build from https://<user>.github.io
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim()).filter(Boolean),
  countdownMs: num('COUNTDOWN_MS', 3000),
  matchMs: num('MATCH_MS', 60000),
  reconnectGraceMs: num('RECONNECT_GRACE_MS', 20000),
  // basic anti-cheat: a score may grow by at most SCORE_BURST at once plus SCORE_PER_SEC for every second since the last accepted score
  scoreBurst: num('SCORE_BURST', 2000),
  scorePerSec: num('SCORE_PER_SEC', 300),
  maxMsgPerSec: num('MAX_MSG_PER_SEC', 40),
  heartbeatMs: num('HEARTBEAT_MS', 15000),
  logLevel: process.env.LOG_LEVEL || 'info',
};
