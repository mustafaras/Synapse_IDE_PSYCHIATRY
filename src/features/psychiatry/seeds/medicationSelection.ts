import type { Card, PromptSpec } from "../lib/types";
import { MEDICATION_SELECTION } from "../content/medicationSelection";


export function buildMedicationSelectionCards(): Card[] {
  return MEDICATION_SELECTION.map<Card>((it) => {
    const baseTags: string[] = ["medications", "ssri", "snri"];
    const t = it.title.toLowerCase();
    if (t.includes("perinatal") || t.includes("pregnancy") || t.includes("lactation")) baseTags.push("perinatal");
    if (t.includes("geriatric") || t.includes("older") || t.includes("anticholinergic")) baseTags.push("geriatric");
    if (t.includes("augmentation") || t.includes("switch")) baseTags.push("augmentation");
    if (t.includes("cyp") || t.includes("qt")) baseTags.push("interactions","qt");

    const prompts: PromptSpec[] = (it.prompts || []).map((text, idx) => ({
      id: `p${idx + 1}`,
      label: `Prompt ${idx + 1}`,
      template: text,
    }));

    const evidence = (it.references || []).map((r) => ({ title: r.citation }));

    const examples = [
      { id: "default", label: "Worksheet", html: it.example_html },
    ];

    const summary = it.clinical_summary?.length ? it.clinical_summary[0] : it.title;

    return {
      id: it.id,
      title: it.title,
      sectionId: "medications",
      summary,
      tags: baseTags as any,
      examples,
      prompts,
      evidence,
    } as Card;
  });
}
