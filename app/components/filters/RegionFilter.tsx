// ============================================================
// Triangulate — RegionFilter (Chunk 2.4)
// Region pills with count badges, multi-select
// ============================================================

import type { Region } from "~/types";
import { useFilters } from "~/lib/filters/FilterProvider";

const REGIONS: { region: Region; label: string; color: string }[] = [
  { region: "US", label: "US", color: "var(--color-region-us)" },
  { region: "UK", label: "UK", color: "var(--color-region-uk)" },
  { region: "EUROPE", label: "Europe", color: "var(--color-region-europe)" },
  { region: "MIDDLE_EAST", label: "Middle East", color: "var(--color-region-middle-east)" },
  { region: "ASIA_PACIFIC", label: "Asia-Pacific", color: "var(--color-region-asia-pacific)" },
  { region: "CANADA", label: "Canada", color: "var(--color-region-canada)" },
  { region: "LATIN_AMERICA", label: "Latin America", color: "var(--color-region-latin-america)" },
  { region: "AFRICA", label: "Africa", color: "var(--color-region-africa)" },
  { region: "OCEANIA", label: "Oceania", color: "var(--color-region-oceania)" },
  { region: "GLOBAL", label: "Global", color: "var(--color-region-global)" },
];

interface RegionFilterProps {
  counts?: Record<Region, number>;
}

export default function RegionFilter({ counts }: RegionFilterProps) {
  const { filters, setFilter } = useFilters();
  const selected = filters.regions;

  function toggleRegion(region: Region) {
    const next = selected.includes(region)
      ? selected.filter((r) => r !== region)
      : [...selected, region];
    setFilter("regions", next);
  }

  return (
    <div role="group" aria-label="Region filter" className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Regions
      </span>
      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map(({ region, label, color }) => {
          const isSelected = selected.includes(region);
          const count = counts?.[region] ?? 0;

          return (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-sm border transition-colors min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
                isSelected
                  ? "border-current bg-current/10 font-medium"
                  : "border-border text-ink-muted hover:border-border-strong"
              }`}
              style={{ color: isSelected ? color : undefined }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span>{label}</span>
              {count > 0 && (
                <span className="text-[10px] font-mono text-ink-faint">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
