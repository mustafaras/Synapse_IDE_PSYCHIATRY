import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileNode } from '@/types/state';

export interface ContextMenuState<T = FileNode | null> {
  visible: boolean;
  x: number;
  y: number;
  selected: T;
}

interface OpenEventLike {
  clientX: number;
  clientY: number;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

export function useContextMenu<T = FileNode | null>() {
  const [state, setState] = useState<ContextMenuState<T>>({
    visible: false,
    x: 0,
    y: 0,
    selected: null as unknown as T,
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeContextMenu = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const openContextMenu = useCallback((e: OpenEventLike, selected: T) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();


    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const padding = 8;
    const approxMenuW = 220;
    const approxMenuH = 240;

    const x = Math.min(Math.max(padding, e.clientX), vw - approxMenuW - padding);
    const y = Math.min(Math.max(padding, e.clientY), vh - approxMenuH - padding);

    setState({ visible: true, x, y, selected });
  }, []);


  useEffect(() => {
    if (!state.visible) return;

    const onMouseDown = (ev: MouseEvent) => {
      const target = ev.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        closeContextMenu();
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        closeContextMenu();
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [state.visible, closeContextMenu]);

  return { state, openContextMenu, closeContextMenu, menuRef } as const;
}
