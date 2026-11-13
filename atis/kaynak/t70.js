const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:200,height:400}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/'+(process.env.PAGE||'sim.html')+'?bot=1');await p.waitForTimeout(1500);
const [a,z,step]=process.argv[2].split(',').map(Number);const nzs=(process.env.NZS||'0,1,2').split(',').map(Number);
for(let i=a;i<=z;i+=step||1)for(const nz of nzs){const t0=Date.now();const r=await p.evaluate(([i,nz])=>__A.simPlay(i,nz,1234+i),[i,nz]);console.log(JSON.stringify(Object.assign(r,{nz,ms:Date.now()-t0})));}
await b.close();})();
