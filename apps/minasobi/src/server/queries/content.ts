import "server-only";
import { getDb } from "@asobi/database";
import { musics as musicTable } from "@asobi/database/schema";
import { isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";

import type { LyricLine } from "@asobi/content-core/lyrics";

export const getAdminDashboard = async () => {
  await requireAdminSession();
  const db = getDb();
  const activeMusicIds = () =>
    db
      .select({ id: musicTable.id })
      .from(musicTable)
      .where(isNull(musicTable.deletedAt));
  const [musics, novels, comics, books, lyricTracks] = await Promise.all([
    db.query.musics.findMany({
      where: (musics, { isNull }) => isNull(musics.deletedAt),
      orderBy: (musics, { asc }) => asc(musics.id),
    }),
    db.query.novels.findMany({
      where: (novels, { inArray }) => inArray(novels.musicId, activeMusicIds()),
      orderBy: (novels, { asc }) => asc(novels.id),
      with: {
        music: true,
        book: true,
      },
    }),
    db.query.comics.findMany({
      where: (comics, { inArray }) => inArray(comics.musicId, activeMusicIds()),
      orderBy: (comics, { asc }) => asc(comics.id),
      with: {
        music: true,
      },
    }),
    db.query.books.findMany({
      orderBy: (books, { asc }) => asc(books.id),
      with: {
        novels: {
          orderBy: (bookNovels, { asc }) => asc(bookNovels.order),
          with: {
            novel: true,
          },
        },
        purchaseLinks: true,
      },
    }),
    db.query.lyricTracks.findMany({
      where: (lyricTracks, { inArray }) =>
        inArray(lyricTracks.musicId, activeMusicIds()),
      orderBy: (lyricTracks, { asc }) => asc(lyricTracks.musicId),
    }),
  ]);

  return {
    musics,
    novels,
    comics,
    // Keep hidden relationships in edit payloads so saving a book cannot unlink them.
    books,
    lyricTracks: lyricTracks.map((track) => ({
      musicId: track.musicId,
      sync: track.sync,
      updatedAt: track.updatedAt,
      lineCount: Array.isArray(track.lyricJson) ? track.lyricJson.length : 0,
      lyricJson: track.lyricJson as LyricLine[],
    })),
  };
};

export async function getDeletedMusics() {
  await requireAdminSession();
  return getDb().query.musics.findMany({
    where: (musics, { isNotNull }) => isNotNull(musics.deletedAt),
    orderBy: (musics, { asc }) => asc(musics.id),
  });
}
