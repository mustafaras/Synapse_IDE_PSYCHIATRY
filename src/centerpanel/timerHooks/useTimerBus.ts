import * as React from 'react';
import { createTimerEventBus } from './eventBus';
import type { TimerEventBus, TimerBusEventType, TimerBusListener } from './types';


export function useTimerBus(): TimerEventBus {
  const ref = React.useRef<TimerEventBus | null>(null);
  if (!ref.current) ref.current = createTimerEventBus();
  return ref.current;
}

export function useTimerBusSubscription<T extends TimerBusEventType>(bus: TimerEventBus, type: T, fn: TimerBusListener<T>) {
  React.useEffect(() => bus.subscribe(type, fn), [bus, type, fn]);
}
