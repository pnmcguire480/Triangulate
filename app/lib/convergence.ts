// ============================================================
// Convergence Scoring Algorithm v2
// Superlinear ideological distance weighting +
// Cross-regional information independence matrix
// ============================================================

// BiasTier positions on signed scale (-3 to +3)
// Superlinear distance: |pos_i - pos_j|^1.5
// FAR_LEFT + FAR_RIGHT agreement weighs 14.7x more than adjacent tiers
export const BIAS_TIER_POSITION: Record<string, number> = {
  FAR_LEFT: -3,
  LEFT: -2,
  CENTER_LEFT: -1,
  CENTER: 0,
  CENTER_RIGHT: 1,
  RIGHT: 2,
  FAR_RIGHT: 3,
};

// Legacy 0-6 positions for backward compatibility with tests/UI
export const BIAS_TIER_POSITION_LEGACY: Record<string, number> = {
  FAR_LEFT: 0,
  LEFT: 1,
  CENTER_LEFT: 2,
  CENTER: 3,
  CENTER_RIGHT: 4,
  RIGHT: 5,
  FAR_RIGHT: 6,
};

// Maximum possible distance on signed scale
const MAX_DISTANCE = 6;

// Superlinear exponent: agreement between distant sources is exponentially more valuable
const DISTANCE_EXPONENT = 1.5;

// Cap for fringe-only convergence (e.g., FAR_LEFT + FAR_RIGHT with no center)
const FRINGE_ONLY_CAP = 0.15;

// ============================================================
// Cross-Regional Information Independence Matrix
// Higher = more independent media ecosystems = stronger signal
// US+Canada share media; US+Middle East are independent
// Wire services (GLOBAL) get lower weights (same content redistributed)
// ============================================================

type RegionKey = string;

const REGION_INDEPENDENCE: Record<RegionKey, Record<RegionKey, number>> = {
  US:           { US: 0, UK: 0.3, EUROPE: 0.5, MIDDLE_EAST: 0.9, ASIA_PACIFIC: 0.8, CANADA: 0.2, LATIN_AMERICA: 0.7, AFRICA: 0.8, OCEANIA: 0.6, GLOBAL: 0.4 },
  UK:           { US: 0.3, UK: 0, EUROPE: 0.4, MIDDLE_EAST: 0.8, ASIA_PACIFIC: 0.7, CANADA: 0.4, LATIN_AMERICA: 0.7, AFRICA: 0.6, OCEANIA: 0.5, GLOBAL: 0.3 },
  EUROPE:       { US: 0.5, UK: 0.4, EUROPE: 0, MIDDLE_EAST: 0.7, ASIA_PACIFIC: 0.6, CANADA: 0.5, LATIN_AMERICA: 0.6, AFRICA: 0.5, OCEANIA: 0.5, GLOBAL: 0.3 },
  MIDDLE_EAST:  { US: 0.9, UK: 0.8, EUROPE: 0.7, MIDDLE_EAST: 0, ASIA_PACIFIC: 0.6, CANADA: 0.9, LATIN_AMERICA: 0.8, AFRICA: 0.5, OCEANIA: 0.7, GLOBAL: 0.5 },
  ASIA_PACIFIC:  { US: 0.8, UK: 0.7, EUROPE: 0.6, MIDDLE_EAST: 0.6, ASIA_PACIFIC: 0, CANADA: 0.8, LATIN_AMERICA: 0.7, AFRICA: 0.6, OCEANIA: 0.4, GLOBAL: 0.4 },
  CANADA:       { US: 0.2, UK: 0.4, EUROPE: 0.5, MIDDLE_EAST: 0.9, ASIA_PACIFIC: 0.8, CANADA: 0, LATIN_AMERICA: 0.6, AFRICA: 0.8, OCEANIA: 0.6, GLOBAL: 0.4 },
  LATIN_AMERICA: { US: 0.7, UK: 0.7, EUROPE: 0.6, MIDDLE_EAST: 0.8, ASIA_PACIFIC: 0.7, CANADA: 0.6, LATIN_AMERICA: 0, AFRICA: 0.6, OCEANIA: 0.7, GLOBAL: 0.4 },
  AFRICA:       { US: 0.8, UK: 0.6, EUROPE: 0.5, MIDDLE_EAST: 0.5, ASIA_PACIFIC: 0.6, CANADA: 0.8, LATIN_AMERICA: 0.6, AFRICA: 0, OCEANIA: 0.6, GLOBAL: 0.4 },
  OCEANIA:      { US: 0.6, UK: 0.5, EUROPE: 0.5, MIDDLE_EAST: 0.7, ASIA_PACIFIC: 0.4, CANADA: 0.6, LATIN_AMERICA: 0.7, AFRICA: 0.6, OCEANIA: 0, GLOBAL: 0.4 },
  GLOBAL:       { US: 0.4, UK: 0.3, EUROPE: 0.3, MIDDLE_EAST: 0.5, ASIA_PACIFIC: 0.4, CANADA: 0.4, LATIN_AMERICA: 0.4, AFRICA: 0.4, OCEANIA: 0.4, GLOBAL: 0 },
};

function getRegionIndependence(r1: string, r2: string): number {
  return REGION_INDEPENDENCE[r1]?.[r2] ?? 0.5;
}

/**
 * Superlinear ideological distance weight for a pair of sources.
 * |distance|^1.5 means FAR_LEFT + FAR_RIGHT (distance=6) = 14.7x
 * while LEFT + CENTER_LEFT (distance=1) = 1.0x
 */
function ideologicalWeight(tier1: string, tier2: string): number {
  const p1 = BIAS_TIER_POSITION[tier1];
  const p2 = BIAS_TIER_POSITION[tier2];
  if (p1 === undefined || p2 === undefined) return 0;
  const distance = Math.abs(p1 - p2);
  if (distance === 0) return 0;
  return Math.pow(distance, DISTANCE_EXPONENT);
}

/**
 * Calculate convergence score for a claim based on the BiasTiers
 * and Regions of the sources that confirm it.
 *
 * v2 scoring:
 * - Pairwise superlinear ideological distance weighting (alpha=1.5)
 * - Cross-regional information independence matrix
 * - Center anchor bonus
 * - Fringe-only cap (stricter at 0.15)
 * - Normalized by maximum possible score for this source set
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

  // Fringe-only guard
  const allFringe = uniqueTiers.every(
    (t) => t === 'FAR_LEFT' || t === 'FAR_RIGHT'
  );

  // Build source profiles
  const sources = confirmingTiers.map((tier, i) => ({
    tier,
    region: confirmingRegions[i] || 'US',
  }));

  // Max ideological weight for a single pair (used for normalization)
  const maxIdeoWeight = Math.pow(MAX_DISTANCE, DISTANCE_EXPONENT); // 14.7

  // Find the best ideological pair and total regional bonus
  let bestIdeoWeight = 0;
  let totalRegionBonus = 0;
  let pairCount = 0;

  for (let i = 0; i < sources.length; i++) {
    for (let j = i + 1; j < sources.length; j++) {
      const ideoW = ideologicalWeight(sources[i].tier, sources[j].tier);
      const regionIndep = getRegionIndependence(sources[i].region, sources[j].region);

      if (ideoW > bestIdeoWeight) bestIdeoWeight = ideoW;
      totalRegionBonus += regionIndep;
      pairCount++;
    }
  }

  // Base score from best ideological pair (0-1 scale)
  let score = bestIdeoWeight / maxIdeoWeight;

  // Regional independence bonus: average across all pairs, scaled to 0-0.15
  if (pairCount > 0) {
    const avgRegionIndep = totalRegionBonus / pairCount;
    score += avgRegionIndep * 0.15;
  }

  // Additional ideological pairs add value (spectrum coverage beyond best pair)
  if (pairCount > 1) {
    // Count how many unique tier positions are represented
    const uniquePositions = new Set(positions);
    const spectrumCoverage = uniquePositions.size / 7; // 7 possible tiers
    score += spectrumCoverage * 0.15;
  }

  // Center anchor bonus: at least one CENTER source adds credibility
  const hasCenterAnchor = uniqueTiers.includes('CENTER');
  if (hasCenterAnchor) {
    score = Math.min(1, score + 0.1);
  }

  // Source count factor: more sources = more confidence (diminishing)
  const sourceCount = confirmingTiers.length;
  const countFactor = sourceCount >= 5 ? 1.0 : sourceCount === 4 ? 0.95 : sourceCount === 3 ? 0.85 : 0.7;
  score *= countFactor;

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
