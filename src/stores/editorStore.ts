import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { EditorHistory, EditorTab, FileNode } from '../types/state';

interface EditorStore {

  tabs: EditorTab[];
  activeTabId: string | null;
  history: Record<string, EditorHistory>;


  openTab: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  saveTab: (tabId: string) => void;


  addToHistory: (
    tabId: string,
    content: string,
    cursorPosition: { line: number; column: number }
  ) => void;
  undo: (tabId: string) => string | null;
  redo: (tabId: string) => string | null;
  canUndo: (tabId: string) => boolean;
  canRedo: (tabId: string) => boolean;


  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  saveDirtyTabs: () => void;


  moveTab: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  moveTabLeft: (tabId: string) => void;
  moveTabRight: (tabId: string) => void;
  closeTabsToRight: (tabId: string) => void;
}

const MAX_HISTORY_SIZE = 50;

export const useEditorStore = create<EditorStore>()(
  persist(
    immer((set, get) => ({
      tabs: [],
      activeTabId: null,
      history: {},

      openTab: file =>
        set(state => {

          const existingTab = state.tabs.find(tab => tab.path === file.path);

          if (existingTab) {
            state.activeTabId = existingTab.id;
            return;
          }


          const newTab: EditorTab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileId: file.id,
            name: file.name,
            path: file.path,
            content: file.content || '',
            language: file.language || 'plaintext',
            isDirty: false,
            isActive: true,
            isPinned: false,
            cursorPosition: { line: 1, column: 1 },
            scrollPosition: { top: 0, left: 0 },
            selections: [],
          };


          state.tabs.forEach(tab => {
            tab.isActive = false;
          });

          state.tabs.push(newTab);
          state.activeTabId = newTab.id;

          if (!state.history[newTab.id]) {
            state.history[newTab.id] = {
              undo: [],
              redo: [],
            };
          }
        }),

      closeTab: tabId =>
        set(state => {
          const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
          if (tabIndex === -1) return;

          const isActiveTab = state.activeTabId === tabId;
          state.tabs.splice(tabIndex, 1);


          delete state.history[tabId];


          if (isActiveTab && state.tabs.length > 0) {
            const newActiveIndex = Math.max(0, tabIndex - 1);
            const newActiveTab = state.tabs[newActiveIndex];
            state.activeTabId = newActiveTab.id;
            state.tabs.forEach(tab => {
              tab.isActive = tab.id === newActiveTab.id;
            });
          } else if (state.tabs.length === 0) {
            state.activeTabId = null;
          }
        }),

      setActiveTab: tabId =>
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (!tab) return;

          state.tabs.forEach(t => {
            t.isActive = t.id === tabId;
          });
          state.activeTabId = tabId;
        }),

      updateTabContent: (tabId, content) =>
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (!tab) return;

          tab.content = content;
          tab.isDirty = true;
        }),

      markTabDirty: (tabId, isDirty) =>
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.isDirty = isDirty;
          }
        }),

      saveTab: tabId =>
        set(state => {
          const tab = state.tabs.find(t => t.id === tabId);
          if (tab) {
            tab.isDirty = false;

          }
        }),

      addToHistory: (tabId, content, cursorPosition) =>
        set(state => {
          if (!state.history[tabId]) {
            state.history[tabId] = { undo: [], redo: [] };
          }

          const history = state.history[tabId];


          history.undo.push({
            id: `history-${Date.now()}`,
            timestamp: new Date(),
            content,
            cursorPosition,
          });


          if (history.undo.length > MAX_HISTORY_SIZE) {
            history.undo.shift();
          }


          history.redo = [];
        }),

      undo: tabId => {
        const state = get();
        const history = state.history[tabId];
        if (!history || history.undo.length === 0) return null;

        const currentTab = state.tabs.find(t => t.id === tabId);
        if (!currentTab) return null;

        set(draft => {
          const draftHistory = draft.history[tabId];
          const draftTab = draft.tabs.find(t => t.id === tabId);

          if (!draftHistory || !draftTab) return;


          draftHistory.redo.push({
            id: `redo-${Date.now()}`,
            timestamp: new Date(),
            content: draftTab.content,
            cursorPosition: draftTab.cursorPosition,
          });


          const previousState = draftHistory.undo.pop();
          if (previousState) {
            draftTab.content = previousState.content;
            draftTab.cursorPosition = previousState.cursorPosition;
            draftTab.isDirty = true;
          }
        });

        return state.tabs.find(t => t.id === tabId)?.content || null;
      },

      redo: tabId => {
        const state = get();
        const history = state.history[tabId];
        if (!history || history.redo.length === 0) return null;

        set(draft => {
          const draftHistory = draft.history[tabId];
          const draftTab = draft.tabs.find(t => t.id === tabId);

          if (!draftHistory || !draftTab) return;


          draftHistory.undo.push({
            id: `undo-${Date.now()}`,
            timestamp: new Date(),
            content: draftTab.content,
            cursorPosition: draftTab.cursorPosition,
          });


          const nextState = draftHistory.redo.pop();
          if (nextState) {
            draftTab.content = nextState.content;
            draftTab.cursorPosition = nextState.cursorPosition;
            draftTab.isDirty = true;
          }
        });

        return state.tabs.find(t => t.id === tabId)?.content || null;
      },

      canUndo: tabId => {
        const state = get();
        return (state.history[tabId]?.undo.length || 0) > 0;
      },

      canRedo: tabId => {
        const state = get();
        return (state.history[tabId]?.redo.length || 0) > 0;
      },

      closeAllTabs: () =>
        set(state => {
          state.tabs = [];
          state.activeTabId = null;
          state.history = {};
        }),

      closeOtherTabs: tabId =>
        set(state => {
          const keepTab = state.tabs.find(tab => tab.id === tabId);
          if (!keepTab) return;


          Object.keys(state.history).forEach(id => {
            if (id !== tabId) {
              delete state.history[id];
            }
          });

          state.tabs = [keepTab];
          state.activeTabId = tabId;
          keepTab.isActive = true;
        }),

      saveDirtyTabs: () =>
        set(state => {
          state.tabs.forEach(tab => {
            if (tab.isDirty) {
              tab.isDirty = false;

            }
          });
        }),

      moveTab: (fromIndex, toIndex) =>
        set(state => {
          if (
            fromIndex < 0 ||
            fromIndex >= state.tabs.length ||
            toIndex < 0 ||
            toIndex >= state.tabs.length
          ) {
            return;
          }
          const [movedTab] = state.tabs.splice(fromIndex, 1);
          state.tabs.splice(toIndex, 0, movedTab);
        }),

      moveTabLeft: tabId =>
        set(state => {
          const i = state.tabs.findIndex(t => t.id === tabId);
          if (i <= 0) return;
          const target = i - 1;
          const [t] = state.tabs.splice(i, 1);
          state.tabs.splice(target, 0, t);
        }),

      moveTabRight: tabId =>
        set(state => {
          const i = state.tabs.findIndex(t => t.id === tabId);
          if (i < 0 || i >= state.tabs.length - 1) return;
          const target = i + 1;
          const [t] = state.tabs.splice(i, 1);
          state.tabs.splice(target, 0, t);
        }),

      closeTabsToRight: tabId =>
        set(state => {
          const i = state.tabs.findIndex(t => t.id === tabId);
          if (i < 0) return;
          const toClose = state.tabs.slice(i + 1).map(t => t.id);
          toClose.forEach(id => {
            const idx = state.tabs.findIndex(t => t.id === id);
            if (idx >= 0) state.tabs.splice(idx, 1);
            delete state.history[id];
          });
          state.activeTabId = tabId;
        }),

      pinTab: tabId =>
        set(state => {
          const i = state.tabs.findIndex(t => t.id === tabId);
          if (i < 0) return;
          state.tabs[i].isPinned = true;

          const pinnedCount = state.tabs.filter(t => t.isPinned).length - 1;
          const [t] = state.tabs.splice(i, 1);
          state.tabs.splice(Math.max(0, pinnedCount), 0, t);
        }),

      unpinTab: tabId =>
        set(state => {
          const i = state.tabs.findIndex(t => t.id === tabId);
          if (i < 0) return;
          state.tabs[i].isPinned = false;

          const pinnedCount = state.tabs.filter(t => t.isPinned).length;
          const [t] = state.tabs.splice(i, 1);
          state.tabs.splice(pinnedCount, 0, t);
        }),

      duplicateTab: tabId =>
        set(state => {
          const originalTab = state.tabs.find(tab => tab.id === tabId);
          if (!originalTab) return;

          const duplicatedTab: EditorTab = {
            ...originalTab,
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${originalTab.name} (Copy)`,
            isActive: true,
            isDirty: true,
          };


          state.tabs.forEach(tab => {
            tab.isActive = false;
          });

          state.tabs.push(duplicatedTab);
          state.activeTabId = duplicatedTab.id;


          state.history[duplicatedTab.id] = {
            undo: [...(state.history[tabId]?.undo || [])],
            redo: [],
          };
        }),
    })),
    {
      name: 'enhanced-ide-editor-state',
      partialize: state => ({
        tabs: state.tabs.map(tab => ({
          ...tab,
          isActive: false,
        })),
        history: state.history,
      }),
    }
  )
);


export const useActiveTab = () => {
  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  return tabs.find(tab => tab.id === activeTabId) || null;
};

export const useDirtyTabs = () => {
  const tabs = useEditorStore(s => s.tabs);
  return tabs.filter(tab => tab.isDirty);
};

export const useTabActions = () => {
  const openTab = useEditorStore(s => s.openTab);
  const closeTab = useEditorStore(s => s.closeTab);
  const setActiveTab = useEditorStore(s => s.setActiveTab);
  const updateTabContent = useEditorStore(s => s.updateTabContent);
  const saveTab = useEditorStore(s => s.saveTab);
  const closeAllTabs = useEditorStore(s => s.closeAllTabs);
  const closeOtherTabs = useEditorStore(s => s.closeOtherTabs);
  const saveDirtyTabs = useEditorStore(s => s.saveDirtyTabs);
  const moveTab = useEditorStore(s => s.moveTab);
  const duplicateTab = useEditorStore(s => s.duplicateTab);
  const pinTab = useEditorStore(s => s.pinTab);
  const unpinTab = useEditorStore(s => s.unpinTab);
  const moveTabLeft = useEditorStore(s => s.moveTabLeft);
  const moveTabRight = useEditorStore(s => s.moveTabRight);

  return {
    openTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    closeAllTabs,
    closeOtherTabs,
    saveDirtyTabs,
    moveTab,
    duplicateTab,
    pinTab,
    unpinTab,
    moveTabLeft,
    moveTabRight,
  };
};

export const useEditorHistory = (tabId: string) => {
  const addToHistoryFn = useEditorStore(s => s.addToHistory);
  const undoFn = useEditorStore(s => s.undo);
  const redoFn = useEditorStore(s => s.redo);
  const canUndoFn = useEditorStore(s => s.canUndo);
  const canRedoFn = useEditorStore(s => s.canRedo);

  return {
    addToHistory: (content: string, cursorPosition: { line: number; column: number }) =>
      addToHistoryFn(tabId, content, cursorPosition),
    undo: () => undoFn(tabId),
    redo: () => redoFn(tabId),
    canUndo: canUndoFn(tabId),
    canRedo: canRedoFn(tabId),
  };
};
