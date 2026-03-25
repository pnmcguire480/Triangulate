// ============================================================
// Triangulate — Panel Focus Manager (Chunk 1.10)
// F6 cycling between panels, keyboard navigation
// ============================================================

import { useCallback, useEffect, useRef } from "react";

type PanelId = string;

interface PanelRegistration {
  id: PanelId;
  element: HTMLElement;
}

const registeredPanels: PanelRegistration[] = [];
let activePanelIndex = -1;

/**
 * Register a panel for F6 focus cycling.
 * Returns a ref to attach to the panel's root element.
 */
export function usePanelFocus(panelId: PanelId) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const registration: PanelRegistration = { id: panelId, element: el };
    registeredPanels.push(registration);

    return () => {
      const idx = registeredPanels.findIndex((r) => r.id === panelId);
      if (idx !== -1) registeredPanels.splice(idx, 1);
    };
  }, [panelId]);

  return panelRef;
}

/**
 * Global keyboard shortcuts hook.
 * Handles F6 panel cycling and `?` for help overlay.
 */
export function useKeyboardShortcuts(options?: {
  onShowHelp?: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // F6: cycle panels
      if (e.key === "F6") {
        e.preventDefault();
        if (registeredPanels.length === 0) return;

        if (e.shiftKey) {
          // Reverse cycle
          activePanelIndex =
            activePanelIndex <= 0
              ? registeredPanels.length - 1
              : activePanelIndex - 1;
        } else {
          activePanelIndex = (activePanelIndex + 1) % registeredPanels.length;
        }

        const panel = registeredPanels[activePanelIndex];
        if (panel?.element) {
          panel.element.focus();
        }
      }

      // ? — show shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        options?.onShowHelp?.();
      }
    },
    [options]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
