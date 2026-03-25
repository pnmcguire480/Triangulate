// ============================================================
// Triangulate — WirePanel Component (Chunk 3.2)
// Story list panel with tier headers and keyboard navigation
// ============================================================

import { useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import PanelContainer from "~/components/panels/PanelContainer";
import StoryListRow, { type StoryListRowProps } from "./StoryListRow";
import WireSkeleton from "./WireSkeleton";

interface WirePanelProps {
  stories: StoryListRowProps[];
  isLoading?: boolean;
}

// Group stories by signal tier for sticky headers
function groupBySignal(stories: StoryListRowProps[]) {
  const groups: { label: string; stories: StoryListRowProps[] }[] = [
    { label: "Highest Signal", stories: [] },
    { label: "Developing", stories: [] },
    { label: "Single Source", stories: [] },
  ];

  for (const story of stories) {
    const pct = Math.round(story.convergenceScore * 100);
    if (pct >= 70) {
      groups[0].stories.push(story);
    } else if (story.articleCount >= 2) {
      groups[1].stories.push(story);
    } else {
      groups[2].stories.push(story);
    }
  }

  return groups.filter((g) => g.stories.length > 0);
}

export default function WirePanel({ stories, isLoading = false }: WirePanelProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStoryId = searchParams.get("story");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectStory = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("story", id);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // j/k keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "j" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(focusedIndex + 1, stories.length - 1);
      setFocusedIndex(next);
      if (stories[next]) selectStory(stories[next].id);
    } else if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(focusedIndex - 1, 0);
      setFocusedIndex(prev);
      if (stories[prev]) selectStory(stories[prev].id);
    }
  }

  const groups = groupBySignal(stories);

  return (
    <PanelContainer
      title="The Wire"
      subtitle={`${stories.length}`}
      panelId="wire-panel"
      className="h-full"
    >
      <div
        tabIndex={0}
        role="region"
        aria-label="Story feed"
        aria-busy={isLoading}
        onKeyDown={handleKeyDown}
        className="h-full"
      >
        {isLoading ? (
          <WireSkeleton />
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-ink-muted">No stories match your filters.</p>
            <p className="text-xs text-ink-faint mt-1">
              Try adjusting your filters or selecting a different lens.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              {/* Sticky tier header */}
              <div className="sticky top-0 z-10 flex items-center px-3 py-1.5 bg-paper-aged/80 backdrop-blur-sm border-b border-border">
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                  {group.label}
                </span>
                <span className="ml-1.5 text-[10px] font-mono text-ink-faint">
                  ({group.stories.length})
                </span>
              </div>
              {group.stories.map((story) => (
                <StoryListRow
                  key={story.id}
                  {...story}
                  isSelected={story.id === selectedStoryId}
                  onClick={() => selectStory(story.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </PanelContainer>
  );
}
