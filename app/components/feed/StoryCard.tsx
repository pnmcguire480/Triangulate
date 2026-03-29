import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Newspaper,
  MessageSquareText,
  FileText,
  Globe,
} from "lucide-react";
import { cn } from "~/lib/utils";
import TrustSignalBadge from "~/components/story/TrustSignalBadge";
import type { TrustSignal } from "~/types";

export interface StoryCardProps {
  id: string;
  title: string;
  trustSignal: TrustSignal;
  convergenceScore: number;
  articleCount: number;
  claimCount: number;
  primaryDocCount: number;
  biasTiers: string[];
  regions: string[];
  reportingCount: number;
  commentaryCount: number;
  createdAt: string;
}

export default function StoryCard({
  id,
  title,
  trustSignal,
  convergenceScore,
  articleCount,
  claimCount,
  primaryDocCount,
  biasTiers,
  regions,
  reportingCount,
  commentaryCount,
  createdAt,
}: StoryCardProps) {
  const biasSpreadWidth = Math.min(biasTiers.length / 7, 1) * 100;
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Link
      to={`/story/${id}`}
      className="group block"
    >
      <article className="py-5 border-b border-border group-hover:bg-paper-aged/50 transition-colors duration-150 -mx-2 px-2 rounded">
        {/* Dateline row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <TrustSignalBadge signal={trustSignal} size="sm" />
            {convergenceScore > 0 && (
              <span className="score text-[11px] text-ink-muted">
                {(convergenceScore * 100).toFixed(0)}% converged
              </span>
            )}
          </div>
          <time className="dateline" dateTime={createdAt}>{timeAgo}</time>
        </div>

        {/* Headline */}
        <h3 className="font-headline text-lg sm:text-xl font-semibold text-ink leading-snug mb-2 group-hover:text-brand-green transition-colors duration-150">
          {title}
        </h3>

        {/* Metadata row — newspaper dateline style */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          {/* Source count */}
          <span className="inline-flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5" />
            {articleCount} {articleCount === 1 ? "outlet" : "outlets"}
          </span>

          {/* Reporting / commentary split */}
          {reportingCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {reportingCount} reporting{commentaryCount > 0 ? `, ${commentaryCount} opinion` : ""}
            </span>
          )}

          {/* Claims */}
          {claimCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquareText className="w-3.5 h-3.5" />
              {claimCount} {claimCount === 1 ? "claim" : "claims"}
            </span>
          )}

          {/* Regions */}
          {regions.length > 1 && (
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {regions.length} regions
            </span>
          )}

          {/* Primary docs */}
          {primaryDocCount > 0 && (
            <span className="inline-flex items-center gap-1 text-brand-teal">
              <FileText className="w-3.5 h-3.5" /> {primaryDocCount} primary {primaryDocCount === 1 ? "source" : "sources"}
            </span>
          )}
        </div>

        {/* Bias spread indicator — thin bar showing ideological coverage */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-ink-faint uppercase tracking-wider">Spectrum</span>
          <div className="flex-1 h-1 bg-ink/5 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                convergenceScore >= 0.7 ? "bg-brand-green" :
                convergenceScore >= 0.3 ? "bg-brand-amber" :
                "bg-ink/20"
              )}
              style={{ width: `${biasSpreadWidth}%` }}
            />
          </div>
          <span className="text-xs text-ink-faint">
            {biasTiers.length}/7 tiers
          </span>
        </div>
      </article>
    </Link>
  );
}
