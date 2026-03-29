import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 3) {
      onSearch(query.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a headline, URL, or topic..."
            aria-label="Search stories"
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/10 transition-colors"
            disabled={isSearching}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching || query.trim().length < 3}
          className="px-6 py-3 bg-ink text-paper rounded-sm text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSearching ? "Searching..." : "Triangulate"}
        </button>
      </div>
      <p className="text-[11px] text-ink-faint mt-2">
        Searches across 1,000+ analyzed stories from 55+ global outlets.
      </p>
    </form>
  );
}
