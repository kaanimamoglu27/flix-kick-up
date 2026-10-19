// Flix Direktör canlı bülten: Avrupa liglerinin fikstür, skor ve maç özetlerini çeker.
// Takım ve oyuncu isimleri oyundaki gibi çakma isimlere çevrilir (son ünlü değişir).
import fs from 'fs';
const OUT=process.argv[2], DEBUG=process.env.DEBUG==='1';
const LG=['tur.1','eng.1','esp.1','ita.1','ger.1','uefa.champions','uefa.europa','uefa.europa.conf'];
const B='https://site.api.espn.com/apis/site/v2/sports/soccer/';
const day=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10).replace(/-/g,'');
const SW={a:'e',e:'a','ı':'a',i:'e',o:'u',u:'o','ö':'ü','ü':'ö','á':'e','é':'a','í':'e','ó':'u','ú':'o','ã':'e'}, V='aeıioöuüáéíóúã';
const mw=w=>{ if(w.length<=2||w.endsWith('.'))return w; if(w.includes('-'))return w.split('-').map(mw).join('-');
  const s=[...w]; const idx=s.map((c,i)=>V.includes(c.toLowerCase())&&i>0?i:-1).filter(i=>i>=0); if(!idx.length)return w;
  const i=idx[idx.length-1], c=s[i], n=SW[c.toLowerCase()]||'a'; s[i]=c===c.toUpperCase()?n.toUpperCase():n; return s.join(''); };
const mangle=n=>String(n||'').split(/\s+/).filter(Boolean).map(mw).join(' ');
const get=async u=>{ for(let t=0;t<3;t++){ try{ const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0'}}); if(r.ok)return await r.json(); }catch(e){} await new Promise(r=>setTimeout(r,1500)); } return null; };
const col=c=>/^[0-9a-f]{6}$/i.test(c||'')?'#'+c.toLowerCase():null;
const team=x=>{ const n=mangle(x.team.displayName||x.team.name); return {n,s:n.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g,'').slice(0,3).toUpperCase(),c:col(x.team.color)||'#15215c',c2:col(x.team.alternateColor)||'#ffffff',g:x.score!=null&&x.score!==''?+x.score:null,id:x.team.id}; };
let prev={}; try{ prev=JSON.parse(fs.readFileSync(OUT,'utf8')); }catch(e){}
const out={t:Date.now(),ev:[],sum:{}}; let nsum=0, dbg=!DEBUG;
for(const lg of LG){
  const j=await get(`${B}${lg}/scoreboard?dates=${day(-4)}-${day(8)}&limit=300`); if(!j||!j.events)continue;
  for(const e of j.events){ const c=(e.competitions||[])[0]; if(!c)continue; const hm=c.competitors.find(x=>x.homeAway==='home'), aw=c.competitors.find(x=>x.homeAway==='away'); if(!hm||!aw)continue;
    const st=c.status||e.status||{}, ty=st.type||{};
    const E={id:e.id,lg,d:e.date,st:ty.state||'pre',det:ty.shortDetail||'',clk:st.displayClock||'',h:team(hm),a:team(aw)}; out.ev.push(E);
    if(E.st!=='post'||Date.now()-Date.parse(E.d)>4*864e5)continue;
    if(prev.sum&&prev.sum[e.id]){ out.sum[e.id]=prev.sum[e.id]; continue; }
    if(nsum>=60)continue; nsum++;
    const S=await get(`${B}${lg}/summary?event=${e.id}`); if(!S)continue;
    if(!dbg){ dbg=true; console.log('SUMMARY KEYS',Object.keys(S)); const r=(S.rosters||[])[0]; console.log('ROSTER0',JSON.stringify(r&&{...r,roster:(r.roster||[]).slice(0,2)}).slice(0,2500));
      console.log('KEYEVENTS',JSON.stringify((S.keyEvents||[]).slice(0,8)).slice(0,4000)); console.log('HEADER',JSON.stringify(S.header&&S.header.competitions&&S.header.competitions[0]&&S.header.competitions[0].competitors&&S.header.competitions[0].competitors.map(x=>({ha:x.homeAway,id:x.id,team:x.team&&x.team.id}))).slice(0,600)); }
    const ids={[hm.team.id]:'h',[aw.team.id]:'a'};
    const ro={h:[],a:[]};
    for(const r of (S.rosters||[])){ const sd=r.homeAway==='home'?'h':r.homeAway==='away'?'a':ids[r.team&&r.team.id]; if(!sd)continue;
      ro[sd]=(r.roster||[]).map(p=>({n:mangle(p.athlete&&(p.athlete.displayName||p.athlete.fullName)),aid:p.athlete&&p.athlete.id,p:(p.position&&(p.position.abbreviation||p.position.name))||'',j:p.jersey||'',s:!!p.starter,fp:p.formationPlace||0})); }
    const kev=[];
    for(const k of (S.keyEvents||[])){ const t=((k.type&&(k.type.type||k.type.text))||'').toLowerCase(), sd=k.team?ids[k.team.id]:null, m=k.clock?Math.max(1,Math.ceil((k.clock.value||0)/60)||parseInt(k.clock.displayValue)||1):1;
      const ps=(k.participants||[]).map(x=>x.athlete&&x.athlete.id);
      if(!sd)continue;
      if(t.includes('goal')||t.includes('penalty---scored'))kev.push([m,'g',sd,ps[0]||null,t.includes('own')?1:0]);
      else if(t.includes('substitution'))kev.push([m,'s',sd,ps[1]||null,ps[0]||null,(k.text||'').slice(0,90)]);
      else if(t.includes('yellow'))kev.push([m,'y',sd,ps[0]||null]);
      else if(t.includes('red'))kev.push([m,'r',sd,ps[0]||null]); }
    out.sum[e.id]={ro,kev};
  }
}
const same=prev.ev&&JSON.stringify({ev:prev.ev,sum:prev.sum})===JSON.stringify({ev:out.ev,sum:out.sum});
console.log('events',out.ev.length,'summaries',Object.keys(out.sum).length,'new',nsum,'changed',!same);
if(!same||DEBUG)fs.writeFileSync(OUT,JSON.stringify(out));
