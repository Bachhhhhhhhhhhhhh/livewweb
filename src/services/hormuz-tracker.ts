import { loadStaticPanelSeed } from '@/services/static-panel-seed';
import { shouldUseLiveApiFetch } from '@/services/static-mirror';
import { toApiUrl } from '@/services/runtime';

export interface HormuzSeries {
  date: string;
  value: number;
}

export interface HormuzChart {
  label: string;
  title: string;
  series: HormuzSeries[];
}

export interface HormuzTrackerData {
  fetchedAt: number;
  updatedDate: string | null;
  title: string | null;
  summary: string | null;
  paragraphs: string[];
  status: 'closed' | 'disrupted' | 'restricted' | 'open';
  charts: HormuzChart[];
  attribution: { source: string; url: string };
}

export async function fetchHormuzTracker(): Promise<HormuzTrackerData | null> {
  const seeded = await loadStaticPanelSeed<HormuzTrackerData>('hormuz-tracker');
  if (seeded?.attribution) return seeded;

  if (!shouldUseLiveApiFetch()) return null;

  try {
    const resp = await fetch(toApiUrl('/api/supply-chain/hormuz-tracker'), {
      signal: AbortSignal.timeout(8_000),
    });
    if (!resp.ok) return seeded?.attribution ? seeded : null;
    const raw = (await resp.json()) as HormuzTrackerData;
    return raw.attribution ? raw : (seeded?.attribution ? seeded : null);
  } catch {
    return seeded?.attribution ? seeded : null;
  }
}
