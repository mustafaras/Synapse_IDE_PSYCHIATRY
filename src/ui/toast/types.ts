export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  title?: string | undefined;
  duration?: number;
  contextKey?: string | undefined;
  action?: ToastAction | undefined;
  createdAt: number;
}

export interface ShowToastInput {
  kind: ToastKind;
  message: string;
  title?: string;
  duration?: number;
  contextKey?: string;
  action?: ToastAction;
}
