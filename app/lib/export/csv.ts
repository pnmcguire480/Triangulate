// ============================================================
// Triangulate — CSV Export (Chunk 6.6)
// Client-side CSV generation via Blob
// ============================================================

interface ExportableStory {
  title: string;
  trustSignal: string;
  convergenceScore: number;
  articleCount: number;
  claimCount: number;
  biasTiers: string[];
  regions: string[];
  createdAt: string;
}

interface ExportableClaim {
  claimText: string;
  claimType: string;
  convergenceScore: number;
  supportingSources: string[];
  contradictingSources: string[];
}

/**
 * Generate CSV string from story data.
 */
export function storiesToCsv(stories: ExportableStory[]): string {
  const headers = [
    'Title',
    'Trust Signal',
    'Convergence Score',
    'Article Count',
    'Claim Count',
    'Bias Tiers',
    'Regions',
    'Date',
  ];

  const rows = stories.map((s) => [
    csvEscape(s.title),
    s.trustSignal,
    (s.convergenceScore * 100).toFixed(0) + '%',
    String(s.articleCount),
    String(s.claimCount),
    s.biasTiers.join('; '),
    s.regions.join('; '),
    s.createdAt,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Generate CSV string from claim data.
 */
export function claimsToCsv(claims: ExportableClaim[], storyTitle: string): string {
  const headers = [
    'Story',
    'Claim',
    'Type',
    'Convergence Score',
    'Supporting Sources',
    'Contradicting Sources',
  ];

  const rows = claims.map((c) => [
    csvEscape(storyTitle),
    csvEscape(c.claimText),
    c.claimType,
    (c.convergenceScore * 100).toFixed(0) + '%',
    c.supportingSources.join('; '),
    c.contradictingSources.join('; '),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Trigger CSV download in the browser.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
