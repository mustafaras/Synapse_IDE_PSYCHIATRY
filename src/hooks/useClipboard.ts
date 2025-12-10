import { useCallback, useState } from 'react';
import type { FileNode } from '@/types/state';
import { useFileExplorerStore } from '@/stores/fileExplorerStore';

export type ClipboardMode = 'copy' | 'cut';

export interface ClipboardEventPayload {
  sourcePath?: string;
  destinationPath?: string;
  name?: string;
}

export type ClipboardEventType = 'copy' | 'cut' | 'paste' | 'error' | 'noop';

export function useClipboard(
  onEvent?: (type: ClipboardEventType, message: string, payload?: ClipboardEventPayload) => void
) {
  const [clipboard, setClipboard] = useState<{ node: FileNode; mode: ClipboardMode } | null>(null);

  const addFile = useFileExplorerStore(s => s.addFile);
  const moveFile = useFileExplorerStore(s => s.moveFile);
  const expandedFolders = useFileExplorerStore(s => s.expandedFolders);
  const toggleFolder = useFileExplorerStore(s => s.toggleFolder);
  const getFileByPath = useFileExplorerStore(s => s.getFileByPath);

  const log = (type: ClipboardEventType, msg: string, payload?: ClipboardEventPayload) => {
    console.log(`[Clipboard] ${msg}`, payload || '');
    onEvent?.(type, msg, payload);
  };

  const copy = useCallback((node: FileNode) => {

    const deepClone = (n: FileNode): FileNode => ({
      ...n,

      children: n.children ? n.children.map(deepClone) : undefined,
    });
    setClipboard({ node: deepClone(node), mode: 'copy' });
    log('copy', `Copied "${node.name}"`, { sourcePath: node.path, name: node.name });
  }, []);

  const cut = useCallback((node: FileNode) => {
    setClipboard({ node, mode: 'cut' });
    log('cut', `Cut "${node.name}"`, { sourcePath: node.path, name: node.name });
  }, []);


  const genId = () => `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;


  const cloneWithNewIds = (node: FileNode, baseDestPath: string): FileNode => {
    const newPath = `${baseDestPath}/${node.name}`;
    const newNode: FileNode = {
      ...node,
      id: genId(),
      path: newPath,
      lastModified: new Date(),
      children: node.children
        ? node.children.map(child => cloneWithNewIds(child, newPath))
        : undefined,
    };
    return newNode;
  };


  const uniquifyName = (name: string, parentPath: string): string => {
    const parent = getFileByPath(parentPath);
    const siblings = new Set((parent?.children || []).map(c => c.name));
    if (!siblings.has(name)) return name;

    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.substring(0, dot) : name;
    const ext = dot > 0 ? name.substring(dot) : '';


    let i = 2;
    let candidate = `${base} (${i})${ext}`;
    while (siblings.has(candidate)) {
      i++;
      candidate = `${base} (${i})${ext}`;
    }
    return candidate;
  };


  const rebuildPaths = (node: FileNode, parentPath: string) => {
    node.path = `${parentPath}/${node.name}`;
    if (node.children) {
      node.children.forEach(child => rebuildPaths(child, node.path));
    }
  };

  const paste = useCallback(
    (targetFolder: FileNode | null) => {
      if (!clipboard || !targetFolder || targetFolder.type !== 'folder') {
        log('noop', 'Paste ignored (no clipboard or invalid target)');
        return;
      }

      const original = clipboard.node;


      const originalParent = original.path.includes('/')
        ? original.path.substring(0, original.path.lastIndexOf('/'))
        : '';
      if (clipboard.mode === 'cut' && originalParent === targetFolder.path) {
        log('noop', 'Cut+Paste into same folder ignored', {
          sourcePath: original.path,
          destinationPath: targetFolder.path,
        });
        return;
      }


      if (original.type === 'folder') {
        if (original.id === targetFolder.id) {
          log('error', 'Cannot paste folder into itself', {
            sourcePath: original.path,
            destinationPath: targetFolder.path,
          });
          return;
        }
        const targetPath = `${targetFolder.path  }/`;
        if ((`${original.path  }/`).startsWith(targetPath)) {

        }
        if (targetPath.startsWith(`${original.path  }/`)) {
          log('error', 'Cannot paste folder into its descendant', {
            sourcePath: original.path,
            destinationPath: targetFolder.path,
          });
          return;
        }
      }

      const baseDestPath = targetFolder.path;

      if (clipboard.mode === 'cut') {

        moveFile(original.id, baseDestPath);

        if (!expandedFolders.includes(targetFolder.id)) {
          toggleFolder(targetFolder.id);
        }

        setTimeout(() => {
          const el = document.querySelector(`[data-file-id="${original.id}"]`) as HTMLElement;
          if (el) el.style.animation = `refinedHighlight 300ms ease-out`;
        }, 80);

        setClipboard(null);

        log('paste', `Pasted "${original.name}" into "${targetFolder.name}"`, {
          sourcePath: original.path,
          destinationPath: `${targetFolder.path}/${original.name}`,
          name: original.name,
        });
        return;
      }


      let cloned = cloneWithNewIds(original, baseDestPath);

      const unique = uniquifyName(cloned.name, baseDestPath);
      if (unique !== cloned.name) {
        cloned = { ...cloned, name: unique };
        rebuildPaths(cloned, baseDestPath);
      }

      addFile(cloned, baseDestPath);

      if (!expandedFolders.includes(targetFolder.id)) {
        toggleFolder(targetFolder.id);
      }

      setTimeout(() => {
        const el = document.querySelector(`[data-file-id="${cloned.id}"]`) as HTMLElement;
        if (el) el.style.animation = `refinedHighlight 300ms ease-out`;
      }, 80);

      log('paste', `Pasted "${original.name}" into "${targetFolder.name}"`, {
        sourcePath: original.path,
        destinationPath: `${targetFolder.path}/${original.name}`,
        name: original.name,
      });
    },
    [clipboard, addFile, moveFile, expandedFolders, toggleFolder]
  );

  return {
    clipboardNode: clipboard?.node || null,
    mode: clipboard?.mode || null,
    copy,
    cut,
    paste,
  } as const;
}
