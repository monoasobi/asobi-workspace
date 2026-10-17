import assert from "node:assert/strict";
import { test } from "node:test";
import { snapTimelineDelta } from "../src/app/admin/_components/lyric-timeline/LyricTimelineEditor/timelineSnap.ts";

test("playhead snapping respects zoom, modifiers, bounds and the closest edge", () => {
  const snap = (delta, disabled = false, scale = 100) =>
    snapTimelineDelta(delta, [1, 2], 3, scale, -1, 5, disabled);
  assert.equal(snap(0.94), 1); // End edge reaches the playhead.
  assert.equal(snap(1.94), 2); // Start edge reaches the playhead.
  assert.equal(snap(0.94, true), 0.94); // Cmd/Ctrl bypasses snapping.
  assert.equal(snap(0.94, false, 200), 0.94); // Beyond 8px after zooming.
  assert.equal(snap(0.8), 0.8);
  assert.equal(snapTimelineDelta(0.94, [2], 3, 100, -1, 0.98), 0.94);
  assert.equal(snapTimelineDelta(7, [2], 3, 100, -1, 5), 5);
  assert.equal(snapTimelineDelta(0.06, [2.9, 2.94], 3, 100, -1, 5), 0.06);
  // Convert display time to lyric time when sync is nonzero.
  assert.equal(snapTimelineDelta(0.94, [2], 3.5 - 0.5, 100, -1, 5), 1);
});
