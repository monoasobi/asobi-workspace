import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { musics } from "@asobi/database/schema";
import { type MusicInput } from "@asobi/content-core/music";
import { requireAdminWriteAccess } from "@/server/auth/access";
// Existing MONOASOBI update, limited to the same five shared song fields.
export async function updateMusic(id: number, input: MusicInput) {
  await requireAdminWriteAccess();
  const { title, korTitle, enTitle, youtubeId, specialPath } = input;
  const values = { title, korTitle, enTitle, youtubeId, specialPath };
  const [updated] = await getDb()
    .update(musics)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(and(eq(musics.id, id), isNull(musics.deletedAt)))
    .returning();
  return updated ?? null;
}
