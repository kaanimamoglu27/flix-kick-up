
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
