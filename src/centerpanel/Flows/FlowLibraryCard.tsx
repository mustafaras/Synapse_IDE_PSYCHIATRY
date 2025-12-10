import React from "react";
import flowCss from "../styles/flows.module.css";
import type { FlowId } from "./flowTypes";
import { FLOW_LIBRARY_ITEMS } from "./flowLibraryMeta";
import FlowTile from "./FlowTile";

const FlowLibraryCard: React.FC<{
  activeFlowId: FlowId;
  onSelectFlow: (fid: FlowId) => void;
}> = ({ activeFlowId, onSelectFlow }) => {
  const acuteRisk = FLOW_LIBRARY_ITEMS.filter((f) => f.category === "ACUTE_RISK");
  const capacityNeuro = FLOW_LIBRARY_ITEMS.filter((f) => f.category === "CAPACITY_NEURO");

  return (
    <section className={flowCss.flowLibraryCard} aria-label="Flow Library">
      <div className={flowCss.flowLibraryHeader}>
        <div className={flowCss.flowLibraryTitle}>Flow Library</div>
        <div className={flowCss.flowLibrarySubtitle}>
          Structured clinical documentation flows
        </div>
      </div>

      <div className={flowCss.flowLibraryGroup}>
        <div className={flowCss.flowLibraryGroupLabel}>Acute Safety / Behavioral Risk</div>
        <div className={flowCss.flowLibraryGroupHint}>
          Imminent self-harm / agitation / containment rationale
        </div>
        {acuteRisk.map((item) => (
          <FlowTile
            key={item.flowId}
            item={item}
            isActive={item.flowId === activeFlowId}
            onSelect={() => onSelectFlow(item.flowId)}
          />
        ))}
      </div>

      <div className={flowCss.flowLibraryGroup}>
        <div className={flowCss.flowLibraryGroupLabel}>
          Decision / Capacity / Neuropsychiatric Syndrome
        </div>
        <div className={flowCss.flowLibraryGroupHint}>
          Capacity, diagnostic clarification, catatonia / lorazepam challenge
        </div>
        {capacityNeuro.map((item) => (
          <FlowTile
            key={item.flowId}
            item={item}
            isActive={item.flowId === activeFlowId}
            onSelect={() => onSelectFlow(item.flowId)}
          />
        ))}
      </div>

      <div className={flowCss.flowLibraryDisclaimer}>
        Flows support neutral documentation of safety reasoning, capacity,
        escalation rationale, and monitoring / reassessment. They do not
        themselves authorize seclusion/restraint, create a custody/hold status,
        or establish standing treatment orders. Local policy and supervising
        clinicians govern care.
      </div>
    </section>
  );
};

export default FlowLibraryCard;
