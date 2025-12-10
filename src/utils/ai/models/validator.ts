import { getModel, inferEndpointForModel, listModelsByProvider, type ProviderKey } from './registry';
import type { EndpointId, RequiredCapability, ValidationResult } from './schema';

export function validateSelection(provider: ProviderKey, modelId: string | undefined, required: RequiredCapability): ValidationResult {
  if (!modelId) return { ok: false, reason: 'No model selected.' };
  const m = getModel(modelId);
  if (!m) return { ok: false, reason: `Unknown model: ${modelId}` };
  if (m.provider !== provider) {
    return {
      ok: false,
      reason: `Model ${modelId} belongs to ${m.provider}, but provider ${provider} is selected.`,
      alternatives: listModelsByProvider(provider).slice(0, 6).map(x => ({ provider: x.provider, model: x.id, label: x.label })),
    };
  }

  const endpoint = inferEndpointForModel(modelId);
  if (!endpoint) {
    return { ok: false, reason: 'Endpoint could not be inferred for this model.' };
  }
  if (required === 'chat_stream') {
    const ok = isChatEndpoint(endpoint);
    if (!ok) {
      return {
        ok: false,
        reason: `Model ${modelId} is not compatible with chat streaming.`,
        endpoint,
        alternatives: listModelsByProvider(provider).filter(x => isChatEndpoint(inferEndpointForModel(x.id) as EndpointId)).slice(0, 6).map(x => ({ provider: x.provider, model: x.id, label: x.label })),
      };
    }
  }
  return { ok: true, endpoint };
}

function isChatEndpoint(e: EndpointId | undefined): boolean {
  if (!e) return false;
  return e === 'openai_chat_completions' || e === 'anthropic_messages' || e === 'gemini_generate' || e === 'ollama_generate';
}
