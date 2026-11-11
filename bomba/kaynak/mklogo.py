from PIL import Image, ImageFilter, ImageDraw
import numpy as np, sys
im=Image.open('/mnt/project-files/flix/kickup/flix-logo-seffaf.png').convert('RGBA')
pad=40; W,H=im.size
c=Image.new('RGBA',(W+2*pad,H+2*pad),(0,0,0,0)); c.alpha_composite(im,(pad,pad)); im=c; W,H=im.size
cx,cy,rx,ry,ang=[float(v) for v in sys.argv[1:6]]
S=3; L=Image.new('RGBA',(W*S,H*S),(0,0,0,0)); d=ImageDraw.Draw(L)
d.ellipse([(W/2-rx)*S,(H/2-ry)*S,(W/2+rx)*S,(H/2+ry)*S],fill=(226,37,17,255),outline=(2,39,83,255),width=int(13*S))
L=L.rotate(ang,resample=Image.BICUBIC,center=(W*S/2,H*S/2),translate=((cx-W/2)*S,(cy-H/2)*S)).resize((W,H),Image.LANCZOS)
out=Image.alpha_composite(L,im)
halo=Image.fromarray((np.array(out)[...,3]>40).astype('uint8')*255).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(1.2))
nv=Image.new('RGBA',(W,H),(2,39,83,255)); nv.putalpha(halo)
out=Image.alpha_composite(nv,out); out.save('logo_red.png')
s=out.copy(); s.thumbnail((440,440),Image.LANCZOS); s.save('logo_s.webp',quality=92,method=6)
bg=Image.new('RGBA',(W,H),(31,158,232,255)); bg.alpha_composite(out); bg.convert('RGB').resize((W//2,H//2)).save('logo_red_prev.png')
