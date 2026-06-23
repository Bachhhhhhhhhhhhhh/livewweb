import { isStaticWebMirror } from '@/services/static-mirror';
import type { PanelConfig } from '@/types';

/** Viewport-first priming — avoids an ~80-request fan-out at boot. */
export function shouldPrimeForkPanel(
  _panelId: string,
  _panelSettings: Record<string, PanelConfig>,
  nearViewport: boolean,
  forceAll = false,
): boolean {
  if (forceAll) return true;
  return nearViewport;
}

/** Off-screen enabled panels — loaded in staggered idle batches after first paint. */
export function shouldPrimeForkPanelInBackground(
  panelId: string,
  panelSettings: Record<string, PanelConfig>,
  nearViewport: boolean,
  forceAll = false,
): boolean {
  if (!isStaticWebMirror() || forceAll || nearViewport) return false;
  return panelSettings[panelId]?.enabled === true;
}