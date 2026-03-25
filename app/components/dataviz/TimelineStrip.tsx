// ============================================================
// Triangulate — TimelineStrip (Chunk 5.5)
// Horizontal SVG timeline with articles as bias-colored dots
// ============================================================

const TIER_COLORS: Record<string, string> = {
  FAR_LEFT: "#1E40AF",
  LEFT: "#3B82F6",
  CENTER_LEFT: "#60A5FA",
  CENTER: "#6B7280",
  CENTER_RIGHT: "#F97316",
  RIGHT: "#EF4444",
  FAR_RIGHT: "#991B1B",
};

interface TimelineArticle {
  id: string;
  publishedAt: string;
  sourceName: string;
  biasTier: string;
}

interface TimelineStripProps {
  articles: TimelineArticle[];
  height?: number;
}

export default function TimelineStrip({
  articles,
  height = 48,
}: TimelineStripProps) {
  if (articles.length === 0) return null;

  const sorted = [...articles].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );

  const minTime = new Date(sorted[0].publishedAt).getTime();
  const maxTime = new Date(sorted[sorted.length - 1].publishedAt).getTime();
  const range = maxTime - minTime || 1;

  // Padding
  const padX = 12;
  const usableWidth = 100; // percentage

  return (
    <div className="w-full" role="img" aria-label="Article timeline">
      <svg viewBox={`0 0 ${usableWidth + padX * 2} ${height}`} className="w-full" style={{ height }}>
        {/* Timeline axis */}
        <line
          x1={padX}
          y1={height - 8}
          x2={usableWidth + padX}
          y2={height - 8}
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        {/* Grid lines every ~6 hours */}
        {Array.from({ length: 5 }).map((_, i) => {
          const x = padX + (i / 4) * usableWidth;
          return (
            <line
              key={i}
              x1={x}
              y1={4}
              x2={x}
              y2={height - 8}
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Article dots */}
        {sorted.map((article) => {
          const time = new Date(article.publishedAt).getTime();
          const x = padX + ((time - minTime) / range) * usableWidth;
          const color = TIER_COLORS[article.biasTier] ?? "#6B7280";

          return (
            <g key={article.id}>
              <circle
                cx={x}
                cy={height / 2}
                r={3}
                fill={color}
                opacity={0.8}
              >
                <title>{`${article.sourceName} — ${new Date(article.publishedAt).toLocaleString()}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
