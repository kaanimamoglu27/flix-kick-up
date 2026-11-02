# Flix Kick Up: App Store paketi

Bu klasör Flix Kick Up'ı iPhone (ve istersen Android) uygulamasına çeviren hazır iskelettir. Oyun `www/` içinde, internet olmadan çalışır: Rubik yazı tipi dosyaları yanında, dışarıdan hiçbir şey yüklenmez.

## Klasörler
- `www/index.html` oyunun kendisi. Elle düzenleme: web sürümü (`../flix-kick-up.html`) değişince `python3 tools/build_www.py` çalıştır. Bu dosyayı yeniden üretir ve dış bağlantı kalmadığını kontrol eder.
- `www/native-bridge.js` gerçek satın alma (App Store / Google Play) ve titreşim bağlantısı. Web'de hiçbir şey yapmaz.
- `www/ads.js` AdMob reklam servisi, `www/ads-config.js` reklam kimlikleri ve ayarları. Web'de hiçbir şey yapmaz.
- `capacitor.config.json` uygulama kimliği `com.flixtoys.kickup`, adı Flix Kick Up.
- `tools/ios_setup.py` iOS projesini dikey ekrana kilitler, sadece iPhone uygulaması yapar (iPad ekran görüntüsü gerekmez), durum çubuğunu gizler, şifreleme sorusunu kapatır, ikon ve açılış ekranını koyar (Mac, Linux ve GitHub'ın bulut Mac'inde çalışır).
- `ios.sh` Mac terminalinden tek komutla hazırlama, simülatör ve TestFlight'a yükleme.
- `store/icon-1024.png` uygulama ikonu (FLIX logosu, kırmızı ışınlı zemin).
- `store/screenshots/` 7 adet 1290x2796 ekran görüntüsü: ana ekran, hareket, bot yarışı, dikey mod, dolap, modlar, sahneler. App Store 6,7" ve 6,9" bölümüne yüklenir.

## Uygulamada web sürümünden farklı olanlar
- Mağaza gerçek: satın alma Apple'ın kendi penceresiyle yapılır, fiyatlar mağazadan TL olarak okunur.
- Reklamlar Google AdMob ile (`www/ads.js` servisi): düşünce "Kaldığın yerden devam" ve "Tüyleri 2 katına çıkar" ödüllü reklamları. Bunlar sadece oyuncu basarsa açılır, ödül yalnızca reklam sonuna kadar izlenince verilir, reklam hazır değilse mesaj çıkar. Tur arası reklam en erken 3. bitmiş oyundan sonra, sonra her 3 oyunda bir ve en fazla 90 saniyede bir çıkar; sadece sonuç ekranından çıkarken (Tekrar / Menü / Mağaza) gösterilir, oyun sırasında asla. Hazır değilse beklemeden atlanır. "Reklamsız" (kickup_noads) tur arası reklamı ve banner'ı tamamen kapatır, ödüllü reklamlar isteğe bağlı kalır. Web sürümünde reklam ağı olmadığı için aynı yerlerde gerçek FLIX oyuncağının kendi reklamı çıkar (flixtoysofficial.com'a gider).
- Reklam tempo ve ödül ayarları oyunda tek yerde: `AD_CFG` (`../flix-kick-up.html`, "ads" bölümü). Reklam kimlikleri, test/gerçek seçimi, banner ve takip izni anahtarı: `www/ads-config.js`. Kimlikler GitHub secret olarak da girilebilir: KICKUP_ADMOB_APP_ID, KICKUP_ADMOB_REWARDED_ID, KICKUP_ADMOB_INTERSTITIAL_ID, KICKUP_ADMOB_BANNER_ID. Boş ya da biçimi yanlış kimlik yerine Google'ın test reklamı çıkar. Takip izni sorusu (`requestTracking`) Google'ın onay penceresinden sonra bir kez sorulur.
- Banner desteği hazır ama kapalı (`bannerEnabled: false`), çünkü ana ekranın alt butonları banner'ın yerinde duruyor. Açılırsa sadece ana ekranda görünür.
- "Reklamsız" ve "Başlangıç Paketi" cihazda saklanır. Uygulama her açılışta mağazanın bildirdiği sahipliği de tekrar okur. "Satın alımları geri yükle" bulduğunu verir; bir şey yoksa ya da mağazaya ulaşılamıyorsa bunu söyler.
- Başlangıç Paketi'ndeki üstü çizili "$9.99" fiyatı uygulamada gösterilmiyor.
- Online oyna: ana ekranda "ONLINE OYNA" (ve Oyna > Yarış'ta "Online oyna"). Hızlı eşleşme ya da 6 haneli özel oda; ikisi de "Hazırım" deyince sunucu 3-2-1 sayar, maç 60 saniye, en çok puanı yapan kazanır (düşen oyuncu kaldığı yerden devam eder), sonra "Tekrar oyna" veya "Menü". Sunucu `../server/`, adres `../online-config.js` içinde `ONLINE_SERVER_URL` (ya da GitHub değişkeni `KICKUP_ONLINE_SERVER_URL`); adres yoksa düğme görünmez. Online maç sırasında reklam açılmaz; tur arası reklam ancak sonuç ekranından menüye dönerken mevcut tempoyla çıkabilir, ödüllü reklam maç sonucunu değiştirmez. Online maç rekor ve hayalet kaydını etkilemez.
- Titreşim telefonun kendi titreşim motoruyla: vuruşta hafif, harekette orta, düşüşte güçlü.

## Yayına çıkmak için adımlar
Bütün adımlar ve terminal komutları: [../TESTFLIGHT_REHBERI.md](../TESTFLIGHT_REHBERI.md). Kısaca: Mac'te bu klasörde `./ios.sh yukle 1.0`, Mac yoksa `gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=kickup -f version=1.0`.

## Uygulama içi ürünler
| Kimlik | Tür | Fiyat | İçerik |
|---|---|---|---|
| kickup_starter | Tüketilemez | 2,99 $ | Başlangıç Paketi: 2.500 tüy + Kristal FLIX (tek sefer, geri yüklenebilir) |
| kickup_noads | Tüketilemez | 2,99 $ | Reklamsız: tur arası reklamları kaldırır (geri yüklenebilir) |
| kickup_feathers_500 | Tüketilebilir | 0,99 $ | 500 tüy (Avuç) |
| kickup_feathers_1200 | Tüketilebilir | 1,99 $ | 1.200 tüy (Kese) |
| kickup_feathers_3500 | Tüketilebilir | 4,99 $ | 3.500 tüy (Sandık) |
| kickup_feathers_8000 | Tüketilebilir | 9,99 $ | 8.000 tüy (Hazine) |
| kickup_feathers_18000 | Tüketilebilir | 19,99 $ | 18.000 tüy (Dağ) |
| kickup_feathers_50000 | Tüketilebilir | 49,99 $ | 50.000 tüy (Ejderha Hazinesi) |

Kimliklerin başında `kickup_` var, çünkü aynı Apple hesabındaki ARKANA'nın ürünleriyle (ör. `starter`) karışmasın.

Oyun içi ekonomi: tüyler oyunda toplanır (her tüy 2 sayılır), her 10 puan tur sonunda 1 tüy olur, yıldızlar, bot ve kombo ödülleri de tüy verir. Tüylerle FLIX'ler, toplar, sahneler ve boru renkleri açılır. Altın FLIX ve Yıldız Sahne sadece rekorla açılır. Para yalnızca hızlandırır, hiçbir şey sadece parayla açılmaz.

Satın alma güvenliği (1.3): tüyler Apple işlemi onaylanınca, işlem kimliğiyle bir kez eklenir. Ödeme sırasında uygulama kapanır, internet giderse ya da "Satın Alma İzni" (Ask to Buy) sonradan onaylanırsa tüyler oyun bir sonraki açılışta yine gelir, iki kez gelmez. Butona iki kez basmak iki ödeme açmaz.

Not: satın alma şu an telefonun içinde onaylanıyor. İleride hileyi azaltmak için sunucu doğrulaması (ör. RevenueCat) eklenebilir.

## Görüntü ve hız
- Çizim ekranın 2 katı çözünürlükte (iPhone'da keskin), fizik saniyede 240 adım, çizim ekran yenileme hızında (ProMotion telefonlarda 120 Hz).
- Duraklatma ve tur sonu ekranında sahne saniyede 15 kez çizilir; uygulama arka plana geçince oyun duraklar ve ses kapanır, geri gelince ses açılır.
- Sahne ve dolap kartlarının küçük resimleri bir kez çizilip saklanır.

## Mağaza metni (TR)
**Ad:** Flix Kick Up
**Alt başlık:** Sektir, hareket yap, rekor kır!
**Açıklama:**
FLIX'i havada tut! Ekrana dokunarak tüylü FLIX'i sektir, direklerin arasından geçir, havada hareketler yap ve rekorunu kır.

• Tek parmakla oyna: ekranın solu hızlı atak, ortası dengeli, sağı yüksek vuruş.
• Basılı tut, kaydır, iki parmak kullan: Makas, Helikopter, Geri takla, Fırıldak, Dalış, Roket, Kırbaç ve Kelebek.
• Hareketleri art arda bağla, kombo yap, Şelale ve Füze gibi özel ikilileri yakala.
• Klasik ve Dikey mod, 3 bota karşı yarış ve 4 meydan okuma: 20 Saniye, Akrobat, Mesafe, Tüy Avı.
• 22 FLIX ve 5 top, Sıradandan Mitik'e: Kristal, Galaksi, Ateş Kuşu, Ejderha FLIX.
• 13 sahne: İstanbul Akşamı, Ankara Ayazı, Boğaz, Kapadokya, Gece Maçı, Kar Tatili, Uzay ve animasyonlu Lunapark Gecesi.
• 11 boru rengi, süreli x2 ve x4 puan rozetleri.
• Türkçe ve İngilizce.

**Anahtar kelimeler:** flix, kick up, sektirme, tüy, jianzi, refleks, arcade, rekor, futbol, oyuncak

## Store listing (EN)
**Name:** Flix Kick Up
**Subtitle:** Kick it, Flick it, Flix it!
**Description:**
Keep FLIX in the air! Tap to kick the feathered FLIX, fly it through the gaps between the posts, pull off tricks in mid-air and beat your high score.

• One-thumb play: the left of the screen kicks low and fast, the middle steady, the right high.
• Hold, swipe or use two fingers for tricks: Scissors, Helicopter, Backflip, Spinner, Dive, Rocket, Whip and Butterfly.
• Chain tricks into combos and land special pairs like Waterfall and Missile.
• Classic and Vertical modes, a race against 3 bots and 4 challenges: 20 Seconds, Acrobat, Distance, Feather Hunt.
• 22 FLIX and 5 balls from Common to Mythic: Crystal, Galaxy, Firebird, Dragon FLIX.
• 13 scenes: Istanbul Evening, Ankara Frost, the Bosphorus, Cappadocia, Night Match, Snow Holiday, Space and the animated Funfair Night.
• 11 pipe colours, timed x2 and x4 score badges.
• Turkish and English.

**Keywords:** flix, kick up, keepy uppy, shuttlecock, jianzi, reflex, arcade, high score, football, toy

## Gizlilik politikası (yayınlanacak metin)
Flix Kick Up (Flix) hesap oluşturmaz; ad, e-posta veya konum istemez. Oyun ilerlemesi yalnızca cihazınızda saklanır. Uygulama içi satın alımlar Apple App Store tarafından işlenir; ödeme bilgilerinizi görmeyiz. Oyundaki reklamları Google AdMob gösterir; AdMob reklam kimliğini (izin verirsen), yaklaşık konumu ve tanılama verilerini kullanabilir. Tam metin: https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html. İletişim: flixtoysofficial.com.

App Store "Uygulama Gizliliği" bölümünde (AdMob nedeniyle, ARKANA ile aynı) şunları işaretle:
- **Tanımlayıcılar > Cihaz Kimliği**: Üçüncü taraf reklamcılık, kullanıcıya bağlı değil, takip için kullanılıyor.
- **Konum > Yaklaşık Konum**: Üçüncü taraf reklamcılık, kullanıcıya bağlı değil.
- **Kullanım Verileri > Reklam Verileri** ve **Tanılama > Kilitlenme / Performans Verileri**: Üçüncü taraf reklamcılık / Analiz, kullanıcıya bağlı değil.

## Lisanslar
Rubik yazı tipi (SIL Open Font License), ticari kullanıma açık. Oyunun geri kalanı Flix'e ait.
