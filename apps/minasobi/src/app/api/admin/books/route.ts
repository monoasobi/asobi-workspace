import { bookSchema } from "@asobi/content-core/contentInput";
import { createBook } from "@/server/mutations/content";
import { contentWrite } from "@/server/contentRoutes";
export function POST(request: Request) {
  return contentWrite(request, bookSchema, "book", createBook, 201);
}
