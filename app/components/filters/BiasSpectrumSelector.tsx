// ============================================================
// Triangulate — BiasSpectrumSelector (Chunk 2.3)
// The signature 7-segment bias tier selector
// ============================================================

import type { BiasTier } from "~/types";
import { useFilters } from "~/lib/filters/FilterProvider";

const BIAS_TIERS: { tier: BiasTier; label: string; color: string }[] = [
  { tier: "FAR_LEFT", label: "Far Left", color: "var(--color-bias-far-left)" },
  { tier: "LEFT", label: "Left", color: "var(--color-bias-left)" },
  { tier: "CENTER_LEFT", label: "Center Left", color: "var(--color-bias-center-left)" },
  { tier: "CENTER", label: "Center", color: "var(--color-bias-center)" },
  { tier: "CENTER_RIGHT", label: "Center Right", color: "var(--color-bias-center-right)" },
  { tier: "RIGHT", label: "Right", color: "var(--color-bias-right)" },
  { tier: "FAR_RIGHT", label: "Far Right", color: "var(--color-bias-far-right)" },
];

interface BiasSpectrumSelectorProps {
  counts?: Record<BiasTier, number>;
}

export default function BiasSpectrumSelector({ counts }: BiasSpectrumSelectorProps) {
  const { filters, setFilter } = useFilters();
  const selected = filters.biasTiers;

  function toggleTier(tier: BiasTier) {
    const next = selected.includes(tier)
      ? selected.filter((t) => t !== tier)
      : [...selected, tier];
    setFilter("biasTiers", next);
  }

  return (
    <div role="group" aria-label="Bias tier filter" className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Bias Spectrum
      </span>
      <div className="flex gap-0.5">
        {BIAS_TIERS.map(({ tier, label, color }) => {
          const isSelected = selected.length === 0 || selected.includes(tier);
          const count = counts?.[tier] ?? 0;

          return (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              aria-pressed={selected.includes(tier)}
              aria-label={`${label}: ${count} stories`}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-sm transition-opacity min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              style={{ opacity: isSelected ? 1 : 0.2 }}
            >
              <div
                className="w-full h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-ink-faint whitespace-nowrap">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
