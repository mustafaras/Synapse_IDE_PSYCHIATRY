import type { UnifiedError } from './http.types';

export function isAbortError(e: unknown): boolean {

  return (
    (e instanceof DOMException && e.name === 'AbortError') ||
  (typeof e === 'object' && e !== null && 'name' in e && (e as { name?: string }).name === 'AbortError')
  );
}

export function toUnifiedError(e: unknown, ctx?: { status?: number; providerCode?: string | undefined }): UnifiedError {
  if (isAbortError(e)) {
    return { code: 'aborted', retriable: false, userMessage: 'Request was canceled', detail: String(e), category: 'client' } as UnifiedError;
  }
  if (typeof ctx?.status === 'number') {
    const status = ctx.status;
    if (status >= 500) {
      return { code: 'http_5xx', status, retriable: true, userMessage: 'Server error. Please retry.', detail: String(e), category: 'server', providerCode: ctx.providerCode } as UnifiedError;
    }
    if (status >= 400) {

      const pc = ctx.providerCode;

      if (pc === 'insufficient_quota' || pc === 'quota_exceeded' || pc === 'billing_hard_limit') {
        return { code: 'http_4xx', status, retriable: false, userMessage: 'Request cannot be completed. Check account usage or settings.', detail: String(e), providerCode: pc, category: 'client' } as UnifiedError;
      }
      if (status === 429) {
        if (pc === 'rate_limit_exceeded' || pc === 'requests_limit_exceeded' || pc === 'overloaded') {
          return { code: 'http_4xx', status, retriable: true, userMessage: 'Rate limited: too many requests. Retrying may succeed shortly.', detail: String(e), providerCode: pc, category: 'rate_limit' } as UnifiedError;
        }
        return { code: 'http_4xx', status, retriable: true, userMessage: 'Temporarily rate limited.', detail: String(e), providerCode: pc, category: 'rate_limit' } as UnifiedError;
      }
      if (status === 401 || status === 403) {
        return { code: 'http_4xx', status, retriable: false, userMessage: 'Authentication error. Check or update your API key.', detail: String(e), providerCode: pc, category: 'auth' } as UnifiedError;
      }
      return { code: 'http_4xx', status, retriable: false, userMessage: 'Request error. Check your settings.', detail: String(e), providerCode: pc, category: 'client' } as UnifiedError;
    }
  }

  if (typeof e === 'object' && e && (e as { __timeout?: boolean }).__timeout === true) {
    return { code: 'timeout', retriable: true, userMessage: 'Request timed out. Trying again may help.', category: 'timeout' } as UnifiedError;
  }

  return { code: 'network', retriable: true, userMessage: 'Network error. Please check connection and retry.', detail: String(e), category: 'network', providerCode: ctx?.providerCode } as UnifiedError;
}
