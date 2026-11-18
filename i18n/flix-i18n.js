/* FLIX i18n: the game's own Turkish text is the source. A small layer looks up every piece of text on screen
   (HTML text, button labels, placeholders, canvas fillText, alert/confirm) in window.FLIX_I18N and shows the
   chosen language. Turkish is the default; the choice is kept in localStorage 'flixLang'.
   Games that already speak English natively register FlixI18n.native = {langs:['tr','en'], set(l), get()}.
   Language buttons appear in every element with the data-flixlang attribute (usually inside Settings). */
(function () {
  'use strict';
  if (window.FlixI18n) return;
  var LANGS = [['tr', 'Türkçe'], ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['ar', 'العربية']];
  var KEY = 'flixLang', RAW = window.FLIX_I18N || {}, lang = 'tr';
  try { var s0 = localStorage.getItem(KEY); if (s0 && LANGS.some(function (l) { return l[0] === s0; })) lang = s0; } catch (e) {}
  var NUM = /\d+(?:[.,:]\d+)*/g, LETTER = /\p{L}/u, EDGE = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u;
  var IDX = {}, cache = new Map(), busy = false;

  function norm(t) { return String(t).replace(/\s+/g, ' ').trim(); }
  function tmpl(t) { return t.replace(NUM, '#'); }
  function upTR(t) { return t.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase(); }
  function isUp(t) { return LETTER.test(t) && t === upTR(t) && /\p{Lu}.*\p{Lu}/u.test(t); }
  function esc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function build(l) {
    if (IDX[l]) return IDX[l];
    var src = RAW[l] || {}, ex = new Map(), tp = new Map(), up = new Map(), frag = [];
    for (var k in src) {
      var v = src[k]; if (!v) continue; var nk = norm(k), nv = norm(v);
      ex.set(nk, nv); if (!up.has(upTR(nk))) up.set(upTR(nk), nv);
      var ek = nk.match(EDGE), ev = nv.match(EDGE);
      if (ek && ev && ek[2] && !ex.has(ek[2])) ex.set(ek[2], ev[2]);
      if (/\d/.test(nk)) { var a = nk.match(NUM) || [], b = nv.match(NUM) || []; if (a.length === b.length) tp.set(tmpl(nk), nv); }
      else if (nk.length >= 3) frag.push(ek && ek[2] ? ek[2] : nk);
    }
    frag = frag.filter(function (f, i, A) { return f.length >= 3 && LETTER.test(f) && A.indexOf(f) === i; }).sort(function (x, y) { return y.length - x.length; });
    var re = null;
    if (frag.length) try { re = new RegExp('(?<![\\p{L}\\p{N}])(' + frag.map(esc).join('|') + ')(?![\\p{L}\\p{N}])', 'gu'); } catch (e) { re = null; }
    return (IDX[l] = {ex: ex, tp: tp, up: up, re: re});
  }
  function look(I, t) {
    var v = I.ex.get(t); if (v != null) return v;
    if (/\d/.test(t)) {
      v = I.tp.get(tmpl(t));
      if (v != null) { var n = t.match(NUM), i = 0; return v.replace(NUM, function (m) { return n[i] != null ? n[i++] : m; }); }
    }
    if (isUp(t)) { v = I.up.get(t); if (v != null) return v.toLocaleUpperCase(lang); }
    return null;
  }
  function tx(text) {
    if (lang === 'tr' || text == null) return text;
    var s = String(text); if (!LETTER.test(s)) return text;
    var c = cache.get(s); if (c !== undefined) return c;
    var I = build(lang), m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), core = norm(m[2]), out = look(I, core);
    if (out == null) { var pf = core.match(/^([^\p{L}\p{N}]+)([\s\S]+)$/u); if (pf) { var rp = look(I, pf[2]); if (rp != null) out = pf[1] + rp; } }
    if (out == null) { var e = core.match(EDGE); if (e && e[2]) { var r = look(I, e[2]); if (r != null) out = e[1] + r + e[3]; } }
    if (out == null && I.re) {
      out = core.replace(I.re, function (w) { var r = I.ex.get(w); return r != null ? r : w; });
      // whole upper-case words that were not found in their own case
      out = out.replace(/[\p{Lu}][\p{Lu}'’]{2,}(?: [\p{Lu}][\p{Lu}'’]+)*/gu, function (w) { var r = I.up.get(w); return r != null ? r.toLocaleUpperCase(lang) : w; });
    }
    if (out == null || out === core) { if (API.miss.size < 3000) API.miss.add(core); }
    out = out == null ? s : m[1] + out + m[3];
    if (cache.size > 6000) cache.clear(); cache.set(s, out); return out;
  }

  /* ---------- DOM ---------- */
  var SKIP = {SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, svg: 0};
  var TN = new WeakMap(), AT = new WeakMap(), ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  function skipEl(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (SKIP[e.nodeName] || e.isContentEditable || (e.hasAttribute && e.hasAttribute('data-noi18n'))) return true;
    }
    return false;
  }
  function doText(n) {
    var rec = TN.get(n), cur = n.data;
    if (!rec) { rec = {src: cur, out: cur}; TN.set(n, rec); }
    else if (cur !== rec.out) rec.src = cur;
    if (!LETTER.test(rec.src)) { rec.out = cur; return; }
    var o = lang === 'tr' ? rec.src : tx(rec.src);
    rec.out = o; if (o !== cur) n.data = o;
  }
  function doAttrs(el) {
    var r = AT.get(el);
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i]; if (!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a); if (!r) { r = {}; AT.set(el, r); }
      var q = r[a]; if (!q || v !== q.out) q = r[a] = {src: v, out: v};
      var o = lang === 'tr' ? q.src : tx(q.src); q.out = o; if (o !== v) el.setAttribute(a, o);
    }
    if (el.nodeName === 'INPUT' && /^(button|submit)$/i.test(el.type)) {
      var rv = r && r.value; if (!r) { r = {}; AT.set(el, r); }
      if (!rv || el.value !== rv.out) rv = r.value = {src: el.value, out: el.value};
      var ov = lang === 'tr' ? rv.src : tx(rv.src); rv.out = ov; if (ov !== el.value) el.value = ov;
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (root.parentNode && !skipEl(root.parentNode)) doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1 && skipEl(root)) return;
    if (root.nodeType === 1) { doAttrs(root); if (root.hasAttribute('data-flixlang')) mountPicker(root); }
    var w = document.createTreeWalker(root, 5, {acceptNode: function (n) {
      if (n.nodeType === 1) return SKIP[n.nodeName] || n.isContentEditable || n.hasAttribute('data-noi18n') || n.hasAttribute('data-flixlang') ? 2 : 1;
      return 1;
    }}), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) doText(n);
      else doAttrs(n);
    }
    if (root.querySelectorAll) root.querySelectorAll('[data-flixlang]').forEach(mountPicker);
  }
  var mo = new MutationObserver(function (list) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') { if (m.target.parentNode && !skipEl(m.target.parentNode)) doText(m.target); }
        else if (m.type === 'attributes') { if (!skipEl(m.target)) doAttrs(m.target); }
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { mo.takeRecords(); busy = false; }
  });
  function start() {
    mo.observe(document.documentElement, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['value'])});
    if (lang !== 'tr') { busy = true; try { walk(document.documentElement); } finally { mo.takeRecords(); busy = false; } }
    else document.querySelectorAll('[data-flixlang]').forEach(mountPicker);
  }

  /* ---------- canvas, dialogs ---------- */
  function wrap(P, name) {
    if (!P || !P[name] || P[name].__fi) return;
    var f = P[name]; P[name] = function (t) { if (lang !== 'tr' && typeof t === 'string') { var a = Array.prototype.slice.call(arguments); a[0] = tx(t); return f.apply(this, a); } return f.apply(this, arguments); };
    P[name].__fi = 1;
  }
  ['fillText', 'strokeText', 'measureText'].forEach(function (n) {
    wrap(window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype, n);
    wrap(window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype, n);
  });
  ['alert', 'confirm', 'prompt'].forEach(function (n) {
    var f = window[n]; if (!f) return;
    window[n] = function (t) { var a = Array.prototype.slice.call(arguments); if (typeof t === 'string') a[0] = tx(t); return f.apply(window, a); };
  });

  /* ---------- language picker ---------- */
  var CSS = '.fi18n-pick{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:6px 0}' +
    '.fi18n-pick button{font:inherit;font-size:14px;padding:6px 10px;border-radius:10px;border:2px solid rgba(255,255,255,.35);background:rgba(0,0,0,.25);color:inherit;cursor:pointer;min-width:44px;min-height:36px}' +
    '.fi18n-pick button.on{border-color:#ffd23f;background:rgba(255,210,63,.25);font-weight:700}' +
    '.fi18n-pick .fi18n-h{width:100%;text-align:center;font-size:13px;opacity:.85}' +
    'html.fi18n-rtl body *{unicode-bidi:plaintext}';
  function addCss() { if (document.getElementById('fi18n-css')) return; var st = document.createElement('style'); st.id = 'fi18n-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
  var TITLE = {tr: '🌐 Dil', en: '🌐 Language', fr: '🌐 Langue', de: '🌐 Sprache', es: '🌐 Idioma', ar: '🌐 اللغة'};
  function mountPicker(el) {
    addCss(); el.setAttribute('data-noi18n', ''); el.classList.add('fi18n-pick');
    var h = '<div class="fi18n-h">' + TITLE[lang] + '</div>';
    LANGS.forEach(function (l) { h += '<button type="button" data-fl="' + l[0] + '" class="' + (l[0] === lang ? 'on' : '') + '">' + l[1] + '</button>'; });
    if (el.__fiH === h) return; el.__fiH = h; el.innerHTML = h;
    if (!el.__fiB) { el.__fiB = 1; el.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('[data-fl]'); if (b) { ev.stopPropagation(); setLang(b.getAttribute('data-fl')); } }); }
  }
  function applyHtml() {
    var h = document.documentElement; h.setAttribute('lang', lang);
    h.classList.toggle('fi18n-rtl', lang === 'ar');
  }
  function setLang(l, quiet) {
    if (!LANGS.some(function (x) { return x[0] === l; })) return;
    lang = l; cache.clear();
    try { localStorage.setItem(KEY, l); localStorage.setItem('flixLegalLang', l === 'tr' ? 'tr' : 'en'); } catch (e) {}
    var N = API.native;
    if (N && N.set) { try { N.set(N.langs.indexOf(l) >= 0 ? l : 'tr'); } catch (e) {} }
    // the native call may have rebuilt the UI in Turkish: the observer translates it, then a full pass catches the rest
    applyHtml(); busy = true;
    try { walk(document.documentElement); } finally { mo.takeRecords(); busy = false; }
    document.querySelectorAll('[data-flixlang]').forEach(mountPicker);
    if (!quiet) try { window.dispatchEvent(new CustomEvent('flixlang', {detail: l})); } catch (e) {}
  }
  var API = window.FlixI18n = {
    t: tx, langs: LANGS, get lang() { return lang; }, set: setLang, refresh: function () { setLang(lang, true); },
    // for games with their own English: the layer sends 'en' to the game, everything else gets the Turkish game + translation
    native: null, register: function (n) { API.native = n; if (n && n.set) try { n.set(n.langs.indexOf(lang) >= 0 ? lang : 'tr'); } catch (e) {} },
    isNative: function () { return !!(API.native && API.native.langs.indexOf(lang) >= 0); },
    // a translated string inside game code: FlixI18n.t('Turkish text')
    dict: RAW, miss: new Set()
  };
  // with a native language active, the game draws its own text: only the other languages need the layer
  var tx0 = tx; tx = function (t) { return API.isNative() && lang !== 'tr' ? t : tx0(t); }; API.t = tx;
  applyHtml();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
