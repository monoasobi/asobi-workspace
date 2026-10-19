import assert from "node:assert/strict";
import { test } from "node:test";
import { lockPlayerLandscape, requestPlayerFullscreen } from "../src/components/common/VideoPlayer/usePlayerFullscreen.ts";

test("fullscreen targets the wrapper and falls back for unavailable or rejected requests", async () => {
  const wrapper = {
    ownerDocument: { fullscreenEnabled: true },
    async requestFullscreen() { assert.equal(this, wrapper); },
  };
  assert.equal(await requestPlayerFullscreen(wrapper), true);
  assert.equal(await requestPlayerFullscreen({ ownerDocument: {} }), false);
  assert.equal(await requestPlayerFullscreen({
    ownerDocument: { fullscreenEnabled: false },
    requestFullscreen() { assert.fail("Disabled fullscreen must not be requested"); },
  }), false);
  assert.equal(await requestPlayerFullscreen({
    ownerDocument: { fullscreenEnabled: true },
    async requestFullscreen() { throw new Error("Permission denied"); },
  }), false);
});

test("landscape is requested and closing fullscreen releases a pending lock", async () => {
  const calls = [];
  let finishLock;
  const orientation = {
    lock(value) {
      assert.equal(this, orientation);
      calls.push(value);
      return new Promise(resolve => { finishLock = resolve; });
    },
    unlock() { calls.push("unlock"); finishLock(); },
  };
  const release = lockPlayerLandscape(orientation);
  assert.deepEqual(calls, ["landscape"]);
  release();
  await Promise.resolve();
  assert.deepEqual(calls, ["landscape", "unlock"]);
});

test("unsupported or denied orientation locking does not interrupt fullscreen", async () => {
  assert.equal(lockPlayerLandscape(), undefined);
  assert.equal(lockPlayerLandscape({}), undefined);
  const release = lockPlayerLandscape({
    async lock() { throw new Error("Not supported"); },
    unlock() { throw new Error("Not supported"); },
  });
  await Promise.resolve();
  assert.doesNotThrow(release);
});
