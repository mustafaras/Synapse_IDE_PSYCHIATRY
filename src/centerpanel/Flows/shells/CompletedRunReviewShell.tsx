import React, { useMemo } from "react";
import styles from "../../styles/flows.module.css";
import { useRegistry } from "../../registry/state";

export type ReviewTarget = { encounterId: string; runIndex: number } | null;

function pad2(n: number) { return String(n).padStart(2, "0"); }

const CompletedRunReviewShell: React.FC<{ reviewTarget: ReviewTarget }> = ({ reviewTarget }) => {
  const { state } = useRegistry();

  const { run, timestampStr } = useMemo(() => {
    if (!reviewTarget) return { run: null as any, timestampStr: "" };
    const patient = state.selectedPatientId
      ? state.patients.find((p) => p.id === state.selectedPatientId)
      : state.patients[0];
    if (!patient) return { run: null as any, timestampStr: "" };

    const enc = patient.encounters?.find((e: any) => e.id === reviewTarget.encounterId) as any;
    if (!enc || !enc.completedRuns) return { run: null as any, timestampStr: "" };

    const r = enc.completedRuns[reviewTarget.runIndex];
    if (!r) return { run: null as any, timestampStr: "" };

    const d = new Date(r.insertedAt);
    const HH = pad2(d.getHours());
    const MM = pad2(d.getMinutes());
    const YYYY = d.getFullYear();
    const MMmo = pad2(d.getMonth() + 1);
    const DD = pad2(d.getDate());
    const ts = `${YYYY}-${MMmo}-${DD} ${HH}:${MM} (local)`;

    return { run: r, timestampStr: ts };
  }, [reviewTarget, state]);

  if (!run) {
    return (
      <section className={styles.panel}>
        <header className={styles.flowHeader}>
          <div className={styles.flowTitle}>Completed Summary</div>
          <div className={styles.flowSubtitle}>
          Select an item from &quot;Completed This Encounter&quot; to review the inserted documentation.
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitle}>{String(run.label ?? run.flowId)}</div>
        <div className={styles.flowSubtitle}>
          This text reflects clinician documentation recorded during this encounter. It supports communication, safety monitoring, and medical-legal clarity. It is not a treatment directive, seclusion / restraint authorization, custody / hold order, or standing medication order.
        </div>
      </header>

      <div className={styles.warn} role="note" aria-label="medico-legal framing">
        Documentation below mirrors what was inserted into the encounter note. It does not replace direct clinical judgment, supervision, observation policy, or local legal requirements.
      </div>

      <div className={styles.stepCard}>
        <div className={styles.stepCardTitle}>Inserted {timestampStr}</div>
        <div className={styles.row}>
         <div className={styles.rowLabel}>Summary paragraph</div>
          <div className={styles.rowInput}>
            <div className={styles.readonlyBlock}>
              {String(run.paragraph ?? "")}
            </div>
            <div className={styles.hint}>
              This paragraph was appended to the encounter note&#39;s outcome section at the recorded time. Language is intentionally descriptive, focused on observation, clinical reasoning, and communication. It is not an order set.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompletedRunReviewShell;
