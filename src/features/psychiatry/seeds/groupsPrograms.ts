import type { Card, CardTag, PromptVariable } from '../lib/types';

interface P17EvidenceItem { title: string; authors?: string; year?: string|number; journal?: string; link?: string; doi?: string; note?: string }
interface P17VariableSeed { id: string; label: string; type?: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'tags'; placeholder?: string; required?: boolean; help?: string; options?: string[]; default?: string|number|string[]; min?: number; max?: number; step?: number }
interface P17PromptSeed { name: string; variables: P17VariableSeed[]; generators?: Array<{ id: string; label: string; hint?: string }> }
interface P17CardSeed { id: string; title: string; tags?: string[]; description?: string; html: string; prompts: P17PromptSeed[]; evidence?: P17EvidenceItem[]; figureHtml?: string }


const gp_card_mfg: P17CardSeed = {
  id: 'gp-mfg',
  title: 'Multi-Family Psychoeducation (Schizophrenia / Bipolar)',
  tags: ['psychosis','bipolar','cbt','risk'],
  description: '6–8 session multi-family psychoeducation outline with relapse prevention, communication/problem-solving, medication & early-warning plans.',
  html: `\n<h2>Multi-Family Psychoeducation — {{program_focus}}</h2>\n<p><strong>Date:</strong> {{date}} &nbsp; <strong>Facilitator(s):</strong> {{facilitators}} &nbsp; <strong>Setting:</strong> {{setting}}</p>\n\n<h3>Cohort & Logistics</h3>\n<ul>\n  <li><strong>Program focus:</strong> {{program_focus}}</li>\n  <li><strong>Group size:</strong> {{group_size}} families</li>\n  <li><strong>Session length:</strong> {{session_length}} minutes</li>\n  <li><strong>Number of sessions:</strong> {{n_sessions}}</li>\n</ul>\n\n<h3>Session Plan</h3>\n<ol>\n  {{#each sessions}}<li><strong>{{title}}</strong> — {{goals}} (homework: {{homework}})</li>{{/each}}\n</ol>\n\n<h3>Materials & Measures</h3>\n<ul>\n  <li><strong>Handouts:</strong> {{#each handouts}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Measures (pre/post):</strong> {{measures}}</li>\n</ul>\n\n<h3>Relapse/Early-Warning Plan (template)</h3>\n<p>{{relapse_plan}}</p>\n\n<p class="muted" style="font-size:12px">Family intervention/psychoeducation is recommended in schizophrenia and bipolar care; adapt locally. Support tool only — not a substitute for clinical judgment or emergency services.</p>\n`,
  prompts: [{
    name: 'MFG — base',
    variables: [
      { id:'date', label:'Start date', type:'date', required:true },
      { id:'facilitators', label:'Facilitators', type:'tags', required:true },
      { id:'setting', label:'Setting', type:'select', options:['Clinic','Community','Telehealth'], default:'Clinic' },
      { id:'program_focus', label:'Program focus', type:'select', options:['Schizophrenia/Psychosis','Bipolar Disorder'], required:true },
      { id:'group_size', label:'Group size (families)', type:'number', default:6, min:2, max:16 },
      { id:'session_length', label:'Session length (min)', type:'number', default:90, min:60, max:150 },
      { id:'n_sessions', label:'Number of sessions', type:'select', options:['6','7','8'], default:'8' },
      { id:'sessions', label:'Session list (title/goals/homework)', type:'tags', default:[
        'Welcome & shared understanding | overview/roles/hope | reflect on expectations',
        'Understanding illness & treatment | psychoeducation & meds basics | read handout & list questions',
        'Stress–vulnerability & sleep | rhythm, substances, relapse model | track sleep/activators',
        'Communication skills | validate/express needs/problem-solve | 1 skill at home',
        'Problem-solving practice | define/brainstorm/choose/test | try agreed step',
        'Early-warning signatures | personalized relapse plan | draft signature list',
        'Crisis planning & means safety | roles/contacts | finalize card',
        'Consolidation & next steps | maintenance & supports | review goals'
      ]},
      { id:'handouts', label:'Handouts', type:'tags', default:['Condition overview','Medication FAQ','Sleep & social rhythm','Communication starters','Relapse signature checklist','Crisis contacts'] },
      { id:'measures', label:'Measures (pre/post)', type:'text', placeholder:'PHQ-9, GAD-7, caregiver burden, relapse events 3–6 mo' },
      { id:'relapse_plan', label:'Relapse/Early-warning plan text', type:'textarea', required:true }
    ],
    generators: [
      { id:'create_outline', label:'Create 8-session outline', hint:'families + service user goals' },
      { id:'compose_facilitator_script', label:'Compose facilitator script (Session 1)' },
      { id:'make_homework_pack', label:'Make homework & handouts pack' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'NICE CG178 — Psychosis/Schizophrenia (family intervention recommended)', authors:'NICE', year:'reviewed 2025', link:'https://www.nice.org.uk/guidance/cg178' },
    { title:'Family-based interventions vs standard care in schizophrenia — systematic review', authors:'Chien et al.', year:'2020', link:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7030970/' },
    { title:'NICE CG185 — Bipolar disorder (psychoeducation; family/carer involvement)', authors:'NICE', link:'https://www.nice.org.uk/guidance/cg185' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">MFG Flow</figcaption>\n  <ul style="font-size:12px">\n    <li>Psychoeducation → skills (communication/problem-solving)</li>\n    <li>Sleep/rhythm & stress model → relapse plan</li>\n    <li>Roles in crisis → consolidation & maintenance</li>\n  </ul>\n</figure>`
};

const gp_card_cbt_anxiety: P17CardSeed = {
  id: 'gp-cbt-anxiety',
  title: 'CBT for Anxiety Group — 8-Session Core (GAD/Panic/Social)',
  tags: ['anxiety','cbt','risk'],
  description: 'Structured 8-session CBT outline covering psychoeducation, cognitive skills, exposure planning, and relapse prevention (adult).',
  html: `\n<h2>CBT for Anxiety Group — 8-Session Core</h2>\n<p><strong>Start:</strong> {{date}} &nbsp; <strong>Facilitator(s):</strong> {{facilitators}} &nbsp; <strong>Mode:</strong> {{mode}}</p>\n\n<h3>Parameters</h3>\n<ul>\n  <li><strong>Primary focus:</strong> {{primary_focus}}</li>\n  <li><strong>Group size:</strong> {{group_size}}</li>\n  <li><strong>Session length:</strong> {{session_length}} minutes</li>\n</ul>\n\n<h3>Session Map</h3>\n<ol>\n  {{#each sessions}}<li><strong>{{title}}</strong> — {{goals}} (homework: {{homework}})</li>{{/each}}\n</ol>\n\n<h3>Exposure Plan (template)</h3>\n<p>{{exposure_plan}}</p>\n\n<h3>Measures & Progress</h3>\n<p>{{measures}}</p>\n\n<p class="muted" style="font-size:12px">Structure reflects NICE guidance for GAD/panic and social anxiety (education, cognitive work, exposure, relapse prevention). Support tool only — not a substitute for clinical judgment or emergency services.</p>\n`,
  prompts: [{
    name: 'CBT-Anxiety — base',
    variables: [
      { id:'date', label:'Start date', type:'date', required:true },
      { id:'facilitators', label:'Facilitators', type:'tags', required:true },
      { id:'mode', label:'Mode', type:'select', options:['In-person','Tele-group','Hybrid'], default:'In-person' },
      { id:'primary_focus', label:'Primary focus', type:'select', options:['GAD','Panic','Social anxiety','Mixed'], default:'Mixed' },
      { id:'group_size', label:'Group size', type:'number', default:8, min:4, max:14 },
      { id:'session_length', label:'Session length (min)', type:'number', default:90, min:60, max:120 },
      { id:'sessions', label:'Session list (title/goals/homework)', type:'tags', default:[
        'Orientation & model | psychoeducation + cycle | monitor symptoms',
        'Cognitive skills I | thoughts–feelings–behaviours | 2 thought records',
        'Cognitive skills II | probabilities/behavioural experiments | 1 experiment',
        'Exposure planning | hierarchies & safety-behaviours | build hierarchy',
        'Exposure I | in-session + homework setup | log exposures',
        'Exposure II | refine & add interoceptive/social tasks | repeat logs',
        'Relapse prevention | triggers & early-warning plan | prevention card',
        'Booster/closure | review skills & next steps | plan maintenance'
      ]},
      { id:'exposure_plan', label:'Exposure plan text', type:'textarea', required:true },
      { id:'measures', label:'Measures & cadence', type:'text', placeholder:'PHQ-9/GAD-7 weekly; SPIN/PDSS-SR if appropriate' }
    ],
    generators: [
      { id:'create_outline', label:'Create 8-session outline' },
      { id:'compose_facilitator_script', label:'Compose facilitator script (Session 1)' },
      { id:'make_exposure_pack', label:'Make exposure hierarchy pack' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'NICE CG113 — GAD & Panic (stepped care; CBT/exposure)', authors:'NICE', link:'https://www.nice.org.uk/guidance/cg113' },
    { title:'NICE CG113 — Recommendations (CBT/exposure elements)', authors:'NICE', link:'https://www.nice.org.uk/guidance/cg113/chapter/Recommendations' },
    { title:'NICE CG159 — Social anxiety disorder (CBT structure)', authors:'NICE', year:'reviewed 2024', link:'https://www.nice.org.uk/guidance/cg159' },
    { title:'Social anxiety CBT delivery details (education, cog restructuring, exposure, relapse prevention)', authors:'NICE (detail page)', link:'https://www.nice.org.uk/guidance/cg159/chapter/1-recommendations' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">CBT Group Arc</figcaption>\n  <ul style="font-size:12px">\n    <li>Psychoeducation → skills → exposure</li>\n    <li>Relapse prevention → maintenance</li>\n  </ul>\n</figure>`
};

const gp_card_dbt: P17CardSeed = {
  id: 'gp-dbt-skills',
  title: 'DBT Skills Group — 12-Week Rotation (Mindfulness / Distress Tolerance / Emotion Regulation / Interpersonal Effectiveness)',
  tags: ['risk'],
  description: 'Rotation outline for a DBT skills group (psychoeducation, practice, homework); avoids quoting proprietary exercises.',
  html: `\n<h2>DBT Skills Group — 12-Week Rotation</h2>\n<p><strong>Start:</strong> {{date}} &nbsp; <strong>Facilitator(s):</strong> {{facilitators}} &nbsp; <strong>Population:</strong> {{population}}</p>\n\n<h3>Parameters</h3>\n<ul>\n  <li><strong>Group size:</strong> {{group_size}}</li>\n  <li><strong>Session length:</strong> {{session_length}} minutes</li>\n  <li><strong>Rotation length:</strong> {{rotation_length}} weeks</li>\n</ul>\n\n<h3>Weekly Map</h3>\n<ol>\n  {{#each weeks}}<li><strong>{{title}}</strong> — {{goals}} (practice: {{practice}})</li>{{/each}}\n</ol>\n\n<h3>Skills Practice & Coaching</h3>\n<p>{{practice_plan}}</p>\n\n<h3>Risk & Coordination</h3>\n<p>{{risk_note}}</p>\n\n<p class="muted" style="font-size:12px">DBT skills groups have evidence for BPD and self-harm reduction; ensure programmatic fidelity and crisis protocols. Support tool only — not a substitute for clinical judgment or emergency services.</p>\n`,
  prompts: [{
    name: 'DBT — base',
    variables: [
      { id:'date', label:'Start date', type:'date', required:true },
      { id:'facilitators', label:'Facilitators', type:'tags', required:true },
      { id:'population', label:'Population', type:'select', options:['Adults (BPD spectrum)','Adolescents (with caregiver)','Mixed'], default:'Adults (BPD spectrum)' },
      { id:'group_size', label:'Group size', type:'number', default:10, min:4, max:16 },
      { id:'session_length', label:'Session length (min)', type:'number', default:120, min:90, max:150 },
      { id:'rotation_length', label:'Rotation length (weeks)', type:'number', default:12, min:8, max:24 },
      { id:'weeks', label:'Week list (title/goals/practice)', type:'tags', default:[
        '1. Orientation & mindfulness basics | biosocial model + what/how skills | daily mindfulness log',
        '2. Distress tolerance I | STOP/TIPP overview | practice TIPP once/day',
        '3. Distress tolerance II | pros/cons, crisis plan | complete pros/cons sheet',
        '4. Emotion regulation I | model, PLEASE basics | track vulnerabilities',
        '5. Emotion regulation II | opposite action | do 1 OA task',
        '6. Interpersonal effectiveness I | DEAR MAN | write one script',
        '7. Interpersonal effectiveness II | GIVE & FAST | practice with partner',
        '8. Mindfulness II | wise mind & observing | log moments',
        '9. Distress tolerance III | reality acceptance | 1 acceptance exercise',
        '10. Emotion regulation III | check the facts | worksheet',
        '11. Interpersonal effectiveness III | troubleshooting | role-plays',
        '12. Relapse prevention & graduation | generalization plan | maintenance card'
      ]},
      { id:'practice_plan', label:'Practice/coaching plan', type:'textarea', placeholder:'between-session skills coaching availability/protocol' },
      { id:'risk_note', label:'Risk/coordination note', type:'textarea', placeholder:'how crises are handled; links to individual therapy/med mgmt; means-safety reminders' }
    ],
    generators: [
      { id:'create_rotation', label:'Create 12-week rotation outline' },
      { id:'compose_facilitator_script', label:'Compose facilitator script (Week 1)' },
      { id:'make_skills_cards', label:'Make learner skills cards' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'DBT effectiveness — systematic review (BPD/suicidality)', authors:'Hernández-Bustamante et al.', year:'2024', link:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10896753/' },
    { title:'DBT overview & evidence status', authors:'APA Division 12', link:'https://div12.org/psychological-treatments/treatments/dialectical-behavior-therapy-for-borderline-personality-disorder/' },
    { title:'DBT implementation/effectiveness (program fidelity)', authors:'Flynn et al.', year:'2021', link:'https://www.sciencedirect.com/science/article/pii/S2352250X21000038' },
    { title:'DBT skills training group description', authors:'May et al.', year:'2016', link:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6007584/' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">DBT Skills Rotation</figcaption>\n  <ul style="font-size:12px">\n    <li>Mindfulness → DT → ER → IE</li>\n    <li>Practice every week + coaching protocol</li>\n  </ul>\n</figure>`
};

export function buildGroupsPrograms(existingIds: Set<string>): Card[] {
  const seeds: P17CardSeed[] = [gp_card_mfg, gp_card_cbt_anxiety, gp_card_dbt];
  const out: Card[] = [];
  for(const seed of seeds){
    if(existingIds.has(seed.id)) continue;
    const allowed: CardTag[] = (seed.tags||[]).filter(t => [ 'psychosis','bipolar','cbt','anxiety','risk','suicide','documentation','monitoring' ].includes(t)) as CardTag[];
    const card: Card = {
      id: seed.id,
      title: seed.title,
      sectionId: 'groups-programs',
      summary: seed.description,
      tags: allowed.length ? allowed : ['documentation'],
      html: seed.html,
  prompts: seed.prompts.map(p=>({ id:`${seed.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-'), label:p.name, template:'', variables: p.variables.map(v=>{ const pv: PromptVariable = { key:v.id, label:v.label, type: v.type==='textarea' ? 'multiline': (v.type as Exclude<PromptVariable['type'], undefined>) }; if(v.placeholder) pv.placeholder=v.placeholder; if(v.required!==undefined) pv.required=v.required; if(v.options) pv.options=v.options; if(v.default!==undefined) pv.default = v.default as string; return pv; }), generators: p.generators })),
      evidence: seed.evidence?.map(e=>({ title:e.title, authors:(e.authors||''), year:e.year, journal:e.journal, link:e.link, doi:e.doi, note:e.note })) ?? [],
      figureHtml: seed.figureHtml
    } as Card;
    out.push(card);
  }
  return out;
}
