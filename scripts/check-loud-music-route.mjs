import assert from "node:assert/strict";
import { musicIdFromPath, musicPath } from "../apps/loudasobi/src/lib/musicRoute.ts";

for (const id of [0, 1, 29, Number.MAX_SAFE_INTEGER]) {
  assert.equal(musicIdFromPath(musicPath(id)), id);
}
assert.equal(musicIdFromPath("/musics/29/"), 29);
for (const path of [
  "/",
  "/admin/musics/29",
  "/musics/-1",
  "/musics/01",
  "/musics/1.5",
  "/musics/abc",
  "/musics/1/extra",
  "/musics/9007199254740992",
]) {
  assert.equal(musicIdFromPath(path), null, path);
}
console.log("LOUDASOBI music URL parsing passed");
