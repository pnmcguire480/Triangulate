// ============================================================
// Triangulate — Source Monthly Stats Computation (Chunk 7.3)
// Per-source claims totals and confirmation rates
// ============================================================

import { prisma } from './prisma';

/**
 * Compute monthly stats for all sources.
 * Called after each analysis pipeline run.
 */
export async function computeSourceMonthlyStats(): Promise<number> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all sources with their claim participation this month
  const sources = await prisma.source.findMany({
    where: { isActive: true },
    include: {
      articles: {
        where: {
          createdAt: { gte: monthStart },
        },
        include: {
          claimSources: {
            select: { supports: true },
          },
        },
      },
    },
  });

  let updated = 0;

  for (const source of sources) {
    const allClaimSources = source.articles.flatMap((a) => a.claimSources);
    const claimsTotal = allClaimSources.length;
    const claimsConfirmed = allClaimSources.filter((cs) => cs.supports).length;
    const confirmationRate = claimsTotal > 0 ? claimsConfirmed / claimsTotal : 0;

    if (claimsTotal > 0) {
      await prisma.sourceMonthlyStats.upsert({
        where: {
          sourceId_month: { sourceId: source.id, month: monthStart },
        },
        create: {
          sourceId: source.id,
          month: monthStart,
          claimsTotal,
          claimsConfirmed,
          confirmationRate,
        },
        update: {
          claimsTotal,
          claimsConfirmed,
          confirmationRate,
        },
      });
      updated++;
    }
  }

  return updated;
}
