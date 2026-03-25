// ============================================================
// Triangulate — Today's Surprise Component (Chunk 3.3)
// Single-line highlight of the most unexpected convergence
// ============================================================

import { Sparkles } from "lucide-react";

interface TodaysSurpriseProps {
  /** e.g. "Fox News and The Guardian" */
  sourcePair: string;
  /** Number of shared factual claims */
  factCount: number;
  /** Topic name */
  topic: string;
  /** Convergence percentage */
  convergencePct: number;
  /** Story ID to navigate to */
  storyId: string;
  onClick?: () => void;
}

export default function TodaysSurprise({
  sourcePair,
  factCount,
  topic,
  convergencePct,
  storyId,
  onClick,
}: TodaysSurpriseProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 bg-brand-green/5 border border-brand-green/10 rounded-sm text-left hover:bg-brand-green/8 transition-colors"
    >
      <Sparkles
        className="w-4 h-4 text-brand-green shrink-0"
        aria-hidden="true"
      />
      <p className="text-xs text-ink flex-1">
        <strong className="font-semibold">{sourcePair}</strong> agree on{" "}
        <strong>{factCount} facts</strong> about {topic}.{" "}
        <span className="font-mono text-brand-green font-semibold">
          {convergencePct}% converged
        </span>
        .
      </p>
    </button>
  );
}
