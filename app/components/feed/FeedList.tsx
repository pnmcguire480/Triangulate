import StoryCard from "~/components/feed/StoryCard";
import type { StoryCardProps } from "~/components/feed/StoryCard";
import { StoryCardSkeleton } from "~/components/ui/Skeleton";

interface FeedListProps {
  stories: StoryCardProps[];
  isLoading?: boolean;
}

export default function FeedList({ stories, isLoading = false }: FeedListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <StoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-headline text-xl text-ink-muted mb-2">
          No stories yet today.
        </p>
        <p className="text-sm text-ink-faint">
          The presses are warming up. Stories are ingested and analyzed throughout the day.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Edition header — like a newspaper section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="rule-line-double flex-1" />
      </div>

      {/* Story list */}
      <div>
        {stories.map((story) => (
          <StoryCard key={story.id} {...story} />
        ))}
      </div>

      {/* Footer rule */}
      <div className="rule-line mt-4" />
    </div>
  );
}
