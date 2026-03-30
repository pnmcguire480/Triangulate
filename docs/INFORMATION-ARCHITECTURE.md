# INFORMATION ARCHITECTURE -- Triangulate Redesign

> **Purpose:** This document defines every structural decision about how users navigate, discover, and understand information in Triangulate. It is the blueprint for all wireframes, prototypes, and front-end implementation.
>
> **Depends on:** CLAUDE.md (project state), SPEC.md (features), CONTEXT.md (domain), ART.md (visual direction)
> **Feeds into:** Wireframes, component development, route implementation, URL structure

---

## 1. Content Model

Before navigation, understand the objects. Every screen in Triangulate displays, filters, or drills into one of these entities.

### Object Types

| Object | Description | Key Attributes | User Mental Model |
|--------|-------------|---------------|-------------------|
| **Story** | A cluster of articles about the same event | Title, trust signal, convergence score, created date, claim count, article count, regions, bias spread | "What happened" -- the primary unit of news |
| **Claim** | A specific factual or evaluative assertion extracted from a story | Claim text, type (factual/evaluative), convergence score, supporting sources, contradicting sources | "What they said" -- the atomic unit of truth |
| **Article** | A single piece of coverage from one outlet | Title, URL, published date, content type (reporting/commentary), source | "Who said it" -- the evidence |
| **Source** | A news outlet | Name, bias tier, bias category, region, reliability history | "Who is this outlet?" -- credibility context |
| **Primary Document** | Court filings, legislation, transcripts, official data | Title, URL, doc type | "The receipts" -- proof beyond reporting |
| **ClaimSource** | The junction between a claim and an article, with quote and support/contradict | Quote, supports boolean | "The specific evidence" -- links claims to articles |

### Object Hierarchy

```
Story (top-level container)
  |-- Claims[] (extracted assertions)
  |     |-- ClaimSources[] (which articles support/contradict)
  |           |-- Article (the specific piece)
  |                 |-- Source (the outlet)
  |-- Articles[] (all coverage in the cluster)
  |     |-- Source (the outlet)
  |-- PrimaryDocs[] (official documents)
```

### Relationships Users Care About

- **Story to Claims:** "What facts were extracted from this event?"
- **Claim to Sources:** "Who agrees on this claim? Who disagrees?"
- **Source to Bias:** "Where does this outlet sit on the spectrum?"
- **Source to Region:** "Is this a US outlet or international?"
- **Story to Convergence:** "How much cross-spectrum agreement exists?"
- **Source to Track Record:** "How often does this outlet participate in convergence?" (future)

---

## 2. Primary Navigation

### Current Problem

The current app has a flat top nav with three links (Feed, Search, Pricing) that feels like a marketing site, not a tool. There is no sense of workspace, no command center, no persistent context.

### Proposed Structure: Collapsible Left Sidebar + Command Palette

**Why a sidebar, not top nav:**
- Triangulate is an information-dense tool, not a content site. Sidebars give vertical real estate for navigation categories that grow over time.
- Journalists and researchers will develop muscle memory for sidebar positions. Top nav works for 3-5 items; Triangulate will grow beyond that.
- Collapsible sidebar preserves screen real estate for the dense story views while maintaining wayfinding.
- The dark mode cyberpunk aesthetic maps naturally to a sidebar command-center layout.

**Why also a command palette:**
- Power users (journalists, researchers) expect keyboard-driven navigation.
- Cmd/Ctrl+K is an industry-standard shortcut that every professional tool supports.
- Enables search-as-navigation: jump to any story, source, or view without clicking through hierarchy.

### Navigation Sections

```
SIDEBAR (left, collapsible)
--------------------------------------------
[Logo: TRIANGULATE]                 [collapse]

-- PRIMARY --
  The Wire         (/)              -- Today's convergence feed, the morning briefing
  Explore          (/explore)       -- Browse by topic, region, bias tier
  Sources          (/sources)       -- Outlet directory and intelligence
  Trends           (/trends)        -- Historical convergence patterns

-- WORKSPACE --
  Watchlist        (/watchlist)     -- Saved stories and topics (Premium+)
  Saved Searches   (/saved)         -- Persistent search queries (Premium+)
  Exports          (/exports)       -- Download history (Journalist Pro)

-- SYSTEM --
  Search           (Cmd+K)          -- Command palette, not a page
  Settings         (/settings)      -- Account, preferences, notifications
  Pricing          (/pricing)       -- Tier comparison (shown when relevant)
  Help             (/help)          -- Onboarding, methodology, FAQ

--------------------------------------------
[User avatar/email]   [Theme toggle]   [Tier badge]
```

### Sidebar Behavior

| State | Width | Shows | Trigger |
|-------|-------|-------|---------|
| **Expanded** | 240px | Icons + labels + section headers | Default on desktop (>1280px) |
| **Collapsed** | 56px | Icons only, tooltip on hover | Click collapse button, or default on tablet (768-1280px) |
| **Hidden** | 0px | Nothing; hamburger in top bar | Mobile (<768px), swipe-from-left to open |

### Command Palette (Cmd/Ctrl+K)

A search-as-navigation overlay that provides:

1. **Story search** -- type a topic or headline, see matching stories ranked by convergence
2. **Source lookup** -- type an outlet name, jump to its intelligence page
3. **Navigation** -- type a section name ("trends", "settings"), jump directly
4. **Filter shortcuts** -- type "region:europe" or "bias:far_left" to apply filters from anywhere
5. **Keyboard shortcuts list** -- accessible from within the palette

This is a modal overlay, not a page. It appears centered on screen with a dimmed background, closes on Escape or click-outside.

### Top Bar (persistent, above content area)

The top bar is NOT primary navigation. It provides context and utility.

```
[Breadcrumbs]                              [Last updated: 2m ago]  [Cmd+K]  [Notifications bell]
```

- **Breadcrumbs:** Show current location in hierarchy (The Wire > Story > Claim)
- **Last updated:** Timestamp showing data freshness
- **Cmd+K button:** Visual reminder that command palette exists
- **Notifications:** For watched topics/stories that update (Premium+)

---

## 3. The Wire (Dashboard / Home)

### Design Intent

When a journalist opens Triangulate at 6 AM, they should see a command center, not a blog. The Wire is the "morning briefing" -- what converged overnight, what is developing, and what just broke.

### Layout: Three-Zone Dashboard

```
+------------------------------------------------------------------+
|                          TOP BAR                                  |
+------------------------------------------------------------------+
|          |                                                        |
| SIDEBAR  |  ZONE A: Signal Summary (always visible, 120px tall)  |
|          |--------------------------------------------------------|
|          |                    |                                   |
|          |  ZONE B: Feed      |  ZONE C: Right Rail (optional)   |
|          |  (scrollable)      |  (context panel)                 |
|          |                    |                                   |
|          |                    |                                   |
+------------------------------------------------------------------+
```

### Zone A: Signal Summary Bar

A fixed-height, non-scrolling summary strip across the top of the content area. Answers: "What is the state of the world right now?"

| Element | What It Shows | Position |
|---------|--------------|----------|
| **Convergence Pulse** | Count of stories with convergence score > 0.7 today | Left |
| **Active Stories** | Total stories being tracked right now | Left-center |
| **Source Coverage** | "43 of 55 outlets reporting" -- how much of the spectrum is active | Center |
| **Regional Activity** | Mini heat indicator per region (dot per region, brightness = activity) | Center-right |
| **Top Mover** | The story whose convergence score changed most in the last 6 hours | Right |

This strip uses monospace/score typography and feels like a ticker tape or wire-service status bar.

### Zone B: The Feed

The primary content area. A vertically scrolling list of story cards, grouped into signal tiers.

**Tier Structure (kept from current, refined):**

1. **HIGHEST SIGNAL** -- Stories where adversarial sources confirm the same claims (convergence >= 0.3, 2+ sources, or has primary docs). Green accent. These are the product's core value.
2. **DEVELOPING** -- Multi-source stories still being analyzed or with low convergence. Amber accent. These could become highest signal.
3. **BREAKING / SINGLE SOURCE** -- New stories with only one outlet reporting. Gray accent. Shown collapsed by default (expandable).

**Feed Filters (sticky bar between Zone A and Zone B):**

```
[Content: All | Reporting | Commentary]  [Sources: All | 2+ | 3+]  [Region: All | US | UK | ...]  [Topic: All | Politics | ...]  [Time: 24h | 48h | 7d]
```

Filters are **always visible** (no toggle needed). Filter state persists in the URL as query parameters so views can be shared and bookmarked.

**Story Card (redesigned for density):**

The current StoryCard is well-structured but vertically tall. For a command-center feel, compress it.

```
+------------------------------------------------------------------+
| [CONVERGED]  87% converged          3h ago                       |
|                                                                  |
| Federal Reserve Holds Rates Steady Amid Inflation Concerns       |
|                                                                  |
| 12 outlets  |  8 reporting, 4 opinion  |  6 claims  |  3 regions |
| [===================-------] 5/7 tiers                           |
+------------------------------------------------------------------+
```

Changes from current:
- Trust signal badge and convergence score on the same line (save a row)
- Headline is the dominant element (font-headline, larger)
- Metadata condensed into a single line with pipe separators
- Spectrum bar remains (strong visual signal)
- No summary text on the card -- that is for the detail view
- Hover shows a 2-line preview of the highest-convergence claim

### Zone C: Right Rail (Context Panel)

On wide screens (>1440px), a right rail provides contextual information without navigating away.

| Trigger | Right Rail Shows |
|---------|-----------------|
| **Nothing selected** | "Today's Briefing" -- top 3 highest-signal stories with 1-sentence summaries |
| **Hover on story card** | Quick preview: trust signal explanation, top claim, source list |
| **Story selected** | Mini convergence panel (3-column spectrum preview) |

On screens < 1440px, the right rail disappears. Its content becomes accessible through click-to-expand or the story detail page.

---

## 4. Story Exploration Flow

### The Critical Path

This is the most important user journey. A journalist sees a headline, needs to assess it, and decides whether to pursue it -- all within 60 seconds.

```
THE WIRE (see headline)
    |
    | click headline
    v
STORY DETAIL (/story/:id)
    |
    |-- CONVERGENCE PANEL (who reported what, grouped by spectrum)
    |     |
    |     | click source name or article
    |     v
    |     EXTERNAL ARTICLE (new tab) -- user leaves and returns
    |
    |-- CLAIMS SECTION (extracted claims, each with convergence bar)
    |     |
    |     | click claim
    |     v
    |     CLAIM DETAIL (inline expand) -- shows all supporting/contradicting sources with quotes
    |
    |-- PRIMARY SOURCES (court docs, legislation, etc.)
    |     |
    |     | click document
    |     v
    |     EXTERNAL DOCUMENT (new tab)
    |
    |-- RELATED STORIES (other clusters about the same topic, sidebar or bottom)
    |
    | back arrow, breadcrumb, or browser back
    v
THE WIRE (same scroll position preserved)
```

### Click Depth Analysis

| From | To | Clicks | Cognitive Load |
|------|-----|--------|---------------|
| Wire | Story overview | 1 | Low -- scanning a headline they already evaluated |
| Story | Convergence panel (visible) | 0 | Already visible on the page |
| Story | Specific claim details | 1 | Medium -- choosing which claim to drill into |
| Claim | Supporting quote from a specific outlet | 0 | Already visible in expanded claim |
| Story | External article | 1 | Low -- opens in new tab, context preserved |
| Story | Back to wire | 1 | Low -- back button or breadcrumb |

**Maximum depth: 2 clicks from headline to any piece of evidence.** This is the hard constraint.

### Story Detail Page Layout

```
+------------------------------------------------------------------+
| BREADCRUMB: The Wire > Federal Reserve Holds Rates...             |
+------------------------------------------------------------------+
| [CONVERGED]  [87% peak convergence]  [3h ago]  [Share] [Watch]   |
|                                                                  |
| FEDERAL RESERVE HOLDS RATES STEADY                               |
| AMID INFLATION CONCERNS                                          |
|                                                                  |
| 12 outlets | 8 reporting | 4 opinion | 6 claims | 3 regions     |
| ================================================================ |
|                                                                  |
| THE SPECTRUM                                                     |
| +--LEFT--------+--CENTER------+--RIGHT-------+                   |
| | CNN          | AP           | Fox News     |                   |
| | MSNBC        | Reuters      | WSJ          |                   |
| | Guardian     | BBC          | Daily Wire   |                   |
| | ...          | ...          | ...          |                   |
| +--------------+--------------+--------------+                   |
|                                                                  |
| CLAIMS                                   [Factual | Evaluative]  |
| +---------------------------------------------------------+      |
| | [FACTUAL] Fed held rates at 5.25-5.50%     [====] 94%   |      |
| |   + CNN, AP, Reuters, Fox, WSJ, BBC (expand for quotes) |      |
| +---------------------------------------------------------+      |
| | [FACTUAL] Powell cited persistent inflation [===] 78%    |      |
| |   + AP, Reuters, WSJ, MSNBC (expand for quotes)         |      |
| +---------------------------------------------------------+      |
| | [EVALUATIVE] Markets expected the hold      [==] 52%     |      |
| |   + WSJ, Bloomberg vs. MSNBC (expand for quotes)        |      |
| +---------------------------------------------------------+      |
|                                                                  |
| PRIMARY SOURCES                                                  |
| +---------------------------------------------------------+      |
| | Federal Reserve Press Release (Official Statement)       |      |
| | FOMC Meeting Minutes (Government Data)                   |      |
| +---------------------------------------------------------+      |
|                                                                  |
| RELATED STORIES                                                  |
| [Card] [Card] [Card]                                             |
+------------------------------------------------------------------+
```

### Context Persistence

When a user drills into a story and comes back:
- Scroll position in The Wire is preserved (stored in session state)
- Applied filters are preserved (stored in URL query params)
- The "last viewed story" gets a subtle visual indicator in the feed (thin left border accent)

---

## 5. Source Intelligence View (/sources)

### Purpose

Users should be able to understand any outlet's characteristics, track record, and role in the convergence ecosystem. This is NOT a "media bias chart" -- it is operational intelligence.

### Source Directory Layout

```
+------------------------------------------------------------------+
| SOURCES                                    [Search sources...]    |
+------------------------------------------------------------------+
| FILTER: [All Regions v]  [All Bias Tiers v]  [Active Only]       |
+------------------------------------------------------------------+
|                                                                  |
| SPECTRUM MAP (visual)                                            |
| FAR_LEFT  LEFT  CENTER_LEFT  CENTER  CENTER_RIGHT  RIGHT  FAR_R |
|   ||       |||    ||||        |||||     ||||         |||     ||   |
|   2        5      8           12        8            5       2   |
| (each pip = one outlet, click to jump to that outlet)            |
|                                                                  |
| OUTLET LIST (below map, sortable table)                          |
| +------+------------------+----------+--------+--------+-------+ |
| | Tier | Name             | Region   | Active | Stories| Conv% | |
| +------+------------------+----------+--------+--------+-------+ |
| | L    | The Guardian     | UK       | Yes    | 342    | 67%   | |
| | CR   | Wall Street Jrnl | US       | Yes    | 289    | 72%   | |
| | C    | AP               | GLOBAL   | Yes    | 456    | 81%   | |
| +------+------------------+----------+--------+--------+-------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### Source Detail Page (/sources/:id)

When a user clicks on a source:

```
+------------------------------------------------------------------+
| BREADCRUMB: Sources > The Guardian                                |
+------------------------------------------------------------------+
|                                                                  |
| THE GUARDIAN                                                     |
| Bias: Left | Region: UK | Active: Yes                           |
| ================================================================ |
|                                                                  |
| CONVERGENCE PARTICIPATION                                        |
| "This outlet's claims converge with adversarial sources 67%      |
|  of the time across 342 stories."                                |
|                                                                  |
| [Convergence over time: line chart, last 30/90/365 days]         |
|                                                                  |
| FREQUENTLY CONVERGES WITH                                        |
| [Source badges: WSJ (89x), Fox News (67x), Daily Telegraph (45x)]|
|                                                                  |
| RECENT STORIES INVOLVING THIS SOURCE                             |
| [StoryCard] [StoryCard] [StoryCard]                              |
|                                                                  |
| TOPICS THIS SOURCE COVERS                                        |
| [Topic tag cloud or bar chart]                                   |
+------------------------------------------------------------------+
```

This view answers the journalist's question: "Can I trust what The Guardian is reporting on this topic, and who else tends to confirm their reporting?"

---

## 6. Trends / Historical View (/trends)

### Purpose

Show how convergence patterns evolve over time. Which topics are gaining cross-spectrum agreement? Which are becoming more contested? This is the "macro view" that researchers and power users want.

### Layout

```
+------------------------------------------------------------------+
| TRENDS                              [Time: 7d | 30d | 90d | 1y] |
+------------------------------------------------------------------+
|                                                                  |
| CONVERGENCE INDEX (headline metric)                              |
| "Overall cross-spectrum agreement is at 64%, up 3% this week"    |
| [Sparkline showing trend]                                        |
|                                                                  |
| BY TOPIC                                                         |
| +-------------------+----------+---------+--------+              |
| | Topic             | Stories  | Avg Conv| Trend  |              |
| +-------------------+----------+---------+--------+              |
| | Economy           | 45       | 71%     | ^ +5%  |              |
| | Legal / Courts    | 32       | 68%     | ^ +2%  |              |
| | Politics          | 89       | 42%     | v -8%  |              |
| | Health            | 18       | 77%     | -- 0%  |              |
| +-------------------+----------+---------+--------+              |
|                                                                  |
| BY REGION                                                        |
| [World map or region grid showing convergence heat per region]   |
|                                                                  |
| BIGGEST MOVERS (stories with largest convergence change)         |
| [StoryCard with delta indicator] [StoryCard] [StoryCard]         |
|                                                                  |
| CONVERGENCE TIMELINE                                             |
| [Interactive line chart: convergence over time, filterable       |
|  by topic and region]                                            |
|                                                                  |
+------------------------------------------------------------------+
```

### Drill-Down

Clicking a topic row in the table navigates to `/trends/:topic` showing that topic's convergence history with all relevant stories listed chronologically.

Clicking a region navigates to `/trends?region=EUROPE` showing cross-spectrum agreement patterns within and across that region.

---

## 7. User Workspace

### Philosophy

Personalization without social features. The workspace is a private, professional tool -- saved views, tracked topics, and export capabilities. No sharing, no following, no commenting.

### Watchlist (/watchlist) -- Premium+

```
+------------------------------------------------------------------+
| MY WATCHLIST                                        [+ Add Topic] |
+------------------------------------------------------------------+
|                                                                  |
| WATCHED TOPICS (auto-updating feeds)                             |
| +-- Federal Reserve policy (3 new stories since yesterday)       |
| +-- Ukraine conflict (1 new converged story)                     |
| +-- Tech antitrust (no new stories)                              |
|                                                                  |
| WATCHED STORIES (specific clusters)                              |
| [StoryCard with "last checked" timestamp and delta indicator]    |
| [StoryCard]                                                      |
|                                                                  |
| WATCHED SOURCES (outlet monitoring)                              |
| [Source badge] [Source badge] [Source badge]                      |
+------------------------------------------------------------------+
```

Users add items to their watchlist via:
- A "Watch" button on story detail pages
- A "Watch Topic" action on trend pages
- A "Watch Source" action on source pages
- Right-click context menu on any story card

### Saved Searches (/saved) -- Premium+

Persistent search queries that run periodically and surface new matches.

```
+------------------------------------------------------------------+
| SAVED SEARCHES                                  [+ Save Current]  |
+------------------------------------------------------------------+
| "federal reserve" region:US bias:CENTER       12 new results      |
| "climate policy" region:EUROPE                 3 new results      |
| "tech regulation" sources:3+                   0 new results      |
+------------------------------------------------------------------+
```

Each saved search stores the full query string including filters. Clicking runs the search and shows results.

### Exports (/exports) -- Journalist Pro

```
+------------------------------------------------------------------+
| EXPORTS                                                          |
+------------------------------------------------------------------+
| FORMAT: [CSV | JSON | PDF Report]                                |
| SCOPE:  [Current story | Search results | Topic history]         |
|                                                                  |
| RECENT EXPORTS                                                   |
| 2026-03-25  Federal Reserve story (CSV)       [Download]         |
| 2026-03-24  Ukraine conflict, 30-day (PDF)    [Download]         |
+------------------------------------------------------------------+
```

Exportable data includes: story metadata, claims with convergence scores, source attribution, and bias tier mapping.

---

## 8. Onboarding Flow

### Design Constraint

Users should be able to use Triangulate without creating an account. The onboarding flow teaches the concept of convergence through guided exploration of real data, not abstract tutorials.

### First Visit Flow

```
ENTRY (user arrives at /)
    |
    v
LANDING CONTEXT (5 seconds)
    Brief headline: "See where the sources agree."
    One sentence: "We show where ideologically opposed outlets confirm the same facts."
    CTA: "See today's convergence" (scroll to feed) or "How it works" (modal)
    |
    | user scrolls or clicks CTA
    v
THE WIRE (with first-time annotations)
    |
    |-- ANNOTATION 1 (tooltip on first HIGHEST SIGNAL story):
    |   "This story has cross-spectrum convergence. Left, center, and
    |    right-leaning outlets are reporting the same facts."
    |
    |-- ANNOTATION 2 (tooltip on trust signal badge):
    |   "Trust signals show how well-verified a story is.
    |    Green = adversarial sources agree. Yellow = contested."
    |
    |-- ANNOTATION 3 (tooltip on spectrum bar):
    |   "This bar shows how many of the 7 political bias tiers
    |    are covering this story."
    |
    | user clicks a story (annotation encourages this)
    v
STORY DETAIL (with first-time annotations)
    |
    |-- ANNOTATION 4 (on convergence panel):
    |   "The Spectrum shows the same story reported from different
    |    political positions. Look for the same facts across columns."
    |
    |-- ANNOTATION 5 (on first claim):
    |   "Claims are extracted by multiple AI models that must agree.
    |    The percentage shows how many outlets confirm this fact."
    |
    | user explores, reads, returns to feed
    v
FEED (annotations complete, subtle prompt)
    "Want to save stories and track topics? Sign in."
    |
    | user continues browsing (no account needed)
    | OR user signs in
    v
DONE -- annotations stored in localStorage, never shown again
```

### Key Principles

1. **No gate.** The product works before sign-in. Five free stories per day (FREE_TIER_LIMITS).
2. **No tutorial page.** Annotations appear on real content, in context.
3. **Progressive.** Each annotation appears only when the user reaches that element. They are not shown all at once.
4. **Dismissable.** Each annotation has a "Got it" button and a "Skip all" option.
5. **No more than 5 annotations total.** Cognitive budget is tight on first visit.

### Return Visit

On second visit (localStorage flag):
- No annotations
- If not signed in, a subtle banner at the top of The Wire: "You viewed 3 of 5 free stories today. Sign in for unlimited access."
- If signed in, the app remembers their last applied filters and scroll position

---

## 9. Information Hierarchy

At every level of the app, content follows a strict PRIMARY / SECONDARY / TERTIARY hierarchy. Primary information answers "what do I need to know right now?" Secondary answers "what else might matter?" Tertiary answers "where can I go deeper?"

### The Wire (Dashboard)

| Level | Information | Presentation |
|-------|------------|--------------|
| **PRIMARY** | Story headlines, trust signal badges, convergence scores | Large headline font, colored badges, prominent percentage |
| **SECONDARY** | Source count, claim count, region count, content type split | Small text metadata row, icons for scannability |
| **TERTIARY** | Individual source names, time ago, bias spread bar | Smallest text, subtle visual indicators |

### Story Detail

| Level | Information | Presentation |
|-------|------------|--------------|
| **PRIMARY** | Headline, trust signal, peak convergence score | Largest headline on page, prominent badge and number |
| **SECONDARY** | Convergence panel (spectrum columns), claim list with convergence bars | Full-width sections, each with clear headers |
| **TERTIARY** | Individual article titles, source attribution, quotes, primary docs | Within expandable sections, smaller text |

### Claim (within Story Detail)

| Level | Information | Presentation |
|-------|------------|--------------|
| **PRIMARY** | Claim text, convergence score bar | Normal body text, prominent colored bar |
| **SECONDARY** | Claim type (factual/evaluative), supporting source count | Small badges, source name pills |
| **TERTIARY** | Individual quotes, contradicting sources, article links | Expandable section, blockquote styling |

### Source Intelligence

| Level | Information | Presentation |
|-------|------------|--------------|
| **PRIMARY** | Source name, bias tier, region, convergence participation rate | Large heading, prominent stats |
| **SECONDARY** | Convergence trend line, frequently converges with | Chart and badge list |
| **TERTIARY** | Individual story participation, topic breakdown | Table rows, smaller elements |

---

## 10. Navigation Patterns

### Breadcrumbs

Every page deeper than the top level shows breadcrumbs in the top bar.

```
The Wire                                    (no breadcrumb needed, you are home)
The Wire > Federal Reserve Holds Rates...   (story detail)
Sources                                     (top level)
Sources > The Guardian                      (source detail)
Trends                                      (top level)
Trends > Economy                            (topic drill-down)
```

Breadcrumbs are clickable at every level. The current page (rightmost) is not a link.

### Back Navigation

Three methods, all always available:
1. **Browser back button** -- works because all navigation is URL-based, no client-side-only state
2. **Breadcrumb click** -- jump to any ancestor level
3. **Escape key** -- on story detail, returns to the wire (keyboard shortcut for power users)

### Scroll Position Preservation

When navigating from The Wire to a story and back:
- The Wire's scroll position is stored in session storage keyed by the filter state hash
- On return, the page scrolls to the previously viewed position
- If filters changed, position resets to top

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+K | Open command palette |
| J / K | Next / previous story in feed |
| Enter | Open selected story |
| Escape | Back to feed from story, close command palette |
| F | Toggle filter panel |
| 1 / 2 / 3 | Switch between signal tiers (Highest / Developing / Single) |
| S | Toggle sidebar |
| ? | Show keyboard shortcut reference |

Shortcuts are discoverable through the command palette (type "shortcuts") and via a "?" tooltip in the bottom-right corner.

---

## 11. URL Structure

Every meaningful state is in the URL. Users can share, bookmark, and restore any view.

### Route Map

| URL | View | Shareable? |
|-----|------|-----------|
| `/` | The Wire (dashboard/feed) | Yes |
| `/?content=REPORTING&region=US&sources=3&topic=politics&time=48h` | The Wire with filters | Yes -- full filter state in URL |
| `/story/:id` | Story detail | Yes |
| `/story/:id#claim-:claimId` | Story detail scrolled to specific claim | Yes |
| `/sources` | Source directory | Yes |
| `/sources/:id` | Source intelligence page | Yes |
| `/trends` | Trends overview | Yes |
| `/trends?topic=economy&time=90d` | Trends filtered to topic and time range | Yes |
| `/search?q=federal+reserve&region=US` | Search results | Yes |
| `/watchlist` | User watchlist | No (requires auth) |
| `/saved` | Saved searches | No (requires auth) |
| `/exports` | Export history | No (requires auth) |
| `/settings` | User settings | No (requires auth) |
| `/pricing` | Pricing page | Yes |
| `/auth/signin` | Sign in | Yes |
| `/help` | Help and methodology | Yes |
| `/help/methodology` | How convergence scoring works | Yes |

### Filter Encoding

Filters use standard query parameters with short, readable keys:

```
?content=REPORTING        -- content type filter
&region=US                -- region filter (can be comma-separated: US,UK)
&sources=3                -- minimum source count
&topic=politics           -- topic filter
&time=48h                 -- time window (24h, 48h, 7d, 30d)
&signal=CONVERGED         -- trust signal filter
&bias=LEFT,CENTER_RIGHT   -- specific bias tiers
```

All filters are optional. Omitted filters mean "show all."

### Canonical URLs

- Story URLs use the database UUID: `/story/a1b2c3d4-...`
- Source URLs use the database UUID: `/sources/x9y8z7w6-...`
- Future consideration: add slug-based aliases for SEO (`/story/a1b2c3d4/federal-reserve-holds-rates`)

---

## 12. Responsive Breakpoints

| Breakpoint | Layout | Sidebar | Right Rail | Feed Columns |
|-----------|--------|---------|------------|-------------|
| **Mobile** (<768px) | Single column | Hidden (hamburger) | Hidden | 1 |
| **Tablet** (768-1279px) | Two-zone | Collapsed (icons) | Hidden | 1 |
| **Desktop** (1280-1439px) | Two-zone | Expanded | Hidden | 1 |
| **Wide** (>1440px) | Three-zone | Expanded | Visible | 1 (wider cards) |

### Mobile-Specific Adaptations

- The Spectrum (convergence panel) on story detail becomes a tabbed view: [Left] [Center] [Right] instead of three side-by-side columns
- Filters collapse into a bottom sheet triggered by a floating filter button
- Signal summary bar becomes a horizontally scrollable strip
- Story cards are full-width with slightly larger touch targets (minimum 44px tap areas)

---

## 13. Empty, Loading, and Error States

Every view must account for three non-happy states.

### Empty States

| View | Empty State Message | Action |
|------|-------------------|--------|
| The Wire (no stories) | "No stories have been analyzed yet. Check back soon." | Show last updated timestamp |
| The Wire (no filter matches) | "No stories match your filters." | "Clear filters" button |
| Story claims (no claims) | "Claims are still being extracted. Check back in a few minutes." | Show skeleton placeholders |
| Source directory (no match) | "No sources match your search." | "Clear search" button |
| Watchlist (empty) | "Your watchlist is empty. Watch a story or topic to track it here." | Link to The Wire |
| Search (no results) | "No stories found for '[query]'. Try broader terms." | Suggested queries |

### Loading States

- **Skeleton screens** for all content areas (already partially implemented)
- **Signal summary bar** shows pulsing placeholder bars
- **Story cards** show headline-shaped gray bars + metadata dots
- **Convergence panel** shows three gray column outlines
- **Claims** show alternating short/long gray bars

### Error States

| Error | User Sees | Recovery |
|-------|----------|---------|
| Network failure | "Unable to load stories. Check your connection." | "Retry" button |
| Story not found | "This story doesn't exist or has been removed." | Link back to The Wire |
| Rate limit hit (free tier) | "You've reached your daily limit. Sign in for unlimited access." | Sign in CTA + pricing link |
| Server error | "Something went wrong on our end. We're looking into it." | "Retry" button + timestamp |

---

## 14. Accessibility and Performance Constraints

### Accessibility

- All navigation is operable via keyboard (sidebar, filters, story cards, claims expansion)
- Skip-to-content link targets the first story card in The Wire
- ARIA landmarks: `nav` for sidebar, `main` for content area, `aside` for right rail
- Live regions for filter result counts ("Showing 12 stories" announced when filters change)
- Focus management: when opening story detail, focus moves to the headline. When closing, focus returns to the triggering card.

### Performance

- The Wire loads with server-rendered story cards (SSR via Remix loader)
- Skeleton states render immediately; data populates on hydration
- Story detail pages are independently loadable (not dependent on Wire being loaded first)
- Images (if any future outlet logos) lazy-load with placeholder
- Maximum initial payload for The Wire: 40 story cards (current implementation is sound)

---

## 15. Tier-Gated Feature Map

Which navigation items and features are visible per tier.

| Feature | Free | Premium ($7.99) | Journalist Pro ($14.99) |
|---------|------|-----------------|------------------------|
| The Wire (5 stories/day) | Yes | Unlimited | Unlimited |
| Story Detail | Yes (limited) | Full | Full |
| Search | No | 5/day | Unlimited |
| Source Directory | View only | Full + history | Full + history + compare |
| Trends | No | Yes | Yes |
| Watchlist | No | Yes (50 items) | Unlimited |
| Saved Searches | No | Yes | Yes |
| Exports | No | No | Yes (CSV, JSON, PDF) |
| Keyboard Shortcuts | Basic (J/K/Enter) | All | All |
| Command Palette | No | Yes | Yes |
| API Access | No | No | Future |

Gated features show a lock icon in the sidebar with a tooltip: "Available on Premium."

---

## 16. Sitemap (Complete)

```
TRIANGULATE
|
+-- / (The Wire -- dashboard feed)
|   +-- /?filters... (filtered views)
|
+-- /story/:id (Story detail)
|   +-- /story/:id#claim-:claimId (anchored to claim)
|
+-- /explore (Browse by topic/region -- future, redirects to / with filters for now)
|
+-- /sources (Source directory)
|   +-- /sources/:id (Source intelligence page)
|
+-- /trends (Historical convergence)
|   +-- /trends?topic=X (Topic drill-down)
|   +-- /trends?region=X (Region drill-down)
|
+-- /search?q=X (Search results)
|
+-- /watchlist (User watchlist -- auth required, Premium+)
+-- /saved (Saved searches -- auth required, Premium+)
+-- /exports (Export history -- auth required, Journalist Pro)
|
+-- /settings (User settings)
|   +-- /settings/account (Email, password, linked accounts)
|   +-- /settings/preferences (Default region, default filters, notifications)
|   +-- /settings/billing (Subscription management, invoices)
|
+-- /pricing (Tier comparison)
+-- /auth/signin (Magic link sign-in)
+-- /auth/verify (Magic link verification)
|
+-- /help (Help center)
|   +-- /help/methodology (How convergence scoring works)
|   +-- /help/sources (How outlets are selected and categorized)
|   +-- /help/faq (Frequently asked questions)
|
+-- /api/... (API routes -- unchanged from current)
```

---

## 17. Migration Path from Current State

The current codebase already implements the core data flow correctly. The redesign is structural (navigation, layout, information density) rather than functional.

### Phase 1: Navigation Shell (Build First)

1. Implement collapsible sidebar component
2. Move current top nav items into sidebar
3. Add breadcrumb component to top bar
4. Add command palette (Cmd+K) with basic story search

### Phase 2: The Wire Upgrade

1. Add signal summary bar (Zone A)
2. Compress StoryCard for higher density
3. Make filters always-visible with URL persistence
4. Add time-window filter
5. Add topic filter

### Phase 3: Story Detail Refinement

1. Add breadcrumb navigation
2. Add "Watch" and "Share" actions
3. Add related stories section
4. Add claim anchor linking (URL hash)

### Phase 4: New Views

1. Build Source Intelligence page (/sources, /sources/:id)
2. Build Trends page (/trends)
3. Build Watchlist (/watchlist)

### Phase 5: Power User Features

1. Keyboard shortcuts (J/K navigation, etc.)
2. Saved searches
3. Exports
4. Right rail context panel

---

## 18. Open Design Questions

These require user testing or owner decision before implementation.

| Question | Options | Recommendation | Decision |
|----------|---------|---------------|----------|
| Sidebar default state on first visit? | Expanded vs collapsed | Expanded -- users need to discover navigation items | Pending |
| Should story cards show a 1-line summary? | Yes (more context) vs No (more density) | No for default, yes on hover/right-rail | Pending |
| Should The Wire auto-refresh? | Polling vs manual vs WebSocket | Manual with "X new stories" banner (like Twitter/X) | Pending |
| Topic taxonomy: fixed list or dynamic? | Fixed 9 topics vs AI-generated topics | Start with fixed 9, move to dynamic when data supports it | Pending |
| Mobile navigation: bottom tab bar? | Tab bar vs hamburger-only | Hamburger -- too many items for a tab bar, and the tool is desktop-primary | Pending |
| Search in sidebar or command palette only? | Both vs palette only | Both -- sidebar link opens /search for casual users, Cmd+K for power users | Pending |

---

## Revision History

| Date | Change | Rationale |
|------|--------|-----------|
| 2026-03-25 | Initial IA document created | Full structural redesign from blog layout to command-center layout |
