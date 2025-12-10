import React from 'react';
import styled from 'styled-components';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { ProviderId } from '@/lib/settings/settings.types';

const Badge = styled.span<{ kind: 'ok'|'warn' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1;
  background: ${p => p.kind === 'ok' ? 'var(--syn-primary-700,#1f6feb)' : 'rgba(255,255,255,0.08)'};
  color: ${p => p.kind === 'ok' ? '#fff' : 'var(--color-text-secondary, rgba(255,255,255,0.75))'};
  border: 1px solid var(--color-border, rgba(255,255,255,0.12));
`;

export const StatusBadge: React.FC = () => {
  const { profiles, activeProfileId } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const provider = (active?.data?.settings?.provider || active?.data?.provider || 'openai') as ProviderId;
  const keys = (active?.data as any)?.keys || {};
  const base = active?.data?.settings as any;

  let text = 'Ready';
  let kind: 'ok'|'warn' = 'ok';
  if (provider === 'ollama') {
    const hasBase = !!(base?.ollamaBaseUrl);
    if (!hasBase) { text = 'Local not set'; kind = 'warn'; }
  } else {
    const hasKey = !!(keys?.[provider]?.apiKey);
    if (!hasKey) { text = 'Key missing'; kind = 'warn'; }
  }
  return (
    <Badge kind={kind} aria-label={`Connection status: ${text}`}>{text}</Badge>
  );
};

export default StatusBadge;
