import { cn } from "~/lib/utils";
import { FileText, MessageSquareText, Layers } from "lucide-react";

type ContentFilter = "ALL" | "REPORTING" | "COMMENTARY";

interface ContentTypeFilterProps {
  selected: ContentFilter;
  onSelect: (filter: ContentFilter) => void;
}

const FILTERS: { value: ContentFilter; label: string; icon: typeof Layers }[] = [
  { value: "ALL", label: "All Stories", icon: Layers },
  { value: "REPORTING", label: "Reporting", icon: FileText },
  { value: "COMMENTARY", label: "Commentary", icon: MessageSquareText },
];

export default function ContentTypeFilter({ selected, onSelect }: ContentTypeFilterProps) {
  return (
    <div className="inline-flex items-center border border-border-strong rounded-sm" role="group" aria-label="Content type filter">
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.value}
            onClick={() => onSelect(filter.value)}
            aria-pressed={selected === filter.value}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-medium whitespace-nowrap transition-colors duration-150 border-r border-border last:border-r-0",
              selected === filter.value
                ? "bg-ink text-paper"
                : "bg-transparent text-ink-muted hover:text-ink hover:bg-ink/5"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
