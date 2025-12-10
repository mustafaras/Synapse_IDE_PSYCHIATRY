export const nowStamp = () =>
  new Date().toLocaleString(undefined, { hour12: false });

export function sectionSummaryBlock(sectionTitle: string, body?: string) {
  const header = `### ${sectionTitle} — ${nowStamp()}`;
  const content = body?.trim() ? `\n${body.trim()}` : "";
  return `${header}${content}`;
}
