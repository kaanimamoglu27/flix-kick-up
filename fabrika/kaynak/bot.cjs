const {chromium}=require('playwright');const fs=require('fs');
const skill=process.argv[2]||'orta', maxH=+(process.argv[3]||8), file=process.argv[4]||'fb11';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{if(!sessionStorage.getItem('s')){sessionStorage.setItem('s',1);localStorage.clear();}});
await p.goto('http://localhost:8765/'+file+'/flix-fabrika.html');await p.waitForFunction(()=>window.__fb,{timeout:60000});await p.waitForTimeout(2500);
await p.evaluate(()=>document.getElementById('mmPlay').click());await p.waitForTimeout(1500);
await p.addScriptTag({content:fs.readFileSync(__dirname+'/bot.js','utf8')});
await p.evaluate((s)=>{__fb.SV.noads=1;__fb.bot(true);window.B=mkBot(s);},skill);
const t0=Date.now();let last=0;
while(true){const r=await p.evaluate(()=>{for(let i=0;i<4000;i++){B.step(0.05);__fb.tick(1,0.05);if(B.done)break;}return {T:Math.round(B.T),done:B.done,n:__fb.SV.unl.length,m:Math.round(__fb.SV.money)}});
 if(r.T-last>=1800){last=r.T;console.log(skill,'t',(r.T/60).toFixed(0)+'dk','pads',r.n,'m',r.m,'real',Math.round((Date.now()-t0)/1000)+'s');}
 if(r.done||r.T>maxH*3600)break;}
const dbg=await p.evaluate(()=>{const P=__fb.P.o.position;const a=[P.x,P.z];__fb.joy(-0.8,0.6);__fb.tick(10,0.05);const b2=[P.x,P.z];const path=__fb.I().navPath(P.x,P.z,-6.2,-3.5).map(v=>[v.x.toFixed(1),v.z.toFixed(1)]);return {a,b2,path,B:__fb.BOUNDS}});console.log('DBG',JSON.stringify(dbg));
const out=await p.evaluate(()=>({hist:B.hist,stuck:B.stuck,kind:B.kind,tgt:B.tgt,wait:B.wait,pos:__fb.P.o.position,st:__fb.P.stack.map(o=>o.userData.type),asm:__fb.asm,pads:__fb.I().padObjs.map(o=>o.p.id+':'+(o.p.cost-o.paid)),press:__fb.I().pressPile&&__fb.I().pressPile.n,farm:__fb.I().farmPile&&[__fb.I().farmPile.n,__fb.I().farmPile.zone],tk:__fb.turkeys&&__fb.turkeys.length,W:__fb.W,act:__fb.act,ts:__fb.test,pen:__fb.I().penPile&&__fb.I().penPile.n,K:__fb.K,done:B.done,log:B.log,up:__fb.SV.up,staff:__fb.SV.staff,pl:__fb.SV.made}));
console.log('DUMP',await p.evaluate(()=>{const I=__fb.I();return JSON.stringify({st:I.P.stack.map(o=>o.userData.type),press:I.pressPile&&I.pressPile.n,farm:I.farmPile&&I.farmPile.n,asm:__fb.asm,unl:I.SV.unl.slice(-5),corn:__fb.corn(),pos:[I.P.o.position.x,I.P.o.position.z]})}));
console.log('RESULT',skill,JSON.stringify(out));console.log(errs.slice(0,5));await b.close();})();
