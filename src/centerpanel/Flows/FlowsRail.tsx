import React from "react";
import navCss from "../styles/centerpanel.module.css";
import flowCss from "../styles/flows.module.css";
import stripCss from "../clinical-snapshot-strip.module.css";
import { selectLastTwoScores, useRegistry } from "../registry/state";
import FlowLibraryCard from "./FlowLibraryCard";
import type { FlowId } from "./flowTypes";
import type { Encounter, Patient } from "../registry/types";
import CompletedRunsCard from "./rail/CompletedRunsCard";
import { useFlowsUIStore } from "./uiStore";
import SuggestedCard from "./rail/SuggestedCard";

function fmtDelta(previous?: number, latest?: number): string {
  if (typeof latest === "number" && typeof previous === "number") {
    const d = latest - previous;
    return d > 0 ? `Δ+${d}` : d < 0 ? `Δ${d}` : "Δ0";
  }
  if (typeof latest === "number") return "Δn/a";
  return "";
}

function fmtAgeSex(age?: number, sex?: string): string | undefined {
  if (age == null && !sex) return undefined;
  if (age != null && sex) return `${age}y/${sex}`;
  if (age != null) return `${age}y`;
  return String(sex);
}

function fmtWhen(ts?: number): string | undefined {
  if (!ts) return undefined;
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function fmtRisk(risk?: number): string | undefined {
  if (risk == null) return undefined;
  return `Grade ${risk}`;
}

type Severity = "info" | "med" | "high";
function severityFor(kind: "PHQ-9" | "GAD-7" | "BFCRS", score: number): Severity {
  if (kind === "PHQ-9") {
    if (score >= 20) return "high";
    if (score >= 10) return "med";
    return "info";
  }
  if (kind === "GAD-7") {
    if (score >= 15) return "high";
    if (score >= 10) return "med";
    return "info";
  }

  if (score >= 20) return "high";
  if (score >= 10) return "med";
  return "info";
}

const FlowsRail: React.FC<{
  activeFlowId: FlowId;
  onSelectFlow: (fid: FlowId) => void;
  onOpenReviewRun?: (encounterId: string, runIndex: number) => void;
}> = ({ activeFlowId, onSelectFlow, onOpenReviewRun: _onOpenReviewRun }) => {
  const { state } = useRegistry();

  const patient: Patient | undefined = state.selectedPatientId
    ? state.patients.find((p) => p.id === state.selectedPatientId)
    : state.patients[0];

  const lastEnc: Encounter | undefined = patient?.encounters
    ? [...patient.encounters].sort((a, b) => b.when - a.when)[0]
    : undefined;

  const activeEnc: Encounter | undefined =
    patient?.encounters?.find((e) => e.id === state.selectedEncounterId) ?? lastEnc;

  const phq = patient ? selectLastTwoScores(patient, "PHQ9") : undefined;
  const gad = patient ? selectLastTwoScores(patient, "GAD7") : undefined;
  const bf = patient ? selectLastTwoScores(patient, "BFCRS") : undefined;

  const line1Parts: string[] = [];
  if (patient?.name) line1Parts.push(String(patient.name));
  if (patient?.id) line1Parts.push(String(patient.id));

  const ageSex = fmtAgeSex(patient?.age, patient?.sex);
  if (ageSex) line1Parts.push(ageSex);

  const riskLabel = fmtRisk(patient?.risk);
  if (riskLabel) line1Parts.push(riskLabel);

  const headerLine = line1Parts.join(" • ");

  const metrics: Array<{ label: "PHQ-9" | "GAD-7" | "BFCRS"; value: number; delta: string; sev: Severity }> = [];
  if (phq?.latest != null) metrics.push({ label: "PHQ-9", value: phq.latest, delta: fmtDelta(phq.previous, phq.latest), sev: severityFor("PHQ-9", phq.latest) });
  if (gad?.latest != null) metrics.push({ label: "GAD-7", value: gad.latest, delta: fmtDelta(gad.previous, gad.latest), sev: severityFor("GAD-7", gad.latest) });
  if (bf?.latest != null) metrics.push({ label: "BFCRS", value: bf.latest, delta: fmtDelta(bf.previous, bf.latest), sev: severityFor("BFCRS", bf.latest) });

  const lastEncLine = activeEnc
    ? `Last encounter: ${fmtWhen(activeEnc.when)}${activeEnc.location ? ` • ${activeEnc.location}` : ""}`
    : undefined;

  const tagList: string[] = Array.isArray(patient?.tags) ? patient!.tags : [];

  const activateFlow = useFlowsUIStore((s) => s.activateFlow);

  return (
    <div className={flowCss.railStack} data-outline-class={navCss.outline}>
      <section
        className={`${flowCss.railCard} ${flowCss.snapshotCard}`}
        aria-label="Patient snapshot and encounter context"
      >
        <header className={flowCss.railCardHeader}>
          <div className={flowCss.snapshotIdentLine} title={headerLine}>
            {headerLine || "No patient selected"}
          </div>

          <div className={flowCss.snapshotTagsRow}>
            {tagList.map((tag) => (
              <span key={tag} className={flowCss.snapshotTagChip} data-tag={tag}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className={flowCss.snapBody}>
          {metrics.length ? (
            <div className={flowCss.snapshotMetricsRow} aria-label="Recent screening scores">
              {metrics.map((m, idx) => (
                <span key={idx} className={`${stripCss.metricPill} ${flowCss.snapshotMetricPill}`} data-severity={m.sev}>
                  <span className={stripCss.kvLabel}>{m.label}:</span>
                  <span className={stripCss.kvValue} style={{ marginLeft: 4 }}>{m.value}</span>
                  <span className={stripCss.kvLabel} style={{ marginLeft: 6 }}>({m.delta})</span>
                </span>
              ))}
            </div>
          ) : null}

          {lastEncLine ? <div className={flowCss.snapshotEncounterTime}>{lastEncLine}</div> : null}

          <div className={flowCss.snapshotDisclaimer}>
            Context is provided to support clinical documentation and
            communication in this encounter. It is not a treatment directive
            or standing order. Clinical judgment and local policy determine
            care.
          </div>
        </div>
      </section>

      {}
      <SuggestedCard />

      <FlowLibraryCard
        activeFlowId={activeFlowId}
        onSelectFlow={(fid) => {
          activateFlow(fid);
          onSelectFlow(fid);
        }}
      />

      {}
      <CompletedRunsCard />
    </div>
  );
};

export default FlowsRail;
