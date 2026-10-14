# FLIX Kick Up'ı App Store'a yükleme rehberi

Oyun hazır: `app/` klasörü iPhone uygulamasına dönüşecek her şeyi içeriyor (oyun, internetsiz çalışan dosyalar, ikon, 7 ekran görüntüsü, mağaza metinleri, satın alma kimlikleri). Aynı klasör GitHub'da da var: `kaanimamoglu27/flix-kick-up` reposunun `app/` klasörü.

ARKANA'yı yüklediysen bu çok daha kısa: hesap ve anlaşmalar zaten hazır olur, aynı geliştirici ikisini aynı gün derleyebilir.

Yükleme 3 parçadan oluşur: **hesap**, **uygulamayı derleme**, **App Store Connect'te sayfayı doldurup incelemeye gönderme**.

---

## 1. Apple Developer hesabı (ARKANA ile aynı hesap)

Hesabın yoksa:

1. https://developer.apple.com/programs/enroll adresinden Apple Developer Program'a katıl. Yıllık 99 $. Tek hesapla istediğin kadar oyun yüklersin.
2. Hesap türü için öneri **Şirket (Organization)**: mağazada satıcı adı "Flix" görünür. Şirketin **D-U-N-S numarası** gerekir (ücretsiz, birkaç gün sürebilir). **Bireysel** hesap daha hızlı açılır ama satıcı adı senin adın olur.
3. https://appstoreconnect.apple.com > **Anlaşmalar, Vergi ve Bankacılık**: "Ücretli Uygulamalar" anlaşmasını imzala, banka ve vergi bilgilerini gir. Bu olmadan satın alma çalışmaz.

## 2. Uygulamayı derleme (Mac gerekir; yoksa bir geliştiriciye ver)

| Yol | Kime uygun | Maliyet |
|---|---|---|
| Kendi Mac'in | Mac'in varsa | Ücretsiz |
| Serbest çalışan iOS/Capacitor geliştirici | Mac yoksa, en kolayı | Genelde yarım gün-1 gün |
| Bulutta derleme (Codemagic, Ionic Appflow) | Mac yoksa, kendin yapmak istersen | Ücretsiz kotalar var |

Geliştiriciye vereceğin tek şey bu klasör ve şu cümle: *"Capacitor 6 projesi, README'deki adımlarla iOS'a derle, TestFlight'a yükle."*

Mac'te adımlar (Terminal'de, `app` klasörünün içinde):

```
npm install
npx cap add ios
sh tools/ios_setup.sh
npm run sync
npx cap open ios
```

Xcode açılınca:
1. Sol üstte **App** projesine tıkla. **Signing & Capabilities** sekmesinde Team olarak Apple hesabını seç.
2. **+ Capability** ile **In-App Purchase** ekle.
3. **Assets > AppIcon** içine `store/icon-1024.png` dosyasını sürükle.
4. Üst menüden **Product > Archive**. Bitince **Distribute App > App Store Connect > Upload**.

## 3. App Store Connect'te uygulama sayfası

1. **Uygulamalarım > + > Yeni Uygulama**
   - Platform: iOS
   - Ad: **FLIX Kick Up**
   - Dil: Türkçe
   - Paket kimliği: **com.flixtoys.kickup**
   - SKU: `kickup1`
2. **Uygulama İçi Satın Almalar**: `app/README.md` içindeki tablodaki 7 ürünü **aynı kimliklerle** oluştur (ör. `kickup_feathers_500`, `kickup_starter`).
   - Türleri tabloda yazıyor: tüketilebilir ya da tüketilemez.
   - Fiyatları tablodaki dolar seviyelerinden seç. Türkiye fiyatını Apple TL'ye kendisi çevirir.
   - Her ürüne bir ekran görüntüsü ister (inceleme için). `store/screenshots/` içinden mağaza ekranı yerine dolap görüntüsünü kullanabilirsin.
3. **TestFlight**: yüklenen sürüm 10-30 dakikada burada görünür.
   - Kendini test kullanıcısı olarak ekle, iPhone'a TestFlight uygulamasını indir, oyunu kur.
   - **Ayarlar > App Store > Sandbox Hesabı** ile bir tüy paketini satın almayı ve "Satın alımları geri yükle"yi dene. Sandbox'ta para çekilmez.
4. **Uygulama Gizliliği**: "Veri toplanmıyor" seç. Gizlilik politikası metni `app/README.md` içinde hazır; flixtoysofficial.com'da bir sayfaya koy ve linkini gir. ARKANA için açtığın sayfayı iki oyunu da anlatacak şekilde ortak kullanabilirsin.
5. **Yaş derecelendirmesi**: anketteki her soruya "Yok" de. Sonuç 4+ olur.
6. **Sürüm sayfası**:
   - Ekran görüntüleri: `store/screenshots/` içindeki 7 görüntüyü "6,9 inç" ya da "6,7 inç" bölümüne yükle. Uygulama sadece iPhone için olduğundan iPad görüntüsü istenmez.
   - Açıklama ve anahtar kelimeler: `app/README.md` içindeki "Mağaza metni (TR)" ve İngilizce bölümünden kopyala.
   - Destek URL'si: flixtoysofficial.com.
   - Kategori: Oyunlar > Arcade. İkinci kategori: Oyunlar > Gündelik.
7. **Derleme** bölümünden TestFlight'taki sürümü seç, satın alma ürünlerini bu sürüme ekle.
8. **İncelemeye Gönder**. Apple genelde 1-2 günde cevap verir. Ret gelirse sebebini buraya yaz, düzeltirim.

## Uygulamada değişen 3 şey

- **Online yarış "Yakında"** olarak görünüyor. Şu an sadece claude.ai linkinde çalışıyor. Uygulamaya gelmesi için bir sunucu (Supabase gibi, ücretsiz başlanabilir) bağlamak gerekiyor; istersen sonraki güncellemede eklerim.
- **"Reklamsız" ürünü yok.** Oyunda reklam olmadığı için Apple bunu reddederdi.
- **Başlangıç Paketi'nde üstü çizili "$9.99" yok.** Apple sahte indirim gibi görebilir; fiyat Apple'dan TL olarak gelir.

## Web sürümü (hemen, ücretsiz)

App Store beklenirken oyun zaten internette:

- https://kaanimamoglu27.github.io/flix-kick-up/

Safari'de açıp **Paylaş > Ana Ekrana Ekle** dersen telefonda uygulama gibi tam ekran açılır. Online yarış için claude.ai linki: https://claude.ai/artifact/7Hbz7cte1kraYsP7yNyY2b

## Sonra (isteğe bağlı)

- **Google Play**: tek seferlik 25 $. Aynı klasörden `npx cap add android` ile Android sürümü çıkar, Mac gerekmez.
- **Online yarış uygulamada**: sunucu bağlanınca açılır.
- **Sunucu doğrulaması**: satın alma hilesini azaltmak için RevenueCat gibi bir servis eklenebilir.
