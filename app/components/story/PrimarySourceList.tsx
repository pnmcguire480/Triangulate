import {
  Scale,
  ScrollText,
  FileText,
  BarChart3,
  Mic,
  BookOpen,
  File,
  ExternalLink,
} from "lucide-react";

interface PrimaryDocDisplay {
  id: string;
  docType: string;
  url: string;
  title: string;
}

interface PrimarySourceListProps {
  docs: PrimaryDocDisplay[];
}

const DOC_TYPE_CONFIG: Record<string, { icon: typeof Scale; label: string }> = {
  COURT_FILING: { icon: Scale, label: "Court Filing" },
  LEGISLATION: { icon: ScrollText, label: "Legislation" },
  OFFICIAL_STATEMENT: { icon: FileText, label: "Official Statement" },
  GOVERNMENT_DATA: { icon: BarChart3, label: "Government Data" },
  TRANSCRIPT: { icon: Mic, label: "Transcript" },
  RESEARCH: { icon: BookOpen, label: "Research" },
  OTHER: { icon: File, label: "Document" },
};

export default function PrimarySourceList({ docs }: PrimarySourceListProps) {
  if (docs.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-headline text-lg font-bold text-ink">Primary Sources</h2>
        <div className="rule-line flex-1" />
      </div>

      <p className="text-xs text-ink-muted mb-3">
        Original documents referenced by reporting outlets. The sources behind the sources.
      </p>

      <div className="space-y-2">
        {docs.map((doc) => {
          const config = DOC_TYPE_CONFIG[doc.docType] || DOC_TYPE_CONFIG.OTHER;
          const Icon = config.icon;

          return (
            <a
              key={doc.id}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 py-3 px-3 -mx-3 rounded-sm hover:bg-paper-aged/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-sm bg-brand-teal/8 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-brand-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="dateline mb-0.5">{config.label}</div>
                <p className="text-sm text-ink leading-snug group-hover:text-brand-teal transition-colors">
                  {doc.title}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-ink-faint mt-1 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
