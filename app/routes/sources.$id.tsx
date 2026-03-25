// ============================================================
// Triangulate — Source Detail Page (Chunk 7.2)
// Source profile with convergence participation and recent stories
// ============================================================

import { Link, useLoaderData } from 'react-router';
import { ArrowLeft, ExternalLink, Rss } from 'lucide-react';
import { prisma } from '~/lib/prisma';

export async function loader({ params }: { params: { id: string } }) {
  const source = await prisma.source.findUnique({
    where: { id: params.id },
    include: {
      articles: {
        include: {
          story: {
            select: {
              id: true,
              generatedTitle: true,
              trustSignal: true,
              createdAt: true,
            },
          },
          claimSources: {
            select: { supports: true },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 50,
      },
      monthlyStats: {
        orderBy: { month: 'desc' },
        take: 12,
      },
    },
  });

  if (!source) {
    throw new Response('Source not found', { status: 404 });
  }

  // Compute convergence participation
  const articlesWithClaims = source.articles.filter((a) => a.claimSources.length > 0);
  const confirmedClaims = articlesWithClaims.flatMap((a) => a.claimSources).filter((cs) => cs.supports);
  const participationRate = articlesWithClaims.length > 0
    ? confirmedClaims.length / articlesWithClaims.flatMap((a) => a.claimSources).length
    : 0;

  // Recent stories involving this source
  const storiesMap = new Map<string, { id: string; title: string; trustSignal: string; date: string }>();
  source.articles.forEach((a) => {
    if (a.story && !storiesMap.has(a.story.id)) {
      storiesMap.set(a.story.id, {
        id: a.story.id,
        title: a.story.generatedTitle,
        trustSignal: a.story.trustSignal,
        date: a.story.createdAt.toISOString(),
      });
    }
  });

  return {
    source: {
      id: source.id,
      name: source.name,
      url: source.url,
      rssFeedUrl: source.rssFeedUrl,
      biasTier: source.biasTier,
      biasCategory: source.biasCategory,
      region: source.region,
      isActive: source.isActive,
      articleCount: source.articles.length,
      participationRate: Math.round(participationRate * 100),
    },
    recentStories: Array.from(storiesMap.values()).slice(0, 15),
    monthlyStats: source.monthlyStats.map((s) => ({
      month: s.month.toISOString(),
      claimsTotal: s.claimsTotal,
      claimsConfirmed: s.claimsConfirmed,
      confirmationRate: Math.round(s.confirmationRate * 100),
    })),
  };
}

const BIAS_TIER_COLORS: Record<string, string> = {
  FAR_LEFT: '#1E40AF', LEFT: '#3B82F6', CENTER_LEFT: '#60A5FA',
  CENTER: '#6B7280', CENTER_RIGHT: '#F97316', RIGHT: '#EF4444', FAR_RIGHT: '#991B1B',
};

const BIAS_TIER_LABELS: Record<string, string> = {
  FAR_LEFT: 'Far Left', LEFT: 'Left', CENTER_LEFT: 'Center-Left',
  CENTER: 'Center', CENTER_RIGHT: 'Center-Right', RIGHT: 'Right', FAR_RIGHT: 'Far Right',
};

const TRUST_SIGNAL_COLORS: Record<string, string> = {
  SINGLE_SOURCE: '#E76F51', CONTESTED: '#E9C46A', CONVERGED: '#2D6A4F',
  SOURCE_BACKED: '#264653', INSTITUTIONALLY_VALIDATED: '#6C63FF',
};

export default function SourceDetail() {
  const { source, recentStories, monthlyStats } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back nav */}
      <Link
        to="/sources"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sources
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="rule-line-double mb-4" />
        <div className="flex items-center gap-3 mb-3">
          <span
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: BIAS_TIER_COLORS[source.biasTier] }}
          />
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-ink">
            {source.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-border">
            {BIAS_TIER_LABELS[source.biasTier]}
          </span>
          <span>{source.region}</span>
          <span>{source.articleCount} articles indexed</span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-green hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Visit site
          </a>
          <span className="inline-flex items-center gap-1">
            <Rss className="w-3 h-3" />
            {source.isActive ? 'Active feed' : 'Inactive'}
          </span>
        </div>
        <div className="rule-line mt-4" />
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-mono font-bold text-ink">{source.articleCount}</p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Articles</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-mono font-bold text-brand-green">{source.participationRate}%</p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Confirmation Rate</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-mono font-bold text-ink">{recentStories.length}</p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Recent Stories</p>
        </div>
      </div>

      {/* Monthly trend */}
      {monthlyStats.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
            Monthly Confirmation Trend
          </h2>
          <div className="flex items-end gap-1 h-20 bg-surface border border-border rounded-sm p-3">
            {monthlyStats.slice().reverse().map((stat, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(stat.confirmationRate, 4)}%`,
                  backgroundColor: stat.confirmationRate > 50 ? '#2D6A4F' : stat.confirmationRate > 25 ? '#E9C46A' : '#E76F51',
                  opacity: 0.7 + (i / monthlyStats.length) * 0.3,
                }}
                title={`${new Date(stat.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: ${stat.confirmationRate}%`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent stories */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
          Recent Stories
        </h2>
        <div className="space-y-1.5">
          {recentStories.map((story) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm border border-border bg-surface hover:border-border-strong transition-colors group"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: TRUST_SIGNAL_COLORS[story.trustSignal] || '#6B7280' }}
              />
              <span className="flex-1 text-sm text-ink truncate group-hover:text-brand-green transition-colors">
                {story.title}
              </span>
              <span className="text-[10px] text-ink-faint shrink-0">
                {new Date(story.date).toLocaleDateString()}
              </span>
            </Link>
          ))}

          {recentStories.length === 0 && (
            <p className="text-center text-sm text-ink-muted py-6">
              No stories yet for this source.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
