import type { Keybinding, KeymapPayloadV1, Platform } from './keymap.types';

export function defaultKeymap(platform: Platform): KeymapPayloadV1 {
  const isMac = platform === 'mac';
  const cmd = (key: string): Keybinding['chord'] => ({ key, mods: isMac ? ['Cmd'] : ['Ctrl'] });
  const shift = (key: string): Keybinding['chord'] => ({ key, mods: ['Shift'] });
  const cmdShift = (key: string): Keybinding['chord'] => ({ key, mods: isMac ? ['Cmd', 'Shift'] : ['Ctrl', 'Shift'] });

  const bindings: Keybinding[] = [
    { command: 'app.toggleSettings', scope: 'global', chord: cmd(','), platform: 'all' },
  { command: 'app.toggleQuickSettings', scope: 'global', chord: cmdShift(','), platform: 'all' },
    { command: 'chat.send', scope: 'chat', chord: cmd('Enter'), platform: 'all' },
    { command: 'chat.newLine', scope: 'chat', chord: shift('Enter'), platform: 'all' },
    { command: 'chat.focusInput', scope: 'global', chord: cmd('L'), platform: 'all' },
    { command: 'files.search', scope: 'global', chord: cmd('P'), platform: 'all' },
    { command: 'files.newFile', scope: 'files', chord: cmd('N'), platform: 'all' },
    { command: 'terminal.toggle', scope: 'global', chord: cmd('J'), platform: 'all' },
    { command: 'ide.openCommandPalette', scope: 'global', chord: cmd('K'), platform: 'all' },
    { command: 'ide.globalSearch', scope: 'global', chord: cmdShift('F'), platform: 'all' },
    { command: 'editor.save', scope: 'editor', chord: cmd('S'), platform: 'all' },
    { command: 'editor.find', scope: 'editor', chord: cmd('F'), platform: 'all' },
    { command: 'editor.findNext', scope: 'editor', chord: shift('F3'), platform: 'all' },
    { command: 'editor.findPrev', scope: 'editor', chord: cmdShift('G'), platform: 'all' },
  ];

  return { version: 1, bindings };
}
