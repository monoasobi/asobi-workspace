import { refreshPublicCatalog } from "@/server/refresh";
import { authorizeWrite } from "@/server/auth/write";
import { musicSchema } from "@asobi/content-core/music";
import { updateMusic } from "@/server/mutations/music";
import { getAdminSession } from "@/server/auth/access";
import { privateHeaders } from "@/server/auth/request";
import { getAdminMusics } from "@/server/queries/music";
import { parseMusicId } from "@/lib/musicId";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession()).authenticated)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  const id = parseMusicId((await context.params).id);
  if (id === null)
    return Response.json(
      { error: "잘못된 곡 ID입니다." },
      { status: 400, headers: privateHeaders },
    );
  const [music] = await getAdminMusics(id);
  return music
    ? Response.json({ music }, { headers: privateHeaders })
    : Response.json(
        { error: "곡을 찾을 수 없습니다." },
        { status: 404, headers: privateHeaders },
      );
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;
  const id = parseMusicId((await context.params).id);
  if (id === null)
    return Response.json(
      { error: "잘못된 곡 ID입니다." },
      { status: 400, headers: privateHeaders },
    );
  const parsed = musicSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "곡 정보를 확인해 주세요.", issues: parsed.error.issues },
      { status: 400, headers: privateHeaders },
    );
  try {
    const music = await updateMusic(id, parsed.data);
    return music
      ? Response.json(
          {
            ok: true,
            music,
            refresh: await refreshPublicCatalog(["monoasobi", "loudasobi"]),
          },
          { headers: privateHeaders },
        )
      : Response.json(
          { error: "곡을 찾을 수 없습니다." },
          { status: 404, headers: privateHeaders },
        );
  } catch {
    return Response.json(
      { error: "곡 정보를 저장하지 못했습니다." },
      { status: 503, headers: privateHeaders },
    );
  }
}

import { contentDelete } from "@/server/contentRoutes";
import { deleteMusic } from "@/server/mutations/content";
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return contentDelete(
    request,
    (await context.params).id,
    "music",
    deleteMusic,
  );
}
