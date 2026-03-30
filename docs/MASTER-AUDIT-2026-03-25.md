# TRIANGULATE MASTER AUDIT — March 25, 2026

> **Synthesized from 12 specialist agent audits**
> This document is the single source of truth for Triangulate's architectural direction. Every design decision, implementation plan, and open question lives here. Read this before touching the codebase.

---

## Executive Summary

Triangulate today is a functional but conventional news aggregation prototype: a feed of story cards, a detail page, basic search, auth scaffolding, and a Stripe integration — all built on a solid React Router v7 + Neon PostgreSQL foundation with a working three-stage pipeline (ingest, cluster, analyze). What it must become is a professional-grade news convergence instrument — a command center where journalists and truth-seekers can manipulate ideology, region, and time dimensions in real time to see where adversarial sources confirm the same facts. The single biggest insight from this audit is that Triangulate's competitive moat is not its data (anyone can aggregate RSS feeds) but its *interaction model*: the combination of bidirectional faceted filtering, claim-level cross-referencing, and adversarial convergence scoring presented through a dense, keyboard-driven, panel-based interface that no news product currently offers. The current blog-shaped layout actively hides this advantage. The redesign described in this document transforms Triangulate from "interesting feed" to "indispensable instrument."

---

## The Diagnosis

**Current state:** Blog-shaped marketing site with a feed.
**Target state:** Bloomberg Terminal meets newsroom command center.

The gap:

- **Layout is wrong.** Full-page scrolling with a header/footer/card grid is the default SaaS template. Triangulate needs a fixed app shell with resizable panels, zero page-level scroll, and density controls — because professionals live in their tools all day and need persistent context.
- **Filtering is absent.** The most powerful dimension of Triangulate — slicing news by ideology, region, convergence score, and time — has no UI surface. Users cannot manipulate the data. The filter system is the product; without it, Triangulate is just another feed.
- **Convergence is buried.** The convergence score (the entire value proposition) appears as a small badge on a card. It should be a prominent, interactive gauge with inline narrative ("Fox News and The Guardian confirmed the same 4 facts") visible in the feed without clicking.
- **No professional tooling.** No keyboard shortcuts, no command palette, no data export, no workspace persistence, no notification system. Power users (journalists, researchers) have no reason to choose this over a browser tab with Google News.
- **Accessibility is incomplete.** Missing ARIA labels on navigation, no skip links, contrast failures on ink-faint text, no reduced-motion support, no screen reader panel cycling. WCAG 2.2 AA compliance is not optional for a public-interest tool.

---

## The Vision: Command Center Architecture

### App Shell

The entire application lives inside a fixed frame. No page-level scrolling. Content scrolls within panels.

```
+--[ TopBar 48px ]----------------------------------------------+
|  Logo  |  Breadcrumbs  |  Search (Cmd+K)  |  GCI  |  Avatar  |
+--[ Sidebar 56/240px ]--+--[ Content Area ]--------------------+
|  Feed                  |                                       |
|  Stories               |  +--[The Wire]--+--[The Lens]--+--+  |
|  Search                |  |  Story list  |  Detail &    |  |  |
|  Sources               |  |  (compact    |  analysis    |D |  |
|  Watchlist             |  |   rows)      |  panel       |O |  |
|  ---                   |  |              |              |S |  |
|  Pricing               |  |              |              |S |  |
|  Settings              |  |              |              |  |  |
|                        |  +--------------+--------------+--+  |
+--[ StatusBar 28px ]-------------------------------------------+
|  Pipeline: OK  |  55 sources  |  Filters: 2 active  |  GCI 74  |
+---------------------------------------------------------------+
```

- **TopBar (48px):** Logo, breadcrumbs, Cmd+K search trigger, Global Convergence Index sparkline, user avatar with tier badge.
- **Sidebar (56px collapsed / 240px expanded):** Icon-only when collapsed, full labels when expanded. Sections: Feed, Stories, Search, Sources, Watchlist, separator, Pricing, Settings.
- **StatusBar (28px, monospace):** Pipeline health (colored dot), source count, last ingest timestamp, active filter summary (compressed pills), GCI number, keyboard mode indicator, user tier badge.
- **Footer eliminated.** All footer content (about, legal, social) moves to Settings page or StatusBar.
- **Content area:** Three-panel layout (see Panel System below).

### Panel System

Three named panels fill the content area:

| Panel | Name | Default Width | Min | Max | Purpose |
|-------|------|---------------|-----|-----|---------|
| Left | The Wire | 320px | 240px | 480px | Story list (compact rows) |
| Center | The Lens | flex | 400px | none | Story detail, analysis, visualizations |
| Right | The Dossier | 280px | 200px | 400px | Claims, sources, metadata (collapsible) |

**Implementation:** `react-resizable-panels` (~8KB).

**Behaviors:**
- Panels resize by dragging handles between them.
- Any panel can collapse to a 4px rail. Hovering the rail shows a preview tooltip. Clicking expands.
- Panel content is preserved in memory on collapse/expand (no remount, no data refetch).
- F6 cycles focus between panels (accessibility standard, does not conflict with screen readers).
- Three preset layouts:
  - **Quick Scan:** Wire expanded, Lens narrow, Dossier collapsed.
  - **Analyst:** Wire narrow, Lens expanded, Dossier expanded.
  - **Deep Dive:** Wire collapsed, Lens maximized, Dossier expanded.
- Presets activate via command palette or keyboard shortcut.

### Navigation

**Sidebar:**
- Collapsible (toggle via hamburger icon or `Cmd+B` / `Ctrl+B`).
- Items: Feed, Stories, Search, Sources, Watchlist, separator, Pricing, Settings.
- Active item highlighted. Badge counts on Watchlist (new updates).
- Collapsed state: icon-only, tooltip on hover.

**Command Palette:**
- Trigger: `Cmd+K` / `Ctrl+K`.
- Built with `cmdk` (~3KB) + `fuse.js` (~5KB) for fuzzy search.
- 38 commands across 9 categories:
  1. **Navigation** (8): Go to Feed, Stories, Search, Sources, Watchlist, Pricing, Settings, Home
  2. **Filters** (7): Set bias range, region, convergence threshold, time horizon, topic, source count, clear all
  3. **Panels** (5): Toggle Wire, Toggle Lens, Toggle Dossier, Quick Scan layout, Analyst layout, Deep Dive layout
  4. **Story Actions** (4): Open story, Watch story, Export story, Share story
  5. **Search** (3): Search stories, Search sources, Search claims
  6. **View** (3): Toggle sidebar, Toggle density, Toggle theme
  7. **Data** (3): Export feed CSV, Export feed JSON, Export story PDF
  8. **Workspace** (3): Save workspace, Load workspace, Reset workspace
  9. **Help** (2): Show shortcuts, Show about
- Default mode: search stories. Command mode (type `>`): search commands.
- Each command shows its keyboard shortcut inline.

**Keyboard Shortcuts:**
- Built with `tinykeys` (~700B).
- Vim-style sequential shortcuts: `G then F` = Go to Feed, `G then S` = Go to Search.
- `J` / `K` = navigate story list, `Enter` = open in Lens, `Escape` = back to Wire focus.
- `?` = show shortcut overlay.
- `1` / `2` / `3` = panel preset shortcuts.
- All shortcuts use modifier keys when they could conflict with screen reader navigation.
- Shortcut layer registry: global layer, panel-specific layer, modal layer. Higher layers shadow lower.

**Breadcrumbs:**
- Visible at every drill-down level in the TopBar.
- Pattern: `Feed > Topic: Ukraine > Story: Grain Deal Collapse > Claim #3`.
- Each segment is a link. Clicking navigates and adjusts panel state.

---

## The Convergence Lens: Filter System

The filter system is the core interaction of Triangulate. It transforms the feed from a passive list into an active instrument.

### Architecture

- **Bidirectional faceted filtering** with live distribution feedback. Every filter control shows how many stories match the current value *given all other active filters*. This is the Bloomberg/Elasticsearch pattern applied to news.
- **Filter state serialized to URL params.** Every filter combination produces a shareable, bookmarkable URL. Example: `/feed?bias=LEFT,CENTER_LEFT&region=US,UK&convergence=70&time=week`.
- **Server-side filtering via Remix loaders.** Filter changes trigger loader revalidation. The loader runs parallel faceted queries (one per filter dimension) to return both the filtered story list and the distribution counts for every filter control.
- **Faceted queries use raw SQL.** Prisma cannot `groupBy` across relations. The loader runs raw SQL queries like:
  ```sql
  SELECT bias_tier, COUNT(DISTINCT story_id)
  FROM articles
  WHERE story_id IN (SELECT id FROM stories WHERE ...)
  GROUP BY bias_tier
  ```
  These run in parallel (`Promise.all`) to avoid sequential latency.

### Controls (The Instrument Panel)

Arranged in a horizontal control bar above the story list (The Wire panel). Controls are compact by default, with popovers for expanded interaction.

#### 1. Bias Spectrum Bar (THE Signature Control)

A 7-segment horizontal bar representing FAR_LEFT through FAR_RIGHT. Each segment is colored and labeled.

```
[FL] [L] [CL] [C] [CR] [R] [FR]
 ^^^^^^^^^^^^^^^^^^^
   (selected range)
```

- **Interaction:** Click a segment to toggle it. Click-and-drag across segments to select a range. Shift+click to extend selection.
- **Display:** Selected segments are full opacity with their bias color. Unselected segments are muted (20% opacity).
- **Distribution:** Each segment shows a count badge (number of stories matching that bias tier given current filters).
- **Sizes:** Inline (2px height, no labels — used in StoryCard), Compact (6px height, abbreviated labels — used in filter bar), Full (24px height, full labels, counts, drag interaction — used in expanded popover).

#### 2. Region Map

A stylized, clickable world map showing 7 regions as distinct zones.

- **Interaction:** Click a region to toggle it. Active regions glow with their assigned color.
- **Display:** Cross-region arcs appear between selected regions, indicating cross-regional convergence is being measured.
- **Compact mode:** Region abbreviation pills (US, UK, EU, ME, AP, CA, GL) that toggle on click.
- **Distribution:** Each region shows story count.

#### 3. Convergence Dial

A radial gauge (semicircular arc) showing the current convergence threshold.

- **Desktop:** Draggable threshold handle on the arc. Stories below the threshold are filtered out.
- **Mobile:** Horizontal slider (arc is too small for touch targets).
- **Display:** Arc is color-graded from red (0%) through amber (50%) to green (100%). Current threshold is marked with a hairline and numeric label.
- **Distribution:** Shows "X stories above threshold" count.

#### 4. Topic Cloud

Weighted tags sized by story count within current filter context.

- **Interaction:** Click a tag to toggle it on/off as a filter. Multiple topics can be active (OR logic).
- **Display:** Tag size is proportional to story count. Active tags are highlighted. Tags animate size changes (200ms) when other filters change the distribution.
- **Compact mode:** Horizontal scrollable pill row showing top 8 topics.

#### 5. Time Horizon

Segmented control with preset time windows.

- **Segments:** Now (4h) | Today | This Week | This Month | Custom.
- **Custom:** Date range picker popover (two calendars, start/end).
- **Distribution:** Each segment shows story count.
- **Default:** "Today" on first visit.

#### 6. Source Count Dots

A stepped visual selector showing minimum number of sources required.

```
 [*] [**] [***] [****] [*****+]
  1    2     3      4      5+
```

- **Interaction:** Click a dot level to set minimum source threshold. Stories with fewer unique sources are filtered out.
- **Distribution:** Each level shows how many stories have at least that many sources.

#### 7. Trust Signal Toggles

The existing trust signal badges (Primary Sources, Named Sources, Data-Backed, etc.) presented as filter pills.

- **Interaction:** Toggle pills on/off. Active pills filter to stories that have the selected trust signals.
- **Logic:** AND (story must have all selected signals).

#### 8. Outlet Picker (Power User)

A searchable multi-select dropdown for specific outlets.

- **Organization:** Grouped by region, then by bias tier within region.
- **Interaction:** Search box at top, checkboxes for each outlet, "Select All" per group.
- **Display:** Selected outlets shown as pills below the picker.
- **Gating:** Available to Premium and Pro users only.

### Smart Presets ("Lenses")

Pre-configured filter combinations accessible from a dropdown or command palette.

| Lens | Filters Applied |
|------|----------------|
| Highest Signal | Convergence > 80%, Sources > 3, Trust: Primary Sources |
| Cross-Spectrum | Bias: FAR_LEFT + FAR_RIGHT selected (extremes must agree) |
| Left-Right Consensus | Bias: LEFT + RIGHT (mainstream opposition agreement) |
| Cross-Region | Region: 3+ regions selected, Sources > 2 |
| Breaking Now | Time: Now (4h), sorted by recency |
| Deep Dive | Convergence > 60%, Sources > 4, Time: This Month |
| My Region | Region: user's detected/set region only |

- **User-saved views (Premium feature):** Users can save current filter state as a named Lens. Up to 5 for Premium, unlimited for Pro.
- **Lens selection updates all filter controls simultaneously** with animated transitions.

### Cross-Filter Dynamics

When any filter changes, ALL other filter controls update their distribution counts to reflect the new context. This creates a feedback loop where the user can see the data "respond" to their manipulation.

- **Animation:** Distribution counters use an odometer-roll animation (200ms CSS transition on each digit).
- **Zero-result prevention:** If a filter combination would produce zero results, the system highlights which filter to remove and shows a "No stories match — try removing [Region: Middle East]" message with a one-click removal action.
- **Topic cloud live update:** Tag sizes crossfade (200ms) to new proportions as other filters change.
- **Region map intensity:** Region zones crossfade opacity/glow based on how many stories match in that region given current filters.
- **Spectrum bar counts:** Badge numbers animate on each segment.

---

## Data Visualization: Beyond Any News Product

### Core Visualizations (Ship with Command Center)

These are the workhorse components used throughout the app.

#### 1. ConvergenceGauge

A semicircular SVG arc displaying a convergence score from 0 to 100.

- **Sizes:** `sm` (32px diameter, inline), `md` (64px, card), `lg` (120px, detail panel).
- **Color gradient:** Red (0-33) to amber (34-66) to green (67-100), applied as SVG gradient along the arc.
- **Animation:** Arc fills from 0 to target value over 400ms (ease-out) on mount and on score change.
- **Center text:** Numeric score in the center of the arc (md and lg sizes only).
- **Accessibility:** `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Convergence score: X percent"`.

#### 2. BiasSpectrumBar

A 7-segment horizontal bar showing which bias tiers are represented in a story's source coverage.

- **Modes:**
  - Inline (2px height, no labels) — embedded in StoryCard.
  - Compact (6px height, abbreviated labels on hover) — used in lists and summaries.
  - Full (24px height, full labels, interactive tooltips) — used in story detail.
- **Segments:** Each of 7 bias tiers gets a fixed-width segment. Segments with coverage are filled with their tier color; segments without coverage are empty (border only).
- **Implementation:** CSS `<div>` elements (not SVG) for GPU compositing and smooth transitions.

#### 3. RegionIndicator

Colored dots representing which global regions are covered in a story.

- **Display:** Up to 7 small colored dots in a horizontal row, each representing a region.
- **Tooltips:** Hover reveals region name and source count from that region.
- **Empty states:** Regions without coverage shown as hollow dots.

#### 4. ClaimMatrix

A truth-table grid showing the intersection of claims and sources.

```
              | Reuters | Fox | Guardian | Al Jazeera |
 Claim 1      |   [+]   | [+] |   [+]    |    [-]     |
 Claim 2      |   [+]   | [?] |   [+]    |    [+]     |
 Claim 3      |   [-]   | [-] |   [?]    |    [+]     |
```

- **Cell states:** Support `[+]` (green), Contradict `[-]` (red), Silent `[?]` (gray), Not Applicable (empty).
- **Headers:** Source names colored by bias tier. Claim text truncated with tooltip for full text.
- **Interaction:** Click a cell to see the exact quote from that source supporting or contradicting the claim.
- **Accessibility:** `role="grid"` with proper `role="row"`, `role="columnheader"`, `role="gridcell"` structure.

#### 5. TimelineStrip

A horizontal SVG strip showing when articles were published, colored by source bias tier.

- **X-axis:** Time (hours or days depending on story age).
- **Markers:** Vertical lines or dots at each article's publication time, colored by the source's bias tier.
- **Interaction:** Hover a marker to see source name and headline. Click to scroll that article into view in the detail panel.
- **Pattern:** Reveals whether left-leaning or right-leaning sources reported first, and how long until convergence was established.

### Breakthrough Innovations (Post-Launch Phases)

These are the visualizations that make Triangulate visually unlike anything in the news space. Each borrows from a different domain.

#### 6. Convergence Heatmap Timeline (Fog of War)

Borrowed from real-time strategy games. A 2D heatmap where X = time, Y = bias tier. Cells start as "fog" (dark, unknown) and "lift" (illuminate) as sources publish articles confirming claims.

- **Interaction:** A draggable scrub hairline allows the user to move through time. ALL other components on the page filter to that timestamp, showing the state of convergence at that moment.
- **Reveal animation:** Fog cells dissolve (opacity transition) when a source from that bias tier publishes at that time.
- **Teaching value:** Shows how convergence *develops* — which ideological camps confirm facts first, how long gaps last before adversarial confirmation arrives.
- **Implementation:** Canvas or SVG grid, 7 rows (bias tiers) by N columns (time buckets). Each cell has a background color (gray = fog, tier color = confirmed) with opacity animation.

#### 7. Adversarial Constellation

Borrowed from astronomy. A 2D radial star field where X = ideology (left to right), Y = region (inner to outer rings).

- **Sources are stars:** Each outlet is a point of light. Size = number of articles in the current cluster. Color = bias tier.
- **Connection lines:** When two sources cover the same story, a line connects them. Line opacity = convergence strength between those two sources.
- **Nebulae:** High-convergence clusters glow as diffuse "nebulae" — the brighter the glow, the more adversarial sources agree.
- **Dual aesthetic:**
  - Light mode: styled as a newspaper data graphic (stippled dots, rule lines, serif labels).
  - Dark mode: actual star field aesthetic with neon halos, glow effects, and deep space background.
- **Implementation:** Canvas with WebGL fallback. Force-directed layout (simplified, not D3 force simulation — positions are deterministic based on ideology/region axes).

#### 8. Claim Battlefield

Borrowed from military cartography. A spatial force-disposition map showing contested claims.

- **Layout:** Supporting sources arrayed on the left, contradicting sources on the right. The claim text sits in the center as "contested territory."
- **Battle line:** A procedural zigzag line between support and contradiction, inspired by military front-line notation. The more contested the claim, the more jagged the line.
- **Source markers:** Each source shown as a unit marker (rectangle with bias color) positioned based on its stance.
- **Animation:** Sources "advance" toward the center as more evidence accumulates. If one side overwhelms the other, the battle line shifts.
- **Use case:** Makes abstract claim-level analysis visceral and immediately understandable.

#### 9. Story Replay Mode

Borrowed from sports replay and version control. An accelerated playback (10x to 100x real time) of how a story's convergence developed.

- **Timeline:** Play/pause/scrub controls. Speed selector (10x, 25x, 50x, 100x).
- **During playback:** Sources appear on the constellation/timeline as they publish. Claims form as they are extracted. The fog lifts on the heatmap. The convergence gauge rises.
- **Teaching tool:** Shows HOW convergence works — that it is not a static score but a process of adversarial confirmation over time.
- **Marketing asset:** Short replays of dramatic convergence stories can be exported as video (future) or GIF for social sharing.

#### 10. Data Sonification (Opt-In)

Borrowed from scientific data sonification. Purely additive — zero audio files, all synthesized via Web Audio API.

- **Ambient pulse:** A low, slow pulse whose rate tracks the Global Convergence Index. Higher GCI = faster pulse. Users can work with this as background awareness.
- **Story open chord:** When opening a story, a three-note chord plays. Major chord = high convergence. Minor = medium. Diminished = low or contested.
- **Scroll percussion:** Gentle percussive ticks (hi-hat-like) as the user scrolls through stories, providing tactile audio feedback.
- **Controls:** Global mute toggle in Settings. Volume slider. Individual sound toggles (pulse, chord, scroll).
- **Implementation:** Web Audio API OscillatorNode + GainNode. No audio files. Total code: ~200 lines.
- **Accessibility:** Respects `prefers-reduced-motion`. Defaults to OFF. Never auto-plays on first visit.

---

## Data Narratives: Every Number Pre-Interpreted

Raw data is meaningless without interpretation. These systems translate every metric into human-readable insight.

### 1. Global Convergence Index (GCI)

A single daily number from 0 to 100, representing the overall convergence of global news.

- **Calculation:** Weighted average of top 40 stories' convergence scores, with recency decay and source diversity bonus.
- **Display:** Sparkline in TopBar header (7-day trend), numeric value in StatusBar, full chart in dedicated GCI page.
- **Narrative:** Auto-generated daily summary: "Today's GCI is 74, up from 68 yesterday. Key driver: 5 stories about the UN climate summit reached >80% convergence as left and right outlets confirmed emission reduction commitments."
- **Database:** New `GlobalConvergenceIndex` table with daily entries. Cron job calculates at midnight UTC.
- **Comparison:** "Like the Dow Jones, but for news truth."

### 2. Convergence Narratives

Auto-generated prose attached to every story, explaining its convergence in plain English.

- **Template:** "This story reached {score}% convergence after {source_a} ({bias_a}) and {source_b} ({bias_b}) independently confirmed {claim_count} claims within {time_window}."
- **Variation:** Multiple templates selected based on story characteristics (cross-region, cross-ideology, rapid convergence, slow convergence, high contradiction).
- **Tone:** Factual, neutral, no editorialization. Reports what happened, not what it means.
- **Placement:** Below the convergence gauge in the Lens panel. Also available as a tooltip on the gauge in the Wire panel.

### 3. Disagreement Map

When sources disagree, the system classifies WHY they disagree.

| Split Type | Definition | Example |
|-----------|-----------|---------|
| IDEOLOGICAL | Left and right sources diverge on the same claim | "Tax cut impact: left says deficit, right says growth" |
| REGIONAL | US and EU sources report different facts about the same event | "US sources report 12 casualties, EU sources report 15" |
| INSTITUTIONAL | Government-aligned vs independent sources disagree | "State media says protest was 500 people, Reuters says 5,000" |
| RANDOM | No discernible pattern to the disagreement | "Sources simply report different aspects with no conflict" |

- **Display:** Colored tags on contested claims in the ClaimMatrix.
- **Narrative:** "The disagreement on Claim #3 appears IDEOLOGICAL: left-leaning sources emphasize environmental impact while right-leaning sources emphasize economic cost."
- **Implementation:** Claude analysis during the analyze pipeline stage. Split type stored on the `Claim` model.

### 4. Source Credibility Trajectories

Per-source tracking of how often a source's claims are later confirmed by adversarial outlets.

- **Metric:** "Confirmation rate" — percentage of claims from Source X that are later supported by sources from opposing bias tiers.
- **Display:** Sparkline per source in the Sources page. Trend arrow (up/down/flat) next to each source in story detail.
- **Explicitly NOT editorial:** This is not "Source X is trustworthy." It is "Source X's claims were confirmed by adversarial sources Y% of the time over the last 90 days." The data speaks; we do not interpret.
- **Database:** Aggregated from existing claim/article data. No new model needed — computed on read.

### 5. "Why It Matters" Explainers

Contextual popovers that translate every metric into plain-language significance.

- **Trigger:** `(i)` icon next to every numeric metric (convergence score, source count, claim count, GCI, confirmation rate).
- **Content examples:**
  - "82% convergence is rare — only 3% of stories this month reached this level."
  - "This story has 12 unique sources, which is in the top 5% for source diversity."
  - "Cross-region convergence (US + Middle East agreeing) is the strongest signal Triangulate measures."
- **Implementation:** Static content templates with dynamic thresholds calculated from aggregate data (percentiles updated daily).
- **Tone:** Educational, not promotional. The goal is to teach users what the numbers mean.

### 6. Comparative Story Cards

Surface convergence changes over time for recurring topics.

- **Display:** "This topic had 23% convergence last month; today it's 87%." Shown as a delta badge on StoryCard for topics with prior coverage.
- **Interaction:** Click to see the convergence trajectory for this topic over time.
- **Use case:** Reveals when previously contested topics reach consensus, or when previously converged topics become disputed.

---

## Design System Architecture

### Token Architecture

Three-tier token system implemented in Tailwind v4's `@theme` directive:

```
Raw Tokens (palette)     →  Semantic Tokens (intent)     →  Component Tokens (specific)
--color-slate-900           --color-ink-primary              --story-card-title-color
--color-amber-500           --color-brand-amber              --gauge-arc-high-color
--spacing-4                 --spacing-panel-gap              --sidebar-item-padding
```

- **Raw tokens:** Color palette, spacing scale, type scale. Never used directly in components.
- **Semantic tokens:** Map raw values to intent (ink-primary, surface-page, border-subtle). These swap between light and dark mode.
- **Component tokens:** Map semantic tokens to specific component properties. Only created when a component needs to deviate from semantic defaults.

### The Dual Aesthetic

Two radically different visual identities, unified by a shared layout and interaction model.

**Light Mode: The Press Room**
- Background: Aged newsprint (`#FAF8F5` with subtle paper texture via CSS background).
- Typography: Playfair Display for headlines (serif, authoritative), DM Sans for body (clean, readable).
- Shadows: Flat — no drop shadows. Depth conveyed through border weight and background tint.
- Borders: Newspaper rule lines — double-line (`border-double`) for major divisions, single hairline for minor.
- Color: Muted palette. Ink-black text, warm grays, parchment surfaces. Color used sparingly for data (bias tiers, convergence).
- Icons: Outlined (Lucide), thin stroke.

**Dark Mode: The War Room**
- Background: Deep space (`#0A0A12` through `#12121E`).
- Typography: DM Sans for headlines (sans-serif, clinical), JetBrains Mono for datelines and metadata (monospace, terminal aesthetic).
- Shadows: None. Depth conveyed through border glow and surface luminance.
- Borders: Subtle neon glow (`box-shadow: 0 0 4px var(--border-glow-color)`).
- Color: Neon accents against dark surfaces. Brand green glows. Bias tier colors are saturated and vibrant.
- Effects: CRT scanline overlay (CSS `repeating-linear-gradient`, 1px lines at 50% opacity), applied to the root surface. Subtle vignette at screen edges (radial gradient overlay, pointer-events: none).
- Icons: Same Lucide icons but with a subtle glow filter.

**Implementation split:**
- 90% of the aesthetic swap is CSS custom properties on the `.dark` class.
- 9% is structural CSS modifiers (scanline gradient, paper texture background, glow box-shadows).
- 1% is conditional rendering (CRT vignette overlay div, rendered only in dark mode).

### Density Modes

Three density levels for different user contexts:

| Mode | Row Height | Body Font | Use Case | Default For |
|------|-----------|-----------|----------|-------------|
| Compact | 32px | 13px | Maximum data density | Journalist Pro tier |
| Comfortable | 40px | 14px | Balanced | Everyone else |
| Spacious | 52px | 16px | Accessibility, casual reading | Accessibility setting |

- Controlled via CSS custom properties (`--density-row-height`, `--density-body-size`).
- Toggle in Settings and via command palette.
- Persisted per workspace.

### Five Signature Visual Elements (Proprietary Feel)

These five elements should make Triangulate instantly recognizable in screenshots:

1. **The Convergence Gauge** — Semicircular SVG dial. Not a progress bar, not a donut. A gauge, like an instrument.
2. **The Bias Spectrum Bar** — 7-segment equalizer. Not a single color bar, not a gradient. Discrete segments with discrete colors.
3. **Newspaper Rule Lines** — Double-line borders on major sections. An anachronism that signals "this is about journalism."
4. **CRT Scanline Overlay** — Dark mode only. Horizontal scan lines across the entire viewport. Signals "command center."
5. **Dateline Typography Swap** — DM Sans in light mode, JetBrains Mono in dark mode for datelines and metadata. The font change is part of the personality shift.

---

## Professional Tool Features

### Command Palette

- **Trigger:** `Cmd+K` / `Ctrl+K`.
- **Library:** `cmdk` (~3KB).
- **Search:** `fuse.js` (~5KB) for fuzzy matching across all 38 commands.
- **Modes:**
  - Default: searches stories (title, topic, source name).
  - Command mode (type `>`): searches commands.
  - Source mode (type `@`): searches outlets.
  - Claim mode (type `#`): searches claims.
- **Display:** Each result shows icon, label, keyboard shortcut (if applicable), and category.
- **Recent:** Last 5 commands shown before any input.
- **Accessibility:** Full keyboard navigation, `role="combobox"`, `aria-expanded`, `aria-activedescendant`.

### Status Bar (28px, Monospace)

A persistent information strip at the bottom of the app shell.

| Section | Position | Content |
|---------|----------|---------|
| Pipeline Health | Left | Colored dot (green=healthy, amber=delayed, red=error) + "55 sources" + "Last ingest: 4m ago" |
| Active Filters | Center | Compressed pills showing active filters: "Bias: L-CR | Region: US, UK | Conv: >70%" |
| Global Info | Right | GCI number with trend arrow, keyboard mode indicator (VIM/NORMAL), user tier badge |

- Monospace font (JetBrains Mono) in both light and dark mode.
- Click on pipeline health to open a diagnostic popover.
- Click on filter summary to jump to the filter bar.

### Notifications (Non-Intrusive)

- **Transport:** Server-Sent Events (SSE), not polling. Single persistent connection per session.
- **Display:** Toast rail on the right edge of the screen, max 3 visible, auto-dismiss after 5 seconds. Built with `sonner` (~5KB).
- **Triggers:**
  - Watched story convergence score changes by >10 points.
  - New contradiction found in a watched story.
  - Story cluster reaches a source threshold.
  - Pipeline status change (error/recovery).
- **Browser Notification API:** Only for high-urgency events. Only when tab is hidden. Only after explicit user opt-in (never prompted on first visit).
- **Preferences:** Per-trigger enable/disable in Settings. Global mute toggle.

### Data Export (Premium / Pro)

| Format | Content | Tier |
|--------|---------|------|
| CSV | Story list with metadata, scores, source list | Premium |
| JSON | Full story data including claims and articles | Pro |
| PDF | Formatted story report with visualizations | Pro |
| Convergence Certificate | Shareable proof document (see below) | Pro (or growth mechanism — see Open Questions) |

**Convergence Certificate:**
A formal document proving that a specific convergence finding was verified by Triangulate at a specific time.

- **Contents:** Story title, convergence score, full claim list with support/contradict status per source, source list with bias tiers, timestamp, verification hash (SHA-256 of story data at time of generation).
- **Formats:** PDF (via `@react-pdf/renderer`, ~200KB) and PNG (via `satori`, ~50KB, OG image dimensions for social sharing).
- **QR code:** Links back to the story on Triangulate for verification.
- **Use case:** Journalists citing Triangulate findings in articles. Researchers referencing convergence data.

### Workspace Persistence

- **Library:** `zustand` (~1.5KB) with `persist` middleware.
- **Storage:** localStorage as primary cache, server sync (debounced 2 seconds) for cross-device access.
- **State captured:** Panel layout (widths, collapsed state), active filters, theme preference, density mode, watchlist, notification preferences, sidebar state, active Lens.
- **Named workspaces:** Users can save and name their workspace configurations.
  - Free: 1 workspace (default, auto-saved).
  - Premium: 5 named workspaces.
  - Pro: Unlimited workspaces.
- **Sync:** On login, server workspace is fetched and merged with local (server wins on conflict). On change, local is written immediately, server sync is debounced.

---

## Accessibility Blueprint (WCAG 2.2 AA+)

### Critical Fixes Required on Current Codebase

These must be fixed before the command center redesign, as they affect the existing shipped components.

| # | Fix | File(s) | Severity |
|---|-----|---------|----------|
| 1 | Add `aria-label` to both `<nav>` elements in Header | `app/components/layout/Header.tsx` | High |
| 2 | Add `aria-expanded` to mobile menu toggle button | `app/components/layout/Header.tsx` | High |
| 3 | Add `aria-pressed` to all filter toggle buttons | Various filter components | High |
| 4 | Add `<label>` (or `aria-label`) to search input | `app/components/search/SearchBar.tsx` | High |
| 5 | Add `role="alert"` to auth error messages | `app/routes/auth.signin.tsx` | Medium |
| 6 | Add `aria-hidden="true"` to all decorative Lucide icons | All components using icons | Medium |
| 7 | Fix ink-faint contrast ratio (see below) | CSS tokens | High |
| 8 | Stop using `brand-amber` as text color in light mode | Anywhere amber text appears on light backgrounds | High |
| 9 | Add `prefers-reduced-motion` media query to all animations | Global CSS + component animations | Medium |
| 10 | Add skip links to `root.tsx` | `app/root.tsx` | High |

### Contrast Fixes

| Token | Current Value | Required Value | Ratio Achieved |
|-------|--------------|----------------|----------------|
| Light mode ink-faint | `#9E9EB0` | `#7A7A92` | 4.6:1 (passes AA) |
| Dark mode ink-faint | `#5C5975` | `#706D88` | 4.5:1 (passes AA) |
| Dark mode border-subtle | 6% opacity | 18% opacity | Visible against dark backgrounds |
| Dark mode border-default | 12% opacity | 25% opacity | Visible against dark backgrounds |
| Focus indicator | `ring-ink/20` | `ring-brand-green ring-offset-2` | High-visibility focus rings |

### Redesign Accessibility Requirements

Every new component built for the command center must meet these standards:

- **Panels:** Each panel is a `<section>` with `aria-labelledby` pointing to its heading. F6 cycles focus between panel sections.
- **Filters:** Every filter cluster uses `role="group"` or `role="radiogroup"` with `aria-label`. Filter changes announce results via `aria-live="polite"` region (debounced 500ms to avoid chatter).
- **Convergence bars:** `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and descriptive `aria-label`.
- **Scrollable containers:** `tabIndex={0}` + `role="region"` + `aria-label` so keyboard users can scroll with arrow keys.
- **Keyboard shortcuts:** All use modifier keys (Ctrl/Cmd) for actions to avoid conflicts with screen reader navigation. Vim-style shortcuts (j/k) only active when no input is focused and screen reader is not detected.
- **High contrast:** `forced-colors` media query applied to all custom controls, ensuring they remain visible in Windows High Contrast Mode.
- **Trust signals:** Replace emoji-based trust signal indicators with SVG icons paired with visually-hidden text labels.
- **Time elements:** All rendered times use `<time datetime="...">` for machine-readable timestamps.
- **Motion:** All CSS transitions and animations wrapped in `@media (prefers-reduced-motion: no-preference)`. Reduced-motion users see instant state changes.

---

## Behavioral Architecture

### Daily Return Loop

The goal is to make Triangulate a daily habit without using dark patterns.

**For journalists (power users):**
- "NEW" and "UPDATED" badges on stories that have changed since the user's last visit.
- Last-visit timestamp stored per user (server-side).
- "NEW" = story entered a cluster since last visit. "UPDATED" = convergence score changed by >5 points or new sources added.

**For hobbyists (casual users):**
- "Today's Surprise" — a single story card at the top of the feed highlighting the most surprising convergence finding of the day (highest score where ideological spread is widest).
- Changes daily. Not algorithmic engagement optimization — it is the literal most interesting convergence finding.

**For both:**
- Variable reward comes from *reality*, not algorithm tuning. Some days the news converges dramatically; some days it does not. This unpredictability is the hook.

### The 60-Second "Aha Moment"

The core value proposition must be visible within 60 seconds of first landing on the feed. Currently, users must click into a story to see which sources agree. This is one click too many.

**Changes to StoryCard (The Wire):**
- Add source attribution inline: show the 2-3 most ideologically distant sources that confirm the story. "Confirmed by Fox News (Right) and The Guardian (Left)."
- Show convergence narrative snippet: "3 adversarial sources confirmed 4 claims."
- The aha is visual: *enemies agreeing, on the same line, in the feed*. No click needed.

**Changes to first-visit experience:**
- No onboarding modal. No tutorial. No feature tour.
- The feed itself is the onboarding. The first 3 stories should each demonstrate a different aspect of convergence (high score, cross-region, high contradiction).
- A single, dismissable banner: "Triangulate shows where ideologically opposed news outlets confirm the same facts. No opinions — just convergence."

### Progressive Mastery (5 Levels)

Users naturally discover features over time. The system does not push features — it reveals them when behavior suggests readiness.

| Level | Name | Timeline | Behavior | System Response |
|-------|------|----------|----------|----------------|
| 1 | Scanner | Day 1-7 | Reads the feed, clicks stories | Default view. Comfortable density. No hints. |
| 2 | Filter User | Week 2-4 | Clicks topic/region links in stories | Subtle "Did you know you can filter by region?" tooltip (shown once, max 3 tooltips total across all features). |
| 3 | Claim Analyst | Month 2+ | Reads claim-level data, notices contested claims | ClaimMatrix is promoted higher in the Lens panel. |
| 4 | Keyboard User | Month 3+ | Discovers `?` shortcut overlay | Shortcut hints appear next to buttons they've clicked 5+ times ("Tip: press J to do this faster"). |
| 5 | Investigator | Month 6+ | Uses Search as a verification instrument | Advanced search operators unlocked. Export features highlighted. |

### Trust Contract

Triangulate's credibility depends on radical transparency. These are not features — they are commitments.

1. **"Show the Math"** — Every convergence score has an expandable section showing the exact calculation in plain English: "Score = (ideological spread: 0.8) x (source count factor: 0.7) x (claim confirmation rate: 0.9) x (fringe guard: 1.0) = 50.4%."
2. **Source transparency** — Every article citation has an expandable "About this source" section: bias tier, region, owner, confirmation rate, number of stories in system.
3. **Contradiction prominence** — Contradictions are FEATURED, not buried. When sources disagree, the disagreement is highlighted as prominently as agreement. This is what distinguishes Triangulate from fact-checkers (who tell you who is right).
4. **Fringe guard explanation** — When a convergence score is capped or modified because a source is classified as fringe, an explanation is shown: "Score adjusted: Source X (Far Right) is weighted at 0.5x due to fringe classification. Remove fringe guard to see unweighted score."
5. **Zero editorialization** — Triangulate never says "this is true" or "this is false." It never recommends an interpretation. The persistent absence of opinion IS the editorial position.

### Anti-Patterns: Explicitly BANNED

These dark patterns are banned from the codebase. Any PR introducing them should be rejected.

- **No streak counters.** Users are not rewarded for consecutive days of use.
- **No notification spam.** Maximum 3 toasts visible. No "come back!" push notifications. No email digests unless explicitly opted in.
- **No infinite scroll.** The feed is capped at 40 stories (a newspaper has a last page). "Load more" button available but psychologically, there is a bottom.
- **No engagement metrics shown to users.** No "trending" badges based on clicks. No "most read" lists. Convergence is measured by source agreement, not user attention.
- **No ideology filter.** Users cannot filter to see "only left-leaning takes" or "only right-leaning takes." The entire point is cross-spectrum analysis. The bias filter controls which bias tiers must be REPRESENTED (i.e., "show me stories where Far Left and Far Right both covered it"), not which perspective to show.
- **No dark patterns on pricing.** No artificial scarcity ("only 3 spots left!"), no confirmshaming ("No thanks, I prefer misinformation"), no hidden fees, no annual-only billing (monthly always available).

### Subscription Conversion (Natural Gates)

Conversion happens through natural discovery of value, not artificial restriction.

| Gate | Trigger | User Behavior | What They See |
|------|---------|--------------|---------------|
| Claims | Day 1-3 | Clicks on a story, wants to see claims | Claims section shows 1 example claim expanded, rest blurred with "Unlock claims with Premium" |
| Search | Week 1-2 | Wants to find a specific topic | Search page shows a disabled search bar with a ghost example query and results, plus "Unlock search with Premium" |
| Filters | Week 2-4 | Wants to filter by region or content type | Filter controls are visible but greyed with a lock icon. Clicking shows "Unlock filters with Premium" |
| Volume | Any day | Reads 5 stories, wants more | After 5 full story views per day, remaining stories show headline only, body muted. "Unlock unlimited reading with Premium" |

---

## Software Architecture

### State Management Strategy

Zero new state libraries beyond Zustand. Every state type has one canonical location.

| State Type | Location | Persistence | Example |
|-----------|----------|-------------|---------|
| Filter state | URL search params (`useSearchParams`) | URL (shareable) | `?bias=LEFT,RIGHT&region=US` |
| UI chrome state | React context + `useReducer` | localStorage | Sidebar collapsed, theme, density |
| Workspace state | Zustand store + persist middleware | localStorage + server sync | Panel widths, named workspaces |
| Server/entity state | Remix loaders (`useLoaderData`) | None (refetched) | Stories, claims, articles |
| Story selection | URL search params | URL | `?story=abc123` |
| Panel focus | React context | None (ephemeral) | Which panel has keyboard focus |

**No React Query.** Remix loaders handle all server data fetching. `shouldRevalidate` exports prevent unnecessary refetches (e.g., selecting a story in The Wire should not refetch the story list). `useFetcher` loads story detail into The Lens without triggering a full navigation.

### Data Loading Architecture

**Feed loader (story list with faceted counts):**
```
1. Parse URL search params into filter object
2. Build WHERE clause from filters
3. Run in parallel:
   a. Story query (Prisma, typed, paginated)
   b. Bias facet query (raw SQL: COUNT(DISTINCT story_id) GROUP BY bias_tier)
   c. Region facet query (raw SQL: COUNT(DISTINCT story_id) GROUP BY region)
   d. Convergence distribution query (raw SQL: histogram buckets)
   e. Topic facet query (raw SQL: COUNT GROUP BY topic)
   f. Time facet query (raw SQL: COUNT GROUP BY time_bucket)
4. Return { stories, facets: { bias, region, convergence, topic, time } }
```

**Story detail loader (fetcher, not navigation):**
```
1. Fetch story by ID with all relations (articles, claims, sources)
2. Generate convergence narrative from template
3. Return { story, narrative, relatedStories }
```

**shouldRevalidate strategy:**
- Story list: revalidate when any filter param changes. Skip when only `?story=` changes.
- Story detail: revalidate when `?story=` changes. Skip when filter params change.

### Component Communication

Panels communicate exclusively through URL params. No event bus, no prop drilling, no shared state between panels.

- **The Wire** sets `?story=abc123` when user selects a story.
- **The Lens** reads `?story=abc123` and fetches detail via `useFetcher`.
- **The Dossier** reads `?story=abc123` and displays claims/sources for that story.
- **Filter Bar** reads/writes all filter params. Changes trigger loader revalidation, which updates The Wire.

This means:
- Panels can be developed and tested independently.
- Deep links work (share a URL, recipient sees exact same state).
- Browser back/forward works (URL params are history entries).
- No complex state synchronization logic.

### Layout Implementation

CSS Grid driven by chrome context's panel width values.

```css
.app-shell {
  display: grid;
  grid-template-rows: 48px 1fr 28px;          /* TopBar, Content, StatusBar */
  grid-template-columns: var(--sidebar-width) 1fr;  /* Sidebar, Content */
  height: 100vh;
  overflow: hidden;
}

.content-area {
  display: grid;
  grid-template-columns:
    var(--wire-width, 320px)
    1fr
    var(--dossier-width, 280px);
  overflow: hidden;
}
```

**Panel resize performance:**
- During drag: direct CSS custom property mutation (`element.style.setProperty('--wire-width', ...)`) — no React re-render.
- On mouseup: commit final value to state (triggers one re-render to persist).
- This ensures 60fps resize with no layout thrashing.

### Performance Optimizations

| Optimization | Target | Implementation |
|-------------|--------|----------------|
| StoryCard memo | Feed render | `React.memo` with `(prev, next) => prev.id === next.id && prev.convergenceScore === next.convergenceScore` |
| Filter transitions | UX during revalidation | `useNavigation()` to detect loading state, dim story list with 50% opacity during revalidation |
| Spectrum bars | GPU compositing | CSS `<div>` elements (not SVG) with `will-change: opacity` for segment transitions |
| Faceted queries | Loader latency | `Promise.all` for parallel execution, each query <50ms on indexed columns |
| Panel resize | 60fps resize | Direct CSS property mutation (see above) |
| Image loading | Feed scroll | Native `loading="lazy"` on all images below the fold |
| Route code splitting | Initial load | Remix default — each route is a separate chunk |

### Feature Gating

A capability-based system that determines what each subscription tier can access.

**`app/lib/capabilities.ts`:**
```typescript
type Capability =
  | 'view_claims'
  | 'search'
  | 'filter_region'
  | 'filter_bias'
  | 'filter_time_custom'
  | 'export_csv'
  | 'export_json'
  | 'export_pdf'
  | 'convergence_certificate'
  | 'saved_lenses'
  | 'workspaces'
  | 'outlet_picker'
  | 'unlimited_stories'
  | 'notifications';

const TIER_CAPABILITIES: Record<SubscriptionTier, Set<Capability>> = {
  FREE: new Set([]),
  PREMIUM: new Set(['view_claims', 'search', 'filter_region', 'filter_bias', 'filter_time_custom', 'saved_lenses', 'export_csv', 'unlimited_stories', 'notifications']),
  JOURNALIST_PRO: new Set([/* all Premium + */ 'export_json', 'export_pdf', 'convergence_certificate', 'workspaces', 'outlet_picker']),
};
```

**Client-side gating:**
```tsx
<Gate capability="view_claims" fallback={<UpgradeTeaser feature="claims" />}>
  <ClaimMatrix claims={story.claims} />
</Gate>
```

**Server-side gating:**
Loaders check user tier and strip gated data from the response. A FREE user's story detail response does not include claims — the data is never sent, not just hidden.

**Founder override:**
Founders (detected by email domain or flag) get all capabilities regardless of tier. This is implemented at the capability lookup level, not per-feature.

### New Dependencies

| Package | Gzipped Size | Purpose | Phase |
|---------|-------------|---------|-------|
| `cmdk` | ~3KB | Command palette dialog | Phase 4 |
| `fuse.js` | ~5KB | Fuzzy search for command palette | Phase 4 |
| `tinykeys` | ~700B | Keyboard shortcut binding | Phase 1 |
| `react-resizable-panels` | ~8KB | Panel resize system | Phase 1 |
| `sonner` | ~5KB | Toast notification system | Phase 4 |
| `zustand` | ~1.5KB | Workspace state management | Phase 1 |
| `@react-pdf/renderer` | ~200KB | PDF export and convergence certificates | Phase 4 |
| `satori` | ~50KB | OG image and certificate PNG generation | Phase 4 |
| **Total** | **~273KB** | **(before tree-shaking)** | |

Phase 1 dependencies (tinykeys, react-resizable-panels, zustand) total ~10KB. The heavy packages (@react-pdf/renderer, satori) are Phase 4 and can be code-split / lazy-loaded since they are only triggered by explicit export actions.

---

## Implementation Phases

### Phase 1: The Shell (Foundation) — Weeks 1-2

Build the app shell and panel system. This is the structural transformation from blog layout to command center.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 1 | AppShell component | TopBar, Sidebar, StatusBar, CSS Grid layout | None |
| 2 | PanelContainer | Generic panel wrapper with collapse, resize, memory | react-resizable-panels |
| 3 | ThreePanel layout | Wire + Lens + Dossier with URL-based story selection | PanelContainer |
| 4 | FilterBar scaffold | Control surface container with URL-based state | None |
| 5 | StoryListRow | Compact 72-88px feed row replacing StoryCard for The Wire | None |
| 6 | Keyboard shortcut layer | Global + panel-specific + modal layer registry | tinykeys |
| 7 | Workspace state scaffold | Zustand store with localStorage persistence | zustand |
| 8 | Accessibility fixes | All 10 critical fixes from current codebase (see table above) | None |

**Exit criteria:** App renders in fixed shell. Three panels visible and resizable. Story selection via URL params. F6 panel cycling works. Skip links present. Contrast fixes applied.

### Phase 2: Filter System — Weeks 3-4

Build the filtering instrument panel. This is where Triangulate becomes interactive.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 9 | BiasSpectrumBar (filter mode) | 7-segment drag-to-select with distribution counts | Phase 1 shell |
| 10 | FilterProvider + useFilterState | Hook managing URL param serialization/deserialization | None |
| 11 | Faceted query loader | Parallel raw SQL queries returning distribution per dimension | Prisma + raw SQL |
| 12 | Region filter | Clickable region pills with counts | FilterProvider |
| 13 | Convergence threshold | Draggable threshold control | FilterProvider |
| 14 | Time horizon | Segmented control with preset windows | FilterProvider |
| 15 | Topic cloud | Weighted tags with live size updates | FilterProvider |
| 16 | Smart Presets (Lenses) | Preset dropdown applying filter combinations | All filter controls |
| 17 | Cross-filter dynamics | Animated distribution counters, zero-result prevention | All filter controls |
| 18 | Source count + trust signal filters | Stepped dots + toggle pills | FilterProvider |

**Exit criteria:** All 8 filter controls functional. Faceted counts update on every filter change. Filter state in URL is shareable. Smart Presets apply correctly. Zero-result state handled gracefully.

### Phase 3: Data Visualization — Weeks 5-6

Build the core visualization components used throughout the app.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 19 | ConvergenceGauge | SVG arc in 3 sizes with animation | None |
| 20 | BiasSpectrumBar (display mode) | 7-segment bar in 3 modes (inline, compact, full) | None |
| 21 | ClaimMatrix | Truth table grid with cell interaction | None |
| 22 | RegionIndicator | Colored dots with tooltips | None |
| 23 | TimelineStrip | Horizontal SVG timeline with bias-colored markers | None |
| 24 | Convergence Narratives | Auto-generated prose templates | Story data |
| 25 | "Why It Matters" popovers | Contextual explainers on all metrics | Aggregate percentile data |

**Exit criteria:** All 5 core visualizations render correctly in both themes. Convergence narratives generate for every story. Accessibility attributes present on all interactive elements.

### Phase 4: Professional Tools — Weeks 7-8

Build the power-user features that make Triangulate a professional instrument.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 26 | Command palette | cmdk + fuse.js, 38 commands, 4 modes | cmdk, fuse.js |
| 27 | Keyboard shortcut system | Full layered registry with ? overlay | tinykeys (Phase 1) |
| 28 | Workspace persistence | Zustand store with server sync, named workspaces | zustand (Phase 1) |
| 29 | Data export (CSV, JSON) | Download handlers with tier gating | capabilities.ts |
| 30 | Data export (PDF) | Story report PDF generation | @react-pdf/renderer |
| 31 | Convergence Certificate | PDF + PNG shareable proof document | @react-pdf/renderer, satori |
| 32 | Notification system | SSE transport + sonner toasts | sonner |
| 33 | StatusBar live data | Pipeline health, GCI, filter summary | SSE |

**Exit criteria:** Command palette opens with Cmd+K, all commands work. Keyboard shortcuts functional with ? overlay. Workspaces save and restore. All export formats generate correctly. Toasts appear for watched story changes.

### Phase 5: Breakthrough Features — Weeks 9-12

Build the cross-domain visualizations that make Triangulate visually unique.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 34 | Convergence Heatmap Timeline | Fog-of-war 2D grid with scrub hairline | Canvas/SVG |
| 35 | Adversarial Constellation | 2D star field with connections and nebulae | Canvas |
| 36 | Claim Battlefield | Force-disposition map with battle line | SVG |
| 37 | Story Replay Mode | Accelerated playback with transport controls | All visualizations |
| 38 | Data Sonification | Web Audio API ambient sounds (opt-in) | Web Audio API |
| 39 | Global Convergence Index | Daily GCI calculation, DB table, cron, sparkline | New DB migration |
| 40 | Source Credibility Trajectories | Per-source confirmation rate sparklines | Aggregate queries |

**Exit criteria:** Each visualization renders, is interactive, and works in both themes. Sonification is opt-in with clear controls. GCI calculates daily and displays in header/status bar.

### Phase 6: Engagement and Growth — Weeks 13-14

Build the behavioral features that drive daily return and subscription conversion.

| # | Task | Deliverable | Dependencies |
|---|------|-------------|--------------|
| 41 | "Today's Surprise" component | Daily highlighted convergence finding | GCI system |
| 42 | NEW/UPDATED badges | Last-visit tracking with change detection | Server-side user state |
| 43 | Progressive mastery hints | 5-level hint system with frequency caps | User behavior tracking |
| 44 | "Show the Math" layer | Expandable convergence calculation on every score | Convergence algorithm |
| 45 | Density mode toggle | 3-mode toggle in settings and command palette | CSS custom properties |
| 46 | Comparative Story Cards | Topic convergence deltas over time | Historical convergence data |
| 47 | Subscription gates | 4 natural gates (claims, search, filters, volume) | capabilities.ts |
| 48 | Disagreement Map | Claim split classification (ideological/regional/institutional/random) | Claude analysis pipeline |

**Exit criteria:** All engagement features functional. Subscription gates tested at all tiers. Progressive hints shown at correct thresholds and dismissed permanently.

---

## Open Design Questions (Require Patrick's Decision)

These decisions affect architecture and must be resolved before Phase 1 implementation begins.

### 1. Sidebar Default State on First Visit

**Option A: Expanded (240px).** More discoverable. New users see all navigation labels. Costs content width.
**Option B: Collapsed (56px).** More content space. Icon-only requires users to explore. Professional tools typically default collapsed.
**Recommendation:** Expanded on first visit, collapsed after 3 visits (user has learned the icons).

### 2. Filter Sidebar vs. Filter Top Bar

**Option A: Persistent left sidebar (Bloomberg style).** Filters always visible. Takes horizontal space. Discovered by interaction designer audit.
**Option B: Top bar with popovers (current audit recommendation).** Filters compact, expand on click. Saves horizontal space. Discovered by UI designer audit.
**Recommendation:** Top bar with popovers for v1 (simpler, saves space for three-panel layout). Sidebar option as a future workspace preset ("Analyst Mode" with filter sidebar instead of Wire panel).

### 3. Mobile Priority

**Option A: First-class citizen.** Responsive panels collapse to single-panel view. All features available. Significant engineering effort.
**Option B: Companion experience.** Simplified mobile layout (feed + detail, no panels). Core reading works, power features desktop-only.
**Recommendation:** Companion experience for launch. The command center paradigm is inherently desktop. Mobile gets feed reading, story detail, and basic filters. Power features (panels, keyboard, export) are desktop-only.

### 4. Sound Design (Data Sonification)

**Option A: Ship it.** Technically achievable (~200 lines of code). Unique differentiator. Opt-in, so no harm to users who dislike it.
**Option B: Defer.** Not core to the convergence value proposition. Could be perceived as gimmicky. Time better spent on filters and visualizations.
**Recommendation:** Defer to Phase 5. Build it, but after core features are solid.

### 5. Convergence Certificate — Pro-Only or Growth Mechanism?

**Option A: Pro-only.** Revenue feature. Journalists pay for the ability to generate proof documents.
**Option B: Free to generate, branded.** Growth mechanism. Every shared certificate has the Triangulate logo and URL. Viral potential.
**Recommendation:** Free to generate (branded with Triangulate logo and link). Pro users get unbranded certificates and bulk export. The free version is marketing.

### 6. Story Replay — Phase 5 or Post-Launch?

**Option A: Phase 5.** It is a teaching tool (shows HOW convergence works) and a marketing asset (shareable replays of dramatic stories).
**Option B: Post-launch.** Not core functionality. Could be built as a standalone feature later.
**Recommendation:** Phase 5 (included in this plan). It is the single best way to explain Triangulate's value to new users and to the press. A 15-second replay of a dramatic convergence story is worth more than any marketing copy.

### 7. Global Convergence Index — Launch Feature or Post-Launch?

**Option A: Launch.** Requires new DB table, cron job, and calculation logic. Provides the "Dow Jones for truth" narrative anchor.
**Option B: Post-launch.** Simplifies launch. Can be added without affecting existing features.
**Recommendation:** Phase 5 (post-core, pre-launch). The GCI is a narrative anchor that gives journalists something to cite. "Today's GCI is 74" is a news hook. But it requires aggregate data to be meaningful, so it needs enough stories and history first.

### 8. New Dependencies — Approve All or Trim?

The audit recommends 8 new packages totaling ~273KB before tree-shaking.

**Phase 1 packages (must-have):** react-resizable-panels, tinykeys, zustand — 10KB total. These enable the core app shell.
**Phase 4 packages (can defer):** cmdk, fuse.js, sonner, @react-pdf/renderer, satori — 263KB total. These are lazy-loadable and only triggered by user action.

**Recommendation:** Approve all 8. The Phase 1 packages are tiny and essential. The Phase 4 packages are large but lazy-loaded (never in the critical path). Total impact on initial page load: ~10KB.

---

## Documents Produced by This Audit

| Document | Location | Contents |
|----------|----------|----------|
| **Master Audit** | `docs/MASTER-AUDIT-2026-03-25.md` | This document — the single source of truth for architectural direction |
| **Command Center Design** | `docs/COMMAND-CENTER-DESIGN.md` | Game design perspective on layout, information hierarchy, and player motivation |
| **Information Architecture** | `docs/INFORMATION-ARCHITECTURE.md` | UX architecture: navigation model, URL structure, user flows, progressive disclosure |
| **Panel Architecture** | `docs/PANEL-ARCHITECTURE.md` | Software architecture: state management, data loading, component communication, performance |
| **Design System Architecture** | `docs/DESIGN-SYSTEM-ARCHITECTURE.md` | Token hierarchy, dual aesthetic specification, density modes, component API patterns |
| **Cross-Domain Innovations** | `docs/CrossDomainInnovations.md` | Heatmap timeline, adversarial constellation, claim battlefield, data sonification, story replay |
| **Data Narratives** | `brainstormer/data-narratives-2026-03-25.md` | GCI specification, convergence narratives, disagreement map, source credibility trajectories |

---

## Appendix A: Full Keyboard Shortcut Map

### Global Shortcuts (Always Active)

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open command palette |
| `Cmd+B` / `Ctrl+B` | Toggle sidebar |
| `?` | Show keyboard shortcut overlay |
| `F6` | Cycle panel focus |
| `Escape` | Close modal / deselect / back |
| `1` | Quick Scan layout preset |
| `2` | Analyst layout preset |
| `3` | Deep Dive layout preset |

### Navigation Shortcuts (Sequential, Vim-Style)

| Shortcut | Action |
|----------|--------|
| `G` then `F` | Go to Feed |
| `G` then `S` | Go to Search |
| `G` then `O` | Go to Sources |
| `G` then `W` | Go to Watchlist |
| `G` then `P` | Go to Pricing |
| `G` then `T` | Go to Settings |

### Wire Panel (Story List)

| Shortcut | Action |
|----------|--------|
| `J` | Next story |
| `K` | Previous story |
| `Enter` | Open selected story in Lens |
| `W` | Watch/unwatch selected story |
| `X` | Expand/collapse selected story preview |

### Lens Panel (Story Detail)

| Shortcut | Action |
|----------|--------|
| `C` | Toggle claims section |
| `S` | Toggle sources section |
| `M` | Show the math (convergence calculation) |
| `E` | Export current story |

### Filter Shortcuts

| Shortcut | Action |
|----------|--------|
| `F` then `B` | Focus bias spectrum bar |
| `F` then `R` | Focus region filter |
| `F` then `C` | Focus convergence threshold |
| `F` then `T` | Focus time horizon |
| `F` then `X` | Clear all filters |

---

## Appendix B: URL Param Schema

All filter state is encoded in URL search params for shareability and bookmarkability.

| Param | Format | Example | Default |
|-------|--------|---------|---------|
| `bias` | Comma-separated bias tier enums | `bias=LEFT,CENTER_LEFT,CENTER` | All (no param) |
| `region` | Comma-separated region enums | `region=US,UK` | All (no param) |
| `convergence` | Integer 0-100 (minimum threshold) | `convergence=70` | 0 |
| `time` | Preset name or ISO range | `time=today` or `time=2026-03-01,2026-03-25` | `today` |
| `topic` | Comma-separated topic slugs | `topic=ukraine,climate` | All (no param) |
| `sources` | Integer 1-5 (minimum source count) | `sources=3` | 1 |
| `trust` | Comma-separated trust signal enums | `trust=PRIMARY_SOURCE,DATA_BACKED` | All (no param) |
| `outlet` | Comma-separated outlet IDs | `outlet=reuters,fox-news` | All (no param) |
| `story` | Story ID (selected story in Lens) | `story=abc123` | None |
| `lens` | Preset name | `lens=highest-signal` | None |
| `sort` | Sort field | `sort=convergence` or `sort=recency` | `recency` |
| `density` | Density mode | `density=compact` | `comfortable` |

**Rules:**
- Absent param = no filter (show all). This means the default feed URL is just `/feed`.
- Params are additive (AND logic between dimensions, OR logic within a dimension).
- Invalid values are silently ignored (treated as absent).
- URL is updated via `useSearchParams` setter on every filter change (replaces history entry, does not push).

---

## Appendix C: Component Inventory (New Components Needed)

### Phase 1 Components
- `AppShell` — Root layout with CSS Grid
- `TopBar` — 48px header with logo, breadcrumbs, search trigger, GCI, avatar
- `Sidebar` — Collapsible navigation rail
- `StatusBar` — 28px monospace info strip
- `PanelContainer` — Generic resizable/collapsible panel wrapper
- `TheWire` — Story list panel (compact rows)
- `TheLens` — Story detail panel
- `TheDossier` — Claims/sources panel (collapsible)
- `StoryListRow` — Compact 72-88px story row for The Wire
- `SkipLinks` — Accessibility skip navigation

### Phase 2 Components
- `FilterBar` — Horizontal control surface
- `BiasSpectrumFilter` — 7-segment drag-to-select (filter mode)
- `RegionFilter` — Region pills with counts
- `ConvergenceThreshold` — Draggable threshold control
- `TimeHorizon` — Segmented time selector
- `TopicCloud` — Weighted tag cloud
- `SourceCountFilter` — Stepped dot selector
- `TrustSignalFilter` — Toggle pill row
- `OutletPicker` — Searchable multi-select (Premium/Pro)
- `LensSelector` — Preset dropdown
- `FilterProvider` — Context provider for cross-filter state
- `ZeroResultState` — Empty state with filter removal suggestions

### Phase 3 Components
- `ConvergenceGauge` — SVG semicircular arc (sm/md/lg)
- `BiasSpectrumBar` — 7-segment display bar (inline/compact/full)
- `ClaimMatrix` — Truth table grid
- `RegionIndicator` — Colored dots
- `TimelineStrip` — Horizontal SVG timeline
- `ConvergenceNarrative` — Auto-generated prose block
- `WhyItMatters` — Contextual popover

### Phase 4 Components
- `CommandPalette` — cmdk-based command dialog
- `ShortcutOverlay` — ? shortcut reference sheet
- `WorkspaceManager` — Save/load/switch workspace UI
- `ExportMenu` — Export format selector
- `ConvergenceCertificate` — PDF/PNG generator
- `NotificationToast` — sonner-based toast
- `NotificationPreferences` — Settings panel for notification triggers

### Phase 5 Components
- `ConvergenceHeatmap` — Fog-of-war timeline
- `AdversarialConstellation` — 2D star field
- `ClaimBattlefield` — Force-disposition map
- `StoryReplay` — Playback controls + coordinated visualization
- `SonificationControls` — Audio settings panel
- `GCISparkline` — Header sparkline for Global Convergence Index
- `GCIPage` — Full GCI dashboard
- `SourceTrajectory` — Per-source confirmation rate sparkline

### Phase 6 Components
- `TodaysSurprise` — Daily highlight card
- `MasteryHint` — Progressive disclosure tooltip
- `ShowTheMath` — Expandable convergence calculation
- `DensityToggle` — 3-mode density selector
- `ComparativeStoryCard` — Topic convergence delta badge
- `UpgradeGate` — Generic subscription gate wrapper
- `UpgradeTeaser` — Per-feature upgrade prompt
- `DisagreementTag` — Colored split-type tag on claims

---

*This document was synthesized from 12 specialist agent audits conducted on March 25, 2026. It represents the complete architectural blueprint for Triangulate's transformation from news feed to convergence command center.*
