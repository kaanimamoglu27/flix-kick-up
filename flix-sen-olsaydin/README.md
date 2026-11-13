# Flix Sen Olsaydın

Hocanın yerine geç, kararını ver, gerçekte ne olduğunu gör.

- **Oyna (Safari / tarayıcı):** https://kaanimamoglu27.github.io/flix-kick-up/flix-sen-olsaydin/
- **Oyun dosyası:** [`index.html`](index.html) (tek dosya, her şey içinde)
- **Eski sürümler:** [`eski/`](eski/) klasöründe (v2 … v30)
- **iOS uygulaması (TestFlight):** [`../direktor/app/`](../direktor/app/) · yükleme rehberi: [`../TESTFLIGHT_REHBERI.md`](../TESTFLIGHT_REHBERI.md)
- **Canlı veri:** `../tools/direktor-live.mjs`, GitHub Actions ile 20 dakikada bir çalışır (`.github/workflows/direktor-live.yml`) ve `gh-pages` dalındaki `direktor/live.json` dosyasını günceller. "Bu haftanın maçları" bu veriden her hafta kendiliğinden kurulur.

## Nasıl oynanır
1. **Hemen oyna** ile bu haftanın gerçek Süper Lig maçını aç, hangi takımın hocası olacağını seç.
2. Üstte maç canlı oynanır. 30, 46, 60, 70 ve 80. dakikalarda oyun durur, altta karar kartları açılır.
3. Bir kart seç (oyuncu değiştir, hücuma geç, kapan ya da devam) ve **Kararı ver**e bas. Kartın altındaki yüzdeler gol şansını ve gol yeme riskini gösterir.
4. Takımın karşı karşıya kalınca nişangah çıkar: boş köşedeyken ekrana dokun.
5. Maç bitince skorun gerçek skorla karşılaştırılır. Gerçek hocadan iyi sonuç alırsan ekstra yıldız ve Flix Coin kazanırsın.

Oyun ilk açılışta bu adımları kısa bir ekranla anlatır, ana ekrandaki **Nasıl oynanır?** ile tekrar açılır.

## Klasörler
- `flix-sen-olsaydin/index.html`: oyun
- `flix-sen-olsaydin/eski/`: önceki sürümler
- `direktor/app/`: iOS uygulaması (Capacitor). `app/www/` derlenmiş oyun (`python3 tools/build_www.py` bu klasördeki oyundan kurar), `app/store/` App Store görselleri ve ikonlar
- `direktor/live.json`: canlı veri (gh-pages). Eski `/direktor/` adresi buraya yönlendirir.

## Modlar
- **Kariyer:** 2010-11'den bugüne bir sezon ve takım seç, sadece maçları yönet: kadro, taktik ve maç içi kararlar. Transfer ve kulüp işleri yok.
- **Gerçek maçlar:** bu haftanın Süper Lig maçları ve efsane maçlar. Gerçek hocanın kararlarıyla kendi kararlarını karşılaştır.
- **Canlı bülten:** Avrupa ve Türkiye'den maçlar, skor tahmini, biten maçı yönetme.
- **Online düello:** arkadaşınla aynı maçı yönet.

## Yasal Bilgiler / Legal & Information (2026-11-09)

Ayarlar'da (Sen Olsaydın'da ana ekranın altında) **Yasal Bilgiler** ve **Hakkında** düğmeleri var. Panel TR/EN, dili cihaz diline göre seçer, üstteki TR/EN ile değişir.
Belgeler flixtoysofficial.com'daki resmi sayfalar; uygulamada Safari'de, web'de yeni sekmede açılır (oyun içinde WebView yok). İnternet yoksa uyarı ve adres gösterilir.
Hakkında: geliştiriciler, %50/%50 telif sahipliği, yayıncı FLIX TOYS, destek e-postası, açık kaynak bileşenler.
Kod oyunun içinde tek bir `<script>/* FLIX legal */` bloğu (FlixLegal), düğmeler `data-flixlegal="legal|about"`. Oynanış, reklam, satın alma ve kayıtlar değişmedi.
