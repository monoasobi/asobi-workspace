import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { localCheckClient } from "./local-check-client.mjs";

let cookie;
const { call, login, expectedDatabase } = localCheckClient(() => cookie);
const db = new DatabaseSync(expectedDatabase);
// This script writes only the explicitly disposable phase-1 fixture, never a clone of real content.
assert.equal(db.prepare("SELECT COUNT(*) AS n FROM musics").get().n, 1);
assert.equal(
  db.prepare("SELECT title FROM musics WHERE id=0").get()?.title,
  "ローカル確認",
);
const snapshot = () => ({
  music: db.prepare("SELECT * FROM musics WHERE id=0").get(),
  settings: db
    .prepare("SELECT * FROM loudasobi_music_settings WHERE music_id=0")
    .get(),
  lyric: db.prepare("SELECT * FROM lyric_tracks WHERE music_id=0").get(),
  guide: db
    .prepare("SELECT * FROM loudasobi_call_guides WHERE music_id=0")
    .get(),
});
const before = snapshot();
assert(before.lyric && before.settings);
const path = (kind) => `/api/admin/musics/0/${kind}`;
const get = async (kind) => {
  const result = await call(path(kind));
  assert.equal(result.status, 200);
  assert.equal(
    result.response.headers.get("cache-control"),
    "private, no-store",
  );
  return result.data.document;
};
try {
  for (const kind of ["lyrics", "guide"]) {
    assert.equal((await call(path(kind), { cookie: "" })).status, 401);
    assert.equal(
      (await call(path(kind), { method: "PUT", cookie: "", body: {} })).status,
      401,
    );
  }
  const viewer = await login("ADMIN_VIEWER_PASSWORDS");
  for (const kind of ["lyrics", "guide"])
    assert.equal(
      (await call(path(kind), { method: "PUT", cookie: viewer, body: {} }))
        .status,
      403,
    );
  cookie = await login("ADMIN_PASSWORD");
  for (const kind of ["lyrics", "guide"]) {
    assert.equal(
      (
        await call(path(kind), {
          method: "PUT",
          origin: "https://elsewhere.invalid",
          body: {},
        })
      ).status,
      403,
    );
    assert.equal(
      (await call(path(kind), { method: "PUT", body: {} })).status,
      400,
    );
  }
  assert.equal((await call("/api/admin/musics/0.5/guide")).status, 400);
  assert.equal((await call("/api/admin/musics/999999/lyrics")).status, 404);
  const lyrics = await get("lyrics"),
    guide = await get("guide");
  const lyricInput = {
    revision: lyrics.revision,
    lyricTrack: structuredClone(lyrics.lyricTrack),
  };
  lyricInput.lyricTrack.lyricJson[0].en = "Local editor verification";
  lyricInput.lyricTrack.lyricJson[0].enReading = "Local reading";
  let result = await call(path("lyrics"), { method: "PUT", body: lyricInput });
  assert.equal(result.status, 200);
  assert.equal(
    result.data.document.lyricTrack.lyricJson[0].id,
    lyrics.lyricTrack.lyricJson[0].id,
  );
  assert.equal(
    result.data.document.lyricTrack.lyricJson[0].enReading,
    "Local reading",
  );
  assert.deepEqual(snapshot().music, before.music);
  assert.deepEqual(snapshot().guide, before.guide);
  assert.deepEqual(snapshot().settings, before.settings);
  assert.equal(
    (await call(path("lyrics"), { method: "PUT", body: lyricInput })).status,
    409,
  );
  assert.equal(
    (
      await call(path("guide"), {
        method: "PUT",
        body: {
          revision: guide.revision,
          guide: guide.guide,
          syncOffset: guide.syncOffset,
        },
      })
    ).status,
    409,
  );
  const latestGuide = await get("guide");
  const guideInput = {
    revision: latestGuide.revision,
    guide: {
      ...latestGuide.guide,
      songGuide: { ko: "로컬 저장 검증", ja: "", en: "" },
    },
    syncOffset: latestGuide.syncOffset + 0.01,
  };
  const savedLyric = snapshot().lyric;
  result = await call(path("guide"), { method: "PUT", body: guideInput });
  assert.equal(result.status, 200);
  assert.equal(result.data.document.syncOffset, guideInput.syncOffset);
  assert.deepEqual(snapshot().lyric, savedLyric);
  assert.deepEqual(snapshot().music, before.music);
  assert.equal(
    (await call(path("guide"), { method: "PUT", body: guideInput })).status,
    409,
  );
  // Source edits invalidate references but never silently rewrite the call document.
  const latestLyrics = await get("lyrics"),
    latest = await get("guide");
  const first = latestLyrics.lyricTrack.lyricJson[0];
  const anchored = {
    ...latest.guide,
    guides: [
      {
        id: "local-anchor",
        beforeLineId: first.id,
        labels: { ko: "가사 앞 안내", ja: "", en: "" },
      },
    ],
  };
  assert.equal(
    (
      await call(path("guide"), {
        method: "PUT",
        body: { revision: latest.revision, guide: anchored },
      })
    ).status,
    200,
  );
  const savedGuide = snapshot().guide;
  const removed = { ...latestLyrics.lyricTrack, lyricJson: [] };
  result = await call(path("lyrics"), {
    method: "PUT",
    body: { revision: latestLyrics.revision, lyricTrack: removed },
  });
  assert.equal(result.status, 200);
  assert(Object.keys(result.data.guideIssues).length > 0);
  assert.deepEqual(snapshot().guide, savedGuide);
  for (const kind of ["lyrics", "calls"])
    assert.equal((await call(`/musics/0/${kind}`)).status, 200);
  console.log(
    "Editor HTTP checks passed: auth, roles, Origin, revisions, IDs/English, field ownership and stale-reference reporting.",
  );
} finally {
  // Exact restoration of this disposable fixture, including timestamps and absent guide rows.
  db.exec("BEGIN");
  db.prepare(
    "UPDATE lyric_tracks SET sync=?, lyric_json=?, updated_at=? WHERE music_id=0",
  ).run(before.lyric.sync, before.lyric.lyric_json, before.lyric.updated_at);
  db.prepare(
    "UPDATE loudasobi_music_settings SET sync_offset=?, updated_at=? WHERE music_id=0",
  ).run(before.settings.sync_offset, before.settings.updated_at);
  if (before.guide)
    db.prepare(
      "INSERT OR REPLACE INTO loudasobi_call_guides (music_id, guide_json, created_at, updated_at) VALUES (0,?,?,?)",
    ).run(
      before.guide.guide_json,
      before.guide.created_at,
      before.guide.updated_at,
    );
  else db.prepare("DELETE FROM loudasobi_call_guides WHERE music_id=0").run();
  db.exec("COMMIT");
  assert.deepEqual(snapshot(), before);
  if (cookie)
    await call("/api/admin/refresh", {
      method: "POST",
      body: { scope: "shared" },
    });
  db.close();
  console.log("Synthetic lyric/call/settings fixture restored exactly.");
}
