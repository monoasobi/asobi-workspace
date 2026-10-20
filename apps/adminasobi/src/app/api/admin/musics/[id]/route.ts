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
