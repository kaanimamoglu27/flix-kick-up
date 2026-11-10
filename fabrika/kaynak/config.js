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
  { id: 'kumes2', name: '2. hindi', cost: 10, fx: 'Tüy 2 katı', x: -3.6, z: 12.2, req: 'tut' },
  { id: 'atolye', name: 'Atölye avlusu', cost: 30, fx: 'Avlu büyür · montaj yeri açılır', x: 7.4, z: 8.0, req: 'tut', big: true },
  { id: 'masa', name: 'Montaj masası', cost: 45, fx: 'Robot kol FLIX kurar', x: -1.0, z: -2.0, req: 'atolye' },
  { id: 'kumes3', name: '3. hindi', cost: 60, fx: 'Kümeste 3 hindi', x: -5.2, z: 12.8, req: 'masa' },
  { id: 'depo', name: 'Depo kanadı', cost: 75, fx: 'Alan sola büyür · dolap', x: -5.0, z: 2.5, req: 'masa', big: true },
  { id: 'pres', name: 'Büyük pres', cost: 100, fx: 'Taban üretimi hızlanır', x: -8.4, z: -3.5, req: 'depo' },
  { id: 'bina', name: 'Fabrika binası', cost: 135, fx: 'Duvarlar yükselir · çiftlik kapısı', x: 2.6, z: -4.0, req: 'pres', big: true },
  { id: 'ciftlik0', name: 'Hindi çiftliği', cost: 180, fx: '4 hindi · tüy sandığı', x: 0.0, z: -5.6, req: 'bina', big: true },
  { id: 'park', name: 'Oyun parkı', cost: 210, fx: '3 çocuk FLIX test eder', x: 8.6, z: 0.8, req: 'ciftlik0', big: true },
  { id: 'sahne', name: 'Şov sahnesi', cost: 160, fx: 'Sektirme şovu: kalabalık para atar', x: 8.8, z: 6.6, req: 'park', big: true },
  { id: 'ofis', name: 'Ofis', cost: 255, fx: 'Geliştirmeler açılır', x: 7.6, z: -3.2, req: 'park' },
  { id: 'mavi', name: 'Mavi hindi', cost: 225, fx: 'FLIX değeri 5 → 8', x: -6.8, z: -11.2, req: 'ciftlik0', col: 'mavi' },
  { id: 'ik', name: 'İşe alım', cost: 315, fx: 'Eleman al, iş yürüsün', x: -8.2, z: 1.5, req: 'ofis' },
  { id: 'asm2', name: '2. Montaj', cost: 390, fx: 'Üretim 2 katı', x: -1.0, z: 3.4, req: 'mavi' },
  { id: 'geri', name: 'Geri dönüşüm', cost: 340, fx: 'Hatalılar anahtarlık olur', x: -5.2, z: 10.2, req: 'ik' },
  { id: 'yesil', name: 'Yeşil hindi', cost: 375, fx: 'FLIX değeri 12', x: 0.0, z: -10.9, req: 'asm2', col: 'yesil' },
  { id: 'kasa2', name: '2. Kasa', cost: 450, fx: 'Müşteri 2 katı', x: -3.0, z: 14.0, req: 'asm2', big: true },
  { id: 'bant', name: 'Tüy bandı', cost: 500, fx: 'Tüy ve taban masaya akar', x: -4.4, z: -6.0, req: 'asm2' },
  { id: 'genis', name: 'Yeni salon', cost: 350, fx: '+%10 satış · +1 müşteri', x: 11.9, z: 0.5, req: 'yesil', big: true },
  { id: 'kamyon', name: 'Kamyon', cost: 500, fx: 'Toplu satış 1,5 kat', x: 22.6, z: 15.8, req: 'genis' },
  { id: 'misir', name: 'Mısır ambarı', cost: 600, fx: 'Hindileri besle: tüy 2 kat hızlı', x: 11.6, z: -11.4, req: 'genis' },
  { id: 'sari', name: 'Sarı hindi', cost: 700, fx: 'FLIX değeri 18', x: 3.2, z: -10.9, req: 'yesil', col: 'sari' },
  { id: 'top', name: 'FLIX Top hattı', cost: 1000, fx: 'Yeni ürün: FLIX Top', x: 18.5, z: -4.5, req: 'kamyon' },
  { id: 'kasa3', name: '3. Kasa', cost: 1200, fx: 'Müşteri +%50', x: 12.4, z: 14.0, req: 'genis', big: true },
  { id: 'suru', name: 'Hindi sürüsü', cost: 1350, fx: '+6 hindi · 2 kat tüy', x: 17.0, z: -12.5, req: 'genis' },
  { id: 'pelus', name: 'Peluş atölyesi', cost: 1650, fx: 'Yeni ürün: Peluş FLIX', x: 17.5, z: 7.2, req: 'genis' },
  { id: 'robot', name: 'Tüy toplayıcı', cost: 550, fx: '2 robot tüy toplar', x: -8.4, z: -15.0, req: 'mavi' },
  { id: 'asm3', name: '3. Montaj', cost: 1950, fx: 'Üretim +%50', x: -6.4, z: 6.4, req: 'sari' },
  { id: 'konv', name: 'Konveyör', cost: 2850, fx: 'Montaj kendi teste gider', x: 3.4, z: -4.8, req: 'top' },
  { id: 'kirmizi', name: 'Kırmızı hindi', cost: 3000, fx: 'FLIX değeri 26', x: -3.2, z: -14.2, req: 'sari', col: 'kirmizi' },
  { id: 'ciftlik', name: 'Büyük çiftlik', cost: 3500, fx: '+8 hindi · 2. tüy sandığı', x: 1.0, z: -18.0, req: 'sari', big: true },
  { id: 'hediye', name: 'Hediye paketi', cost: 4250, fx: '3 FLIX = 1,6 kat set', x: 18.5, z: 2.5, req: 'top' },
  { id: 'kasa4', name: '4. Kasa', cost: 5500, fx: 'Müşteri +%33', x: 19.8, z: 14.0, req: 'kasa3', big: true },
  { id: 'bblok', name: 'B Blok', cost: 6000, fx: 'Fabrika sola büyür', x: -9.2, z: 12.4, req: 'ciftlik', big: true },
  { id: 'asm4', name: '4. Montaj', cost: 8500, fx: 'Üretim +%33', x: -17.5, z: 3.0, req: 'bblok' },
  { id: 'pres2', name: '2. Pres', cost: 9500, fx: 'Taban üretimi 2 katı', x: -19.0, z: -3.8, req: 'bblok' },
  { id: 'mor', name: 'Mor hindi', cost: 7250, fx: 'FLIX değeri 38', x: 0.0, z: -14.2, req: 'kirmizi', col: 'mor' },
  { id: 'kasa5', name: '5. Kasa', cost: 12000, fx: 'Müşteri +%25', x: -17.5, z: 14.0, req: 'bblok', big: true },
  { id: 'robot2', name: 'Robot garajı', cost: 18000, fx: '+3 robot · hızlı toplama', x: -18.5, z: -12.0, req: 'pres2' },
  { id: 'altin', name: 'Altın hindi', cost: 15000, fx: 'FLIX değeri 60', x: 3.2, z: -14.2, req: 'mor', col: 'altin' },
];
// Ürünler (satış fiyatı ₺). FLIX'in fiyatı tüy rengine göre (COLS.v), hediye paketi = içindeki 3 FLIX x 1,6
export const PROD = { top: 30, giftMult: 1.6, truckMult: 1.5, plushMult: 0.6, keyMult: 0.5 };
// Ofis geliştirmeleri (para). cost = base * mult^lv
export const UPS = [
  { id: 'spd', grp: 'Patron', name: 'Yürüme hızı', icon: '👟', max: 12, base: 32, mult: 1.8, desc: (l) => '+' + spdPct(l) + '% hız' },
  { id: 'cap', grp: 'Patron', name: 'Taşıma kapasitesi', icon: '📦', max: 26, base: 24, mult: 1.55, desc: (l) => (4 + l) + ' parça' },
  { id: 'kar', grp: 'Patron', name: 'Kâr', icon: '💰', max: Infinity, base: 72, mult: 1.6, desc: (l) => '+' + (l * 10) + '% satış' },
  { id: 'pres', grp: 'Fabrika', name: 'Pres hızı', icon: '⚙️', max: 14, base: 40, mult: 1.8, desc: (l) => (1.6 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/taban' },
  { id: 'mont', grp: 'Fabrika', name: 'Montaj hızı', icon: '🤖', max: 14, base: 48, mult: 1.8, desc: (l) => (1.4 * Math.pow(0.85, l)).toFixed(2).replace('.', ',') + ' sn/FLIX' },
  { id: 'kumes', grp: 'Fabrika', name: 'Kümes verimi', icon: '🦃', max: 14, base: 40, mult: 1.8, desc: (l) => '+' + Math.round((1 / Math.pow(0.85, l) - 1) * 100) + '% tüy' },
  { id: 'bant', grp: 'Fabrika', name: 'Tüy bandı hızı', icon: '🛤️', max: 10, base: 240, mult: 1.9, desc: (l) => (1.1 * Math.pow(0.8, l)).toFixed(2).replace('.', ',') + ' sn/parça' },
  { id: 'test', grp: 'Fabrika', name: 'Oyun parkı (3 çocuk)', icon: '🧒', max: 10, base: 56, mult: 1.8, desc: (l) => KICKN(l) + ' sektirme · ' + (KICKN(l) * 0.55 * Math.pow(0.9, l)).toFixed(1).replace('.', ',') + ' sn · %' + Math.max(1, Math.round(10 - l)) + ' hatalı' },
  { id: 'truck', grp: 'Fabrika', name: 'Kamyon', icon: '🚚', max: 10, base: 240, mult: 2.0, desc: (l) => (10 + l * 4) + ' kutu · ' + Math.round(30 * Math.pow(0.85, l)) + ' sn yol' },
  { id: 'tez', grp: 'Fabrika', name: 'Tezgâh rafı', icon: '🧺', max: 8, base: 64, mult: 2.2, desc: (l) => (12 + l * 4) + ' FLIX' },
  { id: 'robot', grp: 'Fabrika', name: 'Toplayıcı robot', icon: '🤖', max: 8, base: 320, mult: 1.8, need: 'robot', desc: (l) => 'Tank ' + (3 + l) + ' tüy · +' + (l * 10) + '% hız' },
  { id: 'cek', grp: 'Patron', name: 'Reklam & tanıtım', icon: '📣', max: Infinity, base: 120, mult: 1.7, desc: (l) => '+' + Math.round((1 - Math.pow(0.94, l)) * 100) + '% müşteri' },
  { id: 'pazar', grp: 'Patron', name: 'Sipariş primi', icon: '📦', max: Infinity, base: 160, mult: 1.65, desc: (l) => '+' + (l * 15) + '% sipariş ödülü' },
];
export const KICKN = (l) => l >= 7 ? 1 : l >= 3 ? 2 : 3;
export const spdPct = (l) => Math.round(l <= 6 ? l * 12 : 72 + (l - 6) * 6);
// İşe alım (para)
export const STAFF = [
  { id: 'tas', name: 'Taşıyıcı', icon: '🧑‍🏭', desc: 'Tüy ve taban taşır, FLIX’leri tezgâha dizer', costs: [150, 700, 2600, 8000, 15000, 26000, 42000, 65000], max: 8 },
  { id: 'kas', name: 'Kasiyer', icon: '🧾', desc: 'Her kasaya bir kasiyer: satış 3 kat hızlı', costs: [250, 900, 2500, 6000, 12000], max: 5 },
];
export const SUPS = [
  { id: 'wspd', name: 'Eleman hızı', icon: '⚡', max: 8, base: 120, mult: 1.9, desc: (l) => '+' + (l * 12) + '% hız' },
  { id: 'wcap', name: 'Eleman kapasitesi', icon: '🎒', max: 8, base: 150, mult: 1.9, desc: (l) => (2 + l) + ' parça' },
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
    { id: 'kiraz', name: 'Kiraz', gem: 70, b: { cap: 1, kar: 0.05 }, sw: '#ff4a6a' },
    { id: 'okyanus', name: 'Okyanus', gem: 110, b: { spd: 0.1, cap: 1 }, sw: 'linear-gradient(135deg,#0a5ad8,#2fe8ff)' },
    { id: 'robot', name: 'Robot FLIX', gem: 180, b: { cap: 3 }, sw: 'linear-gradient(135deg,#9aa6b8,#e8eef6)' },
    { id: 'zumrut', name: 'Zümrüt', gem: 220, b: { kar: 0.18, cap: 1 }, sw: 'linear-gradient(135deg,#0a8a5a,#7affc8)' },
    { id: 'gunbatimi', name: 'Gün Batımı', gem: 280, b: { spd: 0.14, kar: 0.14 }, sw: 'linear-gradient(135deg,#ff6a2a,#ff2d9a 60%,#5a2dd0)' },
    { id: 'kar', name: 'Kar Tanesi', gem: 320, b: { spd: 0.18, cap: 2 }, sw: 'linear-gradient(135deg,#ffffff,#bfe6ff)' },
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
    { id: 'bere', name: 'Kışlık bere', gem: 35, b: { cap: 1 }, ic: '🧶' },
    { id: 'kovboy', name: 'Kovboy şapkası', gem: 60, b: { spd: 0.08, kar: 0.03 }, ic: '🤠' },
    { id: 'maske', name: 'Süper maske', gem: 90, b: { spd: 0.1, cap: 1 }, ic: '🦹' },
    { id: 'anten', name: 'Yıldız anten', gem: 140, b: { kar: 0.1, cap: 1 }, ic: '⭐' },
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
    { id: 'beton', name: 'Fabrika betonu', gem: 30, b: { cap: 1 }, a: '#cfd3d9', b2: '#c3c8cf', l: 'rgba(40,50,70,.22)', hazard: true },
    { id: 'kiremit', name: 'Kırmızı karo', gem: 45, b: { kar: 0.05 }, a: '#ffb8aa', b2: '#ff9f8e', l: 'rgba(140,30,20,.2)' },
    { id: 'uzay', name: 'Uzay', gem: 160, b: { kar: 0.14, spd: 0.05 }, a: '#151b3e', b2: '#10163a', l: 'rgba(140,180,255,.4)', stars: true },
  ],
  // eleman kıyafetleri ve şapkaları: tüm taşıyıcılar giyer. ws = eleman hızı, wc = eleman taşıma
  wskin: [
    { id: 'karisik', name: 'Karışık renkler', price: 0, b: {}, sw: 'linear-gradient(90deg,#2f8fe0 25%,#1a9a4a 25% 50%,#ff2d9a 50% 75%,#ffb81a 75%)' },
    { id: 'buzul', name: 'Mavi tulum', gem: 25, b: { ws: 0.06 }, sw: '#2f8fe0' },
    { id: 'ejder', name: 'Yeşil yelek', gem: 40, b: { wc: 1 }, sw: '#1a9a4a' },
    { id: 'kraliyet', name: 'FLIX kırmızısı', gem: 60, b: { ws: 0.08, wc: 1 }, sw: '#e22511' },
    { id: 'turkuaz', name: 'Turkuaz ekip', gem: 80, b: { ws: 0.12 }, sw: '#18c0b0' },
    { id: 'robot', name: 'Robot ekip', gem: 140, b: { wc: 2 }, sw: 'linear-gradient(135deg,#9aa6b8,#e8eef6)' },
    { id: 'altin', name: 'Altın ekip', gem: 200, b: { ws: 0.15, wc: 1 }, sw: '#ffb81a' },
    { id: 'galaksi', name: 'Galaksi ekip', gem: 260, b: { ws: 0.18, wc: 2 }, sw: 'linear-gradient(135deg,#5a2dd0,#ff6af0)' },
  ],
  wacc: [
    { id: 'kask', name: 'Usta bareti', price: 0, b: {}, ic: '⛑️' },
    { id: 'yok', name: 'Şapkasız', price: 0, b: {}, ic: '➖' },
    { id: 'sapka', name: 'FLIX şapkası', gem: 20, b: { ws: 0.05 }, ic: '🧢' },
    { id: 'kulak', name: 'Kulaklık', gem: 30, b: { wc: 1 }, ic: '🎧' },
    { id: 'bere', name: 'Kışlık bere', gem: 35, b: { ws: 0.06 }, ic: '🧶' },
    { id: 'gozluk', name: 'Güneş gözlüğü', gem: 45, b: { ws: 0.08 }, ic: '🕶️' },
    { id: 'kovboy', name: 'Kovboy şapkası', gem: 70, b: { ws: 0.08, wc: 1 }, ic: '🤠' },
    { id: 'tac', name: 'Altın taç', gem: 150, b: { ws: 0.12, wc: 1 }, ic: '👑' },
  ],
};
export const bonusTxt = (b) => [b.spd && '+' + Math.round(b.spd * 100) + '% hız', b.cap && '+' + b.cap + ' taşıma', b.kar && '+' + Math.round(b.kar * 100) + '% kâr', b.ws && '+' + Math.round(b.ws * 100) + '% eleman hızı', b.wc && '+' + b.wc + ' eleman taşıma'].filter(Boolean).join(' · ');
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
// Diğer FLIX oyunları (çapraz tanıtım: menü, mağaza, reklam kartı, dünyadaki panolar)
export const PROMO = [
  { id: 'rush', name: 'FLIX RUSH', txt: 'Neon yörüngede kaç, rekor kır!', url: 'https://apps.apple.com/app/id6795291439', bg: 'linear-gradient(160deg,#2a0a6a,#ff2d9a)' },
  { id: 'kickup', name: 'FLIX KICK UP', txt: 'FLIX’i düşürmeden sektir!', url: 'https://kaanimamoglu27.github.io/flix-kick-up/', bg: 'linear-gradient(160deg,#e22511,#7a0d05)' },
];
// Müşteri siparişleri: mavi / kırmızı / sarı FLIX ya da karışık. Tam istediğini alan %30 fazla öder.
export const ORDERS = { mavi: { n: 'Mavi', c: '#2a80dc' }, kirmizi: { n: 'Kırmızı', c: '#e8301c' }, sari: { n: 'Sarı', c: '#ffc20e' }, mix: { n: 'Karışık', c: 'conic-gradient(#2a80dc 0 33%,#e8301c 0 66%,#ffc20e 0)' } };
