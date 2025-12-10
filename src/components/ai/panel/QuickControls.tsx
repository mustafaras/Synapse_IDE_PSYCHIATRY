import React, { useCallback, useMemo } from 'react';
import { ControlsRow, MiniButton, MiniSelect, QuickRow } from './styles';
import { useSettingsStore } from '@/store/useSettingsStore';
import { listPresets } from '@/lib/ai/presets/presets.registry';
import editorBridge from '@/services/editorBridge';
import { mapFenceToLangAndExt } from './code-lang';
import { showToast } from '@/ui/toast/api';

type Props = {
  clearAll: () => void;
  fsm: { cancel: (reason: any) => void };
  abortStreaming: (reason?: string) => void;
  onRetry?: () => void;
};

const QuickControls: React.FC<Props> = ({ clearAll, fsm, abortStreaming, onRetry }) => {
  const s = useSettingsStore();
  const active = useMemo(() => s.profiles.find(p => p.id === s.activeProfileId), [s.profiles, s.activeProfileId]);
  const provider = (active?.data as any)?.settings?.provider || active?.data?.provider || 'openai';
  const model = (active?.data as any)?.settings?.model || active?.data?.model || 'gpt-4o-mini';
  const presets = useMemo(() => listPresets(provider, model), [provider, model]);

  const applyPreset = useCallback((id: import('@/lib/ai/presets/presets.types').PresetId | 'fallback_strict_json' | 'fallback_default' | 'fallback_codegen' | 'fallback_explain') => {

    if (id === 'fallback_default') { s.setSystemPrompt(''); s.setJsonMode(false); return; }
    if (id === 'fallback_codegen') { const text = 'You are a senior code generator. Prefer concise patches and runnable code.'; s.setSystemPrompt(text); return; }
    if (id === 'fallback_explain') { const text = 'Explain step-by-step with short paragraphs and bullet lists.'; s.setSystemPrompt(text); return; }
    if (id === 'fallback_strict_json') { const text = 'Return ONLY a valid JSON object with no extra text.'; s.setSystemPrompt(text); s.setJsonMode(true); return; }
    try { s.applyPreset(id as any, { switchModel: false }); } catch {}
  }, [s]);


  const getLastAssistant = useCallback(() => {
    try {
      const { useSynapseChat } = require('./hooks/useSynapseChat');
      const chat = useSynapseChat.getState?.() || { messages: [] };
      const arr: Array<{ role: string; content: string; error?: string }> = chat.messages || [];
      for (let i = arr.length - 1; i >= 0; i--) {
        const m = arr[i];
        if (m.role === 'assistant' && !m.error && m.content) return m;
      }
      return null;
    } catch { return null; }
  }, []);

  const extractFirstCode = useCallback((text: string): { code: string; info?: string | undefined } | null => {
    const re = /(^|\n)(`{3,}|~{3,})\s*([^\n]*)\n([\s\S]*?)\n\2(\n|$)/;
    const m = re.exec(text);
    if (!m) return null;
    return { code: (m[4] || '').replace(/\s+$/g, ''), info: (m[3] || '').trim() || undefined };
  }, []);

  const onCopyLast = useCallback(async () => {
    const last = getLastAssistant(); if (!last) return;
    try { await navigator.clipboard.writeText(last.content); showToast({ kind: 'success', message: 'Copied last reply' }); } catch {}
  }, [getLastAssistant]);

  const onInsertLast = useCallback(async () => {
    const last = getLastAssistant(); if (!last) return;
    const blk = extractFirstCode(last.content); if (!blk) return;
    const { monaco } = mapFenceToLangAndExt(blk.info);
    await editorBridge.insertIntoActive({ code: blk.code, language: monaco as any });
  }, [getLastAssistant, extractFirstCode]);

  const last = getLastAssistant();
  const hasCode = !!(last && extractFirstCode(last.content));

  return (
    <ControlsRow aria-label="Quick Controls">
      <QuickRow>
        <MiniSelect aria-label="Preset" value="custom" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => applyPreset(e.target.value as any)}>
          <option value="custom" disabled>Presets…</option>
          {presets.map(p => <option key={p.meta.id} value={p.meta.id}>{p.meta.title}</option>)}
          <option value="fallback_default">Default</option>
          <option value="fallback_codegen">Coding (concise)</option>
          <option value="fallback_explain">Explainer (step-by-step)</option>
          <option value="fallback_strict_json">Strict JSON</option>
        </MiniSelect>
        <MiniButton aria-label="Copy last reply" disabled={!last} onClick={onCopyLast}>Copy last</MiniButton>
        <MiniButton aria-label="Insert first code block" disabled={!hasCode} onClick={onInsertLast}>Insert last</MiniButton>
        <MiniButton aria-label="Clear chat" onClick={() => { clearAll(); }}>Clear</MiniButton>
        <MiniButton aria-label="Stop streaming" onClick={() => { abortStreaming('user_cancel'); fsm.cancel('user_escape'); }}>Stop</MiniButton>
        <MiniButton aria-label="Retry last" onClick={onRetry} disabled={!getLastAssistant()}>Retry</MiniButton>
      </QuickRow>
    </ControlsRow>
  );
};

export default QuickControls;
