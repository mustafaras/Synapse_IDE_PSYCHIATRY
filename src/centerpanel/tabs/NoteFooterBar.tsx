import React from "react";
import styles from "../styles/note.module.css";

export interface NoteFooterBarProps {

  activeSlotLabel: string;
  charCountLabel: string;
  updatedLabel: string;
  patientEncounterLabel?: string | null;


  snapshotInfoLabel: string;


  canEdit: boolean;
  onCopySlot: () => void;
  onClearSlot: () => void;
  onSnapshot: () => void;
  onOpenDiff: () => void;
  canOpenDiff?: boolean;


  exportOpen: boolean;
  onToggleExport: () => void;
  exportGaps?: { missingRisk?: boolean; missingFollow?: boolean };
  onExportCopyMarkdown: () => void;
  onExportCopyHTML: () => void;
  onExportDownloadHTML: () => void;
  onExportPrint: () => void;


  medicoLegalText: React.ReactNode;
  tipText?: React.ReactNode;
  flashMessage?: string | null;
}

export default function NoteFooterBar(props: NoteFooterBarProps) {
  const {
    activeSlotLabel,
    charCountLabel,
    updatedLabel,
    patientEncounterLabel,
    snapshotInfoLabel,
    canEdit,
    onCopySlot,
    onClearSlot,
    onSnapshot,
    onOpenDiff,
  exportOpen,
    onToggleExport,
  exportGaps,
    onExportCopyMarkdown,
    onExportCopyHTML,
    onExportDownloadHTML,
    onExportPrint,
    medicoLegalText,
    tipText,
    flashMessage,
  } = props;

  return (
    <footer className={`${styles.footerWrap} ${styles.noteFooterPad}`} role="contentinfo" aria-label="Note utilities and disclaimer">
      {}
      {flashMessage && (
        <div className={styles.statusFlash} role="status" aria-live="polite">{flashMessage}</div>
      )}

      {}
      <div className={styles.footerTopRow} role="toolbar" aria-label="Primary note actions">
        <div className={styles.footerActionsGroup}>
          <button className={`${styles.pillBase} ${styles.footerActionBtn} ${styles.iBtn}`} onClick={onCopySlot} title="Copy current slot" type="button">
            <span>Copy</span>
          </button>
          <button className={`${styles.pillBase} ${styles.footerActionBtn} ${styles.iBtn}`} onClick={onClearSlot} disabled={!canEdit} title="Clear this slot" type="button">
            <span>Clear</span>
          </button>

          <div className={styles.menuWrap}>
            <button
              className={`${styles.pillBase} ${styles.footerActionBtn} ${styles.iBtn}`}
              onClick={onToggleExport}
              title="Copy / Download / Print"
              aria-haspopup="menu"
              aria-expanded={exportOpen ? "true" : "false"}
              aria-controls="note-export-menu"
              type="button"
            >
              <span>Export</span>
            </button>
            {exportOpen && (
              <div className={styles.menu} role="menu" id="note-export-menu">
                {((exportGaps?.missingRisk) || (exportGaps?.missingFollow)) && (
                  <div className={styles.exportNotice} role="note" aria-live="polite">
                    <div className={styles.exportNoticeTitle}>Gentle check before export</div>
                    <ul className={styles.exportNoticeList}>
                      {exportGaps?.missingRisk && (<li>Risk context not clearly stated in Summary.</li>)}
                      {exportGaps?.missingFollow && (<li>Follow-up or plan next steps look incomplete.</li>)}
                    </ul>
                    <div className={styles.exportNoticeHint}>Export is still available below; this is informational only.</div>
                  </div>
                )}
                <button className={styles.menuItem} onClick={onExportCopyMarkdown} type="button">Copy Markdown</button>
                <button className={styles.menuItem} onClick={onExportCopyHTML} type="button">Copy HTML</button>
                <button className={styles.menuItem} onClick={onExportDownloadHTML} type="button">Download HTML</button>
                <button className={styles.menuItem} onClick={onExportPrint} type="button">Print…</button>
              </div>
            )}
          </div>

          <button className={`${styles.pillBase} ${styles.footerActionBtn} ${styles.iBtn}`} onClick={onSnapshot} disabled={!canEdit} title="Save a snapshot" type="button">
            <span>Snapshot</span>
          </button>
          <button className={`${styles.pillBase} ${styles.footerActionBtn} ${styles.iBtn}`} onClick={onOpenDiff} title="Compare vs last snapshot" type="button" disabled={props.canOpenDiff === false} aria-disabled={props.canOpenDiff === false ? true : undefined}>
            <span>Diff</span>
          </button>
        </div>

        <div className={styles.footerSideMetaGroup}>
          <span className={styles.metaText}>{snapshotInfoLabel}</span>
        </div>
      </div>

      {}
      <div className={styles.footerStatusRow}>
        <span>{activeSlotLabel}</span>
        <span className={styles.metaText}>{charCountLabel}</span>
        <span className={styles.metaText}>{updatedLabel}</span>
        {patientEncounterLabel ? <span>{patientEncounterLabel}</span> : null}
      </div>

      {}
      <div className={styles.footerDisclaimerBlock}>
        <div className={`${styles.footerDisclaimer} ${styles.disclaimer} ${styles.withDivider}`}>{medicoLegalText}</div>
        {tipText ? <div className={styles.footerTip}>{tipText}</div> : null}
      </div>
    </footer>
  );
}
