// ============================================================
// Triangulate — Disagreement Map (Chunk 7.6)
// Shows which claims split along ideological/regional lines
// ============================================================

import { classifyDisagreement, type DisagreementType } from '~/lib/disagreement';

interface DisputeSource {
  name: string;
  biasTier: string;
  region: string;
  supports: boolean;
}

interface DisagreementMapProps {
  claims: {
    claimText: string;
    sources: DisputeSource[];
  }[];
}

const TYPE_STYLES: Record<DisagreementType, { label: string; color: string }> = {
  IDEOLOGICAL: { label: 'Ideological Split', color: '#6C63FF' },
  REGIONAL: { label: 'Regional Split', color: '#E9C46A' },
  INSTITUTIONAL: { label: 'Institutional Split', color: '#264653' },
  RANDOM: { label: 'No Clear Pattern', color: '#6B7280' },
};

export default function DisagreementMap({ claims }: DisagreementMapProps) {
  // Only show contested claims (has both supporters and contradictors)
  const contested = claims.filter((c) => {
    const hasSupport = c.sources.some((s) => s.supports);
    const hasContradict = c.sources.some((s) => !s.supports);
    return hasSupport && hasContradict;
  });

  if (contested.length === 0) {
    return (
      <p className="text-sm text-ink-muted text-center py-4">
        No contested claims in this story.
      </p>
    );
  }

  const results = contested.map((c) => classifyDisagreement(c.claimText, c.sources));

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        Disagreement Analysis
      </h3>
      {results.map((result, i) => {
        const style = TYPE_STYLES[result.type];
        return (
          <div key={i} className="bg-surface border border-border rounded-sm p-3">
            {/* Type badge */}
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium mb-2"
              style={{
                backgroundColor: style.color + '15',
                color: style.color,
                border: `1px solid ${style.color}30`,
              }}
            >
              {style.label}
            </span>

            {/* Claim text */}
            <p className="text-sm text-ink mb-2">&ldquo;{result.claimText}&rdquo;</p>

            {/* Narrative */}
            <p className="text-xs text-ink-muted italic">{result.narrative}</p>

            {/* Source breakdown */}
            <div className="flex gap-4 mt-2 text-[10px]">
              <span className="text-brand-green">
                {result.supportingSources.length} supporting
              </span>
              <span className="text-brand-red">
                {result.contradictingSources.length} contradicting
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
