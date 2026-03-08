# Triangulate — Chunk 1: Project Setup

## What's In This Package

The complete Chunk 1 project skeleton — 46 files including:

- Next.js 14 project with App Router and TypeScript
- Tailwind CSS configured with brand colors and custom fonts
- Full folder structure for all 10 chunks
- Working homepage with hero, "How It Works," and "What It Is/Isn't" sections
- Header with responsive mobile menu
- Footer with brand tagline
- All UI components (Badge, Button, Card, Skeleton)
- TrustSignalBadge component
- Type definitions for every entity
- Library helpers (Prisma, Claude API, Stripe, RSS, convergence, clustering, signals)
- Placeholder API routes for all endpoints
- Placeholder pages for Story View, Search, Pricing, Sign In
- Environment variable template
- Vercel cron job configuration
- .gitignore ready to go

## Setup Instructions

### Step 1: Extract the project

```bash
tar -xzf triangulate-chunk1.tar.gz
cd triangulate
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Run the development server

```bash
npm run dev
```

### Step 4: Open in browser

Go to http://localhost:3000

You should see the Triangulate homepage with:
- "TRIANGULATE" header with navigation
- Founder Member badge
- "See where the sources agree." hero headline
- Trust signal badges
- "How It Works" section
- Placeholder daily feed cards
- "What It Is / What It Isn't" section
- Footer

### Step 5: Initialize git and push to GitHub

```bash
git init
git add .
git commit -m "Chunk 1: Project setup and folder structure"

# Create a repo on GitHub called "triangulate", then:
git remote add origin https://github.com/YOUR_USERNAME/triangulate.git
git branch -M main
git push -u origin main
```

## What's Next

**Chunk 2: Database Schema & Source Seeding**
- Set up PostgreSQL (recommend Neon.tech — free tier)
- Create Prisma schema with all data models
- Seed database with 20 news outlets and their RSS feeds

Use the Chunk 2 prompt from your Build Prompt document.

## Notes

- The `.env.local` file has placeholder values — you'll fill these in as you build each chunk
- All placeholder components say which chunk they'll be built in
- API routes return JSON status messages confirming they're ready for implementation
- The homepage is fully designed and functional — not a placeholder
