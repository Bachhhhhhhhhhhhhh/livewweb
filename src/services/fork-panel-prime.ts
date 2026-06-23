import { isStaticWebMirror } from '@/services/static-mirror';
import type { PanelConfig } from '@/types';

/** On GitHub Pages, prime every enabled panel so constructors don't sit at showLoading(). */
export function shouldPrimeForkPanel(
  panelId: string,
  panelSettings: Record<string, PanelConfig>,
  nearViewport: boolean,
  forceAll = false,
): boolean {
  if (forceAll) return true;
  if (!isStaticWebMirror()) return nearViewport;
  if (panelSettings[panelId]?.enabled) return true;
  return nearViewport;
}