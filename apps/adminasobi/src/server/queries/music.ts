import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { requireAdminSession } from "@/server/auth/access";
import { getDb } from "@asobi/database";
import {
  musics,
  loudasobiMusicSettings as musicSettings,
  lyricTracks,
  loudasobiCallGuides,
} from "@asobi/database/schema";
import type { AdminMusic } from "@/types/music";

export async function getAdminMusics(id?: number): Promise<AdminMusic[]> {
  await requireAdminSession();
  const rows = await getDb()
    .select({
      id: musics.id,
      title: musics.title,
      korTitle: musics.korTitle,
      enTitle: musics.enTitle,
      albumArtKey: musics.albumArtKey,
      commonYoutubeId: musics.youtubeId,
      specialPath: musics.specialPath,
      updatedAt: musics.updatedAt,
      guideUpdatedAt: loudasobiCallGuides.updatedAt,
      youtubeId: musicSettings.youtubeId,
      fanLightColor: musicSettings.fanLightColor,
      bpm: musicSettings.bpm,
      publish: musicSettings.publish,
      syncOffset: musicSettings.syncOffset,
      sourceSync: lyricTracks.sync,
      trackId: lyricTracks.musicId,
    })
    .from(musics)
    .leftJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .leftJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .leftJoin(loudasobiCallGuides, eq(musics.id, loudasobiCallGuides.musicId))
    .where(
      and(
        isNull(musics.deletedAt),
        id === undefined ? undefined : eq(musics.id, id),
      ),
    )
    .orderBy(asc(musics.id));
  return rows.map(({ trackId, ...row }) => ({
    ...row,
    publish: row.publish ?? false,
    syncOffset: row.syncOffset ?? 0,
    sourceSync: row.sourceSync ?? 0,
    hasLyrics: trackId !== null,
  }));
}
