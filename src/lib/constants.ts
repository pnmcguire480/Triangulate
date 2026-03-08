// ============================================================
// Triangulate - App Constants
// ============================================================

export const APP_NAME = "Triangulate";
export const APP_TAGLINE = "Trust Through Convergence";
export const APP_DESCRIPTION =
  "See where news sources agree. Triangulate clusters coverage from across the political spectrum and shows you where the facts converge.";

export const COLORS = {
  navy: "#1A1A2E",
  accent: "#16213E",
  warm: "#FAF9F6",
  green: "#2D6A4F",
  amber: "#E9C46A",
  red: "#E76F51",
  teal: "#264653",
  purple: "#6C63FF",
} as const;

export const PRICING = {
  standard: {
    monthly: 5,
    annual: 50,
  },
  premium: {
    monthly: 18,
    annual: 180,
  },
} as const;

export const TOPICS = [
  "All",
  "Politics",
  "Economy",
  "World",
  "Tech",
  "Health",
  "Legal",
  "Environment",
  "Culture",
] as const;

export const FREE_TIER_LIMITS = {
  storiesPerDay: 5,
  searchesPerDay: 0,
  bookmarks: 0,
} as const;

export const STANDARD_TIER_LIMITS = {
  storiesPerDay: Infinity,
  searchesPerDay: 5,
  bookmarks: 50,
} as const;

export const PREMIUM_TIER_LIMITS = {
  storiesPerDay: Infinity,
  searchesPerDay: Infinity,
  bookmarks: Infinity,
} as const;
