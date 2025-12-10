

export type Mode = "stopwatch" | "countdown";
export type Phase = "idle" | "running" | "paused" | "finished";
export type SegmentKind = "assessment" | "therapy" | "break" | "documentation";
export type ZeroBehavior = "finish" | "pause" | "keep";

export interface Lap { id: string; atMs: number; label?: string; }
export interface Segment { id: string; kind: SegmentKind; startMs: number; endMs?: number; }

export interface TimerState {
  mode: Mode;
  phase: Phase;

  elapsedMs: number;
  countdownInitialMs: number;
  remainingMs: number;

  laps: Lap[];
  segments: Segment[];

  zeroBehavior: ZeroBehavior;
  autoStopAtZero: boolean;

  _idCounter: number;
}

const clampNonNeg = (x: number) => (x < 0 ? 0 : x);

export const progressMs = (s: TimerState): number =>
  s.mode === "stopwatch" ? s.elapsedMs : clampNonNeg(s.countdownInitialMs - s.remainingMs);

export const isZero = (s: TimerState): boolean =>
  s.mode === "countdown" && s.remainingMs <= 0;

const cp = <T>(x: T): T => (Array.isArray(x) ? (x as any).slice() : { ...(x as any) });
const nextId = (s: TimerState, prefix: string): [string, TimerState] => {
  const id = `${prefix}_${s._idCounter}`;
  return [id, { ...s, _idCounter: s._idCounter + 1 }];
};

export interface Init {
  mode?: Mode;
  countdownInitialMs?: number;
  startSegment?: SegmentKind;
  autoStopAtZero?: boolean;
  zeroBehavior?: ZeroBehavior;
}

export function createTimer(init: Init = {}): TimerState {
  const mode = init.mode ?? "stopwatch";
  const initialMs = clampNonNeg(init.countdownInitialMs ?? 0);
  const zb: ZeroBehavior =
    init.zeroBehavior ?? ((init.autoStopAtZero ?? true) ? "finish" : "pause");

  const base: TimerState = {
    mode,
    phase: "idle",
    elapsedMs: 0,
    countdownInitialMs: initialMs,
    remainingMs: initialMs,
    laps: [],
    segments: [],
    zeroBehavior: zb,
    autoStopAtZero: init.autoStopAtZero ?? (zb === "finish"),
    _idCounter: 1,
  };
  if (init.startSegment) {
    const [id, s2] = nextId(base, "seg");
    s2.segments = [{ id, kind: init.startSegment, startMs: 0 }];
    return s2;
  }
  return base;
}


export function start(s: TimerState): TimerState {
  if (s.phase === "running") return s;
  if (s.mode === "countdown" && s.remainingMs <= 0) {
    if (s.zeroBehavior === "finish") return { ...s, phase: "finished" };
    if (s.zeroBehavior === "pause") return { ...s, phase: "paused" };
    return { ...s, phase: "running" };
  }
  return { ...s, phase: "running" };
}
export function pause(s: TimerState): TimerState {
  if (s.phase !== "running") return s;
  return { ...s, phase: "paused" };
}
export function reset(s: TimerState): TimerState {
  return {
    ...s,
    phase: "idle",
    elapsedMs: 0,
    remainingMs: s.countdownInitialMs,
    laps: [],
    segments: [],
  };
}

export function setMode(s: TimerState, mode: Mode, countdownInitialMs?: number): TimerState {
  if (mode === s.mode) {
    if (mode === "countdown" && typeof countdownInitialMs === "number") {
      const m = clampNonNeg(countdownInitialMs);
      return { ...s, countdownInitialMs: m, remainingMs: m, phase: "idle" };
    }
    return s;
  }
  if (mode === "stopwatch") {
    return {
      ...s,
      mode: "stopwatch",
      phase: "idle",
      elapsedMs: 0,
      laps: [],
      segments: [],
    };
  }
  const initMs = clampNonNeg(countdownInitialMs ?? 0);
  return {
    ...s,
    mode: "countdown",
    phase: "idle",
    countdownInitialMs: initMs,
    remainingMs: initMs,
    laps: [],
    segments: [],
  };
}

export function setCountdown(s: TimerState, ms: number): TimerState {
  const m = clampNonNeg(ms);
  return {
    ...s,
    mode: "countdown",
    countdownInitialMs: m,
    remainingMs: m,
    phase: "idle",
    laps: [],
    segments: [],
  };
}

export function setZeroBehavior(s: TimerState, zb: ZeroBehavior): TimerState {
  return { ...s, zeroBehavior: zb, autoStopAtZero: zb === "finish" };
}

export function tick(s: TimerState, deltaMs: number): TimerState {
  if (deltaMs <= 0 || s.phase !== "running") return s;

  if (s.mode === "stopwatch") {
    return { ...s, elapsedMs: s.elapsedMs + deltaMs };
  }

  const remainingMs = clampNonNeg(s.remainingMs - deltaMs);
  if (remainingMs === 0) {
    if (s.zeroBehavior === "finish") return { ...s, remainingMs, phase: "finished" };
    if (s.zeroBehavior === "pause") return { ...s, remainingMs, phase: "paused" };
    return { ...s, remainingMs };
  }
  return { ...s, remainingMs };
}


export function addLap(s: TimerState, label?: string): TimerState {
  const at = progressMs(s);
  const [id, s2] = nextId(s, "lap");
  const laps = cp(s2.laps);
  const lap: Lap = label !== undefined ? { id, atMs: at, label } : { id, atMs: at };
  laps.push(lap);
  return { ...s2, laps };
}


export function startSegment(s: TimerState, kind: SegmentKind): TimerState {
  const now = progressMs(s);
  const segs = cp(s.segments) as Segment[];
  if (segs.length > 0 && segs[segs.length - 1].endMs === undefined) {
    segs[segs.length - 1] = { ...segs[segs.length - 1], endMs: now };
  }
  const [id, s2] = nextId(s, "seg");
  segs.push({ id, kind, startMs: now });
  return { ...s2, segments: segs };
}
export function endCurrentSegment(s: TimerState): TimerState {
  const now = progressMs(s);
  const segs = cp(s.segments) as Segment[];
  if (segs.length === 0) return s;
  const last = segs[segs.length - 1];
  if (last.endMs !== undefined) return s;
  segs[segs.length - 1] = { ...last, endMs: now };
  return { ...s, segments: segs };
}


export function totalDurationMs(s: TimerState): number {
  return s.mode === "stopwatch" ? s.elapsedMs : s.countdownInitialMs;
}
export function remainingMsSelector(s: TimerState): number {
  return s.mode === "stopwatch" ? 0 : s.remainingMs;
}
export interface SegmentTotals { assessment: number; therapy: number; break: number; documentation: number; }
export function segmentTotals(s: TimerState): SegmentTotals {
  const totals: SegmentTotals = { assessment: 0, therapy: 0, break: 0, documentation: 0 };
  const now = progressMs(s);
  for (const seg of s.segments) {
    const end = seg.endMs ?? now;
    const dur = Math.max(0, end - seg.startMs);
    totals[seg.kind] += dur;
  }
  return totals;
}


export interface TimerSnapshot {
  v: 2;
  mode: Mode;
  phase: Phase;
  elapsedMs: number;
  countdownInitialMs: number;
  remainingMs: number;
  laps: Lap[];
  segments: Segment[];
  zeroBehavior: ZeroBehavior;
  autoStopAtZero: boolean;
  _idCounter: number;
}
export function snapshot(s: TimerState): TimerSnapshot {
  return {
    v: 2,
    mode: s.mode,
    phase: s.phase,
    elapsedMs: s.elapsedMs,
    countdownInitialMs: s.countdownInitialMs,
    remainingMs: s.remainingMs,
    laps: s.laps.slice(),
    segments: s.segments.slice(),
    zeroBehavior: s.zeroBehavior,
    autoStopAtZero: s.autoStopAtZero,
    _idCounter: s._idCounter,
  };
}
export function fromSnapshot(ss: any): TimerState {
  const zb: ZeroBehavior = ss.zeroBehavior ?? ((ss.autoStopAtZero ?? true) ? "finish" : "pause");
  return {
    mode: ss.mode,
    phase: ss.phase,
    elapsedMs: ss.elapsedMs,
    countdownInitialMs: ss.countdownInitialMs,
    remainingMs: ss.remainingMs,
    laps: (ss.laps ?? []).slice(),
    segments: (ss.segments ?? []).slice(),
    zeroBehavior: zb,
    autoStopAtZero: ss.autoStopAtZero ?? (zb === "finish"),
    _idCounter: ss._idCounter ?? 1,
  };
}


export function fmtHMS(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
