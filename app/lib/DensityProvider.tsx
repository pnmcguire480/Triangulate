// ============================================================
// Triangulate — Density Mode Provider (Chunk 6.5)
// 3 modes: compact (32px), comfortable (40px), spacious (52px)
// ============================================================

import { createContext, useContext, useEffect } from 'react';
import { useWorkspaceStore } from '~/lib/stores/workspace';
import type { DensityMode } from '~/types';

const DensityContext = createContext<DensityMode>('comfortable');

export function useDensity(): DensityMode {
  return useContext(DensityContext);
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const density = useWorkspaceStore((s) => s.density);

  // Sync data-density attribute to <html> for CSS consumption
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  return (
    <DensityContext.Provider value={density}>
      {children}
    </DensityContext.Provider>
  );
}
