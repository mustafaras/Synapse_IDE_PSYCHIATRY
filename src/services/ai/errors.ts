export type UiError = { code: string; http?: number; provider?: string; message: string };

export function mapHttpError(status?: number): UiError {
  if (!status) return { code: 'NETWORK', message: 'Network connection failed.' };
  if (status === 401 || status === 403) return { code: 'AUTH', http: status, message: 'Authorization failed. Check your API key.' };
  if (status === 404) return { code: 'ENDPOINT', http: status, message: 'Endpoint not found or invalid.' };
  if (status === 408 || status === 504) return { code: 'TIMEOUT', http: status, message: 'Request timed out. Please try again.' };
  if (status === 429) return { code: 'RATE', http: status, message: 'Rate limit exceeded. Please try again soon.' };
  if (status >= 500) return { code: 'SERVER', http: status, message: 'Server error. Please try again later.' };
  return { code: 'UNKNOWN', http: status, message: `Unhandled error (HTTP ${status}).` };
}
