import type { Message, ModelOptions, ProviderKey } from './adapters/types';
import { getAdapter } from './adapters';

export async function runComplete(provider: ProviderKey, args: {
  baseUrl?: string;
  apiKey?: string;
  options: ModelOptions;
  messages: Message[];
  signal?: AbortSignal;
  timeoutMs?: number;
}) {
  const adapter = getAdapter(provider);
  return adapter.complete(args);
}
