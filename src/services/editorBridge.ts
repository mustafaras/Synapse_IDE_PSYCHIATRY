
import { useEditorStore } from '@/stores/editorStore';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import type { FileNode } from '@/types/state';

export type SupportedLang =
  | 'html'
  | 'css'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'json'
  | 'markdown';

export function inferLanguageFromFence(langHint?: string, code?: string): SupportedLang {
  const hint = (langHint || '').trim().toLowerCase();
  if (hint) {
    if (/^js|javascript|jsx$/.test(hint)) return 'javascript';
    if (/^ts|typescript|tsx$/.test(hint)) return 'typescript';
    if (/^py|python$/.test(hint)) return 'python';
    if (/^md|markdown$/.test(hint)) return 'markdown';
    if (/^json$/.test(hint)) return 'json';
    if (/^css$/.test(hint)) return 'css';
    if (/^html?$/.test(hint)) return 'html';
  }
  const src = code || '';
  if (/<!DOCTYPE html>|<html[\s>]/i.test(src)) return 'html';
  if (/^(\s*\{|\s*\[)/.test(src.trim()) && /"[\w-]+"\s*:/.test(src)) return 'json';
  if (/function |=>|const |let |var /.test(src) && /;|\(/.test(src)) return 'javascript';
  if (/^\s*#\!.*python|def |import sys|print\(/.test(src)) return 'python';
  if (/^\s*\{[\s\S]*type\s+[A-Za-z]/.test(src) || /:\s*string|:\s*number/.test(src))
    return 'typescript';
  if (/^\s*#{1,6}\s+/.test(src) || /```/.test(src)) return 'markdown';
  if (/^[\s\S]*\{[\s\S]*:[^;]+;/.test(src) && /\b[a-z-]+:\s*[^;]+;/.test(src)) return 'css';
  return 'javascript';
}

interface InsertOpts {
  code: string;
  language?: SupportedLang;
}
interface NewTabOpts {
  filename: string;
  code: string;
  language?: SupportedLang;
}
interface ReplaceOpts {
  code: string;
  language?: SupportedLang;
}

function pushHistory(tabId: string, previous: string) {
  try {
    const store = useEditorStore.getState();
    const tab = store.tabs.find(t => t.id === tabId);
    const cursor = tab?.cursorPosition || { line: 1, column: 1 };
    store.addToHistory(tabId, previous, cursor);
  } catch {}
}

export async function insertIntoActive(opts: InsertOpts): Promise<{ tabId: string }> {
  const { code } = opts;
  const store = useEditorStore.getState();
  let activeId = store.activeTabId;
  let tab = store.tabs.find(t => t.id === activeId);
  if (!tab) {
    const filename = `untitled-${Date.now()}.js`;
    const fileNode: FileNode = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: filename,
      type: 'file',
      path: filename,
      content: '',
      language: opts.language || inferLanguageFromFence(undefined, code),
      lastModified: new Date(),
      size: code.length,
    };
    useFileExplorerStore.getState().addFile(fileNode, '/');
    useEditorStore.getState().openTab(fileNode);
    activeId = useEditorStore.getState().activeTabId;
    tab = useEditorStore.getState().tabs.find(t => t.id === activeId) || undefined;
  }
  if (!tab) throw new Error('No active tab available');
  const prev = tab.content;
  pushHistory(tab.id, prev);
  const newContent = prev + (prev.endsWith('\n') || prev.length === 0 ? '' : '\n') + code;
  useEditorStore.getState().updateTabContent(tab.id, newContent);
  return { tabId: tab.id };
}

export async function openNewTab(opts: NewTabOpts): Promise<{ tabId: string }> {
  const { filename, code } = opts;
  const lang = opts.language || inferLanguageFromFence(undefined, code);
  const fileNode: FileNode = {
    id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: filename,
    type: 'file',
    path: filename.startsWith('/') ? filename.slice(1) : filename,
    content: code,
    language: lang,
    lastModified: new Date(),
    size: code.length,
  };
  useFileExplorerStore.getState().addFile(fileNode, '/');
  useEditorStore.getState().openTab(fileNode);
  const newId = useEditorStore.getState().activeTabId as string;
  pushHistory(newId, '');
  return { tabId: newId };
}

export async function replaceSelection(opts: ReplaceOpts): Promise<{ tabId: string }> {
  const store = useEditorStore.getState();
  const activeId = store.activeTabId;
  if (!activeId) throw new Error('No active tab to replace');
  const tab = store.tabs.find(t => t.id === activeId);
  if (!tab) throw new Error('Active tab not found');
  const prev = tab.content;
  pushHistory(tab.id, prev);
  useEditorStore.getState().updateTabContent(tab.id, opts.code);
  return { tabId: tab.id };
}

export const editorBridge = {
  inferLanguageFromFence,
  insertIntoActive,
  openNewTab,
  replaceSelection,
};
export default editorBridge;
