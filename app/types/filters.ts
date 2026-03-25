// ============================================================
// Triangulate — Filter Type Definitions
// ============================================================

import type { BiasTier, Region, TrustSignal } from "@prisma/client";

/**
 * The complete state of all filters applied to the feed.
 * Serialized to/from URL search params via filter-codec.
 */
export interface FilterState {
  biasTiers: BiasTier[];
  regions: Region[];
  convergenceMin: number;
  convergenceMax: number;
  timeHorizon: TimeHorizon;
  customDateStart?: string; // ISO date
  customDateEnd?: string;   // ISO date
  topics: string[];
  trustSignals: TrustSignal[];
  sourceCountMin: number;
  contentTypes: ("REPORTING" | "COMMENTARY")[];
  preset: FilterPreset | null;
  query?: string; // free-text search within feed
}

export type TimeHorizon = "now" | "today" | "week" | "month" | "custom";

export type FilterPreset =
  | "highest-signal"
  | "cross-spectrum"
  | "left-right-consensus"
  | "cross-region"
  | "breaking-now"
  | "deep-dive"
  | "my-region"
  | "custom";

/**
 * Facet counts returned from the loader alongside stories.
 * Each facet is computed excluding its own filter for accurate counts.
 */
export interface FacetCounts {
  biasTiers: Record<BiasTier, number>;
  regions: Record<Region, number>;
  trustSignals: Record<TrustSignal, number>;
  topics: { name: string; count: number }[];
  totalUnfiltered: number;
  totalFiltered: number;
}

/**
 * Default filter state — shows everything.
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  biasTiers: [],
  regions: [],
  convergenceMin: 0,
  convergenceMax: 100,
  timeHorizon: "today",
  topics: [],
  trustSignals: [],
  sourceCountMin: 1,
  contentTypes: [],
  preset: null,
};
