const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1});const p=await ctx.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(3000);
const cdp=await ctx.newCDPSession(p);
const T=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
await p.tap('#play');await p.waitForTimeout(5500);await p.screenshot({path:'w_aim0.png'});
await T('touchStart',195,420);for(let i=1;i<=12;i++){await T('touchMove',195+i*3,420+i*15);await p.waitForTimeout(16)}
await p.waitForTimeout(250);await p.screenshot({path:'w_drag.png'});
console.log('yaw',await p.evaluate(()=>__A.P.yaw.toFixed(2)));
await T('touchEnd');await p.waitForTimeout(700);await p.screenshot({path:'w_fly.png'});
await T('touchStart',100,300);await p.waitForTimeout(400);console.log('open',await p.evaluate(()=>__A.P.body&&__A.P.body.open));await T('touchEnd');
await p.waitForTimeout(4000);console.log(await p.evaluate(()=>__A.state()+' '+__A.P.phase+' shot '+__A.P.shot+' from '+__A.P.from.z.toFixed(1)));
await p.waitForTimeout(1500);await p.screenshot({path:'w_aim1.png'});
await p.tap('#mapB');await p.waitForTimeout(1800);await p.screenshot({path:'w_map.png'});await p.tap('#mapB');
await p.evaluate(()=>__A.startLevel(3));await p.waitForTimeout(6000);await p.screenshot({path:'w_aim3.png'});
await p.tap('#pauseB');await p.waitForTimeout(300);await p.tap('#menu2');await p.waitForTimeout(500);await p.screenshot({path:'w_levels.png'});
await b.close();})();
