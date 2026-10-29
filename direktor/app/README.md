# Flix Direktör: iPhone uygulaması

Yükleme adımları: [../../TESTFLIGHT_REHBERI.md](../../TESTFLIGHT_REHBERI.md). Kısaca: Mac'te `./ios.sh yukle 1.0`, Mac yoksa `gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=direktor -f version=1.0`.

## Klasörler
- `www/index.html` oyun. Elle düzenleme: web sürümü (`../index.html`) değişince `npm run build` çalıştır.
- `www/app.js` sadece uygulamada çalışan katman: gerçek Apple ödemesi, reklamsız akış, "Satın alımları geri yükle".
- `www/native-bridge.js` App Store satın alma ve titreşim bağlantısı.
- `www/fonts/`, `www/three.min.js` yazı tipleri ve 3D motoru uygulamanın içinde, internetsiz açılır.
- `tools/ios_setup.py` dikey ekran, sadece iPhone, durum çubuğu gizli, ikon ve açılış ekranı.
- `store/icon-1024.png` ikon, `store/acilis_ekrani.png` açılış ekranı.

## Uygulamada web sürümünden farklı olanlar
- Flix Coin paketleri, Başlangıç paketi ve Direktör Kulübü (aylık/yıllık abonelik) Apple ile satın alınır, fiyatlar mağazadan TL olarak okunur.
- Web'de TL ile satılan tek tek kilitler (sezonlar, paketler, kıyafetler) uygulamada Flix Coin ile açılır. Böylece sadece 8 ürün var.
- Reklam yok: günlük coin hediyesi, sponsor parası ve "geri al" reklamsız çalışır.
- Online düello "yakında" olarak görünür (claude.ai linkine bağlı). Aynı telefonda arkadaşla oynama çalışır.
- Canlı bülten internet varsa GitHub'dan güncel maçları çeker, yoksa diğer her şey internetsiz çalışır.
- Ekran çentik ve alt çubuk boşluklarına göre ayarlı, titreşim telefonun titreşim motoruyla, uygulama arka plana geçince ses durur.
