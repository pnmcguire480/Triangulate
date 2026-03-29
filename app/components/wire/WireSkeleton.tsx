// ============================================================
// Triangulate — WireSkeleton (Chunk 3.6)
// Skeleton loading state for the Wire panel
// ============================================================

export default function WireSkeleton() {
  return (
    <div aria-label="Loading stories, please wait." role="status">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-3 border-b border-border animate-pulse min-h-[72px]"
        >
          {/* Mini gauge skeleton */}
          <div className="w-12 flex flex-col items-center gap-1">
            <div className="w-8 h-5 rounded-sm bg-ink/5" />
            <div className="w-6 h-2 rounded-sm bg-ink/5" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-ink/5 rounded-sm w-3/4" />
            <div className="h-3 bg-ink/5 rounded-sm w-1/2" />
            <div className="flex gap-2">
              <div className="h-2.5 bg-ink/5 rounded-sm w-16" />
              <div className="h-2.5 bg-ink/5 rounded-sm w-12" />
              <div className="h-2.5 bg-ink/5 rounded-sm w-14" />
            </div>
          </div>

          {/* Score skeleton */}
          <div className="w-10 flex flex-col items-center gap-1">
            <div className="w-8 h-6 rounded-sm bg-ink/5" />
            <div className="w-6 h-2 rounded-sm bg-ink/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
