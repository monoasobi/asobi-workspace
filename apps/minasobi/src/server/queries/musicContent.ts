import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { musics, books, bookNovels } from "@asobi/database/schema";
import type { AdminBook, AdminDashboardData } from "@/components/content/data";
import type { AdminMusic } from "@/types/music";
import { createLyricsDocument } from "./lyricsDocument";
import { requireAdminSession } from "@/server/auth/access";

export async function getMusicContent(musicId: number) {
  await requireAdminSession();
  return readMusicContent(getDb(), musicId);
}

// Both direct bookId and book_novels links use the same nested book projection.
const bookRelations = {
  novels: {
    orderBy: asc(bookNovels.order),
    with: { novel: { columns: { id: true, title: true, musicId: true } } },
  },
  purchaseLinks: true,
} as const;

export async function readMusicContent(db: ReturnType<typeof getDb>, musicId: number) {
  const [row, bookOptions] = await Promise.all([
    db.query.musics.findFirst({
      where: and(eq(musics.id, musicId), isNull(musics.deletedAt)),
      with: {
        settings: true,
        callGuide: { columns: { updatedAt: true } },
        novels: {
          orderBy: (table, { asc }) => asc(table.id),
          with: {
            book: { with: bookRelations },
            bookLinks: { with: { book: { with: bookRelations } } },
          },
        },
        comics: { orderBy: (table, { asc }) => asc(table.id) },
        lyricTrack: true,
      },
    }),
    // This list is independent of the selected song and has no detail payloads.
    db.select({ id: books.id, name: books.name }).from(books).orderBy(books.id),
  ]);
  if (!row) return null;
  const { novels, comics, lyricTrack, settings, callGuide, ...song } = row;
  const linkedBooks = new Map<number, AdminBook>();
  const songNovels = novels.map(({ bookLinks, book, ...novel }) => {
    if (book) linkedBooks.set(book.id, book);
    for (const link of bookLinks) linkedBooks.set(link.book.id, link.book);
    return {
      ...novel, music: song,
      book: book ? { id: book.id, name: book.name, createdAt: book.createdAt, updatedAt: book.updatedAt } : null,
    };
  });
  const lyric = lyricTrack ? createLyricsDocument({ ...lyricTrack, music: song }) : null;
  const data: AdminDashboardData = {
    musics: [song],
    novels: songNovels,
    comics: comics.map(comic => ({ ...comic, music: song })),
    books: [...linkedBooks.values()].sort((a, b) => a.id - b.id),
    bookOptions,
    lyricTracks: lyric && lyricTrack ? [{ ...lyric.lyricTrack, updatedAt: lyricTrack.updatedAt, lineCount: lyric.lyricTrack.lyricJson.length }] : [],
  };
  const music: AdminMusic = {
    id: song.id,
    title: song.title,
    korTitle: song.korTitle,
    enTitle: song.enTitle,
    albumArtKey: song.albumArtKey,
    commonYoutubeId: song.youtubeId,
    specialPath: song.specialPath,
    updatedAt: song.updatedAt,
    guideUpdatedAt: callGuide?.updatedAt ?? null,
    youtubeId: settings?.youtubeId ?? null,
    fanLightColor: settings?.fanLightColor ?? null,
    bpm: settings?.bpm ?? null,
    publish: settings?.publish ?? false,
    syncOffset: settings?.syncOffset ?? 0,
    sourceSync: lyricTrack?.sync ?? 0,
    hasLyrics: lyricTrack !== null,
  };
  return { music, data, revision: lyric?.revision };
}
