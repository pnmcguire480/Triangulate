import StoryCard from "~/components/feed/StoryCard";
import type { StoryCardProps } from "~/components/feed/StoryCard";
import { SearchX } from "lucide-react";

interface SearchResultsProps {
  results: StoryCardProps[];
  query: string;
  isSearching: boolean;
}

export default function SearchResults({ results, query, isSearching }: SearchResultsProps) {
  if (isSearching) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
        <p className="text-sm text-ink-muted mt-3">Searching across the spectrum...</p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="py-12 text-center" aria-live="polite">
        <SearchX className="w-8 h-8 text-ink-faint mx-auto mb-3" />
        <p className="font-headline text-lg text-ink-muted mb-1">
          No matches found
        </p>
        <p className="text-sm text-ink-faint max-w-md mx-auto">
          No analyzed stories match &ldquo;{query}&rdquo;. Try different keywords
          or check back later — new stories are ingested throughout the day.
        </p>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="rule-line-double flex-1" />
      </div>
      <p className="dateline mb-4" aria-live="polite">
        {results.length} {results.length === 1 ? "story" : "stories"} matching &ldquo;{query}&rdquo;
      </p>
      <div>
        {results.map((story) => (
          <StoryCard key={story.id} {...story} />
        ))}
      </div>
      <div className="rule-line mt-4" />
    </div>
  );
}
