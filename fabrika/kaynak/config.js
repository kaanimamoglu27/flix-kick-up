// Flix Fabrika v3 — oyun verileri (renkler, alanlar, geliştirmeler, kozmetik, mağaza, reklam kuralları)
export const COLS = {
  dogal: { n: 'Doğal', f: '#8a5a2e', b: '#3a2414', body: 0x6b4226, wing: 0x8a5a2e, v: 5 },
  mavi: { n: 'Mavi', f: '#2a80dc', b: '#123f78', body: 0x1d5aa8, wing: 0x2a80dc, v: 8 },
  yesil: { n: 'Yeşil', f: '#2fa043', b: '#135c22', body: 0x1f7a33, wing: 0x2fa043, v: 12 },
  sari: { n: 'Sarı', f: '#ffd41f', b: '#b88a00', body: 0xd9a800, wing: 0xffc20e, v: 18 },
  kirmizi: { n: 'Kırmızı', f: '#e8301c', b: '#7a0d05', body: 0xb01a0c, wing: 0xe22511, v: 26 },
  mor: { n: 'Mor', f: '#9a5cf0', b: '#3e1d80', body: 0x6236b0, wing: 0x8a4fe0, v: 38 },
  altin: { n: 'Altın', f: '#ffd34a', b: '#a8740a', body: 0xd4a020, wing: 0xffcf3a, v: 60, metal: true },
};
// Yerdeki satın alma alanları. req: önce açılması gereken alan ('tut' = eğitim bitti).
export const PADS = [
  { id: 'ofis', name: 'Ofis', cost: 40, fx: 'Geliştirmeler açılır', x: 7.6, z: -3.2, req: 'tut' },
  { id: 'mavi', name: 'Mavi hindi', cost: 60, fx: 'FLIX değeri 5 → 8', x: -3.2, z: -10.9, req: 'tut', col: 'mavi' },
  { id: 'ik', name: 'İşe alım', cost: 120, fx: 'Eleman al, iş yürüsün', x: -8.2, z: 1.5, req: 'ofis' },
  { id: 'asm2', name: '2. Montaj', cost: 180, fx: 'Üretim 2 katı', x: -1.0, z: 3.4, req: 'mavi' },
  { id: 'geri', name: 'Geri dönüşüm', cost: 250, fx: 'Hatalılar anahtarlık olur', x: -5.2, z: 10.2, req: 'ik' },
  { id: 'yesil', name: 'Yeşil hindi', cost: 350, fx: 'FLIX değeri 12', x: 0.0, z: -10.9, req: 'asm2', col: 'yesil' },
  { id: 'kasa2', name: '2. Kasa', cost: 400, fx: 'Müşteri 2 katı', x: -3.0, z: 14.0, req: 'asm2', big: true },
  { id: 'bant', name: 'Tüy bandı', cost: 500, fx: 'Tüy ve taban masaya akar', x: -4.4, z: -6.0, req: 'asm2' },
  { id: 'genis', name: 'Yeni salon', cost: 600, fx: '+%10 satış · +1 müşteri', x: 11.9, z: 0.5, req: 'yesil', big: true },
  { id: 'kamyon', name: 'Kamyon', cost: 800, fx: 'Toplu satış 1,5 kat', x: 22.6, z: 15.8, req: 'genis' },
  { id: 'sari', name: 'Sarı hindi', cost: 1200, fx: 'FLIX değeri 18', x: 3.2, z: -10.9, req: 'yesil', col: 'sari' },
  { id: 'top', name: 'FLIX Top hattı', cost: 1800, fx: 'Yeni ürün: FLIX Top', x: 18.5, z: -4.5, req: 'kamyon' },
  { id: 'kasa3', name: '3. Kasa', cost: 2000, fx: 'Müşteri +%50', x: 13.6, z: 14.0, req: 'genis', big: true },
  { id: 'suru', name: 'Hindi sürüsü', cost: 2200, fx: '+6 hindi · 2 kat tüy', x: 17.0, z: -12.5, req: 'genis' },
  { id: 'pelus', name: 'Peluş atölyesi', cost: 2800, fx: 'Yeni ürün: Peluş FLIX', x: 17.5, z: 7.2, req: 'genis' },
  { id: 'asm3', name: '3. Montaj', cost: 3500, fx: 'Üretim +%50', x: -6.4, z: 6.4, req: 'sari' },
  { id: 'konv', name: 'Konveyör', cost: 4500, fx: 'Montaj kendi teste gider', x: 3.4, z: -4.8, req: 'top' },
  { id: 'kirmizi', name: 'Kırmızı hindi', cost: 5000, fx: 'FLIX değeri 26', x: -3.2, z: -14.2, req: 'sari', col: 'kirmizi' },
  { id: 'ciftlik', name: 'Büyük çiftlik', cost: 6000, fx: '+8 hindi · 2. tüy sandığı', x: 1.0, z: -18.0, req: 'sari', big: true },
  { id: 'hediye', name: 'Hediye paketi', cost: 7000, fx: '3 FLIX = 1,6 kat set', x: 18.5, z: 2.5, req: 'top' },
  { id: 'kasa4', name: '4. Kasa', cost: 9000, fx: 'Müşteri +%33', x: 19.2, z: 14.0, req: 'kasa3', big: true },
  { id: 'mor', name: 'Mor hindi', cost: 12000, fx: 'FLIX değeri 38', x: 0.0, z: -14.2, req: 'kirmizi', col: 'mor' },
  { id: 'altin', name: 'Altın hindi', cost: 25000, fx: 'FLIX değeri 60', x: 3.2, z: -14.2, req: 'mor', col: 'altin' },
];
// Ürünler (satış fiyatı ₺). FLIX'in fiyatı tüy rengine göre (COLS.v), hediye paketi = içindeki 3 FLIX x 1,6
export const PROD = { top: 30, giftMult: 1.6, truckMult: 1.5, plushMult: 0.6, keyMult: 0.5 };
// Ofis geliştirmeleri (para). cost = base * mult^lv
export const UPS = [
  { id: 'spd', grp: 'Patron', name: 'Yürüme hızı', icon: '👟', max: 6, base: 40, mult: 1.9, desc: (l) => '+' + (l * 12) + '% hız' },
  { id: 'cap', grp: 'Patron', name: 'Taşıma kapasitesi', icon: '📦', max: 10, base: 30, mult: 1.75, desc: (l) => (4 + l) + ' parça' },
  { id: 'kar', grp: 'Patron', name: 'Kâr', icon: '💰', max: 10, base: 90, mult: 1.85, desc: (l) => '+' + (l * 10) + '% satış' },
  { id: 'pres', grp: 'Fabrika', name: 'Pres hızı', icon: '⚙️', max: 8, base: 50, mult: 1.8, desc: (l) => (1.6 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/taban' },
  { id: 'mont', grp: 'Fabrika', name: 'Montaj hızı', icon: '🤖', max: 8, base: 60, mult: 1.8, desc: (l) => (1.4 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/FLIX' },
  { id: 'kumes', grp: 'Fabrika', name: 'Kümes verimi', icon: '🦃', max: 8, base: 50, mult: 1.8, desc: (l) => '+' + Math.round((1 / Math.pow(0.85, l) - 1) * 100) + '% tüy' },
  { id: 'bant', grp: 'Fabrika', name: 'Tüy bandı hızı', icon: '🛤️', max: 6, base: 300, mult: 1.9, desc: (l) => (1.1 * Math.pow(0.8, l)).toFixed(2).replace('.', ',') + ' sn/parça' },
  { id: 'test', grp: 'Fabrika', name: 'Test çocuğu', icon: '🧒', max: 6, base: 70, mult: 1.9, desc: (l) => (l >= 3 ? 2 : 3) + ' sektirme · ' + ((l >= 3 ? 2 : 3) * 0.55 * Math.pow(0.88, l)).toFixed(1).replace('.', ',') + ' sn · %' + Math.max(1, Math.round(10 - l * 1.5)) + ' hatalı' },
  { id: 'truck', grp: 'Fabrika', name: 'Kamyon', icon: '🚚', max: 5, base: 300, mult: 2.0, desc: (l) => (10 + l * 4) + ' kutu · ' + Math.round(30 * Math.pow(0.85, l)) + ' sn yol' },
  { id: 'tez', grp: 'Fabrika', name: 'Tezgâh rafı', icon: '🧺', max: 4, base: 80, mult: 2.2, desc: (l) => (12 + l * 4) + ' FLIX' },
];
// İşe alım (para)
export const STAFF = [
  { id: 'tas', name: 'Taşıyıcı', icon: '🧑‍🏭', desc: 'Tüy ve taban taşır, FLIX’leri tezgâha dizer', costs: [150, 700, 2600, 8000, 15000, 26000, 42000, 65000], max: 8 },
  { id: 'kas', name: 'Kasiyer', icon: '🧾', desc: 'Her kasaya bir kasiyer: satış 3 kat hızlı', costs: [250, 900, 2500, 6000], max: 4 },
];
export const SUPS = [
  { id: 'wspd', name: 'Eleman hızı', icon: '⚡', max: 5, base: 120, mult: 2.0, desc: (l) => '+' + (l * 15) + '% hız' },
  { id: 'wcap', name: 'Eleman kapasitesi', icon: '🎒', max: 5, base: 150, mult: 2.0, desc: (l) => (2 + l) + ' parça' },
];
// Kozmetik: para (₺) veya elmas (💎)
// Kozmetik: hepsi elmasla (💎) alınır, giyilince bonus verir. b: spd = yürüme hızı, cap = taşıma, kar = satış kârı
export const COS = {
  skin: [
    { id: 'kraliyet', name: 'Kırmızı FLIX', price: 0, b: {}, sw: '#e22511' },
    { id: 'buzul', name: 'Buz Mavisi', gem: 30, b: { spd: 0.08 }, sw: '#2f8fe0' },
    { id: 'turkuaz', name: 'Turkuaz', gem: 45, b: { cap: 1, spd: 0.05 }, sw: '#18c0b0' },
    { id: 'ejder', name: 'Ejder Yeşili', gem: 60, b: { cap: 2 }, sw: '#1a9a4a' },
    { id: 'neon', name: 'Neon Pembe', gem: 90, b: { kar: 0.08 }, sw: '#ff2d9a' },
    { id: 'tr', name: 'Türkiye Özel', gem: 100, b: { kar: 0.1, cap: 1 }, sw: 'linear-gradient(135deg,#e30a17 60%,#fff 60%)' },
    { id: 'lav', name: 'Lav FLIX', gem: 120, b: { spd: 0.12, cap: 1 }, sw: 'linear-gradient(135deg,#ff5a1a,#2a0a00)' },
    { id: 'altin', name: 'Altın FLIX', gem: 150, b: { kar: 0.15, spd: 0.1 }, sw: '#ffb81a' },
    { id: 'galaksi', name: 'Galaksi', gem: 200, b: { kar: 0.2 }, sw: 'linear-gradient(135deg,#5a2dd0,#ff6af0)' },
    { id: 'gece', name: 'Gece Altını', gem: 250, b: { spd: 0.15, kar: 0.12 }, sw: 'linear-gradient(135deg,#22262e 55%,#ffc20e 55%)' },
  ],
  acc: [
    { id: 'yok', name: 'Aksesuarsız', price: 0, b: {}, ic: '➖' },
    { id: 'gozluk', name: 'Güneş gözlüğü', gem: 15, b: { spd: 0.05 }, ic: '🕶️' },
    { id: 'kask', name: 'Usta bareti', gem: 20, b: { cap: 1 }, ic: '⛑️' },
    { id: 'kulak', name: 'Kulaklık', gem: 25, b: { cap: 1 }, ic: '🎧' },
    { id: 'sapka', name: 'FLIX şapkası', gem: 30, b: { spd: 0.06 }, ic: '🧢' },
    { id: 'atki', name: 'Taraftar atkısı', gem: 40, b: { kar: 0.05 }, ic: '🧣' },
    { id: 'pelerin', name: 'Kahraman pelerini', gem: 50, b: { spd: 0.12 }, ic: '🦸' },
    { id: 'tac', name: 'Altın taç', gem: 120, b: { kar: 0.12, cap: 1 }, ic: '👑' },
    { id: 'kanat', name: 'Tüy kanatlar', gem: 150, b: { spd: 0.18 }, ic: '🪽' },
    { id: 'hale', name: 'Işık halesi', gem: 200, b: { kar: 0.12, spd: 0.08 }, ic: '😇' },
  ],
  floor: [
    { id: 'nane', name: 'Nane karo', price: 0, b: {}, a: '#c4e8d4', b2: '#ade0c4', l: 'rgba(40,110,80,.18)' },
    { id: 'krem', name: 'Krem karo', gem: 15, b: { kar: 0.03 }, a: '#f6e6c8', b2: '#ecd5ae', l: 'rgba(120,80,40,.15)' },
    { id: 'flix', name: 'FLIX sarı-mavi', gem: 25, b: { kar: 0.05 }, a: '#ffe48a', b2: '#a9c1ee', l: 'rgba(11,42,94,.18)' },
    { id: 'cim', name: 'Saha çimi', gem: 35, b: { kar: 0.04, spd: 0.03 }, a: '#5fbf4a', b2: '#52ad40', l: 'rgba(255,255,255,.35)', grass: true },
    { id: 'ahsap', name: 'Ahşap parke', gem: 40, b: { kar: 0.07 }, wood: true },
    { id: 'mermer', name: 'Mermer', gem: 50, b: { kar: 0.06, cap: 1 }, a: '#f4f4f6', b2: '#e6e6ec', l: 'rgba(120,120,140,.2)', marble: true },
    { id: 'satranc', name: 'Satranç', gem: 60, b: { kar: 0.08 }, a: '#f2f2f2', b2: '#2a2e36', l: 'rgba(0,0,0,.25)' },
    { id: 'gokkusagi', name: 'Gökkuşağı', gem: 80, b: { kar: 0.1 }, rainbow: true },
    { id: 'gece', name: 'Gece mavisi', gem: 120, b: { kar: 0.12, spd: 0.04 }, a: '#1a2a52', b2: '#14224a', l: 'rgba(255,200,40,.55)' },
  ],
};
export const bonusTxt = (b) => [b.spd && '+' + Math.round(b.spd * 100) + '% hız', b.cap && '+' + b.cap + ' taşıma', b.kar && '+' + Math.round(b.kar * 100) + '% kâr'].filter(Boolean).join(' · ');
// Süreli bonuslar: reklam izleyerek ya da elmasla açılır. x2 = eski "2x kazanç" (SV.boostUntil)
export const BONUS = [
  { id: 'x2', name: '2x Kazanç', icon: '💰', desc: 'Tüm satışlar 2 kat', min: 3, gem: 15, col: '#25a855' },
  { id: 'hiz', name: 'Turbo Hız', icon: '⚡', desc: 'Sen ve elemanlar 1,5 kat hızlı', min: 3, gem: 10, col: '#ff9a1a' },
  { id: 'uret', name: 'Çift Üretim', icon: '⚙️', desc: 'Kümes, pres ve montaj 2 kat hızlı', min: 3, gem: 12, col: '#2a80dc' },
  { id: 'musteri', name: 'Müşteri Akını', icon: '🛍️', desc: 'Müşteriler 2 kat sık gelir, daha çok alır', min: 3, gem: 12, col: '#e84aa0' },
  { id: 'miknatis', name: 'Para Mıknatısı', icon: '🧲', desc: 'Paralar kendiliğinden cebine gelir', min: 5, gem: 15, col: '#7a4fd8' },
];
// Gerçek para ürünleri (App Store kimlikleri app/www/native-bridge.js ile aynı olmalı). price: web/demoda gösterilen yedek fiyat.
export const IAP = [
  { id: 'fab_gems_100', kind: 'gems', n: 100, name: '100 Elmas', price: '₺29,99' },
  { id: 'fab_gems_300', kind: 'gems', n: 300, name: '300 Elmas', price: '₺79,99', tag: 'POPÜLER' },
  { id: 'fab_gems_800', kind: 'gems', n: 800, name: '800 Elmas', price: '₺179,99' },
  { id: 'fab_gems_2000', kind: 'gems', n: 2000, name: '2000 Elmas', price: '₺399,99', tag: 'EN İYİ' },
  { id: 'fab_starter', kind: 'starter', name: 'Başlangıç Paketi', price: '₺49,99', desc: '150 elmas + ₺2.000 + Altın FLIX kostümü', once: true },
  { id: 'fab_noads', kind: 'noads', name: 'Reklamsız', price: '₺89,99', desc: 'Ara reklamlar kalkar, ödüllü reklamlar isteğe bağlı kalır', once: true },
  { id: 'fab_vip', kind: 'vip', name: 'VIP Fabrika', price: '₺149,99', desc: 'Tüm satışlar kalıcı 2 kat + reklamsız', once: true },
];
// Reklam kuralları
export const AD = {
  boostMin: 3,            // ▶ 2x kazanç süresi (dakika)
  interEveryMin: 4,       // ara reklam en sık 4 dakikada bir (eğitimden sonra, panel kapanınca / alan açılınca)
  gemsPerAd: 5, gemAdCooldownMin: 5, gemAdsPerDay: 8,
  freeUpCooldownMin: 3,   // ▶ ücretsiz geliştirme bekleme süresi
  offlineCapMin: 120, offlineShare: 0.35, // çevrimdışı kazanç (eleman ya da kasiyer varsa)
};
