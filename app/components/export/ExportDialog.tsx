// ============================================================
// Triangulate — Export Dialog (Chunk 6.6)
// Modal for exporting data as CSV/JSON/PDF
// ============================================================

import { useState } from 'react';
import { X, Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { storiesToCsv, downloadCsv } from '~/lib/export/csv';
import { storiesToJson, downloadJson } from '~/lib/export/json-export';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportableData {
  stories: {
    id: string;
    title: string;
    trustSignal: string;
    convergenceScore: number;
    articleCount: number;
    claimCount: number;
    biasTiers: string[];
    regions: string[];
    createdAt: string;
  }[];
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  data: ExportableData;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet-compatible data' },
  { value: 'json', label: 'JSON', icon: FileJson, description: 'Structured data with schema' },
  { value: 'pdf', label: 'PDF', icon: FileText, description: 'Formatted report (Pro)' },
];

export default function ExportDialog({ open, onClose, data }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeOptions, setIncludeOptions] = useState({
    stories: true,
    claims: true,
    sources: true,
    metadata: true,
  });

  if (!open) return null;

  function handleExport() {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `triangulate-export-${timestamp}`;

    if (format === 'csv') {
      const csv = storiesToCsv(data.stories);
      downloadCsv(csv, `${filename}.csv`);
    } else if (format === 'json') {
      const json = storiesToJson(data.stories);
      downloadJson(json, `${filename}.json`);
    } else if (format === 'pdf') {
      // PDF export deferred — requires @react-pdf/renderer rendering
      // TODO: Implement PDF rendering pipeline
      alert('PDF export coming soon');
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-surface rounded-sm shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-ink-muted" aria-hidden="true" />
            <h2 className="font-headline text-base font-semibold text-ink">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* What to export */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
              Exporting
            </p>
            <p className="text-sm text-ink">
              {data.stories.length} stories from the current view
            </p>
          </div>

          {/* Include options */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
              Include
            </p>
            <div className="space-y-2">
              {Object.entries(includeOptions).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setIncludeOptions({ ...includeOptions, [key]: e.target.checked })
                    }
                    className="rounded border-border accent-brand-green"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format selection */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
              Format
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border text-sm transition-colors ${
                      format === opt.value
                        ? 'border-brand-green bg-brand-green/5 text-ink'
                        : 'border-border text-ink-muted hover:border-border-strong'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-ink text-paper rounded-sm text-sm font-medium hover:bg-ink-light transition-colors"
          >
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
