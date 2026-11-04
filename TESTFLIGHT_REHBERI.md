# Üç Flix oyununu TestFlight'a yükleme

Flix Kick Up, Flix Arkana ve Flix Sen Olsaydın artık gerçek iPhone uygulaması olarak derlenmeye hazır. Her biri kendi klasöründe, internetsiz çalışan bir Capacitor 8 projesi:

| Oyun | Klasör | Paket kimliği (Bundle ID) | Ekran |
|---|---|---|---|
| Flix Kick Up | `flix-kick-up` reposu, `app/` | `com.flixtoys.kickup` | iPhone, dikey |
| Flix Sen Olsaydın | `flix-kick-up` reposu, `direktor/app/` (yakında kendi reposuna taşınacak) | `com.flixtoys.direktor` | iPhone, dikey |
| Flix Arkana | `Flix-Arkana` reposu, `app/` | `com.flixtoys.arkana` | iPhone + iPad, yatay |
| Flix Atış | `flix-kick-up` reposu, `atis/app/` | `com.flixtoys.atis` | iPhone, dikey |

**Yayın sırası:** önce Flix Kick Up, sonra Flix Arkana, en son Flix Sen Olsaydın. Üçü de birbirinden bağımsız; birini yüklemek diğerlerini etkilemez.

Her oyun açılışta önce "FLIX TOYS presents" ekranını gösterir (iPhone'un açılış ekranı da aynı görüntü).

Yüklemenin iki yolu var, ikisi de terminalden:
- **Yol A, Mac gerekmez:** GitHub'ın bulut Mac'i derler ve yükler. Sen terminalden tek komut yazarsın (Windows, Mac ya da Linux).
- **Yol B, Mac'in varsa:** kendi Mac'inde `./ios.sh yukle 1.0` yazarsın.

---

## 1. Bir kez yapılacaklar (Apple tarafı)

1. **Apple Developer Program** (yıllık 99 $): https://developer.apple.com/programs/enroll. Üç oyun aynı hesapta durur.
2. **App Store Connect > Anlaşmalar, Vergi ve Bankacılık**: "Ücretli Uygulamalar" anlaşmasını imzala. Bu olmadan satın almalar TestFlight'ta bile çalışmaz.
3. **Üç uygulama kimliği**: https://developer.apple.com/account > Identifiers > **+** > App IDs > App. Bundle ID **Explicit**, tablodaki üç kimlik. (In-App Purchase kendiliğinden açık gelir.)
4. **Üç uygulama kaydı**: https://appstoreconnect.apple.com > Uygulamalar > **+** > Yeni Uygulama. Platform iOS, dil Türkçe, paket kimliği yukarıdaki tablodan, SKU `kickup1`, `direktor1`, `arkana1`. Adlar: **Flix Kick Up**, **Flix Sen Olsaydın**, **Flix Arkana**.
5. **API anahtarı** (sadece Yol A için ya da Mac'te Xcode'a giriş yapmak istemezsen): App Store Connect > Kullanıcılar ve Erişim > Entegrasyonlar > App Store Connect API > Ekip Anahtarları > **+**. Ad `GitHub`, erişim **Yönetici**. `.p8` dosyasını indir (bir kez indirilebilir), **Key ID** ve **Issuer ID**'yi not al.
6. **Team ID**: https://developer.apple.com/account > Membership details (10 karakter).

## 2. Yol A: Mac olmadan, terminalden

GitHub'ın komut satırı aracını bir kez kur ve giriş yap:

```bash
# Mac: brew install gh      Windows: winget install GitHub.cli
gh auth login
```

Bilgileri iki repoya da gir (`.p8` dosyasının yolunu kendi dosyanla değiştir):

```bash
for R in kaanimamoglu27/flix-kick-up kaanimamoglu27/Flix-Arkana; do
  gh secret set ASC_KEY_ID    -R $R -b "KEY_ID_BURAYA"
  gh secret set ASC_ISSUER_ID -R $R -b "ISSUER_ID_BURAYA"
  gh secret set APPLE_TEAM_ID -R $R -b "TEAM_ID_BURAYA"
  gh secret set ASC_KEY_P8    -R $R < ~/Downloads/AuthKey_KEY_ID_BURAYA.p8
done
```

Windows'ta (PowerShell) aynı adım:

```powershell
foreach ($R in "kaanimamoglu27/flix-kick-up", "kaanimamoglu27/Flix-Arkana") {
  gh secret set ASC_KEY_ID    -R $R -b "KEY_ID_BURAYA"
  gh secret set ASC_ISSUER_ID -R $R -b "ISSUER_ID_BURAYA"
  gh secret set APPLE_TEAM_ID -R $R -b "TEAM_ID_BURAYA"
  Get-Content "$HOME\Downloads\AuthKey_KEY_ID_BURAYA.p8" -Raw | gh secret set ASC_KEY_P8 -R $R
}
```

Bu komutları başka biri (ör. Onat) çalıştıracaksa, iki repoda da ortak çalışan (repo > Settings > Collaborators) olmalı.

Yükle (her biri 15-25 dakika sürer, sonra 10-30 dakikada TestFlight'ta görünür):

```bash
gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=kickup   -f version=1.0
gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=direktor -f version=1.0
gh workflow run ios-testflight.yml -R kaanimamoglu27/Flix-Arkana   -f version=1.0
```

İzlemek için: `gh run watch -R kaanimamoglu27/flix-kick-up` (Flix Arkana için `-R kaanimamoglu27/Flix-Arkana`). Kırmızı çıkarsa `gh run view --log-failed -R ...` çıktısını bana at, düzeltirim.

Güncelleme yüklerken sadece `version`'ı artır (1.1, 1.2...). Derleme numarası kendiliğinden artar.

Flix Arkana'da gerçek reklam için iki bilgi daha girebilirsin (girmezsen Google'ın test reklamı çıkar):
```bash
gh secret set ADMOB_APP_ID      -R kaanimamoglu27/Flix-Arkana -b "ca-app-pub-...~..."
gh secret set ADMOB_REWARDED_ID -R kaanimamoglu27/Flix-Arkana -b "ca-app-pub-.../..."
```

Flix Kick Up'ta da reklam var (ödüllü reklam ve tur arası reklam, isteğe bağlı banner). Gerçek reklam için AdMob'da Kick Up'a ayrı bir iOS uygulaması ve reklam birimleri (Ödüllü, Geçiş, istersen Banner) aç. Kimlikleri ya `app/www/ads-config.js` içindeki `IOS_*` alanlarına yaz ya da secret olarak gir (secret dosyadakini ezer):
```bash
gh secret set KICKUP_ADMOB_APP_ID          -R kaanimamoglu27/flix-kick-up -b "ca-app-pub-...~..."
gh secret set KICKUP_ADMOB_REWARDED_ID     -R kaanimamoglu27/flix-kick-up -b "ca-app-pub-.../..."
gh secret set KICKUP_ADMOB_INTERSTITIAL_ID -R kaanimamoglu27/flix-kick-up -b "ca-app-pub-.../..."
gh secret set KICKUP_ADMOB_BANNER_ID       -R kaanimamoglu27/flix-kick-up -b "ca-app-pub-.../..."   # sadece banner açacaksan
```
Hiçbiri girilmezse Google'ın test reklamları çıkar. Biçimi yanlış bir uygulama kimliği girilirse derleme uyarı verir ve test kimliğine düşer (yanlış kimlik uygulamayı açılışta çökertirdi).

Flix Kick Up'ın online modu için önce sunucuyu Render'a kur (`server/README.md`), sonra adresini ya repo kökündeki `online-config.js` içine `ONLINE_SERVER_URL` olarak yaz ya da GitHub değişkeni olarak gir (secret değil, değişken):
```bash
gh variable set KICKUP_ONLINE_SERVER_URL -R kaanimamoglu27/flix-kick-up -b "wss://<servis-adı>.onrender.com/ws"
```
Adres `wss://` ile başlamalı (iOS düz `ws://` adresini engeller). Adres yoksa uygulamada online düğmesi görünmez.

## 3. Yol B: kendi Mac'inde

Bir kez kur: App Store'dan **Xcode** (bir kez açıp lisansı kabul et), sonra terminalde:

```bash
brew install node cocoapods          # Homebrew yoksa: https://brew.sh
git clone https://github.com/kaanimamoglu27/flix-kick-up.git
git clone https://github.com/kaanimamoglu27/Flix-Arkana.git
```

Xcode > Settings > Accounts'ta Apple kimliğinle giriş yap (ya da aşağıdaki API anahtarı satırlarını kullan). Sonra:

```bash
export APPLE_TEAM_ID=TEAM_ID_BURAYA
# isteğe bağlı, Xcode girişi yerine:
# export ASC_KEY_ID=... ASC_ISSUER_ID=... ASC_KEY_PATH=~/Downloads/AuthKey_XXXX.p8

cd flix-kick-up/app            && ./ios.sh simulator    # önce simülatörde dene
./ios.sh yukle 1.0                                      # Kick Up'ı TestFlight'a yükle
cd ../direktor/app             && ./ios.sh yukle 1.0    # Sen Olsaydın
cd ../../../Flix-Arkana/app    && ./ios.sh yukle 1.0    # Flix Arkana
```

`./ios.sh` komutları: `hazirla` (projeyi kurar), `simulator` (simülatörde açar), `xcode` (Xcode'da açar), `yukle 1.0` (derler ve yükler). Telefonunu kabloyla bağlayıp Xcode'da ▶ ile doğrudan da kurabilirsin.

## 4. TestFlight'ta telefona kurma

1. App Store Connect > uygulama > **TestFlight** > Dahili Test > kendini ekle.
2. iPhone'a App Store'dan **TestFlight** uygulamasını indir, gelen davetle oyunu kur.
3. Satın almayı denemek için iPhone'da Ayarlar > App Store > **Sandbox Hesabı**. Sandbox'ta para çekilmez.
4. Dışarıdan test edecekler (ör. Onat) için **Harici Test** grubu aç; ilk sürümde Apple 1 gün kadar kısa bir inceleme yapar.

## 5. Uygulama içi ürünler (App Store Connect'te aynı kimliklerle aç)

Ürünler TestFlight'ta satın alma denemek için gerekir; oyun ürünler olmadan da açılır ve oynanır.

**Flix Kick Up (8):** `kickup_starter_v2` ve `kickup_noads_v2` (Reklamsız) (tüketilemez, 2,99 $), `kickup_feathers_500`, `_1200`, `_3500`, `_8000`, `_18000`, `_50000` (tüketilebilir, 0,99-49,99 $). Ayrıntı: `app/README.md`.

**Flix Arkana (17):** liste `Flix-Arkana/app/README.md` içinde.

**Flix Sen Olsaydın (8):**

| Kimlik | Tür | Fiyat (TL) | İçerik |
|---|---|---|---|
| `direktor_coins_500` | Tüketilebilir | 29,99 | 500 Flix Coin |
| `direktor_coins_1200` | Tüketilebilir | 59,99 | 1.200 Flix Coin |
| `direktor_coins_2800` | Tüketilebilir | 119,99 | 2.800 Flix Coin |
| `direktor_coins_6500` | Tüketilebilir | 249,99 | 6.500 Flix Coin |
| `direktor_coins_15000` | Tüketilebilir | 499,99 | 15.000 Flix Coin |
| `direktor_starter` | Tüketilemez | 79,99 | Başlangıç paketi: Avrupa geceleri + Atkı, Kasket, Kulaklık |
| `direktor_club_monthly` | Otomatik yenilenen abonelik | 99,99 / ay | Direktör Kulübü |
| `direktor_club_yearly` | Otomatik yenilenen abonelik | 599,99 / yıl | Direktör Kulübü |

İki abonelik aynı abonelik grubunda olmalı (grup adı: **Direktör Kulübü**).

## 6. Mağaza sayfası için gerekenler

- **Gizlilik politikası linki** (üç oyun için aynı): https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html
- **Uygulama Gizliliği** anketi: Direktör için "Veri toplanmıyor". Flix Kick Up ve Flix Arkana'da reklam olduğu için `Flix-Arkana/app/README.md`'deki seçimler (Kick Up'ta da aynısı).
- **Yaş derecesi**: Kick Up ve Direktör 4+, Flix Arkana 9+ (hafif fantastik şiddet).
- Ekran görüntüleri: Kick Up `app/store/screenshots/`, Flix Arkana `app/store/cizgi_roman/`. Direktör için ekran görüntüsü henüz yok; TestFlight'tan sonra hazırlayabilirim. (TestFlight için ekran görüntüsü gerekmez.)


---

## Flix Atış (yeni oyun, 2026-11-03)

Flix Atış da aynı yolla yüklenir. Kick Up için girdiğin GitHub sırları (secrets) aynen kullanılır, yeniden girmen gerekmez.

1. developer.apple.com > Identifiers > **+** > App IDs > App: Bundle ID **Explicit** `com.flixtoys.atis`.
2. App Store Connect > Uygulamalar > **+** > Yeni Uygulama: ad **Flix Atış**, dil Türkçe, paket kimliği `com.flixtoys.atis`, SKU `atis1`.
3. Yükle (Mac gerekmez): GitHub > `flix-kick-up` > Actions > **iOS TestFlight** > Run workflow > app: **atis**, version: **1.3**. Terminalden:

```bash
gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=atis -f version=1.3
```

Mac'ten: `cd atis/app && ./ios.sh yukle 1.0`.

Flix Atış 1.3'te **uygulama içi satın alma ve reklam var** (8 ürün), bu yüzden "Ücretli Uygulamalar" anlaşması (bölüm 1, madde 2) şart.

**Satın alma ürünleri** (App Store Connect > Flix Atış > Para Kazanma > Uygulama İçi Satın Almalar > **+**). Ürün kimlikleri birebir aynı yazılmalı:

| Ürün kimliği | Tür | İçerik | Önerilen fiyat |
|---|---|---|---|
| `atis_feathers_500` | Tüketilebilir | 500 tüy | ₺39,99 |
| `atis_feathers_1200` | Tüketilebilir | 1.200 tüy | ₺79,99 |
| `atis_feathers_3500` | Tüketilebilir | 3.500 tüy | ₺199,99 |
| `atis_feathers_8000` | Tüketilebilir | 8.000 tüy | ₺399,99 |
| `atis_feathers_20000` | Tüketilebilir | 20.000 tüy | ₺799,99 |
| `atis_starter` | Tüketilemez | Başlangıç Paketi: 2.500 tüy + Gece kostümü (tek sefer) | ₺119,99 |
| `atis_noads` | Tüketilemez | Reklamsız (bölüm arası reklamlar kalkar) | ₺119,99 |
| `atis_sokak2` | Tüketilemez | Bölüm paketi: 4 dünyada (Sokak, Amerika, Avrupa, Uzay) 11-20. bölümler, toplam 40 bölüm (oyunda 20.000 tüyle de açılır) | ₺119,99 |

Oyunda görünen fiyatlar App Store'dan gelir; tabloda yazanlar sadece mağaza yüklenene kadar görünür.

**Reklamlar (AdMob)**: https://apps.admob.com > Uygulamalar > Uygulama ekle > iOS > **Flix Atış**. Sonra iki reklam birimi aç: **Ödüllü** (2x tüy, +2 atış, bedava tüy, günlük hediye x2) ve **Geçiş** (3. bölümden sonra her 3 bölümde bir, ayrıca her 2. başarısız denemede). Kimlikleri GitHub sırlarına gir:

```bash
R=kaanimamoglu27/flix-kick-up
gh secret set ATIS_ADMOB_APP_ID          -R $R -b "ca-app-pub-...~..."
gh secret set ATIS_ADMOB_REWARDED_ID     -R $R -b "ca-app-pub-.../..."
gh secret set ATIS_ADMOB_INTERSTITIAL_ID -R $R -b "ca-app-pub-.../..."
```

Kimlik girilmezse uygulama Google'ın **test reklamlarını** gösterir (TestFlight'ta denemek için yeterli, gerçek para kazandırmaz). App Store Connect > Uygulama Gizliliği kısmında "Cihaz kimliği: reklam / takip" ve "Satın alımlar" işaretlenmeli (Kick Up'taki gibi). Gizlilik sayfası diğer oyunlarla aynı: https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html
