import { runEngine } from "~/lib/engine";
import { timingSafeEqual } from "crypto";

// The Triangulate Engine — entity-graph convergence clustering
// No AI. Pure math. O(n) performance.

export async function loader({ request }: { request: Request }) {
  if (!process.env.CRON_SECRET) {
    return Response.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  // Accept both x-cron-secret (manual) and Authorization: Bearer (Vercel crons)
  const secret = request.headers.get("x-cron-secret")
    || request.headers.get("authorization")?.replace("Bearer ", "")
    || "";
  const expected = process.env.CRON_SECRET || "";
  if (!secret || secret.length !== expected.length || !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runEngine();

  return Response.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
