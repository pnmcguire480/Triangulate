import { describe, it, expect } from 'vitest';
import { classifyDisagreement } from '../disagreement';

describe('classifyDisagreement', () => {
  it('classifies ideological split correctly', () => {
    const result = classifyDisagreement('Test claim', [
      { name: 'CNN', biasTier: 'LEFT', region: 'US', supports: true },
      { name: 'MSNBC', biasTier: 'LEFT', region: 'US', supports: true },
      { name: 'Fox News', biasTier: 'RIGHT', region: 'US', supports: false },
      { name: 'Daily Wire', biasTier: 'FAR_RIGHT', region: 'US', supports: false },
    ]);

    expect(result.type).toBe('IDEOLOGICAL');
    expect(result.narrative).toContain('ideological');
    expect(result.supportingSources).toHaveLength(2);
    expect(result.contradictingSources).toHaveLength(2);
  });

  it('classifies regional split correctly', () => {
    const result = classifyDisagreement('Test claim', [
      { name: 'BBC', biasTier: 'CENTER', region: 'UK', supports: true },
      { name: 'The Guardian', biasTier: 'CENTER_LEFT', region: 'UK', supports: true },
      { name: 'Al Jazeera', biasTier: 'CENTER', region: 'MIDDLE_EAST', supports: false },
    ]);

    expect(result.type).toBe('REGIONAL');
    expect(result.narrative).toContain('regional');
  });

  it('classifies random disagreement when no clear pattern', () => {
    const result = classifyDisagreement('Test claim', [
      { name: 'NYT', biasTier: 'CENTER_LEFT', region: 'US', supports: true },
      { name: 'AP', biasTier: 'CENTER', region: 'US', supports: false },
    ]);

    expect(result.type).toBe('RANDOM');
  });

  it('handles no contradiction', () => {
    const result = classifyDisagreement('Test claim', [
      { name: 'CNN', biasTier: 'LEFT', region: 'US', supports: true },
      { name: 'Fox', biasTier: 'RIGHT', region: 'US', supports: true },
    ]);

    expect(result.type).toBe('RANDOM');
    expect(result.contradictingSources).toHaveLength(0);
  });
});
