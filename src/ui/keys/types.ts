export type KeyChord = string;

export interface KeyEventContext {
  isComposing: () => boolean;
  toChord: (e: KeyboardEvent) => KeyChord;
}

export interface KeyScope {
  id: string;

  priority: number;

  when?: () => boolean;

  onKeyDown?: (e: KeyboardEvent, ctx: KeyEventContext) => boolean | void;

  onKeyUp?: (e: KeyboardEvent, ctx: KeyEventContext) => boolean | void;
}
