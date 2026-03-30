// ============================================================
// Triangulate — Mobile Bottom Tab Bar (Chunk 1.9)
// 56px height, fixed bottom, 5 icons, replaces sidebar on < 768px
// ============================================================

import { Link, Form, useLocation } from "react-router";
import {
  Newspaper,
  Search,
  Database,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface TabItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

const TABS: TabItem[] = [
  { icon: Newspaper, label: "Feed", to: "/" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: Database, label: "Sources", to: "/sources" },
  { icon: TrendingUp, label: "Trends", to: "/trends" },
];

export default function BottomTabBar() {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden flex items-center justify-around bg-paper border-t border-border z-40"
      style={{ height: "var(--shell-bottom-tab-height)" }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] ${
              active ? "text-brand-green" : "text-ink-muted"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px]">{tab.label}</span>
          </Link>
        );
      })}

      {/* More button */}
      <div className="relative flex-1 flex justify-center">
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center justify-center gap-0.5 h-full min-w-[44px] ${
            moreOpen ? "text-brand-green" : "text-ink-muted"
          }`}
          aria-label="More options"
          aria-expanded={moreOpen}
        >
          <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
          <span className="text-[10px]">More</span>
        </button>

        {/* More menu sheet */}
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMoreOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-surface border border-border rounded-sm shadow-lg z-50">
              <div className="py-1">
                <Link
                  to="/pricing"
                  className="block px-4 py-2.5 text-sm text-ink-muted hover:bg-ink/[0.04] transition-colors"
                  onClick={() => setMoreOpen(false)}
                >
                  Pricing
                </Link>
                <div
                  className="block px-4 py-2.5 text-sm text-ink-faint/50 cursor-not-allowed"
                >
                  Watchlist (Coming Soon)
                </div>
                <div className="mx-3 border-t border-border" />
                <Form method="post" action="/api/auth/logout">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2.5 text-sm text-ink-muted hover:bg-ink/[0.04] transition-colors"
                    onClick={() => setMoreOpen(false)}
                  >
                    Sign Out
                  </button>
                </Form>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
