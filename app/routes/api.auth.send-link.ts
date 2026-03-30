// ============================================================
// Triangulate — Magic Link Auth (Chunk 8.1 upgrade)
// Sends branded email via Resend (or console in dev)
// ============================================================

import { prisma } from "~/lib/prisma.server";
import { generateMagicToken } from '~/lib/auth.server';
import { sendMagicLinkEmail } from "~/lib/email";
import { checkRateLimit, getClientIP } from "~/lib/rate-limit";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const email = (body.email as string)?.trim()?.toLowerCase();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }

  // Rate limit: 3 per email per 15 min, 10 per IP per hour
  const ip = getClientIP(request);
  const emailLimit = checkRateLimit(`auth:email:${email}`, 3, 15 * 60 * 1000);
  if (emailLimit.limited) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  const ipLimit = checkRateLimit(`auth:ip:${ip}`, 10, 60 * 60 * 1000);
  if (ipLimit.limited) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
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
