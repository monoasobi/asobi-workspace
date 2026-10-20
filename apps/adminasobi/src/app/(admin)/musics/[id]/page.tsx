import { MusicDetail } from "@/components/MusicDetail";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/access";
import { getAdminMusics } from "@/server/queries/music";
import { parseMusicId } from "@/lib/musicId";
export default async function MusicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminSession();
  const id = parseMusicId((await params).id);
  if (id === null) notFound();
  const [music] = await getAdminMusics(id);
  if (!music) notFound();
  return (
    <MusicDetail
      key={music.id}
      initialMusic={music}
      readOnly={session.role !== "admin"}
    />
  );
}
