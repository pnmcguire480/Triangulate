// ============================================================
// Triangulate — Progressive Mastery Hints (Chunk 10.2)
// Show-once tips stored in localStorage, never repeated
// ============================================================

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'triangulate-tips';

interface TipState {
  storiesViewed: number;
  filterUses: number;
  sessions: number;
  dismissed: string[];
}

function getTipState(): TipState {
  if (typeof window === 'undefined') {
    return { storiesViewed: 0, filterUses: 0, sessions: 0, dismissed: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { storiesViewed: 0, filterUses: 0, sessions: 0, dismissed: [] };
}

function saveTipState(state: TipState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export type TipId =
  | 'first-visit-filter'
  | 'spectrum-drag'
  | 'sidebar-connected'
  | 'claims-independent'
  | 'shortcut-hint'
  | 'compact-density'
  | 'first-visit-wire';

interface Tip {
  id: TipId;
  text: string;
  condition: (state: TipState) => boolean;
}

const ALL_TIPS: Tip[] = [
  {
    id: 'first-visit-wire',
    text: 'Stories are sorted by convergence — where enemies agree rises to the top.',
    condition: (s) => s.sessions === 0,
  },
  {
    id: 'first-visit-filter',
    text: 'Try a lens to get started — "Highest Signal" shows the strongest agreement.',
    condition: (s) => s.sessions === 0,
  },
  {
    id: 'spectrum-drag',
    text: 'Click or drag to select a range on the bias spectrum.',
    condition: (s) => s.sessions === 0,
  },
  {
    id: 'sidebar-connected',
    text: 'These controls are connected — adjusting one updates the entire view.',
    condition: (s) => s.sessions === 0,
  },
  {
    id: 'claims-independent',
    text: 'Tip: Claims are scored independently — a story can have both high and low convergence claims.',
    condition: (s) => s.storiesViewed >= 10,
  },
  {
    id: 'shortcut-hint',
    text: 'Tip: Press J/K to navigate stories, ? for all shortcuts.',
    condition: (s) => s.filterUses >= 3,
  },
  {
    id: 'compact-density',
    text: 'Try Compact density for more data on screen (Ctrl+K → "Density: Compact").',
    condition: (s) => s.sessions >= 20,
  },
];

export function useProgressiveTips() {
  const [state, setState] = useState<TipState>(getTipState);

  // Increment session count on mount
  useEffect(() => {
    const current = getTipState();
    const updated = { ...current, sessions: current.sessions + 1 };
    saveTipState(updated);
    setState(updated);
  }, []);

  const trackStoryView = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, storiesViewed: prev.storiesViewed + 1 };
      saveTipState(next);
      return next;
    });
  }, []);

  const trackFilterUse = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, filterUses: prev.filterUses + 1 };
      saveTipState(next);
      return next;
    });
  }, []);

  const dismissTip = useCallback((tipId: TipId) => {
    setState((prev) => {
      const next = { ...prev, dismissed: [...prev.dismissed, tipId] };
      saveTipState(next);
      return next;
    });
  }, []);

  const getActiveTip = useCallback((): Tip | null => {
    return ALL_TIPS.find(
      (tip) => tip.condition(state) && !state.dismissed.includes(tip.id)
    ) || null;
  }, [state]);

  const getTipById = useCallback((id: TipId): Tip | null => {
    const tip = ALL_TIPS.find((t) => t.id === id);
    if (!tip || state.dismissed.includes(id)) return null;
    if (!tip.condition(state)) return null;
    return tip;
  }, [state]);

  return {
    state,
    trackStoryView,
    trackFilterUse,
    dismissTip,
    getActiveTip,
    getTipById,
  };
}
