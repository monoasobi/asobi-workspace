import "server-only";
import { linesSchema } from "@asobi/content-core/catalogLyrics";
import { and, asc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db";
import {
  musics,
  musicSettings,
  lyricTracks,
  callGuides,
} from "@/server/db/schema";
import { resolveLyricPresentation } from "@asobi/content-core/lyricPresentation";
import { parseGuide, resolveGuide } from "@asobi/content-core/callGuide";
import type { CatalogEntry } from "@/types/catalog";

// No shared MV fallback, static fallback, or cross-request cache.
export async function getPublicCatalog(): Promise<CatalogEntry[]> {
  const rows = await getDb()
    .select({
      id: musics.id,
      title: musics.title,
      korTitle: musics.korTitle,
      enTitle: musics.enTitle,
      albumArtKey: musics.albumArtKey,
      youtubeId: musicSettings.youtubeId,
      fanLightColor: musicSettings.fanLightColor,
      trackId: lyricTracks.musicId,
      sync: lyricTracks.sync,
      syncOffset: musicSettings.syncOffset,
      lyricJson: lyricTracks.lyricJson,
      guideJson: callGuides.guideJson,
    })
    .from(musics)
    .innerJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .leftJoin(lyricTracks, eq(musics.id, lyricTracks.musicId))
    .leftJoin(callGuides, eq(musics.id, callGuides.musicId))
    .where(and(isNull(musics.deletedAt), eq(musicSettings.publish, true)))
    .orderBy(asc(musics.id));
  return rows.map((row) => {
    const source = linesSchema.parse(row.lyricJson ?? []);
    const guide = parseGuide(row.guideJson);
    const presentation = resolveLyricPresentation(
      guide,
      source,
      (row.sync ?? 0) + row.syncOffset,
    );
    return {
      sections: resolveGuide(guide, source).sections,
      music: {
        id: row.id,
        title: row.title,
        korTitle: row.korTitle,
        enTitle: row.enTitle,
        albumArtKey: row.albumArtKey,
        youtubeId: z
          .string()
          .regex(/^[A-Za-z0-9_-]{11}$/)
          .parse(row.youtubeId),
        fanLightColor: row.fanLightColor ?? undefined,
      },
      track:
        row.trackId === null && row.guideJson === null
          ? undefined
          : {
              id: row.id,
              sync:
                z
                  .number()
                  .finite()
                  .parse(row.sync ?? 0) +
                z.number().finite().parse(row.syncOffset),
              lyric: presentation.lines,
              guides: presentation.guides,
              songGuide: guide.songGuide,
            },
    };
  });
}
