// ============================================================
// Triangulate — PrimaryDocsPanel (Chunk 4.5)
// Primary source documents with type badges
// ============================================================

import { ExternalLink, FileText, Scale, Building2, BarChart3, ScrollText, BookOpen, File } from "lucide-react";

const DOC_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  COURT_FILING: { icon: Scale, label: "Court Filing", color: "var(--color-brand-purple)" },
  LEGISLATION: { icon: ScrollText, label: "Legislation", color: "var(--color-brand-teal)" },
  OFFICIAL_STATEMENT: { icon: Building2, label: "Official Statement", color: "var(--color-brand-navy)" },
  GOVERNMENT_DATA: { icon: BarChart3, label: "Government Data", color: "var(--color-brand-green)" },
  TRANSCRIPT: { icon: FileText, label: "Transcript", color: "var(--color-brand-amber)" },
  RESEARCH: { icon: BookOpen, label: "Research", color: "var(--color-brand-teal)" },
  OTHER: { icon: File, label: "Document", color: "var(--color-ink-muted)" },
};

interface PrimaryDoc {
  id: string;
  docType: string;
  url: string;
  title: string;
}

interface PrimaryDocsPanelProps {
  docs: PrimaryDoc[];
}

export default function PrimaryDocsPanel({ docs }: PrimaryDocsPanelProps) {
  if (docs.length === 0) {
    return (
      <p className="text-xs text-ink-muted py-4 text-center">
        No primary documents linked to this story yet.
      </p>
    );
  }

  return (
    <div className="space-y-1.5" role="list" aria-label="Primary documents">
      {docs.map((doc) => {
        const config = DOC_TYPE_CONFIG[doc.docType] ?? DOC_TYPE_CONFIG.OTHER;
        const Icon = config.icon;

        return (
          <a
            key={doc.id}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-sm border border-border hover:border-border-strong hover:bg-ink/[0.02] transition-colors"
            role="listitem"
          >
            {/* Doc type badge */}
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink line-clamp-1">
                {doc.title}
              </p>
              <p className="text-[10px] text-ink-faint" style={{ color: config.color }}>
                {config.label}
              </p>
            </div>

            {/* External link */}
            <ExternalLink className="w-3.5 h-3.5 text-ink-faint shrink-0" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
