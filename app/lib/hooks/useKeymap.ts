// ============================================================
// Triangulate — Keyboard Shortcut System (Chunk 6.2)
// tinykeys for vim-style sequential shortcuts
// ============================================================

import { useEffect } from 'react';
import { tinykeys } from 'tinykeys';

/**
 * Global keyboard shortcut map.
 * Input-aware: shortcuts are skipped when user is typing in an input/textarea.
 */
function isTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

interface UseKeymapOptions {
  /** Navigation callbacks */
  onNavigate?: (path: string) => void;
  /** Command palette */
  onCommandPalette?: () => void;
  /** Shortcut overlay */
  onShortcutHelp?: () => void;
  /** Sidebar toggle */
  onToggleSidebar?: () => void;
  /** Filter reset */
  onResetFilters?: () => void;
  /** Story navigation (j/k) */
  onNextStory?: () => void;
  onPrevStory?: () => void;
  /** Panel focus */
  onFocusPanel?: (panel: string) => void;
}

export function useKeymap(opts: UseKeymapOptions) {
  useEffect(() => {
    const guard = (fn: () => void) => (e: KeyboardEvent) => {
      if (isTyping()) return;
      e.preventDefault();
      fn();
    };

    const unsub = tinykeys(window, {
      // Navigation: g then letter
      'g f': guard(() => opts.onNavigate?.('/')),
      'g s': guard(() => opts.onNavigate?.('/search')),
      'g o': guard(() => opts.onNavigate?.('/sources')),
      'g t': guard(() => opts.onNavigate?.('/trends')),
      'g p': guard(() => opts.onNavigate?.('/pricing')),

      // Command palette
      '$mod+k': (e: KeyboardEvent) => { e.preventDefault(); opts.onCommandPalette?.(); },
      '$mod+Shift+p': (e: KeyboardEvent) => { e.preventDefault(); opts.onCommandPalette?.(); },

      // Sidebar
      '$mod+b': (e: KeyboardEvent) => { e.preventDefault(); opts.onToggleSidebar?.(); },

      // Help
      '?': guard(() => opts.onShortcutHelp?.()),

      // Filter reset
      'f r': guard(() => opts.onResetFilters?.()),

      // Story navigation
      'j': guard(() => opts.onNextStory?.()),
      'k': guard(() => opts.onPrevStory?.()),

      // Panel focus (F6 already handled by usePanelFocus)
      '1': guard(() => opts.onFocusPanel?.('wire')),
      '2': guard(() => opts.onFocusPanel?.('lens')),
      '3': guard(() => opts.onFocusPanel?.('dossier')),
    });

    return unsub;
  }, [opts]);
}
