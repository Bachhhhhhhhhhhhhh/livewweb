import { getPersistentCache, setPersistentCache } from '@/services/persistent-cache';
import { isDesktopRuntime, toApiUrl } from '@/services/runtime';
import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

const hydrationCache = new Map<string, unknown>();
const BOOTSTRAP_CACHE_PREFIX = 'bootstrap:tier:';
const BOOTSTRAP_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type BootstrapDataSource = 'live' | 'cached' | 'mixed' | 'none';

export interface BootstrapTierHydrationState {
  source: BootstrapDataSource;
  updatedAt: number | null;
}

export interface BootstrapHydrationState {
  source: BootstrapDataSource;
  tiers: {
    fast: BootstrapTierHydrationState;
    slow: BootstrapTierHydrationState;
  };
}

const EMPTY_TIER_STATE: BootstrapTierHydrationState = { source: 'none', updatedAt: null };
let lastHydrationState: BootstrapHydrationState = {
  source: 'none',
  tiers: {
    fast: { ...EMPTY_TIER_STATE },
    slow: { ...EMPTY_TIER_STATE },
  },
};

export function getHydratedData(key: string): unknown | undefined {
  const val = hydrationCache.get(key);
  if (val === undefined) return undefined;
  // Static mirror: keep keys in cache so multiple panels can read baked seed.
  if (!isStaticWebMirror()) hydrationCache.delete(key);
  return val;
}

/** Async panel bootstrap read (hydration cache + baked live-seed on GitHub Pages). */
export async function resolvePanelBootstrap<T = unknown>(key: string): Promise<T | undefined> {
  const cached = hydrationCache.get(key);
  if (cached !== undefined) return cached as T;
  return (await readBootstrapKey(key)) as T | undefined;
}

/** Bootstrap key fetch — uses baked seed on GitHub Pages when API is blocked. */
export async function fetchBootstrapKeys(
  keys: string | string[],
  options?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<{ data: Record<string, unknown> }> {
  const keyList = Array.isArray(keys) ? keys : [keys];
  if (isStaticWebMirror()) {
    const data: Record<string, unknown> = {};
    for (const key of keyList) {
      const val = await readBootstrapKey(key);
      if (val !== undefined) data[key] = val;
    }
    return { data };
  }
  try {
    const resp = await fetch(toApiUrl(`/api/bootstrap?keys=${keyList.join(',')}`), {
      signal: options?.signal ?? AbortSignal.timeout(options?.timeoutMs ?? 5_000),
    });
    if (!resp.ok) return { data: {} };
    return (await resp.json()) as { data: Record<string, unknown> };
  } catch {
    return { data: {} };
  }
}

/** Non-destructive bootstrap read; falls back to baked live-seed on GitHub Pages. */
export async function readBootstrapKey(key: string): Promise<unknown | undefined> {
  if (hydrationCache.has(key)) return hydrationCache.get(key);
  if (!isStaticWebMirror()) return undefined;
  for (const tier of ['fast', 'slow'] as const) {
    const baked = await loadBakedSeedTier(tier);
    if (baked && baked[key] !== undefined && baked[key] !== null) {
      hydrationCache.set(key, baked[key]);
      return baked[key];
    }
  }
  return undefined;
}

export function markBootstrapAsLive(): void {
  if (lastHydrationState.source === 'cached' || lastHydrationState.source === 'mixed') {
    const now = Date.now();
    lastHydrationState = {
      source: 'live',
      tiers: {
        fast: lastHydrationState.tiers.fast.source !== 'none'
          ? { source: 'live', updatedAt: now }
          : { ...lastHydrationState.tiers.fast },
        slow: lastHydrationState.tiers.slow.source !== 'none'
          ? { source: 'live', updatedAt: now }
          : { ...lastHydrationState.tiers.slow },
      },
    };
  }
}

export function getBootstrapHydrationState(): BootstrapHydrationState {
  return {
    source: lastHydrationState.source,
    tiers: {
      fast: { ...lastHydrationState.tiers.fast },
      slow: { ...lastHydrationState.tiers.slow },
    },
  };
}

function populateCache(data: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(data)) {
    if (v !== null && v !== undefined) {
      hydrationCache.set(k, v);
    }
  }
}

function getTierCacheKey(tier: 'fast' | 'slow'): string {
  return `${BOOTSTRAP_CACHE_PREFIX}${tier}`;
}

async function readCachedTier(tier: 'fast' | 'slow', allowStale = false): Promise<{ data: Record<string, unknown>; updatedAt: number } | null> {
  try {
    const cached = await getPersistentCache<Record<string, unknown>>(getTierCacheKey(tier));
    if (!cached?.data || Object.keys(cached.data).length === 0) return null;
    if (!allowStale && Date.now() - cached.updatedAt > BOOTSTRAP_CACHE_MAX_AGE_MS) return null;
    return { data: cached.data, updatedAt: cached.updatedAt };
  } catch {
    return null;
  }
}

function combineHydrationSources(states: BootstrapTierHydrationState[]): BootstrapDataSource {
  const nonEmpty = states.filter((state) => state.source !== 'none');
  if (nonEmpty.length === 0) return 'none';
  if (nonEmpty.every((state) => state.source === 'live')) return 'live';
  if (nonEmpty.every((state) => state.source === 'cached')) return 'cached';
  return 'mixed';
}

const bakedSeedTierCache = new Map<'fast' | 'slow', Record<string, unknown> | null>();

/** CI-baked bootstrap seed shipped with GitHub Pages builds. */
async function loadBakedSeedTier(tier: 'fast' | 'slow'): Promise<Record<string, unknown> | null> {
  if (!isStaticWebMirror()) return null;
  if (bakedSeedTierCache.has(tier)) return bakedSeedTierCache.get(tier)!;
  try {
    const resp = await fetch(withBase(`/live-seed/bootstrap-${tier}.json`));
    if (!resp.ok) {
      bakedSeedTierCache.set(tier, null);
      return null;
    }
    const payload = (await resp.json()) as { data?: Record<string, unknown> };
    const data = payload.data ?? {};
    const result = Object.keys(data).length > 0 ? data : null;
    bakedSeedTierCache.set(tier, result);
    return result;
  } catch {
    bakedSeedTierCache.set(tier, null);
    return null;
  }
}

async function fetchTier(tier: 'fast' | 'slow', signal: AbortSignal): Promise<BootstrapTierHydrationState> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const cached = await readCachedTier(tier, true); // age gate skipped: any snapshot beats blank offline
    if (cached) {
      populateCache(cached.data);
      return { source: 'cached', updatedAt: cached.updatedAt };
    }
    return { ...EMPTY_TIER_STATE };
  }

  let liveData: Record<string, unknown> = {};
  let missingKeys: string[] = [];

  try {
    const resp = await fetch(toApiUrl(`/api/bootstrap?tier=${tier}`), { signal });
    if (resp.ok) {
      const payload = (await resp.json()) as {
        data?: Record<string, unknown>;
        missing?: string[];
      };
      liveData = payload.data ?? {};
      missingKeys = Array.isArray(payload.missing) ? payload.missing : [];
    }
  } catch {
    // Fall through to cached tier.
  }

  if (Object.keys(liveData).length === 0) {
    const baked = await loadBakedSeedTier(tier);
    if (baked) {
      populateCache(baked);
      return { source: 'live', updatedAt: Date.now() };
    }
    const cached = await readCachedTier(tier);
    if (cached) {
      populateCache(cached.data);
      return { source: 'cached', updatedAt: cached.updatedAt };
    }
    return { ...EMPTY_TIER_STATE };
  }

  const mergedData = { ...liveData };
  let tierState: BootstrapTierHydrationState = { source: 'live', updatedAt: null };
  let saveUpdatedAt: number | undefined;

  if (missingKeys.length > 0) {
    const cached = await readCachedTier(tier);
    if (cached) {
      let filledAny = false;
      for (const key of missingKeys) {
        if (!(key in mergedData) && cached.data[key] !== undefined) {
          mergedData[key] = cached.data[key];
          filledAny = true;
        }
      }
      if (filledAny) {
        tierState = { source: 'mixed', updatedAt: Date.now() };
      }
    }
  }

  populateCache(mergedData);
  void setPersistentCache(getTierCacheKey(tier), mergedData, saveUpdatedAt).catch(() => {});
  return tierState;
}

export async function fetchBootstrapData(): Promise<void> {
  hydrationCache.clear();
  lastHydrationState = {
    source: 'none',
    tiers: {
      fast: { ...EMPTY_TIER_STATE },
      slow: { ...EMPTY_TIER_STATE },
    },
  };

  const fastCtrl = new AbortController();
  const slowCtrl = new AbortController();
  const desktop = isDesktopRuntime();
  // Tier abort budgets:
  // - Fast tier (~10 keys, small payload) keeps an aggressive 1.2 s browser cap; it already meets that budget.
  // - Slow tier carries ~70 bootstrap keys (~500 KB). The previous 1.8 s browser cap was below realistic p95
  //   from a cold CF cache, so it aborted on slow connections. That left the hydration cache empty for those
  //   keys, and downstream per-panel lazy fetches each got a doomed 5 s shot — half of which timed out under
  //   the same conditions, leaving panels stuck in empty-state.
  // - 3.0 s is a conservative bump to avoid that cascade. Further tuning should be driven by RUM / Sentry
  //   data once available; do not move this without evidence.
  // - Desktop budgets (5 s / 8 s) are unchanged — different network and dependency-loading constraints.
  const fastTimeout = setTimeout(() => fastCtrl.abort(), desktop ? 5_000 : 1_200);
  const slowTimeout = setTimeout(() => slowCtrl.abort(), desktop ? 8_000 : 3_000);

  try {
    const [slowState, fastState] = await Promise.all([
      fetchTier('slow', slowCtrl.signal),
      fetchTier('fast', fastCtrl.signal),
    ]);

    lastHydrationState = {
      source: combineHydrationSources([fastState, slowState]),
      tiers: {
        fast: fastState,
        slow: slowState,
      },
    };
  } finally {
    clearTimeout(fastTimeout);
    clearTimeout(slowTimeout);
  }
}

const LIVE_SEED_POLL_MS = 5 * 60 * 1000;
let liveSeedPollTimer: ReturnType<typeof setInterval> | null = null;

/** GitHub Pages: re-hydrate from CI-refreshed /live-seed/ without a live API. */
export function startLiveSeedPolling(): void {
  if (!isStaticWebMirror() || liveSeedPollTimer) return;

  const refresh = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    for (const tier of ['fast', 'slow'] as const) {
      const baked = await loadBakedSeedTier(tier);
      if (baked && Object.keys(baked).length > 0) {
        populateCache(baked);
        lastHydrationState = {
          source: 'live',
          tiers: {
            ...lastHydrationState.tiers,
            [tier]: { source: 'live', updatedAt: Date.now() },
          },
        };
      }
    }
  };

  void refresh();
  liveSeedPollTimer = setInterval(() => { void refresh(); }, LIVE_SEED_POLL_MS);
}
