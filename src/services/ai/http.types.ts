export type RetryPolicy = {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn: (status?: number, errCode?: string) => boolean;
};

export type TimeoutPolicy = {
  requestTimeoutMs: number;
  sseOpenTimeoutMs: number;
};

export type UnifiedErrorCode =
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'http_4xx'
  | 'http_5xx'
  | 'parse'
  | 'unknown';

export type UnifiedError = {
  code: UnifiedErrorCode;
  status?: number;
  retriable: boolean;
  userMessage: string;
  detail?: string;

  providerCode?: string;

  category?: 'rate_limit' | 'auth' | 'network' | 'server' | 'client' | 'timeout';
};

export type RequestJSONOptions = {
  url: string;
  method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  timeout?: number;
  retry?: Partial<RetryPolicy>;
};

export type RequestSSEResult = { cancel: () => void };

export type RequestSSEOptions = {
  url: string;
  method?: 'GET'|'POST';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
  openTimeoutMs?: number;
  retry?: Partial<RetryPolicy>;

  onEvent: (evt: { type: 'open'|'message'|'error'|'done'; data?: string; error?: UnifiedError }) => void;

  onConnect?: (info: { status: number; headers: Record<string,string> }) => void;
  onFirstByte?: () => void;
};
