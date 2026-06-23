import type { ListFeedDigestResponse } from '@/generated/client/worldmonitor/news/v1/service_client';
import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

const POLL_MS = 5 * 60 * 1000;
let pollTimer: ReturnType<typeof setInterval> | null = null;
const cache = new Map<string, ListFeedDigestResponse>();

function cacheKey(variant: string, lang: string): string {
  return `${variant}:${lang}`;
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

  const candidates = [
    `feed-digest-${variant}-${lang}.json`,
    lang !== 'en' ? `feed-digest-${variant}-en.json` : null,
    variant !== 'full' ? `feed-digest-full-${lang}.json` : null,
    variant !== 'full' && lang !== 'en' ? 'feed-digest-full-en.json' : null,
  ].filter(Boolean) as string[];

  for (const file of candidates) {
    try {
      const resp = await fetch(withBase(`/live-seed/${file}`), { cache: 'no-cache' });
      if (!resp.ok) continue;
      const data = (await resp.json()) as ListFeedDigestResponse;
      if (!data.categories || Object.keys(data.categories).length === 0) continue;
      cache.set(key, data);
      return data;
    } catch {
      // try next candidate
    }
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