import type { musics, novels, comics, books, bookNovels, bookPurchaseLinks } from "@asobi/database/schema";
import type { LyricLine } from "@asobi/content-core/lyrics";

type Music = typeof musics.$inferSelect;
type Novel = typeof novels.$inferSelect;
type Book = typeof books.$inferSelect;
export type AdminBook = Book & {
  novels: (typeof bookNovels.$inferSelect & { novel: Pick<Novel, "id" | "title" | "musicId"> })[];
  purchaseLinks: typeof bookPurchaseLinks.$inferSelect | null;
};
export interface AdminDashboardData {
  musics: Music[];
  novels: (Novel & { music: Music; book: Book | null })[];
  comics: (typeof comics.$inferSelect & { music: Music })[];
  books: AdminBook[];
  lyricTracks: { musicId: number; sync: number; updatedAt: string; lineCount: number; lyricJson: LyricLine[] }[];
  bookOptions?: { id: number; name: string }[];
  novelOptions?: { id: number; title: string; musicId: number; bookId: number | null; musicTitle: string }[];
}
export type SelectedNode =
  | { type: "music"; id: number }
  | { type: "novel"; id: number }
  | { type: "comic"; id: number }
  | { type: "lyric"; id: number }
  | { type: "book"; id: number }
  | { type: "newMusic" }
  | { type: "newNovel"; musicId: number }
  | { type: "newComic"; musicId: number }
  | { type: "newLyric"; musicId: number }
  | { type: "newBook" };
