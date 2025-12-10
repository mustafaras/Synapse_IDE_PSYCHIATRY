


export type ProviderKey = 'openai' | 'anthropic' | 'gemini' | 'ollama';

export interface ToolDef {
  name: string;
  description?: string;

  parameters?: Record<string, any>;
}

export interface ModelOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  jsonMode?: boolean;
  stop?: string[];
  tools?: ToolDef[];
  toolChoice?: 'auto' | { name: string };
  system?: string;
  images?: Array<{ mime: string; b64: string }>;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export type FinishReason = 'stop'|'length'|'tool_call'|'content_filter'|'error';

export type StreamEvent =
  | { type: 'start'; requestId: string; meta?: unknown }

  | { type: 'handshake'; requestId: string }
  | { type: 'first_byte'; requestId: string }
  | { type: 'delta'; requestId: string; text?: string }
  | { type: 'tool_call'; requestId: string; call: { id: string; name: string; argsJson: string } }
  | { type: 'tool_result_request'; requestId: string; callId: string }
  | { type: 'usage'; requestId: string; usage: { prompt: number; completion: number } }
  | { type: 'done'; requestId: string; finishReason?: FinishReason }
  | { type: 'error'; requestId: string; error: UnifiedError };

export type CompleteResult = {
  text: string;
  toolCalls?: Array<{ id: string; name: string; argsJson: string }>;
  usage?: { prompt: number; completion: number };
  finishReason?: FinishReason;
};

export type UnifiedErrorCode =
  | 'network' | 'timeout' | 'rate_limit' | 'auth' | 'permission' | 'content_blocked'
  | 'invalid_request' | 'server' | 'cancelled' | 'unknown';

export interface UnifiedError extends Error {
  code: UnifiedErrorCode;
  provider?: ProviderKey;
  status?: number;

  raw?: any;
}

export interface Adapter {
  stream(opts: {
    requestId: string;
    signal: AbortSignal;
    baseUrl?: string;
    apiKey?: string;
    options: ModelOptions;
    messages: Message[];
    onEvent: (ev: StreamEvent) => void;
    timeoutMs?: number;
  }): Promise<void>;

  complete(opts: {
    baseUrl?: string;
    apiKey?: string;
    options: ModelOptions;
    messages: Message[];
    signal?: AbortSignal;
    timeoutMs?: number;
  }): Promise<CompleteResult>;

  listModels?(opts: { baseUrl?: string; apiKey?: string; signal?: AbortSignal }): Promise<string[]>;
}
