// ============================================================
// Triangulate — Home Page (Chunks 3.5, 10.4 integration)
// Logged in: WirePanel + FilterSidebar + DashboardLayout
// Logged out: Condensed landing + live Wire preview
// ============================================================

import { Link, useLoaderData, useFetcher, useSearchParams } from 'react-router';
import { format } from 'date-fns';
import { prisma } from '~/lib/prisma';
import { getUser } from '~/lib/auth';
import { getTodayUsage } from '~/lib/usage-tracking';
import DashboardLayout from '~/components/panels/DashboardLayout';
import WirePanel from '~/components/wire/WirePanel';
import FilterSidebar from '~/components/filters/FilterSidebar';
import LensPanel from '~/components/lens/LensPanel';
import TodaysSurprise from '~/components/wire/TodaysSurprise';
import { FilterProvider } from '~/lib/filters/FilterProvider';
import MobileFilterSheet from '~/components/filters/MobileFilterSheet';
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
  const preset = url.searchParams.get('preset');

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
    orderBy: { createdAt: 'desc' },
    take: 200,
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

  // Sort: multi-source first, then convergence, then recency
  storyRows.sort((a, b) => {
    if (a.articleCount >= 2 && b.articleCount < 2) return -1;
    if (b.articleCount >= 2 && a.articleCount < 2) return 1;
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

  // Free tier limit
  const usage = user?.tier === 'FREE'
    ? getTodayUsage(request.headers.get('cookie'))
    : null;

  // Today's surprise: highest convergence story with widest ideological spread
  const surprise = regionFiltered.find(
    (s) => s.convergenceScore > 0.5 && s.biasTiers.length >= 3
  );

  return {
    stories: regionFiltered.slice(0, 40),
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
  const { stories, user, selectedStoryId, surprise, usage } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyFetcher = useFetcher();

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

  // Logged-out landing page
  if (!user) {
    return <LoggedOutLanding stories={wireStories.slice(0, 5)} surprise={surprise} />;
  }

  // Logged-in: full command center
  return (
    <FilterProvider>
    <div className="h-full flex">
      {/* Filter sidebar */}
      <div className="hidden md:block">
        <FilterSidebar />
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
          <MobileFilterSheet />
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
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="min-h-screen">
      {/* Condensed hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-ink) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
          {/* Founder badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-brand-green/8 border border-brand-green/15 text-brand-green text-xs font-medium mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green signal-pulse" />
            Founder Member Access — Free for Life
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-ink leading-tight mb-4 animate-fade-in">
            See where the sources{' '}
            <span className="relative">
              agree
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-green/40" />
            </span>
            .
          </h1>
          <p className="text-sm text-ink-muted max-w-lg mx-auto mb-6 animate-fade-in">
            Triangulate clusters news from 55+ outlets across the political spectrum.
            Where ideologically opposed sources confirm the same facts — that&apos;s the signal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 animate-fade-in">
            <Link
              to="/auth/signin"
              className="px-6 py-2.5 bg-ink text-paper rounded-sm font-medium hover:bg-ink-light transition-colors text-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/pricing"
              className="px-6 py-2.5 text-ink border border-border-strong rounded-sm font-medium hover:border-ink/30 transition-colors text-sm"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Today's Surprise */}
      {surprise && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <TodaysSurprise
            storyId={surprise.id}
            sourcePair={surprise.sourceNames.slice(0, 2).join(' and ') || 'Multiple sources'}
            factCount={surprise.claimCount || 0}
            topic={surprise.title.split(' ').slice(0, 4).join(' ')}
            convergencePct={Math.round(surprise.convergenceScore * 100)}
          />
        </div>
      )}

      {/* Live Wire preview */}
      <section className="border-t border-border mt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-10">
          <div className="text-center mb-3">
            <p className="dateline">{today}</p>
          </div>
          <WirePanel stories={stories} />
          {stories.length > 0 && (
            <div className="text-center mt-4">
              <Link
                to="/auth/signin"
                className="text-sm text-brand-green font-medium hover:underline"
              >
                Sign in to see more stories and unlock filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
