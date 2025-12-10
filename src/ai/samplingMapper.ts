


import type { BuildParams, BuiltProviderRequest, ProviderRequestBuilder, SanitizedRequestSnapshot } from './types';
import type { Sampling } from '@/stores/useAiConfigStore.types';

const OPENAI_BASE = 'https://api.openai.com/v1';
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OLLAMA_BASE = 'http://localhost:11434';

function estChars(prompt: string, sampling: Sampling): number {

  return (prompt?.length || 0) + (sampling.system_prompt?.length || 0);
}

const buildOpenAI: ProviderRequestBuilder = ({ model, sampling, apiKey, baseUrl, prompt }, opts) => {
  const url = `${(baseUrl || OPENAI_BASE).replace(/\/$/,'')}/chat/completions`;
  const messages: any[] = [];
  if (sampling.system_prompt) messages.push({ role: 'system', content: sampling.system_prompt });
  messages.push({ role: 'user', content: prompt });
  const body: any = {
    model,
    messages,
    temperature: sampling.temperature,
    max_tokens: sampling.max_tokens,
    stream: opts?.stream ?? true,
  };
  if (sampling.top_p != null) body.top_p = sampling.top_p;
  if (sampling.json_mode) body.response_format = { type: 'json_object' };
  return {
    provider: 'openai',
    model,
    request: {
      url,
      method: 'POST',
      headers: Object.fromEntries([
        ['Content-Type','application/json'],
        ...(apiKey ? [['Authorization', `Bearer ${apiKey}`] as const] : []),
      ]),
      body,
    },
    meta: {
      jsonModeApplied: !!sampling.json_mode,
      topPSupported: true,
      usedSystemPrompt: !!sampling.system_prompt,
      estimatedInputChars: estChars(prompt, sampling),
    },
  } satisfies BuiltProviderRequest;
};

const buildAnthropic: ProviderRequestBuilder = ({ model, sampling, apiKey, baseUrl, prompt }, opts) => {
  const url = `${(baseUrl || ANTHROPIC_BASE).replace(/\/$/,'')}/messages`;
  const body: any = {
    model,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: sampling.system_prompt ? `${sampling.system_prompt}\n\n${prompt}` : prompt },
        ],
      },
    ],
    temperature: sampling.temperature,
    max_tokens: sampling.max_tokens,
    stream: opts?.stream ?? true,
  };
  if (sampling.top_p != null) body.top_p = sampling.top_p;

  if (sampling.json_mode) body.metadata = { ...(body.metadata||{}), json_mode: true };
  return {
    provider: 'anthropic',
    model,
    request: {
      url,
      method: 'POST',
      headers: Object.fromEntries([
        ['Content-Type','application/json'],
        ['anthropic-version','2023-06-01'],
        ...(apiKey ? [['x-api-key', apiKey] as const] : []),
      ]),
      body,
    },
    meta: {
      jsonModeApplied: !!sampling.json_mode,
      topPSupported: true,
      usedSystemPrompt: !!sampling.system_prompt,
      estimatedInputChars: estChars(prompt, sampling),
    },
  } satisfies BuiltProviderRequest;
};

const buildGemini: ProviderRequestBuilder = ({ model, sampling, apiKey, baseUrl, prompt }, opts) => {
  const root = (baseUrl || GEMINI_BASE).replace(/\/$/,'');
  const url = `${root}/models/${encodeURIComponent(model)}:generateContent${apiKey ? `?key=${encodeURIComponent(apiKey)}`:''}`;
  const body: any = {
    contents: [
      {
        role: 'user',
        parts: [ { text: sampling.system_prompt ? `${sampling.system_prompt}\n\n${prompt}` : prompt } ],
      },
    ],
    generationConfig: {
      temperature: sampling.temperature,
      maxOutputTokens: sampling.max_tokens,
    },
    safetySettings: [],
    stream: opts?.stream ?? true,
  };
  if (sampling.top_p != null) body.generationConfig.topP = sampling.top_p;
  if (sampling.json_mode) body.generationConfig.responseMimeType = 'application/json';
  return {
    provider: 'gemini',
    model,
    request: {
      url,
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body,
    },
    meta: {
      jsonModeApplied: !!sampling.json_mode,
      topPSupported: true,
      usedSystemPrompt: !!sampling.system_prompt,
      estimatedInputChars: estChars(prompt, sampling),
    },
  } satisfies BuiltProviderRequest;
};

const buildOllama: ProviderRequestBuilder = ({ model, sampling, baseUrl, prompt }, opts) => {
  const url = `${(baseUrl || OLLAMA_BASE).replace(/\/$/,'')}/api/chat`;
  const messages: any[] = [];
  if (sampling.system_prompt) messages.push({ role: 'system', content: sampling.system_prompt });
  messages.push({ role: 'user', content: prompt });
  const body: any = {
    model,
    messages,
    stream: opts?.stream ?? true,
    options: {
      temperature: sampling.temperature,
      num_predict: sampling.max_tokens,
    },
  };
  if (sampling.top_p != null) body.options.top_p = sampling.top_p;
  if (sampling.json_mode) body.format = 'json';
  return {
    provider: 'ollama',
    model,
    request: { url, method: 'POST', headers: { 'Content-Type':'application/json' }, body },
    meta: {
      jsonModeApplied: !!sampling.json_mode,
      topPSupported: true,
      usedSystemPrompt: !!sampling.system_prompt,
      estimatedInputChars: estChars(prompt, sampling),
    },
  } satisfies BuiltProviderRequest;
};

const buildCustom: ProviderRequestBuilder = ({ provider, model, sampling, baseUrl, prompt }, opts) => {
  const url = (baseUrl || '').trim() || 'https://example.com/your-endpoint';
  const body = { model, prompt, sampling, stream: opts?.stream ?? true };
  return {
    provider: provider,
    model,
    request: { url, method: 'POST', headers: { 'Content-Type':'application/json' }, body },
    meta: {
      jsonModeApplied: !!sampling.json_mode,
      topPSupported: true,
      usedSystemPrompt: !!sampling.system_prompt,
      estimatedInputChars: estChars(prompt, sampling),
    },
  } satisfies BuiltProviderRequest;
};

export function buildProviderRequest(params: BuildParams, opts?: { stream?: boolean }): BuiltProviderRequest {
  switch (params.provider) {
    case 'openai': return buildOpenAI(params, opts);
    case 'anthropic': return buildAnthropic(params, opts);
  case 'gemini': return buildGemini(params, opts);
    case 'ollama': return buildOllama(params, opts);
    case 'custom': return buildCustom(params, opts);
    default: return buildCustom(params, opts);
  }
}

export function sanitizeBuiltRequest(built: BuiltProviderRequest): SanitizedRequestSnapshot {
  const headers: Record<string,string> = { ...built.request.headers };
  if (headers.Authorization) headers.Authorization = 'Bearer ***';
  if (headers['x-api-key']) headers['x-api-key'] = '***';
  return {
    provider: built.provider,
    model: built.model,
    url: built.request.url,
    headers,
    body: built.request.body,
    meta: built.meta,
  };
}
