

import React, { useMemo, useState } from "react";
import { useRegistry, selectLastTwoScores } from "../state";
import styles from "../../styles/registry.module.css";

function mkId() { return `asmt_${Math.random().toString(36).slice(2,10)}`; }

export default function BFCRSDeltaForm({ patientId }: { patientId: string }) {
  const { state, actions } = useRegistry();
  const patient = state.patients.find(p => p.id === patientId);
  const [total, setTotal] = useState<number>(0);
  const [showTip, setShowTip] = useState(false);

  const sev = useMemo(() => bfcrsLabel(total), [total]);

  const deltas = patient ? selectLastTwoScores(patient, "BFCRS") : { latest: undefined, previous: undefined, delta: undefined };

  if (!patient) return null;

  return (
    <div style={{display:"flex", flexDirection:"column", gap:10}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <div style={{display:"flex", alignItems:"center", gap:8, position:"relative"}}>
          <div style={{fontWeight:800, letterSpacing:0.2}}>BFCRS (total)</div>
          <button
            type="button"
            aria-label="BFCRS guidance"
            onClick={() => setShowTip(v => !v)}
            onBlur={() => setShowTip(false)}
            style={iconBtn}
            title="Scoring guidance"
          >i</button>
          {showTip && (
            <div role="dialog" aria-label="BFCRS guidance" style={tooltip}>
              Track total 0–69; interpret with clinical exam and item-level findings. Consider lorazepam challenge where appropriate.
              Ref: Acta Psychiatr Scand. 1996;93(2):129–136. <a href={getGuidelineUrl("BFCRS")} target="_blank" rel="noreferrer">Guideline</a>
            </div>
          )}
        </div>
        <div style={{opacity:0.85, fontSize:12}}>
          Latest: {dOrDash(deltas.latest)} • Prev: {dOrDash(deltas.previous)} • Δ: {deltaFmt(deltas.delta)}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 160px", gap:8}}>
        <div style={{alignSelf:"center"}}>Total score (0–69)</div>
        <input
          type="number"
          min={0}
          max={69}
          value={total}
          onChange={(e) => setTotal(Math.max(0, Math.min(69, Number(e.target.value) || 0)))}
          style={input}
          aria-label="BFCRS total"
        />
      </div>

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div>Total: <b>{total}</b></div>
          <span style={{...chip, ...sev.style}} aria-label={`Severity: ${sev.label}`}>{sev.label}</span>
        </div>
        <button
          className={styles.pill}
          onClick={() => {
            actions.recordAssessment(patient.id, { id: mkId(), kind: "BFCRS", when: Date.now(), score: total });
          }}
          aria-label="Record BFCRS total"
        >
          Record
        </button>
      </div>

      {}
      <div style={{opacity:0.85, fontSize:12, marginTop:6}}>
        Guidance: Bush–Francis Catatonia Rating Scale total (0–69); higher scores reflect greater
        catatonia severity. Track Δ over time to gauge response (context-dependent; reductions of
        ~3–5 points may be clinically meaningful alongside exam). Use in conjunction with item-level
        observations and benzodiazepine challenge when appropriate. Ref: Bush G, Fink M, Petrides G,
        Dowling F, Francis A. Catatonia I: Rating scale and standardized examination. Acta Psychiatr Scand.
        1996;93(2):129–136. <a href={getGuidelineUrl("BFCRS")} target="_blank" rel="noreferrer">Guideline</a>
      </div>

      {total >= 5 && (
        <div style={nextSteps} aria-live="polite">
          <div style={{fontWeight:700}}>Next steps (contextual)</div>
          <ul style={ulMuted}>
            <li>Corroborate with item-level signs (e.g., immobility, mutism, posturing).</li>
            <li>Consider lorazepam challenge and medical workup to exclude underlying causes.</li>
            <li>Monitor vitals/hydration/nutrition; evaluate for malignant catatonia features.</li>
            <li>Escalate care and consult per institutional pathway.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

const input: React.CSSProperties = {
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

function bfcrsLabel(n: number): { label: string; style: React.CSSProperties } {

  if (n === 0) return { label: "None", style: { background: "rgba(43,182,115,0.12)", borderColor: "rgba(43,182,115,0.45)" } };
  if (n <= 9) return { label: "Mild (contextual)", style: { background: "rgba(56,182,255,0.10)", borderColor: "rgba(56,182,255,0.35)" } };
  if (n <= 19) return { label: "Moderate (contextual)", style: { background: "rgba(255,176,46,0.12)", borderColor: "rgba(255,176,46,0.45)" } };
  return { label: "Elevated (contextual)", style: { background: "rgba(255,73,97,0.12)", borderColor: "rgba(255,73,97,0.45)" } };
}
