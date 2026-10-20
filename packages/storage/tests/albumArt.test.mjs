import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { normalizeAlbumArt } from "../src/albumArt.ts";
import { getAlbumArtBucketName } from "../src/index.ts";

test("artwork bucket cannot expose the private contents bucket", () => {
  const keys = [
    "R2_BUCKET_NAME",
    "R2_ALBUM_ART_BUCKET_NAME",
    "NEXT_PUBLIC_ASSET_BASE_URL",
  ];
  const saved = keys.map((key) => process.env[key]);
  try {
    for (const key of keys) delete process.env[key];
    assert.equal(getAlbumArtBucketName(), "monoasobi-contents");
    process.env.NEXT_PUBLIC_ASSET_BASE_URL = "https://assets.envifloor.uk";
    assert.throws(getAlbumArtBucketName);
    process.env.R2_ALBUM_ART_BUCKET_NAME = "monoasobi-contents";
    assert.throws(getAlbumArtBucketName);
    process.env.R2_ALBUM_ART_BUCKET_NAME = "asobi-artwork-validation";
    assert.equal(getAlbumArtBucketName(), "asobi-artwork-validation");
  } finally {
    keys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
  }
});

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

test("high-resolution input keeps its pixels within the existing limits", async () => {
  const input = await sharp({
    create: { width: 3000, height: 1500, channels: 3, background: "#123456" },
  })
    .jpeg()
    .toBuffer();
  const metadata = await sharp(await normalizeAlbumArt(input)).metadata();
  assert.equal(metadata.width, 3000);
  assert.equal(metadata.height, 1500);
  const oversizedPixels = await sharp({
    create: { width: 7000, height: 6000, channels: 3, background: "white" },
  })
    .jpeg()
    .toBuffer();
  await assert.rejects(() => normalizeAlbumArt(oversizedPixels));
});

test("unified admin accepts valid source and encoded artwork above 3MiB", async () => {
  const { randomBytes } = await import("node:crypto");
  const input = await sharp(randomBytes(2400 * 2400 * 3), {
    raw: { width: 2400, height: 2400, channels: 3 },
  }).png().toBuffer();
  assert(input.byteLength > 3 * 1024 * 1024);
  await assert.rejects(() => normalizeAlbumArt(input));
  const output = await normalizeAlbumArt(input, { maxBytes: Infinity });
  const metadata = await sharp(output).metadata();
  assert(output.byteLength > 3 * 1024 * 1024);
  assert.equal(metadata.width, 2400);
  assert.equal(metadata.height, 2400);
  await assert.rejects(() => normalizeAlbumArt(Buffer.from("invalid"), { maxBytes: Infinity }));
});
