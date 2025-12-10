import { flags } from '@/config/flags';
import { logger } from '@/lib/logger';
import { showToast } from '@/ui/toast/api';
import { toUserFacing } from './error-map';

export type ErrorSource = 'http'|'adapter'|'fsm'|'ui'|'unknown';

export type ReportErrorInput = {
  source: ErrorSource;
  code?: string;
  status?: number;
  message?: string;
  provider?: string;
  model?: string;
  detail?: string;
};

const lastShownAt = new Map<string, number>();
const DEDUPE_MS = 2000;

function dedupe(key: string) {
  const now = Date.now();
  const last = lastShownAt.get(key) || 0;
  if (now - last < DEDUPE_MS) return true;
  lastShownAt.set(key, now);
  return false;
}

export function reportError(e: ReportErrorInput) {
  const { kind, userMessage, contextKey } = toUserFacing(e);
  if (flags.aiTrace) {
    logger.error('[ERROR]', 'src=', e.source, 'code=', e.code || '—', 'status=', String(e.status ?? '—'), 'provider=', e.provider || '—', 'model=', e.model || '—', 'msg=', e.message || userMessage || '—');
  }
  if (!dedupe(contextKey)) {
    showToast({ kind, message: userMessage, contextKey });
  }

  emit(e);
}

type Listener = (e: ReportErrorInput) => void;
const listeners = new Set<Listener>();
function emit(e: ReportErrorInput) { for (const l of listeners) { try { l(e); } catch {} } }
export function onError(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function emitError(e: ReportErrorInput) { emit(e); reportError(e); }
