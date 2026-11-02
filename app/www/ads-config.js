/* FLIX Kick Up: the one place for AdMob ids and switches (app only; the web build never loads AdMob).
   Real ids come from AdMob (apps.admob.com > Apps > Flix Kick Up > App settings / Ad units).
   An id left empty (or not in the ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX form) falls back to Google's TEST ad unit,
   so a development build never shows real ads by mistake.
   Instead of editing this file you can also set the GitHub secrets KICKUP_ADMOB_APP_ID, KICKUP_ADMOB_REWARDED_ID,
   KICKUP_ADMOB_INTERSTITIAL_ID and KICKUP_ADMOB_BANNER_ID: tools/ios_setup.py writes them into the app's copy of this file.
   Ad pacing and reward amounts are game rules, they live in the game (AD_CFG in flix-kick-up.html). */
window.FLIX_ADS_CONFIG = {
  // true: always Google's test ads (even when real ids are filled in). false/'auto': real ids where filled in, test ads otherwise.
  forceTestAds: false,
  ids: {
    // App id, form ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX (with ~). tools/ios_setup.py puts it into Info.plist (GADApplicationIdentifier).
    IOS_APP_ID: '',
    // Ad unit ids, form ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX (with /)
    IOS_REWARDED: '',
    IOS_INTERSTITIAL: '',
    IOS_BANNER: '',
    ANDROID_REWARDED: '',
    ANDROID_INTERSTITIAL: '',
    ANDROID_BANNER: ''
  },
  // Banner at the bottom of the home screen only (never during a run, never with "No Ads"). Off: the home screen's
  // bottom buttons sit where the banner would go, so turn it on only after checking the layout on a phone.
  bannerEnabled: false,
  // Asks the iPhone's "Allow tracking?" question once (personalised ads earn more). Not required by AdMob:
  // with false the ads still work, non-personalised. If you set false, also change App Store Connect >
  // App Privacy so "Device ID" is no longer marked "used for tracking".
  requestTracking: true,
  // Device ids that always get test ads even with real ids (Xcode console prints the id on first ad request).
  testDevices: []
};
