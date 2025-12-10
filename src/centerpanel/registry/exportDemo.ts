
import JSZip from "jszip";
import type { Patient } from "./types";
import { buildRegistryCSV, buildRegistryJSON } from "../lib/exporters";
import { toMarkdownSnapshot } from "./demoGenerate";

function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

export async function exportDemoCasesZip(patients: Patient[]) {
  const zip = new JSZip();

  const json = buildRegistryJSON(patients, { anonymize: false });
  const csv = buildRegistryCSV(patients);
  zip.file("registry.json", json);
  zip.file("registry.csv", csv);


  const folder = zip.folder("patients");
  (patients || []).forEach((p) => {
    const safeId = String(p.id).replace(/[^a-z0-9_-]/gi, "_");
    folder?.file(`${safeId}.json`, JSON.stringify(p, null, 2));
    folder?.file(`${safeId}.md`, toMarkdownSnapshot(p));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  downloadBlob(blob, `demo-cases-${ts}.zip`);
}
