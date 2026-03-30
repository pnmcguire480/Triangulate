// ============================================================
// Triangulate — TopBar Component (Chunk 1.1)
// 48px fixed height, full width
// ============================================================

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, X, Crown, User } from "lucide-react";
import ThemeToggle from "~/components/ui/ThemeToggle";

interface TopBarUser {
  id: string;
  email: string;
  tier: string;
  isFounder: boolean;
}

interface TopBarProps {
  user: TopBarUser | null;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette?: () => void;
}

export default function TopBar({ user, isDark, onToggleTheme, onOpenCommandPalette }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search overlay on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header
      className="app-shell-topbar flex items-center px-3 bg-paper/95 backdrop-blur-sm border-b border-border z-40"
      style={{ height: "var(--shell-topbar-height)" }}
    >
      {/* Left: Wordmark + Tagline */}
      <Link to="/" className="flex items-baseline gap-2 shrink-0">
        <span className="font-headline text-base font-bold tracking-[0.08em] text-ink">
          TRIANGULATE
        </span>
        <span className="text-[11px] font-body tracking-[0.05em] text-ink-faint hidden lg:inline">
          WHERE ENEMIES AGREE
        </span>
      </Link>

      {/* Center: Search (desktop) */}
      <div className="flex-1 flex justify-center px-4">
        <button
          onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 w-full max-w-md h-8 px-3 rounded-sm border border-border bg-surface text-sm text-ink-muted hover:border-border-strong transition-colors"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="flex-1 text-left">Search stories...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-ink/5 text-ink-faint font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        {/* Auth: Sign In / User Menu */}
        {user ? (
          <div className="flex items-center gap-1.5 relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              onKeyDown={(e) => { if (e.key === 'Escape') setUserMenuOpen(false); }}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px]"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              <div className="w-7 h-7 rounded-full bg-brand-green/10 flex items-center justify-center text-xs font-semibold text-brand-green">
                {user.isFounder ? (
                  <Crown className="w-3.5 h-3.5" aria-label="Founder" />
                ) : (
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </div>
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-ink/5 rounded-sm text-ink-muted">
                {user.tier}
              </span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                <div className="absolute top-full right-0 mt-1 w-44 bg-surface border border-border rounded-sm shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-ink-muted truncate">{user.email}</p>
                  </div>
                  <form method="post" action="/api/auth/logout">
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2 text-sm text-ink-muted hover:bg-ink/[0.04] transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/auth/signin"
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 bg-ink text-paper rounded-sm hover:bg-ink-light transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-start justify-center pt-20" onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false); }}>
          <div className="w-full max-w-lg mx-4 bg-surface rounded-sm shadow-xl border border-border">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 p-3">
              <Search className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, sources, topics..."
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
                aria-label="Search"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="w-10 h-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-faint hover:text-ink"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
