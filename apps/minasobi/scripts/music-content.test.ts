import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "@asobi/database/schema";
import { readMusicContent } from "../src/server/queries/musicContent";

test("song content is scoped by ID while book choices and lyric revisions are preserved", async () => {
  const client = createClient({ url: "file::memory:" });
  const queries: string[] = [];
  const db = drizzle(client, { schema, logger: { logQuery: query => { queries.push(query); } } });
  try {
    await migrate(db, { migrationsFolder: fileURLToPath(new URL("../../../packages/database/drizzle", import.meta.url)) });
    await db.insert(schema.musics).values([
      { id: 0, title: "Song zero", korTitle: "곡", enTitle: "Song", youtubeId: null },
      { id: 1, title: "Other song", korTitle: "다른 곡", enTitle: "Other" },
      { id: 2, title: "Hidden song", korTitle: "숨김", enTitle: "Hidden", deletedAt: "2026-01-01" },
    ]);
    await db.insert(schema.books).values([{ id: 0, name: "Direct book" }, { id: 1, name: "Shared book" }, { id: 2, name: "Other book" }]);
    await db.insert(schema.novels).values([
      { id: 10, musicId: 0, bookId: 0, title: "Zero novel", writer: "Writer", originUrl: "https://example.test/zero" },
      { id: 11, musicId: 1, bookId: 2, title: "Other novel", writer: "Writer", originUrl: "https://example.test/other" },
      { id: 12, musicId: 2, title: "Hidden novel", writer: "Writer", originUrl: "https://example.test/hidden" },
    ]);
    await db.insert(schema.bookNovels).values([
      { bookId: 1, novelId: 10, order: 0 },
      { bookId: 1, novelId: 12, order: 1 },
    ]);
    await db.insert(schema.bookPurchaseLinks).values({ bookId: 1, kyoboUrl: "https://example.test/book" });
    await db.insert(schema.comics).values([
      { id: 0, musicId: 0, title: "Zero comic", writer: "Writer", originUrl: "https://example.test", translator: "Name", translatorUrl: "", length: 1 },
      { id: 1, musicId: 1, title: "Other comic", writer: "Writer", originUrl: "https://example.test", translator: "Name", translatorUrl: "", length: 1 },
    ]);
    const lines = [{ id: "line-0", start: 0, end: 1, jp: "原文", kr: "원문", jpReading: "げんぶん", en: "Original", enReading: "Reading" }];
    await db.insert(schema.lyricTracks).values([
      { musicId: 0, sync: -0.01, lyricJson: lines, updatedAt: "2026-10-21" },
      { musicId: 1, lyricJson: [{ ...lines[0], id: "unrelated-lyric" }] },
    ]);
    queries.length = 0;
    const result = await readMusicContent(db, 0);
    assert(result);
    assert.equal(queries.length, 3, "relations must not issue one query per document");
    const { data, revision } = result;
    assert.deepEqual(data.musics.map(music => music.id), [0]);
    assert.deepEqual(data.novels.map(novel => novel.id), [10]);
    assert.deepEqual(data.comics.map(comic => comic.id), [0]);
    assert.deepEqual(data.lyricTracks.map(track => track.musicId), [0]);
    assert.deepEqual(data.lyricTracks[0].lyricJson, lines);
    assert.deepEqual(data.books.map(book => book.id), [0, 1]);
    assert.deepEqual(data.bookOptions, [{ id: 0, name: "Direct book" }, { id: 1, name: "Shared book" }, { id: 2, name: "Other book" }]);
    assert.deepEqual(data.books[1].novels.map(link => link.novel.id), [10, 12]);
    assert.equal(data.books[1].purchaseLinks?.kyoboUrl, "https://example.test/book");
    assert(!JSON.stringify(data).includes("unrelated-lyric"));
    const oldSnapshot = {
      music: { id: 0, title: "Song zero", korTitle: "곡", enTitle: "Song", youtubeId: null },
      musicId: 0, sync: -0.01, lyricJson: lines, updatedAt: "2026-10-21",
    };
    assert.equal(revision, createHash("sha256").update(JSON.stringify(oldSnapshot)).digest("hex"));
    const other = await readMusicContent(db, 1);
    assert.deepEqual(other?.data.novels.map(novel => novel.id), [11]);
    assert.deepEqual(other?.data.books.map(book => book.id), [2]);
    await db.insert(schema.musics).values({ id: 3, title: "Empty", korTitle: "빈 곡", enTitle: "Empty" });
    const empty = await readMusicContent(db, 3);
    assert(empty);
    assert.deepEqual(empty.data.lyricTracks, []);
    assert.deepEqual(empty.data.books, []);
    assert.equal(empty.revision, undefined);
    assert.equal(await readMusicContent(db, 2), null);
    assert.equal(await readMusicContent(db, 999), null);
  } finally {
    client.close();
  }
});
