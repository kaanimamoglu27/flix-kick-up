const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:2});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/../test8.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(4000);
for(const v of ['A','B','C']){
await p.evaluate((v)=>{
 const X=__A.X,T=THREE;__A.startLevel(3);__A.P.intro=0;
 document.querySelectorAll('body > *').forEach(e=>{if(!e.querySelector||!e.querySelector('canvas'))e.style.visibility='hidden'});
 const bk=X.bucket; X.world.children.forEach(c=>{c.visible=false}); bk.g.visible=true; X.scene.fog.near=500;X.scene.fog.far=900;
 X.scene.children.forEach(c=>{if(c.isMesh&&c!==X.toyRoot&&c.geometry&&c.geometry.type==='CircleGeometry')c.visible=false});
 const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d');
 const g=x.createRadialGradient(512,600,40,512,560,760);g.addColorStop(0,v==='B'?'#ffd23a':'#ff5a2a');g.addColorStop(0.45,v==='B'?'#ff8a1a':'#e22511');g.addColorStop(1,v==='B'?'#e22511':'#8a0c05');x.fillStyle=g;x.fillRect(0,0,1024,1024);
 x.translate(512,600);for(let i=0;i<24;i++){x.rotate(Math.PI/12);x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.moveTo(0,0);x.lineTo(900,-110);x.lineTo(900,110);x.fill();}
 window.__BG=new T.CanvasTexture(cv);
 window.__STOP=1;
 const tr=X.toyRoot, bp=new T.Vector3(bk.x,bk.y,bk.z);
 bk.flag.visible=false; bk.g.children.forEach(c=>{if(c.geometry&&c.geometry.type==='CylinderGeometry'&&c.position.x>0.5)c.visible=false});
 if(bk.beam)bk.beam.visible=false; if(bk.glow)bk.glow.visible=false;
 const cfg={A:[-0.15,1.45,0.1,0.35,-0.45],B:[0.1,1.35,0.2,0.25,0.3],C:[0.0,1.25,0.0,0.15,-0.15]}[v];
 tr.position.set(bp.x+cfg[0],bp.y+cfg[1],bp.z+cfg[2]); tr.rotation.set(cfg[3],0.4,cfg[4]); window.__TR=[tr.position.clone(),cfg];
 const cam=X.camera; cam.aspect=1; cam.fov=v==='C'?38:42; cam.updateProjectionMatrix();
 cam.position.set(bp.x+0.8,bp.y+2.2,bp.z+4.7); window.__camFix=[cam.position.clone(),new T.Vector3(bp.x,bp.y+1.2,bp.z)];
},v);
await p.waitForTimeout(400);
// keep our camera: the game loop moves it each frame, so render once ourselves
const data=await p.evaluate(()=>{const X=__A.X;X.scene.background=window.__BG;const [tp,cf]=window.__TR;X.toyRoot.position.copy(tp);X.toyRoot.rotation.set(cf[3],0.4,cf[4]);X.toyRoot.updateMatrixWorld(true);const [cp,lk]=window.__camFix;X.camera.position.copy(cp);X.camera.lookAt(lk);X.renderer.setSize(1024,1024,false);X.renderer.render(X.scene,X.camera);return X.renderer.domElement.toDataURL('image/png')});
require('fs').writeFileSync('icon_'+v+'_raw.png',Buffer.from(data.split(',')[1],'base64'));console.log('icon',v);
}
await b.close();})();
