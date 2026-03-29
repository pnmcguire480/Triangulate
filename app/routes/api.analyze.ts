import { prisma } from "~/lib/prisma";
import {
  extractClaims,
  deduplicateClaims,
  detectPrimaryDocs,
} from "~/lib/claims";
import { calculateConvergenceScore, isContested } from "~/lib/convergence";
import { calculateTrustSignal } from "~/lib/signals";
import { computeSourceMonthlyStats } from "~/lib/source-stats";
import { timingSafeEqual } from "crypto";

const BATCH_SIZE = 20;

export async function loader({ request }: { request: Request }) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const cronSecret = request.headers.get("x-cron-secret") || "";
  const expectedSecret = process.env.CRON_SECRET || "";
  if (!cronSecret || cronSecret.length !== expectedSecret.length || !timingSafeEqual(Buffer.from(cronSecret), Buffer.from(expectedSecret))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Grab unanalyzed stories, prioritize multi-source
    const allUnanalyzed = await prisma.story.findMany({
      where: { lastAnalyzedAt: null },
      include: {
        articles: { include: { source: true } },
        _count: { select: { articles: true } },
      },
      take: 200,
      orderBy: { createdAt: "desc" },
    });

    // Sort: most articles first so multi-source gets processed first
    allUnanalyzed.sort((a, b) => b._count.articles - a._count.articles);

    const multiSourceStories = allUnanalyzed
      .filter((s) => s._count.articles >= 2)
      .slice(0, BATCH_SIZE);

    const singleBatch = allUnanalyzed
      .filter((s) => s._count.articles < 2)
      .slice(0, BATCH_SIZE);

    const stories = [...multiSourceStories, ...singleBatch];

    console.log(`[analyze] Found ${multiSourceStories.length} multi-source, ${singleBatch.length} single-source`);

    let storiesAnalyzed = 0;
    let claimsCreated = 0;
    let primaryDocsCreated = 0;

    console.log(`[analyze] Processing ${multiSourceStories.length} multi-source stories`);
    for (const story of multiSourceStories) {
      try {
        console.log(`[analyze] Analyzing story: ${story.generatedTitle.slice(0, 60)} (${story.articles.length} articles)`);
        const articlesForClaims = story.articles.map((a) => ({
          id: a.id,
          title: a.title,
          sourceId: a.sourceId,
        }));

        // Step 1: Extract claims
        const rawClaims = await extractClaims(articlesForClaims);
        console.log(`[analyze] Extracted ${rawClaims.length} claims from "${story.generatedTitle.slice(0, 50)}"`);
        if (rawClaims.length === 0) {
          await prisma.story.update({
            where: { id: story.id },
            data: { lastAnalyzedAt: new Date() },
          });
          continue;
        }

        // Step 2: Deduplicate semantically
        const deduped = await deduplicateClaims(rawClaims);

        // Step 3: Score convergence
        const articleMeta = new Map(
          story.articles.map((a) => [
            a.id,
            { biasTier: a.source.biasTier, region: a.source.region },
          ])
        );

        for (const claim of deduped) {
          const tiers = claim.sources
            .map((s) => articleMeta.get(s.articleId)?.biasTier)
            .filter(Boolean) as string[];

          const regions = claim.sources
            .map((s) => articleMeta.get(s.articleId)?.region)
            .filter(Boolean) as string[];

          const supportFlags = claim.sources.map((s) => s.supports);
          const contested = isContested(supportFlags);

          // Contested claims get a weighted score, not a binary 0
          const supportingCount = supportFlags.filter((s) => s).length;
          const totalCount = supportFlags.length;
          const rawScore = calculateConvergenceScore(tiers, regions);
          const convergenceScore = contested
            ? Math.round(rawScore * (supportingCount / totalCount) * 100) / 100
            : rawScore;

          const createdClaim = await prisma.claim.create({
            data: {
              storyId: story.id,
              claimText: claim.claimText,
              claimType: claim.claimType,
              convergenceScore,
              sources: {
                create: claim.sources.map((s) => ({
                  articleId: s.articleId,
                  quote: s.quote || null,
                  supports: s.supports,
                })),
              },
            },
          });

          if (createdClaim) claimsCreated++;
        }

        // Step 4: Detect primary docs
        const docs = await detectPrimaryDocs(articlesForClaims);
        for (const doc of docs) {
          if (doc.title) {
            await prisma.primaryDoc.create({
              data: {
                storyId: story.id,
                docType: doc.docType,
                url: doc.url || "",
                title: doc.title,
              },
            });
            primaryDocsCreated++;
          }
        }

        // Step 5: Update trust signal
        const storyClaims = await prisma.claim.findMany({
          where: { storyId: story.id },
          select: { convergenceScore: true },
        });

        const storyDocs = await prisma.primaryDoc.findMany({
          where: { storyId: story.id },
        });

        const highestScore = Math.max(
          ...storyClaims.map((c) => c.convergenceScore),
          0
        );

        const hasInstitutionalAction = storyDocs.some((d) =>
          ["COURT_FILING", "LEGISLATION", "OFFICIAL_STATEMENT"].includes(d.docType)
        );

        const trustSignal = calculateTrustSignal(
          highestScore,
          storyDocs.length > 0,
          hasInstitutionalAction,
          story.articles.length
        );

        await prisma.story.update({
          where: { id: story.id },
          data: {
            trustSignal,
            lastAnalyzedAt: new Date(),
          },
        });

        storiesAnalyzed++;
      } catch (err) {
        console.error(`Failed to analyze story ${story.id}:`, err);
        // Do NOT set lastAnalyzedAt — leave null so story retries next cycle
      }
    }

    const singleSourceStories = stories.filter((s) => s.articles.length < 2);
    if (singleSourceStories.length > 0) {
      await prisma.story.updateMany({
        where: { id: { in: singleSourceStories.map((s) => s.id) } },
        data: { lastAnalyzedAt: new Date() },
      });
    }

    // Compute source monthly stats after analysis
    let sourceStatsUpdated = 0;
    try {
      sourceStatsUpdated = await computeSourceMonthlyStats();
    } catch (err) {
      console.error("Source stats computation failed:", err);
    }

    return Response.json({
      storiesAnalyzed,
      singleSourceSkipped: singleSourceStories.length,
      claimsCreated,
      primaryDocsCreated,
      sourceStatsUpdated,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Analysis pipeline failed:", err);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
