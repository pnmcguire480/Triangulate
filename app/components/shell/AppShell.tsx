// ============================================================
// Triangulate — AppShell Component (Chunk 1.4 + 6.1-6.5)
// CSS Grid layout wrapping TopBar, Sidebar, StatusBar, content
// + CommandPalette, ShortcutOverlay, Notifications, Density
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import BottomTabBar from "./BottomTabBar";
import CommandPalette from "./CommandPalette";
import ShortcutOverlay from "./ShortcutOverlay";
import NotificationToast from "./NotificationToast";
import { DensityProvider } from "~/lib/DensityProvider";
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

  // Sync with actual DOM state on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
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

  const sidebarWidth = sidebarExpanded
    ? "var(--shell-sidebar-expanded)"
    : "var(--shell-sidebar-collapsed)";

  return (
    <DensityProvider>
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
          role="main"
        >
          <Outlet />
        </main>

        {/* Status Bar — hidden on mobile via component */}
        <StatusBar />

        {/* Mobile Bottom Tab Bar — visible only on mobile */}
        <BottomTabBar />

        {/* Overlays */}
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
        <ShortcutOverlay open={shortcutOverlayOpen} onClose={() => setShortcutOverlayOpen(false)} />
        <NotificationToast />
      </div>
    </DensityProvider>
  );
}
