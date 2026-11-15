#!/usr/bin/env python3
"""Reklam kontrolü (TestFlight build'inde, iOS projesi hazırlandıktan sonra çalışır).
Uygulamaya giren SON AdMob ayarlarını okur (Info.plist GADApplicationIdentifier + ios/.../public/ads-config.js) ve
- Actions özetine ve run sayfasına (notice) hangi reklamların GERÇEK, hangilerinin Google TEST reklamı olduğunu yazar,
- uygulama kimliği TEST iken reklam birimi gerçekse (bu durumda reklam hiç gelmez) o birimleri test birimine çevirir,
  böylece TestFlight'ta en azından test reklamı görünür ve sorun uyarı olarak yazılır.
Kullanım: python3 tools/ads_audit.py   (app/ klasöründen)"""
import os, pathlib, plistlib, re, sys
app = pathlib.Path(__file__).resolve().parent.parent
TEST_APP = 'ca-app-pub-3940256099942544~1458002511'
APP_RE, UNIT_RE = r'ca-app-pub-\d{16}~\d{10}', r'ca-app-pub-\d{16}/\d{10}'
plist = next(iter(sorted(app.glob('ios/App/App/Info.plist'))), None)
cfgs = [p for p in app.glob('ios/App/App/public/ads-config.js')] + [p for p in app.glob('ios/App/public/ads-config.js')]
if not plist or not cfgs:
    print('::warning title=Reklam kontrolü::iOS projesi ya da ads-config.js bulunamadı'); sys.exit(0)
pl = plistlib.load(open(plist, 'rb'))
app_id = pl.get('GADApplicationIdentifier', '')
real_app = bool(re.fullmatch(APP_RE, app_id)) and app_id != TEST_APP
lines, warn = [], []
for cfg in cfgs:
    s = cfg.read_text(encoding='utf-8')
    force = re.search(r'forceTestAds:\s*true', s) is not None
    units = {k: v.strip() for k, v in re.findall(r"\b(IOS_[A-Z_]+):\s*'([^']*)'", s) if k != 'IOS_APP_ID'}
    units = {k: v for k, v in units.items() if k != 'IOS_BANNER' or v}
    real = {k: bool(re.fullmatch(UNIT_RE, v)) and not force for k, v in units.items()}
    if not real_app and any(real.values()):
        warn.append('Uygulama kimliği TEST ama %s gerçek: bu birimler reklam getirmezdi, test birimine çevrildi. GitHub secret ADMOB_APP_ID (ya da ads-config.js IOS_APP_ID) eksik.' % ', '.join(k for k, r in real.items() if r))
        for k, r in real.items():
            if r: s = re.sub(r"(\b%s:\s*)'[^']*'" % k, r"\1''", s)
        cfg.write_text(s, encoding='utf-8')
        real = {k: False for k in real}
    lines.append('App ID: %s | %s%s' % ('GERÇEK' if real_app else 'TEST', ' | '.join('%s: %s' % (k[4:].lower(), 'GERÇEK' if r else 'TEST') for k, r in real.items()), ' | forceTestAds' if force else ''))
summary = 'AdMob — ' + ' ; '.join(lines)
print('::notice title=Reklam kontrolü::' + summary)
for w in warn: print('::warning title=Reklam kontrolü::' + w)
if os.environ.get('GITHUB_STEP_SUMMARY'):
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as f:
        f.write('### Reklam kontrolü\n\n' + summary + '\n\n' + ''.join('- ⚠️ %s\n' % w for w in warn) + '\n')
