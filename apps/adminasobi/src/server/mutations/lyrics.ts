import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@asobi/database";
import {
  lyricTracks,
  musics,
  loudasobiCallGuides,
  loudasobiMusicSettings,
} from "@asobi/database/schema";
import { requireAdminWriteAccess } from "@/server/auth/access";
import { readLyrics } from "@/server/queries/lyrics";

import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import { resolveGuide, parseGuide } from "@asobi/content-core/callGuide";
import { resolveLyricPresentation } from "@asobi/content-core/lyricPresentation";
import type { z } from "zod";

// Preserve Mono's transactional update and stable IDs; add a fresh-source revision check.
export async function saveLyrics(
  id: number,
  revision: string,
  input: z.infer<typeof lyricTrackSchema>,
) {
  await requireAdminWriteAccess();
  return getDb().transaction(async (tx) => {
    const current = await readLyrics(id, tx);
    if (!current)
      return { status: 404, error: "가사 트랙이 없거나 곡이 삭제되었습니다." };
    if (current.revision !== revision)
      return {
        status: 409,
        error:
          "가사 또는 영상 정보가 다른 곳에서 변경되었습니다. 초안은 유지됩니다. 복사해 보관한 뒤 최신 자료를 불러와 주세요.",
      };
    const lines = input.lyricJson.map((line) => ({
      ...line,
      id: line.id ?? randomUUID(),
    }));
    await tx
      .update(lyricTracks)
      .set({
        sync: input.sync,
        lyricJson: lines,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(lyricTracks.musicId, id));
    const [call] = await tx
      .select({
        guide: loudasobiCallGuides.guideJson,
        offset: loudasobiMusicSettings.syncOffset,
      })
      .from(musics)
      .leftJoin(loudasobiCallGuides, eq(musics.id, loudasobiCallGuides.musicId))
      .leftJoin(
        loudasobiMusicSettings,
        eq(musics.id, loudasobiMusicSettings.musicId),
      )
      .where(eq(musics.id, id));
    let guideIssues: Record<string, string>;
    try {
      const guide = parseGuide(call?.guide);
      const effectiveSync = input.sync + (call?.offset ?? 0);
      // Mono's input still permits overlapping lines. Re-check call references
      // without importing Loud's stricter public-catalog input contract.
      const presentation = resolveLyricPresentation(
        guide,
        lines,
        effectiveSync,
      );
      guideIssues = {
        ...resolveGuide(guide, lines).issues,
        ...presentation.issues,
        ...presentation.warnings,
        ...(guide.cues.some((cue) => cue.start + effectiveSync < 0)
          ? { timing: "재생 시작 전 콜 블록을 확인해 주세요." }
          : {}),
      };
    } catch {
      // Existing malformed call data must not prevent saving a valid lyric source.
      guideIssues = { document: "콜 자료 형식과 가사 참조를 확인해 주세요." };
    }
    return { status: 200, document: await readLyrics(id, tx), guideIssues };
  });
}

import { ContentError } from "./content";
export async function deleteLyrics(id: number, revision: string) {
  await requireAdminWriteAccess();
  return getDb().transaction(async (tx) => {
    const current = await readLyrics(id, tx);
    if (!current) return null;
    if (current.revision !== revision)
      throw new ContentError(
        409,
        "가사가 변경되었습니다. 최신 자료를 확인해 주세요.",
      );
    const [deleted] = await tx
      .delete(lyricTracks)
      .where(eq(lyricTracks.musicId, id))
      .returning();
    return deleted;
  });
}
