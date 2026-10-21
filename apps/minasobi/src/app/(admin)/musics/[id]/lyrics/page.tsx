import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { parseMusicId } from "@/lib/musicId";
import { readLyrics } from "@/server/queries/lyrics";
import { LyricTimelineEditor } from "@/components/editors/lyric-timeline/LyricTimelineEditor";

export const metadata: Metadata = { title: "가사 편집" };

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
    <LyricTimelineEditor
      key={id}
      initial={initial}
      readOnly={session.role !== "admin"}
    />
  );
}
