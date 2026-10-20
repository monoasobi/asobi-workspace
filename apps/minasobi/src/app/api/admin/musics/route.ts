import { getAdminSession } from "@/server/auth/access";
import { privateHeaders } from "@/server/auth/request";
import { getAdminMusics } from "@/server/queries/music";
export async function GET() {
  if (!(await getAdminSession()).authenticated)
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  return Response.json(
    { musics: await getAdminMusics() },
    { headers: privateHeaders },
  );
}

import { contentWrite } from "@/server/contentRoutes";
import { musicSchema } from "@asobi/content-core/music";
import { createMusic } from "@/server/mutations/content";
export function POST(request: Request) {
  return contentWrite(request, musicSchema, "music", createMusic, 201);
}
