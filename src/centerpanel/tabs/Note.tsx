/* eslint-disable react-refresh/only-export-components */
/* eslint-disable prefer-template */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-imports */
import React, { useEffect, useRef } from "react";
import styles from "../styles/note.module.css";
import { useNoteStore, type SlotKey } from "../../stores/useNoteStore";
import { useAccessStore } from "../../stores/useAccessStore";

import { useRegistry, selectLastTwoScores } from "../registry/state";
import type { Patient, Encounter } from "../registry/types";

import { nowStamp } from "../lib/composeToNote";

import * as exp from "../lib/exporters";
import { computeExportGaps } from "./note-heuristics";
import PatientHeader from "./PatientHeader";
import ClinicalSnapshotStrip, { type KvPill } from "../ClinicalSnapshotStrip";
import NoteSections, { type NoteSectionSlot } from "./NoteSections";
import NoteFooterBar from "./NoteFooterBar";
import { NOTE_GLOBAL_FOOTER } from "../Flows/legalCopy";



export type NoteSlots = {
  summary?: string;
  plan?: string;
  refs?: string;
  outcome?: string;
  vitals?: string;
};


const EMPTY_SLOTS: NoteSlots = { summary: "", plan: "", refs: "", outcome: "", vitals: "" };


const NOTE_PATCH_EVENT = "note/applyPatch";

const NOTE_CITE_EVENT = "note/addCitation";


const NOTE_COMPACT_KEY = "note/compactMode";

const NOTE_CAREPLAN_EVENT = "note/carePlanInserted";


function eqSlots(a?: NoteSlots, b?: NoteSlots): boolean {
  const K: (keyof NoteSlots)[] = ["summary","plan","refs","outcome","vitals"];
  return K.every(k => (a?.[k] ?? "") === (b?.[k] ?? ""));
}


function useDebouncedEffect(effect: () => void, deps: any[], delay = 350) {
  const first = useRef(true);
  useEffect(() => {
    const id = setTimeout(() => {
      effect();
      first.current = false;
    }, delay);
    return () => clearTimeout(id);

  }, deps);
}


function appendText(base: string, add: string, sep = "\n"): string {
  if (!add) return base ?? "";
  const a = String(base ?? "").trimEnd();
  const b = String(add ?? "").trimStart();
  if (!a) return b;
  if (!b) return a;
  return a + sep + b;
}

function patchSlots(slots: NoteSlots, patch: Partial<NoteSlots>): NoteSlots {
  const next = { ...slots } as NoteSlots;
  (Object.keys(patch) as (keyof NoteSlots)[]).forEach(k => {
    const v = patch[k];
    if (typeof v === "string") next[k] = appendText(String(next[k] ?? ""), v);
  });
  return next;
}

function formatDelta(latest?: number, prev?: number): string {
  if (latest == null || prev == null) return "(Δ—)";
  const delta = latest - prev;
  const s = delta > 0 ? `+${delta}` : `${delta}`;
  return `(Δ${s})`;
}

function apaRefLine(instr: string, isoDate: string, context: string): string {
  return `${instr} administered ${isoDate}. Context: ${context}.`;
}

const TPL_SOAP_SUMMARY = [
  "Subjective: Patient-reported concerns and recent changes.",
  "Objective: Mental status observations; screening scores as available."
].join(" ");
const TPL_SOAP_PLAN = [
  "Assessment: Working impression based on history, MSE, and screenings.",
  "Plan: Safety review; psychoeducation; follow-up and coordination steps."
].join(" ");
const TPL_MSE_BLOCK = [
  "MSE — appearance, behavior, and speech observed; mood/affect described;",
  "thought process/content organized; perception intact as reported;",
  "orientation/attention/memory screened; insight/judgment considered."
].join(" ");
const TPL_RISK_PLAN = [
  "Risk & Safety: Patient denies acute intent/plan; protective factors discussed.",
  "Safety planning reviewed. Patient informed that this documentation supports clinical communication and does not constitute treatment directives."
].join(" ");
const TPL_RISK_REF = "Risk documentation added (non-directive language).";


type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };
const I = {
  Copy:    ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M9 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Clear:   ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h16M9 7v12m6-12v12M10 4h4l1 3H9l1-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  Export:  ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v12m0-12 4 4m-4-4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M4 14v4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Camera:  ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 8l1.5-2h5L16 8" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Diff:    ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M7 4h10M7 10h10M7 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M19 14v6m3-3h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  Wide:    ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M4 6h8v12H4zM12 6h8v12h-8z" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Narrow:  ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M4 6h4v12H4zM16 6h4v12h-4z" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Clock:   ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  Risk:    ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l9 16H3L12 3Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="14" r="1" fill="currentColor"/><path d="M12 9v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  Badge:   ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V6h4l3-3Z" stroke="currentColor" strokeWidth="1.6"/></svg>),
  Id:      ({size=14, ...p}:IconProps)=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
};

type FlowPreview = { id: string; name: string; summary: string; completedAt: number };

function asTime(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  const t = Date.parse(String(v));
  return Number.isFinite(t) ? t : undefined;
}

function summarize(text: string, n = 120): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1) + "…";
}


function collectCompletedFlows(state: any, patient: any, encounter: any): FlowPreview[] {
  const out: FlowPreview[] = [];
  if (!patient || !encounter) return out;

  const pid = patient.id;
  const eid = encounter.id;

  const push = (item: any) => {
    if (!item) return;
    const completed = asTime(item.completedAt ?? item.completed ?? item.when);
    if (!completed) return;
    const name = String(item.name ?? item.title ?? item.flowName ?? "Flow");
    const raw =
      String(item.outcome ?? item.result ?? item.summary ?? item.text ?? "")
        .replace(/\n+/g, " ")
        .trim();
    const id = String(item.id ?? `${name}-${completed}`);
    out.push({ id, name, summary: summarize(raw || "(no summary)"), completedAt: completed });
  };

  const enc: any = encounter;
  if (Array.isArray(enc.flows)) enc.flows.forEach(push);
  if (Array.isArray(enc.flowRuns)) enc.flowRuns.forEach(push);

  const st: any = state;
  if (Array.isArray(st?.flowRuns)) {
    st.flowRuns
      .filter((r: any) => (!r.patientId || r.patientId === pid) && r.encounterId === eid)
      .forEach(push);
  }
  if (st?.flowsByEncounter && Array.isArray(st.flowsByEncounter[eid])) {
    st.flowsByEncounter[eid].forEach(push);
  }

  return out.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
}

function formatWhen(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString();
}


export function composeNote(slots: NoteSlots): string {
  const parts: string[] = [];
  if (slots.summary) parts.push(`Summary\n${slots.summary.trim()}`);
  if (slots.plan)    parts.push(`Plan\n${slots.plan.trim()}`);
  if (slots.vitals)  parts.push(`Vitals\n${slots.vitals.trim()}`);
  if (slots.outcome) parts.push(`Outcome\n${slots.outcome.trim()}`);
  if (slots.refs)    parts.push(`References\n${slots.refs.trim()}`);
  return parts.join("\n\n");
}

export function NoteEditor(props: {
  value: NoteSlots;
  onChange: (next: NoteSlots) => void;
  readOnly?: boolean;
  slotOrder?: Array<keyof NoteSlots>;
}) {
  const { value, onChange, readOnly, slotOrder = ["summary","plan","vitals","outcome","refs"] } = props;
  const fields: Array<{ key: keyof NoteSlots; label: string; placeholder: string }> = [
    { key: "summary", label: "Summary", placeholder: "Clinical summary..." },
    { key: "plan",    label: "Plan",    placeholder: "Diagnostics / therapy / follow-up..." },
    { key: "vitals",  label: "Vitals",  placeholder: "BP / HR / Temp / SpO₂ ..." },
    { key: "outcome", label: "Outcome", placeholder: "Immediate outcome / disposition..." },
    { key: "refs",    label: "References", placeholder: "Citations, guideline bullets..." },
  ];
  const ordered = fields.filter(f => (slotOrder as string[]).includes(f.key)).sort(
    (a,b) => slotOrder.indexOf(a.key) - slotOrder.indexOf(b.key)
  );
  return (
    <div style={{display:"flex", flexDirection:"column", gap:12}}>
      {ordered.map(({key, label, placeholder}) => (
        <div key={key}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>{label}</div>
          <textarea
            aria-label={label}
            placeholder={placeholder}
            value={(value[key] ?? "") as string}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            readOnly={readOnly}
            style={{
              width: "100%", minHeight: 96, borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.25)", color: "#EAF2FF",
              padding: 10, fontSize: 13, lineHeight: "1.4"
            }}
          />
        </div>
      ))}
    </div>
  );
}

const SLOT_TITLES: Record<SlotKey,string> = {
  summary: "Summary",
  plan: "Plan",
  refs: "References (APA)",
  outcome: "Flow Outcome",
  vitals: "Vitals / Results"
};

const Note: React.FC = () => {

  const slots = useNoteStore();
  const active = useNoteStore(s => (s as any).activeSlot as SlotKey);
  const canEdit = useAccessStore(s => s.canEdit());


  const { state, actions } = useRegistry();
  const patient: Patient | undefined = state.selectedPatientId
    ? state.patients.find(p => p.id === state.selectedPatientId)
    : undefined;
  const encounter: Encounter | undefined =
    (patient && state.selectedEncounterId)
      ? (patient.encounters || []).find(e => e.id === state.selectedEncounterId)
      : undefined;


  const displayPatient: Patient | undefined = patient ?? (state.patients && state.patients.length > 0 ? state.patients[0] : undefined);
  const displayEncounter: Encounter | undefined = (() => {
    if (encounter) return encounter;
    const list = (displayPatient?.encounters || []) as Encounter[];
    if (!list.length) return undefined;
    let latest = list[0];
    for (let i = 1; i < list.length; i++) {
      const cur = list[i];
      if ((cur?.when ?? 0) > (latest?.when ?? 0)) latest = cur;
    }
    return latest;
  })();


  const [buffer, setBuffer] = React.useState<NoteSlots>(EMPTY_SLOTS);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | undefined>(undefined);
  const hasSelection = Boolean(patient && encounter);



  const [footerMsg, setFooterMsg] = React.useState<string | null>(null);
  const transientFlash = (msg: string) => {
    setFooterMsg(msg);
    window.setTimeout(() => setFooterMsg(null), 1800);
  };

  const [recentCarePlanInsert, setRecentCarePlanInsert] = React.useState(false);

  const [phase, setPhase] = React.useState<"capture" | "polish">("capture");

  const [openSlot, setOpenSlot] = React.useState<SlotKey | null>("summary");
  React.useEffect(() => {

    if (active) setOpenSlot(active);
  }, [active]);
  const toggleSlot = (slotId: SlotKey) => {
    setOpenSlot(prev => (prev === slotId ? null : slotId));
    try { useNoteStore.getState().setActiveSlot(slotId); } catch {}
  };
  const sectionRefs = React.useRef<Record<SlotKey, HTMLDivElement | null>>({ summary: null, plan: null, vitals: null, outcome: null, refs: null });
  const selectTab = (slotId: SlotKey) => {
    setOpenSlot(slotId);
    try { useNoteStore.getState().setActiveSlot(slotId); } catch {}
    const el = sectionRefs.current[slotId];
    if (el) {
      try { el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }); } catch {}
    }
  };

  const textRefs = React.useRef<Record<SlotKey, HTMLTextAreaElement | null>>({ summary: null, plan: null, refs: null, outcome: null, vitals: null });




  React.useEffect(() => {
    function onInsert(ev: Event) {
      const detail = (ev as CustomEvent).detail as { markdown: string } | undefined;
      const md = detail?.markdown ?? "";
      if (!md) return;
      try {

        (window as any).editorBridge?.insertMarkdownAtCursor?.(md);
        return;
      } catch {}

      try { navigator.clipboard?.writeText(md); } catch {}
    }
    window.addEventListener("therapy-timer:insert-into-note", onInsert as EventListener);
    return () => window.removeEventListener("therapy-timer:insert-into-note", onInsert as EventListener);
  }, []);


  React.useEffect(() => {
    if (hasSelection) {
      const fromEnc = (encounter as any)?.noteSlots as NoteSlots | undefined;
      setBuffer(fromEnc && !eqSlots(fromEnc, undefined) ? { ...EMPTY_SLOTS, ...fromEnc } : { ...EMPTY_SLOTS });
      setLastSavedAt(Date.now());
    }

  }, [hasSelection, patient?.id, encounter?.id]);


  React.useEffect(() => {
    if (!hasSelection) return;
    const fromEnc = (encounter as any)?.noteSlots as NoteSlots | undefined;
    const next = fromEnc ? { ...EMPTY_SLOTS, ...fromEnc } : { ...EMPTY_SLOTS };
    setBuffer(prev => (eqSlots(prev, next) ? prev : next));

  }, [hasSelection, encounter?.noteSlots, patient?.id, encounter?.id]);


  useDebouncedEffect(() => {
    if (!hasSelection || !canEdit) return;
    try {
      actions.setEncounterSlots(patient!.id, encounter!.id, buffer);
      setLastSavedAt(Date.now());
    } catch (e) {

      console.warn("[Note] setEncounterSlots failed:", e);
    }
  }, [buffer, hasSelection, canEdit, patient?.id, encounter?.id], 350);


  React.useEffect(() => {
    function onPatch(ev: Event) {
      const e = ev as CustomEvent<Partial<NoteSlots>>;
      if (!e.detail) return;
      setBuffer(prev => patchSlots(prev, e.detail!));
    }
    window.addEventListener(NOTE_PATCH_EVENT, onPatch as EventListener);
    return () => window.removeEventListener(NOTE_PATCH_EVENT, onPatch as EventListener);
  }, []);


  React.useEffect(() => {
    const onCare = () => {
      setRecentCarePlanInsert(true);
      const id = window.setTimeout(() => setRecentCarePlanInsert(false), 60_000);
      return () => window.clearTimeout(id);
    };
    window.addEventListener(NOTE_CAREPLAN_EVENT, onCare);
    return () => window.removeEventListener(NOTE_CAREPLAN_EVENT, onCare);
  }, []);


  const getSlotValue = (slot: SlotKey): string => {
    const encounterVal = (buffer as any)?.[slot] ?? "";
    const localVal = (slots as any)?.[slot] ?? "";
    return hasSelection ? String(encounterVal ?? "") : String(localVal ?? "");
  };
  const setSlotValue = (slot: SlotKey, v: string) => {
    if (!canEdit) return;
    if (hasSelection) setBuffer(prev => ({ ...prev, [slot]: v }));
    else slots.setSlot(slot, v);
  };

  const clear = () => {
    if (!canEdit) return;
    if (hasSelection) setBuffer(prev => ({ ...prev, [active]: "" }));
    else slots.setSlot(active, "");
  };

  const copy = async () => { try { await navigator.clipboard.writeText(getSlotValue(active)); } catch {} };


  const updatedLocal = React.useMemo(() => new Date((slots as any).updatedAt).toLocaleString(), [(slots as any).updatedAt]);
  const updatedEncounter = lastSavedAt ? new Date(lastSavedAt).toLocaleString() : "—";
  const updated = hasSelection ? updatedEncounter : updatedLocal;


  const charCount = (String(getSlotValue(active) || "")).length;
  const lastSavedHumanTime = React.useMemo(() => {
    const t = hasSelection ? lastSavedAt : (slots as any).updatedAt;
    if (!t) return "—";
    try { return new Date(t).toLocaleTimeString(); } catch { return "—"; }
  }, [hasSelection, lastSavedAt, (slots as any).updatedAt]);


  function dynamicHintForSlot(slot: SlotKey): string {
    switch (slot) {
      case "summary":
        return "Brief course, key mental status, acute risks, current functioning.";
      case "plan":
        return "Interventions, follow-up, safety planning, coordination of care.";
      case "refs":
        return "Citations, guidelines consulted, documentation support language.";
      case "outcome":
        return "Patient response, adherence, trajectory since last visit.";
      case "vitals":
        return "Objective data: labs, vitals, screening scores.";
      default:
        return "Clinical documentation.";
    }
  }


  function renderContextBarForSlot(slot: SlotKey, slotText: string, _curPhase: "capture"|"polish") {
    const chips: Array<{ key: string; label: string; warn?: boolean; onClick?: () => void; title?: string }>=[];
    if (slot === "summary") {
      chips.push({ key: "si", label: "SI / HI?" });
      chips.push({ key: "safety", label: "Safety plan?", warn: true });
      chips.push({ key: "mse", label: "MSE notable?" });
    } else if (slot === "plan") {
      chips.push({ key: "follow", label: "Follow-up / return precautions?" });
      chips.push({ key: "sdm", label: "Shared decision-making documented?" });
      chips.push({ key: "coord", label: "Coordination / collateral?" });
    } else if (slot === "refs") {
      chips.push({ key: "evidence", label: "Add guideline / evidence?", onClick: () => {

        const add = "Reviewed guideline / best practices; documentation support only.";
        const prev = getSlotValue("refs");
        setSlotValue("refs", appendText(prev, add));
        transientFlash("Added documentation support line ✓");
      }});
      chips.push({ key: "docsupport", label: "Document 'reviewed best practices'?" });
    }
    const risky = /(non[- ]?compliant|noncompliant|manipulative|drug[- ]?seeking|patient\s+denies\s+any\s+suicidal\s+ideation|safe\s+for\s+discharge)/i.test(slotText || "");
    if (risky) {
      chips.push({ key: "lang", label: "Language review?", warn: true, title: "Consider neutral framing ('reports difficulty adhering') or qualify risk statements ('no SI reported at this time')." });
    }
    return (
      <>
        {chips.map(c => (
            <button
            key={c.key}
            className={c.warn ? styles.contextChipWarn : styles.contextChip}
            onClick={(e) => { e.stopPropagation(); if (c.onClick) c.onClick(); }}
            title={c.title}
            type="button"
          >
            {c.label}
          </button>
        ))}
      </>
    );
  }


  function cleanToneText(raw: string): string {
    let t = String(raw || "");

    t = t.replace(/\bnon[- ]?compliant\b/gi, "reports difficulty adhering");
    t = t.replace(/\bnonadherent\b/gi, "reports difficulty adhering");

    t = t.replace(/\bdenies\b/gi, "reports no current");

    t = t.replace(/\balways\b/gi, "consistently");
    t = t.replace(/\bnever\b/gi, "not currently reported");

    t = t.replace(/\bI\s+(told|informed|advised)\b/gi, "Provider reviewed");
    t = t.replace(/\bwe\s+(discussed|told|informed)\b/gi, "Provider and patient reviewed");

    t = t.replace(/\brefused\b/gi, "declined");
    t = t.replace(/\bclaims\b/gi, "reports");
    return t;
  }

  function tightenText(raw: string): string {
    let t = String(raw || "");

    t = t.split(/\r?\n/).map(l => l.replace(/\s+$/g, "").replace(/^\s+/g, "")).join("\n");

    t = t.replace(/\n{3,}/g, "\n\n");

    t = t.replace(/^(?:patient|pt)\s+is\s+a\s+/gim, (m) => m.toLowerCase());

    t = t.replace(/\b[Pp]atient states that\b/g, "Pt states");
    t = t.replace(/\b[Pp]atient reports that\b/g, "Pt reports");
    t = t.replace(/\b[Pp]atient denies that\b/g, "Pt denies");

    t = t.replace(/[ \t]{2,}/g, " ");
    return t.trimEnd();
  }




  const normalizeSlot = (slot: SlotKey) => {
    const currentSlotValue = getSlotValue(slot);
    const updatedText = cleanToneText(currentSlotValue);
    if (updatedText !== currentSlotValue) {
      setSlotValue(slot, updatedText);
      transientFlash("Tone cleaned ✓");
    }
  };
  const tightenSlot = (slot: SlotKey) => {
    const currentSlotValue = getSlotValue(slot);
    const updatedText = tightenText(currentSlotValue);
    if (updatedText !== currentSlotValue) {
      setSlotValue(slot, updatedText);
      transientFlash("Tightened ✓");
    }
  };

  function timeStampStr() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm} — `;
  }
  function insertAtCursor(slot: SlotKey, insertStr: string) {
    const ta = textRefs.current[slot];
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const prev = getSlotValue(slot);
    const next = prev.slice(0, start) + insertStr + prev.slice(end);
    setSlotValue(slot, next);
    requestAnimationFrame(() => {
      try {
        ta.focus();
        const pos = start + insertStr.length;
        ta.setSelectionRange(pos, pos);
      } catch {}
    });

  }






  type DiffSeg = { kind: "same" | "add" | "del"; text: string };
  function lcs(a: string[], b: string[]): number[][] {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
    for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) {
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
    return dp;
  }
  function diffLines(prev: string, curr: string): DiffSeg[] {
    const A = (prev || "").split(/\r?\n/);
    const B = (curr || "").split(/\r?\n/);
    const dp = lcs(A,B);
    let i=A.length, j=B.length;
    const rev: DiffSeg[] = [];
    while (i>0 && j>0) {
      if (A[i-1] === B[j-1]) { rev.push({kind:"same", text:B[j-1]}); i--; j--; }
      else if (dp[i-1][j] >= dp[i][j-1]) { rev.push({kind:"del", text:A[i-1]}); i--; }
      else { rev.push({kind:"add", text:B[j-1]}); j--; }
    }
    while (i>0) { rev.push({kind:"del", text:A[i-1]}); i--; }
    while (j>0) { rev.push({kind:"add", text:B[j-1]}); j--; }
    return rev.reverse();
  }



  const [expOpen, setExpOpen] = React.useState(false);
  const [diffOpen, setDiffOpen] = React.useState(false);
  const [exportGaps, setExportGaps] = React.useState<{ missingRisk?: boolean; missingFollow?: boolean }>({});



  const [diffForSlot, setDiffForSlot] = React.useState<SlotKey>(active);
  const [diffTwoCol, setDiffTwoCol] = React.useState<boolean>(false);
  type InfoMode = "overview" | "risk" | "meds" | "vitals" | "safety";
  const [infoMode, setInfoMode] = React.useState<InfoMode>("overview");


  React.useEffect(() => {
    if (!expOpen) return;
    const sum = hasSelection ? String(buffer.summary || "") : String((slots as NoteSlots).summary || "");
    const planVal = hasSelection ? String(buffer.plan || "") : String((slots as NoteSlots).plan || "");
    setExportGaps(computeExportGaps({ summary: sum, plan: planVal }));

  }, [expOpen]);


  const [snapCount, setSnapCount] = React.useState<number>(
    Array.isArray((encounter as any)?.snapshots) ? (encounter as any).snapshots.length : 0
  );
  React.useEffect(() => {
    setSnapCount(Array.isArray((encounter as any)?.snapshots) ? (encounter as any).snapshots.length : 0);
  }, [encounter?.id, (encounter as any)?.snapshots]);

  function takeSnapshot() {
    if (!hasSelection || !canEdit) return;
    try {
      const entry = actions.createEncounterSnapshot(patient!.id, encounter!.id, buffer);
      if (entry) setSnapCount(c => c + 1);
    } catch (e) { console.warn("[Note] snapshot failed:", e); }
  }

  const lastSnap = React.useMemo(() => {
    const arr = (encounter as any)?.snapshots as Array<{id:string; when:number; slots: NoteSlots}> | undefined;
    if (!hasSelection || !arr || arr.length === 0) return undefined;
    return arr[arr.length - 1];
  }, [hasSelection, (encounter as any)?.snapshots]);

  const [selectedSnapId, setSelectedSnapId] = React.useState<string | null>(null);
  const selectedSnap = React.useMemo(() => {
    if (!selectedSnapId) return null;
    const arr = (encounter as any)?.snapshots as Array<{id:string; when:number; slots: NoteSlots}> | undefined;
    return (arr || []).find(s => s.id === selectedSnapId) || null;
  }, [selectedSnapId, (encounter as any)?.snapshots]);
  const prevText = React.useMemo(
    () => {
      const base = selectedSnap || lastSnap;
      return base ? String((base.slots as any)[diffForSlot] ?? "") : "";
    },
    [selectedSnap, lastSnap, diffForSlot]
  );
  const currText = React.useMemo(
    () => String((hasSelection ? (buffer as any)[diffForSlot] : (slots as any)[diffForSlot]) ?? ""),
    [hasSelection, buffer, slots, diffForSlot]
  );
  const segs = React.useMemo(() => diffLines(prevText, currText), [prevText, currText]);



  async function doCopyMarkdown() {
    const src: NoteSlots = hasSelection ? buffer : {
      summary: (slots as any).summary, plan: (slots as any).plan, refs: (slots as any).refs, outcome: (slots as any).outcome, vitals: (slots as any).vitals
    };
  try { await navigator.clipboard.writeText(exp.buildMarkdown(src)); } catch(e) { console.warn("copy md", e); }
    setExpOpen(false);
  }
  async function doCopyHTML() {
    const src: NoteSlots = hasSelection ? buffer : {
      summary: (slots as any).summary, plan: (slots as any).plan, refs: (slots as any).refs, outcome: (slots as any).outcome, vitals: (slots as any).vitals
    };
  try { await navigator.clipboard.writeText(exp.buildHTML(src)); } catch(e) { console.warn("copy html", e); }
    setExpOpen(false);
  }
  function doDownloadHTML() {
    const src: NoteSlots = hasSelection ? buffer : {
      summary: (slots as any).summary, plan: (slots as any).plan, refs: (slots as any).refs, outcome: (slots as any).outcome, vitals: (slots as any).vitals
    };
  const blob = new Blob([exp.buildHTML(src)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clinical-note.html"; a.click();
    URL.revokeObjectURL(url);
    setExpOpen(false);
  }
  function doPrint() {
    const src: NoteSlots = hasSelection ? buffer : {
      summary: (slots as any).summary, plan: (slots as any).plan, refs: (slots as any).refs, outcome: (slots as any).outcome, vitals: (slots as any).vitals
    };
  const html = exp.buildHTML(src);
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
    setExpOpen(false);
  }




  const pillsByMode = React.useMemo(() => {

    const grade = (patient as any)?.risk != null ? `Grade ${(patient as any).risk}` : undefined;
    const phq = (selectLastTwoScores as any)?.(patient, "PHQ9")?.latest as number | undefined;
    const gad = (selectLastTwoScores as any)?.(patient, "GAD7")?.latest as number | undefined;
    const bf  = (selectLastTwoScores as any)?.(patient, "BFCRS")?.latest as number | undefined;

    const vitalsStr = String((buffer as any).vitals?.trim() || (encounter as any)?.vitals || "").trim();
    const medsStr = (encounter as any)?.meds ?? (patient as any)?.medications;
    const allergiesStr = (patient as any)?.allergies;
    const safetyPlanVal = (encounter as any)?.safetyPlan;
    const contactsVal = (encounter as any)?.contacts;

    const overviewPills: KvPill[] = [];
    if (grade) overviewPills.push({ id: "ov-risk", label: "Risk", value: grade });
    if (typeof safetyPlanVal !== "undefined") {
      const present = Boolean(String(safetyPlanVal || "").trim());
      overviewPills.push({ id: "ov-safety", label: "Safety plan", value: present ? "Present" : "Missing", severity: present ? "ok" : "high" });
    }
    if (medsStr) overviewPills.push({ id: "ov-meds", label: "Meds", value: String(medsStr) });
    if (phq != null) overviewPills.push({ id: "ov-phq", label: "PHQ-9", value: String(phq) });
    if (vitalsStr) {
      overviewPills.push({ id: "ov-vitals", label: "Vitals", value: vitalsStr });
    }

    const riskPills: KvPill[] = [];
    if (grade) riskPills.push({ id: "risk-grade", label: "Grade", value: grade });
    if (phq != null) riskPills.push({ id: "risk-phq", label: "PHQ-9", value: String(phq) });
    if (gad != null) riskPills.push({ id: "risk-gad", label: "GAD-7", value: String(gad) });
    if (bf != null)  riskPills.push({ id: "risk-bfcrs", label: "BFCRS", value: String(bf) });

    const medsPills: KvPill[] = [];
    if (allergiesStr != null) medsPills.push({ id: "meds-allergies", label: "Allergies", value: String(allergiesStr || "None") });
    if (medsStr != null) medsPills.push({ id: "meds-active", label: "Meds", value: String(medsStr || "—") });

    const vitalsPills: KvPill[] = [];
    if (vitalsStr) vitalsPills.push({ id: "vitals", label: "Vitals", value: vitalsStr });

    const safetyPills: KvPill[] = [];
    if (typeof safetyPlanVal !== "undefined") {
      const present = Boolean(String(safetyPlanVal || "").trim());
      safetyPills.push({ id: "safety-plan", label: "Safety plan", value: present ? "Present" : "Missing", severity: present ? "ok" : "high" });
    }
    if (contactsVal != null) safetyPills.push({ id: "safety-contacts", label: "Contacts", value: String(contactsVal) });

    return { overviewPills, riskPills, medsPills, vitalsPills, safetyPills };
  }, [patient, encounter, buffer]);

  return (
    <div className={styles.noteWrap} aria-label="Note composer">
      <section className={styles.editor}>
        <div className={styles.centerWrap}>
          <div className={styles.canvas}>
        <div className={styles.pageWrap}>
        {}
        <PatientHeader
          patientDisplayName={displayPatient?.name ?? (hasSelection ? "Patient" : "No patient selected")}
          {...(hasSelection && patient?.id ? { patientId: patient.id } : {})}
          {...(((displayPatient as any)?.age !== undefined && (displayPatient as any)?.sex !== undefined)
            ? { ageSexLabel: `${(displayPatient as any).age} • ${(displayPatient as any).sex}` }
            : {})}
          riskBadges={displayPatient?.risk !== undefined ? [{ label: `Grade ${String(displayPatient.risk)}` }] : []}
          tagBadges={displayPatient ? (displayPatient.tags ?? []) : ["Demo note (Local)"]}

          {...(displayEncounter?.when ? { encounterLabel: `Encounter: ${new Date(displayEncounter.when).toLocaleString()}` } : {})}
          lastUpdatedLabel={`Updated: ${updated}`}

          autosaveLabel={hasSelection ? "Autosave ✓" : "Local"}
          belowNode={
            <ClinicalSnapshotStrip
              infoMode={infoMode}
              onSelectInfoMode={setInfoMode}
              overviewPills={pillsByMode.overviewPills}
              riskPills={pillsByMode.riskPills}
              medsPills={pillsByMode.medsPills}
              vitalsPills={pillsByMode.vitalsPills}
              safetyPills={pillsByMode.safetyPills}
              stickyEnabled={false}
              tone="in-header"
            />
          }
        />

        {}
        <div className={styles.slotTabs} role="tablist" aria-label="Note sections">
          {(["summary","plan","vitals","outcome","refs"] as SlotKey[]).map(s => (
            <button
              key={s}
              role="tab"
              aria-selected={openSlot === s}
              className={styles.slotTab}
              data-active={openSlot === s}
              onClick={() => selectTab(s)}
              type="button"
              title={SLOT_TITLES[s]}
            >
              {SLOT_TITLES[s]}
            </button>
          ))}
        </div>


        {}
        <div className={styles.mainAndDockWrap}>
          <div className={styles.mainColumn}>
          {(() => {
            const slotsArr: NoteSectionSlot[] = (["summary","plan","vitals","outcome","refs"] as SlotKey[]).map((slot) => {
              const isOpen = openSlot === slot;
              const text = getSlotValue(slot);
              return {
                slotId: slot,
                title: SLOT_TITLES[slot],
                description: dynamicHintForSlot(slot),
                isOpen,
                onToggle: () => toggleSlot(slot),
                charCountLabel: `${String(text || "").length} chars`,
                lastSavedLabel: `last saved ${lastSavedHumanTime}`,

                phaseMode: phase === "capture" ? "live" : "polish",
                onTogglePhaseMode: () => setPhase(prev => (prev === "capture" ? "polish" : "capture")),
                onCleanTone: () => { if (canEdit) normalizeSlot(slot); },
                onTighten: () => { if (canEdit) tightenSlot(slot); },
                onInsertTimestamp: () => {
                  if (canEdit) {
                    insertAtCursor(slot, timeStampStr());
                    transientFlash("Timestamp inserted ✓");
                  }
                },

                contextNode: (
                  <span style={{ opacity: phase === "polish" ? 0.7 : 1 }}>{renderContextBarForSlot(slot, text, phase)}</span>
                ),
                editorNode: (
                  <>
                    <textarea
                      ref={(el) => { textRefs.current[slot] = el; }}
                      className={`${styles.ta} ${styles.editorArea}`}
                      value={text}
                      onChange={(e) => canEdit && setSlotValue(slot, e.target.value)}
                      readOnly={!canEdit}
                      spellCheck={false}
                      aria-label={`${SLOT_TITLES[slot]} editor`}
                    />
                    {!!hasSelection && !!encounter && (
                      <RecentChanges
                        slot={slot}
                        encounter={encounter as Encounter & { snapshots?: Array<{ id: string; when: number; slots: NoteSlots }> }}
                        onDiff={(snapId) => { setSelectedSnapId(snapId); setDiffForSlot(slot); setDiffOpen(true); }}
                      />
                    )}
                  </>
                ),
                guidanceNode: (!text || !String(text).trim()) ? (
                  <>
                    This section is empty. Add content from Quick Actions or Templates (left rail), paste citations, or type freely.
                    {"\n"}
                    Documentation supports clinical communication and does not constitute treatment directives.
                  </>
                ) : undefined,
                containerClassName: styles.slotContainer,
                containerRef: (el) => { sectionRefs.current[slot] = el; },
              } satisfies NoteSectionSlot;
            });
            return <NoteSections slots={slotsArr} />;
          })()}
          {}

        {!!diffOpen && !!lastSnap && (diffTwoCol ? (
            <div>
              <div className={styles.diffHeader}>
                <div>
                  <strong>Diff:</strong> {diffForSlot.toUpperCase()} vs snapshot @ {new Date(lastSnap.when).toLocaleString()}
                </div>
                <div>
                  <select value={diffForSlot} onChange={e => setDiffForSlot(e.target.value as SlotKey)} style={{ marginRight: 8 }}>
                    {(["summary","plan","vitals","outcome","refs"] as SlotKey[]).map(k => (
                      <option key={k} value={k}>{k === "refs" ? "References" : (k.charAt(0).toUpperCase()+k.slice(1))}</option>
                    ))}
                  </select>
                  <button className={styles.iBtn} style={{marginRight:8}} onClick={() => setDiffTwoCol(false)} title="Single column"><I.Diff/> 1-col</button>
                  <button className={styles.toolBtn} onClick={() => setDiffOpen(false)}>Close</button>
                </div>
              </div>
              <div className={styles.diffTwoCol}>
                <div className={styles.diffPane}><pre>{
                  prevText.split(/\r?\n/).map((l)=> l).join("\n")
                }</pre></div>
                <div className={styles.diffPane}><pre>{
                  currText.split(/\r?\n/).map((l)=> l).join("\n")
                }</pre></div>
              </div>
            </div>
          ) : (
            <div className={styles.diffWrap} role="region" aria-label="Snapshot diff">
              <div className={styles.diffHeader}>
                <div>
                  <strong>Diff:</strong> {diffForSlot.toUpperCase()} vs snapshot @ {new Date(lastSnap.when).toLocaleString()}
                </div>
                <div>
                  <select value={diffForSlot} onChange={e => setDiffForSlot(e.target.value as SlotKey)} style={{ marginRight: 8 }}>
                    {(["summary","plan","vitals","outcome","refs"] as SlotKey[]).map(k => (
                      <option key={k} value={k}>{k === "refs" ? "References" : (k.charAt(0).toUpperCase()+k.slice(1))}</option>
                    ))}
                  </select>
                  <button className={styles.iBtn} style={{marginRight:8}} onClick={() => setDiffTwoCol(true)} title="Side-by-side"><I.Diff/> 2-col</button>
                  <button className={styles.toolBtn} onClick={() => setDiffOpen(false)}>Close</button>
                </div>
              </div>
              <div className={styles.diffBody} aria-live="polite">
                {segs.map((s, idx) => (
                  <div key={idx} className={`${styles.diffLine} ${s.kind==="add"?styles.diffAdd: s.kind==="del"?styles.diffDel:styles.diffSame}`}>
                    {s.kind === "add" ? "+ " : s.kind === "del" ? "− " : "  "}{s.text || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        <NoteFooterBar
          activeSlotLabel={`Active slot: ${active === "refs" ? "References (APA)" : active.charAt(0).toUpperCase() + active.slice(1)}`}
          charCountLabel={`Chars: ${charCount}`}
          updatedLabel={`Updated: ${updated}`}
          patientEncounterLabel={hasSelection ? `Patient: ${patient?.name ?? "—"} · Encounter: ${encounter?.id ?? "—"}` : null}
          snapshotInfoLabel={hasSelection ? `Snapshots: ${snapCount}` : `Local mode`}
          canEdit={canEdit}
          onCopySlot={copy}
          onClearSlot={clear}
          onSnapshot={takeSnapshot}
          onOpenDiff={() => { if (hasSelection && lastSnap) { setDiffForSlot(active); setDiffOpen(o=>!o); } }}
          canOpenDiff={Boolean(hasSelection && lastSnap)}
          exportOpen={expOpen}
          onToggleExport={() => setExpOpen(v => !v)}
          exportGaps={exportGaps}
          onExportCopyMarkdown={doCopyMarkdown}
          onExportCopyHTML={doCopyHTML}
          onExportDownloadHTML={doDownloadHTML}
          onExportPrint={doPrint}
          medicoLegalText={
            <>
              {NOTE_GLOBAL_FOOTER}
              {!!recentCarePlanInsert && active === "plan" && <>
                  {" "}
                  This section includes structured care-plan language for documentation support only; it is not a standalone treatment order.
                </>}
            </>
          }
          tipText={<>
            Tip: Use <code>Ctrl/⌘+A</code> then <code>Ctrl/⌘+C</code> to copy the entire slot.
          </>}
          flashMessage={footerMsg}
        />
          </div>

          {}
        </div>
        </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Note;








export function RecentChanges(props: {
  slot: SlotKey;
  encounter: Encounter & { snapshots?: Array<{ id: string; when: number; slots: NoteSlots }> };
  onDiff: (snapId: string) => void;
}) {
  const { slot, encounter, onDiff } = props;
  const snaps = Array.isArray(encounter.snapshots)
    ? (encounter.snapshots as Array<{ id: string; when: number; slots: NoteSlots }>)
    : [];
  const items: Array<{ id: string; when: number; text: string }> = snaps
    .slice(-3)
    .reverse()
    .map((s) => ({
      id: s.id,
      when: s.when,
      text: String((s.slots as Record<SlotKey, unknown>)[slot] ?? ""),
    }));
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <div className={styles.recentChanges}>
      <div role="button" tabIndex={0} aria-expanded={open} className={styles.slotHeaderRow}
        onClick={() => setOpen(v=>!v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v=>!v); } }}
      >
        <span className={styles.slotHeaderCaret}>{open ? "▾" : "▸"}</span>
        <span className={styles.slotHeaderTitle}>Recent changes</span>
      </div>
      {!!open && items.map((s) => (
        <div key={s.id} className={styles.recentChangeRow}>
          <div className={styles.recentChangeTime}>{new Date(s.when).toLocaleString()}</div>
          <div className={styles.recentChangePreview}>{summarize(s.text, 80)}</div>
          <div className={styles.recentChangeActions}>
            <button onClick={() => onDiff(s.id)}>Diff vs now</button>
          </div>
        </div>
      ))}
    </div>
  );
}


export function NoteRail() {
	const slots = useNoteStore();
	const active = useNoteStore(s => (s as any).activeSlot as SlotKey);
	const setActive = (k: SlotKey) => useNoteStore.getState().setActiveSlot(k);
	const canEdit = useAccessStore(s => s.canEdit());

  const { state } = useRegistry();
	const patient: Patient | undefined = state.selectedPatientId
		? state.patients.find(p => p.id === state.selectedPatientId)
		: undefined;
	const encounter: Encounter | undefined = patient && state.selectedEncounterId
		? (patient.encounters || []).find(e => e.id === state.selectedEncounterId)
		: undefined;

	const hasSelection = Boolean(patient && encounter);


  const [compact, setCompact] = React.useState<boolean>(() => {
    try { return localStorage.getItem(NOTE_COMPACT_KEY) === "1"; } catch { return false; }
  });
  React.useEffect(() => {
    try {
      if (compact) localStorage.setItem(NOTE_COMPACT_KEY, "1");
      else localStorage.removeItem(NOTE_COMPACT_KEY);
    } catch {}
  }, [compact]);


  const [openSlots, setOpenSlots] = React.useState(true);
  const [openTemplates, setOpenTemplates] = React.useState(true);
  const [openAssess, setOpenAssess] = React.useState(true);
  const [openCites, setOpenCites] = React.useState(true);
  const [openFlows, setOpenFlows] = React.useState(true);


  const railRootClass = compact ? `${styles.rail} ${styles.compact ?? "compact"}` : styles.rail;


  const completedFlows: FlowPreview[] = React.useMemo(
    () => collectCompletedFlows(state, patient, encounter),
    [state, patient, encounter]
  );

  function sendPatch(p: Partial<NoteSlots>) {
    window.dispatchEvent(new CustomEvent(NOTE_PATCH_EVENT, { detail: p }));
  }

  function applyPatchRail(p: Partial<NoteSlots>) {
    if (!canEdit) return;
    if (hasSelection) {

      sendPatch(p);
    } else {

      (Object.keys(p) as (keyof NoteSlots)[]).forEach(k => {
        const prev = String((slots as any)[k] ?? "");
        const add  = String((p as any)[k] ?? "");
        slots.setSlot(k, appendText(prev, add));
      });
    }
    if (Object.prototype.hasOwnProperty.call(p, "plan") && (p.plan ?? "") !== "") {
      window.dispatchEvent(new Event(NOTE_CAREPLAN_EVENT));
    }
  }

  function appendToActiveSlotRail(text: string) {
    if (!text || !canEdit) return;
    if (hasSelection) {

      sendPatch({ [active]: text } as Partial<NoteSlots>);
    } else {
      const prev = String((slots as any)[active] ?? "");
      slots.setSlot(active, appendText(prev, text));
    }
  }


  const [citeInput, setCiteInput] = React.useState<string>("");
  const [cites, setCites] = React.useState<string[]>([]);


  React.useEffect(() => {
    const onCite = (ev: Event) => {
      const e = ev as CustomEvent<string | string[]>;
      const d = e.detail;
      if (!d) return;
      setCites(prev => prev.concat(Array.isArray(d) ? d.filter(Boolean) as string[] : [String(d)].filter(Boolean)));
    };
    window.addEventListener(NOTE_CITE_EVENT, onCite as EventListener);
    return () => window.removeEventListener(NOTE_CITE_EVENT, onCite as EventListener);
  }, []);

  function insertCitationsToRefs() {
    if (!canEdit) return;
    const lines = [
      ...cites,
      ...citeInput.split("\n").map(s => s.trim()).filter(Boolean)
    ];
    if (!lines.length) return;
    const block = lines.map(s => `• ${s}`).join("\n");
    if (hasSelection) {
      sendPatch({ refs: block });
    } else {
      const prev = String((slots as any).refs ?? "");
      slots.setSlot("refs" as any, appendText(prev, block));
    }
    setCites([]); setCiteInput("");
  }

	type Kinds = "PHQ9" | "GAD7" | "BFCRS";
	const kinds: Kinds[] = ["PHQ9","GAD7","BFCRS"];
	const scoresMap = React.useMemo(() => {
		if (!patient) return {} as Record<string, { latest?: number; prev?: number; label: string }>;
		const out: Record<string, { latest?: number; prev?: number; label: string }> = {};
		kinds.forEach(k => {
			const { latest, previous } = selectLastTwoScores(patient, k as any) || ({} as any);
			const entry: { latest?: number; prev?: number; label: string } = { label: k.replace("9","-9").replace("7","-7") };
			if (latest !== undefined) entry.latest = latest;
			if (previous !== undefined) entry.prev = previous;
			out[k] = entry;
		});
		return out;
	}, [patient]);

	const refDateISO = React.useMemo(() => {
		const t = encounter?.when ? new Date(encounter.when) : new Date();
		return t.toISOString().slice(0,10);
	}, [encounter?.when]);

	return (
    <div className={`${railRootClass} ${styles.flat ?? ""}`}>
      {}
      <div className={styles.railCard} role="group" aria-label="Display">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Display</div>
          <button
            className={styles.railToggle}
            aria-expanded={compact}
            onClick={() => setCompact(v => !v)}
            title="Toggle compact density"
          >
            Compact
          </button>
        </div>
      </div>

      <div className={styles.railCard} role="group" aria-label="Slots">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Slots</div>
          <button
            className={styles.railToggle}
            aria-expanded={openSlots}
            onClick={() => setOpenSlots(v => !v)}
            title={openSlots ? "Collapse" : "Expand"}
          >
            Hide
          </button>
        </div>
        <div className={styles.railBody} hidden={!openSlots}>
          <div className={styles.railGroup} role="tablist" aria-label="Note slots">
          {(["summary","plan","vitals","outcome","refs"] as SlotKey[]).map(k => (
            <button
              key={k}
              role="tab"
              aria-selected={active === k}
              aria-current={active === k ? true : undefined}
              className={`${styles.pill} ${active === k ? styles.pillActive : ""}`}
        onClick={() => setActive(k)}
        title={k === "refs" ? "References" : k.charAt(0).toUpperCase()+k.slice(1)}
            >
              {SLOT_TITLES[k]}
            </button>
          ))}
          </div>
        </div>
			</div>

      <div className={styles.railCard} role="group" aria-label="Templates">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Templates</div>
          <button
            className={styles.railToggle}
            aria-expanded={openTemplates ? "true" : "false"}
            onClick={() => setOpenTemplates(v => !v)}
            title={openTemplates ? "Collapse" : "Expand"}
          >
            Hide
          </button>
        </div>
        <div className={styles.railBody} hidden={!openTemplates}>
          <div className={styles.railGroup}>
          <button className={styles.btn} disabled={!canEdit} onClick={() => applyPatchRail({ summary: TPL_SOAP_SUMMARY, plan: TPL_SOAP_PLAN })}>
						Insert SOAP scaffold
					</button>
          <button className={styles.btn} disabled={!canEdit} onClick={() => applyPatchRail({ summary: TPL_MSE_BLOCK })}>
						Insert MSE block
					</button>
          <button className={styles.btn} disabled={!canEdit} onClick={() => applyPatchRail({ plan: TPL_RISK_PLAN, refs: TPL_RISK_REF })}>
						Insert Risk &amp; Safety
					</button>
          </div>
        </div>
			</div>

      <div className={styles.railCard} role="group" aria-label="Assessments">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Assessments</div>
          <button
            className={styles.railToggle}
            aria-expanded={openAssess ? "true" : "false"}
            onClick={() => setOpenAssess(v => !v)}
            title={openAssess ? "Collapse" : "Expand"}
          >
            Hide
          </button>
        </div>
        <div className={styles.railBody} hidden={!openAssess}>
        <div className={styles.assessList}>
					{kinds.map(k => {
						const s = (scoresMap as any)[k] || {};
						const latest = s.latest as number | undefined;
						const prev   = s.prev   as number | undefined;
						const label  = s.label  as string;
						const delta  = formatDelta(latest, prev);
						const pillText = latest != null ? `${label} ${latest} ${delta}` : `${label} —`;
						return (
							<div key={k} className={styles.assessRow}>
								<span className={styles.pillLite} aria-label={`${label} score`}>{pillText}</span>
								<button
									className={styles.btnSm}
									disabled={latest == null || !canEdit}
									onClick={() => {
										const line = `${label} = ${latest} ${delta}.`;
										appendToActiveSlotRail(line);
										applyPatchRail({ refs: apaRefLine(label, refDateISO, patient?.name ? `patient ${patient.name}` : "encounter") });
									}}
								>
									Insert
								</button>
							</div>
						);
					})}
        </div>
        </div>
				<div className={styles.railHint}>Inserts go to the active slot (default Summary) and add an APA-style line to References.</div>
			</div>

      {}
      <div className={styles.railCard} role="group" aria-label="Citations">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Citations</div>
          <button
            className={styles.railToggle}
            aria-expanded={openCites ? "true" : "false"}
            onClick={() => setOpenCites(v => !v)}
            title={openCites ? "Collapse" : "Expand"}
          >
            Hide
          </button>
        </div>
        <div className={styles.railBody} hidden={!openCites}>
        <div className={styles.railGroupCol}>
          {cites.length > 0 && (
            <ul className={styles.citeList}>
              {cites.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
          <textarea
            className={styles.citeInput}
            value={citeInput}
            onChange={(e) => setCiteInput(e.target.value)}
            placeholder="Paste citation bullets or drop from Guide…"
            rows={3}
          />
          <div className={styles.citeActions}>
            <button
              className={styles.btnSm}
              disabled={!canEdit || (cites.length === 0 && citeInput.trim() === "")}
              onClick={insertCitationsToRefs}
            >
              Insert to References
            </button>
            <button className={styles.btnSm} onClick={() => { setCites([]); setCiteInput(""); }}>
              Clear
            </button>
          </div>
        </div>
        </div>
      </div>

      {}
      <div className={styles.railCard} role="group" aria-label="Flows">
        <div className={styles.railTitleRow}>
          <div className={styles.railTitle}>Flows</div>
          <button
            className={styles.railToggle}
            aria-expanded={openFlows ? "true" : "false"}
            onClick={() => setOpenFlows(v => !v)}
            title={openFlows ? "Collapse" : "Expand"}
          >
            Hide
          </button>
        </div>

        <div className={styles.railBody} hidden={!openFlows}>
        {!hasSelection ? (
          <div className={styles.railHint}>Select a patient/encounter to view completed flows.</div>
        ) : completedFlows.length === 0 ? (
          <div className={styles.railHint}>No completed flows yet.</div>
        ) : (
          <div className={styles.railGroupCol}>
            {completedFlows.map(f => (
              <div key={f.id} className={styles.flowRow}>
                <div className={styles.flowMeta}>
                  <div className={styles.flowTitle}>{f.name}</div>
                  <div className={styles.flowTime}>{formatWhen(f.completedAt)}</div>
                  <div className={styles.flowPreview}>{f.summary}</div>
                </div>
                <button
                  className={styles.btnSm}
                  disabled={!canEdit}
                  onClick={() => {
                    const line = `[${nowStamp()}] ${f.name}: ${f.summary}`;
                    if (hasSelection) {
                      sendPatch({ outcome: line });
                    } else {
                      const prev = String((slots as any).outcome ?? "");
                      slots.setSlot("outcome" as any, appendText(prev, line));
                    }
                  }}
                >
                  Insert outcome
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
		</div>
	);
}
