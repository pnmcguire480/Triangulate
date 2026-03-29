// ============================================================
// Triangulate — MobileFilterSheet (Chunk 2.13)
// Bottom sheet for mobile filter controls
// ============================================================

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FacetCounts } from "~/types/filters";
import SmartPresets from "./SmartPresets";
import BiasSpectrumSelector from "./BiasSpectrumSelector";
import TimeHorizon from "./TimeHorizon";
import TopicCloud from "./TopicCloud";
import RegionFilter from "./RegionFilter";
import ConvergenceSlider from "./ConvergenceSlider";
import FilterChips from "./FilterChips";

interface MobileFilterSheetProps {
  facets?: FacetCounts | null;
  totalFiltered?: number;
}

export default function MobileFilterSheet({ facets, totalFiltered }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating action button trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-[calc(var(--shell-bottom-tab-height)+1rem)] right-4 z-30 w-12 h-12 rounded-full bg-brand-green text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* Sheet overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Filters">
          {/* Backdrop */}
          <div
            className="flex-none h-[15vh] bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div className="flex-1 bg-paper rounded-t-xl overflow-hidden flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-ink/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2">
              <h2 className="text-sm font-semibold text-ink">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable filter content */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-20">
              <FilterChips />
              <SmartPresets />
              <hr className="rule-line" />
              <BiasSpectrumSelector counts={facets?.biasTiers} />
              <hr className="rule-line" />
              <TimeHorizon />
              <hr className="rule-line" />
              <TopicCloud topics={facets?.topics} />
              <hr className="rule-line" />
              <RegionFilter counts={facets?.regions} />
              <hr className="rule-line" />
              <ConvergenceSlider />
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 flex items-center justify-between px-4 py-3 border-t border-border bg-paper">
              <span className="text-xs text-ink-muted">
                {totalFiltered != null ? `Showing ${totalFiltered} stories` : ""}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-brand-green text-white rounded-sm hover:opacity-90 transition-opacity"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
