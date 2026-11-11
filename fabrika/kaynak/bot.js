window.mkBot = (skill) => {
  const S = { yavas: { think: 1.3, mag: 0.8, idle: 0.12, idleT: 4, cashMin: 20, upF: 0.25 }, orta: { think: 0.6, mag: 0.9, idle: 0.05, idleT: 3, cashMin: 10, upF: 0.35 }, hizli: { think: 0.25, mag: 1, idle: 0.02, idleT: 2, cashMin: 6, upF: 0.45 }, cokhizli: { think: 0.06, mag: 1, idle: 0, idleT: 0, cashMin: 3, upF: 0.5 } }[skill];
  const B = { T: 0, tgt: null, path: [], kind: '', wait: 0, sig: '', still: 0, tl: 0, stuckT: 0, lastD: 1e9, stuckN: 0, log: {}, nPads: 0 };
  const go = (I, pos, kind, extra) => { B.tgt = pos.clone ? pos.clone() : pos; B.kind = kind; B.extra = extra; const p = I.P.o.position; B.path = I.navPath(p.x, p.z, B.tgt.x, B.tgt.z) || [B.tgt]; B.still = 0; B.sig = ''; B.tl = 25; (B.hist = B.hist || []).push([Math.round(B.T), kind, +B.tgt.x.toFixed(1), +B.tgt.z.toFixed(1), +I.P.o.position.x.toFixed(1), +I.P.o.position.z.toFixed(1), I.P.stack.length]); if (B.hist.length > 14) B.hist.shift(); B.stuckT = 0; B.lastD = 1e9; B.stuckN = 0; };
  function decide() {
    const I = __fb.I(), P = I.P, SV = I.SV, cap = I.cap, half = Math.ceil(cap / 2);
    const st = P.stack.map(o => o.userData), cnt = f => st.filter(f).length;
    const tested = cnt(u => ['toy', 'top', 'gift', 'plush', 'key'].includes(u.type) && u.ok), untested = cnt(u => (u.type === 'toy' || u.type === 'top') && !u.ok), rej = cnt(u => u.type === 'reject');
    const f = cnt(u => u.type === 'feather'), b = cnt(u => u.type === 'base');
    const pads = I.padObjs.map(o => ({ o, rem: o.p.cost - o.paid })).sort((a, c) => a.rem - c.rem); const nextRem = pads.length ? pads[0].rem : Infinity;
    if (pads.length && SV.money >= pads[0].rem) return go(I, new THREE_V(pads[0].o.p.x, pads[0].o.p.z), 'pad', pads[0].o.p.id);
    if (tested) { const C = I.K.filter(C => !C.pile.full()).sort((a, c) => a.pile.n - c.pile.n)[0]; if (C) return go(I, C.zone, 'drop'); }
    if (untested) { if (I.TS && I.TS.q.length < 16) return go(I, I.TS.inZone, 'drop'); if (!I.TS) return go(I, I.K[0].zone, 'drop'); }
    if (rej && I.RC) return go(I, I.RC.inZone, 'drop');
    // upgrades and hiring
    const ups = []; if (I.ZONES.ofis) for (const u of I.UPS.filter(u => !u.need || I.has(u.need)).concat(I.ZONES.ik ? I.SUPS : [])) { const l = I.lv(u.id); if (l < u.max) ups.push({ id: u.id, c: Math.round(u.base * Math.pow(u.mult, l)), z: 'ofis' }); }
    if (I.ZONES.ik) for (const s of I.STAFF) { const n = SV.staff[s.id]; if (n < s.max && (s.id !== 'kas' || n < I.K.length)) ups.push({ id: s.id, c: s.costs[n], z: 'ik', hire: 1 }); }
    ups.sort((a, c) => a.c - c.c); const lim = Math.min(SV.money, nextRem === Infinity ? SV.money : S.upF * nextRem);
    if (ups.length && ups[0].c <= lim) return go(I, I.ZONES[ups[0].z].pos, 'buy', ups[0].z);
    const cashN = I.K.reduce((a, C) => a + C.cash.n, 0) + (I.TR ? I.TR.cash.n : 0); const cashV = I.K.reduce((a, C) => a + C.cash.items.reduce((s, o) => s + (o.userData.v || 5), 0), 0);
    if (cashN && (cashN >= S.cashMin || SV.money + cashV >= nextRem)) { const piles = I.K.map(C => C.cash).concat(I.TR ? [I.TR.cash] : []).sort((a, c) => c.n - a.n); return go(I, piles[0].pos, 'cash'); }
    const fP = [I.penPile, I.farmPile, I.farmPile2].filter(p => p && p.n).sort((a, c) => c.n - a.n)[0], bP = [I.miniPile, I.pressPile, I.pressPile2].filter(p => p && p.n).sort((a, c) => c.n - a.n)[0];
    const prods = (I.TS ? [I.TS.out] : []).concat(I.GS ? [I.GS.out] : [], I.PL ? [I.PL.out] : [], I.RC ? [I.RC.out] : [], I.asm.map(a => a.out), I.TM ? [I.TM.out] : []).filter(p => p.n).sort((a, c) => c.n - a.n);
    const aF = I.asm.reduce((s, a) => s + a.inF.length, 0), aB = I.asm.reduce((s, a) => s + a.inB, 0), aLim = 8 * Math.max(1, I.asm.length);
    const needF = f < half && (!I.asm.length || I.asm.some(a => a.inF.length + f < 16)), needB = b < half && (!I.asm.length || I.asm.some(a => a.inB + b < 16));
    if (f + b > 0) { const more = (f + b < cap) && ((needF && fP) || (needB && bP));
      if (!more || (prods.length && prods[0].n >= 4)) { if (I.asm.length) { const A = I.asm.slice().sort((a, c) => ((f ? a.inF.length : 0) + (b ? a.inB : 0)) - ((f ? c.inF.length : 0) + (b ? c.inB : 0)))[0]; return go(I, A.inZone, 'drop'); } if (f && b) return go(I, I.K[0].zone, 'drop'); } }
    if (!f && !b && prods.length) return go(I, prods[0].zone, 'take');
    if (!tested && !untested && f + b < cap) { if (needF && fP && (!needB || !bP || aF + f <= aB + b)) return go(I, fP.zone, 'take'); if (needB && bP) return go(I, bP.zone, 'take'); if (needF && fP) return go(I, fP.zone, 'take'); }
    if (f + b > 0 && I.asm.length) return go(I, I.asm[0].inZone, 'drop');
    if (cashN) { const piles = I.K.map(C => C.cash).sort((a, c) => c.n - a.n); return go(I, piles[0].pos, 'cash'); }
    B.wait = 0.5;
  }
  const THREE_V = function (x, z) { const v = __fb.I().P.o.position.clone(); v.set(x, 0, z); return v; };
  B.nInter = 0; B.lastI = -1; B.inter = () => { if (!(SV0().tut >= 4 || SV0().tut >= 99)) return; if (B.lastI < 0) { B.lastI = B.T; return; } if (B.T - B.lastI >= 240) { B.lastI = B.T; B.nInter++; } };
  const SV0 = () => __fb.SV;
  B.step = (dt) => { B.T += dt; const I = __fb.I(), P = I.P, SV = I.SV;
    if (I.padObjs.length === 0 && !B.done && SV.unl.length > 10) { B.done = B.T; }
    if (SV.unl.length !== B.nPads) { B.inter(); B.nPads = SV.unl.length; B.log[SV.unl[SV.unl.length - 1]] = Math.round(B.T); }
    if (B.wait > 0) { B.wait -= dt; __fb.joy(0, 0); return; }
    if (!B.tgt) { decide(); if (B.tgt && Math.random() < S.idle) B.wait = S.idleT; if (!B.tgt) return; }
    const p = P.o.position;
    if (B.path.length) { const w = B.path[0], dx = w.x - p.x, dz = w.z - p.z, d = Math.hypot(dx, dz);
      if (d < (B.path.length > 1 ? 0.45 : 0.3)) { B.path.shift(); if (!B.path.length && Math.hypot(B.tgt.x - p.x, B.tgt.z - p.z) > 0.6) B.path = [B.tgt]; } else { __fb.joy(dx / d * S.mag, dz / d * S.mag);
        const D = Math.hypot(B.tgt.x - p.x, B.tgt.z - p.z); B.stuckT += dt; if (B.stuckT > 2) { if (D > B.lastD - 0.3) { B.stuckN++; if (B.stuckN > 3) { B.tgt = null; B.wait = S.think; B.stuck = (B.stuck || 0) + 1; return; } B.path = I.navPath(p.x, p.z, B.tgt.x, B.tgt.z) || [B.tgt]; } B.lastD = D; B.stuckT = 0; } return; } }
    __fb.joy(0, 0);
    if (B.kind === 'buy') { let any = true; while (any) { any = false; const ups = []; for (const u of I.UPS.filter(u => !u.need || I.has(u.need)).concat(I.ZONES.ik ? I.SUPS : [])) { const l = I.lv(u.id); if (l < u.max) ups.push({ id: u.id, c: Math.round(u.base * Math.pow(u.mult, l)) }); }
        for (const s of I.STAFF) { const n = SV.staff[s.id]; if (n < s.max && (s.id !== 'kas' || n < I.K.length)) ups.push({ id: s.id, c: s.costs[n], hire: 1 }); }
        ups.sort((a, c) => a.c - c.c); const pads = I.padObjs.map(o => o.p.cost - o.paid).sort((a, c) => a - c); const lim = Math.min(SV.money, pads.length ? S.upF * pads[0] : SV.money);
        if (ups.length && ups[0].c <= lim) { any = ups[0].hire ? __fb.hire(ups[0].id) : __fb.buyUp(ups[0].id); } }
      B.inter(); B.tgt = null; B.wait = S.think; return; }
    const sig = P.stack.length + '|' + (P.act ? 1 : 0) + '|' + Math.floor(SV.money) + '|' + (B.kind === 'pad' ? I.has(B.extra) : '');
    if (sig !== B.sig) { B.sig = sig; B.still = 0; } else B.still += dt; B.tl -= dt;
    if (B.kind === 'pad' && I.has(B.extra)) { B.tgt = null; B.wait = S.think; return; }
    if ((B.still > 0.7 && !P.act) || B.tl < 0) { B.tgt = null; B.wait = S.think; } };
  return B;
};
