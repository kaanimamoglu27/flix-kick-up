const {chromium}=require('playwright-core');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('C:',m.text())});
for(const v of process.argv.slice(3)){const t=Date.now();await p.goto(`http://localhost:8765/mc.html?v=${v}&s=${process.argv[2]}`);
try{await p.waitForFunction('window.RESULT',null,{timeout:240000});const d=await p.evaluate('window.RESULT');fs.writeFileSync(`mc_${v}.png`,Buffer.from(d.split(',')[1],'base64'));console.log('ok',v,Date.now()-t);}catch(e){console.log('fail',v,e.message.slice(0,100))}}
await b.close();})();
