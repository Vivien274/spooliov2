import { PrismaClient } from '../generated/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  adapter: PrismaMariaDb;
};

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  const databaseUrl = process.env.DATABASE_URL || "mysql://localhost:3306/placeholder_db";

  if (!process.env.DATABASE_URL) {
    console.warn("[Prisma] Warning: DATABASE_URL is not defined in environment variables. Using placeholder for build phase.");
  }

  // Parse check just to ensure it is mysql/mariadb URL format
  try {
    new URL(databaseUrl);
  } catch (err: any) {
    throw new Error(`Invalid DATABASE_URL format. Details: ${err.message}`);
  }

  // Persist both adapter and prisma client on global object to avoid pool saturation in dev
  if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any).order || !(globalForPrisma.prisma as any).page || !(globalForPrisma.prisma as any).review) {
    console.log(`[Database] Initializing single database connection pool for emeraude.o2switch.net...`);
    const adapter = new PrismaMariaDb(databaseUrl);
    globalForPrisma.adapter = adapter;
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  prisma = globalForPrisma.prisma;
} else {
  prisma = null as any;
}

export { prisma };
