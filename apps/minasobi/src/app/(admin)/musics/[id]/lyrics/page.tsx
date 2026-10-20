import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { parseMusicId } from "@/lib/musicId";
import { readLyrics } from "@/server/queries/lyrics";
import { LyricTimelineEditor } from "@/components/editors/lyric-timeline/LyricTimelineEditor";
import { EditorPage } from "@/components/editors/EditorPage";

export default async function LyricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const initial = await readLyrics(id);
  if (!initial) notFound();
  return (
    <EditorPage musicId={id} title={`${initial.music.korTitle} · 가사 편집`}>
      <LyricTimelineEditor
        key={id}
        initial={initial}
        readOnly={session.role !== "admin"}
      />
    </EditorPage>
  );
}
