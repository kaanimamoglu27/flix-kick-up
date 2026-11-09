# Flix Fabrika kaynak

Three.js r170 + esbuild, tek HTML dosyası üretir: `python3 build.py` (yanında `node_modules` içinde `three` ve `esbuild`, bir üst klasörde `fonts/` ile @fontsource woff2 dosyaları gerekir).

- `game.js`: dünya, hindi çiftliği, pres, montaj, tezgâh, müşteriler, karakter, elemanlar, kayıt (localStorage `flix_fabrika3`).
- `ui.js`: geliştirme / işe alım / dolap panelleri, mağaza, reklamlar (FlixAds ya da web demo), satın almalar (FlixNative ya da web demo), çevrimdışı kazanç.
- `config.js`: tüm sayılar: hindi renkleri ve FLIX fiyatları, alanlar, geliştirmeler, eleman, kozmetik, App Store ürünleri, reklam kuralları.
- `hero.js`: FLIX karakter modeli. `sfx.js`: sesler ve müzik. `intro.html`: FLIX TOYS açılışı. `icon.html`: geçici uygulama ikonu.

Çıktı `flix-fabrika.html` → depoda `fabrika/index.html` olarak, sonra `fabrika/app` içinde `npm run build`.

## 1.1 (2026-11-09)
- Test alanı: montajdan çıkan FLIX'ler satılmadan önce test edilir (✓ etiketi); tezgâh ve kamyon yalnız test edilmiş ürün alır.
- Oyuncakçı kamyonu (₺1.200): doldurunca yola çıkar, döndüğünde 1,5 kat öder. Geliştirme: Kamyon (kapasite, sefer süresi).
- Yeni salon (₺900) ile harita sağa büyür; FLIX Top hattı, Hediye paketi (3 FLIX = 1,6 kat değer), Konveyör, Hindi sürüsü.
- Her açılan alan fabrika seviyesini artırır: yeni süsler, makineler Sv 3'te gümüş, Sv 6'da altın; müşteri sırası ve sipariş büyür.
- Elemanlar rol alır: 1. satıcı, 2. test/hat, diğerleri montajı besler.

## 1.2 (2026-11-09)
- Ana menü (OYNA/DEVAM, Dolap, Bonus, Mağaza, Ayarlar), arkada dönen fabrika görüntüsü. Oyunda ⚙️ ile ana menüye dönülür.
- Tek tasarım dili: kırmızı başlıklı krem paneller, kalın kenarlı kartlar, alt gölgeli butonlar.
- Test alanında bir çocuk FLIX'i sektirerek test eder (3 sektirme, Sv 3'ten sonra 2).
- Müşteriler tezgâhtaki ürünleri kendileri alır; kasiyer ya da sen kasadaysan 3 kat hızlı.
- Elemanlar boş durmaz (daha yüksek montaj stoğu, kısa bekleme, daha hızlı).
- Süreli bonuslar (reklam ya da 💎): 2x Kazanç, Turbo Hız, Çift Üretim, Müşteri Akını, Para Mıknatısı.
- Kozmetikler yalnız 💎 ile alınır ve giyilince bonus verir (hız, taşıma, kâr).
- Daha detaylı insanlar (yüz, saç, kıyafet desenleri, çocuklar), karo/ahşap zemin, makine panelleri, tezgâh üstleri.
