

export const SCORE_PHQ9_TS = `// PHQ-9 Scoring (TypeScript)

export function scorePHQ9(answers: number[]) {
  if (!Array.isArray(answers) || answers.length !== 9) throw new Error('Expected 9 answers');
  const invalid = answers.some(a => a < 0 || a > 3 || !Number.isFinite(a));
  if (invalid) throw new Error('Answers must be integers 0–3');
  const score = answers.reduce((s, v) => s + v, 0);
  let severity: string;
  if (score <= 4) severity = 'minimal';
  else if (score <= 9) severity = 'mild';
  else if (score <= 14) severity = 'moderate';
  else if (score <= 19) severity = 'moderately severe';
  else severity = 'severe';
  return { score, severity };
}`;

export const SCORE_GAD7_TS = `// GAD-7 Scoring (TypeScript)

export function scoreGAD7(answers: number[]) {
  if (!Array.isArray(answers) || answers.length !== 7) throw new Error('Expected 7 answers');
  const invalid = answers.some(a => a < 0 || a > 3 || !Number.isFinite(a));
  if (invalid) throw new Error('Answers must be integers 0–3');
  const score = answers.reduce((s, v) => s + v, 0);
  let severity: string;
  if (score <= 4) severity = 'minimal';
  else if (score <= 9) severity = 'mild';
  else if (score <= 14) severity = 'moderate';
  else severity = 'severe';
  return { score, severity };
}`;

export const SCORE_PHQ9_PY = `# PHQ-9 Scoring (Python snippet)
# answers: list of nine integers 0–3
# Example with pandas DataFrame 'df' containing columns q1..q9:
# df['phq9_score'] = df[[f'q{i}' for i in range(1,10)]].sum(axis=1)
# (Severity interpretation should follow standard cut points; educational use only.)

def score_phq9(answers: list[int]) -> dict:
    if len(answers) != 9:
        raise ValueError('Expected 9 answers')
    if any((a < 0 or a > 3) for a in answers):
        raise ValueError('Answers must be integers 0–3')
    score = sum(answers)
    if score <= 4:
        severity = 'minimal'
    elif score <= 9:
        severity = 'mild'
    elif score <= 14:
        severity = 'moderate'
    elif score <= 19:
        severity = 'moderately severe'
    else:
        severity = 'severe'
    return { 'score': score, 'severity': severity }
`;
