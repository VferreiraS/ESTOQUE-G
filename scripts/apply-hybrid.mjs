#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (html.includes('id="hybrid-admin-js"')) {
  console.log('Already has hybrid-admin');
  process.exit(0);
}

const marker = '<script id="team-diag-js">';
const idx = html.indexOf(marker);
if (idx < 0) {
  console.error('team-diag marker not found');
  process.exit(1);
}

const block = readFileSync('scripts/hybrid-admin.js', 'utf8').trim() + '\n';
html = html.slice(0, idx) + block + html.slice(idx);
html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '78' + c);

let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v78');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);
console.log('OK hybrid v78', html.length);
