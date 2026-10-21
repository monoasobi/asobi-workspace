import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { loudasobiSidebarSettings as sidebarSettings } from "@asobi/database/schema";
import { sidebarLayoutSchema } from "@asobi/content-core/sidebarOrder";

type Reader = Pick<ReturnType<typeof getDb>, "select">;
export async function readSidebarLayout(db: Reader = getDb()) {
  const [row] = await db
    .select()
    .from(sidebarSettings)
    .where(eq(sidebarSettings.id, 1));
  return sidebarLayoutSchema.parse(
    row?.layoutJson ?? { groups: [], ungrouped: [] },
  );
}
