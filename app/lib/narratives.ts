// ============================================================
// Triangulate — Convergence Narratives Engine (Chunk 7.5)
// Auto-generated prose for converged stories
// ============================================================

import { BIAS_TIER_POSITION } from "./convergence";

interface NarrativeInput {
  convergenceScore: number;
  biasTiers: string[];
  regions: string[];
  claimCount: number;
  sourceCount: number;
  storyTitle: string;
}

const BIAS_TIER_LABELS: Record<string, string> = {
  FAR_LEFT: 'far-left', LEFT: 'left-leaning', CENTER_LEFT: 'center-left',
  CENTER: 'centrist', CENTER_RIGHT: 'center-right', RIGHT: 'right-leaning', FAR_RIGHT: 'far-right',
};

/**
 * Generate a human-readable convergence narrative for a story.
 */
export function generateConvergenceNarrative(input: NarrativeInput): string {
  const { convergenceScore, biasTiers, regions, claimCount, sourceCount } = input;
  const percent = Math.round(convergenceScore * 100);
  const parts: string[] = [];

  // Find the ideological extremes
  const tierOrder = Object.keys(BIAS_TIER_POSITION);
  const sortedTiers = biasTiers.sort((a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b));
  const widestLeft = sortedTiers[0];
  const widestRight = sortedTiers[sortedTiers.length - 1];

  if (convergenceScore >= 0.7) {
    // High convergence
    if (widestLeft && widestRight && tierOrder.indexOf(widestLeft) < 3 && tierOrder.indexOf(widestRight) > 3) {
      parts.push(
        `${BIAS_TIER_LABELS[widestLeft]} and ${BIAS_TIER_LABELS[widestRight]} sources confirm the same ${claimCount} factual claims at ${percent}% convergence.`
      );
    } else {
      parts.push(
        `${sourceCount} sources across ${biasTiers.length} bias tiers agree on ${claimCount} claims at ${percent}% convergence.`
      );
    }

    if (regions.length >= 3) {
      parts.push(`Coverage spans ${regions.length} global regions, strengthening cross-regional agreement.`);
    }
  } else if (convergenceScore >= 0.4) {
    // Medium convergence
    parts.push(
      `Partial agreement across ${biasTiers.length} bias tiers at ${percent}% convergence. ${claimCount} claims extracted from ${sourceCount} sources.`
    );
    if (biasTiers.length >= 4) {
      parts.push('Broad spectrum coverage suggests emerging consensus.');
    }
  } else {
    // Low convergence
    parts.push(
      `Limited convergence at ${percent}%. Sources across ${biasTiers.length} tiers disagree on key claims.`
    );
  }

  return parts.join(' ');
}

/**
 * Generate a one-line "surprise" narrative for Today's Surprise.
 */
export function generateSurpriseNarrative(
  widestLeftSource: string,
  widestRightSource: string,
  claimCount: number,
  topic: string,
  convergencePercent: number
): string {
  return `${widestLeftSource} and ${widestRightSource} agree on ${claimCount} facts about ${topic}. ${convergencePercent}% converged.`;
}
