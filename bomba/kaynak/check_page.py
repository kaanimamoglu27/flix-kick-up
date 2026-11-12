# Verifies a built page is safe to package into the iOS app. Usage: python3 check_page.py path/to/index.html
import sys
b=open(sys.argv[1],'rb').read(); s=b.decode('utf-8')   # must be valid UTF-8
head=s[:600].lower()
bad=[]
if not head.startswith('<!doctype html>'): bad.append('no doctype')
if '<meta charset="utf-8">' not in head: bad.append('no UTF-8 charset meta (emoji turn into garbage)')
if 'name="viewport"' not in head or 'viewport-fit=cover' not in head: bad.append('no phone viewport meta (page renders 980px wide, safe areas off)')
if 'cdn.jsdelivr.net' in s or 'fonts.googleapis.com' in s: bad.append('still loads from the network')
if '__T3' not in s: bad.append('three.js not inlined')
if 'safe-area-inset-top' not in s: bad.append('no safe-area padding')
if bad: print('PAGE CHECK FAILED: '+'; '.join(bad)); sys.exit(1)
print('page ok',len(b),'bytes')
