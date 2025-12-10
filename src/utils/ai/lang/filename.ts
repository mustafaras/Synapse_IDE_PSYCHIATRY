

export function sanitizeBase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'file';
}

export function ensureExt(base: string, ext: string): string {
  return base.endsWith(ext) ? base : `${base}${ext}`;
}

export function safeJoin(dir: string | undefined, baseWithExt: string): string {
  const cleanDir = (dir ?? '').replace(/(\.{2}|^[\\/]|:)/g, '').replace(/[/\\]+/g, '/');
  return cleanDir ? `${cleanDir}/${baseWithExt}` : baseWithExt;
}

export function dedupeName(existing: Set<string>, filename: string): string {
  if (!existing.has(filename)) return filename;
  const m = filename.match(/^(.*?)(\.[^.]+)?$/);
  const name = (m?.[1] || filename).replace(/\.$/, '');
  const ext = m?.[2] || '';
  let i = 2;
  while (existing.has(`${name}-${i}${ext}`)) i++;
  return `${name}-${i}${ext}`;
}
