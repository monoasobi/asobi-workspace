import "server-only";
import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { musics, novels, bookNovels, books } from "@asobi/database/schema";
import type { AdminDashboardData } from "@/components/content/data";
import { createLyricsDocument } from "./lyricsDocument";
import { requireAdminSession } from "@/server/auth/access";

export async function getMusicContent(musicId: number) {
  await requireAdminSession();
  return readMusicContent(getDb(), musicId);
}

// Keep the database reader injectable for isolated, in-memory checks.
export async function readMusicContent(db: ReturnType<typeof getDb>, musicId: number) {
  const songNovels = db.select({ id: novels.id }).from(novels).where(eq(novels.musicId, musicId));
  const [music, linkedBooks, bookOptions] = await Promise.all([
    db.query.musics.findFirst({
      where: and(eq(musics.id, musicId), isNull(musics.deletedAt)),
      with: {
        novels: { orderBy: (table, { asc }) => asc(table.id), with: { music: true, book: true } },
        comics: { orderBy: (table, { asc }) => asc(table.id), with: { music: true } },
        lyricTrack: true,
      },
    }),
    db.query.books.findMany({
      where: or(
        inArray(books.id, db.select({ id: novels.bookId }).from(novels).where(eq(novels.musicId, musicId))),
        inArray(books.id, db.select({ id: bookNovels.bookId }).from(bookNovels).where(inArray(bookNovels.novelId, songNovels))),
      ),
      orderBy: (table, { asc }) => asc(table.id),
      with: {
        novels: { orderBy: (table, { asc }) => asc(table.order), with: { novel: true } },
        purchaseLinks: true,
      },
    }),
    // Novel forms can choose any book, but only its ID and name are needed.
    db.select({ id: books.id, name: books.name }).from(books).orderBy(books.id),
  ]);
  if (!music) return null;
  const { novels: songNovelsData, comics, lyricTrack, ...song } = music;
  const lyric = lyricTrack ? createLyricsDocument({ ...lyricTrack, music: song }) : null;
  const data: AdminDashboardData = {
    musics: [song],
    novels: songNovelsData,
    comics,
    books: linkedBooks,
    bookOptions,
    lyricTracks: lyric ? [{
      ...lyric.lyricTrack,
      updatedAt: lyricTrack!.updatedAt,
      lineCount: lyric.lyricTrack.lyricJson.length,
    }] : [],
  };
  return { data, revision: lyric?.revision };
}
