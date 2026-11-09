#!/usr/bin/env python3
"""Builds app/www/index.html from the web game (../index.html, the GitHub Pages copy, by default).
The game is one self-contained HTML file (three.js, fonts and logo are inside), so it only adds the app-only scripts
(AdMob ids, ad service, App Store purchases) in front of the game. Fails loudly if anything external is referenced."""
import re, sys, pathlib
app = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else app.parent / 'index.html'
s = src.read_text()
tag = '<script>window.FLIX_LOGO='
if s.count(tag) != 1: sys.exit('game logo script not found (the app scripts go right before it)')
s = s.replace(tag, '<script src="ads-config.js"></script><script src="ads.js"></script><script src="native-bridge.js"></script>' + tag)
left = re.findall(r'(?:src|href)="(https?://[^"]+)"', s)
if left: sys.exit('external resources still referenced: %s' % left)
(app / 'www' / 'index.html').write_text(s)
print('www/index.html written from', src.name, len(s), 'bytes')
