import React from "react";
import flowCss from "../styles/flows.module.css";
import type { FlowLibraryItem } from "./flowLibraryMeta";

const FlowTile: React.FC<{
  item: FlowLibraryItem;
  isActive: boolean;
  onSelect: () => void;
}> = ({ item, isActive, onSelect }) => {
  const locked = !!item.isLocked;
  const className = locked
    ? flowCss.flowTileLocked
    : isActive
    ? flowCss.flowTileActive
    : flowCss.flowTile;


  return (
    <button
      type="button"
      className={className}
      disabled={locked}
      onClick={onSelect}
      aria-disabled={locked || undefined}
      aria-pressed={isActive || undefined}
      title={item.boundary}
    >
      <div className={flowCss.flowTileTitleRow}>
        <span className={flowCss.flowTileTitle}>{item.title}</span>
        {locked && (
          <span className={flowCss.flowTileLockBadge}>
            {item.lockReason || "Context required"}
          </span>
        )}
      </div>

      <div className={flowCss.flowTileClinicalFocus}>{item.clinicalFocus}</div>

      <div className={flowCss.flowTileBoundaryLine}>{item.boundary}</div>
    </button>
  );
};

export default FlowTile;
