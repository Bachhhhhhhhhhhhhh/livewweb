import { isStaticWebMirror } from '@/services/static-mirror';
import { withBase } from '@/utils/app-base';

/** Origin YouTube accepts for IFrame API / embed playerVars. */
export const YOUTUBE_TRUSTED_ORIGIN = 'https://worldmonitor.app';

/**
 * Returns the origin passed to YouTube embeds (origin + widget_referrer).
 * GitHub Pages and desktop webviews must not use their real page origin —
 * YouTube blocks or bot-checks those embeds (error 153).
 */
export function getYouTubePlayerOrigin(): string {
  if (typeof window === 'undefined') return YOUTUBE_TRUSTED_ORIGIN;

  try {
    const { protocol, hostname, host } = window.location;
    if (protocol === 'http:' || protocol === 'https:') {
      if (hostname.endsWith('.github.io')) return YOUTUBE_TRUSTED_ORIGIN;
      if (host === 'tauri.localhost' || host.endsWith('.tauri.localhost')) {
        return YOUTUBE_TRUSTED_ORIGIN;
      }
      return window.location.origin;
    }
    if (protocol === 'tauri:' || protocol === 'asset:') {
      return YOUTUBE_TRUSTED_ORIGIN;
    }
  } catch {
    // ignore
  }

  return YOUTUBE_TRUSTED_ORIGIN;
}

export function shouldUseYouTubeEmbedBridge(): boolean {
  return isStaticWebMirror();
}

export interface YouTubeEmbedBridgeOptions {
  videoId: string;
  autoplay?: boolean;
  mute?: boolean;
  quality?: string;
  parentOrigin?: string;
}

/** Static bridge page shipped in docs/ for GitHub Pages live streams. */
export function buildYouTubeEmbedBridgeUrl(options: YouTubeEmbedBridgeOptions): string {
  const params = new URLSearchParams({
    videoId: options.videoId,
    autoplay: options.autoplay === false ? '0' : '1',
    mute: options.mute === false ? '0' : '1',
    origin: YOUTUBE_TRUSTED_ORIGIN,
    parentOrigin: options.parentOrigin || (typeof window !== 'undefined' ? window.location.origin : YOUTUBE_TRUSTED_ORIGIN),
  });
  if (options.quality && options.quality !== 'auto') {
    params.set('vq', options.quality);
  }
  return `${withBase('/youtube-embed-bridge.html')}?${params.toString()}`;
}