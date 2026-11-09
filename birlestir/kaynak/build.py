import base64,os,re,sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
toy=open('../shared/toy.js').read()
toy='\n'.join(l for l in toy.split('\n') if not l.startswith('let THREE;') and not l.startswith('//'))
toy=re.sub(r'^export ','',toy,flags=re.M)
logo='data:image/webp;base64,'+base64.b64encode(open('../shared/logo_s.webp','rb').read()).decode()
h=open('shell.html').read().replace('@@LOGO@@',logo).replace('@@TOY@@',toy).replace('@@CORE@@',open('core2048.js').read()).replace('@@GAME@@',open('game.js').read())
out=sys.argv[1] if len(sys.argv)>1 else 'flix-birlestir.html'
open(out,'w').write(h); print(out,len(h))
