import { PSYCHOTHERAPIES } from "@/features/psychiatry/content/psychotherapies";
import { MEDICATION_SELECTION } from "@/features/psychiatry/content/medicationSelection";
import { MEDICATION_ORDERS_MONITORING } from "@/features/psychiatry/content/medicationOrdersMonitoring";
import { FOLLOWUP_MONITORING } from "@/features/psychiatry/content/followUpMonitoring";
import { PSYCHOEDUCATION } from "@/features/psychiatry/content/psychoeducation";
import { PROGRESS_NOTES_LETTERS } from "@/features/psychiatry/content/progressNotesLetters";
import { PATIENT_HANDOUTS } from "@/features/psychiatry/content/patientHandouts";
import { ETHICS_CONSENT } from "@/features/psychiatry/content/ethicsConsent";
import { CAMHS_CHILD_ADOLESCENT } from "@/features/psychiatry/content/camhsChildAdolescent";
import { GROUP_VISITS_PROGRAMS } from "@/features/psychiatry/content/groupVisitsPrograms";
import { CASE_FORMS_LETTERS } from "@/features/psychiatry/content/caseFormsLetters";
import { NEUROPSYCH_MED_LIAISON } from "@/features/psychiatry/content/neuropsychMedicalLiaison";
import { PSYCHOMETRICS } from "@/features/psychiatry/content/psychometrics";


const baseRegistry = {
  "Treatment Planning & Interventions": {
    Psychotherapies: PSYCHOTHERAPIES,
    "Medication Selection": MEDICATION_SELECTION,
    "Medication Orders & Monitoring": MEDICATION_ORDERS_MONITORING,
  },
  "Follow-up & Documentation": {
    "Follow-up & Monitoring": FOLLOWUP_MONITORING,
    "Progress Notes & Letters": PROGRESS_NOTES_LETTERS,
  },
  "Education, Consent & Handouts": {
    Psychoeducation: PSYCHOEDUCATION,

    "Patient Handouts": [] as unknown[],

    "Ethics & Consent": [] as unknown[],
  },
  "Special Populations & Liaison": {

    "Child & Adolescent (CAMHS)": [] as unknown[],

    "Group Visits & Programs": [] as unknown[],

    "Case Forms & Letters": [] as unknown[],

    "Neuropsychiatry & Medical Liaison": [] as unknown[],
  },
  "Psychometric Scales & Diaries": {
    "Scales & Diaries": PSYCHOMETRICS as unknown[],
  },
} as const;


export const registry = {
  ...baseRegistry,
  "Education, Consent & Handouts": {
    ...baseRegistry["Education, Consent & Handouts"],
    "Patient Handouts": PATIENT_HANDOUTS,
    "Ethics & Consent": ETHICS_CONSENT,
  },
  "Special Populations & Liaison": {
    ...(baseRegistry["Special Populations & Liaison"] as Record<string, unknown>),
    "Child & Adolescent (CAMHS)": CAMHS_CHILD_ADOLESCENT,
    "Group Visits & Programs": GROUP_VISITS_PROGRAMS,
    "Case Forms & Letters": CASE_FORMS_LETTERS,
    "Neuropsychiatry & Medical Liaison": NEUROPSYCH_MED_LIAISON,
  },
  "Psychometric Scales & Diaries": {
    ...(baseRegistry["Psychometric Scales & Diaries"] as Record<string, unknown>),
    "Scales & Diaries": PSYCHOMETRICS,
  },
} as const;

export type RightPanelRegistry = typeof registry;