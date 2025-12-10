export function computeUnifiedDiff(path: string, before: string, after: string): string {
  const a = before.split('\n'), b = after.split('\n');
  const out: string[] = [`--- ${path}`, `+++ ${path}`];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    const lineA = a[i] ?? '';
    const lineB = b[j] ?? '';
    if (lineA === lineB) { i++; j++; continue; }
    if (lineA && !b.includes(lineA)) { out.push(`-${lineA}`); i++; continue; }
    if (lineB && !a.includes(lineB)) { out.push(`+${lineB}`); j++; continue; }
    out.push(`-${lineA}`);
    out.push(`+${lineB}`);
    i++; j++;
  }
  return out.join('\n');
}

export async function applyEditsAtomically() {

}
