import { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import { createLyricTrack } from "@/server/mutations/content";
import { contentWrite } from "@/server/contentRoutes";
export function POST(request: Request) {
  return contentWrite(
    request,
    lyricTrackSchema,
    "lyricTrack",
    createLyricTrack,
    201,
  );
}
