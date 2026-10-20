export { musicSchema, type MusicInput } from "@asobi/content-core/music";
export {
  novelSchema,
  comicSchema,
  bookSchema,
  type NovelInput,
  type ComicInput,
  type BookInput,
} from "@asobi/content-core/contentInput";
export {
  lyricLineSchema,
  lyricTrackSchema,
} from "@asobi/content-core/lyricTrackInput";
import type { lyricTrackSchema } from "@asobi/content-core/lyricTrackInput";
import type { z } from "zod";
export type LyricTrackInput = z.infer<typeof lyricTrackSchema>;
