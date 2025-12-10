

export type Scope = 'selection'|'file'|'workspace'|'pinned';

export interface EditorBridge {
  getActiveFilePath?: () => string | undefined;
  getActiveFileContent?: () => string | undefined;
  getSelection?: () => { text: string; path?: string; startLine?: number; endLine?: number } | undefined;
}

export interface BuiltContext {
  text: string;
  included: Array<{ label: string; path?: string; tokens: number }>;
  tokens: { used: number; budget: number; reserved: number; response: number };
}

const MAX_FILE_CHARS = 1_200_000;

export function approxTokens(s: string) { return Math.ceil(((s || '').length) / 4); }
function toCharBudget(tokens: number) { return Math.max(0, Math.floor(tokens * 4)); }

function headTailTrim(text: string, maxTokens: number) {
  const maxChars = toCharBudget(maxTokens);
  if (text.length <= maxChars) return text;
  const head = Math.floor(maxChars * 0.6);
  const tail = maxChars - head;
  return `${text.slice(0, head)  }\n\n${  text.slice(-tail)}`;
}

function neighborhoodTrim(full: string, selStartLine=0, selEndLine=0, maxTokens=512) {
  if (!full) return '';
  const maxChars = toCharBudget(maxTokens);
  const lines = full.split(/\r?\n/);
  const pad = Math.max(3, Math.min(60, Math.floor((maxTokens / 8))));
  const from = Math.max(0, selStartLine - pad);
  const to = Math.min(lines.length - 1, selEndLine + pad);
  let chunk = lines.slice(from, to + 1).join('\n');
  if (chunk.length > maxChars) chunk = chunk.slice(0, maxChars);
  return chunk;
}

function isTextLike(mime?: string, name?: string) {
  if (mime && mime.startsWith('text/')) return true;
  if (!name) return true;
  return /(\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|css|scss|less|html|py|java|kt|go|rs|cpp|cc|hpp|c|h|yaml|yml|toml|sh|bash|zsh|ps1|sql|gradle|cs|rb|php))$/i.test(name);
}

function fence(path: string, body: string) {
  return `<<<FILE path="${path}">>\n${body}\n<<<END FILE>>>`;
}

export function buildContextBundle(opts: {
  scope: Scope;
  tokenBudget: number;
  responseTokens: number;
  pinned?: Array<{ path?: string; name?: string; content: string; mime?: string }>;
  attachments?: Array<{ path?: string; name?: string; content: string; mime?: string }>;
  editor?: EditorBridge;
}): BuiltContext {
  const { scope, tokenBudget, responseTokens, pinned = [], attachments = [], editor } = opts;
  const reserved = Math.min(512, Math.floor(0.1 * tokenBudget));
  const budget = Math.max(512, tokenBudget - responseTokens - reserved);
  if (budget <= 0) {
    const stub = '### Context Policy\nContext omitted due to tight token budget. Provide minimal answer referencing user prompt only.';
    return { text: stub, included: [], tokens: { used: 0, budget: 0, reserved, response: responseTokens } };
  }
  let remaining = budget;
  const included: BuiltContext['included'] = [];
  const fenced: string[] = [];
  const seen = new Set<string>();
  const pack: Array<{ path: string; label: string; content: string; strategy: 'selection'|'file'; selMeta?: { startLine?: number | undefined; endLine?: number | undefined } }> = [];
  function add(label: string, path: string, content: string, strategy: 'selection'|'file', selMeta?: { startLine?: number | undefined; endLine?: number | undefined }) {
    if (!content || content.length === 0) return;
    if (content.length > MAX_FILE_CHARS) return;
    if (!isTextLike(undefined, path)) return;
    const key = `${path  }|${  content.slice(0,256)  }|${  content.length}`;
    if (seen.has(key)) return;
    seen.add(key);
  if (selMeta) pack.push({ path, label, content, strategy, selMeta });
  else pack.push({ path, label, content, strategy });
  }

  const sel = editor?.getSelection?.();
  const activePath = editor?.getActiveFilePath?.();
  const activeContent = editor?.getActiveFileContent?.();

  for (const p of pinned) add(p.name || p.path || 'pinned', p.path || p.name || 'snippet:pinned', p.content, 'file');

  if ((scope === 'selection' || scope === 'workspace') && sel?.text?.trim()) {
    add('selection', sel.path || activePath || 'selection', sel.text, 'selection', { startLine: sel.startLine, endLine: sel.endLine });
  }

  if ((scope === 'file' || scope === 'workspace') && activeContent) {
    add(activePath || 'active-file', activePath || 'active-file', activeContent, 'file');
  }

  if (scope === 'workspace') {
    for (const a of attachments) add(a.name || a.path || 'attachment', a.path || a.name || 'attachment', a.content, 'file');
  }

  for (const item of pack) {
    if (remaining <= 64) break;
    let body: string;
    if (item.strategy === 'selection' && sel) {
      body = neighborhoodTrim(activeContent ?? item.content, item.selMeta?.startLine ?? 0, item.selMeta?.endLine ?? 0, Math.max(128, remaining - 64));
    } else {
      body = headTailTrim(item.content, Math.max(128, Math.floor(remaining * 0.9)));
    }
    const t = approxTokens(body);
    if (t <= 0) continue;
    remaining -= t;
    included.push({ label: item.label, path: item.path, tokens: t });
    fenced.push(fence(item.path, body));
  }
  const used = budget - remaining;
  const header = `### Context Policy\nUse ONLY the provided files/snippets for code references. Do not invent missing modules.\nWhen you generate patches, prefer unified diff or full corrected code blocks.\n\n### Files & Snippets\n${included.map(x => `- ${x.path || x.label} (≈ ${x.tokens} tok)`).join('\n') || '- (none)'}\n\n`;
  return { text: header + fenced.join('\n\n'), included, tokens: { used, budget, reserved, response: responseTokens } };
}
