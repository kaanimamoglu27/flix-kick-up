#!/usr/bin/env python3
"""Builds app/www/index.html from the web game (../flix-kick-up.html by default).
Swaps Google Fonts for the local Rubik files so the app works offline (App Store review
runs without relying on outside servers), and loads native-bridge.js before the game."""
import re, sys, pathlib
app = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else app.parent / 'flix-kick-up.html'
s = src.read_text()
LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
face = lambda style, w, f, fmt, rng: "@font-face{font-family:'Rubik';font-style:%s;font-weight:%s;font-display:swap;src:url(fonts/%s) format('%s');unicode-range:%s}" % (style, w, f, fmt, rng)
fonts = '<style>' + ''.join([
  face('normal', '300 900', 'rubik-latin.woff2', 'woff2', LATIN),
  face('normal', '300 900', 'rubik-latin-ext.woff2', 'woff2', EXT),
  face('italic', '900', 'rubik-italic-latin.woff', 'woff', LATIN),
  face('italic', '900', 'rubik-italic-latin-ext.woff', 'woff', EXT),
]) + '</style>\n<link rel="manifest" href="manifest.json">\n<script src="native-bridge.js"></script>'
s = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', s)
s, n = re.subn(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', lambda m: fonts, s)
if n != 1: sys.exit('Google Fonts link not found')
left = re.findall(r'(?:src|href)="(https?://[^"]+)"', s)
if left: sys.exit('external resources still referenced: %s' % left)
(app / 'www' / 'index.html').write_text(s)
print('www/index.html written from', src.name, len(s), 'bytes')
