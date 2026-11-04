import sys
h = open('shell5.html').read()
def rep(old, new):
    global h
    if h.count(old) != 1: sys.exit('miss: ' + old[:80])
    h = h.replace(old, new)
css = """
.wpick{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.wc{--wc:#e22511;position:relative;background:#fff;color:var(--navy);border:3px solid var(--navy);border-radius:14px;padding:7px 2px 6px;display:flex;flex-direction:column;align-items:center;gap:1px;box-shadow:0 3px 0 rgba(2,39,83,.45);overflow:hidden}
.wc::before{content:'';position:absolute;left:0;right:0;top:0;height:5px;background:var(--wc)}
.wc b{font-family:'Barlow Condensed',Impact,sans-serif;font-style:italic;font-weight:900;font-size:16px;letter-spacing:.3px;margin-top:3px}
.wc small{font-size:10.5px;font-weight:800;opacity:.75;display:flex;align-items:center;gap:2px}
.wc.on{background:var(--wc);color:#fff;transform:translateY(-2px);box-shadow:0 5px 0 var(--navy)}.wc.on::before{background:var(--yel)}
.wc.lock{background:#d9dde6;color:#6a7488;box-shadow:none}
.wc:active{transform:translateY(2px)}
#levels #wtabs{padding:12px 16px 0}
#levels #wtabs .wc.on{box-shadow:0 4px 0 var(--navy)}
#lvWorld{margin:10px 16px 0;font-weight:800;font-size:13px;letter-spacing:.8px;color:var(--navy)}
.wnote{margin:0 4px;font-size:12px;font-weight:700;color:var(--navy);opacity:.75}
"""
rep("</style></head><body>", css + "</style></head><body>")
rep('<button class="hplay" id="play">', '<div class="wpick" id="wpick"></div>\n    <button class="hplay" id="play">')
rep('<span>2 sokak · 20 bölüm</span>', '<span>4 dünya · 80 bölüm</span>')
rep('<div id="grid"></div></div>', '<div class="wpick" id="wtabs"></div><p id="lvWorld"></p><div id="grid"></div></div>')
open('shell6.html', 'w').write(h); print('ok')
