import { withBase } from '@/utils/app-base';
import { isStaticWebMirror } from '@/services/static-mirror';

const cache = new Map<string, unknown>();

/** Bootstrap keys that ship as CI-baked panel JSON (not in bootstrap tiers). */
export const BOOTSTRAP_PANEL_SEED_SLUGS: Record<string, string> = {
  cotPositioning: 'cot-positioning',
  econCalendar: 'economic-calendar',
  earningsCalendar: 'earnings-calendar',
};

/** Load CI-baked panel snapshot from /live-seed/panels/{slug}.json */
export async function loadStaticPanelSeed<T = unknown>(slug: string): Promise<T | undefined> {
  if (!isStaticWebMirror()) return undefined;
  if (cache.has(slug)) return cache.get(slug) as T;
  try {
    const resp = await fetch(withBase(`/live-seed/panels/${slug}.json`), { cache: 'no-store' });
    if (!resp.ok) return undefined;
    const data = (await resp.json()) as T;
    cache.set(slug, data);
    return data;
  } catch {
    return undefined;
  }
}

export function clearStaticPanelSeedCache(): void {
  cache.clear();
}