// ============================================================
// Triangulate — PanelContainer Component (Chunk 1.6)
// Generic panel with header, body, optional footer
// ============================================================

import { useState, useRef, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface PanelTab {
  id: string;
  label: string;
}

interface PanelContainerProps {
  /** Panel title displayed in the header */
  title: string;
  /** Optional subtitle or count */
  subtitle?: string;
  /** Optional tabs in the header strip */
  tabs?: PanelTab[];
  /** Active tab id */
  activeTab?: string;
  /** Tab change callback */
  onTabChange?: (tabId: string) => void;
  /** Header right-side controls */
  controls?: ReactNode;
  /** Whether the panel can be collapsed */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Optional footer content */
  footer?: ReactNode;
  /** Panel body content */
  children: ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Panel ID for focus management */
  panelId?: string;
}

export default function PanelContainer({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  controls,
  collapsible = false,
  defaultCollapsed = false,
  footer,
  children,
  className = "",
  panelId,
}: PanelContainerProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const panelRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={panelRef}
      id={panelId}
      className={`flex flex-col bg-surface border border-border rounded-sm overflow-hidden ${className}`}
      role="region"
      aria-label={title}
      aria-expanded={collapsible ? !collapsed : undefined}
    >
      {/* Header — 36px */}
      <div className="flex items-center h-9 px-3 border-b border-border bg-paper shrink-0">
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-5 h-5 flex items-center justify-center text-ink-muted hover:text-ink mr-1"
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        )}

        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <span className="ml-2 text-[10px] text-ink-faint font-mono">
            {subtitle}
          </span>
        )}

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="ml-4 flex items-center gap-0.5" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded-sm transition-colors ${
                  activeTab === tab.id
                    ? "text-ink bg-ink/[0.06]"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Right controls */}
        {controls && (
          <div className="ml-auto flex items-center gap-1">
            {controls}
          </div>
        )}
      </div>

      {/* Body — flex-1, scrollable */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-thin" role="tabpanel">
          {children}
        </div>
      )}

      {/* Footer — 32px */}
      {!collapsed && footer && (
        <div className="h-8 flex items-center px-3 border-t border-border text-[11px] text-ink-faint shrink-0">
          {footer}
        </div>
      )}
    </section>
  );
}
