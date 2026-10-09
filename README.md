**Oyna:** https://kaanimamoglu27.github.io/flix-kick-up/ · **FLIX Çember:** https://kaanimamoglu27.github.io/flix-kick-up/cember/

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

## Önerilen sonraki adım
Expo (React Native) + react-native-skia ile iPhone'a taşıma, EAS Build ile bulutta derleme, TestFlight ile test. Yayın Onat'ın Apple geliştirici hesabından yapılacak.
