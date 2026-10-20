import assert from "node:assert/strict";
import { test } from "node:test";
import { linesSchema } from "../src/catalogLyrics";
import {
  cuePulses,
  parseGuide,
  resizeCue,
  resolveGuide,
  roundTime as roundCallTime,
} from "../src/callGuide";
import { withoutEnglish } from "../src/lyricEnglish";
import { resolveLyricPresentation } from "../src/lyricPresentation";
import { getActiveLineIndex, roundTime } from "../src/lyricTime";
import { projectSidebar } from "../src/sidebarOrder";

test("extracted contracts preserve timing precision, source validation and references", () => {
  const line = {
    id: "line-0",
    start: 1,
    end: 5,
    jp: "原文",
    kr: "원문",
    jpReading: "겐분",
    en: "Source",
    enReading: "genbun",
  };
  assert.equal(roundTime(1.23456), 1.23);
  assert.equal(roundCallTime(1.23456), 1.2346);
  assert.equal(
    getActiveLineIndex(
      [
        { start: 35, end: 41.35 },
        { start: 41.35, end: 45 },
      ],
      41.049,
      -0.3,
    ),
    1,
  );
  assert.equal(
    linesSchema.safeParse([line, { ...line, id: "line-1", start: 4 }]).success,
    false,
  );
  assert.deepEqual(withoutEnglish(line), {
    id: "line-0",
    start: 1,
    end: 5,
    jp: "原文",
    kr: "원문",
    jpReading: "겐분",
  });
  assert.equal(line.en, "Source");
  const guide = parseGuide({
    version: 2,
    cues: [
      {
        id: "clap-0",
        type: "clap",
        label: "",
        start: 1,
        end: 5,
        lines: [{ id: line.id, jp: line.jp, start: line.start, end: line.end }],
        pulseTimes: [1, 2, 3, 4],
      },
    ],
  });
  assert.deepEqual(cuePulses(guide.cues[0]), [1, 2, 3, 4]);
  assert.deepEqual(
    cuePulses(resizeCue(guide.cues[0], "end", 4.01)),
    [1, 2, 3, 4],
  );
  assert.deepEqual(resolveGuide(guide, [line]).issues, {});
  assert.deepEqual(resolveLyricPresentation(guide, [line], 0).issues, {});
  const original = {
    groups: [
      { id: "group-0", name: { ko: "그룹", ja: "", en: "" }, musicIds: [0, 9] },
    ],
    ungrouped: [],
  };
  const projected = projectSidebar(original, [0, 1]);
  assert.deepEqual(projected.groups[0].musicIds, [0]);
  assert.deepEqual(projected.ungrouped, [1]);
  assert.deepEqual(original.groups[0].musicIds, [0, 9]);
});
