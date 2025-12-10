import type { Scene, SceneId } from './scenes.types';

const SCENES: Record<SceneId, Scene> = {
  code_review: {
    meta: { id: 'code_review', title: 'Code Review', description: 'Careful review with structured feedback' },
    patch: { sampling: { temperature: 0.2 }, flags: { wrapCode: true }, systemPromptKey: 'scene.codeReview' },
  },
  bug_fix: {
    meta: { id: 'bug_fix', title: 'Bug Fix', description: 'Reproduce and suggest minimal fix' },
    patch: { sampling: { temperature: 0.2, top_p: 0.9 }, flags: { confirmBeforeApply: true } },
  },
  doc_writer: {
    meta: { id: 'doc_writer', title: 'Doc Writer', description: 'Produce clear documentation' },
    patch: { sampling: { temperature: 0.6 } },
  },
  rag_search: {
    meta: { id: 'rag_search', title: 'RAG Search', description: 'Grounded answers with retrieval' },
    patch: { sampling: { temperature: 0.2, top_p: 0.8 }, flags: { shareSelection: true } },
  },
  brainstorm: {
    meta: { id: 'brainstorm', title: 'Brainstorm', description: 'Divergent thinking and ideas' },
    patch: { sampling: { temperature: 0.9, top_p: 1.0 }, flags: { ligatures: true } },
  },
};

export function listScenes(): Scene[] { return Object.values(SCENES); }
export function getScene(id: SceneId): Scene | null { return SCENES[id] || null; }
