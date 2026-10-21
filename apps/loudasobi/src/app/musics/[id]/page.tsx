import { notFound } from "next/navigation";
import { PublicMusicPage } from "@/components/layout/PublicMusicPage";
import { musicIdFromPath } from "@/lib/musicRoute";

export default async function MusicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const musicId = musicIdFromPath(`/musics/${id}`);
  if (musicId === null) notFound();
  return <PublicMusicPage musicId={musicId} />;
}
