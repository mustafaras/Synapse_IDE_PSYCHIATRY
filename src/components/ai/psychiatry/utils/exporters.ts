



export const extFromLang = (lang?: string) =>
  lang === 'typescript' ? 'ts'
  : lang === 'javascript' ? 'js'
  : lang === 'python' ? 'py'
  : lang === 'html' ? 'html'
  : 'txt';

export const mimeFromExt = (ext: string) =>
  ext === 'html' ? 'text/html;charset=utf-8'
  : 'text/plain;charset=utf-8';

export function makeBlobUrl(text: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  return URL.createObjectURL(blob);
}

export function openInNewTab(text: string, ...rest: string[]) {

  const filename = rest[0] || 'snippet.txt';
  const mime = rest[1] || 'text/plain;charset=utf-8';
  const url = makeBlobUrl(text, mime);




  const safeName = '_snippet';
  const w = window.open(url, safeName, 'noopener,noreferrer');
  try { if (w && filename) { w.document.title = filename; } } catch {  }

  return url;
}

export function downloadAs(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  const a = document.createElement('a');
  a.href = makeBlobUrl(text, mime);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); } catch {  }
}


export function printHtml(textHtml: string) {
  const patched = textHtml.includes('__AUTO_PRINT__')
    ? textHtml
    : textHtml.replace('</body>', '<script>setTimeout(()=>window.print(),50);</script></body>');
  openInNewTab(patched, 'print.html', 'text/html;charset=utf-8');
}



const SHARE_ENDPOINT = (import.meta as any).env?.VITE_PSYCH_SHARE_ENDPOINT as string | undefined;

export async function sharePayload(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  if (SHARE_ENDPOINT) {
    try {
      const res = await fetch(SHARE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, mime, text, ttlDays: 7, visibility: 'unlisted' }),
      });
      if (!res.ok) throw new Error('share failed');
      const json = await res.json();
      return String(json.url || '');
    } catch {

    }
  }

  const enc = encodeURIComponent(text);
  const dataUrl = `data:${mime},${enc}`;
  return dataUrl;
}
