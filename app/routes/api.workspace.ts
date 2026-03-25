// ============================================================
// Triangulate — Workspace API (Chunk 6.3)
// POST: save workspace, GET: load workspaces
// ============================================================

import { prisma } from '~/lib/prisma';
import { getUser } from '~/lib/auth';

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  if (!user) {
    return Response.json({ workspaces: [] }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return Response.json({ workspaces });
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const user = await getUser(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name = 'Default', state } = body;

  if (!state) {
    return Response.json({ error: 'State is required' }, { status: 400 });
  }

  // Upsert workspace by userId + name
  const workspace = await prisma.workspace.upsert({
    where: {
      userId_name: { userId: user.id, name },
    },
    create: {
      userId: user.id,
      name,
      state,
      isDefault: name === 'Default',
    },
    update: {
      state,
    },
  });

  return Response.json({ workspace });
}
