import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/tools.module.css";


import { filterPatients, useRegistry } from "../registry/state";
import type { Filter, Patient } from "../registry/types";


import type { DeidPolicy } from "./lib/assemble";
import PreviewPanel from "./PreviewPanel";
import ExportBar from "./ExportBar";
import ConsultonPanel from "./ConsultonPanel";
import { flags } from "../../config/flags";


const LS = {
  scope: "tools.scope",
  deid: "tools.deidPreset",
  consent: "tools.consent"
} as const;


const ID_SCOPE = "tools-scope" as const;
const ID_PREVIEW = "tools-preview" as const;
const ID_EXPORT = "tools-export" as const;
const ID_CONSULTON = "tools-consulton" as const;

type ScopeKind = "encounter" | "patient" | "cohort";
type DeidPreset = "none" | "limited" | "safe";


function relTime(ts?: number): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor((diff % 86400000) / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor((diff % 3600000) / 60000);
  if (m > 0) return `${m}m ago`;
  return "just now";
}


const sx = (v?: string | number | null) => (v === undefined || v === null || v === "" ? "—" : String(v));


const plural = (n: number, one: string, many?: string) => (n === 1 ? `1 ${one}` : `${n} ${many ?? `${one}s`}`);


function describeFilter(filter: Filter, totalCount: number, filteredCount: number): string {

  const isAll = filteredCount === totalCount;
  if (isAll) return "Cohort: All";

  const bits: string[] = [];
  if (filter.cohorts && filter.cohorts.length && !(filter.cohorts.length === 1 && filter.cohorts[0] === "All")) {
    bits.push(`Scope:${filter.cohorts.join("+")}`);
  }
  if (filter.risk && filter.risk.length) {
    bits.push(`Risk:${filter.risk.join(",")}`);
  }
  if (filter.tags && filter.tags.length) {
    bits.push(`Tags:${filter.tags.join(",")}`);
  }
  const q = (filter as unknown as { search?: string }).search;
  if (q && String(q).trim()) bits.push(`Search:“${String(q).trim()}”`);
  return bits.length ? `Cohort: ${bits.join(" • ")}` : "Cohort: Filters active";
}


function useRovingRadios(values: ScopeKind[], current: ScopeKind, onChange: (v: ScopeKind) => void) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  useEffect(() => { refs.current = refs.current.slice(0, values.length); }, [values.length]);
  function onKeyDown(e: React.KeyboardEvent) {
    const idx = values.indexOf(current);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = values[(idx + 1) % values.length];
      onChange(next);
      refs.current[values.indexOf(next)]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = values[(idx - 1 + values.length) % values.length];
      onChange(prev);
      refs.current[values.indexOf(prev)]?.focus();
    }
  }
  return { refs, onKeyDown };
}


function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch {
    el.scrollIntoView();
  }
}

export default function ToolsActionPanel() {

  const { state } = useRegistry();
  const selectedPatientId = state.selectedPatientId;
  const selectedEncounterId = state.selectedEncounterId;
  const patients = state.patients ?? [];
  const activePatient: Patient | undefined = patients.find(p => p.id === selectedPatientId);


  const aliasOrName = sx(activePatient?.name);
  const pid = sx(activePatient?.id ?? selectedPatientId);
  const age = activePatient?.age != null ? String(activePatient.age) : "—";
  const sex = sx(activePatient?.sex);
  const risk = activePatient?.risk != null ? String(activePatient.risk) : "—";

  const encounters = activePatient?.encounters ?? [];
  const lastEnc = encounters.length ? [...encounters].sort((a, b) => (b.when ?? 0) - (a.when ?? 0))[0] : undefined;
  const lastEncRel = relTime(lastEnc?.when);


  const cohortRows = useMemo(() => filterPatients(state), [state]);
  const cohortCount = cohortRows.length;
  const totalCount = patients.length;
  const cohortDesc = describeFilter(state.filter, totalCount, cohortCount);


  const [scope, setScope] = useState<ScopeKind>(() => {
    const raw = localStorage.getItem(LS.scope) as ScopeKind | null;
    return raw === "encounter" || raw === "patient" || raw === "cohort" ? raw : "patient";
  });
  const [deid, setDeid] = useState<DeidPreset>(() => {
    const raw = localStorage.getItem(LS.deid) as DeidPreset | null;
    return raw === "none" || raw === "limited" || raw === "safe" ? raw : "limited";
  });
  const [consent, setConsent] = useState<boolean>(() => localStorage.getItem(LS.consent) === "true");


  useEffect(() => { localStorage.setItem(LS.scope, scope); }, [scope]);
  useEffect(() => { localStorage.setItem(LS.deid, deid); }, [deid]);
  useEffect(() => { localStorage.setItem(LS.consent, String(consent)); }, [consent]);


  const hasActiveEncounter = Boolean(selectedEncounterId) || (encounters?.length ?? 0) > 0;
  const hasActivePatient = Boolean(activePatient);

  const scopeCountSummary = useMemo(() => {
    switch (scope) {
      case "encounter": return hasActiveEncounter ? "1 encounter" : "0 encounters";
      case "patient":   return hasActivePatient ? "1 patient" : "0 patients";
      case "cohort":    return plural(cohortCount, "patient");
      default:          return "—";
    }
  }, [scope, hasActiveEncounter, hasActivePatient, cohortCount]);


  const encounterDisabled = !hasActiveEncounter;


  const segValues: ScopeKind[] = ["encounter", "patient", "cohort"];
  const { refs: segRefs, onKeyDown: onSegKey } = useRovingRadios(segValues, scope, setScope);


  const policy: DeidPolicy = useMemo(() => ({
    preset: deid,
    seed: "tools-preview-v1",
    anonymize: deid !== "none",
  }), [deid]);


  return (
    <div
      className={`${styles.wrap} ${styles.toolsCenter} ${styles.themeAmber} ${styles.deepBlack}`}
      role="main"
      aria-labelledby="tools-title"
      data-testid="tools-center"

    >
      {}
      <nav className={styles.skipLinks} aria-label="Skip links">
        <a className={styles.skipLink} href={`#${ID_SCOPE}`}>Skip to Export scope</a>
        <a className={styles.skipLink} href={`#${ID_PREVIEW}`}>Skip to Preview</a>
        <a className={styles.skipLink} href={`#${ID_EXPORT}`}>Skip to Export actions</a>
      </nav>
      {}
      <header className={styles.cardHeader} role="region" aria-label="Tools header" data-testid="tools-header">
        <div id="tools-title" className={styles.cardTitle}>Tools</div>
        <div className={styles.cardSub}>Center actions &amp; exports</div>

        {}
        <div className={styles.hstack} style={{ marginTop: 8 }}>
          <div className={styles.seg} role="tablist" aria-label="Tools sections">
            {}
            <button
              type="button"
              role="tab"
              className={styles.segBtn}
              aria-selected="false"
              onClick={() => scrollToId(ID_SCOPE)}
              data-testid="tools-nav-scope"
            >
              Scope
            </button>

            {}
            <button
              type="button"
              role="tab"
              className={styles.segBtn}
              aria-selected="false"
              onClick={() => scrollToId(ID_PREVIEW)}
              data-testid="tools-nav-preview"
            >
              Preview
            </button>

            {}
            <button
              type="button"
              role="tab"
              className={styles.segBtn}
              aria-selected="false"
              onClick={() => scrollToId(ID_CONSULTON)}
              data-testid="tools-nav-consult"
              title={flags.consultonAI ? undefined : "(flag off in this env; forced visible for demo)"}
            >
              Consult
            </button>

            {}
            <button
              type="button"
              role="tab"
              className={styles.segBtn}
              aria-selected="false"
              onClick={() => scrollToId(ID_EXPORT)}
              data-testid="tools-nav-export"
            >
              Export
            </button>
          </div>
        </div>
        {}
      </header>

      {}
      <section
        id={ID_SCOPE}
        className={`${styles.panel} ${styles.accentMod} ${styles.panelAmber}`}
        role="region"
        aria-labelledby="scope-heading"
        tabIndex={-1}
        data-testid="tools-card-scope"
      >
        <h2 id="scope-heading" className={styles.srOnly}>Export scope</h2>
        <div className={`${styles.cardHeader} ${styles.cardHeaderV2}`}>
          <div className={`${styles.cardTitle} ${styles.cardTitleV2} ${styles.cardTitleAmber}`}>Export scope</div>
          <div className={`${styles.cardSub} ${styles.cardSubV2}`}>{scopeCountSummary}</div>
        </div>

        {}
        <div className={`${styles.callout} ${styles.calloutInfo}`}>
          <div className={styles.calloutHeader}>
            <div className={styles.calloutTitle}>Active Patient</div>
            <div className={styles.calloutMeta} role="status" aria-live="polite">Last encounter {lastEncRel}</div>
          </div>
          <div className={styles.calloutBody}>
            <div className={styles.kvRow}>
              <span className={`${styles.kvKey} ${styles.labelSmall}`}>Name</span>
              <span className={`${styles.kvVal} ${styles.textStronger}`}>{aliasOrName}</span>
              <span className={`${styles.kvKey} ${styles.labelSmall}`}>ID</span>
              <span className={`${styles.kvVal} ${styles.textStronger}`}>{pid}</span>
              <span className={`${styles.kvKey} ${styles.labelSmall}`}>Age</span>
              <span className={`${styles.kvVal} ${styles.textStronger}`}>{age}</span>
              <span className={`${styles.kvKey} ${styles.labelSmall}`}>Sex</span>
              <span className={`${styles.kvVal} ${styles.textStronger}`}>{sex}</span>
              <span className={`${styles.kvKey} ${styles.labelSmall}`}>Risk</span>
              <span className={`${styles.kvVal} ${styles.textStronger}`}>G{risk}</span>
            </div>
          </div>
        </div>

        {}
        <div style={{ marginTop: 10 }}>
          <div className={styles.labelSmall} style={{ marginBottom: 6 }}>Select scope</div>
          <div
            className={styles.seg}
            role="radiogroup"
            aria-label="Export scope selector"
            tabIndex={0}
            onKeyDown={onSegKey}
          >
            {}
            <button
              ref={(el) => { segRefs.current[0] = el; }}
              type="button"
              role="radio"
              aria-checked={scope === "encounter"}
              aria-describedby={encounterDisabled ? "encounter-hint" : undefined}
              aria-disabled={encounterDisabled || undefined}
              disabled={encounterDisabled}
              className={styles.segBtn}
              data-testid="scope-encounter"
              onClick={() => !encounterDisabled && setScope("encounter")}
            >
              Current Encounter
            </button>

            {}
            <button
              ref={(el) => { segRefs.current[1] = el; }}
              type="button"
              role="radio"
              aria-checked={scope === "patient"}
              className={styles.segBtn}
              data-testid="scope-patient"
              onClick={() => setScope("patient")}
            >
              Current Patient
            </button>

            {}
            <button
              ref={(el) => { segRefs.current[2] = el; }}
              type="button"
              role="radio"
              aria-checked={scope === "cohort"}
              className={styles.segBtn}
              data-testid="scope-cohort"
              onClick={() => setScope("cohort")}
            >
              Cohort
            </button>
          </div>

          {encounterDisabled ? (
            <div id="encounter-hint" className={styles.meta} style={{ marginTop: 6 }}>
              (No active encounter)
            </div>
          ) : null}
        </div>

        {}
        <div className={styles.hstack} style={{ marginTop: 10, alignItems: 'baseline' }}>
          <div className={styles.meta} aria-live="polite"><strong>{cohortDesc}</strong></div>
          <div className={`${styles.pill} ${styles.pillAmber}`} aria-live="polite">{scopeCountSummary}</div>
        </div>

        {}
        <details style={{ marginTop: 12 }}>
          <summary aria-label="Additional options" className={styles.labelSmall}>Additional options</summary>
          <div className={styles.vstack} style={{ gap: 8, marginTop: 8 }}>
            {}
            <label className={styles.row} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
              <span className={styles.labelSmall}>De-ID preset</span>
              <select
                className={styles.select}
                aria-label="De-identification preset"
                value={deid}
                onChange={(e) => setDeid(e.target.value as DeidPreset)}
                data-testid="deid-preset"
              >
                <option value="none">none (raw)</option>
                <option value="limited">limited</option>
                <option value="safe">safe</option>
              </select>
            </label>

            {}
            <label className={styles.hstack} style={{ alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                aria-label="Consent obtained"
                data-testid="consent-checkbox"
              />
              <span className={styles.labelSmall}>Consent obtained</span>
              <span className={styles.meta}>(optional; show only if policy requires)</span>
            </label>

            <div className={styles.meta}>
              De-ID presets will be applied deterministically in later phases, and the Preview will reflect your choice.
            </div>
          </div>
        </details>
      </section>

      {}
      <section
        id={ID_PREVIEW}
        className={`${styles.panel} ${styles.accentLow} ${styles.panelAmber}`}
        role="region"
        aria-labelledby="preview-heading"
        aria-describedby="preview-desc"
        tabIndex={-1}
        data-testid="tools-card-preview"
      >
        <h2 id="preview-heading" className={styles.srOnly}>Preview &amp; Validation</h2>
        <p id="preview-desc" className={styles.srOnly}>Use Arrow keys to switch preview tabs. Tab to enter tab panel content.</p>
        <div className={`${styles.cardHeader} ${styles.cardHeaderV2}`}>
          <div className={`${styles.cardTitle} ${styles.cardTitleV2} ${styles.cardTitleAmber}`}>Preview &amp; Validation</div>
          <div className={`${styles.cardSub} ${styles.cardSubV2}`}>PDF (HTML print), JSON, CSV</div>
        </div>
        <PreviewPanel scopeKind={scope} policy={policy} csvPreviewRows={25} debounceMs={150} />
      </section>

      {}
      <section
        id={ID_CONSULTON}
        className={`${styles.panel} ${styles.accentMod} ${styles.panelAmber}`}
        aria-labelledby="consulton-heading"
        data-testid="tools-card-consulton"
      >
        <h2 id="consulton-heading" className={styles.srOnly}>Consulton AI</h2>
  <ConsultonPanel modelLabel="GPT-4o" />
      </section>

      {}
      <section
        id={ID_EXPORT}
        className={`${styles.panel} ${styles.accentHigh} ${styles.panelAmber}`}
        role="region"
        aria-labelledby="export-heading"
        tabIndex={-1}
        data-testid="tools-card-export"
      >
        <h2 id="export-heading" className={styles.srOnly}>Export</h2>
        <div className={`${styles.cardHeader} ${styles.cardHeaderV2}`}>
          <div className={`${styles.cardTitle} ${styles.cardTitleV2} ${styles.cardTitleAmber}`}>Export</div>
          <div className={`${styles.cardSub} ${styles.cardSubV2}`}>{scopeCountSummary}</div>
        </div>
        <ExportBar scopeKind={scope} policy={policy} />
      </section>
    </div>
  );
}
