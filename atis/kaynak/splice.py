import sys
s=open('game3.js').read()
def put(fn, start, end):
    global s
    i=s.index(start); j=s.index(end)
    s=s[:i]+open(fn).read()+'\n'+s[j:]
put('levels3.js','// ================= LEVELS','// ================= WORLD BUILDING')
open('game3.js','w').write(s)
