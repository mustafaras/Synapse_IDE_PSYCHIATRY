import styles from "./newPatient.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { useRegistry } from "../registry/state";

export default function SaveFooterBar(props: {
  onCancel: () => void;
  onSave: () => void;
  canSave?: boolean;
}) {
  const { onCancel, onSave } = props;
  const finalizeNewPatient = useNewPatientDraftStore(s => s.finalizeNewPatient);
  const clearDraft = useNewPatientDraftStore(s => s.clearNewPatientDraft);
  const errors = useNewPatientDraftStore(s => s.newPatientErrors);
  const { actions } = useRegistry();

  function scrollToFirstError() {
    try {
      const el = document.querySelector(`.${styles.errorText}`);
      if (el && 'scrollIntoView' in el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {}
  }

  const onSaveClick = () => {
    const outcome = finalizeNewPatient();
    if (!outcome.ok) {

      scrollToFirstError();
      return;
    }

    try { actions.addPatient(outcome.patient); } catch {}
    try { onSave(); } catch {}
    try { clearDraft(); } catch {}
  };
  return (
    <footer className={styles.saveFooterOuter}>
      <div className={styles.saveFooterInner}>
        {}
        <div aria-live="polite" className={styles.srOnly}>
          {errors && (errors.demographics?.name || errors.risk?.grade || errors.encounter?.when) ? 'Validation errors above' : ''}
        </div>
        <div className={styles.footerMeta}>
          Documentation supports clinical communication and does not constitute treatment directives without clinician judgment.
        </div>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
        <button type="button" className={styles.btnPrimary} onClick={onSaveClick}>Save patient</button>
      </div>
    </footer>
  );
}
