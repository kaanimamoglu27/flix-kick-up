import sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src = open('game9.js').read()
def rep(old, new, cnt=1):
    global src
    n = src.count(old)
    if n != cnt: sys.exit('patch miss (%d): %s' % (n, old[:120]))
    src = src.replace(old, new)
# clotheslines only slow FLIX down (once per line), never block it
rep("boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'soft'});",
    "boxes.push({b: [P.x0, P.x1, top + P.h - 1.0, top + P.h, P.z - 0.12, P.z + 0.12], kind: 'slow'});")
rep("_n.subVectors(B.p, _c); const d = _n.length(); if (d >= RAD) continue;\n",
    "_n.subVectors(B.p, _c); const d = _n.length(); if (d >= RAD) continue;\n    if (o.kind === 'slow') { const sl = B.slowed || (B.slowed = []); if (!sl.includes(o)) { sl.push(o); B.v.multiplyScalar(0.72); B.v.y = Math.min(B.v.y, 1.5); if (!hit) hit = 'cloth'; } continue; }\n")
# shop windows by type
rep("function facadeTex(w, h, o) {", open('shops10.js').read() + "\nfunction facadeTex(w, h, o) {")
rep("x.fillStyle = o.sign; x.fillRect(6, sy + 8, W - 12, sh);",
    "const kind = shopKind(o.shop), r10 = lrng([...(o.shop || 'x')].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) + Math.round(W)), em = kind && W > 2.6 * S ? sh : 0;\n    x.fillStyle = kind === 'pharmacy' ? '#d81e1e' : o.sign; x.fillRect(6, sy + 8, W - 12, sh);")
rep("while (x.measureText(o.shop).width > W - 60 && fsz > 18)", "while (x.measureText(o.shop).width > W - 60 - em && fsz > 18)")
rep("x.fillStyle = 'rgba(0,0,0,.35)'; x.fillText(o.shop, W / 2 + 3, sy + 8 + sh / 2 + 3); x.fillStyle = '#fff'; x.fillText(o.shop, W / 2, sy + 8 + sh / 2);",
    "x.fillStyle = 'rgba(0,0,0,.35)'; x.fillText(o.shop, W / 2 + em / 2 + 3, sy + 8 + sh / 2 + 3); x.fillStyle = '#fff'; x.fillText(o.shop, W / 2 + em / 2, sy + 8 + sh / 2);\n    if (em) shopEmblem(x, kind, 18 + sh * 0.42, sy + 8 + sh / 2, sh * 0.36);")
rep("const g2 = o.goods || []; for (let row = 0; row < 2; row++)",
    "const gL = 0.18 * S, gR = W - 0.18 * S, gB = H - 0.22 * S; let drew = false; if (kind) { if (dx - 6 - gL > 40) drew = shopGoods(x, kind, gL, dx - 6, wy, gB, S, r10, o.goods); if (gR - (dx + dw + 6) > 40) drew = shopGoods(x, kind, dx + dw + 6, gR, wy, gB, S, r10, o.goods) || drew; }\n    const g2 = o.goods || []; if (!drew) for (let row = 0; row < 2; row++)")
open('game10.js', 'w').write(src); print('game10.js', len(src))
src = open('game10.js').read()
rep("else if (h === 'hit' || h === 'rim') { SFX.thud(vy0);", "else if (h === 'cloth') { SFX.flap(); squash = 0.45; buzz(6); } else if (h === 'hit' || h === 'rim') { SFX.thud(vy0);")
open('game10.js', 'w').write(src); print('game10.js +cloth', len(src))
rep("window.__A = {buyWorld,", "window.__A = {boxes: () => boxes, facadeTex, buyWorld,")
open('game10.js', 'w').write(src); print('game10.js +api', len(src))
# v11 (1.5.3): animals never knock FLIX off a roof: pigeons fly off (no effect), cats/dogs slow it a little, only people bounce it
rep("    if (d < 1e-5) _n.set(0, 1, 0); else _n.divideScalar(d);\n    B.p.copy(_c).addScaledVector(_n, RAD + c.r); const vn = B.v.dot(_n);",
    "    if (c.a && c.a.kind !== 'person' && c.a.kind !== 'kid') { if (!B.hitA) B.hitA = []; if (!B.hitA.includes(c.a)) { B.hitA.push(c.a); B.lastA = c.a; hit = 'actor'; if (c.a.kind !== 'pigeon') B.v.multiplyScalar(0.85); } continue; }\n    if (d < 1e-5) _n.set(0, 1, 0); else _n.divideScalar(d);\n    B.p.copy(_c).addScaledVector(_n, RAD + c.r); const vn = B.v.dot(_n);")
open('game10.js', 'w').write(src); print('game10.js +animals', len(src))
# v11: free the GPU memory of the previous level (geometries, materials, textures were never released: ~60 textures + 200 geometries leaked per level)
rep("function buildLevel(i) {\n  if (world) scene.remove(world);",
    "function disposeTree(root) {\n  const geos = new Set(), mats = new Set(), texs = new Set();\n  root.traverse((o) => { if (o.geometry) geos.add(o.geometry); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => { mats.add(mm); for (const k in mm) { const v = mm[k]; if (v && v.isTexture) texs.add(v); } }); });\n  geos.forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); texs.forEach((t) => t.dispose());\n}\nfunction buildLevel(i) {\n  if (world) { scene.remove(world); try { disposeTree(world); } catch (e) {} }")
open('game10.js', 'w').write(src); print('game10.js +dispose', len(src))
