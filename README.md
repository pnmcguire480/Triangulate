# Triangulate

A global news convergence engine that shows where ideologically opposed outlets confirm the same facts.

## What It Does

Triangulate ingests 76+ news outlets across the political spectrum (FAR_LEFT to FAR_RIGHT) from 10 global regions (US, UK, Europe, Middle East, Asia-Pacific, Canada, Latin America, Africa, Oceania, Global). It clusters articles about the same event, extracts factual claims, and scores convergence based on ideological spread and cross-regional agreement. It shows users where adversarial sources agree on the facts — not what to think, but where the evidence converges.

## Tech Stack

- **Framework:** React Router v7 (Remix) + Vite 7
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL with Prisma 6.3
- **CSS:** Tailwind CSS 4.1
- **AI:** Claude API (primary), Gemini/DeepSeek/Grok (Round Table verification)
- **Payments:** Stripe
- **Testing:** Vitest 4.1 (156 tests across 13 suites)
- **Linting:** ESLint + typescript-eslint (flat config)
- **State:** Zustand + URL params (filters)

## Setup

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string (Neon recommended)
- `ANTHROPIC_API_KEY` — Claude API key
- `CRON_SECRET` — Secret for pipeline cron endpoints
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_PREMIUM_PRICE_ID` — Stripe price ID for Premium tier
- `STRIPE_JOURNALIST_PRICE_ID` — Stripe price ID for Journalist Pro tier
- `MAGIC_LINK_BASE_URL` — Base URL for magic link emails
- `SESSION_SECRET` — Session cookie secret

### Database

```bash
npx prisma migrate dev
npx prisma db seed
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type check |
| `npx prisma studio` | Database GUI |

## Pipeline

1. **Ingest** — Fetch articles from 76+ RSS feeds across 10 regions
2. **Cluster** — Group articles about the same event (entity-graph engine with TF-IDF weighting + union-find)
3. **Analyze** — Extract claims, deduplicate, calculate convergence, detect primary documents, classify disagreements
4. **GCI** — Compute Global Convergence Index across all active stories
5. **Serve** — Display with filtering, search, spectrum visualization, and export

## Architecture

- **Engine** — Pure-math clustering (no AI): entity extraction, TF-IDF weighting, inverted index, candidate pair scoring, union-find clustering, significance ranking
- **AI Analysis** — Multi-provider claim extraction and convergence scoring (Claude primary, Gemini/DeepSeek/Grok for Round Table verification)
- **Convergence** — Scores based on ideological spread and source count; bias tiers calibrated relative to each region's political center
- **Feature Gating** — 3 tiers (Free / Premium / Journalist Pro) with 16 capabilities gated via `capabilities.ts`

## Features

- Wire feed with tier headers, story clustering, and convergence gauges
- Story detail with spectrum panel, claims panel, convergence explainer, primary documents, and disagreement map
- Source intelligence directory with monthly stats and trends
- Command palette (Ctrl+K), keyboard shortcuts, workspace persistence
- Filter system with 7 filter types, smart presets, and URL codec
- CSV/JSON/Certificate export
- Cookie-based auth with magic link login
- Stripe checkout with webhook-driven tier upgrades
- Accessibility: skip links, ARIA, reduced-motion, forced-colors, F6 panel cycling

## License

See [LICENSE](LICENSE).
