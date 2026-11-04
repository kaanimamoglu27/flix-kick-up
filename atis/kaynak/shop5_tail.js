
// ---- shop tabs, 3D preview of people / animals ----
const hx = (v) => '#' + v.toString(16).padStart(6, '0');
const npcSVG = (S) => { const c = hx(S.cloth || 0x2fa84f), p = hx(S.pants || 0x22304a); return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${S.cape ? `<path d="M18 22 L42 22 L46 52 L14 52z" fill="${hx(S.cape)}"/>` : ''}<rect x="22" y="40" width="7" height="20" fill="${p}"/><rect x="31" y="40" width="7" height="20" fill="${p}"/><rect x="19" y="21" width="22" height="22" rx="5" fill="${c}"/><circle cx="30" cy="13" r="8" fill="#f1c7a0"/>${S.hat === 'chef' ? '<path d="M22 8 Q22 -2 30 0 Q38 -2 38 8z" fill="#fff"/>' : S.hat === 'helmet' ? '<circle cx="30" cy="13" r="11" fill="rgba(191,230,255,.55)"/>' : '<path d="M22 11 Q30 1 38 11z" fill="#5a3a22"/>'}${S.id === 'futbolcu' ? '<text x="30" y="37" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">10</text>' : ''}</g></svg>`; };
const ANI_ICON = {normal: ['#f0912e', '#f4f0e8'], dino: ['#5fae3a', '#d8e8a0'], penguen: ['#1b1f2a', '#f8f8f4'], panda: ['#f8f8f4', '#1b1f2a'], tavuk: ['#f8f6ee', '#e22511']};
const aniSVG = (S) => { const [a, b] = ANI_ICON[S.id]; const extra = S.id === 'dino' ? '<path d="M24 18 l4 -7 l4 7 M33 19 l4 -6 l3 7" fill="#ff9a1a"/>' : S.id === 'tavuk' ? '<path d="M26 14 q4 -9 8 0z" fill="#e22511"/>' : S.id === 'panda' ? '<circle cx="20" cy="20" r="5" fill="#1b1f2a"/><circle cx="40" cy="20" r="5" fill="#1b1f2a"/>' : S.id === 'normal' ? '<path d="M20 24 l3 -10 l6 7z M40 24 l-3 -10 l-6 7z" fill="#f0912e"/>' : ''; return `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2" stroke-linejoin="round">${extra}<ellipse cx="30" cy="46" rx="17" ry="13" fill="${a}"/><circle cx="30" cy="28" r="11" fill="${a}"/><ellipse cx="30" cy="32" rx="6" ry="4" fill="${b}"/>${S.id === 'penguen' || S.id === 'tavuk' ? '<path d="M27 30 l3 5 l3 -5z" fill="#ffb01a"/>' : ''}<circle cx="26" cy="26" r="1.8" fill="#1b1330"/><circle cx="34" cy="26" r="1.8" fill="#1b1330"/></g></svg>`; };
const TABS = {
  skin: {list: SKINS, key: 'skin', svg: toySVG, apply: (id) => applySkin(id)},
  trail: {list: TRAILS, key: 'trail', svg: trailSVG, apply: (id) => applyTrail(id)},
  npc: {list: NPC_SKINS, key: 'npc', svg: npcSVG, apply: (id) => shopPreview(id)},
  ani: {list: ANI_SKINS, key: 'ani', svg: aniSVG, apply: (id) => shopPreview(id)},
};
function ownKey(tab, id) { return id + (tab === 'trail' && id === 'buz' ? '_t' : ''); }
let prevModel = null;
function shopPreview(id) {
  if (prevModel) { scene.remove(prevModel); prevModel = null; }
  const on = state === 'shop' && (shopTab === 'npc' || shopTab === 'ani'); toyRoot.visible = !on; if (!on) return;
  const m = shopTab === 'npc' ? makePerson({npcSkin: id || SAVE.npc, col: 0xe22511}) : makeCat({aniSkin: id || SAVE.ani});
  if (shopTab === 'ani') m.g.scale.multiplyScalar(2.3);
  const base = startPos(LV); m.g.position.set(base.x, base.y - RAD + (shopTab === 'npc' ? 0.05 : 0.45), base.z); prevModel = m.g; scene.add(m.g);
}
// ---- Sokak 2 pack: levels 11-20 ----
function levelLocked(i) { return i >= FREE_LEVELS && !SAVE.pack2; }
function openPack() {
  dlg('SOKAK 2 · ÇARŞI', '10 YENİ BÖLÜM', `<p>Köprüler, çatı katları, ters rüzgâr, pazar labirenti ve <b>Büyük Final</b>. Hepsi ilk 10 bölümden daha zor.</p>`,
    [{t: 'Satın al · ' + priceOf(PACK2), c: 'ok', f: () => buyProduct({...PACK2, title: 'Sokak 2 paketi'})},
     {t: fmtN(PACK2.fe) + ' tüy ile aç', c: SAVE.fe >= PACK2.fe ? '' : 'dim', f: () => { if (SAVE.fe < PACK2.fe) { toastShop('Yetersiz tüy', fmtN(PACK2.fe - SAVE.fe) + ' tüy daha lazım'); return; } addFe(-PACK2.fe); grant(PACK2.id, null); }},
     {t: 'Vazgeç'}]);
}
// ---- daily gift: a 7-day streak, double it with an ad ----
const dayKey = (d) => d.toISOString().slice(0, 10);
function dailyState() { const now = new Date(), today = dayKey(now), y = dayKey(new Date(now - 864e5)); const D = SAVE.daily; const ready = D.last !== today; const streak = ready ? (D.last === y ? D.streak : 0) : D.streak - 1; return {ready, today, day: ((streak % 7) + 7) % 7}; }
function dailyUI() { const b = $('dailyDot'); if (b) b.hidden = !dailyState().ready; }
function claimDaily(mult) { const st = dailyState(); if (!st.ready) return; const n = DAILY[st.day] * mult; SAVE.daily = {last: st.today, streak: st.day + 1}; save(); addFe(n, mult > 1 ? 'günlük hediye x2' : 'günlük hediye'); SFX.win(); buzz([20, 30, 20]); dailyUI(); }
function openDaily() {
  const st = dailyState();
  const days = DAILY.map((n, k) => `<div class="dd${k < st.day ? ' got' : ''}${k === st.day ? ' now' : ''}"><small>${k + 1}. gün</small><b>${fmtN(n)}</b></div>`).join('');
  if (!st.ready) { dlg('GÜNLÜK HEDİYE', 'YARIN GEL', `<div class="days">${days}</div><p>Bugünkü hediyeni aldın. Her gün gel, 7. gün ${DAILY[6]} tüy!</p>`, [{t: 'Tamam', c: 'ok'}]); return; }
  dlg('GÜNLÜK HEDİYE', '+' + DAILY[st.day] + ' TÜY', `<div class="days">${days}</div><p>Her gün gelirsen hediye büyür. Bir gün kaçırırsan baştan başlar.</p>`,
    [{t: '▶ Reklam izle · 2x', c: 'ad', f: async () => { const r = await adRewarded(); if (r === 'rewarded') claimDaily(2); else { toastShop('Reklam şu an yok', 'normal hediyeni verdim'); claimDaily(1); } }},
     {t: 'Al', c: 'ok', f: () => claimDaily(1)}]);
}
function openHow() {
  dlg('NASIL OYNANIR', 'KOVAYA SOK!', `<div class="how"><p><b>Sağa sola kaydır:</b> yön seç.</p><p><b>Aşağı çek, bırak:</b> ne kadar çekersen o kadar uzağa.</p><p><b>Uçarken basılı tut:</b> tüyler açılır, FLIX süzülür.</p><p><b>Golf gibi:</b> durduğu yerden devam edersin. Par kadar ya da daha az atışla bitir, 3 yıldız al.</p><p><b>Dikkat:</b> insanlara çarparsa topu bir iki sektirip rastgele bir yere şutlarlar!</p><p>FLIX kovanın <b>tam içine</b> düşmeden bölüm bitmez.</p></div>`, [{t: 'Anladım', c: 'ok'}]);
}
// ---- one dialog for packs, gifts and help ----
function dlg(tag, title, body, btns) {
  $('dlgTag').textContent = tag; $('dlgT').textContent = title; $('dlgB').innerHTML = body; const w = $('dlgBtns'); w.innerHTML = '';
  for (const b of btns) { const e = document.createElement('button'); e.className = 'mbtn ' + (b.c || ''); e.textContent = b.t; e.onclick = () => { show('dlgL', false); if (b.f) b.f(); }; w.appendChild(e); }
  show('dlgL', true); tick();
}
function maybeLoseAd() { SAVE.loses++; save(); if (SAVE.noads || BOT || SAVE.loses % 2) return Promise.resolve(false); return adInterstitial(); }
dailyUI();
