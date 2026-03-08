// ============================================================
// Trust Signal Calculation
// Full implementation in Chunk 5
// ============================================================

import { TrustSignal } from "@/types";

/**
 * Calculate the overall trust signal for a story based on
 * its claims' convergence scores and available primary sources.
 */
export function calculateTrustSignal(
  highestConvergenceScore: number,
  hasPrimarySource: boolean,
  hasInstitutionalAction: boolean,
  articleCount: number
): TrustSignal {
  if (articleCount <= 1) return TrustSignal.SINGLE_SOURCE;

  if (hasInstitutionalAction && highestConvergenceScore >= 0.7)
    return TrustSignal.INSTITUTIONALLY_VALIDATED;

  if (hasPrimarySource && highestConvergenceScore >= 0.7)
    return TrustSignal.SOURCE_BACKED;

  if (highestConvergenceScore >= 0.7) return TrustSignal.CONVERGED;

  if (highestConvergenceScore >= 0.3) return TrustSignal.CONTESTED;

  return TrustSignal.SINGLE_SOURCE;
}
