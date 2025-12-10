import { resolveSection8Key, SECTION8_TITLES, type TitleMeta } from '../content/section8.titles';

export type LeafLike = { id?: string; title?: string; key?: string };

export function getSection8TitleMeta(node: LeafLike): TitleMeta | undefined {
  const byId = resolveSection8Key(node.id || node.key || '');
  const byTitle = resolveSection8Key(node.title || '');
  const k = byId || byTitle;
  return k ? SECTION8_TITLES[k] : undefined;
}


export function section8LeftLabel(node: LeafLike): string | undefined {
  return getSection8TitleMeta(node)?.shortTitle;
}


export function section8HeaderLabel(nodeOrKey: LeafLike | string): string | undefined {
  if (typeof nodeOrKey === 'string') {
    const k = resolveSection8Key(nodeOrKey);
    return k ? SECTION8_TITLES[k].displayTitle : undefined;
  }
  return getSection8TitleMeta(nodeOrKey)?.displayTitle;
}


export function sanitizeLeafTitle<T extends LeafLike>(node: T): T {
  const m = getSection8TitleMeta(node);
  if (m) (node as unknown as { title?: string }).title = m.shortTitle;
  return node;
}


export const TITLES_VERSION = 1;
