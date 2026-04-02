import { describe, it, expect } from 'vitest';
import { calculateConvergenceScore, isContested } from '../convergence';

describe('calculateConvergenceScore', () => {
  // --- Edge cases ---

  it('returns 0 for a single source', () => {
    expect(calculateConvergenceScore(['CENTER'])).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(calculateConvergenceScore([])).toBe(0);
  });

  it('returns 0 for duplicate tiers (same-side only)', () => {
    // Two LEFT sources = only 1 unique tier
    expect(calculateConvergenceScore(['LEFT', 'LEFT'])).toBe(0);
  });

  // --- Same-side confirmation (low scores) ---

  it('scores low for adjacent same-side tiers (LEFT + CENTER_LEFT)', () => {
    const score = calculateConvergenceScore(['LEFT', 'CENTER_LEFT']);
    expect(score).toBeLessThan(0.3);
  });

  it('scores low for adjacent same-side tiers (RIGHT + CENTER_RIGHT)', () => {
    const score = calculateConvergenceScore(['RIGHT', 'CENTER_RIGHT']);
    expect(score).toBeLessThan(0.3);
  });

  // --- Cross-center confirmation (high scores) ---

  it('scores moderate for cross-center pair (LEFT + RIGHT)', () => {
    const score = calculateConvergenceScore(['LEFT', 'RIGHT']);
    // Distance 4/6 superlinear, but countFactor 0.7 for only 2 sources
    expect(score).toBeGreaterThanOrEqual(0.35);
    expect(score).toBeLessThan(0.7);
  });

  it('scores higher for full spectrum (FAR_LEFT + FAR_RIGHT)', () => {
    const score = calculateConvergenceScore(['FAR_LEFT', 'FAR_RIGHT', 'CENTER']);
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('scores highest for full spread with many sources', () => {
    const score = calculateConvergenceScore([
      'FAR_LEFT', 'LEFT', 'CENTER', 'RIGHT', 'FAR_RIGHT',
    ]);
    expect(score).toBeGreaterThanOrEqual(0.9);
  });

  // --- CENTER anchor bonus ---

  it('gives bonus when CENTER source is present', () => {
    const withCenter = calculateConvergenceScore(['LEFT', 'CENTER', 'RIGHT']);
    const withoutCenter = calculateConvergenceScore(['LEFT', 'CENTER_LEFT', 'RIGHT']);
    expect(withCenter).toBeGreaterThan(withoutCenter);
  });

  // --- Cross-center bonus ---

  it('gives bonus for sources on both sides of center', () => {
    const crossCenter = calculateConvergenceScore(['LEFT', 'RIGHT']);
    const sameSide = calculateConvergenceScore(['LEFT', 'CENTER_LEFT']);
    expect(crossCenter).toBeGreaterThan(sameSide);
  });

  // --- Region diversity bonus ---

  it('gives bonus for multi-region confirmation', () => {
    const multiRegion = calculateConvergenceScore(
      ['LEFT', 'RIGHT'],
      ['US', 'UK']
    );
    const sameRegion = calculateConvergenceScore(
      ['LEFT', 'RIGHT'],
      ['US', 'US']
    );
    expect(multiRegion).toBeGreaterThan(sameRegion);
  });

  it('gives region bonus for 3+ regions', () => {
    const score = calculateConvergenceScore(
      ['LEFT', 'CENTER', 'RIGHT'],
      ['US', 'UK', 'MIDDLE_EAST']
    );
    // 3 sources = countFactor 0.85, but region + center bonus still pushes above 0.6
    expect(score).toBeGreaterThanOrEqual(0.6);
  });

  // --- Fringe-only cap (AC-4: same-side-only < 0.3) ---

  it('caps fringe-only convergence (FAR_LEFT + FAR_RIGHT)', () => {
    const score = calculateConvergenceScore(['FAR_LEFT', 'FAR_RIGHT']);
    expect(score).toBeLessThanOrEqual(0.15);
  });

  it('does not cap when non-fringe tier is present', () => {
    const score = calculateConvergenceScore(['FAR_LEFT', 'CENTER', 'FAR_RIGHT']);
    expect(score).toBeGreaterThan(0.2);
  });

  // --- Source count diminishing returns ---

  it('scores higher with more sources confirming', () => {
    const two = calculateConvergenceScore(['LEFT', 'RIGHT']);
    const four = calculateConvergenceScore(['LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT']);
    expect(four).toBeGreaterThan(two);
  });

  // --- Score bounds ---

  it('never exceeds 1.0', () => {
    const score = calculateConvergenceScore(
      ['FAR_LEFT', 'LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT', 'FAR_RIGHT'],
      ['US', 'UK', 'EUROPE', 'MIDDLE_EAST', 'ASIA_PACIFIC', 'CANADA', 'GLOBAL']
    );
    expect(score).toBeLessThanOrEqual(1.0);
  });

  it('never goes below 0', () => {
    const score = calculateConvergenceScore(['CENTER']);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  // --- Acceptance criteria ---

  it('AC-3: cross-spectrum claims score as CONVERGED (>= 0.7)', () => {
    // LEFT + CENTER + RIGHT from different regions
    const score = calculateConvergenceScore(
      ['LEFT', 'CENTER', 'RIGHT', 'LEFT'],
      ['US', 'UK', 'EUROPE', 'CANADA']
    );
    expect(score).toBeGreaterThanOrEqual(0.7);
  });

  it('AC-4: same-side-only claims score low (< 0.3)', () => {
    // Two adjacent left-leaning sources, same region
    const score = calculateConvergenceScore(
      ['LEFT', 'CENTER_LEFT'],
      ['US', 'US']
    );
    expect(score).toBeLessThan(0.3);
  });
});

describe('isContested', () => {
  it('returns false when all sources support', () => {
    expect(isContested([true, true, true])).toBe(false);
  });

  it('returns false when all sources contradict', () => {
    expect(isContested([false, false])).toBe(false);
  });

  it('returns true when sources disagree', () => {
    expect(isContested([true, false, true])).toBe(true);
  });

  it('returns false for single source', () => {
    expect(isContested([true])).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isContested([])).toBe(false);
  });
});
