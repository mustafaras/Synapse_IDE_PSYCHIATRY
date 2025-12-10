import styles from "./newPatient.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import AssessmentRow from "./AssessmentRow";

export default function AssessmentsCard() {
  const assessmentDraft = useNewPatientDraftStore(s => s.assessmentDraft);
  const setAssessmentDraftField = useNewPatientDraftStore(s => s.setAssessmentDraftField);
  const commitAssessmentDraft = useNewPatientDraftStore(s => s.commitAssessmentDraft);
  const assessments = useNewPatientDraftStore(s => s.asses);
  const count = assessments.length;

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          Baseline assessments {count > 0 ? <span className={styles.countBadge}>{count}</span> : null}
        </div>
        <div className={styles.cardSub}>Capture baseline severity to anchor change over time.</div>
      </header>
      <div className={styles.cardBody}>
        {}
        <div className={styles.rowGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="ass-kind">Instrument</label>
            <select
              id="ass-kind"
              className={styles.fieldSelect}
              value={assessmentDraft.kind || ""}
              onChange={(e) => setAssessmentDraftField("kind", (e.target as HTMLSelectElement).value)}
            >
              <option value="">Select…</option>
              <option value="PHQ-9">PHQ-9</option>
              <option value="GAD-7">GAD-7</option>
              <option value="BFCRS">BFCRS</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="ass-score">Score</label>
            <input
              id="ass-score"
              className={styles.fieldInput}
              value={assessmentDraft.score || ""}
              onChange={(e) => setAssessmentDraftField("score", (e.target as HTMLInputElement).value)}
              placeholder="17"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="ass-when">When</label>
            <input
              id="ass-when"
              className={styles.fieldInput}
              type="datetime-local"
              value={assessmentDraft.when || ""}
              onChange={(e) => setAssessmentDraftField("when", (e.target as HTMLInputElement).value)}
              placeholder="2025-10-29 14:30"
            />
          </div>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel} aria-hidden="true">&nbsp;</div>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={commitAssessmentDraft}
            >
              {assessmentDraft.editIndex === null ? "Add" : "Save"}
            </button>
          </div>
        </div>

        {}
        <div className={styles.assessmentListWrapper}>
          {assessments.length === 0 ? (
            <div className={styles.assessmentEmpty}>No baseline assessments added</div>
          ) : (
            assessments.map((a, idx) => (
              <AssessmentRow
                key={a.id || idx}
                index={idx}
                kind={String(a.kind)}
                score={a.score}
                when={(() => { try { const d = new Date(a.when); return Number.isFinite(d.getTime()) ? d.toLocaleString() : ""; } catch { return ""; } })()}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
