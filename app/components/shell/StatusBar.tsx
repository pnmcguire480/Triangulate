// ============================================================
// Triangulate — StatusBar Component (Chunk 1.3 + 11.5)
// 28px fixed bottom, monospace 11px, hidden on mobile
// Polls /api/health every 60s for real pipeline data
// ============================================================

import { useState, useEffect } from 'react';

interface HealthData {
  status: 'green' | 'yellow' | 'red';
  sources: { active: number };
  articles: { lastIngestAgo: string };
  gci: { latest: number | null };
}

export default function StatusBar() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchHealth() {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/health');
        if (res.ok && mounted) {
          setHealth(await res.json());
        }
      } catch { /* silent */ }
    }

    function handleVisibilityChange() {
      if (!document.hidden) fetchHealth();
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const statusColor =
    health?.status === 'green'
      ? 'bg-brand-green'
      : health?.status === 'yellow'
        ? 'bg-brand-amber'
        : 'bg-brand-red';

  const gciScore = health?.gci?.latest;
  const gciColor =
    gciScore != null
      ? gciScore >= 0.7
        ? 'text-brand-green'
        : gciScore >= 0.4
          ? 'text-brand-amber'
          : 'text-brand-red'
      : 'text-ink-faint';

  return (
    <footer
      className="app-shell-statusbar hidden md:flex items-center justify-between px-3 bg-paper border-t border-border text-[11px] font-mono text-ink-faint"
      style={{ height: 'var(--shell-statusbar-height)' }}
      role="status"
      aria-label="Application status"
    >
      {/* Left: Pipeline status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} aria-hidden="true" />
          <span>
            {health?.sources?.active ?? '--'} sources
          </span>
        </div>
        <span className="text-ink-faint/50">|</span>
        <span>Last: {health?.articles?.lastIngestAgo ?? '--'}</span>
      </div>

      {/* Right: GCI + shortcuts hint */}
      <div className="flex items-center gap-3">
        {gciScore != null && (
          <span className={`font-semibold ${gciColor}`}>
            GCI {Math.round(gciScore * 100)}
          </span>
        )}
        <span className="text-ink-faint/40" aria-hidden="true">|</span>
        <span>
          <kbd className="text-[10px]">?</kbd> shortcuts
        </span>
      </div>
    </footer>
  );
}
