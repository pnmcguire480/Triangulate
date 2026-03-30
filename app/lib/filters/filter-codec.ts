// ============================================================
// Triangulate — Filter Codec (Chunk 2.1)
// Serialize/deserialize FilterState to/from URL search params
// ============================================================

import type { BiasTier, Region, TrustSignal } from "~/types";
import { DEFAULT_FILTER_STATE, type FilterState, type TimeHorizon, type FilterPreset } from "~/types/filters";

const BIAS_TIERS: BiasTier[] = ["FAR_LEFT", "LEFT", "CENTER_LEFT", "CENTER", "CENTER_RIGHT", "RIGHT", "FAR_RIGHT"];
const REGIONS: Region[] = ["US", "UK", "EUROPE", "MIDDLE_EAST", "ASIA_PACIFIC", "CANADA", "LATIN_AMERICA", "AFRICA", "OCEANIA", "GLOBAL"];
const TRUST_SIGNALS: TrustSignal[] = ["SINGLE_SOURCE", "CONTESTED", "CONVERGED", "SOURCE_BACKED", "INSTITUTIONALLY_VALIDATED"];
const TIME_HORIZONS: TimeHorizon[] = ["now", "today", "week", "month", "custom"];

/**
 * Parse URL search params into a FilterState.
 * Missing params use defaults; invalid values are ignored.
 */
export function parseFilters(params: URLSearchParams): FilterState {
  const state = { ...DEFAULT_FILTER_STATE };

  // Bias tiers
  const bias = params.get("bias");
  if (bias) {
    state.biasTiers = bias.split(",").filter((b): b is BiasTier => BIAS_TIERS.includes(b as BiasTier)) as BiasTier[];
  }

  // Regions
  const region = params.get("region");
  if (region) {
    state.regions = region.split(",").filter((r): r is Region => REGIONS.includes(r as Region)) as Region[];
  }

  // Convergence range
  const convMin = params.get("convMin");
  const convMax = params.get("convMax");
  if (convMin) state.convergenceMin = Math.max(0, Math.min(100, parseInt(convMin, 10) || 0));
  if (convMax) state.convergenceMax = Math.max(0, Math.min(100, parseInt(convMax, 10) || 100));

  // Time horizon
  const time = params.get("time");
  if (time && TIME_HORIZONS.includes(time as TimeHorizon)) {
    state.timeHorizon = time as TimeHorizon;
  }

  // Custom dates
  const dateStart = params.get("from");
  const dateEnd = params.get("to");
  if (dateStart) state.customDateStart = dateStart;
  if (dateEnd) state.customDateEnd = dateEnd;

  // Topics
  const topics = params.get("topics");
  if (topics) state.topics = topics.split(",");

  // Trust signals
  const signals = params.get("signals");
  if (signals) {
    state.trustSignals = signals.split(",").filter((s): s is TrustSignal => TRUST_SIGNALS.includes(s as TrustSignal)) as TrustSignal[];
  }

  // Source count
  const srcMin = params.get("srcMin");
  if (srcMin) state.sourceCountMin = Math.max(1, parseInt(srcMin, 10) || 1);

  // Content types
  const ct = params.get("ct");
  if (ct) {
    state.contentTypes = ct.split(",").filter((c): c is "REPORTING" | "COMMENTARY" =>
      c === "REPORTING" || c === "COMMENTARY"
    );
  }

  // Preset
  const preset = params.get("preset");
  if (preset) state.preset = preset as FilterPreset;

  // Query
  const q = params.get("q");
  if (q) state.query = q;

  return state;
}

/**
 * Serialize FilterState to URL search params.
 * Only non-default values are included for clean URLs.
 */
export function serializeFilters(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  const d = DEFAULT_FILTER_STATE;

  if (state.biasTiers.length > 0) params.set("bias", state.biasTiers.join(","));
  if (state.regions.length > 0) params.set("region", state.regions.join(","));
  if (state.convergenceMin !== d.convergenceMin) params.set("convMin", String(state.convergenceMin));
  if (state.convergenceMax !== d.convergenceMax) params.set("convMax", String(state.convergenceMax));
  if (state.timeHorizon !== d.timeHorizon) params.set("time", state.timeHorizon);
  if (state.customDateStart) params.set("from", state.customDateStart);
  if (state.customDateEnd) params.set("to", state.customDateEnd);
  if (state.topics.length > 0) params.set("topics", state.topics.join(","));
  if (state.trustSignals.length > 0) params.set("signals", state.trustSignals.join(","));
  if (state.sourceCountMin !== d.sourceCountMin) params.set("srcMin", String(state.sourceCountMin));
  if (state.contentTypes.length > 0) params.set("ct", state.contentTypes.join(","));
  if (state.preset) params.set("preset", state.preset);
  if (state.query) params.set("q", state.query);

  return params;
}
