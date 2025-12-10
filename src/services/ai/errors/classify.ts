export type AiErrorCause =
  | 'auth'
  | 'model_not_found'
  | 'rate_limit'
  | 'invalid_request'
  | 'network'
  | 'timeout'
  | 'server'
  | 'aborted'
  | 'unknown';

interface RawErr {
  code?: string;
  status?: number;
  detail?: string;
  userMessage?: string;
}

const HAS = (s: string | undefined, ...subs: string[]) => !!s && subs.some(x => s.toLowerCase().includes(x));

export function classifyAiError(e: RawErr): AiErrorCause {
  const status = e.status;
  const code = (e.code || '').toLowerCase();
  const detail = e.detail || e.userMessage || '';
  if (code === 'aborted' || code === 'cancelled') return 'aborted';
  if (code === 'timeout') return 'timeout';
  if (code === 'network' && status == null) return 'network';
  if (status === 401 || status === 403 || code === 'auth' || code === 'permission') return 'auth';
  if (status === 404 || HAS(detail, 'model_not_found', 'model not found', 'unknown model')) return 'model_not_found';
  if (status === 429 || code === 'rate_limit' || HAS(detail, 'rate limit')) return 'rate_limit';

  if (HAS(detail, 'quota', 'insufficient_quota', 'exceeded quota')) return 'invalid_request';
  if (status && status >= 500 || code === 'http_5xx' || code === 'server') return 'server';
  if (status && status >= 400) return 'invalid_request';
  return 'unknown';
}

export function friendlyMessage(cause: AiErrorCause): string {
  switch (cause) {
    case 'auth': return 'API key invalid or missing. Update your provider key.';
    case 'model_not_found': return 'Model not found or not enabled for your key.';
    case 'rate_limit': return 'Rate limit hit. Please wait briefly and retry.';
    case 'invalid_request': return 'Invalid request parameters. Check model and generation settings.';
    case 'network': return 'Network issue reaching the API. Check connection or configure a proxy.';
    case 'timeout': return 'Connection timed out before streaming started.';
    case 'server': return 'Upstream server error. Retry may succeed.';
    case 'aborted': return 'Request was cancelled.';
    default: return 'Unknown error occurred.';
  }
}
