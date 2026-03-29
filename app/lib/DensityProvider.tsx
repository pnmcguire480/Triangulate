// ============================================================
// Triangulate — Density Mode Sync (Chunk 6.5)
// Syncs density attribute from Zustand store to <html>
// ============================================================

import { useEffect } from 'react';
import { useWorkspaceStore } from '~/lib/stores/workspace';

/**
 * Hook that syncs the data-density attribute to <html> for CSS consumption.
 * Call once in AppShell.
 */
export function useWorkspaceDensitySync() {
  const density = useWorkspaceStore((s) => s.density);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);
}
