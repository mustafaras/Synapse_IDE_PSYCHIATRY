

import React, { useEffect, useMemo, useState } from "react";
import { useRegistry, selectLastTwoScores } from "../state";
import styles from "../../styles/registry.module.css";

type Choice = 0 | 1 | 2 | 3;

const ITEMS = [
  "Nervous/anxious",
  "Can’t stop worrying",
  "Worrying too much",
  "Trouble relaxing",
  "Restless",
  "Irritable",
  "Afraid something awful",
];

function mkId() { return `asmt_${Math.random().toString(36).slice(2,10)}`; }

export default function GAD7Form({ patientId }: { patientId: string }) {
  const { state, actions } = useRegistry();
  const patient = state.patients.find(p => p.id === patientId);
  const [vals, setVals] = useState<Choice[]>(() => Array(7).fill(0) as Choice[]);
  const [showTip, setShowTip] = useState(false);

  const total = useMemo(() => vals.reduce<number>((a,b) => a + b, 0), [vals]);
  const sev = useMemo(() => gad7Severity(total), [total]);
  const deltas = patient ? selectLastTwoScores(patient, "GAD7") : { latest: undefined, previous: undefined, delta: undefined };

  useEffect(() => setVals(Array(7).fill(0) as Choice[]), [patientId]);

  if (!patient) return null;

  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, position:"relative"}}>
          <div style={{fontWeight:800, letterSpacing:0.2}}>GAD-7</div>
          <button
            type="button"
            aria-label="GAD-7 guidance"
            onClick={() => setShowTip(v => !v)}
            onBlur={() => setShowTip(false)}
            style={iconBtn}
            title="Scoring guidance"
          >i</button>
          {showTip && (
            <div role="dialog" aria-label="GAD-7 guidance" style={tooltip}>
              0–21 total; severity cutoffs: 5 (mild), 10 (moderate), 15 (severe). Recall: 2 weeks.
              Ref: Arch Intern Med. 2006;166(10):1092–1097. <a href={getGuidelineUrl("GAD7")} target="_blank" rel="noreferrer">Guideline</a>
            </div>
          )}
        </div>
        <div style={{opacity:0.85, fontSize:12}}>
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

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div>Total: <b>{total}</b></div>
          <span style={{...chip, ...sev.style}} aria-label={`Severity: ${sev.label}`}>{sev.label}</span>
        </div>
        <button
          className={styles.pill}
          onClick={() => {
            actions.recordAssessment(patient.id, { id: mkId(), kind: "GAD7", when: Date.now(), score: total });
          }}
          aria-label="Record GAD-7 total"
        >
          Record
        </button>
      </div>

      {}
      <div style={{opacity:0.85, fontSize:12, marginTop:6}}>
        Guidance: GAD-7 sums 7 items (0–21). Severity cutoffs: 5 (mild), 10 (moderate), 15 (severe). A score ≥10 has good sensitivity/specificity for GAD in primary care. Recall: past 2 weeks. Ref: Spitzer RL, Kroenke K, Williams JB, Löwe B. Arch Intern Med. 2006;166(10):1092–1097. <a href={getGuidelineUrl("GAD7")} target="_blank" rel="noreferrer">Guideline</a>
      </div>

      {total >= 10 && (
        <div style={nextSteps} aria-live="polite">
          <div style={{fontWeight:700}}>Next steps (GAD-7 ≥10)</div>
          <ul style={ulMuted}>
            <li>Assess functional impairment and rule out medical contributors.</li>
            <li>Discuss evidence-based therapies (CBT, SSRIs/SNRIs); consider shared decision-making.</li>
            <li>Screen for comorbid depression/substance use; review current medications.</li>
            <li>Set follow-up for response monitoring; consider psychoeducation/resources.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

const select: React.CSSProperties = {
  height:28, borderRadius:8, border:"1px solid rgba(255,255,255,0.12)",
  background:"rgba(0,0,0,0.25)", color:"#EAF2FF", padding:"0 8px"
};
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

function gad7Severity(n: number): { label: string; style: React.CSSProperties } {
  if (n <= 4) return { label: "Minimal", style: { background: "rgba(43,182,115,0.12)", borderColor: "rgba(43,182,115,0.45)" } };
  if (n <= 9) return { label: "Mild", style: { background: "rgba(56,182,255,0.10)", borderColor: "rgba(56,182,255,0.35)" } };
  if (n <= 14) return { label: "Moderate", style: { background: "rgba(255,176,46,0.12)", borderColor: "rgba(255,176,46,0.45)" } };
  return { label: "Severe", style: { background: "rgba(255,73,97,0.12)", borderColor: "rgba(255,73,97,0.45)" } };
}
