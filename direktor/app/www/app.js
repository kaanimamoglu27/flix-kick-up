/* Flix Direktör, app-only layer. Loaded after the game script, it replaces the web demo store and demo ads:
   - Flix Coin packs, Başlangıç paketi and Direktör Kulübü are real Apple purchases (native-bridge.js),
     with the store's own localized prices
   - everything that was a single TL purchase on the web (seasons, packs, outfits) is bought with Flix Coin,
     so the app has only 8 in-app products and nothing that needs restoring besides the starter pack and the club
   - no ads: the daily coin gift, sponsor money and undo work without one
   - "Satın alımları geri yükle" on the shop screen (Apple requires it) */
(function () {
  const N = window.FlixNative || null;
  const CLUB = {m: 'direktor_club_monthly', y: 'direktor_club_yearly'}, STARTER = 'direktor_starter';
  const coinId = n => 'direktor_coins_' + n;
  const month = () => new Date().toISOString().slice(0, 7);

  // single TL prices become coin prices: 500 coin ~ 29,99 TL, the smallest coin pack
  const tl = p => parseFloat(String(p).replace(/[^\d,]/g, '').replace(',', '.')) || 0;
  const toCoin = p => Math.max(100, Math.round(tl(p) * 500 / 29.99 / 50) * 50);
  const coinLbl = n => n.toLocaleString('tr-TR') + ' coin';
  for (const k in TPRICE) TPRICE[k] = '';
  PRICE.pack = coinLbl(CPRICE.legend);
  for (const A of [ACC_PRICE, OUTFIT_PRICE]) A.forEach((p, i) => { if (/TL/.test(p)) A[i] = coinLbl(toCoin(p)); });

  function productFor(title, price) {
    if (title === 'Direktör Kulübü') return /yıl/.test(price) ? CLUB.y : CLUB.m;
    if (title === 'Başlangıç paketi') return STARTER;
    const m = /^([\d.]+) Flix Coin$/.exec(title);
    return m ? coinId(m[1].replace(/\./g, '')) : null;
  }
  function giveStarter() { ENT.start = true; ENT.packs.avrupa = true; ['acc:1', 'acc:2', 'acc:3'].forEach(k => ENT.items[k] = true); }

  // store prices and what the Apple account owns
  function sync() {
    if (!N) return;
    const pm = N.price(CLUB.m), py = N.price(CLUB.y), ps = N.price(STARTER);
    if (pm) PRICE.clubM = pm; if (py) PRICE.clubY = py; if (ps) PRICE.start = ps;
    COINPK.forEach(c => { const p = N.price(coinId(c[0])); if (p) c[1] = p; });
    const m = N.owned(CLUB.m), y = N.owned(CLUB.y);
    if (m !== null) {
      const club = !!(m || y);
      if (club !== !!ENT.club) { ENT.club = club; saveEnt(); }
      // the club's monthly 1.000 coins
      if (club && store.get('fdClubM', '') !== month()) { store.set('fdClubM', month()); coinAdd(1000, 'Kulüp hediyesi'); }
    }
    if (N.owned(STARTER) && !ENT.start) { giveStarter(); saveEnt(); }
  }
  if (N) N.onChange(sync);

  function iapSheet(title, price, desc, id, onBuy) {
    const sh = document.createElement('div'); sh.className = 'sheet';
    const shown = (N && N.price(id)) ? price.replace(/^[^/]+/, N.price(id) + ' ') : price;
    sh.innerHTML = `<div class="in"><h3 class="disp">${esc(title)}</h3><div class="note">${esc(desc)}</div>
      <div class="buyp"><b>${esc(shown)}</b><small>${N ? 'Ödeme Apple hesabınla alınır.' : 'Satın alma bu cihazda kullanılamıyor.'}</small></div>
      <div class="foot"><button class="btn ghost" data-x>Vazgeç</button><button class="btn" data-ok ${N ? '' : 'disabled'}>Satın al</button></div></div>`;
    sh.onclick = e => { if (e.target === sh || e.target.closest('[data-x]')) sh.remove(); };
    const b = sh.querySelector('[data-ok]');
    b.onclick = async () => {
      b.disabled = true; b.textContent = '...';
      const ok = await N.buy(id);
      if (!ok) { b.disabled = false; b.textContent = 'Satın al'; sh.querySelector('.buyp small').textContent = 'Satın alma tamamlanmadı. Tekrar dene.'; return; }
      if (id === CLUB.m || id === CLUB.y) store.set('fdClubM', month());
      sh.remove(); onBuy(); saveEnt(); beep(880, .12); buzz([20, 30, 20]); toast('Teşekkürler');
    };
    $('#app').appendChild(sh);
  }

  buySheet = function (title, price, desc, onBuy) {
    const id = productFor(title, price);
    if (id) return iapSheet(title, price, desc, id, onBuy);
    const c = /coin/.test(price) ? parseInt(String(price).replace(/\D/g, ''), 10) : toCoin(price);
    unlockSheet({title, desc, coin: c, tl: '', onDone: onBuy});
  };

  // no ads in the app
  adShow = cb => cb();
  rewardAd = cb => cb();

  const shop0 = shopScreen;
  shopScreen = function () {
    shop0.apply(this, arguments);
    const B = $('#shopBody'); if (!B || B.querySelector('.restore')) return;
    const b = document.createElement('button'); b.className = 'lnk restore'; b.textContent = 'Satın alımları geri yükle';
    b.onclick = async () => {
      b.disabled = true; b.textContent = '...';
      const ok = N ? await N.restore() : false; sync();
      b.disabled = false; b.textContent = 'Satın alımları geri yükle'; toast(ok ? 'Tamam' : 'Olmadı');
    };
    B.appendChild(b);
  };

  // pause the sound when the app goes to the background
  document.addEventListener('visibilitychange', () => {
    try { if (typeof actx !== 'undefined' && actx) document.hidden ? actx.suspend() : actx.resume(); } catch (e) {}
  });
})();
