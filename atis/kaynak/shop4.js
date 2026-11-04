// ================= ECONOMY: tüy (feathers) currency, cosmetics, ads, in-app purchases =================
const SKINS = [ // body, three feathers, finish
  {id: 'klasik', name: 'Klasik', price: 0, body: 0xe22511, fe: [0x1f6fd1, 0x2fa84f, 0xffc20e]},
  {id: 'okyanus', name: 'Okyanus', price: 300, body: 0x1f6fd1, fe: [0x5fd3e6, 0xffffff, 0x0d3f8a]},
  {id: 'orman', name: 'Orman', price: 300, body: 0x2f7a3a, fe: [0x9ad13a, 0x3f8a3a, 0xc8a060]},
  {id: 'seker', name: 'Pamuk Şeker', price: 600, body: 0xff8fb8, fe: [0xffffff, 0xb8e0ff, 0xffd1e6]},
  {id: 'gunbatimi', name: 'Gün Batımı', price: 900, body: 0xff7a1a, fe: [0xffc20e, 0xe22511, 0x7a4fb0]},
  {id: 'bayrak', name: 'Ay Yıldız', price: 1200, body: 0xe22511, fe: [0xffffff, 0xe22511, 0xffffff]},
  {id: 'gece', name: 'Gece', price: 1800, body: 0x1b1330, fe: [0x00e5ff, 0xff2bd6, 0x9dff00], glow: 0.7},
  {id: 'buz', name: 'Buz', price: 2500, body: 0xbfe9ff, fe: [0xffffff, 0x8fd8ff, 0xd8f4ff], glow: 0.35},
  {id: 'altin', name: 'Altın', price: 4000, body: 0xffc20e, fe: [0xffe27a, 0xffb000, 0xfff1b8], metal: 0.6, glow: 0.25},
  {id: 'ejder', name: 'Ejderha', price: 8000, body: 0x2a0d0d, fe: [0xff3a00, 0xffc20e, 0xff3a00], metal: 0.3, glow: 0.9},
];
const TRAILS = [
  {id: 'sari', name: 'Sarı İz', price: 0, cols: [0xffc20e]},
  {id: 'gokkusagi', name: 'Gökkuşağı', price: 500, rainbow: 1},
  {id: 'ates', name: 'Ateş', price: 900, cols: [0xffc20e, 0xff7a1a, 0xe22511]},
  {id: 'buz', name: 'Buz', price: 900, cols: [0xffffff, 0x8fd8ff, 0x5fb8ff]},
  {id: 'konfeti', name: 'Konfeti', price: 1500, cols: [0xe22511, 0xffc20e, 0x1f6fd1, 0x2fa84f, 0xff8fb8], big: 1},
  {id: 'yildiz', name: 'Yıldız Tozu', price: 2500, cols: [0xfff1b8, 0xffffff, 0xffc20e], big: 1, twinkle: 1},
];
// in-app products (ids must match App Store Connect); prices are the fallbacks shown until the store loads
const PACKS = [
  {id: 'atis_feathers_500', fe: 500, price: '₺39,99'},
  {id: 'atis_feathers_1200', fe: 1200, price: '₺79,99', tag: '+%20'},
  {id: 'atis_feathers_3500', fe: 3500, price: '₺199,99', tag: '+%40'},
  {id: 'atis_feathers_8000', fe: 8000, price: '₺399,99', tag: 'EN POPÜLER'},
  {id: 'atis_feathers_20000', fe: 20000, price: '₺799,99', tag: 'EN AVANTAJLI'},
];
const STARTER = {id: 'atis_starter', fe: 2500, skin: 'gece', price: '₺119,99'};
const NOADS = {id: 'atis_noads', price: '₺119,99'};
const AD_CFG = {interEvery: 3, interFromLevel: 3, freeFe: 60, freeCooldownMin: 8, freePerDay: 6, doubleEnd: 1, extraShots: 2};
SAVE.own = SAVE.own || {klasik: 1, sari: 1}; SAVE.skin = SAVE.skin || 'klasik'; SAVE.trail = SAVE.trail || 'sari';
SAVE.tx = SAVE.tx || []; SAVE.wins = SAVE.wins || 0; SAVE.ads = SAVE.ads || {day: '', n: 0, last: 0};
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

// ---- currency ----
function addFe(n, why) { SAVE.fe = Math.max(0, (SAVE.fe || 0) + n); save(); feUI(); if (n > 0 && why) toastShop('+' + n + ' tüy', why); }
function feUI() { document.querySelectorAll('.feN').forEach((e) => { e.textContent = fmtN(SAVE.fe || 0); }); }
const fmtN = (n) => n.toLocaleString('tr-TR');
function toastShop(a, b) { const el = $('shopToast'); el.innerHTML = `<b>${a}</b>${b ? '<span>' + b + '</span>' : ''}`; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); }

// ---- cosmetics on the 3D toy ----
const toyBody = toyM.children.find((m) => m.isMesh && m.geometry.type === 'LatheGeometry');
const toyFeMats = toyM.userData.fe.map((p) => p.children.find((m) => m.isMesh && m.geometry.type === 'PlaneGeometry').material);
function applySkin(id) {
  const S = SKINS.find((s) => s.id === id) || SKINS[0];
  toyBody.material.color.setHex(S.body); toyBody.material.emissive.setHex(S.body); toyBody.material.emissiveIntensity = 0.15 + (S.glow || 0) * 0.3; toyBody.material.metalness = S.metal || 0; toyBody.material.roughness = S.metal ? 0.25 : 0.35;
  toyFeMats.forEach((m, i) => { m.color.setHex(S.fe[i]); m.emissive.setHex(S.fe[i]); m.emissiveIntensity = 0.3 + (S.glow || 0) * 0.5; m.metalness = (S.metal || 0) * 0.5; });
}
let trailDef = TRAILS[0];
function applyTrail(id) { trailDef = TRAILS.find((t) => t.id === id) || TRAILS[0]; }
function equipAll() { applySkin(SAVE.skin); applyTrail(SAVE.trail); }

// ---- ads (AdMob in the app, a FLIX toy ad on the web) ----
function webAd(kind) { // the web build has no ad network: shows our own FLIX ad card so the flow can be tried
  return new Promise((res) => {
    const L = $('adL'), sec = kind === 'rewarded' ? 5 : 3; let left = sec; show('adL', true); $('adKind').textContent = kind === 'rewarded' ? 'ÖDÜLLÜ REKLAM' : 'REKLAM';
    const close = $('adClose'); close.disabled = true; close.textContent = left;
    const t = setInterval(() => { left--; if (left > 0) close.textContent = left; else { clearInterval(t); close.disabled = false; close.textContent = '✕'; } }, 1000);
    close.onclick = () => { if (close.disabled) return; show('adL', false); res(kind === 'rewarded' ? 'rewarded' : true); };
  });
}
async function adRewarded() { if (window.FlixAds) return window.FlixAds.showRewarded(4000); return webAd('rewarded'); }
async function adInterstitial() { if (SAVE.noads) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); return webAd('inter'); }
function maybeInterstitial() { SAVE.wins++; save(); if (SAVE.noads || BOT || cur < AD_CFG.interFromLevel) return Promise.resolve(false); if (SAVE.wins % AD_CFG.interEvery) return Promise.resolve(false); return adInterstitial(); }
function freeFeState() { const d = new Date().toDateString(); if (SAVE.ads.day !== d) { SAVE.ads.day = d; SAVE.ads.n = 0; } const wait = SAVE.ads.last + AD_CFG.freeCooldownMin * 60000 - Date.now(); return {left: AD_CFG.freePerDay - SAVE.ads.n, wait: Math.max(0, wait)}; }

// ---- purchases ----
function priceOf(p) { return (window.FlixNative && window.FlixNative.price(p.id)) || p.price; }
function grant(id, tx) {
  if (tx) { if (SAVE.tx.includes(tx)) return; SAVE.tx.push(tx); if (SAVE.tx.length > 60) SAVE.tx.shift(); }
  const pk = PACKS.find((p) => p.id === id);
  if (pk) addFe(pk.fe, 'satın alındı');
  else if (id === STARTER.id) { if (!SAVE.starter) { SAVE.starter = 1; SAVE.own[STARTER.skin] = 1; addFe(STARTER.fe, 'Başlangıç Paketi'); } }
  else if (id === NOADS.id) { SAVE.noads = 1; if (window.FlixAds) window.FlixAds.setAdsRemoved(true); toastShop('Reklamlar kapandı', 'teşekkürler!'); }
  save(); if (!$('shopL').hidden) renderShop();
}
window.__atisGrant = grant;
if (window.FlixNative && window.FlixNative.flush) setTimeout(() => window.FlixNative.flush(), 0);
if (SAVE.noads && window.FlixAds) window.FlixAds.setAdsRemoved(true);
addEventListener('flixprices', () => { if (!$('shopL').hidden) renderShop(); });
async function buyProduct(p) {
  if (NATIVE && window.FlixNative) { const r = await window.FlixNative.buy(p.id); if (r === 'pending') toastShop('Onay bekleniyor', 'aile onayı gelince eklenecek'); else if (!r) toastShop('Satın alma tamamlanmadı'); return; }
  // web: a clearly marked demo (no money is taken)
  $('payT').textContent = p.title; $('payP').textContent = priceOf(p); show('payL', true);
  $('payOk').onclick = () => { show('payL', false); grant(p.id, 'web-' + Date.now()); }; $('payNo').onclick = () => show('payL', false);
}

// ---- shop screen ----
let shopTab = 'skin', tryOn = null;
const toySVG = (S) => `<svg viewBox="0 0 60 64"><g stroke="#1b1330" stroke-width="2"><path d="M30 30 C16 22 8 8 14 2 C22 6 28 18 30 30z" fill="#${S.fe[0].toString(16).padStart(6, '0')}"/><path d="M30 30 C26 16 26 4 30 0 C34 4 34 16 30 30z" fill="#${S.fe[1].toString(16).padStart(6, '0')}"/><path d="M30 30 C44 22 52 8 46 2 C38 6 32 18 30 30z" fill="#${S.fe[2].toString(16).padStart(6, '0')}"/><path d="M14 36 Q30 28 46 36 Q46 56 30 58 Q14 56 14 36z" fill="#${S.body.toString(16).padStart(6, '0')}"/><path d="M14 38 Q30 46 46 38" fill="none" stroke="#022753" stroke-width="3"/></g></svg>`;
const trailSVG = (T) => { const c = T.rainbow ? ['#e22511', '#ff7a1a', '#ffc20e', '#2fa84f', '#1f6fd1', '#7a4fb0'] : T.cols.map((v) => '#' + v.toString(16).padStart(6, '0')); return `<svg viewBox="0 0 60 64">${Array.from({length: 7}, (_, k) => `<circle cx="${8 + k * 7.5}" cy="${48 - Math.sin(k / 6 * Math.PI) * 30}" r="${(T.big ? 4.5 : 3.2) + k * 0.4}" fill="${c[k % c.length]}" stroke="#1b1330" stroke-width="1.2"/>`).join('')}</svg>`; };
function renderShop() {
  feUI(); document.querySelectorAll('#shopTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === shopTab));
  const g = $('shopGrid'); let html = '';
  if (shopTab === 'skin' || shopTab === 'trail') {
    const list = shopTab === 'skin' ? SKINS : TRAILS, eq = shopTab === 'skin' ? SAVE.skin : SAVE.trail;
    for (const it of list) {
      const own = !!SAVE.own[it.id + (shopTab === 'trail' && it.id === 'buz' ? '_t' : '')] || it.price === 0, on = eq === it.id;
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}"><div class="pv">${shopTab === 'skin' ? toySVG(it) : trailSVG(it)}</div><div class="nm">${it.name}</div>
        <div class="pr ${own ? (on ? 'on' : 'own') : (SAVE.fe >= it.price ? 'can' : 'no')}">${on ? 'SEÇİLİ' : own ? 'SEÇ' : '<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="2"/></svg>' + fmtN(it.price)}</div></button>`;
    }
  } else {
    const fs = freeFeState();
    html += `<button class="item wide free" id="freeFe" ${fs.left <= 0 || fs.wait > 0 ? 'disabled' : ''}><div class="pv big">▶</div><div class="nm">Reklam izle: <b>+${AD_CFG.freeFe} tüy</b><small>${fs.left <= 0 ? 'Bugünlük bitti' : fs.wait > 0 ? Math.ceil(fs.wait / 60000) + ' dk sonra' : 'Bugün ' + fs.left + ' hak'}</small></div></button>`;
    if (!SAVE.starter) html += `<button class="item wide deal" data-buy="${STARTER.id}"><div class="pv">${toySVG(SKINS.find((s) => s.id === STARTER.skin))}</div><div class="nm">Başlangıç Paketi<small>${fmtN(STARTER.fe)} tüy + Gece kostümü · tek sefer</small></div><div class="pr buy">${priceOf(STARTER)}</div></button>`;
    for (const p of PACKS) html += `<button class="item pack" data-buy="${p.id}">${p.tag ? `<i class="tg">${p.tag}</i>` : ''}<div class="pv fe">${'<svg viewBox="0 0 20 24"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="1.6"/></svg>'.repeat(Math.min(4, 1 + PACKS.indexOf(p)))}</div><div class="nm">${fmtN(p.fe)} tüy</div><div class="pr buy">${priceOf(p)}</div></button>`;
    html += `<button class="item wide" data-buy="${NOADS.id}" ${SAVE.noads ? 'disabled' : ''}><div class="pv big">⊘</div><div class="nm">Reklamsız<small>${SAVE.noads ? 'Satın alındı' : 'Bölüm arası reklamlar kalkar, ödüllü reklamlar isteğe bağlı kalır'}</small></div><div class="pr buy">${SAVE.noads ? '✓' : priceOf(NOADS)}</div></button>`;
    html += `<div class="note">${NATIVE ? 'Ödemeler App Store üzerinden alınır.' : 'Web sürümü: ödeme ekranı demodur, gerçek ödeme alınmaz.'}</div>`;
  }
  g.innerHTML = html;
  g.querySelectorAll('.item[data-id]').forEach((b) => b.addEventListener('click', () => shopPick(b.dataset.id)));
  g.querySelectorAll('.item[data-buy]').forEach((b) => b.addEventListener('click', () => { const id = b.dataset.buy, p = PACKS.find((q) => q.id === id) || (id === STARTER.id ? {...STARTER, title: 'Başlangıç Paketi'} : {...NOADS, title: 'Reklamsız'}); buyProduct({...p, title: p.title || fmtN(p.fe) + ' tüy'}); }));
  const ff = $('freeFe'); if (ff) ff.addEventListener('click', async () => { const r = await adRewarded(); if (r === 'rewarded') { SAVE.ads.n++; SAVE.ads.last = Date.now(); addFe(AD_CFG.freeFe, 'reklam ödülü'); renderShop(); } else toastShop('Reklam şu an yok', 'biraz sonra dene'); });
}
function shopPick(id) {
  const list = shopTab === 'skin' ? SKINS : TRAILS, it = list.find((x) => x.id === id), key = id + (shopTab === 'trail' && id === 'buz' ? '_t' : '');
  const own = it.price === 0 || SAVE.own[key];
  if (shopTab === 'skin') applySkin(id); else applyTrail(id);
  if (own) { if (shopTab === 'skin') SAVE.skin = id; else SAVE.trail = id; tryOn = null; save(); tick(); }
  else if (tryOn === id) { // second tap on a previewed item buys it
    if (SAVE.fe >= it.price) { addFe(-it.price); SAVE.own[key] = 1; if (shopTab === 'skin') SAVE.skin = id; else SAVE.trail = id; tryOn = null; save(); SFX.win(); buzz([20, 30, 20]); toastShop(it.name, 'senin oldu!'); }
    else { toastShop('Yetersiz tüy', 'bölüm bitir ya da tüy al'); shopTab = 'fe'; tryOn = null; equipAll(); }
  } else { tryOn = id; toastShop(it.name, 'denemedesin · almak için tekrar dokun'); }
  renderShop(); if (shopTab !== 'trail') return; demoTrail = 1.6;
}
let demoTrail = 0;
function openShop(tab) { state = 'shop'; shopTab = tab || 'skin'; tryOn = null; ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'homeL'].forEach((id) => show(id, false)); show('shopL', true); renderShop(); if (window.FlixAds) window.FlixAds.setScreen('menu'); }
function closeShop() { show('shopL', false); tryOn = null; equipAll(); openHome(); }
$('shopTabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; shopTab = b.dataset.t; tryOn = null; equipAll(); renderShop(); });
$('shopBack').addEventListener('click', closeShop);
equipAll(); feUI();
