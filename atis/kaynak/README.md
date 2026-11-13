Flix Atış kaynak dosyaları.

v10.1 (1.5.3, 2026-11-13 genel test): 180 bölüm x 3 nişan seviyesi botla oynandı (simtest.py + t70.js: hızlı simülasyon, render yok).
Düzeltmeler (patch10.py sonu): hayvanlar (güvercin, kedi, köpek) artık FLIX'i sektirip çatıdan düşürmüyor (güvercin etkisiz, kedi/köpek hafif yavaşlatır, sadece insanlar sektirir;
Çatı Katı mükemmel atışla bile geçilemiyordu). Bölüm değişince eski bölümün geometri/malzeme/dokuları serbest bırakılıyor (disposeTree; önceden her bölümde ~60 doku sızıyordu).
Sonuç: mükemmel nişan 180/180 (ort. 2.3 atış), ortalama 178/180, acemi 180/180.

v10 (1.5.2): çamaşır ipleri artık FLIX'i durdurmuyor, sadece yavaşlatıyor (kind 'slow': her ipte bir kez hız x0.72, yukarı hız en fazla 1.5, içinden geçer, hışırtı sesi).
Dükkân vitrinleri dükkânın türüne göre çiziliyor (shops10.js: shopKind ada göre 18 tür; eczane = beyaz raflar, ilaç kutuları, yeşil haç, kırmızı tabela ve "E" amblemi;
fırın simit/ekmek, kasap asılı et, dönerci döner, kafe çay bardağı/fincan, berber ayna/koltuk, oyuncakçı ayıcık/top/FLIX, nalbur alet panosu, manav kasalar,
şekerci kavanoz/lolipop, terzi elbise, lokanta masa + MENÜ, balıkçı buz tezgâhı, market raflar, sörf, çizgi roman, çamaşırhane). Tabelanın solunda tür amblemi.
game10.js = game9.js + `python3 patch10.py`; derleme `GAME_F=game10.js python3 build8.py` ve sonra `python3 /mnt/project-files/flix/yasal_menu/integrate.py atis flix-atis.html`.

v9 (1.5.1): gerçek AdMob (sadece iOS uygulamasında; web'de FLIX tanıtım kartı aynen kalır). Kimlikler app/www/ads-config.js'te.
Geçiş reklamı her 3 biten bölümde bir (kazanma ya da 8 atışın bitmesi, 3. bölümden sonra), ödüllü reklamdan sonraki 90 sn içinde hiç çıkmaz.
Ödüllü +60 tüy (dükkân, günde 6) ve 2x tüy / günlük hediye x2 aynı birimi, "+2 atış hakkı" ayrı birimi kullanır; ödül sadece AdMob'un ödül bildiriminden sonra verilir.
Reklam yüklenmezse oyun beklemez (ödüllüde en fazla 5-8 sn). Banner yok. Geliştirme derlemeleri Google test reklamı gösterir; gerçek reklam sadece
ADS_MODE=real ile (./ios.sh yukle, TestFlight iş akışı). game9.js = game8.js + `python3 patch9.py`; derleme `GAME_F=game9.js python3 build8.py`.

v8 (1.5): adil bölümler (fairLevel: kova binaya değiyorsa rotada geri kayar; kovanın/başlangıcın üstündeki ip, araba, büfe vb. kaldırılır),
kamera ile FLIX arasındaki binalar saydamlaşır (OCC/fadeOcc), kamera sadece bir şeyin içine düşecekse yaklaşır/yükselir. Tam çekiş daha güçlü (VMAX 19.5),
sekme 0.32 -> 0.45. Her bölümde 8 atış hakkı, par 2-3 (pars8.js = botun atışı, 2-3 arası). Yıldız: par = 3, par+2'ye kadar 2, sonrası 1.
Bölümler daha çeşitli (worlds8.js: meydan + anıt, kanal + iki köprü, merdiven); açık dünyalarda (Afrika, Antarktika, Avustralya, Uzay) dükkan duvarı yerine
kulübe/iglo/palmiye/kubbe (look8.js themedLot), şehirlerde cumba, pagoda saçağı, yangın merdiveni, çiçek saksısı (facadeExtra). extra8.js: anıtlar, su, yerel arabalar, ipe asılı süsler.
FLIX skinleri desenli, tüy baskılı, aksesuarlı (skin8.js); dükkân kartlarında gerçek 3D resimler. game8.js = game7.js + `python3 patch8.py`; derleme `python3 build8.py`.
Bot: `node t51.js 0,1,2` (NZ=1 ortalama oyuncu, NZ=2 yeni oyuncu gibi nişan hatası ekler).

v7 (1.4): 9 harita x 20 = 180 bölüm: Sokak, Türkiye, Amerika, Avrupa, Asya, Avustralya, Afrika, Antarktika, Uzay.
Ücretli bölüm yok: bir sonraki harita, öncekinin 10. bölümü geçilince tüyle açılır (WORLDS[].cost; SAVE.wOwn). Para sadece kozmetik için.
Her haritada yol kenarı süsleri (deco7.js: genDeco/decoProp, kendi rastgele sayılarıyla, bölüm yerleşimini değiştirmez), bitişin arkasında simge yapı (landmark),
yerel hayvan (LOCAL_ANI). Yeni haritaların kaplama/cephe/çatı/gökyüzü theme7.js (mktheme7.py), bölüm adları ve parlar worlds7.js (mkworlds7.py).
Kamera binaya girmez: önce yükselir, sonra yaklaşır (camBlock). Dükkân: 20 FLIX, 10 iz, 12 insan, 12 hayvan, nadirlik etiketleri, kürsü.
v6 kayıtları otomatik yeni numaralara taşınır (SAVE.v7). game7.js = game6.js + `python3 patch7.py`; shell7.html = shell6.html + `python3 mkshell7.py`; derleme `python3 build7.py`.

v6 (1.3): 4 dünya x 20 bölüm = 80 bölüm: Sokak (levels5.js, elle), Amerika, Avrupa, Uzay (worlds6.js: genLevel üretir, par = botun atış sayısı, GEN_PARS).
Her dünya bir öncekinin 10. bölümü geçilince açılır; her dünyada 11-20 paketli (atis_sokak2 = Bölüm paketi, ₺119,99 ya da 20.000 tüy).
Dünyaya göre kaplama, cephe (tuğla/taş/metal), çatı, gökyüzü (theme6.js); Uzay'da az yerçekimi (g 8.5), astronotlar ve yeşil uzaylılar.
Ana menüde dünya seçimi, bölümler ekranında dünya sekmeleri (mkshell6.py). game6.js = game5.js + `python3 patch6.py`; shell6.html = shell5.html + `python3 mkshell6.py`; derleme `python3 build6.py <three.js yolu> <çıktı>`.
Bot testi: t33.js (node t33.js 20,21,...).

v5 (1.2): Kick Up tarzı ana menü, 20 bölüm (levels5.js; 11-20 Sokak 2 paketi: atis_sokak2 ya da 12.000 tüy), komik dükkân isimleri,
insanlar FLIX'i sektirip rastgele şutlar (npc5.js: startJuggle/jugTick), insan ve hayvan skinleri (npc5.js), FLIX kovanın dibine düşüp durmadan bölüm bitmez,
günlük hediye, yeni dükkân sekmeleri (shop5.js, mkshop5.py + shop5_pick.js + shop5_tail.js), kabartmalı ve yıpranmış kaplamalar (tex5.js).
game5.js = game4.js + `python3 patch5.py`; shell5.html = shell4.html + `python3 mkshell5.py`; derleme `python3 build5.py <three.js yolu> <çıktı>`.

v4 (güncel, 1.1): dikey ekran, tüy parası, dükkân (10 kostüm, 6 uçuş izi, tüy paketleri), reklamlar ve satın almalar, yüksek kaliteli kaplamalar.
game4.js, game3.js'e `python3 patch4.py` ile uygulanan yamalardır (tex4.js = kaplamalar, shop4.js = ekonomi/dükkân/reklam/ödeme).
shell4.html, shell3.html'den `python3 mkshell4.py` ile üretilir. Derleme: `python3 build4.py <three.js yolu> <çıktı>`.
Uygulamada reklam ve ödeme app/www/ads.js, ads-config.js, native-bridge.js ile çalışır (Kick Up'takiyle aynı altyapı); web'de reklam yerine FLIX tanıtım kartı, ödeme yerine açıkça "DEMO" yazan bir ekran çıkar.

v3 (güncel, golf usulü sokak): game3.js + shell3.html, `python3 build3.py <three.js yolu> <çıktı>` ile tek HTML'e derlenir
(varsayılan çıktı flix-atis.html; GitHub Pages için ../index.html'e kopyalanır). game3.js; game_v2.js'in çekirdeği (render, oyuncak,
karakterler, fizik, ses) + levels3.js + world3.js + play3.js'ten oluşur. Bölüm değişince levels3.js'i düzenleyip `python3 splice.py` çalıştır.
intro.html = FLIX TOYS presents açılışı. Testler (Playwright): t8.js bot 8 bölümü oynar (?bot=1), t9.js dokunmatik test.
Eski sürümler: game.js/shell.html (v2 kuşbakışı sokak), game_rooftop.js (v1 çatılar).
