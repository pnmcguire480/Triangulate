import { useState, useCallback } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router";
import StoryCard from "~/components/feed/StoryCard";
import type { StoryCardProps } from "~/components/feed/StoryCard";
import ContentTypeFilter from "~/components/feed/ContentTypeFilter";
import { cn } from "~/lib/utils";

interface FeedDashboardProps {
  stories: StoryCardProps[];
}

// Region display names
const REGION_LABELS: Record<string, string> = {
  US: "United States",
  UK: "United Kingdom",
  EUROPE: "Europe",
  MIDDLE_EAST: "Middle East",
  ASIA_PACIFIC: "Asia-Pacific",
  CANADA: "Canada",
  GLOBAL: "Global",
  LATIN_AMERICA: "Latin America",
  AFRICA: "Africa",
  OCEANIA: "Oceania",
};

export default function FeedDashboard({ stories }: FeedDashboardProps) {
  const [contentFilter, setContentFilter] = useState<"ALL" | "REPORTING" | "COMMENTARY">("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [minSources, setMinSources] = useState<number>(1);
  const [showFilters, setShowFilters] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const resetFilters = useCallback(() => {
    setContentFilter("ALL");
    setRegionFilter("ALL");
    setMinSources(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Get unique regions from data
  const allRegions = [...new Set(stories.flatMap((s) => s.regions))].sort();

  // Apply filters
  const filtered = stories.filter((s) => {
    if (contentFilter === "REPORTING" && s.reportingCount === 0) return false;
    if (contentFilter === "COMMENTARY" && s.commentaryCount === 0) return false;
    if (regionFilter !== "ALL" && !s.regions.includes(regionFilter)) return false;
    if (s.articleCount < minSources) return false;
    return true;
  });

  // Tier the results
  const converged = filtered.filter(
    (s) => s.articleCount >= 2 && s.claimCount > 0 && (s.convergenceScore >= 0.3 || s.primaryDocCount > 0)
  );
  const developing = filtered.filter(
    (s) => s.articleCount >= 2 && !converged.find((c) => c.id === s.id)
  );
  const single = filtered.filter((s) => s.articleCount < 2);

  return (
    <div>
      {/* Filter bar — sticky below header */}
      <div className="sticky top-16 z-40 bg-paper/95 backdrop-blur-sm border-b border-border py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <ContentTypeFilter selected={contentFilter} onSelect={setContentFilter} />

            {/* Source count filter */}
            <div className="inline-flex items-center border border-border-strong rounded-sm" role="group" aria-label="Minimum source count filter">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setMinSources(n)}
                  aria-pressed={minSources === n}
                  className={cn(
                    "px-3 py-2 min-h-[44px] text-xs font-medium whitespace-nowrap transition-colors border-r border-border last:border-r-0",
                    minSources === n
                      ? "bg-ink text-paper"
                      : "text-ink-muted hover:text-ink hover:bg-ink/5"
                  )}
                >
                  {n === 1 ? "All" : `${n}+ sources`}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle advanced filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm transition-colors",
              showFilters ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Region filter">
              <span className="dateline shrink-0">Region</span>
              <button
                onClick={() => setRegionFilter("ALL")}
                aria-pressed={regionFilter === "ALL"}
                className={cn(
                  "px-2.5 py-1 min-h-[44px] text-xs rounded-sm transition-colors",
                  regionFilter === "ALL" ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
                )}
              >
                All
              </button>
              {allRegions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegionFilter(r)}
                  aria-pressed={regionFilter === r}
                  className={cn(
                    "px-2.5 py-1 min-h-[44px] text-xs rounded-sm transition-colors",
                    regionFilter === r ? "bg-ink text-paper" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {REGION_LABELS[r] || r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feed container — contained scroll */}
      <div className="mt-4 md:max-h-[calc(100vh-220px)] md:overflow-y-auto pr-2 scrollbar-thin">

        {/* TIER 1: Highest Signal */}
        {converged.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-paper py-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20">
                Highest Signal
              </span>
              <div className="rule-line flex-1" />
              <span className="dateline">{converged.length}</span>
            </div>
            {converged.map((s) => (
              <StoryCard key={s.id} {...s} />
            ))}
          </div>
        )}

        {/* TIER 2: Developing */}
        {developing.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-paper py-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-brand-amber/10 text-brand-amber border border-brand-amber/20">
                Developing
              </span>
              <div className="rule-line flex-1" />
              <span className="dateline">{developing.length}</span>
            </div>
            {developing.map((s) => (
              <StoryCard key={s.id} {...s} />
            ))}
          </div>
        )}

        {/* TIER 3: Single Source */}
        {single.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-paper py-2 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-ink/5 text-ink-muted border border-border">
                Single Source
              </span>
              <div className="rule-line flex-1" />
              <span className="dateline">{single.length}</span>
            </div>
            {single.slice(0, 15).map((s) => (
              <StoryCard key={s.id} {...s} />
            ))}
            {single.length > 15 && (
              <p className="text-xs text-ink-faint text-center py-3">
                + {single.length - 15} more
              </p>
            )}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Filter className="w-6 h-6 text-ink-faint mx-auto mb-2" />
            <p className="text-sm text-ink-muted">No stories match your filters.</p>
            <p className="text-xs text-ink-faint mt-1">Try adjusting your filters</p>
            <button onClick={resetFilters} className="mt-2 text-sm text-brand-green hover:underline">
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
