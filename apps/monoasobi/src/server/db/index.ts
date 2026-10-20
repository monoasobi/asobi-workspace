import { getDb } from "@asobi/database";

// Preserve the existing eager entry point while sharing connection and schema.
export const db = getDb();
export * from "@asobi/database/schema";
