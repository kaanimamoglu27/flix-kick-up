// ================= LEVELS (golf style: several shots, par) =================
// Streets are built from pieces. stZ = a street running along z (forward = -z), stX = along x.
// Each adds road + two pavements (islands) and a row of shop buildings on both sides facing the street.
const SHOPS = ['FIRIN', 'BAKKAL', 'BERBER', 'MANAV', 'ECZANE', 'ÇAY OCAĞI', 'KASAP', 'TERZİ', 'KIRTASİYE', 'SİMİTÇİ', 'LOKANTA', 'ÇİÇEKÇİ', 'KUAFÖR', 'TUHAFİYE', 'NALBUR', 'BÖREKÇİ'];
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
  mkLevel(2, {name: 'Uzun Cadde', par: 4, start: [0, 3], bucket: [-0.8, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -47, {end: 1});
      L.props.push({t: 'line', x0: -3.4, x1: 3.4, z: -9, h: 3.6}, {t: 'car', x: 1.1, z: -16, col: 0x1f6fd1, ax: 'z'}, {t: 'tree', x: -2.6, z: -21}, {t: 'line', x0: -3.4, x1: 3.4, z: -28, h: 3.0},
        {t: 'car', x: -1.1, z: -33, col: 0xffc20e, ax: 'z'}, {t: 'kiosk', x: 1.0, z: -39.5}, {t: 'zebra', x: 0, z: -24, ax: 'z'}, {t: 'bench', x: -2.6, z: -12});
      L.actors.push(walker(-2.4, -2, -2.4, -30, {col: 0x2fa84f}), walker(2.4, -36, 2.4, -6, {sp: 0.9, skirt: 1, long: 1, col: 0x7a4fb0, bag: 0xffc20e}), walker(-1.6, -24, 1.6, -24, {sp: 0.8, col: 0xff7a1a}),
        {t: 'cat', x: 1.1, z: -16, y: 1.5, sit: 1}, {t: 'dog', x: 2.4, z: -20, path: [2.4, -20, 2.4, -42], sp: 1.2}, {t: 'pigeons', x: 0, z: -42, n: 5}, {t: 'kid', x: -2.4, z: -38, path: [-2.4, -38, -2.4, -45], sp: 0.8});
      L.feathers.push([0, 4.5, -9], [-1.1, 3.2, -33], [0.6, 3.6, -24]); }}),
  mkLevel(3, {name: 'Köşe Başı', par: 4, start: [0, 3], bucket: [22, -26], route: [[0, 3], [0, -24.5], [22, -26]],
    build(L) { stZ(L, 0, 6, -21, {gapR: [[-18.8, -21]]}); stX(L, -24.4, -3.4, 26, {end: 1, gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -5.6, -3.4, -27.8, -21, '+x', 0.22));
      L.props.push({t: 'car', x: -1.1, z: -10, col: 0xe22511, ax: 'z'}, {t: 'tree', x: 2.6, z: -17}, {t: 'zebra', x: 9, z: -24.4, ax: 'x'}, {t: 'kiosk', x: 15, z: -27.3}, {t: 'car', x: 18, z: -23.3, col: 0x2fa84f, ax: 'x'}, {t: 'bench', x: 6, z: -21.6});
      L.actors.push(walker(2.4, -2, 2.4, -13, {col: 0xe22511}), {t: 'cat', x: -2.4, z: -17, path: [-2.4, -6, -2.4, -20], sp: 0.7, col: 0xf0912e}, walker(4, -21.8, 20, -21.8, {sp: 0.9, col: 0x1f6fd1, hat: 0x022753}),
        walker(9, -26.9, 9, -21.9, {sp: 0.8, col: 0xffc20e, long: 1, skirt: 1}), {t: 'pigeons', x: 12, z: -26.5, n: 5}, {t: 'dog', x: 20, z: -27, path: [12, -27, 24, -27], sp: 1.3});
      L.feathers.push([0, 3.6, -12], [2.5, 3.4, -24.4], [12, 3.2, -24.4]); }}),
  mkLevel(4, {name: 'Merdivenli Yokuş', par: 4, start: [0, 3], bucket: [0, -38], route: [[0, 3], [0, -38]],
    build(L) { stZ(L, 0, 6, -6, {top: 0}); plaza(L, 0, -9, 6.8, 6, 1.0); plaza(L, 0, -16.5, 6.8, 9, 2.0); plaza(L, 0, -25, 6.8, 8, 3.0); stZ(L, 0, -29, -42, {top: 3.8, end: 1});
      for (const [z0, z1, t] of [[-6, -12, 1.22], [-12, -21, 2.22], [-21, -29, 3.22]]) { L.props.push(lot({h: 4 + t}, -5.6, -3.4, z1, z0, '+x', 0.22), lot({h: 4 + t}, 3.4, 5.6, z1, z0, '-x', 0.22)); }
      L.props.push({t: 'tree', x: -2.4, z: -16}, {t: 'tree', x: 2.4, z: -25}, {t: 'bench', x: 0, z: -18}, {t: 'kiosk', x: 1.2, z: -33});
      L.actors.push({t: 'cat', x: 0.5, z: -9, sit: 1, col: 0x2a2a2e}, {t: 'cat', x: -2, z: -16, path: [-2, -13, -2, -20], sp: 0.6}, walker(2.0, -22, -2, -27, {sp: 0.6, col: 0x2fa84f}), {t: 'pigeons', x: -1, z: -25, n: 5},
        walker(-2.4, -31, -2.4, -40, {col: 0xe22511, hat: 0xf4eee2}), {t: 'person', x: 0, z: -18, sit: 1, face: 0, col: 0x3a3f4a});
      L.feathers.push([0, 4.4, -9], [0, 5.6, -21], [-1, 7.2, -30]); }}),
  mkLevel(5, {name: 'Köprü', par: 5, start: [0, 3], bucket: [0.5, -40], route: [[0, 3], [0, -40]],
    build(L) { stZ(L, 0, 6, -14, {}); L.islands.push({x: 0, z: -19.5, w: 1.6, d: 11, top: 0.22, kind: 'bridge'}); stZ(L, 0, -25, -44, {end: 1});
      L.props.push({t: 'car', x: 1.1, z: -6, col: 0x7a4fb0, ax: 'z'}, {t: 'tree', x: -2.6, z: -10}, {t: 'kiosk', x: -1, z: -30}, {t: 'line', x0: -3.4, x1: 3.4, z: -35, h: 3.2});
      L.actors.push(walker(2.4, 0, 2.4, -12, {col: 0xff8fb8, long: 1}), {t: 'pigeons', x: 0, z: -19.5, n: 3}, {t: 'cat', x: -2.4, z: -28, sit: 1},
        {t: 'dog', x: 2.4, z: -27, path: [2.4, -27, 2.4, -42], sp: 1.1}, {t: 'pigeons', x: 0.5, z: -37, n: 4});
      L.feathers.push([0, 3.6, -19.5], [0, 2.4, -17], [0, 2.4, -22]); }}),
  mkLevel(6, {name: 'Rüzgârlı Sahil', par: 4, wind: 2.4, start: [0, 3], bucket: [-0.5, -44], route: [[0, 3], [0, -44]],
    build(L) { stZ(L, 0, 6, -48, {noR: 1, end: 1});
      L.props.push({t: 'rail', x: 3.4, z0: 6, z1: -48}, {t: 'tree', x: -2.6, z: -8}, {t: 'kiosk', x: -1.2, z: -20}, {t: 'car', x: 1.1, z: -29, col: 0xe22511, ax: 'z'}, {t: 'bench', x: 2.6, z: -14}, {t: 'bench', x: 2.6, z: -36}, {t: 'sock', x: 3.0, z: 2});
      L.actors.push(walker(2.4, -2, 2.4, -40, {sp: 0.7, col: 0x1f6fd1, hat: 0xf4eee2}), {t: 'pigeons', x: 0, z: -12, n: 6}, {t: 'cat', x: -2.4, z: -26, sit: 1, col: 0xf4f0e8}, walker(-2.4, -30, -2.4, -46, {col: 0xffc20e}), {t: 'kid', x: 0, z: -38, path: [-1.5, -38, 1.5, -38], sp: 0.9});
      L.feathers.push([1.5, 4, -12], [2.2, 3.6, -26], [0, 4, -36]); }}),
  mkLevel(7, {name: 'Pazar Yeri', par: 4, start: [0, 3], bucket: [-24, -34], route: [[0, 3], [0, -33], [-24, -34]],
    build(L) { stZ(L, 0, 6, -30, {gapL: [[-23, -30]]}); stX(L, -33.4, -28, 3.4, {gapN: [[-3.4, 3.4]]}); L.props.push(lot({h: 6}, -30.4, -28, -39, -27.8, '+x', 0.22), lot({h: 6}, 3.4, 5.6, -39, -30, '-x', 0.22));
      for (let z = -4; z > -26; z -= 5.5) L.props.push({t: 'stall', x: (z % 11 === 0 ? 1 : -1) * 1.0, z, col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ff7a1a'])});
      for (let x = -6; x > -24; x -= 6) L.props.push({t: 'stall', x, z: -33.4 + ((x / 6) % 2 ? 1 : -1), col: pick(['#e22511', '#1f6fd1', '#2fa84f', '#ffc20e']), ax: 'x'});
      L.actors.push(walker(2.4, -2, 2.4, -26, {col: 0xe22511, bag: 0x2fa84f}), walker(-2.4, -20, -2.4, -6, {sp: 0.7, long: 1, skirt: 1, col: 0xff8fb8, bag: 0xffc20e}), {t: 'cat', x: 0, z: -12, path: [0, -9, 0, -24], sp: 0.8, col: 0xf0912e},
        walker(-1.5, -14.5, 1.5, -14.5, {col: 0x2fa84f, hat: 0xe22511}), {t: 'dog', x: -10, z: -31, path: [-22, -31, -4, -31], sp: 1.3}, {t: 'pigeons', x: -12, z: -35.8, n: 6}, walker(-18, -35.8, -4, -35.8, {sp: 0.8, col: 0x7a4fb0}),
        {t: 'kid', x: 0, z: -28, path: [-1.5, -28, 1.5, -28], sp: 1.1}, {t: 'cat', x: -20, z: -31, sit: 1, col: 0x2a2a2e});
      L.feathers.push([0, 4, -9.5], [0, 4, -20.5], [-15, 3.6, -33.4]); }}),
];
