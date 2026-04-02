/*
  Warnings:

  - You are about to drop the column `search_vector` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `search_vector` on the `stories` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StoryTopic" AS ENUM ('POLITICS', 'ECONOMY', 'WORLD', 'TECHNOLOGY', 'SCIENCE', 'HEALTH', 'ENVIRONMENT', 'LEGAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimLifecycle" AS ENUM ('EMERGING', 'DEVELOPING', 'ESTABLISHED', 'CONTESTED', 'CORRECTED', 'PERSISTENT');

-- DropIndex
DROP INDEX "articles_search_vector_idx";

-- DropIndex
DROP INDEX "stories_search_vector_idx";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "search_vector",
ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "contentSnippet" TEXT;

-- AlterTable
ALTER TABLE "claims" ADD COLUMN     "confidence" TEXT,
ADD COLUMN     "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lifecycle" "ClaimLifecycle" NOT NULL DEFAULT 'EMERGING';

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isWireService" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastFetchedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "stories" DROP COLUMN "search_vector",
ADD COLUMN     "failureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topic" "StoryTopic";

-- CreateIndex
CREATE INDEX "articles_contentHash_idx" ON "articles"("contentHash");

-- CreateIndex
CREATE INDEX "claims_lifecycle_idx" ON "claims"("lifecycle");

-- CreateIndex
CREATE INDEX "stories_createdAt_idx" ON "stories"("createdAt");

-- CreateIndex
CREATE INDEX "stories_lastAnalyzedAt_idx" ON "stories"("lastAnalyzedAt");

-- CreateIndex
CREATE INDEX "stories_trustSignal_idx" ON "stories"("trustSignal");

-- CreateIndex
CREATE INDEX "stories_topic_idx" ON "stories"("topic");
