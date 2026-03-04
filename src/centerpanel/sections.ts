export type Subsection = { id: string; title: string };
export type Section = {
  id:
    | "overview"
    | "red-flags"
    | "differential"
    | "workup"
    | "interventions"
    | "monitoring"
    | "references";
  title: string;
  children?: Subsection[];
};

export const SECTIONS: Section[] = [
  { id: "overview", title: "Overview" },
  { id: "red-flags", title: "Red Flags" },
  { id: "differential", title: "Differential" },
  {
    id: "workup",
    title: "Work-up",
    children: [
      { id: "initial-labs", title: "Initial labs" },
      { id: "imaging", title: "Imaging" },
      { id: "consults", title: "Consults" },
    ],
  },
  {
    id: "interventions",
    title: "Interventions",
    children: [
      { id: "non-pharm", title: "Non-pharm" },
      { id: "challenge-link", title: "Lorazepam challenge (flow)" },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    children: [
      { id: "vitals", title: "Vitals & sedation" },
      { id: "bfcrs-delta", title: "BFCRS delta" },
    ],
  },
  { id: "references", title: "References" },
];

export const MAIN_SCROLL_ROOT_ID = "cp3-main-scroll-root";


export const anchorId = (sectionId: string, prefix = "cp-sec") => `${prefix}--${sectionId}`;


export const anchorSubId = (sectionId: string, subId: string, prefix = "cp-sec") =>
  `${anchorId(sectionId, prefix)}__${subId}`;
