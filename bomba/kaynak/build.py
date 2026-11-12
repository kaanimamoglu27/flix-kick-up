# Builds the complete standalone page (web + iOS app): doctype + phone viewport + UTF-8, fonts inlined (fonts.css),
# three.js inlined (vendor_three.js, prebuilt IIFE exposing __T3), no network requests. Pure Python, no other tools needed.
# Usage: python3 build.py [output.html]   (default ./flix-bomba.html)
import base64,os,re,sys
out=os.path.abspath(sys.argv[1]) if len(sys.argv)>1 else None
os.chdir(os.path.dirname(os.path.abspath(__file__)))
VER='1.4.1'
def rd(f): return open(f,encoding='utf-8').read()
def strip(s): return re.sub(r'^export ','',s,flags=re.M)
def safe(js): return js.replace('</script','<\\/script').replace('<!--','<\\!--')
logo='data:image/webp;base64,'+base64.b64encode(open('logo_s.webp','rb').read()).decode()
h=rd('shell.html')
rep={'@@INTRO@@':rd('intro.html'),'@@LOGO@@':logo,'@@LEGAL@@':rd('flix-legal.js'),'@@MUSIC@@':strip(rd('music.js')).replace('{ TRACKS };',''),'@@CHARS@@':rd('chars.js'),'@@WORLD@@':rd('world.js'),'@@GAME@@':rd('game.js'),'@@VER@@':VER}
for k in ['@@INTRO@@','@@LOGO@@','@@LEGAL@@','@@MUSIC@@','@@CHARS@@','@@WORLD@@','@@GAME@@','@@VER@@']: h=h.replace(k,rep[k])
# fonts: no Google Fonts request
m=re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>',h); assert m,'font link'
h=h.replace(m.group(0),'<style>'+rd('fonts.css')+'</style>')
# three.js: no CDN, no import map
im=re.search(r'<script type="importmap">.*?</script>\s*',h,flags=re.S); assert im,'importmap'
h=h.replace(im.group(0),'<script>'+safe(rd('vendor_three.js'))+'</script>\n')
imp=re.findall(r"^import [^\n]*from 'three[^\n]*\n",h,flags=re.M); assert len(imp)==3,imp
for i,l in enumerate(imp): h=h.replace(l,"const THREE = __T3, { RoundedBoxGeometry, RoomEnvironment } = __T3;\n" if i==0 else '')
assert 'jsdelivr' not in h and 'googleapis' not in h
assert not h.lstrip().lower().startswith('<!doctype')
head='<!doctype html>\n<html lang="tr"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="theme-color" content="#1f9ee8"><meta name="format-detection" content="telephone=no">\n'
h=head+h
out=out or 'flix-bomba.html'
open(out,'w',encoding='utf-8').write(h); print(out,len(h))
import subprocess; subprocess.run([sys.executable,'check_page.py',out],check=True)   # fail the build if the page is not app-safe
