import { describe, it, expect } from 'vitest';
import { parseUsageCookie, getTodayUsage, setUsageCookie, MAX_FREE_STORIES } from '../usage-tracking';

describe('parseUsageCookie', () => {
  it('returns empty for null', () => {
    const result = parseUsageCookie(null);
    expect(result.date).toBe('');
    expect(result.stories).toBe(0);
  });

  it('parses valid cookie', () => {
    const today = new Date().toISOString().slice(0, 10);
    const cookie = `tri-usage=${encodeURIComponent(JSON.stringify({ date: today, stories: 3 }))}`;
    const result = parseUsageCookie(cookie);
    expect(result.date).toBe(today);
    expect(result.stories).toBe(3);
  });

  it('handles malformed cookie', () => {
    const result = parseUsageCookie('tri-usage=invalid');
    expect(result.date).toBe('');
    expect(result.stories).toBe(0);
  });
});

describe('getTodayUsage', () => {
  it('returns 0 stories viewed for new user', () => {
    const result = getTodayUsage(null);
    expect(result.storiesViewed).toBe(0);
    expect(result.remaining).toBe(MAX_FREE_STORIES);
    expect(result.isLimited).toBe(false);
  });

  it('returns limited when at max', () => {
    const today = new Date().toISOString().slice(0, 10);
    const cookie = `tri-usage=${encodeURIComponent(JSON.stringify({ date: today, stories: 5 }))}`;
    const result = getTodayUsage(cookie);
    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('resets count for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const cookie = `tri-usage=${encodeURIComponent(JSON.stringify({ date: yesterday, stories: 5 }))}`;
    const result = getTodayUsage(cookie);
    expect(result.storiesViewed).toBe(0);
    expect(result.isLimited).toBe(false);
  });
});

describe('setUsageCookie', () => {
  it('generates a valid Set-Cookie string', () => {
    const cookie = setUsageCookie(3);
    expect(cookie).toContain('tri-usage=');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('SameSite=Lax');
  });
});
