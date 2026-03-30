import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: { params: { id: string } }) {
  const story = await prisma.story.findUnique({
    where: { id: params.id },
    include: {
      articles: {
        include: {
          source: true,
        },
        orderBy: { publishedAt: "desc" },
      },
      claims: {
        include: {
          sources: {
            include: {
              article: {
                include: { source: true },
              },
            },
          },
        },
        orderBy: { convergenceScore: "desc" },
      },
      primaryDocs: true,
    },
  });

  if (!story) {
    return Response.json({ error: "Story not found" }, { status: 404 });
  }

  return Response.json({ story });
}
