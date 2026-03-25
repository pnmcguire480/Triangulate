// ============================================================
// Triangulate — StoryListRow Component (Chunk 3.1)
// Compact 72-88px row for command-center Wire panel
// ============================================================

import { formatDistanceToNow } from "date-fns";
import type { BiasTier, Region, TrustSignal } from "@prisma/client";
import { TRUST_SIGNAL_CONFIG } from "~/types";

// Bias tier colors for the inline spectrum bar
const BIAS_TIER_COLORS: Record<BiasTier, string> = {
  FAR_LEFT: "var(--color-bias-far-left)",
  LEFT: "var(--color-bias-left)",
  CENTER_LEFT: "var(--color-bias-center-left)",
  CENTER: "var(--color-bias-center)",
  CENTER_RIGHT: "var(--color-bias-center-right)",
  RIGHT: "var(--color-bias-right)",
  FAR_RIGHT: "var(--color-bias-far-right)",
};

const ALL_TIERS: BiasTier[] = ["FAR_LEFT", "LEFT", "CENTER_LEFT", "CENTER", "CENTER_RIGHT", "RIGHT", "FAR_RIGHT"];

export interface StoryListRowProps {
  id: string;
  title: string;
  trustSignal: TrustSignal;
  convergenceScore: number;
  articleCount: number;
  claimCount: number;
  biasTiers: BiasTier[];
  regions: Region[];
  sourceNames?: string[];
  createdAt: string;
  isSelected?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export default function StoryListRow({
  id,
  title,
  trustSignal,
  convergenceScore,
  articleCount,
  claimCount,
  biasTiers,
  regions,
  sourceNames = [],
  createdAt,
  isSelected = false,
  isNew = false,
  onClick,
}: StoryListRowProps) {
  const signalConfig = TRUST_SIGNAL_CONFIG[trustSignal];
  const convergencePct = Math.round(convergenceScore * 100);
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: false });

  return (
    <article
      className={`relative flex items-center gap-3 px-3 py-2 border-b border-border cursor-pointer transition-colors hover:bg-ink/[0.02] ${
        isSelected ? "bg-brand-green/[0.04] border-l-[3px] border-l-brand-green" : ""
      }`}
      style={{ minHeight: "var(--density-row-height, 72px)" }}
      onClick={onClick}
      tabIndex={0}
      role="article"
      aria-label={`${title}. ${convergencePct}% convergence. ${articleCount} sources.`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Left: Mini convergence gauge */}
      <div className="shrink-0 w-12 flex flex-col items-center">
        <svg viewBox="0 0 36 20" className="w-8 h-5" aria-hidden="true">
          <path
            d="M 4 18 A 14 14 0 0 1 32 18"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 4 18 A 14 14 0 0 1 32 18"
            fill="none"
            stroke={
              convergencePct >= 70
                ? "var(--color-brand-green)"
                : convergencePct >= 30
                  ? "var(--color-brand-amber)"
                  : "var(--color-brand-red)"
            }
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(convergencePct / 100) * 44} 44`}
          />
        </svg>
        <span className="text-[10px] font-mono text-ink-faint">{convergencePct}%</span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Headline */}
        <h3 className="font-headline text-sm font-semibold text-ink leading-tight line-clamp-2">
          {isNew && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green mr-1.5 align-middle" />
          )}
          {title}
        </h3>

        {/* Source pills */}
        {sourceNames.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {sourceNames.slice(0, 5).map((name) => (
              <span
                key={name}
                className="text-[10px] px-1.5 py-0.5 bg-ink/5 rounded-sm text-ink-muted"
              >
                {name}
              </span>
            ))}
            {sourceNames.length > 5 && (
              <span className="text-[10px] text-ink-faint">
                +{sourceNames.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Metadata line */}
        <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-faint">
          <span
            className="inline-flex items-center gap-1"
            style={{ color: signalConfig.color }}
          >
            <span aria-hidden="true">{signalConfig.icon}</span>
            {signalConfig.label}
          </span>
          <span>{articleCount} outlets</span>
          <span>{claimCount} claims</span>
          {regions.length > 1 && (
            <span>{regions.length} regions</span>
          )}
        </div>
      </div>

      {/* Right: Score + time */}
      <div className="shrink-0 text-right">
        <div
          className="text-lg font-mono font-semibold"
          style={{
            color:
              convergencePct >= 70
                ? "var(--color-brand-green)"
                : convergencePct >= 30
                  ? "var(--color-brand-amber)"
                  : "var(--color-brand-red)",
          }}
        >
          {convergencePct}
        </div>
        <div className="text-[10px] text-ink-faint">{timeAgo}</div>
      </div>

      {/* Bottom: Inline bias spectrum bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
        {ALL_TIERS.map((tier) => (
          <div
            key={tier}
            className="flex-1"
            style={{
              backgroundColor: biasTiers.includes(tier)
                ? BIAS_TIER_COLORS[tier]
                : "transparent",
              opacity: biasTiers.includes(tier) ? 1 : 0.1,
            }}
          />
        ))}
      </div>
    </article>
  );
}
