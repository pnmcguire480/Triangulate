// ============================================================
// Triangulate — Sources Directory Page (Chunk 7.1)
// Grid of all 55+ outlets, grouped by region then bias tier
// ============================================================

import { useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import { Database, Search } from 'lucide-react';
import { prisma } from '~/lib/prisma.server';

export async function loader() {
  const sources = await prisma.source.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: [{ region: 'asc' }, { biasTier: 'asc' }, { name: 'asc' }],
  });

  return {
    sources: sources.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      biasTier: s.biasTier,
      biasCategory: s.biasCategory,
      region: s.region,
      articleCount: s._count.articles,
    })),
  };
}

const BIAS_TIER_COLORS: Record<string, string> = {
  FAR_LEFT: '#1E40AF',
  LEFT: '#3B82F6',
  CENTER_LEFT: '#60A5FA',
  CENTER: '#6B7280',
  CENTER_RIGHT: '#F97316',
  RIGHT: '#EF4444',
  FAR_RIGHT: '#991B1B',
};

const BIAS_TIER_LABELS: Record<string, string> = {
  FAR_LEFT: 'Far Left',
  LEFT: 'Left',
  CENTER_LEFT: 'Center-Left',
  CENTER: 'Center',
  CENTER_RIGHT: 'Center-Right',
  RIGHT: 'Right',
  FAR_RIGHT: 'Far Right',
};

const REGION_LABELS: Record<string, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  EUROPE: 'Europe',
  MIDDLE_EAST: 'Middle East',
  ASIA_PACIFIC: 'Asia-Pacific',
  CANADA: 'Canada',
  LATIN_AMERICA: 'Latin America',
  AFRICA: 'Africa',
  OCEANIA: 'Oceania',
  GLOBAL: 'Global Wire Services',
};

export default function Sources() {
  const { sources } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? sources.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sources;

  // Group by region
  const byRegion = filtered.reduce<Record<string, typeof filtered>>((acc, source) => {
    (acc[source.region] ||= []).push(source);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-ink-muted" aria-hidden="true" />
          <h1 className="font-headline text-2xl font-bold text-ink">Source Directory</h1>
        </div>
        <p className="text-sm text-ink-muted" aria-live="polite">
          {sources.length} outlets across the political spectrum from {Object.keys(byRegion).length} global regions.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sources..."
          className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-border bg-surface text-sm text-ink placeholder:text-ink-faint focus:border-brand-green focus:outline-none transition-colors"
          aria-label="Search sources"
        />
      </div>

      {/* Source grid grouped by region */}
      <div className="space-y-8">
        {Object.entries(byRegion).map(([region, regionSources]) => (
          <section key={region}>
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--color-region-${region.toLowerCase()}, #6B7280)` }} />
              {REGION_LABELS[region] || region} ({regionSources.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {regionSources.map((source) => (
                <Link
                  key={source.id}
                  to={`/sources/${source.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-border bg-surface hover:border-border-strong hover:bg-ink/[0.02] transition-colors group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BIAS_TIER_COLORS[source.biasTier] || '#6B7280' }}
                    title={BIAS_TIER_LABELS[source.biasTier]}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate group-hover:text-brand-green transition-colors">
                      {source.name}
                    </p>
                    <p className="text-[10px] text-ink-faint">
                      {BIAS_TIER_LABELS[source.biasTier]} &middot; {source.articleCount} articles
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-ink-muted py-12" aria-live="polite">
          No sources match &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  );
}
