// ============================================================
// Triangulate — Keyboard Shortcut Overlay (Chunk 6.2)
// Shows all available shortcuts in a modal
// ============================================================

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'G F', description: 'Go to Feed' },
      { keys: 'G S', description: 'Go to Search' },
      { keys: 'G O', description: 'Go to Sources' },
      { keys: 'G T', description: 'Go to Trends' },
      { keys: 'G P', description: 'Go to Pricing' },
    ],
  },
  {
    title: 'Story Navigation',
    shortcuts: [
      { keys: 'J', description: 'Next story' },
      { keys: 'K', description: 'Previous story' },
      { keys: 'Enter', description: 'Open selected story' },
      { keys: '1 / 2 / 3', description: 'Focus Wire / Lens / Dossier panel' },
      { keys: 'F6', description: 'Cycle between panels' },
    ],
  },
  {
    title: 'Commands',
    shortcuts: [
      { keys: 'Ctrl+K', description: 'Open command palette (search)' },
      { keys: 'Ctrl+Shift+P', description: 'Open command palette (commands)' },
      { keys: 'Ctrl+B', description: 'Toggle sidebar' },
      { keys: '?', description: 'Show this shortcut overlay' },
    ],
  },
  {
    title: 'Filters',
    shortcuts: [
      { keys: 'F R', description: 'Reset all filters' },
    ],
  },
];

interface ShortcutOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutOverlay({ open, onClose }: ShortcutOverlayProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-surface rounded-sm shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-headline text-base font-semibold text-ink">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-muted">{shortcut.description}</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink-faint font-mono shrink-0 ml-4">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border text-[10px] text-ink-faint text-center">
          Press <kbd className="font-mono">?</kbd> to toggle this overlay
        </div>
      </div>
    </div>
  );
}
