const {chromium}=require('playwright');
const W=390,H=844;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:2.6,hasTouch:false});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/../test8.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(4000);
await p.evaluate(()=>{const S=__A.SAVE;S.fe=2450;S.tut=1;S.tutDone=1;for(let i=0;i<9;i++){S.wOwn=S.wOwn||{};S.wOwn[i]=1;}for(let i=0;i<64;i++)S.lv[i]={done:1,s:i%4?3:2,best:2};S.world=0;});
const sh=async n=>{await p.screenshot({path:`sh/${n}.png`});console.log('shot',n)};
const start=async i=>{await p.evaluate(i=>{__A.startLevel(i);__A.P.intro=0;document.querySelectorAll('#tut').forEach(e=>e.hidden=true)},i);await p.waitForTimeout(2500);};
const aim=async(dy,dx=0)=>{await p.mouse.move(W/2,H*0.55);await p.mouse.down();await p.mouse.move(W/2+dx/2,H*0.55+dy/2,{steps:4});await p.mouse.move(W/2+dx,H*0.55+dy,{steps:6});await p.waitForTimeout(500);};
const fire=async()=>p.evaluate(()=>{const s=__A.solveShot(__A.P.from);__A.P.yaw=s.ang;window.__shoot? 0:0;return s});
// 1 aim on a Sokak street
await start(4); await aim(150,-8); await sh(1); await p.mouse.up(); await p.waitForTimeout(200);
// 2 flight in Turkiye: aim then release, shoot mid-air
await start(22); {const s=await p.evaluate(()=>{const s=__A.solveShot(__A.P.from);__A.P.yaw=s.ang;return s});
 const full=Math.min(230,H*0.3); await p.mouse.move(W/2,H*0.5);await p.mouse.down();await p.mouse.move(W/2,H*0.5+16+s.pow*(full-16),{steps:8});await p.waitForTimeout(150);await p.mouse.up();await p.waitForTimeout(900);await sh(2);}
// 3 win
await start(0); await p.evaluate(()=>{document.getElementById('tut').hidden=true});
for(let k=0;k<6;k++){ if(await p.evaluate(()=>__A.state())!=='play')break;
 const s=await p.evaluate(()=>{const s=__A.solveShot(__A.P.from);__A.P.yaw=s.ang;return s});const full=Math.min(230,H*0.3);
 await p.mouse.move(W/2,H*0.5);await p.mouse.down();await p.mouse.move(W/2,H*0.5+16+s.pow*(full-16),{steps:8});await p.waitForTimeout(150);await p.mouse.up();await p.waitForTimeout(600);
 let won=false; for(let t=0;t<60;t++){await p.waitForTimeout(200);const r=await p.evaluate(()=>[__A.cam(),__A.state(),__A.P.phase]); if(r[0]==='win'&&!won){won=true;await p.waitForTimeout(900);await sh('3a');} if(r[1]==='end'){await p.waitForTimeout(1600);await sh(3);break;} if(r[2]==='aim'&&t>3)break;}
 if(won)break;}
// 4-6 worlds
await start(44); await aim(120,20); await sh(4); await p.mouse.up(); await p.waitForTimeout(300);
await start(121); await aim(130,-15); await sh(5); await p.mouse.up(); await p.waitForTimeout(300);
await start(162); await aim(140,10); await sh(6); await p.mouse.up(); await p.waitForTimeout(300);
await start(142); await aim(110,0); await sh('6b'); await p.mouse.up(); await p.waitForTimeout(300);
await start(83); await aim(110,0); await sh('6c'); await p.mouse.up(); await p.waitForTimeout(300);
// 7 levels screen with world tabs
await p.evaluate(()=>{__A.SAVE.world=1;__A.openLevels()}); await p.waitForTimeout(1500); await sh(7);
// 8 shop
await p.evaluate(()=>{__A.openShop('skin')}); await p.waitForTimeout(2500); await sh(8);
await b.close();})();
