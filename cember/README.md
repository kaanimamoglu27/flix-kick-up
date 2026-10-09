# FLIX Çember: oyun notu

Tek dosyalık tarayıcı prototipi: `flix-cember.html` (3D, sürüm 3). Three.js r128 cdnjs'ten yüklenir, başka bağımlılık yok. İlk 2D sürüm `flix-cember-2d-v1.html` olarak duruyor.

## Fikir
Jianzi'nin en bilinen oynanış biçimi: arkadaşlar çember olur, tüylü topu yere düşürmeden birbirine paslar. FLIX Çember bunu telefona taşır. Markanın "Kick it. Flick it. Flix it!" sloganı ve dossier'deki "Çember (grup) challenge" formatı doğrudan oyunun kendisi.

## Görünüm (sürüm 3)
- Toon gölgeli 3D park, karakterlerde çizgi film tarzı kontur, yüksek çözünürlük (cihaz piksel oranı 2,5'e kadar, telefon yetişemezse kendiliğinden düşer), 2048 gölge haritası.
- Karakterlerin dizi, dirseği, gövdesi ve başı ayrı eklemli. Animasyonlar anahtar karelerden yumuşak eğrilerle oynatılıyor, aralarında geçişler harmanlanıyor. Göz kırpma, topu gözle takip, hareket sırasında açılan ağız var.
- FLIX gerçek bir tüylü top gibi uçar: hızlı yükselir, havada süzülerek iner. Akrobatik hareketlerde kısa ağır çekim olur.

## Kontroller ve hareketler
- **Dokun**: halka kapanınca bir arkadaşa dokun, pas ona gider. Serbest modda boşluğa dokunursan oyun birini seçer.
- **Yukarı kaydır**: Rövaşata, ters takla atarak vuruş, +40.
- **Sağa kaydır**: Kasırga, havada 360 dönüş vuruşu, +30.
- **Sola kaydır**: Makas, havada makas vuruşu, +25.
- **Aşağı kaydır**: kendine sektir, sırasıyla Diz, Topuk, Omuz.
- Akrobatik hareketlerin zamanlama penceresi normal pasın %80'i.
- Klavye: Boşluk pas, 1-8 belirli arkadaşa pas, oklar hareketler.

## Modlar
- **Serbest**: istediğine pas ver. "Bana!" diyen arkadaşa 3 pas içinde ulaşmak +30.
- **Hedef**: her pasta kime atacağın belli (üstte isim, oyuncunun üstünde sarı ok, ayağında sarı halka). Ona dokunmalısın, yanlış kişi can götürür. Akrobatik hareketler otomatik hedefe gider. Zorluk artışı %20 daha hızlı.

## Zorluk
- Uçuş süresi 1,7 sn'den başlayıp 1,0 sn'ye iner. Zamanlama penceresi ±280 ms'den ±150 ms'ye daralır.
- Seri 12, 28, 48, 75'te çembere yeni arkadaş katılır (4'ten 8 kişiye). Seri 32'den sonra rüzgâr.
- Otomatik test (ilk düşüşe kadar seri): ±80 ms hatayla 300+, ±150 ms ile 28-113, ±220 ms ile 3-44.

## Detaylar
- Her arkadaşın bir müzik notası var; paslar bir melodi çalar.
- Ana menüde çember kendi kendine paslaşır.
- Rekorlar mod başına localStorage'da (`fcm4.best.free`, `fcm4.best.target`).
