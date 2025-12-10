import type { Card, CardTag, EvidenceItem, PromptVariable } from '../lib/types';

interface P18EvidenceItem { title: string; year?: string|number; org?: string; link?: string; note?: string }
interface P18VariableSeed { id: string; label: string; type?: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'tags'; placeholder?: string; required?: boolean; help?: string; options?: string[]; default?: string|number|string[] }
interface P18PromptSeed { name: string; variables: P18VariableSeed[]; generators?: Array<{ id: string; label: string; hint?: string }> }
interface P18CardSeed { id: string; title: string; tags?: string[]; description?: string; html: string; prompts: P18PromptSeed[]; evidence?: P18EvidenceItem[]; figureHtml?: string }


const cl_card_minimal: P18CardSeed = {
  id:'cl-minimal-support', title:'Minimal-Disclosure Supporting Letter (Benefits / Accommodations / Housing / Exams)',
  tags:['accommodations','work','letter','documentation'], description:'Privacy-first letter emphasizing functional impact.', html:'<h2>Supporting Letter</h2>',
  prompts:[{ name:'Minimal-Disclosure — base', variables:[{ id:'date', label:'Date', type:'date', required:true }]}]
};
const cl_card_fitness: P18CardSeed = {
  id:'cl-fitness-return', title:'Fitness for Study/Work & Graded Return Plan', tags:['work','accommodations','documentation'], description:'Memo indicating current capacity and graded plan.', html:'<h2>Fitness Return Plan</h2>',
  prompts:[{ name:'Fitness/Return — base', variables:[{ id:'date', label:'Date', type:'date', required:true }]}]
};
const cl_card_travel: P18CardSeed = {
  id:'cl-travel-meds', title:'Travel & Medications Letter (Air/Border, incl. Controlled Medicines)', tags:['documentation','work'], description:'Travel letter for prescription medicines.', html:'<h2>Travel & Medications Letter</h2>',
  prompts:[{ name:'Travel & Meds — base', variables:[{ id:'date', label:'Date', type:'date', required:true }]}]
};

export function buildCaseLetters(existingIds: Set<string>): Card[] {
  const seeds: P18CardSeed[] = [cl_card_minimal, cl_card_fitness, cl_card_travel];
  const out: Card[] = [];
  for(const seed of seeds){
    if(existingIds.has(seed.id)) continue;
    const allowed: CardTag[] = (seed.tags||[]).filter(t => ['work','accommodations','letter','documentation','risk'].includes(t)) as CardTag[];
    const card: Card = {
      id: seed.id,
      title: seed.title,
      sectionId: 'case-letters',
      summary: seed.description || '',
      tags: allowed.length ? allowed : ['documentation'],
      html: seed.html,
  prompts: seed.prompts.map(p=>({ id:`${seed.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-'), label:p.name, template:'', variables: p.variables.map(v=>{ const pv: PromptVariable = { key:v.id, label:v.label, type: v.type==='textarea' ? 'multiline' : (v.type as Exclude<PromptVariable['type'], undefined>) }; if(v.required!==undefined) pv.required=v.required; if(v.options) pv.options=v.options; if(v.default!==undefined) pv.default=v.default as string; return pv; }), generators: p.generators ?? [] })),
      evidence: (seed.evidence||[]).filter(e=>!!e.title).map(e=>{
        const ev: EvidenceItem = { title: e.title };
        if (e.org) ev.authors = e.org;
        if (e.year !== undefined) ev.year = e.year;
        if (e.link) ev.link = e.link;
        if (e.note) ev.note = e.note;
        return ev;
      })
    };
    if (seed.figureHtml) (card as Card).figureHtml = seed.figureHtml;
    out.push(card);
  }
  return out;
}
