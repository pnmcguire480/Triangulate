// ============================================================
// Triangulate — JSON Export (Chunk 6.6)
// Pretty-printed JSON with schema metadata
// ============================================================

interface ExportableStory {
  id: string;
  title: string;
  trustSignal: string;
  convergenceScore: number;
  articleCount: number;
  claimCount: number;
  biasTiers: string[];
  regions: string[];
  createdAt: string;
  claims?: {
    claimText: string;
    claimType: string;
    convergenceScore: number;
    sources: { name: string; supports: boolean; biasTier: string }[];
  }[];
}

/**
 * Generate JSON export with metadata envelope.
 */
export function storiesToJson(stories: ExportableStory[]): string {
  const envelope = {
    $schema: 'https://triangulate.app/schema/export-v1.json',
    exportedAt: new Date().toISOString(),
    exportedBy: 'Triangulate',
    version: '1.0',
    storyCount: stories.length,
    stories,
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Trigger JSON download in the browser.
 */
export function downloadJson(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
