import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { normalizeAlbumArt } from "../src/albumArt.ts";

test("album artwork preserves aspect ratio and rejects unsupported or oversized input", async () => {
  const source = await sharp({
    create: { width: 200, height: 100, channels: 3, background: "#F2285A" },
  })
    .png()
    .toBuffer();
  const output = await normalizeAlbumArt(source);
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 200);
  assert.equal(metadata.height, 100);
  await assert.rejects(() =>
    normalizeAlbumArt(Buffer.alloc(3 * 1024 * 1024 + 1)),
  );
  await assert.rejects(() => normalizeAlbumArt(Buffer.from("invalid image")));
  const gif = await sharp({
    create: { width: 1, height: 1, channels: 3, background: "white" },
  })
    .gif()
    .toBuffer();
  await assert.rejects(() => normalizeAlbumArt(gif));
});
