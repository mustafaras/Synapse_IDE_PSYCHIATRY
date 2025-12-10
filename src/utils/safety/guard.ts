import { scanAssistantText } from './scanner';
import { redactContext } from './redactor';
import { showToast } from '@/ui/toast/api';

export function redactContextSlice(content: string): { content: string } {
  const { clean } = redactContext(content);
  return { content: clean };
}

export function warnIfRiskyOutput(rawAssistantText: string, contextKey = 'safety:warn'): void {
  const report = scanAssistantText(rawAssistantText);
  if (!report.ok) {
    const msg = report.findings.slice(0, 3).map(f => f.detail).join(', ');
    showToast({ kind: 'warning', contextKey, title: 'Review recommended', message: msg || 'Potentially risky output' });
  }
}
