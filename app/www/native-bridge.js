/* FLIX Kick Up native bridge (Capacitor 8).
   The game calls window.FlixNative.{buy, restore, price, haptic, showRewardedAd, showInterstitial}.
   On the web this file does nothing and the store runs as a clearly marked demo.
   Inside the iOS / Android app it connects to:
     - cordova-plugin-purchase (CdvPurchase v13) for App Store / Google Play in-app purchases
     - @capacitor-community/admob for ads: a rewarded ad the player chooses ("keep going" / "double feathers")
       and an ad between runs every 3rd retry (not after the "No Ads" purchase)
     - @capacitor/haptics for kick and crash vibration
     - @capacitor/status-bar to hide the status bar */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const ios = Cap.getPlatform() === 'ios';
  const P = Cap.Plugins || {};

  // Product ids must match App Store Connect and Google Play Console exactly.
  const CONSUMABLE = ['kickup_feathers_500', 'kickup_feathers_1200', 'kickup_feathers_3500', 'kickup_feathers_8000', 'kickup_feathers_18000', 'kickup_feathers_50000'];
  const NON_CONSUMABLE = ['kickup_starter', 'kickup_noads'];

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

  // AdMob. These are Google's public TEST ad units; tools/ios_setup.py swaps in the real ones from the
  // ADMOB_REWARDED_ID / ADMOB_INTERSTITIAL_ID environment variables when the app is built for TestFlight.
  const AD_REWARDED = ios ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-3940256099942544/5224354917';
  const AD_INTER = ios ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-3940256099942544/1033173712';
  const isTest = (id) => id.indexOf('3940256099942544') >= 0;
  let rewardReady = null, interReady = null;
  async function initAds() {
    const A = P.AdMob; if (!A) return;
    try {
      await A.initialize({initializeForTesting: isTest(AD_REWARDED)});
      if (ios) { try { await A.requestTrackingAuthorization(); } catch (e) {} }
      try { const c = await A.requestConsentInfo(); if (c && c.isConsentFormAvailable && c.status === 'REQUIRED') await A.showConsentForm(); } catch (e) {}
      prepReward(); prepInter();
    } catch (e) { console.warn('admob init', e); }
  }
  function prepReward() { const A = P.AdMob; if (!A) return; rewardReady = A.prepareRewardVideoAd({adId: AD_REWARDED, isTesting: isTest(AD_REWARDED)}).then(() => true).catch(() => false); }
  function prepInter() { const A = P.AdMob; if (!A) return; interReady = A.prepareInterstitial({adId: AD_INTER, isTesting: isTest(AD_INTER)}).then(() => true).catch(() => false); }
  // true when the player earned the reward, or when no ad could be loaded (a missing ad never costs the player anything); false when closed early
  async function showRewardedAd() {
    const A = P.AdMob; if (!A) return true;
    if (!rewardReady) prepReward();
    const ok = await rewardReady; rewardReady = null;
    if (!ok) { prepReward(); return true; }
    let got = false; const h = await A.addListener('onRewardedVideoAdReward', () => { got = true; });
    try { const r = await A.showRewardVideoAd(); if (r) got = true; } catch (e) { got = true; }
    try { h.remove(); } catch (e) {}
    prepReward(); return got;
  }
  async function showInterstitial() {
    const A = P.AdMob; if (!A) return;
    if (!interReady) { prepInter(); return; }
    const ok = await interReady; interReady = null;
    if (ok) { try { await A.showInterstitial(); } catch (e) {} }
    prepInter();
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
    haptic,
    showRewardedAd,
    showInterstitial
  };

  document.addEventListener('deviceready', initStore, false);
  initAds();
  if (P.StatusBar) P.StatusBar.hide().catch(() => {});
})();
