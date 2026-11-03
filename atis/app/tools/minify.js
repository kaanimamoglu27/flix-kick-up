// Shrinks www/index.html for the app: minifies the game script and styles (keeps top-level names, which the HTML calls by name).
// Usage: node tools/minify.js   (needs `npm i -D terser clean-css`)
const fs = require('fs'), path = require('path');
const {minify} = require('terser'); const CleanCSS = require('clean-css');
const f = path.join(__dirname, '..', 'www', 'index.html');
(async () => {
  let s = fs.readFileSync(f, 'utf8'); const before = s.length;
  const parts = []; let m; const re = /<script>([\s\S]*?)<\/script>/g;
  while ((m = re.exec(s))) parts.push(m);
  for (const p of parts.reverse()) {
    const out = await minify(p[1], {ecma: 2020, compress: {passes: 2, drop_debugger: true, pure_funcs: []}, mangle: {toplevel: false}, format: {comments: false}});
    s = s.slice(0, p.index) + '<script>' + out.code + '</script>' + s.slice(p.index + p[0].length);
  }
  s = s.replace(/<style>([\s\S]*?)<\/style>/g, (a, css) => '<style>' + new CleanCSS({level: 1}).minify(css).styles + '</style>');
  fs.writeFileSync(f, s);
  console.log('index.html', before, '->', s.length, 'bytes');
})();
