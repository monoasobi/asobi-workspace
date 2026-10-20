export type AdminDashboardData = Awaited<
  ReturnType<typeof import("@/server/queries/content").getAdminDashboard>
>;
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
