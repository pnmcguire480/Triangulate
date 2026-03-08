// ============================================================
// Triangulate - Core Type Definitions
// ============================================================

// --- Enums ---

export enum TrustSignal {
  SINGLE_SOURCE = "SINGLE_SOURCE",
  CONTESTED = "CONTESTED",
  CONVERGED = "CONVERGED",
  SOURCE_BACKED = "SOURCE_BACKED",
  INSTITUTIONALLY_VALIDATED = "INSTITUTIONALLY_VALIDATED",
}

export enum BiasCategory {
  LEFT = "LEFT",
  CENTER_LEFT = "CENTER_LEFT",
  CENTER = "CENTER",
  CENTER_RIGHT = "CENTER_RIGHT",
  RIGHT = "RIGHT",
}

export enum ContentType {
  REPORTING = "REPORTING",
  COMMENTARY = "COMMENTARY",
  UNKNOWN = "UNKNOWN",
}

export enum ClaimType {
  FACTUAL = "FACTUAL",
  EVALUATIVE = "EVALUATIVE",
}

export enum DocType {
  COURT_FILING = "COURT_FILING",
  LEGISLATION = "LEGISLATION",
  OFFICIAL_STATEMENT = "OFFICIAL_STATEMENT",
  GOVERNMENT_DATA = "GOVERNMENT_DATA",
  TRANSCRIPT = "TRANSCRIPT",
  RESEARCH = "RESEARCH",
  OTHER = "OTHER",
}

export enum UserTier {
  FREE = "FREE",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
}

// --- Core Entities ---

export interface Source {
  id: string;
  name: string;
  url: string;
  rssFeedUrl: string;
  biasCategory: BiasCategory;
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

export interface StoryCardData {
  id: string;
  generatedTitle: string;
  summary: string | null;
  trustSignal: TrustSignal;
  updatedAt: Date;
  articleCount: number;
  reportingCount: number;
  commentaryCount: number;
  claimCount: number;
  sourceNames: string[];
  biasSpread: BiasCategory[];
}

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
    icon: "🔴",
    description: "Only one outlet is reporting this.",
  },
  [TrustSignal.CONTESTED]: {
    signal: TrustSignal.CONTESTED,
    label: "Contested",
    color: "#E9C46A",
    icon: "🟡",
    description: "Outlets disagree on key facts.",
  },
  [TrustSignal.CONVERGED]: {
    signal: TrustSignal.CONVERGED,
    label: "Converged",
    color: "#2D6A4F",
    icon: "🟢",
    description: "Adversarial sources confirm the same facts.",
  },
  [TrustSignal.SOURCE_BACKED]: {
    signal: TrustSignal.SOURCE_BACKED,
    label: "Source-Backed",
    color: "#264653",
    icon: "📄",
    description: "Primary documents are available.",
  },
  [TrustSignal.INSTITUTIONALLY_VALIDATED]: {
    signal: TrustSignal.INSTITUTIONALLY_VALIDATED,
    label: "Verified by Action",
    color: "#6C63FF",
    icon: "⚖️",
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
