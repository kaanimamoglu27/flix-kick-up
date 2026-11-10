# Flix Bomba (v1.1)
3D bomba-labirent oyunu. Tek dosya: `index.html` (kaynaklar `kaynak/`, `python3 build.py` ile üretilir). Önceki sürüm: `v1.html`.

Modlar: Macera (20 bölüm, canavarlar ve çıkış kapısı), Arena (3 bota karşı), Bulmaca (12 bölüm, sınırlı bomba), Online (oda koduyla 2-4 kişi).
Online yalnızca oyunun claude.ai bağlantısında çalışır (sayfanın canlı oda özelliğini kullanır); GitHub Pages'te diğer üç mod çalışır.

- `kaynak/chars.js`: karakter modelleri ve özellikleri (Flix, Usta Wu, Kick, Flick, Buzul Flix).
- `kaynak/world.js`: ada haritası, bloklar, bomba, patlama, güçler, canavarlar, kapı.
- `kaynak/game.js`: oyun mantığı, modlar, bot yapay zekâsı, online (`NET`), kamera, arayüz. Test: `window.__fb`.
- `kaynak/puzgen.js`: bulmaca üretici ve çözücü (`node puzgen.js 5 > puz.json`).
- Izgara kuralları ve bot döngüsü MattSkala/html5-bombergirl (MIT) temel alınarak yeniden yazıldı. Müzik motoru: fecolinhares/super-kart-3djs (MIT).
