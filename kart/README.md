# Flix Kart v5 (2026-11-10) — gerçekçi 3D ve akıcılık
Düz zemin yerine yolu saran gerçek arazi (tepeler, dağlar, deniz/lav), gökyüzü kubbesi ve bulutlar, hareketli su. 5 doğal dünya: Flix Sahili, Yeşil Vadi, Kızıl Kanyon, Buz Zirvesi, Lav Adası (palmiye, çam, kaktüs, kaya; hepsi tek çizimde instanced). Yol kenarı toprak bankı ve yarış bariyeri, 2K gölge. Zemin takibi artık kesintisiz (örnekler arası harmanlama), toz/duman/alev yumuşak sprite. Kaynak: kaynak/world.js.
Önceki sürüm: flix-kart-v4.html.

## v4 (2026-11-10) — araç hissi
Yeni araç fiziği: 4 tekerlekli yay/amortisör süspansiyonu, momentumlu kayma (lastik tutuşu), gaz/fren/virajda ağırlık aktarımı, yokuşta yerçekimi, havada denge, inişte kısa kayma. SergeyMakeev/ArcadeCarPhysics (MIT, Copyright 2018 Sergey Makeev) ArcadeCar.cs'den uyarlandı.
Pistler artık iniş çıkışlı: tepeler, içe yatık virajlar, düzlüklerde tümsekler ve gerçek rampalar (havada DRİFT = numara + turbo). Yol yükseltilmiş, yanlarında duvar var. Kamera yaylı takip eder ve yokuşa bakar.
Önceki sürüm: flix-kart-v3.html.

## v3 (2026-11-10)
Kariyer: 5 dünya (Mutfak, Oyun Odası, Arka Bahçe, Banyo, FLIX Fabrikası) × 4 etkinlik (yarış, ters pist, zamana karşı, patron düellosu), 60 yıldız.
Güç kutuları (Üçlü Turbo, Tüy Füzesi, FLIX Topu, Sakız, Kalkan, Altın FLIX, Şimşek) ve sürücüye özel süper güçler; atlama rampası + havada numara.
Garaj: 5 araç (Klasik, Plaj Buggy, Canavar, Roket, Tüy Jet) + hız/hızlanma/yol tutuş yükseltmeleri. Eşya dağılımı sıraya göre (super-kart-3djs PowerUp.js fikri, MIT).
Önceki sürümler: flix-kart-v2.html, flix-kart-v1.html.

## v2 (2026-11-09)
Tek dosya oyun: flix-kart.html (v1: flix-kart-v1.html). Kaynak: kaynak/ (build.py ../shared/toy.js ve logo_s.webp bekler).
Sürücüler: Flix (ARKANA kahraman modeli), Usta Wu, Kick, Flick (Usta Wu serisi modelleri), Buzul Flix, Neon Flix.
Ses ve müzik: fecolinhares/super-kart-3djs (MIT, Copyright (c) 2026 Feco Linhares) sfx.js + music.js, motor sesi ve ana kanal AudioManager.js'ten uyarlandı.
Sürüş hissi pmndrs/racing-game (MIT, Copyright (c) 2021 pmndrs) Vehicle.tsx'ten; drift seviyeleri (mavi/turuncu/mor), zıplama, süper start, savrulma izleri, kamera sarsıntısı, hız çizgileri.
