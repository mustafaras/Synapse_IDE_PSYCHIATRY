import React, { useMemo, useState } from "react";
import styles from "../../styles/flows.module.css";
import StepPills from "../StepPills";
import { useRegistry } from "../../registry/state";
import { CATATONIA_WARN, FLOW_LABELS, GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE } from "../legalCopy";
import type { CatatoniaFormState } from "../types/CatatoniaFormState";
import { buildCatatoniaOutcome } from "../builders/catatoniaOutcome";
import { formatLocalTimeHHmm } from "../time/format";

const STEPS = [
  { key: "observed", label: "Observed Features" },
  { key: "medical", label: "Medical / Autonomic" },
  { key: "severity", label: "Severity / Impact" },
  { key: "monitor", label: "Monitoring & Insert" },
] as const;
type StepIndex = 0 | 1 | 2 | 3;

const defaultCatForm: CatatoniaFormState = {
  observedFeatures: {
    mutism: false,
    stuporOrImmobility: false,
    posturingOrCatalepsy: false,
    rigidity: false,
    negativism: false,
    echolaliaOrEchopraxia: false,
    waxyFlexibility: false,
    staringFixed: false,
    withdrawalRefusalToEatDrink: false,
    autonomicInstability: false,
  },
  observedNarrative: "",
  medicalDifferential: "",
  hydrationNutritionStatus: "",
  vitalsAndAutonomic: "",
  bfcrsSeverityLevel: "not_assessed",
  functionalImpact: "",
  riskFactors: "",
  monitoringPlan: "",
  handoffCommunication: "",
};

const CatatoniaFlowShell: React.FC = () => {
  const [step, setStep] = useState<StepIndex>(0);
  const [form, setForm] = useState<CatatoniaFormState>(defaultCatForm);
  const [lastInsertedAtMs, setLastInsertedAtMs] = useState<number | null>(null);
  const { state, actions } = useRegistry();
  const hasActiveSelection = Boolean(state.selectedPatientId && state.selectedEncounterId);

  const steps = useMemo(() => STEPS, []);
  const stepProgressLabel = `Step ${step + 1} of ${steps.length}`;

  function update<K extends keyof CatatoniaFormState>(key: K, value: CatatoniaFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handleInsert = () => {
    const now = Date.now();
    const paragraph = buildCatatoniaOutcome(form, now);
    actions.appendFlowOutcome("catatonia", FLOW_LABELS.catatonia, paragraph);
    setLastInsertedAtMs(now);
  };

  const toggleObserved = (k: keyof CatatoniaFormState["observedFeatures"]) => (checked: boolean) => {
    setForm((prev) => ({ ...prev, observedFeatures: { ...prev.observedFeatures, [k]: checked } }));
  };

  return (
    <section className={styles.panel}>
      <header className={styles.flowHeader}>
        <div className={styles.flowTitleRow}>
          <div className={styles.flowTitleMain}>{FLOW_LABELS.catatonia}</div>
          <div className={styles.flowTitleMeta}>{stepProgressLabel}</div>
        </div>
        <div className={styles.flowSubtitle}>{GLOBAL_FLOW_SUBTITLE}</div>
        <div className={styles.warnBlock}>{CATATONIA_WARN}</div>
        <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
      </header>

      <StepPills
        steps={steps.map((s) => ({ key: s.key, label: s.label }))}
        currentIndex={step}
        onSelect={(i) => setStep((Math.max(0, Math.min(steps.length - 1, i)) as StepIndex))}
      />

      <div className={styles.flowBodyArea}>
        {step === 0 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Observed Features</div>
            <div className={styles.formSection}>
              <div className={styles.formLabel}>Which features are present?</div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.mutism} onChange={(e) => toggleObserved("mutism")(e.target.checked)} /> Mutism / markedly reduced speech</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.stuporOrImmobility} onChange={(e) => toggleObserved("stuporOrImmobility")(e.target.checked)} /> Stupor / immobility</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.posturingOrCatalepsy} onChange={(e) => toggleObserved("posturingOrCatalepsy")(e.target.checked)} /> Posturing / catalepsy</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.rigidity} onChange={(e) => toggleObserved("rigidity")(e.target.checked)} /> Rigidity</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.negativism} onChange={(e) => toggleObserved("negativism")(e.target.checked)} /> Negativism</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.echolaliaOrEchopraxia} onChange={(e) => toggleObserved("echolaliaOrEchopraxia")(e.target.checked)} /> Echolalia / echopraxia</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.waxyFlexibility} onChange={(e) => toggleObserved("waxyFlexibility")(e.target.checked)} /> Waxy flexibility</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.staringFixed} onChange={(e) => toggleObserved("staringFixed")(e.target.checked)} /> Fixed staring / minimal blinking</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.withdrawalRefusalToEatDrink} onChange={(e) => toggleObserved("withdrawalRefusalToEatDrink")(e.target.checked)} /> Withdrawal / refusal to eat or drink</label></div>
              <div className={styles.checkboxRow}><label><input type="checkbox" checked={form.observedFeatures.autonomicInstability} onChange={(e) => toggleObserved("autonomicInstability")(e.target.checked)} /> Autonomic instability</label></div>
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-obsnarr">Objective, time-linked narrative</label>
              <textarea
                id="cat-obsnarr"
                className={styles.textareaField}
                value={form.observedNarrative}
                onChange={(e) => update("observedNarrative", e.target.value)}
                placeholder="Objective description of features with times (avoid pejorative language)."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Medical / Autonomic</div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-med">Medical / neurologic differential</label>
              <textarea
                id="cat-med"
                className={styles.textareaField}
                value={form.medicalDifferential}
                onChange={(e) => update("medicalDifferential", e.target.value)}
                placeholder="Delirium, intoxication/withdrawal, seizure, NMS, metabolic derangement, neurologic illness"
              />
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-hyd">Hydration / nutrition status</label>
              <textarea
                id="cat-hyd"
                className={styles.textareaField}
                value={form.hydrationNutritionStatus}
                onChange={(e) => update("hydrationNutritionStatus", e.target.value)}
                placeholder="E.g., minimal PO intake x24h, appears dehydrated"
              />
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-vitals">Vitals / autonomic findings</label>
              <textarea
                id="cat-vitals"
                className={styles.textareaField}
                value={form.vitalsAndAutonomic}
                onChange={(e) => update("vitalsAndAutonomic", e.target.value)}
                placeholder="BP/HR/temp, labile vitals, fever, diaphoresis"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Severity / Impact</div>
            <div className={styles.formSection}>
              <div className={styles.formLabel}>BFCRS severity (overall)</div>
              <div className={styles.radioRow}>
                <label><input type="radio" name="sev" checked={form.bfcrsSeverityLevel === "mild_functional_impairment"} onChange={() => update("bfcrsSeverityLevel", "mild_functional_impairment")} /> Mild functional impairment</label>
                <label><input type="radio" name="sev" checked={form.bfcrsSeverityLevel === "moderate_significant_impairment"} onChange={() => update("bfcrsSeverityLevel", "moderate_significant_impairment")} /> Moderate significant impairment</label>
                <label><input type="radio" name="sev" checked={form.bfcrsSeverityLevel === "severe_requires_urgent_intervention"} onChange={() => update("bfcrsSeverityLevel", "severe_requires_urgent_intervention")} /> Severe / urgent concern</label>
                <label><input type="radio" name="sev" checked={form.bfcrsSeverityLevel === "not_assessed"} onChange={() => update("bfcrsSeverityLevel", "not_assessed")} /> Not assessed</label>
              </div>
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-func">Functional impact</label>
              <textarea
                id="cat-func"
                className={styles.textareaField}
                value={form.functionalImpact}
                onChange={(e) => update("functionalImpact", e.target.value)}
                placeholder="Ability to maintain nutrition/hydration, safety, mobility, communication"
              />
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-risk">Risks</label>
              <textarea
                id="cat-risk"
                className={styles.textareaField}
                value={form.riskFactors}
                onChange={(e) => update("riskFactors", e.target.value)}
                placeholder="Rhabdomyolysis, autonomic collapse, aspiration risk, etc."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContentCard}>
            <div className={styles.stepCardTitle}>Monitoring & Outcome</div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-plan">Monitoring / reassessment plan</label>
              <textarea
                id="cat-plan"
                className={styles.textareaField}
                value={form.monitoringPlan}
                onChange={(e) => update("monitoringPlan", e.target.value)}
                placeholder="Plan for reassessment frequency, hydration/nutrition support, and escalation if autonomic instability progresses"
              />
            </div>
            <div className={styles.formSection}>
              <label className={styles.formLabel} htmlFor="cat-handoff">Handoff / services notified</label>
              <textarea
                id="cat-handoff"
                className={styles.textareaField}
                value={form.handoffCommunication}
                onChange={(e) => update("handoffCommunication", e.target.value)}
                placeholder="On-call psychiatry, nursing charge, ICU/medicine consult if needed"
              />
            </div>
            <div className={styles.outcomeActionsRow}>
              <button className={styles.insertOutcomeButton} onClick={handleInsert} disabled={!hasActiveSelection}>
                Insert outcome to Note
              </button>
              {lastInsertedAtMs !== null && (
                <div className={styles.insertedToast}>Inserted ✓ {formatLocalTimeHHmm(lastInsertedAtMs)}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CatatoniaFlowShell;
