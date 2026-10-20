import { z } from "zod";
import { authorizeWrite } from "@/server/auth/write";
import { privateHeaders } from "@/server/auth/request";
import { refreshPublicCatalog } from "@/server/refresh";
export async function POST(request: Request) {
  const denied = await authorizeWrite(request);
  if (denied) return denied;
  const body = z
    .object({ scope: z.enum(["shared", "loud"]) })
    .strict()
    .safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json(
      { error: "잘못된 갱신 대상입니다." },
      { status: 400, headers: privateHeaders },
    );
  const refresh = await refreshPublicCatalog(
    body.data.scope === "shared" ? ["monoasobi", "loudasobi"] : ["loudasobi"],
  );
  return Response.json(
    { ok: refresh.every((result) => result.ok), refresh },
    { headers: privateHeaders },
  );
}
