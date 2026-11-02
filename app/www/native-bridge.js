/* FLIX Kick Up native bridge (Capacitor 8).
   The game calls window.FlixNative.{buy, restore, price, haptic}.
   On the web this file does nothing and the store runs as a clearly marked demo.
   Inside the iOS / Android app it connects to:
     - cordova-plugin-purchase (CdvPurchase v13) for App Store / Google Play in-app purchases
     - @capacitor/haptics for kick and crash vibration
     - @capacitor/status-bar to hide the status bar */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const ios = Cap.getPlatform() === 'ios';
  const P = Cap.Plugins || {};

  // Product ids must match App Store Connect and Google Play Console exactly.
  const CONSUMABLE = ['kickup_feathers_500', 'kickup_feathers_1200', 'kickup_feathers_3500', 'kickup_feathers_8000', 'kickup_feathers_18000', 'kickup_feathers_50000'];
  const NON_CONSUMABLE = ['kickup_starter'];

  let store = null; const pending = {}; const waiting = [];
  function settle(id, ok) { if (pending[id]) { pending[id](ok); delete pending[id]; } }
  // Hands an approved purchase to the game (window.__fkuGrant, once per transaction id) and only then lets it be finished.
  // A transaction that arrives before the game is ready waits; unfinished transactions come back on the next launch.
  function deliver(t) {
    const grant = window.__fkuGrant; if (!grant) return false;
    for (const p of t.products) { grant(p.id, t.transactionId || null); settle(p.id, true); }
    return true;
  }
  let priceTimer = 0;
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
      .verified(r => r.finish())
      .productUpdated(() => { clearTimeout(priceTimer); priceTimer = setTimeout(() => window.dispatchEvent(new Event('flixprices')), 300); });
    S.error(e => { console.warn('store error', e); for (const id in pending) settle(id, false); });
    S.initialize([platform]);
    store = S;
  }

  // The game's buzz(ms): kicks are light, tricks and purchases medium, a crash heavy.
  let lastHap = 0;
  function haptic(ms) {
    const H = P.Haptics; if (!H) return;
    const now = Date.now(); if (now - lastHap < 40) return; lastHap = now;
    H.impact({style: ms >= 80 ? 'HEAVY' : ms >= 25 ? 'MEDIUM' : 'LIGHT'}).catch(() => {});
  }

  window.FlixNative = {
    buy(id) {
      return new Promise(res => {
        if (!store) return res(false);
        const prod = store.get(id), offer = prod && prod.getOffer();
        if (!offer) return res(false);
        if (pending[id]) return res(false);
        pending[id] = res;
        offer.order().then(err => { if (err) settle(id, false); }, () => settle(id, false));
      });
    },
    async restore() {
      if (!store) return [];
      await store.restorePurchases();
      return NON_CONSUMABLE.filter(id => store.get(id) && store.get(id).owned);
    },
    // localized price string from the store, e.g. "₺119,99"; null until the store has loaded
    price(id) { const p = store && store.get(id); return p && p.pricing ? p.pricing.price : null; },
    // called by the game once __fkuGrant exists: delivers purchases that were approved before it loaded
    flush() { for (const t of waiting.splice(0)) if (deliver(t)) t.verify(); },
    haptic
  };

  document.addEventListener('deviceready', initStore, false);
  if (P.StatusBar) P.StatusBar.hide().catch(() => {});
})();
