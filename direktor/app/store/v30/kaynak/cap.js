// 8 oyun içi ekran: node cap.js  (game.html = oyunun test kopyası)
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:430,height:932},deviceScaleFactor:3});const E=[];p.on('pageerror',e=>E.push(e.message));
const shot=async n=>{await p.waitForTimeout(250);await p.screenshot({path:__dirname+`/sh/${n}.png`});console.log('shot',n);};
const clean=()=>p.evaluate(()=>{window.interAdG=f=>f();window.interAd=f=>f&&f();}).then(()=>p.evaluate(()=>document.querySelectorAll('.sheet,.adfx,.cfly,.toast,.tipb,.fx,.tropop').forEach(x=>x.remove())));
await p.goto('file://'+__dirname+'/game.html');await p.waitForTimeout(2500);
await p.evaluate(()=>{store.set('fdHow',1);document.querySelectorAll('.howsh,#flixIntro').forEach(x=>x.remove());store.set('fdTip_m1',1);store.set('fdTip_m2',1);
  Object.assign(COACH,{name:'Kaan Hoca',skin:1,hair:2,hairc:0,beard:4,glasses:0,outfit:0});store.set('fdCoach',COACH);ENT.club=true;store.set('fdCoin',2450);});
// 1 canlı maç  2 karar anı  3 hoca ne yaptı
await p.evaluate(()=>{ const sc=REAL.filter(x=>x.cat==='leg').find(x=>x.h==='GAL'||x.a==='GAL')||REAL[0]; playReal0(sc,sc.h==='GAL'?'h':'a'); });
await p.waitForFunction(()=>LIVE&&LIVE.M.m>=17,null,{timeout:60000}); await p.evaluate(()=>{LIVE.cs&&(LIVE.cs.sh.h=Math.max(LIVE.cs.sh.h,3));}); await p.waitForTimeout(600); await clean(); await shot(1);
await p.waitForFunction(()=>LIVE&&LIVE.mode==='dec',null,{timeout:90000}); await p.waitForTimeout(1600); await clean();
await p.evaluate(()=>{ LIVE.sel=LIVE.opts[0]; drawHand(); }); await shot(2);
await p.evaluate(()=>decide()); await p.waitForTimeout(900); await p.evaluate(()=>document.querySelectorAll('.toast,.cfly').forEach(x=>x.remove())); await shot(3);
// 4 maç sonu karşılaştırma
await p.evaluate(()=>{ document.querySelectorAll('.sheet').forEach(x=>x.remove()); LIVE.fast=true; ffTo(LIVE.target); });
for(let i=0;i<600;i++){ const done=await p.evaluate(()=>{ if(LIVE){ LIVE.fast=true; if(LIVE.mode==='dec'){ LIVE.sel=LIVE.opts[0]; decide(); } } const s=document.querySelector('.sheet [data-n]'); if(s)s.click(); const t=document.querySelector('.sheet [data-k]'); if(t)t.click(); const o=document.querySelector('.sheet [data-ok], .sheet .injsh [data-x]'); if(o)o.click(); return !document.querySelector('#result').hidden; }); if(done)break; await p.waitForTimeout(250); }
await p.waitForTimeout(2500); await clean(); await shot(4);
// 5 kariyer: derbi + görevler
await p.evaluate(()=>{ window.euroPending=()=>null; CSLOT=3; newStory('2425','GAL'); document.querySelectorAll('.sheet').forEach(x=>x.remove()); ST.week=6; ST.played={}; ST.ms=[{k:'cs',n:2,done:0},{k:'der',n:1,done:1},{k:'beat',n:0,done:0}]; ST.motm=1;
  const fx=fixtures(ST.season); for(let w=0;w<fx.length;w++){ const m=fx[w].find(([h,a])=>h===ST.team||a===ST.team); if(w>=6&&m&&isDerby(m[0],m[1])){ ST.week=w; break; } }
  for(let w=0;w<ST.week;w++){ const m=fx[w].find(([h,a])=>h===ST.team||a===ST.team); if(m)ST.played[m[0]+'-'+m[1]]=m[0]===ST.team?[2,0]:[0,2]; } hub(); });
await p.waitForTimeout(2600); await clean(); await shot(5);
// 6 basın toplantısı
await p.evaluate(()=>{ const xi=ST.roster.slice(0,11); pressSheet({you:'h',my:3,op:1,xi,scorers:[{s:'h',id:xi[9]}],worst:xi[4]},()=>{}); });
await p.waitForTimeout(4500); console.log('Q',await p.evaluate(()=>document.querySelector('#pcQ').outerHTML.slice(0,300))); await p.evaluate(()=>document.querySelectorAll('.cfly,.toast,.tropop').forEach(x=>x.remove())); await shot(6);
// 7 bu haftanın gerçek maçları
await p.evaluate(()=>{ document.querySelectorAll('.sheet').forEach(x=>x.remove()); pickScreen('dream'); document.querySelector('#seasonTabs [data-s="2021"]').click(); document.querySelector('#teamList .team[data-c="FEN"]').click(); document.querySelector('#seasonTabs [data-s="1516"]').click(); }); await p.waitForTimeout(900); await p.evaluate(()=>document.querySelectorAll('.cfly,.toast,.tropop').forEach(x=>x.remove())); await shot(7);
// 8 ayın hocası
await p.evaluate(()=>{ hub(); document.querySelectorAll('.sheet').forEach(x=>x.remove()); ST.motmQ={pts:12,real:7}; ST.motm=2; motmSheet(); }); await p.waitForTimeout(1300); await p.evaluate(()=>document.querySelectorAll('.cfly,.toast').forEach(x=>x.remove())); await shot(8);
console.log('ERRS',JSON.stringify(E)); await b.close();})();
