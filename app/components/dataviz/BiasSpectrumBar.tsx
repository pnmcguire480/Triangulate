// ============================================================
// Triangulate — BiasSpectrumBar (Chunk 5.2)
// 7-segment horizontal bar in 3 modes: inline, compact, full
// ============================================================

import type { BiasTier } from "~/types";

type BarMode = "inline" | "compact" | "full";

const ALL_TIERS: BiasTier[] = [
  "FAR_LEFT", "LEFT", "CENTER_LEFT", "CENTER",
  "CENTER_RIGHT", "RIGHT", "FAR_RIGHT",
];

const TIER_COLORS: Record<BiasTier, string> = {
  FAR_LEFT: "var(--color-bias-far-left)",
  LEFT: "var(--color-bias-left)",
  CENTER_LEFT: "var(--color-bias-center-left)",
  CENTER: "var(--color-bias-center)",
  CENTER_RIGHT: "var(--color-bias-center-right)",
  RIGHT: "var(--color-bias-right)",
  FAR_RIGHT: "var(--color-bias-far-right)",
};

const TIER_LABELS: Record<BiasTier, string> = {
  FAR_LEFT: "FL",
  LEFT: "L",
  CENTER_LEFT: "CL",
  CENTER: "C",
  CENTER_RIGHT: "CR",
  RIGHT: "R",
  FAR_RIGHT: "FR",
};

interface BiasSpectrumBarProps {
  /** Which tiers are active/present */
  activeTiers: BiasTier[];
  /** Display mode */
  mode?: BarMode;
  /** Click handler for interactive mode */
  onTierClick?: (tier: BiasTier) => void;
}

export default function BiasSpectrumBar({
  activeTiers,
  mode = "compact",
  onTierClick,
}: BiasSpectrumBarProps) {
  const height = mode === "inline" ? "h-0.5" : mode === "compact" ? "h-1.5" : "h-6";

  return (
    <div
      className={`flex ${height} w-full gap-px`}
      role="img"
      aria-label={`Bias tiers: ${activeTiers.map((t) => t.replace(/_/g, " ")).join(", ")}`}
    >
      {ALL_TIERS.map((tier) => {
        const isActive = activeTiers.includes(tier);
        const Element = onTierClick ? "button" : "div";

        return (
          <Element
            key={tier}
            onClick={onTierClick ? () => onTierClick(tier) : undefined}
            className={`flex-1 rounded-[1px] transition-opacity ${
              onTierClick ? "cursor-pointer hover:opacity-80" : ""
            } ${mode === "full" ? "flex items-center justify-center" : ""}`}
            style={{
              backgroundColor: TIER_COLORS[tier],
              opacity: isActive ? 1 : 0.1,
            }}
            aria-label={onTierClick ? `${tier.replace(/_/g, " ")}` : undefined}
          >
            {mode === "full" && (
              <span className="text-[8px] font-mono text-white/80 font-semibold">
                {TIER_LABELS[tier]}
              </span>
            )}
          </Element>
        );
      })}
    </div>
  );
}
