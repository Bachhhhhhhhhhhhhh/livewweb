import { isStaticWebMirror, shouldUseLiveApiFetch } from '@/services/static-mirror';
import { toApiUrl } from '@/services/runtime';
import { withBase } from '@/utils/app-base';

interface LiveVideoInfo {
  videoId: string | null;
  hlsUrl: string | null;
}

const liveVideoCache = new Map<string, { videoId: string | null; hlsUrl: string | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let bakedLiveChannelsPromise: Promise<Record<string, LiveVideoInfo>> | null = null;

async function loadBakedLiveChannels(): Promise<Record<string, LiveVideoInfo>> {
  if (!bakedLiveChannelsPromise) {
    bakedLiveChannelsPromise = fetch(withBase('/live-seed/live-channels.json'))
      .then(async (res) => {
        if (!res.ok) return {};
        const data = await res.json() as { channels?: Record<string, { videoId?: string | null; hlsUrl?: string | null }> };
        const out: Record<string, LiveVideoInfo> = {};
        for (const [handle, info] of Object.entries(data.channels ?? {})) {
          out[handle] = {
            videoId: info.videoId ?? null,
            hlsUrl: info.hlsUrl ?? null,
          };
        }
        return out;
      })
      .catch(() => ({}));
  }
  return bakedLiveChannelsPromise;
}

export async function fetchLiveVideoInfo(channelHandle: string): Promise<LiveVideoInfo> {
  const cached = liveVideoCache.get(channelHandle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { videoId: cached.videoId, hlsUrl: cached.hlsUrl };
  }

  if (isStaticWebMirror()) {
    if (shouldUseLiveApiFetch()) {
      try {
        const res = await fetch(toApiUrl(`/api/youtube/live?channel=${encodeURIComponent(channelHandle)}`));
        if (res.ok) {
          const data = await res.json();
          const videoId = data.videoId || null;
          const hlsUrl = data.hlsUrl || null;
          liveVideoCache.set(channelHandle, { videoId, hlsUrl, timestamp: Date.now() });
          return { videoId, hlsUrl };
        }
      } catch (error) {
        console.warn(`[LiveNews] Live API fallback for ${channelHandle}:`, error);
      }
    }

    const baked = await loadBakedLiveChannels();
    const bakedInfo = baked[channelHandle];
    const info: LiveVideoInfo = {
      videoId: bakedInfo?.videoId ?? null,
      hlsUrl: bakedInfo?.hlsUrl ?? null,
    };
    liveVideoCache.set(channelHandle, { ...info, timestamp: Date.now() });
    return info;
  }

  try {
    const res = await fetch(toApiUrl(`/api/youtube/live?channel=${encodeURIComponent(channelHandle)}`));
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const videoId = data.videoId || null;
    const hlsUrl = data.hlsUrl || null;
    liveVideoCache.set(channelHandle, { videoId, hlsUrl, timestamp: Date.now() });
    return { videoId, hlsUrl };
  } catch (error) {
    console.warn(`[LiveNews] Failed to fetch live info for ${channelHandle}:`, error);
    return { videoId: null, hlsUrl: null };
  }
}

/** @deprecated Use fetchLiveVideoInfo instead */
export async function fetchLiveVideoId(channelHandle: string): Promise<string | null> {
  const info = await fetchLiveVideoInfo(channelHandle);
  return info.videoId;
}
