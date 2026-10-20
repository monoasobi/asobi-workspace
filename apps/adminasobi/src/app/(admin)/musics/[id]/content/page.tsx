import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/server/auth/access";
import { getAdminDashboard } from "@/server/queries/content";
import { readLyrics } from "@/server/queries/lyrics";
import { parseMusicId } from "@/lib/musicId";
import { contentSelection } from "@/components/content/routeSelection";
import { ContentWorkspace } from "@/components/content/ContentWorkspace";
export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session.authenticated) redirect("/login");
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const data = await getAdminDashboard();
  if (!data.musics.some((m) => m.id === id)) notFound();
  const node = contentSelection(
    await searchParams,
    data,
    session.role === "admin",
    id,
  );
  const lyric = node?.type === "lyric" ? await readLyrics(id) : null;
  return (
    <ContentWorkspace
      data={data}
      node={node}
      musicId={id}
      readOnly={session.role !== "admin"}
      revision={lyric?.revision}
    />
  );
}
