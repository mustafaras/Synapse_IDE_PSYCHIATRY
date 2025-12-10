import styles from "./newPatient.module.css";
import type { Patient } from "../registry/types";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";

export default function DemographicsCard() {
  const name = useNewPatientDraftStore(s => s.name);
  const setName = useNewPatientDraftStore(s => s.setName);
  const mrn = useNewPatientDraftStore(s => s.id);
  const setMrn = useNewPatientDraftStore(s => s.setMrn);
  const age = useNewPatientDraftStore(s => s.age);
  const setAge = useNewPatientDraftStore(s => s.setAge);
  const sex = useNewPatientDraftStore(s => s.sex);
  const setSex = useNewPatientDraftStore(s => s.setSex);
  const errors = useNewPatientDraftStore(s => s.newPatientErrors);
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardTitle}>Demographics</div>
        <div className={styles.cardSub}>Identify the patient for this intake. MRN/ID can be auto-assigned if left blank.</div>
      </header>
      <div className={styles.cardBody}>
        <div className={styles.rowGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="np-name">Name</label>
            <input
              id="np-name"
              className={`${styles.fieldInput} ${errors?.demographics?.name ? styles.fieldError : ''}`}
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Jane Doe"
              aria-invalid={errors?.demographics?.name ? true : undefined}
              aria-describedby={errors?.demographics?.name ? 'np-name-error' : undefined}
            />
            {errors?.demographics?.name ? (
              <div id="np-name-error" className={styles.errorText}>Name or MRN/ID is required.</div>
            ) : null}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="np-mrn">MRN / ID</label>
            <input
              id="np-mrn"
              className={`${styles.fieldInput} ${errors?.demographics?.name ? styles.fieldError : ''}`}
              value={mrn}
              onChange={(e) => setMrn((e.target as HTMLInputElement).value)}
              placeholder="Auto if empty"
              aria-invalid={errors?.demographics?.name ? true : undefined}
              aria-describedby={errors?.demographics?.name ? 'np-mrn-error' : undefined}
            />
            {errors?.demographics?.name ? (
              <div id="np-mrn-error" className={styles.errorText}>Name or MRN/ID is required.</div>
            ) : null}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="np-age">Age</label>
            <input id="np-age" className={styles.fieldInput} value={age} onChange={(e) => setAge((e.target as HTMLInputElement).value)} placeholder="e.g. 43" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="np-sex">Sex</label>
            <select id="np-sex" className={styles.fieldSelect} value={sex ?? "F"} onChange={(e) => setSex((e.target as HTMLSelectElement).value as Patient["sex"]) }>
              <option value="F">F</option>
              <option value="M">M</option>
              <option value="X">X</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
