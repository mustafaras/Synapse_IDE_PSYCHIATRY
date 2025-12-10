import type { Card, PromptSpec } from "../lib/types";
import { PSYCHOTHERAPIES } from "../content/psychotherapies";


export function buildPsychotherapyCards(): Card[] {
  return PSYCHOTHERAPIES.map<Card>((it) => {

    const baseTags: string[] = ["cbt", "psychotherapy"];
    const t = it.title.toLowerCase();
    if (t.includes("insomnia") || t.includes("cbt-i")) baseTags.push("insomnia", "sleep");
    if (t.includes("exposure")) baseTags.push("anxiety");
    if (t.includes("ptsd")) baseTags.push("ptsd");
    if (t.includes("ocd")) baseTags.push("anxiety");


    const prompts: PromptSpec[] = (it.prompts || []).map((text, idx) => ({
      id: `p${idx + 1}`,
      label: `Prompt ${idx + 1}`,
      template: text,
    }));


    const evidence = (it.references || []).map((r) => ({ title: r.citation }));


    const examples = [
      { id: "default", label: "Worksheet", html: it.example_html },
    ];

    const summary = it.clinical_summary?.length
      ? it.clinical_summary[0]
      : it.title;

    return {
      id: it.id,
      title: it.title,
      sectionId: "psychotherapy",
      summary,
      tags: baseTags as any,

      examples,
      prompts,
      evidence,
    } as Card;
  });
}
