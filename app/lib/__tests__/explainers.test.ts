import { describe, it, expect } from 'vitest';
import {
  getConvergenceExplainer,
  getGCIExplainer,
  getSourceCountExplainer,
  TRUST_SIGNAL_EXPLAINERS,
} from '../explainers';

describe('getConvergenceExplainer', () => {
  it('returns near-total for >= 0.9', () => {
    const result = getConvergenceExplainer(0.95);
    expect(result.short).toContain('Near-total');
    expect(result.benchmark).toBeTruthy();
  });

  it('returns strong for >= 0.7', () => {
    const result = getConvergenceExplainer(0.75);
    expect(result.short).toContain('Strong');
  });

  it('returns moderate for >= 0.4', () => {
    const result = getConvergenceExplainer(0.55);
    expect(result.short).toContain('Moderate');
  });

  it('returns limited for >= 0.2', () => {
    const result = getConvergenceExplainer(0.25);
    expect(result.short).toContain('Limited');
  });

  it('returns very low for < 0.2', () => {
    const result = getConvergenceExplainer(0.1);
    expect(result.short).toContain('Very low');
  });

  it('always returns short, long, and optionally benchmark', () => {
    for (const score of [0, 0.1, 0.3, 0.5, 0.8, 1.0]) {
      const result = getConvergenceExplainer(score);
      expect(result.short.length).toBeGreaterThan(0);
      expect(result.long.length).toBeGreaterThan(0);
    }
  });
});

describe('getGCIExplainer', () => {
  it('returns high for >= 0.7', () => {
    const result = getGCIExplainer(0.8);
    expect(result.short).toContain('High');
  });

  it('returns moderate for >= 0.4', () => {
    const result = getGCIExplainer(0.5);
    expect(result.short).toContain('Moderate');
  });

  it('returns low for < 0.4', () => {
    const result = getGCIExplainer(0.2);
    expect(result.short).toContain('Low');
  });
});

describe('getSourceCountExplainer', () => {
  it('returns very high for >= 10', () => {
    const result = getSourceCountExplainer(15);
    expect(result.short).toContain('very high');
  });

  it('returns solid for >= 5', () => {
    const result = getSourceCountExplainer(7);
    expect(result.short).toContain('solid');
  });

  it('returns limited for >= 2', () => {
    const result = getSourceCountExplainer(3);
    expect(result.short).toContain('limited');
  });

  it('returns single source for 1', () => {
    const result = getSourceCountExplainer(1);
    expect(result.short).toContain('Single source');
  });
});

describe('TRUST_SIGNAL_EXPLAINERS', () => {
  it('has entries for all 5 trust signals', () => {
    expect(Object.keys(TRUST_SIGNAL_EXPLAINERS)).toHaveLength(5);
    expect(TRUST_SIGNAL_EXPLAINERS.SINGLE_SOURCE).toBeTruthy();
    expect(TRUST_SIGNAL_EXPLAINERS.CONTESTED).toBeTruthy();
    expect(TRUST_SIGNAL_EXPLAINERS.CONVERGED).toBeTruthy();
    expect(TRUST_SIGNAL_EXPLAINERS.SOURCE_BACKED).toBeTruthy();
    expect(TRUST_SIGNAL_EXPLAINERS.INSTITUTIONALLY_VALIDATED).toBeTruthy();
  });

  it('each entry has short and long text', () => {
    for (const [, entry] of Object.entries(TRUST_SIGNAL_EXPLAINERS)) {
      expect(entry.short.length).toBeGreaterThan(0);
      expect(entry.long.length).toBeGreaterThan(0);
    }
  });
});
