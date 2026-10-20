import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { localCheckClient } from "./local-check-client.mjs";

let adminCookie;
const { call, login, expectedDatabase } = localCheckClient(() => adminCookie);
const db = new DatabaseSync(expectedDatabase, { readOnly: true });
const skipLoudHttp = process.argv.includes("--skip-loud-http");
const row = (table, column = "music_id") =>
  db.prepare(`SELECT * FROM ${table} WHERE ${column} = ?`).get(0);
const snapshot = () => ({
  music: row("musics", "id"),
  settings: row("loudasobi_music_settings"),
  lyric: row("lyric_tracks"),
  guide: row("loudasobi_call_guides"),
});
const before = snapshot();
assert.ok(
  before.music && before.settings && before.lyric,
  "Requires the synthetic phase-1 song ID 0",
);
const common = {
  title: before.music.title,
  korTitle: before.music.kor_title,
  enTitle: before.music.en_title,
  youtubeId: before.music.youtube_id ?? "",
  specialPath: before.music.special_path ?? "",
};
const settings = {
  youtubeId: before.settings.youtube_id ?? "",
  fanLightColor: before.settings.fan_light_color,
  bpm: before.settings.bpm,
  publish: Boolean(before.settings.publish),
  syncOffset: before.settings.sync_offset,
};
function refreshResult(data, expectedTargets = ["monoasobi"]) {
  assert.ok(Array.isArray(data.refresh));
  assert.deepEqual(data.refresh.map((result) => result.target), expectedTargets);
  for (const result of data.refresh)
    assert.equal(
      result.ok,
      true,
      `Unexpected refresh result: ${result.target}`,
    );
}

try {
  assert.equal((await call("/api/admin/musics", { cookie: "" })).status, 401);
  assert.equal(
    new URL((await call("/musics/0", { cookie: "" })).response.url).pathname,
    "/login",
  );
  assert.equal(
    (
      await call("/api/admin/musics/0", {
        method: "PUT",
        cookie: "",
        body: common,
      })
    ).status,
    401,
  );
  const viewer = await login("ADMIN_VIEWER_PASSWORDS");
  assert.equal(
    (
      await call("/api/admin/musics/0", {
        method: "PUT",
        cookie: viewer,
        body: common,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/settings", {
        method: "PUT",
        cookie: viewer,
        body: settings,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/album-art", {
        method: "PUT",
        cookie: viewer,
        body: new Uint8Array([1]),
      })
    ).status,
    403,
  );
  adminCookie = await login("ADMIN_PASSWORD");
  assert.equal(
    (
      await call("/api/admin/refresh", {
        method: "POST",
        cookie: viewer,
        body: { scope: "shared" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/api/admin/refresh", {
        method: "POST",
        body: { scope: "arbitrary" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0", {
        method: "PUT",
        origin: "https://elsewhere.invalid",
        body: common,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0", {
        method: "PUT",
        body: { ...common, title: "" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/settings", {
        method: "PUT",
        body: { ...settings, title: "overwrite" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/settings", {
        method: "PUT",
        body: { ...settings, bpm: 401 },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/album-art", {
        method: "PUT",
        body: new Uint8Array(3 * 1024 * 1024 + 1),
      })
    ).status,
    413,
  );
  assert.equal(
    (
      await call("/api/admin/musics/0/album-art", {
        method: "PUT",
        body: new Uint8Array([1, 2, 3]),
      })
    ).status,
    400,
  );
  assert.deepEqual(
    snapshot(),
    before,
    "Rejected requests must not modify data",
  );
  // Compile public refresh routes before measuring the bounded save notifications.
  for (const target of ["MONOASOBI"]) {
    const url = new URL(
      "/api/internal/revalidate",
      process.env[target + "_URL"],
    );
    const request = (body) =>
      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env[target + "_REVALIDATION_SECRET"]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
    assert.equal(
      (
        await fetch(url, {
          method: "POST",
          body: "{}",
          signal: AbortSignal.timeout(60000),
        })
      ).status,
      401,
    );
    assert.equal(
      (await request({ scope: "arbitrary-path", path: "/admin" })).status,
      400,
    );
    assert.equal(
      (await fetch(url, {
        method: "POST",
        headers: { Authorization: "Bearer invalid-local-check", "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "catalog" }),
        signal: AbortSignal.timeout(60000),
      })).status,
      401,
    );
    assert.equal((await request({ scope: "catalog" })).status, 200);
  }
  const retry = await call("/api/admin/refresh", {
    method: "POST",
    body: { scope: "shared" },
  });
  assert.equal(retry.status, 200);
  refreshResult(retry.data);
  const marker = "LOCAL-CHECK-" + Date.now();
  let result = await call("/api/admin/musics/0", {
    method: "PUT",
    body: { ...common, korTitle: marker },
  });
  assert.equal(result.status, 200);
  refreshResult(result.data);
  const afterCommon = snapshot();
  assert.equal(afterCommon.music.kor_title, marker);
  assert.equal(afterCommon.music.album_art_key, before.music.album_art_key);
  for (const key of ["settings", "lyric", "guide"])
    assert.deepEqual(
      afterCommon[key],
      before[key],
      `Common save changed ${key}`,
    );
  for (const target of [
    "MONOASOBI",
    ...(skipLoudHttp ? [] : ["LOUDASOBI"]),
  ]) {
    const response = await fetch(process.env[target + "_URL"], {
      cache: "no-store",
      signal: AbortSignal.timeout(60000),
    });
    assert.equal(response.status, 200);
    assert.ok(
      (await response.text()).includes(marker),
      `${target} public page did not reflect saved title`,
    );
  }
  result = await call("/api/admin/musics/0/settings", {
    method: "PUT",
    body: { ...settings, bpm: 137, syncOffset: 0.25 },
  });
  assert.equal(result.status, 200);
  refreshResult(result.data, []);
  const afterSettings = snapshot();
  assert.equal(afterSettings.settings.bpm, 137);
  assert.equal(afterSettings.settings.sync_offset, 0.25);
  for (const key of ["music", "lyric", "guide"])
    assert.deepEqual(
      afterSettings[key],
      afterCommon[key],
      `Settings save changed ${key}`,
    );
  const detail = await call("/api/admin/musics/0");
  assert.equal(detail.status, 200);
  assert.equal(detail.data.music.id, 0);
  assert.ok(detail.response.headers.get("cache-control").includes("no-store"));
  assert.equal((await call("/musics/0")).status, 200);
  console.log(
    skipLoudHttp
      ? "Local flow passed: Mono cache invalidation succeeds without contacting LOUDASOBI; source/guide data preserved."
      : "Local flow passed: auth/roles/origin/validation, separate section saves, data preservation and both public pages reflect updates.",
  );
} finally {
  if (adminCookie) {
    const restoredCommon = await call("/api/admin/musics/0", {
      method: "PUT",
      body: common,
    });
    const restoredSettings = await call("/api/admin/musics/0/settings", {
      method: "PUT",
      body: settings,
    });
    assert.equal(
      restoredCommon.status,
      200,
      "Failed to restore local song fields",
    );
    assert.equal(
      restoredSettings.status,
      200,
      "Failed to restore local settings",
    );
    const after = snapshot();
    for (const key of ["lyric", "guide"])
      assert.deepEqual(after[key], before[key]);
    for (const key of Object.keys(before.music).filter(
      (key) => key !== "updated_at",
    ))
      assert.deepEqual(after.music[key], before.music[key]);
    for (const key of Object.keys(before.settings).filter(
      (key) => key !== "updated_at",
    ))
      assert.deepEqual(after.settings[key], before.settings[key]);
  }
  db.close();
}
