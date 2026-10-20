import "server-only";
import { getDb as getSharedDb } from "@asobi/database";

export function getDb() {
  // Keep this app's existing configuration requirement, including local tokens.
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN)
    throw new Error("Database configuration is missing");
  return getSharedDb();
}
