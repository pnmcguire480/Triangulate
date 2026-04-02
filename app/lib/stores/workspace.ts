// ============================================================
// Triangulate — Workspace Zustand Store
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_WORKSPACE,
  LAYOUT_PRESETS,
  type DensityMode,
  type LayoutPreset,
  type PanelId,
  type PanelLayout,
  type WorkspaceState,
} from "~/types/workspace";

interface WorkspaceActions {
  // Sidebar
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  // Theme
  setTheme: (theme: WorkspaceState["theme"]) => void;

  // Density
  setDensity: (density: DensityMode) => void;

  // Panels
  setPanelLayout: (layout: PanelLayout) => void;
  setLayoutPreset: (preset: LayoutPreset) => void;
  setActivePanel: (panelId: PanelId | null) => void;
  resizePanel: (panelId: PanelId, width: number) => void;

  // Workspace management
  resetToDefaults: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

// Debounced server sync (500ms)
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleSyncToServer(state: WorkspaceState) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    // Only sync if user is logged in (check cookie existence)
    if (typeof document !== "undefined" && document.cookie.includes("session")) {
      fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          state: {
            sidebarExpanded: state.sidebarExpanded,
            density: state.density,
            theme: state.theme,
            panelLayout: state.panelLayout,
            layoutPreset: state.layoutPreset,
            defaultFilters: state.defaultFilters,
          },
        }),
      }).catch(() => {
        // Silent fail — localStorage is the primary store
      });
    }
  }, 500);
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, _get) => ({
      ...DEFAULT_WORKSPACE,

      toggleSidebar: () => {
        set((s) => {
          const next = { ...s, sidebarExpanded: !s.sidebarExpanded };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setSidebarExpanded: (expanded) => {
        set((s) => {
          const next = { ...s, sidebarExpanded: expanded };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setTheme: (theme) => {
        set((s) => {
          const next = { ...s, theme };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setDensity: (density) => {
        set((s) => {
          const next = { ...s, density };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setPanelLayout: (panelLayout) => {
        set((s) => {
          const next = { ...s, panelLayout, layoutPreset: "analyst" as LayoutPreset };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setLayoutPreset: (preset) => {
        set((s) => {
          const next = {
            ...s,
            layoutPreset: preset,
            panelLayout: LAYOUT_PRESETS[preset],
          };
          scheduleSyncToServer(next);
          return next;
        });
      },

      setActivePanel: (panelId) => {
        set({ activePanelId: panelId });
      },

      resizePanel: (panelId, width) => {
        set((s) => {
          const panelLayout = { ...s.panelLayout, [panelId]: width };
          const next = { ...s, panelLayout };
          scheduleSyncToServer(next);
          return next;
        });
      },

      resetToDefaults: () => {
        set(DEFAULT_WORKSPACE);
      },
    }),
    {
      name: "triangulate-workspace",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        density: state.density,
        theme: state.theme,
        panelLayout: state.panelLayout,
        layoutPreset: state.layoutPreset,
        defaultFilters: state.defaultFilters,
        name: state.name,
        isDefault: state.isDefault,
      }),
    }
  )
);
