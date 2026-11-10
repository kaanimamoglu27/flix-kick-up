/* FLIX TOYS · Yasal Bilgiler / Legal & Information (shared by Flix Atış, Fabrika, Arkana, Sen Olsaydın/Direktör).
   One self-contained panel: legal links (official pages on flixtoysofficial.com) + About / Hakkında.
   Links open outside the game: window.open(_blank) -> new browser tab on the web, Safari on iOS (Capacitor hands
   new-window requests to the system browser), so no in-game WebView and the game keeps running underneath.
   Usage: FlixLegal.init({game:'atis'|'fabrika'|'arkana'|'direktor', name, version, mount, theme, oss})
          any element with data-flixlegal="legal" or "about" opens the panel; FlixLegal.open('legal'|'about'). */
(function () {
  if (window.FlixLegal) return;
  var BASE = 'https://www.flixtoysofficial.com/sayfa/';
  var TOS = {
    atis: 'flix-atis-terms-of-service-kullanim-sartlari',
    fabrika: 'flix-fabrika-terms-of-service-kullanim-sartlari',
    arkana: 'flix-arkana-terms-of-service-kullanim-sartlari',
    direktor: 'flix-direktor-terms-of-service-kullanim-sartlari'
  };
  var SITE = 'https://www.flixtoysofficial.com', MAIL = 'flixofficial2025@gmail.com';
  var T = {
    tr: { legal: 'Yasal Bilgiler', about: 'Hakkında', close: 'Kapat', hub: 'Tüm yasal belgeler',
      privacy: 'Gizlilik Politikası', tos: 'Kullanım Şartları', eula: 'Son Kullanıcı Lisans Sözleşmesi', copy: 'Telif Hakları',
      third: 'Üçüncü Taraf Lisansları', kvkk: 'KVKK Aydınlatma Metni', support: 'Hukuki Destek',
      note: 'Belgeler flixtoysofficial.com adresinde, tarayıcıda açılır.',
      offline: 'İnternet bağlantısı yok. Belgeyi açmak için bağlan ya da bu adresi tarayıcıda aç:',
      fail: 'Sayfa açılamadı. Bu adresi tarayıcıda açabilirsin:', ok: 'Tamam', copied: 'Adres kopyalandı', copyB: 'Adresi kopyala',
      dev: 'Geliştirenler', own: 'Telif hakkı sahipliği', pub: 'Yayıncı', cr: 'Telif', web: 'Web sitesi', sup: 'Destek',
      crTxt: '© 2026 Kaan İmamoğlu ve Onat Deniz Şener. Tüm hakları saklıdır.',
      pubNote: 'FLIX TOYS yetkili yayıncıdır.', oss: 'Açık kaynak bileşenler', ver: 'Sürüm' },
    en: { legal: 'Legal & Information', about: 'About', close: 'Close', hub: 'All legal documents',
      privacy: 'Privacy Policy', tos: 'Terms of Service', eula: 'End User License Agreement', copy: 'Copyright & Ownership',
      third: 'Third-Party Licenses', kvkk: 'KVKK Privacy Notice', support: 'Legal Support',
      note: 'Documents open in your browser on flixtoysofficial.com.',
      offline: 'No internet connection. Connect to open the document, or open this address in a browser:',
      fail: 'The page could not be opened. You can open this address in a browser:', ok: 'OK', copied: 'Address copied', copyB: 'Copy address',
      dev: 'Developed by', own: 'Copyright ownership', pub: 'Published by', cr: 'Copyright', web: 'Website', sup: 'Support',
      crTxt: '© 2026 Kaan İmamoğlu and Onat Deniz Şener. All rights reserved.',
      pubNote: 'FLIX TOYS is the authorized publisher.', oss: 'Open-source components', ver: 'Version' }
  };
  var DOCS = [
    ['privacy', '🔒', 'flix-toys-privacy-policy'],
    ['tos', '📄', null],
    ['eula', '📝', 'flix-toys-end-user-license-agreement-eula'],
    ['copy', '©', 'flix-toys-copyright-ownership'],
    ['third', '🧩', 'flix-toys-third-party-licenses-attributions-ucuncu-taraf-lisanslari-ve-tesekkurler'],
    ['kvkk', '🇹🇷', 'flix-toys-kvkk-aydinlatma-metni'],
    ['support', '💬', 'flix-toys-legal-information-support-hukuki-bilgiler-ve-destek']
  ];
  var HUB = 'flix-toys-legal-documents-hukuki-belgeler';
  var C = { game: 'atis', name: 'FLIX', version: '', mount: null, theme: {}, oss: [] }, root = null, view = 'legal';

  function lang() {
    try { var s = localStorage.getItem('flixLegalLang'); if (s === 'tr' || s === 'en') return s; } catch (e) {}
    var n = (navigator.language || 'tr').toLowerCase();
    return n.indexOf('tr') === 0 ? 'tr' : 'en';
  }
  function setLang(l) { try { localStorage.setItem('flixLegalLang', l); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function url(d) { return BASE + (d[2] || TOS[C.game] || TOS.atis); }

  var CSS = '#flixLegal{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(5,4,12,.62);font-family:var(--fl-font,inherit);color:var(--fl-ink,#15215c);-webkit-user-select:none;user-select:none;' +
    'padding:calc(env(safe-area-inset-top,0px) + 10px) calc(env(safe-area-inset-right,0px) + 12px) calc(env(safe-area-inset-bottom,0px) + 10px) calc(env(safe-area-inset-left,0px) + 12px);box-sizing:border-box;touch-action:pan-y;animation:flIn .16s ease-out}' +
    '#flixLegal.abs{position:absolute}' +
    '@keyframes flIn{from{opacity:0}to{opacity:1}}' +
    '#flixLegal *{box-sizing:border-box}' +
    '#flixLegal .flc{width:min(520px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--fl-card,#fff);border-radius:var(--fl-rad,22px);' +
    'box-shadow:0 6px 0 var(--fl-shadow,rgba(0,0,0,.25)),0 18px 40px rgba(0,0,0,.35);overflow:hidden;border:var(--fl-border,0)}' +
    '#flixLegal .flh{display:flex;align-items:center;gap:8px;padding:12px 14px 8px}' +
    '#flixLegal .flh h3{margin:0;flex:1;font-size:20px;font-weight:800;letter-spacing:.3px;line-height:1.1;font-family:var(--fl-head,inherit)}' +
    '#flixLegal .fllang{display:flex;border-radius:999px;background:var(--fl-soft,#eef0f7);padding:3px}' +
    '#flixLegal .fllang button{border:0;background:transparent;color:inherit;font:inherit;font-size:12px;font-weight:800;padding:5px 9px;border-radius:999px;cursor:pointer}' +
    '#flixLegal .fllang button.on{background:var(--fl-accent,#d81e27);color:var(--fl-accentInk,#fff)}' +
    '#flixLegal .fltabs{display:flex;gap:6px;padding:0 14px 8px}' +
    '#flixLegal .fltabs button{flex:1;border:0;font:inherit;font-size:14px;font-weight:800;padding:9px 6px;border-radius:12px;background:var(--fl-soft,#eef0f7);color:inherit;cursor:pointer}' +
    '#flixLegal .fltabs button.on{background:var(--fl-accent,#d81e27);color:var(--fl-accentInk,#fff)}' +
    '#flixLegal .flb{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:2px 14px 6px;flex:1;min-height:0}' +
    '#flixLegal .fli{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;margin:0 0 6px;padding:11px 12px;border-radius:14px;' +
    'background:var(--fl-soft,#eef0f7);color:inherit;font:inherit;font-size:15px;font-weight:700;cursor:pointer;min-height:46px}' +
    '#flixLegal .fli:active{transform:translateY(1px);filter:brightness(.95)}' +
    '#flixLegal .fli i{font-style:normal;width:24px;text-align:center;font-size:17px;flex:none}' +
    '#flixLegal .fli span{flex:1}#flixLegal .fli b{opacity:.55;font-size:18px}' +
    '#flixLegal .fli.hub{background:transparent;border:2px dashed var(--fl-line,rgba(0,0,0,.18))}' +
    '#flixLegal .fln{font-size:12px;opacity:.7;margin:4px 2px 8px;line-height:1.35;font-weight:500}' +
    '#flixLegal dl{margin:0 0 6px}#flixLegal dt{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;opacity:.6;margin-top:10px}' +
    '#flixLegal dd{margin:2px 0 0;font-size:15px;font-weight:600;line-height:1.35;-webkit-user-select:text;user-select:text}' +
    '#flixLegal dd small{display:block;font-size:12px;opacity:.7;font-weight:500}' +
    '#flixLegal dd button{border:0;background:none;color:var(--fl-link,#1f5fd1);font:inherit;padding:0;text-decoration:underline;cursor:pointer;text-align:left;word-break:break-all}' +
    '#flixLegal .flf{display:flex;align-items:center;gap:8px;padding:8px 14px 12px}' +
    '#flixLegal .flf span{flex:1;font-size:11px;opacity:.6;font-weight:600}' +
    '#flixLegal .flx{border:0;font:inherit;font-size:16px;font-weight:800;min-width:112px;min-height:48px;padding:10px 20px;border-radius:999px;cursor:pointer;' +
    'background:var(--fl-btn,#ffc72c);color:var(--fl-btnInk,#15215c);box-shadow:0 4px 0 var(--fl-shadow,rgba(0,0,0,.25))}' +
    '#flixLegal .flx:active{transform:translateY(3px);box-shadow:0 1px 0 var(--fl-shadow,rgba(0,0,0,.25))}' +
    '#flixLegal .flm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(5,4,12,.55);padding:18px}' +
    '#flixLegal .flm>div{background:var(--fl-card,#fff);border-radius:18px;padding:16px;max-width:400px;width:100%;font-size:14px;font-weight:600;line-height:1.4}' +
    '#flixLegal .flm code{display:block;margin:10px 0;padding:8px;border-radius:10px;background:var(--fl-soft,#eef0f7);font-size:12px;word-break:break-all;-webkit-user-select:text;user-select:text}' +
    '#flixLegal .flm .row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}' +
    '#flixLegal .flm .row button{border:0;font:inherit;font-weight:800;padding:10px 16px;border-radius:999px;background:var(--fl-soft,#eef0f7);color:inherit;cursor:pointer}' +
    '#flixLegal .flm .row button.p{background:var(--fl-btn,#ffc72c);color:var(--fl-btnInk,#15215c)}' +
    '@media (max-height:430px){#flixLegal .flh{padding:8px 12px 4px}#flixLegal .fltabs{padding-bottom:4px}#flixLegal .fli{min-height:40px;padding:8px 10px;margin-bottom:4px}#flixLegal .flf{padding:6px 12px 8px}#flixLegal .flx{min-height:42px}}';

  function style() {
    if (document.getElementById('flixLegalCss')) return;
    var s = document.createElement('style'); s.id = 'flixLegalCss'; s.textContent = CSS; document.head.appendChild(s);
  }
  function msg(text, link) {
    if (!root) return;
    var L = T[lang()], m = document.createElement('div'); m.className = 'flm';
    m.innerHTML = '<div><div>' + esc(text) + '</div>' + (link ? '<code>' + esc(link) + '</code>' : '') +
      '<div class="row">' + (link ? '<button data-c>' + esc(L.copyB) + '</button>' : '') + '<button class="p" data-k>' + esc(L.ok) + '</button></div></div>';
    m.querySelector('[data-k]').onclick = function () { m.remove(); };
    var cb = m.querySelector('[data-c]');
    if (cb) cb.onclick = function () {
      try { navigator.clipboard.writeText(link).then(function () { cb.textContent = L.copied; }, function () {}); } catch (e) {}
    };
    root.querySelector('.flc').parentNode.appendChild(m);
  }
  /* opens an external page (https / mailto) outside the game */
  function go(u) {
    var L = T[lang()];
    if (u.indexOf('http') === 0 && navigator.onLine === false) { msg(L.offline, u); return; }
    var w = null;
    try { w = window.open(u, '_blank'); } catch (e) { w = null; }
    var nat = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (nat) return; /* native: the request goes to the system browser / mail app, window.open returns null by design */
    if (!w) {
      if (u.indexOf('mailto:') === 0) { try { location.href = u; return; } catch (e) {} }
      msg(L.fail, u.replace(/^mailto:/, ''));
    } else { try { w.opener = null; } catch (e) {} }
  }
  function render() {
    if (!root) return;
    var l = lang(), L = T[l], h = ''; root.setAttribute('lang', l);
    if (view === 'legal') {
      DOCS.forEach(function (d) { h += '<button class="fli" data-u="' + esc(url(d)) + '"><i>' + d[1] + '</i><span>' + esc(L[d[0]]) + '</span><b>›</b></button>'; });
      h += '<button class="fli hub" data-u="' + esc(BASE + HUB) + '"><i>📚</i><span>' + esc(L.hub) + '</span><b>›</b></button>';
      h += '<div class="fln">' + esc(L.note) + '</div>';
    } else {
      h += '<dl><dt>' + esc(L.dev) + '</dt><dd>Kaan İmamoğlu &amp; Onat Deniz Şener</dd>' +
        '<dt>' + esc(L.own) + '</dt><dd>Kaan İmamoğlu — 50%<br>Onat Deniz Şener — 50%</dd>' +
        '<dt>' + esc(L.pub) + '</dt><dd>FLIX TOYS OYUNCAKÇILIK SANAYİ VE TİCARET LİMİTED ŞİRKETİ<small>' + esc(L.pubNote) + '</small></dd>' +
        '<dt>' + esc(L.cr) + '</dt><dd>' + esc(L.crTxt) + '</dd>' +
        '<dt>' + esc(L.web) + '</dt><dd><button data-u="' + SITE + '">www.flixtoysofficial.com</button></dd>' +
        '<dt>' + esc(L.sup) + '</dt><dd><button data-u="mailto:' + MAIL + '">' + MAIL + '</button></dd>' +
        (C.oss && C.oss.length ? '<dt>' + esc(L.oss) + '</dt><dd><small>' + esc(C.oss.join(' · ')) + '</small></dd>' : '') +
        '</dl>';
      h += '<button class="fli" data-u="' + esc(BASE + DOCS[4][2]) + '"><i>🧩</i><span>' + esc(L.third) + '</span><b>›</b></button>';
    }
    root.innerHTML = '<div class="flc" role="dialog" aria-modal="true" aria-label="' + esc(view === 'legal' ? L.legal : L.about) + '">' +
      '<div class="flh"><h3>' + esc(view === 'legal' ? L.legal : L.about) + '</h3><div class="fllang"><button data-l="tr" class="' + (l === 'tr' ? 'on' : '') + '">TR</button><button data-l="en" class="' + (l === 'en' ? 'on' : '') + '">EN</button></div></div>' +
      '<div class="fltabs"><button data-v="legal" class="' + (view === 'legal' ? 'on' : '') + '">' + esc(L.legal) + '</button><button data-v="about" class="' + (view === 'about' ? 'on' : '') + '">' + esc(L.about) + '</button></div>' +
      '<div class="flb">' + h + '</div>' +
      '<div class="flf"><span>' + esc(C.name) + (C.version ? ' · ' + esc(L.ver) + ' ' + esc(C.version) : '') + '<br>FLIX TOYS</span><button class="flx" data-x>' + esc(L.close) + '</button></div></div>';
  }
  function close() { if (root) { root.remove(); root = null; } document.removeEventListener('keydown', key, true); }
  function key(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function open(v) {
    style(); view = v === 'about' ? 'about' : 'legal';
    if (!root) {
      root = document.createElement('div'); root.id = 'flixLegal';
      var th = C.theme || {};
      Object.keys(th).forEach(function (k) { root.style.setProperty('--fl-' + k, th[k]); });
      var mount = (typeof C.mount === 'function' ? C.mount() : C.mount) || document.body;
      if (mount !== document.body) root.className = 'abs';
      /* keep taps inside the panel away from the game's own touch/pointer handlers */
      ['pointerdown', 'pointerup', 'pointermove', 'touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'wheel', 'keydown'].forEach(function (t) {
        root.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
      });
      root.addEventListener('click', function (e) {
        e.stopPropagation();
        var b = e.target.closest ? e.target.closest('button') : null;
        if (!b) { if (e.target === root) close(); return; }
        if (b.hasAttribute('data-x')) return close();
        if (b.getAttribute('data-l')) { setLang(b.getAttribute('data-l')); return render(); }
        if (b.getAttribute('data-v')) { view = b.getAttribute('data-v'); return render(); }
        if (b.getAttribute('data-u')) return go(b.getAttribute('data-u'));
      });
      mount.appendChild(root);
      document.addEventListener('keydown', key, true);
    }
    render();
  }
  /* any element with data-flixlegal opens the panel (works for buttons a game renders later, too) */
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-flixlegal]') : null;
    if (!b || (root && root.contains(b))) return;
    e.preventDefault(); e.stopPropagation();
    if (C.beforeOpen) try { C.beforeOpen(); } catch (er) {}
    open(b.getAttribute('data-flixlegal'));
  }, true);
  function label(k) { return T[lang()][k]; }
  window.FlixLegal = {
    init: function (cfg) { for (var k in cfg) C[k] = cfg[k]; return window.FlixLegal; },
    open: open, close: close, isOpen: function () { return !!root; }, label: label, lang: lang,
    urls: function () { var o = {}; DOCS.forEach(function (d) { o[d[0]] = url(d); }); o.hub = BASE + HUB; o.site = SITE; o.mail = MAIL; return o; }
  };
})();
