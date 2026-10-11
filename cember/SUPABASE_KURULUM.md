# FLIX Çember: Supabase kurulumu (yaklaşık 10 dakika)

Bu ayarlar yapılınca ortak liderlik tablosu, profiller ve "Online Çember" odaları açılır.
Ayar yapılmazsa oyun yine çalışır, rekorlar sadece o cihazda tutulur.

## 1. Proje aç
1. https://supabase.com adresinde ücretsiz hesap aç, **New project** de.
2. Bir ad ver (ör. `flix-cember`), güçlü bir veritabanı şifresi yaz, bölge olarak **Central EU (Frankfurt)** seç.
3. Proje hazır olana kadar 1-2 dakika bekle.

## 2. Tabloları kur (SQL)
1. Sol menüde **SQL Editor**'e gir, **New query** de.
2. `supabase.sql` dosyasının **tamamını** kopyalayıp yapıştır, **Run**'a bas.
3. Altta "Success. No rows returned" görmelisin. Dosyayı ikinci kez çalıştırmak zarar vermez.

Bu adım şunları kurar: `profiles` ve `scores` tabloları, güvenlik kuralları (herkes okuyabilir, herkes sadece kendi satırını yazabilir, kimse silemez), `leaderboard` görünümü ve rekoru sadece yükselten `submit_score` fonksiyonu.

## 3. Anonim girişi aç
Oyuncular hesap açmadan oynar; her cihaz otomatik olarak anonim giriş yapar.
1. **Authentication > Sign In / Providers** sayfasına gir.
2. **Allow anonymous sign-ins** anahtarını aç, **Save changes** de.

## 4. Adresi ve anahtarı al
1. **Project Settings > API** (yeni arayüzde **Project Settings > Data API** ve **API Keys**) sayfasına gir.
2. **Project URL**'yi kopyala (ör. `https://abcdxyz.supabase.co`).
3. **anon public** anahtarını kopyala (yeni projelerde **Publishable key**, `sb_publishable_...` ile başlar).
4. **service_role / secret anahtarını asla kullanma.** O anahtar her şeye izin verir; oyuna konmaz.

## 5. Oyuna yaz
`index.html` dosyasını aç. `<script>` bölümünün en başında şunu bul ve doldur:

```js
const FLIX_CONFIG = {
  supabaseUrl: "https://abcdxyz.supabase.co",
  supabaseKey: "anon veya publishable anahtar",
};
```

Kaydet, oyunu yeniden yükle.

## 6. Dene
1. Oyunu iki ayrı cihazda (veya iki tarayıcıda) aç.
2. **Online Çember** modunu seç, **Oyna**'ya bas. Lobide sağ üstte **Çevrimiçi** yazmalı.
3. Birinde **Yeni oda kur** de, çıkan 4 harfli kodu diğerinde gir, **Katıl**.
4. İkisi de **Hazırım** deyince oyun başlar. 4 kişiden azsanız boş yerlere bot gelir.

## Sorun olursa
- **Lobide "Çevrimdışı" yazıyor:** `FLIX_CONFIG` boş ya da yanlış, veya 3. adımdaki anonim giriş kapalı. Tarayıcı konsolunda (F12) `FLIX:` ile başlayan uyarıya bak.
- **Liderlik tablosu boş:** 2. adımdaki SQL çalışmamış olabilir. SQL Editor'de `select * from leaderboard;` çalıştır, hata veriyorsa SQL'i tekrar çalıştır.
- **Oda bağlanmıyor:** **Project Settings > Realtime** sayfasında public kanallara izin verildiğinden emin ol (varsayılan açık).
- **Aynı Wi-Fi'da çok kişi ilk kez giriyor ve bazıları giremiyor:** **Authentication > Rate Limits** sayfasında anonim giriş sınırını (varsayılan saatte 30, IP başına) artır.
- Ücretsiz projeler bir hafta kullanılmazsa durdurulur; panelden **Restore** ile geri açılır.
