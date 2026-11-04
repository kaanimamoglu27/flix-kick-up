import sys
s = open('shell4.html').read()
def rep(a, b):
    global s
    if s.count(a) != 1: sys.exit('miss: ' + a[:70])
    s = s.replace(a, b)

FE = '<svg viewBox="0 0 20 24" width="15" height="18"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#fff" stroke-width="1.8"/></svg>'
a = s.index('<div class="layer" id="homeL">'); b = s.index('<div class="layer" id="levelsL"')
home = '''<div class="layer" id="homeL">
  <div class="hbar"><button class="hpill feBtn" aria-label="Tüy"><svg viewBox="0 0 20 24" width="16" height="19"><path d="M10 23C3 15 4 6 10 1c6 5 7 14 0 22z" fill="#2fa84f" stroke="#022753" stroke-width="1.8"/></svg><b class="feN">0</b><i class="plus">+</i></button>
    <div class="hpill"><svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.1l1.5-7L2 9.3l7-.8z" fill="#ffc20e" stroke="#022753" stroke-width="2" stroke-linejoin="round"/></svg><b id="starsH">0</b></div><div class="grow"></div>
    <button class="hicon" id="setB" aria-label="Ayarlar"><svg viewBox="0 0 24 24" fill="none" stroke="#022753" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.4"/><circle cx="10" cy="17" r="2.4"/></svg></button></div>
  <div class="hlogo"><img alt="FLIX" src="@@LOGO@@"><span class="tape">ATIŞ</span></div>
  <p class="slogan">Fırlat, süzül, kovaya sok!</p>
  <div class="grow"></div>
  <p class="htip">FLIX'e dokun, sektir</p>
  <div class="hact">
    <button class="hplay" id="play">OYNA<small id="playSub"></small></button>
    <div class="tiles">
      <button class="tile" id="lvlB"><svg viewBox="0 0 32 32" fill="none" stroke="#022753" stroke-width="2.4" stroke-linejoin="round"><rect x="5" y="5" width="9" height="9" rx="2" fill="#ffc20e"/><rect x="18" y="5" width="9" height="9" rx="2" fill="#fff"/><rect x="5" y="18" width="9" height="9" rx="2" fill="#fff"/><rect x="18" y="18" width="9" height="9" rx="2" fill="#e22511"/></svg>Bölümler</button>
      <button class="tile" id="shopB"><svg viewBox="0 0 32 32" fill="none" stroke="#022753" stroke-width="2.4" stroke-linejoin="round"><path d="M16 26c-4 0-7-1.6-7-3.6S12 19 16 19s7 1.4 7 3.4S20 26 16 26Z" fill="#e22511"/><path d="M13 19.5 9 6M16 19V4M19 19.5 23 6" stroke-linecap="round"/><path d="M9 6c-2 3 0 7 2.6 9M23 6c2 3 0 7-2.6 9M16 4c-2.4 3-2.4 8 0 11 2.4-3 2.4-8 0-11Z" fill="#ffc20e"/></svg>Dükkân</button>
      <button class="tile" id="dailyB"><svg viewBox="0 0 32 32" fill="none" stroke="#022753" stroke-width="2.4" stroke-linejoin="round"><rect x="5" y="13" width="22" height="14" rx="2" fill="#e22511"/><rect x="3" y="9" width="26" height="6" rx="2" fill="#ffc20e"/><path d="M16 9v18"/><path d="M16 9c-3-6-9-4-6 0M16 9c3-6 9-4 6 0"/></svg>Hediye<i class="dot" id="dailyDot" hidden>AL</i></button>
      <button class="tile" id="howB"><svg viewBox="0 0 32 32" fill="none" stroke="#022753" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="11" fill="#ffc20e"/><path d="M12.5 12.8a3.6 3.6 0 1 1 5 3.3c-1 .5-1.5 1.2-1.5 2.4"/><circle cx="16" cy="22.3" r=".6" fill="#022753"/></svg>Nasıl?</button>
    </div>
  </div>
</div>
'''
s = s[:a] + home + s[b:]
rep('<div id="shopTabs"><button data-t="skin">Kostüm</button><button data-t="trail">Uçuş izi</button><button data-t="fe">Tüy al</button></div>',
    '<div id="shopTabs"><button data-t="skin">FLIX</button><button data-t="trail">İz</button><button data-t="npc">İnsan</button><button data-t="ani">Hayvan</button><button data-t="fe">Tüy</button></div>')
rep('<span>Sokak 1 · 8 bölüm</span>', '<span>2 sokak · 20 bölüm</span>')
rep('<h2 class="big">MAHALLE</h2>', '<h2 class="big">BÖLÜMLER</h2>')
rep('<div class="ver">Flix Atış 1.1 · FLIX TOYS</div>', '<div class="ver">Flix Atış 1.2 · FLIX TOYS</div>')
rep('<div id="shopToast"></div>', '''<div class="layer" id="dlgL" hidden><div id="dlgBox"><div class="ph" id="dlgTag"></div><h3 class="big" id="dlgT"></h3><div id="dlgB"></div><div id="dlgBtns"></div></div></div>
<div id="shopToast"></div>''')
css = r'''
/* v5: Kick Up style home */
#homeL #play{position:relative;right:auto;bottom:auto;width:auto;height:auto}#homeL #playSub{position:static;width:auto;color:inherit;text-shadow:none;font-size:12px}
#app.hm{background:radial-gradient(120% 75% at 50% 28%,#f5452a 0%,#e22511 50%,#c41a08 100%)}
#app.hm::before{content:"";position:absolute;left:50%;top:32%;width:180vmax;height:180vmax;translate:-50% -50%;background:repeating-conic-gradient(from 0deg,rgba(255,194,14,.16) 0deg 10deg,transparent 10deg 30deg);animation:swirl 40s linear infinite;pointer-events:none}
@keyframes swirl{from{transform:rotate(-12deg)}to{transform:rotate(348deg)}}
#homeL{display:flex;flex-direction:column;align-items:center;padding:calc(var(--sat) + 12px) 16px calc(var(--sab) + 18px)}
#homeL .grow{flex:1;pointer-events:none}
.hbar{width:100%;display:flex;align-items:center;gap:8px}
.hpill{display:inline-flex;align-items:center;gap:6px;background:#fff;border:2.5px solid var(--navy);box-shadow:0 3px 0 var(--navy);border-radius:999px;padding:6px 12px;font-weight:800;font-size:16px;color:var(--navy)}
.hpill.feBtn{padding-right:5px}.hpill .plus{font-style:normal;width:24px;height:24px;border-radius:50%;background:var(--yel);border:2px solid var(--navy);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;line-height:1}
.hicon{width:44px;height:44px;border-radius:14px;background:#fff;border:2.5px solid var(--navy);box-shadow:0 3px 0 var(--navy);display:flex;align-items:center;justify-content:center}.hicon svg{width:24px;height:24px}
.hlogo{margin-top:clamp(8px,3vh,30px);display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none!important;animation:drop .7s cubic-bezier(.3,1.5,.5,1) both}
.hlogo img{width:min(50vw,205px);filter:drop-shadow(0 8px 0 rgba(2,39,83,.35));animation:float 3.2s ease-in-out .8s infinite}
.tape{background:var(--navy);color:var(--yel);font-style:italic;font-weight:900;letter-spacing:.26em;font-size:18px;padding:6px 14px 6px 18px;border-radius:6px;transform:rotate(-2deg);box-shadow:0 3px 0 rgba(0,0,0,.2)}
.slogan{margin-top:10px;color:#fff;font-style:italic;font-weight:800;font-size:15px;text-shadow:0 2px 0 rgba(2,39,83,.4);pointer-events:none!important;animation:fadeup .5s .6s ease both}
.htip{color:rgba(255,255,255,.85);font-size:12px;font-weight:700;margin-bottom:10px;pointer-events:none!important}
@keyframes drop{from{transform:translateY(-120px) rotate(-12deg);opacity:0}to{transform:none;opacity:1}}
@keyframes float{50%{transform:translateY(-10px) rotate(-2deg)}}
@keyframes fadeup{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
.hact{width:min(100%,380px);display:flex;flex-direction:column;gap:12px;animation:fadeup .5s .7s ease both}
.hplay{background:var(--yel);color:var(--navy);border:3px solid var(--navy);border-radius:20px;box-shadow:0 6px 0 var(--navy);padding:14px 20px 12px;font-family:'Barlow Condensed',Impact,sans-serif;font-style:italic;font-weight:900;font-size:40px;line-height:1;display:flex;flex-direction:column;align-items:center;animation:breathe 2.6s ease-in-out 1.4s infinite}
.hplay small{font-family:Rubik,sans-serif;font-style:normal;font-weight:700;font-size:12px;letter-spacing:.3px;margin-top:3px;opacity:.75}
.hplay:active{animation:none;transform:translateY(4px);box-shadow:0 2px 0 var(--navy)}
@keyframes breathe{50%{transform:scale(1.03)}}
.tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.tile{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;background:#fff;border:2.5px solid var(--navy);border-radius:16px;box-shadow:0 4px 0 var(--navy);padding:12px 4px 11px;font-weight:800;font-size:13px;color:var(--navy)}
.tile:active{transform:translateY(3px);box-shadow:0 1px 0 var(--navy)}
.tile svg{width:28px;height:28px}
.tile .dot{position:absolute;top:-8px;right:-4px;background:var(--yel);color:var(--navy);border:2px solid var(--navy);border-radius:999px;font-style:normal;font-size:10px;font-weight:800;padding:3px 7px}
/* dialog */
#dlgL{z-index:45;background:rgba(2,15,35,.7);display:flex;align-items:center;justify-content:center;padding:20px;pointer-events:auto}
#dlgBox{width:100%;max-width:350px;background:var(--cream);border:4px solid var(--navy);border-radius:24px;padding:18px 16px 16px;text-align:center;box-shadow:0 10px 0 rgba(0,0,0,.3)}
#dlgBox .ph{font-size:12px;font-weight:800;letter-spacing:1.4px;color:var(--red)}
#dlgT{font-size:44px;margin-top:4px;color:var(--navy)}
#dlgB p{font-size:14px;font-weight:600;line-height:1.4;margin-top:10px}
#dlgB .how{text-align:left}#dlgB .how p{margin-top:7px}
#dlgBtns{display:flex;flex-direction:column;gap:9px;margin-top:16px}
#dlgBtns .mbtn{justify-content:center;width:100%}#dlgBtns .mbtn.ok{background:var(--yel)}#dlgBtns .mbtn.ad{background:#2fa84f;color:#fff}#dlgBtns .mbtn.dim{opacity:.6}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:12px}
.dd{background:#fff;border:2px solid rgba(2,39,83,.25);border-radius:10px;padding:5px 0;display:flex;flex-direction:column;align-items:center}
.dd small{font-size:8px;font-weight:700;opacity:.6}.dd b{font-size:12px}
.dd.got{background:#e3f3e7;border-color:#2fa84f}.dd.now{background:var(--yel);border-color:var(--navy);transform:scale(1.08)}
/* level list sections + paid pack */
#grid .sec{display:flex;justify-content:space-between;align-items:center;padding:6px 4px 0;font-size:13px}
#grid .sec b{font-weight:800;letter-spacing:.8px}#grid .sec span{font-size:11px;font-weight:800;background:var(--navy);color:#fff;border-radius:7px;padding:3px 8px}
.packbar{display:flex;flex-direction:column;align-items:flex-start;gap:3px;background:linear-gradient(135deg,#ffd76a,#ffc20e);border:3px solid var(--navy);border-radius:18px;padding:12px 14px;box-shadow:0 4px 0 rgba(2,39,83,.35);text-align:left;color:var(--navy)}
.packbar b{font-size:17px;font-weight:800}.packbar span{font-size:13px;font-weight:700}
.lv.paid{opacity:.75}.lv.paid .num{background:var(--yel);color:var(--navy)}
#shopTabs{gap:5px}#shopTabs button{font-size:13px;padding:9px 0}
/* animations */
#levelsL:not([hidden]) #levels{animation:lin .3s ease both}
@keyframes lin{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
#endL:not([hidden]) .card,#dlgL:not([hidden]) #dlgBox,#payL:not([hidden]) #paySheet,#adL:not([hidden]) #adBox{animation:cardpop .42s cubic-bezier(.3,1.5,.5,1) both}
@keyframes cardpop{from{transform:scale(.75);opacity:0}to{transform:none;opacity:1}}
#shopL:not([hidden]) #shopSheet{animation:sheetup .38s cubic-bezier(.2,1.15,.4,1) both}
@keyframes sheetup{from{transform:translateY(100%)}to{transform:none}}
#pauseL:not([hidden]) h2,#setL:not([hidden]) h2{animation:cardpop .4s cubic-bezier(.3,1.5,.5,1) both}
#pauseL:not([hidden]) .srow,#setL:not([hidden]) .srow{animation:fadeup .35s .08s ease backwards}
.layer:not([hidden]) .btn,.layer:not([hidden]) .lowbtns .mbtn{animation:btnin .45s .12s cubic-bezier(.3,1.6,.5,1) backwards}
@keyframes btnin{from{transform:scale(.4);opacity:0}}
#grid .lv{animation:fadeup .3s ease backwards}
#grid .lv:nth-child(-n+6){animation-delay:.05s}
#hud .tl,#hud .tr{animation:fadeup .4s ease backwards}
'''
rep('#flash{position:absolute;inset:0;', css + '#flash{position:absolute;inset:0;')
open('shell5.html', 'w').write(s)
print('ok')
