// ============================================================
// Triangulate — ConvergenceExplainer (Chunk 4.4)
// "Show the Math" — explains how a convergence score was calculated
// ============================================================

import { useState } from "react";
import { Calculator } from "lucide-react";

interface ConvergenceExplainerProps {
  score: number;
  sources: {
    supports: boolean;
    article?: { source: { name: string; biasTier: string } };
  }[];
}

const BIAS_POSITION: Record<string, number> = {
  FAR_LEFT: 0,
  LEFT: 1,
  CENTER_LEFT: 2,
  CENTER: 3,
  CENTER_RIGHT: 4,
  RIGHT: 5,
  FAR_RIGHT: 6,
};

export default function ConvergenceExplainer({
  score,
  sources,
}: ConvergenceExplainerProps) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(score * 100);

  // Extract unique supporting tiers
  const supportingTiers = [
    ...new Set(
      sources
        .filter((s) => s.supports && s.article)
        .map((s) => s.article!.source.biasTier)
    ),
  ];

  // Calculate explanation components
  const positions = supportingTiers.map((t) => BIAS_POSITION[t] ?? 3);
  const maxDistance =
    positions.length >= 2
      ? Math.max(...positions) - Math.min(...positions)
      : 0;
  const spreadScore = maxDistance / 6;

  const hasLeft = supportingTiers.some((t) =>
    ["FAR_LEFT", "LEFT", "CENTER_LEFT"].includes(t)
  );
  const hasRight = supportingTiers.some((t) =>
    ["CENTER_RIGHT", "RIGHT", "FAR_RIGHT"].includes(t)
  );
  const crossCenter = hasLeft && hasRight;

  const isFringeOnly =
    supportingTiers.length >= 2 &&
    supportingTiers.every((t) => t === "FAR_LEFT" || t === "FAR_RIGHT");

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] text-ink-faint hover:text-ink-muted transition-colors"
        aria-expanded={open}
      >
        <Calculator className="w-3 h-3" aria-hidden="true" />
        Show the math
      </button>

      {open && (
        <div className="mt-2 p-2.5 bg-paper-aged/50 rounded-sm text-[11px] text-ink-muted space-y-1.5">
          <p>
            <strong className="text-ink">Ideological spread:</strong>{" "}
            {supportingTiers.length} tiers confirming. Max distance:{" "}
            {maxDistance}/6 = {Math.round(spreadScore * 100)}% base score.
          </p>

          {crossCenter && (
            <p>
              <strong className="text-ink">Cross-center bonus:</strong> Sources
              from both sides of center agree. +15% bonus applied.
            </p>
          )}

          {isFringeOnly && (
            <p>
              <strong className="text-brand-amber">Fringe guard:</strong> Only
              far-left and far-right sources confirm. Score capped at 20% to
              prevent extremes-agree-but-center-doesn&apos;t inflation.
            </p>
          )}

          <p className="pt-1 border-t border-border">
            <strong className="text-ink">Final score: </strong>
            <span
              className="font-mono font-semibold"
              style={{
                color:
                  pct >= 70
                    ? "var(--color-brand-green)"
                    : pct >= 30
                      ? "var(--color-brand-amber)"
                      : "var(--color-brand-red)",
              }}
            >
              {pct}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
