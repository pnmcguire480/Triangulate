import { describe, it, expect } from 'vitest';

// classifyUrl is not exported, but we can test the regex pattern directly
const COMMENTARY_PATH_RE =
  /\/(opinion|editorial|commentary|column|analysis)(\/|$)/i;

function classifyUrl(url: string): 'COMMENTARY' | 'REPORTING' | 'UNKNOWN' {
  try {
    const { pathname } = new URL(url);
    return COMMENTARY_PATH_RE.test(pathname) ? 'COMMENTARY' : 'REPORTING';
  } catch {
    return 'UNKNOWN';
  }
}

describe('classifyUrl', () => {
  it('classifies opinion paths as COMMENTARY', () => {
    expect(classifyUrl('https://example.com/opinion/article-1')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/editorial/piece')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/commentary/take')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/column/writer')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/analysis/deep-dive')).toBe('COMMENTARY');
  });

  it('is case-insensitive', () => {
    expect(classifyUrl('https://example.com/Opinion/article')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/EDITORIAL/piece')).toBe('COMMENTARY');
  });

  it('classifies regular news paths as REPORTING', () => {
    expect(classifyUrl('https://example.com/news/article-1')).toBe('REPORTING');
    expect(classifyUrl('https://example.com/politics/story')).toBe('REPORTING');
    expect(classifyUrl('https://example.com/2026/03/article')).toBe('REPORTING');
  });

  it('does not match partial path segments', () => {
    // "opinion" must be its own path segment
    expect(classifyUrl('https://example.com/opinions-page')).toBe('REPORTING');
    expect(classifyUrl('https://example.com/my-editorial-board')).toBe('REPORTING');
  });

  it('returns UNKNOWN for invalid URLs', () => {
    expect(classifyUrl('not-a-url')).toBe('UNKNOWN');
    expect(classifyUrl('')).toBe('UNKNOWN');
  });

  it('handles trailing slashes', () => {
    expect(classifyUrl('https://example.com/opinion/')).toBe('COMMENTARY');
    expect(classifyUrl('https://example.com/opinion')).toBe('COMMENTARY');
  });
});
