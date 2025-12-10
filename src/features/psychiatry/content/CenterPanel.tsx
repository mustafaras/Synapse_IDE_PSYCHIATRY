import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SliceCard as SliceCardP2 } from './ContentSchema';
import { assembleEvidenceSlice } from './assembleSlice';


export type EvidenceSlice = {
  infoHtml?: string;
  exampleHtml?: string;
  referencesHtml?: string;
  promptsText?: string;
};

export type AssistantIntent =
  | "explain"
  | "html_form"
  | "evidence_summary"
  | "risk_check"
  | "apso_note";

type Persona = "Clinician" | "Coder" | "Reviewer";

export type CenterPanelProps = {

  selectedItem?: { id: string; title: string; section: string; tags?: string[] };

  content?: EvidenceSlice;

  debugCard?: SliceCardP2 | null;

  llm: (p: { model: "gpt-4o"; system?: string; prompt: string }) => Promise<string>;
  onAction?: (e:
    | { type: "copyToEditor"; html: string; source: string }
    | { type: "insertToEditor"; html: string; source: string }
    | { type: "openPrint"; html: string }
    | { type: "starItem"; id: string }
    | { type: "sendToChat"; text: string }
    | { type: "assistantUsed"; intent: AssistantIntent }
  ) => void;
};


export type ComposerApi = {
  setHtml: (html: string) => void;
  getHtml: () => string;
  onChange: (cb: (html: string) => void) => void;
};


const ASSISTANT_SYSTEM_MESSAGE = `You are an assistant for clinical documentation and educational content in psychiatry.
Output only templates, checklists, summaries, or HTML forms/pages.
Do not provide medical advice, dosing, or clinical directives.
Ground answers in provided headings and citations when available.
Model must be gpt-4o.`;


const ACTIONS_SYSTEM = `You are an assistant for clinical documentation and educational content in psychiatry.
Output only templates, checklists, summaries, or HTML forms/pages.
Do not provide medical advice, dosing, or clinical directives.
Ground outputs in provided headings and citations when available.
Model must be gpt-4o.`;

const APSO_PLACEHOLDER_HTML = `
<article>
  <h2>APSO Note (Placeholder)</h2>
  <h3>Assessment</h3>
  <p>Summarize the primary psychiatric concerns and diagnostic impressions.</p>
  <h3>Plan</h3>
  <ul>
    <li>Outline documentation steps and follow-up tasks (no medical directives).</li>
  </ul>
  <h3>Subjective</h3>
  <p>Key patient-reported themes, context, and goals (education-focused).</p>
  <h3>Objective</h3>
  <p>Relevant observations and documentation artifacts.</p>
  <hr />
  <p class="text-xs">For educational and documentation templates only. No medical advice.</p>
</article>`;


function classNames(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}

function tokenEstimate(str?: string): number {
  return Math.ceil(((str ?? "").length) / 4);
}


function htmlTextLength(html?: string): number {
  if (!html) return 0;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("script,style").forEach(n => n.remove());
    const text = (doc.body.textContent || "").replace(/\s+/g, " ").trim();
    return text.length;
  } catch {
    const tmp = document.createElement("div"); tmp.innerHTML = html; return (tmp.textContent || "").trim().length;
  }
}

function tokenEstimateHtml(html?: string): number {
  const len = htmlTextLength(html);
  return Math.ceil(len / 4);
}

function safeText(s?: string): string {
  const str = String(s ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


type Heading = { id: string; level: 1 | 2 | 3 | 4; text: string };


function sanitizeHtml(html?: string): string {
  if (!html) return "";
  try {
    const allowedTags = new Set([
      "H1","H2","H3","H4","P","UL","OL","LI","STRONG","EM","CODE","PRE",
      "TABLE","THEAD","TBODY","TR","TH","TD","BLOCKQUOTE","HR","A"
    ]);
    const allowedAttrs = new Set(["href","title","colspan","rowspan","scope"]);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");


    doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach(n => n.remove());

    const walk = (el: Element) => {

      if (!allowedTags.has(el.tagName)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
        return;
      }

      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        if (!allowedAttrs.has(name)) el.removeAttribute(attr.name);
      });

      if (el.tagName === "A") {
        const href = (el.getAttribute("href") || "").trim();
        const safe = /^(https?:|mailto:|tel:|#)/i.test(href);
        if (!safe) el.removeAttribute("href");
        else {
          el.setAttribute("rel", "noopener noreferrer");
          el.setAttribute("target", "_blank");
        }
      }
      [...el.children].forEach(child => walk(child as Element));
    };

    [...doc.body.children].forEach(c => walk(c as Element));
    return doc.body.innerHTML;
  } catch {

    const tmp = document.createElement("div");
    tmp.textContent = html ?? "";
    return `<p>${tmp.innerHTML}</p>`;
  }
}


function addHeadingAnchors(html: string): { html: string; headings: Heading[] } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const seen = new Map<string, number>();
    const result: Heading[] = [];
    const nodes = doc.querySelectorAll("h1, h2, h3, h4");

    nodes.forEach((node, idx) => {
      const text = (node.textContent ?? `Section ${idx + 1}`).trim();
      let slug = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "") || `section-${idx+1}`;
      const count = (seen.get(slug) ?? 0) + 1;
      seen.set(slug, count);
      if (count > 1) slug = `${slug}-${count}`;

      node.setAttribute("id", slug);
      const level = Number(node.tagName.substring(1)) as 1|2|3|4;
      result.push({ id: slug, level, text });
    });

    return { html: doc.body.innerHTML, headings: result.slice(0, 64) };
  } catch {
    return { html, headings: [] };
  }
}


function topHeadings(infoHtml?: string, max: number = 8): string[] {
  if (!infoHtml) return [];
  const clean = sanitizeHtml(infoHtml);
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, "text/html");
    const hs = Array.from(doc.querySelectorAll("h1,h2,h3,h4"))
      .map(h => (h.textContent || "").trim())
      .filter(Boolean)
      .slice(0, max);
    return hs;
  } catch {
    return [];
  }
}


function stripFences(s: string): string {
  const t = s.trim();
  const fence = /^```[a-zA-Z]*\n([\s\S]*?)\n```$/;
  const m = t.match(fence);
  if (m) return m[1];
  return t.replace(/^```[\s\S]*?```/g, "").trim();
}


function ensureSectionHtml(title: string, raw: string): string {
  const DISCLAIMER = '<p class="text-xs"><em>Educational/documentation template. Verify with local policy and guidelines. No dosing or treatment directives.</em></p>';
  let html = stripFences(raw);

  if (!/<[a-z][\s\S]*>/i.test(html)) {
    html = html
      .replace(/^\s*#+\s?(.*)$/gim, (_m, p1) => `<h3>${safeText(String(p1))}</h3>`)
      .replace(/^\s*-\s+(.*)$/gim, (_m, p1) => `<li>${safeText(String(p1))}</li>`)
      .replace(/(<li>[^<]+<\/li>)(?![\s\S]*<ul>)/gim, '<ul>$1</ul>');
  }
  html = sanitizeHtml(html);
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let section = doc.querySelector("section");
    if (!section) {
      section = doc.createElement("section");

      while (doc.body.firstChild) section.appendChild(doc.body.firstChild);
      doc.body.appendChild(section);
    }

    const hasH2 = section.querySelector("h2");
    if (!hasH2) {
      const h2 = doc.createElement("h2");
      h2.textContent = title;
      section.insertBefore(h2, section.firstChild);
    }


    const disclaimerExists = Array.from(section.querySelectorAll("p,em,i,small"))
      .some(n => /educational\/documentation template/i.test(n.textContent || ""));
    if (!disclaimerExists) {
      const div = doc.createElement("div");
      div.innerHTML = DISCLAIMER;
      section.appendChild(div.firstElementChild as HTMLElement);
    }
    return sanitizeHtml(doc.body.innerHTML);
  } catch {
    return sanitizeHtml(`<section><h2>${safeText(title)}</h2>${html}${DISCLAIMER}</section>`);
  }
}

type ActionKey =
  | "structured_intake"
  | "suicide_safety_plan"
  | "med_lithium"
  | "med_clozapine"
  | "catatonia_bfcrs"
  | "insomnia_ladder"
  | "patient_handout";

type ComposeCtx = {
  selectedItem?: { id: string; title: string; section: string; tags?: string[] };
  content?: EvidenceSlice;
};

function composeActionPrompt(kind: ActionKey, ctx: ComposeCtx): string {
  const title = ctx.selectedItem?.title ?? "Selected Topic";
  const section = ctx.selectedItem?.section ?? "Section";
  const tags = (ctx.selectedItem?.tags ?? []).slice(0, 8).join(", ");
  const headings = topHeadings(ctx.content?.infoHtml, 8);
  const citations = extractCitations(ctx.content?.referencesHtml).slice(0, 12);

  const base = [
    `Context:`,
    `- Section: ${section}`,
    `- Title: ${title}`,
    tags ? `- Tags: ${tags}` : undefined,
    headings.length ? `Top headings:` : undefined,
    ...headings.map((h, i) => `  ${i + 1}. ${h}`),
    citations.length ? `Citations (trimmed):` : undefined,
    ...citations.map((c, i) => `  [${i + 1}] ${c}`),
  ].filter(Boolean).join("\n");

  const must = `Requirements:
- Return only a sanitized HTML <section> with an <h2> title, clear <h3> subsections, and <ul><li> items.
- Include exactly this disclaimer at the end: <p class="text-xs"><em>Educational/documentation template. Verify with local policy and guidelines. No dosing or treatment directives.</em></p>
- Do not include medication doses or clinical directives. Provide templates, checklists, summaries only.
- Keep concise and structured; dark-mode friendly semantics.`;

  let spec = "";
  switch (kind) {
    case "structured_intake":
      spec = `Output spec (Structured Intake):\n- APSO headings (Assessment, Plan, Subjective, Objective).\n- Add an MSE block list (Appearance, Behavior, Speech, Mood, Affect, Thought Process, Thought Content, Perception, Cognition, Insight, Judgment, Safety).\n- Risk & Safety bullets (acute risk, protective factors, safety steps).`;
      break;
    case "suicide_safety_plan":
      spec = `Output spec (Suicide Safety Plan):\n- C-SSRS gate/summary placeholder.\n- Warning signs, Means safety, Coping strategies, Contacts, Crisis numbers, Follow-up plan.`;
      break;
    case "med_lithium":
      spec = `Output spec (Medication Initiation Pathway — Lithium, checklists only):\n- Baseline labs checklist: BMP/electrolytes, renal function, TSH, pregnancy test if applicable.\n- Contraindication flags.\n- Monitoring cadence placeholders.\n- Counseling points (no doses).`;
      break;
    case "med_clozapine":
      spec = `Output spec (Medication Initiation Pathway — Clozapine, checklists only):\n- ANC monitoring schedule gates.\n- Myocarditis warning signs.\n- Required documentation fields.\n- REMS/registry placeholder (no doses).`;
      break;
    case "catatonia_bfcrs":
      spec = `Output spec (Catatonia — BFCRS Summary Block):\n- Core signs domains.\n- Assessment flow.\n- Monitoring check bullets.`;
      break;
    case "insomnia_ladder":
      spec = `Output spec (Insomnia First-Line Ladder):\n- Sleep hygiene.\n- Stimulus control.\n- CBT-I bullets.\n- Red flags → referral indicators.`;
      break;
    case "patient_handout":
      spec = `Output spec (Patient Handout — print-ready):\n- Readable <article>-style content within the <section>.\n- Definition, when to seek urgent care, self-care tips, and contact area.`;
      break;
  }

  return [
    base,
    "",
    must,
    spec,
    "Respond with only the HTML <section> (no surrounding prose).",
  ].join("\n");
}


function extractCitations(referencesHtml?: string): string[] {
  const sanitized = sanitizeHtml(referencesHtml);
  if (!sanitized) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, "text/html");
    const lis = [...doc.querySelectorAll("li")].map(li => li.textContent?.trim()).filter(Boolean) as string[];
    if (lis.length) return lis;


    const ps = [...doc.querySelectorAll("p")].map(p => p.textContent?.trim()).filter(Boolean) as string[];
    if (ps.length) return ps;

    return sanitized
      .replace(/<\/?[^>]+(>|$)/g, "\n")
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  } catch {
    return sanitized.split("\n").map(s => s.trim()).filter(Boolean);
  }
}

const PERSONA_GUIDANCE: Record<Persona, string> = {
  Clinician: "Write as a senior clinician. Focus on concise clinical documentation language, highlight safety and collaboration, avoid directives.",
  Coder: "Write as a medical coder/health informatics lead. Use structured fields, IDs, and compliance-friendly phrasing.",
  Reviewer: "Write as a documentation reviewer. Emphasize critique-ready structure, call out verification steps, and provide checklist framing.",
};

const INTENT_DETAILS: Record<AssistantIntent, { label: string; instruction: string }> = {
  explain: {
    label: "Explain",
    instruction: "Summarize the selected topic for documentation. Provide 2–3 short sections with bullets that highlight what to capture in notes.",
  },
  html_form: {
    label: "Generate HTML form/page",
    instruction: "Produce an accessible HTML structure for capturing documentation. Use semantic headings, fields, and checklist bullets only.",
  },
  evidence_summary: {
    label: "Evidence summary",
    instruction: "Synthesize the evidence into structured sections (Overview, Key Points, Citations). Reference provided sources by bracket index.",
  },
  risk_check: {
    label: "Risk check",
    instruction: "Produce a safety-focused checklist (acute risk, protective factors, escalation triggers) with documentation prompts.",
  },
  apso_note: {
    label: "Convert to APSO/MSE",
    instruction: "Convert the topic into an APSO note scaffold plus an MSE block. Keep wording template-oriented and free of directives.",
  },
};

const INTENT_DEFAULT_PROMPTS: Record<AssistantIntent, (topic: string) => string> = {
  explain: (topic) => `Give me a concise documentation-focused explanation of ${topic}.`,
  html_form: (topic) => `Create an accessible HTML section to capture key data for ${topic}.`,
  evidence_summary: (topic) => `Summarize the evidence for ${topic} with documentation-ready bullets.`,
  risk_check: (topic) => `Draft a risk/safety checklist for ${topic}.`,
  apso_note: (topic) => `Convert ${topic} into an APSO note template with MSE bullets.`,
};

const PERSONA_OPTIONS: Persona[] = ["Clinician", "Coder", "Reviewer"];
const ASSISTANT_INTENT_ORDER: AssistantIntent[] = [
  "explain",
  "html_form",
  "evidence_summary",
  "risk_check",
  "apso_note",
];

function clipForPrompt(str?: string, max: number = 4000): string | undefined {
  if (!str) return undefined;
  if (str.length <= max) return str;
  return `${str.slice(0, max)}…`;
}

type AssistantPromptContext = {
  selectedItem?: { id: string; title: string; section: string; tags?: string[] };
  headings: string[];
  citations: string[];
  infoHtml?: string;
  referencesHtml?: string;
  userSelection?: string;
};

function composeAssistantPrompt(
  persona: Persona,
  intent: AssistantIntent,
  userText: string,
  ctx: AssistantPromptContext
): string {
  const personaGuidance = PERSONA_GUIDANCE[persona];
  const intentDetail = INTENT_DETAILS[intent];
  const title = ctx.selectedItem?.title ?? "Current Topic";
  const section = ctx.selectedItem?.section ?? "Psychiatry Toolkit";
  const headings = ctx.headings.length ? ctx.headings : [];
  const citations = ctx.citations.length ? ctx.citations : [];
  const info = clipForPrompt(ctx.infoHtml);
  const refs = clipForPrompt(ctx.referencesHtml, 2000);

  const lines: string[] = [];
  lines.push(`Persona style: ${personaGuidance}`);
  lines.push(`Intent: ${intentDetail.instruction}`);
  lines.push(`Topic: ${section} — ${title}`);
  if (ctx.userSelection) {
    lines.push(`User_selection (verbatim): \n"""${ctx.userSelection}"""`);
  }
  lines.push(`User_input: \n"""${userText.trim() || "Generate a documentation template"}"""`);
  lines.push("Output requirements:\n- Return a single self-contained <section> with semantic <h2>/<h3> headings and ordered/unordered lists as needed.\n- You may nest an <article> inside the section if helpful.\n- Include exactly this footer line at the end: <p class=\"text-xs\"><em>Educational/documentation template. Verify with local policy and guidelines. No dosing or treatment directives.</em></p>\n- No medication dosing, prescriptions, or clinical directives. Focus on templates, summaries, and checklists.\n- Reference citations using bracketed numbers when appropriate (e.g., [1]).");
  if (headings.length) {
    lines.push("Grounding_headings:");
    headings.slice(0, 8).forEach((h, idx) => {
      lines.push(`  ${idx + 1}. ${h}`);
    });
  } else {
    lines.push("Grounding_headings: none available");
  }
  if (citations.length) {
    lines.push("Grounding_citations:");
    citations.slice(0, 12).forEach((c, idx) => {
      lines.push(`  [${idx + 1}] ${c}`);
    });
  } else {
    lines.push("Grounding_citations: none provided");
  }
  if (info) {
    lines.push(`Sanitized_info_html:\n${info}`);
  }
  if (refs) {
    lines.push(`Sanitized_references_html:\n${refs}`);
  }
  lines.push("Respond with only the sanitized HTML output as described.");

  return lines.join("\n");
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  const editable = (el as HTMLElement).isContentEditable;
  return (
    editable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (el.getAttribute && el.getAttribute("role") === "textbox")
  );
}

type MainTab = "Viewer" | "Composer" | "Actions" | "Calculators";


function OutlinePane({
  headings,
  currentId,
  onJump
}: {
  headings: Heading[];
  currentId?: string | undefined;
  onJump: (id: string) => void;
}) {
  if (!headings?.length) {
    return (
      <div className="text-sm opacity-70 px-3 py-2">No headings detected.</div>
    );
  }
  return (
    <nav aria-label="Outline (Table of Contents)" className="text-sm py-2">
      {headings.map(h => {
        const indent = h.level === 1 ? "" : h.level === 2 ? "pl-3" : h.level === 3 ? "pl-6" : "pl-9";
        const active = currentId === h.id;
        return (
          <button
            key={h.id}
            className={classNames(
              "block w-full text-left px-3 py-1 rounded",
              indent,
              active ? "font-semibold opacity-100" : "opacity-80 hover:opacity-100"
            )}
            aria-current={active ? "true" : "false"}
            aria-controls={h.id}
            onClick={() => onJump(h.id)}
          >
            {h.text}
          </button>
        );
      })}
    </nav>
  );
}


function EvidencePeek({
  referencesHtml,
  itemId
}: {
  referencesHtml?: string | undefined;
  itemId?: string | undefined;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const key = `centerpanel:evidence:${itemId ?? "none"}`;
  useEffect(() => {
    const saved = window.sessionStorage.getItem(key);
    if (saved) setOpen(saved === "1");

  }, [itemId]);
  useEffect(() => {
    window.sessionStorage.setItem(key, open ? "1" : "0");
  }, [key, open]);

  const citations = useMemo(() => extractCitations(referencesHtml), [referencesHtml]);
  const count = citations.length;

  return (
    <section aria-label="Evidence" className="border rounded-lg">
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">References</span>
          <span className="text-xs opacity-70">· {count}</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="text-sm px-2 py-1 rounded hover:opacity-100 opacity-80"
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </header>
      {open ? (
        <div className="px-3 pb-3">
          {count === 0 ? (
            <div className="text-sm opacity-70">No references available for this item.</div>
          ) : (
            <ol className="list-decimal pl-6 space-y-1">
              {citations.map((c, idx) => {
                const t = safeText(c);
                return (
                  <li key={idx} className="text-sm leading-snug"><span>{t}</span></li>
                );
              })}
            </ol>
          )}
          <p className="mt-3 text-xs opacity-60">
            These citations are rendered from the right panel’s REFERENCES tab (sanitized).
          </p>
        </div>
      ) : null}
    </section>
  );
}


function ViewerPane({
  selectedTitle,
  infoHtml,
  referencesHtml
}: {
  selectedTitle?: string | undefined;
  infoHtml?: string | undefined;
  referencesHtml?: string | undefined;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { anchoredHtml, headings } = useMemo(() => {
    const clean = sanitizeHtml(infoHtml);
    const { html, headings } = addHeadingAnchors(clean);
    return { anchoredHtml: html, headings };
  }, [infoHtml]);

  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const headingEls = Array.from(el.querySelectorAll("h1, h2, h3, h4")) as HTMLElement[];
    const onScroll = () => {
      let cur: string | undefined = undefined;
      const top = el.scrollTop;
      for (const h of headingEls) {
        if (h.offsetTop - top <= 24) cur = h.id;
        else break;
      }
      setCurrentId(cur);
    };
    el.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();
  }, [anchoredHtml]);


  const jumpTo = useCallback((id: string) => {
    const el = containerRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (target) {
      el.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
      target.focus?.();
    }
  }, []);

  const backToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!infoHtml) {
    return (
      <div className="p-4 space-y-3">
        <div className="text-base font-medium">Viewer</div>
        <div className="text-sm opacity-80">
          No INFO content. Open the right panel’s <span className="font-semibold">INFO</span> tab or select another item.
        </div>
        <EvidencePeek referencesHtml={referencesHtml} itemId={selectedTitle} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {}
      <style>{`
        .viewer-prose h1,.viewer-prose h2,.viewer-prose h3,.viewer-prose h4{margin:0 0 .6em;font-weight:600;line-height:1.2}
        .viewer-prose p{margin:.5em 0}
        .viewer-prose ul,.viewer-prose ol{margin:.5em 0;padding-left:1.25rem}
        .viewer-prose li{margin:.25em 0}
        .viewer-prose table{width:100%;border-collapse:collapse;margin:.75em 0}
        .viewer-prose th,.viewer-prose td{border:1px solid rgba(127,127,127,.35);padding:6px 8px;text-align:left}
        .viewer-prose code,.viewer-prose pre{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px}
        .viewer-prose pre{background:rgba(0,0,0,.7);color:#f5f5f5;padding:10px 12px;border-radius:6px;overflow:auto}
        .viewer-prose a{color:#699bf7}
      `}</style>
      {}
      <div className="px-3 py-2 flex items-center gap-3 border-b" style={{ padding: '8px 12px', borderBottom: '1px solid rgba(127,127,127,.35)' }}>
        <details className="rounded border px-2 py-1">
          <summary className="cursor-pointer text-sm font-medium">Outline</summary>
          <div className="mt-2">
            <OutlinePane headings={headings} currentId={currentId} onJump={jumpTo} />
          </div>
        </details>
        <details className="rounded border px-2 py-1">
          <summary className="cursor-pointer text-sm font-medium">Evidence</summary>
          <div className="mt-2 min-w-[260px]">
            <EvidencePeek referencesHtml={referencesHtml} itemId={selectedTitle} />
          </div>
        </details>
        <div className="flex-1" />
        <button className="text-sm px-2 py-1 rounded hover:opacity-100 opacity-80" onClick={backToTop} aria-label="Back to top">
          Back to top
        </button>
      </div>

      {}
      <div
        ref={containerRef}
        role="region"
        aria-label="Viewer Content"
        aria-live="polite"
        className="flex-1 overflow-auto px-5 py-4 viewer-prose"
        style={{ padding: '12px 16px' }}
        dangerouslySetInnerHTML={{ __html: anchoredHtml }}
      />
    </div>
  );
}


type FrameKind = "APSO" | "SOAP" | "MSE";

function frameTemplate(kind: FrameKind): string {
  const disclaimer = `<p class="text-xs">Templates are for educational documentation only. No medical advice.</p>`;
  if (kind === "SOAP") {
    return sanitizeHtml(`
<article>
  <h2>SOAP Note</h2>
  <h3>Subjective</h3>
  <p>Patient-reported concerns, history, and context (education-focused).</p>
  <h3>Objective</h3>
  <p>Observations and relevant documentation artifacts.</p>
  <h3>Assessment</h3>
  <p>Summary of themes/findings (no clinical directives).</p>
  <h3>Plan</h3>
  <ul>
    <li>Documentation tasks and follow-ups (no directives).</li>
  </ul>
  <hr />
  ${disclaimer}
</article>`);
  }
  if (kind === "MSE") {
    return sanitizeHtml(`
<article>
  <h2>Mental Status Exam (MSE)</h2>
  <h3>Appearance</h3><p></p>
  <h3>Behavior</h3><p></p>
  <h3>Speech</h3><p></p>
  <h3>Mood</h3><p></p>
  <h3>Affect</h3><p></p>
  <h3>Thought Process</h3><p></p>
  <h3>Thought Content</h3><p></p>
  <h3>Perception</h3><p></p>
  <h3>Cognition</h3><p></p>
  <h3>Insight</h3><p></p>
  <h3>Judgment</h3><p></p>
  <h3>Safety</h3><p></p>
  <hr />
  ${disclaimer}
</article>`);
  }

  return sanitizeHtml(`
<article>
  <h2>APSO Note</h2>
  <h3>Assessment</h3>
  <p>Summarize themes/findings (no directives).</p>
  <h3>Plan</h3>
  <ul>
    <li>Documentation steps and follow-ups (no directives).</li>
  </ul>
  <h3>Subjective</h3>
  <p>Patient-reported context and goals (education-focused).</p>
  <h3>Objective</h3>
  <p>Observations and documentation artifacts.</p>
  <hr />
  ${disclaimer}
</article>`);
}

function promptsToHtml(text?: string): string {
  const t = (text ?? "").trim();
  if (!t) return "";
  const lines = t.split(/\r?\n/).map((l) => l.trim());
  const paras = lines.filter(Boolean).map((l) => `<p>${safeText(l)}</p>`).join("\n");
  const note = `<p><em>Seeded from Prompts</em></p>`;
  return sanitizeHtml(`<article>${note}<hr/>${paras}</article>`);
}

function validateFrame(html: string, kind: FrameKind): string[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = Array.from(doc.querySelectorAll("h2,h3,h4")).map((h) => (h.textContent ?? "").trim().toLowerCase());
    const has = (title: string) => headings.some((h) => h.includes(title.toLowerCase()));
    if (kind === "APSO") {
      const req = ["assessment", "plan", "subjective", "objective"]; return req.filter((r) => !has(r));
    }
    if (kind === "SOAP") {
      const req = ["subjective", "objective", "assessment", "plan"]; return req.filter((r) => !has(r));
    }

    const req = [
      "appearance","behavior","speech","mood","affect","thought process","thought content","perception","cognition","insight","judgment","safety"
    ];
    return req.filter((r) => !has(r));
  } catch {
    return [];
  }
}

function getSelectionWithin(root: HTMLElement): Selection | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  return sel;
}

function exec(cmd: string, value?: string) {
  try { document.execCommand(cmd, false, value); } catch {}
}

function surroundInlineTag(root: HTMLElement, tag: keyof HTMLElementTagNameMap) {
  const sel = getSelectionWithin(root);
  if (!sel) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;
  const el = document.createElement(tag);
  try {
    range.surroundContents(el);
  } catch {

    const text = range.toString();
    exec("insertHTML", `<${tag}>${safeText(text)}</${tag}>`);
  }
}

function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ComposerPane({
  selectedItem,
  content,
  onAction,
  registerComposerApi,
}: {
  selectedItem?: { id: string; title: string };
  content?: EvidenceSlice | undefined;
  onAction?: CenterPanelProps["onAction"];
  registerComposerApi?: (api: ComposerApi) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [frame, setFrame] = useState<FrameKind>("APSO");
  const [htmlSnapshot, setHtmlSnapshot] = useState<string>("");
  const [missing, setMissing] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const storageKey = useMemo(() => `centerpanel:composer:${selectedItem?.id ?? "none"}`, [selectedItem?.id]);
  const tokenCount = useMemo(() => tokenEstimate(htmlSnapshot), [htmlSnapshot]);
  const changeListenersRef = useRef<Array<(html: string) => void>>([]);


  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageKey);
    const initial = saved || frameTemplate("APSO");
    if (editorRef.current) editorRef.current.innerHTML = initial;
    setHtmlSnapshot(initial);
    setMissing(validateFrame(initial, frame));

  }, [storageKey]);


  const saveTimer = useRef<number | undefined>(undefined);
  const handleInput = useCallback(() => {
    const cur = editorRef.current?.innerHTML ?? "";
    setHtmlSnapshot(cur);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try { window.sessionStorage.setItem(storageKey, sanitizeHtml(cur)); } catch {}
      setMissing(validateFrame(cur, frame));

      try { changeListenersRef.current.forEach(cb => { try { cb(cur); } catch {} }); } catch {}
    }, 250);
  }, [frame, storageKey]);

  const confirmReplace = useCallback((nextLabel: string): boolean => {
    const cur = (editorRef.current?.innerText ?? "").trim();
    if (!cur) return true;

    return window.confirm(`Replace current note with ${nextLabel}?`);
  }, []);


  const seedFromExample = useCallback(() => {
    const html = sanitizeHtml(content?.exampleHtml);
    const next = html || frameTemplate(frame);
    if (!confirmReplace("Example")) return;
    if (editorRef.current) editorRef.current.innerHTML = next;
    setHtmlSnapshot(next);
    try { window.sessionStorage.setItem(storageKey, next); } catch {}
    setMissing(validateFrame(next, frame));
  }, [confirmReplace, content?.exampleHtml, frame, storageKey]);

  const seedFromPrompts = useCallback(() => {
    const html = promptsToHtml(content?.promptsText);
    const next = html || frameTemplate(frame);
    if (!confirmReplace("Prompts")) return;
    if (editorRef.current) editorRef.current.innerHTML = next;
    setHtmlSnapshot(next);
    try { window.sessionStorage.setItem(storageKey, next); } catch {}
    setMissing(validateFrame(next, frame));
  }, [confirmReplace, content?.promptsText, frame, storageKey]);

  const seedBlank = useCallback(() => {
    const next = frameTemplate(frame);
    if (!confirmReplace(`${frame} template`)) return;
    if (editorRef.current) editorRef.current.innerHTML = next;
    setHtmlSnapshot(next);
    try { window.sessionStorage.setItem(storageKey, next); } catch {}
    setMissing(validateFrame(next, frame));
  }, [confirmReplace, frame, storageKey]);


  const switchFrame = useCallback((k: FrameKind) => {
    if (k === frame) return;
    const next = frameTemplate(k);
    if (!confirmReplace(`${k} template`)) return;
    if (editorRef.current) editorRef.current.innerHTML = next;
    setFrame(k);
    setHtmlSnapshot(next);
    try { window.sessionStorage.setItem(storageKey, next); } catch {}
    setMissing(validateFrame(next, k));
  }, [confirmReplace, frame, storageKey]);


  const cmdHeading = useCallback((level: 1 | 2 | 3 | 0) => {
    const root = editorRef.current; if (!root) return;
    if (level === 0) exec("formatBlock", "p");
    else exec("formatBlock", `h${level}`);
    handleInput();
  }, [handleInput]);
  const cmdBold = useCallback(() => { exec("bold"); handleInput(); }, [handleInput]);
  const cmdItalic = useCallback(() => { exec("italic"); handleInput(); }, [handleInput]);
  const cmdUl = useCallback(() => { exec("insertUnorderedList"); handleInput(); }, [handleInput]);
  const cmdOl = useCallback(() => { exec("insertOrderedList"); handleInput(); }, [handleInput]);
  const cmdCode = useCallback(() => { const root = editorRef.current; if (!root) return; surroundInlineTag(root, "code"); handleInput(); }, [handleInput]);
  const cmdHr = useCallback(() => { exec("insertHorizontalRule"); handleInput(); }, [handleInput]);
  const cmdClear = useCallback(() => { exec("removeFormat"); handleInput(); }, [handleInput]);


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!focused) return;
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && key === "b") { e.preventDefault(); cmdBold(); }
      if (mod && key === "i") { e.preventDefault(); cmdItalic(); }
      if (mod && key === "1") { e.preventDefault(); cmdHeading(1); }
      if (mod && key === "2") { e.preventDefault(); cmdHeading(2); }
      if (mod && key === "0") { e.preventDefault(); cmdHeading(0); }
      if (mod && key === "u") { e.preventDefault(); cmdUl(); }
      if (mod && key === "o") { e.preventDefault(); cmdOl(); }
      if (mod && key === "e") { e.preventDefault(); cmdCode(); }
      if (mod && key === "-") { e.preventDefault(); cmdHr(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, cmdBold, cmdItalic, cmdHeading, cmdUl, cmdOl, cmdCode, cmdHr]);


  const exportSanitized = useCallback(() => sanitizeHtml(editorRef.current?.innerHTML || ""), []);
  const doInsert = useCallback(() => { const html = exportSanitized(); if (!html.trim()) return; onAction?.({ type: "insertToEditor", html, source: "Composer" }); }, [exportSanitized, onAction]);
  const doCopy = useCallback(() => { const html = exportSanitized(); if (!html.trim()) return; onAction?.({ type: "copyToEditor", html, source: "Composer" }); try { void navigator.clipboard?.writeText(html); } catch {} }, [exportSanitized, onAction]);
  const doDownload = useCallback(() => { const html = exportSanitized(); if (!html.trim()) return; downloadHtml(`${selectedItem?.title ?? "note"}.html`, html); }, [exportSanitized, selectedItem?.title]);
  const doPrint = useCallback(() => { const html = exportSanitized(); if (!html.trim()) return; onAction?.({ type: "openPrint", html }); }, [exportSanitized, onAction]);


  useEffect(() => {
    if (!registerComposerApi) return;
    const api: ComposerApi = {
      setHtml: (html: string) => {
        const next = sanitizeHtml(html);
        if (editorRef.current) editorRef.current.innerHTML = next;
        setHtmlSnapshot(next);
        try { window.sessionStorage.setItem(storageKey, next); } catch {}
        setMissing(validateFrame(next, frame));

        try { changeListenersRef.current.forEach(cb => { try { cb(next); } catch {} }); } catch {}
      },
      getHtml: () => sanitizeHtml(editorRef.current?.innerHTML || ""),
      onChange: (cb: (html: string) => void) => {
        changeListenersRef.current.push(cb);
      },
    };
    registerComposerApi(api);
  }, [registerComposerApi, storageKey, frame]);

  return (
    <div className="h-full flex flex-col gap-3">
      {}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm opacity-80">Seed:</div>
        <button className="px-2 py-1 text-sm rounded-md border hover:bg-muted/50" onClick={seedFromExample} aria-label="Seed from Example">From Example</button>
        <button className="px-2 py-1 text-sm rounded-md border hover:bg-muted/50" onClick={seedFromPrompts} aria-label="Seed from Prompts">From Prompts</button>
        <button className="px-2 py-1 text-sm rounded-md border hover:bg-muted/50" onClick={seedBlank} aria-label="Seed blank">Blank</button>
        <div className="mx-2 h-6 w-px bg-border" aria-hidden />
        <div className="text-sm opacity-80">Frame:</div>
        {(["APSO","SOAP","MSE"] as FrameKind[]).map(k => (
          <button
            key={k}
            className={classNames("px-2 py-1 text-sm rounded-md border", frame === k ? "font-medium" : "opacity-80 hover:opacity-100")}
            aria-pressed={frame === k}
            onClick={() => switchFrame(k)}
          >{k}</button>
        ))}

        <div className="flex-1" />
        <div className="text-xs opacity-70">≈ {tokenCount} tokens</div>
      </div>

      {}
      <div className="flex flex-wrap items-center gap-2 border rounded-md p-2 bg-muted/20">
        <button className="px-2 py-1 text-sm rounded-md border" onClick={() => cmdHeading(1)} aria-label="H1">H1</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={() => cmdHeading(2)} aria-label="H2">H2</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={() => cmdHeading(0)} aria-label="Paragraph">P</button>
        <div className="h-6 w-px bg-border" aria-hidden />
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdBold} aria-label="Bold">B</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdItalic} aria-label="Italic"><em>I</em></button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdUl} aria-label="Bulleted List">• List</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdOl} aria-label="Numbered List">1. List</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdCode} aria-label="Code">Code</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdHr} aria-label="Horizontal Rule">HR</button>
        <button className="px-2 py-1 text-sm rounded-md border" onClick={cmdClear} aria-label="Clear formatting">Clear</button>
        <div className="flex-1" />
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50" onClick={doInsert} aria-label="Insert to Editor">Insert</button>
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50" onClick={doCopy} aria-label="Copy">Copy</button>
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50" onClick={doDownload} aria-label="Download">Download</button>
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50" onClick={doPrint} aria-label="Print">Print</button>
      </div>

      {}
      {missing.length > 0 ? (
        <div className="sticky top-0 z-10 border rounded-md p-2 bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 text-sm">
          Missing sections: {missing.join(", ")}
        </div>
      ) : null}

      {}
      <div
        role="textbox"
        aria-multiline
        aria-label="Composer Editor"
        ref={editorRef}
        className="flex-1 min-h-[320px] overflow-auto border rounded-md p-3 bg-background prose max-w-none dark:prose-invert"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

export default function CenterPanel(props: CenterPanelProps) {
  const { selectedItem, content: contentProp, onAction, llm, debugCard } = props;

  const [debugSlice, setDebugSlice] = useState<EvidenceSlice | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!debugCard) { setDebugSlice(undefined); return; }
      try {
        const s = await assembleEvidenceSlice(debugCard);
        if (alive) setDebugSlice(s as unknown as EvidenceSlice);
      } catch (e) {

        console.warn('[CenterPanel][P2] assembleEvidenceSlice failed:', e);
        if (alive) setDebugSlice(undefined);
      }
    })();
    return () => { alive = false; };
  }, [debugCard?.id]);
  const content = debugSlice ?? contentProp;

  const composerApiRef = useRef<ComposerApi | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>("Viewer");
  const [lastOp, setLastOp] = useState<string>("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantPersona, setAssistantPersona] = useState<Persona>("Clinician");
  const [assistantIntent, setAssistantIntent] = useState<AssistantIntent>("explain");
  const [assistantPrompt, setAssistantPrompt] = useState<string>("");
  const [assistantResultHtml, setAssistantResultHtml] = useState<string>("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const assistantAbortRef = useRef<AbortController | null>(null);
  const [showKeymap, setShowKeymap] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const sectionId = useId();
  const tablistId = useId();
  const tabpanelId = useId();
  const assistantDialogTitleId = useId();
  const containerRef = useRef<HTMLElement | null>(null);
  const assistantRef = useRef<HTMLElement | null>(null);
  const lastLlmMsRef = useRef<number>(0);
  const lastLlmNoteRef = useRef<string>("");
  type EventKey = "insert"|"copy"|"print"|"star"|"assistant"|"actions"|"llm_call_complete";
  const eventsRef = useRef<{ t: number; k: EventKey }[]>([]);
  const emitEvent = useCallback((k: EventKey) => {
    const a = eventsRef.current; a.push({ t: Date.now(), k }); while (a.length > 5) a.shift();
  }, []);
  const [composerTokens, setComposerTokens] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  const assistantHeadings = useMemo(() => topHeadings(content?.infoHtml, 8), [content?.infoHtml]);
  const assistantCitations = useMemo(() => extractCitations(content?.referencesHtml).slice(0, 12), [content?.referencesHtml]);
  const sanitizedInfoForPrompt = useMemo(() => {
    const cleaned = sanitizeHtml(content?.infoHtml);
    return cleaned || undefined;
  }, [content?.infoHtml]);
  const sanitizedReferencesForPrompt = useMemo(() => {
    const cleaned = sanitizeHtml(content?.referencesHtml);
    return cleaned || undefined;
  }, [content?.referencesHtml]);
  const assistantCacheKey = useMemo(() =>
    selectedItem?.id ? `centerpanel:assistant:${selectedItem.id}:${assistantIntent}` : null,
    [selectedItem?.id, assistantIntent]
  );


  const infoTokens = useMemo(() => tokenEstimateHtml(content?.infoHtml), [content?.infoHtml]);
  const exampleTokens = useMemo(() => tokenEstimateHtml(content?.exampleHtml), [content?.exampleHtml]);
  const refsCount = useMemo(() => extractCitations(content?.referencesHtml).length, [content?.referencesHtml]);


  useEffect(() => {
    const set = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', set); window.addEventListener('offline', set);
    return () => { window.removeEventListener('online', set); window.removeEventListener('offline', set); };
  }, []);

  const hasCache = useMemo(() => {
    try {
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const k = window.sessionStorage.key(i) || '';
        if (k.startsWith('centerpanel:')) return true;
      }
    } catch {}
    return false;
  }, []);


  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;


      if (mod && key === "i") {
        e.preventDefault();
        const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
        onAction?.({ type: "insertToEditor", html, source: "CenterPanel" });
        setLastOp("Inserted placeholder to editor");
        emitEvent("insert");
      }

      if (mod && key === "c") {
        e.preventDefault();
        const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
        onAction?.({ type: "copyToEditor", html, source: "CenterPanel" });
        try {
          void navigator.clipboard?.writeText(html);
        } catch {}
        setLastOp("Copied placeholder HTML");
        emitEvent("copy");
      }

      if (mod && key === "p") {
        e.preventDefault();
        const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
        onAction?.({ type: "openPrint", html });
        setLastOp("Open print preview");
        emitEvent("print");
      }

      if (!mod && key === "s") {
        if (selectedItem?.id) {
          e.preventDefault();
          onAction?.({ type: "starItem", id: selectedItem.id });
          setLastOp("Starred item");
          emitEvent("star");
        }
      }

      if (!mod && (key === "?" || (e.shiftKey && key === "/"))) {
        e.preventDefault();
        setShowKeymap((v) => !v);
      }

      if (!mod && e.key === "Home") {
        e.preventDefault();
        document.querySelector<HTMLElement>('[aria-label="Viewer Content"]')?.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onAction, selectedItem?.id, emitEvent]);


  useEffect(() => {
    const container = assistantRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable && focusable[0];
    const last = focusable && focusable[focusable.length - 1];
    if (assistantOpen) {
      first?.focus();
    }
    function handleTrap(e: KeyboardEvent) {
      if (!assistantOpen) return;
      if (e.key === "Escape") {
        setAssistantOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      if (!focusable || focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", handleTrap);
    return () => {
      window.removeEventListener("keydown", handleTrap);
    };
  }, [assistantOpen]);

  useEffect(() => {
    if (!assistantCacheKey) {
      setAssistantResultHtml("");
      setAssistantError(null);
      return;
    }
    try {
      const cached = window.sessionStorage.getItem(assistantCacheKey);
      setAssistantResultHtml(cached ?? "");
      setAssistantError(null);
    } catch {
      setAssistantResultHtml("");
    }
  }, [assistantCacheKey]);

  useEffect(() => {
    if (!selectedItem) {
      setAssistantPrompt((prev) => prev.trim().length ? prev : "");
      return;
    }
    setAssistantPrompt((prev) => {
      if (prev.trim().length > 0) return prev;
      return INTENT_DEFAULT_PROMPTS[assistantIntent](selectedItem.title);
    });
  }, [assistantIntent, selectedItem]);

  useEffect(() => {
    return () => {
      const controller = assistantAbortRef.current;
      controller?.abort();
    };
  }, []);

  useEffect(() => {
    if (!assistantOpen) {
      const controller = assistantAbortRef.current;
      controller?.abort();
      assistantAbortRef.current = null;
      setAssistantLoading(false);
    }
  }, [assistantOpen]);


  function handleInsert() {
    const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
    onAction?.({ type: "insertToEditor", html, source: "CenterPanel" });
    setLastOp("Inserted placeholder to editor");
    emitEvent("insert");
  }
  function handleCopy() {
    const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
    onAction?.({ type: "copyToEditor", html, source: "CenterPanel" });
    try {
      void navigator.clipboard?.writeText(html);
    } catch {}
    setLastOp("Copied placeholder HTML");
    emitEvent("copy");
  }
  function handlePrint() {
    const html = sanitizeHtml(APSO_PLACEHOLDER_HTML);
    onAction?.({ type: "openPrint", html });
    setLastOp("Open print preview");
    emitEvent("print");
  }
  function handleStar() {
    if (selectedItem?.id) {
      onAction?.({ type: "starItem", id: selectedItem.id });
      setLastOp("Starred item");
      emitEvent("star");
    }
  }


  const callLlmTimed = useCallback(async (args: { model: 'gpt-4o'; system?: string; prompt: string }) => {
    const t0 = performance.now();
    const res = await llm(args);
    lastLlmMsRef.current = Math.round(performance.now() - t0);
    lastLlmNoteRef.current = `gpt-4o • ~${tokenEstimate(args.prompt)} tok in`;
    emitEvent('llm_call_complete');
    return res;
  }, [llm, emitEvent]);

  const handleAssistantAsk = useCallback(async () => {
    const trimmed = assistantPrompt.trim();
    if (!trimmed) return;
    assistantAbortRef.current?.abort();
    const controller = new AbortController();
    assistantAbortRef.current = controller;
    setAssistantLoading(true);
    setAssistantError(null);
    setLastOp("Assistant running…");
    try {
      let selection: string | undefined;
      try {
        const rawSelection = window.getSelection?.()?.toString() ?? "";
        const cleanSelection = rawSelection.trim();
        if (cleanSelection) {
          selection = cleanSelection.slice(0, 1000);
        }
      } catch {
        selection = undefined;
      }

      const prompt = composeAssistantPrompt(
        assistantPersona,
        assistantIntent,
        trimmed,
        {
          ...(selectedItem ? { selectedItem } : {}),
          headings: assistantHeadings,
          citations: assistantCitations,
          ...(sanitizedInfoForPrompt ? { infoHtml: sanitizedInfoForPrompt } : {}),
          ...(sanitizedReferencesForPrompt ? { referencesHtml: sanitizedReferencesForPrompt } : {}),
          ...(selection ? { userSelection: selection } : {}),
        }
      );

  const response = await callLlmTimed({ model: "gpt-4o", system: ASSISTANT_SYSTEM_MESSAGE, prompt });
      if (controller.signal.aborted) return;

      const html = ensureSectionHtml(selectedItem?.title ?? "Psychiatry Template", response);
      const clean = sanitizeHtml(html);
      setAssistantResultHtml(clean);
      setAssistantError(null);
      if (assistantCacheKey) {
        try {
          window.sessionStorage.setItem(assistantCacheKey, clean);
        } catch {}
      }
      onAction?.({ type: "assistantUsed", intent: assistantIntent });
      emitEvent("assistant");
      setLastOp("Assistant output ready");
  } catch {
      if (controller.signal.aborted) return;
      setAssistantError("Assistant request failed. Try again.");
    } finally {
      if (!controller.signal.aborted) {
        setAssistantLoading(false);
        assistantAbortRef.current = null;
      }
    }
  }, [assistantPrompt, assistantPersona, assistantIntent, assistantHeadings, assistantCitations, sanitizedInfoForPrompt, sanitizedReferencesForPrompt, callLlmTimed, selectedItem, assistantCacheKey, onAction, emitEvent]);

  const handleAssistantCancel = useCallback(() => {
    if (assistantAbortRef.current) {
      assistantAbortRef.current.abort();
      assistantAbortRef.current = null;
      setAssistantLoading(false);
      setAssistantError("Request canceled.");
    }
  }, []);

  const handleAssistantInsert = useCallback(() => {
    if (!assistantResultHtml) return;
    composerApiRef.current?.setHtml(assistantResultHtml);
    setActiveTab("Composer");
    onAction?.({ type: "insertToEditor", html: assistantResultHtml, source: "assistant" });
    emitEvent("assistant");
    setLastOp("Assistant output inserted");
  }, [assistantResultHtml, onAction, emitEvent]);

  const handleAssistantCopy = useCallback(() => {
    if (!assistantResultHtml) return;
    onAction?.({ type: "copyToEditor", html: assistantResultHtml, source: "assistant" });
    try {
      void navigator.clipboard?.writeText(assistantResultHtml);
    } catch {}
    emitEvent("assistant");
    setLastOp("Assistant output copied");
  }, [assistantResultHtml, onAction, emitEvent]);

  const handleIntentSelect = useCallback((intent: AssistantIntent) => {
    setAssistantIntent(intent);
    if (selectedItem) {
      const defaultPrompt = INTENT_DEFAULT_PROMPTS[intent](selectedItem.title);
      setAssistantPrompt((prev) => {
        if (!prev.trim()) return defaultPrompt;
        const prevDefault = INTENT_DEFAULT_PROMPTS[assistantIntent](selectedItem.title);
        return prev === prevDefault ? defaultPrompt : prev;
      });
    } else {
      const fallbackPrompt = INTENT_DEFAULT_PROMPTS[intent]("this topic");
      setAssistantPrompt((prev) => (prev.trim() ? prev : fallbackPrompt));
    }
  }, [selectedItem, assistantIntent]);

  return (
    <section
      ref={containerRef}
      aria-label="Center Panel"
      className={classNames(
        "h-full flex flex-col min-w-0 relative",
        "bg-transparent"
      )}
      id={sectionId}
    >
      {}
  <header className={classNames("border-b", "px-4 py-3", "flex items-center justify-between gap-3")} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(127,127,127,.35)' }}>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="truncate" aria-label="Breadcrumb">
              {selectedItem ? (
                <>
                  <span className="font-medium">{selectedItem.section}</span>
                  <span aria-hidden>›</span>
                  <span className="opacity-90">{selectedItem.title}</span>
                </>
              ) : (
                <span>Psychiatry Toolkit</span>
              )}
            </span>
          </div>
          <div className="mt-1 flex items-center flex-wrap gap-2">
            {selectedItem?.tags?.slice(0, 6).map((t) => (
              <span
                key={t}
                className={classNames(
                  "text-xs px-2 py-0.5 rounded-full",
                  "border bg-muted/30"
                )}
                aria-label={`Tag ${t}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50"
            onClick={handleInsert}
            aria-label="Insert to Editor (Ctrl/Cmd+I)"
          >
            Insert
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50"
            onClick={handleCopy}
            aria-label="Copy (Ctrl/Cmd+C)"
          >
            Copy
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50"
            onClick={handleStar}
            aria-label="Star (S)"
            disabled={!selectedItem}
          >
            Star
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50"
            onClick={handlePrint}
            aria-label="Print (Ctrl/Cmd+P)"
          >
            Print
          </button>
        </div>
      </header>

      {}
      <nav
        aria-label="Center tabs"
        id={tablistId}
        className={classNames("border-b", "px-2", "flex items-center gap-1")}
        style={{ borderBottom: '1px solid rgba(127,127,127,.25)', padding: '6px 10px' }}
      >
        <div role="tablist" className="flex items-center gap-1">
        {(["Viewer", "Composer", "Actions", "Calculators"] as MainTab[]).map((t) => {
          const selected = activeTab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={selected}
              aria-controls={tabpanelId}
              className={classNames(
                "px-3 py-2 text-sm rounded-t-md",
                selected ? "border-b-2 font-medium" : "opacity-80 hover:opacity-100"
              )}
              style={{
                padding: '6px 10px',
                borderBottom: selected ? '2px solid currentColor' : '2px solid transparent'
              }}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          );
        })}
        </div>
      </nav>

      {}
      <main role="region" aria-live="polite" className="flex-1 overflow-auto" aria-labelledby={tablistId}>
        <div role="tabpanel" id={tabpanelId} className="p-4" style={{ padding: '12px' }}>
          {!selectedItem ? (
            <div className="h-full min-h-[200px] grid place-items-center text-center">
              <div>
                <p className="text-base font-medium">Select an item from the library to view content.</p>
              </div>
            </div>
          ) : activeTab === "Viewer" ? (
            <ViewerPane
              selectedTitle={selectedItem?.title}
              infoHtml={content?.infoHtml}
              referencesHtml={content?.referencesHtml}
            />
          ) : activeTab === "Composer" ? (
                <ComposerPane
                  selectedItem={{ id: selectedItem.id, title: selectedItem.title }}
                  content={content}
                  onAction={onAction}
                  registerComposerApi={(api) => {
                    composerApiRef.current = api;
                    try {
                      setComposerTokens(tokenEstimateHtml(api.getHtml()));
                      api.onChange((html) => setComposerTokens(tokenEstimateHtml(html)));
                    } catch {}
                  }}
                />
          ) : activeTab === "Actions" ? (
            <ActionsPane
              selectedItem={selectedItem}
              {...(content ? { content } : {})}
              llm={callLlmTimed}
              onInsertHtml={(html) => { composerApiRef.current?.setHtml(html); setActiveTab("Composer"); onAction?.({ type: "insertToEditor", html, source: "actions" }); emitEvent("actions"); }}
              onCopyHtml={(html) => { onAction?.({ type: "copyToEditor", html, source: "actions" }); try { void navigator.clipboard?.writeText(html); } catch {} emitEvent("actions"); }}
              onAssistantUsed={(key) => {

                const map: Record<string, AssistantIntent> = {
                  structured_intake: "apso_note",
                  suicide_safety_plan: "risk_check",
                  med_lithium: "evidence_summary",
                  med_clozapine: "evidence_summary",
                  catatonia_bfcrs: "evidence_summary",
                  insomnia_ladder: "evidence_summary",
                  patient_handout: "html_form",
                };
                const intent = map[key] ?? "explain";
                onAction?.({ type: "assistantUsed", intent });
              }}
            />
          ) : (
            <CalculatorsPane
              selectedId={selectedItem?.id}
              selectedTitle={selectedItem?.title}
              onInsertHtml={(html) => onAction?.({ type: "insertToEditor", html, source: "calculators" })}
              onCopyHtml={(html) => onAction?.({ type: "copyToEditor", html, source: "calculators" })}
            />
          )}
        </div>
      </main>

      {}
      <footer aria-label="Status Bar" className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center gap-3 justify-between">
        {}
        <div className="flex items-center gap-3 min-w-0">
          {selectedItem ? (
            <span className="truncate" title={`#${selectedItem.id} · ${selectedItem.section}`}>
              <span className="font-mono">#{selectedItem.id}</span>
              <span className="mx-1">·</span>
              <span>{selectedItem.section}</span>
              <span className="mx-1">·</span>
              <span title="Tags count">tags {selectedItem.tags?.length ?? 0}</span>
            </span>
          ) : (
            <span>Idle</span>
          )}
        </div>

        {}
        <div className="flex items-center gap-2">
          <span>INFO {infoTokens}</span>
          <span>·</span>
          <span>EXAMPLE {exampleTokens}</span>
          <span>·</span>
          <span>REFS {refsCount}</span>
          <span>·</span>
          <span>COMPOSER {composerTokens}</span>
        </div>

        {}
        <div className="flex items-center gap-2">
          {lastOp ? <span title="Last action" aria-live="polite">Last: {lastOp}</span> : null}
          {lastLlmMsRef.current > 0 ? (
            <span title={lastLlmNoteRef.current}>LLM ~{lastLlmMsRef.current} ms</span>
          ) : null}
          <span title="Online status">{isOnline ? 'Online' : 'Offline'}</span>
          <span title="Cache presence">Cache {hasCache ? '●' : '○'}</span>
          <span title="Assistant availability">Assistant {typeof llm === 'function' ? 'Ready' : '—'}</span>
          <button
            type="button"
            className="px-2 py-1 rounded-md border hover:bg-muted/50"
            aria-haspopup="dialog"
            aria-expanded={showKeymap}
            onClick={() => setShowKeymap((v) => !v)}
            aria-label="Show keymap (?)"
            title="Show keymap (?)"
          >
            ?
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md border hover:bg-muted/50"
            onClick={() => {
              const snapshot = {
                id: selectedItem?.id,
                section: selectedItem?.section,
                infoTokens, exampleTokens, refsCount, composerTokens,
                lastOp, lastLlmMs: lastLlmMsRef.current, online: isOnline, now: new Date().toISOString()
              };
              try { void navigator.clipboard?.writeText(JSON.stringify(snapshot)); } catch {}
              emitEvent('copy');
              setLastOp('Debug copied');
            }}
            aria-label="Copy debug snapshot"
            title="Copy debug snapshot"
          >
            Copy debug
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md border hover:bg-muted/50"
            onClick={() => setShowEventLog(v => !v)}
            aria-expanded={showEventLog}
            aria-label="Show event log"
            title="Show event log"
          >
            Log
          </button>
        </div>
      </footer>

      {}
      {showEventLog ? (
        <div className="absolute bottom-12 right-3 z-20" role="dialog" aria-label="Event log">
          <div className="border rounded-xl shadow-sm bg-background p-3 w-64">
            <h4 className="text-sm font-medium mb-2">Last events</h4>
            <ul className="text-xs space-y-1">
              {eventsRef.current.length === 0 ? <li>None</li> : null}
              {eventsRef.current.map((e, i) => (
                <li key={i}><span className="opacity-70">{new Date(e.t).toLocaleTimeString()}</span> · {e.k}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {showKeymap ? (
        <div className="absolute bottom-12 right-3 z-20">
          <div className="border rounded-xl shadow-sm bg-background p-3 w-72">
            <h4 className="text-sm font-medium mb-2">Keyboard Shortcuts</h4>
            <ul className="text-xs space-y-1">
              <li>Ctrl/Cmd + I — Insert</li>
              <li>Ctrl/Cmd + C — Copy</li>
              <li>Ctrl/Cmd + P — Print</li>
              <li>S — Star</li>
              <li>? — Toggle this help</li>
            </ul>
          </div>
        </div>
      ) : null}

      {}
      <button
        aria-label="Open Assistant"
        aria-pressed={assistantOpen}
        className={classNames(
          "absolute bottom-4 right-4 z-10",
          "px-4 py-2 rounded-full shadow-sm border",
          "bg-background/90 backdrop-blur hover:bg-muted/60"
        )}
        onClick={() => setAssistantOpen((v) => !v)}
      >
        {assistantOpen ? "Close Assistant" : "Assistant"}
      </button>

      {}
      {assistantOpen ? (
        <aside
          ref={assistantRef}
          role="dialog"
          aria-modal={false}
          aria-labelledby={assistantDialogTitleId}
          className={classNames(
            "absolute right-4 top-4 bottom-20 z-20",
            "w-[360px] max-w-[calc(100%-2rem)]",
            "border rounded-xl shadow-xl bg-background flex flex-col overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
            <h3 id={assistantDialogTitleId} className="text-sm font-medium">Mini Assistant</h3>
            <button
              type="button"
              className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50"
              onClick={() => setAssistantOpen(false)}
              aria-label="Close assistant"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-4 pt-3 space-y-3">
            <div className="flex flex-wrap gap-2" aria-label="Assistant personas">
              {PERSONA_OPTIONS.map((persona) => (
                <button
                  key={persona}
                  type="button"
                  className={classNames(
                    "px-2 py-1 text-xs rounded-full border",
                    assistantPersona === persona ? "font-medium bg-muted/40" : "opacity-80 hover:opacity-100"
                  )}
                  aria-pressed={assistantPersona === persona}
                  onClick={() => setAssistantPersona(persona)}
                >
                  {persona}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2" aria-label="Assistant intents">
              {ASSISTANT_INTENT_ORDER.map((intent) => (
                <button
                  key={intent}
                  type="button"
                  className={classNames(
                    "px-2 py-1 text-xs rounded-md border",
                    assistantIntent === intent ? "font-medium bg-muted/40" : "opacity-80 hover:opacity-100"
                  )}
                  aria-pressed={assistantIntent === intent}
                  onClick={() => handleIntentSelect(intent)}
                >
                  {INTENT_DETAILS[intent].label}
                </button>
              ))}
            </div>

            <p className="text-xs opacity-80">{INTENT_DETAILS[assistantIntent].instruction}</p>

            <div className="text-xs border rounded-md p-2 bg-muted/10 space-y-1">
              <p>
                <span className="font-medium">Topic:</span> {selectedItem ? `${selectedItem.section} › ${selectedItem.title}` : "Select an item to ground outputs."}
              </p>
              <p className="opacity-80">
                <span className="font-medium">Headings preview:</span> {assistantHeadings.length ? assistantHeadings.slice(0, 3).join(" • ") : "None detected"}
              </p>
            </div>

            <label className="text-xs font-medium" htmlFor={`${assistantDialogTitleId}-prompt`}>
              Prompt
            </label>
            <textarea
              id={`${assistantDialogTitleId}-prompt`}
              className="w-full min-h-[100px] text-sm rounded-md border p-2 bg-background"
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
              placeholder="Describe the template, checklist, or summary you need. No dosing or directives."
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50 disabled:opacity-50"
                onClick={() => { void handleAssistantAsk(); }}
                disabled={assistantLoading || !assistantPrompt.trim()}
                aria-busy={assistantLoading}
              >
                {assistantLoading ? "Generating…" : "Ask GPT-4o"}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50 disabled:opacity-50"
                onClick={handleAssistantCancel}
                disabled={!assistantLoading}
              >
                Cancel
              </button>
            </div>

            {assistantError ? (
              <div role="alert" className="text-xs border border-destructive/40 text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {assistantError}
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50 disabled:opacity-50"
                onClick={handleAssistantInsert}
                disabled={!assistantResultHtml || assistantLoading}
              >
                Insert
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50 disabled:opacity-50"
                onClick={handleAssistantCopy}
                disabled={!assistantResultHtml}
              >
                Copy
              </button>
            </div>

            <div
              className="border rounded-md bg-muted/15 p-3 max-h-[220px] overflow-auto prose prose-sm max-w-none dark:prose-invert"
              aria-live="polite"
              role="region"
            >
              {assistantLoading ? (
                <p className="text-xs opacity-80">Generating template…</p>
              ) : assistantResultHtml ? (
                <div dangerouslySetInnerHTML={{ __html: assistantResultHtml }} />
              ) : (
                <p className="text-xs opacity-70">Run the assistant to view sanitized templates here.</p>
              )}
            </div>

            <div className="text-xs space-y-2 border-t pt-2">
              <div>
                <span className="font-medium">Grounded headings</span>
                <ul className="mt-1 space-y-1 list-disc list-inside max-h-[120px] overflow-auto">
                  {assistantHeadings.length ? (
                    assistantHeadings.map((heading) => (
                      <li key={heading}>{heading}</li>
                    ))
                  ) : (
                    <li className="list-none opacity-70">No headings detected.</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="font-medium">Citations</span>
                <ol className="mt-1 space-y-1 list-decimal list-inside max-h-[140px] overflow-auto">
                  {assistantCitations.length ? (
                    assistantCitations.map((citation, idx) => (
                      <li key={`${idx}-${citation}`}>{citation}</li>
                    ))
                  ) : (
                    <li className="list-none opacity-70">No citations provided.</li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </section>
  );
}


function ActionCard({
  id,
  title,
  description,
  busy,
  canInsert,
  onGenerate,
  onCancel,
  onInsert,
  onCopy,
  tokenMeta,
  previewHtml,
}: {
  id: string;
  title: string;
  description: string;
  busy: boolean;
  canInsert: boolean;
  onGenerate: () => void;
  onCancel: () => void;
  onInsert: () => void;
  onCopy: () => void;
  tokenMeta?: string;
  previewHtml?: string;
}) {
  const headingId = `${id}-title`;
  return (
    <div role="region" aria-labelledby={headingId} className="border rounded-lg p-3 bg-background/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={headingId} className="text-sm font-medium">{title}</h3>
          <p className="text-xs opacity-80 mt-0.5">{description}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {busy ? (
            <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={onCancel} aria-label="Cancel" disabled={!busy}>Cancel</button>
          ) : (
            <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={onGenerate} aria-label="Generate">Generate</button>
          )}
          <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50 disabled:opacity-50" onClick={onInsert} aria-label="Insert" disabled={!canInsert}>Insert</button>
          <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50 disabled:opacity-50" onClick={onCopy} aria-label="Copy" disabled={!canInsert}>Copy</button>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-70 flex items-center gap-2">
        {busy ? <span aria-live="polite">Generating…</span> : null}
        {tokenMeta ? <span className="ml-auto">{tokenMeta}</span> : null}
      </div>
      <div className="mt-2 border rounded-md bg-muted/20 max-h-[200px] overflow-auto p-2 prose max-w-none dark:prose-invert" aria-live="polite">
        {previewHtml ? (
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        ) : (
          <p className="text-xs opacity-70">No preview yet. Click Generate to create a template. Outputs are sanitized.</p>
        )}
      </div>
    </div>
  );
}

function useActionGenerator(key: ActionKey, deps: { selectedItem?: { id: string; title: string; section: string; tags?: string[] }; content?: EvidenceSlice; llm: CenterPanelProps["llm"] }) {
  const cacheKey = useMemo(() => `centerpanel:actions:${deps.selectedItem?.id ?? "none"}:${key}`,[deps.selectedItem?.id, key]);
  const [html, setHtml] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const abortedRef = useRef<boolean>(false);
  const [promptTokens, setPromptTokens] = useState<number>(0);

  useEffect(() => {
    const cached = window.sessionStorage.getItem(cacheKey);
    if (cached) setHtml(cached);
    else setHtml("");
  }, [cacheKey]);

  const generate = useCallback(async () => {
    const selected = deps.selectedItem; const content = deps.content; const callLlm = deps.llm;
    const ctx: ComposeCtx = {
      ...(selected ? { selectedItem: selected } : {}),
      ...(content ? { content } : {}),
    };
    const prompt = composeActionPrompt(key, ctx);
    setPromptTokens(tokenEstimate(prompt));
    setBusy(true);
    abortedRef.current = false;
    try {
      const raw = await callLlm({ model: "gpt-4o", system: ACTIONS_SYSTEM, prompt });
      if (abortedRef.current) return;
      const title = actionTitle(key);
      const sec = ensureSectionHtml(title, raw);
      const clean = sanitizeHtml(sec);
      setHtml(clean);
      try { window.sessionStorage.setItem(cacheKey, clean); } catch {}
    } catch {

      setHtml(prev => prev || sanitizeHtml(`<section><h2>${safeText(actionTitle(key))}</h2><p class="text-xs">Generation failed. Try again.</p><p class="text-xs"><em>Educational/documentation template. Verify with local policy and guidelines. No dosing or treatment directives.</em></p></section>`));
    } finally {
      setBusy(false);
    }
  }, [cacheKey, key, deps.selectedItem, deps.content, deps.llm]);

  const cancel = useCallback(() => { abortedRef.current = true; setBusy(false); }, []);

  return { html, setHtml, busy, generate, cancel, promptTokens };
}

function actionTitle(key: ActionKey): string {
  switch (key) {
    case "structured_intake": return "Structured Intake (APSO/MSE-ready)";
    case "suicide_safety_plan": return "Suicide Safety Plan (C-SSRS-gated)";
    case "med_lithium": return "Medication Initiation Pathway — Lithium";
    case "med_clozapine": return "Medication Initiation Pathway — Clozapine";
    case "catatonia_bfcrs": return "Catatonia (BFCRS) Summary Block";
    case "insomnia_ladder": return "Insomnia First-Line Ladder";
    case "patient_handout": return "Patient Handout (print-ready)";
  }
  return "Clinical Template";
}

function ActionsPane({
  selectedItem,
  content,
  llm,
  onInsertHtml,
  onCopyHtml,
  onAssistantUsed,
}: {
  selectedItem?: { id: string; title: string; section: string; tags?: string[] };
  content?: EvidenceSlice;
  llm: CenterPanelProps["llm"];
  onInsertHtml: (html: string) => void;
  onCopyHtml: (html: string) => void;
  onAssistantUsed?: (key: ActionKey) => void;
}) {
  const lithium = useActionGenerator("med_lithium", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const clozapine = useActionGenerator("med_clozapine", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const intake = useActionGenerator("structured_intake", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const ssp = useActionGenerator("suicide_safety_plan", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const bfcrs = useActionGenerator("catatonia_bfcrs", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const insomnia = useActionGenerator("insomnia_ladder", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });
  const handout = useActionGenerator("patient_handout", { ...(selectedItem ? { selectedItem } : {}), ...(content ? { content } : {}), llm });

  const [medChoice, setMedChoice] = useState<"lithium"|"clozapine">("lithium");

  const tokenMeta = (n: number) => (n ? `≈ ${n} tokens · est. few sec` : undefined);

  const doInsert = useCallback((key: ActionKey, html: string) => {
    if (!html) return;
    onInsertHtml(html);
    onAssistantUsed?.(key);
  }, [onAssistantUsed, onInsertHtml]);
  const doCopy = useCallback((key: ActionKey, html: string) => {
    if (!html) return;
    onCopyHtml(html);
    try { void navigator.clipboard?.writeText(html); } catch {}
    onAssistantUsed?.(key);
  }, [onAssistantUsed, onCopyHtml]);

  return (
    <div className="flex flex-col gap-4">
      <ActionCard
        id="action-intake"
        title={actionTitle("structured_intake")}
        description="APSO headings with MSE blocks and Risk & Safety bullets."
        busy={intake.busy}
        canInsert={!!intake.html}
        onGenerate={() => { void intake.generate().then(() => onAssistantUsed?.("structured_intake")); }}
        onCancel={intake.cancel}
        onInsert={() => doInsert("structured_intake", intake.html)}
        onCopy={() => doCopy("structured_intake", intake.html)}
        {...(tokenMeta(intake.promptTokens) ? { tokenMeta: tokenMeta(intake.promptTokens) as string } : {})}
        previewHtml={intake.html}
      />

      <ActionCard
        id="action-ssp"
        title={actionTitle("suicide_safety_plan")}
        description="C-SSRS gate/summary with warning signs, safety, coping, contacts, crisis and follow-up."
        busy={ssp.busy}
        canInsert={!!ssp.html}
        onGenerate={() => { void ssp.generate().then(() => onAssistantUsed?.("suicide_safety_plan")); }}
        onCancel={ssp.cancel}
        onInsert={() => doInsert("suicide_safety_plan", ssp.html)}
        onCopy={() => doCopy("suicide_safety_plan", ssp.html)}
        {...(tokenMeta(ssp.promptTokens) ? { tokenMeta: tokenMeta(ssp.promptTokens) as string } : {})}
        previewHtml={ssp.html}
      />

  <div role="region" aria-labelledby="action-med-title" className="border rounded-lg p-3 bg-background/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id="action-med-title" className="text-sm font-medium">Medication Initiation Pathways</h3>
            <p className="text-xs opacity-80 mt-0.5">Checklists only. No dosing.</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <select className="px-2 py-1 text-xs rounded-md border bg-background" aria-label="Pathway"
              value={medChoice} onChange={(e) => setMedChoice(e.target.value as "lithium"|"clozapine")}>
              <option value="lithium">Lithium</option>
              <option value="clozapine">Clozapine</option>
            </select>
            {medChoice === "lithium" ? (
              lithium.busy ? (
                <button className="px-2 py-1 text-xs rounded-md border" onClick={lithium.cancel}>Cancel</button>
              ) : (
                <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={() => lithium.generate().then(() => onAssistantUsed?.("med_lithium"))}>Generate</button>
              )
            ) : (
              clozapine.busy ? (
                <button className="px-2 py-1 text-xs rounded-md border" onClick={clozapine.cancel}>Cancel</button>
              ) : (
                <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={() => clozapine.generate().then(() => onAssistantUsed?.("med_clozapine"))}>Generate</button>
              )
            )}
            <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50 disabled:opacity-50"
              onClick={() => doInsert(medChoice === "lithium" ? "med_lithium" : "med_clozapine", medChoice === "lithium" ? lithium.html : clozapine.html)}
              disabled={medChoice === "lithium" ? !lithium.html : !clozapine.html}
              aria-label="Insert">Insert</button>
            <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50 disabled:opacity-50"
              onClick={() => doCopy(medChoice === "lithium" ? "med_lithium" : "med_clozapine", medChoice === "lithium" ? lithium.html : clozapine.html)}
              disabled={medChoice === "lithium" ? !lithium.html : !clozapine.html}
              aria-label="Copy">Copy</button>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-70 flex items-center gap-2">
          {medChoice === "lithium" ? (tokenMeta(lithium.promptTokens) ? <span>{tokenMeta(lithium.promptTokens)}</span> : null) : (tokenMeta(clozapine.promptTokens) ? <span>{tokenMeta(clozapine.promptTokens)}</span> : null)}
        </div>
        <div className="mt-2 border rounded-md bg-muted/20 max-h-[200px] overflow-auto p-2 prose max-w-none dark:prose-invert" aria-live="polite">
          {(medChoice === "lithium" ? lithium.html : clozapine.html) ? (
            <div dangerouslySetInnerHTML={{ __html: medChoice === "lithium" ? lithium.html : clozapine.html }} />
          ) : (
            <p className="text-xs opacity-70">No preview yet. Click Generate.</p>
          )}
        </div>
      </div>

      <ActionCard
        id="action-bfcrs"
        title={actionTitle("catatonia_bfcrs")}
        description="Core signs domains, assessment flow, and monitoring checks."
        busy={bfcrs.busy}
        canInsert={!!bfcrs.html}
        onGenerate={() => { void bfcrs.generate().then(() => onAssistantUsed?.("catatonia_bfcrs")); }}
        onCancel={bfcrs.cancel}
        onInsert={() => doInsert("catatonia_bfcrs", bfcrs.html)}
        onCopy={() => doCopy("catatonia_bfcrs", bfcrs.html)}
        {...(tokenMeta(bfcrs.promptTokens) ? { tokenMeta: tokenMeta(bfcrs.promptTokens) as string } : {})}
        previewHtml={bfcrs.html}
      />

      <ActionCard
        id="action-insomnia"
        title={actionTitle("insomnia_ladder")}
        description="Sleep hygiene, stimulus control, CBT-I bullets, and referral indicators."
        busy={insomnia.busy}
        canInsert={!!insomnia.html}
        onGenerate={() => { void insomnia.generate().then(() => onAssistantUsed?.("insomnia_ladder")); }}
        onCancel={insomnia.cancel}
        onInsert={() => doInsert("insomnia_ladder", insomnia.html)}
        onCopy={() => doCopy("insomnia_ladder", insomnia.html)}
        {...(tokenMeta(insomnia.promptTokens) ? { tokenMeta: tokenMeta(insomnia.promptTokens) as string } : {})}
        previewHtml={insomnia.html}
      />

      <ActionCard
        id="action-handout"
        title={actionTitle("patient_handout")}
        description="Print-ready article: definition, urgent care indicators, self-care tips, contacts."
        busy={handout.busy}
        canInsert={!!handout.html}
        onGenerate={() => { void handout.generate().then(() => onAssistantUsed?.("patient_handout")); }}
        onCancel={handout.cancel}
        onInsert={() => doInsert("patient_handout", handout.html)}
        onCopy={() => doCopy("patient_handout", handout.html)}
        {...(tokenMeta(handout.promptTokens) ? { tokenMeta: tokenMeta(handout.promptTokens) as string } : {})}
        previewHtml={handout.html}
      />
    </div>
  );
}


function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function persist<T>(key: string, value: T): void {
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function restore<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw) as T;
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function severityPhq9(total: number): string {
  if (total <= 4) return "Minimal";
  if (total <= 9) return "Mild";
  if (total <= 14) return "Moderate";
  if (total <= 19) return "Moderately severe";
  return "Severe";
}

function severityGad7(total: number): string {
  if (total <= 4) return "Minimal";
  if (total <= 9) return "Mild";
  if (total <= 14) return "Moderate";
  return "Severe";
}

function severityIsi(total: number): string {
  if (total <= 7) return "None";
  if (total <= 14) return "Subthreshold";
  if (total <= 21) return "Moderate";
  return "Severe";
}

function pcl5Clusters(items: number[]): { B: number; C: number; D: number; E: number; meets: boolean } {
  const atLeast2 = (n: number) => n >= 2;
  const B = items.slice(0, 5).filter(atLeast2).length;
  const C = items.slice(5, 7).filter(atLeast2).length;
  const D = items.slice(7, 14).filter(atLeast2).length;
  const E = items.slice(14, 20).filter(atLeast2).length;
  const meets = B >= 1 && C >= 1 && D >= 2 && E >= 2;
  return { B, C, D, E, meets };
}

function auditCPositive(total: number): boolean {
  return total >= 4;
}

type SummaryData =
  | { kind: "PHQ-9"; total: number; siFlag: boolean; interpretation?: string }
  | { kind: "GAD-7"; total: number; interpretation?: string }
  | { kind: "ISI"; total: number; interpretation?: string }
  | { kind: "PCL-5"; total: number; clusters: { B: number; C: number; D: number; E: number; meets: boolean } }
  | { kind: "AUDIT-C"; total: number };

function getInterpretation(x: unknown): string {
  return (x as { interpretation?: string } | undefined)?.interpretation ?? "";
}

function buildSummaryHtml(kind: string, data: SummaryData | Record<string, unknown>): string {
  const wrap = (inner: string) => sanitizeHtml(`<section>${inner}</section>`);
  if (kind === "PHQ-9") {
  const d = data as Extract<SummaryData, { kind: "PHQ-9" }>;
    const total = d.total as number;
    const band = severityPhq9(total);
  const siFlag = (d.siFlag ? "Positive" : "Negative");
  const interp = getInterpretation(d);
    return wrap(`
  <h3>PHQ-9 — Total: ${total} (${band})</h3>
  <ul>
    <li>Item 9 SI flag: ${siFlag}</li>
    <li>Interpretation: ${safeText(interp)}</li>
  </ul>
  <p class="text-xs"><em>Educational/documentation template. Verify with local policy; not a diagnosis.</em></p>
`);
  }
  if (kind === "GAD-7") {
  const d = data as Extract<SummaryData, { kind: "GAD-7" }>;
    const total = d.total as number;
    const band = severityGad7(total);
  const interp = getInterpretation(d);
    return wrap(`
  <h3>GAD-7 — Total: ${total} (${band})</h3>
  <ul>
    <li>Interpretation: ${safeText(interp)}</li>
  </ul>
  <p class="text-xs"><em>Educational/documentation template. Verify with local policy; not a diagnosis.</em></p>
`);
  }
  if (kind === "ISI") {
  const d = data as Extract<SummaryData, { kind: "ISI" }>;
    const total = d.total as number;
    const band = severityIsi(total);
  const interp = getInterpretation(d);
    return wrap(`
  <h3>ISI — Total: ${total} (${band})</h3>
  <ul>
    <li>Interpretation: ${safeText(interp)}</li>
  </ul>
  <p class="text-xs"><em>Educational/documentation template. Verify with local policy; not a diagnosis.</em></p>
`);
  }
  if (kind === "PCL-5") {
    const d = data as Extract<SummaryData, { kind: "PCL-5" }>;
    const total = d.total as number;
    const clusters = d.clusters as { B: number; C: number; D: number; E: number; meets: boolean };
    const threshold = total >= 33 ? "Yes" : "No";
    return wrap(`
  <h3>PCL-5 — Total: ${total}</h3>
  <ul>
    <li>Screen-positive at ≥33: ${threshold} (institutional thresholds may vary)</li>
    <li>Clusters: B=${clusters.B}, C=${clusters.C}, D=${clusters.D}, E=${clusters.E}; Meets cluster criteria: ${clusters.meets ? "Yes" : "No"}</li>
  </ul>
  <p class="text-xs"><em>Screening aid only; verify with local policy. Not a diagnosis.</em></p>
`);
  }
  if (kind === "AUDIT-C") {
    const d = data as Extract<SummaryData, { kind: "AUDIT-C" }>;
    const total = d.total as number;
    const screen = auditCPositive(total) ? "Yes" : "No";
    return wrap(`
  <h3>AUDIT-C — Total: ${total}</h3>
  <ul>
    <li>Screen-positive: ${screen}; thresholds may vary (e.g., ≥3 women, ≥4 men).</li>
  </ul>
  <p class="text-xs"><em>Educational/documentation template. Verify with local policy; not a diagnosis.</em></p>
`);
  }
  return wrap(`<p>Unknown calculator.</p>`);
}


function CalculatorCard({
  title,
  subtitle,
  rightMeta,
  onInsert,
  onCopy,
  onReset,
  children,
}: {
  title: string;
  subtitle?: string;
  rightMeta?: string | React.ReactNode;
  onInsert: () => void;
  onCopy: () => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border rounded-lg mb-4">
      <header className="px-3 py-2 flex items-center justify-between gap-3 border-b">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{title}</div>
          {subtitle ? <div className="text-xs opacity-80 truncate">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          {rightMeta ? <div className="text-sm opacity-90">{rightMeta}</div> : null}
          <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={onReset} aria-label="Reset">Reset</button>
          <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={onCopy} aria-label="Copy summary">Copy</button>
          <button className="px-2 py-1 text-xs rounded-md border hover:bg-muted/50" onClick={onInsert} aria-label="Insert summary">Insert</button>
        </div>
      </header>
      <div className="p-3">
        {children}
      </div>
    </section>
  );
}


function RadiosRow({ name, value, max, onChange }: { name: string; value: number; max: number; onChange: (v: number) => void }) {
  const choices = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div role="radiogroup" aria-label={`${name} choices`} className="flex items-center gap-2 flex-wrap">
      {choices.map((v) => {
        const id = `${name}-${v}`;
        return (
          <span key={v} className="inline-flex items-center gap-1">
            <input id={id} type="radio" name={name} value={v}
              checked={value === v}
              onChange={() => onChange(v)}
            />
            <label htmlFor={id} className="text-sm">{v}</label>
          </span>
        );
      })}
    </div>
  );
}

function Phq9Card({ selectedId, onInsertHtml, onCopyHtml, onSummaryChange }: { selectedId?: string | undefined; onInsertHtml: (h: string) => void; onCopyHtml: (h: string) => void; onSummaryChange: (h: string) => void }) {
  const key = `centerpanel:calc:${selectedId ?? "none"}:phq9`;
  const [items, setItems] = useState<number[]>(() => restore<number[]>(key, Array(9).fill(0)));
  useEffect(() => { setItems(restore<number[]>(key, Array(9).fill(0))); }, [key]);
  useEffect(() => { persist(key, items); }, [key, items]);

  const total = sum(items);
  const band = severityPhq9(total);
  const siFlag = items[8] >= 1;
  const interpretation = "Screening result for documentation; verify locally.";
  const summary = useMemo(() => buildSummaryHtml("PHQ-9", { total, siFlag, interpretation }), [total, siFlag]);
  useEffect(() => { onSummaryChange(summary); }, [summary, onSummaryChange]);

  const changeAt = (idx: number, v: number) => {
    setItems((arr) => {
      const n = arr.slice(); n[idx] = clamp(v, 0, 3); return n;
    });
  };
  const reset = () => setItems(Array(9).fill(0));
  const insert = () => onInsertHtml(summary);
  const copy = () => { onCopyHtml(summary); try { void navigator.clipboard?.writeText(summary); } catch {} };

  return (
    <CalculatorCard
      title="PHQ-9"
      subtitle="9 items, 0–3 each"
      rightMeta={<span>Total: {total} ({band}) {siFlag ? <span className="ml-2 text-red-600 dark:text-red-400">SI flag</span> : null}</span>}
      onInsert={insert}
      onCopy={copy}
      onReset={reset}
    >
      <fieldset>
        <legend className="text-sm font-medium mb-2">PHQ-9 Items</legend>
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <label className="text-sm" htmlFor={`phq9-${idx}-0`}>Item {idx + 1}</label>
              <RadiosRow name={`phq9-${idx}`} value={val} max={3} onChange={(v) => changeAt(idx, v)} />
            </div>
          ))}
        </div>
      </fieldset>
    </CalculatorCard>
  );
}

function Gad7Card({ selectedId, onInsertHtml, onCopyHtml, onSummaryChange }: { selectedId?: string | undefined; onInsertHtml: (h: string) => void; onCopyHtml: (h: string) => void; onSummaryChange: (h: string) => void }) {
  const key = `centerpanel:calc:${selectedId ?? "none"}:gad7`;
  const [items, setItems] = useState<number[]>(() => restore<number[]>(key, Array(7).fill(0)));
  useEffect(() => { setItems(restore<number[]>(key, Array(7).fill(0))); }, [key]);
  useEffect(() => { persist(key, items); }, [key, items]);
  const total = sum(items);
  const band = severityGad7(total);
  const interpretation = "Screening result for documentation; verify locally.";
  const summary = useMemo(() => buildSummaryHtml("GAD-7", { total, interpretation }), [total]);
  useEffect(() => { onSummaryChange(summary); }, [summary, onSummaryChange]);
  const changeAt = (idx: number, v: number) => setItems((arr) => { const n = arr.slice(); n[idx] = clamp(v, 0, 3); return n; });
  const reset = () => setItems(Array(7).fill(0));
  const insert = () => onInsertHtml(summary);
  const copy = () => { onCopyHtml(summary); try { void navigator.clipboard?.writeText(summary); } catch {} };
  return (
    <CalculatorCard title="GAD-7" subtitle="7 items, 0–3 each" rightMeta={<span>Total: {total} ({band})</span>} onInsert={insert} onCopy={copy} onReset={reset}>
      <fieldset>
        <legend className="text-sm font-medium mb-2">GAD-7 Items</legend>
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <label className="text-sm" htmlFor={`gad7-${idx}-0`}>Item {idx + 1}</label>
              <RadiosRow name={`gad7-${idx}`} value={val} max={3} onChange={(v) => changeAt(idx, v)} />
            </div>
          ))}
        </div>
      </fieldset>
    </CalculatorCard>
  );
}

function IsiCard({ selectedId, onInsertHtml, onCopyHtml, onSummaryChange }: { selectedId?: string | undefined; onInsertHtml: (h: string) => void; onCopyHtml: (h: string) => void; onSummaryChange: (h: string) => void }) {
  const key = `centerpanel:calc:${selectedId ?? "none"}:isi`;
  const [items, setItems] = useState<number[]>(() => restore<number[]>(key, Array(7).fill(0)));
  useEffect(() => { setItems(restore<number[]>(key, Array(7).fill(0))); }, [key]);
  useEffect(() => { persist(key, items); }, [key, items]);
  const total = sum(items);
  const band = severityIsi(total);
  const interpretation = "Screening result for documentation; verify locally.";
  const summary = useMemo(() => buildSummaryHtml("ISI", { total, interpretation }), [total]);
  useEffect(() => { onSummaryChange(summary); }, [summary, onSummaryChange]);
  const changeAt = (idx: number, v: number) => setItems((arr) => { const n = arr.slice(); n[idx] = clamp(v, 0, 4); return n; });
  const reset = () => setItems(Array(7).fill(0));
  const insert = () => onInsertHtml(summary);
  const copy = () => { onCopyHtml(summary); try { void navigator.clipboard?.writeText(summary); } catch {} };
  return (
    <CalculatorCard title="ISI" subtitle="7 items, 0–4 each" rightMeta={<span>Total: {total} ({band})</span>} onInsert={insert} onCopy={copy} onReset={reset}>
      <fieldset>
        <legend className="text-sm font-medium mb-2">ISI Items</legend>
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <label className="text-sm" htmlFor={`isi-${idx}-0`}>Item {idx + 1}</label>
              <RadiosRow name={`isi-${idx}`} value={val} max={4} onChange={(v) => changeAt(idx, v)} />
            </div>
          ))}
        </div>
      </fieldset>
    </CalculatorCard>
  );
}

function Pcl5Card({ selectedId, onInsertHtml, onCopyHtml, onSummaryChange }: { selectedId?: string | undefined; onInsertHtml: (h: string) => void; onCopyHtml: (h: string) => void; onSummaryChange: (h: string) => void }) {
  const key = `centerpanel:calc:${selectedId ?? "none"}:pcl5`;
  const [items, setItems] = useState<number[]>(() => restore<number[]>(key, Array(20).fill(0)));
  useEffect(() => { setItems(restore<number[]>(key, Array(20).fill(0))); }, [key]);
  useEffect(() => { persist(key, items); }, [key, items]);
  const total = sum(items);
  const clusters = pcl5Clusters(items);
  const summary = useMemo(() => buildSummaryHtml("PCL-5", { total, clusters }), [total, clusters]);
  useEffect(() => { onSummaryChange(summary); }, [summary, onSummaryChange]);
  const changeAt = (idx: number, v: number) => setItems((arr) => { const n = arr.slice(); n[idx] = clamp(v, 0, 4); return n; });
  const reset = () => setItems(Array(20).fill(0));
  const insert = () => onInsertHtml(summary);
  const copy = () => { onCopyHtml(summary); try { void navigator.clipboard?.writeText(summary); } catch {} };
  const threshold = total >= 33;
  return (
    <CalculatorCard title="PCL-5" subtitle="20 items, 0–4 each" rightMeta={<span>Total: {total} {threshold ? <span className="ml-2">≥33</span> : null}</span>} onInsert={insert} onCopy={copy} onReset={reset}>
      <fieldset>
        <legend className="text-sm font-medium mb-2">PCL-5 Items</legend>
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <label className="text-sm" htmlFor={`pcl5-${idx}-0`}>Item {idx + 1}</label>
              <RadiosRow name={`pcl5-${idx}`} value={val} max={4} onChange={(v) => changeAt(idx, v)} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs opacity-80">Clusters (score ≥2): B={clusters.B}, C={clusters.C}, D={clusters.D}, E={clusters.E}; Meets criteria: {clusters.meets ? "Yes" : "No"}</div>
      </fieldset>
    </CalculatorCard>
  );
}

function AuditCCard({ selectedId, onInsertHtml, onCopyHtml, onSummaryChange }: { selectedId?: string | undefined; onInsertHtml: (h: string) => void; onCopyHtml: (h: string) => void; onSummaryChange: (h: string) => void }) {
  const key = `centerpanel:calc:${selectedId ?? "none"}:auditc`;
  const [items, setItems] = useState<number[]>(() => restore<number[]>(key, Array(3).fill(0)));
  useEffect(() => { setItems(restore<number[]>(key, Array(3).fill(0))); }, [key]);
  useEffect(() => { persist(key, items); }, [key, items]);
  const total = sum(items);
  const screen = auditCPositive(total);
  const summary = useMemo(() => buildSummaryHtml("AUDIT-C", { total }), [total]);
  useEffect(() => { onSummaryChange(summary); }, [summary, onSummaryChange]);
  const changeAt = (idx: number, v: number) => setItems((arr) => { const n = arr.slice(); n[idx] = clamp(v, 0, 4); return n; });
  const reset = () => setItems(Array(3).fill(0));
  const insert = () => onInsertHtml(summary);
  const copy = () => { onCopyHtml(summary); try { void navigator.clipboard?.writeText(summary); } catch {} };
  return (
    <CalculatorCard title="AUDIT-C" subtitle="3 items, 0–4 each" rightMeta={<span>Total: {total} ({screen ? "screen+" : "screen-"})</span>} onInsert={insert} onCopy={copy} onReset={reset}>
      <fieldset>
        <legend className="text-sm font-medium mb-2">AUDIT-C Items</legend>
        <div className="space-y-2">
          {items.map((val, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <label className="text-sm" htmlFor={`auditc-${idx}-0`}>Item {idx + 1}</label>
              <RadiosRow name={`auditc-${idx}`} value={val} max={4} onChange={(v) => changeAt(idx, v)} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs opacity-80">Screen-positive threshold commonly ≥4; some orgs use ≥3 for women and ≥4 for men.</div>
      </fieldset>
    </CalculatorCard>
  );
}


function CalculatorsPane({
  selectedId,
  selectedTitle,
  onInsertHtml,
  onCopyHtml,
}: {
  selectedId?: string;
  selectedTitle?: string;
  onInsertHtml: (html: string) => void;
  onCopyHtml: (html: string) => void;
}) {
  const phq9Ref = useRef<string>("");
  const gad7Ref = useRef<string>("");
  const isiRef = useRef<string>("");
  const pcl5Ref = useRef<string>("");
  const auditcRef = useRef<string>("");

  const combined = useMemo(() => {
    const parts = [phq9Ref.current, gad7Ref.current, isiRef.current, pcl5Ref.current, auditcRef.current].filter(Boolean);
    const inner = parts.join("\n");
    if (!inner) return "";
    return sanitizeHtml(`<section>
  <h2>Screening Summaries${selectedTitle ? ` — ${safeText(selectedTitle)}` : ""}</h2>
  ${inner}
</section>`);

  }, [selectedTitle]);

  const insertAll = () => { if (!combined) return; onInsertHtml(combined); };
  const tokenCount = useMemo(() => tokenEstimate(combined), [combined]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted/50" onClick={insertAll} aria-label="Insert all summaries">
          Insert all summaries
        </button>
        <div className="flex-1" />
        <div className="text-xs opacity-70">≈ {tokenCount} tokens</div>
      </div>

      <Phq9Card selectedId={selectedId} onInsertHtml={onInsertHtml} onCopyHtml={onCopyHtml} onSummaryChange={(h) => { phq9Ref.current = h; }} />
      <Gad7Card selectedId={selectedId} onInsertHtml={onInsertHtml} onCopyHtml={onCopyHtml} onSummaryChange={(h) => { gad7Ref.current = h; }} />
      <IsiCard selectedId={selectedId} onInsertHtml={onInsertHtml} onCopyHtml={onCopyHtml} onSummaryChange={(h) => { isiRef.current = h; }} />
      <Pcl5Card selectedId={selectedId} onInsertHtml={onInsertHtml} onCopyHtml={onCopyHtml} onSummaryChange={(h) => { pcl5Ref.current = h; }} />
      <AuditCCard selectedId={selectedId} onInsertHtml={onInsertHtml} onCopyHtml={onCopyHtml} onSummaryChange={(h) => { auditcRef.current = h; }} />
    </div>
  );
}
