import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { comics, musics } from "@asobi/database/schema";

// Every file request still checks current visibility, without loading metadata.
export async function getComicContentAccess(id: number, db = getDb()) {
  const [comic] = await db
    .select({ id: comics.id })
    .from(comics)
    .innerJoin(musics, eq(comics.musicId, musics.id))
    .where(and(eq(comics.id, id), isNull(musics.deletedAt)))
    .limit(1);
  return comic ?? null;
}
