#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

for (const id of ['badge-s-js', 'fix-admin-badge-js', 'particle-badge-js']) {
  const startTag = '<script id="' + id + '">';
  const a = html.indexOf(startTag);
  if (a < 0) continue;
  let b = html.indexOf('</script>', a);
  if (b < 0) continue;
  b += '</script>'.length;
  const styleId = id.replace('-js', '-css');
  const st = html.indexOf('<style id="' + styleId + '">', a);
  if (st >= 0 && st < b + 80) {
    const se = html.indexOf('</style>', st) + '</style>'.length;
    if (se > st) b = Math.max(b, se);
  }
  html = html.slice(0, a) + html.slice(b);
}

if (html.includes('id="particle-badge-js"')) {
  console.log('already');
  process.exit(0);
}

const block = readFileSync('scripts/particle-badge.js', 'utf8').trim() + '\n';
const marker = '<script id="team-diag-js">';
let idx = html.indexOf(marker);
if (idx < 0) idx = html.lastIndexOf('</body>');
html = html.slice(0, idx) + block + html.slice(idx);

html = html.replace(
  "Object.keys(FULL.labels).forEach(function(k){if(k!=='admin'){labels[k]=FULL.labels[k];icons[k]=FULL.icons[k]}})",
  "Object.keys(FULL.labels).forEach(function(k){labels[k]=FULL.labels[k];icons[k]=FULL.icons[k]})"
);

html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '81' + c);
let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v81');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);
console.log('OK particle badge v81', html.length);
