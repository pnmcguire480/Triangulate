-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastSignIn" TIMESTAMP(3),
ADD COLUMN     "magicToken" TEXT,
ADD COLUMN     "magicTokenExpiresAt" TIMESTAMP(3);
