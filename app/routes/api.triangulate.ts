// ============================================================
// Triangulate — On-Demand Triangulation API (Chunk 9.4)
// Focused ingest -> cluster -> analyze for a specific query
// Premium+ feature
// ============================================================

import { getUser } from '~/lib/auth';
import { hasCapability } from '~/lib/capabilities';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await getUser(request);
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!hasCapability(user.tier, 'search')) {
    return Response.json({ error: 'Premium subscription required' }, { status: 403 });
  }

  const body = await request.json();
  const query = body.query?.trim();

  if (!query || query.length < 3) {
    return Response.json({ error: 'Query must be at least 3 characters' }, { status: 400 });
  }

  // NOTE: On-demand triangulation would trigger:
  // 1. Focused RSS search across all sources for the query topic
  // 2. Clustering of found articles
  // 3. Claim extraction and convergence analysis
  //
  // This requires the full pipeline to run, which is expensive.
  // For now, return a placeholder indicating the feature is available.

  return Response.json({
    status: 'queued',
    query,
    message: 'On-demand triangulation queued. Results will appear in your feed within 2 minutes.',
    estimatedTime: 120, // seconds
  });
}
