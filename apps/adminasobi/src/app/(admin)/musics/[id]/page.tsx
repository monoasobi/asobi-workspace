import { MusicDetail } from "@/components/MusicDetail";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/access";
import { getAdminMusics } from "@/server/queries/music";
import { getAdminDashboard } from "@/server/queries/content";
import { readLyrics } from "@/server/queries/lyrics";
import { contentSelection } from "@/components/content/routeSelection";
import { parseMusicId } from "@/lib/musicId";
export default async function MusicPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const [[music], data, lyric, query] = await Promise.all([
    getAdminMusics(id), getAdminDashboard(), readLyrics(id), searchParams,
  ]);
  if (!music) notFound();
  // Keep the editable lyric payload aligned with the revision returned by readLyrics.
  const track = data.lyricTracks.find(item => item.musicId === id);
  if (lyric && track) {
    track.sync = lyric.lyricTrack.sync;
    track.lyricJson = lyric.lyricTrack.lyricJson;
    track.lineCount = lyric.lyricTrack.lyricJson.length;
  }
  const node = contentSelection(query, data, session.role === "admin", id);
  return (
    <MusicDetail
      key={music.id}
      initialMusic={music}
      readOnly={session.role !== "admin"}
      contentData={data}
      contentNode={node}
      contentRevision={lyric?.revision}
      contentActive={query.tab === "content" || node !== null}
    />
  );
}
