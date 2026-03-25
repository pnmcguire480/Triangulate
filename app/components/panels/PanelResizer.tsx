// ============================================================
// Triangulate — PanelResizer Component (Chunk 1.7)
// 4px invisible drag handle between panels
// ============================================================

import { useCallback, useRef, useEffect } from "react";

interface PanelResizerProps {
  /** Current panel width in pixels */
  currentWidth: number;
  /** Min width constraint */
  minWidth?: number;
  /** Max width constraint */
  maxWidth?: number;
  /** Callback on resize complete */
  onResize: (newWidth: number) => void;
  /** Callback during drag (for live CSS updates) */
  onDrag?: (newWidth: number) => void;
  /** Orientation — vertical (default) or horizontal */
  orientation?: "vertical" | "horizontal";
}

export default function PanelResizer({
  currentWidth,
  minWidth = 200,
  maxWidth = 800,
  onResize,
  onDrag,
  orientation = "vertical",
}: PanelResizerProps) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = currentWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth]
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      onDrag?.(newWidth);
    }

    function handleMouseUp(e: MouseEvent) {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      onResize(newWidth);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minWidth, maxWidth, onResize, onDrag]);

  // Keyboard handler: Ctrl+Shift+Arrow for 50px increments
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 50 : -50;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidth + delta));
        onResize(newWidth);
      }
    }
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      aria-valuenow={currentWidth}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-label="Resize panel"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className="w-1 cursor-col-resize bg-transparent hover:bg-brand-green/20 active:bg-brand-green/30 transition-colors shrink-0 focus:outline-none focus-visible:bg-brand-green/20"
    />
  );
}
