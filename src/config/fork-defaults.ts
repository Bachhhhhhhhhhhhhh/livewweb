import type { MapLayers, PanelConfig } from '@/types';
import { isStaticWebMirror } from '@/services/static-mirror';

/** Premium panels enabled by default on the GitHub Pages fork (no login). */
const FORK_EXTRA_PANEL_KEYS = [
  'regional-intelligence',
  'deduction',
  'climate-news',
  'macro-tiles',
  'economic-calendar',
  'energy-risk-overview',
  'gulf-economies',
  'consumer-prices',
  'geo-hubs',
  'cot-positioning',
  'yield-curve',
] as const;

/** Cloud-only panels hidden on static mirror. */
const FORK_DISABLED_PANEL_KEYS = ['latest-brief'] as const;

/** Good News / happy-variant panels — not used on the fork. */
const FORK_HAPPY_PANEL_KEYS = [
  'positive-feed',
  'progress',
  'counters',
  'spotlight',
  'breakthroughs',
  'species',
] as const;

export function applyForkPanelBoost(panelSettings: Record<string, PanelConfig>): void {
  if (!isStaticWebMirror()) return;
  for (const key of FORK_EXTRA_PANEL_KEYS) {
    if (panelSettings[key]) {
      panelSettings[key] = { ...panelSettings[key]!, enabled: true };
    }
  }
  for (const key of [...FORK_DISABLED_PANEL_KEYS, ...FORK_HAPPY_PANEL_KEYS]) {
    if (panelSettings[key]) {
      panelSettings[key] = { ...panelSettings[key]!, enabled: false };
    }
  }
}

/** Fewer active map layers at boot — less network + GPU churn on GitHub Pages. */
export function tuneMapLayersForStaticMirror(base: MapLayers): MapLayers {
  if (!isStaticWebMirror()) return base;
  return {
    ...base,
    weather: false,
    outages: false,
    webcams: false,
    satellites: false,
    dayNight: false,
    flights: false,
    military: false,
  };
}