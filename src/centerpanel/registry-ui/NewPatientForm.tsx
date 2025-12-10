import { useEffect, useRef } from "react";
import styles from "./newPatient.module.css";
import DemographicsCard from "./DemographicsCard.tsx";
import SafetyRiskCard from "./SafetyRiskCard.tsx";
import EncounterCard from "./EncounterCard.tsx";
import AssessmentsCard from "./AssessmentsCard.tsx";
import TasksCard from "./TasksCard.tsx";
import SaveFooterBar from "./SaveFooterBar.tsx";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { showToast } from "@/ui/toast/api";

export interface NewPatientFormProps {
  onCancel(): void;
  onSave(): void;
}

export default function NewPatientForm({ onCancel, onSave }: NewPatientFormProps) {
  const resetDraft = useNewPatientDraftStore(s => s.resetDraft);
  const canSave = useNewPatientDraftStore(s => s.canSave());
  const hydrated = useNewPatientDraftStore(s => !!s.hydrated);
  const didInitRef = useRef(false);
  useEffect(() => {

    if (!hydrated || didInitRef.current) return;
    didInitRef.current = true;
    const s = useNewPatientDraftStore.getState();
    const hasPersistedDraft = Boolean(
      (s.id || '').trim() ||
      (s.name || '').trim() ||
      (s.age || '').trim() ||
      (s.tags?.length || 0) > 0 ||
      (s.encounter?.when || '').trim() ||
      (s.encounter?.location || '').trim() ||
      (s.encounter?.legalStatus || '').trim() ||
      (s.encounter?.hpiText || '').trim() ||
      (s.encs?.length || 0) > 0 ||
  (s.asses?.length || 0) > 0 ||
  ((s.taskDraft?.text || '').trim() || (s.taskDraft?.category || '').trim() || (s.taskDraft?.due || '').trim()) ||
  (s.tasks?.length || 0) > 0
    );
    const id = setTimeout(() => {
      if (hasPersistedDraft) {
        try {
          showToast({
            kind: 'info',
            message: 'Draft restored',
            contextKey: 'newpatient:restore',
            action: { label: 'Clear', onClick: () => { try { resetDraft(); } catch {} } },
          });
        } catch {}
      } else {
        try { resetDraft(); } catch {}
      }
    }, 0);
    void id;

  }, [hydrated]);

  const save = () => { onSave(); };

  return (
    <div role="region" aria-label="New patient form">
      <div className={styles.intakePage}>
        <DemographicsCard />
        <SafetyRiskCard />
        <EncounterCard />
        <AssessmentsCard />
        <TasksCard />
      </div>

      <SaveFooterBar onCancel={onCancel} onSave={save} canSave={canSave} />
    </div>
  );
}

