import React from "react";
import styles from "./clinical-snapshot-strip.module.css";

export type Severity = "ok" | "med" | "high" | "info";

export interface KvPill {
  id: string;
  label: string;
  value?: string;
  unit?: string;
  tooltip?: string;
  severity?: Severity;
  onClick?: () => void;
  href?: string;
}

export interface ClinicalSnapshotStripProps {
  infoMode: "overview" | "risk" | "meds" | "vitals" | "safety";
  onSelectInfoMode: (mode: ClinicalSnapshotStripProps["infoMode"]) => void;

  overviewPills: KvPill[];
  riskPills: KvPill[];
  medsPills: KvPill[];
  vitalsPills: KvPill[];
  safetyPills: KvPill[];

  actionRow?: React.ReactNode;
  stickyEnabled?: boolean;

  tone?: "default" | "in-header";
}

const MODE_LABEL: Record<ClinicalSnapshotStripProps["infoMode"], string> = {
  overview: "Overview",
  risk: "Risk",
  meds: "Meds",
  vitals: "Vitals",
  safety: "Safety",
};

export default function ClinicalSnapshotStrip(props: ClinicalSnapshotStripProps) {
  const {
    infoMode,
    onSelectInfoMode,
    overviewPills,
    riskPills,
    medsPills,
    vitalsPills,
    safetyPills,
    actionRow,
    stickyEnabled,
    tone = "default",
  } = props;

  const pills = infoMode === "overview"
    ? overviewPills
    : infoMode === "risk"
    ? riskPills
    : infoMode === "meds"
    ? medsPills
    : infoMode === "vitals"
    ? vitalsPills
    : safetyPills;

  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  function onTabsKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const modes = ["overview", "risk", "meds", "vitals", "safety"] as const;
    const curIdx = modes.indexOf(infoMode);
    let nextIdx = curIdx;
    if (e.key === "ArrowLeft") nextIdx = (curIdx - 1 + modes.length) % modes.length;
    if (e.key === "ArrowRight") nextIdx = (curIdx + 1) % modes.length;
    const next = modes[nextIdx];
    const btn = tabRefs.current[nextIdx];
    if (btn) {
      try { btn.focus(); } catch {}
    }
    onSelectInfoMode(next);
  }

  return (
    <div
      className={styles.stripWrap}
      role="region"
      aria-label="Clinical snapshot"
      data-sticky={stickyEnabled ? "on" : "off"}
      data-tone={tone}
    >
      <div
        className={styles.tabRow}
        role="tablist"
        aria-label="Snapshot modes"
        onKeyDown={onTabsKeyDown}
        tabIndex={0}
      >
        {(["overview","risk","meds","vitals","safety"] as const).map((mode, i) => {
          const isSel = infoMode === mode;
          if (isSel) {
            return (
              <button
                key={mode}
                role="tab"
                aria-selected="true"
                tabIndex={0}
                className={styles.tabPill}
                onClick={() => onSelectInfoMode(mode)}
                ref={(el) => { tabRefs.current[i] = el; }}
                type="button"
              >
                {MODE_LABEL[mode]}
              </button>
            );
          }
          return (
            <button
              key={mode}
              role="tab"
              tabIndex={-1}
              className={styles.tabPill}
              onClick={() => onSelectInfoMode(mode)}
              ref={(el) => { tabRefs.current[i] = el; }}
              type="button"
            >
              {MODE_LABEL[mode]}
            </button>
          );
        })}
      </div>

      <div className={styles.kvRow} aria-live="polite">
        {pills.map((p) => {
          const aria = `${p.label}: ${p.value ?? "—"}${p.unit ? ` ${p.unit}` : ""}`;

          const inner = (
            <>
              <span className={styles.kvLabel}>{p.label}</span>
              <span className={styles.kvValue}>
                {p.value ?? "—"}{p.unit ? ` ${p.unit}` : ""}
              </span>
            </>
          );

          const sev = p.severity || "info";

          if (p.href) {
            return (
              <a
                key={p.id}
                href={p.href}
                className={styles.metricPill}
                data-severity={sev}
                title={p.tooltip}
                aria-label={aria}
                target="_blank"
                rel="noreferrer"
              >
                {inner}
              </a>
            );
          }
          if (p.onClick) {
            return (
              <button
                key={p.id}
                onClick={p.onClick}
                className={styles.metricPill}
                data-severity={sev}
                title={p.tooltip}
                aria-label={aria}
                type="button"
              >
                {inner}
              </button>
            );
          }
          return (
            <span
              key={p.id}
              className={styles.metricPill}
              data-severity={sev}
              title={p.tooltip}
              aria-label={aria}
            >
              {inner}
            </span>
          );
        })}
      </div>

      {actionRow ? <div className={styles.actionRow}>{actionRow}</div> : null}
    </div>
  );
}
