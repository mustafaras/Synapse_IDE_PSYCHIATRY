import { useMemo, useState } from "react";
import styles from "../styles/registry.module.css";
import { useRegistry, filterPatients, selectLastTwoScores } from "../registry/state";
import type { Patient, RiskLevel } from "../registry/types";
import NewPatientForm from "./NewPatientForm";
import { withDemoNotesAndAssessments } from "../registry/demoGenerate";
import { exportDemoCasesZip } from "../registry/exportDemo";
import { ExternalLink, Trash2 } from "lucide-react";

function relTime(ts?: number) {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor((diff % 86400000) / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${m}m ago`;
}

function lastEncounterWhen(p: Patient): number | undefined {
  return p.encounters?.slice().sort((a, b) => b.when - a.when)[0]?.when;
}

export default function Table({ onOpen }: { onOpen?: (id: string) => void }) {
  const { state, actions } = useRegistry();
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [showNew, setShowNew] = useState(false);

  const rows = useMemo(() => filterPatients(state), [state]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = page * pageSize;
  const slice = rows.slice(start, start + pageSize);



  const riskLabel = (lvl: RiskLevel) => (lvl <= 2 ? "Low" : lvl === 3 ? "Moderate" : lvl === 4 ? "High" : "Critical");

  return (
    <div className={styles.tableCard} role="region" aria-label="Registry table">
      {}
      <div className={styles.tableTopBar}>
        <div className={styles.cellMuted} aria-live="polite">{rows.length} patients</div>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <button
            className={styles.pill}
            onClick={async () => {

              const seedBase = Date.now() >>> 0;
              state.patients.forEach((p, idx) => {
                const { patient: next, addedAssessments } = withDemoNotesAndAssessments(p, seedBase + idx);
                const latest = (next.encounters || []).slice().sort((a,b)=>b.when-a.when)[0];
                if (latest) {
                  const slots = latest.noteSlots as any;
                  actions.setEncounterSlots(next.id, latest.id, {
                    summary: slots.summary,
                    plan: slots.plan,
                    vitals: slots.vitals,
                    outcome: slots.outcome,
                    refs: slots.refs,
                  } as any);
                }
                addedAssessments.forEach(a => actions.recordAssessment(next.id, a));
              });
              alert('Demo content populated in English. You can review in Timeline/Note.');
            }}
            title="Populate randomized English demo content into latest encounter and assessments"
          >
            Demo: Populate (EN)
          </button>
          <button
            className={styles.pill}
            onClick={() => exportDemoCasesZip(state.patients)}
            title="Export registry and per-patient snapshots to a ZIP"
          >
            Export cases
          </button>
          <button
            className={styles.primaryBtn}
            onClick={() => setShowNew(v => !v)}
            aria-expanded={showNew}
            aria-controls="new-patient-form"
          >
            {showNew ? "Cancel" : "New patient"}
          </button>
        </div>
      </div>
      {showNew && (
        <NewPatientForm
          onCancel={() => setShowNew(false)}
          onSave={() => { setShowNew(false); }}
        />
      )}
      <div className={styles.tableHeader} role="row">
        <div>Patient</div>
        <div>Last Encounter</div>
        <div>Risk</div>
        <div>Tags</div>
  <div>PHQ-9</div>
  <div>GAD-7</div>
  <div>BFCRS</div>
        <div>Open Tasks</div>
        <div>Actions</div>
      </div>

      <div className={styles.rows} role="table" aria-rowcount={rows.length}>
        {slice.map((p) => {
          const phq = selectLastTwoScores(p, "PHQ9");
          const gad = selectLastTwoScores(p, "GAD7");
          const bf = selectLastTwoScores(p, "BFCRS");
          const openTasks = (p.tasks ?? []).filter((t) => !t.done).length;
          const last = lastEncounterWhen(p);
          const selected = state.selectedPatientId === p.id;
          const setOpen = () => { actions.selectPatient(p.id); onOpen?.(p.id); };

          return (
            <div
              key={p.id}
              className={styles.row}
              role="row"
              aria-selected={selected}
              tabIndex={0}
              onClick={() => actions.selectPatient(p.id)}
              onKeyDown={(e) => {
                const key = e.key;
                if (key === "Enter" || key === " ") {
                  actions.selectPatient(p.id);
                }
              }}
            >
              <div>
                <div><strong>{p.name ?? "Anon"}</strong> <span className={styles.cellMuted}>• {p.id}</span></div>
                <div className={styles.cellMuted}>{p.age ? `${p.age}y` : "—"} / {p.sex ?? "—"}</div>
              </div>
              <div className={styles.cellMuted}>{relTime(last)}</div>
              <div>
                <span
                  className={`${styles.riskChip} ${styles['r' + p.risk as keyof typeof styles]}`}
                  aria-label={`Risk Grade ${p.risk} (${riskLabel(p.risk)})`}
                  title={`Risk Grade ${p.risk} (${riskLabel(p.risk)})`}
                >
                  <span className={styles.riskDot} aria-hidden="true" />
                  G{p.risk}
                </span>
              </div>
              <div className={styles.cellMuted}>{(p.tags ?? []).slice(0,3).join(", ") || "—"}</div>
              <div className={styles.cellMuted} title={
                phq.previous !== undefined && phq.latest !== undefined
                  ? `Prev: ${phq.previous} → Latest: ${phq.latest}`
                  : phq.latest !== undefined ? `Latest: ${phq.latest}` : undefined
              }>
                {phq.latest !== undefined
                  ? `${phq.latest}${phq.delta !== undefined ? ` (${phq.delta > 0 ? '+' : ''}${phq.delta})` : ''}`
                  : '—'}
              </div>
              <div className={styles.cellMuted} title={
                gad.previous !== undefined && gad.latest !== undefined
                  ? `Prev: ${gad.previous} → Latest: ${gad.latest}`
                  : gad.latest !== undefined ? `Latest: ${gad.latest}` : undefined
              }>
                {gad.latest !== undefined
                  ? `${gad.latest}${gad.delta !== undefined ? ` (${gad.delta > 0 ? '+' : ''}${gad.delta})` : ''}`
                  : '—'}
              </div>
              <div className={styles.cellMuted} title={
                bf.previous !== undefined && bf.latest !== undefined
                  ? `Prev: ${bf.previous} → Latest: ${bf.latest}`
                  : bf.latest !== undefined ? `Latest: ${bf.latest}` : undefined
              }>
                {bf.latest !== undefined
                  ? `${bf.latest}${bf.delta !== undefined ? ` (${bf.delta > 0 ? '+' : ''}${bf.delta})` : ''}`
                  : '—'}
              </div>
              <div className={styles.cellMuted}>{openTasks || "—"}</div>
              <div style={{ display: 'inline-flex', gap: 6 }}>
                <button
                  className={styles.iconBtn}
                  onClick={(e) => { e.stopPropagation(); setOpen(); }}
                  aria-label={`Open ${p.name ?? p.id}`}
                  title="Open"
                >
                  <ExternalLink size={14} />
                </button>
                {selected && (
                  <button
                    className={`${styles.dangerBtn} ${styles.iconBtn}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const ok = window.confirm(`Delete patient ${p.name ?? p.id}?`);
                      if (ok) actions.deletePatient(p.id);
                    }}
                    aria-label={`Delete patient ${p.name ?? p.id}`}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.cellMuted}>{rows.length} patients</span>
        <select
          className={styles.pageSelect}
          value={pageSize}
          onChange={(e) => { const v = Number((e.target as HTMLSelectElement).value); setPageSize(v); setPage(0); }}
          aria-label="Rows per page"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button className={styles.pill} onClick={() => setPage(Math.max(0, page-1))} disabled={page===0}>Prev</button>
        <span className={styles.cellMuted}>{page+1}/{pageCount}</span>
        <button className={styles.pill} onClick={() => setPage(Math.min(pageCount-1, page+1))} disabled={page>=pageCount-1}>Next</button>
      </div>
    </div>
  );
}


