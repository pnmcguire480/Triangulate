// ============================================================
// Triangulate — Trends Page (Chunk 7.4)
// GCI over time, topic convergence, biggest movers
// ============================================================

import { useLoaderData } from 'react-router';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { prisma } from '~/lib/prisma.server';

export async function loader() {
  // GCI history (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const gciHistory = await prisma.dailyGCI.findMany({
    where: { date: { gte: thirtyDaysAgo } },
    orderBy: { date: 'asc' },
  });

  // Today's stories for topic breakdown
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayStories = await prisma.story.findMany({
    where: {
      lastAnalyzedAt: { not: null },
      createdAt: { gte: todayStart },
    },
    include: {
      claims: { select: { convergenceScore: true } },
      articles: {
        include: {
          source: { select: { biasTier: true, region: true } },
        },
      },
    },
    take: 100,
  });

  // Compute topic/region stats
  const regionStats: Record<string, { count: number; avgConvergence: number }> = {};
  for (const story of todayStories) {
    const regions = [...new Set(story.articles.map((a) => a.source.region))];
    const avgConv = story.claims.length > 0
      ? story.claims.reduce((s, c) => s + c.convergenceScore, 0) / story.claims.length
      : 0;

    for (const region of regions) {
      if (!regionStats[region]) regionStats[region] = { count: 0, avgConvergence: 0 };
      regionStats[region].count++;
      regionStats[region].avgConvergence += avgConv;
    }
  }

  // Normalize averages
  for (const [, stat] of Object.entries(regionStats)) {
    if (stat.count > 0) stat.avgConvergence /= stat.count;
  }

  return {
    gciHistory: gciHistory.map((g) => ({
      date: g.date.toISOString(),
      score: g.score,
      breadth: g.breadth,
      depth: g.depth,
      contestation: g.contestation,
      storyCount: g.storyCount,
    })),
    regionStats,
    storyCount: todayStories.length,
  };
}

export default function Trends() {
  const { gciHistory, regionStats, storyCount } = useLoaderData<typeof loader>();

  const latestGCI = gciHistory.length > 0 ? gciHistory[gciHistory.length - 1] : null;
  const prevGCI = gciHistory.length > 1 ? gciHistory[gciHistory.length - 2] : null;
  const gciDelta = latestGCI && prevGCI ? latestGCI.score - prevGCI.score : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-2xl font-bold text-ink mb-2">Convergence Trends</h1>
        <p className="text-sm text-ink-muted">
          How global news agreement is changing over time.
        </p>
      </div>

      {/* GCI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-3xl font-mono font-bold text-brand-green">
            {latestGCI ? (latestGCI.score * 100).toFixed(0) : '--'}
          </p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Today's GCI</p>
          {gciDelta !== 0 && (
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${gciDelta > 0 ? 'text-brand-green' : 'text-brand-red'}`}>
              {gciDelta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {(gciDelta * 100).toFixed(1)}
            </div>
          )}
        </div>
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-3xl font-mono font-bold text-ink">
            {latestGCI ? (latestGCI.breadth * 100).toFixed(0) + '%' : '--'}
          </p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Breadth</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-3xl font-mono font-bold text-ink">
            {latestGCI ? (latestGCI.depth * 100).toFixed(0) + '%' : '--'}
          </p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Depth</p>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <p className="text-3xl font-mono font-bold text-ink">{storyCount}</p>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider mt-1">Stories Today</p>
        </div>
      </div>

      {/* GCI Timeline */}
      <section className="mb-8">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
          GCI — Last 30 Days
        </h2>
        <div className="bg-surface border border-border rounded-sm p-4">
          {gciHistory.length > 0 ? (
            <div className="flex items-end gap-[2px] h-24">
              {gciHistory.map((point, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all cursor-pointer hover:opacity-80"
                  style={{
                    height: `${Math.max(point.score * 100, 4)}%`,
                    backgroundColor: point.score > 0.7 ? '#2D6A4F' : point.score > 0.3 ? '#E9C46A' : '#E76F51',
                  }}
                  title={`${new Date(point.date).toLocaleDateString()}: GCI ${(point.score * 100).toFixed(0)}`}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-ink-muted py-8">
              No GCI data yet. Run the analysis pipeline to start tracking.
            </p>
          )}
        </div>
      </section>

      {/* Regional convergence */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-3">
          Regional Convergence Today
        </h2>
        <div className="space-y-1.5">
          {Object.entries(regionStats)
            .sort(([, a], [, b]) => b.avgConvergence - a.avgConvergence)
            .map(([region, stat]) => (
              <div
                key={region}
                className="flex items-center gap-3 px-3 py-2.5 bg-surface border border-border rounded-sm"
              >
                <span className="text-sm font-medium text-ink w-32">{region}</span>
                <div className="flex-1 h-2 bg-ink/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${stat.avgConvergence * 100}%`,
                      backgroundColor: stat.avgConvergence > 0.5 ? '#2D6A4F' : '#E9C46A',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-ink-muted w-10 text-right">
                  {(stat.avgConvergence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-ink-faint w-16 text-right">
                  {stat.count} stories
                </span>
              </div>
            ))}

          {Object.keys(regionStats).length === 0 && (
            <p className="text-center text-sm text-ink-muted py-6">
              No stories analyzed yet today.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
