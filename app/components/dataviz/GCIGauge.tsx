// ============================================================
// Triangulate — GCI Display Components (Chunk 5.6)
// Global Convergence Index gauge + ticker
// ============================================================

interface GCIGaugeProps {
  /** GCI score 0-100 */
  score: number;
  /** Change from previous day */
  delta?: number;
}

/**
 * GCI sparkline gauge for the header (120px wide).
 */
export default function GCIGauge({ score, delta }: GCIGaugeProps) {
  const color =
    score >= 60
      ? "var(--color-brand-green)"
      : score >= 35
        ? "var(--color-brand-amber)"
        : "var(--color-brand-red)";

  return (
    <div
      className="inline-flex items-center gap-2 px-2 py-1 bg-surface border border-border rounded-sm"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Global Convergence Index: ${score}`}
    >
      <span className="text-[9px] text-ink-faint font-semibold uppercase tracking-wider">
        GCI
      </span>
      <span className="text-lg font-mono font-bold" style={{ color }}>
        {score}
      </span>
      {delta != null && delta !== 0 && (
        <span
          className="text-[10px] font-mono"
          style={{ color: delta > 0 ? "var(--color-brand-green)" : "var(--color-brand-red)" }}
        >
          {delta > 0 ? "+" : ""}{delta}
        </span>
      )}
    </div>
  );
}
