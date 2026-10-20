import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@asobi/database";
import { musics } from "@asobi/database/schema";
import { requireAdminWriteAccess } from "@/server/auth/access";
import { deleteR2Object, putR2Object } from "@asobi/storage";

export const saveAlbumArt = async (id: number, image: Uint8Array) => {
  await requireAdminWriteAccess();
  const db = getDb();
  const current = await db.query.musics.findFirst({
    where: and(eq(musics.id, id), isNull(musics.deletedAt)),
  });
  if (!current) return null;
  const key = `albumart/${id}/${randomUUID()}.webp`;
  await putR2Object(key, image, "image/webp");
  try {
    const [updated] = await db
      .update(musics)
      .set({ albumArtKey: key, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(musics.id, id),
          isNull(musics.deletedAt),
          current.albumArtKey === null
            ? isNull(musics.albumArtKey)
            : eq(musics.albumArtKey, current.albumArtKey),
        ),
      )
      .returning();
    if (!updated) throw new Error("곡이 변경되었습니다. 다시 시도해주세요.");
  } catch (error) {
    await deleteR2Object(key).catch(() =>
      console.error("Album art cleanup failed:", key),
    );
    throw error;
  }
  if (current.albumArtKey?.startsWith(`albumart/${id}/`)) {
    await deleteR2Object(current.albumArtKey).catch(() =>
      console.error("Previous album art cleanup failed:", current.albumArtKey),
    );
  }
  return key;
};
