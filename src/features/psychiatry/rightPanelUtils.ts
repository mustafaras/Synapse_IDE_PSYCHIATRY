import type { Card } from './lib/types';
import { renderAutoscoreHTML } from './mbc/calculators';

import type { PsychotherapyItem } from '@/features/psychiatry/content/psychotherapies';
import type { MedItem } from '@/features/psychiatry/content/medicationSelection';
import type { MedOrderItem } from '@/features/psychiatry/content/medicationOrdersMonitoring';
import type { FollowItem } from '@/features/psychiatry/content/followUpMonitoring';
import type { EduItem } from '@/features/psychiatry/content/psychoeducation';
import type { PNItem } from '@/features/psychiatry/content/progressNotesLetters';
import type { HandoutItem } from '@/features/psychiatry/content/patientHandouts';
import type { ConsentItem } from '@/features/psychiatry/content/ethicsConsent';
import type { CamhsItem } from '@/features/psychiatry/content/camhsChildAdolescent';
import type { GroupItem } from '@/features/psychiatry/content/groupVisitsPrograms';
import type { CaseLetterItem } from '@/features/psychiatry/content/caseFormsLetters';
import type { NeuroItem } from '@/features/psychiatry/content/neuropsychMedicalLiaison';
import type { PsychometricItem } from '@/features/psychiatry/content/psychometrics';


export const LS_KEYS = { tab: 'psych.preview.tab', width: 'psych.preview.width', density: 'psych.preview.density', renderMode: 'psych.preview.renderMode' } as const;
export function loadLS<T>(k: string, fallback: T): T { try { const v = localStorage.getItem(k); return (v ? JSON.parse(v) : fallback) as T; } catch { return fallback; } }
export function saveLS<T>(k: string, v: T){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }


const ALLOWED_TAGS = new Set(['a','p','ul','ol','li','h1','h2','h3','h4','table','thead','tbody','tr','td','th','strong','em','code','pre','section','header','form','fieldset','legend','input','select','option','label','textarea','div','span','small','hr','style','button','main','nav','article','aside']);
const ALLOWED_ATTR = new Set(['href','colspan','rowspan','style','title','target','rel','type','name','value','required','placeholder','class','id','for','selected','checked','role','tabindex']);
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');

  doc.querySelectorAll('script, iframe, object, embed, link, meta, title, base').forEach(n => n.remove());
  const walker = (node: Element) => {
    if(!ALLOWED_TAGS.has(node.tagName.toLowerCase())){ node.replaceWith(...Array.from(node.childNodes)); return; }
    [...node.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();

      if(name.startsWith('on')) { node.removeAttribute(attr.name); return; }

  if(name.startsWith('aria-') || name.startsWith('data-')) {  }

      else if(!ALLOWED_ATTR.has(name)) node.removeAttribute(attr.name);
      else if(name === 'href') {
        const val = attr.value.trim();
        if(/^javascript:/i.test(val)) node.removeAttribute(attr.name);
      }
    });
    if (node.children) { Array.from(node.children).forEach(c => walker(c as Element)); }
  };
  Array.from(doc.body.children).forEach(c => walker(c));
  return doc.body.innerHTML || '';
}

export function extractPlainText(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, iframe, object, embed, link, meta, title, base, style').forEach(n => n.remove());
  const text = (doc.body.textContent || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

export function generatePageDoc(innerHtml: string){
  return `<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width,initial-scale=1' />
  <title>Preview</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin:0; font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Arial; background:linear-gradient(180deg,#6374d4,#7c55b8); min-height:100vh; padding:32px; box-sizing:border-box; }
    .page-shell { max-width:860px; margin:0 auto; }
    .card { background:#fff; color:#111; border-radius:8px; padding:24px 28px; box-shadow:0 6px 24px -8px rgba(0,0,0,.25),0 2px 6px -2px rgba(0,0,0,.12); }
    h1,h2,h3 { font-weight:600; line-height:1.2; margin:0 0 .6em; }
    p { margin:.5em 0; }
    table { width:100%; border-collapse:collapse; margin:1em 0; }
    th,td { border:1px solid #d0d0d0; padding:6px 8px; text-align:left; }
    code,pre { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace; font-size:13px; }
    pre { background:#111; color:#f5f5f5; padding:12px 14px; border-radius:6px; overflow:auto; }
    a { color:#215ad8; }
    @media (prefers-color-scheme: dark){
      body { background:linear-gradient(180deg,#2c3d82,#4b2e69); }
      .card { background:#16181d; color:#f2f2f2; }
      th,td { border-color:#333; }
      pre { background:#000; }
      a { color:#8ab4ff; }
    }
    @media print { body { background:#fff; padding:16px; } .card { box-shadow:none; border:1px solid #ccc; } }
  </style>
  </head><body><div class='page-shell'><div class='card' id='psy-content'>${innerHtml}</div></div></body></html>`;
}


export type RefLite = {
  title: string;
  year?: string | number;
  journal?: string;
  kind?: 'guideline' | 'validation' | 'overview' | 'implementation' | 'safety' | 'other';
  authors?: string[];
};
export type CmdLite = { text: string; intent?: string; safety?: string };
export type ExampleVariant = { id: string; label: string; html: string };
export type Assembled = { info: string; examples: ExampleVariant[]; defaultExampleId: string | null; references: RefLite[]; commands: CmdLite[] };


export type RightPanelPackCtx = { itemId?: string; cardId?: string; title?: string };
export type RightPanelPackResult = {
  infoCards: { title: string; body: string[] }[];
  exampleHtml: string;
  prompts: string[];
  references: string[];
};
export type RightPanelPackBuilder = (ctx: RightPanelPackCtx) => RightPanelPackResult;

const __packRegistry = new Map<string, RightPanelPackBuilder>();
export function registerRightPanelPack(key: string, builder: RightPanelPackBuilder){ __packRegistry.set(key, builder); }
export function getRightPanelPack(key: string): RightPanelPackBuilder | undefined { return __packRegistry.get(key); }


export type RPKey = { sectionId: string; leafId: string; subleafId: string; itemId?: string };

export type RPBundle = { infoCards: { title: string; body: string[] }[]; exampleHtml: string; prompts: string[]; references: string[] };

export type NormalizedBlock = {
  info: string;
  examples: Array<{ id: string; label: string; html: string }>;
  defaultExampleId: string;
  references: string[];
  commands: Array<{ text: string }>;
};


export function uniqByText(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr || []) {
    const k = (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!k) continue;
    if (!seen.has(k)) { seen.add(k); out.push((s || '').trim()); }
  }
  return out;
}
export function stripPlaceholders(htmlOrText: string): string {
  const s = (htmlOrText || '').replace(/\bitem\b/gi, '').replace(/\bplaceholder\b/gi, '');

  return s.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '').trim();
}


function normalizeInstrumentId(id: string): string {
  const raw = (id || '').toLowerCase().trim();
  const m: Record<string, string> = {
    'phq-9': 'phq9', 'gad-7': 'gad7', 'pcl-5': 'pcl5', 'audit-c': 'auditc', 'oci': 'oci-r', 'ocir': 'oci-r', 'sleep-diary-lite': 'daily-sleep-lite', 'sleep-lite': 'daily-sleep-lite',
  };
  return m[raw] || raw;
}


export function buildPsychBundleForKey(key: RPKey): RPBundle {
  const id = normalizeInstrumentId(key.itemId || '');
  const builder = getRightPanelPack('psychometrics');
  if (!builder) return { infoCards: [], exampleHtml: '', prompts: [], references: [] };
  const res = builder({ itemId: id });
  return {
    infoCards: res.infoCards || [],
    exampleHtml: res.exampleHtml || '',
    prompts: res.prompts || [],
    references: res.references || [],
  };
}

export function normalizeBundle(bundle: RPBundle): NormalizedBlock {
  const info = (bundle.infoCards || []).map(sec => `<section><h3>${sec.title}</h3><ul>${(sec.body||[]).map(x=>`<li>${stripPlaceholders(x)}</li>`).join('')}</ul></section>`).join('');

  const html = stripPlaceholders(bundle.exampleHtml || '');
  const examples = html ? [{ id: 'interactive', label: 'Interactive Page', html }] : [];
  const defaultExampleId = 'interactive';
  const GENERAL = [
    'Ensure accessibility: label inputs, proper roles, keyboard navigation, and print CSS.',
    'Provide JSON/CSV export including instrument id, window, responses, and timestamp.'
  ];
  const prompts = uniqByText([ ...(bundle.prompts || []), ...GENERAL ]);
  const references = uniqByText(bundle.references || []);
  const block: NormalizedBlock = { info, examples, defaultExampleId, references, commands: prompts.map(text => ({ text })) };
  try {
    if (localStorage.getItem('psych.debug.section8') === 'on') {
      const stats = { prompts: prompts.length, references: references.length, hasExample: !!html };

      console.debug('[Section8] normalized', stats);
    }
  } catch {}
  return block;
}


const likertPage = (spec: { title: string; window: string; choices: string[]; items: string[]; band: (vals: number[]) => string; footer?: string }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${spec.title}</title>
<style>
body{font-family:system-ui,Segoe UI,Arial;margin:24px;line-height:1.4}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px;background:#0f172a; color:#e5e7eb}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border:1px solid #334155;padding:8px;text-align:left}
.badge{padding:2px 8px;border-radius:999px;border:1px solid #334155}
.actions{margin-top:12px}
@media print {.actions{display:none}}
</style></head><body>
<h1>${spec.title}</h1>
<p>Time window: <b>${spec.window}</b></p>
<div class="card">
<table class="table"><thead><tr><th>Item</th>${spec.choices.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
<tbody id="rows">__ITEM_ROWS__</tbody></table>
<p><b>Total:</b> <span id="sum">0</span> · <span class="badge" id="band">—</span></p>
<div class="actions"><button onclick="save('json')">Download JSON</button> <button onclick="window.print()">Print</button></div>
${spec.footer?`<p style="opacity:.8;margin-top:8px">${spec.footer}</p>`:""}
</div>
<script>
const ITEMS=[];
const state=Array(ITEMS.length).fill(0);
function mount(){
  const tbody=document.getElementById('rows'); tbody.innerHTML='';
  ITEMS.forEach((q,i)=>{
    var tr=document.createElement('tr');
    var cells=[0,1,2,3,4].slice(0, SPEC_CHOICES_LEN).map(function(v){ return '<td><input type="radio" name="q'+i+'" value="'+v+'" onchange="setV('+i+','+v+')"></td>'; }).join('');
    tr.innerHTML='<td>'+(i+1)+'. '+q+'</td>' + cells;
    tbody.appendChild(tr);
  });
  update();
}
function setV(i,v){ state[i]=Number(v); update(); }
function update(){
  const s=state.reduce((a,b)=>a+b,0);
  document.getElementById('sum').textContent=s;
  document.getElementById('band').textContent=window.BAND(state);
}
function save(kind){
  const payload={ instrument: '${spec.title}', window: '${spec.window}', responses: state, total: state.reduce((a,b)=>a+b,0), ts:new Date().toISOString() };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='${spec.title.replace(/\s+/g,'_').toLowerCase()}.json'; a.click();
}
window.BAND=(vals)=>(${spec.band.toString()})(vals);
window.onload=()=>{ mount(); };
</script></body></html>`;

const yesNoPage = (spec: { title: string; window: string; items: string[]; bands: (sum: number) => string }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${spec.title}</title>
<style>body{font-family:system-ui;margin:24px} .q{margin:10px 0} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}</style></head><body>
<h1>${spec.title}</h1><p>Time window: <b>${spec.window}</b></p>
<div class="card" id="root">__YN_ROWS__<p id="out"></p></div>
<script>
const ITEMS=${JSON.stringify([])}; const state=Array(ITEMS.length).fill(0);
function render(){
  const r=document.getElementById('root'); if(!r) return; r.innerHTML='';
  ITEMS.forEach((q,i)=>{ const d=document.createElement('div'); d.className='q'; d.innerHTML='<b>'+(i+1)+'.</b> '+q+'<br><label><input type="radio" name="q'+i+'" value="0" checked> No</label> <label><input type="radio" name="q'+i+'" value="1"> Yes</label>'; r.appendChild(d); });
  const btn=document.createElement('button'); btn.textContent='Compute'; btn.onclick=compute; r.appendChild(btn);
  const p=document.createElement('p'); p.id='out'; r.appendChild(p);
}
function compute(){
  for(let i=0;i<ITEMS.length;i++){ const el=[...document.getElementsByName('q'+i)].find(e=>e.checked); state[i]=Number(el && (el as HTMLInputElement).value || 0); }
  const s=state.reduce((a,b)=>a+b,0); const out=document.getElementById('out'); if(out) out.textContent='Total: '+s+' · '+(${spec.bands.toString()})(s);
}
render();
</script></body></html>`;

type LikertSpec = { title: string; window: string; choices: string[]; items: string[]; band: (vals: number[]) => string; footer?: string };


const SPECS: Record<string, LikertSpec | { html: string }> = {

  phq9: {
    title: 'PHQ-9 — Depression Severity',
    window: 'Past 14 days',
    choices: ['0 Not at all','1 Several days','2 More than half the days','3 Nearly every day'],
    items: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading or watching television',
      'Moving or speaking noticeably slowly; or being fidgety/restless',
      'Thoughts that you would be better off dead or of hurting yourself'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=20?'Severe':s>=15?'Moderately severe':s>=10?'Moderate':s>=5?'Mild':'None/minimal'; },
    footer: '© Pfizer — Free to use with citation.'
  },
  gad7: {
    title: 'GAD-7 — Anxiety Severity',
    window: 'Past 14 days',
    choices: ['0 Not at all','1 Several days','2 More than half the days','3 Nearly every day'],
    items: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=15?'Severe':s>=10?'Moderate':s>=5?'Mild':'Minimal'; },
    footer: '© Pfizer — Free to use with citation.'
  },
  isi: {
    title: 'ISI — Insomnia Severity Index',
    window: 'Past 2 weeks',
    choices: ['0 None','1 Mild','2 Moderate','3 Severe','4 Very severe'],
    items: [
      'Difficulty falling asleep (initial insomnia)',
      'Difficulty staying asleep (middle insomnia)',
      'Problems waking too early (terminal insomnia)',
      'Satisfaction with current sleep pattern',
      'Interference of sleep problem with daily functioning',
      'Noticeability of sleep problem by others',
      'Worry/distress about the current sleep problem'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=22?'Severe':s>=15?'Moderate':s>=8?'Subthreshold':'No clinically significant insomnia'; }
  },

  pcl5: {
    title: 'PCL-5 — PTSD Symptom Severity',
    window: 'Past month',
    choices: ['0 Not at all','1 A little bit','2 Moderately','3 Quite a bit','4 Extremely'],
    items: [
      'Repeated, disturbing memories of the stressful experience',
      'Repeated, disturbing dreams of the stressful experience',
      'Suddenly feeling or acting as if the stressful experience were happening again',
      'Feeling very upset when reminded of the stressful experience',
      'Having strong physical reactions when reminded of the stressful experience',
      'Avoiding memories, thoughts, or feelings related to the stressful experience',
      'Avoiding external reminders (people, places, conversations, objects, situations)',
      'Trouble remembering important parts of the stressful experience',
      'Having strong negative beliefs about yourself, other people, or the world',
      'Blaming yourself or someone else for the stressful experience or its effects',
      'Having strong negative feelings such as fear, horror, anger, guilt, or shame',
      'Loss of interest in activities you used to enjoy',
      'Feeling distant or cut off from other people',
      'Trouble experiencing positive feelings (e.g., happiness or loving feelings)',
      'Irritable behavior, angry outbursts, or acting aggressively',
      'Taking too many risks or doing things that could cause you harm',
      'Being ‘superalert’ or watchful or on guard',
      'Feeling jumpy or easily startled',
      'Having difficulty concentrating',
      'Trouble falling or staying asleep'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=33?'≥33 probable PTSD (program dependent)':s>=31?'31–32 threshold in some programs':'Below common thresholds'; },
    footer: 'US GOV (VA) — Public domain.'
  },
  k10: {
    title: 'K10 — Psychological Distress',
    window: 'Past 4 weeks',
    choices: ['1 None of the time','2 A little','3 Some','4 Most','5 All of the time'],
    items: [
      'Tired out for no good reason','Nervous','So nervous that nothing could calm you down','Hopeless','Restless or fidgety','So restless you could not sit still','Depressed','Everything was an effort','So sad that nothing could cheer you up','Worthless'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=30?'Very high':s>=22?'High':s>=16?'Moderate':'Low'; }
  },
  phq15: {
    title: 'PHQ-15 — Somatic Symptom Severity',
    window: 'Past 4 weeks',
    choices: ['0 Not bothered','1 Bothered a little','2 Bothered a lot'],
    items: [
      'Stomach pain','Back pain','Pain in arms, legs, or joints','Menstrual cramps or other problems with your periods (if applicable)','Headaches','Chest pain','Dizziness','Fainting spells','Feeling your heart pound or race','Shortness of breath','Constipation, loose bowels, or diarrhea','Nausea, gas, or indigestion','Feeling tired or having low energy','Trouble sleeping','Sexual problems'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=15?'High':s>=10?'Medium':'Low'; },
    footer: '© Pfizer — Free to use with citation.'
  },
  'oci-r': {
    title: 'OCI-R — Obsessive-Compulsive Inventory (Revised)',
    window: 'Past month',
    choices: ['0 Not at all','1 A little','2 Moderately','3 A lot','4 Extremely'],
    items: [
      'I have saved up so many things that they get in the way','I check things more often than necessary','I get upset if objects are not arranged properly','I feel compelled to count while I am doing things','I find it difficult to control my own thoughts','I collect things I don’t need','I repeatedly check doors, windows, drawers, etc.','I get upset if others change the way I have arranged things','I feel I have to repeat certain numbers','I frequently get nasty thoughts and have difficulty in getting rid of them','I avoid throwing things away because I am afraid I might need them later','I repeatedly check gas/water taps and light switches after turning them off','I need things to be arranged in a particular order','I feel that there are good and bad numbers','I frequently get disturbing thoughts that I can’t get rid of','I avoid throwing away things that I might need','I need things to be arranged symmetrically','I have thoughts that I might harm myself or others'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=36?'Elevated':'—'; }
  },

  oasis: {
    title: 'OASIS — Overall Anxiety Severity and Impairment',
    window: 'Past 7 days',
    choices: ['0 None','1 Mild','2 Moderate','3 Severe','4 Extreme'],
    items: [
      'How often have you felt anxious?','How intense is your anxiety when present?','How much does anxiety interfere with your ability at work/school/home?','How much does it interfere with your social life/relationships?','How difficult is it to do what you needed to because of anxiety?'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=8?'≥8 suggests clinically significant anxiety':'—'; }
  },
  spin: {
    title: 'SPIN — Social Phobia Inventory',
    window: 'Past week',
    choices: ['0 Not at all','1 A little bit','2 Somewhat','3 Very much','4 Extremely'],
    items: [
      'I am afraid of people in authority','I am bothered by blushing in front of people','Parties and social events scare me','I avoid talking to people I don’t know','Being criticized scares me a lot','Fear of embarrassment causes me to avoid doing things','Sweating in front of people causes me distress','I avoid doing things or speaking to people for fear of embarrassment','I avoid going to parties','I avoid activities where I am the center of attention','Talking to strangers scares me','I avoid having to give speeches','I would do anything to avoid being criticized','Heart palpitations bother me when I am around people','I am afraid of doing things when people might be watching','Being embarrassed or looking stupid are among my worst fears','I avoid speaking to anyone in authority'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=19?'≥19 suggests social anxiety':'—'; }
  },
  'pdss-sr': {
    title: 'PDSS-SR — Panic Disorder Severity Scale (Self-Report)',
    window: 'Past 7 days',
    choices: ['0 None','1 Mild','2 Moderate','3 Severe','4 Extreme'],
    items: [
      'Frequency of panic attacks','Distress during panic attacks','Anticipatory anxiety between attacks','Agoraphobic fear/avoidance','Interoceptive fear/avoidance (bodily sensations)','Impairment in work/school/home responsibilities','Impairment in social functioning'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=8?'≥8 often used as clinical threshold':'—'; }
  },
  asrm: {
    title: 'ASRM — Altman Self-Rating Mania',
    window: 'Past 7 days',
    choices: ['0','1','2','3','4'],
    items: [
      'I feel happier or more cheerful than usual','I feel more self-confident than usual','I need less sleep than usual','I am more talkative than usual','I have more energy and/or more active than usual'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=6?'≥6 suggests hypomania/mania':'—'; }
  },
  epds: {
    title: 'EPDS — Edinburgh Postnatal Depression Scale',
    window: 'Past 7 days',
    choices: ['0','1','2','3'],
    items: [
      'I have been able to laugh and see the funny side of things','I have looked forward with enjoyment to things','I have blamed myself unnecessarily when things went wrong','I have been anxious or worried for no good reason','I have felt scared or panicky for no very good reason','Things have been getting on top of me','I have been so unhappy that I have had difficulty sleeping','I have felt sad or miserable','I have been so unhappy that I have been crying','The thought of harming myself has occurred to me'
    ],
    band: (v)=>{ const s=v.reduce((a,b)=>a+b,0); return s>=13?'≥13 suggests major depression; follow local protocol':'—'; }
  },

  hamd:   { html: '<div class="card"><h2>HAM-D worksheet</h2><p>17 items with 0–2/0–4 ranges; use official anchors. Record totals + notes.</p></div>' },
  madrs:  { html: '<div class="card"><h2>MADRS worksheet</h2><p>10 items with 0–6 anchors; use official wording where licensed.</p></div>' },
  ymrs:   { html: '<div class="card"><h2>YMRS worksheet</h2><p>11 items (weighted). Capture ratings and notes; auto-sum.</p></div>' },
  panss:  { html: '<div class="card"><h2>PANSS worksheet</h2><p>Positive, Negative, General subscales (1–7). Record per-item ratings.</p></div>' },
  bprs:   { html: '<div class="card"><h2>BPRS worksheet</h2><p>18 items (1–7). Record ratings and clinical notes.</p></div>' },
  'y-BOCS': { html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Y-BOCS Worksheet</title>
<style>body{font-family:system-ui;margin:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px} select{min-width:64px}</style></head><body>
<h1>Y-BOCS — Severity Worksheet</h1>
<div class="card">
<p>Rate 0–4 for each domain (generic labels; use official anchors where licensed).</p>
<table><thead><tr><th colspan="2">Obsessions</th></tr></thead>
<tbody>
${['Time Occupied','Interference','Distress','Resistance','Control'].map((lab,i)=>`<tr><td>${i+1}. ${lab}</td><td><select name="o${i}">${[0,1,2,3,4].map(v=>`<option value="${v}">${v}</option>`).join('')}</select></td></tr>`).join('')}
</tbody></table>
<table style="margin-top:10px"><thead><tr><th colspan="2">Compulsions</th></tr></thead>
<tbody>
${['Time Spent','Interference','Distress','Resistance','Control'].map((lab,i)=>`<tr><td>${i+1}. ${lab}</td><td><select name="c${i}">${[0,1,2,3,4].map(v=>`<option value="${v}">${v}</option>`).join('')}</select></td></tr>`).join('')}
</tbody></table>
<button id="btn">Compute</button> <span id="out"></span>
</div>
<script>document.getElementById('btn').onclick=function(){var s=0;for(var i=0;i<5;i++){s+=Number((document.getElementsByName('o'+i)[0]).value)||0;s+=Number((document.getElementsByName('c'+i)[0]).value)||0;}document.getElementById('out').textContent='Total: '+s+' (0–40)';};</script>
</body></html>` },
  psqi:   { html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PSQI Components</title>
<style>body{font-family:system-ui;margin:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}</style></head><body>
<h1>PSQI — Monthly Components (0–3)</h1>
<div class="card">
<table><thead><tr><th>Component</th><th>Score</th></tr></thead><tbody>
${['Subjective Sleep Quality','Sleep Latency','Sleep Duration','Habitual Sleep Efficiency','Sleep Disturbances','Use of Sleep Medication','Daytime Dysfunction'].map((lab,i)=>`<tr><td>${lab}</td><td><select name="p${i}">${[0,1,2,3].map(v=>`<option value="${v}">${v}</option>`).join('')}</select></td></tr>`).join('')}
</tbody></table>
<button id="btn">Compute</button> <span id="out"></span>
<p style="opacity:.8">Use official PSQI form for item wording; this is a component worksheet.</p>
</div>
<script>document.getElementById('btn').onclick=function(){var s=0;for(var i=0;i<7;i++){s+=Number((document.getElementsByName('p'+i)[0]).value)||0;}document.getElementById('out').textContent='Global: '+s+' (0–21)';};</script>
</body></html>` },
  'ede-q':{ html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EDE-Q Worksheet</title>
<style>body{font-family:system-ui;margin:24px} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left}</style></head><body>
<h1>EDE-Q — Subscale Worksheet</h1>
<div class="card">
<p>Record subscale totals (0–6 anchors on official items). This worksheet is non-proprietary.</p>
<table><thead><tr><th>Subscale</th><th>Total</th></tr></thead><tbody>
${['Restraint','Eating Concern','Shape Concern','Weight Concern'].map((lab,i)=>`<tr><td>${lab}</td><td><input type="number" min="0" step="0.1" name="e${i}"/></td></tr>`).join('')}
</tbody></table>
<button id="btn">Compute</button> <span id="out"></span>
</div>
<script>document.getElementById('btn').onclick=function(){var s=0;for(var i=0;i<4;i++){s+=Number((document.getElementsByName('e'+i)[0]).value)||0;}document.getElementById('out').textContent='Global (mean of subscales): '+(s/4).toFixed(2);};</script>
</body></html>` },
  ghq12:  { html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GHQ-12 Worksheet</title>
<style>body{font-family:system-ui;margin:24px} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px} .q{margin:8px 0}</style></head><body>
<h1>GHQ-12 — Worksheet (Generic Items)</h1>
<div class="card">
<label>Scoring<select id="mode"><option value="ghq">GHQ (0-0-1-1)</option><option value="likert">Likert (0–3)</option></select></label>
<div id="root">${Array.from({length:12}).map((_,i)=>`<div class="q"><b>${i+1}.</b> Item ${i+1} <br>${['Better than usual','Same as usual','Less than usual','Much less than usual'].map((txt,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${txt}</label>`).join(' ')}</div>`).join('')}</div>
<button id="btn">Compute</button> <span id="out"></span>
<p style="opacity:.8">Use official wording where licensed; this is a scoring skeleton.</p>
</div>
<script>document.getElementById('btn').onclick=function(){var mode=(document.getElementById('mode')).value;var s=0;for(var i=0;i<12;i++){var el=Array.from(document.getElementsByName('q'+i)).find(function(e){return e.checked;});var v=el?Number(el.value):0;s+= (mode==='ghq'? (v<2?0:1) : v); }document.getElementById('out').textContent=(mode==='ghq'?'GHQ':'Likert')+' total: '+s;};</script>
</body></html>` },

  ybocs:  { html: '<div class="card"><h2>Y-BOCS worksheet</h2><p>Severity across obsessions and compulsions (0–4); do not include licensed anchors.</p></div>' },
  qids:   { html: '<div class="card"><h2>QIDS (SR/CR) worksheet</h2><p>16 items; capture domain totals and global score; use official anchors.</p></div>' },
  fibser: { html: '<div class="card"><h2>FIBSER — side-effect burden</h2><p>5 items; functional interference and burden; use validated form.</p></div>' },
  ess:    { html: '<div class="card"><h2>Epworth Sleepiness Scale (ESS) worksheet</h2><p>8 items; use licensed form; autosum total.</p></div>' },
  asrs:   { html: '<div class="card"><h2>ASRS v1.1 (Part A) worksheet</h2><p>6 items screening with decision rule ≥4 at 2–4; use official wording.</p></div>' },
  vanderbilt: { html: '<div class="card"><h2>Vanderbilt (Parent/Teacher) worksheet</h2><p>Symptoms and performance sections; use official forms.</p></div>' },
  'snap-iv': { html: '<div class="card"><h2>SNAP-IV worksheet</h2><p>ADHD/ODD symptoms; use licensed items.</p></div>' },
  assist: { html: '<div class="card"><h2>WHO ASSIST worksheet</h2><p>Substance involvement by domain; structured scoring; use WHO form.</p></div>' },
  'c-ssrs': { html: '<div class="card"><h2>C-SSRS — Screening</h2><p>Suicidal ideation/behavior screening; follow institutional policy and official instrument.</p></div>' },

  drsp: { html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DRSP Diary (Template)</title>
<style>body{font-family:system-ui;margin:24px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left} .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px} input[type=number]{width:64px}</style></head><body>
<h1>DRSP — Daily Diary (Template)</h1>
<div class="card">
<p>Rate 1–6 for each day and domain (educational layout; adapt to validated local instruments).</p>
<table aria-label="DRSP diary grid"><thead><tr><th>Day</th><th>Mood</th><th>Irritability</th><th>Interest</th><th>Energy</th><th>Sleep</th><th>Physical</th><th>Impairment</th></tr></thead><tbody>
${Array.from({length:14}).map((_,i)=>`<tr><td>${i+1}</td>${Array.from({length:7}).map((__,j)=>`<td><input type="number" min="1" max="6" name="d${i}-${j}"/></td>`).join('')}</tr>`).join('')}
</tbody></table>
<p style="opacity:.8">Print and complete daily; compute cycle summaries per program policy.</p>
</div>
</body></html>` },
  csd:  { html: '<div class="card"><h2>Consensus Sleep Diary</h2><p>Capture bedtime, SOL, awakenings (#/dur), WASO, rise time, sleep quality, caffeine/alcohol, meds; CSV export.</p></div>' },
  lcm:  { html: '<div class="card"><h2>NIMH Life-Chart Method (patient)</h2><p>Daily −4…+4 mood, meds, significant events; CSV export.</p></div>' },
  'dbt-diary': { html: '<div class="card"><h2>DBT Diary Card</h2><p>Skills practiced, urges, behaviors; printable grid. Use local templates if licensed.</p></div>' },
  'daily-mood': { html: '<div class="card"><h2>Daily Mood Diary</h2><p>Single day −4…+4, notes, triggers; CSV export.</p></div>' },
  'daily-sleep-lite': { html: '<div class="card"><h2>Sleep Diary — Lite</h2><p>Bedtime, wake time, total sleep time, naps, substances; CSV export.</p></div>' },
};

function htmlFor(itemId: string): string {
  const id = (itemId || '').toLowerCase().replace(/[^a-z0-9-]+/g,'');
  if (id === 'audit') {

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AUDIT — Scientific Example</title>
<style>
  :root{color-scheme:light dark}
  body{font-family:system-ui,Segoe UI,Arial;margin:24px;line-height:1.45}
  h1,h2,h3{margin:0 0 .5rem;font-weight:700}
  .muted{opacity:.8}
  .grid{display:grid;gap:12px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
  table{width:100%;border-collapse:collapse;margin:.5rem 0}
  th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;border:1px solid #9ca3af;font-size:12px}
  .ok{background:#ecfdf5;border-color:#10b981;color:#065f46}
  .warn{background:#fff7ed;border-color:#f59e0b;color:#92400e}
  .risk{background:#fef2f2;border-color:#ef4444;color:#7f1d1d}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .actions button{padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;cursor:pointer}
  .actions button:hover{background:#f3f4f6}
  .nowrap{white-space:nowrap}
  @media print{.actions{display:none} .card{border-color:#c7c7c7} .badge{border-color:#888}}
</style></head><body>
<main class="grid" aria-labelledby="title">
  <section class="card">
    <h1 id="title">AUDIT — Alcohol Use Disorders Identification Test</h1>
    <p class="muted">Past 12 months • 10 items (0–4) • Total 0–40</p>
    <div class="actions" role="group" aria-label="Page actions">
      <button type="button" id="btn-print">Print</button>
      <button type="button" id="btn-json">Download JSON</button>
    </div>
  </section>

  <section class="card" aria-labelledby="hdr-items">
    <h2 id="hdr-items">Items and Responses</h2>
    <table aria-describedby="scoring-note">
      <thead><tr><th style="width:40%">Item</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
    <p id="scoring-note" class="muted">Items 1–8 scored 0–4; Items 9–10 scored 0,2,4 (no/yes-not last year/yes last year).</p>
  </section>

  <section class="card" aria-labelledby="hdr-computed">
    <h2 id="hdr-computed">Computed</h2>
    <p><b>Total:</b> <span id="total" class="nowrap">0</span> • <b>Risk:</b> <span id="band" class="badge">—</span></p>
    <ul id="flags" class="muted"></ul>
    <div id="live" class="muted" aria-live="polite"></div>
  </section>

  <section class="card" aria-labelledby="hdr-methods">
    <h2 id="hdr-methods">Methods</h2>
    <ul>
      <li>Scoring: sum of item scores (0–40).</li>
      <li>Program-typical risk bands: 0–7 Low risk; 8–15 Hazardous; 16–19 Harmful; 20–40 Possible dependence. Verify local policy.</li>
      <li>Items 9–10 capture alcohol-related harm and advice to cut down; each scored 0,2,4.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-psych">
    <h2 id="hdr-psych">Psychometrics (high-level)</h2>
    <ul>
      <li>Internal consistency: Cronbach’s α typically ≥0.80 in primary care samples.</li>
      <li>Construct validity: correlates with consumption and dependence indices.</li>
      <li>Screening accuracy varies by threshold and setting; confirm institutional cutoffs.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-alg">
    <h2 id="hdr-alg">Algorithm (pseudocode)</h2>
    <pre><code>function auditScore(items) {

  const total = items.reduce((a,b) => a + (Number(b)||0), 0);
  let band = 'Low risk (0–7)';
  if (total >= 20) band = 'Possible dependence (20–40)';
  else if (total >= 16) band = 'Harmful (16–19)';
  else if (total >= 8) band = 'Hazardous (8–15)';
  return { total, band };
}</code></pre>
  </section>

  <section class="card" aria-labelledby="hdr-dd">
    <h2 id="hdr-dd">Data Dictionary</h2>
    <table><thead><tr><th>Field</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>instrument</td><td>"AUDIT"</td></tr>
        <tr><td>window</td><td>Past 12 months</td></tr>
        <tr><td>responses</td><td>Array[10] of item scores</td></tr>
        <tr><td>total</td><td>Sum of responses</td></tr>
        <tr><td>riskBand</td><td>Low/Hazardous/Harmful/Possible dependence</td></tr>
        <tr><td>ts</td><td>ISO timestamp</td></tr>
      </tbody>
    </table>
  </section>

  <section class="card" aria-labelledby="hdr-notes">
    <h2 id="hdr-notes">Clinical Notes</h2>
    <ul>
      <li>Use positive screens to discuss brief intervention, safety, and referral options.</li>
      <li>Interpret with context (comorbidity, medications, liver disease, pregnancy).</li>
      <li>Document advice given, readiness to change, and follow-up plan.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-refs">
    <h2 id="hdr-refs">References</h2>
    <ol class="muted">
      <li>Saunders JB, Aasland OG, Babor TF, de la Fuente JR, Grant M. Development of the AUDIT. Addiction. 1993.</li>
      <li>Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT Manual. WHO; 2001.</li>
    </ol>
  </section>
</main>

<script>
const ITEMS = [
  { q: 'How often did you have a drink containing alcohol?', opts: ['Never','Monthly or less','2–4 times a month','2–3 times a week','4+ times a week'], vals: [0,1,2,3,4] },
  { q: 'How many drinks on a typical day when you were drinking?', opts: ['1–2','3–4','5–6','7–9','10 or more'], vals: [0,1,2,3,4] },
  { q: 'How often did you have six or more drinks on one occasion?', opts: ['Never','Less than monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Unable to stop drinking once started?', opts: ['Never','< monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Failed expectations due to drinking?', opts: ['Never','< monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Needed a first drink in the morning?', opts: ['Never','< monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Guilt or remorse after drinking?', opts: ['Never','< monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Blackouts (unable to remember the night before)?', opts: ['Never','< monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] },
  { q: 'Injury to you/others from drinking?', opts: ['No','Yes, not in the last year','Yes during the last year'], vals: [0,2,4] },
  { q: 'Has anyone suggested you cut down?', opts: ['No','Yes, not in the last year','Yes during the last year'], vals: [0,2,4] }
];
const state = Array(ITEMS.length).fill(0);
const rows = document.getElementById('rows');
function render(){
  rows.innerHTML='';
  ITEMS.forEach((it,i)=>{
    const tr=document.createElement('tr');
    const cells = it.vals.map((v,j)=>'<td><label><input type="radio" name="q'+i+'" value="'+v+'"> '+it.opts[j]+'</label></td>').join('');
    tr.innerHTML = '<td>'+(i+1)+'. '+it.q+'</td>' + cells;
    rows.appendChild(tr);
  });
  document.querySelectorAll('input[type=radio]').forEach(el=>{
    el.addEventListener('change', sync);
  });
}
function classify(total){
  if (total >= 20) return ['Possible dependence (20–40)','risk'];
  if (total >= 16) return ['Harmful (16–19)','warn'];
  if (total >= 8) return ['Hazardous (8–15)','warn'];
  return ['Low risk (0–7)','ok'];
}
function sync(){
  for(let i=0;i<ITEMS.length;i++){
    const el = Array.from(document.getElementsByName('q'+i)).find(e=>e.checked);
    state[i] = el ? Number(el.value) : 0;
  }
  const total = state.reduce((a,b)=>a+b,0);
  const bandEl = document.getElementById('band');
  const totalEl = document.getElementById('total');
  const [band, cls] = classify(total);
  bandEl.textContent = band; bandEl.className = 'badge ' + cls;
  totalEl.textContent = String(total);

  const flags = [];
  if (total >= 8) flags.push('Positive screen — consider brief intervention.');
  if (state[8] >= 2) flags.push('Injury related to drinking reported.');
  if (state[9] >= 2) flags.push('Advice to cut down reported.');
  document.getElementById('flags').innerHTML = flags.map(function(f){ return '<li>'+f+'</li>'; }).join('');
  document.getElementById('live').textContent = 'Updated: total ' + total + ', risk ' + band + '.';
}
function downloadJson(){
  const payload = { instrument:'AUDIT', window:'Past 12 months', responses: state, total: state.reduce((a,b)=>a+b,0), riskBand: document.getElementById('band').textContent, ts: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit.json'; a.click();
}
document.getElementById('btn-print').addEventListener('click', ()=>window.print());
document.getElementById('btn-json').addEventListener('click', downloadJson);
render();
</script></body></html>`;
  }
  if (id === 'auditc') {

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AUDIT-C — Scientific Example</title>
<style>
  :root{color-scheme:light dark}
  body{font-family:system-ui,Segoe UI,Arial;margin:24px;line-height:1.45}
  h1,h2,h3{margin:0 0 .5rem;font-weight:700}
  .muted{opacity:.8}
  .grid{display:grid;gap:12px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
  table{width:100%;border-collapse:collapse;margin:.5rem 0}
  th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;border:1px solid #9ca3af;font-size:12px}
  .ok{background:#ecfdf5;border-color:#10b981;color:#065f46}
  .warn{background:#fff7ed;border-color:#f59e0b;color:#92400e}
  .risk{background:#fef2f2;border-color:#ef4444;color:#7f1d1d}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .actions button{padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;cursor:pointer}
  .actions button:hover{background:#f3f4f6}
  .nowrap{white-space:nowrap}
  @media print{.actions{display:none} .card{border-color:#c7c7c7} .badge{border-color:#888}}
</style></head><body>
<main class="grid" aria-labelledby="title">
  <section class="card">
    <h1 id="title">AUDIT-C — Alcohol Use (3 items)</h1>
    <p class="muted">Past 12 months • 3 items (0–4) • Total 0–12 • Sex-specific thresholds</p>
    <div class="actions" role="group" aria-label="Page actions">
      <button type="button" id="btn-print">Print</button>
      <button type="button" id="btn-json">Download JSON</button>
    </div>
  </section>

  <section class="card" aria-labelledby="hdr-items">
    <h2 id="hdr-items">Items and Responses</h2>
    <table aria-describedby="scoring-note">
      <thead><tr><th style="width:44%">Item</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
    <div id="scoring-note" class="muted">Score each item 0–4 from left to right.</div>
    <div style="margin-top:8px">
      <label for="sexSel"><b>Patient sex (for cutoffs):</b></label>
      <select id="sexSel" aria-label="Patient sex">
        <option value="U">Unspecified</option>
        <option value="F">Female</option>
        <option value="M">Male</option>
      </select>
    </div>
  </section>

  <section class="card" aria-labelledby="hdr-computed">
    <h2 id="hdr-computed">Computed</h2>
    <p><b>Total:</b> <span id="total" class="nowrap">0</span> • <b>Screen:</b> <span id="band" class="badge">—</span></p>
    <ul id="flags" class="muted"></ul>
    <div id="live" class="muted" aria-live="polite"></div>
  </section>

  <section class="card" aria-labelledby="hdr-methods">
    <h2 id="hdr-methods">Methods</h2>
    <ul>
      <li>Scoring: sum of item scores (0–12).</li>
      <li>Common cutoffs: ≥3 suggests a positive screen in women; ≥4 in men. Programs may vary; follow local policy.</li>
      <li>Use positive screens to discuss brief intervention and, if indicated, follow with full AUDIT.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-psych">
    <h2 id="hdr-psych">Psychometrics (high-level)</h2>
    <ul>
      <li>Good sensitivity/specificity for risky drinking in primary care.</li>
      <li>Tracks response to counseling or pharmacotherapy over time.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-alg">
    <h2 id="hdr-alg">Algorithm (pseudocode)</h2>
    <pre><code>function auditCScore(items, sex ) {
  const total = items.reduce((a,b) => a + (Number(b)||0), 0);
  const cutoff = sex==='F' ? 3 : sex==='M' ? 4 : 3;
  const positive = total >= cutoff;
  return { total, cutoff, positive };
}</code></pre>
  </section>

  <section class="card" aria-labelledby="hdr-dd">
    <h2 id="hdr-dd">Data Dictionary</h2>
    <table><thead><tr><th>Field</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>instrument</td><td>"AUDIT-C"</td></tr>
        <tr><td>window</td><td>Past 12 months</td></tr>
        <tr><td>responses</td><td>Array[3] of item scores</td></tr>
        <tr><td>total</td><td>Sum 0–12</td></tr>
        <tr><td>cutoff</td><td>Sex-specific threshold (e.g., 3 for women, 4 for men)</td></tr>
        <tr><td>positive</td><td>Boolean — screen result</td></tr>
        <tr><td>sex</td><td>'F' | 'M' | 'U'</td></tr>
        <tr><td>ts</td><td>ISO timestamp</td></tr>
      </tbody>
    </table>
  </section>

  <section class="card" aria-labelledby="hdr-notes">
    <h2 id="hdr-notes">Clinical Notes</h2>
    <ul>
      <li>Confirm time frame (past 12 months) and provide brief counseling for positive screens.</li>
      <li>Consider full AUDIT, safety, and referral options as needed.</li>
      <li>Document advice given, readiness to change, and follow-up plan.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-refs">
    <h2 id="hdr-refs">References</h2>
    <ol class="muted">
      <li>Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The AUDIT-C. Arch Intern Med. 1998.</li>
      <li>WHO. AUDIT resources and guidance. 2001+.</li>
    </ol>
  </section>
</main>

<script>
const ITEMS = [
  { q: 'How often did you have a drink containing alcohol?', opts: ['Never','Monthly or less','2–4 times a month','2–3 times a week','4+ times a week'], vals: [0,1,2,3,4] },
  { q: 'How many drinks on a typical day when you were drinking?', opts: ['1–2','3–4','5–6','7–9','10 or more'], vals: [0,1,2,3,4] },
  { q: 'How often did you have six or more drinks on one occasion?', opts: ['Never','Less than monthly','Monthly','Weekly','Daily or almost daily'], vals: [0,1,2,3,4] }
];
const state = Array(ITEMS.length).fill(0);
const rows = document.getElementById('rows');
const sexSel = document.getElementById('sexSel');
function render(){
  rows.innerHTML='';
  ITEMS.forEach(function(it,i){
    var tr=document.createElement('tr');
    var cells = it.vals.map(function(v,j){ return '<td><label><input type="radio" name="q'+i+'" value="'+v+'"> '+it.opts[j]+'</label></td>'; }).join('');
    tr.innerHTML = '<td>'+(i+1)+'. '+it.q+'</td>' + cells;
    rows.appendChild(tr);
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[type=radio]'), function(el){ el.addEventListener('change', sync); });
  sexSel.addEventListener('change', sync);
}
function compute(total, sex){
  var cutoff = sex==='F' ? 3 : sex==='M' ? 4 : 3;
  var positive = total >= cutoff;
  var bandEl = document.getElementById('band');
  bandEl.textContent = positive ? ('Positive (≥'+cutoff+')') : 'Negative';
  bandEl.className = 'badge ' + (positive ? 'warn' : 'ok');
  return { cutoff: cutoff, positive: positive };
}
function sync(){
  for(var i=0;i<ITEMS.length;i++){
    var el = Array.prototype.find.call(document.getElementsByName('q'+i), function(e){ return e.checked; });
    state[i] = el ? Number(el.value) : 0;
  }
  var total = state.reduce(function(a,b){ return a+b; }, 0);
  var totalEl = document.getElementById('total');
  totalEl.textContent = String(total);
  var sex = sexSel.value;
  var res = compute(total, sex);
  var flags = [];
  if(res.positive){ flags.push('Consider brief intervention and follow-up.'); }
  document.getElementById('flags').innerHTML = flags.map(function(f){ return '<li>'+f+'</li>'; }).join('');
  document.getElementById('live').textContent = 'Updated: total ' + total + ', screen ' + document.getElementById('band').textContent + '.';
}
function downloadJson(){
  var payload = { instrument:'AUDIT-C', window:'Past 12 months', sex: sexSel.value, responses: state, total: state.reduce(function(a,b){return a+b;},0), cutoff: (sexSel.value==='F'?3:(sexSel.value==='M'?4:3)), positive: (state.reduce(function(a,b){return a+b;},0) >= (sexSel.value==='F'?3:(sexSel.value==='M'?4:3))), ts: new Date().toISOString() };
  var blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'auditc.json'; a.click();
}
document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });
document.getElementById('btn-json').addEventListener('click', downloadJson);
render();
</script></body></html>`;
  }
  if (id === 'dast10') {
    const items = [
      'Have you used drugs other than those required for medical reasons?',
      'Do you abuse more than one drug at a time?',
      'Are you always able to stop using drugs when you want to?',
      "Have you had 'blackouts' or 'flashbacks' as a result of drug use?",
      'Do you ever feel bad or guilty about your drug use?',
      'Does your spouse/parent/partner ever complain about your drug use?',
      'Have you neglected your family because of your drug use?',
      'Have you engaged in illegal activities to obtain drugs?',
      'Have you experienced withdrawal symptoms when you stopped taking drugs?',
      'Have you had medical problems as a result of your drug use?'
    ];
    const base = yesNoPage({
      title: 'DAST-10 — Past 12 Months',
      window: 'Past 12 months',
      items,
      bands: (s)=> s>=6 ? 'Severe' : s>=3 ? 'Moderate' : s>=1 ? 'Low' : 'No problems reported'
    });

    const staticRows = items.map((q,i)=>
      `<div class="q"><b>${i+1}.</b> ${q}<br>`+
      `<label><input type="radio" name="q${i}" value="0" checked> No</label> `+
      `<label><input type="radio" name="q${i}" value="1"> Yes</label>`+
      `</div>`
    ).join('');
    return base
      .replace('__YN_ROWS__', staticRows)

      .replace(`const ITEMS=${JSON.stringify([])}`, `const ITEMS=${JSON.stringify(items)}`);
  }
  if (id === 'asrs') {

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ASRS v1.1 — Part A (Demo)</title>
<style>
  :root{color-scheme:light dark}
  body{font-family:system-ui,Segoe UI,Arial;margin:24px;line-height:1.45}
  h1,h2,h3{margin:0 0 .5rem;font-weight:700}
  .muted{opacity:.8}
  .grid{display:grid;gap:12px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
  table{width:100%;border-collapse:collapse;margin:.5rem 0}
  th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left}
  .badge{display:inline-block;padding:2px 10px;border-radius:999px;border:1px solid #9ca3af;font-size:12px}
  .ok{background:#ecfdf5;border-color:#10b981;color:#065f46}
  .warn{background:#fff7ed;border-color:#f59e0b;color:#92400e}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .actions button{padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;cursor:pointer}
  .actions button:hover{background:#f3f4f6}
  .nowrap{white-space:nowrap}
  .keys th.keyed{background:rgba(250,204,21,.12)}
  @media print{.actions{display:none} .card{border-color:#c7c7c7} .badge{border-color:#888}}
</style></head><body>
<main class="grid" aria-labelledby="title">
  <section class="card">
    <h1 id="title">ASRS v1.1 — Adult ADHD Screener (Part A, 6)</h1>
    <p class="muted">Recall window: past 6 months • Frequency anchors 0–4 (Never → Very often)</p>
    <div class="actions" role="group" aria-label="Page actions">
      <button type="button" id="btn-print">Print</button>
      <button type="button" id="btn-json">Download JSON</button>
    </div>
  </section>

  <section class="card" aria-labelledby="hdr-items">
    <h2 id="hdr-items">Items and Responses (Paraphrased)</h2>
    <table class="keys" aria-describedby="scoring-note">
      <thead>
        <tr>
          <th style="width:44%">Item</th>
          <th>Never (0)</th>
          <th class="keyed">Rarely (1)</th>
          <th class="keyed">Sometimes (2)</th>
          <th class="keyed">Often (3)</th>
          <th class="keyed">Very often (4)</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <div id="scoring-note" class="muted">Demo decision rule: positive screen if ≥4 items are rated at or above the keyed columns (≥2). Use official wording and scoring when clinically deploying.</div>
  </section>

  <section class="card" aria-labelledby="hdr-computed">
    <h2 id="hdr-computed">Computed</h2>
    <p>
      <b>Keyed count (≥2):</b> <span id="keyed" class="nowrap">0</span> •
      <b>Screen:</b> <span id="band" class="badge">—</span>
    </p>
    <ul id="flags" class="muted"></ul>
    <div id="live" class="muted" aria-live="polite"></div>
  </section>

  <section class="card" aria-labelledby="hdr-methods">
    <h2 id="hdr-methods">Methods & Decision Rule</h2>
    <ul>
      <li>Frequency anchors scored 0–4. For screening, count items rated ≥2 (Sometimes/Often/Very often).</li>
      <li>Demo positive threshold: keyedCount ≥ 4 suggests a positive screen.</li>
      <li>Follow up positives with comprehensive ADHD assessment, impairment, onset and multi-setting verification.</li>
    </ul>
  </section>

  <section class="card" aria-labelledby="hdr-clinical">
    <h2 id="hdr-clinical">Clinical Context Capture</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px">
      <fieldset>
        <legend>Onset and Settings</legend>
        <label>Approx. age of onset (years) <input id="onset" type="number" min="1" max="60" style="width:88px"/></label><br>
        <label><input type="checkbox" id="multi"/> Symptoms present in ≥2 settings</label>
      </fieldset>
      <fieldset>
        <legend>Impairment Domains</legend>
        <label><input type="checkbox" class="imp" value="home"/> Home</label>
        <label><input type="checkbox" class="imp" value="work"/> Work</label>
        <label><input type="checkbox" class="imp" value="school"/> School</label>
        <label><input type="checkbox" class="imp" value="relationships"/> Relationships</label>
      </fieldset>
      <fieldset>
        <legend>Collateral</legend>
        <label for="collat">Sources</label>
        <input id="collat" type="text" placeholder="Parent/partner/teacher, prior records" style="width:100%"/>
      </fieldset>
    </div>
  </section>

  <section class="card" aria-labelledby="hdr-alg">
    <h2 id="hdr-alg">Algorithm (pseudocode)</h2>
    <pre><code>function asrsPartAScreen(values ) {
  const keyedCount = values.filter(v => (Number(v)||0) >= 2).length;
  const positive = keyedCount >= 4;
  return { keyedCount, positive };
}</code></pre>
  </section>

  <section class="card" aria-labelledby="hdr-dd">
    <h2 id="hdr-dd">Data Dictionary</h2>
    <table><thead><tr><th>Field</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td>instrument</td><td>"ASRS v1.1 Part A (Demo)"</td></tr>
        <tr><td>window</td><td>Past 6 months</td></tr>
        <tr><td>responses</td><td>Array[6] of item scores (0–4)</td></tr>
        <tr><td>keyedCount</td><td>Number of items with score ≥2</td></tr>
        <tr><td>positive</td><td>Boolean — screen result</td></tr>
        <tr><td>onsetYears</td><td>Approximate age of onset</td></tr>
        <tr><td>multiSettings</td><td>Boolean — ≥2 settings</td></tr>
        <tr><td>impairment</td><td>Array of impacted domains</td></tr>
        <tr><td>collateral</td><td>Free text sources</td></tr>
        <tr><td>ts</td><td>ISO timestamp</td></tr>
      </tbody>
    </table>
  </section>
</main>

<script>

var ITEMS = [
  'Difficulty sustaining attention on tasks',
  'Trouble organizing tasks and activities',
  'Avoids or delays tasks requiring sustained mental effort',
  'Often distracted by external stimuli',
  'Restlessness or feeling on the go',
  'Forgetfulness in daily activities'
];
var OPTS = ['Never','Rarely','Sometimes','Often','Very often'];
var state = Array(ITEMS.length).fill(0);
var rows = document.getElementById('rows');
function render(){
  rows.innerHTML='';
  ITEMS.forEach(function(label,i){
    var tr=document.createElement('tr');
    var cells = OPTS.map(function(txt,j){ return '<td><label><input type="radio" name="q'+i+'" value="'+j+'"> '+txt+'</label></td>'; }).join('');
    tr.innerHTML = '<td>'+(i+1)+'. '+label+'</td>' + cells;
    rows.appendChild(tr);
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[type=radio]'), function(el){ el.addEventListener('change', sync); });
}
function classify(keyed){
  var bandEl = document.getElementById('band');
  bandEl.textContent = (keyed >= 4) ? 'Positive (demo rule)' : 'Negative';
  bandEl.className = 'badge ' + (keyed >= 4 ? 'warn' : 'ok');
}
function sync(){
  for(var i=0;i<ITEMS.length;i++){
    var el = Array.prototype.find.call(document.getElementsByName('q'+i), function(e){ return e.checked; });
    state[i] = el ? Number(el.value) : 0;
  }
  var keyed = state.filter(function(v){ return v >= 2; }).length;
  document.getElementById('keyed').textContent = String(keyed);
  classify(keyed);
  var flags = [];
  if(keyed >= 4){ flags.push('Plan full ADHD assessment and impairment review.'); }
  document.getElementById('flags').innerHTML = flags.map(function(f){ return '<li>'+f+'</li>'; }).join('');
  document.getElementById('live').textContent = 'Updated: keyed count ' + keyed + ', screen ' + document.getElementById('band').textContent + '.';
}
function downloadJson(){
  var onset = Number((document.getElementById('onset') as HTMLInputElement | null)?.value)||null;
  var multi = !!((document.getElementById('multi') as HTMLInputElement | null)?.checked);
  var imps = Array.prototype.map.call(document.querySelectorAll('.imp:checked'), function(x){ return x.value; });
  var payload = { instrument:'ASRS v1.1 Part A (Demo)', window:'Past 6 months', responses: state, keyedCount: state.filter(function(v){return v>=2;}).length, positive: (state.filter(function(v){return v>=2;}).length>=4), onsetYears:onset, multiSettings:multi, impairment:imps, collateral:(document.getElementById('collat')).value||'', ts: new Date().toISOString() };
  var blob = new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'asrs_partA.json'; a.click();
}
document.getElementById('btn-print').addEventListener('click', function(){ window.print(); });
document.getElementById('btn-json').addEventListener('click', downloadJson);
render();
</script></body></html>`;
  }
  if (id === 'daily-mood') {

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Daily Mood Diary</title>
<style>
  :root{color-scheme:dark light}
  body{font-family:system-ui,Segoe UI,Arial;margin:24px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;max-width:100%;overflow:hidden;box-sizing:border-box}
  .table-wrap{overflow:auto;max-width:100%}
  table{width:100%;border-collapse:collapse;table-layout:fixed;max-width:100%}
  th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left;vertical-align:top;word-break:break-word}
  input{width:100%;box-sizing:border-box;min-width:0}

  @media (max-width: 860px){
    .table-wrap{overflow:visible}
    table, thead, tbody, th, td, tr{display:block}
    thead{display:none}
    tr{border:1px solid #d0d0d0;border-radius:8px;margin:8px 0;padding:8px}
    td{border:none;border-bottom:1px solid rgba(208,208,208,.4);position:relative;padding:10px 8px 10px 128px;min-height:38px}
    td:last-child{border-bottom:none}
    td::before{content:attr(data-label);position:absolute;left:8px;top:10px;font-weight:600;width:112px;white-space:normal}
    td.day{padding:10px 8px;font-weight:700}
    td.day::before{content:"Day";position:static;margin-right:8px;font-weight:600}
  }
</style></head><body>
<h1>Daily Mood Diary (7 Days)</h1>
<div class="card">
<div class="table-wrap">
<table aria-label="Mood diary grid">
  <thead><tr><th>Day</th><th>Mood (0–10)</th><th>Anxiety (0–10)</th><th>Sleep (hrs)</th><th>Activities</th><th>Notes</th></tr></thead>
  <tbody>
    ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<tr><td class="day">${d}</td><td data-label="Mood (0–10)"><input aria-label="Mood score"/></td><td data-label="Anxiety (0–10)"><input aria-label="Anxiety score"/></td><td data-label="Sleep (hrs)"><input aria-label="Sleep hours"/></td><td data-label="Activities"><input aria-label="Activities"/></td><td data-label="Notes"><input aria-label="Notes"/></td></tr>`).join('')}
  </tbody>
</table>
</div>
<p style="opacity:.8">Educational template; adapt to local validated instruments and language.</p>
</div>
</body></html>`;
  }
  if (id === 'daily-sleep-lite') {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sleep Diary — Lite</title>
<style>
  :root{color-scheme:dark light}
  body{font-family:system-ui,Segoe UI,Arial;margin:24px}
  .card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;max-width:100%;overflow:hidden;box-sizing:border-box}
  .table-wrap{overflow:auto;max-width:100%}
  table{width:100%;border-collapse:collapse;table-layout:fixed;max-width:100%}
  th,td{border:1px solid #d0d0d0;padding:6px 8px;text-align:left;vertical-align:top;word-break:break-word}
  input{width:100%;box-sizing:border-box;min-width:0}
  @media (max-width: 860px){
    .table-wrap{overflow:visible}
    table, thead, tbody, th, td, tr{display:block}
    thead{display:none}
    tr{border:1px solid #d0d0d0;border-radius:8px;margin:8px 0;padding:8px}
    td{border:none;border-bottom:1px solid rgba(208,208,208,.4);position:relative;padding:10px 8px 10px 150px;min-height:38px}
    td:last-child{border-bottom:none}
    td::before{content:attr(data-label);position:absolute;left:8px;top:10px;font-weight:600;width:136px;white-space:normal}
    td.day{padding:10px 8px;font-weight:700}
    td.day::before{content:"Day";position:static;margin-right:8px;font-weight:600}
  }
</style></head><body>
<h1>Sleep Diary — Lite (7 Days)</h1>
<div class="card">
<div class="table-wrap">
<table aria-label="Sleep diary">
  <thead><tr><th>Day</th><th>Bedtime</th><th>Wake</th><th>TST (hrs)</th><th>Awakenings (#)</th><th>Quality (0–5)</th><th>Notes</th></tr></thead>
  <tbody>
    ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<tr><td class="day">${d}</td><td data-label="Bedtime"><input/></td><td data-label="Wake"><input/></td><td data-label="TST (hrs)"><input/></td><td data-label="Awakenings (#)"><input/></td><td data-label="Quality (0–5)"><input/></td><td data-label="Notes"><input/></td></tr>`).join('')}
  </tbody>
</table>
</div>
<p style="opacity:.8">Educational template; adapt to local validated instruments and language.</p>
</div>
</body></html>`;
  }

  const alias: Record<string,string> = {
    'phq-9':'phq9','gad-7':'gad7','pcl-5':'pcl5','oci':'oci-r','ocir':'oci-r','ybocs':'y-BOCS'.toLowerCase(),
    'sleep-diary-lite':'daily-sleep-lite','sleep-lite':'daily-sleep-lite',
  };
  const key = alias[id] || id;
  const specKey = Object.keys(SPECS).find(k => k.toLowerCase() === key.toLowerCase());
  const spec = specKey ? (SPECS[specKey] as LikertSpec | { html: string }) : undefined;

  const buildRows = (items: string[], choicesLen: number) => {
    const cells = (i: number) => Array.from({ length: choicesLen }, (_, v) => `<td><input type="radio" name="q${i}" value="${v}"></td>`).join('');
    return items.map((q, i) => `<tr><td>${i+1}. ${q}</td>${cells(i)}</tr>`).join('');
  };
  if (!spec) {

    const title = id.toUpperCase();
    return `<div class="card"><h2>${escapeHtml(title)} — Worksheet</h2><p>Interactive page is not available. Use the official form. This placeholder is printable.</p></div>`;
  }
  if ('html' in spec) return (spec as { html: string }).html;
  const l = spec as LikertSpec;
  const base = likertPage(l)
    .replace('SPEC_CHOICES_LEN', String(l.choices.length))
    .replace('const ITEMS=[];', `const ITEMS=${JSON.stringify(l.items)};`);
  return base.replace('__ITEM_ROWS__', buildRows(l.items, l.choices.length));
}


registerRightPanelPack('psychometrics', (ctx: RightPanelPackCtx): RightPanelPackResult => {
  const itemId = (ctx.itemId || 'phq9').toLowerCase();

  const SELF_REPORT = new Set(['phq9','gad7','isi','k10','phq15','oasis','spin','pdss-sr','asrm','epds','audit','auditc','dast10','oci-r']);
  const WEEKLY = new Set(['oasis','spin','pdss-sr','asrm','epds']);
  const BIWEEKLY = new Set(['phq9','gad7','isi']);
  const MONTHLY = new Set(['pcl5','k10','phq15','oci-r']);
  const SUBSTANCE = new Set(['audit','auditc','dast10','assist']);
  const DIARIES = new Set(['daily-mood','daily-sleep-lite','drsp']);
  const titleMap: Record<string,string> = {
    'phq9':'PHQ-9 — Depression Severity', 'gad7':'GAD-7 — Anxiety Severity', 'pcl5':'PCL-5 — PTSD Symptom Severity', 'isi':'ISI — Insomnia Severity Index', 'k10':'K10 — Psychological Distress', 'phq15':'PHQ-15 — Somatic Symptom Severity', 'oasis':'OASIS — Anxiety Severity & Impairment', 'spin':'SPIN — Social Phobia Inventory', 'pdss-sr':'PDSS-SR — Panic Disorder Severity', 'asrm':'ASRM — Mania Self-Rating', 'epds':'EPDS — Postnatal Depression', 'oci-r':'OCI-R — Obsessive-Compulsive Inventory', 'audit':'AUDIT — Alcohol Use Disorders Identification Test', 'auditc':'AUDIT-C — Alcohol Use', 'dast10':'DAST-10 — Drug Abuse Screening Test', 'daily-mood':'Daily Mood Diary', 'daily-sleep-lite':'Sleep Diary — Lite', 'drsp':'Daily Record of Severity of Problems (DRSP)'
  };
  const windowFor = (id:string) => DIARIES.has(id)? 'Daily' : WEEKLY.has(id)? 'Past 7 days' : BIWEEKLY.has(id)? 'Past 14 days' : MONTHLY.has(id)? 'Past month' : SUBSTANCE.has(id)? 'Past 12 months' : '—';
  const bandsFor: Record<string,string[]> = {
    phq9:['5/10/15/20 → mild/moderate/mod-severe/severe'], gad7:['5/10/15'], isi:['0–7 none; 8–14 subthreshold; 15–21 moderate; 22–28 severe'], pcl5:['≥31–33 program-dependent thresholds'], k10:['10–50 bands Low/Moderate/High/Very High'], phq15:['0–30 Low/Medium/High'], oasis:['≥8 suggests clinically significant anxiety'], spin:['≥19 suggests social anxiety'], 'pdss-sr':['≥8 often used threshold'], asrm:['≥6 suggests hypomania/mania'], epds:['≥13 common threshold; item 10 risk'], 'oci-r':['Global + subscales'], audit:['Hazardous ≥8 program-dependent'], auditc:['Positive threshold varies (e.g., ≥3 women, ≥4 men)'], dast10:['0 none; 1–2 low; 3–5 moderate; 6–8 substantial; 9–10 severe']
  };
  const infoCards = (() => {
    const id = itemId;
    if (DIARIES.has(id)) {
      return [
        { title: 'Overview', body: [ `${titleMap[id] || id} printable grid for prospective tracking.`, 'Use daily rows with columns tailored to the diary (mood/anxiety/sleep/activities).' ]},
        { title: 'Time Window & Rater', body: [ 'Daily entries', 'Self-report by patient' ]},
        { title: 'Measurement Use', body: [ 'Use for behavioral activation, CBT, sleep monitoring.', 'Review adherence and trends at follow-up.' ]},
        { title: 'Export & Print', body: [ 'Printable layout; consider JSON/CSV capture if digitized.' ]},
      ];
    }
    const rater = SELF_REPORT.has(id) ? 'Self-report' : 'Clinician-rated';
    const win = windowFor(id);
    const bands = bandsFor[id] || [];
    return [
      { title: 'Overview', body: [ titleMap[id] || id.toUpperCase(), `Time window: ${win}`, `Rater: ${rater}` ]},
      { title: 'Scoring & Cutoffs', body: bands.length? bands : ['Follow local validated thresholds'] },
      { title: 'Measurement-Based Care', body: [ 'Use serially at consistent intervals to track response/remission.', 'Document date, rater, and context.' ]},
      { title: 'Safety & Actions', body: [ 'Escalate per risk items (e.g., suicidality) and clinical context.', 'Integrate impairment/function into decisions.' ]},
      { title: 'Data & Export', body: [ 'Print or export totals and item responses with timestamp.', 'Cite instrument sources in notes.' ]},
    ];
  })();

  const exampleHtml = htmlFor(itemId);

  const BASE_PROMPTS = {
    phq9: [
      'Build a PHQ-9 HTML (past 14 days) with autosum, banding 5/10/15/20 and Item 9 safety banner; JSON export.',
      'Add serial PHQ-9 comparison: baseline vs today with % change, response (≥50%) and remission (≤4).'
    ],
    gad7: [
      'Create a GAD-7 HTML (past 14 days) with autoscore 0–21 and badges at 5/10/15; keyboard accessible.',
      'Add trend chart for GAD-7 with dates and % change; export CSV of visits.'
    ],
    isi: [
      'Make an ISI HTML (past 2 weeks) with 7 items (0–4), total 0–28 and severity bands; print CSS.',
      'Provide CSV export with per-item responses and total for ISI.'
    ],
    pcl5: [
      'Create a PCL-5 HTML (past month) with 20 items (0–4), autoscore, and ≥31–33 threshold note.',
      'Show DSM-5 cluster subtotals (B/C/D/E) and highlight largest contributor.'
    ],
    k10: [
      'Compose a K10 HTML (past 4 weeks) with autoscore 10–50 and bands (Low/Moderate/High/Very High).'
    ],
    phq15: [
      'Make a PHQ-15 HTML (past 4 weeks) with autoscore 0–30 and Low/Medium/High interpretation.'
    ],
    'oci-r': [
      'Create an OCI-R HTML (past month) with 18 items (0–4), global and subscale totals; printable summary.'
    ],
    oasis: [
      'Create an OASIS HTML (past 7 days) with autoscore 0–20 and ≥8 threshold flag.'
    ],
    spin: [
      'Compose a SPIN HTML (past 7 days) with 17 items (0–4), autoscore and ≥19 threshold badge.'
    ],
    'pdss-sr': [
      'Make a PDSS-SR HTML (past 7 days) with 7 items (0–4), autoscore, and threshold note (e.g., ≥8).'
    ],
    asrm: [
      'Create an ASRM HTML (past 7 days) with autoscore and ≥6 flag; add brief mania symptom summary.'
    ],
    epds: [
      'Build an EPDS HTML (past 7 days) with polarity-aware scoring and item 10 risk highlight.'
    ],
    audit: [
      'Compose an AUDIT HTML (12 months) with autoscore and hazardous/harmful risk flags; printable BI note.'
    ],
    auditc: [
      'Make an AUDIT-C HTML (12 months) with autoscore and sex-specific threshold display; print CSS.'
    ],
    dast10: [
      'Create a DAST-10 HTML (12 months) with yes/no items, autoscore, and risk band text.'
    ],
    assist: [
      'Create an ASSIST worksheet capturing lifetime and past-3-month use per substance with risk advice.'
    ],
    'c-ssrs': [ 'Compose a C-SSRS screening visit worksheet with conditional follow-ups and risk summary.' ],
    asrs: [ 'Make an ASRS v1.1 Part A page with decision rule (≥4 items rated 2–4) and print CSS.' ],
    vanderbilt: [ 'Compose a Vanderbilt (parent) worksheet with symptoms and performance sections; autosum.' ],
    'snap-iv': [ 'Create a SNAP-IV worksheet with ADHD/ODD domains and autosum per domain.' ],
    drsp: [ 'Create a DRSP daily diary printable grid with 1–6 columns and CSV export.' ],
    csd: [ 'Compose a Consensus Sleep Diary printable with SOL/WASO/awakenings and habits; CSV export.' ],
    lcm: [ 'Make an NIMH Life-Chart Method daily page (−4…+4 mood, meds, events) with CSV export.' ],
    'daily-mood': [ 'Build a one-page mood diary (−4…+4) with daily rows and notes; printable.' ],
    'daily-sleep-lite': [ 'Create a Sleep Diary — Lite printable (bedtime, wake, TST, naps, substances); CSV export.' ],
    hamd: [ 'Create a HAM-D worksheet with 17 items, 0–2/0–4 ranges and totals; no verbatim anchors.' ],
    madrs: [ 'Make a MADRS worksheet (10 items) with 0–6 placeholders and autosum; printable.' ],
    ymrs: [ 'Create a YMRS worksheet with weighted items and total; printable.' ],
    panss: [ 'Compose a PANSS worksheet with Positive/Negative/General tables and subscale totals.' ],
    bprs: [ 'Make a BPRS worksheet with 18 items (1–7) and autosum.' ],
    'y-bocs': [ 'Create a Y-BOCS severity worksheet (0–4) for obsessions/compulsions; totals.' ],
    psqi: [ 'Compose a PSQI monthly worksheet computing 7 component scores and global score.' ],
    'ede-q': [ 'Make an EDE-Q monthly worksheet with subscale totals and global score; note licensing.' ],
    ghq12: [ 'Create a GHQ-12 page with GHQ (0-0-1-1) and Likert (0–3) toggle; show both totals.' ],
  } as Record<string, string[]>;
  const GENERAL = [
    'Add accessibility: labels/roles, roving tabindex, and print CSS.',
    'Provide JSON/CSV export with instrument, window, timestamp and responses.'
  ];

  const promptKeyMap: Record<string,string> = { 'ybocs': 'y-bocs', 'phq-9':'phq9', 'gad-7':'gad7', 'pcl-5':'pcl5', 'audit-c':'auditc', 'oci':'oci-r', 'ocir':'oci-r' };
  const pk = BASE_PROMPTS[itemId] ? itemId : (promptKeyMap[itemId] || itemId);
  const prompts = [ ...(BASE_PROMPTS[pk] || []), ...GENERAL ];

  const references = [
    'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. J Gen Intern Med. 2001.',
    'Spitzer RL, Kroenke K, Williams JBW, Löwe B. The GAD-7. Arch Intern Med. 2006.',
    'Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index. Sleep Med. 2001.',
    'Weathers FW et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD.',
    'Kessler RC et al. K10 Psychological Distress Scale.',
    'Kroenke K, Spitzer RL, Williams JBW. The PHQ-15. Psychosom Med. 2002.',
    'Foa EB et al. The OCI-R. Psychol Assess. 2002.',
    'Connor KM et al. The SPIN: Social Phobia Inventory. Br J Psychiatry. 2000.',
    'Shear MK et al. PDSS: Reliability and validity. Am J Psychiatry. 1997.',
    'Altman EG et al. ASRM: A measure of mania. Biol Psychiatry. 1997.',
    'Cox JL et al. Detection of postnatal depression (EPDS). Br J Psychiatry. 1987.',
    'Saunders JB et al. Development of the AUDIT. Addiction. 1993.',
    'Bush K et al. The AUDIT-C. Arch Intern Med. 1998.',
    'Skinner HA. The DAST. Addict Behav. 1982.',
    'Humeniuk R et al. The ASSIST. WHO. 2008.',
  ];
  return { infoCards, exampleHtml, prompts, references };
});


export function mapPsychometricItemToFourBlocks(item: PsychometricItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },

    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapPNItemToFourBlocks(item: PNItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapHandoutItemToFourBlocks(item: HandoutItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapConsentItemToFourBlocks(item: ConsentItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapCamhsItemToFourBlocks(item: CamhsItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapGroupItemToFourBlocks(item: GroupItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapCaseLetterItemToFourBlocks(item: CaseLetterItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapNeuroItemToFourBlocks(item: NeuroItem){
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export type ProfileKey =
  | 'mbc.autoscore' | 'mbc.change' | 'mbc.trends'
  | 'triage.risk' | 'triage.agitation' | 'triage.catatonia'
  | 'risk.safety'
  | 'intake.adult' | 'intake.child'
  | 'dx.ddx' | 'dx.formulation' | 'tx.plan'
  | 'meds.firstline' | 'psychotherapy.cbt'
  | 'followup.monitor' | 'notes.letters'
  | 'psychoeducation' | 'ethics.consent'
  | 'child.camhs'
  | 'neuro.medical'
  | 'assessment.bigfive'
  | 'generic';

export function detectProfile(card: Card): ProfileKey {
  const s = (card.sectionId || '').toString().toLowerCase();
  const t = (card.tags || []).map(x => x.toLowerCase());
  const title = (card.title || '').toLowerCase();
  const has = (k: string) => s.includes(k) || t.includes(k);
  const titleHas = (k: string) => title.includes(k);
  const any = (arr: string[]) => arr.some(k => has(k) || titleHas(k));

  if ((has('formulation') || titleHas('formulation')) && (has('diagnosis') || has('dx') || has('ddx') || titleHas('diagnostic'))) return 'dx.formulation';
  if ((has('assessment') || has('form')) && (has('big5') || has('big five') || has('five-factor') || has('fivefactor'))) return 'assessment.bigfive';
  if (any(['phq9','phq-9','gad7','gad-7','ybocs','pcl5','auditc','audit-c','autoscore','auto-scoring'])) return 'mbc.autoscore';
  if (any(['screening','cutoff','cutoffs','scale','scales'])) return 'mbc.autoscore';
  if (has('mbc') && has('auto')) return 'mbc.autoscore';
  if (has('mbc') && (has('phq9') || has('gad7') || has('pcl5') || has('ybocs') || has('auditc') || has('audit-c'))) return 'mbc.autoscore';
  if (any(['response','remission','delta','change trajectory'])) return 'mbc.change';
  if (has('mbc') && (has('change') || has('response'))) return 'mbc.change';
  if (has('mbc') && has('trend')) return 'mbc.trends';
  if (has('triage') && (has('suicide') || has('risk'))) return 'triage.risk';
  if (has('triage') && (has('agitation') || has('de-escalation'))) return 'triage.agitation';
  if (has('catatonia')) return 'triage.catatonia';
  if (has('risk') || has('safetyplan') || has('violence') || has('capacity') || has('means') || has('forensic')) return 'risk.safety';
  if (has('intake') && has('child')) return 'intake.child';
  if (has('intake') || titleHas('intake') || titleHas('hpi')) return 'intake.adult';
  if (has('diagnosis') || has('ddx')) return 'dx.ddx';
  if (has('treatment') || has('plan')) return 'tx.plan';
  if (has('meds') || has('ssri') || has('snri')) return 'meds.firstline';
  if (has('psychotherapy') || has('cbt')) return 'psychotherapy.cbt';
  if (has('follow-up') || has('monitor')) return 'followup.monitor';
  if (has('note') || has('letter')) return 'notes.letters';
  if (has('psychoeducation') || has('handout')) return 'psychoeducation';
  if (has('consent') || has('ethic')) return 'ethics.consent';
  if (has('camhs') || has('child')) return 'child.camhs';
  if (has('neuro') || has('delirium') || has('medical')) return 'neuro.medical';
  if (has('psychometrics') || has('diary') || any(['phq9','gad7','pcl5','ybocs','auditc'])) return 'mbc.autoscore';
  return 'generic';
}


function bullets(items: string[]): string {
  const safe = items.filter(Boolean).map(s => `<li>${(s || '').trim()}</li>`).join('');
  return `<ul>${safe}</ul>`;
}

function defaultInfoExpanded(profile: ProfileKey, title: string): string {
  const t = (title || '').trim() || 'This tool';
  switch (profile) {
    case 'intake.adult':
      return `
        <h3>What this is</h3>
        <p>Structured adult psychiatric intake capturing chief complaint, HPI, risk, MSE, and initial plan.</p>
        <h3>Clinical application</h3>
        ${bullets([
          'Triage new patients and standardize information capture.',
          'Surface immediate safety concerns and comorbidity.',
          'Produce APSO/SOAP-ready documentation.'
        ])}
        <h3>Key fields</h3>
        ${bullets([
          'Identification & chief complaint, HPI timeline, prior psychiatric/medical history',
          'Substance use, allergies/medications, social & developmental history',
          'Risk screen (suicide, violence, neglect), MSE, assessment & plan'
        ])}
        <h3>Red flags</h3>
        ${bullets([
          'Active suicidal intent or recent attempt',
          'Delirium or altered mental status',
          'Acute intoxication/withdrawal, inability to care for self'
        ])}
        <h3>Documentation</h3>
        ${bullets([
          'Capture sources of information and collateral.',
          'Record positive and key negative findings.',
          'Include rationale for risk grading and disposition.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'mbc.autoscore':
      return `
        <h3>What this is</h3>
        <p>Autoscore pages for common self-report scales (PHQ-9, GAD-7, PCL-5, Y-BOCS, AUDIT-C) with severity anchors and flags.</p>
        <h3>Clinical application</h3>
        ${bullets([
          'Baseline and follow-up measurement in Measurement-Based Care (MBC).',
          'Trigger safety steps (e.g., positive PHQ-9 Item 9).',
          'Track response/remission thresholds.'
        ])}
        <h3>Documentation</h3>
        ${bullets([
          'Record date, who completed, and any assistance provided.',
          'Note score, band, and clinical interpretation.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'risk.safety':
      return `
        <h3>What this is</h3>
        <p>Risk & safety toolkit: formulation, safety planning, capacity/consent, means restriction, and violence risk prompts.</p>
        <h3>Core steps</h3>
        ${bullets([
          'Identify ideation, intent, plan, means, and protective factors.',
          'Agree on a documented safety plan; restrict means.',
          'Determine setting and follow-up interval; involve supports as appropriate.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'meds.firstline':
      return `
        <h3>What this is</h3>
        <p>First-line SSRI/SNRI options with starting/titration doses and monitoring anchors.</p>
        <h3>Monitor</h3>
        ${bullets([
          'Side-effects (GI, activation, sexual), adherence, suicidality early in course.',
          'Drug–drug interactions, QTc where relevant, pregnancy/lactation considerations.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    default:
      return `
        <h3>Overview</h3>
        <p>${t} — clinician-focused summary, typical use cases, and decision anchors.</p>
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
  }
}


type RiskTopic =
  | 'agitation'
  | 'deescalation'
  | 'catatonia'
  | 'delirium'
  | 'escalation'
  | 'safetyplan'
  | 'violence'
  | 'capacity'
  | 'means'
  | 'forensic';

function riskTopicFromTitle(title: string): RiskTopic | null {
  const t = (title || '').toLowerCase();
  if (/agitation|catatonia.*quick path/.test(t)) return 'agitation';
  if (/rapid.*de-?escalation|ladder|verbal|prn/.test(t)) return 'deescalation';
  if (/catatonia.*bfcrs|lorazepam/.test(t)) return 'catatonia';
  if (/delirium|reversible causes|quick screen/.test(t)) return 'delirium';
  if (/red flags|escalation|icu|ed/.test(t)) return 'escalation';
  if (/suicide.*safety plan|stanley|c-ssrs/.test(t)) return 'safetyplan';
  if (/violence.*risk|non-proprietary/.test(t)) return 'violence';
  if (/capacity.*consent|4 abilities|four abilities/.test(t)) return 'capacity';
  if (/means.*safety|lethal.*means/.test(t)) return 'means';
  if (/forensic.*risk.*opinion/.test(t)) return 'forensic';
  return null;
}


function buildRiskInfo(topic: RiskTopic): string {
  const B = (xs: string[]) => `<ul>${xs.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  switch (topic) {
    case 'agitation':
      return `
        <h3>What this is</h3>
        <p>Rapid triage and initial management of agitation/catatonia in medical and psychiatric settings.</p>
        <h3>Clinical anchors</h3>
        ${B([
          'Environment optimization: safety of team/patient, reduce stimuli, assign lead communicator.',
          'Severity anchors: verbal vs physical agitation; use objective scale (e.g., RASS).',
          'Medical rule-outs: hypoxia, hypoglycemia, intoxication/withdrawal, delirium, pain.'
        ])}
        <h3>Catatonia clues</h3>
        ${B([
          'Motor signs (posturing, waxy flexibility, negativism), mutism, echolalia/echopraxia.',
          'Consider benzodiazepine challenge if not medically contraindicated.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Antecedents, behaviors observed, vitals, rule-outs considered.',
          'Non-pharmacologic attempts and response; meds, dose, route; adverse events.',
          'Rationale for setting/observation level and reassessment plan.'
        ])}
        <h3>Red flags</h3>
        ${B([
          'Suspected neuroleptic malignant syndrome, serotonin syndrome, malignant catatonia.',
          'Airway compromise, sepsis signs, refractory agitation despite adequate doses.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'deescalation':
      return `
        <h3>What this is</h3>
        <p>Stepwise verbal de-escalation with PRN medication ladder when needed.</p>
        <h3>Key steps</h3>
        ${B([
          'Establish rapport; one voice; concise choices; offer oral meds before IM.',
          'Match intervention to severity; reassess every 10–15 minutes.',
          'Avoid polypharmacy; document effect and side effects.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Trigger/setting, communication strategies used, accepted/refused medications.',
          'Objective response (scale), vitals, adverse effects, disposition.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'catatonia':
      return `
        <h3>What this is</h3>
        <p>Recognition of catatonia (e.g., BFCRS) and safe lorazepam challenge.</p>
        <h3>Essentials</h3>
        ${B([
          'Screen with a brief BFCRS item set; quantify severity where possible.',
          'Lorazepam 1–2 mg (PO/IV) challenge with monitoring; repeat if partial response.',
          'Consider ECT for malignant/benzodiazepine-refractory cases.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Criteria met, differential (delirium, NMS), response to challenge, consults.',
          'Risks/benefits, consent/capacity considerations.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'delirium':
      return `
        <h3>What this is</h3>
        <p>Quick screen for delirium and systematic search for reversible causes.</p>
        <h3>Screen & reversible causes</h3>
        ${B([
          'Use a validated bedside tool (e.g., CAM or 4AT).',
          'Check ABCs, vitals, glucose, O2; review meds/anticholinergics; infection, electrolytes, pain, retention, constipation, withdrawal.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Fluctuation, inattention, altered consciousness; precipitating factors; consults/tests ordered.',
          'Non-pharmacologic measures; cautious antipsychotic use only if severely distressed/risk.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'escalation':
      return `
        <h3>What this is</h3>
        <p>Critical red flags requiring ED/ICU escalation or urgent specialty input.</p>
        <h3>Triggers</h3>
        ${B([
          'Persistent hypoxia, sepsis suspicion, hemodynamic instability.',
          'Active suicidal intent with plan/means; homicidal risk; severe agitation with medical compromise.',
          'Malignant catatonia/NMS/serotonin syndrome concerns.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Red flag(s) present, time course, actions taken, consultations, handoff note.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'safetyplan':
      return `
        <h3>What this is</h3>
        <p>Stanley–Brown Safety Plan with C-SSRS-gated triage and means restriction counseling.</p>
        <h3>Core components</h3>
        ${B([
          'Warning signs; internal coping strategies; people/places for distraction.',
          'Contacts for help; professional/urgent resources; means restriction plan.',
          'Follow-up interval and review schedule.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'C-SSRS results; collaborative plan elements; who holds copies; crisis numbers provided.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'violence':
      return `
        <h3>What this is</h3>
        <p>Brief violence risk formulation using non-proprietary structured professional judgement (SPJ) headings.</p>
        <h3>Factors to cover</h3>
        ${B([
          'Historical (past violence, justice involvement), clinical (psychosis/intoxication), contextual (stressors/supports), protective factors.',
          'Imminence and scenarios; risk management plan.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Specific factors considered; reasoning for risk level; mitigation steps; communication with team.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'capacity':
      return `
        <h3>What this is</h3>
        <p>Capacity to consent using the four abilities framework.</p>
        <h3>Four abilities</h3>
        ${B([
          'Understanding relevant information.',
          'Appreciation of situation and consequences.',
          'Reasoning about treatment choices.',
          'Expressing a stable choice.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Decision/task/time-specific; findings for each ability; supports used; conclusion and rationale.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'means':
      return `
        <h3>What this is</h3>
        <p>Lethal means counseling to reduce access to highly lethal methods during risk periods.</p>
        <h3>Key steps</h3>
        ${B([
          'Collaborative inquiry about firearms, medications, toxins; tailor to context/culture/law.',
          'Lock/unload/store separately; temporary off-site storage; limit medication quantities; blister packs.',
          'Document plan and who is responsible.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Counseling provided, agreed actions, education materials, follow-up check.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case 'forensic':
      return `
        <h3>What this is</h3>
        <p>Neutral forensic-style risk opinion outline (non-jurisdictional).</p>
        <h3>Outline</h3>
        ${B([
          'Referral question; sources reviewed; methods/limitations.',
          'Findings (historical, clinical, contextual, protective).',
          'Opinion framed to the legal/administrative question; caveats.'
        ])}
        <h3>Documentation</h3>
        ${B([
          'Maintain neutrality; separate facts from opinion; reference materials relied upon.'
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
  }
  return '';
}


function exRiskExample(topic: RiskTopic, title: string): string {
  const H = (s:string)=>`<h2>${escapeHtml(s)}</h2>`;
  switch (topic) {
    case 'safetyplan':
      return `
<section class="mini-page print-friendly">
  <header>${H(title || 'Suicide Safety Plan (Stanley–Brown)')}</header>
  <form>
    <fieldset><legend>1) Warning Signs</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>2) Internal Coping Strategies</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>3) Social Settings for Distraction</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>4) People Who Can Help</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>5) Professionals & Crisis Resources</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>6) Means Restriction Plan</legend><textarea rows="4" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px">
      <label style="flex:1">Clinician<input style="width:100%"></label>
      <label style="flex:1">Patient<input style="width:100%"></label>
      <label>Date<input type="date"></label>
    </div>
  </form>
  <p style="font-size:12px;opacity:.8;margin-top:8px">Use clinical judgement; follow local protocols.</p>
</section>`.trim();
    case 'violence':
      return `
<section class="mini-page print-friendly">
  <header>${H(title || 'Violence Risk — Brief SPJ Formulation')}</header>
  <form>
    <fieldset><legend>Historical Factors</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Clinical Factors</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Contextual Factors</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Protective Factors</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Imminence & Scenarios</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Risk Management Plan</legend><textarea rows="4" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px">
      <label>Risk Level<select><option></option><option>Low</option><option>Moderate</option><option>High</option></select></label>
      <label>Date<input type="date"></label>
    </div>
  </form>
</section>`.trim();
    case 'capacity':
      return `
<section class="mini-page print-friendly">
  <header>${H(title || 'Capacity to Consent — 4 Abilities Brief')}</header>
  <form>
    <fieldset><legend>Understanding</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Appreciation</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Reasoning</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Expressing a Choice</legend><textarea rows="2" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px">
      <label>Conclusion<select><option></option><option>Has capacity</option><option>Lacks capacity</option></select></label>
      <label>Decision/Task<input style="width:100%"></label>
      <label>Date<input type="date"></label>
    </div>
  </form>
</section>`.trim();
    case 'means':
      return `
<section class="mini-page print-friendly">
  <header>${H(title || 'Means Safety Counseling — Script & Checklist')}</header>
  <form>
    <fieldset><legend>Discussion Summary</legend><textarea rows="4" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Firearms</legend>${['Storage (locked)', 'Unloaded', 'Separate ammo', 'Temporary off-site'].map(x=>`<label><input type="checkbox"/> ${x}</label>`).join('<br/>')}</fieldset>
    <fieldset><legend>Medications</legend>${['Limit quantities', 'Blister packs', 'Lock box'].map(x=>`<label><input type="checkbox"/> ${x}</label>`).join('<br/>')}</fieldset>
    <fieldset><legend>Toxins/Other</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Who Will Help</legend><textarea rows="2" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px">
      <label>Reviewed with<input style="width:100%"></label>
      <label>Date<input type="date"></label>
    </div>
  </form>
</section>`.trim();
    case 'agitation':
    case 'deescalation':
    case 'catatonia':
    case 'delirium':
    case 'escalation':
      return `
<section class="mini-page print-friendly">
  <header>${H(title || 'Acute Triage Worksheet')}</header>
  <form>
    <fieldset><legend>Setting & Antecedents</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Observed Behaviors (objective)</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Medical Rule-outs</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Interventions Tried</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Response / Adverse Effects</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Disposition / Escalation</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px">
      <label>Scale/Anchor<input style="width:100%" placeholder="e.g., RASS, BFCRS brief"></label>
      <label>Date<input type="date"></label>
    </div>
  </form>
</section>`.trim();
  }
  return '';
}


function synthesizeRiskPrompts(topic: RiskTopic, title: string): { text: string }[] {
  const mk = (s:string)=>({ text: s });
  switch (topic) {
    case 'safetyplan':
      return [
        mk('Create a code in HTML as page for a Stanley–Brown Suicide Safety Plan with six sections and signature/date blocks.'),
        mk('Compose a code in HTML as form that gates the Safety Plan behind a brief C-SSRS triage section.'),
        mk('Make a code in HTML as page for safety plan copies: patient, caregiver, clinician.'),
        mk('Create a code in HTML as page that adds a print-friendly layout and QR to crisis resources.'),
        mk('Compose a code in HTML as form with collapsible sections for mobile use.'),
        mk('Make a code in HTML to export the completed plan as a formatted summary block.')
      ];
    case 'violence':
      return [
        mk('Create a code in HTML as page for a Violence Risk SPJ worksheet with Historical/Clinical/Contextual/Protective sections and risk level.'),
        mk('Compose a code in HTML as form that generates a concise risk formulation paragraph from entered factors.'),
        mk('Make a code in HTML to capture imminence scenarios and management actions with checkboxes.'),
        mk('Create a code in HTML as page for follow-up reviews that track changes in risk factors over time.'),
        mk('Compose a code in HTML for a printable risk management plan sheet.'),
        mk('Make a code in HTML to add a signature block for multi-disciplinary signoff.')
      ];
    case 'capacity':
      return [
        mk('Create a code in HTML as form for Capacity to Consent using the four abilities with conclusion and rationale.'),
        mk('Compose a code in HTML as page to record supports/accommodations used during the assessment.'),
        mk('Make a code in HTML to embed task-specific decision details and risk/benefit comparison.'),
        mk('Create a code in HTML as page for witness/consultant attestations.'),
        mk('Compose a code in HTML for a patient information sheet summarizing the decision.'),
        mk('Make a code in HTML to auto-generate a clinician summary from form inputs.')
      ];
    case 'means':
      return [
        mk('Create a code in HTML as page for Lethal Means Counseling with firearm, medication, and toxin checklists plus who-will-help fields.'),
        mk('Compose a code in HTML as form for a secure storage agreement with contact details.'),
        mk('Make a code in HTML to produce a counseling summary handout for the patient/caregiver.'),
        mk('Create a code in HTML as page with follow-up reminders for means safety checks.'),
        mk('Compose a code in HTML that stores agreed actions and displays them as a printable table.'),
        mk('Make a code in HTML for mobile-friendly toggles and brief scripts per item.')
      ];
    default:
      return [
        mk(`Create a code in HTML as page for an Acute Triage Worksheet titled "${title}" with sections for Antecedents, Behaviors, Rule-outs, Interventions, Response, Disposition.`),
        mk('Compose a code in HTML as form that includes a severity anchor selector (e.g., RASS/BFCRS brief) and timestamp.'),
        mk('Make a code in HTML to print a one-page summary from the above worksheet.'),
        mk('Create a code in HTML as page with safety disclaimers and clinician/patient signature blocks.'),
        mk('Compose a code in HTML to add structured follow-up tasks and reminders.'),
        mk('Make a code in HTML for a compact mobile view with collapsible sections.')
      ];
  }
}


function riskFallbackRefs(topic: RiskTopic): RefLite[] {
  const R = (title:string, journal?:string, year?:string|number): RefLite => {
    const r: RefLite = { title };
    if (journal) r.journal = journal;
    if (year !== undefined) r.year = year;
    return r;
  };
  switch (topic) {
    case 'safetyplan':
      return [
        R('Stanley B, Brown GK. Safety Planning Intervention.', 'Cognitive and Behavioral Practice', 2012),
        R('Posner K et al. The Columbia–Suicide Severity Rating Scale (C-SSRS).', 'Am J Psychiatry', 2011),
        R('Jobes DA. Managing Suicidal Risk (Collaborative Assessment).', 'Guilford', 2016)
      ];
    case 'violence':
      return [
        R('Monahan J. Reconsidering Violence Risk Assessment: The MacArthur Study.', 'Oxford', 2001),
        R('Borum R. Improving the Clinical Practice of Violence Risk Assessment.', 'Psychiatry', 1996)
      ];
    case 'capacity':
      return [
        R("Appelbaum PS, Grisso T. Assessing Patients' Capacities to Consent.", 'N Engl J Med', 1988),
        R('Grisso T, Appelbaum PS. The MacCAT Tools and the Four-Abilities Model.', 'Oxford', 1998)
      ];
    case 'means':
      return [
        R('Betz ME, Wintemute GJ. Physician Counseling on Firearm Safety.', 'Ann Intern Med', 2015),
        R('Harvard T.H. Chan School — Means Matter resources.', 'Web resource')
      ];
    case 'agitation':
      return [
        R('Project BETA: Best Practices in Evaluation and Treatment of Agitation.', 'West J Emerg Med', 2012),
        R('Sessler CN et al. The Richmond Agitation–Sedation Scale (RASS).', 'Am J Respir Crit Care Med', 2002)
      ];
    case 'deescalation':
      return [
        R('Project BETA De-escalation Guidelines.', 'West J Emerg Med', 2012),
        R('Price O et al. Training in Verbal De-escalation in Healthcare.', 'BJPsych Advances', 2018)
      ];
    case 'catatonia':
      return [
        R('Bush G, Fink M, Petrides G. The BFCRS.', 'Acta Psychiatr Scand', 1997),
        R('Sienaert P. A Clinical Review of the Treatment of Catatonia.', 'Front Psychiatry', 2014)
      ];
    case 'delirium':
      return [
        R('Inouye SK et al. Confusion Assessment Method (CAM).', 'Ann Intern Med', 1990),
        R('4AT: Rapid Assessment Test for Delirium.', '4AT.org')
      ];
    case 'escalation':
      return [
        R('Surviving Sepsis Campaign Guidelines.', 'Intensive Care Med', 2021),
        R('Emergency Psychiatry consensus statements on high-risk presentations.', 'Position papers')
      ];
  }
  return [];
}

type DxTopic =
  | "fiveps"
  | "ddxmatrix"
  | "medneuroflags"
  | "maniaGate"
  | "psychosisPrimarySecondary"
  | "anxietyNavigator"
  | "adhdAdult"
  | "autismAdult"
  | "traitsVsDisorders"
  | "provisionalDx";

function dxTopicFromTitle(title: string): DxTopic | null {
  const t = (title || "").toLowerCase();
  if (/5\s*ps|five\s*ps|formulation/.test(t)) return "fiveps";
  if (/differential.*matrix|discriminator|key discriminators/.test(t)) return "ddxmatrix";
  if (/medical|neurologic.*red flags|escalation/.test(t)) return "medneuroflags";
  if (/mania|hypomania|mixed features/.test(t)) return "maniaGate";
  if (/primary.*secondary.*psychosis|outline/.test(t)) return "psychosisPrimarySecondary";
  if (/anxiety.*navigator|gad|panic|social/.test(t)) return "anxietyNavigator";
  if (/adhd.*adult/.test(t)) return "adhdAdult";
  if (/autism.*adult/.test(t)) return "autismAdult";
  if (/personality.*traits.*disorders|clinical frame/.test(t)) return "traitsVsDisorders";
  if (/provisional.*diagnos(is|es)|specifiers|severity/.test(t)) return "provisionalDx";
  return null;
}


function buildDxInfo(topic: DxTopic): string {
  const B = (xs: string[]) => `<ul>${xs.map(x => `<li>${x}</li>`).join("")}</ul>`;
  switch (topic) {
    case "fiveps":
      return `
        <h3>What this is</h3>
        <p>Structured diagnostic formulation organizing case material into Presenting, Predisposing, Precipitating, Perpetuating, and Protective factors to clarify mechanisms and targets.</p>
        <h3>Clinical anchors</h3>
        ${B([
          "Integrate symptom clusters with developmental history, personality traits, medical/substance factors, and sociocultural context.",
          "Explicitly link perpetuating mechanisms (avoidance, sleep dysregulation, cognitive distortions, interpersonal cycles) to treatment targets.",
          "State diagnostic probabilities (e.g., Major Depressive Episode ~0.7, Bipolar Spectrum ~0.2) and residual uncertainties."
        ])}
        <h3>Documentation notes</h3>
        ${B([
          "Sources (patient, collateral, records) and reliability qualifiers.",
            "Salient positives/negatives that materially shift likelihood ratios.",
            "Risk formulation: dynamic vs static factors; rationale for level of care and follow-up cadence."
        ])}
        <h3>Pitfalls & red flags</h3>
        ${B([
          "Premature closure; failure to rule out medical, substance, or neurocognitive contributors.",
          "Labeling enduring traits as disorders without demonstrable impairment/severity.",
          "Omitting protective factors (resilience, supports) which inform risk mitigation."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "ddxmatrix":
      return `
        <h3>What this is</h3>
        <p>Compact matrix to compare leading differentials across discriminating domains (onset, course, hallmark features, tests, rule-outs) and track pending clarifiers.</p>
        <h3>How to use</h3>
        ${B([
          "List only viable diagnoses (typically 3–6) to preserve focus.",
          "Columns = discriminators you will actively investigate (e.g., episodicity, circadian pattern, cognitive profile).",
          "Populate cells with objective or collateral-supported data; mark uncertain items explicitly.",
          "Indicate pending tests/ratings with expected resolution timeframe."
        ])}
        <h3>Pitfalls</h3>
        ${B([
          "Overfilling with rarely considered diagnoses (noise > signal).",
          "Failing to retire a diagnosis when probability becomes very low.",
          "Using purely phenomenological overlaps without mechanism-based distinctions."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "medneuroflags":
      return `
        <h3>What this is</h3>
        <p>Focused list of medical / neurological red flags within psychiatric presentations requiring escalation, urgent diagnostics, or alternative care pathway.</p>
        <h3>Examples (non-exhaustive)</h3>
        ${B([
          "Acute fluctuating attention / level of consciousness (possible delirium).",
          "First-lifetime psychosis after age 40 or rapidly progressive cognitive change.",
          "Focal neurological deficits, new seizure, or catatonic motor signs.",
          "Severe autonomic instability, hyperthermia, rigidity (NMS/serotonin syndrome concern).",
          "Subacute personality change with headaches, endocrine, or systemic inflammatory signs.",
          "Exposure or lab history suggesting toxic / metabolic encephalopathy."
        ])}
        <h3>Documentation</h3>
        ${B([
          "Specific flag observed and onset context.",
          "Immediate actions (labs, imaging, consults, monitoring).",
          "Rationale for level of care and consequences of delay.",
          "Handoff / escalation pathway and responsible clinician."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "maniaGate":
      return `
        <h3>What this is</h3>
        <p>Gate assessment for suspected mania or hypomania emphasizing episode characterization, mixed features, and exclusion of substance / medical mimics.</p>
        <h3>Clinical anchors</h3>
        ${B([
          "Distinct period of elevated, expansive, or irritable mood plus activity/energy change.",
          "Decreased need for sleep, goal-directed/risk behaviors, pressured speech, flight of ideas.",
          "Assess for mixed depressive symptoms (influence treatment choice / safety).",
          "Differentiate antidepressant-emergent activation vs endogenous episode (timing, persistence).",
          "Rule out substances (stimulants, steroids) and neurologic / endocrine triggers."
        ])}
        <h3>Pitfalls</h3>
        ${B([
          "Misclassifying brief stress-related affective lability as hypomania.",
          "Ignoring mixed features leading to inadequate mood stabilization strategy.",
          "Attributing clear syndromal mania to personality or situational factors without evidence."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "psychosisPrimarySecondary":
      return `
        <h3>What this is</h3>
        <p>Outline distinguishing primary psychotic disorders from secondary (medical, neurologic, substance, delirium) etiologies.</p>
        <h3>Key discriminators</h3>
        ${B([
          "Onset tempo & age at presentation; abrupt fluctuation suggests delirium/toxic/metabolic.",
          "Predominance of visual / multimodal hallucinations or cognitive clouding (consider organic).",
          "Medication / substance timeline (steroids, anticholinergics, dopaminergics, intoxication/withdrawal).",
          "Neurological / systemic features (seizures, catatonia, autoimmune signs, endocrine)."
        ])}
        <h3>Workup sketch</h3>
        ${B([
          "Vitals, tox screen, metabolic panel, thyroid, B12/folate; infectious / autoimmune / endocrine labs as indicated.",
          "Imaging (CT/MRI), EEG when seizure, encephalopathy, or atypical course suspected.",
          "Document reasoning for each test ordered or deferred."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "anxietyNavigator":
      return `
        <h3>What this is</h3>
        <p>Navigator to discriminate generalized anxiety, panic disorder, social anxiety, agoraphobia (and related spectra) via core fear focus, cue pattern, and impairment.</p>
        <h3>Anchors</h3>
        ${B([
          "Primary feared outcome (evaluation, catastrophe, physiologic event, entrapment).",
          "Cue pattern: unexpected vs situational vs generalized pervasive worry.",
          "Avoidance strategies (safety behaviors) and functional cost mapping.",
          "Screen comorbid depression, substance use, sleep disorders, autonomic or endocrine mimics."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "adhdAdult":
      return `
        <h3>What this is</h3>
        <p>Adult ADHD scaffold emphasizing developmental continuity, cross-situational impairment, and differential exclusion.</p>
        <h3>Essentials</h3>
        ${B([
          "Symptom presence before age 12 when reliably corroborated (reports, school records, informant).",
          "Current symptoms across ≥2 settings with measurable impact (occupational, academic, relational, executive).",
          "Differentiate from sleep deprivation, anxiety rumination, depression psychomotor slowing, substance effects, bipolar episodes, trauma sequelae."
        ])}
        <h3>Documentation</h3>
        ${B([
          "Structured rating scales used and interpretation (ASRS, CAARS, local equivalents).",
          "Functional examples of impairment (missed deadlines, accidents, financial problems).",
          "Comorbidity strategy (treat most impairing / destabilizing first)."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "autismAdult":
      return `
        <h3>What this is</h3>
        <p>Brief adult autism triage focusing on lifelong social-communication differences and restricted/repetitive behavior patterns.</p>
        <h3>Considerations</h3>
        ${B([
          "Developmental history (early reciprocity, language/pragmatics, adaptive functioning).",
          "Differentiation from ADHD inattention, social anxiety avoidance, schizotypal or personality styles.",
          "Sensory processing issues and masking/camouflaging phenomena.",
          "Strengths, supports, and needed accommodations (education/workplace)."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "traitsVsDisorders":
      return `
        <h3>What this is</h3>
        <p>Clinical frame distinguishing normative or accentuated personality traits from personality disorders using severity, pervasiveness, stability, and risk domains.</p>
        <h3>Anchors</h3>
        ${B([
          "Severity / functional impairment in self (identity/self-direction) and interpersonal (empathy/intimacy) domains.",
          "Pervasive across contexts (not limited to one role or acute state).",
          "Stable over time tracing back to adolescence / early adulthood (exclude episodic syndromes).",
          "Distinguish trait expression from state effects of mood, anxiety, PTSD, substance use.",
          "Risk behaviors or crises necessitating structured containment / safety planning."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
    case "provisionalDx":
      return `
        <h3>What this is</h3>
        <p>Builder for a provisional diagnosis statement including core syndrome, specifiers, severity, differential exclusions, medical/substance contributors, and planned confirmation steps.</p>
        <h3>Documentation</h3>
        ${B([
          "Explicit diagnostic label (DSM-5-TR / ICD-11) with rationale & key criteria met.",
          "Specifiers and severity anchors (quantitative or qualitative).",
          "Salient ruled-out conditions and why (data points).",
          "Pending tests / observations with time window to re-evaluate.",
          "Plan for confirmation, monitoring, or revision (ratings, collateral, longitudinal course)."
        ])}
        <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
      `;
  }
  return '';
}


function exDxExample(topic: DxTopic, title: string): string {
  const H = (s:string)=>`<h2>${escapeHtml(s)}</h2>`;
  switch (topic) {
    case "fiveps":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Diagnostic Formulation — 5 Ps (Structured)")}</header>
  <form>
    <fieldset><legend>Presenting</legend><textarea rows="4" style="width:100%" placeholder="Current symptoms, onset, severity, functional impact"></textarea></fieldset>
    <fieldset><legend>Predisposing</legend><textarea rows="4" style="width:100%" placeholder="Genetic/family, developmental, trauma, temperament, medical"></textarea></fieldset>
    <fieldset><legend>Precipitating</legend><textarea rows="3" style="width:100%" placeholder="Recent stressors, substances, medication changes"></textarea></fieldset>
    <fieldset><legend>Perpetuating</legend><textarea rows="4" style="width:100%" placeholder="Maintaining factors: avoidance, beliefs, sleep, environment, medical"></textarea></fieldset>
    <fieldset><legend>Protective</legend><textarea rows="3" style="width:100%" placeholder="Strengths, supports, coping skills, values"></textarea></fieldset>
    <fieldset><legend>Provisional Diagnoses & Probabilities</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Treatment Targets</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px"><label>Date<input type="date"></label><label>Clinician<input style="width:100%"></label></div>
  </form>
</section>`.trim();
    case "ddxmatrix":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Differential Diagnosis Matrix — Key Discriminators")}</header>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Diagnosis</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Onset/Course</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Hallmark/Peculiarities</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Tests/Measures</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Rule-outs</th>
    </tr></thead>
    <tbody>
      ${["Dx #1","Dx #2","Dx #3"].map(d=>`
        <tr>
          <td style="border:1px solid #d0d0d0;padding:6px 8px">${d}</td>
          <td style="border:1px solid #d0d0d0;padding:6px 8px"></td>
          <td style="border:1px solid #d0d0d0;padding:6px 8px"></td>
          <td style="border:1px solid #d0d0d0;padding:6px 8px"></td>
          <td style="border:1px solid #d0d0d0;padding:6px 8px"></td>
        </tr>`).join("")}
    </tbody>
  </table>
  <p style="font-size:12px;opacity:.8;margin-top:8px">Track pending tests and when a discriminator will become clear (time windows).</p>
</section>`.trim();
    case "medneuroflags":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Medical/Neurological Red Flags — Escalation Notes")}</header>
  <form>
    <fieldset><legend>Flag Present</legend><textarea rows="3" style="width:100%" placeholder="Describe the red flag and context"></textarea></fieldset>
    <fieldset><legend>Immediate Actions</legend><textarea rows="3" style="width:100%" placeholder="Escalation, consults, tests, monitoring"></textarea></fieldset>
    <fieldset><legend>Rationale</legend><textarea rows="3" style="width:100%" placeholder="Why urgent vs outpatient; risks of delay"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px"><label>Date<input type="date"></label><label>Handoff to<input style="width:100%"></label></div>
  </form>
</section>`.trim();
    case "maniaGate":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Mania/Hypomania Gate — Mixed Features Aware")}</header>
  <form>
    <fieldset><legend>Episode & Time Course</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Core Features</legend>${["Elevated/Irritable mood","Decreased need for sleep","Pressured speech","Flight of ideas","Goal-directed activity","Risky behaviors"].map(x=>`<label><input type="checkbox"/> ${x}</label>`).join("<br/>")}</fieldset>
    <fieldset><legend>Mixed Features</legend><textarea rows="3" style="width:100%" placeholder="Concurrent depressive features"></textarea></fieldset>
    <fieldset><legend>Rule-outs</legend><textarea rows="3" style="width:100%" placeholder="Substances/meds, medical, neuro"></textarea></fieldset>
    <fieldset><legend>Impairment/Safety</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
  </form>
</section>`.trim();
    case "psychosisPrimarySecondary":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Primary vs Secondary Psychosis — Outline")}</header>
  <form>
    <fieldset><legend>Phenomenology</legend><textarea rows="3" style="width:100%" placeholder="Delusions/hallucinations, negative symptoms, cognitive fluctuation"></textarea></fieldset>
    <fieldset><legend>Medical/Substance Contributors</legend><textarea rows="3" style="width:100%" placeholder="Steroids, anticholinergics, dopaminergics, intoxication/withdrawal, autoimmune, endocrine"></textarea></fieldset>
    <fieldset><legend>Workup Ordered</legend><textarea rows="3" style="width:100%" placeholder="Labs, tox, imaging, EEG as indicated; reasoning"></textarea></fieldset>
    <fieldset><legend>Provisional Impression</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
  </form>
</section>`.trim();
    case "anxietyNavigator":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Anxiety-Related Spectrum Navigator")}</header>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Domain</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">GAD</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Panic</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Social</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px">Agoraphobia</th>
    </tr></thead>
    <tbody>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Core fear/concern</td><td></td><td></td><td></td><td></td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Cue pattern</td><td></td><td></td><td></td><td></td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Avoidance</td><td></td><td></td><td></td><td></td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Key tests/ratings</td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>
</section>`.trim();
    case "adhdAdult":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Adult ADHD — Diagnostic Scaffold")}</header>
  <form>
    <fieldset><legend>Developmental History</legend><textarea rows="3" style="width:100%" placeholder="Symptoms before age 12; school reports; corroboration"></textarea></fieldset>
    <fieldset><legend>Current Symptoms</legend><textarea rows="3" style="width:100%" placeholder="Inattention, hyperactivity/impulsivity across settings"></textarea></fieldset>
    <fieldset><legend>Impairment</legend><textarea rows="3" style="width:100%" placeholder="Work/school/home, driving, finances"></textarea></fieldset>
    <fieldset><legend>Differential & Comorbidity</legend><textarea rows="3" style="width:100%" placeholder="Sleep, anxiety, depression, substance, bipolar, trauma"></textarea></fieldset>
    <fieldset><legend>Ratings Used</legend><textarea rows="2" style="width:100%" placeholder="ASRS v1.1, CAARS or local equivalents"></textarea></fieldset>
  </form>
</section>`.trim();
    case "autismAdult":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Autism (Adult) — Brief Triage")}</header>
  <form>
    <fieldset><legend>Social-Communication</legend><textarea rows="3" style="width:100%" placeholder="Reciprocity, nonverbal, relationships across contexts"></textarea></fieldset>
    <fieldset><legend>Restricted/Repetitive</legend><textarea rows="3" style="width:100%" placeholder="Interests, routines, sensory"></textarea></fieldset>
    <fieldset><legend>Developmental History & Informant</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Differential/Comorbidity</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Accommodations/Supports</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
  </form>
</section>`.trim();
    case "traitsVsDisorders":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Personality Traits vs Disorders — Clinical Frame")}</header>
  <form>
    <fieldset><legend>Severity/Impairment</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Pervasiveness & Stability</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Self & Interpersonal</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Risk & Safeguards</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Alternative Dimensional Notes</legend><textarea rows="3" style="width:100%" placeholder="DSM-5 Section III / ICD-11"></textarea></fieldset>
  </form>
</section>`.trim();
    case "provisionalDx":
      return `
<section class="mini-page print-friendly">
  <header>${H(title || "Provisional Diagnosis Builder — Specifiers & Severity")}</header>
  <form>
    <fieldset><legend>Diagnosis (DSM-5-TR/ICD-11)</legend><input style="width:100%"></fieldset>
    <fieldset><legend>Specifiers</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Severity</legend><textarea rows="2" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Rule-outs/Differentials</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Medical/Substance Contributors</legend><textarea rows="3" style="width:100%"></textarea></fieldset>
    <fieldset><legend>Plan to Confirm/Revise</legend><textarea rows="3" style="width:100%" placeholder="Tests, time windows, ratings, collateral"></textarea></fieldset>
    <div style="display:flex;gap:12px;margin-top:8px"><label>Date<input type="date"></label><label>Clinician<input style="width:100%"></label></div>
  </form>
</section>`.trim();
  }
  return '';
}


function synthesizeDxPrompts(topic: DxTopic, _title: string): { text: string }[] {
  const mk = (s:string)=>({ text: s });
  switch (topic) {
    case "fiveps":
      return [
        mk("Create a code in HTML as page for a 5 Ps Diagnostic Formulation with Presenting, Predisposing, Precipitating, Perpetuating, Protective sections and probability field."),
        mk("Compose a code in HTML as form that converts the 5 Ps into a structured APSO/SOAP note."),
        mk("Make a code in HTML to capture treatment targets linked to perpetuating factors."),
        mk("Create a code in HTML as page with signature/date and print-friendly layout."),
        mk("Compose a code in HTML to export a one-paragraph formulation summary."),
        mk("Make a code in HTML for a compact mobile version with collapsible sections.")
      ];
    case "ddxmatrix":
      return [
        mk("Create a code in HTML as page for a Differential Diagnosis Matrix with rows for diagnoses and columns for discriminators (onset, hallmark, tests, rule-outs)."),
        mk("Compose a code in HTML as form that highlights pending tests and due dates."),
        mk("Make a code in HTML to generate a summary paragraph comparing top three diagnoses."),
        mk("Create a code in HTML as page with color bands for probability levels."),
        mk("Compose a code in HTML that prints a one-page matrix."),
        mk("Make a code in HTML to append evidence/rating scale results to each row.")
      ];
    case "medneuroflags":
      return [
        mk("Create a code in HTML as form for Medical/Neurological Red Flags with immediate actions, consults, and handoff fields."),
        mk("Compose a code in HTML as page that logs rationale for urgent vs outpatient evaluation."),
        mk("Make a code in HTML to generate an escalation checklist with timestamps."),
        mk("Create a code in HTML as page for handoff summary to ED/ICU."),
        mk("Compose a code in HTML that prints a red-flag note with clinician signature."),
        mk("Make a code in HTML for a follow-up tracker of resolved/persisting flags.")
      ];
    case "maniaGate":
      return [
        mk("Create a code in HTML as page for a Mania/Hypomania Gate with mixed features capture and impairment/safety notes."),
        mk("Compose a code in HTML as form that flags substance/medication-induced states."),
        mk("Make a code in HTML to summarize episode features and DSM-5-TR criteria checkboxes."),
        mk("Create a code in HTML as page with a risk/disposition section."),
        mk("Compose a code in HTML that exports an episode timeline."),
        mk("Make a code in HTML for a collateral input block and corroboration status.")
      ];
    case "psychosisPrimarySecondary":
      return [
        mk("Create a code in HTML as page for Primary vs Secondary Psychosis with phenomenology, contributors, workup, and provisional impression."),
        mk("Compose a code in HTML as form that lists common medical/substance causes with checkboxes."),
        mk("Make a code in HTML to record imaging/EEG orders and results fields."),
        mk("Create a code in HTML as page to generate a clinical summary paragraph."),
        mk("Compose a code in HTML for a delirium quick screen block."),
        mk("Make a code in HTML for follow-up tasks after initial workup.")
      ];
    case "anxietyNavigator":
      return [
        mk("Create a code in HTML as page for an Anxiety Spectrum Navigator table comparing GAD, Panic, Social Anxiety, and Agoraphobia."),
        mk("Compose a code in HTML as form with cue pattern, avoidance, and rating scale fields."),
        mk("Make a code in HTML to output a differential summary paragraph."),
        mk("Create a code in HTML as page with patient education notes section."),
        mk("Compose a code in HTML to add specifier fields (e.g., with panic attacks)."),
        mk("Make a code in HTML for a printable one-page navigator.")
      ];
    case "adhdAdult":
      return [
        mk("Create a code in HTML as page for Adult ADHD diagnostic scaffold capturing childhood onset, cross-situational impairment, and differentials."),
        mk("Compose a code in HTML as form to enter ASRS scores and interpretation."),
        mk("Make a code in HTML to document comorbidity screen and sleep assessment."),
        mk("Create a code in HTML as page for functional impairment domains (work/school/home)."),
        mk("Compose a code in HTML that generates a concise diagnostic rationale."),
        mk("Make a code in HTML for a follow-up plan template.")
      ];
    case "autismAdult":
      return [
        mk("Create a code in HTML as page for Adult Autism brief triage with social-communication and RRB sections plus accommodations."),
        mk("Compose a code in HTML as form that records developmental history and informant details."),
        mk("Make a code in HTML to differentiate autism from ADHD/social anxiety/personality styles."),
        mk("Create a code in HTML as page for strengths-based support planning."),
        mk("Compose a code in HTML that prints a clinic handout summary."),
        mk("Make a code in HTML for a collateral questionnaire block.")
      ];
    case "traitsVsDisorders":
      return [
        mk("Create a code in HTML as page to distinguish personality traits vs disorders using severity, pervasiveness, stability, and risk."),
        mk("Compose a code in HTML as form that captures self/interpersonal dysfunction and impairment."),
        mk("Make a code in HTML to include DSM-5 Section III or ICD-11 dimensional notes."),
        mk("Create a code in HTML as page for risk management and crisis planning."),
        mk("Compose a code in HTML that generates a clinical summary paragraph."),
        mk("Make a code in HTML for a printable one-page frame.")
      ];
    case "provisionalDx":
      return [
        mk("Create a code in HTML as page for Provisional Diagnosis Builder with name, specifiers, severity, rule-outs, and contributors."),
        mk("Compose a code in HTML as form to track tests/time windows for confirmation."),
        mk("Make a code in HTML that outputs a structured diagnostic statement."),
        mk("Create a code in HTML as page with uncertainty and follow-up plan."),
        mk("Compose a code in HTML to print a one-page diagnostic sheet."),
        mk("Make a code in HTML for a signature/date and disclaimers block.")
      ];
  }
  return [];
}


function dxFallbackRefs(topic: DxTopic): RefLite[] {
  const R = (title:string, journal?:string, year?:string|number): RefLite => {
    const ref: RefLite = { title };
    if (journal) ref.journal = journal;
    if (year !== undefined) ref.year = year;
    return ref;
  };
  switch (topic) {
    case "fiveps":
      return [
        R("DSM-5-TR — Diagnostic formulation guidance", "American Psychiatric Association", 2022),
        R("ICD-11 Clinical descriptions and diagnostic guidelines", "WHO", 2019)
      ];
    case "ddxmatrix":
      return [
        R("Differential diagnosis in psychiatry: principles and practice", "Textbook/Review"),
        R("Structured clinical decision-making and diagnostic reasoning", "Review Article")
      ];
    case "medneuroflags":
      return [
        R("Delirium: Confusion Assessment Method (CAM)", "Ann Intern Med", 1990),
        R("Medical causes of psychiatric symptoms: review", "Primary Care/Neurology")
      ];
    case "maniaGate":
      return [
        R("DSM-5-TR Bipolar and Related Disorders", "APA", 2022),
        R("Mixed features in mood disorders: review", "Lancet Psychiatry/Review")
      ];
    case "psychosisPrimarySecondary":
      return [
        R("NICE Guideline: Psychosis and Schizophrenia in Adults", "NICE CG178/updates"),
        R("Medical mimics of psychosis: evaluation", "Review")
      ];
    case "anxietyNavigator":
      return [
        R("DSM-5-TR Anxiety Disorders", "APA", 2022),
        R("NICE Guidance: Anxiety disorders", "NICE")
      ];
    case "adhdAdult":
      return [
        R("NICE NG87: Attention Deficit Hyperactivity Disorder", "NICE", 2018),
        R("DSM-5-TR ADHD diagnostic criteria", "APA", 2022)
      ];
    case "autismAdult":
      return [
        R("NICE CG142: Autism spectrum disorder in adults", "NICE"),
        R("ICD-11 Autism spectrum disorder", "WHO", 2019)
      ];
    case "traitsVsDisorders":
      return [
        R("DSM-5 Section III Alternative Model for Personality Disorders", "APA", 2013/2022),
        R("ICD-11 Personality Disorder severity model", "WHO", 2019)
      ];
    case "provisionalDx":
      return [
        R("DSM-5-TR — Specifiers and severity use", "APA", 2022),
        R("ICD-11 coding rules for mental disorders", "WHO", 2019)
      ];
  }
  return [];
}
export type CardAugmented = Card & {
  html?: string; descriptionHtml?: string; plain?: string; examples?: { id?: string; label?: string; html?: string }[]; prompts?: { label?: string; text?: string }[]; evidence?: { title?: string; year?: string | number; journal?: string }[];
};
export function buildInfo(card: CardAugmented, profile: ProfileKey): string {
  const authored = (card.summary || '').trim();
  if (profile === 'dx.formulation') {
    const topic = dxTopicFromTitle(card.title || '');
    if (topic) return buildDxInfo(topic);
  }

  if (profile === 'risk.safety') {
    const topic = riskTopicFromTitle(card.title || '');
    if (topic) {
      return buildRiskInfo(topic);
    }
  }
  if (authored && authored.length > 320) {

    return authored;
  }

  const expanded = defaultInfoExpanded(profile, card.title || '');
  const fallbackSource = (card.descriptionHtml && card.descriptionHtml.length > 120)
    ? card.descriptionHtml
    : expanded;
  return fallbackSource;
}


function escapeHtml(s: string) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
const wrapMiniPage = (title: string, inner: string) => `<section class="mini-page print-friendly"><header><h2>${escapeHtml(title || 'Example')}</h2></header>${inner}</section>`;
function exMbcAutoscore(card: Card) {

  const measure = (function(){
    const m = measureOf(card);
    return (m ?? 'phq9') as 'phq9'|'gad7'|'pcl5'|'ybocs'|'auditc';
  })();
  return renderAutoscoreHTML(measure, []);
}

function exTriageRisk(card: Card) {
  return `
<section class="mini-page print-friendly">
  <header><h2>${escapeHtml(card.title || 'Suicide Risk Triage')}</h2></header>
  <form>
    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">C-SSRS Screener (abbrev.)</legend>
      <label style="display:block;margin:6px 0">Wish to be dead?
        <select required><option></option><option>No</option><option>Yes</option></select>
      </label>
      <label style="display:block;margin:6px 0">Suicidal thoughts?
        <select required><option></option><option>No</option><option>Yes</option></select>
      </label>
      <label style="display:block;margin:6px 0">Intent with plan?
        <select required><option></option><option>No</option><option>Yes</option></select>
      </label>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Protective Factors</legend>
      <textarea placeholder="Supports, reasons for living, coping skills" rows="3" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Disposition</legend>
      <label><input type="radio" name="disp" required /> Outpatient with safety plan</label><br/>
      <label><input type="radio" name="disp" /> Urgent specialty evaluation</label><br/>
      <label><input type="radio" name="disp" /> Emergency care / hospitalization</label>
    </fieldset>

    <h3>Stanley–Brown Safety Plan (brief)</h3>
    ${bullets([
      'Warning signs',
      'Internal coping strategies',
      'Social contacts & settings for distraction',
      'Family/friends for help',
      'Clinicians/agencies for emergencies',
      'Means restriction'
    ])}

    <p style="margin-top:12px"><em>Use clinical judgement; follow local protocols.</em></p>
  </form>
</section>`.trim();
}

function exIntakeAdult(card: Card) {
  return `
<section class="mini-page print-friendly">
  <header><h2>${escapeHtml(card.title || 'Intake & HPI — Structured Template')}</h2></header>
  <form>
    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Identification</legend>
      <label style="display:block;margin:6px 0">Full name * <input required style="width:100%"/></label>
      <label style="display:block;margin:6px 0">DOB * <input type="date" required/></label>
      <label style="display:block;margin:6px 0">MRN / ID <input style="width:100%"/></label>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Chief Complaint & HPI</legend>
      <input placeholder="Chief complaint" style="width:100%;margin:6px 0"/>
      <textarea rows="5" placeholder="Onset, duration, precipitants, course, severity, context, modifiers" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Past Psychiatric / Medical</legend>
      <textarea rows="3" placeholder="Diagnoses, hospitalizations, therapy, trials, adverse effects" style="width:100%"></textarea>
      <textarea rows="3" placeholder="Medical history, allergies, current medications" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Substance Use & Social</legend>
      <textarea rows="3" placeholder="Alcohol, tobacco, illicit/prescription misuse, withdrawal risk" style="width:100%"></textarea>
      <textarea rows="3" placeholder="Living situation, supports, work/school, legal, trauma" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Risk Screen</legend>
      <label>Suicide: <select required><option></option><option>None</option><option>Low</option><option>Moderate</option><option>High</option></select></label>
      <label style="margin-left:12px">Violence: <select required><option></option><option>None</option><option>Low</option><option>Moderate</option><option>High</option></select></label>
      <label style="margin-left:12px">Neglect: <select required><option></option><option>None</option><option>Possible</option><option>Likely</option></select></label>
      <textarea rows="3" placeholder="Risk formulation, protective factors, means" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Mental Status Exam</legend>
      <textarea rows="5" placeholder="Appearance, behavior, speech, mood/affect, thought process/content, perception, cognition, insight/judgement" style="width:100%"></textarea>
    </fieldset>

    <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:12px;margin:8px 0">
      <legend style="font-weight:600">Assessment & Plan</legend>
      <textarea rows="4" placeholder="Dx hypothesis; differentials; medical considerations" style="width:100%"></textarea>
      <textarea rows="4" placeholder="Plan: safety, labs/consults, meds/therapy, follow-up interval, education" style="width:100%"></textarea>
    </fieldset>

    <div style="display:flex;gap:12px;margin-top:8px">
      <label style="flex:1">Clinician signature<input placeholder="Name, credentials" style="width:100%"/></label>
      <label>Date <input type="date"/></label>
    </div>
  </form>
  <p style="font-size:12px;opacity:.8;margin-top:8px">Use clinical judgement; follow local protocols.</p>
</section>`.trim();
}

function exMedsFirstline(card: Card) {
  return `
<section class="mini-page print-friendly">
  <header><h2>${escapeHtml(card.title || 'First-line Antidepressants')}</h2></header>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="border:1px solid #d0d0d0;padding:6px 8px;text-align:left">Agent</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px;text-align:left">Start</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px;text-align:left">Typical titration</th>
      <th style="border:1px solid #d0d0d0;padding:6px 8px;text-align:left">Notes/monitor</th>
    </tr></thead>
    <tbody>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Sertraline</td><td style="border:1px solid #d0d0d0;padding:6px 8px">25–50 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">↑ q1–2w to 100–200 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">GI, activation; pregnancy OK</td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Escitalopram</td><td style="border:1px solid #d0d0d0;padding:6px 8px">5–10 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">↑ q1–2w to 10–20 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">QTc at high dose/risks</td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px 8px">Venlafaxine XR</td><td style="border:1px solid #d0d0d0;padding:6px 8px">37.5–75 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">↑ q1–2w to 150–225 mg</td><td style="border:1px solid #d0d0d0;padding:6px 8px">BP, activation, withdrawal</td></tr>
    </tbody>
  </table>
  <p style="font-size:12px;opacity:.8;margin-top:8px">Use clinical judgement; follow local protocols.</p>
</section>`.trim();
}
function exBigFiveTR(){ return `<h2>Big Five Sample Form</h2><p>Example short form (English only).</p>`; }
function cryptoLikeId(){ return `v-${Math.random().toString(36).slice(2,8)}`; }
function stripTemplateSyntax(html: string): string { return html ? html.replace(/\{\{[^}]+\}\}/g,'') : ''; }
function normalizeVariant(ex: { id?: string; label?: string; html?: string }): ExampleVariant | null { const id = ex.id || cryptoLikeId(); const label = ex.label || 'Variant'; const raw = (ex.html||'').trim(); if(!raw) return null; return { id, label, html: wrapMiniPage(label, stripTemplateSyntax(raw)) }; }
function synthesizeExamples(profile: ProfileKey, title: string): ExampleVariant[] {
  switch(profile){
    case 'dx.formulation': {
      const topic = dxTopicFromTitle(title || '') || 'fiveps';

      const primary = { id:`dx-${topic}`, label:'Structured Formulation', html: exDxExample(topic, title) };
      const narrative = {
        id:'dx-narrative-mechanistic',
        label:'Mechanistic Narrative',
        html: `<article style='font-size:13px;line-height:1.5'>
  <h3>Mechanistic Narrative Formulation</h3>
  <p><strong>Integrative synthesis</strong> translating 5 Ps data into causal / maintaining loops and modifiable intervention leverage points. This narrative emphasizes testable hypotheses.</p>
  <ol style='margin-left:18px'>
    <li><strong>Phenomenologic core:</strong> Depressive syndrome with anxious arousal; moderate severity (PHQ‑9 18, GAD‑7 15).</li>
    <li><strong>Predisposition:</strong> Familial mood loading + early inconsistent attachment → schema of conditional worth; anxious/avoidant temperament.</li>
    <li><strong>Precipitant:</strong> Occupational role ambiguity + progressive circadian drift (late screen use) → sleep fragmentation.</li>
    <li><strong>Perpetuation mechanisms:</strong> Behavioral inactivity → diminished reward density; rumination → cognitive resource depletion; insomnia → affective lability; negative prediction bias reinforcing avoidance.</li>
    <li><strong>Protective buffers:</strong> Stable partner support, prior CBT skill familiarity, prosocial value system, intact executive function baseline.</li>
  </ol>
  <h4>Hypothesized Causal Loop (Simplified)</h4>
  <p><em>Sleep phase delay → Morning fatigue → Reduced activation scheduling → Lower positive reinforcement → Mood constriction → Cognitive narrowing → Rumination at night → Further sleep delay.</em></p>
  <h4>Change Levers</h4>
  <ul style='margin-left:18px'>
    <li>Chronotherapy + stimulus control to realign circadian phase.</li>
    <li>Structured activity scheduling to restore reward sampling.</li>
    <li>Metacognitive rumination interruption practices.</li>
    <li>Values-based approach activation for motivational salience.</li>
  </ul>
  <h4>Probability / Diagnostic Clarifications</h4>
  <p>Bipolar II remains &lt;15% given absence of syndromic hypomanic episodes on collateral review; monitor longitudinal mood chart before escalation to that pathway.</p>
  <h4>Prognostic Considerations</h4>
  <p>High response likelihood due to preserved psychosocial supports and early engagement; watch for insomnia plateau and residual anergia which predict slower remission.</p>
  <p style='font-size:11px;opacity:.7'>Educational narrative template.</p>
</article>`
      };
      const bayesian = {
        id:'dx-bayesian-differential',
        label:'Bayesian Differential Table',
        html:`<section aria-label='Bayesian Differential'>
  <h3>Bayesian Differential (Illustrative)</h3>
  <table style='width:100%;border-collapse:collapse;font-size:12.5px'>
    <thead><tr><th style='border:1px solid #ccc;padding:4px'>Diagnosis</th><th style='border:1px solid #ccc;padding:4px'>Pre‑test %</th><th style='border:1px solid #ccc;padding:4px'>Key Evidence (LR+ / LR-)</th><th style='border:1px solid #ccc;padding:4px'>Posterior % (Est)</th><th style='border:1px solid #ccc;padding:4px'>Pending Data</th></tr></thead>
    <tbody>
      <tr><td style='border:1px solid #ccc;padding:4px'>Major Depressive Disorder</td><td style='border:1px solid #ccc;padding:4px'>55</td><td style='border:1px solid #ccc;padding:4px'>Sustained dysphoria; anhedonia; diurnal variation (LR+ ~3)</td><td style='border:1px solid #ccc;padding:4px'>~75</td><td style='border:1px solid #ccc;padding:4px'>Sleep log stabilization</td></tr>
      <tr><td style='border:1px solid #ccc;padding:4px'>Persistent Depressive Disorder</td><td style='border:1px solid #ccc;padding:4px'>25</td><td style='border:1px solid #ccc;padding:4px'>Chronic low mood history &gt;2y (LR+ ~4), partial intervals</td><td style='border:1px solid #ccc;padding:4px'>~30</td><td style='border:1px solid #ccc;padding:4px'>Collateral adolescence</td></tr>
      <tr><td style='border:1px solid #ccc;padding:4px'>Bipolar II (Rule‑Out)</td><td style='border:1px solid #ccc;padding:4px'>20</td><td style='border:1px solid #ccc;padding:4px'>Absence of hypomanic episodes (LR- strong)</td><td style='border:1px solid #ccc;padding:4px'>~12</td><td style='border:1px solid #ccc;padding:4px'>Longitudinal mood chart</td></tr>
    </tbody>
  </table>
  <p style='font-size:11px;opacity:.7;margin-top:6px'>Posterior estimates illustrative; formal Bayesian updating requires validated likelihood ratios.</p>
</section>`
      };
      const riskBridge = {
        id:'dx-risk-bridge',
        label:'Risk Bridge Snapshot',
        html:`<section aria-label='Risk Bridge'><h3>Risk & Disposition Bridge</h3><p>Concise articulation translating formulation insights into risk mitigation plan.</p><ul style='margin-left:18px;font-size:13px;line-height:1.4'><li><strong>Dynamic factors:</strong> Insomnia, social withdrawal, ruminative amplification.</li><li><strong>Static factors:</strong> Family mood disorder history.</li><li><strong>Protective:</strong> Partner support, treatment engagement, articulated future goals.</li><li><strong>Plan:</strong> Sleep stabilization within 2 weeks; weekly activation KPI review; safety check each visit.</li></ul><p style='font-size:11px;opacity:.65'>Educational scaffold.</p></section>`
      };
      return [primary, narrative, bayesian, riskBridge];
    }
    case 'risk.safety': {
      const topic = riskTopicFromTitle(title || '') || 'agitation';
      return [{ id:`risk-${topic}`, label:'Risk/Safety Example', html: exRiskExample(topic, title) }];
    }
    case 'mbc.autoscore': return [{ id:'autoscore-phq9-gad7', label:'PHQ-9 + GAD-7', html: exMbcAutoscore({ title } as Card) }];
    case 'triage.risk': return [{ id:'safe-t-cssrs', label:'SAFE-T + C-SSRS', html: exTriageRisk({ title } as Card) }];
    case 'intake.adult': return [{ id:'adult-intake-brief', label:'Adult Intake (Brief)', html: exIntakeAdult({ title } as Card) }];
    case 'assessment.bigfive': return [{ id:'big5-tr', label:'Big Five (TR) — Sample', html: exBigFiveTR() }];
    case 'meds.firstline': return [{ id:'firstline', label:'First-Line Example', html: exMedsFirstline({ title } as Card) }];
    default: return [{ id:'default', label:'Default', html:`<p>${escapeHtml(title)} — print-friendly example page.</p>` }];
  }
}


type AutoscoreFixture = { answers: number[]; opts?: { title?: string; patient?: string; date?: string; sex?: 'M'|'F'|'Other' } };
const autoscoreFixtures: Record<'phq9'|'gad7'|'pcl5'|'ybocs'|'auditc', { sample: AutoscoreFixture }> = {
  phq9: { sample: { answers: [2,2,3,2,1,2,1,1,1], opts:{ title: 'PHQ-9 — Sample' } } },
  gad7: { sample: { answers: [2,2,1,2,2,2,2], opts:{ title: 'GAD-7 — Sample' } } },
  pcl5: { sample: { answers: [3,1,2,0,1,2,0,2,2,1,2,1,2,0,2,2,1,2,0,2], opts:{ title: 'PCL-5 — Sample' } } },
  ybocs:{ sample: { answers: [2,2,1,2,3,2,1,2,2,2], opts:{ title: 'Y-BOCS — Sample' } } },
  auditc:{ sample: { answers: [3,2,4], opts:{ title: 'AUDIT-C — Sample', sex:'M' } } }
};
const measureOf = (card: Card): 'phq9'|'gad7'|'pcl5'|'ybocs'|'auditc'|null => {
  const tags = (card.tags || []).map(t=>t.toLowerCase());
  if (tags.includes('phq9')) return 'phq9';
  if (tags.includes('gad7')) return 'gad7';
  if (tags.includes('pcl5')) return 'pcl5';
  if (tags.includes('ybocs')) return 'ybocs';
  if (tags.includes('auditc') || tags.includes('audit-c')) return 'auditc';
  return null;
};

function buildExamples(card: CardAugmented, profile: ProfileKey): { examples: ExampleVariant[]; defaultExampleId: string | null } {
  const authoredRaw = Array.isArray(card.examples) ? card.examples : [];
  const authored = authoredRaw.map(v => normalizeVariant(v)).filter(Boolean) as ExampleVariant[];
  if(authored.length){ return { examples: authored, defaultExampleId: authored[0].id }; }
  const legacyHtml = card.html || card.descriptionHtml;
  if(legacyHtml && String(legacyHtml).trim().length){
    const v = normalizeVariant({ id:'default', label:'Default', html:String(legacyHtml) });
    if(v) return { examples:[v], defaultExampleId: v.id };
  }
  if(profile === 'mbc.autoscore'){
    const m = measureOf(card);
    if (m) {
      const { sample } = autoscoreFixtures[m];
      const html = renderAutoscoreHTML(m, sample.answers, sample.opts);
      const ex: ExampleVariant = { id: `ex-${m}`, label: m.toUpperCase(), html };
      return { examples: [ex], defaultExampleId: ex.id };
    }
  }
  const synth = synthesizeExamples(profile, card.title || 'Example');
  return { examples: synth, defaultExampleId: synth[0]?.id ?? null };
}


function dedupeRefs(list: RefLite[]): RefLite[] { const seen = new Set<string>(); const out: RefLite[] = []; for(const r of list){ const k=r.title.toLowerCase(); if(!seen.has(k)){ seen.add(k); out.push(r);} } return out; }
function fallbackRefs(profile: ProfileKey): RefLite[] {
  switch(profile){
    case 'tx.plan': return [
      { title:"There's a S.M.A.R.T. way to write management's goals and objectives", year:'1981', journal:'Management Review', kind:'overview', authors:['Doran G.T.'] },
      { title:'Writing SMART rehabilitation goals and achieving goal attainment scaling', year:'2009', journal:'Clinical Rehabilitation, 23(4), 352–361', kind:'overview', authors:["Bovend'Eerdt T.J.H.", 'Botell R.E.', 'Wade D.T.'] },
      { title:'Practice Guideline for the Treatment of Patients with Major Depressive Disorder (4th ed.)', year:'2023', journal:'American Psychiatric Association', kind:'guideline', authors:['APA'] },
      { title:'Severity classification and remission in major depressive disorder', year:'2008', journal:'Acta Psychiatrica Scandinavica', kind:'validation', authors:['Zimmerman M.','Martinez J.H.','Young D.'] },
      { title:'A tipping point for measurement‑based care', year:'2017', journal:'Psychiatric Services, 68(2), 179–188', kind:'implementation', authors:['Fortney J.C.','Unützer J.','Wrenn G.'] },
      { title:'Depression in adults: treatment and management (NG222)', year:'2022', journal:'NICE Guideline', kind:'guideline', authors:['NICE'] }
    ];
    case 'mbc.autoscore': return [
      { title:'The PHQ-9: Validity of a brief depression severity measure', year:'2001', journal:'Journal of General Internal Medicine, 16(9), 606–613', kind:'validation', authors:['Kroenke K.','Spitzer R.L.','Williams J.B.W.'] },
      { title:'A brief measure for assessing generalized anxiety disorder (GAD-7)', year:'2006', journal:'Archives of Internal Medicine, 166(10), 1092–1097', kind:'validation', authors:['Spitzer R.L.','Kroenke K.','Williams J.B.W.','Löwe B.'] },
      { title:'Tipping point for measurement-based care in behavioral health', year:'2017', journal:'Psychiatric Services, 68(2), 179–188', kind:'implementation', authors:['Fortney J.C.','Unützer J.','Wrenn G.','Pyne J.M.','Smith G.R.','Schoenbaum M.','Harbin H.T.'] },
    ];
    case 'mbc.change': return [
      { title:'Clinical significance: A statistical approach to defining meaningful change', year:'1991', journal:'Journal of Consulting and Clinical Psychology, 59(1), 12–19', kind:'guideline', authors:['Jacobson N.S.','Truax P.'] },
      { title:'Minimal clinically important difference concepts (anchor vs distribution)', year:'1989', journal:'Journal of Clinical Epidemiology, 42(8), 703–708', kind:'guideline', authors:['Jaeschke R.','Singer J.','Guyatt G.H.'] },
      { title:'Tipping point for measurement-based care in behavioral health', year:'2017', journal:'Psychiatric Services, 68(2), 179–188', kind:'implementation', authors:['Fortney J.C.','Unützer J.','Wrenn G.','Pyne J.M.','Smith G.R.','Schoenbaum M.','Harbin H.T.'] },
      { title:'Using measurement-based care to treat depression', year:'2015', journal:'Journal of Clinical Psychiatry, 76(9), e1159–e1165', kind:'overview', authors:['Guo T.','Xi Y.','Xiong J.'] },
    ];
    case 'triage.risk': return [
      { title:'The Columbia–Suicide Severity Rating Scale: Initial validity and internal consistency findings', year:'2011', journal:'American Journal of Psychiatry, 168(12), 1266–1277', kind:'validation', authors:['Posner K.','Brown G.K.','Stanley B.','Brent D.A.','Yershova K.V.','Oquendo M.A.','Currier G.W.','Melvin G.A.','Greenhill L.','Shen S.','Mann J.J.'] },
      { title:'SAFE-T: Suicide Assessment Five-Step Evaluation and Triage (clinician pocket card)', year:'2009', journal:'Substance Abuse and Mental Health Services Administration (SAMHSA)', kind:'guideline', authors:['SAMHSA'] },
    ];
    case 'risk.safety': return [
      { title:'Safety planning intervention: A brief intervention to mitigate suicide risk', year:'2012', journal:'Cognitive and Behavioral Practice, 19(2), 256–264', kind:'safety', authors:['Stanley B.','Brown G.K.'] },
      { title:'HCR-20V3: Assessing risk for violence—User guide', year:'2013', journal:'Mental Health, Law, and Policy Institute, Simon Fraser University', kind:'guideline', authors:['Douglas K.S.','Hart S.D.','Webster C.D.','Belfrage H.'] },
    ];
    case 'meds.firstline': return [
      { title:'Canadian Network for Mood and Anxiety Treatments (CANMAT) 2016 clinical guidelines for the management of adults with MDD', year:'2016', journal:'Canadian Journal of Psychiatry, 61(9), 510–560', kind:'guideline', authors:['Kennedy S.H.','Lam R.W.','McIntyre R.S.','Tourjman S.V.','Bhat V.','Blier P.'] },
      { title:'Practice guideline for the treatment of patients with major depressive disorder (3rd ed.)', year:'2010', journal:'American Psychiatric Association', kind:'guideline', authors:['American Psychiatric Association'] },
      { title:'Antidepressant use in children, adolescents, and adults: FDA advisory', year:'2007', journal:'U.S. Food and Drug Administration', kind:'safety', authors:['FDA'] },
    ];
    case 'intake.adult': return [
      { title:'The psychiatric evaluation of adults: Practice guideline (3rd ed.)', year:'2016', journal:'American Psychiatric Association', kind:'guideline', authors:['American Psychiatric Association'] },
      { title:'Practice guideline for the assessment and treatment of patients with suicidal behaviors', year:'2003', journal:'American Psychiatric Association', kind:'guideline', authors:['American Psychiatric Association'] },
      { title:'Violence risk assessment principles (HCR-20 framework summary)', year:'2013', journal:'Douglas et al. HCR-20V3 User Guide', kind:'guideline', authors:['Douglas K.S.','Hart S.D.','Webster C.D.','Belfrage H.'] },
      { title:'The Psychiatric Mental Status Examination', year:'1993', journal:'Oxford University Press', kind:'overview', authors:['Trzepacz P.T.','Baker R.W.'] },
      { title:'Medical records, patient care, and research: The problem-oriented record as a basic tool (SOAP/APSO)', year:'1968', journal:'JAMA, 199(8), 619–626', kind:'implementation', authors:['Weed L.L.'] },
    ];
    default: return [{ title:'Clinical guideline summary for this topic', kind:'overview' }];
  }
}
function classifyKind(title: string): RefLite['kind'] {
  const tl = title.toLowerCase();
  if(/validation|psychometric|reliability/.test(tl)) return 'validation';
  if(/guideline|recommendation|consensus/.test(tl)) return 'guideline';
  if(/implementation|workflow/.test(tl)) return 'implementation';
  if(/overview|summary/.test(tl)) return 'overview';
  if(/safety|risk|plan/.test(tl)) return 'safety';
  return 'other';
}

function joinAuthors(authors: string[]): string {
  if(!authors.length) return '';
  if(authors.length === 1) return authors[0];
  if(authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors.slice(0, authors.length - 1).join(', ')}, & ${authors[authors.length - 1]}`;
}
export function formatApa(ref: RefLite): string {
  const parts: string[] = [];
  if(ref.authors && ref.authors.length) parts.push(joinAuthors(ref.authors));
  if(ref.year) parts.push(`(${ref.year}).`);
  const title = ref.title.replace(/\.$/, '');
  parts.push(`${title}.`);
  if(ref.journal) parts.push(`${ref.journal}.`);
  return parts.join(' ');
}

function buildReferences(card: CardAugmented, profile: ProfileKey): RefLite[] {
  if (profile === 'dx.formulation') {
    const topic = dxTopicFromTitle(card.title || '');
    const evRaw = card.evidence;
    const authored: RefLite[] = Array.isArray(evRaw)
      ? evRaw.map(e => {
          const title = (e.title || '').trim();
          if(!title) return null;
          const obj: RefLite = { title };
          if(e.year !== undefined && e.year !== null && e.year !== '') obj.year = e.year as string | number;
          if(e.journal) obj.journal = e.journal;
          const k = classifyKind(title); if(k) obj.kind = k;
          return obj;
        }).filter((r): r is RefLite => !!r)
      : [];
    const fallbacks = topic ? dxFallbackRefs(topic) : [];
    return dedupeRefs([...authored, ...fallbacks]).slice(0,8);
  }
  if (profile === 'risk.safety') {
    const topic = riskTopicFromTitle(card.title || '');
    const evRaw = card.evidence;
    const authored: RefLite[] = Array.isArray(evRaw)
      ? evRaw.map(e => {
          const title = (e.title || '').trim();
          if(!title) return null;
          const obj: RefLite = { title };
          if(e.year !== undefined && e.year !== null && e.year !== '') obj.year = e.year as string | number;
          if(e.journal) obj.journal = e.journal;
          const k = classifyKind(title); if(k) obj.kind = k;
          return obj;
        }).filter((r): r is RefLite => !!r)
      : [];
    const fallbacks = topic ? riskFallbackRefs(topic) : [];
    return dedupeRefs([...authored, ...fallbacks]).slice(0,8);
  }
  const evRaw = card.evidence;
  const authored: RefLite[] = Array.isArray(evRaw)
    ? evRaw
        .map(e => {
          const title = (e.title || '').trim();
          if(!title) return null;
            const obj: RefLite = { title };
            if(e.year !== undefined && e.year !== null && e.year !== '') obj.year = e.year as string | number;
            if(e.journal) obj.journal = e.journal;
      const k = classifyKind(title); if(k) obj.kind = k;
            return obj;
        })
        .filter((r): r is RefLite => !!r)
    : [];
  const fallbacks = fallbackRefs(profile);
  return dedupeRefs([ ...authored, ...fallbacks ]).slice(0, 8);
}

const pickAuthoredText = (p: { label?: string; text?: string; template?: string } | string): string => {
  if (typeof p === 'string') return p.trim();
  const t = (p.template || p.text || p.label || '').trim();
  return t;
};
function dedupeCmds(list: CmdLite[]): CmdLite[]{ const seen=new Set<string>(); const out: CmdLite[]=[]; for(const c of list){ const k=(c.text||'').toLowerCase(); if(!seen.has(k)){ seen.add(k); out.push(c);} } return out; }
function synthesizeCommands(profile: ProfileKey, title: string): CmdLite[] {
  const T = (title || 'this item').trim();
  const mk = (s: string) => ({ text: s });

  switch (profile) {
    case 'tx.plan': {

      return [
        mk('Draft SMART goals from a problem list with baseline, current, and target metrics; include one measurable outcome per goal (≤120 words).'),
        mk('Propose a stepped-care follow-up cadence and monitoring plan based on severity bands and risk.'),
        mk('Document a Shared Decision-Making (SDM) summary: options discussed, patient values/preferences, chosen plan, and follow-up.'),
        mk('Recommend level of care (OP/IOP/PHP/Inpatient) with a 2–3 sentence justification tied to risk, function, supports, and medical complexity.'),
        mk('Compose a relapse-prevention plan with Green/Yellow/Red sections, triggers, early signs, and concrete first-day actions.'),
        mk('Generate a patient-friendly one-paragraph summary of the treatment plan and next steps (≤120 words).')
      ];
    }
    case 'dx.formulation': {
      const topic = dxTopicFromTitle(title || '');
      if (topic) return synthesizeDxPrompts(topic, title).map(p => ({ text: p.text }));
      return [
        mk('Create a code in HTML as page for a Diagnostic Formulation template with Presenting, Differential, and Provisional Dx sections.'),
        mk('Compose a code in HTML as form capturing 5 Ps factors and generating a summary paragraph.'),
        mk('Make a code in HTML for a Differential Matrix with ability to mark pending tests.'),
        mk('Create a code in HTML as page for Medical/Neurological Red Flags with actions and rationale fields.'),
        mk('Compose a code in HTML to build a Provisional Diagnosis statement including specifiers and severity.'),
        mk('Make a code in HTML to export a clinician-facing summary and a patient-friendly version.')
      ];
    }
    case 'intake.adult':
      return [
        mk('Create a code in HTML as form for a Psychiatric Intake with sections: Identification, Chief Complaint, HPI, Past Psych & Medical, Substance Use, Risk, MSE, Assessment & Plan; include required validation and print-friendly styles.'),
        mk('Compose an HTML page that turns captured Intake fields into an APSO/SOAP note with headings and bullet points.'),
        mk('Make a code in HTML to embed a brief C-SSRS suicide risk triage with disposition choices and notes.'),
        mk('Create a code in HTML as page for a Stanley–Brown style Safety Plan (6 steps, signature/date blocks).'),
        mk('Compose an HTML consent/capacity checklist that can be included inside the Intake page.'),
        mk('Make a code in HTML for a follow-up appointment summary that reuses Intake fields and adds response/remission placeholders.')
      ];
    case 'mbc.autoscore':
      return [
        mk('Create a code in HTML as page for PHQ-9 auto-scoring with severity band, Item 9 safety flag, and clinician summary.'),
        mk('Compose a code in HTML as page for GAD-7 auto-scoring with anchors and interpretation text.'),
        mk('Make a code in HTML as page for PCL-5 auto-scoring with item breakdown table.'),
        mk('Create a code in HTML as form for Y-BOCS severity capture with computed total and band.'),
        mk('Compose a code in HTML as page for AUDIT-C with sex-specific positive thresholds and counseling prompts.'),
        mk('Make an HTML page that compares baseline vs follow-up scores and highlights response/remission thresholds.')
      ];
    case 'risk.safety':
      {
        const topic = riskTopicFromTitle(title || '');
        if (topic) return synthesizeRiskPrompts(topic, title).map(p=> ({ text: p.text }));
        return [
          mk('Create a code in HTML as page for a comprehensive Safety Plan (warning signs, coping, contacts, means restriction, crisis numbers).'),
          mk('Compose a code in HTML for a Violence Risk quick form with static SPJ headings and notes.'),
          mk('Make a code in HTML for a Lethal Means assessment checklist with action items.'),
          mk('Create a code in HTML as page for Capacity & Consent documentation with Yes/No criteria and rationale field.'),
          mk('Compose a code in HTML for an Emergency Disposition checklist (home vs urgent vs ED/inpatient) with criteria.'),
          mk('Make a code in HTML as page for a Patient Instructions handout block ready to print.')
        ];
      }
    case 'meds.firstline':
      return [
        mk('Create a code in HTML as page with a first-line SSRI/SNRI dosing & titration table, including monitoring notes and cautions.'),
        mk('Compose an HTML page for a side-effect monitoring checklist (GI, activation, sexual, sleep) with weekly tick boxes.'),
        mk('Make a code in HTML for a Pregnancy/Lactation considerations panel referencing medication categories.'),
        mk('Create a code in HTML as page for drug–drug interaction warnings with placeholders for QTc and CYP notes.'),
        mk('Compose an HTML page that generates a clinician summary paragraph from selected medication and dose.'),
        mk('Make a code in HTML for a 4-week follow-up plan template with goals and safety checks.')
      ];
    default:
      return [
        mk(`Create a code in HTML as form or page for ${T}, with accessible <form>/<fieldset>/<label> structure and print-friendly layout.`),
        mk('Compose an HTML page that turns captured fields into a structured clinical summary.'),
        mk('Make a code in HTML for a patient-friendly handout block with headings and bullets.'),
        mk('Create an HTML page with a signature/date block and disclaimer.'),
        mk('Compose a code in HTML for a compact one-pager version of this topic.'),
        mk('Make an HTML checklist with required fields and validation.')
      ];
  }
}
function buildCommands(card: CardAugmented, profile: ProfileKey): CmdLite[] {
  type PromptLike = { label?: string; text?: string };
  const authored = Array.isArray(card.prompts)
    ? (card.prompts as (PromptLike & { template?: string })[])
        .map(p => pickAuthoredText(p))
        .filter(Boolean)
    : [];
  const authoredCmds = authored.map(text => ({ text }));

  if (profile === 'tx.plan') {
    if (authoredCmds.length >= 1) {
      const topUp = synthesizeCommands(profile, card.title || 'this item');
      return dedupeCmds([ ...authoredCmds, ...topUp ]).slice(0,6);
    }
  }
  if (authoredCmds.length >= 3) return authoredCmds.slice(0,6);
  const gen = synthesizeCommands(profile, card.title || 'this item');
  return dedupeCmds([...authoredCmds, ...gen]).slice(0,6);
}

export function assembleFourBlock(card: Card | null): Assembled {
  if(!card){
    return { info:'Select an item to view clinical context, an example, references, and ready commands. Use clinical judgement; follow local protocols.', examples:[], defaultExampleId:null, references:[], commands:[] };
  }
  try {
    const c = card as CardAugmented;
    const profile = detectProfile(c);
    const info = buildInfo(c, profile);
    const { examples, defaultExampleId } = buildExamples(c, profile);
    const references = buildReferences(c, profile);
    const commands = buildCommands(c, profile);

    try {
      if (localStorage.getItem('psych.debug.panel') === 'on') {
        console.warn('[rp-assemble]', c.id, { tags: c.tags, hasHtml: !!c.html, evidence: c.evidence ? c.evidence.length : 0 });
      }
    } catch {}
    return { info, examples, defaultExampleId, references, commands };
  } catch(e){
    console.warn('[assembleFourBlock] error', e);
    return { info:'Select an item to view clinical context, an example, references, and ready commands. Use clinical judgement; follow local protocols.', examples:[], defaultExampleId:null, references:[], commands:[] };
  }
}


export function mapPsychotherapyItemToFourBlocks(item: PsychotherapyItem) {
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapMedicationItemToFourBlocks(item: MedItem) {
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapMedOrderItemToFourBlocks(item: MedOrderItem) {
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapFollowUpItemToFourBlocks(item: FollowItem) {
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}


export function mapEduItemToFourBlocks(item: EduItem) {
  return {
    info: {
      bullets: item.clinical_summary,
      indications: item.indications,
      contraindications: item.contraindications,
      measures: item.outcome_measures,
    },
    exampleHtml: item.example_html,
    prompts: item.prompts,
    references: item.references.map(r => r.citation),
  } as const;
}
