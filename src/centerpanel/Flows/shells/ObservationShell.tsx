import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import type { StepPill } from "../flowTypes";
import { GLOBAL_FLOW_SUBTITLE, GLOBAL_WARN_NEUTRAL_LANGUAGE } from "../legalCopy";

const STEPS: StepPill[] = [
  { key: "rationale", label: "Behavioral Rationale" },
  { key: "alternatives", label: "Alternatives Attempted" },
  { key: "context", label: "Observation / Containment Context" },
  { key: "monitoring", label: "Monitoring & Outcome" },
];

const ObservationShell: React.FC = () => {
  const [step, setStep] = useState(0);

  const base = "observation";
  const panelId = (i: number) => `${base}-step-panel-${STEPS[i].key}`;
  const tabId = (i: number) => `${base}-step-tab-${STEPS[i].key}`;

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitle}>Observation / Seclusion Justification</div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
      </header>

      <div className={styles.warn}>
        {GLOBAL_WARN_NEUTRAL_LANGUAGE} For any containment or increased observation, follow institutional policy and real-time supervisory oversight. This documentation aids communication, not authorization.
      </div>

      <StepPills
        steps={STEPS}
        currentIndex={step}
        onSelect={setStep}
        getPanelId={panelId}
        getTabId={tabId}
      />

      {step === 0 && (
        <div className={styles.stepCard} id={panelId(0)} role="tabpanel" aria-labelledby={tabId(0)}>
          <div className={styles.stepCardTitle}>Behavioral Rationale (objective)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="obs-observed">Observed behavior</label>
            <div className={styles.rowInput}>
              <textarea id="obs-observed" rows={4} placeholder="Document safety-relevant behavior factually (e.g., repeated attempts to elope into traffic; striking at staff; throwing chairs). Avoid pejoratives." />
            </div>
          </div>
        </div>
  )}

      {step === 1 && (
        <div className={styles.stepCard} id={panelId(1)} role="tabpanel" aria-labelledby={tabId(1)}>
          <div className={styles.stepCardTitle}>Alternatives Attempted</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="obs-alternatives">De-escalation and alternatives</label>
            <div className={styles.rowInput}>
              <textarea id="obs-alternatives" rows={3} placeholder="Verbal de-escalation, environmental modification, supportive presence, redirection, offer to rest, engagement with preferred activities." />
            </div>
          </div>
        </div>
  )}

      {step === 2 && (
        <div className={styles.stepCard} id={panelId(2)} role="tabpanel" aria-labelledby={tabId(2)}>
          <div className={styles.stepCardTitle}>Observation / Containment Context (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="obs-context">Context</label>
            <div className={styles.rowInput}>
              <textarea id="obs-context" rows={3} placeholder="If observation level increased or containment used, document safety rationale and oversight. This is documentation; not an authorization." />
            </div>
          </div>
        </div>
  )}

      {step === 3 && (
        <div className={styles.stepCard} id={panelId(3)} role="tabpanel" aria-labelledby={tabId(3)}>
          <div className={styles.stepCardTitle}>Monitoring & Outcome (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="obs-monitoring">Monitoring plan / outcome</label>
            <div className={styles.rowInput}>
              <textarea id="obs-monitoring" rows={3} placeholder="Vitals/airway/circulation awareness, reassessment intervals, de-escalation progress, return to baseline." />
            </div>
          </div>
        </div>
  )}

      <div className={styles.stepActions}>
        <button
          className={styles.btnGhost}
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step <= 0}
          aria-disabled={step <= 0}
          type="button"
        >
          Back
        </button>
        <button
          className={styles.btnPrimary}
          onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={step >= STEPS.length - 1}
          aria-disabled={step >= STEPS.length - 1}
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default ObservationShell;
