import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src = open('game8.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:120]))
    src = src.replace(old, new)
# real AdMob in the app (ads.js): two rewarded units, interstitial every 3rd finished level, never right after a rewarded ad
rep("async function adRewarded() { if (window.FlixAds) return window.FlixAds.showRewarded(4000); return webAd('rewarded'); }",
    "let lastRewardAt = 0;\nasync function adRewarded(which) { let r; if (window.FlixAds) r = await window.FlixAds.showRewarded(which === 'shots' ? 8000 : 5000, which || 'fe'); else if (NATIVE) r = 'unavailable'; else r = await webAd('rewarded'); if (r !== 'unavailable') lastRewardAt = Date.now(); return r; }")
rep("async function adInterstitial() { if (SAVE.noads) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); return webAd('inter'); }",
    "async function adInterstitial() { if (SAVE.noads || Date.now() - lastRewardAt < 90000) return false; if (window.FlixAds) return window.FlixAds.showInterstitial(); if (NATIVE) return false; return webAd('inter'); }")
rep("function maybeInterstitial() { SAVE.wins++; save(); if (SAVE.noads || BOT || cur < AD_CFG.interFromLevel) return Promise.resolve(false); if (SAVE.wins % AD_CFG.interEvery) return Promise.resolve(false); return adInterstitial(); }",
    "function adTurn() { SAVE.adN = (SAVE.adN || 0) + 1; save(); if (SAVE.noads || BOT || cur < AD_CFG.interFromLevel) return Promise.resolve(false); if (SAVE.adN % AD_CFG.interEvery) return Promise.resolve(false); return adInterstitial(); }\nfunction maybeInterstitial() { SAVE.wins++; save(); return adTurn(); }")
rep("function maybeLoseAd() { SAVE.loses++; save(); if (SAVE.noads || BOT || SAVE.loses % 2) return Promise.resolve(false); return adInterstitial(); }",
    "function maybeLoseAd() { SAVE.loses++; save(); return adTurn(); }")
# the right rewarded unit for each button
rep("if (b.disabled) return; b.disabled = true; const r = await adRewarded();", "if (b.disabled) return; b.disabled = true; const r = await adRewarded(kind === 'double' ? 'fe' : 'shots');")
rep("const ff = $('freeFe'); if (ff) ff.addEventListener('click', async () => { const r = await adRewarded();", "const ff = $('freeFe'); if (ff) ff.addEventListener('click', async () => { if (ff.disabled) return; ff.disabled = true; const r = await adRewarded('fe');")
rep("[{t: '▶ Reklam izle · 2x', c: 'ad', f: async () => { const r = await adRewarded();", "[{t: '▶ Reklam izle · 2x', c: 'ad', f: async () => { const r = await adRewarded('fe');")
# load the +2 shots ad while the player still has 2 shots left, so it is ready on the lose screen
rep("function shoot(pow) {\n  P.shot++; hudShots();", "function shoot(pow) {\n  P.shot++; hudShots();\n  if (!P.revived && P.shot >= SHOT_LIMIT - 2 && window.FlixAds && window.FlixAds.prepareRewarded) window.FlixAds.prepareRewarded('shots');")
rep("addFe(AD_CFG.freeFe, 'reklam ödülü'); renderShop(); } else toastShop('Reklam şu an yok', 'biraz sonra dene'); });", "addFe(AD_CFG.freeFe, 'reklam ödülü'); renderShop(); } else { ff.disabled = false; toastShop('Reklam şu an yok', 'biraz sonra dene'); } });")
open('game9.js', 'w').write(src); print('game9.js', len(src))
