import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="font-headline text-lg font-bold tracking-wider text-ink">
              TRIANGULATE
            </span>
            <p className="mt-1 text-[11px] text-ink-muted max-w-xs">
              For those who make, report, research, and consume news.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h3 className="dateline mb-3">Product</h3>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
                  Daily Feed
                </Link>
                <Link to="/search" className="text-sm text-ink-muted hover:text-ink transition-colors">
                  Search
                </Link>
                <Link to="/pricing" className="text-sm text-ink-muted hover:text-ink transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div>
              <h3 className="dateline mb-3">Company</h3>
              <div className="flex flex-col gap-2">
                <Link to="/#feed" className="text-sm text-ink-muted hover:text-ink transition-colors">
                  How It Works
                </Link>
                <Link to="/auth/signin" className="text-sm text-ink-muted hover:text-ink transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="md:text-right">
            <p className="text-xs text-ink-faint">
              &copy; {new Date().getFullYear()} Triangulate. All rights reserved.
            </p>
            <p className="text-xs text-ink-faint mt-1">
              No ads. No data selling. Ever.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
