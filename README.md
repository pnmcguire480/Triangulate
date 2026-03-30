# Triangulate

A global news convergence engine that shows where ideologically opposed outlets confirm the same facts.

## What It Does

Triangulate ingests 55+ news outlets across the political spectrum (FAR_LEFT to FAR_RIGHT) from 7 global regions. It clusters articles about the same event, extracts factual claims, and scores convergence based on ideological spread and cross-regional agreement. It shows users where adversarial sources agree on the facts.

## Tech Stack

- **Framework:** React Router v7 (Remix) + Vite 7
- **Language:** TypeScript 5.9
- **Database:** PostgreSQL with Prisma 6.3
- **CSS:** Tailwind CSS 4.1
- **AI:** Claude API (primary), Gemini/DeepSeek/Grok (Round Table verification)
- **Payments:** Stripe
- **Testing:** Vitest 4.1
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
| `npm run typecheck` | Type check |
| `npx prisma studio` | Database GUI |

## Pipeline

1. **Ingest** — Fetch articles from 55+ RSS feeds
2. **Cluster** — Group articles about the same event (entity-graph engine)
3. **Analyze** — Extract claims, calculate convergence, detect primary docs
4. **Serve** — Display with filtering, search, and visualization

## License

See [LICENSE](LICENSE).
