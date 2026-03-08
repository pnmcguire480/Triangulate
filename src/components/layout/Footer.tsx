import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-navy/10 bg-brand-warm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="font-headline text-lg font-bold tracking-wider text-brand-navy">
              TRIANGULATE
            </span>
            <p className="mt-2 text-sm text-brand-navy/50 max-w-xs">
              Don&apos;t trust a source. Trust the signal.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-navy/40 mb-3">
                Product
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="text-sm text-brand-navy/60 hover:text-brand-navy transition-colors"
                >
                  Daily Feed
                </Link>
                <Link
                  href="/search"
                  className="text-sm text-brand-navy/60 hover:text-brand-navy transition-colors"
                >
                  Search
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm text-brand-navy/60 hover:text-brand-navy transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-navy/40 mb-3">
                Company
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="text-sm text-brand-navy/60 hover:text-brand-navy transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-brand-navy/60 hover:text-brand-navy transition-colors"
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="md:text-right">
            <p className="text-xs text-brand-navy/30">
              &copy; {new Date().getFullYear()} Triangulate. All rights
              reserved.
            </p>
            <p className="text-xs text-brand-navy/30 mt-1">
              No ads. No data selling. Ever.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
