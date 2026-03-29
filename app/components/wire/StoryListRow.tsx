// ============================================================
// Triangulate — StoryListRow Component (Chunk 3.1)
// Compact 72-88px row for command-center Wire panel
// ============================================================

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { BiasTier, Region, TrustSignal } from "@prisma/client";
import { TRUST_SIGNAL_CONFIG } from "~/types";
import { cn } from "~/lib/utils";

// Build a CSS gradient from active bias tiers (Fix 48: single div instead of 7)
function buildSpectrumGradient(tiers: string[]): string {
  const tierColors: Record<string, string> = {
    FAR_LEFT: '#1a5276', LEFT: '#2980b9', CENTER_LEFT: '#5dade2',
    CENTER: '#7f8c8d', CENTER_RIGHT: '#e67e22', RIGHT: '#e74c3c', FAR_RIGHT: '#922b21',
  };
  if (!tiers.length) return 'transparent';
  const segments = tiers.map((t, i) => {
    const color = tierColors[t] || '#7f8c8d';
    const start = (i / tiers.length) * 100;
    const end = ((i + 1) / tiers.length) * 100;
    return `${color} ${start}% ${end}%`;
  });
  return `linear-gradient(to right, ${segments.join(', ')})`;
}

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
  convergenceDelta?: number | null;
  convergenceDirection?: 'rising' | 'falling' | 'stable' | null;
  onClick?: () => void;
}

function StoryListRow({
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
  convergenceDelta,
  convergenceDirection,
  onClick,
}: StoryListRowProps) {
  const signalConfig = TRUST_SIGNAL_CONFIG[trustSignal];
  const convergencePct = Math.round(convergenceScore * 100);
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: false });

  return (
    <article
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 border-b border-border cursor-pointer transition-colors hover:bg-ink/[0.04]",
        isSelected && "bg-brand-green/[0.04] border-l-[3px] border-l-brand-green"
      )}
      style={{ minHeight: "var(--density-row-height, 72px)" }}
      onClick={onClick}
      tabIndex={0}
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

      {/* Right: Score + time (hidden on mobile to avoid triple convergence) */}
      <div className="hidden md:block shrink-0 text-right">
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
        {convergenceDelta != null && convergenceDirection && convergenceDirection !== 'stable' && (
          <div
            className="text-[9px] font-mono"
            style={{
              color: convergenceDirection === 'rising'
                ? "var(--color-brand-green)"
                : "var(--color-brand-red)",
            }}
          >
            {convergenceDirection === 'rising' ? '▲' : '▼'} {Math.abs(convergenceDelta)}%
          </div>
        )}
        <div className="text-[10px] text-ink-faint">{timeAgo}</div>
      </div>

      {/* Bottom: Inline bias spectrum bar (single gradient div) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
        style={{ background: buildSpectrumGradient(biasTiers) }}
      />
    </article>
  );
}

export default memo(StoryListRow);
