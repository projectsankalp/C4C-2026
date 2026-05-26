/**
 * Prisma client singleton.
 *
 * Connects to whatever DATABASE_URL points at — Supabase in production, a
 * local Postgres in dev. The schema lives in prisma/schema.prisma; tables
 * are created via Prisma migrations or the Supabase dashboard.
 *
 * Note: the previous in-memory + hand-rolled-postgres adapter that lived
 * here was incomplete (missing models like User, partial coverage of
 * whatsappMessage, etc.) and silently fell back to memory when the env was
 * misconfigured. Real Prisma keeps things honest — if DATABASE_URL is wrong,
 * the API fails to start and we see it immediately.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __hastkalaPrisma: PrismaClient | undefined;
}

// Reuse a single client across hot-reloads in dev (ts-node-dev) so we don't
// exhaust the connection pool every time a file changes. In production this
// just creates one client per process, which is what we want.
const prisma =
  global.__hastkalaPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__hastkalaPrisma = prisma;
}

export default prisma;
