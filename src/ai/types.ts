


import type { ProviderId, Sampling } from '@/stores/useAiConfigStore.types';

export interface BuiltProviderRequest {
  provider: ProviderId;
  model: string;
  request: {
    url: string;
    method: 'POST';
    headers: Record<string, string>;
    body: any;
  };
  meta: {
    jsonModeApplied: boolean;
    topPSupported: boolean;
    usedSystemPrompt: boolean;
    estimatedInputChars: number;
  };
}

export interface BuildParams {
  provider: ProviderId;
  model: string;
  sampling: Sampling;
  apiKey?: string;
  baseUrl?: string;
  prompt: string;
  previousMessages?: { role: 'user' | 'assistant'; content: string }[];
}

export interface BuildOptions { stream?: boolean; }

export type ProviderRequestBuilder = (params: BuildParams, opts?: BuildOptions) => BuiltProviderRequest;

export interface SanitizedRequestSnapshot {
  provider: ProviderId;
  model: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  meta: BuiltProviderRequest['meta'];
}
