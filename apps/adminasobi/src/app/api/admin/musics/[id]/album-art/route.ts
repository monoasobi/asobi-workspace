import { refreshPublicCatalog } from "@/server/refresh";
import { authorizeWrite } from "@/server/auth/write";
import { parseMusicId } from "@/lib/musicId";
import { privateHeaders } from "@/server/auth/request";
import { normalizeAlbumArt } from "@asobi/storage/albumArt";
import { saveAlbumArt } from "@/server/mutations/albumArt";

export const PUT = async (
  request: Request,
  context: { params: Promise<{ id: string }> },
) => {
  const unauthorized = await authorizeWrite(request);
  if (unauthorized) return unauthorized;
  const id = parseMusicId((await context.params).id);
  if (id === null)
    return Response.json(
      { error: "잘못된 곡 ID입니다." },
      { status: 400, headers: privateHeaders },
    );
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json(
      { error: "이미지를 선택해주세요." },
      { status: 400, headers: privateHeaders },
    );
  let image: Uint8Array;
  try {
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    image = await normalizeAlbumArt(Buffer.concat(chunks), { maxBytes: Infinity });
  } catch {
    return Response.json(
      { error: "올바른 JPG, PNG, WebP 정지 이미지를 선택해주세요." },
      { status: 400, headers: privateHeaders },
    );
  }
  try {
    const key = await saveAlbumArt(id, image);
    if (!key)
      return Response.json(
        { error: "곡을 찾을 수 없습니다." },
        { status: 404, headers: privateHeaders },
      );
    return Response.json(
      {
        ok: true,
        albumArtKey: key,
        refresh: await refreshPublicCatalog(["monoasobi", "loudasobi"]),
      },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: "앨범아트 저장에 실패했습니다. 다시 시도해주세요." },
      { status: 500, headers: privateHeaders },
    );
  }
};
