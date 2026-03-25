// ============================================================
// Triangulate — StatusBar Component (Chunk 1.3)
// 28px fixed bottom, monospace 11px, hidden on mobile
// ============================================================

interface StatusBarProps {
  sourceCount?: number;
  totalSources?: number;
  lastIngestMinutes?: number;
  pipelineStatus?: "ok" | "degraded" | "down";
  gciScore?: number;
  activeFilters?: string[];
}

export default function StatusBar({
  sourceCount = 52,
  totalSources = 55,
  lastIngestMinutes = 4,
  pipelineStatus = "ok",
  gciScore,
  activeFilters = [],
}: StatusBarProps) {
  const statusColor =
    pipelineStatus === "ok"
      ? "bg-brand-green"
      : pipelineStatus === "degraded"
        ? "bg-brand-amber"
        : "bg-brand-red";

  const gciColor =
    gciScore != null
      ? gciScore >= 70
        ? "text-brand-green"
        : gciScore >= 40
          ? "text-brand-amber"
          : "text-brand-red"
      : "text-ink-faint";

  return (
    <footer
      className="app-shell-statusbar hidden md:flex items-center justify-between px-3 bg-paper border-t border-border text-[11px] font-mono text-ink-faint"
      style={{ height: "var(--shell-statusbar-height)" }}
      role="status"
      aria-label="Application status"
    >
      {/* Left: Pipeline status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} aria-hidden="true" />
          <span>
            {sourceCount}/{totalSources} sources
          </span>
        </div>
        <span className="text-ink-faint/50">|</span>
        <span>Last: {lastIngestMinutes}m ago</span>
      </div>

      {/* Center: Active filter summary */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-hidden">
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="px-1.5 py-0.5 bg-ink/5 rounded text-[10px] whitespace-nowrap"
            >
              {filter}
            </span>
          ))}
        </div>
      )}

      {/* Right: GCI + mode */}
      <div className="flex items-center gap-3">
        {gciScore != null && (
          <span className={`font-semibold ${gciColor}`}>
            GCI {gciScore}
          </span>
        )}
        <span className="text-ink-faint/40" aria-hidden="true">
          |
        </span>
        <span>
          <kbd className="text-[10px]">?</kbd> shortcuts
        </span>
      </div>
    </footer>
  );
}
