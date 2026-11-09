import base64, subprocess, sys, os
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'flix-fabrika.html')
subprocess.run(['npx', 'esbuild', 'game.js', '--bundle', '--format=iife', '--minify', '--target=es2020', '--outfile=bundle.js', '--log-level=warning'], cwd=here, check=True)
fd = os.path.join(here, '..', 'fonts')
def ff(fam, file, w, st='normal', rng=None):
    b = base64.b64encode(open(os.path.join(fd, file), 'rb').read()).decode()
    return "@font-face{font-family:%s;font-style:%s;font-weight:%s;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')%s}" % (fam, st, w, b, (';unicode-range:' + rng) if rng else '')
fonts = ''.join([ff('BC', 'barlow-condensed-latin-900-italic.woff2', 900, 'italic'), ff('BC', 'barlow-condensed-latin-ext-900-italic.woff2', 900, 'italic', 'U+0100-024F'),
  ff('R', 'rubik-latin-400-normal.woff2', 400), ff('R', 'rubik-latin-ext-400-normal.woff2', 400, 'normal', 'U+0100-024F'),
  ff('R', 'rubik-latin-500-normal.woff2', 500), ff('R', 'rubik-latin-ext-500-normal.woff2', 500, 'normal', 'U+0100-024F'),
  ff('R', 'rubik-latin-700-normal.woff2', 700), ff('R', 'rubik-latin-ext-700-normal.woff2', 700, 'normal', 'U+0100-024F'),
  ff('R', 'rubik-latin-800-normal.woff2', 800), ff('R', 'rubik-latin-ext-800-normal.woff2', 800, 'normal', 'U+0100-024F')])
logo = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(here, 'logo.webp'), 'rb').read()).decode()
html = open(os.path.join(here, 'shell.html')).read().replace('/*FONTS*/', fonts).replace('/*LOGO*/', logo)
js = open(os.path.join(here, 'bundle.js')).read().replace('</script', '<\\/script')
ads = ''.join('window.AD_%s="data:image/webp;base64,%s";' % (k, base64.b64encode(open(os.path.join(here, f), 'rb').read()).decode()) for k, f in [('RUSH', 'ad_rush.webp'), ('KICKUP', 'ad_kickup.webp')])
html = html.replace('/*ADS*/', ads)
html = html.replace('/*INTRO*/', open(os.path.join(here, 'intro.html')).read()).replace('/*GAME*/', js)
open(out, 'w').write(html); print(out, len(html) // 1024, 'KB')
