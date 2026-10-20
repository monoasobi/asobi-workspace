import { novelSchema } from "@asobi/content-core/contentInput";
import { createNovel } from "@/server/mutations/content";
import { contentWrite } from "@/server/contentRoutes";
export function POST(request: Request) {
  return contentWrite(request, novelSchema, "novel", createNovel, 201);
}
