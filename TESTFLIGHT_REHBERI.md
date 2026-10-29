# Üç Flix oyununu TestFlight'a yükleme

FLIX Kick Up, ARKANA ve Flix Direktör artık gerçek iPhone uygulaması olarak derlenmeye hazır. Her biri kendi klasöründe, internetsiz çalışan bir Capacitor 8 projesi:

| Oyun | Klasör | Paket kimliği (Bundle ID) | Ekran |
|---|---|---|---|
| FLIX Kick Up | `flix-kick-up` reposu, `app/` | `com.flixtoys.kickup` | iPhone, dikey |
| Flix Direktör | `flix-kick-up` reposu, `direktor/app/` | `com.flixtoys.direktor` | iPhone, dikey |
| ARKANA | `Flix-Arkana` reposu, `app/` | `com.flixtoys.arkana` | iPhone + iPad, yatay |

Yüklemenin iki yolu var, ikisi de terminalden:
- **Yol A, Mac gerekmez:** GitHub'ın bulut Mac'i derler ve yükler. Sen terminalden tek komut yazarsın (Windows, Mac ya da Linux).
- **Yol B, Mac'in varsa:** kendi Mac'inde `./ios.sh yukle 1.0` yazarsın.

---

## 1. Bir kez yapılacaklar (Apple tarafı)

1. **Apple Developer Program** (yıllık 99 $): https://developer.apple.com/programs/enroll. Üç oyun aynı hesapta durur.
2. **App Store Connect > Anlaşmalar, Vergi ve Bankacılık**: "Ücretli Uygulamalar" anlaşmasını imzala. Bu olmadan satın almalar TestFlight'ta bile çalışmaz.
3. **Üç uygulama kimliği**: https://developer.apple.com/account > Identifiers > **+** > App IDs > App. Bundle ID **Explicit**, tablodaki üç kimlik. (In-App Purchase kendiliğinden açık gelir.)
4. **Üç uygulama kaydı**: https://appstoreconnect.apple.com > Uygulamalar > **+** > Yeni Uygulama. Platform iOS, dil Türkçe, paket kimliği yukarıdaki tablodan, SKU `kickup1`, `direktor1`, `arkana1`. Adlar: **FLIX Kick Up**, **Flix Direktör**, **ARKANA: Flix Kahramanları**.
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

Yükle (her biri 15-25 dakika sürer, sonra 10-30 dakikada TestFlight'ta görünür):

```bash
gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=kickup   -f version=1.0
gh workflow run ios-testflight.yml -R kaanimamoglu27/flix-kick-up -f app=direktor -f version=1.0
gh workflow run ios-testflight.yml -R kaanimamoglu27/Flix-Arkana  -f version=1.0
```

İzlemek için: `gh run watch -R kaanimamoglu27/flix-kick-up` (ARKANA için `-R kaanimamoglu27/Flix-Arkana`). Kırmızı çıkarsa `gh run view --log-failed -R ...` çıktısını bana at, düzeltirim.

Güncelleme yüklerken sadece `version`'ı artır (1.1, 1.2...). Derleme numarası kendiliğinden artar.

ARKANA'da gerçek reklam için iki bilgi daha girebilirsin (girmezsen Google'ın test reklamı çıkar):
```bash
gh secret set ADMOB_APP_ID      -R kaanimamoglu27/Flix-Arkana -b "ca-app-pub-...~..."
gh secret set ADMOB_REWARDED_ID -R kaanimamoglu27/Flix-Arkana -b "ca-app-pub-.../..."
```

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
cd ../direktor/app             && ./ios.sh yukle 1.0    # Direktör
cd ../../../Flix-Arkana/app    && ./ios.sh yukle 1.0    # ARKANA
```

`./ios.sh` komutları: `hazirla` (projeyi kurar), `simulator` (simülatörde açar), `xcode` (Xcode'da açar), `yukle 1.0` (derler ve yükler). Telefonunu kabloyla bağlayıp Xcode'da ▶ ile doğrudan da kurabilirsin.

## 4. TestFlight'ta telefona kurma

1. App Store Connect > uygulama > **TestFlight** > Dahili Test > kendini ekle.
2. iPhone'a App Store'dan **TestFlight** uygulamasını indir, gelen davetle oyunu kur.
3. Satın almayı denemek için iPhone'da Ayarlar > App Store > **Sandbox Hesabı**. Sandbox'ta para çekilmez.
4. Dışarıdan test edecekler (ör. Onat) için **Harici Test** grubu aç; ilk sürümde Apple 1 gün kadar kısa bir inceleme yapar.

## 5. Uygulama içi ürünler (App Store Connect'te aynı kimliklerle aç)

Ürünler TestFlight'ta satın alma denemek için gerekir; oyun ürünler olmadan da açılır ve oynanır.

**FLIX Kick Up (7):** `kickup_starter` (tüketilemez, 2,99 $), `kickup_feathers_500`, `_1200`, `_3500`, `_8000`, `_18000`, `_50000` (tüketilebilir, 0,99-49,99 $). Ayrıntı: `app/README.md`.

**ARKANA (17):** liste `Flix-Arkana/app/README.md` içinde.

**Flix Direktör (8):**

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
- **Uygulama Gizliliği** anketi: Kick Up ve Direktör için "Veri toplanmıyor". ARKANA'da reklam olduğu için `Flix-Arkana/app/README.md`'deki seçimler.
- **Yaş derecesi**: Kick Up ve Direktör 4+, ARKANA 9+ (hafif fantastik şiddet).
- Ekran görüntüleri: Kick Up `app/store/screenshots/`, ARKANA `app/store/cizgi_roman/`. Direktör için ekran görüntüsü henüz yok; TestFlight'tan sonra hazırlayabilirim. (TestFlight için ekran görüntüsü gerekmez.)
