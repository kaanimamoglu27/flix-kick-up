import sys
s=open('shop4.js').read()
def rep(a,b):
    global s
    if s.count(a)!=1: sys.exit('miss: '+a[:60])
    s=s.replace(a,b)
rep("const NOADS = {id: 'atis_noads', price: '₺119,99'};", "const NOADS = {id: 'atis_noads', price: '₺119,99'};\nconst PACK2 = {id: 'atis_sokak2', price: '₺79,99', fe: 12000}, FREE_LEVELS = 10;\nconst DAILY = [50, 75, 100, 150, 200, 250, 500];")
rep("SAVE.tx = SAVE.tx || [];", "SAVE.npc = SAVE.npc || 'mahalle'; SAVE.ani = SAVE.ani || 'normal'; SAVE.daily = SAVE.daily || {last: '', streak: 0}; SAVE.loses = SAVE.loses || 0;\nSAVE.tx = SAVE.tx || [];")
rep("  else if (id === NOADS.id) {", "  else if (id === PACK2.id) { if (!SAVE.pack2) { SAVE.pack2 = 1; toastShop('Sokak 2 açıldı', '10 yeni bölüm seni bekliyor'); if (state === 'levels') openLevels(); } }\n  else if (id === NOADS.id) {")
rep("""  if (shopTab === 'skin' || shopTab === 'trail') {
    const list = shopTab === 'skin' ? SKINS : TRAILS, eq = shopTab === 'skin' ? SAVE.skin : SAVE.trail;
    for (const it of list) {
      const own = !!SAVE.own[it.id + (shopTab === 'trail' && it.id === 'buz' ? '_t' : '')] || it.price === 0, on = eq === it.id;
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}"><div class="pv">${shopTab === 'skin' ? toySVG(it) : trailSVG(it)}</div><div class="nm">${it.name}</div>""",
"""  if (TABS[shopTab]) {
    const T = TABS[shopTab], list = T.list, eq = SAVE[T.key];
    for (const it of list) {
      const own = !!SAVE.own[ownKey(shopTab, it.id)] || it.price === 0, on = eq === it.id;
      html += `<button class="item${on ? ' eq' : ''}${tryOn === it.id ? ' try' : ''}" data-id="${it.id}"><div class="pv">${T.svg(it)}</div><div class="nm">${it.name}</div>""")
rep("""    if (!SAVE.starter) html +=""", """    if (!SAVE.pack2) html += `<button class="item wide deal" data-buy="${PACK2.id}"><div class="pv big">20</div><div class="nm">Sokak 2 paketi<small>11-20. bölümler · ya da ${fmtN(PACK2.fe)} tüy ile aç</small></div><div class="pr buy">${priceOf(PACK2)}</div></button>`;
    if (!SAVE.starter) html +=""")
rep("p = PACKS.find((q) => q.id === id) || (id === STARTER.id ? {...STARTER, title: 'Başlangıç Paketi'} : {...NOADS, title: 'Reklamsız'});",
    "p = PACKS.find((q) => q.id === id) || (id === STARTER.id ? {...STARTER, title: 'Başlangıç Paketi'} : id === PACK2.id ? {...PACK2, title: 'Sokak 2 paketi'} : {...NOADS, title: 'Reklamsız'});")
a=s.index("function shopPick(id) {"); b=s.index("let demoTrail = 0;")
s=s[:a]+open('shop5_pick.js').read()+s[b:]
rep("function openShop(tab) { state = 'shop'; shopTab = tab || 'skin'; tryOn = null;", "function openShop(tab) { state = 'shop'; shopTab = tab || 'skin'; tryOn = null; shopPreview();")
rep("function closeShop() { show('shopL', false); tryOn = null; equipAll(); openHome(); }", "function closeShop() { show('shopL', false); state = 'home'; tryOn = null; equipAll(); shopPreview(); openHome(); }")
rep("shopTab = b.dataset.t; tryOn = null; equipAll(); renderShop(); });", "shopTab = b.dataset.t; tryOn = null; equipAll(); shopPreview(); renderShop(); });")
s += open('shop5_tail.js').read()
open('shop5.js','w').write(s)
print('ok')
