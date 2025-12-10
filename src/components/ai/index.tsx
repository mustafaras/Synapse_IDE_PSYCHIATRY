import React from 'react';
import { SynapseCoreAIPanel } from './panel/SynapseCoreAIPanel';
export { notify, computeSanitizeDiff, sanitizeHtmlForPreview, buildSystemPrompt, buildSystemPromptV2, classifyProviderError, selectFallbackModel, estimateTokens, buildSummaryRequestPayload, selectRecentForBudget } from './AiAssistantConfig';


export function applyPlan(_plan?: any) {  }
export function dryRunPlan(_plan?: any) {  }
export function getActiveProjectId() { return 'default'; }
export function getLastPlan() { return null; }
export async function loadThread() { return null as any; }
export function recordTelemetry(_evt?: any) {  }
export async function refreshProjectBrief() { return ''; }
export const telemetryVerbose = () => false;

type AiAssistantProps = React.HTMLAttributes<HTMLDivElement> & {
  width?: number;
  onClose?: () => void;
};


export const AiAssistant: React.FC<AiAssistantProps> = ({ style, ...rest }) => (
  <div
    role="region"
    aria-label="AI Assistant"
    data-testid="assistant-body"
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'var(--color-background)',
      borderLeft: '1px solid var(--color-border)',

      overflow: 'hidden',
  fontFamily: 'var(--font-mono, var(--font-code, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace))',
      ...style,
    }}
    {...rest}
  >
    <SynapseCoreAIPanel />
  </div>
);

export default AiAssistant;
