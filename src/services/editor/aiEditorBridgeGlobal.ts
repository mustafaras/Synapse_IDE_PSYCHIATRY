
import { editorBridge as eventBridge } from '@/services/editor/bridge';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';
import { useEditorStore } from '@/stores/editorStore';
import { inferLanguageFromFence } from '@/services/editorBridge';
import { showToast } from '@/ui/toast/api';


interface FileNodeLike { id: string; type: string; path: string; name?: string; content?: string }
function findFileByPath(path: string): FileNodeLike | undefined {
  try {
    const norm = path.replace(/^\//, '');
    const files = useFileExplorerStore.getState().files as unknown as FileNodeLike[];
    const walk = (nodes: FileNodeLike[]): FileNodeLike | undefined => {
      for (const n of nodes) {
        if (n.type === 'file' && (n.path === norm || n.path === `/${norm}`)) return n as FileNodeLike;
        const anyN = n as unknown as { children?: FileNodeLike[] };
        if (Array.isArray(anyN.children)) {
          const f = walk(anyN.children); if (f) return f;
        }
      }
      return undefined;
    };
    return walk(files);
  } catch { return undefined; }
}

function fileExists(path: string): boolean {
  return !!findFileByPath(path);
}

function writeFile(path: string, code: string, _opts?: { create?: boolean; overwrite?: boolean }) {
  const norm = path.replace(/^\//, '');
  const existing = findFileByPath(norm);
  if (existing) {
    useFileExplorerStore.getState().updateFile(existing.id, { content: code, lastModified: new Date() });
    const ed = useEditorStore.getState();
    const tab = ed.tabs.find(t => t.path === existing.path || t.id === existing.id);
    if (tab) ed.updateTabContent(tab.id, code);
  } else {
    const parentPath = norm.includes('/') ? norm.replace(/\\/g, '/').split('/').slice(0, -1).join('/') || '/' : '/';
    const filename = norm.split(/[/\\]/).pop() || 'untitled.txt';
    const newFile: FileNodeLike & { content: string; lastModified: Date; size: number; language: string } = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: filename,
      type: 'file',
      path: norm,
      content: code,
      language: inferLanguageFromFence(undefined, code),
      lastModified: new Date(),
      size: code.length,
    };
    const parentNormalized = parentPath === '/' ? '/' : parentPath.startsWith('/') ? parentPath : `/${parentPath}`;

  useFileExplorerStore.getState().addFile(newFile as unknown as never, parentNormalized);
  }
}

function readFile(path: string): string | undefined {
  const f = findFileByPath(path);
  return f?.content as string | undefined;
}

function insertAtCursor(code: string) {
  try { eventBridge.insertAtCursor({ code }); } catch {  }
}

function replaceSelection(code: string) {
  try { eventBridge.replaceActive({ code }); } catch {  }
}


function toast(msg: string, level: string = 'info') {
  try { showToast({ kind: level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info', message: msg }); } catch {}
}


function buildBridge() {
  return { insertAtCursor, replaceSelection, writeFile, readFile, fileExists, showToast: toast };
}
if (typeof window !== 'undefined') {
  if (!window.__AI_EDITOR_BRIDGE__) {
    window.__AI_EDITOR_BRIDGE__ = buildBridge();
    try { toast('[ai] editor bridge ready'); } catch {}
  }
}

export {};
