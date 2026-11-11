// Flix Fabrika 1.9 — arayüz: geliştirme/eleman/dolap panelleri, mağaza, reklamlar, satın almalar, çevrimdışı kazanç
import { SFX } from './sfx.js';
import { LANG, setLang } from './i18n.js';
import { UPS, STAFF, SUPS, COS, IAP, AD, COLS, BONUS, bonusTxt, PROMO, ORDERS, spdPct } from './config.js';
import { SV, save, lv, fmt, spawnStaff, setLook, setFloor, setSound, soundOn, bumpMoney, setPaused, tutDone, profitMult, applyTiers, factoryLevel, bonusOn, bonusLeft, addBonus, setMenu, cosB, ENDGAME, setEndgame, patronLv, patronTier, onUpgrade, setWorkerLook, contract, capOf, hypeInfo } from './game.js';
import { PADS } from './config.js';

const $ = (s) => document.querySelector(s);
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
export function haptic(ms) { if (window.FlixNative && window.FlixNative.haptic) window.FlixNative.haptic(ms); }
export function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), 2400); }
const upCost = (u, l) => Math.round(u.base * Math.pow(u.mult, l));
const clock = (ms) => ms > 864e5 ? '∞' : _clock(ms);
const _clock = (ms) => Math.floor(ms / 60000) + ':' + String(Math.floor(ms / 1000) % 60).padStart(2, '0');
const mins = (ms) => { const s = Math.ceil(ms / 1000); return s >= 60 ? Math.ceil(s / 60) + ' dk' : s + ' sn'; };

// ---------------- ads ----------------
let adBusy = false;
let promoI = 0;
export const openPromo = (p) => { try { window.open(p.url, '_blank'); } catch {} };
function webAd(kind) { // web/demo: the ad slot advertises our other games (Flix Rush / Flix Kick Up)
  return new Promise((res) => { const L = $('#adL'), sec = kind === 'rewarded' ? 5 : 3; let left = sec; const pr = PROMO[promoI++ % PROMO.length]; L.style.background = pr.bg; $('#adImg').src = window['AD_' + pr.id.toUpperCase()] || ''; $('#adName').textContent = pr.name; $('#adTxt').textContent = pr.txt; $('#adGo').onclick = () => openPromo(pr);
    L.classList.add('show'); $('#adKind').textContent = kind === 'rewarded' ? 'ÖDÜLLÜ REKLAM' : 'REKLAM';
    const x = $('#adX'); x.disabled = true; x.textContent = left;
    const t = setInterval(() => { left--; if (left > 0) x.textContent = left; else { clearInterval(t); x.disabled = false; x.textContent = '✕'; } }, 1000);
    x.onclick = () => { if (x.disabled) return; L.classList.remove('show'); res(kind === 'rewarded' ? 'rewarded' : true); }; });
}
async function adRewarded() { if (adBusy) return 'busy'; adBusy = true; setPaused(true); SFX.suspend(true);
  try { return window.FlixAds ? await window.FlixAds.showRewarded(4000) : await webAd('rewarded'); } finally { adBusy = false; setPaused(false); SFX.suspend(false); } }
async function adInter() { if (SV.noads || SV.vip || adBusy) return false; adBusy = true; setPaused(true); SFX.suspend(true);
  try { return window.FlixAds ? await window.FlixAds.showInterstitial() : await webAd('inter'); } finally { adBusy = false; setPaused(false); SFX.suspend(false); } }
// ara reklam: eğitimden sonra, en sık AD.interEveryMin dakikada bir, sadece doğal molalarda (panel kapanınca, alan açılınca)
export function maybeInter() { if (!tutDone() || SV.noads || SV.vip || panelOpen()) return; const now = Date.now(); if (!SV.lastInter) { SV.lastInter = now; return; } if (now - SV.lastInter < AD.interEveryMin * 60000) return; SV.lastInter = now; save(); adInter(); }
function gemAdState() { const d = new Date().toDateString(); if (SV.ads.day !== d) { SV.ads.day = d; SV.ads.n = 0; } return { left: AD.gemAdsPerDay - SV.ads.n, wait: Math.max(0, SV.ads.last + AD.gemAdCooldownMin * 60000 - Date.now()) }; }
const freeUpWait = () => Math.max(0, SV.freeUpLast + AD.freeUpCooldownMin * 60000 - Date.now());

// ---------------- purchases ----------------
function grant(id, txn) {
  if (txn) { if (SV.txn.includes(txn)) return; SV.txn.push(txn); if (SV.txn.length > 60) SV.txn.shift(); }
  const p = IAP.find(q => q.id === id); if (!p) return;
  if (p.kind === 'gems') { SV.gems += p.n; toast('+' + p.n + ' 💎 eklendi'); }
  else if (p.kind === 'noads') { if (SV.noads) return; SV.noads = 1; toast('Reklamlar kapandı, teşekkürler!'); }
  else if (p.kind === 'vip') { if (SV.vip) return; SV.vip = 1; SV.noads = 1; toast('VIP Fabrika: satışlar 2 kat!'); }
  else if (p.kind === 'starter') { if (SV.starter) return; SV.starter = 1; SV.gems += 150; SV.money += 2000; if (!SV.cos.own.includes('altin')) SV.cos.own.push('altin'); toast('Başlangıç paketi eklendi!'); bumpMoney(); }
  if (window.FlixAds && (SV.noads || SV.vip)) window.FlixAds.setAdsRemoved(true);
  SFX.milestone(); save(); refreshHUD(); if (cur === 'shop') render();
}
const priceOf = (p) => (window.FlixNative && window.FlixNative.price(p.id)) || p.price;
async function buy(p) {
  if (NATIVE && window.FlixNative) { const r = await window.FlixNative.buy(p.id); if (r === 'pending') toast('Onay bekleniyor, gelince eklenecek'); else if (!r) toast('Satın alma tamamlanmadı'); return; }
  // web: gerçek ödeme yok, açıkça demo
  confirmBox(`<b>${p.name}</b><br><small>Bu web sürümünde gerçek ödeme yok. Demo olarak eklensin mi?</small>`, 'Demo olarak al', () => grant(p.id, 'web-' + Date.now()));
}
window.addEventListener('flixprices', () => { if (cur === 'shop') render(); });

// ---------------- panels ----------------
let cur = null, tab = {};
export const panelOpen = () => !!cur;
export function openPanel(kind) { cur = kind; $('#sheet').classList.add('show'); document.body.classList.add('panel'); render(); SFX.click(); }
export function closePanel() { if (!cur) return; const was = cur; cur = null; $('#sheet').classList.remove('show'); document.body.classList.remove('panel'); if (was !== 'shop') setTimeout(maybeInter, 400); }
function row({ icon, name, desc, lvl, btn, btnCls = '', act, ad, adAct, dis }) {
  return `<div class="row"><div class="ic">${icon}</div><div class="mid"><b>${name}${lvl ? ` <em>${lvl}</em>` : ''}</b><span>${desc}</span></div>${ad ? `<button class="ad" data-a="${adAct}">▶<small>${ad}</small></button>` : ''}<button class="buy ${btnCls}" data-a="${act}" ${dis ? 'disabled' : ''}>${btn}</button></div>`;
}
const money = (n) => '₺' + fmt(n);

// ---- How to play: 6 illustrated steps (pictures are real game shots, one set per language) ----
const HOWTO = {
  tr: [['Tüy topla', 'Hindinin yanındaki tüy sandığına yürü, tüyler sırtına dizilir. Sandığa her yönden yaklaşabilirsin.'],
    ['Taban al', 'Makine (sonra Büyük Pres) FLIX tabanı basar. Yanına git, tabanları sırtına al.'],
    ['Montaj masası', 'Tüy ve tabanı masanın önündeki halkaya bırak. Robot kol FLIX\'i kurar, biteni masanın yanından al.'],
    ['Test et', 'FLIX\'leri oyun parkına bırak. Çocuklar sektirip test eder, sağlam olanlar satışa hazır.'],
    ['Sat ve parayı topla', 'Test edilmiş FLIX\'leri satış tezgahına koy, müşteriler alır. Biriken paranın üstünden geç, cebine girer.'],
    ['Fabrikayı büyüt', 'Kesik çizgili alanın içinde dur, para akar ve yeni hindi, makine ya da bölüm açılır. Üstteki hedef çubuğu sıradaki işi gösterir.']],
  en: [['Collect feathers', 'Walk to the feather crate next to the turkey and the feathers stack on your back. You can reach the crate from any side.'],
    ['Pick up bases', 'The machine (later the Big Press) makes FLIX bases. Walk up to it and pick them up.'],
    ['Assembly table', 'Drop feathers and bases in the ring in front of the table. The robot arm builds a FLIX; pick it up next to the table.'],
    ['Test', 'Drop the FLIX at the playground. Kids kick them to test them, and the good ones are ready to sell.'],
    ['Sell and collect cash', 'Put tested FLIX on the shop counter and customers buy them. Walk over the cash pile to collect it.'],
    ['Grow your factory', 'Stand inside a dashed square: money flows in and a new turkey, machine or hall opens. The goal bar at the top shows the next job.']]
};
const HOWTIP = { tr: ['💡 İpuçları', 'Ofiste geliştirme al, İK\'dan eleman işe al: onlar senin yerine taşır.', '⚡ Bonus kutuları kısa süre 2 kat kazanç ya da hız verir.', 'Oyunda değilken de fabrika bir süre para kazanır.'],
  en: ['💡 Tips', 'Buy upgrades in the office and hire crew at HR: they carry for you.', '⚡ Boost crates give double cash or speed for a short time.', 'Your factory keeps earning for a while when you are away.'] };
function howHTML() { const L = LANG === 'en' ? 'en' : 'tr', im = window['HOWTO_' + L.toUpperCase()] || [];
  let h = '<div class="howto" translate="no">'; HOWTO[L].forEach(([t, d], i) => { h += `<div class="hw">${im[i] ? `<img src="${im[i]}" alt="">` : ''}<div><b><em>${i + 1}</em>${t}</b><span>${d}</span></div></div>`; });
  const tp = HOWTIP[L]; h += `<div class="hwt"><b>${tp[0]}</b>${tp.slice(1).map(x => `<span>• ${x}</span>`).join('')}</div></div>`; return h; }
function render() {
  const T = $('#shT'), B = $('#shBody'), TB = $('#shTabs'); TB.innerHTML = ''; let h = '';
  const fw = freeUpWait(); const adLbl = fw > 0 ? mins(fw) : 'Ücretsiz';
  if (cur === 'ofis') {
    T.textContent = 'Ofis'; const t = tab.ofis || 'Patron'; TB.innerHTML = ['Patron', 'Fabrika'].map(k => `<button class="tb ${t === k ? 'on' : ''}" data-t="${k}">${k}</button>`).join('');
    const pt = patronTier(), cb = cosB(), up = Object.values(SV.up).reduce((a, b) => a + (b || 0), 0);
    h += `<div class="pcard"><div class="pt" style="--pc:#${pt[1].toString(16).padStart(6, '0')}"><small>${pt[2].toLocaleUpperCase('tr-TR')}</small><b>${patronLv()}</b><small>PATRON SV</small></div><div class="ps"><span>👟 <b>+${spdPct(lv('spd')) + Math.round(cb.spd * 100)}%</b> hız</span><span>📦 <b>${capOf()}</b> taşıma</span><span>💰 <b>x${profitMult().toFixed(2).replace('.', ',')}</b> kâr</span><span>📈 <b>₺${fmt(SV.ipm || 0)}</b>/dk</span><span>🏆 <b>${Math.min(12, Math.floor(up / 6))}</b>/12 kupa</span><span>📋 <b>${SV.ctDone || 0}</b> sipariş</span></div></div>`;
    for (const u of UPS.filter(u => u.grp === t && (!u.need || SV.unl.includes(u.need)))) { const l = lv(u.id), max = l >= u.max, c = upCost(u, l);
      h += row({ icon: u.icon, name: u.name, lvl: 'Sv ' + (l + 1) + (u.max === Infinity ? ' · ∞' : ''), desc: max ? u.desc(l) + ' · en üst seviye' : u.desc(l) + ' → ' + u.desc(l + 1), btn: max ? 'TAMAM' : money(c), btnCls: max ? 'max' : SV.money >= c ? '' : 'no', act: 'up:' + u.id, dis: max, ad: max ? null : adLbl, adAct: 'adup:' + u.id }); }
    h += '<p class="note">Kâr, Reklam ve Sipariş primi sınırsız yükselir. Her 6 seviyede ofis rafına bir kupa gelir.</p>';
  } else if (cur === 'ik') {
    T.textContent = 'İşe alım';
    for (const s of STAFF) { const n = SV.staff[s.id], max = n >= s.max, c = max ? 0 : s.costs[n];
      h += row({ icon: s.icon, name: s.name, lvl: n + '/' + s.max, desc: s.desc, btn: max ? 'TAMAM' : 'İşe al ' + money(c), btnCls: max ? 'max' : SV.money >= c ? '' : 'no', act: 'hire:' + s.id, dis: max }); }
    for (const u of SUPS) { const l = lv(u.id), max = l >= u.max, c = upCost(u, l);
      h += row({ icon: u.icon, name: u.name, lvl: 'Sv ' + (l + 1), desc: max ? u.desc(l) : u.desc(l) + ' → ' + u.desc(l + 1), btn: max ? 'TAMAM' : money(c), btnCls: max ? 'max' : SV.money >= c ? '' : 'no', act: 'up:' + u.id, dis: max || !SV.staff.tas, ad: max || !SV.staff.tas ? null : adLbl, adAct: 'adup:' + u.id }); }
    if (!SV.staff.tas) h += '<p class="note">Eleman geliştirmeleri ilk taşıyıcıyı alınca açılır.</p>';
  } else if (cur === 'dolap') {
    T.textContent = 'Dolap'; const t = tab.dolap || 'skin'; const names = { skin: 'Kostüm', acc: 'Aksesuar', floor: 'Zemin', wskin: 'Eleman', wacc: 'E. şapka' };
    TB.innerHTML = Object.keys(names).map(k => `<button class="tb ${t === k ? 'on' : ''}" data-t="${k}">${names[k]}</button>`).join('');
    for (const c of COS[t]) { const own = SV.cos.own.includes(c.id), on = SV.cos[t] === c.id; const sw = t === 'floor' ? (c.wood ? 'linear-gradient(90deg,#c98a4e,#e0a86a)' : c.marble ? 'linear-gradient(135deg,#f4f4f6,#d8d8e2 50%,#f4f4f6)' : c.hazard ? 'repeating-linear-gradient(45deg,#ffc20e 0 8px,#22262e 8px 16px)' : c.stars ? 'radial-gradient(circle at 30% 30%,#fff 0 2px,transparent 3px),radial-gradient(circle at 70% 60%,#bcd 0 2px,transparent 3px),#151b3e' : c.rainbow ? 'linear-gradient(90deg,#f88,#fd8,#8f8,#8df,#d8f)' : `linear-gradient(135deg,${c.a} 50%,${c.b2} 50%)`) : null;
      const icon = t === 'floor' ? `<i class="sw" style="background:${sw}"></i>` : t === 'skin' || t === 'wskin' ? `<i class="sw" style="background:${c.sw}"></i>` : c.ic;
      const price = c.gem ? c.gem + ' 💎' : 'Ücretsiz'; const can = c.gem ? SV.gems >= c.gem : true; const bt = bonusTxt(c.b || {});
      h += row({ icon, name: c.name, desc: (bt ? `<i class="bon">${bt}</i>` : '<i class="bon off">Bonus yok</i>') + (own ? (on ? ' Giyili' : ' Senin') : ''), btn: on ? 'GİYİLİ' : own ? 'GİY' : price, btnCls: on ? 'max' : own ? 'alt' : can ? 'gem' : 'no', act: 'cos:' + t + ':' + c.id, dis: on }); }
    const cb = cosB(); h += `<p class="note">${t[0] === 'w' ? 'Tüm taşıyıcılar bunu giyer. ' : ''}Giydiklerinden gelen toplam bonus: <b>${bonusTxt(cb) || 'yok'}</b></p>`;
  } else if (cur === 'bonus') {
    T.textContent = 'Bonuslar';
    for (const b of BONUS) { const left = bonusLeft(b.id);
      h += `<div class="row bonus ${left ? 'act' : ''}" style="--bc:${b.col}"><div class="ic">${b.icon}</div><div class="mid"><b>${b.name}<em class="on" data-bl="${b.id}" ${left ? '' : 'hidden'}>${clock(left)}</em></b><span>${b.desc} · ${b.min} dk</span></div><button class="ad" data-a="bad:${b.id}">▶<small>Reklam</small></button><button class="buy gem" data-a="bgem:${b.id}">${b.gem} 💎</button></div>`; }
    h += '<p class="note">Bonuslar üst üste eklenir. Elmasları mağazadan alabilirsin.</p>';
  } else if (cur === 'howto') {
    T.textContent = LANG === 'en' ? 'How to play' : 'Nasıl oynanır'; h += howHTML();
  } else if (cur === 'menu') {
    T.textContent = 'Ayarlar';
    h += `<div class="set col"><button data-a="howto">❓ ${LANG === 'en' ? 'How to play' : 'Nasıl oynanır'}</button><button data-a="snd">${soundOn() ? '🔊 Ses açık' : '🔇 Ses kapalı'}</button><button data-a="lang">🌐 ${LANG === 'tr' ? 'Dil: Türkçe → English' : 'Language: English → TR'}</button><button data-a="home">🏠 Ana menüye dön</button>${NATIVE ? '' : `<button data-a="endg">${ENDGAME ? '↩ Normal oyuna dön' : '🧪 Endgame modu (test)'}</button>`}${NATIVE ? '<button data-a="restore">Satın alımları geri yükle</button>' : ''}<button data-flixlegal="legal">📜 Yasal Bilgiler</button><button data-flixlegal="about">ℹ️ Hakkında</button></div><p class="note">Flix Fabrika · FLIX TOYS</p>`;
  } else if (cur === 'shop') {
    T.textContent = 'Mağaza'; const g = gemAdState();
    h += `<div class="row free"><div class="ic">▶</div><div class="mid"><b>Reklam izle: +${AD.gemsPerAd} 💎</b><span>${g.left <= 0 ? 'Bugünlük bitti' : g.wait > 0 ? mins(g.wait) + ' sonra' : 'Bugün ' + g.left + ' hak'}</span></div><button class="buy" data-a="adgem" ${g.left <= 0 || g.wait > 0 ? 'disabled' : ''}>İZLE</button></div>`;
    for (const p of IAP) { const owned = p.once && SV[p.kind]; if (p.kind === 'noads' && SV.vip) continue;
      h += `<div class="row ${p.tag ? 'hot' : ''}"><div class="ic">${p.kind === 'gems' ? '💎' : p.kind === 'noads' ? '🚫' : p.kind === 'vip' ? '⭐' : '🎁'}</div><div class="mid"><b>${p.name}${p.tag ? ` <em>${p.tag}</em>` : ''}</b><span>${p.desc || 'Bonuslu kostümler ve süreli bonuslar için'}</span></div><button class="buy ${owned ? 'max' : 'iap'}" data-a="iap:${p.id}" ${owned ? 'disabled' : ''}>${owned ? 'ALINDI' : priceOf(p)}</button></div>`; }
    h += `<div class="promo"><b>DİĞER FLIX OYUNLARI</b><div>${PROMO.map(p => `<button data-a="promo:${p.id}" style="background:${p.bg}"><img src="${window['AD_' + p.id.toUpperCase()] || ''}" alt=""><span><b>${p.name}</b><small>${p.txt}</small></span></button>`).join('')}</div></div>`;
    h += `<div class="set"><button data-a="snd">${soundOn() ? '🔊 Ses açık' : '🔇 Ses kapalı'}</button>${NATIVE ? '<button data-a="restore">Satın alımları geri yükle</button>' : '<span>Web sürümü: ödemeler demo</span>'}</div>`;
  }
  B.innerHTML = h;
}
async function onAct(a) {
  const [k, x, y] = a.split(':');
  if (k === 'up') { const u = UPS.concat(SUPS).find(q => q.id === x), l = lv(x), c = upCost(u, l); if (l >= u.max) return; if (SV.money < c) { toast('Para yetmiyor'); SFX.nope && SFX.nope(); return; } SV.money -= c; SV.up[x] = l + 1; SFX.buy(); haptic(25); save(); applyTiers(); onUpgrade(); }
  else if (k === 'adup') { if (freeUpWait() > 0) { toast('Biraz bekle: ' + mins(freeUpWait())); return; } const u = UPS.concat(SUPS).find(q => q.id === x); if (lv(x) >= u.max) return; const r = await adRewarded(); if (r === 'rewarded') { SV.up[x] = lv(x) + 1; SV.freeUpLast = Date.now(); applyTiers(); onUpgrade(); SFX.milestone(); toast(u.name + ' ücretsiz yükseldi!'); save(); } else if (r !== 'busy') toast('Reklam şu an yok, biraz sonra dene'); }
  else if (k === 'hire') { const s = STAFF.find(q => q.id === x), n = SV.staff[x]; if (n >= s.max) return; const c = s.costs[n]; if (SV.money < c) { toast('Para yetmiyor'); return; } SV.money -= c; SV.staff[x] = n + 1; spawnStaff(); SFX.milestone(); haptic(40); toast(s.name + ' işe başladı!'); save(); }
  else if (k === 'cos') { const c = COS[x].find(q => q.id === y); if (!SV.cos.own.includes(y)) { if (c.gem) { if (SV.gems < c.gem) { toast('Elmas yetmiyor, mağazaya bak'); openPanel('shop'); return; } SV.gems -= c.gem; } SV.cos.own.push(y); SFX.milestone(); toast(c.name + ' alındı' + (bonusTxt(c.b || {}) ? ': ' + bonusTxt(c.b) : '')); }
    SV.cos[x] = y; if (x === 'floor') setFloor(y); else if (x[0] === 'w') setWorkerLook(); else setLook(); SFX.buy(); save(); }
  else if (k === 'adgem') { const r = await adRewarded(); if (r === 'rewarded') { SV.ads.n++; SV.ads.last = Date.now(); SV.gems += AD.gemsPerAd; toast('+' + AD.gemsPerAd + ' 💎'); SFX.coin(); save(); } else if (r !== 'busy') toast('Reklam şu an yok, biraz sonra dene'); }
  else if (k === 'iap') { const p = IAP.find(q => q.id === x); await buy(p); }
  else if (k === 'snd') setSound(!soundOn());
  else if (k === 'howto') { openPanel('howto'); return; }
  else if (k === 'lang') { save(); setLang(LANG === 'tr' ? 'en' : 'tr'); return; }
  else if (k === 'promo') { openPromo(PROMO.find(p => p.id === x)); return; }
  else if (k === 'bad') { const b = BONUS.find(q => q.id === x); const r = await adRewarded(); if (r === 'rewarded') { addBonus(x, b.min); SFX.milestone(); toast(b.name + ' · ' + b.min + ' dakika!'); } else if (r !== 'busy') toast('Reklam şu an yok, biraz sonra dene'); }
  else if (k === 'bgem') { const b = BONUS.find(q => q.id === x); if (SV.gems < b.gem) { toast('Elmas yetmiyor'); openPanel('shop'); return; } SV.gems -= b.gem; addBonus(x, b.min); SFX.milestone(); toast(b.name + ' · ' + b.min + ' dakika!'); }
  else if (k === 'endg') { if (NATIVE) return; confirmBox(ENDGAME ? '<b>Normal oyuna dönülsün mü?</b><br><small>Endgame kaydı saklanır.</small>' : '<b>Endgame test modu</b><br><small>Her şey açık, geliştirmeler orta seviyede, sakin tempo. Normal kaydın ayrı saklanır.</small>', ENDGAME ? 'Normal oyuna dön' : 'Endgame modunu aç', () => setEndgame(!ENDGAME)); return; }
  else if (k === 'home') { closePanel(); showMenu(true); return; }
  else if (k === 'restore') { try { const ids = await window.FlixNative.restore(); toast(ids.length ? 'Satın alımlar geri yüklendi' : 'Geri yüklenecek satın alım yok'); } catch { toast('Mağazaya ulaşılamadı'); } }
  refreshHUD(); if (cur) render();
}

// ---------------- HUD ----------------
export function refreshHUD() {
  $('#gems b').textContent = fmt(SV.gems);
  const act = BONUS.filter(q => bonusOn(q.id)); $('#bon').innerHTML = act.map(q => { const l = bonusLeft(q.id); return `<span style="--bc:${q.col}">${q.icon}${l > 864e5 ? '' : `<b>${clock(l)}</b>`}</span>`; }).join('') + (() => { const h = hypeInfo(); return h ? `<span style="--bc:#ff5ad1">🔥+${Math.round(h.p / 2)}%<b>${Math.ceil(h.t)}s</b></span>` : ''; })();
  $('#boostB').classList.toggle('on', act.length > 0); $('#boostB small').textContent = act.length ? act.length + ' aktif' : 'Bonus';
  for (const id of ['#boostB', '#shopB', '#menuB']) $(id).style.display = tutDone() ? '' : 'none';
  document.querySelectorAll('[data-bl]').forEach(e => { const l = bonusLeft(e.dataset.bl); e.hidden = !l; e.textContent = clock(l); e.closest('.row').classList.toggle('act', !!l); });
  $('#vipTag').style.display = SV.vip ? '' : 'none'; $('#vipTag').textContent = ENDGAME ? 'ENDGAME · TEST' : 'VIP · 2x';
  const fl = factoryLevel(), tot = PADS.length + 1; $('#lvl').innerHTML = 'Fabrika Sv ' + fl + ' <i><u style="width:' + Math.round(fl / tot * 100) + '%"></u></i>'; $('#lvl').style.display = tutDone() ? '' : 'none';
  const pt = patronTier(); $('#pat').innerHTML = `<i style="background:#${pt[1].toString(16).padStart(6, '0')}"></i>${pt[2]} · Sv ${patronLv()}`; $('#pat').style.display = tutDone() ? '' : 'none';
  const c = contract(); const ce = $('#ct'); if (c && tutDone()) { const h = `<small>SİPARİŞ</small><b><i style="background:${COLS[c.col].f}"></i>${COLS[c.col].n} FLIX ${c.got}/${c.n}</b><u><s style="width:${Math.round(c.got / c.n * 100)}%"></s></u><em>₺${fmt(c.rw)} · +${c.gem}💎</em>`; if (ce.dataset.h !== h) { ce.innerHTML = h; ce.dataset.h = h; } ce.style.display = ''; } else ce.style.display = 'none';
}
function confirmBox(html, okTxt, ok, alt) {
  const M = $('#modal'); $('#mBody').innerHTML = html; const b = $('#mOk'), b2 = $('#mAlt'); b.textContent = okTxt; b2.style.display = alt ? '' : 'none'; if (alt) b2.innerHTML = alt.txt;
  M.classList.add('show'); setPaused(true);
  const close = () => { M.classList.remove('show'); setPaused(false); };
  b.onclick = () => { close(); ok && ok(); }; b2.onclick = () => { close(); alt && alt.fn(); }; $('#mX').onclick = close;
}
// oyun alanında beliren reklam kutusu: üstüne basınca 'reklam izle, boost al' kartı
export function boostOffer(id, cb) { const b = BONUS.find(q => q.id === id); let done = false; const fin = (ok) => { if (done) return; done = true; cb(ok); };
  confirmBox(`<div style="font-size:44px;line-height:1">📺</div><b>Reklam izle, boost al!</b><br><span style="font-size:26px">${b.icon}</span> <b>${b.name}</b> · ${b.min} dakika<br><small>${b.desc}</small>`, 'Hayır', () => fin(false), { txt: '▶ İzle', fn: async () => { const r = await adRewarded(); if (r === 'rewarded') { addBonus(id, b.min); SFX.milestone(); toast(b.icon + ' ' + b.name + ' · ' + b.min + ' dakika!'); fin(true); } else { if (r !== 'busy') toast('Reklam şu an yok, biraz sonra dene'); fin(false); } } });
  const x = $('#mX'), old = x.onclick; x.onclick = () => { old && old(); fin(false); }; }
// çevrimdışı kazanç: eleman ya da kasiyer varsa
export function offlinePopup() {
  if (!SV.lastSeen || !(SV.staff.tas || SV.staff.kas)) return; const away = Math.min(AD.offlineCapMin, (Date.now() - SV.lastSeen) / 60000); if (away < 2) return;
  const earn = Math.round(Math.max(20, SV.ipm) * AD.offlineShare * away * (SV.vip ? 2 : 1)); if (earn < 10) return;
  confirmBox(`<div class="big">💤</div><b>Sen yokken elemanların çalıştı</b><br><small>${Math.round(away)} dakika · fabrika kazancı</small><div class="amt">₺${fmt(earn)}</div>`, 'Al', () => { SV.money += earn; bumpMoney(); save(); },
    { txt: '▶ 2 katı al', fn: async () => { const r = await adRewarded(); SV.money += r === 'rewarded' ? earn * 2 : earn; bumpMoney(); save(); toast(r === 'rewarded' ? '2 kat kazanç alındı!' : 'Kazanç alındı'); } });
}
export function showMenu(on) { document.body.classList.toggle('menu', on); setMenu(on); if (on) { closePanel(); $('#mmLv').textContent = 'Fabrika Sv ' + factoryLevel(); $('#mmMoney').textContent = '₺' + fmt(SV.money); $('#mmGems').textContent = fmt(SV.gems) + ' 💎'; $('#mmEnd').style.display = ENDGAME ? '' : 'none'; $('#mmPlay b').textContent = SV.tut ? 'DEVAM' : 'OYNA'; } if (window.FlixAds) window.FlixAds.setScreen(on ? 'menu' : 'game'); }
export function initUI() {
  $('#sheet').addEventListener('click', (e) => { const t = e.target.closest('[data-t]'); if (t) { tab[cur] = t.dataset.t; render(); return; } const b = e.target.closest('[data-a]'); if (b && !b.disabled) onAct(b.dataset.a); });
  $('#shX').onclick = () => closePanel();
  $('#shopB').onclick = () => { SFX.unlock(); if (cur === 'shop') closePanel(); else openPanel('shop'); };
  $('#boostB').onclick = () => { SFX.unlock(); if (cur === 'bonus') closePanel(); else openPanel('bonus'); };
  $('#menuB').onclick = () => { SFX.unlock(); if (cur === 'menu') closePanel(); else openPanel('menu'); };
  $('#mmLang').onclick = () => { save(); setLang(LANG === 'tr' ? 'en' : 'tr'); };
  $('#mmLang small').textContent = LANG === 'tr' ? 'ENGLISH' : 'TÜRKÇE';
  $('#mmPlay').onclick = () => { SFX.unlock(); showMenu(false); };
  $('#mmEnd').onclick = () => openPanel('menu');
  document.querySelectorAll('#mm [data-p]').forEach(b => b.onclick = () => { SFX.unlock(); openPanel(b.dataset.p); });
  $('#mmPromo').innerHTML = PROMO.map(p => `<button data-g="${p.id}" style="background:${p.bg}"><img src="${window['AD_' + p.id.toUpperCase()] || ''}" alt=""><span><b>${p.name}</b><small>${p.id === 'rush' ? 'App Store' : 'Oyna'}</small></span></button>`).join('');
  document.querySelectorAll('#mmPromo [data-g]').forEach(b => b.onclick = () => openPromo(PROMO.find(p => p.id === b.dataset.g)));
  showMenu(true);
  window.__fabGrant = grant; if (window.FlixNative && window.FlixNative.flush) setTimeout(() => window.FlixNative.flush(), 0);
  if (window.FlixAds) { window.FlixAds.setScreen('game'); if (SV.noads || SV.vip) window.FlixAds.setAdsRemoved(true); }
  refreshHUD();
}
