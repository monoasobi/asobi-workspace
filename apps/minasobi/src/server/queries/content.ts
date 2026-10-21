import "server-only";
import { getDb } from "@asobi/database";
import { musics as musicTable } from "@asobi/database/schema";
import { isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";

import type { AdminDashboardData } from "@/components/content/data";

export async function getBooksData() {
  await requireAdminSession();
  return readBooksData(getDb());
}

export async function readBooksData(db: ReturnType<typeof getDb>): Promise<AdminDashboardData> {
  const [books, choices] = await Promise.all([
    db.query.books.findMany({
      orderBy: (table, { asc }) => asc(table.id),
      with: {
        novels: {
          orderBy: (table, { asc }) => asc(table.order),
          with: { novel: { columns: { id: true, title: true, musicId: true } } },
        },
        purchaseLinks: true,
      },
    }),
    db.query.novels.findMany({
      columns: { id: true, title: true, musicId: true, bookId: true },
      where: (table, { inArray }) => inArray(table.musicId,
        db.select({ id: musicTable.id }).from(musicTable).where(isNull(musicTable.deletedAt))),
      orderBy: (table, { asc }) => asc(table.id),
      with: { music: { columns: { title: true, korTitle: true } } },
    }),
  ]);
  return {
    musics: [], novels: [], comics: [], lyricTracks: [], books,
    novelOptions: choices.map(({ music, ...novel }) => ({ ...novel, musicTitle: music.korTitle || music.title })),
  };
}

export async function getDeletedMusics() {
  await requireAdminSession();
  return getDb().query.musics.findMany({
    where: (musics, { isNotNull }) => isNotNull(musics.deletedAt),
    orderBy: (musics, { asc }) => asc(musics.id),
  });
}
