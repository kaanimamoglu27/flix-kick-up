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
  { id: 'ofis', name: 'Ofis', cost: 40, x: 7.6, z: -3.2, req: 'tut', gem: 0 },
  { id: 'mavi', name: 'Mavi hindi', cost: 60, x: -3.2, z: -10.9, req: 'tut', col: 'mavi' },
  { id: 'ik', name: 'İşe alım', cost: 120, x: 8.6, z: 2.8, req: 'ofis' },
  { id: 'asm2', name: '2. Montaj', cost: 180, x: -1.0, z: 3.4, req: 'mavi' },
  { id: 'yesil', name: 'Yeşil hindi', cost: 350, x: 0.0, z: -10.9, req: 'asm2', col: 'yesil' },
  { id: 'sari', name: 'Sarı hindi', cost: 1200, x: 3.2, z: -10.9, req: 'yesil', col: 'sari' },
  { id: 'asm3', name: '3. Montaj', cost: 2500, x: -6.4, z: 6.4, req: 'sari' },
  { id: 'kirmizi', name: 'Kırmızı hindi', cost: 4000, x: -3.2, z: -14.2, req: 'sari', col: 'kirmizi' },
  { id: 'mor', name: 'Mor hindi', cost: 9000, x: 0.0, z: -14.2, req: 'kirmizi', col: 'mor' },
  { id: 'altin', name: 'Altın hindi', cost: 20000, x: 3.2, z: -14.2, req: 'mor', col: 'altin' },
];
// Ofis geliştirmeleri (para). cost = base * mult^lv
export const UPS = [
  { id: 'spd', grp: 'Patron', name: 'Yürüme hızı', icon: '👟', max: 6, base: 40, mult: 1.9, desc: (l) => '+' + (l * 12) + '% hız' },
  { id: 'cap', grp: 'Patron', name: 'Taşıma kapasitesi', icon: '📦', max: 10, base: 30, mult: 1.75, desc: (l) => (4 + l) + ' parça' },
  { id: 'kar', grp: 'Patron', name: 'Kâr', icon: '💰', max: 10, base: 90, mult: 1.85, desc: (l) => '+' + (l * 10) + '% satış' },
  { id: 'pres', grp: 'Fabrika', name: 'Pres hızı', icon: '⚙️', max: 8, base: 50, mult: 1.8, desc: (l) => (1.6 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/taban' },
  { id: 'mont', grp: 'Fabrika', name: 'Montaj hızı', icon: '🤖', max: 8, base: 60, mult: 1.8, desc: (l) => (1.4 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/FLIX' },
  { id: 'kumes', grp: 'Fabrika', name: 'Kümes verimi', icon: '🦃', max: 8, base: 50, mult: 1.8, desc: (l) => '+' + Math.round((1 / Math.pow(0.85, l) - 1) * 100) + '% tüy' },
  { id: 'tez', grp: 'Fabrika', name: 'Tezgâh rafı', icon: '🧺', max: 4, base: 80, mult: 2.2, desc: (l) => (12 + l * 4) + ' FLIX' },
];
// İşe alım (para)
export const STAFF = [
  { id: 'tas', name: 'Taşıyıcı', icon: '🧑‍🏭', desc: 'Tüy ve taban taşır, FLIX’leri tezgâha dizer', costs: [150, 700, 2600, 8000], max: 4 },
  { id: 'kas', name: 'Kasiyer', icon: '🧾', desc: 'Kasada durur, sen yokken de satış yapar', costs: [250], max: 1 },
];
export const SUPS = [
  { id: 'wspd', name: 'Eleman hızı', icon: '⚡', max: 5, base: 120, mult: 2.0, desc: (l) => '+' + (l * 15) + '% hız' },
  { id: 'wcap', name: 'Eleman kapasitesi', icon: '🎒', max: 5, base: 150, mult: 2.0, desc: (l) => (2 + l) + ' parça' },
];
// Kozmetik: para (₺) veya elmas (💎)
export const COS = {
  skin: [
    { id: 'kraliyet', name: 'Kırmızı FLIX', price: 0 },
    { id: 'buzul', name: 'Buz Mavisi', gem: 30 },
    { id: 'ejder', name: 'Ejder Yeşili', gem: 60 },
    { id: 'neon', name: 'Neon Pembe', gem: 90 },
    { id: 'altin', name: 'Altın FLIX', gem: 150 },
  ],
  acc: [
    { id: 'yok', name: 'Aksesuarsız', price: 0 },
    { id: 'gozluk', name: 'Güneş gözlüğü', money: 600 },
    { id: 'kulak', name: 'Kulaklık', gem: 25 },
    { id: 'pelerin', name: 'Kahraman pelerini', gem: 50 },
    { id: 'tac', name: 'Altın taç', gem: 120 },
  ],
  floor: [
    { id: 'nane', name: 'Nane karo', price: 0, a: '#c4e8d4', b: '#ade0c4', l: 'rgba(40,110,80,.18)' },
    { id: 'krem', name: 'Krem karo', money: 900, a: '#f6e6c8', b: '#ecd5ae', l: 'rgba(120,80,40,.15)' },
    { id: 'flix', name: 'FLIX sarı-mavi', gem: 25, a: '#ffe48a', b: '#a9c1ee', l: 'rgba(11,42,94,.18)' },
    { id: 'ahsap', name: 'Ahşap parke', gem: 40, wood: true },
    { id: 'gokkusagi', name: 'Gökkuşağı', gem: 80, rainbow: true },
  ],
};
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
