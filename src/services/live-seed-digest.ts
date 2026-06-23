import type { ListFeedDigestResponse } from '@/generated/client/worldmonitor/news/v1/service_client';
import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

const POLL_MS = 5 * 60 * 1000;
const DIGEST_VARIANTS = ['full', 'tech', 'finance', 'world', 'happy', 'energy', 'commodity'] as const;
/** Below this count we merge all variant digests (custom panels may need cross-variant categories). */
const MIN_CATEGORIES_BEFORE_MERGE = 8;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const cache = new Map<string, ListFeedDigestResponse>();

function cacheKey(variant: string, lang: string): string {
  return `${variant}:${lang}`;
}

function categoryItemCount(categories: ListFeedDigestResponse['categories'], key: string): number {
  return categories?.[key]?.items?.length ?? 0;
}

function mergeDigestInto(
  target: ListFeedDigestResponse,
  source: ListFeedDigestResponse,
): void {
  if (!source.categories) return;
  for (const [key, category] of Object.entries(source.categories)) {
    const existing = categoryItemCount(target.categories, key);
    const incoming = category?.items?.length ?? 0;
    if (incoming > existing) {
      target.categories![key] = category;
    }
  }
  if (source.generatedAt && (!target.generatedAt || source.generatedAt > target.generatedAt)) {
    target.generatedAt = source.generatedAt;
  }
  Object.assign(target.feedStatuses, source.feedStatuses ?? {});
}

async function fetchDigestFile(file: string): Promise<ListFeedDigestResponse | null> {
  try {
    const resp = await fetch(withBase(`/live-seed/${file}`), { cache: 'no-cache' });
    if (!resp.ok) return null;
    const data = (await resp.json()) as ListFeedDigestResponse;
    return data.categories && Object.keys(data.categories).length > 0 ? data : null;
  } catch {
    return null;
  }
}

/** Load a single variant digest (1–2 fetches vs 14 for full merge). */
async function loadVariantBakedDigest(variant: string, lang: string): Promise<ListFeedDigestResponse | null> {
  const merged: ListFeedDigestResponse = { categories: {}, feedStatuses: {}, generatedAt: '' };
  const langs = lang === 'en' ? ['en'] : [lang, 'en'];
  let loadedAny = false;

  for (const digestLang of langs) {
    const data = await fetchDigestFile(`feed-digest-${variant}-${digestLang}.json`);
    if (!data?.categories) continue;
    loadedAny = true;
    mergeDigestInto(merged, data);
  }

  return loadedAny && Object.keys(merged.categories ?? {}).length > 0 ? merged : null;
}

/** Merge all variant digests so custom panels (e.g. startups) hydrate on GitHub Pages. */
async function loadMergedBakedDigest(variant: string, lang: string): Promise<ListFeedDigestResponse | null> {
  const variantDigest = await loadVariantBakedDigest(variant, lang);
  const variantCategoryCount = Object.keys(variantDigest?.categories ?? {}).length;
  if (variantDigest && variantCategoryCount >= MIN_CATEGORIES_BEFORE_MERGE) {
    return variantDigest;
  }

  const merged: ListFeedDigestResponse = variantDigest ?? { categories: {}, feedStatuses: {}, generatedAt: '' };
  const langs = lang === 'en' ? ['en'] : [lang, 'en'];
  let loadedAny = variantCategoryCount > 0;

  for (const digestLang of langs) {
    for (const digestVariant of DIGEST_VARIANTS) {
      if (digestVariant === variant && variantDigest) continue;
      const data = await fetchDigestFile(`feed-digest-${digestVariant}-${digestLang}.json`);
      if (!data?.categories) continue;
      loadedAny = true;
      mergeDigestInto(merged, data);
    }
  }

  return loadedAny && Object.keys(merged.categories ?? {}).length > 0 ? merged : null;
}

/** CI-baked news digest for GitHub Pages (API CORS blocked on *.github.io). */
export async function loadBakedFeedDigest(
  variant: string,
  lang: string,
): Promise<ListFeedDigestResponse | null> {
  if (!isStaticWebMirror()) return null;

  const key = cacheKey(variant, lang);
  const hit = cache.get(key);
  if (hit) return hit;

  const merged = await loadMergedBakedDigest(variant, lang);
  if (merged) {
    cache.set(key, merged);
    return merged;
  }

  return null;
}

/** Re-fetch CI-refreshed digest files (cron updates docs/live-seed/). */
export function startLiveDigestPolling(
  variant: string,
  lang: string,
  onUpdate?: (digest: ListFeedDigestResponse) => void,
): void {
  if (!isStaticWebMirror() || pollTimer) return;

  const refresh = async () => {
    cache.delete(cacheKey(variant, lang));
    const digest = await loadBakedFeedDigest(variant, lang);
    if (digest) onUpdate?.(digest);
  };

  // Defer first refresh — loadAllData() already hydrates news on boot.
  pollTimer = setInterval(() => { void refresh(); }, POLL_MS);
}