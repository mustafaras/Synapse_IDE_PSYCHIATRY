import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import type { StepPill } from "../flowTypes";
import { GLOBAL_FLOW_SUBTITLE, GLOBAL_WARN_NEUTRAL_LANGUAGE } from "../legalCopy";

const STEPS: StepPill[] = [
  { key: "screen", label: "Screening Items" },
  { key: "summary", label: "Summary" },
];

const BFCRSShell: React.FC = () => {
  const [step, setStep] = useState(0);

  const base = "bfcrs";
  const panelId = (i: number) => `${base}-step-panel-${STEPS[i].key}`;
  const tabId = (i: number) => `${base}-step-tab-${STEPS[i].key}`;

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitle}>Catatonia (BFCRS Screening)</div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
      </header>

      <div className={styles.warn}>
        {GLOBAL_WARN_NEUTRAL_LANGUAGE} If malignant features or medical emergencies are suspected (e.g., autonomic instability, hyperthermia), escalate care per clinician judgment and local policy.
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
          <div className={styles.stepCardTitle}>Screening Items (placeholder)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="bfcrs-observations">Observations</label>
            <div className={styles.rowInput}>
              <textarea id="bfcrs-observations" rows={4} placeholder="E.g., mutism, stupor, posturing/catalepsy, echolalia, echopraxia, rigidity, gegenhalten, waxy flexibility, negativism, ambitendency." />
            </div>
          </div>
        </div>
  )}

      {step === 1 && (
        <div className={styles.stepCard} id={panelId(1)} role="tabpanel" aria-labelledby={tabId(1)}>
          <div className={styles.stepCardTitle}>Summary (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="bfcrs-narrative">Narrative</label>
            <div className={styles.rowInput}>
              <textarea id="bfcrs-narrative" rows={4} placeholder="Neutral summary of observed catatonic signs and a working total score if assessed. Documentation supports recognition and monitoring over time." />
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

export default BFCRSShell;
