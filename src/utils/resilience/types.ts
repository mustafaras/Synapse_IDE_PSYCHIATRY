export type RetryKind = 'chat' | 'settings' | 'upload' | 'generic';


export interface RequestEnvelope<T = any> {
  id: string;
  kind: RetryKind;
  url: string;
  method: 'GET'|'POST'|'PUT'|'DELETE';
  headers?: Record<string,string>;
  body?: T;
  timeoutMs?: number;
  fingerprint: string;
  createdAt: number;
}

export interface OutboxItem {
  env: RequestEnvelope;
  attempt: number;
  nextAt: number;
  status: 'queued'|'running'|'paused'|'done'|'failed';
  lastError?: string;
}
