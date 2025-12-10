import type { Scene } from './scenes.types';
import type { SettingsPayloadV2 } from '@/lib/settings/settings.types';

function merge<T extends object>(base: T, patch?: Partial<T>): T {
  const out = { ...(base as any) } as any;
  if (!patch) return out as T;
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = { ...(out[k] || {}), ...v };
    else out[k] = v as any;
  }
  return out as T;
}

export function applySceneRuntime(base: SettingsPayloadV2, scene: Scene): SettingsPayloadV2 {
  const next: SettingsPayloadV2 = JSON.parse(JSON.stringify(base));
  next.sampling = merge(next.sampling, scene.patch.sampling);
  next.flags = merge(next.flags, scene.patch.flags);

  next.meta = { ...(next.meta ?? {}), lastSceneId: scene.meta.id } as any;
  return next;
}
