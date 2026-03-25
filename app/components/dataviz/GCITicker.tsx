// ============================================================
// Triangulate — GCITicker (Chunk 5.6)
// Compact GCI display for the status bar
// ============================================================

interface GCITickerProps {
  score: number;
}

export default function GCITicker({ score }: GCITickerProps) {
  const color =
    score >= 60
      ? "var(--color-brand-green)"
      : score >= 35
        ? "var(--color-brand-amber)"
        : "var(--color-brand-red)";

  return (
    <span className="font-mono font-semibold text-[11px]" style={{ color }}>
      GCI {score}
    </span>
  );
}
