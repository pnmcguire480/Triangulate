import { ExternalLink, FileText, MessageSquareText } from "lucide-react";
import { cn } from "~/lib/utils";
import { BIAS_LABELS } from "~/types";
import type { BiasCategory, ContentType } from "~/types";

interface ArticleDisplay {
  id: string;
  title: string;
  url: string;
  contentType: ContentType;
  source: {
    name: string;
    biasCategory: BiasCategory;
    biasTier: string;
    region: string;
    affiliateUrl?: string | null;
  };
}

interface ConvergencePanelProps {
  articles: ArticleDisplay[];
}

// Group articles into 3 columns: Left, Center, Right
function groupByDirection(articles: ArticleDisplay[]) {
  const left: ArticleDisplay[] = [];
  const center: ArticleDisplay[] = [];
  const right: ArticleDisplay[] = [];

  for (const article of articles) {
    const cat = article.source.biasCategory;
    if (cat === "LEFT" || cat === "CENTER_LEFT") {
      left.push(article);
    } else if (cat === "CENTER") {
      center.push(article);
    } else {
      right.push(article);
    }
  }

  return { left, center, right };
}

function ArticleRow({ article }: { article: ArticleDisplay }) {
  const linkUrl = article.source.affiliateUrl || article.url;

  return (
    <div className="py-3 border-b border-ink/5 last:border-b-0 group/article">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {/* Source name + content type */}
          <div className="flex items-center gap-2 mb-1">
            <span className="dateline">{article.source.name}</span>
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-sm",
              article.contentType === "REPORTING"
                ? "bg-brand-green/8 text-brand-green"
                : article.contentType === "COMMENTARY"
                ? "bg-brand-amber/15 text-brand-amber"
                : "bg-ink/5 text-ink-faint"
            )}>
              {article.contentType === "REPORTING" ? (
                <><FileText className="w-2.5 h-2.5" /> Reporting</>
              ) : article.contentType === "COMMENTARY" ? (
                <><MessageSquareText className="w-2.5 h-2.5" /> Opinion</>
              ) : (
                "Unknown"
              )}
            </span>
          </div>

          {/* Article title as link */}
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink hover:text-brand-green transition-colors leading-snug inline-flex items-start gap-1 group-hover/article:underline"
          >
            <span>{article.title}</span>
            <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 opacity-50 group-hover/article:opacity-100 transition-opacity" />
          </a>

          {/* Affiliate link for paywalled sources */}
          {article.source.affiliateUrl && (
            <a
              href={article.source.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-teal hover:text-brand-green transition-colors mt-1"
            >
              Read Full Story →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({
  label,
  articles,
  accentColor,
}: {
  label: string;
  articles: ArticleDisplay[];
  accentColor: string;
}) {
  if (articles.length === 0) return null;

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Column header — fixed at top */}
      <div
        className="border-b-2 pb-2 pt-2 px-3 shrink-0"
        style={{ borderColor: accentColor }}
      >
        <h3 className="font-headline text-sm font-semibold" style={{ color: accentColor }}>
          {label}
        </h3>
        <span className="text-[10px] text-ink-faint">
          {articles.length} {articles.length === 1 ? "outlet" : "outlets"}
        </span>
      </div>

      {/* Articles — independent scroll, scroll wheel trapped to this column */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin px-3"
        style={{ overscrollBehavior: "contain" }}
      >
        {articles.map((article) => (
          <ArticleRow key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}

export default function ConvergencePanel({ articles }: ConvergencePanelProps) {
  const { left, center, right } = groupByDirection(articles);
  const hasMultipleColumns = [left, center, right].filter((col) => col.length > 0).length > 1;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-headline text-lg font-bold text-ink">The Spectrum</h2>
        <div className="rule-line flex-1" />
      </div>

      {hasMultipleColumns ? (
        <>
          {/* Mobile: stacked layout */}
          <div className="md:hidden border border-border rounded-sm overflow-hidden space-y-4 p-3">
            {left.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto">
                <Column label="Left-Leaning" articles={left} accentColor="var(--color-brand-green)" />
              </div>
            )}
            {center.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto">
                <Column label="Center" articles={center} accentColor="var(--color-brand-teal)" />
              </div>
            )}
            {right.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto">
                <Column label="Right-Leaning" articles={right} accentColor="var(--color-brand-red)" />
              </div>
            )}
          </div>
          {/* Desktop: 3-column layout */}
          <div className="hidden md:block border border-border rounded-sm overflow-hidden" style={{ height: "60vh" }}>
            <div className="flex h-full divide-x divide-border">
              <div className="flex-1 h-full">
                <Column label="Left-Leaning" articles={left} accentColor="var(--color-brand-green)" />
              </div>
              <div className="flex-1 h-full">
                <Column label="Center" articles={center} accentColor="var(--color-brand-teal)" />
              </div>
              <div className="flex-1 h-full">
                <Column label="Right-Leaning" articles={right} accentColor="var(--color-brand-red)" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden" style={{ height: "40vh" }}>
          {left.length > 0 && <Column label="Left-Leaning" articles={left} accentColor="var(--color-brand-green)" />}
          {center.length > 0 && <Column label="Center" articles={center} accentColor="var(--color-brand-teal)" />}
          {right.length > 0 && <Column label="Right-Leaning" articles={right} accentColor="var(--color-brand-red)" />}
        </div>
      )}
    </div>
  );
}
