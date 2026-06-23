#!/usr/bin/env node
const BASE = 'https://bachhhhhhhhhhhhhh.github.io';
const API_PROXY = process.env.FORK_API_URL || 'https://livewweb-proxy.invincible-legend.workers.dev';

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
  '/livewweb/favico/favicon.ico',
  '/livewweb/favicon.ico',
  '/livewweb/site.webmanifest',
  '/livewweb/docs/favico/favicon.ico',
  '/livewweb/docs/site.webmanifest',
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

console.log('\n=== live API proxy ===');
try {
  const health = await fetch(`${API_PROXY}/api/health`, {
    headers: { Origin: 'https://bachhhhhhhhhhhhhh.github.io' },
  });
  const body = await health.text();
  console.log('health', health.status, body.slice(0, 120));
  const boot = await fetch(`${API_PROXY}/api/bootstrap?tier=fast`, {
    headers: { Origin: 'https://bachhhhhhhhhhhhhh.github.io' },
  });
  console.log('bootstrap', boot.status, 'bytes', (await boot.text()).length);
} catch (e) {
  console.error('API proxy check failed:', e.message);
}

const panel = dash.body.match(/panels-[A-Za-z0-9_-]+\.js/)?.[0];
for (const bundle of [main, panel].filter(Boolean)) {
  const jsRes = await get(`/livewweb/docs/assets/${bundle}`);
  const hasApi = jsRes.body.includes('livewweb-proxy') || jsRes.body.includes('VITE_WS_API_URL');
  console.log(`bundle ${bundle} has API proxy ref:`, hasApi);
}