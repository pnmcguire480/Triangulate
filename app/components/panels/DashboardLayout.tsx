// ============================================================
// Triangulate — DashboardLayout Component (Chunk 1.8)
// Three-panel grid: Wire | Lens | Dossier
// ============================================================

import { type ReactNode, useState, useCallback, useRef, useEffect } from "react";
import PanelResizer from "./PanelResizer";
import { useWorkspaceStore } from "~/lib/stores/workspace";
import type { LayoutPreset } from "~/types/workspace";
import { LAYOUT_PRESETS } from "~/types/workspace";

interface DashboardLayoutProps {
  /** Wire panel content (story list) */
  wire: ReactNode;
  /** Lens panel content (story detail) */
  lens?: ReactNode;
  /** Dossier panel content (claims, collapsible) */
  dossier?: ReactNode;
}

export default function DashboardLayout({
  wire,
  lens,
  dossier,
}: DashboardLayoutProps) {
  const panelLayout = useWorkspaceStore((s) => s.panelLayout);
  const setPanelLayout = useWorkspaceStore((s) => s.setPanelLayout);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Track container width for pixel calculations
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Convert percentage layout to grid template
  const wireWidth = `${panelLayout.wire}%`;
  const lensWidth = lens ? `${panelLayout.lens}%` : "0";
  const dossierWidth = dossier ? `${panelLayout.dossier}%` : "0";

  const handleWireResize = useCallback(
    (newPixelWidth: number) => {
      if (!containerWidth) return;
      const newPercent = Math.round((newPixelWidth / containerWidth) * 100);
      const remaining = 100 - newPercent;
      const lensRatio = panelLayout.lens / (panelLayout.lens + panelLayout.dossier || 1);
      setPanelLayout({
        wire: newPercent,
        lens: Math.round(remaining * lensRatio),
        dossier: remaining - Math.round(remaining * lensRatio),
      });
    },
    [containerWidth, panelLayout, setPanelLayout]
  );

  return (
    <>
      {/* Desktop: multi-panel grid */}
      <div
        ref={containerRef}
        className="hidden md:grid h-full overflow-hidden"
        style={{
          gridTemplateColumns: `${wireWidth} ${lens ? `auto ${lensWidth}` : ""} ${dossier ? `auto ${dossierWidth}` : ""}`,
        }}
      >
        {/* Wire Panel */}
        <div className="overflow-hidden">{wire}</div>

        {/* Resizer + Lens */}
        {lens && (
          <>
            <PanelResizer
              currentWidth={(panelLayout.wire / 100) * containerWidth}
              minWidth={containerWidth * 0.2}
              maxWidth={containerWidth * 0.7}
              onResize={handleWireResize}
            />
            <div className="overflow-hidden">{lens}</div>
          </>
        )}

        {/* Resizer + Dossier */}
        {dossier && (
          <>
            <PanelResizer
              currentWidth={((panelLayout.wire + panelLayout.lens) / 100) * containerWidth}
              minWidth={containerWidth * 0.5}
              maxWidth={containerWidth * 0.85}
              onResize={(newWidth) => {
                const wireAndLensPercent = Math.round((newWidth / containerWidth) * 100);
                const dossierPercent = 100 - wireAndLensPercent;
                setPanelLayout({
                  wire: panelLayout.wire,
                  lens: wireAndLensPercent - panelLayout.wire,
                  dossier: dossierPercent,
                });
              }}
            />
            <div className="overflow-hidden">{dossier}</div>
          </>
        )}
      </div>

      {/* Mobile: wire + lens slide-up */}
      <div className="md:hidden flex flex-col h-full overflow-hidden">
        {lens ? (
          <>
            <div className="flex-1 overflow-auto">{lens}</div>
          </>
        ) : (
          wire
        )}
      </div>
    </>
  );
}
