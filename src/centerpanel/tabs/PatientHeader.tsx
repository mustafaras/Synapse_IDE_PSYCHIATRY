import React from "react";
import styles from "../styles/patient-header.module.css";

export interface PatientHeaderProps {

  patientDisplayName: string;
  patientId?: string;
  ageSexLabel?: string;
  riskBadges?: Array<{ label: string; severity?: "low" | "med" | "high" }>;
  tagBadges?: string[];


  encounterLabel?: string;
  lastUpdatedLabel: string;
  snapshotInfo?: string;


  autosaveLabel?: string;
  actionsNode?: React.ReactNode;


  safetyAlertText?: string;
  safetyAlertSeverity?: "med" | "high";


  belowNode?: React.ReactNode;
}

export default function PatientHeader(props: PatientHeaderProps) {
  const {
    patientDisplayName,
    patientId,
    ageSexLabel,
    riskBadges = [],
    tagBadges = [],
    encounterLabel,
    lastUpdatedLabel,
    snapshotInfo,
    autosaveLabel,
    actionsNode,
    safetyAlertText,
    safetyAlertSeverity,
    belowNode,
  } = props;

  const alertStyle: React.CSSProperties | undefined = safetyAlertText
    ? {
        backgroundColor:
          safetyAlertSeverity === "high"
            ? "var(--risk-high-bg)"
            : "var(--risk-med-bg)",
        color:
          safetyAlertSeverity === "high"
            ? "var(--risk-high-fg)"
            : "var(--risk-med-fg)",
      }
    : undefined;


  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const setVar = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      try {
        document.documentElement.style.setProperty("--patientHeaderHeight", `${h}px`);
      } catch {}
    };
    setVar();
    let ro: ResizeObserver | undefined;
    try {
      ro = new ResizeObserver(() => setVar());
      ro.observe(el);
    } catch {

    }
    window.addEventListener("resize", setVar);
    return () => {
      window.removeEventListener("resize", setVar);
      try { ro?.disconnect(); } catch {}
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.headerWrap} ${styles.patientHeaderWrap}`} role="region" aria-label="Patient triage header">
      <div className={styles.headerRow}>
        {}
        <div className={styles.zoneLeft}>
          <span className={styles.hName}>{patientDisplayName || "Patient"}</span>
          {patientId && (
            <span className={styles.headerPill} title="Patient ID">{String(patientId)}</span>
          )}
          {ageSexLabel && <span className={styles.headerPill}>{String(ageSexLabel)}</span>}
          {riskBadges.map((r, idx) => (
            <span
              key={`${r.label}-${idx}`}
              className={styles.headerPill}
              style={{
                backgroundColor:
                  r.severity === "high"
                    ? "var(--risk-high-bg)"
                    : r.severity === "med"
                    ? "var(--risk-med-bg)"
                    : undefined,
                color:
                  r.severity === "high"
                    ? "var(--risk-high-fg)"
                    : r.severity === "med"
                    ? "var(--risk-med-fg)"
                    : undefined,
              }}
            >
              {String(r.label)}
            </span>
          ))}
          {tagBadges.map((t) => (
            <span key={t} className={styles.headerPill} aria-label="Tag">
              {String(t)}
            </span>
          ))}
        </div>

        {}
        <div className={styles.zoneCenter}>
          {encounterLabel && <span className={styles.metaTextLocal}>{String(encounterLabel)}</span>}
          <span className={styles.metaTextLocal}>{String(lastUpdatedLabel)}</span>
          {snapshotInfo && <span className={styles.metaTextLocal}>{String(snapshotInfo)}</span>}
        </div>

        {}
        <div className={styles.zoneRight}>
          {autosaveLabel && <span className={styles.metaTextLocal}>{String(autosaveLabel)}</span>}
          {actionsNode && <div className={styles.actions}>{actionsNode}</div>}
        </div>
      </div>

      {safetyAlertText && (
        <div className={styles.patientHeaderAlert} style={alertStyle} role="alert" aria-live="polite">
          {String(safetyAlertText)}
        </div>
      )}
      {belowNode ? (
        <div>{belowNode}</div>
      ) : null}
    </div>
  );
}
