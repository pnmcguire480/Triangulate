// ============================================================
// Triangulate — Command Palette (Chunk 6.1)
// cmdk-powered, Cmd+K search / Cmd+Shift+P commands
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Command } from 'cmdk';
import Fuse from 'fuse.js';
import {
  Search, Newspaper, Layers, Database, CreditCard,
  Keyboard, Download, Moon, Sun, Monitor,
  Filter, ArrowRight, Maximize2, Columns3, SplitSquareHorizontal,
  Bell, Gauge, HelpCircle, RotateCcw, Settings,
} from 'lucide-react';
import { useWorkspaceStore } from '~/lib/stores/workspace';

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const setLayoutPreset = useWorkspaceStore((s) => s.setLayoutPreset);
  const setDensity = useWorkspaceStore((s) => s.setDensity);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

  // Reset query when opening
  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-feed', label: 'Go to Feed', shortcut: 'G F', icon: Newspaper, category: 'Navigation', action: () => { navigate('/'); close(); } },
    { id: 'nav-search', label: 'Go to Search', shortcut: 'G S', icon: Search, category: 'Navigation', action: () => { navigate('/search'); close(); } },
    { id: 'nav-sources', label: 'Go to Sources', shortcut: 'G O', icon: Database, category: 'Navigation', action: () => { navigate('/sources'); close(); } },
    { id: 'nav-trends', label: 'Go to Trends', shortcut: 'G T', icon: Gauge, category: 'Navigation', action: () => { navigate('/trends'); close(); } },
    { id: 'nav-pricing', label: 'Go to Pricing', icon: CreditCard, category: 'Navigation', action: () => { navigate('/pricing'); close(); } },

    // Panels
    { id: 'panel-quick-scan', label: 'Layout: Quick Scan', icon: Maximize2, category: 'Panels', action: () => { setLayoutPreset('quick-scan'); close(); } },
    { id: 'panel-analyst', label: 'Layout: Analyst', icon: Columns3, category: 'Panels', action: () => { setLayoutPreset('analyst'); close(); } },
    { id: 'panel-deep-dive', label: 'Layout: Deep Dive', icon: SplitSquareHorizontal, category: 'Panels', action: () => { setLayoutPreset('deep-dive'); close(); } },
    { id: 'panel-toggle-sidebar', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', icon: Columns3, category: 'Panels', action: () => { toggleSidebar(); close(); } },

    // Display
    { id: 'display-compact', label: 'Density: Compact', icon: Layers, category: 'Display', action: () => { setDensity('compact'); close(); } },
    { id: 'display-comfortable', label: 'Density: Comfortable', icon: Layers, category: 'Display', action: () => { setDensity('comfortable'); close(); } },
    { id: 'display-spacious', label: 'Density: Spacious', icon: Layers, category: 'Display', action: () => { setDensity('spacious'); close(); } },
    { id: 'display-theme-dark', label: 'Theme: Dark', icon: Moon, category: 'Display', action: () => { document.documentElement.classList.add('dark'); localStorage.setItem('triangulate-theme', 'dark'); close(); } },
    { id: 'display-theme-light', label: 'Theme: Light', icon: Sun, category: 'Display', action: () => { document.documentElement.classList.remove('dark'); localStorage.setItem('triangulate-theme', 'light'); close(); } },
    { id: 'display-theme-system', label: 'Theme: System', icon: Monitor, category: 'Display', action: () => { localStorage.removeItem('triangulate-theme'); close(); } },

    // Filters
    { id: 'filter-reset', label: 'Reset All Filters', shortcut: 'F R', icon: RotateCcw, category: 'Filters', action: () => { navigate(location.pathname); close(); } },
    { id: 'filter-highest-signal', label: 'Preset: Highest Signal', icon: Filter, category: 'Filters', action: () => { navigate('/?preset=highest-signal'); close(); } },
    { id: 'filter-cross-spectrum', label: 'Preset: Cross-Spectrum', icon: Filter, category: 'Filters', action: () => { navigate('/?preset=cross-spectrum'); close(); } },
    { id: 'filter-breaking-now', label: 'Preset: Breaking Now', icon: Filter, category: 'Filters', action: () => { navigate('/?preset=breaking-now'); close(); } },

    // Help
    { id: 'help-shortcuts', label: 'Keyboard Shortcuts', shortcut: '?', icon: Keyboard, category: 'Help', action: () => { document.dispatchEvent(new CustomEvent('triangulate:show-shortcuts')); close(); } },
    { id: 'help-about', label: 'About Triangulate', icon: HelpCircle, category: 'Help', action: () => { close(); } },
  ];

  // Group commands by category
  const categories = Array.from(new Set(commands.map((c) => c.category)));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <div className="relative flex justify-center pt-[15vh]">
        <Command
          className="w-full max-w-lg mx-4 bg-surface rounded-sm shadow-xl border border-border overflow-hidden"
          loop
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 h-12 border-b border-border">
            <Search className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink-faint font-mono">
              Esc
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-72 overflow-y-auto p-1.5 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-ink-muted">
              No commands found.
            </Command.Empty>

            {categories.map((category) => (
              <Command.Group
                key={category}
                heading={category}
                className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {commands
                  .filter((c) => c.category === category)
                  .map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <Command.Item
                        key={cmd.id}
                        value={cmd.label}
                        onSelect={cmd.action}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-sm text-sm text-ink cursor-pointer data-[selected=true]:bg-brand-green/8 data-[selected=true]:text-ink transition-colors"
                      >
                        <Icon className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink-faint font-mono shrink-0">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    );
                  })}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border text-[10px] text-ink-faint">
            <span>Navigate with <kbd className="font-mono">Arrow</kbd> keys</span>
            <span><kbd className="font-mono">Enter</kbd> to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
