

import React, { useEffect, useMemo, useState } from "react";
import { selectLastTwoScores, useRegistry } from "../state";
import styles from "../../styles/registry.module.css";
import { BFCRS_ITEMS, useCalcStore } from "../../../stores/useCalcStore";

type Choice = 0 | 1 | 2 | 3;

function mkId() { return `asmt_${Math.random().toString(36).slice(2,10)}`; }

export default function BFCRSForm({ patientId }: { patientId: string }) {
  const { state, actions } = useRegistry();
  const patient = state.patients.find(p => p.id === patientId);


  const scores = useCalcStore(s => s.scores);
  const total = useCalcStore(s => s.total);
  const setScore = useCalcStore(s => s.setScore);
  const reset = useCalcStore(s => s.reset);

  const [showTip, setShowTip] = useState(false);
  const sev = useMemo(() => bfcrsSeverity(total), [total]);
  const deltas = patient ? selectLastTwoScores(patient, "BFCRS") : { latest: undefined, previous: undefined, delta: undefined };


  useEffect(() => { reset(); }, [patientId, reset]);

  if (!patient) return null;

  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, position:"relative"}}>
          <div style={{fontWeight:800, letterSpacing:0.2}}>BFCRS — Bush–Francis Catatonia Rating Scale (14-item)</div>
          <button
            type="button"
            aria-label="BFCRS guidance"
            onClick={() => setShowTip(v => !v)}
            onBlur={() => setShowTip(false)}
            style={iconBtn}
            title="Scoring guidance"
          >i</button>
          {showTip ? (
            <div role="dialog" aria-label="BFCRS guidance" style={tooltip}>
              14 core items scored 0–3 (absent to severe). Sum reflects severity; interpret with clinical exam and item findings.
              Consider lorazepam challenge where appropriate. Ref: Acta Psychiatr Scand. 1996;93(2):129–136. <a href={getGuidelineUrl("BFCRS")} target="_blank" rel="noreferrer">Guideline</a>
            </div>
          ) : null}
        </div>
        <div style={{opacity:0.85, fontSize:12}}>
          Latest: {dOrDash(deltas.latest)} • Prev: {dOrDash(deltas.previous)} • Δ: {deltaFmt(deltas.delta)}
        </div>
      </div>

      {}
      <div style={{display:"grid", gridTemplateColumns:"1fr 160px", gap:8}}>
        {BFCRS_ITEMS.map((it, idx) => (
          <div key={it.id} style={{display:"contents"}}>
            <div style={{alignSelf:"center"}}>{idx+1}. {it.label}</div>
            <select
              aria-label={`${it.label} score`}
              value={(scores[it.id] ?? 0) as Choice}
              onChange={(e) => setScore(it.id, Number(e.target.value) as Choice)}
              style={select}
            >
              <option value={0}>0 — Absent</option>
              <option value={1}>1 — Mild</option>
              <option value={2}>2 — Moderate</option>
              <option value={3}>3 — Severe/prominent</option>
            </select>
          </div>
        ))}
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div>Total: <b>{total}</b></div>
          <span style={{...chip, ...sev.style}} aria-label={`Severity: ${sev.label}`}>{sev.label}</span>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button
            className={styles.pill}
            onClick={() => reset()}
            aria-label="Reset BFCRS items"
          >Reset</button>
          <button
            className={styles.pill}
            onClick={() => {
              actions.recordAssessment(patient.id, { id: mkId(), kind: "BFCRS", when: Date.now(), score: total });
            }}
            aria-label="Record BFCRS total"
          >Record</button>
        </div>
      </div>

      {}
      <div style={{opacity:0.85, fontSize:12, marginTop:6}}>
        Guidance: The Bush–Francis Catatonia Rating Scale (BFCRS) 14-item severity sum (0–42 here for the core set) estimates catatonia severity.
        Use with item-level observations and standardized exam; interpret in clinical context. Ref: Bush G, Fink M, Petrides G, Dowling F, Francis A. Acta Psychiatr Scand. 1996;93(2):129–136.
        <a href={getGuidelineUrl("BFCRS")} target="_blank" rel="noreferrer"> Guideline</a>
      </div>
    </div>
  );
}

const select: React.CSSProperties = {
  height:28, borderRadius:8, border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(0,0,0,0.25)", color:"#EAF2FF", padding:"0 8px"
};
const chip: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)", fontSize: 11, letterSpacing: 0.2
};


const iconBtn: React.CSSProperties = {
  height: 20, width: 20, borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.06)",
  color: "#EAF2FF", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", fontSize: 12, lineHeight: 1
};
const tooltip: React.CSSProperties = {
  position: "absolute", top: 26, left: 0, zIndex: 5,
  maxWidth: 420, padding: 10, borderRadius: 8,
  background: "rgba(0,0,0,0.85)", color: "#EAF2FF",
  border: "1px solid rgba(255,255,255,0.16)", fontSize: 12
};

function dOrDash(v?: number) { return v===undefined ? "—" : String(v); }
function deltaFmt(v?: number) { return v===undefined ? "—" : `${v>0?"+":""}${v}`; }

function getGuidelineUrl(key: "PHQ9" | "GAD7" | "BFCRS") {
  const w = (typeof window !== "undefined"
    ? (window as unknown as { __ORG_GUIDELINES?: Record<"PHQ9" | "GAD7" | "BFCRS", string> })
    : { __ORG_GUIDELINES: undefined });
  return w.__ORG_GUIDELINES?.[key] ?? {
    PHQ9: "https://www.phqscreeners.com/select-screener",
    GAD7: "https://www.integrationacademy.ahrq.gov/products/gad-7-scale",
    BFCRS: "https://www.urmc.rochester.edu/MediaLibraries/URMCMedia/psychiatry/documents/BFCRS-Guidelines.pdf"
  }[key];
}

function bfcrsSeverity(n: number): { label: string; style: React.CSSProperties } {

  if (n === 0) return { label: "None", style: { background: "rgba(43,182,115,0.12)", borderColor: "rgba(43,182,115,0.45)" } };
  if (n <= 9) return { label: "Mild (contextual)", style: { background: "rgba(56,182,255,0.10)", borderColor: "rgba(56,182,255,0.35)" } };
  if (n <= 19) return { label: "Moderate (contextual)", style: { background: "rgba(255,176,46,0.12)", borderColor: "rgba(255,176,46,0.45)" } };
  return { label: "Elevated (contextual)", style: { background: "rgba(255,73,97,0.12)", borderColor: "rgba(255,73,97,0.45)" } };
}
