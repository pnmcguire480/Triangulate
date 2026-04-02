// ============================================================
// Triangulate — Story Detail Route (Chunk 4.6 + 10 integration)
// Direct URL access renders AppShell with Wire + Lens loaded
// ============================================================

import { Link } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Globe, Newspaper, MessageSquareText } from 'lucide-react';
import type { Route } from './+types/story.$id';
import { prisma } from '~/lib/prisma.server';
import TrustSignalBadge from '~/components/story/TrustSignalBadge';
import LensPanel from '~/components/lens/LensPanel';
import type { TrustSignal } from '~/types';
import { generateConvergenceNarrative } from '~/lib/narratives';
import ExplainerPopover from '~/components/shared/ExplainerPopover';
import { getConvergenceExplainer } from '~/lib/explainers';

export async function loader({ params }: Route.LoaderArgs) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: {
      articles: {
        include: { source: true },
        orderBy: { publishedAt: 'desc' },
      },
      claims: {
        include: {
          sources: {
            include: {
              article: { include: { source: true } },
            },
          },
        },
        orderBy: { convergenceScore: 'desc' },
      },
      primaryDocs: true,
    },
  });

  if (!story) {
    throw new Response('Story not found', { status: 404 });
  }

  const biasTiers = [...new Set(story.articles.map((a) => a.source.biasTier))];
  const regions = [...new Set(story.articles.map((a) => a.source.region))];
  const reportingCount = story.articles.filter((a) => a.contentType === 'REPORTING').length;
  const commentaryCount = story.articles.filter((a) => a.contentType === 'COMMENTARY').length;
  const highestConvergence = story.claims.length > 0
    ? Math.max(...story.claims.map((c) => c.convergenceScore))
    : 0;

  // Generate convergence narrative
  const narrative = generateConvergenceNarrative({
    convergenceScore: highestConvergence,
    biasTiers,
    regions,
    claimCount: story.claims.length,
    sourceCount: story.articles.length,
    storyTitle: story.generatedTitle,
  });

  return {
    story: {
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      lastAnalyzedAt: story.lastAnalyzedAt?.toISOString() || null,
      articles: story.articles.map((a) => ({
        ...a,
        publishedAt: a.publishedAt.toISOString(),
        createdAt: a.createdAt.toISOString(),
        source: { ...a.source, createdAt: a.source.createdAt.toISOString() },
      })),
      claims: story.claims.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        sources: c.sources.map((cs) => ({
          ...cs,
          article: {
            ...cs.article,
            publishedAt: cs.article.publishedAt.toISOString(),
            createdAt: cs.article.createdAt.toISOString(),
            source: { ...cs.article.source, createdAt: cs.article.source.createdAt.toISOString() },
          },
        })),
      })),
      primaryDocs: story.primaryDocs.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
    },
    stats: {
      biasTiers,
      regions,
      reportingCount,
      commentaryCount,
      highestConvergence,
    },
    narrative,
  };
}

export default function StoryView({ loaderData }: Route.ComponentProps) {
  const { story, stats, narrative } = loaderData;
  const timeAgo = formatDistanceToNow(new Date(story.createdAt), { addSuffix: true });
  const convergenceExplainer = getConvergenceExplainer(stats.highestConvergence);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Feed &gt; Story
      </Link>

      {/* Story header */}
      <header className="mb-6">
        <div className="rule-line-double mb-4" />

        <div className="flex items-center justify-between mb-3">
          <TrustSignalBadge signal={story.trustSignal as TrustSignal} />
          <time className="dateline">{timeAgo}</time>
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-ink leading-tight mb-3">
          {story.generatedTitle}
        </h1>

        {/* Convergence narrative */}
        {narrative && (
          <p className="text-sm text-ink-muted italic leading-relaxed mb-3 bg-brand-green/[0.03] border-l-2 border-brand-green/20 pl-3 py-2">
            {narrative}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5" />
            {story.articles.length} outlets
          </span>
          {stats.reportingCount > 0 && (
            <span>
              {stats.reportingCount} reporting{stats.commentaryCount > 0 ? `, ${stats.commentaryCount} opinion` : ''}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="w-3.5 h-3.5" />
            {story.claims.length} claims extracted
          </span>
          {stats.regions.length > 1 && (
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {stats.regions.length} regions
            </span>
          )}
          {stats.highestConvergence > 0 && (
            <ExplainerPopover
              short={convergenceExplainer.short}
              long={convergenceExplainer.long}
              benchmark={convergenceExplainer.benchmark}
            >
              <span className="score">
                Peak convergence: {(stats.highestConvergence * 100).toFixed(0)}%
              </span>
            </ExplainerPopover>
          )}
        </div>

        <div className="rule-line mt-4" />
      </header>

      {/* Lens Panel — tabbed detail view */}
      <LensPanel story={story} />

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-ink-faint text-center">
          This analysis is generated automatically from {story.articles.length} news sources
          across {stats.biasTiers.length} political bias tiers
          {stats.regions.length > 1 ? ` and ${stats.regions.length} global regions` : ''}.
          Triangulate does not render editorial judgments.
        </p>
      </div>
    </div>
  );
}
