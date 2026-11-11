import base64,os,re,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
VER='1.2'
def strip(s): return re.sub(r'^export ','',s,flags=re.M)
logo='data:image/webp;base64,'+base64.b64encode(open('logo_s.webp','rb').read()).decode()
h=open('shell.html').read()
rep={'@@INTRO@@':open('intro.html').read(),'@@LOGO@@':logo,'@@LEGAL@@':open('flix-legal.js').read(),'@@MUSIC@@':strip(open('music.js').read()).replace('{ TRACKS };',''),'@@CHARS@@':open('chars.js').read(),'@@WORLD@@':open('world.js').read(),'@@GAME@@':open('game.js').read(),'@@VER@@':VER}
for k in ['@@INTRO@@','@@LOGO@@','@@LEGAL@@','@@MUSIC@@','@@CHARS@@','@@WORLD@@','@@GAME@@','@@VER@@']: h=h.replace(k,rep[k])
out=sys.argv[1] if len(sys.argv)>1 else 'flix-bomba.html'
open(out,'w').write(h); print(out,len(h))
