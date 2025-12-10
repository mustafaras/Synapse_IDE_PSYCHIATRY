import type { KeyChord, KeyEventContext, KeyScope } from './types';
import { getActiveElement, isComposingIME, isTextInputLike } from './dom';
import { KeymapService } from '@/lib/keys/keymap.service';
import type { ScopeId } from '@/lib/keys/keymap.types';


export const isKeyRouterSuspended = () => (window as any).__KEY_ROUTER_SUSPENDED__ === true;


class KeyRouter {
  private scopes: KeyScope[] = [];
  private attached = false;

  private handleKeyDown?: (ev: KeyboardEvent) => void;
  private handleKeyUp?: (ev: KeyboardEvent) => void;
  private ctx!: KeyEventContext;

  attach() {
    if (this.attached) return;
    this.attached = true;


    this.ctx = {
      isComposing: () => this.isComposing,
      toChord: (e) => toChord(e),
    };


    this.handleKeyDown = (ev: KeyboardEvent) => this.dispatch('down', ev, this.ctx);
    this.handleKeyUp = (ev: KeyboardEvent) => this.dispatch('up', ev, this.ctx);


    try {
      if (this.handleKeyDown) window.removeEventListener('keydown', this.handleKeyDown as any, true);
      if (this.handleKeyUp) window.removeEventListener('keyup', this.handleKeyUp as any, true);
    } catch {}


    window.addEventListener('keydown', this.handleKeyDown as any, { capture: false });
    window.addEventListener('keyup', this.handleKeyUp as any, { capture: false });
  }

  private composing = false;
  private get isComposing() {
    return this.composing;
  }

  register(scope: KeyScope) {
    this.scopes.push(scope);
    this.sortScopes();
    return () => this.unregister(scope.id);
  }

  unregister(id: string) {
    this.scopes = this.scopes.filter((s) => s.id !== id);
  }

  private sortScopes() {
    this.scopes.sort((a, b) => b.priority - a.priority);
  }

  private dispatch(phase: 'down' | 'up', e: KeyboardEvent, ctx: KeyEventContext) {

    if (isKeyRouterSuspended()) return;

    this.composing = isComposingIME(e);


    if (this.composing) return;


    const active = getActiveElement();
    if (active && isTextInputLike(active) && !active.hasAttribute('data-chat-input')) {
      return;
    }



  const activeScope = (this.scopes.find(s => !s.when || s.when())?.id || 'global') as ScopeId;
  const consumedByService = phase === 'down' && KeymapService.dispatch(e, activeScope);
  if (consumedByService) { e.preventDefault(); e.stopPropagation(); return; }


    for (const s of this.scopes) {
      if (s.when && !s.when()) continue;
      const handler = phase === 'down' ? s.onKeyDown : s.onKeyUp;
      if (!handler) continue;
      const consumed = !!handler(e, ctx);
      if (consumed) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  }
}

export const globalKeyRouter = new KeyRouter();


export const registerKeyScope = (scope: KeyScope): (() => void) => {


  if (!globalThis.__KEY_ROUTER_ATTACHED__) {
    globalKeyRouter.attach();


    globalThis.__KEY_ROUTER_ATTACHED__ = true;
  }
  return globalKeyRouter.register(scope);
};


export const toChord = (e: KeyboardEvent): KeyChord => {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push('Ctrl');
  if (e.metaKey) mods.push('Meta');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  return [...mods, key].join('+');
};
