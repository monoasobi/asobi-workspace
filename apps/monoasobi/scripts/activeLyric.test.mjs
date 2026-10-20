import assert from "node:assert/strict";
import { test } from "node:test";
import { getActiveLineIndex } from "../src/components/common/YouTubeLyricsPlayer/time.ts";

test("shared boundaries use the next lyric at the editor's hundredth-second precision", () => {
  const lines = [
    { start: 35, end: 41.35 },
    { start: 41.35, end: 45 },
  ];
  assert.equal(getActiveLineIndex(lines, 41.04, -0.3), 0);
  assert.equal(getActiveLineIndex(lines, 41.049, -0.3), 1);
  assert.equal(getActiveLineIndex(lines, 41.05, -0.3), 1);
  assert.equal(getActiveLineIndex(lines, 44.7, -0.3), -1);
  assert.equal(getActiveLineIndex([{ start: 0.1, end: 0.2 }], 0.3, 0.2), 0);
  assert.equal(getActiveLineIndex([{ start: 0.1, end: 0.2 }], 0.4, 0.2), -1);
  assert.equal(getActiveLineIndex([{ start: 1, end: 2 }, { start: 3, end: 4 }], 2.5, 0), -1);
  assert.equal(getActiveLineIndex(undefined, 0, 0), -1);
});
