import { useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { AppError, AppLayout, GlobalState, User, UserPreferences } from '../types/state';


interface AppStore extends GlobalState {

  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  updateLayout: (layout: Partial<AppLayout>) => void;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  dismissError: (errorId: string) => void;
  clearErrors: () => void;
  setLoading: (isLoading: boolean) => void;
  updateLastActivity: () => void;


  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  toggleTerminal: () => void;
  setSidebarWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setTerminalHeight: (height: number) => void;
  setAiAssistantWidth: (width: number) => void;
  setAiAssistantHeight: (height: number) => void;
  toggleAiChat: () => void;
  setAiChatVisible: (visible: boolean) => void;
}

const defaultLayout: AppLayout = {
  sidebarCollapsed: false,
  sidebarWidth: 300,
  rightPanelCollapsed: false,
  rightPanelWidth: 400,
  terminalVisible: true,

  terminalHeight: 320,
  aiChatVisible: true,
  aiAssistantWidth: 500,
  panelSizes: {
    explorer: 200,
    search: 150,
    git: 180,
    extensions: 160,
  },
};

const defaultUserPreferences: UserPreferences = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'Fira Code, Monaco, Menlo, monospace',
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  autoSave: true,
  keyBindings: 'vscode',
  glassmorphismIntensity: 0.1,
};

export const useAppStore = create<AppStore>()(
  persist(
    immer(set => ({

      user: null,
      isAuthenticated: false,
      layout: defaultLayout,
      errors: [],
      collaboration: {
        isConnected: false,
        participants: [],
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: true,
        },
      },
      isLoading: false,
      lastActivity: new Date(),


      setUser: user =>
        set(state => {
          state.user = user;
          if (user) {
            state.isAuthenticated = true;
          }
        }),

      updateUserPreferences: preferences =>
        set(state => {
          if (state.user) {
            Object.assign(state.user.preferences, preferences);
          }
        }),

      setAuthenticated: isAuthenticated =>
        set(state => {
          state.isAuthenticated = isAuthenticated;
          if (!isAuthenticated) {
            state.user = null;
          }
        }),

      updateLayout: layout =>
        set(state => {
          Object.assign(state.layout, layout);
        }),

      addError: error =>
        set(state => {
          const newError: AppError = {
            ...error,
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            dismissed: false,
          };
          state.errors.push(newError);
        }),

      dismissError: errorId =>
        set(state => {
          const error = state.errors.find(e => e.id === errorId);
          if (error) {
            error.dismissed = true;
          }
        }),

      clearErrors: () =>
        set(state => {
          state.errors = state.errors.filter(e => !e.dismissed);
        }),

      setLoading: isLoading =>
        set(state => {
          state.isLoading = isLoading;
        }),

      updateLastActivity: () =>
        set(state => {
          state.lastActivity = new Date();
        }),


      toggleSidebar: () =>
        set(state => {
          state.layout.sidebarCollapsed = !state.layout.sidebarCollapsed;
        }),

      toggleRightPanel: () =>
        set(state => {
          state.layout.rightPanelCollapsed = !state.layout.rightPanelCollapsed;
        }),

      toggleAiChat: () =>
        set(state => {
          state.layout.aiChatVisible = !state.layout.aiChatVisible;
        }),

      setAiChatVisible: (visible: boolean) =>
        set(state => {
          state.layout.aiChatVisible = !!visible;
        }),

      toggleTerminal: () =>
        set(state => {
          state.layout.terminalVisible = !state.layout.terminalVisible;
        }),

      setSidebarWidth: width =>
        set(state => {
          state.layout.sidebarWidth = Math.max(200, Math.min(600, width));
        }),

      setRightPanelWidth: width =>
        set(state => {
          state.layout.rightPanelWidth = Math.max(300, Math.min(800, width));
        }),

      setAiAssistantWidth: width =>
        set(state => {

          state.layout.aiAssistantWidth = Math.max(320, Math.min(900, width));
        }),

      setAiAssistantHeight: height =>
        set(state => {

          const maxH = Math.min(
            typeof window !== 'undefined' ? window.innerHeight * 0.95 : 900,
            900
          );
          state.layout.aiAssistantHeight = Math.max(240, Math.min(maxH, height));
        }),

      setTerminalHeight: height =>
        set(state => {

          state.layout.terminalHeight = Math.max(28, Math.min(600, height));
        }),
    })),
    {
      name: 'enhanced-ide-app-state',
      partialize: state => ({
        user: state.user,
        layout: state.layout,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


export const useLayoutActions = () => {
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const toggleRightPanel = useAppStore(s => s.toggleRightPanel);
  const toggleTerminal = useAppStore(s => s.toggleTerminal);
  const toggleAiChat = useAppStore(s => s.toggleAiChat);
  const setSidebarWidth = useAppStore(s => s.setSidebarWidth);
  const setRightPanelWidth = useAppStore(s => s.setRightPanelWidth);
  const setTerminalHeight = useAppStore(s => s.setTerminalHeight);
  const updateLayout = useAppStore(s => s.updateLayout);

  return useMemo(
    () => ({
      toggleSidebar,
      toggleRightPanel,
      toggleTerminal,
      toggleAiChat,
      setSidebarWidth,
      setRightPanelWidth,
      setTerminalHeight,
      updateLayout,
    }),
    [
      toggleSidebar,
      toggleRightPanel,
      toggleTerminal,
      toggleAiChat,
      setSidebarWidth,
      setRightPanelWidth,
      setTerminalHeight,
      updateLayout,
    ]
  );
};


export const useUserPreferences = () => {
  const user = useAppStore(s => s.user);
  const updateUserPreferences = useAppStore(s => s.updateUserPreferences);

  const preferences = useMemo(() => user?.preferences || defaultUserPreferences, [user]);

  const updatePreferences = useCallback(
    (newPreferences: Partial<UserPreferences>) => {
      updateUserPreferences(newPreferences);
    },
    [updateUserPreferences]
  );

  return { preferences, updatePreferences };
};


export const useErrorManager = () => {
  const errors = useAppStore(s => s.errors);
  const addError = useAppStore(s => s.addError);
  const dismissError = useAppStore(s => s.dismissError);
  const clearErrors = useAppStore(s => s.clearErrors);
  const showError = useCallback(
    (message: string, details?: string, retryAction?: () => void) => {
      addError({
        type: 'error',
        message,
        ...(details && { details }),
        ...(retryAction && { retryAction }),
        dismissed: false,
      });
    },
    [addError]
  );

  const showWarning = useCallback(
    (message: string, details?: string) => {
      addError({
        type: 'warning',
        message,
        ...(details && { details }),
        dismissed: false,
      });
    },
    [addError]
  );

  const showInfo = useCallback(
    (message: string, details?: string) => {
      addError({
        type: 'info',
        message,
        ...(details && { details }),
        dismissed: false,
      });
    },
    [addError]
  );

  return {
    errors: errors.filter(e => !e.dismissed),
    showError,
    showWarning,
    showInfo,
    dismissError,
    clearErrors,
  };
};
