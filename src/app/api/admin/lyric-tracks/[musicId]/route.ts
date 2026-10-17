import {
  parseAdminPayload,
  parseNonNegativeId,
  requireAdminWriteAccess,
  revalidatePublicCatalog,
} from "@/app/api/admin/_utils";
import { deleteLyricTrack, updateLyricTrack, updateLyricEnglish } from "@/server/mutations/admin";
import { lyricTrackSchema, lyricEnglishSchema } from "@/server/schemas/admin.schema";
import { NextResponse } from "next/server";

interface AdminLyricTrackRouteContext {
  params: Promise<{ musicId: string }>;
}

export const PUT = async (
  request: Request,
  context: AdminLyricTrackRouteContext,
) => {
  const unauthorized = await requireAdminWriteAccess();
  if (unauthorized) return unauthorized;

  const { musicId: rawMusicId } = await context.params;
  const { id: musicId, response: idError } = parseNonNegativeId(
    rawMusicId,
    "music",
  );
  if (idError) return idError;

  const { data, response: payloadError } = await parseAdminPayload(
    request,
    lyricTrackSchema,
    "lyricTrack",
  );
  if (payloadError) return payloadError;

  const lyricTrack = await updateLyricTrack(musicId, data);
  if (!lyricTrack) {
    return NextResponse.json(
      { error: "Lyric track not found" },
      { status: 404 },
    );
  }

  revalidatePublicCatalog();

  return NextResponse.json({ ok: true, lyricTrack });
};

export const DELETE = async (
  _request: Request,
  context: AdminLyricTrackRouteContext,
) => {
  const unauthorized = await requireAdminWriteAccess();
  if (unauthorized) return unauthorized;

  const { musicId: rawMusicId } = await context.params;
  const { id: musicId, response: idError } = parseNonNegativeId(
    rawMusicId,
    "music",
  );
  if (idError) return idError;

  const lyricTrack = await deleteLyricTrack(musicId);
  if (!lyricTrack) {
    return NextResponse.json(
      { error: "Lyric track not found" },
      { status: 404 },
    );
  }

  revalidatePublicCatalog();

  return NextResponse.json({ ok: true, lyricTrack });
};

export const PATCH = async (request: Request, context: AdminLyricTrackRouteContext) => {
  const unauthorized = await requireAdminWriteAccess();
  if (unauthorized) return unauthorized;
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { musicId: rawMusicId } = await context.params;
  const { id: musicId, response: idError } = parseNonNegativeId(rawMusicId, "music");
  if (idError) return idError;
  const { data, response: payloadError } = await parseAdminPayload(request, lyricEnglishSchema, "English lyrics");
  if (payloadError) return payloadError;
  const result = await updateLyricEnglish(musicId, data);
  if (result.status === "missing") return NextResponse.json({ error: "가사 트랙이 없습니다." }, { status: 404 });
  if (result.status === "conflict") return NextResponse.json({ error: "가사가 다른 곳에서 변경되었습니다. 새로고침 후 다시 편집해 주세요." }, { status: 409 });
  revalidatePublicCatalog();
  return NextResponse.json({ ok: true, updatedAt: result.lyricTrack.updatedAt });
};
