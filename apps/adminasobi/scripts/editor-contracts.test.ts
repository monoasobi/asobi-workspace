import { guideSaveInput } from "../src/components/editors/CallGuideEditor/guideSaveInput";
import assert from "node:assert/strict";
import { test } from "node:test";
import { editorCommand } from "../src/components/editors/shared/editorKeys";
import {
  updateHistory,
  undoHistory,
  redoHistory,
  type EditorHistory,
} from "../src/components/editors/shared/useEditorHistory";
import { restoreHistoryDelta } from "../src/components/NavigationGuard/history";
import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import { snapTimelineDelta } from "../src/components/editors/lyric-timeline/LyricTimelineEditor/timelineSnap";

test("shared commands respect IME, modifiers and native text undo", () => {
  const key = (key: string, patch = {}, text = false) =>
    editorCommand(
      {
        key,
        code: key === " " ? "Space" : key,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        isComposing: false,
        ...patch,
      },
      text,
    );
  assert.equal(key(" "), "toggle");
  assert.equal(key(" ", { isComposing: true }), null);
  for (const arrow of ["ArrowLeft", "ArrowUp"])
    assert.equal(key(arrow), "backward");
  for (const arrow of ["ArrowRight", "ArrowDown"])
    assert.equal(key(arrow), "forward");
  assert.equal(key("ArrowLeft", { metaKey: true }), null);
  assert.equal(key("z", { ctrlKey: true }), "undo");
  assert.equal(key("z", { metaKey: true, shiftKey: true }), "redo");
  assert.equal(key("z", { metaKey: true }, true), null);
  assert.equal(key("s", { ctrlKey: true }, true), "save");
  assert.equal(key(" ", {}, true), null);
  assert.equal(key("+", { ctrlKey: true }), "zoomIn");
});

test("Loud history also preserves lyric sync, IDs and English through undo/redo", () => {
  const initial = {
    sync: 0,
    lines: [{ id: "line-0", en: "Source", enReading: "reading" }],
  };
  let history: EditorHistory<typeof initial> = {
    past: [],
    present: initial,
    future: [],
  };
  history = updateHistory(history, { ...initial, sync: 0.1 });
  const changed = history.present;
  history = undoHistory(history);
  assert.deepEqual(history.present, initial);
  history = redoHistory(history);
  assert.deepEqual(history.present, changed);
  assert.equal(updateHistory(history, { ...changed }), history);
  history = undoHistory(history);
  history = updateHistory(history, { ...initial, sync: 0.2 });
  assert.equal(history.future.length, 0);
  for (let i = 1; i <= 120; i++)
    history = updateHistory(history, { ...initial, sync: i });
  assert.equal(history.past.length, 100);
  assert.equal(history.present.lines[0].id, "line-0");
});

test("lyric validation and playhead snapping retain Mono's existing contract", () => {
  const line = {
    id: "line-0",
    start: 1,
    end: 3,
    jp: "原文",
    kr: "원문",
    jpReading: "겐분",
    en: "Source",
    enReading: "reading",
  };
  const track = { musicId: 0, sync: -0.1, lyricJson: [line] };
  assert.equal(lyricTrackSchema.parse(track).lyricJson[0].enReading, "reading");
  assert.equal(
    lyricTrackSchema.safeParse({ ...track, lyricJson: [line, line] }).success,
    false,
  );
  assert.equal(
    lyricTrackSchema.safeParse({
      ...track,
      lyricJson: [line, { ...line, id: "line-1", start: 2 }],
    }).success,
    true,
  );
  assert.equal(snapTimelineDelta(0.94, [1, 2], 3, 100, -1, 5), 1);
  assert.equal(snapTimelineDelta(0.94, [1, 2], 3, 100, -1, 5, true), 0.94);
  assert.equal(restoreHistoryDelta(4, 2), 2);
  assert.equal(restoreHistoryDelta(2, 4), -2);
});

test("call saves advance metadata only; source edits retain the conflicting revision", () => {
  const saved = {
    revision: "old",
    sourceRevision: "source-1",
    syncOffset: 0,
    guide: { version: 2 as const, cues: [] },
  };
  const latest = { ...saved, revision: "latest", syncOffset: 0.2 };
  assert.deepEqual(guideSaveInput(saved, latest, 0, 0), {
    revision: "latest",
    syncOffset: 0.2,
  });
  assert.deepEqual(guideSaveInput(saved, latest, 0.1, 0.1), {
    revision: "latest",
    syncOffset: 0.1,
  });
  assert.equal(
    guideSaveInput(saved, { ...latest, sourceRevision: "source-2" }, 0, 0)
      .revision,
    "old",
  );
});
