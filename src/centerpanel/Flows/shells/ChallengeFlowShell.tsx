import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import type { StepPill } from "../flowTypes";
import { GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE, LORAZEPAM_WARN } from "../legalCopy";

const STEPS: StepPill[] = [
  { key: "eligibility", label: "Eligibility & Contraindications" },
  { key: "baseline", label: "Baseline Exam" },
  { key: "intervention", label: "Intervention Context" },
  { key: "reassess", label: "Reassessment" },
  { key: "outcome", label: "Outcome Summary" },
];

const ChallengeFlowShell: React.FC = () => {
  const [step, setStep] = useState(0);

  const base = "challenge";
  const panelId = (i: number) => `${base}-step-panel-${STEPS[i].key}`;
  const tabId = (i: number) => `${base}-step-tab-${STEPS[i].key}`;

  const stepProgressLabel = `Step ${step + 1} of ${STEPS.length}`;

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={styles.flowTitleMain}>Lorazepam Challenge</div>
          <div className={styles.flowTitleMeta}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock}>{LORAZEPAM_WARN}</div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      <StepPills
        steps={STEPS}
        currentIndex={step}
        onSelect={setStep}
        getPanelId={panelId}
        getTabId={tabId}
      />

      <div className={styles.flowBodyArea}>
      {step === 0 && (
        <div className={styles.stepContentCard} id={panelId(0)} role="tabpanel" aria-labelledby={tabId(0)}>
          <div className={styles.stepCardTitle}>Eligibility & Contraindications (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="challenge-considerations">Considerations</label>
            <div className={styles.rowInput}>
              <textarea id="challenge-considerations" rows={4} placeholder="Hypoventilation risk, severe intoxication, allergy, pregnancy considerations, frailty; mimics considered." />
            </div>
          </div>
        </div>
  )}

      {step === 1 && (
        <div className={styles.stepContentCard} id={panelId(1)} role="tabpanel" aria-labelledby={tabId(1)}>
          <div className={styles.stepCardTitle}>Baseline Exam (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="challenge-baseline">Baseline findings</label>
            <div className={styles.rowInput}>
              <textarea id="challenge-baseline" rows={4} placeholder="Motoric signs, speech, cooperation, autonomic markers, vitals, level of alertness." />
            </div>
          </div>
        </div>
  )}

      {step === 2 && (
        <div className={styles.stepContentCard} id={panelId(2)} role="tabpanel" aria-labelledby={tabId(2)}>
          <div className={styles.stepCardTitle}>Intervention Context (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="challenge-context">Context & monitoring</label>
            <div className={styles.rowInput}>
              <textarea id="challenge-context" rows={3} placeholder="Setting, observation, monitoring plans. Document context; do not write a medication order here." />
            </div>
          </div>
        </div>
  )}

      {step === 3 && (
        <div className={styles.stepContentCard} id={panelId(3)} role="tabpanel" aria-labelledby={tabId(3)}>
          <div className={styles.stepCardTitle}>Reassessment (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="challenge-observed">Observed change</label>
            <div className={styles.rowInput}>
              <textarea id="challenge-observed" rows={3} placeholder="Response in motoric signs, engagement, alertness; any adverse effects noted." />
            </div>
          </div>
        </div>
  )}

      {step === 4 && (
        <div className={styles.stepContentCard} id={panelId(4)} role="tabpanel" aria-labelledby={tabId(4)}>
          <div className={styles.stepCardTitle}>Outcome Summary (documentation)</div>
          <div className={styles.row}>
            <label className={styles.rowLabel} htmlFor="challenge-narrative">Narrative</label>
            <div className={styles.rowInput}>
              <textarea id="challenge-narrative" rows={4} placeholder="Neutral synthesis of rationale, baseline, context, reassessment, and clinician impression. Documentation supports reasoning; not a medication directive." />
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
      </div>
    </section>
  );
};

export default ChallengeFlowShell;
