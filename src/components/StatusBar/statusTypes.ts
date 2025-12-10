export type StatusSnapshot = {

  filePath?: string;
  fileName?: string;
  ext?: string;
  formatLabel?: string;
  language?: string;
  eol?: 'LF' | 'CRLF';
  encoding?: string;
  tabSize?: number;
  indentation?: 'spaces' | 'tabs';
  cursor?: { line: number; column: number };
  selection?: { chars: number; lines: number };
  counts?: { lines: number; words: number; chars: number; sizeBytes?: number };
  diagnostics?: { errors: number; warnings: number; infos: number };
  dirty?: boolean;

  git?: { branch?: string; ahead?: number; behind?: number; changed?: number; stashed?: number };

  liveServer?: { on: boolean; port?: number };

  online?: boolean;
  cpu?: number;
  mem?: number;

  ai?: {
    state: 'idle' | 'thinking' | 'responded' | 'error';
    lastAction?: string;
    latencyMs?: number;
  };

  now?: number;
};
