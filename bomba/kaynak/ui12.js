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

