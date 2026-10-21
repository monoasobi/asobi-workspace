import "server-only";
import { cache } from "react";
import { linesSchema } from "@asobi/content-core/catalogLyrics";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import {
  musics,
  loudasobiMusicSettings as musicSettings,
  lyricTracks,
  loudasobiCallGuides as callGuides,
} from "@asobi/database/schema";
import { resolveLyricPresentation } from "@asobi/content-core/lyricPresentation";
import { parseGuide, resolveGuide } from "@asobi/content-core/callGuide";
import type { CatalogEntry, SongListItem } from "@/types/catalog";

// React cache only deduplicates within a server render; there is no cross-request cache.
export const getPublicCatalog = cache(() => readPublicCatalog(getDb()));
export const getPublicMusicById = cache((id: number) =>
  readPublicMusicById(getDb(), id),
);

export async function readPublicCatalog(
  db: ReturnType<typeof getDb>,
): Promise<SongListItem[]> {
  const rows = await db
    .select({
      id: musics.id,
      title: musics.title,
      korTitle: musics.korTitle,
      enTitle: musics.enTitle,
      albumArtKey: musics.albumArtKey,
      youtubeId: musicSettings.youtubeId,
      fanLightColor: musicSettings.fanLightColor,
      hasLyrics:
        sql<boolean>`exists (select 1 from ${lyricTracks} where ${lyricTracks.musicId} = ${musics.id} and json_array_length(${lyricTracks.lyricJson}) > 0)`.mapWith(
          Boolean,
        ),
    })
    .from(musics)
    .innerJoin(musicSettings, eq(musics.id, musicSettings.musicId))
    .where(and(isNull(musics.deletedAt), eq(musicSettings.publish, true)))
    .orderBy(asc(musics.id));
  return rows.map(({ hasLyrics, ...music }) => ({
    music: {
      ...music,
      youtubeId: music.youtubeId ?? undefined,
      fanLightColor: music.fanLightColor ?? undefined,
    },
    hasLyrics,
  }));
}

export async function readPublicMusicById(
  db: ReturnType<typeof getDb>,
  id: number,
): Promise<CatalogEntry | null> {
  const rows = await db
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
    .where(
      and(
        eq(musics.id, id),
        isNull(musics.deletedAt),
        eq(musicSettings.publish, true),
      ),
    )
    .limit(1);
  const [row] = rows;
  if (!row) return null;
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
}
