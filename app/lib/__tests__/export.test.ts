import { describe, it, expect } from 'vitest';
import { storiesToCsv, claimsToCsv } from '../export/csv';
import { storiesToJson } from '../export/json-export';
import { generateVerificationHash, generateCertificate } from '../export/certificate';

describe('storiesToCsv', () => {
  const testStories = [
    {
      title: 'Test Story',
      trustSignal: 'CONVERGED',
      convergenceScore: 0.85,
      articleCount: 5,
      claimCount: 3,
      biasTiers: ['LEFT', 'CENTER', 'RIGHT'],
      regions: ['US', 'UK'],
      createdAt: '2026-03-25T00:00:00Z',
    },
  ];

  it('generates valid CSV with headers', () => {
    const csv = storiesToCsv(testStories);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Title');
    expect(lines[0]).toContain('Trust Signal');
    expect(lines.length).toBe(2); // header + 1 data row
  });

  it('escapes commas in values', () => {
    const csv = storiesToCsv([{
      ...testStories[0],
      title: 'Story with, comma',
    }]);
    expect(csv).toContain('"Story with, comma"');
  });
});

describe('claimsToCsv', () => {
  it('generates CSV for claims', () => {
    const csv = claimsToCsv([
      {
        claimText: 'Test claim',
        claimType: 'FACTUAL',
        convergenceScore: 0.9,
        supportingSources: ['CNN', 'BBC'],
        contradictingSources: ['Fox News'],
      },
    ], 'Test Story');

    expect(csv).toContain('Test claim');
    expect(csv).toContain('90%');
    expect(csv).toContain('CNN; BBC');
  });
});

describe('storiesToJson', () => {
  it('wraps stories in schema envelope', () => {
    const json = storiesToJson([{
      id: '123',
      title: 'Test',
      trustSignal: 'CONVERGED',
      convergenceScore: 0.85,
      articleCount: 5,
      claimCount: 3,
      biasTiers: ['LEFT', 'RIGHT'],
      regions: ['US'],
      createdAt: '2026-03-25T00:00:00Z',
    }]);

    const parsed = JSON.parse(json);
    expect(parsed.$schema).toBeTruthy();
    expect(parsed.version).toBe('1.0');
    expect(parsed.storyCount).toBe(1);
    expect(parsed.stories).toHaveLength(1);
  });
});

describe('generateVerificationHash', () => {
  it('generates a SHA-256 hex string', async () => {
    const hash = await generateVerificationHash('Test claim', 0.85, ['CNN', 'BBC']);
    expect(hash).toHaveLength(64); // SHA-256 = 32 bytes = 64 hex chars
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic', async () => {
    const hash1 = await generateVerificationHash('Claim', 0.5, ['A', 'B']);
    const hash2 = await generateVerificationHash('Claim', 0.5, ['A', 'B']);
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', async () => {
    const hash1 = await generateVerificationHash('Claim A', 0.5, ['A']);
    const hash2 = await generateVerificationHash('Claim B', 0.5, ['A']);
    expect(hash1).not.toBe(hash2);
  });
});

describe('generateCertificate', () => {
  it('generates a certificate with all fields', async () => {
    const cert = await generateCertificate(
      'Test claim',
      0.85,
      [{ name: 'CNN', biasTier: 'LEFT', region: 'US', supports: true }],
      'Test Story'
    );

    expect(cert.id).toHaveLength(12);
    expect(cert.claimText).toBe('Test claim');
    expect(cert.convergenceScore).toBe(0.85);
    expect(cert.sources).toHaveLength(1);
    expect(cert.storyTitle).toBe('Test Story');
    expect(cert.issuedAt).toBeTruthy();
    expect(cert.verificationHash).toHaveLength(64);
  });
});
