// ============================================================
// Triangulate — GCI Computation (Chunk 5.7)
// Global Convergence Index: breadth (40%) + depth (35%) - contestation (25%)
// ============================================================

import { prisma } from "~/lib/prisma.server";

interface GCIComponents {
  score: number;
  breadth: number;
  depth: number;
  contestation: number;
  storyCount: number;
}

/**
 * Compute today's Global Convergence Index.
 *
 * Breadth (40%): What percentage of bias tiers are represented
 * in stories with convergence >= 0.4?
 *
 * Depth (35%): Average convergence score of all multi-source stories.
 *
 * Contestation penalty (25%): What fraction of multi-source stories
 * have claims with supports=false?
 */
export async function computeGCI(): Promise<GCIComponents> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get all analyzed stories from today
  const stories = await prisma.story.findMany({
    where: {
      lastAnalyzedAt: { not: null },
      createdAt: { gte: today },
    },
    include: {
      articles: {
        include: {
          source: { select: { biasTier: true } },
        },
      },
      claims: {
        select: { convergenceScore: true },
        where: { convergenceScore: { gt: 0 } },
      },
    },
  });

  const multiSource = stories.filter((s) => s.articles.length >= 2);

  if (multiSource.length === 0) {
    return { score: 0, breadth: 0, depth: 0, contestation: 0, storyCount: 0 };
  }

  // Breadth: unique bias tiers in converged stories (conv >= 0.4)
  const convergedStories = multiSource.filter((s) =>
    s.claims.some((c) => c.convergenceScore >= 0.4)
  );
  const uniqueTiers = new Set(
    convergedStories.flatMap((s) =>
      s.articles.map((a) => a.source.biasTier)
    )
  );
  const breadth = uniqueTiers.size / 7; // 7 total tiers

  // Depth: average max convergence per story
  const avgConvergence =
    multiSource.reduce((sum, s) => {
      const maxConv = s.claims.length > 0
        ? Math.max(...s.claims.map((c) => c.convergenceScore))
        : 0;
      return sum + maxConv;
    }, 0) / multiSource.length;
  const depth = avgConvergence;

  // Contestation: fraction with contradicting claims
  const contestedCount = multiSource.filter((s) =>
    s.claims.some((c) => c.convergenceScore < 0.3 && c.convergenceScore > 0)
  ).length;
  const contestation = contestedCount / multiSource.length;

  // Final score: breadth (40%) + depth (35%) - contestation (25%)
  const rawScore = breadth * 0.4 + depth * 0.35 - contestation * 0.25;
  const score = Math.max(0, Math.min(1, rawScore));

  return {
    score: Math.round(score * 1000) / 1000,
    breadth: Math.round(breadth * 1000) / 1000,
    depth: Math.round(depth * 1000) / 1000,
    contestation: Math.round(contestation * 1000) / 1000,
    storyCount: multiSource.length,
  };
}
