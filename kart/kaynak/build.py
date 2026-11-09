import base64,os,re,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def strip(s): return re.sub(r'^export ','',s,flags=re.M)
toy='\n'.join(l for l in open('../shared/toy.js').read().split('\n') if not l.startswith('let THREE;') and not l.startswith('//'))
logo='data:image/webp;base64,'+base64.b64encode(open('../shared/logo_s.webp','rb').read()).decode()
h=open('shell.html').read().replace('@@BASE@@',open('base.css').read()).replace('@@LOGO@@',logo).replace('@@TOY@@',strip(toy)).replace('@@TRACKS@@',strip(open('tracks.js').read())).replace('@@RACE@@',strip(open('race.js').read())).replace('@@GAME@@',open('game.js').read())
out=sys.argv[1] if len(sys.argv)>1 else 'flix-kart.html'
open(out,'w').write(h); print(out,len(h))
