import { cn } from "~/lib/utils";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ClaimSourceDisplay {
  id: string;
  quote?: string | null;
  supports: boolean;
  article: {
    id: string;
    title: string;
    source: {
      name: string;
      biasCategory: string;
      biasTier: string;
    };
  };
}

interface ClaimDisplay {
  id: string;
  claimText: string;
  claimType: string;
  convergenceScore: number;
  sources: ClaimSourceDisplay[];
}

interface ClaimsTrackerProps {
  claims: ClaimDisplay[];
}

function ConvergenceBar({ score }: { score: number }) {
  const percentage = Math.round(score * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink/5 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 0.7 ? "bg-brand-green" :
            score >= 0.3 ? "bg-brand-amber" :
            "bg-brand-red"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="score text-xs text-ink-muted w-8 text-right">
        {percentage}%
      </span>
    </div>
  );
}

function ClaimCard({ claim }: { claim: ClaimDisplay }) {
  const supportingSources = claim.sources.filter((s) => s.supports);
  const contradictingSources = claim.sources.filter((s) => !s.supports);

  return (
    <div className="py-4 border-b border-ink/6 last:border-b-0">
      {/* Claim type + convergence bar */}
      <div className="flex items-center gap-3 mb-2">
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm",
          claim.claimType === "FACTUAL"
            ? "bg-ink/5 text-ink-muted"
            : "bg-brand-purple/8 text-brand-purple"
        )}>
          {claim.claimType}
        </span>
        <div className="flex-1">
          <ConvergenceBar score={claim.convergenceScore} />
        </div>
      </div>

      {/* Claim text */}
      <p className="text-sm text-ink leading-relaxed mb-3 font-body">
        {claim.claimText}
      </p>

      {/* Supporting sources */}
      {supportingSources.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-brand-green shrink-0" />
            <span className="sr-only">Supporting: </span>
            {supportingSources.map((cs) => (
              <span
                key={cs.id}
                className="text-[10px] font-medium px-1.5 py-0.5 bg-brand-green/6 text-brand-green rounded-sm border border-brand-green/10"
              >
                {cs.article.source.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contradicting sources */}
      {contradictingSources.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <XCircle className="w-3 h-3 text-brand-red shrink-0" />
            <span className="sr-only">Contradicting: </span>
            {contradictingSources.map((cs) => (
              <span
                key={cs.id}
                className="text-[10px] font-medium px-1.5 py-0.5 bg-brand-red/6 text-brand-red rounded-sm border border-brand-red/10"
              >
                {cs.article.source.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quote snippets if available */}
      {claim.sources.some((s) => s.quote) && (
        <div className="mt-2 space-y-1">
          {claim.sources
            .filter((s) => s.quote)
            .slice(0, 2)
            .map((cs) => (
              <blockquote
                key={cs.id}
                className="text-xs text-ink-muted italic border-l-2 border-ink/10 pl-2 py-0.5"
              >
                &ldquo;{cs.quote}&rdquo;
                <span className="not-italic text-ink-faint ml-1">— {cs.article.source.name}</span>
              </blockquote>
            ))}
        </div>
      )}
    </div>
  );
}

export default function ClaimsTracker({ claims }: ClaimsTrackerProps) {
  if (claims.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-6 h-6 text-ink-faint mx-auto mb-2" />
        <p className="text-sm text-ink-muted">No claims extracted yet.</p>
      </div>
    );
  }

  const factualClaims = claims.filter((c) => c.claimType === "FACTUAL");
  const evaluativeClaims = claims.filter((c) => c.claimType === "EVALUATIVE");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-headline text-lg font-bold text-ink">Claims</h3>
        <div className="rule-line flex-1" />
        <span className="dateline">
          {factualClaims.length} factual, {evaluativeClaims.length} evaluative
        </span>
      </div>

      <div>
        {claims.map((claim) => (
          <ClaimCard key={claim.id} claim={claim} />
        ))}
      </div>
    </div>
  );
}
