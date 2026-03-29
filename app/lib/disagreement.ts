// ============================================================
// Triangulate — Disagreement Classification (Chunk 7.6)
// Classifies disputes as IDEOLOGICAL, REGIONAL, INSTITUTIONAL, RANDOM
// ============================================================

export type DisagreementType = 'IDEOLOGICAL' | 'REGIONAL' | 'INSTITUTIONAL' | 'RANDOM';

interface DisputeSource {
  name: string;
  biasTier: string;
  region: string;
  supports: boolean;
}

interface DisagreementResult {
  type: DisagreementType;
  claimText: string;
  supportingSources: DisputeSource[];
  contradictingSources: DisputeSource[];
  narrative: string;
}

import { BIAS_TIER_POSITION as TIER_POSITION } from "./convergence";

/**
 * Classify a disputed claim's disagreement pattern.
 */
export function classifyDisagreement(
  claimText: string,
  sources: DisputeSource[]
): DisagreementResult {
  const supporting = sources.filter((s) => s.supports);
  const contradicting = sources.filter((s) => !s.supports);

  if (supporting.length === 0 || contradicting.length === 0) {
    return {
      type: 'RANDOM',
      claimText,
      supportingSources: supporting,
      contradictingSources: contradicting,
      narrative: 'No clear disagreement pattern detected.',
    };
  }

  // Check ideological split
  const supportPositions = supporting.map((s) => TIER_POSITION[s.biasTier] ?? 3);
  const contradictPositions = contradicting.map((s) => TIER_POSITION[s.biasTier] ?? 3);
  const avgSupportPos = supportPositions.reduce((a, b) => a + b, 0) / supportPositions.length;
  const avgContradictPos = contradictPositions.reduce((a, b) => a + b, 0) / contradictPositions.length;
  const ideologicalGap = Math.abs(avgSupportPos - avgContradictPos);

  // Check regional split
  const supportRegions = new Set(supporting.map((s) => s.region));
  const contradictRegions = new Set(contradicting.map((s) => s.region));
  const regionOverlap = [...supportRegions].filter((r) => contradictRegions.has(r)).length;
  const totalRegions = new Set([...supportRegions, ...contradictRegions]).size;
  const isRegionalSplit = regionOverlap === 0 && totalRegions >= 2;

  if (ideologicalGap >= 2) {
    const side = avgSupportPos < 3 ? 'left' : 'right';
    const otherSide = side === 'left' ? 'right' : 'left';
    return {
      type: 'IDEOLOGICAL',
      claimText,
      supportingSources: supporting,
      contradictingSources: contradicting,
      narrative: `This claim splits along ideological lines \u2014 ${side}-leaning sources support it, ${otherSide}-leaning sources dispute it.`,
    };
  }

  if (isRegionalSplit) {
    const supportRegionList = [...supportRegions].join(', ');
    const contradictRegionList = [...contradictRegions].join(', ');
    return {
      type: 'REGIONAL',
      claimText,
      supportingSources: supporting,
      contradictingSources: contradicting,
      narrative: `This claim splits along regional lines \u2014 supported by ${supportRegionList} outlets, disputed by ${contradictRegionList} outlets.`,
    };
  }

  return {
    type: 'RANDOM',
    claimText,
    supportingSources: supporting,
    contradictingSources: contradicting,
    narrative: 'Sources disagree on this claim without a clear ideological or regional pattern.',
  };
}
