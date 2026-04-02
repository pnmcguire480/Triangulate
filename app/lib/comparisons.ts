// ============================================================
// Triangulate — Comparative Story Cards (Chunk 10.5)
// Detect convergence shifts on same topic over time
// ============================================================

interface StorySnapshot {
  id: string;
  title: string;
  convergenceScore: number;
  claimCount: number;
  sourceCount: number;
  date: string;
}

export interface ComparisonResult {
  topic: string;
  previous: StorySnapshot;
  current: StorySnapshot;
  delta: number;       // convergenceScore change (-1 to +1)
  deltaPercent: number; // delta * 100
  direction: 'rising' | 'falling' | 'stable';
  narrative: string;
}

/**
 * Compare two story snapshots on the same topic.
 */
export function compareStories(
  topic: string,
  previous: StorySnapshot,
  current: StorySnapshot
): ComparisonResult {
  const delta = current.convergenceScore - previous.convergenceScore;
  const deltaPercent = Math.round(delta * 100);

  let direction: ComparisonResult['direction'] = 'stable';
  if (delta > 0.05) direction = 'rising';
  if (delta < -0.05) direction = 'falling';

  const narrative = direction === 'rising'
    ? `Convergence on "${topic}" rose from ${Math.round(previous.convergenceScore * 100)}% to ${Math.round(current.convergenceScore * 100)}%. Sources are increasingly agreeing on the facts.`
    : direction === 'falling'
    ? `Convergence on "${topic}" fell from ${Math.round(previous.convergenceScore * 100)}% to ${Math.round(current.convergenceScore * 100)}%. New information may be creating disagreement.`
    : `Convergence on "${topic}" remains stable at ${Math.round(current.convergenceScore * 100)}%.`;

  return {
    topic,
    previous,
    current,
    delta,
    deltaPercent,
    direction,
    narrative,
  };
}
