import React, { useMemo } from "react";
import styles from "../../styles/flows.module.css";
import { useRegistry } from "../../registry/state";
import type { Encounter, Patient } from "../../registry/types";
import { getSuggestions } from "../suggestions/getSuggestions";
import { useFlowsUIStore } from "../uiStore";

const SuggestedCard: React.FC = () => {
  const { state } = useRegistry();
  const activateFlow = useFlowsUIStore((s) => s.activateFlow);

  const { patient, encounter } = useMemo(() => {
    const p: Patient | undefined = state.selectedPatientId
      ? state.patients.find((x) => x.id === state.selectedPatientId)
      : state.patients[0];
    const lastEnc: Encounter | undefined = p?.encounters
      ? [...(p.encounters || [])].sort((a, b) => (b.when ?? 0) - (a.when ?? 0))[0]
      : undefined;
    const e: Encounter | undefined = p?.encounters?.find((k) => k.id === state.selectedEncounterId) ?? lastEnc;
    return { patient: p, encounter: e };
  }, [state]);

  const suggestions = useMemo(() => getSuggestions(patient, encounter), [patient, encounter]);

  return (
    <div className={styles.suggestedCard} aria-label="Suggested">
      <div className={styles.suggestedHeader}>Suggested</div>

      <div className={styles.suggestedList}>
        {suggestions.length === 0 ? (
          <div className={styles.suggestedEmpty}>No active suggestions.</div>
        ) : (
          suggestions.map((s) => (
            <button
              key={`${s.flowId}-${s.reasonCode ?? s.titleLine}`}
              className={styles.suggestedPill}
              onClick={() => activateFlow(s.flowId)}
            >
              <div className={styles.suggestedPillTitle}>{s.titleLine}</div>
              <div className={styles.suggestedPillExplainer}>{s.explainerLine}</div>
            </button>
          ))
        )}
      </div>

      <div className={styles.suggestedDisclaimer}>
        These prompts highlight documentation pathways for communication and safety monitoring. They are not treatment directives, restraint /
        seclusion authorization, capacity adjudication, or legal hold.
      </div>
    </div>
  );
};

export default SuggestedCard;
