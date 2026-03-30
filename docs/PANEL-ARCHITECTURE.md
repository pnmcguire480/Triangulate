# Triangulate Panel Architecture -- Technical Design

> **Purpose:** Concrete technical architecture for the command-center redesign. Every section maps to implementation files, React Router v7 conventions, and the existing codebase patterns.
>
> **Depends on:** COMMAND-CENTER-DESIGN.md (UX specification), INFORMATION-ARCHITECTURE.md (content model), CLAUDE.md (project state)
> **Feeds into:** Component implementation, route refactoring, state management code

---

## Table of Contents

1. [State Management Pattern](#1-state-management-pattern)
2. [Data Loading Pattern](#2-data-loading-pattern)
3. [Component Architecture](#3-component-architecture)
4. [Keyboard Navigation Architecture](#4-keyboard-navigation-architecture)
5. [Responsive Layout Architecture](#5-responsive-layout-architecture)
6. [Performance Architecture](#6-performance-architecture)
7. [Feature Gating Architecture](#7-feature-gating-architecture)
8. [File Structure](#8-file-structure)
9. [Migration Plan](#9-migration-plan)

---

## 1. State Management Pattern

### The Three State Domains

Triangulate has three categories of state, each with a different storage mechanism. Mixing them is the single most common architecture mistake in Remix apps, and we will not make it.

| Domain | What Lives Here | Storage | Serializable? | Shared Across Tabs? |
|--------|----------------|---------|---------------|---------------------|
| **Filter State** | Bias tiers, regions, content type, time range, convergence threshold, source count, sort order, search query | URL search params (`useSearchParams`) | Yes | Yes (via URL) |
| **UI Chrome State** | Panel collapse, sidebar collapse, theme, active panel for keyboard nav, command palette open/closed, tooltip visibility | React context + `localStorage` | Partially | Yes (via localStorage) |
| **Server/Entity State** | Stories, claims, articles, sources, user profile, tier, faceted counts | Remix loaders (`useLoaderData`) + React Router cache | Yes (serialized by loader) | No (per-request) |

### Why Not Zustand

Zustand is an excellent library. We do not need it. Here is why:

1. **Filter state belongs in the URL.** Zustand stores live in memory. When a journalist shares a filtered view, the recipient needs to see the same filters. URL params do this for free. Zustand requires manual URL sync, which creates two sources of truth.

2. **Server state is already managed.** React Router v7 loaders own server state. Adding Zustand for server cache creates a parallel data layer that fights with `useLoaderData` and `useRevalidator`. The framework already has opinions here; respect them.

3. **UI chrome state is small.** Panel collapse (3 booleans), sidebar collapse (1 boolean), theme (1 string), active panel index (1 number). This is a single context provider with 6 fields. Zustand's ergonomics shine with large stores and frequent updates. For 6 fields that change a few times per session, React context with `useReducer` is simpler and has zero bundle cost.

4. **No new dependency.** CLAUDE.md rule: "Never install new dependencies without the human's approval." Context + URL params + localStorage are zero-dependency.

### Filter State: URL Search Params

All filter state lives in `useSearchParams()`. This is the load-bearing architectural decision. Every filter change is a URL change, which triggers a Remix loader revalidation, which fetches fresh faceted counts from the server.

```
/dashboard?bias=FAR_LEFT,FAR_RIGHT&region=US,UK&content=REPORTING&time=24h&convergence=30&sources=2&sort=signal&q=federal+reserve
```

#### The Filter Codec

A single module (`app/lib/filter-codec.ts`) handles serialization and deserialization. This is the only place in the codebase that knows how URL params map to filter objects.

```typescript
// app/lib/filter-codec.ts

import type { BiasTier, Region, ContentType } from "~/types";

export interface FilterState {
  biasTiers: BiasTier[];       // default: all 7
  regions: Region[];           // default: all
  contentType: "ALL" | "REPORTING" | "COMMENTARY";  // default: ALL
  timeRange: "4h" | "12h" | "24h" | "48h" | "7d";  // default: 24h
  convergenceMin: number;      // 0-100, default: 0
  minSources: number;          // default: 1
  sortBy: "signal" | "time" | "sources" | "convergence"; // default: signal
  query: string;               // default: ""
  storyId: string | null;      // selected story, default: null
}

export const DEFAULT_FILTERS: FilterState = {
  biasTiers: [],  // empty = all (don't pollute URL with defaults)
  regions: [],
  contentType: "ALL",
  timeRange: "24h",
  convergenceMin: 0,
  minSources: 1,
  sortBy: "signal",
  query: "",
  storyId: null,
};

export function parseFilters(searchParams: URLSearchParams): FilterState {
  return {
    biasTiers: parseList<BiasTier>(searchParams.get("bias")),
    regions: parseList<Region>(searchParams.get("region")),
    contentType: (searchParams.get("content") as FilterState["contentType"]) || "ALL",
    timeRange: (searchParams.get("time") as FilterState["timeRange"]) || "24h",
    convergenceMin: parseInt(searchParams.get("convergence") || "0", 10),
    minSources: parseInt(searchParams.get("sources") || "1", 10),
    sortBy: (searchParams.get("sort") as FilterState["sortBy"]) || "signal",
    query: searchParams.get("q") || "",
    storyId: searchParams.get("story") || null,
  };
}

export function serializeFilters(filters: Partial<FilterState>): URLSearchParams {
  const params = new URLSearchParams();
  // Only serialize non-default values to keep URLs clean
  if (filters.biasTiers?.length) params.set("bias", filters.biasTiers.join(","));
  if (filters.regions?.length) params.set("region", filters.regions.join(","));
  if (filters.contentType && filters.contentType !== "ALL") params.set("content", filters.contentType);
  if (filters.timeRange && filters.timeRange !== "24h") params.set("time", filters.timeRange);
  if (filters.convergenceMin && filters.convergenceMin > 0) params.set("convergence", String(filters.convergenceMin));
  if (filters.minSources && filters.minSources > 1) params.set("sources", String(filters.minSources));
  if (filters.sortBy && filters.sortBy !== "signal") params.set("sort", filters.sortBy);
  if (filters.query) params.set("q", filters.query);
  if (filters.storyId) params.set("story", filters.storyId);
  return params;
}

function parseList<T extends string>(raw: string | null): T[] {
  if (!raw) return [];
  return raw.split(",").filter(Boolean) as T[];
}
```

#### The `useFilters` Hook

Wraps `useSearchParams` with the codec, providing typed getters and setters. Components never touch `useSearchParams` directly.

```typescript
// app/hooks/useFilters.ts

import { useSearchParams } from "react-router";
import { useCallback } from "react";
import { parseFilters, serializeFilters, DEFAULT_FILTERS } from "~/lib/filter-codec";
import type { FilterState } from "~/lib/filter-codec";

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);

  const setFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const merged = { ...filters, ...updates };
      setSearchParams(serializeFilters(merged), { replace: true });
    },
    [filters, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const isDefault = searchParams.toString() === "";

  return { filters, setFilters, resetFilters, isDefault };
}
```

**Key decision: `replace: true`.** Filter changes replace history entries rather than pushing new ones. Without this, toggling a bias tier 7 times creates 7 back-button entries. Journalists would rage.

### UI Chrome State: Context + Reducer

```typescript
// app/contexts/chrome.tsx

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

interface ChromeState {
  sidebarCollapsed: boolean;
  wireCollapsed: boolean;        // left panel
  dossierCollapsed: boolean;     // right panel
  activePanel: "wire" | "lens" | "dossier";
  commandPaletteOpen: boolean;
  theme: "light" | "dark" | "system";
}

type ChromeAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "TOGGLE_WIRE" }
  | { type: "TOGGLE_DOSSIER" }
  | { type: "SET_ACTIVE_PANEL"; panel: ChromeState["activePanel"] }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "CLOSE_COMMAND_PALETTE" }
  | { type: "SET_THEME"; theme: ChromeState["theme"] }
  | { type: "CYCLE_PANEL" };

const STORAGE_KEY = "triangulate-chrome";

function getInitialState(): ChromeState {
  // Server-safe: return defaults during SSR
  if (typeof window === "undefined") {
    return {
      sidebarCollapsed: false,
      wireCollapsed: false,
      dossierCollapsed: false,
      activePanel: "wire",
      commandPaletteOpen: false,
      theme: "system",
    };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Never persist commandPaletteOpen as true
      return { ...parsed, commandPaletteOpen: false };
    }
  } catch {}
  return {
    sidebarCollapsed: false,
    wireCollapsed: false,
    dossierCollapsed: false,
    activePanel: "wire",
    commandPaletteOpen: false,
    theme: "system",
  };
}

const PANEL_CYCLE: ChromeState["activePanel"][] = ["wire", "lens", "dossier"];

function chromeReducer(state: ChromeState, action: ChromeAction): ChromeState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "TOGGLE_WIRE":
      return { ...state, wireCollapsed: !state.wireCollapsed };
    case "TOGGLE_DOSSIER":
      return { ...state, dossierCollapsed: !state.dossierCollapsed };
    case "SET_ACTIVE_PANEL":
      return { ...state, activePanel: action.panel };
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    case "CLOSE_COMMAND_PALETTE":
      return { ...state, commandPaletteOpen: false };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "CYCLE_PANEL": {
      const idx = PANEL_CYCLE.indexOf(state.activePanel);
      const next = PANEL_CYCLE[(idx + 1) % PANEL_CYCLE.length];
      return { ...state, activePanel: next };
    }
    default:
      return state;
  }
}

const ChromeContext = createContext<{
  state: ChromeState;
  dispatch: React.Dispatch<ChromeAction>;
} | null>(null);

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chromeReducer, undefined, getInitialState);

  // Persist to localStorage on every state change (except commandPaletteOpen)
  useEffect(() => {
    const { commandPaletteOpen, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [state]);

  return (
    <ChromeContext.Provider value={{ state, dispatch }}>
      {children}
    </ChromeContext.Provider>
  );
}

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used within ChromeProvider");
  return ctx;
}
```

### Theme State

Theme currently lives in `root.tsx` as `useState` + inline `<script>`. That inline script (the FOUC-prevention trick) stays. But theme management moves into the Chrome context so any component can read/write it. The inline script is the SSR bootstrap; the context is the runtime truth.

### Summary: What Goes Where

```
URL searchParams ──> Filter state (bias, region, time, etc.)
                      Triggers loader revalidation on change
                      Shareable, bookmarkable

ChromeContext ─────> Panel collapse, sidebar, active panel, theme
                      Persisted to localStorage
                      Not in URL (layout is personal preference)

useLoaderData ─────> Stories, faceted counts, user profile
                      Fresh on every navigation/revalidation
                      Server-authoritative
```

---

## 2. Data Loading Pattern

### The Faceted Count Problem

The filter system needs to show distribution counts for every dimension, excluding its own active filter. Example: if the user filters to `region=US`, the bias tier counts should show how many US stories exist per tier, but the region counts should show totals across ALL regions (so the user can see what they would get by switching).

This is called "faceted search" and it is the same pattern used by Amazon product filters, Elasticsearch aggregations, and JIRA dashboards.

### Loader Strategy: Single Loader, Parallel Queries

The dashboard route (`/dashboard`) has one loader that runs multiple Prisma queries in parallel. One query fetches the filtered story list; additional queries fetch the faceted counts for each filter dimension.

```typescript
// app/routes/dashboard.tsx (loader only, simplified)

import { parseFilters } from "~/lib/filter-codec";
import { prisma } from "~/lib/prisma";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const filters = parseFilters(url.searchParams);

  // Build the base WHERE clause from all active filters
  const baseWhere = buildWhereClause(filters);

  // Run all queries in parallel
  const [stories, biasFacets, regionFacets, contentFacets, signalFacets] = await Promise.all([
    // 1. The filtered story list
    fetchFilteredStories(baseWhere, filters),

    // 2. Bias tier counts -- apply ALL filters EXCEPT bias
    fetchBiasFacets(excludeFilter(filters, "biasTiers")),

    // 3. Region counts -- apply ALL filters EXCEPT region
    fetchRegionFacets(excludeFilter(filters, "regions")),

    // 4. Content type counts -- apply ALL filters EXCEPT contentType
    fetchContentFacets(excludeFilter(filters, "contentType")),

    // 5. Trust signal counts -- apply ALL filters EXCEPT trustSignal
    fetchSignalFacets(excludeFilter(filters, "trustSignal")),
  ]);

  return {
    stories,
    facets: {
      biasTiers: biasFacets,
      regions: regionFacets,
      contentTypes: contentFacets,
      trustSignals: signalFacets,
    },
    filters,
  };
}
```

#### The `buildWhereClause` Function

Translates the `FilterState` into a Prisma `where` object. This is the core query builder and the only place filter-to-SQL mapping lives.

```typescript
// app/lib/filter-queries.ts

import type { FilterState } from "~/lib/filter-codec";
import type { Prisma } from "@prisma/client";

export function buildWhereClause(filters: FilterState): Prisma.StoryWhereInput {
  const where: Prisma.StoryWhereInput = {
    lastAnalyzedAt: { not: null },
  };

  // Time range
  const timeMap: Record<string, number> = {
    "4h": 4, "12h": 12, "24h": 24, "48h": 48, "7d": 168,
  };
  const hours = timeMap[filters.timeRange] || 24;
  where.createdAt = { gte: new Date(Date.now() - hours * 60 * 60 * 1000) };

  // Bias tiers (filter on articles' sources)
  if (filters.biasTiers.length > 0) {
    where.articles = {
      some: {
        source: { biasTier: { in: filters.biasTiers } },
      },
    };
  }

  // Regions
  if (filters.regions.length > 0) {
    where.articles = {
      ...where.articles,
      some: {
        ...((where.articles as any)?.some || {}),
        source: {
          ...((where.articles as any)?.some?.source || {}),
          region: { in: filters.regions },
        },
      },
    };
  }

  // Content type
  if (filters.contentType !== "ALL") {
    where.articles = {
      ...where.articles,
      some: {
        ...((where.articles as any)?.some || {}),
        contentType: filters.contentType,
      },
    };
  }

  // Minimum source count
  if (filters.minSources > 1) {
    where.articles = {
      ...where.articles,
      // Prisma doesn't support count-based filtering in `where` directly.
      // This is handled in post-processing or via a raw query.
      // See "Source Count Filtering" section below.
    };
  }

  // Convergence threshold
  if (filters.convergenceMin > 0) {
    where.claims = {
      some: {
        convergenceScore: { gte: filters.convergenceMin / 100 },
      },
    };
  }

  // Text search
  if (filters.query) {
    where.generatedTitle = {
      contains: filters.query,
      mode: "insensitive",
    };
  }

  return where;
}

export function excludeFilter(
  filters: FilterState,
  exclude: keyof FilterState
): FilterState {
  return { ...filters, [exclude]: (typeof filters[exclude] === "string" ? "" : []) };
}
```

#### Faceted Count Queries

Each facet query uses `groupBy` to count stories per dimension value, applying all filters except its own.

```typescript
// app/lib/filter-queries.ts (continued)

export async function fetchBiasFacets(
  filters: FilterState
): Promise<Record<string, number>> {
  const where = buildWhereClause(filters);

  // Count articles per bias tier within matching stories
  const results = await prisma.article.groupBy({
    by: ["sourceId"],
    where: {
      story: where,
    },
    _count: true,
  });

  // We need to join through to source.biasTier.
  // Prisma groupBy doesn't support nested field grouping.
  // Strategy: use a raw query for this specific aggregation.

  const facets = await prisma.$queryRaw<Array<{ bias_tier: string; count: bigint }>>`
    SELECT s."biasTier" as bias_tier, COUNT(DISTINCT st.id) as count
    FROM stories st
    JOIN articles a ON a."storyId" = st.id
    JOIN sources s ON a."sourceId" = s.id
    WHERE st."lastAnalyzedAt" IS NOT NULL
      AND st."createdAt" >= ${new Date(Date.now() - getHoursMs(filters.timeRange))}
    GROUP BY s."biasTier"
  `;

  return Object.fromEntries(
    facets.map((f) => [f.bias_tier, Number(f.count)])
  );
}
```

**Why raw queries for facets:** Prisma's `groupBy` cannot group by a field on a related table (e.g., group stories by `article.source.biasTier`). The alternatives are: (a) fetch all stories and count client-side (wasteful), (b) use raw SQL (correct). For 5 parallel facet queries against indexed columns, raw SQL runs in under 50ms total on Neon.

#### Source Count Filtering

Prisma does not support `WHERE COUNT(articles) >= N` in a typed `where` clause. Two options:

**Option A: Raw SQL for the story query when minSources > 1**
```sql
SELECT st.* FROM stories st
WHERE st.id IN (
  SELECT a."storyId" FROM articles a
  GROUP BY a."storyId"
  HAVING COUNT(*) >= $1
)
AND st."lastAnalyzedAt" IS NOT NULL
```

**Option B: Fetch with `_count` include and filter in application code**
```typescript
const stories = await prisma.story.findMany({
  where: baseWhere,
  include: { _count: { select: { articles: true } } },
});
return stories.filter(s => s._count.articles >= filters.minSources);
```

Option B is acceptable for our scale (sub-1000 stories). It avoids raw SQL for the primary query while keeping the Prisma type safety. The facet queries already use raw SQL, so Option B keeps the typed/untyped boundary clean.

### Caching Strategy

**Layer 1: HTTP Cache-Control headers**
The loader sets `Cache-Control: private, max-age=60` on dashboard responses. Filter changes produce different URLs, so the browser cache keys correctly by filter state. Stale data is acceptable for 60 seconds; news convergence is not millisecond-critical.

**Layer 2: React Router's built-in cache**
React Router v7 caches loader data per route. Navigating away and back reuses cached data until revalidation triggers. This is free.

**Layer 3: Stale-while-revalidate via `shouldRevalidate`**
When only the selected story changes (URL param `story` changed but filters did not), we can skip revalidating the story list. The `shouldRevalidate` function on the dashboard route makes this explicit:

```typescript
// app/routes/dashboard.tsx

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: {
  currentUrl: URL;
  nextUrl: URL;
  defaultShouldRevalidate: boolean;
}) {
  const currentFilters = new URLSearchParams(currentUrl.search);
  const nextFilters = new URLSearchParams(nextUrl.search);

  // If only the story selection changed, don't refetch the list
  currentFilters.delete("story");
  nextFilters.delete("story");

  if (currentFilters.toString() === nextFilters.toString()) {
    return false;
  }

  return defaultShouldRevalidate;
}
```

**Layer 4: No additional client-side cache (intentional)**
We do not add React Query, SWR, or any client-side caching layer. The React Router loader cache + HTTP cache + `shouldRevalidate` is sufficient. Adding another cache layer creates cache invalidation nightmares and doubles the conceptual overhead.

---

## 3. Component Architecture

### The Three Trees

The component architecture has three independent subtrees that communicate through shared context and URL state. They do not pass data to each other via props.

```
<ChromeProvider>
  <DashboardLayout>
    +-----------------------+-----------------------------+---------------------+
    |  <WirePanel>          |  <LensPanel>                |  <DossierPanel>     |
    |    <FilterBar />      |    <StoryDetail />          |    <ClaimsTracker /> |
    |    <StoryList />      |    OR <ConvergenceOverview> |    <SourceList />    |
    |    <ConvergenceMini/> |                             |    <PrimaryDocs />   |
    +-----------------------+-----------------------------+---------------------+
  </DashboardLayout>
</ChromeProvider>
```

### Communication Patterns

**Between panels:** URL search params. When `WirePanel` selects a story, it calls `setFilters({ storyId: "abc" })`. The `LensPanel` reads `filters.storyId` from the same `useFilters()` hook. No events, no prop drilling, no cross-panel refs.

**Between filter bar and story list:** Both are children of `WirePanel`. The filter bar calls `setFilters(...)`, which updates the URL, which triggers a loader revalidation, which provides new `useLoaderData()` to the entire route. The story list reads from `useLoaderData()`. Unidirectional data flow, mediated by the URL.

**Between layout shell and panels:** The `DashboardLayout` reads `useChrome()` to determine panel widths and collapse states. Panels read `useChrome()` to know if they are the active panel (for keyboard navigation focus). The layout does not pass data to panels; it passes spatial coordinates (widths, visibility).

### Panel System Component

The panel system uses CSS Grid with `grid-template-columns` driven by the chrome state. No JS layout engine. No render props. The layout is a CSS-first solution with JS controlling the grid template values.

```typescript
// app/components/dashboard/DashboardLayout.tsx

import { useChrome } from "~/contexts/chrome";
import type { ReactNode } from "react";

interface DashboardLayoutProps {
  wire: ReactNode;
  lens: ReactNode;
  dossier: ReactNode;
  statusBar: ReactNode;
}

export function DashboardLayout({ wire, lens, dossier, statusBar }: DashboardLayoutProps) {
  const { state } = useChrome();

  const wireWidth = state.wireCollapsed ? "0px" : "280px";
  const dossierWidth = state.dossierCollapsed ? "40px" : "360px";

  return (
    <div
      className="h-screen grid grid-rows-[48px_1fr_28px] overflow-hidden"
      style={{
        gridTemplateColumns: `${wireWidth} 1fr ${dossierWidth}`,
      }}
    >
      {/* Header spans all columns - rendered by parent */}

      {/* Three panels in the middle row */}
      {!state.wireCollapsed && (
        <aside className="overflow-y-auto border-r border-border row-start-2">
          {wire}
        </aside>
      )}
      <main className="overflow-y-auto row-start-2" style={{ gridColumn: state.wireCollapsed ? "1 / -2" : "2" }}>
        {lens}
      </main>
      <aside className="overflow-y-auto border-l border-border row-start-2">
        {dossier}
      </aside>

      {/* Status bar spans all columns */}
      <footer className="col-span-full border-t border-border row-start-3">
        {statusBar}
      </footer>
    </div>
  );
}
```

### Resizable Panels

Panel resizing uses a drag handle between panels. No library needed. The pattern:

```typescript
// app/hooks/useResizable.ts

import { useState, useCallback, useRef, useEffect } from "react";

export function useResizable(
  initialWidth: number,
  minWidth: number,
  maxWidth: number,
  side: "left" | "right"
) {
  const [width, setWidth] = useState(initialWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const delta = side === "left"
        ? e.clientX - startX.current
        : startX.current - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      setWidth(newWidth);
    }

    function onMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [minWidth, maxWidth, side]);

  return { width, onMouseDown };
}
```

The drag handle is a 4px-wide `<div>` between panels with `cursor: col-resize`. On drag, it updates a local `width` state that feeds into the parent grid's `grid-template-columns`. Since this state is frame-rate-critical (mouse move events at 60fps), it lives in local component state, not in the Chrome context. On drag end, the final width persists to localStorage via the Chrome context.

### Component Boundaries: What Each Panel Owns

**WirePanel** owns:
- `FilterBar` (reads/writes filters via `useFilters`)
- `StoryList` (reads stories from `useLoaderData`, reads filters for highlighting)
- `ConvergenceMinimap` (reads aggregate stats from `useLoaderData`)

**LensPanel** owns:
- Conditional rendering based on `filters.storyId`:
  - If null: `<ConvergenceOverview>` (aggregate dashboard)
  - If set: `<StoryDetail>` (fetched via a nested route or a separate loader)

**DossierPanel** owns:
- Conditional rendering based on `filters.storyId`:
  - If null: `<TrendingClaims>`, `<GlobalStats>`
  - If set: `<ClaimsTracker>`, `<PrimarySourceList>`, `<SourceIntelligence>`

### Story Detail Loading: Nested Route vs. Client Fetch

Two options for loading story detail when a story is selected:

**Option A: Nested route** (`/dashboard/story/:id`)
- React Router loads the child route's loader in parallel
- URL is shareable
- Standard Remix pattern
- Downside: Feels like navigation (browser history entry, potential flash)

**Option B: Client-side fetch via `useFetcher`**
- `useFetcher` calls `/api/stories/:id` when `storyId` changes
- No navigation, no history entry
- Panel updates feel instant (optimistic, then resolves)
- URL contains `?story=abc` for shareability

**Decision: Option B (useFetcher).** The three-panel layout is a single-page paradigm. Story selection should not feel like page navigation. The `?story=abc` param provides shareability. The `useFetcher` approach uses the existing `/api/stories/:id` endpoint, keeping the loader/API boundary clean.

```typescript
// app/components/dashboard/LensPanel.tsx

import { useFetcher } from "react-router";
import { useEffect } from "react";
import { useFilters } from "~/hooks/useFilters";

export function LensPanel() {
  const { filters } = useFilters();
  const fetcher = useFetcher();

  useEffect(() => {
    if (filters.storyId && fetcher.state === "idle") {
      fetcher.load(`/api/stories/${filters.storyId}`);
    }
  }, [filters.storyId]);

  if (!filters.storyId) return <ConvergenceOverview />;
  if (fetcher.state === "loading") return <StoryDetailSkeleton />;
  if (fetcher.data) return <StoryDetail story={fetcher.data} />;
  return null;
}
```

---

## 4. Keyboard Navigation Architecture

### Design Principles

1. **Shortcuts never conflict with browser defaults.** No `Ctrl+T`, `Ctrl+W`, `Ctrl+L`, etc.
2. **Shortcuts layer by context.** Global shortcuts work everywhere. Panel-specific shortcuts work only when that panel is focused. Modal shortcuts work only when a modal is open.
3. **No single-key shortcuts fire when an input is focused.** If the user is typing in the search bar, pressing `j` types "j", it does not move to the next story.

### Shortcut Layers

```
Layer 0: Global (always active unless input is focused)
  Cmd+K         Command palette
  F6            Cycle active panel (wire -> lens -> dossier -> wire)
  Escape        Close any open overlay (palette, modal, expanded panel)
  ?             Open keyboard shortcuts reference
  /             Focus search input (like Gmail)

Layer 1: Wire Panel (active when wire panel has focus)
  j / ArrowDown     Next story
  k / ArrowUp       Previous story
  Enter             Select story (loads into Lens + Dossier)
  f                 Toggle filter bar expanded/collapsed
  1-7               Toggle bias tiers (1=FAR_LEFT ... 7=FAR_RIGHT)
  r                 Reset all filters

Layer 2: Lens Panel (active when lens panel has focus)
  h                 Back to overview (deselect story)
  Tab               Cycle between spectrum columns
  o                 Open current article in new tab

Layer 3: Dossier Panel (active when dossier panel has focus)
  Tab               Cycle between claims
  Enter             Expand/collapse current claim
  c                 Copy citation for current claim (Premium+)

Layer 4: Command Palette (active when palette is open)
  ArrowDown/Up      Navigate results
  Enter             Execute selected action
  Escape            Close palette
  (all other keys go to the search input)
```

### The `useKeyboardNav` Hook

A single hook that manages all shortcut layers. It uses a registration pattern where each panel registers its shortcuts on mount and unregisters on unmount.

```typescript
// app/hooks/useKeyboardNav.ts

import { useEffect, useCallback, useRef } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutRegistration {
  key: string;
  handler: ShortcutHandler;
  layer: number;        // Higher layers take priority
  meta?: boolean;       // Requires Cmd/Ctrl
  shift?: boolean;
  description: string;  // For the shortcuts reference panel
}

// Singleton registry -- shared across all hook instances
const registry: Map<string, ShortcutRegistration[]> = new Map();
let registryVersion = 0;

function makeKey(reg: Pick<ShortcutRegistration, "key" | "meta" | "shift">): string {
  const parts: string[] = [];
  if (reg.meta) parts.push("meta");
  if (reg.shift) parts.push("shift");
  parts.push(reg.key.toLowerCase());
  return parts.join("+");
}

export function useShortcut(registrations: ShortcutRegistration[]) {
  useEffect(() => {
    for (const reg of registrations) {
      const key = makeKey(reg);
      if (!registry.has(key)) registry.set(key, []);
      registry.get(key)!.push(reg);
    }
    registryVersion++;

    return () => {
      for (const reg of registrations) {
        const key = makeKey(reg);
        const list = registry.get(key);
        if (list) {
          const idx = list.indexOf(reg);
          if (idx >= 0) list.splice(idx, 1);
          if (list.length === 0) registry.delete(key);
        }
      }
      registryVersion++;
    };
  }, [registrations]);
}

export function useGlobalKeyboardListener() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Never intercept when user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: Escape and Cmd+K still work in inputs
        if (e.key !== "Escape" && !(e.key === "k" && (e.metaKey || e.ctrlKey))) {
          return;
        }
      }

      const key = makeKey({
        key: e.key,
        meta: e.metaKey || e.ctrlKey,
        shift: e.shiftKey,
      });

      const handlers = registry.get(key);
      if (!handlers || handlers.length === 0) return;

      // Pick the handler with the highest layer number
      const sorted = [...handlers].sort((a, b) => b.layer - a.layer);
      sorted[0].handler(e);
      e.preventDefault();
    }

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}

// Utility: get all registered shortcuts for the reference panel
export function getAllShortcuts(): ShortcutRegistration[] {
  const all: ShortcutRegistration[] = [];
  for (const list of registry.values()) {
    all.push(...list);
  }
  return all.sort((a, b) => a.layer - b.layer);
}
```

### Panel Focus Management

When the user presses F6, the Chrome context cycles `activePanel`. Each panel component uses a `useEffect` to call `.focus()` on its container when it becomes the active panel.

```typescript
// app/hooks/usePanelFocus.ts

import { useRef, useEffect } from "react";
import { useChrome } from "~/contexts/chrome";

export function usePanelFocus(panelName: "wire" | "lens" | "dossier") {
  const ref = useRef<HTMLDivElement>(null);
  const { state } = useChrome();

  useEffect(() => {
    if (state.activePanel === panelName && ref.current) {
      ref.current.focus({ preventScroll: true });
    }
  }, [state.activePanel, panelName]);

  return ref;
}
```

Each panel's root `<div>` gets `tabIndex={-1}` (focusable but not in tab order) and `ref={panelRef}`. This lets the panel receive keyboard events when focused without disrupting normal tab navigation.

### Roving Tabindex in Story List

The story list uses roving tabindex so `j`/`k` move a visual focus indicator between stories without removing them from DOM or using `scrollIntoView` excessively.

```typescript
// app/hooks/useRovingIndex.ts

import { useState, useCallback } from "react";

export function useRovingIndex(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  const moveUp = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const moveDown = useCallback(() => {
    setActiveIndex((i) => Math.min(itemCount - 1, i + 1));
  }, [itemCount]);

  const moveTo = useCallback((index: number) => {
    setActiveIndex(Math.min(itemCount - 1, Math.max(0, index)));
  }, [itemCount]);

  return { activeIndex, moveUp, moveDown, moveTo };
}
```

The active story row gets `aria-selected="true"` and a visual left-edge accent bar. When the active index changes, the story list calls `element.scrollIntoView({ block: "nearest", behavior: "smooth" })` on the newly active row.

### Command Palette

The command palette is a modal overlay registered at the root layout level. It reads all registered shortcuts and available actions from a central action registry.

```typescript
// app/components/command-palette/CommandPalette.tsx

// Structure only -- not full implementation
// - Renders as a fixed overlay (z-50, centered, dimmed backdrop)
// - Input field at top, filterable action list below
// - Actions sourced from: getAllShortcuts() + navigation routes + filter presets
// - Each action row shows: icon, label, keyboard shortcut hint, section grouping
// - Enter executes, Escape closes, ArrowUp/Down navigates
// - Search is fuzzy (simple includes() is fine for <50 actions)
```

---

## 5. Responsive Layout Architecture

### Breakpoint Strategy

| Breakpoint | Name | Layout | Panels Visible |
|-----------|------|--------|---------------|
| >= 1280px | Desktop | 3-panel grid | Wire + Lens + Dossier |
| 768-1279px | Tablet | 2-panel grid | Wire + Lens (Dossier as slide-over) |
| < 768px | Mobile | Single panel + bottom sheet | One panel at a time |

### Implementation: CSS Grid + Container Queries, No Duplication

The panel components render once. The layout shell changes the grid template based on viewport width. Panels that are not visible at a given breakpoint are not removed from the DOM -- they are hidden via `display: none` on the grid container and revealed when the user explicitly opens them.

```css
/* app/app.css -- layout grid */

.dashboard-grid {
  display: grid;
  grid-template-rows: 48px 1fr 28px;
  height: 100vh;
  overflow: hidden;
}

/* Desktop: 3 panels */
@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: var(--wire-width, 280px) 1fr var(--dossier-width, 360px);
  }
}

/* Tablet: 2 panels */
@media (min-width: 768px) and (max-width: 1279px) {
  .dashboard-grid {
    grid-template-columns: var(--wire-width, 240px) 1fr;
  }
  .dashboard-grid .dossier-panel {
    display: none; /* Rendered as slide-over instead */
  }
}

/* Mobile: 1 panel */
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-grid .wire-panel {
    display: none; /* Rendered as bottom sheet */
  }
  .dashboard-grid .dossier-panel {
    display: none;
  }
}
```

### Mobile: Bottom Sheet for Wire

On mobile, the Wire panel becomes a bottom sheet that slides up from the bottom of the screen. The user sees the Lens panel (story detail or overview) as the primary view. Tapping a "Stories" FAB or swiping up reveals the story list.

This uses a single `<WirePanel>` component. On mobile, it is wrapped in a `<BottomSheet>` container. On desktop, it renders directly in the grid. The panel component itself is identical -- the container changes.

```typescript
// app/components/dashboard/ResponsiveWire.tsx

import { useMediaQuery } from "~/hooks/useMediaQuery";
import { WirePanel } from "./WirePanel";
import { BottomSheet } from "~/components/ui/BottomSheet";

export function ResponsiveWire() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <BottomSheet trigger={<WireFab />}>
        <WirePanel />
      </BottomSheet>
    );
  }

  // On desktop/tablet, rendered directly by the grid layout
  return <WirePanel />;
}
```

### Tablet: Dossier as Slide-Over

On tablet, the Dossier panel is hidden by default but available as a slide-over panel triggered by a button or keyboard shortcut (`]`). Same `<DossierPanel>` component, different container.

### The `useMediaQuery` Hook

```typescript
// app/hooks/useMediaQuery.ts

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    function handler(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

**SSR safety:** Returns `false` during SSR. The CSS handles the initial layout via media queries. The JS hook only controls the container wrapping (bottom sheet vs. grid child), which is a client-only concern. There is no hydration mismatch because the panel content is the same either way.

---

## 6. Performance Architecture

### Problem Areas and Solutions

#### 6.1 Faceted Filter Queries (Server)

**Problem:** 5 parallel queries on every filter change.

**Solution stack:**
1. **Indexed columns.** Ensure `articles.storyId`, `sources.biasTier`, `sources.region`, `articles.contentType`, `stories.createdAt`, `claims.convergenceScore` are all indexed. Most already are in the schema.
2. **Query result limit.** The story list caps at 200 results. Facet queries count distinct stories, not all articles. On a dataset of 10K stories, these are sub-50ms queries on Neon.
3. **`shouldRevalidate` gates.** Only refetch when filter params actually changed. Story selection alone does not trigger the facet queries.
4. **HTTP caching.** `Cache-Control: private, max-age=60`. The same filter set returns cached results for 60 seconds. For a news app, 60-second staleness is invisible.

**Monitoring:** Add `Server-Timing` headers to the response so we can measure query time in the browser DevTools Network tab:
```typescript
headers.set("Server-Timing", `db;dur=${Date.now() - start}`);
```

#### 6.2 Story List Rendering (Client)

**Problem:** 100+ story cards, each with a spectrum bar (SVG-rendered convergence gauge).

**Solution stack:**
1. **Virtualization.** Use `react-window` (or a lightweight virtual scroll) for the story list when it exceeds 50 items. The WirePanel has a fixed height (the grid row), making virtualization straightforward.
2. **If virtualization adds too much complexity initially,** start with a simpler approach: render only 40 stories (the current cap), and add "Load more" at the bottom. The filter system will reduce visible items well below 40 in most cases.
3. **Memoize `StoryCard`.** Wrap in `React.memo` with a custom comparator that checks only `id` and `convergenceScore` (the two fields that change over time). Story cards are expensive to re-render because of the spectrum bar calculation.

```typescript
// Memoized StoryCard
export const StoryCard = memo(StoryCardInner, (prev, next) => {
  return prev.id === next.id && prev.convergenceScore === next.convergenceScore;
});
```

#### 6.3 Panel Resize (Client)

**Problem:** Dragging a panel divider fires `mousemove` at 60fps, updating `grid-template-columns` each frame.

**Solution:**
1. **CSS custom property update, not state.** During drag, update a CSS custom property directly on the grid element:
```typescript
gridRef.current!.style.setProperty("--wire-width", `${newWidth}px`);
```
This bypasses React re-renders entirely during the drag. Only on `mouseup` do we commit the final width to state/localStorage.

2. **`will-change: grid-template-columns`** on the grid container during drag (added on `mousedown`, removed on `mouseup`) to hint the browser to promote the grid to a compositor layer.

3. **`contain: layout`** on each panel to prevent reflow from cascading into panel contents during resize.

#### 6.4 Convergence Gauges (Client)

**Problem:** Each story card has a spectrum bar -- potentially 40+ inline SVGs.

**Solution:** These are not SVGs. The current implementation uses a CSS `<div>` with a percentage width and a background color. This is correct and should stay. CSS width animations are GPU-composited. No SVG overhead.

For the story detail page's larger convergence visualizations (claim convergence bars, spectrum panel), use `<canvas>` only if we determine that SVG is a bottleneck. For the expected data volumes (sub-50 claims per story), SVG is fine.

#### 6.5 Filter Transition Smoothness (Client)

**Problem:** Changing a filter triggers a loader revalidation (server round-trip), during which the story list might flash or show stale data.

**Solution: Optimistic UI via `useNavigation`.**

```typescript
// app/components/dashboard/WirePanel.tsx

import { useNavigation, useLoaderData } from "react-router";

export function WirePanel() {
  const navigation = useNavigation();
  const data = useLoaderData();
  const isRevalidating = navigation.state === "loading";

  return (
    <div className={isRevalidating ? "opacity-70 transition-opacity duration-150" : ""}>
      <StoryList stories={data.stories} />
    </div>
  );
}
```

When the loader is fetching, the list dims to 70% opacity (150ms transition). The old data remains visible. When new data arrives, it replaces the old list and opacity snaps back to 100%. No loading spinner, no skeleton, no layout shift. The user sees a subtle "processing" signal and then updated results. This is the pattern used by Linear and Notion.

---

## 7. Feature Gating Architecture

### The Problem

Four tiers: FREE, STANDARD, PREMIUM, JOURNALIST. Different features are available at each tier. The codebase currently has `UserTier` as a Prisma enum and the user's tier is loaded in the root layout loader.

### The Wrong Way: if/else in Components

```typescript
// DO NOT DO THIS
function ClaimsTracker({ claims, userTier }) {
  if (userTier === "FREE") {
    return <UpgradeBanner />;
  }
  if (userTier === "FREE" || userTier === "STANDARD") {
    // show limited claims
  }
  // ...
}
```

This scatters tier logic across every component, making it impossible to audit what each tier gets.

### The Right Way: Capability Map + Gate Component

**Step 1: Define capabilities, not tiers.**

```typescript
// app/lib/capabilities.ts

import type { UserTier } from "~/types";

// Every gated feature is a named capability
export type Capability =
  | "view_stories"          // All tiers
  | "view_claims"           // STANDARD+
  | "view_full_spectrum"    // STANDARD+
  | "search"                // STANDARD+ (limited), PREMIUM+ (unlimited)
  | "filter_presets"        // PREMIUM+
  | "watchlist"             // PREMIUM+
  | "export_data"           // JOURNALIST
  | "api_access"            // JOURNALIST
  | "share_cards"           // PREMIUM+
  | "saved_searches"        // PREMIUM+
  | "keyboard_shortcuts"    // All tiers (free engagement hook)
  | "command_palette"       // STANDARD+
  | "ai_roundtable"        // PREMIUM+
  ;

const TIER_CAPABILITIES: Record<UserTier, Set<Capability>> = {
  FREE: new Set([
    "view_stories",
    "keyboard_shortcuts",
  ]),
  STANDARD: new Set([
    "view_stories",
    "view_claims",
    "view_full_spectrum",
    "search",
    "keyboard_shortcuts",
    "command_palette",
  ]),
  PREMIUM: new Set([
    "view_stories",
    "view_claims",
    "view_full_spectrum",
    "search",
    "filter_presets",
    "watchlist",
    "share_cards",
    "saved_searches",
    "keyboard_shortcuts",
    "command_palette",
    "ai_roundtable",
  ]),
  // JOURNALIST is not in the current Prisma enum but maps conceptually
  // For now, treat PREMIUM as the top tier. Add JOURNALIST when the tier exists.
};

export function hasCapability(tier: UserTier, capability: Capability): boolean {
  return TIER_CAPABILITIES[tier]?.has(capability) ?? false;
}

export function getCapabilities(tier: UserTier): Set<Capability> {
  return TIER_CAPABILITIES[tier] ?? new Set();
}
```

**Step 2: Server-side gate in loaders.**

Loaders check capabilities before returning data. A FREE user's loader response simply does not include claim details. The client never receives data it should not show.

```typescript
// In the dashboard loader
const capabilities = getCapabilities(user?.tier ?? "FREE");

const stories = await fetchFilteredStories(baseWhere, filters);

// Gate claim data server-side
const storiesWithGating = stories.map(s => ({
  ...s,
  claims: capabilities.has("view_claims") ? s.claims : [],
  claimCount: s._count.claims, // Always show the count (teaser)
}));
```

**Step 3: Client-side `<Gate>` component for UI gating.**

```typescript
// app/components/ui/Gate.tsx

import { useRouteLoaderData } from "react-router";
import { hasCapability, type Capability } from "~/lib/capabilities";
import type { UserTier } from "~/types";

interface GateProps {
  capability: Capability;
  children: React.ReactNode;
  fallback?: React.ReactNode;  // What to show when gated (default: nothing)
}

export function Gate({ capability, children, fallback = null }: GateProps) {
  const rootData = useRouteLoaderData("root") as { user: { tier: UserTier } | null };
  const tier = rootData?.user?.tier ?? "FREE";

  if (hasCapability(tier, capability)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
```

**Step 4: Usage in components.**

```typescript
// In DossierPanel
<Gate
  capability="view_claims"
  fallback={
    <UpgradeTeaser
      feature="Claim Analysis"
      description="See extracted claims with convergence scores"
      tier="STANDARD"
    />
  }
>
  <ClaimsTracker claims={story.claims} />
</Gate>

// In WirePanel filter bar
<Gate capability="filter_presets">
  <FilterPresetSelector />
</Gate>

// In Header
<Gate capability="watchlist">
  <WatchlistButton />
</Gate>
```

**Step 5: The `<UpgradeTeaser>` component.**

Gated features do not just disappear. They show a subtle, non-annoying teaser that communicates what the user would get at a higher tier. This is the freemium funnel.

```typescript
// app/components/ui/UpgradeTeaser.tsx

interface UpgradeTeaserProps {
  feature: string;
  description: string;
  tier: "STANDARD" | "PREMIUM" | "JOURNALIST";
}

export function UpgradeTeaser({ feature, description, tier }: UpgradeTeaserProps) {
  return (
    <div className="border border-dashed border-border rounded-sm p-4 text-center">
      <p className="text-sm font-medium text-ink-muted mb-1">{feature}</p>
      <p className="text-xs text-ink-faint mb-3">{description}</p>
      <a
        href="/pricing"
        className="text-xs font-medium text-brand-green hover:underline"
      >
        Available with {tier} -- Learn more
      </a>
    </div>
  );
}
```

### Founder Override

During the founder phase (`IS_FOUNDER_PHASE=true`), all founders get PREMIUM capabilities regardless of their stored tier. This is handled at the capability lookup level:

```typescript
export function getEffectiveTier(user: { tier: UserTier; isFounder: boolean } | null): UserTier {
  if (!user) return "FREE";
  if (user.isFounder && isFounderPhase()) return "PREMIUM";
  return user.tier;
}
```

---

## 8. File Structure

### New Files to Create

```
app/
  contexts/
    chrome.tsx                  # ChromeProvider (panel state, theme, etc.)

  hooks/
    useFilters.ts               # URL-based filter state
    useChrome.ts                # Re-export from contexts/chrome for convenience
    useKeyboardNav.ts           # Shortcut registration + global listener
    useShortcut.ts              # Single-shortcut convenience hook
    usePanelFocus.ts            # Panel focus management
    useRovingIndex.ts           # Roving tabindex for lists
    useResizable.ts             # Panel resize drag handle
    useMediaQuery.ts            # Responsive breakpoint detection

  lib/
    filter-codec.ts             # FilterState <-> URLSearchParams
    filter-queries.ts           # FilterState -> Prisma where clauses + facet queries
    capabilities.ts             # Tier -> capability map + hasCapability()

  components/
    dashboard/
      DashboardLayout.tsx       # Three-panel grid shell
      WirePanel.tsx             # Left panel: filters + story list
      LensPanel.tsx             # Center panel: story detail or overview
      DossierPanel.tsx          # Right panel: claims, sources, docs
      StatusBar.tsx             # Bottom status bar
      PanelDivider.tsx          # Resizable drag handle between panels
    command-palette/
      CommandPalette.tsx        # Cmd+K modal overlay
      CommandPaletteProvider.tsx # Action registry context
    ui/
      Gate.tsx                  # Feature gating component
      UpgradeTeaser.tsx         # Gated feature teaser
      BottomSheet.tsx           # Mobile bottom sheet container
      SlideOver.tsx             # Tablet slide-over panel container

  routes/
    dashboard.tsx               # The command center route (replaces home.tsx)
    dashboard.story.$id.tsx     # Optional: nested route for deep-linkable story
```

### Files to Modify

```
app/root.tsx                    # Wrap in ChromeProvider, add useGlobalKeyboardListener
app/routes.ts                   # Add dashboard route, keep home.tsx as marketing landing
app/routes/home.tsx             # Becomes the public landing page (pre-login only)
app/components/feed/StoryCard.tsx  # Adapt for compact WirePanel row format
app/components/layout/Header.tsx   # Replace with command-center header bar
```

### Files to Keep As-Is

```
app/lib/convergence.ts          # Scoring algorithm -- untouched
app/lib/auth.ts                 # Session management -- untouched
app/lib/prisma.ts               # Prisma client -- untouched
app/lib/constants.ts            # App constants -- untouched
app/types/index.ts              # Type definitions -- extend, don't replace
app/routes/api.*.ts             # All API routes -- untouched
app/routes/pricing.tsx          # Pricing page -- untouched
app/routes/auth.*.tsx           # Auth routes -- untouched
```

---

## 9. Migration Plan

### Phase 1: Foundation (build order matters)

1. **`filter-codec.ts`** -- The filter serialization module. Zero dependencies. Test it in isolation.
2. **`capabilities.ts`** -- The capability map. Zero dependencies. Test it in isolation.
3. **`chrome.tsx` context** -- The UI chrome state provider. Depends on nothing.
4. **`useFilters.ts` hook** -- Wraps `useSearchParams` with the codec.
5. **`filter-queries.ts`** -- The Prisma query builder. Depends on filter-codec and prisma.
6. **Add database indexes** if missing: `sources.biasTier`, `sources.region`, `stories.createdAt`.

### Phase 2: Layout Shell

7. **`DashboardLayout.tsx`** -- The three-panel grid. Render placeholder content in each panel.
8. **`dashboard.tsx` route** -- New route that uses DashboardLayout. Wire the loader with faceted queries.
9. **`routes.ts`** -- Add the dashboard route. Keep home.tsx as the landing page.
10. **`PanelDivider.tsx`** + **`useResizable.ts`** -- Make panels resizable.

### Phase 3: Panel Content

11. **`WirePanel.tsx`** -- Move StoryList + FilterBar into the wire panel. Use `useFilters` for filter state.
12. **`LensPanel.tsx`** -- Story detail via `useFetcher`, convergence overview as default.
13. **`DossierPanel.tsx`** -- Claims, sources, primary docs. Wire the `<Gate>` components.
14. **`StatusBar.tsx`** -- System health indicators.

### Phase 4: Interaction Layer

15. **`useKeyboardNav.ts`** + **`useGlobalKeyboardListener`** -- Register global shortcuts in root.tsx.
16. **`usePanelFocus.ts`** + **`useRovingIndex.ts`** -- Panel focus cycling and story list navigation.
17. **`CommandPalette.tsx`** -- Cmd+K overlay with action search.
18. **`Gate.tsx`** + **`UpgradeTeaser.tsx`** -- Feature gating components.

### Phase 5: Responsive Adaptation

19. **`useMediaQuery.ts`** -- Breakpoint detection hook.
20. **`BottomSheet.tsx`** -- Mobile wire panel container.
21. **`SlideOver.tsx`** -- Tablet dossier panel container.
22. **CSS media queries** -- Grid template adaptations.

### What This Does NOT Include

- The marketing landing page redesign (separate effort, different concerns)
- The sidebar navigation from INFORMATION-ARCHITECTURE.md (Phase 2 of the overall redesign; the three-panel layout is Phase 1)
- Data visualization components beyond what exists (convergence gauges, spectrum bars are already built)
- Real-time updates via WebSocket/SSE (future; polling with `shouldRevalidate` is sufficient for now)

---

## Architectural Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Filter state storage | URL search params via `useSearchParams` | Shareable, bookmarkable, triggers loader revalidation |
| UI chrome state | React context + `useReducer` + localStorage | Small state surface, no new dependency |
| Server state | Remix loaders + `useLoaderData` | Framework-native, no parallel cache layer |
| Panel communication | Shared URL params (read-only) | No events, no prop drilling, no cross-panel refs |
| Story detail loading | `useFetcher` to `/api/stories/:id` | No navigation feel, shareable via `?story=` param |
| Faceted queries | 5 parallel raw SQL queries in loader | Prisma `groupBy` cannot group by related fields |
| Panel resize | CSS custom property during drag, state on mouseup | Avoids React re-renders at 60fps |
| Responsive layout | CSS Grid media queries + conditional container wrapping | Same components, different spatial containers |
| Feature gating | Capability map + `<Gate>` component + server-side data gating | Single source of truth for tier permissions |
| Keyboard shortcuts | Layered registry with priority resolution | Composable, context-aware, no conflicts |
| Caching | HTTP `Cache-Control` + `shouldRevalidate` | No additional client cache library |
| State management library | None (no Zustand, no Redux, no Jotai) | URL + context + loader data covers all cases |
