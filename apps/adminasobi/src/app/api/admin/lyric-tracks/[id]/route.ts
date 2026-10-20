import { z } from "zod";
import { deleteLyrics } from "@/server/mutations/lyrics";
import { contentWrite } from "@/server/contentRoutes";
import { ContentError } from "@/server/mutations/content";
import { parseMusicId } from "@/lib/musicId";
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const id = parseMusicId((await context.params).id);
  return contentWrite(
    request,
    z.object({ revision: z.string().regex(/^[a-f0-9]{64}$/) }),
    "lyricTrack",
    async (input) => {
      if (id === null) throw new ContentError(400, "잘못된 곡 ID입니다.");
      return deleteLyrics(id, input.revision);
    },
  );
}
