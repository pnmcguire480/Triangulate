// ============================================================
// Triangulate — AppShell Component (Chunk 1.4 + 6.1-6.5)
// CSS Grid layout wrapping TopBar, Sidebar, StatusBar, content
// + CommandPalette, ShortcutOverlay, Notifications, Density
// ============================================================

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import BottomTabBar from "./BottomTabBar";

const CommandPalette = lazy(() => import("./CommandPalette"));
const ShortcutOverlay = lazy(() => import("./ShortcutOverlay"));
const NotificationToast = lazy(() => import("./NotificationToast"));
import { useWorkspaceDensitySync } from "~/lib/DensityProvider";
import { useWorkspaceStore } from "~/lib/stores/workspace";
import { useKeymap } from "~/lib/hooks/useKeymap";

interface AppShellUser {
  id: string;
  email: string;
  tier: string;
  isFounder: boolean;
}

interface AppShellProps {
  user: AppShellUser | null;
}

export default function AppShell({ user }: AppShellProps) {
  const [isDark, setIsDark] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutOverlayOpen, setShortcutOverlayOpen] = useState(false);
  const sidebarExpanded = useWorkspaceStore((s) => s.sidebarExpanded);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync isDark state with DOM on mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('triangulate-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Listen for theme changes from other tabs/CommandPalette
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'triangulate-theme') {
        const dark = e.newValue === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Listen for custom shortcut overlay event (from CommandPalette)
  useEffect(() => {
    function handleShowShortcuts() {
      setShortcutOverlayOpen(true);
    }
    document.addEventListener('triangulate:show-shortcuts', handleShowShortcuts);
    return () => document.removeEventListener('triangulate:show-shortcuts', handleShowShortcuts);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("triangulate-theme", next ? "dark" : "light");
  }

  // Keyboard shortcut handlers
  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const handleCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);
  const handleShortcutHelp = useCallback(() => setShortcutOverlayOpen((v) => !v), []);
  const handleToggleSidebar = useCallback(() => toggleSidebar(), [toggleSidebar]);
  const handleResetFilters = useCallback(() => navigate(location.pathname), [navigate, location.pathname]);

  useKeymap({
    onNavigate: handleNavigate,
    onCommandPalette: handleCommandPalette,
    onShortcutHelp: handleShortcutHelp,
    onToggleSidebar: handleToggleSidebar,
    onResetFilters: handleResetFilters,
  });

  // Sync data-density attribute to <html>
  useWorkspaceDensitySync();

  const sidebarWidth = sidebarExpanded
    ? "var(--shell-sidebar-expanded)"
    : "var(--shell-sidebar-collapsed)";

  return (
      <div
        className="app-shell"
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        {/* Top Bar — spans full width */}
        <TopBar
          user={user}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Sidebar — hidden on mobile via component */}
        <Sidebar />

        {/* Main content area */}
        <main
          id="main-content"
          className="app-shell-content scrollbar-thin"
        >
          <h1 className="sr-only">Triangulate — News Convergence Feed</h1>
          <Outlet />
        </main>

        {/* Status Bar — hidden on mobile via component */}
        <StatusBar />

        {/* Mobile Bottom Tab Bar — visible only on mobile */}
        <BottomTabBar />

        {/* Overlays */}
        <Suspense fallback={null}>
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
        </Suspense>
        <Suspense fallback={null}>
          <ShortcutOverlay open={shortcutOverlayOpen} onClose={() => setShortcutOverlayOpen(false)} />
        </Suspense>
        <Suspense fallback={null}>
          <NotificationToast />
        </Suspense>
      </div>
  );
}
