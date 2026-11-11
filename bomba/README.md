# Flix Bomba (v1.2)
3D bomba-labirent oyunu. Tek dosya: `index.html` (kaynaklar `kaynak/`). Önceki sürümler: `v11.html`, `v1.html`.

Modlar: Macera (20 bölüm: canavarları patlat, gizli kapıyı bul, çık), Arena (4 kişilik maç), Bulmaca (12 bölüm, sınırlı bomba), Online (hızlı eşleşme ya da oda koduyla 2-4 kişi).
Online yalnızca oyunun claude.ai bağlantısında çalışır (sayfanın canlı oda özelliğini kullanır). Hızlı eşleşmede 10 saniye içinde kimse gelmezse maç bilgisayar oyuncularıyla başlar.

v1.2: Türkçe/İngilizce, profil (isim, seviye, istatistik), avatar özelleştirme (yüz, zemin, çerçeve, rozet), tüy ekonomisi, 7 günlük ödül, mağaza (tüy paketleri `bomba_tuy_*`, `bomba_noads`; web'de deneme), ödüllü ve geçiş reklam bağlantıları (`window.FlixAds`, web'de Flix tanıtım kartı), maç öncesi rakip ekranı.

## Derleme
`kaynak/` içinde: `python3 patch12.py` (game_v11.js + meta.js + ui12.js -> game.js, shell_v11.html + css12.css + body12.html -> shell.html), sonra `python3 build.py`.

- `kaynak/chars.js`: karakter modelleri ve özellikleri (Flix, Usta Wu, Kick, Flick, Buzul Flix).
- `kaynak/world.js`: ada haritası, bloklar, bomba, patlama, güçler, canavarlar, kapı.
- `kaynak/meta.js`: dil, profil, seviye, avatar, bilgisayar oyuncuları, eşleşme ekranı, reklam, mağaza, günlük ödül.
- `kaynak/ui12.js`: arayüz ve düğmeler. `kaynak/game_v11.js`: oyun mantığı, botlar, online (`NET`). Test: `window.__fb`.
- `kaynak/puzgen.js`: bulmaca üretici ve çözücü.
- Izgara kuralları ve bot döngüsü MattSkala/html5-bombergirl (MIT) temel alınarak yeniden yazıldı. Müzik motoru: fecolinhares/super-kart-3djs (MIT).
