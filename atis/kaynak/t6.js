const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(1000);
for(const i of [0,2]){await p.evaluate(i=>__A.startLevel(i),i);await p.waitForTimeout(800);
await p.evaluate(()=>{const A=__A.actors();A.forEach((a,k)=>{if(a.kind!=='pigeon'||k%4==0)__A.reactActor(a,{x:a.x+0.8,z:a.z+0.8})});});
await p.waitForTimeout(220);await p.screenshot({path:'r'+i+'.png'});}
await b.close();})();
