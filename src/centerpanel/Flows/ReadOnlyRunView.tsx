import React, { useMemo } from "react";
import styles from "../styles/flows.module.css";

export interface ReadOnlyRunViewProps {
  run: {
    runId?: string;
    label?: string;
    insertedAt: number;
    paragraphFull?: string;
    paragraph?: string;
  };
  onBackToFlows?: () => void;
}

function pad2(n: number) { return String(n).padStart(2, "0"); }
function tsLocal(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())} (local)`;
}

const ReadOnlyRunView: React.FC<ReadOnlyRunViewProps> = ({ run, onBackToFlows }) => {
  const timestamp = useMemo(() => tsLocal(run.insertedAt), [run.insertedAt]);
  const text = run.paragraphFull ?? run.paragraph ?? "";

  return (
    <div className={styles.readOnlyRunWrapper}>
      <div className={styles.readOnlyRunHeaderCard}>
        <div className={styles.readOnlyRunTitleRow}>
          <div>{run.label ?? "Completed Summary"}</div>
          <div className={styles.readOnlyRunTimestamp}>Recorded {timestamp}</div>
        </div>
        <div className={styles.readOnlyRunDisclaimer}>
          This summary reflects clinician documentation during this encounter. It is not a treatment directive.
        </div>
        {onBackToFlows ? (
          <div>
            <button className={styles.btnGhost} onClick={onBackToFlows}>
              Back to Flows
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.readOnlyRunBodyCard}>
        {text}
      </div>
    </div>
  );
};

export default ReadOnlyRunView;
