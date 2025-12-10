


import type { ProviderId } from '@/stores/useAiConfigStore.types';

export interface ModelMeta {
  family: string;
  ctx?: number | undefined;
  tags: string[];
}


const PROVIDER_DEFAULT_CTX: Record<ProviderId, number | undefined> = {
  openai: 128000,
  anthropic: 200000,
  gemini: 1000000,
  ollama: 8192,
  custom: 8192,
};

export function deriveModelMeta(provider: ProviderId, id: string): ModelMeta {
  const lower = id.toLowerCase();
  const tags: string[] = [];
  let family = id.split(':')[0];

  if (provider === 'openai') {
    if (lower.startsWith('gpt-4o')) family = 'gpt-4o';
    else if (lower.startsWith('gpt-4.1')) family = 'gpt-4.1';
    else if (lower.startsWith('gpt-4-turbo')) family = 'gpt-4-turbo';
    else if (lower.startsWith('gpt-3.5')) family = 'gpt-3.5';
    else if (lower.startsWith('o3')) family = 'o3';
    else if (lower.startsWith('o1')) family = 'o1';
  } else if (provider === 'anthropic') {
    if (lower.startsWith('claude-4')) family = 'claude-4';
    else if (lower.startsWith('claude-3.7')) family = 'claude-3.7';
    else if (lower.startsWith('claude-3.5')) family = 'claude-3.5';
    else if (lower.startsWith('claude-3')) family = 'claude-3';
    else if (lower.startsWith('claude-2')) family = 'claude-2';
  } else if (provider === 'gemini') {
    if (lower.startsWith('gemini-2.0')) family = 'gemini-2.0';
    else if (lower.startsWith('gemini-1.5')) family = 'gemini-1.5';
    else if (lower.startsWith('gemini-1.0')) family = 'gemini-1.0';
  }

  if (/embedding|embed/.test(lower)) tags.push('embed');
  if (/audio|speech|voice/.test(lower)) tags.push('audio');
  if (/vision|image/.test(lower)) tags.push('vision');
  if (/o1|o3|reason|haiku|sonnet|opus/.test(lower)) tags.push('reasoning');
  if (!tags.includes('embed')) tags.push('chat');
  if (/legacy|3\.5|2\.1|2\.0|0613/.test(lower)) tags.push('legacy');

  let ctx = PROVIDER_DEFAULT_CTX[provider];
  if (provider === 'openai') {
    if (lower.includes('3.5')) ctx = 16000; else if (lower.includes('embedding')) ctx = 8192;
  } else if (provider === 'anthropic') {
    if (lower.includes('haiku')) ctx = 200000; else if (lower.includes('sonnet')) ctx = 200000; else if (lower.includes('opus')) ctx = 200000;
  } else if (provider === 'gemini') {
    if (lower.includes('flash-8b')) ctx = 8192; else if (lower.includes('flash')) ctx = 1000000; else if (lower.includes('pro')) ctx = 1000000;
  }
  return { family, ctx, tags };
}
