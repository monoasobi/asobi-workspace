import "server-only";
import { z } from "zod";
import { authorizeWrite } from "@/server/auth/write";
import { privateHeaders } from "@/server/auth/request";
import { parseMusicId } from "@/lib/musicId";
import { refreshPublicCatalog } from "@/server/refresh";
import { ContentError } from "@/server/mutations/content";

export const contentReply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: privateHeaders });
// Shared boundary for the migrated document routes; schemas/mutations retain their own contracts.
export async function contentWrite<T>(
  request: Request,
  schema: z.ZodType<T>,
  key: string,
  mutate: (input: T) => Promise<unknown>,
  status = 200,
) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;
  const text = await request.text();
  if (text.length > 2_000_000)
    return contentReply({ error: "입력 자료가 너무 큽니다." }, 413);
  const parsed = schema.safeParse(
    await Promise.resolve()
      .then(() => JSON.parse(text))
      .catch(() => null),
  );
  if (!parsed.success)
    return contentReply(
      { error: "입력값을 확인해 주세요.", issues: parsed.error.issues },
      400,
    );
  try {
    const result = await mutate(parsed.data);
    if (!result)
      return contentReply({ error: "자료를 찾을 수 없습니다." }, 404);
    return contentReply(
      {
        ok: true,
        [key]: result,
        refresh: await refreshPublicCatalog(["monoasobi", "loudasobi"]),
      },
      status,
    );
  } catch (error) {
    return contentReply(
      {
        error:
          error instanceof ContentError
            ? error.message
            : "저장하지 못했습니다. 입력 내용을 유지해 주세요.",
      },
      error instanceof ContentError ? error.status : 503,
    );
  }
}
export async function contentDelete(
  request: Request,
  rawId: string,
  key: string,
  remove: (id: number) => Promise<unknown>,
) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;
  const id = parseMusicId(rawId);
  if (id === null) return contentReply({ error: "잘못된 ID입니다." }, 400);
  try {
    const result = await remove(id);
    if (!result)
      return contentReply({ error: "자료를 찾을 수 없습니다." }, 404);
    return contentReply({
      ok: true,
      [key]: result,
      refresh: await refreshPublicCatalog(["monoasobi", "loudasobi"]),
    });
  } catch (error) {
    return contentReply(
      {
        error:
          error instanceof ContentError
            ? error.message
            : "삭제하지 못했습니다. 연결된 자료를 확인해 주세요.",
      },
      error instanceof ContentError ? error.status : 503,
    );
  }
}
