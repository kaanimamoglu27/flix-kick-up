// ================= WORLDS (v6): Sokak, Amerika, Avrupa, Uzay · 20 levels each =================
const WORLDS = [
  {id: 'sokak', name: 'SOKAK', sub: 'Mahalle', col: '#e22511'},
  {id: 'amerika', name: 'AMERİKA', sub: 'Büyük şehir', col: '#1f6fd1'},
  {id: 'avrupa', name: 'AVRUPA', sub: 'Eski şehir', col: '#2f8a4a'},
  {id: 'uzay', name: 'UZAY', sub: 'Ay üssü', col: '#4a3ab0'},
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
  uzay: {walls: [['#d8dce4', '#3a4a6a', '#1f6fd1'], ['#c8ccd6', '#2a2f3a', '#e22511'], ['#e8ecf2', '#4a5a7a', '#7a4fb0'], ['#b8c0cc', '#1b1330', '#ff7a1a']],
    shops: ['AY MARKET', 'ROKET YAKIT', 'UZAY BÜFE', 'KRATER KAFE', 'YILDIZ TOZU', 'METEOR ÇAY', 'ORBİT TAMİR', 'GALAKSİ PİDE', 'KUYRUKLU DÖNER', 'NEBULA BERBER'],
    style: 'metal', hMin: 3.6, hMax: 6.2, g: 8.5, cars: [0xf4f4f4, 0xe8ecf2, 0xff7a1a], sky: ['#03040c', '#0b0f2e', '#1b1f45'], fog: 0x0b0f2e, stars: 1},
};
let CUR_THEME = 'sokak';
function themeOf(i) { return WORLDS[Math.floor(i / PER_WORLD)].id; }

// ---- generated levels for Amerika, Avrupa, Uzay ----
function lrng(s) { let a = s >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
// pars = shots the test bot needed (v6)
const GEN_PARS = {amerika: [2, 2, 2, 2, 4, 4, 5, 4, 5, 4, 5, 8, 9, 6, 7, 6, 7, 7, 7, 7], avrupa: [2, 2, 2, 2, 5, 4, 5, 4, 4, 5, 5, 7, 7, 8, 7, 6, 6, 7, 7, 7], uzay: [2, 2, 3, 2, 4, 4, 5, 4, 5, 4, 4, 6, 7, 8, 6, 8, 7, 6, 6, 7]};
function genLevel(theme, k) {
  const R = lrng(7919 * (k + 1) + theme.length * 131 + theme.charCodeAt(1) * 17), rr = (a, b) => a + R() * (b - a), ri = (a, b) => Math.floor(rr(a, b + 1));
  const SC = theme === 'uzay' ? 1.45 : 1, TH = THEMES[theme];
  const names = {
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
  return def;
}
