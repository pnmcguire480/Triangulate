import { describe, it, expect } from 'vitest';
import { hasCapability, minimumTierFor, getCapabilities } from '../capabilities';

describe('hasCapability', () => {
  it('FREE tier has keyboard-shortcuts', () => {
    expect(hasCapability('FREE', 'keyboard-shortcuts')).toBe(true);
  });

  it('FREE tier does NOT have search', () => {
    expect(hasCapability('FREE', 'search')).toBe(false);
  });

  it('FREE tier does NOT have unlimited-stories', () => {
    expect(hasCapability('FREE', 'unlimited-stories')).toBe(false);
  });

  it('STANDARD tier has search and unlimited-stories', () => {
    expect(hasCapability('STANDARD', 'search')).toBe(true);
    expect(hasCapability('STANDARD', 'unlimited-stories')).toBe(true);
  });

  it('STANDARD tier does NOT have data-export-pdf', () => {
    expect(hasCapability('STANDARD', 'data-export-pdf')).toBe(false);
  });

  it('PREMIUM tier has all capabilities', () => {
    expect(hasCapability('PREMIUM', 'data-export-pdf')).toBe(true);
    expect(hasCapability('PREMIUM', 'claim-citation')).toBe(true);
    expect(hasCapability('PREMIUM', 'api-access')).toBe(true);
    expect(hasCapability('PREMIUM', 'convergence-certificate-whitelabel')).toBe(true);
  });
});

describe('minimumTierFor', () => {
  it('keyboard-shortcuts requires FREE', () => {
    expect(minimumTierFor('keyboard-shortcuts')).toBe('FREE');
  });

  it('search requires STANDARD', () => {
    expect(minimumTierFor('search')).toBe('STANDARD');
  });

  it('data-export-pdf requires PREMIUM', () => {
    expect(minimumTierFor('data-export-pdf')).toBe('PREMIUM');
  });
});

describe('getCapabilities', () => {
  it('returns a Set for each tier', () => {
    const free = getCapabilities('FREE');
    expect(free).toBeInstanceOf(Set);
    expect(free.size).toBeGreaterThan(0);
  });

  it('PREMIUM has more capabilities than STANDARD', () => {
    const standard = getCapabilities('STANDARD');
    const premium = getCapabilities('PREMIUM');
    expect(premium.size).toBeGreaterThan(standard.size);
  });
});
