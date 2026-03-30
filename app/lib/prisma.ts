import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Cache in ALL environments to prevent connection exhaustion on serverless
globalForPrisma.prisma = prisma;

export default prisma;
