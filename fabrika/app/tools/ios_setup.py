#!/usr/bin/env python3
"""Prepares the iOS project after `npx cap add ios` / `npx cap sync ios`. Works on Mac, Linux and GitHub Actions.
- locks Flix Fabrika to landscape (2.2: the game is played sideways) and makes it an iPhone-only app (no iPad screenshots needed)
- hides the status bar, declares no non-exempt encryption (skips the export-compliance question on every upload)
- lets ProMotion iPhones run at 120 Hz
- copies the app icon (store/icon-1024.png) and launch screen (store/acilis_ekrani.png)
- AdMob: app id, tracking prompt text, SKAdNetwork ids. Ids come from www/ads-config.js; the env variables
  ADMOB_APP_ID / ADMOB_REWARDED_ID / ADMOB_INTERSTITIAL_ID / ADMOB_BANNER_ID (GitHub secrets FABRIKA_ADMOB_*) override them and are
  written into the app's copy of ads-config.js. Missing or malformed ids fall back to Google's TEST ids.
- optional env BUILD_NUMBER / APP_VERSION set the build number and version shown in the App Store"""
import json, os, plistlib, subprocess, pathlib, re, shutil
app = pathlib.Path(__file__).resolve().parent.parent
ios = app / 'ios' / 'App'
pl_path = ios / 'App' / 'Info.plist'
with open(pl_path, 'rb') as f: pl = plistlib.load(f)
pl['UISupportedInterfaceOrientations'] = ['UIInterfaceOrientationLandscapeRight', 'UIInterfaceOrientationLandscapeLeft']
pl.pop('UISupportedInterfaceOrientations~ipad', None)
pl['UIRequiresFullScreen'] = True
pl['UIStatusBarHidden'] = True
pl['UIViewControllerBasedStatusBarAppearance'] = False
pl['ITSAppUsesNonExemptEncryption'] = False
pl['CADisableMinimumFrameDurationOnPhone'] = True
pl['CFBundleDisplayName'] = 'Flix Fabrika'
# AdMob ids: env (GitHub secrets) first, then www/ads-config.js. A malformed app id would crash the app at launch, so it is checked.
ads_cfg = (app / 'www' / 'ads-config.js').read_text(encoding='utf-8')
def cfg_id(key):
    m = re.search(r"\b%s:\s*'([^']*)'" % key, ads_cfg)
    return m.group(1).strip() if m else ''
env_units = {k: (os.environ.get('ADMOB_%s_ID' % k) or '').strip() for k in ('REWARDED', 'INTERSTITIAL', 'BANNER')}
units = {k: env_units[k] or cfg_id('IOS_' + k) for k in env_units}
TEST_APP_ID = 'ca-app-pub-3940256099942544~1458002511'
app_id = (os.environ.get('ADMOB_APP_ID') or '').strip() or cfg_id('IOS_APP_ID')
if app_id and not re.fullmatch(r'ca-app-pub-\d{16}~\d{10}', app_id):
    print('WARNING: AdMob app id %r is not in the ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX form, using the TEST app id' % app_id); app_id = ''
real_units = [k for k, v in units.items() if re.fullmatch(r'ca-app-pub-\d{16}/\d{10}', v)]
if real_units and not app_id: print('WARNING: real ad units (%s) but no real AdMob app id: ads will not fill. Set IOS_APP_ID / ADMOB_APP_ID.' % ', '.join(real_units))
if app_id and not real_units: print('NOTE: real AdMob app id but no real ad units: the app shows Google test ads.')
pl['GADApplicationIdentifier'] = app_id or TEST_APP_ID
pl['NSUserTrackingUsageDescription'] = 'Reklamları sana daha uygun göstermek için kullanılır. Hayır dersen oyun aynı şekilde çalışır. / Used to show you more relevant ads. If you say no, the game works the same.'
pl['SKAdNetworkItems'] = [{'SKAdNetworkIdentifier': i} for i in ['cstr6suwn9.skadnetwork', '4fzdc2evr5.skadnetwork', '2fnua5tdw4.skadnetwork', 'ydx93a7ass.skadnetwork', 'p78axxw29g.skadnetwork', 'v72qych5uu.skadnetwork', 'ludvb6z3bs.skadnetwork', 'cp8zw746q7.skadnetwork', '3sh42y64q3.skadnetwork', 'c6k4g5qg8m.skadnetwork', 's39g8k73mm.skadnetwork', '3qy4746246.skadnetwork', 'hs6bdukanm.skadnetwork', 'mlmmfzh3r3.skadnetwork', 'v4nxqhlyqp.skadnetwork', 'wzmmz9fp6w.skadnetwork', 'su67r6k2v3.skadnetwork', 'yclnxrl5pm.skadnetwork', '7ug5zh24hu.skadnetwork', 'gta9lk7p23.skadnetwork', 'vutu7akeur.skadnetwork', 'y5ghdn5j9k.skadnetwork', 'v9wttpbfk9.skadnetwork', 'n38lu8286q.skadnetwork', '47vhws6wlr.skadnetwork', 'kbd757ywx3.skadnetwork', '9t245vhmpl.skadnetwork', 'a2p9lx4jpn.skadnetwork', '22mmun2rn5.skadnetwork', '4468km3ulz.skadnetwork', '2u9pt9hc89.skadnetwork', '8s468mfl3y.skadnetwork', 'ppxm28t8ap.skadnetwork', 'uw77j35x4d.skadnetwork', 'pwa73g5rt2.skadnetwork', '578prtvx9j.skadnetwork', '4dzt52r2t5.skadnetwork', 'tl55sbb4fm.skadnetwork', 'e5fvkxwrpn.skadnetwork', '8c4e2ghe7u.skadnetwork', '3rd42ekr43.skadnetwork', '3qcr597p9d.skadnetwork']]
with open(pl_path, 'wb') as f: plistlib.dump(pl, f)
xc = ios / 'App' / 'Assets.xcassets'
shutil.copy(app / 'store' / 'icon-1024.png', xc / 'AppIcon.appiconset' / 'AppIcon-512@2x.png')
splash = app / 'store' / 'acilis_ekrani.png'
if splash.exists():
    # one launch image instead of three large copies (keeps the app download small)
    si = xc / 'Splash.imageset'
    for f in si.glob('*.png'): f.unlink()
    try:
        from PIL import Image
        Image.open(splash).convert('RGB').save(si / 'splash.jpg', quality=88, optimize=True); name = 'splash.jpg'
    except ImportError:
        name = 'splash.jpg'
        if shutil.which('sips'):  # macOS built-in image tool
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '88', str(splash), '--out', str(si / name)], check=True, capture_output=True)
        else:
            shutil.copy(splash, si / 'splash.png'); name = 'splash.png'
    (si / 'Contents.json').write_text(json.dumps({'images': [{'idiom': 'universal', 'filename': name}], 'info': {'author': 'xcode', 'version': 1}}, indent=2))
# ad units from the env go into the app's copy of ads-config.js (the copy in www/ stays as it is)
ac = ios / 'App' / 'public' / 'ads-config.js'
if ac.exists():
    t = ac.read_text(encoding='utf-8')
    for k, v in env_units.items():
        if v: t = re.sub(r"(\bIOS_%s:\s*)'[^']*'" % k, lambda m: m.group(1) + "'%s'" % v.replace("'", ''), t)
    ac.write_text(t, encoding='utf-8')
elif any(env_units.values()):
    print('WARNING: ios/App/App/public/ads-config.js not found, run npx cap sync ios first')
pbx = ios / 'App.xcodeproj' / 'project.pbxproj'
s = pbx.read_text()
s = s.replace('TARGETED_DEVICE_FAMILY = "1,2";', 'TARGETED_DEVICE_FAMILY = 1;')
if os.environ.get('BUILD_NUMBER'): s = re.sub(r'CURRENT_PROJECT_VERSION = [^;]+;', 'CURRENT_PROJECT_VERSION = %s;' % os.environ['BUILD_NUMBER'], s)
if os.environ.get('APP_VERSION'): s = re.sub(r'MARKETING_VERSION = [^;]+;', 'MARKETING_VERSION = %s;' % os.environ['APP_VERSION'], s)
pbx.write_text(s)
print('iOS project ready: landscape, iPhone only, icon, launch screen, AdMob app id', pl['GADApplicationIdentifier'], '| real ad units:', ', '.join(real_units) or 'none (test ads)')
