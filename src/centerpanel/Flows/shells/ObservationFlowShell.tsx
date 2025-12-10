import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { useRegistry } from "../../registry/state";
import { GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE, OBSERVATION_WARN } from "../legalCopy";
import type { ObservationFormState } from "../types/ObservationFormState";
import { buildObservationOutcome } from "../builders/observationOutcome";

const STEPS = [
  { key: "behavior", label: "Behavior / Risk" },
  { key: "least", label: "Least Restrictive" },
  { key: "current", label: "Current Observation" },
  { key: "review", label: "Review & Outcome" },
] as const;
type StepIndex = 0 | 1 | 2 | 3;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const pad2 = (n: number) => String(n).padStart(2, "0");

const ObservationFlowShell: React.FC = () => {
  const { actions } = useRegistry();
  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<ObservationFormState>({
    behaviorNarrative: "",
    imminentRiskType: "",
    riskClarifier: "",

    deescalationAttempts: "",
    nonPharmComfortsOffered: "",
    leastRestrictiveInsufficientWhy: "",

    observationLevel: "",
    observationRationale: "",
    monitoringPlanDetails: "",

    reassessmentFrequencyPlan: "",
    deescalationCriteria: "",
    handoffAndSupervision: "",
  });

  function update<K extends keyof ObservationFormState>(key: K, value: ObservationFormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const [insertedAt, setInsertedAt] = useState<number | null>(null);

  function handleInsertOutcome() {
    const nowMs = Date.now();
    const paragraph = buildObservationOutcome(form, nowMs);
    actions.appendFlowOutcome("observation", "Observation / Containment Justification", paragraph);
    setInsertedAt(nowMs);
  }

  const stepProgressLabel = `Step ${step + 1} of ${STEPS.length}`;

  return (
    <section className={styles.panel}>
      {}
  <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={`${styles.flowTitleMain} ${styles.titlePrimary}`}>Observation / Containment Justification</div>
          <div className={`${styles.flowTitleMeta} ${styles.cardSub}`}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock}>{OBSERVATION_WARN}</div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      {}
      <StepPills
        steps={STEPS.map(s => ({ key: s.key, label: s.label }))}
        currentIndex={step}
        onSelect={(i) => setStep(clamp(i, 0, STEPS.length - 1) as StepIndex)}
      />

      <div className={styles.flowBodyArea}>
      {}
      {step === 0 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Behavior / Immediate Safety Risk</div>

          <div className={styles.formSection}>
            <label htmlFor="behaviorNarr" className={styles.formLabel}>Observable behavior / timeline (objective, time-linked):</label>
            <textarea
              id="behaviorNarr"
              className={styles.textareaField}
              value={form.behaviorNarrative}
              onChange={(e) => update("behaviorNarrative", e.target.value)}
              placeholder="At ~13:12 patient repeatedly struck wall with closed fist, yelling threats toward staff; attempted to run toward unsecured exit while stating 'I'll get out, don't touch me.' Staff observed clenched fists, rapid pacing, and verbal threats in close proximity to others."
            />
            <div className={styles.formHint}>Use specific, time-linked, observable behavior (e.g., ‘at ~13:12 repeatedly struck wall with closed fist’) instead of judgmental terms (‘aggressive,’ ‘uncooperative’). Do not describe behavior as ‘punishment-worthy.’ Focus on immediate safety risk to self or others.</div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formLabel}>Primary immediate safety concern:</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="riskType" value="self_harm_imminent" checked={form.imminentRiskType === "self_harm_imminent"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Imminent self-harm / self-injury risk</label>
              <label><input type="radio" name="riskType" value="violence_threat_imminent" checked={form.imminentRiskType === "violence_threat_imminent"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Imminent risk of violence / harm to others</label>
              <label><input type="radio" name="riskType" value="attempted_elopement_from_safe_area" checked={form.imminentRiskType === "attempted_elopement_from_safe_area"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Repeated unsafe elopement attempts from controlled / medically necessary environment</label>
              <label><input type="radio" name="riskType" value="property_damage_creating_safety_hazard" checked={form.imminentRiskType === "property_damage_creating_safety_hazard"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Destructive behavior creating immediate safety hazard</label>
              <label><input type="radio" name="riskType" value="other_immediate_safety_risk" checked={form.imminentRiskType === "other_immediate_safety_risk"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Other immediate safety risk</label>
              <label><input type="radio" name="riskType" value="not_assessed" checked={form.imminentRiskType === "not_assessed"} onChange={(e)=>update("imminentRiskType", e.target.value)} /> Not assessed / unable to determine</label>
            </div>
            <div className={styles.formHint}>Identify the acute safety axis (self-harm, harm to others, unsafe elopement, etc.). Avoid moral language (‘non-compliant’).</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="riskClar" className={styles.formLabel}>Risk clarification (why this was immediately unsafe):</label>
            <textarea
              id="riskClar"
              className={styles.textareaField}
              value={form.riskClarifier}
              onChange={(e) => update("riskClarifier", e.target.value)}
              placeholder="Patient attempted forceful exit toward ambulance bay despite endorsing active suicidal ideation minutes earlier, raising concern for inability to maintain safety if patient eloped."
            />
            <div className={styles.formHint}>Describe why the situation could not safely continue without immediate containment-level observation. Link it to safety, not punishment or convenience.</div>
          </div>
        </div>
      )}

      {}
      {step === 1 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Least-Restrictive Measures Attempted</div>

          <div className={styles.formSection}>
            <label htmlFor="deesc" className={styles.formLabel}>Verbal de-escalation / supportive presence / environmental modification attempted:</label>
            <textarea
              id="deesc"
              className={styles.textareaField}
              value={form.deescalationAttempts}
              onChange={(e) => update("deescalationAttempts", e.target.value)}
              placeholder="Staff used calm tone, encouraged verbal expression of frustration, offered reassurance, reduced number of personnel in room, dimmed lights, and provided quiet space away from other patients."
            />
            <div className={styles.formHint}>Document that least-restrictive strategies (verbal support, reduced stimulation, reassurance, redirection) were attempted before elevating observation level.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="comforts" className={styles.formLabel}>Comfort / non-pharmacologic measures offered:</label>
            <textarea
              id="comforts"
              className={styles.textareaField}
              value={form.nonPharmComfortsOffered}
              onChange={(e) => update("nonPharmComfortsOffered", e.target.value)}
              placeholder="Offered water and blanket. Offered brief walk in supervised, lower-stimulation area. Encouraged paced breathing. RN remained nearby to provide reassurance."
            />
            <div className={styles.formHint}>Highlight supportive, non-punitive interventions offered to reduce agitation / distress.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="insufficientWhy" className={styles.formLabel}>Why least-restrictive measures were insufficient to maintain immediate safety:</label>
            <textarea
              id="insufficientWhy"
              className={styles.textareaField}
              value={form.leastRestrictiveInsufficientWhy}
              onChange={(e) => update("leastRestrictiveInsufficientWhy", e.target.value)}
              placeholder="Despite attempts, patient continued striking hard surfaces with closed fist, verbally threatening staff within arm’s reach, and moving toward exit in a manner that created immediate safety risk for self and others."
            />
            <div className={styles.formHint}>Make it clear this is about inability to maintain safety in the moment, not about compliance, disrespect, or punishment.</div>
          </div>
        </div>
      )}

      {}
      {step === 2 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Containment / Observation Level &amp; Monitoring Plan</div>

          <div className={styles.formSection}>
            <label htmlFor="obsLevel" className={styles.formLabel}>Current observation / containment level initiated under supervising clinician and local policy:</label>
            <select
              id="obsLevel"
              className={styles.selectInput}
              value={form.observationLevel}
              onChange={(e) => update("observationLevel", e.target.value)}
            >
              <option value="">Select…</option>
              <option value="constant_observation_1to1_line_of_sight">Continuous line-of-sight observation / dedicated staff presence</option>
              <option value="dedicated_safe_room_or_ligature_reduced_environment">Placement in designated ligature-reduced / safe room environment</option>
              <option value="restricted_unit_area_close_monitor">Restricted, closely monitored area per policy for imminent safety risk</option>
              <option value="temporary_physical_hold_per_policy">Brief physical hold per policy for immediate safety / stabilization</option>
              <option value="other_policy_defined_level">Other policy-defined safety containment measure</option>
              <option value="not_disclosed_here">Not disclosed / unspecified here</option>
            </select>
            <div className={styles.formHint}>Describe what observation / containment level is presently in effect, framing it as an immediate safety / stabilization measure under supervising clinician and local policy. Do NOT frame this as punishment.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="obsRationale" className={styles.formLabel}>Safety-based rationale for current observation / containment level:</label>
            <textarea
              id="obsRationale"
              className={styles.textareaField}
              value={form.observationRationale}
              onChange={(e) => update("observationRationale", e.target.value)}
              placeholder="Dedicated line-of-sight observation initiated under supervising clinician to prevent immediate self-injury and uncontrolled exit into an unsecured area. Rationale is acute safety stabilization, not punishment or retaliation."
            />
            <div className={styles.formHint}>Tie rationale explicitly to imminent safety risk. State this is under supervising clinician / local policy. Explicitly note that the purpose is stabilization and safety.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="monitorPlan" className={styles.formLabel}>Monitoring / staffing / airway-vitals plan communicated:</label>
            <textarea
              id="monitorPlan"
              className={styles.textareaField}
              value={form.monitoringPlanDetails}
              onChange={(e) => update("monitoringPlanDetails", e.target.value)}
              placeholder="Assigned staff remains in continuous line-of-sight. Staff will monitor for escalation, verbalize reassurance, and observe airway/respiratory effort if sedation or marked agitation occurs. Charge RN and supervising clinician aware."
            />
            <div className={styles.formHint}>This proves that active monitoring is in place, including airway / vitals observation if chemical sedation was used earlier in the encounter. That protects you in post-incident review.</div>
          </div>
        </div>
      )}

      {}
      {step === 3 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Ongoing Review / De-escalation Intent &amp; Insert Outcome to Note</div>

          <div className={styles.formSection}>
            <label htmlFor="reassessPlan" className={styles.formLabel}>Reassessment frequency / review plan (step-down intent):</label>
            <textarea
              id="reassessPlan"
              className={styles.textareaField}
              value={form.reassessmentFrequencyPlan}
              onChange={(e) => update("reassessmentFrequencyPlan", e.target.value)}
              placeholder="Team will reassess the need for continuous line-of-sight observation approximately every 15 minutes initially. Goal is to de-escalate to standard observation as soon as patient is no longer expressing imminent threats or attempting unsafe exit."
            />
            <div className={styles.formHint}>Regulators want proof that containment is time-limited and under continuous review. Explicitly record the plan to reduce restriction as soon as it’s safe.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="deescCriteria" className={styles.formLabel}>Criteria for de-escalation / discontinuation of elevated observation:</label>
            <textarea
              id="deescCriteria"
              className={styles.textareaField}
              value={form.deescalationCriteria}
              onChange={(e) => update("deescalationCriteria", e.target.value)}
              placeholder="Observation level will be reduced when patient is no longer making immediate threats toward self or others, is no longer attempting to exit an unsafe environment, and can engage verbally with staff support without striking surfaces or approaching others in a threatening manner."
            />
            <div className={styles.formHint}>Tie this to safety stabilization, not ‘patient promised to behave’ or ‘patient became compliant.’ Use neutral safety criteria.</div>
          </div>

          <div className={styles.formSection}>
            <label htmlFor="handoff" className={styles.formLabel}>Handoff, supervision, and policy oversight:</label>
            <textarea
              id="handoff"
              className={styles.textareaField}
              value={form.handoffAndSupervision}
              onChange={(e) => update("handoffAndSupervision", e.target.value)}
              placeholder="Charge RN, on-call psychiatry, and ED attending / supervising clinician have been notified of current observation level and reassessment plan. Plan communicated to incoming shift for continuity. Local policy and supervising clinician oversight apply; this is documented as an immediate safety measure, not punitive restriction."
            />
            <div className={styles.formHint}>Show that appropriate leadership is aware (supervising clinician / charge RN). This proves oversight, not rogue unilateral seclusion.</div>
          </div>

          <div className={styles.formSection}>
            <button className={styles.insertOutcomeButton} onClick={handleInsertOutcome}>Insert outcome to Note</button>
            <div className={styles.formHint}>This will generate a timestamped summary of the observed behavior, immediate safety risk, least-restrictive de-escalation attempts, rationale for elevated observation / containment level under supervising clinician and local policy, monitoring / staffing / airway-vitals plan, and explicit step-down / reassessment intent. The summary is appended to this encounter’s note and logged under ‘Completed This Encounter’. This documentation supports clinical communication and safety monitoring. It does not, by itself, authorize seclusion, restraint, involuntary treatment, legal custody / hold status, or any ongoing restriction, and does not replace local policy or supervising clinician oversight.</div>
            {insertedAt ? (
              <div className={styles.insertedToast}>Inserted ✓ {pad2(new Date(insertedAt).getHours())}:{pad2(new Date(insertedAt).getMinutes())}</div>
            ) : null}
          </div>
        </div>
      )}

      {}
      <div className={styles.stepActions}>
        <button className={styles.btnGhost} onClick={() => setStep((s)=>clamp((s as number)-1,0,STEPS.length-1) as StepIndex)}>Back</button>
        <button className={styles.btnPrimary} onClick={() => setStep((s)=>clamp((s as number)+1,0,STEPS.length-1) as StepIndex)}>Next</button>
      </div>
      </div>
    </section>
  );
};

export default ObservationFlowShell;
