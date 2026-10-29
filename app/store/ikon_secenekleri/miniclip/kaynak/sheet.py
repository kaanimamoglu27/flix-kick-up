import sys
from PIL import Image, ImageDraw, ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
g=sys.argv[1]; T=300;pad=30;cols=5;rows=3
W=cols*(T+pad)+pad;H=rows*(T+pad+40)+pad
sh=Image.new('RGB',(W,H),'#f2f2f7');d=ImageDraw.Draw(sh)
m=Image.new('L',(T,T),0);ImageDraw.Draw(m).rounded_rectangle((0,0,T-1,T-1),radius=int(T*0.2237),fill=255)
for i in range(15):
    try: im=Image.open(f'mc_{g}{i+1}.png').convert('RGB').resize((T,T),Image.LANCZOS)
    except Exception: continue
    x=pad+(i%cols)*(T+pad);y=pad+(i//cols)*(T+pad+40)
    sh.paste(im,(x,y),m);d.text((x+T//2,y+T+20),str(i+1),fill='#222',font=f,anchor='mm')
sh.save(f'mcsheet_{g}.jpg',quality=88)
