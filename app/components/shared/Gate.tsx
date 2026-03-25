// ============================================================
// Triangulate — Feature Gate Component
// ============================================================

import type { ReactNode } from "react";
import type { UserTier } from "@prisma/client";
import { hasCapability, type Capability } from "~/lib/capabilities";
import UpgradeTeaser from "./UpgradeTeaser";

interface GateProps {
  /** The capability required to see the children */
  capability: Capability;
  /** Current user tier (null = not signed in = FREE) */
  tier: UserTier | null;
  /** What to show if the user doesn't have the capability */
  fallback?: ReactNode;
  /** The gated content */
  children: ReactNode;
}

/**
 * Conditionally renders children based on user tier capabilities.
 * Shows an upgrade teaser by default if the user lacks the capability.
 */
export default function Gate({ capability, tier, fallback, children }: GateProps) {
  const userTier = tier ?? "FREE";

  if (hasCapability(userTier, capability)) {
    return <>{children}</>;
  }

  return <>{fallback ?? <UpgradeTeaser capability={capability} />}</>;
}
