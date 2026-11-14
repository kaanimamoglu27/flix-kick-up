/* FLIX Kick Up ad service (Capacitor 8 + @capacitor-community/admob). Ids and switches: ads-config.js.
   Defines window.FlixAds only inside the iOS / Android app; in a browser or on GitHub Pages it does nothing
   (the game then uses its own FLIX toy ad), so no AdMob call can ever fail there.
   The game calls:
     FlixAds.showRewarded()     -> 'rewarded' | 'closed' | 'unavailable'  ('rewarded' only after AdMob's reward callback)
     FlixAds.showInterstitial() -> true when an ad was shown and closed; false right away when none is ready
     FlixAds.rewardedReady()    -> true when a rewarded ad is loaded
     FlixAds.setAdsRemoved(on)  -> "No Ads" bought / restored: interstitial and banner stop for good
     FlixAds.setScreen(name)    -> 'menu' | 'game' | 'over': the banner (if enabled) only shows on the menu
   Every call resolves and never throws; a full-screen ad resolves only after it is closed. */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const A = Cap.Plugins && Cap.Plugins.AdMob;
  if (!A) { console.warn('AdMob plugin missing'); return; }
  const CFG = window.FLIX_ADS_CONFIG || {};
  const ios = Cap.getPlatform() === 'ios';

  // Google's public test ad units (https://developers.google.com/admob/ios/test-ads)
  const TEST = ios
    ? {REWARDED: 'ca-app-pub-3940256099942544/1712485313', INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910', BANNER: 'ca-app-pub-3940256099942544/2435281174'}
    : {REWARDED: 'ca-app-pub-3940256099942544/5224354917', INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', BANNER: 'ca-app-pub-3940256099942544/9214589741'};
  const UNIT = /^ca-app-pub-\d{16}\/\d{10}$/;
  function unit(kind) {
    const real = ((CFG.ids || {})[(ios ? 'IOS_' : 'ANDROID_') + kind] || '').trim();
    const test = CFG.forceTestAds === true || !UNIT.test(real);
    return {adId: test ? TEST[kind] : real, isTesting: test};
  }
  const units = {rewarded: unit('REWARDED'), inter: unit('INTERSTITIAL'), banner: unit('BANNER')};

  const EXPIRE_MS = 50 * 60 * 1000;      // AdMob full-screen ads expire after an hour; reload a bit before
  const RETRY_MS = [5000, 15000, 30000, 60000, 120000, 300000];  // backoff after a failed load
  const SHOW_GUARD_MS = 5 * 60 * 1000;   // a dismiss event that never comes must not freeze the game
  const fmt = {
    rewarded: {prepare: 'prepareRewardVideoAd', show: 'showRewardVideoAd', ev: {dismissed: 'onRewardedVideoAdDismissed', failed: 'onRewardedVideoAdFailedToShow', reward: 'onRewardedVideoAdReward'}},
    inter: {prepare: 'prepareInterstitial', show: 'showInterstitial', ev: {dismissed: 'interstitialAdDismissed', failed: 'interstitialAdFailedToShow'}}
  };
  for (const k in fmt) Object.assign(fmt[k], {state: 'idle', loadedAt: 0, p: null, fails: 0, timer: 0});

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let started = false, canRequest = true, removed = false, showing = false, screen = 'menu', bannerOn = false, bannerMade = false;
  const startedP = init();

  // iOS silently ignores the tracking request while the app is still launching (not yet "active"): no question
  // appears and the status stays notDetermined. ads.js runs in <head> during launch, so wait until the page has
  // loaded, is on screen, and a moment has passed.
  function whenActive() {
    return new Promise((resolve) => {
      const go = () => {
        if (document.readyState !== 'complete') { window.addEventListener('load', go, {once: true}); return; }
        if (document.visibilityState !== 'visible') { document.addEventListener('visibilitychange', go, {once: true}); return; }
        setTimeout(resolve, 1000);
      };
      go();
    });
  }
  function trackingStatus() { return A.trackingAuthorizationStatus().then((t) => t && t.status, () => null); }
  // Apple's "Allow tracking?" question. Asked BEFORE AdMob starts, so no ad SDK collects anything first.
  async function askTracking() {
    for (let tries = 0; tries < 4; tries++) {
      if ((await trackingStatus()) !== 'notDetermined') return;   // answered before, or tracking turned off in Settings
      await whenActive();
      try { await A.requestTrackingAuthorization(); } catch (e) { return; }
      if ((await trackingStatus()) !== 'notDetermined') return;   // the user answered
      // the question did not show (app not active yet): try again a little later
      await sleep(1500);
    }
  }

  async function init() {
    if (ios && CFG.requestTracking) await askTracking();
    // Google's consent message (EU / UK only), after Apple's question
    try {
      let c = await A.requestConsentInfo();
      if (c && c.isConsentFormAvailable && c.status === 'REQUIRED') c = await A.showConsentForm();
      if (c && c.canRequestAds === false) canRequest = false;
    } catch (e) {}
    try {
      await A.initialize({initializeForTesting: units.rewarded.isTesting || units.inter.isTesting || (CFG.testDevices || []).length > 0, testingDevices: CFG.testDevices || []});
    } catch (e) { console.warn('admob init', e); return; }
    started = true;
    if (!canRequest) return;
    load('rewarded'); load('inter'); syncBanner();
  }

  function load(kind) {
    const f = fmt[kind];
    if (!started || !canRequest || showing) return Promise.resolve(false);
    if (kind === 'inter' && removed) return Promise.resolve(false);
    if (f.state === 'ready' && Date.now() - f.loadedAt > EXPIRE_MS) f.state = 'idle';
    if (f.state !== 'idle') return f.p;
    clearTimeout(f.timer); f.state = 'loading';
    const u = units[kind === 'inter' ? 'inter' : 'rewarded'];
    f.p = A[f.prepare]({adId: u.adId, isTesting: u.isTesting}).then(() => {
      f.state = 'ready'; f.loadedAt = Date.now(); f.fails = 0; return true;
    }, (e) => {
      f.state = 'idle';
      const wait = RETRY_MS[Math.min(f.fails++, RETRY_MS.length - 1)];
      f.timer = setTimeout(() => load(kind), wait);
      console.warn('ad load failed (' + kind + '), retry in ' + wait / 1000 + 's', e && e.message);
      return false;
    });
    return f.p;
  }

  // Presents a loaded ad and resolves after it is closed: {shown, rewarded}
  function present(kind) {
    const f = fmt[kind];
    return new Promise((resolve) => {
      let done = false, rewarded = false, guard = 0; const hs = [];
      const finish = (shown) => {
        if (done) return; done = true; clearTimeout(guard);
        for (const h of hs) { try { h.remove(); } catch (e) {} }
        showing = false; f.state = 'idle'; syncBanner();
        resolve({shown, rewarded});
        load(kind);
      };
      const listen = (ev, fn) => A.addListener(ev, fn).then((h) => { if (done) { try { h.remove(); } catch (e) {} } else hs.push(h); });
      showing = true; hideBanner();
      Promise.all([
        listen(f.ev.dismissed, () => finish(true)),
        listen(f.ev.failed, () => finish(false)),
        f.ev.reward ? listen(f.ev.reward, () => { rewarded = true; }) : null
      ]).then(() => {
        guard = setTimeout(() => finish(true), SHOW_GUARD_MS);
        // showRewardVideoAd resolves on the reward itself, showInterstitial as soon as the ad is on screen
        return A[f.show]().then((r) => { if (f.ev.reward && r) rewarded = true; });
      }).catch((e) => { console.warn('ad show failed (' + kind + ')', e && e.message); finish(false); });
    });
  }

  async function showRewarded(waitMs) {
    try {
      await Promise.race([startedP, sleep(waitMs || 0)]);
      if (!started || !canRequest || showing) return 'unavailable';
      const ok = await Promise.race([load('rewarded'), sleep(waitMs || 0).then(() => false)]);
      if (!ok || fmt.rewarded.state !== 'ready') return 'unavailable';
      const r = await present('rewarded');
      return r.rewarded ? 'rewarded' : r.shown ? 'closed' : 'unavailable';
    } catch (e) { console.warn('rewarded', e); showing = false; return 'unavailable'; }
  }

  async function showInterstitial() {
    try {
      if (removed || !started || !canRequest || showing) return false;
      const f = fmt.inter;
      if (f.state !== 'ready' || Date.now() - f.loadedAt > EXPIRE_MS) { load('inter'); return false; }  // never make the player wait
      return (await present('inter')).shown;
    } catch (e) { console.warn('interstitial', e); showing = false; return false; }
  }

  // first time a banner is requested it loads; after that it is only hidden and shown again
  function syncBanner() {
    const want = CFG.bannerEnabled && started && canRequest && !removed && !showing && screen === 'menu';
    if (want && !bannerOn) {
      bannerOn = true;
      const p = bannerMade ? A.resumeBanner() : A.showBanner({adId: units.banner.adId, isTesting: units.banner.isTesting, adSize: 'ADAPTIVE_BANNER', position: 'BOTTOM_CENTER', margin: 0});
      bannerMade = true;
      p.catch((e) => { bannerOn = bannerMade = false; console.warn('banner', e && e.message); });
    } else if (!want) hideBanner();
  }
  function hideBanner() {
    if (removed && bannerMade) { bannerOn = bannerMade = false; A.removeBanner().catch(() => {}); return; }
    if (!bannerOn) return;
    bannerOn = false; A.hideBanner().catch(() => {});
  }


  window.FlixAds = {
    showRewarded,
    showInterstitial,
    rewardedReady: () => started && canRequest && fmt.rewarded.state === 'ready',
    setAdsRemoved(on) {
      removed = !!on;
      if (removed) { clearTimeout(fmt.inter.timer); hideBanner(); }
      else { load('inter'); syncBanner(); }
    },
    setScreen(name) { screen = name; syncBanner(); }
  };
})();
