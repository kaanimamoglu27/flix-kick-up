# Flix Atış iOS uygulaması

Capacitor 8 paketi. Oyunun kendisi `../index.html` (GitHub Pages: https://kaanimamoglu27.github.io/flix-kick-up/atis/).

- Paket kimliği: `com.flixtoys.atis`, ad "Flix Atış", sadece iPhone, dikey.
- Uygulama içi satın alma ve reklam yok. Gizlilik sayfası: https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html
- `npm run build`: `../index.html`'den `www/index.html` üretir (yazı tipleri ve three.js uygulamanın içinde, internet gerekmez).
- `ios/` klasörü depoya konmaz; `npx cap add ios --packagemanager CocoaPods` + `python3 tools/ios_setup.py` ile üretilir.

TestFlight'a yükleme (Mac gerekmez): GitHub > Actions > "iOS TestFlight" > Run workflow > app: **atis**.
Ayrıntılı adımlar: depo kökündeki `TESTFLIGHT_REHBERI.md` (Flix Atış bölümü).
Mac'ten: `./ios.sh hazirla`, `./ios.sh simulator`, `./ios.sh yukle 1.0`.
