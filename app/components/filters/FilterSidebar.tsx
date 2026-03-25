// ============================================================
// Triangulate — FilterSidebar (Chunk 2.2)
// 320px persistent left panel (desktop), bottom sheet (mobile)
// ============================================================

import type { FacetCounts } from "~/types/filters";
import SmartPresets from "./SmartPresets";
import BiasSpectrumSelector from "./BiasSpectrumSelector";
import TimeHorizon from "./TimeHorizon";
import TopicCloud from "./TopicCloud";
import RegionFilter from "./RegionFilter";
import ConvergenceSlider from "./ConvergenceSlider";
import FilterChips from "./FilterChips";

interface FilterSidebarProps {
  facets?: FacetCounts | null;
}

export default function FilterSidebar({ facets }: FilterSidebarProps) {
  return (
    <aside
      id="filters"
      className="w-full md:w-80 bg-paper border-r border-border overflow-y-auto scrollbar-thin"
      aria-label="Filters"
    >
      <div className="p-3 space-y-4">
        {/* Active filter chips */}
        <FilterChips />

        {/* Smart Presets / Lenses */}
        <SmartPresets />

        <hr className="rule-line" />

        {/* Bias Spectrum — THE signature control */}
        <BiasSpectrumSelector counts={facets?.biasTiers} />

        <hr className="rule-line" />

        {/* Time Horizon */}
        <TimeHorizon />

        <hr className="rule-line" />

        {/* Topics */}
        <TopicCloud topics={facets?.topics} />

        <hr className="rule-line" />

        {/* Region Filter */}
        <RegionFilter counts={facets?.regions} />

        <hr className="rule-line" />

        {/* Convergence Slider */}
        <ConvergenceSlider />
      </div>
    </aside>
  );
}
