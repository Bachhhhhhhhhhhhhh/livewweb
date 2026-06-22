#!/usr/bin/env node
/**
 * Fetch live bootstrap data from production API during CI build.
 * Bakes realtime seed into GitHub Pages so panels hydrate on first load
 * even when the Vercel API backend is not yet configured.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UPSTREAM = (process.env.UPSTREAM_API_URL || 'https://api.worldmonitor.app').replace(/\/$/, '');
const ORIGIN = process.env.UPSTREAM_ORIGIN_HEADER || 'https://worldmonitor.app';
const UA = 'Mozilla/5.0 (compatible; WorldMonitor-CI-Seed/2.8)';
const OUT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'live-seed');

function parseSessionCookie(setCookie) {
  if (!setCookie) return null;
  for (const segment of setCookie.split(/,(?=\s*[^;,]+=)/)) {
    const m = segment.match(/(?:^|;\s*)([^=;]+)=([^;]+)/);
    if (!m) continue;
    const name = m[1].trim().toLowerCase();
    if (name.includes('session') || name.startsWith('wm')) {
      return `${m[1].trim()}=${m[2].trim()}`;
    }
  }
  return null;
}

async function mintSession() {
  const res = await fetch(`${UPSTREAM}/api/wm-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': ORIGIN,
      'User-Agent': UA,
    },
  });
  if (!res.ok) throw new Error(`wm-session HTTP ${res.status}`);
  const cookie = parseSessionCookie(res.headers.get('set-cookie'));
  if (!cookie) throw new Error('wm-session: no cookie');
  return cookie;
}

async function fetchBootstrapTier(cookie, tier) {
  const res = await fetch(`${UPSTREAM}/api/bootstrap?tier=${tier}`, {
    headers: {
      'Origin': ORIGIN,
      'User-Agent': UA,
      'Cookie': cookie,
    },
  });
  if (!res.ok) throw new Error(`bootstrap/${tier} HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log('[live-seed] Minting upstream session...');
  const cookie = await mintSession();

  console.log('[live-seed] Fetching fast + slow bootstrap tiers...');
  const [fast, slow] = await Promise.all([
    fetchBootstrapTier(cookie, 'fast'),
    fetchBootstrapTier(cookie, 'slow'),
  ]);

  const manifest = {
    fetchedAt: new Date().toISOString(),
    upstream: UPSTREAM,
    fast: { keys: Object.keys(fast.data ?? {}).length, missing: fast.missing ?? [] },
    slow: { keys: Object.keys(slow.data ?? {}).length, missing: slow.missing ?? [] },
  };

  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(OUT_DIR, 'bootstrap-fast.json'), JSON.stringify(fast)),
    writeFile(path.join(OUT_DIR, 'bootstrap-slow.json'), JSON.stringify(slow)),
    writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2)),
  ]);

  console.log(`[live-seed] Wrote ${manifest.fast.keys} fast + ${manifest.slow.keys} slow keys → public/live-seed/`);
}

main().catch((err) => {
  console.error('[live-seed] FAILED:', err.message);
  process.exit(1);
});