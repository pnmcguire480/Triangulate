# Knowledge Integration Design: Obsidian + NotebookLM

> **Purpose:** Design the integration layer between Triangulate and two knowledge tools — Obsidian (investigation board) and Google NotebookLM (AI research assistant) — to create an effortless "build the case" workflow for journalists and researchers.
>
> **Depends on:** Spec.md, TechArchitecture.md, CLAUDE.md
> **Tier gating:** Obsidian/NotebookLM export = PREMIUM capability

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Part 1: Obsidian Integration](#part-1-obsidian-integration)
3. [Part 2: NotebookLM Integration](#part-2-notebooklm-integration)
4. [Part 3: Cross-Tool Workflow](#part-3-cross-tool-workflow)
5. [Part 4: API Endpoints](#part-4-api-endpoints)
6. [Part 5: Implementation Sequence](#part-5-implementation-sequence)

---

## Design Principles

1. **Export-first, sync-later.** Start with downloadable vault packs. Live sync is a future plugin.
2. **Preserve journalist annotations.** Triangulate data lives in designated folders. User notes live alongside but are never overwritten.
3. **Plain text portable.** Every file is Markdown with YAML frontmatter. No tool lock-in.
4. **The graph is the product.** Obsidian's graph view should immediately reveal the investigation's shape without any configuration.
5. **NotebookLM is the conversation partner.** Feed it structured reports so it can answer questions about convergence patterns it has never seen before.

---

## Part 1: Obsidian Integration

### 1.1 Vault Structure

When a journalist exports from Triangulate, they receive a `.zip` file containing a ready-to-open Obsidian vault (or a folder to drop into an existing vault). The structure:

```
Triangulate/                          # Root folder (inside vault)
├── _config/
│   ├── triangulate.json              # Export metadata, API key, sync settings
│   └── templates/
│       ├── story.md                  # Template for story notes
│       ├── claim.md                  # Template for claim notes
│       ├── source.md                 # Template for source profiles
│       ├── entity.md                 # Template for entity notes
│       └── investigation.md          # Template for user investigations
├── Stories/
│   ├── 2026-03-28 — US Tariff Plan Leaked.md
│   ├── 2026-03-27 — WHO Pandemic Treaty Draft.md
│   └── ...
├── Claims/
│   ├── Tariff rates set at 25% on EU imports.md
│   ├── WHO treaty requires national sovereignty waiver.md
│   └── ...
├── Sources/
│   ├── Reuters.md
│   ├── Fox News.md
│   ├── The Guardian.md
│   └── ...
├── Entities/
│   ├── People/
│   │   ├── Robert Lighthizer.md
│   │   └── ...
│   ├── Organizations/
│   │   ├── World Health Organization.md
│   │   └── ...
│   └── Places/
│       ├── Brussels.md
│       └── ...
├── Investigations/
│   ├── My Tariff Investigation.md    # User-created investigation boards
│   └── ...
├── Structure Notes/
│   ├── MOC — US Trade Policy.md      # Auto-generated maps of content
│   ├── MOC — Global Health Policy.md
│   └── ...
├── Timeline/
│   ├── 2026-03-28.md                 # Daily notes linking to all stories/claims from that day
│   └── ...
└── Convergence Reports/
    ├── 2026-03-28 — Daily Briefing.md
    └── ...
```

### 1.2 Frontmatter Schema

Every note type has YAML frontmatter that powers Dataview queries.

#### Story Note Frontmatter

```yaml
---
type: story
triangulate_id: "abc-123-def"
title: "US Tariff Plan Leaked Showing 25% EU Import Rates"
trust_signal: CONVERGED
convergence_score: 0.82
topic: ECONOMY
regions: [US, EUROPE]
bias_tiers_present: [FAR_LEFT, LEFT, CENTER, RIGHT, FAR_RIGHT]
article_count: 14
claim_count: 7
primary_docs: 2
created: 2026-03-28
last_analyzed: 2026-03-28T14:30:00Z
source: "Triangulate Export"
export_version: "1.0"
aliases:
  - "tariff leak"
  - "EU import tariffs"
tags:
  - triangulate/story
  - triangulate/converged
  - trade-policy
  - us-eu-relations
---
```

#### Claim Note Frontmatter

```yaml
---
type: claim
triangulate_id: "claim-456"
story_id: "abc-123-def"
claim_text: "Tariff rates set at 25% on EU imports"
claim_type: FACTUAL
convergence_score: 0.91
lifecycle: ESTABLISHED
confidence: HIGH
first_seen: 2026-03-27
supporting_sources: [Reuters, AP, Fox News, The Guardian, Al Jazeera]
contradicting_sources: []
supporting_count: 5
contradicting_count: 0
bias_spread: 5  # number of distinct bias tiers supporting
source: "Triangulate Export"
tags:
  - triangulate/claim
  - triangulate/established
  - triangulate/high-convergence
---
```

#### Source Note Frontmatter

```yaml
---
type: source
triangulate_id: "src-789"
name: "Reuters"
url: "https://reuters.com"
bias_tier: CENTER
region: GLOBAL
is_wire_service: true
confirmation_rate: 0.87  # from SourceMonthlyStats
total_claims_cited: 342
source: "Triangulate Export"
tags:
  - triangulate/source
  - triangulate/center
  - wire-service
---
```

#### Entity Note Frontmatter

```yaml
---
type: entity
entity_type: person  # person | organization | place
name: "Robert Lighthizer"
mentioned_in_stories: ["abc-123-def", "xyz-456-ghi"]
mentioned_in_claims: ["claim-456", "claim-789"]
first_seen: 2026-03-15
mention_count: 23
source: "Triangulate Export"
tags:
  - triangulate/entity
  - triangulate/person
  - trade-policy
---
```

### 1.3 Note Body Templates

#### Story Note Body

```markdown
# {{title}}

> **Trust Signal:** {{trust_signal_badge}}
> **Convergence:** {{convergence_score_pct}}
> **Coverage:** {{article_count}} articles across {{bias_tier_count}} bias tiers

## Summary

{{ai_generated_summary}}

## Claims

| Claim | Score | Lifecycle | Sources |
|-------|-------|-----------|---------|
{{#each claims}}
| [[{{claim_note_title}}]] | {{convergence_pct}} | {{lifecycle}} | {{source_count}} |
{{/each}}

## Bias Spectrum

```dataview
TABLE WITHOUT ID
  link(file.link, source_name) as "Source",
  bias_tier as "Bias",
  region as "Region"
FROM "Triangulate/Sources"
WHERE contains(this.file.inlinks, file.link)
SORT bias_tier ASC
```

## Primary Documents

{{#each primary_docs}}
- [{{title}}]({{url}}) — {{doc_type}}
{{/each}}

## Articles Covering This Story

{{#each articles}}
- [[{{source_name}}]] — [{{article_title}}]({{article_url}}) ({{published_date}})
{{/each}}

## Framing Differences

{{framing_analysis_text}}

---
*Exported from [Triangulate](https://triangulatenews.com) on {{export_date}}*
```

#### Claim Note Body

```markdown
# {{claim_text}}

> **Convergence:** {{convergence_score_pct}}
> **Lifecycle:** {{lifecycle}}
> **Type:** {{claim_type}}
> **First Seen:** {{first_seen_date}}

## Story Context

Part of: [[{{story_note_title}}]]

## Supporting Sources

{{#each supporting_sources}}
- [[{{source_name}}]] ({{bias_tier}}, {{region}})
  > "{{direct_quote}}"
{{/each}}

## Contradicting Sources

{{#if contradicting_sources}}
{{#each contradicting_sources}}
- [[{{source_name}}]] ({{bias_tier}}, {{region}})
  > "{{direct_quote}}"
{{/each}}
{{else}}
No sources currently contradict this claim.
{{/if}}

## Related Claims

```dataview
LIST
FROM "Triangulate/Claims"
WHERE story_id = this.story_id AND file.name != this.file.name
SORT convergence_score DESC
```

## My Notes

<!-- Your analysis goes here. Triangulate will never overwrite this section. -->

---
*Exported from [Triangulate](https://triangulatenews.com) on {{export_date}}*
```

### 1.4 Link Architecture

The linking strategy creates a dense, navigable graph:

```
Story ←→ Claim          (bidirectional: story lists claims, claim links to story)
Claim ←→ Source          (claim lists supporting/contradicting sources)
Source ←→ Story          (source appears in story's article list)
Entity ←→ Story          (entity mentioned in story)
Entity ←→ Claim          (entity is subject of claim)
Entity ←→ Entity         (entities co-mentioned in same story)
Timeline ←→ Story        (daily note links to stories from that day)
Structure Note ←→ Story  (MOC organizes stories by topic)
Investigation ←→ *       (user links to anything they are investigating)
```

**Link format:** Standard Obsidian `[[wikilinks]]` with display text where useful: `[[Tariff rates set at 25% on EU imports|25% EU tariff claim]]`

### 1.5 Graph View Appearance

When the journalist opens Obsidian's graph view on their investigation:

- **Story nodes** are large circles, colored by trust signal (green=CONVERGED, yellow=CONTESTED, red=SINGLE_SOURCE, blue=SOURCE_BACKED, purple=INSTITUTIONALLY_VALIDATED)
- **Claim nodes** are medium circles, with opacity proportional to convergence score (higher = more opaque)
- **Source nodes** are small circles, colored by bias tier (a spectrum from red through gray to blue)
- **Entity nodes** are diamonds (via CSS snippet), colored by entity type
- **Investigation nodes** are stars (the journalist's pinned items)

This is achieved through an Obsidian CSS snippet included in the export:

```css
/* Triangulate Graph Styling */
.graph-view.color .tag-triangulate\/story { color: var(--trust-color); }
.graph-view.color .tag-triangulate\/claim { opacity: var(--convergence-opacity); }
.graph-view.color .tag-triangulate\/source.tag-triangulate\/far-left { color: #c0392b; }
.graph-view.color .tag-triangulate\/source.tag-triangulate\/center { color: #95a5a6; }
.graph-view.color .tag-triangulate\/source.tag-triangulate\/far-right { color: #2980b9; }
```

### 1.6 Dataview Queries for Investigation

Journalists can paste these queries into any note to interrogate their data.

**Show all CONVERGED claims about an entity:**

```dataview
TABLE claim_text, convergence_score, lifecycle, supporting_sources
FROM "Triangulate/Claims"
WHERE contains(file.outlinks, [[Robert Lighthizer]])
  AND convergence_score >= 0.7
SORT convergence_score DESC
```

**Show contested stories in the last 7 days:**

```dataview
TABLE title, trust_signal, convergence_score, article_count
FROM "Triangulate/Stories"
WHERE trust_signal = "CONTESTED"
  AND created >= date(today) - dur(7 days)
SORT created DESC
```

**Show sources that both support and contradict claims in a story:**

```dataview
TABLE name, bias_tier, region, confirmation_rate
FROM "Triangulate/Sources"
WHERE contains(file.inlinks, [[US Tariff Plan Leaked]])
SORT bias_tier ASC
```

**Show claim lifecycle progression (for timeline analysis):**

```dataview
TABLE claim_text, lifecycle, first_seen, convergence_score
FROM "Triangulate/Claims"
WHERE story_id = "abc-123-def"
SORT first_seen ASC
```

**Cross-story entity connections (the conspiracy board query):**

```dataview
TABLE file.name AS "Story", convergence_score
FROM "Triangulate/Stories"
WHERE contains(file.outlinks, [[World Health Organization]])
  OR contains(file.outlinks, [[Robert Lighthizer]])
SORT convergence_score DESC
```

### 1.7 Obsidian Canvas (The Investigation Board)

The Canvas file (`.canvas` JSON) is the literal "Charlie Day conspiracy board." Triangulate can generate a starter canvas for an investigation.

**Canvas node types:**

| Node Type | Visual | Content |
|-----------|--------|---------|
| Story card | Large, colored border by trust signal | Title + convergence gauge + trust badge |
| Claim card | Medium, border opacity = convergence | Claim text + score + lifecycle badge |
| Source card | Small, colored by bias tier | Source name + bias tier + confirmation rate |
| Entity card | Medium, icon by type | Entity name + mention count + story links |
| User note | Yellow sticky note style | Free-text journalist annotations |
| Web embed | Browser frame | Link to original article or primary document |
| Image | Photo frame | Screenshots, charts, evidence photos |

**Canvas edge types:**

| Edge | Color | Label |
|------|-------|-------|
| Story-to-Claim | Green (converged) / Yellow (contested) | "confirms" or "disputes" |
| Claim-to-Source | Gray | Source name |
| Entity-to-Story | Purple | "mentioned in" |
| Entity-to-Entity | Orange dashed | "co-appears with" |
| User annotation | Red | User-defined |

**Generated canvas structure:**

```json
{
  "nodes": [
    {
      "id": "story-abc",
      "type": "file",
      "file": "Triangulate/Stories/2026-03-28 — US Tariff Plan Leaked.md",
      "x": 0, "y": 0,
      "width": 400, "height": 300,
      "color": "4"
    },
    {
      "id": "claim-456",
      "type": "file",
      "file": "Triangulate/Claims/Tariff rates set at 25% on EU imports.md",
      "x": 500, "y": -100,
      "width": 350, "height": 200,
      "color": "4"
    },
    {
      "id": "entity-lighthizer",
      "type": "file",
      "file": "Triangulate/Entities/People/Robert Lighthizer.md",
      "x": -400, "y": 200,
      "width": 250, "height": 150,
      "color": "6"
    },
    {
      "id": "user-note-1",
      "type": "text",
      "text": "Why did this leak now? Check timing against EU trade summit.",
      "x": 500, "y": 300,
      "width": 300, "height": 100,
      "color": "1"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "fromNode": "story-abc",
      "toNode": "claim-456",
      "color": "4",
      "label": "confirms (0.91)"
    },
    {
      "id": "edge-2",
      "fromNode": "entity-lighthizer",
      "toNode": "story-abc",
      "color": "6",
      "label": "mentioned in"
    }
  ]
}
```

### 1.8 Investigation Workflow in Obsidian

**Step 1: Pin from Triangulate.** In the Triangulate web UI, the journalist clicks "Send to Obsidian" on a story, claim, or source. This adds the item to an export queue (stored in the Workspace Zustand store).

**Step 2: Export the investigation pack.** The journalist clicks "Export to Obsidian" from the Export Dialog. Triangulate generates the `.zip` containing all pinned items plus their transitive connections (a story brings its claims, claims bring their sources, sources bring their profiles).

**Step 3: Open in Obsidian.** Unzip into vault or use "Open folder as vault." The graph view immediately shows the investigation shape.

**Step 4: Investigate.** The journalist:
- Opens the Canvas to see the visual board
- Adds sticky notes with their own analysis
- Draws new connections they notice
- Runs Dataview queries to find patterns
- Links entities across stories to build the case

**Step 5: Return findings.** When ready to share, the journalist can:
- Export a Convergence Certificate from Triangulate citing the evidence
- Use Obsidian Publish to share a read-only view of the investigation
- Feed the investigation into NotebookLM for AI-assisted analysis (see Part 2)

### 1.9 Live Sync vs. Export (Recommendation)

**Phase 1 (Launch): Export only.** A `.zip` download. No plugin, no API calls from Obsidian. This works today with zero dependencies.

**Phase 2 (Post-launch): Hybrid sync.** An Obsidian community plugin (`obsidian-triangulate`) that:
- Authenticates with the journalist's Triangulate API key
- Polls for updates to pinned stories/claims (every 15 minutes, matching Triangulate's pipeline cadence)
- Updates frontmatter and body content in-place
- NEVER touches content under `## My Notes` headings or user-created notes in `Investigations/`
- Adds a ribbon icon for quick-pinning from Obsidian's command palette

**Phase 3 (Future): Bidirectional.** The plugin sends journalist annotations back to Triangulate, enabling collaborative investigation features.

**Sync conflict resolution:**
- Triangulate data sections are marked with HTML comments: `<!-- TRIANGULATE:START -->` ... `<!-- TRIANGULATE:END -->`
- User content outside these markers is never modified
- If a claim's convergence score changes, the frontmatter updates and a changelog entry is appended

---

## Part 2: NotebookLM Integration

### 2.1 What NotebookLM Accepts

NotebookLM accepts these source types:
- **Google Docs** (directly linked)
- **PDFs** (uploaded, max ~500K words per source)
- **Web URLs** (public pages it can crawl)
- **Plain text** (pasted or uploaded as .txt)
- **Google Slides** (presentations)
- **YouTube URLs** (for transcript-based analysis)

**Best format for Triangulate data: structured PDF reports or Google Docs.** NotebookLM performs best when sources have clear headings, structured data, and explicit relationships. Raw JSON is too noisy. CSV loses context. Well-structured Markdown converted to PDF or Google Doc is ideal.

### 2.2 Convergence Report Format

Triangulate generates a "Convergence Report" optimized for NotebookLM ingestion. This is a structured document (exportable as PDF or Google Doc) that contains everything NotebookLM needs to become an expert on the journalist's investigation.

```markdown
# Triangulate Convergence Report
## Generated: 2026-03-28 | Stories: 15 | Claims: 87 | Sources: 34

---

## Executive Summary

This report covers 15 stories analyzed by Triangulate between 2026-03-21 and
2026-03-28. Key findings:

- 4 stories reached CONVERGED status (adversarial sources agree)
- 2 stories are CONTESTED (sources disagree on key facts)
- 9 stories remain SINGLE_SOURCE or developing

The highest-convergence story is "US Tariff Plan Leaked" (0.82), confirmed
across 5 of 7 bias tiers and 3 regions.

---

## Story 1: US Tariff Plan Leaked Showing 25% EU Import Rates

**Trust Signal:** CONVERGED
**Convergence Score:** 0.82 (82%)
**Coverage:** 14 articles, 5 bias tiers, 3 regions (US, EUROPE, GLOBAL)

### Claims

#### Claim 1.1: Tariff rates set at 25% on EU imports
- **Convergence:** 0.91 (91%) — ESTABLISHED
- **Type:** FACTUAL
- **Supporting sources (5):**
  - Reuters (CENTER, GLOBAL) — "The leaked document specifies a 25% tariff..."
  - AP News (CENTER, GLOBAL) — "Sources confirmed rates of 25% on EU goods..."
  - Fox News (RIGHT, US) — "The tariff plan includes 25% on European imports..."
  - The Guardian (CENTER_LEFT, UK) — "Documents show 25% tariff rates..."
  - Al Jazeera (CENTER, MIDDLE_EAST) — "The proposed tariffs of 25%..."
- **Contradicting sources:** None
- **Bias spread:** FAR_LEFT to RIGHT (5 tiers)

#### Claim 1.2: Implementation date set for Q3 2026
- **Convergence:** 0.45 (45%) — DEVELOPING
- **Type:** FACTUAL
- **Supporting sources (2):**
  - Reuters (CENTER, GLOBAL) — "Implementation is planned for Q3..."
  - Fox News (RIGHT, US) — "The tariffs would take effect in the third quarter..."
- **Contradicting sources (1):**
  - Financial Times (CENTER_RIGHT, UK) — "No timeline has been confirmed..."
- **Bias spread:** CENTER to RIGHT (3 tiers)

### Framing Differences

- **Left-leaning outlets** frame as economic aggression against EU allies
- **Right-leaning outlets** frame as protecting American manufacturing
- **Wire services** report facts without framing
- **European outlets** emphasize retaliatory measures under discussion

### Primary Documents

1. [Leaked Trade Policy Memo](https://example.com/doc) — GOVERNMENT
2. [Congressional Budget Office Analysis](https://example.com/cbo) — GOVERNMENT_DATA

### Entities Mentioned

- **Robert Lighthizer** (mentioned in 8 articles)
- **European Commission** (mentioned in 11 articles)
- **World Trade Organization** (mentioned in 6 articles)

---

## Story 2: WHO Pandemic Treaty Draft Released
[... same structure ...]

---

## Source Reliability Summary

| Source | Bias Tier | Region | Claims Cited | Confirmation Rate |
|--------|-----------|--------|--------------|-------------------|
| Reuters | CENTER | GLOBAL | 45 | 92% |
| AP News | CENTER | GLOBAL | 38 | 89% |
| Fox News | RIGHT | US | 22 | 71% |
| The Guardian | CENTER_LEFT | UK | 30 | 84% |
| Al Jazeera | CENTER | MIDDLE_EAST | 18 | 78% |
| Breitbart | FAR_RIGHT | US | 8 | 43% |
| Jacobin | FAR_LEFT | US | 6 | 51% |

---

## Cross-Story Entity Map

Entities that appear in multiple stories during this period:

| Entity | Stories | Total Mentions | Story Titles |
|--------|---------|----------------|-------------|
| Robert Lighthizer | 3 | 23 | Tariff Plan, Trade Summit, WTO Dispute |
| European Commission | 4 | 31 | Tariff Plan, WHO Treaty, Climate Accord, Tech Regulation |
| WHO | 2 | 18 | WHO Treaty, Pandemic Preparedness |

---

## Convergence Patterns

### High-Agreement Claims (score >= 0.8)
1. Tariff rates set at 25% on EU imports (0.91)
2. WHO treaty draft includes pandemic response timelines (0.85)
3. [...]

### Active Disputes (CONTESTED claims)
1. Implementation date for tariffs (0.45) — Reuters vs. Financial Times
2. Sovereignty waiver clause scope (0.38) — split along US/non-US lines
3. [...]

### Emerging Claims (lifecycle = EMERGING, < 48 hours old)
1. EU preparing retaliatory tariff list (0.22, 3 sources)
2. [...]

---

## Methodology Note

Triangulate scores convergence based on ideological spread of confirming sources
(not volume). A claim confirmed by both Fox News (RIGHT) and The Guardian
(CENTER_LEFT) scores higher than one confirmed by five CENTER outlets. Cross-
regional agreement (e.g., US + European sources) adds additional weight. Scores
range from 0 (single source) to 1 (all bias tiers across multiple regions agree).

Trust signals: SINGLE_SOURCE (1 outlet), CONTESTED (sources disagree), CONVERGED
(adversarial agreement), SOURCE_BACKED (primary documents available),
INSTITUTIONALLY_VALIDATED (official action taken).
```

### 2.3 NotebookLM as Investigation Assistant

Once the convergence report is loaded as a source in NotebookLM, the journalist can ask:

**Fact verification questions:**
- "Which claims about the tariff plan have the highest convergence scores?"
- "Do any far-right and far-left sources agree on the tariff implementation date?"
- "What claims are still in EMERGING status and might need more sourcing?"

**Pattern detection questions:**
- "Which entities appear across multiple stories? What connects them?"
- "Are there claims where only US sources agree but European sources contradict?"
- "What is the average convergence score for FACTUAL vs EVALUATIVE claims?"

**Source analysis questions:**
- "Which sources have the highest confirmation rates this week?"
- "Compare Fox News and The Guardian's coverage of the tariff story — where do they agree and disagree?"
- "Which sources are contradicting the consensus on any claims?"

**Investigation questions:**
- "Summarize all CONVERGED claims about Robert Lighthizer in the last 30 days"
- "What contradictions exist between Reuters and Financial Times on trade policy?"
- "Generate a briefing document covering only the confirmed facts from these 15 stories"
- "What information gaps exist — what questions should I investigate next?"

**Temporal analysis:**
- "How has the convergence score on tariff claims changed over the past week?"
- "Which claims moved from EMERGING to ESTABLISHED fastest?"
- "Are there any claims that were CONVERGED but later became CONTESTED?"

### 2.4 NotebookLM Audio Overview

NotebookLM can generate an "Audio Overview" — a podcast-style conversation between two AI hosts discussing the sources. For Triangulate data, this creates:

- A verbal walkthrough of the highest-convergence stories
- Discussion of where sources agree and disagree
- Highlighting of surprising convergence (e.g., "Even outlets on opposite ends of the spectrum confirmed this")
- Questions raised by the data that the journalist might want to investigate

**Use case:** A journalist loads their weekly convergence report into NotebookLM, generates an Audio Overview, and listens during their commute. They arrive at work with a mental map of what the convergence engine found this week, which threads to pull, and which claims need more sourcing.

### 2.5 Multi-Report NotebookLM Notebooks

A power workflow: load multiple convergence reports spanning different time periods or topics into the same NotebookLM notebook. Now the journalist can ask cross-temporal and cross-topic questions:

- "How has coverage of Robert Lighthizer changed over the past 3 months?"
- "Are there entities that appeared in trade stories early and later appeared in healthcare stories?"
- "Which sources changed their position on tariffs between January and March?"
- "Generate a timeline of all CONVERGED claims about US trade policy"

This transforms NotebookLM from a document Q&A tool into a **longitudinal investigation assistant**.

---

## Part 3: Cross-Tool Workflow

### 3.1 The Complete Investigation Flow

```
 DISCOVER          INVESTIGATE           ANALYZE            PUBLISH
┌──────────┐      ┌──────────────┐      ┌───────────────┐  ┌──────────────┐
│Triangulate│ ──→  │  Obsidian    │ ──→  │  NotebookLM   │  │ Triangulate  │
│  Web UI   │      │  Vault       │      │  Notebook     │  │ Certificate  │
│           │      │              │      │               │  │              │
│ Browse    │      │ Pin stories  │      │ Load reports  │  │ Export cert  │
│ Filter    │      │ Draw links   │      │ Ask questions │  │ Cite sources │
│ Search    │      │ Add notes    │      │ Find patterns │  │ Share/embed  │
│ Pin items │      │ Canvas board │      │ Audio brief   │  │              │
└──────────┘      └──────────────┘      └───────────────┘  └──────────────┘
     │                   │                      │                  │
     │         Export     │        Export PDF     │     Return       │
     └──── .zip vault ───┘──── to NotebookLM ───┘── findings ─────┘
```

### 3.2 Step-by-Step Journalist Workflow

**Monday Morning: Discover**

1. Journalist opens Triangulate, sees the Wire (daily feed)
2. Notices a story with CONVERGED trust signal about pharmaceutical pricing
3. Opens the Lens (detail view), reads claims, sees 3 claims at 0.85+ convergence
4. Clicks "Pin to Investigation" on the story and its high-convergence claims
5. Notices an entity (PharmaCorp CEO) appearing in two other stories
6. Pins those stories too

**Monday Afternoon: Export and Investigate**

7. Opens Export Dialog, selects "Obsidian Vault Pack"
8. Triangulate generates .zip with:
   - 3 story notes (with all claims, sources, primary docs)
   - 12 claim notes (from the 3 stories)
   - 8 source profiles (all sources covering these stories)
   - 4 entity notes (people/orgs mentioned across stories)
   - 1 investigation canvas (pre-arranged board)
   - 1 structure note (MOC linking everything)
   - 1 convergence report PDF (for NotebookLM)
9. Downloads .zip, opens in Obsidian
10. Opens graph view — immediately sees the three stories connected through shared entities
11. Opens canvas — sees the investigation board pre-laid-out
12. Adds sticky notes: "Why did PharmaCorp CEO meet with FDA commissioner the day before this story broke?"
13. Draws a manual connection between two entities she noticed are co-mentioned
14. Runs Dataview query: "Show me all CONTESTED claims where PharmaCorp is mentioned"

**Tuesday: AI-Assisted Analysis**

15. Opens NotebookLM, creates new notebook "Pharma Pricing Investigation"
16. Uploads the convergence report PDF from the export
17. Also uploads 2 primary documents Triangulate identified (FDA filing, earnings transcript)
18. Asks NotebookLM:
    - "What are the strongest converged facts about PharmaCorp's pricing?"
    - "Where do left-leaning and right-leaning sources disagree?"
    - "What questions should I investigate based on the gaps in convergence?"
19. NotebookLM identifies a pattern: the earnings transcript contradicts a claim that only CENTER sources are reporting — this might be a lead
20. Generates an Audio Overview to share with her editor

**Wednesday: Publish Findings**

21. Returns to Triangulate with specific claims to verify
22. Runs on-demand search for the lead NotebookLM identified
23. Exports a Convergence Certificate for the key verified claims
24. Writes her article citing Triangulate convergence data
25. Embeds the certificate in her publication

### 3.3 Export Format Matrix

| Export Type | Format | Destination | Contents | Tier |
|-------------|--------|-------------|----------|------|
| Obsidian Vault Pack | `.zip` of `.md` + `.canvas` + `.json` | Obsidian | Stories, claims, sources, entities, canvas, structure notes | PREMIUM |
| NotebookLM Report | PDF or Google Doc | NotebookLM | Convergence report with all stories, claims, sources | PREMIUM |
| Raw Data Export | JSON | Any tool | Full data with schema envelope | PREMIUM |
| Claim CSV | CSV | Spreadsheets | Flat claim data with sources | STANDARD |
| Convergence Certificate | PDF | Publication/embed | Single-story proof of convergence | STANDARD |

---

## Part 4: API Endpoints

### 4.1 New Export Endpoints

These endpoints generate the export formats described above.

#### `POST /api/export/obsidian`

Generates an Obsidian vault pack from a set of pinned items.

**Request:**
```typescript
interface ObsidianExportRequest {
  storyIds: string[];           // Stories to include
  claimIds?: string[];          // Additional claims (beyond those in stories)
  entityNames?: string[];       // Entities to create notes for
  includeCanvas: boolean;       // Generate .canvas file
  includeStructureNotes: boolean;
  includeTimeline: boolean;
  includeConvergenceReport: boolean;  // Also generate the PDF report
  depth: 'shallow' | 'full';   // shallow = just pinned items, full = transitive closure
}
```

**Response:** Binary `.zip` file download

**Logic:**
1. Fetch all stories with their claims, claimSources, articles, sources, primaryDocs
2. If depth = 'full', also fetch all entities mentioned, related stories sharing entities
3. Generate Markdown notes with frontmatter for each item
4. Generate link structure (wikilinks between notes)
5. Generate canvas JSON if requested
6. Generate structure note (MOC) if requested
7. Generate daily timeline notes if requested
8. Package as .zip with correct folder structure
9. If includeConvergenceReport, also run the report generator and include the PDF

#### `POST /api/export/notebooklm`

Generates a convergence report optimized for NotebookLM.

**Request:**
```typescript
interface NotebookLMExportRequest {
  storyIds: string[];
  format: 'pdf' | 'markdown' | 'google-doc';  // google-doc requires OAuth
  includeSourceReliability: boolean;
  includeEntityMap: boolean;
  includeMethodologyNote: boolean;
  dateRange?: { start: string; end: string };
}
```

**Response:** PDF binary, Markdown text, or Google Doc URL

#### `POST /api/export/investigation`

Generates a combined export for both tools.

**Request:**
```typescript
interface InvestigationExportRequest {
  name: string;                 // Investigation name
  storyIds: string[];
  obsidian: boolean;
  notebooklm: boolean;
  format: 'zip';               // Always zip for combined
}
```

**Response:** `.zip` containing both the vault folder and the convergence report PDF

### 4.2 Pin/Queue Endpoints

For building the export queue before downloading.

#### `POST /api/workspace/pins`

```typescript
interface PinRequest {
  type: 'story' | 'claim' | 'source' | 'entity';
  id: string;
  investigationId?: string;    // Group pins by investigation
}
```

#### `GET /api/workspace/pins`

Returns all pinned items for the current user, grouped by investigation.

#### `DELETE /api/workspace/pins/:id`

Remove a pin.

### 4.3 Entity Extraction Endpoint (New)

Entities are currently not a first-class model in the database. For the knowledge graph to work, Triangulate needs entity extraction.

#### `GET /api/entities?storyIds=abc,def`

Extracts entities from the specified stories using Claude.

```typescript
interface EntityExtractionResponse {
  entities: {
    name: string;
    type: 'person' | 'organization' | 'place' | 'event';
    mentions: {
      storyId: string;
      claimIds: string[];
      articleIds: string[];
      context: string;        // Brief description of role in story
    }[];
    totalMentions: number;
    coAppearsWith: string[];  // Other entity names frequently co-mentioned
  }[];
}
```

---

## Part 5: Implementation Sequence

### Phase 1: Export Foundation (Chunk 14, ~3 days)

1. Add `obsidian-export` and `notebooklm-export` capabilities to the gating system
2. Create `app/lib/export/obsidian.ts` — Markdown generation with frontmatter
3. Create `app/lib/export/notebooklm-report.ts` — structured report generation
4. Create `app/lib/export/vault-pack.ts` — zip packaging
5. Create `app/routes/api.export.obsidian.ts`
6. Create `app/routes/api.export.notebooklm.ts`
7. Add "Obsidian" and "NotebookLM Report" options to ExportDialog
8. Test with real story data from the database

### Phase 2: Investigation Pinning (Chunk 15, ~2 days)

1. Add `Investigation` model to Prisma schema (or extend Workspace JSON)
2. Create pin/unpin UI in the Lens panel (small pin icon on stories and claims)
3. Create investigation queue view (sidebar section or dedicated page)
4. Wire pins to export flow

### Phase 3: Entity Extraction (Chunk 16, ~2 days)

1. Add entity extraction to the analysis pipeline (extend `/api/analyze`)
2. Create `Entity` and `EntityMention` models (or derive from claim text via Claude)
3. Generate entity notes and cross-story entity maps in exports
4. Add entity connections to Canvas generation

### Phase 4: Canvas Generation (Chunk 17, ~2 days)

1. Create `app/lib/export/canvas.ts` — Obsidian Canvas JSON builder
2. Implement auto-layout algorithm (force-directed or hierarchical)
3. Generate edge labels from claim relationships
4. Include CSS snippet for graph styling in vault pack

### Phase 5: Obsidian Plugin (Post-Launch)

1. Scaffold Obsidian plugin project (`obsidian-triangulate`)
2. Implement API key authentication
3. Implement polling sync for pinned items
4. Implement "My Notes" preservation during sync
5. Submit to Obsidian community plugins

---

## Appendix A: File Naming Conventions

| Note Type | Naming Pattern | Example |
|-----------|---------------|---------|
| Story | `{date} — {title}.md` | `2026-03-28 — US Tariff Plan Leaked.md` |
| Claim | `{claim text (truncated to 80 chars)}.md` | `Tariff rates set at 25% on EU imports.md` |
| Source | `{source name}.md` | `Reuters.md` |
| Entity (person) | `{full name}.md` | `Robert Lighthizer.md` |
| Entity (org) | `{org name}.md` | `World Health Organization.md` |
| Entity (place) | `{place name}.md` | `Brussels.md` |
| Timeline | `{date}.md` | `2026-03-28.md` |
| Structure note | `MOC — {topic}.md` | `MOC — US Trade Policy.md` |
| Investigation | `{user-defined name}.md` | `My Tariff Investigation.md` |
| Canvas | `{investigation name}.canvas` | `My Tariff Investigation.canvas` |
| Convergence report | `{date} — {title or 'Daily Briefing'}.md` | `2026-03-28 — Daily Briefing.md` |

File names are sanitized: colons, slashes, pipes, and quotes are removed. Periods other than the extension dot are replaced with hyphens.

## Appendix B: Capability Gating Updates

```typescript
// New capabilities to add to capabilities.ts
export type Capability =
  | /* ...existing... */
  | "obsidian-export"
  | "notebooklm-export"
  | "investigation-pins"
  | "entity-graph";

// STANDARD gets: investigation-pins (pin up to 10 items)
// PREMIUM gets: obsidian-export, notebooklm-export, investigation-pins (unlimited), entity-graph
```

## Appendix C: Triangulate Data-to-Zettelkasten Mapping

| Triangulate Concept | Zettelkasten Analogue | Note |
|---------------------|----------------------|------|
| Story | Literature note | Summarizes a "source" (the event cluster) |
| Claim | Atomic note | One idea, one assertion, fully self-contained |
| Source profile | Reference note | Metadata about an information source |
| Entity | Index note | Person/org/place that links across stories |
| Structure note (MOC) | Structure note | Map of a topic area |
| Investigation | Project note | User's working synthesis |
| Convergence report | Briefing note | Periodic summary for review |
| Canvas | Visual MOC | Spatial arrangement of the network |
| Claim lifecycle | Note maturity | EMERGING = fleeting, ESTABLISHED = evergreen |

The Zettelkasten principle of atomic notes maps perfectly to Triangulate's claim extraction. Each claim IS an atomic note — one assertion, self-contained, with explicit links to its sources and related claims. The convergence score acts as a "confidence" metadata field that traditional Zettelkasten systems lack. The bias tier spread adds a dimension of epistemological provenance that makes the knowledge graph uniquely valuable for investigative work.
