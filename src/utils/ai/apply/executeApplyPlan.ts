



import type { ApplyPlan } from './types';

export interface EditorApi {
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string | null;
  createFile: (path: string, content: string, monacoLang: string) => void;
  replaceFile: (path: string, content: string, monacoLang: string) => void;
  insertIntoActive?: (content: string, monacoLang: string) => void;
  setActiveTab?: (path: string) => void;
  pushUndoSnapshot: (path: string, prevContent: string) => void;
}

export interface ExecuteOptions {
  preferInsertIntoActive?: boolean;
  focusEditorAfter?: boolean;
}

export function executeApplyPlan(plan: ApplyPlan, api: EditorApi, opts?: ExecuteOptions) {
  const preferInsert = !!opts?.preferInsertIntoActive && plan.mode === 'beginner';

  for (const item of plan.items) {
    if (preferInsert && api.insertIntoActive) {
      api.insertIntoActive(item.code, item.monaco);
      continue;
    }

    if (item.action === 'replace' && api.fileExists(item.path)) {
      const prev = api.readFile(item.path) ?? '';
      api.pushUndoSnapshot(item.path, prev);
      api.replaceFile(item.path, item.code, item.monaco);
      api.setActiveTab?.(item.path);
    } else {
      api.createFile(item.path, item.code, item.monaco);
      api.setActiveTab?.(item.path);
    }
  }

  if (process.env.NODE_ENV !== 'production') {

    console.debug('[DEV][apply-plan] executed', plan);
  }
}
