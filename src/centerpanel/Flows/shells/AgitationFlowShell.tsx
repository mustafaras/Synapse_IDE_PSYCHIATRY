import React, { useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { AGITATION_WARN, GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE } from "../legalCopy";
import type { AgitationFormState } from "../types/AgitationFormState";

const STEPS = [
  { key: "baseline", label: "Baseline Behavior" },
  { key: "deescalation", label: "De-escalation Attempts" },
  { key: "escalation", label: "Escalation Rationale" },
  { key: "outcome", label: "Monitoring / Outcome" },
] as const;

type StepIndex = 0 | 1 | 2 | 3;

const AgitationFlowShell: React.FC = () => {
  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<AgitationFormState>({

    objectiveBehavior: "",
    injuryRiskProfile: "",
    medicalContributorsConsidered: "",

    deescalationTechniques: {
      verbalDeescalation: false,
      calmEnvironment: false,
      reducedStimuli: false,
      offeredSupportivePresence: false,
      offeredNeedsFoodDrinkToileting: false,
      setClearRespectfulLimits: false,
      otherEnvironmental: false,
    },
    deescalationNarrative: "",
    responseToDeescalation: "",

    escalationTypeDiscussed: "",
    leastRestrictiveSummary: "",
    escalationRationale: "",

    postInterventionStatus: "",
    reassessmentPlan: "",
    staffNotified: "",
  });

  function updateField<K extends keyof AgitationFormState>(key: K, value: AgitationFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateDeesc<K extends keyof AgitationFormState["deescalationTechniques"]>(
    key: K,
    value: AgitationFormState["deescalationTechniques"][K]
  ) {
    setForm((prev) => ({
      ...prev,
      deescalationTechniques: { ...prev.deescalationTechniques, [key]: value },
    }));
  }

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const goNext = () => setStep((s) => clamp(s + 1, 0, STEPS.length - 1) as StepIndex);
  const goBack = () => setStep((s) => clamp(s - 1, 0, STEPS.length - 1) as StepIndex);

  const stepProgressLabel = `Step ${step + 1} of ${STEPS.length}`;

  return (
    <section className={styles.panel}>
      {}
      <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={styles.flowTitleMain}>Agitation / Behavioral Emergency</div>
          <div className={styles.flowTitleMeta}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock} role="note" aria-label="agitation safety guidance">
          {AGITATION_WARN}
        </div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      {}
      <StepPills
        steps={STEPS.map((s) => ({ key: s.key, label: s.label }))}
        currentIndex={step}
        onSelect={(i) => setStep(clamp(i, 0, STEPS.length - 1) as StepIndex)}
      />

      <div className={styles.flowBodyArea}>
      {}
      {step === 0 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Baseline Behavior (Objective Description)</div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Observed behavior / presentation (objective terms):</div>
            <textarea
              className={styles.textareaField}
              rows={4}
              value={form.objectiveBehavior}
              onChange={(e) => updateField("objectiveBehavior", e.target.value)}
              placeholder={
                "Example: \"Patient pacing rapidly in hallway, verbally loud, clenched fists, intermittently striking door with open hand at approx 21:10.\""
              }
            />
            <div className={styles.formHint}>
              Describe behavior in neutral, observable language (e.g., “patient pacing rapidly, verbally loud, clenched fists,” “attempted to strike staff”). Avoid pejorative, moralizing, or blaming labels.
            </div>
          </div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="agitation-injury-risk-label">
            <div id="agitation-injury-risk-label" className={styles.formLabel}>Immediate risk / injury behavior noted:</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="injuryRiskProfile" checked={form.injuryRiskProfile === "verbal_only"} onChange={() => updateField("injuryRiskProfile", "verbal_only")} /> Verbal escalation / threats only; no physical contact</label>
              <label><input type="radio" name="injuryRiskProfile" checked={form.injuryRiskProfile === "attempted_self_harm"} onChange={() => updateField("injuryRiskProfile", "attempted_self_harm")} /> Attempted self-harm (e.g., hitting head, choking self, etc.)</label>
              <label><input type="radio" name="injuryRiskProfile" checked={form.injuryRiskProfile === "attempted_assault"} onChange={() => updateField("injuryRiskProfile", "attempted_assault")} /> Attempted physical contact toward staff / others</label>
              <label><input type="radio" name="injuryRiskProfile" checked={form.injuryRiskProfile === "property_damage"} onChange={() => updateField("injuryRiskProfile", "property_damage")} /> Property destruction / throwing objects</label>
              <label><input type="radio" name="injuryRiskProfile" checked={form.injuryRiskProfile === "not_assessed"} onChange={() => updateField("injuryRiskProfile", "not_assessed")} /> Not assessed / not observed</label>
            </div>
            <div className={styles.formHint}>
              Document whether patient attempted self-harm, attempted to strike others, or caused property damage. Use time-linked, specific language (“at ~21:12 patient threw chair toward wall”) instead of general character judgments.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Medical / physiologic contributors considered:</div>
            <textarea
              className={styles.textareaField}
              rows={3}
              value={form.medicalContributorsConsidered}
              onChange={(e) => updateField("medicalContributorsConsidered", e.target.value)}
              placeholder={
                "Example: \"Patient assessed for hypoxia (SpO2 98%), glucose 98 mg/dL, appears intoxicated with ETOH odor; denies head trauma. Possible alcohol withdrawal vs acute agitation in context of frustration.\""
              }
            />
            <div className={styles.formHint}>
              Document evaluation for delirium, hypoxia, intoxication / withdrawal, pain, head injury, metabolic disturbance. Behavioral emergencies can be medically driven; failing to note this is a common medico-legal vulnerability.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 1 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>De-escalation Attempts (Least Restrictive First)</div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Non-pharmacological de-escalation attempts (check all that were attempted):</div>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.verbalDeescalation} onChange={(e) => updateDeesc("verbalDeescalation", e.target.checked)} />
              Verbal de-escalation / calm tone
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.reducedStimuli} onChange={(e) => updateDeesc("reducedStimuli", e.target.checked)} />
              Reduced stimulation / moved to quieter space
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.offeredSupportivePresence} onChange={(e) => updateDeesc("offeredSupportivePresence", e.target.checked)} />
              Supportive presence / reassurance
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.offeredNeedsFoodDrinkToileting} onChange={(e) => updateDeesc("offeredNeedsFoodDrinkToileting", e.target.checked)} />
              Offered basic needs (water/food/restroom)
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.setClearRespectfulLimits} onChange={(e) => updateDeesc("setClearRespectfulLimits", e.target.checked)} />
              Set clear, respectful limits / expectations
            </label>
            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.deescalationTechniques.otherEnvironmental} onChange={(e) => updateDeesc("otherEnvironmental", e.target.checked)} />
              Other environmental / sensory modification
            </label>
            <div className={styles.formHint}>
              Document non-pharmacological de-escalation efforts (verbal de-escalation, reduced stimulation, offering supportive presence). This supports least-restrictive-first practice and shows that escalation was safety-based, not punitive.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Narrative of de-escalation attempts (timeline):</div>
            <textarea
              className={styles.textareaField}
              rows={4}
              value={form.deescalationNarrative}
              onChange={(e) => updateField("deescalationNarrative", e.target.value)}
              placeholder={
                "Example: \"At ~21:10 RN tried calm verbal redirection; patient initially yelling but allowed staff to stand at arm's length and speak quietly. At ~21:12 patient escorted to a lower-stimulation room.\""
              }
            />
            <div className={styles.formHint}>
              Use time-linked neutral language (“At ~21:10… At ~21:12…”). Avoid moral attributions like “patient was manipulative” or “patient refused to behave.” Focus on observable behavior and staff interventions.
            </div>
          </div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="agitation-deesc-response-label">
            <div id="agitation-deesc-response-label" className={styles.formLabel}>Response to de-escalation attempts:</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="responseToDeescalation" checked={form.responseToDeescalation === "calmed"} onChange={() => updateField("responseToDeescalation", "calmed")} /> Calmed / de-escalated</label>
              <label><input type="radio" name="responseToDeescalation" checked={form.responseToDeescalation === "partially_calmed"} onChange={() => updateField("responseToDeescalation", "partially_calmed")} /> Partially calmed but remained verbally or physically escalated</label>
              <label><input type="radio" name="responseToDeescalation" checked={form.responseToDeescalation === "no_effect"} onChange={() => updateField("responseToDeescalation", "no_effect")} /> No significant effect</label>
              <label><input type="radio" name="responseToDeescalation" checked={form.responseToDeescalation === "escalated"} onChange={() => updateField("responseToDeescalation", "escalated")} /> Escalated further despite attempts</label>
            </div>
            <div className={styles.formHint}>
              This documents observed response. It is not a moral judgment; it records whether verbal / environmental strategies were enough to reduce imminent risk.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 2 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Escalation Rationale</div>

          {}
          <div className={styles.formSection} role="group" aria-labelledby="agitation-escalation-type-label">
            <div id="agitation-escalation-type-label" className={styles.formLabel}>Highest level of escalation discussed or used during this episode:</div>
            <div className={styles.radioRow}>
              <label><input type="radio" name="escalationTypeDiscussed" checked={form.escalationTypeDiscussed === "verbal_limits_only"} onChange={() => updateField("escalationTypeDiscussed", "verbal_limits_only")} /> Clear verbal limits / behavioral expectations only</label>
              <label><input type="radio" name="escalationTypeDiscussed" checked={form.escalationTypeDiscussed === "prn_med_offer"} onChange={() => updateField("escalationTypeDiscussed", "prn_med_offer")} /> PRN medication was offered to reduce acute agitation</label>
              <label><input type="radio" name="escalationTypeDiscussed" checked={form.escalationTypeDiscussed === "emergency_med_administered"} onChange={() => updateField("escalationTypeDiscussed", "emergency_med_administered")} /> Emergency medication was administered by treating team for imminent safety</label>
              <label><input type="radio" name="escalationTypeDiscussed" checked={form.escalationTypeDiscussed === "physical_hold_or_containment"} onChange={() => updateField("escalationTypeDiscussed", "physical_hold_or_containment")} /> Physical hold / environmental containment used for imminent safety</label>
              <label><input type="radio" name="escalationTypeDiscussed" checked={form.escalationTypeDiscussed === "not_applicable"} onChange={() => updateField("escalationTypeDiscussed", "not_applicable")} /> Not applicable (no escalation beyond verbal support)</label>
            </div>
            <div className={styles.formHint}>
              If medications or physical measures were used, justify them in terms of imminent safety and continued monitoring, not punishment. Use objective, time-linked language (“at ~21:14 patient attempted to strike staff; brief physical hold used to prevent injury while additional staff arrived”).
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Least-restrictive measures attempted first:</div>
            <textarea
              className={styles.textareaField}
              rows={3}
              value={form.leastRestrictiveSummary}
              onChange={(e) => updateField("leastRestrictiveSummary", e.target.value)}
              placeholder={
                "Example: \"Quiet room and supportive presence attempted first. Verbal redirection given. Patient continued to attempt to strike staff despite these measures.\""
              }
            />
            <div className={styles.formHint}>
              List verbal / environmental strategies tried before any emergency medication, physical hold, or containment. This demonstrates least-restrictive-first practice required by policy.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Clinical / safety rationale for escalation (imminent risk framing):</div>
            <textarea
              className={styles.textareaField}
              rows={4}
              value={form.escalationRationale}
              onChange={(e) => updateField("escalationRationale", e.target.value)}
              placeholder={
                "Example: \"Escalation framed as immediate injury prevention, not punishment. Patient was attempting to strike staff and headbang on wall. Emergency medication was explained as a short-term measure to reduce risk of harm and allow assessment for medical contributors (possible ETOH intoxication).\""
              }
            />
            <div className={styles.formHint}>
              This needs to read like: “The intervention was implemented because of imminent risk of harm to self/others despite least-restrictive measures, and will be reassessed rapidly.” Do not describe escalation as retaliation, discipline, or convenience.
            </div>
          </div>
        </div>
      )}

      {}
      {step === 3 && (
        <div className={styles.stepContentCard}>
          <div className={styles.stepCardTitle}>Monitoring / Outcome</div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Post-intervention status / condition (patient presentation after intervention):</div>
            <textarea
              className={styles.textareaField}
              rows={4}
              value={form.postInterventionStatus}
              onChange={(e) => updateField("postInterventionStatus", e.target.value)}
              placeholder={
                "Example: \"By ~21:20 patient was lying on stretcher, speech volume decreased, oriented to person/place, denied current intent to harm staff or self. Breathing unlabored; no visible injury noted.\""
              }
            />
            <div className={styles.formHint}>
              Document the patient’s observed condition after the episode: orientation, distress level, visible injury check, ability to communicate needs. This shows that patient welfare was reassessed.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Reassessment / monitoring plan communicated:</div>
            <textarea
              className={styles.textareaField}
              rows={3}
              value={form.reassessmentPlan}
              onChange={(e) => updateField("reassessmentPlan", e.target.value)}
              placeholder={
                "Example: \"Plan communicated that staff will continue supportive observation and periodic check-ins to assess distress, safety, and any medical contributors (e.g., withdrawal, delirium). Patient encouraged to verbalize escalating distress immediately.\""
              }
            />
            <div className={styles.formHint}>
              Frame observation / monitoring as ongoing clinical safety and distress monitoring. Do not describe it as punishment. Make clear that reassessment will continue.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <div className={styles.formLabel}>Staff / services notified / handoff:</div>
            <textarea
              className={styles.textareaField}
              rows={3}
              value={form.staffNotified}
              onChange={(e) => updateField("staffNotified", e.target.value)}
              placeholder={
                "Example: \"Charge RN and on-call psychiatry were notified. Security aware for safety standby. Next shift briefed re: delirium vs intox differential and need for continued low-stimulation environment.\""
              }
            />
            <div className={styles.formHint}>
              Document who was informed (nursing, psychiatry, security, attending). This shows communication and continuity, not abandonment.
            </div>
          </div>

          {}
          <div className={styles.formSection}>
            <button className={styles.insertOutcomeButton ?? styles.btnPrimary} type="button" disabled>
              Insert outcome to Note
            </button>
            <div className={styles.formHint}>
              This will generate a timestamped summary of this agitation / behavioral emergency assessment, append it to this encounter’s note, and log it under ‘Completed This Encounter.’ The summary supports clinical communication, safety monitoring, and reassessment. It is not a restraint / seclusion order, physical-hold authorization, emergency medication order, custody / hold authorization, or standing directive.
            </div>
            {}
            <div className={styles.insertedToast} aria-hidden="true" style={{ minHeight: 0 }} />
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

export default AgitationFlowShell;
