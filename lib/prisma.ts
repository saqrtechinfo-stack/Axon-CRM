import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Optimization: Pooling logic specifically for Serverless environments
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    max: 10, // Keep this low for Netlify/Vercel
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000, // Fail fast if DB is unreachable
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Optional: Log queries in development to spot "unwanted calls"
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
