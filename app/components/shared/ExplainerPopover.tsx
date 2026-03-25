// ============================================================
// Triangulate — Explainer Popover (Chunk 7.7)
// "Why It Matters" contextual tooltip/popover
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface ExplainerPopoverProps {
  short: string;
  long: string;
  benchmark?: string;
  children?: React.ReactNode;
}

export default function ExplainerPopover({ short, long, benchmark, children }: ExplainerPopoverProps) {
  const [expanded, setExpanded] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!expanded) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded]);

  return (
    <span className="relative inline-flex items-center" ref={popoverRef}>
      {children}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="ml-1 text-ink-faint hover:text-ink-muted transition-colors"
        aria-label="More information"
        title={short}
      >
        <HelpCircle className="w-3 h-3" />
      </button>

      {expanded && (
        <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-surface border border-border rounded-sm shadow-lg p-3 text-left">
          <p className="text-xs text-ink leading-relaxed">{long}</p>
          {benchmark && (
            <p className="text-[10px] text-ink-faint mt-2 pt-2 border-t border-border italic">
              {benchmark}
            </p>
          )}
        </div>
      )}
    </span>
  );
}
