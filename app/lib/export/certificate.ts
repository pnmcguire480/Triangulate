// ============================================================
// Triangulate — Convergence Certificate (Chunk 6.6)
// Verification hash + certificate data generation
// ============================================================

export interface CertificateData {
  id: string;
  claimText: string;
  convergenceScore: number;
  sources: { name: string; biasTier: string; region: string; supports: boolean }[];
  storyTitle: string;
  issuedAt: string;
  verificationHash: string;
}

/**
 * Generate a verification hash for a convergence certificate.
 * Uses SHA-256 of the claim + sources + score.
 */
export async function generateVerificationHash(
  claimText: string,
  convergenceScore: number,
  sourceNames: string[]
): Promise<string> {
  const payload = `${claimText}|${convergenceScore}|${sourceNames.sort().join(',')}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);

  // Use Web Crypto API (available in both browser and Node 18+)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate certificate data for a claim.
 */
export async function generateCertificate(
  claimText: string,
  convergenceScore: number,
  sources: { name: string; biasTier: string; region: string; supports: boolean }[],
  storyTitle: string
): Promise<CertificateData> {
  const sourceNames = sources.map((s) => s.name);
  const hash = await generateVerificationHash(claimText, convergenceScore, sourceNames);

  return {
    id: hash.slice(0, 12).toUpperCase(),
    claimText,
    convergenceScore,
    sources,
    storyTitle,
    issuedAt: new Date().toISOString(),
    verificationHash: hash,
  };
}
