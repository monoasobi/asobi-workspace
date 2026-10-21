import { SongList } from "@asobi/ui/components/song-list";
import type { ComponentProps } from "react";
import { getSelectedDocument } from "../src/components/content/adminSelectedDocument";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminMultiSelectField } from "../src/components/content/AdminMultiSelectField";
import assert from "node:assert/strict";
import test from "node:test";
import { novelSchema, bookSchema } from "@asobi/content-core/contentInput";
import { getBookEditorConfig } from "../src/components/content/editorConfigs/book";
import { getNovelEditorConfig } from "../src/components/content/editorConfigs/novel";
import { getLyricEditorConfig } from "../src/components/content/editorConfigs/lyric";
import { getEditorConfig } from "../src/components/content/adminEditorConfig";
import { getMusicDocuments } from "../src/components/content/selection";
import { contentSelection } from "../src/components/content/routeSelection";
import type { AdminDashboardData } from "../src/components/content/data";

test("song novel forms can choose unrelated books using only ID and name options", () => {
  const data = {
    musics: [{ id: 0, title: "Song" }], novels: [], comics: [], books: [], lyricTracks: [],
    bookOptions: [{ id: 0, name: "Available book" }, { id: 2, name: "Another book" }],
  } as unknown as AdminDashboardData;
  const config = getEditorConfig(data, { type: "newNovel", musicId: 0 });
  const field = config?.fields.find(field => field.name === "bookId");
  assert(field?.type === "select");
  assert.deepEqual(field.options.slice(1), [
    { value: "0", label: "0: Available book" }, { value: "2", label: "2: Another book" },
  ]);
});

test("migrated form payloads preserve hidden book relationships and conditional fields", () => {
  const data = {
    musics: [{ id: 0, title: "Song" }],
    novels: [
      {
        id: 1,
        musicId: 0,
        title: "Novel",
        writer: "Writer",
        originUrl: "https://example.test",
        bookId: 1,
        translated: true,
        translator: "Name",
        translatorUrl: "https://example.test",
        isPublished: true,
      },
    ],
    comics: [],
    lyricTracks: [],
    books: [
      {
        id: 1,
        name: "Book",
        novels: [{ novel: { id: 1 } }, { novel: { id: 99 } }],
        purchaseLinks: null,
      },
    ],
  } as unknown as AdminDashboardData;
  const cfg = getBookEditorConfig(data, { type: "book", id: 1 });
  const form = new FormData();
  form.set("name", "Book");
  const ids = cfg.fields.find((f) => f.name === "novelIds");
  assert(ids && ids.type === "multi-select");
  assert.deepEqual(ids.defaultValue, ["1", "99"]);
  assert(ids.options.some(option => option.value === "99"));
  const html = renderToStaticMarkup(createElement(AdminMultiSelectField, {
    id: "novel-selection", field: ids, disabled: false, onEdit: () => {},
  }));
  assert(html.includes('name="novelIds" value="1,99"'));
  assert(html.includes('role="combobox"'));
  assert(html.includes('data-slot="combobox-chip"'));

  form.set("novelIds", String(ids.defaultValue));
  form.set("kyoboUrl", "https://example.test/book");
  assert.deepEqual(bookSchema.parse(cfg.toPayload(form)).novelIds, [1, 99]);
  assert.equal(getMusicDocuments(data, 0).books.length, 1);
  const novel = getNovelEditorConfig(data, { type: "novel", id: 1 }, []);
  const plain = new FormData();
  for (const [key, value] of Object.entries({
    musicId: "0",
    title: "Novel",
    writer: "Writer",
    originUrl: "https://example.test",
    bookId: "1",
    translator: "Old",
    translatorUrl: "https://example.test",
  }))
    plain.set(key, value);
  const payload = novel.toPayload(plain);
  assert.equal(payload.bookId, "");
  assert.equal(payload.translator, "");
  assert.equal(novelSchema.parse(payload).musicId, 0);
  assert.equal(
    novelSchema.safeParse({ ...payload, translated: true }).success,
    false,
  );
  assert.equal(
    novelSchema.safeParse({ ...payload, isPublished: true }).success,
    false,
  );
  assert.equal(
    contentSelection({ type: "newLyric" }, data, true, 0)?.type,
    "newLyric",
  );
  assert.equal(contentSelection({ type: "newLyric" }, data, false, 0), null);
  assert.equal(
    contentSelection({ type: "novel", id: "99" }, data, true, 0),
    null,
  );
  assert.equal(
    contentSelection({ type: "book", id: "1" }, data, true)?.type,
    "book",
  );
});
test("JSON import keeps existing IDs and English rather than producing a different lyric format", () => {
  const data = {
    musics: [{ id: 0, title: "Song" }],
    lyricTracks: [],
  } as unknown as AdminDashboardData;
  const cfg = getLyricEditorConfig(data, { type: "newLyric", musicId: 0 });
  const line = {
    id: "same-id",
    start: 0,
    end: 1,
    jp: "原文",
    kr: "원문",
    jpReading: "げんぶん",
    en: "Original",
    enReading: "Reading",
  };
  const form = new FormData();
  form.set("musicId", "0");
  form.set("sync", "-0.01");
  form.set("lyricJson", JSON.stringify([line]));
  assert.deepEqual(cfg.toPayload(form).lyricJson, [line]);
});


test("object presentation preserves lyric JSON and distinguishes safe links and statuses", () => {
  const lyric = [{ id: "line-0", start: 0, end: 1, jp: "原文", kr: "원문" }];
  const data = {
    musics: [{ id: 0, title: "Song" }],
    novels: [{ id: 1, musicId: 0, music: { title: "Song" }, title: "Novel", translated: false, isPublished: true, bookId: null, book: null, originUrl: "https://example.test/story" }],
    comics: [],
    books: [{ id: 2, name: "Book", novels: [], purchaseLinks: { bookId: 2, kyoboUrl: "https://example.test/book", yes24Url: "javascript:alert(1)", ridiUrl: "https://" } }],
    lyricTracks: [{ musicId: 0, sync: -0.1, lineCount: 1, lyricJson: lyric }],
  } as unknown as AdminDashboardData;
  const novel = getSelectedDocument(data, { type: "novel", id: 1 });
  assert.equal(novel.title, "Novel");
  assert.equal(novel.fields.find(f => f.key === "translated")?.kind, "status");
  assert.equal(novel.fields.find(f => f.key === "originUrl")?.label, "원문 링크");
  assert.equal(novel.fields.find(f => f.key === "originUrl")?.kind, "link");
  assert.equal(novel.fields.find(f => f.key === "book")?.value, "미등록");
  assert(!novel.fields.some(f => f.key === "musicId" || f.key === "bookId"));
  const book = getSelectedDocument(data, { type: "book", id: 2 });
  assert.equal(book.fields.find(f => f.key === "novels")?.value, "연결 없음");
  assert.equal(book.fields.find(f => f.key === "yes24Url")?.kind, "text");
  assert.equal(book.fields.find(f => f.key === "ridiUrl")?.kind, "text");
  assert(!book.fields.some(f => f.key === "bookId"));
  const lyrics = getSelectedDocument(data, { type: "lyric", id: 0 });
  assert.deepEqual(JSON.parse(lyrics.jsonText!), lyric);
});


test("song books include direct and join links through its novels without unrelated books or duplicates", () => {
  const data = {
    musics: [{ id: 0 }, { id: 1 }],
    novels: [{ id: 10, musicId: 0, bookId: 0 }, { id: 20, musicId: 1, bookId: 2 }],
    comics: [], lyricTracks: [],
    books: [
      { id: 0, novels: [{ novel: { id: 10 } }] },
      { id: 1, novels: [{ novel: { id: 10 } }] },
      { id: 2, novels: [{ novel: { id: 20 } }] },
      { id: 3, novels: [] },
    ],
  } as unknown as AdminDashboardData;
  assert.deepEqual(getMusicDocuments(data, 0).books.map(book => book.id), [0, 1]);
  assert.deepEqual(getMusicDocuments(data, 1).books.map(book => book.id), [2]);
});


test("shared sidebar badges stay enabled by default and can be hidden only by the admin", context => {
  // Shared JSX is preserved for app builds; the Node runner needs its classic runtime.
  const originalReact = Reflect.get(globalThis, "React");
  Reflect.set(globalThis, "React", React);
  context.after(() => {
    if (originalReact === undefined) Reflect.deleteProperty(globalThis, "React");
    else Reflect.set(globalThis, "React", originalReact);
  });
  const props: ComponentProps<typeof SongList> = {
    catalog: [{ music: { id: 0, title: "Song", korTitle: "곡", enTitle: "Song" }, hasLyrics: false, publish: false }],
    locale: "ko", layout: { groups: [], ungrouped: [0] }, sort: "release",
    labels: { pending: "STATUS_PENDING", published: "STATUS_PUBLIC", unpublished: "STATUS_PRIVATE", songSort: "정렬", recommendedSort: "추천", albumSort: "앨범", releaseSort: "발매순", songs: "곡", selectSong: "선택" },
    onSort: () => {}, onSelect: () => {}, renderArtwork: () => null,
  };
  const publicHtml = renderToStaticMarkup(createElement(SongList, props));
  assert(publicHtml.includes("STATUS_PENDING"));
  assert(publicHtml.includes("STATUS_PRIVATE"));
  const adminHtml = renderToStaticMarkup(createElement(SongList, { ...props, showBadges: false }));
  assert(!adminHtml.includes("STATUS_PENDING"));
  assert(!adminHtml.includes("STATUS_PRIVATE"));
  assert(adminHtml.includes("Song"));
});
