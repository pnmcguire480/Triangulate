import type { ContentType } from "@prisma/client";
import { prisma } from "~/lib/prisma";
import { fetchFeed } from "~/lib/rss";
import { timingSafeEqual } from "crypto";

const COMMENTARY_PATH_RE =
  /\/(opinion|editorial|commentary|column|analysis)(\/|$)/i;

function classifyUrl(url: string): ContentType {
  try {
    const { pathname } = new URL(url);
    return COMMENTARY_PATH_RE.test(pathname) ? "COMMENTARY" : "REPORTING";
  } catch {
    return "UNKNOWN";
  }
}

export async function loader({ request }: { request: Request }) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const secret = request.headers.get("x-cron-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  if (!secret || secret.length !== expected.length || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await prisma.source.findMany({ where: { isActive: true } });

  let articlesAdded = 0;
  const errors: string[] = [];

  // Parallelize in batches of 10 to avoid connection exhaustion
  const CONCURRENCY = 10;
  for (let i = 0; i < sources.length; i += CONCURRENCY) {
    const batch = sources.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (source) => {
        const items = await fetchFeed(source.rssFeedUrl);
        const rows = items
          .filter((item) => item.link)
          .map((item) => ({
            sourceId: source.id,
            title: item.title,
            url: item.link,
            publishedAt: new Date(item.pubDate),
            contentType: classifyUrl(item.link),
          }));
        if (rows.length === 0) return 0;
        const result = await prisma.article.createMany({
          data: rows,
          skipDuplicates: true,
        });
        return result.count;
      })
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled") {
        articlesAdded += r.value;
      } else {
        const message = r.reason instanceof Error ? r.reason.message : String(r.reason);
        errors.push(`${batch[j].name}: ${message}`);
      }
    }
  }

  return Response.json({
    articlesAdded,
    errors,
    totalSources: sources.length,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
