// ============================================================
// Triangulate — Pricing Page (Chunk 8.5 refresh)
// Updated with command-center features and daily cost comparison
// ============================================================

import { Link, useLoaderData } from "react-router";
import { Check, X, Crown, Zap, Coffee } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/pricing";
import { getUser } from "~/lib/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return {
    user: user ? { tier: user.tier, isFounder: user.isFounder } : null,
  };
}

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    dailyCost: null,
    description: "Browse the headlines. See the signal.",
    features: [
      { text: "5 stories per day", included: true },
      { text: "Story-level trust signals", included: true },
      { text: "Global Convergence Index", included: true },
      { text: "Keyboard shortcuts", included: true },
      { text: "1 convergence certificate/day", included: true },
      { text: "Claim-level breakdown", included: false },
      { text: "Search & Triangulate", included: false },
      { text: "Advanced filters", included: false },
      { text: "Data export", included: false },
      { text: "Source Intelligence", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/auth/signin",
    highlight: false,
    tierKey: "FREE",
  },
  {
    name: "Premium",
    price: "$7.99",
    period: "/month",
    dailyCost: "$0.27/day",
    description: "Full command center. Every claim. Every filter.",
    features: [
      { text: "Unlimited stories", included: true },
      { text: "Claim-level convergence detail", included: true },
      { text: "5 searches per day", included: true },
      { text: "Advanced filters (region, bias, topic)", included: true },
      { text: "Command palette (Ctrl+K)", included: true },
      { text: "Density mode toggle", included: true },
      { text: "5 saved workspaces", included: true },
      { text: "Export to CSV", included: true },
      { text: "Convergence certificates", included: true },
      { text: "Real-time notifications", included: true },
    ],
    cta: "Start Premium",
    ctaLink: "/auth/signin",
    highlight: true,
    badge: "Most Popular",
    tierKey: "STANDARD",
  },
  {
    name: "Journalist Pro",
    price: "$14.99",
    period: "/month",
    dailyCost: "$0.50/day",
    description: "For reporters and researchers. Source intelligence unlocked.",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Unlimited searches", included: true },
      { text: "Source Intelligence directory", included: true },
      { text: "Convergence narratives", included: true },
      { text: "Disagreement analysis", included: true },
      { text: "Export to CSV, JSON & PDF", included: true },
      { text: "White-label certificates", included: true },
      { text: "Unlimited saved workspaces", included: true },
      { text: "Claim citations", included: true },
      { text: "API access (coming soon)", included: true },
    ],
    cta: "Go Pro",
    ctaLink: "/auth/signin",
    highlight: false,
    badge: "For Journalists",
    tierKey: "PREMIUM",
  },
];

export default function Pricing({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  async function handleCheckout(tier: string) {
    if (!user) {
      window.location.href = "/auth/signin";
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Handle error silently
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="rule-line-double mb-6 max-w-xs mx-auto" />
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-ink mb-3">
          Simple, honest pricing
        </h1>
        <p className="text-ink-muted max-w-lg mx-auto mb-4">
          No tricks, no hidden fees. Your price is locked the moment you subscribe
          — it never goes up while you&apos;re a member.
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
          <Coffee className="w-3.5 h-3.5" />
          Less than a morning coffee.
        </div>
        <div className="rule-line mt-6 max-w-xs mx-auto" />
      </div>

      {/* Founder banner */}
      <div className="bg-brand-green/6 border border-brand-green/15 rounded-sm px-6 py-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-brand-green" />
          <span className="font-headline font-semibold text-brand-green">Founder Member Program</span>
        </div>
        <p className="text-sm text-ink-muted">
          Sign up now and get <strong className="text-ink">Premium free for life</strong>.
          Limited spots. Early believers get rewarded.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isCurrentPlan = user?.tier === tier.tierKey;

          return (
            <div
              key={tier.name}
              className={cn(
                "relative p-6 rounded-sm border transition-all duration-200",
                tier.highlight
                  ? "border-ink/20 bg-white shadow-sm"
                  : "border-border bg-paper"
              )}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-4">
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm",
                    tier.highlight
                      ? "bg-ink text-paper"
                      : "bg-brand-teal/10 text-brand-teal border border-brand-teal/20"
                  )}>
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier name */}
              <h3 className="font-headline text-lg font-bold text-ink mb-1">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-headline text-3xl font-bold text-ink">{tier.price}</span>
                <span className="text-sm text-ink-muted">{tier.period}</span>
              </div>

              {/* Daily cost */}
              {tier.dailyCost && (
                <p className="text-[10px] text-ink-faint mb-2">{tier.dailyCost}</p>
              )}

              {/* Description */}
              <p className="text-sm text-ink-muted mb-6">{tier.description}</p>

              {/* CTA */}
              {tier.name === "Free" ? (
                <Link
                  to={tier.ctaLink}
                  className="block w-full text-center py-2.5 rounded-sm text-sm font-medium transition-colors mb-6 bg-paper-aged text-ink border border-ink/10 hover:border-ink/20"
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(tier.name === "Premium" ? "PREMIUM" : "JOURNALIST")}
                  disabled={isCurrentPlan}
                  className={cn(
                    "block w-full text-center py-2.5 rounded-sm text-sm font-medium transition-colors mb-6",
                    isCurrentPlan
                      ? "bg-brand-green/10 text-brand-green border border-brand-green/20 cursor-default"
                      : tier.highlight
                        ? "bg-ink text-paper hover:bg-ink-light cursor-pointer"
                        : "bg-paper-aged text-ink border border-ink/10 hover:border-ink/20 cursor-pointer"
                  )}
                >
                  {isCurrentPlan ? "Current Plan" : tier.cta}
                </button>
              )}

              {/* Features */}
              <div className="space-y-2.5">
                {tier.features.map((feature) => (
                  <div key={feature.text} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      "text-sm",
                      feature.included ? "text-ink" : "text-ink-faint"
                    )}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price lock guarantee */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-ink-muted">
          <Zap className="w-4 h-4" />
          <span>
            <strong className="text-ink">Price Lock Guarantee:</strong> Your rate never increases while your subscription is active.
          </span>
        </div>
      </div>
    </div>
  );
}
