// ============================================================
// Triangulate — ClaimMatrix (Chunk 5.4)
// Truth table grid: sources x claims
// THE killer visualization — no competitor has this
// ============================================================

import { Check, X, Minus } from "lucide-react";

interface MatrixSource {
  name: string;
  biasTier: string;
}

interface MatrixClaim {
  id: string;
  claimText: string;
  convergenceScore: number;
}

interface MatrixCell {
  claimId: string;
  sourceIndex: number;
  supports: boolean | null; // null = no data
}

interface ClaimMatrixProps {
  sources: MatrixSource[];
  claims: MatrixClaim[];
  cells: MatrixCell[];
}

const TIER_COLORS: Record<string, string> = {
  FAR_LEFT: "var(--color-bias-far-left)",
  LEFT: "var(--color-bias-left)",
  CENTER_LEFT: "var(--color-bias-center-left)",
  CENTER: "var(--color-bias-center)",
  CENTER_RIGHT: "var(--color-bias-center-right)",
  RIGHT: "var(--color-bias-right)",
  FAR_RIGHT: "var(--color-bias-far-right)",
};

export default function ClaimMatrix({ sources, claims, cells }: ClaimMatrixProps) {
  if (sources.length === 0 || claims.length === 0) {
    return (
      <p className="text-xs text-ink-muted py-4 text-center">
        Not enough data for a claim matrix.
      </p>
    );
  }

  // Build lookup: claimId -> sourceIndex -> supports
  const lookup = new Map<string, Map<number, boolean | null>>();
  for (const cell of cells) {
    if (!lookup.has(cell.claimId)) lookup.set(cell.claimId, new Map());
    lookup.get(cell.claimId)!.set(cell.sourceIndex, cell.supports);
  }

  // Sort claims by convergence descending
  const sortedClaims = [...claims].sort(
    (a, b) => b.convergenceScore - a.convergenceScore
  );

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse text-[10px]">
        <caption className="sr-only">
          Claim verification matrix showing which sources support or contradict each claim
        </caption>
        <thead>
          <tr>
            <th className="sticky left-0 bg-paper z-10 text-left p-1 font-semibold text-ink-muted" scope="col">
              Claim
            </th>
            {sources.map((source, i) => (
              <th
                key={i}
                scope="col"
                className="p-1 font-normal text-center whitespace-nowrap"
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  height: "80px",
                }}
              >
                <span style={{ color: TIER_COLORS[source.biasTier] }}>
                  {source.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedClaims.map((claim) => (
            <tr key={claim.id} className="border-t border-border">
              <th
                scope="row"
                className="sticky left-0 bg-paper z-10 text-left p-1 font-normal text-ink max-w-[200px] truncate"
                title={claim.claimText}
              >
                {claim.claimText}
              </th>
              {sources.map((_, srcIdx) => {
                const value = lookup.get(claim.id)?.get(srcIdx) ?? null;
                return (
                  <td
                    key={srcIdx}
                    className="text-center p-0"
                  >
                    <div className="w-7 h-7 mx-auto flex items-center justify-center">
                      {value === true ? (
                        <Check
                          className="w-3.5 h-3.5 text-brand-green"
                          aria-label="Supports"
                        />
                      ) : value === false ? (
                        <X
                          className="w-3.5 h-3.5 text-brand-red"
                          aria-label="Contradicts"
                        />
                      ) : (
                        <Minus
                          className="w-3 h-3 text-ink-faint/30"
                          aria-label="No data"
                        />
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
