import { describe, it, expect } from 'vitest';
import { compareStories } from '../comparisons';

describe('compareStories', () => {
  const previous = {
    id: '1',
    title: 'Climate Story v1',
    convergenceScore: 0.23,
    claimCount: 3,
    sourceCount: 5,
    date: '2026-03-01',
  };

  const current = {
    id: '2',
    title: 'Climate Story v2',
    convergenceScore: 0.87,
    claimCount: 5,
    sourceCount: 8,
    date: '2026-03-25',
  };

  it('detects rising convergence', () => {
    const result = compareStories('climate policy', previous, current);
    expect(result.direction).toBe('rising');
    expect(result.delta).toBeGreaterThan(0);
    expect(result.narrative).toContain('rose');
  });

  it('detects falling convergence', () => {
    const result = compareStories('climate policy', current, previous);
    expect(result.direction).toBe('falling');
    expect(result.delta).toBeLessThan(0);
    expect(result.narrative).toContain('fell');
  });

  it('detects stable convergence', () => {
    const stableB = { ...current, convergenceScore: 0.25 };
    const result = compareStories('climate policy', previous, stableB);
    expect(result.direction).toBe('stable');
    expect(result.narrative).toContain('stable');
  });

  it('calculates delta percentage correctly', () => {
    const result = compareStories('test', previous, current);
    expect(result.deltaPercent).toBe(64); // 87 - 23 = 64
  });
});
