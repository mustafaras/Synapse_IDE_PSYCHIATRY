import styles from "./newPatient.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { useEffect, useState } from "react";
import { buildHpiSkeleton } from "./consultantAiHelpers";

const LOCATIONS: Array<string> = ["OPD", "ED", "Inpatient", "Telehealth"];
const LEGAL_STATUS: Array<{ value: string; label: string }> = [
  { value: "voluntary", label: "Voluntary" },
  { value: "involuntary", label: "Involuntary / hold" },
  { value: "na", label: "N/A / not applicable" },
];

export default function EncounterCard() {
  const encounter = useNewPatientDraftStore(s => s.encounter);
  const setWhen = useNewPatientDraftStore(s => s.setEncounterWhen);
  const setLocation = useNewPatientDraftStore(s => s.setEncounterLocation);
  const setLegalStatus = useNewPatientDraftStore(s => s.setEncounterLegalStatus);
  const setHpiText = useNewPatientDraftStore(s => s.setEncounterHpiText);
  const commitEncounterDraft = useNewPatientDraftStore(s => s.commitEncounterDraft);
  const resetDraft = useNewPatientDraftStore(s => s.resetDraft);
  const insertIntoEncounterHPI = useNewPatientDraftStore(s => s.insertIntoEncounterHPI);
  const age = useNewPatientDraftStore(s => s.age);
  const sex = useNewPatientDraftStore(s => s.sex);
  const suicideRisk = useNewPatientDraftStore(s => s.suicideRisk);
  const [committedAt, setCommittedAt] = useState<number | null>(null);
  const errors = useNewPatientDraftStore(s => s.newPatientErrors);

  useEffect(() => {
    if (committedAt == null) return;
    const id = setTimeout(() => setCommittedAt(null), 2000);
    void id;
  }, [committedAt]);
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          Initial encounter
        </div>
      </header>
      <div className={styles.cardBody}>
        <div className={styles.rowGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="enc-when">When</label>
            <input
              id="enc-when"
              className={`${styles.fieldInput} ${errors?.encounter?.when ? styles.fieldError : ''}`}
              type="datetime-local"
              value={encounter.when || ''}
              onChange={(e) => setWhen((e.target as HTMLInputElement).value)}
              aria-invalid={errors?.encounter?.when ? true : undefined}
              aria-describedby={errors?.encounter?.when ? 'enc-when-error' : undefined}
            />
            {errors?.encounter?.when ? (
              <div id="enc-when-error" className={styles.errorText}>{errors.encounter.when}</div>
            ) : null}
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="enc-loc">Location</label>
            <select
              id="enc-loc"
              className={styles.fieldSelect}
              value={encounter.location || ""}
              onChange={(e) => setLocation((e.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              {LOCATIONS.map((k) => (<option key={k} value={k}>{k}{k === "OPD" ? " (outpatient)" : k === "ED" ? " (emergency)" : ""}</option>))}
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="enc-legal">Legal status</label>
            <select
              id="enc-legal"
              className={styles.fieldSelect}
              value={encounter.legalStatus || ""}
              onChange={(e) => setLegalStatus((e.target as HTMLSelectElement).value)}
            >
              <option value="">Select...</option>
              {LEGAL_STATUS.map(({ value, label }) => (<option key={value} value={value}>{label}</option>))}
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="enc-hpi">HPI / Presenting complaint</label>
          <textarea
            id="enc-hpi"
            className={styles.fieldTextarea}
            value={encounter.hpiText || ''}
            onChange={(e) => setHpiText((e.target as HTMLTextAreaElement).value)}
            placeholder="Example: 43-year-old female presenting with 3-week history of worsening depression, poor sleep, passive SI without plan; recent job loss and marital conflict..."
          />
        </div>

        {}
        <div className={styles.aiBlock} aria-label="HPI scaffold suggestion">
          <div className={styles.aiBlockHeader}>HPI scaffold</div>
          <div className={styles.aiBlockSub}>Draft opening line for HPI / Presenting complaint</div>
          <div className={styles.aiBlockText}>
            {buildHpiSkeleton(
              { age, sex: String(sex || "") },
              { location: encounter.location, legalStatus: encounter.legalStatus },
              { suicideRisk }
            ) || "HPI template will appear once demographics / encounter / SI are entered."}
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!buildHpiSkeleton({ age, sex: String(sex || "") }, { location: encounter.location, legalStatus: encounter.legalStatus }, { suicideRisk })}
            onClick={() => {
              const txt = buildHpiSkeleton({ age, sex: String(sex || "") }, { location: encounter.location, legalStatus: encounter.legalStatus }, { suicideRisk });
              if (txt) insertIntoEncounterHPI(txt);
            }}
          >
            Insert into HPI
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => { try { commitEncounterDraft(); setCommittedAt(Date.now()); } catch {} }}
          >
            Add encounter
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => { try { resetDraft(); setCommittedAt(null); } catch {} }}
          >
            Clear
          </button>
          {committedAt != null ? (
            <span aria-live="polite" style={{ fontSize: 11, opacity: 0.7 }}>Committed</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
