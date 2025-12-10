import type { Card, CardTag, PromptVariable } from '../lib/types';




type P16EvidenceItem = { title: string; authors?: string; year?: string|number; org?: string; link?: string; note?: string };
interface P16VariableSeed {
  id: string; label: string;
  type?: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'tags';
  placeholder?: string; required?: boolean; help?: string; options?: string[]; default?: string|number|string[];
  min?: number; max?: number; step?: number;
}
interface P16PromptSeed { name: string; variables: P16VariableSeed[]; generators?: Array<{ id: string; label: string; hint?: string }>; }
interface P16CardSeed {
  id: string; title: string; tags?: string[]; description?: string; html: string;
  prompts: P16PromptSeed[];
  evidence?: P16EvidenceItem[]; figureHtml?: string;
}

const camhs_card_consent: P16CardSeed = {
  id: 'camhs-consent-assent',
  title: 'Consent/Assent & Safeguarding Summary',
  tags: ['consent','assent','gillick','fraser','parental responsibility','safeguarding','child','adolescent'],
  description: 'One-page memo capturing who can consent, child assent, information-sharing preferences, and safeguarding red-flags with actions.',
  html: `\n<h2>Consent/Assent & Safeguarding — Summary</h2>\n<p><strong>Date:</strong> {{date}} &nbsp; <strong>Clinician:</strong> {{clinician}} &nbsp; <strong>Setting:</strong> {{setting}}</p>\n\n<h3>People & Roles</h3>\n<ul>\n  <li><strong>Young person:</strong> {{young_person}} (age {{age}})</li>\n  <li><strong>Parent(s)/Carer(s) with parental responsibility:</strong> {{parents}}</li>\n  <li><strong>Legal/guardianship context:</strong> {{legal_context}}</li>\n</ul>\n\n<h3>Consent & Assent</h3>\n<ul>\n  <li><strong>Decision capacity (Gillick-style):</strong> {{gillick_judgment}}</li>\n  {{?fraser: <li><strong>Fraser guidance (if applicable):</strong> {{fraser}}</li>}}\n  <li><strong>Assent (child/young person):</strong> {{assent_summary}}</li>\n  <li><strong>Scope of consent today:</strong> {{consent_scope}}</li>\n  <li><strong>Information sharing:</strong> {{info_sharing}}</li>\n</ul>\n\n<h3>Safeguarding</h3>\n<ul>\n  <li><strong>Red flags noted:</strong> {{#each red_flags}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Immediate actions:</strong> {{actions_now}}</li>\n  <li><strong>Plan & escalation:</strong> {{plan}}</li>\n</ul>\n\n<p class="muted" style="font-size:12px">This memo supports (does not replace) legal duties and local safeguarding procedures.</p>\n`,
  prompts: [{
    name: 'Consent/Assent — base',
    variables: [
      { id:'date', label:'Date', type:'date', required:true },
      { id:'clinician', label:'Clinician', type:'text', required:true },
      { id:'setting', label:'Setting', type:'select', options:['Clinic','ED','Inpatient','Telehealth'] },
      { id:'young_person', label:'Young person (name/ID)', type:'text', required:true },
      { id:'age', label:'Age', type:'number' },
      { id:'parents', label:'Parent(s)/carer(s) with PR', type:'tags' },
      { id:'legal_context', label:'Legal/guardianship context', type:'textarea' },
      { id:'gillick_judgment', label:'Capacity judgment', type:'textarea' },
      { id:'fraser', label:'Fraser guidance (if contraception/sexual health)', type:'textarea' },
      { id:'assent_summary', label:'Assent (what the young person agrees to)', type:'textarea' },
      { id:'consent_scope', label:'Scope of consent today', type:'tags' },
      { id:'info_sharing', label:'Information sharing preferences', type:'textarea' },
      { id:'red_flags', label:'Safeguarding red flags', type:'tags' },
      { id:'actions_now', label:'Immediate actions', type:'textarea' },
      { id:'plan', label:'Plan & escalation', type:'textarea', required:true }
    ],
    generators: [
      { id:'create_compact', label:'Create compact consent/assent memo' },
      { id:'compose_extended', label:'Compose extended memo', hint:'adds rationale + legal notes' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'Gillick & Fraser overview', org:'NSPCC Learning', year:'2022', link:'https://learning.nspcc.org.uk/child-protection-system/gillick-competence-fraser-guidelines' },
    { title:'NHS — Consent and young people', org:'NHS', link:'https://www.nhs.uk/tests-and-treatments/consent-to-treatment/children/' },
    { title:'CQC mythbuster — Gillick/Fraser', org:'CQC', year:'2022', link:'https://www.cqc.org.uk/guidance-providers/gps/gp-mythbusters/gp-mythbuster-8-gillick-competency-fraser-guidelines' },
    { title:'OHRP — Children: consent/assent (research)', org:'HHS', link:'https://www.hhs.gov/ohrp/regulations-and-policy/guidance/faq/children-research/index.html' },
    { title:'Assent in pediatrics — ethics review', authors:'Spriggs M', year:'2023', link:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10075240/' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Quick Map — Consent, Assent, Safeguarding</figcaption>\n  <ul style="font-size:12px">\n    <li>Assess decision capacity (Gillick-style) → document scope</li>\n    <li>Seek child/YP assent; respect dissent where safe</li>\n    <li>Share info per preference/legal duties</li>\n    <li>Safeguarding: identify red flags → act → document</li>\n  </ul>\n</figure>`
};

const camhs_card_school: P16CardSeed = {
  id: 'camhs-school-plans',
  title: 'School Letters & Support Plans (504/EHCP-style & Reasonable Adjustments)',
  tags: ['school','letters','child','adolescent'],
  description: 'Parent letter to school, clinician summary for accommodations, and a simple support plan with adjustments and measurable targets.',
  html: `\n<h2>School Letters & Support Plan</h2>\n<p><strong>Young person:</strong> {{young_person}} &nbsp; <strong>Date:</strong> {{date}} &nbsp; <strong>School:</strong> {{school}}</p>\n\n<h3>Letter to School (Parent/Carer)</h3>\n<p>{{parent_letter}}</p>\n\n<h3>Clinician Summary for Accommodations</h3>\n<ul>\n  <li><strong>Key needs:</strong> {{#each needs}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Recommended adjustments:</strong> {{#each adjustments}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Monitoring & review:</strong> {{monitoring}}</li>\n</ul>\n\n<h3>Support Plan (504/EHCP-style)</h3>\n<p><strong>Goals:</strong> {{#each goals}}<span>{{item}}</span>{{/each}}</p>\n<p><strong>Classroom strategies:</strong> {{#each strategies}}<span>{{item}}</span>{{/each}}</p>\n<p><strong>Contacts & review date:</strong> {{contacts}} — {{review_date}}</p>\n`,
  prompts: [{
    name: 'School Plan — base',
    variables: [
      { id:'young_person', label:'Young person', type:'text', required:true },
      { id:'date', label:'Date', type:'date', required:true },
      { id:'school', label:'School/Year', type:'text' },
      { id:'parent_letter', label:'Parent letter (plain language)', type:'textarea', required:true },
      { id:'needs', label:'Key needs', type:'tags' },
      { id:'adjustments', label:'Recommended adjustments', type:'tags' },
      { id:'monitoring', label:'Monitoring & review approach', type:'textarea' },
      { id:'goals', label:'Goals (measurable)', type:'tags' },
      { id:'strategies', label:'Classroom strategies', type:'tags' },
      { id:'contacts', label:'Contacts', type:'tags' },
      { id:'review_date', label:'Review date', type:'date' },
      { id:'jurisdiction', label:'Jurisdiction', type:'select', options:['General/International','UK (EHCP)','US (504/IEP)'] }
    ],
    generators: [
      { id:'create_parent_letter', label:'Create parent-to-school letter' },
      { id:'make_clinician_summary', label:'Make clinician accommodation summary' },
      { id:'compose_support_plan', label:'Compose simple support plan', hint:'goals + strategies + review' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'CDC — ADHD in the classroom (accommodations)', org:'CDC', year:'2024', link:'https://www.cdc.gov/adhd/treatment/classroom.html' },
    { title:'Section 504 — accommodations overview', org:'DoDEA', link:'https://www.dodea.edu/education/student-services/section-504-accommodations' },
    { title:'UK — Education, Health and Care Plans (EHCP) overview', org:'gov.uk', link:'https://www.gov.uk/children-with-special-educational-needs/extra-SEN-help' },
    { title:'Reasonable adjustments — autistic pupils', org:'National Autistic Society', year:'2025 review', link:'https://www.autism.org.uk/advice-and-guidance/professional-practice/adjustments-sensory' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Adjustments — Quick Picks</figcaption>\n  <ul style="font-size:12px">\n    <li>Environment: seating, noise, visual clutter</li>\n    <li>Tasking: chunk, scaffold, visual schedule</li>\n    <li>Time: extra time, flexible breaks</li>\n    <li>Regulation: movement/sensory tools</li>\n  </ul>\n</figure>`
};

const camhs_card_adhd_asd: P16CardSeed = {
  id: 'camhs-adhd-asd',
  title: 'ADHD/ASD — Psychoeducation & Home–School Behavior Tools',
  tags: ['adhd','asd','child','adolescent'],
  description: 'Clinician-grade psychoeducation plus ready behavior supports: daily report card, token system, sensory plan, and meltdown plan.',
  html: `\n<h2>ADHD/ASD — Psychoeducation & Behavior Tools</h2>\n<p><strong>Young person:</strong> {{young_person}} &nbsp; <strong>Date:</strong> {{date}}</p>\n\n<h3>Psychoeducation</h3>\n<ul>\n  <li><strong>ADHD basics:</strong> {{adhd_about}}</li>\n  <li><strong>ASD basics:</strong> {{asd_about}}</li>\n  <li><strong>Treatments (overview):</strong> {{treatments}}</li>\n</ul>\n\n<h3>Home–School Behavior Supports</h3>\n<ul>\n  <li><strong>Daily report card targets:</strong> {{#each drc_targets}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Token/reward plan:</strong> {{token_plan}}</li>\n  <li><strong>Sensory/environment plan:</strong> {{sensory_plan}}</li>\n  <li><strong>Meltdown/escape-maintained behavior plan:</strong> {{meltdown_plan}}</li>\n</ul>\n\n<h3>Follow-up & Review</h3>\n<p>{{followup}}</p>\n`,
  prompts: [{
    name: 'ADHD/ASD — base',
    variables: [
      { id:'young_person', label:'Young person', type:'text', required:true },
      { id:'date', label:'Date', type:'date', required:true },
      { id:'adhd_about', label:'ADHD basics (plain language)', type:'textarea', required:true },
      { id:'asd_about', label:'ASD basics (plain language)', type:'textarea', required:true },
      { id:'treatments', label:'Treatments overview', type:'tags' },
      { id:'drc_targets', label:'Daily report card targets', type:'tags' },
      { id:'token_plan', label:'Token/reward plan', type:'textarea' },
      { id:'sensory_plan', label:'Sensory/environment plan', type:'textarea' },
      { id:'meltdown_plan', label:'Meltdown plan', type:'textarea' },
      { id:'followup', label:'Follow-up (review cadence & who meets)', type:'textarea', required:true },
  { id:'language', label:'Language', type:'select', options:['English','Turkish','Bilingual (EN/Turkish)'] }
    ],
    generators: [
      { id:'create_psychoed', label:'Create ADHD/ASD psychoeducation', hint:'family-friendly + evidence anchors' },
      { id:'make_drc', label:'Make daily report card', hint:'targets + scoring + home reward link' },
      { id:'compose_behavior_plan', label:'Compose behavior plan', hint:'token + sensory + meltdown steps' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'NICE NG87 — ADHD (children/YP and adults)', org:'NICE', year:'2018, reviewed 2025', link:'https://www.nice.org.uk/guidance/ng87' },
    { title:'AAP 2019 — ADHD clinical practice guideline', org:'American Academy of Pediatrics', year:'2019', link:'https://publications.aap.org/pediatrics/article/144/4/e20192528/81590/Clinical-Practice-Guideline-for-the-Diagnosis' },
    { title:'CDC — ADHD classroom strategies', org:'CDC', year:'2024', link:'https://www.cdc.gov/adhd/treatment/classroom.html' },
    { title:'NICE CG170 — Autism under 19s (support & management)', org:'NICE', year:'2013, updated 2021', link:'https://www.nice.org.uk/guidance/cg170' },
    { title:'National Autistic Society — reasonable adjustments', org:'NAS', year:'2025 review', link:'https://www.autism.org.uk/advice-and-guidance/professional-practice/adjustments-sensory' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Behavior Support — Quick Loop</figcaption>\n  <ol style="font-size:12px;padding-left:16px">\n    <li>Define 2–4 targets → teach & model</li>\n    <li>Daily report card → token link at home</li>\n    <li>Adjust environment & sensory supports</li>\n    <li>Review weekly → tweak targets/rewards</li>\n  </ol>\n</figure>`
};



export function buildCamhsCards(existingIds: Set<string>): Card[] {
  const seeds: P16CardSeed[] = [camhs_card_consent, camhs_card_school, camhs_card_adhd_asd];
  const out: Card[] = [];
  for(const seed of seeds){
    if(existingIds.has(seed.id)) continue;
    const allowed: CardTag[] = (seed.tags||[]).filter(t => ['child','adolescent','school','risk'].includes(t)) as CardTag[];
    const card: Card = {
      id: seed.id,
      title: seed.title,
      sectionId: 'camhs',
      summary: seed.description,
      tags: allowed.length ? allowed : ['child','adolescent'],
      html: seed.html,
      prompts: seed.prompts.map(p=>({
        id: `${seed.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-'),
        label: p.name,
        template: '',
        variables: p.variables.map(v=>{
          const mapped: PromptVariable = {
            key: v.id,
            label: v.label,
            type: v.type === 'textarea' ? 'multiline' : (v.type as Exclude<PromptVariable['type'], undefined>)
          };
          if (v.placeholder !== undefined) mapped.placeholder = v.placeholder ?? '';
          if (v.required !== undefined) mapped.required = v.required;
          if (v.options !== undefined) mapped.options = v.options;
          if (v.default !== undefined) mapped.default = v.default as string;
          return mapped;
        }),
        generators: p.generators
      })),
      evidence: seed.evidence?.map(e=>({ title: e.title, authors: (e.authors || e.org || ''), year: e.year, link: e.link, note: e.note })) ?? [],
      figureHtml: seed.figureHtml
    } as Card;
    out.push(card);
  }
  return out;
}
