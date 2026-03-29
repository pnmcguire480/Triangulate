// ============================================================
// Convergence Scoring Algorithm
// Chunk 5: Real BiasTier-aware scoring
// ============================================================

// BiasTier positions on the ideological spectrum (0-6 scale)
// Used for calculating ideological distance between sources
export const BIAS_TIER_POSITION: Record<string, number> = {
  FAR_LEFT: 0,
  LEFT: 1,
  CENTER_LEFT: 2,
  CENTER: 3,
  CENTER_RIGHT: 4,
  RIGHT: 5,
  FAR_RIGHT: 6,
};

// Maximum possible distance on the 7-point scale
const MAX_DISTANCE = 6;

// Cap for fringe-only convergence (e.g., FAR_LEFT + FAR_RIGHT with no center)
const FRINGE_ONLY_CAP = 0.2;

/**
 * Calculate convergence score for a claim based on the BiasTiers
 * and Regions of the sources that confirm it.
 *
 * Scoring logic:
 * - Ideological spread: max pairwise distance between confirming tiers (0-6 → 0-1)
 * - Cross-center bonus: sources on BOTH sides of center → +0.15
 * - Center anchor bonus: at least one CENTER source → +0.1
 * - Region diversity bonus: sources from 2+ regions → +0.1
 * - Fringe-only cap: if ALL sources are FAR_LEFT/FAR_RIGHT, cap at 0.2
 *   (echo chamber guard — fringe outlets sometimes parrot each other)
 * - Source count diminishing returns: more sources help but with decreasing weight
 *
 * Returns: 0.0 to 1.0
 */
export function calculateConvergenceScore(
  confirmingTiers: string[],
  confirmingRegions: string[] = []
): number {
  const uniqueTiers = Array.from(new Set(confirmingTiers));

  // Single source or no data → no convergence
  if (uniqueTiers.length <= 1) return 0;

  const positions = uniqueTiers
    .map((t) => BIAS_TIER_POSITION[t])
    .filter((p) => p !== undefined);

  if (positions.length <= 1) return 0;

  // Fringe-only guard: if all sources are FAR_LEFT or FAR_RIGHT, cap score
  const allFringe = uniqueTiers.every(
    (t) => t === 'FAR_LEFT' || t === 'FAR_RIGHT'
  );

  // Base score: ideological spread (max distance / max possible distance)
  const minPos = Math.min(...positions);
  const maxPos = Math.max(...positions);
  const spreadScore = (maxPos - minPos) / MAX_DISTANCE;

  // Cross-center bonus: sources on both sides of center (position 3)
  const hasLeft = positions.some((p) => p < 3);
  const hasRight = positions.some((p) => p > 3);
  const crossCenterBonus = hasLeft && hasRight ? 0.15 : 0;

  // Center anchor bonus: at least one CENTER source
  const hasCenterAnchor = positions.includes(3);
  const centerBonus = hasCenterAnchor ? 0.1 : 0;

  // Region diversity bonus
  const uniqueRegions = new Set(confirmingRegions);
  const regionBonus = uniqueRegions.size >= 2 ? 0.1 : 0;

  // Source count factor: diminishing returns (2 sources = 0.7x, 3 = 0.85x, 4+ = 1.0x)
  const sourceCount = confirmingTiers.length;
  const countFactor = sourceCount >= 4 ? 1.0 : sourceCount === 3 ? 0.85 : 0.7;

  // Combine
  let score = (spreadScore + crossCenterBonus + centerBonus + regionBonus) * countFactor;

  // Apply fringe-only cap
  if (allFringe) {
    score = Math.min(score, FRINGE_ONLY_CAP);
  }

  // Clamp to 0-1
  return Math.round(Math.min(1, Math.max(0, score)) * 100) / 100;
}

/**
 * Determine if a claim is contested — sources disagree on it.
 * A claim is contested if at least one source supports it
 * and at least one source contradicts it.
 */
export function isContested(
  supportFlags: boolean[]
): boolean {
  const hasSupport = supportFlags.some((s) => s);
  const hasContradict = supportFlags.some((s) => !s);
  return hasSupport && hasContradict;
}
