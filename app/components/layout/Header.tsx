import { Link, Form } from "react-router";
import { useState } from "react";
import { Crown, LogOut, User } from "lucide-react";
import ThemeToggle from "~/components/ui/ThemeToggle";

interface HeaderUser {
  id: string;
  email: string;
  tier: string;
  isFounder: boolean;
}

interface HeaderProps {
  user: HeaderUser | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function Header({ user, isDark, onToggleTheme }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo — newspaper masthead */}
          <Link to="/" className="flex flex-col">
            <span className="font-headline text-xl sm:text-2xl font-bold tracking-wider text-ink">
              TRIANGULATE
            </span>
            <span className="text-[10px] tracking-[0.15em] text-ink-faint -mt-1 hidden sm:block">
              For those who make, report, research, and consume news.
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Feed
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Search
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium text-ink-muted hover:text-ink transition-colors"
            >
              Pricing
            </Link>

            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {user ? (
              <div className="flex items-center gap-3">
                {/* User badge */}
                <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                  {user.isFounder && <Crown className="w-3.5 h-3.5 text-brand-green" />}
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{user.email}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-ink/5 rounded-sm">
                    {user.tier}
                  </span>
                </div>
                {/* Logout */}
                <Form method="post" action="/api/auth/logout">
                  <button
                    type="submit"
                    className="text-xs text-ink-faint hover:text-ink transition-colors inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </Form>
              </div>
            ) : (
              <Link
                to="/auth/signin"
                className="text-sm font-medium px-4 py-2 bg-ink text-paper rounded-sm hover:bg-ink-light transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-ink-muted hover:text-ink"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav aria-label="Mobile navigation" className="md:hidden pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink py-1" onClick={() => setMenuOpen(false)}>
                Feed
              </Link>
              <Link to="/search" className="text-sm font-medium text-ink-muted hover:text-ink py-1" onClick={() => setMenuOpen(false)}>
                Search
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-ink-muted hover:text-ink py-1" onClick={() => setMenuOpen(false)}>
                Pricing
              </Link>

              <div className="flex items-center gap-2 py-1">
                <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
                <span className="text-xs text-ink-muted">{isDark ? "Dark mode" : "Light mode"}</span>
              </div>

              {user ? (
                <>
                  <div className="flex items-center gap-2 py-1 text-xs text-ink-muted">
                    {user.isFounder && <Crown className="w-3.5 h-3.5 text-brand-green" />}
                    <span>{user.email}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-ink/5 rounded-sm">
                      {user.tier}
                    </span>
                  </div>
                  <Form method="post" action="/api/auth/logout">
                    <button
                      type="submit"
                      className="text-sm font-medium text-ink-muted hover:text-ink py-1 inline-flex items-center gap-1.5"
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </Form>
                </>
              ) : (
                <Link
                  to="/auth/signin"
                  className="text-sm font-medium px-4 py-2 bg-ink text-paper rounded-sm text-center hover:bg-ink-light transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
