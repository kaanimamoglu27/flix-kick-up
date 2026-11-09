/* Flix Atış: the one place for AdMob ids and switches (app only; the web build never loads AdMob).
   Real ids come from AdMob (apps.admob.com > Apps > Flix Atış > App settings / Ad units).
   An id left empty (or not in the ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX form) falls back to Google's TEST ad unit,
   so a development build never shows real ads by mistake.
   Instead of editing this file you can also set the GitHub secrets ATIS_ADMOB_APP_ID, ATIS_ADMOB_REWARDED_ID,
   ATIS_ADMOB_INTERSTITIAL_ID and ATIS_ADMOB_BANNER_ID: tools/ios_setup.py writes them into the app's copy of this file.
   Ad pacing and reward amounts are game rules, they live in the game (AD_CFG in the game source, atis/kaynak/game4.js). */
window.FLIX_ADS_CONFIG = {
  // true: always Google's test ads. tools/ios_setup.py sets this in the app's copy: true for development builds
  // (./ios.sh hazirla / simulator / xcode, build check), false for release builds (./ios.sh yukle, TestFlight workflow; env ADS_MODE=real).
  forceTestAds: true,
  ids: {
    // App id, form ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX (with ~). tools/ios_setup.py puts it into Info.plist (GADApplicationIdentifier).
    IOS_APP_ID: 'ca-app-pub-9939733946730095~4563076784',
    // Ad unit ids, form ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX (with /)
    IOS_REWARDED: 'ca-app-pub-9939733946730095/6662626518',        // rewarded: +60 feathers in the shop (also 2x feathers, daily gift x2)
    IOS_REWARDED_SHOTS: 'ca-app-pub-9939733946730095/8690024054',  // rewarded: +2 shots when the 8 shots run out
    IOS_INTERSTITIAL: 'ca-app-pub-9939733946730095/4226220778',    // interstitial: after every 3rd finished level
    IOS_BANNER: '',
    ANDROID_REWARDED: '',
    ANDROID_REWARDED_SHOTS: '',
    ANDROID_INTERSTITIAL: '',
    ANDROID_BANNER: ''
  },
  // No banner in Flix Atış (Kaan, 2026-11-09). Banner at the bottom of the home screen only (never during a run, never with "No Ads"). Off: the home screen's
  // bottom buttons sit where the banner would go, so turn it on only after checking the layout on a phone.
  bannerEnabled: false,
  // Asks the iPhone's "Allow tracking?" question once (personalised ads earn more). Not required by AdMob:
  // with false the ads still work, non-personalised. If you set false, also change App Store Connect >
  // App Privacy so "Device ID" is no longer marked "used for tracking".
  requestTracking: true,
  // Device ids that always get test ads even with real ids (Xcode console prints the id on first ad request).
  testDevices: []
};
