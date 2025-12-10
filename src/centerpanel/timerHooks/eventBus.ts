import type { TimerBusEventType, TimerEventBus, TimerBusListener } from './types';

export function createTimerEventBus(): TimerEventBus {
  const listeners: Map<TimerBusEventType, Set<Function>> = new Map();
  return {
    publish(type, payload) {
      const set = listeners.get(type);
      if (!set || set.size === 0) return;
      for (const fn of Array.from(set)) {
        try { (fn as TimerBusListener<typeof type>)(payload as any); } catch (err) {  }
      }
    },
    subscribe(type, fn) {
      let set = listeners.get(type);
      if (!set) { set = new Set(); listeners.set(type, set); }
      set.add(fn as any);
      return () => { set?.delete(fn as any); };
    }
  };
}
