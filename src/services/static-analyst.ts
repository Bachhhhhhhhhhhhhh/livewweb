import { SITE_VARIANT } from '@/config/variant';
import { readBootstrapKey } from '@/services/bootstrap';
import type { ServerInsightStory, ServerInsights } from '@/services/insights-loader';
import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

const REGION_KEYWORDS: Record<string, RegExp> = {
  mena: /\b(iran|israel|gaza|lebanon|syria|iraq|saudi|yemen|uae|qatar|middle east|mena|tehran|jerusalem)\b/i,
  'east-asia': /\b(china|japan|korea|taiwan|australia|pacific|beijing|tokyo|seoul)\b/i,
  europe: /\b(europe|eu|nato|ukraine|russia|germany|france|uk|britain|brussels)\b/i,
  'north-america': /\b(us|usa|america|canada|mexico|washington|trump|biden|pentagon)\b/i,
  'south-asia': /\b(india|pakistan|bangladesh|afghanistan|delhi|islamabad)\b/i,
  latam: /\b(brazil|mexico|argentina|venezuela|latin america|caribbean)\b/i,
  'sub-saharan-africa': /\b(africa|nigeria|kenya|south africa|ethiopia|sahel)\b/i,
};

interface DigestItem {
  source?: string;
  title?: string;
  link?: string;
  snippet?: string;
  threat?: { level?: string };
}

let digestCache: DigestItem[] | null = null;

async function loadDigestItems(): Promise<DigestItem[]> {
  if (digestCache) return digestCache;
  const variant = SITE_VARIANT === 'full' || SITE_VARIANT === 'world' ? 'full' : SITE_VARIANT;
  const path = withBase(`/live-seed/feed-digest-${variant}-en.json`);
  try {
    const res = await fetch(path);
    if (!res.ok) return [];
    const payload = (await res.json()) as { categories?: Record<string, { items?: DigestItem[] }> };
    const items: DigestItem[] = [];
    for (const cat of Object.values(payload.categories ?? {})) {
      for (const item of cat.items ?? []) items.push(item);
    }
    digestCache = items.slice(0, 120);
    return digestCache;
  } catch {
    return [];
  }
}

async function loadInsights(): Promise<ServerInsights | null> {
  const cached = await readBootstrapKey('insights');
  if (cached && typeof cached === 'object') {
    const data = cached as ServerInsights;
    if (Array.isArray(data.topStories) && data.topStories.length > 0) return data;
  }
  if (isStaticWebMirror()) {
    const { fetchBootstrapKeys } = await import('@/services/bootstrap');
    const payload = await fetchBootstrapKeys('insights', { timeoutMs: 8_000 });
    const raw = payload.data?.insights;
    if (raw && typeof raw === 'object') {
      const data = raw as ServerInsights;
      if (Array.isArray(data.topStories) && data.topStories.length > 0) return data;
    }
  }
  return null;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
}

function scoreText(query: string, text: string): number {
  const q = tokenize(query);
  const hay = text.toLowerCase();
  let score = 0;
  for (const t of q) {
    if (hay.includes(t)) score += 1;
  }
  return score;
}

function pickStories(
  query: string,
  stories: ServerInsightStory[],
  regionId?: string,
  limit = 6,
): ServerInsightStory[] {
  const regionRe = regionId ? REGION_KEYWORDS[regionId] : null;
  return [...stories]
    .map((s) => {
      const blob = `${s.primaryTitle} ${s.primarySource} ${s.category ?? ''}`;
      let score = scoreText(query, blob);
      if (regionRe?.test(blob)) score += 3;
      if (s.isAlert) score += 1;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

function formatStoryList(stories: ServerInsightStory[]): string {
  if (stories.length === 0) return '_No matching headlines in the current digest._';
  return stories.map((s, i) => {
    const alert = s.isAlert ? ' **[ALERT]**' : '';
    return `${i + 1}. **${s.primaryTitle}** (${s.primarySource}, ${s.sourceCount} sources)${alert}`;
  }).join('\n');
}

/** Digest + insights fallback when live AI APIs are unavailable on GitHub Pages. */
export async function buildStaticAnalystReply(query: string, domainFocus: string): Promise<string | null> {
  if (!isStaticWebMirror()) return null;
  const insights = await loadInsights();
  const digest = await loadDigestItems();
  const stories = insights?.topStories ?? [];
  const digestHits = digest
    .map((d) => ({ d, score: scoreText(query, `${d.title ?? ''} ${d.snippet ?? ''}`) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.d);

  const picked = pickStories(query, stories, undefined, 5);
  const brief = insights?.worldBrief?.trim();

  const lines: string[] = [
    '### Situation snapshot',
    brief || '_Summary from baked intelligence seed._',
    '',
    `**Focus:** ${domainFocus}`,
    '',
    '### Top corroborated stories',
    formatStoryList(picked),
  ];

  if (digestHits.length > 0) {
    lines.push('', '### Related headlines');
    for (const d of digestHits) {
      lines.push(`- **${d.title ?? 'Untitled'}** (${d.source ?? 'News'})`);
    }
  }

  lines.push(
    '',
    '_Note: Live LLM analyst is offline on this static deployment. Showing pre-baked intelligence. Add **GROQ_API_KEY** in Settings for full AI chat._',
  );

  return lines.join('\n');
}

export async function buildStaticDeduction(query: string, geoContext: string): Promise<string> {
  const insights = await loadInsights();
  const stories = pickStories(`${query} ${geoContext}`, insights?.topStories ?? [], undefined, 8);
  const contextLine = geoContext.trim() || 'Global';

  return [
    '**Bottom Line**',
    `Based on current corroborated reporting, the most visible near-term pressure around "${query}" centers on ${contextLine}. Watch for follow-on diplomatic, market, and security headlines over the next 24–72 hours.`,
    '',
    '**What We Know**',
    formatStoryList(stories),
    '',
    '**Most Likely Path (24–72h)**',
    '- Headline momentum continues unless a major policy or military inflection appears.',
    '- Markets and transport corridors may reprice quickly on escalation or de-escalation signals.',
    '',
    '**Alternative Paths**',
    '- Rapid de-escalation via talks reduces tail-risk but may leave underlying tensions unresolved.',
    '- Unexpected kinetic or sanctions shock could widen the story across multiple regions.',
    '',
    '**Confidence**',
    'Medium — rule-based synthesis from baked news/intelligence seed (no live LLM on GitHub Pages).',
  ].join('\n');
}

export async function buildStaticRegionalHtml(regionId: string): Promise<string | null> {
  const insights = await loadInsights();
  if (!insights) return null;
  const regionLabels: Record<string, string> = {
    mena: 'Middle East & North Africa',
    'east-asia': 'East Asia & Pacific',
    europe: 'Europe & Central Asia',
    'north-america': 'North America',
    'south-asia': 'South Asia',
    latam: 'Latin America & Caribbean',
    'sub-saharan-africa': 'Sub-Saharan Africa',
  };
  const label = regionLabels[regionId] ?? regionId;
  const stories = pickStories('', insights.topStories, regionId, 8);
  const brief = insights.worldBrief?.trim() ?? '';

  const rows = stories.map((s) => `
    <div class="rib-static-story">
      <strong>${escape(s.primaryTitle)}</strong>
      <div class="rib-static-meta">${escape(s.primarySource)} · ${s.sourceCount} sources${s.isAlert ? ' · ALERT' : ''}</div>
    </div>`).join('');

  return `
    <div class="rib-static-fallback">
      <p class="rib-static-kicker">Baked regional view · ${escape(label)}</p>
      <p class="rib-static-brief">${escape(brief)}</p>
      <h4>Top stories in region</h4>
      ${rows || '<p class="rib-static-meta">No region-tagged stories in the current seed.</p>'}
      <p class="rib-static-note">Live regional board updates when the API proxy is available. Showing intelligence seed snapshot.</p>
    </div>`;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}