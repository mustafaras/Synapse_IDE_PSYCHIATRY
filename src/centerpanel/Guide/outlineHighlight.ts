

export function stripDiacritics(s: string) {
  try { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { return s; }
}

export function buildSegments(text: string, query: string) {
  const tokens = (query || '').trim().split(/\s+/).filter(Boolean).map(t => stripDiacritics(t.toLowerCase()));
  if (!tokens.length) return [{ text, hi: false }];
  const norm = stripDiacritics(text.toLowerCase());
  const segs: Array<{ text: string; hi: boolean }> = [];
  let i = 0;
  while (i < text.length) {
    let matchLen = 0;
    for (const t of tokens) {
      if (!t) continue;
      if (norm.startsWith(t, i) && t.length > matchLen) matchLen = t.length;
    }
    if (matchLen > 0) { segs.push({ text: text.slice(i, i + matchLen), hi: true }); i += matchLen; }
    else { segs.push({ text: text[i], hi: false }); i += 1; }
  }
  const merged: typeof segs = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && last.hi === s.hi) last.text += s.text; else merged.push({ ...s });
  }
  return merged;
}
