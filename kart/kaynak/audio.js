// ===== Flix Kart audio glue =====
// Master chain, engine loop and tyre squeal adapted from fecolinhares/super-kart-3djs AudioManager.js
// (MIT, Copyright (c) 2026 Feco Linhares); one-shots via its sfx.js, music via its music.js (MusicEngine).
export const AUD = {
  ctx: null, master: null, music: null, menu: null, eng: null, skid: null, on: true, musicVol: 0.3,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; }
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null;
    const c = (this.ctx = new Ctx());
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.85 : 0;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 28;
    const ls = c.createBiquadFilter(); ls.type = 'lowshelf'; ls.frequency.value = 150; ls.gain.value = 3;
    const hs = c.createBiquadFilter(); hs.type = 'highshelf'; hs.frequency.value = 11000; hs.gain.value = -2;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 22; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.22;
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -6; lim.knee.value = 2; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.06;
    this.master.connect(hp); hp.connect(ls); ls.connect(hs); hs.connect(comp); comp.connect(lim); lim.connect(c.destination);
    // procedural small-hall reverb send
    const sr = c.sampleRate, len = Math.floor(sr * 1.8), pre = Math.floor(sr * 0.02), buf = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); let last = 0; for (let i = pre; i < len; i++) { const t = (i - pre) / (len - pre); last = last * 0.55 + (Math.random() * 2 - 1) * 0.45; d[i] = last * Math.pow(1 - t, 2.6) * (ch ? 0.86 : 1); } }
    const conv = c.createConvolver(); conv.buffer = buf; const send = c.createGain(); send.gain.value = 0.16; const wet = c.createBiquadFilter(); wet.type = 'lowpass'; wet.frequency.value = 6000;
    this.master.connect(send); send.connect(conv); conv.connect(wet); wet.connect(comp);
    // noise buffer for engine / skid
    const nb = c.createBuffer(1, sr, sr), nd = nb.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1; this.noise = nb;
    if (this.wantMenu) this.menuMusic(true); if (this.wantRace) this.raceMusic(true);
    return c;
  },
  setOn(v) { this.on = v; if (this.master) this.master.gain.setTargetAtTime(v ? 0.85 : 0, this.ctx.currentTime, 0.05); },
  play(name, opts = {}) { if (!this.ctx || !this.on) return; try { renderSfx(this.ctx, this.master, name, Object.assign({}, opts, { volume: Math.min(0.85, opts.volume ?? 0.7), at: this.ctx.currentTime + (opts.delay || 0) })); } catch (e) {} },
  menuMusic(on) {
    this.wantMenu = on; if (!this.ctx) return;
    if (on) { this.raceMusic(false); if (!this.menu) { this.menu = new MusicEngine(this.ctx, { output: this.master, volume: this.musicVol * 0.6, menu: true }); this.menu.setIntensity(0); this.menu.start(); } }
    else if (this.menu) { this.menu.stop(); this.menu = null; }
  },
  raceMusic(on, track) {
    this.wantRace = on; if (!this.ctx) return;
    if (on) { this.menuMusic(false); this.wantRace = true; if (!this.music) { this.music = new MusicEngine(this.ctx, { output: this.master, volume: this.musicVol, track, intensity: 0.5 }); this.music.start(); } }
    else if (this.music) { this.music.stop(); this.music = null; }
  },
  intensity(v) { if (this.music) this.music.setIntensity(v); },
  pauseMusic(p) { if (!this.ctx) return; if (p) this.ctx.suspend && this.ctx.suspend(); else this.ctx.resume && this.ctx.resume(); },
  // ---- continuous player engine (saw + square + sub through lowpass + soft clip, combustion noise) ----
  engineOn() {
    if (!this.ctx || this.eng) return; const c = this.ctx;
    const base = c.createOscillator(), oct = c.createOscillator(), sub = c.createOscillator(); base.type = 'sawtooth'; oct.type = 'square'; sub.type = 'sine';
    const flt = c.createBiquadFilter(); flt.type = 'lowpass'; flt.Q.value = 1.2;
    const sh = c.createWaveShaper(); const cv = new Float32Array(160); for (let i = 0; i < 160; i++) { const x = (i / 159) * 2 - 1; cv[i] = Math.tanh(0.5 * x); } sh.curve = cv;
    const gain = c.createGain(); gain.gain.value = 0;
    const vb = c.createGain(), vo = c.createGain(), vs = c.createGain(); vb.gain.value = 0.55; vo.gain.value = 0.22; vs.gain.value = 0.5;
    base.connect(vb); vb.connect(flt); oct.connect(vo); vo.connect(flt); sub.connect(vs); vs.connect(flt); flt.connect(sh); sh.connect(gain); gain.connect(this.master);
    const nz = c.createBufferSource(); nz.buffer = this.noise; nz.loop = true; const nb = c.createBiquadFilter(); nb.type = 'bandpass'; nb.Q.value = 0.7; const ng = c.createGain(); ng.gain.value = 0.06; nz.connect(nb); nb.connect(ng); ng.connect(gain);
    const lfo = c.createOscillator(); lfo.frequency.value = 22; const lg = c.createGain(); lg.gain.value = 3; lfo.connect(lg); lg.connect(base.detune);
    base.frequency.value = 58; oct.frequency.value = 117; sub.frequency.value = 29; flt.frequency.value = 300; nb.frequency.value = 220;
    [base, oct, sub, nz, lfo].forEach((o) => o.start());
    // tyre squeal loop (high-Q bandpass noise with wobble)
    const sq = c.createBufferSource(); sq.buffer = this.noise; sq.loop = true; const sf = c.createBiquadFilter(); sf.type = 'bandpass'; sf.Q.value = 9; sf.frequency.value = 1250;
    const sl = c.createOscillator(); sl.frequency.value = 19; const slg = c.createGain(); slg.gain.value = 150; sl.connect(slg); slg.connect(sf.frequency);
    const sg = c.createGain(); sg.gain.value = 0; sq.connect(sf); sf.connect(sg); sg.connect(this.master); sq.start(); sl.start();
    this.eng = { base, oct, sub, flt, gain, nb, lg, nz, lfo, sq, sl, sg, sf, last: 0 };
  },
  engineOff() { const e = this.eng; if (!e) return; this.eng = null; const t = this.ctx.currentTime; e.gain.gain.setTargetAtTime(0, t, 0.05); e.sg.gain.setTargetAtTime(0, t, 0.05); setTimeout(() => { [e.base, e.oct, e.sub, e.nz, e.lfo, e.sq, e.sl].forEach((o) => { try { o.stop(); } catch (x) {} }); }, 300); },
  engineUpd(speed01, turbo, drift, gas) {
    const e = this.eng; if (!e) return; const t = this.ctx.currentTime; if (t - e.last < 1 / 30) return; e.last = t; const tc = 0.06;
    const g = engineGear(Math.min(1, speed01 + (turbo ? 0.06 : 0))), lug = (1 - g.local) * g.load, rpm = g.rpm * (turbo ? 1.08 : 1);
    e.base.frequency.setTargetAtTime(rpm, t, tc); e.oct.frequency.setTargetAtTime(rpm * 2.02, t, tc); e.sub.frequency.setTargetAtTime(rpm * 0.5, t, tc);
    e.flt.frequency.setTargetAtTime(300 + g.ratio * 1500 - lug * 250 + (turbo ? 500 : 0), t, tc); e.nb.frequency.setTargetAtTime(220 + g.ratio * 900, t, tc);
    const load = Math.max(0.12, g.load * (gas ? 1 : 0.6));
    e.gain.gain.setTargetAtTime(0.42 * (0.18 + 0.82 * load) * (0.3 + 0.62 * (0.7 * load + 0.3 * g.local)), t, tc);
    e.lg.gain.setTargetAtTime(3 + load * 4, t, tc);
    e.sg.gain.setTargetAtTime(drift ? 0.07 + speed01 * 0.06 : 0, t, drift ? 0.04 : 0.08);
  },
};
