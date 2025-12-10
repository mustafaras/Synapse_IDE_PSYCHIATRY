import { useMemo } from "react";
import styles from "./consultantAI.module.css";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { buildCapacityStatement, buildFollowupTasks, buildHpiSkeleton, buildSafetyStatement } from "./consultantAiHelpers";

export default function ConsultantAI() {

  const age = useNewPatientDraftStore((s) => s.age);
  const sex = useNewPatientDraftStore((s) => String(s.sex || ""));
  const encLocation = useNewPatientDraftStore((s) => s.encounter.location);
  const encLegal = useNewPatientDraftStore((s) => s.encounter.legalStatus);
  const suicideRisk = useNewPatientDraftStore((s) => s.suicideRisk);
  const violenceRisk = useNewPatientDraftStore((s) => s.violenceRisk);
  const capacity = useNewPatientDraftStore((s) => s.capacity);

  const insertIntoEncounterHPI = useNewPatientDraftStore((s) => s.insertIntoEncounterHPI);
  const addTaskFromAI = useNewPatientDraftStore((s) => s.addTaskFromAI);


  const hpiSuggestion = useMemo(
    () => buildHpiSkeleton(
      { age, sex },
      { location: encLocation, legalStatus: encLegal },
      { suicideRisk }
    ),
    [age, sex, encLocation, encLegal, suicideRisk]
  );

  const safetySuggestion = useMemo(
    () => buildSafetyStatement({ suicideRisk, violenceRisk }),
    [suicideRisk, violenceRisk]
  );

  const capacitySuggestion = useMemo(
    () => buildCapacityStatement({ capacity }),
    [capacity]
  );

  const followupSuggestions = useMemo(
    () => buildFollowupTasks(
      { legalStatus: encLegal },
      { suicideRisk, violenceRisk }
    ),
    [encLegal, suicideRisk, violenceRisk]
  );

  return (
    <aside className={styles.aiRailRoot} aria-label="Consultant AI suggestions">
      {}
      <section className={styles.aiCard} aria-labelledby="hpi-title">
        <header className={styles.aiCardHeader}>
          <div id="hpi-title" className={styles.aiCardTitle}>HPI scaffold</div>
          <div className={styles.aiCardSub}>Draft opening line for HPI / Presenting complaint</div>
        </header>
        <div className={styles.aiCardBody}>
          <div className={styles.aiSnippetBlock}>
            <div className={styles.aiSnippetText}>
              {hpiSuggestion || "HPI template will appear once demographics / encounter / SI are entered."}
            </div>
            <button
              className={styles.aiInsertBtn}
              disabled={!hpiSuggestion}
              onClick={() => { if (hpiSuggestion) insertIntoEncounterHPI(hpiSuggestion); }}
            >
              Insert into HPI
            </button>
          </div>
        </div>
      </section>

      {}
      <section className={styles.aiCard} aria-labelledby="safety-title">
        <header className={styles.aiCardHeader}>
          <div id="safety-title" className={styles.aiCardTitle}>Safety language</div>
          <div className={styles.aiCardSub}>SI / HI phrasing with reassessment plan</div>
        </header>
        <div className={styles.aiCardBody}>
          <div className={styles.aiSnippetBlock}>
            <div className={styles.aiSnippetText}>
              {safetySuggestion || "Safety language will appear once safety fields are set."}
            </div>
            <button
              className={styles.aiInsertBtn}
              disabled={!safetySuggestion}
              onClick={() => { if (safetySuggestion) insertIntoEncounterHPI(safetySuggestion); }}
            >
              Insert into HPI
            </button>
          </div>
        </div>
      </section>

      {}
      <section className={styles.aiCard} aria-labelledby="capacity-title">
        <header className={styles.aiCardHeader}>
          <div id="capacity-title" className={styles.aiCardTitle}>Capacity / Insight</div>
          <div className={styles.aiCardSub}>Document capacity assessment explicitly</div>
        </header>
        <div className={styles.aiCardBody}>
          <div className={styles.aiSnippetBlock}>
            <div className={styles.aiSnippetText}>
              {capacitySuggestion || "Capacity statement will appear once capacity is rated."}
            </div>
            <button
              className={styles.aiInsertBtn}
              disabled={!capacitySuggestion}
              onClick={() => { if (capacitySuggestion) insertIntoEncounterHPI(capacitySuggestion); }}
            >
              Insert into HPI
            </button>
          </div>
        </div>
      </section>

      {}
      <section className={styles.aiCard} aria-labelledby="followup-title">
        <header className={styles.aiCardHeader}>
          <div id="followup-title" className={styles.aiCardTitle}>Follow-up tasks</div>
          <div className={styles.aiCardSub}>Structured safety / legal / follow-up actions</div>
        </header>
        <div className={styles.aiCardBody}>
          {followupSuggestions.length === 0 ? (
            <div className={styles.aiSnippetBlock}>
              <div className={styles.aiSnippetText}>
                Task suggestions will appear once safety / legal status is defined.
              </div>
            </div>
          ) : (
            followupSuggestions.map((t, idx) => (
              <div key={`${t.category}-${idx}`} className={styles.aiSnippetBlock}>
                <div className={styles.aiSnippetText}>
                  {t.text} <span className={styles.aiSnippetMeta}>[{t.category}, due {t.dueHint || "soon"}]</span>
                </div>
                <button
                  className={styles.aiInsertBtn}
                  onClick={() => addTaskFromAI(t.text, t.category, t.dueHint)}
                >
                  Add task
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
