import sys
src = open('game6.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:100]))
    src = src.replace(old, new)

# ---- modules: 9 worlds, their looks, roadside details, landmarks, more animals ----
rep(open('theme6.js').read(), open('theme7.js').read())
rep(open('worlds6.js').read(), open('worlds7.js').read() + '\n' + open('deco7.js').read())
rep("function mkLevel(i, def) { seed = 101 + i * 13; CUR_THEME = def.theme || 'sokak'; const L = {islands: [], props: [], actors: [], feathers: [], wind: 0, ...def}; def.build(L); return L; }",
    "function mkLevel(i, def) { seed = 101 + (def.seedI !== undefined ? def.seedI : i) * 13; CUR_THEME = def.theme || 'sokak'; const L = {islands: [], props: [], actors: [], feathers: [], wind: 0, ...def}; def.build(L); L.deco = genDeco(L, CUR_THEME); return L; }")
rep("world = new THREE.Group(); scene.add(world); seed = 11 + i * 7; CUR_THEME = LV.theme || 'sokak';",
    "world = new THREE.Group(); scene.add(world); seed = 11 + (LV.seedI !== undefined ? LV.seedI : i) * 7; CUR_THEME = LV.theme || 'sokak'; FLAGS.length = 0; SPIN.length = 0;")
rep("  spawnActors(LV);\n}", "  spawnActors(LV);\n  { const dg = new THREE.Group(); world.add(dg); for (const D of LV.deco || []) decoProp(D, dg); { const lg = new THREE.Group(); lg.position.set((bb.x0 + bb.x1) / 2, -1.2, bb.z0 - 30); lg.scale.setScalar(1.9); dg.add(lg); landmark(CUR_THEME, {x0: 0, x1: 0, z0: 14, z1: 14}, lg); } ink(dg, 0.022); }\n}")
rep("  const B = P.body;\n", "  const B = P.body;\n  if (world && world.visible) { flagsTick(T); for (const s of SPIN) s.rotation.z += dt * s.userData.spin; }\n", 1)
rep("    const n = A.t === 'pigeons' ? (A.n || 4) : 1;", "    if (A.t === 'pigeons' && CUR_THEME === 'antarktika') continue;\n    const n = A.t === 'pigeons' ? (A.n || 4) : 1;")

# ---- local animals and the new animal skins ----
rep("if (!o.aniSkin && CUR_THEME === 'uzay' && AS.id === 'normal') { pick([0]); return makeAlien(); }",
    "if (!o.aniSkin && AS.id === 'normal' && (CUR_THEME === 'uzay' || LOCAL_ANI[CUR_THEME])) { pick([0]); return CUR_THEME === 'uzay' ? makeAlien() : makeCreature(LOCAL_ANI[CUR_THEME], 'cat'); }")
rep("if (CUR_THEME === 'uzay' && AS.id === 'normal') { pick([0]); return makeAlien(); }",
    "if (AS.id === 'normal' && (CUR_THEME === 'uzay' || LOCAL_ANI[CUR_THEME])) { pick([0]); return CUR_THEME === 'uzay' ? makeAlien() : makeCreature(LOCAL_ANI[CUR_THEME], 'dog'); }")
rep("function makeCreature(id, kind) {\n", "function makeCreature(id, kind) {\n  if (NEW_ANI.includes(id)) return makeCreature2(id, kind);\n")
rep("(CUR_THEME === 'uzay' && aniSkin().id === 'normal' ? ['Bip bop!', 'Zıırt!', 'Merhaba dünyalı!', 'Gılgıl?'] : aniSkin().say)",
    "(aniSkin().id === 'normal' ? (CUR_THEME === 'uzay' ? ['Bip bop!', 'Zıırt!', 'Merhaba dünyalı!', 'Gılgıl?'] : LOCAL_ANI[CUR_THEME] ? aniSkin(LOCAL_ANI[CUR_THEME]).say : null) : aniSkin().say)")
rep("  {id: 'tavuk', name: 'Tavuk', price: 3500, say: ['GIDAAK!', 'Bık bık!', 'GIT GIT!']},\n];",
"""  {id: 'tavuk', name: 'Tavuk', price: 3500, say: ['GIDAAK!', 'Bık bık!', 'GIT GIT!']},
  {id: 'tavsan', name: 'Tavşan', price: 400, say: ['Hop!', 'Havuç?', 'Zıp zıp!']},
  {id: 'ordek', name: 'Ördek', price: 600, say: ['Vak!', 'Vak vak vak!', 'Gık?']},
  {id: 'kurbaga', name: 'Kurbağa', price: 900, say: ['Vırak!', 'Zıpla!', 'Vrrak?']},
  {id: 'tilki', name: 'Tilki', price: 1800, say: ['Hihi!', 'Kurnazım!', 'Yakala beni!']},
  {id: 'koala', name: 'Koala', price: 2200, say: ['Uykum var...', 'Mmm!', 'Okaliptüs?']},
  {id: 'kanguru', name: 'Kanguru', price: 3000, say: ['Hop hop!', 'Kesemde yer var!', 'Boks?']},
  {id: 'zurafa', name: 'Zürafa', price: 5000, say: ['Yukarısı güzel!', 'Mmm yaprak!', 'Hı?']},
];""")
rep("""  {id: 'kahraman', name: 'Süper Kahraman', price: 4000, cloth: 0x1f6fd1, pants: 0x1f6fd1, shoe: 0xe22511, cape: 0xe22511},
];""", """  {id: 'kahraman', name: 'Süper Kahraman', price: 4000, cloth: 0x1f6fd1, pants: 0x1f6fd1, shoe: 0xe22511, cape: 0xe22511},
  {id: 'polis', name: 'Polis', price: 500, cloth: 0x1f3f7a, pants: 0x1b2440, shoe: 0x111111, hat: 'cap'},
  {id: 'doktor', name: 'Doktor', price: 700, cloth: 0xf8f8f8, pants: 0x3a8ab0, shoe: 0xf4f4f4, hat: 'doc'},
  {id: 'itfaiye', name: 'İtfaiyeci', price: 1000, cloth: 0xc8302a, pants: 0x2a2a2e, shoe: 0x111111, hat: 'fire'},
  {id: 'kovboy', name: 'Kovboy', price: 1500, cloth: 0xc8743a, pants: 0x2a4a7a, shoe: 0x5a3a22, hat: 'cowboy'},
  {id: 'palyaco', name: 'Palyaço', price: 2000, cloth: 0xffc20e, pants: 0x1f6fd1, shoe: 0xe22511, hat: 'clown'},
  {id: 'ninja', name: 'Ninja', price: 3000, cloth: 0x1b1b22, pants: 0x1b1b22, shoe: 0x1b1b22, hat: 'ninja'},
  {id: 'kral', name: 'Kral', price: 6000, cloth: 0x7a2a9a, pants: 0x3a1a4a, shoe: 0xffc20e, hat: 'crown', cape: 0xc8102e},
];""")
rep("  if (NS.id === 'futbolcu') {", """  if (NS.hat === 'cap') { part(CYL, std(0x1f3f7a, 0.6), 0.2, 0.08, 0.2, 0, 0.14, 0, m.head); part(CYL, std(0x1b2440, 0.6), 0.24, 0.02, 0.24, 0, 0.1, 0.04, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.06, 0.05, 0.02, 0, 0.15, 0.2, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.07, 0.08, 0.02, -0.07, 1.2, 0.155, m.body); }
  if (NS.hat === 'doc') { part(BOX, std(0xf8f8f8, 0.8), 0.36, 0.5, 0.3, 0, 0.8, 0, m.body); const st = part(new THREE.TorusGeometry(1, 0.15, 6, 16, Math.PI), std(0x333333, 0.4), 0.09, 0.12, 0.09, 0, 1.12, 0.15, m.body); st.rotation.z = Math.PI; part(SPH, std(0xbbbbbb, 0.3, 0.6), 0.03, 0.03, 0.03, 0.02, 0.98, 0.16, m.body); }
  if (NS.hat === 'fire') { part(SPH, std(0xc8302a, 0.4), 0.2, 0.13, 0.22, 0, 0.12, 0.01, m.head); part(CYL, std(0xc8302a, 0.4), 0.26, 0.02, 0.28, 0, 0.06, -0.02, m.head); part(BOX, std(0xffc20e, 0.3, 0.6), 0.08, 0.07, 0.02, 0, 0.16, 0.21, m.head); part(BOX, std(0xffe14a, 0.5), 0.38, 0.05, 0.25, 0, 0.75, 0, m.body); }
  if (NS.hat === 'cowboy') { part(CYL, std(0x8a5a2a, 0.8), 0.33, 0.02, 0.33, 0, 0.12, 0, m.head); part(CYL, std(0x8a5a2a, 0.8), 0.15, 0.14, 0.15, 0, 0.2, 0, m.head); part(CYL, std(0x3a2a1a, 0.8), 0.155, 0.03, 0.155, 0, 0.15, 0, m.head); part(BOX, std(0xe22511, 0.8), 0.2, 0.06, 0.2, 0, 1.25, 0.05, m.body); }
  if (NS.hat === 'clown') { part(SPH, std(0xe22511, 0.4), 0.04, 0.04, 0.04, 0, 0, 0.17, m.head); for (const [sx, c] of [[-1, 0xff2bd6], [1, 0x2fa84f]]) part(SPH, std(c, 0.9), 0.1, 0.1, 0.1, sx * 0.13, 0.08, -0.02, m.head); part(CYL, std(0xffffff, 0.8), 0.16, 0.05, 0.16, 0, 1.32, 0, m.body); for (let i = 0; i < 3; i++) part(SPH, std([0xe22511, 0x1f6fd1, 0x2fa84f][i], 0.6), 0.04, 0.04, 0.03, 0, 1.12 - i * 0.12, 0.155, m.body); }
  if (NS.hat === 'ninja') { part(SPH, std(0x1b1b22, 0.8), 0.175, 0.17, 0.17, 0, 0.01, 0, m.head); part(BOX, std(0xf1c7a0, 0.7), 0.2, 0.05, 0.03, 0, 0.03, 0.155, m.head); part(CYL, std(0xc8102e, 0.7), 0.18, 0.03, 0.18, 0, 0.1, 0, m.head); const t = part(BOX, std(0xc8102e, 0.7), 0.03, 0.18, 0.02, 0.04, 0.02, -0.18, m.head); t.rotation.z = 0.4; part(BOX, std(0xc8102e, 0.7), 0.38, 0.05, 0.27, 0, 0.78, 0, m.body); }
  if (NS.hat === 'crown') { const gd = std(0xffc20e, 0.25, 0.7); part(CYL, gd, 0.15, 0.08, 0.15, 0, 0.17, 0, m.head); for (let i = 0; i < 5; i++) { const a = i * 1.257; part(new THREE.ConeGeometry(1, 1, 4), gd, 0.03, 0.08, 0.03, Math.sin(a) * 0.14, 0.25, Math.cos(a) * 0.14, m.head); } part(SPH, std(0xc8102e, 0.2), 0.025, 0.025, 0.02, 0, 0.18, 0.15, m.head); }
  if (NS.id === 'futbolcu') {""")
# shop icons for the new people and animals
rep("""S.hat === 'helmet' ? '<circle cx="30" cy="13" r="11" fill="rgba(191,230,255,.55)"/>' :""",
    """S.hat === 'helmet' ? '<circle cx="30" cy="13" r="11" fill="rgba(191,230,255,.55)"/>' : S.hat === 'cap' ? '<path d="M21 9 Q30 2 39 9 L41 11 L19 11z" fill="#1f3f7a"/><rect x="28" y="5" width="4" height="3" fill="#ffc20e" stroke="none"/>' : S.hat === 'doc' ? '<path d="M22 11 Q30 1 38 11z" fill="#5a3a22"/><path d="M24 24 Q30 34 36 24" fill="none"/>' : S.hat === 'fire' ? '<path d="M20 11 Q30 0 40 11 L42 13 L18 13z" fill="#c8302a"/>' : S.hat === 'cowboy' ? '<path d="M16 9 L44 9 L44 11 L16 11z M23 9 Q24 0 30 2 Q36 0 37 9z" fill="#8a5a2a"/>' : S.hat === 'clown' ? '<circle cx="21" cy="10" r="5" fill="#ff2bd6"/><circle cx="39" cy="10" r="5" fill="#2fa84f"/><circle cx="30" cy="14" r="2.4" fill="#e22511"/>' : S.hat === 'ninja' ? '<circle cx="30" cy="13" r="8.5" fill="#1b1b22"/><rect x="23" y="11" width="14" height="4" fill="#f1c7a0" stroke="none"/><path d="M21 8 L39 8" stroke="#c8102e" stroke-width="2.6"/>' : S.hat === 'crown' ? '<path d="M22 8 L22 1 L26 5 L30 0 L34 5 L38 1 L38 8z" fill="#ffc20e"/>' :""")
rep("tavuk: ['#f8f6ee', '#e22511']};", "tavuk: ['#f8f6ee', '#e22511'], tavsan: ['#f4f0ec', '#ffb0c0'], ordek: ['#ffd21a', '#ff8a1a'], kurbaga: ['#5ac83a', '#d8f0a0'], tilki: ['#e8701a', '#f8f4ee'], koala: ['#9aa0a8', '#f0eeea'], kanguru: ['#c8844a', '#f0d8b0'], zurafa: ['#f0c060', '#9a5a2a']};")
rep(""": S.id === 'normal' ? '<path d="M20 24 l3 -10 l6 7z M40 24 l-3 -10 l-6 7z" fill="#f0912e"/>' : '';""",
    """: S.id === 'normal' ? '<path d="M20 24 l3 -10 l6 7z M40 24 l-3 -10 l-6 7z" fill="#f0912e"/>' : S.id === 'tavsan' ? '<ellipse cx="25" cy="10" rx="3.5" ry="10" fill="#f4f0ec"/><ellipse cx="35" cy="10" rx="3.5" ry="10" fill="#f4f0ec"/>' : S.id === 'tilki' ? '<path d="M20 24 l2 -12 l7 8z M40 24 l-2 -12 l-7 8z" fill="#e8701a"/>' : S.id === 'koala' ? '<circle cx="18" cy="22" r="7" fill="#9aa0a8"/><circle cx="42" cy="22" r="7" fill="#9aa0a8"/>' : S.id === 'kanguru' ? '<path d="M24 20 l1 -12 l4 10z M36 20 l-1 -12 l-4 10z" fill="#c8844a"/>' : S.id === 'zurafa' ? '<path d="M26 18 l0 -8 M34 18 l0 -8" stroke-width="3"/><circle cx="26" cy="9" r="2.4" fill="#9a5a2a"/><circle cx="34" cy="9" r="2.4" fill="#9a5a2a"/>' : S.id === 'kurbaga' ? '<circle cx="23" cy="20" r="6" fill="#5ac83a"/><circle cx="37" cy="20" r="6" fill="#5ac83a"/><circle cx="23" cy="20" r="2.5" fill="#fff"/><circle cx="37" cy="20" r="2.5" fill="#fff"/>' : '';""")
rep("""S.id === 'penguen' || S.id === 'tavuk' ? '<path d="M27 30 l3 5 l3 -5z" fill="#ffb01a"/>' : ''""", """S.id === 'penguen' || S.id === 'tavuk' || S.id === 'ordek' ? '<path d="M27 30 l3 5 l3 -5z" fill="#ffb01a"/>' : S.id === 'zurafa' ? '<circle cx="22" cy="44" r="3" fill="#9a5a2a"/><circle cx="36" cy="49" r="3.5" fill="#9a5a2a"/><circle cx="40" cy="40" r="2.5" fill="#9a5a2a"/>' : ''""")
# ten more FLIX costumes
rep("""  {id: 'ejder', name: 'Ejderha', price: 8000, body: 0x2a0d0d, fe: [0xff3a00, 0xffc20e, 0xff3a00], metal: 0.3, glow: 0.9},
];""", """  {id: 'ejder', name: 'Ejderha', price: 8000, body: 0x2a0d0d, fe: [0xff3a00, 0xffc20e, 0xff3a00], metal: 0.3, glow: 0.9},
  {id: 'nane', name: 'Nane', price: 250, body: 0x6ad8b0, fe: [0xffffff, 0x2fa87a, 0xb8f4e0]},
  {id: 'kiraz', name: 'Kiraz', price: 350, body: 0xb8102e, fe: [0x2f8a3a, 0xe8203a, 0x2f8a3a]},
  {id: 'karpuz', name: 'Karpuz', price: 500, body: 0x2f8a3a, fe: [0xff4a5a, 0x1b1330, 0xff4a5a]},
  {id: 'ari', name: 'Bal Arısı', price: 800, body: 0xffc20e, fe: [0x1b1330, 0xffffff, 0x1b1330]},
  {id: 'lale', name: 'Lale', price: 1000, body: 0xe22511, fe: [0xff8fb8, 0xffc20e, 0x7a4fb0]},
  {id: 'zumrut', name: 'Zümrüt', price: 1500, body: 0x0f7a4a, fe: [0x5ae8a0, 0xffffff, 0x0f7a4a], metal: 0.4, glow: 0.2},
  {id: 'lav', name: 'Lav', price: 2200, body: 0x3a1010, fe: [0xff5a00, 0xffc20e, 0xff2a00], glow: 0.8},
  {id: 'neon', name: 'Neon', price: 3000, body: 0x0a0a1a, fe: [0x00ffd0, 0xff00c8, 0xfff200], glow: 1.0},
  {id: 'galaksi', name: 'Galaksi', price: 5000, body: 0x2a1a6a, fe: [0xb8a0ff, 0x5ad8ff, 0xff8fe8], metal: 0.3, glow: 0.6},
  {id: 'krom', name: 'Krom', price: 12000, body: 0xd8dce4, fe: [0xffffff, 0xb8c0cc, 0xffffff], metal: 0.95, glow: 0.1},
];""")
src = src.replace("const SKINS = [ // body, three feathers, finish", "const SKINS0 = [ // body, three feathers, finish", 1)
rep("const TRAILS = [", "const SKINS = SKINS0.slice().sort((a, b) => a.price - b.price);\nconst TRAILS = [")
rep("""  {id: 'yildiz', name: 'Yıldız Tozu', price: 2500, cols: [0xfff1b8, 0xffffff, 0xffc20e], big: 1, twinkle: 1},
];""", """  {id: 'yildiz', name: 'Yıldız Tozu', price: 2500, cols: [0xfff1b8, 0xffffff, 0xffc20e], big: 1, twinkle: 1},
  {id: 'nane_t', name: 'Nane', price: 400, cols: [0xb8f4e0, 0x6ad8b0]},
  {id: 'kalp', name: 'Kalpler', price: 1200, cols: [0xff4a8a, 0xff8fb8, 0xffffff], big: 1},
  {id: 'zehir', name: 'Zehir', price: 1800, cols: [0x9dff00, 0x2fa84f, 0x1b1330]},
  {id: 'galaksi_t', name: 'Galaksi', price: 3500, cols: [0xb8a0ff, 0x5ad8ff, 0xff8fe8, 0xffffff], big: 1, twinkle: 1},
];""")
src = src.replace("const NPC_SKINS = [", "const NPC_SKINS0 = [", 1).replace("const ANI_SKINS = [", "const ANI_SKINS0 = [", 1)
rep("function npcSkin(id) {", "const NPC_SKINS = NPC_SKINS0.slice().sort((a, b) => a.price - b.price), ANI_SKINS = ANI_SKINS0.slice().sort((a, b) => a.price - b.price);\nfunction npcSkin(id) {")

# ---- progression: every level is free; the next world costs feathers (after level 10 of the one before) ----
rep("function worldOpen(w) { return w === 0 || lvDone((w - 1) * PER_WORLD + FREE_LEVELS - 1); }",
    "function worldReady(w) { return w === 0 || lvDone((w - 1) * PER_WORLD + FREE_LEVELS - 1); }\nfunction worldOpen(w) { return w === 0 || !!(SAVE.wOwn && SAVE.wOwn[w]); }")
rep("function worldLockedMsg(w) { dlg(WORLDS[w].name, 'KİLİTLİ', `<p><b>${WORLDS[w].name}</b> dünyasını açmak için önce <b>${WORLDS[w - 1].name}</b> dünyasında <b>10. bölümü</b> geç.</p>`, [{t: 'Tamam', c: 'ok'}]); }",
"""function worldLockedMsg(w) {
  const W = WORLDS[w], P0 = WORLDS[w - 1];
  if (!worldReady(w)) { dlg(W.name, 'KİLİTLİ', `<p><b>${W.name}</b> haritasını açmak için önce <b>${P0.name}</b> haritasında <b>10. bölümü</b> geç. Sonra <b>${fmtN(W.cost)} tüy</b> ile açarsın.</p>`, [{t: 'Tamam', c: 'ok'}]); return; }
  dlg(W.name, 'YENİ HARİTA', `<p><b>${W.name}</b> · ${W.sub}: 20 yeni bölüm. Açmak için <b>${fmtN(W.cost)} tüy</b> gerekiyor.${SAVE.fe < W.cost ? `<br>Sende ${fmtN(SAVE.fe)} tüy var, <b>${fmtN(W.cost - SAVE.fe)}</b> tüy daha lazım. Bölüm oynayarak, günlük hediyeyle ya da reklam izleyerek tüy toplayabilirsin.` : ''}</p>`,
    [{t: fmtN(W.cost) + ' tüy ile aç', c: SAVE.fe >= W.cost ? 'ok' : 'dim', f: () => buyWorld(w)}, {t: 'Vazgeç'}]);
}
function buyWorld(w) {
  const W = WORLDS[w]; if (SAVE.fe < W.cost) { toastShop('Yetersiz tüy', fmtN(W.cost - SAVE.fe) + ' tüy daha lazım'); return; }
  addFe(-W.cost); SAVE.wOwn = SAVE.wOwn || {}; SAVE.wOwn[w] = 1; SAVE.world = w; save(); SFX.win(); buzz([20, 30, 20]); toastShop(W.name + ' AÇILDI!', '20 yeni bölüm'); if (state === 'levels') openLevels(); else if (state === 'home') openHome();
}""")
rep("""el.innerHTML = WORLDS.map((W, w) => { const op = worldOpen(w); return `<button class="wc${w === cw ? ' on' : ''}${op ? '' : ' lock'}" data-w="${w}" style="--wc:${W.col}"><b>${W.name}</b><small>${op ? worldCount(w) + '/' + PER_WORLD : LOCK_SVG + ' kilitli'}</small></button>`; }).join('');""",
    """el.innerHTML = WORLDS.map((W, w) => { const op = worldOpen(w), rd = worldReady(w); return `<button class="wc${w === cw ? ' on' : ''}${op ? '' : ' lock'}${!op && rd ? ' buy' : ''}" data-w="${w}" style="--wc:${W.col}"><b>${W.name}</b><small>${op ? worldCount(w) + '/' + PER_WORLD : rd ? FE_SVG + fmtN(W.cost) : LOCK_SVG + ' kilitli'}</small></button>`; }).join('');
  const on = el.querySelector('.wc.on'); if (on) el.scrollLeft = Math.max(0, on.offsetLeft - el.clientWidth / 2 + on.offsetWidth / 2);""")
rep("const LOCK_SVG =", "const FE_SVG = '<svg viewBox=\"0 0 20 24\" width=\"10\" height=\"12\"><path d=\"M10 23C3 15 4 6 10 1c6 5 7 14 0 22z\" fill=\"#2fa84f\" stroke=\"#022753\" stroke-width=\"2\"/></svg>';\nconst LOCK_SVG =")
rep("function levelLocked(i) { return WLOC(i) >= FREE_LEVELS && !SAVE.pack2; }", "function levelLocked(i) { return false; }")
rep("""    if (li === 0) html += `<div class="sec"><b>1-10. BÖLÜMLER</b><span>ücretsiz</span></div>`;""", """    if (li === 0) html += `<div class="sec"><b>20 BÖLÜM</b><span>${worldCount(wv)}/${PER_WORLD}</span></div>`;""")
a = src.index("    if (li === FREE_LEVELS) html += `<div class=\"sec\"><b>11-20. BÖLÜMLER</b>")
b = src.index("    html += `<button class=\"lv", a)
src = src[:a] + """    if (li === FREE_LEVELS && wv < WORLDS.length - 1) html += `<p class="wnote">${WORLDS[wv].name} 10. bölümü geçince <b>${WORLDS[wv + 1].name}</b> haritasını ${fmtN(WORLDS[wv + 1].cost)} tüy ile açabilirsin.</p>`;
""" + src[b:]
rep("if (newWorld) setTimeout(() => toastShop(WORLDS[WIDX(cur) + 1].name + ' AÇILDI!', 'Yeni dünya seni bekliyor'), 900);",
    "if (newWorld && !worldOpen(WIDX(cur) + 1)) setTimeout(() => toastShop('YENİ HARİTA: ' + WORLDS[WIDX(cur) + 1].name, fmtN(WORLDS[WIDX(cur) + 1].cost) + ' tüy ile açabilirsin'), 900);")
rep("""    if (!SAVE.pack2) html += `<button class="item wide deal" data-buy="${PACK2.id}"><div class="pv big">40</div><div class="nm">Bölüm paketi<small>4 dünyada 11-20. bölümler · ya da ${fmtN(PACK2.fe)} tüy ile aç</small></div><div class="pr buy">${priceOf(PACK2)}</div></button>`;\n""", "")
rep("$('playSub').textContent = WORLDS[WIDX(n)].name + ' · ' + (levelLocked(n) ? 'paket gerekli' : (WLOC(n) + 1) + '. bölüm');", "$('playSub').textContent = WORLDS[WIDX(n)].name + ' · ' + (WLOC(n) + 1) + '. bölüm';")
# save from v6 (4 worlds) moves to the 9-world numbering
rep("SAVE.npc = SAVE.npc || 'mahalle';", """if (!SAVE.v7) { const o = SAVE.lv || {}, n = {}; for (const k in o) { const i = +k; n[i < 20 ? i : i < 40 ? i + 20 : i < 60 ? i + 20 : i + 100] = o[k]; } SAVE.lv = n; SAVE.wOwn = {}; const d = (i) => n[i] && n[i].done;
  if (d(9)) SAVE.wOwn[1] = SAVE.wOwn[2] = 1; if (d(49)) SAVE.wOwn[3] = 1; if (d(69)) SAVE.wOwn[8] = 1; SAVE.world = [0, 2, 3, 8][SAVE.world | 0] || 0; SAVE.v7 = 1; }
SAVE.wOwn = SAVE.wOwn || {};
SAVE.npc = SAVE.npc || 'mahalle';""")
rep("window.__A = {", "window.__A = {buyWorld, worldReady, ")

# ---- camera: never stay behind a wall ----
a = src.index("function camBlock() {"); b = src.index("function snapCam()")
src = src[:a] + """let CAMB = null, CAMB_LV = null;
function camBoxes() { if (CAMB_LV !== LV) { CAMB_LV = LV; CAMB = boxes.filter((o) => o.kind === 'hard' && o.b[1] - o.b[0] > 0.4 && o.b[5] - o.b[4] > 0.4 && o.b[3] - o.b[2] > 0.8); } return CAMB; }
const _cq = new V3(), _cb = new V3();
function segHit(a, b) { const L = camBoxes(); for (let k = 1; k <= 12; k++) { _cq.lerpVectors(a, b, k / 12); for (const o of L) if (_cq.x > o.b[0] - 0.25 && _cq.x < o.b[1] + 0.25 && _cq.z > o.b[4] - 0.25 && _cq.z < o.b[5] + 0.25 && _cq.y < o.b[3] + 0.3 && _cq.y > o.b[2]) return true; } return false; }
function camBlock() { // keep the camera out of buildings and in sight of the FLIX: lift it first, then pull it in
  const tp = toyRoot.position; if (camMode === 'map' || state === 'home' || state === 'shop') return;
  if (!segHit(tp, wantPos)) return;
  _cb.copy(wantPos);
  for (const f of [1, 0.8, 0.62, 0.46]) for (const up of [1.5, 3, 4.5, 6.5]) { wantPos.lerpVectors(tp, _cb, f); wantPos.y = _cb.y + up; if (!segHit(tp, wantPos)) { wantLook.y = Math.min(wantLook.y, tp.y + 0.2); return; } }
  wantPos.lerpVectors(tp, _cb, 0.32); wantPos.y = tp.y + 2.2;
}
""" + src[b:]
rep("const k = 1 - Math.exp(-dt * (camMode === 'fly' ? 4.5 :", "const k = 1 - Math.exp(-dt * (camMode === 'fly' ? 6.5 :")
rep("wantPos.copy(tp).addScaledVector(fwd, -7); wantPos.y = Math.max(tp.y + 2.8, P.from.y + 2.4);", "wantPos.copy(tp).addScaledVector(fwd, -6.2); wantPos.y = Math.max(tp.y + 2.6, P.from.y + 2.2);")

# ---- shop: rarity, a podium and a clearer preview ----
rep("    if (state === 'shop') { const a = T * 0.25; wantLook.copy(tp); wantLook.y -= 1.7; wantPos.set(tp.x + Math.sin(a) * 6.2, tp.y + 0.9, tp.z + Math.cos(a) * 6.2); return; }",
    "    if (state === 'shop') { const b = startPos(LV), S = shopTab === 'npc' ? [9.2, 1.7, -1.75] : shopTab === 'ani' ? [7.4, 1.2, -1.45] : shopTab === 'trail' ? [7.4, 1.2, -1.0] : [7.6, 1.3, -1.6]; wantLook.set(b.x, b.y + S[2], b.z); wantPos.set(b.x, b.y + S[1], b.z + S[0]); return; }")
rep("else toyRoot.position.set(base.x, base.y + 1.0 + Math.sin(T * 2) * 0.12, base.z); toyRoot.rotation.set(0, T * 0.6, 0); }",
    "else toyRoot.position.set(base.x, base.y + 0.35 + Math.sin(T * 2) * 0.1, base.z); toyRoot.rotation.set(0.12, T * 0.6, 0); if (prevModel) prevModel.rotation.y = T * 0.5; }")
rep("  if (shopTab === 'ani') m.g.scale.multiplyScalar(1.7);\n  const base = startPos(LV); m.g.position.set(base.x, base.y - RAD + (shopTab === 'npc' ? 0.05 : 0.45), base.z); prevModel = m.g; scene.add(m.g);",
    "  { const bb = new THREE.Box3().setFromObject(m.g), h = Math.max(0.3, bb.max.y - bb.min.y); m.g.scale.multiplyScalar(shopTab === 'ani' ? Math.min(2.6, 1.25 / h) : 1); }\n  const base = startPos(LV); m.g.position.set(base.x, base.y - RAD + 0.12, base.z); prevModel = m.g; scene.add(m.g);")
rep("function shopPreview(id) {\n", "let podium = null;\nfunction shopPodium(on) {\n  if (!podium) { podium = new THREE.Group(); mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.24, 40), std(0xffc20e, 0.45), 0, 0.12, 0, podium); const r = mesh(new THREE.TorusGeometry(1.08, 0.05, 8, 40), std(NAVY, 0.4), 0, 0.24, 0, podium); r.rotation.x = Math.PI / 2; mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.02, 40), std(0xffe27a, 0.5), 0, 0.25, 0, podium); ink(podium, 0.03); scene.add(podium); }\n  podium.visible = on && shopTab !== 'trail' && shopTab !== 'fe'; const b = startPos(LV); podium.position.set(b.x, b.y - RAD - 0.12, b.z);\n}\nfunction shopPreview(id) {\n  shopPodium(state === 'shop');\n")
rep("const on = state === 'shop' && (shopTab === 'npc' || shopTab === 'ani'); toyRoot.visible = !on; if (!on) return;",
    "const on = state === 'shop' && (shopTab === 'npc' || shopTab === 'ani'); toyRoot.visible = !on; shopInfo(id); if (!on) return;")
rep("function renderShop() {\n", """const RARITY = [[0, 'BAŞLANGIÇ', '#5a6a80'], [600, 'YAYGIN', '#5a8a3a'], [1500, 'NADİR', '#1f6fd1'], [3500, 'EPİK', '#7a4fb0'], [1e9, 'EFSANE', '#e8900a']];
function rarity(p) { return p === 0 ? RARITY[0] : RARITY.slice(1).find((r) => p <= r[0]); }
function shopInfo(id) { const el = $('shopInfo'); if (!el) return; const T = TABS[shopTab]; if (!T) { el.hidden = true; return; } const it = T.list.find((x) => x.id === (id || tryOn || SAVE[T.key])) || T.list[0], r = rarity(it.price); el.hidden = false; el.innerHTML = `<b>${it.name}</b><span style="background:${r[2]}">${r[1]}</span>`; }
function renderShop() {
""")
rep("""      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}"><div class="pv">${T.svg(it)}</div><div class="nm">${it.name}</div>""",
    """      const rr = rarity(it.price);
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}" style="--rc:${rr[2]}"><i class="rar">${rr[1]}</i><div class="pv">${T.svg(it)}</div><div class="nm">${it.name}</div>""")
rep("  feUI(); document.querySelectorAll('#shopTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === shopTab));",
    "  feUI(); shopPodium(true); shopInfo(); document.querySelectorAll('#shopTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === shopTab));")
open('game7.js', 'w').write(src); print('ok', len(src))
