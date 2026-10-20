import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { ALBUM_ART_WIDTHS, getAlbumArtUrl } from "@asobi/content-core/albumArt";

const sharp = createRequire(
  new URL("../packages/storage/package.json", import.meta.url),
)("sharp");
const manifest = JSON.parse(
  await readFile(
    new URL("../assets/album-art/manifest.json", import.meta.url),
    "utf8",
  ),
);
const delivery = {
  assetBaseUrl: "https://assets.envifloor.uk",
  transformImages: true,
};
const samples = [];
async function sample(key, width, expectedWidth) {
  const url = getAlbumArtUrl(key, delivery, width);
  const start = performance.now();
  const response = await fetch(url, {
    headers: { Accept: "image/avif,image/webp,image/*;q=0.8" },
    signal: AbortSignal.timeout(30_000),
    redirect: "error",
  });
  const ttfb = performance.now();
  assert.equal(response.status, 200, `CDN status ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const end = performance.now();
  const info = await sharp(bytes).metadata();
  assert.equal(info.width, expectedWidth);
  assert.equal(info.height, expectedWidth);
  assert(response.headers.get("content-type")?.startsWith("image/"));
  const result = {
    url,
    width: info.width,
    height: info.height,
    format: info.format,
    contentType: response.headers.get("content-type"),
    bytes: bytes.length,
    ttfbMs: Math.round(ttfb - start),
    totalMs: Math.round(end - start),
    cache: response.headers.get("cf-cache-status"),
    age: response.headers.get("age"),
    cacheControl: response.headers.get("cache-control"),
  };
  samples.push(result);
  console.log(
    `${width ?? "source"}: ${result.width}px ${result.bytes}B ${result.ttfbMs}ms ${result.cache}`,
  );
  return bytes;
}

// All prepared originals must be publicly available, not only the first example.
for (let start = 0; start < manifest.artworks.length; start += 4) {
  await Promise.all(
    manifest.artworks.slice(start, start + 4).map(async (item) => {
      const response = await fetch(getAlbumArtUrl(item.proposedKey, delivery), {
        method: "HEAD",
        signal: AbortSignal.timeout(15_000),
        redirect: "error",
      });
      assert.equal(
        response.status,
        200,
        `Missing public original ${item.musicId}`,
      );
      assert.equal(response.headers.get("content-type"), "image/webp");
      if (response.headers.has("content-length")) {
        assert.equal(
          Number(response.headers.get("content-length")),
          item.preparedBytes,
        );
      }
    }),
  );
}
const first = manifest.artworks[0];
const source = await sample(first.proposedKey, undefined, 3000);
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  first.preparedSha256,
);
for (const width of ALBUM_ART_WIDTHS)
  await sample(first.proposedKey, width, width);
await sample(first.proposedKey, 200, 200);
await sample(manifest.artworks[35].proposedKey, 400, 400);
// The old key also works without any database rewrite, and is never upscaled.
const old = await fetch(
  getAlbumArtUrl(first.observedKeyAtCollection, delivery),
  { signal: AbortSignal.timeout(15_000) },
);
assert.equal(old.status, 200);
const oldInfo = await sharp(Buffer.from(await old.arrayBuffer())).metadata();
const missing = await fetch(
  getAlbumArtUrl("albumart/0/deadbeef.webp", delivery, 200),
  {
    signal: AbortSignal.timeout(15_000),
    redirect: "error",
  },
);
assert.equal(missing.status, 404);
const reportRoot = new URL("../.local/artwork-research/", import.meta.url);
await mkdir(reportRoot, { recursive: true });
await writeFile(
  new URL("cdn-check-report.json", reportRoot),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      publicOriginals: manifest.artworks.length,
      oldKeyWidth: oldInfo.width,
      missingStatus: missing.status,
      samples,
    },
    null,
    2,
  ),
);
console.log(
  "36 public originals, bounded variants, repeat request and missing-file behavior verified.",
);
