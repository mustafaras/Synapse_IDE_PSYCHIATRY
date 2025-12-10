

export interface PatchResult { applied: Array<{ path: string; hunks: number }>; failed: Array<{ path: string; reason: string }>; }

export function applyUnifiedDiff(
  readFile: (p: string) => string | undefined,
  writeFile: (p: string, c: string, opts?: { create?: boolean; overwrite?: boolean }) => void,
  diffText: string,
  _opts?: { confirmOverwrite?: boolean }
): PatchResult {
  const lines = (diffText || '').split(/\r?\n/);
  const applied: PatchResult['applied'] = [];
  const failed: PatchResult['failed'] = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && !/^--- /.test(lines[i])) i++;
    if (i >= lines.length) break;
    const oldFile = lines[i].replace(/^---\s+/, '').trim().replace(/^a\//, ''); i++;
    if (!/^\+\+\+ /.test(lines[i] || '')) { failed.push({ path: oldFile, reason: 'malformed header' }); continue; }
    const newFile = (lines[i] || '').replace(/^\+\+\+\s+/, '').trim().replace(/^b\//, ''); i++;
    const target = (newFile !== '/dev/null') ? newFile : oldFile;
    let content = readFile(target) ?? '';
    const creating = !content && newFile !== '/dev/null';
    let hunks = 0;
    while (i < lines.length && /^@@ /.test(lines[i])) {
      const header = lines[i++];
      const m = /@@\s+-([0-9]+)(?:,([0-9]+))?\s+\+([0-9]+)(?:,([0-9]+))?\s+@@/.exec(header);
      if (!m) { failed.push({ path: target, reason: 'malformed hunk header' }); break; }
      const before = content.split(/\r?\n/);
      const out: string[] = [];
      let aPtr = 0;

      const startNew = parseInt(m[3], 10) - 1;
      for (; aPtr < startNew && aPtr < before.length; aPtr++) out.push(before[aPtr]);
      while (i < lines.length && !/^@@ /.test(lines[i]) && !/^--- /.test(lines[i])) {
        const l = lines[i++];
        if (l.startsWith('+')) out.push(l.slice(1));
        else if (l.startsWith('-')) { aPtr++; }
        else if (l.startsWith(' ')) { out.push(before[aPtr]); aPtr++; }
        else if (l === '\\ No newline at end of file') {  }
        else break;
      }
      while (aPtr < before.length) { out.push(before[aPtr++]); }
      content = out.join('\n');
      hunks++;
    }
    try {
      writeFile(target, content, { create: creating, overwrite: !creating });
      applied.push({ path: target, hunks });
    } catch (e: any) {
      failed.push({ path: target, reason: e?.message || 'write failed' });
    }
  }
  return { applied, failed };
}

