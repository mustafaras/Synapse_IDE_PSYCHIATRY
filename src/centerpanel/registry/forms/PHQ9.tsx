

import React, { useEffect, useMemo, useState } from "react";
import { useRegistry, selectLastTwoScores } from "../state";
import styles from "../../styles/registry.module.css";

type Choice = 0 | 1 | 2 | 3;


const ITEMS = [
  "Interest/pleasure",
  "Feeling down",
  "Sleep problems",
  "Energy",
  "Appetite",
  "Self-worth",
  "Concentration",
  "Psychomotor",
  "Suicidality",
];

function mkId() { return `asmt_${Math.random().toString(36).slice(2,10)}`; }

export default function PHQ9Form({ patientId }: { patientId: string }) {
  const { state, actions } = useRegistry();
  const patient = state.patients.find(p => p.id === patientId);
  const [vals, setVals] = useState<Choice[]>(() => Array(9).fill(0) as Choice[]);
  const [showTip, setShowTip] = useState(false);


  const total = useMemo(() => vals.reduce<number>((a,b) => a + b, 0), [vals]);
  const sev = useMemo(() => phq9Severity(total), [total]);


  const deltas = patient ? selectLastTwoScores(patient, "PHQ9") : { latest: undefined, previous: undefined, delta: undefined };

  useEffect(() => {

    setVals(Array(9).fill(0) as Choice[]);
  }, [patientId]);

  if (!patient) return null;

  return (
    <div style={cardInner}>
      <div style={rowHeader}>
        <div style={{display:"flex", alignItems:"center", gap:8, position:"relative"}}>
          <div style={title}>PHQ-9</div>
          <button
            type="button"
            aria-label="PHQ-9 guidance"
            onClick={() => setShowTip(v => !v)}
            onBlur={() => setShowTip(false)}
            style={iconBtn}
            title="Scoring guidance"
          >i</button>
          {showTip && (
            <div role="dialog" aria-label="PHQ-9 guidance" style={tooltip}>
              0–27 total; severity: 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe. Recall: 2 weeks.
              Ref: J Gen Intern Med. 2001;16(9):606–613. <a href={getGuidelineUrl("PHQ9")} target="_blank" rel="noreferrer">Guideline</a>
            </div>
          )}
        </div>
        <div style={muted}>
          Latest: {dOrDash(deltas.latest)} • Prev: {dOrDash(deltas.previous)} • Δ: {deltaFmt(deltas.delta)}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 160px", gap:8}}>
        {ITEMS.map((label, idx) => (
          <div key={idx} style={{display:"contents"}}>
            <div style={{alignSelf:"center"}}>{idx+1}. {label}</div>
            <select
              aria-label={`${label} score`}
              value={vals[idx]}
              onChange={(e) => {
                const next = [...vals] as Choice[];
                next[idx] = Number(e.target.value) as Choice;
                setVals(next);
              }}
              style={select}
            >
              <option value={0}>0 — Not at all</option>
              <option value={1}>1 — Several days</option>
              <option value={2}>2 — &gt;½ the days</option>
              <option value={3}>3 — Nearly every day</option>
            </select>
          </div>
        ))}
      </div>

      <div style={rowFooter}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div>Total: <b>{total}</b></div>
          <span style={{...chip, ...sev.style}} aria-label={`Severity: ${sev.label}`}>{sev.label}</span>
        </div>
        <button
          className={styles.pill}
          onClick={() => {
            actions.recordAssessment(patient.id, { id: mkId(), kind: "PHQ9", when: Date.now(), score: total });
          }}
          aria-label="Record PHQ-9 total"
        >
          Record
        </button>
      </div>

      {}
      <div style={{...muted, marginTop: 6}}>
        Guidance: PHQ-9 sums 9 items (0–27). Severity: 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe. Screening window: past 2 weeks. A cut point of ≥10 often indicates clinically significant depression requiring further evaluation. Ref: Kroenke K, Spitzer RL, Williams JB. J Gen Intern Med. 2001;16(9):606–613. <a href={getGuidelineUrl("PHQ9")} target="_blank" rel="noreferrer">Guideline</a>
      </div>

      {total >= 10 && (
        <div style={nextSteps} aria-live="polite">
          <div style={{fontWeight:700}}>Next steps (PHQ-9 ≥10)</div>
          <ul style={ulMuted}>
            <li>Confirm diagnosis; assess safety (SI/HI); consider PHQ-9 item 9 response.</li>
            <li>Discuss treatment options: psychotherapy, pharmacotherapy, or combined.</li>
            <li>Check comorbidities (substance, anxiety, medical causes); review meds.</li>
            <li>Plan follow-up and monitoring; consider collaborative care model.</li>
          </ul>
        </div>
      )}
    </div>
  );
}


const cardInner: React.CSSProperties = { display:"flex", flexDirection:"column", gap:10 };
const rowHeader: React.CSSProperties = { display:"flex", justifyContent:"space-between", alignItems:"baseline" };
const rowFooter: React.CSSProperties = { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 };
const title: React.CSSProperties = { fontWeight:800, letterSpacing:0.2 };
const select: React.CSSProperties = {
  height:28, borderRadius:8, border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(0,0,0,0.25)", color:"#EAF2FF", padding:"0 8px"
};
const muted: React.CSSProperties = { opacity:0.85, fontSize:12 };
function dOrDash(v?: number) { return v===undefined ? "—" : String(v); }
function deltaFmt(v?: number) { return v===undefined ? "—" : `${v>0?"+":""}${v}`; }


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
const chip: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)", fontSize: 11, letterSpacing: 0.2
};
const nextSteps: React.CSSProperties = {
  marginTop: 8, padding: 10, borderRadius: 8,
  border: "1px dashed rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.04)"
};
const ulMuted: React.CSSProperties = { margin: "6px 0 0 18px" };

function getGuidelineUrl(key: "PHQ9" | "GAD7" | "BFCRS") {
  const w: any = (typeof window !== "undefined" ? window : {});
  return w.__ORG_GUIDELINES?.[key] ?? {
    PHQ9: "https://www.phqscreeners.com/select-screener",
    GAD7: "https://www.integrationacademy.ahrq.gov/products/gad-7-scale",
    BFCRS: "https://www.urmc.rochester.edu/MediaLibraries/URMCMedia/psychiatry/documents/BFCRS-Guidelines.pdf"
  }[key];
}

function phq9Severity(n: number): { label: string; style: React.CSSProperties } {
  if (n <= 4) return { label: "Minimal", style: { background: "rgba(43,182,115,0.12)", borderColor: "rgba(43,182,115,0.45)" } };
  if (n <= 9) return { label: "Mild", style: { background: "rgba(56,182,255,0.10)", borderColor: "rgba(56,182,255,0.35)" } };
  if (n <= 14) return { label: "Moderate", style: { background: "rgba(255,176,46,0.12)", borderColor: "rgba(255,176,46,0.45)" } };
  if (n <= 19) return { label: "Mod. Severe", style: { background: "rgba(255,73,97,0.12)", borderColor: "rgba(255,73,97,0.45)" } };
  return { label: "Severe", style: { background: "rgba(224,36,36,0.12)", borderColor: "rgba(224,36,36,0.45)" } };
}
