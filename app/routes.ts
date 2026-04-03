import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("story/:id", "routes/story.$id.tsx"),
  route("search", "routes/search.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("sources", "routes/sources.tsx"),
  route("sources/:id", "routes/sources.$id.tsx"),
  route("trends", "routes/trends.tsx"),
  route("how-it-works", "routes/how-it-works.tsx"),
  // Auth routes
  route("auth/signin", "routes/auth.signin.tsx"),
  route("auth/verify", "routes/auth.verify.tsx"),
  // API resource routes
  route("api/ingest", "routes/api.ingest.ts"),
  route("api/cluster", "routes/api.cluster.ts"),
  route("api/analyze", "routes/api.analyze.ts"),
  route("api/stories", "routes/api.stories.ts"),
  route("api/stories/:id", "routes/api.stories.$id.ts"),
  route("api/search", "routes/api.search.ts"),
  route("api/triangulate", "routes/api.triangulate.ts"),
  route("api/workspace", "routes/api.workspace.ts"),
  route("api/health", "routes/api.health.ts"),
  // Auth API routes
  route("api/auth/send-link", "routes/api.auth.send-link.ts"),
  route("api/auth/logout", "routes/api.auth.logout.ts"),
  // Stripe API routes
  route("api/stripe/checkout", "routes/api.stripe.checkout.ts"),
  route("api/stripe/webhook", "routes/api.stripe.webhook.ts"),
  // GCI API route
  route("api/gci", "routes/api.gci.ts"),
] satisfies RouteConfig;
