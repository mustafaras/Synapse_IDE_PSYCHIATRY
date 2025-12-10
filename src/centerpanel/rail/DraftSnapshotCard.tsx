

import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { getRiskGradeDisplay } from "./riskGrades";
import { summarizeAssessments } from "./clinicalSeverity";
import styles from "./rail.module.css";


function fmtDueStr(due?: string): string {
  const v = (due || '').trim();
  return v || 'no due';
}

export default function DraftSnapshotCard() {

  const name = useNewPatientDraftStore((s) => s.name);
  const mrn = useNewPatientDraftStore((s) => s.id);
  const risk = useNewPatientDraftStore((s) => s.risk);
  const suicideRisk = useNewPatientDraftStore((s) => s.suicideRisk);
  const violenceRisk = useNewPatientDraftStore((s) => s.violenceRisk);
  const capacity = useNewPatientDraftStore((s) => s.capacity);
  const encounter = useNewPatientDraftStore((s) => s.encounter);
  const asses = useNewPatientDraftStore((s) => s.asses);
  const tasks = useNewPatientDraftStore((s) => s.tasks);


  const nameDisplay = (name || "").trim() || "—";
  const mrnDisplay = (mrn || "").trim() || "—";


  const { label: riskLabel, colorClass } = getRiskGradeDisplay(risk);

  const accentMap: Record<string, keyof typeof styles> = {
    riskLow: "accentLow",
    riskMod: "accentMod",
    riskHigh: "accentHigh",
    riskCritical: "accentCritical",
  } as const;
  const accentClass = accentMap[colorClass as keyof typeof accentMap] || ("" as any);
  function summarizeSafety(inp: { suicideRisk?: string; violenceRisk?: string; capacity?: string; }): string {
    const suicideMap: Record<string, string> = {
      "": "SI: —",
      none: "SI: None",
      passive: "SI: Passive",
      "active-noplan": "SI: Active (no plan)",
      "active-plan": "SI: Active (plan)",
      imminent: "SI: Imminent",
    };
    const violenceMap: Record<string, string> = {
      "": "Violence: —",
      calm: "Violence: Calm",
      "verbal-agitation": "Violence: Verbal agit.",
      threats: "Violence: Threats",
      "attempted-assault": "Violence: Attempted",
      "weapon-access": "Violence: Weapon access",
    };
    const capacityMap: Record<string, string> = {
      "": "Capacity: —",
      adequate: "Capacity: Adequate",
      questionable: "Capacity: Questionable",
      lacks: "Capacity: Lacks",
    };
    const s = suicideMap[inp.suicideRisk || ""] || "SI: —";
    const v = violenceMap[inp.violenceRisk || ""] || "Violence: —";
    const c = capacityMap[inp.capacity || ""] || "Capacity: —";
    return `${s} • ${v} • ${c}`;
  }
  const safetySummary = summarizeSafety({ suicideRisk, violenceRisk, capacity });


  const encWhen = encounter?.when || "";
  const encLocation = encounter?.location || "";
  const encStatus = (encounter?.legalStatus || "").trim();
  const whenDisplay = (encWhen || "").trim() || "—";
  const locDisplay = (encLocation || "").trim() || "—";
  const encStatusLabelMap: Record<string,string> = {
    voluntary: "Voluntary",
    involuntary: "Involuntary",
    na: "N/A",
    "": "—",
  };
  const encStatusDisp = encStatusLabelMap[encStatus] || "—";


  const assessmentLines = summarizeAssessments(
    (asses || []).map((a) => ({ kind: String(a.kind), score: a.score, when: a.when }))
  );


  const sortedTasks = [...(tasks as Array<{ text: string; category: string; due: string }> || [])].sort((a, b) => {
    const ad = (a.due || '').trim();
    const bd = (b.due || '').trim();
    if (ad === '' && bd !== '') return 1;
    if (ad !== '' && bd === '') return -1;
    return ad.localeCompare(bd);
  });
  const topTasks = sortedTasks.slice(0, 3);

  return (
    <div className={styles.snapshotCard}>
      {}
      <p id="riskChipTip" className={styles.srOnly}>
        Encodes clinician-estimated current risk; documentation supports communication and is not a directive.
      </p>
      {}
      <div className={styles.snapshotHeader}>
        <div className={styles.snapshotName}>{nameDisplay}</div>
        <div className={styles.snapshotMrn}>MRN: {mrnDisplay}</div>
      </div>

      {}
      <div className={styles.snapshotSection}>
        <div className={styles.snapshotSectionLabel}>Risk</div>
        <div className={`${styles.snapshotRiskRow} ${accentClass ? (styles as any)[accentClass] : ""}`}>
          <span className={styles.microLabel}>RISK</span>
          <span className={`${styles.pill} ${styles[colorClass] || ""}`} aria-describedby="riskChipTip">{riskLabel}</span>
        </div>
        <div className={styles.snapshotSafetyNote}>{safetySummary}</div>
      </div>

      {}
      <div className={styles.snapshotSection}>
        <div className={styles.snapshotSectionLabel}>Encounter</div>
        <div className={styles.snapshotListItem}>
          <div className={styles.snapshotListMain}>{whenDisplay}</div>
          <div className={styles.snapshotListMeta}>
            {locDisplay} {`· ${encStatusDisp}`}
          </div>
        </div>
      </div>

      {}
      <div className={styles.snapshotSection}>
        <div className={styles.snapshotSectionLabel}>Baseline</div>
        {assessmentLines.length === 0 ? (
          <div className={styles.snapshotEmpty}>No assessments yet</div>
        ) : (
          assessmentLines.map((line, idx) => (
            <div key={idx} className={styles.snapshotListItem}>
              <div className={styles.snapshotListMain}>{line}</div>
            </div>
          ))
        )}
      </div>

      {}
      <div className={styles.snapshotSection}>
        <div className={styles.snapshotSectionLabel}>Tasks</div>
        {topTasks.length === 0 ? (
          <div className={styles.snapshotEmpty}>No tasks added</div>
        ) : (
          topTasks.map((t, idx) => {
            const catShort = t.category === 'safety'
              ? '[Safety]'
              : t.category === 'legal'
              ? '[Legal]'
              : t.category === 'monitoring'
              ? '[Mon]'
              : t.category === 'followup'
              ? '[FU]'
              : '[Task]';
            return (
              <div key={idx} className={styles.snapshotListItem}>
                <div className={styles.snapshotListMain}>
                  {catShort} {t.text || 'Task'}
                </div>
                <div className={styles.snapshotListMeta}>{fmtDueStr(t.due)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
