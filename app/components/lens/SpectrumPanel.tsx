// ============================================================
// Triangulate — SpectrumPanel (Chunk 4.2)
// 7-column bias tier display (desktop), vertical list (mobile)
// ============================================================

import { ExternalLink } from "lucide-react";
import type { BiasTier } from "@prisma/client";

const TIER_ORDER: BiasTier[] = [
  "FAR_LEFT", "LEFT", "CENTER_LEFT", "CENTER",
  "CENTER_RIGHT", "RIGHT", "FAR_RIGHT",
];

const TIER_LABELS: Record<BiasTier, string> = {
  FAR_LEFT: "Far Left",
  LEFT: "Left",
  CENTER_LEFT: "Center Left",
  CENTER: "Center",
  CENTER_RIGHT: "Center Right",
  RIGHT: "Right",
  FAR_RIGHT: "Far Right",
};

const TIER_COLORS: Record<BiasTier, string> = {
  FAR_LEFT: "var(--color-bias-far-left)",
  LEFT: "var(--color-bias-left)",
  CENTER_LEFT: "var(--color-bias-center-left)",
  CENTER: "var(--color-bias-center)",
  CENTER_RIGHT: "var(--color-bias-center-right)",
  RIGHT: "var(--color-bias-right)",
  FAR_RIGHT: "var(--color-bias-far-right)",
};

interface SpectrumArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  contentType: string;
  source: { name: string; biasTier: string; region: string };
}

interface SpectrumPanelProps {
  articles: SpectrumArticle[];
}

export default function SpectrumPanel({ articles }: SpectrumPanelProps) {
  // Group articles by bias tier
  const grouped: Record<BiasTier, SpectrumArticle[]> = {} as any;
  for (const tier of TIER_ORDER) {
    grouped[tier] = articles.filter((a) => a.source.biasTier === tier);
  }

  // Count summary
  const leftCount = articles.filter((a) =>
    ["FAR_LEFT", "LEFT", "CENTER_LEFT"].includes(a.source.biasTier)
  ).length;
  const centerCount = articles.filter((a) => a.source.biasTier === "CENTER").length;
  const rightCount = articles.filter((a) =>
    ["CENTER_RIGHT", "RIGHT", "FAR_RIGHT"].includes(a.source.biasTier)
  ).length;

  return (
    <div>
      {/* Summary */}
      <p className="text-xs text-ink-muted mb-3">
        Coverage from <strong>{leftCount} left</strong>,{" "}
        <strong>{centerCount} center</strong>,{" "}
        <strong>{rightCount} right</strong> outlets
      </p>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-1">
        {TIER_ORDER.map((tier) => (
          <div
            key={tier}
            className="flex flex-col"
            aria-label={`${TIER_LABELS[tier]} sources: ${grouped[tier].length} outlets`}
          >
            {/* Column header */}
            <div
              className="px-1 py-1 text-center text-[9px] font-semibold text-white rounded-t-sm"
              style={{ backgroundColor: TIER_COLORS[tier] }}
            >
              {TIER_LABELS[tier]}
            </div>

            {/* Articles */}
            <div className="flex-1 border border-border border-t-0 rounded-b-sm overflow-y-auto max-h-64">
              {grouped[tier].length === 0 ? (
                <div className="p-2 text-center text-[10px] text-ink-faint">
                  No coverage
                </div>
              ) : (
                grouped[tier].map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-1.5 py-1.5 border-b border-border last:border-0 hover:bg-ink/[0.02] transition-colors"
                  >
                    <p className="text-[10px] font-medium text-ink">
                      {article.source.name}
                    </p>
                    <p className="text-[9px] text-ink-muted line-clamp-2 mt-0.5">
                      {article.title}
                    </p>
                  </a>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: vertical list grouped by tier */}
      <div className="md:hidden space-y-3">
        {TIER_ORDER.filter((tier) => grouped[tier].length > 0).map((tier) => (
          <div key={tier}>
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-sm mb-1"
              style={{ backgroundColor: `${TIER_COLORS[tier]}15` }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: TIER_COLORS[tier] }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold" style={{ color: TIER_COLORS[tier] }}>
                {TIER_LABELS[tier]} ({grouped[tier].length})
              </span>
            </div>
            {grouped[tier].map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-ink/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink">{article.source.name}</p>
                  <p className="text-[11px] text-ink-muted line-clamp-1">{article.title}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-ink-faint shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
