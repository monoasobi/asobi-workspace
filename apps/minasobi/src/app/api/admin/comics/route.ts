import { comicSchema } from "@asobi/content-core/contentInput";
import { createComic } from "@/server/mutations/content";
import { contentWrite } from "@/server/contentRoutes";
export function POST(request: Request) {
  return contentWrite(request, comicSchema, "comic", createComic, 201);
}
