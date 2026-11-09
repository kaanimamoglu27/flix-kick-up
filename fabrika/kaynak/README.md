# Flix Fabrika kaynak

Three.js r170 + esbuild, tek HTML dosyası üretir: `python3 build.py` (yanında `node_modules` içinde `three` ve `esbuild`, bir üst klasörde `fonts/` ile @fontsource woff2 dosyaları gerekir).

- `game.js`: dünya, hindi çiftliği, pres, montaj, tezgâh, müşteriler, karakter, elemanlar, kayıt (localStorage `flix_fabrika3`).
- `ui.js`: geliştirme / işe alım / dolap panelleri, mağaza, reklamlar (FlixAds ya da web demo), satın almalar (FlixNative ya da web demo), çevrimdışı kazanç.
- `config.js`: tüm sayılar: hindi renkleri ve FLIX fiyatları, alanlar, geliştirmeler, eleman, kozmetik, App Store ürünleri, reklam kuralları.
- `hero.js`: FLIX karakter modeli. `sfx.js`: sesler ve müzik. `intro.html`: FLIX TOYS açılışı. `icon.html`: geçici uygulama ikonu.

Çıktı `flix-fabrika.html` → depoda `fabrika/index.html` olarak, sonra `fabrika/app` içinde `npm run build`.
