import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { localCheckClient } from "./local-check-client.mjs";
let cookie;
const { call, login, expectedDatabase } = localCheckClient(() => cookie);
const db = new DatabaseSync(expectedDatabase);
assert.equal(db.prepare("SELECT COUNT(*) n FROM musics").get().n, 1);
assert.equal(
  db.prepare("SELECT title FROM musics WHERE id=0").get()?.title,
  "ローカル確認",
);
const tables = [
  "musics",
  "books",
  "novels",
  "comics",
  "lyric_tracks",
  "book_novels",
  "book_purchase_links",
  "loudasobi_music_settings",
  "loudasobi_call_guides",
  "loudasobi_sidebar_settings",
];
for (const table of ["books", "novels", "comics"])
  assert.equal(
    db.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n,
    0,
    "Only the empty-content synthetic fixture is allowed",
  );
const snapshot = () =>
  Object.fromEntries(
    tables.map((t) => [t, db.prepare(`SELECT * FROM ${t}`).all()]),
  );
const before = snapshot();
const post = async (path, body, status = 201) => {
  const r = await call(path, { method: "POST", body });
  assert.equal(r.status, status, JSON.stringify(r.data));
  return r.data;
};
const put = async (path, body, status = 200) => {
  const r = await call(path, { method: "PUT", body });
  assert.equal(r.status, status, JSON.stringify(r.data));
  return r.data;
};
const music = {
  title: "Synthetic migration",
  korTitle: "이관 확인",
  enTitle: "Synthetic",
  youtubeId: "",
  specialPath: "",
};
const novel = (musicId, title = "Novel") => ({
  musicId,
  title,
  writer: "Writer",
  originUrl: "https://example.test/original",
  translator: "",
  translatorUrl: "",
  translated: false,
  isPublished: false,
  bookId: "",
});
try {
  assert.equal((await call("/api/admin/content", { cookie: "" })).status, 401);
  for (const kind of ["musics", "novels", "comics", "books", "lyric-tracks"])
    assert.equal(
      (
        await call(`/api/admin/${kind}`, {
          method: "POST",
          cookie: "",
          body: {},
        })
      ).status,
      401,
    );
  const viewer = await login("ADMIN_VIEWER_PASSWORDS");
  for (const kind of ["musics", "novels", "comics", "books", "lyric-tracks"])
    assert.equal(
      (
        await call(`/api/admin/${kind}`, {
          method: "POST",
          cookie: viewer,
          body: {},
        })
      ).status,
      403,
    );
  cookie = await login("ADMIN_PASSWORD");
  for (const kind of ["musics", "novels", "comics", "books", "lyric-tracks"]) {
    assert.equal(
      (
        await call(`/api/admin/${kind}`, {
          method: "POST",
          origin: "https://elsewhere.invalid",
          body: {},
        })
      ).status,
      403,
    );
    assert.equal(
      (await call(`/api/admin/${kind}`, { method: "POST", body: {} })).status,
      400,
    );
  }
  const m = (await post("/api/admin/musics", music)).music;
  const hidden = (
    await post("/api/admin/musics", { ...music, title: "Hidden synthetic" })
  ).music;
  const n1 = (await post("/api/admin/novels", novel(m.id))).novel;
  const n2 = (await post("/api/admin/novels", novel(hidden.id, "Hidden novel")))
    .novel;
  const comicInput = {
    musicId: m.id,
    title: "Comic",
    writer: "Writer",
    originUrl: "https://example.test/comic",
    translator: "Translator",
    translatorUrl: "https://example.test/translator",
    length: 3,
  };
  const c = (await post("/api/admin/comics", comicInput)).comic;
  await put(`/api/admin/comics/${c.id}`, { ...comicInput, length: 4 });
  await post("/api/admin/novels", novel(999999), 404);
  const bookInput = {
    name: "Book",
    novelIds: [n1.id, n2.id],
    purchaseLinks: { kyoboUrl: "https://example.test/book" },
  };
  const book = (await post("/api/admin/books", bookInput)).book;
  await put(`/api/admin/novels/${n1.id}`, {
    ...novel(m.id),
    bookId: book.id,
    isPublished: true,
  });
  assert.equal(
    (await call(`/api/admin/books/${book.id}`, { method: "DELETE" })).status,
    409,
  );
  assert.equal(
    db
      .prepare("SELECT COUNT(*) n FROM book_novels WHERE book_id=?")
      .get(book.id).n,
    2,
  );
  const originalLinks = db
    .prepare("SELECT * FROM book_purchase_links WHERE book_id=?")
    .get(book.id);
  await put(
    `/api/admin/books/${book.id}`,
    { ...bookInput, name: "Should rollback", novelIds: [n1.id, 999999] },
    400,
  );
  assert.equal(
    db.prepare("SELECT name FROM books WHERE id=?").get(book.id).name,
    "Book",
  );
  assert.deepEqual(
    db
      .prepare("SELECT * FROM book_purchase_links WHERE book_id=?")
      .get(book.id),
    originalLinks,
  );
  assert.equal(
    (await call(`/api/admin/musics/${hidden.id}`, { method: "DELETE" })).status,
    200,
  );
  const dashboard = (await call("/api/admin/content")).data;
  assert(!dashboard.data.musics.some((row) => row.id === hidden.id));
  assert(!dashboard.data.novels.some((row) => row.id === n2.id));
  assert(!dashboard.data.novelOptions.some((row) => row.id === n2.id));
  assert.deepEqual(dashboard.data.lyricTracks, []);
  assert.deepEqual(dashboard.data.comics, []);
  const visibleBook = dashboard.data.books.find((row) => row.id === book.id);
  assert.deepEqual(
    visibleBook.novels.map((row) => row.novel.id),
    [n1.id, n2.id],
  );
  await put(`/api/admin/books/${book.id}`, {
    ...bookInput,
    name: "Updated book",
  });
  assert.equal(
    db
      .prepare("SELECT COUNT(*) n FROM book_novels WHERE book_id=?")
      .get(book.id).n,
    2,
  );
  const input = {
    musicId: m.id,
    sync: 0.25,
    lyricJson: [
      {
        id: "stable-content-line",
        start: 0,
        end: 1,
        jp: "原文",
        jpReading: "げんぶん",
        kr: "원문",
        en: "Original",
        enReading: "Reading",
      },
    ],
  };
  const created = await post("/api/admin/lyric-tracks", input);
  assert.equal(created.lyricTrack.lyricJson[0].en, "Original");
  await post("/api/admin/lyric-tracks", input, 409);
  const lyric = (await call(`/api/admin/musics/${m.id}/lyrics`)).data.document;
  assert.equal(
    (
      await call(`/api/admin/lyric-tracks/${m.id}`, {
        method: "DELETE",
        body: { revision: "0".repeat(64) },
      })
    ).status,
    409,
  );
  const untouched = snapshot();
  assert.equal(
    (await call(`/api/admin/musics/${m.id}`, { method: "DELETE" })).status,
    200,
  );
  for (const table of tables.filter((t) => !["musics"].includes(t)))
    assert.deepEqual(snapshot()[table], untouched[table]);
  await post(`/api/admin/musics/${m.id}/restore`, undefined, 200);
  assert.equal((await call(`/api/admin/musics/${m.id}/lyrics`)).status, 200);
  assert.equal(
    (
      await call(`/api/admin/lyric-tracks/${m.id}`, {
        method: "DELETE",
        body: { revision: lyric.revision },
      })
    ).status,
    200,
  );
  assert.equal(
    (await call(`/api/admin/comics/${c.id}`, { method: "DELETE" })).status,
    200,
  );
  assert.equal(
    (await call(`/api/admin/novels/${n1.id}`, { method: "DELETE" })).status,
    200,
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) n FROM book_novels WHERE novel_id=?").get(n1.id)
      .n,
    0,
  );
  assert.equal(
    (await call(`/api/admin/books/${book.id}`, { method: "DELETE" })).status,
    200,
  );
  // Original recommendation revision and membership protection, using the existing published ID 0.
  const sidebar = (await call("/api/admin/sidebar")).data.document;
  assert.equal(
    (
      await call("/api/admin/sidebar", {
        method: "PUT",
        cookie: viewer,
        body: {},
      })
    ).status,
    403,
  );
  const layout = {
    groups: [
      {
        id: "synthetic-group",
        name: { ko: "검증 그룹", ja: "", en: "" },
        musicIds: sidebar.songs.map((s) => s.id),
      },
    ],
    ungrouped: [],
  };
  const saved = await put("/api/admin/sidebar", {
    revision: sidebar.revision,
    layout,
  });
  assert.deepEqual(saved.refresh, [], "Uncached Loud saves need no notification");
  await put("/api/admin/sidebar", { revision: sidebar.revision, layout }, 409);
  await put(
    "/api/admin/sidebar",
    {
      revision: saved.document.revision,
      layout: { groups: [], ungrouped: [999999] },
    },
    400,
  );
  for (const path of [
    "/musics/new",
    "/musics/deleted",
    "/books",
    `/musics/${m.id}/content`,
    `/musics/${m.id}/content?type=newLyric`,
    `/musics/${m.id}/content?type=novel&id=${n2.id}`,
    "/sidebar",
  ])
    assert.equal((await call(path)).status, 200, path);
  assert.deepEqual(
    db.prepare("SELECT * FROM musics WHERE id=0").get(),
    before.musics[0],
  );
  console.log(
    "Content HTTP checks passed: auth/Origin, CRUD, hidden book links, atomic rejection, lyric revision, soft delete/restore and recommendation conflicts.",
  );
} finally {
  db.exec("PRAGMA foreign_keys=OFF; BEGIN IMMEDIATE");
  try {
    for (const table of [...tables].reverse()) db.exec(`DELETE FROM ${table}`);
    for (const table of tables)
      for (const row of before[table]) {
        const columns = Object.keys(row);
        db.prepare(
          `INSERT INTO ${table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
        ).run(...columns.map((c) => row[c]));
      }
    db.exec("COMMIT; PRAGMA foreign_keys=ON");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  assert.deepEqual(snapshot(), before);
  db.close();
  if (cookie)
    await call("/api/admin/refresh", {
      method: "POST",
      body: { scope: "shared" },
    });
  console.log("Synthetic content fixture restored exactly.");
}
