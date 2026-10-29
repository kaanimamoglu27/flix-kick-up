/* Flix Direktör native bridge (Capacitor 8).
   app.js calls window.FlixNative.{buy, restore, price, owned, onChange, haptic}.
   On the web this file does nothing.
   Inside the iOS / Android app it connects to:
     - cordova-plugin-purchase (CdvPurchase v13) for App Store / Google Play in-app purchases
     - @capacitor/haptics for the game's vibrations
     - @capacitor/status-bar to hide the status bar */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const ios = Cap.getPlatform() === 'ios';
  const P = Cap.Plugins || {};

  // Product ids must match App Store Connect and Google Play Console exactly.
  const CONSUMABLE = ['direktor_coins_500', 'direktor_coins_1200', 'direktor_coins_2800', 'direktor_coins_6500', 'direktor_coins_15000'];
  const NON_CONSUMABLE = ['direktor_starter'];
  const SUBSCRIPTION = ['direktor_club_monthly', 'direktor_club_yearly'];

  let store = null; const pending = {}, listeners = [];
  function settle(id, ok) { if (pending[id]) { pending[id](ok); delete pending[id]; } }
  const changed = () => listeners.forEach(f => { try { f(); } catch (e) {} });
  function initStore() {
    if (!window.CdvPurchase) { console.warn('CdvPurchase missing'); return; }
    const {store: S, ProductType, Platform} = window.CdvPurchase;
    const platform = ios ? Platform.APPLE_APPSTORE : Platform.GOOGLE_PLAY;
    S.register([
      ...CONSUMABLE.map(id => ({id, type: ProductType.CONSUMABLE, platform})),
      ...NON_CONSUMABLE.map(id => ({id, type: ProductType.NON_CONSUMABLE, platform})),
      ...SUBSCRIPTION.map(id => ({id, type: ProductType.PAID_SUBSCRIPTION, platform}))
    ]);
    // Receipts are checked on the device. For stronger anti-cheat add a server validator (e.g. RevenueCat or iaptic) via S.validator.
    S.when().approved(t => t.verify()).verified(r => r.finish())
      .finished(t => { for (const p of t.products) settle(p.id, true); changed(); })
      .productUpdated(changed).receiptUpdated(changed);
    S.error(e => { console.warn('store error', e); for (const id in pending) settle(id, false); });
    S.initialize([platform]).then(changed);
    store = S;
  }

  // The game's buzz(ms) / buzz([..]): short taps light, longer patterns medium.
  let lastHap = 0;
  function haptic(ms) {
    const H = P.Haptics; if (!H) return;
    const now = Date.now(); if (now - lastHap < 40) return; lastHap = now;
    const d = Array.isArray(ms) ? ms.reduce((a, b) => a + b, 0) : ms;
    H.impact({style: d >= 80 ? 'HEAVY' : d >= 25 ? 'MEDIUM' : 'LIGHT'}).catch(() => {});
  }

  window.FlixNative = {
    buy(id) {
      return new Promise(res => {
        if (!store) return res(false);
        const prod = store.get(id), offer = prod && prod.getOffer();
        if (!offer) return res(false);
        pending[id] = res;
        offer.order().then(err => { if (err) settle(id, false); });
      });
    },
    async restore() {
      if (!store) return false;
      await store.restorePurchases(); changed(); return true;
    },
    // localized price string from the store, e.g. "₺99,99"; null until the store has loaded
    price(id) { const p = store && store.get(id); return p && p.pricing ? p.pricing.price : null; },
    // true / false once the store knows, null before that (offline or still loading)
    owned(id) { if (!store || !store.isReady) return null; return !!store.owned(id); },
    onChange(f) { listeners.push(f); },
    haptic
  };

  // iPhone web views have no navigator.vibrate; the game's vibrations go to the haptic engine instead
  try { navigator.vibrate = p => { haptic(p); return true; }; } catch (e) {}

  document.addEventListener('deviceready', initStore, false);
  if (P.StatusBar) P.StatusBar.hide().catch(() => {});
})();
