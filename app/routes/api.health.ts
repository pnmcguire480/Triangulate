// ============================================================
// Triangulate — Pipeline Health Monitoring (Chunk 11.5)
// Returns last ingest time, active source count, pipeline status
// ============================================================

import { prisma } from '~/lib/prisma.server';

export async function loader() {
  const [
    sourceCount,
    articleCount,
    storyCount,
    latestArticle,
    latestStory,
    latestGCI,
  ] = await Promise.all([
    prisma.source.count({ where: { isActive: true } }),
    prisma.article.count(),
    prisma.story.count({ where: { lastAnalyzedAt: { not: null } } }),
    prisma.article.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    prisma.story.findFirst({ orderBy: { lastAnalyzedAt: 'desc' }, select: { lastAnalyzedAt: true } }),
    prisma.dailyGCI.findFirst({ orderBy: { date: 'desc' }, select: { date: true, score: true } }),
  ]);

  const now = new Date();
  const lastIngest = latestArticle?.createdAt;
  const lastAnalysis = latestStory?.lastAnalyzedAt;

  // Pipeline status: green if last ingest within 2 hours, yellow if within 6, red otherwise
  let pipelineStatus: 'green' | 'yellow' | 'red' = 'red';
  if (lastIngest) {
    const ageMs = now.getTime() - lastIngest.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    if (ageHours < 2) pipelineStatus = 'green';
    else if (ageHours < 6) pipelineStatus = 'yellow';
  }

  return Response.json({
    status: pipelineStatus,
    sources: {
      active: sourceCount,
      total: sourceCount, // all sources are either active or filtered out
    },
    articles: {
      total: articleCount,
      lastIngest: lastIngest?.toISOString() || null,
      lastIngestAgo: lastIngest
        ? `${Math.round((now.getTime() - lastIngest.getTime()) / 60000)}m ago`
        : 'never',
    },
    stories: {
      analyzed: storyCount,
      lastAnalysis: lastAnalysis?.toISOString() || null,
    },
    gci: {
      latest: latestGCI?.score ?? null,
      date: latestGCI?.date?.toISOString() || null,
    },
    timestamp: now.toISOString(),
  });
}
