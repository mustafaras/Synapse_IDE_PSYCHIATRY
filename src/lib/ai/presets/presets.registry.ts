import type { Preset, PresetId } from './presets.types';
import type { ProviderId } from '@/lib/settings/settings.types';

const PRESETS: Record<PresetId, Preset> = {
  deterministic_coding: {
    meta: { id: 'deterministic_coding', title: 'Deterministic Coding', description: 'Low temperature, predictable output' },
    patch: { sampling: { temperature: 0.2, top_p: 0.9 }, flags: { wrapCode: true, ligatures: true } },
  },
  balanced_chat: {
    meta: { id: 'balanced_chat', title: 'Balanced Chat', description: 'General-purpose chat' },
    patch: { sampling: { temperature: 0.6, top_p: 1.0 } },
  },
  creative_ideation: {
    meta: { id: 'creative_ideation', title: 'Creative Ideation', description: 'High diversity for brainstorming' },
    patch: { sampling: { temperature: 0.9, top_p: 1.0 } },
  },
  rag_qa: {
    meta: { id: 'rag_qa', title: 'RAG Q&A', description: 'Grounded Q&A with low temperature' },
    patch: { sampling: { temperature: 0.2, top_p: 0.8 }, flags: { confirmBeforeApply: true } },
  },
  tool_use_heavy: {
    meta: { id: 'tool_use_heavy', title: 'Tool-Use Heavy', description: 'Structured outputs and tools' },
    patch: { sampling: { temperature: 0.4, top_p: 0.9 }, flags: { shareSelection: true } },
  },
};

export function getPreset(id: PresetId): Preset | null {
  return PRESETS[id] || null;
}

export function listPresets(provider: ProviderId, model?: string): Preset[] {

  const arr = Object.values(PRESETS);
  return arr.filter(p => {
    const okProvider = !p.meta.providers || p.meta.providers.includes(provider);
    const okModel = !p.meta.models || (model ? p.meta.models.includes(model) : true);
    return okProvider && okModel;
  });
}

export const ALL_PRESETS: Preset[] = Object.values(PRESETS);