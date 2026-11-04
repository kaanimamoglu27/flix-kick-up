// ================= LEVELS (golf style: several shots, par) =================
// Streets are built from pieces. stZ = a street running along z (forward = -z), stX = along x.
// Each adds road + two pavements (islands) and a row of shop buildings on both sides facing the street.
const SHOPS = ['TOSUN MARKET', 'BAKKAL BÜLENT', 'FÖNCÜ FERDİ', 'SİMİT SARAYI', 'DEMLİK ÇAY EVİ', 'KÖFTECİ KAMİL', 'KUAFÖR KAFA', 'NALBUR NURİ', 'ŞIPSAK FOTO', 'BÖREKÇİ BEDRİ', 'MANAV MUAMMER', 'BERBER BAYRAM', 'ECZANE ŞİFA', 'KASAP KADİR', 'TERZİ TEYZE', 'PİDECİ PAŞA', 'DÖNERCİ DOYUR', 'TOMBİK BÜFE', 'ŞEKERCİ ŞÜKRÜ', 'TATLICI TOMBUL', 'MİSKET OYUNCAK', 'GEVREK FIRIN', 'ÇIRAK ELEKTRİK', 'PAŞA LOKANTA'];
const WALLS = [['#f2d8b0', '#2fa84f', '#e22511'], ['#cfe3e8', '#1f6fd1', '#022753'], ['#f4c7b8', '#7a4fb0', '#2fa84f'], ['#e8d0e8', '#022753', '#7a4fb0'], ['#f7e6a8', '#e22511', '#e22511'], ['#d6e8d0', '#2fa84f', '#022753'], ['#f0dcc8', '#b8402a', '#1f6fd1'], ['#dfe0ea', '#e22511', '#ff7a1a']];
const GOODS = [['#e8b060', '#c98a3a', '#f4d090'], ['#e22511', '#ffc20e', '#2fa84f'], ['#1f6fd1', '#f4eee2'], ['#e22511', '#2fa84f', '#ff7a1a'], ['#f4eee2', '#2fa84f'], ['#b8402a', '#f4eee2']];
function lot(o, x0, x1, z0, z1, face, top) { const w = pick(WALLS); return {t: 'bld', x0, x1, z0, z1, face, base: top, h: o.h ? o.h : srnd(4.2, 7.2), col: w[0], shut: w[1], sign: w[2], shop: pick(SHOPS), door: srnd(0, 1) > 0.5 ? 'l' : 'r', goods: pick(GOODS), chim: srnd(0, 1) > 0.6}; }
const inGap = (gaps, a, b) => (gaps || []).some(([g0, g1]) => Math.max(a, b) > Math.min(g0, g1) && Math.min(a, b) < Math.max(g0, g1));
function stZ(L, cx, zA, zB, o = {}) { // zA near (bigger), zB far
  const top = o.top || 0, mid = (zA + zB) / 2, len = zA - zB;
  L.islands.push({x: cx, z: mid, w: 3.2, d: len, top, kind: 'road', ax: 'z'}, {x: cx - 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'}, {x: cx + 2.5, z: mid, w: 1.8, d: len, top: top + 0.22, kind: 'walk'});
  for (const side of [-1, 1]) {
    if (o['no' + (side < 0 ? 'L' : 'R')]) continue;
    let z = zA; while (z > zB + 0.5) { const l = Math.min(z - zB, srnd(3.2, 4.6)); if (!inGap(o['gap' + (side < 0 ? 'L' : 'R')], z, z - l)) L.props.push(lot(o, side < 0 ? cx - 5.6 : cx + 3.4, side < 0 ? cx - 3.4 : cx + 5.6, z - l, z, side < 0 ? '+x' : '-x', top + 0.22)); z -= l; }
  }
  if (o.end) L.props.push(lot(o, cx - 5.6, cx + 5.6, zB - 2.4, zB, '+z', top + 0.22));
  if (o.lamps !== false) for (let z = zA - 3; z > zB + 1; z -= 8) L.props.push({t: 'lamp', x: cx + ((Math.round(z) & 8) ? -2.9 : 2.9), z});
}
function stX(L, cz, xA, xB, o = {}) { // xA start, xB end (xB > xA)
  const top = o.top || 0, mid = (xA + xB) / 2, len = xB - xA;
  L.islands.push({x: mid, z: cz, w: len, d: 3.2, top, kind: 'road', ax: 'x'}, {x: mid, z: cz + 2.5, w: len, d: 1.8, top: top + 0.22, kind: 'walk'}, {x: mid, z: cz - 2.5, w: len, d: 1.8, top: top + 0.22, kind: 'walk'});
  for (const side of [-1, 1]) {
    if (o['no' + (side < 0 ? 'F' : 'N')]) continue;
    let x = xA; while (x < xB - 0.5) { const l = Math.min(xB - x, srnd(3.2, 4.6)); if (!inGap(o['gap' + (side < 0 ? 'F' : 'N')], x, x + l)) L.props.push(lot(o, x, x + l, side < 0 ? cz - 5.6 : cz + 3.4, side < 0 ? cz - 3.4 : cz + 5.6, side < 0 ? '+z' : '-z', top + 0.22)); x += l; }
  }
  if (o.end) L.props.push(lot(o, xB, xB + 2.4, cz - 5.6, cz + 5.6, '-x', top + 0.22));
  if (o.lamps !== false) for (let x = xA + 3; x < xB - 1; x += 8) L.props.push({t: 'lamp', x, z: cz + ((Math.round(x) & 8) ? -2.9 : 2.9)});
}
function plaza(L, x, z, w, d, top) { L.islands.push({x, z, w, d, top, kind: 'walk'}); }
function mkLevel(i, def) { seed = 101 + i * 13; const L = {islands: [], props: [], actors: [], feathers: [], wind: 0, ...def}; def.build(L); return L; }
const walker = (x, z, x1, z1, o = {}) => ({t: 'person', x, z, path: [x, z, x1, z1], sp: o.sp || 0.85, ...o});
const LEVELS = [
  mkLevel(0, {name: 'İlk Atış', tut: 1, par: 2, start: [0, 2], bucket: [0.6, -19], route: [[0, 2], [0.6, -19]],
    build(L) { stZ(L, 0, 5, -22, {end: 1});
      L.props.push({t: 'bench', x: 2.6, z: -6}, {t: 'tree', x: -2.6, z: -9}, {t: 'bin', x: 2.8, z: -14});
      L.actors.push(walker(-2.4, -2, -2.4, -16, {sp: 0.7, col: 0xe22511}), {t: 'cat', x: 2.5, z: -10.5, sit: 1, face: -1.2}, {t: 'pigeons', x: -0.8, z: -8, n: 4});
      L.feathers.push([0, 3.2, -6], [0.4, 3.0, -13]); }}),
  mkLevel(1, {name: 'Süzül', tut: 2, par: 3, start: [0, 2], bucket: [0, -26.5], route: [[0, 2], [0, -26.5]],
    build(L) { stZ(L, 0, 5, -9, {}); plaza(L, 0, -16, 5, 3.6, 0.22); stZ(L, 0, -23, -30, {end: 1});
      L.props.push({t: 'plant', x: -2.0, z: -14.9}, {t: 'plant', x: 2.0, z: -17.1}, {t: 'bench', x: 2.6, z: -4});
      L.actors.push(walker(2.4, 0, 2.4, -8, {sp: 0.6, col: 0x1f6fd1, hat: 0xffc20e}), {t: 'cat', x: 1.6, z: -16.8, sit: 1}, {t: 'kid', x: -2.4, z: -24, path: [-2.4, -24, -2.4, -29], sp: 0.7});
      L.feathers.push([0, 3.5, -12.5], [0, 3.0, -20]); }}),
  mkLevel(2, {name: 'Uzun Cadde', par: 3, start: [0, 3], bucket: [-0.8, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -47, {end: 1});
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -9, h: 3.6}, {t: 'car', x: 1.1, z: -16, col: 0x1f6fd1, ax: 'z'}, {t: 'tree', x: -2.6, z: -21}, {t: 'line', x0: -3.4, x1: 3.4, z: -28, h: 3.0},
        {t: 'car', x: -1.1, z: -33, col: 0xffc20e, ax: 'z'}, {t: 'kiosk', x: 1.0, z: -39.5}, {t: 'zebra', x: 0, z: -24, ax: 'z'}, {t: 'bench', x: -2.6, z: -12});
      L.actors.push(walker(-2.4, -2, -2.4, -30, {col: 0x2fa84f}), walker(2.4, -36, 2.4, -6, {sp: 0.9, skirt: 1, long: 1, col: 0x7a4fb0, bag: 0xffc20e}), walker(-1.6, -24, 1.6, -24, {sp: 0.8, col: 0xff7a1a}),
        {t: 'cat', x: 1.1, z: -16, y: 1.5, sit: 1}, {t: 'dog', x: 2.4, z: -20, path: [2.4, -20, 2.4, -42], sp: 1.2}, {t: 'pigeons', x: 0, z: -42, n: 5}, {t: 'kid', x: -2.4, z: -38, path: [-2.4, -38, -2.4, -45], sp: 0.8});
      L.feathers.push([0, 4.5, -9], [-1.1, 3.2, -33], [0.6, 3.6, -24]); }}),
  mkLevel(3, {name: 'Köşe Başı', par: 3, start: [0, 3], bucket: [22, -26], route: [[0, 3], [0, -24.5], [22, -26]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 26, {end: 1, gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22));
      L.props.push({t: 'car', x: -1.1, z: -10, col: 0xe22511, ax: 'z'}, {t: 'tree', x: 2.6, z: -17}, {t: 'zebra', x: 9, z: -24.4, ax: 'x'}, {t: 'kiosk', x: 15, z: -27.3}, {t: 'car', x: 18, z: -23.3, col: 0x2fa84f, ax: 'x'}, {t: 'bench', x: 6, z: -21.6});
      L.actors.push(walker(2.4, -2, 2.4, -13, {col: 0xe22511}), {t: 'cat', x: -2.4, z: -17, path: [-2.4, -6, -2.4, -20], sp: 0.7, col: 0xf0912e}, walker(4, -21.8, 20, -21.8, {sp: 0.9, col: 0x1f6fd1, hat: 0x022753}),
        walker(9, -26.9, 9, -21.9, {sp: 0.8, col: 0xffc20e, long: 1, skirt: 1}), {t: 'pigeons', x: 12, z: -26.5, n: 5}, {t: 'dog', x: 20, z: -27, path: [12, -27, 24, -27], sp: 1.3});
      L.feathers.push([0, 3.6, -12], [2.5, 3.4, -24.4], [12, 3.2, -24.4]); }}),
  mkLevel(4, {name: 'Merdivenli Yokuş', par: 3, start: [0, 3], bucket: [0, -38], route: [[0, 3], [0, -38]],
    build(L) { stZ(L, 0, 6, -6, {top: 0}); plaza(L, 0, -9, 6.8, 6, 1.0); plaza(L, 0, -16.5, 6.8, 9, 2.0); plaza(L, 0, -25, 6.8, 8, 3.0); stZ(L, 0, -29, -42, {top: 3.8, end: 1});
      for (const [z0, z1, t] of [[-6, -12, 1.22], [-12, -21, 2.22], [-21, -29, 3.22]]) { L.props.push(lot({h: 4 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 4 + t}, 3.4, 5.6, z1, z0, '-x', 0.22)); }
      L.props.push({t: 'tree', x: -2.4, z: -16}, {t: 'tree', x: 2.4, z: -25}, {t: 'bench', x: 0, z: -18}, {t: 'kiosk', x: 1.2, z: -33});
      L.actors.push({t: 'cat', x: 0.5, z: -9, sit: 1, col: 0x2a2a2e}, {t: 'cat', x: -2, z: -16, path: [-2, -13, -2, -20], sp: 0.6}, walker(2.0, -22, -2, -27, {sp: 0.6, col: 0x2fa84f}), {t: 'pigeons', x: -1, z: -25, n: 5},
        walker(-2.4, -31, -2.4, -40, {col: 0xe22511, hat: 0xf4eee2}), {t: 'person', x: 0, z: -18, sit: 1, face: 0, col: 0x3a3f4a});
      L.feathers.push([0, 4.4, -9], [0, 5.6, -21], [-1, 7.2, -30]); }}),
  mkLevel(5, {name: 'Köprü', par: 4, start: [0, 3], bucket: [0.5, -40], route: [[0, 3], [0, -40]],
    build(L) { stZ(L, 0, 6, -14, {}); L.islands.push({x: 0, z: -19.5, w: 1.6, d: 11, top: 0.22, kind: 'bridge'}); stZ(L, 0, -25, -44, {end: 1});
      L.props.push({t: 'car', x: 1.1, z: -6, col: 0x7a4fb0, ax: 'z'}, {t: 'tree', x: -2.6, z: -10}, {t: 'kiosk', x: -1, z: -30}, {t: 'line', x0: -3.4, x1: 3.4, z: -35, h: 3.2});
      L.actors.push(walker(2.4, 0, 2.4, -12, {col: 0xff8fb8, long: 1}), {t: 'pigeons', x: 0, z: -19.5, n: 3}, {t: 'cat', x: -2.4, z: -28, sit: 1},
        {t: 'dog', x: 2.4, z: -27, path: [2.4, -27, 2.4, -42], sp: 1.1}, {t: 'pigeons', x: 0.5, z: -37, n: 4});
      L.feathers.push([0, 3.6, -19.5], [0, 2.4, -17], [0, 2.4, -22]); }}),
  mkLevel(6, {name: 'Rüzgârlı Sahil', par: 3, wind: 2.4, start: [0, 3], bucket: [-0.5, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -48, {noR: 1, end: 1});
      L.props.push({t: 'rail', x: 3.4, z0: 6, z1: -48}, {t: 'tree', x: -2.6, z: -8}, {t: 'kiosk', x: -1.2, z: -20}, {t: 'car', x: 1.1, z: -29, col: 0xe22511, ax: 'z'}, {t: 'bench', x: 2.6, z: -14}, {t: 'bench', x: 2.6, z: -36}, {t: 'sock', x: 3.0, z: 2});
      L.actors.push(walker(2.4, -2, 2.4, -40, {sp: 0.7, col: 0x1f6fd1, hat: 0xf4eee2}), {t: 'pigeons', x: 0, z: -12, n: 6}, {t: 'cat', x: -2.4, z: -26, sit: 1, col: 0xf4f0e8}, walker(-2.4, -30, -2.4, -46, {col: 0xffc20e}), {t: 'kid', x: 0, z: -38, path: [-1.5, -38, 1.5, -38], sp: 0.9});
      L.feathers.push([1.5, 4, -12], [2.2, 3.6, -26], [0, 4, -36]); }}),
  mkLevel(7, {name: 'Pazar Yeri', par: 3, start: [0, 3], bucket: [-24, -34], route: [[0, 3], [0, -33], [-24, -34]],
    build(L) { stZ(L, 0, 6, -30, {gapL: [[-23, -30]]}); stX(L, -33.4, -28, 3.4, {gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -30.4, -28, -39, -27.8, '+x', 0.22), lot({h: 6}, 3.4, 5.6, -39, -30, '-x', 0.22));
      for (let z = -4; z > -26; z -= 5.5) L.props.push({t: 'stall', x: (z % 11 === 0 ? 1 : -1) * 1.0, z, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a'])});
      for (let x = -6; x > -24; x -= 6) L.props.push({t: 'stall', x, z: -33.4 + ((x / 6) % 2 ? 1 : -1), col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ffc20e']), ax: 'x'});
      L.actors.push(walker(2.4, -2, 2.4, -26, {col: 0xe22511, bag: 0x2fa84f}), walker(-2.4, -20, -2.4, -6, {sp: 0.7, long: 1, skirt: 1, col: 0xff8fb8, bag: 0xffc20e}), {t: 'cat', x: 0, z: -12, path: [0, -9, 0, -24], sp: 0.8, col: 0xf0912e},
        walker(-1.5, -14.5, 1.5, -14.5, {col: 0x2fa84f, hat: 0xe22511}), {t: 'dog', x: -10, z: -31, path: [-22, -31, -4, -31], sp: 1.3}, {t: 'pigeons', x: -12, z: -35.8, n: 6}, walker(-18, -35.8, -4, -35.8, {sp: 0.8, col: 0x7a4fb0}),
        {t: 'kid', x: 0, z: -28, path: [-1.5, -28, 1.5, -28], sp: 1.1}, {t: 'cat', x: -20, z: -31, sit: 1, col: 0x2a2a2e});
      L.feathers.push([0, 4, -9.5], [0, 4, -20.5], [-15, 3.6, -33.4]); }}),

  // ---- 9-10: still free ----
  mkLevel(8, {name: 'Zikzak', par: 4, start: [0, 3], bucket: [18, -47], route: [[0, 3], [0, -24.4], [18, -24.4], [18, -47]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 21.4, {gapN: [[-3.4, 3.4]], gapF: [[14.6, 21.4]]}); stZ(L, 18, -27.8, -51, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22), lot({h: 6}, 21.4, 23.6, -27.8, -18.8, '-x', 0.22));
      L.props.push({t: 'car', x: 1.1, z: -9, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -15, h: 3.4}, {t: 'car', x: 9, z: -23.3, col: 0xe22511, ax: 'x'}, {t: 'kiosk', x: 4.5, z: -27.2},
        {t: 'line', x0: 14.6, x1: 21.4, z: -35, h: 3.2}, {t: 'car', x: 16.9, z: -41, col: 0x1f6fd1, ax: 'z'}, {t: 'tree', x: 20.5, z: -31});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0xffc20e}), {t: 'cat', x: -2.4, z: -12, sit: 1}, walker(4, -21.8, 14, -21.8, {sp: 1.0, col: 0x7a4fb0}), {t: 'pigeons', x: 12, z: -25, n: 5},
        {t: 'dog', x: 15.6, z: -34, path: [15.6, -30, 15.6, -46], sp: 1.2}, walker(20.4, -45, 20.4, -30, {sp: 0.8, col: 0xe22511, hat: 0xffc20e}));
      L.feathers.push([0, 4.6, -15], [9, 3.6, -24.4], [18, 4.4, -35]); }}),
  mkLevel(9, {name: 'Teras Katı', par: 4, start: [0, 3], bucket: [0, -36], route: [[0, 3], [0, -36]],
    build(L) { stZ(L, 0, 6, -8, {}); plaza(L, 0, -11, 6.8, 6, 1.2); plaza(L, 0, -18.5, 4.2, 9, 2.4); plaza(L, 0, -30.5, 5.5, 11, 3.6);
      for (const [z0, z1, t] of [[-8, -14, 1.42], [-14, -23, 2.62], [-25, -36, 3.82]]) L.props.push(lot({h: 3.2 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.2 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 6.5}, -5.6, 5.6, -38.4, -36, '+z', 0.22), {t: 'plant', x: -1.6, z: -18}, {t: 'plant', x: 1.6, z: -21}, {t: 'bench', x: 1.6, z: -29}, {t: 'tree', x: -1.8, z: -33});
      L.actors.push(walker(2.4, 0, 2.4, -7, {col: 0x1f6fd1}), {t: 'cat', x: 0.8, z: -12, sit: 1, col: 0x8a8a92}, {t: 'pigeons', x: 0, z: -16, n: 4}, walker(-1.8, -27, 1.8, -27, {sp: 0.7, col: 0xff8fb8, long: 1, skirt: 1}), {t: 'cat', x: 1.5, z: -34, sit: 1});
      L.feathers.push([0, 4.6, -11], [0, 5.6, -23.6], [0, 6.8, -30]); }}),
  // ---- 11-20: Sokak 2 paketi ----
  mkLevel(10, {name: 'Rüzgârlı Köprü', par: 3, wind: -2.0, start: [0, 3], bucket: [0, -48], route: [[0, 3], [0, -48]],
    build(L) { stZ(L, 0, 6, -12, {}); L.islands.push({x: 0, z: -17, w: 1.8, d: 10, top: 0.22, kind: 'bridge'}); plaza(L, 0, -24.5, 5, 5, 0.22); L.islands.push({x: 0, z: -31, w: 1.6, d: 8, top: 0.22, kind: 'bridge'}); stZ(L, 0, -35, -52, {end: 1});
      L.props.push({t: 'sock', x: -2.0, z: 2}, {t: 'plant', x: -1.8, z: -23}, {t: 'kiosk', x: 1.0, z: -42}, {t: 'car', x: -1.1, z: -6, col: 0xffc20e, ax: 'z'});
      L.actors.push({t: 'pigeons', x: 0, z: -17, n: 3}, walker(-1.5, -25, 1.5, -25, {sp: 0.6, col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -31, n: 3}, {t: 'dog', x: -2.4, z: -38, path: [-2.4, -38, -2.4, -50], sp: 1.1}, {t: 'cat', x: 2.4, z: -45, sit: 1});
      L.feathers.push([0, 3.4, -17], [0, 3.4, -31], [-1, 3.6, -40]); }}),
  mkLevel(11, {name: 'Çifte Köşe', par: 4, start: [0, 3], bucket: [-18, -47], route: [[0, 3], [0, -24.4], [-18, -24.4], [-18, -47]],
    build(L) { stZ(L, 0, 6, -21, {gapL: [[-18.8, -21]]}); stX(L, -24.4, -21.4, 3.4, {gapN: [[-3.4, 3.4]], gapF: [[-21.4, -14.6]]}); stZ(L, -18, -27.8, -51, {end: 1});
      L.props.push(lot({h: 6}, 3.4, 5.6, -27.8, -21, '-x', 0.22), lot({h: 6}, -23.6, -21.4, -27.8, -18.8, '+x', 0.22));
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -8, h: 3.0}, {t: 'car', x: -1.1, z: -14, col: 0xe22511, ax: 'z'}, {t: 'stall', x: -8, z: -25.4, col: '#1f6fd1', ax: 'x'}, {t: 'car', x: -13, z: -23.3, col: 0x2fa84f, ax: 'x'},
        {t: 'line', x0: -21.4, x1: -14.6, z: -33, h: 3.4}, {t: 'kiosk', x: -17, z: -39}, {t: 'line', x0: -21.4, x1: -14.6, z: -43, h: 3.0});
      L.actors.push(walker(-2.4, -2, -2.4, -18, {col: 0x1f6fd1, hat: 0xe22511}), {t: 'cat', x: 2.4, z: -11, sit: 1, col: 0xf0912e}, walker(-4, -26.9, -14, -26.9, {sp: 0.9, col: 0xffc20e}), {t: 'kid', x: -10, z: -22, path: [-12, -22, -6, -22], sp: 1.0},
        {t: 'dog', x: -15.6, z: -36, path: [-15.6, -30, -15.6, -48], sp: 1.3}, {t: 'pigeons', x: -18, z: -38, n: 5});
      L.feathers.push([0, 4.2, -8], [-8, 4.8, -25.4], [-18, 4.6, -43]); }}),
  mkLevel(12, {name: 'Dar Geçit', par: 3, start: [0, 3], bucket: [0.4, -58], route: [[0, 3], [0, -58]],
    build(L) { stZ(L, 0, 6, -62, {end: 1});
      for (const [z, h] of [[-8, 3.0], [-17, 3.6], [-27, 2.8], [-37, 3.4], [-47, 3.0]]) L.props.push({t: 'line', x0: -3.4, x1: 3.4, z, h});
      L.props.push({t: 'car', x: 1.1, z: -12, col: 0x1f6fd1, ax: 'z'}, {t: 'car', x: -1.1, z: -22, col: 0xe22511, ax: 'z'}, {t: 'kiosk', x: 1.0, z: -32}, {t: 'car', x: -1.1, z: -42, col: 0x2fa84f, ax: 'z'},
        {t: 'car', x: 1.1, z: -52, col: 0xffc20e, ax: 'z'}, {t: 'tree', x: -2.6, z: -15}, {t: 'tree', x: 2.6, z: -35}, {t: 'bench', x: -2.6, z: -50});
      L.actors.push(walker(-2.4, -2, -2.4, -30, {col: 0xff7a1a}), walker(2.4, -40, 2.4, -10, {sp: 0.9, long: 1, skirt: 1, col: 0x7a4fb0}), {t: 'cat', x: -2.4, z: -24, sit: 1}, {t: 'dog', x: 2.4, z: -46, path: [2.4, -44, 2.4, -60], sp: 1.2},
        walker(-1.6, -45, 1.6, -45, {sp: 0.8, col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -55, n: 5}, {t: 'kid', x: -2.4, z: -56, path: [-2.4, -50, -2.4, -60], sp: 0.8});
      L.feathers.push([0, 4.4, -17], [0, 3.8, -27], [0, 4.2, -47]); }}),
  mkLevel(13, {name: 'Çatı Katı', par: 3, start: [0, 2], bucket: [0, -33], route: [[0, 2], [0, -33]],
    build(L) { const T = 4.0;
      for (const [z, d, w] of [[0, 8, 6], [-10.5, 5, 4.4], [-19.5, 5, 4.4], [-30, 8, 6]]) { plaza(L, 0, z, w, d, T); L.props.push(lot({h: T + 3.5 - 0.02}, -w / 2, w / 2, z - d / 2, z + d / 2, '+z', -3.5)); }
      L.islands.push({x: 0, z: -15, w: 30, d: 60, top: -3.5, kind: 'walk'});
      L.props.push({t: 'plant', x: -2, z: -1}, {t: 'sock', x: 2.4, z: 2}, {t: 'plant', x: 1.5, z: -20.5}, {t: 'bench', x: -2, z: -29});
      L.actors.push({t: 'cat', x: 1.3, z: -10, sit: 1, y: T}, {t: 'pigeons', x: 0, z: -19.5, n: 4}, {t: 'cat', x: -1.8, z: -32, sit: 1, y: T, col: 0x2a2a2e});
      L.feathers.push([0, 7, -5.5], [0, 7, -15], [0, 6.6, -25]); }}),
  mkLevel(14, {name: 'Ters Rüzgâr', par: 3, wind: 2.8, start: [0, 3], bucket: [-22, -26], route: [[0, 3], [0, -24.5], [-22, -26]],
    build(L) { stZ(L, 0, 6, -21, {gapL: [[-18.8, -21]]}); stX(L, -24.4, -26, 3.4, {end: 0, gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, 3.4, 5.6, -27.8, -21, '-x', 0.22), lot({h: 6}, -28.4, -26, -30, -18.8, '+x', 0.22));
      L.props.push({t: 'sock', x: 2.8, z: 1}, {t: 'line', x0: -3.4, x1: 3.4, z: -10, h: 3.4}, {t: 'car', x: 1.1, z: -16, col: 0x7a4fb0, ax: 'z'}, {t: 'kiosk', x: -10, z: -27.2}, {t: 'car', x: -16, z: -25.5, col: 0xe22511, ax: 'x'});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0x2fa84f}), {t: 'pigeons', x: 0, z: -20, n: 6}, walker(-4, -21.8, -22, -21.8, {sp: 1.0, col: 0xff8fb8}), {t: 'cat', x: -20, z: -27, sit: 1});
      L.feathers.push([1, 4.4, -10], [-6, 4.2, -24.4], [-16, 3.8, -24.4]); }}),
  mkLevel(15, {name: 'Pazar Labirenti', par: 3, start: [0, 3], bucket: [16, -50], route: [[0, 3], [0, -24.4], [16, -24.4], [16, -50]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 19.4, {gapN: [[-3.4, 3.4]], gapF: [[12.6, 19.4]]}); stZ(L, 16, -27.8, -54, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22), lot({h: 6}, 19.4, 21.6, -27.8, -18.8, '-x', 0.22));
      for (let z = -4; z > -20; z -= 5) L.props.push({t: 'stall', x: (Math.round(z / 5) % 2 ? 1 : -1) * 0.9, z, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a'])});
      for (let x = 4; x < 12; x += 4.5) L.props.push({t: 'stall', x, z: -24.4 + (x > 6 ? 0.9 : -0.9), col: pick(['#e22511', '#ffc20e', '#2fa84f']), ax: 'x'});
      for (let z = -31; z > -47; z -= 5) L.props.push({t: 'stall', x: 16 + (Math.round(z / 5) % 2 ? 0.9 : -0.9), z, col: pick(['#1f6fd1', '#e22511', '#ff7a1a'])});
      L.actors.push(walker(2.4, -2, 2.4, -18, {col: 0xe22511, bag: 0xffc20e}), walker(-2.4, -18, -2.4, -4, {sp: 0.7, col: 0x1f6fd1, bag: 0x2fa84f}), {t: 'cat', x: 0, z: -10, path: [0, -7, 0, -17], sp: 0.8},
        walker(4, -26.9, 12, -26.9, {sp: 0.8, col: 0xff8fb8, long: 1, skirt: 1}), {t: 'dog', x: 18.4, z: -36, path: [18.4, -30, 18.4, -50], sp: 1.3}, {t: 'pigeons', x: 16, z: -48, n: 5}, walker(13.6, -48, 13.6, -32, {col: 0x2fa84f}));
      L.feathers.push([0, 4.4, -12], [8, 4.4, -24.4], [16, 4.4, -38]); }}),
  mkLevel(16, {name: 'Yokuş Aşağı', par: 3, start: [0, -2], bucket: [-0.5, -44], route: [[0, -2], [0, -44]],
    build(L) { plaza(L, 0, -2, 6.8, 8, 4.0); plaza(L, 0, -10.5, 6.8, 9, 2.8); plaza(L, 0, -19.5, 6.8, 9, 1.4); stZ(L, 0, -24, -48, {end: 1});
      for (const [z0, z1, t] of [[2, -6, 4.2], [-6, -15, 3.0], [-15, -24, 1.6]]) L.props.push(lot({h: 3.4 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.4 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 8}, -5.6, 5.6, 2, 4.4, '-z', 0.22), {t: 'tree', x: 2.4, z: -11}, {t: 'plant', x: -2.4, z: -20}, {t: 'line', x0: -3.4, x1: 3.4, z: -30, h: 3.2}, {t: 'car', x: 1.1, z: -36, col: 0xe22511, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -40, h: 2.8});
      L.actors.push({t: 'cat', x: -2, z: -3, sit: 1, y: 4.0}, walker(-2, -9, 2, -12, {sp: 0.6, col: 0x7a4fb0}), {t: 'pigeons', x: 0, z: -19, n: 5}, walker(2.4, -26, 2.4, -46, {col: 0xffc20e}), {t: 'kid', x: -2.4, z: -38, path: [-2.4, -32, -2.4, -46], sp: 0.9});
      L.feathers.push([0, 5.6, -10], [0, 4.2, -20], [0, 3.8, -35]); }}),
  mkLevel(17, {name: 'Kedi Mahallesi', par: 4, start: [0, 3], bucket: [0, -52], route: [[0, 3], [0, -52]],
    build(L) { stZ(L, 0, 6, -14, {}); L.islands.push({x: 0, z: -19, w: 1.6, d: 10, top: 0.22, kind: 'bridge'}); stZ(L, 0, -24, -34, {}); L.islands.push({x: 0, z: -38.5, w: 1.4, d: 9, top: 0.22, kind: 'bridge'}); stZ(L, 0, -43, -56, {end: 1});
      L.props.push({t: 'car', x: 1.1, z: -6, col: 0x1f6fd1, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -29, h: 3.2}, {t: 'kiosk', x: -1, z: -48}, {t: 'tree', x: 2.6, z: -27});
      L.actors.push({t: 'cat', x: -2.4, z: -4, sit: 1, col: 0xf0912e}, {t: 'cat', x: 2.4, z: -10, path: [2.4, -2, 2.4, -13], sp: 0.7}, {t: 'cat', x: 0, z: -19, sit: 1, col: 0x2a2a2e}, {t: 'cat', x: -1.5, z: -31, path: [-1.5, -26, 1.5, -32], sp: 0.8, col: 0xf4f0e8},
        {t: 'dog', x: 2.4, z: -45, path: [2.4, -44, 2.4, -55], sp: 1.4}, {t: 'cat', x: -2.4, z: -50, sit: 1}, walker(-2.4, -26, -2.4, -33, {col: 0xe22511}));
      L.feathers.push([0, 3.0, -19], [0, 4.0, -29], [0, 3.0, -38.5]); }}),
  mkLevel(18, {name: 'Uzun Yol', par: 6, wind: -1.4, start: [0, 3], bucket: [20, -60], route: [[0, 3], [0, -30.4], [20, -30.4], [20, -60]],
    build(L) { stZ(L, 0, 6, -27, {gapR: [[-24.8, -27]]}); stX(L, -30.4, -3.4, 23.4, {gapN: [[-3.4, 3.4]], gapF: [[16.6, 23.4]]}); stZ(L, 20, -33.8, -64, {end: 1});
      L.props.push(lot({h: 6}, -5.6, -3.4, -33.8, -27, '+x', 0.22), lot({h: 6}, 23.4, 25.6, -33.8, -24.8, '-x', 0.22));
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -9, h: 3.4}, {t: 'car', x: -1.1, z: -15, col: 0xffc20e, ax: 'z'}, {t: 'line', x0: -3.4, x1: 3.4, z: -21, h: 3.0}, {t: 'car', x: 8, z: -29.3, col: 0xe22511, ax: 'x'},
        {t: 'kiosk', x: 13, z: -33.2}, {t: 'line', x0: 16.6, x1: 23.4, z: -42, h: 3.4}, {t: 'car', x: 21.1, z: -48, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: 16.6, x1: 23.4, z: -54, h: 3.0});
      L.actors.push(walker(2.4, -2, 2.4, -24, {col: 0x1f6fd1}), {t: 'cat', x: -2.4, z: -12, sit: 1}, walker(4, -27.8, 18, -27.8, {col: 0xff7a1a}), {t: 'pigeons', x: 10, z: -31, n: 5},
        {t: 'dog', x: 17.6, z: -40, path: [17.6, -36, 17.6, -60], sp: 1.3}, walker(22.4, -58, 22.4, -38, {col: 0x7a4fb0, long: 1, skirt: 1}), {t: 'kid', x: 20, z: -51, path: [18.5, -51, 21.5, -51], sp: 1.0});
      L.feathers.push([0, 4.6, -21], [10, 4.0, -30.4], [20, 4.6, -54]); }}),
  mkLevel(19, {name: 'Büyük Final', par: 6, start: [0, 3], bucket: [18, -64], route: [[0, 3], [0, -40.4], [18, -40.4], [18, -64]],
    build(L) { stZ(L, 0, 6, -8, {}); plaza(L, 0, -11, 6.8, 6, 1.2); plaza(L, 0, -18, 6.8, 8, 2.4); L.islands.push({x: 0, z: -26.5, w: 1.6, d: 9, top: 2.4, kind: 'bridge'}); plaza(L, 0, -33.5, 6.8, 5, 2.4);
      stX(L, -40.4, -3.4, 21.4, {top: 2.2, gapN: [[-3.4, 3.4]], gapF: [[14.6, 21.4]]}); stZ(L, 18, -43.8, -68, {top: 2.2, end: 1});
      for (const [z0, z1, t] of [[-8, -14, 1.42], [-14, -22, 2.62]]) L.props.push(lot({h: 3.2 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 3.2 + t}, 3.4, 5.6, z1, z0, '-x', 0.22));
      L.props.push(lot({h: 9}, -5.6, -3.4, -43.8, -31, '+x', 0.22), lot({h: 9}, 3.4, 5.6, -36, -31, '-x', 0.22), lot({h: 9}, 21.4, 23.6, -43.8, -34.8, '-x', 0.22));
      L.props.push({t: 'car', x: 1.1, z: -4, col: 0xe22511, ax: 'z'}, {t: 'plant', x: -2, z: -17}, {t: 'plant', x: 2, z: -20}, {t: 'stall', x: 8, z: -41.3, col: '#ffc20e', ax: 'x'}, {t: 'car', x: 13, z: -39.3, col: 0x1f6fd1, ax: 'x'},
        {t: 'line', x0: 14.6, x1: 21.4, z: -50, h: 3.4}, {t: 'car', x: 16.9, z: -56, col: 0x2fa84f, ax: 'z'}, {t: 'line', x0: 14.6, x1: 21.4, z: -61, h: 3.0});
      L.actors.push(walker(2.4, 0, 2.4, -7, {col: 0xffc20e}), {t: 'cat', x: 1, z: -12, sit: 1}, {t: 'pigeons', x: 0, z: -26.5, n: 3}, walker(4, -37.8, 13, -37.8, {col: 0x7a4fb0}), {t: 'kid', x: 6, z: -43, path: [4, -43, 12, -43], sp: 1.0},
        {t: 'dog', x: 20.4, z: -50, path: [20.4, -46, 20.4, -66], sp: 1.3}, walker(15.6, -64, 15.6, -46, {col: 0xe22511, hat: 0x022753}), {t: 'pigeons', x: 18, z: -66, n: 4});
      L.feathers.push([0, 5.6, -26.5], [9, 5.6, -40.4], [18, 6.2, -50]); }}),
];
