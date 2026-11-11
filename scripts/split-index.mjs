// v135: divide os blocos <style>/<script> inline do index.html em app/css/*.css e app/js/*.js.
// Uso único (já aplicado na v135): node scripts/split-index.mjs <versao>
// Mantém a mesma ordem e posição: cada <script> vira um <script src> clássico (um arquivo por bloco);
// blocos <style> vizinhos (só espaço entre eles) viram um único <link rel="stylesheet">.
// Ficam inline: tudo do <head>, o v121-boot-css e o script de boot logo depois do <body>, e scripts type="text/plain".
import fs from 'node:fs';
const V = process.argv[2];
if (!/^\d+$/.test(V || '')) { console.error('uso: node scripts/split-index.mjs <versao>'); process.exit(1); }
const src = fs.readFileSync('index.html', 'utf8');
const bodyAt = src.search(/<body\b/i);
const anonJs = { 0: 'site-theme', 1: 'onerror', 2: 'core', 3: 'view-motion', 4: 'update-check' };
let anonJsN = 0, anonCssN = 0;
const blocks = [];
const re = /<(style|script)\b([^>]*)>/gi; let m;
while ((m = re.exec(src))) {
  const tag = m[1].toLowerCase(); const attrs = m[2];
  const a = m.index + m[0].length; const close = src.indexOf('</' + tag + '>', a);
  if (close < 0) throw new Error('bloco sem fim em ' + m.index);
  const end = close + tag.length + 3;
  const id = (attrs.match(/\bid="([^"]+)"/) || [])[1] || '';
  const type = (attrs.match(/\btype="([^"]+)"/) || [])[1] || '';
  blocks.push({ tag, attrs, id, type, start: m.index, end, inner: src.slice(a, close) });
  re.lastIndex = end;
}
const keep = (b) => b.start < bodyAt || b.id === 'v121-boot-css' || (b.tag === 'script' && b.type && !/javascript/i.test(b.type))
  || (b.tag === 'script' && /__e99BootT0=Date\.now\(\)/.test(b.inner) && b.inner.length < 600)
  || (b.tag === 'script' && /src=/i.test(b.attrs)) || (b.tag === 'style' && b.attrs.trim() && !/^id="[^"]+"$/.test(b.attrs.trim()))
  || (b.tag === 'script' && b.attrs.trim() && !/^id="[^"]+"$/.test(b.attrs.trim()));
const strip = (id) => id.replace(/-(css|js)$/, '');
// agrupa estilos vizinhos
const groups = []; let cur = null;
for (const b of blocks) {
  if (keep(b)) { cur = null; continue; }
  if (b.tag === 'style') {
    if (cur && cur.tag === 'style' && !src.slice(cur.blocks.at(-1).end, b.start).replace(/<!--[\s\S]*?-->/g, '').trim()) { cur.blocks.push(b); continue; }
    cur = { tag: 'style', blocks: [b] }; groups.push(cur);
  } else { cur = null; groups.push({ tag: 'script', blocks: [b] }); }
}
fs.mkdirSync('app/css', { recursive: true }); fs.mkdirSync('app/js', { recursive: true });
const used = { css: new Set(), js: new Set() }; const files = [];
const uniq = (k, n) => { let x = n, i = 2; while (used[k].has(x)) x = n + '-' + i++; used[k].add(x); return x; };
let out = ''; let pos = 0;
for (const g of groups) {
  const first = g.blocks[0], last = g.blocks.at(-1);
  out += src.slice(pos, first.start); pos = last.end;
  if (g.tag === 'script') {
    const name = uniq('js', first.id ? strip(first.id) : (anonJs[anonJsN++] || 'anon'));
    const file = 'app/js/' + name + '.js';
    fs.writeFileSync(file, first.inner);
    out += '<script' + (first.id ? ' id="' + first.id + '"' : '') + ' src="' + file + '?v=' + V + '"></script>';
    files.push(file);
  } else {
    const ids = g.blocks.map((b) => b.id).filter(Boolean);
    const name = uniq('css', g.blocks.length === 1 && first.id ? strip(first.id) : (ids.length ? strip(ids[0]) + '-grupo' : 'base-' + (++anonCssN)));
    const file = 'app/css/' + name + '.css';
    const css = g.blocks.map((b) => {
      const body = b.inner.replace(/url\((['"]?)(vendor\/)/g, 'url($1../../$2');
      return g.blocks.length > 1 ? '/* <style' + (b.id ? ' id="' + b.id + '"' : '') + '> */\n' + body + '\n' : body;
    }).join('');
    fs.writeFileSync(file, css);
    out += '<link rel="stylesheet"' + (g.blocks.length === 1 && first.id ? ' id="' + first.id + '"' : '') + ' href="' + file + '?v=' + V + '">';
    files.push(file);
  }
}
out += src.slice(pos);
fs.writeFileSync('index.html', out);
fs.writeFileSync(process.env.LIST || '/dev/null', JSON.stringify(files));
console.log('arquivos', files.length, 'index.html', src.length, '->', out.length);
