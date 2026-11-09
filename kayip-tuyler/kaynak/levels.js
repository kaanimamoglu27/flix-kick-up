// Bölümler. Koordinat: x = sütun, z = satır; kamera +x+z tarafından bakar (büyük x/z ekranda öne gelir).
import { buildLevel } from './engine.js';
const id = (L, x, y, z) => L.find(x, y, z).id;
function mk(def) { const L = buildLevel(def); L.start = id(L, ...def.start); L.goal = id(L, ...def.goal); L.plates = (def.plates || []).map(p => ({ block: id(L, ...p.at), group: p.group })); return L; }
export const CHAPTERS = [
  { name: 'Rüzgâr Vadisi', story: 'Sabah rüzgârı FLIX’in üç tüyünü vadinin dört bir yanına savurdu.', pal: 'morning' },
  { name: 'Gün Batımı Kuleleri', story: 'Tüyler yerine oturmuştu ki akşam fırtınası hepsini yeniden kulelere taşıdı.', pal: 'dusk' },
];
export const LEVELS = [
  () => mk({ ch: 0, name: 'İlk Adım', hint0: 'Gitmek istediğin yere dokun',
    hm: ['111...111', '111111112', '111...111'], stairs: [[7, 1, 1, '+x']], start: [0, 0, 0], goal: [8, 1, 1],
    props: [{ t: 'tree', at: [2, 0, 0], solid: true }, { t: 'tree', at: [6, 0, 2], solid: true }, { t: 'tree', at: [0, 0, 2], solid: true }] }),
  () => mk({ ch: 0, name: 'Dönen Köprü', hint0: 'Altın çarka dokun, köprü dönsün',
    hm: ['1111...1112', '1111...1111', '1111...1111'], stairs: [[9, 1, 0, '+x']],
    extra: [{ fill: [5, 5, 0, 0, 0, 2], g: 0 }], groups: [{ type: 'rot', pivot: [5, 1], handle: { kind: 'crank', pos: [5, -0.6, 1] } }],
    start: [0, 0, 2], goal: [10, 1, 0], props: [{ t: 'tree', at: [0, 0, 0], solid: true }, { t: 'tree', at: [8, 0, 2], solid: true }] }),
  () => mk({ ch: 0, name: 'Asansör', hint0: 'Platforma çık, kolu çek',
    hm: ['111.333', '111.333', '111.333', '2......'], extra: [{ fill: [3, 3, 0, 0, 1, 1], g: 0 }],
    groups: [{ type: 'slide', axis: [0, 1, 0], step: 1, n: 3, handle: { kind: 'lever', pos: [0, 2, 3] } }],
    start: [0, 0, 0], goal: [6, 2, 0], props: [{ t: 'lever', at: [0, 1, 3], solid: true }, { t: 'tree', at: [4, 2, 2], solid: true }] }),
  () => mk({ ch: 1, name: 'Kayan Köprü', hint0: 'Köprüyü kolla kaydır',
    hm: ['22...22', '.....22', '.....22', '.....22', '22...22'], extra: [{ fill: [2, 4, 1, 1, 0, 0], g: 0 }, [6, 2, 2]],
    groups: [{ type: 'slide', axis: [0, 0, 1], step: 2, n: 3, handle: { kind: 'lever', pos: [6, 3, 2] } }],
    start: [0, 1, 0], goal: [0, 1, 4], props: [{ t: 'lever', at: [6, 2, 2], solid: true }] }),
  () => mk({ ch: 1, name: 'Basınç Taşı', hint0: 'Taşın üstüne bas',
    hm: ['111...11...112', '111...11...111', '111...11...111'], stairs: [[12, 1, 0, '+x']],
    extra: [{ fill: [3, 5, -2, -2, 1, 1], g: 0 }, { fill: [9, 9, 0, 0, 0, 2], g: 1 }],
    groups: [{ type: 'slide', axis: [0, 1, 0], step: 2, n: 2 }, { type: 'rot', pivot: [9, 1], handle: { kind: 'crank', pos: [9, -0.6, 1] } }],
    plates: [{ at: [0, 0, 0], group: 0 }], start: [2, 0, 2], goal: [13, 1, 0], props: [{ t: 'tree', at: [7, 0, 0], solid: true }, { t: 'tree', at: [11, 0, 2], solid: true }] }),
  () => mk({ ch: 1, name: 'Rüzgâr Kulesi', hint0: 'Kuleye tırman, kolu çevir',
    hm: ['3333333'.replace(/3/g, '1').replace(/^(...)1/, '$13'), '1111111', '1111111', '1113113', '1111111', '1111111', '1111111'],
    stairs: [[6, 1, 5, '-z'], [6, 2, 4, '-z']], extra: [[6, 1, 4], { fill: [4, 5, 2, 2, 3, 3], g: 0 }, { fill: [3, 3, 2, 2, 4, 5], g: 0 }],
    groups: [{ type: 'rot', pivot: [3, 3], handle: { kind: 'crank', pos: [3.5, 1.5, 3.52], face: '+z' } }],
    start: [0, 0, 6], goal: [3, 2, 0], props: [{ t: 'tree', at: [0, 0, 0], solid: true }, { t: 'tree', at: [1, 0, 4], solid: true }, { t: 'tree', at: [5, 0, 0], solid: true }] }),
];
