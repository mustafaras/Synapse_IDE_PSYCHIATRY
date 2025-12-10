


import type { ModelId, ProviderCaps, ProviderId, ProviderKey } from '../stores/useAiConfigStore.types';


const STATIC_MODELS: Record<ProviderId, ModelId[]> = {
  openai: [

    'gpt-5','gpt-5-mini',
    'gpt-4.1','gpt-4.1-mini','gpt-4.1-nano',
    'gpt-4o','gpt-4o-mini','gpt-4o-realtime-preview','gpt-4o-audio-preview','gpt-4o-mini-translate','gpt-4o-mini-audio',
    'gpt-4-turbo','gpt-4',
    'gpt-3.5-turbo',

    'o3-mini','o1-mini',

    'text-embedding-3-large','text-embedding-3-small','text-embedding-ada-002',
  ],
  anthropic: [

  'claude-4-opus','claude-4-sonnet','claude-4-haiku',

    'claude-3.7-sonnet','claude-3.7-haiku',
    'claude-3.5-sonnet','claude-3.5-haiku',
    'claude-3-opus','claude-3-sonnet','claude-3-haiku',

    'claude-2.1','claude-2.0'
  ],
  gemini: [
    'gemini-2.0-pro','gemini-2.0-pro-exp-02-05','gemini-2.0-flash-exp',
    'gemini-1.5-pro','gemini-1.5-pro-latest',
    'gemini-1.5-flash','gemini-1.5-flash-latest','gemini-1.5-flash-8b','gemini-1.5-flash-8b-latest',
    'gemini-1.0-pro','gemini-1.0-pro-vision',
  ],
  ollama: [
    'llama3.2','llama3.1','llama3','mistral','mixtral-8x7b','codellama','deepseek-coder','qwen2.5','qwen2.5-coder','phi3','starcoder2','mistral-nemo'
  ],
  custom: [],
};

const CAPS: Record<ProviderId, ProviderCaps> = {
  openai:    { streaming: true, jsonMode: true,  supportsTopP: true,  tokenLimit: 128000 },
  anthropic: { streaming: true, jsonMode: false, supportsTopP: true,  tokenLimit: 200000 },
  gemini:    { streaming: true, jsonMode: false, supportsTopP: true,  tokenLimit: 1000000 },
  ollama:    { streaming: true, jsonMode: false, supportsTopP: true,  tokenLimit: 8192 },
  custom:    { streaming: true, jsonMode: false, supportsTopP: true,  tokenLimit: 8192 },
};

export function getStaticModels(p: ProviderId): ModelId[] { return STATIC_MODELS[p] ?? []; }
export function getCaps(p: ProviderId): ProviderCaps { return CAPS[p]; }
export function getDefaultModel(p: ProviderId): ModelId | null {
  const list = getStaticModels(p);
  return list.length ? list[0] : null;
}


export const __REGISTRY = { STATIC_MODELS, CAPS };


import * as OpenAI from './providerClients/openai';
import * as Anthropic from './providerClients/anthropic';
import * as Google from './providerClients/google';
import * as Ollama from './providerClients/ollama';

export async function listModelsDynamic(p: ProviderId, keys: ProviderKey): Promise<string[]> {
  const k: { apiKey?: string; baseUrl?: string } = {};
  if (keys.apiKey) k.apiKey = keys.apiKey;
  if (keys.baseUrl) k.baseUrl = keys.baseUrl;


  const baseUrlKey = k.baseUrl || '';
  const keyPresence = k.apiKey ? 'k1' : 'k0';
  const cacheKey = `${p}::${baseUrlKey}::${keyPresence}`;
  const now = Date.now();
  const ttl = 60_000;

  const g = globalThis as unknown as { __AI_MODEL_CACHE?: Map<string, { ts: number; models: string[] }> };
  if (!g.__AI_MODEL_CACHE) g.__AI_MODEL_CACHE = new Map();
  const cache = g.__AI_MODEL_CACHE;
  const cached = cache.get(cacheKey);
  if (cached && (now - cached.ts) < ttl) return cached.models;

  try {
    let raw: string[] = [];
    switch (p) {
      case 'openai': raw = await OpenAI.listModels(k); break;
      case 'anthropic': raw = await Anthropic.listModels(k); break;
  case 'gemini': raw = await Google.listModels(k); break;
      case 'ollama': raw = await Ollama.listModels(k); break;
      default: raw = []; break;
    }
    const norm = raw.map(id => normalizeModelId(p, id)).filter(Boolean);
    cache.set(cacheKey, { ts: now, models: norm });
    return norm;
  } catch {
    return [];
  }
}


export function normalizeModelId(p: ProviderId, id: string): string {
  let v = id.trim();
  if (!v) return v;
  if (p === 'gemini') {

    if (v.startsWith('models/')) v = v.slice(7);
  }
  return v;
}


export const __MODEL_REGISTRY_VERSION = 5;

export function __clearDynamicModelCache() {
  const g = globalThis as unknown as { __AI_MODEL_CACHE?: Map<string, { ts: number; models: string[] }> };
  if (g.__AI_MODEL_CACHE) g.__AI_MODEL_CACHE.clear();
}

