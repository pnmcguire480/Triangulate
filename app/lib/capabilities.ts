// ============================================================
// Triangulate — Feature Gating / Capabilities System
// ============================================================

import type { UserTier } from "~/types";

/**
 * Every gated capability in the app.
 * Adding a new capability: add the enum value, then add it to the tier map.
 */
export type Capability =
  | "unlimited-stories"
  | "search"
  | "bookmarks"
  | "advanced-filters"
  | "data-export-csv"
  | "data-export-json"
  | "data-export-pdf"
  | "convergence-certificate"
  | "convergence-certificate-whitelabel"
  | "saved-workspaces"
  | "command-palette"
  | "source-intelligence"
  | "claim-citation"
  | "api-access"
  | "notifications"
  | "density-modes"
  | "keyboard-shortcuts";

/**
 * Map of tier → Set of capabilities.
 * Each tier inherits all capabilities from the tier below it.
 */
/**
 * Philosophy: Truth is free. Professional tools are paid.
 * FREE gets: all stories, search, filters, claim views, bookmarks, keyboard shortcuts
 * STANDARD gets: export, workspaces, certificates, command palette, density, notifications
 * PREMIUM gets: source intelligence, whitelabel, JSON/PDF export, citations, API
 */
const TIER_CAPABILITIES: Record<UserTier, Set<Capability>> = {
  FREE: new Set<Capability>([
    "keyboard-shortcuts",
    "unlimited-stories",
    "search",
    "bookmarks",
    "advanced-filters",
  ]),
  STANDARD: new Set<Capability>([
    "keyboard-shortcuts",
    "unlimited-stories",
    "search",
    "bookmarks",
    "advanced-filters",
    "data-export-csv",
    "convergence-certificate",
    "saved-workspaces",
    "command-palette",
    "notifications",
    "density-modes",
  ]),
  PREMIUM: new Set<Capability>([
    "keyboard-shortcuts",
    "unlimited-stories",
    "search",
    "bookmarks",
    "advanced-filters",
    "data-export-csv",
    "data-export-json",
    "data-export-pdf",
    "convergence-certificate",
    "convergence-certificate-whitelabel",
    "saved-workspaces",
    "command-palette",
    "source-intelligence",
    "claim-citation",
    "api-access",
    "notifications",
    "density-modes",
  ]),
};

/**
 * Check if a user tier has a specific capability.
 */
export function hasCapability(tier: UserTier, capability: Capability): boolean {
  return TIER_CAPABILITIES[tier]?.has(capability) ?? false;
}

/**
 * Get all capabilities for a tier.
 */
export function getCapabilities(tier: UserTier): Set<Capability> {
  return TIER_CAPABILITIES[tier] ?? new Set();
}

/**
 * Human-readable labels for upgrade prompts.
 */
export const CAPABILITY_LABELS: Record<Capability, string> = {
  "unlimited-stories": "Unlimited Stories",
  "search": "Full Search",
  "bookmarks": "Bookmarks",
  "advanced-filters": "Advanced Filters",
  "data-export-csv": "Export to CSV",
  "data-export-json": "Export to JSON",
  "data-export-pdf": "Export to PDF",
  "convergence-certificate": "Convergence Certificates",
  "convergence-certificate-whitelabel": "White-Label Certificates",
  "saved-workspaces": "Saved Workspaces",
  "command-palette": "Command Palette",
  "source-intelligence": "Source Intelligence",
  "claim-citation": "Claim Citations",
  "api-access": "API Access",
  "notifications": "Real-Time Notifications",
  "density-modes": "Density Modes",
  "keyboard-shortcuts": "Keyboard Shortcuts",
};

/**
 * Minimum tier required for each capability.
 */
export function minimumTierFor(capability: Capability): UserTier {
  if (TIER_CAPABILITIES.FREE.has(capability)) return "FREE";
  if (TIER_CAPABILITIES.STANDARD.has(capability)) return "STANDARD";
  return "PREMIUM";
}
