// ============================================================
// Triangulate — How It Works
// Simple explanation of the convergence engine for new users
// ============================================================

import { Link } from "react-router";
import Footer from "~/components/layout/Footer";

const steps = [
  {
    number: "01",
    title: "We read the news. All of it.",
    description:
      "Every day, Triangulate ingests articles from 76+ news outlets spanning the full political spectrum — from far-left to far-right — across 10 global regions. We don't pick favorites. We read everyone.",
    detail: "US, UK, Europe, Middle East, Asia-Pacific, Canada, Latin America, Africa, Oceania, and global wire services.",
  },
  {
    number: "02",
    title: "We find the same story.",
    description:
      "Our engine extracts the people, places, and organizations from each headline, then clusters articles covering the same event. No AI opinions — just math. If three outlets mention the same people in the same place at the same time, they're probably covering the same story.",
    detail: "Entity extraction, TF-IDF weighting, and union-find clustering.",
  },
  {
    number: "03",
    title: "We extract the claims.",
    description:
      "For each story cluster, AI reads every article and pulls out the specific factual claims being made. \"GDP grew 2.3%.\" \"The vote was 52-48.\" \"The meeting lasted three hours.\" Not opinions. Facts.",
    detail: "Claims are deduplicated and attributed back to their source.",
  },
  {
    number: "04",
    title: "We score the convergence.",
    description:
      "Here's where it gets interesting. When a far-left outlet and a far-right outlet both report the same fact, that's a strong signal. When outlets from different countries agree, even stronger. We score every claim based on how unlikely the agreement is.",
    detail: "Higher ideological distance + cross-regional agreement = higher convergence.",
  },
  {
    number: "05",
    title: "You see where enemies agree.",
    description:
      "The result is a feed ranked not by engagement or outrage, but by convergence — where the most adversarial sources confirm the same facts. The things that Fox News and MSNBC both quietly agree on? That's the signal most people never see.",
    detail: "That's Triangulate.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <p className="dateline mb-4">How It Works</p>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4">
            Not what to think.{" "}
            <span className="relative">
              Where the evidence converges
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-green/40" />
            </span>
            .
          </h1>
          <p className="text-sm text-ink-muted max-w-lg mx-auto">
            Triangulate doesn&apos;t fact-check. It doesn&apos;t pick sides. It shows you
            the facts that ideologically opposed news outlets all confirm — because
            when enemies agree, you&apos;re probably looking at the truth.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <div className="space-y-12">
          {steps.map((step) => (
            <div key={step.number} className="relative pl-16">
              {/* Step number */}
              <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center rounded-sm bg-brand-green/8 border border-brand-green/15">
                <span className="font-mono text-sm font-bold text-brand-green">
                  {step.number}
                </span>
              </div>

              <h2 className="font-headline text-lg font-bold text-ink mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed mb-2">
                {step.description}
              </p>
              <p className="text-xs text-ink-faint italic">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we're NOT */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-headline text-xl font-bold text-ink mb-6 text-center">
            What Triangulate is not
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Not a fact-checker", desc: "We never render editorial judgments." },
              { label: "Not a social platform", desc: "No comments, no followers, no outrage." },
              { label: "Not a filter bubble", desc: "Every outlet is shown. We illuminate, not censor." },
              { label: "Not single-region", desc: "Global engine with 10 regions and regional bias calibration." },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-sm border border-border bg-surface"
              >
                <p className="text-sm font-semibold text-ink mb-1">{item.label}</p>
                <p className="text-xs text-ink-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="font-headline text-xl font-bold text-ink mb-3">
            See it for yourself
          </h2>
          <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
            Founder members get free access for life. No credit card. No ads. No data selling. Ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth/signin"
              className="px-6 py-2.5 bg-ink text-paper rounded-sm font-medium hover:bg-ink-light transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 text-ink border border-border-strong rounded-sm font-medium hover:border-ink/30 transition-colors text-sm"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
