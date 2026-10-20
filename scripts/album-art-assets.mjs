// Source-preserving collection; never uploads files or changes the music database.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
// Use the existing storage package's pinned Sharp, independent of Next's copy.
const sharp = createRequire(
  new URL("../packages/storage/package.json", import.meta.url),
)("sharp");

const root = new URL("../assets/album-art/", import.meta.url);
const manifestUrl = new URL("manifest.json", root);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
const download = process.argv.includes("--download");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const seen = new Set();

for (const item of manifest.artworks) {
  assert(Number.isSafeInteger(item.musicId) && item.musicId >= 0);
  assert(!seen.has(item.musicId), "Duplicate music ID");
  seen.add(item.musicId);
  assert.equal(item.original, `originals/${item.musicId}.jpg`);
  const url = new URL(item.sourceUrl);
  assert(url.protocol === "https:" && url.hostname.endsWith(".mzstatic.com"));
  const originalUrl = new URL(item.original, root);
  let original;
  try {
    original = await readFile(originalUrl);
  } catch (error) {
    if (!download || error.code !== "ENOENT") throw error;
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    assert(response.ok, `Download failed: ${item.musicId} ${response.status}`);
    original = Buffer.from(await response.arrayBuffer());
    assert(original.length <= 10 * 1024 * 1024, "Unexpected source file size");
    // Validate before retaining the downloaded file. No upscaling is performed.
    const info = await sharp(original, {
      limitInputPixels: 40_000_000,
    }).metadata();
    assert(info.format === "jpeg" && info.width > 200 && info.height > 200);
    await mkdir(new URL("originals/", root), { recursive: true });
    await writeFile(originalUrl, original, { flag: "wx" });
  }
  const info = await sharp(original, {
    limitInputPixels: 40_000_000,
  }).metadata();
  assert(info.width > 200 && info.height > 200);
  const digest = hash(original);
  if (!download) assert.equal(digest, item.originalSha256);
  let webp, quality;
  for (quality of [90, 80, 70, 60, 50]) {
    webp = await sharp(original, { limitInputPixels: 40_000_000 })
      .rotate()
      .webp({ quality })
      .toBuffer();
    if (webp.length <= 3 * 1024 * 1024) break;
  }
  assert(
    webp.length <= 3 * 1024 * 1024,
    "Prepared artwork exceeds upload limit",
  );
  const key = `albumart/${item.musicId}/${hash(webp).slice(0, 32)}.webp`;
  const prepared = `prepared/${key}`;
  if (download) {
    await mkdir(new URL(`prepared/albumart/${item.musicId}/`, root), {
      recursive: true,
    });
    await writeFile(new URL(prepared, root), webp);
    Object.assign(item, {
      width: info.width,
      height: info.height,
      originalBytes: original.length,
      originalSha256: digest,
      prepared,
      proposedKey: key,
      preparedBytes: webp.length,
      preparedSha256: hash(webp),
      quality,
    });
    await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
  } else {
    const bytes = await readFile(new URL(item.prepared, root));
    assert.equal(hash(bytes), item.preparedSha256);
    assert.equal(item.proposedKey, key);
    assert.equal(bytes.length, item.preparedBytes);
    assert.equal(original.length, item.originalBytes);
    assert.equal(info.width, item.width);
    assert.equal(info.height, item.height);
  }
  console.log(
    `${item.musicId}: ${item.title} — ${info.width}×${info.height}, ${webp.length} bytes`,
  );
}
console.log(
  `${manifest.artworks.length} artworks ${download ? "collected" : "verified"}: ${fileURLToPath(root)}`,
);
