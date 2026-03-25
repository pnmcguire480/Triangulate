// ============================================================
// Triangulate — Workspace Type Definitions
// ============================================================

import type { FilterState } from "./filters";

export type DensityMode = "compact" | "comfortable" | "spacious";

export type PanelId = "wire" | "lens" | "dossier" | "filters";

export interface PanelLayout {
  wire: number;   // percentage width
  lens: number;
  dossier: number;
}

export type LayoutPreset = "quick-scan" | "analyst" | "deep-dive";

export const LAYOUT_PRESETS: Record<LayoutPreset, PanelLayout> = {
  "quick-scan": { wire: 100, lens: 0, dossier: 0 },
  "analyst": { wire: 45, lens: 35, dossier: 20 },
  "deep-dive": { wire: 35, lens: 65, dossier: 0 },
};

/**
 * The full workspace state persisted to localStorage and server.
 */
export interface WorkspaceState {
  // Display
  sidebarExpanded: boolean;
  density: DensityMode;
  theme: "light" | "dark" | "system";

  // Panels
  panelLayout: PanelLayout;
  layoutPreset: LayoutPreset;
  activePanelId: PanelId | null;

  // Filters (serialized separately to URL, but workspace remembers defaults)
  defaultFilters: Partial<FilterState>;

  // Metadata
  name: string;
  isDefault: boolean;
}

export const DEFAULT_WORKSPACE: WorkspaceState = {
  sidebarExpanded: false, // collapsed on first visit per design decision
  density: "comfortable",
  theme: "system",
  panelLayout: LAYOUT_PRESETS["analyst"],
  layoutPreset: "analyst",
  activePanelId: null,
  defaultFilters: {},
  name: "Default",
  isDefault: true,
};
