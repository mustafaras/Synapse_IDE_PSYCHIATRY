import React from 'react';
import { flags } from '@/config/flags';
import { logger } from '@/lib/logger';
import { reportError } from '@/lib/error-bus';

export class AppErrorBoundary extends React.Component<React.PropsWithChildren> {
  override state = { hasError: false } as { hasError: boolean };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, info: any) {
    if (flags.aiTrace) {
      logger.error('[ERROR_BOUNDARY]', String(error?.message || error), 'info=', String(info?.componentStack || ''));
    }
    try { reportError({ source: 'ui', code: 'unknown', message: String(error?.message || error) }); } catch {}
  }

  override render() {
    return this.props.children as React.ReactNode;
  }
}

export function installGlobalRejectionHandler() {
  if (!('window' in globalThis)) return;
  const startedAt = Date.now();
  const QUIET_MS = 1500;
  const shouldIgnore = (raw: unknown) => {
    const msg = String((raw as any)?.message || raw || '').toLowerCase();
    if (!msg) return true;

    if (msg.includes('resizeobserver')) return true;
    if (msg.includes('resizeobserver loop')) return true;
    if (msg.includes('non-error promise rejection')) return true;
    if (msg.includes('aborterror')) return true;
    if (msg.includes('networkerror') && msg.includes('fetch')) return true;
    if (msg.includes('script error')) return true;
    return false;
  };
  window.addEventListener('unhandledrejection', (e) => {
  const reason = (e as any)?.reason;
  if (flags.aiTrace) logger.error('[UNHANDLED_REJECTION]', String(reason?.message || reason || e));
  if (Date.now() - startedAt < QUIET_MS) return;
  if (shouldIgnore(reason)) return;
  try { reportError({ source: 'ui', code: 'unknown', message: String(reason?.message || reason || 'Unhandled rejection') }); } catch {}
  });
  window.addEventListener('error', (e: ErrorEvent) => {
  if (flags.aiTrace) logger.error('[WINDOW_ERROR]', String(e?.message || e));
  if (Date.now() - startedAt < QUIET_MS) return;
  if (shouldIgnore(e?.message)) return;
  try { reportError({ source: 'ui', code: 'unknown', message: String(e?.message || 'Window error') }); } catch {}
  });
}
