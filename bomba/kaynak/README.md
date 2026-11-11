# Flix Bomba (v1.0)
3D bomba-labirent arena oyunu. Tek dosya: `../flix-bomba.html` (`python3 build.py` ile üretilir).
- `chars.js`: karakter modelleri (Flix, Usta Wu, Kick, Flick, Buzul Flix) ve CHARS listesi (hız, bomba, menzil, özel güç).
- `world.js`: ada haritası, harita temaları (`THEMES`), bloklar, bomba modeli, patlama, parçacıklar, güçler.
- `game.js`: oyun mantığı, bot yapay zekâsı, kamera, HUD, ses. Test: `window.__fb` (`__fb.G.auto=true` oyuncuyu bota verir, `__fb.sim(n)` n kare ilerletir).
- Izgara kuralları ve bot döngüsü MattSkala/html5-bombergirl (MIT) temel alınarak 3D için yeniden yazıldı. Müzik motoru: fecolinhares/super-kart-3djs (MIT).
- Kayıt anahtarı: `flix_bomba1`.
