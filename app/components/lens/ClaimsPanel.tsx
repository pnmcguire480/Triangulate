// ============================================================
// Triangulate — ClaimsPanel (Chunk 4.3)
// Claims with convergence meters and source attribution
// ============================================================

import { useState } from "react";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";
import ConvergenceExplainer from "./ConvergenceExplainer";

interface ClaimSource {
  articleId: string;
  quote?: string | null;
  supports: boolean;
  article?: {
    source: { name: string; biasTier: string };
  };
}

interface ClaimData {
  id: string;
  claimText: string;
  claimType: string;
  convergenceScore: number;
  sources: ClaimSource[];
}

interface ClaimsPanelProps {
  claims: ClaimData[];
}

export default function ClaimsPanel({ claims }: ClaimsPanelProps) {
  if (claims.length === 0) {
    return (
      <p className="text-xs text-ink-muted py-4 text-center">
        No claims have been extracted for this story yet.
      </p>
    );
  }

  // Sort by convergence score descending
  const sorted = [...claims].sort((a, b) => b.convergenceScore - a.convergenceScore);

  return (
    <div className="space-y-2" role="list" aria-label="Claims">
      {sorted.map((claim) => (
        <ClaimRow key={claim.id} claim={claim} />
      ))}
    </div>
  );
}

function ClaimRow({ claim }: { claim: ClaimData }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(claim.convergenceScore * 100);
  const supporting = claim.sources.filter((s) => s.supports);
  const contradicting = claim.sources.filter((s) => !s.supports);

  const color =
    pct >= 70
      ? "var(--color-brand-green)"
      : pct >= 30
        ? "var(--color-brand-amber)"
        : "var(--color-brand-red)";

  return (
    <div className="border border-border rounded-sm" role="listitem">
      {/* Claim header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2 p-2.5 text-left hover:bg-ink/[0.02] transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-ink-faint mt-0.5 shrink-0" aria-hidden="true" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink leading-relaxed">{claim.claimText}</p>
          {/* Convergence meter */}
          <div className="flex items-center gap-2 mt-1.5">
            <div
              className="flex-1 h-1.5 rounded-full bg-ink/5 overflow-hidden"
              role="meter"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Convergence: ${pct}%`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-[10px] font-mono shrink-0" style={{ color }}>
              {pct}%
            </span>
          </div>
        </div>
      </button>

      {/* Expanded: source attribution */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 space-y-2">
          {/* Supporting sources */}
          {supporting.length > 0 && (
            <div>
              <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider">
                Supports ({supporting.length})
              </span>
              <div className="mt-1 space-y-1">
                {supporting.map((s) => (
                  <div
                    key={s.articleId}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <Check
                      className="w-3 h-3 text-brand-green shrink-0"
                      aria-label="Supports"
                    />
                    <span className="text-ink">
                      {s.article?.source.name ?? "Unknown"}
                    </span>
                    {s.quote && (
                      <span className="text-ink-faint italic truncate">
                        — "{s.quote}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contradicting sources */}
          {contradicting.length > 0 && (
            <div>
              <span className="text-[10px] text-brand-red font-semibold uppercase tracking-wider">
                Contradicts ({contradicting.length})
              </span>
              <div className="mt-1 space-y-1">
                {contradicting.map((s) => (
                  <div
                    key={s.articleId}
                    className="flex items-center gap-1.5 text-[11px]"
                  >
                    <X
                      className="w-3 h-3 text-brand-red shrink-0"
                      aria-label="Contradicts"
                    />
                    <span className="text-ink">
                      {s.article?.source.name ?? "Unknown"}
                    </span>
                    {s.quote && (
                      <span className="text-ink-faint italic truncate">
                        — "{s.quote}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show the Math */}
          <ConvergenceExplainer score={claim.convergenceScore} sources={claim.sources} />
        </div>
      )}
    </div>
  );
}
