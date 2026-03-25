// ============================================================
// Triangulate — FilterChips (Chunk 2.10)
// Active filter chips with remove buttons
// ============================================================

import { X } from "lucide-react";
import { useFilters } from "~/lib/filters/FilterProvider";
import { DEFAULT_FILTER_STATE } from "~/types/filters";

export default function FilterChips() {
  const { filters, setFilter, clearAll, isDefault } = useFilters();

  if (isDefault) return null;

  const chips: { label: string; onRemove: () => void }[] = [];

  // Bias tiers
  if (filters.biasTiers.length > 0) {
    chips.push({
      label: `Bias: ${filters.biasTiers.length} selected`,
      onRemove: () => setFilter("biasTiers", []),
    });
  }

  // Regions
  if (filters.regions.length > 0) {
    chips.push({
      label: `Region: ${filters.regions.join(", ")}`,
      onRemove: () => setFilter("regions", []),
    });
  }

  // Convergence
  if (
    filters.convergenceMin !== DEFAULT_FILTER_STATE.convergenceMin ||
    filters.convergenceMax !== DEFAULT_FILTER_STATE.convergenceMax
  ) {
    chips.push({
      label: `Conv: ${filters.convergenceMin}-${filters.convergenceMax}%`,
      onRemove: () => {
        setFilter("convergenceMin", 0);
        setFilter("convergenceMax", 100);
      },
    });
  }

  // Time
  if (filters.timeHorizon !== DEFAULT_FILTER_STATE.timeHorizon) {
    chips.push({
      label: `Time: ${filters.timeHorizon}`,
      onRemove: () => setFilter("timeHorizon", "today"),
    });
  }

  // Topics
  if (filters.topics.length > 0) {
    chips.push({
      label: `Topics: ${filters.topics.join(", ")}`,
      onRemove: () => setFilter("topics", []),
    });
  }

  // Source count
  if (filters.sourceCountMin !== DEFAULT_FILTER_STATE.sourceCountMin) {
    chips.push({
      label: `Sources: ${filters.sourceCountMin}+`,
      onRemove: () => setFilter("sourceCountMin", 1),
    });
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin py-1" aria-live="polite">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-ink/5 rounded-sm text-ink-muted whitespace-nowrap"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="w-3.5 h-3.5 flex items-center justify-center hover:text-ink transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-[11px] text-ink-faint hover:text-brand-red transition-colors whitespace-nowrap ml-auto shrink-0"
      >
        Reset All
      </button>
    </div>
  );
}
