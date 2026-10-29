const {chromium}=require('playwright-core');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
for(const v of process.argv.slice(3)){const [g,n]=v.split(':');await p.goto(`http://localhost:8765/ill2.html?g=${g}&n=${n}&s=${process.argv[2]}`);
await p.waitForFunction('window.RESULT',null,{timeout:60000});const d=await p.evaluate('window.RESULT');fs.writeFileSync(`ill_${g}_${n}.png`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();})();
