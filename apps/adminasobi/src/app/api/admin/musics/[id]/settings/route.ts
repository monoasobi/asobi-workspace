import { refreshPublicCatalog } from "@/server/refresh";
import { authorizeWrite } from "@/server/auth/write";
import { privateHeaders } from "@/server/auth/request";
import { parseMusicId } from "@/lib/musicId";
import { musicSettingsUpdateSchema } from "@/lib/musicSettingsInput";
import { saveMusicSettings } from "@/server/mutations/musicSettings";
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
  const parsed = musicSettingsUpdateSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return Response.json(
      {
        error:
          "콜 설정을 확인해 주세요. 전용 YouTube ID·BPM·싱크 보정 범위를 확인해 주세요.",
      },
      { status: 400, headers: privateHeaders },
    );
  try {
    const settings = await saveMusicSettings(id, parsed.data);
    return settings
      ? Response.json(
          {
            ok: true,
            settings,
            refresh: await refreshPublicCatalog(["loudasobi"]),
          },
          { headers: privateHeaders },
        )
      : Response.json(
          { error: "곡을 찾을 수 없습니다." },
          { status: 404, headers: privateHeaders },
        );
  } catch {
    return Response.json(
      { error: "콜 설정을 저장하지 못했습니다." },
      { status: 503, headers: privateHeaders },
    );
  }
}
