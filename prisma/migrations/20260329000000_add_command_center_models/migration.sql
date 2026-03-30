-- CreateEnum (skip if already exists from prior migration)
DO $$ BEGIN
  CREATE TYPE "Region" AS ENUM ('US', 'UK', 'EUROPE', 'MIDDLE_EAST', 'ASIA_PACIFIC', 'CANADA', 'LATIN_AMERICA', 'AFRICA', 'OCEANIA', 'GLOBAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: Add region to sources (if not already added by prior migration)
-- Note: 20260314 migration already added region; this is a no-op guard
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sources' AND column_name = 'region') THEN
    ALTER TABLE "sources" ADD COLUMN "region" "Region" NOT NULL DEFAULT 'US';
  END IF;
END $$;

-- AlterTable: Add magic link fields + lastSignIn to users (if not already added)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lastSignIn') THEN
    ALTER TABLE "users" ADD COLUMN "lastSignIn" TIMESTAMP(3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'magicToken') THEN
    ALTER TABLE "users" ADD COLUMN "magicToken" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'magicTokenExpiresAt') THEN
    ALTER TABLE "users" ADD COLUMN "magicTokenExpiresAt" TIMESTAMP(3);
  END IF;
END $$;

-- CreateTable: DailyGCI
CREATE TABLE IF NOT EXISTS "daily_gci" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "breadth" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "contestation" DOUBLE PRECISION NOT NULL,
    "storyCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_gci_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Workspace
CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SourceMonthlyStats
CREATE TABLE IF NOT EXISTS "source_monthly_stats" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "claimsTotal" INTEGER NOT NULL DEFAULT 0,
    "claimsConfirmed" INTEGER NOT NULL DEFAULT 0,
    "confirmationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_monthly_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "daily_gci_date_key" ON "daily_gci"("date");
CREATE INDEX IF NOT EXISTS "daily_gci_date_idx" ON "daily_gci"("date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workspaces_userId_name_key" ON "workspaces"("userId", "name");
CREATE INDEX IF NOT EXISTS "workspaces_userId_idx" ON "workspaces"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "source_monthly_stats_sourceId_month_key" ON "source_monthly_stats"("sourceId", "month");
CREATE INDEX IF NOT EXISTS "source_monthly_stats_sourceId_idx" ON "source_monthly_stats"("sourceId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_monthly_stats" ADD CONSTRAINT "source_monthly_stats_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
