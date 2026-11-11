import re
s=open('shell_v11.html').read()
a=s.index('</style>'); b=s.index('<script>/* FLIX legal */')
s=s[:a]+open('css12.css').read()+'</style>\n'+open('body12.html').read()+s[b:]
open('shell.html','w').write(s)
g=open('game_v11.js').read()
def R(old,new,n=1):
    global g
    assert g.count(old)==n,(old,g.count(old))
    g=g.replace(old,new)
R("const VERSION = '1.1';","const VERSION = '1.2';")
sv="const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SV)); } catch (e) {} };\n"
R(sv,sv+open('meta.js').read())
R("const df = DIFF[SV.diff], ai = p.ai","const df = DIFF[p.dn], ai = p.ai")
R("(c[2] || 0) <= 2 + SV.diff","(c[2] || 0) <= 2 + p.dn")
R("const ai = p.ai, df = DIFF[SV.diff];","const ai = p.ai, df = DIFF[p.dn];")
R("function makePlayer(i, charId, isBot, remote) {","function makePlayer(i, charId, isBot, remote, pf) {")
R("return { i, ch, isBot, remote: !!remote, P,","return { nm: (pf && pf.n) || ch.name, lv: (pf && pf.lv) || 1, av: (pf && pf.av) || { f: ch.id }, dn: pf && pf.dn !== undefined ? pf.dn : 1, i, ch, isBot, remote: !!remote, P,")
R("if (mode === 'arena') { const others = CHARS.map((c) => c.id).filter((c) => c !== SV.char).sort(() => Math.random() - 0.5); G.players.push(makePlayer(0, SV.char, G.auto)); for (let i = 1; i < 4; i++) G.players.push(makePlayer(i, others[i - 1], true)); }",
  "if (mode === 'arena') { const bots = G.opt.bots || mkBots(3); G.players.push(makePlayer(0, SV.char, G.auto, false, myPf())); bots.forEach((b, i) => G.players.push(makePlayer(i + 1, b.c, true, false, b))); }")
R("const p = makePlayer(i, r.c, false, !r.me); p.peer","const p = makePlayer(i, r.c, false, !r.me, r.pf); p.peer")
R("else G.players.push(makePlayer(0, SV.char, G.auto));\n  G.round = 1;","else G.players.push(makePlayer(0, SV.char, G.auto, false, myPf()));\n  G.view = null; adScreen('game'); G.round = 1;")
R("banner(m === 'macera' ? 'BÖLÜM ' + G.opt.level : m === 'bulmaca' ? 'BULMACA ' + G.opt.level : 'RAUNT ' + G.round, m === 'macera' ? 'Canavarları temizle, kapıyı bul' : m === 'bulmaca' ? G.bLeft + ' bombayla altın kasaları patlat' : me.ch.name + ' sensin', 1.5);",
  "banner(m === 'macera' ? T('BÖLÜM ', 'LEVEL ') + G.opt.level : m === 'bulmaca' ? T('BULMACA ', 'PUZZLE ') + G.opt.level : T('RAUNT ', 'ROUND ') + G.round, m === 'macera' ? T('Canavarları patlat, kapıyı bul', 'Blast the monsters, find the door') : m === 'bulmaca' ? T(G.bLeft + ' bombayla altın kasaları patlat', 'Blow up the gold crates with ' + G.bLeft + ' bombs') : cx(me.ch, 'name') + T(' sensin', ' is you'), 1.5);")
R("toast('Kapı bulundu!')","toast(T('Kapı bulundu!', 'Door found!'))")
R("banner('KAPI AÇILDI!', 'Kapıya koş', 1.3)","banner(T('KAPI AÇILDI!', 'DOOR IS OPEN!'), T('Kapıya koş', 'Run to the door'), 1.3)")
R("toast('Yelek seni kurtardı!')","toast(T('Yelek seni kurtardı!', 'The vest saved you!'))")
R("const PU_TXT = { bomb: '+1 Bomba', range: '+1 Menzil', speed: 'Hız +', kick: 'Tekme: bombaya yürü, it', pierce: 'Delici bomba', vest: 'Yelek: bir patlamadan korur', full: 'Tam menzil!', skull: 'Lanet!' };",
  "const PU_TXT = { bomb: ['+1 Bomba', '+1 Bomb'], range: ['+1 Menzil', '+1 Range'], speed: ['Hız +', 'Speed +'], kick: ['Tekme: bombaya yürü, it', 'Kick: walk into a bomb to push it'], pierce: ['Delici bomba', 'Piercing bomb'], vest: ['Yelek: bir patlamadan korur', 'Vest: saves you from one blast'], full: ['Tam menzil!', 'Full range!'], skull: ['Lanet!', 'Cursed!'] };")
R("const CURSE_TXT = { slow: 'Lanet: yavaşladın', reverse: 'Lanet: yönler ters', nobomb: 'Lanet: bomba koyamazsın', drop: 'Lanet: bombalar kendiliğinden düşüyor' };",
  "const CURSE_TXT = { slow: ['Lanet: yavaşladın', 'Curse: you are slow'], reverse: ['Lanet: yönler ters', 'Curse: controls reversed'], nobomb: ['Lanet: bomba koyamazsın', 'Curse: no bombs'], drop: ['Lanet: bombalar kendiliğinden düşüyor', 'Curse: bombs drop by themselves'] };")
R("toast(u.type === 'skull' ? CURSE_TXT[p.curse.type] : PU_TXT[u.type]);","toast(T(...(u.type === 'skull' ? CURSE_TXT[p.curse.type] : PU_TXT[u.type])));")
R("banner(win ? (G.mode === 'macera' ? 'BÖLÜM GEÇİLDİ!' : 'ÇÖZDÜN!') : msg, '', 1.3);","banner(win ? (G.mode === 'macera' ? T('BÖLÜM GEÇİLDİ!', 'LEVEL CLEARED!') : T('ÇÖZDÜN!', 'SOLVED!')) : msg, '', 1.3);")
R("banner('BAŞLA!', '', 0.7)","banner(T('BAŞLA!', 'GO!'), '', 0.7)")
R("finish(false, 'SÜRE DOLDU')","finish(false, T('SÜRE DOLDU', 'TIME IS UP'))")
R("toast('Lanet geçti')","toast(T('Lanet geçti', 'Curse is gone'))")
R("toast('Bomban kalmadı')","toast(T('Bomban kalmadı', 'No bombs left'))")
R("toast('Bulmacada özel güç yok')","toast(T('Bulmacada özel güç yok', 'No special power in puzzles'))")
R("finish(false, 'YAKALANDIN')","finish(false, T('YAKALANDIN', 'CAUGHT!'))")
R("finish(false, 'PATLADIN')","finish(false, T('PATLADIN', 'YOU BLEW UP'))")
R("finish(false, 'BOMBALAR BİTTİ')","finish(false, T('BOMBALAR BİTTİ', 'OUT OF BOMBS'))")
R("banner(mine ? 'RAUNT SENİN!' : w.ch.name + ' kazandı', 'Raunt ' + G.round, 2); } else { banner('BERABERE', 'Kimse ayakta kalmadı', 2);",
  "banner(mine ? T('RAUNT SENİN!', 'ROUND IS YOURS!') : escH(w.nm) + T(' kazandı', ' wins'), T('Raunt ', 'Round ') + G.round, 2); } else { banner(T('BERABERE', 'DRAW'), T('Kimse ayakta kalmadı', 'Nobody is left standing'), 2);")
R("banner('ALAN DARALIYOR!', 'Kenarlardan uzak dur', 1.6)","banner(T('ALAN DARALIYOR!', 'ARENA IS CLOSING!'), T('Kenarlardan uzak dur', 'Stay away from the edges'), 1.6)")
R("this.err = 'Online, oyunu claude.ai bağlantısından açınca çalışır.'","this.err = T('Online, oyunu claude.ai bağlantısından açınca çalışır.', 'Online works when the game is opened from its claude.ai link.')")
R("this.err = 'Odaya bağlanılamadı. Tekrar dene.'","this.err = T('Odaya bağlanılamadı. Tekrar dene.', 'Could not join the room. Try again.')")
R("this.unsub = this.room.onPeers(() => { if (!$('lobby').hidden) renderLobby(); }, () => {});\n    this.room.presence({ c: SV.char, j: this.j, h: null, s: null, b: null })",
  "this.unsub = this.room.onPeers(() => { if (!$('lobby').hidden) renderLobby(); }, () => {});\n    this.room.presence({ c: SV.char, j: this.j, h: null, s: null, b: null, pf: this.pf() })")
R("  async leave() {","  pf() { return { n: SV.name, lv: myLv(), a: [SV.av.f, SV.av.bg, SV.av.fr, SV.av.st] }; },\n  async leave() {")
R("j: p.presence.j || 0, pr: p.presence }))","j: p.presence.j || 0, pr: p.presence, pf: cleanPf(p.presence.pf) }))")
R("for (const id of ['lobby', 'modes']) $(id).hidden = true; startGame('online'); }","for (const id of ['lobby', 'modes']) $(id).hidden = true; mmStop(); startGame('online'); }")
R("this.push({ c: SV.char, j: this.j, h: this.isHost() ? this.h : null,","this.push({ pf: this.pf(), c: SV.char, j: this.j, h: this.isHost() ? this.h : null,")
a=g.index('function renderLobby() {'); b=g.index('// ---------- loop ----------')
g=g[:a]+open('ui12.js').read()+'\n'+g[b:]
R("} else { G.t += dt; NET.poll(); }","} else { G.t += dt; NET.poll(); mmTick(dt); }")
R("makePortraits(); fitCamera(); show('home'); renderHome(); AUD.want = 'menu';","makePortraits(); fitCamera(); applyLang(); show('home'); renderHome(); AUD.want = 'menu'; adScreen('menu');\nsetTimeout(() => { if (G.state === 'menu' && !MM.on && dailyState().can && !document.querySelector('.sheet:not([hidden])')) { dayGot = 0; renderDaily(); sheet('daily', true); } }, 3600);")
R("window.__fb = { NET, startGame,","window.__fb = { MM, mmStart, mmTick, mmStop, grant, renderHome, applyLang, lvInfo, dailyState, NET, startGame,")
open('game.js','w').write(g)
b=open('build.py').read().replace("VER='1.1'","VER='1.2'"); open('build.py','w').write(b)
print('ok',len(g))
