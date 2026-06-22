import { getRuntimeConfigSnapshot } from '@/services/runtime-config';
import { isStaticWebMirror } from '@/services/static-mirror';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export function canUseClientAnalyst(): boolean {
  if (!isStaticWebMirror()) return false;
  const key = getRuntimeConfigSnapshot().secrets.GROQ_API_KEY?.value?.trim();
  return Boolean(key);
}

export async function streamClientAnalyst(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  domainFocus: string,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<'done' | 'error'> {
  const apiKey = getRuntimeConfigSnapshot().secrets.GROQ_API_KEY?.value?.trim();
  if (!apiKey) return 'error';

  const system = [
    'You are World Monitor Analyst for Brian Bach Truong (Data Analyst, Honda).',
    'Answer in clear markdown. Domain: ' + domainFocus + '.',
    'Use live-dashboard tone; note when inferring beyond visible data.',
  ].join(' ');

  const messages = [
    { role: 'system' as const, content: system },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content.slice(0, 800) })),
    { role: 'user' as const, content: query.slice(0, 500) },
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      stream: true,
      temperature: 0.4,
      max_tokens: 1200,
    }),
    signal,
  });

  if (!res.ok || !res.body) return 'error';

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onDelta(accumulated);
        }
      } catch { /* skip */ }
    }
  }

  return accumulated.trim() ? 'done' : 'error';
}