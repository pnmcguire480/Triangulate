import { createCookieSessionStorage, redirect } from "react-router";
import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { prisma } from "~/lib/prisma.server";

// ============================================================
// Session Storage
// ============================================================

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__triangulate_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [(() => {
      const secret = process.env.SESSION_SECRET;
      if (!secret) throw new Error("SESSION_SECRET environment variable is required");
      return secret;
    })()],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get("userId") || null;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/auth/signin");
  }
  return user;
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

// ============================================================
// Magic Link Token
// ============================================================

const MAGIC_LINK_EXPIRY_MINUTES = 15;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateMagicToken(): { token: string; hash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  const hash = hashToken(token);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);
  return { token, hash, expiresAt };
}

export function verifyMagicToken(token: string, storedHash: string, expiresAt: Date): boolean {
  if (new Date() > expiresAt) return false;
  const computed = Buffer.from(hashToken(token));
  const stored = Buffer.from(storedHash);
  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

// ============================================================
// Founder Detection
// ============================================================

export function isFounderPhase(): boolean {
  return process.env.IS_FOUNDER_PHASE === "true";
}
