const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/test.html?bot=1');await p.waitForTimeout(800);
for(let i=0;i<5;i++){await p.evaluate(i=>{__A.SAVE.lv={};__A.startLevel(i)},i);const t0=Date.now();
 while(Date.now()-t0<40000){await p.waitForTimeout(400);const st=await p.evaluate(()=>__A.state());if(st==='end')break;}
 console.log(i,await p.evaluate(()=>JSON.stringify(__A.SAVE.lv)+' shot '+__A.P.shot+' '+__A.P.phase));}
await p.evaluate(()=>{__A.startLevel(0)});await p.waitForTimeout(300);
await p.evaluate(()=>{document.querySelector('#hud').hidden=true});
await b.close();})();
