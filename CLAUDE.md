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
- **Chunks Complete:** 0-12 (all launch chunks). Only Chunk 13 (Deploy) remains.

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

- **Date:** 2026-04-02
- **What was accomplished:**
  - **Full BrainStormer health check:** quality audit, comprehension scan, governance drift fix, test gap fill
  - **ESLint installed and configured:** flat config with typescript-eslint, 0 errors (22 `any` warnings in AI/Stripe code — acceptable)
  - **BUG FIX: convergence countFactor** — `countFactor` in convergence.ts was computed but never applied to score. 2-source claims were scoring artificially high. Now: 2 sources = 0.7x, 3 = 0.85x, 4 = 0.95x, 5+ = 1.0x
  - **BUG FIX: checkout error display** — pricing.tsx had `setCheckoutError()` calls but never displayed the error to users. Added error banner.
  - **Dead code removed:** unused `rankClusters()` call in engine.ts (expensive computation with no consumer)
  - **Server import fix:** engine.ts and source-stats.ts imported from `./prisma` instead of `./prisma.server` — ticking time bomb for client bundle leaks
  - **15 unused variable/import warnings cleaned** across 7 route files
  - **28 new tests written:** entities (15), convergence countFactor (2), comparisons edge cases (5), ingest classifyUrl (6)
  - **Prior session pipeline upgrades committed** (were left uncommitted from 2026-03-30)
  - **Eval harness:** 5/5 green (install, build, lint, typecheck, tests)
- **Tests:** 118/118 passing across 11 test files, 0 TypeScript errors, 0 lint errors
- **Next session should start with:**
  - Process governance drift agent and assumption audit agent results (if completed)
  - Begin Chunk 13 (Deploy) or Phase 5A of Journalist Pro (Evidence Package Export)
  - Verify RSS feeds for newly added sources (some marked isActive: false)

### What Works Right Now

- **Framework:** React Router v7 (Remix) + Vite 7 + Tailwind v4
- **Database:** Neon PostgreSQL, 11 models, 12 enums, v2 migration applied
- **Sources:** 76 outlets across 7 bias tiers and 9 global regions (incl. Latin America, Africa)
- **Pipeline:** /api/ingest → /api/cluster → /api/analyze → /api/gci + source stats
- **AI:** Multi-provider system (Claude primary, Gemini/DeepSeek/Grok available)
- **App Shell:** TopBar + CommandPalette (Ctrl+K), Sidebar, StatusBar (live health polling), BottomTabBar, AppShell, DashboardLayout
- **Filter System:** FilterProvider + URL codec, 7 filter types, SmartPresets, FilterSidebar, MobileFilterSheet
- **Wire (Feed):** StoryListRow, WirePanel (tier headers), WireSkeleton, TodaysSurprise
- **Lens (Story Detail):** LensPanel (4 tabs, dual data/fetcher mode), SpectrumPanel, ClaimsPanel, ConvergenceExplainer, PrimaryDocsPanel, DisagreementMap
- **Data Viz:** ConvergenceGauge, BiasSpectrumBar, RegionIndicator, ClaimMatrix, TimelineStrip, GCIGauge, GCITicker
- **Pro Tools:** CommandPalette (cmdk), Keyboard shortcuts (tinykeys), ShortcutOverlay, Workspace API, NotificationToast (sonner), DensityProvider, Export (CSV/JSON/Certificate)
- **Source Intelligence:** /sources directory, /sources/:id detail, monthly stats, /trends page, convergence narratives, disagreement classification, explainer popovers
- **Feature Gating:** capabilities.ts, Gate component, UpgradeTeaser, 16 capabilities across 3 tiers
- **State:** Zustand workspace store with localStorage persist + debounced server sync
- **A11y:** Skip links, aria-labels, aria-expanded, reduced-motion, forced-colors, F6 panel cycling
- **Auth:** Cookie sessions, magic link (branded email template), Founder detection
- **Payments:** Stripe checkout, webhook handler, 3-tier pricing page (refreshed)
- **Onboarding:** Progressive mastery tips, logged-out landing page, condensed hero
- **Search:** Redesigned results with convergence gauges, on-demand triangulation API
- **Pipeline Health:** /api/health endpoint, StatusBar polls every 60s
- **Testing:** 118 unit tests passing across 11 files, 0 TypeScript errors, ESLint configured (0 errors)
- **Linting:** ESLint + typescript-eslint flat config, CI-ready

### What's Broken Right Now

- Email sends only when RESEND_API_KEY is set (logs to console otherwise — by design for dev)
- Stripe price IDs need to be created in Stripe Dashboard and set as env vars
- **All migrations applied** including v2 pipeline upgrades (2026-03-31)

### What's Blocked

| Blocked Item | Waiting On | Since |
|-------------|-----------|-------|
| Live email sending | Resend/Mailgun account setup | 2026-03-15 |
| Stripe live payments | Stripe price IDs in env vars | 2026-03-15 |
| Multi-AI verification | Gemini/DeepSeek/Grok API keys | 2026-03-15 |

### Active Branch

- **Branch name:** main
- **Purpose:** All launch chunks complete (0-12). Only Chunk 13 (Deploy) remains.
- **Merge target:** N/A (working directly on main)

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
