import { emit, EVT, on } from "./events";
export type CtaState = { canSend: boolean; canInsert: boolean; canCopy: boolean };

function isEditableTarget(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || t.isContentEditable;
}

async function tryClipboard(text: string): Promise<boolean> {
  try {
    if ((navigator as any)?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export async function probeCtas(): Promise<Partial<CtaState>> {
  const state: Partial<CtaState> = {};
  try {
    const m: any = await import("../store");
    const st = m?.usePsychStore?.getState?.();
  let canSend = st?.canSendToChat?.();
  if (typeof canSend !== "boolean") canSend = (st?.getSelectionCount?.() ?? 0) > 0;
  if (typeof canSend !== "boolean") canSend = true;
  let canInsert = st?.hasInsertPayload?.();
  if (typeof canInsert !== "boolean") canInsert = st?.getActiveCardPayload?.() != null;
  if (typeof canInsert !== "boolean") canInsert = true;
  let canCopy: boolean | undefined = undefined;
  const clipLen = st?.getClipboardText?.()?.length;
  if (typeof clipLen === "number") canCopy = clipLen > 0;
  if (typeof canCopy !== "boolean") canCopy = st?.getActiveCardPayload?.() != null;
  if (typeof canCopy !== "boolean") canCopy = true;
    state.canSend = Boolean(canSend);
    state.canInsert = Boolean(canInsert);
    state.canCopy = Boolean(canCopy);
  } catch {
    state.canSend = true;
    state.canInsert = true;
    state.canCopy = true;
  }
  return state;
}

export async function doSend(): Promise<boolean> {
  try {
    const m: any = await import("../store");
    const st = m?.usePsychStore?.getState?.();
    if (typeof st?.sendToChat === "function") {
      await Promise.resolve(st.sendToChat());
      return true;
    }
  } catch {}
  window.dispatchEvent(new CustomEvent("synapse:chat:insert"));
  return true;
}




export async function doInsert(): Promise<boolean> {
  try {
    const m: any = await import("../store");
    const st = m?.usePsychStore?.getState?.();
    if (typeof st?.insertToEditor === "function") {
      await Promise.resolve(st.insertToEditor());
      return true;
    }
  } catch {}
  emit(EVT.EDITOR_INSERT);
  return true;
}

export async function doCopy(): Promise<boolean> {
  try {
    const m: any = await import("../store");
    const st = m?.usePsychStore?.getState?.();
    const text = st?.getClipboardText?.() ?? st?.getActiveCardPayload?.()?.text ?? "";
    if (text && typeof text === "string") return await tryClipboard(text);
  } catch {}
  let copied = false;
  const onProvide = async (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    if (typeof d?.text === "string" && !copied) {
      copied = await tryClipboard(d.text);
    }
  };
  const offProvide = on(EVT.CLIPBOARD_PROVIDE, onProvide as any);
  emit(EVT.CLIPBOARD_REQUEST, {});
  await Promise.resolve();
  offProvide();
  return copied;
}

export function guardSendShortcut(e: KeyboardEvent): boolean {
  if (!(e.ctrlKey || e.metaKey)) return false;
  if (e.shiftKey) return false;
  if (e.key !== "Enter") return false;
  if (isEditableTarget(e.target)) return true;
  return true;
}
export function guardInsertShortcut(e: KeyboardEvent): boolean {
  if (!(e.ctrlKey || e.metaKey)) return false;
  if (!e.shiftKey) return false;
  if (e.key !== "Enter") return false;
  return !isEditableTarget(e.target);
}
export function guardCopyShortcut(e: KeyboardEvent): boolean {
  if (!(e.altKey && e.shiftKey)) return false;
  if (e.key.toLowerCase() !== "c") return false;
  const sel = window.getSelection()?.toString();
  if (sel && sel.length > 0) return false;
  return !isEditableTarget(e.target);
}
