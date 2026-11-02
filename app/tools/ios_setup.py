#!/usr/bin/env python3
"""Prepares the iOS project after `npx cap add ios` / `npx cap sync ios`. Works on Mac, Linux and GitHub Actions.
- locks FLIX Kick Up to portrait and makes it an iPhone-only app (no iPad screenshots needed)
- hides the status bar, declares no non-exempt encryption (skips the export-compliance question on every upload)
- lets ProMotion iPhones run at 120 Hz
- copies the app icon (store/icon-1024.png) and launch screen (store/acilis_ekrani.png)
- AdMob: app id (env ADMOB_APP_ID, Google's TEST id if unset), tracking prompt text, SKAdNetwork ids;
  env ADMOB_REWARDED_ID / ADMOB_INTERSTITIAL_ID put the real ad units into the app's native-bridge.js
- optional env BUILD_NUMBER / APP_VERSION set the build number and version shown in the App Store"""
import json, os, plistlib, subprocess, pathlib, re, shutil
app = pathlib.Path(__file__).resolve().parent.parent
ios = app / 'ios' / 'App'
pl_path = ios / 'App' / 'Info.plist'
with open(pl_path, 'rb') as f: pl = plistlib.load(f)
pl['UISupportedInterfaceOrientations'] = ['UIInterfaceOrientationPortrait']
pl.pop('UISupportedInterfaceOrientations~ipad', None)
pl['UIRequiresFullScreen'] = True
pl['UIStatusBarHidden'] = True
pl['UIViewControllerBasedStatusBarAppearance'] = False
pl['ITSAppUsesNonExemptEncryption'] = False
pl['CADisableMinimumFrameDurationOnPhone'] = True
pl['CFBundleDisplayName'] = 'Flix Kick Up'
pl['GADApplicationIdentifier'] = os.environ.get('ADMOB_APP_ID') or 'ca-app-pub-3940256099942544~1458002511'
pl['NSUserTrackingUsageDescription'] = 'Reklamları sana daha uygun göstermek için kullanılır. Hayır dersen oyun aynı şekilde çalışır.'
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
# real ad units go into the copy of native-bridge.js inside the app (the web copy keeps Google's test units)
nb = ios / 'App' / 'public' / 'native-bridge.js'
if nb.exists():
    t = nb.read_text()
    if os.environ.get('ADMOB_REWARDED_ID'): t = t.replace("'ca-app-pub-3940256099942544/1712485313'", repr(os.environ['ADMOB_REWARDED_ID']))
    if os.environ.get('ADMOB_INTERSTITIAL_ID'): t = t.replace("'ca-app-pub-3940256099942544/4411468910'", repr(os.environ['ADMOB_INTERSTITIAL_ID']))
    nb.write_text(t)
pbx = ios / 'App.xcodeproj' / 'project.pbxproj'
s = pbx.read_text()
s = s.replace('TARGETED_DEVICE_FAMILY = "1,2";', 'TARGETED_DEVICE_FAMILY = 1;')
if os.environ.get('BUILD_NUMBER'): s = re.sub(r'CURRENT_PROJECT_VERSION = [^;]+;', 'CURRENT_PROJECT_VERSION = %s;' % os.environ['BUILD_NUMBER'], s)
if os.environ.get('APP_VERSION'): s = re.sub(r'MARKETING_VERSION = [^;]+;', 'MARKETING_VERSION = %s;' % os.environ['APP_VERSION'], s)
pbx.write_text(s)
print('iOS project ready: portrait, iPhone only, icon, launch screen, AdMob app id', pl['GADApplicationIdentifier'])
