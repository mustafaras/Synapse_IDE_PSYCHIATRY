import type { Preset, PresetApplyPlan, PresetDiffItem } from './presets.types';
import type { SettingsPayloadV2 } from '@/lib/settings/settings.types';

function setAtPath(obj: any, path: string[], value: unknown) {
  if (path.length === 0) return;
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[path[path.length - 1]] = value as any;
}

export function makePresetPlan(current: SettingsPayloadV2, preset: Preset): PresetApplyPlan {
  const diffs: PresetDiffItem[] = [];
  const add = (path: string, from: unknown, to: unknown) => {
    if (JSON.stringify(from) !== JSON.stringify(to)) diffs.push({ path, from, to });
  };

  const p = preset.patch;
  if (p.provider !== undefined) add('provider', current.provider, p.provider);
  if (p.model !== undefined) add('model', current.model, p.model);
  if (p.sampling) {
    for (const [k, v] of Object.entries(p.sampling)) {
      add(`sampling.${k}`, (current.sampling as any)[k], v);
    }
  }
  if (p.flags) {
    for (const [k, v] of Object.entries(p.flags)) {
      add(`flags.${k}`, (current.flags as any)[k], v);
    }
  }
  if (p.embeddings) {
    for (const [k, v] of Object.entries(p.embeddings)) {
      add(`embeddings.${k}`, (current.embeddings as any)[k], v);
    }
  }
  const willChangeModel = diffs.some(d => d.path === 'model');
  return { presetId: preset.meta.id, diffs, willChangeModel };
}

export function applyPreset(current: SettingsPayloadV2, preset: Preset): SettingsPayloadV2 {
  const next: SettingsPayloadV2 = JSON.parse(JSON.stringify(current));
  const p = preset.patch;
  if (p.provider !== undefined) next.provider = p.provider;
  if (p.model !== undefined) next.model = p.model;
  if (p.sampling) {
    for (const [k, v] of Object.entries(p.sampling)) setAtPath(next, ['sampling', k], v);
  }
  if (p.flags) {
    for (const [k, v] of Object.entries(p.flags)) setAtPath(next, ['flags', k], v);
  }
  if (p.embeddings) {
    for (const [k, v] of Object.entries(p.embeddings)) setAtPath(next, ['embeddings', k], v);
  }
  next.meta = { ...(current.meta ?? {}), lastPresetId: preset.meta.id };
  return next;
}