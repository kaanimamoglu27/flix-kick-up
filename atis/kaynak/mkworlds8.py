import sys
s = open('worlds7.js').read()
def rep(old, new):
    global s
    if s.count(old) != 1: sys.exit('miss: ' + old[:70])
    s = s.replace(old, new)
rep("const turns = k < 4 ? 0 : k < 11 ? 1 : 2, feats = Math.min(3, Math.floor(k / 4)),", "const turns = k < 6 ? 0 : k < 15 ? 1 : 2, feats = Math.min(3, 1 + Math.floor(k / 5)),")
rep("""        const kind = f > 0 && left > 14 && R() < 0.55 ? (R() < 0.5 ? 'bridge' : 'stairs') : 'street';
        if (kind !== 'street') f--;
        const l = kind === 'street' ? Math.min(left, rr(10, 16) * SC) : kind === 'bridge' ? rr(7, 9.5) * (theme === 'uzay' ? 1.15 : 1) : 12;""",
"""        const FK = ['bridge', 'stairs', 'plaza', 'canal', 'plaza', 'canal'], kind = f > 0 && left > 12 && R() < 0.6 ? FK[Math.floor(R() * FK.length)] : 'street';
        if (kind !== 'street') f--;
        const l = kind === 'street' ? Math.min(left, rr(8, 13) * SC) : kind === 'bridge' ? rr(6, 8.5) * (theme === 'uzay' ? 1.15 : 1) : kind === 'canal' ? rr(5.5, 7) * (theme === 'uzay' ? 1.15 : 1) : 12;""")
rep("stZ(L, cx, zA, zB, {top, end: endHere ? 1 : 0, lamps: theme !== 'uzay' || R() > 0.5});", "stZ(L, cx, zA, zB, {top, end: endHere ? 1 : 0, endH: 2.6, lamps: theme !== 'uzay' || R() > 0.5});")
rep("        } else { // stairs: two steps up, street continues higher", """        } else if (kind === 'plaza') { // an open square with a monument in the middle
          const mid = (zA + zB) / 2; plaza(L, cx, mid, 11.2, l, top + 0.22);
          L.props.push(lot({}, cx - 7.8, cx - 5.6, zB, zA, '+x', top + 0.22), lot({}, cx + 5.6, cx + 7.8, zB, zA, '-x', top + 0.22), {t: 'monu', x: cx + (R() > 0.5 ? 1 : -1) * rr(0, 1.2), z: mid, base: top + 0.22});
          L.actors.push(walker(cx - 4, mid + 3, cx + 4, mid + 3, {sp: 0.8, col: pick([0xe22511, 0x1f6fd1, 0x2fa84f, 0xffc20e])}));
          if (R() < 0.5) L.actors.push({t: 'cat', x: cx - 3.5, z: mid - 3, sit: 1});
        } else if (kind === 'canal') { // water across the street: two narrow bridges
          for (const sx of [-1.55, 1.55]) L.islands.push({x: cx + sx, z: (zA + zB) / 2, w: 1.3, d: l, top: top + 0.22, kind: 'bridge'});
          L.props.push({t: 'water', x: cx, z: (zA + zB) / 2, w: 11.2, d: l, y: top - 0.9}, lot({}, cx - 5.6, cx - 3.4, zB, zA, '+x', top + 0.22), lot({}, cx + 3.4, cx + 5.6, zB, zA, '-x', top + 0.22));
        } else { // stairs: two steps up, street continues higher""")
rep("      run(rr(14, 22), false); // to the junction", "      run(rr(10, 16), false); // to the junction")
rep("const j1 = z - 8, zT = j1 - 3.4, len = rr(14, 20) * SC,", "const j1 = z - 8, zT = j1 - 3.4, len = rr(12, 17) * SC,")
rep("    run(rr(28, 36) + k * 0.4, true);", "    run(turns ? rr(16, 24) + k * 0.3 : rr(30, 40) + k * 1.2, true);")
open('worlds8.js', 'w').write(s); print('ok')
