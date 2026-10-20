// Explicit R2-only operation: no DB writes, no deletions, no bucket-wide sync.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  getAlbumArtBucketName,
  getR2Object,
  putR2Object,
} from "@asobi/storage";
import { isAlbumArtKey } from "@asobi/content-core/albumArt";

const root = new URL("../assets/album-art/", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("manifest.json", root), "utf8"),
);
const apply = process.argv.includes("--apply");
const verify = process.argv.includes("--verify");
const target = getAlbumArtBucketName();
const source = process.env.R2_BUCKET_NAME || "monoasobi-contents";
assert(
  process.env.R2_ALBUM_ART_BUCKET_NAME && target !== source,
  "Separate explicit artwork bucket required",
);
assert(!(apply && verify), "Choose apply or verify");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const report = [];

async function checkOrPut(key, bytes, musicId, kind) {
  assert(isAlbumArtKey(key) && key.startsWith(`albumart/${musicId}/`));
  assert(bytes.length <= 3 * 1024 * 1024);
  const digest = sha256(bytes);
  let object = await getR2Object(key, target);
  if (!object && apply) {
    await putR2Object(key, bytes, "image/webp", target);
    object = await getR2Object(key, target);
  }
  assert(object?.Body, `Missing target: ${key}`);
  const remote = await object.Body.transformToByteArray();
  assert.equal(remote.byteLength, bytes.byteLength, `Byte mismatch: ${key}`);
  assert.equal(
    sha256(remote),
    digest,
    `Hash mismatch (never overwrite): ${key}`,
  );
  assert.equal(object.ContentType, "image/webp");
  report.push({ musicId, kind, key, bytes: bytes.length, sha256: digest });
  console.log(`${musicId}: ${kind} verified`);
}

async function main() {
  console.log(
    `${manifest.artworks.length} current-cover copies + ${manifest.artworks.length} high-resolution files; target ${target}`,
  );
  if (!apply && !verify) {
    console.log(
      "Plan only. --apply copies/uploads; --verify compares remote bytes. Neither changes DB keys or deletes files.",
    );
    return;
  }
  for (let start = 0; start < manifest.artworks.length; start += 4) {
    await Promise.all(
      manifest.artworks.slice(start, start + 4).map(async (item) => {
        const oldKey = item.observedKeyAtCollection;
        assert(
          isAlbumArtKey(oldKey) &&
            oldKey.startsWith(`albumart/${item.musicId}/`),
        );
        const old = await getR2Object(oldKey, source);
        assert(
          old?.Body && old.ContentType === "image/webp",
          `Missing source: ${item.musicId}`,
        );
        await checkOrPut(
          oldKey,
          await old.Body.transformToByteArray(),
          item.musicId,
          "existing-key",
        );
        assert.equal(item.prepared, `prepared/${item.proposedKey}`);
        const bytes = await readFile(new URL(item.prepared, root));
        assert.equal(sha256(bytes), item.preparedSha256);
        await checkOrPut(
          item.proposedKey,
          bytes,
          item.musicId,
          "high-resolution",
        );
      }),
    );
  }
  const reportRoot = new URL("../.local/artwork-research/", import.meta.url);
  await mkdir(reportRoot, { recursive: true });
  await writeFile(
    new URL("r2-publish-report.json", reportRoot),
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        sourceBucket: source,
        targetBucket: target,
        objects: report.sort(
          (a, b) => a.musicId - b.musicId || a.kind.localeCompare(b.kind),
        ),
      },
      null,
      2,
    ),
  );
  console.log(
    `${report.length} objects verified. DB and existing files unchanged.`,
  );
}

main().catch((error) => {
  // Do not print SDK request objects or environment values.
  console.error("Album artwork operation failed:", error.name, error.message);
  process.exitCode = 1;
});
