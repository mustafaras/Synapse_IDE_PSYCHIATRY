

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'neutral' | 'auto';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  keyBindings: 'vscode' | 'vim' | 'emacs';
  glassmorphismIntensity: number;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string | undefined;
  language?: string | undefined;
  isDirty?: boolean | undefined;
  lastModified: Date;
  size?: number | undefined;
  children?: FileNode[] | undefined;
  isExpanded?: boolean | undefined;
  isSelected?: boolean | undefined;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  isPinned?: boolean;
  cursorPosition: { line: number; column: number };
  scrollPosition: { top: number; left: number };
  selections: Array<{
    start: { line: number; column: number };
    end: { line: number; column: number };
  }>;
}

export interface EditorHistory {
  undo: Array<{
    id: string;
    timestamp: Date;
    content: string;
    cursorPosition: { line: number; column: number };
  }>;
  redo: Array<{
    id: string;
    timestamp: Date;
    content: string;
    cursorPosition: { line: number; column: number };
  }>;
}

export interface AppLayout {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  rightPanelCollapsed: boolean;
  rightPanelWidth: number;
  terminalVisible: boolean;
  terminalHeight: number;
  aiChatVisible: boolean;
  aiAssistantWidth?: number;
  aiAssistantHeight?: number;
  panelSizes: {
    explorer: number;
    search: number;
    git: number;
    extensions: number;
  };
}

export interface CollaborationState {
  isConnected: boolean;
  roomId?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    cursor?: { line: number; column: number };
    selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
  }>;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
  };
}

export interface AppError {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp: Date;
  dismissed: boolean;
  retryAction?: () => void;
}

export interface GlobalState {
  user: User | null;
  isAuthenticated: boolean;
  layout: AppLayout;
  errors: AppError[];
  collaboration: CollaborationState;
  isLoading: boolean;
  lastActivity: Date;
}
