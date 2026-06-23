import { isStaticWebMirror } from '@/services/static-mirror';
import type { VariantMeta } from '@/config/variant-meta';
import { VARIANT_META } from '@/config/variant-meta';

export const MIRROR_SITE_NAME = 'The Vision of World';
export const MIRROR_SITE_LOGO_SHORT = 'VISION';
export const MIRROR_SITE_NAME_UPPER = 'THE VISION OF WORLD';
export const MIRROR_SITE_TAGLINE = 'Real-Time Global Intelligence Dashboard';
export const MIRROR_GITHUB_PAGES_URL = 'https://bachhhhhhhhhhhhhh.github.io/livewweb/docs/dashboard.html';

export function isMirrorBranding(): boolean {
  return isStaticWebMirror();
}

export function getSiteDisplayName(): string {
  return isMirrorBranding() ? MIRROR_SITE_NAME : 'World Monitor';
}

export function getSiteLogoShort(): string {
  return isMirrorBranding() ? MIRROR_SITE_LOGO_SHORT : 'MONITOR';
}

export function getSiteNameUpper(): string {
  return isMirrorBranding() ? MIRROR_SITE_NAME_UPPER : 'WORLD MONITOR';
}

export function getMirrorDocumentTitle(lang = 'en'): string {
  const suffix = lang === 'vi'
    ? 'Bảng điều khiển tình báo toàn cầu theo thời gian thực'
    : MIRROR_SITE_TAGLINE;
  return `${MIRROR_SITE_NAME} — ${suffix}`;
}

export function resolveShellDocumentTitle(localizedTitle: string, lang = 'en'): string {
  if (!isMirrorBranding()) return localizedTitle;
  return getMirrorDocumentTitle(lang);
}

export function getEffectiveVariantMeta(variant: keyof typeof VARIANT_META = 'full'): VariantMeta {
  const base = VARIANT_META[variant] ?? VARIANT_META.full;
  if (!isMirrorBranding()) return base;

  const title = `${MIRROR_SITE_NAME} — ${MIRROR_SITE_TAGLINE}`;
  return {
    ...base,
    title,
    siteName: MIRROR_SITE_NAME,
    shortName: MIRROR_SITE_NAME,
    url: MIRROR_GITHUB_PAGES_URL,
    description: 'Real-time global intelligence dashboard with live news, markets, military tracking, infrastructure monitoring, and geopolitical data.',
  };
}