#!/usr/bin/env python3
"""Builds app/www/index.html from the web game (../index.html, the GitHub Pages copy, by default).
- writes a real phone head (viewport, notch / home-bar safe areas) in place of the web page's head
- swaps Google Fonts for the local copies in www/fonts and three.js for www/three.min.js,
  so the app opens without internet (App Review runs it that way)
- app-only wording: no demo-payment notes, no fake ads, no Claude-link online note
- loads native-bridge.js before the game and app.js (real Apple payments) after it"""
import re, sys, pathlib
app = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else app.parent / 'index.html'
s = src.read_text()
s = s[s.index('<title>'):]
s = re.sub(r'<meta name="claude:[^>]*>\s*', '', s)
s = re.sub(r'<link rel="preconnect"[^>]*>\s*', '', s)
s, n = re.subn(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^>]*>', '<link rel="stylesheet" href="fonts/fonts.css">', s)
if n != 1: sys.exit('Google Fonts link not found')
head = ('<!doctype html><html lang="tr"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">'
        '<meta name="format-detection" content="telephone=no">'
        '<style>body{margin:0;-webkit-text-size-adjust:100%;overscroll-behavior:none}</style>'
        '<script src="native-bridge.js"></script></head><body>\n')
# safe areas: screens and bottom sheets keep clear of the notch / Dynamic Island and the home bar
safe = ('<style>.screen{padding-top:calc(12px + env(safe-area-inset-top,0px));padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}'
        '.sheet .in{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}'
        '.ulk{grid-template-columns:1fr}.ulk [data-t]{display:none}'
        '.restore{display:block;margin:6px auto 0;padding:10px;font-size:14px;opacity:.8;text-decoration:underline}</style>\n')
i = s.index('</style>') + len('</style>')
s = head + s[:i] + '\n' + safe + s[i:]

def rep(old, new, count=None):
    global s
    c = s.count(old)
    if not c or (count and c != count): sys.exit('patch not found (%d): %s' % (c, old[:60]))
    s = s.replace(old, new)

# three.js is bundled (the 3D coach screen works offline)
rep("const TH_URLS=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'];",
    "const TH_URLS=['three.min.js'];")
# the app has no ads: the daily coin gift and the sponsor money stay, without an ad
rep("ad.innerHTML=`Reklam izle, +${coinTxt(40)}`", "ad.innerHTML=`Günlük hediye, +${coinTxt(40)}`")
rep("'Kulüp: reklamsız +0,5 M€':ST.adW===ST.week?'Bu hafta izlendi':'Reklam izle +0,5 M€'", "'Sponsor ödemesi +0,5 M€':ST.adW===ST.week?'Bu hafta alındı':'Sponsor ödemesi +0,5 M€'")
rep("coinAdd(40,'Reklam ödülü')", "coinAdd(40,'Günlük hediye')")
rep("Maç kazan, kupa topla, reklam izle ya da satın al.", "Maç kazan, kupa topla, günlük hediyeni al ya da satın al.")
rep("<b>Reklam izle</b><em>+${coinTxt(40)}</em>", "<b>Günlük hediye</b><em>+${coinTxt(40)}</em>")
rep("'<button class=\"btn ghost\" data-u>Geri al · reklam</button>'", "'<button class=\"btn ghost\" data-u>Geri al</button>'")
rep("<li>Ödüllü özellikler reklamsız</li>", "")
rep("Her 3 maçta bir kısa reklam çıkar. Ödüllü reklamla Flix Coin kazanabilir, kararını geri alabilir ya da sponsordan para alabilirsin. Direktör Kulübü üyeleri reklam görmez. Bu sürüm demo, ödeme alınmaz.",
    "Oyunda reklam yok. Satın almalar Apple hesabınla yapılır.")
# real payments
rep("<div class=\"note\">Demo: gerçek ödeme alınmaz. App Store sürümünde Apple ile ödenir.</div>", "<div class=\"note\">Ödeme Apple hesabınla alınır.</div>")
rep("<div class=\"note\" style=\"text-align:center\">Demo: gerçek ödeme alınmaz. İstediğin zaman iptal edebilirsin.</div>",
    "<div class=\"note\" style=\"text-align:center;font-size:12px\">Abonelik her dönem sonunda otomatik yenilenir ve ücret Apple hesabından alınır. "
    "Dönem bitmeden en az 24 saat önce iPhone Ayarlar &gt; Apple Hesabı &gt; Abonelikler bölümünden iptal edebilirsin. "
    "<a href=\"https://www.apple.com/legal/internet-services/itunes/dev/stdeula/\" target=\"_blank\" style=\"color:inherit\">Kullanım Koşulları</a> · "
    "<a href=\"https://kaanimamoglu27.github.io/flix-kick-up/gizlilik.html\" target=\"_blank\" style=\"color:inherit\">Gizlilik</a></div>")
rep("<small>ayda 50 TL</small>", "<small>12 ay</small>")
rep("'Avrupa geceleri paketi, Atkı, Kasket ve Kulaklık, 7 gün Direktör Kulübü.'", "'Avrupa geceleri paketi, Atkı, Kasket ve Kulaklık.'")
# online duels need the Claude artifact link; in the app only the same-phone mode is offered
rep("Online düello, oyun Claude uygulamasındaki artifact linkinden açılınca çalışır. Arkadaşının da oynayabilmesi için linki ona <b>katılımcı</b> olarak paylaşman gerekir. Şu an bağlantı kurulamadı. Aynı telefonda modu her yerde çalışır.",
    "Online düello yakında geliyor. Şimdilik aynı telefonda arkadaşınla oynayabilirsin.")
i = s.rindex('</script>') + len('</script>')
s = s[:i] + '\n<script src="app.js"></script>' + s[i:]
left = re.findall(r'(?:src|href)="(https?://[^"]+)"', s)
left = [u for u in left if not u.startswith(('https://www.apple.com/legal/', 'https://kaanimamoglu27.github.io/flix-kick-up/gizlilik'))]
if left: sys.exit('external resources still referenced: %s' % left)
(app / 'www' / 'index.html').write_text(s)
print('www/index.html written from', src.name, len(s), 'bytes')
