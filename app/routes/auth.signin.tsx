import { useState } from "react";
import { Link } from "react-router";
import { Mail, Crown, ArrowLeft } from "lucide-react";
import type { Route } from "./+types/auth.signin";
import { getUserId, isFounderPhase } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    // Already logged in — show that
    return { isLoggedIn: true, isFounder: isFounderPhase() };
  }
  return { isLoggedIn: false, isFounder: isFounderPhase() };
}

export default function SignIn({ loaderData }: Route.ComponentProps) {
  const { isLoggedIn, isFounder } = loaderData;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-headline text-2xl font-bold text-ink mb-2">
          You&apos;re signed in
        </h1>
        <p className="text-ink-muted mb-6">You already have an active session.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-paper rounded-sm text-sm font-medium hover:bg-ink-light transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Feed
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  // Show "check your inbox" state
  if (status === "sent") {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center" role="status">
        <div className="rule-line-double mb-6 max-w-[200px] mx-auto" />
        <Mail className="w-10 h-10 text-brand-green mx-auto mb-4" />
        <h1 className="font-headline text-2xl font-bold text-ink mb-2">
          Check your inbox
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          We sent a magic link to <strong className="text-ink">{email}</strong>.
          Click it to sign in — no password needed.
        </p>
        <p className="text-xs text-ink-faint">
          Link expires in 15 minutes. Check spam if you don&apos;t see it.
        </p>
        <div className="rule-line mt-6 max-w-[200px] mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <div className="rule-line-double mb-6 max-w-[200px] mx-auto" />
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-ink mb-2">
          Sign In
        </h1>
        <p className="text-sm text-ink-muted">
          Join Triangulate — see where the sources agree.
        </p>
      </div>

      {/* Founder badge */}
      {isFounder && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-green/6 border border-brand-green/15 rounded-sm text-brand-green text-xs font-medium mb-6">
          <Crown className="w-3.5 h-3.5" />
          Founder Members get Premium free for life
        </div>
      )}

      {/* Sign in form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6">
        <label htmlFor="email" className="dateline block mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          aria-invalid={!!errorMsg}
          aria-describedby={errorMsg ? "signin-error" : undefined}
          className="w-full px-4 py-3 border border-ink/12 rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink/30 focus:ring-1 focus:ring-ink/10 transition-colors mb-4"
          required
          disabled={status === "sending"}
        />

        {errorMsg && (
          <p id="signin-error" role="alert" className="text-sm text-brand-red mb-3">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending" || !email.includes("@")}
          className="w-full px-6 py-3 bg-ink text-paper rounded-sm text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "sending" ? "Sending..." : "Send Magic Link"}
        </button>

        <p className="text-[11px] text-ink-faint mt-3 text-center">
          No password required. We&apos;ll email you a secure sign-in link.
        </p>
      </form>

      <div className="rule-line mt-8" />
    </div>
  );
}
