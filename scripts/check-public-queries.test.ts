import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq } from "drizzle-orm";
import * as schema from "@asobi/database/schema";
import {
  readPublicCatalog,
  readPublicMusicById,
} from "../apps/loudasobi/src/server/queries/catalog";
import { getComicContentAccess } from "../apps/monoasobi/src/server/queries/comicAccess";

test("public lists omit detail payloads; song and comic access remain scoped and current", async () => {
  const client = createClient({ url: "file::memory:" });
  const queries: string[] = [];
  const db = drizzle(client, {
    schema,
    logger: {
      logQuery(query) {
        queries.push(query);
      },
    },
  });
  try {
    await migrate(db, {
      migrationsFolder: fileURLToPath(
        new URL("../packages/database/drizzle", import.meta.url),
      ),
    });
    await db.insert(schema.musics).values(
      [0, 1, 2, 3, 4, 5, 6].map((id) => ({
        id,
        title: `Song ${id}`,
        korTitle: `곡 ${id}`,
        enTitle: `Song ${id}`,
        youtubeId: "commonVideo",
        deletedAt: id === 2 ? "2026-10-21" : null,
      })),
    );
    await db.insert(schema.loudasobiMusicSettings).values(
      [0, 1, 2, 3, 5, 6].map((musicId) => ({
        musicId,
        youtubeId: "abcdefghijk",
        publish: musicId !== 3,
        syncOffset: 0.5,
      })),
    );
    const lines = [
      {
        id: "line-0",
        start: 0,
        end: 1,
        jp: "原文",
        kr: "원문",
        jpReading: "げんぶん",
        en: "Original",
        enReading: "Reading",
      },
    ];
    await db.insert(schema.lyricTracks).values([
      { musicId: 0, sync: 0.25, lyricJson: lines },
      // A malformed other song must not block the list or selected song.
      { musicId: 1, lyricJson: [{ invalid: "other-song-payload" }] },
      { musicId: 6, lyricJson: [] },
    ]);
    await db
      .insert(schema.loudasobiCallGuides)
      .values({ musicId: 0, guideJson: { version: 2, cues: [] } });
    queries.length = 0;
    const list = await readPublicCatalog(db);
    assert.equal(queries.length, 1);
    assert(!queries[0].includes("loudasobi_call_guides"));
    assert.deepEqual(
      list.map((entry) => entry.music.id),
      [0, 1, 5, 6],
    );
    assert.deepEqual(
      list.map((entry) => entry.hasLyrics),
      [true, true, false, false],
    );
    assert(
      list.every((entry) => !("track" in entry) && !("sections" in entry)),
    );
    assert(!JSON.stringify(list).includes("other-song-payload"));
    assert(!JSON.stringify(list).includes("原文"));
    queries.length = 0;
    const selected = await readPublicMusicById(db, 0);
    assert.equal(queries.length, 1);
    assert(selected);
    assert.equal(selected.music.id, 0);
    assert.equal(selected.music.youtubeId, "abcdefghijk");
    assert.equal(selected.track?.sync, 0.75);
    assert.equal(selected.track?.lyric[0].jp, "原文");
    assert(!JSON.stringify(selected).includes("other-song-payload"));
    await assert.rejects(readPublicMusicById(db, 1));
    for (const id of [2, 3, 4, 999])
      assert.equal(await readPublicMusicById(db, id), null);
    assert.equal((await readPublicMusicById(db, 5))?.track, undefined);
    assert.deepEqual((await readPublicMusicById(db, 6))?.track?.lyric, []);
    await db.insert(schema.comics).values(
      [0, 2, 3].map((id) => ({
        id,
        musicId: id,
        title: "Not needed for file access",
        writer: "Writer",
        originUrl: "https://example.test",
        translator: "Name",
        translatorUrl: "",
        length: 20,
      })),
    );
    queries.length = 0;
    assert.deepEqual(await getComicContentAccess(0, db), { id: 0 });
    assert.equal(queries.length, 1);
    assert.match(queries[0], /^select "comics"\."id" from/);
    assert(!queries[0].includes("title"));
    assert.equal(await getComicContentAccess(2, db), null);
    assert.equal(await getComicContentAccess(999, db), null);
    // Mono access must not depend on Loud publish status.
    assert.deepEqual(await getComicContentAccess(3, db), { id: 3 });
    await db
      .update(schema.musics)
      .set({ deletedAt: "2026-10-21" })
      .where(eq(schema.musics.id, 0));
    assert.equal(await getComicContentAccess(0, db), null);
    assert.equal(await readPublicMusicById(db, 0), null);
    assert(
      !(await readPublicCatalog(db)).some((entry) => entry.music.id === 0),
    );
  } finally {
    client.close();
  }
});
