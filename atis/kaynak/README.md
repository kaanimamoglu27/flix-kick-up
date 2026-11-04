Flix Atış kaynak dosyaları.

v4 (güncel, 1.1): dikey ekran, tüy parası, dükkân (10 kostüm, 6 uçuş izi, tüy paketleri), reklamlar ve satın almalar, yüksek kaliteli kaplamalar.
game4.js, game3.js'e `python3 patch4.py` ile uygulanan yamalardır (tex4.js = kaplamalar, shop4.js = ekonomi/dükkân/reklam/ödeme).
shell4.html, shell3.html'den `python3 mkshell4.py` ile üretilir. Derleme: `python3 build4.py <three.js yolu> <çıktı>`.
Uygulamada reklam ve ödeme app/www/ads.js, ads-config.js, native-bridge.js ile çalışır (Kick Up'takiyle aynı altyapı); web'de reklam yerine FLIX tanıtım kartı, ödeme yerine açıkça "DEMO" yazan bir ekran çıkar.

v3 (güncel, golf usulü sokak): game3.js + shell3.html, `python3 build3.py <three.js yolu> <çıktı>` ile tek HTML'e derlenir
(varsayılan çıktı flix-atis.html; GitHub Pages için ../index.html'e kopyalanır). game3.js; game_v2.js'in çekirdeği (render, oyuncak,
karakterler, fizik, ses) + levels3.js + world3.js + play3.js'ten oluşur. Bölüm değişince levels3.js'i düzenleyip `python3 splice.py` çalıştır.
intro.html = FLIX TOYS presents açılışı. Testler (Playwright): t8.js bot 8 bölümü oynar (?bot=1), t9.js dokunmatik test.
Eski sürümler: game.js/shell.html (v2 kuşbakışı sokak), game_rooftop.js (v1 çatılar).
