import type { SettingsPayloadV2, SettingsProfile, SettingsStateV2 } from './settings.types';
import type { AssistantSettings } from '@/components/ai/types';
import { listModelsByProvider } from '@/utils/ai/models/registry';
import { defaultKeymap } from '@/lib/keys/defaultKeymap';
import { detectPlatform } from '@/lib/keys/platform';

function uuid() { try { return crypto.randomUUID(); } catch { return `profile-${  Math.random().toString(36).slice(2)}`; } }

function toV2FromLegacy(s: AssistantSettings): SettingsStateV2 {
  const provider = s.settings.provider as any;
  const fallback = (listModelsByProvider((provider === 'auto' ? 'openai' : provider) as any)[0]?.id) || s.settings.model || 'gpt-4o-mini';
  const payload: SettingsPayloadV2 = {
    version: 2,
    provider,
    model: s.settings.model || fallback,
    sampling: { temperature: s.settings.temperature ?? 0.3, top_p: s.settings.top_p ?? 1, max_output_tokens: null },
    embeddings: {
      provider: (s.ui?.embedProvider as any) || 'ollama',
      model: s.ui?.embedModelName || (provider === 'openai' ? 'text-embedding-3-small' : 'nomic-embed-text'),
      dim: (s.ui?.embedDim as any) ?? null,
    },
    flags: {
      wrapCode: !!s.ui?.codeWrap,
      compactBubbles: !!s.ui?.compact,
      confirmBeforeApply: !!s.ui?.safeModeConfirmEdits,
      shareSelection: !!(s.ui as any)?.shareSelectionByDefault,
      telemetryUsageOnly: !!s.ui?.telemetry,
      ligatures: (s.ui as any)?.ligatures,
    },
    secrets: (() => {
      const sec: any = { rememberSecrets: false, source: 'manual' };
      if (s.settings.ollamaBaseUrl) sec.proxyUrl = s.settings.ollamaBaseUrl;
      return sec;
    })(),
  };
  const profile: SettingsProfile = {
    id: uuid(),
    name: 'Migrated',
    data: payload,
    updatedAt: Date.now(),
    isDefault: true,
    keymap: defaultKeymap(detectPlatform()),
  };
  return { profiles: [profile], activeProfileId: profile.id, dirty: false };
}

export function migrateAny(input: unknown): SettingsStateV2 | null {

  const maybe = input as any;
  if (maybe && Array.isArray(maybe.profiles) && typeof maybe.activeProfileId === 'string') {

    const plat = detectPlatform();
  const profiles = (maybe.profiles as any[]).map(p => ({ ...p, keymap: p.keymap || defaultKeymap(plat) }));
    return { profiles, activeProfileId: maybe.activeProfileId, dirty: false } as SettingsStateV2;
  }

  if (maybe && (maybe.settings?.provider || maybe.provider)) {
    const s: AssistantSettings = maybe.settings ? maybe as AssistantSettings : {
      settings: {
        provider: (maybe as any).provider,
        model: (maybe as any).model,
        temperature: (maybe as any).temperature,
        top_p: (maybe as any).top_p,
        ollamaBaseUrl: (maybe as any).ollamaBaseUrl,
      },
      keys: (maybe as any).keys,
      ui: (maybe as any).ui || {},
    } as AssistantSettings;
    return toV2FromLegacy(s);
  }
  return null;
}
