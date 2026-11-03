const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:2});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/test.html');await p.waitForTimeout(3000);
await p.evaluate(()=>{__A.startLevel(0);document.querySelectorAll('.layer').forEach(l=>l.style.display='none');
 const X=__A.X,T=THREE;window.__freezeCam=1;
 X.stars().forEach(s=>s.m.visible=false); X.world.children.forEach(c=>{ if(c!==X.bucket.g) c.visible=false; }); X.scene.children.forEach(c=>{ if(c.isMesh&&c.geometry&&c.geometry.type==='CircleGeometry') c.visible=false; });
 const bk=X.bucket; // toy flying above bucket, feathers open, tilted
 X.toyRoot.position.set(bk.x-1.15,bk.rimY+1.75,bk.z+0.5); X.bucket.flag.parent.children.forEach(c=>{ if(c.geometry&&(c.geometry.type==='PlaneGeometry'||c.geometry.type==='CylinderGeometry')) c.visible=false; });
 const dm=new T.MeshBasicMaterial({color:0xffffff}),dg=new T.SphereGeometry(0.075,12,8),om=new T.MeshBasicMaterial({color:0x022753,side:T.BackSide});
 for(let i=1;i<=5;i++){const t=i/6;const m=new T.Mesh(dg,dm);const o=new T.Mesh(dg,om);o.scale.setScalar(1.5);m.add(o);m.position.set(bk.x-1.15+t*1.15,bk.rimY+1.75+Math.sin(t*Math.PI)*0.35-t*1.1,bk.z+0.5-t*0.5);X.scene.add(m);}
 __A.P.phase='aim';
 X.camera.fov=33;X.camera.aspect=1;X.camera.updateProjectionMatrix();
 X.camera.position.set(bk.x+1.2,bk.rimY+3.4,bk.z+7.4);X.camera.lookAt(bk.x-0.5,bk.rimY+0.95,bk.z+0.2);
 X.scene.background=new T.Color(0xe22511);
 window.__icon=1;
});
await p.waitForTimeout(600);
await p.evaluate(()=>{const X=__A.X;X.toyRoot.quaternion.setFromEuler(new THREE.Euler(0.35,0,-0.5));X.toyM.userData.fe.forEach((f,i)=>{const k=i-1;f.rotation.z=-k*1.0;f.rotation.x=-0.45});});
await p.screenshot({path:'icon_raw.png'});await b.close();})();
