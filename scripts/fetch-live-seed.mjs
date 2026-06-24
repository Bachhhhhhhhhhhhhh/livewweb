#!/usr/bin/env node
/**
 * Fetch live bootstrap + news digest from production API during CI build.
 * Bakes realtime seed into GitHub Pages so panels hydrate on first load
 * even when the Vercel API backend is not yet configured.
 */
import { constants } from 'node:fs';
import { access, cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UPSTREAM = (process.env.UPSTREAM_API_URL || 'https://api.worldmonitor.app').replace(/\/$/, '');
const ORIGIN = process.env.UPSTREAM_ORIGIN_HEADER || 'https://worldmonitor.app';
const UA = 'Mozilla/5.0 (compatible; WorldMonitor-CI-Seed/2.8)';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public', 'live-seed');
const FALLBACK_DIR = path.join(ROOT, 'docs', 'live-seed');
const DIGEST_VARIANTS = (process.env.LIVE_SEED_DIGEST_VARIANTS || 'full,tech,finance,world,happy,energy,commodity').split(',');
const DIGEST_LANGS = (process.env.LIVE_SEED_DIGEST_LANGS || 'en,vi').split(',');

/** Default Live News handles baked for GitHub Pages (no live API on static host). */
const FRED_SERIES_IDS = [
  'VIXCLS', 'BAMLH0A0HYM2', 'ICSA', 'MORTGAGE30US', 'FEDFUNDS', 'T10Y2Y',
  'M2SL', 'UNRATE', 'CPIAUCSL', 'DGS10', 'WALCL',
];

const LIVE_CHANNEL_HANDLES = (process.env.LIVE_SEED_CHANNEL_HANDLES || [
  '@markets', '@SkyNews', '@euronews', '@DWNews', '@CNBC', '@CNN', '@FRANCE24',
  '@AlArabiya', '@AlJazeeraEnglish', '@YahooFinance', '@NASA', '@FoxNews', '@BBCNews',
  '@FRANCE24_en', '@trthaber', '@NTV', '@cnnturk',
]).map((h) => h.trim()).filter(Boolean);

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

async function fetchFeedDigest(cookie, variant, lang) {
  const res = await fetch(`${UPSTREAM}/api/news/v1/list-feed-digest?variant=${variant}&lang=${lang}`, {
    headers: {
      'Origin': ORIGIN,
      'User-Agent': UA,
      'Cookie': cookie,
    },
  });
  if (!res.ok) throw new Error(`digest/${variant}/${lang} HTTP ${res.status}`);
  return res.json();
}

async function fetchUpstream(cookie, path, options = {}) {
  const { method = 'GET', body } = options;
  const res = await fetch(`${UPSTREAM}${path}`, {
    method,
    headers: {
      'Origin': ORIGIN,
      'User-Agent': UA,
      'Cookie': cookie,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return res.json();
}

function calendarRange(daysAhead) {
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + daysAhead);
  const fromDate = today.toISOString().slice(0, 10);
  const toDate = future.toISOString().slice(0, 10);
  return { fromDate, toDate };
}

async function fetchPanelSeeds(cookie) {
  const panelsDir = path.join(OUT_DIR, 'panels');
  await mkdir(panelsDir, { recursive: true });

  const { fromDate: econFrom, toDate: econTo } = calendarRange(30);
  const { fromDate: earnFrom, toDate: earnTo } = calendarRange(14);

  const seeds = [
    { slug: 'hormuz-tracker', fetch: () => fetchUpstream(cookie, '/api/supply-chain/hormuz-tracker') },
    { slug: 'gold-intelligence', fetch: () => fetchUpstream(cookie, '/api/market/v1/get-gold-intelligence') },
    { slug: 'oil-inventories', fetch: () => fetchUpstream(cookie, '/api/economic/v1/get-oil-inventories') },
    {
      slug: 'cot-positioning',
      fetch: () => fetchUpstream(cookie, '/api/market/v1/get-cot-positioning'),
      bootstrapKey: 'cotPositioning',
    },
    {
      slug: 'economic-calendar',
      fetch: () => fetchUpstream(cookie, `/api/economic/v1/get-economic-calendar?fromDate=${econFrom}&toDate=${econTo}`),
      bootstrapKey: 'econCalendar',
    },
    {
      slug: 'earnings-calendar',
      fetch: () => fetchUpstream(cookie, `/api/market/v1/list-earnings-calendar?fromDate=${earnFrom}&toDate=${earnTo}`),
      bootstrapKey: 'earningsCalendar',
    },
    {
      slug: 'fred-batch',
      fetch: () => fetchUpstream(cookie, '/api/economic/v1/get-fred-series-batch', {
        method: 'POST',
        body: { seriesIds: FRED_SERIES_IDS, limit: 120 },
      }),
    },
  ];

  const stats = [];
  for (const seed of seeds) {
    try {
      const data = await seed.fetch();
      await writeFile(path.join(panelsDir, `${seed.slug}.json`), JSON.stringify(data));
      if (seed.bootstrapKey) {
        await writeFile(path.join(panelsDir, `${seed.bootstrapKey}.json`), JSON.stringify(data));
      }
      stats.push({ slug: seed.slug, ok: true });
      console.log(`[live-seed] panel ${seed.slug}: ok`);
    } catch (err) {
      stats.push({ slug: seed.slug, ok: false, error: err.message });
      console.warn(`[live-seed] panel ${seed.slug} skipped: ${err.message}`);
    }
  }
  return stats;
}

async function fetchYoutubeLive(cookie, handle) {
  const res = await fetch(`${UPSTREAM}/api/youtube/live?channel=${encodeURIComponent(handle)}`, {
    headers: {
      'Origin': ORIGIN,
      'User-Agent': UA,
      'Cookie': cookie,
    },
  });
  if (!res.ok) throw new Error(`youtube/live ${handle} HTTP ${res.status}`);
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

  const digestWrites = [];
  const digestStats = [];
  for (const variant of DIGEST_VARIANTS) {
    for (const lang of DIGEST_LANGS) {
      try {
        const digest = await fetchFeedDigest(cookie, variant.trim(), lang.trim());
        const catCount = Object.keys(digest.categories ?? {}).length;
        let itemCount = 0;
        for (const cat of Object.values(digest.categories ?? {})) {
          itemCount += cat.items?.length ?? 0;
        }
        const file = `feed-digest-${variant.trim()}-${lang.trim()}.json`;
        digestWrites.push(writeFile(path.join(OUT_DIR, file), JSON.stringify(digest)));
        digestStats.push({ variant: variant.trim(), lang: lang.trim(), categories: catCount, items: itemCount });
        console.log(`[live-seed] digest ${variant}/${lang}: ${catCount} categories, ${itemCount} items`);
      } catch (err) {
        console.warn(`[live-seed] digest ${variant}/${lang} skipped: ${err.message}`);
      }
    }
  }

  const liveChannels = { channels: {} };
  for (const handle of LIVE_CHANNEL_HANDLES) {
    try {
      const info = await fetchYoutubeLive(cookie, handle);
      liveChannels.channels[handle] = {
        videoId: info.videoId ?? null,
        hlsUrl: info.hlsUrl ?? null,
        isLive: info.isLive ?? !!info.videoId,
        fetchedAt: new Date().toISOString(),
      };
      console.log(`[live-seed] live ${handle}: ${info.videoId ? info.videoId : 'fallback-only'}`);
    } catch (err) {
      console.warn(`[live-seed] live ${handle} skipped: ${err.message}`);
    }
  }

  console.log('[live-seed] Fetching panel snapshots...');
  const panelStats = await fetchPanelSeeds(cookie);

  const manifest = {
    fetchedAt: new Date().toISOString(),
    upstream: UPSTREAM,
    fast: { keys: Object.keys(fast.data ?? {}).length, missing: fast.missing ?? [] },
    slow: { keys: Object.keys(slow.data ?? {}).length, missing: slow.missing ?? [] },
    digests: digestStats,
    liveChannels: Object.keys(liveChannels.channels).length,
    panels: panelStats,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await Promise.all([
    writeFile(path.join(OUT_DIR, 'bootstrap-fast.json'), JSON.stringify(fast)),
    writeFile(path.join(OUT_DIR, 'bootstrap-slow.json'), JSON.stringify(slow)),
    writeFile(path.join(OUT_DIR, 'live-channels.json'), JSON.stringify(liveChannels)),
    writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2)),
    ...digestWrites,
  ]);

  const panelOk = panelStats.filter((p) => p.ok).length;
  console.log(`[live-seed] Wrote ${manifest.fast.keys} fast + ${manifest.slow.keys} slow keys, ${digestStats.length} digests, ${panelOk}/${panelStats.length} panels, ${manifest.liveChannels} live channels → public/live-seed/`);
}

async function copyFallbackSeed() {
  await access(path.join(FALLBACK_DIR, 'bootstrap-fast.json'), constants.R_OK);
  await mkdir(OUT_DIR, { recursive: true });
  await cp(FALLBACK_DIR, OUT_DIR, { recursive: true, force: true });
  console.warn('[live-seed] Upstream fetch failed — using docs/live-seed fallback');
}

main().catch(async (err) => {
  console.error('[live-seed] FAILED:', err.message);
  try {
    await copyFallbackSeed();
  } catch (fallbackErr) {
    console.error('[live-seed] Fallback also failed:', fallbackErr.message);
    process.exit(1);
  }
});