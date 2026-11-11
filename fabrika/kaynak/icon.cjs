const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:400,height:400}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8765/fb13/flix-fabrika.html');await p.waitForFunction(()=>window.__fb,{timeout:60000});await p.waitForTimeout(3000);
for(const v of ['A','B','C']){const d=await p.evaluate((v)=>__fb.iconShot(v,1024),v);fs.writeFileSync(__dirname+'/../store20/icon_'+v+'.png',Buffer.from(d.split(',')[1],'base64'));console.log(v);}
await b.close();})();
