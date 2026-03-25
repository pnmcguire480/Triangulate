// ============================================================
// Triangulate — Search Page Redesign (Chunk 9.1)
// Integrated into AppShell, results as StoryListRows
// ============================================================

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Search as SearchIcon, Zap } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  trustSignal: string;
  convergenceScore: number;
  articleCount: number;
  claimCount: number;
  biasTiers: string[];
  regions: string[];
  topClaim?: string;
  topClaimScore?: number;
  createdAt: string;
}

const TRUST_SIGNAL_COLORS: Record<string, string> = {
  SINGLE_SOURCE: '#E76F51', CONTESTED: '#E9C46A', CONVERGED: '#2D6A4F',
  SOURCE_BACKED: '#264653', INSTITUTIONALLY_VALIDATED: '#6C63FF',
};

const BIAS_TIER_COLORS: Record<string, string> = {
  FAR_LEFT: '#1E40AF', LEFT: '#3B82F6', CENTER_LEFT: '#60A5FA',
  CENTER: '#6B7280', CENTER_RIGHT: '#F97316', RIGHT: '#EF4444', FAR_RIGHT: '#991B1B',
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search if query param present
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim() || searchQuery.length < 3) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-ink mb-2">
          Triangulate a Story
        </h1>
        <p className="text-sm text-ink-muted">
          Paste a headline, URL, or topic. We search 55+ outlets across 7 regions.
        </p>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, claims, sources..."
            className="w-full pl-10 pr-24 py-3 rounded-sm border border-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:border-brand-green focus:outline-none transition-colors"
            aria-label="Search"
          />
          <button
            type="submit"
            disabled={isSearching || query.trim().length < 3}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-ink text-paper rounded-sm text-xs font-medium disabled:opacity-40 hover:bg-ink-light transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Results count */}
      {hasSearched && (
        <div className="mb-4" aria-live="polite">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
            {isSearching ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${initialQuery || query}"`}
          </p>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-1.5">
        {results.map((result) => (
          <button
            key={result.id}
            onClick={() => navigate(`/story/${result.id}`)}
            className="w-full flex items-start gap-3 px-3 py-3 rounded-sm border border-border bg-surface hover:border-border-strong hover:bg-ink/[0.02] transition-colors text-left group"
          >
            {/* Convergence gauge */}
            <div className="shrink-0 w-10 h-10 flex items-center justify-center">
              <span
                className="text-sm font-mono font-bold"
                style={{
                  color: result.convergenceScore > 0.7 ? '#2D6A4F' : result.convergenceScore > 0.3 ? '#E9C46A' : '#E76F51',
                }}
              >
                {(result.convergenceScore * 100).toFixed(0)}%
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink mb-1 group-hover:text-brand-green transition-colors line-clamp-2">
                {result.title}
              </p>

              {/* Top claim preview */}
              {result.topClaim && (
                <p className="text-xs text-ink-muted mb-1.5 italic line-clamp-1">
                  Top claim ({result.topClaimScore ? `${(result.topClaimScore * 100).toFixed(0)}%` : '--'}): {result.topClaim}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-2 text-[10px] text-ink-faint">
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm"
                  style={{
                    backgroundColor: (TRUST_SIGNAL_COLORS[result.trustSignal] || '#6B7280') + '15',
                    color: TRUST_SIGNAL_COLORS[result.trustSignal] || '#6B7280',
                  }}
                >
                  {result.trustSignal.replace(/_/g, ' ')}
                </span>
                <span>{result.articleCount} outlets</span>
                <span>{result.claimCount} claims</span>

                {/* Bias spectrum mini */}
                <div className="flex gap-[1px]">
                  {result.biasTiers.map((tier) => (
                    <span
                      key={tier}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: BIAS_TIER_COLORS[tier] }}
                      title={tier}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* No results / triangulation offer */}
        {hasSearched && !isSearching && results.length === 0 && (
          <div className="text-center py-12 border border-border rounded-sm bg-surface">
            <p className="text-sm text-ink-muted mb-4">
              No existing stories match &ldquo;{initialQuery || query}&rdquo;
            </p>
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-sm text-sm font-medium opacity-60 cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5" />
              Triangulate This Topic (Premium)
            </button>
            <p className="text-[10px] text-ink-faint mt-2">
              On-demand triangulation searches all 55 sources for this topic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
