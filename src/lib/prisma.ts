import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
};

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Sanitize environment variables from any wrapping quotes or whitespaces pasted in Vercel UI
  if (process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.trim().replace(/^["']|["']$/g, "");
  }
  if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DIRECT_URL.trim().replace(/^["']|["']$/g, "");
  }

  const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder_db";

  if (!process.env.DATABASE_URL) {
    console.warn("[Prisma] Warning: DATABASE_URL is not defined in environment variables. Using placeholder for build phase.");
  }

  try {
    new URL(databaseUrl);
  } catch (err: any) {
    throw new Error(`Invalid DATABASE_URL format. Details: ${err.message}`);
  }

  // Persist prisma client on global object to avoid pool saturation in dev
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).order || !(globalForPrisma.prisma as any).page || !(globalForPrisma.prisma as any).review) {
    console.log(`[Database] Initializing single database connection pool for Supabase...`);
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  prisma = globalForPrisma.prisma;
} else {
  prisma = null as any;
}

export { prisma };
