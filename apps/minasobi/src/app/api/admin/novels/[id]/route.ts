import { novelSchema } from "@asobi/content-core/contentInput";
import {
  updateNovel,
  deleteNovel,
  ContentError,
} from "@/server/mutations/content";
import { contentWrite, contentDelete } from "@/server/contentRoutes";
import { parseMusicId } from "@/lib/musicId";
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) {
  const id = parseMusicId((await context.params).id);
  return contentWrite(request, novelSchema, "novel", (input) => {
    if (id === null) throw new ContentError(400, "잘못된 ID입니다.");
    return updateNovel(id, input);
  });
}
export async function DELETE(request: Request, context: Context) {
  return contentDelete(
    request,
    (await context.params).id,
    "novel",
    deleteNovel,
  );
}
