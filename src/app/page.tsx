import Link from "next/link";
import { TrustSignal, TRUST_SIGNAL_CONFIG } from "@/types";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#1A1A2E 1px, transparent 1px), linear-gradient(90deg, #1A1A2E 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          {/* Founder Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green signal-pulse" />
            Founder Member Access — Free for Life
          </div>

          {/* Headline */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-brand-navy leading-tight mb-6 animate-fade-in">
            See where the
            <br />
            sources{" "}
            <span className="relative">
              agree
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-green/30 rounded-full" />
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-brand-navy/60 max-w-2xl mx-auto mb-10 animate-fade-in font-body">
            Triangulate clusters news from across the political spectrum and
            finds where ideologically opposed outlets confirm the same facts.
            That convergence is the signal.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
            <Link
              href="#feed"
              className="px-6 py-3 bg-brand-navy text-brand-warm rounded-lg font-medium hover:bg-brand-accent transition-colors text-sm"
            >
              Explore Today&apos;s Stories
            </Link>
            <Link
              href="/search"
              className="px-6 py-3 bg-white text-brand-navy border border-brand-navy/15 rounded-lg font-medium hover:border-brand-navy/30 transition-colors text-sm"
            >
              Triangulate a Story
            </Link>
          </div>

          {/* Trust Signal Demo */}
          <div className="max-w-xl mx-auto animate-fade-in">
            <p className="text-xs uppercase tracking-widest text-brand-navy/30 mb-4 font-medium">
              Trust Signals
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.values(TRUST_SIGNAL_CONFIG).map((config) => (
                <span
                  key={config.signal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${config.color}12`,
                    color: config.color,
                    border: `1px solid ${config.color}25`,
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-brand-navy/8 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-brand-navy text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-navy/5 flex items-center justify-center mx-auto mb-4">
                <span className="font-headline text-lg font-bold text-brand-navy/40">
                  1
                </span>
              </div>
              <h3 className="font-headline text-lg font-semibold text-brand-navy mb-2">
                We gather coverage
              </h3>
              <p className="text-sm text-brand-navy/50">
                20 outlets across the political spectrum. Left, center, right —
                every major story, every angle.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-headline text-lg font-bold text-brand-green/60">
                  2
                </span>
              </div>
              <h3 className="font-headline text-lg font-semibold text-brand-navy mb-2">
                We find convergence
              </h3>
              <p className="text-sm text-brand-navy/50">
                When outlets that disagree on everything else confirm the same
                fact, that fact carries weight.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-headline text-lg font-bold text-brand-teal/60">
                  3
                </span>
              </div>
              <h3 className="font-headline text-lg font-semibold text-brand-navy mb-2">
                You see the signal
              </h3>
              <p className="text-sm text-brand-navy/50">
                Trust signals, claim-by-claim analysis, and primary source
                links. You decide what&apos;s real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Feed Placeholder */}
      <section id="feed" className="border-t border-brand-navy/8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-brand-navy mb-4">
              Daily Feed
            </h2>
            <p className="text-brand-navy/50 mb-8">
              Today&apos;s stories, pre-triangulated.
            </p>

            {/* Placeholder cards */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-brand-navy/8 p-6 text-left"
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-green/10 text-brand-green border border-brand-green/20">
                      🟢 Converged
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-teal/10 text-brand-teal border border-brand-teal/20">
                      📄 Source-Backed
                    </span>
                  </div>
                  <div className="h-5 w-4/5 bg-brand-navy/8 rounded mb-2" />
                  <div className="h-4 w-full bg-brand-navy/5 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-brand-navy/5 rounded mb-4" />
                  <div className="flex items-center gap-3 text-xs text-brand-navy/30">
                    <span>7 outlets</span>
                    <span>·</span>
                    <span>5 reporting, 2 commentary</span>
                    <span>·</span>
                    <span>4 claims</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-brand-navy/30 mt-8">
              Live stories coming soon — backend is being built.
            </p>
          </div>
        </div>
      </section>

      {/* What We Are / What We Aren't (condensed) */}
      <section className="border-t border-brand-navy/8 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-headline text-xl font-bold text-brand-green mb-4">
                What Triangulate Is
              </h3>
              <div className="space-y-3 text-sm text-brand-navy/70">
                <p>
                  <strong className="text-brand-navy">A trust engine</strong>{" "}
                  that shows where adversarial sources converge on the same
                  facts.
                </p>
                <p>
                  <strong className="text-brand-navy">
                    A primary source finder
                  </strong>{" "}
                  that links directly to court filings, legislation, and
                  official documents.
                </p>
                <p>
                  <strong className="text-brand-navy">
                    A tool for your judgment
                  </strong>{" "}
                  — we show the landscape, you navigate it.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-headline text-xl font-bold text-brand-red mb-4">
                What Triangulate Is Not
              </h3>
              <div className="space-y-3 text-sm text-brand-navy/70">
                <p>
                  <strong className="text-brand-navy">Not a fact-checker</strong>{" "}
                  — we don&apos;t issue verdicts or tell you what to believe.
                </p>
                <p>
                  <strong className="text-brand-navy">
                    Not another aggregator
                  </strong>{" "}
                  — we analyze coverage, not just collect headlines.
                </p>
                <p>
                  <strong className="text-brand-navy">
                    Not politically aligned
                  </strong>{" "}
                  — convergence doesn&apos;t care about ideology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
