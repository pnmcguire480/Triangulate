// ============================================================
// Triangulate — AppShell Component (Chunk 1.4)
// CSS Grid layout wrapping TopBar, Sidebar, StatusBar, content
// ============================================================

import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import BottomTabBar from "./BottomTabBar";
import { useWorkspaceStore } from "~/lib/stores/workspace";

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
  const sidebarExpanded = useWorkspaceStore((s) => s.sidebarExpanded);

  // Sync with actual DOM state on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("triangulate-theme", next ? "dark" : "light");
  }

  const sidebarWidth = sidebarExpanded
    ? "var(--shell-sidebar-expanded)"
    : "var(--shell-sidebar-collapsed)";

  return (
    <div
      className="app-shell"
      style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
    >
      {/* Top Bar — spans full width */}
      <TopBar user={user} isDark={isDark} onToggleTheme={toggleTheme} />

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
    </div>
  );
}
