import { estimateTokensApprox } from '@/utils/ai/tokenize';
import type { Chunk, FileRef } from '../types';

export type ChunkingOpts = { maxChars?: number; overlap?: number };
const DEF: Required<ChunkingOpts> = { maxChars: 1600, overlap: 120 };

export async function chunkFile(file: FileRef, readText: (path: string) => Promise<string>, opts: ChunkingOpts = {}): Promise<Chunk[]> {
  const { maxChars, overlap } = { ...DEF, ...opts };
  const raw = await readText(file.path);
  const lines = raw.split(/\r?\n/);
  const blocks = file.lang === 'markdown' ? mdBlocks(lines) : codeBlocks(lines, file.lang);
  const out: Chunk[] = [];
  for (const b of blocks) {
    const text = lines.slice(b.from, b.to).join('\n');
    for (const w of windowed(text, maxChars, overlap)) {
      out.push(toChunk(file, w.fromLine, w.toLine, w.text));
    }
  }
  return out;
}

function mdBlocks(lines: string[]) {
  const out: { from: number; to: number }[] = [];
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i]) && i > start) {
      out.push({ from: start, to: i });
      start = i;
    }
  }
  out.push({ from: start, to: lines.length });
  return out;
}

function codeBlocks(lines: string[], _lang: string) {
  const out: { from: number; to: number }[] = [];
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^\s*(class|def|function|fn)\b/.test(L) || /^\s*export\s+/.test(L) || /^\s*\/\/\s*@section/.test(L)) {
      if (i > start) {
        out.push({ from: start, to: i });
        start = i;
      }
    }
  }
  out.push({ from: start, to: lines.length });
  return out;
}

function windowed(text: string, maxChars: number, overlap: number) {
  const arr: { text: string; fromLine: number; toLine: number }[] = [];
  const lines = text.split('\n');
  let from = 0;
  while (from < lines.length) {
    let len = 0, to = from;
    while (to < lines.length && (len + lines[to].length + 1) <= maxChars) { len += lines[to].length + 1; to++; }
    if (to === from) to = Math.min(lines.length, from + Math.ceil(maxChars / 80));
    arr.push({ text: lines.slice(from, to).join('\n'), fromLine: from + 1, toLine: to });
    if (to >= lines.length) break;
    from = Math.max(from + Math.ceil((to - from) * 0.9) - Math.floor(overlap / 80), to - Math.floor(overlap / 80));
  }
  return arr;
}

function toChunk(file: FileRef, fromLine: number, toLine: number, text: string): Chunk {
  return {
    id: crypto.randomUUID(),
    path: file.path,
    lang: file.lang,
    fromLine, toLine,
    text,
    tokens: estimateTokensApprox(text),
    hash: sha256(text),
  };
}

function sha256(s: string) {
  try {
    if ((window as any).crypto?.subtle) {

      return `sha256:${  btoa(unescape(encodeURIComponent(s))).slice(0, 16)}`;
    }
  } catch {}
  return String(s.length);
}
