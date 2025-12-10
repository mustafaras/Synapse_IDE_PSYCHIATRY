


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { copyText, downloadAs, openInNewTab, printHtml } from '@/components/ai/psychiatry/utils/exporters';
import type { Card } from './lib/types';
import {
  assembleFourBlock,
  detectProfile,
  extractPlainText,
  formatApa,
  generatePageDoc,
  loadLS,
  LS_KEYS,
  mapCamhsItemToFourBlocks,
  mapCaseLetterItemToFourBlocks,
  mapConsentItemToFourBlocks,
  mapEduItemToFourBlocks,
  mapFollowUpItemToFourBlocks,
  mapGroupItemToFourBlocks,
  mapHandoutItemToFourBlocks,
  mapMedicationItemToFourBlocks,
  mapMedOrderItemToFourBlocks,
  mapNeuroItemToFourBlocks,
  mapPNItemToFourBlocks,
  mapPsychotherapyItemToFourBlocks,
  sanitizeHtml,
  saveLS,
} from './rightPanelUtils';
import { normalizeBundle } from './content/normalize';
import { getSection8Bundle, resolveSection8RPKey } from './content/section8.registry';
import { getWeeklyBundleFromId, normalizeWeeklyId } from './content/weekly.index';
import { getLastLeafBundle, mapToLastLeafKey } from './content/lastLeaf.index';
import { PSYCHOTHERAPIES, type PsychotherapyItem } from './content/psychotherapies';
import { MEDICATION_SELECTION, type MedItem } from './content/medicationSelection';
import { MEDICATION_ORDERS_MONITORING, type MedOrderItem } from './content/medicationOrdersMonitoring';
import { type FollowItem, FOLLOWUP_MONITORING } from './content/followUpMonitoring';
import { type EduItem, PSYCHOEDUCATION } from './content/psychoeducation';
import { type PNItem, PROGRESS_NOTES_LETTERS } from './content/progressNotesLetters';
import { type HandoutItem, PATIENT_HANDOUTS } from './content/patientHandouts';
import { type ConsentItem, ETHICS_CONSENT } from './content/ethicsConsent';
import { CAMHS_CHILD_ADOLESCENT, type CamhsItem } from './content/camhsChildAdolescent';
import { GROUP_VISITS_PROGRAMS, type GroupItem } from './content/groupVisitsPrograms';
import { CASE_FORMS_LETTERS, type CaseLetterItem } from './content/caseFormsLetters';
import { type NeuroItem, NEUROPSYCH_MED_LIAISON } from './content/neuropsychMedicalLiaison';
import { registry } from './rightPanelRegistry';
import { section8HeaderLabel } from '@/features/psychiatry/utils/titleResolver';
import { type PsychometricItem as PMItem, PSYCHOMETRICS } from './content/psychometrics';


type RightPanelFourBlockProps = { card: Card | null; onClose?: () => void; onToggleCollapse?: () => void };


type PreviewTab = 'plain' | 'html' | 'render';


const RightPanelFourBlock: React.FC<RightPanelFourBlockProps> = ({ card, onClose  }) => {

  const [currentCmdIndex, setCurrentCmdIndex] = useState<number>(-1);
  const [tab, setTab] = useState<PreviewTab>(loadLS<PreviewTab>(LS_KEYS.tab, 'render'));
  const [density, setDensity] = useState<'compact' | 'comfort'>(loadLS(LS_KEYS.density, 'comfort'));
  const [renderMode, setRenderMode] = useState<'inline'|'page'>(loadLS<'inline'|'page'>(LS_KEYS.renderMode,'page'));
  const [refQuery, setRefQuery] = useState('');
  const [lastCopiedRef, setLastCopiedRef] = useState<number|null>(null);
  const [refKind, setRefKind] = useState<'all'|'guideline'|'validation'|'overview'|'implementation'|'safety'|'other'>('all');
  const profile = card ? detectProfile(card) : 'generic';
  const [lastProfile, setLastProfile] = useState(profile);
  const [refFade, setRefFade] = useState(false);


  useEffect(()=> saveLS(LS_KEYS.tab, tab), [tab]);
  useEffect(()=> saveLS(LS_KEYS.density, density), [density]);
  useEffect(()=> saveLS(LS_KEYS.renderMode, renderMode), [renderMode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape'){ onClose?.(); return; }
      if(!card) return;
      if(e.altKey){
        if(['1','2','3','4'].includes(e.key)){
          const idMap: Record<string,string> = { '1':'rp-info', '2':'rp-example', '3':'rp-refs', '4':'rp-cmds' };
          document.getElementById(idMap[e.key])?.focus();
        } else if(e.key==='[' || e.key===']') {
          e.preventDefault();
          const order: PreviewTab[] = ['plain','html','render'];
          const i = order.indexOf(tab);
          setTab(e.key==='[' ? order[(i+3-1)%3] : order[(i+1)%3]);
        } else if(e.key.toLowerCase()==='d'){ e.preventDefault(); setDensity(d=> d==='compact' ? 'comfort':'compact'); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, card, currentCmdIndex, tab, density]);

  useEffect(()=> {
    if(profile !== lastProfile){
      setRefFade(true); setLastProfile(profile);
      const t = setTimeout(()=> setRefFade(false), 450);
      return () => clearTimeout(t);
    }
    return () => {};
  }, [profile, lastProfile]);


  try {
    const expectedTitles = new Set<string>([
      'Patient Handout — Depression (Print-ready Handout)',
      'Sleep Hygiene Checklist (Printable)',
      'Crisis Resources Card (Wallet-size Layout Option)',
      'Medication Start — Generic Info Sheet (SSRI/SNRI/Atypical)',
    ]);
    const subgroup = registry["Education, Consent & Handouts"];
    const items = (subgroup && (subgroup as Record<string, unknown>)["Patient Handouts"]) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const titles = new Set<string>(list.map(i => i?.title || ''));
    expectedTitles.forEach(t => { if (!titles.has(t)) { throw new Error(`Missing Patient Handouts item: ${t}`); } });
  } catch {}

  try {
    const expected = new Set<string>([
      'Informed Consent — Medication (Generic)',
      'Psychotherapy Consent & Boundaries',
      'Telepsychiatry Consent (Non-jurisdictional)',
      'Confidentiality & Limits — Patient Explainer',
    ]);
    const subgroup = registry["Education, Consent & Handouts"];
    const items = (subgroup && (subgroup as Record<string, unknown>)["Ethics & Consent"]) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const got = new Set<string>(list.map(i => i?.title || ''));
  expected.forEach(t => { if (!got.has(t)) throw new Error(`Missing Ethics & Consent item: ${t}`); });
  } catch {}

  try {
    const expectedCamhsTitles = new Set([
      'CAMHS Intake & School Liaison Summary (Scaffold)',
      'ADHD — Home/School Supports Planner (Non-proprietary)',
      'Autism Profile & Accommodations Builder (Adaptable)',
      'Consent/Assent & Safeguarding Summary',
      'School Letters & Support Plans (504/EHCP-style)',
      'ADHD/ASD — Psychoeducation & Home–School Behavior Plan',
    ]);
    const subgroup = registry["Special Populations & Liaison"];
    const items = (subgroup && (subgroup as Record<string, unknown>)["Child & Adolescent (CAMHS)"]) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const got = new Set<string>(list.map(i => i?.title || ''));
  expectedCamhsTitles.forEach(t => { if (!got.has(t)) throw new Error(`Missing CAMHS item: ${t}`); });
  } catch {}

  try {
    const expected = new Set<string>([
      'Psychoeducation Group — 6-Session Outline (Structured)',
      'DBT Skills Group — Module Picker',
      'Family Psychoeducation — Single-Session Plan',
      'Multi-Family Psychoeducation (Schizophrenia/Schizoaffective) — 6–8 Sessions',
      'CBT for Anxiety Group — 8-Session Core (GAD/Panic/Social)',
      'DBT Skills Group — 12-Week Rotation (Mindfulness/DT/ER/IE)',
    ]);
    const subgroup = registry["Special Populations & Liaison"];
    const items = (subgroup && (subgroup as Record<string, unknown>)["Group Visits & Programs"]) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const got = new Set<string>(list.map(i => i?.title || ''));
  expected.forEach(t => { if (!got.has(t)) throw new Error(`Missing Group Visits & Programs item: ${t}`); });
  } catch {}

  try {
    const expectedCaseTitles = new Set<string>([
      'Benefits/Disability Support Letter — Functional Impact Summary',
      'Travel Letter — Medication & Contact Information',
      'School/Work Reintegration Plan — Graduated Return',
      'Minimal-Disclosure Supporting Letter (Benefits/Accommodations)',
      'Fitness for Study/Work & Graded Return Plan',
      'Travel & Medications Letter (Air/Border, including Controlled Drugs)',
    ]);
    const subgroup = registry['Special Populations & Liaison'];
    const items = (subgroup && (subgroup as Record<string, unknown>)['Case Forms & Letters']) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const got = new Set<string>(list.map(i => i?.title || ''));
  expectedCaseTitles.forEach(t => { if (!got.has(t)) throw new Error(`Missing Case Forms & Letters item: ${t}`); });
  } catch {}

  try {
    const expectedNeuro = new Set<string>([
      'Cognitive Screen & Referral Triggers (Non-proprietary)',
      'Seizure/TBI — Psychiatry ⇔ Neurology Liaison Checklist',
      'Sleep & Circadian Workup Outline',
      'Delirium / Encephalopathy Workup (4AT / CAM-ICU)',
      'Cognitive Screening Library & Summary (Mini-Cog/MoCA/SLUMS)',
      'Decision-Making Capacity — MCA Two-Stage + Appelbaum 4-Abilities',
      'EEG / MRI Referral Templates (First Seizure; Red Flags) — RISK',
    ]);
    const subgroup = registry['Special Populations & Liaison'];
    const items = (subgroup && (subgroup as Record<string, unknown>)['Neuropsychiatry & Medical Liaison']) as { title?: string }[] | undefined;
    const list = Array.isArray(items) ? items : [];
    const got = new Set<string>(list.map(i => i?.title || ''));
  expectedNeuro.forEach(t => { if (!got.has(t)) throw new Error(`Missing Neuropsychiatry item: ${t}`); });
  } catch {}


  let assembled = assembleFourBlock(card);

  if (card && card.sectionId === 'psychotherapy') {
    const match = PSYCHOTHERAPIES.find(it => it.id === card.id) as PsychotherapyItem | undefined;
    if (match) {
      const m = mapPsychotherapyItemToFourBlocks(match);

      assembled = {
        ...assembled,

        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),

        references: (m.references || []).map(citation => ({ title: citation })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && (card.sectionId === 'psychometrics' || (card.sectionId as string).startsWith('psychometrics-'))) {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = PSYCHOMETRICS.find(it => norm(it.title) === norm(card.title) || it.id === card.id) as PMItem | undefined;
    const hint = match?.subtype || card.title || '';

    const forcedLastKey = (() => {
      const id = card.id || '';
      if (id === 'pm-psqi') return 'psqi';
      if (id === 'pm-ghq12') return 'ghq12';
      if (id === 'pm-ede-q') return 'edeq';
      return undefined;
    })();


  const lastKey = (forcedLastKey as string | undefined) || mapToLastLeafKey(hint);
    if (lastKey && lastKey !== 'unknown') {
      const lb = getLastLeafBundle(lastKey);
      const normalized = normalizeBundle(lb);
      assembled = {
        ...assembled,
        info: normalized.info,
        examples: normalized.examples,
        defaultExampleId: normalized.defaultExampleId,
        references: (normalized.references || []).map(title => ({ title })),
        commands: (normalized.commands || []),
      };
    } else {

      const wk = normalizeWeeklyId(hint);
      if (wk) {
        const wb = getWeeklyBundleFromId(wk);
        const normalized = normalizeBundle(wb);
        assembled = {
          ...assembled,
          info: normalized.info,
          examples: normalized.examples,
          defaultExampleId: normalized.defaultExampleId,
          references: (normalized.references || []).map(title => ({ title })),
          commands: (normalized.commands || []),
        };
      } else {

        const key = resolveSection8RPKey(card.title || '', match?.subtype);
        try {
          if (localStorage.getItem('psych.debug.section8') === 'on') {
            console.warn('[Section8] resolve', { title: card.title, subtype: match?.subtype, key });
          }
        } catch {}
        const bundle = key ? getSection8Bundle(key) : { infoCards: [], exampleHtml: '', prompts: [], references: [] };
        const normalized = normalizeBundle(bundle);
        assembled = {
          ...assembled,
          info: normalized.info,
          examples: normalized.examples,
          defaultExampleId: normalized.defaultExampleId,
          references: (normalized.references || []).map(title => ({ title })),
          commands: (normalized.commands || []),
        };
      }
    }
  }

  if (card && card.sectionId === 'progress_letters') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = PROGRESS_NOTES_LETTERS.find(it => norm(it.title) === norm(card.title) || it.id === card.id) as PNItem | undefined;
    if (match) {
      const m = mapPNItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Letter/Note', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'psychoeducation') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = PSYCHOEDUCATION.find(it => norm(it.title) === norm(card.title) || it.id === card.id) as EduItem | undefined;
    if (match) {
      const m = mapEduItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Handout', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'handouts') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = PATIENT_HANDOUTS.find(it => norm(it.title) === norm(card.title)) as HandoutItem | undefined;
    if (match) {
      const m = mapHandoutItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Handout', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    } else {

      throw new Error(`Patient Handouts title mismatch: "${card.title}" not found in content pack.`);
    }
  }

  if (card && card.sectionId === 'ethics_consent') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = ETHICS_CONSENT.find(it => norm(it.title) === norm(card.title) || it.id === card.id) as ConsentItem | undefined;
    if (match) {
      const m = mapConsentItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Consent / Explainer', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    } else {
      throw new Error(`Ethics & Consent title mismatch: "${card.title}" not found in content pack.`);
    }
  }

  if (card && (card.sectionId === 'camhs' || (card.tags||[]).some(t => /camhs|child|adolescent/i.test(t)))) {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const nCardTitle = norm(card.title || '');
    let match = CAMHS_CHILD_ADOLESCENT.find(it => norm(it.title) === nCardTitle || it.id === (card.id || '')) as CamhsItem | undefined;
    if (!match && nCardTitle) {

      match = CAMHS_CHILD_ADOLESCENT.find(it => {
        const nt = norm(it.title);
        return nt.includes(nCardTitle) || nCardTitle.includes(nt);
      }) as CamhsItem | undefined;
    }
    if (match) {
      const m = mapCamhsItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Worksheet', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'groups-programs') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const stripParen = (s: string) => s.replace(/\([^)]*\)/g, '');
    const base = (s: string) => {
      const noParen = stripParen(s);
      const seg = noParen.split(/—|-/)[0] || noParen;
      return norm(seg);
    };
    const titleFull = norm(card.title || '');
    const titleBase = base(card.title || '');
    let match = GROUP_VISITS_PROGRAMS.find(it => {
      const itFull = norm(it.title);
      const itBase = base(it.title);
      return it.id === (card.id || '') || itFull === titleFull || itBase === titleBase;
    }) as GroupItem | undefined;
    if (!match) {
      match = GROUP_VISITS_PROGRAMS.find(it => {
        const itFull = norm(it.title), itBase = base(it.title);
        return itFull.includes(titleFull) || titleFull.includes(itFull) || itBase.includes(titleBase) || titleBase.includes(itBase);
      }) as GroupItem | undefined;
    }
    if (match) {
      const m = mapGroupItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Plan', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'case-letters') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const stripParen = (s: string) => s.replace(/\([^)]*\)/g, '');
    const base = (s: string) => {
      const noParen = stripParen(s);
      const seg = noParen.split(/—|-/)[0] || noParen;
      return norm(seg);
    };
    const titleFull = norm(card.title || '');
    const titleBase = base(card.title || '');
    let match = CASE_FORMS_LETTERS.find(it => {
      const itFull = norm(it.title), itBase = base(it.title);
      return it.id === (card.id || '') || itFull === titleFull || itBase === titleBase;
    }) as CaseLetterItem | undefined;
    if (!match) {
      match = CASE_FORMS_LETTERS.find(it => {
        const itFull = norm(it.title), itBase = base(it.title);
        return itFull.includes(titleFull) || titleFull.includes(itFull) || itBase.includes(titleBase) || titleBase.includes(itBase);
      }) as CaseLetterItem | undefined;
    }
    if (match) {
      const m = mapCaseLetterItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Letter/Form', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && (card.sectionId === 'neuro-med' || (card.tags||[]).some(t => /neuro|delirium|capacity|seizure|tbi|sleep/i.test(t)))) {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const stripParen = (s: string) => s.replace(/\([^)]*\)/g, '');
    const base = (s: string) => {
      const noParen = stripParen(s);
      const seg = noParen.split(/—|-/)[0] || noParen;
      return norm(seg);
    };
    const titleFull = norm(card.title || '');
    const titleBase = base(card.title || '');
    let match = NEUROPSYCH_MED_LIAISON.find(it => {
      const itFull = norm(it.title), itBase = base(it.title);
      return it.id === (card.id || '') || itFull === titleFull || itBase === titleBase;
    }) as NeuroItem | undefined;
    if (!match) {
      match = NEUROPSYCH_MED_LIAISON.find(it => {
        const itFull = norm(it.title), itBase = base(it.title);
        return itFull.includes(titleFull) || titleFull.includes(itFull) || itBase.includes(titleBase) || titleBase.includes(itBase);
      }) as NeuroItem | undefined;
    }
    if (match) {
      const m = mapNeuroItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        examples: m.exampleHtml ? [{ id: 'default', label: 'Worksheet', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'follow_up') {
    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = FOLLOWUP_MONITORING.find(it => norm(it.title) === norm(card.title) || it.id === card.id) as FollowItem | undefined;
    if (match) {
      const m = mapFollowUpItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),

        examples: m.exampleHtml ? [{ id: 'default', label: 'Worksheet', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'medications') {
    const match = MEDICATION_SELECTION.find(it => it.id === card.id) as MedItem | undefined;
    if (match) {
      const m = mapMedicationItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }

  if (card && card.sectionId === 'medication-orders') {

    const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const match = MEDICATION_ORDERS_MONITORING.find(it => norm(it.title) === norm(card.title)) as MedOrderItem | undefined;
    if (match) {
      const m = mapMedOrderItemToFourBlocks(match);
      assembled = {
        ...assembled,
        info: (() => {
          const sec = (title: string, items: string[]) => items?.length ? `<h3>${title}</h3><ul>${items.map(s=>`<li>${s}</li>`).join('')}</ul>` : '';
          const overview = m.info.bullets?.length ? `<section>${sec('Clinical Summary', m.info.bullets)}</section>` : '';
          const ind = sec('Indications', m.info.indications);
          const ctr = sec('Contraindications', m.info.contraindications);
          const om = sec('Outcome Measures', m.info.measures);
          return [overview, ind, ctr, om].filter(Boolean).join('\n');
        })(),

        examples: m.exampleHtml ? [{ id: 'default', label: 'Worksheet', html: m.exampleHtml }] : (assembled.examples || []),
        defaultExampleId: 'default',
        references: (m.references || []).map(title => ({ title })),
        commands: (m.prompts || []).map(text => ({ text })),
      };
    }
  }
  try {
    if(localStorage.getItem('psych.debug.panel')==='on'){
      console.warn('[rp] render card', card?.id, !!card?.html, card?.title);
    }
  } catch {}

  function dispatchBus<T = unknown>(type: string, detail: T){
    try { window.dispatchEvent(new CustomEvent(type, { detail })); } catch(e){ console.warn('[psych] dispatch failed', e); }
  }
  function toast(msg: string){ console.warn(`[psych] ${msg}`); }

  const noCard = !card;
  const infoBase = assembled.info;
  const refs = assembled.references;


  const filteredRefs = useMemo(()=>{
    return refs.filter(r => {
      const qOk = !refQuery || r.title.toLowerCase().includes(refQuery.toLowerCase()) || (r.authors||[]).some(a=> a.toLowerCase().includes(refQuery.toLowerCase()));
      const kOk = refKind==='all' || r.kind===refKind;
      return qOk && kOk;
    });
  }, [refs, refQuery, refKind]);


  const commands = assembled.commands;


  interface InfoSection { id:string; title:string; body:string|string[]; kind?:'risk'|'model'|'plain' }
  const infoBundle = useMemo(() => {
    if(!card) return { sections: [] as { id:string; title:string; body:string|string[]; kind?:'risk'|'model'|'plain' }[], modelSchema: null };
    const plainBase = infoBase && infoBase.trim().length ? infoBase.trim() : (card.summary || card.title);

    function htmlToMarkdownishLines(html: string): string[] {
      if(!/<[a-z][\s\S]*>/i.test(html)) return [html];
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const lines: string[] = [];
        const walk = (el: Element) => {
          const tag = el.tagName.toLowerCase();
            if(['script','style'].includes(tag)) return;
            if(/^h[1-4]$/.test(tag)){
              const lvl = Number(tag.substring(1));
              const hashes = '#'.repeat(Math.min(3, Math.max(1,lvl)));
              const txt = (el.textContent||'').trim();
              if(txt) lines.push(`${hashes} ${txt}`);
            } else if(tag === 'p') {
              const txt = (el.textContent||'').trim(); if(txt) lines.push(txt);
            } else if(tag === 'li') {
              const txt = (el.textContent||'').trim(); if(txt) lines.push(`• ${txt}`);
            } else if(['ul','ol','section','div'].includes(tag)) {
              Array.from(el.children).forEach(c => walk(c));
              return;
            }
            Array.from(el.children).forEach(c => walk(c));
        };
        Array.from(doc.body.children).forEach(c => walk(c));
        return lines.filter(Boolean);
      } catch { return [html.replace(/<[^>]+>/g,'')]; }
    }
    const tags = (card.tags || []).slice(0,14).map(t=>t.toLowerCase());
    const hasRisk = tags.some(t=> ['risk','suicide','self-harm','psychosis','violence','safetyplan','means'].includes(t));
  const rawHtml = (card.html || (card as unknown as { descriptionHtml?: string })?.descriptionHtml || '').trim();
  type DynSec = { id:string; title:string; body:string[]; kind?:'risk'|'model'|'plain' };
  const dynamicSections: DynSec[] = [];


    if(rawHtml){
      try {
        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
        const accItems = Array.from(doc.querySelectorAll('.acc-item')) as HTMLElement[];
        accItems.forEach((acc, idx) => {
          const h3 = acc.querySelector('.acc-trigger h3, h3');
          const title = (h3?.textContent || '').trim();
          if(!title) return;
          const infoPane = acc.querySelector('.acc-panel .tabpanel[id$="-info"], .acc-panel .tabpanel');
          const lines: string[] = [];
          if(infoPane){

            const cards = Array.from(infoPane.querySelectorAll('.infocards .infocard')) as HTMLElement[];
            if(cards.length){
              cards.forEach(cardEl => {
                const h4 = (cardEl.querySelector('h4') as HTMLElement | null)?.textContent?.trim();
                const p = (cardEl.querySelector('p') as HTMLElement | null)?.textContent?.trim();
                if(h4 && p) lines.push(`${h4}: ${p}`);
                else if(h4) lines.push(h4);
                else if(p) lines.push(p);
              });
            } else {

              Array.from(infoPane.querySelectorAll('p')).forEach(p => { const t=p.textContent?.trim(); if(t) lines.push(t); });
              Array.from(infoPane.querySelectorAll('li')).forEach(li => { const t=li.textContent?.trim(); if(t) lines.push(`• ${t}`); });
            }
          }
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `acc-${idx}`;
          if(lines.length){
            dynamicSections.push({ id: slug, title, body: lines });
          }
        });


        if(!accItems.length){
          const infoCardsWrap = doc.querySelector('.infocards');
          if(infoCardsWrap){
            const cards = Array.from(infoCardsWrap.querySelectorAll('.infocard')) as HTMLElement[];
            const lines: string[] = [];
            cards.forEach(cardEl => {
              const h4 = (cardEl.querySelector('h4') as HTMLElement | null)?.textContent?.trim();

              const pEls = Array.from(cardEl.querySelectorAll('p')) as HTMLElement[];
              const firstP = pEls[0]?.textContent?.trim();
              if(h4 && firstP) lines.push(`${h4}: ${firstP}`);
              else if(h4) lines.push(h4);
              else if(firstP) lines.push(firstP);
            });
            if(lines.length){
              const docTitle = (doc.querySelector('h1,h2,h3') as HTMLElement | null)?.textContent?.trim() || (card?.title || 'Details');
              const slug = (docTitle || 'details').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'details';
              dynamicSections.push({ id: slug, title: docTitle, body: lines });
            }
          }
        }


        const headings = Array.from(doc.querySelectorAll('h1,h2,h3')) as HTMLElement[];
        headings.forEach((h, idx) => {
          const inAcc = h.closest('.acc-item');
          if(inAcc) return;
          const lines: string[] = [];
          let cursor: ChildNode | null = h.nextSibling;
          while(cursor){
            if(cursor.nodeType === 1){
              const el = cursor as HTMLElement;
              if(/^(h1|h2|h3)$/i.test(el.tagName)) break;
              if(el.tagName.toLowerCase()==='p'){ const txt = el.textContent?.trim(); if(txt) lines.push(txt); }
              else if(el.tagName.toLowerCase()==='ul' || el.tagName.toLowerCase()==='ol'){
                const items = Array.from(el.querySelectorAll('li')).map(li => `• ${li.textContent?.trim()||''}`.trim()).filter(Boolean);
                if(items.length) lines.push(...items);
              } else {
                const txt2 = el.textContent?.trim(); if(txt2) lines.push(txt2);
              }
            }
            cursor = cursor.nextSibling;
          }
          const title = h.textContent?.trim() || `Section ${idx+1}`;
          const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || `sec-${idx}`;
          if(lines.length){
            dynamicSections.push({ id: slug, title, body: lines });
          }
        });
      } catch(err){
        try { if(localStorage.getItem('psych.debug.panel')==='on') console.warn('[rp] parse fail', card.id, err); } catch {}
      }
    }

    const overviewLines = htmlToMarkdownishLines(plainBase);
    if(tags.length) overviewLines.push(`Tags: ${tags.join(', ')}`);
    const overview: DynSec = { id:'overview', title:'Overview', body: overviewLines };

    const hasExistingOverview = dynamicSections.some(s => /overview|summary|intake/i.test(s.title));
  const sections: DynSec[] = [overview, ...dynamicSections.filter(s => !(hasExistingOverview && /overview|summary/i.test(s.title)))];

    if(hasRisk && !sections.some(s => /risk|safety/i.test(s.title))){
      sections.push({ id:'risk', title:'Risk / Safety', kind:'risk', body:[ 'Screen immediacy: intent • plan • means • timeframe • rehearsal.', 'Document protective and risk modifiers explicitly.', 'Escalate per local protocol if imminent risk suspected.' ] });
    }

    const needsModel = tags.some(t => ['mbc','intake','structured','data','scale','autoscore'].includes(t));
    if(needsModel && !sections.some(s => s.kind==='model')){
      sections.push({ id:'model', title:'Data Model Fields', kind:'model', body:[ 'id (ULID)', 'patientId', 'topic', 'onsetISO?', 'durationWeeks?', 'severityScaleScores[]', 'interventions[]', 'riskFlags[]', 'followUpPlan?', 'updatedAt (ISO)', 'createdAt (ISO)' ] });
    }

    sections.push({ id:'disclaimer', title:'Disclaimer', body:['Educational synthesis; apply local guidelines & individualized clinical judgement.'] });
    try { if(localStorage.getItem('psych.debug.panel')==='on') console.warn('[rp] dynamic sections', card.id, sections.map(s=>s.id)); } catch {}
    return { sections, modelSchema: null };
  }, [card, infoBase]);
  const sections: InfoSection[] = useMemo(()=> (infoBundle && (infoBundle as {sections:InfoSection[]}).sections) ? (infoBundle as {sections:InfoSection[]}).sections : [], [infoBundle]);
  interface ClinicalJsonSchema { $schema:string; $id:string; title:string; type:string; required: readonly string[]; properties: Record<string, unknown>; }
  const modelJsonSchema: ClinicalJsonSchema | null = useMemo(()=> {
    if(infoBundle && (infoBundle as unknown as { modelSchema?: ClinicalJsonSchema }).modelSchema){
      return (infoBundle as unknown as { modelSchema: ClinicalJsonSchema }).modelSchema;
    }
    return null;
  }, [infoBundle]);

  const copyJsonSchema = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(modelJsonSchema, null, 2));
      announce('JSON schema copied');
    } catch {
      announce('Copy failed');
    }
  }, [modelJsonSchema]);


  type PanelTab = 'info' | 'example' | 'references' | 'prompts';
  const [panelTab, setPanelTab] = useState<PanelTab>('info');
  const panelRef = useRef<HTMLElement|null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(()=> {
    const el = panelRef.current;
    if(!el) return;
    function onScroll(){
      if(!panelRef.current) return;
      const st = panelRef.current.scrollTop;
      setHasScrolled(st > 4);
      setShowTopBtn(st > 600 && panelTab==='info');
    }
    el.addEventListener('scroll', onScroll, { passive:true });

  }, [panelTab]);
  const scrollToTop = useCallback(()=> { const el = panelRef.current; if(el) el.scrollTo({ top:0, behavior:'smooth' }); }, []);


  const tabsOverflowRef = useRef<HTMLDivElement|null>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  const checkTabsOverflow = useCallback(()=>{
    const el = tabsOverflowRef.current;
    if(!el) return;
    setTabsOverflow(el.scrollWidth > el.clientWidth + 4);
  }, []);
  useEffect(()=> { checkTabsOverflow(); window.addEventListener('resize', checkTabsOverflow); return ()=> window.removeEventListener('resize', checkTabsOverflow); }, [checkTabsOverflow, panelTab]);
  const scrollTabs = useCallback((dir:1|-1)=>{
    const el = tabsOverflowRef.current; if(!el) return; el.scrollBy({ left: dir * (el.clientWidth * 0.6), behavior:'smooth' });
  }, []);
  const scrollTabsLeft = useCallback(()=> scrollTabs(-1), [scrollTabs]);
  const scrollTabsRight = useCallback(()=> scrollTabs(1), [scrollTabs]);


  const [collapsed, setCollapsed] = useState<Set<string>>(()=> new Set());
  const toggleSection = useCallback((id:string)=> {
    setCollapsed(c => {
      const n = new Set(c);
      if(n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);
  const collapseAll = useCallback(()=> setCollapsed(new Set(sections.map(s=> s.id))), [sections]);
  const expandAll = useCallback(()=> setCollapsed(new Set()), []);
  const allCollapsed = collapsed.size && collapsed.size === sections.length;


  const [showSchemaViewer, setShowSchemaViewer] = useState(false);
  const toggleSchemaViewer = useCallback(()=> setShowSchemaViewer(v=> !v), []);
  const downloadSchema = useCallback(()=>{
    if(!modelJsonSchema) return;
    const blob = new Blob([JSON.stringify(modelJsonSchema,null,2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'clinical-entry.schema.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    announce('Schema downloaded');
  }, [modelJsonSchema]);


  const catsContainerRef = useRef<HTMLDivElement|null>(null);
  const onCatsKey = useCallback((e:React.KeyboardEvent)=>{
    if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const buttons = catsContainerRef.current?.querySelectorAll('button');
    if(!buttons || !buttons.length) return;
    const arr = Array.from(buttons);
    const activeIndex = arr.findIndex(b=> b.getAttribute('aria-pressed')==='true');
    const next = e.key==='ArrowRight' ? (activeIndex+1)%arr.length : (activeIndex+arr.length-1)%arr.length;
    (arr[next] as HTMLButtonElement).click();
    (arr[next] as HTMLButtonElement).focus();
    e.preventDefault();
  }, []);
  const tabListRef = useRef<HTMLDivElement|null>(null);
  const setPanelTabAndFocus = useCallback((t:PanelTab) => {
    setPanelTab(t);
    requestAnimationFrame(()=>{
      const btn = document.getElementById(`rp-tab-${t}`) as HTMLButtonElement | null;
      btn?.focus();
    });
  }, []);


  useEffect(()=>{
    function onViewMode(e: Event){
      const detail = (e as CustomEvent).detail as { mode?: string } | undefined;
      if(!detail || !detail.mode) return;
      const map: Record<string, PanelTab> = { card:'info', prompts:'prompts', evidence:'references' } as const;
      const next = map[detail.mode];
      if(next && next !== panelTab){ setPanelTab(next); }
    }
    window.addEventListener('psych:viewMode', onViewMode as EventListener);
    return () => window.removeEventListener('psych:viewMode', onViewMode as EventListener);
  }, [panelTab]);


  function renderMarkdownLines(lines:string[]): React.ReactNode {
    const nodes: React.ReactNode[] = [];
    let list: string[] = [];
    const flushList = () => { if(list.length){ nodes.push(<ul className="md-list" key={`ul-${nodes.length}`}>{list.map((li,i)=><li key={i}>{inlineFormat(li)}</li>)}</ul>); list=[]; } };
    const inlineFormat = (t:string) => {
      const esc = (s:string)=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      return <span dangerouslySetInnerHTML={{__html: esc(t)
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/`([^`]+)`/g,'<code>$1</code>') }} />;
    };
    lines.forEach((raw, idx) => {
      const line = raw.trim();
      if(!line){ flushList(); return; }
      if(/^(•|-|\*)\s+/.test(line)) { list.push(line.replace(/^(•|-|\*)\s+/,'').trim()); return; }
      flushList();
      if(/^#{1,3}\s+/.test(line)) {
        const level = (line.match(/^#{1,3}/)![0].length);
        const text = line.replace(/^#{1,3}\s+/,'');
        if(level===1) nodes.push(<h5 className="md-h md-h-1" key={`h-${idx}`}>{inlineFormat(text)}</h5>);
        else if(level===2) nodes.push(<h6 className="md-h md-h-2" key={`h-${idx}`}>{inlineFormat(text)}</h6>);
        else nodes.push(<p className="md-h md-h-3" key={`h-${idx}`}>{inlineFormat(text)}</p>);
        return;
      }
      nodes.push(<p key={`p-${idx}`}>{inlineFormat(line)}</p>);
    });
    flushList();
    return nodes;
  }


  const onTabListKey = useCallback((e:React.KeyboardEvent) => {
    const order: PanelTab[] = ['info','example','references','prompts'];
    const idx = order.indexOf(panelTab);
    if(e.key==='ArrowRight'){ e.preventDefault(); setPanelTabAndFocus(order[(idx+1)%order.length]); }
    else if(e.key==='ArrowLeft'){ e.preventDefault(); setPanelTabAndFocus(order[(idx+order.length-1)%order.length]); }
    else if(e.key==='Home'){ e.preventDefault(); setPanelTabAndFocus(order[0]); }
    else if(e.key==='End'){ e.preventDefault(); setPanelTabAndFocus(order[order.length-1]); }
  }, [panelTab, setPanelTabAndFocus]);


  const synthesizedPrompts = useMemo(() => {
    if(!card) return [] as { text:string }[];
    const topic = card.title;

    const base: string[] = [
      `Act as a board-certified psychiatry professor. Provide an evidence-based, succinct overview of ${topic} (≤200 words) including: definition, core pathophysiology/neurobiology, key DSM-5-TR diagnostic criteria (summarized), epidemiology (1 sentence), and 1 high-yield clinical pearl. Respond in Markdown.`,
      `Generate a strongly-typed TypeScript data model (interfaces) for capturing a structured clinical assessment of ${topic}. Include JSDoc comments for each field (e.g., onset, duration, severityScaleScores, riskFlags, comorbidities, treatmentHistory, monitoringPlan). Do not include implementation logic—just the models.`,
      `Draft a measurement-based care progress note snippet for a patient with ${topic}. Include: Subjective (1-2 sentences), Objective (scales / vitals placeholders), Assessment (severity + differential consideration), Plan (pharmacologic, psychotherapeutic, lifestyle, follow-up interval). Use concise clinical language, output Markdown with headings.`,
      `List 5 evidence-based psychopharmacology considerations for managing ${topic} when comorbid generalized anxiety disorder is present. Cite guideline or meta-analysis sources in-line (author/year). Output as a numbered list.`,
      `Create a patient-friendly explanation of ${topic} at an 8th grade reading level. Include: What it is, Common symptoms, Why treatment helps (link to brain/biology), 4 coping strategies (bullets), Encouraging closing sentence. Avoid stigmatizing language.`,
      `Propose a JSON schema for tracking longitudinal outcomes in ${topic} (keys: dateISO, patientId, primaryScaleScore, secondaryScaleScore, medicationChanges[], adverseEvents[], psychotherapyModalities[], notes). Provide only JSON schema object—no prose.`,
      `Design a brief CBT-style psychoeducation + skills micro-module for ${topic}. Sections: Goal (1 sentence), Psychoeducation (≤80 words), Skill 1 (steps), Skill 2 (steps), Homework prompt. Output Markdown with H3 section headings.`,
      `Suggest 5 high-quality research questions (answerable, specific) related to ${topic} suitable for a resident quality improvement project. Each in one sentence, start with an action verb.`,
      `Generate a de-identified synthetic clinical vignette (~120 words) illustrating ${topic}, embedding subtle diagnostic clues and 2 distractor features. End with: 'Key Points:' and 3 bullet pearls.`,
      `Provide an outline for a 6-session brief intervention plan targeting ${topic}. For each session: Focus, Primary Technique, Measurable Micro-goal, Homework. Output as a Markdown table.`
    ];

    if(commands && commands.length) return commands;
    return base.map(t => ({ text: t }));
  }, [card, commands]);

  const readyPrompts = synthesizedPrompts;

  interface PromptWithMeta { text:string; category:string; }
  const deriveCategory = useCallback((txt:string):string => {
    const lower = txt.toLowerCase();
    if(lower.includes('typescript')) return 'Data / Code';
    if(lower.includes('measurement-based')) return 'Measurement';
    if(lower.includes('progress note')) return 'Clinical Note';
    if(lower.includes('psychopharmacology')) return 'Pharmacology';
    if(lower.includes('patient-friendly')) return 'Patient Education';
    if(lower.includes('json schema')) return 'Schema';
    if(lower.includes('cbt')) return 'CBT / Psychotherapy';
    if(lower.includes('research questions')) return 'Research';
    if(lower.includes('vignette')) return 'Vignette';
    if(lower.includes('outline')) return 'Intervention Plan';
    return 'General';
  }, []);
  const promptMeta: PromptWithMeta[] = useMemo(()=> readyPrompts.map(p=> ({ text:p.text, category:deriveCategory(p.text) })), [readyPrompts, deriveCategory]);
  const promptCategories = useMemo(()=> Array.from(new Set(promptMeta.map(p=>p.category))).sort(), [promptMeta]);
  const [promptQuery, setPromptQuery] = useState('');
  const [promptCat, setPromptCat] = useState<string>('All');

  useEffect(()=> {
    setPromptQuery('');
    setPromptCat('All');
    setCopiedIndex(null);
  }, [card?.id]);
  const filteredPrompts = useMemo(()=> {
  const list = promptMeta.filter(p => (promptCat==='All' || p.category===promptCat) && (!promptQuery || p.text.toLowerCase().includes(promptQuery.toLowerCase())));
    return list;
  }, [promptMeta, promptCat, promptQuery]);
  const handlePromptQueryChange = useCallback((e:React.ChangeEvent<HTMLInputElement>)=> setPromptQuery(e.target.value), []);
  const setPromptCatAll = useCallback(()=> setPromptCat('All'), []);
  const categoryHandlers = useMemo(()=> Object.fromEntries(promptCategories.map(cat=> [cat, ()=> setPromptCat(cat)])), [promptCategories]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const announce = (msg:string) => { if(!liveRef.current) return; liveRef.current.textContent = msg; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; }, 1200); };
  const copyPrompt = useCallback(async (text: string, i: number) => {
    try {
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopiedIndex(i);
      setTimeout(()=> setCopiedIndex(ci => ci===i ? null : ci), 1800);
      toast('Prompt copied');
      announce('Prompt copied');
    } catch(err){ console.warn('Copy failed', err); toast('Copy failed'); }
  }, []);

  const examples = assembled.examples || [];
  const defaultExampleId = assembled.defaultExampleId;
  const variantLsKey = card ? `psych.variant.${card.id}` : '';
  const [activeExampleId, setActiveExampleId] = useState<string>('');
  useEffect(()=> {
    if(noCard) return;
    const fromLs = loadLS<string>(variantLsKey, '') || '';
    const initial = (fromLs && examples.find(e=> e.id===fromLs)) ? fromLs : (defaultExampleId || examples[0]?.id || '');
    setActiveExampleId(initial);

  }, [noCard, variantLsKey]);
  useEffect(()=> { if(!noCard && activeExampleId) saveLS(variantLsKey, activeExampleId); }, [activeExampleId, variantLsKey, noCard]);
  const activeExample = examples.find(e=> e.id===activeExampleId) || examples[0];
  const activeExampleHtmlRaw = activeExample?.html || '';
  const activeExampleHtml = sanitizeHtml(activeExampleHtmlRaw);

  const autoSetRenderRef = useRef(false);
  useEffect(() => {
    if (autoSetRenderRef.current) return;
    const looksFullDoc = /^\s*<!doctype\s+html/i.test(activeExampleHtmlRaw) || /<html[\s>]/i.test(activeExampleHtmlRaw) || /<head[\s>]/i.test(activeExampleHtmlRaw);
    const cid = (card?.id || '').toLowerCase();
    if ((looksFullDoc || cid==='audit' || cid==='auditc') && renderMode !== 'page') {
      setRenderMode('page');
      autoSetRenderRef.current = true;
    }
  }, [activeExampleHtmlRaw, card?.id, renderMode]);

  const openExample = useCallback(() => {
    if(!activeExampleHtmlRaw) return;
    const doc = generatePageDoc(activeExampleHtmlRaw);
    openInNewTab(doc, `${(card?.title||'example').replace(/[^a-z0-9]+/gi,'-')}.html`, 'text/html;charset=utf-8');
    announce('Opened in new tab');
  }, [activeExampleHtmlRaw, card?.title]);
  const printExample = useCallback(() => {
    if(!activeExampleHtmlRaw) return;
    const doc = generatePageDoc(activeExampleHtmlRaw);
    printHtml(doc);
    announce('Print dialog opened');
  }, [activeExampleHtmlRaw]);
  const downloadExample = useCallback(() => {
    if(!activeExampleHtmlRaw) return;
    const doc = generatePageDoc(activeExampleHtmlRaw);
    const fname = `${(card?.title||'example').replace(/[^a-z0-9]+/gi,'-')}.html`;
    downloadAs(fname, doc, 'text/html;charset=utf-8');
    announce('HTML downloaded');
  }, [activeExampleHtmlRaw, card?.title]);


  const infoJson = useMemo(() => {
    if(!card) return null as null | Record<string, unknown>;
    const payload = {
      id: card.id,
      title: card.title,
      profile,
      ts: new Date().toISOString(),
      sections: (sections || []).map(s => ({ id: s.id, title: s.title, kind: s.kind, body: Array.isArray(s.body)? s.body : [s.body] }))
    } as const;
    return payload as unknown as Record<string, unknown>;
  }, [card, profile, sections]);
  const copyInfoJson = useCallback(async () => {
    if(!infoJson) return;
    await copyText(JSON.stringify(infoJson, null, 2));
    announce('JSON copied');
  }, [infoJson]);
  const downloadInfoJson = useCallback(() => {
    if(!infoJson) return;
    downloadAs('psy-detail.json', JSON.stringify(infoJson, null, 2), 'application/json');
    announce('JSON downloaded');
  }, [infoJson]);

  const handleVariantChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveExampleId(e.currentTarget.value);
    setTab('render');
  }, [setActiveExampleId, setTab]);
  const setPlain = useCallback(() => setTab('plain'), [setTab]);
  const setHtml = useCallback(() => setTab('html'), [setTab]);
  const setRender = useCallback(() => setTab('render'), [setTab]);
  const toggleDensity = useCallback(() => setDensity(d => d==='compact' ? 'comfort' : 'compact'), [setDensity]);
  const setModeInline = useCallback(() => setRenderMode('inline'), [setRenderMode]);
  const setModePage = useCallback(() => setRenderMode('page'), [setRenderMode]);

  const sendCommandToChat = useCallback((text?: string)=> {
    if(!card) return;
  const payload = text || sections.map((s:InfoSection)=> (Array.isArray(s.body)? s.body.join('\n'): s.body)).join('\n\n');
    dispatchBus('synapse:chat:insert', { text: payload, source:'psychiatry-panel', cardId: card.id });
    toast('Sent to Chat');
    announce('Prompt sent to Chat');
  }, [card, sections]);

  const commandHandlers = useMemo(() => (
    readyPrompts.map((c,i)=> ({
      onMouseEnter: () => setCurrentCmdIndex(i),
      onFocus: () => setCurrentCmdIndex(i),
      onClick: () => copyPrompt(c.text, i),
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {

        if((e.ctrlKey || e.metaKey) && e.key==='Enter'){ e.preventDefault(); sendCommandToChat(c.text); }
        else if(e.key==='Enter'){ e.preventDefault(); copyPrompt(c.text, i); }
      },
    }))
  ), [readyPrompts, copyPrompt, sendCommandToChat]);


  if(noCard){
    return (
  <aside aria-label="Psychiatry Toolkit Detail" data-psy-right className="rp-panel empty">
        <header className="rp-header"><h2>Detail</h2></header>
        <div className="rp-body"><p>Select an item from the library to view details.</p></div>
      </aside>
    );
  }

  return (
  <aside aria-label="Psychiatry Toolkit Detail" data-psy-right className="rp-panel" ref={panelRef} data-profile={card ? detectProfile(card) : undefined}>
  <div className={`rp-topbar${hasScrolled ? ' is-scrolled':''}`}>
        <header className="rp-header">
          <h2 className="rp-title" style={{paddingRight:0}}>
            {(() => {
              const resolved = section8HeaderLabel({ id: card?.id, title: card?.title });
              const fallback = card?.title || 'Detail';
              const final = resolved || fallback;

              if (import.meta?.env?.MODE !== 'production' && ['pm-psqi', 'pm-ghq12', 'pm-ede-q'].includes(card?.id || '')) {

                console.debug('[Section8] Header:', { id: card?.id, cardTitle: card?.title, resolved, final });
              }
              return final;
            })()}
            {(()=>{ try { if(localStorage.getItem('psych.debug.panel')==='on') return <span style={{marginLeft:8,fontSize:11,fontWeight:600,letterSpacing:'.08em',color:'#69d3ff',background:'rgba(14,165,255,.12)',padding:'2px 6px',borderRadius:6}}> {profile} </span>; } catch{} return null; })()}
          </h2>
        </header>
        <nav className="rp-tabs-nav" aria-label="Detail tabs">
          {tabsOverflow && <button type="button" className="rp-tab-scroll left" aria-label="Scroll tabs left" onClick={scrollTabsLeft}>‹</button>}
          <div className="rp-tabs-scroll-mask" ref={tabsOverflowRef}>
            <div role="tablist" tabIndex={0} className="rp-tabs-wrap" ref={tabListRef} onKeyDown={onTabListKey}>
          {(() => {
            const tabs: { key: PanelTab; label: string; active: boolean; handler: () => void }[] = (
              ['info','example','references','prompts'] as PanelTab[]
            ).map(t => ({
              key: t,
              label: t==='info'?'INFO': t==='example'?'EXAMPLE': t==='references'?'REFERENCES':'PROMPTS',
              active: panelTab===t,
              handler: () => setPanelTab(t)
            }));
            return tabs.map(tb => (
              <button
                key={tb.key}
                role="tab"
                aria-selected={tb.active}
                aria-controls={`rp-tabpanel-${tb.key}`}
                id={`rp-tab-${tb.key}`}
                onClick={tb.handler}
                className={tb.active? 'rp-tab is-active':'rp-tab'}
                type="button"
              >{tb.label}</button>
            ));
          })()}
            </div>
          </div>
          {tabsOverflow && <button type="button" className="rp-tab-scroll right" aria-label="Scroll tabs right" onClick={scrollTabsRight}>›</button>}
        </nav>
      </div>
  {(showTopBtn) ? <button type="button" className="rp-top-btn" onClick={scrollToTop} aria-label="Scroll to top">↑</button> : null}
      {}
      <div id="rp-live" ref={liveRef} aria-live="polite" className="sr-only" />
      {}
      <div className="rp-tabpanes">
        {panelTab==='info' && (
          <section id="rp-tabpanel-info" role="tabpanel" aria-labelledby="rp-tab-info" className="rp-info-pane">
            <div className="rp-info-toolbar" role="toolbar" aria-label="Info controls">
              <button type="button" onClick={allCollapsed? expandAll: collapseAll} className="info-ctrl" aria-label={allCollapsed? 'Expand all sections':'Collapse all sections'}>{allCollapsed? 'Expand All':'Collapse All'}</button>
              <div className="schema-toolbar" role="group" aria-label="Export actions">
                <button type="button" className="info-ctrl" onClick={copyInfoJson} disabled={!infoJson}>Copy JSON</button>
                <button type="button" className="info-ctrl" onClick={downloadInfoJson} disabled={!infoJson}>Download JSON</button>
              </div>
              {sections.some(s=> s.kind==='model') && modelJsonSchema && (
                <div className="schema-toolbar" role="group" aria-label="Schema actions">
                  <button type="button" className="info-ctrl" onClick={toggleSchemaViewer} aria-pressed={showSchemaViewer}>{showSchemaViewer? 'Hide Schema':'View Schema'}</button>
                  <button type="button" className="info-ctrl" onClick={downloadSchema}>Download .json</button>
                </div>
              )}
            </div>
            <div className="rp-info-grid">
              {sections.map((sec:InfoSection)=> {
                const body: string[] = Array.isArray(sec.body) ? sec.body : [sec.body];
                const kindClass = sec.kind ? `kind-${sec.kind}` : '';
                const isCollapsed = collapsed.has(sec.id);
                return (
                  <article key={sec.id} className={`rp-info-card ${kindClass} ${isCollapsed?'is-collapsed':''}`}>
                    <header className="rp-info-card__head">
                      <button type="button" className="sec-toggle" onClick={() => toggleSection(sec.id)} aria-expanded={!isCollapsed} aria-controls={`sec-body-${sec.id}`}>{sec.title}</button>
                      {sec.kind==='model' && (
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <button type="button" className="schema-btn" onClick={copyJsonSchema} aria-label="Copy JSON schema">Copy</button>
                        </div>
                      )}
                      {sec.kind==='risk' && <span className="risk-badge" aria-label="High vigilance section">RISK</span>}
                    </header>
                    <div className="rp-info-card__body" id={`sec-body-${sec.id}`} hidden={isCollapsed}>
                      {renderMarkdownLines(body)}
                      {sec.kind==='model' && showSchemaViewer && modelJsonSchema && (
                        <textarea className="schema-viewer" readOnly aria-label="JSON schema preview" value={JSON.stringify(modelJsonSchema,null,2)} />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        {panelTab==='example' && (
          <section id="rp-tabpanel-example" role="tabpanel" aria-labelledby="rp-tab-example">
            <div className="rp-ex-header">
              <h3 id="rp-example-h" style={{margin:0}}>Example</h3>
              {examples.length > 1 && (
                <div className="example-variant" style={{display:'flex',alignItems:'center',gap:4}}>
                  <label htmlFor="rp-example-variant" className="sr-only">Variant</label>
                  <select
                    id="rp-example-variant"
                    value={activeExampleId}
                    onChange={handleVariantChange}
                    aria-label="Select example variant"
                  >
                    {examples.map(v=> <option key={v.id} value={v.id}>{v.label}</option>)}
                  </select>
                </div>
              )}
              <div className="rp-ex-controls" role="toolbar" aria-label="Example view controls">
                <div className="tabs" role="tablist" aria-label="Example tabs">
                  <button role="tab" aria-selected={tab==='plain'} onClick={setPlain} title="Plain (Alt+[ / Alt+])">Plain</button>
                  <button role="tab" aria-selected={tab==='html'} onClick={setHtml} title="HTML Source">HTML</button>
                  <button role="tab" aria-selected={tab==='render'} onClick={setRender} title="Rendered Preview">Preview</button>
                </div>
                <div className="density" style={{display:'flex',alignItems:'center',gap:6}}>
                  <label style={{display:'flex',alignItems:'center',gap:4,fontSize:12}}>
                    <input type="checkbox" checked={density==='compact'} onChange={toggleDensity} aria-label="Toggle density (Alt+D)" />
                    {density==='compact'?'Compact':'Comfort'}
                  </label>
                  {tab==='render' && (
                    <div className="mode-toggle" role="group" aria-label="Render mode">
                      <button type="button" className={renderMode==='inline'? 'mode-btn active':'mode-btn'} onClick={setModeInline} title="Inline render inside panel">Inline</button>
                      <button type="button" className={renderMode==='page'? 'mode-btn active':'mode-btn'} onClick={setModePage} title="Page layout (Monaco style)">Page</button>
                    </div>
                  )}
                  <div className="ex-actions" role="group" aria-label="Example actions" style={{display:'flex',gap:6,marginLeft:8}}>
                    <button type="button" onClick={openExample} disabled={!activeExampleHtml} title="Open in new tab">Open</button>
                    <button type="button" onClick={printExample} disabled={!activeExampleHtml} title="Print preview">Print</button>
                    <button type="button" onClick={downloadExample} disabled={!activeExampleHtml} title="Download HTML">Download</button>
                  </div>
                </div>
              </div>
            </div>
            {(() => {
          const safeHtml = activeExampleHtml && activeExampleHtml.trim().length ? activeExampleHtml : '';
          const plain = safeHtml ? extractPlainText(safeHtml) : '';
          if(!safeHtml && !plain) return <div className="rp-placeholder">No example provided for this item.</div>;
          const cls = `rp-example-body ${density}`;
          const style: React.CSSProperties = { width: '100%' };
          if(tab==='plain') return <div className={cls} style={style} aria-label="Plain text view"><pre className="rp-plain"><code>{plain || '(No content)'}</code></pre></div>;
          if(tab==='html') return <div className={cls} style={style} aria-label="HTML source view"><pre className="rp-code"><code>{safeHtml}</code></pre></div>;
          if(renderMode==='page'){
            const pageDoc = generatePageDoc(safeHtml);

            const vh = typeof window !== 'undefined' ? Math.max(360, window.innerHeight - 320) : 480;
            return (
              <div className={`${cls} print-friendly`} style={style} aria-label="Page preview">
                <iframe
                  title="Page preview"
                  className="rp-preview-frame"
                  srcDoc={pageDoc}
                  sandbox="allow-same-origin"
                  style={{width:'100%',height:vh,border:'1px solid #333',borderRadius:8,background:'#111'}}
                />
              </div>
            );
          }
          return <div className={`${cls} print-friendly`} style={style} aria-label="Rendered preview"><div className="rp-render" style={{minHeight:200}} dangerouslySetInnerHTML={{ __html: safeHtml }} /></div>;
        })()}
          </section>
        )}
        {panelTab==='references' && (
          <section id="rp-tabpanel-references" role="tabpanel" aria-labelledby="rp-tab-references" className={`rp-refs-pane ${refFade? 'is-fading':''}`}>
            <h3 className="sr-only">References</h3>
            {refs.length ? (
              <div className="rp-refs-shell">
                <div className="refs-filter-row">
                  <div className="refs-search-wrap">
                    <input
                      type="search"
                      aria-label="Search references"
                      placeholder="Search…"
                      title="ESC clears"
                      value={refQuery}
                      onChange={e=> setRefQuery(e.target.value)}
                      onKeyDown={e=> { if(e.key==='Escape'){ e.preventDefault(); setRefQuery(''); } }}
                      className="ref-search"
                    />
                    {refQuery && <button className="ref-clear" aria-label="Clear" onClick={()=> setRefQuery('')}>×</button>}
                  </div>
                  <div className="refs-filter-right">
                    {(() => {
                      const kinds = Array.from(new Set(refs.map(r=> r.kind).filter(Boolean)));
                      return kinds.length>1 ? (
                        <select aria-label="Filter kind" value={refKind} onChange={e=> { const v=e.target.value as typeof refKind; setRefKind(v); }} className="ref-kind-filter minimal">
                          <option value="all">All</option>
                          <option value="guideline">Guideline</option>
                          <option value="validation">Validation</option>
                          <option value="overview">Overview</option>
                          <option value="implementation">Implementation</option>
                          <option value="safety">Safety</option>
                          <option value="other">Other</option>
                        </select>
                      ) : null;
                    })()}
                    <span className="refs-count" aria-live="polite" title="Filtered / Total">{filteredRefs.length}/{refs.length}</span>
                  </div>
                </div>
                {filteredRefs.length ? (
                  <ol className="rp-refs-list clean" data-count={filteredRefs.length}>
                    {filteredRefs.map((r,i)=>{
                      const apa = formatApa(r);
                      const copied = lastCopiedRef===i;
                      return (
                        <li key={i} className={`rp-ref-item ${copied? 'copied':''}`} data-kind={r.kind || 'other'}>
                          <button
                            type="button"
                            className="ref-line-btn"
                            aria-label={`Copy reference ${i+1}`}
                            onClick={()=> { copyPrompt(apa, -1); setLastCopiedRef(i); setTimeout(()=> setLastCopiedRef(c=> c===i? null : c), 1500); }}
                          >
                            <span className={`ref-kind-dot kind-${r.kind || 'other'}`} aria-hidden="true" />
                            <span className="ref-text">{apa}</span>
                            {copied && <span className="ref-copied" aria-hidden="true">Copied</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                ) : <div className="rp-ref-empty" role="status" aria-live="polite">No matches.</div>}
              </div>
            ) : <div className="rp-placeholder">No references.</div>}
          </section>
        )}
        {panelTab==='prompts' && (
          <section id="rp-tabpanel-prompts" role="tabpanel" aria-labelledby="rp-tab-prompts" className="rp-prompts-pane">
            <h3 className="sr-only">Prompts</h3>
            <div className="prompt-toolbar" role="group" aria-label="Prompt filters and tools">
              <div className="pt-row">
                <div className="pt-left">
                  <div className="prompt-search-wrap">
                    <input
                      type="search"
                      placeholder="Search…"
                      value={promptQuery}
                      onChange={handlePromptQueryChange}
                      onKeyDown={e=> { if(e.key==='Escape'){ e.preventDefault(); setPromptQuery(''); } }}
                      className="prompt-search"
                      aria-label="Search prompts"
                      title="ESC clears"
                    />
                    {promptQuery && (
                      <button type="button" className="ps-clear" aria-label="Clear search" onClick={()=> setPromptQuery('')} title="Clear">×</button>
                    )}
                  </div>
                  <div className="prompt-cat-scroller" aria-label="Prompt categories">
                    <div className="prompt-cats" role="radiogroup" tabIndex={0} aria-label="Categories" ref={catsContainerRef} onKeyDown={onCatsKey}>
                      <button type="button" className={promptCat==='All'? 'cat on':'cat'} aria-pressed={promptCat==='All'} onClick={setPromptCatAll}>All<span className="cat-count" aria-hidden="true">{promptMeta.length}</span></button>
                      {promptCategories.map(cat => {
                        const handler = categoryHandlers[cat];
                        return <button key={cat} type="button" className={promptCat===cat? 'cat on':'cat'} aria-pressed={promptCat===cat} onClick={handler}>{cat}</button>;
                      })}
                    </div>
                  </div>
                </div>
                <div className="pt-right" role="status" aria-live="polite">
                  <span className="pt-count" title="Filtered / Total prompts">{filteredPrompts.length}/{promptMeta.length}</span>
                </div>
              </div>
            </div>
            <p className="rp-cmds-desc">Click to copy. Ctrl+Enter → Chat. Filter by category or search.</p>
            <div className="rp-cmds-interactions">
              <ul className="rp-cmds-list rp-prompts-grid" key={card?.id || 'no-card'}>
                {filteredPrompts.map((c,i)=>{
                  const idx = promptMeta.indexOf(c);
                  const wordsLabel = c.text.split(/\s+/).slice(0,10).join(' ');
                  const isCopied = copiedIndex===idx;
                  return (
                    <li key={i} className={isCopied? 'copied':''}>
                      <button
                        className="rp-cmd-btn rp-prompt-btn"
                        aria-label={`Prompt: ${wordsLabel}${isCopied? ' (copied)':''}`}
                        onMouseEnter={commandHandlers[idx]?.onMouseEnter}
                        onFocus={commandHandlers[idx]?.onFocus}
                        onClick={commandHandlers[idx]?.onClick}
                        onKeyDown={commandHandlers[idx]?.onKeyDown}
                        data-copied={isCopied || undefined}
                      >
                        <span className="rp-prompt-text">{c.text}</span>
                        <span className="rp-copy-status" aria-hidden="true">{isCopied? '✔ Copied':'Copy'}</span>
                        <span className="rp-prompt-cat" aria-hidden="true">{c.category}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};

export const RightPanelBoundary: React.FC<{card: Card|null; onClose: ()=>void}> = ({ card, onClose }) => {
  let node: React.ReactNode;
  try {
  node = <RightPanelFourBlock card={card} onClose={onClose} />;
  } catch (e) {
  node = <aside data-psy-right className="rp-panel"><h3>Error</h3><pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{String(e)}</pre></aside>;
  }
  return <>{node}<style>{`

  .rp-panel { position:relative; height:100%; width:100%; overflow:auto; padding:0 20px 28px; border-left:1px solid #20262d; background:
    linear-gradient(145deg, rgba(18,22,28,0.95) 0%, rgba(14,17,22,0.92) 60%, rgba(12,14,19,0.95) 100%);
    box-sizing:border-box; backdrop-filter:blur(12px) saturate(140%); isolation:isolate;}

  .rp-panel { width:100%; margin-left:0; }
  .rp-panel::before { content:""; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 85% 10%, rgba(14,165,255,.15), transparent 55%); opacity:.9; z-index:-1; }
  .rp-panel::-webkit-scrollbar { width:10px; }
  .rp-panel::-webkit-scrollbar-track { background:transparent; }
  .rp-panel::-webkit-scrollbar-thumb { background:linear-gradient(var(--accent,#0EA5FF),#1579b7); border:2px solid #14181e; border-radius:20px; }
  .rp-panel::-webkit-scrollbar-thumb:hover { background:linear-gradient(#27b8ff,#0d6fa8); }
  .rp-topbar { position:sticky; top:0; z-index:10; padding:12px 0 10px; background:linear-gradient(to bottom,rgba(18,22,28,.95),rgba(18,22,28,.85) 85%,rgba(18,22,28,0)); backdrop-filter:blur(14px) saturate(160%); }
  .rp-topbar.is-scrolled { box-shadow:0 4px 18px -6px rgba(0,0,0,.9); }
  .rp-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin:0 0 8px; padding:0 2px; }
  .rp-header-actions { display:flex; gap:6px; align-items:center; }
  .rp-contrast { border:1px solid #274556; background:linear-gradient(145deg,#132027,#0d151b); color:#8ecff5; font-size:14px; padding:6px 10px; border-radius:10px; cursor:pointer; }
  .rp-contrast:hover { background:#1b313c; color:#c9ecff; }
  .rp-sticky-nav { position:sticky; top:0; padding:6px 0 10px; z-index:4; background:linear-gradient(to bottom, rgba(18,22,28,.95) 10%, rgba(18,22,28,.85) 55%, rgba(18,22,28,0)); }
  .rp-sticky-nav ul { list-style:none; display:flex; gap:6px; margin:0 0 2px; padding:0; }
  .rp-sticky-nav a { position:relative; font-size:11.5px; letter-spacing:.05em; text-transform:uppercase; text-decoration:none; color:#8fa2b4; padding:6px 10px 6px; border-radius:8px; font-weight:600; line-height:1; transition:background .25s, color .25s; }
  .rp-sticky-nav a:hover, .rp-sticky-nav a:focus { color:#d7e6f2; background:rgba(255,255,255,.04); outline:none; }
  .rp-sticky-nav a[aria-current="true"] { color:#fff; background:linear-gradient(135deg, rgba(14,165,255,.18), rgba(14,165,255,.05)); box-shadow:0 0 0 1px rgba(14,165,255,.35), 0 0 0 4px rgba(14,165,255,.10); }
  .rp-sticky-nav a[aria-current="true"]::after { content:""; position:absolute; left:10px; right:10px; bottom:2px; height:3px; border-radius:3px; background:linear-gradient(90deg,#1BCBFF,#0EA5FF,#1BCBFF); filter:drop-shadow(0 0 6px rgba(14,165,255,.5)); }
  .rp-title { font-size:16px; font-weight:650; margin:0; letter-spacing:.4px; background:linear-gradient(90deg,#e8f3ff,#b9dfff 60%,#8cccf7); -webkit-background-clip:text; color:transparent; }
  .rp-close { border:0; background:rgba(255,255,255,.04); font-size:18px; line-height:1; cursor:pointer; color:var(--text,#e6eaf2); padding:6px 10px; border-radius:10px; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,.08); transition:background .25s, transform .25s; }
  .rp-close:hover { background:rgba(255,255,255,.10); }
  .rp-close:active { transform:translateY(1px); }
  .rp-actions { display:flex; gap:6px; align-items:center; }
  .rp-actions > button { border:1px solid #333; background:transparent; color:var(--text,#e6eaf2); cursor:pointer; padding:4px 8px; border-radius:8px; font-size:12px; line-height:1; }
  .rp-actions > .rp-close { border:none; padding:0 6px; }
  .rp-safety { font-size:12px; opacity:.8; margin-top:4px; }
  .rp-example { border:1px solid #273038; padding:12px; border-radius:10px; overflow:auto; font-size:13px; background:rgba(0,0,0,.25); }
  .rp-placeholder { opacity:.7; font-style:italic; font-size:12.5px; }
  .rp-refs-shell { display:flex; flex-direction:column; gap:8px; }
  .rp-refs-list, .rp-cmds-list { margin:8px 0 0 16px; font-size:13px; }
  .rp-refs-shell .rp-refs-list { margin:0; padding:0; list-style:none; }
  .rp-refs-list.clean .rp-ref-item { display:block; position:relative; border-radius:8px; font-size:12.5px; line-height:1.45; }
  .rp-refs-list.clean .rp-ref-item:hover { background:rgba(255,255,255,.05); }
  .ref-line-btn { all:unset; display:flex; align-items:flex-start; gap:8px; padding:4px 6px 6px 4px; width:100%; cursor:pointer; border-radius:8px; }
  .ref-line-btn:focus-visible { outline:2px solid #0EA5FF; outline-offset:2px; }
  .rp-ref-item .ref-text { flex:1; }
  .ref-kind-dot { width:10px; height:10px; border-radius:50%; margin-top:4px; flex-shrink:0; box-shadow:0 0 0 1px rgba(0,0,0,.4); }
  .ref-kind-dot.kind-guideline { background:#0EA5FF; }
  .ref-kind-dot.kind-validation { background:#7c5cff; }
  .ref-kind-dot.kind-overview { background:#2dd4bf; }
  .ref-kind-dot.kind-implementation { background:#f59e0b; }
  .ref-kind-dot.kind-safety { background:#ef4444; }
  .ref-kind-dot.kind-other { background:#64748b; }
  .rp-ref-item.copied { background:rgba(14,165,255,.12); }
  .ref-copied { font-size:10px; background:#0EA5FF; color:#06212e; padding:2px 6px; border-radius:10px; margin-left:6px; letter-spacing:.05em; font-weight:600; }

  .refs-filter-row { display:flex; gap:10px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
  .refs-search-wrap { position:relative; flex:1; min-width:180px; }
  .ref-search { width:100%; background:#0d1419; border:1px solid #24323d; border-radius:8px; padding:6px 30px 6px 30px; color:#d6e4ee; font-size:13px; }
  .ref-search:focus { outline:2px solid #0EA5FF; outline-offset:2px; }
  .refs-search-wrap::before { content:'🔍'; position:absolute; left:10px; top:50%; transform:translateY(-50%); opacity:.55; font-size:14px; }
  .ref-clear { position:absolute; right:6px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,.08); border:0; width:22px; height:22px; border-radius:6px; cursor:pointer; color:#fff; }
  .ref-clear:hover { background:rgba(255,255,255,.15); }
  .refs-filter-right { display:flex; gap:8px; align-items:center; }
  .ref-kind-filter.minimal { background:#0d1419; border:1px solid #24323d; color:#d6e4ee; padding:6px 8px; font-size:12px; border-radius:8px; }
  .refs-count { font-size:11px; font-weight:600; letter-spacing:.06em; background:#132029; padding:6px 8px; border-radius:8px; color:#8db6cc; }
  .rp-cmd-btn { position:relative; border:1px solid #273038; background:linear-gradient(145deg, rgba(32,40,48,.55), rgba(21,27,33,.65)); padding:10px 12px 34px; border-radius:14px; cursor:pointer; color:var(--text,#e6eaf2); font-size:12.5px; text-align:left; width:100%; transition:border-color .25s, background .4s, transform .25s; }
  .rp-cmd-btn:hover { background:linear-gradient(145deg, rgba(40,52,63,.75), rgba(25,33,41,.75)); border-color:#345067; }
  .rp-cmd-btn:focus { outline:2px solid #0EA5FF; outline-offset:2px; }
  .rp-cmd-btn[data-copied] { border-color:#33d27b; box-shadow:0 0 0 1px #33d27b, 0 0 0 6px rgba(51,210,123,.18); }
  .rp-cmd-btn .rp-copy-status { position:absolute; bottom:8px; left:10px; font-size:11px; letter-spacing:.05em; text-transform:uppercase; opacity:.8; }
  .rp-cmd-btn + .rp-cmd-btn { margin-left:6px; }
  section + section { margin-top:16px; }
  .rp-cmds-list { list-style:none; margin:8px 0 0; padding:0; }
  .rp-prompts-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; }
  .rp-prompts-grid li { margin:0; }
  .rp-prompts-grid .rp-prompt-btn { height:100%; display:flex; flex-direction:column; justify-content:flex-start; }
  .rp-prompt-text { display:block; font-size:11.5px; line-height:1.42; margin-bottom:10px; }
  .rp-copy-status { font-size:11px; opacity:.75; letter-spacing:.05em; }
  .rp-cmds-list li.copied .rp-copy-status { color:#33d27b; font-weight:600; }

  .prompt-toolbar { background:rgba(255,255,255,.04); padding:8px 12px 10px; border:1px solid rgba(255,255,255,.07); border-radius:14px; box-shadow:0 3px 14px -5px rgba(0,0,0,.5); }
  .prompt-toolbar .pt-row { display:flex; flex-direction:column; gap:10px; }
  @media (min-width:820px){ .prompt-toolbar .pt-row { flex-direction:row; align-items:center; } }
  .prompt-toolbar .pt-left { display:flex; flex-direction:row; gap:12px; min-width:0; flex:1; align-items:center; }
  .prompt-toolbar .pt-right { margin-left:auto; display:flex; align-items:center; }
  .prompt-search-wrap { position:relative; display:flex; align-items:center; }
  .prompt-search { width:100%; background:#10161c; border:1px solid #2a3a45; border-radius:10px; padding:8px 12px 8px 34px; font-size:13px; color:#d8e5ef; box-shadow:inset 0 0 0 1px rgba(255,255,255,.05); }
  .prompt-search:focus { outline:2px solid #0EA5FF; outline-offset:2px; }
  .prompt-search-wrap::before { content:'🔍'; position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px; opacity:.65; }
  .ps-clear { position:absolute; right:6px; top:50%; transform:translateY(-50%); border:0; background:rgba(255,255,255,.08); color:#fff; width:22px; height:22px; border-radius:6px; cursor:pointer; font-size:14px; line-height:1; padding:0; }
  .ps-clear:hover { background:rgba(255,255,255,.15); }
  .prompt-cat-scroller { overflow:auto; padding-bottom:2px; -webkit-mask:linear-gradient(90deg,#000 92%, transparent); mask:linear-gradient(90deg,#000 92%, transparent); }
  .prompt-cats { display:flex; gap:6px; flex-wrap:nowrap; min-width:0; scrollbar-width:none; }
  .prompt-cats::-webkit-scrollbar { display:none; }
  .prompt-cats .cat { border:1px solid #222d35; background:#182129; color:#a2b5c2; padding:6px 14px; border-radius:20px; font-size:11.5px; letter-spacing:.04em; cursor:pointer; font-weight:600; line-height:1; white-space:nowrap; transition:background .25s,border-color .25s,color .25s; }
  .prompt-cats .cat.on { background:linear-gradient(145deg,#0EA5FF,#1480c0); color:#fff; border-color:#1192d8; box-shadow:0 2px 10px -3px rgba(14,165,255,.45); }
  .prompt-cats .cat:focus-visible { outline:2px solid #0EA5FF; outline-offset:2px; }
  .prompt-tools { display:flex; gap:6px; align-items:center; }
  .prompt-tools .pt-btn { border:1px solid #25313b; background:linear-gradient(145deg,#1d2730,#141b21); color:#c0d2dc; padding:6px 10px; border-radius:10px; font-size:12.5px; cursor:pointer; line-height:1; min-width:42px; text-align:center; }
  .prompt-tools .pt-btn.cycle-sort { font-weight:600; letter-spacing:.05em; }
  .prompt-tools .pt-btn:hover { background:#27323c; color:#fff; }
  .pt-count { font-size:11px; font-weight:600; letter-spacing:.07em; background:#132029; padding:6px 8px; border-radius:10px; color:#8db6cc; }
  .rp-prompts-pane { animation:fadeSlide .4s ease; }
  .rp-prompts-grid .rp-prompt-btn { position:relative; padding-bottom:40px; }
  .rp-prompt-cat { position:absolute; bottom:8px; right:10px; font-size:10px; letter-spacing:.06em; background:#1d2c35; border:1px solid #30434f; padding:3px 6px; border-radius:8px; color:#82cfff; }
  .rp-cmds-desc { font-size:12px; margin:10px 0 8px; opacity:.8; }
  .rp-ex-header { display:flex; align-items:center; justify-content:space-between; gap:14px; background:rgba(255,255,255,.03); padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,.06); }
  .rp-ex-controls { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .rp-ex-controls .tabs { display:flex; gap:6px; }
  .rp-ex-controls .tabs button[role=tab] { border:1px solid #273038; background:linear-gradient(145deg,#1a2026,#151b21); padding:6px 12px; border-radius:10px; cursor:pointer; font-size:12px; color:#a8b4bf; font-weight:500; transition:background .3s,border-color .3s,color .3s; }
  .rp-ex-controls .tabs button[role=tab]:hover { color:#d7e6f2; background:#23303a; }
  .rp-ex-controls .tabs button[aria-selected="true"] { color:#fff; background:linear-gradient(145deg,#0EA5FF,#167fb8); border-color:#289ed8; box-shadow:0 0 0 1px #1fa2e6, 0 4px 18px -6px rgba(14,165,255,.5); }
  .rp-example-body { overflow:auto; border:1px solid #273038; border-radius:14px; background:rgba(9,11,14,.85); padding:16px 18px; margin-top:12px; box-shadow:0 8px 32px -10px rgba(0,0,0,.55); }
  .rp-example-body.comfort { font-size:14px; line-height:1.55; }
  .rp-example-body.compact { font-size:13px; line-height:1.35; }
  .rp-plain, .rp-code { margin:0; white-space:pre-wrap; word-break:break-word; font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; font-size:12.5px; }
  .rp-code { background:#0a0f13; border:1px solid #273038; border-radius:10px; padding:14px; }
  .mode-toggle { display:inline-flex; background:#161616; border:1px solid #333; border-radius:6px; overflow:hidden; }
  .mode-toggle .mode-btn { background:transparent; border:0; padding:4px 10px; font-size:12px; cursor:pointer; color:#bbb; }
  .mode-toggle .mode-btn.active { background:#272727; color:#fff; }
  .mode-toggle .mode-btn + .mode-btn { border-left:1px solid #333; }
  .rp-preview-frame { box-shadow:0 8px 28px -6px rgba(0,0,0,.55); border-radius:16px; }
  .example-variant select:focus { outline:2px solid #555; }
  .rp-render :where(h1,h2,h3,h4) { margin:0.6em 0 0.3em; }
  .rp-render :where(p,li) { margin:0.3em 0; }
  .rp-render table { width:100%; border-collapse:collapse; margin:0.5em 0; }
  .rp-render th, .rp-render td { border:1px solid #333; padding:6px; }

  .rp-tabs-nav { display:flex; align-items:center; gap:6px; }
  .rp-tabs-scroll-mask { overflow:hidden; flex:1 1 auto; }
  .rp-tabs-wrap { display:flex; gap:10px; padding:4px 6px; background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02)); border:1px solid rgba(255,255,255,.07); border-radius:14px; backdrop-filter:blur(12px) saturate(140%); width:max-content; }
  .rp-tabs-scroll-mask::-webkit-scrollbar { display:none; }
  .rp-tabs-scroll-mask { scrollbar-width:none; }
  .rp-tab-scroll { border:1px solid #2b414f; background:linear-gradient(145deg,#142028,#0d161c); color:#87b9d4; width:34px; height:34px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:400; }
  .rp-tab-scroll:hover { color:#d8f2ff; background:#1d303a; }
  .rp-tab { font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; padding:10px 18px; background:linear-gradient(145deg,#1b232b,#141a21); border:1px solid #2c3945; border-radius:11px; cursor:pointer; color:#a2b4c4; position:relative; transition:background .35s,border-color .35s,color .35s, transform .25s; }
  .rp-tab:hover { color:#eaf6ff; background:linear-gradient(145deg,#24313d,#182028); }
  .rp-tab:focus-visible { outline:2px solid #0EA5FF; outline-offset:2px; }
  .rp-tab.is-active { color:#fff; background:linear-gradient(160deg,#0EA5FF 0%,#147bb8 55%, #0c4e72 100%); border-color:#1699d8; box-shadow:0 4px 18px -4px rgba(14,165,255,.45), 0 0 0 1px rgba(14,165,255,.65); }
  .rp-tab.is-active::after { content:""; position:absolute; left:8px; right:8px; bottom:3px; height:3px; border-radius:3px; background:linear-gradient(90deg,#fff,#d6f4ff,#fff); mix-blend-mode:screen; opacity:.75; }
  .rp-sticky-nav.is-scrolled { box-shadow:0 6px 18px -8px rgba(0,0,0,.9); backdrop-filter:blur(16px) saturate(160%); border-bottom:1px solid rgba(255,255,255,.09); }

  .rp-info-pane { animation:fadeSlide .45s ease; }
  .rp-info-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
  .rp-info-card { position:relative; border:1px solid rgba(255,255,255,.09); background:linear-gradient(145deg, rgba(28,34,42,.65), rgba(18,24,30,.85)); border-radius:16px; padding:14px 14px 16px; box-shadow:0 6px 22px -8px rgba(0,0,0,.55); overflow:hidden; }
  .rp-info-card.kind-risk { border-color:#ffb547; box-shadow:0 0 0 1px rgba(255,181,71,.5), 0 0 0 6px rgba(255,181,71,.15); }
  .rp-info-card.kind-model { border-color:#1fa2e6; box-shadow:0 0 0 1px rgba(31,162,230,.5), 0 0 0 6px rgba(31,162,230,.18); }
  .rp-info-card__head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
  .rp-info-card__head .sec-toggle { background:none; border:0; padding:0; margin:0; cursor:pointer; font:inherit; text-align:left; }
  .rp-info-card__head h4, .rp-info-card__head .sec-toggle { margin:0; font-size:13.75px; letter-spacing:.055em; text-transform:uppercase; font-weight:700; background:linear-gradient(90deg,#fff,#b4e5ff 70%,#5bc2ff); -webkit-background-clip:text; color:transparent; display:inline-block; }

  .rp-info-card.is-collapsed .rp-info-card__body { display:none; }
  .rp-info-toolbar { display:flex; gap:10px; align-items:center; margin:0 0 14px; flex-wrap:wrap; }
  .info-ctrl { border:1px solid #2c3e49; background:linear-gradient(145deg,#1a242c,#141c23); color:#b5c9d7; padding:6px 12px; font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; border-radius:8px; cursor:pointer; font-weight:600; }
  .info-ctrl:hover { background:#25323b; color:#e3f3ff; }
  .schema-viewer { width:100%; min-height:180px; margin-top:10px; background:#0d1419; color:#cfe8f6; border:1px solid #24323b; border-radius:8px; padding:10px; font-family:ui-monospace,monospace; font-size:12px; resize:vertical; }

  .md-list { list-style:none; padding:4px 0 6px; margin:4px 0 8px; }
  .md-list li { position:relative; padding-left:16px; margin:2px 0 4px; font-size:12.5px; line-height:1.5; }
  .md-list li::before { content:'•'; position:absolute; left:0; top:0; color:#35b6ff; font-weight:700; }

  .contrast-soft .rp-info-card { background:linear-gradient(145deg, rgba(30,36,44,.55), rgba(20,24,30,.65)); box-shadow:0 3px 12px -4px rgba(0,0,0,.45); }
  .contrast-soft .rp-tab.is-active { box-shadow:0 2px 10px -3px rgba(14,165,255,.35), 0 0 0 1px rgba(14,165,255,.5); }
  .contrast-soft .rp-panel::before { opacity:.65; }
  .contrast-soft .rp-title { background:linear-gradient(90deg,#f6fbff,#d5edfa 60%,#9ad7f8); -webkit-background-clip:text; }
  .rp-info-card.kind-risk .rp-info-card__head h4 { background:linear-gradient(90deg,#ffebc2,#ffd08a,#ffb547); -webkit-background-clip:text; color:transparent; }
  .rp-info-card.kind-model .rp-info-card__head h4 { background:linear-gradient(90deg,#b3ecff,#92d8ff,#0EA5FF); -webkit-background-clip:text; color:transparent; }
  .rp-info-card__head { position:relative; }
  .rp-info-card__head::after { content:""; position:absolute; left:0; right:0; bottom:-4px; height:1px; background:linear-gradient(90deg,rgba(255,255,255,.15),rgba(255,255,255,0)); }

  .rp-top-btn { position:fixed; right:22px; bottom:26px; z-index:50; border:1px solid #1b4d63; background:linear-gradient(160deg,#0d202b,#123240); color:#e0f6ff; font-size:16px; width:42px; height:42px; border-radius:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 22px -6px rgba(0,0,0,.7), 0 0 0 1px rgba(14,165,255,.4); backdrop-filter:blur(10px) saturate(150%); transition:background .3s, transform .25s; }
  .rp-top-btn:hover { background:linear-gradient(160deg,#134257,#16668a); }
  .rp-top-btn:active { transform:translateY(2px); }
  .rp-info-card__body p { margin:4px 0 6px; font-size:12.5px; line-height:1.52; color:#d1dae3; }
  .risk-badge { display:inline-flex; align-items:center; font-size:10px; letter-spacing:.08em; font-weight:700; padding:4px 8px; border-radius:8px; background:var(--amber-weak,#3a2a05); color:#ffe3b3; border:1px solid rgba(255,181,71,.5); }
  .schema-btn { font-size:10.5px; letter-spacing:.05em; padding:6px 10px; border-radius:8px; background:rgba(14,165,255,.12); border:1px solid rgba(14,165,255,.4); color:#b9def5; cursor:pointer; font-weight:600; }
  .schema-btn:hover { background:rgba(14,165,255,.2); color:#fff; }
  @keyframes fadeSlide { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
  .rp-tabpanes > section[role=tabpanel] { animation:fadeSlide .4s ease; }


  .rp-panel > section { position:relative; padding-top:4px; }
  .rp-panel > section > h3 { font-size:12.5px; letter-spacing:.06em; text-transform:uppercase; font-weight:700; opacity:.85; margin:0 0 8px; display:inline-flex; align-items:center; gap:6px; }
  .rp-panel > section::before { content:""; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg, rgba(14,165,255,.55), rgba(14,165,255,0)); opacity:.55; }
  .rp-panel > section + section { margin-top:22px; }

  #rp-info .rp-info-text { font-size:13px; line-height:1.6; color:#d0dae3; }

  @media (prefers-contrast: more){ .rp-cmd-btn:focus, .rp-ex-controls .tabs button[role=tab]:focus { outline:2px solid #fff; } }
  @media print { .rp-panel { background:#fff !important; color:#000 !important; } .rp-example-body { background:#fff; border-color:#ccc; } }
  @media (max-width: 1100px){ .rp-panel { width:450px; } }
  `}</style></>;
};

export default RightPanelFourBlock;
