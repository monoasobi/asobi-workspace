import { contentDelete } from "@/server/contentRoutes";
import { restoreMusic } from "@/server/mutations/content";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return contentDelete(
    request,
    (await context.params).id,
    "music",
    restoreMusic,
  );
}
