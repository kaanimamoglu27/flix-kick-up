# v1.4: makes flix-bomba.html a complete standalone document for the iOS app and the web:
# doctype + viewport, fonts inlined, three.js bundled in (no CDN), so it runs offline inside Capacitor.
import re,subprocess,os,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
EB=os.environ.get('ESBUILD_DIR','../eb')   # folder with node_modules/esbuild and node_modules/three (npm i esbuild three@0.170.0)
f=sys.argv[1] if len(sys.argv)>1 else 'flix-bomba.html'
h=open(f).read()
m=re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>',h); assert m
h=h.replace(m.group(0),'<style>'+open('fonts.css').read()+'</style>')
im=re.search(r'<script type="importmap">.*?</script>\s*',h,flags=re.S); assert im
h=h.replace(im.group(0),'')
ms=re.search(r'<script type="module">(.*?)</script>',h,flags=re.S); assert ms and len(re.findall(r'<script type="module">',h))==1
open(EB+'/entry.mjs','w').write(ms.group(1))
subprocess.run([EB+'/node_modules/.bin/esbuild','entry.mjs','--bundle','--format=esm','--minify','--target=es2020,safari14','--legal-comments=none','--outfile=out.mjs','--log-level=warning'],cwd=EB,check=True)
js=open(EB+'/out.mjs').read().replace('</script','<\\/script').replace('<!--','<\\!--')
h=h[:ms.start()]+'<script type="module">'+js+'</script>'+h[ms.end():]
assert 'jsdelivr' not in h and 'googleapis' not in h
head='<!doctype html>\n<html lang="tr"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="theme-color" content="#1f9ee8"><meta name="format-detection" content="telephone=no">\n'
assert not h.lstrip().lower().startswith('<!doctype')
open(f,'w').write(head+h); print('packed',f,len(head+h))
