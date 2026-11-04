// ================= WORLDS (v7): 9 worlds · 20 levels each =================
const WORLDS = [
  {id: 'sokak', name: 'SOKAK', sub: 'Mahalle', col: '#e22511', cost: 0, old: 0},
  {id: 'turkiye', name: 'TÜRKİYE', sub: 'Tarihi çarşı', col: '#c8102e', cost: 200},
  {id: 'amerika', name: 'AMERİKA', sub: 'Büyük şehir', col: '#1f6fd1', cost: 350, old: 20},
  {id: 'avrupa', name: 'AVRUPA', sub: 'Eski şehir', col: '#2f8a4a', cost: 500, old: 40},
  {id: 'asya', name: 'ASYA', sub: 'Fener sokağı', col: '#d83a5a', cost: 700},
  {id: 'avustralya', name: 'AVUSTRALYA', sub: 'Sahil kasabası', col: '#ff8a1a', cost: 900},
  {id: 'afrika', name: 'AFRİKA', sub: 'Savan köyü', col: '#b8641e', cost: 1100},
  {id: 'antarktika', name: 'ANTARKTİKA', sub: 'Buz üssü', col: '#3aa8d8', cost: 1400},
  {id: 'uzay', name: 'UZAY', sub: 'Ay üssü', col: '#4a3ab0', cost: 1800, old: 60},
];
const PER_WORLD = 20;
const THEMES = {
  sokak: {walls: null, shops: null, style: 'plaster', hMin: 4.2, hMax: 7.2, cars: [0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e, 0x7a4fb0], sky: ['#86cfe6', '#d6f0ee', '#fde2c6'], fog: 0xd6f0ee},
  amerika: {walls: [['#a8553a', '#1b1330', '#e22511'], ['#8a4a36', '#022753', '#1f6fd1'], ['#c8b8a0', '#3a3f4a', '#2fa84f'], ['#b8664a', '#022753', '#ffc20e'], ['#d8d0c0', '#1b1330', '#7a4fb0'], ['#9a5a44', '#1b1330', '#ff7a1a']],
    shops: ['BURGER BOB', 'TACO TOM', 'DINER DOLLY', 'DONUT DAN', 'PIZZA PETE', 'LAUNDRY LOU', 'HOT DOG HANK', 'SODA SAM', 'CANDY CINDY', 'BAGEL BEN', 'PANCAKE PAM', 'COMICS CARL', 'WAFFLE WALT', 'NACHO NICK'],
    style: 'brick', hMin: 8, hMax: 13, cars: [0xffc20e, 0xffc20e, 0xffc20e, 0x1f6fd1, 0xe22511, 0x1b1330], sky: ['#5fb0e8', '#cfe6f0', '#f8d8b0'], fog: 0xcfe6f0},
  avrupa: {walls: [['#efe2c4', '#2f5a3a', '#7a2a2a'], ['#e8d4b0', '#1f4f7a', '#022753'], ['#f2e8d8', '#7a2a2a', '#2f5a3a'], ['#d8c8a8', '#3a3f4a', '#8a3a1a'], ['#f4dcc8', '#2f6b4a', '#1b1330'], ['#e0e4e8', '#1f4f7a', '#7a2a2a']],
    shops: ['CAFÉ MON AMI', 'BOULANGERIE', 'PIZZERIA LUIGI', 'GELATO GINA', 'BIERHAUS HANS', 'PASTA PAOLO', 'CROISSANT CLUB', 'CHOCOLAT', 'TAPAS PEPE', 'FROMAGERIE', 'KONDITOREI', 'TRATTORIA', 'CRÊPE CHLOÉ', 'WAFFEL WIM'],
    style: 'stone', hMin: 5.2, hMax: 8.4, cars: [0x2f8a4a, 0xf4eee2, 0x7a2a2a, 0x1f6fd1, 0xffc20e], sky: ['#9ad0ec', '#e4f0f0', '#f4e4d0'], fog: 0xe4f0f0},
  turkiye: {walls: [['#f4e4c8', '#7a2a1a', '#c8102e'], ['#e8d0a8', '#5a3a22', '#c8102e'], ['#f8ecd8', '#2f5a3a', '#c8102e'], ['#d8b890', '#7a2a1a', '#022753'], ['#f0d8c8', '#5a3a22', '#2f8a4a']],
    shops: ['LOKUMCU LÜTFÜ', 'KÜNEFECİ KEMAL', 'ÇAYCI ÇETİN', 'BAKLAVACI BARIŞ', 'DONDURMACI DURSUN', 'HALICI HAMDİ', 'KOKOREÇÇİ KOKO', 'MIDYECİ MİDO', 'TESBİHÇİ TAHSİN', 'PİŞMANİYECİ PİŞO', 'KEBAPÇI KEREM', 'BOZACI BOZO', 'GÖZLEMECİ GÜLÜ', 'ŞALGAMCI ŞAHAP'],
    style: 'wood', hMin: 5, hMax: 8, cars: [0xc8102e, 0xffc20e, 0x1f6fd1, 0xf4eee2], sky: ['#7ec2e8', '#f0e4d0', '#ffc890'], fog: 0xf0e4d0},
  asya: {walls: [['#f4ead8', '#b8102e', '#b8102e'], ['#e8e0d0', '#1b1330', '#d83a5a'], ['#f8f0e0', '#2f6b4a', '#b8102e'], ['#d8d0c0', '#b8102e', '#1b1330'], ['#f0e0e4', '#1b1330', '#ffc20e']],
    shops: ['RAMEN REN', 'SUSHI SAKURA', 'DIM SUM DAN', 'BAO BAO', 'NOODLE NINA', 'MOCHI MIKO', 'TOFU TAO', 'PHO PHONG', 'KIMCHI KIM', 'BOBA BOBO', 'CURRY KUMAR', 'WOK WANG', 'TEMPURA TEO', 'MATCHA MEI'],
    style: 'asia', hMin: 5, hMax: 9, cars: [0xd83a5a, 0xf4f4f4, 0x2fa84f, 0xffc20e], sky: ['#8ab8e8', '#f4dce4', '#ffd0d8'], fog: 0xf4dce4},
  avustralya: {walls: [['#bfe4e8', '#f4f4f4', '#ff8a1a'], ['#f8e0a8', '#f4f4f4', '#1f6fd1'], ['#d8f0c8', '#f4f4f4', '#e22511'], ['#f8d0c0', '#f4f4f4', '#2f8a4a'], ['#e0e8f8', '#f4f4f4', '#ff8a1a']],
    shops: ['SURF SHACK', 'KOALA KAFE', 'BARBEKÜ BAZ', 'MEAT PIE MO', 'KANGA KIOSK', 'BUMERANG BOB', 'OUTBACK OLLIE', 'REEF RITA', 'FLAT WHITE FRED', 'BEACH BEV', 'G\'DAY GARY', 'CROCO CAFE'],
    style: 'board', hMin: 3.8, hMax: 6, cars: [0xff8a1a, 0x1f6fd1, 0xf4f4f4, 0x2fa84f], sky: ['#3ea0f0', '#bfe6f8', '#f8f0c8'], fog: 0xbfe6f8},
  afrika: {walls: [['#c8844a', '#5a3a22', '#e8a020'], ['#d89a5a', '#3a2a1a', '#2f8a4a'], ['#b8743a', '#5a3a22', '#c8102e'], ['#e0aa6a', '#3a2a1a', '#1f6fd1'], ['#c88a5a', '#5a3a22', '#ffc20e']],
    shops: ['SAFARİ SAM', 'BAOBAB BAR', 'JOLLOF JOE', 'MANGO MAMA', 'ZEBRA ZONE', 'KENTE KEMI', 'DAVUL DUMA', 'TAM TAM TAKI', 'ASLAN ALİ', 'KAKAO KOFI', 'HURMA HASAN', 'FIL FATU'],
    style: 'adobe', hMin: 3.4, hMax: 5.4, cars: [0xe8a020, 0x2f8a4a, 0xc8102e, 0xf4eee2], sky: ['#f0b060', '#f8d8a0', '#ffe8c0'], fog: 0xf8d8a0},
  antarktika: {walls: [['#e8f4fc', '#1f6fd1', '#e22511'], ['#d8ecf8', '#022753', '#ff8a1a'], ['#f4fafe', '#3aa8d8', '#e22511'], ['#c8e0f0', '#022753', '#ffc20e']],
    shops: ['İGLO İSO', 'BUZ BAR', 'PENGUEN PAŞA', 'KAR KAFE', 'FOK FIRIN', 'KUTUP KÜMES', 'AURORA ÇAY', 'KARTOPU KAMİL', 'SOĞUK SAMİ', 'BUZDAĞI BÜFE', 'FIRTINA FERDİ', 'KIZAK KIOSK'],
    style: 'ice', hMin: 3.6, hMax: 5.6, cars: [0xe22511, 0xff8a1a, 0xffc20e], sky: ['#6ab0e0', '#d8ecf8', '#f4fafe'], fog: 0xe4f2fa},
  uzay: {walls: [['#d8dce4', '#3a4a6a', '#1f6fd1'], ['#c8ccd6', '#2a2f3a', '#e22511'], ['#e8ecf2', '#4a5a7a', '#7a4fb0'], ['#b8c0cc', '#1b1330', '#ff7a1a']],
    shops: ['AY MARKET', 'ROKET YAKIT', 'UZAY BÜFE', 'KRATER KAFE', 'YILDIZ TOZU', 'METEOR ÇAY', 'ORBİT TAMİR', 'GALAKSİ PİDE', 'KUYRUKLU DÖNER', 'NEBULA BERBER'],
    style: 'metal', hMin: 3.6, hMax: 6.2, g: 8.5, cars: [0xf4f4f4, 0xe8ecf2, 0xff7a1a], sky: ['#03040c', '#0b0f2e', '#1b1f45'], fog: 0x0b0f2e, stars: 1},
};
let CUR_THEME = 'sokak';
function themeOf(i) { return WORLDS[Math.floor(i / PER_WORLD)].id; }

// ---- generated levels for Amerika, Avrupa, Uzay ----
function lrng(s) { let a = s >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
// pars = shots the test bot needed (v6)
const GEN_PARS = {turkiye: [2,  2,  2,  2,  3,  4,  5,  4,  5,  5,  6,  7,  7,  8,  7,  7,  7,  7,  7,  8], asya: [2,  2,  2,  2,  5,  4,  4,  4,  4,  4,  5,  6,  7,  9,  6,  7,  7,  9,  7,  7], avustralya: [2,  2,  3,  2,  5,  5,  4,  4,  5,  6,  4,  6,  7,  6,  6,  7,  7,  7,  8,  8], afrika: [3,  2,  2,  2,  4,  5,  5,  4,  4,  6,  4,  6,  6,  8,  6,  7,  8,  7,  7,  6], antarktika: [2,  2,  2,  2,  4,  4,  4,  4,  5,  4,  5,  7,  7,  6,  7,  9,  7,  8,  8,  8], amerika: [2, 2, 2, 2, 4, 4, 5, 4, 5, 4, 5, 8, 9, 6, 7, 6, 7, 7, 7, 7], avrupa: [2, 2, 2, 2, 5, 4, 5, 4, 4, 5, 5, 7, 7, 8, 7, 6, 6, 7, 7, 7], uzay: [2, 2, 3, 2, 4, 4, 5, 4, 5, 4, 4, 6, 7, 8, 6, 8, 7, 6, 6, 7]};
function genLevel(theme, k) {
  const R = lrng(7919 * (k + 1) + theme.length * 131 + theme.charCodeAt(1) * 17), rr = (a, b) => a + R() * (b - a), ri = (a, b) => Math.floor(rr(a, b + 1));
  const SC = theme === 'uzay' ? 1.45 : 1, TH = THEMES[theme];
  const names = {
    turkiye: ['Simitçi Köşesi', 'Çay Ocağı', 'Kapalı Çarşı', 'Lokum Yolu', 'Tramvay Durağı', 'Cumbalı Evler', 'Galata Yokuşu', 'Baklava Köprüsü', 'Bozacı Sokağı', 'Halı Pazarı', 'Rüzgârlı İskele', 'Kız Kulesi Manzarası', 'Kebap Kavşağı', 'Martı Köprüsü', 'Eski Hamam', 'Bayrak Sokak', 'Fener Yolu', 'Lale Bahçesi', 'Boğaz Rüzgârı', 'Türkiye Finali'],
    asya: ['Fener Sokağı', 'Ramen Köşesi', 'Kiraz Çiçeği', 'Pagoda Yolu', 'Bambu Bahçesi', 'Gece Pazarı', 'Ejderha Kapısı', 'Çay Evi', 'Fener Köprüsü', 'Pirinç Tarlası', 'Rüzgârlı Tapınak', 'Neon Ara Sokak', 'Bonsai Bahçesi', 'Panda Yolu', 'Kâğıt Fener', 'Samuray Köprüsü', 'Tapınak Merdiveni', 'Uçurtma Şenliği', 'Ejderha Rüzgârı', 'Asya Finali'],
    avustralya: ['Sahil Yolu', 'Sörf Kulübesi', 'Kanguru Geçidi', 'Koala Ağacı', 'Barbekü Parkı', 'Mercan Köşesi', 'Okyanus Köprüsü', 'Bumerang Yolu', 'Çöl Kasabası', 'Deniz Feneri', 'Rüzgârlı Plaj', 'Timsah Köprüsü', 'Palmiyeli Cadde', 'Liman Kafe', 'Kızıl Çöl', 'Dalga Kıran', 'Okaliptüs Yolu', 'Gün Batımı Plajı', 'Fırtınalı Sahil', 'Avustralya Finali'],
    afrika: ['Savan Yolu', 'Baobab Ağacı', 'Pazar Günü', 'Zürafa Geçidi', 'Davul Meydanı', 'Kerpiç Evler', 'Nehir Köprüsü', 'Mango Bahçesi', 'Piramit Manzarası', 'Kum Fırtınası', 'Rüzgârlı Vaha', 'Fil Yolu', 'Aslan Tepesi', 'Akasya Gölgesi', 'Çöl Kervanı', 'Kente Çarşısı', 'Şelale Yolu', 'Gün Batımı Savanı', 'Sıcak Rüzgâr', 'Afrika Finali'],
    antarktika: ['İlk Kar', 'Penguen Yolu', 'Buz Köprüsü', 'İgloo Köyü', 'Kardan Adam', 'Buzdağı', 'Araştırma Üssü', 'Kayan Yol', 'Kutup Işığı', 'Fok Burnu', 'Kar Fırtınası', 'Buz Mağarası', 'Kızak Yolu', 'Penguen Kolonisi', 'Donmuş Göl', 'Aurora Gecesi', 'Buz Kalesi', 'Soğuk Rüzgâr', 'Beyaz Çöl', 'Antarktika Finali'],
    amerika: ['Taksi Durağı', 'Hot Dog Köşesi', 'Gökdelen Altı', 'Sarı Taksiler', 'Broadway Kavşağı', 'Merkez Park', 'Yangın Merdiveni', 'Donut Caddesi', 'Çatı Bahçesi', 'Büyük Kavşak', 'Rüzgârlı Bulvar', 'Metro Çıkışı', 'Neon Sokak', 'Liman Yolu', 'Köprü Altı', 'Gece Treni', 'Zikzak Bloklar', 'Yokuş Şehir', 'Trafik Kaosu', 'Şehir Finali'],
    avrupa: ['Kafe Önü', 'Taş Sokak', 'Kanal Köprüsü', 'Çiçekli Balkon', 'Fırın Kokusu', 'Saat Kulesi', 'Meydan', 'Dar Pasaj', 'Merdivenli Mahalle', 'Kanal Turu', 'Rüzgârlı Rıhtım', 'Eski Çarşı', 'Kilise Yolu', 'Çifte Köprü', 'Tepe Kafe', 'Labirent', 'Yağmurlu Cadde', 'Kale Yokuşu', 'Gondol Yolu', 'Avrupa Finali'],
    uzay: ['İlk Adım', 'Krater Atlayışı', 'Düşük Yerçekimi', 'Ay Üssü', 'Roket Rampası', 'Yıldız Yolu', 'Kubbe Şehir', 'Göktaşı Kuşağı', 'Uzay Pazarı', 'Yörünge', 'Asteroit Köprüsü', 'Karanlık Taraf', 'Uydu Bahçesi', 'Meteor Yağmuru', 'Kraterler Arası', 'Uzaylı Mahallesi', 'Yerçekimsiz Zikzak', 'Güneş Paneli', 'Galaksi Kavşağı', 'Uzay Finali'],
  }[theme];
  const turns = k < 4 ? 0 : k < 11 ? 1 : 2, feats = Math.min(3, Math.floor(k / 4)), wind = theme !== 'uzay' && (k % 5 === 3 || k >= 16 && k % 2) ? (R() > 0.5 ? 1 : -1) * rr(1.2, 2.4) : 0;
  const def = {name: names[k], theme, par: GEN_PARS[theme][k], wind, start: [0, 3], route: [[0, 3]], g: TH.g};
  def.build = (L) => {
    let cx = 0, z = 6, top = 0, dir = R() > 0.5 ? 1 : -1; const pts = [[0, 3]];
    const run = (len, last) => { // a z-street run with features, returns nothing; moves z
      let left = len * SC;
      const chunks = []; let f = last ? feats : Math.max(0, feats - 1);
      while (left > 0) {
        const kind = f > 0 && left > 14 && R() < 0.55 ? (R() < 0.5 ? 'bridge' : 'stairs') : 'street';
        if (kind !== 'street') f--;
        const l = kind === 'street' ? Math.min(left, rr(10, 16) * SC) : kind === 'bridge' ? rr(7, 9.5) * (theme === 'uzay' ? 1.15 : 1) : 12;
        chunks.push([kind, l]); left -= l;
      }
      chunks.forEach(([kind, l], ci) => {
        const zA = z, zB = z - l, endHere = last && ci === chunks.length - 1;
        if (kind === 'street') {
          stZ(L, cx, zA, zB, {top, end: endHere ? 1 : 0, lamps: theme !== 'uzay' || R() > 0.5});
          const n = Math.floor(l / 7);
          for (let q = 0; q < n; q++) {
            const pz = zA - 3 - q * 7 - rr(0, 3); if (pz > 0 && cx === 0) continue; if (endHere && pz < zB + 5) continue;
            const t = R();
            if (t < 0.3 + k * 0.012) L.props.push({t: 'line', x0: cx - 3.4, x1: cx + 3.4, z: pz, h: rr(2.8, 3.7)});
            else if (t < 0.6) L.props.push({t: 'car', x: cx + (R() > 0.5 ? 1.1 : -1.1), z: pz, col: TH.cars[ri(0, TH.cars.length - 1)], ax: 'z'});
            else if (t < 0.72) L.props.push({t: 'kiosk', x: cx + (R() > 0.5 ? 1.0 : -1.0), z: pz});
            else if (t < 0.85 && theme !== 'uzay') L.props.push({t: 'tree', x: cx + (R() > 0.5 ? 2.6 : -2.6), z: pz});
            else if (k > 6) L.props.push({t: 'stall', x: cx + (R() > 0.5 ? 0.9 : -0.9), z: pz, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a', '#ffc20e'])});
            if (R() < 0.6) L.actors.push(walker(cx + (R() > 0.5 ? 2.4 : -2.4), pz + 2, cx + (R() > 0.5 ? 2.4 : -2.4), pz - 4, {sp: rr(0.6, 1.0), col: pick([0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e, 0x7a4fb0, 0xff8fb8, 0xff7a1a])}));
            else if (R() < 0.5) L.actors.push({t: 'cat', x: cx + (R() > 0.5 ? 2.4 : -2.4), z: pz - 1, sit: R() > 0.4 ? 1 : 0, path: [cx + 2.4, pz, cx + 2.4, pz - 5], sp: 0.7});
            else if (theme !== 'uzay') L.actors.push({t: 'pigeons', x: cx + rr(-1, 1), z: pz - 2, n: ri(3, 5)});
            else L.actors.push({t: 'dog', x: cx - 2.4, z: pz, path: [cx - 2.4, pz, cx - 2.4, pz - 6], sp: 1.1});
          }
        } else if (kind === 'bridge') {
          L.islands.push({x: cx, z: (zA + zB) / 2, w: rr(1.4, 1.9), d: l, top: top + 0.22, kind: 'bridge'});
          if (R() < 0.6 && theme !== 'uzay') L.actors.push({t: 'pigeons', x: cx, z: (zA + zB) / 2, n: 3});
        } else { // stairs: two steps up, street continues higher
          const s1 = top + 1.0, s2 = top + 2.0; plaza(L, cx, zA - 3, 6.8, 6, s1); plaza(L, cx, zA - 9, 6.8, 6, s2);
          L.props.push(lot({h: 3.2 + s1}, cx - 5.6, cx - 3.4, zA - 6, zA, '+x', top + 0.22), lot({h: 3.2 + s1}, cx + 3.4, cx + 5.6, zA - 6, zA, '-x', top + 0.22),
            lot({h: 3.2 + s2}, cx - 5.6, cx - 3.4, zB, zA - 6, '+x', top + 0.22), lot({h: 3.2 + s2}, cx + 3.4, cx + 5.6, zB, zA - 6, '-x', top + 0.22));
          if (R() < 0.6) L.props.push({t: 'plant', x: cx + (R() > 0.5 ? 2 : -2), z: zA - 8});
          top = s2 - 0.2;
        }
        z = zB;
      });
    };
    for (let t = 0; t < turns; t++) {
      run(rr(14, 22), false); // to the junction
      const j1 = z - 8, zT = j1 - 3.4, len = rr(14, 20) * SC, cx2 = cx + dir * len;
      stZ(L, cx, z, j1, {top, [dir > 0 ? 'gapR' : 'gapL']: [[j1 + 2.2, j1]]});
      const tb = top + 0.22;
      if (dir > 0) { stX(L, zT, cx - 3.4, cx2 + 3.4, {top, gapN: [[cx - 3.4, cx + 3.4]], gapF: [[cx2 - 3.4, cx2 + 3.4]]}); L.props.push(lot({h: 6}, cx - 5.6, cx - 3.4, zT - 3.4, zT + 3.4, '+x', tb), lot({h: 6}, cx2 + 3.4, cx2 + 5.6, zT - 3.4, zT + 5.6, '-x', tb)); }
      else { stX(L, zT, cx2 - 3.4, cx + 3.4, {top, gapN: [[cx - 3.4, cx + 3.4]], gapF: [[cx2 - 3.4, cx2 + 3.4]]}); L.props.push(lot({h: 6}, cx + 3.4, cx + 5.6, zT - 3.4, zT + 3.4, '-x', tb), lot({h: 6}, cx2 - 5.6, cx2 - 3.4, zT - 3.4, zT + 5.6, '+x', tb)); }
      const mx = (cx + cx2) / 2; if (R() < 0.7) L.props.push({t: 'car', x: mx + rr(-3, 3), z: zT + (R() > 0.5 ? 1.1 : -1.1), col: TH.cars[ri(0, TH.cars.length - 1)], ax: 'x'});
      if (k > 8 && R() < 0.6) L.props.push({t: 'stall', x: mx + rr(-4, 4), z: zT + (R() > 0.5 ? 0.9 : -0.9), col: pick(['#e22511', '#ffc20e', '#2fa84f']), ax: 'x'});
      L.actors.push(walker(mx - 4, zT + 2.5, mx + 4, zT + 2.5, {sp: 0.9, col: pick([0xe22511, 0x1f6fd1, 0x7a4fb0])}));
      pts.push([cx, zT], [cx2, zT]); cx = cx2; z = zT - 3.4; dir = -dir;
    }
    run(rr(28, 36) + k * 0.4, true);
    const bz = z + (theme === 'uzay' && k === 2 ? 8 : 4.5), bx = cx + rr(-0.9, 0.9); def.bucket[0] = bx; def.bucket[1] = bz; pts.push([bx, bz]);
    L.route = pts; def.route = pts;
    // golden feathers along the route
    const segs = []; let tot = 0; for (let q = 0; q < pts.length - 1; q++) { const d = Math.hypot(pts[q + 1][0] - pts[q][0], pts[q + 1][1] - pts[q][1]); segs.push(d); tot += d; }
    for (const u of [0.3, 0.55, 0.8]) { let d = u * tot, q = 0; while (q < segs.length - 1 && d > segs[q]) { d -= segs[q]; q++; } const a = pts[q], b = pts[q + 1], f = d / segs[q], px = a[0] + (b[0] - a[0]) * f, pz = a[1] + (b[1] - a[1]) * f; L.feathers.push([px, 3.8 + rr(0, 0.8) + (L.islands.find((I) => Math.abs(px - I.x) <= I.w / 2 && Math.abs(pz - I.z) <= I.d / 2) || {top: 0}).top, pz]); }
  };
  def.bucket = [0, 0];
  const W = WORLDS.find((q) => q.id === theme), wi = WORLDS.indexOf(W); def.seedI = W.old !== undefined ? W.old + k : 200 + wi * PER_WORLD + k;
  return def;
}
