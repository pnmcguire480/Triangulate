// ============================================================
// Triangulate - Core Type Definitions
// ============================================================

// --- Enums (re-exported from Prisma to avoid duplication) ---

import {
  TrustSignal,
  BiasCategory,
  BiasTier,
  ContentType,
  ClaimType,
  DocType,
  UserTier,
  Region,
} from "@prisma/client";

export {
  TrustSignal,
  BiasCategory,
  BiasTier,
  ContentType,
  ClaimType,
  DocType,
  UserTier,
  Region,
};

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
