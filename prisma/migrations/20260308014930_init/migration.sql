-- CreateEnum
CREATE TYPE "BiasCategory" AS ENUM ('LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT');

-- CreateEnum
CREATE TYPE "BiasTier" AS ENUM ('FAR_LEFT', 'LEFT', 'CENTER_LEFT', 'CENTER', 'CENTER_RIGHT', 'RIGHT', 'FAR_RIGHT');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('REPORTING', 'COMMENTARY', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TrustSignal" AS ENUM ('SINGLE_SOURCE', 'CONTESTED', 'CONVERGED', 'SOURCE_BACKED', 'INSTITUTIONALLY_VALIDATED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('FACTUAL', 'EVALUATIVE');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('COURT_FILING', 'LEGISLATION', 'OFFICIAL_STATEMENT', 'GOVERNMENT_DATA', 'TRANSCRIPT', 'RESEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "rssFeedUrl" TEXT NOT NULL,
    "biasCategory" "BiasCategory" NOT NULL,
    "biasTier" "BiasTier" NOT NULL,
    "affiliateUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "generatedTitle" TEXT NOT NULL,
    "summary" TEXT,
    "trustSignal" "TrustSignal" NOT NULL DEFAULT 'SINGLE_SOURCE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalyzedAt" TIMESTAMP(3),

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "contentType" "ContentType" NOT NULL DEFAULT 'UNKNOWN',
    "rawText" TEXT,
    "storyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "claimText" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL DEFAULT 'FACTUAL',
    "convergenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_sources" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "quote" TEXT,
    "supports" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "claim_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "primary_docs" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "primary_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tier" "UserTier" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "priceLocked" DOUBLE PRECISION,
    "isFounder" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sources_url_key" ON "sources"("url");

-- CreateIndex
CREATE UNIQUE INDEX "articles_url_key" ON "articles"("url");

-- CreateIndex
CREATE INDEX "articles_sourceId_idx" ON "articles"("sourceId");

-- CreateIndex
CREATE INDEX "articles_storyId_idx" ON "articles"("storyId");

-- CreateIndex
CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt");

-- CreateIndex
CREATE INDEX "claims_storyId_idx" ON "claims"("storyId");

-- CreateIndex
CREATE INDEX "claim_sources_claimId_idx" ON "claim_sources"("claimId");

-- CreateIndex
CREATE INDEX "claim_sources_articleId_idx" ON "claim_sources"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_sources_claimId_articleId_key" ON "claim_sources"("claimId", "articleId");

-- CreateIndex
CREATE INDEX "primary_docs_storyId_idx" ON "primary_docs"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_sources" ADD CONSTRAINT "claim_sources_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_sources" ADD CONSTRAINT "claim_sources_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "primary_docs" ADD CONSTRAINT "primary_docs_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
