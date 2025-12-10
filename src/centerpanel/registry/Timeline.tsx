

import React, { useEffect, useMemo, useState } from "react";
import { selectPatientById, useRegistry } from "./state";
import { composeNote, NoteEditor, type NoteSlots } from "../tabs/Note";
import type { Encounter } from "./types";
import styles from "../styles/registry.module.css";
import PHQ9Form from "./forms/PHQ9";
import GAD7Form from "./forms/GAD7";
import BFCRSForm from "./forms/BFCRS";

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

export default function Timeline({ onBack }: { onBack: () => void }) {
  const { state, actions } = useRegistry();
  const patient = selectPatientById(state, state.selectedPatientId);
  const encounterId = state.selectedEncounterId;


  const encounters = useMemo(
    () => (patient?.encounters ?? []).slice().sort((a, b) => b.when - a.when),
    [patient]
  );


  const [buffer, setBuffer] = useState<NoteSlots>(() => {
    const enc = encounters.find((e) => e.id === encounterId);
    return enc?.noteSlots ?? {};
  });


  useEffect(() => {
    const enc = encounters.find((e) => e.id === encounterId);
    setBuffer(enc?.noteSlots ?? {});
  }, [encounterId, encounters]);


  useEffect(() => {
    const id = setTimeout(() => {
      if (patient && encounterId) {
        actions.setEncounterSlots(patient.id, encounterId, buffer);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [actions, buffer, patient, encounterId]);

  if (!patient) {
    return (
      <div style={cardStyle}>
        <div style={topRowStyle}>
          <div style={titleStyle}>Patient view</div>
          <button className={styles.pill} onClick={onBack}>Back</button>
        </div>
        <div>Choose a patient from the Registry.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12, height: "100%" }}>
      {}
      <div style={cardStyle} role="list" aria-label="Encounter timeline">
        <div style={topRowStyle}>
          <div style={titleStyle}>Encounters</div>
          <button
            className={styles.pill}
            onClick={() => {
              const newEnc: Encounter = {
                id: `enc_${Math.random().toString(36).slice(2, 9)}`,
                when: Date.now(),
                location: "OPD" as const,
                noteSlots: {},
              };
              actions.addEncounter(patient.id, newEnc);
            }}
            aria-label="New encounter"
          >
            New
          </button>
        </div>

        <div style={{ overflow: "auto" }}>
          {encounters.map((e) => {
            const selected = e.id === encounterId;
            const preview = (e.noteSlots?.summary || e.noteSlots?.plan || "").trim().slice(0, 80);
            return (
              <button
                key={e.id}
                aria-current={selected}
                onClick={() => actions.selectEncounter(e.id)}
                onKeyDown={(ev) => { if (ev.key === "Enter") actions.selectEncounter(e.id); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: selected ? "rgba(0,166,215,0.12)" : "rgba(255,255,255,0.02)",
                  color: "#EAF2FF",
                  borderRadius: 10,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontWeight: 700 }}>{new Date(e.when).toLocaleDateString()}</div>
                  <div style={{ opacity: 0.8 }}>{relTime(e.when)}</div>
                </div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                  {e.location ?? "—"} {preview ? `• ${preview}…` : ""}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {}
      <div style={cardStyle}>
        <div style={topRowStyle}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={titleStyle}>
              {patient.name ?? "Anon"} <span style={{ opacity: 0.8, fontWeight: 400 }}>• {patient.id}</span>
            </div>
            <div style={{ opacity: 0.85, fontSize: 12 }}>
              {patient.age ? `${patient.age}y` : "—"} / {patient.sex ?? "—"} • Grade {patient.risk} • {(patient.tags ?? []).slice(0, 3).join(", ") || "No tags"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={styles.pill}
              onClick={() => {
                const text = composeNote(buffer);
                navigator.clipboard.writeText(text).catch(() => {});
              }}
              title="Copy full note"
            >
              Copy note
            </button>
            <button className={styles.pill} onClick={onBack} aria-label="Back to list">Back</button>
          </div>
        </div>

        <div style={{ overflow: "auto", height: "calc(100% - 46px)", display: "flex", flexDirection: "column", gap: 12 }}>
          {}
          <div>
            {encounterId ? (
              <NoteEditor value={buffer} onChange={setBuffer} />
            ) : (
              <div style={{ opacity: 0.9 }}>Select an encounter from the left.</div>
            )}
          </div>

          {}
          {patient ? (
            <div style={assessCard}>
              <AssessmentsTabs patientId={patient.id} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  borderRadius: 12,
  padding: 12,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};
const topRowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4
};
const titleStyle: React.CSSProperties = { fontWeight: 800, letterSpacing: 0.2 };

function AssessmentsTabs({ patientId }: { patientId: string }) {
  const [tab, setTab] = useState<"PHQ9" | "GAD7" | "BFCRS">("PHQ9");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Assessments</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.pill} data-active={tab === "PHQ9"} onClick={() => setTab("PHQ9")}>PHQ-9</button>
          <button className={styles.pill} data-active={tab === "GAD7"} onClick={() => setTab("GAD7")}>GAD-7</button>
          <button className={styles.pill} data-active={tab === "BFCRS"} onClick={() => setTab("BFCRS")}>BFCRS</button>
        </div>
      </div>

      <div>
        {tab === "PHQ9" && <PHQ9Form patientId={patientId} />}
        {tab === "GAD7" && <GAD7Form patientId={patientId} />}
        {tab === "BFCRS" && <BFCRSForm patientId={patientId} />}
      </div>
    </div>
  );
}

const assessCard: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  borderRadius: 12,
  padding: 12,
};
