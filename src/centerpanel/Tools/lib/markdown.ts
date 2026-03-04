export function extractFirstFencedBlock(md: string, lang?: string): { lang?: string; content: string } | null {
  if (!md) return null;
  const re = /```(\w+)?\s*([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const l = (m[1] || "").toLowerCase();
    const content = m[2] || "";
    if (!lang || l === lang.toLowerCase()) {
      const res: { content: string; lang?: string } = { content };
      if (l) res.lang = l;
      return res;
    }
  }
  return null;
}


export function tryParseJson(s: string): { ok: true; json: unknown } | { ok: false; error: string } {
  try {
    const j: unknown = JSON.parse(s);
    return { ok: true as const, json: j };
  } catch (e: unknown) {
    const msg = typeof e === "object" && e && "message" in e ? String((e as { message?: unknown }).message || "Invalid JSON") : "Invalid JSON";
    return { ok: false as const, error: msg };
  }
}


export function reduceForClinical(input: string, opts?: { max?: number }): string {
  const max = Math.max(200, Math.min(4000, opts?.max ?? 1200));

  let t = input
    .replace(/<\/?(h1|h2|h3|p|ul|ol|li|strong|em|code|pre|br)[^>]*>/gi, (m) => {
      if (/^<br/i.test(m)) return "\n";
      if (/^<li/i.test(m)) return "- ";
      if (/^<\/(h1|h2|h3|p|li)>/i.test(m)) return "\n";
      return "";
    })
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n?/g, "\n");


  t = t.replace(/\*\*([^*]+)\*\*/g, (_, x) => String(x).toUpperCase());
  t = t.replace(/\*([^*]+)\*/g, "*$1*");
  t = t.replace(/`([^`]+)`/g, "$1"); // inline code → plain


  t = t.split("\n").map(s => s.trim()).filter(Boolean).join("\n");
  if (t.length > max) t = `${t.slice(0, max - 1)}…`;
  return t;
}
