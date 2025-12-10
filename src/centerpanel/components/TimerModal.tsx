import * as React from "react";
import { createPortal } from "react-dom";
import styles from "../styles/timer.module.css";
import panelStyles from "../../components/timer/panel-unified.module.css";
// Icon set (react-icons) for redesigned hero controls
import { FaFlag, FaMicrophone, FaPause, FaPlay, FaRedoAlt, FaUserMd } from 'react-icons/fa';
import { FiClock, FiDownload, FiFileText, FiPrinter, FiTable, FiZap, FiSettings, FiEdit, FiTrash2, FiArrowRight, FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiCode, FiMinus } from 'react-icons/fi';
import { IoMdClose, IoMdVolumeHigh, IoMdVolumeOff } from 'react-icons/io';
import { MdBolt, MdContrast, MdFilterBAndW, MdNoteAlt, MdUndo } from 'react-icons/md';
import { BiText } from 'react-icons/bi';
import { BsActivity } from 'react-icons/bs';
import html2pdf from 'html2pdf.js';
import { HiDocumentText } from 'react-icons/hi';
import * as Engine from "./timerEngine";
import { useTimer } from "../state/useTimerEngine.tsx";
// Registry (patient + encounter wiring)
import { useRegistry, useRegistryOptional } from "../registry/state";
import * as Audit from "../state/timerAudit";
import { downloadText, openPrintWindow } from "../lib/download";
// P15 hooks
import { useTimerBus, useTimerBusSubscription } from "../timerHooks/useTimerBus";
import { QueuePanel, useTimerQueue } from "../timerHooks/queueHook";
import { attachFromICS, type CalendarLink, detachCalendar, loadCalendar } from "../timerHooks/calendar";
import { Metronome, type MetronomeState } from "../timerHooks/metronome";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { ParticleRing } from "./ParticleRing";
// Phase 1.2: Voice features
import { VoiceRecorder } from "../../components/timer/VoiceRecorder";
import { useVoiceCommands } from "../../hooks/useVoiceCommands";

// Phase 2.1: Advanced Analytics Dashboard
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { AnalyticsDashboard } from "../../components/timer/AnalyticsDashboard";

// Phase 2.1: AI-Powered Session Prediction
import { useSessionML } from "../timerHooks/useSessionML";
import { MLInsightsPanel } from "./MLInsightsPanel";
import { SmartNoteTemplates } from "../../components/timer/SmartNoteTemplates";

// Phase 2.2: Real-Time Coaching
import { RealTimeCoaching } from "../../components/timer/RealTimeCoaching";

// Phase 2.3: Collaboration Features
import { CollaborationPanel } from "../../components/timer/CollaborationPanelPro";


/**
 * Phase 1: Time-of-day aware theming hook
 * Returns CSS class names for dynamic theming based on current hour and session metrics
 */
function useTimeOfDayTheme(isRunning: boolean, lapCount: number) {
  // Determine time-of-day theme class
  const timeOfDayClass = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return styles.theme_morning;
    if (hour >= 12 && hour < 17) return styles.theme_afternoon;
    if (hour >= 17 && hour < 21) return styles.theme_evening;
    return styles.theme_night;
  }, []); // Update hourly (simplified for now - could use interval)

  // Calculate intensity based on session metrics
  const intensityClass = React.useMemo(() => {
    if (!isRunning) return styles.intensity_low;
    // High intensity if many laps (active session)
    if (lapCount > 5) return styles.intensity_high;
    // Medium intensity for active sessions with some laps
    if (lapCount > 0) return styles.intensity_medium;
    return styles.intensity_low;
  }, [isRunning, lapCount]);

  return { timeOfDayClass, intensityClass };
}

/**
 * Phase 1: Gesture Control System
 * Detects swipe gestures and provides haptic feedback
 */
/**
 * Phase 1.2: Gesture Control - Swipe Gestures for Timer Control
 * DESKTOP + TOUCH OPTIMIZED: Mouse drag and touch swipe support
 * 
 * Swipe Gestures:
 * - Swipe Left: (Reserved for future segment cycling)
 * - Swipe Right: (Reserved for future segment cycling)
 * - Swipe Up: Resume timer (if paused)
 * - Swipe Down: Pause timer (if running)
 * 
 * Desktop support: Drag with mouse to simulate swipe gestures
 */
function useGestureControl(
  elementRef: React.RefObject<HTMLElement>,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  enabled: boolean = true
) {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [mouseStart, setMouseStart] = React.useState<{ x: number; y: number } | null>(null);
  const [mouseEnd, setMouseEnd] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Haptic feedback helper
  const hapticFeedback = React.useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const pattern = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(pattern[intensity]);
    }
  }, []);

  // Touch handlers
  const onTouchStart = React.useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, [enabled]);

  const onTouchMove = React.useCallback((e: TouchEvent) => {
    if (!enabled) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, [enabled]);

  const onTouchEnd = React.useCallback(() => {
    if (!enabled || !touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      // Horizontal swipes
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0 && onSwipeLeft) {
          hapticFeedback('medium');
          onSwipeLeft();
        } else if (distanceX < 0 && onSwipeRight) {
          hapticFeedback('medium');
          onSwipeRight();
        }
      }
    } else {
      // Vertical swipes
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0 && onSwipeUp) {
          hapticFeedback('light');
          onSwipeUp();
        } else if (distanceY < 0 && onSwipeDown) {
          hapticFeedback('light');
          onSwipeDown();
        }
      }
    }
  }, [enabled, touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, hapticFeedback]);

  // Mouse handlers for DESKTOP support
  const onMouseDown = React.useCallback((e: MouseEvent) => {
    if (!enabled) return;
    setIsDragging(true);
    setMouseEnd(null);
    setMouseStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [enabled]);

  const onMouseMove = React.useCallback((e: MouseEvent) => {
    if (!enabled || !isDragging) return;
    setMouseEnd({
      x: e.clientX,
      y: e.clientY
    });
  }, [enabled, isDragging]);

  const onMouseUp = React.useCallback(() => {
    if (!enabled || !isDragging || !mouseStart || !mouseEnd) {
      setIsDragging(false);
      return;
    }

    const distanceX = mouseStart.x - mouseEnd.x;
    const distanceY = mouseStart.y - mouseEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      // Horizontal swipes
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (distanceX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    } else {
      // Vertical swipes
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0 && onSwipeUp) {
          onSwipeUp();
        } else if (distanceY < 0 && onSwipeDown) {
          onSwipeDown();
        }
      }
    }

    setIsDragging(false);
    setMouseStart(null);
    setMouseEnd(null);
  }, [enabled, isDragging, mouseStart, mouseEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return undefined;

    // Touch events
    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: true });
    element.addEventListener('touchend', onTouchEnd);

    // Mouse events for DESKTOP
    element.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove); // Global to track outside element
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [elementRef, enabled, onTouchStart, onTouchMove, onTouchEnd, onMouseDown, onMouseMove, onMouseUp]);

  return { hapticFeedback, isDragging };
}

/**
 * Phase 1: Holographic Time Display - 3D Parallax Effect Hook
 * DESKTOP OPTIMIZED: Mouse-based parallax for depth perception
 * 
 * Tracks mouse position over element and returns transform values
 * for creating holographic 3D depth effect on timer display.
 * 
 * @param elementRef - Reference to the element to track mouse over
 * @param intensity - Parallax intensity (0-1, default 0.15)
 * @returns Transform styles for 3D depth effect
 */
function useParallaxEffect(
  elementRef: React.RefObject<HTMLElement | null>,
  intensity = 0.15
) {
  const [transform, setTransform] = React.useState({ x: 0, y: 0, z: 0 });
  const animationRef = React.useRef<number | null>(null);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse offset from center (-1 to 1)
      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);
      
      // Apply intensity and smooth the values
      const x = offsetX * intensity * 20; // Max 3deg tilt
      const y = -offsetY * intensity * 20; // Invert Y for natural feel
      const z = Math.abs(offsetX + offsetY) * intensity * 10; // Subtle z-depth
      
      // Use requestAnimationFrame for smooth updates
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(() => {
        setTransform({ x, y, z });
      });
    },
    [elementRef, intensity]
  );

  const handleMouseLeave = React.useCallback(() => {
    // Smoothly return to neutral position
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      setTransform({ x: 0, y: 0, z: 0 });
    });
  }, []);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [elementRef, handleMouseMove, handleMouseLeave]);

  // Generate CSS transform string
  const transformStyle = React.useMemo(
    () => ({
      transform: `perspective(1000px) rotateX(${transform.y}deg) rotateY(${transform.x}deg) translateZ(${transform.z}px)`,
      transition: 'transform 0.1s ease-out',
    }),
    [transform]
  );

  return { transformStyle, transform };
}

/**
 * Visual skin selector for TimerModal. P0 introduces a no-op 'np' skin hook only.
 * Future phases (P1+) will scope New Patient visuals under [data-skin="np"].
 */
export type TimerModalSkin = 'default' | 'np';

export type TimerModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** skin='np' enables New Patient–style skin rules scoped under [data-skin="np"].
   *  P0: no visual change. P1..Pn will define actual CSS under this attribute. */
  skin?: TimerModalSkin;
};

export const TimerModal: React.FC<TimerModalProps> = ({ open, onClose, title = "Therapy Timer", skin = 'default' }) => {
  // Closing animation state
  const [isClosing, setIsClosing] = React.useState(false);

  // Pastel accent palette for card left borders and titles
  const pastel = React.useMemo(
    () => [
      '#ffd166', // warm amber
      '#06d6a0', // mint
      '#a8dadc', // light aqua
      '#f4a261', // soft orange
      '#e9c46a', // sand
      '#bde0fe', // baby blue
      '#cdb4db', // lavender
      '#ffcad4', // blush
      '#9bf6ff', // cyan pastel
      '#b2f7ef', // seafoam
    ],
    []
  );
  const palette = React.useMemo(() => {
    // simple deterministic shuffle based on session start time for variety
    const seed = (Date.now() >> 4) % 9973;
    const arr = pastel.slice();
    for (let i = arr.length - 1, s = seed; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }, [pastel]);
  // P15: modal-scoped event bus
  const bus = useTimerBus();
  // Queue hook (must be called unconditionally at top level)
  const queue = useTimerQueue(bus);
  const [queueOpen, setQueueOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  // Mirror UI state into hook ref without depending on effect ordering
  try { if (queue) queue.panelOpenRef.current = queueOpen; } catch {}
  // Calendar link state
  const [calendarLink, setCalendarLink] = React.useState<CalendarLink | null>(() => { try { return loadCalendar(); } catch { return null; } });
  // Calendar attach inputs must be declared at top-level (no hooks in conditionals)
  const [icsText, setIcsText] = React.useState('');
  const [icsError, setIcsError] = React.useState<string | null>(null);
  const [calendarCode, setCalendarCode] = React.useState('');
  // Metronome state + instance
  const [metState, setMetState] = React.useState<MetronomeState>(() => {
    try { const raw = localStorage.getItem('timerMetronome'); if (raw) return JSON.parse(raw); } catch {}
    return { on: false, bpm: 60, subdivision: 1, volume: 0.6 };
  });
  
  React.useEffect(() => { try { localStorage.setItem('timerMetronome', JSON.stringify(metState)); } catch {} }, [metState]);
  // Keep a live ref for metronome scheduler to read the latest state (avoid stale closure)
  const metStateRef = React.useRef(metState);
  React.useEffect(() => { metStateRef.current = metState; }, [metState]);
  // Per-segment metronome persistence
  type SegMet = { bpm: number; subdivision: 1|2|4; volume: number };
  const segMapKey = 'timerMetronome.segmentMap';
  const [metSegMap, setMetSegMap] = React.useState<Record<string, SegMet>>(() => {
    try { const raw = localStorage.getItem(segMapKey); if (raw) return JSON.parse(raw); } catch {}
    return {};
  });
  React.useEffect(() => { try { localStorage.setItem(segMapKey, JSON.stringify(metSegMap)); } catch {} }, [metSegMap]);
  const saveSegmentMetronome = React.useCallback((seg: string | undefined, st: MetronomeState) => {
    if (!seg) return; setMetSegMap(prev => ({ ...prev, [seg]: { bpm: st.bpm, subdivision: st.subdivision as 1|2|4, volume: st.volume } }));
  }, []);
  // Reduced motion preference (must be before any conditional returns)
  const reducedMotion = usePrefersReducedMotion();
  const metroRef = React.useRef<Metronome | null>(null);
  const ensureMet = React.useCallback(() => {
    if (!metroRef.current) {
      const m = new Metronome(() => metStateRef.current);
      // Hook visual pulse to audio scheduler for perfect sync (major + minor)
      m.setOnPulse((major) => {
        // Debug logging removed for production
        if (major) {
          setBeatFlash(true);
          const clearMs = reducedMotion ? 60 : 140;
          window.setTimeout(() => setBeatFlash(false), clearMs);
        } else {
          setBeatSubFlash(true);
          const clearMs = reducedMotion ? 40 : 90;
          window.setTimeout(() => setBeatSubFlash(false), clearMs);
        }
        // Increment pulse id so animation reliably retriggers
        setBeatPulseId(id => id + 1);
      });
      metroRef.current = m;
    }
    return metroRef.current;
  }, [reducedMotion]);
  const canUseAudio = React.useCallback(() => {
    try {
      type WinAudio = { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const w = window as unknown as WinAudio;
      return !!(w && (w.AudioContext || w.webkitAudioContext));
    } catch { return false; }
  }, []);
  // Metronome specific setters/event publishers are defined inline in the controls UI below to avoid TDZ on announce.

  // Hash worker (off-main) with tiny memo
  const hashWorkerRef = React.useRef<Worker | null>(null);
  const [lastHashIn, setLastHashIn] = React.useState<string>("");
  const [lastHashOut, setLastHashOut] = React.useState<string>("");
  const getHashWorker = React.useCallback(() => {
    if (hashWorkerRef.current) return hashWorkerRef.current;
    const w = new Worker(new URL("../../workers/hash.worker.ts", import.meta.url), { type: "module" });
    hashWorkerRef.current = w;
    return w;
  }, []);
  React.useEffect(() => () => { try { hashWorkerRef.current?.terminate(); } catch {} }, []);
  const hashWithWorker = React.useCallback((input: string) => new Promise<string>((resolve, reject) => {
    if (input === lastHashIn && lastHashOut) { resolve(lastHashOut); return; }
    const w = getHashWorker();
    const onMsg = (e: MessageEvent) => {
      w.removeEventListener('message', onMsg);
      const hex = e.data as string | null;
      if (!hex) { reject(new Error('hash-failed')); return; }
      setLastHashIn(input); setLastHashOut(hex);
      resolve(hex);
    };
    w.addEventListener('message', onMsg);
    w.postMessage(input);
  }), [getHashWorker, lastHashIn, lastHashOut]);

  // Redaction worker + helpers
  type RedactOptions = {
    master: boolean;
    categories: { name: boolean; ids: boolean; contact: boolean; address: boolean; dates: boolean; freeText: boolean };
  };
  const redactWorkerRef = React.useRef<Worker | null>(null);
  const getRedactWorker = React.useCallback(() => {
    if (redactWorkerRef.current) return redactWorkerRef.current;
    const w = new Worker(new URL("../../workers/redaction.worker.ts", import.meta.url), { type: "module" });
    redactWorkerRef.current = w; return w;
  }, []);
  React.useEffect(() => () => { try { redactWorkerRef.current?.terminate(); } catch {} }, []);
  const scrubJSON = React.useCallback(<T,>(payload: T, opts: RedactOptions): Promise<T> => new Promise<T>((resolve, reject) => {
    try {
      if (!opts?.master) { resolve(payload); return; }
      const w = getRedactWorker();
      const onMsg = (e: MessageEvent) => { w.removeEventListener('message', onMsg); const d = e.data as { ok: boolean; payload?: T; error?: string };
        if (!d?.ok) { reject(new Error(d?.error || 'scrub-failed')); return; }
        resolve(d.payload as T);
      };
      w.addEventListener('message', onMsg);
      w.postMessage({ kind: 'scrubJSON', payload, opts });
    } catch (err) { reject(err); }
  }), [getRedactWorker]);
  const scrubText = React.useCallback((text: string, opts: RedactOptions) => new Promise<string>((resolve, reject) => {
    try {
      if (!opts?.master || !opts.categories.freeText) { resolve(text); return; }
      const w = getRedactWorker();
      const onMsg = (e: MessageEvent) => { w.removeEventListener('message', onMsg); const d = e.data as { ok: boolean; text?: string; error?: string };
        if (!d?.ok || typeof d.text !== 'string') { reject(new Error(d?.error || 'scrub-failed')); return; }
        resolve(d.text);
      };
      w.addEventListener('message', onMsg);
      w.postMessage({ kind: 'scrubText', text, opts });
    } catch (err) { reject(err); }
  }), [getRedactWorker]);
  // Use document.body as portal target to avoid container race conditions
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const primaryRef = React.useRef<HTMLButtonElement | null>(null);
  const lastFocused = React.useRef<HTMLElement | null>(null);
  const confirmCancelRef = React.useRef<HTMLButtonElement | null>(null);
  // Inline confirm for clearing notes (replaces window.confirm for accessibility & testability)
  const [notesConfirmOpen, setNotesConfirmOpen] = React.useState(false);
  const [exportBusy, setExportBusy] = React.useState(false);
  // Resilience & persistence
  const monoStartRef = React.useRef<number | null>(null);
  const accumAtStartRef = React.useRef<number>(0);
  const t0WallRef = React.useRef<number | null>(null);
  const deadlineWallRef = React.useRef<number | null>(null);
  const lastWallSampleRef = React.useRef<number>(Date.now());
  const storageDisabledRef = React.useRef<boolean>(false);
  const storageSeedRef = React.useRef<string | null>(null);
  const storageCreatedAtRef = React.useRef<string | null>(null);
  const persistTimerRef = React.useRef<number | null>(null);
  const audioTriedRef = React.useRef<boolean>(false);
  const audioFailedRef = React.useRef<boolean>(false);
  const STORAGE_KEY = 'timer-modal.v1';
  // Dedicated portal root to ensure top-most stacking regardless of other body portals
  const portalRoot = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (!portalRoot.current) {
      const el = document.createElement('div');
      el.setAttribute('data-portal', 'timer-modal');
      el.style.position = 'relative';
      el.style.zIndex = '2147483649'; // above any other overlay (incl. psychiatry modal)
      portalRoot.current = el;
    }
    if (open && portalRoot.current) {
      // Re-append to move as last child to guarantee stacking
      document.body.appendChild(portalRoot.current);
      document.body.setAttribute('data-timer-open', '1');
    }
    return () => {
      if (portalRoot.current && portalRoot.current.parentElement) {
        portalRoot.current.parentElement.removeChild(portalRoot.current);
      }
      document.body.removeAttribute('data-timer-open');
    };
  }, [open]);
  // Fallback inline styles in case CSS modules fail to load at runtime
  const hasOverlayClass = Boolean((styles as Record<string, unknown>)?.overlay);
  const overlayStyleFallback: React.CSSProperties | undefined = hasOverlayClass ? undefined : {
    position: 'fixed', inset: 0 as unknown as number, width: '100vw', height: '100vh',
    display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.70)', zIndex: 2147483649,
    opacity: 1, pointerEvents: 'auto'
  };
  const hasSheetClass = Boolean((styles as Record<string, unknown>)?.sheet);
  const sheetStyleFallback: React.CSSProperties | undefined = hasSheetClass ? undefined : {
    width: 'min(96vw, 1280px)', maxHeight: '92vh', display: 'grid', gridTemplateRows: 'auto 1fr',
    borderRadius: 14, overflow: 'hidden', background: 'rgba(20,20,22,0.92)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.12)'
  };

  // Registry selection (patient + encounter) — used for import actions
  // Prefer strict hook for normal runtime; fall back to optional in test/legacy contexts.
  let regCtx: ReturnType<typeof useRegistry> | ReturnType<typeof useRegistryOptional>;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Registry pattern requires conditional hook for backwards compatibility
  try { regCtx = useRegistry(); } catch { regCtx = useRegistryOptional(); }
  const regState = regCtx?.state;
  const regActions = regCtx?.actions;
  const selectedPatientId = regState?.selectedPatientId;
  const selectedEncounterId = regState?.selectedEncounterId;
  const patient = React.useMemo(() => regState?.patients.find(p => p.id === selectedPatientId), [regState?.patients, selectedPatientId]);
  const encounter = React.useMemo(() => patient?.encounters.find(e => e.id === selectedEncounterId), [patient, selectedEncounterId]);

  // Global engine store
  const { t, setT, start, pause, reset, lap, setModeStopwatch, setModeCountdown, setCountdownMinutes, setZeroBehavior, listAudits, clearAudits } = useTimer();
  const running = t.phase === "running";
  const isCountdown = t.mode === "countdown";

  // Recent audits + async Run IDs (checksums of canonical payload rebuilt from snapshot)
  const recentAudits: Audit.TimerAuditRecord[] = listAudits(5);
  const [runIds, setRunIds] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    let alive = true;
    (async () => {
      for (const a of recentAudits) {
        if (runIds[a.id]) continue;
        try {
          const { json } = buildCanonicalPayload(Engine.fromSnapshot(a.snapshot), a.endedAt);
          const cs = await hashWithWorker(json);
          if (!alive) return;
          setRunIds(prev => (prev[a.id] ? prev : { ...prev, [a.id]: cs }));
        } catch {
          /* ignore */
        }
      }
    })();
    return () => { alive = false; };
  }, [recentAudits, hashWithWorker, runIds]);

  // Mute persistence
  const [muted, setMuted] = React.useState<boolean>(() => {
    try { return localStorage.getItem("timerMute") === "1"; } catch { return false; }
  });
  React.useEffect(() => { try { localStorage.setItem("timerMute", muted ? "1" : "0"); } catch {} }, [muted]);

  // Privacy controls (persisted)
  const [redactOn, setRedactOn] = React.useState<boolean>(() => { try { const v = localStorage.getItem('timerRedactOn'); return v == null ? true : v === '1'; } catch { return true; } });
  const [advOpen, setAdvOpen] = React.useState<boolean>(false);
  const [adv, setAdv] = React.useState<RedactOptions['categories']>(() => {
    try { const raw = localStorage.getItem('timerRedactAdvanced'); if (raw) return JSON.parse(raw); } catch {}
    return { name: true, ids: true, contact: true, address: true, dates: true, freeText: true };
  });
  React.useEffect(() => { try { localStorage.setItem('timerRedactOn', redactOn ? '1' : '0'); } catch {} }, [redactOn]);
  React.useEffect(() => { try { localStorage.setItem('timerRedactAdvanced', JSON.stringify(adv)); } catch {} }, [adv]);
  const redactOpts: RedactOptions = React.useMemo(() => ({ master: redactOn, categories: adv }), [redactOn, adv]);

  

  // Derived
  // kept for legacy text fallback (not used in visual readout)
  // pct no longer needed with dual-ring; session progress computed from smooth value

  const activeSegment = React.useMemo(() => {
    const segs = t.segments;
    if (!segs.length) return undefined;
    const s = segs[segs.length - 1];
    return s.endMs === undefined ? s.kind : undefined;
  }, [t.segments]);
  // Apply segment-specific metronome settings when segment changes
  React.useEffect(() => {
    if (!activeSegment) return;
    const segCfg = metSegMap[activeSegment];
    if (!segCfg) return;
    setMetState(prev => ({
      ...prev,
      bpm: segCfg.bpm ?? prev.bpm,
      subdivision: (segCfg.subdivision ?? prev.subdivision) as 1|2|4,
      volume: segCfg.volume ?? prev.volume
    }));
  }, [activeSegment, metSegMap]);

  // (moved up above ensureMet)

  // --- Hero numeric cells (stable grid) + preference to force hours ---
  const totalSec = Math.max(0, Math.floor((isCountdown ? Engine.remainingMsSelector(t) : t.elapsedMs) / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const [forceShowHours, setForceShowHours] = React.useState<boolean>(() => {
    try { return localStorage.getItem("timerForceHours") === "1"; } catch { return false; }
  });
  React.useEffect(() => { try { localStorage.setItem("timerForceHours", forceShowHours ? "1" : "0"); } catch {} }, [forceShowHours]);
  const showHours = forceShowHours || hours > 0;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const hero = { hh, mm, ss, showHours };

  // Measure readout size to drive ring geometry
  const readoutRef = React.useRef<HTMLDivElement | null>(null);
  // Note: size-based visuals removed; no need to observe readout size

  // Smooth local progress (rings only) based on rAF
  const [animBase, setAnimBase] = React.useState<{ baseMs: number; mark: number }>({ baseMs: Engine.progressMs(t), mark: performance.now() });
  React.useEffect(() => {
    setAnimBase({ baseMs: Engine.progressMs(t), mark: performance.now() });
  }, [t, t.mode, t.elapsedMs, t.remainingMs, t.segments.length, t.phase]);

  // Removed rAF tick — no longer needed for ring animation

  const smoothProgressMs = t.phase === "running" ? (animBase.baseMs + (performance.now() - animBase.mark)) : Engine.progressMs(t);
  const sessionTotalMs = t.mode === "countdown" ? Math.max(1000, t.countdownInitialMs) : 0;
  const sessionP = t.mode === "countdown" && sessionTotalMs > 0
    ? Math.min(1, Math.max(0, smoothProgressMs / sessionTotalMs))
    : 0;
  const segP = 0; // no target defined (segment progress kept at 0 per spec when no target)

  // Visual state flags
  const finished = t.phase === "finished";

  // One-shot finish pulse
  const [pulse, setPulse] = React.useState(false);
  // Lightweight beat flash for metronome (separate from finish pulse)
  const [beatFlash, setBeatFlash] = React.useState(false); // major beat visual
  const [beatSubFlash, setBeatSubFlash] = React.useState(false); // subdivision pulse visual
  const [beatPulseId, setBeatPulseId] = React.useState(0); // increments every pulse to retrigger animation
  React.useEffect(() => {
    let id: number | undefined;
    if (t.phase === "finished") {
      setPulse(true);
      id = window.setTimeout(() => setPulse(false), reducedMotion ? 220 : 380) as unknown as number;
    }
    return () => { if (id) window.clearTimeout(id); };
  }, [t.phase, reducedMotion]);

  // Metronome visual tick now driven by audio scheduler via ensureMet().setOnPulse above.

  // Guarantee an initial open segment (therapy) without breaking existing state
  React.useEffect(() => {
    if (!open) return;
    setT((s) => (s.segments.length === 0 ? Engine.startSegment(s, "therapy") : s));
  }, [open, setT]);

  // Also ensure a default segment exists after mode changes or resets while modal is open
  React.useEffect(() => {
    if (!open) return;
    if (t.segments.length === 0) {
      setT((s) => (s.segments.length === 0 ? Engine.startSegment(s, "therapy") : s));
    }
  }, [open, t.segments.length, setT]);

  // Screen reader polite state updates (moved earlier for resilience dependencies)
  const srRef = React.useRef<HTMLDivElement | null>(null);
  const live = React.useRef<{ pending: string | null; last: string; tid: number | null }>({ pending: null, last: '', tid: null });
  const announce = React.useCallback((msg: string) => {
    if (!msg) return;
    if (msg === live.current.last) return; // coalesce duplicates
    live.current.pending = msg;
    if (live.current.tid != null) return;
    live.current.tid = window.setTimeout(() => {
      const out = live.current.pending;
      if (out && srRef.current) srRef.current.textContent = out;
      live.current.last = out || live.current.last;
      live.current.pending = null;
      live.current.tid = null;
    }, 250) as unknown as number;
  }, []);
  // Visual toast notifications
  type ToastKind = 'info' | 'warn' | 'error';
  const [toasts, setToasts] = React.useState<Array<{ id: number; text: string; kind: ToastKind }>>([]);
  const toastSeq = React.useRef(1);
  const pushToast = React.useCallback((text: string, kind: ToastKind = 'info', ttl = 2600) => {
    const id = toastSeq.current++;
    setToasts(prev => [...prev, { id, text, kind }]);
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), ttl);
  }, []);
  // Subscribe to hook_error events from any timer-scoped hook
  useTimerBusSubscription(bus, 'hook_error', (p) => {
    pushToast(`${p.hook}:${p.operation} ${p.error}`, 'error');
  });
  React.useEffect(() => {
    const msg = t.phase === "running"
      ? "Timer started"
      : t.phase === "paused"
        ? "Timer paused"
        : t.phase === "finished"
          ? "Timer finished"
          : "Timer reset";
    announce(msg);
    if (t.phase === 'running' || t.phase === 'paused') {
      try { primaryRef.current?.focus(); } catch {}
    }
  }, [t.phase, announce]);

  // P12: Recent Sessions — local Undo for Clear History (implemented after announce is defined)
  const [recentUndoVisible, setRecentUndoVisible] = React.useState(false);
  const recentSnapshotRef = React.useRef<Audit.TimerAuditRecord[] | null>(null);
  const undoTimerRef = React.useRef<number | null>(null);
  const [, forceRerender] = React.useState(0); // bump to refresh recentAudits
  const clearUndoTimeoutMs = 6000; // ms window to undo
  const handleClearHistoryWithUndo = React.useCallback(() => {
    try {
      if (undoTimerRef.current) { window.clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
      const snapshot = listAudits(200); // capture full set for restore
      recentSnapshotRef.current = snapshot;
      clearAudits();
      setRecentUndoVisible(true);
  forceRerender(v => v + 1);
      announce('History cleared. Undo available for 6 seconds.');
      undoTimerRef.current = window.setTimeout(() => {
        setRecentUndoVisible(false);
        recentSnapshotRef.current = null;
        undoTimerRef.current = null;
        announce('History cleared.');
      }, clearUndoTimeoutMs) as unknown as number;
    } catch {
      announce('Clear failed.');
    }
  }, [listAudits, clearAudits, announce]);
  const handleUndoClearHistory = React.useCallback(() => {
    if (!recentSnapshotRef.current) { announce('Nothing to undo.'); return; }
    try { localStorage.setItem('therapyTimer.audit@v1', JSON.stringify(recentSnapshotRef.current)); } catch {}
    setRecentUndoVisible(false);
    recentSnapshotRef.current = null;
    if (undoTimerRef.current) { window.clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
  forceRerender(v => v + 1);
    announce('History restored.');
  }, [announce]);
  const handleDismissUndo = React.useCallback(() => {
    if (undoTimerRef.current) { window.clearTimeout(undoTimerRef.current); undoTimerRef.current = null; }
    recentSnapshotRef.current = null;
    setRecentUndoVisible(false);
    announce('History cleared.');
  }, [announce]);

  // --- Dual thresholds (warning + critical) for countdown mode (non-invasive) ---
  const [warnThresholdMin, setWarnThresholdMin] = React.useState<number>(() => { try { const v = localStorage.getItem('timerWarnThreshold'); return v ? Math.max(0, parseInt(v, 10)) : 5; } catch { return 5; } });
  const [criticalThresholdMin, setCriticalThresholdMin] = React.useState<number>(() => { try { const v = localStorage.getItem('timerCriticalThreshold'); return v ? Math.max(0, parseInt(v, 10)) : 1; } catch { return 1; } });
  React.useEffect(() => { try { localStorage.setItem('timerWarnThreshold', String(warnThresholdMin)); } catch {} }, [warnThresholdMin]);
  React.useEffect(() => { try { localStorage.setItem('timerCriticalThreshold', String(criticalThresholdMin)); } catch {} }, [criticalThresholdMin]);
  const thresholdStageRef = React.useRef<'none'|'warn'|'critical'>('none');
  React.useEffect(() => {
    if (!isCountdown) { thresholdStageRef.current = 'none'; return; }
    const remainMs = Engine.remainingMsSelector(t);
    const remainMin = Math.ceil(remainMs / 60000);
    // Critical first priority
    if (criticalThresholdMin > 0 && remainMin <= criticalThresholdMin && thresholdStageRef.current !== 'critical') {
      thresholdStageRef.current = 'critical';
  pushToast(`Critical threshold (${criticalThresholdMin} min)`, 'error');
  announce(`Critical threshold with ${criticalThresholdMin} minutes remaining`);
      return;
    }
    if (warnThresholdMin > 0 && remainMin <= warnThresholdMin && thresholdStageRef.current === 'none') {
      thresholdStageRef.current = 'warn';
  pushToast(`Warning threshold (${warnThresholdMin} min)`, 'warn');
  announce(`Warning threshold with ${warnThresholdMin} minutes remaining`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 't' object causes infinite re-renders, individual properties already tracked
  }, [t.remainingMs, isCountdown, warnThresholdMin, criticalThresholdMin, pushToast, announce]);

  // -------- P11 Telemetry & Audit (modal-scoped, privacy-aware) --------
  type TeleEvent = {
    t_wall: string; // ISO
    t_mono_ms: number; // performance.now relative
  type: 'start'|'pause'|'resume'|'lap'|'reset'|'finish'
  |'export_json'|'export_csv'|'export_md'|'export_pdf'
    |'redaction_on'|'redaction_off'
    |'focus_lost'|'focus_gained'|'desync_detected'|'clock_jump_detected'|'audio_failed'
    |'command'
    // P15 hook telemetry
    |'queue_add'|'queue_start'|'queue_complete'|'queue_skip'|'queue_remove'|'queue_clear'
    |'calendar_attach'|'calendar_detach'
    |'metronome_on'|'metronome_off'|'metronome_bpm_change';
    data: {
      mode: 'countdown'|'stopwatch';
      elapsed_ms: number;
      remaining_ms?: number;
      lap_index?: number;
      segment?: string;
  export_kind?: 'json'|'csv'|'md'|'pdf';
      desync_ms?: number;
      command_text?: string;
      // hook payloads (minimal)
      id?: string;
      event_hash?: string;
      bpm?: number;
    };
  };
  const teleEventsRef = React.useRef<TeleEvent[]>([]);
  const teleBufferKey = 'timerModal.telemetry.buffer';
  const writeTelemetryBuffer = React.useCallback(() => {
    try {
      const buf = teleEventsRef.current.slice(-64);
      localStorage.setItem(teleBufferKey, JSON.stringify(buf));
    } catch {/* ignore */}
  }, []);
  const readTelemetryBuffer = React.useCallback((): TeleEvent[] => {
    try { const raw = localStorage.getItem(teleBufferKey); if (!raw) return []; const arr = JSON.parse(raw); return Array.isArray(arr)?arr:[]; } catch { return []; }
  }, []);
  const [auditOpen, setAuditOpen] = React.useState(false);
  // Phase 1: FORCE radical mode ON for demo (override localStorage)
  const [radicalOn, setRadicalOn] = React.useState<boolean>(true); // Always start in radical mode
  React.useEffect(() => { try { localStorage.setItem('timerRadicalOn', radicalOn ? '1' : '0'); } catch {} }, [radicalOn]);
  
  // Phase 1: Holographic Time Display - STRONGER parallax effect in radical mode
  const { transformStyle: parallaxStyle } = useParallaxEffect(readoutRef, radicalOn ? 0.35 : 0);

  // Phase 1: Time-of-day and intensity-based theming
  const { timeOfDayClass, intensityClass } = useTimeOfDayTheme(
    t.phase === 'running', 
    t.laps.length
  );
  
  // Phase 1.2: Swipe Gesture Visual Feedback
  const [swipeDirection, setSwipeDirection] = React.useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const swipeTimeoutRef = React.useRef<number | null>(null);
  
  // Phase 1: Gesture Control System
  const heroCanvasRef = React.useRef<HTMLDivElement>(null);
  const { hapticFeedback, isDragging } = useGestureControl(
    heroCanvasRef as React.RefObject<HTMLElement>,
    () => {
      // Swipe left: Show visual feedback
      setSwipeDirection('left');
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
      swipeTimeoutRef.current = window.setTimeout(() => setSwipeDirection(null), 800);
      hapticFeedback('light');
    },
    () => {
      // Swipe right: Show visual feedback
      setSwipeDirection('right');
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
      swipeTimeoutRef.current = window.setTimeout(() => setSwipeDirection(null), 800);
      hapticFeedback('light');
    },
    () => {
      // Swipe up: Resume if paused
      if (t.phase === 'paused') {
        setSwipeDirection('up');
        if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
        swipeTimeoutRef.current = window.setTimeout(() => setSwipeDirection(null), 800);
        start();
        hapticFeedback('light');
      }
    },
    () => {
      // Swipe down: Pause if running
      if (t.phase === 'running') {
        setSwipeDirection('down');
        if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
        swipeTimeoutRef.current = window.setTimeout(() => setSwipeDirection(null), 800);
        pause();
        hapticFeedback('light');
      }
    },
    radicalOn // Only enable gestures when radical mode is on
  );
  
  // Phase 1.2: Voice Commands
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = React.useState(false);
  
  // Phase 2.1: Analytics Dashboard via global store
  const { isOpen: showAnalytics, toggle: toggleAnalytics, close: closeAnalytics } = useAnalyticsStore();
  
  // Analytics tab state (radical mode only) - now includes collaboration
  const [radicalTab, setRadicalTab] = React.useState<'notes' | 'analytics' | 'collaboration'>('notes');
  
  // Sync analytics toggle with tab selection in radical mode
  React.useEffect(() => {
    if (radicalOn && showAnalytics) {
      setRadicalTab('analytics');
    }
  }, [radicalOn, showAnalytics]);
  
  // Phase 2.1: Build analytics data outside JSX to avoid leaked values
  type ADTimerSession = {
    id: string;
    startTime: number;
    endTime: number;
    totalDuration: number;
    segments: Array<{ type: string; duration: number; startTime: number; endTime: number }>;
    laps: Array<{ time: number; segment: string }>;
    patientId?: string;
    patientName?: string;
  };

  // Analytics state - computed ONCE when opened
  const [analyticsSnapshot, setAnalyticsSnapshot] = React.useState<{
    sessions: ADTimerSession[];
    currentSession: ADTimerSession | null;
  }>({ sessions: [], currentSession: null });

  // Demo data generator for Phase 1 testing
  const [useDemoData, setUseDemoData] = React.useState(false); // Default to real data for PDF export
  
  const generateDemoSessions = (): ADTimerSession[] => {
    const demos: ADTimerSession[] = [];
    const now = Date.now();
    
    // Generate 15 realistic demo sessions over past 7 days
    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(i / 2); // 2 sessions per day
      const sessionStart = now - (daysAgo * 24 * 60 * 60 * 1000) - (Math.random() * 8 * 60 * 60 * 1000);
      const duration = (30 + Math.random() * 25) * 60 * 1000; // 30-55 min
      const lapCount = 3 + Math.floor(Math.random() * 5); // 3-8 laps
      
      demos.push({
        id: `demo-${i}`,
        startTime: sessionStart,
        endTime: sessionStart + duration,
        totalDuration: duration,
        segments: [
          {
            type: 'Assessment',
            duration: duration * 0.3,
            startTime: sessionStart,
            endTime: sessionStart + duration * 0.3,
          },
          {
            type: 'Intervention',
            duration: duration * 0.5,
            startTime: sessionStart + duration * 0.3,
            endTime: sessionStart + duration * 0.8,
          },
          {
            type: 'Documentation',
            duration: duration * 0.2,
            startTime: sessionStart + duration * 0.8,
            endTime: sessionStart + duration,
          },
        ],
        laps: Array.from({ length: lapCount }).map((_, j) => ({
          time: sessionStart + (duration * j) / lapCount,
          segment: `Checkpoint ${j + 1}`,
        })),
        patientId: `patient-${i % 5}`,
        patientName: `Patient ${i % 5}`,
      });
    }
    
    return demos;
  };

  // When analytics opens, capture snapshot ONCE
  React.useEffect(() => {
    if (!showAnalytics) return;
    
    let sessions: ADTimerSession[] = [];
    
    // Use demo data if enabled
    if (useDemoData) {
      sessions = generateDemoSessions();
    } else {
      // Current session (derive absolute timestamps from now - progress)
      if (t.phase !== 'idle') {
        const progress = Engine.progressMs(t);
        const base = Date.now() - progress;
        const current: ADTimerSession = {
          id: 'current',
          startTime: base,
          endTime: base + progress,
          totalDuration: progress,
          segments: t.segments.map((seg) => ({
            type: capitalize(seg.kind),
            duration: (seg.endMs ?? progress) - seg.startMs,
            startTime: base + seg.startMs,
            endTime: base + (seg.endMs ?? progress),
          })),
          laps: t.laps.map((lap) => ({ time: lap.atMs, segment: lap.label ?? 'Unlabeled' })),
          ...(patient?.id ? { patientId: patient.id } : {}),
          ...(patient?.name ? { patientName: patient.name } : {}),
        };
        sessions.push(current);
      }

      // Historical sessions from audit
      const audits = Audit.listAudits(100);
      audits.forEach((rec) => {
        const spans = rec.spans ?? [];
        const s: ADTimerSession = {
          id: rec.id,
          startTime: rec.startedAt,
          endTime: rec.endedAt,
          totalDuration: rec.durationMs,
          segments: spans.map((sp) => ({
            type: capitalize(sp.kind),
            duration: sp.durationMs,
            startTime: rec.startedAt + sp.startMs,
            endTime: rec.startedAt + sp.endMs,
          })),
          laps: rec.laps.map((l) => ({ time: l.atMs, segment: l.label ?? 'Unlabeled' })),
        };
        sessions.push(s);
      });
    }

    const currentSession: ADTimerSession | null = t.phase !== 'idle' ? sessions.find(s => s.id === 'current') ?? null : null;
    console.warn('[Analytics Snapshot] Setting snapshot with', sessions.length, 'sessions, useDemoData:', useDemoData);
    setAnalyticsSnapshot({ sessions, currentSession });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnalytics, useDemoData]); // ONLY when showAnalytics or useDemoData changes - intentionally ignoring t/patient to prevent loop
  
  const voiceCommands = useVoiceCommands(
    [
      {
        phrases: ['timer start', 'start timer', 'begin', 'go'],
        action: () => { if (t.phase === 'paused' || t.phase === 'idle') start(); },
        description: 'Start/Resume timer'
      },
      {
        phrases: ['timer pause', 'pause timer', 'stop', 'pause'],
        action: () => { if (t.phase === 'running') pause(); },
        description: 'Pause timer'
      },
      {
        phrases: ['add lap', 'new lap', 'lap'],
        action: () => { if (t.phase === 'running') lap(); },
        description: 'Add lap'
      },
      {
        phrases: ['reset timer', 'reset', 'clear'],
        action: () => { stop(); },
        description: 'Reset timer'
      }
    ],
    { 
      enabled: voiceCommandsEnabled && radicalOn
    }
  );
  
  // Phase 2.1: AI Session Prediction
  const { predictNextSegment, getProactiveSuggestion, isTraining, trainingProgress, historicalSessionCount } = useSessionML();
  const [mlSuggestion, setMlSuggestion] = React.useState<string | null>(null);
  const [showMlSuggestion, setShowMlSuggestion] = React.useState(false);
  const [aiDemoMode, setAiDemoMode] = React.useState(false);
  const [showMLInsights, setShowMLInsights] = React.useState(false);
  const [lastPrediction, setLastPrediction] = React.useState<{segment: string; duration: number; confidence: number} | null>(null);
  const [selectedSessionForNote, setSelectedSessionForNote] = React.useState<any>(null);
  
  // Phase 2.2: Real-Time Coaching - Always enabled when radical mode is on
  const coachingEnabled = true;
  
  // Demo suggestions for testing - Scientific clinical format
  const demoSuggestions = [
    "Temporal pattern analysis indicates 92% probability of assessment initiation in morning sessions (08:00-11:00). Recommended: 15-minute structured clinical interview protocol.",
    "Sequential workflow analysis: Post-assessment therapy intervention shows 87% adherence in historical data. Optimal duration: 20-25 minutes for evidence-based therapeutic protocols.",
    "Cognitive load indicators suggest optimal break timing at current session progress. Clinical recommendation: 5-minute mindfulness-based interval to maintain therapeutic efficacy.",
    "Documentation phase prediction based on session trajectory analysis. Recommended: 10-minute structured clinical note completion following standardized SOAP methodology.",
    "Consultation workflow pattern detected with 89% confidence. Suggested: 15-minute interdisciplinary collaboration session aligned with collaborative care protocols.",
    "Biometric session analytics indicate therapy segment optimization opportunity. Recommendation: 18-minute cognitive behavioral intervention based on patient engagement metrics.",
  ];
  
  // Visual effects toggle (color cycling / glow) - Default to TRUE
  const [effectsOn, _setEffectsOn] = React.useState<boolean>(() => { try { const v = localStorage.getItem('timerEffectsOn'); return v ? v === '1' : true; } catch { return true; } });
  const setEffectsOn = React.useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    _setEffectsOn(val);
  }, []);
  React.useEffect(()=>{ try { localStorage.setItem('timerEffectsOn', effectsOn ? '1':'0'); } catch {} }, [effectsOn]);
  // Color style selector - Used by dropdown in settings
  type ColorStyle = 'classic' | 'segment' | 'party';
  const [colorStyle, setColorStyle] = React.useState<ColorStyle>(() => { try { return (localStorage.getItem('timerColorStyle') as ColorStyle) || 'segment'; } catch { return 'segment'; } });
  React.useEffect(()=>{ try { localStorage.setItem('timerColorStyle', colorStyle); } catch {} }, [colorStyle]);
  // Effects intensity (0..1) - Controlled by intensity bar above timer
  const [effectsIntensity, setEffectsIntensity] = React.useState<number>(() => { try { const v = parseFloat(localStorage.getItem('timerEffectsIntensity') || '0.8'); return isNaN(v)?0.8:Math.max(0, Math.min(1, v)); } catch { return 0.8; } });
  React.useEffect(()=>{ try { localStorage.setItem('timerEffectsIntensity', String(effectsIntensity)); } catch {} }, [effectsIntensity]);
  
  // Phase 2.1: Generate prediction when lap is added
  React.useEffect(() => {
    const generatePrediction = async () => {
      if (!radicalOn || t.phase !== 'running' || t.laps.length === 0) return;
      
      try {
        const now = new Date();
        const currentSessionData: import('../timerHooks/useSessionML').SessionPattern = {
          timeOfDay: now.getHours(),
          dayOfWeek: now.getDay(),
          previousSegments: t.laps.slice(-3).map(lap => lap.label || 'Other'),
          segmentDurations: t.laps.slice(-3).map(lap => lap.atMs / 1000),
          totalDuration: t.laps.reduce((sum, lap) => sum + lap.atMs, 0) / 1000,
          lapCount: t.laps.length,
          pauseCount: 0 // TODO: track pause count
        };
        
        const prediction = await predictNextSegment(currentSessionData);
        if (prediction && prediction.confidence > 0.6) {
          const suggestion = await getProactiveSuggestion(currentSessionData);
          setMlSuggestion(suggestion);
          setShowMlSuggestion(true);
          
          // Store last prediction for insights panel
          setLastPrediction({
            segment: prediction.suggestedNextSegment,
            duration: Math.round(prediction.suggestedDuration / 60), // Convert seconds to minutes
            confidence: prediction.confidence
          });
          
          // Auto-hide after 8 seconds
          setTimeout(() => setShowMlSuggestion(false), 8000);
        }
      } catch (err) {
        // Silent fail for predictions
      }
    };
    
    generatePrediction();
  }, [t.laps.length, radicalOn]);
  
  // Phase 2.1: Demo mode - show random suggestion
  const triggerDemoSuggestion = React.useCallback(() => {
    const randomSuggestion = demoSuggestions[Math.floor(Math.random() * demoSuggestions.length)];
    setMlSuggestion(randomSuggestion);
    setShowMlSuggestion(true);
    setAiDemoMode(true);
    
    // Auto-hide after 12 seconds (longer for demo)
    setTimeout(() => {
      setShowMlSuggestion(false);
      setTimeout(() => setAiDemoMode(false), 300);
    }, 12000);
  }, [demoSuggestions]);
  
  const [notesValue, setNotesValue] = React.useState<string>("");
  const notesRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [notesPreviewOn, setNotesPreviewOn] = React.useState(false);
  const [notesCollapsed, setNotesCollapsed] = React.useState(false); // narrow screen toggle
  // Split ratio resizing removed in Radical mode; fixed layout
  const [isNarrow, setIsNarrow] = React.useState<boolean>(() => { try { return (window.innerWidth||1000) < 960; } catch { return false; } });
  
  // Phase 1.2: Adaptive Interface Density - Smart UI collapsing
  const [adaptiveCompact, setAdaptiveCompact] = React.useState(false);
  const compactPrevRef = React.useRef(false);
  const userCompactOverrideRef = React.useRef(false);
  const runningStartTimeRef = React.useRef<number | null>(null);
  
  // Auto-collapse secondary controls after 60 seconds of running (RADICAL MODE ONLY)
  React.useEffect(() => {
    if (!radicalOn) return undefined;
    
    if (t.phase === 'running') {
      if (!runningStartTimeRef.current) {
        runningStartTimeRef.current = Date.now();
      }
      
      const checkTimer = setInterval(() => {
        if (runningStartTimeRef.current && !userCompactOverrideRef.current) {
          const elapsed = Date.now() - runningStartTimeRef.current;
          if (elapsed > 60000) { // 60 seconds
            setAdaptiveCompact(true);
          }
        }
      }, 1000);
      
      return () => clearInterval(checkTimer);
    }
    
    // Reset when paused/idle
    runningStartTimeRef.current = null;
    if (!userCompactOverrideRef.current) {
      setAdaptiveCompact(false);
    }
    return undefined;
  }, [t.phase, radicalOn]);
  const compactThresholdMs = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('timerCompactThresholdMs');
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch {}
    return 8000;
  }, []);
  const compactWidthPx = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('timerCompactWidthPx');
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return 960;
  }, []);
  React.useEffect(() => {
    const onResize = () => { try { setIsNarrow((window.innerWidth||1000) < compactWidthPx); } catch {} };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [compactWidthPx]);
  // Recompute adaptive compact periodically while running; thresholds configurable via localStorage
  React.useEffect(() => {
    let id: number | null = null;
    const check = () => {
      try {
        const elapsed = Engine.progressMs(t);
        const next = !!(radicalOn && isNarrow && t.phase === 'running' && elapsed > compactThresholdMs);
        setAdaptiveCompact(prev => (prev !== next ? next : prev));
      } catch {}
    };
    check();
    // Poll lightly; engine ticks anyway, this avoids tight loops
    id = window.setInterval(check, 1000) as unknown as number;
    return () => { if (id) { try { window.clearInterval(id); } catch {} } };
  }, [radicalOn, isNarrow, t.phase, t, compactThresholdMs]);
  // On first enter into compact (and no user override), collapse Notes, close Queue, hide help
  React.useEffect(() => {
    if (adaptiveCompact && !compactPrevRef.current && !userCompactOverrideRef.current) {
      try { setNotesCollapsed(true); } catch {}
      try { setQueueOpen(false); } catch {}
      try { setHelpOpen(false); } catch {}
      try { announce('Compact layout engaged: collapsing notes and queue'); } catch {}
    }
    compactPrevRef.current = adaptiveCompact;
  }, [adaptiveCompact, announce]);
  // High-contrast variant toggle (modal scoped)
  const [contrast, setContrast] = React.useState<'normal'|'high'>(() => {
    try { const v = localStorage.getItem('timerContrast'); return (v === 'high') ? 'high' : 'normal'; } catch { return 'normal'; }
  });
  React.useEffect(() => { try { localStorage.setItem('timerContrast', contrast); } catch {} }, [contrast]);
  // Grayscale-only audit mode (color-blind audit)
  const [auditGray, setAuditGray] = React.useState<boolean>(() => {
    try { return localStorage.getItem('timerAuditGray') === '1'; } catch { return false; }
  });
  React.useEffect(() => { try { localStorage.setItem('timerAuditGray', auditGray ? '1':'0'); } catch {} }, [auditGray]);
  // Light theme removed: always dark baseline; remove theme state
  // P19: Inline error states (laps/recent)
  const [uiErrorLaps, setUiErrorLaps] = React.useState<string | null>(null);
  const [uiErrorRecent, setUiErrorRecent] = React.useState<string | null>(null);
  const onSnippet = (kind: string) => {
    const templates: Record<string,string> = {
      subjective: '## Subjective\n\nPatient reports...\n',
      objective: '## Objective\n\nObservations...\n',
      assessment: '## Assessment\n\nClinical impression...\n',
      plan: '## Plan\n\nNext steps...\n',
      risk: '### Risk Assessment\n\nRisk factors: ...\nProtective factors: ...\nInterventions: ...\n',
      followup: '### Follow-up Checklist\n\n- [ ] Medication review\n- [ ] Safety planning\n- [ ] Next appointment scheduled\n'
    };
    const tpl = templates[kind]; if (!tpl) return;
    const ta = notesRef.current; if (!ta) { setNotesValue(v=>v+tpl); return; }
    const start = ta.selectionStart; const end = ta.selectionEnd; const before = notesValue.slice(0,start); const after = notesValue.slice(end);
    const next = before + tpl + after; setNotesValue(next);
    requestAnimationFrame(()=>{ try { ta.focus(); ta.selectionStart = ta.selectionEnd = start + tpl.length; } catch {} });
  };
  const renderPreview = React.useCallback((md: string) => {
    // Enhanced markdown subset: headings, bold, italics, underline, strikethrough, code, lists
    const esc = (s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const lines = md.split(/\n/).map(l=>{
      // Headings
      if(/^###\s+/.test(l)) return `<h4>${esc(l.replace(/^###\s+/,'').trim())}</h4>`;
      if(/^##\s+/.test(l)) return `<h3>${esc(l.replace(/^##\s+/,'').trim())}</h3>`;
      if(/^#\s+/.test(l)) return `<h2>${esc(l.replace(/^#\s+/,'').trim())}</h2>`;
      // Lists
      if(/^-\s+/.test(l)) return `<li>${esc(l.replace(/^-\s+/,'').trim())}</li>`;
      if(/^\d+\.\s+/.test(l)) return `<li>${esc(l.replace(/^\d+\.\s+/,'').trim())}</li>`;
      // Inline formatting
      let out = l;
      // Preserve HTML tags like <u>
      const htmlTags: string[] = [];
      out = out.replace(/<u>(.*?)<\/u>/g, (_, content) => {
        htmlTags.push(`<u>${content}</u>`);
        return `__HTML_TAG_${htmlTags.length - 1}__`;
      });
      out = esc(out);
      // Restore HTML tags
      htmlTags.forEach((tag, i) => {
        out = out.replace(`__HTML_TAG_${i}__`, tag);
      });
      // Markdown formatting
      out = out.replace(/~~([^~]+)~~/g,'<s>$1</s>'); // strikethrough
      out = out.replace(/`([^`]+)`/g,'<code>$1</code>'); // code
      out = out.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>'); // bold
      out = out.replace(/\*([^*]+)\*/g,'<em>$1</em>'); // italic
      return `<p>${out}</p>`;
    });
    return lines.join('');
  }, []);
  const previewHTML = notesPreviewOn ? renderPreview(notesValue) : '';
  type AuditRecord = {
    audit_schema: 1;
    run_id: string;
    checksum: string;
    redaction: boolean;
    engine: { mode?: string; end_behavior?: string };
    times: { started_at: string; ended_at: string; duration_ms: number };
    metrics: Metrics;
    events: Array<TeleEvent>;
  };
  const [auditRecords, setAuditRecords] = React.useState<AuditRecord[]>(() => {
    try {
      const raw = localStorage.getItem('timerModal.audit.v1');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? (arr as AuditRecord[]) : [];
    } catch { return []; }
  });
  const persistAuditRecords = React.useCallback((list: AuditRecord[]) => {
    try { localStorage.setItem('timerModal.audit.v1', JSON.stringify(list.slice(0,10))); } catch {}
  }, []);
  const teleLastRef = React.useRef<{ type: string; ts: number }>({ type: '', ts: 0 });
  const addTeleEvent = React.useCallback((type: TeleEvent['type'], data: Partial<TeleEvent['data']> = {}) => {
    const nowMono = performance.now();
    const nowWall = Date.now();
    const elapsed_ms = t.mode === 'countdown' ? (Engine.totalDurationMs(t) - Engine.remainingMsSelector(t)) : t.elapsedMs;
    const remaining_ms = t.mode === 'countdown' ? t.remainingMs : undefined;
    const coalesce = (nowWall - teleLastRef.current.ts) < 250 && teleLastRef.current.type === type;
    const segmentName = activeSegment ? capitalize(activeSegment) : undefined;
    if (coalesce) return; // drop duplicate burst
    const ev: TeleEvent = {
      t_wall: new Date(nowWall).toISOString(),
      t_mono_ms: Math.round(nowMono),
      type,
      data: {
        mode: t.mode,
        elapsed_ms,
        ...(remaining_ms != null ? { remaining_ms } : {}),
        ...(t.laps.length ? { lap_index: t.laps.length - 1 } : {}),
        ...(segmentName ? { segment: segmentName } : {}),
        ...data,
      },
    };
    teleEventsRef.current.push(ev);
    teleLastRef.current = { type, ts: nowWall };
    writeTelemetryBuffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 't' object causes infinite re-renders, individual properties already tracked
  }, [t.mode, t.elapsedMs, t.remainingMs, t.laps.length, activeSegment, writeTelemetryBuffer]);
  // Metrics
  type Metrics = {
    total_active_ms: number;
    laps_count: number;
    avg_lap_ms: number;
    segment_totals_ms: Engine.SegmentTotals;
    focus_lost_count: number;
    focus_gained_count: number;
    desync_events: { count: number; max_ms: number };
  };
  const metricsRef = React.useRef<Metrics>({
    total_active_ms: 0,
    laps_count: 0,
    avg_lap_ms: 0,
    segment_totals_ms: { assessment: 0, therapy: 0, break: 0, documentation: 0 },
    focus_lost_count: 0,
    focus_gained_count: 0,
    desync_events: { count: 0, max_ms: 0 },
  });
  const activeIntervalStartRef = React.useRef<number | null>(null);
  // Track running intervals for total_active_ms
  React.useEffect(() => {
    if (t.phase === 'running') {
      activeIntervalStartRef.current = performance.now();
    } else if (activeIntervalStartRef.current != null) {
      const delta = performance.now() - activeIntervalStartRef.current;
      metricsRef.current.total_active_ms += Math.max(0, Math.round(delta));
      activeIntervalStartRef.current = null;
    }
  }, [t.phase]);
  // Update lap metrics
  React.useEffect(() => {
    metricsRef.current.laps_count = t.laps.length;
    if (t.laps.length) {
      let prev = 0; const splits: number[] = [];
      t.laps.forEach(l => { const sp = Math.max(0, l.atMs - prev); prev = l.atMs; if (sp >= 1000) splits.push(sp); });
      const avg = splits.length ? Math.round(splits.reduce((s,x)=>s+x,0)/splits.length) : 0;
      metricsRef.current.avg_lap_ms = avg;
    } else { metricsRef.current.avg_lap_ms = 0; }
  }, [t.laps]);
  // Segment totals update on segment change
  React.useEffect(() => {
    metricsRef.current.segment_totals_ms = Engine.segmentTotals(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 't' object causes infinite re-renders, individual properties already tracked
  }, [t.segments, t.elapsedMs, t.remainingMs, t.mode]);
  // Reset telemetry & metrics on explicit reset
  const resetTelemetry = React.useCallback(() => {
    teleEventsRef.current = [];
    metricsRef.current = {
      total_active_ms: 0,
      laps_count: 0,
      avg_lap_ms: 0,
      segment_totals_ms: { assessment: 0, therapy: 0, break: 0, documentation: 0 },
      focus_lost_count: 0,
      focus_gained_count: 0,
      desync_events: { count: 0, max_ms: 0 },
    };
    try { localStorage.removeItem(teleBufferKey); } catch {}
  }, []);
  // Load crash buffer on mount/open
  React.useEffect(() => { if (open && teleEventsRef.current.length===0) { const buf = readTelemetryBuffer(); teleEventsRef.current = buf; } }, [open, readTelemetryBuffer]);
  // Canonical audit build + hash finalization
  const [finalizeError, setFinalizeError] = React.useState<string | null>(null);
  const [finalizing, setFinalizing] = React.useState(false);
  const finalizeAudit = React.useCallback(async () => {
    try {
      setFinalizing(true);
      setFinalizeError(null);
      const endWall = Date.now();
      if (t.phase === 'finished' && activeIntervalStartRef.current != null) {
        const delta = performance.now() - activeIntervalStartRef.current; metricsRef.current.total_active_ms += Math.max(0, Math.round(delta)); activeIntervalStartRef.current = null;
      }
  const { payload } = buildCanonicalPayload(t, endWall);
  const effective = await scrubJSON<CanonicalPayload>(payload, redactOpts);
      const canonical = JSON.stringify(effective);
      const checksum = await hashWithWorker(canonical);
      const run_id = checksum.slice(0,8);
      const metrics = metricsRef.current;
      const events = teleEventsRef.current;
      const started_at = effective.session?.started_at || new Date(endWall - (effective.session?.duration_ms||0)).toISOString();
      const times = { started_at, ended_at: new Date(endWall).toISOString(), duration_ms: effective.session?.duration_ms||0 };
      const engine = { mode: effective.engine?.mode, end_behavior: effective.engine?.end_behavior };
      const auditRecord = {
        audit_schema: 1,
        run_id,
        checksum,
        redaction: !!redactOpts.master,
        engine,
        times,
        metrics: {
          total_active_ms: metrics.total_active_ms,
          laps_count: metrics.laps_count,
          avg_lap_ms: metrics.avg_lap_ms,
          segment_totals_ms: metrics.segment_totals_ms,
          focus_lost_count: metrics.focus_lost_count,
          focus_gained_count: metrics.focus_gained_count,
          desync_events: metrics.desync_events,
        },
        events,
      };
  const sortObj = (obj: unknown): unknown => { if (obj==null || typeof obj!=='object') return obj; if (Array.isArray(obj)) return (obj as unknown[]).map(sortObj); const out: Record<string, unknown> = {}; for (const k of Object.keys(obj as Record<string, unknown>).sort()) out[k] = sortObj((obj as Record<string, unknown>)[k]); return out; };
  const sortedAudit = sortObj(auditRecord) as AuditRecord;
  setAuditRecords((prev: AuditRecord[]) => { const next: AuditRecord[] = [sortedAudit, ...prev].slice(0,10); persistAuditRecords(next); return next; });
      resetTelemetry();
      pushToast(`Audit saved (${run_id})`, 'info');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : 'checksum-failed';
      setFinalizeError(msg); announce('Audit unavailable. Checksum error.'); pushToast('Audit checksum error — retry', 'error');
    } finally { setFinalizing(false); }
  }, [t, hashWithWorker, scrubJSON, redactOpts, persistAuditRecords, resetTelemetry, pushToast, announce]);
  // Phase transitions → tele events
  const prevPhaseRef2 = React.useRef(t.phase);
  React.useEffect(() => {
    const prev = prevPhaseRef2.current; const curr = t.phase; prevPhaseRef2.current = curr;
    if (prev !== 'running' && curr === 'running') addTeleEvent(prev==='paused'?'resume':'start');
    if (prev === 'running' && curr === 'paused') addTeleEvent('pause');
    if (prev === 'running' && curr === 'finished') { addTeleEvent('finish'); finalizeAudit(); }
  }, [t.phase, addTeleEvent, finalizeAudit]);
  // Lap events
  React.useEffect(() => { if (t.laps.length) addTeleEvent('lap'); }, [t.laps.length, addTeleEvent]);
  // Redaction toggle events
  React.useEffect(() => { addTeleEvent(redactOn ? 'redaction_on' : 'redaction_off'); }, [redactOn, addTeleEvent]);
  // Focus/visibility events for metrics
  React.useEffect(() => {
    if (!open) return;
    const onVis = () => { if (document.visibilityState === 'hidden') { metricsRef.current.focus_lost_count++; addTeleEvent('focus_lost'); } else { metricsRef.current.focus_gained_count++; addTeleEvent('focus_gained'); } };
    const onFocus = () => { metricsRef.current.focus_gained_count++; addTeleEvent('focus_gained'); };
    const onBlur = () => { metricsRef.current.focus_lost_count++; addTeleEvent('focus_lost'); };
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    // eslint-disable-next-line consistent-return -- useEffect cleanup doesn't need explicit void return
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [open, addTeleEvent]);

  // -------- Resilience & persistence helpers --------
  // Resilience event emitter (narrow detail typing – avoids any)
  type ResilienceDetail = { pred?: number; wall?: number; delta?: number };
  const emit = React.useCallback((name: 'desync_detected'|'clock_jump_detected'|'audio_failed'|'storage_failed'|'state_restored', detail?: ResilienceDetail) => {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {}
    // Telemetry hooks for resilience events
    try {
      if (name === 'desync_detected') {
        const d = Math.max(0, Math.round(detail?.delta ?? 0));
        metricsRef.current.desync_events.count += 1;
        metricsRef.current.desync_events.max_ms = Math.max(metricsRef.current.desync_events.max_ms, d);
        addTeleEvent('desync_detected', { desync_ms: d });
      }
      if (name === 'clock_jump_detected') {
        addTeleEvent('clock_jump_detected');
      }
      if (name === 'audio_failed') {
        addTeleEvent('audio_failed');
      }
    } catch { /* ignore */ }
  }, [addTeleEvent]);

  function randomHex64() {
    try { const a = new Uint32Array(2); crypto.getRandomValues(a); return a[0].toString(16).padStart(8,'0') + a[1].toString(16).padStart(8,'0'); }
    catch { return Math.floor(Math.random()*1e16).toString(16).padStart(16,'0'); }
  }

  const buildPersistBlob = React.useCallback(() => {
    const nowIso = new Date().toISOString();
    if (!storageSeedRef.current) storageSeedRef.current = randomHex64();
    if (!storageCreatedAtRef.current) storageCreatedAtRef.current = nowIso;
    const engine = {
      mode: t.mode,
      end_behavior: (t.zeroBehavior === 'pause' ? 'auto-pause' : (t.zeroBehavior === 'finish' ? 'stop' : 'keep')),
      running: t.phase === 'running',
      mute: muted,
      duration_ms: Engine.totalDurationMs(t),
      accumulated_ms: Engine.progressMs(t),
    };
    const time_refs = { t0_wall: t0WallRef.current ?? null, deadline_wall: deadlineWallRef.current ?? null };
    const segments = { current: activeSegment ? capitalize(activeSegment) : null, spans: t.segments, laps: t.laps };
    const meta = { seed: storageSeedRef.current, created_at: storageCreatedAtRef.current, updated_at: nowIso };
    return { schema_version: 1, engine, time_refs, segments, meta };
  }, [t, muted, activeSegment]);

  const schedulePersist = React.useCallback((_reason?: string, flush?: boolean) => {
    if (storageDisabledRef.current) return;
    const write = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistBlob())); }
      catch {
        storageDisabledRef.current = true; emit('storage_failed'); announce('Storage unavailable. Session will not persist.'); pushToast('Storage unavailable. Not persisted.', 'warn');
      } finally { persistTimerRef.current = null; }
    };
    if (flush) { write(); return; }
    if (persistTimerRef.current != null) return;
    persistTimerRef.current = window.setTimeout(write, 300) as unknown as number;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pushToast is stable function, adding causes re-render
  }, [buildPersistBlob, announce, emit]);

  // Audio capability probe on first gesture
  const ensureAudio = React.useCallback(async () => {
    if (audioTriedRef.current) return;
    audioTriedRef.current = true;
    try {
  const winAudio = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const AC = winAudio.AudioContext || winAudio.webkitAudioContext;
      if (!AC) throw new Error('no-audio-context');
      const ctx = new AC();
      if (ctx.state === 'suspended' && ctx.resume) await ctx.resume();
      try { ctx.close?.(); } catch {}
    } catch {
      audioFailedRef.current = true;
      emit('audio_failed');
      announce('Audio unavailable. Visual cue enabled.');
      pushToast('Audio unavailable – visual cues only', 'warn');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pushToast is stable function, adding causes re-render
  }, [announce, emit]);

  // Restore persisted state on open
  React.useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return;
      interface PersistedDocV1 { schema_version: 1; engine?: { mode?: 'stopwatch'|'countdown'; running?: boolean; duration_ms?: number; accumulated_ms?: number; end_behavior?: 'auto-pause'|'stop'|'keep' }; time_refs?: { t0_wall?: number|null; deadline_wall?: number|null }; segments?: { spans?: Engine.Segment[]; laps?: Engine.Lap[] }; meta?: { seed?: string; created_at?: string }; }
      let docUnknown: unknown;
      try { docUnknown = JSON.parse(raw); } catch { emit('storage_failed'); announce('State restore failed; session paused.'); return; }
      if (typeof docUnknown !== 'object' || docUnknown === null) { emit('storage_failed'); announce('State restore failed; session paused.'); return; }
      let doc = docUnknown as Partial<PersistedDocV1 & { t0_wall?: number; deadline?: number }>;
      if (!('schema_version' in doc)) {
        const legacyDoc = doc as Partial<{ t0_wall?: number; deadline?: number }>;
        doc = { schema_version: 1, engine: doc.engine ?? {}, time_refs: { t0_wall: legacyDoc.t0_wall ?? null, deadline_wall: legacyDoc.deadline ?? null }, segments: doc.segments ?? {}, meta: doc.meta ?? {} };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(doc)); } catch {}
      }
      if (doc.schema_version !== 1) return;
      storageSeedRef.current = doc.meta?.seed ?? randomHex64();
      storageCreatedAtRef.current = doc.meta?.created_at ?? new Date().toISOString();
      const e = doc.engine ?? {}; const tr = doc.time_refs ?? {};
      const spans = (doc.segments?.spans ?? []) as Engine.Segment[];
      const laps = (doc.segments?.laps ?? []) as Engine.Lap[];
      const apply = (patch: Partial<Engine.TimerState>) => setT(prev => ({ ...prev, ...patch, laps, segments: spans.slice() }));
      const nowMono = performance.now(); const nowWall = Date.now();
      t0WallRef.current = (typeof tr.t0_wall === 'number') ? tr.t0_wall : null;
      deadlineWallRef.current = (typeof tr.deadline_wall === 'number') ? tr.deadline_wall : null;
      if (e.running === true) {
        if (e.mode === 'countdown' && deadlineWallRef.current) {
          const duration = Math.max(0, (e.duration_ms ?? 0));
          const remaining = Math.max(0, deadlineWallRef.current - nowWall);
          const elapsed = Math.max(0, duration - remaining);
          if (remaining > 0) {
            apply({ mode: 'countdown', phase: 'running', countdownInitialMs: duration, remainingMs: remaining });
            accumAtStartRef.current = elapsed; monoStartRef.current = nowMono; lastWallSampleRef.current = nowWall;
            emit('state_restored'); announce('State restored'); pushToast('State restored');
          } else {
            const zb = (e.end_behavior === 'auto-pause') ? 'pause' : (e.end_behavior === 'stop' ? 'finish' : 'keep');
            const phase: Engine.Phase = (zb === 'finish') ? 'finished' : (zb === 'pause' ? 'paused' : 'running');
            apply({ mode: 'countdown', phase, countdownInitialMs: duration, remainingMs: 0 });
            emit('state_restored'); announce('State restored'); pushToast('State restored');
          }
        } else if (e.mode === 'stopwatch' && t0WallRef.current) {
          const elapsed = Math.max(0, (e.accumulated_ms ?? 0) + Math.max(0, nowWall - t0WallRef.current));
          apply({ mode: 'stopwatch', phase: 'running', elapsedMs: elapsed });
          accumAtStartRef.current = elapsed; monoStartRef.current = nowMono; lastWallSampleRef.current = nowWall;
          emit('state_restored'); announce('State restored'); pushToast('State restored');
        }
      } else if (e.mode === 'countdown') {
        const duration = Math.max(0, (e.duration_ms ?? 0)); const remaining = Math.max(0, duration - (e.accumulated_ms ?? 0));
        apply({ mode: 'countdown', phase: 'paused', countdownInitialMs: duration, remainingMs: remaining }); announce('State restored'); emit('state_restored'); pushToast('State restored');
      } else {
        apply({ mode: 'stopwatch', phase: 'paused', elapsedMs: Math.max(0, (e.accumulated_ms ?? 0)) }); announce('State restored'); emit('state_restored'); pushToast('State restored');
      }
    } catch {
      storageDisabledRef.current = true; emit('storage_failed'); announce('Storage unavailable. Session will not persist.'); pushToast('Storage unavailable. Not persisted.', 'warn');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Capture baselines at start/resume
  React.useEffect(() => {
    if (!open) return;
    if (t.phase === 'running') {
      accumAtStartRef.current = Engine.progressMs(t);
      monoStartRef.current = performance.now();
      t0WallRef.current = Date.now();
      deadlineWallRef.current = (t.mode === 'countdown') ? (t0WallRef.current + Math.max(0, t.remainingMs)) : null;
      lastWallSampleRef.current = t0WallRef.current;
      schedulePersist('start-resume');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 't' object causes infinite re-renders, individual properties already tracked
  }, [open, t.phase, t.mode, t.remainingMs, schedulePersist, t.elapsedMs]);

  // Reconciliation (called on resume/visibility & periodic health check)
  const reconcileIfNeeded = React.useCallback((_reason: string) => {
    if (!open) return;
    const nowMono = performance.now(); const nowWall = Date.now();
    const accum = accumAtStartRef.current; const mono0 = monoStartRef.current;
    if (mono0 == null) { lastWallSampleRef.current = nowWall; return; }
    const elapsedPred = accum + Math.max(0, Math.round(nowMono - mono0));
    let elapsedWall = 0; const duration = Engine.totalDurationMs(t);
    if (t.mode === 'countdown' && deadlineWallRef.current) {
      const remaining = Math.max(0, deadlineWallRef.current - nowWall);
      elapsedWall = Math.max(0, duration - remaining);
    } else {
      const t0w = t0WallRef.current ?? nowWall; elapsedWall = Math.max(0, (t.mode === 'stopwatch') ? (accum + Math.max(0, nowWall - t0w)) : elapsedPred);
    }
    const delta = Math.abs(elapsedWall - elapsedPred);
    const clockJump = (Math.abs(nowWall - lastWallSampleRef.current) > 5 * 60 * 1000) && (delta > 5000);
    if (delta > 500) {
      // Snap engine to wall time
      setT(prev => {
        if (prev.mode === 'stopwatch') {
          return { ...prev, elapsedMs: elapsedWall };
        }
        const remaining = Math.max(0, duration - elapsedWall);
        if (remaining === 0) {
          if (prev.zeroBehavior === 'finish') return { ...prev, remainingMs: 0, phase: 'finished' };
          if (prev.zeroBehavior === 'pause') return { ...prev, remainingMs: 0, phase: 'paused' };
          return { ...prev, remainingMs: 0 };
        }
        return { ...prev, remainingMs: remaining };
      });
      schedulePersist('reconcile');
      accumAtStartRef.current = elapsedWall; monoStartRef.current = nowMono;
      const secs = Math.round(delta/100)/10;
      announce(`Time reconciled after sleep (Δ ${secs} s)`);
      pushToast(`Reconciled Δ ${secs}s`);
      emit('desync_detected', { pred: elapsedPred, wall: elapsedWall, delta });
      if (clockJump) emit('clock_jump_detected');
    }
    lastWallSampleRef.current = nowWall;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 't' object and pushToast cause infinite re-renders, individual properties already tracked
  }, [open, setT, t.mode, t.zeroBehavior, announce, emit, t.remainingMs, schedulePersist]);

  // Visibility/focus hooks
  React.useEffect(() => {
    if (!open) return undefined;
    const onVis = () => { if (document.visibilityState === 'visible') reconcileIfNeeded('visibility'); };
    const onFocus = () => reconcileIfNeeded('focus');
    window.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [open, reconcileIfNeeded]);

  // Health check every ~15s while running
  React.useEffect(() => {
    if (!open || t.phase !== 'running') return undefined;
    const id = window.setInterval(() => reconcileIfNeeded('health'), 15000) as unknown as number;
    return () => {
      window.clearInterval(id);
    };
  }, [open, t.phase, reconcileIfNeeded]);

  // No custom portal container; document.body is sufficient

  // Scroll lock + focus setup
  React.useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = window.setTimeout(() => {
      if (!cardRef.current) return;
      const focusables = Array.from(cardRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(n => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden'));
      // Default focus policy per spec:
      // - Running: Primary (Pause)
      // - Paused: Primary (Resume)
      // - Armed but idle (countdown minutes > 0): Primary (Start)
      // - Otherwise: first interactive in header (Mute)
      const armedIdle = t.phase === 'idle' && t.mode === 'countdown' && Math.round(t.countdownInitialMs / 60000) > 0;
      let target: HTMLElement | null | undefined = null;
      if (t.phase === 'running' || t.phase === 'paused' || armedIdle) {
        target = primaryRef.current;
      } else {
        target = cardRef.current.querySelector(`.${styles.headerActions} button`) as HTMLElement | null;
      }
      if (!target) target = focusables[0] || (cardRef.current as HTMLElement);
      try { target?.focus(); } catch {}
    }, 0);
    // eslint-disable-next-line consistent-return -- useEffect cleanup doesn't need explicit void return
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      try { lastFocused.current?.focus(); } catch { /* Focus restoration failed */ }
    };
  }, [open, t.phase, t.mode, t.countdownInitialMs]);

  // Helpers for laps + summary (stable identities for key handler deps)
  const lapRows = React.useCallback(() => {
    const rows: { id: string; idx: number; atMs: number; splitMs: number; label?: string }[] = [];
    let prev = 0;
    t.laps.forEach((l, i) => {
      const split = Math.max(0, l.atMs - prev);
      prev = l.atMs;
      const base = { id: l.id, idx: i + 1, atMs: l.atMs, splitMs: split };
      rows.push(l.label !== undefined ? { ...base, label: l.label } : base);
    });
    return rows;
  }, [t.laps]);
  const buildCSV = React.useCallback(() => {
    const rows = lapRows();
    const lines = ["index,total,split,label"];
    rows.forEach(r => {
      const total = Engine.fmtHMS(r.atMs);
      const split = fmtMMSS(r.splitMs);
      const label = csvQuote(r.label ?? "");
      lines.push(`${r.idx},${total},${split},${label}`);
    });
    return lines.join("\n");
  }, [lapRows]);
  const copyLiveSummary = React.useCallback(() => {
    const rec = Audit.buildFromState(t, Date.now(), Date.now());
    const md = Audit.summaryMarkdown(rec);
    let ok = false;
    try { navigator.clipboard?.writeText(md); ok = true; } catch {}
    if (!ok) {
      // Fallback: select-and-copy for environments without Clipboard API permissions
      try {
        const ta = document.createElement('textarea');
        ta.value = md; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        ok = true;
      } catch { ok = false; }
    }
    try {
      if (srRef.current) srRef.current.textContent = ok ? 'Copied summary Markdown.' : 'Copy failed; content selected for manual copy.';
    } catch {}
    try { window.dispatchEvent(new CustomEvent("therapy-timer:summary", { detail: { markdown: md } })); } catch {}
  }, [t]);
  const downloadMD = React.useCallback(() => {
    const md = buildDeterministicMDFromState(t);
    downloadText(`therapy-timer-${Date.now()}.md`, md, "text/markdown;charset=utf-8");
    try { addTeleEvent('export_md', { export_kind: 'md' }); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- addTeleEvent is stable callback, adding causes re-render
  }, [t]);

  // Custom editor state (hoisted for keyboard deps)
  const [customOpen, setCustomOpen] = React.useState(false);

  // (Moved keyboard handler below announce + onLapTagged to satisfy declaration order)

  // No local driving or end-cue — handled by global provider
  // Note: avoid early returns before all hooks; we gate rendering later.
  // debug: silent

  // Close guard while running
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  React.useEffect(() => {
    if (confirmOpen) {
      const id = window.setTimeout(() => { try { confirmCancelRef.current?.focus(); } catch {} }, 0);
      return () => { window.clearTimeout(id); };
    }
    return undefined;
  }, [confirmOpen]);
  const overlayClick = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    if (t.phase === 'running') { setConfirmOpen(true); return; }
    handleClose();
  };

  // Animated close handler
  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  // Handlers
  const onStartPause = async () => {
    if (!running) { await ensureAudio(); bus.publish('start', { mode: t.mode }); }
    else { bus.publish('pause', { elapsed_ms: Engine.progressMs(t) }); }
    if (running) {
      pause();
    } else {
      start();
    }
    schedulePersist('start-pause');
  };
  const onReset = () => { bus.publish('reset', { prev_phase: t.phase }); addTeleEvent('reset'); resetTelemetry(); reset(); schedulePersist('reset', true); };
  // Tag laps with current active segment name
  const onLapTagged = () => {
    const label = activeSegment ? capitalize(activeSegment) : undefined;
    lap(label);
    bus.publish('lap', { lap_index: t.laps.length + 1, elapsed_ms: Engine.progressMs(t) });
    announce(`Lap ${t.laps.length + 1} recorded`);
    schedulePersist('lap');
  };

  // Radial context menu state (desktop right-click on hero)
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });
  const contextMenuRef = React.useRef<HTMLDivElement | null>(null);
  const handleContextMenu = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Radial ring geometry
  const radius = 140; // px
  const itemSize = 48; // px (button diameter)
    const padding = 16; // Safe padding from viewport edges

    // Click position relative to viewport
    let x = e.clientX;
    let y = e.clientY;

    // Clamp center so that the full ring stays inside viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = radius + itemSize / 2 + padding;
    x = Math.max(margin, Math.min(x, viewportWidth - margin));
    y = Math.max(margin, Math.min(y, viewportHeight - margin));

    setContextMenuPos({ x, y });
    setContextMenuOpen(true);
  }, []);
  const contextMenuAction = React.useCallback((action: string, value?: string) => {
    setContextMenuOpen(false);
    switch (action) {
      case 'lap':
        if (t.phase === 'running' || Engine.progressMs(t) > 0) {
          onLapTagged();
        }
        break;
      case 'pause-resume':
        if (t.phase === 'running') pause();
        else if (t.phase === 'paused') start();
        break;
      case 'segment':
        // Activate selected segment immediately by closing current span and starting a new one
        if (value) {
          const seg = (value || '').toLowerCase();
          const ok = ['assessment', 'therapy', 'break', 'documentation'] as const;
          if ((ok as readonly string[]).includes(seg)) {
            setT(prev => Engine.startSegment(prev, seg as Engine.SegmentKind));
            try { bus.publish('segment_change', { segment: capitalize(seg) }); } catch {}
            announce(`${capitalize(seg)} segment active`);
            schedulePersist('segment-change');
          }
        }
        break;
      case 'reset':
        reset();
        break;
      case 'copy-md':
        copyLiveSummary();
        break;
      case 'copy-json':
        try {
          const { payload } = buildCanonicalPayload(t, Date.now());
          const json = JSON.stringify(payload, null, 2);
          navigator.clipboard?.writeText(json);
          announce('Copied JSON to clipboard.');
        } catch {}
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bus and setT cause infinite re-renders, buildCanonicalPayload is outer scope value
  }, [t, onLapTagged, pause, start, schedulePersist, reset, copyLiveSummary, announce, buildCanonicalPayload]);
  // Click-outside dismissal for context menu
  React.useEffect(() => {
    if (!contextMenuOpen) return undefined;
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [contextMenuOpen]);
  // Esc key dismissal for context menu
  React.useEffect(() => {
    if (!contextMenuOpen) return undefined;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenuOpen]);

  // Adjust context menu position after render based on actual dimensions
  React.useEffect(() => {
    if (!contextMenuOpen || !contextMenuRef.current) return;
    
    const menu = contextMenuRef.current;
    const rect = menu.getBoundingClientRect();
    const padding = 8;
    
    let needsAdjustment = false;
    let newX = contextMenuPos.x;
    let newY = contextMenuPos.y;
    
    // Check right overflow
    if (rect.right > window.innerWidth - padding) {
      newX = window.innerWidth - rect.width - padding;
      needsAdjustment = true;
    }
    
    // Check bottom overflow
    if (rect.bottom > window.innerHeight - padding) {
      newY = window.innerHeight - rect.height - padding;
      needsAdjustment = true;
    }
    
    // Check left overflow
    if (rect.left < padding) {
      newX = padding;
      needsAdjustment = true;
    }
    
    // Check top overflow
    if (rect.top < padding) {
      newY = padding;
      needsAdjustment = true;
    }
    
    if (needsAdjustment) {
      setContextMenuPos({ x: newX, y: newY });
    }
  }, [contextMenuOpen, contextMenuPos.x, contextMenuPos.y]);

  // Scoped keyboard + focus trap handler (bubble phase)
  const onDialogKey = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    const target = e.target as HTMLElement;
    const role = target.getAttribute('role');
    const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (t.phase === 'running') { setConfirmOpen(true); } else { handleClose(); }
      return;
    }
    if (e.key === 'Tab') {
      if (!cardRef.current) return;
      const nodes = Array.from(cardRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        .filter(n => !n.hasAttribute('disabled') && !n.getAttribute('aria-hidden'));
      if (!nodes.length) { e.preventDefault(); (cardRef.current as HTMLElement).focus(); return; }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    if (typing) return;
    // Queue keyboard controls
    const isInQueue = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      if (el.hasAttribute('data-queue-list') || el.hasAttribute('data-queue-id')) return true;
      return el.parentElement ? isInQueue(el.parentElement as HTMLElement) : false;
    };
    // Toggle queue panel (Q)
    if (e.key.toLowerCase() === 'q' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setQueueOpen(prev => {
        const next = !prev;
        try { if (queue) queue.panelOpenRef.current = next; } catch {}
        bus.publish('queue_toggle', { open: next });
        announce(`Queue ${next ? 'open' : 'closed'}`);
        if (next) setTimeout(() => { try { cardRef.current?.querySelector<HTMLElement>('[data-queue-list]')?.focus(); } catch {} }, 0);
        return next;
      });
      return;
    }
    // Enter starts next item when focus is in queue
    if (e.key === 'Enter' && isInQueue(target)) {
      e.preventDefault();
      if (!queue || !queue.state.items.length) { announce('Queue empty'); return; }
      const head = queue.state.items[0];
      // Hydrate timer from queued item
      const zbMap: Record<string, Engine.ZeroBehavior> = { 'stop': 'finish', 'auto-pause': 'pause', 'keep': 'keep' } as const;
      if (head.mode === 'countdown' && (head.duration_ms || 0) > 0) {
        const mins = Math.max(0, Math.round((head.duration_ms || 0) / 60000));
        setModeCountdown();
        setCountdownMinutes(mins);
        bus.publish('preset_armed', { preset_minutes: mins });
      } else {
        onModeStopwatch();
      }
      if (head.segment) {
        const seg = (head.segment || '').toLowerCase();
        const ok = ['assessment','therapy','break','documentation'] as const;
        if ((ok as readonly string[]).includes(seg)) {
          setT(prev => Engine.startSegment(prev, seg as Engine.SegmentKind));
          bus.publish('segment_change', { segment: capitalize(seg) });
        }
      }
      if (head.end_behavior) setZeroBehavior(zbMap[head.end_behavior] || 'finish');
      // Pop from queue and optionally start
      queue.startNext();
      if (head.policy === 'auto') { ensureAudio(); start(); }
      announce(`${head.policy === 'auto' ? 'Started' : 'Armed'} queued timer${head.label ? `: ${head.label}` : ''}`);
      schedulePersist('queue-start');
      return;
    }
    // Delete removes focused queue item
    if ((e.key === 'Delete' || e.key === 'Backspace') && isInQueue(target)) {
      const el = (target.closest('[data-queue-id]') as HTMLElement | null);
      if (el?.dataset?.queueId && queue) {
        e.preventDefault();
        queue.remove(el.dataset.queueId);
        announce('Removed queued item');
        return;
      }
    }
    // Alt+Arrow reorder focused queue item
    if (e.altKey && isInQueue(target) && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && queue) {
      const el = (target.closest('[data-queue-id]') as HTMLElement | null);
      const idx = el?.dataset?.queueIndex ? parseInt(el.dataset.queueIndex, 10) : NaN;
      if (Number.isFinite(idx)) {
        e.preventDefault();
        const to = e.key === 'ArrowUp' ? Math.max(0, idx - 1) : Math.min(queue.state.items.length - 1, idx + 1);
        if (to !== idx) { queue.reorder(idx, to); bus.publish('queue_reorder', { from: idx, to }); announce(`Moved item to position ${to + 1}`); setTimeout(()=>{
          try { const next = cardRef.current?.querySelector<HTMLElement>(`[data-queue-index="${to}"]`); next?.focus(); } catch {}
        }, 0); }
        return;
      }
    }
  if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAuditOpen(v => !v); return; }
  // Radical toggles
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(v=>!v); return; }
  if (e.altKey && (e.key === 'r' || e.key === 'R')) { e.preventDefault(); setRibbonVisible(v=>!v); return; }
  if (e.altKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); if (activeSegment==='break') setBreathOn(v=>!v); return; }
    if (e.code === 'Space') {
      if (role === 'radio') return; // allow radio selection
      e.preventDefault();
      if (t.phase === 'running') { bus.publish('pause', { elapsed_ms: Engine.progressMs(t) }); pause(); schedulePersist('pause'); }
      else { ensureAudio(); bus.publish('start', { mode: t.mode }); start(); schedulePersist('start'); }
      return;
    }
  if ((e.key === 'l' || e.key === 'L') && t.phase === 'running') { e.preventDefault(); onLapTagged(); return; }
  if ((e.key === 'r' || e.key === 'R') && (t.phase === 'paused' || t.phase === 'finished')) { e.preventDefault(); reset(); schedulePersist('reset', true); return; }
  if (e.key === 'c' || e.key === 'C') { e.preventDefault(); try { navigator.clipboard?.writeText(buildCSV()); } catch {} return; }
  if (e.shiftKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); downloadMD(); return; }
  if (e.key === 's' || e.key === 'S') { e.preventDefault(); copyLiveSummary(); return; }
    if (!e.ctrlKey && !e.metaKey && !e.altKey && isCountdown && t.phase !== 'running') {
      if (e.key === '1') { e.preventDefault(); setCountdownMinutes(10); bus.publish('preset_armed',{preset_minutes:10}); announce('Countdown armed 10 minutes'); schedulePersist('preset'); return; }
      if (e.key === '2') { e.preventDefault(); setCountdownMinutes(25); bus.publish('preset_armed',{preset_minutes:25}); announce('Countdown armed 25 minutes'); schedulePersist('preset'); return; }
      if (e.key === '3') { e.preventDefault(); setCountdownMinutes(45); bus.publish('preset_armed',{preset_minutes:45}); announce('Countdown armed 45 minutes'); schedulePersist('preset'); return; }
      if (e.key === '4') { e.preventDefault(); setCountdownMinutes(50); bus.publish('preset_armed',{preset_minutes:50}); announce('Countdown armed 50 minutes'); schedulePersist('preset'); return; }
      if (e.key === '5') { e.preventDefault(); setCustomOpen(true); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeSegment, bus, handleClose, onModeStopwatch, queue, setModeCountdown, setT, setZeroBehavior, t cause infinite re-renders
  }, [open, t.phase, isCountdown, setCountdownMinutes, setCustomOpen, onClose, start, pause, reset, buildCSV, downloadMD, copyLiveSummary, announce, onLapTagged, schedulePersist, ensureAudio]);

  // Presets: debounce, guard while running
  const lastPresetClickRef = React.useRef<number>(0);
  const setPreset = (m: number) => {
    if (t.mode === "countdown" && running) {
      announce("Pause to change presets.");
      return;
    }
    const now = Date.now();
    if (now - lastPresetClickRef.current < 150) return;
    lastPresetClickRef.current = now;
    setCountdownMinutes(m);
    bus.publish('preset_armed', { preset_minutes: m });
    announce(`Countdown armed ${m} minutes`);
    schedulePersist('preset');
  };
  // Mode guard: announce instead of switching while running
  const onModeStopwatch = () => {
    if (running && t.mode !== "stopwatch") { announce("Pause to switch mode."); return; }
    setModeStopwatch();
    schedulePersist('mode');
  };
  const onModeCountdown = () => {
    if (running && t.mode !== "countdown") { announce("Pause to switch mode."); return; }
    setModeCountdown();
    schedulePersist('mode');
  };
  // Custom editor state
  const [customValue, setCustomValue] = React.useState<string>("");
  const [customError, setCustomError] = React.useState<string>("");
  const customInputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    let id: number | undefined;
    if (customOpen) {
      const m = Math.max(0, Math.round(t.countdownInitialMs / 60000));
      const ss = (Math.max(0, Math.round((t.countdownInitialMs % 60000) / 1000))).toString().padStart(2, "0");
      setCustomValue(`${m}:${ss}`);
      setCustomError("");
      id = window.setTimeout(() => customInputRef.current?.focus(), 0) as unknown as number;
    }
    return () => { if (id) window.clearTimeout(id); };
  }, [customOpen, t.countdownInitialMs]);

  function parseHms(input: string): number | null {
    const s = input.trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) {
      const m = parseInt(s, 10);
      return Number.isFinite(m) ? m * 60 * 1000 : null;
    }
    const secOnly = s.match(/^\s*(\d+)\s*s\s*$/i);
    if (secOnly) {
      const sec = parseInt(secOnly[1], 10);
      if (!Number.isFinite(sec)) return null;
      return sec * 1000;
    }
    const parts = s.split(":").map(p => p.trim());
    if (parts.length === 2 || parts.length === 3) {
      let h = 0, m = 0, sec = 0;
      if (parts.length === 2) { [m, sec] = parts.map(n => parseInt(n, 10)); }
      else { [h, m, sec] = parts.map(n => parseInt(n, 10)); }
      if (![h, m, sec].every(n => Number.isFinite(n) && n >= 0)) return null;
      const totalMs = ((h * 3600) + (m * 60) + sec) * 1000;
      return totalMs;
    }
    return null;
  }
  function commitCustom() {
    const ms = parseHms(customValue);
    if (ms == null) {
      setCustomError("Enter time as M, MM:SS, or H:MM:SS");
      announce("Invalid time. Use M, MM:SS, or H:MM:SS.");
      return;
    }
    const clamped = Math.max(1000, Math.min(12 * 3600 * 1000, ms));
    setCountdownMinutes(Math.round(clamped / 60000));
    setCustomOpen(false);
    schedulePersist('custom');
  }
  const onCustomKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") { e.preventDefault(); commitCustom(); }
    if (e.key === "Escape") { e.preventDefault(); setCustomOpen(false); }
  };

  const countdownMinutes = Math.round(t.countdownInitialMs / 60000);

  // Legacy single-ring values no longer used after dual-ring update

  // Header chips
  const phaseLabel = t.phase === "running" ? "Running" : t.phase === "paused" ? "Paused" : "Idle";

  // (srRef hook moved above)

  // Helpers for laps + summary
  // (moved above for stable hook order and effect deps)
  async function downloadJSON() {
    const now = Date.now();
    try {
      setExportBusy(true);
      const { payload } = buildCanonicalPayload(t, now);
      const effective = await scrubJSON(payload, redactOpts);
      const jsonOut = JSON.stringify(effective);
      const checksum = await hashWithWorker(jsonOut);
      const envelope = JSON.stringify({ checksum, payload: JSON.parse(jsonOut) });
      downloadText(`therapy-timer-${now}.json`, envelope, "application/json;charset=utf-8");
      announce(`Exported JSON (${redactOpts.master ? 'redacted' : 'full'})`);
      try { addTeleEvent('export_json', { export_kind: 'json' }); } catch {}
    } catch {
      announce('Export unavailable. Redaction error.');
    } finally { setExportBusy(false); }
  }
  /* removed unused printSummary (was never called) */
  function insertIntoNote() {
    const md = buildDeterministicMDFromState(t);
    try { window.dispatchEvent(new CustomEvent("therapy-timer:insert-into-note", { detail: { markdown: md } })); } catch {}
  }

  // Import helpers (append to encounter note slots)
  // Undo stack for imported blocks (summary/plan) — enables single-level undo.
  const undoStackRef = React.useRef<Array<{ type: 'summary' | 'plan'; text: string }>>([]);
  function importSessionSummary() {
    if (!patient || !encounter || !regActions) { announce('No patient selected'); return; }
    // Total duration (elapsed or countdown consumed)
    const totalMs = t.mode === 'countdown' ? (t.countdownInitialMs - t.remainingMs) : t.elapsedMs;
    const durMin = Math.floor(totalMs / 60000);
    const durSec = Math.floor((totalMs % 60000) / 1000);
    const segLines = t.segments.map(seg => {
      const endMs = seg.endMs ?? t.elapsedMs;
      const d = Math.max(0, endMs - seg.startMs);
      const m = Math.floor(d / 60000); const s = Math.floor((d % 60000) / 1000);
      return `• ${capitalize(seg.kind)}: ${m}m ${s}s`;
    });
    const summaryBlock = [
      'Therapy Session Summary',
      `Total time: ${durMin}m ${durSec}s`,
      'Segments:',
      ...segLines,
    ].join('\n');
    try {
      const payload = `${summaryBlock}\n`;
      regActions.setEncounterSlots(patient.id, encounter.id, { summary: payload });
      undoStackRef.current.push({ type: 'summary', text: payload });
      // Snapshot after import for audit/review
      try { regActions.createEncounterSnapshot?.(patient.id, encounter.id, encounter.noteSlots); } catch { /* Snapshot failed, non-critical */ }
      announce('Session summary imported to patient encounter');
    } catch {
      announce('Failed importing summary');
    }
  }
  function importNotesToPlan() {
    if (!patient || !encounter || !regActions) { announce('No patient selected'); return; }
    const notes = (notesValue || '').trim();
    if (!notes) { announce('Notes empty'); return; }
    const block = ['Therapy Session Notes:', notes].join('\n');
    try {
      const payload = `${block}\n`;
      regActions.setEncounterSlots(patient.id, encounter.id, { plan: payload });
      undoStackRef.current.push({ type: 'plan', text: payload });
      try { regActions.createEncounterSnapshot?.(patient.id, encounter.id, encounter.noteSlots); } catch { /* Snapshot failed, non-critical */ }
      announce('Notes imported to patient encounter');
    } catch {
      announce('Failed importing notes');
    }
  }

  function undoLastImport() {
    const entry = undoStackRef.current.pop();
    if (!entry || !patient || !encounter || !regActions) { announce('Nothing to undo'); return; }
  // EncounterSlots may allow additional keys; treat as flexible record with optional known keys
  const slots = (encounter.noteSlots || {}) as (Record<string, unknown> & { summary?: string; plan?: string });
    const current = String(slots[entry.type] || '');
    const text = entry.text;
    let next = current;
    if (current.endsWith(text)) {
      next = current.slice(0, current.length - text.length);
    } else {
      // Fallback: remove first occurrence
      const idx = current.lastIndexOf(text.trim());
      if (idx >= 0) {
        next = (current.slice(0, idx) + current.slice(idx + text.trim().length)).trimEnd();
      }
    }
    try {
      regActions.setEncounterSlots(patient.id, encounter.id, { [entry.type]: next });
      announce('Last import undone');
    } catch { announce('Undo failed'); }
  }

  // Accumulate session time on close (handled via effect watching open flag) — single mount lifecycle.
  const baselineMsRef = React.useRef<number>(0);
  React.useEffect(() => {
    if (open) {
      // Capture baseline consumed
      const consumed = t.mode === 'countdown' ? (t.countdownInitialMs - t.remainingMs) : t.elapsedMs;
      baselineMsRef.current = consumed;
    }
    return () => {
      if (!open && patient && encounter && regActions) {
        const consumed = t.mode === 'countdown' ? (t.countdownInitialMs - t.remainingMs) : t.elapsedMs;
        const delta = Math.max(0, consumed - baselineMsRef.current);
        if (delta > 0) {
          try { regActions.addEncounterSessionMs(patient.id, encounter.id, delta); } catch {}
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Avoid early return before hooks (was causing hook order mismatch when `open` toggled).
  // We'll conditionally render nothing at the bottom instead.
  // (Removed duplicate isOpen declaration - now defined before return statement)
  
  // ---------- Timeline ribbon state ----------
  const [ribbonVisible, setRibbonVisible] = React.useState(false);
  const ribbonRef = React.useRef<SVGSVGElement | null>(null);
  const ribbonPlayheadRef = React.useRef<SVGLineElement | null>(null);
  const lastRAF = React.useRef<number | null>(null);
  React.useEffect(()=>{
    if(!ribbonVisible || !ribbonRef.current) return;
    const svg = ribbonRef.current; const ph = ribbonPlayheadRef.current; if(!ph) return;
    const reduced = reducedMotion;
    const loop = () => {
      if(!ph) return;
      const total = t.mode==='countdown'? Math.max(1, t.countdownInitialMs) : Math.max(1, t.elapsedMs);
      const prog = t.mode==='countdown'? (t.countdownInitialMs - t.remainingMs) : t.elapsedMs;
      const pct = Math.min(1, Math.max(0, prog/total));
      const w = svg.viewBox.baseVal.width || svg.clientWidth || 1000;
      const x = pct * w;
      ph.setAttribute('x1', String(x)); ph.setAttribute('x2', String(x));
      if(!reduced) lastRAF.current = requestAnimationFrame(loop);
    };
    let intervalId: number | undefined;
    if(reduced) {
      intervalId = window.setInterval(loop,1000) as unknown as number;
    } else {
      lastRAF.current = requestAnimationFrame(loop);
    }
    // eslint-disable-next-line consistent-return -- useEffect cleanup doesn't need explicit void return
    return () => {
      if(intervalId !== undefined) void window.clearInterval(intervalId);
      if(lastRAF.current) void cancelAnimationFrame(lastRAF.current);
    };
  }, [ribbonVisible, t.mode, t.countdownInitialMs, t.remainingMs, t.elapsedMs, reducedMotion]);
  // (ribbon spans and laps are computed inline during render for simplicity)

  // ---------- Breath guide ----------
  const [breathOn, setBreathOn] = React.useState(false);
  const [breathPattern, setBreathPattern] = React.useState<'even'|'478'>('even');
  const breathRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(()=>{ if(!breathOn || activeSegment!=='break') return undefined; let id:number|undefined; const start = performance.now();
    const pattern = breathPattern==='even'? { inhale:4, hold:0, exhale:6 } : { inhale:4, hold:7, exhale:8 };
    const cycle = (pattern.inhale + pattern.hold + pattern.exhale) * 1000;
  const fillEl = breathRef.current?.querySelector<HTMLElement>(`.${styles.breathFill}`);
    const reduced = reducedMotion;
    const stepEl = breathRef.current?.querySelector<HTMLElement>('.breathStep');
    const loop = () => {
      const now = performance.now(); const d = (now - start) % cycle;
      let phase = 'inhale'; let phaseStart = 0; let phaseDur = pattern.inhale*1000;
      if(d >= phaseDur) { phase = 'hold'; phaseStart = phaseDur; phaseDur = pattern.hold*1000; }
      if(pattern.hold===0 && phase==='hold') { phase='exhale'; phaseStart = pattern.inhale*1000; phaseDur = pattern.exhale*1000; }
      if(d >= phaseStart + phaseDur) { phase='exhale'; phaseStart = pattern.inhale*1000 + pattern.hold*1000; phaseDur = pattern.exhale*1000; }
      const pct = phaseDur? ((d - phaseStart)/phaseDur) : 0;
      if(fillEl && !reduced) {
        let widthPct = 0;
        if(phase==='inhale') widthPct = pct;
        else if(phase==='hold') widthPct = 1;
        else if(phase==='exhale') widthPct = 1 - pct;
  fillEl.style.width = `${(widthPct*100).toFixed(2)}%`;
      }
      if(reduced && stepEl) {
        const phaseSecs = phase==='inhale'?pattern.inhale:phase==='hold'?pattern.hold:pattern.exhale;
        const secIdx = Math.min(phaseSecs, Math.floor((d - phaseStart)/1000)+1);
        stepEl.textContent = `${phase[0].toUpperCase()+phase.slice(1)} ${secIdx}/${phaseSecs}`;
      }
      id = reduced? undefined : requestAnimationFrame(loop) as unknown as number;
  }; loop(); return () => {
    if(id) cancelAnimationFrame(id);
  };
  }, [breathOn, breathPattern, activeSegment, reducedMotion]);

  // ---------- Command palette ----------
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [cmdValue, setCmdValue] = React.useState('');
  const [cmdPreview, setCmdPreview] = React.useState<string>('');
  const paletteInputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(()=>{
    if(!paletteOpen) return undefined;
    const id = window.setTimeout(()=> paletteInputRef.current?.focus(),0) as unknown as number;
    return () => {
      window.clearTimeout(id);
    };
  }, [paletteOpen]);
  const parseCommand = React.useCallback((raw:string) => {
    const s = raw.trim(); if(!s) return '';
    // Slash presets
    if(/^\/(10|25|45|50)$/.test(s)) { const mm = parseInt(s.slice(1),10); return `Arm countdown ${mm}:00`; }
  // Simple time forms (parsed via specific regexes below)
    const lower = s.toLowerCase();
    // capture time token
  const timeMatch = lower.match(/^(\d+)(m|min)$/) || lower.match(/^(\d+)(s|sec)$/) || lower.match(/^(\d+)(h|hr)$/);
  if(timeMatch){ const val = parseInt(timeMatch[1],10); const unit = timeMatch[2]; const mm = unit.startsWith('h')? val*60 : unit.startsWith('s')? Math.max(1, Math.round(val/60)) : val; return `Arm countdown ${mm}:00`; }
    if(/^stopwatch$/.test(lower)) return 'Switch to Stopwatch';
    if(/^countdown\s+(\d+)m/.test(lower)) { const mm = parseInt(RegExp.$1,10); return `Arm countdown ${mm}:00`; }
    // Natural "25m therapy"
    const nat = lower.match(/^(\d+)m\s+(assessment|therapy|break|documentation)$/);
    if(nat){ return `Arm ${nat[1]}:00 + segment ${nat[2]}`; }
    const segOnly = lower.match(/^segment\s+(assessment|therapy|break|documentation)$/);
    if(segOnly){ return `Segment ${segOnly[1]}`; }
    if(/^(start|pause|reset|lap)$/.test(lower)) return `Action ${lower}`;
    if(/^(mute\s+on|mute\s+off)$/.test(lower)) return `Mute ${lower.endsWith('on')?'on':'off'}`;
    if(/^(redaction\s+on|redaction\s+off)$/.test(lower)) return `Redaction ${lower.endsWith('on')?'on':'off'}`;
    return '';
  }, []);
  React.useEffect(()=>{ setCmdPreview(parseCommand(cmdValue)); }, [cmdValue, parseCommand]);
  const applyCommand = React.useCallback(()=>{
    const raw = cmdValue.trim().toLowerCase(); if(!raw) return;
    const announceAndTele = (msg:string)=>{ announce(msg); addTeleEvent('command',{ command_text: raw }); };
    if(/^\/(10|25|45|50)$/.test(raw)) { const mm = parseInt(raw.slice(1),10); setCountdownMinutes(mm); schedulePersist('preset'); announceAndTele(`Armed ${mm}:00 countdown`); setPaletteOpen(false); setCmdValue(''); return; }
    if(/^stopwatch$/.test(raw)) { if(t.mode!=='stopwatch'){ if(t.phase==='running'){ announce('Pause to switch mode?'); } else { setModeStopwatch(); schedulePersist('mode'); announceAndTele('Mode stopwatch'); } } setPaletteOpen(false); setCmdValue(''); return; }
    const cdNat = raw.match(/^countdown\s+(\d+)m$/); if(cdNat){ const mm=parseInt(cdNat[1],10); if(t.phase==='running' && t.mode==='stopwatch'){ announce('Pause to switch mode?'); } else { setCountdownMinutes(mm); setModeCountdown(); schedulePersist('mode'); announceAndTele(`Countdown ${mm}:00 armed`); } setPaletteOpen(false); setCmdValue(''); return; }
  const nat = raw.match(/^(\d+)m\s+(assessment|therapy|break|documentation)$/); if(nat){ const mm=parseInt(nat[1],10); if(t.phase==='running' && t.mode==='stopwatch'){ announce('Pause to switch mode?'); } else { setCountdownMinutes(mm); setModeCountdown(); setT(prev=>Engine.startSegment(prev, nat[2] as Engine.SegmentKind)); bus.publish('segment_change', { segment: capitalize(nat[2]) }); schedulePersist('preset'); announceAndTele(`Armed ${mm}:00 + ${nat[2]}`); } setPaletteOpen(false); setCmdValue(''); return; }
  const segOnly = raw.match(/^segment\s+(assessment|therapy|break|documentation)$/); if(segOnly){ setT(prev=>Engine.startSegment(prev, segOnly[1] as Engine.SegmentKind)); bus.publish('segment_change', { segment: capitalize(segOnly[1]) }); schedulePersist('segment'); announceAndTele(`Segment ${segOnly[1]}`); setPaletteOpen(false); setCmdValue(''); return; }
    if(/^lap$/.test(raw)){ if(t.phase==='running'){ onLapTagged(); announceAndTele('Lap added'); } setPaletteOpen(false); setCmdValue(''); return; }
    if(/^start$/.test(raw)){ if(t.phase!=='running'){ ensureAudio(); start(); schedulePersist('start'); announceAndTele('Started'); } setPaletteOpen(false); setCmdValue(''); return; }
    if(/^pause$/.test(raw)){ if(t.phase==='running'){ pause(); schedulePersist('pause'); announceAndTele('Paused'); } setPaletteOpen(false); setCmdValue(''); return; }
    if(/^reset$/.test(raw)){ reset(); schedulePersist('reset',true); announceAndTele('Reset'); setPaletteOpen(false); setCmdValue(''); return; }
    if(/^mute\s+on$/.test(raw)){ setMuted(true); schedulePersist('mute'); announceAndTele('Mute on'); setPaletteOpen(false); setCmdValue(''); return; }
    if(/^mute\s+off$/.test(raw)){ setMuted(false); schedulePersist('mute'); announceAndTele('Mute off'); setPaletteOpen(false); setCmdValue(''); return; }
    if(/^redaction\s+on$/.test(raw)){ setRedactOn(true); announceAndTele('Redaction on'); setPaletteOpen(false); setCmdValue(''); return; }
  if(/^redaction\s+off$/.test(raw)){ setRedactOn(false); announceAndTele('Redaction off'); setPaletteOpen(false); setCmdValue(''); }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- bus is EventEmitter, adding to deps causes infinite re-renders
  }, [cmdValue, t.phase, t.mode, setCountdownMinutes, setModeCountdown, setModeStopwatch, setT, schedulePersist, onLapTagged, ensureAudio, start, pause, reset, setMuted, setRedactOn, announce, addTeleEvent]);

  // Hotkeys for consolidated export actions (Alt+I/M/J/L/S/P) — placed after dependencies are declared
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      const k = e.key.toLowerCase();
      const stop = () => { e.preventDefault(); e.stopPropagation(); };
      if (k === 'i') {
        stop();
        // Inline insert into note
        const md = buildDeterministicMDFromState(t);
        try { window.dispatchEvent(new CustomEvent("therapy-timer:insert-into-note", { detail: { markdown: md } })); } catch {}
        return;
      }
      if (k === 'm') {
        stop();
        (async () => {
          setExportBusy(true);
          try {
            let md = buildDeterministicMDFromState(t);
            md = await scrubText(md, redactOpts);
            const { payload } = buildCanonicalPayload(t, Date.now());
            const effective = await scrubJSON(payload, redactOpts);
            const checksum = await hashWithWorker(JSON.stringify(effective));
            md += `\n\nChecksum: ${checksum}\nRedaction: ${redactOpts.master ? 'ON' : 'OFF'}`;
            downloadText(`therapy-timer-${Date.now()}.md`, md, 'text/markdown;charset=utf-8');
            announce(`Exported MD (${redactOpts.master ? 'redacted' : 'full'})`);
            try { addTeleEvent('export_md', { export_kind: 'md' }); } catch {}
          } catch {
            announce('Export unavailable. Redaction error.');
          } finally { setExportBusy(false); }
        })();
        return;
      }
      if (k === 'j') {
        stop();
        (async () => {
          setExportBusy(true);
          try {
            const now = Date.now();
            const { payload } = buildCanonicalPayload(t, now);
            const effective = await scrubJSON(payload, redactOpts);
            const jsonOut = JSON.stringify(effective);
            const checksum = await hashWithWorker(jsonOut);
            const envelope = JSON.stringify({ checksum, payload: JSON.parse(jsonOut) });
            downloadText(`therapy-timer-${now}.json`, envelope, 'application/json;charset=utf-8');
            announce(`Exported JSON (${redactOpts.master ? 'redacted' : 'full'})`);
            try { addTeleEvent('export_json', { export_kind: 'json' }); } catch {}
          } catch {
            announce('Export unavailable. Redaction error.');
          } finally { setExportBusy(false); }
        })();
        return;
      }
      if (k === 'l') {
        if (t.laps.length === 0) return;
        stop();
        (async () => {
          setExportBusy(true);
          try {
            let csv = buildCSV();
            csv = await scrubText(csv, redactOpts);
            downloadText(`therapy-timer-laps-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
            announce(`Exported CSV (laps) (${redactOpts.master ? 'redacted' : 'full'})`);
            try { addTeleEvent('export_csv', { export_kind: 'csv' }); } catch {}
          } catch {
            announce('Export unavailable. Redaction error.');
          } finally { setExportBusy(false); }
        })();
        return;
      }
      if (k === 's') {
        if (t.segments.length === 0) return;
        stop();
        try {
          const seg = Engine.segmentTotals(t);
          const total = Math.max(1, Engine.progressMs(t));
          const row = (name: string, ms: number, splits: number) => {
            const pct = Math.round((ms/total)*1000)/10;
            const avg = splits ? Math.round(ms/splits) : 0;
            return `${name},${ms|0},${pct.toFixed(1)},${splits},${avg|0}`;
          };
          const spans = t.segments;
          const count = (kind: Engine.SegmentKind) => spans.filter(s => s.kind === kind).length;
          const lines = [
            'name,total_ms,pct,splits,avg_split_ms',
            row('Assessment', seg.assessment, count('assessment')),
            row('Break', seg.break, count('break')),
            row('Documentation', seg.documentation, count('documentation')),
          ];
          downloadText(`therapy-timer-segments-${Date.now()}.csv`, lines.join('\n'), 'text/csv;charset=utf-8');
          try { addTeleEvent('export_csv', { export_kind: 'csv' }); } catch {}
        } catch {
          announce('Export unavailable. Redaction error.');
        }
        return;
      }
      if (k === 'p') {
        stop();
        try {
          const html = Audit.summaryHTML(Audit.buildFromState(t, Date.now(), Date.now()));
          if (!openPrintWindow(html)) {
            downloadText(`therapy-timer-${Date.now()}.html`, html, 'text/html;charset=utf-8');
          }
        } catch {}
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    // Cleanup listener returned as a named function expression (avoids arrow return lint rule)
    // eslint-disable-next-line
    return function cleanupKeyListener() {
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open, t, redactOpts, buildCSV, scrubText, scrubJSON, hashWithWorker, announce, addTeleEvent]);

  // Keep modal visible during closing animation
  const isOpen = open || isClosing;
  
  if(!isOpen) return null;
  return createPortal(
    <div
      className={`${styles.overlay} ${isClosing ? styles.overlayClosing : styles.overlayOpening}`}
      role="presentation"
      onMouseDown={overlayClick}
      data-testid="timer-overlay"
      style={overlayStyleFallback}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Dialog with keyboard nav requires keydown handler */}
      <div
        className={`${styles.sheet} ${isClosing ? styles.sheetClosing : styles.sheetOpening}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="timer-title"
        aria-describedby="timer-desc"
        ref={cardRef}
        tabIndex={-1}
        data-testid="timer-modal"
        {...(skin === 'np' ? { 'data-skin': 'np' } : {})}
  data-contrast={contrast === 'high' ? 'high' : undefined}
        data-audit={auditGray ? 'gray' : undefined}
        style={sheetStyleFallback}
        onKeyDown={onDialogKey}
        onContextMenu={handleContextMenu}
      >
        {/* Hidden dialog description for SR users */}
        <p id="timer-desc" className={styles.srOnly}>Therapy Timer dialog. Press Escape to close. Space toggles start and pause. Tabs stay within the dialog.</p>
        {/* Toast stack */}
        {Boolean(toasts.length) && (
          <div className={styles.toastStack} aria-hidden="true">
            {toasts.map(t => (
              <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.kind}`]}`}>{t.text}</div>
            ))}
          </div>
        )}
        {/* Sticky header (Row 1) */}
        <header className={`${styles.header}`} role="banner">
          <div className={styles.container}>
            <div className={styles.headerRow}>
              <h2 id="timer-title" className={styles.title}>{title}</h2>
              <div className={styles.headerChips}>
                <span className={`${styles.chip} ${styles.phase}`}>
                  <FaPause size={12} style={{ color: '#000000', marginRight: '4px' }} />
                  {phaseLabel}
                </span>
                <span className={`${styles.chip} ${activeSegment ? styles[`seg_${activeSegment}`] : styles.seg_none}`} aria-live="polite">
                  <BsActivity size={12} style={{ color: '#000000', marginRight: '4px' }} />
                  {activeSegment ? capitalize(activeSegment) : "No segment"}
                </span>
                {patient ? (
                  <span className={styles.chip} title={`Patient ${patient.id}`} aria-label={`Patient ${patient.id}`}>
                    <FaUserMd size={12} style={{ color: '#000000', marginRight: '4px' }} />
                    {(redactOn ? 'Patient' : (patient.name ?? 'Patient'))} • {patient.age ?? '–'} {patient.sex ?? ''} • Risk {patient.risk}
                  </span>
                ) : null}
                {patient && encounter ? (
                  <span className={styles.chip} title="Encounter session time" aria-label="Encounter session time">
                    <FiClock size={12} style={{ color: '#000000', marginRight: '4px' }} />
                    {(encounter.sessionMsTotal != null ? Math.floor(encounter.sessionMsTotal / 60000) : 0)}m recorded
                  </span>
                ) : null}
                {undoStackRef.current.length > 0 && (
                  <button type="button" className={styles.iconBtn} onClick={undoLastImport} title="Undo last import" aria-label="Undo last import">
                    <MdUndo size={16} style={{ color: '#000000' }} />
                  </button>
                )}
              </div>
              <div className={styles.headerActions}>
                <button type="button" className={styles.iconBtn} aria-pressed={muted} onClick={() => { setMuted(v => !v); schedulePersist('mute'); }} title={muted ? "Sound off" : "Sound on"}>
                  {muted ? <IoMdVolumeOff size={18} style={{ color: '#000000' }} /> : <IoMdVolumeHigh size={18} style={{ color: '#000000' }} />}
                </button>
                <button
                  className={styles.iconBtn}
                  type="button"
                  aria-pressed={contrast === 'high'}
                  onClick={() => setContrast(prev => prev === 'high' ? 'normal' : 'high')}
                  title={contrast === 'high' ? 'High contrast: On' : 'High contrast: Off'}
                  aria-label="Toggle high contrast"
                >
                  <MdContrast size={18} style={{ color: '#000000' }} />
                </button>
                {/* Light theme removed */}
                <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
                  <span className={styles.srOnly}>Theme style</span>
                  <select className={styles.segBtn} value={colorStyle} onChange={(e)=> setColorStyle(e.target.value as ColorStyle)} aria-label="Theme style">
                    <option value="classic">Classic</option>
                    <option value="segment">Segment</option>
                    <option value="party">Party</option>
                  </select>
                </label>
                <button
                  className={styles.iconBtn}
                  type="button"
                  aria-pressed={auditGray}
                  onClick={() => setAuditGray(v => !v)}
                  title={auditGray ? 'Color-blind audit (grayscale): On' : 'Color-blind audit (grayscale): Off'}
                  aria-label="Toggle grayscale audit"
                >
                  <MdFilterBAndW size={18} style={{ color: '#000000' }} />
                </button>
                <button
                  className={styles.iconBtn}
                  type="button"
                  aria-pressed={radicalOn}
                  onClick={() => setRadicalOn(v=>!v)}
                  title="Toggle Radical features"
                  aria-label="Toggle Radical features"
                >
                  <MdBolt size={18} style={{ color: radicalOn ? '#FFD700' : '#666666' }} />
                </button>
                {Boolean(radicalOn) && (
                  <button
                    className={styles.iconBtn}
                    type="button"
                    aria-pressed={voiceCommandsEnabled}
                    onClick={() => setVoiceCommandsEnabled(v => !v)}
                    title={`Voice Commands: ${voiceCommandsEnabled ? 'ON' : 'OFF'} ${voiceCommands.isListening ? '(Listening...)' : ''}`}
                    aria-label="Toggle Voice Commands"
                  >
                    <FaMicrophone size={16} style={{ color: voiceCommandsEnabled ? (voiceCommands.isListening ? '#00ff00' : '#00ffff') : '#666666' }} />
                  </button>
                )}
                {radicalOn && isNarrow ? (
                  <button className={styles.iconBtn} type="button" aria-pressed={!notesCollapsed} onClick={()=> setNotesCollapsed(v=>!v)} title="Toggle Notes panel" aria-label="Toggle Notes">
                    <MdNoteAlt size={18} style={{ color: '#000000' }} />
                  </button>
                ) : null}
                <button
                  className={styles.iconBtn}
                  type="button"
                  aria-pressed={auditOpen}
                  onClick={() => setAuditOpen(v => !v)}
                  title="Toggle Audit Panel (A)"
                  aria-label="Toggle Audit Panel"
                >
                  <BiText size={18} style={{ color: '#000000' }} />
                </button>
                <button className={styles.iconBtn} type="button" onClick={() => { if (t.phase === 'running') { setConfirmOpen(true); } else { handleClose(); } }} aria-label="Close timer">
                  <IoMdClose size={20} style={{ color: '#000000' }} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scroll container hosting modal body (core + ops grid) and radical split variant */}
        <div className={styles.scroller} role="main" aria-labelledby="timer-title">
        {!radicalOn ? (
          <>
          <div className={styles.modalBody}>
            <section className={styles.core} aria-label="Core timer">
              {/* Readout card (P3) */}
              <div className={styles.readoutCard} aria-label="Time readout">
                {(() => {
                  // User request: revert circular ring back to linear bars.
                  // Compute session & segment progress ratios.
                  const elapsedMs = Engine.progressMs(t);
                  const remainingMs = t.mode === 'countdown' ? Math.max(0, t.countdownInitialMs - elapsedMs) : 0;
                  const showSessionBar = t.mode === 'countdown' && sessionTotalMs > 0;
                  const sessionRatio = showSessionBar ? Math.max(0, Math.min(1, sessionP)) : 0;
                  // Approximate active segment progress as portion of total elapsed.
                  const activeSeg = t.segments[t.segments.length - 1];
                  let segElapsed = 0;
                  if (activeSeg) segElapsed = (activeSeg.endMs ?? elapsedMs) - activeSeg.startMs;
                  const totalForSeg = t.mode === 'countdown' ? Math.max(1, t.countdownInitialMs) : Math.max(1, elapsedMs);
                  const segRatio = Math.max(0, Math.min(1, segElapsed / totalForSeg));
                  // Format primary time (HH:MM:SS) using existing hero digit strings
                  const hh = `${hero.hh[0]}${hero.hh[1]}`;
                  const mm = `${hero.mm[0]}${hero.mm[1]}`;
                  const ss = `${hero.ss[0]}${hero.ss[1]}`;
                  const timeString = hero.showHours ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
                  return (
                    <>
                      {/* Linear progress bars split: one above digits, one below, contained inside card */}
                      {/* Üst çizgi (progress bar) her modda görünür; countdown değilse dekoratif (genişlik 0%). */}
                      <div className={`${styles.barRow} ${styles.barTop}`} aria-hidden={!showSessionBar}>
                        <div
                          className={`${styles.bar} ${styles.sessionBar}`}
                          role={showSessionBar ? 'img' : undefined}
                          aria-label={showSessionBar ? `Oturum ilerleme ${Math.round(sessionRatio * 100)}%` : undefined}
                        >
                          <div className={styles.barTrack} />
                          <div
                            className={styles.barFill}
                            style={{ width: showSessionBar ? `${(sessionRatio * 100).toFixed(3)}%` : '0%' }}
                          />
                        </div>
                      </div>
                      <div className={styles.timeBlock}>
                        <div
                          ref={readoutRef}
                          className={styles.timePrimary}
                          data-testid="timer-digits"
                          aria-live="polite"
                          aria-atomic="true"
                          role="status"
                        >{timeString}</div>
                        {t.mode === 'countdown'
                          ? <div className={styles.timeSecondary}>Remaining: {Engine.fmtHMS(remainingMs)}</div>
                          : <div className={styles.timeSecondary}>Elapsed: {Engine.fmtHMS(elapsedMs)}</div>}
                        <div className={styles.heroPill} role="note" aria-label={activeSegment ? `active segment: ${activeSegment}` : `active segment: none`}>
                          <span className={`${styles.segChip} ${activeSegment ? styles[`seg_${activeSegment}`] : styles.seg_none}`}>{activeSegment ? capitalize(activeSegment) : 'No segment'}</span>
                        </div>
                        {/* Status region for non-time announcements (segments, laps) */}
                        <div ref={srRef} className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true" />
                      </div>
                      {/* Hero controls (Start / Lap / Reset) now ABOVE the bottom line per request */}
                      <div className={styles.heroControls} role="toolbar" aria-orientation="horizontal" aria-label="Primary controls">
                        <button
                          ref={primaryRef}
                          type="button"
                          className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}
                          onClick={onStartPause}
                          data-testid="btn-start-pause"
                          aria-label={running ? 'Pause timer (Space)' : (t.phase === 'paused' ? 'Resume timer (Space)' : 'Start timer (Space)')}
                          title={running ? 'Pause (Space)' : (t.phase === 'paused' ? 'Resume (Space)' : 'Start (Space)')}
                        >
                          {running ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
                          <span className={styles.heroBtnLabel}>{running ? 'Pause' : (t.phase === 'paused' ? 'Resume' : 'Start')}</span>
                          <span aria-hidden="true" className={styles.heroKeyHint}>Space</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.heroBtn} ${styles.heroBtnGhost}`}
                          onClick={onLapTagged}
                          disabled={!running && Engine.progressMs(t) === 0}
                          aria-label="Add lap (L)"
                          title="Add lap (L)"
                          data-testid="btn-lap"
                        >
                          <FaFlag aria-hidden="true" />
                          <span className={styles.heroBtnLabel}>Lap</span>
                          <span aria-hidden="true" className={styles.heroKeyHint}>L</span>
                        </button>
                        <button
                          type="button"
                          className={`${styles.heroBtn} ${styles.heroBtnDanger}`}
                          onClick={onReset}
                          disabled={Engine.progressMs(t) === 0 && t.phase === "idle"}
                          aria-label="Reset timer (R)"
                          title="Reset (R)"
                          data-testid="btn-reset"
                        >
                          <FaRedoAlt aria-hidden="true" />
                          <span className={styles.heroBtnLabel}>Reset</span>
                          <span aria-hidden="true" className={styles.heroKeyHint}>R</span>
                        </button>
                      </div>
                      <div className={`${styles.barRow} ${styles.barBottom}`} aria-hidden="true">
                        <div
                          className={`${styles.bar} ${styles.segmentBar}`}
                          role="img"
                          aria-label={`Segment progress ${Math.round(segRatio * 100)}%`}
                        >
                          <div className={styles.barTrack} />
                          <div
                            className={styles.barFill}
                            style={{ width: `${(segRatio * 100).toFixed(3)}%` }}
                          />
                          {running && !reducedMotion ? <div className={styles.barSweep} /> : null}
                        </div>
                      </div>
                      {process.env.NODE_ENV !== 'production' && (
                        <div aria-hidden="true" style={{ position: 'absolute', inset: 'auto 12px 12px auto', fontSize: 10, opacity: .5 }}>
                          debug: TimerModal
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* New equal-width cards row under primary controls */}
              <section className={styles.coreToolsRow} aria-label="Timer configuration">
                {/* Card A — Session Mode & Duration (clarified copy + grouping) */}
                <article
                  className={`${styles.card} ${styles.cardMode}`}
                  style={{ ['--tm-card-accent' as string]: palette[0] }}
                  role="region"
                  aria-labelledby="card-mode-title"
                >
                  <header className={styles.cardHeader}>
                    <h3 id="card-mode-title" className={styles.cardTitle}>Session Mode &amp; Duration</h3>
                    {/* Stopwatch / Countdown selector moved into header (frameless) */}
                    <div className={styles.cardActions} role="radiogroup" aria-label="Timer mode" aria-describedby="mode-desc">
                      <div className={styles.headerSegWrap}>
                        <button
                          type="button"
                          className={`${styles.headerSeg} ${!isCountdown ? styles.headerSegActive : ''}`}
                          role="radio"
                          aria-checked={!isCountdown}
                          aria-label="Stopwatch"
                          onClick={onModeStopwatch}
                        >Stopwatch</button>
                        <button
                          type="button"
                          className={`${styles.headerSeg} ${isCountdown ? styles.headerSegActive : ''}`}
                          role="radio"
                          aria-checked={isCountdown}
                          aria-label="Countdown"
                          onClick={onModeCountdown}
                        >Countdown</button>
                      </div>
                    </div>
                  </header>
                  <div className={styles.modeBody}>
                    {/* Intro line for screen readers (hidden visually) */}
                    <p className="sr-only" id="mode-desc">Choose stopwatch or countdown. Countdown enables end behavior, presets and thresholds.</p>
                    {/* Band 1: End behavior (mode selector now in header) */}
                    <div className={styles.bandTop}>
                      <label className={styles.microField} aria-label="When countdown ends">
                        <span className={styles.microLabel}>When ends</span>
                        <select
                          className={styles.microSelect}
                          aria-label="Behavior when countdown reaches zero"
                          value={t.zeroBehavior}
                          onChange={(e) => { setZeroBehavior(e.target.value as Engine.ZeroBehavior); schedulePersist('end-behavior'); }}
                          disabled={!isCountdown}
                          aria-disabled={!isCountdown}
                        >
                          <option value="finish">Stop</option>
                          <option value="pause">Auto-pause</option>
                        </select>
                      </label>
                    </div>

                    {/* Band 2: Presets + Custom editor */}
                    <div className={styles.bandPresets}>
                      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allows keyboard scrolling focus */}
                      <div className={styles.presetsScroller} aria-label="Duration presets" aria-roledescription="horizontally scrollable" tabIndex={0}>
                        {[10, 25, 45, 50].map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`${styles.pill} ${isCountdown && countdownMinutes === m ? styles.pillSelected : ''}`}
                            onClick={() => setPreset(m)}
                            aria-pressed={isCountdown && countdownMinutes === m ? 'true' : 'false'}
                            aria-label={`Preset ${m} minutes${running ? ', disabled while running' : ''}`}
                            title={running ? 'Pause to change presets' : undefined}
                          >{m}m</button>
                        ))}
                        <button
                          type="button"
                          className={`${styles.pill} ${styles.pillCustom} ${customOpen ? styles.pillSelected : ''}`}
                          onClick={() => { if (running) { announce('Pause to change presets.'); } else { setCustomOpen(true); } }}
                          aria-pressed={customOpen}
                          aria-label="Custom duration"
                          title={running ? 'Pause to change presets' : 'Set a custom duration (Enter to apply)'}
                        >Custom…</button>
                      </div>

                      <div className={styles.customPreset}>
                        {customOpen ? (
                          <div className={`${styles.modeRow} ${styles.customEditor}`} role="group" aria-label="Custom preset editor">
                            <span className={styles.cdWrap} aria-live="polite">
                              <input
                                ref={customInputRef}
                                className={styles.cdInput}
                                type="text"
                                inputMode="numeric"
                                placeholder="MM:SS"
                                aria-label="Custom duration"
                                aria-describedby="custom-hint"
                                value={customValue}
                                onChange={(e) => { setCustomValue(e.target.value); setCustomError(""); }}
                                onKeyDown={onCustomKey}
                              />
                              <button type="button" className={styles.segBtn} onClick={commitCustom} aria-label="Apply custom duration">Set</button>
                              <button type="button" className={styles.ghost} onClick={() => setCustomOpen(false)} aria-label="Cancel custom duration">Cancel</button>
                              {customError ? <span className={styles.segmentLabel} role="alert" style={{ marginLeft: 4 }}>{customError}</span> : null}
                              <span id="custom-hint" className="sr-only">Format: M, MM:SS or H:MM:SS. Examples: 5, 25:00, 1:05:00.</span>
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Band 3: Thresholds + Helper line */}
                    <div className={styles.bandThresholds} aria-label="Thresholds">
                      <label className={styles.microField} aria-label="Warning threshold (minutes)">
                        <span className={styles.microLabel}>Warn at (min)</span>
                        <input
                          type="number"
                          min={0}
                          max={600}
                          className={styles.microSelect}
                          value={warnThresholdMin}
                          disabled={!isCountdown}
                          aria-disabled={!isCountdown}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(600, parseInt((e.target.value || '0'), 10)));
                            setWarnThresholdMin(v); schedulePersist('threshold');
                          }}
                        />
                      </label>
                      <label className={styles.microField} aria-label="Critical threshold (minutes)">
                        <span className={styles.microLabel}>Critical at (min)</span>
                        <input
                          type="number"
                          min={0}
                          max={600}
                          className={styles.microSelect}
                          value={criticalThresholdMin}
                          disabled={!isCountdown}
                          aria-disabled={!isCountdown}
                          onChange={(e) => {
                            const v = Math.max(0, Math.min(600, parseInt((e.target.value || '0'), 10)));
                            setCriticalThresholdMin(v); schedulePersist('threshold');
                          }}
                        />
                      </label>

                      <p className={styles.helperLine} role="status" aria-live="polite">
                        {isCountdown && thresholdStageRef.current === 'warn' ? 'Warning threshold reached' : null}
                        {isCountdown && thresholdStageRef.current === 'critical' ? 'Critical threshold reached' : null}
                      </p>
                    </div>
                  </div>
                </article>

                {/* Card B — Clinical Segments & Privacy (improved labels) */}
                <article
                  className={`${styles.card} ${styles.cardSegments}`}
                  style={{ ['--tm-card-accent' as string]: palette[1] }}
                  role="region"
                  aria-labelledby="card-seg-title"
                >
                  <header className={styles.cardHeader}>
                    <h3 id="card-seg-title" className={styles.cardTitle}>Clinical Segments &amp; Privacy</h3>
                    <div className={styles.cardActions} role="group" aria-label="Card actions">
                      <button type="button" className={styles.btnMini} onClick={() => setAdvOpen(v => !v)} aria-expanded={advOpen} aria-controls="privacy-advanced">Advanced</button>
                    </div>
                  </header>
                  <div className={styles.segmentsBody}>
                    {/* 1) Segment selection chips */}
                    {(() => {
                      const kinds: Engine.SegmentKind[] = ["assessment", "therapy", "break", "documentation"];                      
                      const idx = activeSegment ? kinds.indexOf(activeSegment as Engine.SegmentKind) : 1; // default therapy
                      const cycle = (dir: -1 | 1) => {
                        const next = kinds[(idx + (dir === 1 ? 1 : kinds.length - 1)) % kinds.length];
                        setT(prev => Engine.startSegment(prev, next));
                        bus.publish('segment_change', { segment: capitalize(next) });
                        schedulePersist('segment');
                        try { if (srRef.current) srRef.current.textContent = `Segment: ${capitalize(next)}`; } catch {}
                      };
                      const onKey: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
                        if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
                          e.preventDefault();
                          cycle(e.key === "ArrowRight" ? 1 : -1);
                        }
                        if (!e.altKey && (e.key === "ArrowRight" || e.key === "ArrowDown")) { e.preventDefault(); cycle(1); }
                        if (!e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowUp")) { e.preventDefault(); cycle(-1); }
                        if (e.key === 'Home') { e.preventDefault(); setT(prev => Engine.startSegment(prev, kinds[0])); bus.publish('segment_change', { segment: capitalize(kinds[0]) }); announce(`Segment: ${capitalize(kinds[0])}`); }
                        if (e.key === 'End') { e.preventDefault(); setT(prev => Engine.startSegment(prev, kinds[kinds.length-1])); bus.publish('segment_change', { segment: capitalize(kinds[kinds.length-1]) }); announce(`Segment: ${capitalize(kinds[kinds.length-1])}`); }
                      };
                      return (
                        <div className={styles.segmentChips} role="radiogroup" aria-label="Clinical segments" onKeyDown={onKey} tabIndex={0}>
                          {kinds.map(k => (
                            <button
                              key={k}
                              type="button"
                              role="radio"
                              aria-checked={activeSegment === k}
                              aria-label={`${capitalize(k)} segment`}
                              className={styles.segActionBtn}
                              onClick={() => {
                                if (activeSegment !== k) {
                                  setT(prev => Engine.startSegment(prev, k));
                                  bus.publish('segment_change', { segment: capitalize(k) });
                                  schedulePersist('segment');
                                  try { if (srRef.current) srRef.current.textContent = `Segment: ${capitalize(k)}`; } catch {}
                                }
                              }}
                            >
                              {capitalize(k)}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* 2) Display & Privacy micro toggles */}
                    <div className={styles.displayPrivacyRow} aria-label="Display and privacy toggles">
                      <button
                        type="button"
                        className={styles.chipButton}
                        data-variant="display"
                        aria-pressed={forceShowHours}
                        aria-label="Display hours as 00h"
                        title="Display hours as 00h"
                        onClick={() => setForceShowHours(v => !v)}
                      >00h</button>

                      <button
                        type="button"
                        className={styles.chipButton}
                        data-variant="privacy"
                        aria-pressed={redactOn}
                        aria-label={redactOn ? 'Redact sensitive data: enabled' : 'Redact sensitive data: disabled'}
                        title={redactOn ? 'Redact sensitive data: enabled' : 'Redact sensitive data: disabled'}
                        onClick={() => { setRedactOn(v => !v); announce(`Redaction ${!redactOn ? 'enabled' : 'disabled'}`); }}
                      >{redactOn ? 'Redaction On' : 'Redaction Off'}</button>
                    </div>
                    {advOpen ? (
                      <div id="privacy-advanced" className={styles.modeRow} role="group" aria-label="Advanced privacy options" style={{ gap: 6 }}>
                        {([
                          ['name','Names'],
                          ['ids','IDs'],
                          ['contact','Contact'],
                          ['address','Address'],
                          ['dates','Dates'],
                          ['freeText','Free text'],
                        ] as Array<[keyof RedactOptions['categories'], string]>).map(([k, label]) => (
                          <button key={k} type="button" className={`${styles.segBtn} ${adv[k] ? styles.segBtnActive : ''}`} aria-pressed={adv[k]} onClick={() => setAdv(prev => ({ ...prev, [k]: !prev[k] }))}>{label}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </section>

              {/* Optional timeline ribbon (kept within core, remains below cards) */}
              {ribbonVisible ? (
                <div className={styles.container}>
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Keyboard navigation for timeline */}
                  <div className={styles.ribbonWrap} role="region" aria-label="Timeline ribbon" tabIndex={0}
                   onKeyDown={(e)=>{
                     if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
                       e.preventDefault();
                       const laps = t.laps.map(l=>l.atMs); if(!laps.length) return;
                       const now = t.elapsedMs; const idx = laps.findIndex(m=>m>now);
                       let target = 0;
                       if(e.key==='ArrowLeft') target = idx<=0? laps[laps.length-1] : laps[idx-1];
                       else target = idx<0? laps[0] : laps[Math.min(laps.length-1, idx)];
                       announce(`Lap ${laps.indexOf(target)+1} at ${Engine.fmtHMS(target)}`);
                     }
                   }}>
                    <svg ref={ribbonRef} className={styles.ribbonSvg} viewBox="0 0 1000 38" preserveAspectRatio="none" aria-hidden="true">
                  <g>
                    {t.segments.map((sp,i)=>{ const total = t.mode==='countdown'? Math.max(1,t.countdownInitialMs):Math.max(1,Engine.progressMs(t)); const end = (sp.endMs??Engine.progressMs(t)); const x = (sp.startMs/total)*1000; const w = ((end-sp.startMs)/total)*1000; const fill = ({assessment:'#7a89ff', therapy:'#00c6ff', break:'#ffc247', documentation:'#00ffc6'} as const)[sp.kind];
                      return <rect key={`seg-${i}`} className={styles.ribbonSpan} x={x} y={8} width={Math.max(0,w)} height={22} fill={fill} rx={4} ry={4} onClick={()=>{ setT(prev=>Engine.startSegment(prev, sp.kind)); bus.publish('segment_change', { segment: capitalize(sp.kind) }); schedulePersist('segment'); announce(`Segment: ${capitalize(sp.kind)}`); }} />; })}
                    {t.laps.map((l,i)=>{ const total = t.mode==='countdown'? Math.max(1,t.countdownInitialMs):Math.max(1,Engine.progressMs(t)); const x = (l.atMs/total)*1000; return <line key={`lap-${i}`} className={styles.ribbonLapTick} x1={x} y1={6} x2={x} y2={32} />; })}
                    <line ref={ribbonPlayheadRef} className={styles.ribbonPlayhead} x1={0} y1={6} x2={0} y2={32} />
                  </g>
                    </svg>
                  </div>
                </div>
              ) : null}

              {/* Old controls grid removed in favor of two-card row */}
            </section>

            {/* Operations Grid */}
            <section className={styles.opsGrid} aria-label="Operations">
              {/* Breath guide (if radicalOn while in standard layout, rare) */}
              {radicalOn ? (
                <article className={`${styles.section} ${styles.card}`} style={{ ['--tm-card-accent' as string]: palette[2] }}> {/* card */}
                  <div className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                    <h3 className={styles.sectionTitle}>Breath guide</h3>
                    <div className={`${styles.sectionActions} ${styles.cardActions}`}>
                      <label style={{display:'inline-flex',alignItems:'center',gap:6}}><input type="checkbox" checked={breathOn} onChange={(e)=> setBreathOn(e.target.checked)} /> Enable</label>
                      <select className={styles.segBtn} value={breathPattern} onChange={(e)=> setBreathPattern(e.target.value as 'even'|'478')} aria-label="Breath pattern">
                        <option value="even">Even (≈6/min)</option>
                        <option value="478">4-7-8</option>
                      </select>
                    </div>
                  </div>
                  {activeSegment==='break' && breathOn ? (
                    <div ref={breathRef} className={styles.breathGuideWrap}>
                      {!reducedMotion ? (
                        <div className={styles.breathBar}><div className={styles.breathFill} /></div>
                      ) : (
                        <div className="breathStep" aria-live="polite">Inhale 1/4</div>
                      )}
                    </div>
                  ) : null}
                </article>
              ) : null}

              {/* Queue / Calendar / Metronome + Help (clarified copy) */}
              <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-queue-title" style={{ ['--tm-card-accent' as string]: palette[3] }}>
                <div className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                  <h3 id="card-queue-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>
                    Queue, Calendar &amp; Metronome
                    {adaptiveCompact ? <span aria-hidden="true" style={{ marginLeft: 8, fontSize: 11, opacity: 0.65, fontWeight: 400 }}>Compact</span> : null}
                  </h3>
                  <div className={`${styles.sectionActions} ${styles.cardActions}`} role="group" aria-label="Queue, Calendar and Metronome actions">
                    <button
                      type="button"
                      className={`${styles.segBtn} ${queueOpen ? styles.segBtnActive : ''}`}
                      aria-pressed={queueOpen}
                      onClick={() => { const next = !queueOpen; setQueueOpen(next); try { if (queue) queue.panelOpenRef.current = next; } catch {}; if (next) { userCompactOverrideRef.current = true; } bus.publish('queue_toggle', { open: next }); announce(`Queue ${next ? 'open' : 'closed'}`); }}
                    >Queue</button>
                    {/* Help panel toggle */}
                    <button
                      type="button"
                      className={styles.ghost}
                      aria-label={helpOpen ? 'Hide help' : 'Show help'}
                      title={helpOpen ? 'Hide help' : 'Show help'}
                      onClick={() => { setHelpOpen(v=>{ const n=!v; announce(n?'Help open':'Help closed'); return n; }); }}
                    >ℹ</button>
                  </div>
                </div>
                {(helpOpen && !adaptiveCompact) ? (
                  <div className={styles.helpPanel} role="region" aria-label="Timer help">
                    <h4>Overview</h4>
                    <p>The timer supports <strong>segments</strong> (Assessment, Therapy, Break, Documentation), an optional <strong>Queue</strong> of planned durations, and a <strong>Calendar slot</strong> from a pasted <code>.ics</code> event. A simple <strong>Metronome</strong> helps pace interventions, note-taking cadence, or breathing prompts.</p>
                    <h4>Calendar</h4>
                    <p>Paste raw <code>.ics</code> data (open an event & choose &quot;Download .ics&quot; then open in a text editor). Optional meeting code is redacted if privacy mode is on. Attach to compute overrun warnings against countdown timers.</p>
                    <h4>Queue</h4>
                    <p>Add planned steps in the queue (e.g. 10m Assessment → 40m Therapy → 5m Documentation). Opening the queue lets you start or skip items rapidly.</p>
                    <h4>Metronome</h4>
                    <p>Use Enable to start clicks. <em>BPM</em> controls speed. <em>Subdivision</em> adds internal pulses (e.g. 2 = eighth notes feel). <em>Volume</em> sets loudness. If audio fails (e.g. browser denied), a toast appears and the metronome stops.</p>
                    <h4>Per-Segment Pacing</h4>
                    <p>BPM & subdivision auto-save per segment. Switching segments reapplies last values. You can tailor a slower assessment cadence and faster documentation pace.</p>
                    <h4>Privacy</h4>
                    <p>With redaction enabled, meeting codes containing potential PII are scrubbed. You can still attach schedule metadata safely.</p>
                  </div>
                ) : null}
                {queueOpen && queue ? (
                  <div className={styles.modeRow} role="region" aria-label="Timer queue">
                    <QueuePanel hook={queue} />
                  </div>
                ) : null}

                {/* Grid: two balanced rows, responsive 4→3→2→1 cols */}
                {(!adaptiveCompact || userCompactOverrideRef.current || queueOpen) ? (
                <div className={styles.queueGrid} aria-label="Queue, Calendar and Metronome controls">
                  {/* Row A: Metronome Enable, BPM, Subdivision, Volume */}
                  <div className={`${styles.queueRow} ${styles.queueRowA}`} role="group" aria-label="Metronome controls">
                    <div className={styles.microField}>
                      <span className={styles.microLabel}>Metronome</span>
                      <div className={styles.beatWrap}>
                        <button
                          type="button"
                          className={`${styles.segBtn} ${metState.on ? styles.segBtnActive : ''}`}
                          aria-pressed={metState.on}
                          aria-label={metState.on ? 'Disable metronome' : 'Enable metronome'}
                          title={metState.on ? 'Disable metronome' : 'Enable metronome'}
                          onClick={() => {
                            setMetState(prev => {
                              const next = { ...prev, on: !prev.on } as MetronomeState;
                              try {
                                const audioOk = canUseAudio();
                                if (next.on && !audioOk) {
                                  bus.publish('audio_failed', {});
                                  announce('Audio unavailable');
                                  return { ...prev, on: false };
                                }
                                if (next.on) { ensureMet().start(); bus.publish('metronome_on', { bpm: next.bpm, subdivision: next.subdivision }); announce(`Metronome on at ${next.bpm} BPM`); }
                                else { ensureMet().stop(); bus.publish('metronome_off', {}); announce('Metronome off'); }
                              } catch { bus.publish('audio_failed', {}); announce('Audio unavailable for metronome'); }
                              return next;
                            });
                          }}
                        >{metState.on ? 'Disable' : 'Enable'}</button>
                        {/* eslint-disable-next-line react/jsx-no-leaked-render -- metState.on is boolean */}
                        {metState.on && <span key={beatPulseId} data-pulse={beatPulseId} className={`${styles.beatDot} ${beatFlash ? styles.beatDotFlash : ''} ${beatSubFlash ? styles.beatDotSubFlash : ''}`.trim()} aria-hidden="true" />}
                      </div>
                    </div>
                    <div className={styles.microField}>
                      <label className={styles.microLabel} htmlFor="met-bpm">BPM</label>
                      <div className={styles.sliderWrap}>
                        <input
                          id="met-bpm"
                          type="range"
                          min={30}
                          max={150}
                          value={metState.bpm}
                          aria-valuemin={30}
                          aria-valuemax={150}
                          aria-valuenow={metState.bpm}
                          aria-label="Metronome beats per minute"
                          onChange={(e)=>{ const bpm = parseInt(e.target.value,10); setMetState(prev=>{ const next={...prev,bpm}; bus.publish('metronome_bpm_change',{bpm}); announce(`BPM ${bpm}`); saveSegmentMetronome(activeSegment, next); try { if (next.on) ensureMet().restart(); } catch {} return next; }); }}
                          onInput={(e)=>{ const bpm = parseInt((e.target as HTMLInputElement).value,10); setMetState(prev=>{ const next={...prev,bpm}; saveSegmentMetronome(activeSegment, next); try { if (next.on) ensureMet().restart(); } catch {} return next; }); }} />
                        <span className={styles.sliderValue} aria-live="polite">{metState.bpm}</span>
                      </div>
                    </div>
                    <div className={styles.microField}>
                      <label className={styles.microLabel} htmlFor="met-subdiv">Subdivision</label>
                      <select
                        id="met-subdiv"
                        className={styles.segBtn}
                        value={metState.subdivision}
                        aria-label="Metronome subdivision"
                        onChange={(e)=>{ const sub = parseInt(e.target.value,10) as 1|2|4; setMetState(prev=>{ const next={...prev, subdivision: sub}; bus.publish('metronome_subdivision_change',{ subdivision: sub }); announce(`Subdivision ${sub}`); saveSegmentMetronome(activeSegment, next); try { if (next.on) ensureMet().restart(); } catch {} return next; }); }}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                    <div className={styles.microField}>
                      <label className={styles.microLabel} htmlFor="met-vol">Volume</label>
                      <div className={styles.sliderWrap}>
                        <input
                          id="met-vol"
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(metState.volume*100)}
                          aria-label="Metronome volume"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(metState.volume*100)}
                          onChange={(e)=>{ const vol = Math.max(0, Math.min(1, (parseInt(e.target.value,10)||0)/100)); setMetState(prev=>{ const next={...prev, volume: vol}; bus.publish('metronome_volume_change',{ volume: vol }); announce(`Volume ${Math.round(vol*100)}`); saveSegmentMetronome(activeSegment, next); return next; }); }}
                          onInput={(e)=>{ const vol = Math.max(0, Math.min(1, (parseInt((e.target as HTMLInputElement).value,10)||0)/100)); setMetState(prev=>{ const next={...prev, volume: vol}; saveSegmentMetronome(activeSegment, next); try { if (next.on) ensureMet().setVolume(vol); } catch {} return next; }); }} />
                        <span className={styles.sliderValue} aria-hidden="true">{Math.round(metState.volume*100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Row B: Calendar attach (spans to fit). Other fields are omitted if not present. */}
                  <div className={`${styles.queueRow} ${styles.queueRowB}`} role="group" aria-label="Calendar attachment">
                    <div className={styles.microField} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.microLabel}>Calendar</span>
                      <div className={styles.modeRow} role="group" aria-label="Calendar link" title="Attach an optional calendar slot from pasted .ics text" style={{margin:0}}>
                        {calendarLink ? (
                          <>
                            <span className={styles.meta}>Attached • {new Date(calendarLink.start_iso).toLocaleString()} → {new Date(calendarLink.end_iso).toLocaleString()}</span>
                            <button type="button" className={styles.ghost} title="Detach current calendar slot" aria-label="Detach calendar" onClick={() => { try { detachCalendar(); setCalendarLink(null); bus.publish('calendar_detach', {}); announce('Calendar detached'); } catch (err: unknown) { try { bus.publish('hook_error', { hook: 'calendar', operation: 'detach', error: String((err as { message?: string })?.message || err) }); } catch {} } }}>Detach</button>
                          </>
                        ) : (
                          <>
                            <input aria-label="Paste .ics content" title="Paste raw .ics calendar event text here" className={styles.cdInput} placeholder="Paste .ics..." value={icsText} onChange={(e)=>{ setIcsText(e.target.value); if (icsError) setIcsError(null); }} style={{minWidth:260}} />
                            <input aria-label="Visit code (optional)" title="Optional short code / meeting ID (will be redacted if privacy is on)" className={styles.cdInput} placeholder="Code (optional)" value={calendarCode} onChange={(e)=>setCalendarCode(e.target.value)} style={{width:120}} />
                            <button
                              type="button"
                              className={styles.segBtn}
                              title="Attach calendar slot from pasted .ics data"
                              onClick={async()=>{
                                setIcsError(null);
                                try {
                                  // Minimal privacy guard: optionally redact code; warn if ICS content looks like PII
                                  const looksLikePII = (txt: string) => {
                                    try {
                                      if (!txt) return false;
                                      const email = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/.test(txt);
                                      const phone = /\+?\d{3}[\s-]?\d{3}[\s-]?\d{4}/.test(txt);
                                      const nameLike = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(txt);
                                      return email || phone || nameLike;
                                    } catch { return false; }
                                  };
                                  let safeCode = calendarCode || '';
                                  if (safeCode) {
                                    if (redactOpts.master) {
                                      try { safeCode = await scrubText(safeCode, redactOpts); } catch {}
                                    } else if (looksLikePII(safeCode)) {
                                      const doRedact = typeof window !== 'undefined' && typeof window.confirm === 'function'
                                        // eslint-disable-next-line no-alert -- Required for PII safety confirmation
                                        ? window.confirm('Code appears to contain personal information. Redact before attaching?')
                                        : true;
                                      if (doRedact) safeCode = '[REDACTED]';
                                    }
                                  }
                                  if (!redactOpts.master && looksLikePII(icsText)) {
                                    const proceed = typeof window !== 'undefined' && typeof window.confirm === 'function'
                                      // eslint-disable-next-line no-alert -- Required for PII safety confirmation before ICS attach
                                      ? window.confirm('ICS content may contain personal information (names/emails). Proceed to attach?')
                                      : true;
                                    if (!proceed) { announce('Attach canceled'); return; }
                                  }
                                  const link = await attachFromICS(icsText, safeCode || undefined);
                                  if (!link) { setIcsError('Invalid .ics (check UID / DTSTART / DTEND lines)'); announce('Invalid .ics'); return; }
                                  setCalendarLink(link);
                                  bus.publish('calendar_attach', { event_hash: link.event_hash });
                                  announce('Calendar attached');
                                } catch (err: unknown) { try { bus.publish('hook_error', { hook: 'calendar', operation: 'attach', error: String((err as { message?: string })?.message || err) }); } catch {} announce('Attach failed'); }
                              }}
                            >Attach</button>
                            <button type="button" className={styles.ghost} title="Insert sample .ics" onClick={()=>{
                              const sample = `BEGIN:VEVENT\nUID:example-${Date.now()}\nDTSTART:20251107T103000Z\nDTEND:20251107T110000Z\nEND:VEVENT`;
                              setIcsText(sample); setIcsError(null); announce('Sample .ics inserted');
                            }}>Sample</button>
                            {/* eslint-disable-next-line react/jsx-no-leaked-render -- icsError is string or null */}
                            {icsError && <div role="alert" className={styles.icsError}>{icsError}</div>}
                          </>
                        )}
                      </div>
                      {/* Overrun warning (if countdown > event duration) */}
                      {/* eslint-disable-next-line react/jsx-no-leaked-render -- calendarLink is object or null */}
                      {calendarLink && t.mode==='countdown' && (()=>{ const dur = (new Date(calendarLink.end_iso).getTime() - new Date(calendarLink.start_iso).getTime()); return t.countdownInitialMs > dur ? (
                        <div role="alert" className={styles.meta} style={{ color: '#ffb4a4', marginTop: 6 }}>Warning: Timer exceeds scheduled slot by {Engine.fmtHMS(t.countdownInitialMs - dur)}.</div>
                      ) : null })()}
                    </div>
                  </div>
                </div>
                ) : null}
              </article>

              {/* Summary */}
              <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-summary-title" style={{ ['--tm-card-accent' as string]: palette[4] }}>
                <header className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                  <h3 id="card-summary-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>Summary</h3>
                  <div className={`${styles.sectionActions} ${styles.cardActions}`} role="group" aria-label="Summary actions">
                    <button
                      type="button"
                      className={`${styles.ghost} ${styles.btnMini}`}
                      onClick={copyLiveSummary}
                      aria-label="Copy Summary as Markdown"
                      title="Copy Markdown (S)"
                    >Copy MD</button>
                    <button
                      type="button"
                      className={`${styles.ghost} ${styles.btnMini}`}
                      onClick={() => { try { navigator.clipboard?.writeText(JSON.stringify(Audit.buildFromState(t, Date.now(), Date.now()), null, 2)); announce('Copied summary JSON.'); } catch { announce('Copy failed.'); } }}
                      aria-label="Copy Summary as JSON"
                      title="Copy JSON"
                    >Copy JSON</button>
                  </div>
                </header>
                <p className={styles.microLabel} role="note" style={{ margin: '4px 0 8px' }}>
                  Exports mirror the on-screen totals and segments; use Copy MD or Copy JSON from the header.
                </p>
                <div className={styles.summaryGrid}>
                  <span>Total: {Engine.fmtHMS(Engine.progressMs(t))}</span>
                  <span>Mode: {t.mode}</span>
                  <span>End: {t.zeroBehavior}</span>
                  {(() => {
                    const tot = Engine.segmentTotals(t);
                    return (
                      <>
                        <span>Segments: Assessment {Engine.fmtHMS(tot.assessment)} · Therapy {Engine.fmtHMS(tot.therapy)}</span>
                        <span>Break {Engine.fmtHMS(tot.break)} · Documentation {Engine.fmtHMS(tot.documentation)}</span>
                      </>
                    );
                  })()}
                </div>
              </article>

              {/* Audit (this session) */}
              {auditOpen ? (
                <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-audit-title" style={{ ['--tm-card-accent' as string]: palette[5] }}>
                  <header className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                    <h3 id="card-audit-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>Audit trail (this session)</h3>
                    <div className={`${styles.sectionActions} ${styles.cardActions}`} role="group" aria-label="Audit trail actions">
                      <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={() => {
                        try { navigator.clipboard?.writeText(JSON.stringify(teleEventsRef.current, null, 2)); announce('Copied telemetry JSON.'); } catch { announce('Copy failed.'); }
                      }} aria-label="Copy telemetry JSON">Copy Telemetry</button>
                      {/* eslint-disable-next-line react/jsx-no-leaked-render -- finalizing is boolean */}
                      <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={() => finalizeAudit()} aria-label="Save audit record" disabled={finalizing}>{finalizing && <span className={styles.spinner} aria-hidden="true" />}<span className={styles.btnText}>Save Audit</span></button>
                    </div>
                  </header>
                  {finalizeError ? (
                    <div role="alert" className={styles.meta} style={{ color: '#ffb4a4', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>Audit unavailable: {finalizeError}</span>
                      <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={() => finalizeAudit()} aria-label="Retry finalize audit" disabled={finalizing}>{finalizing ? <span className={styles.spinner} aria-hidden="true" /> : null}<span className={styles.btnText}>Retry</span></button>
                    </div>
                  ) : null}
                  <div className={styles.tableWrap}>
                    <table className={`${styles.table} zebra`} data-hover="row" data-dense="true">
                      <thead><tr><th>Run ID</th><th>Checksum</th><th className={styles.num}>Active ms</th><th className={styles.num}>Laps</th><th className={styles.num}>Desyncs</th><th>Actions</th></tr></thead>
                      <tbody>
                        {auditRecords.map((r, i) => {
                          const run = String(r.run_id || '');
                          const sum = String(r.checksum || '');
                          return (
                            <tr key={`audit-local-${i}`}>
                              <td><code className={styles.codeMono}>{run}</code></td>
                              <td><code className={styles.codeMono} title={sum}>{sum.slice(0,12)}</code></td>
                              <td className={styles.num}>{r.metrics?.total_active_ms ?? 0}</td>
                              <td className={styles.num}>{r.metrics?.laps_count ?? 0}</td>
                              <td className={styles.num}>{r.metrics?.desync_events?.count ?? 0}</td>
                              <td>
                                <div className={`${styles.sectionActions} ${styles.cardActions}`}>
                                  <button
                                    type="button"
                                    className={`${styles.ghost} ${styles.btnMini}`}
                                    onClick={() => { try { navigator.clipboard?.writeText(sum); announce('Copied checksum.'); } catch { announce('Copy failed.'); } }}
                                    aria-label={`Copy checksum for run ${run}`}
                                  ><span className={styles.iconSm} aria-hidden="true">🔑</span><span className={styles.btnText}>Copy checksum</span></button>
                                  <button
                                    type="button"
                                    className={`${styles.ghost} ${styles.btnMini}`}
                                    onClick={() => { try { navigator.clipboard?.writeText(JSON.stringify(r, null, 2)); announce('Copied audit JSON.'); } catch { announce('Copy failed.'); } }}
                                    aria-label={`Copy audit JSON for run ${run}`}
                                  ><span className={styles.iconSm} aria-hidden="true">📄</span><span className={styles.btnText}>Copy JSON</span></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {auditRecords.length === 0 && (<tr><td colSpan={5} className={styles.muted}>No local audits yet</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </article>
              ) : null}

              {/* Laps */}
              <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-laps-title" style={{ ['--tm-card-accent' as string]: palette[6] }}>
                <header className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                  <h3 id="card-laps-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>Laps</h3>
                  <div className={`${styles.sectionActions} ${styles.cardActions}`} role="group" aria-label="Laps actions">
                    <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={() => {
                      const csv = buildCSV();
                      const ok = (() => { try { navigator.clipboard?.writeText(csv); return true; } catch { return false; } })();
                      if (!ok) {
                        try {
                          const ta = document.createElement('textarea');
                          ta.value = csv; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
                          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                          setUiErrorLaps('Copy failed; content selected for manual copy.');
                          setTimeout(() => setUiErrorLaps(null), 4000);
                        } catch {}
                      } else {
                        announce('Copied laps CSV.');
                      }
                    }} title="Copy CSV (C)">Copy CSV</button>
                    <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={() => {
                      const rows = lapRows().map(r => ({ index: r.idx, total: Engine.fmtHMS(r.atMs), split: fmtMMSS(r.splitMs), label: (r.label ?? "Unlabeled") }));
                      const json = JSON.stringify(rows);
                      const ok = (() => { try { navigator.clipboard?.writeText(json); return true; } catch { return false; } })();
                      if (!ok) {
                        try {
                          const ta = document.createElement('textarea');
                          ta.value = json; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
                          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                          setUiErrorLaps('Copy failed; content selected for manual copy.');
                          setTimeout(() => setUiErrorLaps(null), 4000);
                        } catch {}
                      } else {
                        announce('Copied laps JSON.');
                      }
                    }}>Copy JSON</button>
                  </div>
                </header>
                {/* P19: Inline error (laps) */}
                {uiErrorLaps ? (
                  <div role="alert" className={styles.errorInline}>{uiErrorLaps}</div>
                ) : null}
                {/* P19: Empty state hint (laps) */}
                {!uiErrorLaps && t.laps.length === 0 ? (
                  <div className={styles.emptyHint} role="note">No laps yet. Use the Lap shortcut (L) to record splits.</div>
                ) : null}
                {/* Mini timeline (replaces table). Three stable columns: index+segment, total, delta. */}
                <div className={styles.lapsTimeline} role="list" aria-label="Lap timeline" data-count={t.laps.length}>
                  {(() => {
                    const rows = lapRows();
                    if (!rows.length) return null; // empty state handled above
                    let prevAt = 0;
                    return rows.map((r, i) => {
                      const totalHMS = Engine.fmtHMS(r.atMs);
                      const deltaMs = Math.max(0, r.atMs - prevAt);
                      prevAt = r.atMs;
                      const deltaStr = fmtMMSS(deltaMs);
                      const isNew = i === rows.length - 1; // newest lap gets flash
                      const segLabel = (() => {
                        // derive segment name from containing segment; fallback label or 'Lap'
                        const seg = t.segments.find(s => s.startMs <= r.atMs && (s.endMs ?? Engine.progressMs(t)) >= r.atMs)?.kind;
                        return seg ? capitalize(seg) : (r.label ? r.label : 'Lap');
                      })();
                      const displayLabel = r.label ?? segLabel;
                      return (
                        <div
                          key={`lap-mini-${r.id}-${r.idx}`}
                          className={`${styles.lapItem} ${isNew ? styles.lapNew : ''}`.trim()}
                          role="listitem"
                          aria-label={`Lap ${r.idx} ${displayLabel}. Total ${totalHMS}. Split ${deltaStr}`}
                          data-idx={r.idx}
                        >
                          <div className={styles.lapColIdx}>
                            <span className={styles.lapIdx} aria-hidden="true">{r.idx}</span>
                            <LapInlineLabel
                              row={{ id: r.id, idx: r.idx, atMs: r.atMs, splitMs: r.splitMs, ...(r.label !== undefined ? { label: r.label } : {}) }}
                              defaultLabel={displayLabel}
                              onCommit={(value) => {
                                const v = (value ?? '').trim();
                                setT(prev => ({
                                  ...prev,
                                  laps: prev.laps.map(l => l.id === r.id ? (v ? { ...l, label: v } : { id: l.id, atMs: l.atMs }) : l)
                                }));
                              }}
                              ariaLabel={`Edit label for lap ${r.idx}`}
                            />
                          </div>
                          <div className={styles.lapColTime} aria-label={`Total time ${totalHMS}`}>{totalHMS}</div>
                          <div className={styles.lapColDelta} aria-label={`Split ${deltaStr}`}>{deltaStr}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </article>

              {/* Recent sessions (with local Undo for clear) */}
              <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-recent-title" style={{ ['--tm-card-accent' as string]: palette[7] }}>
                <header className={`${styles.sectionHeader} ${styles.cardHeader}`}>
                  <h3 id="card-recent-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>Recent Sessions</h3>
                  <div className={`${styles.sectionActions} ${styles.cardActions}`} role="group" aria-label="Recent sessions actions">
                    <button
                      type="button"
                      className={`${styles.ghost} ${styles.btnMini}`}
                      onClick={() => {
                        const a = listAudits(5)[0]; if (!a) return;
                        const md = Audit.summaryMarkdown(a);
                        let ok = false;
                        try { navigator.clipboard?.writeText(md); ok = true; } catch {}
                        if (!ok) {
                          try {
                            const ta = document.createElement('textarea');
                            ta.value = md; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px';
                            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                            ok = true;
                          } catch { ok = false; }
                        }
                        if (ok) { announce('Copied last session Markdown.'); }
                        else { setUiErrorRecent('Copy failed; content selected for manual copy.'); setTimeout(() => setUiErrorRecent(null), 4000); }
                      }}
                    >Copy Last MD</button>
                    <button type="button" className={`${styles.danger} ${styles.btnMiniDanger}`} onClick={handleClearHistoryWithUndo} aria-label="Clear history (undo available)">Clear History</button>
                  </div>
                </header>
                {/* P19: Inline error (recent sessions) */}
                {uiErrorRecent ? (
                  <div role="alert" className={styles.errorInline}>{uiErrorRecent}</div>
                ) : null}
                {/* P19: Empty state hint (recent sessions) */}
                {!uiErrorRecent && recentAudits.length === 0 && !recentUndoVisible ? (
                  <div className={styles.emptyHint} role="note">No sessions yet. After finishing and saving audits they will appear here.</div>
                ) : null}
                {recentUndoVisible ? (
                  <div role="status" aria-live="polite" className={styles.meta} style={{ display:'flex', gap:8, alignItems:'center', margin:'4px 0 8px' }}>
                    <span>History cleared.</span>
                    <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={handleUndoClearHistory} aria-label="Undo clear history">Undo</button>
                    <button type="button" className={`${styles.ghost} ${styles.btnMini}`} onClick={handleDismissUndo} aria-label="Dismiss undo">Dismiss</button>
                    <span aria-hidden="true" style={{opacity:.6}}>({Math.ceil(clearUndoTimeoutMs/1000)}s)</span>
                  </div>
                ) : null}
                {!recentUndoVisible && (
                  <div className={styles.tableWrap}>
                    <table className={`${styles.table} zebra`} data-hover="row" data-dense="true">
                      <thead><tr><th>Start</th><th>End</th><th className={styles.num}>Duration</th><th>Mode</th><th>End</th><th>Run ID</th></tr></thead>
                      <tbody>
                        {recentAudits.map((a, i) => (
                          <tr key={`audit-${a.id}-${i}`}>
                            <td>{Audit.fmtIso(a.startedAt)}</td>
                            <td>{Audit.fmtIso(a.endedAt)}</td>
                            <td className={styles.num}>{Engine.fmtHMS(a.durationMs)}</td>
                            <td>{a.mode}</td>
                            <td>{a.zeroBehavior}</td>
                            <td><code>{runIds[a.id] ? runIds[a.id].slice(0, 12) : '…'}</code></td>
                          </tr>
                        ))}
                        {/* Empty fallback removed; handled by hint above */}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>

              {/* Export & Copy (single source of truth for insert/export/print) */}
              <article className={`${styles.section} ${styles.card}`} role="region" aria-labelledby="card-export-title" style={{ ['--tm-card-accent' as string]: palette[8] }}>
                <header className={`${styles.sectionHeader} ${styles.cardHeader}`} aria-busy={exportBusy}>
                  <h3 id="card-export-title" className={`${styles.sectionTitle} ${styles.cardTitle}`}>Export & Copy</h3>
                  <span aria-live="polite" className={styles.exportStatus}>Redaction: {redactOpts.master ? 'ON' : 'OFF'}</span>
                </header>
                <p className={styles.microLabel} role="note">Choose a format below; options wrap automatically on narrow screens.</p>
                <div className={styles.exportButtonRow} role="group" aria-label="Export actions">
                  {/* Insert into Note */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={insertIntoNote}
                    title="Insert Markdown into current Note"
                    aria-label="Insert Markdown into current Note"
                  >
                    <HiDocumentText className={styles.exportBtnIcon} />
                    <span>Insert into Note</span>
                  </button>

                  {/* Export MD */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={async () => {
                      setExportBusy(true);
                      try {
                        let md = buildDeterministicMDFromState(t);
                        md = await scrubText(md, redactOpts);
                        const { payload } = buildCanonicalPayload(t, Date.now());
                        const effective = await scrubJSON(payload, redactOpts);
                        const checksum = await hashWithWorker(JSON.stringify(effective));
                        md += `\n\nChecksum: ${checksum}\nRedaction: ${redactOpts.master ? 'ON' : 'OFF'}`;
                        downloadText(`therapy-timer-${Date.now()}.md`, md, 'text/markdown;charset=utf-8');
                        announce(`Exported MD (${redactOpts.master ? 'redacted' : 'full'})`);
                        try { addTeleEvent('export_md', { export_kind: 'md' }); } catch {}
                      } catch { announce('Export unavailable. Redaction error.'); }
                      finally { setExportBusy(false); }
                    }}
                    title="Export current summary as Markdown"
                    aria-label="Export Markdown"
                  >
                    <FiFileText className={styles.exportBtnIcon} />
                    <span>Export MD</span>
                  </button>

                  {/* Export JSON */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={downloadJSON}
                    title="Export canonical JSON (with checksum)"
                    aria-label="Export JSON"
                  >
                    <FiDownload className={styles.exportBtnIcon} />
                    <span>Export JSON</span>
                  </button>

                  {/* Export CSV (laps) */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={async () => {
                      setExportBusy(true);
                      try {
                        let csv = buildCSV();
                        csv = await scrubText(csv, redactOpts);
                        downloadText(`therapy-timer-laps-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8');
                        announce(`Exported CSV (laps) (${redactOpts.master ? 'redacted' : 'full'})`);
                        try { addTeleEvent('export_csv', { export_kind: 'csv' }); } catch {}
                      } catch { announce('Export unavailable. Redaction error.'); }
                      finally { setExportBusy(false); }
                    }}
                    title="Export laps CSV"
                    aria-label="Export laps as CSV"
                    disabled={t.laps.length === 0}
                  >
                    <FiTable className={styles.exportBtnIcon} />
                    <span>CSV (laps)</span>
                  </button>

                  {/* Export CSV (segments) */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={() => {
                      const seg = Engine.segmentTotals(t);
                      const total = Math.max(1, Engine.progressMs(t));
                      const row = (name: string, ms: number, splits: number) => {
                        const pct = Math.round((ms/total)*1000)/10;
                        const avg = splits ? Math.round(ms/splits) : 0;
                        return `${name},${ms|0},${pct.toFixed(1)},${splits},${avg|0}`;
                      };
                      const spans = t.segments;
                      const count = (k: Engine.SegmentKind) => spans.filter(s => s.kind === k).length;
                      const lines = [
                        'name,total_ms,pct,splits,avg_split_ms',
                        row('Assessment', seg.assessment, count('assessment')),
                        row('Break', seg.break, count('break')),
                        row('Documentation', seg.documentation, count('documentation')),
                      ];
                      downloadText(`therapy-timer-segments-${Date.now()}.csv`, lines.join('\n'), 'text/csv;charset=utf-8');
                      try { addTeleEvent('export_csv', { export_kind: 'csv' }); } catch {}
                    }}
                    title="Export segments CSV"
                    aria-label="Export segments as CSV"
                    disabled={t.segments.length === 0}
                  >
                    <FiTable className={styles.exportBtnIcon} />
                    <span>CSV (segments)</span>
                  </button>

                  {/* Export PDF */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={async () => {
                      setExportBusy(true);
                      try {
                        // Build print-safe HTML and render to PDF
                        const rec = Audit.buildFromState(t, Date.now(), Date.now());
                        const html = Audit.summaryHTML(rec);
                        const container = document.createElement('div');
                        container.innerHTML = html;
                        // Use the body content to avoid duplicating <html>
                        const node = container.querySelector('body') || container;
                        const opt = {
                          margin:       [10, 10, 10, 10],
                          filename:     `therapy-timer-${Date.now()}.pdf`,
                          image:        { type: 'jpeg', quality: 0.98 },
                          html2canvas:  { scale: 2, useCORS: true },
                          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        } as const;
                        // html2pdf has a fluent API; return value isn't consistently a Promise across versions.
                        // Fire-and-forget the save; the file dialog will open.
                        type Html2PdfLib = { (): { from: (el: HTMLElement) => { set: (opts: unknown) => { save: () => void } } } };
                        (html2pdf as Html2PdfLib)().from(node as HTMLElement).set(opt).save();
                        announce(`Exported PDF`);
                        try { addTeleEvent('export_pdf', { export_kind: 'pdf' }); } catch {}
                      } catch { announce('Export PDF unavailable.'); }
                      finally { setExportBusy(false); }
                    }}
                    title="Export current summary as PDF"
                    aria-label="Export PDF"
                  >
                    <FiDownload className={styles.exportBtnIcon} />
                    <span>Export PDF</span>
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    className={styles.exportBtn}
                    onClick={async () => {
                      setExportBusy(true);
                      try {
                        // Use HTML summary and open print dialog directly
                        const rec = Audit.buildFromState(t, Date.now(), Date.now());
                        const html = Audit.summaryHTML(rec);
                        const ok = openPrintWindow(html);
                        if (!ok) {
                          // popup blocked: fallback to downloading HTML
                          downloadText(`therapy-timer-${Date.now()}.html`, html, 'text/html;charset=utf-8');
                        }
                        announce('Print dialog opened');
                        try { addTeleEvent('export_pdf', { export_kind: 'pdf' }); } catch {}
                      } catch { announce('Print unavailable.'); }
                      finally { setExportBusy(false); }
                    }}
                    title="Print current summary"
                    aria-label="Print summary"
                  >
                    <FiPrinter className={styles.exportBtnIcon} />
                    <span>Print</span>
                  </button>
                </div>
                <div className={styles.meta}>Exports include session duration, segment totals, and lap table. Markdown mirrors the on-screen summary.</div>
              </article>

              {/* Info / footer card */}
              <article className={`${styles.section} ${styles.card} ${styles.footerCard}`} style={{ ['--tm-card-accent' as string]: palette[9] }}>
                <div className={styles.meta}>
                  State persists · Audit logs recent sessions · Keys: Space Start/Pause · L Lap · R Reset · 1–5 Presets (countdown) · C CSV · S Summary · Esc Close
                </div>
                <footer role="contentinfo" className={styles.meta} style={{ marginTop: 6, opacity: .8 }}>
                  <div role="note" aria-label="For documentation support only">For documentation support only — not directives or medical advice.</div>
                </footer>
              </article>
            </section>
          </div>
          </>
        ) : (
          // Radical split layout
          <div className={styles.container}>
            <div className={styles.splitShell}>
              <div className={styles.paneTimer}>
                {/* Timer side: hero, optional ribbon, controls & records (reuse existing sections) */}
                {/* Hero */}
                <section className={`${styles.hero}`} aria-label="Timer readout">
                  {/* Intensity Bar with Effects Toggle - Positioned above timer */}
                  {radicalOn && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '320px',
                      maxWidth: '85%',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      {/* Effects On/Off Toggle */}
                      <button
                        onClick={() => setEffectsOn(!effectsOn)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          background: effectsOn 
                            ? 'linear-gradient(135deg, rgba(0, 166, 215, 0.25), rgba(16, 185, 129, 0.2))'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: effectsOn 
                            ? '1px solid rgba(0, 166, 215, 0.4)'
                            : '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: effectsOn 
                            ? '0 2px 8px rgba(0, 166, 215, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                            : 'none',
                        }}
                        aria-label={effectsOn ? 'Disable visual effects' : 'Enable visual effects'}
                        title={effectsOn ? 'Effects On' : 'Effects Off'}
                      >
                        <FiZap
                          size={14}
                          style={{
                            color: effectsOn ? 'rgba(0, 166, 215, 1)' : 'rgba(255, 255, 255, 0.4)',
                            transition: 'color 0.2s',
                          }}
                        />
                      </button>
                      <label style={{
                        fontSize: '9px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.65)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        whiteSpace: 'nowrap',
                      }}>
                        Intensity
                      </label>
                      <div style={{
                        position: 'relative',
                        flex: 1,
                        height: '3px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        {/* Progress fill */}
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${effectsIntensity * 100}%`,
                          background: 'linear-gradient(90deg, rgba(0, 166, 215, 1), rgba(16, 185, 129, 0.95))',
                          borderRadius: '2px',
                          transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 0 8px rgba(0, 166, 215, 0.4)',
                        }} />
                        {/* Invisible input overlay */}
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round(effectsIntensity * 100)}
                          onChange={(e) => setEffectsIntensity(Number(e.target.value) / 100)}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            padding: 0,
                            opacity: 0,
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                          }}
                          aria-label="Effects intensity"
                        />
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'rgba(0, 166, 215, 1)',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: '36px',
                        textAlign: 'right',
                        letterSpacing: '-0.3px',
                      }}>
                        {Math.round(effectsIntensity * 100)}%
                      </span>
                    </div>
                  )}
                  {/* reuse the same hero JSX by invoking an IIFE */}
                  <div className={styles.container}>
                    {(() => {
                      const themeClass = activeSegment ? styles[`theme_${activeSegment}`] : "";
                      // Phase 1: Apply time-of-day and intensity classes in radical mode
                      const dynamicClasses = radicalOn && effectsOn 
                        ? `${timeOfDayClass} ${intensityClass}` 
                        : '';
                      return (
                        <div 
                          ref={heroCanvasRef}
                          className={`${styles.heroCanvas} ${themeClass} ${dynamicClasses} ${(pulse ? styles.pulseOnce : "")} ${(beatFlash ? styles.tickFlash : "")}`.trim()} 
                          data-hh={hero.showHours ? 'on' : 'off'}
                        >
                          {/* Radial counter (radical mode) */}
                          {(() => {
                            // Determine progress ratio: session for countdown, otherwise current segment
                            const showSessionBar = t.mode === 'countdown' && sessionTotalMs > 0;
                            const progressRatio = showSessionBar ? Math.max(0, Math.min(1, sessionP)) : Math.max(0, Math.min(1, segP));
                            // Bigger ring: enlarge radius & viewBox mapping. Previous radius 110.
                            const radius = 128; // main progress ring radius
                            const circumference = 2 * Math.PI * radius;
                            const dashoffset = circumference * (1 - progressRatio);
                            // Accessible label: remaining for countdown, elapsed otherwise
                            const elapsedMs = Engine.progressMs(t);
                            let ariaLabel: string;
                            if (t.mode === 'countdown') {
                              const remaining = Math.max(0, t.countdownInitialMs - elapsedMs);
                              ariaLabel = `Remaining ${Engine.fmtHMS(remaining)} of ${Engine.fmtHMS(t.countdownInitialMs)}`;
                            } else {
                              ariaLabel = `Elapsed ${Engine.fmtHMS(elapsedMs)}`;
                            }
                            // Gradient colors based on selected style
                            const seg = activeSegment ?? 'none';
                            const gradMap: Record<string, [string,string]> = {
                              assessment: ['#7A89FF','#A774FF'],
                              therapy: ['#00C6FF','#0072FF'],
                              break: ['#FFC247','#FF7A00'],
                              documentation: ['#00FFC6','#00A6D7'],
                              none: ['#8a8f98','#c8ccd1']
                            };
                            // Color palette cycling for party
                            const paletteCycle: [string,string][] = [
                              ['#ff6ec4','#7873f5'],
                              ['#42e695','#3bb2b8'],
                              ['#f6d365','#fda085'],
                              ['#a1c4fd','#c2e9fb'],
                              ['#d4fc79','#96e6a1'],
                              ['#84fab0','#8fd3f4'],
                              ['#fccb90','#d57eeb']
                            ];
                            const cycleIdx = (effectsOn && colorStyle==='party') ? Math.floor((elapsedMs/1000) % paletteCycle.length) : -1;
                            let gradA: string, gradB: string;
                            if (colorStyle === 'classic') {
                              gradA = 'var(--accent, #00A6D7)'; gradB = '#46d3ff';
                            } else if (colorStyle === 'party' && cycleIdx >= 0) {
                              [gradA, gradB] = paletteCycle[cycleIdx];
                            } else {
                              [gradA, gradB] = (gradMap[seg] ?? gradMap.none);
                            }
                            return (
                              // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Context menu trigger for timer controls
                              <div className={`${styles.radHero} ${effectsOn ? styles.radEffectsOn: ''}`} style={{ ['--fx-glow' as string]: String(effectsIntensity), ['--fx-amb' as string]: String(0.08 + effectsIntensity*0.28), position: 'relative' }} onContextMenu={handleContextMenu}>
                                {/* Phase 1.2: Swipe Gesture Visual Feedback */}
                                {/* eslint-disable-next-line react/jsx-no-leaked-render -- swipeDirection is null or string */}
                                {swipeDirection && (
                                  <div className={styles.swipeIndicator} style={{ opacity: isDragging ? 0.9 : 0 }}>
                                    <div className={`${styles.swipeArrow} ${
                                      swipeDirection === 'up' ? styles.swipeArrowUp :
                                      swipeDirection === 'down' ? styles.swipeArrowDown :
                                      swipeDirection === 'left' ? styles.swipeArrowLeft :
                                      styles.swipeArrowRight
                                    }`}>
                                      {swipeDirection === 'up' ? '↑' :
                                       swipeDirection === 'down' ? '↓' :
                                       swipeDirection === 'left' ? '←' :
                                       '→'}
                                    </div>
                                  </div>
                                )}
                                <div className={`${styles.radRingWrap} ${effectsOn ? 'fxOn': ''} ${(effectsOn && colorStyle==='party') ? 'fxCycle' : ''}`} role="img" aria-label={ariaLabel}>
                                  {/* Phase 1: Particle System - WebGL ring around radical timer */}
                                  {/* eslint-disable-next-line react/jsx-no-leaked-render -- radicalOn && effectsOn are booleans */}
                                  {radicalOn && effectsOn && !reducedMotion && (
                                    <ParticleRing
                                      isRunning={t.phase === 'running'}
                                      progress={progressRatio}
                                      intensity={
                                        intensityClass === styles.intensity_high ? 0.9 :
                                        intensityClass === styles.intensity_medium ? 0.5 :
                                        0.2
                                      }
                                      particleCount={effectsIntensity > 0.7 ? 400 : 300}
                                    />
                                  )}
                                  <svg className={styles.radSvg} viewBox="0 0 300 300" aria-hidden="true">
                                    <defs>
                                      <linearGradient id="radGradMain" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={gradA} />
                                        <stop offset="100%" stopColor={gradB} />
                                      </linearGradient>
                                      <linearGradient id="radGradDeco1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={gradB} stopOpacity="0.55" />
                                        <stop offset="100%" stopColor={gradA} stopOpacity="0.15" />
                                      </linearGradient>
                                      <linearGradient id="radGradDeco2" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={gradA} stopOpacity="0.35" />
                                        <stop offset="100%" stopColor={gradB} stopOpacity="0.05" />
                                      </linearGradient>
                                      {/* Light sweep gradient for rotating glare */}
                                      <linearGradient id="radGradSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0" />
                                        <stop offset="35%" stopColor="#ffffff" stopOpacity="0.55" />
                                        <stop offset="65%" stopColor="#ffffff" stopOpacity="0.0" />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                                      </linearGradient>
                                    </defs>
                                    {/* Outer decorative rings (aria-hidden) */}
                                    <circle className={styles.radDeco1} cx={150} cy={150} r={145} aria-hidden="true" />
                                    <circle className={styles.radDeco2} cx={150} cy={150} r={158} aria-hidden="true" />
                                    <circle className={styles.radDeco3} cx={150} cy={150} r={170} aria-hidden="true" />
                                    {/* Track + Progress (center shifted due to new viewBox) */}
                                    <circle className={styles.radTrack} cx={150} cy={150} r={radius} />
                                    <circle
                                      className={styles.radProg}
                                      cx={150}
                                      cy={150}
                                      r={radius}
                                      style={{ strokeDasharray: `${circumference}`, strokeDashoffset: `${dashoffset}`, stroke: 'url(#radGradMain)' }}
                                    />
                                    {/* Rotating light sweep overlay */}
                                    <g className={styles.radSweep} style={{ transformOrigin: '150px 150px' }} aria-hidden="true">
                                      <circle
                                        cx={150}
                                        cy={150}
                                        r={radius + 6}
                                        fill="none"
                                        stroke="url(#radGradSweep)"
                                        strokeWidth={8}
                                        strokeLinecap="round"
                                        strokeDasharray="28 400"
                                      />
                                    </g>
                                    {/* Time Crystal Effect: Crystalline geometry morphing with progress */}
                                    <g className={styles.radCrystal} aria-hidden="true">
                                      {/* Generate 8 crystalline spikes radiating from center */}
                                      {Array.from({ length: 8 }).map((_, i) => {
                                        const angle = (i / 8) * Math.PI * 2;
                                        const baseLength = 35;
                                        const progressModulation = Math.sin(progressRatio * Math.PI) * 15; // Grows/shrinks with progress
                                        const spikeLength = baseLength + progressModulation;
                                        const x1 = 150 + Math.cos(angle) * (radius - 25);
                                        const y1 = 150 + Math.sin(angle) * (radius - 25);
                                        const x2 = 150 + Math.cos(angle) * (radius - 25 + spikeLength);
                                        const y2 = 150 + Math.sin(angle) * (radius - 25 + spikeLength);
                                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                                      })}
                                      {/* Inner crystalline hexagon */}
                                      <polygon
                                        points={Array.from({ length: 6 }).map((_, i) => {
                                          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
                                          const hexRadius = 30 + progressRatio * 15; // Expands with progress
                                          const x = 150 + Math.cos(angle) * hexRadius;
                                          const y = 150 + Math.sin(angle) * hexRadius;
                                          return `${x},${y}`;
                                        }).join(' ')}
                                      />
                                    </g>
                                    {/* Progress spark at the leading edge */}
                                    <circle
                                      className={styles.radSpark}
                                      cx={150 + Math.cos(progressRatio * Math.PI * 2 - Math.PI / 2) * radius}
                                      cy={150 + Math.sin(progressRatio * Math.PI * 2 - Math.PI / 2) * radius}
                                      r={effectsIntensity > 0.7 ? 5 : 4}
                                      aria-hidden="true"
                                    />
                                  </svg>
                                  <div className={styles.radDigits} data-testid="timer-digits">
                                    <div 
                                      ref={readoutRef} 
                                      className={styles.radDigitsInner} 
                                      style={radicalOn && effectsOn ? parallaxStyle : undefined}
                                      aria-hidden="true"
                                    >
                                      {/* eslint-disable-next-line react/jsx-no-leaked-render -- hero.showHours is boolean */}
                                      {hero.showHours && (
                                        <>
                                          <span>{hero.hh[0]}</span>
                                          <span>{hero.hh[1]}</span>
                                          <span className={styles.sep}>:</span>
                                        </>
                                      )}
                                      <span>{hero.mm[0]}</span>
                                      <span>{hero.mm[1]}</span>
                                      <span className={styles.sep}>:</span>
                                      <span>{hero.ss[0]}</span>
                                      <span>{hero.ss[1]}</span>
                                    </div>
                                    <div className={styles.radSub}>{activeSegment ? capitalize(activeSegment) : (finished ? 'Finished' : (running ? 'Running' : 'Idle'))}</div>
                                  </div>
                                </div>
                                <div ref={srRef} className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true" />
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}

                  </div>
                </section>
                {/* Controls etc. reuse existing JSX blocks by rendering the same below */}
                <section className={`${styles.controlsRecords}`} aria-label="Controls and records">
                  <div className={styles.container}>
                    {/* VISUALS section removed - now merged into Analytics Dashboard header */}
                  </div>
                </section>
                {/* Remove extra spacer to minimize gap before tabs */}
                <div aria-hidden="true" style={{ height: 0 }} />
              </div>
              {/* Splitter removed: fixed layout */}
              {/* Notes/Analytics pane with tabs */}
              <aside className={`${styles.paneNotes} ${isNarrow && notesCollapsed ? styles.collapsedNotes : ''}`} aria-label={radicalTab === 'notes' ? 'Notes' : 'Analytics'}>
                  {/* Unified Card Container for Tab Navigation + Voice Recorder */}
                  <div className={styles.unifiedCard}>
                    {/* Primary Tab Navigation — Card Header */}
                    <div className={styles.tabNavBar} role="tablist" aria-label="Primary sections">
                      <button
                        type="button"
                        className={`${styles.segBtn} ${radicalTab === 'notes' ? styles.segBtnActive : ''}`}
                        onClick={() => { setRadicalTab('notes'); if (showAnalytics) closeAnalytics(); }}
                        aria-pressed={radicalTab === 'notes'}
                      >
                        Notes
                      </button>
                      <button
                        type="button"
                        className={`${styles.segBtn} ${radicalTab === 'analytics' ? styles.segBtnActive : ''}`}
                        onClick={() => { setRadicalTab('analytics'); if (!showAnalytics) toggleAnalytics(); }}
                        aria-pressed={radicalTab === 'analytics'}
                      >
                        Analytics
                      </button>
                      <button
                        type="button"
                        className={`${styles.segBtn} ${radicalTab === 'collaboration' ? styles.segBtnActive : ''}`}
                        onClick={() => { setRadicalTab('collaboration'); if (showAnalytics) closeAnalytics(); }}
                        aria-pressed={radicalTab === 'collaboration'}
                      >
                        Collaboration
                      </button>
                    </div>

                    {/* Voice Recorder Section — Card Body (seamless integration) */}
                    {Boolean(radicalOn && patient) && (
                      <div className={styles.cardBody}>
                        <VoiceRecorder
                          patientId={patient?.id as string}
                          patientName={patient?.name as string}
                          sessionSegment={activeSegment || 'General'}
                          onRecordingComplete={(recording) => {
                            /* eslint-disable-next-line no-console */
                            console.info('Recording completed:', recording.id, recording.duration);
                          }}
                        />
                      </div>
                    )}
                  </div>

                {radicalTab === 'notes' ? (
                  <div className={panelStyles.notesContainer}>
                    <div className={panelStyles.notesContent}>
                      {/* Toolbar Section */}
                      <div className={panelStyles.notesSection}>
                        <div className={panelStyles.notesSectionHeader}>
                          <FiSettings size={13} />
                          <span>Editor Controls</span>
                        </div>
                        <div className={panelStyles.notesToolbar}>
                          <div className={panelStyles.toolbarSection}>
                            <label className={panelStyles.toolbarCheckbox}>
                              <input 
                                type="checkbox" 
                                checked={notesPreviewOn} 
                                onChange={(e) => setNotesPreviewOn(e.target.checked)} 
                              />
                              <span>Preview Mode</span>
                            </label>
                          </div>
                          
                          <div className={panelStyles.toolbarSection}>
                            <span className={panelStyles.toolbarLabel}>Actions:</span>
                            <button 
                              type="button" 
                              className={`${panelStyles.toolbarButton} ${panelStyles.toolbarButtonDanger}`}
                              onClick={() => { 
                                if (notesValue.length > 0) { 
                                  setNotesConfirmOpen(true); 
                                } else { 
                                  setNotesValue(''); 
                                } 
                              }} 
                              aria-label="Clean notes" 
                              title="Clean notes"
                            >
                              <FiTrash2 size={11} style={{ marginRight: '4px', display: 'inline' }} />
                              Clean
                            </button>
                          </div>
                          
                          {patient && encounter && (
                            <div className={panelStyles.toolbarSection}>
                              <span className={panelStyles.toolbarLabel}>Export:</span>
                              <button 
                                type="button" 
                                className={`${panelStyles.toolbarButton} ${panelStyles.toolbarButtonPrimary}`}
                                onClick={importSessionSummary} 
                                disabled={!regActions || (!notesValue && t.elapsedMs < 1000)} 
                                title="Append session summary to patient Summary slot" 
                                aria-label="Import session summary"
                              >
                                <FiArrowRight size={11} style={{ marginRight: '4px', display: 'inline' }} />
                                Summary
                              </button>
                              <button 
                                type="button" 
                                className={`${panelStyles.toolbarButton} ${panelStyles.toolbarButtonPrimary}`}
                                onClick={importNotesToPlan} 
                                disabled={!regActions || !notesValue} 
                                title="Append notes to patient Plan slot" 
                                aria-label="Import notes"
                              >
                                <FiArrowRight size={11} style={{ marginRight: '4px', display: 'inline' }} />
                                Notes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SOAP Templates Section */}
                      <div className={panelStyles.notesSection}>
                        <div className={panelStyles.notesSectionHeader}>
                          <FiFileText size={13} />
                          <span>Clinical Templates</span>
                        </div>
                        <div className={panelStyles.soapTemplates}>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('subjective')} 
                            aria-label="Insert Subjective"
                          >
                            <div className={panelStyles.soapCardLabel}>Subjective</div>
                          </button>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('objective')} 
                            aria-label="Insert Objective"
                          >
                            <div className={panelStyles.soapCardLabel}>Objective</div>
                          </button>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('assessment')} 
                            aria-label="Insert Assessment"
                          >
                            <div className={panelStyles.soapCardLabel}>Assessment</div>
                          </button>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('plan')} 
                            aria-label="Insert Plan"
                          >
                            <div className={panelStyles.soapCardLabel}>Plan</div>
                          </button>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('risk')} 
                            aria-label="Insert Risk block"
                          >
                            <div className={panelStyles.soapCardLabel}>Risk Block</div>
                          </button>
                          <button 
                            className={panelStyles.soapCard} 
                            onClick={() => onSnippet('followup')} 
                            aria-label="Insert Follow-up checklist"
                          >
                            <div className={panelStyles.soapCardLabel}>Follow-up</div>
                          </button>
                        </div>
                      </div>

                      {/* Notes Editor Section */}
                      <div className={panelStyles.notesSection}>
                        <div className={panelStyles.notesSectionHeader}>
                          <FiEdit size={13} />
                          <span>Documentation Editor</span>
                        </div>
                        
                        {/* Formatting Toolbar */}
                        <div className={panelStyles.formattingToolbar}>
                          <div className={panelStyles.toolbarGroup}>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = notesValue.substring(start, end);
                                const newText = notesValue.substring(0, start) + '**' + selectedText + '**' + notesValue.substring(end);
                                setNotesValue(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 2, end + 2);
                                }, 0);
                              }}
                              title="Bold (Ctrl+B)"
                              aria-label="Bold"
                            >
                              <FiBold size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = notesValue.substring(start, end);
                                const newText = notesValue.substring(0, start) + '*' + selectedText + '*' + notesValue.substring(end);
                                setNotesValue(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 1, end + 1);
                                }, 0);
                              }}
                              title="Italic (Ctrl+I)"
                              aria-label="Italic"
                            >
                              <FiItalic size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = notesValue.substring(start, end);
                                const newText = notesValue.substring(0, start) + '<u>' + selectedText + '</u>' + notesValue.substring(end);
                                setNotesValue(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 3, end + 3);
                                }, 0);
                              }}
                              title="Underline (Ctrl+U)"
                              aria-label="Underline"
                            >
                              <FiUnderline size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = notesValue.substring(start, end);
                                const newText = notesValue.substring(0, start) + '~~' + selectedText + '~~' + notesValue.substring(end);
                                setNotesValue(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 2, end + 2);
                                }, 0);
                              }}
                              title="Strikethrough"
                              aria-label="Strikethrough"
                            >
                              <FiMinus size={14} style={{textDecoration: 'line-through'}} />
                            </button>
                          </div>

                          <div className={panelStyles.toolbarDivider}></div>

                          <div className={panelStyles.toolbarGroup}>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const lineStart = notesValue.lastIndexOf('\n', start - 1) + 1;
                                const newText = notesValue.substring(0, lineStart) + '# ' + notesValue.substring(lineStart);
                                setNotesValue(newText);
                                setTimeout(() => textarea.focus(), 0);
                              }}
                              title="Heading 1"
                              aria-label="Heading 1"
                            >
                              H1
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const lineStart = notesValue.lastIndexOf('\n', start - 1) + 1;
                                const newText = notesValue.substring(0, lineStart) + '## ' + notesValue.substring(lineStart);
                                setNotesValue(newText);
                                setTimeout(() => textarea.focus(), 0);
                              }}
                              title="Heading 2"
                              aria-label="Heading 2"
                            >
                              H2
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const lineStart = notesValue.lastIndexOf('\n', start - 1) + 1;
                                const newText = notesValue.substring(0, lineStart) + '### ' + notesValue.substring(lineStart);
                                setNotesValue(newText);
                                setTimeout(() => textarea.focus(), 0);
                              }}
                              title="Heading 3"
                              aria-label="Heading 3"
                            >
                              H3
                            </button>
                          </div>

                          <div className={panelStyles.toolbarDivider}></div>

                          <div className={panelStyles.toolbarGroup}>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const lineStart = notesValue.lastIndexOf('\n', start - 1) + 1;
                                const newText = notesValue.substring(0, lineStart) + '- ' + notesValue.substring(lineStart);
                                setNotesValue(newText);
                                setTimeout(() => textarea.focus(), 0);
                              }}
                              title="Bullet List"
                              aria-label="Bullet List"
                            >
                              <FiList size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const lineStart = notesValue.lastIndexOf('\n', start - 1) + 1;
                                const newText = notesValue.substring(0, lineStart) + '1. ' + notesValue.substring(lineStart);
                                setNotesValue(newText);
                                setTimeout(() => textarea.focus(), 0);
                              }}
                              title="Numbered List"
                              aria-label="Numbered List"
                            >
                              1.
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              onClick={() => {
                                const textarea = notesRef.current;
                                if (!textarea) return;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selectedText = notesValue.substring(start, end);
                                const newText = notesValue.substring(0, start) + '`' + selectedText + '`' + notesValue.substring(end);
                                setNotesValue(newText);
                                setTimeout(() => {
                                  textarea.focus();
                                  textarea.setSelectionRange(start + 1, end + 1);
                                }, 0);
                              }}
                              title="Code"
                              aria-label="Code"
                            >
                              <FiCode size={14} />
                            </button>
                          </div>

                          <div className={panelStyles.toolbarDivider}></div>

                          <div className={panelStyles.toolbarGroup}>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              title="Align Left"
                              aria-label="Align Left"
                            >
                              <FiAlignLeft size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              title="Align Center"
                              aria-label="Align Center"
                            >
                              <FiAlignCenter size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              title="Align Right"
                              aria-label="Align Right"
                            >
                              <FiAlignRight size={14} />
                            </button>
                            <button 
                              type="button"
                              className={panelStyles.formatBtn}
                              title="Justify"
                              aria-label="Justify"
                            >
                              <FiAlignJustify size={14} />
                            </button>
                          </div>
                        </div>

                        <div className={panelStyles.notesEditorWrapper}>
                          <textarea 
                            ref={notesRef} 
                            className={panelStyles.notesEditor}
                            value={notesValue} 
                            onChange={(e) => setNotesValue(e.target.value)} 
                            placeholder="Begin your clinical documentation here...&#10;&#10;Tip: Use keyboard shortcuts (Alt+Backspace to clear) and template buttons above for structured notes."
                            aria-label="Notes editor" 
                            onKeyDown={(e) => { 
                              if (e.altKey && e.key === 'Backspace') { 
                                e.preventDefault(); 
                                if (notesValue.length > 0) { 
                                  setNotesConfirmOpen(true); 
                                } else { 
                                  setNotesValue(''); 
                                  announce('Notes cleared'); 
                                } 
                              } 
                            }} 
                          />
                          {notesPreviewOn && (
                            <div className={panelStyles.notesPreviewPanel} dangerouslySetInnerHTML={{ __html: previewHTML }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : radicalTab === 'analytics' ? (
                  <div style={{height:'100%',overflow:'auto'}}>
                    <div style={{padding:'2rem'}}>
                    <AnalyticsDashboard
                      sessions={analyticsSnapshot.sessions}
                      currentSession={analyticsSnapshot.currentSession ?? null}
                      onClose={() => { setRadicalTab('notes'); closeAnalytics(); }}
                      onLoadDemoData={() => {
                        const demoSessions = generateDemoSessions();
                        setAnalyticsSnapshot({
                          sessions: demoSessions,
                          currentSession: demoSessions[0] || null,
                        });
                      }}
                      onTriggerAI={triggerDemoSuggestion}
                      onShowMLInsights={() => setShowMLInsights(true)}
                      useDemoData={useDemoData}
                      onToggleDemoData={() => {
                        console.log('[TimerModal] Toggling demo data from', useDemoData, 'to', !useDemoData);
                        setUseDemoData(v => !v);
                      }}
                    />
                    </div>
                  </div>
                ) : radicalTab === 'collaboration' ? (
                  <div style={{height:'100%',overflow:'auto'}}>
                    <div style={{padding:'2rem'}}>
                    <CollaborationPanel />
                    </div>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        )}
        </div>
        
        {/* Phase 2.1: AI Suggestion Notification */}
        {showMlSuggestion && mlSuggestion && radicalOn && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2147483646,
            maxWidth: '360px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(0, 166, 215, 0.92) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24), 0 0 1px rgba(255, 255, 255, 0.12) inset',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: `${styles.fadeSlideIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1)`,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <MdBolt style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))',
                }} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.95)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                }}>
                  {aiDemoMode ? 'Clinical Intelligence Preview' : 'AI Session Prediction'}
                </span>
                {aiDemoMode && (
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.85)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}>
                    Demo
                  </span>
                )}
              </div>
              {isTraining && (
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    animation: `${styles.pulse} 1.5s ease-in-out infinite`,
                  }} />
                  Training {Math.round(trainingProgress)}%
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowMlSuggestion(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                aria-label="Dismiss suggestion"
              >
                <IoMdClose />
              </button>
            </div>
            
            {/* Suggestion text */}
            <p style={{
              margin: 0,
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 400,
              letterSpacing: '0.2px',
            }}>
              {mlSuggestion}
            </p>
            
            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                // TODO: Auto-queue suggested segment
                setShowMlSuggestion(false);
                announce('Suggestion queued');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center' as const,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Apply Recommendation
            </button>
          </div>
        )}
        
        {/* Command palette overlay */}
        {paletteOpen ? (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Dialog overlay backdrop interaction
          <div className={styles.paletteOverlay} role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e)=>{ if(e.target===e.currentTarget) setPaletteOpen(false); }}>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Keyboard command input with Escape/Enter */}
            <div className={styles.paletteDialog} onKeyDown={(e)=>{ if(e.key==='Escape'){ e.preventDefault(); setPaletteOpen(false); } if(e.key==='Enter'){ e.preventDefault(); applyCommand(); } }}>
              <input ref={paletteInputRef} className={styles.paletteInput} placeholder="Type a command (e.g., /25, 25m therapy, segment break)" value={cmdValue} onChange={(e)=> setCmdValue(e.target.value)} />
              {/* eslint-disable-next-line react/jsx-no-leaked-render -- cmdPreview is string or null */}
              {cmdPreview && <div className={styles.palettePreview} aria-live="polite">{cmdPreview}</div>}
              <div className={styles.paletteFooter}>Enter to apply • Esc to close</div>
            </div>
          </div>
        ) : null}
        {/* Notes clear confirm overlay */}
        {notesConfirmOpen ? (
          <div role="presentation" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center' }} onMouseDown={(e) => { if (e.target === e.currentTarget) setNotesConfirmOpen(false); }}>
            <div role="alertdialog" aria-modal="true" aria-labelledby="notes-confirm-title" aria-describedby="notes-confirm-desc" style={{ background: '#121214', color: '#fff', minWidth: 320, maxWidth: 480, borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', padding: 16 }}>
              <strong id="notes-confirm-title" style={{ display: 'block', marginBottom: 6 }}>Clear notes?</strong>
              <div id="notes-confirm-desc" style={{ fontSize: 14, opacity: .9, marginBottom: 12 }}>This will remove all text from the Notes editor.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className={styles.danger} type="button" onClick={() => { setNotesValue(''); setNotesConfirmOpen(false); announce('Notes cleared'); }}>Clear</button>
                <button className={styles.ghost} type="button" onClick={() => setNotesConfirmOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : null}
        {confirmOpen ? (
          <div role="presentation" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center' }} onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false); }}>
            <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" style={{ background: '#121214', color: '#fff', minWidth: 320, maxWidth: 480, borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', padding: 16 }}>
              <strong id="confirm-title" style={{ display: 'block', marginBottom: 6 }}>Timer is running</strong>
              <div id="confirm-desc" style={{ fontSize: 14, opacity: .9, marginBottom: 12 }}>Do you want to pause or stop the session before closing?</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className={styles.ghost} type="button" onClick={() => { pause(); setConfirmOpen(false); }}>Pause and keep open</button>
                <button className={styles.danger} type="button" onClick={() => { reset(); setConfirmOpen(false); handleClose(); }}>Stop and close</button>
                <button ref={confirmCancelRef} className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : null}
        {/* Removed Analytics overlay to avoid duplication; analytics now lives only inside the RADICAL tab */}
        {/* Context menu (radial) rendered via portal */}
        {/* eslint-disable-next-line react/jsx-no-leaked-render -- contextMenuOpen is boolean */}
        {contextMenuOpen && createPortal(
          <RadialMenu
            center={contextMenuPos}
            items={[
              { id: 'lap', label: 'Lap', icon: <FaFlag size={14} />, disabled: !running && Engine.progressMs(t) === 0, onClick: () => contextMenuAction('lap') },
              { id: 'toggle', label: (running ? 'Pause' : (t.phase === 'paused' ? 'Resume' : 'Start')), icon: (running ? <FaPause size={14} /> : <FaPlay size={14} />), onClick: () => contextMenuAction('pause-resume') },
              { id: 'seg_assessment', label: 'Assessment', icon: <FiClock size={14} />, selected: activeSegment === 'assessment', onClick: () => contextMenuAction('segment', 'assessment') },
              { id: 'seg_therapy', label: 'Therapy', icon: <BsActivity size={14} />, selected: activeSegment === 'therapy', onClick: () => contextMenuAction('segment', 'therapy') },
              { id: 'seg_break', label: 'Break', icon: <MdUndo size={16} />, selected: activeSegment === 'break', onClick: () => contextMenuAction('segment', 'break') },
              { id: 'seg_doc', label: 'Documentation', icon: <MdNoteAlt size={16} />, selected: activeSegment === 'documentation', onClick: () => contextMenuAction('segment', 'documentation') },
              { id: 'reset', label: 'Reset', icon: <FaRedoAlt size={14} />, disabled: (Engine.progressMs(t) === 0 && t.phase === 'idle'), onClick: () => contextMenuAction('reset') },
              { id: 'copy_md', label: 'Copy MD', icon: <FiFileText size={14} />, onClick: () => contextMenuAction('copy-md') },
              { id: 'copy_json', label: 'Copy JSON', icon: <FiTable size={14} />, onClick: () => contextMenuAction('copy-json') },
            ]}
            radius={104}
            itemSize={44}
            arcDeg={270}
            startDeg={-90}
            menuRef={contextMenuRef}
            withBackdrop
            compact
            animationDurationMs={180}
            staggerMs={22}
            onClose={() => setContextMenuOpen(false)}
          />,
          document.body
        )}
      </div>

      {/* ML Insights Panel */}
      {showMLInsights && (
        <MLInsightsPanel
          isTraining={isTraining}
          trainingProgress={trainingProgress}
          historicalSessionCount={historicalSessionCount}
          lastPrediction={lastPrediction}
          onClose={() => setShowMLInsights(false)}
        />
      )}

      {/* Smart Note Templates Modal */}
      {selectedSessionForNote && (
        <SmartNoteTemplates
          session={selectedSessionForNote}
          onClose={() => setSelectedSessionForNote(null)}
        />
      )}

      {/* Phase 2.2: Real-Time Coaching Alerts */}
      <RealTimeCoaching
        sessionDuration={t.elapsedMs}
        isRunning={t.phase === 'running'}
        lapCount={t.laps.length}
        avgLapDuration={
          t.laps.length > 0
            ? t.laps.reduce((sum, lap) => sum + lap.atMs, 0) / t.laps.length
            : undefined
        }
        onBreakRequest={() => {
          // Pause timer for break
          Engine.pause(t);
        }}
        onDocumentationRequest={() => {
          // Switch to notes tab in radical mode
          if (radicalOn) {
            setRadicalTab('notes');
          }
        }}
        enabled={coachingEnabled}
      />
    </div>,
    portalRoot.current ?? document.body
  );
};

function capitalize(s: string) { return s.length ? s[0].toUpperCase() + s.slice(1) : s; }

// CSV RFC-4180 quoting
function csvQuote(s: string) {
  const needs = /[",\n]/.test(s);
  const v = s.replace(/"/g, '""');
  return needs ? `"${v}"` : v;
}
// Always MM:SS for splits
function fmtMMSS(ms: number) {
  const s = Math.max(0, Math.floor(ms/1000));
  const m = Math.floor(s/60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// Radial menu component used by the Timer modal context menu
function RadialMenu(
  {
    center,
    items,
    radius = 120,
    itemSize = 40,
    arcDeg = 360,
    startDeg = -90,
    menuRef,
    withBackdrop = false,
    compact: _compact = false,
    animationDurationMs = 160,
    staggerMs = 18,
    onClose,
  }: {
    center: { x: number; y: number };
    items: Array<{ id: string; label: string; icon?: React.ReactNode; onClick: () => void; disabled?: boolean; selected?: boolean }>;
    radius?: number;
    itemSize?: number;
    arcDeg?: number;
    startDeg?: number;
    menuRef?: React.MutableRefObject<HTMLDivElement | null>;
    withBackdrop?: boolean;
    compact?: boolean;
    animationDurationMs?: number;
    staggerMs?: number;
    onClose: () => void;
  }
) {
  const [hi, setHi] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const setRefs = React.useCallback((el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (menuRef) menuRef.current = el;
  }, [menuRef]);

  const [opened, setOpened] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const beginClose = React.useCallback(() => {
    setExiting(true);
    const total = animationDurationMs + items.length * staggerMs + 40;
    window.setTimeout(() => onClose(), total);
  }, [animationDurationMs, items.length, staggerMs, onClose]);

  // Focus first item for a11y on mount
  React.useEffect(() => {
    containerRef.current?.focus();
    requestAnimationFrame(() => setOpened(true));
  }, []);

  const fullCircle = arcDeg >= 360;
  const arc = (Math.max(0, Math.min(360, arcDeg)) * Math.PI) / 180;
  const startAngle = (startDeg * Math.PI) / 180;
  const angleStep = fullCircle
    ? (2 * Math.PI) / Math.max(1, items.length)
    : (items.length > 1 ? arc / (items.length - 1) : 0);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); setHi((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); setHi((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); const it = items[hi]; if (!it?.disabled) { it.onClick(); onClose(); }
    }
  };

  const core = (
    <div
      ref={setRefs}
      role="menu"
      aria-label="Timer radial menu"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { e.preventDefault(); beginClose(); return; }
        onKeyDown(e);
      }}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        left: center.x,
        top: center.y,
        transform: 'translate(-50%, -50%)',
        width: radius * 2 + itemSize + 8,
        height: radius * 2 + itemSize + 8,
        marginLeft: -(radius + itemSize / 2 + 4),
        marginTop: -(radius + itemSize / 2 + 4),
        zIndex: (withBackdrop ? 2147483647 + 1 : 2147483647),
        pointerEvents: 'auto',
      }}
    >
      {/* Minimalist guide ring */}
      <svg
        aria-hidden
        width={radius * 2 + itemSize + 8}
        height={radius * 2 + itemSize + 8}
        style={{ position: 'absolute', inset: 0 as unknown as number, pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id="rg_radialMenu" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* subtle ambient */}
        <circle cx="50%" cy="50%" r={radius + itemSize * 0.5} fill="url(#rg_radialMenu)" />
        {/* ultra-clean guide ring */}
        <circle 
          cx="50%" cy="50%" r={radius} 
          fill="none" 
          stroke="rgba(255,255,255,0.12)" 
          strokeWidth={1}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.15))'
          }}
        />
        {/* minimal tick marks */}
        {items.map((_it, idx) => {
          const a = startAngle + idx * angleStep;
          const x1 = (radius - 6) * Math.cos(a);
          const y1 = (radius - 6) * Math.sin(a);
          const x2 = (radius + 6) * Math.cos(a);
          const y2 = (radius + 6) * Math.sin(a);
          return (
            <line key={idx}
              x1={(radius + itemSize/2 + 4) + x1}
              y1={(radius + itemSize/2 + 4) + y1}
              x2={(radius + itemSize/2 + 4) + x2}
              y2={(radius + itemSize/2 + 4) + y2}
              stroke={hi === idx ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'} 
              strokeWidth={hi === idx ? 1.5 : 0.5}
              style={{ transition: 'all 200ms ease' }}
            />
          );
        })}
      </svg>
      {/* Central label - only show hovered item */}
      {(typeof hi === 'number' && items[hi]) ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            fontSize: 16,
            fontWeight: 600,
            color: '#ffffff',
            textShadow: '0 2px 16px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            letterSpacing: '0.02em',
            opacity: opened && !exiting ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        >
          {items[hi].label}
        </div>
      ) : null}
      {items.map((it, idx) => {
        const a = startAngle + idx * angleStep;
        const cx = (radius * Math.cos(a));
        const cy = (radius * Math.sin(a));
        const focused = hi === idx;
        const isSelected = it.selected;
        
        // Ultra-clean monochrome with subtle accent
        const bg = isSelected 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.12))' 
          : (focused 
              ? 'rgba(255,255,255,0.14)' 
              : 'rgba(20,20,22,0.85)');
        const border = isSelected 
          ? 'rgba(255,255,255,0.4)' 
          : (focused ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.16)');
        const scale = focused ? 1.12 : (isSelected ? 1.05 : 1.0);
        const appear = opened && !exiting ? 1 : 0;
        const delay = opened && !exiting ? idx * staggerMs : 0;
        return (
          <button
            key={it.id}
            role="menuitem"
            type="button"
            aria-label={it.label}
            aria-disabled={it.disabled || undefined}
            onMouseEnter={() => setHi(idx)}
            onClick={() => { if (!it.disabled) { it.onClick(); beginClose(); } }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(${cx - itemSize / 2}px, ${cy - itemSize / 2}px) scale(${appear ? scale : 0.6})`,
              width: itemSize,
              height: itemSize,
              borderRadius: '999px',
              background: bg,
              border: `1px solid ${border}`,
              color: '#fff',
              display: 'grid', placeItems: 'center',
              cursor: it.disabled ? 'not-allowed' : 'pointer',
              boxShadow: focused 
                ? '0 0 0 2px rgba(255,255,255,0.25), 0 8px 24px rgba(0,0,0,0.5)' 
                : (isSelected 
                    ? '0 0 0 1px rgba(255,255,255,0.15), 0 6px 18px rgba(0,0,0,0.4)' 
                    : '0 4px 12px rgba(0,0,0,0.3)'),
              opacity: it.disabled ? 0.45 : 1,
              userSelect: 'none',
              padding: 4,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: `transform ${animationDurationMs}ms cubic-bezier(0.2,0.8,0.2,1), opacity ${animationDurationMs}ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease` as string,
              transitionDelay: `${delay}ms`
            }}
            title={it.label}
          >
            {it.icon ? (
              <span aria-hidden style={{ 
                pointerEvents: 'none', 
                display: 'grid', 
                placeItems: 'center', 
                lineHeight: 1,
                opacity: it.disabled ? 0.35 : (focused || isSelected ? 1 : 0.7),
                transition: 'opacity 180ms ease'
              }}>
                {it.icon}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  if (withBackdrop) {
    return (
      <div
        role="presentation"
        style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'transparent' }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) beginClose(); }}
      >
        {core}
      </div>
    );
  }
  return core;
}

// Inline-editable lap row (250ms debounce)
function LapInlineLabel(
  {
    row,
    defaultLabel,
    onCommit,
    ariaLabel,
  }: {
    row: { id: string; idx: number; atMs: number; splitMs: number; label?: string };
    defaultLabel: string;
    onCommit: (value: string) => void;
    ariaLabel?: string;
  }
) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(row.label ?? '');
  const timerRef = React.useRef<number | null>(null);
  const stop = () => { if (timerRef.current) window.clearTimeout(timerRef.current); timerRef.current = null; };
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value; setValue(v);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => onCommit(v), 250) as unknown as number;
  };
  React.useEffect(() => () => { stop(); }, []);
  if (!editing) {
    return (
      <button
        type="button"
        className={styles.lapSegBtn}
        onClick={() => setEditing(true)}
        aria-label={ariaLabel ?? `Edit label for lap ${row.idx}`}
      >{row.label ?? defaultLabel}</button>
    );
  }
  return (
    <input
      className={styles.cdInput}
      value={value}
      onChange={onChange}
      onBlur={() => { onCommit(value); setEditing(false); stop(); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { onCommit(value); setEditing(false); stop(); }
        if (e.key === 'Escape') { setValue(row.label ?? ''); setEditing(false); stop(); }
      }}
      aria-label={ariaLabel ?? `Edit label for lap ${row.idx}`}
      style={{ height: 24, lineHeight: '24px' }}
    />
  );
}

// Normalize to NFC for deterministic string identity
function nfc(s: string) { try { return s.normalize('NFC'); } catch { return s; } }

// Canonical JSON payload and checksum support
function segPrettyName(k: Engine.SegmentKind) { return ({ assessment:'Assessment', therapy:'Therapy', break:'Break', documentation:'Documentation' } as const)[k]; }
type CanonicalPayload = {
  engine: { mode: Engine.Mode; end_behavior: 'auto-pause'|'stop'|'keep' };
  meta: { app: 'therapy-timer'; schema_version: 1 };
  session: { started_at: string; ended_at: string | null; duration_ms: number; end_state: Engine.Phase };
  segments: Array<{ name: string; total_ms: number; pct: number; splits: number; avg_split_ms: number }>;
  spans: Array<{ segment: string; start_ms: number; end_ms: number }>;
  laps: Array<{ index: number; at_ms: number; split_ms: number; label: string }>;
};
function buildCanonicalPayload(t: Engine.TimerState, nowMs: number): { json: string; payload: CanonicalPayload } {
  const durationMs = Engine.progressMs(t);
  const segTotals = Engine.segmentTotals(t);
  const total = Math.max(1, durationMs);
  const pct = (x: number) => Math.round((x/total)*1000)/10;
  const spans = t.segments.map(sp => ({ segment: segPrettyName(sp.kind), start_ms: sp.startMs|0, end_ms: (sp.endMs ?? durationMs)|0 }));
  let prev = 0;
  const laps = t.laps.map((l, i) => { const split = Math.max(0, l.atMs - prev); prev = l.atMs; return { index: i+1, at_ms: l.atMs|0, split_ms: split|0, label: nfc(l.label ?? segPrettyName((t.segments.find(sp=>sp.startMs<=l.atMs && (sp.endMs??durationMs)>=l.atMs)?.kind ?? 'therapy'))) }; });
  const kinds: Engine.SegmentKind[] = ['assessment','therapy','break','documentation'];
  const spanCounts = spans.reduce<Record<string, number>>((acc, sp) => { acc[sp.segment] = (acc[sp.segment]||0)+1; return acc; }, {});
  const segments = kinds.map(k => { const name = segPrettyName(k); const ms = segTotals[k]; const splits = spanCounts[name] || 0; const avg = splits ? Math.round(ms/splits) : 0; return { name, total_ms: ms|0, pct: +pct(ms).toFixed(1), splits, avg_split_ms: avg|0 }; });
  const engine = { mode: t.mode, end_behavior: (t.zeroBehavior === 'pause' ? 'auto-pause' : (t.zeroBehavior === 'finish' ? 'stop' : 'keep')) } as const;
  const session = { started_at: new Date(nowMs - durationMs).toISOString(), ended_at: (t.phase === 'finished') ? new Date(nowMs).toISOString() : null, duration_ms: durationMs|0, end_state: t.phase };
  const meta = { app: 'therapy-timer', schema_version: 1 } as const;
  const sortObj = (obj: unknown): unknown => {
    if (obj == null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return (obj as unknown[]).map(sortObj);
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj as Record<string, unknown>).sort()) out[k] = sortObj((obj as Record<string, unknown>)[k]);
    return out;
  };
  const payloadObj: CanonicalPayload = { engine, meta, session, segments, spans, laps };
  const json = JSON.stringify(sortObj(payloadObj));
  return { json, payload: payloadObj };
}

// Deterministic Markdown (stable ordering, \n line endings)
function buildDeterministicMDFromState(t: Engine.TimerState) {
  const lines: string[] = [];
  const total = Engine.fmtHMS(Engine.progressMs(t));
  const mode = t.mode;
  const end = t.mode === 'countdown' ? (t.zeroBehavior === 'pause' ? 'auto-pause' : t.zeroBehavior) : '—';
  const seg = Engine.segmentTotals(t);
  lines.push(`## Therapy Timer`);
  lines.push("");
  lines.push(`Mode: ${mode}`);
  lines.push(`Total: ${total}`);
  lines.push(`End: ${end}`);
  lines.push("");
  lines.push(`| Segment | Total | % | Splits | Avg Split |`);
  lines.push(`|:--------|------:|--:|-------:|----------:|`);
  const totMs = Math.max(1, Engine.progressMs(t));
  const spanCount = (k: Engine.SegmentKind) => t.segments.filter(s => s.kind === k).length;
  const row = (name: string, ms: number, splits: number) => `| ${name} | ${Engine.fmtHMS(ms)} | ${(Math.round((ms/totMs)*1000)/10).toFixed(1)} | ${splits} | ${Engine.fmtHMS(splits?Math.round(ms/splits):0)} |`;
  lines.push(row('Assessment', seg.assessment, spanCount('assessment')));
  lines.push(row('Therapy', seg.therapy, spanCount('therapy')));
  lines.push(row('Break', seg.break, spanCount('break')));
  lines.push(row('Documentation', seg.documentation, spanCount('documentation')));
  lines.push("");
  lines.push(`### Laps`);
  lines.push(`| # | Total | Split | Label |`);
  lines.push(`| -:|:-----:|:-----:|:------|`);
  let prev = 0; t.laps.forEach((l, i) => { const split = Math.max(0, l.atMs - prev); prev = l.atMs; lines.push(`| ${i+1} | ${Engine.fmtHMS(l.atMs)} | ${fmtMMSS(split)} | ${nfc(l.label ?? 'Unlabeled')} |`); });
  return lines.join('\n');
}

