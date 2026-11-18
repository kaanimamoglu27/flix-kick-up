#!/usr/bin/env python3
"""Puts the FLIX language layer (flix-i18n.js + translations) into a game page, right after <head>.
Runs again safely: the block between the FLIX-I18N markers is replaced.
Translations: i18n/ceviri.tsv, one line per Turkish piece: tr<TAB>en<TAB>fr<TAB>de<TAB>es<TAB>ar
(an empty cell means "not translated"; lines starting with '# ' are notes).
Usage: python3 i18n/apply_i18n.py [page.html ...]   (default: index.html next to the i18n folder)"""
import json, pathlib, re, sys

here = pathlib.Path(__file__).resolve().parent
COLS = ['en', 'fr', 'de', 'es', 'ar']

def load_table():
    d = {c: {} for c in COLS}
    for f in sorted(here.glob('*.tsv')):
        for line in f.read_text(encoding='utf-8').splitlines():
            if not line.strip() or line.startswith('# '): continue
            cells = line.split('\t'); tr = cells[0].strip()
            if not tr: continue
            for i, c in enumerate(COLS):
                v = cells[i + 1].strip() if i + 1 < len(cells) else ''
                if v: d[c][tr] = v
    return d

def block():
    d = load_table()
    native = (here / 'native.json')
    for c in json.loads(native.read_text()) if native.exists() else []: d.pop(c, None)
    js = (here / 'flix-i18n.js').read_text(encoding='utf-8')
    data = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return ('<!--FLIX-I18N-START--><script>/* FLIX i18n data */window.FLIX_I18N=' + data + ';</script>\n'
            '<script>' + js + '</script><!--FLIX-I18N-END-->'), {c: len(v) for c, v in d.items()}

def apply(page):
    s = page.read_text(encoding='utf-8')
    b, counts = block()
    s = re.sub(r'<!--FLIX-I18N-START-->.*?<!--FLIX-I18N-END-->\n?', '', s, flags=re.S)
    m = re.search(r'<meta charset="?utf-8"?\s*/?>', s, re.I) or re.search(r'<head[^>]*>', s, re.I)
    if not m: sys.exit('no <head> in %s' % page)
    s = s[:m.end()] + '\n' + b + '\n' + s[m.end():]
    page.write_text(s, encoding='utf-8')
    print('i18n ->', page, counts)

if __name__ == '__main__':
    pages = [pathlib.Path(p) for p in sys.argv[1:]] or [here.parent / 'index.html']
    for p in pages: apply(p)
