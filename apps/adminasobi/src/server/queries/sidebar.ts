import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { loudasobiSidebarSettings } from "@asobi/database/schema";
import { sidebarLayoutSchema } from "@asobi/content-core/sidebarOrder";
import { requireAdminSession } from "@/server/auth/access";
export async function readSidebarLayout() {
  await requireAdminSession();
  const [row] = await getDb()
    .select()
    .from(loudasobiSidebarSettings)
    .where(eq(loudasobiSidebarSettings.id, 1));
  return sidebarLayoutSchema.parse(
    row?.layoutJson ?? { groups: [], ungrouped: [] },
  );
}
