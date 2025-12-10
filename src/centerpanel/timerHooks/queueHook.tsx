import * as React from 'react';
import type { TimerEventBus } from './types';
import { makePersist } from './persist';

export type QueuePolicy = 'arm' | 'auto';
export interface QueueItem { id: string; label: string; mode: 'countdown'|'stopwatch'; duration_ms?: number; segment?: string; end_behavior: 'auto-pause'|'keep'|'stop'; policy: QueuePolicy; created_at: string; }

interface QueueState { items: QueueItem[]; active_queue_id?: string | null; }

const persist = makePersist<QueueState>('queue', 1);

function randomId() { try { const a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(16).slice(-4)+a[1].toString(16).slice(-4); } catch { return Math.random().toString(16).slice(2,10); } }


function containsSuspiciousPII(text: string): boolean {
  if (!text) return false;
  const email = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text);
  const phone = /\+?\d{3}[\s-]?\d{3}[\s-]?\d{4}/.test(text);
  const nameLike = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(text);
  return email || phone || nameLike;
}

export function useTimerQueue(bus: TimerEventBus) {
  const [state, setState] = React.useState<QueueState>(() => persist.load({ items: [], active_queue_id: null }));
  const panelOpenRef = React.useRef(false);
  const save = React.useCallback((next: QueueState) => { persist.save(next); }, []);


  const safe = <T,>(operation: string, fn: () => T): T | undefined => {
    try { return fn(); }
    catch (err: any) { try { bus.publish('hook_error', { hook: 'queue', operation, error: String((err as any)?.message || err) } as any); } catch {} return undefined; }
  };

  const add = React.useCallback((item: Omit<QueueItem,'id'|'created_at'>) => {
    safe('add', () => setState(prev => {
      let items = prev.items.slice();
      if (items.length >= 20) items = items.slice(1);
      const id = randomId();
      let label = item.label;

      try {
        if (containsSuspiciousPII(label)) {

          const doRedact = typeof window !== 'undefined' && typeof window.confirm === 'function'
            ? window.confirm('Label appears to contain personal information. Redact before adding to queue?')
            : true;
          if (doRedact) label = '[REDACTED]';
        }
      } catch {}
      const qItem: QueueItem = { ...item, id, created_at: new Date().toISOString(), label };
      const next = { ...prev, items: [...items, qItem] };
      save(next);
      bus.publish('queue_add', { id });
      return next;
    }));
  }, [bus, save]);

  const startNext = React.useCallback(() => {
    safe('startNext', () => setState(prev => {
      if (!prev.items.length) return prev;
      const [head, ...rest] = prev.items;
      const next: QueueState = { ...prev, items: rest, active_queue_id: head.id };
      save(next);
      bus.publish('queue_start', { id: head.id });
      return next;
    }));
  }, [bus, save]);

  const completeActive = React.useCallback(() => {
    safe('completeActive', () => setState(prev => {
      if (!prev.active_queue_id) return prev;
      bus.publish('queue_complete', { id: prev.active_queue_id });
      const next: QueueState = { ...prev, active_queue_id: null };
      save(next);
      return next;
    }));
  }, [bus, save]);

  const skip = React.useCallback(() => {
    safe('skip', () => setState(prev => {
      if (!prev.items.length) return prev;
      const [head, ...rest] = prev.items;
      const nextItems = [...rest, head];
      const next = { ...prev, items: nextItems };
      save(next);
      bus.publish('queue_skip', { id: head.id });
      return next;
    }));
  }, [bus, save]);

  const remove = React.useCallback((id: string) => {
    safe('remove', () => setState(prev => {
      const nextItems = prev.items.filter(i => i.id !== id);
      const next: QueueState = { ...prev, items: nextItems, active_queue_id: (prev.active_queue_id === id ? null : prev.active_queue_id ?? null) };
      save(next);
      bus.publish('queue_remove', { id });
      return next;
    }));
  }, [bus, save]);

  const clear = React.useCallback(() => {
    safe('clear', () => setState(prev => { const next = { ...prev, items: [], active_queue_id: null }; save(next); bus.publish('queue_clear', {}); return next; }));
  }, [bus, save]);


  const reorder = React.useCallback((from: number, to: number) => {
    safe('reorder', () => setState(prev => {
      if (from === to) return prev;
      const items = prev.items.slice();
      if (from < 0 || from >= items.length || to < 0 || to >= items.length) return prev;
      const [m] = items.splice(from, 1);
      items.splice(to, 0, m);
      const next = { ...prev, items };
      save(next);
      return next;
    }));
  }, [save]);

  return { state, add, startNext, completeActive, skip, remove, clear, reorder, panelOpenRef };
}


export const QueuePanel: React.FC<{ hook: ReturnType<typeof useTimerQueue> }> = ({ hook }) => {
  const { state, startNext, skip, remove, clear } = hook;
  return (
    <div style={{ padding: '4px 6px', border: '1px solid var(--tm-border)', borderRadius: 6, fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <strong>Queue</strong>
        <button type="button" onClick={startNext} disabled={!state.items.length} aria-label="Start next queued timer">Start next</button>
        <button type="button" onClick={skip} disabled={!state.items.length}>Skip</button>
        <button type="button" onClick={clear} disabled={!state.items.length}>Clear</button>
      </div>
      <ul role="listbox" aria-label="Queued timers" data-queue-list style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 160, overflowY: 'auto' }}>
        {state.items.map((it, idx) => (
          <li key={it.id} role="option" aria-selected={state.active_queue_id === it.id} tabIndex={0} data-queue-id={it.id} data-queue-index={idx}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 4px', border: '1px solid var(--tm-border)', borderRadius: 4, marginBottom: 4 }}>
            <span>{it.label} • {it.mode === 'countdown' ? Math.round((it.duration_ms||0)/60000)+"m" : 'stopwatch'}{it.segment?` • ${it.segment}`:''}</span>
            <button type="button" onClick={()=>remove(it.id)} aria-label="Remove queued item">×</button>
          </li>
        ))}
        {!state.items.length && <li style={{ opacity: 0.6 }}>Queue empty</li>}
      </ul>
    </div>
  );
};
