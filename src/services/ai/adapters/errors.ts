import type { ProviderKey, UnifiedError, UnifiedErrorCode } from './types';
import type { UnifiedError as HttpUnifiedError } from '../http.types';

export function makeError(message: string, code: UnifiedErrorCode, provider?: ProviderKey, status?: number, raw?: unknown): UnifiedError {
  const err = new Error(message) as UnifiedError;
  err.code = code;
  if (provider) err.provider = provider;
  if (typeof status === 'number') err.status = status;

  if (raw !== undefined) (err as any).raw = raw;
  return err;
}

export async function errorFromResponse(resp: Response, provider: ProviderKey, context?: string): Promise<UnifiedError> {
  let details = '';
  try {
    const t = await resp.text();
    if (t) details = t;
  } catch {}
  const status = resp.status;
  const code: UnifiedErrorCode =
    status === 401 ? 'auth' :
    status === 403 ? 'permission' :
    status === 404 ? 'invalid_request' :
    status === 408 ? 'timeout' :
    status === 409 ? 'invalid_request' :
    status === 422 ? 'invalid_request' :
    status === 429 ? 'rate_limit' :
    status >= 500 ? 'server' : 'unknown';
  const msg = `${provider} API error${context ? ` (${context})` : ''}: ${status}${details ? ` - ${details}` : ''}`;
  return makeError(msg, code, provider, status, details);
}

export function errorFromException(e: unknown, provider: ProviderKey): UnifiedError {
  const isAbort = typeof e === 'object' && e !== null && (e as { name?: string }).name === 'AbortError';
  if (isAbort) return makeError('Request cancelled', 'cancelled', provider);
  const msg = e instanceof Error ? e.message : String(e);
  return makeError(msg || 'Unknown error', 'unknown', provider, undefined, e);
}

export function fromHttpError(err: HttpUnifiedError, provider: ProviderKey): UnifiedError {
  const map: Record<HttpUnifiedError['code'], UnifiedErrorCode> = {
    network: 'unknown',
    timeout: 'timeout',
    aborted: 'cancelled',
    http_4xx: 'invalid_request',
    http_5xx: 'server',
    parse: 'server',
    unknown: 'unknown',
  };


  const code = map[err.code] ?? 'unknown';
  const msg = err.userMessage || 'Request failed';
  const out = makeError(msg, code, provider, err.status, err);

  type CategoryUnion = NonNullable<HttpUnifiedError['category']>;
  interface WithMeta extends HttpUnifiedError { providerCode?: string; category?: CategoryUnion; detail?: string }
  const meta = err as WithMeta;
  if (meta.providerCode) (out as UnifiedError & { providerCode?: string }).providerCode = meta.providerCode;
  if (meta.category) (out as UnifiedError & { category?: CategoryUnion }).category = meta.category;
  if (meta.detail) (out as UnifiedError & { detail?: string }).detail = meta.detail;

  return out;
}
