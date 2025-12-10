import { getAdapter } from '@/services/ai/adapters';

type Normalized = {
  system?: string;
  messages: Array<{ role:'system'|'user'|'assistant'; content: string }>;
  jsonMode?: boolean;
  maxOutput?: number;
};

export async function routeAndStream(opts: { normalized: Normalized; route: any; allowCache?: boolean }): Promise<{ text: string; textStream?: AsyncGenerator<string> }> {
  const { normalized, route } = opts;
  const provider = (route?.provider ?? route?.id ?? 'openai') as 'openai'|'anthropic'|'gemini'|'ollama';
  const model = (route?.model ?? 'gpt-4o-mini') as string;
  const adapter = getAdapter(provider);

  const { text } = await adapter.complete({ options: { model } as any, messages: [ ...(normalized.system? [{ role:'system', content: normalized.system }] : []), ...normalized.messages ] as any, timeoutMs: 20000 });
  return { text };
}
