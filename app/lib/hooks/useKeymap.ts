// ============================================================
// Triangulate — Keyboard Shortcut System (Chunk 6.2)
// tinykeys for vim-style sequential shortcuts
// ============================================================

import { useEffect, useRef } from 'react';
import * as tinykeysMod from 'tinykeys';
const tinykeys = (tinykeysMod as any).tinykeys || (tinykeysMod as any).default;

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
  // Use a ref to avoid re-registering shortcuts when callbacks change
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    const guard = (fn: () => void) => (e: KeyboardEvent) => {
      if (isTyping()) return;
      e.preventDefault();
      fn();
    };

    const unsub = tinykeys(window, {
      // Navigation: g then letter
      'g f': guard(() => optsRef.current.onNavigate?.('/')),
      'g s': guard(() => optsRef.current.onNavigate?.('/search')),
      'g o': guard(() => optsRef.current.onNavigate?.('/sources')),
      'g t': guard(() => optsRef.current.onNavigate?.('/trends')),
      'g p': guard(() => optsRef.current.onNavigate?.('/pricing')),

      // Command palette
      '$mod+k': (e: KeyboardEvent) => { e.preventDefault(); optsRef.current.onCommandPalette?.(); },
      '$mod+Shift+p': (e: KeyboardEvent) => { e.preventDefault(); optsRef.current.onCommandPalette?.(); },

      // Sidebar
      '$mod+b': (e: KeyboardEvent) => { e.preventDefault(); optsRef.current.onToggleSidebar?.(); },

      // Help
      '?': guard(() => optsRef.current.onShortcutHelp?.()),

      // Filter reset
      'f r': guard(() => optsRef.current.onResetFilters?.()),

      // Story navigation
      'j': guard(() => optsRef.current.onNextStory?.()),
      'k': guard(() => optsRef.current.onPrevStory?.()),

      // Panel focus (F6 already handled by usePanelFocus)
      '1': guard(() => optsRef.current.onFocusPanel?.('wire')),
      '2': guard(() => optsRef.current.onFocusPanel?.('lens')),
      '3': guard(() => optsRef.current.onFocusPanel?.('dossier')),
    });

    return unsub;
  }, []); // Register once, use ref for current callbacks
}
