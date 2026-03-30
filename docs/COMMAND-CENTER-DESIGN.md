# Triangulate Command Center — Game Design-Informed UX Architecture

> **Purpose:** Transform Triangulate from a scrollable news feed into a fixed-panel intelligence dashboard that journalists live in and hobbyists grow into. Every recommendation below is grounded in how the best information-dense games (EVE Online, Stellaris, Football Manager, Factorio, Dwarf Fortress) solve the same problem: present massive data in a way that rewards expertise without punishing newcomers.

---

## Table of Contents

1. [Design Thesis](#1-design-thesis)
2. [The Three-Panel Command Center](#2-the-three-panel-command-center)
3. [Filtering as World Manipulation](#3-filtering-as-world-manipulation)
4. [Progressive Disclosure — The Skill Tree of Understanding](#4-progressive-disclosure--the-skill-tree-of-understanding)
5. [Engagement Loops — Why They Come Back](#5-engagement-loops--why-they-come-back)
6. [Spatial Memory and Fixed Layout](#6-spatial-memory-and-fixed-layout)
7. [Visual Hierarchy for Convergence Data](#7-visual-hierarchy-for-convergence-data)
8. [Keyboard Navigation and Power User Shortcuts](#8-keyboard-navigation-and-power-user-shortcuts)
9. [The Story Detail View — Split-Screen Intelligence](#9-the-story-detail-view--split-screen-intelligence)
10. [Wireframe Descriptions](#10-wireframe-descriptions)
11. [Interaction Patterns Catalog](#11-interaction-patterns-catalog)
12. [Implementation Priority](#12-implementation-priority)

---

## 1. Design Thesis

### The Problem with the Current Layout

The current home page is a **marketing page with a feed bolted on**. There is a hero section, a "How It Works" explainer, a scrollable feed, and a "What We Are / What We Aren't" section. This is fine for a landing page. It is wrong for a daily-use tool.

The analogy: imagine opening Stellaris and first scrolling past a "How Stellaris Works" section before you can see the galaxy map. Power users would leave. New users would never become power users because the tool never trains them to be powerful.

### The Principle

**Triangulate should be a single-screen application with no scrolling on the primary view.** Everything the user needs is visible simultaneously, in fixed positions, at all times. The user manipulates what they see through filters and selections, not through scrolling. Like an RTS command center, the layout is the interface — moving your eyes is navigation.

This does not mean the landing/marketing page disappears. It means the **logged-in experience** (or the "dashboard" experience, even for free users) is a fundamentally different layout from the public landing page. The landing page converts visitors into users. The dashboard retains users into daily operators.

### The Game Design Framing

| Game | What It Teaches Us | Applied to Triangulate |
|------|--------------------|----------------------|
| **EVE Online** | Fixed-position overview panels, information density without clutter | The three-panel layout, nested detail panels |
| **Stellaris** | Map overlays that transform the same geography into different data views | Filter system that re-colors/re-sorts the same story list |
| **Football Manager** | Tabs within fixed panels, progressive detail depth | Story detail that deepens on click without leaving context |
| **Factorio** | Everything has a purpose, nothing decorative, extreme information respect | No filler content, no marketing copy in the dashboard |
| **Civilization** | The minimap as persistent context, advisors as progressive complexity | The convergence minimap, trust signal legend as "advisor" |
| **Dwarf Fortress** | Keyboard-first navigation with mouse as optional | Full keyboard nav for journalists, mouse-friendly for hobbyists |

---

## 2. The Three-Panel Command Center

### Layout: The Triptych

The primary dashboard uses a **fixed three-panel layout** that fills the viewport. No scrolling on the outer shell. Each panel scrolls independently.

```
+-----------------------------------------------------------------------+
|  HEADER BAR (fixed, 48px)                                             |
|  [TRIANGULATE]  [Convergence] [Search] [Watchlist]    [K] [User] [?] |
+----------------+-------------------------------+----------------------+
|                |                               |                      |
|  LEFT PANEL    |  CENTER PANEL                 |  RIGHT PANEL         |
|  "The Wire"    |  "The Lens"                   |  "The Dossier"       |
|  240px fixed   |  flexible, fills space         |  320px, collapsible  |
|                |                               |                      |
|  Story list    |  Selected story detail         |  Contextual intel    |
|  Filters       |  OR convergence overview       |  Claims, sources,    |
|  Region map    |  when nothing selected         |  primary docs,       |
|                |                               |  spectrum analysis   |
|                |                               |                      |
|  [scrolls      |  [scrolls independently]       |  [scrolls            |
|   independently]|                               |   independently]     |
|                |                               |                      |
+----------------+-------------------------------+----------------------+
|  STATUS BAR (fixed, 28px)                                             |
|  55 outlets | 7 regions | Last ingested: 12m ago | [Live] | v0.9     |
+-----------------------------------------------------------------------+
```

### Panel Naming (Internal Branding)

These names are not just labels — they train spatial memory:

- **The Wire** (left): The incoming signal. This is where stories arrive. Named after wire services — the raw feed.
- **The Lens** (center): What you are examining right now. The focused view. Named for the act of looking closely.
- **The Dossier** (right): The deep intelligence on whatever The Lens is showing. Named for the compiled file on a subject.

### Panel Behavior

**The Wire (Left Panel — 240px)**
- Always shows the story list, sorted by signal strength (current tiering: Highest Signal > Developing > Single Source)
- Each story is a **compact row**, not a card. Think Bloomberg Terminal, not Medium.
- Row format: `[TrustSignal icon] [Headline truncated] [Source count] [Time]`
- Clicking a story loads it into The Lens and The Dossier simultaneously
- The currently selected story has a left-edge accent bar (brand-green)
- This panel scrolls independently
- At the top of The Wire: the filter controls (collapsed by default, expandable)
- At the bottom of The Wire: a persistent **Convergence Minimap** (see section 7)

**The Lens (Center Panel — Flexible)**
- **Default state** (nothing selected): Shows a **Convergence Overview** — an at-a-glance summary of today's convergence landscape. Highest-signal stories as a brief, aggregate stats (stories tracked, claims verified, regions active), and the Trust Erosion chart.
- **Story selected state**: Shows the story detail — headline, summary, the 3-column spectrum view (Left / Center / Right), and the bias spread visualization. This is the current ConvergencePanel, but embedded in a fixed panel instead of a scrollable page.
- Transitions between states should be instant (no page navigation, no URL change for panel state). The URL reflects the selected story (`/dashboard` vs `/dashboard/story/:id`) for shareability.

**The Dossier (Right Panel — 320px, Collapsible)**
- **Default state**: Aggregate intelligence — global convergence stats, trending claims, most-contested stories
- **Story selected state**: The claims tracker, primary source list, AI Round Table transcript (when available), and per-claim convergence bars
- Collapsible via a toggle or keyboard shortcut (`]` to collapse, `[` to expand) — gives The Lens more room on smaller screens
- When collapsed, a thin 40px rail remains showing icon indicators for: number of claims, trust signal, primary doc count

**Header Bar (48px)**
- Compact. No tagline, no marketing copy.
- Left: TRIANGULATE wordmark (links to dashboard)
- Center: Primary navigation tabs — `Convergence` (dashboard), `Search`, `Watchlist` (saved stories, premium)
- Right: Keyboard shortcut hint (`K` for command palette), User avatar/tier badge, Help (`?`)
- The "Founder Member" badge lives next to the user avatar, not as a banner

**Status Bar (28px)**
- Persistent footer showing system health
- Left: `55 outlets | 7 regions | Last ingest: 12m ago`
- Center: Empty (reserved for future notifications)
- Right: `[Live]` indicator (green dot when pipeline recently ran), version number
- This bar builds trust. It says "this system is alive and working right now."

---

## 3. Filtering as World Manipulation

### The Civilization Map Overlay Model

In Civilization, you do not filter the map — you change how you see it. Toggle "Political View" and the same geography shows border colors. Toggle "Resource View" and it shows strategic resources. The map does not change. Your lens does.

Triangulate should work the same way. Filters do not hide stories — they **re-weight and re-color** the story list. This is a critical distinction.

### Filter Architecture

Filters live at the top of The Wire panel, collapsed into a single "FILTERS" bar by default. Expanding it reveals:

```
+----------------------------------+
| FILTERS                    [v]   |
+----------------------------------+
| VIEW MODE                        |
| [All] [Converged] [Contested]    |
| [Developing] [Single Source]     |
+----------------------------------+
| BIAS SPECTRUM                    |
| [FL] [L] [CL] [C] [CR] [R] [FR]|
|  (toggle each tier on/off)       |
+----------------------------------+
| REGIONS                          |
| [US] [UK] [EU] [ME] [AP] [CA]   |
| [LA] [AF] [OC] [GL]             |
+----------------------------------+
| CONTENT TYPE                     |
| [Reporting] [Commentary] [All]   |
+----------------------------------+
| TIME RANGE                       |
| [4h] [12h] [24h] [48h] [7d]     |
+----------------------------------+
| CONVERGENCE THRESHOLD            |
| [---|----*--------] 30%+         |
+----------------------------------+
| SOURCE COUNT                     |
| [1+] [2+] [3+] [5+]             |
+----------------------------------+
```

### Key Filter Design Decisions

**1. Bias Spectrum as Toggle Buttons, Not Dropdown**
Each of the 7 bias tiers is a small square button that can be toggled independently. When active, the button shows its tier color. When inactive, it is gray. This lets a user instantly say "show me stories where FAR_LEFT and FAR_RIGHT both have coverage" by toggling only those two.

Visual metaphor: a mixing board. Each tier is a channel. You bring channels up and down to hear different parts of the signal.

**2. Convergence Threshold as a Slider**
A single horizontal slider from 0% to 100%. Stories below the threshold are dimmed (not hidden) — they fade to 30% opacity and sort to the bottom. The user can still see them, but the signal rises above the noise.

This is the Stellaris approach: nothing disappears, importance is communicated through visual weight.

**3. Time Range as Segmented Control**
Not a date picker — preset time windows. News moves fast. The question is never "what happened on March 12th" — it is "what happened in the last 4 hours." The default is 24h. Changing time range should be instant (client-side filter if data is loaded, otherwise a quick refetch).

**4. Filter Persistence**
Filters save to localStorage. When a journalist opens Triangulate at 6 AM, their preferred view (converged stories only, US + UK, reporting only, 24h) loads immediately. This is how RTS games save your preferred camera position and UI layout.

**5. Filter Presets (Premium Feature)**
Named filter presets: "My Morning Brief" (Converged, 12h, US+UK+EU, Reporting only), "Election Watch" (All, US, 48h, all content types), "Deep Dive" (Converged + Contested, 7d, all regions). Users create and name these. This is the saved build / loadout system from any good RPG.

**6. Active Filter Indicators**
When any filter is active (not default), a small colored dot appears on the collapsed FILTERS bar, and the active filters display as small removable chips below the bar. Click the `x` on any chip to reset that filter. Click "Reset All" to return to defaults.

---

## 4. Progressive Disclosure — The Skill Tree of Understanding

### The Two User Archetypes

**The Journalist (Power User)**
- Opens Triangulate multiple times daily
- Wants keyboard shortcuts, dense information, no hand-holding
- Will learn the system deeply if rewarded with speed
- Needs export, citation, and embed features

**The Hobbyist (Explorer)**
- Opens Triangulate 2-3 times per week
- Wants to feel informed, not overwhelmed
- Will not learn keyboard shortcuts
- Needs guided entry points and clear visual hierarchy

### Progressive Disclosure Layers

**Layer 0 — The Glance (0 seconds)**
What you see the instant the dashboard loads, before any interaction:
- The Wire shows today's stories, pre-sorted by signal strength
- The Lens shows the Convergence Overview (aggregate stats, top story summary)
- The Dossier shows trending claims
- A hobbyist can absorb "today's news convergence landscape" without clicking anything
- This is the game's "main menu that is also the game" — like Civilization's opening screen showing the map

**Layer 1 — The Click (1 interaction)**
Click any story in The Wire:
- The Lens fills with the story detail (headline, spectrum panel, article list)
- The Dossier fills with claims, primary docs, AI transcript
- The user now has a complete intelligence brief on one story
- No page navigation occurred. No loading screen. The panels updated.

**Layer 2 — The Filter (2-3 interactions)**
Expand filters, toggle a bias tier, adjust convergence threshold:
- The Wire re-sorts and re-weights
- The user is now "asking a question" of the data: "What do FAR_LEFT and FAR_RIGHT agree on?"
- This is the Civilization overlay switch — same data, different lens

**Layer 3 — The Shortcut (learned over time)**
Keyboard shortcuts, command palette, saved presets:
- `j/k` to move through stories, `Enter` to select, `f` to toggle filters
- `Cmd+K` command palette for instant search, navigation, filter presets
- `1-7` number keys to toggle bias tiers
- This layer is invisible to hobbyists and essential to journalists
- The system never forces you to learn this — it rewards you when you do

**Layer 4 — The Export (premium/journalist)**
Share cards, data exports, embeddable widgets, API access:
- Right-click a claim for "Copy Citation" or "Generate Share Card"
- Export story analysis as structured JSON or formatted report
- This layer appears only for premium/journalist tier users

### How to Teach Without Teaching

The system should never show a tutorial, walkthrough, or tooltip overlay. Instead:

**Contextual Hints in the Status Bar:**
When a user first loads the dashboard, the status bar shows: `TIP: Click any story in The Wire to investigate it`. After they click one: `TIP: Press [f] to filter stories`. After they use a filter: `TIP: Press [Cmd+K] to search anything instantly`. These hints rotate and eventually stop once the user has performed each action 3+ times. This is the Factorio approach — contextual, non-blocking, disappearing.

**The Command Palette as Training Wheels:**
`Cmd+K` opens a search-style palette that lists all available actions:
```
> Go to story...
> Filter by region...
> Filter by bias tier...
> Toggle Dossier panel
> Toggle dark mode
> Open keyboard shortcuts
> Export current view...
```
The palette shows the keyboard shortcut next to each action. Users learn shortcuts by using the palette. This is exactly how VS Code, Figma, and Linear train power users.

---

## 5. Engagement Loops — Why They Come Back

### The Core Loop (Daily)

```
TRIGGER: Morning routine, news anxiety, developing story
    |
    v
OPEN DASHBOARD --> Glance at The Wire
    |                     |
    |    (new high-signal stories since last visit?)
    |         YES                    NO
    |          |                      |
    v          v                      v
See "NEW" badges      See "UPDATED" badges on tracked stories
on fresh stories      (convergence score changed, new sources added)
    |                      |
    v                      v
Click to investigate      Check if your watched stories resolved
    |                      |
    v                      v
Read claims, check spectrum   See convergence trending up/down
    |                      |
    v                      v
SHARE (the viral moment)    RETURN LATER (the retention moment)
"Fox + MSNBC agree on X"   "Let me check back on this one"
```

### What Specifically Drives Return Visits

**1. The "What Changed" Signal**
Every story in The Wire that the user has previously viewed gets a subtle change indicator:
- Convergence score changed: small delta arrow (up/down) next to the score
- New sources added: "+2 outlets" badge
- New claims extracted: "3 new claims" badge
- Trust signal upgraded: the badge pulses once

This is the notification system from any good strategy game — "your city grew" or "new research available." It is information-driven, not engagement-hacking.

**2. Developing Story Tracking (The Zeigarnik Effect)**
When a user clicks a story that has a "Developing" trust signal, the system asks (non-intrusively, in the Dossier panel): "Watch this story?" If yes, it appears in their Watchlist tab. The Watchlist is the "saved game" — incomplete stories that pull you back because your brain wants resolution.

Crucially, this works because convergence is a process, not a binary. A story at 30% convergence might reach 70% over 48 hours as more outlets cover it. Watching that number climb (or seeing it stall) is inherently compelling. It is a progress bar for truth.

**3. The Morning Convergence Number**
At the top of The Lens default view, a single large number: **Today's Global Convergence Index**. This is an aggregate score — what percentage of multi-source stories showed convergence above 50% in the last 24 hours.

This number is:
- Instantly digestible (like a stock market index)
- Variable (different every day — variable ratio reinforcement via genuine data variation)
- Conversation-starting ("convergence dropped to 34% today — what's going on?")
- The "score" that makes Triangulate feel like a live system, not a static page

**4. The "Enemies Agree" Moment**
Every time the system detects convergence between FAR_LEFT and FAR_RIGHT sources on the same factual claim, it should get a special visual treatment in The Wire. Not a notification — a visual emphasis. A subtle glow, a different row background, a small icon that means "adversarial convergence detected."

This is the equivalent of a rare drop in a loot system. It does not happen every day. When it does, it is genuinely surprising and shareable. The variable ratio is natural — it depends on the news cycle, not on algorithm manipulation.

---

## 6. Spatial Memory and Fixed Layout

### What Should Be Always-Visible

| Element | Position | Why Always-Visible |
|---------|----------|-------------------|
| The Wire (story list) | Left panel | The primary navigation. Eyes flick left to scan, like checking a radar. |
| Selected story headline | Top of The Lens | Context anchor — you always know what you are looking at. |
| Trust Signal badge | Top of The Lens, next to headline | The most important metadata. Visible at a glance. |
| Convergence Minimap | Bottom of The Wire | Persistent context. See section 7. |
| Active filter chips | Below filter bar in The Wire | Awareness of current lens. Prevents "why am I not seeing X?" confusion. |
| Status bar | Bottom of viewport | System health, last ingest time, live indicator. Builds trust. |
| Keyboard hint | Header bar | Reminds power users the shortcut system exists. |

### What Should Be On-Demand

| Element | Trigger | Why On-Demand |
|---------|---------|---------------|
| Filter panel (expanded) | Click "FILTERS" or press `f` | Power users need it often, hobbyists rarely. Collapsed saves space. |
| AI Round Table transcript | Tab in The Dossier | Deep information, not needed for initial assessment. |
| Primary source documents | Tab in The Dossier | Deep information, premium feature. |
| Quote snippets on claims | Expand arrow on each claim | Detail that clutters if always shown. |
| Export / share options | Right-click context menu or `e` key | Action, not information. Show when acting. |
| Command palette | `Cmd+K` | Power user tool. Must not clutter the default view. |
| Full article text | "Read Full" link on each article row | We are not a reader. We link out. |
| Story comparison mode | `c` key when 2+ stories selected | Advanced analytical feature. |

### Spatial Consistency Rules

1. **The left panel is always navigation.** Never put content or detail on the left.
2. **The center panel is always the focused subject.** Never put lists or navigation in the center.
3. **The right panel is always supporting detail.** Never put primary content on the right.
4. **The header never changes height or position.** It is the roof. It does not move.
5. **The status bar never changes height or position.** It is the floor.
6. **Panel widths are fixed (left, right) or flexible (center) but never rearranged.** The user's eyes learn where things are.

These rules mirror how EVE Online's overview, selected item, and drone panels maintain fixed positions across all activities. A player in EVE can flick their eyes to the same screen position regardless of context and find the expected information there.

---

## 7. Visual Hierarchy for Convergence Data

### The Convergence Minimap

At the bottom of The Wire panel, a persistent 240px-wide visualization:

```
+----------------------------------+
|         CONVERGENCE MAP          |
|                                  |
|  FL  L  CL  C  CR  R  FR        |
|  ||  ||  |  ||  |  ||  ||       |
|  ||  ||  |  ||  |  ||  ||       |
|  ||  ||  |  ||  |  ||  ||       |
|  ^^  ^^  ^  ^^  ^  ^^  ^^       |
|                                  |
|  7 columns, height = story count |
|  Color = avg convergence score   |
|  per tier for visible stories    |
+----------------------------------+
```

This is a heatmap-style minimap. Seven columns (one per bias tier), with height representing article count and color intensity representing average convergence score for stories involving that tier. It answers at a glance: "Where is the signal strongest right now?"

When a filter is active, the minimap updates to reflect only filtered stories. When a story is selected, the columns that participate in that story pulse subtly.

This is directly modeled on the Civilization minimap — always visible, always updating, provides global context while you focus on local detail.

### Convergence Score Visualization

The current implementation uses a simple percentage and a colored bar. This works but undersells the data. Replace with a **Convergence Gauge** on the story detail view:

```
        Convergence
     _______________
    /    |    |      \
   / LOW | MED| HIGH  \
  /______|____|________\
        ^
       47%

  3/7 tiers | 2 regions
  5 supporting | 1 contesting
```

This semicircular gauge (think RPM gauge / speedometer) communicates:
- The score itself (needle position)
- The zone (red/amber/green background segments)
- Supporting data below (tiers, regions, support/contest ratio)

For story cards in The Wire (compact view), keep the current inline bar but add a **micro-gauge** — a tiny semicircle (16x8px) that shows score zone by color. This is the "health bar" for each story's convergence.

### The Bias Spectrum Bar (Upgraded)

The current bias spread indicator is a single-color bar that shows width as `tiers/7`. This should become a **segmented spectrum bar** where each of the 7 positions is individually colored:

```
[FL][L ][CL][ C][CR][ R][FR]
 --  ##  ##  ##  ##  --  --

## = tier present in story coverage (filled, colored by convergence contribution)
-- = tier absent (empty, gray)
```

Each segment is clickable — clicking a tier segment in a story's spectrum bar jumps to articles from that tier in The Lens. This makes the spectrum bar both a visualization AND a navigation tool.

### Claim Agreement Visualization

The current ClaimsTracker shows supporting/contesting sources as colored chips. Upgrade this with a **Claim Alignment Matrix**:

```
CLAIM: "The legislation passed with 67-33 vote"
Convergence: 87%

         FL   L   CL   C   CR   R   FR
Supports  --  [*]  [*] [*]  [*] [*]  --
Contests  --  --   --  --   --  --   --
Silent    [*] --   --  --   --  --   [*]

[*] = source present, colored by support/contest/silent
```

This matrix instantly shows: (a) which tiers confirmed the claim, (b) which contested it, (c) which are absent. The pattern of fills tells a story — a claim supported across CENTER_LEFT through RIGHT with only the fringes silent is extremely high signal.

### Trust Signal as Shield Icon

The current trust signals use text badges. Replace with a **shield icon system** where the shield fills proportionally to trust level:

```
SINGLE_SOURCE  = empty shield outline, gray
CONTESTED      = shield with X, red
CONVERGED      = half-filled shield, green
SOURCE_BACKED  = 3/4 filled shield, teal
INST_VALIDATED = fully filled shield, gold
```

Shields are universally understood as "defense" / "protection" — and in this context, protection against misinformation. The fill level communicates trust intuitively. A full gold shield is the "legendary item" of trust signals.

---

## 8. Keyboard Navigation and Power User Shortcuts

### The RTS Model

In StarCraft, every action has a keyboard shortcut. In Age of Empires, you select buildings with hotkeys. In Factorio, you build without ever touching a menu. Triangulate should feel the same for journalists who use it 20+ times daily.

### Shortcut Map

**Navigation**
| Key | Action | Context |
|-----|--------|---------|
| `j` | Next story in The Wire | Always |
| `k` | Previous story in The Wire | Always |
| `Enter` | Select/open focused story | When story is focused |
| `Escape` | Deselect story / close panel / dismiss modal | Always |
| `h` | Focus The Wire | Always |
| `l` | Focus The Dossier | Always |
| `Tab` | Cycle between panels (Wire > Lens > Dossier) | Always |

**Filtering**
| Key | Action | Context |
|-----|--------|---------|
| `f` | Toggle filter panel | Always |
| `1`-`7` | Toggle bias tiers (FAR_LEFT=1 through FAR_RIGHT=7) | When filter panel open |
| `r` | Cycle region filter | When filter panel open |
| `t` | Cycle time range | When filter panel open |
| `0` | Reset all filters | When filter panel open |

**Actions**
| Key | Action | Context |
|-----|--------|---------|
| `Cmd+K` / `Ctrl+K` | Open command palette | Always |
| `s` | Toggle story watch/unwatch | When story selected |
| `e` | Export / share current story | When story selected |
| `c` | Toggle comparison mode | When 2+ stories checked |
| `?` | Show keyboard shortcuts overlay | Always |
| `[` | Collapse The Dossier | Always |
| `]` | Expand The Dossier | Always |
| `/` | Focus search | Always |

**Dossier Navigation**
| Key | Action | Context |
|-----|--------|---------|
| `d1` | Dossier tab: Claims | When story selected |
| `d2` | Dossier tab: Sources | When story selected |
| `d3` | Dossier tab: Primary Docs | When story selected |
| `d4` | Dossier tab: AI Transcript | When story selected |

### Visual Feedback for Keyboard Navigation

When navigating with `j/k`, the focused story in The Wire gets a visible focus ring (2px brand-green border) and the row scrolls into view if necessary. The focus ring is distinct from the selection indicator (selection = left accent bar + background change, focus = border ring).

This dual state (focused vs selected) mirrors how games separate "hover" from "click" — you can browse without committing.

### The Command Palette

`Cmd+K` opens a full-width search palette at the top of the viewport (overlaying content):

```
+-----------------------------------------------------------------------+
| > Search stories, actions, filters...                          [Esc]  |
+-----------------------------------------------------------------------+
| STORIES                                                               |
|   Senate Budget Vote Shows Rare Cross-Party Agreement          [Enter]|
|   Climate Data Convergence Across 5 Regions                    [Enter]|
| ACTIONS                                                               |
|   Export current story as PDF                              [Cmd+E]    |
|   Toggle dark mode                                         [Cmd+D]    |
| FILTERS                                                               |
|   Show only US + UK stories                                           |
|   Show only converged stories                                         |
| SAVED PRESETS                                                         |
|   Morning Brief (Converged, 12h, US+UK+EU)                           |
+-----------------------------------------------------------------------+
```

Fuzzy search across story titles, action names, filter names, and saved presets. Results are categorized and keyboard-navigable (`j/k` or arrow keys to move, `Enter` to select).

---

## 9. The Story Detail View — Split-Screen Intelligence

### Current Problem

The current `story.$id.tsx` is a full-page scroll layout. When you open a story, you lose context of the feed. You cannot compare. You cannot quickly check another story. You must navigate back.

### The Fix: Panel-Based Story View

When a story is selected from The Wire, it fills The Lens and The Dossier without any page navigation (on desktop). The URL updates for shareability (`/dashboard/story/:id`) but the transition is a panel content swap, not a page load.

### The Lens Layout (Story Selected)

```
+--------------------------------------------------+
| [Back to Overview]             [Watch] [Share]    |
+--------------------------------------------------+
| TRUST: [Shield: CONVERGED]         12 minutes ago |
+--------------------------------------------------+
|                                                    |
| Senate Budget Bill Passes With                     |
| Unexpected Bipartisan Support                      |
|                                                    |
| [Convergence Gauge: 73%]                           |
| 5/7 tiers | 3 regions | 12 outlets                |
|                                                    |
+--------------------------------------------------+
| THE SPECTRUM                                       |
|                                                    |
| Left-Leaning  |  Center     |  Right-Leaning      |
| ------------- | ----------- | ---------------      |
| [articles     |  [articles  |  [articles           |
|  scroll here] |   scroll]   |   scroll here]       |
|               |             |                      |
+--------------------------------------------------+
```

The Spectrum (current ConvergencePanel) is embedded in The Lens with a fixed height, and each column scrolls independently — exactly as the current implementation already does. This is good design. Keep it.

### The Dossier Layout (Story Selected)

```
+--------------------------------------+
| [Claims] [Sources] [Docs] [AI]       |
+--------------------------------------+
|                                      |
| CLAIMS (selected tab)               |
|                                      |
| [Claim Alignment Matrix]            |
|                                      |
| Claim 1: "Budget passed 67-33"      |
| [==============================] 87% |
| Supports: [NYT] [WSJ] [Fox] [AP]   |
| Contests: --                         |
|                                      |
| Claim 2: "Includes $2T spending"    |
| [====================----------] 62% |
| Supports: [Reuters] [BBC] [NPR]    |
| Contests: [Breitbart]               |
|                                      |
| Claim 3: "McConnell brokered deal"  |
| [==========--------------------] 34% |
| Supports: [Politico] [Hill]         |
| Contests: [Fox]                      |
| Silent: 6 outlets                    |
|                                      |
| [scrolls independently]             |
+--------------------------------------+
```

The tabs at the top of The Dossier switch between:
- **Claims**: The claims tracker with alignment matrices
- **Sources**: Flat list of all outlets covering this story, grouped by bias tier
- **Docs**: Primary source documents (court filings, legislation, etc.)
- **AI**: The AI Round Table transcript showing where models agreed/disagreed

---

## 10. Wireframe Descriptions

### Wireframe A: Dashboard — Default State (No Story Selected)

**Viewport:** 1440x900 (standard laptop)

**Header (48px):**
- Far left: "TRIANGULATE" in Playfair Display, bold, 20px
- Center: Three nav items as tabs — [Convergence] is active (underlined with brand-green), [Search], [Watchlist]
- Far right: [K] icon (command palette hint), user avatar circle with tier badge overlaid, [?] icon

**The Wire (Left, 240px, full height minus header and status bar):**
- Top 40px: "THE WIRE" label (10px, uppercase, tracking-wider, ink-faint) and story count ("34 stories")
- Next 36px: Collapsed filter bar — "FILTERS" button with small green dot (indicating defaults are active)
- Remaining height minus 120px: Story list, each row is approximately 64px tall:
  - Row 1 (highest signal): Shield icon (green, filled) | "Senate Budget Bill Shows Rare..." (truncated, 13px, semibold) | "12 outlets" (10px, muted) | "2h" (10px, muted)
  - Row 2: Shield icon (half-filled) | "Climate Summit Claims Disputed..." | "8 outlets" | "4h"
  - Each row has a 1px bottom border (border color). Hover shows subtle background change.
- Bottom 120px: Convergence Minimap (7-column heatmap)

**The Lens (Center, flexible ~580px):**
- Top: "TODAY'S CONVERGENCE" heading (Playfair Display, 24px)
- Global Convergence Index: Large number "67%" in 48px bold, with "of multi-source stories showed convergence above 50% today" in 14px muted below
- Below: 3 "top converged stories" as compact cards (headline + convergence gauge + tier count)
- Below that: "DEVELOPING" section with 2-3 stories that have rising convergence scores, showing delta arrows

**The Dossier (Right, 320px):**
- Top: "INTELLIGENCE BRIEF" label
- Trending Claims section: 3-4 claims with highest convergence scores across all stories
- Active Regions: Small map or region badges showing which regions have activity
- "CONTESTED" section: 2-3 stories with highest contest ratios

**Status Bar (28px):**
- Left: "55 outlets | 7 regions | Last ingest: 8m ago"
- Right: Green dot + "Live" | "v0.9.1"

### Wireframe B: Dashboard — Story Selected

Same layout, but:

**The Wire:** Row for "Senate Budget Bill..." has a 3px brand-green left border and slightly lighter background. All other rows are normal.

**The Lens:** Now shows:
- Back breadcrumb: "< Overview" (12px, muted)
- Trust shield + "CONVERGED" label + "2 hours ago"
- Headline: "Senate Budget Bill Passes With Unexpected Bipartisan Support" (28px, Playfair)
- Convergence gauge (semicircle, 73%, green zone) with stats below
- The Spectrum: Three-column layout taking remaining height, each column scrolling independently

**The Dossier:** Now shows:
- Four tabs: [Claims] [Sources] [Docs] [AI]
- Claims tab active: claim cards with alignment matrices, convergence bars, supporting/contesting source chips
- Scroll independent of other panels

### Wireframe C: Dashboard — Filters Expanded

Same as Wireframe A, but The Wire's filter section is expanded to show all filter groups (View Mode, Bias Spectrum, Regions, Content Type, Time Range, Convergence Threshold, Source Count). The story list below is compressed but still scrollable. Active filters show as small chips between the filter panel and the story list.

### Wireframe D: Mobile Layout (375px)

On mobile, the three-panel layout collapses to a single-panel tabbed view:

**Header:** Hamburger menu replaces center nav. TRIANGULATE wordmark smaller.

**Main area:** Three bottom tabs replace the three panels:
- [Wire] — Story list with compact rows
- [Lens] — Story detail (tap story in Wire to switch to this tab)
- [Dossier] — Claims/sources (available after selecting a story)

The tabs are fixed at the bottom (like iOS tab bar). Swiping left/right also navigates between tabs.

Filters are accessible via a bottom sheet (swipe up from the Wire tab).

---

## 11. Interaction Patterns Catalog

### Pattern 1: Hover Preview

**Trigger:** Mouse hover on a story row in The Wire (desktop only)
**Behavior:** After 300ms of hover (debounced), a small tooltip appears to the right of the row showing:
- Full headline (untruncated)
- Trust signal + convergence score
- Tier coverage as colored dots
- "Click to investigate" hint

**Why:** Prevents premature clicks. The user can scan The Wire with hover previews before committing to a selection. This is the "tooltip on hover" pattern from every RTS game when you hover over a unit or building.

### Pattern 2: Story Comparison Mode

**Trigger:** Hold `Shift` and click two stories in The Wire, or press `c` after checking two story checkboxes
**Behavior:** The Lens splits into two columns, each showing a story's spectrum view side by side. The Dossier shows a diff view of claims: which claims appear in both stories, which are unique to each.

**Why:** Journalists often need to compare how two related events are being covered differently. This is the "split screen" from racing games or the comparison view from strategy games.

### Pattern 3: Convergence Timeline

**Trigger:** Click the convergence score on a selected story
**Behavior:** A small timeline chart appears showing how the convergence score changed over time as more outlets published coverage. X-axis is time, Y-axis is convergence %. Each data point is labeled with which outlet was added.

**Why:** Convergence is a process. Showing the timeline answers "is this story getting more confirmed or more contested over time?" This is the "graph over time" from Football Manager's player development screens.

### Pattern 4: Source Reputation Glow

**Trigger:** Passive, always active
**Behavior:** In the Spectrum columns and Source lists, each source name has a subtle background glow whose intensity reflects how often that source's claims converge across the spectrum (its historical convergence rate). A source that frequently participates in converged claims has a brighter glow.

**Why:** Over time, users develop an intuitive sense of which sources are "high signal" without Triangulate ever saying "this source is trustworthy." The data speaks. This is the "item rarity glow" from any loot-based game — the glow communicates quality without a label.

### Pattern 5: The Ripple Effect

**Trigger:** New data arrives (fresh ingest results)
**Behavior:** Stories in The Wire that were updated get a brief ripple animation — a subtle wave that passes through the row from left to right, lasting 1 second. The story may re-sort if its position changed.

**Why:** Communicates "this system is alive and updating" without intrusive notifications. This is the "new turn" animation from Civilization — the world advanced, and you see the ripple of changes across the map.

### Pattern 6: Contextual Right-Click Menu

**Trigger:** Right-click on any story, claim, source, or article
**Behavior:** Context-sensitive menu appears:
- On a story: Watch, Share, Compare, Copy Link, Export
- On a claim: Copy Citation, Share Claim Card, View Supporting Quotes
- On a source: View Source Profile, Filter to This Source, Open Source Website
- On an article: Open Original, Copy Citation, Report Issue

**Why:** Power users expect right-click menus. This is standard in every professional tool from Photoshop to Bloomberg Terminal. It keeps the primary interface clean while providing deep functionality.

---

## 12. Implementation Priority

### Phase 1: The Shell (Immediate — before launch)

**Goal:** Replace the scroll layout with the three-panel command center for the dashboard view. Keep the landing page as-is for unauthenticated users.

1. Create `/dashboard` route with the three-panel layout (The Wire, The Lens, The Dossier)
2. Move story list into The Wire panel as compact rows
3. Move story detail into The Lens panel (panel content swap, not page nav)
4. Move claims/sources into The Dossier panel with tabs
5. Implement `j/k/Enter/Escape` keyboard navigation
6. Add the status bar
7. Add independent scroll to each panel

**Why first:** This is the fundamental layout change. Everything else builds on this.

**Files affected:**
- New: `app/routes/dashboard.tsx` (the command center route)
- New: `app/components/dashboard/TheWire.tsx`
- New: `app/components/dashboard/TheLens.tsx`
- New: `app/components/dashboard/TheDossier.tsx`
- New: `app/components/dashboard/StatusBar.tsx`
- New: `app/components/dashboard/StoryRow.tsx` (compact Wire row)
- Modified: `app/root.tsx` (conditional layout: landing vs dashboard)
- Modified: `app/components/layout/Header.tsx` (compact dashboard header)

### Phase 2: Filters and Manipulation

**Goal:** Full filter system with persistence.

1. Build the collapsible filter panel in The Wire
2. Implement all filter types (bias tiers as toggles, convergence slider, time range, regions, content type, source count)
3. Add active filter chips
4. Implement localStorage filter persistence
5. Add filter keyboard shortcuts (`f`, `1-7`, `0`)

### Phase 3: Visualizations

**Goal:** Upgrade from basic bars to the designed visualization system.

1. Build the Convergence Minimap (bottom of The Wire)
2. Build the Convergence Gauge (semicircle) for story detail
3. Build the segmented Spectrum Bar for story rows
4. Build the Claim Alignment Matrix
5. Design and implement the Shield trust signal icons

### Phase 4: Power User Features

**Goal:** Command palette, comparison mode, keyboard depth.

1. Build `Cmd+K` command palette with fuzzy search
2. Implement story comparison mode (Shift+click, split Lens)
3. Add right-click context menus
4. Add convergence timeline chart
5. Build filter presets (save/load/name)

### Phase 5: Engagement Systems

**Goal:** The loops that drive daily return.

1. Build "What Changed" indicators (delta arrows, "+N outlets" badges)
2. Build the Watchlist with developing story tracking
3. Build the Global Convergence Index (daily number)
4. Build contextual status bar tips
5. Build "adversarial convergence detected" visual treatment

---

## Final Note

This document describes a transformation from a news feed into an intelligence console. The core principle throughout is borrowed from the best information-dense games: **fixed spatial positions, progressive depth through interaction not navigation, keyboard-first for power users, and genuine utility loops rather than engagement tricks.**

The news cycle itself provides the variable reinforcement schedule. The convergence algorithm provides the scoring system. The adversarial agreement provides the surprise moments. Triangulate does not need gamification because the underlying data is already inherently game-like — it has stakes, uncertainty, resolution, and surprise. The interface just needs to get out of the way and let the data perform.

Build The Wire first. Everything follows from having a fixed, scannable, keyboard-navigable story list in a persistent left panel.
