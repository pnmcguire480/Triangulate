import { cn } from "~/lib/utils";
import { TOPICS } from "~/lib/constants";

interface TopicFilterProps {
  selected: string;
  onSelect: (topic: string) => void;
}

export default function TopicFilter({ selected, onSelect }: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Topic filter">
      {TOPICS.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelect(topic)}
          aria-pressed={selected === topic}
          className={cn(
            "px-3 py-1 min-h-[44px] text-xs font-medium rounded-sm border transition-colors duration-150",
            selected === topic
              ? "bg-ink text-paper border-ink"
              : "bg-transparent text-ink-muted border-ink/10 hover:border-ink/25 hover:text-ink"
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
