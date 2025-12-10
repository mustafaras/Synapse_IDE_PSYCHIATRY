

import type { ProviderKey } from './registry';

export type EndpointId =
  | 'openai_chat_completions'
  | 'anthropic_messages'
  | 'gemini_generate'
  | 'ollama_generate';

export type RequiredCapability = 'chat_stream' | 'vision' | 'tools';

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  endpoint?: EndpointId;
  alternatives?: Array<{ provider: ProviderKey; model: string; label: string }>;
}
