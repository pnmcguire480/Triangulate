// ============================================================
// Triangulate - Core Type Definitions
// ============================================================

// --- Enums (mirrored from Prisma schema as string literals to avoid bundling @prisma/client) ---

export const TrustSignal = {
  SINGLE_SOURCE: "SINGLE_SOURCE",
  CONTESTED: "CONTESTED",
  CONVERGED: "CONVERGED",
  SOURCE_BACKED: "SOURCE_BACKED",
  INSTITUTIONALLY_VALIDATED: "INSTITUTIONALLY_VALIDATED",
} as const;
export type TrustSignal = (typeof TrustSignal)[keyof typeof TrustSignal];

export const BiasCategory = {
  LEFT: "LEFT",
  CENTER_LEFT: "CENTER_LEFT",
  CENTER: "CENTER",
  CENTER_RIGHT: "CENTER_RIGHT",
  RIGHT: "RIGHT",
} as const;
export type BiasCategory = (typeof BiasCategory)[keyof typeof BiasCategory];

export const BiasTier = {
  FAR_LEFT: "FAR_LEFT",
  LEFT: "LEFT",
  CENTER_LEFT: "CENTER_LEFT",
  CENTER: "CENTER",
  CENTER_RIGHT: "CENTER_RIGHT",
  RIGHT: "RIGHT",
  FAR_RIGHT: "FAR_RIGHT",
} as const;
export type BiasTier = (typeof BiasTier)[keyof typeof BiasTier];

export const ContentType = {
  REPORTING: "REPORTING",
  COMMENTARY: "COMMENTARY",
  MIXED: "MIXED",
  UNKNOWN: "UNKNOWN",
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const ClaimType = {
  FACTUAL: "FACTUAL",
  STATISTICAL: "STATISTICAL",
  QUOTE: "QUOTE",
  EVENT: "EVENT",
  LEGAL: "LEGAL",
} as const;
export type ClaimType = (typeof ClaimType)[keyof typeof ClaimType];

export const DocType = {
  GOVERNMENT: "GOVERNMENT",
  COURT: "COURT",
  ACADEMIC: "ACADEMIC",
  DATA: "DATA",
  OTHER: "OTHER",
} as const;
export type DocType = (typeof DocType)[keyof typeof DocType];

export const UserTier = {
  FREE: "FREE",
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
} as const;
export type UserTier = (typeof UserTier)[keyof typeof UserTier];

export const Region = {
  US: "US",
  UK: "UK",
  EUROPE: "EUROPE",
  MIDDLE_EAST: "MIDDLE_EAST",
  ASIA_PACIFIC: "ASIA_PACIFIC",
  CANADA: "CANADA",
  LATIN_AMERICA: "LATIN_AMERICA",
  AFRICA: "AFRICA",
  OCEANIA: "OCEANIA",
  GLOBAL: "GLOBAL",
} as const;
export type Region = (typeof Region)[keyof typeof Region];

// --- Re-export filter and workspace types ---
export type { FilterState, FacetCounts, TimeHorizon, FilterPreset } from "./filters";
export type { WorkspaceState, DensityMode, PanelLayout, PanelId, LayoutPreset } from "./workspace";
export { DEFAULT_FILTER_STATE } from "./filters";
export { DEFAULT_WORKSPACE, LAYOUT_PRESETS } from "./workspace";

// --- Core Entities ---

export interface Source {
  id: string;
  name: string;
  url: string;
  rssFeedUrl: string;
  biasCategory: BiasCategory;
  region: Region;
  affiliateUrl?: string | null;
  createdAt: Date;
  articles?: Article[];
}

export interface Article {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  publishedAt: Date;
  contentType: ContentType;
  rawText?: string | null;
  storyId?: string | null;
  createdAt: Date;
  source?: Source;
  story?: Story | null;
  claimSources?: ClaimSource[];
}

export interface Story {
  id: string;
  generatedTitle: string;
  summary?: string | null;
  trustSignal: TrustSignal;
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzedAt?: Date | null;
  articles?: Article[];
  claims?: Claim[];
  primaryDocs?: PrimaryDoc[];
}

export interface Claim {
  id: string;
  storyId: string;
  claimText: string;
  claimType: ClaimType;
  convergenceScore: number;
  createdAt: Date;
  story?: Story;
  claimSources?: ClaimSource[];
}

export interface ClaimSource {
  id: string;
  claimId: string;
  articleId: string;
  quote?: string | null;
  supports: boolean;
  claim?: Claim;
  article?: Article;
}

export interface PrimaryDoc {
  id: string;
  storyId: string;
  docType: DocType;
  url: string;
  title: string;
  createdAt: Date;
  story?: Story;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  tier: UserTier;
  stripeCustomerId?: string | null;
  priceLocked?: number | null;
  isFounder: boolean;
  joinedAt: Date;
  subscriptionActive: boolean;
}

// --- UI / Display Types ---

export interface TrustSignalDisplay {
  signal: TrustSignal;
  label: string;
  color: string;
  icon: string;
  description: string;
}

// --- Constants ---

export const TRUST_SIGNAL_CONFIG: Record<TrustSignal, TrustSignalDisplay> = {
  [TrustSignal.SINGLE_SOURCE]: {
    signal: TrustSignal.SINGLE_SOURCE,
    label: "Single Source",
    color: "#E76F51",
    icon: "AlertCircle",
    description: "Only one outlet is reporting this.",
  },
  [TrustSignal.CONTESTED]: {
    signal: TrustSignal.CONTESTED,
    label: "Contested",
    color: "#E9C46A",
    icon: "AlertTriangle",
    description: "Outlets disagree on key facts.",
  },
  [TrustSignal.CONVERGED]: {
    signal: TrustSignal.CONVERGED,
    label: "Converged",
    color: "#2D6A4F",
    icon: "CheckCircle",
    description: "Adversarial sources confirm the same facts.",
  },
  [TrustSignal.SOURCE_BACKED]: {
    signal: TrustSignal.SOURCE_BACKED,
    label: "Source-Backed",
    color: "#264653",
    icon: "FileCheck",
    description: "Primary documents are available.",
  },
  [TrustSignal.INSTITUTIONALLY_VALIDATED]: {
    signal: TrustSignal.INSTITUTIONALLY_VALIDATED,
    label: "Verified by Action",
    color: "#6C63FF",
    icon: "ShieldCheck",
    description: "An institution has acted on this.",
  },
};

export const BIAS_LABELS: Record<BiasCategory, string> = {
  [BiasCategory.LEFT]: "Left-Leaning",
  [BiasCategory.CENTER_LEFT]: "Center-Left",
  [BiasCategory.CENTER]: "Center",
  [BiasCategory.CENTER_RIGHT]: "Center-Right",
  [BiasCategory.RIGHT]: "Right-Leaning",
};
