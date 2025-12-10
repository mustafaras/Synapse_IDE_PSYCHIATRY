export type ScopeId = 'global' | 'chat' | 'editor' | 'files' | 'terminal';
export type Platform = 'mac' | 'win' | 'linux';

export type Mod = 'Ctrl' | 'Cmd' | 'Alt' | 'Opt' | 'Shift';
export interface KeyChord {
  key: string;
  mods: Mod[];
}

export type CommandId =
  | 'app.toggleSettings'
  | 'app.toggleQuickSettings'
  | 'chat.send'
  | 'chat.newLine'
  | 'chat.focusInput'
  | 'editor.format'
  | 'editor.find'
  | 'files.newFile'
  | 'files.search'
  | 'terminal.toggle'
  | 'ide.openCommandPalette'
  | 'ide.globalSearch'
  | 'editor.save'
  | 'editor.findNext'
  | 'editor.findPrev';

export interface Keybinding {
  command: CommandId;
  scope: ScopeId;
  chord: KeyChord | null;
  when?: string | null;
  platform?: Platform | 'all';
}

export interface KeymapPayloadV1 {
  version: 1;
  bindings: Keybinding[];
}
