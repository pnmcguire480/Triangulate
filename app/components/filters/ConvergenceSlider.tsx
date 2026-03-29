// ============================================================
// Triangulate — ConvergenceSlider (Chunk 2.5)
// Range slider 0-100 with color zones
// ============================================================

import { useRef, useCallback } from "react";
import { useFilters } from "~/lib/filters/FilterProvider";

const PRESETS = [
  { label: "Any", min: 0, max: 100 },
  { label: ">30%", min: 30, max: 100 },
  { label: ">70%", min: 70, max: 100 },
] as const;

export default function ConvergenceSlider() {
  const { filters, setFilter } = useFilters();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilter("convergenceMin", Math.min(val, filters.convergenceMax));
      }, 150);
    },
    [filters.convergenceMax, setFilter]
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilter("convergenceMax", Math.max(val, filters.convergenceMin));
      }, 150);
    },
    [filters.convergenceMin, setFilter]
  );

  function applyPreset(min: number, max: number) {
    setFilter("convergenceMin", min);
    setFilter("convergenceMax", max);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Convergence
      </span>

      {/* Track visualization */}
      <div className="relative h-2 rounded-full overflow-hidden bg-ink/5">
        <div className="absolute inset-y-0 left-0 w-[30%] bg-brand-red/30" />
        <div className="absolute inset-y-0 left-[30%] w-[40%] bg-brand-amber/30" />
        <div className="absolute inset-y-0 left-[70%] w-[30%] bg-brand-green/30" />
        {/* Active range highlight */}
        <div
          className="absolute inset-y-0 bg-brand-green/60"
          style={{
            left: `${filters.convergenceMin}%`,
            width: `${filters.convergenceMax - filters.convergenceMin}%`,
          }}
        />
      </div>

      {/* Min slider */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-ink-faint w-8">Min</label>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.convergenceMin}
          onChange={handleMinChange}
          aria-label="Minimum convergence"
          aria-valuenow={filters.convergenceMin}
          className="flex-1 h-1 accent-brand-green"
        />
        <span className="text-[11px] font-mono text-ink-faint w-8 text-right">
          {filters.convergenceMin}%
        </span>
      </div>

      {/* Max slider */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-ink-faint w-8">Max</label>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.convergenceMax}
          onChange={handleMaxChange}
          aria-label="Maximum convergence"
          aria-valuenow={filters.convergenceMax}
          className="flex-1 h-1 accent-brand-green"
        />
        <span className="text-[11px] font-mono text-ink-faint w-8 text-right">
          {filters.convergenceMax}%
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.min, preset.max)}
            className={`px-2 py-1 min-h-[44px] text-[10px] rounded-sm border transition-colors ${
              filters.convergenceMin === preset.min && filters.convergenceMax === preset.max
                ? "border-brand-green text-brand-green bg-brand-green/5"
                : "border-border text-ink-muted hover:border-border-strong"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
