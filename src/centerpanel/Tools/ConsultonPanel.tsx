/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
 
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-duplicate-imports */
/* eslint-disable sort-imports */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import styles from "../styles/tools.module.css";
import { useI18n } from "@/i18n";
import { isConsultonEnabled, consultonRolloutInfo, getConsultonCanaryOverride, setConsultonCanaryOverride } from "@/config/flags";

import { assembleConsultContext, canonicalJSONStringify, type ConsultDeidPolicy as DeidPolicy, type ConsultContext } from "./lib/assemble";
import { streamConsulton, verifyConsultonKey, type DoneMeta, type ConsultonError } from "../services/consulton";
import {
  getConsultonKey,
  subscribeConsultonKey,
  setConsultonKey,
  forgetConsultonKey,
  isConsultonKeyPersisting,
  setConsultonKeyPersisting,
  getConsultonKeyMasked,
} from "../state/consultonKey";
import { useRegistry } from "../registry/state";

import {
  isTelemetryOptIn, setTelemetryOptIn,
  subscribeConsultAudit, getConsultAuditRuns,
  clearConsultAudit,
  snapshotSelection,
  getConsultRollupSnapshot,
  type ConsultRunAudit,
} from "./audit";
import { emitConsultEvent } from "./audit";
import { closeSession, createSession, subscribeSessions, updateSession, type ConsultSession } from "./ConsultonSessions";
import { DiffSideBySide } from "./ConsultonDiff";
import { extractFirstFencedBlock, reduceForClinical, tryParseJson } from "./lib/markdown";
import { publishExternalExport } from "./exportInbox";
import {
  CheckCircleIcon,
  CodeIcon,
  ColumnsIcon,
  CopyIcon,
  EyeIcon,
  PlayIcon,
  PrintIcon,
  RefreshIcon,
  ScissorsIcon,
  StopIcon,
  TrashIcon,
} from "./icons";

type Props = {

  modelLabel?: string;
};

type HistoryItem = {
  ts: number;
  prompt: string;
  policy: DeidPolicy;
  scopeLabel: string;
  status?: "running" | "done" | "canceled" | "error";
};

const MAX_HISTORY = 5;

const DEFAULT_POLICY: DeidPolicy = "none";


const now = () => performance.now();


function printViaIframe(title: string, html: string) {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    // eslint-disable-next-line no-useless-escape
    doc.write(`<!doctype html><html><head><meta charset=\"utf-8\"><title>${title}</title>
      <style>
        body { font: 13px/1.55 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111; padding: 16px; }
        pre.codeblock { white-space: pre-wrap; border: 1px solid rgba(0,0,0,0.15); padding: 8px; border-radius: 6px; }
        code { padding: 0 2px; border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; }
      </style></head><body>${html}</body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { iframe.remove(); }, 500);
    }, 50);
  } catch {

  }
}

const KEY_HINT = "Add an API key in Settings to enable Generate.";


function rafThrottle<T extends (...args: any[]) => void>(fn: T): T {
  let scheduled = false;
  let lastArgs: any[] | null = null;

  return function (...args: any[]) {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (lastArgs) fn(...lastArgs);
      lastArgs = null;
    });
  } as T;
}


function politeAnnounce(setter: (s: string) => void, msg: string) {

  setter("");
  setTimeout(() => setter(msg), 10);
}


type UiNotice =
  | { kind: "missing_key" }
  | { kind: "empty_scope" }
  | { kind: "provider"; err: ConsultonError }
  | { kind: "parse"; message: string; details: string };


async function copyTextSafe(s: string) {
  try { await navigator.clipboard.writeText(s); } catch {}
}


function extractFirstJsonCandidateFromHTML(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  const pre = div.querySelector("pre.codeblock");
  if (pre) return pre.textContent || (pre as any).innerText || "";

  const text = (div as any).innerText || "";
  const mObj = text.match(/\{[\s\S]*\}/);
  if (mObj) return mObj[0];
  const mArr = text.match(/\[[\s\S]*\]/);
  if (mArr) return mArr[0];
  return text.trim();
}


const LS_TEMP = "CONSULT_TEMP";
const LS_MAXTOK = "CONSULT_MAXTOKENS";
const LS_REDACT = "CONSULT_REDACT";


function clampNum(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function readNumberLS(key: string, fallback: number) {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  } catch { return fallback; }
}
function writeNumberLS(key: string, val: number) {
  try { localStorage.setItem(key, String(val)); } catch {}
}
function readBoolLS(key: string, fallback: boolean) {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return s === "1" || s.toLowerCase() === "true" || s === "yes";
  } catch { return fallback; }
}
function writeBoolLS(key: string, val: boolean) {
  try { localStorage.setItem(key, val ? "1" : "0"); } catch {}
}


function estimateTokensFromChars(chars: number) {
  return Math.ceil(chars / 4);
}


const TokenBudget: React.FC<{ prompt: string; appState: any; policy: DeidPolicy; maxTokens: number; }> = ({ prompt, appState, policy, maxTokens }) => {
  const ctxObj = useMemo(() => assembleConsultContext(appState, policy, 50), [appState, policy]);
  const ctxStr = useMemo(() => canonicalJSONStringify(ctxObj), [ctxObj]);

  const promptTokens = estimateTokensFromChars(prompt.length);
  const contextTokens = estimateTokensFromChars(ctxStr.length);
  const total = promptTokens + contextTokens;
  const pct = Math.min(100, Math.round(100 * total / Math.max(1, maxTokens)));

  return (
    <div className={styles.budgetWrap} aria-label="Estimated token budget">
      <div className={styles.budgetRow}>
        <div className={styles.budgetBar}>
          <div className={styles.budgetFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.budgetNums}>
          <span className={styles.meta}>~{total} / {maxTokens} tokens</span>
        </div>
      </div>
      <div className={styles.budgetDetails}>
        <span className={styles.meta}>Prompt ≈ {promptTokens}</span>
        <span className={styles.meta}>Context ≈ {contextTokens}</span>
      </div>
    </div>
  );
};

const BRAND_NAME = "Aegis Consult";

function openDoc(relPath: string) {
  try {
    const url = new URL(relPath, window.location.origin).toString();
    const w = window.open(url, "_blank", "noopener");
    // eslint-disable-next-line prefer-template
    if (!w) alert("Popup blocked. You can open " + relPath + " from the repository.");
  } catch {

  }
}

const ConsultonPanel: React.FC<Props> = ({ modelLabel = "GPT-4o" }) => {
  const { t } = useI18n();
  const { state: appState } = useRegistry();

  const [isEnabled, setIsEnabled] = useState<boolean>(() => isConsultonEnabled());
  const [canaryOverride, setCanaryOverrideState] = useState<"on" | "off" | null>(() => getConsultonCanaryOverride());
  const [rollout, setRollout] = useState(() => consultonRolloutInfo());

  useEffect(() => {
    const onChange = () => {
      setCanaryOverrideState(getConsultonCanaryOverride());
      setIsEnabled(isConsultonEnabled());
      setRollout(consultonRolloutInfo());
    };
    window.addEventListener('consult:canary:change' as any, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('consult:canary:change' as any, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);

  const [policy, setPolicy] = useState<DeidPolicy>(DEFAULT_POLICY);
  const [outputHtml, setOutputHtml] = useState<string>("");
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [status, setStatus] = useState<"idle" | "running" | "error" | "done" | "canceled">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [notice, setNotice] = useState<UiNotice | null>(null);

  const [renderMode, setRenderMode] = useState<"markdown" | "plain">("markdown");


  const [srMsg, setSrMsg] = useState<string>("");
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const chunkAnnounceAtRef = useRef<number>(0);
  const outputRegionId = useMemo(() => `consult-output-${  Math.random().toString(36).slice(2)}`, []);


  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const keyInputRef = useRef<HTMLInputElement | null>(null);
  const [temperature, setTemperature] = useState<number>(() => clampNum(readNumberLS(LS_TEMP, 0.3), 0, 1));
  const [maxTokens, setMaxTokens] = useState<number>(() => clampNum(readNumberLS(LS_MAXTOK, 1200), 64, 8192));

  const [redact, setRedact] = useState<boolean>(() => readBoolLS(LS_REDACT, false));
  const [keyPersist, setKeyPersist] = useState<boolean>(() => isConsultonKeyPersisting());
  const [maskedKey, setMaskedKey] = useState<string>(() => getConsultonKeyMasked());

  const [keyDraft, setKeyDraft] = useState<string>("");
  const [keyCheck, setKeyCheck] = useState<{ state: "idle" | "checking" | "ok" | "error"; message?: string }>({ state: "idle" });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [flashMsg, setFlashMsg] = useState<string>("");

  const [helpOpen, setHelpOpen] = useState(false);
  const helpBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && helpOpen) {
        setHelpOpen(false);
        helpBtnRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen]);


  const [sessions, setSessions] = useState<ConsultSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeSessions(setSessions);
    return unsub;
  }, []);

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);


  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeft, setCompareLeft] = useState<string | null>(null);
  const [compareRight, setCompareRight] = useState<string | null>(null);


  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[sessions.length - 1].id);
    }
  }, [sessions, activeSessionId]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const m = /^Digit([1-9])$/.exec(e.code);
      if (!m) return;
      const idx = parseInt(m[1], 10) - 1;
      if (idx < 0 || idx >= sessions.length) return;
      e.preventDefault();
      setActiveSessionId(sessions[idx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [sessions]);


  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || !e.shiftKey) return;
      if (e.code === "KeyD") {
        if (sessions.length < 2) return;
        e.preventDefault();
        setCompareLeft(activeSessionId || sessions[0]?.id || null);
        setCompareRight(sessions.find(s => s.id !== (activeSessionId || ""))?.id || null);
        setCompareOpen(true);
      } else if (e.code === "KeyC") {
        e.preventDefault();
        const src = activeSession?.html || outputHtml || "";
        const reduced = reduceForClinical(src, { max: 1400 });
        try { await navigator.clipboard.writeText(reduced); politeAnnounce(setSrMsg, "Reduced copy placed on clipboard."); } catch {}
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [sessions, activeSessionId, activeSession, outputHtml]);


  const [telemetryOptIn, setTelemetryOptInState] = useState<boolean>(() => isTelemetryOptIn());
  const [audits, setAudits] = useState<ConsultRunAudit[]>(() => getConsultAuditRuns());
  const [auditOpen, setAuditOpen] = useState<boolean>(false);
  const [auditSel, setAuditSel] = useState<ConsultRunAudit | null>(null);

  const [rollup, setRollup] = useState(() => getConsultRollupSnapshot());
  useEffect(() => {

    const tick = () => { try { setRollup(getConsultRollupSnapshot()); } catch {} };
    tick();
    const id = window.setInterval(tick, 2000);
    return () => { window.clearInterval(id); };
  }, []);


  const effectivePolicy = useMemo<DeidPolicy>(() => {
    if (redact) return policy === "none" ? "limited" : policy;
    return "none";
  }, [redact, policy]);

  const keyPresentRef = useRef<boolean>(!!getConsultonKey());
  const cancelRef = useRef<null | { cancel: () => void }>(null);
  const outRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const rawTextRef = useRef<string>("");


  const rawPiecesRef = useRef<string[]>([]);

  const pendingTextRef = useRef<string>("");

  const [plainOut, setPlainOut] = useState<string>("");

  const rafIdRef = useRef<number | null>(null);

  const mdThrottleTimerRef = useRef<number | null>(null);

  const bytesCounterRef = useRef<number>(0);

  const runStartAtRef = useRef<number>(0);
  const firstChunkSeenRef = useRef<boolean>(false);

  const joinCountRef = useRef<number>(0);

  const progressivePlainWhileStreaming = true;


  type RunSnapshot = {
    runId: string;
    prompt: string;
    ctxObj: any;
    ctxJson: string;
    options: { model: string; temperature: number; maxTokens: number; timeoutMs: number };
    policy: DeidPolicy;
  };
  const lastRunSnapRef = useRef<RunSnapshot | null>(null);


  const [backoffMs, setBackoffMs] = useState<number>(0);
  const backoffTimerRef = useRef<number | null>(null);


  const startBackoff = useCallback((ms: number) => {
    if (!ms || ms <= 0) return;

    if (backoffTimerRef.current) {
      window.clearInterval(backoffTimerRef.current);
      backoffTimerRef.current = null;
    }
    setBackoffMs(ms);
    politeAnnounce(setSrMsg, `Rate limited. Retry in approximately ${Math.ceil(ms/1000)} seconds.`);
    const id = window.setInterval(() => {
      setBackoffMs(prev => {
        const next = Math.max(0, prev - 1000);
        if (next <= 0) {
          window.clearInterval(id);
          backoffTimerRef.current = null;
          politeAnnounce(setSrMsg, "Retry window available.");
        }
        return next;
      });
    }, 1000);
    backoffTimerRef.current = id as unknown as number;
  }, []);


  useEffect(() => {
    return () => {
      if (backoffTimerRef.current) {
        window.clearInterval(backoffTimerRef.current);
        backoffTimerRef.current = null;
      }
    };
  }, []);


  const scrollOutputToBottom = useMemo(
    () =>
      rafThrottle(() => {
        const el = outRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight + 64;
      }),
    []
  );


  const onStreamChunk = useCallback((delta: string) => {

    if (!firstChunkSeenRef.current) {
      firstChunkSeenRef.current = true;
      const ttfb = Math.max(0, performance.now() - (runStartAtRef.current || performance.now()));
      emitConsultEvent({ type: "consult.ttfb", ts: Date.now(), ttfbMs: ttfb });
    }
    emitConsultEvent({ type: "consult.chunk", ts: Date.now(), bytes: (delta?.length || 0) });


    rawPiecesRef.current.push(delta);
    bytesCounterRef.current += delta.length;


    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;


        const joined = rawPiecesRef.current.join("");
        rawPiecesRef.current.length = 0;
        joinCountRef.current++;


        pendingTextRef.current += joined;
        rawTextRef.current += joined;


        setPlainOut(prev => prev + joined);


        try { window.dispatchEvent(new CustomEvent("consult:chunk")); } catch {}


        try {
          if (activeSessionId) {
            const s = sessions.find(x => x.id === activeSessionId);
            if (s) updateSession(s.id, { raw: (s.raw || "") + joined });
          }
        } catch {}


        scrollOutputToBottom();


      });
    }
  }, [activeSessionId, sessions, scrollOutputToBottom]);


  useEffect(() => {
    const unsub = subscribeConsultonKey(() => {
      const hasKey = !!getConsultonKey();
      keyPresentRef.current = hasKey;
      setKeyPersist(isConsultonKeyPersisting());
      setMaskedKey(getConsultonKeyMasked());

      setKeyCheck({ state: "idle" });
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    const unsub = subscribeConsultAudit(setAudits);
    return () => { try { unsub(); } catch {} };
  }, []);


  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener("consult:settings:open", open);
    return () => window.removeEventListener("consult:settings:open", open);
  }, []);


  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production") {
    useEffect(() => {
      const t0 = now();
      const iv = window.setInterval(() => {
        const bytes = bytesCounterRef.current;
        const joined = joinCountRef.current;
        const dt = ((now() - t0) / 1000).toFixed(1);

        console.debug(`[P19] t=${dt}s bytes=${bytes} joins=${joined} plainLen=${plainOut.length}`);
      }, 1000);
      return () => clearInterval(iv);
    }, [plainOut.length]);
  }


  useEffect(() => { writeNumberLS(LS_TEMP, clampNum(temperature, 0, 1)); }, [temperature]);
  useEffect(() => { writeNumberLS(LS_MAXTOK, clampNum(maxTokens, 64, 8192)); }, [maxTokens]);
  useEffect(() => { writeBoolLS(LS_REDACT, !!redact); }, [redact]);


  useEffect(() => {
    politeAnnounce(setSrMsg, redact ? "Redaction enabled. Context will be de-identified." : "Redaction disabled.");
  }, [redact]);


  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);


  useEffect(() => {
    if (!settingsOpen) return;
    try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {}
    return () => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} };
  }, [settingsOpen]);


  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPreviewOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);


  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);


  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!streaming) handleGenerate();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [streaming, prompt, policy, appState]);


  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(!!mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);


  useEffect(() => {
    const onStart = () => politeAnnounce(setSrMsg, "Starting consultation stream.");
    const onFinish = () => politeAnnounce(setSrMsg, "Consultation finished.");
    const onCancel = () => politeAnnounce(setSrMsg, "Consultation canceled.");
    const onError = () => politeAnnounce(setSrMsg, "An error occurred.");
    const onChunk = () => {

      const now = Date.now();
      if (now >= (chunkAnnounceAtRef.current || 0)) {
        chunkAnnounceAtRef.current = now + 2000;
        politeAnnounce(setSrMsg, "Receiving response…");
      }
    };

    window.addEventListener("consult:start" as any, onStart);
    window.addEventListener("consult:finish" as any, onFinish);
    window.addEventListener("consult:cancel" as any, onCancel);
    window.addEventListener("consult:error" as any, onError);
    window.addEventListener("consult:chunk" as any, onChunk);

    return () => {
      window.removeEventListener("consult:start" as any, onStart);
      window.removeEventListener("consult:finish" as any, onFinish);
      window.removeEventListener("consult:cancel" as any, onCancel);
      window.removeEventListener("consult:error" as any, onError);
      window.removeEventListener("consult:chunk" as any, onChunk);
    };
  }, []);

  const canGenerate = useMemo(() => {
    if (!isEnabled) return false;
    if (!keyPresentRef.current) return false;
    if (!prompt.trim()) return false;
    return true;
  }, [prompt, isEnabled]);


  const finishStreamingToHtml = useCallback(() => {

    if (rafIdRef.current != null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
    if (mdThrottleTimerRef.current != null) { clearTimeout(mdThrottleTimerRef.current); mdThrottleTimerRef.current = null; }

    const raw = pendingTextRef.current;
    let html = "";
    try {
      html = DOMPurify.sanitize(marked.parse(raw) as string, {
        ALLOWED_TAGS: [
          "h1","h2","h3","h4","h5","h6","p","strong","em","ul","ol","li",
          "code","pre","blockquote","hr","br","a","table","thead","tbody","tr","td","th","span"
        ],
        ALLOWED_ATTR: ["href","title","target","rel","colspan","rowspan"]
      }) || "";
    } catch {  }
    setOutputHtml(html);
  }, []);

  const finalizeRun = useCallback((meta: DoneMeta) => {

    if (activeSessionId) {
      updateSession(activeSessionId, {
        html: outputHtml,
        status: meta.finishedReason === "canceled" ? "canceled" : "done",
        endedAt: Date.now()
      });
    }

    setStreaming(false);
    setStatus(meta.finishedReason === "canceled" ? "canceled" : "done");
    try { window.dispatchEvent(new CustomEvent("consult:finish")); } catch {}

    try {
      const duration = Math.max(0, performance.now() - (runStartAtRef.current || performance.now()));
      const tokensOut = Math.max(0, Math.ceil((bytesCounterRef.current || 0) / 4));
      emitConsultEvent({ type: "consult.finish", ts: Date.now(), tokensOut, durationMs: Math.round(duration) });
    } catch {}
    if (meta.finishedReason !== "canceled") {
      politeAnnounce(setSrMsg, "Consultation finished.");
    }

    taRef.current?.focus();
  }, [activeSessionId, outputHtml]);

  const handleError = useCallback((err: ConsultonError) => {
    setStreaming(false);
    setStatus("error");
    setErrMsg(err.message || "Something went wrong.");
    try { window.dispatchEvent(new CustomEvent("consult:error")); } catch {}

    try {
      const k = (err?.kind || "other") as any;
      const map: Record<string, "auth"|"throttle"|"server"|"network"|"other"> = {
        unauthorized: "auth",
        forbidden: "auth",
        rate_limited: "throttle",
        server_error: "server",
        network_error: "network",
      };
      const kind = map[k] || "other";
      emitConsultEvent({ type: "consult.error", ts: Date.now(), kind });
    } catch {}
    politeAnnounce(setSrMsg, "An error occurred.");
    if (activeSessionId) {
      updateSession(activeSessionId, { status: "error", endedAt: Date.now() });
    }
    taRef.current?.focus();
  }, [activeSessionId]);

  const pushHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      const next = [item, ...prev].slice(0, MAX_HISTORY);
      return next;
    });
  }, []);


  const recordFinalizeToHistory = useCallback((meta: DoneMeta) => {
    try {
      const snap = lastRunSnapRef.current;
      const scopeLabel = (snap?.ctxObj?.label) ?? (appState as any)?.label ?? "Consult";
      pushHistory({ ts: Date.now(), prompt: snap?.prompt ?? prompt, policy: snap?.policy ?? effectivePolicy, scopeLabel, status: (meta.finishedReason as any) || "done" });
    } catch {}
  }, [appState, prompt, effectivePolicy, pushHistory]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputHtml("");
    setStatus("idle");
    setErrMsg(null);
  setNotice(null);
    rawTextRef.current = "";

  }, []);

  const handleStop = useCallback(() => {
    try {
      cancelRef.current?.cancel();
    } catch {}

    if (rafIdRef.current != null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
    if (mdThrottleTimerRef.current != null) { clearTimeout(mdThrottleTimerRef.current); mdThrottleTimerRef.current = null; }
    setStreaming(false);
    setStatus("canceled");
    politeAnnounce(setSrMsg, "Streaming canceled.");

    try {
      const duration = Math.max(0, performance.now() - (runStartAtRef.current || performance.now()));
      emitConsultEvent({ type: "consult.cancel", ts: Date.now(), durationMs: Math.round(duration) });
    } catch {}
    if (activeSessionId) updateSession(activeSessionId, { status: "canceled", endedAt: Date.now() });
    taRef.current?.focus();
    try { window.dispatchEvent(new CustomEvent("consult:cancel")); } catch {}


    try {
      const snap = lastRunSnapRef.current;
      const scopeLabel = (snap?.ctxObj?.label) ?? (appState as any)?.label ?? "Consult";
      pushHistory({ ts: Date.now(), prompt: snap?.prompt ?? prompt, policy: snap?.policy ?? effectivePolicy, scopeLabel, status: "canceled" });
    } catch {}
  }, [appState, prompt, effectivePolicy, pushHistory, activeSessionId]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.shiftKey) {
        if (streaming) {
          e.preventDefault();
          e.stopPropagation();
          handleStop();
          politeAnnounce(setSrMsg, "Streaming canceled.");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [streaming, handleStop]);

  const handleGenerate = useCallback(() => {
    setErrMsg(null);
    setNotice(null);


    if (!isEnabled) {
      setNotice({ kind: "provider", err: { kind: "forbidden", message: "Feature not enabled for this account." } as any });
      politeAnnounce(setSrMsg, "Consult is not enabled for this account.");
      return;
    }


    if (backoffMs > 0) {
      politeAnnounce(setSrMsg, `Please wait ~${Math.ceil(backoffMs/1000)} seconds before retrying.`);
      return;
    }

    if (!canGenerate) {

      if (!keyPresentRef.current) {
        setNotice({ kind: "missing_key" });
        politeAnnounce(setSrMsg, "API key missing. Open settings to add a key.");
      }
      return;
    }


  const ctxObj = assembleConsultContext(appState as any, effectivePolicy, 50, { redact });

    function computeRegionTag(): "TR" | "UK" | "US" | "EU" | "INTL" {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const lc = (navigator.languages?.[0] || navigator.language || "").toUpperCase();
        if (tz.includes("Istanbul") || lc.includes("-TR") || lc.endsWith("TR")) return "TR";
        if (lc.includes("-GB") || lc.endsWith("GB") || lc.endsWith("UK")) return "UK";
        if (lc.includes("-US") || lc.endsWith("US")) return "US";
        if (["CET","EET","Europe/","EUROPE/"].some(k => tz.toUpperCase().includes(k))) return "EU";
      } catch {}
      return "INTL";
    }
    const ctxWithRegion = { ...ctxObj, regionTag: computeRegionTag() } as any;
    const ctxJson = canonicalJSONStringify(ctxWithRegion);


    if ((ctxObj as any).scopeKind === "empty" || (((ctxObj as any).items?.length) ?? 0) === 0) {
      setNotice({ kind: "empty_scope" });
      setStatus("idle");
      politeAnnounce(setSrMsg, "Empty scope. Select a patient, encounter, or cohort.");
      taRef.current?.focus();
      return;
    }


    if (backoffTimerRef.current) {
      window.clearInterval(backoffTimerRef.current);
      backoffTimerRef.current = null;
    }
    setBackoffMs(0);


    pushHistory({ ts: Date.now(), prompt, policy: effectivePolicy, scopeLabel: (ctxObj as any).label, status: "running" });


    const localRunId = Math.random().toString(36).slice(2, 10);
    lastRunSnapRef.current = {
      runId: localRunId,
      prompt,
      ctxObj,
      ctxJson,
      policy: effectivePolicy,
      options: {
        model: "gpt-4o",
        temperature,
        maxTokens,
        timeoutMs: 90_000,
      },
    };


    const s = createSession({
      title: `Run ${sessions.length + 1} — ${new Date().toLocaleTimeString()}`,
      status: "running",
      model: "gpt-4o",
      temperature,
      maxTokens
    });
    setActiveSessionId(s.id);


    if (rafIdRef.current != null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
    if (mdThrottleTimerRef.current != null) { clearTimeout(mdThrottleTimerRef.current); mdThrottleTimerRef.current = null; }
    rawPiecesRef.current = [];
    pendingTextRef.current = "";
    bytesCounterRef.current = 0;
    joinCountRef.current = 0;
    setPlainOut("");
    setOutputHtml("");
    rawTextRef.current = "";

    runStartAtRef.current = performance.now();
    firstChunkSeenRef.current = false;
    setStreaming(true);
    setStatus("running");
  politeAnnounce(setSrMsg, "Generating. Screen reader announcements enabled.");
  try { window.dispatchEvent(new CustomEvent("consult:start")); } catch {}


    try {
      const estPromptTokens = Math.ceil((prompt.length || 0) / 4);
      const estContextTokens = Math.ceil((ctxJson.length || 0) / 4);
      emitConsultEvent({ type: "consult.start", ts: Date.now(), model: "gpt-4o", estPromptTokens, estContextTokens });
    } catch {}

    const apiKey = getConsultonKey()!;

    cancelRef.current = streamConsulton(
      {
        apiKey,
  systemPrompt: null,
        userPrompt: prompt,

  context: ctxWithRegion,
        options: {
          model: "gpt-4o",
          temperature,
          maxTokens,
          streamProtocol: "auto",

          redact: effectivePolicy !== "none",
          topP: 1.0,
          presencePenalty: 0,
          frequencyPenalty: 0,
          responseFormat: "text",
          timeoutMs: 90_000,
        },
        metricsSeed: {
          promptChars: prompt.length,
          contextChars: ctxJson.length,
        },
        meta: { resumeOfRunId: null },
      },
      (delta) => onStreamChunk(delta),
  (meta)   => { finishStreamingToHtml(); finalizeRun(meta); recordFinalizeToHistory(meta); },
      (err)    => {
        setNotice({ kind: "provider", err });
        if (err.kind === "rate_limited" && (err.retryInMs ?? 0) > 0) {
          startBackoff(err.retryInMs!);
        }

        handleError(err);
      }
    );
  }, [appState, effectivePolicy, redact, prompt, canGenerate, temperature, maxTokens, backoffMs, onStreamChunk, finishStreamingToHtml, finalizeRun, handleError, pushHistory, startBackoff]);


  const handleResume = useCallback(() => {
    const snap = lastRunSnapRef.current;
    if (!snap) return;
    if (backoffMs > 0) {
      politeAnnounce(setSrMsg, `Please wait ~${Math.ceil(backoffMs/1000)} seconds before resuming.`);
      return;
    }

    setErrMsg(null);
    setNotice(null);


  setOutputHtml(prev => (prev ? `${prev  }<hr/>` : prev));
  rawTextRef.current = rawTextRef.current ? (`${rawTextRef.current  }\n\n---\n`) : rawTextRef.current;

  if (rafIdRef.current != null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null; }
  if (mdThrottleTimerRef.current != null) { clearTimeout(mdThrottleTimerRef.current); mdThrottleTimerRef.current = null; }
  rawPiecesRef.current = [];
  pendingTextRef.current = rawTextRef.current;
  setPlainOut("");

  bytesCounterRef.current = 0;
  joinCountRef.current = 0;
  runStartAtRef.current = performance.now();
  firstChunkSeenRef.current = false;

    setStreaming(true);
    setStatus("running");
    politeAnnounce(setSrMsg, "Resuming. Starting a new consultation run.");

    const apiKey = getConsultonKey()!;
    cancelRef.current = streamConsulton(
      {
        apiKey,

        systemPrompt: null,
        userPrompt: snap.prompt,


        context: (() => {
          type RegionTag = "TR" | "UK" | "US" | "EU" | "INTL";
          type ConsultContextWithRegion = ConsultContext & { regionTag?: RegionTag };
          function computeRegionTag(): RegionTag {
            try {
              const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
              const lc = (navigator.languages?.[0] || navigator.language || "").toUpperCase();
              if (tz.includes("Istanbul") || lc.includes("-TR") || lc.endsWith("TR")) return "TR";
              if (lc.includes("-GB") || lc.endsWith("GB") || lc.endsWith("UK")) return "UK";
              if (lc.includes("-US") || lc.endsWith("US")) return "US";
              if (["CET","EET","Europe/","EUROPE/"].some(k => tz.toUpperCase().includes(k))) return "EU";
            } catch {}
            return "INTL";
          }
          const snapCtx = snap.ctxObj as ConsultContextWithRegion;
          const hasRegion = snapCtx.regionTag != null;
          return hasRegion ? snapCtx : { ...snapCtx, regionTag: computeRegionTag() };
        })(),
        options: {
          model: snap.options.model,
          temperature: snap.options.temperature,
          maxTokens: snap.options.maxTokens,
          streamProtocol: "auto",

          redact: (snap.policy ?? "none") !== "none",
          topP: 1.0,
          presencePenalty: 0,
          frequencyPenalty: 0,
          responseFormat: "text",
          timeoutMs: snap.options.timeoutMs,
        },
        metricsSeed: {
          promptChars: snap.prompt.length,

          contextChars: (() => {
            try {
              type RegionTag = "TR" | "UK" | "US" | "EU" | "INTL";
              type ConsultContextWithRegion = ConsultContext & { regionTag?: RegionTag };
              const snapCtx = snap.ctxObj as ConsultContextWithRegion;
              const ctxOut: ConsultContextWithRegion = snapCtx.regionTag != null
                ? snapCtx
                : { ...snapCtx, regionTag: "INTL" as RegionTag };
              return canonicalJSONStringify(ctxOut).length;
            } catch { return snap.ctxJson.length; }
          })(),
        },
        meta: { resumeOfRunId: snap.runId },
      },
      (delta) => onStreamChunk(delta),
  (done)  => { finishStreamingToHtml(); finalizeRun(done); recordFinalizeToHistory(done); },
      (err)   => {
        setNotice({ kind: "provider", err });
        if (err.kind === "rate_limited" && (err.retryInMs ?? 0) > 0) {
          startBackoff(err.retryInMs!);
        }
        handleError(err);
      }
    );


    const scopeLabel = (snap.ctxObj?.label) ?? (appState as any)?.label ?? "Consult";
    pushHistory({ ts: Date.now(), prompt: snap.prompt, policy: snap.policy, scopeLabel, status: "running" });


    try {
      const estPromptTokens = Math.ceil((snap.prompt.length || 0) / 4);
      const estContextTokens = Math.ceil(((snap.ctxJson || "").length) / 4);
      emitConsultEvent({ type: "consult.start", ts: Date.now(), model: snap.options.model || "gpt-4o", estPromptTokens, estContextTokens });
    } catch {}
  }, [onStreamChunk, finishStreamingToHtml, finalizeRun, handleError, appState, backoffMs, pushHistory, startBackoff]);


  const handleRetry = useCallback(() => {
    const snap = lastRunSnapRef.current;
    if (!snap) return;
    handleResume();
  }, [handleResume]);

  const handleCopy = useCallback(async () => {
    try {

      const tmp = document.createElement("div");
      tmp.innerHTML = outputHtml;
      const text = tmp.innerText;
      await navigator.clipboard.writeText(text);
      setStatus("done");
      setFlashMsg("Copied to clipboard");
      setTimeout(() => setFlashMsg(""), 1500);
    } catch {

    }
  }, [outputHtml]);

  const handleOpenPreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const handleQuickPrint = useCallback(() => {
    const html = `<div>${outputHtml || "<em>(No output)</em>"}</div>`;

    printViaIframe("Consult Summary", html);
  }, [outputHtml]);


  const handleKeySave = useCallback(async () => {
    const v = keyDraft.trim();
    if (!v) {
      setKeyCheck({ state: "error", message: "Enter a key to save." });
      return;
    }
    setConsultonKey(v);
    setKeyDraft("");
    setKeyCheck({ state: "idle" });
  }, [keyDraft]);

  const handleKeyClear = useCallback(() => {
    forgetConsultonKey();
    setKeyDraft("");
    setKeyCheck({ state: "idle" });
  }, []);

  const handleKeyCheck = useCallback(async () => {
    const candidate = (getConsultonKey() || keyDraft.trim());
    if (!candidate) {
      setKeyCheck({ state: "error", message: "No key to check. Enter or save a key first." });
      return;
    }
    setKeyCheck({ state: "checking" });
    try {
      const res = await verifyConsultonKey(candidate);
      if (res.ok) setKeyCheck({ state: "ok", message: res.message });
      else setKeyCheck({ state: "error", message: res.message });
    } catch (e: any) {
      setKeyCheck({ state: "error", message: e?.message || "Network error." });
    }
  }, [keyDraft]);


  const handleParseJson = useCallback(() => {
    setNotice(null);
    if (!outputHtml || !outputHtml.trim()) {
      setNotice({ kind: "parse", message: "No output to parse.", details: "The output region is empty." });
      politeAnnounce(setSrMsg, "No output to parse.");
      return;
    }
    const candidate = extractFirstJsonCandidateFromHTML(outputHtml);
    try {
      const parsed = JSON.parse(candidate);
      setNotice({ kind: "parse", message: "JSON parsed successfully.", details: JSON.stringify(parsed, null, 2).slice(0, 2000) });
      politeAnnounce(setSrMsg, "JSON parsed successfully.");
    } catch (e: any) {
      const msg = (e?.message || "Invalid JSON").toString();
      const sample = candidate.slice(0, 800);
      setNotice({ kind: "parse", message: "Could not parse JSON.", details: `Error: ${msg}\n\nSample:\n${sample}` });
      politeAnnounce(setSrMsg, "JSON parse error.");
    }
  }, [outputHtml]);


  const StatusBlock: React.FC<{ notice: UiNotice; onClose?: () => void; onRetry?: () => void; onOpenSettings?: () => void; }> = ({ notice, onClose, onRetry, onOpenSettings }) => {
    let cls = styles.statusBlock;
    let title = "";
    let body: React.ReactNode = null;
    let actions: React.ReactNode = null;
    let role: "alert" | "status" = "status";

    const btn = (label: string, onClick?: () => void, danger = false) => (
      <button type="button" className={`${styles.btn} ${danger ? styles.btnDanger : ""}`} onClick={onClick}>{label}</button>
    );

    if (notice.kind === "missing_key") {
      cls += ` ${styles.statusError}`;
      role = "alert";
      title = "API key required";
      body = <>Add an API key in <strong>Settings</strong> to enable Generate. Keys are never stored in localStorage; use “Remember for this session” if needed.</>;
      actions = (
        <div className={styles.statusActions}>{btn("Open Settings", onOpenSettings)}</div>
      );
    }

    if (notice.kind === "empty_scope") {
      cls += ` ${styles.statusInfo}`;
      role = "status";
      title = "No scope selected";
      body = <>Select a <strong>patient/encounter</strong> or apply a <strong>cohort filter</strong> to assemble a consult context.</>;
      actions = (
        <div className={styles.statusActions}>
          {btn("Open Settings", onOpenSettings)}
          {!!onClose && <button className={styles.btn} onClick={onClose}>Dismiss</button>}
        </div>
      );
    }

    if (notice.kind === "provider") {
      const k = (notice.err as any).kind;
      title = "Provider error";
      role = "alert";
      if (k === "unauthorized" || k === "forbidden") {
        cls += ` ${styles.statusError}`;
        body = <>Your API key is invalid or lacks access. Re-enter the key in <strong>Settings</strong> and try again.</>;
        actions = (<div className={styles.statusActions}>{btn("Open Settings", onOpenSettings, false)}{btn("Retry", onRetry, false)}</div>);
      } else if (k === "rate_limited") {
        cls += ` ${styles.statusWarn}`;
        const ms = (notice.err as any).retryInMs ?? 0;
        const secs = ms > 0 ? Math.ceil(ms / 1000) : null;
        body = <>Rate limit reached. {secs ? <>Wait ~{secs}s</> : <>Slow down briefly</>} and then retry.</>;
        actions = (<div className={styles.statusActions}>{btn("Retry", onRetry, false)}</div>);
      } else if (k === "server_error" || k === "network_error") {
        cls += ` ${styles.statusWarn}`;
        body = <>Temporary server or network issue. Check connectivity and retry.</>;
        actions = (<div className={styles.statusActions}>{btn("Retry", onRetry, false)}</div>);
      } else if (k === "bad_request") {
        cls += ` ${styles.statusInfo}`;
        body = <>The request was invalid. Adjust your prompt or reduce context size and retry.</>;
        actions = (<div className={styles.statusActions}>{btn("Retry", onRetry, false)}</div>);
      } else if (k === "aborted") {
        cls += ` ${styles.statusInfo}`;
        body = <>Streaming canceled.</>;
        actions = (<div className={styles.statusActions}>{btn("Retry", onRetry, false)}</div>);
      } else {
        cls += ` ${styles.statusInfo}`;
        body = <>An unexpected error occurred. Retry in a moment.</>;
        actions = (<div className={styles.statusActions}>{btn("Retry", onRetry, false)}</div>);
      }
    }

    if (notice.kind === "parse") {
      cls += ` ${styles.statusWarn}`;
      role = "alert";
      title = "JSON parse failed";
      body = (<>{notice.message}<div className={styles.note} style={{ marginTop: 6 }}>Use “Copy details” and share with a developer (no PHI included).</div></>);
      actions = (
        <div className={styles.statusActions}>
          <button className={styles.btn} onClick={() => copyTextSafe(notice.details)}>Copy details</button>
          {!!onClose && <button className={styles.btn} onClick={onClose}>Dismiss</button>}
        </div>
      );
    }

    return (
      <div className={cls} role={role} aria-live={role === "alert" ? "assertive" : "polite"} aria-atomic="true">
        <div className={styles.statusTitle}>{title}</div>
        <div className={styles.statusBody}>{body}</div>
        {actions}
      </div>
    );
  };

  const disabledGenerate = !canGenerate || streaming || backoffMs > 0;
  const showKeyHint = !keyPresentRef.current;


  return (
    <div
      className={styles.consultWrap}
      data-testid="consulton-panel"
      aria-live="off"
      data-reduce-motion={reduceMotion ? "1" : "0"}
    >
  {}
      {}
      <a href={`#${outputRegionId}`} className={styles.skipLink}>Skip to output</a>
      <a href="#consult-prompt" className={styles.skipLink}>Skip to prompt</a>

      {}
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {srMsg}
      </div>
      {}
      <div className={styles.consultHeader} role="region" aria-label={`${BRAND_NAME} header`}>
        <div className={styles.headerLeft}>
          <span className={styles.brandMark} aria-hidden="true">AEGIS</span>
          <div className={styles.consultTitle} aria-label={BRAND_NAME}>{BRAND_NAME}</div>
          <span className={styles.modelLabel} aria-label="Model">{modelLabel}</span>
          <span className={styles.pillDisclaimer} title="Supports documentation, not directives">Documentation support</span>
          {effectivePolicy !== "none" && (
            <span className={styles.pillRedacted} title={`Context de-identified: ${effectivePolicy}`}>Redacted</span>
          )}
          {}
          <button
            type="button"
            className={styles.pill}
            aria-pressed={canaryOverride === 'on'}
            onClick={() => {
              const next = canaryOverride === 'on' ? 'off' : 'on';
              setConsultonCanaryOverride(next);
              setCanaryOverrideState(next);
              setIsEnabled(isConsultonEnabled());
            }}
            title={`Canary ${rollout.pct}% • bucket ${rollout.clientBucket} • env ${rollout.env} • click to toggle`}
          >{`Canary ${canaryOverride === 'off' ? 'OFF' : 'ON'}`}</button>
        </div>
        <div className={styles.headerRight}>
          {}
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            aria-label="Open settings"
            title="Settings"
            data-testid="consult-settings-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("consult:settings:open"))}
          >
            ⚙<span className={styles.srOnly}>Open settings</span>
          </button>
          {}
          <button
            ref={helpBtnRef}
            type="button"
            className={styles.iconBtn}
            aria-haspopup="dialog"
            aria-expanded={helpOpen}
            aria-label={t("help.open")}
            title={t("help.open")}
            onClick={() => setHelpOpen(v => !v)}
          >
            ?<span className={styles.srOnly}>{t("help.open")}</span>
          </button>
          {!!helpOpen && (
            <div role="dialog" aria-label={t("help.title")} className={styles.helpPopover}>
              <div className={styles.helpHeader}>{t("help.title")}</div>
              <div className={styles.meta}>
                <ul>
                  <li>{t("help.clinicianPoint1")}</li>
                  <li>{t("help.clinicianPoint2")}</li>
                  <li>{t("help.clinicianPoint3")}</li>
                </ul>
                <div className={styles.meta} style={{ marginTop: 6 }}>{t("help.canaryNote")}</div>
              </div>
              <div className={styles.helpActions}>
                <button className={styles.btn} onClick={() => openDoc("/docs/consulton.md")}>{t("help.openDeveloper")}</button>
                <button className={styles.btn} onClick={() => openDoc("/docs/consulton-plan.md")}>{t("help.openPlan")}</button>
                <button className={styles.btn} onClick={() => setHelpOpen(false)}>{t("help.close")}</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {}
      <div role="note" aria-live="polite" className={styles.consultHeaderNote || undefined}>
        Supports documentation, not directives. Always apply clinical judgment.
      </div>

      {}
      <div className={styles.consultEditor} role="region" aria-label="Prompt editor">
        <label htmlFor="consult-prompt" className={styles.srOnly}>Prompt</label>
        <textarea
          id="consult-prompt"
          ref={taRef}
          className={styles.consultTextarea}
          placeholder="Ask a cautious, clinically appropriate question…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          aria-describedby="consult-count"
        />
        <div className={styles.editorMeta}>
          <span id="consult-count" className={styles.counter}>{charCount} chars</span>
          <span className={styles.kbdHint}><span className={styles.kbd}>Ctrl/⌘</span>+<span className={styles.kbd}>Enter</span> to Generate</span>
          {!!showKeyHint && <span className={styles.metaWarn} role="note">{KEY_HINT}</span>}
          {!isEnabled && <span className={styles.metaWarn} role="note">Not enabled (canary)</span>}
        </div>

        <div className={styles.toolbar} role="toolbar" aria-label="Consult actions">
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnIcon}`}
            onClick={handleGenerate}
            disabled={disabledGenerate}
            aria-disabled={disabledGenerate || undefined}
            data-testid="consult-generate"
            aria-controls={outputRegionId}
            aria-label="Generate"
            title="Generate"
          >
            <PlayIcon /><span className={styles.srOnly}>Generate</span>
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnIcon}`}
            onClick={handleStop}
            disabled={!streaming}
            aria-disabled={!streaming || undefined}
            data-testid="consult-stop"
            aria-controls={outputRegionId}
            aria-label="Stop"
            title="Stop"
          >
            <StopIcon /><span className={styles.srOnly}>Stop</span>
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnIcon}`}
            onClick={clearOutput}
            disabled={streaming}
            aria-disabled={streaming || undefined}
            data-testid="consult-clear"
            aria-controls={outputRegionId}
            aria-label="Clear output"
            title="Clear output"
          >
            <TrashIcon /><span className={styles.srOnly}>Clear output</span>
          </button>

          {}
          <button
            type="button"
            className={`${styles.btn} ${styles.btnIcon}`}
            onClick={handleResume}
            disabled={streaming || !lastRunSnapRef.current || backoffMs > 0}
            aria-label="Resume last consultation with the same prompt and context"
            title="Resume"
          >
            <RefreshIcon /><span className={styles.srOnly}>Resume</span>
          </button>

          {}
          {backoffMs > 0 && (
            <span className={styles.pill} title="Rate limited; please wait before retrying" aria-live="polite">
              Retry in {Math.ceil(backoffMs/1000)}s
            </span>
          )}
          {}
          {backoffMs > 0 && (
            <button
              type="button"
              className={`${styles.btn}`}
              onClick={() => { if (backoffTimerRef.current) { window.clearInterval(backoffTimerRef.current); backoffTimerRef.current = null; } setBackoffMs(0); handleGenerate(); }}
              aria-label="Force generate now (bypass retry timer)"
              title="Force Generate now"
              data-testid="consult-force-generate"
            >
              Force
            </button>
          )}

          <div className={styles.spacer} />
          {}
          <div className={styles.policyGroup} role="radiogroup" aria-label="De-identification policy">
            <label className={styles.microLabel} id="consult-policy-label">Policy</label>
            <div className={`${styles.seg} ${styles.segTiny}`} aria-labelledby="consult-policy-label">
              {(["none","limited","safe"] as DeidPolicy[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={styles.segBtn}
                  role="radio"
                  aria-checked={policy === p}
                  aria-label={p}
                  onClick={() => !streaming && setPolicy(p)}
                  disabled={streaming}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {}
              <div className={styles.policyGroup} role="group" aria-label="Redaction">
            <label className={styles.microLabel} id="consult-redact-label">Redact</label>
            <div className={`${styles.seg} ${styles.segTiny}`} aria-labelledby="consult-redact-label">
              <button
                type="button"
                className={styles.segBtn}
                    aria-pressed={redact}
                onClick={() => setRedact(!redact)}
                title={redact ? "Redaction ON" : "Redaction OFF"}
                data-testid="consult-redact-toggle"
              >{redact ? "On" : "Off"}</button>
            </div>
          </div>

          {}
        </div>
      </div>

      {}
      <div className={styles.consultBody}>
        <section className={styles.outSection} aria-labelledby="consult-output-heading">
          <div className={styles.outHeader}>
            <h2 id="consult-output-heading" className={styles.outTitle}>Output</h2>
            <div className={styles.outActions}>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} onClick={handleCopy} aria-label="Copy output" title="Copy" data-testid="consult-copy"><CopyIcon /></button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} onClick={handleOpenPreview} aria-label="Open in Preview" title="Open Preview" data-testid="consult-open-preview"><EyeIcon /></button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`} onClick={handleQuickPrint} aria-label="Quick Print" title="Quick Print" data-testid="consult-quick-print"><PrintIcon /></button>
              {}
              <button
                type="button"
                className={`${styles.btn}`}
                onClick={() => {
                  const html = outputHtml || "";

                  const ctxObj = assembleConsultContext(appState as any, effectivePolicy, 50) as any;
                  const scopeKind: "encounter" | "patient" | "cohort" = (ctxObj?.scopeKind === "encounter" || ctxObj?.scopeKind === "patient") ? ctxObj.scopeKind : "cohort";
                  const scopeLabel: string = ctxObj?.label || "Consult";
                  const selection = snapshotSelection(appState as any, scopeKind);
                  publishExternalExport({ html, scopeKind, scopeLabel, selection, policyPreset: effectivePolicy });
                  politeAnnounce(setSrMsg, "Sent to Export. External payload active.");
                  setFlashMsg("Sent to Export");
                  setTimeout(() => setFlashMsg(""), 1500);
                }}
                aria-label="Send output to Export"
                title="Send to Export"
              >
                Send to Export
              </button>
              {}
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon}`}
                onClick={handleParseJson}
                aria-label="Try to parse JSON from output"
                data-testid="consult-parse-json"
              >
                <CodeIcon />
              </button>
              {}
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon}`}
                onClick={() => {
                  const raw = activeSession?.raw ?? rawTextRef.current ?? "";
                  const fence = extractFirstFencedBlock(raw, "json") || extractFirstFencedBlock(raw);
                  if (!fence) {
                    setNotice({ kind: "parse", message: "No fenced block found.", details: "No ```json``` or fenced block detected in this session." });
                    politeAnnounce(setSrMsg, "No fenced block found.");
                    return;
                  }
                  const r = tryParseJson(fence.content.trim());
                  if (r.ok) {
                    setNotice({ kind: "parse", message: "JSON is valid.", details: JSON.stringify(r.json, null, 2).slice(0, 2000) });
                    politeAnnounce(setSrMsg, "JSON is valid.");
                  } else {
                    setNotice({ kind: "parse", message: "Invalid JSON.", details: r.error });
                    politeAnnounce(setSrMsg, "Invalid JSON.");
                  }
                }}
                aria-label="Validate JSON in fenced code block"
              >
                <CheckCircleIcon />
              </button>
              {}
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon}`}
                onClick={async () => {
                  const src = activeSession?.html || outputHtml || "";
                  const reduced = reduceForClinical(src, { max: 1400 });
                  try { await navigator.clipboard.writeText(reduced); politeAnnounce(setSrMsg, "Reduced copy placed on clipboard."); }
                  catch {}
                }}
                aria-label="Copy reduced clinical summary"
              >
                <ScissorsIcon />
              </button>
              {}
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon}`}
                onClick={() => { setCompareLeft(activeSessionId || sessions[0]?.id || null); setCompareRight(sessions.length > 1 ? sessions[1].id : null); setCompareOpen(true); }}
                aria-label="Compare sessions"
                disabled={sessions.length < 2}
              >
                <ColumnsIcon />
              </button>
              {}
              <div className={`${styles.seg} ${styles.segTiny}`} role="group" aria-label="Render mode">
                <button
                  type="button"
                  className={styles.segBtn}
                  aria-pressed={renderMode === "markdown"}
                  onClick={() => setRenderMode("markdown")}
                >Markdown</button>
                <button
                  type="button"
                  className={styles.segBtn}
                  aria-pressed={renderMode === "plain"}
                  onClick={() => setRenderMode("plain")}
                >Plain</button>
              </div>
            </div>
          </div>

          {}
          {sessions.length > 0 && (
            <div className={styles.tabs} role="tablist" aria-label="Consult sessions">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  className={styles.tab}
                  aria-selected={s.id === activeSessionId}
                  aria-controls={`session-panel-${s.id}`}
                  onClick={() => setActiveSessionId(s.id)}
                  title={`${s.status.toUpperCase()} • ${new Date(s.startedAt).toLocaleTimeString()}`}
                >
                  <span className={styles.tabTitle}>{s.title}</span>
                  <span className={styles.meta}> {s.status}</span>
                  <button
                    type="button"
                    className={styles.tabClose}
                    aria-label="Close session"
                    onClick={(e) => { e.stopPropagation(); closeSession(s.id); if (activeSessionId === s.id) setActiveSessionId(sessions.find(x => x.id !== s.id)?.id ?? null); }}
                  >×</button>
                </button>
              ))}
            </div>
          )}

          {}
          <div className={styles.statusRow} role="status" aria-live="polite" aria-atomic="true">
            {!!streaming && <span className={`${styles.status} ${styles.statusStreaming}`} aria-live="polite">Streaming…</span>}
            {status === "done" && <span className={`${styles.status} ${styles.statusOk}`}>Done</span>}
            {status === "canceled" && <span className={`${styles.status} ${styles.statusWarn}`}>Canceled</span>}
            {status === "error" && (!notice || notice.kind !== "provider") && (
              <span className={`${styles.status} ${styles.statusErr}`}>{errMsg}</span>
            )}
          </div>

          {}
          {!!notice && (
            <StatusBlock
              notice={notice}
              onClose={() => setNotice(null)}
              {...(!streaming && backoffMs === 0 ? { onRetry: handleRetry } as any : {})}
              onOpenSettings={() => window.dispatchEvent(new CustomEvent("consult:settings:open"))}
            />
          )}

          {}
          <div id={activeSessionId ? `session-panel-${activeSessionId}` : undefined}>
            <div
              id={outputRegionId}
              className={`${styles.outbox} ${styles.prettyScrollV2}`}
              ref={outRef}
              role="region"
              aria-live="polite"
              aria-busy={streaming}
              aria-atomic="false"
              tabIndex={0}
              aria-label="Consult output"
              data-testid="consult-output"
            >
              {streaming && progressivePlainWhileStreaming ? (
                <pre className={styles.outPlain} data-mm="plain-stream">{plainOut}</pre>
              ) : (
                renderMode === "plain" ? (
                  <pre className={styles.outPlain} data-mm="plain-settle">{pendingTextRef.current || rawTextRef.current || ""}</pre>
                ) : (
                  <div className={styles.outHtml} data-mm="html-settle" dangerouslySetInnerHTML={{ __html: outputHtml || "<em class='muted'>(No output yet)</em>" }} />
                )
              )}
            </div>
          </div>
        </section>

        <aside className={styles.historySection} aria-labelledby="consult-history-heading">
          <div className={styles.outHeader}>
            <h3 id="consult-history-heading" className={styles.historyTitle}>History</h3>
            <div className={styles.outActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`}
                onClick={handleClearHistory}
                aria-label="Clear history"
                data-testid="consult-history-clear"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          <ul className={styles.historyList}>
            {history.length === 0 && <li className={`${styles.muted}`}>No prompts yet.</li>}
            {history.map((h, i) => (
              <li key={`${h.ts  }:${  i}`} className={styles.historyItem}>
                <div className={styles.historyPrompt} title={h.prompt}>{h.prompt}</div>
                <div className={styles.historyMeta}>
                  <span className={styles.policyPill}>{h.policy}</span>
                  <span className={styles.meta}>{new Date(h.ts).toLocaleTimeString()}</span>
                  <span className={styles.meta}>{h.scopeLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        {}
        <aside className={styles.historySection} aria-labelledby="consult-diag-heading">
          <div className={styles.outHeader}>
            <h3 id="consult-diag-heading" className={styles.historyTitle}>Diagnostics</h3>
            <div className={styles.outActions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`}
                onClick={() => { clearConsultAudit(); try { setAudits([]); } catch {} }}
                aria-label="Clear diagnostics"
                title="Clear diagnostics"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          {!telemetryOptIn && (
            <div className={styles.muted} style={{ fontSize: 12 }}>
              Opt-out active. Enable in Settings → “Share anonymous diagnostics”.
            </div>
          )}
          {!!telemetryOptIn && (
            <ul className={styles.historyList}>
              {audits.length === 0 && <li className={styles.muted}>No runs yet.</li>}
              {audits.slice(0, 7).map(r => (
                <li key={r.id} className={styles.historyItem}>
                  <div className={styles.historyPrompt}>
                    <strong>{r.model}</strong> • {r.outcome ?? "running"} • {r.durationMs ? `${Math.round(r.durationMs)}ms` : "…"}
                  </div>
                  <div className={styles.historyMeta}>
                    <span className={styles.pill}>{new Date(r.tsStart).toLocaleTimeString()}</span>
                    {typeof r.tokensOutputEst === "number" && (
                      <span className={styles.meta}>out ≈ {r.tokensOutputEst}</span>
                    )}
                    {!!(r.status || r.errorKind) && (
                      <span className={styles.meta}>
                        {r.status ? `HTTP ${r.status}` : r.errorKind}
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => { setAuditSel(r); setAuditOpen(true); }}
                      aria-label="Open diagnostics details"
                    >
                      Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!!telemetryOptIn && (
            <div className={styles.historyMeta} style={{ marginTop: 8 }}>
              <div className={styles.meta}>
                Window ~{rollup.windowSec}s • Starts {rollup.starts} • Finishes {rollup.finishes} • Cancels {rollup.cancels} • Errors {rollup.errors}
              </div>
              <div className={styles.meta}>
                Error rate {(rollup.errRate * 100).toFixed(1)}% • Cancel rate {(rollup.cancelRate * 100).toFixed(1)}% • Avg TTFB {rollup.avgTtfbMs} ms
              </div>
              <div className={styles.meta}>
                Avg tokens in ~{rollup.avgTokensIn} • Avg tokens out ~{rollup.avgTokensOut}
              </div>
            </div>
          )}
        </aside>
      </div>

      {}
      {!!settingsOpen && (
        <div
          className={styles.consultOverlay}
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-settings-title"
            className={styles.consultDialog}
            ref={(el) => { settingsDialogRef.current = el; if (el) setTimeout(() => { el.querySelector<HTMLInputElement>("input,select,button")?.focus(); }, 0); }}
            onMouseDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
            onPointerDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
            onFocus={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
            onBlur={() => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} }}
          >
            <div className={styles.dialogHeader}>
              <h2 id="consult-settings-title">Consult Settings</h2>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setSettingsOpen(false)} aria-label="Close settings">✕</button>
            </div>

            {}
            <div className={styles.group}>
              <div className={styles.groupTitle}>API Key</div>
              {}
              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="consult-key">Key</label>
                <input
                  id="consult-key"
                  type="password"
                  className={styles.input}
                  placeholder="sk-••••••"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.currentTarget.value)}
                  ref={keyInputRef}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}

                  onMouseDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
                  onPointerDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
                  onFocus={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
                  onBlur={() => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} ; setTimeout(() => { try { const dlg = settingsDialogRef.current; const ae = (document.activeElement as HTMLElement | null); if (settingsOpen && dlg && ae && !dlg.contains(ae)) { keyInputRef.current?.focus(); } } catch {} }, 0); }}
                  onKeyDownCapture={(e) => { if ((e as unknown as KeyboardEvent).key !== "Escape") e.stopPropagation(); }}
                  onKeyUpCapture={(e) => e.stopPropagation()}
                  onKeyPressCapture={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { if (e.key !== "Escape") e.stopPropagation(); }}
                  onKeyPress={(e) => e.stopPropagation()}
                  onBeforeInput={(e) => e.stopPropagation()}
                  onCompositionStart={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
                  onCompositionEnd={() => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} }}
                />
              </div>

              {}
              <div className={styles.row}>
                <div className={styles.hstack}>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleKeySave} aria-label="Secure save">Secure Save</button>
                  <button type="button" className={`${styles.btn}`} onClick={handleKeyCheck} aria-label="Check API" disabled={keyCheck.state === "checking"}>
                    {keyCheck.state === "checking" ? "Checking…" : "Check Key"}
                  </button>
                  <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleKeyClear} aria-label="Clear secret">Clear</button>
                </div>

                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={keyPersist}
                    onChange={(e) => { setConsultonKeyPersisting(e.currentTarget.checked); setKeyPersist(e.currentTarget.checked); }}
                  />
                  <span>Remember for this session</span>
                </label>
              </div>

              {}
              <div className={styles.fieldRow}>
                <label className={styles.label}>Current</label>
                <div className={styles.keyPreview} aria-live="polite">
                  {maskedKey || <em className={styles.muted}>(none)</em>}
                </div>
              </div>

              {keyCheck.state !== "idle" && (
                <div className={styles.meta} role="status" aria-live="polite">
                  {keyCheck.state === "ok" && <span className={styles.statusOk}>Key OK</span>}
                  {keyCheck.state === "error" && <span className={styles.metaWarn}>{keyCheck.message}</span>}
                  {keyCheck.state === "checking" && <span>Checking…</span>}
                </div>
              )}

              <div className={styles.note}>
                Keys are never stored in localStorage. If “Remember for this session” is on, the key is kept in sessionStorage and cleared when this tab closes.
              </div>
            </div>

            {}
            <div className={styles.group}>
              <div className={styles.groupTitle}>Generation</div>

              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="consult-temp">Temperature</label>
                <div className={styles.sliderWrap}>
                  <input id="consult-temp" type="range" min={0} max={1} step={0.01} value={temperature} onChange={(e) => setTemperature(clampNum(parseFloat(e.currentTarget.value), 0, 1))} />
                  <div className={styles.sliderVal}>{temperature.toFixed(2)}</div>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="consult-maxtok">Max Tokens</label>
                <input id="consult-maxtok" type="number" className={styles.input} min={64} max={8192} step={16} value={maxTokens} onChange={(e) => setMaxTokens(clampNum(parseInt(e.currentTarget.value || "0", 10), 64, 8192))} />
              </div>

              <div className={styles.row}>
                <label className={styles.switch}>
                  <input type="checkbox" checked={redact} onChange={(e) => setRedact(!!e.currentTarget.checked)} />
                  <span>Redact context (de-identify)</span>
                </label>
                {effectivePolicy !== "none" && (
                  <span className={styles.pillRedacted} title={`Effective policy: ${effectivePolicy}`}>Redacted</span>
                )}
              </div>
            </div>

            {}
            <div className={styles.group}>
              <div className={styles.groupTitle}>Token Budget (estimate)</div>
              <TokenBudget prompt={prompt} appState={appState} policy={effectivePolicy} maxTokens={maxTokens} />
              <div className={styles.note}>Estimate uses a simple heuristic (~4 chars per token). Actual usage may vary by model.</div>
            </div>

            {}
            <div className={styles.group}>
              <div className={styles.groupTitle}>Diagnostics (No-PHI)</div>
              <div className={styles.row}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={telemetryOptIn}
                    onChange={(e) => {
                      const v = !!e.currentTarget.checked;
                      setTelemetryOptIn(v);
                      setTelemetryOptInState(v);
                    }}
                  />
                  <span>Share anonymous diagnostics</span>
                </label>
                <span className={styles.meta}>
                  Stores timings & token estimates locally. No prompts, outputs, or patient data.
                </span>
              </div>
            </div>

            <div className={styles.dialogFooter}>
              <button className={`${styles.btn}`} onClick={() => setSettingsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {}
      {!!auditOpen && !!auditSel && (
        <div className={styles.consultOverlay} role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setAuditOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="consult-audit-title" className={styles.consultDialog}>
            <div className={styles.dialogHeader}>
              <h2 id="consult-audit-title">Run Diagnostics</h2>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setAuditOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className={styles.group}>
              <div className={styles.fieldRow}><span className={styles.label}>Run ID</span><span className={styles.keyPreview}>{auditSel.id}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Model</span><span>{auditSel.model}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Started</span><span>{new Date(auditSel.tsStart).toLocaleString()}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Duration</span><span>{auditSel.durationMs ? `${Math.round(auditSel.durationMs)} ms` : "…"}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Outcome</span><span>{auditSel.outcome ?? "running"}</span></div>
              {!!(auditSel.status || auditSel.errorKind) && <div className={styles.fieldRow}><span className={styles.label}>Status</span><span>{auditSel.status ? `HTTP ${auditSel.status}` : auditSel.errorKind}</span></div>}
            </div>
            <div className={styles.group}>
              <div className={styles.groupTitle}>Token Estimates (approx.)</div>
              <div className={styles.fieldRow}><span className={styles.label}>Prompt</span><span>~{auditSel.tokensPromptEst ?? 0}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Context</span><span>~{auditSel.tokensContextEst ?? 0}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Output</span><span>~{auditSel.tokensOutputEst ?? 0}</span></div>
              <div className={styles.fieldRow}><span className={styles.label}>Chunks</span><span>{auditSel.chunks ?? 0}</span></div>
            </div>
            <div className={styles.dialogFooter}>
              <button className={styles.btn} onClick={() => setAuditOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {}
      {!!previewOpen && (
        <div
          className={styles.consultOverlay}
          role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="consult-preview-title"
            className={`${styles.consultDialog} ${styles.previewDialog}`}
          >
            <div className={styles.dialogHeader}>
              <h2 id="consult-preview-title">Preview</h2>
              <div className={styles.hstack}>
                <button className={`${styles.btn}`} onClick={() => handleCopy()} aria-label="Copy preview">Copy</button>
                <button className={`${styles.btn}`} onClick={() => handleQuickPrint()} aria-label="Print preview">Print</button>
                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPreviewOpen(false)} aria-label="Close preview">✕</button>
              </div>
            </div>
            <div className={styles.previewBody}>
              <div dangerouslySetInnerHTML={{ __html: outputHtml || "<em class='muted'>(No output)</em>" }} />
            </div>
          </div>
        </div>
      )}

      {}
      {!!compareOpen && (
        <div className={styles.consultOverlay} role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setCompareOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="consult-compare-title" className={styles.consultDialog}>
            <div className={styles.dialogHeader}>
              <h2 id="consult-compare-title">Compare Sessions</h2>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setCompareOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className={styles.group}>
              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="cmp-left">Left</label>
                <select id="cmp-left" className={styles.select} value={compareLeft ?? ""} onChange={(e) => setCompareLeft(e.currentTarget.value || null)}>
                  <option value="">—</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="cmp-right">Right</label>
                <select id="cmp-right" className={styles.select} value={compareRight ?? ""} onChange={(e) => setCompareRight(e.currentTarget.value || null)}>
                  <option value="">—</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            </div>

            <hr className={styles.hrThin} />

            <div className={styles.group}>
              {compareLeft && compareRight ? (
                <DiffSideBySide
                  leftTitle={sessions.find(s => s.id === compareLeft)?.title || "Left"}
                  rightTitle={sessions.find(s => s.id === compareRight)?.title || "Right"}
                  leftText={(sessions.find(s => s.id === compareLeft)?.raw || "").trim()}
                  rightText={(sessions.find(s => s.id === compareRight)?.raw || "").trim()}
                />
              ) : (
                <div className={styles.muted}>Select two sessions to compare.</div>
              )}
            </div>

            <div className={styles.dialogFooter}>
              <span className={styles.meta}><span className={styles.kb}>Alt+1..9</span> switch tabs • <span className={styles.kb}>Ctrl/⌘+Shift+D</span> open Compare • <span className={styles.kb}>Ctrl/⌘+Shift+C</span> Copy Reduced</span>
              <button className={styles.btn} onClick={() => setCompareOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {}
      {!!flashMsg && <div className={styles.toast} role="status" aria-live="polite">{flashMsg}</div>}
    </div>
  );
};

export default ConsultonPanel;
