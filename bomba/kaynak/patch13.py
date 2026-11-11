s=open('shell_v12.html').read()
def RS(old,new,n=1):
    global s
    assert s.count(old)==n,(old[:60],s.count(old)); s=s.replace(old,new)
RS('</style>',open('css13.css').read()+'</style>')
RS('<div class="top"><img alt="FLIX" src="@@LOGO@@"><div class="word">BOMBA</div></div>',
   '<div id="fz"></div><div class="links"><button id="howBtn">❓ <span data-en="How to play">Nasıl oynanır</span></button><button id="setBtn">⚙ <span data-en="Settings">Ayarlar</span></button><button data-flixlegal="legal">📄 <span data-en="Legal">Yasal</span></button></div>\n  <div class="top"><img alt="FLIX" src="@@LOGO@@"><div class="word">'+''.join('<span style="--i:%d">%s</span>'%(i,c) for i,c in enumerate('BOMBA'))+'</div></div>')
RS('  <div class="links"><button id="howBtn" data-en="How to play?">Nasıl oynanır?</button><button id="setBtn" data-en="Settings">Ayarlar</button><button data-flixlegal="legal" data-en="Legal">Yasal Bilgiler</button></div>\n','')
RS('<div id="cName"></div><div id="cTag"></div></div>','<div id="cName"></div><div id="cTag"></div></div>')
a=s.index('<div id="how" class="sheet" hidden>'); b=s.index('<div id="settings" class="sheet" hidden>')
s=s[:a]+'<div id="how" class="sheet" hidden><div class="in"><button class="xbtn" data-close="how" aria-label="Kapat">✕</button><h2 id="howT"></h2><div id="howB"></div><div id="howDots"></div><div class="row"><button class="ghost" id="howPrev" style="flex:1"></button><button class="big" id="howNext" style="flex:1.4"></button></div></div></div>\n'+s[b:]
RS('<div id="levels" class="sheet" hidden><div class="in"><h2 id="lvTitle"></h2><div id="lvGrid"></div>','<div id="levels" class="sheet" hidden><div class="in"><h2 id="lvTitle"></h2><div id="lvTabs"></div><p id="lvInfo" style="text-align:center"></p><div id="lvGrid"></div><div id="lvLock" class="col" hidden><p id="lvLockT" style="text-align:center"></p><button class="big buy" id="lvBuy"></button></div>')
RS('<h2 id="resT"></h2><p id="resS"','<h2 id="resT"></h2><div id="resStars" hidden></div><p id="resS"')
RS('<h2 id="vsT"></h2><div id="vsGrid"></div>','<h2 id="vsT"></h2><div id="vsGrid"></div><p id="vsMap"></p>')
RS('<div id="shop" class="sheet" hidden>','<div id="skins" class="sheet" hidden><div class="in"><div class="hd"><h2 id="skT"></h2><span id="skTuy"></span></div><div id="skBig"></div><div id="skGrid"></div><button class="big" id="skGo"></button><button class="ghost" data-close="skins" data-en="Close">Kapat</button></div></div>\n<div id="shop" class="sheet" hidden>')
RS('<div class="card">\n    <div class="who">','<div class="card"><button id="skinBtn" class="pill"></button>\n    <div class="who">')
open('shell.html','w').write(s)

g=open('game_v12.js').read()
def R(old,new,n=1):
    global g
    assert g.count(old)==n,(old[:70],g.count(old)); g=g.replace(old,new)
R("const VERSION = '1.2';","const VERSION = '1.4.1';")
R("if (SV.lang !== 'tr' && SV.lang !== 'en')","const PER = 25;\n{ const d = { st: null, wOwn: [0], sk: {}, skOwn: {}, lastW: 0 }; for (const k in d) if (SV[k] === undefined || SV[k] === null) SV[k] = d[k]; }\nif (!SV.st) { SV.st = {}; for (let i = 1; i <= Math.min(PER, SV.mac || 0); i++) SV.st[i] = 2; }\nfor (const c of CHARS) { if (!Array.isArray(SV.skOwn[c.id])) SV.skOwn[c.id] = [0]; if (!(SV.sk[c.id] >= 0)) SV.sk[c.id] = 0; }\nif (SV.lang !== 'tr' && SV.lang !== 'en')")
R("const myPf = () => ({ n: SV.name, lv: myLv(), av: SV.av });","const myPf = () => ({ n: SV.name, lv: myLv(), av: SV.av, sk: SV.sk[SV.char] | 0 });")
R("av: normAv({ f: a[0], bg: a[1], fr: a[2], st: a[3] }) }; }","av: normAv({ f: a[0], bg: a[1], fr: a[2], st: a[3] }), sk: p.k >= 0 && p.k < 8 ? p.k | 0 : 0 }; }")
R("return { c, n: nm, lv, dn: lv <= 3 ? 0 : lv <= 9 ? 1 : 2,","return { c, n: nm, lv, sk: rndI(lv < 4 ? 3 : lv < 10 ? 5 : 8), dn: lv <= 3 ? 0 : lv <= 9 ? 1 : 2,")
R("pf() { return { n: SV.name, lv: myLv(), a: [SV.av.f, SV.av.bg, SV.av.fr, SV.av.st] }; },","pf() { return { n: SV.name, lv: myLv(), k: SV.sk[SV.char] | 0, a: [SV.av.f, SV.av.bg, SV.av.fr, SV.av.st] }; },")
# matchmaking shows the map
R("function mmStart(kind) { Object.assign(MM, { on: true, t: 0, kind,","function mmStart(kind) { MM.th = rndI(THEMES.length); Object.assign(MM, { on: true, t: 0, kind,")
R("$('vsX').style.visibility = MM.go > 0 ? 'hidden' : 'visible';","$('vsX').style.visibility = MM.go > 0 ? 'hidden' : 'visible'; $('vsMap').innerHTML = MM.bots && MM.go > 0 ? '<b>' + thName(THEMES[MM.th]) + '</b> · ' + T(THEMES[MM.th].fxT[0], THEMES[MM.th].fxT[1]) : '';")
R("mmStop(); startGame('arena', { bots, quick });","mmStop(); startGame('arena', { bots, quick, th: MM.th });")
# scene
R("const { scene, sun } = buildScene(renderer);\nconst island = buildIsland(scene);\nconst blocks = Blocks(scene),","const { scene, sun, hemi } = buildScene(renderer);\nconst island = buildIsland(scene, hemi, sun);\nconst blocks = Blocks(scene); blocks.setTheme(0);\nconst parts = Particles(scene), blasts = Blasts(scene), _unused = [")
g=g.replace("_unused = [ parts = Particles(scene), blasts = Blasts(scene);","_unused = 0;")
assert "_unused = [" not in g, g[g.index("_unused"):g.index("_unused")+120]
R("new THREE.MeshBasicMaterial({ map: island.water })","new THREE.MeshBasicMaterial({ map: island.water0 })")
R("  const pu = makePowerup('range'); pu.position.set(1.0, 0, 0.55); stage.add(pu); stage.userData.pu = pu;\n}",
  "  const pu = makePowerup('range'); pu.position.set(1.0, 0, 0.55); stage.add(pu); stage.userData.pu = pu;\n  const orb = new THREE.Group(); stage.add(orb); stage.userData.orb = orb; ['bomb', 'speed', 'kick', 'vest', 'full'].forEach((t, i) => { const m = makePowerup(t), a = i / 5 * TAU; m.position.set(Math.cos(a) * 1.95, -0.25, Math.sin(a) * 1.95); m.scale.setScalar(0.6); m.children[1].visible = false; orb.add(m); });\n  const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }); stage.userData.clouds = []; for (let i = 0; i < 6; i++) { const c = new THREE.Group(); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(sphG(0.5, 14, 10), cm); m.position.set((k - 1) * 0.55, k === 1 ? 0.18 : 0, 0); m.scale.set(1.2, k === 1 ? 0.9 : 0.65, 0.8); c.add(m); } c.position.set(-9 + i * 3.6, 2.6 + (i % 3) * 1.1, -6 - (i % 2) * 3); c.scale.setScalar(0.8 + (i % 3) * 0.3); stage.add(c); stage.userData.clouds.push(c); }\n}")
R("function showStageChar(id) {\n  for (const k in stageChars) stageChars[k].g.visible = false;\n  if (!stageChars[id]) { const P = makeChar(id); stage.add(P.g); stageChars[id] = P; }\n  stageCur = stageChars[id];",
  "function showStageChar(cid, sk) {\n  const id = cid + ':' + (sk | 0); stageKey = id; for (const k in stageChars) stageChars[k].g.visible = false;\n  if (!stageChars[id]) { const P = makeChar(cid, sk | 0); stage.add(P.g); stageChars[id] = P; }\n  stageCur = stageChars[id];")
R("P = makeChar(ch.id), g = new THREE.Group();","P = makeChar(ch.id, pf && pf.sk | 0), g = new THREE.Group();")
R("return { nm: (pf && pf.n) || ch.name,","return { sk: pf && pf.sk | 0, nm: (pf && pf.n) || ch.name,")
R("G.view = null; adScreen('game'); G.round = 1;","G.view = null; adScreen('game'); if (mode === 'arena' && !(G.opt.th >= 0)) G.opt.th = rndI(THEMES.length); if (mode === 'macera') { SV.lastW = G.opt.world | 0; } G.round = 1;")
R("  const m = G.mode, me = G.players[0];\n  if (m === 'arena') {","  const m = G.mode, me = G.players[0]; setTheme(m === 'arena' ? G.opt.th : m === 'online' ? NET.seed % THEMES.length : m === 'macera' ? G.opt.world : 0);\n  if (m === 'arena') {")
R("m === 'macera' ? T('Canavarları patlat, kapıyı bul', 'Blast the monsters, find the door') : m === 'bulmaca' ? T(G.bLeft + ' bombayla altın kasaları patlat', 'Blow up the gold crates with ' + G.bLeft + ' bombs') : cx(me.ch, 'name') + T(' sensin', ' is you'), 1.5);",
  "m === 'macera' ? T('Canavarları patlat, kapıyı bul', 'Blast the monsters, find the door') : m === 'bulmaca' ? T(G.bLeft + ' bombayla altın kasaları patlat', 'Blow up the gold crates with ' + G.bLeft + ' bombs') : thName(G.th), 1.5);")
R("banner(T('BAŞLA!', 'GO!'), '', 0.7); }","banner(T('BAŞLA!', 'GO!'), '', 0.7); if (G.th !== THEMES[0] && G.mode !== 'bulmaca' && G.round <= 1) toast(G.th.icon + ' ' + T(G.th.fxT[0], G.th.fxT[1])); }")
# macera worlds
R("function setupMacera(L) {\n  const rng = (G.rng = mkRng(4000 + L * 131)), me = G.players[0], sp = [[0, ROWS - 1]];",
  "function setupMacera(L0) {\n  const wd = G.opt.world | 0, L = (G.eff = Math.round(L0 * 0.6 + wd * 1.5)), rng = (G.rng = mkRng(4000 + (wd * PER + L0) * 131)), me = G.players[0], sp = [[0, ROWS - 1]];")
R("G.time = L > 10 ? 240 : 180;","G.time = G.timeMax = L > 10 ? 240 : 180;")
R("$('infoA').textContent = T('Macera · Bölüm ', 'Adventure · Level ') + G.opt.level;","$('infoA').textContent = thName(G.th) + ' · ' + G.opt.level + '/' + PER;")
# theme effects
R("const b = { x, y, fuse: FUSE, range: p.range, owner: p,","const b = { x, y, fuse: FUSE + (G.mode === 'bulmaca' ? 0 : G.fx.fuse || 0), range: Math.min(8, p.range + (G.mode === 'bulmaca' ? 0 : G.fx.rng || 0)), owner: p,")
R("blasts.add(c[0], c[1], (c[2] || 0) * 0.03, FLAME + 0.12); G.flames.set(k, Math.max(G.flames.get(k) || 0, FLAME));","blasts.add(c[0], c[1], (c[2] || 0) * 0.03, FLAME + (G.fx.flame || 0) + 0.12); G.flames.set(k, Math.max(G.flames.get(k) || 0, FLAME + (G.fx.flame || 0)));")
R("[0xf0582a, 0xde4a20, 0xff7a3d, 0x7ed334], 12, 3, 0.16, 4.5, 0.9);","G.th.pc, 12, 3, 0.16, 4.5, 0.9);")
R("G.pending.push({ x: c[0], y: c[1], t: FLAME + 0.02, type: t });","G.pending.push({ x: c[0], y: c[1], t: FLAME + (G.fx.flame || 0) + 0.02, type: t });")
R("const m = axisMove(p, ix, iy, cap === undefined ? p.speed * dt : Math.min(cap, p.speed * dt));","const sp = p.speed * (G.fx.spd || 1) * dt, m = axisMove(p, ix, iy, cap === undefined ? sp : Math.min(cap, sp));")
R("const D2 = dangerMap({ x, y, fuse: FUSE, range: p.range })","const D2 = dangerMap({ x, y, fuse: FUSE, range: p.range + (G.fx.rng || 0) })")
# ui replacements
a=g.index('function showResult() {'); b=g.index('function endMatch(top) {'); g=g[:a]+g[b:]
a=g.index('function renderHome() {'); b=g.index('// profile + avatar customisation'); g=g[:a]+g[b:]
R("showStageChar(top.ch.id); G.stageWin = true;","showStageChar(top.ch.id, top.sk); G.stageWin = true;")
R("function toMenu() { G.state = 'menu'; G.stageWin = false;","function toMenu() { setTheme(0); G.state = 'menu'; G.stageWin = false;")
R("[(SV.mac || 0) + '/' + MAC_LEVELS, T('Macera', 'Adventure')]","[macDone() + '/' + PER * THEMES.length, T('Macera', 'Adventure')]")
R("const m = $('lvGrid').dataset.m, level = +b.dataset.l; tip(m, () => startGame(m, { level }));","const m = $('lvGrid').dataset.m, level = +b.dataset.l; tip(m, () => startGame(m, { level, world: lvW }));")
R("$('howBtn').addEventListener('click', () => sheet('how', true)); $('setBtn')","$('setBtn')")
R("// ---------- loop ----------",open('ui13.js').read()+"// ---------- loop ----------")
R("island.water.offset.x = G.t * 0.012; island.water.offset.y = G.t * 0.008;","island.water.offset.x = island.water0.offset.x = G.t * 0.012; island.water.offset.y = island.water0.offset.y = G.t * 0.008;")
R("animChar(stageCur, dt, { t: G.t, move: 0, win: !!G.stageWin });","animChar(stageCur, dt, { t: G.t, move: 0, win: !!G.stageWin || G.t % 6 > 5.1 }); const ud = stage.userData; ud.orb.rotation.y = G.t * 0.55; ud.orb.children.forEach((m, i) => { m.userData.s.position.y = 0.5 + Math.sin(G.t * 2.4 + i * 1.3) * 0.16; m.userData.s.rotation.y = -G.t * 0.55 + Math.sin(G.t * 1.6 + i) * 0.4; }); for (const c of ud.clouds) { c.position.x += dt * 0.22; if (c.position.x > 11) c.position.x = -11; }")
R("makePortraits(); fitCamera(); applyLang();","setTheme(0); makePortraits(); fitCamera(); applyLang(); { const F = ['🪶', '🪶', '🪶', '✨', '🪶', '💣', '🪶', '⭐']; $('fz').innerHTML = F.map((c, i) => '<i style=\"left:' + (4 + i * 12.5) + '%;animation-duration:' + (9 + (i * 5) % 7) + 's;animation-delay:-' + (i * 2.3) + 's;font-size:' + (15 + (i * 7) % 11) + 'px\">' + c + '</i>').join(''); }")
R("window.__fb = { MM,","window.__fb = { setTheme, THEMES, SKINS, portrait, renderSkins, openLevels, save, MM,")
R("far = h > w ? 13 : 8.6;","far = h > w ? 15.5 : 8.6;")
R("camLook.set(STAGE.x + ox, h > w ? 0.2 : 0.95, 0);","camLook.set(STAGE.x + ox, h > w ? 0.75 : 0.95, 0);")
# v1.3.1: livelier music (music.js reworked: faster tracks, arpeggio, bouncing bass)
R("volume: kind === 'menu' ? 0.16 : 0.22, menu: kind === 'menu', track: 'Rainbow Drift', intensity: kind === 'menu' ? 0 : 0.5 });","volume: kind === 'menu' ? 0.18 : 0.22, menu: kind === 'menu', track: ['Turbo Circuit', 'Rainbow Drift', 'Star Sprint', 'Neon Nights'][Math.floor(Math.random() * 4)], intensity: kind === 'menu' ? 0.45 : 0.75 });")
R("      G.time -= dt; if (G.time <= 0) {","      G.time -= dt; if (AUD.mus && AUD.mus.setIntensity) AUD.mus.setIntensity(G.time < 30 ? 1 : 0.75); if (G.time <= 0) {")
# v1.4: iOS app / App Store pass
R("let lastRewardAt = 0;","let lastRewardAt = 0;\nconst hasAds = () => !!window.FlixAds || !NATIVE, hasIap = () => !NATIVE || !!(window.FlixNative && window.FlixNative.buy);\nfunction gate() { const c = document.documentElement.classList; c.toggle('app', NATIVE); c.toggle('xad', !hasAds()); c.toggle('xon', NATIVE); }\ngate(); setTimeout(gate, 1200); setTimeout(gate, 4000);\ndocument.addEventListener('gesturestart', (e) => e.preventDefault()); document.addEventListener('dblclick', (e) => e.preventDefault());")
R("  let h = '<button class=\"prow\" data-s=\"ad\"' + (left > 0 ? '' : ' disabled')","  gate(); let h = !hasAds() ? '' : '<button class=\"prow\" data-s=\"ad\"' + (left > 0 ? '' : ' disabled')")
R("  PACKS.forEach((p, i) => { h += ","  if (hasIap()) PACKS.forEach((p, i) => { h += ")
R("  h += '<button class=\"prow\" data-s=\"noads\"'","  if (hasIap() && (!NATIVE || window.FlixAds)) h += '<button class=\"prow\" data-s=\"noads\"'")
R("  if (NATIVE) h += '<button class=\"prow\" data-s=\"rest\">","  if (NATIVE && hasIap() && window.FlixNative.restore) h += '<button class=\"prow\" data-s=\"rest\">")
R("  $('shopRows').innerHTML = h;\n}","  if (!h) h = '<p style=\"text-align:center;margin:6px 0\">' + T('Tüy kazanmak için maç oyna, bölümleri geç ve günlük ödülünü topla.', 'Play matches, clear levels and collect your daily reward to earn feathers.') + '</p>';\n  $('shopRows').innerHTML = h;\n}")
open('game.js','w').write(g)
b=open('build.py').read().replace("VER='1.2'","VER='1.4.1'"); open('build.py','w').write(b)
print('ok',len(g))
