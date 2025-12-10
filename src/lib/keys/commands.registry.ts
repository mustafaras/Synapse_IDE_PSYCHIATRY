import type { CommandId, ScopeId } from './keymap.types';

export const COMMAND_META: Record<CommandId, { label: string; description?: string; scope: ScopeId }> = {
  'app.toggleSettings': { label: 'Toggle Settings', scope: 'global' },
  'app.toggleQuickSettings': { label: 'Toggle Quick Settings', scope: 'global' },
  'chat.send': { label: 'Send Message', scope: 'chat', description: 'Send the current chat input' },
  'chat.newLine': { label: 'Insert New Line', scope: 'chat' },
  'chat.focusInput': { label: 'Focus Chat Input', scope: 'chat' },
  'editor.format': { label: 'Format Document', scope: 'editor' },
  'editor.find': { label: 'Find', scope: 'editor' },
  'files.newFile': { label: 'New File', scope: 'files' },
  'files.search': { label: 'Search Files', scope: 'global' },
  'terminal.toggle': { label: 'Toggle Terminal', scope: 'global' },
  'ide.openCommandPalette': { label: 'Open Command Palette', scope: 'global' },
  'ide.globalSearch': { label: 'Global Search', scope: 'global' },
  'editor.save': { label: 'Save File', scope: 'editor' },
  'editor.findNext': { label: 'Find Next', scope: 'editor' },
  'editor.findPrev': { label: 'Find Previous', scope: 'editor' },
};
