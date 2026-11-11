// ===== Flix Bomba game =====
// Grid rules and the bot's "flee / bomb the crate / hunt" loop follow MattSkala/html5-bombergirl (MIT); rewritten for 3D with pathfinding.
const $ = (id) => document.getElementById(id);
const VERSION = '1.2';
const SAVE_KEY = 'flix_bomba1';
let SV = { char: 'flix', diff: 1, sound: true, music: true, wins: 0, games: 0, seenHow: false, mac: 0, bul: 0 };
try { Object.assign(SV, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) {} };

// ===== v1.2: language, profile, feathers, avatars, opponents, ads, shop =====
{ const d = { lang: null, name: '', av: null, xp: 0, tuy: 150, own: null, bgs: [0, 1, 2], frs: [0], sts: [0], day: { last: '', n: 0 }, tip: {}, noads: 0, tx: [], adDay: '', adN: 0, played: 0 };
  for (const k in d) if (SV[k] === undefined || SV[k] === null) SV[k] = d[k]; }
if (SV.lang !== 'tr' && SV.lang !== 'en') SV.lang = (navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en';
if (!Array.isArray(SV.own)) SV.own = [...new Set(['flix', 'kick', SV.char])];
if (!SV.own.includes(SV.char)) SV.char = 'flix';
if (!SV.av) SV.av = { f: SV.char, bg: 0, fr: 0, st: 0 };
if (!SV.name) SV.name = (SV.lang === 'en' ? 'Player' : 'Oyuncu') + (1000 + Math.floor(Math.random() * 9000));
const T = (tr, en) => (SV.lang === 'en' ? en : tr);
const escH = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtN = (n) => Math.round(n).toLocaleString(SV.lang === 'en' ? 'en-US' : 'tr-TR');
const rndI = (n) => Math.floor(Math.random() * n);
const shufA = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rndI(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const CH_EN = {
  flix: { abil: 'Remote Detonate', desc: 'Sets off his own bombs whenever he wants.', tag: 'All-round hero' },
  wu: { name: 'Master Wu', abil: 'Zen Shield', desc: 'No blast can touch him for 3 seconds.', tag: 'Slow but strong' },
  kick: { abil: 'Super Kick', desc: 'Kicks a bomb and it slides until it hits a wall. Walking into a bomb pushes it too.', tag: 'Bomb kicker' },
  flick: { abil: 'Flick Dash', desc: 'Dashes 3 tiles the way he faces, right over bombs.', tag: 'The fastest' },
  buzul: { name: 'Frost Flix', abil: 'Freeze', desc: 'Freezes nearby rivals for 2.5 seconds.', tag: 'Cool-headed' },
};
const cx = (ch, k) => (SV.lang === 'en' && CH_EN[ch.id] && CH_EN[ch.id][k]) || ch[k];
const CH_PRICE = { flix: 0, kick: 0, flick: 800, wu: 1200, buzul: 2000 };

// level: each level needs a bit more XP than the one before
function lvInfo(xp) { let l = 1, need = 80; while (xp >= need) { xp -= need; l++; need = 80 + (l - 1) * 40; } return { l, cur: xp, need }; }
const myLv = () => lvInfo(SV.xp).l;
function grant(tuy, xp) { const a = myLv(); SV.tuy += tuy; SV.xp += xp; const b = myLv(); let bonus = 0; if (b > a) { bonus = (b - a) * 50; SV.tuy += bonus; } save(); return { up: b > a ? b : 0, bonus }; }

// avatar = face (character portrait) + backdrop colour + frame + badge
const BGS = ['#ffd41f', '#e22511', '#1f9ee8', '#6cc22c', '#ff7ab0', '#8a4bff', '#ff8a1f', '#15c7b0', '#022753', '#1b1b22'];
const bgPrice = (i) => (i < 3 ? 0 : i < 8 ? 150 : 300);
const FRS = [
  { n: ['Sade', 'Plain'], p: 0, g: '#022753' },
  { n: ['Altın', 'Gold'], p: 400, g: 'linear-gradient(135deg,#fff3a0,#f4a900,#fff3a0,#c97a00)' },
  { n: ['Ateş', 'Fire'], p: 600, g: 'conic-gradient(#ff3d00,#ffd41f,#ff3d00,#ffd41f,#ff3d00)' },
  { n: ['Buz', 'Ice'], p: 600, g: 'linear-gradient(135deg,#dff7ff,#2f9bea,#dff7ff,#1668b8)' },
  { n: ['Neon', 'Neon'], p: 900, g: 'conic-gradient(#ff2bd6,#22e0ff,#7dff3a,#ff2bd6)' },
  { n: ['Efsane', 'Legend'], p: 1500, g: 'conic-gradient(#ffd41f,#e22511,#8a4bff,#1f9ee8,#6cc22c,#ffd41f)' },
];
const STS = [['', 0], ['💣', 100], ['⚡', 100], ['🔥', 200], ['⭐', 200], ['🎯', 300], ['👑', 800], ['🏆', 1200]];
function normAv(a) { a = a || {}; const ci = (v, n) => ((v = v | 0), v >= 0 && v < n ? v : 0); return { f: CHARS.some((c) => c.id === a.f) ? a.f : 'flix', bg: ci(a.bg, BGS.length), fr: ci(a.fr, FRS.length), st: ci(a.st, STS.length) }; }
function avHTML(av, s) { const a = normAv(av); return '<span class="av" style="--s:' + s + 'px;--bg:' + BGS[a.bg] + ';--fr:' + FRS[a.fr].g + '"><span class="avi"><img alt="" src="' + (PORT[a.f] || '') + '"></span>' + (STS[a.st][0] ? '<em>' + STS[a.st][0] + '</em>' : '') + '</span>'; }
const myPf = () => ({ n: SV.name, lv: myLv(), av: SV.av });
function cleanPf(p) { p = p || {}; const a = Array.isArray(p.a) ? p.a : []; return { n: String(p.n || '').replace(/[<>&"']/g, '').trim().slice(0, 14) || T('Oyuncu', 'Player'), lv: Math.max(1, Math.min(999, p.lv | 0)), av: normAv({ f: a[0], bg: a[1], fr: a[2], st: a[3] }) }; }
const pname = (p) => (p.isBot || p.remote ? escH(p.nm) : T('SEN', 'YOU'));

// computer opponents: they fill matches when no other player is around
const BOT_N = ['Emre34', 'zeynep.k', 'Burak_07', 'DenizY', 'KeremA', 'elifnur', 'Mert61', 'CanBerk', 'aylin35', 'Ozan', 'Selin_', 'Tolga06', 'ArdaT', 'Ece', 'yusufefe', 'Irmak', 'BarisK', 'Defne', 'Hakan55', 'melis.a', 'Umut', 'Sude_', 'Efe2012', 'Berkay', 'Leo_M', 'Sofia22', 'MaxR', 'noah.k', 'MiaB', 'Lucas10', 'Emma', 'JackT', 'Oliver', 'Hana', 'Mateo', 'Luca_9', 'Nora', 'SamW', 'Ivy', 'Theo'];
function mkBots(n) {
  const my = myLv(), ids = shufA(CHARS.map((c) => c.id).filter((c) => c !== SV.char));
  return shufA(BOT_N).slice(0, n).map((nm, i) => { const lv = Math.max(1, my + rndI(6) - 2), c = ids[i % ids.length];
    const fr = lv >= 12 && Math.random() < 0.5 ? 1 + rndI(5) : lv >= 5 && Math.random() < 0.4 ? 1 + rndI(3) : 0;
    return { c, n: nm, lv, dn: lv <= 3 ? 0 : lv <= 9 ? 1 : 2, av: { f: Math.random() < 0.75 ? c : CHARS[rndI(CHARS.length)].id, bg: rndI(BGS.length), fr, st: Math.random() < 0.5 ? rndI(STS.length) : 0 } }; });
}

// matchmaking screen: shows who you are about to play
const MM = { on: false, t: 0, kind: '', bots: null, go: -1, sig: '', n: 0, real: 0, sent: false };
function mmBots(t0, t1) { MM.bots = mkBots(3).map((b) => Object.assign(b, { at: MM.t + t0 + Math.random() * (t1 - t0) })); }
function mmStart(kind) { Object.assign(MM, { on: true, t: 0, kind, bots: null, go: -1, sig: '', n: 0, real: 0, sent: false }); if (kind === 'arena') mmBots(0.7, 3); sheet('vs', true); mmRender([]); if (kind === 'quick') NET.open('acik'); }
function mmStop() { if (!MM.on) return; MM.on = false; sheet('vs', false); }
function mmRender(slots) {
  const card = (p, me, isNew) => '<div class="vc' + (me ? ' me' : '') + (isNew ? ' new' : '') + '">' + avHTML(p.av, 76) + '<b>' + escH(p.n) + '</b><span>' + T('Seviye ', 'Level ') + p.lv + '</span></div>';
  let h = card(myPf(), true, false); for (let i = 0; i < 3; i++) h += slots[i] ? card(slots[i], false, i >= MM.n) : '<div class="vc wait"><div class="q">?</div><b>&nbsp;</b><span>&nbsp;</span></div>';
  if (slots.length > MM.n) AUD.play('pick'); MM.n = slots.length;
  $('vsGrid').innerHTML = h; $('vsT').textContent = MM.go > 0 ? T('MAÇ BULUNDU!', 'MATCH FOUND!') : T('Rakip aranıyor', 'Finding opponents') + '.'.repeat(1 + (Math.floor(MM.t * 2) % 3)); $('vsX').style.visibility = MM.go > 0 ? 'hidden' : 'visible';
}
function mmTick(dt) {
  if (!MM.on) return; MM.t += dt; let slots;
  if (MM.bots) slots = MM.bots.filter((b) => b.at <= MM.t);
  else { const L = NET.list().filter((p) => !p.me).slice(0, 3); slots = L.map((p) => p.pf);
    if (L.length) { MM.real += dt; if (MM.real > 2.5 && NET.isHost() && !MM.sent) { MM.sent = true; NET.hostStart(); } } else { MM.real = 0; MM.sent = false; }
    if ((MM.t >= 10 && !L.length) || MM.t >= 17) { NET.leave(); mmBots(0.2, 1.5); slots = []; MM.n = 0; } }
  if (MM.bots && slots.length === 3 && MM.go < 0) MM.go = MM.t + 1.6;
  if (MM.go > 0 && MM.t >= MM.go) { const bots = MM.bots, quick = MM.kind === 'quick'; mmStop(); startGame('arena', { bots, quick }); return; }
  const sig = slots.length + '|' + (MM.go > 0) + '|' + Math.floor(MM.t * 2); if (sig !== MM.sig) { MM.sig = sig; mmRender(slots); }
}

// ads: AdMob inside the app (window.FlixAds); on the web our own Flix card so the flow can be tried
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
let lastRewardAt = 0;
function webAd(kind) {
  return new Promise((res) => { let left = kind === 'rewarded' ? 5 : 3; sheet('adL', true); $('adKind').textContent = kind === 'rewarded' ? T('ÖDÜLLÜ REKLAM', 'REWARDED AD') : T('REKLAM', 'AD');
    const c = $('adClose'); c.disabled = true; c.textContent = left; const t = setInterval(() => { left--; if (left > 0) c.textContent = left; else { clearInterval(t); c.disabled = false; c.textContent = '✕'; } }, 1000);
    c.onclick = () => { if (c.disabled) return; sheet('adL', false); res(true); }; });
}
async function adRewarded() { let ok; if (window.FlixAds) ok = (await window.FlixAds.showRewarded(5000)) === 'rewarded'; else if (NATIVE) ok = false; else ok = await webAd('rewarded'); if (ok) lastRewardAt = Date.now(); return ok; }
async function adInter() { if (SV.noads || Date.now() - lastRewardAt < 90000) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); if (NATIVE) return false; return webAd('inter'); }
async function maybeInter() { SV.played++; save(); if (SV.played % 3 === 0) await adInter(); }
const adScreen = (n) => { if (window.FlixAds) window.FlixAds.setScreen(n); };
if (SV.noads && window.FlixAds) window.FlixAds.setAdsRemoved(true);

// shop
const PACKS = [{ id: 'bomba_tuy_1000', n: 1000, price: '$0.99' }, { id: 'bomba_tuy_3500', n: 3500, price: '$2.99' }, { id: 'bomba_tuy_7000', n: 7000, price: '$4.99' }, { id: 'bomba_tuy_16000', n: 16000, price: '$9.99' }];
const NOADS = { id: 'bomba_noads', price: '$2.99' }, FREE_AD = 60, FREE_AD_MAX = 5;
const priceOf = (p) => (window.FlixNative && window.FlixNative.price && window.FlixNative.price(p.id)) || p.price;
window.__fkuGrant = (id, tx) => {
  if (tx) { if (SV.tx.includes(tx)) return; SV.tx.push(tx); if (SV.tx.length > 80) SV.tx.shift(); }
  const p = PACKS.find((q) => q.id === id); if (p) { SV.tuy += p.n; toast('+' + fmtN(p.n) + ' 🪶'); } else if (id === NOADS.id) { SV.noads = 1; if (window.FlixAds) window.FlixAds.setAdsRemoved(true); toast(T('Reklamlar kapandı', 'Ads removed')); }
  save(); renderHome(); if (!$('shop').hidden) renderShop();
};
async function buyIap(p) {
  if (NATIVE && window.FlixNative) { const r = await window.FlixNative.buy(p.id); if (r === 'pending') toast(T('Onay bekleniyor', 'Waiting for approval')); else if (!r) toast(T('Satın alma tamamlanmadı', 'Purchase not completed')); return; }
  toast(T('Satın alma App Store sürümünde açılacak', 'Purchases open in the App Store version'));
}
const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function freeAdLeft() { if (SV.adDay !== dayKey()) { SV.adDay = dayKey(); SV.adN = 0; } return FREE_AD_MAX - SV.adN; }
function renderShop() {
  const left = freeAdLeft(); $('shopTuy').textContent = '🪶 ' + fmtN(SV.tuy);
  let h = '<button class="prow" data-s="ad"' + (left > 0 ? '' : ' disabled') + '><span>🎬</span><div><b>+' + FREE_AD + ' 🪶</b><small>' + T('Reklam izle · bugün kalan ', 'Watch an ad · left today ') + Math.max(0, left) + '</small></div><i>' + T('İZLE', 'WATCH') + '</i></button>';
  PACKS.forEach((p, i) => { h += '<button class="prow" data-s="' + i + '"><span>🪶</span><div><b>' + fmtN(p.n) + T(' tüy', ' feathers') + '</b><small>' + [T('Küçük kese', 'Small pouch'), T('Dolu kese', 'Full pouch'), T('Sandık', 'Chest'), T('Hazine', 'Treasure')][i] + '</small></div><i>' + priceOf(p) + '</i></button>'; });
  h += '<button class="prow" data-s="noads"' + (SV.noads ? ' disabled' : '') + '><span>🚫</span><div><b>' + T('Reklamları kaldır', 'Remove ads') + '</b><small>' + T('Maç arası reklamlar kapanır', 'No more ads between matches') + '</small></div><i>' + (SV.noads ? '✓' : priceOf(NOADS)) + '</i></button>';
  if (NATIVE) h += '<button class="prow" data-s="rest"><span>↺</span><div><b>' + T('Satın alımları geri yükle', 'Restore purchases') + '</b></div><i></i></button>';
  $('shopRows').innerHTML = h;
}

// daily reward: 7-day streak, missing a day starts over
const DAILY = [50, 80, 120, 160, 200, 300, 600];
function dailyState() { const t = dayKey(), y = dayKey(new Date(Date.now() - 864e5)); let n = SV.day.n || 0; if (SV.day.last !== t && SV.day.last !== y) n = 0; return { can: SV.day.last !== t, idx: SV.day.last === t ? (n + 6) % 7 : n % 7, n }; }
let dayGot = 0;
function renderDaily() {
  const s = dailyState();
  $('dayGrid').innerHTML = DAILY.map((v, i) => '<div class="dy' + (i < s.idx || (!s.can && i === s.idx) ? ' got' : '') + (s.can && i === s.idx ? ' cur' : '') + (i === 6 ? ' big7' : '') + '"><span>' + T('Gün ', 'Day ') + (i + 1) + '</span><b>' + (i < s.idx || (!s.can && i === s.idx) ? '✓' : '🪶') + '</b><em>' + v + '</em></div>').join('');
  $('dayGo').hidden = !s.can; $('dayGo').textContent = T('AL · ', 'CLAIM · ') + DAILY[s.idx] + ' 🪶';
  $('dayAd').hidden = s.can || !dayGot; $('dayMsg').textContent = s.can ? T('Her gün gir, ödül büyüsün. Bir gün kaçırırsan seri baştan başlar.', 'Come back every day for bigger rewards. Miss a day and the streak starts over.') : T('Bugünkü ödülü aldın. Yarın yine gel!', 'You claimed today\'s reward. Come back tomorrow!');
}

// first-time goal cards
const TIPS = {
  macera: () => [T('Macera: ne yapacağım?', 'Adventure: what do I do?'), [T('👾 Canavarları bombayla patlat. Onlara dokunursan yanarsın.', '👾 Blast the monsters with bombs. Touching one knocks you out.'), T('🧱 Tuğlaları kır. Birinin altında gizli kapı var.', '🧱 Break the bricks. A hidden door is under one of them.'), T('🚪 Bütün canavarlar bitince kapı açılır. Kapıya gir, bölüm biter.', '🚪 When every monster is gone the door opens. Walk in to finish the level.'), T('⏱ Süre dolmadan bitir. 20 bölüm var, gittikçe zorlaşır.', '⏱ Beat the clock. There are 20 levels and they get harder.')]],
  arena: () => [T('Arena: ne yapacağım?', 'Arena: what do I do?'), [T('💣 4 oyuncu aynı alanda. Bombanla rakiplerini sıkıştır.', '💣 4 players, one arena. Trap your rivals with bombs.'), T('🏁 Son ayakta kalan raundu alır.', '🏁 Last one standing takes the round.'), T('🏆 3 raunt alan maçı kazanır.', '🏆 First to 3 rounds wins the match.'), T('⏱ 2 dakika sonra alan kenarlardan daralır.', '⏱ After 2 minutes the arena starts closing in.')]],
  bulmaca: () => [T('Bulmaca: ne yapacağım?', 'Puzzle: what do I do?'), [T('⭐ Hedef: bütün altın kasaları patlatmak.', '⭐ Goal: blow up every gold crate.'), T('💣 Bomban sayılı. Nereye koyacağını düşün.', '💣 You only get a few bombs. Think where to put them.'), T('🟣 Mor bombalar uyur. Bir patlama değince onlar da patlar.', '🟣 Purple bombs sleep. A blast that touches one sets it off.'), T('🧠 Süre yok, acele etme.', '🧠 No timer, take your time.')]],
};
let tipGo = null;
function tip(kind, go) { if (SV.tip[kind] || G.auto) return go(); const t = TIPS[kind](); $('goalT').textContent = t[0]; $('goalL').innerHTML = t[1].map((s) => '<li>' + s + '</li>').join(''); tipGo = () => { SV.tip[kind] = 1; save(); go(); }; sheet('goal', true); }

function applyLang() {
  document.documentElement.lang = SV.lang; try { localStorage.setItem('flixLegalLang', SV.lang); } catch (e) {}
  document.querySelectorAll('[data-en]').forEach((el) => { if (el.dataset.tr === undefined) el.dataset.tr = el.innerHTML; el.innerHTML = SV.lang === 'en' ? el.dataset.en : el.dataset.tr; });
  $('lobInput').placeholder = T('Oda kodu', 'Room code'); $('bPause').setAttribute('aria-label', T('Duraklat', 'Pause'));
}

// ---------- audio ----------
const AUD = {
  ctx: null, out: null, mus: null, want: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = (this.ctx = new C()); this.out = c.createGain(); this.out.gain.value = 0.9;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; this.out.connect(comp); comp.connect(c.destination);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; this.noiseB = nb;
    if (this.want) this.music(this.want);
  },
  tone(f, d, o = {}) { const c = this.ctx, t = c.currentTime + (o.at || 0), os = c.createOscillator(), g = c.createGain(); os.type = o.type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.3, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d); os.connect(g); g.connect(this.out); os.start(t); os.stop(t + d + 0.05); },
  noise(d, o = {}) { const c = this.ctx, t = c.currentTime + (o.at || 0), s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter(); s.buffer = this.noiseB; f.type = o.ft || 'lowpass'; f.frequency.setValueAtTime(o.fc || 1200, t); if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + d); g.gain.setValueAtTime(o.vol || 0.4, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + d + 0.05); },
  play(n) {
    if (!this.ctx || !SV.sound) return;
    try {
      if (n === 'place') { this.tone(520, 0.09, { to: 300, type: 'triangle', vol: 0.3 }); }
      else if (n === 'boom') { this.noise(0.5, { fc: 2400, fto: 120, vol: 0.75 }); this.tone(130, 0.4, { to: 38, vol: 0.7 }); this.noise(0.12, { fc: 6000, ft: 'highpass', vol: 0.18 }); }
      else if (n === 'pick') { this.tone(660, 0.08, { type: 'square', vol: 0.14 }); this.tone(990, 0.1, { type: 'square', vol: 0.14, at: 0.07 }); this.tone(1320, 0.16, { type: 'square', vol: 0.14, at: 0.14 }); }
      else if (n === 'die') { this.tone(700, 0.5, { to: 90, type: 'sawtooth', vol: 0.22 }); this.noise(0.25, { fc: 900, vol: 0.2 }); }
      else if (n === 'ui') { this.tone(740, 0.06, { type: 'triangle', vol: 0.2 }); }
      else if (n === 'kick') { this.tone(220, 0.12, { to: 520, type: 'triangle', vol: 0.35 }); this.noise(0.06, { fc: 3000, vol: 0.2 }); }
      else if (n === 'shield') { this.tone(440, 0.4, { to: 880, vol: 0.25 }); this.tone(660, 0.4, { to: 1320, vol: 0.15, at: 0.05 }); }
      else if (n === 'dash') { this.noise(0.22, { fc: 500, fto: 5000, ft: 'bandpass', vol: 0.35 }); }
      else if (n === 'freeze') { this.tone(1800, 0.5, { to: 500, type: 'triangle', vol: 0.2 }); this.noise(0.3, { fc: 7000, ft: 'highpass', vol: 0.15 }); }
      else if (n === 'zap') { this.tone(1200, 0.12, { to: 200, type: 'sawtooth', vol: 0.2 }); }
      else if (n === 'tick') { this.tone(880, 0.07, { type: 'square', vol: 0.12 }); }
      else if (n === 'go') { this.tone(1175, 0.3, { type: 'square', vol: 0.16 }); }
      else if (n === 'thud') { this.tone(110, 0.2, { to: 50, vol: 0.5 }); this.noise(0.1, { fc: 700, vol: 0.3 }); }
      else if (n === 'win') { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, { type: 'square', vol: 0.15, at: i * 0.12 })); this.tone(1047, 0.5, { type: 'triangle', vol: 0.2, at: 0.48 }); }
      else if (n === 'lose') { [392, 330, 262].forEach((f, i) => this.tone(f, 0.3, { type: 'triangle', vol: 0.2, at: i * 0.2 })); }
    } catch (e) {}
  },
  music(kind) {
    this.want = kind; if (!this.ctx) return;
    if (this.mus) { try { this.mus.stop(); } catch (e) {} this.mus = null; }
    if (!kind || !SV.music) return;
    try { this.mus = new MusicEngine(this.ctx, { output: this.out, volume: kind === 'menu' ? 0.16 : 0.22, menu: kind === 'menu', track: 'Rainbow Drift', intensity: kind === 'menu' ? 0 : 0.5 }); this.mus.start(); } catch (e) {}
  },
};
addEventListener('pointerdown', () => AUD.init(), { passive: true }); addEventListener('keydown', () => AUD.init());
document.addEventListener('visibilitychange', () => { if (!AUD.ctx) return; if (document.hidden) { AUD.ctx.suspend(); if (G.state === 'play') setPause(true); } else AUD.ctx.resume(); });

// ---------- renderer ----------
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const { scene, sun } = buildScene(renderer);
const island = buildIsland(scene);
const blocks = Blocks(scene), parts = Particles(scene), blasts = Blasts(scene);
const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 120);
const dyn = new THREE.Group(); scene.add(dyn);

// menu stage (far from the arena)
const STAGE = V3(60, 0, 0);
const stage = new THREE.Group(); stage.position.copy(STAGE); scene.add(stage);
{
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.65, 0.5, 48), SM(0x6cc22c, { roughness: 0.85 })); pod.position.y = -0.25; pod.receiveShadow = true; stage.add(pod);
  const dirt = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 0.9, 48), SM(0xd9722f, { roughness: 0.9 })); dirt.position.y = -0.95; stage.add(dirt);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 10, 48), SM(0xffd41f, { roughness: 0.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.02; stage.add(ring);
  const wtr = new THREE.Mesh(new THREE.CircleGeometry(30, 40), new THREE.MeshBasicMaterial({ map: island.water })); wtr.rotation.x = -Math.PI / 2; wtr.position.y = -1.45; stage.add(wtr);
  const bm = makeBombModel(); bm.position.set(-1.0, 0, 0.5); bm.scale.setScalar(0.8); stage.add(bm);
  const pu = makePowerup('range'); pu.position.set(1.0, 0, 0.55); stage.add(pu); stage.userData.pu = pu;
}
const stageChars = {}; let stageCur = null;
function showStageChar(id) {
  for (const k in stageChars) stageChars[k].g.visible = false;
  if (!stageChars[id]) { const P = makeChar(id); stage.add(P.g); stageChars[id] = P; }
  stageCur = stageChars[id]; stageCur.g.visible = true; stageCur.g.scale.setScalar(0.001); stageCur.pop = 0;
}

// ---------- game state ----------
const G = { state: 'menu', mode: 'arena', opt: {}, grid: [], players: [], bombs: [], mons: [], flames: new Map(), pus: new Map(), hidden: new Map(), pending: [], t: 0, time: 0, round: 1, paused: false, shake: 0, sd: null, auto: false, door: null, bLeft: 0, rng: Math.random };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const key = (x, y) => y * COLS + x;
const SPAWNS = [[0, ROWS - 1], [COLS - 1, 0], [0, 0], [COLS - 1, ROWS - 1]];
const ROUND_TIME = 120, FUSE = 2.6, FLAME = 0.5, WINS = 3, MAC_LEVELS = 20;
const DIFF = [{ n: 'Kolay', react: 0.42, hunt: 0.15, sloppy: 0.04 }, { n: 'Normal', react: 0.2, hunt: 0.5, sloppy: 0.02 }, { n: 'Zor', react: 0.07, hunt: 0.95, sloppy: 0 }];
const PUZ = [{"g":["#########","#########","##..T#.##","##.T3.###","##..T.P##","##.cc..##","##.#..c##","##....c##","#########","#########","#########"],"r":2,"k":1},{"g":["#########","c.....c.#",".c#.c...#",".c#....c#",".c..cc#.#","..T.##c.#","..1T.#.c#",".1..cc#c#",".P.c.cc##","...3#c..#","#########"],"r":2,"k":1},{"g":["#########","#########","##c#c2.##","##c..####","####...##","##2.c.c##","##..1PT##","##....3##","##c#.cT##","#########","#########"],"r":2,"k":1},{"g":["#########","#########","#Tcc.c..#","#c...Pc##","#cT1.#cc#","#ccc..#c#","#....##c#","#..c.#..#","#c..###.#","#########","#########"],"r":1,"k":2},{"g":["#########",".#..P..c#","#.c...c.#","#.cc.c.c#","#c.c.ccc#",".....c..#","..#..c..#","c.cTc#T##","....T..2#","#########","#########"],"r":3,"k":2},{"g":["#########","#########","###c.Tc##","#P..c#.##","#c1..Tc##","#.c.cc.##","#ccT..1##","##.c#..##","#.#...c##","#########","#########"],"r":2,"k":2},{"g":["#########","#########","#..1..c##","#.c.T..##","#.3.##.##","#cc.c3.##","#c.P.#.##","#T.#..1##","#.#..c.##","#########","#########"],"r":1,"k":2},{"g":["#########","#########","#########","##.TcT.##","##TP##3##","##....c##","##cT##.##","##.....##","#########","#########","#########"],"r":3,"k":3},{"g":["#########","#.#...c##","#c.3.3.##","#c.#c..##","#....T.##","#..cT.###","#Pcc#..##","##c#c..##","#.#T#c###","##.....##","#########"],"r":1,"k":3},{"g":["#########","#..c.####","##.##T###","#.....###","#.....###","#ccc.#T##","#T..32.##","#T.....##","#......##","#cc..P.##","#########"],"r":1,"k":3},{"g":["#########","#########",".#..#..##",".#.c.#c.#","...1...P#","cc#c.T..#","......#.#","##cT...T#","c.TT...##","#########","#########"],"r":1,"k":4},{"g":["#########","..#..#.c#","c.#.#T###","#c#c..Pc#",".c#cc.c.#","c..#Tc..#","..c#..T.#","T..c.T2.#","...cccc.#","#########","#########"],"r":2,"k":4}];
function mkRng(seed) { let s = Math.floor(seed) % 2147483647; if (s <= 0) s += 2147483646; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
const PU_W = [['bomb', 26], ['range', 26], ['speed', 18], ['kick', 9], ['pierce', 6], ['vest', 6], ['full', 3], ['skull', 6]];
function rollPu(rng) { let r = rng() * 100; for (const w of PU_W) { if ((r -= w[1]) < 0) return w[0]; } return 'bomb'; }
// standard arena: pillars on odd cells, crates everywhere else except around the spawn corners; power-ups are decided up front (same on every device for a given seed)
function newGrid(rng, dens, puRate, spawns) {
  const g = []; for (let y = 0; y < ROWS; y++) { g.push([]); for (let x = 0; x < COLS; x++) g[y].push(x % 2 === 1 && y % 2 === 1 ? 1 : 0); }
  const safe = new Set(); for (const s of spawns) { safe.add(key(s[0], s[1])); for (const d of DIRS) { const x = s[0] + d[0], y = s[1] + d[1]; if (inb(x, y)) safe.add(key(x, y)); } }
  G.hidden = new Map();
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!g[y][x] && !safe.has(key(x, y)) && rng() < dens) { g[y][x] = 2; if (rng() < puRate) G.hidden.set(key(x, y), rollPu(rng)); }
  return g;
}
function bombAt(x, y) { for (const b of G.bombs) if (Math.round(b.x) === x && Math.round(b.y) === y) return b; return null; }
function solid(x, y) { return !inb(x, y) || G.grid[y][x] !== 0; }
function blocked(x, y) { return solid(x, y) || !!bombAt(x, y); }
function playerAt(x, y, not) { for (const p of G.players) if (p.alive && p !== not && Math.round(p.px) === x && Math.round(p.py) === y) return p; for (const m of G.mons) if (m.alive && Math.round(m.x) === x && Math.round(m.y) === y) return m; return null; }

function makePlayer(i, charId, isBot, remote, pf) {
  const ch = CHARS.find((c) => c.id === charId) || CHARS[0], P = makeChar(ch.id), g = new THREE.Group();
  P.g.scale.setScalar(0.7); g.add(P.g);
  const shield = new THREE.Mesh(sphG(0.62, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0x8fe8ff, transparent: true, opacity: 0.4, roughness: 0.1, clearcoat: 1, depthWrite: false })); shield.position.y = 0.52; shield.visible = false; g.add(shield);
  const ice = new THREE.Mesh(new RoundedBoxGeometry(0.9, 1.2, 0.9, 3, 0.14), new THREE.MeshPhysicalMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.55, roughness: 0.08, clearcoat: 1, depthWrite: false })); ice.position.y = 0.6; ice.visible = false; g.add(ice);
  const skull = new THREE.Mesh(sphG(0.13, 12, 10), new THREE.MeshBasicMaterial({ color: 0x9b3bff })); skull.position.y = 1.5; skull.visible = false; g.add(skull);
  let mark = null;
  if (!isBot && !remote) { mark = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.46, 32), new THREE.MeshBasicMaterial({ color: 0xffd41f, transparent: true, opacity: 0.95, depthWrite: false })); mark.rotation.x = -Math.PI / 2; mark.position.y = 0.03; g.add(mark); }
  dyn.add(g);
  return { nm: (pf && pf.n) || ch.name, lv: (pf && pf.lv) || 1, av: (pf && pf.av) || { f: ch.id }, dn: pf && pf.dn !== undefined ? pf.dn : 1, i, ch, isBot, remote: !!remote, P, g, shield, ice, skull, mark, wins: 0, px: 0, py: 0, fx: 0, fy: 1, alive: true, speed: ch.spd, maxBombs: ch.bombs, range: ch.range, active: 0, cd: 0, shieldT: 0, frozenT: 0, dash: null, mv: 0, yaw: 0, at: 0, deadT: 0, ai: { path: [], think: 0, wait: 0 } };
}
function resetPlayer(p, spawn) {
  const s = spawn || SPAWNS[p.i]; p.px = s[0]; p.py = s[1]; p.fx = 0; p.fy = p.py > ROWS / 2 ? -1 : 1; p.alive = true; p.speed = p.ch.spd; p.maxBombs = p.ch.bombs; p.range = p.ch.range; p.active = 0; p.cd = 0; p.shieldT = 0; p.frozenT = 0; p.dash = null; p.deadT = 0; p.mv = 0;
  p.kick = p.ch.id === 'kick'; p.pierce = false; p.vest = false; p.curse = null; p.nbomb = 0; p.picked = []; p.exploded = []; p.done = new Set(); p.netMv = 0;
  p.ai = { path: [], think: Math.random() * 0.4, wait: 0 }; p.g.visible = true; p.g.scale.setScalar(1); p.g.rotation.set(0, 0, 0); p.P.g.position.y = 0; p.P.g.rotation.set(0, 0, 0); p.yaw = Math.atan2(p.fx, p.fy); p.shield.visible = p.ice.visible = p.skull.visible = false;
}
function clearRound() {
  for (const b of G.bombs) dyn.remove(b.m); G.bombs.length = 0; for (const [, u] of G.pus) dyn.remove(u.m); G.pus.clear(); G.flames.clear(); G.pending.length = 0; blasts.clear();
  for (const m of G.mons) dyn.remove(m.m); G.mons.length = 0; if (G.door) dyn.remove(G.door.m); G.door = null; G.doorCell = -1;
  G.sd = null; G.drop = null;
}
function clearPlayers() { for (const p of G.players) dyn.remove(p.g); G.players.length = 0; }
function startGame(mode, opt) {
  G.mode = mode; G.opt = opt || {}; clearPlayers(); G.stageWin = false;
  if (mode === 'arena') { const bots = G.opt.bots || mkBots(3); G.players.push(makePlayer(0, SV.char, G.auto, false, myPf())); bots.forEach((b, i) => G.players.push(makePlayer(i + 1, b.c, true, false, b))); }
  else if (mode === 'online') { NET.roster().forEach((r, i) => { const p = makePlayer(i, r.c, false, !r.me, r.pf); p.peer = r.peer; G.players.push(p); }); G.players.sort((a, b) => (a.remote ? 1 : 0) - (b.remote ? 1 : 0)); }
  else G.players.push(makePlayer(0, SV.char, G.auto, false, myPf()));
  G.view = null; adScreen('game'); G.round = 1; show('hud'); buildHud(); startRound(); AUD.music('game');
}
const startMatch = () => startGame('arena');
function startRound() {
  clearRound(); for (const id of ['res', 'pause']) $(id).hidden = true; G.paused = false;
  const m = G.mode, me = G.players[0];
  if (m === 'arena') { G.rng = mkRng(1 + Math.random() * 2e9); G.grid = newGrid(G.rng, 0.8, 0.42, SPAWNS); for (const p of G.players) resetPlayer(p); G.time = ROUND_TIME; }
  else if (m === 'online') { G.rng = mkRng(NET.seed + G.round * 7919); G.grid = newGrid(G.rng, 0.8, 0.42, SPAWNS); for (const p of G.players) resetPlayer(p); G.time = ROUND_TIME; }
  else if (m === 'macera') setupMacera(G.opt.level);
  else setupBulmaca(G.opt.level);
  blocks.sync(G.grid); G.state = 'intro'; G.t = 0; G.introT = 0; G.endT = 0; G.resT = 0; G.winner = null; updHud(); $('timer').classList.remove('hot'); lastTick = -1;
  banner(m === 'macera' ? T('BÖLÜM ', 'LEVEL ') + G.opt.level : m === 'bulmaca' ? T('BULMACA ', 'PUZZLE ') + G.opt.level : T('RAUNT ', 'ROUND ') + G.round, m === 'macera' ? T('Canavarları patlat, kapıyı bul', 'Blast the monsters, find the door') : m === 'bulmaca' ? T(G.bLeft + ' bombayla altın kasaları patlat', 'Blow up the gold crates with ' + G.bLeft + ' bombs') : cx(me.ch, 'name') + T(' sensin', ' is you'), 1.5);
}
function setupMacera(L) {
  const rng = (G.rng = mkRng(4000 + L * 131)), me = G.players[0], sp = [[0, ROWS - 1]];
  G.grid = newGrid(rng, 0.42 + Math.min(0.3, L * 0.018), 0.34, sp); resetPlayer(me, sp[0]);
  me.maxBombs += Math.floor(L / 7); me.range += Math.floor(L / 6); G.time = L > 10 ? 240 : 180;
  const crates = []; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (G.grid[y][x] === 2 && Math.abs(x - sp[0][0]) + Math.abs(y - sp[0][1]) > 5) crates.push(key(x, y));
  G.doorCell = crates[Math.floor(rng() * crates.length)]; G.hidden.delete(G.doorCell);
  const n = Math.min(7, 2 + Math.floor(L * 0.4)), kinds = L < 3 ? [0] : L < 6 ? [0, 0, 1] : L < 10 ? [0, 1, 2] : L < 15 ? [0, 1, 2, 3] : [0, 1, 2, 3, 2];
  for (let i = 0, guard = 0; i < n && guard < 400; guard++) { const x = Math.floor(rng() * COLS), y = Math.floor(rng() * ROWS); if (G.grid[y][x] === 1 || Math.abs(x - sp[0][0]) + Math.abs(y - sp[0][1]) < 6 || key(x, y) === G.doorCell || G.mons.some((m) => m.x === x && m.y === y)) continue; if (G.grid[y][x] === 2) { G.grid[y][x] = 0; G.hidden.delete(key(x, y)); } addMonster(kinds[i % kinds.length], x, y); i++; }
}
function setupBulmaca(L) {
  const lv = PUZ[L - 1], me = G.players[0]; G.grid = []; G.hidden = new Map(); let sp = [0, 0]; const dorm = [];
  for (let y = 0; y < ROWS; y++) { G.grid.push([]); for (let x = 0; x < COLS; x++) { const c = lv.g[y][x]; G.grid[y].push(c === '#' ? 1 : c === 'c' ? 2 : c === 'T' ? 3 : 0); if (c === 'P') sp = [x, y]; if (c >= '1' && c <= '9') dorm.push([x, y, +c]); } }
  resetPlayer(me, sp); me.maxBombs = 1; me.range = lv.r; me.kick = false; G.bLeft = lv.k; G.time = 0;
  for (const d of dorm) { const m = makeBombModel(0x7a3fc4); m.position.set(wx(d[0]), 0, wz(d[1])); dyn.add(m); G.bombs.push({ x: d[0], y: d[1], fuse: Infinity, range: d[2], owner: null, m, vx: 0, vy: 0, t: 1, dormant: true }); }
}
const targetsLeft = () => { let n = 0; for (const r of G.grid) for (const v of r) if (v === 3) n++; return n; };

// ---------- monsters (Macera) ----------
const MON = [{ n: 'Balon', spd: 1.5, col: 0xff7ab0 }, { n: 'Koşucu', spd: 2.7, col: 0xffa01f }, { n: 'Avcı', spd: 2.1, col: 0x8a4bff }, { n: 'Hayalet', spd: 1.3, col: 0xdff4ff }];
function addMonster(type, x, y) { const m = makeMonster(type, MON[type].col); m.position.set(wx(x), 0, wz(y)); dyn.add(m); G.mons.push({ type, x, y, tx: x, ty: y, dx: 0, dy: 0, alive: true, m, t: Math.random() * 5, deadT: 0 }); }
function monBlocked(mo, x, y) { if (!inb(x, y)) return true; const v = G.grid[y][x]; if (v === 1 || (v && mo.type !== 3)) return true; return !!bombAt(x, y); }
function monUpdate(dt) {
  const me = G.players[0];
  for (const mo of G.mons) {
    if (!mo.alive) { if (mo.deadT < 1) { mo.deadT += dt * 2.5; mo.m.scale.setScalar(Math.max(0.001, 1 - mo.deadT)); mo.m.position.y += dt * 3; if (mo.deadT >= 1) mo.m.visible = false; } continue; }
    mo.t += dt; let step = MON[mo.type].spd * dt;
    for (let it = 0; it < 2 && step > 0; it++) {
      const ddx = mo.tx - mo.x, ddy = mo.ty - mo.y, d = Math.abs(ddx) + Math.abs(ddy);
      if (d < 0.001) { // pick the next cell
        mo.x = mo.tx; mo.y = mo.ty; const opts = DIRS.filter((q) => !monBlocked(mo, mo.x + q[0], mo.y + q[1])); if (!opts.length) { mo.dx = mo.dy = 0; break; }
        let pick = null;
        if (mo.type === 2 && me.alive) { const R = bfs({ speed: 3 }, new Float32Array(COLS * ROWS).fill(99), mo.x, mo.y), pk = key(Math.round(me.px), Math.round(me.py)); if (R.dist[pk] > 0) { const path = pathTo(R, pk), k = path[0]; pick = [k % COLS - mo.x, ((k / COLS) | 0) - mo.y]; } }
        if (!pick) { const fwd = opts.find((q) => q[0] === mo.dx && q[1] === mo.dy), turn = mo.type === 1 ? 0.45 : 0.2; pick = fwd && Math.random() > turn ? fwd : opts.filter((q) => opts.length === 1 || q[0] !== -mo.dx || q[1] !== -mo.dy)[Math.floor(Math.random() * Math.max(1, opts.filter((q) => opts.length === 1 || q[0] !== -mo.dx || q[1] !== -mo.dy).length))] || opts[0]; }
        mo.dx = pick[0]; mo.dy = pick[1]; mo.tx = mo.x + pick[0]; mo.ty = mo.y + pick[1];
      } else { if (monBlocked(mo, mo.tx, mo.ty) && (Math.round(mo.x) !== mo.tx || Math.round(mo.y) !== mo.ty)) { mo.tx = Math.round(mo.x - mo.dx * 0.5); mo.ty = Math.round(mo.y - mo.dy * 0.5); mo.dx = -mo.dx; mo.dy = -mo.dy; continue; } const s = Math.min(step, d); mo.x += Math.sign(ddx) * s; mo.y += Math.sign(ddy) * s; step -= s; }
    }
    mo.m.position.set(wx(mo.x), Math.abs(Math.sin(mo.t * 5)) * 0.08, wz(mo.y)); if (mo.dx || mo.dy) mo.m.rotation.y = Math.atan2(mo.dx, mo.dy); mo.m.scale.set(1 + Math.sin(mo.t * 10) * 0.04, 1 - Math.sin(mo.t * 10) * 0.04, 1 + Math.sin(mo.t * 10) * 0.04);
    if (G.flames.has(key(Math.round(mo.x), Math.round(mo.y)))) { mo.alive = false; AUD.play('pick'); parts.emit(wx(mo.x), 0.5, wz(mo.y), [MON[mo.type].col, 0xffffff], 14, 3, 0.12, 5, 0.9); updHud(); if (G.door && !G.mons.some((q) => q.alive)) openDoor(); continue; }
    if (me.alive && Math.hypot(me.px - mo.x, me.py - mo.y) < 0.62 && !me.dash) killPlayer(me);
  }
}
function revealDoor() { const k = G.doorCell, x = k % COLS, y = (k / COLS) | 0, m = makeDoor(); m.position.set(wx(x), 0, wz(y)); dyn.add(m); G.door = { x, y, m, open: false }; toast(T('Kapı bulundu!', 'Door found!')); if (!G.mons.some((q) => q.alive)) openDoor(); }
function openDoor() { if (!G.door || G.door.open) return; G.door.open = true; G.door.m.userData.open(); AUD.play('shield'); banner(T('KAPI AÇILDI!', 'DOOR IS OPEN!'), T('Kapıya koş', 'Run to the door'), 1.3); }

// ---------- bombs / blasts ----------
function placeBomb(p) {
  if (!p.alive || p.active >= p.maxBombs || (p.curse && p.curse.type === 'nobomb')) return null; const x = Math.round(p.px), y = Math.round(p.py); if (bombAt(x, y) || G.flames.has(key(x, y))) return null;
  if (G.mode === 'bulmaca') { if (G.bLeft <= 0) return null; G.bLeft--; updHud(); }
  const m = makeBombModel(p.pierce ? 0xc21a1a : 0x0b2f66); m.position.set(wx(x), 0, wz(y)); dyn.add(m);
  const b = { x, y, fuse: FUSE, range: p.range, owner: p, m, vx: 0, vy: 0, t: 0, pierce: p.pierce, id: ++p.nbomb }; G.bombs.push(b); p.active++; AUD.play('place'); return b;
}
function blastCells(x, y, range, grid, pierce) {
  const out = [[x, y]];
  for (const d of DIRS) for (let i = 1; i <= range; i++) { const cx = x + d[0] * i, cy = y + d[1] * i; if (!inb(cx, cy) || grid[cy][cx] === 1) break; out.push([cx, cy, i]); if (grid[cy][cx] >= 2 && !pierce) break; }
  return out;
}
function explode(b) {
  const i = G.bombs.indexOf(b); if (i < 0) return; G.bombs.splice(i, 1); dyn.remove(b.m); if (b.owner) { b.owner.active = Math.max(0, b.owner.active - 1); if (!b.owner.remote && b.id) { b.owner.exploded.push([b.id, Math.round(b.x), Math.round(b.y)]); if (b.owner.exploded.length > 6) b.owner.exploded.shift(); } }
  if (b.owner && b.owner.remote && b.id) (b.owner.done || (b.owner.done = new Set())).add(b.id);
  const x = Math.round(b.x), y = Math.round(b.y); AUD.play('boom'); G.shake = Math.min(0.5, G.shake + 0.28); blasts.ring(x, y);
  parts.emit(wx(x), 0.5, wz(y), [0x2a80dc, 0x2fa043, 0xffd41f, 0xffffff], 10, 3.5, 0.1, 5, 0.9);
  for (const c of blastCells(x, y, b.range, G.grid, b.pierce)) {
    const k = key(c[0], c[1]), v = G.grid[c[1]][c[0]]; blasts.add(c[0], c[1], (c[2] || 0) * 0.03, FLAME + 0.12); G.flames.set(k, Math.max(G.flames.get(k) || 0, FLAME));
    if (v >= 2) { G.grid[c[1]][c[0]] = 0; G.dirty = true; parts.emit(wx(c[0]), 0.5, wz(c[1]), v === 3 ? [0xffd41f, 0xf4a900, 0xffffff] : [0xf0582a, 0xde4a20, 0xff7a3d, 0x7ed334], 12, 3, 0.16, 4.5, 0.9);
      const t = G.hidden.get(k); if (t) { G.hidden.delete(k); G.pending.push({ x: c[0], y: c[1], t: FLAME + 0.02, type: t }); } if (k === G.doorCell && !G.door) revealDoor(); if (v === 3) updHud(); }
    else { const u = G.pus.get(k); if (u) { dyn.remove(u.m); G.pus.delete(k); } const ob = bombAt(c[0], c[1]); if (ob) { ob.fuse = Math.min(ob.fuse, 0.07 + (c[2] || 0) * 0.02); ob.chain = true; } }
  }
}
function kickBomb(b, dx, dy) { if (b.dormant || (b.owner && b.owner.remote)) return false; const nx = Math.round(b.x) + dx, ny = Math.round(b.y) + dy; if (blocked(nx, ny) || playerAt(nx, ny)) return false; b.vx = dx; b.vy = dy; AUD.play('kick'); return true; }
function killPlayer(p, force) {
  if (!p.alive || (p.remote && !force)) return;
  if (p.vest && !force) { p.vest = false; p.shieldT = 1.6; AUD.play('shield'); if (!p.isBot) toast(T('Yelek seni kurtardı!', 'The vest saved you!')); return; }
  p.alive = false; p.deadT = 0.0001; AUD.play('die'); G.shake = Math.min(0.5, G.shake + 0.15);
  parts.emit(wx(p.px), 0.7, wz(p.py), [new THREE.Color(p.ch.col).getHex(), 0xffffff, 0xffd41f], 22, 3.5, 0.13, 6, 1.1); updHud();
}
function applyPu(p, type) {
  if (type === 'bomb') p.maxBombs = Math.min(6, p.maxBombs + 1); else if (type === 'range') p.range = Math.min(7, p.range + 1); else if (type === 'speed') p.speed = Math.min(5.6, p.speed + 0.4);
  else if (type === 'kick') p.kick = true; else if (type === 'pierce') p.pierce = true; else if (type === 'vest') p.vest = true; else if (type === 'full') p.range = 7;
  else if (type === 'skull') { const ks = ['slow', 'reverse', 'nobomb', 'drop']; p.curse = { type: ks[Math.floor(Math.random() * ks.length)], t: 8 }; }
}
const PU_TXT = { bomb: ['+1 Bomba', '+1 Bomb'], range: ['+1 Menzil', '+1 Range'], speed: ['Hız +', 'Speed +'], kick: ['Tekme: bombaya yürü, it', 'Kick: walk into a bomb to push it'], pierce: ['Delici bomba', 'Piercing bomb'], vest: ['Yelek: bir patlamadan korur', 'Vest: saves you from one blast'], full: ['Tam menzil!', 'Full range!'], skull: ['Lanet!', 'Cursed!'] };
const CURSE_TXT = { slow: ['Lanet: yavaşladın', 'Curse: you are slow'], reverse: ['Lanet: yönler ters', 'Curse: controls reversed'], nobomb: ['Lanet: bomba koyamazsın', 'Curse: no bombs'], drop: ['Lanet: bombalar kendiliğinden düşüyor', 'Curse: bombs drop by themselves'] };


// ---------- movement ----------
function axisMove(p, ix, iy, dist, test) {
  const cx = Math.round(p.px), cy = Math.round(p.py); let moved = 0;
  const A = ix ? 'px' : 'py', B = ix ? 'py' : 'px', s = ix || iy, ca = ix ? cx : cy, cb = ix ? cy : cx;
  const blk = (a, b) => (ix ? blocked(a, b) : blocked(b, a));
  let off = p[B] - cb, target = cb;
  if (Math.abs(off) > 0.001) {
    const sg = Math.sign(off);
    if (blk(ca + s, cb) && !blk(ca, cb + sg) && !blk(ca + s, cb + sg)) target = cb + sg;
    const need = target - p[B], step = Math.sign(need) * Math.min(dist, Math.abs(need)); if (test) return Math.abs(step) > 0.0005 ? 1 : 0;
    p[B] += step; dist -= Math.abs(step); moved += Math.abs(step); if (Math.abs(p[B] - target) > 0.001) return moved; p[B] = target;
  }
  const row = Math.round(p[B]); let na = p[A] + s * dist; const c2 = Math.round(p[A]);
  if (blk(c2 + s, row)) { na = s > 0 ? Math.min(na, Math.max(c2, p[A])) : Math.max(na, Math.min(c2, p[A])); }
  const dlt = Math.abs(na - p[A]); if (test) return dlt > 0.0005 ? 1 : 0; p[A] = na; return moved + dlt;
}
function movePlayer(p, ix, iy, dt, cap) {
  if (!ix && !iy) return 0; p.fx = ix; p.fy = iy;
  const m = axisMove(p, ix, iy, cap === undefined ? p.speed * dt : Math.min(cap, p.speed * dt));
  if (m < 0.0005 && p.kick) { const b = bombAt(Math.round(p.px) + ix, Math.round(p.py) + iy); if (b && !b.vx && !b.vy && Math.abs(p.px - Math.round(p.px)) + Math.abs(p.py - Math.round(p.py)) < 0.05) kickBomb(b, ix, iy); }
  return m;
}
function useAbility(p) {
  if (!p.alive || p.cd > 0 || p.frozenT > 0) return false; const id = p.ch.id, x = Math.round(p.px), y = Math.round(p.py); let ok = false;
  if (id === 'flix') { const mine = G.bombs.filter((b) => b.owner === p); if (mine.length) { mine.forEach((b, i) => (b.fuse = Math.min(b.fuse, 0.02 + i * 0.05))); AUD.play('zap'); ok = true; } }
  else if (id === 'wu') { p.shieldT = 3; AUD.play('shield'); ok = true; }
  else if (id === 'kick') { let b = bombAt(x + p.fx, y + p.fy); if (!b) { b = bombAt(x, y) || placeBomb(p); } if (b && kickBomb(b, p.fx, p.fy)) ok = true; }
  else if (id === 'flick') { let n = 0, tx = x, ty = y; for (let i = 1; i <= 3; i++) { const cx = x + p.fx * i, cy = y + p.fy * i; if (solid(cx, cy)) break; if (!bombAt(cx, cy)) { n = i; tx = cx; ty = cy; } } if (n) { p.dash = { sx: p.px, sy: p.py, tx, ty, t: 0, d: 0.1 + n * 0.035 }; AUD.play('dash'); ok = true; } }
  else if (id === 'buzul') { for (const o of G.players) if (o !== p && o.alive && Math.hypot(o.px - p.px, o.py - p.py) < 4.2 && o.shieldT <= 0) { o.frozenT = 2.5; parts.emit(wx(o.px), 0.8, wz(o.py), [0xbfe8ff, 0xffffff], 10, 2, 0.1, 3, 0.7); } blasts.ring(x, y); AUD.play('freeze'); p.fzN = (p.fzN || 0) + 1; ok = true; }
  if (ok) { p.cd = p.ch.cd; p.at = 0.25; } return ok;
}

// ---------- bot AI ----------
function dangerMap(extra) {
  const D = new Float32Array(COLS * ROWS).fill(99), bs = G.bombs.map((b) => ({ x: Math.round(b.x), y: Math.round(b.y), fuse: b.fuse, range: b.range })); if (extra) bs.push(extra);
  for (let pass = 0; pass < 2; pass++) for (const b of bs) { const cells = blastCells(b.x, b.y, b.range, G.grid); if (pass === 0) b.cells = cells; for (const c of cells) for (const o of bs) if (o !== b && o.x === c[0] && o.y === c[1] && o.fuse > b.fuse) o.fuse = b.fuse + 0.05; }
  for (const b of bs) for (const c of b.cells) { const k = key(c[0], c[1]); if (b.fuse < D[k]) D[k] = b.fuse; }
  for (const [k] of G.flames) D[k] = 0;
  for (const m of G.mons) if (m.alive) { const mx = Math.round(m.x), my = Math.round(m.y); D[key(mx, my)] = 0; for (const d of DIRS) { const nx = mx + d[0], ny = my + d[1]; if (inb(nx, ny) && G.grid[ny][nx] === 0) D[key(nx, ny)] = Math.min(D[key(nx, ny)], 0.4); } }
  if (G.sd) for (let i = 0; i < 3 && G.sd.idx + i < G.sd.order.length; i++) { const c = G.sd.order[G.sd.idx + i]; D[key(c[0], c[1])] = Math.min(D[key(c[0], c[1])], G.sd.t + i * G.sd.step); }
  return D;
}
// BFS from the bot; returns {dist, prev}. Cells that will blow before we could cross them are not entered.
function bfs(p, D, sx, sy, ignoreBomb) {
  const dist = new Int16Array(COLS * ROWS).fill(-1), prev = new Int16Array(COLS * ROWS).fill(-1), q = [key(sx, sy)]; dist[q[0]] = 0; const st = 1 / p.speed;
  for (let h = 0; h < q.length; h++) { const k = q[h], x = k % COLS, y = (k / COLS) | 0;
    for (const d of DIRS) { const nx = x + d[0], ny = y + d[1]; if (!inb(nx, ny)) continue; const nk = key(nx, ny); if (dist[nk] >= 0 || solid(nx, ny)) continue; const bb = bombAt(nx, ny); if (bb && bb !== ignoreBomb) continue;
      const tArr = (dist[k] + 1) * st; if (D[nk] < 90 && (D[nk] < tArr + 0.35 && D[nk] + FLAME > tArr - st)) continue; if (G.flames.has(nk) && G.flames.get(nk) > tArr - st) continue;
      dist[nk] = dist[k] + 1; prev[nk] = k; q.push(nk); } }
  return { dist, prev, order: q };
}
function pathTo(R, k) { const out = []; while (R.prev[k] >= 0) { out.unshift(k); k = R.prev[k]; } return out; }
function botThink(p) {
  const df = DIFF[p.dn], ai = p.ai, x = Math.round(p.px), y = Math.round(p.py), me = key(x, y), D = dangerMap(), R = bfs(p, D, x, y);
  ai.path = [];
  if (D[me] < 90) { // flee to the nearest safe cell
    let best = -1; for (const k of R.order) if (D[k] >= 90) { best = k; break; }
    if (best >= 0) { ai.path = pathTo(R, best); if (p.ch.id === 'flick' && ai.path.length >= 3 && D[me] < 0.9) useAbility(p); }
    else { if (p.ch.id === 'wu' && D[me] < 0.6) useAbility(p); else if (p.ch.id === 'flick') { for (const d of DIRS) { p.fx = d[0]; p.fy = d[1]; const tx = x + d[0] * 3, ty = y + d[1] * 3; if (inb(tx, ty) && D[key(tx, ty)] >= 90 && useAbility(p)) break; } }
      let bk = me, bt = D[me]; for (const k of R.order) if (D[k] > bt) { bt = D[k]; bk = k; } ai.path = pathTo(R, bk); }
    return;
  }
  const foes = G.players.filter((o) => o.alive && o !== p).concat(G.mons.filter((m) => m.alive).map((m) => ({ px: m.x, py: m.y, isBot: true })));
  // bomb value here
  const cellsHere = blastCells(x, y, p.range, G.grid); let crates = 0, hit = 0;
  for (const c of cellsHere) { if (G.grid[c[1]][c[0]] === 2) crates++; for (const f of foes) if (Math.round(f.px) === c[0] && Math.round(f.py) === c[1] && (c[2] || 0) <= 2 + p.dn) hit++; }
  if (p.ch.id === 'buzul' && p.cd <= 0 && foes.some((f) => Math.hypot(f.px - p.px, f.py - p.py) < 3) && Math.random() < 0.5) useAbility(p);
  if (p.ch.id === 'flix' && p.cd <= 0 && p.active) { for (const b of G.bombs) if (b.owner === p && b.fuse > 0.6) { const cs = blastCells(Math.round(b.x), Math.round(b.y), b.range, G.grid); if (foes.some((f) => cs.some((c) => c[0] === Math.round(f.px) && c[1] === Math.round(f.py))) && Math.random() < df.hunt) { useAbility(p); break; } } }
  if (p.active < p.maxBombs && !bombAt(x, y) && (crates > 0 || (hit > 0 && Math.random() < df.hunt + 0.2)) && ai.wait <= 0) {
    const D2 = dangerMap({ x, y, fuse: FUSE, range: p.range }), R2 = bfs(p, D2, x, y); let esc = -1; for (const k of R2.order) if (D2[k] >= 90) { esc = k; break; }
    if ((esc >= 0 && R2.dist[esc] / p.speed < FUSE - 0.7) || Math.random() < df.sloppy) { const b = placeBomb(p); if (b) { if (p.ch.id === 'kick' && hit === 0 && p.cd <= 0 && Math.random() < 0.3) { for (const f of foes) { const dx = Math.sign(Math.round(f.px) - x), dy = Math.sign(Math.round(f.py) - y); if ((dx === 0) !== (dy === 0)) { p.fx = dx; p.fy = dy; useAbility(p); break; } } } if (esc >= 0) ai.path = pathTo(R2, esc); ai.wait = 0.5; return; } }
  }
  // pick a target among safe reachable cells
  let best = -1, bs = -1e9;
  for (const k of R.order) { if (D[k] < 90) continue; const cx = k % COLS, cy = (k / COLS) | 0, dist = R.dist[k]; let s = -dist * 0.6 + Math.random() * 0.8;
    if (G.pus.has(k)) s += G.pus.get(k).type === 'skull' ? -6 : 9; if (G.door && G.door.open && cx === G.door.x && cy === G.door.y) s += 60; let cr = 0; for (const d of DIRS) { const nx = cx + d[0], ny = cy + d[1]; if (inb(nx, ny) && G.grid[ny][nx] === 2) cr++; } s += cr * 2.2;
    for (const f of foes) { const fd = Math.abs(f.px - cx) + Math.abs(f.py - cy); s += df.hunt * Math.max(0, 6 - fd) * (fd < 1 ? 0.2 : 0.7); if (!f.isBot) s += df.hunt * Math.max(0, 8 - fd) * 0.25; }
    if (k === me) s -= 1.5; if (s > bs) { bs = s; best = k; } }
  if (best >= 0 && best !== me) ai.path = pathTo(R, best);
}
function botUpdate(p, dt) {
  const ai = p.ai, df = DIFF[p.dn]; ai.think -= dt; ai.wait -= dt;
  const x = Math.round(p.px), y = Math.round(p.py), centered = Math.abs(p.px - x) + Math.abs(p.py - y) < 0.02;
  if (ai.path.length && key(x, y) === ai.path[0] && centered) ai.path.shift();
  if (ai.think <= 0 && (centered || !ai.path.length)) { ai.think = df.react + Math.random() * 0.12; botThink(p); }
  if (!ai.path.length) return 0;
  const nk = ai.path[0], nx = nk % COLS, ny = (nk / COLS) | 0;
  if (G.flames.has(nk) || blocked(nx, ny)) { ai.path = []; ai.think = 0; return 0; }
  const dx = nx - p.px, dy = ny - p.py; let ix = 0, iy = 0; if (Math.abs(dx) > Math.abs(dy)) ix = Math.sign(dx); else iy = Math.sign(dy);
  return movePlayer(p, ix, iy, dt, Math.abs(dx) + Math.abs(dy));
}

// ---------- sudden death ----------
function spiral() { const o = []; let x0 = 0, y0 = 0, x1 = COLS - 1, y1 = ROWS - 1; while (x0 <= x1 && y0 <= y1 && o.length < COLS * ROWS) { for (let x = x0; x <= x1; x++) o.push([x, y0]); for (let y = y0 + 1; y <= y1; y++) o.push([x1, y]); if (y1 > y0) for (let x = x1 - 1; x >= x0; x--) o.push([x, y1]); if (x1 > x0) for (let y = y1 - 1; y > y0; y--) o.push([x0, y]); x0++; y0++; x1--; y1--; } return o; }
function sdUpdate(dt) {
  if (!G.sd) { G.sd = { order: spiral().slice(0, COLS * ROWS - 15), idx: 0, t: 1.2, step: 0.42, marks: [], falling: [] }; G.drop = new Float32Array(COLS * ROWS); banner(T('ALAN DARALIYOR!', 'ARENA IS CLOSING!'), T('Kenarlardan uzak dur', 'Stay away from the edges'), 1.6); $('timer').classList.add('hot'); }
  const S = G.sd; S.t -= dt;
  if (S.t <= 0 && S.idx < S.order.length) {
    const c = S.order[S.idx++]; S.t += S.step; const k = key(c[0], c[1]);
    if (G.grid[c[1]][c[0]] !== 1) { G.grid[c[1]][c[0]] = 1; G.drop[k] = 7; S.falling.push(k); const u = G.pus.get(k); if (u) { dyn.remove(u.m); G.pus.delete(k); } const b = bombAt(c[0], c[1]); if (b) { G.bombs.splice(G.bombs.indexOf(b), 1); dyn.remove(b.m); if (b.owner) b.owner.active = Math.max(0, b.owner.active - 1); } G.dirty = true; }
  }
  for (let i = S.falling.length - 1; i >= 0; i--) { const k = S.falling[i]; G.drop[k] = Math.max(0, G.drop[k] - dt * 16); G.dirty = true; if (G.drop[k] <= 0) { S.falling.splice(i, 1); const cx = k % COLS, cy = (k / COLS) | 0; AUD.play('thud'); G.shake = Math.min(0.4, G.shake + 0.1); parts.emit(wx(cx), 0.1, wz(cy), [0xc5cfe6, 0x8f9cbd], 6, 2.5, 0.1, 2.5, 0.5); for (const p of G.players) if (p.alive && Math.round(p.px) === cx && Math.round(p.py) === cy) killPlayer(p); } }
  // players standing on a cell whose block is still in the air are safe until it lands; push nobody
}

// ---------- input ----------
const IN = { x: 0, y: 0, bomb: false, abil: false, keys: {} };
{
  const joy = $('joy'), knob = $('knob'), zone = $('touch'); let jid = null, ox = 0, oy = 0;
  const R = 46;
  zone.addEventListener('pointerdown', (e) => { if (jid !== null) return; jid = e.pointerId; ox = e.clientX; oy = e.clientY; joy.style.left = ox + 'px'; joy.style.top = oy + 'px'; joy.classList.add('on'); knob.style.transform = 'translate(-50%,-50%)'; zone.setPointerCapture(e.pointerId); e.preventDefault(); });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId !== jid) return; let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy); if (l > R) { ox += dx * (1 - R / l) * 0.5; oy += dy * (1 - R / l) * 0.5; joy.style.left = ox + 'px'; joy.style.top = oy + 'px'; dx = e.clientX - ox; dy = e.clientY - oy; const l2 = Math.hypot(dx, dy); if (l2 > R) { dx *= R / l2; dy *= R / l2; } }
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px))'; IN.x = Math.abs(dx) > 10 ? dx / R : 0; IN.y = Math.abs(dy) > 10 ? dy / R : 0; });
  const end = (e) => { if (e.pointerId !== jid) return; jid = null; IN.x = IN.y = 0; joy.classList.remove('on'); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  const btn = (el, f) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); el.classList.add('dn'); setTimeout(() => el.classList.remove('dn'), 120); f(); });
  btn($('bBomb'), () => (IN.bomb = true)); btn($('bAbil'), () => (IN.abil = true));
  addEventListener('keydown', (e) => { IN.keys[e.code] = true; if (e.code === 'Space') { IN.bomb = true; e.preventDefault(); } if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyE') IN.abil = true; if (e.code === 'Escape' && (G.state === 'play')) setPause($('pause').hidden); if (e.code.startsWith('Arrow')) e.preventDefault(); });
  addEventListener('keyup', (e) => { IN.keys[e.code] = false; });
}
function readDir() {
  const K = IN.keys; let x = IN.x, y = IN.y;
  if (K.ArrowLeft || K.KeyA) x = -1; if (K.ArrowRight || K.KeyD) x = 1; if (K.ArrowUp || K.KeyW) y = -1; if (K.ArrowDown || K.KeyS) y = 1;
  if (!x && !y) return null; const ax = Math.abs(x), ay = Math.abs(y);
  const prim = ax > ay ? [Math.sign(x), 0] : [0, Math.sign(y)], sec = ax > ay ? (ay > 0.35 ? [0, Math.sign(y)] : null) : (ax > 0.35 ? [Math.sign(x), 0] : null);
  return [prim, sec];
}

// ---------- update ----------
let lastTick = -1;
function finish(win, msg) { if (G.state !== 'play') return; G.state = 'done'; G.resT = 0; G.resWin = win; G.resMsg = msg; AUD.play(win ? 'win' : 'lose'); banner(win ? (G.mode === 'macera' ? T('BÖLÜM GEÇİLDİ!', 'LEVEL CLEARED!') : T('ÇÖZDÜN!', 'SOLVED!')) : msg, '', 1.3); }
function update(dt) {
  G.t += dt; const mode = G.mode, me0 = G.players[0];
  if (G.state === 'intro') { G.introT += dt; if (G.introT > 1.7) { G.state = 'play'; AUD.play('go'); banner(T('BAŞLA!', 'GO!'), '', 0.7); } }
  const playing = G.state === 'play';
  if (playing) {
    if (mode !== 'bulmaca') {
      G.time -= dt; if (G.time <= 0) { if (mode === 'macera') { if (me0.alive) { me0.vest = false; killPlayer(me0, true); finish(false, T('SÜRE DOLDU', 'TIME IS UP')); } } else sdUpdate(dt); }
      const sec = Math.ceil(Math.max(0, G.time)); if (sec !== lastTick) { lastTick = sec; $('timer').textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); if (sec <= 10 && sec > 0) { AUD.play('tick'); $('timer').classList.add('hot'); } }
    }
    if (mode === 'macera') monUpdate(dt);
  }
  if (mode === 'online') NET.tick(dt);
  for (const p of G.players) {
    if (!p.alive) { if (p.deadT > 0 && p.deadT < 1) { p.deadT += dt * 1.6; const t = Math.min(1, p.deadT); p.P.g.position.y = Math.sin(t * Math.PI) * 1.6; p.P.g.rotation.y += dt * 18; p.g.scale.setScalar(Math.max(0.001, 1 - t * t)); if (t >= 1) p.g.visible = false; } continue; }
    let mv = 0; p.cd = Math.max(0, p.cd - dt); p.at = Math.max(0, p.at - dt);
    if (p.shieldT > 0) p.shieldT -= dt; if (p.frozenT > 0) p.frozenT -= dt;
    if (p.curse) { p.curse.t -= dt; if (p.curse.t <= 0) { p.curse = null; if (p === me0 && !p.isBot) toast(T('Lanet geçti', 'Curse is gone')); } }
    if (playing && p.remote) mv = p.netMv || 0;
    else if (playing) {
      const sp0 = p.speed; if (p.curse && p.curse.type === 'slow') p.speed = sp0 * 0.55;
      if (p.dash) { const d = p.dash; d.t += dt / d.d; const t = Math.min(1, d.t); p.px = d.sx + (d.tx - d.sx) * t; p.py = d.sy + (d.ty - d.sy) * t; mv = 1; if (Math.random() < 0.6) parts.emit(wx(p.px), 0.4, wz(p.py), [0xffffff, 0x8fd0ff], 1, 0.6, 0.1, 1, 0.35); if (t >= 1) { p.px = d.tx; p.py = d.ty; p.dash = null; } }
      else if (p.frozenT <= 0) {
        if (p.isBot) mv = botUpdate(p, dt);
        else { const d = readDir(); if (d) { if (p.curse && p.curse.type === 'reverse') for (const q of d) if (q) { q[0] = -q[0]; q[1] = -q[1]; } if (axisMove(p, d[0][0], d[0][1], 0.02, true) || !d[1]) mv = movePlayer(p, d[0][0], d[0][1], dt); else mv = movePlayer(p, d[1][0], d[1][1], dt); }
          if (IN.bomb) { if (!placeBomb(p) && mode === 'bulmaca' && G.bLeft <= 0) toast(T('Bomban kalmadı', 'No bombs left')); } if (IN.abil) { if (mode === 'bulmaca') toast(T('Bulmacada özel güç yok', 'No special power in puzzles')); else if (!useAbility(p) && p.cd <= 0) $('bAbil').classList.add('no'), setTimeout(() => $('bAbil').classList.remove('no'), 200); } }
        if (p.curse && p.curse.type === 'drop') placeBomb(p);
      }
      p.speed = sp0;
      // pickups
      const k = key(Math.round(p.px), Math.round(p.py)), u = G.pus.get(k);
      if (u) { dyn.remove(u.m); G.pus.delete(k); applyPu(p, u.type); p.picked.push(k); if (p === me0 && !p.isBot) { AUD.play(u.type === 'skull' ? 'lose' : 'pick'); toast(T(...(u.type === 'skull' ? CURSE_TXT[p.curse.type] : PU_TXT[u.type]))); } parts.emit(wx(p.px), 0.6, wz(p.py), u.type === 'skull' ? [0x9b3bff, 0x15121c] : [0xffd41f, 0xffffff], 8, 2, 0.09, 4, 0.6); }
      if (G.flames.has(k) && p.shieldT <= 0 && !p.dash) killPlayer(p);
      if (G.door && G.door.open && Math.round(p.px) === G.door.x && Math.round(p.py) === G.door.y && p.alive) finish(true);
    }
    p.mv += ((mv > 0.0005 ? 1 : 0) - p.mv) * Math.min(1, dt * 14);
    const ty = Math.atan2(p.fx, p.fy); let dy = ty - p.yaw; while (dy > Math.PI) dy -= TAU; while (dy < -Math.PI) dy += TAU; p.yaw += dy * Math.min(1, dt * 16);
    p.g.position.set(wx(p.px), 0, wz(p.py)); p.P.g.rotation.y = p.yaw;
    animChar(p.P, dt, { t: G.t + p.i * 1.3, move: p.frozenT > 0 ? 0 : p.mv, win: (G.state === 'roundEnd' && G.endT > 0.5) || (G.state === 'done' && G.resWin) });
    p.shield.visible = p.shieldT > 0 || p.vest; if (p.shield.visible) p.shield.scale.setScalar((p.shieldT > 0 ? 1 : 0.8) + Math.sin(G.t * 10) * 0.04 - (p.shieldT > 0 && p.shieldT < 0.6 ? Math.sin(G.t * 40) * 0.08 : 0));
    p.ice.visible = p.frozenT > 0; p.skull.visible = !!p.curse; if (p.skull.visible) p.skull.position.y = 1.45 + Math.sin(G.t * 8) * 0.06; if (p.mark) p.mark.scale.setScalar(1 + Math.sin(G.t * 5) * 0.06);
  }
  IN.bomb = IN.abil = false;
  const live = playing || G.state === 'roundEnd' || G.state === 'done';
  if (live) {
    for (let i = G.bombs.length - 1; i >= 0; i--) { const b = G.bombs[i]; if (!b) continue; b.t += dt; if (G.state !== 'roundEnd') b.fuse -= dt;
      if (b.vx || b.vy) { const sp = 8.5 * dt, cx = Math.round(b.x), cy = Math.round(b.y); let nx = b.x + b.vx * sp, ny = b.y + b.vy * sp;
        const passX = b.vx && (b.vx > 0 ? nx >= cx && b.x <= cx : nx <= cx && b.x >= cx), passY = b.vy && (b.vy > 0 ? ny >= cy && b.y <= cy : ny <= cy && b.y >= cy);
        if (passX || passY || (b.x === cx && b.y === cy)) { const tx = cx + b.vx, ty = cy + b.vy; let stop = solid(tx, ty) || playerAt(tx, ty); for (const o of G.bombs) if (o !== b && Math.round(o.x) === tx && Math.round(o.y) === ty) stop = true; if (stop) { nx = cx; ny = cy; b.vx = b.vy = 0; } }
        b.x = nx; b.y = ny; b.m.userData.b.rotation.x += b.vy * dt * 14; b.m.userData.b.rotation.z -= b.vx * dt * 14;
        if (G.flames.has(key(Math.round(b.x), Math.round(b.y)))) { b.fuse = 0; b.chain = true; } } else { b.m.userData.b.rotation.set(0, 0, 0); }
      b.m.position.set(wx(b.x), 0, wz(b.y));
      const u = b.m.userData, fz = b.dormant ? FUSE : Math.max(0, b.fuse), pulse = b.dormant ? Math.sin(b.t * 2) * 0.4 : Math.sin(b.t * (6 + (FUSE - fz) * 5)), s = 1 + pulse * 0.07, a = Math.min(1, b.t * 7); b.m.scale.set(s * a, (2 - s) * a, s * a); u.glow.material.opacity = fz < 1 ? 0.25 + pulse * 0.25 : 0;
      if (b.fuse <= 0 && (!b.owner || !b.owner.remote || b.chain || b.fuse < -0.7)) explode(b); }
    for (const [k, t] of G.flames) { const n = t - dt; if (n <= 0) G.flames.delete(k); else G.flames.set(k, n); }
    for (let i = G.pending.length - 1; i >= 0; i--) { const q = G.pending[i]; q.t -= dt; if (q.t <= 0) { G.pending.splice(i, 1); if (G.grid[q.y][q.x] === 0) { const m = makePowerup(q.type); m.position.set(wx(q.x), 0, wz(q.y)); dyn.add(m); G.pus.set(key(q.x, q.y), { type: q.type, m, t: 0 }); } } }
  }
  for (const [, u] of G.pus) { u.t += dt; const s = u.m.userData.s; s.position.y = 0.5 + Math.sin(u.t * 3) * 0.07; s.rotation.y = Math.sin(u.t * 1.6) * 0.5; u.m.scale.setScalar(Math.min(1, u.t * 6)); }
  if (G.door && G.door.open) G.door.m.rotation.y += dt * 2;
  if (G.dirty) { blocks.sync(G.grid, G.drop); G.dirty = false; }
  if (playing) {
    if (mode === 'arena' || (mode === 'online' && NET.isHost())) { const alive = G.players.filter((p) => p.alive); if (alive.length <= 1) { G.state = 'roundEnd'; G.endT = 0; G.winner = alive[0] || null; G.netEnd = false; } }
    else if (mode === 'macera') { if (!me0.alive) finish(false, T('YAKALANDIN', 'CAUGHT!')); }
    else if (mode === 'bulmaca') { const idle = G.flames.size === 0 && !G.bombs.some((b) => !b.dormant); if (!me0.alive) finish(false, T('PATLADIN', 'YOU BLEW UP')); else if (targetsLeft() === 0) { if (idle) finish(true); } else if (G.bLeft <= 0 && idle) finish(false, T('BOMBALAR BİTTİ', 'OUT OF BOMBS')); }
  }
  if (G.state === 'done') { const was = G.resT; G.resT += dt; if (was < 1.4 && G.resT >= 1.4) showResult(); }
  if (G.state === 'roundEnd') { const was = G.endT; G.endT += dt; if (G.winner && !G.winner.alive) G.winner = null;
    if (was < 1 && G.endT >= 1 && !G.netEnd) { if (G.winner && !G.winner.remote && G.flames.has(key(Math.round(G.winner.px), Math.round(G.winner.py)))) { killPlayer(G.winner); G.winner = null; } const w = G.winner; if (w) w.wins++; roundBanner(w); if (mode === 'online') NET.hostEnd(w); updHud(); }
    if (G.endT > 3.4 && (mode !== 'online' || NET.isHost())) { const top = G.players.find((p) => p.wins >= WINS); if (top) { if (mode === 'online') NET.hostOver(); endMatch(top); } else { G.round++; if (mode === 'online') NET.hostNext(); startRound(); } } }
  // HUD ability button + stats
  const me = me0; if (me) { const f = me.cd > 0 ? me.cd / me.ch.cd : 0; if (f !== G.cdShown) { G.cdShown = f; $('bAbil').style.setProperty('--cd', (f * 360).toFixed(0) + 'deg'); $('bAbil').classList.toggle('rdy', f === 0 && me.alive && mode !== 'bulmaca'); }
    const st = me.maxBombs + '|' + me.range + '|' + me.speed + '|' + me.kick + me.pierce + me.vest + '|' + G.bLeft + mode; if (st !== G.stShown) { G.stShown = st; $('myStats').innerHTML = '<b class="s1">' + (mode === 'bulmaca' ? G.bLeft : me.maxBombs) + '</b><b class="s2">' + me.range + '</b>' + (mode === 'bulmaca' ? '' : '<b class="s3">' + Math.round((me.speed - 3) / 0.4 + 1) + '</b>') + (me.kick || me.pierce || me.vest ? '<b class="sx">' + (me.kick ? '👟' : '') + (me.pierce ? '✴' : '') + (me.vest ? '🛡' : '') + '</b>' : ''); } }
}
function roundBanner(w) { const mine = w && w === G.players[0] && !w.isBot; if (w) { w.fx = 0; w.fy = 1; AUD.play(mine ? 'win' : 'lose'); banner(mine ? T('RAUNT SENİN!', 'ROUND IS YOURS!') : escH(w.nm) + T(' kazandı', ' wins'), T('Raunt ', 'Round ') + G.round, 2); } else { banner(T('BERABERE', 'DRAW'), T('Kimse ayakta kalmadı', 'Nobody is left standing'), 2); AUD.play('lose'); } }


// ---------- camera ----------
let PRMAX = 2, slowT = 0, fpsN = 0, fpsT = 0;
const CAMV = { tgt: V3(0, 0, 0), dist: 20 };
const EL = 0.93; // elevation (rad)
function fitCamera() {
  const w = innerWidth, h = innerHeight; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PRMAX)); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 34 : 30; cam.updateProjectionMatrix();
  const portrait = h > w * 1.15, top = 96, bot = portrait ? Math.min(210, h * 0.24) : 20, side = 4;
  const pts = []; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { pts.push(V3(sx * (COLS / 2 + 0.42), 0, sz * (ROWS / 2 + 0.42))); pts.push(V3(sx * (COLS / 2 + 0.42), sz < 0 ? 1.5 : 0.4, sz * (ROWS / 2 + 0.42))); }
  const v = V3(); let lo = 6, hi = 80, tz = 0;
  const measure = (d, z) => { cam.position.set(0, Math.sin(EL) * d, z + Math.cos(EL) * d); cam.lookAt(0, 0, z); cam.updateMatrixWorld(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of pts) { v.copy(p).project(cam); const px = (v.x + 1) / 2 * w, py = (1 - v.y) / 2 * h; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } return { x0, x1, y0, y1 }; };
  for (let i = 0; i < 22; i++) { const d = (lo + hi) / 2; let za = -12, zb = 12; for (let j = 0; j < 16; j++) { const z = (za + zb) / 2, m = measure(d, z); if ((m.y0 + m.y1) / 2 > (top + h - bot) / 2) za = z; else zb = z; } tz = (za + zb) / 2; const m = measure(d, tz); if (m.x1 - m.x0 > w - side * 2 || m.y1 - m.y0 > h - top - bot) lo = d; else hi = d; }
  CAMV.dist = hi; { let za = -12, zb = 12; for (let j = 0; j < 18; j++) { const z = (za + zb) / 2, m = measure(hi, z); if ((m.y0 + m.y1) / 2 > (top + h - bot) / 2) za = z; else zb = z; } CAMV.tgt.set(0, 0, (za + zb) / 2); }
}
addEventListener('resize', fitCamera); fitCamera();
const camPos = V3(), camLook = V3();
function updateCamera(dt) {
  if (G.state === 'menu' || G.state === 'matchEnd') {
    const w = innerWidth, h = innerHeight, far = h > w ? 13 : 8.6;
    const ox = h > w ? 0 : 2.3; camPos.set(STAGE.x + ox + Math.sin(G.t * 0.25) * 0.5, 1.75, far); camLook.set(STAGE.x + ox, h > w ? 0.2 : 0.95, 0);
  } else {
    const d = CAMV.dist; camPos.set(CAMV.tgt.x, Math.sin(EL) * d, CAMV.tgt.z + Math.cos(EL) * d); camLook.copy(CAMV.tgt);
    if (G.state === 'intro') { const me = G.players[0], t = Math.min(1, G.introT / 1.5), e = t * t * (3 - 2 * t), a = V3(wx(me.px), 3.2, wz(me.py) + 4.2), b = V3(wx(me.px), 0.5, wz(me.py)); camPos.lerpVectors(a, camPos, e); camLook.lerpVectors(b, camLook, e); }
    if (G.shake > 0) { G.shake = Math.max(0, G.shake - dt * 1.4); camPos.x += (Math.random() - 0.5) * G.shake * 0.5; camPos.y += (Math.random() - 0.5) * G.shake * 0.5; }
  }
  cam.position.copy(camPos); cam.lookAt(camLook);
  const inMenu = G.state === 'menu' || G.state === 'matchEnd'; sun.target.position.set(inMenu ? STAGE.x : 0, 0, 0); sun.position.set((inMenu ? STAGE.x : 0) - 6, 14, 7);
  const sc = sun.shadow.camera, sz = inMenu ? 3 : 9; if (sc.top !== sz) { sc.left = -sz * 0.9; sc.right = sz * 0.9; sc.top = sz; sc.bottom = -sz; sc.updateProjectionMatrix(); }
}

// ---------- HUD / UI ----------
const PORT = {};
function makePortraits() {
  const rt = new THREE.Scene(); rt.background = null; rt.environment = scene.environment; rt.add(new THREE.HemisphereLight(0xffffff, 0x99aacc, 1.4)); const l = new THREE.DirectionalLight(0xffffff, 2.2); l.position.set(-2, 4, 5); rt.add(l);
  const c = new THREE.PerspectiveCamera(24, 1, 0.1, 20); renderer.setPixelRatio(1); renderer.setSize(176, 176, false); renderer.setClearColor(0x000000, 0);
  for (const ch of CHARS) { const P = makeChar(ch.id); rt.add(P.g); P.g.rotation.y = 0.35; c.position.set(0.3, 1.25, 5.6); c.lookAt(0, 0.98, 0); renderer.render(rt, c); PORT[ch.id] = canvas.toDataURL('image/png'); rt.remove(P.g); }
  renderer.setClearColor(0x000000, 1);
}
// ---------- online (artifact room: everyone with the page open; each player owns their own character and bombs) ----------
const NET = {
  base: null, room: null, code: '', seed: 1, h: null, gameN: null, sendT: 0, unsub: null, err: '',
  async open(code) {
    this.err = ''; try { if (!this.base) this.base = window.claude && window.claude.use ? await window.claude.use('room') : null; } catch (e) { this.base = null; }
    if (!this.base) { this.err = T('Online, oyunu claude.ai bağlantısından açınca çalışır.', 'Online works when the game is opened from its claude.ai link.'); return false; }
    await this.leave();
    try { this.room = await this.base.join('fb-' + code.toLowerCase().replace(/[^a-z0-9]/g, '')); } catch (e) { this.err = T('Odaya bağlanılamadı. Tekrar dene.', 'Could not join the room. Try again.'); this.room = null; return false; }
    this.code = code; this.h = null; this.gameN = null; this.j = Date.now() + Math.random();
    this.unsub = this.room.onPeers(() => { if (!$('lobby').hidden) renderLobby(); }, () => {});
    this.room.presence({ c: SV.char, j: this.j, h: null, s: null, b: null, pf: this.pf() }).catch(() => {}); return true;
  },
  pf() { return { n: SV.name, lv: myLv(), a: [SV.av.f, SV.av.bg, SV.av.fr, SV.av.st] }; },
  async leave() { if (this.unsub) { try { this.unsub(); } catch (e) {} this.unsub = null; } if (this.room) { try { await this.room.leave(); } catch (e) {} } this.room = null; this.h = null; },
  list() { if (!this.room) return []; return this.room.peers().filter((p) => p.presence && p.presence.c && p.kind !== 'agent').map((p) => ({ peer: p.peer, me: p.isMe && p.sameTab, c: p.presence.c, j: p.presence.j || 0, pr: p.presence, pf: cleanPf(p.presence.pf) })).sort((a, b) => a.j - b.j || (a.peer < b.peer ? -1 : 1)); },
  host() { return this.list()[0] || null; },
  isHost() { const h = this.host(); return !!h && h.me; },
  roster() { const L = this.list(), ord = (this.h && this.h.ord) || []; return ord.map((id) => L.find((p) => p.peer === id)).filter(Boolean); },
  push(extra) { if (this.room) this.room.presence(extra).catch(() => {}); },
  hostStart() { const L = this.list().slice(0, 4); if (L.length < 2 || !this.isHost()) return; this.h = { n: Math.floor(Math.random() * 1e9), seed: Math.floor(Math.random() * 2e9) + 1, rd: 1, ph: 'play', win: null, w: {}, ord: L.map((p) => p.peer) }; this.push({ h: this.h }); },
  hostEnd(w) { if (!this.h) return; const wm = {}; for (const p of G.players) wm[p.peer] = p.wins; this.h = Object.assign({}, this.h, { ph: 'end', win: w ? w.peer : null, w: wm, rd: G.round }); this.push({ h: this.h }); },
  hostNext() { if (!this.h) return; this.h = Object.assign({}, this.h, { ph: 'play', rd: G.round, win: null }); this.push({ h: this.h }); },
  hostOver() { if (!this.h) return; this.h = Object.assign({}, this.h, { ph: 'over' }); this.push({ h: this.h }); },
  // lobby poll: start the match when the host says so
  poll() {
    if (!this.room) return; const ho = this.host(); if (!ho) return; const h = ho.me ? this.h : ho.pr.h; if (!h) return;
    if (!ho.me) this.h = h;
    if (h.ph === 'play' && h.n !== this.gameN && h.rd === 1 && h.ord.some((id) => this.list().some((p) => p.peer === id && p.me))) { this.gameN = h.n; this.seed = h.seed; for (const id of ['lobby', 'modes']) $(id).hidden = true; mmStop(); startGame('online'); }
  },
  tick(dt) {
    if (!this.room) return; const me = G.players[0], L = this.list(), ho = L[0];
    // send my state ~12 times a second
    this.sendT -= dt; if (this.sendT <= 0) { this.sendT = 0.08;
      this.push({ pf: this.pf(), c: SV.char, j: this.j, h: this.isHost() ? this.h : null, rd: G.round, s: [+me.px.toFixed(2), +me.py.toFixed(2), me.fx, me.fy, me.alive ? 1 : 0, me.shieldT > 0 ? 1 : 0, me.frozenT > 0 ? 1 : 0, me.mv > 0.3 ? 1 : 0], b: G.bombs.filter((b) => b.owner === me).map((b) => [b.id, +b.x.toFixed(2), +b.y.toFixed(2), b.range, +b.fuse.toFixed(2), b.pierce ? 1 : 0]), ex: me.exploded, pk: me.picked.slice(-24), fz: me.fzN || 0 }); }
    // read the others
    for (const p of G.players) { if (!p.remote) continue; const r = L.find((q) => q.peer === p.peer);
      if (!r) { if (p.alive && G.state === 'play') killPlayer(p, true); continue; } const pr = r.pr; if (pr.rd !== G.round || !pr.s) continue; const s = pr.s;
      if (G.state === 'play' || G.state === 'intro') { const d = Math.hypot(s[0] - p.px, s[1] - p.py), k = d > 2.5 ? 1 : Math.min(1, dt * 16); p.px += (s[0] - p.px) * k; p.py += (s[1] - p.py) * k; if (s[2] || s[3]) { p.fx = s[2]; p.fy = s[3]; } p.netMv = s[7]; p.shieldT = s[5] ? 0.3 : 0; p.frozenT = s[6] ? 0.3 : 0; if (!s[4] && p.alive && G.state === 'play') killPlayer(p, true); }
      if (!p.done) p.done = new Set();
      for (const e of pr.b || []) { if (p.done.has(e[0])) continue; let b = G.bombs.find((q) => q.owner === p && q.id === e[0]); if (!b) { const m = makeBombModel(e[5] ? 0xc21a1a : 0x0b2f66); dyn.add(m); b = { id: e[0], x: e[1], y: e[2], fuse: e[4], range: e[3], owner: p, m, vx: 0, vy: 0, t: 0, pierce: !!e[5] }; G.bombs.push(b); p.active++; AUD.play('place'); } else if (Math.abs(b.x - e[1]) + Math.abs(b.y - e[2]) > 0.05) { b.x += (e[1] - b.x) * 0.5; b.y += (e[2] - b.y) * 0.5; } }
      for (const e of pr.ex || []) { if (p.done.has(e[0])) continue; p.done.add(e[0]); let b = G.bombs.find((q) => q.owner === p && q.id === e[0]); if (b) { b.x = e[1]; b.y = e[2]; explode(b); } }
      for (const k of pr.pk || []) { const u = G.pus.get(k); if (u) { dyn.remove(u.m); G.pus.delete(k); } }
      if (pr.fz !== undefined && pr.fz !== p.fzSeen) { if (p.fzSeen !== undefined && me.alive && me.shieldT <= 0 && Math.hypot(me.px - p.px, me.py - p.py) < 4.2) { me.frozenT = 2.5; AUD.play('freeze'); } p.fzSeen = pr.fz; }
    }
    // follow the host's round state
    if (ho && !ho.me && ho.pr.h) { const h = (this.h = ho.pr.h);
      if (h.rd > G.round && h.ph === 'play') { for (const p of G.players) p.wins = h.w[p.peer] || 0; G.round = h.rd; startRound(); }
      else if (h.rd === G.round && h.ph === 'end' && G.state === 'play') { for (const p of G.players) p.wins = h.w[p.peer] || 0; G.winner = G.players.find((p) => p.peer === h.win) || null; G.state = 'roundEnd'; G.endT = 1.01; G.netEnd = true; roundBanner(G.winner); updHud(); }
      else if (h.ph === 'over' && G.state !== 'matchEnd') { for (const p of G.players) p.wins = h.w[p.peer] || 0; const top = G.players.slice().sort((a, b) => b.wins - a.wins)[0]; endMatch(top); } }
  },
};
function renderLobby() {
  const L = NET.list(), host = NET.isHost(); $('lobCode').textContent = NET.code.toUpperCase();
  $('lobList').innerHTML = L.slice(0, 4).map((p, i) => '<div class="erow' + (p.me ? ' me' : '') + '">' + avHTML(p.pf.av, 36) + '<span>' + escH(p.pf.n) + (p.me ? T(' (sen)', ' (you)') : '') + (i === 0 ? T(' · oda sahibi', ' · host') : '') + ' <small>' + T('Sv ', 'Lv ') + p.pf.lv + '</small></span></div>').join('') || '<p>' + T('Bağlanıyor…', 'Connecting…') + '</p>';
  $('lobStart').hidden = !host; $('lobStart').disabled = L.length < 2; $('lobStart').textContent = L.length < 2 ? T('OYUNCU BEKLENİYOR', 'WAITING FOR PLAYERS') : T('BAŞLAT (', 'START (') + Math.min(4, L.length) + T(' oyuncu)', ' players)');
  $('lobWait').hidden = host;
}

function buildHud() {
  const m = G.mode;
  if (m === 'arena' || m === 'online') $('chips').innerHTML = G.players.slice().sort((a, b) => a.i - b.i).map((p) => '<div class="chip' + (p.isBot || p.remote ? '' : ' me') + '" id="chip' + p.i + '" style="--c:' + p.ch.col + '"><img alt="" src="' + PORT[p.ch.id] + '"><div><span>' + pname(p) + '</span><i></i></div></div>').join('');
  else $('chips').innerHTML = '<div class="chip me wide" style="--c:' + G.players[0].ch.col + '"><img alt="" src="' + PORT[G.players[0].ch.id] + '"><div><span id="infoA"></span><em id="infoB"></em></div></div>';
  const me = G.players[0]; $('bAbil').querySelector('span').textContent = me.ch.icon; $('bAbil').querySelector('small').textContent = cx(me.ch, 'abil'); $('bAbil').style.visibility = m === 'bulmaca' ? 'hidden' : 'visible'; G.cdShown = -1; G.stShown = '';
  $('timer').hidden = m === 'bulmaca'; $('restart').hidden = m === 'arena' || m === 'online';
}
function updHud() {
  const m = G.mode;
  if (m === 'macera') { if ($('infoA')) { $('infoA').textContent = T('Macera · Bölüm ', 'Adventure · Level ') + G.opt.level; const n = G.mons.filter((q) => q.alive).length; $('infoB').textContent = n ? '👾 ' + n + T(' canavar kaldı: patlat', n === 1 ? ' monster left: blast it' : ' monsters left: blast them') : G.door ? T('🚪 Kapı açık, koş!', '🚪 Door is open, run!') : T('🚪 Kapıyı bul: tuğlaların altında', '🚪 Find the door: under a brick'); } return; }
  if (m === 'bulmaca') { if ($('infoA')) { $('infoA').textContent = T('Bulmaca ', 'Puzzle ') + G.opt.level + ' / ' + PUZ.length; $('infoB').textContent = '⭐ ' + targetsLeft() + T(' altın kasa · 💣 ', ' gold crates · 💣 ') + G.bLeft + T(' bomba', ' bombs'); } return; }
  for (const p of G.players) { const el = $('chip' + p.i); if (!el) continue; el.classList.toggle('dead', !p.alive); el.querySelector('i').innerHTML = Array.from({ length: WINS }, (_, k) => '<u class="' + (k < p.wins ? 'on' : '') + '"></u>').join(''); }
}
let banT = null;
function banner(a, b, sec) { const el = $('banner'); el.innerHTML = '<b>' + a + '</b>' + (b ? '<span>' + b + '</span>' : ''); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); clearTimeout(banT); banT = setTimeout(() => el.classList.remove('show'), sec * 1000); }
let toT = null;
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toT); toT = setTimeout(() => el.classList.remove('show'), 1500); }
const liveMatch = () => G.mode === 'online' || G.mode === 'arena';
function setPause(v) { if (G.state !== 'play' && v) return; G.paused = v && !liveMatch(); $('pause').hidden = !v; }
function show(id) { for (const s of ['home', 'hud', 'end']) $(s).hidden = s !== id; }
const sheet = (id, v) => { $(id).hidden = !v; };
let lastRw = 0;
function payout(rw, where) {
  const line = $(where + 'R'), btn = $(where + 'Ad'); lastRw = 0; if (!rw) { line.hidden = btn.hidden = true; return; }
  const r = grant(rw[0], rw[1]); lastRw = rw[0];
  line.hidden = false; line.innerHTML = '+' + rw[0] + ' 🪶 · +' + rw[1] + ' XP' + (r.up ? '<br><b>' + T('SEVİYE ', 'LEVEL ') + r.up + '!</b> +' + r.bonus + ' 🪶' : '');
  btn.hidden = false; btn.disabled = false; btn.textContent = T('🎬 Reklam izle, tüyü 2 katla', '🎬 Watch an ad, double the feathers');
}
async function doubleAd(e) { const b = e.currentTarget; if (!lastRw || b.disabled) return; b.disabled = true; if (await adRewarded()) { SV.tuy += lastRw; save(); toast('+' + lastRw + ' 🪶'); AUD.play('pick'); lastRw = 0; b.hidden = true; } else { b.disabled = false; toast(T('Reklam şu an hazır değil', 'No ad ready right now')); } }
function showResult() {
  const m = G.mode, L = G.opt.level, win = G.resWin, max = m === 'macera' ? MAC_LEVELS : PUZ.length, kk = m === 'macera' ? 'mac' : 'bul';
  let rw = null; if (win) { const first = (SV[kk] || 0) < L; if (first) SV[kk] = L; rw = m === 'macera' ? (first ? [40 + L * 3, 30] : [10, 8]) : first ? [50, 30] : [5, 5]; }
  payout(rw, 'res'); adScreen('over');
  $('resT').textContent = win ? (L >= max ? T('HEPSİ TAMAM!', 'ALL DONE!') : (m === 'macera' ? T('Bölüm ', 'Level ') : T('Bulmaca ', 'Puzzle ')) + L + T(' tamam', ' cleared')) : G.resMsg;
  $('resS').textContent = win ? (L >= max ? T('Bütün bölümleri bitirdin.', 'You finished every level.') : T('Sıradaki seni bekliyor.', 'The next one is waiting.')) : m === 'bulmaca' ? T('İpucu: mor uyuyan bombalar patlama değince zincirleme patlar. Bomban sınırlı.', 'Hint: sleeping purple bombs go off when a blast touches them. Your bombs are limited.') : T('Canavarlara dokunma, kendi bombandan kaç ve süreye dikkat et.', 'Do not touch monsters, run from your own bombs and watch the clock.');
  $('resGo').hidden = !win || L >= max; $('resRetry').textContent = win ? T('Tekrar oyna', 'Play again') : T('TEKRAR DENE', 'TRY AGAIN'); $('resRetry').className = win ? 'ghost' : 'big'; sheet('res', true);
}
function endMatch(top) {
  G.state = 'matchEnd'; clearRound(); const me = G.players[0], won = top === me; SV.games++; if (won) SV.wins++;
  payout(won ? [80, 60] : [20 + me.wins * 10, 20 + me.wins * 10], 'end'); adScreen('over');
  $('endTitle').textContent = won ? T('ŞAMPİYON SENSİN!', 'YOU ARE THE CHAMPION!') : top.nm + T(' kazandı', ' wins'); $('endSub').textContent = won ? T('Toplam galibiyet: ', 'Total wins: ') + SV.wins : T('Bu sefer olmadı. Rövanş?', 'Not this time. Rematch?');
  $('endRows').innerHTML = G.players.slice().sort((a, b) => b.wins - a.wins).map((p) => '<div class="erow' + (p === me ? ' me' : '') + '">' + avHTML(p.av, 36) + '<span>' + escH(p.nm) + (p === me ? T(' (sen)', ' (you)') : '') + ' <small>' + T('Sv ', 'Lv ') + p.lv + '</small></span><b>' + p.wins + '</b></div>').join('');
  $('again').textContent = G.mode === 'online' ? T('ODAYA DÖN', 'BACK TO ROOM') : T('YENİ MAÇ', 'NEW MATCH');
  showStageChar(top.ch.id); G.stageWin = true; show('end'); AUD.music('menu'); AUD.play(won ? 'win' : 'lose');
}
function toMenu() { G.state = 'menu'; G.stageWin = false; clearRound(); clearPlayers(); for (const id of ['res', 'pause']) $(id).hidden = true; G.paused = false; show('home'); renderHome(); AUD.music('menu'); adScreen('menu'); }
function goHome() { NET.leave(); mmStop(); for (const id of ['lobby', 'modes', 'levels']) $(id).hidden = true; toMenu(); }
function renderHome() {
  const vid = G.view && CHARS.some((c) => c.id === G.view) ? G.view : SV.char, ch = CHARS.find((c) => c.id === vid) || CHARS[0], owned = SV.own.includes(ch.id), li = lvInfo(SV.xp);
  $('roster').innerHTML = CHARS.map((c) => '<button class="rc' + (c.id === ch.id ? ' on' : '') + (SV.own.includes(c.id) ? '' : ' lock') + '" data-c="' + c.id + '" style="--c:' + c.col + '" aria-label="' + cx(c, 'name') + '"><img alt="" src="' + PORT[c.id] + '"></button>').join('');
  $('cName').textContent = cx(ch, 'name'); $('cTag').textContent = cx(ch, 'tag'); $('cAbil').innerHTML = '<b>' + ch.icon + ' ' + cx(ch, 'abil') + '</b>' + cx(ch, 'desc');
  const bar = (v, max) => '<i style="--v:' + Math.round(v / max * 100) + '%"></i>';
  $('cStats').innerHTML = '<div><span>' + T('Hız', 'Speed') + '</span>' + bar(ch.spd - 2.8, 1.6) + '</div><div><span>' + T('Bomba', 'Bombs') + '</span>' + bar(ch.bombs, 3) + '</div><div><span>' + T('Menzil', 'Range') + '</span>' + bar(ch.range, 4) + '</div>';
  $('play').textContent = owned ? T('OYNA', 'PLAY') : T('AL · ', 'GET · ') + fmtN(CH_PRICE[ch.id]) + ' 🪶'; $('play').classList.toggle('buy', !owned);
  $('pChip').innerHTML = avHTML(SV.av, 40) + '<div><b>' + escH(SV.name) + '</b><span>' + T('Seviye ', 'Level ') + li.l + '</span><i class="xb" style="--v:' + Math.round(li.cur / li.need * 100) + '%"></i></div>';
  $('tuyN').textContent = fmtN(SV.tuy); $('dayBtn').classList.toggle('dot', dailyState().can);
  $('mMac').textContent = (SV.mac || 0) >= MAC_LEVELS ? T('Hepsi tamam · ', 'All done · ') + MAC_LEVELS + T(' bölüm', ' levels') : T('Bölüm ', 'Level ') + ((SV.mac || 0) + 1) + ' / ' + MAC_LEVELS + T(' · canavarları patlat, kapıyı bul, çık', ' · blast monsters, find the door, exit');
  $('mBul').textContent = (SV.bul || 0) >= PUZ.length ? T('Hepsi tamam · ', 'All done · ') + PUZ.length + T(' bulmaca', ' puzzles') : T('Bulmaca ', 'Puzzle ') + ((SV.bul || 0) + 1) + ' / ' + PUZ.length + T(' · sınırlı bombayla çöz', ' · solve with limited bombs');
  $('sSound').textContent = SV.sound ? T('Açık', 'On') : T('Kapalı', 'Off'); $('sMusic').textContent = SV.music ? T('Açık', 'On') : T('Kapalı', 'Off'); $('sLang').textContent = SV.lang === 'en' ? 'English' : 'Türkçe';
  if (!stageCur || stageCur !== stageChars[ch.id]) showStageChar(ch.id);
}
function openLevels(m) {
  const max = m === 'macera' ? MAC_LEVELS : PUZ.length, done = SV[m === 'macera' ? 'mac' : 'bul'] || 0; $('lvTitle').textContent = m === 'macera' ? T('Macera', 'Adventure') : T('Bulmaca', 'Puzzle');
  $('lvGrid').innerHTML = Array.from({ length: max }, (_, i) => '<button data-l="' + (i + 1) + '" class="' + (i < done ? 'ok' : i === done ? 'cur' : 'lock') + '"' + (i > done ? ' disabled' : '') + '>' + (i > done ? '🔒' : i + 1) + '</button>').join('');
  $('lvGrid').dataset.m = m; sheet('modes', false); sheet('levels', true);
}
// profile + avatar customisation
let PV = null, pTab = 'f';
const pOwned = (tab, v) => tab === 'f' || (tab === 'bg' ? SV.bgs : tab === 'fr' ? SV.frs : SV.sts).includes(v);
const pPrice = (tab, v) => (tab === 'bg' ? bgPrice(v) : tab === 'fr' ? FRS[v].p : tab === 'st' ? STS[v][1] : 0);
function renderProf() {
  const li = lvInfo(SV.xp), av = PV ? PV.av : SV.av;
  $('pfAv').innerHTML = avHTML(av, 96); if (document.activeElement !== $('pfName')) $('pfName').value = SV.name;
  $('pfLv').innerHTML = '<b>' + T('Seviye ', 'Level ') + li.l + '</b><i class="xb" style="--v:' + Math.round(li.cur / li.need * 100) + '%"></i><span>' + li.cur + ' / ' + li.need + ' XP</span>';
  $('pfStats').innerHTML = [[SV.games, T('Maç', 'Matches')], [SV.wins, T('Galibiyet', 'Wins')], [SV.games ? Math.round(SV.wins / SV.games * 100) + '%' : '-', T('Kazanma', 'Win rate')], [(SV.mac || 0) + '/' + MAC_LEVELS, T('Macera', 'Adventure')], [(SV.bul || 0) + '/' + PUZ.length, T('Bulmaca', 'Puzzle')]].map((s) => '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
  $('pfTabs').innerHTML = [['f', T('Yüz', 'Face')], ['bg', T('Zemin', 'Backdrop')], ['fr', T('Çerçeve', 'Frame')], ['st', T('Rozet', 'Badge')]].map((t) => '<button class="' + (t[0] === pTab ? 'on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>').join('');
  const n = pTab === 'f' ? CHARS.length : pTab === 'bg' ? BGS.length : pTab === 'fr' ? FRS.length : STS.length; let h = '';
  for (let i = 0; i < n; i++) { const v = pTab === 'f' ? CHARS[i].id : i, own = pOwned(pTab, v), on = av[pTab] === v;
    const inner = pTab === 'f' ? avHTML({ f: v, bg: av.bg }, 46) : pTab === 'bg' ? '<span class="sw" style="background:' + BGS[i] + '"></span>' : pTab === 'fr' ? avHTML({ f: av.f, bg: av.bg, fr: i }, 44) : '<span class="stk">' + (STS[i][0] || '∅') + '</span>';
    h += '<button class="it' + (on ? ' on' : '') + (own ? '' : ' lock') + '" data-v="' + v + '">' + inner + (own ? '' : '<small>' + pPrice(pTab, v) + ' 🪶</small>') + '</button>'; }
  $('pfGrid').innerHTML = h; $('pfBuy').hidden = !PV; if (PV) $('pfBuy').textContent = T('AL · ', 'GET · ') + fmtN(PV.price) + ' 🪶';
  $('pfTuy').textContent = '🪶 ' + fmtN(SV.tuy);
}
$('pfTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; pTab = b.dataset.t; PV = null; AUD.play('ui'); renderProf(); });
$('pfGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; const v = pTab === 'f' ? b.dataset.v : +b.dataset.v; AUD.play('ui');
  if (pOwned(pTab, v)) { SV.av[pTab] = v; PV = null; save(); renderHome(); } else PV = { tab: pTab, v, price: pPrice(pTab, v), av: Object.assign({}, SV.av, { [pTab]: v }) }; renderProf(); });
$('pfBuy').addEventListener('click', () => { if (!PV) return; if (SV.tuy < PV.price) { toast(T('Tüy yetmiyor', 'Not enough feathers')); return; } SV.tuy -= PV.price; (PV.tab === 'bg' ? SV.bgs : PV.tab === 'fr' ? SV.frs : SV.sts).push(PV.v); SV.av[PV.tab] = PV.v; PV = null; save(); AUD.play('pick'); toast(T('Alındı ve takıldı!', 'Bought and equipped!')); renderProf(); renderHome(); });
$('pfName').addEventListener('change', () => { const n = $('pfName').value.replace(/[<>&"']/g, '').trim().slice(0, 14); if (n) SV.name = n; $('pfName').value = SV.name; save(); renderHome(); });
$('pChip').addEventListener('click', () => { AUD.play('ui'); PV = null; renderProf(); sheet('prof', true); });
// shop + daily reward
$('tuyBtn').addEventListener('click', () => { AUD.play('ui'); renderShop(); sheet('shop', true); });
$('shopRows').addEventListener('click', async (e) => { const b = e.target.closest('[data-s]'); if (!b || b.disabled) return; const s = b.dataset.s; AUD.play('ui');
  if (s === 'ad') { if (freeAdLeft() <= 0) return; b.disabled = true; if (await adRewarded()) { SV.adN++; SV.tuy += FREE_AD; save(); toast('+' + FREE_AD + ' 🪶'); AUD.play('pick'); renderHome(); } else toast(T('Reklam şu an hazır değil', 'No ad ready right now')); renderShop(); }
  else if (s === 'noads') buyIap(NOADS); else if (s === 'rest') { try { await window.FlixNative.restore(); toast(T('Satın alımlar kontrol edildi', 'Purchases checked')); } catch (er) { toast(T('Geri yükleme olmadı', 'Restore failed')); } } else buyIap(PACKS[+s]); });
$('dayBtn').addEventListener('click', () => { AUD.play('ui'); dayGot = 0; renderDaily(); sheet('daily', true); });
$('dayGo').addEventListener('click', () => { const s = dailyState(); if (!s.can) return; dayGot = DAILY[s.idx]; SV.day = { last: dayKey(), n: s.idx + 1 }; grant(dayGot, 0); AUD.play('win'); toast('+' + dayGot + ' 🪶'); renderDaily(); renderHome(); });
$('dayAd').addEventListener('click', async () => { if (!dayGot) return; $('dayAd').disabled = true; if (await adRewarded()) { SV.tuy += dayGot; save(); toast('+' + dayGot + ' 🪶'); AUD.play('pick'); dayGot = 0; renderHome(); } else toast(T('Reklam şu an hazır değil', 'No ad ready right now')); $('dayAd').disabled = false; renderDaily(); });
$('resAd').addEventListener('click', doubleAd); $('endAd').addEventListener('click', doubleAd);
$('goalGo').addEventListener('click', () => { AUD.play('ui'); sheet('goal', false); const f = tipGo; tipGo = null; if (f) f(); });

$('roster').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; G.view = b.dataset.c; if (SV.own.includes(G.view)) { SV.char = G.view; save(); } AUD.play('ui'); renderHome(); });
$('play').addEventListener('click', () => { AUD.init(); AUD.play('ui'); const id = G.view || SV.char;
  if (!SV.own.includes(id)) { const pr = CH_PRICE[id]; if (SV.tuy < pr) { toast(T('Tüy yetmiyor. Maç kazan, günlük ödülü al.', 'Not enough feathers. Win matches, claim the daily reward.')); return; } SV.tuy -= pr; SV.own.push(id); SV.char = id; save(); AUD.play('win'); toast(T('Yeni karakter açıldı!', 'New character unlocked!')); renderHome(); return; }
  renderHome(); sheet('modes', true); });
$('modes').addEventListener('click', (e) => { const b = e.target.closest('[data-m]'); if (!b) return; AUD.play('ui'); const m = b.dataset.m;
  if (m === 'arena') { sheet('modes', false); tip('arena', () => mmStart('arena')); } else if (m === 'online') { sheet('modes', false); $('lobJoin').hidden = false; $('lobRoom').hidden = true; $('lobErr').textContent = ''; sheet('lobby', true); } else openLevels(m); });
$('lvGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (!b || b.disabled) return; AUD.play('ui'); sheet('levels', false); const m = $('lvGrid').dataset.m, level = +b.dataset.l; tip(m, () => startGame(m, { level })); });
$('resGo').addEventListener('click', async () => { AUD.play('ui'); await maybeInter(); G.opt.level++; startRound(); buildHud(); updHud(); });
$('resRetry').addEventListener('click', () => { AUD.play('ui'); startRound(); });
$('resHome').addEventListener('click', async () => { AUD.play('ui'); await maybeInter(); goHome(); });
$('restart').addEventListener('click', () => { AUD.play('ui'); startRound(); });
$('again').addEventListener('click', async () => { AUD.play('ui'); await maybeInter(); if (G.mode === 'online') { toMenu(); if (NET.room) { $('lobJoin').hidden = true; $('lobRoom').hidden = false; sheet('lobby', true); renderLobby(); } } else { const q = G.opt.quick; toMenu(); mmStart(q ? 'quick' : 'arena'); } });
$('toHome').addEventListener('click', async () => { AUD.play('ui'); await maybeInter(); goHome(); });
$('bPause').addEventListener('click', () => setPause(true)); $('resume').addEventListener('click', () => setPause(false)); $('quit').addEventListener('click', goHome);
$('howBtn').addEventListener('click', () => sheet('how', true)); $('setBtn').addEventListener('click', () => sheet('settings', true));
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => sheet(b.dataset.close, false)));
$('tSound').addEventListener('click', () => { SV.sound = !SV.sound; save(); renderHome(); AUD.play('ui'); });
$('tMusic').addEventListener('click', () => { SV.music = !SV.music; save(); renderHome(); AUD.music(SV.music ? 'menu' : null); AUD.want = 'menu'; });
$('tLang').addEventListener('click', () => { SV.lang = SV.lang === 'en' ? 'tr' : 'en'; save(); AUD.play('ui'); applyLang(); renderHome(); });
// online lobby
async function joinRoom(code) { $('lobErr').textContent = T('Bağlanıyor…', 'Connecting…'); const ok = await NET.open(code); if (!ok) { $('lobErr').textContent = NET.err; return; } $('lobErr').textContent = ''; $('lobJoin').hidden = true; $('lobRoom').hidden = false; renderLobby(); }
$('lobGo').addEventListener('click', () => { const c = $('lobInput').value.trim(); if (c.length < 3) { $('lobErr').textContent = T('En az 3 haneli bir kod yaz.', 'Type a code with at least 3 characters.'); return; } joinRoom(c); });
$('lobNew').addEventListener('click', () => { const c = String(1000 + Math.floor(Math.random() * 9000)); $('lobInput').value = c; joinRoom(c); });
$('lobQuick').addEventListener('click', () => { AUD.play('ui'); sheet('lobby', false); mmStart('quick'); });
$('lobStart').addEventListener('click', () => { AUD.play('ui'); NET.hostStart(); });
$('lobBack').addEventListener('click', () => { NET.leave(); sheet('lobby', false); });
$('vsX').addEventListener('click', () => { AUD.play('ui'); mmStop(); NET.leave(); });


// ---------- loop ----------
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame); let dt = Math.min(0.05, (now - last) / 1000); last = now; if (G.paused) dt = 0;
  if (G.state !== 'menu' && G.state !== 'matchEnd') { if (dt) { update(dt * 0.5); update(dt * 0.5); } } else { G.t += dt; NET.poll(); mmTick(dt); }
  if (stageCur && (G.state === 'menu' || G.state === 'matchEnd')) { stageCur.pop = Math.min(1, (stageCur.pop || 0) + dt * 4); const e = stageCur.pop, s = 1 + Math.sin(e * Math.PI) * 0.12 * (1 - e) + (e - 1) * 0; stageCur.g.scale.setScalar(Math.max(0.001, e * (1 + (1 - e) * 0.6)) * 1.25); stageCur.g.rotation.y = Math.sin(G.t * 0.7) * 0.5; animChar(stageCur, dt, { t: G.t, move: 0, win: !!G.stageWin }); const pu = stage.userData.pu.userData.s; pu.position.y = 0.5 + Math.sin(G.t * 3) * 0.07; pu.rotation.y = Math.sin(G.t * 1.6) * 0.5; }
  island.water.offset.x = G.t * 0.012; island.water.offset.y = G.t * 0.008; const fs = 1 + Math.sin(G.t * 1.5) * 0.012; island.foam.scale.set(fs, 1, fs); island.foam2.scale.set(2 - fs, 1, 2 - fs);
  parts.update(dt); blasts.update(dt); updateCamera(dt); renderer.render(scene, cam);
  // keep it smooth on slower phones: step the resolution down if frames run long
  if (dt > 0) { fpsN++; fpsT += dt; if (fpsT > 2) { const avg = fpsT / fpsN; fpsN = fpsT = 0; if (avg > 0.024 && PRMAX > 1) { PRMAX = Math.max(1, PRMAX - 0.5); fitCamera(); } } }
}
makePortraits(); fitCamera(); applyLang(); show('home'); renderHome(); AUD.want = 'menu'; adScreen('menu');
setTimeout(() => { if (G.state === 'menu' && !MM.on && dailyState().can && !document.querySelector('.sheet:not([hidden])')) { dayGot = 0; renderDaily(); sheet('daily', true); } }, 3600);
requestAnimationFrame(frame);
window.__fb = { MM, mmStart, mmTick, mmStop, grant, renderHome, applyLang, lvInfo, dailyState, NET, startGame, PUZ, sim(n) { for (let i = 0; i < n; i++) update(1 / 60); }, G, SV, CHARS, startMatch, useAbility, placeBomb, IN, goHome };
window.addEventListener('error', (e) => { const el = $('err'); if (el) { el.textContent = '⚠ ' + (e.message || 'Hata'); el.hidden = false; } });
