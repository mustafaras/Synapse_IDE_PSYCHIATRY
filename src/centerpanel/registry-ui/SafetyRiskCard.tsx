import styles from "./newPatient.module.css";
import type { RiskLevel, Tag } from "../registry/types";
import { useNewPatientDraftStore } from "../../stores/useNewPatientDraftStore";
import { getRiskGradeInfo } from "../rail/riskGrades";
import { buildCapacityStatement, buildSafetyStatement } from "./consultantAiHelpers";
import {
  CAPACITY_OPTIONS,
  SUICIDE_RISK_OPTIONS,
  VIOLENCE_RISK_OPTIONS,
} from "./safetyEnums";

const AVAILABLE_TAGS: Tag[] = ["SUD", "Bipolar", "FEP", "Elderly", "PostPartum", "Trauma", "Custom"];
const AVAILABLE_RISKS: RiskLevel[] = [1, 2, 3, 4, 5];

export default function SafetyRiskCard() {

  const risk = useNewPatientDraftStore(s => s.risk);
  const setRisk = useNewPatientDraftStore(s => s.setRisk);
  const tags = useNewPatientDraftStore(s => s.tags);
  const toggleTag = useNewPatientDraftStore(s => s.toggleTag);

  const suicideRisk = useNewPatientDraftStore(s => s.suicideRisk);
  const violenceRisk = useNewPatientDraftStore(s => s.violenceRisk);
  const capacity = useNewPatientDraftStore(s => s.capacity);
  const setSuicideRisk = useNewPatientDraftStore(s => s.setSuicideRisk);
  const setViolenceRisk = useNewPatientDraftStore(s => s.setViolenceRisk);
  const setCapacity = useNewPatientDraftStore(s => s.setCapacity);
  const insertIntoEncounterHPI = useNewPatientDraftStore(s => s.insertIntoEncounterHPI);
  const errors = useNewPatientDraftStore(s => s.newPatientErrors);
  const riskBorderClass = (risk && risk >= 1 && risk <= 5) ? (styles as any)[`critRiskG${risk}`] : "";

  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <div className={styles.cardTitle}>Safety &amp; Risk</div>
        <div className={styles.cardSub}>Document red flags that are clinically and legally relevant.</div>
      </header>
      <div className={styles.cardBody}>
        {}
        <div className={`${styles.row} ${styles.critBorder} ${riskBorderClass || ''}`}>
          <div className={styles.fieldLabel}>Risk grade</div>
          <div
            role="radiogroup"
            aria-label="Risk grade"
            aria-invalid={errors?.risk?.grade ? true : undefined}
            aria-describedby={`riskHelp${errors?.risk?.grade ? ' riskError' : ''}`.trim()}
            className={`${styles.chipRow} ${errors?.risk?.grade ? styles.fieldError : ''}`}
          >
            {AVAILABLE_RISKS.map((lvl) => {
              const info = getRiskGradeInfo(lvl);
              const isSelected = risk === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  className={`${styles.riskChip} ${isSelected ? styles.riskChipActive : ''} ${styles[info.colorClass] || ''}`}
                  onClick={() => setRisk(lvl)}
                  title={info.tooltip}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  aria-describedby="riskHelp"
                  onKeyDown={(e) => {
                    const key = e.key;
                    const currentIndex = AVAILABLE_RISKS.indexOf(risk as RiskLevel);
                    if (key === 'ArrowRight' || key === 'ArrowDown') {
                      e.preventDefault();
                      const next = (typeof currentIndex === 'number' && currentIndex >= 0) ? Math.min(currentIndex + 1, AVAILABLE_RISKS.length - 1) : 0;
                      setRisk(AVAILABLE_RISKS[next]);
                    } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = (typeof currentIndex === 'number' && currentIndex >= 0) ? Math.max(currentIndex - 1, 0) : 0;
                      setRisk(AVAILABLE_RISKS[prev]);
                    } else if (key === 'Home') {
                      e.preventDefault();
                      setRisk(AVAILABLE_RISKS[0]);
                    } else if (key === 'End') {
                      e.preventDefault();
                      setRisk(AVAILABLE_RISKS[AVAILABLE_RISKS.length - 1]);
                    } else if (key === ' ' || key === 'Enter') {
                      e.preventDefault();
                      setRisk(lvl);
                    }
                  }}
                >
                  {info.uiLabel}
                </button>
              );
            })}
          </div>
          {}
          <div id="riskHelp" role="tooltip" className={`${styles.tooltip} ${styles.tooltipHidden}`}>
            Risk grade 1–5: 1 Minimal, 2 Low, 3 Moderate, 4 High, 5 Imminent. Use arrow keys to move and Space to select.
          </div>
          {errors?.risk?.grade ? (
            <div id="riskError" className={styles.errorText}>Select one risk grade (1–5).</div>
          ) : null}
        </div>

        {}
        <div className={`${styles.row} ${styles.critBorder} ${riskBorderClass || ''}`}>
          <div className={styles.fieldLabel}>Acute safety check</div>
          <div className={styles.rowGrid}>
            {}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="suicideRiskSelect">
                Suicide / Self-harm <span className={styles.infoTooltip} title="Document most concerning current level of suicidal ideation / self-harm intent.">ⓘ</span>
              </label>
              <select
                className={styles.fieldSelect}
                value={suicideRisk || ""}
                onChange={(e) => setSuicideRisk(e.target.value)}
                id="suicideRiskSelect"
              >
                <option value="">Select...</option>
                {SUICIDE_RISK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} title={opt.tooltip}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="violenceRiskSelect">
                Violence / Agitation <span className={styles.infoTooltip} title="Document level of agitation / threats / violence risk.">ⓘ</span>
              </label>
              <select
                className={styles.fieldSelect}
                value={violenceRisk || ""}
                onChange={(e) => setViolenceRisk(e.target.value)}
                id="violenceRiskSelect"
              >
                <option value="">Select...</option>
                {VIOLENCE_RISK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} title={opt.tooltip}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="capacitySelect">
                Capacity / Insight <span className={styles.infoTooltip} title="Can patient understand situation and communicate informed decisions?">ⓘ</span>
              </label>
              <select
                className={styles.fieldSelect}
                value={capacity || ""}
                onChange={(e) => setCapacity(e.target.value)}
                id="capacitySelect"
              >
                <option value="">Select...</option>
                {CAPACITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} title={opt.tooltip}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {}
        <div className={styles.row}>
          <div className={styles.fieldLabel}>Clinical tags</div>
          <div className={styles.chipRow} role="group" aria-label="Clinical tags" aria-describedby="tagsHelp">
            {AVAILABLE_TAGS.map((t) => {
              const onClick = () => toggleTag(t);
              const isOn = tags.includes(t);
              const titles: Record<string,string> = {
                SUD: "Substance use disorder / active substance involvement",
                Bipolar: "Bipolar-spectrum features / history",
                FEP: "First-episode psychosis / early psychotic features",
                Elderly: "Geriatric context / age-related considerations",
                PostPartum: "Peripartum / postpartum mental health context",
                Trauma: "Trauma history / PTSD features",
                Custom: "Custom clinical tag",
              };
              return (
                <button
                  type="button"
                  key={t}
                  className={`${styles.tagChip} ${isOn ? styles.tagChipActive : ''}`}
                  onClick={onClick}
                  title={titles[t] || t}
                  role="checkbox"
                  aria-checked={isOn}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onClick(); }
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div id="tagsHelp" role="tooltip" className={`${styles.tooltip} ${styles.tooltipHidden}`}>
            Toggle clinical tags that apply. Press Space to toggle a tag.
          </div>
        </div>

        {}
        <div className={styles.aiBlock} aria-label="Safety and capacity language suggestions">
          <div className={styles.aiBlockHeader}>Safety language</div>
          <div className={styles.aiBlockSub}>SI / HI phrasing with reassessment plan</div>
          <div className={styles.aiBlockText}>{buildSafetyStatement({ suicideRisk, violenceRisk }) || "Safety language will appear once safety fields are set."}</div>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!suicideRisk && !violenceRisk}
            onClick={() => {
              const txt = buildSafetyStatement({ suicideRisk, violenceRisk });
              if (txt) insertIntoEncounterHPI(txt);
            }}
          >
            Insert into HPI
          </button>

          <div className={styles.aiBlockHeader} style={{ marginTop: 6 }}>Capacity / Insight</div>
          <div className={styles.aiBlockSub}>Document capacity assessment explicitly</div>
          <div className={styles.aiBlockText}>{buildCapacityStatement({ capacity }) || "Capacity statement will appear once capacity is rated."}</div>
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!capacity}
            onClick={() => {
              const txt = buildCapacityStatement({ capacity });
              if (txt) insertIntoEncounterHPI(txt);
            }}
          >
            Insert into HPI
          </button>
        </div>
      </div>
    </section>
  );
}
