// ============================================================
// Triangulate — ConvergenceGauge (Chunk 5.1)
// SVG semicircular arc gauge, 3 sizes
// ============================================================

type GaugeSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<GaugeSize, { width: number; fontSize: number; strokeWidth: number }> = {
  sm: { width: 32, fontSize: 10, strokeWidth: 3 },
  md: { width: 48, fontSize: 14, strokeWidth: 4 },
  lg: { width: 72, fontSize: 20, strokeWidth: 5 },
};

interface ConvergenceGaugeProps {
  /** Convergence score 0-100 */
  score: number;
  /** Gauge size */
  size?: GaugeSize;
  /** Show label text below */
  showLabel?: boolean;
}

export default function ConvergenceGauge({
  score,
  size = "md",
  showLabel = false,
}: ConvergenceGaugeProps) {
  const { width, fontSize, strokeWidth } = SIZE_MAP[size];
  const radius = (width - strokeWidth) / 2;
  const center = width / 2;

  // Arc from 135deg to 405deg (270deg sweep)
  const startAngle = 135;
  const endAngle = 405;
  const sweepRange = endAngle - startAngle;
  const scoreAngle = startAngle + (score / 100) * sweepRange;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const color =
    score >= 70
      ? "var(--color-brand-green)"
      : score >= 30
        ? "var(--color-brand-amber)"
        : "var(--color-brand-red)";

  const wordLabel = score >= 70 ? "Strong" : score >= 30 ? "Mixed" : "Weak";

  return (
    <div
      className="inline-flex flex-col items-center"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Convergence: ${wordLabel} (${score}%)`}
    >
      <svg
        width={width}
        height={width * 0.7}
        viewBox={`0 0 ${width} ${width * 0.7}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        {score > 0 && (
          <path
            d={describeArc(startAngle, scoreAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-[var(--timing-data)]"
          />
        )}
        {/* Center text */}
        <text
          x={center}
          y={center * 0.95}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono font-semibold"
          style={{ fontSize: `${fontSize}px`, fill: color }}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span className="text-[9px] text-ink-faint -mt-0.5">{wordLabel}</span>
      )}
    </div>
  );
}
