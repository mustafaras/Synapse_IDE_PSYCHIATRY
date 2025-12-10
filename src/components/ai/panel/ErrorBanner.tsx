import { ErrorActions, ErrorBannerRoot, ErrorIcon, ErrorText, MiniButton } from './styles';

export type ErrorInfo = { code?: string; status?: number; userMessage?: string; detail?: string; retryAfterMs?: number | null; friendly?: string; cause?: string };

export function ErrorBanner({ err, onRetry, onOpenKeys }: { err: ErrorInfo; onRetry?: () => void; onOpenKeys?: () => void }) {
  const status = err.status;

  const code = (() => {
    const c: unknown = err.code;
    if (!c) return '';
    if (typeof c === 'string') return c.toLowerCase();
    if (typeof c === 'number') return String(c);
    if (typeof c === 'object') {
      try {


        const inner = (c as any).code || (c as any).name || (c as any).type;
        if (typeof inner === 'string') return inner.toLowerCase();
      } catch {

      }
      try {
        return JSON.stringify(c).toLowerCase();
      } catch {
        return '';
      }
    }
    return String(c).toLowerCase();
  })();
  let text = err.friendly || err.userMessage || 'An error occurred.';
  let showRetry = false;
  let showKeys = false;
  if (status === 401 || status === 403 || code === 'auth' || code === 'permission') {
    text = 'API key missing or invalid. Please set your API key.';
    showKeys = true;
  } else if (code === 'rate_limit' || code === 'rate_limit_exceeded' || status === 429) {
    text = 'Rate limit exceeded. Please wait a moment and retry.';
    showRetry = true;
  } else if (code === 'timeout') {
    text = 'Request timed out. Check your connection and try again.';
    showRetry = true;
  } else if (code === 'aborted' || code === 'cancelled') {

  const d = typeof err.detail === 'string' ? err.detail.toLowerCase() : '';
    if (d.includes('open_timeout')) text = 'Connection aborted: server did not start streaming in time.';
    else if (d.includes('user_abort')) text = 'Request cancelled by user.';
    else if (d.includes('idle_timeout')) text = 'Request aborted due to inactivity.';
    else if (d.includes('abort_error')) text = 'Request aborted (abort_error).';
    else if (d.includes('closed_flag')) text = 'Request aborted (closed_flag).';
    else text = 'Request was canceled.';
    if (err.detail) {
      text = `${text} [${err.detail}]`;
    }
  } else if ((status && status >= 500) || code === 'http_5xx' || code === 'server') {
    text = 'Server error. Please retry.';
    showRetry = true;
  } else if (code === 'network') {
    text = 'Network error. Check your connection and retry.';
    showRetry = true;
  } else if (status && status >= 400) {
    text = 'Invalid request. Please review your settings.';
    showKeys = true;
  }

  const handleEditKeys = () => { try { window.dispatchEvent(new Event('ai:openKeys')); } catch {}; onOpenKeys?.(); };
  return (
    <ErrorBannerRoot role="alert" aria-live="assertive" className="ai-error-banner">
      <ErrorIcon aria-hidden>!</ErrorIcon>
      <ErrorText>{text}</ErrorText>
      <ErrorActions>
        {showRetry && (
          <MiniButton aria-label="Retry" onClick={onRetry}>
            Retry
          </MiniButton>
        )}
        {showKeys && (

          <MiniButton aria-label="Edit API keys" onClick={handleEditKeys}>
            Edit Keys
          </MiniButton>
        )}
      </ErrorActions>
    </ErrorBannerRoot>
  );
}

export default ErrorBanner;
