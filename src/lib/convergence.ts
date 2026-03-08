// ============================================================
// Convergence Scoring Algorithm
// Full implementation in Chunk 5
// ============================================================

import { BiasCategory } from "@/types";

/**
 * Calculate convergence score based on ideological spread.
 * Cross-spectrum agreement weighs more than same-side confirmation.
 *
 * Scoring:
 * - Same-side confirmation (e.g., two LEFT sources): +0.2
 * - Adjacent confirmation (e.g., LEFT + CENTER_LEFT): +0.4
 * - Cross-center confirmation (e.g., LEFT + CENTER_RIGHT): +0.8
 * - Full-spectrum confirmation (LEFT + RIGHT): +1.0
 * - CENTER source confirming adds +0.3 always
 */
export function calculateConvergenceScore(
  confirmingBiases: BiasCategory[]
): number {
  // Placeholder - full implementation in Chunk 5
  const uniqueBiases = [...new Set(confirmingBiases)];

  if (uniqueBiases.length <= 1) return 0;
  if (uniqueBiases.length === 2) return 0.4;
  if (uniqueBiases.length === 3) return 0.7;
  if (uniqueBiases.length >= 4) return 0.9;

  return 0;
}
