import sys
src = open('game4.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:90]))
    src = src.replace(old, new)

# modules: textures, economy, levels, npc skins
rep(open('tex4.js').read(), open('tex5.js').read())
rep(open('shop4.js').read(), open('shop5.js').read())
a = src.index('// ================= LEVELS'); b = src.index('// ================= WORLD BUILDING')
src = src[:a] + open('levels5.js').read() + '\n' + src[b:]
rep("const SAY = {", open('npc5.js').read() + "\nconst SAY = {")

# people / animal skins in the models
rep("const sk = std(pick(SKIN), 0.7), cl = std(o.col || pick(CLOTH), 0.75),", "let sk = std(pick(SKIN), 0.7), cl = std(o.col || pick(CLOTH), 0.75),")
rep("hr = std(pick(HAIR), 0.8), shoe = std(0x1b1330, 0.6);", "hr = std(pick(HAIR), 0.8), shoe = std(0x1b1330, 0.6);\n  const NS = npcSkin(o.npcSkin); if (NS.cloth) cl = std(NS.cloth, 0.75); if (NS.pants) pn = std(NS.pants, 0.8); if (NS.shoe) shoe = std(NS.shoe, 0.6);")
rep("  if (o.hat) { part(CYL, std(o.hat, 0.7)", "  if (o.hat && !NS.hat) { part(CYL, std(o.hat, 0.7)")
rep("  ink(g, 0.018);\n  const s = o.kid ? 0.68 : 1;", "  dressPerson({head, body}, NS);\n  ink(g, 0.018);\n  const s = o.kid ? 0.68 : 1;")
rep("function makeCat(o) {\n", "function makeCat(o) {\n  { const AS = aniSkin(o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'cat'); } }\n")
rep("function makeDog() {\n", "function makeDog(o) {\n  { const AS = aniSkin(o && o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'dog'); } }\n")
rep("kind === 'dog' ? makeDog() :", "kind === 'dog' ? makeDog(A) :")
rep("bubble(a, pick(SAY[a.kind] || SAY.person));", "bubble(a, pick(((a.kind === 'cat' || a.kind === 'dog') && aniSkin().say) || SAY[a.kind] || SAY.person));")
rep("if (!a.sit) { m.legs[0].rotation.x = Math.sin(ph) * sw; m.legs[1].rotation.x = -Math.sin(ph) * sw; }",
    "if (!a.sit) { m.legs[0].rotation.x = Math.sin(ph) * sw; m.legs[1].rotation.x = -Math.sin(ph) * sw; }\n      if (a.kickT > 0) { a.kickT -= dt; m.legs[1].rotation.x = -Math.sin(clamp(1 - a.kickT / 0.24, 0, 1) * Math.PI) * 1.4; }")

# the bucket: only a FLIX that really drops inside and settles on the bottom counts
a = src.index("    const mid = (bk.rIn + bk.rOut) / 2;\n    if (hd < bk.rIn - 0.05 && B.p.y < bk.rimY - 0.1) { B.done = 'in'; }")
b = src.index("  // stars\n", a)
src = src[:a] + """    const mid = (bk.rIn + bk.rOut) / 2;
    if (B.inB && B.p.y > bk.rimY + 0.05) B.inB = false;
    if (B.inB || (hd < bk.rIn - 0.05 && B.p.y < bk.rimY - 0.1)) { // inside: wall, floor, settle
      B.inB = true; const lim = 0.6 - RAD * 0.7;
      if (hd > lim) { const ux = dx / hd, uz = dz / hd; B.p.x = bk.x + ux * lim; B.p.z = bk.z + uz * lim; const vn = B.v.x * ux + B.v.z * uz; if (vn > 0) { B.v.x -= 1.4 * vn * ux; B.v.z -= 1.4 * vn * uz; } if (vn > 1.5) hit = 'rim'; }
      const fl = bk.y + 0.04 + RAD;
      if (B.p.y < fl) { B.p.y = fl; if (B.v.y < 0) { if (B.v.y < -2) hit = 'rim'; B.v.y = -B.v.y * 0.22; } B.v.x *= 0.86; B.v.z *= 0.86; B.inT = (B.inT || 0) + dt; if (B.inT > 0.3 && Math.abs(B.v.y) < 1.2) B.done = 'in'; }
    }
    else if (B.p.y > bk.rimY - 0.15) { // rim
      const ux = hd > 1e-4 ? dx / hd : 1, uz = hd > 1e-4 ? dz / hd : 0; _c.set(bk.x + ux * mid, bk.rimY, bk.z + uz * mid);
      _n.subVectors(B.p, _c); const d = _n.length(); if (d < RAD + 0.08) { _n.divideScalar(d || 1); B.p.copy(_c).addScaledVector(_n, RAD + 0.08); const vn = B.v.dot(_n); if (vn < 0) B.v.addScaledVector(_n, -1.4 * vn); hit = 'rim'; }
    } else if (hd >= mid) { const ux = dx / hd, uz = dz / hd, push = bk.rOut + RAD - hd; B.p.x += ux * push; B.p.z += uz * push; const vn = B.v.x * ux + B.v.z * uz; if (vn < 0) { B.v.x -= 1.4 * vn * ux; B.v.z -= 1.4 * vn * uz; } }
  }
""" + src[b:]
rep("if (B.ground && sp < 0.6) {", "if (B.inB) { /* settles in the bucket above */ } else if (B.ground && sp < 0.6) {")
# no more gimme: the toy has to go in
a = src.index("  if (onGround && Math.hypot(B.p.x - bucket.x, B.p.z - bucket.z) < 1.5"); b = src.index("return win(); }\n", a) + len("return win(); }\n")
src = src[:a] + src[b:]
rep("if (P.body.done) { const B = P.body; if (B.done === 'in') B.p.set(bucket.x, bucket.y + 0.45, bucket.z); placeToy(B.p); endShot(B); break; }",
    "if (P.body.done) { const B = P.body; placeToy(B.p); endShot(B); break; }")
rep("    if (!moved) break;\n  }\n  return p;\n}", "    if (!moved) break;\n  }\n  // never right against the bucket: a lie that close could not be chipped in\n  const bd = Math.hypot(p.x - bucket.x, p.z - bucket.z);\n  if (bd < 1.75 && Math.abs(p.y - RAD - bucket.y) < 0.6) { const ux = bd > 0.01 ? (p.x - bucket.x) / bd : 0, uz = bd > 0.01 ? (p.z - bucket.z) / bd : 1; for (const r of [1.75, 2.1, 2.5]) { const q = new V3(bucket.x + ux * r, p.y, bucket.z + uz * r); const I = islandAt(q.x, q.z); if (I && Math.abs(I.top + RAD + 0.01 - p.y) < 0.2) { p.copy(q); break; } } }\n  return p;\n}")
rep("const MAXOVER = 3;", "const MAXOVER = 2;")

# people juggle the FLIX and boot it somewhere random
rep("    acc += dt; const lvp = lvPhys();\n    while (acc >= 1 / 120) {", "    if (P.body.jug) { jugTick(P.body, dt); acc = 0; } else acc += dt; const lvp = lvPhys();\n    while (acc >= 1 / 120 && !P.body.jug) {")
rep("if (h === 'actor') { if (reactActor(P.body.lastA, P.body.p)) { P.reacts = (P.reacts || 0) + 1; squash = 0.8; } }",
    "if (h === 'actor') { if (reactActor(P.body.lastA, P.body.p)) { P.reacts = (P.reacts || 0) + 1; squash = 0.8; if (startJuggle(P.body, P.body.lastA)) break; } }")
rep("else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; }", "else if (h === 'hit' || h === 'rim') { SFX.thud(vy0); squash = 0.6; if (P.body.ground && vy0 > 4) puff(P.body.p); }")
rep("let squash = 0;", "let squash = 0;\nfunction puff(p) { let n = 0; for (const q of parts) { if (q.life > 0) continue; q.life = 0.35; q.m.material.color.setHex(0xd9d0c0); q.m.position.set(p.x, p.y - RAD + 0.05, p.z); q.v.set((Math.random() - 0.5) * 3, Math.random() * 1.2, (Math.random() - 0.5) * 3); q.m.visible = true; if (++n > 7) break; } }")

# more realistic surfaces: bump maps from the same canvases
rep("addBox(g, new THREE.MeshStandardMaterial({map: t, roughness: 0.95}), x0, x1, I.top - 0.25, I.top, z0, z1);", "addBox(g, new THREE.MeshStandardMaterial({map: t, bumpMap: t, bumpScale: 0.04, roughness: 0.93}), x0, x1, I.top - 0.25, I.top, z0, z1);", 2)
rep("const ft = new THREE.MeshStandardMaterial({map: facadeTex(along, h, P), roughness: 0.85});", "const fx = facadeTex(along, h, P), ft = new THREE.MeshStandardMaterial({map: fx, bumpMap: fx, bumpScale: 0.025, roughness: 0.82});")
rep("const roof = new THREE.MeshStandardMaterial({map: rt, roughness: 0.85});", "const roof = new THREE.MeshStandardMaterial({map: rt, bumpMap: rt, bumpScale: 0.04, roughness: 0.8});")

# levels 11-20 are the paid Sokak 2 pack
rep("function nextLevel() { const k = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); return k < 0 ? LEVELS.length - 1 : k; }",
    "function nextLevel() { const k = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); return k < 0 ? LEVELS.length - 1 : k; }\nfunction playLevel(i) { if (levelLocked(i)) { openPack(); return; } audio(); startLevel(i); }")
rep("    const open = i === 0 || done(i - 1) || done(i), sv = SAVE.lv[i] || {}, nxt = open && !done(i);\n    html += `<button class=\"lv${open ? '' : ' lock'}${nxt ? ' next' : ''}\" data-i=\"${i}\" ${open ? '' : 'disabled'}>",
    "    const paid = levelLocked(i), open = !paid && (i === 0 || done(i - 1) || done(i)), sv = SAVE.lv[i] || {}, nxt = open && !done(i);\n"
    "    if (i === 0) html += '<div class=\"sec\"><b>1. SOKAK · MAHALLE</b><span>ücretsiz</span></div>';\n"
    "    if (i === FREE_LEVELS) html += `<div class=\"sec\"><b>2. SOKAK · ÇARŞI</b><span>${SAVE.pack2 ? 'açık' : 'paket'}</span></div>` + (SAVE.pack2 ? '' : `<button class=\"packbar\" id=\"packBar\"><b>10 yeni, daha zor bölüm</b><span>Satın al · ${priceOf(PACK2)} ya da ${fmtN(PACK2.fe)} tüy</span></button>`);\n"
    "    html += `<button class=\"lv${open ? '' : ' lock'}${paid ? ' paid' : ''}${nxt ? ' next' : ''}\" data-i=\"${i}\" ${open || paid ? '' : 'disabled'}>")
rep("$('grid').innerHTML = html; $('grid').querySelectorAll('.lv:not(.lock)').forEach((b) => b.addEventListener('click', () => { audio(); startLevel(+b.dataset.i); }));",
    "$('grid').innerHTML = html; $('grid').querySelectorAll('.lv:not(.lock), .lv.paid').forEach((b) => b.addEventListener('click', () => playLevel(+b.dataset.i))); const pb = $('packBar'); if (pb) pb.addEventListener('click', openPack);")
rep("$('play').addEventListener('click', () => { audio(); startLevel(nextLevel()); });", "$('play').addEventListener('click', () => playLevel(nextLevel()));\n$('dailyB').addEventListener('click', () => { audio(); openDaily(); });\n$('howB').addEventListener('click', () => { audio(); openHow(); });")
rep("if (cur + 1 < LEVELS.length) startLevel(cur + 1); else openLevels(); };", "if (cur + 1 < LEVELS.length) playLevel(cur + 1); else openLevels(); };")
rep("$('next').onclick = () => startLevel(cur); endAd(", "$('next').onclick = async () => { await maybeLoseAd(); startLevel(cur); }; endAd(")
rep("const n = nextLevel(); $('playSub').textContent = (n + 1) + '. bölüm · ' + LEVELS[n].name;", "const n = nextLevel(); $('playSub').textContent = levelLocked(n) ? 'Sokak 2 paketi' : (n + 1) + '. bölüm · ' + LEVELS[n].name; dailyUI();")

# home screen in the Kick Up style: red swirl behind a transparent 3D view of the FLIX doing kick-ups
rep("const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});", "const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});")
rep("scene.add(new THREE.HemisphereLight(", "const SKY = scene.background;\nscene.add(new THREE.HemisphereLight(")
rep("    if (state === 'home') { const a = T * 0.12; wantLook.copy(tp); wantLook.y += 1.2; wantPos.set(tp.x + Math.sin(a) * 6.5, tp.y + 2.4, tp.z + Math.cos(a) * 6.5); }",
    "    if (state === 'home') { const b = startPos(LV), a = Math.sin(T * 0.35) * 0.45; wantLook.set(b.x, b.y + 1.0, b.z); wantPos.set(b.x + Math.sin(a) * 5, b.y + 1.1, b.z + Math.cos(a) * 5); }")
rep("  else if (state === 'home' || state === 'levels') { const ph = (T * 1.25) % 1, base = startPos(LV); toyRoot.position.set(base.x, base.y + Math.sin(ph * Math.PI) * 1.6, base.z); if (ph < 0.06) squash = Math.max(squash, 0.7); toyRoot.rotation.set(0, T * 0.8, 0); }",
    "  else if (state === 'home' || state === 'levels') { homeKick = Math.max(0, homeKick - dt * 0.9); const ph = (T * 1.25) % 1, base = startPos(LV); toyRoot.position.set(base.x, base.y + Math.sin(ph * Math.PI) * (0.9 + homeKick * 1.1), base.z); if (ph < 0.06) squash = Math.max(squash, 0.7); homeSpin += dt * (0.8 + homeKick * 9); toyRoot.rotation.set(Math.sin(T * 2.5) * 0.12, homeSpin, 0); }")
rep("function render(dt) {\n", "let homeKick = 0, homeSpin = 0;\nfunction render(dt) {\n  const hm = state === 'home' || state === 'shop'; scene.background = hm ? null : SKY; if (world) world.visible = !hm; APP.classList.toggle('hm', hm);\n")
rep("toyShadow.visible = !!I;", "toyShadow.visible = !!I && state !== 'home';")
rep("addEventListener('pointerdown', (e) => {\n  if (state !== 'play') return;", "addEventListener('pointerdown', (e) => {\n  if (state === 'home' && !onUI(e)) { homeKick = 1; SFX.bounce(); buzz(10); squash = 1; return; }\n  if (state !== 'play') return;")
# win: the camera circles the bucket while the FLIX sits in it
rep("if (camMode === 'win') { wantLook.set(bucket.x, bucket.rimY, bucket.z); fwd.set(Math.sin(P.yaw), 0, -Math.cos(P.yaw));",
    "if (camMode === 'win') { wantLook.set(bucket.x, bucket.rimY, bucket.z); const wy = P.yaw + Math.sin((T - (P.winT || T)) * 0.6) * 0.45; fwd.set(Math.sin(wy), 0, -Math.cos(wy));")
rep("P.phase = 'won'; P.celebrate = 1;", "P.phase = 'won'; P.celebrate = 1; P.winT = T;")
rep("shopPreview(); ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'homeL'].forEach((id) => show(id, false)); show('shopL', true); renderShop();", "shopPreview(); ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'homeL'].forEach((id) => show(id, false)); show('shopL', true); renderShop(); render(0); snapCam();")
rep("if (shopTab === 'ani') m.g.scale.multiplyScalar(2.3);", "if (shopTab === 'ani') m.g.scale.multiplyScalar(1.7);")
rep("window.__A = {openShop,", "window.__A = {openPack, openDaily, levelLocked, startJuggle, get shopTab() { return shopTab; }, openShop,")
open('game5.js', 'w').write(src)
print('ok', len(src))
