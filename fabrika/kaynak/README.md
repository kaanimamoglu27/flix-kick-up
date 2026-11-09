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

## 1.3 (2026-11-09)
- Kamera sakinleşti: oyuncu etrafında ölü bölge, kare hızından bağımsız yumuşak takip, gölge kamerası adım adım (titreme yok).
- Endgame test modu (Ayarlar → 🧪): ayrı kayıt (flix_fabrika_end), her alan açık, tüm geliştirmeler en üstte, 4 taşıyıcı + kasiyer, tüm kozmetikler, tüm bonuslar kalıcı. Normal kayda dokunmaz.
- Her alanın pedinde ve açılış mesajında etkisi yazar; Yeni salon artık +%10 satış ve +2 müşteri verir. Salon/kamyon/top hattı daha ucuz (600/800/1800).
- Kozmetikler: 10 kostüm, 10 aksesuar (baret, şapka, atkı, tüy kanat, ışık halesi eklendi), 9 zemin (çim, mermer, satranç, gece).
- Hata: tutorialda tek tür hammaddeyle çanta dolup takılma düzeldi (tüy/taban en fazla kapasitenin yarısı).
- Elemanlar kamyonu ve hediye paketini de besler.

## 1.4 (2026-11-09)
- Harita büyüdü: ön bölge genişledi (kasalar, yol, kamyon rampası öne taşındı), 4 kasa (Kasa 2/3/4 alanları), Büyük çiftlik (göl, saman, 8 yeni hindi, ikinci tüy kasası).
- Tüy bandı: çiftlikten montaj masalarına ve presten masalara havadan taşıyan bant; "Tüy bandı hızı" geliştirmesi (6 seviye).
- Test: onaylanmayan (hatalı) Flix'ler kırmızı X ile HATALI yığınına gider; Geri dönüşüm makinesi onları Flix anahtarlığına çevirir.
- Peluş atölyesi: tüyden Peluş Flix yapar. Yeni ürünler: peluş, anahtarlık.
- Elemanlar: en fazla 8 taşıyıcı, her kasaya bir kasiyer (4). Izgara üzerinde yol bulma (A*), hızlanıp yavaşlayarak dönme, birbirinden kaçınma, takılınca yeniden plan; işler paylaşılıyor, iki eleman aynı yığına koşmuyor; boşta oyuncuya bakıyor.
- Müşteriler kaldırımdan gelip en kısa kuyruğu seçiyor; kasiyersiz kasada oyuncu yanındayken satış.
- Test kuyruğu uzayınca test çocuğu hızlanır; test seviyesi 5+ tek sektirme.
- Hata: 1.3'te yazılan ucuz ped fiyatları uygulanmıyordu; düzeltildi. Tüm pedler yeniden fiyatlandı.

## 1.5 (2026-11-09)
- Test artık bir oyun parkı: 3 çocuk aynı anda sektiriyor (kaydırak, salıncak, renkli kauçuk zemin). Test seviyesi 10'a çıktı.
- Ofis gerçek bir oda: cam duvarlar, açılan kapı, masa, ekran, kupa rafı (her 6 geliştirme seviyesinde bir kupa). Kâr, Reklam & tanıtım ve Sipariş primi sınırsız yükselir; diğer geliştirmelerin tavanı yükseldi.
- Sonsuz siparişler: üstte sipariş kartı (N adet belli renk FLIX sat → ₺ + 💎), her sipariş biraz büyür.
- Müşteriler mavi, kırmızı, sarı ya da karışık sipariş veriyor; tam istediğini alan %30 fazla ödüyor, 9 sn bulamazsa karışığa razı oluyor.
- B Blok (sola genişleme): kapılı duvar, depo rafları, forklift, 4. montaj, 2. pres, 5. kasa; çiftlik de sola büyüyor.
- Tüy toplayıcı robotlar (2 + garajla 3 daha), Toplayıcı robot geliştirmesi.
- Patron seviyesi ve unvanlar (Çırak, Usta, Şef, Patron, Efsane): karakterin altında renkli halka, karakter büyüyor, ofiste Patron kartı.
- Kozmetik: 6 yeni kostüm, 4 yeni aksesuar, 3 yeni zemin; elemanlar için 8 kıyafet ve 8 şapka (eleman hız/taşıma bonusu).
- Flix Rush ve Flix Kick Up tanıtımı: yolun karşısında iki pano, ana menüde kartlar, mağazada "Diğer FLIX oyunları", web reklam kartı.
- Görsel: makinelerde çizgi roman hatları, kalın kenarlı tabelalar, gökyüzü geçişi, çim dokusu, siloslar, dumanlı bacalar, su kulesi.
- Performans: kare hızına göre otomatik çözünürlük, müşteri ve tüy geometrileri paylaşımlı (bellek sızıntısı yok), küçük eşyalar gölge atmıyor.
- Endgame: eski Endgame kaydına yeni alanlar ve geliştirmeler otomatik eklenir.
