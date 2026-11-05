import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src = open('game7.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:120]))
    src = src.replace(old, new)

# ---- modules: varied worlds, regional looks ----
rep(open('worlds7.js').read(), open('worlds8.js').read())
d7 = open('deco7.js').read()
rep(d7, d7 + '\n' + open('extra8.js').read() + '\n' + open('look8.js').read())
rep("if (o.end) L.props.push(lot(o, cx - 5.6, cx + 5.6, zB - 2.4, zB, '+z', top + 0.22));",
    "if (o.end) L.props.push(lot(o.endH ? {h: o.endH} : o, cx - 5.6, cx + 5.6, zB - 2.4, zB, '+z', top + 0.22));")

# ---- fair levels: nothing may cover or swallow the bucket ----
rep("function mkLevel(i, def) {", r"""function fairLevel(L) {
  const isl = (x, z) => L.islands.find((I) => Math.abs(x - I.x) <= I.w / 2 && Math.abs(z - I.z) <= I.d / 2);
  const lotD = (P, x, z) => Math.hypot(Math.max(P.x0 - x, 0, x - P.x1), Math.max(P.z0 - z, 0, z - P.z1));
  const near = (x, z) => { let d = 99; for (const P of L.props) if (P.t === 'bld') d = Math.min(d, lotD(P, x, z)); return d; };
  const B = L.bucket;
  if (B[2] === undefined && near(B[0], B[1]) < 1.8) { // bucket touching a building: slide it back along the route
    const I0 = isl(B[0], B[1]), top0 = I0 ? I0.top : 0, pr = L.route && L.route.length > 1 ? L.route[L.route.length - 2] : L.start;
    const dx = pr[0] - B[0], dz = pr[1] - B[1], dl = Math.hypot(dx, dz) || 1; let ok = null;
    for (let s = 0.2; s <= 8 && !ok; s += 0.2) for (const side of [0, 0.6, -0.6, 1.2, -1.2]) { const x = B[0] + dx / dl * s - dz / dl * side, z = B[1] + dz / dl * s + dx / dl * side, I = isl(x, z); if (I && Math.abs(I.top - top0) < 0.05 && near(x, z) >= 1.8 && Math.abs(x - I.x) <= I.w / 2 - 0.9 + (I.kind === 'road' ? 9 : 0)) { ok = [x, z]; break; } }
    if (ok) { B[0] = ok[0]; B[1] = ok[1]; if (L.route && L.route.length) L.route[L.route.length - 1] = [ok[0], ok[1]]; }
  }
  const pts = [[B[0], B[1], 2.4], [L.start[0], L.start[1], 1.6]];
  L.props = L.props.filter((P) => {
    if (P.t === 'line') { const a = Math.min(P.x0, P.x1), b = Math.max(P.x0, P.x1); return !pts.some(([x, z], k) => Math.abs(P.z - z) < (k ? 1.8 : 3.0) && x > a - 0.6 && x < b + 0.6); }
    if (P.x === undefined || P.z === undefined) return true;
    if (['car', 'kiosk', 'stall', 'tree', 'plant', 'bench', 'bin', 'monu', 'lamp', 'hydrant', 'sign'].includes(P.t)) return !pts.some(([x, z, r]) => Math.hypot(P.x - x, P.z - z) < r + (P.t === 'monu' ? 1.4 : P.t === 'car' ? 0.9 : 0));
    return true;
  });
  if (L.actors) L.actors = L.actors.filter((A) => A.t !== 'pigeons' || A.x === undefined || Math.hypot(A.x - B[0], A.z - B[1]) > 1.6);
}
function mkLevel(i, def) {""")
rep("def.build(L); L.deco = genDeco(L, CUR_THEME); return L; }", "def.build(L); fairLevel(L); L.deco = genDeco(L, CUR_THEME); return L; }")
rep("WORLDS.slice(1).forEach((W, wi) => { for (let k = 0; k < PER_WORLD; k++) LEVELS.push(mkLevel(PER_WORLD * (wi + 1) + k, genLevel(W.id, k))); });",
    "WORLDS.slice(1).forEach((W, wi) => { for (let k = 0; k < PER_WORLD; k++) LEVELS.push(mkLevel(PER_WORLD * (wi + 1) + k, genLevel(W.id, k))); });\n" + open('pars8.js').read().strip() + "\nif (PARS8) LEVELS.forEach((L, i) => { if (PARS8[i]) L.par = PARS8[i]; });")

# ---- physics: a stronger full pull, a bit more bounce ----
rep("const G = 14, VMIN = 5, VMAX = 16;", "const G = 14, VMIN = 5, VMAX = 19.5;")
rep("el = 1.2 - pow * 0.27,", "el = 1.2 - pow * 0.4,")
rep("const e = o.kind === 'bounce' ? 1.18 : o.kind === 'soft' ? 0.15 : 0.32;", "const e = o.kind === 'bounce' ? 1.18 : o.kind === 'soft' ? 0.18 : 0.45;")

# ---- rules: same 8 shots for everyone, par 2-3 ----
rep("const MAXOVER = 2; // shots allowed over par", "const MAXOVER = 2, SHOT_LIMIT = 8; // shots allowed per hole")
rep("(LV.par + MAXOVER + (P.bonus || 0))", "(SHOT_LIMIT + (P.bonus || 0))")
rep("if (P.shot >= LV.par + MAXOVER + (P.bonus || 0)) return lose();", "if (P.shot >= SHOT_LIMIT + (P.bonus || 0)) return lose();")
rep("function starsFor(shots, par) { return shots <= par ? 3 : shots === par + 1 ? 2 : 1; }", "function starsFor(shots, par) { return shots <= par ? 3 : shots <= par + 2 ? 2 : 1; }")
rep("`Par ${LV.par} bölümde ${LV.par + MAXOVER} atış hakkın bitti.`", "`${SHOT_LIMIT + (P.bonus || 0)} atış hakkın bitti. Bir daha dene!`")

# ---- world variety hooks ----
rep("  if (P.t === 'bld') { facadeBlock(g, P); return true; }",
    "  if (P.t === 'bld') { if (OPEN_W[CUR_THEME]) themedLot(g, P); else { facadeBlock(g, P); facadeExtra(g, P); } return true; }\n  if (P.t === 'monu') { monuProp(P, top, g); return true; }\n  if (P.t === 'water') { waterProp(P, g); return true; }")
rep("    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xe22511 : 0xfff1b0, 0.3), P.x + 0.4, top + 0.7, P.z + a * 1.2, g);\n    return true;",
    "    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xe22511 : 0xfff1b0, 0.3), P.x + 0.4, top + 0.7, P.z + a * 1.2, g);\n    carExtras(P, top, g, true);\n    return true;")
rep("    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xfff1b0 : 0xe22511, 0.3), P.x + a * 1.2, top + 0.7, P.z + 0.4, g);\n    return true;",
    "    for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(0.08, 8, 6), std(a > 0 ? 0xfff1b0 : 0xe22511, 0.3), P.x + a * 1.2, top + 0.7, P.z + 0.4, g);\n    carExtras(P, top, g, false);\n    return true;")
rep("      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = P.x0 + 0.15, k = 0;\n      while (x < P.x1 - 0.4) {",
    "      const cols = [0xe22511, 0xffc20e, 0x1f6fd1, 0xffffff, 0x2fa84f, 0xff8fb8, 0xff7a1a]; let x = lineDeco(P, top, g) ? 1e9 : P.x0 + 0.15, k = 0;\n      while (x < P.x1 - 0.4) {")
rep("    if (P.t !== 'bld') ink(g, 0.025);\n", "    if (P.t !== 'bld') ink(g, 0.025);\n    if (P.t === 'bld' || P.t === 'kiosk' || P.t === 'stall' || P.t === 'tree' || P.t === 'monu') OCC.push({g, box: new THREE.Box3().setFromObject(g).expandByScalar(0.05), a: 1, cur: 1, mats: null});\n")
rep("FLAGS.length = 0; SPIN.length = 0;", "FLAGS.length = 0; SPIN.length = 0; OCC.length = 0;", 1)
rep("for (const D of LV.deco || []) decoProp(D, dg); { const lg = new THREE.Group(); lg.position.set((bb.x0 + bb.x1) / 2, -1.2, bb.z0 - 30); lg.scale.setScalar(1.9);",
    "for (const D of LV.deco || []) decoProp8(D, dg); { const lg = new THREE.Group(); lg.position.set((bb.x0 + bb.x1) / 2, -1.2, bb.z0 - 20); lg.scale.setScalar(2.1);")
rep("function decoProp8(D, g) { const sg = new THREE.Group(); sg.position.set(D.x, D.top, D.z); sg.scale.setScalar(1.3);", "function decoProp8(D, g) { const sg = new THREE.Group(); sg.position.set(D.x, D.top, D.z); sg.scale.setScalar(1.15);")

# ---- camera: buildings in the way turn see-through; the camera only moves when it would be inside one ----
rep("let CAMB = null, CAMB_LV = null;", r"""const OCC = []; const _ray = new THREE.Ray(), _hp = new V3(), _cd = new V3(), _tp2 = new V3();
function occAlpha(o, a) {
  if (!o.mats) { o.mats = []; o.g.traverse((m) => { if (!m.isMesh) return; if (m.userData.noInk && m.parent && m.parent.isMesh) { o.mats.push({ink: m}); return; } const arr = Array.isArray(m.material), ms = (arr ? m.material : [m.material]).map((q) => { const c = q.clone(); c.userData.op0 = q.transparent ? q.opacity : 1; c.userData.tr0 = q.transparent; return c; }); m.material = arr ? ms : ms[0]; o.mats.push({m, ms}); }); }
  for (const e of o.mats) { if (e.ink) e.ink.visible = a > 0.97; else { e.m.castShadow = true; for (const q of e.ms) { q.transparent = a < 0.99 || q.userData.tr0; q.opacity = q.userData.op0 * a; q.depthWrite = a > 0.97; } } }
  o.cur = a;
}
function fadeOcc(dt) {
  if (!OCC.length) return; const on = (state === 'play' || state === 'end' || state === 'pause') && camMode !== 'map' && !(P.intro > 1.2);
  const cp = camera.position, tp = toyRoot.position;
  for (const o of OCC) {
    let want = 1;
    if (on) for (const ty of [0.05, 0.8]) { _tp2.set(tp.x, tp.y + ty, tp.z); _cd.subVectors(_tp2, cp); const len = _cd.length(); if (len < 0.01) break; _ray.set(cp, _cd.divideScalar(len)); if (o.box.containsPoint(cp) || (_ray.intersectBox(o.box, _hp) && _hp.distanceTo(cp) < len - 0.35)) { want = 0.18; break; } }
    o.a += (want - o.a) * Math.min(1, dt * 10);
    const a = o.a > 0.985 ? 1 : o.a; if (Math.abs(a - o.cur) > 0.02 || (a === 1 && o.cur !== 1)) occAlpha(o, a);
  }
}
let CAMB = null, CAMB_LV = null;""")
old_cb = src[src.index("function camBlock() {"):src.index("function snapCam()")]
rep(old_cb, r"""function camBlock() { // only when the camera would sit inside something: pull in, then rise over it (walls in between just fade)
  const tp = toyRoot.position; if (camMode === 'map' || state === 'home' || state === 'shop') return;
  const inside = (p) => { for (const o of camBoxes()) if (p.x > o.b[0] - 0.3 && p.x < o.b[1] + 0.3 && p.z > o.b[4] - 0.3 && p.z < o.b[5] + 0.3 && p.y < o.b[3] + 0.4 && p.y > o.b[2] - 0.5) return o; return null; };
  const o = inside(wantPos); if (!o) return;
  _cb.copy(wantPos);
  for (const f of [0.82, 0.66, 0.5, 0.38]) { wantPos.lerpVectors(tp, _cb, f); wantPos.y = Math.max(_cb.y, tp.y + 1.7); if (!inside(wantPos)) return; }
  wantPos.copy(_cb); wantPos.y = Math.max(_cb.y, o.b[3] + 0.9); wantLook.y = Math.min(wantLook.y, tp.y + 0.2);
}
""")
rep("wantPos.copy(tp).addScaledVector(fwd, -6.2); wantPos.y = Math.max(tp.y + 2.6, P.from.y + 2.2);", "wantPos.copy(tp).addScaledVector(fwd, -5.6); wantPos.y = Math.max(tp.y + 2.4, P.from.y + 2.0);")
rep("camMode === 'fly' ? 6.5 :", "camMode === 'fly' ? 8 :")
rep("  camera.position.copy(camPos); camera.lookAt(camLook);\n}", "  camera.position.copy(camPos); camera.lookAt(camLook);\n  fadeOcc(dt);\n}")

# ---- bot: optional aim noise to play like an average player ----
rep("const s = solveShot(P.from); P.yaw = s.ang; shoot(s.pow); P.body.autoOpen = s.open;",
    "const s = solveShot(P.from), nz = window.__noise || 0, gr = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; P.yaw = s.ang + gr() * nz * 0.12; shoot(clamp(s.pow + gr() * nz * 0.1, 0.05, 1)); P.body.autoOpen = s.open;")

# ---- skins: patterns, feather prints, accessories, 3D shop pictures ----
old_as = src[src.index("function applySkin(id) {"):src.index("const SKINS0 = [")] if src.index("function applySkin(id) {") < src.index("const SKINS0 = [") else None
i0 = src.index("function applySkin(id) {"); i1 = src.index("\n}\n", i0) + 3
src = src[:i0] + "function applySkin(id) { const S = SKINS.find((s) => s.id === id) || SKINS[0]; applySkinTo(toyM, S); }\n" + open('skin8.js').read() + src[i1:]
rep('<div class="pv">${T.svg(it)}</div>', '<div class="pv">${shopTab === \'trail\' ? T.svg(it) : thumbHTML(shopTab, it, T.svg)}</div>')
rep('<div class="pv">${toySVG(SKINS.find((s) => s.id === STARTER.skin))}</div>', '<div class="pv">${thumbHTML(\'skin\', SKINS.find((s) => s.id === STARTER.skin), toySVG)}</div>')

open('game8.js', 'w').write(src); print('game8.js', len(src))
