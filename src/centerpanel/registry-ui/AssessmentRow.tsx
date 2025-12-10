import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { getSeverityAnnotation } from "../rail/clinicalSeverity";
import styles from "./newPatient.module.css";

export default function AssessmentRow(props: {
  index: number;
  kind: string;
  score: string | number;
  when: string;
}) {
  const startEditAssessment = useNewPatientDraftStore(s => s.startEditAssessment);
  const removeAssessment = useNewPatientDraftStore(s => s.removeAssessment);

  const { display, severityLabel } = getSeverityAnnotation(String(props.kind), String(props.score));

  return (
    <div className={styles.assessmentRow}>
      <div className={styles.assessmentMain}>
        <div className={styles.assessmentInstrument}>{props.kind || "—"}</div>
        <div className={styles.assessmentScore}>
          {String(props.score) || "—"}
          {severityLabel ? (
            <span className={styles.assessmentSeverity}>{severityLabel}</span>
          ) : null}
        </div>
        <div className={styles.assessmentWhen}>{props.when || "—"}</div>
        <div className={styles.assessmentDisplay}>{display}</div>
      </div>
      <div className={styles.assessmentActions}>
        <button
          type="button"
          className={styles.assessmentActionBtn}
          onClick={() => startEditAssessment(props.index)}
        >
          Edit
        </button>
        <button
          type="button"
          className={styles.assessmentActionBtn}
          onClick={() => removeAssessment(props.index)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
