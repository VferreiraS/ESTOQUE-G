#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (html.includes('id="badge-s-js"')) {
  console.log('Already has badge-s');
  process.exit(0);
}

const block = readFileSync('scripts/badge-s.js', 'utf8').trim() + '\n';
const marker = '<script id="team-diag-js">';
let idx = html.indexOf(marker);
if (idx < 0) idx = html.indexOf('id="hybrid-admin-js"');
if (idx < 0) {
  idx = html.lastIndexOf('</body>');
  if (idx < 0) { console.error('no insert point'); process.exit(1); }
  html = html.slice(0, idx) + block + html.slice(idx);
} else {
  html = html.slice(0, idx) + block + html.slice(idx);
}

html = html.replace(/fill="#1d9bf0"/g, 'fill="#e01810"');
html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '79' + c);
let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v79');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);
console.log('OK badge-s v79', html.length);
