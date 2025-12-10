

import type { EvidenceGrade, Citation } from "./guideTypes";

export function gradeColor(g?: EvidenceGrade): string {
  switch (g) {
    case "A": return "var(--evidA)";
    case "B": return "var(--evidB)";
    case "C": return "var(--evidC)";
    case "D": return "var(--evidD)";
    default:  return "rgba(255,255,255,.4)";
  }
}

export function gradeLabel(g?: EvidenceGrade): string {
  switch (g) {
    case "A": return "High quality / consistent";
    case "B": return "Moderate";
    case "C": return "Limited / observational";
    case "D": return "Consensus / case-based";
    default:  return "Unspecified";
  }
}

export function citeLine(c: Citation): string {
  const bits = [
    c.title, c.journal, c.year ? String(c.year) : undefined,
    c.doi ? `doi:${c.doi}` : undefined,
    c.pmid ? `PMID:${c.pmid}` : undefined,
  ].filter(Boolean);
  return `${c.key}${bits.length ? " — " + bits.join(" • ") : ""}`;
}
