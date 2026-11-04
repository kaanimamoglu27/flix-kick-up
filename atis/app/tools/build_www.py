#!/usr/bin/env python3
"""Builds app/www/index.html from the web game (../index.html, the GitHub Pages copy, by default).
Swaps Google Fonts for the local copies in www/fonts and three.js (cdnjs) for www/three.min.js,
so the app opens without internet (App Review runs it that way). Fails loudly if anything external is left."""
import re, sys, pathlib
app = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else app.parent / 'index.html'
s = src.read_text()
s = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', s)
s, n = re.subn(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', '<link rel="stylesheet" href="fonts/fonts.css">', s)
if n != 1: sys.exit('Google Fonts link not found')
s, n = re.subn(r'<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script src="three.min.js"></script>', s)
if n != 1: sys.exit('three.js script tag not found')
# app-only scripts: AdMob ids, ad service, App Store purchases (the web build never loads them)
s, n = re.subn(r'<script src="three.min.js"></script>', '<script src="ads-config.js"></script><script src="ads.js"></script><script src="native-bridge.js"></script><script src="three.min.js"></script>', s)
if n != 1: sys.exit('three.js tag for app scripts not found')
left = re.findall(r'(?:src|href)="(https?://[^"]+)"', s)
if left: sys.exit('external resources still referenced: %s' % left)
(app / 'www' / 'index.html').write_text(s)
print('www/index.html written from', src.name, len(s), 'bytes')
