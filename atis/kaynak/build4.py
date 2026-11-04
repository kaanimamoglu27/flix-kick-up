import base64,sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
three = sys.argv[1] if len(sys.argv)>1 else 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
out = sys.argv[2] if len(sys.argv)>2 else 'flix-atis.html'
h=open(os.environ.get('SHELL_F','shell4.html')).read()
h=h.replace('@@LOGO@@','data:image/webp;base64,'+base64.b64encode(open('logo.webp','rb').read()).decode())
h=h.replace('@@THREE@@',three).replace('@@GAME@@',open(os.environ.get('GAME_F','game4.js')).read()).replace('@@INTRO@@',open('intro.html').read().strip())
open(out,'w').write(h); print(out,len(h))
