import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { requireAdminWriteAccess } from "@/server/auth/access";
import { getDb } from "@asobi/database";
import {
  musics,
  loudasobiMusicSettings as musicSettings,
} from "@asobi/database/schema";
import { musicSettingsUpdateSchema } from "@/lib/musicSettingsInput";
import type { z } from "zod";

export async function saveMusicSettings(id: number, input: z.infer<typeof musicSettingsUpdateSchema>) {
  await requireAdminWriteAccess();
  const values = musicSettingsUpdateSchema.parse(input);
  return getDb().transaction(async (tx) => {
    const [music] = await tx
      .select({ id: musics.id })
      .from(musics)
      .where(and(eq(musics.id, id), isNull(musics.deletedAt)));
    if (!music) return null;
    const [saved] = await tx
      .insert(musicSettings)
      .values({ musicId: id, ...values, updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({
        target: musicSettings.musicId,
        set: { ...values, updatedAt: new Date().toISOString() },
      })
      .returning();
    return saved;
  });
}
