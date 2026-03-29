// ============================================================
// Triangulate — LensPanel Component (Chunk 4.1 + 6/10 integration)
// Story detail as tabbed panel (Spectrum | Claims | Sources | Primary Docs)
// Supports both direct data and storyId-based fetching
// ============================================================

import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import PanelContainer from "~/components/panels/PanelContainer";
import SpectrumPanel from "./SpectrumPanel";
import ClaimsPanel from "./ClaimsPanel";
import PrimaryDocsPanel from "./PrimaryDocsPanel";

interface LensArticle {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  contentType: string;
  source: {
    name: string;
    biasTier: string;
    region: string;
  };
}

interface LensClaim {
  id: string;
  claimText: string;
  claimType: string;
  convergenceScore: number;
  sources: {
    articleId: string;
    quote?: string | null;
    supports: boolean;
    article?: {
      source: { name: string; biasTier: string };
    };
  }[];
}

interface LensPrimaryDoc {
  id: string;
  docType: string;
  url: string;
  title: string;
}

interface StoryData {
  id: string;
  generatedTitle: string;
  summary?: string | null;
  trustSignal: string;
  articles: LensArticle[];
  claims: LensClaim[];
  primaryDocs: LensPrimaryDoc[];
}

export interface LensPanelProps {
  /** Direct story data (from story detail page loader) */
  story?: StoryData | null;
  /** Story ID for fetcher-based loading (from Wire panel selection) */
  storyId?: string | null;
}

const TABS = [
  { id: "spectrum", label: "Spectrum" },
  { id: "claims", label: "Claims" },
  { id: "sources", label: "Sources" },
  { id: "primary", label: "Primary Docs" },
];

export default function LensPanel({ story: directStory, storyId }: LensPanelProps) {
  const [activeTab, setActiveTab] = useState("spectrum");
  const fetcher = useFetcher();

  // Fetch story data when storyId changes (and no direct data)
  useEffect(() => {
    if (storyId && !directStory) {
      fetcher.load(`/api/stories/${storyId}`);
    }
  }, [storyId]);

  // Determine which story data to use
  const story = directStory || (fetcher.data?.story as StoryData | undefined) || null;
  const isLoading = fetcher.state === 'loading';

  if (!story && !storyId) {
    return (
      <PanelContainer title="The Lens" panelId="lens-panel" className="h-full">
        <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
          <p className="text-sm text-ink-muted">
            Click a story to see its convergence analysis
          </p>
          <p className="text-xs text-ink-faint mt-1">
            Select from The Wire or use keyboard (j/k) to navigate
          </p>
        </div>
      </PanelContainer>
    );
  }

  const fetcherError = fetcher.state === 'idle' && storyId && !story && !isLoading;

  if (fetcherError) {
    return (
      <PanelContainer title="The Lens" panelId="lens-panel" className="h-full">
        <div className="flex flex-col items-center justify-center h-full py-16 text-center px-4">
          <p className="text-sm text-ink-muted mb-2">Failed to load story analysis</p>
          <button
            onClick={() => fetcher.load(`/api/stories/${storyId}`)}
            className="text-xs text-brand-green font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      </PanelContainer>
    );
  }

  if (isLoading || !story) {
    return (
      <PanelContainer title="The Lens" panelId="lens-panel" className="h-full">
        <div className="flex items-center justify-center h-full py-16">
          <p className="text-sm text-ink-muted animate-pulse">Loading story analysis...</p>
        </div>
      </PanelContainer>
    );
  }

  return (
    <PanelContainer
      title="The Lens"
      subtitle={story.generatedTitle.slice(0, 40) + (story.generatedTitle.length > 40 ? "..." : "")}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      panelId="lens-panel"
      className="h-full"
    >
      <div className="p-3">
        {/* Story header */}
        <h2 className="font-headline text-lg font-bold text-ink leading-tight mb-2">
          {story.generatedTitle}
        </h2>
        {story.summary && (
          <p className="text-xs text-ink-muted mb-4 leading-relaxed">
            {story.summary}
          </p>
        )}

        {/* Tab content */}
        {activeTab === "spectrum" && (
          <SpectrumPanel articles={story.articles} />
        )}
        {activeTab === "claims" && (
          <ClaimsPanel claims={story.claims} />
        )}
        {activeTab === "sources" && (
          <SourcesTab articles={story.articles} />
        )}
        {activeTab === "primary" && (
          <PrimaryDocsPanel docs={story.primaryDocs} />
        )}
      </div>
    </PanelContainer>
  );
}

// Simple sources tab — grouped list of all articles
function SourcesTab({ articles }: { articles: LensArticle[] }) {
  const grouped = articles.reduce<Record<string, LensArticle[]>>((acc, article) => {
    const tier = article.source.biasTier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(article);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([tier, tierArticles]) => (
        <div key={tier}>
          <h3 className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
            {tier.replace(/_/g, " ")} ({tierArticles.length})
          </h3>
          <div className="space-y-1">
            {tierArticles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1.5 rounded-sm hover:bg-ink/[0.04] transition-colors"
              >
                <p className="text-xs font-medium text-ink">{article.source.name}</p>
                <p className="text-[11px] text-ink-muted line-clamp-1">{article.title}</p>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
