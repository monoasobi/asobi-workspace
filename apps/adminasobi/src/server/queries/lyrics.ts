import "server-only";
import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { musics, lyricTracks } from "@asobi/database/schema";
import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import { requireAdminSession } from "@/server/auth/access";

export async function readLyrics(
  id: number,
  db: Pick<ReturnType<typeof getDb>, "select"> = getDb(),
) {
  await requireAdminSession();
  const [row] = await db
    .select({
      music: {
        id: musics.id,
        title: musics.title,
        korTitle: musics.korTitle,
        enTitle: musics.enTitle,
        youtubeId: musics.youtubeId,
      },
      musicId: lyricTracks.musicId,
      sync: lyricTracks.sync,
      lyricJson: lyricTracks.lyricJson,
      updatedAt: lyricTracks.updatedAt,
    })
    .from(musics)
    .innerJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .where(and(eq(musics.id, id), isNull(musics.deletedAt)));
  if (!row) return null;
  return {
    music: { ...row.music, youtubeId: row.music.youtubeId ?? undefined },
    lyricTrack: lyricTrackSchema.parse({
      musicId: row.musicId,
      sync: row.sync,
      lyricJson: row.lyricJson,
    }),
    revision: createHash("sha256").update(JSON.stringify(row)).digest("hex"),
  };
}
export type LyricsDocument = NonNullable<
  Awaited<ReturnType<typeof readLyrics>>
>;
