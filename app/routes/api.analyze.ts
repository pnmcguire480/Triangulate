import { prisma } from "~/lib/prisma.server";
import {
  extractClaims,
  deduplicateClaims,
  detectPrimaryDocs,
  classifyTopic,
} from "~/lib/claims";
import { calculateConvergenceScore, isContested } from "~/lib/convergence";
import { calculateTrustSignal } from "~/lib/signals";
import { computeSourceMonthlyStats } from "~/lib/source-stats";
import { timingSafeEqual } from "crypto";

const BATCH_SIZE = 20;
const MAX_FAILURES = 3;

export async function loader({ request }: { request: Request }) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  // Accept both x-cron-secret (manual) and Authorization: Bearer (Vercel crons)
  const cronSecret = request.headers.get("x-cron-secret")
    || request.headers.get("authorization")?.replace("Bearer ", "")
    || "";
  const expectedSecret = process.env.CRON_SECRET || "";
  if (!cronSecret || cronSecret.length !== expectedSecret.length || !timingSafeEqual(Buffer.from(cronSecret), Buffer.from(expectedSecret))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Grab unanalyzed stories, skip those that have failed too many times
    const allUnanalyzed = await prisma.story.findMany({
      where: {
        lastAnalyzedAt: null,
        failureCount: { lt: MAX_FAILURES },
      },
      include: {
        articles: {
          include: { source: true },
        },
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

        // Clear old claims if this is a re-analysis (story had articles added)
        const existingClaims = await prisma.claim.count({ where: { storyId: story.id } });
        if (existingClaims > 0) {
          await prisma.claimSource.deleteMany({
            where: { claim: { storyId: story.id } },
          });
          await prisma.claim.deleteMany({ where: { storyId: story.id } });
          console.log(`[analyze] Cleared ${existingClaims} old claims for re-analysis`);
        }

        const articlesForClaims = story.articles.map((a) => ({
          id: a.id,
          title: a.title,
          sourceId: a.sourceId,
          contentSnippet: (a as any).contentSnippet as string | null,
        }));

        // Step 1: Extract claims (now uses contentSnippet)
        const rawClaims = await extractClaims(articlesForClaims);
        console.log(`[analyze] Extracted ${rawClaims.length} claims from "${story.generatedTitle.slice(0, 50)}"`);
        if (rawClaims.length === 0) {
          await prisma.story.update({
            where: { id: story.id },
            data: { lastAnalyzedAt: new Date() },
          });
          continue;
        }

        // Step 2: Deduplicate semantically (skips AI for small sets)
        const deduped = await deduplicateClaims(rawClaims);

        // Step 3: Score convergence with wire service awareness
        const articleMeta = new Map(
          story.articles.map((a) => [
            a.id,
            {
              biasTier: a.source.biasTier,
              region: a.source.region,
              isWireService: (a.source as any).isWireService as boolean,
            },
          ])
        );

        // Detect wire syndication: articles from wire services should not
        // count as independent sources for convergence scoring
        const wireArticleIds = new Set(
          story.articles
            .filter((a) => (a.source as any).isWireService)
            .map((a) => a.id)
        );

        for (const claim of deduped) {
          // Filter out wire service duplicates from convergence calculation
          const independentSources = claim.sources.filter(
            (s) => !wireArticleIds.has(s.articleId)
          );

          // Use independent sources for scoring, but keep all for attribution
          const tiers = independentSources
            .map((s) => articleMeta.get(s.articleId)?.biasTier)
            .filter(Boolean) as string[];

          const regions = independentSources
            .map((s) => articleMeta.get(s.articleId)?.region)
            .filter(Boolean) as string[];

          const supportFlags = claim.sources.map((s) => s.supports);
          const contested = isContested(supportFlags);

          // Contested claims get a weighted score
          const supportingCount = supportFlags.filter((s) => s).length;
          const totalCount = supportFlags.length;
          const rawScore = calculateConvergenceScore(tiers, regions);
          const convergenceScore = contested
            ? Math.round(rawScore * (supportingCount / totalCount) * 100) / 100
            : rawScore;

          // Determine lifecycle state
          const sourceCount = independentSources.length;
          const lifecycle = contested
            ? 'CONTESTED'
            : sourceCount >= 10
              ? 'ESTABLISHED'
              : sourceCount >= 3
                ? 'DEVELOPING'
                : 'EMERGING';

          const createdClaim = await prisma.claim.create({
            data: {
              storyId: story.id,
              claimText: claim.claimText,
              claimType: claim.claimType,
              convergenceScore,
              lifecycle,
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

        // Step 4: Detect primary docs (conditional — only when keywords present)
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

        // Step 5: Classify topic
        const topic = await classifyTopic(articlesForClaims);

        // Step 6: Update trust signal
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
            ...(topic && { topic: topic as any }),
          },
        });

        storiesAnalyzed++;
      } catch (err) {
        console.error(`Failed to analyze story ${story.id}:`, err);
        // Increment failure count instead of infinite retry
        await prisma.story.update({
          where: { id: story.id },
          data: { failureCount: { increment: 1 } },
        });
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
