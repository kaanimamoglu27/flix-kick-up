const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:200,height:400}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/test10.html?bot=1');await p.waitForTimeout(1500);await p.evaluate(()=>{window.__noNext=1});
const only=process.argv[2]?process.argv[2].split(',').map(Number):[...Array(20).keys()];
for(const i of only){
 const t=await p.evaluate(([i,NZ])=>{__A.SAVE.lv={};const t0=performance.now();__A.startLevel(i);__A.LV.par=12;window.__noise=NZ;const s=__A.solveShot(__A.P.from);return {ms:Math.round(performance.now()-t0),s}},[i,+(process.env.NZ||0)]);
 const t0=Date.now();let log=[];let lastShot=-1;
 while(Date.now()-t0<400000){await p.waitForTimeout(300);const st=await p.evaluate(()=>({st:__A.state(),shot:__A.P.shot,pen:__A.P.pen,ph:__A.P.phase,x:+__A.P.from.x.toFixed(1),z:+__A.P.from.z.toFixed(1)}));
  if(st.shot!==lastShot){lastShot=st.shot;log.push(st.x+','+st.z)}
  if(st.st==='end'){const r=await p.evaluate(()=>({t:document.getElementById('endT').textContent,shot:__A.P.shot,pen:__A.P.pen,par:__A.LV.par}));console.log(i,JSON.stringify(r),'solve',t.ms+'ms',log.join(' > '));break;}}
 if(Date.now()-t0>=400000)console.log(i,'TIMEOUT',log.join(' > '));
 await p.evaluate(()=>{});}
await b.close();})();
