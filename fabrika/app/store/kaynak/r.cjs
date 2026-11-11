const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [dir,w,h] of [['iphone_6.9_1290x2796',430,932],['iphone_6.5_1242x2688',414,896]]){require('fs').mkdirSync(__dirname+'/../'+dir,{recursive:true});
const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:3});
for(const l of ['tr','en'])for(let i=1;i<=8;i++){await p.goto('file://'+__dirname+`/frame.html?s=${i}&l=${l}`);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.getElementById('shot').complete);await p.waitForTimeout(150);await p.screenshot({path:`${__dirname}/../${dir}/${l}_${i}.png`});}
await p.close();}await b.close();})();
