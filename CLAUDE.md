# CLAUDE.md — Project Intelligence

> **UPDATE FREQUENCY: EVERY SESSION**
> This is the first file any AI agent reads when entering this project. Update it at the start and end of every working session. Stale information here cascades into bad decisions everywhere.
>
> **Related files:** All other docs reference this file as the entry point. See the file index at the bottom.

---

## Project Identity

- **Name:** Triangulate
- **One-Liner:** A global news convergence engine that shows where ideologically opposed outlets confirm the same facts.
- **Repo:** github.com/[username]/triangulate
- **Live URL:** TBD
- **Owner:** Patrick McGuire
- **Stage:** [ ] Concept [ ] Planning [ ] Scaffolding [x] Building [ ] Testing [ ] Deployed [ ] Iterating [ ] Maintained
- **Chunks Complete:** 1-5 (original) + Phase 1 UI/Auth/Payments/AI Round Table + 12-agent design audit + Roadmap Chunks 0-5 (Foundation, App Shell, Filters, Wire, Lens, DataViz)

---

## What This Is

Triangulate ingests 55+ news outlets across the political spectrum (FAR_LEFT → FAR_RIGHT) from 7 global regions (US, UK, Europe, Middle East, Asia-Pacific, Canada, Global wire services). It clusters articles about the same event, extracts factual claims, and scores convergence based on ideological spread and cross-regional agreement. It shows users where adversarial sources agree on the facts — not what to think, but where the evidence converges. Think of it as "where do enemies agree?" for news. Bias tiers are calibrated relative to each region's own political center.

---

## What This Is NOT

- Not a fact-checker — we never render editorial judgments
- Not a social platform — no comments, sharing, followers, or user-generated content
- Not a content moderator — all outlets are displayed, including fringe sources. We illuminate, we don't censor
- Not a single-region product — global engine with regional filtering

---

## Current State

### Last Session

- **Date:** 2026-03-25 (Session 3)
- **Duration:** ~1 extended session
- **Tier(s) Used:** Tier 4 (Claude Code — Opus 4.6, 1M context)
- **What was accomplished:**
  - **Chunk 0: Foundation & Fixes** — All 8 deps installed (cmdk, fuse.js, tinykeys, react-resizable-panels, sonner, zustand, @react-pdf/renderer, satori). Vitest already fixed. DailyGCI, Workspace, SourceMonthlyStats models added. Design tokens expanded (bias tiers, regions, layout dimensions, density modes, animation timing, reduced-motion, forced-colors). Type system expanded (FilterState, WorkspaceState, FacetCounts). Feature gating system (capabilities.ts, Gate, UpgradeTeaser). Zustand workspace store with localStorage persist + server sync. A11y foundation (skip links, aria-labels, aria-expanded).
  - **Chunk 1: App Shell** — TopBar (48px, Ctrl+K search, wordmark, tier badge). Sidebar (56/240px, collapsed default, 3px accent). StatusBar (28px, pipeline status, GCI, filter summary). AppShell (CSS Grid layout). BottomTabBar (56px mobile, 5 icons). PanelContainer (generic panel with tabs). PanelResizer (drag + keyboard). DashboardLayout (Wire|Lens|Dossier). usePanelFocus (F6 cycling). Root layout replaced (Header+Footer → AppShell).
  - **Chunk 2: Filter System** — FilterProvider + useFilterState + URL codec. BiasSpectrumSelector (7-segment). RegionFilter (colored pills). ConvergenceSlider (color-zoned range). TimeHorizon (segmented + custom dates). TopicCloud (weighted tags). SmartPresets (7 lenses). FilterChips (active pills + reset). FilterSidebar (320px persistent). MobileFilterSheet (bottom sheet + FAB).
  - **Chunk 3: The Wire** — StoryListRow (compact row, mini gauge, bias bar, source pills, j/k nav). WirePanel (tier headers, empty state). WireSkeleton. TodaysSurprise.
  - **Chunk 4: The Lens** — LensPanel (tabbed: Spectrum|Claims|Sources|Primary Docs). SpectrumPanel (7-column desktop, vertical mobile). ClaimsPanel (expandable, convergence meters, supports/contradicts). ConvergenceExplainer (show the math). PrimaryDocsPanel (doc type badges).
  - **Chunk 5: Data Visualization** — ConvergenceGauge (SVG arc, sm/md/lg). BiasSpectrumBar (3 modes). RegionIndicator (dots). ClaimMatrix (THE killer viz — truth table). TimelineStrip (SVG timeline). GCIGauge + GCITicker. GCI computation engine + /api/gci endpoint.
- **What broke or stalled:** Nothing. All 37 tests pass. No build errors.
- **Decisions made:** None new — all decisions were locked in Session 2.
- **Next session should start with:**
  1. **Prisma migration pending** — run `npx prisma migrate dev --name command-center-schema` when DB is available
  2. Follow `docs/ROADMAP-TO-LAUNCH.md` — execute Chunks 6-12 sequentially, commit after each:
     - **Chunk 6: Professional Tools** — Command Palette (cmdk, 6.1), Keyboard Shortcuts (tinykeys, 6.2), Workspace Persistence (/api/workspace, 6.3), Notifications (SSE+sonner, 6.4), Density Mode Toggle (6.5), Data Export (CSV/JSON/PDF + Convergence Certificates, 6.6)
     - **Chunk 7: Source Intelligence & Trends** — Sources directory page (7.1), Source detail page (7.2), Source monthly stats computation (7.3), Trends page (7.4), Convergence narratives engine (7.5), Disagreement map (7.6), "Why It Matters" explainer layer (7.7)
     - **Chunk 8: Auth, Payments & Tier Gating** — Wire Resend for magic links (needs `resend` package approval, 8.1), Stripe products (8.2), Gate enforcement throughout app (8.3), Free tier 5-story limit (8.4), Pricing page refresh (8.5)
     - **Chunk 9: Search & Triangulation** — Search page redesign (9.1), Search-as-filter (9.2), Full-text search upgrade (TSVECTOR, 9.3), On-demand triangulation (9.4)
     - **Chunk 10: Onboarding & Behavioral** — First visit discovery state (10.1), Progressive mastery hints (10.2), Contextual filter teaching (10.3), Landing page logged-out rewrite (10.4), Comparative story cards (10.5)
     - **Chunk 11: Pipeline & Data** — Seed DB (11.1), Run full pipeline (11.2), GCI cron (11.3), Source stats cron (11.4), Pipeline health /api/health (11.5)
     - **Chunk 12: Testing & QA** — Unit tests (12.1), Component tests (12.2), Integration tests (12.3), A11y audit (12.4), Mobile testing (12.5), Performance baseline (12.6)
  3. Chunk 13 (Deploy) is for when the human is ready to push to production
  4. **NOTE:** home.tsx still uses old FeedDashboard — needs rewrite to use WirePanel + FilterSidebar + DashboardLayout (part of integrating the new shell)
  5. **NOTE:** story.$id.tsx still uses old ConvergencePanel/ClaimsTracker — needs rewrite to use LensPanel

### What Works Right Now

- **Framework:** React Router v7 (Remix) + Vite 7 + Tailwind v4
- **Database:** Neon PostgreSQL, 11 models (8 original + DailyGCI, Workspace, SourceMonthlyStats), 10 enums, 3 migrations applied
- **Sources:** 55 outlets across 7 bias tiers and 7 global regions
- **Pipeline:** /api/ingest → /api/cluster → /api/analyze → /api/gci (all working)
- **AI:** Multi-provider system (Claude primary, Gemini/DeepSeek/Grok available)
- **App Shell:** TopBar (48px, Ctrl+K search), Sidebar (56/240px collapsed), StatusBar (28px), BottomTabBar (56px mobile), AppShell (CSS Grid), DashboardLayout (Wire|Lens|Dossier)
- **Filter System:** FilterProvider + URL codec, BiasSpectrumSelector (7-segment), RegionFilter, ConvergenceSlider, TimeHorizon, TopicCloud, SmartPresets (7 lenses), FilterChips, FilterSidebar (320px), MobileFilterSheet
- **Wire (Feed):** StoryListRow (compact, mini gauge, bias bar, j/k nav), WirePanel (tier headers), WireSkeleton, TodaysSurprise
- **Lens (Story Detail):** LensPanel (4 tabs), SpectrumPanel (7-column), ClaimsPanel (convergence meters, supports/contradicts), ConvergenceExplainer, PrimaryDocsPanel
- **Data Viz:** ConvergenceGauge (SVG arc, 3 sizes), BiasSpectrumBar (3 modes), RegionIndicator, ClaimMatrix (truth table), TimelineStrip, GCIGauge, GCITicker, GCI computation
- **Feature Gating:** capabilities.ts, Gate component, UpgradeTeaser, tier→capability map
- **State:** Zustand workspace store with localStorage persist + debounced server sync
- **A11y:** Skip links, aria-labels, aria-expanded, reduced-motion, forced-colors, F6 panel cycling
- **Auth:** Cookie sessions, magic link, Founder detection, session-aware TopBar
- **Payments:** Stripe checkout, webhook handler, 3-tier pricing page
- **Testing:** 37 unit tests passing (convergence scoring, trust signals)
- **New deps installed:** cmdk, fuse.js, tinykeys, react-resizable-panels, sonner, zustand, @react-pdf/renderer, satori

### What's Broken Right Now

- Email sending for magic links is stubbed (logs to console in dev)
- Stripe price IDs need to be created in Stripe Dashboard and set as env vars
- **Prisma migration not yet run** for DailyGCI, Workspace, SourceMonthlyStats models (schema updated, migration pending)

### What's Blocked

| Blocked Item | Waiting On | Since |
|-------------|-----------|-------|
| Live email sending | Resend/Mailgun account setup | 2026-03-15 |
| Stripe live payments | Stripe price IDs in env vars | 2026-03-15 |
| Multi-AI verification | Gemini/DeepSeek/Grok API keys | 2026-03-15 |

### Active Branch

- **Branch name:** feat/remix-migration
- **Purpose:** Phase 1 build (UI, auth, payments, AI Round Table)
- **Merge target:** main

---

## AI Agent Rules

These rules apply to ALL AI agents at ALL tiers working on this project.

### Must Do

1. **Read this file first.** Every session. No exceptions.
2. **Match existing patterns.** Look at the codebase before writing new code. Follow what's already there.
3. **Small changes, frequent commits.** Don't rewrite the world in one pass.
4. **Update this file** at the end of every session — at minimum, the "Last Session" section.
5. **Check CODEGUIDE.md** before writing code for naming conventions, file structure, and style rules.
6. **Respect tier boundaries.** See AGENTS.md. If the task is above your tier, escalate.

### Must Not

1. **Never read SNIFFTEST.md.** That file is for human testing only. Coding to the test defeats the purpose.
2. **Never hallucinate dependencies.** If a package isn't in package.json, don't assume it's installed.
3. **Never refactor without permission.** Ask before restructuring files, renaming things, or changing patterns.
4. **Never remove comments or TODOs** unless explicitly instructed.
5. **Never install new dependencies** without the human's approval.
6. **Never delete files** without the human's approval.
7. **Never modify CLAUDE.md's rules section, AGENTS.md, or SNIFFTEST.md** without the human's approval.

### When Uncertain

- **Stop and ask.** A question is always better than a wrong assumption.
- **Present options.** Don't make unilateral decisions on things with tradeoffs.
- **Escalate to the next tier** if the task exceeds your capability or scope.

---

## Context Window Management

### Always Load (Every Session)

- CLAUDE.md (this file)
- docs/Spec.md (know what you're building)
- docs/CodeGuide.md (know how to write code here)

### Load When Relevant

- docs/TechArchitecture.md (when making tech decisions or touching infrastructure)
- docs/Agents.md (when unclear about role boundaries)
- docs/ArtDirection.md (when building UI components)
- docs/Scenarios.md (when implementing user-facing flows)
- docs/Context.md (when you need background on why something exists)

### Never Load

- docs/SniffTest.md (human eyes only — always)
- node_modules/, .next/, build/, dist/ (generated directories)
- .env files (sensitive data)

---

## Session Handoff Protocol

When ending a session (regardless of tier):

1. Update "Last Session" above with what happened
2. Note any open questions or unresolved decisions
3. If mid-feature, describe exact stopping point and next steps
4. If a bug was introduced, describe it in "What's Broken"
5. Commit changes with a descriptive message

When starting a session (regardless of tier):

1. Read this file completely
2. Check the "Last Session" section for continuity
3. Read any files listed in "Always Load"
4. Confirm understanding before writing code
5. If anything is unclear, ask before proceeding

---

## Key Commands

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- DB migrate: `npx prisma migrate dev`
- DB seed: `npx prisma db seed`
- DB studio: `npx prisma studio`

---

## File Index

| File | What It Covers | When to Reference |
|------|---------------|-------------------|
| **CLAUDE.md** | Project state, AI rules, session handoffs | Every session (you're here) |
| **docs/Spec.md** | User stories, features, acceptance criteria | Before building any feature |
| **docs/Scenarios.md** | User flows, journeys, edge cases | When implementing UX flows |
| **docs/TechArchitecture.md** | Tech stack, data model, APIs, deploy pipeline | Technical decisions |
| **docs/Agents.md** | Tier assignments, escalation, handoff rules | Role clarity |
| **docs/CodeGuide.md** | Naming, style, file structure, git workflow | Before writing any code |
| **docs/ArtDirection.md** | Colors, typography, layout, component styles | Building any UI |
| **docs/Context.md** | Why this exists, domain knowledge, stakeholders | Background and motivation |
| **docs/SniffTest.md** | Human-only test scenarios | NEVER (AI agents) |
| **README.md** | Public project overview | External communication |

## CodeGlass Integration

Before coding: read all rules from `c:\Dev\Anthropicer\rules\`
After coding: write a walkthrough to `c:\Dev\Anthropicer\walkthroughs\Triangulate\`
Reference: `c:\Dev\Anthropicer\CLAUDE.md` for full instructions

### Before Every Coding Task

1. **Read the rules.** Scan `c:\Dev\Anthropicer\rules\` for all rule files. Follow every rule. If a rule conflicts, mention it.
2. **Check project context.** Read `c:\Dev\Anthropicer\projects\Triangulate.md` for architecture notes.
3. **Check prior walkthroughs.** Search `c:\Dev\Anthropicer\walkthroughs\Triangulate\` for prior walkthroughs.

### After Every Coding Task

1. **Run the eval harness** if available.
2. **Write a walkthrough** to `c:\Dev\Anthropicer\walkthroughs\Triangulate\{date}-{task-slug}.md`
3. **Propose rules** if something broke or revealed a new pattern.
