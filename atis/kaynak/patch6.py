import sys
src = open('game5.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:90]))
    src = src.replace(old, new)

# ---- themes: textures, facades, sky ----
rep("    grain(x, W, H, Math.round(W * H / 60), 0.02, 0.06, true);\n    const dg", "    grain(x, W, H, Math.round(W * H / 60), 0.02, 0.06, true); styleOverlay(x, W, H, o, S);\n    const dg")
a = src.index('// ================= LEVELS')
src = src[:a] + open('theme6.js').read() + '\n' + open('worlds6.js').read() + '\n' + src[a:]
b = src.index('// ================= WORLD BUILDING')
src = src[:b] + "WORLDS.slice(1).forEach((W, wi) => { for (let k = 0; k < PER_WORLD; k++) LEVELS.push(mkLevel(PER_WORLD * (wi + 1) + k, genLevel(W.id, k))); });\nCUR_THEME = 'sokak';\n" + src[b:]
rep("function lot(o, x0, x1, z0, z1, face, top) { const w = pick(WALLS); return {t: 'bld', x0, x1, z0, z1, face, base: top, h: o.h ? o.h : srnd(4.2, 7.2), col: w[0], shut: w[1], sign: w[2], shop: pick(SHOPS),",
    "function lot(o, x0, x1, z0, z1, face, top) { const TH = THEMES[CUR_THEME] || THEMES.sokak, w = pick(TH.walls || WALLS); return {t: 'bld', style: TH.style, x0, x1, z0, z1, face, base: top, h: o.h ? o.h : srnd(TH.hMin, TH.hMax), col: w[0], shut: w[1], sign: w[2], shop: pick(TH.shops || SHOPS),")
rep("function mkLevel(i, def) { seed = 101 + i * 13;", "function mkLevel(i, def) { seed = 101 + i * 13; CUR_THEME = def.theme || 'sokak';")
rep("B.v.y += (-G - B.v.y * drag) * dt;", "B.v.y += (-((LV && LV.g) || G) - B.v.y * drag) * dt;")
rep("const src = I.kind === 'road' ? roadTex : I.kind === 'bridge' ? plankTex : paveTex;\n    const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / (src === paveTex ? 3 : 2.5), I.d / (src === paveTex ? 3 : 2.5));",
    "const TT = themeTex(CUR_THEME), src = I.kind === 'road' ? TT.road : I.kind === 'bridge' ? (CUR_THEME === 'uzay' ? TT.pave : plankTex) : TT.pave;\n    const t = src.clone(); t.needsUpdate = true; t.repeat.set(I.w / (src === TT.pave ? 3 : 2.5), I.d / (src === TT.pave ? 3 : 2.5));")
rep("world = new THREE.Group(); scene.add(world); seed = 11 + i * 7;\n  buildGround3();",
    "world = new THREE.Group(); scene.add(world); seed = 11 + i * 7; CUR_THEME = LV.theme || 'sokak'; scene.fog.color.setHex(THEMES[CUR_THEME].fog); scene.fog.far = CUR_THEME === 'uzay' ? 160 : 110;\n  buildGround3();")
rep("  for (let k = 0; k < 14; k++) cloud(", "  if (CUR_THEME !== 'uzay') for (let k = 0; k < 14; k++) cloud(")
rep("scene.background = hm ? null : SKY;", "scene.background = hm ? null : CUR_THEME === 'sokak' ? SKY : themeSky(CUR_THEME);")
# moon: astronauts and little green neighbours
rep("function npcSkin(id) {", "function npcSkin(id) { if (!id && CUR_THEME === 'uzay' && (SAVE.npc || 'mahalle') === 'mahalle') id = 'astronot';")
rep("  { const AS = aniSkin(o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'cat'); } }",
    "  { const AS = aniSkin(o.aniSkin); if (!o.aniSkin && CUR_THEME === 'uzay' && AS.id === 'normal') { pick([0]); return makeAlien(); } if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'cat'); } }")
rep("  { const AS = aniSkin(o && o.aniSkin); if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'dog'); } }",
    "  { const AS = aniSkin(o && o.aniSkin); if (CUR_THEME === 'uzay' && AS.id === 'normal') { pick([0]); return makeAlien(); } if (AS.id !== 'normal') { pick([0]); return makeCreature(AS.id, 'dog'); } }")
rep("bubble(a, pick(((a.kind === 'cat' || a.kind === 'dog') && aniSkin().say) || SAY[a.kind] || SAY.person));",
    "bubble(a, pick(((a.kind === 'cat' || a.kind === 'dog') && (CUR_THEME === 'uzay' && aniSkin().id === 'normal' ? ['Bip bop!', 'Zıırt!', 'Merhaba dünyalı!', 'Gılgıl?'] : aniSkin().say)) || SAY[a.kind] || SAY.person));")

# ---- progression: 4 worlds, each opens after level 10 of the one before ----
rep("function nextLevel() { const k = LEVELS.findIndex((_, i) => !(SAVE.lv[i] && SAVE.lv[i].done)); return k < 0 ? LEVELS.length - 1 : k; }\nfunction playLevel(i) { if (levelLocked(i)) { openPack(); return; } audio(); startLevel(i); }",
"""const WIDX = (i) => Math.floor(i / PER_WORLD), WLOC = (i) => i % PER_WORLD, lvDone = (i) => !!(SAVE.lv[i] && SAVE.lv[i].done);
function worldOpen(w) { return w === 0 || lvDone((w - 1) * PER_WORLD + FREE_LEVELS - 1); }
function worldCount(w) { let n = 0; for (let k = 0; k < PER_WORLD; k++) if (lvDone(w * PER_WORLD + k)) n++; return n; }
function curWorld() { const w = SAVE.world | 0; return w >= 0 && w < WORLDS.length && worldOpen(w) ? w : 0; }
function nextLevel(w = curWorld()) { for (let k = 0; k < PER_WORLD; k++) if (!lvDone(w * PER_WORLD + k)) return w * PER_WORLD + k; return w * PER_WORLD + PER_WORLD - 1; }
function worldLockedMsg(w) { dlg(WORLDS[w].name, 'KİLİTLİ', `<p><b>${WORLDS[w].name}</b> dünyasını açmak için önce <b>${WORLDS[w - 1].name}</b> dünyasında <b>10. bölümü</b> geç.</p>`, [{t: 'Tamam', c: 'ok'}]); }
function pickWorld(w) { if (!worldOpen(w)) { worldLockedMsg(w); return false; } SAVE.world = w; save(); return true; }
function playLevel(i) { const w = WIDX(i); if (!worldOpen(w)) { worldLockedMsg(w); return; } if (levelLocked(i)) { openPack(); return; } SAVE.world = w; save(); audio(); startLevel(i); }
const LOCK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.6" fill="none"/></svg>';
function worldCards(id, onPick) {
  const cw = curWorld(), el = $(id);
  el.innerHTML = WORLDS.map((W, w) => { const op = worldOpen(w); return `<button class="wc${w === cw ? ' on' : ''}${op ? '' : ' lock'}" data-w="${w}" style="--wc:${W.col}"><b>${W.name}</b><small>${op ? worldCount(w) + '/' + PER_WORLD : LOCK_SVG + ' kilitli'}</small></button>`; }).join('');
  el.querySelectorAll('.wc').forEach((b) => b.addEventListener('click', () => { SFX.tap && SFX.tap(); if (pickWorld(+b.dataset.w)) onPick(); }));
}""")
rep("  const n = nextLevel(); $('playSub').textContent = levelLocked(n) ? 'Sokak 2 paketi' : (n + 1) + '. bölüm · ' + LEVELS[n].name; dailyUI();",
    "  const n = nextLevel(); $('playSub').textContent = WORLDS[WIDX(n)].name + ' · ' + (levelLocked(n) ? 'paket gerekli' : (WLOC(n) + 1) + '. bölüm'); dailyUI(); worldCards('wpick', openHome);")
a = src.index("  LEVELS.forEach((L, i) => {\n    const paid = levelLocked(i)")
b = src.index("  $('grid').innerHTML = html;", a)
src = src[:a] + """  const wv = curWorld(); worldCards('wtabs', openLevels); $('lvWorld').textContent = WORLDS[wv].name + ' · ' + WORLDS[wv].sub;
  for (let i = wv * PER_WORLD; i < (wv + 1) * PER_WORLD; i++) {
    const L = LEVELS[i], li = WLOC(i), paid = levelLocked(i), open = !paid && (li === 0 || done(i - 1) || done(i)), sv = SAVE.lv[i] || {}, nxt = open && !done(i);
    if (li === 0) html += `<div class="sec"><b>1-10. BÖLÜMLER</b><span>ücretsiz</span></div>`;
    if (li === FREE_LEVELS) html += `<div class="sec"><b>11-20. BÖLÜMLER</b><span>${SAVE.pack2 ? 'açık' : 'paket'}</span></div>` + (SAVE.pack2 ? '' : `<button class="packbar" id="packBar"><b>Tüm dünyalarda 11-20. bölümler</b><span>Satın al · ${priceOf(PACK2)} ya da ${fmtN(PACK2.fe)} tüy</span></button>`) +
      (wv < WORLDS.length - 1 ? `<p class="wnote">${WORLDS[wv].name} 10. bölümü geçince <b>${WORLDS[wv + 1].name}</b> açılır.</p>` : '');
    html += `<button class="lv${open ? '' : ' lock'}${paid ? ' paid' : ''}${nxt ? ' next' : ''}" data-i="${i}" ${open || paid ? '' : 'disabled'}>
      <div class="num big">${open ? li + 1 : '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="10" width="14" height="11" rx="2" fill="#022753"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#022753" stroke-width="2.6" fill="none"/></svg>'}</div>
      <div class="info"><div class="nm">${L.name}${L.tut ? ' <i>ÖĞRETİCİ</i>' : ''}${L.g ? ' <i>AZ YERÇEKİMİ</i>' : ''}</div><div class="meta">Par ${L.par}${L.wind ? ' · rüzgâr' : ''}${sv.best && sv.best < 99 ? ' · en iyi ' + sv.best + ' atış' : ''}</div></div>
      <div class="st">${[0, 1, 2].map((k) => STAR(k < (sv.s || 0))).join('')}</div></button>`;
  }
""" + src[b:]
# end card: next stays inside the world; a new world opening gets a toast
rep("  const prev = SAVE.lv[cur] || {s: 0, best: 99};\n", "  const prev = SAVE.lv[cur] || {s: 0, best: 99}, newWorld = WLOC(cur) === FREE_LEVELS - 1 && WIDX(cur) < WORLDS.length - 1 && !prev.done;\n")
rep("SAVE.fe += fe; save(); feUI();\n  setTimeout(() => {", "SAVE.fe += fe; save(); feUI();\n  setTimeout(() => {\n    if (newWorld) setTimeout(() => toastShop(WORLDS[WIDX(cur) + 1].name + ' AÇILDI!', 'Yeni dünya seni bekliyor'), 900);")
rep("$('next').querySelector('b').textContent = cur + 1 < LEVELS.length ? 'SONRAKİ' : 'BÖLÜMLER';", "$('next').querySelector('b').textContent = WLOC(cur) < PER_WORLD - 1 ? 'SONRAKİ' : 'BÖLÜMLER';")
rep("if (cur + 1 < LEVELS.length) playLevel(cur + 1); else openLevels(); };", "if (WLOC(cur) < PER_WORLD - 1) playLevel(cur + 1); else openLevels(); };")
# the pack now opens 11-20 in all four worlds
rep("function levelLocked(i) { return i >= FREE_LEVELS && !SAVE.pack2; }", "function levelLocked(i) { return WLOC(i) >= FREE_LEVELS && !SAVE.pack2; }")
rep("const PACK2 = {id: 'atis_sokak2', price: '₺79,99', fe: 12000}", "const PACK2 = {id: 'atis_sokak2', price: '₺119,99', fe: 20000}")
rep("toastShop('Sokak 2 açıldı', '10 yeni bölüm seni bekliyor')", "toastShop('Bölüm paketi açıldı', '4 dünyada 40 yeni bölüm')")
rep('<div class="nm">Sokak 2 paketi<small>11-20. bölümler · ya da', '<div class="nm">Bölüm paketi<small>4 dünyada 11-20. bölümler · ya da')
rep('<div class="pv big">20</div><div class="nm">Bölüm', '<div class="pv big">40</div><div class="nm">Bölüm')
rep("""  dlg('SOKAK 2 · ÇARŞI', '10 YENİ BÖLÜM', `<p>Köprüler, çatı katları, ters rüzgâr, pazar labirenti ve <b>Büyük Final</b>. Hepsi ilk 10 bölümden daha zor.</p>`,
    [{t: 'Satın al · ' + priceOf(PACK2), c: 'ok', f: () => buyProduct({...PACK2, title: 'Sokak 2 paketi'})},""",
"""  dlg('BÖLÜM PAKETİ', '40 YENİ BÖLÜM', `<p>Sokak, Amerika, Avrupa ve Uzay'da <b>11-20. bölümler</b>. Köprüler, ters rüzgâr, uzun yollar ve her dünyanın <b>finali</b>. Hepsi ilk 10 bölümden daha zor.</p>`,
    [{t: 'Satın al · ' + priceOf(PACK2), c: 'ok', f: () => buyProduct({...PACK2, title: 'Bölüm paketi'})},""")
rep("window.__A = {", "window.__A = {WORLDS, worldOpen, curWorld, nextLevel, playLevel, ")
open('game6.js', 'w').write(src); print('ok', len(src))
src = open('game6.js').read()
rep("rt = roofTex.clone(); rt.needsUpdate = true;", "rt = themeRoof(CUR_THEME).clone(); rt.needsUpdate = true;")
rep("  if (P.chim) { const cx = (P.x0 + P.x1) / 2 + 0.3, cz = (P.z0 + P.z1) / 2; addBox(g, std(0xc0603e, 0.9), cx - 0.25, cx + 0.25, base + h, base + h + 0.9, cz - 0.25, cz + 0.25, false); }",
    "  if (P.chim || CUR_THEME === 'amerika' && srnd(0, 1) > 0.4) roofBits(g, P, base, h);")
rep("const cm = std(0xf4eee2, 0.8), T = 0.16;", "const cm = std(CUR_THEME === 'uzay' ? 0x8a94a6 : CUR_THEME === 'amerika' ? 0xb8a890 : 0xf4eee2, 0.8), T = 0.16;")
open('game6.js', 'w').write(src); print('ok2')
src = open('game6.js').read()
# a FLIX resting on the bucket rim gets put down next to it
rep("if (bd < 1.75 && Math.abs(p.y - RAD - bucket.y) < 0.6) {", "if (bd < 1.75 && (Math.abs(p.y - RAD - bucket.y) < 0.6 || bd < 1.1)) { if (bd < 1.1) p.y = bucket.y + RAD + 0.01;")
open('game6.js', 'w').write(src); print('ok3')
src = open('game6.js').read()
# low gravity: the softest shot stays as short as on earth so chips into the bucket still work
rep("function launchVel(ang, pow) { const v = VMIN + pow * (VMAX - VMIN),", "function launchVel(ang, pow) { const gs = Math.sqrt(((LV && LV.g) || G) / G), v = VMIN * gs + pow * (VMAX - VMIN * gs),")
open('game6.js', 'w').write(src); print('ok4')
