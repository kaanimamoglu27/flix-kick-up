const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const L of (process.env.LS||'tr,en').split(',')){
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:3});p.on('pageerror',e=>console.log('ERR',e.message));
await p.addInitScript((l)=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s',1);localStorage.clear();localStorage.setItem('flix_fab_mode','end');localStorage.setItem('flix_fab_lang',l);}},L);
await p.goto('http://localhost:8765/fb13/flix-fabrika.html');await p.waitForFunction(()=>window.__fb,{timeout:60000});await p.waitForTimeout(3500);
await p.evaluate(()=>document.getElementById('mmPlay').click());await p.waitForTimeout(1500);
await p.evaluate(()=>{__fb.SV.money=482500;__fb.SV.gems=240;});
await p.addStyleTag({content:'#vipTag,#hint,#goal{display:none!important}'});
const sh=async n=>{await p.waitForTimeout(300);await p.screenshot({path:`sh/${L}_${n}.png`,timeout:120000});console.log(L,n)};
const go=async(x,z,w=5000)=>{await p.evaluate(([x,z])=>__fb.tp(x,z),[x,z]);await p.waitForTimeout(w);};
// warm up: let workers and customers fill the place
if(!process.env.ONLY8){await go(2,8,9000); await sh(1);
await go(-1,-13,6000); await sh(2);
await go(7.6,-1.2,6000); await sh(3);
// show: simulate kicks then render
await go(4,9,1500);
await p.evaluate(()=>{__fb.bot(true);__fb.tp(8.8,6.0);__fb.tick(30,0.033);const S=__fb.show();let taps=0,t=0;
 while(S.on&&taps<14&&t<5000){__fb.tick(1,0.016);t++;if(S.v<0&&S.y<0.75&&S.y>0.4){__fb.showTap();taps++;}} __fb.tick(14,0.016);__fb.bot(false);});
await p.waitForTimeout(150); await sh(4);
await p.evaluate(()=>{__fb.bot(true);const S=__fb.show();for(let i=0;i<400&&S.on;i++)__fb.tick(1,0.016);__fb.bot(false);});
await go(33.5,10.5,6000); await sh(5);
const oz=await p.evaluate(()=>{const Z=__fb.I().ZONES.ofis;return [Z.pos.x,Z.pos.z]}); await go(oz[0],oz[1],3000); await sh(6);
await p.evaluate(()=>document.getElementById('shX').click()); await go(4,11.5,5000); await sh(7);
}await p.evaluate(()=>{document.querySelector('#menuB');});
await p.evaluate(()=>{const b=document.querySelector('#mm [data-p="dolap"]');document.body.classList.remove('menu');b.click();}); await p.waitForTimeout(1200); await sh(8);
await p.close();}
await b.close();})();
