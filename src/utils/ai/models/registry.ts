

export type ProviderKey = 'openai' | 'anthropic' | 'gemini' | 'ollama';
import type { EndpointId } from './schema';

export interface ModelSpec {
  id: string;
  provider: ProviderKey;
  label: string;
  family?: string;
  supportsVision?: boolean;
  supportsTools?: boolean;
  defaultTemp?: number;
  capTokens?: number;
  endpoint?: EndpointId;
}

export const MODEL_REGISTRY: ModelSpec[] = [

  { id: 'gpt-5', provider: 'openai', label: 'GPT-5', family: 'GPT-5', supportsTools: true, capTokens: 200000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-5-mini', provider: 'openai', label: 'GPT-5 Mini', family: 'GPT-5', supportsTools: true, capTokens: 128000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-5-nano', provider: 'openai', label: 'GPT-5 Nano', family: 'GPT-5', supportsTools: true, capTokens: 64000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-4o', provider: 'openai', label: 'GPT-4o', family: 'GPT-4o', supportsVision: true, supportsTools: true, capTokens: 128000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-4o-mini', provider: 'openai', label: 'GPT-4o mini', family: 'GPT-4o', supportsVision: true, supportsTools: true, capTokens: 128000, endpoint: 'openai_chat_completions' },
  { id: 'chatgpt-4o-latest', provider: 'openai', label: 'ChatGPT 4o (latest)', family: 'GPT-4o', supportsVision: true, supportsTools: true, capTokens: 128000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-4-turbo', provider: 'openai', label: 'GPT-4 Turbo', family: 'GPT-4', supportsTools: true, capTokens: 128000, endpoint: 'openai_chat_completions' },
  { id: 'gpt-4', provider: 'openai', label: 'GPT-4', family: 'GPT-4', supportsTools: true, capTokens: 8192, endpoint: 'openai_chat_completions' },
  { id: 'gpt-3.5-turbo', provider: 'openai', label: 'GPT-3.5 Turbo', family: 'GPT-3.5', capTokens: 4096, endpoint: 'openai_chat_completions' },


  { id: 'claude-4-opus', provider: 'anthropic', label: 'Claude 4 Opus', family: 'Claude 4', supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-4-sonnet', provider: 'anthropic', label: 'Claude 4 Sonnet', family: 'Claude 4', supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-4-haiku', provider: 'anthropic', label: 'Claude 4 Haiku', family: 'Claude 4', capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3.5-opus-20241022', provider: 'anthropic', label: 'Claude 3.5 Opus (2024-10-22)', family: 'Claude 3.5', supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3.5-vision-20241022', provider: 'anthropic', label: 'Claude 3.5 Vision (2024-10-22)', family: 'Claude 3.5', supportsVision: true, supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', label: 'Claude 3.5 Sonnet (2024-10-22)', family: 'Claude 3.5', supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-5-sonnet-20240620', provider: 'anthropic', label: 'Claude 3.5 Sonnet (2024-06-20)', family: 'Claude 3.5', supportsTools: true, capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-5-haiku-20241022', provider: 'anthropic', label: 'Claude 3.5 Haiku (2024-10-22)', family: 'Claude 3.5', capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-opus-20240229', provider: 'anthropic', label: 'Claude 3 Opus (2024-02-29)', family: 'Claude 3', capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-sonnet-20240229', provider: 'anthropic', label: 'Claude 3 Sonnet (2024-02-29)', family: 'Claude 3', capTokens: 200000, endpoint: 'anthropic_messages' },
  { id: 'claude-3-haiku-20240307', provider: 'anthropic', label: 'Claude 3 Haiku (2024-03-07)', family: 'Claude 3', capTokens: 200000, endpoint: 'anthropic_messages' },


  { id: 'gemini-2.0-pro-exp', provider: 'gemini', label: 'Gemini 2.0 Pro (exp)', family: 'Gemini 2.0', supportsTools: true, capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-2.0-flash-lite', provider: 'gemini', label: 'Gemini 2.0 Flash Lite', family: 'Gemini 2.0', capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-2.0-flash-exp', provider: 'gemini', label: 'Gemini 2.0 Flash (exp)', family: 'Gemini 2.0', capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-1.5-pro-latest', provider: 'gemini', label: 'Gemini 1.5 Pro (latest)', family: 'Gemini 1.5', supportsTools: true, capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-1.5-pro', provider: 'gemini', label: 'Gemini 1.5 Pro', family: 'Gemini 1.5', supportsTools: true, capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-1.5-flash', provider: 'gemini', label: 'Gemini 1.5 Flash', family: 'Gemini 1.5', capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-1.5-flash-8b', provider: 'gemini', label: 'Gemini 1.5 Flash 8B', family: 'Gemini 1.5', capTokens: 1000000, endpoint: 'gemini_generate' },
  { id: 'gemini-pro', provider: 'gemini', label: 'Gemini Pro', family: 'Gemini 1.0', capTokens: 120000, endpoint: 'gemini_generate' },
  { id: 'gemini-pro-vision', provider: 'gemini', label: 'Gemini Pro Vision', family: 'Gemini 1.0', supportsVision: true, capTokens: 120000, endpoint: 'gemini_generate' },


  { id: 'llama3.1', provider: 'ollama', label: 'Llama 3.1', family: 'Llama 3.1', capTokens: 32768, endpoint: 'ollama_generate' },
  { id: 'llama3.1:70b', provider: 'ollama', label: 'Llama 3.1 70B', family: 'Llama 3.1', capTokens: 32768 },
  { id: 'llama3', provider: 'ollama', label: 'Llama 3', family: 'Llama', capTokens: 8192 },
  { id: 'llama2', provider: 'ollama', label: 'Llama 2', family: 'Llama', capTokens: 8192 },
  { id: 'codellama', provider: 'ollama', label: 'CodeLlama', family: 'Llama', capTokens: 8192 },
  { id: 'codellama:13b', provider: 'ollama', label: 'CodeLlama 13B', family: 'Llama', capTokens: 8192 },
  { id: 'mistral', provider: 'ollama', label: 'Mistral', family: 'Mistral', capTokens: 32768 },
  { id: 'mixtral', provider: 'ollama', label: 'Mixtral 8x7B', family: 'Mixtral', capTokens: 32768 },
  { id: 'phi3', provider: 'ollama', label: 'Phi-3', family: 'Phi', capTokens: 4096 },
  { id: 'phi', provider: 'ollama', label: 'Phi-2', family: 'Phi', capTokens: 4096 },
  { id: 'deepseek-coder', provider: 'ollama', label: 'DeepSeek Coder', family: 'DeepSeek', capTokens: 16384 },
  { id: 'deepseek-coder:33b', provider: 'ollama', label: 'DeepSeek Coder 33B', family: 'DeepSeek', capTokens: 16384 },
  { id: 'qwen2.5-coder', provider: 'ollama', label: 'Qwen2.5 Coder', family: 'Qwen', capTokens: 32768 },
  { id: 'starcoder2', provider: 'ollama', label: 'StarCoder2', family: 'StarCoder', capTokens: 16384 },
];

export function listModelsByProvider(p: ProviderKey): ModelSpec[] {
  return MODEL_REGISTRY.filter(m => m.provider === p);
}
export function getModel(id: string): ModelSpec | undefined {
  return MODEL_REGISTRY.find(m => m.id === id);
}


export function inferEndpointForModel(modelId: string): EndpointId | undefined {
  const m = getModel(modelId);
  if (!m) return undefined;
  if (m.endpoint) return m.endpoint;
  if (m.provider === 'openai') return 'openai_chat_completions';
  if (m.provider === 'anthropic') return 'anthropic_messages';
  if (m.provider === 'gemini') return 'gemini_generate';
  if (m.provider === 'ollama') return 'ollama_generate';
  return undefined;
}

export function listByEndpoint(e: EndpointId): ModelSpec[] {
  return MODEL_REGISTRY.filter(m => (m.endpoint || inferEndpointForModel(m.id)) === e);
}
