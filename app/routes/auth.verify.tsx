import type { Route } from "./+types/auth.verify";
import { prisma } from "~/lib/prisma";
import { verifyMagicToken, createUserSession, isFounderPhase } from "~/lib/auth";
import { useEffect, useRef } from "react";
import { useFetcher, useSearchParams } from "react-router";

// Loader renders the verification page — does NOT consume the token.
// This prevents email scanners and link prefetchers from consuming the magic link.
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email")?.toLowerCase();

  if (!token || !email) {
    return { error: "Invalid magic link. Please request a new one." };
  }

  return { token, email, error: null };
}

// Action performs the actual verification via POST
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const token = formData.get("token") as string;
  const email = (formData.get("email") as string)?.toLowerCase();

  if (!token || !email) {
    return { error: "Invalid magic link. Please request a new one." };
  }

  // Look up user
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.magicToken || !user.magicTokenExpiresAt) {
    return { error: "Magic link expired or invalid. Please request a new one." };
  }

  // Verify token
  const isValid = verifyMagicToken(token, user.magicToken, user.magicTokenExpiresAt);
  if (!isValid) {
    return { error: "Magic link expired or invalid. Please request a new one." };
  }

  // Clear magic token and update sign-in time
  const updateData: Record<string, unknown> = {
    magicToken: null,
    magicTokenExpiresAt: null,
    lastSignIn: new Date(),
  };

  // Founder detection: first sign-in during founder phase
  if (isFounderPhase() && !user.isFounder && user.tier === "FREE") {
    updateData.isFounder = true;
    updateData.tier = "STANDARD";
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Create session and redirect
  return createUserSession(user.id, "/");
}

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const submitted = useRef(false);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const actionError = (fetcher.data as { error?: string } | undefined)?.error;
  const error = actionError;

  // Auto-submit the form once on mount (preserves UX — user just clicks the link)
  useEffect(() => {
    if (submitted.current || !token || !email || error) return;
    submitted.current = true;
    const formData = new FormData();
    formData.set("token", token);
    formData.set("email", email);
    fetcher.submit(formData, { method: "POST" });
  }, [token, email, error, fetcher]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-ink mb-4">{error}</p>
          <a
            href="/auth/signin"
            className="text-sm text-brand-green font-medium hover:underline"
          >
            Request a new magic link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-ink-muted">Verifying your magic link...</p>
      </div>
    </div>
  );
}
