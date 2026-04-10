// ============================================================
// Triangulate — Home Page (Chunks 3.5, 10.4 integration)
// Logged in: WirePanel + FilterSidebar + DashboardLayout
// Logged out: Condensed landing + live Wire preview
// ============================================================

import { Link, useLoaderData, useFetcher, useSearchParams, useNavigate } from 'react-router';

import { prisma } from '~/lib/prisma.server';
import { getUser } from '~/lib/auth.server';
// Usage tracking retained for analytics — no longer gates content
import { lazy, Suspense } from 'react';
import DashboardLayout from '~/components/panels/DashboardLayout';
import WirePanel from '~/components/wire/WirePanel';
const FilterSidebar = lazy(() => import('~/components/filters/FilterSidebar'));
import LensPanel from '~/components/lens/LensPanel';
import TodaysSurprise from '~/components/wire/TodaysSurprise';
import { FilterProvider } from '~/lib/filters/FilterProvider';
const MobileFilterSheet = lazy(() => import('~/components/filters/MobileFilterSheet'));
import Footer from '~/components/layout/Footer';
import type { StoryListRowProps } from '~/components/wire/StoryListRow';

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  const url = new URL(request.url);
  const selectedStoryId = url.searchParams.get('story');

  // Parse filters from URL
  const biasTierFilter = url.searchParams.getAll('bias');
  const regionFilter = url.searchParams.getAll('region');
  const convergenceMin = Number(url.searchParams.get('convMin')) || 0;
  const convergenceMax = Number(url.searchParams.get('convMax')) || 100;
  const _preset = url.searchParams.get('preset');

  // Build where clause
  const where: Record<string, unknown> = {
    lastAnalyzedAt: { not: null },
  };

  // Apply filters
  if (biasTierFilter.length > 0) {
    where.articles = {
      some: { source: { biasTier: { in: biasTierFilter } } },
    };
  }

  // Fetch stories
  const stories = await prisma.story.findMany({
    where,
    include: {
      articles: {
        include: {
          source: {
            select: { name: true, biasCategory: true, biasTier: true, region: true },
          },
        },
      },
      claims: { select: { convergenceScore: true, claimType: true, claimText: true } },
      _count: { select: { articles: true, claims: true, primaryDocs: true } },
    },
    orderBy: [
      { claims: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    take: 100,
  });

  // Transform to StoryListRowProps shape
  const storyRows: StoryListRowProps[] = stories.map((story) => {
    const highestConvergence = story.claims.length > 0
      ? Math.max(...story.claims.map((c) => c.convergenceScore))
      : 0;

    const biasTiers = [...new Set(story.articles.map((a) => a.source.biasTier))];
    const regions = [...new Set(story.articles.map((a) => a.source.region))];
    const sourceNames = [...new Set(story.articles.map((a) => a.source.name))].slice(0, 6);

    return {
      id: story.id,
      title: story.generatedTitle,
      trustSignal: story.trustSignal,
      convergenceScore: highestConvergence,
      articleCount: story._count.articles,
      claimCount: story._count.claims,
      biasTiers: biasTiers as StoryListRowProps['biasTiers'],
      regions: regions as StoryListRowProps['regions'],
      sourceNames,
      createdAt: story.createdAt.toISOString(),
    };
  });

  // Sort: pure convergence score descending, then recency
  storyRows.sort((a, b) => {
    if (a.convergenceScore !== b.convergenceScore) return b.convergenceScore - a.convergenceScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Apply convergence range filter
  const filtered = storyRows.filter((s) => {
    const pct = s.convergenceScore * 100;
    return pct >= convergenceMin && pct <= convergenceMax;
  });

  // Apply region filter
  const regionFiltered = regionFilter.length > 0
    ? filtered.filter((s) => s.regions.some((r: string) => regionFilter.includes(r)))
    : filtered;

  // Usage tracking (analytics only — no limits on truth)
  const usage = null;

  // For logged-out users: only show stories with meaningful convergence
  // Avoids showing weak/red stories that undermine credibility for new visitors
  const frontPageStories = user
    ? regionFiltered
    : regionFiltered.filter((s) => s.convergenceScore >= 0.3 || s.articleCount >= 2);

  // Today's surprise: highest convergence story with widest ideological spread
  const surprise = frontPageStories.find(
    (s) => s.convergenceScore > 0.5 && s.biasTiers.length >= 3
  );

  return {
    stories: frontPageStories.slice(0, 40),
    totalCount: regionFiltered.length,
    user: user ? {
      id: user.id,
      email: user.email,
      tier: user.tier,
      isFounder: user.isFounder,
    } : null,
    selectedStoryId,
    surprise: surprise ? {
      id: surprise.id,
      title: surprise.title,
      convergenceScore: surprise.convergenceScore,
      sourceNames: surprise.sourceNames || [],
      claimCount: surprise.claimCount,
    } : null,
    usage,
  };
}

export default function Home() {
  const { stories, user, selectedStoryId: _selectedStoryId, surprise, usage: _usage } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const _storyFetcher = useFetcher();

  const selectedId = searchParams.get('story');

  function selectStory(id: string) {
    setSearchParams((prev) => {
      prev.set('story', id);
      return prev;
    }, { replace: true });
  }

  // Mark selected stories
  const wireStories = stories.map((s) => ({
    ...s,
    isSelected: s.id === selectedId,
    onClick: () => selectStory(s.id),
  }));

  // Logged-out: full wire with condensed hero — truth is free
  if (!user) {
    return <LoggedOutLanding stories={wireStories} surprise={surprise} />;
  }

  // Logged-in: full command center
  return (
    <FilterProvider>
    <div className="h-full flex">
      {/* Filter sidebar */}
      <div className="hidden md:block">
        <Suspense fallback={null}><FilterSidebar /></Suspense>
      </div>

      {/* Dashboard */}
      <div className="flex-1 h-full">
        {/* Today's Surprise */}
        {surprise && (
          <div className="px-3 py-2 border-b border-border">
            <TodaysSurprise
              storyId={surprise.id}
              sourcePair={surprise.sourceNames.slice(0, 2).join(' and ') || 'Multiple sources'}
              factCount={surprise.claimCount || 0}
              topic={surprise.title.split(' ').slice(0, 4).join(' ')}
              convergencePct={Math.round(surprise.convergenceScore * 100)}
              onClick={() => selectStory(surprise.id)}
            />
          </div>
        )}

        {/* Mobile filter sheet */}
        <div className="md:hidden">
          <Suspense fallback={null}><MobileFilterSheet /></Suspense>
        </div>

        <DashboardLayout
          wire={<WirePanel stories={wireStories} />}
          lens={
            selectedId ? (
              <LensPanel storyId={selectedId} />
            ) : undefined
          }
        />
      </div>
    </div>
    </FilterProvider>
  );
}

// --- Logged-out landing page ---

function LoggedOutLanding({
  stories,
  surprise,
}: {
  stories: StoryListRowProps[];
  surprise: { id: string; title: string; convergenceScore: number; sourceNames: string[]; claimCount: number } | null;
}) {
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date());
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Condensed hero — tight, purposeful, gets out of the way */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6 text-center">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-ink leading-tight mb-2 animate-fade-in">
            Where the sources{' '}
            <span className="relative">
              agree
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-green/40" />
            </span>
          </h1>
          <p className="text-sm text-ink-muted max-w-md mx-auto mb-4 animate-fade-in">
            76+ outlets across the political spectrum. When ideologically opposed sources
            confirm the same facts, that&apos;s the signal worth reading.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
            <Link
              to="/auth/signin"
              className="px-5 py-2 bg-ink text-paper rounded-sm font-medium hover:bg-ink-light transition-colors text-sm"
            >
              Sign in for Pro Tools
            </Link>
            <Link
              to="/how-it-works"
              className="px-5 py-2 text-ink-muted text-sm hover:text-ink transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Today's Surprise — the hook */}
      {surprise && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <TodaysSurprise
            storyId={surprise.id}
            sourcePair={surprise.sourceNames.slice(0, 2).join(' and ') || 'Multiple sources'}
            factCount={surprise.claimCount || 0}
            topic={surprise.title.split(' ').slice(0, 4).join(' ')}
            convergencePct={Math.round(surprise.convergenceScore * 100)}
            onClick={() => navigate(`/story/${surprise.id}`)}
          />
        </div>
      )}

      {/* Full Wire — truth is free */}
      <section className="border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-3 pb-10">
          <div className="text-center mb-3">
            <p className="dateline">{today}</p>
          </div>
          <WirePanel stories={stories} />
          {stories.length > 0 && (
            <div className="text-center mt-6 py-4 border-t border-border">
              <p className="text-sm text-ink-muted mb-2">
                Want export tools, saved workspaces, and source intelligence?
              </p>
              <Link
                to="/auth/signin"
                className="text-sm text-brand-green font-medium hover:underline"
              >
                Sign in to unlock Pro tools
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
