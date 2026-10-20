import {
  bookNovels,
  bookPurchaseLinks,
  books,
  comics,
  lyricTracks,
  musics,
  novels,
} from "@asobi/database/schema";
import "server-only";
import { getDb } from "@asobi/database";
import { requireAdminWriteAccess } from "@/server/auth/access";
import type {
  BookInput,
  ComicInput,
  NovelInput,
} from "@asobi/content-core/contentInput";
import type { MusicInput } from "@asobi/content-core/music";
import type { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import type { z } from "zod";
type LyricTrackInput = z.infer<typeof lyricTrackSchema>;
import { and, eq, isNull, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export class ContentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function requireActiveMusic(
  id: number,
  db: Pick<ReturnType<typeof getDb>, "select">,
) {
  const [music] = await db
    .select({ id: musics.id })
    .from(musics)
    .where(and(eq(musics.id, id), isNull(musics.deletedAt)));
  if (!music) throw new ContentError(404, "곡이 없거나 삭제되었습니다.");
}
const now = () => new Date().toISOString();

export const createMusic = async (input: MusicInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  const [created] = await db.insert(musics).values(input).returning();
  return created;
};

// Preserve all related content. A single UPDATE is atomic and reversible.
export const deleteMusic = async (id: number) => {
  await requireAdminWriteAccess();
  const db = getDb();
  const timestamp = now();
  const [deleted] = await db
    .update(musics)
    .set({ deletedAt: timestamp, updatedAt: timestamp })
    .where(and(eq(musics.id, id), isNull(musics.deletedAt)))
    .returning();
  return deleted ?? null;
};

export const restoreMusic = async (id: number) => {
  await requireAdminWriteAccess();
  const db = getDb();
  const [restored] = await db
    .update(musics)
    .set({ deletedAt: null, updatedAt: now() })
    .where(eq(musics.id, id))
    .returning();
  return restored ?? null;
};

export const createNovel = async (input: NovelInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  await requireActiveMusic(input.musicId, db);
  const [created] = await db.insert(novels).values(input).returning();
  return created;
};

export const updateNovel = async (id: number, input: NovelInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  await requireActiveMusic(input.musicId, db);
  const [updated] = await db
    .update(novels)
    .set({ ...input, updatedAt: now() })
    .where(eq(novels.id, id))
    .returning();

  return updated ?? null;
};

export const deleteNovel = async (id: number) => {
  await requireAdminWriteAccess();
  return getDb().transaction(async (db) => {
    const [current] = await db.select().from(novels).where(eq(novels.id, id));
    if (!current) return null;
    await db.delete(bookNovels).where(eq(bookNovels.novelId, id));
    const [deleted] = await db
      .delete(novels)
      .where(eq(novels.id, id))
      .returning();
    return deleted;
  });
};

export const createComic = async (input: ComicInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  await requireActiveMusic(input.musicId, db);
  const [created] = await db.insert(comics).values(input).returning();
  return created;
};

export const updateComic = async (id: number, input: ComicInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  await requireActiveMusic(input.musicId, db);
  const [updated] = await db
    .update(comics)
    .set({ ...input, updatedAt: now() })
    .where(eq(comics.id, id))
    .returning();

  return updated ?? null;
};

export const deleteComic = async (id: number) => {
  await requireAdminWriteAccess();
  const db = getDb();
  const [deleted] = await db
    .delete(comics)
    .where(eq(comics.id, id))
    .returning();

  return deleted ?? null;
};

export const createLyricTrack = async (input: LyricTrackInput) => {
  await requireAdminWriteAccess();
  const db = getDb();
  await requireActiveMusic(input.musicId, db);
  const existing = await db
    .select({ id: lyricTracks.musicId })
    .from(lyricTracks)
    .where(eq(lyricTracks.musicId, input.musicId));
  if (existing.length)
    throw new ContentError(
      409,
      "가사 트랙이 이미 있습니다. 기존 편집 화면을 이용해 주세요.",
    );
  const [created] = await db
    .insert(lyricTracks)
    .values({
      ...input,
      lyricJson: input.lyricJson.map((line) => ({
        ...line,
        id: line.id ?? randomUUID(),
      })),
    })
    .returning();
  return created;
};

export const createBook = async (input: BookInput) => {
  await requireAdminWriteAccess();
  return getDb().transaction(async (db) => {
    await validateBookNovels(db, input);
    const [book] = await db
      .insert(books)
      .values({ name: input.name })
      .returning();
    await replaceBookDetails(db, book.id, input);
    return book;
  });
};
export const updateBook = async (id: number, input: BookInput) => {
  await requireAdminWriteAccess();
  return getDb().transaction(async (db) => {
    const [current] = await db.select().from(books).where(eq(books.id, id));
    if (!current) return null;
    await validateBookNovels(db, input);
    const [book] = await db
      .update(books)
      .set({ name: input.name, updatedAt: now() })
      .where(eq(books.id, id))
      .returning();
    await replaceBookDetails(db, id, input);
    return book;
  });
};
export const deleteBook = async (id: number) => {
  await requireAdminWriteAccess();
  return getDb().transaction(async (db) => {
    const [current] = await db.select().from(books).where(eq(books.id, id));
    if (!current) return null;
    const [linked] = await db
      .select({ id: novels.id })
      .from(novels)
      .where(eq(novels.bookId, id))
      .limit(1);
    // Do not turn a published/private novel into an unlinked public novel.
    if (linked)
      throw new ContentError(
        409,
        "출판 소설이 참조하는 서적입니다. 소설의 출판·서적 연결을 먼저 검토해 주세요.",
      );
    await db.delete(bookNovels).where(eq(bookNovels.bookId, id));
    await db.delete(bookPurchaseLinks).where(eq(bookPurchaseLinks.bookId, id));
    const [deleted] = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning();
    return deleted;
  });
};
async function validateBookNovels(
  db: Pick<ReturnType<typeof getDb>, "select">,
  input: BookInput,
) {
  const ids = input.novelIds;
  if (new Set(ids).size !== ids.length)
    throw new ContentError(400, "소설 ID가 중복되었습니다.");
  if (!ids.length) return;
  const found = await db
    .select({ id: novels.id })
    .from(novels)
    .where(inArray(novels.id, ids));
  if (found.length !== ids.length)
    throw new ContentError(400, "존재하지 않는 소설 ID가 포함되어 있습니다.");
}

const replaceBookDetails = async (
  db: Pick<ReturnType<typeof getDb>, "insert" | "delete">,
  bookId: number,
  input: BookInput,
) => {
  await db.delete(bookNovels).where(eq(bookNovels.bookId, bookId));
  await db
    .delete(bookPurchaseLinks)
    .where(eq(bookPurchaseLinks.bookId, bookId));
  await db.insert(bookPurchaseLinks).values({
    bookId,
    ...input.purchaseLinks,
  });

  if (input.novelIds.length === 0) return;

  await db.insert(bookNovels).values(
    input.novelIds.map((novelId, index) => ({
      bookId,
      novelId,
      order: index + 1,
    })),
  );
};
