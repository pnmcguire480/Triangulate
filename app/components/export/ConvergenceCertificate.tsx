// ============================================================
// Triangulate — Convergence Certificate Component (Chunk 6.6)
// Visual certificate showing claim convergence proof
// ============================================================

import type { CertificateData } from '~/lib/export/certificate';

interface ConvergenceCertificateProps {
  certificate: CertificateData;
}

const BIAS_TIER_COLORS: Record<string, string> = {
  FAR_LEFT: '#1E40AF',
  LEFT: '#3B82F6',
  CENTER_LEFT: '#6B9BD2',
  CENTER: '#6B7280',
  CENTER_RIGHT: '#D97706',
  RIGHT: '#EF4444',
  FAR_RIGHT: '#991B1B',
};

export default function ConvergenceCertificate({ certificate }: ConvergenceCertificateProps) {
  const scorePercent = (certificate.convergenceScore * 100).toFixed(0);
  const supportingSources = certificate.sources.filter((s) => s.supports);
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full max-w-xl mx-auto border-2 border-ink/10 rounded-sm bg-paper p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="rule-line-double mb-4" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-faint mb-1">
          Convergence Certificate
        </p>
        <p className="font-headline text-lg font-bold text-ink tracking-[0.08em]">
          TRIANGULATE
        </p>
        <div className="rule-line mt-4" />
      </div>

      {/* Story context */}
      <p className="text-xs text-ink-muted text-center mb-4">
        Regarding: <span className="text-ink font-medium">{certificate.storyTitle}</span>
      </p>

      {/* Claim */}
      <div className="bg-surface rounded-sm p-4 mb-6 border border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-1">
          Verified Claim
        </p>
        <p className="text-sm text-ink leading-relaxed">
          &ldquo;{certificate.claimText}&rdquo;
        </p>
      </div>

      {/* Score */}
      <div className="text-center mb-6">
        <p className="text-4xl font-mono font-bold text-brand-green">
          {scorePercent}%
        </p>
        <p className="text-xs text-ink-muted mt-1">Convergence Score</p>
      </div>

      {/* Sources */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
          Confirmed by {supportingSources.length} sources across the spectrum
        </p>
        <div className="flex flex-wrap gap-1.5">
          {supportingSources.map((source) => (
            <span
              key={source.name}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs border"
              style={{
                borderColor: BIAS_TIER_COLORS[source.biasTier] + '40',
                backgroundColor: BIAS_TIER_COLORS[source.biasTier] + '08',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: BIAS_TIER_COLORS[source.biasTier] }}
              />
              {source.name}
            </span>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between text-[10px] text-ink-faint">
          <span>Certificate ID: {certificate.id}</span>
          <span>{issuedDate}</span>
        </div>
        <p className="text-[9px] font-mono text-ink-faint mt-1 break-all">
          SHA-256: {certificate.verificationHash}
        </p>
      </div>
    </div>
  );
}
