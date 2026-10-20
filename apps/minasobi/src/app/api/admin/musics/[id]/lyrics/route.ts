import { z } from "zod";
import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import { getAdminSession } from "@/server/auth/access";
import { authorizeWrite } from "@/server/auth/write";
import { privateHeaders } from "@/server/auth/request";
import { parseMusicId } from "@/lib/musicId";
import { readLyrics } from "@/server/queries/lyrics";
import { saveLyrics } from "@/server/mutations/lyrics";
import { refreshPublicCatalog } from "@/server/refresh";

const schema = z.object({
  revision: z.string().regex(/^[a-f0-9]{64}$/),
  lyricTrack: lyricTrackSchema,
});
const reply = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: privateHeaders });
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) {
  if (!(await getAdminSession()).authenticated)
    return reply({ error: "로그인이 필요합니다." }, 401);
  const id = parseMusicId((await context.params).id);
  if (id === null) return reply({ error: "잘못된 곡 ID입니다." }, 400);
  try {
    const document = await readLyrics(id);
    return document
      ? reply({ document })
      : reply({ error: "가사 트랙을 찾을 수 없습니다." }, 404);
  } catch {
    return reply({ error: "가사를 불러오지 못했습니다." }, 503);
  }
}
export async function PUT(request: Request, context: Context) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;
  const id = parseMusicId((await context.params).id);
  if (id === null) return reply({ error: "잘못된 곡 ID입니다." }, 400);
  const text = await request.text();
  if (text.length > 2_000_000)
    return reply({ error: "가사 자료가 너무 큽니다." }, 413);
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return reply({ error: "잘못된 JSON입니다." }, 400);
  }
  const input = schema.safeParse(json);
  if (!input.success || input.data.lyricTrack.musicId !== id)
    return reply({ error: "가사 입력과 곡 ID를 확인해 주세요." }, 400);
  try {
    const result = await saveLyrics(
      id,
      input.data.revision,
      input.data.lyricTrack,
    );
    const refresh =
      result.status === 200
        ? await refreshPublicCatalog(["monoasobi", "loudasobi"])
        : [];
    return reply({ ...result, refresh }, result.status);
  } catch {
    return reply({ error: "저장하지 못했습니다. 초안은 유지됩니다." }, 503);
  }
}
