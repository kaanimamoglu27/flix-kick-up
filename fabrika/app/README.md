# Flix Fabrika iOS uygulaması

Capacitor 8 paketi. Oyunun kendisi `../index.html` (GitHub Pages: https://kaanimamoglu27.github.io/flix-kick-up/fabrika/), kaynak kodu `../kaynak/`.

- Paket kimliği: `com.flixtoys.fabrika`, ad "Flix Fabrika", sadece iPhone, dikey.
- Uygulama içi satın almalar (7 ürün, kimlikler `www/native-bridge.js` ve `../kaynak/config.js` içinde aynı) ve AdMob reklamları (ödüllü + geçiş) var.
  Reklam kimlikleri: `www/ads-config.js` ya da GitHub sırları `FABRIKA_ADMOB_*`. Kimlik yoksa Google'ın test reklamları çıkar.
- Gizlilik sayfası: https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html
- `npm run build`: `../index.html`'den `www/index.html` üretir (oyun tek dosya, internet gerekmez).
- `ios/` klasörü depoya konmaz; `npx cap add ios --packagemanager CocoaPods` + `python3 tools/ios_setup.py` ile üretilir.
- `store/icon-1024.png` ve `store/acilis_ekrani.png` geçici; App Store görselleri sonra yapılacak.

TestFlight'a yükleme (Mac gerekmez): GitHub > Actions > "iOS TestFlight" > Run workflow > app: **fabrika**.
Ayrıntılı adımlar: depo kökündeki `TESTFLIGHT_REHBERI.md` (Flix Fabrika bölümü).
Mac'ten: `./ios.sh hazirla`, `./ios.sh simulator`, `./ios.sh yukle 1.0`.
