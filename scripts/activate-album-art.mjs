// Explicit artwork-only cutover. Default: read-only plan. Never deletes objects.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { getR2Object, putR2Object, getAlbumArtBucketName } from "@asobi/storage";
import { getAlbumArtUrl, isAlbumArtKey } from "@asobi/content-core/albumArt";

const requireDb = createRequire(new URL("../packages/database/package.json", import.meta.url));
const { createClient } = requireDb("@libsql/client");
const sharp = createRequire(new URL("../packages/storage/package.json", import.meta.url))("sharp");
const root = new URL("../", import.meta.url);
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const apply = process.argv.includes("--apply");
const manifest = JSON.parse(await readFile(new URL("assets/album-art/manifest.json", root), "utf8"));
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const privateBucket = process.env.R2_BUCKET_NAME;
const artworkBucket = getAlbumArtBucketName();
const delivery = { assetBaseUrl: process.env.NEXT_PUBLIC_ASSET_BASE_URL, transformImages: true };
const rows = async reader => (await reader.execute("SELECT * FROM musics WHERE deleted_at IS NULL ORDER BY id")).rows;
let legacyCookie;
let legacyOrigin;

async function legacyRequest(path, body) {
  return fetch(new URL(path, legacyOrigin), {
    method: "POST", redirect: "error",
    headers: { Origin: legacyOrigin, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
  });
}

async function invalidateLegacy() {
  // The deployed old app has no cache-only endpoint. Re-save the latest values
  // through its existing admin API to expire its own tag without changing fields.
  const row = (await rows(client))[0];
  const response = await fetch(new URL(`/api/admin/musics/${row.id}`, legacyOrigin), {
    method: "PUT", redirect: "error",
    headers: { Origin: legacyOrigin, Cookie: legacyCookie, "Content-Type": "application/json" },
    body: JSON.stringify({ title: row.title, korTitle: row.kor_title, enTitle: row.en_title,
      youtubeId: row.youtube_id ?? "", specialPath: row.special_path ?? "" }),
    signal: AbortSignal.timeout(30000),
  });
  assert(response.ok && (await response.json()).ok === true, "Legacy cache refresh failed");
  const after = (await rows(client)).find(item => item.id === row.id);
  for (const key of Object.keys(row).filter(key => key !== "updated_at"))
    assert(after[key] === row[key], "Legacy refresh changed music content");
}

async function verifyObject(key, bucket, bytes) {
  const object = await getR2Object(key, bucket);
  assert(object?.Body, "Prepared object missing");
  assert(object.ContentType === "image/webp", "Unexpected object type");
  assert(sha(await object.Body.transformToByteArray()) === sha(bytes), "Object checksum mismatch");
}

async function main() {
  assert(privateBucket && privateBucket !== artworkBucket, "Explicit separate buckets required");
  assert(process.env.NEXT_PUBLIC_ASSET_TRANSFORMS === "true", "Image transforms required");
  const before = await rows(client);
  assert(before.length === manifest.artworks.length, "Reconcile the current song list first");
  for (const art of manifest.artworks) {
    const row = before.find(row => row.id === art.musicId);
    assert(row && row.title === art.title, "Song identity changed");
    assert(row.album_art_key === art.observedKeyAtCollection || row.album_art_key === art.proposedKey,
      "Artwork changed since collection; reconcile before cutover");
    assert(isAlbumArtKey(art.proposedKey), "Invalid artwork key");
  }
  console.log(`${before.length} artwork links reconciled; ${apply ? "apply" : "plan only"}.`);
  if (!apply) return;
  legacyOrigin = new URL(process.env.LEGACY_MONOASOBI_URL).origin;
  assert(legacyOrigin.startsWith("https://") && process.env.LEGACY_MONOASOBI_ADMIN_PASSWORD,
    "Legacy cache access must be prepared before cutover");
  const login = await legacyRequest("/api/admin/auth/login", { password: process.env.LEGACY_MONOASOBI_ADMIN_PASSWORD });
  assert(login.ok, "Legacy admin login failed before cutover");
  legacyCookie = login.headers.get("set-cookie")?.split(";")[0];
  assert(legacyCookie, "Legacy session missing");

  for (let offset = 0; offset < manifest.artworks.length; offset += 4) {
    const results = await Promise.allSettled(manifest.artworks.slice(offset, offset + 4).map(async art => {
      const original = await readFile(new URL(`assets/album-art/${art.prepared}`, root));
      assert(sha(original) === art.preparedSha256, "Local artwork checksum changed");
      await verifyObject(art.proposedKey, artworkBucket, original);
      // The old deployment still proxies its private bucket. Give it a 200px
      // version under the new key until the new CDN-based deployment takes over.
      const compatibility = await sharp(original).resize(200, 200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      const existing = await getR2Object(art.proposedKey, privateBucket);
      if (existing?.Body) {
        assert(sha(await existing.Body.transformToByteArray()) === sha(compatibility), "Never overwrite an existing compatibility object");
      } else {
        await putR2Object(art.proposedKey, compatibility, "image/webp", privateBucket);
      }
      await verifyObject(art.proposedKey, privateBucket, compatibility);
      const response = await fetch(getAlbumArtUrl(art.proposedKey, delivery, 200), { signal: AbortSignal.timeout(30000) });
      assert(response.ok, "CDN 200px image unavailable");
      const dimensions = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
      assert(dimensions.width === 200 && dimensions.height === 200, "CDN must return 200px");
    }));
    const failed = results.find(result => result.status === "rejected");
    if (failed) throw failed.reason;
    console.log(`Prepared objects and 200px CDN verified: ${Math.min(offset + 4, before.length)}/${before.length}`);
  }

  const backup = new URL(`.backups/album-art-activation/${new Date().toISOString().replaceAll(":", "-")}/`, root);
  await mkdir(backup, { recursive: true });
  await writeFile(new URL("before.json", backup), JSON.stringify(before, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  const tx = await client.transaction("write");
  try {
    const current = await rows(tx);
    assert(JSON.stringify(current) === JSON.stringify(before), "Music changed during preparation; retry after reconciliation");
    const timestamp = new Date().toISOString();
    const changes = manifest.artworks.filter(art => before.find(row => row.id === art.musicId).album_art_key !== art.proposedKey);
    const results = await tx.batch(changes.map(art => {
      const row = before.find(row => row.id === art.musicId);
      return { sql: "UPDATE musics SET album_art_key=?, updated_at=? WHERE id=? AND album_art_key IS ? AND updated_at IS ? AND deleted_at IS NULL",
        args: [art.proposedKey, timestamp, row.id, row.album_art_key, row.updated_at] };
    }));
    assert(results.every(result => result.rowsAffected === 1), "Concurrent artwork update");
    await tx.commit();
    console.log(`Artwork links committed: ${changes.length}`);
  } catch (error) {
    await tx.rollback(); throw error;
  }
  try {
    await invalidateLegacy();
  } catch (error) {
    // Restore links atomically; retain prepared objects for a safe later retry.
    await client.batch(before.map(row => ({
      sql: "UPDATE musics SET album_art_key=? WHERE id=? AND album_art_key=?",
      args: [row.album_art_key, row.id, manifest.artworks.find(art => art.musicId === row.id).proposedKey],
    })), "write");
    throw error;
  }
  const after = await rows(client);
  for (const art of manifest.artworks) assert(after.find(row => row.id === art.musicId).album_art_key === art.proposedKey);
  await writeFile(new URL("after.json", backup), JSON.stringify(after, null, 2) + "\n", { mode: 0o600 });
  console.log("All artwork links verified; legacy cache refreshed; previous objects retained.");
}

try { await main(); }
catch (error) {
  console.error("Artwork cutover failed:", error instanceof assert.AssertionError ? error.message : error.name);
  process.exitCode = 1;
} finally { client.close(); }
