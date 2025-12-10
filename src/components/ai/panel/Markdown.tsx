import React, { useMemo } from 'react';

import CodeBlockWithActions from '@/components/ai/CodeBlockWithActions';
import { MarkdownRoot } from './styles';

type Segment =
  | { type: 'text'; text: string }
  | { type: 'code'; info?: string; code: string };

const fenceRe = /(^|\n)(`{3,}|~{3,})\s*([^\n]*)\n([\s\S]*?)\n\2(\n|$)/g;

function splitIntoSegments(input: string): Segment[] {
  if (!input) return [{ type: 'text', text: '' }];
  const segments: Segment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(input))) {
    const start = m.index + (m[1] ? m[1].length : 0);
    if (start > lastIndex) {
      segments.push({ type: 'text', text: input.slice(lastIndex, start) });
    }
    const info = (m[3] || '').trim();
    const code = (m[4] || '').replace(/\s+$/g, '');
    segments.push({ type: 'code', info, code });
    lastIndex = fenceRe.lastIndex;
  }
  if (lastIndex < input.length) {
    segments.push({ type: 'text', text: input.slice(lastIndex) });
  }
  return segments;
}

function safeUrl(href: string): string | null {
  try {
    const u = new URL(href);
    if (u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:') return href;
    return null;
  } catch {
    return null;
  }
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {

  const nodes: React.ReactNode[] = [];
  let rest = text;

    const tokenRe = /(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)/g;
  let idx = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(rest))) {
    const before = rest.slice(0, match.index);
    if (before) nodes.push(before);
    const token = match[0];
    if (token.startsWith('![')) {

      nodes.push(token);
    } else if (token.startsWith('[')) {
  const m2 = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (m2) {
        const label = m2[1];
        const href = safeUrl(m2[2]);
        if (href) {
          nodes.push(
            <a key={`${keyPrefix}-a-${idx++}`} href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          );
        } else {
          nodes.push(label);
        }
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-code-${idx++}`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-b-${idx++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*')) {
      nodes.push(<em key={`${keyPrefix}-i-${idx++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('_')) {
      nodes.push(<em key={`${keyPrefix}-i2-${idx++}`}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(token);
    }
    rest = rest.slice(match.index + token.length);
    tokenRe.lastIndex = 0;
  }
  if (rest) nodes.push(rest);
  return nodes;
}

function renderTextBlock(text: string, parentKey: string): React.ReactNode {

  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(6, h[1].length) as 1|2|3|4|5|6;
      const content = h[2];
      const k = `${parentKey}-h-${key++}`;
      const children = renderInline(content, `${parentKey}-h-${key}`);

      switch (level) {
        case 1: out.push(<h1 key={k}>{children}</h1>); break;
        case 2: out.push(<h2 key={k}>{children}</h2>); break;
        case 3: out.push(<h3 key={k}>{children}</h3>); break;
        case 4: out.push(<h4 key={k}>{children}</h4>); break;
        case 5: out.push(<h5 key={k}>{children}</h5>); break;
        case 6: out.push(<h6 key={k}>{children}</h6>); break;
      }
      i++;
      continue;
    }

    if (/^\s*([-*])\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*([-*])\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, '');
        items.push(<li key={`${parentKey}-li-${i}`}>{renderInline(itemText, `${parentKey}-li-${i}`)}</li>);
        i++;
      }
      out.push(<ul key={`${parentKey}-ul-${key++}`}>{items}</ul>);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, '');
        items.push(<li key={`${parentKey}-oli-${i}`}>{renderInline(itemText, `${parentKey}-oli-${i}`)}</li>);
        i++;
      }
      out.push(<ol key={`${parentKey}-ol-${key++}`}>{items}</ol>);
      continue;
    }

    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim()) {
      buf.push(lines[i]);
      i++;
    }
    const para = buf.join('\n');
    out.push(<p key={`${parentKey}-p-${key++}`}>{renderInline(para, `${parentKey}-p-${key}`)}</p>);
  }
  return out.length ? out : null;
}

export interface MarkdownProps { text: string; enableCodeActions?: boolean }

const Markdown: React.FC<MarkdownProps> = ({ text, enableCodeActions = true }) => {
  const segments = useMemo(() => splitIntoSegments(text || ''), [text]);
  return (
    <MarkdownRoot>
      {segments.map((seg, i) =>
        seg.type === 'code' ? (
          <CodeBlockWithActions
            key={`code-${i}`}
            block={{ content: seg.code, lang: seg.info || '', path: undefined, isDiff: (seg.info||'').toLowerCase().startsWith('diff') }}
            enableActions={enableCodeActions}
          />
        ) : (
          <React.Fragment key={`text-${i}`}>{renderTextBlock(seg.text, `t-${i}`)}</React.Fragment>
        )
      )}
    </MarkdownRoot>
  );
};

export default React.memo(Markdown);
