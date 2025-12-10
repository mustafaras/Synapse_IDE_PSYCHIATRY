


export const EVT = {
  ANNOUNCE: "synapse:ui:announce",
  TOAST: "synapse:ui:toast",
  MODE: "synapse:ui:mode",
  MODE_AVAILABLE: "synapse:ui:mode:available",
  MODE_COUNT: "synapse:ui:mode:count",
  MODE_SET: "synapse:ui:mode:set",
  CTA_STATE: "synapse:ui:cta:state",
  CTA_DONE: "synapse:ui:cta:done",
  CONFIRM: "synapse:ui:confirm",
  CONFIRM_RESULT: "synapse:ui:confirm:result",
  DIRTY: "synapse:ui:dirty",
  MINIMIZE: "synapse:ui:minimize",
  RESTORE: "synapse:ui:restore",
  MINIMIZE_SET: "synapse:ui:minimize:set",
  STAR_SET: "synapse:ui:star:set",
  SEARCH_RESULTS: "synapse:ui:search:results",
  CLIPBOARD_REQUEST: "synapse:ui:clipboard:request",
  CLIPBOARD_PROVIDE: "synapse:ui:clipboard:provide",
  ABOUT: "synapse:ui:about",
  EDITOR_INSERT: "synapse:editor:insert",
  CHAT_INSERT: "synapse:chat:insert",
} as const;

export type ViewMode = "card" | "prompts" | "evidence";
export type EventName = typeof EVT[keyof typeof EVT];

export type EventMap = {
  [EVT.ANNOUNCE]: { text: string };
  [EVT.TOAST]: { message: string; variant?: "success" | "error" | "info" };
  [EVT.MODE]: { mode: ViewMode };
  [EVT.MODE_AVAILABLE]: { mode: ViewMode; available: boolean };
  [EVT.MODE_COUNT]: { mode: ViewMode; count: number };
  [EVT.MODE_SET]: { mode: ViewMode };
  [EVT.CTA_STATE]: { canSend?: boolean; canInsert?: boolean; canCopy?: boolean };
  [EVT.CTA_DONE]: { action: "send" | "insert" | "copy"; ok: boolean };
  [EVT.CONFIRM]: { message: string };
  [EVT.CONFIRM_RESULT]: { ok: boolean };
  [EVT.DIRTY]: { dirty: boolean };
  [EVT.MINIMIZE_SET]: { minimized: boolean };
  [EVT.STAR_SET]: { on: boolean; sectionId?: string };
  [EVT.SEARCH_RESULTS]: { results: number };
  [EVT.CLIPBOARD_REQUEST]: {};
  [EVT.CLIPBOARD_PROVIDE]: { text: string };
  [EVT.ABOUT]: {};
  [EVT.MINIMIZE]: {};
  [EVT.RESTORE]: {};
  [EVT.EDITOR_INSERT]: {};
  [EVT.CHAT_INSERT]: {};
};

export function emit<N extends EventName>(name: N, detail?: EventMap[N]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<N extends EventName>(name: N, handler: (ev: CustomEvent<EventMap[N]>) => void) {
  const w = handler as unknown as EventListener;
  window.addEventListener(name, w);
  return () => window.removeEventListener(name, w);
}
