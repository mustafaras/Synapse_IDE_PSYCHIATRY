import React from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { LORAZEPAM_WARN, FLOW_LABELS, GLOBAL_FLOW_SUBTITLE, GLOBAL_FLOW_BOUNDARY_LINE } from "../legalCopy";
import { useRegistry } from "../../registry/state";
import { buildLorazepamOutcome } from "../builders/lorazepamOutcome";
import type { LorazepamFormState } from "../types/LorazepamFormState";

const defaultState: LorazepamFormState = {
  indicationContext: "",
  preDoseMentalStatus: "",
  preDoseMotorFindings: "",
  preDoseVitalsAirway: "",
  lorazepamDetails: "",
  immediateResponse: "",
  safetyObservations: "",
  followupMonitoringPlan: "",
  reassessmentNeeds: "",
};

const steps = [
  { key: "indication", label: "Indication & Baseline" },
  { key: "dose", label: "Dose (per clinician)" },
  { key: "response", label: "Response & Safety" },
  { key: "followup", label: "Follow-up & Insert" },
] as const;

export default function LorazepamChallengeShell() {
  const [step, setStep] = React.useState<number>(0);
  const [form, setForm] = React.useState<LorazepamFormState>(defaultState);
  const { actions } = useRegistry();

  const onInsert = () => {
    const insertedAtMs = Date.now();
    const paragraph = buildLorazepamOutcome(form, insertedAtMs);
    actions.appendFlowOutcome("lorazepam", FLOW_LABELS.lorazepam, paragraph);
  };

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={styles.flowTitleMain}>{FLOW_LABELS.lorazepam}</div>
          <div className={styles.flowTitleMeta}>{`Step ${step + 1} of ${steps.length}`}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock}>{LORAZEPAM_WARN}</div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

  <StepPills steps={steps.map((s) => ({ key: s.key, label: s.label }))} currentIndex={step} onSelect={setStep} />

      {step === 0 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Indication & Baseline</div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-indication">Clinical indication</label>
            <textarea
              id="lorz-indication"
              className={styles.textareaField}
              value={form.indicationContext}
              onChange={(e) => setForm({ ...form, indicationContext: e.target.value })}
              placeholder="Rationale for considering a lorazepam challenge"
            />
          </div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-mental">Baseline mental status</label>
            <textarea
              id="lorz-mental"
              className={styles.textareaField}
              value={form.preDoseMentalStatus}
              onChange={(e) => setForm({ ...form, preDoseMentalStatus: e.target.value })}
              placeholder="Orientation, behavior, speech, interaction"
            />
          </div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-motor">Motor findings</label>
            <textarea
              id="lorz-motor"
              className={styles.textareaField}
              value={form.preDoseMotorFindings}
              onChange={(e) => setForm({ ...form, preDoseMotorFindings: e.target.value })}
              placeholder="Immobility, posturing, rigidity, negativism, echolalia/echopraxia"
            />
          </div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-airway">Airway and vitals baseline</label>
            <textarea
              id="lorz-airway"
              className={styles.textareaField}
              value={form.preDoseVitalsAirway}
              onChange={(e) => setForm({ ...form, preDoseVitalsAirway: e.target.value })}
              placeholder="Airway patency, RR, O2 sat, BP/HR; any autonomic instability"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Dose (per clinician)</div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-dose">Dose details</label>
            <textarea
              id="lorz-dose"
              className={styles.textareaField}
              value={form.lorazepamDetails}
              onChange={(e) => setForm({ ...form, lorazepamDetails: e.target.value })}
              placeholder="Per treating clinician: lorazepam [dose mg] [route] at [time]."
            />
            <div className={styles.formHint}>For documentation only. This does not direct medication orders.</div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Response & Safety</div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-response">Observed response over time</label>
            <textarea
              id="lorz-response"
              className={styles.textareaField}
              value={form.immediateResponse}
              onChange={(e) => setForm({ ...form, immediateResponse: e.target.value })}
              placeholder="Timepoints and serial observations (e.g., 10/30/60 minutes)"
            />
          </div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-safety">Clinical changes / safety observations</label>
            <textarea
              id="lorz-safety"
              className={styles.textareaField}
              value={form.safetyObservations}
              onChange={(e) => setForm({ ...form, safetyObservations: e.target.value })}
              placeholder="Behavioral/motor changes, engagement, airway / vitals monitoring, adverse effects"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Follow-up & Insert</div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-follow">Follow-up plan</label>
            <textarea
              id="lorz-follow"
              className={styles.textareaField}
              value={form.followupMonitoringPlan}
              onChange={(e) => setForm({ ...form, followupMonitoringPlan: e.target.value })}
              placeholder="Monitoring frequency, team handoff, medical workup"
            />
          </div>
          <div className={styles.formSection}>
            <label className={styles.formLabel} htmlFor="lorz-reassess">Reassessment / escalation needs</label>
            <textarea
              id="lorz-reassess"
              className={styles.textareaField}
              value={form.reassessmentNeeds}
              onChange={(e) => setForm({ ...form, reassessmentNeeds: e.target.value })}
              placeholder="If no improvement/worsening, when to escalate or re-evaluate"
            />
          </div>
          <div className={styles.outcomeActionsRow}>
            <button className={styles.insertOutcomeButton} onClick={onInsert}>Insert Outcome</button>
          </div>
        </div>
      )}
    </section>
  );
}
