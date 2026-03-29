// ============================================================
// Triangulate — GCI API Endpoint (Chunk 5.7)
// Computes daily GCI, writes to DailyGCI table
// ============================================================

import type { Route } from "./+types/api.gci";
import { prisma } from "~/lib/prisma";
import { computeGCI } from "~/lib/gci";
import { timingSafeEqual } from "crypto";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Auth guard — same pattern as ingest/cluster/analyze
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const secret = request.headers.get("x-cron-secret") || "";
  const expected = process.env.CRON_SECRET || "";
  if (!secret || secret.length !== expected.length || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gci = await computeGCI();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Upsert today's GCI
  await prisma.dailyGCI.upsert({
    where: { date: today },
    update: {
      score: gci.score,
      breadth: gci.breadth,
      depth: gci.depth,
      contestation: gci.contestation,
      storyCount: gci.storyCount,
    },
    create: {
      date: today,
      score: gci.score,
      breadth: gci.breadth,
      depth: gci.depth,
      contestation: gci.contestation,
      storyCount: gci.storyCount,
    },
  });

  return Response.json({ success: true, gci });
}

export async function loader() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [todayGCI, yesterdayGCI] = await Promise.all([
    prisma.dailyGCI.findUnique({ where: { date: today } }),
    prisma.dailyGCI.findUnique({ where: { date: yesterday } }),
  ]);

  const delta = todayGCI && yesterdayGCI
    ? todayGCI.score - yesterdayGCI.score
    : undefined;

  return Response.json({
    score: todayGCI?.score ?? null,
    delta,
    breadth: todayGCI?.breadth,
    depth: todayGCI?.depth,
    contestation: todayGCI?.contestation,
    storyCount: todayGCI?.storyCount,
  });
}
