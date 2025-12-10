



export type AssessmentEntry = {
  kind: string;
  score: number | string;
  when?: number | string;
};

function phq9Bucket(scoreNum: number): string {
  if (scoreNum <= 4) return "minimal";
  if (scoreNum <= 9) return "mild";
  if (scoreNum <= 14) return "moderate";
  if (scoreNum <= 19) return "mod-severe";
  return "severe";
}

function gad7Bucket(scoreNum: number): string {
  if (scoreNum <= 4) return "minimal";
  if (scoreNum <= 9) return "mild";
  if (scoreNum <= 14) return "moderate";
  return "severe";
}

function bfcrsBucket(scoreNum: number): string {
  if (scoreNum <= 2) return "mild catatonia";
  if (scoreNum <= 6) return "moderate catatonia";
  return "severe catatonia";
}

export function getSeverityAnnotation(kindRaw: string, scoreRaw: number | string) {
  const kind = (kindRaw || "").toUpperCase();
  const s = typeof scoreRaw === 'number' ? scoreRaw : parseInt(String(scoreRaw || ''), 10);
  if (!Number.isNaN(s)) {
    if (kind === 'PHQ9' || kind === 'PHQ-9') {
      const bucket = phq9Bucket(s);
      return { severityLabel: bucket, display: `PHQ-9=${s} (${bucket})` };
    }
    if (kind === 'GAD7' || kind === 'GAD-7') {
      const bucket = gad7Bucket(s);
      return { severityLabel: bucket, display: `GAD-7=${s} (${bucket})` };
    }
    if (kind === 'BFCRS' || kind === 'BUSH-FRANCIS' || kind === 'BUSHFRANCIS') {
      const bucket = bfcrsBucket(s);
      return { severityLabel: bucket, display: `BFCRS=${s} (${bucket})` };
    }
    return { severityLabel: "", display: `${kindRaw}=${s}` };
  }
  return { severityLabel: "", display: `${kindRaw}=${String(scoreRaw ?? '')}` };
}

export function summarizeAssessments(list: AssessmentEntry[] | undefined | null): string[] {
  if (!list || list.length === 0) return [];
  return list.map((a) => getSeverityAnnotation(a?.kind ?? 'Scale', a?.score ?? '').display);
}
