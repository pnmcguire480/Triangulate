// ============================================================
// Triangulate — TimeHorizon Filter (Chunk 2.7)
// Segmented control: Now | Today | Week | Month | Custom
// ============================================================

import { useFilters } from "~/lib/filters/FilterProvider";
import type { TimeHorizon as TimeHorizonType } from "~/types/filters";

const OPTIONS: { value: TimeHorizonType; label: string }[] = [
  { value: "now", label: "Now" },
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "custom", label: "Custom" },
];

export default function TimeHorizon() {
  const { filters, setFilter } = useFilters();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Time
      </span>
      <div role="radiogroup" aria-label="Time horizon" className="flex gap-0.5">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            role="radio"
            aria-checked={filters.timeHorizon === value}
            onClick={() => setFilter("timeHorizon", value)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-sm transition-colors text-center min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
              filters.timeHorizon === value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:bg-ink/[0.04]"
            }`}
          >
            {label}
            {value === "now" && filters.timeHorizon === "now" && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-brand-green inline-block signal-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Custom date picker (basic) */}
      {filters.timeHorizon === "custom" && (
        <div className="flex gap-2 mt-1">
          <input
            type="date"
            value={filters.customDateStart ?? ""}
            onChange={(e) => setFilter("customDateStart", e.target.value)}
            aria-label="Start date"
            className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded-sm text-ink"
          />
          <input
            type="date"
            value={filters.customDateEnd ?? ""}
            onChange={(e) => setFilter("customDateEnd", e.target.value)}
            aria-label="End date"
            className="flex-1 px-2 py-1 text-xs bg-surface border border-border rounded-sm text-ink"
          />
        </div>
      )}
    </div>
  );
}
