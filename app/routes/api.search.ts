import { prisma } from "~/lib/prisma.server";
import { Prisma } from "@prisma/client";
import { checkRateLimit, getClientIP } from "~/lib/rate-limit";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  // Rate limit: 30 per IP per minute
  const ip = getClientIP(request);
  const limit = checkRateLimit(`search:ip:${ip}`, 30, 60 * 1000);
  if (limit.limited) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const query = body.query?.trim()?.slice(0, 500); // Cap length to prevent abuse

  if (!query || query.length < 3) {
    return Response.json(
      { error: "Search query must be at least 3 characters" },
      { status: 400 }
    );
  }

  // Full-text search using websearch_to_tsquery (safely handles user input)
  let storyIds: string[] = [];

  try {
    const ftsResults = await prisma.$queryRaw<{ id: string; rank: number }[]>(
      Prisma.sql`SELECT s."id", ts_rank(s."search_vector", websearch_to_tsquery('english', ${query})) AS rank
       FROM "stories" s
       WHERE s."lastAnalyzedAt" IS NOT NULL
         AND (
           s."search_vector" @@ websearch_to_tsquery('english', ${query})
           OR EXISTS (
             SELECT 1 FROM "articles" a
             WHERE a."storyId" = s."id"
               AND a."search_vector" @@ websearch_to_tsquery('english', ${query})
           )
         )
       ORDER BY rank DESC
       LIMIT 15`
    );
    storyIds = ftsResults.map((r) => r.id);
  } catch {
    // Fallback: tsvector columns may not exist yet — use ILIKE
    const fallbackResults = await prisma.story.findMany({
      where: {
        AND: [
          { lastAnalyzedAt: { not: null } },
          {
            OR: [
              { generatedTitle: { contains: query, mode: "insensitive" } },
              {
                articles: {
                  some: {
                    title: { contains: query, mode: "insensitive" },
                  },
                },
              },
            ],
          },
        ],
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    storyIds = fallbackResults.map((r) => r.id);
  }

  if (storyIds.length === 0) {
    return Response.json({ query, resultCount: 0, results: [] });
  }

  // Fetch full story data for matched IDs
  const stories = await prisma.story.findMany({
    where: { id: { in: storyIds } },
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
  });

  // Preserve ranking order from FTS
  const storyMap = new Map(stories.map((s) => [s.id, s]));
  const orderedStories = storyIds
    .map((id) => storyMap.get(id))
    .filter(Boolean) as typeof stories;

  const results = orderedStories.map((story) => {
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
    };
  });

  return Response.json({
    query,
    resultCount: results.length,
    results,
  });
}
