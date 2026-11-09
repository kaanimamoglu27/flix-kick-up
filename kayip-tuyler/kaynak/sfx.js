// Soft synthesized sounds + generative ambient music (WebAudio, no files).
let ctx = null, master = null, musicBus = null, musicOn = false, musicTimer = null;
const PENT = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const hz = (n) => 440 * Math.pow(2, (n - 9) / 12); // n semitones from C4-ish
function ensure() {
  if (ctx) return ctx; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  // simple reverb
  const len = ctx.sampleRate * 2.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  const rev = ctx.createConvolver(); rev.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.35; rev.connect(wet); wet.connect(master);
  SFX._rev = rev; musicBus = ctx.createGain(); musicBus.gain.value = 0.0; musicBus.connect(master); musicBus.connect(rev);
  return ctx;
}
function tone(f, t0, dur, { type = 'sine', vol = 0.2, attack = 0.005, rev = 0.5, dest } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || master); if (rev && !dest) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s); s.connect(SFX._rev); }
  o.start(t0); o.stop(t0 + dur + 0.05);
}
function noise(t0, dur, { vol = 0.15, f = 800, q = 1, type = 'bandpass', sweep } = {}) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t0); if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t0 + dur); fl.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + dur * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t0);
}
let stepI = 0;
export const SFX = {
  enabled: true,
  unlock() { if (!this.enabled) return; ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); if (!musicOn) this.setMusic(true); },
  suspend(h) { if (!ctx) return; if (h) ctx.suspend(); else if (this.enabled) ctx.resume(); },
  ok() { return this.enabled && ensure() && ctx.state === 'running'; },
  step() { if (!this.ok()) return; const t = ctx.currentTime; const n = PENT[(stepI++ * 3) % 6] + 12; tone(hz(n), t, 0.35, { type: 'triangle', vol: 0.06, rev: 0.3 }); noise(t, 0.05, { vol: 0.05, f: 2400, q: 2 }); },
  click() { if (!this.ok()) return; const t = ctx.currentTime; tone(1200, t, 0.06, { type: 'square', vol: 0.03, rev: 0 }); tone(hz(19), t, 0.25, { vol: 0.05 }); },
  nope() { if (!this.ok()) return; const t = ctx.currentTime; tone(220, t, 0.18, { type: 'triangle', vol: 0.08, rev: 0.1 }); tone(196, t + 0.09, 0.2, { type: 'triangle', vol: 0.07, rev: 0.1 }); },
  rotate() { if (!this.ok()) return; const t = ctx.currentTime; for (let i = 0; i < 9; i++) noise(t + i * 0.08, 0.04, { vol: 0.07, f: 3000 - i * 120, q: 6 }); noise(t, 0.9, { vol: 0.08, f: 300, sweep: 900, q: 0.7 }); tone(hz(-12), t, 1.0, { type: 'sine', vol: 0.12, attack: 0.2, rev: 0.6 }); },
  slide() { if (!this.ok()) return; const t = ctx.currentTime; noise(t, 0.8, { vol: 0.09, f: 200, sweep: 600, q: 0.8, type: 'lowpass' }); tone(hz(-5), t, 0.8, { vol: 0.08, attack: 0.15 }); },
  thunk() { if (!this.ok()) return; const t = ctx.currentTime; tone(110, t, 0.3, { vol: 0.18, rev: 0.2 }); noise(t, 0.08, { vol: 0.08, f: 500 }); tone(hz(7), t + 0.05, 0.6, { vol: 0.05 }); },
  chime(i = 0) { if (!this.ok()) return; const t = ctx.currentTime; [12, 16, 19].forEach((n, k) => tone(hz(n + i), t + k * 0.07, 1.0, { vol: 0.06 })); },
  feather() { if (!this.ok()) return; const t = ctx.currentTime; [0, 4, 7, 12, 16, 19, 24].forEach((n, k) => tone(hz(n + 12), t + k * 0.09, 1.6, { vol: 0.07, type: k % 2 ? 'sine' : 'triangle' })); noise(t, 1.5, { vol: 0.05, f: 6000, q: 0.5, type: 'highpass' }); },
  setMusic(on) {
    if (!ensure()) return; musicOn = on && this.enabled; const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t); musicBus.gain.linearRampToValueAtTime(musicOn ? 0.5 : 0, t + 1.5);
    if (musicOn && !musicTimer) {
      const chords = [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 7]]; let bar = 0;
      const tick = () => { if (!musicOn) { musicTimer = null; return; } const t0 = ctx.currentTime + 0.05, ch = chords[bar % 4];
        ch.forEach(n => tone(hz(n - 12), t0, 4.4, { type: 'sine', vol: 0.035, attack: 1.2, dest: musicBus }));
        for (let i = 0; i < 4; i++) if (Math.random() < 0.55) tone(hz(ch[Math.floor(Math.random() * 4)] + 12 + (Math.random() < 0.3 ? 12 : 0)), t0 + i * 1.1 + Math.random() * 0.2, 2.2, { type: 'triangle', vol: 0.025, dest: musicBus });
        bar++; musicTimer = setTimeout(tick, 4400); };
      tick();
    }
  },
};
