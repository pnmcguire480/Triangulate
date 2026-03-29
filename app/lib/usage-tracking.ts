// ============================================================
// Triangulate — Usage Tracking (Chunk 8.4)
// Tracks daily story views for free tier limits
// ============================================================

const COOKIE_NAME = 'tri-usage';
const MAX_FREE_STORIES = 5;

interface UsageData {
  date: string;   // YYYY-MM-DD
  stories: number;
}

/**
 * Parse usage data from cookie.
 */
export function parseUsageCookie(cookieHeader: string | null): UsageData {
  if (!cookieHeader) return { date: '', stories: 0 };

  const match = cookieHeader.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return { date: '', stories: 0 };

  try {
    const value = decodeURIComponent(match.split('=')[1]);
    return JSON.parse(value);
  } catch {
    return { date: '', stories: 0 };
  }
}

/**
 * Get current usage for today.
 */
export function getTodayUsage(cookieHeader: string | null): { storiesViewed: number; remaining: number; isLimited: boolean } {
  const today = new Date().toISOString().slice(0, 10);
  const usage = parseUsageCookie(cookieHeader);

  const storiesViewed = usage.date === today ? usage.stories : 0;
  const remaining = Math.max(0, MAX_FREE_STORIES - storiesViewed);

  return {
    storiesViewed,
    remaining,
    isLimited: storiesViewed >= MAX_FREE_STORIES,
  };
}

/**
 * Create a Set-Cookie header with updated story count.
 */
export function setUsageCookie(stories: number): string {
  const today = new Date().toISOString().slice(0, 10);
  const value = encodeURIComponent(JSON.stringify({ date: today, stories }));
  return `${COOKIE_NAME}=${value}; Path=/; SameSite=Lax; Max-Age=86400`;
}

export { MAX_FREE_STORIES };
