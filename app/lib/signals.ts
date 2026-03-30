// ============================================================
// Trust Signal Calculation
// Chunk 5: Real trust signal logic
// ============================================================

import { TrustSignal } from "~/types";

/**
 * Calculate the overall trust signal for a story based on
 * its claims' convergence scores and available primary sources.
 *
 * Hierarchy (highest wins):
 * 1. INSTITUTIONALLY_VALIDATED — institution acted + high convergence
 * 2. SOURCE_BACKED — primary docs + high convergence
 * 3. CONVERGED — cross-spectrum agreement (score >= 0.7)
 * 4. CONTESTED — multiple sources but disagreement or weak convergence (score >= 0.3)
 * 5. SINGLE_SOURCE — only one outlet reporting
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

  // Multi-source stories with any convergence data are CONTESTED
  // (sources covering the same event but not strongly agreeing on claims)
  return TrustSignal.CONTESTED;
}
