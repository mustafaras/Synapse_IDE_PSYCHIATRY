export type TraceId = string;
export type SpanId = string;

export interface Trace {
  id: TraceId;
  requestId: string;
  startedAt: number;
  finishedAt?: number;
  provider?: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  model?: string;
  mode?: 'beginner' | 'pro';
  status: 'ok' | 'error' | 'cancelled' | 'pending';
  userTextBytes?: number;
  attachmentsCount?: number;
  usage?: { prompt: number; completion: number };
  cost?: { currency: 'USD'; prompt: number; completion: number; total: number } | undefined;
  error?: { code: string; status?: number; message?: string };
  spans: Span[];
  notes?: Record<string, string>;
}

export interface Span {
  id: SpanId;
  type:
    | 'build_prompt'
    | 'network_connect'
    | 'stream'
    | 'tool_call'
    | 'normalize'
    | 'apply'
    | 'attachments_digest';
  name: string;
  start: number;
  end?: number;

  meta?: Record<string, any>;
}
