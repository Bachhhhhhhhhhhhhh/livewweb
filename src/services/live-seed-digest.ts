import type { ListFeedDigestResponse } from '@/generated/client/worldmonitor/news/v1/service_client';
import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

const POLL_MS = 5 * 60 * 1000;
const DIGEST_VARIANTS = ['full', 'tech', 'finance', 'world', 'happy', 'energy', 'commodity'] as const;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const cache = new Map<string, ListFeedDigestResponse>();

function cacheKey(variant: string, lang: string): string {
  return `${variant}:${lang}`;
}

function categoryItemCount(categories: ListFeedDigestResponse['categories'], key: string): number {
  return categories?.[key]?.items?.length ?? 0;
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

/** Merge all variant digests so custom panels (e.g. startups) hydrate on GitHub Pages. */
async function loadMergedBakedDigest(lang: string): Promise<ListFeedDigestResponse | null> {
  const merged: ListFeedDigestResponse = { categories: {}, feedStatuses: {}, generatedAt: '' };
  const langs = lang === 'en' ? ['en'] : [lang, 'en'];
  let loadedAny = false;

  for (const digestLang of langs) {
    for (const variant of DIGEST_VARIANTS) {
      const data = await fetchDigestFile(`feed-digest-${variant}-${digestLang}.json`);
      if (!data?.categories) continue;
      loadedAny = true;
      for (const [key, category] of Object.entries(data.categories)) {
        const existing = categoryItemCount(merged.categories, key);
        const incoming = category?.items?.length ?? 0;
        if (incoming > existing) {
          merged.categories![key] = category;
        }
      }
      if (data.generatedAt && (!merged.generatedAt || data.generatedAt > merged.generatedAt)) {
        merged.generatedAt = data.generatedAt;
      }
      Object.assign(merged.feedStatuses, data.feedStatuses ?? {});
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

  const merged = await loadMergedBakedDigest(lang);
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

  void refresh();
  pollTimer = setInterval(() => { void refresh(); }, POLL_MS);
}