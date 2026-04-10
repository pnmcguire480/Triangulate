// ============================================================
// Triangulate — Pricing Page
// Values-forward pricing with Founder phase prominence
// ============================================================

import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, X, Crown, Zap, Shield, Eye, Lock, Heart } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/pricing";
import { getUser } from '~/lib/auth.server';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return {
    user: user ? { tier: user.tier, isFounder: user.isFounder } : null,
  };
}

// --- Founder phase pricing ---

const FOUNDER_TIERS = [
  {
    name: "Free",
    founderPrice: "$0",
    standardPrice: "$0",
    period: "forever",
    dailyCost: null,
    description: "All the truth. No limits. No catch.",
    features: [
      { text: "Unlimited stories", included: true },
      { text: "Full claim-level breakdowns", included: true },
      { text: "Search & Triangulate", included: true },
      { text: "All filters (region, bias, topic)", included: true },
      { text: "Convergence scores & trust signals", included: true },
      { text: "Keyboard shortcuts", included: true },
      { text: "Data export", included: false },
      { text: "Saved workspaces", included: false },
      { text: "Source Intelligence", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/auth/signin",
    highlight: false,
    tierKey: "FREE",
    founderNote: "Truth is free. No ads. No data selling.",
  },
  {
    name: "Premium",
    founderPrice: "Free",
    standardPrice: "$7.99/mo",
    period: "for Founders",
    dailyCost: null,
    description: "Pro tools for serious news consumers.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Export to CSV", included: true },
      { text: "Convergence certificates", included: true },
      { text: "5 saved workspaces", included: true },
      { text: "Command palette (Ctrl+K)", included: true },
      { text: "Density mode toggle", included: true },
      { text: "Real-time notifications", included: true },
      { text: "Source Intelligence", included: false },
      { text: "API access", included: false },
    ],
    cta: "Claim Founder Access",
    ctaLink: "/auth/signin",
    highlight: true,
    badge: "Founder Exclusive",
    tierKey: "STANDARD",
    founderNote: "Yours free, forever. No credit card needed.",
  },
  {
    name: "Journalist Pro",
    founderPrice: "$7.99",
    standardPrice: "$14.99/mo",
    period: "/month",
    dailyCost: "$0.27/day",
    description: "For reporters and researchers. The full arsenal.",
    features: [
      { text: "Everything in Premium", included: true },
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
    founderNote: "47% off standard pricing. Locked forever.",
  },
];

const VALUES = [
  {
    icon: Eye,
    title: "No ads. Ever.",
    description: "Advertising creates incentives to manipulate what you see. We will never run ads. Our only customer is you.",
  },
  {
    icon: Shield,
    title: "No data selling. Ever.",
    description: "Your reading habits, your searches, your interests \u2014 none of it leaves our servers. We don't profile you. We don't sell you.",
  },
  {
    icon: Lock,
    title: "Grandfathered pricing.",
    description: "The price you sign up at is the price you keep. We will never raise rates on existing members. When we add features, your plan gets them.",
  },
  {
    icon: Heart,
    title: "Early believers get rewarded.",
    description: "Founders who join now get Premium free for life \u2014 not a trial, not a teaser. Real access, permanently. We remember who showed up first.",
  },
];

export default function Pricing({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const [searchParams] = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutSuccess = searchParams.get("success") === "true";
  const checkoutCanceled = searchParams.get("canceled") === "true";

  async function handleCheckout(tier: string, tierKey: string) {
    if (!user) {
      window.location.href = "/auth/signin";
      return;
    }

    setCheckoutLoading(tierKey);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Unable to start checkout. Please try again.");
        setCheckoutLoading(null);
      }
    } catch {
      setCheckoutError("Payment system unavailable. Please try again later.");
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Checkout feedback banners */}
        {checkoutSuccess && (
          <div className="mb-6 px-4 py-3 rounded-sm border border-brand-green/20 bg-brand-green/6 text-sm text-brand-green font-medium text-center">
            Your subscription is now active!
          </div>
        )}
        {checkoutCanceled && (
          <div className="mb-6 px-4 py-3 rounded-sm border border-border bg-surface text-sm text-ink-muted text-center">
            Checkout was cancelled. Ready when you are.
          </div>
        )}
        {checkoutError && (
          <div className="mb-6 px-4 py-3 rounded-sm border border-red-500/20 bg-red-500/6 text-sm text-red-600 dark:text-red-400 font-medium text-center">
            {checkoutError}
          </div>
        )}

        {/* Values manifesto */}
        <section className="text-center mb-16">
          <div className="rule-line-double mb-6 max-w-xs mx-auto" />
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-ink mb-4">
            Our business model is the product.
          </h1>
          <p className="text-ink-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Most news platforms sell your attention to advertisers.
            We sell clarity directly to you. That alignment changes everything
            — what we build, what we show you, and whose interests we serve.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="p-4 rounded-sm border border-border bg-surface"
              >
                <div className="flex items-center gap-2 mb-2">
                  <value.icon className="w-4 h-4 text-brand-green shrink-0" />
                  <h3 className="text-sm font-semibold text-ink">{value.title}</h3>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
          <div className="rule-line mt-8 max-w-xs mx-auto" />
        </section>

        {/* Founder phase banner */}
        <section className="mb-10">
          <div className="bg-brand-green/6 border border-brand-green/15 rounded-sm px-6 py-6 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-brand-green" />
              <span className="font-headline text-lg font-bold text-brand-green">
                Founder Phase — Now Open
              </span>
            </div>
            <p className="text-sm text-ink-muted max-w-lg mx-auto mb-4">
              We&apos;re building Triangulate in public. Founders who join now
              get permanent benefits that will never be available again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-ink">Premium tier — free forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-ink">Journalist Pro — $7.99 instead of $14.99</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-ink">Rates locked for life</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {FOUNDER_TIERS.map((tier) => {
            const isCurrentPlan = user?.tier === tier.tierKey;

            return (
              <div
                key={tier.name}
                className={cn(
                  "relative p-6 rounded-sm border transition-all duration-200",
                  tier.highlight
                    ? "border-brand-green/30 bg-surface shadow-sm dark:border-neon-green/20 dark:shadow-[0_0_15px_rgba(0,255,136,0.05)]"
                    : "border-border bg-paper"
                )}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-4">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm",
                      tier.highlight
                        ? "bg-brand-green text-paper"
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
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="font-headline text-3xl font-bold text-ink">
                    {tier.founderPrice}
                  </span>
                  <span className="text-sm text-ink-muted">{tier.period}</span>
                </div>

                {/* Standard price comparison */}
                {tier.standardPrice !== tier.founderPrice && (
                  <p className="text-[10px] text-ink-faint mb-1">
                    <span className="line-through">{tier.standardPrice}</span>
                    {" "}after Founder phase
                  </p>
                )}

                {/* Daily cost */}
                {tier.dailyCost && (
                  <p className="text-[10px] text-ink-faint mb-2">{tier.dailyCost}</p>
                )}

                {/* Description */}
                <p className="text-sm text-ink-muted mb-4">{tier.description}</p>

                {/* Founder note */}
                <p className="text-xs text-brand-green font-medium mb-4">
                  {tier.founderNote}
                </p>

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
                    onClick={() => handleCheckout(tier.tierKey === "STANDARD" ? "PREMIUM" : "JOURNALIST", tier.tierKey)}
                    disabled={isCurrentPlan || checkoutLoading === tier.tierKey}
                    className={cn(
                      "block w-full text-center py-2.5 rounded-sm text-sm font-medium transition-colors mb-6",
                      isCurrentPlan
                        ? "bg-brand-green/10 text-brand-green border border-brand-green/20 cursor-default"
                        : tier.highlight
                          ? "bg-brand-green text-paper hover:bg-brand-green/90 cursor-pointer"
                          : "bg-paper-aged text-ink border border-ink/10 hover:border-ink/20 cursor-pointer"
                    )}
                  >
                    {isCurrentPlan ? "Current Plan" : checkoutLoading === tier.tierKey ? "Redirecting..." : tier.cta}
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Zap className="w-4 h-4" />
            <span>
              <strong className="text-ink">Price Lock Guarantee:</strong> Your rate never increases while your subscription is active.
            </span>
          </div>
        </div>

        {/* FAQ-style trust builders */}
        <section className="border-t border-border pt-12">
          <h2 className="font-headline text-xl font-bold text-ink text-center mb-8">
            Common questions
          </h2>
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                What happens after the Founder phase ends?
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                New users will pay standard pricing ($7.99/mo Premium, $14.99/mo Pro).
                Founders keep their rates permanently — Premium stays free, Pro stays $7.99.
                Your rate is locked the day you join.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                How do you make money if Premium is free for Founders?
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Founders are our early believers, not our revenue model. As Triangulate grows,
                standard subscribers and Journalist Pro users sustain the platform. Founders
                helped us get here — we repay that by never charging them.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                Why no ads?
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Advertising fundamentally misaligns incentives. Ad-supported platforms optimize
                for engagement and outrage because that&apos;s what sells impressions. We optimize
                for convergence and clarity because that&apos;s what you pay for. The business
                model is the product.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                Yes. No contracts, no penalties, no guilt trips. If you cancel, you keep
                access through the end of your billing period. If you come back, your
                Founder rate is still waiting for you.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
