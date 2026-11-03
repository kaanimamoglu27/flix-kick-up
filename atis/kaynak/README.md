Flix Atış kaynak dosyaları.

v3 (güncel, golf usulü sokak): game3.js + shell3.html, `python3 build3.py <three.js yolu> <çıktı>` ile tek HTML'e derlenir
(varsayılan çıktı flix-atis.html; GitHub Pages için ../index.html'e kopyalanır). game3.js; game_v2.js'in çekirdeği (render, oyuncak,
karakterler, fizik, ses) + levels3.js + world3.js + play3.js'ten oluşur. Bölüm değişince levels3.js'i düzenleyip `python3 splice.py` çalıştır.
intro.html = FLIX TOYS presents açılışı. Testler (Playwright): t8.js bot 8 bölümü oynar (?bot=1), t9.js dokunmatik test.
Eski sürümler: game.js/shell.html (v2 kuşbakışı sokak), game_rooftop.js (v1 çatılar).
