import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is required");
  return drizzle(
    createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
    { schema },
  );
}

let database: ReturnType<typeof connect> | undefined;
export const getDb = () => (database ??= connect());
