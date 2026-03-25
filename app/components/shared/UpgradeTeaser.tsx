// ============================================================
// Triangulate — Upgrade Teaser Component
// ============================================================

import { Link } from "react-router";
import { Lock } from "lucide-react";
import { CAPABILITY_LABELS, minimumTierFor, type Capability } from "~/lib/capabilities";

interface UpgradeTeaserProps {
  capability: Capability;
  compact?: boolean;
}

/**
 * Generic upgrade prompt shown when a user lacks a capability.
 * Links to the pricing page.
 */
export default function UpgradeTeaser({ capability, compact = false }: UpgradeTeaserProps) {
  const label = CAPABILITY_LABELS[capability];
  const requiredTier = minimumTierFor(capability);
  const tierLabel = requiredTier === "STANDARD" ? "Premium" : "Journalist Pro";

  if (compact) {
    return (
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-green transition-colors"
      >
        <Lock className="w-3 h-3" aria-hidden="true" />
        <span>{tierLabel}</span>
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center mb-3">
        <Lock className="w-5 h-5 text-ink-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-ink mb-1">{label}</p>
      <p className="text-xs text-ink-muted mb-4">
        Available with {tierLabel}
      </p>
      <Link
        to="/pricing"
        className="px-4 py-2 text-xs font-medium bg-brand-green text-white rounded-sm hover:opacity-90 transition-opacity"
      >
        Upgrade
      </Link>
    </div>
  );
}
