const U=process.argv.slice(2);
for(const u of U){ try{ const r=await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36','accept':'text/html,application/json,*/*',...(/\.(csv|gz|zip|parquet)(\?|$)/.test(u)?{'range':'bytes=0-3000'}:{})}}); const t=await r.text();
  let out=t.slice(0,1500).replace(/\s+/g,' '); try{ const j=JSON.parse(t); if(Array.isArray(j))out=j.map(x=>x.id+(x.downloads!=null?' ['+x.downloads+']':'')).join(' | '); else if(j.siblings)out=j.siblings.map(s=>s.rfilename).join(' | '); }catch(e){}
  console.log('==',r.status,u,'\n',out); }catch(e){ console.log('== ERR',u,String(e)); } }
