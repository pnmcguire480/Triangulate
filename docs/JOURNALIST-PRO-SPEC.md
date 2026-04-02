# JOURNALIST PRO TIER: Product Specification

> **Owner:** Patrick McGuire
> **Status:** Design Complete, Ready for Implementation Planning
> **Depends on:** Spec.md, TechArchitecture.md, capabilities.ts, knowledge-graph-2026-03-25.md
> **Last updated:** 2026-03-30

---

## Strategic Summary

Journalist Pro is Triangulate's $14.99/month tier designed for working reporters, investigative journalists, and newsroom researchers. The guiding principle is Patrick's directive: **"I want journalists to pick this product up because they know it's making LESS work, not more, for them."**

This means every feature must pass the **Subtraction Test**: does this feature remove a step from the journalist's existing workflow, or does it add one? If it adds a step, it does not ship.

### Why Journalists Will Pay

The free tier shows where enemies agree today. Premium lets you filter and search. Journalist Pro does three things no other product on the market does:

1. **Eliminates the verification spreadsheet.** The Claim Matrix replaces the manual process of tracking who-said-what across outlets.
2. **Produces editor-ready evidence.** One-click Evidence Packages replace hours of compiling citations and screenshots.
3. **Builds a personal truth archive that compounds over time.** The Data Base grows more valuable with every session, creating switching costs that justify the subscription.

### Competitive Position

| Capability | Ground News | AllSides | Triangulate Pro |
|---|---|---|---|
| Coverage breadth | Yes | Yes | Yes |
| Bias labels | Static | Static | Dynamic, per-story |
| Claim-level analysis | No | No | Yes |
| Cross-spectrum convergence scoring | No | No | Yes |
| Exportable evidence packages | No | No | Yes |
| Citation generation | No | No | Yes |
| Persistent research archive | No | No | Yes |
| Investigation workspace | No | No | Yes |
| Embeddable convergence badges | No | No | Yes |
| NotebookLM/Obsidian integration | No | No | Yes |

The differentiation is structural: Ground News and AllSides are consumption products. Triangulate Pro is a production tool. It does not just show you the news landscape; it generates artifacts you use in your work.

---

## User Personas

### Persona 1: The Daily Reporter (Alex)

- **Beat:** National politics for a mid-size digital outlet
- **Deadline pressure:** Files 1-2 stories per day
- **Current workflow:** Opens 6-8 tabs, scans headlines, calls 2-3 sources, writes, submits
- **Pain point:** Editor asks "who else is reporting this?" and Alex manually searches 10 outlets
- **Triangulate value:** Claim Matrix answers "who else is reporting this?" in 3 seconds
- **Willingness to pay:** Yes, if it saves 30+ minutes per day

### Persona 2: The Investigative Reporter (Jordan)

- **Beat:** Financial crimes, multi-month investigations
- **Deadline pressure:** Low daily urgency, high accuracy requirement
- **Current workflow:** Maintains a physical or digital "murder board" of connections, spreadsheets of sources and claims, folder of clippings
- **Pain point:** Tracking which claims have been independently verified across outlets over weeks/months
- **Triangulate value:** The Data Base + Connection Map replace the murder board with live convergence data
- **Willingness to pay:** Yes, without hesitation. $14.99 is nothing compared to time saved

### Persona 3: The Fact-Checker (Sam)

- **Role:** Verification desk at a wire service or nonprofit
- **Deadline pressure:** Rapid-response verification (minutes, not hours)
- **Current workflow:** Searches databases, calls sources, checks AP/Reuters/AFP, documents findings
- **Pain point:** Manually tracking which outlets confirm or deny a specific claim
- **Triangulate value:** Convergence certificates provide instant, structured verification evidence
- **Willingness to pay:** Yes, this is exactly their job

---

## Feature Specifications

### FEATURE 1: Evidence Package Export

**User Story:** As a journalist, I want to export a complete evidence package for a story so that I can attach it to my draft for my editor without manually compiling sources.

**What it replaces:** 45-60 minutes of opening tabs, copying quotes, formatting citations, taking screenshots, and assembling a document that proves cross-spectrum verification.

**The Package Contains:**
- Story title and summary
- Convergence score with explanation
- Full claim matrix (every claim, every source, support/contest status)
- Source list with bias tier and region for each
- Primary document links with document type labels
- Formatted citations in the journalist's chosen style
- Convergence certificate (PDF, white-label for Pro)
- Timestamp and data snapshot hash (for provenance)

**Export Formats:**
- PDF (editor-ready, formatted for print/email attachment)
- DOCX (for insertion into drafts in Google Docs or Word)
- Markdown (for Substack, Ghost, or CMS pasting)
- JSON (for programmatic use or archival)

**UI:**
- Button in the LensPanel toolbar: "Export Evidence Package"
- Modal with format selector, citation style selector, and optional notes field
- Progress indicator during generation
- Download triggers immediately on completion

**Data Flow:**
```
User clicks "Export" on a story
  -> Client sends POST /api/export/evidence-package
  -> Server loads: Story + Articles + Claims + ClaimSources + Sources + PrimaryDocs
  -> Server formats per selected output format
  -> Server generates convergence certificate PDF (if included)
  -> Server returns ZIP (multi-file) or single file (PDF/DOCX)
  -> Client triggers download
```

**Acceptance Criteria:**
- AC-1: PDF export renders correctly with all claims, sources, and citations
- AC-2: Citation format matches selected style (AP, Chicago, APA)
- AC-3: Export completes in under 5 seconds for a story with 20 articles and 15 claims
- AC-4: White-label certificate omits Triangulate branding for Pro users
- AC-5: Data snapshot hash is deterministic (same data = same hash)

**Capability Gate:** `evidence-package` (PREMIUM tier only)

---

### FEATURE 2: Citation Generator

**User Story:** As a journalist, I want to generate properly formatted citations for any claim or source so that I can paste them directly into my article draft.

**What it replaces:** Manually looking up outlet names, article titles, publication dates, and formatting them per style guide. Per citation: 2-3 minutes. Per story with 8 sources: 20 minutes.

**Citation Styles Supported:**
- AP Style (default for news): `According to reporting by The New York Times (March 28, 2026), ...`
- Chicago: Full footnote format with URL
- APA: Author-date format
- Plain URL: Bare link with outlet name
- Inline attribution: `[The Guardian, Reuters, and Fox News independently confirmed...]`

**UI:**
- Copy button on every claim row in ClaimsPanel
- Copy button on every source row in SpectrumPanel
- Clicking opens a small popover with style tabs and a "Copy" button
- Copied text goes to clipboard with a toast confirmation
- "Cite All" button at the top of ClaimsPanel generates a full citation block for all confirmed claims

**Special Feature: Convergence Attribution**
A unique citation format that no other tool can generate:
```
This claim was independently confirmed by [N] outlets spanning
[bias range] of the political spectrum, including [outlet list],
with a convergence score of [score]/100.
(Source: Triangulate, triangulatenews.com/story/[id], [date])
```

This is the sentence a journalist pastes into their article to say "I verified this." No other product generates this.

**Data Flow:**
```
User clicks "Cite" on a claim
  -> Client reads claim data from already-loaded story
  -> Client formats citation per selected style (all client-side, no API call)
  -> Client copies to clipboard
  -> Toast: "Citation copied"
```

**Acceptance Criteria:**
- AC-6: All 5 citation styles produce correctly formatted output
- AC-7: Copy-to-clipboard works on all modern browsers
- AC-8: Convergence Attribution includes all supporting outlets by name
- AC-9: "Cite All" produces a coherent paragraph, not a disjointed list

**Capability Gate:** `claim-citation` (PREMIUM tier only, already exists)

---

### FEATURE 3: The Data Base (Persistent Research Workspace)

**User Story:** As a journalist, I want every story I view, claim I bookmark, and search I run to be logged in a persistent, searchable research archive so that I can build an intelligence base over months of reporting.

**What it replaces:** The reporter's personal system of bookmarks, browser tabs, Notion pages, spreadsheets, and memory. All of which are disconnected, unsearchable, and do not track convergence over time.

**Why This Is the Killer Feature:**
The Data Base creates a compounding asset. After 30 days of use, a journalist has a searchable archive of every verified claim they have encountered, every source they have tracked, and every convergence pattern they have observed. After 6 months, it is irreplaceable. After a year, it is a personal intelligence database that no competitor can replicate because it is built from the journalist's own research behavior.

This is not a feature you rent. It is an investment you build.

**What Gets Logged (Automatically):**
- Every story viewed (title, convergence score, date, trust signal)
- Every search query run (query text, result count, date)
- Every claim bookmarked (claim text, convergence score, supporting outlets)
- Every evidence package exported (story, format, date)
- Every source tracked (outlet, region, bias tier)
- Session metadata (duration, stories viewed, claims examined)

**What the User Can Add (Manually):**
- Notes on any logged item (free text, private)
- Tags (user-defined, for organizing by beat, project, or investigation)
- Star/priority flag (surfaces item in "Priority" view)

**Views:**
- **Timeline:** Chronological feed of all logged activity, filterable by type
- **By Tag:** Grouped by user-defined tags
- **By Source:** All activity involving a specific outlet
- **By Entity:** All activity involving a specific person, organization, or place (uses existing entity extraction)
- **Priority:** Starred items only
- **Stats:** Research activity metrics (stories viewed/week, claims bookmarked, most-tracked sources)

**Search:** Full-text search across all logged items, notes, and tags. Powered by the same search infrastructure as the main app.

**Data Model (New Prisma Models):**

```prisma
model ResearchLog {
  id          String       @id @default(uuid())
  userId      String
  entryType   ResearchEntryType
  storyId     String?
  claimId     String?
  sourceId    String?
  searchQuery String?
  metadata    Json?        // flexible storage for context
  note        String?
  tags        String[]     // user-defined tags
  isStarred   Boolean      @default(false)
  createdAt   DateTime     @default(now())

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, entryType])
  @@index([userId, isStarred])
  @@map("research_logs")
}

enum ResearchEntryType {
  STORY_VIEWED
  CLAIM_BOOKMARKED
  SEARCH_RUN
  EVIDENCE_EXPORTED
  SOURCE_TRACKED
  NOTE_ADDED
}
```

**UI:**
- Route: `/research` (new page, Pro-gated)
- Layout: Left sidebar with view switcher (Timeline, Tags, Sources, Entities, Priority, Stats). Main area shows the log entries in a dense, scannable list.
- Each entry row: icon (by type), title/summary, convergence score badge (if applicable), date, tag pills, note indicator, star toggle
- Inline note editing (click to expand, type, save)
- Bulk tag/star operations via shift-select
- Export entire Data Base as JSON or Obsidian vault

**Data Flow:**
```
Automatic logging:
  User views a story -> loader fires -> POST /api/research/log { type: STORY_VIEWED, storyId }
  User bookmarks a claim -> action fires -> POST /api/research/log { type: CLAIM_BOOKMARKED, claimId }

Manual interactions:
  User adds note -> PATCH /api/research/log/:id { note: "..." }
  User adds tag -> PATCH /api/research/log/:id { tags: [...] }
  User stars item -> PATCH /api/research/log/:id { isStarred: true }

Reading:
  GET /api/research?view=timeline&page=1&q=search_term
  -> Returns paginated research log entries with joined story/claim/source data
```

**Acceptance Criteria:**
- AC-10: Story views are logged within 1 second of page load
- AC-11: Full-text search returns results in under 500ms for archives up to 10,000 entries
- AC-12: Tags are user-defined, unlimited, and persist across sessions
- AC-13: Export produces valid Obsidian vault with [[wiki-links]] between entries
- AC-14: Data Base page loads in under 2 seconds with 1,000+ entries (paginated)

**Capability Gate:** `research-workspace` (new capability, PREMIUM tier only)

---

### FEATURE 4: Investigation Board (The Connection Map)

**User Story:** As an investigative journalist, I want to see a visual graph of how stories, claims, sources, and entities connect to each other so that I can identify patterns that are invisible when reading stories one at a time.

**What it replaces:** The literal conspiracy board (corkboard, pushpins, string). Also: the mental model a journalist builds over weeks of reporting, which is fragile, incomplete, and impossible to share with an editor.

**The Charlie Day Metaphor, Made Real:**
The Investigation Board is a force-directed graph where:
- **Story nodes** are sized by convergence score (bigger = more confirmed)
- **Source nodes** are colored by bias tier (using existing bias tier color tokens)
- **Claim edges** connect stories that share confirmed claims (green = converged, red = contested, gray = single-source)
- **Entity nodes** (people, organizations, places) connect stories that reference the same real-world actors
- **Primary Document nodes** connect stories that reference the same source material

The journalist sees: "The tariff story connects to the trade deficit story via 3 shared claims, both connect to the jobs report story via the same government data source, and Senator X appears in all three." That pattern is invisible when reading stories sequentially. On the board, it is obvious.

**Interaction Model:**
- Pan and zoom (mouse/trackpad, pinch on mobile)
- Click a node to see its detail panel (story summary, claim list, source info)
- Drag nodes to rearrange (positions persist in workspace state)
- Double-click a story node to open it in the Lens panel
- Filter the graph by time range, topic, convergence threshold, or entity
- "Focus" mode: select a node, and the graph fades everything not connected to it
- "Add to board" from any story in the Wire: right-click or drag-and-drop

**Scoping (What Ships First vs. Later):**

**Phase 1 (Launch):**
- Story nodes + claim edges only
- Auto-populated from user's Data Base (last 30 days of viewed stories)
- Basic pan/zoom/click interaction
- Filter by convergence threshold
- Implementation: D3.js force-directed layout

**Phase 2 (Post-launch):**
- Entity nodes and connections
- Primary Document nodes
- Source nodes (colored by bias)
- Manual "Add to board" from Wire
- Persistent board state per user

**Phase 3 (Later):**
- Multiple named boards per investigation
- Shared boards (read-only link for editors)
- Timeline scrubber (animate graph evolution over time)
- NotebookLM/Obsidian export of board contents

**Data Flow:**
```
Page load (/connections):
  -> GET /api/research/graph?days=30&minConvergence=0.3
  -> Server queries: ResearchLog (STORY_VIEWED) -> Stories -> Claims -> ClaimSources -> shared claims
  -> Server computes: which stories share claims, what entities overlap
  -> Returns: { nodes: [...], edges: [...] } with positions, scores, metadata
  -> Client renders D3 force-directed graph

Click node:
  -> Client shows detail panel with story/claim data (already in payload)
  -> No additional API call needed

Filter change:
  -> Client filters the existing graph data (client-side, no API call)
  -> Re-runs force simulation with filtered node set
```

**UI:**
- Route: `/connections` (new page, Pro-gated)
- Full-width canvas (no sidebar on this page, or sidebar collapsed by default)
- Toolbar at top: time range selector, convergence threshold slider, topic filter, search within graph
- Detail panel slides in from right when a node is clicked (reuses LensPanel components)
- Legend in bottom-left corner: node type icons, edge color meanings

**Acceptance Criteria:**
- AC-15: Graph renders within 2 seconds for up to 100 story nodes
- AC-16: Pan/zoom is smooth at 60fps with up to 200 nodes
- AC-17: Clicking a node shows story detail within 200ms (no API call)
- AC-18: Graph persists node positions across page refreshes (stored in workspace)
- AC-19: "Focus" mode correctly shows only directly-connected nodes

**Capability Gate:** `connection-map` (new capability, PREMIUM tier only)

---

### FEATURE 5: Convergence Alerts

**User Story:** As a journalist tracking a developing story, I want to receive a notification when a claim's convergence score changes significantly so that I can update my reporting without manually re-checking every day.

**What it replaces:** The daily ritual of re-visiting the same story across multiple outlets to see if anything changed. For a developing story (e.g., a legal case, a policy debate), this can consume 30+ minutes per day.

**Alert Types:**

| Alert | Trigger | Why It Matters |
|---|---|---|
| Convergence Spike | Claim score jumps 20+ points | New outlets confirmed a claim; story is solidifying |
| Convergence Drop | Claim score drops 15+ points | Outlets are retracting or contradicting; story is weakening |
| New Cross-Spectrum Confirmation | A claim goes from same-side to cross-spectrum | The strongest signal: enemies now agree |
| Primary Document Found | A primary doc is linked to a tracked story | The source behind the sources is now available |
| New Story in Entity | A new story appears involving a tracked entity | Your beat just got new coverage |
| Trust Signal Change | Story's trust signal upgrades or downgrades | The overall assessment of the story changed |

**Delivery Channels:**
- **In-app notifications** (sonner toasts + notification panel in TopBar)
- **Email digest** (configurable: instant, daily summary, or weekly summary)
- **Browser push notifications** (opt-in, for time-sensitive alerts)
- **Slack webhook** (for newsroom integration, Phase 2)

**What You Can Track:**
- A specific story (follow button on story detail)
- A specific claim (follow button on claim row)
- A specific entity (follow button on entity mention)
- A specific source (follow button on source page)
- A topic (follow button on topic filter)

**Data Model:**

```prisma
model Alert {
  id          String    @id @default(uuid())
  userId      String
  alertType   AlertType
  targetType  AlertTarget
  targetId    String    // storyId, claimId, sourceId, or entity string
  threshold   Float?    // convergence score change threshold (default 0.2)
  channel     String[]  // ["in_app", "email", "push"]
  isActive    Boolean   @default(true)
  lastFiredAt DateTime?
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isActive])
  @@index([targetType, targetId])
  @@map("alerts")
}

model Notification {
  id          String    @id @default(uuid())
  userId      String
  alertId     String?
  title       String
  body        String
  storyId     String?
  claimId     String?
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

enum AlertType {
  CONVERGENCE_SPIKE
  CONVERGENCE_DROP
  CROSS_SPECTRUM_CONFIRM
  PRIMARY_DOC_FOUND
  ENTITY_NEW_STORY
  TRUST_SIGNAL_CHANGE
}

enum AlertTarget {
  STORY
  CLAIM
  SOURCE
  ENTITY
  TOPIC
}
```

**Data Flow:**
```
Setting an alert:
  User clicks "Follow" on a story
  -> POST /api/alerts { targetType: STORY, targetId: storyId, channel: ["in_app", "email"] }

Checking alerts (runs after every pipeline cycle):
  /api/alerts/check (called by CRON after /api/analyze completes)
  -> For each active alert:
     -> Load current state of target (claim score, trust signal, etc.)
     -> Compare to last known state (stored in alert metadata)
     -> If threshold exceeded: create Notification, send via channels
     -> Update lastFiredAt

Delivering notifications:
  In-app: Client polls GET /api/notifications?unread=true every 60s (same pattern as StatusBar health)
  Email: Batched by user preference (instant/daily/weekly), sent via Resend
  Push: Web Push API, only if user has granted permission
```

**UI:**
- "Follow" button (bell icon) on: story detail header, claim rows, source pages, entity mentions
- Notification bell in TopBar with unread count badge
- Notification panel (dropdown from bell): list of notifications, mark-read, click-to-navigate
- Alert management page: `/settings/alerts` — list all active alerts, toggle on/off, change channels, delete

**Acceptance Criteria:**
- AC-20: Alert check completes within 30 seconds for up to 1,000 active alerts
- AC-21: In-app notification appears within 60 seconds of trigger
- AC-22: Email notifications respect user's delivery preference
- AC-23: "Follow" button state persists across sessions
- AC-24: Notification panel loads in under 500ms with up to 100 notifications

**Capability Gate:** `alerts` (new capability, PREMIUM tier only)

---

### FEATURE 6: NotebookLM Research Pack Export

**User Story:** As a journalist, I want to export a story or collection of stories as a structured Research Pack that I can upload to NotebookLM so that I can use AI-powered cross-document analysis on verified convergence data.

**What it replaces:** Manually copying article text, claim summaries, and source lists into a format that NotebookLM can ingest. This is grunt work that takes 15-20 minutes per story and produces inconsistent results.

**Pack Contents:**
A ZIP file containing structured Markdown files with YAML frontmatter:

```
research-pack-2026-03-30/
  README.md                    # Pack overview, story list, how to use
  stories/
    tariff-impact-analysis.md  # Story summary + claims + convergence
    fed-rate-decision.md
  sources/
    new-york-times.md          # Source profile + confirmation history
    fox-news.md
    reuters.md
  claims/
    claim-001-tariff-rate.md   # Individual claim + all supporting quotes
    claim-002-gdp-impact.md
  primary-docs/
    doc-001-trade-report.md    # Primary document reference + linked stories
  metadata.json                # Machine-readable pack metadata
```

Each Markdown file follows this structure:
```markdown
---
type: story
id: abc-123
title: "Federal Reserve Holds Rates Amid Inflation Concerns"
convergence_score: 0.78
trust_signal: CONVERGED
sources: 12
bias_spread: FAR_LEFT to RIGHT
date: 2026-03-28
---

# Federal Reserve Holds Rates Amid Inflation Concerns

## Summary
[AI-generated neutral summary]

## Confirmed Claims
- **Claim:** The Federal Reserve held rates at 5.25-5.50%
  - **Convergence:** 0.92
  - **Confirmed by:** NYT (LEFT), WSJ (CENTER_RIGHT), Reuters (CENTER), Fox Business (RIGHT)
  - **Supporting quotes:** [...]

## Contested Claims
[...]

## Primary Documents
- [Federal Reserve Press Release](url) (OFFICIAL_STATEMENT)
```

**Use Cases with NotebookLM:**
- Upload a week of packs: "Summarize how tariff coverage evolved this week"
- Upload a month: "Which claims were contested early but later confirmed?"
- Upload all stories on a beat: "Generate an audio briefing on trade policy coverage"
- Cross-document Q&A: "Did any outlet retract a claim that others confirmed?"

**Data Flow:**
```
User clicks "Export Research Pack" (available on story detail or from Data Base)
  -> POST /api/export/research-pack { storyIds: [...], includeRelated: true }
  -> Server loads all stories, claims, sources, primary docs
  -> Server generates Markdown files with YAML frontmatter
  -> Server creates metadata.json
  -> Server creates README.md with usage instructions
  -> Server returns ZIP
  -> Client triggers download
```

**Acceptance Criteria:**
- AC-25: Pack generates correctly for 1-50 stories
- AC-26: YAML frontmatter is valid and parseable
- AC-27: NotebookLM successfully ingests the pack files (manual verification)
- AC-28: metadata.json contains all story IDs, claim IDs, and source IDs for programmatic use
- AC-29: README.md includes clear instructions for NotebookLM upload

**Capability Gate:** `export-notebooklm` (new capability, PREMIUM tier only)

---

### FEATURE 7: Obsidian Vault Export

**User Story:** As a journalist who uses Obsidian for knowledge management, I want to export convergence data as an Obsidian vault with wiki-linked notes so that the data integrates with my existing research and I can use Obsidian's graph view as a visual investigation tool.

**What it replaces:** Manually creating Obsidian notes from news articles, which means copying text, creating links, and maintaining a structure by hand.

**Vault Structure:**
```
triangulate-vault/
  Stories/
    2026-03-28 Federal Reserve Holds Rates.md
    2026-03-27 Tariff Impact Analysis.md
  Claims/
    The Federal Reserve held rates at 5.25-5.50%.md
    GDP growth revised to 2.1%.md
  Sources/
    The New York Times.md
    Reuters.md
    Fox News.md
  Primary Documents/
    Federal Reserve Press Release.md
  Tags/
    (handled via YAML frontmatter, no tag files needed)
  Templates/
    (Obsidian templates for manual note-taking that link back to Triangulate data)
```

**Wiki-Link Strategy:**
Every note links to related notes using `[[double bracket]]` syntax:
- A story note links to its claims: `[[The Federal Reserve held rates at 5.25-5.50%]]`
- A claim note links to its supporting sources: `Confirmed by [[The New York Times]], [[Reuters]]`
- A source note links to all stories it appeared in: `## Stories: [[Federal Reserve Holds Rates]]`
- Entity mentions become links: `[[Jerome Powell]] announced...`

This means Obsidian's graph view automatically shows the same kind of connection map as the Investigation Board, but within the journalist's existing knowledge system.

**Incremental Export:**
The most important design decision: the vault export is **additive, not destructive**.
- First export: creates the vault
- Subsequent exports: merges new data without overwriting existing notes
- User-added content in notes (their own annotations) is preserved in a `## My Notes` section that the exporter never touches
- Deduplication by note title (which includes date for stories, claim text for claims)

**Data Flow:**
```
User clicks "Export to Obsidian" (from Data Base or story detail)
  -> POST /api/export/obsidian { storyIds: [...], includeRelated: true }
  -> Server loads all stories, claims, sources, primary docs, entities
  -> Server generates Markdown files with [[wiki-links]] and YAML frontmatter
  -> Server returns ZIP
  -> Client triggers download
  -> User extracts into their existing Obsidian vault folder
```

**Acceptance Criteria:**
- AC-30: Wiki-links are valid Obsidian syntax and resolve within the vault
- AC-31: Obsidian graph view shows meaningful connections between stories/claims/sources
- AC-32: Incremental export does not duplicate existing notes (match by title)
- AC-33: YAML frontmatter includes convergence_score, trust_signal, date, bias_spread
- AC-34: Export completes in under 10 seconds for 100 stories

**Capability Gate:** `export-obsidian` (new capability, PREMIUM tier only)

---

### FEATURE 8: Convergence Badge (Embeddable Widget)

**User Story:** As a journalist publishing on Substack, Ghost, or my own site, I want to embed a convergence badge on my article so that readers can see that my claims were verified across the political spectrum.

**What it replaces:** Nothing. This does not exist anywhere. No journalist can currently prove, in a machine-verifiable and visually compelling way, that their reporting was confirmed by ideologically opposed outlets.

**Badge Design:**
A small, self-contained HTML widget (iframe or script embed) that shows:
- Convergence score (0-100, color-coded)
- Number of confirming outlets
- Bias spread (e.g., "FAR_LEFT to RIGHT")
- "Verified by Triangulate" link back to the story on triangulatenews.com
- Light/dark mode auto-detection

**Badge Sizes:**
- Inline: 200x40px (fits in article body)
- Card: 300x120px (fits in sidebar or footer)
- Full: 400x200px (hero badge with claim breakdown)

**Embed Code:**
```html
<!-- Inline badge -->
<iframe src="https://triangulatenews.com/badge/[storyId]?size=inline"
  width="200" height="40" frameborder="0"></iframe>

<!-- Or script embed for platforms that block iframes -->
<script src="https://triangulatenews.com/badge/[storyId].js"></script>
```

**Why This Is a Growth Engine:**
Every embedded badge is:
- A backlink to triangulatenews.com (SEO value)
- A brand impression on the journalist's audience
- A trust signal that differentiates the journalist's reporting
- A conversion funnel: readers click through, see the product, some subscribe

**Data Flow:**
```
Badge embed loads:
  -> GET /badge/[storyId]?size=inline&theme=auto
  -> Server returns minimal HTML/CSS with story convergence data
  -> Badge renders as self-contained widget
  -> Click-through opens story on triangulatenews.com in new tab
  -> No cookies, no tracking, no JavaScript beyond display logic
```

**Acceptance Criteria:**
- AC-35: Badge renders correctly in Substack, Ghost, WordPress, and plain HTML
- AC-36: Badge loads in under 200ms (static, cacheable, no JS framework)
- AC-37: Light/dark mode auto-detection works via prefers-color-scheme
- AC-38: Click-through opens story page with UTM parameters for attribution
- AC-39: Badge data updates when story convergence changes (cache TTL: 1 hour)

**Capability Gate:** `convergence-badge` (new capability, PREMIUM tier only)

---

### FEATURE 9: Convergence API

**User Story:** As a journalist or newsroom developer, I want API access to convergence data so that I can integrate verification into our CMS, Slack bot, or internal tools.

**What it replaces:** Manual copy-paste from the web app into other tools.

**API Endpoints:**

| Method | Path | Description | Rate Limit |
|---|---|---|---|
| GET | `/api/v1/stories` | List stories with convergence scores | 100/hour |
| GET | `/api/v1/stories/:id` | Full story detail with claims and sources | 100/hour |
| GET | `/api/v1/stories/:id/claims` | Claims for a story with convergence data | 100/hour |
| GET | `/api/v1/search` | Search stories by keyword | 50/hour |
| GET | `/api/v1/gci` | Current Global Convergence Index | 200/hour |
| GET | `/api/v1/gci/history` | Historical GCI data | 50/hour |
| GET | `/api/v1/sources` | Source directory with stats | 100/hour |
| GET | `/api/v1/sources/:id` | Source detail with monthly stats | 100/hour |
| POST | `/api/v1/triangulate` | On-demand triangulation of a headline/URL | 10/hour |

**Authentication:** API key in header (`Authorization: Bearer tri_xxxxxxxxxxxx`)
- API keys managed in `/settings/api` page
- Each Pro user gets 1 API key
- Keys can be revoked and regenerated

**Response Format:**
```json
{
  "data": { ... },
  "meta": {
    "convergence_score": 0.78,
    "trust_signal": "CONVERGED",
    "sources_count": 12,
    "bias_spread": { "min": "FAR_LEFT", "max": "RIGHT" },
    "last_updated": "2026-03-28T14:30:00Z"
  },
  "links": {
    "self": "/api/v1/stories/abc-123",
    "web": "https://triangulatenews.com/story/abc-123",
    "badge": "https://triangulatenews.com/badge/abc-123"
  }
}
```

**Newsroom Integration Examples:**
- **Slack bot:** `/converge tariff impact` returns top converged stories on tariffs
- **CMS plugin:** Editor types a headline, plugin shows convergence score before publish
- **Google Sheets:** `=TRIANGULATE("tariff impact")` formula using Apps Script + API

**Acceptance Criteria:**
- AC-40: All endpoints return valid JSON with consistent structure
- AC-41: Rate limiting returns 429 with retry-after header
- AC-42: API key authentication works and invalid keys return 401
- AC-43: Search endpoint returns results within 3 seconds
- AC-44: On-demand triangulation endpoint returns results within 15 seconds

**Capability Gate:** `api-access` (PREMIUM tier only, already exists)

---

## Capabilities System Updates

The following new capabilities must be added to `app/lib/capabilities.ts`:

```typescript
// New capabilities for Journalist Pro
| "evidence-package"
| "research-workspace"
| "connection-map"
| "alerts"
| "export-notebooklm"
| "export-obsidian"
| "convergence-badge"
```

Updated PREMIUM tier capability set:
```typescript
PREMIUM: new Set<Capability>([
  // ... all existing capabilities ...
  "evidence-package",
  "research-workspace",
  "connection-map",
  "alerts",
  "export-notebooklm",
  "export-obsidian",
  "convergence-badge",
]),
```

---

## Database Schema Additions Summary

New models required:
- `ResearchLog` (The Data Base)
- `Alert` (Convergence Alerts)
- `Notification` (Alert delivery)

New enums required:
- `ResearchEntryType`
- `AlertType`
- `AlertTarget`

Existing model changes:
- `User` needs relations to `ResearchLog`, `Alert`, `Notification`

---

## Pricing Page Updates

The Journalist Pro tier on `/pricing` should be updated to reflect the concrete features:

```
Journalist Pro — $14.99/month ($0.50/day)
"Your newsroom's convergence engine."

Everything in Premium, plus:
- Evidence Package export (PDF, DOCX, Markdown)
- Citation generator (AP, Chicago, APA styles)
- The Data Base (persistent research archive)
- Investigation Board (visual connection map)
- Convergence Alerts (track developing stories)
- NotebookLM Research Pack export
- Obsidian Vault export
- Embeddable Convergence Badges
- API access (100 requests/hour)
- Unlimited searches
- White-label convergence certificates
```

---

## Implementation Phases

### Phase A: Core Workflow (Ship First)
Priority: These features directly reduce journalist work and prove the value proposition.

1. **Evidence Package Export** — The single most valuable feature. A journalist who exports one evidence package is immediately convinced.
2. **Citation Generator** — Low effort, high daily utility. Every story filed = citations needed.
3. **Convergence Alerts** — Removes the "re-checking" tax. Set and forget.

### Phase B: Research Infrastructure
Priority: These features create the compounding value that drives retention.

4. **The Data Base** — The longer they use it, the harder it is to leave. Ship after Phase A so users have activity to populate it.
5. **Investigation Board (Phase 1)** — Story nodes + claim edges only. Impressive but scoped.

### Phase C: Distribution and Integration
Priority: These features grow the user base and integrate into the broader journalism ecosystem.

6. **Convergence Badge** — Every badge is a backlink and brand impression. Growth flywheel.
7. **NotebookLM Export** — Bridges to Google's ecosystem.
8. **Obsidian Export** — Bridges to the power-user/researcher ecosystem.
9. **API** — Enables newsroom integration and third-party tools.

---

## Success Metrics

| Metric | Target (Month 1) | Target (Month 6) | How Measured |
|---|---|---|---|
| Pro tier subscribers | 50 | 500 | Stripe |
| Evidence packages exported / week | 100 | 1,000 | Database query |
| Citations copied / week | 500 | 5,000 | Client-side event |
| Data Base entries / active user / month | 200 | 500 | Database query |
| Investigation Boards created | 20 | 200 | Database query |
| Badges embedded | 10 | 500 | Badge endpoint logs |
| API keys created | 5 | 100 | Database query |
| Pro churn rate (monthly) | <8% | <5% | Stripe |
| Avg Data Base age (days since first entry) | 20 | 120 | Database query |

The last metric is the most important. If the average Data Base age is growing, users are staying because their archive is becoming more valuable over time. That is the retention engine.

---

## Appendix: Why Not Ground News or AllSides

A journalist evaluating Triangulate Pro against competitors will ask: "What can I do here that I literally cannot do anywhere else?"

**Five things only Triangulate can do:**

1. **Claim-level convergence scoring.** Ground News shows which outlets covered a story. Triangulate shows which specific factual claims were independently confirmed across ideological boundaries, with a mathematical score.

2. **Evidence Package export.** No other product generates a structured, citation-ready document proving cross-spectrum verification. This is the artifact a journalist hands to their editor.

3. **Convergence Attribution citation.** The sentence "This claim was independently confirmed by 8 outlets spanning FAR_LEFT to RIGHT" is a new kind of citation that only Triangulate can generate because only Triangulate computes claim-level convergence.

4. **A persistent research archive that compounds.** Ground News is a consumption product. You read it and close the tab. Triangulate Pro logs every interaction and builds a searchable intelligence base that gets more valuable with every session.

5. **Embeddable proof.** The convergence badge lets a journalist embed machine-verifiable proof of cross-spectrum confirmation directly in their published article. No other product offers this.

These are not incremental improvements. They are structural advantages that come from Triangulate's core architecture of claim extraction and convergence scoring. Competitors would have to rebuild their entire data model to replicate them.
