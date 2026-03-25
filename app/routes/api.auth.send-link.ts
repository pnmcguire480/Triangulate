// ============================================================
// Triangulate — Magic Link Auth (Chunk 8.1 upgrade)
// Sends branded email via Resend (or console in dev)
// ============================================================

import { prisma } from "~/lib/prisma";
import { generateMagicToken } from "~/lib/auth";
import { sendMagicLinkEmail } from "~/lib/email";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json();
  const email = body.email?.trim()?.toLowerCase();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }

  // Generate magic link token
  const { token, hash, expiresAt } = generateMagicToken();

  // Upsert user with magic token
  await prisma.user.upsert({
    where: { email },
    update: {
      magicToken: hash,
      magicTokenExpiresAt: expiresAt,
    },
    create: {
      email,
      magicToken: hash,
      magicTokenExpiresAt: expiresAt,
    },
  });

  // Build magic link URL
  const baseUrl = process.env.MAGIC_LINK_BASE_URL || "http://localhost:5173";
  const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  // Send branded email (falls back to console.log in dev)
  await sendMagicLinkEmail(email, magicLink);

  return Response.json({ success: true });
}
