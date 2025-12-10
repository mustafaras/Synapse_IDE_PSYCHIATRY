import React from "react";
import styles from "../styles/note.module.css";
import SlotEditorFormatBar from "./SlotEditorFormatBar.tsx";
import SlotEditorContentBridge from "./SlotEditorContentBridge.tsx";
import { NOTE_SECTION_DISCLAIMER } from "../Flows/legalCopy";


export interface NoteSectionSlot {
  slotId: string;

  title: string;
  description?: string;


  isOpen: boolean;
  onToggle: () => void;


  charCountLabel: string;
  lastSavedLabel: string;


  phaseMode: "live" | "polish";
  onTogglePhaseMode: () => void;
  onCleanTone: () => void;
  onTighten: () => void;
  onInsertTimestamp: () => void;


  contextNode: React.ReactNode;


  editorNode: React.ReactNode;


  guidanceNode?: React.ReactNode;


  containerClassName?: string;
  containerRef?: (el: HTMLDivElement | null) => void;
}

export interface NoteSectionsProps {
  slots: NoteSectionSlot[];
}

export default function NoteSections({ slots }: NoteSectionsProps) {
  return (
    <div className={styles.noteSectionsWrap}>
      {slots.map((slot) => (
        <section
          key={slot.slotId}
          className={[styles.slotContainer, slot.containerClassName].filter(Boolean).join(" ")}
          aria-labelledby={`slot-header-${slot.slotId}`}
          ref={slot.containerRef ?? undefined}
        >
          {}
          <div id={`slot-header-${slot.slotId}`} className={`${styles.slotHeaderRow} ${styles.cardHeader}`}>
            <div className={styles.slotHeaderLeft}>
              <button
                type="button"
                className={`${styles.slotTitle} ${styles.cardTitle}`}
                aria-expanded={slot.isOpen}
                aria-controls={`slot-body-${slot.slotId}`}
                onClick={(e) => {
                  e.stopPropagation();
                  slot.onToggle();
                }}
              >
                {slot.isOpen ? "▾" : "▸"} {slot.title}
              </button>
              {slot.description ? (
                <div className={`${styles.slotHint} ${styles.cardSub}`}>{slot.description}</div>
              ) : null}
            </div>
            <div className={styles.slotHeaderRight}>
              <span className={`${styles.slotHeaderMeta} ${styles.cardSub}`}>
                {slot.charCountLabel} · {slot.lastSavedLabel}
              </span>
            </div>
          </div>

          {}
          {slot.isOpen && (
            <div id={`slot-body-${slot.slotId}`} className={styles.slotBody}>
              {}
              <div className={styles.slotToolsRow}>
                {}
                <button
                  type="button"
                  className={styles.phaseToggleBtn || styles.iBtn}
                  aria-pressed={slot.phaseMode === "live"}
                  onClick={(e) => { e.stopPropagation(); slot.onTogglePhaseMode(); }}
                >
                  {slot.phaseMode === "live" ? "Live Capture" : "Polishing"}
                </button>

                {}
                <button
                  type="button"
                  className={styles.iBtn}
                  onClick={(e) => { e.stopPropagation(); slot.onCleanTone(); }}
                >
                  Clean Tone
                </button>

                <button
                  type="button"
                  className={styles.iBtn}
                  onClick={(e) => { e.stopPropagation(); slot.onTighten(); }}
                >
                  Tighten
                </button>

                <button
                  type="button"
                  className={styles.iBtn}
                  onClick={(e) => { e.stopPropagation(); slot.onInsertTimestamp(); }}
                >
                  + Timestamp
                </button>
              </div>

              {}
              <SlotEditorFormatBar targetRootId={`slot-body-${slot.slotId}`} />

              {}
              <div className={styles.slotContextBar}>{slot.contextNode}</div>

              {}
              <div className={styles.slotEditorArea}>
                {}
                <SlotEditorContentBridge slotId={slot.slotId} />
                {slot.editorNode}
              </div>

              {}
              {slot.guidanceNode ? (
                <div className={styles.slotGuidanceBlock}>{slot.guidanceNode}</div>
              ) : (
                <div className={styles.slotGuidanceBlock}>{NOTE_SECTION_DISCLAIMER}</div>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
