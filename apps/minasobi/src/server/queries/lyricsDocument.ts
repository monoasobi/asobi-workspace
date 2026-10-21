import "server-only";
import { createHash } from "node:crypto";
import type { musics, lyricTracks } from "@asobi/database/schema";
import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";

type LyricsRow = Pick<typeof lyricTracks.$inferSelect, "musicId" | "sync" | "lyricJson" | "updatedAt"> & {
  music: Pick<typeof musics.$inferSelect, "id" | "title" | "korTitle" | "enTitle" | "youtubeId">;
};

export function createLyricsDocument(row: LyricsRow) {
  // Keep the same field order as readLyrics' SELECT for existing revision hashes.
  const snapshot = {
    music: {
      id: row.music.id,
      title: row.music.title,
      korTitle: row.music.korTitle,
      enTitle: row.music.enTitle,
      youtubeId: row.music.youtubeId,
    },
    musicId: row.musicId,
    sync: row.sync,
    lyricJson: row.lyricJson,
    updatedAt: row.updatedAt,
  };
  return {
    music: { ...snapshot.music, youtubeId: snapshot.music.youtubeId ?? undefined },
    lyricTrack: lyricTrackSchema.parse({
      musicId: row.musicId,
      sync: row.sync,
      lyricJson: row.lyricJson,
    }),
    revision: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"),
  };
}
