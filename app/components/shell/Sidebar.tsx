// ============================================================
// Triangulate — Sidebar Component (Chunk 1.2)
// Collapsed: 56px (icons only). Expanded: 240px (icons + labels)
// ============================================================

import { Link, useLocation } from "react-router";
import {
  Newspaper,
  Search,
  Database,
  TrendingUp,
  Bookmark,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWorkspaceStore } from "~/lib/stores/workspace";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  to: string;
  disabled?: boolean;
}

const NAV_ITEMS: SidebarItem[] = [
  { icon: Newspaper, label: "Feed", to: "/" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: Database, label: "Sources", to: "/sources" },
  { icon: TrendingUp, label: "Trends", to: "/trends" },
  { icon: Bookmark, label: "Watchlist", to: "/watchlist", disabled: true },
];

const BOTTOM_ITEMS: SidebarItem[] = [
  { icon: CreditCard, label: "Pricing", to: "/pricing" },
];

export default function Sidebar() {
  const expanded = useWorkspaceStore((s) => s.sidebarExpanded);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const location = useLocation();

  const width = expanded
    ? "var(--shell-sidebar-expanded)"
    : "var(--shell-sidebar-collapsed)";

  function isActive(to: string) {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  }

  return (
    <nav
      aria-label="Sidebar navigation"
      className="hidden md:flex flex-col bg-paper border-r border-border transition-[width] duration-[var(--timing-structural)]"
      style={{ width, minWidth: width }}
    >
      {/* Nav items */}
      <div className="flex-1 flex flex-col pt-2 gap-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            expanded={expanded}
            active={isActive(item.to)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-border" />

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5 pb-2 pt-2">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            expanded={expanded}
            active={isActive(item.to)}
          />
        ))}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="flex items-center h-10 px-4 text-ink-faint hover:text-ink hover:bg-ink/[0.04] transition-colors"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="ml-3 text-xs">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    </nav>
  );
}

function SidebarLink({
  item,
  expanded,
  active,
}: {
  item: SidebarItem;
  expanded: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div
        className="flex items-center h-10 px-4 text-ink-faint/50 cursor-not-allowed relative"
        title={`${item.label} (coming soon)`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {expanded && (
          <span className="ml-3 text-sm truncate">{item.label}</span>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className={`flex items-center h-10 px-4 relative transition-colors ${
        active
          ? "text-ink bg-brand-green/[0.06]"
          : "text-ink-muted hover:text-ink hover:bg-ink/[0.04]"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-green rounded-r-sm" />
      )}
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {expanded && (
        <span className="ml-3 text-sm truncate">{item.label}</span>
      )}
    </Link>
  );
}
