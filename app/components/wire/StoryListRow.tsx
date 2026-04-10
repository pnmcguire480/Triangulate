// ============================================================
// Triangulate — StoryListRow Component (Chunk 3.1)
// Compact 72-88px row for command-center Wire panel
// ============================================================

import { memo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { BiasTier, Region, TrustSignal } from "~/types";
import { TRUST_SIGNAL_CONFIG } from "~/types";
import { cn } from "~/lib/utils";

// Tier configuration for discrete spectrum cells
const TIER_ORDER = ['FAR_LEFT', 'LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT', 'FAR_RIGHT'] as const;
const TIER_COLORS: Record<string, string> = {
  FAR_LEFT: '#1a5276', LEFT: '#2980b9', CENTER_LEFT: '#5dade2',
  CENTER: '#7f8c8d', CENTER_RIGHT: '#e67e22', RIGHT: '#e74c3c', FAR_RIGHT: '#922b21',
};
const TIER_SHORT_LABELS: Record<string, string> = {
  FAR_LEFT: 'Far L', LEFT: 'Left', CENTER_LEFT: 'Ctr-L',
  CENTER: 'Ctr', CENTER_RIGHT: 'Ctr-R', RIGHT: 'Right', FAR_RIGHT: 'Far R',
};

/** Build one-line evidence summary: "Confirmed by 5 sources across Left, Center, and Right" */
function buildEvidenceSummary(biasTiers: string[], articleCount: number): string {
  if (articleCount <= 1) return '1 source — awaiting confirmation';
  const readable = biasTiers.map(t => TIER_SHORT_LABELS[t] || t.replace(/_/g, ' ')).filter(Boolean);
  if (readable.length === 0) return `${articleCount} sources`;
  if (readable.length <= 3) return `${articleCount} sources across ${readable.join(', ')}`;
  return `${articleCount} sources across ${readable.slice(0, 2).join(', ')} and ${readable.length - 2} more`;
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
        <span className="text-[10px] font-mono text-ink-faint">
          {convergencePct >= 70 ? 'Strong' : convergencePct >= 30 ? 'Mixed' : 'Weak'}
        </span>
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

        {/* Evidence summary */}
        <p className="text-[11px] text-ink-muted mt-1">
          {buildEvidenceSummary(biasTiers, articleCount)}
          {claimCount > 0 && <span className="text-ink-faint"> · {claimCount} claims</span>}
          {regions.length > 1 && <span className="text-ink-faint"> · {regions.length} regions</span>}
        </p>

        {/* Discrete bias spectrum — 7 cells showing which tiers are present */}
        <div className="flex gap-px mt-1.5" aria-label="Bias spectrum coverage">
          {TIER_ORDER.map((tier) => {
            const isPresent = biasTiers.includes(tier);
            return (
              <div
                key={tier}
                className="h-1.5 flex-1 rounded-[1px] transition-opacity"
                style={{
                  backgroundColor: isPresent ? TIER_COLORS[tier] : undefined,
                  opacity: isPresent ? 1 : 0.12,
                }}
                title={isPresent ? TIER_SHORT_LABELS[tier] : undefined}
              />
            );
          })}
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

    </article>
  );
}

export default memo(StoryListRow);
