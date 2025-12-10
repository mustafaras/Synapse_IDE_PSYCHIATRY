

export type BridgeEvent =
  | { type: 'editor:openTab'; payload: { filename: string; code: string; language?: string } }
  | { type: 'editor:insertAtCursor'; payload: { code: string } }
  | { type: 'editor:replaceActive'; payload: { code: string } }
  | { type: 'editor:openRange'; payload: { path: string; fromLine: number; toLine: number } };

const BUS = '___editor_bridge___';

function emit(e: BridgeEvent) {
  window.dispatchEvent(new CustomEvent(BUS, { detail: e }));
}


export type OpenTabPayload = { filename: string; code: string; language?: string };
export type InsertAtCursorPayload = { code: string };
export type ReplaceActivePayload = { code: string };


const MODEL_REGISTRY: Record<string, { text: string; language?: string }> = {};

export const editorBridge = {
  openNewTab(args: OpenTabPayload) {
    emit({ type: 'editor:openTab', payload: args });

  MODEL_REGISTRY[args.filename] = args.language ? { text: args.code, language: args.language } : { text: args.code };
  },
  openAtRange(path: string, fromLine: number, toLine: number) {
    emit({ type: 'editor:openRange', payload: { path, fromLine, toLine } });
  },
  insertAtCursor(args: InsertAtCursorPayload) {
    emit({ type: 'editor:insertAtCursor', payload: args });
  },
  replaceActive(args: ReplaceActivePayload) {
    emit({ type: 'editor:replaceActive', payload: args });
  },

  sizeGuard(code: string, max = 500 * 1024) {
    return code.length <= max;
  },

  async readFileText(path: string): Promise<string> {
    const m = MODEL_REGISTRY[path];
    if (!m) throw new Error('Model not found');
    return m.text;
  },
  async writeFileText(path: string, text: string, language?: string): Promise<void> {
    if (language != null) {
      MODEL_REGISTRY[path] = { text, language };
    } else {
      const prevLang = MODEL_REGISTRY[path]?.language;
      MODEL_REGISTRY[path] = prevLang ? { text, language: prevLang } : { text } as any;
    }
  },
  async deleteFile(path: string): Promise<void> {
    delete MODEL_REGISTRY[path];
  },
  async renameFile(from: string, to: string): Promise<void> {
    const m = MODEL_REGISTRY[from];
    if (!m) throw new Error('Model not found');
    MODEL_REGISTRY[to] = m;
    delete MODEL_REGISTRY[from];
  },
  async snapshotMany(paths: string[]): Promise<{ [p: string]: string }> {
    const snap: Record<string, string> = {};
    for (const p of paths) {
      if (MODEL_REGISTRY[p]) snap[p] = MODEL_REGISTRY[p].text;
    }
    return snap;
  },
  async restoreSnapshotMany(snap: { [p: string]: string }): Promise<void> {
    for (const [p, text] of Object.entries(snap)) {
      if (MODEL_REGISTRY[p]) MODEL_REGISTRY[p].text = text; else MODEL_REGISTRY[p] = { text } as any;
    }
  },
};

export type EditorBridgeHandler = (e: BridgeEvent) => void;

export function subscribeEditorBridge(handler: EditorBridgeHandler) {
  const on = (evt: Event) => {
    const ce = evt as CustomEvent<BridgeEvent>;
    handler(ce.detail);
  };
  window.addEventListener(BUS, on);
  return () => window.removeEventListener(BUS, on);
}
