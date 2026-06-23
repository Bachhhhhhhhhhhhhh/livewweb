#!/usr/bin/env node
const BASE = 'https://bachhhhhhhhhhhhhh.github.io';

async function head(path) {
  const res = await fetch(BASE + path, { method: 'HEAD' });
  return res.status;
}

async function get(path) {
  const res = await fetch(BASE + path);
  const body = await res.text();
  return { status: res.status, body };
}

const checks = [
  '/livewweb/',
  '/livewweb/docs/dashboard.html',
  '/livewweb/docs/youtube-embed-bridge.html',
  '/livewweb/docs/live-seed/live-channels.json',
  '/livewweb/docs/assets/main-BJdsLity.js',
  '/livewweb/docs/assets/panels-DPLtq3nt.js',
  '/livewweb/docs/assets/MapContainer-BuNozXs0.js',
  '/livewweb/docs/assets/deck-stack-BRkKdvRj.js',
  '/livewweb/docs/live-seed/bootstrap-fast.json',
  '/livewweb/docs/live-seed/feed-digest-full-vi.json',
];

console.log('=== HEAD checks ===');
for (const p of checks) {
  console.log(await head(p), p);
}

const dash = await get('/livewweb/docs/dashboard.html');
console.log('\n=== dashboard ===');
console.log('status', dash.status, 'bytes', dash.body.length);
const main = dash.body.match(/main-[A-Za-z0-9_-]+\.js/)?.[0];
console.log('bundle', main ?? 'NONE');

const refs = [...dash.body.matchAll(/(?:src|href)="(\/livewweb\/docs\/[^"]+)"/g)].map((m) => m[1]);
const uniq = [...new Set(refs)];
const missing = [];
for (const u of uniq) {
  const s = await head(u);
  if (s !== 200) missing.push(`${s} ${u}`);
}
console.log('asset refs', uniq.length, 'missing', missing.length);
for (const m of missing.slice(0, 15)) console.log('MISSING', m);