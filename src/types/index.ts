

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface Theme {
  name: 'neutral';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  glassmorphism: {
    background: string;
    backdrop: string;
    border: string;
    shadow: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  zIndex: {
    dropdown: number;
    modal: number;
    tooltip: number;
    toast: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'neutral';
  fontSize: number;
  fontFamily: string;
  keyBindings: 'vscode' | 'vim' | 'emacs';
  autoSave: boolean;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  tabSize: number;
  insertSpaces: boolean;
}

export interface File {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isModified: boolean;
  lastModified: Date;
  size: number;
  type: 'file' | 'directory';
  children?: File[];
}

export interface EditorTab {
  id: string;
  file: File;
  isActive: boolean;
  isDirty: boolean;
  cursorPosition: {
    line: number;
    column: number;
  };
}

export interface CodeCompletion {
  label: string;
  kind: string;
  detail?: string;
  documentation?: string;
  insertText: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
}

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  source?: string;
  code?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  rootPath: string;
  files: File[];
  settings: ProjectSettings;
  collaborators?: User[];
}

export interface ProjectSettings {
  language: string;
  framework?: string;
  buildCommand?: string;
  runCommand?: string;
  testCommand?: string;
  linting: boolean;
  formatting: boolean;
  autoSave: boolean;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  actions?: NotificationAction[];
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface KeyBinding {
  key: string;
  command: string;
  when?: string;
  args?: any;
}

export interface Command {
  id: string;
  title: string;
  category?: string;
  icon?: string;
  keybinding?: string;
  execute: (...args: any[]) => void | Promise<void>;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  enabled: boolean;
  commands?: Command[];
  keybindings?: KeyBinding[];
}


export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}


export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface GlassmorphismConfig {
  blur: string;
  opacity: number;
  borderOpacity: number;
  shadowOpacity: number;
}
