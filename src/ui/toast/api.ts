import { useToastStore } from './store';
import type { ShowToastInput, ToastKind } from './types';


export function showToast(input: ShowToastInput) {
  return useToastStore.getState().show(input);
}
export function dismissToast(id: string) {
  return useToastStore.getState().dismiss(id);
}
export function clearToasts() {
  return useToastStore.getState().clear();
}


export function toast(kind: ToastKind, message: string, opts?: Partial<Omit<ShowToastInput, 'kind' | 'message'>>) {
  return showToast({ kind, message, ...opts });
}
export const toastSuccess = (message: string, opts?: Partial<Omit<ShowToastInput, 'kind' | 'message'>>) => toast('success', message, opts);
export const toastError = (message: string, opts?: Partial<Omit<ShowToastInput, 'kind' | 'message'>>) => toast('error', message, opts);
export const toastWarning = (message: string, opts?: Partial<Omit<ShowToastInput, 'kind' | 'message'>>) => toast('warning', message, opts);
export const toastInfo = (message: string, opts?: Partial<Omit<ShowToastInput, 'kind' | 'message'>>) => toast('info', message, opts);
