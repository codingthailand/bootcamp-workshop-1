import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// PostgreSQL connection config (source of truth for both pg Pool and Prisma adapter)
const config = {
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'root',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'mydb',
  ssl: false,
};

// Cache instances on globalThis in dev so HMR (hot reload) reuses them
// instead of creating new Pool/PrismaClient on every reload (connection exhaustion).
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  prisma?: PrismaClient;
};

// Raw pg pool — used by LangGraph PostgresSaver checkpointer (./checkpointer)
export const pool = globalForDb.pool ?? new Pool(config);

// Prisma Client via node-postgres driver adapter (Prisma ORM v7)
const adapter = new PrismaPg(config);
export const prisma = globalForDb.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
  globalForDb.prisma = prisma;
}
