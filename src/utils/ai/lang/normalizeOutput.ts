

import { getLangSpec, type LangSpec, LANGUAGE_MAP } from './languageMap';
import { warnIfRiskyOutput } from '@/utils/safety/guard';
import { dedupeName, ensureExt, safeJoin, sanitizeBase } from './filename';
import { detectLangFromCode } from './detectLanguage';
import { getActiveTraceId, spanEnd, spanStart } from '@/utils/obs/instrument';

export interface NormalizedFile {
  path: string;
  ext: string;
  monaco: string;
  fence: string;
  code: string;
}

export interface NormalizeOptions {
  selectedLang: LangSpec;
  mode: 'beginner' | 'pro';
  defaultDir?: string;
}

interface ParsedBlock {
  info: string;
  code: string;
  filenameHeader?: string | null;
  langHint?: string | null;
  filenameMeta?: string | null;
}


const FENCE_RE = /(?:^|\n)(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)\1/g;
const FILE_HEADER_RE = /^\s*\/\/\/\/\s*file:\s*([^\n]+)\s*$/im;

export function parseFenceBlocks(rawText: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(rawText)) !== null) {

  const infoRaw = match[2] || '';
  const codeRaw = match[3] || '';

    const chunkStart = Math.max(0, match.index - 200);
    const pre = rawText.slice(chunkStart, match.index);
    const headerM = FILE_HEADER_RE.exec(pre);
    const info = (infoRaw || '').trim();
    const code = (codeRaw || '').replace(/\s+$/, '');
    const fnameMetaM = info.match(/filename:([^\s]+)/i);
    const langHint = (info.split(/\s+/)[0] || '').trim() || null;
    blocks.push({
      info,
      code,
      filenameHeader: headerM?.[1]?.trim() || null,
      langHint,
      filenameMeta: fnameMetaM?.[1] || null,
    });
  }
  return blocks;
}

function pickBestBlockForBeginner(blocks: ParsedBlock[], selected: LangSpec): ParsedBlock | null {
  if (blocks.length === 0) return null;
  const matchTag = blocks.find(b => (b.langHint || '').toLowerCase() === selected.fence);
  if (matchTag) return matchTag;

  const tsAliases = selected.fence === 'ts' ? ['ts', 'tsx', 'typescript'] : null;
  if (tsAliases) {
    const m = blocks.find(b => tsAliases.includes((b.langHint || '').toLowerCase()));
    if (m) return m;
  }

  return blocks.slice().sort((a, b) => (b.code.length - a.code.length))[0];
}

function langSpecFromHintOrCode(langHint: string | null | undefined, code: string, fallback: LangSpec): LangSpec {
  if (langHint) {
    const spec = getLangSpec(langHint);
    if (spec) return spec;
  }
  const detected = detectLangFromCode(code);
  if (detected) return LANGUAGE_MAP[detected];
  return fallback;
}

export function normalizeAssistantMessage(rawText: string, opts: NormalizeOptions): { files: NormalizedFile[]; warnings: string[] } {

  try { warnIfRiskyOutput(rawText, 'safety:warn:normalize'); } catch {}

  let span: string | null = null;
  const tid = getActiveTraceId();
  if (tid) { try { span = spanStart(tid, 'normalize', 'normalize output'); } catch {} }
  const warnings: string[] = [];
  const blocks = parseFenceBlocks(rawText);

  if (opts.mode === 'beginner') {
    const b = pickBestBlockForBeginner(blocks, opts.selectedLang);
    if (!b) return { files: [], warnings: ['No code fence found'] };

    const base = sanitizeBase(opts.selectedLang.defaultFile);
    const filename = ensureExt(base, opts.selectedLang.ext);
    const path = safeJoin(opts.defaultDir, filename);
    const file: NormalizedFile = {
      path,
      ext: opts.selectedLang.ext,
      monaco: opts.selectedLang.monaco,
      fence: opts.selectedLang.fence,
      code: b.code,
    };
    if ((b.langHint || '').toLowerCase() !== opts.selectedLang.fence) {
      warnings.push(`[DEV][lang-normalize] Coerced fence tag '${b.langHint}' → '${opts.selectedLang.fence}' for Beginner mode.`);
    }
    return { files: [file], warnings };
  }


  const files: NormalizedFile[] = [];
  const existing = new Set<string>();

  for (const b of blocks) {

    const spec = langSpecFromHintOrCode(b.langHint, b.code, opts.selectedLang);
    const baseNameRaw = b.filenameHeader || b.filenameMeta || `${spec.defaultFile}`;
    const base = sanitizeBase(baseNameRaw.replace(/^.*\//, '')) || spec.defaultFile;
    const withExt = ensureExt(base, spec.ext);
    const dir = (b.filenameHeader || b.filenameMeta)?.replace(/[^/]*$/, '') || opts.defaultDir;
    let path = safeJoin(dir, withExt);
    path = dedupeName(existing, path);
    existing.add(path);

    const finalSpec = spec;
    files.push({ path, ext: finalSpec.ext, monaco: finalSpec.monaco, fence: finalSpec.fence, code: b.code });


    if (!b.langHint || getLangSpec(b.langHint) == null) {
  warnings.push(`[DEV][lang-normalize] Missing/unknown fence tag. Detected ${finalSpec.fence} by code.`);
    }
  }

  if (tid && span) { try { spanEnd(tid, span, { files: files.length }); } catch {} }
  return { files, warnings };
}
