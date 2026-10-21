import { EditorSkeleton } from "@/components/loading/AdminSkeletons";
import { PendingSection } from "@/components/loading/PendingSection";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { parseMusicId } from "@/lib/musicId";
import { readLyrics } from "@/server/queries/lyrics";
import { LyricTimelineEditor } from "@/components/editors/lyric-timeline/LyricTimelineEditor";

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
    <PendingSection fallback={<EditorSkeleton />}>
    <LyricTimelineEditor
      key={id}
      initial={initial}
      readOnly={session.role !== "admin"}
    />
    </PendingSection>
  );
}
