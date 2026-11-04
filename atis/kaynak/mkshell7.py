import sys
h = open('shell6.html').read()
def rep(old, new):
    global h
    if h.count(old) != 1: sys.exit('miss: ' + old[:80])
    h = h.replace(old, new)
css = """
.wpick{display:flex;gap:7px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:3px 2px 6px;scroll-snap-type:x proximity}
.wpick::-webkit-scrollbar{display:none}
.wc{flex:0 0 auto;min-width:86px;scroll-snap-align:center}
.wc b{font-size:15px;white-space:nowrap}
.wc.buy{background:#fff7d6;color:var(--navy)}.wc.buy small{opacity:1}
#levels #wtabs{padding:12px 14px 2px}
/* shop v7 */
.item{background:linear-gradient(180deg,#fff 0%,#fff 55%,color-mix(in srgb,var(--rc,#5a6a80) 10%,#fff) 100%);padding-top:17px}
.item .rar{position:absolute;left:0;right:0;top:0;height:13px;border-radius:12px 12px 0 0;background:var(--rc,#5a6a80);color:#fff;font-style:normal;font-size:8.5px;font-weight:800;letter-spacing:.9px;line-height:13px;text-align:center}
.item .pv{border-radius:50%;background:radial-gradient(circle at 50% 42%,#fff 0 40%,color-mix(in srgb,var(--rc,#5a6a80) 18%,#fff) 72%);width:58px;height:58px;padding:2px}
.item.eq{background:linear-gradient(180deg,#f1fbf3,#dff4e4)}
.item.try{background:linear-gradient(180deg,#fff8d8,#ffe8a0)}
#shopInfo{position:absolute;left:50%;transform:translateX(-50%);top:calc(var(--sat) + 62px);display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none}
#shopInfo b{font-family:'Barlow Condensed',Impact,sans-serif;font-style:italic;font-weight:900;font-size:30px;color:#fff;letter-spacing:.5px;text-shadow:0 3px 0 var(--navy),0 0 2px var(--navy);-webkit-text-stroke:1.5px var(--navy);white-space:nowrap}
#shopInfo span{font-size:11px;font-weight:800;letter-spacing:1.2px;color:#fff;border:2px solid var(--navy);border-radius:8px;padding:2px 9px}
"""
rep("</style></head><body>", css + "</style></head><body>")
rep('<div id="shopSheet">', '<div id="shopInfo" hidden></div>\n  <div id="shopSheet">')
rep('<span>4 dünya · 80 bölüm</span>', '<span>9 harita · 180 bölüm</span>')
open('shell7.html', 'w').write(h); print('ok')
