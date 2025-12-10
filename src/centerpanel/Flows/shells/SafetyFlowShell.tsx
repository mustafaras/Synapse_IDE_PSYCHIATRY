import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE, SAFETY_WARN } from "../legalCopy";
import { useRegistry } from "../../registry/state";
import { buildSafetyOutcome, type SafetyFormState as SafetyFormStateForBuilder } from "../builders/safetyOutcome";
import { formatLocalTimeHHmm } from "../time/format";


const STEPS = [
  { key: "ideation",   label: "Ideation & Intent" },
  { key: "means",      label: "Means & Acute Risk" },
  { key: "protective", label: "Protective Factors" },
  { key: "plan",       label: "Observation & Plan" },
] as const;
type StepIndex = 0 | 1 | 2 | 3;



type SafetyFormState = {

  ideationStatus: "" | "denies" | "passive" | "active" | "withheld" | "not_assessed";
  intentPlanStatus: "" | "denies" | "passive_no_plan" | "active_general" | "active_intent" | "not_assessed";
  patientVerbatim: string;

  meansAccess: "" | "no_access" | "potential_access" | "direct_access" | "not_assessed";
  acuteRiskFactors: string;

  protectiveFactors: string;
  alertWillingness: "" | "will_alert" | "ambivalent_but_agrees" | "declines" | "not_discussed";

  observationDiscussed: "" | "brief_supportive" | "continuous_observation_discussed" | "other" | "not_discussed";
  observationNotes: string;
};


const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const SafetyFlowShell: React.FC = () => {
  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<SafetyFormState>({

    ideationStatus: "",
    intentPlanStatus: "",
    patientVerbatim: "",

    meansAccess: "",
    acuteRiskFactors: "",

    protectiveFactors: "",
    alertWillingness: "",

    observationDiscussed: "",
    observationNotes: "",
  });
  const { actions } = useRegistry();
  const [lastInsertedAtMs, setLastInsertedAtMs] = useState<number | null>(null);

  function handleInsertOutcome() {

    const now = Date.now();
    const paragraph = buildSafetyOutcome(form as unknown as SafetyFormStateForBuilder, now);
    actions.appendFlowOutcome("safety", "Safety Review", paragraph);
    setLastInsertedAtMs(now);
  }

  function updateField<K extends keyof SafetyFormState>(
    key: K,
    value: SafetyFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const MAX_STEP: StepIndex = (STEPS.length - 1) as StepIndex;
  const goNext = () => setStep((s) => clamp(s + 1, 0, MAX_STEP) as StepIndex);
  const goBack = () => setStep((s) => clamp(s - 1, 0, MAX_STEP) as StepIndex);

  const stepProgressLabel = `Step ${step + 1} of ${STEPS.length}`;

  return (
    <section className={styles.panel}>
      {}
  <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={`${styles.flowTitleMain} ${styles.titlePrimary}`}>Acute Safety / Suicide Risk Review</div>
          <div className={`${styles.flowTitleMeta} ${styles.cardSub}`}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock} role="note" aria-label="safety escalation guidance">
          {SAFETY_WARN}
        </div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      {}
      <StepPills
        steps={STEPS.map((s) => ({ key: s.key, label: s.label }))}
        currentIndex={step}
        onSelect={(i) => setStep(clamp(i, 0, MAX_STEP) as StepIndex)}
      />

      <div className={styles.flowBodyArea}>
      {}
      {step === 0 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Ideation &amp; Intent</div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="s1-ideation-label">
            <div id="s1-ideation-label" className={styles.formLabel}>Current suicidal thoughts?</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="ideationStatus" checked={form.ideationStatus === "denies"} onChange={() => updateField("ideationStatus", "denies")} /> Denies suicidal thoughts</label>
              <label><input type="radio" name="ideationStatus" checked={form.ideationStatus === "passive"} onChange={() => updateField("ideationStatus", "passive")} /> Passive suicidal ideation</label>
              <label><input type="radio" name="ideationStatus" checked={form.ideationStatus === "active"} onChange={() => updateField("ideationStatus", "active")} /> Active suicidal ideation</label>
              <label><input type="radio" name="ideationStatus" checked={form.ideationStatus === "withheld"} onChange={() => updateField("ideationStatus", "withheld")} /> Withheld / not disclosed</label>
              <label><input type="radio" name="ideationStatus" checked={form.ideationStatus === "not_assessed"} onChange={() => updateField("ideationStatus", "not_assessed")} /> Not assessed this encounter</label>
            </div>
            <div className={styles.formHint}>
              Passive suicidal ideation refers to thoughts of death or non-existence (e.g., “I wish I would not wake up”) without a formulated plan. Active suicidal ideation refers to thinking about killing oneself, with or without a stated plan. Use the patient’s own language whenever feasible.
            </div>
          </div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="s1-intent-label">
            <div id="s1-intent-label" className={styles.formLabel}>Current intent or plan?</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="intentPlanStatus" checked={form.intentPlanStatus === "denies"} onChange={() => updateField("intentPlanStatus", "denies")} /> Denies intent; no plan reported</label>
              <label><input type="radio" name="intentPlanStatus" checked={form.intentPlanStatus === "passive_no_plan"} onChange={() => updateField("intentPlanStatus", "passive_no_plan")} /> Passive thoughts only; no plan reported</label>
              <label><input type="radio" name="intentPlanStatus" checked={form.intentPlanStatus === "active_general"} onChange={() => updateField("intentPlanStatus", "active_general")} /> Active thoughts with general plan (no immediate intent stated)</label>
              <label><input type="radio" name="intentPlanStatus" checked={form.intentPlanStatus === "active_intent"} onChange={() => updateField("intentPlanStatus", "active_intent")} /> Active thoughts with stated intent / plan</label>
              <label><input type="radio" name="intentPlanStatus" checked={form.intentPlanStatus === "not_assessed"} onChange={() => updateField("intentPlanStatus", "not_assessed")} /> Not assessed</label>
            </div>
            <div className={styles.formHint}>
              Intent means the patient expresses a desire to act on self-harm in the near term. Plan means the patient can describe method, timing, or preparation. Document verbatim if the patient gives specific details. If intent/plan was not assessed, record that clearly.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Patient self-report (verbatim if possible)</div>
            <textarea
              className={styles.textareaField}
              placeholder={`Patient states: "..."`}
              value={form.patientVerbatim}
              onChange={(e) => updateField("patientVerbatim", e.target.value)}
            />
            <div className={styles.formHint}>
              Document the patient’s own words where feasible (e.g., “I keep thinking I just don’t want to wake up”). Avoid paraphrasing into judgmental or blaming language.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 1 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Means &amp; Acute Risk</div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="s2-means-label">
            <div id="s2-means-label" className={styles.formLabel}>Access to means / tools for self-harm?</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="meansAccess" checked={form.meansAccess === "no_access"} onChange={() => updateField("meansAccess", "no_access")} /> Patient reports no access to lethal means</label>
              <label><input type="radio" name="meansAccess" checked={form.meansAccess === "potential_access"} onChange={() => updateField("meansAccess", "potential_access")} /> Patient reports potential access (e.g. medications, ligature opportunities)</label>
              <label><input type="radio" name="meansAccess" checked={form.meansAccess === "direct_access"} onChange={() => updateField("meansAccess", "direct_access")} /> Patient reports direct access to specific means</label>
              <label><input type="radio" name="meansAccess" checked={form.meansAccess === "not_assessed"} onChange={() => updateField("meansAccess", "not_assessed")} /> Not assessed / Patient declined to answer</label>
            </div>
            <div className={styles.formHint}>
              Access to means refers to available tools or methods the patient could realistically use for self-harm (e.g., stockpiled medication, firearm access, ligature opportunities). Document the patient’s own statements objectively.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Acute risk factors / recent escalators</div>
            <textarea
              className={styles.textareaField}
              value={form.acuteRiskFactors}
              onChange={(e) => updateField("acuteRiskFactors", e.target.value)}
              placeholder="Document objective, time-linked contributors (e.g., intoxication/withdrawal, severe agitation, command hallucinations, recent loss/conflict, rapidly worsening hopelessness)."
            />
            <div className={styles.formHint}>
              Document objective, time-linked stressors and contributors (e.g., “patient reports recent breakup and expresses ‘no point going on,’ tearful, pacing, markedly agitated,” “etoh intoxicated,” “expressing command hallucinations to self-harm”). Avoid moralizing terms.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 2 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Protective Factors</div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Protective factors / supports identified by patient</div>
            <textarea
              className={styles.textareaField}
              value={form.protectiveFactors}
              onChange={(e) => updateField("protectiveFactors", e.target.value)}
              placeholder="Patient identifies reasons for living, commitments, supports, or willingness to seek help..."
            />
            <div className={styles.formHint}>
              Examples of protective / stabilizing factors: expresses responsibility toward family/pet; identifies reasons for living; future-oriented plans; states willingness to seek help if urges intensify; engages with staff support.
            </div>
          </div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="s3-alert-label">
            <div id="s3-alert-label" className={styles.formLabel}>Willing to alert staff / clinician if urges worsen?</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="alertWillingness" checked={form.alertWillingness === "will_alert"} onChange={() => updateField("alertWillingness", "will_alert")} /> States they will alert immediately if urges intensify</label>
              <label><input type="radio" name="alertWillingness" checked={form.alertWillingness === "ambivalent_but_agrees"} onChange={() => updateField("alertWillingness", "ambivalent_but_agrees")} /> Expresses ambivalence but agrees to alert staff if distress spikes</label>
              <label><input type="radio" name="alertWillingness" checked={form.alertWillingness === "declines"} onChange={() => updateField("alertWillingness", "declines")} /> Declines / does not agree to notify</label>
              <label><input type="radio" name="alertWillingness" checked={form.alertWillingness === "not_discussed"} onChange={() => updateField("alertWillingness", "not_discussed")} /> Not discussed</label>
            </div>
            <div className={styles.formHint}>
              This documents what the patient verbalized about alerting staff if self-harm urges intensify. It records communication, not a guarantee of behavior and not a binding safety contract.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 3 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Observation / Plan</div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="s4-obs-label">
            <div id="s4-obs-label" className={styles.formLabel}>Observation / monitoring approach discussed</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="observationDiscussed" checked={form.observationDiscussed === "brief_supportive"} onChange={() => updateField("observationDiscussed", "brief_supportive")} /> Brief supportive check-ins / observation discussed for safety and distress monitoring</label>
              <label><input type="radio" name="observationDiscussed" checked={form.observationDiscussed === "continuous_observation_discussed"} onChange={() => updateField("observationDiscussed", "continuous_observation_discussed")} /> Continuous observation / sitter presence was discussed with patient in context of imminent self-harm risk</label>
              <label><input type="radio" name="observationDiscussed" checked={form.observationDiscussed === "other"} onChange={() => updateField("observationDiscussed", "other")} /> Other / individualized monitoring approach discussed</label>
              <label><input type="radio" name="observationDiscussed" checked={form.observationDiscussed === "not_discussed"} onChange={() => updateField("observationDiscussed", "not_discussed")} /> Not discussed this encounter</label>
            </div>
            <div className={styles.formHint}>
              This describes what was discussed regarding observation/monitoring to reduce immediate self-harm risk. It documents communication and rationale. It is not, by itself, a seclusion/restraint order, constant-observation order, or involuntary hold authorization. Local policy and supervising clinician govern any restrictive measures.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Clinician summary / next-step safety communication</div>
            <textarea
              className={styles.textareaField}
              value={form.observationNotes}
              onChange={(e) => updateField("observationNotes", e.target.value)}
              placeholder="Summarize agreed immediate safety communication (e.g., patient encouraged to notify staff if urges escalate; staff aware to monitor distress; patient verbalizes understanding)..."
            />
            <div className={styles.formHint}>
              Use neutral, descriptive language. Example: “Patient was encouraged to immediately notify staff or clinician if suicidal urge intensifies. Patient verbalizes understanding. Supportive observation and check-ins were discussed to reduce immediate risk.” This supports clinical communication and does not constitute a standing directive.
            </div>
          </div>
          {}
          <div className={styles.formSection}>
            <button
              className={styles.insertOutcomeButton ?? styles.btnPrimary}
              onClick={handleInsertOutcome}
              type="button"
            >
              Insert outcome to Note
            </button>
            <div className={styles.formHint}>
              This will generate a timestamped summary of this suicide / safety review, append it to this encounter’s note, and log it under “Completed This Encounter.” The summary supports clinical communication and safety monitoring. It is not a seclusion / restraint order, constant-observation order, involuntary hold authorization, or standing treatment directive.
            </div>
            {lastInsertedAtMs !== null && (
              <div className={(styles.insertedToast ?? styles.insertToast)}>
                Inserted ✓ {formatLocalTimeHHmm(lastInsertedAtMs)}
              </div>
            )}
          </div>
        </div>
      )}

      {}
      <div className={styles.stepActions}>
        <button className={styles.btnGhost} onClick={goBack}>Back</button>
        <button className={styles.btnPrimary} onClick={goNext}>Next</button>
      </div>
      </div>
    </section>
  );
};

export default SafetyFlowShell;
