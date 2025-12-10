import React, { useMemo } from "react";
import styles from "../../styles/flows.module.css";
import { useRegistry } from "../../registry/state";
import { useFlowsUIStore } from "../uiStore";

function pad2(n: number) { return String(n).padStart(2, "0"); }

const CompletedRunsCard: React.FC = () => {
  const { state } = useRegistry();
  const reviewRun = useFlowsUIStore((s) => s.reviewRun);

  const activeEnc = useMemo(() => {
    const patient = state.selectedPatientId
      ? state.patients.find((p) => p.id === state.selectedPatientId)
      : state.patients[0];
    if (!patient) return undefined;
    const enc = patient.encounters?.find((e) => e.id === state.selectedEncounterId)
      ?? [...(patient.encounters || [])].sort((a, b) => (b.when ?? 0) - (a.when ?? 0))[0];
    return enc;
  }, [state]);

  const runs = useMemo(() => {
    return [...(activeEnc?.completedRuns || [])]
      .filter(Boolean)
      .sort((a, b) => (b.insertedAt ?? 0) - (a.insertedAt ?? 0));
  }, [activeEnc?.completedRuns]);

  const count = runs.length;

  return (
    <section className={styles.completedCard} aria-label="Completed This Encounter">
      <div className={styles.completedCardHeader}>
        Completed This Encounter {count > 0 ? <span className={styles.railCountPill}>{count}</span> : null}
      </div>

      <div className={styles.completedRunList}>
        {count === 0 ? (
          <div className={styles.completedEmpty}>No structured summaries inserted yet.</div>
        ) : (
          runs.map((run) => {
            const d = new Date(run.insertedAt ?? 0);
            const ts = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
            const runId = run.runId || `${run.flowId}-${run.insertedAt}`;
            return (
              <div
                key={runId}
                className={styles.completedRunRow}
                role="button"
                tabIndex={0}
                onClick={() => reviewRun(runId)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reviewRun(runId); } }}
                aria-label={`Review ${run.label || run.flowId} inserted at ${ts}`}
              >
                <div className={styles.completedRunTime}>{ts}</div>
                <div className={styles.completedRunLabel}>{String(run.label ?? run.flowId)}</div>
                <div className={styles.completedRunStatus}>→ inserted</div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.completedDisclaimer}>
        These summaries reflect clinician documentation during this encounter. They are not treatment directives.
      </div>
    </section>
  );
};

export default CompletedRunsCard;
