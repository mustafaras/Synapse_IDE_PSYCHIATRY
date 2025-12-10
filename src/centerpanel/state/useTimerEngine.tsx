import * as React from "react";
import * as Engine from "../components/timerEngine";
import * as Audit from "./timerAudit";

const STORE_KEY = "therapyTimer@v2";

type Store = {
  t: Engine.TimerState;
  setT: React.Dispatch<React.SetStateAction<Engine.TimerState>>;
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: (label?: string) => void;
  setModeStopwatch: () => void;
  setModeCountdown: (ms?: number) => void;
  setCountdownMinutes: (m: number) => void;
  setZeroBehavior: (zb: Engine.ZeroBehavior) => void;
  listAudits: (limit?: number) => Audit.TimerAuditRecord[];
  clearAudits: () => void;
};

const Ctx = React.createContext<Store | null>(null);
export const useTimerOptional = () => React.useContext(Ctx);
export const useTimer = (): Store => {
  const ctx = React.useContext(Ctx);
  if (ctx) return ctx;

  if (process?.env?.NODE_ENV !== 'production') {
    try { console.warn('[timer] useTimer fallback store engaged — TimerProvider missing'); } catch {}
  }
  const dummy = Engine.createTimer({ mode: 'stopwatch', startSegment: 'therapy', countdownInitialMs: 25*60*1000, zeroBehavior: 'finish' });
  const noop = () => {};
  return {
    t: dummy,
    setT: noop as any,
    start: noop,
    pause: noop,
    reset: noop,
    lap: noop,
    setModeStopwatch: noop,
    setModeCountdown: noop,
    setCountdownMinutes: noop,
    setZeroBehavior: noop,
    listAudits: () => [],
    clearAudits: noop,
  };
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [t, setT] = React.useState<Engine.TimerState>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Engine.fromSnapshot(JSON.parse(raw));
    } catch {}
    return Engine.createTimer({
      mode: "stopwatch",
      startSegment: "therapy",
      countdownInitialMs: 25 * 60 * 1000,
      zeroBehavior: "finish",
    });
  });


  const saveRef = React.useRef<number>(0);
  React.useEffect(() => {
    const now = Date.now();
    if (now - saveRef.current < 250) return;
    saveRef.current = now;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Engine.snapshot(t))); } catch {}
  }, [t]);


  const rafRef = React.useRef<number>(0);
  const lastRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (t.phase !== "running") { lastRef.current = null; return; }
    const loop = (now: number) => {
      if (lastRef.current == null) lastRef.current = now;
      const delta = now - lastRef.current;
      if (delta >= 200) {
        setT((s) => Engine.tick(s, delta));
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [t.phase]);


  const wallStartRef = React.useRef<number | null>(null);
  const prevPhaseRef = React.useRef<Engine.Phase>(t.phase);
  React.useEffect(() => {
    const prev = prevPhaseRef.current;
    const curr = t.phase;
    prevPhaseRef.current = curr;

    if (prev !== "running" && curr === "running") {
      if (wallStartRef.current == null) wallStartRef.current = Date.now();
    }

    const leftRunning = prev === "running" && curr !== "running";
    if (leftRunning) {
      const startedAt = wallStartRef.current ?? Date.now();
      const endedAt = Date.now();
      wallStartRef.current = null;
      const hasProgress = Engine.progressMs(t) > 0;
      if (hasProgress) {
        const rec = Audit.buildFromState(t, startedAt, endedAt);
        Audit.addAudit(rec);
      }
    }
  }, [t.phase, t.mode, t.elapsedMs, t.remainingMs]);


  const prevRemainRef = React.useRef<number>(t.remainingMs);
  React.useEffect(() => {
    if (t.mode !== "countdown") { prevRemainRef.current = t.remainingMs; return; }
    const prev = prevRemainRef.current;
    prevRemainRef.current = t.remainingMs;
    const justHitZero = prev > 0 && t.remainingMs === 0;
    if (justHitZero) {
      let muted = false;
      try { muted = localStorage.getItem("timerMute") === "1"; } catch {}
      if (!muted) beep();
    }
  }, [t.mode, t.remainingMs]);


  const start = () => setT((s) => Engine.start(s));
  const pause = () => setT((s) => Engine.pause(s));
  const reset = () => setT((s) => Engine.reset(s));
  const lap = (label?: string) => setT((s) => Engine.addLap(s, label));
  const setModeStopwatch = () => setT((s) => Engine.setMode(s, "stopwatch"));
  const setModeCountdown = (ms?: number) =>
    setT((s) => Engine.setMode(s, "countdown", ms ?? (s.countdownInitialMs || 25 * 60 * 1000)));
  const setCountdownMinutes = (m: number) => setT((s) => Engine.setCountdown(s, Math.max(0, m) * 60 * 1000));
  const setZeroBehavior = (zb: Engine.ZeroBehavior) => setT((s) => Engine.setZeroBehavior(s, zb));

  const listAudits = (limit?: number) => Audit.listAudits(limit);
  const clearAudits = () => Audit.clearAudits();

  const value: Store = {
    t, setT,
    start, pause, reset, lap,
    setModeStopwatch, setModeCountdown, setCountdownMinutes, setZeroBehavior,
    listAudits, clearAudits,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};


function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const actx = new Ctx();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    const now = actx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain).connect(actx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
}
