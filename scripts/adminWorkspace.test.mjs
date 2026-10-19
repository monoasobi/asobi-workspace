import assert from "node:assert/strict";
import { test } from "node:test";
import { getMusicDocuments, belongsToMusic, isValidSelectedNode, readSelection } from "../src/app/admin/_components/AdminDashboard/selection.ts";

const data = {
  musics: [{ id: 0 }, { id: 1 }, { id: 2 }],
  novels: [{ id: 10, musicId: 0, bookId: 20 }, { id: 11, musicId: 1, bookId: null }],
  comics: [{ id: 30, musicId: 0 }],
  lyricTracks: [{ musicId: 0 }],
  books: [
    { id: 20, novels: [] },
    { id: 21, novels: [{ novel: { id: 10 } }, { novel: { id: 11 } }] },
    { id: 22, novels: [{ novel: { id: 11 } }] },
  ],
};

test("song workspace includes both direct and anthology book relationships", () => {
  const result = getMusicDocuments(data, 0);
  assert.deepEqual(result.novels.map(({ id }) => id), [10]);
  assert.deepEqual(result.comics.map(({ id }) => id), [30]);
  assert.equal(result.lyric.musicId, 0);
  assert.deepEqual(result.books.map(({ id }) => id), [20, 21]);
  assert.deepEqual(getMusicDocuments(data, 2), { novels: [], comics: [], lyric: undefined, books: [] });
});

test("selection cannot cross songs and viewer cannot open creation forms", () => {
  assert.equal(belongsToMusic({ type: "novel", id: 11 }, data, 0), false);
  assert.equal(belongsToMusic({ type: "lyric", id: 1 }, data, 0), false);
  assert.equal(belongsToMusic({ type: "music", id: 0 }, data, 0), true);
  assert.equal(belongsToMusic({ type: "book", id: 22 }, data, 0), true); // Global book management remains accessible.
  for (const node of [{ type: "newMusic" }, { type: "newBook" }, { type: "newNovel", musicId: 0 }, { type: "newComic", musicId: 0 }, { type: "newLyric", musicId: 2 }]) {
    assert.equal(isValidSelectedNode(node, data, false), false);
  }
  assert.equal(isValidSelectedNode({ type: "newLyric", musicId: 0 }, data, true), false);
  assert.equal(isValidSelectedNode({ type: "newLyric", musicId: 2 }, data, true), true);
});

test("restoring selection handles stale records, other songs and unavailable storage", () => {
  const fallback = { type: "music", id: 0 };
  const restore = () => readSelection("song:0", fallback, data, false, 0);
  for (const value of ["broken", "null", '{"type":"novel","id":999}', '{"type":"novel","id":11}', '{"type":"newMusic"}']) {
    globalThis.sessionStorage = { getItem: () => value };
    assert.deepEqual(restore(), fallback);
  }
  globalThis.sessionStorage = { getItem: () => '{"type":"novel","id":10}' };
  assert.deepEqual(restore(), { type: "novel", id: 10 });
  globalThis.sessionStorage = { getItem: () => { throw new Error("Storage unavailable"); } };
  assert.deepEqual(restore(), fallback);
  delete globalThis.sessionStorage;
});
