// ===== Flix Kart tracks, worlds and career =====
const BASE = [
  { id: 'mutfak', w: 'mutfak', tr: 'Flix Sahili', en: 'Flix Beach', width: 16, laps: 3,
    pts: [[0, 40], [0, -30], [-20, -70], [-62, -82], [-96, -56], [-100, -10], [-72, 20], [-74, 58], [-100, 92], [-80, 128], [-30, 134], [8, 108], [40, 122], [80, 102], [86, 56], [58, 28], [28, 52]] },
  { id: 'oda', w: 'oda', tr: 'Yeşil Vadi', en: 'Green Valley', width: 17, laps: 3,
    pts: [[0, 50], [0, -30], [20, -78], [70, -96], [118, -70], [126, -20], [96, 14], [60, 22], [52, 56], [86, 86], [92, 128], [52, 160], [-6, 156], [-44, 124], [-40, 86], [-12, 74]] },
  { id: 'bahce', w: 'bahce', tr: 'Kızıl Kanyon', en: 'Red Canyon', width: 17, laps: 3,
    pts: [[0, 60], [0, -20], [10, -70], [50, -100], [100, -90], [130, -50], [115, 0], [150, 40], [155, 100], [115, 140], [65, 135], [40, 100], [5, 125], [-40, 135], [-65, 100], [-35, 75]] },
  { id: 'banyo', w: 'banyo', tr: 'Buz Zirvesi', en: 'Ice Peak', width: 16, laps: 3,
    pts: [[0, 40], [0, -40], [-30, -80], [-80, -80], [-110, -40], [-90, 0], [-120, 30], [-120, 90], [-80, 120], [-40, 100], [-30, 60]] },
  { id: 'fabrika', w: 'fabrika', tr: 'Lav Adası', en: 'Lava Island', width: 18, laps: 3,
    pts: [[0, 60], [0, -60], [30, -110], [90, -120], [140, -90], [150, -30], [110, 10], [150, 60], [140, 130], [80, 160], [20, 150], [-10, 110]] },
];
// every layout also runs backwards
export const TRACKS = [];
for (const b of BASE) {
  TRACKS.push(b);
  TRACKS.push(Object.assign({}, b, { id: b.id + '_r', tr: b.tr + ' (Ters)', en: b.en + ' (Reverse)', pts: [b.pts[0], ...b.pts.slice(1).reverse()], rev: 1 }));
}

export const WORLDS = [
  { id: 'mutfak', tr: 'Flix Sahili', en: 'Flix Beach', need: 0, diff: 0.96, col: ['#7fd4f0', '#f0c66a'], boss: 'kick' },
  { id: 'oda', tr: 'Yeşil Vadi', en: 'Green Valley', need: 7, diff: 0.99, col: ['#9be37a', '#3f9a3a'], boss: 'flick' },
  { id: 'bahce', tr: 'Kızıl Kanyon', en: 'Red Canyon', need: 16, diff: 1.02, col: ['#ffc98a', '#c8643a'], boss: 'buzul' },
  { id: 'banyo', tr: 'Buz Zirvesi', en: 'Ice Peak', need: 26, diff: 1.04, col: ['#bff0ff', '#3fb6d8'], boss: 'neon' },
  { id: 'fabrika', tr: 'Lav Adası', en: 'Lava Island', need: 37, diff: 1.06, col: ['#ff9a3a', '#5a1410'], boss: 'altin' },
];
// 4 events per world: race, reverse race, time trial, boss duel
export const EVENTS = [];
for (const w of WORLDS) {
  EVENTS.push({ id: w.id + '1', w: w.id, t: w.id, m: 'race' });
  EVENTS.push({ id: w.id + '2', w: w.id, t: w.id + '_r', m: 'race' });
  EVENTS.push({ id: w.id + '3', w: w.id, t: w.id, m: 'time' });
  EVENTS.push({ id: w.id + '4', w: w.id, t: w.id + '_r', m: 'boss', boss: w.boss });
}
