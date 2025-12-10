import React, { useMemo, useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { useRegistry } from "../../registry/state";
import { CAPACITY_WARN, GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE } from "../legalCopy";
import { type CapacityFormState, defaultCapacityFormState } from "../types/CapacityFormState";
import { buildCapacityOutcome } from "../builders/capacityOutcome";
import { formatLocalTimeHHmm } from "../time/format";

const STEPS = [
  { key: "understanding", label: "Understanding" },
  { key: "appreciation", label: "Appreciation" },
  { key: "reasoning", label: "Reasoning" },
  { key: "choice", label: "Choice & Consistency" },
] as const;
type StepIndex = 0 | 1 | 2 | 3;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const CapacityFlowShell: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [capacityForm, setCapacityForm] = useState<CapacityFormState>(defaultCapacityFormState);
  const [lastInsertedAtMs, setLastInsertedAtMs] = useState<number | null>(null);

  const { state, actions } = useRegistry();
  const hasActiveSelection = Boolean(state.selectedPatientId && state.selectedEncounterId);

  const steps = useMemo(() => STEPS, []);
  const stepProgressLabel = `Step ${currentStep + 1} of ${steps.length}`;

  function update<K extends keyof CapacityFormState>(key: K, value: CapacityFormState[K]) {
    setCapacityForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleInsert = () => {
    const now = Date.now();
    const paragraph = buildCapacityOutcome(capacityForm, now);
    actions.appendFlowOutcome("capacity", "Capacity & Consent Check", paragraph);
    setLastInsertedAtMs(now);
  };

  const goPrev = () => setCurrentStep((s) => clamp(s - 1, 0, steps.length - 1) as StepIndex);
  const goNext = () => setCurrentStep((s) => clamp(s + 1, 0, steps.length - 1) as StepIndex);

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={styles.flowTitleMain}>Capacity &amp; Consent Check</div>
          <div className={styles.flowTitleMeta}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock}>
          {CAPACITY_WARN}
        </div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      <StepPills
        steps={steps.map((s) => ({ key: s.key, label: s.label }))}
        currentIndex={currentStep}
        onSelect={(i) => setCurrentStep(clamp(i, 0, steps.length - 1) as StepIndex)}
      />

      <div className={styles.flowBodyArea}>
        {currentStep === 0 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Understanding</div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="decision-context">Decision context being assessed:</label>
              <textarea
                id="decision-context"
                className={styles.textareaField}
                placeholder='Example: "Capacity to consent to voluntary inpatient psychiatric admission."'
                value={capacityForm.decisionContext}
                onChange={(e) => update("decisionContext", e.target.value)}
              />
              <div className={styles.formHint}>
                Capacity is decision-specific. Document which decision is being evaluated (e.g., admission, medication, procedure, leaving AMA).
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formLabel}>Patient’s understanding of the situation / recommendation</div>
              <div className={styles.radioRow}>
                <label><input type="radio" name="uLevel" checked={capacityForm.understandingLevel === "adequate"} onChange={() => update("understandingLevel", "adequate")} /> Adequate: can describe situation and proposed care in their own words</label>
                <label><input type="radio" name="uLevel" checked={capacityForm.understandingLevel === "partial"} onChange={() => update("understandingLevel", "partial")} /> Partial / limited: grasps some elements but omits or distorts key medical facts</label>
                <label><input type="radio" name="uLevel" checked={capacityForm.understandingLevel === "inaccurate"} onChange={() => update("understandingLevel", "inaccurate")} /> Inaccurate: explanation inconsistent with reality</label>
                <label><input type="radio" name="uLevel" checked={capacityForm.understandingLevel === "unable"} onChange={() => update("understandingLevel", "unable")} /> Unable / refuses to describe understanding</label>
                <label><input type="radio" name="uLevel" checked={capacityForm.understandingLevel === "not_assessed"} onChange={() => update("understandingLevel", "not_assessed")} /> Not assessed this encounter</label>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="u-verbatim">Patient’s own description of what is happening (verbatim if possible)</label>
              <textarea
                id="u-verbatim"
                className={styles.textareaField}
                placeholder='Patient states: "..." (use patient’s words about their condition / situation)'
                value={capacityForm.understandingVerbatim}
                onChange={(e) => update("understandingVerbatim", e.target.value)}
              />
              <div className={styles.formHint}>
                Understanding = can the patient state what is going on, in their own words? Example: “You think I might have bleeding in my head and you want to scan it.” Use direct quotes where possible; avoid judgmental language.
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Appreciation</div>

            <div className={styles.formSection}>
              <div className={styles.formLabel}>Patient’s appreciation of personal consequences</div>
              <div className={styles.radioRow}>
                <label><input type="radio" name="aLevel" checked={capacityForm.appreciationLevel === "acknowledges_risks_benefits"} onChange={() => update("appreciationLevel", "acknowledges_risks_benefits")} /> Acknowledges personal risks / benefits and possible consequences of accepting or refusing care</label>
                <label><input type="radio" name="aLevel" checked={capacityForm.appreciationLevel === "minimizes_or_denies_personal_relevance"} onChange={() => update("appreciationLevel", "minimizes_or_denies_personal_relevance")} /> Minimizes or denies personal relevance of risk despite explanation</label>
                <label><input type="radio" name="aLevel" checked={capacityForm.appreciationLevel === "distorted_by_delusion"} onChange={() => update("appreciationLevel", "distorted_by_delusion")} /> Appreciation distorted by delusional belief or severe intoxication / confusion</label>
                <label><input type="radio" name="aLevel" checked={capacityForm.appreciationLevel === "not_assessed"} onChange={() => update("appreciationLevel", "not_assessed")} /> Not assessed</label>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="a-verbatim">Patient’s statements about personal consequences / risks / benefits</label>
              <textarea
                id="a-verbatim"
                className={styles.textareaField}
                placeholder={`Example: "Pt states: 'If I leave now and don't get the scan, I could bleed and pass out and maybe die.'"`}
                value={capacityForm.appreciationVerbatim}
                onChange={(e) => update("appreciationVerbatim", e.target.value)}
              />
              <div className={styles.formHint}>
                Appreciation = can the patient describe how the situation could affect them personally (e.g., “If I refuse, I could get worse,” “If I take this medication, it might help me calm down but could make me sleepy”)? Record the patient’s own framing.
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Reasoning</div>

            <div className={styles.formSection}>
              <div className={styles.formLabel}>Ability to reason about options</div>
              <div className={styles.radioRow}>
                <label><input type="radio" name="rLevel" checked={capacityForm.reasoningLevel === "can_compare_options_coherently"} onChange={() => update("reasoningLevel", "can_compare_options_coherently")} /> Can compare options coherently with understandable rationale</label>
                <label><input type="radio" name="rLevel" checked={capacityForm.reasoningLevel === "somewhat_linear_but_limited"} onChange={() => update("reasoningLevel", "somewhat_linear_but_limited")} /> Somewhat linear but limited / concrete reasoning only</label>
                <label><input type="radio" name="rLevel" checked={capacityForm.reasoningLevel === "severely_impacted_by_thought_disorder"} onChange={() => update("reasoningLevel", "severely_impacted_by_thought_disorder")} /> Severely impacted by disorganized thought process / psychosis / intoxication</label>
                <label><input type="radio" name="rLevel" checked={capacityForm.reasoningLevel === "not_assessed"} onChange={() => update("reasoningLevel", "not_assessed")} /> Not assessed</label>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="r-evid">How did the patient explain their decision-making?</label>
              <textarea
                id="r-evid"
                className={styles.textareaField}
                placeholder={`Example: "Pt states: 'I don't want the CT because I'm scared of the machine, but I understand you think I might have bleeding. I just want to go home and sleep and see if I feel better.'"`}
                value={capacityForm.reasoningEvidence}
                onChange={(e) => update("reasoningEvidence", e.target.value)}
              />
              <div className={styles.formHint}>
                Reasoning = can the patient describe why they prefer one option over another in a way that connects to their values/goals? The clinician may disagree with the choice, but coherent reasoning can still indicate capacity. Document patient’s words neutrally.
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Choice & Consistency</div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="choice-expr">What choice did the patient express about this decision?</label>
              <textarea
                id="choice-expr"
                className={styles.textareaField}
                placeholder='Example: "Patient states: \"I agree to stay voluntarily for inpatient psychiatric care.\""'
                value={capacityForm.expressedChoice}
                onChange={(e) => update("expressedChoice", e.target.value)}
              />
              <div className={styles.formHint}>
                Choice / Consistency = can the patient communicate a preference for or against the proposed care? This does not mean you endorse the choice. It means they can state a decision.
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formLabel}>Stability / clarity of stated choice</div>
              <div className={styles.radioRow}>
                <label><input type="radio" name="cStable" checked={capacityForm.choiceStability === "consistent_and_clear"} onChange={() => update("choiceStability", "consistent_and_clear")} /> Consistent and clearly communicated</label>
                <label><input type="radio" name="cStable" checked={capacityForm.choiceStability === "fluctuating_or_ambivalent"} onChange={() => update("choiceStability", "fluctuating_or_ambivalent")} /> Fluctuating / ambivalent</label>
                <label><input type="radio" name="cStable" checked={capacityForm.choiceStability === "unable_to_state_choice"} onChange={() => update("choiceStability", "unable_to_state_choice")} /> Unable to communicate a stable choice</label>
                <label><input type="radio" name="cStable" checked={capacityForm.choiceStability === "not_assessed"} onChange={() => update("choiceStability", "not_assessed")} /> Not assessed</label>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="choice-notes">Notes on coercion, communication barriers, or factors limiting expression of choice:</label>
              <textarea
                id="choice-notes"
                className={styles.textareaField}
                placeholder='Example: "Patient intermittently tearful but able to answer questions coherently. No overt external coercion observed. Speech mildly slurred due to intoxication; reassessment planned when clinically more sober."'
                value={capacityForm.choiceNotes}
                onChange={(e) => update("choiceNotes", e.target.value)}
              />
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="clin-impr">Clinician’s integrated capacity impression (decision-specific):</label>
              <textarea
                id="clin-impr"
                className={styles.textareaField}
                placeholder='Example: "In my clinical judgment, patient demonstrates adequate decision-specific capacity to consent to voluntary admission, as they can describe the situation, appreciate personal consequences, provide a coherent rationale, and communicate a stable choice."'
                value={capacityForm.clinicianCapacityImpression}
                onChange={(e) => update("clinicianCapacityImpression", e.target.value)}
              />
              <div className={styles.formHint}>
                This is your professional synthesis for THIS decision only. You are not making a court determination, issuing a custody/hold, or creating involuntary treatment authority. You are documenting clinical judgment for handoff.
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="follow-plan">Follow-up / supervision / escalation plan communicated:</label>
              <textarea
                id="follow-plan"
                className={styles.textareaField}
                placeholder='Example: "Discussed findings with attending psychiatrist and ED charge RN. Plan is to reassess capacity after intoxication clears, and consider temporary medical hold if patient attempts to leave before safe evaluation. Patient informed that concern is safety, not punishment."'
                value={capacityForm.followupPlan}
                onChange={(e) => update("followupPlan", e.target.value)}
              />
              <div className={styles.formHint}>
                Document who was notified (attending, psychiatry, nursing, legal/risk if applicable) and the plan for reassessment or supervision. Frame all escalation in terms of immediate safety and clinical review, not punishment.
              </div>
            </div>

            <div>
              <button className={styles.insertOutcomeButton} onClick={handleInsert} disabled={!hasActiveSelection}>
                Insert outcome to Note
              </button>
              <div className={styles.formHint}>
                This will generate a timestamped summary of this capacity & consent assessment, append it to this encounter’s note, and log it under ‘Completed This Encounter.’ The summary documents understanding, appreciation, reasoning, expressed choice, clinician impression, and follow-up / supervision plan. It is not, by itself, a legal adjudication of capacity, an involuntary treatment authorization, a custody / hold order, or a substitute for local policy or supervising clinician approval.
              </div>
              {lastInsertedAtMs !== null && (
                <div className={styles.insertedToast}>Inserted ✓ {formatLocalTimeHHmm(lastInsertedAtMs)}</div>
              )}
            </div>
          </div>
        )}

        <div className={styles.stepActions}>
          <button className={styles.btnGhost} onClick={goPrev} disabled={currentStep === 0}>Back</button>
          <button className={styles.btnPrimary} onClick={goNext} disabled={currentStep === steps.length - 1}>Next</button>
        </div>
      </div>
    </section>
  );
};

export default CapacityFlowShell;
