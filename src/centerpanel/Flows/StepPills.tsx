import React, { useMemo, useRef } from "react";
import styles from "../styles/flows.module.css";
import type { StepPill } from "./flowTypes";

type StepPillsProps = {
  steps: StepPill[];
  currentIndex: number;
  onSelect: (i: number) => void;

  getPanelId?: (i: number) => string;
  getTabId?: (i: number) => string;
};


export default function StepPills({ steps, currentIndex, onSelect, getPanelId, getTabId }: StepPillsProps) {
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIdx = Math.max(0, Math.min(steps.length - 1, currentIndex));

  const ids = useMemo(() => {
    return steps.map((_, i) => ({
      tabId: getTabId ? getTabId(i) : undefined,
      panelId: getPanelId ? getPanelId(i) : undefined,
    }));
  }, [steps, getPanelId, getTabId]);

  const focusIndex = (i: number) => {

    setTimeout(() => btnRefs.current[i]?.focus(), 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { key } = e;
    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
    e.preventDefault();
    let next = activeIdx;
    if (key === "ArrowRight") next = (activeIdx + 1) % steps.length;
    if (key === "ArrowLeft") next = (activeIdx - 1 + steps.length) % steps.length;
    if (key === "Home") next = 0;
    if (key === "End") next = steps.length - 1;
    onSelect(next);
    focusIndex(next);
  };

  return (
    <div
      className={styles.stepPills}
      role="tablist"
      aria-label="Flow steps"
      onKeyDown={onKeyDown}
    >
      {steps.map((s, i) => {
        const active = i === activeIdx;
        return (
          <button
            key={s.key}
            role="tab"
            aria-selected={active}
            id={ids[i]?.tabId}
            aria-controls={ids[i]?.panelId}
            tabIndex={active ? 0 : -1}
            className={active ? `${styles.stepPill} ${styles.stepPillActive}` : styles.stepPill}
            onClick={() => onSelect(i)}
            ref={(el) => { btnRefs.current[i] = el; }}
            type="button"
          >
            <span className={styles.stepIndex}>{i + 1}</span>
            <span className={styles.stepLabel}>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
