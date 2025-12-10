


import { emit, mergeEmit } from './statusBus';
import type { StatusSnapshot } from './statusTypes';


export function setCursor(position: { line: number; column: number }) {
  emit({ cursor: position });
}

export function setCounts(counts: Partial<NonNullable<StatusSnapshot['counts']>>) {
  mergeEmit('counts', counts);
}

export function setContentCounts(content: string) {
  const safe = content ?? '';
  const lines = safe.split('\n').length;
  const words = (safe.match(/\S+/g) || []).length;
  const chars = safe.length;
  const sizeBytes =
    typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(safe).length : chars;
  mergeEmit('counts', { lines, words, chars, sizeBytes });
}

export function setIndentation(indentation: 'spaces' | 'tabs', tabSize: number) {
  emit({ indentation, tabSize });
}

export function setDiagnostics(errors: number, warnings: number, infos = 0) {
  mergeEmit('diagnostics', { errors, warnings, infos });
}

export function setFileInfo(file: {
  filePath?: string;
  fileName?: string;
  ext?: string;
  dirty?: boolean;
}) {
  emit(file);
}


export function setGitStatus(update: NonNullable<StatusSnapshot['git']>) {
  mergeEmit('git', update || {});
}


export function setLiveServer(on: boolean, port?: number) {
  emit({ liveServer: port != null ? { on, port } : { on } });
}


export function setLanguage(language: string) {
  emit({ language });
}
export function setEncoding(encoding: string) {
  emit({ encoding });
}
export function setEol(eol: 'LF' | 'CRLF') {
  emit({ eol });
}


export function setOnline(online: boolean) {
  emit({ online });
}
export function setSystem(update: { cpu?: number; mem?: number }) {
  emit(update);
}


export const ai = {
  start(label: string, intent: string) {
    mergeEmit('ai', { state: 'thinking', lastAction: label });
    emit({ ai: { state: 'thinking', lastAction: label }, lastAction: intent } as any);
  },
  responded(latencyMs?: number) {
    if (typeof latencyMs === 'number') {
      mergeEmit('ai', { state: 'responded', latencyMs });
    } else {
      mergeEmit('ai', { state: 'responded' });
    }
  },
  error() {
    mergeEmit('ai', { state: 'error' });
  },
};

export type { StatusSnapshot } from './statusTypes';


export const sbSetFile = (filePath: string, fileName: string, ext: string, dirty?: boolean) => {
  const payload: Partial<StatusSnapshot> = { filePath, fileName, ext };
  if (typeof dirty !== 'undefined') payload.dirty = dirty;
  if (ext) payload.formatLabel = ext.toUpperCase();
  emit(payload);
};


export const sbSetGit = (
  branch?: string,
  ahead?: number,
  behind?: number,
  changed?: number,
  stashed?: number
) => {
  const payload: Partial<StatusSnapshot['git']> = {};
  if (typeof branch !== 'undefined') payload.branch = branch;
  if (typeof ahead !== 'undefined') payload.ahead = ahead;
  if (typeof behind !== 'undefined') payload.behind = behind;
  if (typeof changed !== 'undefined') payload.changed = changed;
  if (typeof stashed !== 'undefined') payload.stashed = stashed;
  mergeEmit('git', payload);
};


export const sbSetLive = (on: boolean, port?: number) => {
  const payload: Partial<StatusSnapshot['liveServer']> = { on };
  if (typeof port !== 'undefined') payload.port = port;
  mergeEmit('liveServer', payload);
};


export const sbAiStart = (lastAction: string) => mergeEmit('ai', { state: 'thinking', lastAction });
export const sbAiDone = (latencyMs?: number) =>
  typeof latencyMs === 'number'
    ? mergeEmit('ai', { state: 'responded', latencyMs })
    : mergeEmit('ai', { state: 'responded' });
export const sbAiError = () => mergeEmit('ai', { state: 'error' });


export const sbOnline = (online: boolean) => emit({ online });


export const sbCursor = (line: number, column: number) => emit({ cursor: { line, column } });
export const sbSelection = (chars: number, lines: number) => emit({ selection: { chars, lines } });
export const sbCounts = (lines: number, words: number, chars: number, sizeBytes?: number) => {
  const payload: Partial<StatusSnapshot['counts']> = { lines, words, chars };
  if (typeof sizeBytes !== 'undefined') payload.sizeBytes = sizeBytes;
  mergeEmit('counts', payload);
};
export const sbOptions = (
  language?: string,
  tabSize?: number,
  indentation?: 'spaces' | 'tabs',
  encoding?: string,
  eol?: 'LF' | 'CRLF'
) => {
  const payload: Partial<StatusSnapshot> = {};
  if (typeof language !== 'undefined') payload.language = language;
  if (typeof tabSize !== 'undefined') payload.tabSize = tabSize;
  if (typeof indentation !== 'undefined') payload.indentation = indentation;
  if (typeof encoding !== 'undefined') payload.encoding = encoding;
  if (typeof eol !== 'undefined') payload.eol = eol;
  emit(payload);
};
export const sbDiagnostics = (errors = 0, warnings = 0, infos = 0) =>
  mergeEmit('diagnostics', { errors, warnings, infos });


