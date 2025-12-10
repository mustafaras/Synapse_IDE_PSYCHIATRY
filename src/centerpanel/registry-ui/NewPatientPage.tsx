import NewPatientForm from "./NewPatientForm";
import { useEffect } from "react";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import styles from "./newPatient.module.css";

export default function NewPatientPage() {
  const setNewPatientDraftActive = useNewPatientDraftStore(s => s.setNewPatientDraftActive);


  useEffect(() => {
    setNewPatientDraftActive(true);
    return () => setNewPatientDraftActive(false);
  }, [setNewPatientDraftActive]);
  return (
    <div>
      {}
      <div>
        <h2 className={styles.screenHeader} style={{ margin: 0 }}>New Patient</h2>
        <p className={styles.screenSub} style={{ marginTop: 4 }}>Create a new patient with demographics, baseline assessments, initial encounter and tasks.</p>
      </div>
      <NewPatientForm onCancel={() => {  }} onSave={() => {  }} />
    </div>
  );
}
