// ===== v1.3: maps, worlds, skins, visual how-to =====
const W_NEED = [0, 40, 85, 135, 190], W_COST = [0, 1500, 3000, 5000, 8000];
const stKey = (w, l) => w * PER + l;
const starsTotal = () => { let n = 0; for (const k in SV.st) n += SV.st[k] | 0; return n; };
const wStars = (w) => { let n = 0; for (let l = 1; l <= PER; l++) n += SV.st[stKey(w, l)] | 0; return n; };
const wOpen = (w) => w === 0 || SV.wOwn.includes(w) || starsTotal() >= W_NEED[w];
const macDone = () => Object.keys(SV.st).length;
const starStr = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
function setTheme(ti) { ti = ti >= 0 && ti < THEMES.length ? ti | 0 : 0; island.setTheme(ti); blocks.setTheme(ti); G.th = THEMES[ti]; G.fx = THEMES[ti].fx; }
const thName = (t) => t.icon + ' ' + T(t.n[0], t.n[1]);

function showResult() {
  const m = G.mode, L = G.opt.level, win = G.resWin, mac = m === 'macera', max = mac ? PER : PUZ.length, w = G.opt.world | 0;
  let rw = null, stars = 0;
  if (win && mac) { const fr = G.time / (G.timeMax || 180); stars = fr >= 0.5 ? 3 : fr >= 0.25 ? 2 : 1; const k = stKey(w, L), old = SV.st[k] | 0; if (stars > old) SV.st[k] = stars; rw = old ? [10 + (stars > old ? 10 : 0), 8] : [35 + G.eff * 3 + stars * 5, 30]; }
  else if (win) { const first = (SV.bul || 0) < L; if (first) SV.bul = L; rw = first ? [50, 30] : [5, 5]; }
  payout(rw, 'res'); adScreen('over');
  $('resStars').hidden = !stars; $('resStars').textContent = starStr(stars);
  $('resT').textContent = win ? (mac ? T('Bölüm ', 'Level ') : T('Bulmaca ', 'Puzzle ')) + L + T(' tamam', ' cleared') : G.resMsg;
  $('resS').textContent = win ? (L >= max ? (mac ? T('Bu haritayı bitirdin! Sıradaki haritaya bak.', 'You finished this map! Check the next one.') : T('Bütün bulmacaları bitirdin.', 'You finished every puzzle.')) : mac && stars < 3 ? T('Daha hızlı bitirirsen 3 yıldız alırsın.', 'Finish faster for 3 stars.') : T('Sıradaki seni bekliyor.', 'The next one is waiting.')) : m === 'bulmaca' ? T('İpucu: mor uyuyan bombalar patlama değince zincirleme patlar. Bomban sınırlı.', 'Hint: sleeping purple bombs go off when a blast touches them. Your bombs are limited.') : T('Canavarlara dokunma, kendi bombandan kaç ve süreye dikkat et.', 'Do not touch monsters, run from your own bombs and watch the clock.');
  $('resGo').hidden = !win || L >= max; $('resRetry').textContent = win ? T('Tekrar oyna', 'Play again') : T('TEKRAR DENE', 'TRY AGAIN'); $('resRetry').className = win ? 'ghost' : 'big'; sheet('res', true);
}
let stageKey = '';
function renderHome() {
  const vid = G.view && CHARS.some((c) => c.id === G.view) ? G.view : SV.char, ch = CHARS.find((c) => c.id === vid) || CHARS[0], owned = SV.own.includes(ch.id), li = lvInfo(SV.xp), sk = SV.sk[ch.id] | 0;
  $('roster').innerHTML = CHARS.map((c) => '<button class="rc' + (c.id === ch.id ? ' on' : '') + (SV.own.includes(c.id) ? '' : ' lock') + '" data-c="' + c.id + '" style="--c:' + c.col + '" aria-label="' + cx(c, 'name') + '"><img alt="" src="' + PORT[c.id] + '"></button>').join('');
  $('cName').textContent = cx(ch, 'name'); $('cTag').textContent = cx(ch, 'tag'); $('cAbil').innerHTML = '<b>' + ch.icon + ' ' + cx(ch, 'abil') + '</b>' + cx(ch, 'desc');
  $('skinBtn').innerHTML = '🎨 ' + T('Skinler', 'Skins') + ' <small>' + SV.skOwn[ch.id].length + '/8</small>';
  const bar = (v, max) => '<i style="--v:' + Math.round(v / max * 100) + '%"></i>';
  $('cStats').innerHTML = '<div><span>' + T('Hız', 'Speed') + '</span>' + bar(ch.spd - 2.8, 1.6) + '</div><div><span>' + T('Bomba', 'Bombs') + '</span>' + bar(ch.bombs, 3) + '</div><div><span>' + T('Menzil', 'Range') + '</span>' + bar(ch.range, 4) + '</div>';
  $('play').textContent = owned ? T('OYNA', 'PLAY') : T('AL · ', 'GET · ') + fmtN(CH_PRICE[ch.id]) + ' 🪶'; $('play').classList.toggle('buy', !owned);
  $('pChip').innerHTML = avHTML(SV.av, 40) + '<div><b>' + escH(SV.name) + '</b><span>' + T('Seviye ', 'Level ') + li.l + '</span><i class="xb" style="--v:' + Math.round(li.cur / li.need * 100) + '%"></i></div>';
  $('tuyN').textContent = fmtN(SV.tuy); $('dayBtn').classList.toggle('dot', dailyState().can);
  $('mMac').textContent = '⭐ ' + starsTotal() + T(' · 5 harita, 125 bölüm. Canavarları patlat, kapıyı bul, çık.', ' · 5 maps, 125 levels. Blast monsters, find the door, exit.');
  $('mBul').textContent = (SV.bul || 0) >= PUZ.length ? T('Hepsi tamam · ', 'All done · ') + PUZ.length + T(' bulmaca', ' puzzles') : T('Bulmaca ', 'Puzzle ') + ((SV.bul || 0) + 1) + ' / ' + PUZ.length + T(' · sınırlı bombayla çöz', ' · solve with limited bombs');
  $('sSound').textContent = SV.sound ? T('Açık', 'On') : T('Kapalı', 'Off'); $('sMusic').textContent = SV.music ? T('Açık', 'On') : T('Kapalı', 'Off'); $('sLang').textContent = SV.lang === 'en' ? 'English' : 'Türkçe';
  if (stageKey !== ch.id + ':' + sk) showStageChar(ch.id, sk);
}
let lvW = 0;
function openLevels(m, w) {
  const mac = m === 'macera'; if (mac) lvW = w === undefined ? SV.lastW | 0 : w;
  $('lvTitle').textContent = mac ? T('Macera', 'Adventure') : T('Bulmaca', 'Puzzle'); $('lvTabs').hidden = $('lvInfo').hidden = !mac;
  const open = !mac || wOpen(lvW), th = THEMES[lvW];
  if (mac) { $('lvTabs').innerHTML = THEMES.map((t, i) => '<button class="' + (i === lvW ? 'on' : '') + (wOpen(i) ? '' : ' lock') + '" data-w="' + i + '">' + t.icon + '</button>').join('');
    $('lvInfo').innerHTML = '<b>' + T(th.n[0], th.n[1]) + '</b> · ⭐ ' + wStars(lvW) + '/' + PER * 3 + '<br>' + T(th.fxT[0], th.fxT[1]); }
  $('lvGrid').hidden = !open; $('lvLock').hidden = open;
  if (!open) { $('lvLockT').innerHTML = '🔒 ' + T('Bu harita <b>' + W_NEED[lvW] + ' ⭐</b> toplayınca açılır. Sende ' + starsTotal() + ' ⭐ var.<br>Beklemek istemezsen tüyle hemen aç.', 'This map opens at <b>' + W_NEED[lvW] + ' ⭐</b>. You have ' + starsTotal() + ' ⭐.<br>Or open it right now with feathers.'); $('lvBuy').textContent = T('AÇ · ', 'OPEN · ') + fmtN(W_COST[lvW]) + ' 🪶'; }
  const max = mac ? PER : PUZ.length, st = (i) => (mac ? SV.st[stKey(lvW, i + 1)] | 0 : i < (SV.bul || 0) ? 3 : 0);
  $('lvGrid').innerHTML = Array.from({ length: max }, (_, i) => { const d = st(i), can = i === 0 || st(i - 1) > 0; return '<button data-l="' + (i + 1) + '" class="' + (d ? 'ok' : can ? 'cur' : 'lock') + '"' + (can ? '' : ' disabled') + '>' + (can ? i + 1 : '🔒') + (mac && d ? '<small>' + starStr(d) + '</small>' : '') + '</button>'; }).join('');
  $('lvGrid').dataset.m = m; sheet('modes', false); sheet('levels', true);
}
$('lvTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-w]'); if (!b) return; AUD.play('ui'); openLevels('macera', +b.dataset.w); });
$('lvBuy').addEventListener('click', () => { if (SV.tuy < W_COST[lvW]) { toast(T('Tüy yetmiyor', 'Not enough feathers')); return; } SV.tuy -= W_COST[lvW]; SV.wOwn.push(lvW); save(); AUD.play('win'); toast(T('Yeni harita açıldı!', 'New map unlocked!')); renderHome(); openLevels('macera', lvW); });

// skins: cosmetic only
const RAR_N = { c: ['Sıradan', 'Common'], r: ['Nadir', 'Rare'], e: ['Epik', 'Epic'], l: ['Efsanevi', 'Legendary'] };
const PORTS = {}; let PRT = null;
function portrait(id, sk, px) {
  const k = id + ':' + sk + ':' + px; if (PORTS[k]) return PORTS[k];
  if (!PRT) { const rt = new THREE.Scene(); rt.environment = scene.environment; rt.add(new THREE.HemisphereLight(0xffffff, 0x99aacc, 1.4)); const l = new THREE.DirectionalLight(0xffffff, 2.2); l.position.set(-2, 4, 5); rt.add(l); PRT = { rt, c: new THREE.PerspectiveCamera(24, 1, 0.1, 20) }; }
  renderer.setPixelRatio(1); renderer.setSize(px, px, false); renderer.setClearColor(0x000000, 0);
  const P = makeChar(id, sk); PRT.rt.add(P.g); P.g.rotation.y = 0.4; animChar(P, 0, { t: 0.4, move: 0 }); PRT.c.position.set(0.3, 1.35, 6.9); PRT.c.lookAt(0, 1.08, 0); renderer.render(PRT.rt, PRT.c); const url = canvas.toDataURL('image/png'); PRT.rt.remove(P.g);
  renderer.setClearColor(0x000000, 1); fitCamera(); return (PORTS[k] = url);
}
let skSel = 0, skCh = 'flix';
function renderSkins() {
  const ch = CHARS.find((c) => c.id === skCh), L = SKINS[skCh], own = SV.skOwn[skCh], K = L[skSel], r = RAR[skSel], has = own.includes(skSel), cur = SV.sk[skCh] === skSel, chOwn = SV.own.includes(skCh);
  $('skT').textContent = cx(ch, 'name'); $('skTuy').textContent = '🪶 ' + fmtN(SV.tuy);
  $('skBig').innerHTML = '<img alt="" src="' + portrait(skCh, skSel, 300) + '"><div><b>' + T(K.n[0], K.n[1]) + '</b><span style="background:' + RAR_COL[r] + '">' + T(RAR_N[r][0], RAR_N[r][1]) + '</span><small>' + T('Sadece görünüş. Güç vermez.', 'Looks only. No extra power.') + '</small></div>'; $('skBig').style.setProperty('--rc', RAR_COL[r]);
  $('skGrid').innerHTML = L.map((s, i) => '<button class="skt' + (i === skSel ? ' on' : '') + (own.includes(i) ? '' : ' lock') + '" data-k="' + i + '" style="--rc:' + RAR_COL[RAR[i]] + '"><img alt="" src="' + portrait(skCh, i, 132) + '"><small>' + (SV.sk[skCh] === i ? '✓ ' : '') + (own.includes(i) ? T(s.n[0], s.n[1]) : fmtN(RAR_PRICE[i]) + ' 🪶') + '</small></button>').join('');
  const b = $('skGo'); b.disabled = cur || !chOwn; b.className = has ? 'big' : 'big buy'; b.textContent = !chOwn ? T('ÖNCE KARAKTERİ AÇ', 'UNLOCK THE CHARACTER FIRST') : cur ? T('SEÇİLİ', 'EQUIPPED') : has ? T('SEÇ', 'EQUIP') : T('AL · ', 'GET · ') + fmtN(RAR_PRICE[skSel]) + ' 🪶';
}
$('skinBtn').addEventListener('click', () => { AUD.play('ui'); skCh = G.view && CHARS.some((c) => c.id === G.view) ? G.view : SV.char; skSel = SV.sk[skCh] | 0; renderSkins(); sheet('skins', true); });
$('skGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (!b) return; AUD.play('ui'); skSel = +b.dataset.k; renderSkins(); });
$('skGo').addEventListener('click', () => { const own = SV.skOwn[skCh];
  if (!own.includes(skSel)) { const pr = RAR_PRICE[skSel]; if (SV.tuy < pr) { toast(T('Tüy yetmiyor', 'Not enough feathers')); return; } SV.tuy -= pr; own.push(skSel); AUD.play('win'); toast(T('Yeni skin açıldı!', 'New skin unlocked!')); } else AUD.play('pick');
  SV.sk[skCh] = skSel; save(); renderSkins(); renderHome(); });

// visual how-to
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
function mg(rows, ti) {
  const Tm = THEMES[ti || 0], s = 32, w = rows[0].length, h = rows.length; let o = '<svg class="mg" viewBox="0 0 ' + w * s + ' ' + h * s + '" style="max-width:' + w * 44 + 'px">';
  const EMJ = { B: '💣', M: '👾', D: '🚪', U: '⚡', S: '🟣', F: '🔥', K: '👟' };
  rows.forEach((r, y) => [...r].forEach((c, x) => { const X = x * s, Y = y * s; o += '<rect x="' + X + '" y="' + Y + '" width="' + s + '" height="' + s + '" fill="' + Tm.f[(x + y) % 2] + '"/>';
    if (c === '#') o += '<rect x="' + (X + 2) + '" y="' + (Y + 2) + '" width="' + (s - 4) + '" height="' + (s - 4) + '" rx="7" fill="' + hex(Tm.stone) + '"/><rect x="' + (X + 7) + '" y="' + (Y + 6) + '" width="' + (s - 14) + '" height="' + (s - 16) + '" rx="5" fill="' + hex(Tm.stoneTop) + '"/>';
    else if (c === 'c') o += '<rect x="' + (X + 2) + '" y="' + (Y + 2) + '" width="' + (s - 4) + '" height="' + (s - 4) + '" rx="6" fill="' + Tm.brick[2] + '"/><rect x="' + (X + 5) + '" y="' + (Y + 4) + '" width="' + (s - 10) + '" height="' + (s - 15) + '" rx="5" fill="' + hex(Tm.cap) + '"/>';
    else if (c === 'g') o += '<rect x="' + (X + 3) + '" y="' + (Y + 3) + '" width="' + (s - 6) + '" height="' + (s - 6) + '" rx="6" fill="#ffc61a" stroke="#e09a00" stroke-width="2"/><text x="' + (X + s / 2) + '" y="' + (Y + s / 2 + 6) + '" text-anchor="middle" font-size="16">⭐</text>';
    else if (c === '+' || c === 'x') o += '<rect x="' + (X + 2) + '" y="' + (Y + 2) + '" width="' + (s - 4) + '" height="' + (s - 4) + '" rx="10" fill="#ff8a1f"/><rect x="' + (X + 8) + '" y="' + (Y + 8) + '" width="' + (s - 16) + '" height="' + (s - 16) + '" rx="7" fill="#fff4b8"/>';
    else if (c === 'P') o += '<image href="' + PORT[SV.char] + '" x="' + (X - 2) + '" y="' + (Y - 6) + '" width="' + (s + 4) + '" height="' + (s + 4) + '"/>';
    else if (EMJ[c]) o += '<text x="' + (X + s / 2) + '" y="' + (Y + s / 2 + 8) + '" text-anchor="middle" font-size="22">' + EMJ[c] + '</text>'; }));
  return o + '</svg>';
}
const PUI = {};
function puIcon(k) { if (PUI[k]) return PUI[k]; const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = PU[k].bg; x.beginPath(); x.arc(64, 64, 64, 0, 7); x.fill(); x.save(); x.beginPath(); x.arc(64, 64, 64, 0, 7); x.clip(); PU[k].draw(x); x.restore(); return (PUI[k] = c.toDataURL()); }
function howPages() {
  const step = (a, b) => '<div class="hs">' + a + '<p>' + b + '</p></div>', arrow = '<div class="har">➜</div>';
  return [
    [T('Oyunun mantığı', 'The idea'), '<div class="hrow">' + mg(['.....', '.#c#.', '.cB..', '.#.#.', 'P....']) + arrow + mg(['..+..', '.#+#.', '.+++.', '.#+#.', 'P.+..']) + '</div><ul><li>' + T('Bombayı bırak ve <b>uzaklaş</b>. Bomba 2,5 saniye sonra patlar.', 'Drop a bomb and <b>get away</b>. It blows up after 2.5 seconds.') + '</li><li>' + T('Patlama <b>artı (+)</b> şeklinde yayılır. Köşeyi dönersen güvendesin.', 'The blast spreads in a <b>plus (+)</b> shape. Turn a corner and you are safe.') + '</li><li>' + T('Üstü yeşil <b>tuğlalar kırılır</b>, gri <b>taşlar kırılmaz</b>.', 'Green-topped <b>bricks break</b>, grey <b>stones never do</b>.') + '</li><li>' + T('Kendi bomban seni de yakar!', 'Your own bomb hurts you too!') + '</li></ul>'],
    [T('Kontroller', 'Controls'), '<svg class="ph" viewBox="0 0 200 150"><rect x="6" y="6" width="188" height="138" rx="18" fill="#1f9ee8" stroke="#022753" stroke-width="5"/><circle cx="52" cy="100" r="30" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/><circle cx="62" cy="94" r="13" fill="#fff" stroke="#022753" stroke-width="3"/><circle cx="152" cy="104" r="26" fill="#ffd41f" stroke="#022753" stroke-width="4"/><text x="152" y="112" text-anchor="middle" font-size="22">💣</text><circle cx="112" cy="72" r="17" fill="#fff" stroke="#022753" stroke-width="3"/><text x="112" y="79" text-anchor="middle" font-size="16">⚡</text><text x="52" y="52" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">1</text><text x="152" y="66" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">2</text><text x="112" y="44" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">3</text></svg><ul><li><b>1</b> ' + T('Ekranın solunda parmağını <b>sürükle</b>: karakter o yöne yürür.', '<b>Drag</b> your finger on the left: the character walks that way.') + '</li><li><b>2</b> ' + T('<b>BOMBA</b>: bulunduğun kareye bomba bırakır.', '<b>BOMB</b>: drops a bomb on your tile.') + '</li><li><b>3</b> ' + T('<b>Özel güç</b>: her karakterde farklı. Dolunca yeşil yanar.', '<b>Special power</b>: different for each character. Turns green when ready.') + '</li><li>' + T('Klavye: ok tuşları, boşluk, Shift.', 'Keyboard: arrows, space, Shift.') + '</li></ul>'],
    [T('Güçler', 'Power-ups'), '<p>' + T('Tuğlaları kırınca içinden çıkar. Üstüne yürü, al.', 'They pop out of broken bricks. Walk over them to collect.') + '</p><div class="pug">' + [['bomb', T('Fazla bomba', 'Extra bomb')], ['range', T('Uzun patlama', 'Longer blast')], ['speed', T('Hız', 'Speed')], ['kick', T('Tekme: bombayı it', 'Kick: push bombs')], ['pierce', T('Delici: tuğladan geçer', 'Pierce: goes through bricks')], ['vest', T('Yelek: 1 patlamadan korur', 'Vest: blocks 1 blast')], ['full', T('Tam menzil', 'Full range')], ['skull', T('Lanet: uzak dur!', 'Curse: avoid it!')]].map((p) => '<div><img alt="" src="' + puIcon(p[0]) + '"><span>' + p[1] + '</span></div>').join('') + '</div>'],
    [T('Karakterler', 'Characters'), '<div class="chl">' + CHARS.map((c) => '<div><img alt="" src="' + PORT[c.id] + '" style="background:' + c.col + '"><p><b>' + cx(c, 'name') + ' · ' + c.icon + ' ' + cx(c, 'abil') + '</b>' + cx(c, 'desc') + '</p></div>').join('') + '</div><p class="note">' + T('Skinler sadece görünüşü değiştirir, güç vermez.', 'Skins only change the look, never the power.') + '</p>'],
    [T('🗺 Macera', '🗺 Adventure'), '<div class="hrow">' + step(mg(['.M.', '.+.', '+B+']), T('<b>1.</b> Canavarları patlat', '<b>1.</b> Blast the monsters')) + step(mg(['c+c', '+D+', 'c+c']), T('<b>2.</b> Tuğlaların altındaki kapıyı bul', '<b>2.</b> Find the door under a brick')) + step(mg(['...', 'PD.', '...']), T('<b>3.</b> Kapıya gir', '<b>3.</b> Walk into the door')) + '</div><ul><li>' + T('Canavara <b>dokunursan</b> yanarsın. Kapı, bütün canavarlar bitince açılır.', '<b>Touching</b> a monster knocks you out. The door opens once all monsters are gone.') + '</li><li>' + T('Hızlı bitir: <b>★★★</b>. Yıldızlar yeni haritaları açar.', 'Finish fast for <b>★★★</b>. Stars open new maps.') + '</li><li>' + T('5 harita, her birinde 25 bölüm.', '5 maps with 25 levels each.') + '</li></ul>'],
    [T('⚔ Arena ve 🌐 Online', '⚔ Arena and 🌐 Online'), '<div class="hrow">' + mg(['P.c.M'.replace('M', '.'), '.#c#.', 'cc.cc', '.#c#.', '..c..']) + '</div><ul><li>' + T('<b>4 oyuncu</b> köşelerden başlar. Tuğlaları kırıp güçlen, rakiplerini bombayla sıkıştır.', '<b>4 players</b> start in the corners. Break bricks, power up and trap your rivals.') + '</li><li>' + T('Son ayakta kalan <b>raundu</b> alır. <b>3 raunt</b> alan maçı kazanır.', 'Last one standing takes the <b>round</b>. First to <b>3 rounds</b> wins.') + '</li><li>' + T('2 dakika sonra alan <b>kenarlardan daralır</b>.', 'After 2 minutes the arena <b>closes in</b>.') + '</li><li>' + T('Online: hızlı eşleş ya da arkadaşlarınla aynı oda kodunu gir.', 'Online: quick match, or share a room code with friends.') + '</li></ul>'],
    [T('🧩 Bulmaca', '🧩 Puzzle'), '<div class="hrow">' + mg(['#####', '#gSg#', '#.B.#', '#.P.#', '#####']) + arrow + mg(['#####', '#x+x#', '#.+.#', '#.P.#'.replace('P', '.'), '#####']) + '</div><ul><li>' + T('Hedef: bütün <b>altın kasaları</b> patlatmak.', 'Goal: blow up every <b>gold crate</b>.') + '</li><li>' + T('Bomban <b>sayılı</b>. Nereye koyacağını düşün.', 'You only get <b>a few bombs</b>. Think before you place.') + '</li><li>' + T('<b>Mor bombalar</b> uyur. Patlama değince onlar da patlar: zincir kur.', '<b>Purple bombs</b> sleep. A blast sets them off: build a chain.') + '</li></ul>'],
    [T('Haritalar', 'Maps'), '<div class="thl">' + THEMES.map((t, i) => '<div>' + mg(['c.#', '.B.'], i) + '<p><b>' + thName(t) + '</b>' + T(t.fxT[0], t.fxT[1]) + '</p></div>').join('') + '</div>'],
    [T('🪶 Tüy, seviye, skinler', '🪶 Feathers, level, skins'), '<ul><li>' + T('Her maç ve bölüm <b>tüy</b> ve <b>XP</b> kazandırır. XP seviyeni yükseltir.', 'Every match and level pays <b>feathers</b> and <b>XP</b>. XP raises your level.') + '</li><li>' + T('Tüyle <b>yeni karakter</b>, <b>skin</b>, <b>harita</b> ve <b>avatar parçası</b> alınır.', 'Feathers buy <b>characters</b>, <b>skins</b>, <b>maps</b> and <b>avatar items</b>.') + '</li><li>' + T('🎁 <b>Günlük ödülü</b> her gün topla, seri büyüdükçe ödül artar.', '🎁 Claim the <b>daily reward</b> every day; the streak makes it grow.') + '</li><li>' + T('Sol üstteki <b>profilden</b> avatarını ve ismini değiştir.', 'Change your avatar and name from the <b>profile</b> at the top left.') + '</li></ul><p class="note">' + T('Yeterli oyuncu bulunamadığında maçlar bilgisayarın yönettiği oyuncularla tamamlanır.', 'When there are not enough players around, matches are completed with computer-controlled players.') + '</p>'],
  ];
}
let howI = 0;
function renderHow() { const P = howPages(); howI = Math.max(0, Math.min(P.length - 1, howI)); $('howT').textContent = P[howI][0]; $('howB').innerHTML = P[howI][1]; $('howB').scrollTop = 0; $('howDots').innerHTML = P.map((_, i) => '<i class="' + (i === howI ? 'on' : '') + '"></i>').join(''); $('howPrev').textContent = T('Geri', 'Back'); $('howPrev').style.visibility = howI ? 'visible' : 'hidden'; $('howNext').textContent = howI === P.length - 1 ? T('TAMAM', 'GOT IT') : T('İLERİ', 'NEXT'); }
$('howBtn').addEventListener('click', () => { AUD.play('ui'); howI = 0; renderHow(); sheet('how', true); });
$('howPrev').addEventListener('click', () => { AUD.play('ui'); howI--; renderHow(); });
$('howNext').addEventListener('click', () => { AUD.play('ui'); if (howI >= howPages().length - 1) { sheet('how', false); return; } howI++; renderHow(); });

