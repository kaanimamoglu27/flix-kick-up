#!/usr/bin/env python3
"""Prepares the iOS project after `npx cap add ios` / `npx cap sync ios`. Works on Mac, Linux and GitHub Actions.
- locks FLIX Kick Up to portrait and makes it an iPhone-only app (no iPad screenshots needed)
- hides the status bar, declares no non-exempt encryption (skips the export-compliance question on every upload)
- lets ProMotion iPhones run at 120 Hz
- copies the app icon (store/icon-1024.png) and launch screen (store/acilis_ekrani.png)
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
pl['CFBundleDisplayName'] = 'FLIX Kick Up'
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
pbx = ios / 'App.xcodeproj' / 'project.pbxproj'
s = pbx.read_text()
s = s.replace('TARGETED_DEVICE_FAMILY = "1,2";', 'TARGETED_DEVICE_FAMILY = 1;')
if os.environ.get('BUILD_NUMBER'): s = re.sub(r'CURRENT_PROJECT_VERSION = [^;]+;', 'CURRENT_PROJECT_VERSION = %s;' % os.environ['BUILD_NUMBER'], s)
if os.environ.get('APP_VERSION'): s = re.sub(r'MARKETING_VERSION = [^;]+;', 'MARKETING_VERSION = %s;' % os.environ['APP_VERSION'], s)
pbx.write_text(s)
print('iOS project ready: portrait, iPhone only, icon, launch screen')
