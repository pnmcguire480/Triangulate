# TRIANGULATE — ROADMAP TO LAUNCH

> **The Blueprint.** Every task from current state to launch, ordered by dependency, grouped by chunk.
> This is the build plan. Every chunk produces a working, testable increment.
> Decisions are locked. No more architecture debates — just execution.

---

## Locked Design Decisions

| Decision | Answer | Implication |
|----------|--------|-------------|
| Sidebar default | Collapsed on first visit | Users see maximum content area first |
| Filter location | Persistent left sidebar (Bloomberg) | ~320px dedicated filter panel on desktop |
| Mobile priority | First-class | Every component needs a mobile layout from day one |
| Data sonification | Phase 5 opt-in | Build hooks but defer audio engine |
| Convergence Certificate | Split: 1/day free (branded), unlimited Pro (white-label) | Needs @react-pdf/renderer + satori |
| Story Replay | Phase 5 | Build temporal filtering first, replay comes free |
| GCI (Global Convergence Index) | Launch feature | Needs DailyGCI table + cron job |
| New packages | All 8 approved | cmdk, fuse.js, tinykeys, react-resizable-panels, sonner, zustand, @react-pdf/renderer, satori |

---

## Current State (Starting Point)

**What exists and works:**
- 6 pages (Home, Search, Story Detail, Pricing, Sign In, Verify)
- 14 API endpoints (all functional)
- 18 UI components (all rendering)
- Auth system (magic link, founder detection, sessions)
- Stripe integration (checkout, webhooks — needs price IDs)
- AI pipeline (ingest → cluster → analyze via Claude)
- 55+ RSS sources across 7 regions, 7 bias tiers
- Convergence algorithm (tested, 0-1 scale)
- Design system (Tailwind v4, light/dark themes, fonts loaded)
- Database: 8 models, 10 enums, 3 migrations applied
- Vitest configured (broken — path alias fix needed)

**What's stubbed:** Email (console.log), multi-AI (framework exists, no API keys)
**What's broken:** Vitest path alias (`~/types` not resolving)

---

## CHUNK 0: Foundation & Fixes
> **Goal:** Fix what's broken, install new deps, set up the architectural foundation.
> **Estimated tasks:** 8 | **Depends on:** Nothing

### 0.1 — Fix Vitest
- Add `tsconfigPaths()` to `vitest.config.ts` plugins
- Verify all existing tests pass
- **File:** `vitest.config.ts`

### 0.2 — Install New Dependencies
```bash
npm install cmdk fuse.js tinykeys react-resizable-panels sonner zustand @react-pdf/renderer satori
```
- Verify build still works after install
- **File:** `package.json`

### 0.3 — Database Schema Additions
- Add `DailyGCI` model (date, score, breadth, depth, contestation, storyCount)
- Add `Workspace` model (userId, name, state JSON, isDefault)
- Add `SourceMonthlyStats` model (sourceId, month, claimsTotal, claimsConfirmed, confirmationRate)
- Add `Capability` field or handle via code (capabilities.ts)
- Run `npx prisma migrate dev --name command-center-schema`
- **Files:** `prisma/schema.prisma`, new migration

### 0.4 — Design Token Expansion
- Add bias tier color tokens (`--color-bias-far-left` through `--color-bias-far-right`)
- Add region color tokens (`--color-region-us` through `--color-region-global`)
- Add layout dimension tokens (`--shell-topbar-height: 48px`, etc.)
- Add density mode tokens (`--density-row-height`, `--density-body-size`, etc.)
- Fix contrast: `--color-ink-faint` to `#7A7A92` (light) / `#706D88` (dark)
- Fix dark mode border opacity: 6%→18%, 12%→25%
- Add `prefers-reduced-motion` media query block
- Add `forced-colors` media query block
- Add animation timing tokens (micro 150ms, transition 250ms, structural 400ms, data 600ms)
- **File:** `app/app.css`

### 0.5 — Type System Expansion
- Add `FilterState` interface
- Add `FacetCounts` interface
- Add `Capability` type + tier-to-capability map
- Add `WorkspaceState` interface
- Add `PanelLayout` type
- Add `DensityMode` type
- Add component prop interfaces for new components
- **Files:** `app/types/index.ts`, new `app/types/filters.ts`, new `app/types/workspace.ts`, new `app/lib/capabilities.ts`

### 0.6 — Feature Gating System
- Create `app/lib/capabilities.ts` — Capability enum, tier→capability Set map, `hasCapability()` helper
- Create `app/components/shared/Gate.tsx` — `<Gate capability="X" fallback={<UpgradeTeaser />}>`
- Create `app/components/shared/UpgradeTeaser.tsx` — generic upgrade prompt component
- **Files:** new files as listed

### 0.7 — Zustand Store Setup
- Create `app/lib/stores/workspace.ts` — panel sizes, theme, density, sidebar state, active panel
- Configure `persist` middleware → localStorage
- Server sync middleware (debounced 500ms POST to /api/workspace)
- **Files:** new `app/lib/stores/workspace.ts`

### 0.8 — Accessibility Foundation
- Add skip links to `app/root.tsx` ("Skip to main content", "Skip to feed", "Skip to filters")
- Add `id="main-content"` to `<main>`
- Add `aria-label` to both `<nav>` elements in Header
- Add `aria-expanded` to mobile menu toggle
- Replace emoji trust signal icons with SVG + aria-hidden in `app/types/index.ts`
- **Files:** `app/root.tsx`, `app/components/layout/Header.tsx`, `app/types/index.ts`

**Chunk 0 Commit:** `feat: foundation — deps, schema, tokens, types, a11y base`

---

## CHUNK 1: The App Shell
> **Goal:** Replace blog layout with fixed-frame command center.
> **Estimated tasks:** 10 | **Depends on:** Chunk 0

### 1.1 — TopBar Component
- 48px fixed height, full width
- Left: "TRIANGULATE" wordmark (Playfair Display, 16px, tracking 0.08em) + tagline "WHERE ENEMIES AGREE" (9px DM Sans)
- Center: Global search input (32px height, Ctrl+K hint pill)
- Right: Theme toggle, user avatar/initials (28px circle), tier badge
- Mobile: Logo only, search becomes icon button → full-width overlay
- **File:** new `app/components/shell/TopBar.tsx`

### 1.2 — Sidebar Component
- Collapsed: 56px (icons only). Expanded: 240px (icons + labels)
- Default: collapsed on first visit (stored in workspace Zustand store)
- Items: Feed (home), Stories (layers), Search (search), Sources (database), Watchlist (bookmark, greyed), divider, Pricing (credit-card), Settings (gear)
- Active state: 3px left accent bar in brand-green, 6% bg fill
- Mobile: transforms to 56px bottom tab bar (5 icons: Feed, Stories, Search, Sources, More)
- Keyboard: Cmd+B toggle
- **File:** new `app/components/shell/Sidebar.tsx`

### 1.3 — StatusBar Component
- 28px fixed bottom, monospace 11px
- Left: Pipeline dot (green/yellow/red) + "52/55 sources" + "Last: 4m ago"
- Center: Active filter summary pills ("Region: US+EU | Bias: L-CR | Conv ≥ 40")
- Right: GCI number (color-coded) + keyboard mode indicator + tier badge
- Hidden on mobile (< 768px)
- **File:** new `app/components/shell/StatusBar.tsx`

### 1.4 — AppShell Component
- CSS Grid layout: `grid-template-rows: 48px 1fr 28px`, `grid-template-columns: var(--sidebar-width) 1fr`
- Wraps TopBar, Sidebar, StatusBar, and content area (Outlet)
- Content area: `overflow-y: auto` with `scrollbar-thin`
- **File:** new `app/components/shell/AppShell.tsx`

### 1.5 — Replace Root Layout
- Remove `<Header>` and `<Footer>` from root.tsx
- Replace with `<AppShell>` wrapping `<Outlet />`
- Move Footer content (legal links, copyright) to Settings page / StatusBar link
- Add `id="main-content"` to the content area
- **Files:** `app/root.tsx` (major rewrite)

### 1.6 — PanelContainer Component
- Generic panel with: header (36px, title + controls), body (flex-1, scrollable), optional footer (32px)
- Collapsible: header-only when collapsed, `aria-expanded` state
- Tabbed: optional internal tabs in header strip
- `F6` cycling integration (registers panel with focus manager)
- **File:** new `app/components/panels/PanelContainer.tsx`

### 1.7 — PanelResizer Component
- 4px invisible drag handle between panels, cursor: col-resize
- Direct CSS custom property mutation during drag (60fps)
- Commit to Zustand on mouseup
- Keyboard alternative: Ctrl+Shift+Arrow for 50px increments
- `aria-orientation="vertical"` + `role="separator"` + `aria-valuenow`
- **File:** new `app/components/panels/PanelResizer.tsx`

### 1.8 — DashboardLayout Component
- The three-panel grid for the feed view: Wire (story list) | Lens (preview/detail) | Dossier (claims, collapsible)
- CSS Grid: `grid-template-columns: var(--wire-width) var(--lens-width) var(--dossier-width)`
- Panel presets: Quick Scan (wire 100%), Analyst (wire 45%, lens+dossier), Deep Dive (wire 35%, detail 65%)
- Responsive: tablet → 2 panels, mobile → 1 panel + bottom sheet
- **File:** new `app/components/panels/DashboardLayout.tsx`

### 1.9 — Mobile Bottom Tab Bar
- 56px height, fixed bottom, 5 icons
- Feed, Stories, Search, Sources, More (opens sheet with Watchlist, Pricing, Settings)
- Active tab: brand-green accent, filled icon
- Replaces sidebar on < 768px
- **File:** new `app/components/shell/BottomTabBar.tsx`

### 1.10 — Panel Focus Manager
- `usePanelFocus()` hook — registers panels, handles F6 cycling
- `useKeyboardShortcuts()` hook — global listener, input-aware, layer priority
- Status bar shows pending key mode (`g...`)
- `?` overlay for shortcut help
- **Files:** new `app/lib/hooks/usePanelFocus.ts`, `app/lib/hooks/useKeyboardShortcuts.ts`

**Chunk 1 Commit:** `feat: app shell — fixed frame, panels, sidebar, status bar, keyboard nav`

---

## CHUNK 2: The Filter System
> **Goal:** Build the Convergence Lens — the signature filtering experience.
> **Depends on:** Chunk 1

### 2.1 — FilterProvider + useFilterState
- React context wrapping URL search params via `useSearchParams()`
- `FilterState` → URL serialization codec (`filter-codec.ts`)
- `setFilter(key, value)` with `replace: true` (no history pollution)
- `clearAll()` resets to defaults
- All non-default values appear in URL; defaults omitted for clean URLs
- **Files:** new `app/lib/filters/FilterProvider.tsx`, `app/lib/filters/filter-codec.ts`, `app/lib/filters/useFilterState.ts`

### 2.2 — FilterSidebar Component
- 320px persistent left panel (desktop), bottom sheet (mobile)
- Sections: Smart Presets → Spectrum Bar → Time Horizon → Topic Cloud → More Filters disclosure (Region, Convergence, Source Count, Trust Signals) → Advanced disclosure (Outlet Picker, Content Type, Claim Status)
- Journalist Pro users see all sections expanded by default
- **File:** new `app/components/filters/FilterSidebar.tsx`

### 2.3 — BiasSpectrumSelector (The Signature Control)
- 7-segment horizontal bar, each segment clickable (toggle) or drag-to-select range
- Colors: FAR_LEFT `#1E40AF` → CENTER `#6B7280` → FAR_RIGHT `#991B1B`
- Each segment shows story count (from facet data)
- Inactive segments: 20% opacity (not hidden — absence is informative)
- `role="group"` + `aria-pressed` on each segment
- Mobile: full-width, 44px per segment (touch targets)
- **File:** new `app/components/filters/BiasSpectrumSelector.tsx`

### 2.4 — RegionFilter
- Desktop: stylized region pills with count badges + cross-region arcs on selection
- Mobile: scrollable row of region pills
- Multi-select, each pill shows count from facets
- Colors per region from tokens
- `role="group"` with `aria-pressed` toggles
- **File:** new `app/components/filters/RegionFilter.tsx`

### 2.5 — ConvergenceSlider
- Desktop: range slider 0-100 with two handles (min/max)
- Track with 3 zones: red (0-30), amber (30-70), green (70-100)
- Preset snap buttons: "Any", ">30%", ">70%"
- `role="slider"` + `aria-valuenow` + `aria-valuemin/max`
- Debounce URL update by 150ms during drag
- **File:** new `app/components/filters/ConvergenceSlider.tsx`

### 2.6 — TopicCloud
- Weighted tag pills sized by story count
- Toggle on/off, multi-select
- Max 20 visible, "+N more" expansion
- Sizes update live as other filters change
- **File:** new `app/components/filters/TopicCloud.tsx`

### 2.7 — TimeHorizon
- Segmented control: Now (4h) | Today | This Week | This Month | Custom (date picker)
- "Now" option subtly pulses to indicate auto-refresh
- `role="radiogroup"` with `role="radio"` + `aria-checked`
- **File:** new `app/components/filters/TimeHorizon.tsx`

### 2.8 — SourceCountSelector + TrustSignalToggles
- Source count: 5 stepped dots (1-5+), each shows matching story count
- Trust signals: existing TrustSignalBadge components as toggle pills
- Both are `role="group"` with `aria-pressed`
- **Files:** new `app/components/filters/SourceCountSelector.tsx`, `app/components/filters/TrustSignalToggles.tsx`

### 2.9 — SmartPresets (Lenses)
- 7 system presets: Highest Signal, Cross-Spectrum, Left-Right Consensus, Cross-Region, Breaking Now, Deep Dive, My Region
- Each preset = a predefined FilterState, applied on click
- Active preset highlights; modifying any filter deselects to "Custom"
- User-saved views below system presets (Premium gate)
- **File:** new `app/components/filters/SmartPresets.tsx`

### 2.10 — FilterChips + FilterSummary
- Active filter chips below filter sidebar header (32px row, scrollable)
- Each chip: filter name + value + X to remove
- "Reset All" link at far right
- `aria-live="polite"` region announcing filter result count (debounced 500ms)
- **File:** new `app/components/filters/FilterChips.tsx`

### 2.11 — Faceted Query Loader
- Rewrite `home.tsx` loader to return stories + facet counts
- Facet queries: raw SQL groupBy for bias, region, topic, trust signal (each excluding its own filter)
- Story list: typed Prisma query with all filters applied as WHERE clauses
- `shouldRevalidate` export: skip when only `?story=` changed
- Return shape: `{ stories, facets, totalUnfiltered, totalFiltered }`
- **File:** `app/routes/home.tsx` (loader rewrite)

### 2.12 — Cross-Filter Dynamics
- Distribution counters animate (CSS transition or requestAnimationFrame odometer)
- Tag cloud sizes recalculate on filter change
- Zero-result prevention: detect and suggest filter removal
- Empty state: "No stories match. Removing [X] would show [N] stories."
- **Integrated into:** all filter components + FilterSidebar

### 2.13 — Mobile Filter Bottom Sheet
- Trigger: floating action button (48px circle, bottom-right) or filter summary bar tap
- Sheet rises to 85% viewport, drag handle at top
- Contains all filter controls in scrollable column
- Sticky footer: "Showing [N] stories" + "Show Results" dismiss button
- **File:** new `app/components/filters/MobileFilterSheet.tsx`

**Chunk 2 Commit:** `feat: convergence lens — full filter system with faceted queries`

---

## CHUNK 3: The Wire (Feed Redesign)
> **Goal:** Replace the blog-style feed with a command-center story list.
> **Depends on:** Chunk 2

### 3.1 — StoryListRow Component
- Compact: 72-88px per row (replaces StoryCard in the Wire panel)
- Left (48px): ConvergenceGauge mini (sm size, SVG arc)
- Main (flex-1): Headline (14px Playfair, 2 lines max), source pills (outlet names, bias-colored left border, max 5 + "+N"), metadata line (trust signal icon + label, outlet count, claim count, regions)
- Right (64px): Convergence % (18px mono), relative time (10px)
- Bottom: 2px BiasSpectrumBar (inline mode) spanning full row width
- Selected state: 3px left border brand-green, 4% bg fill
- "NEW" / "UPDATED" dot (green) for stories changed since last visit
- `<article>` element, keyboard navigable (roving tabindex via j/k)
- **File:** new `app/components/wire/StoryListRow.tsx`

### 3.2 — WirePanel Component
- PanelContainer with title "The Wire" + story count
- Sticky tier headers: "Highest Signal (N)" / "Developing (N)" / "Single Source (N)"
- Story list with `overflow-y: auto`, `scrollbar-thin`
- `tabIndex={0}` + `role="region"` + `aria-label="Story feed"`
- j/k keyboard navigation between rows
- Click/Enter selects story → sets `?story=ID` in URL
- **File:** new `app/components/wire/WirePanel.tsx`

### 3.3 — "Today's Surprise" Component
- Single line above the Wire: "Fox News and The Guardian agree on 4 facts about [topic]. 91% converged."
- Computed in loader: story with highest convergence where confirming sources have widest ideological spread
- Clickable → selects that story
- Refreshes daily
- **File:** new `app/components/wire/TodaysSurprise.tsx`

### 3.4 — Inline Source Attribution in StoryListRow
- Show top 6 source names color-coded by bias tier inside StoryListRow
- "Confirmed the same N factual claims across M outlets, K bias tiers"
- This IS the 60-second aha moment — enemies agreeing, visible in the feed
- Requires: add top claim source names to loader query
- **Files:** `app/components/wire/StoryListRow.tsx`, `app/routes/home.tsx` (loader addition)

### 3.5 — Feed Dashboard Rewrite
- Replace existing `FeedDashboard.tsx` with the Wire panel architecture
- Hero section, "How It Works", "What We Are/Aren't" → REMOVED from logged-in view
- Logged-out view: keep a condensed hero above the Wire as the landing page
- Logged-in view: straight into the Wire
- **File:** `app/routes/home.tsx` (major rewrite)

### 3.6 — Loading States
- Skeleton rows matching StoryListRow dimensions
- `aria-busy="true"` on Wire panel during loading
- Screen reader: "Loading stories, please wait."
- Use `useNavigation()` to dim list to 70% opacity during revalidation
- **Files:** new `app/components/wire/WireSkeleton.tsx`

**Chunk 3 Commit:** `feat: the wire — command-center feed with inline convergence`

---

## CHUNK 4: The Lens (Story Detail Redesign)
> **Goal:** Story detail as a panel, not a page. 2-click max to any evidence.
> **Depends on:** Chunk 3

### 4.1 — LensPanel Component
- PanelContainer with tabs: "Spectrum" | "Claims" | "Sources" | "Primary Docs"
- Loaded via `useFetcher` when `?story=ID` changes (no navigation)
- Default tab: Spectrum
- If no story selected: empty state — "Click a story to see its convergence analysis"
- **File:** new `app/components/lens/LensPanel.tsx`

### 4.2 — Spectrum Panel (7-Column Upgrade)
- Upgrade ConvergencePanel from 3 columns (Left/Center/Right) to 7 columns (one per bias tier)
- Each column: tier label + color header, scrollable article list
- Articles show: source name, content type badge, title (external link), publishedAt timestamp
- Column height: fill available panel height
- Section aria-label: "Left-leaning sources: 4 outlets"
- Summary at top: "Coverage from 3 left, 2 center, 4 right outlets"
- Mobile: vertical list grouped by tier (not 7 columns)
- **File:** new `app/components/lens/SpectrumPanel.tsx` (replaces ConvergencePanel)

### 4.3 — Claims Panel
- ClaimsTracker upgrade: each claim row with `role="meter"` convergence bar
- `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label` with interpretation
- Supporting sources: green check + badge + `aria-label="Supports"`
- Contradicting sources: red X + badge + `aria-label="Contradicts"`
- "Copy Citation" button per claim (Journalist Pro gate)
- Claims expand inline — no new page
- **File:** new `app/components/lens/ClaimsPanel.tsx` (replaces ClaimsTracker)

### 4.4 — "Show the Math" Section
- Expandable per-claim: "How this score was calculated"
- Renders convergence calculation in plain English (ideological spread, cross-center bonus, etc.)
- New helper: `explainConvergenceScore()` in convergence.ts
- Fringe guard explanation when score is capped
- **Files:** `app/lib/convergence.ts` (add explain function), new `app/components/lens/ConvergenceExplainer.tsx`

### 4.5 — Primary Sources Panel
- PrimarySourceList upgrade with document type badges more prominent
- Icons replaced with SVG (not emoji) + `aria-hidden="true"`
- Each doc: type badge, title as external link, external link icon with `aria-hidden`
- **File:** new `app/components/lens/PrimaryDocsPanel.tsx`

### 4.6 — Story Detail Route Rewrite
- `/story/:id` still works as a direct URL (deep linking)
- When accessed directly: renders AppShell with Wire (story highlighted) + Lens (story loaded)
- When accessed via Wire click: Lens panel loads via fetcher, no navigation
- Breadcrumbs: Feed > Story Title
- **File:** `app/routes/story.$id.tsx` (rewrite)

**Chunk 4 Commit:** `feat: the lens — 7-column spectrum, claims with a11y, show the math`

---

## CHUNK 5: Data Visualization Components
> **Goal:** Build the signature visual language.
> **Depends on:** Chunk 1 (shell), can parallel with Chunks 3-4

### 5.1 — ConvergenceGauge
- SVG semicircular arc, 270 degrees max
- 3 sizes: sm (32px), md (48px), lg (72px)
- Color-graded: red (0-30%), amber (30-70%), green (70-100%)
- Center text: percentage in JetBrains Mono
- Dark mode: `filter: drop-shadow(0 0 4px currentColor)` at 30%
- `role="meter"` with full ARIA
- **File:** new `app/components/dataviz/ConvergenceGauge.tsx`

### 5.2 — BiasSpectrumBar
- 7-segment horizontal bar
- 3 modes: inline (2px, in StoryListRow), compact (6px, in panels), full (24px + labels)
- Colors from bias tier tokens
- Interactive mode: hover tooltips, click to filter
- Colorblind safe: distinct luminance per tier
- **File:** new `app/components/dataviz/BiasSpectrumBar.tsx`

### 5.3 — RegionIndicator
- Row of colored circles (sm 8px, md 12px)
- Active regions filled, inactive `--color-border`
- Tooltip on hover: region name + outlet count
- **File:** new `app/components/dataviz/RegionIndicator.tsx`

### 5.4 — ClaimMatrix
- Truth table grid: columns = sources (sorted by bias), rows = claims (sorted by convergence)
- Cells: green check (supports), red X (contradicts), gray dash (no data)
- Cell size: 28x28px min, source headers rotated 45° for density
- Fixed header, scrollable body
- `<table>` with `<th scope="col/row">` + `<caption>`
- **THE killer visualization** — no competitor has this
- **File:** new `app/components/dataviz/ClaimMatrix.tsx`

### 5.5 — TimelineStrip
- Horizontal SVG, X-axis = time, articles as dots colored by bias tier
- Tooltip: source name + time
- 48px default height, subtle grid lines every 6 hours
- **File:** new `app/components/dataviz/TimelineStrip.tsx`

### 5.6 — GCI Display Components
- GCI sparkline gauge (header widget, 120px wide)
- GCI ticker (status bar, compact number)
- Historical trend line (for Trends page, full width)
- Calculation: breadth (40%) + depth (35%) - contestation penalty (25%)
- **Files:** new `app/components/dataviz/GCIGauge.tsx`, `app/components/dataviz/GCITicker.tsx`

### 5.7 — GCI Computation
- Create `/api/gci` endpoint — computes daily GCI, writes to DailyGCI table
- Schedule: runs after each analysis pipeline completion
- Loader in home.tsx returns today's GCI
- **Files:** new `app/routes/api.gci.ts`, `app/lib/gci.ts`

**Chunk 5 Commit:** `feat: data viz — gauges, spectrum bars, claim matrix, GCI`

---

## CHUNK 6: Professional Tools
> **Goal:** Command palette, keyboard system, workspace, notifications.
> **Depends on:** Chunks 1-2

### 6.1 — Command Palette
- `cmdk` component mounted in AppShell
- Triggered by Cmd+K (search mode) or Cmd+Shift+P (command mode)
- 38 commands across 9 categories (navigation, filtering, panels, story actions, AI, display, export, workspace, help)
- Fuzzy search via fuse.js for stories/sources
- Each result shows keyboard shortcut inline
- **File:** new `app/components/shell/CommandPalette.tsx`

### 6.2 — Keyboard Shortcut System
- `tinykeys` for vim-style sequential shortcuts (G then F, F then R, etc.)
- Layer priority: global (0) → wire (1) → lens (2) → dossier (3) → command palette (4)
- Input-aware: skip shortcuts when in text input/textarea
- Status bar shows pending key mode (`g...`)
- `?` opens shortcut overlay
- **Files:** new `app/lib/hooks/useKeymap.ts`, new `app/components/shell/ShortcutOverlay.tsx`

### 6.3 — Workspace Persistence
- Zustand store (already created in Chunk 0) now fully wired
- Save/load workspaces via Cmd+S / command palette
- API endpoint: `/api/workspace` (POST save, GET load)
- Named workspaces: 5 for Premium, unlimited for Pro
- Anonymous users: localStorage only
- **Files:** new `app/routes/api.workspace.ts`, update `app/lib/stores/workspace.ts`

### 6.4 — Notification System
- SSE endpoint: `/api/notifications/stream`
- Toast rail via `sonner` (right edge, max 3 visible)
- Triggers: convergence threshold crossed, new contradiction, cluster threshold
- Browser Notification API for high-urgency when tab hidden (opt-in after first watch)
- **Files:** new `app/routes/api.notifications.stream.ts`, new `app/components/shell/NotificationToast.tsx`

### 6.5 — Density Mode Toggle
- 3 modes: Compact (32px rows), Comfortable (40px, default), Spacious (52px)
- `data-density` attribute on `<html>`, CSS custom properties consumed by components
- DensityProvider context, persisted in workspace store
- Journalist Pro defaults to Compact
- **Files:** new `app/lib/DensityProvider.tsx`, update `app/app.css`

### 6.6 — Data Export
- Export dialog (modal): What, Include checkboxes, Format (CSV/JSON/PDF)
- CSV: client-side Blob + URL.createObjectURL
- JSON: pretty-printed with $schema URL
- PDF: @react-pdf/renderer with Triangulate branding
- Convergence Certificate: PDF + PNG (via satori for OG image dimensions)
- Certificate includes: claim, sources, score, verification hash (SHA-256), QR code
- FREE: 1 certificate/day (branded), Pro: unlimited (white-label option)
- **Files:** new `app/components/export/ExportDialog.tsx`, `app/components/export/ConvergenceCertificate.tsx`, `app/lib/export/csv.ts`, `app/lib/export/pdf.tsx`, `app/lib/export/certificate.ts`

**Chunk 6 Commit:** `feat: pro tools — command palette, shortcuts, workspace, export, notifications`

---

## CHUNK 7: Source Intelligence & Trends
> **Goal:** Browse sources, see credibility trajectories, track convergence over time.
> **Depends on:** Chunks 3-5

### 7.1 — Sources Directory Page
- Route: `/sources`
- Grid of all 55+ outlets, grouped by region then bias tier
- Each source card: name, bias tier color dot, region label, convergence participation rate
- Search/filter within the directory
- **File:** new `app/routes/sources.tsx`

### 7.2 — Source Detail Page
- Route: `/sources/:id`
- Source name, bias tier, region, RSS feed status
- Convergence participation rate (how often this source's claims get confirmed)
- "Frequently converges with" badge list (adversarial sources that often agree)
- Recent stories involving this source
- Monthly trend line of confirmation rate
- **File:** new `app/routes/sources.$id.tsx`

### 7.3 — Source Monthly Stats Computation
- Add to analysis pipeline: after each run, compute per-source stats
- Claims total, claims confirmed by adversarial sources, confirmation rate
- Write to SourceMonthlyStats table
- **Files:** update `app/routes/api.analyze.ts`, new `app/lib/source-stats.ts`

### 7.4 — Trends Page
- Route: `/trends`
- GCI over time (line chart, 30/90/365 day views)
- Topic convergence breakdown (which topics gaining/losing agreement)
- Regional convergence trends
- "Biggest movers" — topics with largest convergence delta this week
- **File:** new `app/routes/trends.tsx`

### 7.5 — Convergence Narratives Engine
- Auto-generated prose for converged stories (>70%)
- Template system: widest ideological pair, claim count, region diversity, historical comparison
- New helper: `generateConvergenceNarrative(story)`
- Displayed in LensPanel header when viewing a converged story
- **Files:** new `app/lib/narratives.ts`, update `app/components/lens/LensPanel.tsx`

### 7.6 — Disagreement Map
- For contested stories: classify disputed claims as IDEOLOGICAL, REGIONAL, INSTITUTIONAL, or RANDOM
- Show which claims split along which lines
- Narrative template: "This claim splits along ideological lines — left-leaning sources support it, right-leaning sources dispute it."
- **Files:** new `app/lib/disagreement.ts`, new `app/components/lens/DisagreementMap.tsx`

### 7.7 — "Why It Matters" Explainer Layer
- Contextual popovers on every metric
- Library of pre-written explainers for: convergence scores (5 bands), trust signals, GCI values, source counts
- Short form (tooltip, <100 chars) + long form (2-4 sentences) + benchmark
- Desktop: popover on hover/focus. Mobile: expandable section.
- **Files:** new `app/lib/explainers.ts`, new `app/components/shared/ExplainerPopover.tsx`

**Chunk 7 Commit:** `feat: source intelligence, trends, narratives, explainers`

---

## CHUNK 8: Auth, Payments & Tier Gating
> **Goal:** Wire up real email, real Stripe, real tier enforcement.
> **Depends on:** Chunk 0 (capabilities), Chunk 6 (export gating)

### 8.1 — Wire Resend for Magic Links
- Install `resend` package
- Replace console.log stub in `/api/auth/send-link` with Resend API call
- Email template: clean, branded, single "Sign In" button
- Fallback: log to console in dev when RESEND_API_KEY not set
- **Files:** `app/routes/api.auth.send-link.ts`, new `app/lib/email.ts`

### 8.2 — Create Stripe Products
- Document: create 2 products in Stripe Dashboard (Premium $7.99/mo, Journalist Pro $14.99/mo)
- Set STRIPE_PREMIUM_PRICE_ID and STRIPE_JOURNALIST_PRICE_ID in .env
- Verify checkout flow end-to-end
- **Files:** `.env` (price IDs), verify `app/routes/api.stripe.checkout.ts`

### 8.3 — Tier Gating Enforcement
- Apply `<Gate>` component throughout the app:
  - Claims detail: Premium+ (FREE sees top 1 claim + upgrade teaser)
  - Search: Premium+ (FREE sees disabled bar with ghost example)
  - Region/content filters: Premium+ (FREE sees greyed with lock icon)
  - Outlet picker: Premium+
  - Saved views: Premium+
  - Export: Premium+ (CSV/JSON), Pro (PDF, Certificate)
  - Named workspaces: Premium (5), Pro (unlimited)
- Server-side: loaders strip claim data for FREE users
- **Files:** multiple components receive `<Gate>` wrappers

### 8.4 — Free Tier Story Limit
- FREE users: 5 stories/day (tracked via cookie or user record)
- After 5: show headlines of next 5 in muted style with divider
- Copy: "Today's edition continues with N more stories. Upgrade to Premium to read the full edition."
- No countdown timer, no urgency language
- **Files:** update `app/routes/home.tsx` (loader + component), new `app/lib/usage-tracking.ts`

### 8.5 — Pricing Page Refresh
- Update pricing page to reflect command-center features
- Feature list per tier should match actual gate implementation
- Add daily cost comparison: "Less than a morning coffee"
- Review "Most Popular" badge for accuracy
- **File:** `app/routes/pricing.tsx`

**Chunk 8 Commit:** `feat: auth + payments — real email, real Stripe, tier enforcement`

---

## CHUNK 9: Search & Triangulation
> **Goal:** Upgrade search from basic text to intelligent convergence search.
> **Depends on:** Chunks 2-4

### 9.1 — Search Page Redesign
- Route: `/search` (keep existing)
- Integrate into AppShell with Wire + Lens panels
- Search results appear in Wire panel as StoryListRows
- Top claim preview inline per result: "Top claim (87% converged): [claim text]"
- `aria-live="polite"` region for result count announcement
- **File:** `app/routes/search.tsx` (rewrite)

### 9.2 — Search-as-Filter Mode
- When searching from the home page, query becomes a text filter on top of all other filters
- Add `query` field to FilterState
- Apply as additional WHERE clause in loader (full-text search on story titles + claim text)
- Feed filters remain active and responsive
- **Files:** update `app/lib/filters/filter-codec.ts`, update `app/routes/home.tsx` loader

### 9.3 — Search API Upgrade
- Upgrade from substring matching to PostgreSQL full-text search (TSVECTOR)
- Add migration: GIN index on Story.generatedTitle + Claim.claimText
- Weight: title 2x, claims 1.5x, source names 1x
- **Files:** `app/routes/api.search.ts`, new Prisma migration

### 9.4 — On-Demand Triangulation
- When search returns no existing matches: offer "Triangulate this topic" button
- Triggers a focused ingest → cluster → analyze cycle for that query
- Premium+ feature
- Shows progress: "Searching 55 sources... Found 8 articles... Clustering... Analyzing claims..."
- **Files:** new `app/routes/api.triangulate.ts`, update `app/routes/search.tsx`

**Chunk 9 Commit:** `feat: search — full-text, search-as-filter, on-demand triangulation`

---

## CHUNK 10: Onboarding & Behavioral Layer
> **Goal:** Engineer the 60-second aha moment and progressive mastery.
> **Depends on:** Chunks 3-4

### 10.1 — First Visit Discovery State
- Filter sidebar: "Try a lens to get started" label, "Highest Signal" preset subtly glowing
- Spectrum bar: single dismissible tooltip "Drag to select a range" (fires once)
- Sidebar: single dismissible banner "These controls are connected"
- Stored in localStorage, never repeated
- **Integrated into:** filter components, no new files

### 10.2 — Progressive Mastery Hints
- After 10+ stories viewed: one-line hint at ClaimsPanel top ("Tip: Claims are scored independently")
- After 3 uses of mouse filter: tooltip adds "Press [key] for shortcut"
- After 20 sessions: status bar suggestion "Try Compact density for more data"
- All hints: show once, stored in localStorage, never repeated
- **Files:** new `app/lib/hooks/useProgressiveTips.ts`

### 10.3 — Contextual Filter Teaching
- When a story involves multiple regions: "View more from [Region]" link that sets the region filter
- When a story has mixed content types: "Show only Reporting" link
- Teaching the filter system through the content
- **Integrated into:** StoryListRow, LensPanel

### 10.4 — Landing Page (Logged-Out)
- Condensed hero: headline, one-line description, CTA buttons
- Below: live Wire panel (read-only, no filters, shows top 5 stories)
- "Today's Surprise" component visible to everyone
- Founder badge if in founder phase
- NO "How It Works" section — the live Wire IS the demo
- **File:** `app/routes/home.tsx` (logged-out conditional)

### 10.5 — Comparative Story Cards
- Detect convergence shifts on same topic over time
- Surface: "This topic had 23% convergence last month; today it's 87%"
- Show as side-by-side mini cards with delta indicator
- Premium feature
- **Files:** new `app/lib/comparisons.ts`, new `app/components/dataviz/ComparisonCard.tsx`

**Chunk 10 Commit:** `feat: onboarding — discovery state, mastery hints, landing page`

---

## CHUNK 11: Pipeline & Data
> **Goal:** Real data flowing, seeded DB, cron jobs running.
> **Depends on:** Chunks 0, 7

### 11.1 — Seed Database
- Run `npx prisma db seed` to populate sources (55+ outlets)
- Verify source coverage across all 7 regions and 7 bias tiers
- **File:** `prisma/seed.ts`

### 11.2 — Run Full Pipeline
- Trigger ingest: `/api/ingest` (fetch RSS from all active sources)
- Trigger cluster: `/api/cluster` (group articles into stories)
- Trigger analyze: `/api/analyze` (extract claims, score convergence, assign trust signals)
- Verify stories appear in the Wire with real convergence data
- **Files:** existing API routes

### 11.3 — GCI Cron Job
- After each analysis run: compute GCI, write to DailyGCI table
- Endpoint: `/api/gci` (POST to compute, GET to read today's)
- Wire into status bar and header gauge
- **Files:** `app/routes/api.gci.ts`, `app/lib/gci.ts`

### 11.4 — Source Stats Cron
- After each analysis run: compute per-source monthly stats
- Write to SourceMonthlyStats table
- **File:** `app/lib/source-stats.ts`

### 11.5 — Pipeline Health Monitoring
- `/api/health` endpoint: returns last ingest time, active source count, pipeline status
- Status bar polls this every 60 seconds
- **File:** new `app/routes/api.health.ts`

**Chunk 11 Commit:** `feat: pipeline — seed, full run, GCI cron, health monitoring`

---

## CHUNK 12: Testing & QA
> **Goal:** Comprehensive tests before launch.
> **Depends on:** All previous chunks

### 12.1 — Unit Tests
- Convergence algorithm (existing, fix to pass)
- Filter codec (serialize/deserialize)
- Capabilities (tier→capability mapping)
- GCI computation
- Convergence narrative generation
- Disagreement classification
- Explainer text generation
- Export: CSV generation, certificate hash

### 12.2 — Component Tests (Vitest + Testing Library)
- ConvergenceGauge renders correct arc percentage
- BiasSpectrumBar renders correct segments
- StoryListRow renders all data fields
- FilterSidebar filter state sync with URL
- Gate component shows/hides based on capability
- CommandPalette opens/searches/executes

### 12.3 — Integration Tests
- Full filter flow: apply filter → loader revalidates → correct stories returned
- Auth flow: send magic link → verify → session created → header updates
- Stripe flow: checkout → webhook → tier upgrade → capabilities unlock
- Search flow: query → results → click → story loads in Lens

### 12.4 — Accessibility Audit
- axe-core automated scan on every page
- Keyboard-only navigation test (Tab through entire app)
- Screen reader test (VoiceOver/NVDA) on key flows
- Contrast checker on all text/background combinations
- Focus management verification (panel cycling, modal traps)

### 12.5 — Mobile Testing
- Every page at 375px, 768px, 1024px, 1440px
- Bottom tab bar navigation
- Filter bottom sheet gesture handling
- Touch targets ≥ 44px verification
- Responsive panel collapse behavior

### 12.6 — Performance Baseline
- Lighthouse score on key pages (target: 90+ performance)
- Largest Contentful Paint < 2.5s
- First Input Delay < 100ms
- Bundle size audit (target: < 300KB JS initial load)

**Chunk 12 Commit:** `test: comprehensive test suite — unit, component, integration, a11y`

---

## CHUNK 13: Deploy & Launch
> **Goal:** Live on the internet. Real users.
> **Depends on:** All previous chunks

### 13.1 — Environment Setup
- Set all env vars in Vercel:
  - DATABASE_URL (Neon)
  - ANTHROPIC_API_KEY
  - STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
  - STRIPE_PREMIUM_PRICE_ID, STRIPE_JOURNALIST_PRICE_ID
  - CRON_SECRET, COOKIE_SECRET
  - IS_FOUNDER_PHASE=true
  - RESEND_API_KEY
  - MAGIC_LINK_BASE_URL (production domain)
- Optional: GEMINI_API_KEY, DEEPSEEK_API_KEY, GROK_API_KEY

### 13.2 — Vercel Deployment
- `vercel deploy --prod`
- Verify build succeeds
- Verify all routes load
- Verify database connectivity

### 13.3 — Cron Jobs Setup
- Vercel Cron or external scheduler for:
  - Ingest: every 30 minutes
  - Cluster: every 30 minutes (offset by 15 min from ingest)
  - Analyze: every hour
  - GCI: after each analyze run
  - Source stats: daily at midnight

### 13.4 — Stripe Webhook Configuration
- Set production webhook URL in Stripe Dashboard
- Verify webhook signing with production secret
- Test: subscribe → downgrade → cancel flow

### 13.5 — Domain & DNS
- Point custom domain to Vercel
- SSL certificate (auto via Vercel)
- Update MAGIC_LINK_BASE_URL

### 13.6 — Monitoring
- Vercel Analytics enabled
- Error tracking (Vercel's built-in or Sentry)
- Pipeline health dashboard (status bar already built)
- GCI historical tracking

### 13.7 — Launch Checklist
- [ ] All env vars set
- [ ] Database seeded with 55+ sources
- [ ] Pipeline running (stories visible)
- [ ] GCI computing
- [ ] Auth flow works (magic link email arrives)
- [ ] Stripe checkout works (test mode first, then live)
- [ ] All pages load on mobile
- [ ] Keyboard navigation works
- [ ] Screen reader passes basic checks
- [ ] Lighthouse > 90 performance
- [ ] Founder badge shows for first signups
- [ ] Status bar shows real pipeline data
- [ ] Command palette opens and searches
- [ ] Filter system functional on all dimensions

**Chunk 13 Commit:** `chore: deploy — Vercel, cron jobs, Stripe webhook, monitoring`

---

## POST-LAUNCH (Phase 5+)

These are explicitly NOT in the launch roadmap. They come after.

### Phase 5A: Knowledge Graph & Research Tools (Journalist Pro Differentiators)

#### The Connection Map ("Conspiracy Board")
> The Charlie Day board — except every red string has a convergence score.

Triangulate's data is a knowledge graph. Stories are nodes (sized by convergence). Sources are nodes (colored by bias). Claims are the edges. Shared claims between stories create cross-story connections. A journalist investigating "EU trade policy" sees: the tariff story connects to the agricultural subsidy story via 3 shared claims. The agricultural story connects to a climate policy story via overlapping government data. You're not reading individual stories — you're seeing the **web of verified facts** across an entire beat.

- **Canvas view:** Force-directed graph (D3 or vis.js) with story nodes, source nodes, claim edges
- **Red strings** = contested claims. **Green strings** = converged claims.
- **Cluster highlighting:** Stories sharing 3+ claims auto-cluster together
- **Zoom levels:** Topic overview → story cluster → claim-level connections
- **Route:** `/connections` or panel tab in the Lens
- **Tier gate:** Journalist Pro only
- **Files:** `app/routes/connections.tsx`, `app/components/dataviz/ConnectionMap.tsx`, `app/lib/graph.ts`

#### NotebookLM Integration (Journalist Pro Export)
> Turn Triangulate research into AI-powered audio briefings and cross-document Q&A.

- **"Research Pack" export:** Structured bundle of story summaries, claim texts, source attributions, convergence scores, primary source documents
- **Format:** ZIP of Markdown files optimized for NotebookLM ingestion. Each file has YAML frontmatter with structured metadata (convergence score, trust signal, sources, dates)
- **Use case 1:** Journalist uploads Research Pack into NotebookLM → asks "What patterns connect these stories?" → gets cross-document synthesis no human could produce manually
- **Use case 2:** NotebookLM's Audio Overview generates a **daily convergence podcast** from Triangulate data — "Here's where enemies agreed today"
- **Use case 3:** Upload a month of Research Packs → ask "How has coverage of [topic] changed?" → temporal pattern analysis
- **Export dialog:** New format option "NotebookLM Pack" alongside CSV/JSON/PDF
- **Includes:** README.md explaining the data structure for NotebookLM context
- **Files:** `app/lib/export/notebooklm.ts`, update `app/components/export/ExportDialog.tsx`

#### Obsidian Vault Export (Journalist Pro Export)
> Every Triangulate export adds to a growing personal truth archive.

- **"Obsidian Vault" export:** Stories, claims, and sources as interconnected Markdown notes with `[[wiki-links]]`
- **Structure:**
  ```
  /triangulate-export-2026-03-25/
    /stories/
      2026-03-25-eu-tariff-deal.md
    /claims/
      claim-eu-voted-17-10.md
    /sources/
      reuters.md
      fox-news.md
    /daily-gci/
      2026-03-25.md
  ```
- **Each file has YAML frontmatter** (Obsidian's data layer):
  ```yaml
  ---
  type: story
  convergence: 0.87
  trust_signal: CONVERGED
  sources: ["Reuters", "Fox News", "The Guardian"]
  bias_spread: ["LEFT", "CENTER", "RIGHT"]
  regions: ["US", "EUROPE"]
  date: 2026-03-25
  claims: ["[[claim-eu-voted-17-10]]", "[[claim-tariff-45-percent]]"]
  ---
  ```
- **`[[Backlinks]]`** connect everything: a claim note links to every story containing it and every source that confirmed/disputed it
- **Obsidian graph view** becomes the conspiracy board — nodes and edges, colored by type, explorable
- **Incremental export:** "Add to existing vault" option that merges new data without duplicating
- **Over months:** A journalist's vault becomes a personal verified-fact database. Search for "What has Source X gotten right?" or "Every claim about Topic Y that was later confirmed"
- **Files:** `app/lib/export/obsidian.ts`, update `app/components/export/ExportDialog.tsx`

#### The Data Base (Persistent Research Workspace)
> Your personal intelligence archive that grows with every session. The Journalist Pro killer feature.

- **What it is:** Every story you view, every claim you bookmark, every source you track — logged and searchable across your entire research history
- **Not a social feature** — purely personal. No sharing, no followers, no public profiles.
- **Schema additions:**
  - `ResearchLog` model: userId, storyId, action (VIEW, BOOKMARK, EXPORT, NOTE), timestamp, metadata JSON
  - `ResearchNote` model: userId, storyId/claimId/sourceId (polymorphic), noteText, createdAt
- **UI:** New "Research" section in sidebar (Journalist Pro only)
  - Timeline view: everything you've investigated, chronologically
  - Graph view: your personal connection map (stories you've touched, connected by shared claims)
  - Search: full-text across your notes + all stories/claims you've viewed
  - Stats: "You've investigated 247 stories across 12 topics. Your top beat: EU trade policy."
- **Export:** Your entire Data Base exportable as NotebookLM Pack or Obsidian Vault at any time
- **Route:** `/research`
- **Files:** `app/routes/research.tsx`, `app/components/research/ResearchTimeline.tsx`, `app/components/research/ResearchGraph.tsx`, `app/lib/research.ts`
- **Why $14.99/month feels obvious:** This is a growing personal asset. The longer you subscribe, the more valuable your archive becomes. It's not a feature you rent — it's an investment you build.

### Phase 5B: Advanced Visualizations

- **Convergence Heatmap Timeline** (fog of war visualization)
- **Adversarial Constellation** (2D radial star field)
- **Claim Battlefield** (force-disposition map)
- **Story Replay Mode** (accelerated playback)
- **Data Sonification** (opt-in "Analyst Audio" toggle in settings)

### Phase 5C: Distribution & Growth

- **Substack Integration** (ingest indie sources, convergence badge)
- **Multi-AI Round Table** (Gemini + DeepSeek + Grok consensus)
- **Journalist Badge** (embeddable widget: "Verified by Triangulate")
- **Morning Brief Email** (daily digest via Resend)
- **Share Card** (social media convergence proof — OG image via satori)

### Phase 6: Truth Infrastructure

- **Government Data Convergence** (apply convergence to economic data: jobs, GDP, inflation)
- **API for Publishers** (let newsrooms embed convergence scores)
- **Triangulate Protocol** (open standard for convergence verification)

---

## Dependency Graph

```
Chunk 0  (Foundation)
  ├── Chunk 1  (App Shell)
  │     ├── Chunk 2  (Filter System)
  │     │     ├── Chunk 3  (The Wire)
  │     │     │     ├── Chunk 4  (The Lens)
  │     │     │     └── Chunk 10 (Onboarding)
  │     │     └── Chunk 9  (Search)
  │     └── Chunk 6  (Pro Tools)
  ├── Chunk 5  (Data Viz) — can parallel with 3-4
  ├── Chunk 7  (Sources & Trends) — can parallel with 6
  ├── Chunk 8  (Auth & Payments) — can parallel with 3-7
  └── Chunk 11 (Pipeline) — needs 0, 7
        └── Chunk 12 (Testing) — needs all
              └── Chunk 13 (Deploy) — needs all
```

**Parallelizable work:**
- Chunks 5, 6, 7, 8 can all progress in parallel after Chunk 1
- Chunk 11 can start (seeding, pipeline) as soon as Chunk 0 is done
- Chunk 12 accumulates tests throughout, but final pass is last

---

## New File Inventory (~65 new files)

### Shell (6)
- `app/components/shell/AppShell.tsx`
- `app/components/shell/TopBar.tsx`
- `app/components/shell/Sidebar.tsx`
- `app/components/shell/StatusBar.tsx`
- `app/components/shell/BottomTabBar.tsx`
- `app/components/shell/CommandPalette.tsx`
- `app/components/shell/ShortcutOverlay.tsx`
- `app/components/shell/NotificationToast.tsx`

### Panels (3)
- `app/components/panels/PanelContainer.tsx`
- `app/components/panels/PanelResizer.tsx`
- `app/components/panels/DashboardLayout.tsx`

### Filters (12)
- `app/components/filters/FilterSidebar.tsx`
- `app/components/filters/BiasSpectrumSelector.tsx`
- `app/components/filters/RegionFilter.tsx`
- `app/components/filters/ConvergenceSlider.tsx`
- `app/components/filters/TopicCloud.tsx`
- `app/components/filters/TimeHorizon.tsx`
- `app/components/filters/SourceCountSelector.tsx`
- `app/components/filters/TrustSignalToggles.tsx`
- `app/components/filters/SmartPresets.tsx`
- `app/components/filters/FilterChips.tsx`
- `app/components/filters/MobileFilterSheet.tsx`
- `app/components/filters/OutletPicker.tsx`

### Wire (4)
- `app/components/wire/StoryListRow.tsx`
- `app/components/wire/WirePanel.tsx`
- `app/components/wire/TodaysSurprise.tsx`
- `app/components/wire/WireSkeleton.tsx`

### Lens (5)
- `app/components/lens/LensPanel.tsx`
- `app/components/lens/SpectrumPanel.tsx`
- `app/components/lens/ClaimsPanel.tsx`
- `app/components/lens/PrimaryDocsPanel.tsx`
- `app/components/lens/ConvergenceExplainer.tsx`

### Data Viz (7)
- `app/components/dataviz/ConvergenceGauge.tsx`
- `app/components/dataviz/BiasSpectrumBar.tsx`
- `app/components/dataviz/RegionIndicator.tsx`
- `app/components/dataviz/ClaimMatrix.tsx`
- `app/components/dataviz/TimelineStrip.tsx`
- `app/components/dataviz/GCIGauge.tsx`
- `app/components/dataviz/GCITicker.tsx`
- `app/components/dataviz/ComparisonCard.tsx`

### Export (2)
- `app/components/export/ExportDialog.tsx`
- `app/components/export/ConvergenceCertificate.tsx`

### Shared (3)
- `app/components/shared/Gate.tsx`
- `app/components/shared/UpgradeTeaser.tsx`
- `app/components/shared/ExplainerPopover.tsx`

### Lib (15)
- `app/lib/filters/FilterProvider.tsx`
- `app/lib/filters/filter-codec.ts`
- `app/lib/filters/useFilterState.ts`
- `app/lib/stores/workspace.ts`
- `app/lib/capabilities.ts`
- `app/lib/hooks/usePanelFocus.ts`
- `app/lib/hooks/useKeyboardShortcuts.ts`
- `app/lib/hooks/useKeymap.ts`
- `app/lib/hooks/useProgressiveTips.ts`
- `app/lib/gci.ts`
- `app/lib/source-stats.ts`
- `app/lib/narratives.ts`
- `app/lib/disagreement.ts`
- `app/lib/explainers.ts`
- `app/lib/comparisons.ts`
- `app/lib/export/csv.ts`
- `app/lib/export/pdf.tsx`
- `app/lib/export/certificate.ts`
- `app/lib/email.ts`
- `app/lib/usage-tracking.ts`

### Routes (6 new)
- `app/routes/sources.tsx`
- `app/routes/sources.$id.tsx`
- `app/routes/trends.tsx`
- `app/routes/api.gci.ts`
- `app/routes/api.health.ts`
- `app/routes/api.workspace.ts`
- `app/routes/api.notifications.stream.ts`
- `app/routes/api.triangulate.ts`

### Types (2 new)
- `app/types/filters.ts`
- `app/types/workspace.ts`

---

## Modified File Inventory (~15 existing files)

- `vitest.config.ts` — add tsconfigPaths
- `package.json` — new dependencies
- `prisma/schema.prisma` — 3 new models
- `app/app.css` — new tokens, contrast fixes, motion, density
- `app/root.tsx` — AppShell replaces Header/Footer, skip links
- `app/routes/home.tsx` — Wire + filter sidebar + faceted loader
- `app/routes/story.$id.tsx` — panel paradigm rewrite
- `app/routes/search.tsx` — AppShell integration, full-text
- `app/routes/pricing.tsx` — refresh feature lists
- `app/routes/api.search.ts` — TSVECTOR upgrade
- `app/routes/api.analyze.ts` — source stats computation
- `app/routes/api.auth.send-link.ts` — Resend integration
- `app/types/index.ts` — SVG trust icons, new exports
- `app/lib/convergence.ts` — explainConvergenceScore()
- `app/components/layout/Header.tsx` — aria fixes (then replaced by TopBar)

---

*This roadmap is the contract. Every chunk produces a working increment. Every commit message is specified. Every file is named. Build it.*
