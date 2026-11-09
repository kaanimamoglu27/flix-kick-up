/* Flix Fabrika native bridge (Capacitor 8).
   The game calls window.FlixNative.{buy, restore, price, haptic}.
   On the web this file does nothing and the store runs as a clearly marked demo.
   Inside the iOS / Android app it connects to:
     - cordova-plugin-purchase (CdvPurchase v13) for App Store / Google Play in-app purchases
     - @capacitor/haptics for haptics
     - @capacitor/status-bar to hide the status bar
   Ads (AdMob) are in ads.js, their ids in ads-config.js. */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const ios = Cap.getPlatform() === 'ios';
  const P = Cap.Plugins || {};

  // Product ids must match App Store Connect and Google Play Console exactly.
  const CONSUMABLE = ['fab_gems_100', 'fab_gems_300', 'fab_gems_800', 'fab_gems_2000'];
  const NON_CONSUMABLE = ['fab_starter', 'fab_noads', 'fab_vip'];

  let store = null; const pending = {}; const waiting = [];
  // products waiting for Ask to Buy approval: buy(id) answers 'pending' for them instead of ordering again
  const deferred = new Set();
  function settle(id, ok) { if (pending[id]) { pending[id](ok); delete pending[id]; } }
  // Hands an approved purchase to the game (window.__fabGrant, once per transaction id) and only then lets it be finished.
  // A transaction that arrives before the game is ready waits; unfinished transactions come back on the next launch.
  function deliver(t) {
    const grant = window.__fabGrant; if (!grant) return false;
    for (const p of t.products) { deferred.delete(p.id); grant(p.id, t.transactionId || null); settle(p.id, true); }
    return true;
  }
  let priceTimer = 0;
  // Non-consumables the store reports as owned on this launch (e.g. "No Ads" after a reinstall) are handed to the game
  // once per launch. The game also keeps them in its own save, so they work offline and before the store has loaded.
  const synced = new Set();
  function syncOwned() {
    if (!store || !window.__fabGrant) return;
    for (const id of NON_CONSUMABLE) if (!synced.has(id) && store.owned(id)) { synced.add(id); window.__fabGrant(id, null); }
  }
  function initStore() {
    if (!window.CdvPurchase) { console.warn('CdvPurchase missing'); return; }
    const {store: S, ProductType, Platform} = window.CdvPurchase;
    const platform = ios ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;
    S.register([
      ...CONSUMABLE.map(id => ({id, type: ProductType.CONSUMABLE, platform})),
      ...NON_CONSUMABLE.map(id => ({id, type: ProductType.NON_CONSUMABLE, platform}))
    ]);
    // Receipts are checked on the device. For stronger anti-cheat add a server validator (e.g. RevenueCat or iaptic) via S.validator.
    S.when()
      .approved(t => { if (deliver(t)) t.verify(); else waiting.push(t); })
      // Ask to Buy: the order is waiting for a parent; release the buy() call now, the goods come later through approved()
      .pending(t => { for (const p of t.products) { deferred.add(p.id); settle(p.id, 'pending'); } })
      .verified(r => r.finish())
      .productUpdated(() => { clearTimeout(priceTimer); priceTimer = setTimeout(() => window.dispatchEvent(new Event('flixprices')), 300); syncOwned(); })
      .receiptUpdated(syncOwned);
    S.error(e => { console.warn('store error', e); for (const id in pending) settle(id, false); });
    S.initialize([platform]);
    store = S;
  }

  // The game's buzz(ms): light taps, medium hits and purchases, heavy crashes.
  let lastHap = 0;
  function haptic(ms) {
    const H = P.Haptics; if (!H) return;
    const now = Date.now(); if (now - lastHap < 40) return; lastHap = now;
    H.impact({style: ms >= 80 ? 'HEAVY' : ms >= 25 ? 'MEDIUM' : 'LIGHT'}).catch(() => {});
  }

  window.FlixNative = {
    // resolves true (bought), false (cancelled / failed / store unavailable) or 'pending' (waiting for Ask to Buy approval)
    buy(id) {
      return new Promise(res => {
        if (deferred.has(id)) return res('pending');
        if (!store) return res(false);
        const prod = store.get(id), offer = prod && prod.getOffer();
        if (!offer) return res(false);
        if (pending[id]) return res(false);
        pending[id] = res;
        offer.order().then(err => { if (err) settle(id, false); }, () => settle(id, false));
      });
    },
    // resolves with the restored non-consumable ids ([] when there is nothing to restore); rejects when the store can't be reached
    async restore() {
      if (!store) throw new Error('store unavailable');
      const err = await store.restorePurchases();
      if (err) throw err;
      return NON_CONSUMABLE.filter(id => store.owned(id));
    },
    // localized price string from the store, e.g. "₺119,99"; null until the store has loaded
    price(id) { const p = store && store.get(id); return p && p.pricing ? p.pricing.price : null; },
    // called by the game once __fabGrant exists: delivers purchases that were approved before it loaded
    flush() { for (const t of waiting.splice(0)) if (deliver(t)) t.verify(); syncOwned(); },
    haptic
  };

  document.addEventListener('deviceready', () => { try { initStore(); } catch (e) { console.warn('store init', e); store = null; } }, false);
  if (P.StatusBar) P.StatusBar.hide().catch(() => {});
})();
