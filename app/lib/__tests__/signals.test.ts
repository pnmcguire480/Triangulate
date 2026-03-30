import { describe, it, expect } from 'vitest';
import { calculateTrustSignal } from '../signals';
import { TrustSignal } from '~/types';

describe('calculateTrustSignal', () => {
  // --- SINGLE_SOURCE ---

  it('returns SINGLE_SOURCE for 1 article', () => {
    expect(calculateTrustSignal(0.9, true, true, 1)).toBe(TrustSignal.SINGLE_SOURCE);
  });

  it('returns SINGLE_SOURCE for 0 articles', () => {
    expect(calculateTrustSignal(0, false, false, 0)).toBe(TrustSignal.SINGLE_SOURCE);
  });

  // --- CONTESTED ---

  it('returns CONTESTED for multi-source with low convergence', () => {
    expect(calculateTrustSignal(0.3, false, false, 3)).toBe(TrustSignal.CONTESTED);
  });

  it('returns CONTESTED for multi-source with zero convergence', () => {
    expect(calculateTrustSignal(0, false, false, 5)).toBe(TrustSignal.CONTESTED);
  });

  it('returns CONTESTED for moderate convergence without primary docs', () => {
    expect(calculateTrustSignal(0.5, false, false, 4)).toBe(TrustSignal.CONTESTED);
  });

  // --- CONVERGED ---

  it('returns CONVERGED for high convergence (>= 0.7)', () => {
    expect(calculateTrustSignal(0.7, false, false, 3)).toBe(TrustSignal.CONVERGED);
  });

  it('returns CONVERGED for very high convergence', () => {
    expect(calculateTrustSignal(0.95, false, false, 5)).toBe(TrustSignal.CONVERGED);
  });

  // --- SOURCE_BACKED ---

  it('returns SOURCE_BACKED when primary doc + high convergence', () => {
    expect(calculateTrustSignal(0.8, true, false, 4)).toBe(TrustSignal.SOURCE_BACKED);
  });

  it('returns CONTESTED when primary doc but low convergence', () => {
    // Primary doc alone isn't enough — need convergence too
    expect(calculateTrustSignal(0.3, true, false, 3)).toBe(TrustSignal.CONTESTED);
  });

  // --- INSTITUTIONALLY_VALIDATED ---

  it('returns INSTITUTIONALLY_VALIDATED when institutional action + high convergence', () => {
    expect(calculateTrustSignal(0.8, false, true, 5)).toBe(TrustSignal.INSTITUTIONALLY_VALIDATED);
  });

  it('returns INSTITUTIONALLY_VALIDATED over SOURCE_BACKED when both present', () => {
    // Institutional action takes priority
    expect(calculateTrustSignal(0.9, true, true, 5)).toBe(TrustSignal.INSTITUTIONALLY_VALIDATED);
  });

  it('returns CONTESTED when institutional action but low convergence', () => {
    expect(calculateTrustSignal(0.4, false, true, 3)).toBe(TrustSignal.CONTESTED);
  });

  // --- Hierarchy verification ---

  it('hierarchy: INSTITUTIONALLY_VALIDATED > SOURCE_BACKED > CONVERGED > CONTESTED > SINGLE_SOURCE', () => {
    const iv = calculateTrustSignal(0.9, true, true, 5);
    const sb = calculateTrustSignal(0.9, true, false, 5);
    const conv = calculateTrustSignal(0.9, false, false, 5);
    const cont = calculateTrustSignal(0.4, false, false, 5);
    const ss = calculateTrustSignal(0, false, false, 1);

    // Each should be a different signal
    expect(iv).toBe(TrustSignal.INSTITUTIONALLY_VALIDATED);
    expect(sb).toBe(TrustSignal.SOURCE_BACKED);
    expect(conv).toBe(TrustSignal.CONVERGED);
    expect(cont).toBe(TrustSignal.CONTESTED);
    expect(ss).toBe(TrustSignal.SINGLE_SOURCE);
  });
});
