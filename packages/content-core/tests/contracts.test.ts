import assert from "node:assert/strict";
import { test } from "node:test";
import { linesSchema } from "../src/catalogLyrics";
import {
  cuePulses,
  guideForStorage,
  parseGuide,
  resizeCue,
  resolveGuide,
  roundTime as roundCallTime,
} from "../src/callGuide";
import { withoutEnglish } from "../src/lyricEnglish";
import { resolveLyricPresentation } from "../src/lyricPresentation";
import { getActiveLineIndex, roundTime } from "../src/lyricTime";
import { projectSidebar } from "../src/sidebarOrder";
import { getAlbumArtSrc, getAlbumArtUrl, isAlbumArtKey } from "../src/albumArt";

test("artwork delivery restricts public keys and bounds CDN variants without changing legacy paths", () => {
  const key = "albumart/0/abc-123.webp";
  const delivery = {
    assetBaseUrl: "https://assets.envifloor.uk/",
    transformImages: true,
  };
  assert.equal(getAlbumArtSrc({ id: 0 }), "/images/albumart/0.webp");
  assert.equal(
    getAlbumArtSrc({ id: 0, albumArtKey: key }),
    `/api/content/${key}`,
  );
  assert.equal(
    getAlbumArtUrl(key, delivery),
    `https://assets.envifloor.uk/${key}`,
  );
  for (const [width, expected] of [
    [72, 200],
    [240, 400],
    [768, 800],
    [10000, 1600],
    [NaN, 200],
  ]) {
    assert.equal(
      getAlbumArtUrl(key, delivery, width),
      `https://assets.envifloor.uk/cdn-cgi/image/width=${expected},fit=scale-down,format=auto,quality=85/${key}`,
    );
  }
  for (const bad of [
    "novel/0.md",
    "albumart/0/../private.webp",
    "https://elsewhere.test/a.webp",
    "albumart/00/abc.webp",
    "albumart/0/a.webp?x=1",
  ]) {
    assert.equal(isAlbumArtKey(bad), false);
    assert.equal(getAlbumArtUrl(bad, delivery, 72), undefined);
  }
  for (const base of [
    "http://assets.envifloor.uk",
    "https://user:pass@example.test",
    "https://example.test/path",
    "https://example.test?x=1",
    "invalid",
  ]) {
    assert.equal(getAlbumArtUrl(key, { assetBaseUrl: base }), undefined);
  }
});

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

test("shared song/settings schemas retain their separate field ownership", async () => {
  const { musicSchema } = await import("../src/music");
  const { musicSettingsSchema } = await import("../src/musicSettings");
  const music = musicSchema.parse({
    title: " 曲 ",
    korTitle: "곡",
    enTitle: "Song",
    youtubeId: "",
    specialPath: "",
    publish: true,
  });
  assert.equal(music.title, "曲");
  assert.equal(music.youtubeId, null);
  assert.equal(music.specialPath, null);
  assert.equal("publish" in music, false);
  const settings = {
    youtubeId: "",
    fanLightColor: null,
    bpm: null,
    publish: false,
    syncOffset: 0,
  };
  assert.equal(musicSettingsSchema.parse(settings).youtubeId, null);
  assert.equal(
    musicSettingsSchema.safeParse({ ...settings, publish: true }).success,
    false,
  );
  assert.equal(
    musicSettingsSchema.safeParse({ ...settings, title: "overwrite" }).success,
    false,
  );
  assert.equal(
    musicSettingsSchema.safeParse({ ...settings, bpm: 401 }).success,
    false,
  );
});

test("clap and singalong discard badge text through read and storage while chant/custom retain content", () => {
  const guide = parseGuide({
    version: 2,
    cues: ["clap", "singalong", "chant", "custom"].map((type, index) => ({
      id: String(index),
      type,
      label: "기존 문구",
      labels: { ko: "한국어", ja: "日本語", en: "English" },
      start: 1,
      end: 3,
      lines: [],
      pulseTimes: [1],
    })),
  });
  const stored = JSON.parse(JSON.stringify(guideForStorage(guide)));
  for (const index of [0, 1]) {
    assert.equal(guide.cues[index].label, "");
    assert.equal(guide.cues[index].labels, undefined);
    assert.equal(Object.hasOwn(stored.cues[index], "label"), false);
    assert.equal(Object.hasOwn(stored.cues[index], "labels"), false);
  }
  for (const index of [2, 3]) {
    assert.equal(stored.cues[index].label, "기존 문구");
    assert.equal(stored.cues[index].labels.ko, "한국어");
  }
  assert.deepEqual(parseGuide(stored), guide);
});

test("16-beat patterns retain subdivisions and repeat after sixteen beats; legacy patterns retain eight", () => {
  const base = {
    id: "pattern",
    type: "clap",
    label: "",
    start: 0,
    end: 33,
    lines: [],
    pulseTimes: [],
  };
  const read = (pattern: unknown) =>
    parseGuide({ version: 2, cues: [{ ...base, pattern }] });
  const legacy = read({ bpm: 60, subdivision: 1, firstOffset: 0, steps: [7] });
  assert.deepEqual(cuePulses(legacy.cues[0]), [7, 15, 23, 31]);
  const extended = read({
    bpm: 60,
    beats: 16,
    subdivision: 4,
    firstOffset: 0,
    steps: [0, 63],
  });
  assert.deepEqual(cuePulses(extended.cues[0]), [0, 15.75, 16, 31.75, 32]);
  assert.deepEqual(resolveGuide(extended, []).issues, {});
  assert.equal(resolveGuide(extended, []).sections[0].clapPattern?.beats, 16);
  assert.ok(
    Object.keys(
      resolveGuide(
        read({
          bpm: 60,
          beats: 8,
          subdivision: 4,
          firstOffset: 0,
          steps: [32],
        }),
        [],
      ).issues,
    ).length,
  );
  assert.throws(() =>
    read({ bpm: 60, beats: 16, subdivision: 4, firstOffset: 0, steps: [64] }),
  );
});
