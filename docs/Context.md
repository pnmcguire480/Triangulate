# CONTEXT.md — Background and Domain Knowledge

> **UPDATE FREQUENCY: SET ONCE, UPDATE AS NEEDED**
> This file captures the WHY behind the project — the background, domain knowledge, stakeholders, and motivation that don't fit in a spec or architecture doc. Write it once during planning. Update it when the context meaningfully changes.
>
> **Depends on:** Nothing — this is foundational context
> **Feeds into:** SPEC.md (user understanding), ARCHITECTURE.md (constraint awareness), ART.md (brand context)

---

## Why This Project Exists

Trust in media is at historic lows. People don't know what to believe. The current workaround — manually checking 3-5 outlets, comparing headlines, hunting for primary documents — is slow, exhausting, and most people don't bother. LLMs now make claim extraction and semantic comparison feasible at scale for the first time. Ground News proved product-market fit for cross-outlet coverage, but stops short of claim-level convergence analysis. Triangulate picks up where they leave off: not just "who covered it" but "where do enemies agree on the facts."

---

## Domain Background

### Key Concepts

| Term | Definition | Why It Matters |
|------|-----------|---------------|
| Convergence | When ideologically opposed outlets independently confirm the same factual claim | Core product value — this is what we measure |
| Bias Tier | 7-point political spectrum classification (FAR_LEFT → FAR_RIGHT) | Drives convergence weighting — cross-spectrum agreement scores higher |
| Trust Signal | Badge showing convergence level (Single Source → Institutionally Validated) | User-facing indicator of claim reliability |
| Claim Extraction | AI-powered identification of factual assertions within articles | Enables comparison across outlets at claim level, not just story level |
| Content Type | Classification of article as REPORTING, COMMENTARY, or UNKNOWN | Separates facts from opinions in the analysis |
| Primary Source | Original document (court filing, legislation, transcript) referenced by articles | Highest form of corroboration — the source behind the sources |

### Domain Rules

- Convergence is measured by ideological spread, not count. 3 LEFT outlets agreeing = weak. 1 LEFT + 1 RIGHT = strong.
- Fringe-only claims (only FAR_LEFT or FAR_RIGHT sources) are capped at 0.2 convergence regardless of count.
- CENTER sources always get a +0.3 bonus (wire services and public broadcasters are stabilizing anchors).
- We never render editorial judgments. Trust signals reflect data, not opinions.
- All outlets are displayed, including fringe. We illuminate, we don't censor.

### Common Misconceptions

- "More sources = more trustworthy" — wrong. Same-side echo chambers can have many sources confirming each other. Ideological spread matters.
- "Bias labels are judgments" — they're internal weights for convergence math, not displayed as verdicts to users.
- "Fringe outlets shouldn't be included" — excluding them creates blind spots. Users should see the full landscape.

---

## Stakeholders

| Person / Group | Role | Interest | Influence | Contact |
|---------------|------|----------|-----------|---------|
| Patrick McGuire | Founder, sole developer | Product vision, all decisions | Full | Owner |

### Decision Authority

- **Product decisions:** Patrick
- **Technical decisions:** Patrick (with AI agent recommendations)
- **Design decisions:** Patrick
- **Budget decisions:** Patrick
- **Launch decisions:** Patrick

---

## Constraints

### Technical Constraints

- **Hardware:** Desktop PC (primary), Pixel phone + Bluetooth keyboard (mobile dev via GitHub Codespaces)
- **Budget:** Claude API capped at $200/month. Neon free tier. Vercel free/hobby tier.
- **Timeline:** Ship MVP as fast as possible, iterate based on beta feedback
- **Hosting limitations:** Vercel serverless function timeout (10s hobby, 60s pro)
- **API rate limits:** Claude API rate limits, RSS feed polling etiquette (15-min intervals)
- **Browser/device requirements:** Modern browsers, mobile-responsive web

### Human Constraints

- **Team size:** 1 person (Patrick) + AI agents
- **Available hours per week:** Variable
- **Skill gaps:** Solo developer leveraging AI for speed
- **Timezone / availability:** Flexible

### External Constraints

- **Legal / regulatory:** Fair use question on displaying titles/claims from paywalled sources (Q4 in Spec)
- **Accessibility requirements:** WCAG 2.2 AA minimum (AAA where practical)
- **Competitive pressure:** Ground News growing; first-mover advantage on convergence analysis
- **Dependency on third parties:** Claude API (Anthropic), Neon (database), Stripe (payments), RSS feed availability

---

## Prior Art and Research

### Existing Solutions

| Solution | What's Good | What's Bad | Why Not Just Use This |
|----------|------------|-----------|----------------------|
| Ground News | Bias ratings, spectrum visualization | No claim-level analysis, no convergence scoring | Stops at coverage breadth |
| AllSides | Clear left/center/right labels | Static ratings, not real-time | Not a convergence product |
| Ad Fontes Media | Comprehensive bias chart | Not a consumer product | Reference only, no feed/analysis |

### Previous Attempts

- This is the first build. Concept has been validated through manual claim comparison on political stories.

---

## Values and Principles

- **Transparency over curation:** Show everything. Let users evaluate.
- **Convergence over consensus:** We measure where enemies agree, not where everyone agrees.
- **Data over opinions:** Trust signals reflect measurement, not editorial judgment.
- **Fringe inclusion:** Excluding sources creates blind spots. We illuminate the full spectrum.
- **Price fairness:** Founder Members are free for life. Subscribers keep their price forever.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Claude API costs exceed budget | Medium | High | Use Haiku for volume tasks, Sonnet for accuracy. Monitor monthly. |
| RSS feeds break or change format | High | Medium | Error isolation per feed. Monitor feed health. |
| Legal challenge on fair use | Low | High | Legal review before public launch. Display titles + claims, not full articles. |
| Poor clustering quality | Medium | High | Tunable thresholds. Manual spot-checks. Ability to unlink articles. |
| Low user adoption | Medium | High | Founder Member program for early traction. Product-market fit proven by Ground News adjacency. |

---

## Project State

### Current Goal
Build the command center redesign per docs/ROADMAP-TO-LAUNCH.md. Original 10-chunk plan is complete (MVP functional). Now executing 13-chunk command center roadmap for launch.

### Chunk Status
- [x] Chunk 1: Project setup & folder structure
- [x] Chunk 2: Database schema & source seeding
- [x] Chunk 3: RSS ingestion pipeline
- [x] Chunk 4: Story clustering engine
- [x] Chunk 5: Claim extraction & convergence scoring
- [x] Chunk 6: Daily Feed UI
- [x] Chunk 7: Story View UI
- [x] Chunk 8: Search & Triangulate feature
- [x] Chunk 9: Auth, Stripe & subscription tiers
- [x] Chunk 10: Deploy, polish & launch

> Original MVP chunks 1-10 are complete. The command center redesign (Chunks 0-13) is documented in docs/ROADMAP-TO-LAUNCH.md.

### Last 3 Decisions
1. Command center redesign — Bloomberg Terminal style with fixed panels, persistent filter sidebar, keyboard-first navigation (2026-03-25)
2. Global Convergence Index (GCI) as launch feature — single daily number for news truth (2026-03-25)
3. Knowledge graph tools for Journalist Pro — NotebookLM export, Obsidian vault export, Connection Map, persistent research workspace (2026-03-25)

### Chunk 2 Notes
- FAR_LEFT/FAR_RIGHT sources use biasCategory: RIGHT/LEFT (5-point display) and biasTier: FAR_LEFT/FAR_RIGHT (7-point convergence)
- RSS URLs for AlterNet, Democracy Now!, AP, Reuters need live verification before Chunk 3
- Upsert strategy in seed — safe to re-run without duplicating
- Affiliate URLs seeded for: NYT, WaPo, WSJ, Economist, Daily Wire, National Review, Epoch Times, Guardian

### Current Failure / Blocker
Vitest path alias issue (~/types not resolving). 5-min fix: add tsconfigPaths() to vitest.config.ts.

### Commands to Reproduce
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- DB migrate: `npx prisma migrate dev --name init`
- DB seed: `npx prisma db seed`
- DB studio: `npx prisma studio`

### Source Database (76 outlets, 7-tier spectrum, 10 regions — domain secured)

| Region | Count | Key Outlets |
|--------|-------|-------------|
| US | 30 | AlterNet → Gateway Pundit (full FAR_LEFT to FAR_RIGHT spectrum) |
| UK | 5 | The Guardian, BBC World, Telegraph, Sky News, Daily Mail |
| Europe | 6 | Der Spiegel, Deutsche Welle, France 24, EuroNews, Irish Times, The Local |
| Middle East | 4 | Al Jazeera, Al-Monitor, Times of Israel, Arab News |
| Asia-Pacific | 5 | SCMP, Japan Times, The Hindu, ABC News Australia, Channel News Asia |
| Canada | 3 | CBC News, Globe and Mail, National Post |
| Global | 2 | AFP, UN News |
| **Total** | **55+** | |

Bias tiers are calibrated relative to each region's own political center, not the US Overton window. Cross-region convergence (e.g. Al Jazeera + Fox News agree on a claim) is an exceptionally strong signal.

### Revenue Targets (Conservative)
- Month 3: $1,340/mo (500 users)
- Month 6: $8,620/mo (2,000 users)
- Month 12: $39,600/mo (8,000 users) = ~$475K ARR

---

## Glossary

| Term | Meaning in This Project |
|------|------------------------|
| Convergence | Cross-spectrum factual agreement measured by ideological spread |
| Trust Signal | Badge reflecting convergence level of a story's strongest claim |
| Bias Tier | 7-point internal classification for convergence weighting |
| Bias Category | 5-point display classification for convergence panel columns |
| Founder Member | Early user who gets free Standard access for life |
| Price Lock | Subscriber's rate never increases while subscription is active |
| Fringe Cap | Convergence score ceiling (0.2) for claims confirmed only by FAR_LEFT/FAR_RIGHT |
| GCI (Global Convergence Index) | Daily 0-100 score measuring overall news convergence |
| The Wire | Main story feed panel in the command center |
| The Lens | Story detail/analysis panel |
| The Dossier | Claims and sources panel (collapsible) |
| Convergence Certificate | Exportable proof document showing source agreement on claims |
| Connection Map | Knowledge graph visualization of story/claim/source relationships |
| The Data Base | Journalist Pro persistent research workspace |

---

## Notes

- Chunk 3 starting point: rss-parser, ContentType classification via URL heuristics, dedup by URL, error isolation, CRON_SECRET protection
- Key file paths documented in CLAUDE.md file index
