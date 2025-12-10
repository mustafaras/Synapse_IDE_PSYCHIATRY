


import type { Card, CardDoc, Library, LocaleBlock, LocaleCode, Reference } from './ContentSchema';
import type { PromptsSource, ReferencesSource, TextSource } from './ContentSchema';


type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [k: string]: JsonValue };
type JsonArray = JsonValue[];

function parseYamlSubset(src: string): JsonObject {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  type Frame = { indent: number; value: JsonObject | JsonArray; key?: string };
  const root: JsonObject = {};
  const stack: Frame[] = [{ indent: -1, value: root }];

  const toScalar = (raw: string): JsonValue => {
    const v = raw.trim();
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null' || v === '~') return null;
    if (!isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return v.replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.match(/^(\s*)/)! [1].length;
    while (stack.length && indent <= stack[stack.length-1].indent) stack.pop();
    const parent = stack[stack.length-1];
    const trimmed = line.trim();


    if (/^[a-zA-Z0-9_-]+:\s*{/.test(trimmed) && trimmed.endsWith('}')) {
      const [k, rest] = trimmed.split(/:(.*)/).slice(0,2);
      try {
        const inner = rest.trim();
        const jsonish = inner.replace(/([a-zA-Z0-9_]+)\s*:/g,'"$1":');
        (parent.value as JsonObject)[k.trim()] = JSON.parse(jsonish) as JsonObject;
        continue;
      } catch {  }
    }

    if (trimmed.startsWith('- ')) {
      const itemStr = trimmed.slice(2);

      if (!Array.isArray(parent.value)) {
        if (parent.key && (parent.value as JsonObject)[parent.key] == null) (parent.value as JsonObject)[parent.key] = [] as JsonArray;
        const arrProbe = parent.key ? (parent.value as JsonObject)[parent.key] : parent.value;
        if (!Array.isArray(arrProbe)) throw new Error(`Array item without array context: ${trimmed}`);
      }
      const arr = Array.isArray(parent.value) ? parent.value as JsonArray : (parent.value as JsonObject)[parent.key!] as JsonArray;
      if (itemStr.includes(':')) {
        const [ik, ...rest] = itemStr.split(':');
        const val = rest.join(':');
        const obj: JsonObject = {};
        if (val.trim()) obj[ik.trim()] = toScalar(val);
        arr.push(obj);
        stack.push({ indent, value: obj });
      } else {
        arr.push(toScalar(itemStr));
      }
      continue;
    }

    const kv = trimmed.split(':');
    const key = kv.shift()!.trim();
    const rest = kv.join(':');
    if (rest.trim() === '') {

      if (Array.isArray(parent.value)) {
        const obj: JsonObject = {};
        (parent.value as JsonArray).push({ [key]: obj });
        stack.push({ indent, value: obj });
      } else {
        const pv = parent.value as JsonObject;
        if (!pv[key]) pv[key] = {};
        stack.push({ indent, value: pv[key] as JsonObject, key });
      }
    } else {

      if (Array.isArray(parent.value)) {
        (parent.value as JsonArray).push({ [key]: toScalar(rest) });
      } else {
        (parent.value as JsonObject)[key] = toScalar(rest);
      }
    }
  }
  return root;
}


function assertCardDoc(obj: JsonValue): CardDoc {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Invalid YAML root');
  const o = obj as Record<string, unknown>;
  if (o.schema_version !== 1) throw new Error('schema_version must be 1');
  if (!o.id || !o.sectionId || !o.i18n) throw new Error('id, sectionId, i18n required');
  return o as unknown as CardDoc;
}

function normalizeImperative(label: string): string {
  const L = (label || '').trim();
  if (!L) return '';
  const lower = L.toLowerCase();
  if (/^(make|create|compose)\b/.test(lower)) return L.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1));
  return `Create ${L.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1))}`;
}

function materializeCard(doc: CardDoc, locale: LocaleCode, path: string): Card {
  const pickLocale = (blocks: Record<LocaleCode, LocaleBlock>): LocaleBlock => {
    return blocks[locale] || blocks['en'] || blocks[Object.keys(blocks)[0] as LocaleCode] || {};
  };
  const block = pickLocale(doc.i18n);
  const normalizeCommands = (cmds?: (string | { text: string })[]) =>
    (Array.isArray(cmds) ? cmds : [])
      .map(c => typeof c === 'string' ? { text: c } : c)
      .filter(c => c && c.text)
      .map(c => ({ ...c, text: normalizeImperative(c.text) }));


  const seenIds = new Set<string>();
  const examples = (Array.isArray(block.examples) ? block.examples : []).map(ex => {
    const id = ex.id || `ex-${Math.random().toString(36).slice(2,8)}`;
    if (seenIds.has(id)) return null; seenIds.add(id);
    return { id, label: ex.label || id, html: String(ex.html || '') };
  }).filter(Boolean) as Card['examples'];

  return {
    id: doc.id,
    sectionId: doc.sectionId,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    title: block.title || doc.id,
    info: (block.info || '').trim(),
    examples,
    references: (Array.isArray(block.references) ? block.references : []).map(r => {
      const ref: Reference = { title: r.title, journal: r.journal } as Reference;
      if (typeof r.year === 'string' || typeof r.year === 'number') (ref as unknown as { year: string | number }).year = r.year;
      return ref;
    }).filter(r => r.title),
    commands: normalizeCommands(block.commands),
    _sourcePath: path
  };
}


const GLOB = import.meta.glob('./cards*.yml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function loadLibrary(locale: LocaleCode = 'en'): Library {
  const cards: Card[] = [];
  const seen = new Set<string>();
  for (const p in GLOB) {
    try {
      const raw = GLOB[p];
      const data = parseYamlSubset(raw);
  const doc = assertCardDoc(data);
      if (seen.has(doc.id)) { console.warn(`[psych-content] Duplicate id "${doc.id}" at ${p} — skipped`); continue; }
      const card = materializeCard(doc, locale, p);
      cards.push(Object.freeze(card));
      seen.add(doc.id);
    } catch (e) {
      console.error('[psych-content] Failed to load', p, e);
    }
  }
  return cards as Library;
}


export function reloadLibrary(locale: LocaleCode = 'en'): Library { return loadLibrary(locale); }


function mdToHtml(md: string): string {
  try {
    const escaped = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="md-fallback">${escaped}</pre>`;
  } catch {
    return `<pre class="md-fallback">${md}</pre>`;
  }
}


const RAW_FILES = import.meta.glob('/content*', { query: '?raw', import: 'default' });
async function loadTextByPath(path: string): Promise<string> {
  const loader = (RAW_FILES as Record<string, () => Promise<string>>)[path];
  if (!loader) {
    throw new Error(`contentLoader: no loader bound for path "${path}"`);
  }
  return await loader();
}

export async function resolveTextSource(src?: TextSource): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.kind === 'inline') {
    return src.format === 'md' ? mdToHtml(src.value) : src.value;
  }
  if (src.kind === 'ref') {
    const raw = await loadTextByPath(src.path);
    const fmt = src.format ?? (src.path.endsWith('.md') ? 'md' : 'html');
    return fmt === 'md' ? mdToHtml(raw) : raw;
  }
  return undefined;
}

export async function resolveReferencesSource(src?: ReferencesSource): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.kind === 'inline') {
    return src.format === 'md' ? mdToHtml(src.value) : src.value;
  }
  if (src.kind === 'ref') {
    const raw = await loadTextByPath(src.path);
    const fmt = src.format ?? (src.path.endsWith('.md') ? 'md' : 'html');
    return fmt === 'md' ? mdToHtml(raw) : raw;
  }
  if (src.kind === 'structured') {
    const items = src.items ?? [];
    const li = items.map((it, i) => {
      const parts: string[] = [];
      if (it.authors?.length) parts.push(`${it.authors.join(', ')}.`);
      if (it.year) parts.push(`(${it.year}).`);
      if (it.title) parts.push(`<i>${it.title}</i>.`);
      if ((it as any).journal) parts.push(`${(it as any).journal  }.`);
      if (it.venue) parts.push(`${it.venue  }.`);
      if (it.doi) parts.push(`doi:${it.doi}`);
      if (it.url) parts.push(`<a href="${it.url}" target="_blank" rel="noreferrer">link</a>`);
      return `<li data-ref-idx="${i}">${parts.join(' ')}</li>`;
    }).join('\n');
    return `<ol class="ref-list">${li}</ol>`;
  }
  return undefined;
}

export async function resolvePromptsSource(src?: PromptsSource): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.kind === 'inline') return src.value;
  if (src.kind === 'list') return (src.items || []).join('\n');
  if (src.kind === 'ref') {
    const raw = await loadTextByPath(src.path);
    return raw;
  }
  return undefined;
}
