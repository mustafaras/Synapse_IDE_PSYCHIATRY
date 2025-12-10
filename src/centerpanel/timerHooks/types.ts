


export type CoreTimerEventType =
  | 'start'
  | 'pause'
  | 'resume'
  | 'lap'
  | 'reset'
  | 'finish'
  | 'segment_change'
  | 'preset_armed'
  | 'export';

export type QueueHookEventType =
  | 'queue_add'
  | 'queue_start'
  | 'queue_complete'
  | 'queue_skip'
  | 'queue_remove'
  | 'queue_clear'
  | 'queue_toggle'
  | 'queue_reorder';

export type CalendarHookEventType = 'calendar_attach' | 'calendar_detach';

export type MetronomeHookEventType =
  | 'metronome_on'
  | 'metronome_off'
  | 'metronome_tick'
  | 'metronome_bpm_change'
  | 'metronome_subdivision_change'
  | 'metronome_volume_change'
  | 'audio_failed';

export type TimerBusEventType =
  | CoreTimerEventType
  | QueueHookEventType
  | CalendarHookEventType
  | MetronomeHookEventType
  | 'hook_error';


export interface TimerBusPayloadMap {
  start: { mode: 'countdown' | 'stopwatch' };
  pause: { elapsed_ms: number };
  resume: { elapsed_ms: number };
  lap: { lap_index: number; elapsed_ms: number };
  reset: { prev_phase: string };
  finish: { duration_ms: number };
  segment_change: { segment: string };
  preset_armed: { preset_minutes: number };
  export: { kind: 'json' | 'csv' | 'md' };
  queue_add: { id: string };
  queue_start: { id: string };
  queue_complete: { id: string };
  queue_skip: { id: string };
  queue_remove: { id: string };
  queue_clear: {};
  queue_toggle: { open: boolean };
  queue_reorder: { from: number; to: number };
  calendar_attach: { event_hash: string };
  calendar_detach: {};
  metronome_on: { bpm: number; subdivision: number };
  metronome_off: {};
  metronome_tick: { t: number };
  metronome_bpm_change: { bpm: number };
  metronome_subdivision_change: { subdivision: number };
  metronome_volume_change: { volume: number };
  audio_failed: {};
  hook_error: { hook: string; operation: string; error: string };
}

export type TimerBusListener<T extends TimerBusEventType> = (payload: TimerBusPayloadMap[T]) => void;

export interface TimerEventBus {
  publish<T extends TimerBusEventType>(type: T, payload: TimerBusPayloadMap[T]): void;
  subscribe<T extends TimerBusEventType>(type: T, fn: TimerBusListener<T>): () => void;
}
