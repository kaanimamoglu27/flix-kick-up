import re, sys
src = open('game3.js').read()
tex = open('tex4.js').read()
shop = open('shop4.js').read()

def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:80]))
    src = src.replace(old, new)

# 1. textures
a = src.index("const paveTex = ctex(256")
b = src.index("function addFacadeBlock")
src = src[:a] + tex + '\n' + src[b:]
rep("const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.07).getHex(), 0.9), roof = std(0x9a6a56, 0.9);",
    "const side = std(new THREE.Color(P.col).offsetHSL(0, 0, -0.07).getHex(), 0.9), rt = roofTex.clone(); rt.needsUpdate = true; rt.repeat.set((P.x1 - P.x0) / 2.2, (P.z1 - P.z0) / 2.2); const roof = new THREE.MeshStandardMaterial({map: rt, roughness: 0.85});")
rep("const mats = [side, side, roof, side, side, side]; mats[", "const mats = [side, side, roof, side, side, side]; mats[")
rep("sun.shadow.mapSize.set(1536, 1536)", "sun.shadow.mapSize.set(2048, 2048)")
rep("const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / 2, I.d / 2);", "const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / (src === paveTex ? 3 : 2.5), I.d / (src === paveTex ? 3 : 2.5));")

# 2. portrait frame: sizes come from the #app column, not the window
rep("const V3 = THREE.Vector3;", "const V3 = THREE.Vector3;\nconst APP = $('app'); const VW = () => APP.clientWidth || innerWidth, VH = () => APP.clientHeight || innerHeight, OX = () => APP.getBoundingClientRect().left, OY = () => APP.getBoundingClientRect().top;")
rep("((v.x + 1) / 2 * innerWidth).toFixed(1)", "((v.x + 1) / 2 * VW()).toFixed(1)")
rep("((1 - v.y) / 2 * innerHeight - (1.4 - b.life) * 14)", "((1 - v.y) / 2 * VH() - (1.4 - b.life) * 14)")
rep("svg.setAttribute('width', innerWidth); svg.setAttribute('height', innerHeight);", "svg.setAttribute('width', VW()); svg.setAttribute('height', VH());")
rep("const full = Math.min(230, innerHeight * 0.3)", "const full = Math.min(230, VH() * 0.3)")
rep("aim = {id: e.pointerId, x0: e.clientX, y0: e.clientY, cx: e.clientX, cy: e.clientY,", "aim = {id: e.pointerId, x0: e.clientX - OX(), y0: e.clientY - OY(), cx: e.clientX - OX(), cy: e.clientY - OY(),")
rep("aim.cx = e.clientX; aim.cy = e.clientY;", "aim.cx = e.clientX - OX(); aim.cy = e.clientY - OY();")
rep("function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }",
    "function resize() { renderer.setSize(VW(), VH()); camera.aspect = VW() / VH(); camera.updateProjectionMatrix(); const land = matchMedia('(pointer:coarse)').matches && innerWidth > innerHeight * 1.15; $('rotL').hidden = !land; if (land && state === 'play') pause(true); }")

# 3. trail: per-point colours from the equipped trail, round sprites
rep("const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({color: 0xffc20e, size: 0.16, transparent: true, opacity: 0.8, depthWrite: false}));",
    "const trailCol = new Float32Array(trailN * 3); trailGeo.setAttribute('color', new THREE.BufferAttribute(trailCol, 3));\n"
    "const dotTex = ctex(64, 64, (x, w, h) => { const g = x.createRadialGradient(32, 32, 4, 32, 32, 30); g.addColorStop(0, '#fff'); g.addColorStop(0.65, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); });\n"
    "const trail = new THREE.Points(trailGeo, new THREE.PointsMaterial({size: 0.2, map: dotTex, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false}));")
rep("if (P.phase === 'fly' && B) { trailPos.set([B.p.x, B.p.y, B.p.z], (trailK++ % trailN) * 3); trailGeo.attributes.position.needsUpdate = true; trail.visible = true; trail.material.color.setHex(B.open ? 0x2fa84f : 0xffc20e); } else if (trail.visible && P.phase !== 'fly') { trail.visible = false; trailPos.fill(0); trailK = 0; }",
    "const emit = P.phase === 'fly' && B ? B.p : state === 'shop' && shopTab === 'trail' ? toyRoot.position : null;\n"
    "  if (emit) { const k = trailK++ % trailN; trailPos.set([emit.x, emit.y, emit.z], k * 3); trailCol.set(trailColor(trailK).toArray(), k * 3); trailGeo.attributes.position.needsUpdate = true; trailGeo.attributes.color.needsUpdate = true; trail.visible = true; trail.material.size = (trailDef.big ? 0.3 : 0.2) * (B && B.open ? 1.25 : 1); trail.material.opacity = trailDef.twinkle ? 0.65 + Math.sin(T * 30) * 0.3 : 0.9; } else if (trail.visible) { trail.visible = false; trailPos.fill(0); trailK = 0; }")
rep("// ================= CAMERA =================", "const _tc = new THREE.Color();\nfunction trailColor(k) { if (trailDef.rainbow) return _tc.setHSL((k * 0.045) % 1, 0.9, 0.55); const c = trailDef.cols; return _tc.setHex(c[k % c.length]); }\n\n// ================= CAMERA =================")

# 4. shop camera + toy pose: the toy floats in the top part of the screen above the shop sheet
rep("    if (state === 'home') { const a = T * 0.12;",
    "    if (state === 'shop') { const a = T * 0.25; wantLook.copy(tp); wantLook.y -= 1.7; wantPos.set(tp.x + Math.sin(a) * 6.2, tp.y + 0.9, tp.z + Math.cos(a) * 6.2); return; }\n    if (state === 'home') { const a = T * 0.12;")
rep("  if (state === 'home' || state === 'levels') {",
    "  if (state === 'shop') { const base = startPos(LV); if (shopTab === 'trail') toyRoot.position.set(base.x + Math.sin(T * 2.2) * 1.4, base.y + 1.2 + Math.sin(T * 4.4) * 0.45, base.z + Math.cos(T * 2.2) * 0.6); else toyRoot.position.set(base.x, base.y + 1.0 + Math.sin(T * 2) * 0.12, base.z); toyRoot.rotation.set(0, T * 0.6, 0); }\n  else if (state === 'home' || state === 'levels') {")
rep("const open = B && B.open ? 1 : 0; toyM.userData.op", "const open = B && B.open || state === 'shop' && shopTab === 'skin' ? 1 : 0; toyM.userData.op")
rep("if (camMode === 'map' || state !== 'play' && state !== 'pause' && state !== 'end') {", "if (camMode === 'map' || state !== 'play' && state !== 'pause' && state !== 'end') {")
rep("const tp = toyRoot.position; if (camMode === 'map' || state === 'home') return;", "const tp = toyRoot.position; if (camMode === 'map' || state === 'home' || state === 'shop') return;")

rep("camMode === 'map' ? 3 : P.intro > 0", "camMode === 'map' ? (state === 'shop' ? 5 : 3) : P.intro > 0")
# 5. golf limit with ad bonus shots
rep("if (P.shot >= LV.par + MAXOVER) return lose();", "if (P.shot >= LV.par + MAXOVER + (P.bonus || 0)) return lose();")
rep("intro: BOT ? 0 : 2.2, pen: 0});", "intro: BOT ? 0 : 2.2, pen: 0, bonus: 0, revived: 0});")
rep("['homeL', 'levelsL', 'endL', 'pauseL'].forEach((id) => show(id, false)); show('hud', true); state = 'play';",
    "['homeL', 'levelsL', 'endL', 'pauseL', 'shopL'].forEach((id) => show(id, false)); show('hud', true); state = 'play'; if (window.FlixAds) window.FlixAds.setScreen('game');")

# 6. win: currency via addFe, 2x reward ad, interstitial before the next level
rep("SAVE.lv[cur] = {s: Math.max(prev.s || 0, nStars), best: Math.min(prev.best || 99, P.shot), done: 1}; SAVE.fe += fe; save();",
    "SAVE.lv[cur] = {s: Math.max(prev.s || 0, nStars), best: Math.min(prev.best || 99, P.shot), done: 1}; SAVE.fe += fe; save(); feUI();")
rep("    $('retry3').hidden = false;\n    $('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';\n    $('next').onclick = () => { if (cur + 1 < LEVELS.length) startLevel(cur + 1); else openLevels(); };",
    "    $('retry3').hidden = false; endAd('double', fe); if (window.FlixAds) window.FlixAds.setScreen('over');\n"
    "    $('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';\n"
    "    $('next').onclick = async () => { if ($('next').dataset.busy) return; $('next').dataset.busy = 1; await maybeInterstitial(); delete $('next').dataset.busy; if (cur + 1 < LEVELS.length) startLevel(cur + 1); else openLevels(); };")
rep("$('retry3').hidden = true; $('next').querySelector('b').textContent = 'TEKRAR'; $('next').onclick = () => startLevel(cur);",
    "$('retry3').hidden = true; $('next').querySelector('b').textContent = 'TEKRAR'; $('next').onclick = () => startLevel(cur); endAd(P.revived ? null : 'revive'); if (window.FlixAds) window.FlixAds.setScreen('over');")
rep("const row = (a, b) =>", """// reward ad on the score card: 2x feathers after a win, +2 shots once after running out
function endAd(kind, fe) {
  const b = $('endAd'); if (!kind || BOT) { b.hidden = true; return; }
  b.hidden = false; b.disabled = false; b.className = 'adbtn ' + kind;
  b.innerHTML = kind === 'double' ? `<i>▶</i><span>Reklam izle<b>2x tüy · +${fe}</b></span>` : `<i>▶</i><span>Reklam izle<b>+${AD_CFG.extraShots} atış hakkı</b></span>`;
  b.onclick = async () => {
    if (b.disabled) return; b.disabled = true; const r = await adRewarded();
    if (r !== 'rewarded') { b.disabled = false; toastShop('Reklam şu an yok', 'biraz sonra dene'); return; }
    if (kind === 'double') { addFe(fe, 'reklam ödülü: 2x'); b.innerHTML = '<i>✓</i><span>Ödül alındı<b>+' + fe + ' tüy</b></span>'; const t = $('endRows').querySelector('.tot b'); if (t) t.textContent = '+' + fe * 2 + ' tüy'; }
    else reviveRun();
  };
}
function reviveRun() { // continue the same hole with two more shots
  P.revived = 1; P.bonus = (P.bonus || 0) + AD_CFG.extraShots; show('endL', false); show('hud', true); state = 'play'; if (window.FlixAds) window.FlixAds.setScreen('game');
  P.body = null; P.phase = 'aim'; placeToy(P.from); toyRoot.quaternion.identity(); tuyUI(); P.yaw = autoYaw(P.from); camMode = 'aim'; hudShots(); toast('+' + AD_CFG.extraShots + ' ATIŞ', 'devam!', '#2fa84f');
}
const row = (a, b) =>""")
rep("function hudShots() { $('shots').textContent = P.shot; $('shotsBox').classList.toggle('over', P.shot >= LV.par); }",
    "function hudShots() { $('shots').textContent = P.shot; $('shotMax').textContent = '/' + (LV.par + MAXOVER + (P.bonus || 0)); $('shotsBox').classList.toggle('over', P.shot >= LV.par); }")

# 7. screens: shop layer in the lists, home currency, shop + restore buttons
rep("state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL', 'setL'].forEach((id) => show(id, false)); show('homeL', true);",
    "state = 'home'; ['hud', 'levelsL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('homeL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');")
rep("$('starsH').textContent = starTotal() + '/' + LEVELS.length * 3; $('feH').textContent = SAVE.fe;", "$('starsH').textContent = starTotal() + '/' + LEVELS.length * 3;")
rep("state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL', 'setL'].forEach((id) => show(id, false)); show('levelsL', true);",
    "state = 'levels'; ['hud', 'homeL', 'endL', 'pauseL', 'setL', 'shopL'].forEach((id) => show(id, false)); show('levelsL', true); feUI(); if (window.FlixAds) window.FlixAds.setScreen('menu');")
rep("function setUI() { ", "function setUI() { $('restRow').hidden = !NATIVE; $('adsT').textContent = SAVE.noads ? 'Kapalı ✓' : 'Açık'; ")
rep("$('setClose').addEventListener('click', () => show('setL', false));",
    "$('setClose').addEventListener('click', () => show('setL', false));\n"
    "$('shopB').addEventListener('click', () => { audio(); openShop('skin'); });\n"
    "document.querySelectorAll('.feBtn').forEach((b) => b.addEventListener('click', () => { audio(); if (state === 'shop') { shopTab = 'fe'; renderShop(); } else if (state === 'home' || state === 'levels') openShop('fe'); }));\n"
    "$('adsRow').addEventListener('click', () => { show('setL', false); openShop('fe'); });\n"
    "$('restRow').addEventListener('click', async () => { if (!window.FlixNative) return; $('restT').textContent = '...'; try { await window.FlixNative.restore(); toastShop('Geri yüklendi', 'satın alımların kontrol edildi'); } catch (e) { toastShop('Geri yükleme olmadı', 'internet bağlantını kontrol et'); } $('restT').textContent = 'Geri yükle'; setUI(); });")

# 8. economy module before the test hooks
rep("window.__A = {", shop + "\n\nwindow.__A = {openShop, grant, addFe, lose, reviveRun, maybeInterstitial, ")
src = src.replace("cam: () => camMode};", "cam: () => camMode, SKINS, TRAILS};")
open('game4.js', 'w').write(src)
print('ok', len(src))
