# FLIX Kick Up: App Store paketi

Bu klasör FLIX Kick Up'ı iPhone (ve istersen Android) uygulamasına çeviren hazır iskelettir. Oyun `www/` içinde, internet olmadan çalışır: Rubik yazı tipi dosyaları yanında, dışarıdan hiçbir şey yüklenmez.

## Klasörler
- `www/index.html` oyunun kendisi. Elle düzenleme: web sürümü (`../flix-kick-up.html`) değişince `python3 tools/build_www.py` çalıştır. Bu dosyayı yeniden üretir ve dış bağlantı kalmadığını kontrol eder.
- `www/native-bridge.js` gerçek satın alma (App Store / Google Play) ve titreşim bağlantısı. Web'de hiçbir şey yapmaz.
- `capacitor.config.json` uygulama kimliği `com.flixtoys.kickup`, adı FLIX Kick Up.
- `tools/ios_setup.sh` iOS projesini dikey ekrana kilitler, sadece iPhone uygulaması yapar (iPad ekran görüntüsü gerekmez), durum çubuğunu gizler, şifreleme sorusunu kapatır.
- `store/icon-1024.png` uygulama ikonu (FLIX logosu, kırmızı ışınlı zemin).
- `store/screenshots/` 7 adet 1290x2796 ekran görüntüsü: ana ekran, hareket, bot yarışı, dikey mod, dolap, modlar, sahneler. App Store 6,7" ve 6,9" bölümüne yüklenir.

## Uygulamada web sürümünden farklı olanlar
- Mağaza gerçek: satın alma Apple'ın kendi penceresiyle yapılır, fiyatlar mağazadan TL olarak okunur.
- "Reklamsız" ürünü uygulamada yok. Oyunda reklam olmadığı için Apple incelemesinde sorun çıkarırdı. Başlangıç Paketi'ndeki üstü çizili "$9.99" fiyatı da uygulamada gösterilmiyor.
- Online yarış uygulamada "Yakında" olarak görünüyor. Online şu an sadece claude.ai linkinde çalışıyor; uygulamaya gelmesi için bir sunucu (ör. Supabase) bağlamak gerekir.
- Titreşim telefonun kendi titreşim motoruyla: vuruşta hafif, harekette orta, düşüşte güçlü.

## Yayına çıkmak için adımlar (bir geliştirici, Mac ile 1 gün)
1. Mac'e Xcode ve Node 20 kur. Bu klasörde: `npm install`, `npx cap add ios`, `sh tools/ios_setup.sh`, `npm run sync`.
2. Apple Developer hesabı (yıllık 99 $), Flix şirketi adına. ARKANA için açılan hesap aynen kullanılır. App Store Connect'te yeni uygulama: paket kimliği `com.flixtoys.kickup`.
3. App Store Connect > Uygulama İçi Satın Alma bölümünde aşağıdaki 7 ürünü **aynı kimliklerle** oluştur.
4. Xcode'da `ios/App` projesini aç, Signing'de ekibi seç, Capabilities'e "In-App Purchase" ekle. App ikonunu `store/icon-1024.png` ile değiştir.
5. Gizlilik politikasını (aşağıda) flixtoysofficial.com'da yayınla, linkini App Store Connect'e gir.
6. TestFlight ile gerçek telefonda dene: Sandbox hesabıyla bir tüy paketini ve Başlangıç Paketi'ni satın al, "Satın alımları geri yükle"yi dene, titreşimi hisset.
7. Yaş derecelendirmesi anketinde her şeye "Yok" de. Sonuç 4+ olur.
8. Ekran görüntülerini, metinleri yükle ve incelemeye gönder.

## Uygulama içi ürünler
| Kimlik | Tür | Fiyat | İçerik |
|---|---|---|---|
| kickup_starter | Tüketilemez | 2,99 $ | Başlangıç Paketi: 2.500 tüy + Kristal FLIX (tek sefer, geri yüklenebilir) |
| kickup_feathers_500 | Tüketilebilir | 0,99 $ | 500 tüy (Avuç) |
| kickup_feathers_1200 | Tüketilebilir | 1,99 $ | 1.200 tüy (Kese) |
| kickup_feathers_3500 | Tüketilebilir | 4,99 $ | 3.500 tüy (Sandık) |
| kickup_feathers_8000 | Tüketilebilir | 9,99 $ | 8.000 tüy (Hazine) |
| kickup_feathers_18000 | Tüketilebilir | 19,99 $ | 18.000 tüy (Dağ) |
| kickup_feathers_50000 | Tüketilebilir | 49,99 $ | 50.000 tüy (Ejderha Hazinesi) |

Kimliklerin başında `kickup_` var, çünkü aynı Apple hesabındaki ARKANA'nın ürünleriyle (ör. `starter`) karışmasın.

Oyun içi ekonomi: tüyler oyunda toplanır (her tüy 2 sayılır), her 10 puan tur sonunda 1 tüy olur, yıldızlar, bot ve kombo ödülleri de tüy verir. Tüylerle FLIX'ler, toplar, sahneler ve boru renkleri açılır. Altın FLIX ve Yıldız Sahne sadece rekorla açılır. Para yalnızca hızlandırır, hiçbir şey sadece parayla açılmaz.

Not: satın alma şu an telefonun içinde onaylanıyor. İleride hileyi azaltmak için sunucu doğrulaması (ör. RevenueCat) eklenebilir.

## Görüntü ve hız
- Çizim ekranın 2 katı çözünürlükte (iPhone'da keskin), fizik saniyede 240 adım, çizim ekran yenileme hızında (ProMotion telefonlarda 120 Hz).
- Duraklatma ve tur sonu ekranında sahne saniyede 15 kez çizilir; uygulama arka plana geçince oyun duraklar ve ses kapanır, geri gelince ses açılır.
- Sahne ve dolap kartlarının küçük resimleri bir kez çizilip saklanır.

## Mağaza metni (TR)
**Ad:** FLIX Kick Up
**Alt başlık:** Sektir, hareket yap, rekor kır!
**Açıklama:**
FLIX'i havada tut! Ekrana dokunarak tüylü FLIX'i sektir, direklerin arasından geçir, havada hareketler yap ve rekorunu kır.

• Tek parmakla oyna: ekranın solu hızlı atak, ortası dengeli, sağı yüksek vuruş.
• Basılı tut, kaydır, iki parmak kullan: Makas, Helikopter, Geri takla, Fırıldak, Dalış, Roket, Kırbaç ve Kelebek.
• Hareketleri art arda bağla, kombo yap, Şelale ve Füze gibi özel ikilileri yakala.
• Klasik ve Dikey mod, 3 bota karşı yarış ve 4 meydan okuma: 20 Saniye, Akrobat, Mesafe, Tüy Avı.
• 22 FLIX ve 5 top, Sıradandan Mitik'e: Kristal, Galaksi, Ateş Kuşu, Ejderha FLIX.
• 12 sahne: İstanbul Akşamı, Boğaz, Kapadokya, Gece Maçı, Kar Tatili, Uzay ve animasyonlu Lunapark Gecesi.
• 11 boru rengi, süreli x2 ve x4 puan rozetleri.
• Türkçe ve İngilizce. Reklam yok.

**Anahtar kelimeler:** flix, kick up, sektirme, tüy, jianzi, refleks, arcade, rekor, futbol, oyuncak

## Store listing (EN)
**Name:** FLIX Kick Up
**Subtitle:** Kick it, Flick it, Flix it!
**Description:**
Keep FLIX in the air! Tap to kick the feathered FLIX, fly it through the gaps between the posts, pull off tricks in mid-air and beat your high score.

• One-thumb play: the left of the screen kicks low and fast, the middle steady, the right high.
• Hold, swipe or use two fingers for tricks: Scissors, Helicopter, Backflip, Spinner, Dive, Rocket, Whip and Butterfly.
• Chain tricks into combos and land special pairs like Waterfall and Missile.
• Classic and Vertical modes, a race against 3 bots and 4 challenges: 20 Seconds, Acrobat, Distance, Feather Hunt.
• 22 FLIX and 5 balls from Common to Mythic: Crystal, Galaxy, Firebird, Dragon FLIX.
• 12 scenes: Istanbul Evening, the Bosphorus, Cappadocia, Night Match, Snow Holiday, Space and the animated Funfair Night.
• 11 pipe colours, timed x2 and x4 score badges.
• Turkish and English. No ads.

**Keywords:** flix, kick up, keepy uppy, shuttlecock, jianzi, reflex, arcade, high score, football, toy

## Gizlilik politikası (yayınlanacak metin)
FLIX Kick Up (Flix) hesap oluşturmaz; ad, e-posta, konum veya reklam kimliği toplamaz. Oyun ilerlemesi yalnızca cihazınızda saklanır. Uygulama içi satın alımlar Apple App Store tarafından işlenir; ödeme bilgilerinizi görmeyiz. Oyunda reklam ve analiz aracı yoktur. İletişim: flixtoysofficial.com.

App Store "Uygulama Gizliliği" bölümünde: **Veri toplanmıyor** seçilebilir.

## Lisanslar
Rubik yazı tipi (SIL Open Font License), ticari kullanıma açık. Oyunun geri kalanı Flix'e ait.
