export function toUserFacing(e: { source: string; code?: string; message?: string; provider?: string; model?: string }): { kind: 'error'|'warning'|'info', userMessage: string, contextKey: string } {
  const code = e.code || 'unknown';
  const baseKey = `err:${e.source}:${code}:${e.provider || 'na'}:${e.model || 'na'}`;

  switch (code) {
    case 'timeout':
      return { kind: 'error', userMessage: 'Request timed out. Please try again.', contextKey: baseKey };
    case 'network':
      return { kind: 'error', userMessage: 'Network error. Check your connection.', contextKey: baseKey };
    case 'http_4xx':
      return { kind: 'error', userMessage: 'Request failed. Check settings and try again.', contextKey: baseKey };
    case 'http_5xx':
      return { kind: 'error', userMessage: 'Server is unavailable. Please try again.', contextKey: baseKey };
    case 'aborted':
      return { kind: 'info', userMessage: 'Generation cancelled.', contextKey: baseKey };
    case 'parse':
      return { kind: 'error', userMessage: 'Response parsing failed.', contextKey: baseKey };
    default: {

      const raw = e.message?.trim?.() || '';
      const fallback = raw && raw.length <= 140 ? raw : 'Something went wrong.';
      return { kind: 'error', userMessage: fallback, contextKey: baseKey };
    }
  }
}
