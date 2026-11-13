import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s = open(os.environ.get('SRC','game10.js')).read()
sim = r'''
function simPlay(i, nz, rs) {
  let sd = rs || 1; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }, gr = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  startLevel(i); let from = P.from.clone(), shots = 0, pen = 0, stuck = 0, high = 0, same = 0; const log = [];
  while (shots < 16) {
    const s = solveShot(from), ang = s.ang + gr() * nz * 0.12, pw = clamp(s.pow + gr() * nz * 0.1, 0.05, 1);
    const B = newBody(from, launchVel(ang, pw)); B.autoOpen = s.open; const lv = lvPhys();
    while (!B.done) stepBody(B, 1 / 120, LV.wind, lv);
    shots++;
    if (B.done === 'in') return {i, ok: 1, shots, pen, stuck, high, sc: Math.round(s.sc), log: log.join(' ')};
    if (B.t > 9) { stuck++; log.push('T@' + B.p.x.toFixed(1) + ',' + B.p.y.toFixed(1) + ',' + B.p.z.toFixed(1)); }
    const I = islandAt(B.p.x, B.p.z), onGround = B.done === 'rest' && I && B.p.y > -0.4;
    if (onGround) { const nf = freeLie(new V3(B.p.x, B.p.y, B.p.z)); if (nf.y - I.top > 1) { high++; log.push('H@' + nf.x.toFixed(1) + ',' + nf.y.toFixed(1) + ',' + nf.z.toFixed(1)); } if (nf.distanceTo(from) < 0.5) same++; else same = 0; from = nf; }
    else { shots++; pen++; log.push('P'); }
    if (same >= 3) { log.push('SAME@' + from.x.toFixed(1) + ',' + from.z.toFixed(1)); break; }
  }
  return {i, ok: 0, shots, pen, stuck, high, log: log.join(' ')};
}
'''
s = s.replace("window.__A = {", sim + "\nwindow.__A = {simPlay, ", 1)
open('gsim.js','w').write(s)
