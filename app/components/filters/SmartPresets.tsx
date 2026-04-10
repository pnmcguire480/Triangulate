// ============================================================
// Triangulate — SmartPresets / Lenses (Chunk 2.9)
// 7 system presets that apply predefined FilterState
// ============================================================

import { useState } from "react";
import { useFilters } from "~/lib/filters/FilterProvider";
import type { FilterPreset, FilterState } from "~/types/filters";
import { DEFAULT_FILTER_STATE } from "~/types/filters";
import {
  Zap,
  ArrowLeftRight,
  Handshake,
  Globe,
  TrendingUp,
  BookOpen,
  MapPin,
  ChevronDown,
} from "lucide-react";

interface PresetConfig {
  id: FilterPreset;
  label: string;
  icon: React.ElementType;
  filters: Partial<FilterState>;
}

// Primary lenses — always visible
const PRIMARY_PRESETS: PresetConfig[] = [
  {
    id: "highest-signal",
    label: "Strong Agreement",
    icon: Zap,
    filters: { convergenceMin: 70, preset: "highest-signal" },
  },
  {
    id: "left-right-consensus",
    label: "Left vs Right",
    icon: Handshake,
    filters: {
      biasTiers: ["LEFT", "RIGHT", "FAR_LEFT", "FAR_RIGHT"],
      convergenceMin: 50,
      preset: "left-right-consensus",
    },
  },
  {
    id: "breaking-now",
    label: "Breaking Now",
    icon: TrendingUp,
    filters: { timeHorizon: "now" as const, preset: "breaking-now" },
  },
];

// Secondary lenses — behind "More lenses" toggle
const SECONDARY_PRESETS: PresetConfig[] = [
  {
    id: "cross-spectrum",
    label: "Cross-Spectrum",
    icon: ArrowLeftRight,
    filters: { sourceCountMin: 3, convergenceMin: 40, preset: "cross-spectrum" },
  },
  {
    id: "cross-region",
    label: "Cross-Region",
    icon: Globe,
    filters: { convergenceMin: 40, preset: "cross-region" },
  },
  {
    id: "deep-dive",
    label: "Deep Dive",
    icon: BookOpen,
    filters: { sourceCountMin: 5, convergenceMin: 60, preset: "deep-dive" },
  },
  {
    id: "my-region",
    label: "My Region",
    icon: MapPin,
    filters: { regions: ["US"], preset: "my-region" },
  },
];

const ALL_PRESETS = [...PRIMARY_PRESETS, ...SECONDARY_PRESETS];

export default function SmartPresets() {
  const { filters, setFilters, clearAll } = useFilters();
  const [showMore, setShowMore] = useState(false);

  function applyPreset(preset: PresetConfig) {
    // Reset to defaults first, then apply preset filters
    setFilters({ ...DEFAULT_FILTER_STATE, ...preset.filters });
  }

  // Show secondary presets if expanded OR if one of them is active
  const secondaryActive = SECONDARY_PRESETS.some(p => filters.preset === p.id);
  const visiblePresets = showMore || secondaryActive
    ? ALL_PRESETS
    : PRIMARY_PRESETS;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Lenses
      </span>
      <div className="flex flex-col gap-0.5">
        {visiblePresets.map((preset) => {
          const Icon = preset.icon;
          const isActive = filters.preset === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
                isActive
                  ? "bg-brand-green/[0.08] text-brand-green font-medium"
                  : "text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{preset.label}</span>
            </button>
          );
        })}
        {!showMore && !secondaryActive && (
          <button
            onClick={() => setShowMore(true)}
            className="flex items-center gap-2 px-2 py-1.5 text-xs text-ink-faint hover:text-ink-muted transition-colors text-left"
          >
            <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>More lenses</span>
          </button>
        )}
      </div>
    </div>
  );
}
