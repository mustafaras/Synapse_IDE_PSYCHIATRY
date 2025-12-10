


import type { SelectionSnapshot } from "./audit";

export type ExternalSource = "consult";

export type ExternalExportPayload = {
  html: string;
  scopeKind: "encounter" | "patient" | "cohort";
  scopeLabel: string;
  selection: SelectionSnapshot;
  policyPreset: "none" | "limited" | "safe";
  seed?: string | number;
  source?: ExternalSource;
};

type Sub = (payload: ExternalExportPayload | null) => void;

let current: ExternalExportPayload | null = null;
const subs = new Set<Sub>();

function notify() {
  subs.forEach((fn) => {
    try { fn(current); } catch {  }
  });
}

export function publishExternalExport(payload: ExternalExportPayload): void {
  current = { source: "consult", ...payload };
  notify();
}

export function clearExternalExport(): void {
  current = null;
  notify();
}

export function getExternalExport(): ExternalExportPayload | null {
  return current;
}

export function subscribeExternalExport(cb: Sub): () => void {
  subs.add(cb);
  try { cb(current); } catch {  }
  return () => void subs.delete(cb);
}
