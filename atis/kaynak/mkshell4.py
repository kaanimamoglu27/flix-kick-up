import sys
s = open('shell3.html').read()
def rep(a, b):
    global s
    if s.count(a) != 1: sys.exit('miss: ' + a[:70])
    s = s.replace(a, b)

FE = '<svg viewBox="0 0 20 24" width="15" height="18"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#fff" stroke-width="1.8"/></svg>'
CUR = '<button class="cur feBtn" aria-label="Tüy">' + FE + '<span class="feN">0</span><i class="plus">+</i></button>'

rep('html,body{width:100%;height:100%;overflow:hidden;background:#bfe6ee;', 'html,body{width:100%;height:100%;overflow:hidden;background:#0d1f3a;')
rep('#gl{position:fixed;inset:0}', '#app{position:fixed;top:0;bottom:0;left:50%;width:min(100vw,calc(100vh * .62));transform:translateX(-50%);overflow:hidden;background:#bfe6ee;contain:layout paint}\n#gl{position:absolute;inset:0}')
rep('.layer{position:fixed;inset:0;pointer-events:none}', '.layer{position:absolute;inset:0;pointer-events:none}')
rep('#shotsBox small{', '#shotsBox #shotMax{font-size:11px;letter-spacing:.4px;margin-top:-1px}\n#shotsBox small{')

css = r'''
/* v4: portrait column, currency, shop, ads, payments */
@media (min-aspect-ratio: 13/20){body{background:radial-gradient(circle at 50% 40%,#1b3a66,#0a1628)}#app{box-shadow:0 0 0 2px rgba(255,255,255,.06),0 0 80px rgba(0,0,0,.55)}}
.topbar{position:absolute;top:calc(var(--sat) + 12px);left:14px;right:14px;display:flex;justify-content:space-between;align-items:center;pointer-events:none;z-index:2}
.topbar>*{pointer-events:auto}
.cur{display:inline-flex;align-items:center;gap:7px;background:var(--navy);color:#fff;border-radius:14px;padding:5px 5px 5px 11px;font-weight:800;font-size:16px;box-shadow:0 3px 0 rgba(0,0,0,.22)}
.cur .plus{font-style:normal;width:26px;height:26px;border-radius:9px;background:var(--yel);color:var(--navy);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;line-height:1}
.cur.nob{padding-right:11px}
#homeL .top{top:calc(var(--sat) + 66px)}
.mbtn .bdg{margin-left:4px;background:var(--red);color:#fff;font-size:10px;letter-spacing:.8px;border-radius:6px;padding:2px 6px}
.mbtn.ok{background:var(--yel)}
#levels .hd{position:relative}
#levels .hd .cur{position:absolute;right:16px;top:calc(var(--sat) + 22px)}
#endL .topbar{justify-content:flex-end}
.adbtn{margin-top:14px;width:100%;display:flex;align-items:center;gap:10px;background:#2fa84f;color:#fff;border:3px solid var(--navy);border-radius:16px;padding:8px 12px;box-shadow:0 4px 0 rgba(2,39,83,.35);text-align:left}
.adbtn:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(2,39,83,.35)}
.adbtn i{font-style:normal;width:34px;height:34px;border-radius:50%;background:#fff;color:#2fa84f;display:flex;align-items:center;justify-content:center;font-size:15px;flex:none}
.adbtn span{font-size:12px;font-weight:600;line-height:1.2}.adbtn b{display:block;font-size:17px;font-weight:800}
.adbtn.revive{background:var(--red)}.adbtn.revive i{color:var(--red)}
.adbtn:disabled{opacity:.75}
/* shop */
#shopL .topbar .tag{font-size:15px}
#shopSheet{position:absolute;left:0;right:0;bottom:0;height:60%;background:var(--cream);border-radius:26px 26px 0 0;border-top:4px solid var(--navy);display:flex;flex-direction:column;box-shadow:0 -8px 26px rgba(2,39,83,.28)}
#shopTabs{display:flex;gap:7px;padding:13px 14px 9px}
#shopTabs button{flex:1;background:#fff;border:3px solid var(--navy);border-radius:14px;padding:9px 0;font-weight:800;font-size:15px;color:var(--navy);box-shadow:0 3px 0 rgba(2,39,83,.25)}
#shopTabs button.on{background:var(--navy);color:#fff;box-shadow:none;transform:translateY(2px)}
#shopGrid{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:8px 14px 12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px 9px;align-content:start}
.item{position:relative;background:#fff;border:3px solid var(--navy);border-radius:16px;padding:8px 5px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 3px 0 rgba(2,39,83,.25);color:var(--navy);min-width:0}
.item .pv{width:54px;height:56px}.item .pv svg{width:100%;height:100%;display:block}
.item .nm{font-weight:800;font-size:13px;text-align:center;line-height:1.1;min-height:28px;display:flex;align-items:center}
.item .pr{font-size:12px;font-weight:800;border-radius:9px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.pr svg{width:10px;height:12px}
.pr.can{background:var(--yel)}.pr.no{background:#ece7dc;color:#7d8697}.pr.own{background:#e3f3e7;color:#1d7a3a}.pr.on{background:#2fa84f;color:#fff}.pr.buy{background:var(--red);color:#fff;font-size:14px;padding:6px 10px}
.item.eq{border-color:#2fa84f;background:#f1fbf3}
.item.try{border-color:var(--red);background:#fff3c4}
.item.wide{grid-column:1/-1;flex-direction:row;justify-content:flex-start;text-align:left;padding:10px 12px;gap:12px}
.item.wide .nm{flex:1;display:block;text-align:left;font-size:16px;min-height:0}
.item.wide .nm small{display:block;font-size:12px;font-weight:600;opacity:.7;margin-top:3px;line-height:1.25}
.item.wide .nm b{color:#1d7a3a}
.item .pv.big{font-size:24px;width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center;background:var(--navy);color:#fff;border-radius:13px}
.item.free .pv.big{background:#2fa84f}
.item.deal{background:linear-gradient(135deg,#fff3c4,#ffd76a);border-color:var(--red)}.item.deal .pv{width:46px;height:48px;flex:none}
.item.pack .pv.fe{display:flex;justify-content:center;align-items:flex-end}
.item.pack .pv.fe svg{width:20px;height:28px;margin:0 -3px}
.item .tg{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--red);color:#fff;font-style:normal;font-size:9px;font-weight:800;letter-spacing:.5px;border-radius:6px;padding:2px 6px;white-space:nowrap}
.item:disabled{opacity:.55}
.note{grid-column:1/-1;text-align:center;font-size:12px;opacity:.6;font-weight:600;padding:2px 4px 6px}
.shopFoot{display:flex;align-items:center;gap:12px;padding:9px 14px calc(var(--sab) + 12px);border-top:2px dashed rgba(2,39,83,.15)}
.shopFoot span{font-size:12px;font-weight:600;opacity:.6;line-height:1.25}
#shopToast{position:absolute;left:50%;top:calc(var(--sat) + 64px);transform:translateX(-50%);background:var(--navy);color:#fff;border-radius:16px;padding:9px 18px;text-align:center;pointer-events:none;opacity:0;z-index:40;white-space:nowrap;box-shadow:0 4px 0 rgba(0,0,0,.2)}
#shopToast b{display:block;font-size:17px}#shopToast span{font-size:12px;opacity:.8}
#shopToast.go{animation:stoast 2.2s ease-out forwards}
@keyframes stoast{0%{opacity:0;transform:translate(-50%,-10px)}10%{opacity:1;transform:translate(-50%,0)}80%{opacity:1}100%{opacity:0}}
/* web ad + demo payment */
#adL,#payL,#rotL{z-index:50;background:rgba(2,15,35,.82);display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:auto}
#adBox{width:100%;max-width:340px;background:var(--red);border:4px solid var(--navy);border-radius:24px;overflow:hidden;color:#fff;box-shadow:0 10px 0 rgba(0,0,0,.3)}
#adBox .adtop{display:flex;justify-content:space-between;padding:10px 14px;font-size:11px;font-weight:800;letter-spacing:1.4px;background:rgba(2,39,83,.35)}
#adBox .adbody{padding:26px 18px 18px;text-align:center}
#adBox .adbody img{width:170px;filter:drop-shadow(0 5px 0 rgba(2,39,83,.35))}
#adBox .adbody h3{font-size:40px;margin-top:12px;color:var(--yel);-webkit-text-stroke:2px var(--navy);paint-order:stroke fill;text-shadow:0 4px 0 var(--navy)}
#adBox .adbody p{font-weight:600;font-size:14px;margin-top:10px;line-height:1.35}
#adBox .adfoot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:var(--cream);color:var(--navy);font-size:11px;font-weight:600;line-height:1.25}
#adClose{flex:none;min-width:58px;height:46px;border-radius:14px;background:var(--navy);color:#fff;font-weight:800;font-size:18px}
#adClose:disabled{opacity:.55}
#paySheet{width:100%;max-width:340px;background:var(--cream);border:4px solid var(--navy);border-radius:24px;padding:20px 18px 16px;text-align:center;box-shadow:0 10px 0 rgba(0,0,0,.3)}
#paySheet .ph{font-size:12px;font-weight:800;letter-spacing:1.4px;opacity:.6}
#payT{font-weight:800;font-size:20px;margin-top:8px}
#payP{font-size:54px;color:var(--red);margin-top:6px}
#paySheet .demo{margin-top:12px;background:#fff3c4;border:2px dashed #c78f00;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:600;line-height:1.3}
#paySheet .row2{display:flex;justify-content:space-between;gap:10px;margin-top:16px}
#paySheet .row2 .mbtn{flex:1;justify-content:center}
#rotL{flex-direction:column;gap:16px;color:#fff;text-align:center;z-index:60}
#rotL svg{animation:rot 2s ease-in-out infinite}
#rotL b{font-size:40px;color:var(--yel)}
@keyframes rot{0%,20%{transform:rotate(-90deg)}60%,100%{transform:rotate(0)}}
.srow small{font-size:12px;font-weight:600;opacity:.6;display:block}
.srow.link span:last-child{background:var(--navy)}
.ver{margin-top:6px;font-size:11px;font-weight:600;color:#fff;opacity:.6}
'''
rep('#flash{position:absolute;inset:0;', css + '#flash{position:absolute;inset:0;')

rep('<div id="gl"></div>', '<div id="app">\n<div id="gl"></div>')
rep('<div class="pill d" id="shotsBox"><small>ATIŞ</small><span class="big" id="shots">0</span></div>',
    '<div class="pill d" id="shotsBox"><small>ATIŞ</small><span class="big" id="shots">0</span><small id="shotMax">/5</small></div>')
# home: top bar with stars + currency, three menu buttons
rep('''<div class="layer" id="homeL">
  <div class="top">''', '''<div class="layer" id="homeL">
  <div class="topbar"><div class="pill"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="#ffc20e" stroke="#022753" stroke-width="2" stroke-linejoin="round"/></svg><span id="starsH">0</span></div>''' + CUR + '''</div>
  <div class="top">''')
a = s.index('    <div class="stats">'); b = s.index('</div></div>', a) + len('</div></div>')
s = s[:a] + s[b:]
rep('''Bölümler</button>
    <button class="mbtn" id="setB">''', '''Bölümler</button>
    <button class="mbtn" id="shopB"><svg viewBox="0 0 24 24" fill="none" stroke="#022753" stroke-width="2.4" stroke-linejoin="round"><path d="M4 9h16l-1.5 11h-13z"/><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2"/></svg>Dükkân<span class="bdg">YENİ</span></button>
    <button class="mbtn" id="setB">''')
rep('<span>Sokak 1 · 8 bölüm</span>', '<span>Sokak 1 · 8 bölüm</span>')
rep('<div id="levels"><div class="hd"><h2 class="big">MAHALLE</h2>', '<div id="levels"><div class="hd">' + CUR + '<h2 class="big">MAHALLE</h2>')
# end: currency + reward ad button
rep('''<div class="layer" id="endL" hidden>
  <div id="end">''', '''<div class="layer" id="endL" hidden>
  <div class="topbar"><div class="cur nob">''' + FE + '''<span class="feN">0</span></div></div>
  <div id="end">''')
rep('<div id="endStars"></div><div id="endRows"></div></div></div>', '<div id="endStars"></div><div id="endRows"></div><button class="adbtn" id="endAd" hidden></button></div></div>')
# settings rows
rep('''<button class="srow" id="vibRow"><span>Titreşim</span><span id="vibT">Açık</span></button></div>''',
    '''<button class="srow" id="vibRow"><span>Titreşim</span><span id="vibT">Açık</span></button>
    <button class="srow link" id="adsRow"><span>Reklamlar<small>Reklamsız paket dükkânda</small></span><span id="adsT">Açık</span></button>
    <button class="srow link" id="restRow" hidden><span>Satın alımlar<small>Başka cihazdan aldıkların</small></span><span id="restT">Geri yükle</span></button>
    <div class="ver">Flix Atış 1.1 · FLIX TOYS</div></div>''')
# new layers
layers = '''<div class="layer" id="shopL" hidden>
  <div class="topbar"><div class="tag">FLIX DÜKKÂNI</div>''' + CUR + '''</div>
  <div id="shopSheet">
    <div id="shopTabs"><button data-t="skin">Kostüm</button><button data-t="trail">Uçuş izi</button><button data-t="fe">Tüy al</button></div>
    <div id="shopGrid"></div>
    <div class="shopFoot"><button class="mbtn" id="shopBack">Geri</button><span>Bir kez dokun: üstünde dene.<br>Tekrar dokun: satın al.</span></div>
  </div>
</div>
<div class="layer" id="adL" hidden><div id="adBox">
  <div class="adtop"><span id="adKind">REKLAM</span><span>FLIX TOYS</span></div>
  <div class="adbody"><img alt="FLIX" src="@@LOGO@@"><h3 class="big">GERÇEĞİ ELİNDE!</h3><p>Oyundaki FLIX'in gerçeği seni bekliyor.<br>flixtoysofficial.com</p></div>
  <div class="adfoot"><span>Web sürümü: burada gerçek reklam yok, uygulamada çıkar.</span><button id="adClose">5</button></div>
</div></div>
<div class="layer" id="payL" hidden><div id="paySheet">
  <div class="ph">SATIN AL</div><div id="payT"></div><div class="big" id="payP"></div>
  <div class="demo">DEMO · Web sürümünde gerçek ödeme alınmaz. Uygulamada ödeme App Store ile yapılır.</div>
  <div class="row2"><button class="mbtn" id="payNo">Vazgeç</button><button class="mbtn ok" id="payOk">Onayla</button></div>
</div></div>
<div class="layer" id="rotL" hidden><svg width="70" height="110" viewBox="0 0 70 110"><rect x="4" y="4" width="62" height="102" rx="12" fill="none" stroke="#fff" stroke-width="6"/><circle cx="35" cy="92" r="5" fill="#fff"/></svg><b class="big">TELEFONU DİK TUT</b><span>Flix Atış dikey ekranda oynanır.</span></div>
<div id="shopToast"></div>
</div>
<script src="@@THREE@@"></script>'''
rep('<script src="@@THREE@@"></script>', layers)
open('shell4.html', 'w').write(s)
print('ok')
