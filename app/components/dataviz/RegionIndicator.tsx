// ============================================================
// Triangulate — RegionIndicator (Chunk 5.3)
// Row of colored circles indicating active regions
// ============================================================

import type { Region } from "~/types";

type IndicatorSize = "sm" | "md";

const REGION_ORDER: Region[] = [
  "US", "UK", "EUROPE", "MIDDLE_EAST", "ASIA_PACIFIC",
  "CANADA", "LATIN_AMERICA", "AFRICA", "OCEANIA", "GLOBAL",
];

const REGION_COLORS: Record<Region, string> = {
  US: "var(--color-region-us)",
  UK: "var(--color-region-uk)",
  EUROPE: "var(--color-region-europe)",
  MIDDLE_EAST: "var(--color-region-middle-east)",
  ASIA_PACIFIC: "var(--color-region-asia-pacific)",
  CANADA: "var(--color-region-canada)",
  LATIN_AMERICA: "var(--color-region-latin-america)",
  AFRICA: "var(--color-region-africa)",
  OCEANIA: "var(--color-region-oceania)",
  GLOBAL: "var(--color-region-global)",
};

const REGION_NAMES: Record<Region, string> = {
  US: "United States",
  UK: "United Kingdom",
  EUROPE: "Europe",
  MIDDLE_EAST: "Middle East",
  ASIA_PACIFIC: "Asia-Pacific",
  CANADA: "Canada",
  LATIN_AMERICA: "Latin America",
  AFRICA: "Africa",
  OCEANIA: "Oceania",
  GLOBAL: "Global",
};

interface RegionIndicatorProps {
  activeRegions: Region[];
  size?: IndicatorSize;
  /** Outlet counts per region */
  counts?: Record<Region, number>;
}

export default function RegionIndicator({
  activeRegions,
  size = "sm",
  counts,
}: RegionIndicatorProps) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Regions: ${activeRegions.map((r) => REGION_NAMES[r]).join(", ")}`}
    >
      {REGION_ORDER.map((region) => {
        const isActive = activeRegions.includes(region);
        const count = counts?.[region];
        const tooltip = count != null
          ? `${REGION_NAMES[region]}: ${count} outlets`
          : REGION_NAMES[region];

        return (
          <span
            key={region}
            className={`${dotSize} rounded-full transition-colors`}
            style={{
              backgroundColor: isActive
                ? REGION_COLORS[region]
                : "var(--color-border)",
            }}
            title={tooltip}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
