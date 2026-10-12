**Oyna:** https://kaanimamoglu27.github.io/flix-kick-up/

Online yarış (rastgele rakip ve arkadaş odası) sadece claude.ai'daki oyun linkinde çalışır. GitHub Pages sürümünde diğer bütün modlar çalışır. Mağaza test modundadır, gerçek ödeme alınmaz.

# FLIX Kick Up: prototip devir notu

Tek dosyalık tarayıcı prototipi: `flix-kick-up.html`. Bağımlılık yok (yalnızca Google Fonts). Bir tarayıcıda açmak yeterli; telefonda test için herhangi bir statik sunucuya koyun.

## Oyun özeti
Yan kaydırmalı engel oyunu (Flappy Bird / Jetpack Joyride tadında). Tüylü FLIX (Jianzi tarzı shuttlecock) kendiliğinden sağa ilerler, oyuncu dokunarak sektirir, direklerin arasındaki boşluklardan geçirir. Direğe ya da yere değerse tur biter.

## Kontroller
- Ekran üç bölge: **Sol** (alçak + hızlı, ileri boost), **Orta** (düz, kontrollü), **Sağ** (çok yüksek, fren). Değerler: `KICKS` dizisi.
- **Basılı tut** (0,16 sn sonra): hava hareketi başlar, tutarken vuruş yapılamaz.
  - Bölgeye göre: Makas / Helikopter / Geri takla
  - Tutarken kaydırma: ↑ Fırıldak, ↓ Dalış (çift puan), → Roket, ← Kırbaç
  - İki parmak: Kelebek (süzülme, saniye başına puan)
  - Parmağı kaldırmadan yön değiştirmek hareketleri bağlar (Geçiş, +10)
  - Tanımlar: `TRICKS` nesnesi (spin hızı, yerçekimi çarpanı, ileri itiş, puan)
- Klavye (masaüstü): A/←, S/W/Space/↑/↓, D/→

## Puanlama
- Direk: 10, tam ortadan: +5, direğe çok yakın geçiş ("Sıyırdın"): +10
- Hareketler: 180° başına puan × stil çarpanı (5 sn içinde art arda hareketle x5'e kadar)
- Altın tüyler: skin para birimi (localStorage'da)

## Zorluk
- Hız ve boşluk genişliği geçilen direk sayısına (`S.gates`) bağlı: `speedNow()`, `gapNow()`
- Engel türleri: düz direk, 4+ hareketli boşluk, 9+ yüksek duvar, 14+ tünel (`spawnObstacle`)

## Teknik notlar
- Fizik sabit 240 Hz adımla, çizim interpolasyonla (`frame`, `step`, `drawScene`)
- Tüm birimler oyun alanı yüksekliğine (`U`) göre ölçekli, farklı ekranlarda aynı his
- FLIX yönü: taban uçuş yönüne bakar, dönüş yaylı (spring) sönümlenir
- İstanbul silüeti iki paralaks katman olarak bir kez offscreen canvas'a çizilir

## Sürüm 2 (12 Ekim 2026)
- Önceki sürüm: `flix-kick-up-v1.html`.
- Görünüm: basılı oyuncak kutusu tarzı (düz renkler, kalın mürekkep çizgileri, sert gölgeler, nokta deseni). Fontlar Bungee + Rubik. Bungee yalnız büyük harf olduğu için metinler `lang="tr"` ile CSS'te büyütülür (i → İ).
- Menüler: Ana ekran (Oyna, Dolap, Sahneler, Nasıl?, Ayarlar), mola (⏸, P/Esc, sekme gizlenince otomatik), tur sonu ekranı, "Dokun ve başla" bekleme anı.
- Ekonomi: tur sonunda toplanan tüy + her 10 puan 1 tüy. `SKINS` (15 FLIX) ve `SCENES` (6 sahne) listelerinde `price` tüyle satın alınır, `best` rekorla kendiliğinden açılır (Altın FLIX: 400, Yıldız Sahne: 300).
- Sahne çizimleri `ART` nesnesinde: gökyüzü, güneş/ay, iki paralaks katman, zemin, direk renkleri.
- localStorage: `fku2.coins`, `fku3.best`, `fku4.owned`, `fku4.skin`, `fku4.scene`, `fku4.settings`. v1'deki seçili skin otomatik "sahip olunan" sayılır.

## Sürüm 3 (12 Ekim 2026)
- Görünüm sadeleşti: beyaz kartlar, tek turuncu vurgu, yumuşak gölgeler, tek font (Rubik). Gökyüzündeki nokta deseni kalktı.
- Animasyonlu ana ekran: FLIX harfleri düşerek gelir ve sırayla zıplar, FLIX kendi kendine sekiyor, ekrana dokununca daha yükseğe sekiyor.
- Dolap'a kilitli toplar eklendi (`SKINS` içinde `ball` alanı, çizim `drawBall`): Futbol 100, Tenis 120, Basketbol 150, Plaj 180, Voleybol 220 tüy. Oynanış aynı.

## Sürüm 4 (12 Ekim 2026): modlar
- Oyna tuşu mod seçimini açar. Harita artık tohumla (seed) üretiliyor ve tüm ölçüler U cinsinden, böylece aynı tohum her ekranda aynı haritayı verir (`mulberry`, `lv`, `spawnObstacle`). Zorluk geçilen direk yerine üretilen engel sırasına bağlı (`gapFor`).
- Bota karşı (Kolay/Orta/Zor): `newBot`, `stepBot`, aynı fizik ve basit otomatik pilot. Oyuncu düşünce bot ekran dışında uçmaya devam eder ve sonuç `finishBot` ile belirlenir. Daha çok direk geçen kazanır.
- Hayalet: Meydan okuma dışındaki en iyi tur (puana göre) saniyede 20 kare olarak `fku4.ghost`'a kaydedilir ve aynı haritada yarı saydam uçar.
- Online: artifact `room` yeteneğiyle canlı yarış. Yalnızca presence kullanılıyor: oda kodu, Hazırım, en küçük peer etiketine sahip hazır oyuncu `go {seed, at}` yayınlar, herkes 3 sn geri sayımla başlar, konumlar presence ile paylaşılır. Giriş yapmış ve artifact'a erişimi olan kişilerle çalışır. Artifact CSP'si dış adresleri engellediği için Supabase burada kullanılamaz.
- Meydan okumalar (`CH`): 10 Saniye (direk), Akrobat (en uzun tek hareket), Tüy Avı (20 sn), Tam İsabet (30 sn). Her biri için 3 yıldız eşiği var, her yeni yıldız 20 tüy. En iyiler `fku4.ch`'de tutuluyor.

## Sürüm 5 (12 Ekim 2026): marka ve dikey mod
- Arayüz FLIX logosunun renklerinde: kırmızı #e22511, lacivert #022753, sarı #ffc20e. Logo `flix-logo.png` (arka planı ayıklanmış), sayfaya webp olarak gömülü. Ana ekranda logo süzülüyor, dokununca sekiyor, arkada dönen ışınlar var.
- Modlar: Klasik, Dikey, Botlara karşı, Online, meydan okumalar (10 Saniye, Akrobat, Tüy Avı). Hayalet ve Tam İsabet menüden çıkarıldı (hayalet kodu duruyor).
- Botlara karşı: 3 bot (Kartal, Şimşek, Zıpzıp; zorluk seçimine göre karışık seviyeler). En uzun süre uçan kazanır. Oyuncu düşünce botlar en fazla 90 sn daha simüle edilir (`finishBots`). Online sıralama da süreye göre.
- Dikey (`spawnBar`, `stepV`, `drawVertical`): FLIX'i yukarı sektiriyorsun. Sol ve sağ bölge yana iter, orta düz yukarı. Kamera sadece yukarı gider, ekranın altına düşmek ya da çubuğa çarpmak turu bitirir. Rekor `fku4.vbest`.

## Sürüm 6 (12 Ekim 2026): kombo
- Fiyatlar yaklaşık 2,5 katına çıktı: FLIX'ler 100 ile 1100, toplar 250 ile 550, sahneler 200 ile 1300 tüy arası. Altın FLIX rekor 600, Yıldız Sahne rekor 500 ile açılıyor.
- Kombo: hareketler 2,5 sn (`COMBO_WIN`) içinde art arda gelirse kombo artar ve her biri +5 fazla verir. Özel ikililer (`NAMED`, ör. Fırıldak sonra Dalış = Şelale) +40 verir.
- FLIX'in üstünde hareket süresi ve kombo çubuğu çiziliyor (`drawMeter`). Tur sonunda "En iyi kombo" gösteriliyor.

## Sürüm 7 (12 Ekim 2026): boru renkleri, nadirlik, mitik FLIX
- Dikey mod %25 daha hızlı (yerçekimi 3.6U, vuruş -1.03U, yan itiş ±0.56U, vuruş aralığı 0.13 s, kamera daha hızlı takip ediyor). Harita geometrisi aynı kaldı.
- Nadirlik: Sıradan, Nadir, Epik, Efsane, Mitik. Kartlarda etiket ve renkli zemin var, fiyatlar seviyeye göre ayarlandı (Sıradan 150-300, Nadir 500-800, Epik 1200-1800, Efsane 3000-4500).
- Yeni FLIX'ler: Lav, Okyanus (Nadir), Gün Batımı, Kristal (Epik), Galaksi, Ateş Kuşu (Efsane), Ejderha (Mitik, 999.999 tüy; renk değiştiren tüyler, aura ve dönen yıldızlar).
- Borular dükkânı (ana ekranda 4. kutucuk, `fku4.pipe`): Sahne Rengi bedava, ardından 10 renk: Klasik, Lacivert, Çimen, Pamuk, Buz, Gece, Altın, Neon, Gökkuşağı, Lav.
- Yeni sahneler: Yaz Plajı 350, Kar Tatili 800 (kar yağıyor), Uzay 3500 (halkalı gezegen, ay yüzeyi). Eski sahnelerin fiyatları da nadirliğe göre güncellendi.
- Ekonomi:
  - Her tüy 2 sayılıyor.
  - Yıldız başına 40 tüy.
  - Bot yarışında 1. olana +40, 2. olana +15 tüy.
  - Online birinciye +60 tüy.
  - En iyi kombo 5 ve üstüyse +10, 8 ve üstüyse +25 tüy.
  - Tüy Avı yıldızları 8/16/24 oldu.

## Sürüm 8 (12 Ekim 2026): dil, geri sayım, süreli çarpan
- Ejderha (Mitik) artık 15.000 tüy.
- Oyna ekranı üç renkli bölüme ayrıldı. Tek başına (Klasik ve Dikey büyük kartlar), Yarış (botlar ve online) ve Meydan okumalar (üç küçük kart, yıldızlar ve en iyi skor).
- Ayarlarda dil seçimi var: Türkçe ve English (`fku4.lang`, seçince sayfa yenilenir). Kaynak metinler Türkçe, `EN` tablosu çeviriyi tutuyor. JS'deki metinler `L("...")` ile, sayfadaki sabit metinler `localize` ve bir MutationObserver ile çevriliyor.
- Süreli modlarda (10 Saniye, Tüy Avı) skorun altında büyük bir geri sayım ve süre çubuğu var. Son 3 saniye sarıya döner, sekme ve bip sesiyle saniye sayar.
- Süreli çarpanlar: x2 (8 sn) ve x4 (5 sn) rozetleri. En erken 6. direkten sonra çıkarlar, iki rozet arasında en az 12 direk olur ve her direkte %8 şans vardır. Dörtte biri x4'tür. Meydan okumalarda çıkmazlar. Haritaya tohumla yerleştikleri için online ve bot yarışında herkes aynı rozetleri görür. Aktifken bütün puanlar çarpılır ve HUD'da kalan süre görünür.

## Sürüm 9 (12 Ekim 2026): yeni sahneler, rastgele rakip, GitHub
- Yeni sahneler: Orman (Nadir, 600), Çöl (Epik, 1.600) ve Lunapark Gecesi (Mitik, 15.000). Lunapark animasyonlu: dönme dolap dönüyor, ampuller yanıp sönüyor, havai fişekler patlıyor (`drawFunfair`).
- Online yarışta iki yol var. Rastgele rakip: herkes aynı açık odaya ("HERKES") girer ve otomatik hazır olur, iki kişi olunca yarış kendiliğinden başlar. Arkadaşınla: eskisi gibi oda kodu ile.
- GitHub'a yüklendi (main ve gh-pages): https://kaanimamoglu27.github.io/flix-kick-up/ . Online yarış sadece claude.ai linkinde çalışır.

## Sürüm 10 (12 Ekim 2026): Mesafe modu
- Yeni meydan okuma Mesafe: 30 saniyede gidebildiğin kadar uzağa git (metre, yıldızlar 60/120/170 m).
- Geri sayım ve süreli çarpan artık ekranın sağ üst köşesinde, küçük bir kutuda. Meydan okumalar 2x2 kart olarak dizili.

## Sürüm 11 (12 Ekim 2026): mağaza (test)
- Ana ekrandaki tüy sayacına (+) dokununca Mağaza açılıyor.
  - Başlangıç Paketi kampanyası: $2.99 (normalde $9.99). 2.500 tüy ve Kristal FLIX veriyor, tek seferlik, 48 saatlik geri sayımı var.
  - Reklamsız: $2.99.
  - Tüy paketleri: 500 tüy $0.99, 1.200 tüy $1.99, 3.500 tüy $4.99, 8.000 tüy $9.99, 18.000 tüy $19.99, 50.000 tüy $49.99.
- Test sürümü: gerçek ödeme alınmıyor, onaylayınca tüyler hemen ekleniyor (`fku4.iap`). Gerçek satın alma iPhone uygulamasında App Store uygulama içi satın alma (StoreKit) ile yapılacak. Oyunda henüz reklam yok, Reklamsız sadece bayrak tutuyor.
- Hata düzeltmeleri:
  - Meydan okumalar artık Klasik rekorunu değiştirmiyor.
  - Çarpan ve geri sayım kutusu tur sonu ekranında kalmıyor.

## Önerilen sonraki adım
Expo (React Native) + react-native-skia ile iPhone'a taşıma, EAS Build ile bulutta derleme, TestFlight ile test. Yayın Onat'ın Apple geliştirici hesabından yapılacak.
