# Context.md — Triangulate

## Current goal
Ship Chunk 1 (project setup and folder structure) and verify it runs on localhost:3000.

## Last 3 decisions
1. Full political spectrum including fringe outlets (FAR_LEFT through FAR_RIGHT) — because transparency builds trust better than curation does
2. BiasTier enum added alongside BiasCategory — 7-point scale for convergence weighting, 5-point for display grouping in convergence panel
3. Fringe-only convergence capped at 0.2 — echo chambers on the edges shouldn't produce false convergence signals

## Current failure / blocker
PC has Windows temporary profile issue (user profile corruption after update). Registry .bak fix attempted but didn't resolve. Need to try DISM repair or new admin account with file copy. Development blocked on desktop until resolved. Mobile (Pixel + Bluetooth keyboard + GitHub Codespaces) is the fallback dev environment.

## Key file paths
- `/spec/Spec.md`: Full product specification (this doc)
- `/scenarios/Scenario.md`: Holdout test scenarios (keep away from builder model)
- `/src/app/page.tsx`: Homepage / Daily Feed
- `/src/app/story/[id]/page.tsx`: Story View page
- `/src/app/api/ingest/route.ts`: RSS ingestion endpoint
- `/src/app/api/cluster/route.ts`: Story clustering endpoint
- `/src/app/api/analyze/route.ts`: Claim extraction + convergence scoring
- `/src/app/api/search/route.ts`: Search & Triangulate endpoint
- `/src/lib/convergence.ts`: Convergence scoring algorithm
- `/src/lib/clustering.ts`: Story clustering logic
- `/src/lib/signals.ts`: Trust signal calculation
- `/src/types/index.ts`: All TypeScript type definitions
- `/prisma/schema.prisma`: Database schema

## Chunk status
- [x] Chunk 1: Project setup & folder structure (files generated, needs npm install + test on PC)
- [ ] Chunk 2: Database schema & source seeding
- [ ] Chunk 3: RSS ingestion pipeline
- [ ] Chunk 4: Story clustering engine
- [ ] Chunk 5: Claim extraction & convergence scoring
- [ ] Chunk 6: Daily Feed UI
- [ ] Chunk 7: Story View UI
- [ ] Chunk 8: Search & Triangulate feature
- [ ] Chunk 9: Auth, Stripe & subscription tiers
- [ ] Chunk 10: Deploy, polish & launch

## Commands to reproduce
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- DB migrate: `npx prisma migrate dev --name init`
- DB seed: `npx prisma db seed`
- DB studio: `npx prisma studio`

## Source database (30+ outlets, 7-tier spectrum)

| BiasTier | Outlets | Count |
|----------|---------|-------|
| FAR_LEFT | AlterNet, Jacobin, The Intercept, Democracy Now! | 4 |
| LEFT | MSNBC, The Guardian, Vox, HuffPost | 4 |
| CENTER_LEFT | NYT, Washington Post, CNN, NPR | 4 |
| CENTER | AP, Reuters, BBC, PBS, C-SPAN | 5 |
| CENTER_RIGHT | WSJ, The Economist, Forbes, The Hill | 4 |
| RIGHT | Fox News, Daily Wire, NY Post, National Review | 4 |
| FAR_RIGHT | Breitbart, Newsmax, Epoch Times, OANN, Gateway Pundit | 5 |
| **Total** | | **30** |

## Revenue targets (conservative)
- Month 3: $1,340/mo (500 users)
- Month 6: $8,620/mo (2,000 users)
- Month 12: $39,600/mo (8,000 users) = ~$475K ARR
