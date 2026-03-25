import { describe, it, expect } from 'vitest';
import { generateConvergenceNarrative, generateSurpriseNarrative } from '../narratives';

describe('generateConvergenceNarrative', () => {
  it('generates high convergence narrative for cross-spectrum agreement', () => {
    const result = generateConvergenceNarrative({
      convergenceScore: 0.85,
      biasTiers: ['LEFT', 'CENTER', 'RIGHT'],
      regions: ['US', 'UK', 'EUROPE'],
      claimCount: 5,
      sourceCount: 8,
      storyTitle: 'Test Story',
    });

    expect(result).toContain('85%');
    expect(result).toContain('regions');
  });

  it('generates medium convergence narrative', () => {
    const result = generateConvergenceNarrative({
      convergenceScore: 0.55,
      biasTiers: ['LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT'],
      regions: ['US'],
      claimCount: 3,
      sourceCount: 4,
      storyTitle: 'Test Story',
    });

    expect(result).toContain('55%');
    expect(result).toContain('Partial');
  });

  it('generates low convergence narrative', () => {
    const result = generateConvergenceNarrative({
      convergenceScore: 0.15,
      biasTiers: ['LEFT', 'RIGHT'],
      regions: ['US'],
      claimCount: 2,
      sourceCount: 3,
      storyTitle: 'Test Story',
    });

    expect(result).toContain('15%');
    expect(result).toContain('Limited');
  });
});

describe('generateSurpriseNarrative', () => {
  it('generates a surprise narrative', () => {
    const result = generateSurpriseNarrative(
      'Fox News', 'The Guardian', 4, 'climate policy', 91
    );

    expect(result).toContain('Fox News');
    expect(result).toContain('The Guardian');
    expect(result).toContain('4 facts');
    expect(result).toContain('91%');
  });
});
