#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');

if (html.includes('id="badge-s-js"')) {
  const a = html.indexOf('<script id="badge-s-js">');
  const b = html.indexOf('</style>', html.indexOf('id="badge-s-css"')) + '</style>'.length;
  if (a >= 0 && b > a) html = html.slice(0, a) + html.slice(b);
}

if (html.includes('id="fix-admin-badge-js"')) {
  console.log('Already fixed');
  process.exit(0);
}

const block = readFileSync('scripts/fix-admin-badge.js', 'utf8').trim() + '\n';

html = html.replace(
  "Object.keys(FULL.labels).forEach(function(k){if(k!=='admin'){labels[k]=FULL.labels[k];icons[k]=FULL.icons[k]}})",
  "Object.keys(FULL.labels).forEach(function(k){labels[k]=FULL.labels[k];icons[k]=FULL.icons[k]})"
);

const marker = '<script id="team-diag-js">';
let idx = html.indexOf(marker);
if (idx < 0) idx = html.lastIndexOf('</body>');
html = html.slice(0, idx) + block + html.slice(idx);

html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '80' + c);
let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v80');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);
console.log('OK v80 admin+badge', html.length, 'applyRole fixed', !html.includes("if(k!=='admin')"));
