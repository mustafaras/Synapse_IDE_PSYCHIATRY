

export interface ParsedBlock { lang: string | undefined; content: string; path: string | undefined; isDiff: boolean }

const PATH_RE = /(?:^|\s)(?:file|filename|path)\s*=\s*([^\s]+)/i;
const COMMENT_PATH_RE = /^\s*(?:\/\/|#)\s*path\s*:\s*([^\s]+)\s*$/i;

export function parseCodeBlocksFromMarkdown(md: string): ParsedBlock[] {
  if (!md) return [];
  const blocks: ParsedBlock[] = [];
  const fenceRe = /```([^\n]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(md)) !== null) {
    const info = (m[1] || '').trim();
    const body = m[2] || '';
    const lang = (info.split(/\s+/)[0] || '').trim() || undefined;
    let path: string | undefined;
    const infoPath = info.match(PATH_RE)?.[1]; if (infoPath) path = infoPath;
    const firstLine = body.split(/\r?\n/, 2)[0] || '';
    const cPath = firstLine.match(COMMENT_PATH_RE)?.[1]; if (cPath) path = cPath;
    const isDiff = (lang === 'diff' || lang === 'patch' || /^diff\s--git/m.test(body) || /^(?:--- |\+\+\+ |@@ )/m.test(body));
  blocks.push({ lang, content: body, path: path ?? undefined, isDiff });
  }
  return blocks;
}

export function extFromLang(lang?: string): string {
  const map: Record<string,string> = {
    ts:'ts', tsx:'tsx', js:'js', jsx:'jsx', json:'json', md:'md', mdx:'mdx',
    html:'html', css:'css', scss:'scss', py:'py', java:'java', kt:'kt', go:'go',
    rs:'rs', cpp:'cpp', hpp:'hpp', c:'c', h:'h', yml:'yml', yaml:'yml', toml:'toml', sh:'sh', sql:'sql'
  };
  return map[(lang||'').toLowerCase()] || 'txt';
}

