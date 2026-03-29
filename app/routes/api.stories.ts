import { prisma } from "~/lib/prisma";
import { compareStories, type ComparisonResult } from "~/lib/comparisons";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const stories = await prisma.story.findMany({
    where: {
      lastAnalyzedAt: { not: null },
    },
    include: {
      articles: {
        include: {
          source: {
            select: {
              name: true,
              biasCategory: true,
              biasTier: true,
              region: true,
            },
          },
        },
      },
      claims: {
        select: {
          convergenceScore: true,
          claimType: true,
        },
      },
      _count: {
        select: {
          articles: true,
          claims: true,
          primaryDocs: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const storyCards = stories.map((story) => {
    const highestConvergence = story.claims.length > 0
      ? Math.max(...story.claims.map((c) => c.convergenceScore))
      : 0;

    const biasTiers = [...new Set(story.articles.map((a) => a.source.biasTier))];
    const regions = [...new Set(story.articles.map((a) => a.source.region))];

    const reportingCount = story.articles.filter(
      (a) => a.contentType === "REPORTING"
    ).length;
    const commentaryCount = story.articles.filter(
      (a) => a.contentType === "COMMENTARY"
    ).length;

    return {
      id: story.id,
      title: story.generatedTitle,
      trustSignal: story.trustSignal,
      convergenceScore: highestConvergence,
      articleCount: story._count.articles,
      claimCount: story._count.claims,
      primaryDocCount: story._count.primaryDocs,
      biasTiers,
      regions,
      reportingCount,
      commentaryCount,
      createdAt: story.createdAt.toISOString(),
      convergenceDelta: null as number | null,
      convergenceDirection: null as 'rising' | 'falling' | 'stable' | null,
    };
  });

  // Compute convergence deltas for stories that have a previous version
  // (stories with same topic that were analyzed before)
  if (storyCards.length >= 2) {
    for (let i = 0; i < storyCards.length; i++) {
      // Look for an older story with similar keywords to compute delta
      for (let j = i + 1; j < storyCards.length; j++) {
        const titleWords = (t: string) => new Set(t.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const wordsA = titleWords(storyCards[i].title);
        const wordsB = titleWords(storyCards[j].title);
        let overlap = 0;
        for (const w of wordsA) { if (wordsB.has(w)) overlap++; }
        const similarity = wordsA.size > 0 ? overlap / wordsA.size : 0;

        if (similarity >= 0.5) {
          const result = compareStories(
            storyCards[i].title,
            { id: storyCards[j].id, title: storyCards[j].title, convergenceScore: storyCards[j].convergenceScore, claimCount: storyCards[j].claimCount, sourceCount: storyCards[j].articleCount, date: storyCards[j].createdAt },
            { id: storyCards[i].id, title: storyCards[i].title, convergenceScore: storyCards[i].convergenceScore, claimCount: storyCards[i].claimCount, sourceCount: storyCards[i].articleCount, date: storyCards[i].createdAt }
          );
          storyCards[i].convergenceDelta = result.deltaPercent;
          storyCards[i].convergenceDirection = result.direction;
          break;
        }
      }
    }
  }

  return Response.json(storyCards);
}
