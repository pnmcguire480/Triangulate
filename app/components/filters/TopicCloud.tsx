// ============================================================
// Triangulate — TopicCloud (Chunk 2.6)
// Weighted tag pills sized by story count, toggle on/off
// ============================================================

import { useState } from "react";
import { useFilters } from "~/lib/filters/FilterProvider";

const MAX_VISIBLE = 20;

interface TopicCloudProps {
  topics?: { name: string; count: number }[];
}

export default function TopicCloud({ topics = [] }: TopicCloudProps) {
  const { filters, setFilter } = useFilters();
  const [expanded, setExpanded] = useState(false);

  if (topics.length === 0) return null;

  const maxCount = Math.max(...topics.map((t) => t.count), 1);
  const visible = expanded ? topics : topics.slice(0, MAX_VISIBLE);
  const hasMore = topics.length > MAX_VISIBLE;

  function toggleTopic(name: string) {
    const next = filters.topics.includes(name)
      ? filters.topics.filter((t) => t !== name)
      : [...filters.topics, name];
    setFilter("topics", next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Topics
      </span>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Topic filter">
        {visible.map(({ name, count }) => {
          const isSelected = filters.topics.includes(name);
          // Scale font size between 10px and 14px based on count
          const scale = 10 + (count / maxCount) * 4;

          return (
            <button
              key={name}
              onClick={() => toggleTopic(name)}
              aria-pressed={isSelected}
              className={`px-2 py-0.5 rounded-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
                isSelected
                  ? "border-brand-green bg-brand-green/5 text-brand-green font-medium"
                  : "border-border text-ink-muted hover:border-border-strong"
              }`}
              style={{ fontSize: `${scale}px` }}
            >
              {name}
              <span className="ml-1 text-[9px] font-mono opacity-60">
                {count}
              </span>
            </button>
          );
        })}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="px-2 py-0.5 text-[10px] text-ink-faint hover:text-ink transition-colors"
          >
            +{topics.length - MAX_VISIBLE} more
          </button>
        )}
      </div>
    </div>
  );
}
