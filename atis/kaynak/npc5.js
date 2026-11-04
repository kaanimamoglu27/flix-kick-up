// ================= NPC + ANIMAL SKINS, PEOPLE KICK THE FLIX BACK (v5) =================
const NPC_SKINS = [
  {id: 'mahalle', name: 'Mahalleli', price: 0},
  {id: 'futbolcu', name: 'Futbolcu', price: 800, cloth: 0xe22511, pants: 0xf4f4f4, shoe: 0xffffff},
  {id: 'asci', name: 'Aşçı', price: 1200, cloth: 0xf8f8f4, pants: 0x3a3f4a, hat: 'chef'},
  {id: 'astronot', name: 'Astronot', price: 2500, cloth: 0xe8ecf2, pants: 0xe8ecf2, shoe: 0x8a93a6, hat: 'helmet'},
  {id: 'kahraman', name: 'Süper Kahraman', price: 4000, cloth: 0x1f6fd1, pants: 0x1f6fd1, shoe: 0xe22511, cape: 0xe22511},
];
const ANI_SKINS = [
  {id: 'normal', name: 'Kedi & Köpek', price: 0},
  {id: 'dino', name: 'Dinozor', price: 1000, say: ['RAAWR!', 'GRAAA!', 'Rawr?']},
  {id: 'penguen', name: 'Penguen', price: 1500, say: ['Vak vak!', 'Brrr!', 'Kaydım!']},
  {id: 'panda', name: 'Panda', price: 2500, say: ['Mmmf!', 'Bambu?', 'Hıh!']},
  {id: 'tavuk', name: 'Tavuk', price: 3500, say: ['GIDAAK!', 'Bık bık!', 'GIT GIT!']},
];
function npcSkin(id) { return NPC_SKINS.find((s) => s.id === (id || SAVE.npc)) || NPC_SKINS[0]; }
function aniSkin(id) { return ANI_SKINS.find((s) => s.id === (id || SAVE.ani)) || ANI_SKINS[0]; }
// costume pieces added on top of the normal person model
function dressPerson(m, NS) {
  if (NS.hat === 'chef') { const w = std(0xffffff, 0.8); part(CYL, w, 0.17, 0.2, 0.17, 0, 0.24, 0, m.head); part(SPH, w, 0.21, 0.13, 0.21, 0, 0.38, 0, m.head); }
  if (NS.hat === 'helmet') {
    const gl = new THREE.MeshStandardMaterial({color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.3, depthWrite: false});
    const h = new THREE.Mesh(SPH, gl); h.scale.setScalar(0.27); h.position.set(0, 0.02, 0.01); h.userData.noInk = true; m.head.add(h);
    part(CYL, std(0xc8ccd6, 0.5), 0.2, 0.06, 0.2, 0, -0.2, 0, m.head);
    part(BOX, std(0xd8dce4, 0.6), 0.3, 0.42, 0.14, 0, 1.08, -0.2, m.body); part(BOX, std(0xe22511, 0.5), 0.1, 0.06, 0.02, -0.07, 1.18, 0.155, m.body);
  }
  if (NS.cape) { const c = part(BOX, std(NS.cape, 0.7), 0.46, 0.8, 0.025, 0, 1.0, -0.19, m.body); c.rotation.x = 0.14; part(BOX, std(0xffc20e, 0.5), 0.41, 0.06, 0.31, 0, 0.8, 0, m.body); }
  if (NS.id === 'futbolcu') { part(BOX, std(0xffffff, 0.7), 0.12, 0.1, 0.02, 0, 1.12, 0.152, m.body); }
}
// animal skins: same parts as the cat / dog (body, head, 4 legs, tail) so the walking and reaction code works unchanged
function makeCreature(id, kind) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const legs = []; let head, tail;
  const leg = (mat, x, y, z, len, r, end, er) => { const l = limb(body, mat, x, y, len, r, end, er); l.position.z = z; legs.push(l); return l; };
  if (id === 'dino') {
    const c = std(0x5fae3a, 0.7), b = std(0xd8e8a0, 0.8), sp = std(0xff9a1a, 0.6);
    part(SPH, c, 0.2, 0.21, 0.3, 0, 0.36, 0, body); part(SPH, b, 0.15, 0.15, 0.22, 0, 0.32, 0.08, body);
    head = new THREE.Group(); head.position.set(0, 0.66, 0.3); body.add(head);
    part(SPH, c, 0.14, 0.13, 0.19, 0, 0, 0.04, head); part(SPH, b, 0.11, 0.05, 0.15, 0, -0.07, 0.07, head);
    for (const sx of [-1, 1]) { part(SPH, std(0xffffff, 0.3), 0.04, 0.045, 0.03, sx * 0.07, 0.05, 0.15, head); part(SPH, std(0x111111, 0.3), 0.02, 0.028, 0.015, sx * 0.07, 0.05, 0.175, head); }
    for (let k = 0; k < 4; k++) { const s = part(new THREE.ConeGeometry(1, 1, 4), sp, 0.05, 0.11, 0.05, 0, 0.58 - k * 0.03, 0.12 - k * 0.13, body); s.rotation.x = -0.2; }
    leg(c, -0.11, 0.24, -0.06, 0.22, 0.06, c, 0.07); leg(c, 0.11, 0.24, -0.06, 0.22, 0.06, c, 0.07); leg(c, -0.13, 0.46, 0.2, 0.12, 0.03, c, 0.035); leg(c, 0.13, 0.46, 0.2, 0.12, 0.03, c, 0.035);
    tail = new THREE.Group(); tail.position.set(0, 0.36, -0.26); body.add(tail); const tg = new THREE.Group(); tg.rotation.x = -0.75; tail.add(tg); const tc = part(new THREE.ConeGeometry(1, 1, 10), c, 0.11, 0.55, 0.11, 0, 0.26, 0, tg);
  } else if (id === 'penguen') {
    const k = std(0x1b1f2a, 0.5), w = std(0xf8f8f4, 0.6), o = std(0xff9a1a, 0.5);
    part(SPH, k, 0.19, 0.27, 0.18, 0, 0.32, 0, body); part(SPH, w, 0.14, 0.22, 0.1, 0, 0.3, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.62, 0.02); body.add(head);
    part(SPH, k, 0.13, 0.12, 0.13, 0, 0, 0, head); part(SPH, w, 0.09, 0.07, 0.06, 0, -0.01, 0.09, head); const bk = part(new THREE.ConeGeometry(1, 1, 6), o, 0.035, 0.09, 0.035, 0, -0.02, 0.16, head); bk.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) part(SPH, std(0x111111, 0.3), 0.02, 0.025, 0.015, sx * 0.05, 0.03, 0.12, head);
    leg(o, -0.07, 0.07, 0.04, 0.05, 0.03, o, 0.06); leg(o, 0.07, 0.07, 0.04, 0.05, 0.03, o, 0.06);
    const f1 = leg(k, -0.2, 0.45, 0, 0.24, 0.035, k, 0.04), f2 = leg(k, 0.2, 0.45, 0, 0.24, 0.035, k, 0.04); f1.rotation.z = -0.3; f2.rotation.z = 0.3;
    tail = new THREE.Group(); tail.position.set(0, 0.1, -0.16); body.add(tail); part(SPH, k, 0.06, 0.03, 0.08, 0, 0.02, 0, tail);
  } else if (id === 'panda') {
    const w = std(0xf8f8f4, 0.8), k = std(0x1b1f2a, 0.7);
    part(SPH, w, 0.22, 0.21, 0.32, 0, 0.4, 0, body); part(SPH, k, 0.23, 0.12, 0.12, 0, 0.44, 0.1, body);
    head = new THREE.Group(); head.position.set(0, 0.62, 0.3); body.add(head);
    part(SPH, w, 0.17, 0.15, 0.15, 0, 0, 0, head); part(SPH, w, 0.08, 0.06, 0.07, 0, -0.05, 0.12, head); part(SPH, k, 0.03, 0.025, 0.02, 0, -0.03, 0.19, head);
    for (const sx of [-1, 1]) { part(SPH, k, 0.06, 0.06, 0.04, sx * 0.13, 0.13, -0.02, head); part(SPH, k, 0.05, 0.04, 0.02, sx * 0.065, 0.03, 0.13, head); part(SPH, std(0xffffff, 0.3), 0.015, 0.015, 0.01, sx * 0.065, 0.035, 0.148, head); }
    for (const [lx, lz] of [[-0.12, 0.18], [0.12, 0.18], [-0.12, -0.18], [0.12, -0.18]]) leg(k, lx, 0.3, lz, 0.24, 0.07, k, 0.07);
    tail = new THREE.Group(); tail.position.set(0, 0.45, -0.31); body.add(tail); part(SPH, w, 0.05, 0.05, 0.05, 0, 0.03, 0, tail);
  } else { // tavuk
    const w = std(0xf8f6ee, 0.8), r = std(0xe22511, 0.6), y = std(0xffb01a, 0.5);
    part(SPH, w, 0.16, 0.16, 0.21, 0, 0.32, 0, body);
    head = new THREE.Group(); head.position.set(0, 0.54, 0.14); body.add(head);
    part(SPH, w, 0.09, 0.1, 0.09, 0, 0, 0, head); part(BOX, r, 0.025, 0.08, 0.1, 0, 0.11, 0, head); part(SPH, r, 0.025, 0.04, 0.02, 0, -0.07, 0.07, head);
    const bk = part(new THREE.ConeGeometry(1, 1, 5), y, 0.03, 0.07, 0.03, 0, -0.01, 0.11, head); bk.rotation.x = Math.PI / 2;
    for (const sx of [-1, 1]) part(SPH, std(0x111111, 0.3), 0.016, 0.02, 0.012, sx * 0.05, 0.02, 0.075, head);
    leg(y, -0.06, 0.18, 0.02, 0.16, 0.018, y, 0.035); leg(y, 0.06, 0.18, 0.02, 0.16, 0.018, y, 0.035);
    const wg1 = leg(w, -0.16, 0.38, -0.02, 0.15, 0.06, w, 0.03), wg2 = leg(w, 0.16, 0.38, -0.02, 0.15, 0.06, w, 0.03); wg1.scale.set(0.6, 1, 1.6); wg2.scale.set(0.6, 1, 1.6);
    tail = new THREE.Group(); tail.position.set(0, 0.38, -0.18); body.add(tail); for (const [c, a] of [[w, -0.3], [std(0x1b1330, 0.6), 0], [w, 0.3]]) { const f = part(SPH, c, 0.03, 0.12, 0.05, a * 0.2, 0.08, 0, tail); f.rotation.z = a; }
  }
  ink(g, 0.014); if (kind === 'dog') g.scale.setScalar(1.2);
  return {g, body, legs, head, tail, s: 1};
}
// a person hit by the FLIX juggles it once or twice and then boots it somewhere random
const KICK_SAY = ['Al sana!', 'Gol!', 'Uzak dur!', 'Hoppaa!', 'Ben hallederim!', 'Şut!', 'Kafa!'];
function startJuggle(B, a) {
  if (B.jug || B.juggled || BOT || window.__noJuggle || a.sit || (a.kind !== 'person' && a.kind !== 'kid')) return false;
  B.jug = {a, t: 0, k: -1, n: Math.random() < 0.55 ? 1 : 2}; a.react = Math.max(a.react, B.jug.n * 0.42 + 0.6); B.v.set(0, 0, 0); B.open = false; featherOff(); return true;
}
function jugTick(B, dt) {
  const J = B.jug, a = J.a, D = 0.42; J.t += dt;
  const ry = a.m.g.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry), foot = a.y0 + 0.12 * a.m.s, k = Math.floor(J.t / D), u = (J.t % D) / D;
  if (k !== J.k) { J.k = k; if (k <= J.n) { a.kickT = 0.24; SFX.bounce(); buzz(8); squash = 0.8; } }
  if (k >= J.n) { // the final boot: a random direction, a lob strong enough to cross the street
    const yaw = Math.random() * Math.PI * 2, sp = 5 + Math.random() * 3.5;
    B.p.set(a.x + fx * 0.5, foot + RAD + 0.35, a.z + fz * 0.5); B.v.set(Math.sin(yaw) * sp, 6.5 + Math.random() * 2.5, -Math.cos(yaw) * sp);
    B.jug = null; B.juggled = true; B.t = 0; B.rest = 0; B.energy = Math.max(B.energy, 0.6);
    SFX.launch(0.75); buzz(20); bubble(a, pick(KICK_SAY)); toast('ŞUTLADI!', 'nereye gidecek?', '#7a4fb0'); return;
  }
  B.p.set(a.x + fx * 0.5, foot + RAD + Math.sin(u * Math.PI) * (1.0 + 0.25 * k), a.z + fz * 0.5);
}
